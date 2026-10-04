import { LogOut } from "lucide-react";
import Logo from "@/assets/logo.svg?react";
import { WindowBar } from "@/components/layout/WindowBar";
import { IconButton } from "@/components/ui/IconButton";
import { AgendaView } from "@/features/agenda/components/AgendaView";

interface OverlayShellProps {
  email: string;
  onSignOut: () => Promise<void>;
}

export function OverlayShell({ email, onSignOut }: OverlayShellProps) {
  return (
    <div className="flex h-full flex-col bg-surface">
      <WindowBar
        bordered
        leading={
          <>
            <Logo className="h-4 w-auto shrink-0 text-brand-white" role="img" aria-label="Tracto" />
            <span className="truncate text-xs text-fg-muted" title={email}>
              {email}
            </span>
          </>
        }
        actions={
          <IconButton label="Cerrar sesión" onClick={() => void onSignOut()}>
            <LogOut strokeWidth={1.75} />
          </IconButton>
        }
      />
      <main className="min-h-0 flex-1">
        <AgendaView />
      </main>
    </div>
  );
}
