import { Plus } from "lucide-react";
import { useState } from "react";
import { Tag } from "@/components/ui/Tag";
import { ETIQUETAS, type Etiqueta } from "@/lib/mock";

interface TagsEditorProps {
  tags: Etiqueta[];
  onAdd: (tag: Etiqueta) => void;
  onRemove: (tag: Etiqueta) => void;
}

export function TagsEditor({ tags, onAdd, onRemove }: TagsEditorProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const available = ETIQUETAS.filter((tag) => !tags.includes(tag));

  return (
    <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Etiquetas">
      {tags.length === 0 ? <span className="text-xs text-fg-muted">Sin etiquetas</span> : null}
      {tags.map((tag) => (
        <Tag key={tag} label={tag} onRemove={() => onRemove(tag)} />
      ))}
      {available.length > 0 ? (
        <button
          type="button"
          aria-expanded={isPickerOpen}
          onClick={() => setIsPickerOpen((open) => !open)}
          className="inline-flex h-5 items-center gap-1 rounded-xs border border-line px-1.5 text-[11px] leading-4 font-medium text-fg-secondary transition-colors duration-100 hover:border-line-strong hover:text-fg motion-reduce:transition-none"
        >
          <Plus className="size-3" strokeWidth={1.75} aria-hidden />
          Etiqueta
        </button>
      ) : null}
      {isPickerOpen
        ? available.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => {
                onAdd(tag);
                setIsPickerOpen(false);
              }}
              className="inline-flex h-5 items-center rounded-xs border border-dashed border-accent-2-border px-1.5 text-[11px] leading-4 font-medium text-accent-2 transition-colors duration-100 hover:bg-accent-2-subtle motion-reduce:transition-none"
            >
              {tag}
            </button>
          ))
        : null}
    </div>
  );
}
