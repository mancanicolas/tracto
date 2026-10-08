import { LogOut, MessagesSquare, RefreshCw, ShieldCheck } from "lucide-react";
import { useState } from "react";
import Logo from "@/assets/logo.svg?react";
import { WindowBar } from "@/components/layout/WindowBar";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { ADMIN_PANEL_ID, AdminPanel } from "@/features/admin/AdminPanel";
import { useCatalogSync } from "@/features/admin/entities/useCatalogSync";
import { RoleGate } from "@/features/auth/RoleContext";
import { AgendaView } from "@/features/agenda/components/AgendaView";
import { SPEECHER_DRAWER_ID, SpeecherDrawer } from "@/features/speecher/components/SpeecherDrawer";
import { useSpeecherWindow } from "@/features/speecher/useSpeecherWindow";
import { UpdateBanner } from "@/features/updater/components/UpdateBanner";
import { useUpdater } from "@/features/updater/useUpdater";

interface OverlayShellProps {
  email: string;
  operatorName: string;
  onSignOut: () => Promise<void>;
}

export function OverlayShell({ email, operatorName, onSignOut }: OverlayShellProps) {
  const { state, checkNow, installUpdate, dismiss } = useUpdater();
  const [isSpeecherOpen, setIsSpeecherOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  useCatalogSync();
  const { isPoppedOut, popOut, closeWidget } = useSpeecherWindow(() => setIsSpeecherOpen(true));

  const toggleSpeecher = () => {
    if (isPoppedOut) {
      void closeWidget();
      setIsSpeecherOpen(true);
    } else {
      setIsSpeecherOpen((open) => !open);
    }
  };

  const popOutSpeecher = () => {
    setIsSpeecherOpen(false);
    void popOut().then((created) => {
      if (!created) setIsSpeecherOpen(true);
    });
  };

  return (
    <div className="flex h-full flex-col bg-surface">
      <WindowBar
        bordered
        leading={
          <span className="truncate text-xs text-fg-muted" title={email}>
            {operatorName}
          </span>
        }
        center={<Logo className="h-6 w-auto shrink-0 text-brand-white" role="img" aria-label="Tracto" />}
        actions={
          <>
            <RoleGate allow="admin">
              <Button
                size="small"
                variant="ghost"
                aria-expanded={isAdminOpen}
                aria-controls={ADMIN_PANEL_ID}
                onClick={() => setIsAdminOpen((open) => !open)}
              >
                <ShieldCheck className="size-4" strokeWidth={1.75} aria-hidden />
                Admin
              </Button>
            </RoleGate>
            <Button
              size="small"
              variant="ghost"
              aria-expanded={isSpeecherOpen}
              aria-controls={SPEECHER_DRAWER_ID}
              onClick={toggleSpeecher}
            >
              <MessagesSquare className="size-4" strokeWidth={1.75} aria-hidden />
              Speecher
            </Button>
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
      <main className="relative min-h-0 flex-1 overflow-hidden">
        <AgendaView operatorName={operatorName} />
        <RoleGate allow="admin">{isAdminOpen ? <AdminPanel onClose={() => setIsAdminOpen(false)} /> : null}</RoleGate>
        <SpeecherDrawer open={isSpeecherOpen} onClose={() => setIsSpeecherOpen(false)} onPopOut={popOutSpeecher} />
      </main>
    </div>
  );
}
