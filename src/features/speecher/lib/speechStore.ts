import { useSyncExternalStore } from "react";
import type { Ficha } from "./parser";
import type { SavedSpeech } from "./speechLibrary";
import { DEFAULT_SPEECH, type SpeechTexts } from "./speechDefaults";

interface LocalStore<T> {
  get: () => T;
  set: (patch: Partial<T>) => void;
  reset: () => void;
  subscribe: (listener: () => void) => () => void;
}

function createLocalStore<T extends object>(key: string, fallback: T): LocalStore<T> {
  const listeners = new Set<() => void>();
  let cachedRaw: string | null | undefined;
  let cachedValue = fallback;

  const readRaw = (): string | null => {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  };

  const get = (): T => {
    const raw = readRaw();
    if (raw === cachedRaw) return cachedValue;
    cachedRaw = raw;
    try {
      cachedValue = raw ? { ...fallback, ...(JSON.parse(raw) as Partial<T>) } : fallback;
    } catch {
      cachedValue = fallback;
    }
    return cachedValue;
  };

  const notify = () => listeners.forEach((listener) => listener());

  return {
    get,
    set: (patch) => {
      try {
        window.localStorage.setItem(key, JSON.stringify({ ...get(), ...patch }));
      } catch {
        return;
      }
      notify();
    },
    reset: () => {
      try {
        window.localStorage.removeItem(key);
      } catch {
        return;
      }
      notify();
    },
    subscribe: (listener) => {
      listeners.add(listener);
      const onStorage = (event: StorageEvent) => {
        if (event.key === key || event.key === null) listener();
      };
      window.addEventListener("storage", onStorage);
      return () => {
        listeners.delete(listener);
        window.removeEventListener("storage", onStorage);
      };
    },
  };
}

export interface SpeecherConfig {
  carteras: string[];
  cartera: string;
  operador: string;
  interno: string;
  carpeta: string;
  sobrescribir: boolean;
  lastGeneratedPdfPath: string;
}

export interface FichaState {
  ficha: Ficha | null;
}

export const configStore = createLocalStore<SpeecherConfig>("tracto.speecher.config", {
  carteras: [],
  cartera: "",
  operador: "",
  interno: "",
  carpeta: "",
  sobrescribir: true,
  lastGeneratedPdfPath: "",
});

export const speechStore = createLocalStore<SpeechTexts>("tracto.speecher.speech", DEFAULT_SPEECH);

export const libraryStore = createLocalStore<{ speeches: SavedSpeech[]; activeId: string }>(
  "tracto.speecher.library",
  { speeches: [], activeId: "default" },
);

export const fichaStore = createLocalStore<FichaState>("tracto.speecher.ficha", { ficha: null });

export function useStore<T>(store: LocalStore<T>): T {
  return useSyncExternalStore(store.subscribe, store.get);
}
