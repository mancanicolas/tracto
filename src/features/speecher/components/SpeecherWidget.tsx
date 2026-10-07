import { LogicalSize } from "@tauri-apps/api/dpi";
import { emitTo } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { PictureInPicture2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Isotype from "@/assets/isotype.svg?react";
import { IconButton } from "@/components/ui/IconButton";
import {
  FOLD_DELAY_MS,
  FOLDED_SIZE,
  MAIN_WINDOW_LABEL,
  SPEECHER_DOCK_EVENT,
  WIDGET_HEIGHT,
  WIDGET_WIDTH,
} from "../windowConfig";
import { SpeecherPanel } from "./SpeecherPanel";

function resizeWindow(width: number, height: number): void {
  void getCurrentWindow()
    .setSize(new LogicalSize(width, height))
    .catch(() => undefined);
}

export function SpeecherWidget() {
  const [isFolded, setIsFolded] = useState(false);
  const foldTimerRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);

  const cancelFold = () => {
    if (foldTimerRef.current !== null) window.clearTimeout(foldTimerRef.current);
    foldTimerRef.current = null;
  };

  useEffect(() => cancelFold, []);

  const handleMouseEnter = () => {
    cancelFold();
    isDraggingRef.current = false;
    if (!isFolded) return;
    resizeWindow(WIDGET_WIDTH, WIDGET_HEIGHT);
    setIsFolded(false);
  };

  const handleMouseLeave = () => {
    if (isDraggingRef.current || isFolded) return;
    cancelFold();
    foldTimerRef.current = window.setTimeout(() => {
      foldTimerRef.current = null;
      setIsFolded(true);
      resizeWindow(FOLDED_SIZE, FOLDED_SIZE);
    }, FOLD_DELAY_MS);
  };

  const dock = async () => {
    try {
      await emitTo(MAIN_WINDOW_LABEL, SPEECHER_DOCK_EVENT);
    } catch {
      return;
    }
    await getCurrentWindow()
      .close()
      .catch(() => undefined);
  };

  const closeWidget = () => {
    void getCurrentWindow()
      .close()
      .catch(() => undefined);
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={() => {
        isDraggingRef.current = false;
      }}
      className="h-full w-full overflow-hidden rounded-lg border border-line-strong bg-surface"
    >
      {isFolded ? (
        <div data-tauri-drag-region className="flex size-full items-center justify-center bg-surface">
          <Isotype className="pointer-events-none h-6 w-auto text-brand-white" role="img" aria-label="Speecher" />
        </div>
      ) : (
        <section aria-label="Speecher" className="flex h-full flex-col">
          <div
            data-tauri-drag-region
            onPointerDown={() => {
              isDraggingRef.current = true;
            }}
            className="flex h-11 shrink-0 items-center justify-between border-b border-line-subtle px-3"
          >
            <h2 className="pointer-events-none text-sm leading-5 font-semibold text-fg">Speecher</h2>
            <div className="flex items-center gap-0.5">
              <IconButton label="Acoplar Speecher a la app" onClick={() => void dock()}>
                <PictureInPicture2 strokeWidth={1.75} />
              </IconButton>
              <IconButton label="Cerrar Speecher" onClick={closeWidget}>
                <X strokeWidth={1.75} />
              </IconButton>
            </div>
          </div>
          <SpeecherPanel />
        </section>
      )}
    </div>
  );
}
