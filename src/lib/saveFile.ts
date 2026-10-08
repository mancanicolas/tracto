import { join } from "@tauri-apps/api/path";
import { open, save } from "@tauri-apps/plugin-dialog";
import { exists, remove, writeFile } from "@tauri-apps/plugin-fs";
import { fail, ok, type Result } from "./result";

export type SaveOutcome = "saved" | "cancelled";

export const SAVE_ERROR_MESSAGE = "No se pudo guardar el archivo. Probá de nuevo.";

interface SaveRequest {
  defaultName: string;
  filterName: string;
  extension: string;
  bytes: Uint8Array;
}

export async function saveBytesWithDialog({
  defaultName,
  filterName,
  extension,
  bytes,
}: SaveRequest): Promise<Result<SaveOutcome>> {
  try {
    const path = await save({
      defaultPath: defaultName,
      filters: [{ name: filterName, extensions: [extension] }],
    });
    if (path === null) return ok<SaveOutcome>("cancelled");
    await writeFile(path, bytes);
    return ok<SaveOutcome>("saved");
  } catch {
    return fail(SAVE_ERROR_MESSAGE);
  }
}

export const FILE_IN_USE_MESSAGE = "Cerrá el archivo abierto y reintentá";

const MAX_NAME_ATTEMPTS = 200;

interface FolderSaveRequest {
  folder: string;
  fileName: string;
  bytes: Uint8Array;
  overwrite: boolean;
  previousPath?: string;
}

function normalizePath(path: string): string {
  return path.replace(/\\/g, "/").replace(/\/+$/, "").toLowerCase();
}

function isInFolder(path: string, folder: string): boolean {
  return normalizePath(path).startsWith(`${normalizePath(folder)}/`);
}

async function removePreviousFile(previousPath: string, folder: string): Promise<void> {
  if (!isInFolder(previousPath, folder) || !(await exists(previousPath))) return;
  await remove(previousPath);
}

function splitExtension(fileName: string): { base: string; extension: string } {
  const dot = fileName.lastIndexOf(".");
  return dot > 0 ? { base: fileName.slice(0, dot), extension: fileName.slice(dot) } : { base: fileName, extension: "" };
}

async function resolveFolderTarget(folder: string, fileName: string, overwrite: boolean): Promise<string> {
  const preferred = await join(folder, fileName);
  if (overwrite || !(await exists(preferred))) return preferred;
  const { base, extension } = splitExtension(fileName);
  for (let attempt = 2; attempt <= MAX_NAME_ATTEMPTS; attempt += 1) {
    const candidate = await join(folder, `${base} (${attempt})${extension}`);
    if (!(await exists(candidate))) return candidate;
  }
  return preferred;
}

function isFileInUse(error: unknown): boolean {
  const message = String(error).toLowerCase();
  return message.includes("os error 32") || message.includes("being used by another process");
}

export async function saveBytesInFolder({
  folder,
  fileName,
  bytes,
  overwrite,
  previousPath,
}: FolderSaveRequest): Promise<Result<string>> {
  try {
    if (overwrite && previousPath) await removePreviousFile(previousPath, folder);
    const target = await resolveFolderTarget(folder, fileName, overwrite);
    await writeFile(target, bytes);
    return ok(target);
  } catch (error) {
    return fail(isFileInUse(error) ? FILE_IN_USE_MESSAGE : SAVE_ERROR_MESSAGE);
  }
}

export async function pickFolder(): Promise<string | null> {
  try {
    const selected = await open({ directory: true, multiple: false, recursive: true });
    return typeof selected === "string" ? selected : null;
  } catch {
    return null;
  }
}

