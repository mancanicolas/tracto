import { readText, writeText } from "@tauri-apps/plugin-clipboard-manager";
import { fail, ok, type Result } from "@/lib/result";
import { SAVE_ERROR_MESSAGE, saveBytesInFolder, saveBytesWithDialog, type SaveOutcome } from "@/lib/saveFile";
import { parseFicha, type Ficha } from "./parser";
import { buildSpeechData, renderSpeechText, type SpeechSettings } from "./speechContent";
import type { SpeechTexts } from "./speechDefaults";

export type SpeechFormat = "pdf" | "png";

export interface DownloadTarget {
  folder: string;
  overwrite: boolean;
}

export interface DownloadOutcome {
  outcome: SaveOutcome;
  fileName: string;
}

const FORMAT_FILTERS: Record<SpeechFormat, string> = { pdf: "PDF", png: "Imagen PNG" };
const NO_DATA_MESSAGE = "No se reconocieron datos";
const CLIPBOARD_READ_ERROR = "No se pudo leer el portapapeles";
const CLIPBOARD_WRITE_ERROR = "No se pudo copiar el speech";
const FALLBACK_FILE_NAME = "Cierre etapa conciliatoria";

export const NEEDS_FICHA_MESSAGE = "Primero pegá los datos";
export const NEEDS_CARTERA_MESSAGE = "Elegí una cartera";
export const NEEDS_OPERATOR_MESSAGE = "Falta el número de operador";

async function readClipboard(): Promise<string> {
  try {
    return await readText();
  } catch {
    return navigator.clipboard.readText();
  }
}

async function writeClipboard(text: string): Promise<void> {
  try {
    await writeText(text);
  } catch {
    await navigator.clipboard.writeText(text);
  }
}

export async function pasteFicha(): Promise<Result<Ficha>> {
  let text: string;
  try {
    text = await readClipboard();
  } catch {
    return fail(CLIPBOARD_READ_ERROR);
  }
  const ficha = parseFicha(text);
  if (!ficha.DNI && !ficha.NOMBRE) return fail(NO_DATA_MESSAGE);
  return ok(ficha);
}

export function validateSpeechInputs(ficha: Ficha | null, settings: SpeechSettings): string | null {
  if (!ficha) return NEEDS_FICHA_MESSAGE;
  if (!settings.cartera) return NEEDS_CARTERA_MESSAGE;
  if (!settings.operador) return NEEDS_OPERATOR_MESSAGE;
  return null;
}

export async function copySpeech(speech: SpeechTexts, ficha: Ficha, settings: SpeechSettings): Promise<Result> {
  try {
    await writeClipboard(renderSpeechText(speech, buildSpeechData(ficha, settings)));
    return ok();
  } catch {
    return fail(CLIPBOARD_WRITE_ERROR);
  }
}

function buildFileName(ficha: Ficha): string {
  const name = `${ficha.NOMBRE} - ${ficha.DNI}`
    .replace(/[/:*?"<>|]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return name || FALLBACK_FILE_NAME;
}

function lastSegment(path: string): string {
  return path.split(/[\\/]/).filter(Boolean).at(-1) ?? path;
}

export async function downloadSpeech(
  speech: SpeechTexts,
  ficha: Ficha,
  settings: SpeechSettings,
  format: SpeechFormat,
  target: DownloadTarget,
): Promise<Result<DownloadOutcome>> {
  let bytes: Uint8Array;
  try {
    const { buildSpeechPdfBytes } = await import("./speechPdf");
    const pdfBytes = await buildSpeechPdfBytes(speech, buildSpeechData(ficha, settings));
    bytes = format === "png" ? await (await import("@/lib/pdfToPng")).renderPdfToPng(pdfBytes) : pdfBytes;
  } catch {
    return fail(SAVE_ERROR_MESSAGE);
  }
  const fileName = `${buildFileName(ficha)}.${format}`;

  if (target.folder) {
    const saved = await saveBytesInFolder({ folder: target.folder, fileName, bytes, overwrite: target.overwrite });
    return saved.ok ? ok({ outcome: "saved", fileName: lastSegment(saved.data) }) : saved;
  }

  const result = await saveBytesWithDialog({
    defaultName: fileName,
    filterName: FORMAT_FILTERS[format],
    extension: format,
    bytes,
  });
  return result.ok ? ok({ outcome: result.data, fileName }) : result;
}
