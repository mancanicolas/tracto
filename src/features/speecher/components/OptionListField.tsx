import { Check, Minus, Plus, X } from "lucide-react";
import { useState, type KeyboardEvent } from "react";
import { IconButton } from "@/components/ui/IconButton";
import { SelectField } from "@/components/ui/SelectField";
import { cn } from "@/lib/cn";

const INPUT_CLASS =
  "h-8 rounded-sm border border-line bg-input text-[13px] text-fg transition-colors duration-100 placeholder:text-fg-muted hover:border-line-strong motion-reduce:transition-none";
const SQUARE_BUTTON_CLASS = "size-8 border border-line hover:border-line-strong";
const MAX_NAME_LENGTH = 60;

interface OptionListFieldProps {
  id: string;
  label: string;
  addLabel: string;
  saveLabel: string;
  removeLabel: string;
  namePlaceholder: string;
  items: string[];
  value: string;
  onSelect: (value: string) => void;
  onAdd: (name: string) => void;
  onRemove: () => void;
}

export function OptionListField({
  id,
  label,
  addLabel,
  saveLabel,
  removeLabel,
  namePlaceholder,
  items,
  value,
  onSelect,
  onAdd,
  onRemove,
}: OptionListFieldProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");

  const confirm = () => {
    onAdd(newName);
    setNewName("");
    setIsAdding(false);
  };

  const cancel = () => {
    setNewName("");
    setIsAdding(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      confirm();
    } else if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      cancel();
    }
  };

  const options = items.map((name) => ({ value: name, label: name }));

  if (isAdding) {
    return (
      <div className="flex items-end gap-1.5">
        <div className="min-w-0 flex-1">
          <label htmlFor={id} className="mb-1.5 block text-xs leading-4 font-medium text-fg-secondary">
            {addLabel}
          </label>
          <input
            id={id}
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={MAX_NAME_LENGTH}
            autoComplete="off"
            autoFocus
            placeholder={namePlaceholder}
            className={cn(INPUT_CLASS, "w-full px-2.5")}
          />
        </div>
        <IconButton label={saveLabel} onClick={confirm} className={SQUARE_BUTTON_CLASS}>
          <Check strokeWidth={1.75} />
        </IconButton>
        <IconButton label="Cancelar" onClick={cancel} className={SQUARE_BUTTON_CLASS}>
          <X strokeWidth={1.75} />
        </IconButton>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-1.5">
      <div className="min-w-0 flex-1">
        <SelectField
          label={label}
          options={options}
          placeholder={options.length === 0 ? "Agregá una con +" : undefined}
          value={value}
          onChange={(event) => onSelect(event.target.value)}
        />
      </div>
      <IconButton label={`Agregar ${label.toLowerCase()}`} onClick={() => setIsAdding(true)} className={SQUARE_BUTTON_CLASS}>
        <Plus strokeWidth={1.75} />
      </IconButton>
      <IconButton
        label={removeLabel}
        onClick={onRemove}
        disabled={options.length === 0}
        className={SQUARE_BUTTON_CLASS}
      >
        <Minus strokeWidth={1.75} />
      </IconButton>
    </div>
  );
}
