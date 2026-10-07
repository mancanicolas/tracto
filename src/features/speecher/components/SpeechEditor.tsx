import { getCurrentWindow } from "@tauri-apps/api/window";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { DEFAULT_SPEECH, SPEECH_FIELDS, type SpeechTexts } from "../lib/speechDefaults";
import { speechStore } from "../lib/speechStore";

const SAVED_FLASH_MS = 2200;
const KEYS = ["TRATO", "NOMBRE", "DNI", "MES", "ANIO", "CARTERA", "FECHA", "LABORAL", "OPERADOR", "INTERNO", "LINK"];

const FIELD_LABELS: Record<(typeof SPEECH_FIELDS)[number], { label: string; hint: string; rows: number }> = {
  encabezado: { label: "Encabezado", hint: "Línea 1: destinatario. Línea 2: título.", rows: 2 },
  cuerpo: { label: "Cuerpo", hint: "", rows: 18 },
  pie: { label: "Pie", hint: "Línea 1: nombre. Línea 2: rubro. El resto: contacto.", rows: 4 },
  confidencialidad: { label: "Confidencialidad", hint: "", rows: 2 },
};

export function SpeechEditor() {
  const [values, setValues] = useState<SpeechTexts>(() => ({ ...DEFAULT_SPEECH, ...speechStore.get() }));
  const [message, setMessage] = useState("");
  const messageTimerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (messageTimerRef.current !== null) window.clearTimeout(messageTimerRef.current);
    },
    [],
  );

  const flash = (text: string) => {
    setMessage(text);
    if (messageTimerRef.current !== null) window.clearTimeout(messageTimerRef.current);
    messageTimerRef.current = window.setTimeout(() => setMessage(""), SAVED_FLASH_MS);
  };

  const save = () => {
    speechStore.set(values);
    flash("Guardado");
  };

  const restore = () => {
    speechStore.reset();
    setValues({ ...DEFAULT_SPEECH });
    flash("Texto original restaurado");
  };

  const close = () => {
    void getCurrentWindow()
      .close()
      .catch(() => undefined);
  };

  return (
    <div className="flex h-full flex-col bg-surface">
      <header className="flex items-baseline gap-3 border-b border-line-subtle px-4 py-3">
        <h1 className="text-sm leading-5 font-semibold text-fg">Editar speech</h1>
        <p className="text-xs text-fg-muted">Los cambios se guardan y se usan en todos los speech.</p>
      </header>

      <main className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4">
        <p className="text-xs leading-5 text-fg-muted">
          Claves disponibles:{" "}
          {KEYS.map((key) => (
            <code
              key={key}
              className="mr-1 rounded-xs border border-line bg-input px-1.5 py-0.5 font-mono text-[11px] text-accent"
            >
              {`{${key}}`}
            </code>
          ))}
          <code className="rounded-xs border border-line bg-input px-1.5 py-0.5 font-mono text-[11px] text-accent">
            **negrita**
          </code>
          <br />
          En el cuerpo separá los párrafos con una línea en blanco y empezá con{" "}
          <code className="rounded-xs border border-line bg-input px-1.5 py-0.5 font-mono text-[11px] text-accent">
            -
          </code>{" "}
          para hacer viñetas.
        </p>
        {SPEECH_FIELDS.map((field) => (
          <TextAreaField
            key={field}
            label={`${FIELD_LABELS[field].label}${FIELD_LABELS[field].hint ? ` · ${FIELD_LABELS[field].hint}` : ""}`}
            rows={FIELD_LABELS[field].rows}
            value={values[field]}
            onChange={(event) => setValues((current) => ({ ...current, [field]: event.target.value }))}
            className="font-mono text-[13px] leading-5"
          />
        ))}
      </main>

      <footer className="flex items-center gap-2 border-t border-line-subtle px-4 py-3">
        <p role="status" aria-live="polite" className="flex-1 text-xs text-success">
          {message}
        </p>
        <Button onClick={restore}>Restaurar original</Button>
        <Button onClick={close}>Cerrar</Button>
        <Button variant="primary" onClick={save}>
          Guardar
        </Button>
      </footer>
    </div>
  );
}
