import { Button } from "@/components/ui/Button";
import type { UpdateState } from "../useUpdater";

interface UpdateBannerProps {
  state: UpdateState;
  onInstall: () => void;
  onCheck: () => void;
  onDismiss: () => void;
}

export function UpdateBanner({ state, onInstall, onCheck, onDismiss }: UpdateBannerProps) {
  const { phase, version, progress, failedStep } = state;
  if (phase === "idle") return null;

  const isError = phase === "error";

  return (
    <div
      role={isError ? "alert" : "status"}
      className="flex items-center justify-between gap-3 border-b border-line-subtle bg-raised px-3 py-2 text-[13px]"
    >
      <span className={isError ? "text-danger" : "text-fg-secondary"}>
        {phase === "checking" ? "Buscando actualizaciones." : null}
        {phase === "up_to_date" ? "Tracto está actualizado." : null}
        {phase === "available" ? `Hay una nueva versión disponible (${version}).` : null}
        {phase === "downloading"
          ? `Descargando la versión ${version}${progress === undefined ? "" : `: ${progress}%`}. La app se reinicia sola al terminar.`
          : null}
        {isError && failedStep === "check" ? "No se pudo buscar actualizaciones. Revisá la conexión y probá de nuevo." : null}
        {isError && failedStep === "install" ? "No se pudo instalar la actualización. Probá de nuevo." : null}
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
            <Button size="small" onClick={failedStep === "install" ? onInstall : onCheck}>
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
