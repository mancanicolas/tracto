export const SPEECHER_WINDOW_LABEL = "speecher";
export const SPEECHER_WINDOW_QUERY_KEY = "window";
export const SPEECHER_DOCK_EVENT = "speecher:dock";
export const MAIN_WINDOW_LABEL = "main";

export const WIDGET_WIDTH = 288;
export const WIDGET_HEIGHT = 372;
export const FOLDED_SIZE = 48;
export const FOLD_DELAY_MS = 180;
export const WIDGET_GAP = 8;
export const WIDGET_OFFSET_TOP = 56;

export function isSpeecherWindow(search: string = window.location.search): boolean {
  return new URLSearchParams(search).get(SPEECHER_WINDOW_QUERY_KEY) === SPEECHER_WINDOW_LABEL;
}
