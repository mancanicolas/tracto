import { getCurrentWindow } from "@tauri-apps/api/window";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { TextField } from "@/components/ui/TextField";
import { SelectField } from "@/components/ui/SelectField";
import {
  DEFAULT_SPEECH,
  PDF_PRESET_OPTIONS,
  SPEECH_FIELDS,
  type PdfPresetId,
  type SpeechTexts,
} from "../lib/speechDefaults";
import {
  deleteSpeech,
  MAX_SPEECH_NAME_LENGTH,
  restoreBuiltinSpeech,
  saveSpeech,
  useSpeeches,
  type SpeechEntry,
} from "../lib/speechLibrary";

const SAVED_FLASH_MS = 2200;
const KEYS = ["TRATO", "NOMBRE", "DNI", "MES", "ANIO", "CARTERA", "FECHA", "LABORAL", "OPERADOR", "INTERNO"];

const FIELD_LABELS: Record<(typeof SPEECH_FIELDS)[number], { label: string; hint: string; rows: number }> = {
  encabezado: { label: "Encabezado", hint: "Línea 1: destinatario. Línea 2: título.", rows: 2 },
  cuerpo: { label: "Cuerpo", hint: "", rows: 18 },
  pie: { label: "Pie", hint: "Línea 1: nombre. Línea 2: rubro. El resto: contacto.", rows: 4 },
  confidencialidad: { label: "Confidencialidad", hint: "", rows: 2 },
};

export function SpeechEditor() {
  const { active } = useSpeeches();
  return <SpeechEditorForm key={active.id} speech={active} />;
}

function SpeechEditorForm({ speech }: { speech: SpeechEntry }) {
  const [values, setValues] = useState<SpeechTexts>(() => ({ ...speech.texts }));
  const [name, setName] = useState(speech.name);
  const [error, setError] = useState<string | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
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
    const problem = saveSpeech(speech.id, values, name);
    setError(problem);
    if (!problem) flash("Guardado");
  };

  const restore = () => {
    restoreBuiltinSpeech(speech.id);
    setValues({ ...DEFAULT_SPEECH, ...speech.original });
    flash("Texto original restaurado");
  };

  const remove = () => {
    deleteSpeech(speech.id);
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
        <p className="text-xs text-fg-muted">
          {`Speech: ${speech.name}.`} Los cambios se usan al copiar y descargar.
        </p>
      </header>

      <main className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4">
        {speech.isBuiltin ? null : (
          <TextField
            label="Nombre del speech"
            value={name}
            maxLength={MAX_SPEECH_NAME_LENGTH}
            autoComplete="off"
            error={error ?? undefined}
            onChange={(event) => {
              setName(event.target.value);
              setError(null);
            }}
          />
        )}
        <SelectField
          label="Diseño del PDF"
          options={PDF_PRESET_OPTIONS}
          value={values.preset}
          onChange={(event) => setValues((current) => ({ ...current, preset: event.target.value as PdfPresetId }))}
        />
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
        {speech.isBuiltin ? (
          <Button onClick={restore}>Restaurar original</Button>
        ) : isConfirmingDelete ? (
          <>
            <Button onClick={() => setIsConfirmingDelete(false)}>Conservar</Button>
            <Button variant="destructive" onClick={remove}>
              Confirmar eliminación
            </Button>
          </>
        ) : (
          <Button variant="destructive" onClick={() => setIsConfirmingDelete(true)}>
            Eliminar speech
          </Button>
        )}
        <Button onClick={close}>Cerrar</Button>
        <Button variant="primary" onClick={save}>
          Guardar
        </Button>
      </footer>
    </div>
  );
}
