import { z } from "zod";
import { todayIso } from "@/lib/dates";
import { normalizeDni, parseMoneyToCents } from "@/lib/format";
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

export const noteSchema = z.object({
  texto: z.string().trim().min(1, "Escribí la nota."),
});

export const scheduleSchema = z.object({
  fecha: requiredFutureDate,
  motivo: z.string().trim().min(1, "Indicá el motivo.").max(120, "Máximo 120 caracteres."),
});

export function planSchema(requiresProduct: boolean) {
  return z
    .object({
      cuotas: z
        .string()
        .trim()
        .regex(/^\d+$/, "Ingresá un número entero.")
        .refine((value) => Number(value) >= 1 && Number(value) <= 60, "Entre 1 y 60 cuotas."),
      monto_cuota: positiveMoney,
      primer_vencimiento: requiredFutureDate,
      producto: z.string(),
      tiene_anticipo: z.boolean(),
      anticipo_fecha: z.string(),
      anticipo_monto: z.string(),
    })
    .superRefine((values, ctx) => {
      if (requiresProduct && !values.producto) {
        ctx.addIssue({ code: "custom", path: ["producto"], message: "Elegí el producto." });
      }
      validateDownPayment(values, ctx);
    });
}

function validateDownPayment(
  values: { tiene_anticipo: boolean; anticipo_fecha: string; anticipo_monto: string; primer_vencimiento: string },
  ctx: z.RefinementCtx,
): void {
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
export type NoteValues = z.infer<typeof noteSchema>;
export type ScheduleValues = z.infer<typeof scheduleSchema>;
export type PlanValues = z.infer<ReturnType<typeof planSchema>>;
export type LabelValues = z.infer<ReturnType<typeof labelSchema>>;
