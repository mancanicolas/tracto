import { check, type Update } from "@tauri-apps/plugin-updater";
import { useCallback, useEffect, useRef, useState } from "react";

export type UpdatePhase = "idle" | "checking" | "up_to_date" | "available" | "downloading" | "error";

export interface UpdateState {
  phase: UpdatePhase;
  version?: string;
  progress?: number;
}

const IDLE_STATE: UpdateState = { phase: "idle" };

export function useUpdater() {
  const [state, setState] = useState<UpdateState>(IDLE_STATE);
  const updateRef = useRef<Update | null>(null);

  const offerUpdate = useCallback((update: Update) => {
    updateRef.current = update;
    setState({ phase: "available", version: update.version });
  }, []);

  const checkNow = useCallback(async () => {
    setState({ phase: "checking" });
    try {
      const update = await check();
      if (update) offerUpdate(update);
      else setState({ phase: "up_to_date" });
    } catch {
      setState({ phase: "up_to_date" });
    }
  }, [offerUpdate]);

  useEffect(() => {
    let isActive = true;
    check()
      .then((update) => {
        if (isActive && update) offerUpdate(update);
      })
      .catch(() => undefined);
    return () => {
      isActive = false;
    };
  }, [offerUpdate]);

  const installUpdate = useCallback(async () => {
    const update = updateRef.current;
    if (!update) return;
    let totalBytes = 0;
    let receivedBytes = 0;
    setState({ phase: "downloading", version: update.version, progress: 0 });
    try {
      await update.downloadAndInstall((event) => {
        if (event.event === "Started") {
          totalBytes = event.data.contentLength ?? 0;
        } else if (event.event === "Progress") {
          receivedBytes += event.data.chunkLength;
          const progress = totalBytes > 0 ? Math.round((receivedBytes / totalBytes) * 100) : undefined;
          setState((current) => ({ ...current, progress }));
        }
      });
    } catch {
      setState({ phase: "error", version: update.version });
    }
  }, []);

  const dismiss = useCallback(() => setState(IDLE_STATE), []);

  return {
    state,
    checkNow: () => void checkNow(),
    installUpdate: () => void installUpdate(),
    dismiss,
  };
}
