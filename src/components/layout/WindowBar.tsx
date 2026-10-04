import { getCurrentWindow } from "@tauri-apps/api/window";
import { Minus, X } from "lucide-react";
import type { ReactNode } from "react";
import { IconButton } from "@/components/ui/IconButton";
import { cn } from "@/lib/cn";

interface WindowBarProps {
  leading?: ReactNode;
  actions?: ReactNode;
  bordered?: boolean;
}

export function WindowBar({ leading, actions, bordered = false }: WindowBarProps) {
  return (
    <header
      data-tauri-drag-region
      className={cn("flex h-11 shrink-0 items-center gap-2 px-3", bordered && "border-b border-line-subtle")}
    >
      <div className="pointer-events-none flex min-w-0 flex-1 items-center gap-2">{leading}</div>
      <div className="flex items-center gap-0.5">
        {actions}
        <IconButton label="Minimizar" onClick={() => void getCurrentWindow().minimize()}>
          <Minus strokeWidth={1.75} />
        </IconButton>
        <IconButton label="Cerrar" onClick={() => void getCurrentWindow().close()}>
          <X strokeWidth={1.75} />
        </IconButton>
      </div>
    </header>
  );
}
