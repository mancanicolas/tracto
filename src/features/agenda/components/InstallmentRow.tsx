import { Check, Circle, CircleCheck, Plus } from "lucide-react";
import { installmentLabel } from "@/lib/agreements";
import { cn } from "@/lib/cn";
import { formatIsoDate } from "@/lib/dates";
import { formatMoney } from "@/lib/format";
import type { Installment } from "@/lib/mock";

interface InstallmentRowProps {
  installment: Installment;
  onTogglePaid: () => void;
  onToggleStats: () => void;
}

export function InstallmentRow({ installment, onTogglePaid, onToggleStats }: InstallmentRowProps) {
  const label = installmentLabel(installment);
  return (
    <li className="flex h-8 items-center gap-2 px-2.5 text-[13px]">
      <span className="min-w-0 flex-1 truncate text-fg-secondary">{label}</span>
      <span className="font-mono text-xs tabular-nums text-fg-muted">Vence {formatIsoDate(installment.fecha)}</span>
      <span className="font-mono tabular-nums text-fg">{formatMoney(installment.monto)}</span>
      <button
        type="button"
        aria-pressed={installment.pagada}
        aria-label={`${label}: ${installment.pagada ? "pagada" : "pendiente"}`}
        onClick={onTogglePaid}
        className={cn(
          "inline-flex h-6 w-24 items-center justify-end gap-1 rounded-sm px-1.5 text-xs font-medium transition-colors duration-100 hover:bg-row-hover motion-reduce:transition-none",
          installment.pagada ? "text-success" : "text-fg-muted",
        )}
      >
        {installment.pagada ? (
          <CircleCheck className="size-3.5" strokeWidth={1.75} aria-hidden />
        ) : (
          <Circle className="size-3.5" strokeWidth={1.75} aria-hidden />
        )}
        {installment.pagada ? "Pagada" : "Pendiente"}
      </button>
      <button
        type="button"
        aria-pressed={installment.countedInStats}
        aria-label={`${label}: ${installment.countedInStats ? "sumada a las métricas del mes" : "no sumada a las métricas del mes"}`}
        title={installment.countedInStats ? "Sumada a las métricas del mes" : "Sumar a las métricas del mes"}
        onClick={onToggleStats}
        className={cn(
          "inline-flex size-6 shrink-0 items-center justify-center rounded-sm border transition-colors duration-100 motion-reduce:transition-none",
          installment.countedInStats
            ? "border-accent-border bg-accent-subtle text-accent"
            : "border-line text-fg-muted hover:border-line-strong hover:text-fg",
        )}
      >
        {installment.countedInStats ? (
          <Check className="size-3.5" strokeWidth={2} aria-hidden />
        ) : (
          <Plus className="size-3.5" strokeWidth={1.75} aria-hidden />
        )}
      </button>
    </li>
  );
}
