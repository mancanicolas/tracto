import { STATUS, TONE_CLASSES, statusLabel, type AccountStatus } from "@/lib/status";
import { cn } from "@/lib/cn";

interface StatusBadgeProps {
  status: AccountStatus;
  param?: string | number;
}

export function StatusBadge({ status, param }: StatusBadgeProps) {
  const { tone, icon: Icon } = STATUS[status];
  const label = statusLabel(status, param);
  return (
    <span
      className={cn(
        "inline-flex h-5 shrink-0 items-center gap-1 rounded-xs px-1.5 text-[11px] leading-4 font-medium",
        TONE_CLASSES[tone],
      )}
    >
      <Icon className="size-3.5" strokeWidth={1.75} aria-hidden />
      {label}
    </span>
  );
}
