import { formatTime } from "@/lib/format";
import type { Case } from "@/lib/types";

export interface Alarm {
  key: string;
  dni: string;
  nombre?: string;
  motivo: string;
  hora: string;
}

const FIRED_STORAGE_KEY = "tracto.alarms.fired";
const MAX_STORED_KEYS = 300;

export function findDueAlarms(cases: Case[], today: string, now: Date): Alarm[] {
  const currentTime = formatTime(now);
  return cases.flatMap((account): Alarm[] => {
    const { agendado_para: date, agendado_hora: time } = account;
    if (!date || !time || account.agendado_resuelto || account.archivado) return [];
    if (date !== today || time > currentTime) return [];
    return [
      {
        key: `${account.dni}|${date}|${time}`,
        dni: account.dni,
        nombre: account.nombre,
        motivo: account.agendado_motivo ?? "",
        hora: time,
      },
    ];
  });
}

export function loadFiredAlarmKeys(): Set<string> {
  try {
    const raw = window.localStorage.getItem(FIRED_STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : []);
  } catch {
    return new Set();
  }
}

export function saveFiredAlarmKeys(keys: Set<string>): void {
  try {
    window.localStorage.setItem(FIRED_STORAGE_KEY, JSON.stringify([...keys].slice(-MAX_STORED_KEYS)));
  } catch {
    return;
  }
}
