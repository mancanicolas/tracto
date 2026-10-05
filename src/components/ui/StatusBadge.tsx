import { CircleAlert } from "lucide-react";
import { cn } from "@/lib/cn";
import { STATUS, TONE_CLASSES, type AccountStatus } from "@/lib/status";

interface StatusBadgeProps {
  status: AccountStatus;
  overdue?: boolean;
}

export function StatusBadge({ status, overdue = false }: StatusBadgeProps) {
  const { icon: Icon, label } = STATUS[status];
  const isOverdue = overdue && (status === "acuerdo" || status === "acuerdo colchon");
  const tone = isOverdue ? "warning" : STATUS[status].tone;
  return (
    <span
      title={isOverdue ? "Cuota vencida sin pagar" : undefined}
      className={cn(
        "inline-flex h-5 shrink-0 items-center gap-1 rounded-xs px-1.5 text-[11px] leading-4 font-medium",
        TONE_CLASSES[tone],
      )}
    >
      <Icon className="size-3.5" strokeWidth={1.75} aria-hidden />
      {label}
      {isOverdue ? (
        <>
          <CircleAlert className="size-3.5" strokeWidth={1.75} aria-hidden />
          <span className="sr-only">con cuota vencida</span>
        </>
      ) : null}
    </span>
  );
}
