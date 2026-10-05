import { useCallback, useEffect, useRef, useState } from "react";
import { unlockAlarmSound, startAlarmSound } from "@/lib/alarmSound";
import { todayIso } from "@/lib/dates";
import { attractWindowAttention } from "@/lib/windowAttention";
import type { Case } from "@/lib/types";
import { findDueAlarms, loadFiredAlarmKeys, saveFiredAlarmKeys, type Alarm } from "./alarms";

const CHECK_INTERVAL_MS = 5000;

export function useAlarms(cases: Case[]) {
  const [ringing, setRinging] = useState<Alarm[]>([]);
  const casesRef = useRef(cases);
  const firedRef = useRef<Set<string> | null>(null);

  useEffect(() => {
    casesRef.current = cases;
  });

  useEffect(() => {
    const unlock = () => unlockAlarmSound();
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });

    const check = () => {
      firedRef.current ??= loadFiredAlarmKeys();
      const fired = firedRef.current;
      const now = new Date();
      const due = findDueAlarms(casesRef.current, todayIso(now), now).filter((alarm) => !fired.has(alarm.key));
      if (due.length === 0) return;
      due.forEach((alarm) => fired.add(alarm.key));
      saveFiredAlarmKeys(fired);
      setRinging((current) => [...current, ...due]);
      void attractWindowAttention();
    };

    const first = window.setTimeout(check, 0);
    const interval = window.setInterval(check, CHECK_INTERVAL_MS);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(interval);
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  const isRinging = ringing.length > 0;

  useEffect(() => {
    if (!isRinging) return;
    return startAlarmSound();
  }, [isRinging]);

  const dismissAlarm = useCallback((key: string) => {
    setRinging((current) => current.filter((alarm) => alarm.key !== key));
  }, []);

  return { ringing, dismissAlarm };
}
