import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

const PING_INTERVAL_MS = 300000;
const MIN_PING_GAP_MS = 60000;

export function useActivityPing(): void {
  useEffect(() => {
    let lastPingAt = 0;

    const ping = () => {
      const now = Date.now();
      if (now - lastPingAt < MIN_PING_GAP_MS) return;
      lastPingAt = now;
      void supabase.rpc("registrar_actividad").then(() => undefined);
    };

    ping();
    window.addEventListener("focus", ping);
    const interval = window.setInterval(ping, PING_INTERVAL_MS);

    return () => {
      window.removeEventListener("focus", ping);
      window.clearInterval(interval);
    };
  }, []);
}
