import { BellRing } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { todayIso } from "@/lib/dates";
import type { Alarm } from "../alarms";
import { PostponeForm } from "./PostponeForm";

interface AlarmToastsProps {
  alarms: Alarm[];
  onOpen: (alarm: Alarm) => void;
  onDismiss: (key: string) => void;
  onPostpone: (alarm: Alarm, fecha: string, hora: string) => void;
}

interface AlarmToastProps {
  alarm: Alarm;
  onOpen: () => void;
  onDismiss: () => void;
  onPostpone: (fecha: string, hora: string) => void;
}

function AlarmToast({ alarm, onOpen, onDismiss, onPostpone }: AlarmToastProps) {
  const [isPostponing, setIsPostponing] = useState(false);
  return (
    <section
      aria-label="Alarma de seguimiento"
      className="pointer-events-auto flex w-full max-w-md flex-col gap-2 rounded-md border border-warning-border bg-overlay p-3 shadow-[var(--shadow-popover)]"
    >
      <div className="flex items-center gap-3">
        <BellRing
          className="size-5 shrink-0 animate-pulse text-warning motion-reduce:animate-none"
          strokeWidth={1.75}
          aria-hidden
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="text-[13px] leading-5 font-semibold text-fg">
            Es la hora: <span className="font-mono tabular-nums">{alarm.hora}</span>
          </span>
          <span className="truncate text-xs leading-4 text-fg-secondary" title={alarm.motivo}>
            {alarm.nombre ?? "Sin info"} · {alarm.motivo || "Sin motivo"}
          </span>
        </div>
        {isPostponing ? null : (
          <div className="flex shrink-0 gap-1.5">
            <Button size="small" variant="primary" onClick={onOpen}>
              Abrir caso
            </Button>
            <Button size="small" onClick={() => setIsPostponing(true)}>
              Posponer
            </Button>
            <Button size="small" onClick={onDismiss}>
              Descartar
            </Button>
          </div>
        )}
      </div>
      {isPostponing ? (
        <PostponeForm
          showDate={false}
          initialDate={todayIso()}
          onConfirm={onPostpone}
          onCancel={() => setIsPostponing(false)}
        />
      ) : null}
    </section>
  );
}

export function AlarmToasts({ alarms, onOpen, onDismiss, onPostpone }: AlarmToastsProps) {
  if (alarms.length === 0) return null;
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="pointer-events-none absolute inset-x-0 top-2 z-50 flex flex-col items-center gap-2 px-3"
    >
      {alarms.map((alarm) => (
        <AlarmToast
          key={alarm.key}
          alarm={alarm}
          onOpen={() => onOpen(alarm)}
          onDismiss={() => onDismiss(alarm.key)}
          onPostpone={(fecha, hora) => onPostpone(alarm, fecha, hora)}
        />
      ))}
    </div>
  );
}
