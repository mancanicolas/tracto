import { z } from "zod";
import { todayIso } from "@/lib/dates";
import { formatMoney, normalizeDni, parseMoneyToCents } from "@/lib/format";

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

export function newCaseSchema(existingDnis: string[]) {
  return z.object({
    dni: z
      .string()
      .trim()
      .min(1, "Ingresá el DNI.")
      .refine((value) => /^\d{7,8}$/.test(normalizeDni(value)), "El DNI tiene 7 u 8 dígitos.")
      .refine((value) => !existingDnis.includes(normalizeDni(value)), "Ya existe un caso con ese DNI."),
  });
}

export const noteSchema = z.object({
  texto: z.string().trim().min(1, "Escribí la nota."),
});

export const scheduleSchema = z.object({
  fecha: requiredFutureDate,
  motivo: z.string().trim().min(1, "Indicá el motivo.").max(120, "Máximo 120 caracteres."),
});

export const planSchema = z
  .object({
    cuotas: z
      .string()
      .trim()
      .regex(/^\d+$/, "Ingresá un número entero.")
      .refine((value) => Number(value) >= 1 && Number(value) <= 60, "Entre 1 y 60 cuotas."),
    monto_cuota: positiveMoney,
    tiene_anticipo: z.boolean(),
    anticipo_fecha: z.string(),
    anticipo_monto: z.string(),
  })
  .superRefine((values, ctx) => {
    if (!values.tiene_anticipo) return;
    if (!requiredFutureDate.safeParse(values.anticipo_fecha).success) {
      ctx.addIssue({ code: "custom", path: ["anticipo_fecha"], message: "Elegí una fecha desde hoy." });
    }
    if (!positiveMoney.safeParse(values.anticipo_monto).success) {
      ctx.addIssue({ code: "custom", path: ["anticipo_monto"], message: "Ingresá un monto válido." });
    }
  });

export function partialSchema(balance: number | undefined) {
  return z.object({
    fecha: requiredFutureDate,
    monto: positiveMoney.refine(
      (value) => balance === undefined || (parseMoneyToCents(value) ?? 0) < balance,
      balance === undefined ? "" : `Tiene que ser menor al saldo de ${formatMoney(balance)}.`,
    ),
  });
}

export type NoteValues = z.infer<typeof noteSchema>;
export type ScheduleValues = z.infer<typeof scheduleSchema>;
export type PlanValues = z.infer<typeof planSchema>;
export type PartialValues = z.infer<ReturnType<typeof partialSchema>>;
