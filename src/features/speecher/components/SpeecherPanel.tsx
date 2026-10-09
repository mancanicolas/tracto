import { Check, ClipboardPaste, Copy, Download, FolderOpen, Image, Minus, PencilLine, Plus, X } from "lucide-react";
import { useState, type KeyboardEvent } from "react";
import { CheckboxField } from "@/components/ui/CheckboxField";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { SelectField } from "@/components/ui/SelectField";
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
import { useSpeecher } from "../useSpeecher";

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
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [isAddingSpeech, setIsAddingSpeech] = useState(false);
  const [newSpeechName, setNewSpeechName] = useState("");
  const [newSpeechBase, setNewSpeechBase] = useState(DEFAULT_SPEECH_ID);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const { entries, active } = useSpeeches();

  const confirmNew = () => {
    speecher.addCartera(newName);
    setNewName("");
    setIsAdding(false);
  };

  const cancelNew = () => {
    setNewName("");
    setIsAdding(false);
  };

  const handleNewKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      confirmNew();
    } else if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      cancelNew();
    }
  };

  const options = config.carteras.map((name) => ({ value: name, label: name }));
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
        {isAdding ? (
          <div className="flex items-end gap-1.5">
            <div className="min-w-0 flex-1">
              <label htmlFor="speecher-new-cartera" className="mb-1.5 block text-xs leading-4 font-medium text-fg-secondary">
                Nueva cartera
              </label>
              <input
                id="speecher-new-cartera"
                value={newName}
                onChange={(event) => setNewName(event.target.value)}
                onKeyDown={handleNewKeyDown}
                maxLength={60}
                autoComplete="off"
                autoFocus
                placeholder="Nombre de la cartera"
                className={cn(INPUT_CLASS, "w-full px-2.5")}
              />
            </div>
            <IconButton label="Guardar cartera" onClick={confirmNew} className={SQUARE_BUTTON_CLASS}>
              <Check strokeWidth={1.75} />
            </IconButton>
            <IconButton label="Cancelar" onClick={cancelNew} className={SQUARE_BUTTON_CLASS}>
              <X strokeWidth={1.75} />
            </IconButton>
          </div>
        ) : (
          <div className="flex items-end gap-1.5">
            <div className="min-w-0 flex-1">
              <SelectField
                label="Cartera"
                options={options}
                placeholder={options.length === 0 ? "Agregá una con +" : undefined}
                value={config.cartera}
                onChange={(event) => speecher.selectCartera(event.target.value)}
              />
            </div>
            <IconButton label="Agregar cartera" onClick={() => setIsAdding(true)} className={SQUARE_BUTTON_CLASS}>
              <Plus strokeWidth={1.75} />
            </IconButton>
            <IconButton
              label="Quitar la cartera elegida"
              onClick={speecher.removeCartera}
              disabled={options.length === 0}
              className={SQUARE_BUTTON_CLASS}
            >
              <Minus strokeWidth={1.75} />
            </IconButton>
          </div>
        )}

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
