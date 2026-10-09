import { useCallback, useEffect, useRef, useState } from "react";
import {
  copySpeech,
  downloadSpeech,
  pasteFicha,
  validateSpeechInputs,
  type SpeechFormat,
} from "./lib/speechActions";
import { pickFolder } from "@/lib/saveFile";
import { getActiveSpeech } from "./lib/speechLibrary";
import { configStore, fichaStore, useStore } from "./lib/speechStore";
import { openSpeechEditor } from "./speechEditorWindow";

export type StatusTone = "neutral" | "success" | "error";

export interface SpeecherStatus {
  text: string;
  tone: StatusTone;
}

const PASTE_FLASH_MS = 2500;
const EMPTY_STATUS: SpeecherStatus = { text: "", tone: "neutral" };
const FOLDER_REQUIRED_MESSAGE = "Elegí una carpeta de descarga para guardar el archivo";

function readInputs() {
  const config = configStore.get();
  return {
    speech: getActiveSpeech().texts,
    ficha: fichaStore.get().ficha,
    settings: { cartera: config.cartera, operador: config.operador.trim(), interno: config.interno.trim() },
  };
}

export function useSpeecher() {
  const config = useStore(configStore);
  const [status, setStatus] = useState<SpeecherStatus>(EMPTY_STATUS);
  const [justPasted, setJustPasted] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const pasteTimerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (pasteTimerRef.current !== null) window.clearTimeout(pasteTimerRef.current);
    },
    [],
  );

  const selectCartera = useCallback((cartera: string) => configStore.set({ cartera }), []);

  const addCartera = useCallback((rawName: string) => {
    const name = rawName.trim();
    if (!name) return;
    const current = configStore.get();
    const existing = current.carteras.find((item) => item.toLowerCase() === name.toLowerCase());
    if (existing) {
      configStore.set({ cartera: existing });
      return;
    }
    configStore.set({ carteras: [...current.carteras, name], cartera: name });
  }, []);

  const removeCartera = useCallback(() => {
    const current = configStore.get();
    if (!current.cartera) return;
    const carteras = current.carteras.filter((item) => item !== current.cartera);
    configStore.set({ carteras, cartera: carteras[0] ?? "" });
  }, []);

  const setOperador = useCallback((operador: string) => configStore.set({ operador }), []);
  const setInterno = useCallback((interno: string) => configStore.set({ interno }), []);

  const paste = useCallback(async () => {
    const result = await pasteFicha();
    if (pasteTimerRef.current !== null) window.clearTimeout(pasteTimerRef.current);
    if (!result.ok) {
      setJustPasted(false);
      setStatus({ text: result.error, tone: "error" });
      return;
    }
    fichaStore.set({ ficha: result.data });
    setJustPasted(true);
    pasteTimerRef.current = window.setTimeout(() => setJustPasted(false), PASTE_FLASH_MS);
    setStatus({ text: result.data.NOMBRE || `DNI ${result.data.DNI}`, tone: "neutral" });
  }, []);

  const copy = useCallback(async () => {
    const { speech, ficha, settings } = readInputs();
    const problem = validateSpeechInputs(ficha, settings);
    if (problem || !ficha) {
      setStatus({ text: problem ?? "", tone: "error" });
      return;
    }
    const result = await copySpeech(speech, ficha, settings);
    setStatus(result.ok ? { text: "Speech copiado", tone: "success" } : { text: result.error, tone: "error" });
  }, []);

  const download = useCallback(async (format: SpeechFormat) => {
    const { speech, ficha, settings } = readInputs();
    const problem = validateSpeechInputs(ficha, settings);
    if (problem || !ficha) {
      setStatus({ text: problem ?? "", tone: "error" });
      return;
    }
    let folder = configStore.get().carpeta;
    if (!folder) {
      const picked = await pickFolder();
      if (!picked) {
        setStatus({ text: FOLDER_REQUIRED_MESSAGE, tone: "error" });
        return;
      }
      folder = picked;
      configStore.set({ carpeta: picked });
    }
    setIsDownloading(true);
    setStatus({ text: "Generando…", tone: "neutral" });
    const { sobrescribir, lastGeneratedPdfPath } = configStore.get();
    const result = await downloadSpeech(speech, ficha, settings, format, {
      folder,
      overwrite: sobrescribir,
      previousPath: lastGeneratedPdfPath,
    });
    setIsDownloading(false);
    if (result.ok && result.data.path) configStore.set({ lastGeneratedPdfPath: result.data.path });
    if (!result.ok) setStatus({ text: result.error, tone: "error" });
    else if (result.data.outcome === "saved") setStatus({ text: `Guardado: ${result.data.fileName}`, tone: "success" });
    else setStatus(EMPTY_STATUS);
  }, []);

  const chooseFolder = useCallback(async () => {
    const folder = await pickFolder();
    if (folder) configStore.set({ carpeta: folder });
  }, []);

  const setOverwrite = useCallback((sobrescribir: boolean) => configStore.set({ sobrescribir }), []);

  return {
    config,
    status,
    justPasted,
    isDownloading,
    selectCartera,
    addCartera,
    removeCartera,
    setOperador,
    setInterno,
    chooseFolder: () => void chooseFolder(),
    setOverwrite,
    paste: () => void paste(),
    copy: () => void copy(),
    download: (format: SpeechFormat) => void download(format),
    editSpeech: () => void openSpeechEditor(),
  };
}
