import { BellRing } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Alarm } from "../alarms";

interface AlarmToastsProps {
  alarms: Alarm[];
  onOpen: (alarm: Alarm) => void;
  onDismiss: (key: string) => void;
}

export function AlarmToasts({ alarms, onOpen, onDismiss }: AlarmToastsProps) {
  if (alarms.length === 0) return null;
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="pointer-events-none absolute inset-x-0 top-2 z-50 flex flex-col items-center gap-2 px-3"
    >
      {alarms.map((alarm) => (
        <section
          key={alarm.key}
          aria-label="Alarma de seguimiento"
          className="pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-md border border-warning-border bg-overlay p-3 shadow-[var(--shadow-popover)]"
        >
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
          <div className="flex shrink-0 gap-1.5">
            <Button size="small" variant="primary" onClick={() => onOpen(alarm)}>
              Abrir caso
            </Button>
            <Button size="small" onClick={() => onDismiss(alarm.key)}>
              Descartar
            </Button>
          </div>
        </section>
      ))}
    </div>
  );
}
