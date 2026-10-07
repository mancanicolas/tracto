import { ExternalLink, X } from "lucide-react";
import type { KeyboardEvent } from "react";
import { IconButton } from "@/components/ui/IconButton";
import { cn } from "@/lib/cn";
import { SpeecherPanel } from "./SpeecherPanel";

export const SPEECHER_DRAWER_ID = "speecher-drawer";

interface SpeecherDrawerProps {
  open: boolean;
  onClose: () => void;
  onPopOut: () => void;
}

export function SpeecherDrawer({ open, onClose, onPopOut }: SpeecherDrawerProps) {
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
        <div className="flex items-center gap-0.5">
          <IconButton label="Desacoplar Speecher en una ventana flotante" onClick={onPopOut}>
            <ExternalLink strokeWidth={1.75} />
          </IconButton>
          <IconButton label="Cerrar Speecher" onClick={onClose}>
            <X strokeWidth={1.75} />
          </IconButton>
        </div>
      </div>
      <SpeecherPanel />
    </aside>
  );
}
