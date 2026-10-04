import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface InfoValueProps {
  label: string;
  value: ReactNode | undefined;
  mono?: boolean;
  title?: string;
}

export function InfoValue({ label, value, mono = false, title }: InfoValueProps) {
  const isMissing = value === undefined || value === "";
  return (
    <div className="flex min-w-0 flex-col">
      <dt className="text-xs leading-4 text-fg-muted">{label}</dt>
      <dd
        title={isMissing ? undefined : title}
        className={cn(
          "truncate text-[13px] leading-5",
          isMissing ? "text-fg-muted" : "text-fg-secondary",
          mono && !isMissing && "font-mono tabular-nums",
        )}
      >
        {isMissing ? "Sin info" : value}
      </dd>
    </div>
  );
}
