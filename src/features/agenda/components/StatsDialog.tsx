import * as Dialog from "@radix-ui/react-dialog";
import { Download, X } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { CheckboxField } from "@/components/ui/CheckboxField";
import { IconButton } from "@/components/ui/IconButton";
import { formatMoney } from "@/lib/format";
import type { Case } from "@/lib/mock";
import { downloadReport } from "@/lib/exportReport";
import { collectedRows, computeStats, projectedRows } from "@/lib/stats";

interface StatsDialogProps {
  open: boolean;
  cases: Case[];
  onOpenChange: (open: boolean) => void;
}

interface StatCardProps {
  label: string;
  value: string;
  caption: string;
  download?: { label: string; disabled: boolean; onDownload: () => void };
  children?: ReactNode;
}

function StatCard({ label, value, caption, download, children }: StatCardProps) {
  return (
    <div className="flex flex-col gap-0.5 rounded-md border border-line bg-raised p-3 shadow-[var(--shadow-inset)]">
      <dt className="text-xs leading-4 font-medium text-fg-secondary">{label}</dt>
      <dd className="flex items-center justify-between gap-2">
        <span className="font-mono text-2xl leading-8 font-medium tabular-nums text-fg">{value}</span>
        {download ? (
          <IconButton label={download.label} disabled={download.disabled} onClick={download.onDownload}>
            <Download strokeWidth={1.75} />
          </IconButton>
        ) : null}
      </dd>
      <dd className="text-xs leading-4 text-fg-muted">{caption}</dd>
      {children ? <dd className="mt-1.5">{children}</dd> : null}
    </div>
  );
}

function plural(count: number, singular: string, pluralForm: string): string {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

export function StatsDialog({ open, cases, onOpenChange }: StatsDialogProps) {
  const [includeColchon, setIncludeColchon] = useState(true);
  const stats = useMemo(() => computeStats(cases, includeColchon), [cases, includeColchon]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-20 bg-canvas/70" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-30 w-96 max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-overlay p-4 shadow-[var(--shadow-modal)]">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col gap-0.5">
              <Dialog.Title className="text-sm leading-5 font-semibold text-fg">Estadísticas</Dialog.Title>
              <Dialog.Description className="text-xs leading-4 text-fg-muted">
                El cobrado suma las cuotas marcadas con el tick en cada acuerdo.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <IconButton label="Cerrar">
                <X strokeWidth={1.75} />
              </IconButton>
            </Dialog.Close>
          </div>
          <dl className="mt-3 flex flex-col gap-2">
            <StatCard
              label="Cobrado este mes"
              value={formatMoney(stats.collected)}
              caption={plural(stats.countedInstallments, "pago sumado", "pagos sumados")}
              download={{
                label: "Descargar pagos del mes",
                disabled: stats.countedInstallments === 0,
                onDownload: () => void downloadReport("pagos", collectedRows(cases)),
              }}
            />
            <StatCard
              label="Proyectado del mes"
              value={formatMoney(stats.projected)}
              download={{
                label: "Descargar proyección del mes",
                disabled: stats.projectedCases === 0,
                onDownload: () => void downloadReport("proyeccion", projectedRows(cases, includeColchon)),
              }}
              caption={`Cuota de este mes de ${plural(stats.projectedCases, "caso", "casos")} en ${
                includeColchon ? "acuerdo y acuerdo colchón" : "acuerdo"
              }`}
            >
              <CheckboxField
                label="Incluir acuerdo colchón"
                checked={includeColchon}
                onChange={(event) => setIncludeColchon(event.target.checked)}
              />
            </StatCard>
            <StatCard
              label="Casos pendientes del mes"
              value={String(stats.pendingCases)}
              caption="En estado acuerdo o acuerdo colchón"
            />
          </dl>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
