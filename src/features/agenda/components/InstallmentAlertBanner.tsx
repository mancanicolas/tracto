import { BellRing, Siren, type LucideIcon } from "lucide-react";
import { installmentLabel } from "@/lib/agreements";
import { cn } from "@/lib/cn";
import { formatIsoDate, formatIsoRelativeDay } from "@/lib/dates";
import { formatMoney } from "@/lib/format";
import type { InstallmentAlert, InstallmentAlertKind } from "@/lib/installmentAlert";

interface AlertMeta {
  label: string;
  icon: LucideIcon;
  classes: string;
}

const ALERT_META: Record<InstallmentAlertKind, AlertMeta> = {
  recordatorio: {
    label: "Enviar recordatorio",
    icon: BellRing,
    classes: "bg-accent-2-subtle text-accent-2 border-accent-2-border",
  },
  reclamo: {
    label: "Pedir pago urgente",
    icon: Siren,
    classes: "bg-danger-subtle text-danger border-danger-border",
  },
};

interface InstallmentAlertBannerProps {
  alert: InstallmentAlert;
}

export function InstallmentAlertBanner({ alert }: InstallmentAlertBannerProps) {
  const { label, icon: Icon, classes } = ALERT_META[alert.kind];
  const { installment } = alert;
  return (
    <section
      aria-label={label}
      className={cn("flex items-center justify-between gap-3 rounded-sm border px-2.5 py-2", classes)}
    >
      <div className="flex min-w-0 items-center gap-2">
        <Icon className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
        <span className="text-[13px] leading-5 font-semibold">{label}</span>
      </div>
      <p className="min-w-0 truncate text-right text-xs leading-4 text-fg-secondary">
        {installmentLabel(installment)} · <span className="font-mono tabular-nums">{formatMoney(installment.monto)}</span>{" "}
        · vence <span className="font-mono tabular-nums">{formatIsoDate(installment.fecha)}</span> (
        {formatIsoRelativeDay(installment.fecha)})
      </p>
    </section>
  );
}
