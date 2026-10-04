import {
  CalendarClock,
  CalendarX,
  Circle,
  CircleCheck,
  CircleDashed,
  Clock,
  PhoneMissed,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";

export type AccountStatus =
  | "paid"
  | "partial"
  | "promise_due"
  | "promise_broken"
  | "high_delinquency"
  | "call_failed"
  | "follow_up"
  | "no_action";

export type StatusTone = "success" | "warning" | "danger" | "info" | "neutral";

export interface StatusMeta {
  tone: StatusTone;
  icon: LucideIcon;
  label: string;
}

export const STATUS: Record<AccountStatus, StatusMeta> = {
  paid: { tone: "success", icon: CircleCheck, label: "Pagado" },
  partial: { tone: "success", icon: CircleDashed, label: "Pago parcial" },
  promise_due: { tone: "warning", icon: Clock, label: "Promesa vence {x}" },
  promise_broken: { tone: "danger", icon: CalendarX, label: "Promesa incumplida" },
  high_delinquency: { tone: "danger", icon: TriangleAlert, label: "Mora {x} días" },
  call_failed: { tone: "danger", icon: PhoneMissed, label: "No contesta" },
  follow_up: { tone: "info", icon: CalendarClock, label: "Seguimiento {x}" },
  no_action: { tone: "neutral", icon: Circle, label: "Sin gestión" },
};

export const TONE_CLASSES: Record<StatusTone, string> = {
  success: "bg-success-subtle text-success border border-success-border",
  warning: "bg-warning-subtle text-warning border border-warning-border",
  danger: "bg-danger-subtle text-danger border border-danger-border",
  info: "bg-info-subtle text-info border border-info-border",
  neutral: "bg-neutral-subtle text-neutral border border-neutral/30",
};

export function statusLabel(status: AccountStatus, param?: string | number): string {
  return STATUS[status].label.replace("{x}", param === undefined ? "" : String(param)).trim();
}
