import { CheckCheck, CircleCheck, Handshake, type LucideIcon } from "lucide-react";
import { todayIso } from "./dates";
import type { Case } from "./mock";

export type AccountStatus = "pago" | "acuerdo" | "acuerdo colchon" | "cancelado";

export type StatusTone = "success" | "info" | "neutral";

export interface StatusMeta {
  tone: StatusTone;
  icon: LucideIcon;
  label: string;
}

export const STATUS: Record<AccountStatus, StatusMeta> = {
  pago: { tone: "success", icon: CircleCheck, label: "Pago" },
  acuerdo: { tone: "info", icon: Handshake, label: "Acuerdo" },
  "acuerdo colchon": { tone: "info", icon: Handshake, label: "Acuerdo colchón" },
  cancelado: { tone: "neutral", icon: CheckCheck, label: "Cancelado" },
};

export const TONE_CLASSES: Record<StatusTone, string> = {
  success: "bg-success-subtle text-success border border-success-border",
  info: "bg-info-subtle text-info border border-info-border",
  neutral: "bg-neutral-subtle text-neutral border border-neutral/30",
};

export function resolveCaseStatus(account: Pick<Case, "acuerdo">, today: string = todayIso()): AccountStatus | null {
  const installments = account.acuerdo?.cuotas;
  if (!installments || installments.length === 0) return null;
  if (installments.every((installment) => installment.pagada)) return "cancelado";

  const currentMonth = today.slice(0, 7);
  const paid = installments.filter((installment) => installment.pagada);
  const paidThisMonth = paid.some((installment) => installment.pagada_fecha?.slice(0, 7) === currentMonth);
  if (paidThisMonth) return "pago";
  return paid.length > 0 ? "acuerdo colchon" : "acuerdo";
}
