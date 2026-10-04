import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { LABEL_COLOR_META, type LabelColor } from "@/lib/labels";

interface TagProps {
  name: string;
  color: LabelColor;
  onRemove?: () => void;
}

export function Tag({ name, color, onRemove }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex h-5 max-w-full items-center gap-1 rounded-xs border px-1.5 text-[11px] leading-4 font-medium",
        LABEL_COLOR_META[color].chip,
      )}
    >
      <span className="truncate">{name}</span>
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Quitar etiqueta ${name}`}
          className="-mr-0.5 inline-flex size-3.5 shrink-0 items-center justify-center rounded-xs hover:bg-fg/10"
        >
          <X className="size-3" strokeWidth={1.75} aria-hidden />
        </button>
      ) : null}
    </span>
  );
}
