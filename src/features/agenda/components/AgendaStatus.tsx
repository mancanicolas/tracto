import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface AgendaStatusProps {
  status: "loading" | "error";
  onRetry: () => void;
}

const SKELETON_ROWS = 8;

export function AgendaStatus({ status, onRetry }: AgendaStatusProps) {
  if (status === "error") {
    return (
      <div className="flex h-full flex-col items-start gap-3 p-4" role="alert">
        <p className="flex items-start gap-2 text-[13px] text-danger">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} aria-hidden />
          No se pudieron cargar los casos. Revisá la conexión y probá de nuevo.
        </p>
        <Button onClick={onRetry}>Reintentar</Button>
      </div>
    );
  }

  return (
    <div className="flex h-full" role="status" aria-label="Cargando casos" aria-busy="true">
      <div className="flex w-full flex-col border-line-subtle md:w-80 md:shrink-0 md:border-r">
        <div className="flex flex-col gap-2 border-b border-line-subtle p-3">
          <div className="h-8 rounded-sm bg-raised" />
          <div className="h-8 rounded-sm bg-raised" />
        </div>
        {Array.from({ length: SKELETON_ROWS }, (_, index) => (
          <div key={index} className="flex h-12 flex-col justify-center gap-1.5 border-b border-line-subtle px-3">
            <div className="h-3 w-2/3 rounded-xs bg-raised" />
            <div className="h-3 w-1/3 rounded-xs bg-raised" />
          </div>
        ))}
      </div>
    </div>
  );
}
