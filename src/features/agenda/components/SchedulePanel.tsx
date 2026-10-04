import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatIsoDate, formatIsoRelativeDay } from "@/lib/dates";
import type { Case } from "@/lib/mock";
import { ScheduleForm } from "./ScheduleForm";

interface SchedulePanelProps {
  account: Case;
  onSave: (fecha: string, motivo: string) => void;
  onResolve: () => void;
}

export function SchedulePanel({ account, onSave, onResolve }: SchedulePanelProps) {
  const { agendado_para: date, agendado_motivo: reason, agendado_resuelto: isResolved } = account;

  return (
    <div className="flex flex-col gap-3">
      {date ? (
        <div className="flex flex-col gap-2 rounded-sm border border-line bg-raised p-2.5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm leading-5 font-semibold text-fg">Seguimiento agendado</h3>
            {isResolved ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
                <Check className="size-3.5" strokeWidth={1.75} aria-hidden />
                Resuelto
              </span>
            ) : (
              <Button size="small" onClick={onResolve}>
                <Check className="size-3.5" strokeWidth={1.75} aria-hidden />
                Marcar resuelto
              </Button>
            )}
          </div>
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[13px] leading-5">
            <dt className="text-fg-muted">Para</dt>
            <dd className="text-fg">
              <span className="font-mono tabular-nums">{formatIsoDate(date)}</span>
              <span className="text-fg-muted"> · {formatIsoRelativeDay(date)}</span>
            </dd>
            <dt className="text-fg-muted">Motivo</dt>
            <dd className="text-fg">{reason || "Sin info"}</dd>
          </dl>
        </div>
      ) : (
        <p className="text-xs text-fg-muted">Este caso no tiene seguimiento agendado.</p>
      )}
      <div className="flex flex-col gap-2 border-t border-line-subtle pt-3">
        <h3 className="text-sm leading-5 font-semibold text-fg">Agendar</h3>
        <ScheduleForm onSave={onSave} />
      </div>
    </div>
  );
}
