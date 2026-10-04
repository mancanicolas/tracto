import { z } from "zod";
import { todayIso } from "@/lib/dates";
import { formatMoney, normalizeDni, parseMoneyToCents } from "@/lib/format";
import { LABEL_COLORS } from "@/lib/labels";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const requiredFutureDate = z
  .string()
  .regex(ISO_DATE, "Elegí una fecha.")
  .refine((value) => value >= todayIso(), "Elegí una fecha desde hoy.");

const positiveMoney = z
  .string()
  .trim()
  .min(1, "Ingresá un monto.")
  .refine((value) => parseMoneyToCents(value) !== null, "Ingresá un monto válido, por ejemplo 1.500,00.")
  .refine((value) => (parseMoneyToCents(value) ?? 0) > 0, "El monto tiene que ser mayor a cero.");

const optionalMoney = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || parseMoneyToCents(value) !== null,
    "Ingresá un monto válido, por ejemplo 1.500,00.",
  );

const entityFields = {
  entidad: z.string(),
  cartera: z.string(),
};

export function newCaseSchema(existingDnis: string[]) {
  return z.object({
    dni: z
      .string()
      .trim()
      .min(1, "Ingresá el DNI.")
      .refine((value) => /^\d{7,8}$/.test(normalizeDni(value)), "El DNI tiene 7 u 8 dígitos.")
      .refine((value) => !existingDnis.includes(normalizeDni(value)), "Ya existe un caso con ese DNI."),
    nombre: z.string().trim().max(80, "Máximo 80 caracteres."),
    monto: optionalMoney,
    ...entityFields,
  });
}

export const caseEditSchema = z.object({
    ...entityFields,
    nombre: z.string().trim().max(80, "Máximo 80 caracteres."),
    telefono: z
      .string()
      .trim()
      .refine(
        (value) => value === "" || /^\d{8,13}$/.test(value.replace(/[\s()+-]/g, "")),
        "Ingresá un teléfono válido, con código de área.",
      ),
    mail: z
      .string()
      .trim()
      .refine((value) => value === "" || z.email().safeParse(value).success, "Ingresá un email válido."),
    monto: optionalMoney,
});

export const convenioSchema = z.object({
  nombre: z.string().trim().min(1, "Ingresá el nombre y apellido del titular.").max(80, "Máximo 80 caracteres."),
  cartera: z.string().trim().min(1, "Ingresá o elegí la cartera.").max(60, "Máximo 60 caracteres."),
});

export const noteSchema = z.object({
  texto: z.string().trim().min(1, "Escribí la nota."),
});

export const scheduleSchema = z.object({
  fecha: requiredFutureDate,
  motivo: z.string().trim().min(1, "Indicá el motivo.").max(120, "Máximo 120 caracteres."),
});

const installmentCount = z
  .string()
  .trim()
  .regex(/^\d+$/, "Ingresá un número entero.")
  .refine((value) => Number(value) >= 1 && Number(value) <= 60, "Entre 1 y 60 cuotas.");

interface AgreementFormValues {
  tipo: "cuotas" | "parcial";
  cuotas: string;
  monto_cuota: string;
  primer_vencimiento: string;
  tiene_anticipo: boolean;
  anticipo_fecha: string;
  anticipo_monto: string;
  monto_parcial: string;
  fecha_parcial: string;
}

function addIssues<T extends string>(
  ctx: z.RefinementCtx,
  checks: [T, z.ZodType, string][],
  values: Record<T, unknown>,
): void {
  for (const [field, schema, message] of checks) {
    const result = schema.safeParse(values[field]);
    if (!result.success) ctx.addIssue({ code: "custom", path: [field], message: result.error.issues[0]?.message ?? message });
  }
}

export function agreementSchema(requiresProduct: boolean, balance: number | undefined) {
  return z
    .object({
      tipo: z.enum(["cuotas", "parcial"]),
      producto: z.string(),
      cuotas: z.string(),
      monto_cuota: z.string(),
      primer_vencimiento: z.string(),
      tiene_anticipo: z.boolean(),
      anticipo_fecha: z.string(),
      anticipo_monto: z.string(),
      monto_parcial: z.string(),
      fecha_parcial: z.string(),
    })
    .superRefine((values, ctx) => {
      if (requiresProduct && !values.producto) {
        ctx.addIssue({ code: "custom", path: ["producto"], message: "Elegí el producto." });
      }
      if (values.tipo === "parcial") {
        validatePartialPayment(values, balance, ctx);
        return;
      }
      addIssues(
        ctx,
        [
          ["cuotas", installmentCount, "Ingresá la cantidad de cuotas."],
          ["monto_cuota", positiveMoney, "Ingresá un monto válido."],
          ["primer_vencimiento", requiredFutureDate, "Elegí una fecha desde hoy."],
        ],
        values,
      );
      validateDownPayment(values, ctx);
    });
}

function validatePartialPayment(values: AgreementFormValues, balance: number | undefined, ctx: z.RefinementCtx): void {
  addIssues(
    ctx,
    [
      ["monto_parcial", positiveMoney, "Ingresá un monto válido."],
      ["fecha_parcial", requiredFutureDate, "Elegí una fecha desde hoy."],
    ],
    values,
  );
  const cents = parseMoneyToCents(values.monto_parcial);
  if (balance !== undefined && cents !== null && cents >= balance) {
    ctx.addIssue({
      code: "custom",
      path: ["monto_parcial"],
      message: `Tiene que ser menor a la deuda total de ${formatMoney(balance)}.`,
    });
  }
}

function validateDownPayment(values: AgreementFormValues, ctx: z.RefinementCtx): void {
  if (!values.tiene_anticipo) return;
  if (!requiredFutureDate.safeParse(values.anticipo_fecha).success) {
    ctx.addIssue({ code: "custom", path: ["anticipo_fecha"], message: "Elegí una fecha desde hoy." });
  } else if (
    requiredFutureDate.safeParse(values.primer_vencimiento).success &&
    values.anticipo_fecha >= values.primer_vencimiento
  ) {
    ctx.addIssue({
      code: "custom",
      path: ["anticipo_fecha"],
      message: "Tiene que ser anterior a la fecha de la primera cuota.",
    });
  }
  if (!positiveMoney.safeParse(values.anticipo_monto).success) {
    ctx.addIssue({ code: "custom", path: ["anticipo_monto"], message: "Ingresá un monto válido." });
  }
}

export function labelSchema(existingNames: string[]) {
  return z.object({
    nombre: z
      .string()
      .trim()
      .min(1, "Ingresá un nombre.")
      .max(24, "Máximo 24 caracteres.")
      .refine(
        (value) => !existingNames.some((name) => name.toLowerCase() === value.toLowerCase()),
        "Ya existe una etiqueta con ese nombre.",
      ),
    color: z.enum(LABEL_COLORS),
  });
}

export type CaseEditValues = z.infer<typeof caseEditSchema>;
export type NewCaseValues = z.infer<ReturnType<typeof newCaseSchema>>;
export type ConvenioValues = z.infer<typeof convenioSchema>;
export type NoteValues = z.infer<typeof noteSchema>;
export type ScheduleValues = z.infer<typeof scheduleSchema>;
export type AgreementValues = z.infer<ReturnType<typeof agreementSchema>>;
export type LabelValues = z.infer<ReturnType<typeof labelSchema>>;
