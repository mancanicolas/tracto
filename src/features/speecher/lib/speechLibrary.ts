import { DEFAULT_SPEECH, SOFT_SPEECH, type SpeechTexts } from "./speechDefaults";
import { libraryStore, softSpeechStore, speechStore, useStore } from "./speechStore";

export const DEFAULT_SPEECH_ID = "default";
export const SOFT_SPEECH_ID = "suave";
export const MAX_SPEECH_NAME_LENGTH = 50;

export interface SpeechEntry {
  id: string;
  name: string;
  texts: SpeechTexts;
  original: SpeechTexts | null;
  isBuiltin: boolean;
}

export interface SavedSpeech {
  id: string;
  name: string;
  texts: SpeechTexts;
}

const BUILTINS = [
  { id: DEFAULT_SPEECH_ID, name: "Speech normal", original: DEFAULT_SPEECH, store: speechStore },
  { id: SOFT_SPEECH_ID, name: "Speech suave", original: SOFT_SPEECH, store: softSpeechStore },
];

export const BASE_OPTIONS = BUILTINS.map(({ id, name }) => ({ value: id, label: name }));

function buildEntries(customs: SavedSpeech[]): SpeechEntry[] {
  return [
    ...BUILTINS.map(
      ({ id, name, original, store }): SpeechEntry => ({
        id,
        name,
        texts: { ...original, ...store.get() },
        original,
        isBuiltin: true,
      }),
    ),
    ...customs.map((speech): SpeechEntry => ({
      ...speech,
      texts: { ...DEFAULT_SPEECH, ...speech.texts },
      original: null,
      isBuiltin: false,
    })),
  ];
}

function resolveActive(entries: SpeechEntry[], activeId: string): SpeechEntry {
  return entries.find((entry) => entry.id === activeId) ?? entries[0]!;
}

export function getActiveSpeech(): SpeechEntry {
  const { speeches, activeId } = libraryStore.get();
  return resolveActive(buildEntries(speeches), activeId);
}

export function useSpeeches() {
  const library = useStore(libraryStore);
  useStore(speechStore);
  useStore(softSpeechStore);
  const entries = buildEntries(library.speeches);
  return { entries, active: resolveActive(entries, library.activeId) };
}

export function selectSpeech(id: string) {
  libraryStore.set({ activeId: id });
}

export function nameExists(name: string, exceptId?: string): boolean {
  const folded = name.trim().toLowerCase();
  if (BUILTINS.some((builtin) => builtin.id !== exceptId && builtin.name.toLowerCase() === folded)) return true;
  return libraryStore.get().speeches.some((speech) => speech.id !== exceptId && speech.name.toLowerCase() === folded);
}

export function createSpeech(rawName: string, baseId: string): string | null {
  const name = rawName.trim().slice(0, MAX_SPEECH_NAME_LENGTH);
  if (!name || nameExists(name)) return null;
  const id = crypto.randomUUID();
  const base = BUILTINS.find((builtin) => builtin.id === baseId) ?? BUILTINS[0]!;
  libraryStore.set({
    speeches: [...libraryStore.get().speeches, { id, name, texts: { ...base.original } }],
    activeId: id,
  });
  return id;
}

export function saveSpeech(id: string, texts: SpeechTexts, rawName?: string): string | null {
  const builtin = BUILTINS.find((item) => item.id === id);
  if (builtin) {
    builtin.store.set(texts);
    return null;
  }
  const name = (rawName ?? "").trim().slice(0, MAX_SPEECH_NAME_LENGTH);
  if (!name) return "Ingresá un nombre para el speech.";
  if (nameExists(name, id)) return "Ya existe un speech con ese nombre.";
  libraryStore.set({
    speeches: libraryStore.get().speeches.map((speech) => (speech.id === id ? { ...speech, name, texts } : speech)),
  });
  return null;
}

export function restoreBuiltinSpeech(id: string) {
  BUILTINS.find((builtin) => builtin.id === id)?.store.reset();
}

export function deleteSpeech(id: string) {
  if (BUILTINS.some((builtin) => builtin.id === id)) return;
  const { speeches, activeId } = libraryStore.get();
  libraryStore.set({
    speeches: speeches.filter((speech) => speech.id !== id),
    activeId: activeId === id ? DEFAULT_SPEECH_ID : activeId,
  });
}
