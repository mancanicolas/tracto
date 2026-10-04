import type { RefObject } from "react";
import { useShortcut } from "@/lib/shortcuts";

export function useSubmitShortcut(formRef: RefObject<HTMLFormElement | null>): void {
  useShortcut("mod+Enter", () => formRef.current?.requestSubmit(), { allowInInput: true });
}
