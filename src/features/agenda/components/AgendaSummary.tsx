import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatIsoDate, formatIsoRelativeDay } from "@/lib/dates";
import type { Case } from "@/lib/mock";

interface AgendaSummaryProps {
  account: Case;
  onResolve: () => void;
}

export function AgendaSummary({ account, onResolve }: AgendaSummaryProps) {
  const { agendado_para: date, agendado_motivo: reason, agendado_resuelto: isResolved } = account;
  if (!date) return null;

  return (
    <section
      aria-label="Seguimiento agendado"
      className="flex items-start justify-between gap-3 rounded-sm border border-line bg-raised px-2.5 py-2"
    >
      <dl className="grid min-w-0 grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-[13px] leading-5">
        <dt className="text-fg-muted">Para</dt>
        <dd className="text-fg">
          <span className="font-mono tabular-nums">{formatIsoDate(date)}</span>
          <span className="text-fg-muted"> · {formatIsoRelativeDay(date)}</span>
        </dd>
        <dt className="text-fg-muted">Motivo</dt>
        <dd className="min-w-0 text-fg">{reason || "Sin info"}</dd>
      </dl>
      {isResolved ? (
        <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-success">
          <Check className="size-3.5" strokeWidth={1.75} aria-hidden />
          Resuelto
        </span>
      ) : (
        <Button size="small" className="shrink-0" onClick={onResolve}>
          <Check className="size-3.5" strokeWidth={1.75} aria-hidden />
          Marcar resuelto
        </Button>
      )}
    </section>
  );
}
