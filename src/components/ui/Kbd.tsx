import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const TONES = {
  default: "bg-raised text-fg-secondary border-line",
  onAccent: "bg-fg-on-accent/10 text-fg-on-accent border-fg-on-accent/30",
} as const;

interface KbdProps {
  children: ReactNode;
  tone?: keyof typeof TONES;
}

export function Kbd({ children, tone = "default" }: KbdProps) {
  return (
    <kbd
      className={cn(
        "inline-flex h-4 items-center rounded-xs border px-1 font-mono text-[11px] leading-4 font-medium",
        TONES[tone],
      )}
    >
      {children}
    </kbd>
  );
}
