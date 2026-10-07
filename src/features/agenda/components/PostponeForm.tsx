import { useState, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/Button";
import { addMinutes } from "date-fns";
import { todayIso } from "@/lib/dates";
import { formatTime } from "@/lib/format";

interface PostponeFormProps {
  showDate: boolean;
  initialDate: string;
  onConfirm: (fecha: string, hora: string) => void;
  onCancel: () => void;
}

const QUICK_OPTIONS = [
  { label: "15 min", minutes: 15 },
  { label: "30 min", minutes: 30 },
  { label: "1 h", minutes: 60 },
] as const;

const DEFAULT_OFFSET_MINUTES = 15;
const FIELD_CLASS =
  "h-7 rounded-sm border border-line bg-input px-2 font-mono text-xs tabular-nums text-fg hover:border-line-strong";

export function PostponeForm({ showDate, initialDate, onConfirm, onCancel }: PostponeFormProps) {
  const [date, setDate] = useState(initialDate);
  const [time, setTime] = useState(() => formatTime(addMinutes(new Date(), DEFAULT_OFFSET_MINUTES)));
  const [error, setError] = useState("");

  const confirmQuick = (minutes: number) => {
    const target = addMinutes(new Date(), minutes);
    onConfirm(todayIso(target), formatTime(target));
  };

  const confirmCustom = () => {
    if (!/^\d{2}:\d{2}$/.test(time)) {
      setError("Elegí un horario.");
      return;
    }
    const now = new Date();
    const today = todayIso(now);
    if (date < today || (date === today && time <= formatTime(now))) {
      setError("Elegí un horario posterior a la hora actual.");
      return;
    }
    onConfirm(date, time);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.stopPropagation();
      onCancel();
    } else if (event.key === "Enter") {
      event.preventDefault();
      confirmCustom();
    }
  };

  return (
    <div role="group" aria-label="Posponer" onKeyDown={handleKeyDown} className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-xs text-fg-muted">Dentro de</span>
        {QUICK_OPTIONS.map(({ label, minutes }) => (
          <Button key={minutes} size="small" onClick={() => confirmQuick(minutes)}>
            {label}
          </Button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {showDate ? (
          <input
            type="date"
            value={date}
            min={todayIso()}
            onChange={(event) => setDate(event.target.value)}
            aria-label="Nueva fecha"
            className={FIELD_CLASS}
          />
        ) : null}
        <input
          type="time"
          value={time}
          onChange={(event) => setTime(event.target.value)}
          aria-label="Nuevo horario"
          aria-invalid={error ? true : undefined}
          className={FIELD_CLASS}
          autoFocus
        />
        <Button size="small" variant="primary" onClick={confirmCustom}>
          Posponer
        </Button>
        <Button size="small" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
      {error ? (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
