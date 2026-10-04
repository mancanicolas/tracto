import { cn } from "@/lib/cn";
import { STATUS, TONE_CLASSES, type AccountStatus } from "@/lib/status";

interface StatusBadgeProps {
  status: AccountStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { tone, icon: Icon, label } = STATUS[status];
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
