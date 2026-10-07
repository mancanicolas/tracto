import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import {
  EDITOR_HEIGHT,
  EDITOR_MIN_HEIGHT,
  EDITOR_MIN_WIDTH,
  EDITOR_WIDTH,
  SPEECHER_WINDOW_QUERY_KEY,
  SPEECH_EDITOR_WINDOW_LABEL,
} from "./windowConfig";

export async function openSpeechEditor(): Promise<void> {
  try {
    const existing = await WebviewWindow.getByLabel(SPEECH_EDITOR_WINDOW_LABEL);
    if (existing) {
      await existing.unminimize();
      await existing.setFocus();
      return;
    }
    new WebviewWindow(SPEECH_EDITOR_WINDOW_LABEL, {
      url: `index.html?${SPEECHER_WINDOW_QUERY_KEY}=${SPEECH_EDITOR_WINDOW_LABEL}`,
      title: "Editar speech",
      width: EDITOR_WIDTH,
      height: EDITOR_HEIGHT,
      minWidth: EDITOR_MIN_WIDTH,
      minHeight: EDITOR_MIN_HEIGHT,
      center: true,
      theme: "dark",
      focus: true,
    });
  } catch {
    return;
  }
}
