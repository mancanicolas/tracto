import { useMemo } from "react";
import { DEFAULT_SPEECH, type SpeechTexts } from "./speechDefaults";
import { libraryStore, speechStore, useStore } from "./speechStore";

export const DEFAULT_SPEECH_ID = "default";
export const DEFAULT_SPEECH_NAME = "Por defecto";
export const MAX_SPEECH_NAME_LENGTH = 50;

export interface SpeechEntry {
  id: string;
  name: string;
  texts: SpeechTexts;
  isDefault: boolean;
}

export interface SavedSpeech {
  id: string;
  name: string;
  texts: SpeechTexts;
}

function buildEntries(customs: SavedSpeech[], defaultTexts: SpeechTexts): SpeechEntry[] {
  return [
    { id: DEFAULT_SPEECH_ID, name: DEFAULT_SPEECH_NAME, texts: { ...DEFAULT_SPEECH, ...defaultTexts }, isDefault: true },
    ...customs.map((speech) => ({ ...speech, texts: { ...DEFAULT_SPEECH, ...speech.texts }, isDefault: false })),
  ];
}

function resolveActive(entries: SpeechEntry[], activeId: string): SpeechEntry {
  return entries.find((entry) => entry.id === activeId) ?? entries[0]!;
}

export function getActiveSpeech(): SpeechEntry {
  const { speeches, activeId } = libraryStore.get();
  return resolveActive(buildEntries(speeches, speechStore.get()), activeId);
}

export function useSpeeches() {
  const library = useStore(libraryStore);
  const defaultTexts = useStore(speechStore);
  return useMemo(() => {
    const entries = buildEntries(library.speeches, defaultTexts);
    return { entries, active: resolveActive(entries, library.activeId) };
  }, [library, defaultTexts]);
}

export function selectSpeech(id: string) {
  libraryStore.set({ activeId: id });
}

export function nameExists(name: string, exceptId?: string): boolean {
  const folded = name.trim().toLowerCase();
  if (folded === DEFAULT_SPEECH_NAME.toLowerCase()) return exceptId !== DEFAULT_SPEECH_ID;
  return libraryStore.get().speeches.some((speech) => speech.id !== exceptId && speech.name.toLowerCase() === folded);
}

export function createSpeech(rawName: string): string | null {
  const name = rawName.trim().slice(0, MAX_SPEECH_NAME_LENGTH);
  if (!name || nameExists(name)) return null;
  const id = crypto.randomUUID();
  const base = getActiveSpeech().texts;
  libraryStore.set({ speeches: [...libraryStore.get().speeches, { id, name, texts: { ...base } }], activeId: id });
  return id;
}

export function saveSpeech(id: string, texts: SpeechTexts, rawName?: string): string | null {
  if (id === DEFAULT_SPEECH_ID) {
    speechStore.set(texts);
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

export function restoreDefaultSpeech() {
  speechStore.reset();
}

export function deleteSpeech(id: string) {
  if (id === DEFAULT_SPEECH_ID) return;
  const { speeches, activeId } = libraryStore.get();
  libraryStore.set({
    speeches: speeches.filter((speech) => speech.id !== id),
    activeId: activeId === id ? DEFAULT_SPEECH_ID : activeId,
  });
}
