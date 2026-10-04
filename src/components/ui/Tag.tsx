import { X } from "lucide-react";

interface TagProps {
  label: string;
  onRemove?: () => void;
}

export function Tag({ label, onRemove }: TagProps) {
  return (
    <span className="inline-flex h-5 items-center gap-1 rounded-xs border border-accent-2-border bg-accent-2-subtle px-1.5 text-[11px] leading-4 font-medium text-accent-2">
      {label}
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Quitar etiqueta ${label}`}
          className="-mr-0.5 inline-flex size-3.5 items-center justify-center rounded-xs hover:bg-accent-2/20"
        >
          <X className="size-3" strokeWidth={1.75} aria-hidden />
        </button>
      ) : null}
    </span>
  );
}
