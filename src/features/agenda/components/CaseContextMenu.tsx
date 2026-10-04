import { Archive, ArchiveRestore, Trash2 } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/cn";

export interface ContextMenuTarget {
  dni: string;
  x: number;
  y: number;
  isArchived: boolean;
}

interface CaseContextMenuProps {
  target: ContextMenuTarget;
  onArchive: () => void;
  onDelete: () => void;
  onClose: () => void;
}

const VIEWPORT_MARGIN = 4;

const ITEM_CLASS =
  "flex h-8 w-full items-center gap-2 rounded-sm px-2 text-left text-[13px] transition-colors duration-100 motion-reduce:transition-none";

export function CaseContextMenu({ target, onArchive, onDelete, onClose }: CaseContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ left: target.x, top: target.y });

  useLayoutEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;
    const { width, height } = menu.getBoundingClientRect();
    setPosition({
      left: Math.max(VIEWPORT_MARGIN, Math.min(target.x, window.innerWidth - width - VIEWPORT_MARGIN)),
      top: Math.max(VIEWPORT_MARGIN, Math.min(target.y, window.innerHeight - height - VIEWPORT_MARGIN)),
    });
    menu.querySelector<HTMLElement>("[role=menuitem]")?.focus();
  }, [target.x, target.y]);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) onClose();
    };
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      onClose();
    };
    window.addEventListener("pointerdown", handlePointerDown, true);
    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("blur", onClose);
    window.addEventListener("resize", onClose);
    window.addEventListener("wheel", onClose, true);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown, true);
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("blur", onClose);
      window.removeEventListener("resize", onClose);
      window.removeEventListener("wheel", onClose, true);
    };
  }, [onClose]);

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("[role=menuitem]"));
    const index = items.indexOf(document.activeElement as HTMLElement);
    const step = event.key === "ArrowDown" ? 1 : -1;
    items[(index + step + items.length) % items.length]?.focus();
  };

  const ArchiveIcon = target.isArchived ? ArchiveRestore : Archive;

  return (
    <div
      ref={menuRef}
      role="menu"
      aria-label="Acciones del caso"
      onKeyDown={handleMenuKeyDown}
      onContextMenu={(event) => event.preventDefault()}
      style={position}
      className="fixed z-40 w-44 rounded-md bg-overlay p-1 shadow-[var(--shadow-popover)]"
    >
      <button
        type="button"
        role="menuitem"
        onClick={onArchive}
        className={cn(ITEM_CLASS, "text-fg-secondary hover:bg-raised hover:text-fg focus-visible:bg-raised focus-visible:text-fg")}
      >
        <ArchiveIcon className="size-4" strokeWidth={1.75} aria-hidden />
        {target.isArchived ? "Desarchivar caso" : "Archivar caso"}
      </button>
      <button
        type="button"
        role="menuitem"
        onClick={onDelete}
        className={cn(ITEM_CLASS, "text-danger hover:bg-danger-subtle focus-visible:bg-danger-subtle")}
      >
        <Trash2 className="size-4" strokeWidth={1.75} aria-hidden />
        Eliminar caso
      </button>
    </div>
  );
}
