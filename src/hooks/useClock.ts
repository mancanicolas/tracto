import { useEffect, useState } from "react";

const DEFAULT_TICK_MS = 30000;

export function useClock(tickMs: number = DEFAULT_TICK_MS): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), tickMs);
    return () => window.clearInterval(interval);
  }, [tickMs]);

  return now;
}
