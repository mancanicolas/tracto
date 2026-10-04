import { save } from "@tauri-apps/plugin-dialog";
import { writeFile } from "@tauri-apps/plugin-fs";
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
