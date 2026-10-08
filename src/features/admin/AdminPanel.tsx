import { X } from "lucide-react";
import { useEffect, useRef, type KeyboardEvent } from "react";
import { IconButton } from "@/components/ui/IconButton";
import { EntitiesAdmin } from "./entities/EntitiesAdmin";

export const ADMIN_PANEL_ID = "admin-panel";

interface AdminPanelProps {
  onClose: () => void;
}

export function AdminPanel({ onClose }: AdminPanelProps) {
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Escape" || event.defaultPrevented) return;
    event.stopPropagation();
    onClose();
  };

  return (
    <section
      id={ADMIN_PANEL_ID}
      ref={panelRef}
      tabIndex={-1}
      aria-label="Administración"
      onKeyDown={handleKeyDown}
      className="absolute inset-0 z-40 flex flex-col bg-surface focus-visible:outline-none"
    >
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-line-subtle px-3">
        <div className="flex items-baseline gap-3">
          <h2 className="text-sm leading-5 font-semibold text-fg">Administración</h2>
          <p className="text-xs text-fg-muted">Los cambios se aplican a todos los usuarios.</p>
        </div>
        <IconButton label="Cerrar administración" onClick={onClose}>
          <X strokeWidth={1.75} />
        </IconButton>
      </div>
      <div role="tablist" aria-label="Secciones" className="flex h-8 shrink-0 border-b border-line-subtle">
        <button
          type="button"
          role="tab"
          aria-selected
          className="px-4 text-[13px] text-fg shadow-[inset_0_-2px_0_var(--accent)]"
        >
          Entidades y medios de pago
        </button>
      </div>
      <EntitiesAdmin />
    </section>
  );
}
