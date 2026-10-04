import { LogOut, RefreshCw } from "lucide-react";
import Logo from "@/assets/logo.svg?react";
import { WindowBar } from "@/components/layout/WindowBar";
import { IconButton } from "@/components/ui/IconButton";
import { AgendaView } from "@/features/agenda/components/AgendaView";
import { UpdateBanner } from "@/features/updater/components/UpdateBanner";
import { useUpdater } from "@/features/updater/useUpdater";

interface OverlayShellProps {
  email: string;
  operatorName: string;
  onSignOut: () => Promise<void>;
}

export function OverlayShell({ email, operatorName, onSignOut }: OverlayShellProps) {
  const { state, checkNow, installUpdate, dismiss } = useUpdater();

  return (
    <div className="flex h-full flex-col bg-surface">
      <WindowBar
        bordered
        leading={
          <>
            <Logo className="h-4 w-auto shrink-0 text-brand-white" role="img" aria-label="Tracto" />
            <span className="truncate text-xs text-fg-muted" title={email}>
              {operatorName}
            </span>
          </>
        }
        actions={
          <>
            <IconButton
              label="Buscar actualizaciones"
              disabled={state.phase === "checking" || state.phase === "downloading"}
              onClick={checkNow}
            >
              <RefreshCw
                strokeWidth={1.75}
                className={state.phase === "checking" ? "animate-spin motion-reduce:animate-none" : undefined}
              />
            </IconButton>
            <IconButton label="Cerrar sesión" onClick={() => void onSignOut()}>
              <LogOut strokeWidth={1.75} />
            </IconButton>
          </>
        }
      />
      <UpdateBanner state={state} onInstall={installUpdate} onDismiss={dismiss} />
      <main className="min-h-0 flex-1">
        <AgendaView operatorName={operatorName} />
      </main>
    </div>
  );
}
