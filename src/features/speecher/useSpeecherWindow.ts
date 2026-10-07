import { listen } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  SPEECHER_DOCK_EVENT,
  SPEECHER_WINDOW_LABEL,
  SPEECHER_WINDOW_QUERY_KEY,
  WIDGET_HEIGHT,
  WIDGET_MARGIN_RIGHT,
  WIDGET_OFFSET_TOP,
  WIDGET_WIDTH,
} from "./windowConfig";

async function resolveWidgetPosition(): Promise<{ x: number; y: number } | null> {
  try {
    const mainWindow = getCurrentWindow();
    const [position, size, scale] = await Promise.all([
      mainWindow.outerPosition(),
      mainWindow.outerSize(),
      mainWindow.scaleFactor(),
    ]);
    return {
      x: Math.max(0, (position.x + size.width) / scale - WIDGET_WIDTH - WIDGET_MARGIN_RIGHT),
      y: Math.max(0, position.y / scale + WIDGET_OFFSET_TOP),
    };
  } catch {
    return null;
  }
}

function waitForCreation(widget: WebviewWindow): Promise<boolean> {
  return new Promise((resolve) => {
    void widget.once("tauri://created", () => resolve(true));
    void widget.once("tauri://error", () => resolve(false));
  });
}

export function useSpeecherWindow(onDocked: () => void) {
  const [isPoppedOut, setIsPoppedOut] = useState(false);
  const onDockedRef = useRef(onDocked);

  useEffect(() => {
    onDockedRef.current = onDocked;
  });

  useEffect(() => {
    let isActive = true;
    let stopListening: (() => void) | undefined;
    listen(SPEECHER_DOCK_EVENT, () => {
      setIsPoppedOut(false);
      onDockedRef.current();
    })
      .then((unlisten) => {
        if (isActive) stopListening = unlisten;
        else unlisten();
      })
      .catch(() => undefined);
    return () => {
      isActive = false;
      stopListening?.();
    };
  }, []);

  const popOut = useCallback(async (): Promise<boolean> => {
    try {
      const position = await resolveWidgetPosition();
      const widget = new WebviewWindow(SPEECHER_WINDOW_LABEL, {
        url: `index.html?${SPEECHER_WINDOW_QUERY_KEY}=${SPEECHER_WINDOW_LABEL}`,
        title: "Speecher",
        width: WIDGET_WIDTH,
        height: WIDGET_HEIGHT,
        ...(position ?? { center: true }),
        alwaysOnTop: true,
        decorations: false,
        transparent: true,
        skipTaskbar: true,
        resizable: false,
        shadow: false,
        focus: true,
      });
      const created = await waitForCreation(widget);
      if (!created) return false;
      void widget.once("tauri://destroyed", () => setIsPoppedOut(false));
      setIsPoppedOut(true);
      return true;
    } catch {
      return false;
    }
  }, []);

  const focusWidget = useCallback(async () => {
    try {
      const widget = await WebviewWindow.getByLabel(SPEECHER_WINDOW_LABEL);
      await widget?.setFocus();
    } catch {
      return;
    }
  }, []);

  return { isPoppedOut, popOut, focusWidget };
}

