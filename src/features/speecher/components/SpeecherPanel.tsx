import { Check, ClipboardPaste, Copy, Download, FolderOpen, Image, PencilLine, Plus, X } from "lucide-react";
import { useState, type KeyboardEvent } from "react";
import { CheckboxField } from "@/components/ui/CheckboxField";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { SelectField } from "@/components/ui/SelectField";
import { TextField } from "@/components/ui/TextField";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { cn } from "@/lib/cn";
import {
  BASE_OPTIONS,
  createSpeech,
  DEFAULT_SPEECH_ID,
  MAX_SPEECH_NAME_LENGTH,
  nameExists,
  selectSpeech,
  useSpeeches,
} from "../lib/speechLibrary";
import type { Studio } from "../lib/speechStore";
import { useSpeecher } from "../useSpeecher";
import { OptionListField } from "./OptionListField";

const STUDIO_OPTIONS = [
  { value: "5ol", label: "5 Online" },
  { value: "r2r", label: "R2R" },
];

const INPUT_CLASS =
  "h-8 rounded-sm border border-line bg-input text-[13px] text-fg transition-colors duration-100 placeholder:text-fg-muted hover:border-line-strong motion-reduce:transition-none";
const SQUARE_BUTTON_CLASS = "size-8 border border-line hover:border-line-strong";

const STATUS_CLASSES = {
  neutral: "text-fg-muted",
  success: "text-success",
  error: "text-danger",
} as const;

export function SpeecherPanel() {
  const speecher = useSpeecher();
  const { config } = speecher;
  const [isAddingSpeech, setIsAddingSpeech] = useState(false);
  const [newSpeechName, setNewSpeechName] = useState("");
  const [newSpeechBase, setNewSpeechBase] = useState(DEFAULT_SPEECH_ID);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const { entries, active } = useSpeeches();
  const isR2r = config.estudio === "r2r";

  const speechOptions = entries.map((entry) => ({ value: entry.id, label: entry.name }));

  const confirmNewSpeech = () => {
    const name = newSpeechName.trim();
    if (!name) {
      setSpeechError("Ingresá un nombre para el speech.");
      return;
    }
    if (nameExists(name)) {
      setSpeechError("Ya existe un speech con ese nombre.");
      return;
    }
    createSpeech(name, newSpeechBase);
    cancelNewSpeech();
    speecher.editSpeech();
  };

  const cancelNewSpeech = () => {
    setNewSpeechName("");
    setNewSpeechBase(DEFAULT_SPEECH_ID);
    setSpeechError(null);
    setIsAddingSpeech(false);
  };

  const handleNewSpeechKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      confirmNewSpeech();
    } else if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      cancelNewSpeech();
    }
  };

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3">
        <SelectField
          label="Estudio"
          options={STUDIO_OPTIONS}
          value={config.estudio}
          onChange={(event) => speecher.selectEstudio(event.target.value as Studio)}
        />

        <OptionListField
          id="speecher-new-cartera"
          label="Cartera"
          addLabel="Nueva cartera"
          saveLabel="Guardar cartera"
          removeLabel="Quitar la cartera elegida"
          namePlaceholder="Nombre de la cartera"
          items={config.carteras}
          value={config.cartera}
          onSelect={speecher.selectCartera}
          onAdd={speecher.addCartera}
          onRemove={speecher.removeCartera}
        />

        <OptionListField
          id="speecher-new-fideicomiso"
          label="Fideicomiso"
          addLabel="Nuevo fideicomiso"
          saveLabel="Guardar fideicomiso"
          removeLabel="Quitar el fideicomiso elegido"
          namePlaceholder="Nombre del fideicomiso"
          items={config.fideicomisos}
          value={config.fideicomiso}
          onSelect={speecher.selectFideicomiso}
          onAdd={speecher.addFideicomiso}
          onRemove={speecher.removeFideicomiso}
        />

        <div className="grid grid-cols-2 gap-1.5">
          <TextField
            label="Origen de la deuda"
            autoComplete="off"
            maxLength={30}
            placeholder="dd/mm/aaaa"
            value={config.origen}
            onChange={(event) => speecher.setOrigen(event.target.value)}
            className="font-mono tabular-nums"
          />
          <TextField
            label="Automotor"
            autoComplete="off"
            maxLength={60}
            placeholder="Patente o modelo"
            value={config.automotor}
            onChange={(event) => speecher.setAutomotor(event.target.value)}
          />
        </div>

        {isAddingSpeech ? (
          <div className="flex flex-col gap-1">
            <div className="flex items-end gap-1.5">
              <div className="min-w-0 flex-1">
                <label htmlFor="speecher-new-speech" className="mb-1.5 block text-xs leading-4 font-medium text-fg-secondary">
                  Nuevo speech
                </label>
                <input
                  id="speecher-new-speech"
                  value={newSpeechName}
                  onChange={(event) => {
                    setNewSpeechName(event.target.value);
                    setSpeechError(null);
                  }}
                  onKeyDown={handleNewSpeechKeyDown}
                  maxLength={MAX_SPEECH_NAME_LENGTH}
                  autoComplete="off"
                  autoFocus
                  aria-invalid={speechError ? true : undefined}
                  placeholder="Nombre del speech"
                  className={cn(INPUT_CLASS, "w-full px-2.5")}
                />
              </div>
              <IconButton label="Crear speech" onClick={confirmNewSpeech} className={SQUARE_BUTTON_CLASS}>
                <Check strokeWidth={1.75} />
              </IconButton>
              <IconButton label="Cancelar" onClick={cancelNewSpeech} className={SQUARE_BUTTON_CLASS}>
                <X strokeWidth={1.75} />
              </IconButton>
            </div>
            <SelectField
              label="Partir de"
              options={BASE_OPTIONS}
              value={newSpeechBase}
              onChange={(event) => setNewSpeechBase(event.target.value)}
            />
            {speechError ? (
              <p role="alert" className="text-xs leading-4 text-danger">
                {speechError}
              </p>
            ) : null}
          </div>
        ) : (
          <div className="flex items-end gap-1.5">
            <div className="min-w-0 flex-1">
              <SelectField
                label="Speech"
                options={speechOptions}
                value={active.id}
                onChange={(event) => selectSpeech(event.target.value)}
              />
            </div>
            <IconButton label="Crear speech" onClick={() => setIsAddingSpeech(true)} className={SQUARE_BUTTON_CLASS}>
              <Plus strokeWidth={1.75} />
            </IconButton>
          </div>
        )}

        {isR2r ? null : (
        <div role="group" aria-labelledby="speecher-operator-label" className="flex flex-col gap-1.5">
          <span id="speecher-operator-label" className="text-xs leading-4 font-medium text-fg-secondary">
            Operador · Interno
          </span>
          <div className="flex gap-1.5">
            <div className="relative min-w-0 flex-1">
              <WhatsAppIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-fg-muted" />
              <input
                type="tel"
                inputMode="tel"
                autoComplete="off"
                maxLength={30}
                value={config.operador}
                onChange={(event) => speecher.setOperador(event.target.value)}
                aria-label="Número de WhatsApp del operador"
                placeholder="11 1234 5678"
                className={cn(INPUT_CLASS, "w-full pr-2.5 pl-8 font-mono tabular-nums")}
              />
            </div>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="off"
              maxLength={8}
              value={config.interno}
              onChange={(event) => speecher.setInterno(event.target.value)}
              aria-label="Interno"
              placeholder="Interno"
              className={cn(INPUT_CLASS, "w-20 shrink-0 px-2.5 text-center font-mono tabular-nums")}
            />
          </div>
        </div>

        )}

        <Button className="w-full" onClick={speecher.paste}>
          {speecher.justPasted ? (
            <Check className="size-4 text-success" strokeWidth={1.75} aria-hidden />
          ) : (
            <ClipboardPaste className="size-4" strokeWidth={1.75} aria-hidden />
          )}
          {speecher.justPasted ? "Pegado" : "Pegar"}
        </Button>

        <div className="flex flex-col gap-1.5">
          <span id="speecher-folder-label" className="text-xs leading-4 font-medium text-fg-secondary">
            Carpeta de descarga
          </span>
          <div className="flex items-center gap-1.5">
            <p
              aria-labelledby="speecher-folder-label"
              title={config.carpeta || undefined}
              className={cn(
                "flex h-8 min-w-0 flex-1 items-center rounded-sm border border-line bg-input px-2.5 font-mono text-xs",
                config.carpeta ? "text-fg" : "font-sans text-fg-muted",
              )}
            >
              <span className="truncate">{config.carpeta || "Se pide al descargar"}</span>
            </p>
            <IconButton label="Elegir carpeta de descarga" onClick={speecher.chooseFolder} className={SQUARE_BUTTON_CLASS}>
              <FolderOpen strokeWidth={1.75} />
            </IconButton>
          </div>
          <CheckboxField
            label="Sobrescribir si el archivo ya existe"
            checked={config.sobrescribir}
            onChange={(event) => speecher.setOverwrite(event.target.checked)}
          />
        </div>

        <p
          role="status"
          aria-live="polite"
          className={cn("min-h-4 truncate text-center text-xs leading-4", STATUS_CLASSES[speecher.status.tone])}
          title={speecher.status.text}
        >
          {speecher.status.text}
        </p>
      </div>

      <div className="flex shrink-0 flex-col gap-2 border-t border-line-subtle p-3">
        <Button variant="primary" className="w-full" onClick={speecher.copy}>
          <Copy className="size-4" strokeWidth={1.75} aria-hidden />
          Copiar speech
        </Button>
        <div className="flex gap-1.5">
          <Button
            className="min-w-0 flex-1"
            loading={speecher.isDownloading}
            onClick={() => speecher.download("pdf")}
          >
            <Download className="size-4" strokeWidth={1.75} aria-hidden />
            Descargar speech
          </Button>
          <IconButton
            label="Descargar speech como imagen"
            disabled={speecher.isDownloading}
            onClick={() => speecher.download("png")}
            className={SQUARE_BUTTON_CLASS}
          >
            <Image strokeWidth={1.75} />
          </IconButton>
        </div>
        <Button className="w-full" onClick={speecher.editSpeech}>
          <PencilLine className="size-4" strokeWidth={1.75} aria-hidden />
          Editar speech
        </Button>
      </div>
    </>
  );
}
