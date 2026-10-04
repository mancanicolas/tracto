import { getCurrentWindow } from "@tauri-apps/api/window";
import { Minus, X } from "lucide-react";
import type { ReactNode } from "react";
import { IconButton } from "@/components/ui/IconButton";
import { cn } from "@/lib/cn";

interface WindowBarProps {
  leading?: ReactNode;
  center?: ReactNode;
  actions?: ReactNode;
  bordered?: boolean;
}

export function WindowBar({ leading, center, actions, bordered = false }: WindowBarProps) {
  return (
    <header
      data-tauri-drag-region
      className={cn("relative flex h-11 shrink-0 items-center gap-2 px-3", bordered && "border-b border-line-subtle")}
    >
      <div className="pointer-events-none flex min-w-0 flex-1 items-center gap-2">{leading}</div>
      {center ? (
        <div className="pointer-events-none absolute inset-y-0 left-1/2 flex -translate-x-1/2 items-center">{center}</div>
      ) : null}
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
