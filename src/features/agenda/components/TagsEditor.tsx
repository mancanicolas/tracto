import * as Popover from "@radix-ui/react-popover";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Tag } from "@/components/ui/Tag";
import type { Label, LabelColor } from "@/lib/labels";
import { NewLabelForm } from "./NewLabelForm";

interface TagsEditorProps {
  labels: Label[];
  appliedIds: string[];
  onApply: (labelId: string) => void;
  onRemove: (labelId: string) => void;
  onCreate: (nombre: string, color: LabelColor) => void;
}

export function TagsEditor({ labels, appliedIds, onApply, onRemove, onCreate }: TagsEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const applied = appliedIds
    .map((id) => labels.find((label) => label.id === id))
    .filter((label): label is Label => label !== undefined);
  const available = labels.filter((label) => !appliedIds.includes(label.id));

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) setIsCreating(false);
  };

  const close = () => handleOpenChange(false);

  return (
    <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Etiquetas">
      {applied.length === 0 ? <span className="text-xs text-fg-muted">Sin etiquetas</span> : null}
      {applied.map((label) => (
        <Tag key={label.id} name={label.nombre} color={label.color} onRemove={() => onRemove(label.id)} />
      ))}
      <Popover.Root open={isOpen} onOpenChange={handleOpenChange}>
        <Popover.Trigger asChild>
          <button
            type="button"
            aria-label="Agregar etiqueta"
            title="Agregar etiqueta"
            className="inline-flex size-5 items-center justify-center rounded-xs border border-line text-fg-secondary transition-colors duration-100 hover:border-line-strong hover:text-fg motion-reduce:transition-none"
          >
            <Plus className="size-3" strokeWidth={1.75} aria-hidden />
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            align="start"
            sideOffset={6}
            className="z-20 w-64 rounded-md bg-overlay shadow-[var(--shadow-popover)]"
          >
            {isCreating ? (
              <NewLabelForm
                existingNames={labels.map((label) => label.nombre)}
                onCancel={() => setIsCreating(false)}
                onCreate={(nombre, color) => {
                  onCreate(nombre, color);
                  close();
                }}
              />
            ) : (
              <div className="flex flex-col p-1">
                {available.length === 0 ? (
                  <p className="px-2 py-1.5 text-xs text-fg-muted">No quedan etiquetas guardadas por agregar.</p>
                ) : (
                  <ul aria-label="Etiquetas guardadas" className="flex max-h-48 flex-col overflow-y-auto">
                    {available.map((label) => (
                      <li key={label.id}>
                        <button
                          type="button"
                          onClick={() => {
                            onApply(label.id);
                            close();
                          }}
                          className="flex h-8 w-full items-center rounded-sm px-2 transition-colors duration-100 hover:bg-raised motion-reduce:transition-none"
                        >
                          <Tag name={label.nombre} color={label.color} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <button
                  type="button"
                  onClick={() => setIsCreating(true)}
                  className="mt-1 flex h-8 w-full items-center gap-1.5 rounded-sm border-t border-line-subtle px-2 text-[13px] text-fg-secondary transition-colors duration-100 hover:bg-raised hover:text-fg motion-reduce:transition-none"
                >
                  <Plus className="size-4" strokeWidth={1.75} aria-hidden />
                  Nueva etiqueta
                </button>
              </div>
            )}
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}
