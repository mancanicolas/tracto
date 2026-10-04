import { useEffect, useRef } from "react";

export interface ShortcutOptions {
  allowInInput?: boolean;
  enabled?: boolean;
}

const SEQUENCE_TIMEOUT_MS = 1000;

const isMac = typeof navigator !== "undefined" && /mac/i.test(navigator.platform);

function isEditable(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName);
}

interface Chord {
  key: string;
  mod: boolean;
  shift: boolean;
  alt: boolean;
}

function parseChord(part: string): Chord {
  const tokens = part.split("+");
  const key = tokens.pop() ?? "";
  const mods = tokens.map((t) => t.toLowerCase());
  return {
    key,
    mod: mods.includes("mod"),
    shift: mods.includes("shift"),
    alt: mods.includes("alt"),
  };
}

function matches(chord: Chord, e: KeyboardEvent): boolean {
  const mod = isMac ? e.metaKey : e.ctrlKey;
  if (chord.mod !== mod) return false;
  if (chord.alt !== e.altKey) return false;
  if (chord.shift && !e.shiftKey) return false;
  return e.key.length === 1 ? e.key.toLowerCase() === chord.key.toLowerCase() : e.key === chord.key;
}

export function useShortcut(
  keys: string,
  handler: (event: KeyboardEvent) => void,
  { allowInInput = false, enabled = true }: ShortcutOptions = {},
): void {
  const handlerRef = useRef(handler);
  useEffect(() => {
    handlerRef.current = handler;
  });

  useEffect(() => {
    if (!enabled) return;
    const chords = keys.split(" ").map(parseChord);
    let progress = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const reset = () => {
      progress = 0;
      clearTimeout(timer);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || e.isComposing) return;
      if (["Shift", "Control", "Alt", "Meta"].includes(e.key)) return;

      const first = chords[0];
      const hasModifier = Boolean(first?.mod || first?.alt);
      const alwaysAllowed = hasModifier || first?.key === "Escape" || first?.key === "Enter";
      if (isEditable(e.target) && !allowInInput && !alwaysAllowed) {
        reset();
        return;
      }

      const expected = chords[progress];
      if (expected && matches(expected, e)) {
        progress += 1;
        if (progress === chords.length) {
          reset();
          e.preventDefault();
          handlerRef.current(e);
        } else {
          clearTimeout(timer);
          timer = setTimeout(reset, SEQUENCE_TIMEOUT_MS);
        }
      } else {
        reset();
        if (first && chords.length > 1 && matches(first, e)) {
          progress = 1;
          timer = setTimeout(reset, SEQUENCE_TIMEOUT_MS);
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      reset();
    };
  }, [keys, allowInInput, enabled]);
}

export const MOD_LABEL = isMac ? "⌘" : "Ctrl";
