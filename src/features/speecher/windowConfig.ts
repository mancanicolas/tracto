export const SPEECHER_WINDOW_LABEL = "speecher";
export const SPEECHER_WINDOW_QUERY_KEY = "window";
export const SPEECHER_DOCK_EVENT = "speecher:dock";
export const MAIN_WINDOW_LABEL = "main";
export const SPEECH_EDITOR_WINDOW_LABEL = "speecher-editor";
export const EDITOR_WIDTH = 720;
export const EDITOR_HEIGHT = 780;
export const EDITOR_MIN_WIDTH = 520;
export const EDITOR_MIN_HEIGHT = 480;

export const WIDGET_WIDTH = 288;
export const WIDGET_HEIGHT = 440;
export const FOLDED_SIZE = 48;
export const FOLD_DELAY_MS = 180;
export const WIDGET_GAP = 8;
export const WIDGET_OFFSET_TOP = 56;

export type WindowRole = "main" | "speecher" | "speecher-editor";

export function getWindowRole(search: string = window.location.search): WindowRole {
  const value = new URLSearchParams(search).get(SPEECHER_WINDOW_QUERY_KEY);
  if (value === SPEECHER_WINDOW_LABEL || value === SPEECH_EDITOR_WINDOW_LABEL) return value;
  return "main";
}
