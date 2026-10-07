import { BellRing, Check, Clock } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useClock } from "@/hooks/useClock";
import { formatIsoDate, formatIsoRelativeDay, todayIso } from "@/lib/dates";
import type { Case } from "@/lib/types";
import { isAgendaPending } from "../filters";
import { PendingDot } from "./PendingDot";
import { PostponeForm } from "./PostponeForm";

interface AgendaSummaryProps {
  account: Case;
  onResolve: () => void;
  onPostpone: (fecha: string, hora: string) => void;
}

export function AgendaSummary({ account, onResolve, onPostpone }: AgendaSummaryProps) {
  const { agendado_para: date, agendado_motivo: reason, agendado_hora: time, agendado_resuelto: isResolved } = account;
  const [isPostponing, setIsPostponing] = useState(false);
  const now = useClock();
  if (!date) return null;

  const isPending = isAgendaPending(account, now);
  const earliestDate = date > todayIso(now) ? date : todayIso(now);

  return (
    <section
      aria-label="Seguimiento agendado"
      className="flex flex-col gap-2 rounded-sm border border-line bg-raised px-2.5 py-2"
    >
      <div className="flex items-start justify-between gap-3">
        <dl className="grid min-w-0 grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-[13px] leading-5">
          <dt className="text-fg-muted">Para</dt>
          <dd className="text-fg">
            <span className="font-mono tabular-nums">{formatIsoDate(date)}</span>
            <span className="text-fg-muted"> · {formatIsoRelativeDay(date)}</span>
            {time ? (
              <span className="ml-2 inline-flex items-center gap-1 font-mono text-fg tabular-nums">
                <BellRing className="size-3.5 text-warning" strokeWidth={1.75} aria-hidden />
                {time}
                <span className="sr-only">con alarma</span>
              </span>
            ) : null}
            {isPending ? (
              <span className="ml-2 inline-flex items-center gap-1 text-xs font-medium text-danger">
                <PendingDot />
                Pendiente
              </span>
            ) : null}
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
          <div className="flex shrink-0 gap-1.5">
            <Button size="small" aria-expanded={isPostponing} onClick={() => setIsPostponing((open) => !open)}>
              <Clock className="size-3.5" strokeWidth={1.75} aria-hidden />
              Posponer
            </Button>
            <Button size="small" onClick={onResolve}>
              <Check className="size-3.5" strokeWidth={1.75} aria-hidden />
              Marcar resuelto
            </Button>
          </div>
        )}
      </div>
      {isPostponing && !isResolved ? (
        <PostponeForm
          showDate
          initialDate={earliestDate}
          onConfirm={(fecha, hora) => {
            setIsPostponing(false);
            onPostpone(fecha, hora);
          }}
          onCancel={() => setIsPostponing(false)}
        />
      ) : null}
    </section>
  );
}
