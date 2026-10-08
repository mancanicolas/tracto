import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { refreshCatalog } from "./catalogApi";

const REFRESH_DEBOUNCE_MS = 400;
const POLL_INTERVAL_MS = 120000;
const CHANNEL_NAME = "catalogo-global";
const WATCHED_TABLES = ["entidades", "metodos_pago"] as const;

export function useCatalogSync(): void {
  useEffect(() => {
    let debounceTimer: number | null = null;

    const refresh = () => void refreshCatalog();
    const refreshSoon = () => {
      if (debounceTimer !== null) window.clearTimeout(debounceTimer);
      debounceTimer = window.setTimeout(refresh, REFRESH_DEBOUNCE_MS);
    };

    refresh();
    let channel = supabase.channel(CHANNEL_NAME);
    for (const table of WATCHED_TABLES) {
      channel = channel.on("postgres_changes", { event: "*", schema: "public", table }, refreshSoon);
    }
    channel.subscribe();

    window.addEventListener("focus", refreshSoon);
    const interval = window.setInterval(refresh, POLL_INTERVAL_MS);

    return () => {
      if (debounceTimer !== null) window.clearTimeout(debounceTimer);
      window.clearInterval(interval);
      window.removeEventListener("focus", refreshSoon);
      void supabase.removeChannel(channel);
    };
  }, []);
}
