import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { UpdateState } from "../useUpdater";

interface UpdateBannerProps {
  state: UpdateState;
  onInstall: () => void;
  onDismiss: () => void;
}

export function UpdateBanner({ state, onInstall, onDismiss }: UpdateBannerProps) {
  const { phase, version, progress } = state;
  if (phase === "idle") return null;

  const isError = phase === "error";

  return (
    <div
      role={isError ? "alert" : "status"}
      className="flex items-center justify-between gap-3 border-b border-line-subtle bg-raised px-3 py-2 text-[13px]"
    >
      <span className={isError ? "text-danger" : "text-fg-secondary"}>
        {phase === "checking" ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="size-4 animate-spin motion-reduce:animate-none" strokeWidth={1.75} aria-hidden />
            Buscando actualizaciones
          </span>
        ) : null}
        {phase === "up_to_date" ? "Tenés instalada la versión más reciente." : null}
        {phase === "available" ? `Hay una nueva versión disponible (${version}).` : null}
        {phase === "downloading"
          ? `Descargando la versión ${version}${progress === undefined ? "" : `: ${progress}%`}. La app se reinicia sola al terminar.`
          : null}
        {isError ? "No se pudo instalar la actualización. Probá de nuevo." : null}
      </span>
      <span className="flex shrink-0 items-center gap-2">
        {phase === "available" ? (
          <>
            <Button size="small" onClick={onDismiss}>
              Después
            </Button>
            <Button size="small" variant="primary" onClick={onInstall}>
              Actualizar ahora
            </Button>
          </>
        ) : null}
        {isError ? (
          <>
            <Button size="small" onClick={onDismiss}>
              Cerrar aviso
            </Button>
            <Button size="small" onClick={onInstall}>
              Reintentar
            </Button>
          </>
        ) : null}
        {phase === "up_to_date" ? (
          <Button size="small" onClick={onDismiss}>
            Cerrar aviso
          </Button>
        ) : null}
      </span>
    </div>
  );
}
