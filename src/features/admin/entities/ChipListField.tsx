import { Plus, X } from "lucide-react";
import { useId, useState, type KeyboardEvent } from "react";
import { IconButton } from "@/components/ui/IconButton";
import { foldName } from "@/constants/entidades";

interface ChipListFieldProps {
  label: string;
  items: string[];
  addPlaceholder: string;
  minItems?: number;
  onAdd: (value: string) => void;
  onRemove: (value: string) => void;
}

export function ChipListField({ label, items, addPlaceholder, minItems = 1, onAdd, onRemove }: ChipListFieldProps) {
  const inputId = useId();
  const [value, setValue] = useState("");

  const commit = () => {
    const name = value.trim();
    if (!name) return;
    if (!items.some((item) => foldName(item) === foldName(name))) onAdd(name);
    setValue("");
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    commit();
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-xs leading-4 font-medium text-fg-secondary">
        {label}
      </label>
      <div className="flex flex-wrap items-center gap-1.5">
        {items.map((item) => (
          <span
            key={item}
            className="inline-flex h-6 items-center gap-1 rounded-xs border border-line bg-raised pr-0.5 pl-2 text-xs text-fg"
          >
            {item}
            <IconButton
              label={`Quitar ${item}`}
              onClick={() => onRemove(item)}
              disabled={items.length <= minItems}
              className="size-5 [&_svg]:size-3.5"
            >
              <X strokeWidth={1.75} />
            </IconButton>
          </span>
        ))}
        <div className="flex items-center gap-1">
          <input
            id={inputId}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={40}
            autoComplete="off"
            placeholder={addPlaceholder}
            className="h-6 w-32 rounded-sm border border-line bg-input px-2 text-xs text-fg placeholder:text-fg-muted hover:border-line-strong"
          />
          <IconButton label={`Agregar a ${label.toLowerCase()}`} onClick={commit} className="size-6 border border-line">
            <Plus strokeWidth={1.75} />
          </IconButton>
        </div>
      </div>
    </div>
  );
}
