import { ClipboardPaste, Copy, Download, Minus, Plus, X } from "lucide-react";
import type { KeyboardEvent } from "react";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { SelectField } from "@/components/ui/SelectField";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { ENTIDAD_NAMES } from "@/constants/entidades";
import { cn } from "@/lib/cn";

export const SPEECHER_DRAWER_ID = "speecher-drawer";

interface SpeecherDrawerProps {
  open: boolean;
  onClose: () => void;
}

const INPUT_CLASS =
  "h-8 rounded-sm border border-line bg-input text-[13px] text-fg transition-colors duration-100 placeholder:text-fg-muted hover:border-line-strong motion-reduce:transition-none";

const PORTFOLIO_OPTIONS = ENTIDAD_NAMES.map((name) => ({ value: name, label: name }));

export function SpeecherDrawer({ open, onClose }: SpeecherDrawerProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Escape") return;
    event.stopPropagation();
    onClose();
  };

  return (
    <aside
      id={SPEECHER_DRAWER_ID}
      aria-label="Speecher"
      aria-hidden={!open}
      inert={!open}
      onKeyDown={handleKeyDown}
      className={cn(
        "absolute inset-y-0 right-0 z-30 flex w-72 max-w-full flex-col border-l border-line bg-surface shadow-[var(--shadow-popover)]",
        "transition-transform duration-150 motion-reduce:transition-none",
        open ? "translate-x-0" : "translate-x-full",
      )}
    >
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-line-subtle px-3">
        <h2 className="text-sm leading-5 font-semibold text-fg">Speecher</h2>
        <IconButton label="Cerrar Speecher" onClick={onClose}>
          <X strokeWidth={1.75} />
        </IconButton>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3">
        <div className="flex items-end gap-1.5">
          <div className="min-w-0 flex-1">
            <SelectField label="Cartera" options={PORTFOLIO_OPTIONS} placeholder="Elegí una cartera" defaultValue="" />
          </div>
          <IconButton label="Agregar cartera" className="size-8 border border-line hover:border-line-strong">
            <Plus strokeWidth={1.75} />
          </IconButton>
          <IconButton label="Quitar cartera" className="size-8 border border-line hover:border-line-strong">
            <Minus strokeWidth={1.75} />
          </IconButton>
        </div>

        <div role="group" aria-labelledby="speecher-operator-label" className="flex flex-col gap-1.5">
          <span id="speecher-operator-label" className="text-xs leading-4 font-medium text-fg-secondary">
            Operador · Interno
          </span>
          <div className="flex gap-1.5">
            <div className="relative min-w-0 flex-1">
              <WhatsAppIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-fg-muted" />
              <input
                type="tel"
                inputMode="tel"
                autoComplete="off"
                aria-label="Número de WhatsApp del operador"
                placeholder="11 1234 5678"
                className={cn(INPUT_CLASS, "w-full pr-2.5 pl-8 font-mono tabular-nums")}
              />
            </div>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="off"
              aria-label="Interno"
              placeholder="Interno"
              className={cn(INPUT_CLASS, "w-20 shrink-0 px-2.5 text-center font-mono tabular-nums")}
            />
          </div>
        </div>

        <Button className="w-full">
          <ClipboardPaste className="size-4" strokeWidth={1.75} aria-hidden />
          Pegar
        </Button>
      </div>

      <div className="flex shrink-0 flex-col gap-2 border-t border-line-subtle p-3">
        <Button variant="primary" className="w-full">
          <Copy className="size-4" strokeWidth={1.75} aria-hidden />
          Copiar speech
        </Button>
        <Button className="w-full">
          <Download className="size-4" strokeWidth={1.75} aria-hidden />
          Descargar speech
        </Button>
      </div>
    </aside>
  );
}
