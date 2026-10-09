import * as Tabs from "@radix-ui/react-tabs";
import { ArrowLeft, Pencil } from "lucide-react";
import { IconButton } from "@/components/ui/IconButton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Kbd } from "@/components/ui/Kbd";
import { cn } from "@/lib/cn";
import type { NewAgreement } from "@/lib/agreements";
import { formatIsoDate } from "@/lib/dates";
import { lastPaymentDate } from "@/lib/agreements";
import { formatMoney, formatPhone, normalizeDni } from "@/lib/format";
import type { Label, LabelColor } from "@/lib/labels";
import type { Case } from "@/lib/types";
import { resolveCaseStatus } from "@/lib/status";
import { hasOverdueInstallment, resolveInstallmentAlert, type InstallmentAlertKind } from "@/lib/installmentAlert";
import { AgendaSummary } from "./AgendaSummary";
import { InstallmentAlertBanner } from "./InstallmentAlertBanner";
import { AgreementAccordion } from "./AgreementAccordion";
import { ConvenioAction } from "./ConvenioAction";
import { AgreementPanel } from "./AgreementPanel";
import { InfoValue } from "./InfoValue";
import { NoteForm } from "./NoteForm";
import { ScheduleForm } from "./ScheduleForm";
import { TagsEditor } from "./TagsEditor";

export type ManagementTab = "nota" | "agendar" | "acuerdos";

const TABS: { key: ManagementTab; label: string; shortcut: string }[] = [
  { key: "nota", label: "Nota", shortcut: "N" },
  { key: "agendar", label: "Agendar", shortcut: "S" },
  { key: "acuerdos", label: "Acuerdos", shortcut: "P" },
];

interface CaseDetailProps {
  account: Case;
  labels: Label[];
  tab: ManagementTab;
  onTabChange: (tab: ManagementTab) => void;
  onBack: () => void;
  onEditCase: () => void;
  onFillCaseData: (nombre: string) => void;
  onApplyLabel: (labelId: string) => void;
  onRemoveLabel: (labelId: string) => void;
  onCreateLabel: (nombre: string, color: LabelColor) => void;
  onSaveNote: (texto: string) => void;
  onSchedule: (fecha: string, motivo: string, hora?: string) => void;
  onResolveSchedule: () => void;
  onPostponeSchedule: (fecha: string, hora: string) => void;
  onSaveAgreement: (agreement: NewAgreement) => void;
  onToggleInstallment: (installmentId: string) => void;
  onToggleInstallmentStats: (installmentId: string) => void;
  onMarkAlertDone: (installmentId: string, kind: InstallmentAlertKind) => void;
  onDeleteAgreement: () => void;
}

export function CaseDetail({
  account,
  labels,
  tab,
  onTabChange,
  onBack,
  onEditCase,
  onFillCaseData,
  onApplyLabel,
  onRemoveLabel,
  onCreateLabel,
  onSaveNote,
  onSchedule,
  onResolveSchedule,
  onPostponeSchedule,
  onSaveAgreement,
  onToggleInstallment,
  onToggleInstallmentStats,
  onMarkAlertDone,
  onDeleteAgreement,
}: CaseDetailProps) {
  const status = resolveCaseStatus(account);
  const installmentAlert = resolveInstallmentAlert(account);
  const lastPayment = lastPaymentDate(account);

  return (
    <article className="flex min-h-0 flex-1 flex-col overflow-y-auto" aria-label="Detalle del caso">
      <header className="flex flex-col gap-3 border-b border-line-subtle p-3">
        <div className="flex items-start gap-2">
          <IconButton label="Volver a la lista" onClick={onBack} className="-ml-1 md:hidden">
            <ArrowLeft strokeWidth={1.75} />
          </IconButton>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex min-w-0 items-center gap-1">
              <h2
                className={cn(
                  "truncate text-[15px] leading-6 font-semibold",
                  account.nombre ? "text-fg" : "text-fg-muted",
                )}
                title={account.nombre}
              >
                {account.nombre ?? "Sin info"}
              </h2>
              <IconButton label="Editar caso (M)" onClick={onEditCase} className="size-6 shrink-0">
                <Pencil className="size-3.5" strokeWidth={1.75} />
              </IconButton>
            </div>
            {status ? (
              <div>
                <StatusBadge status={status} overdue={hasOverdueInstallment(account)} />
              </div>
            ) : null}
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs leading-4 text-fg-muted">Monto</span>
            {account.monto !== undefined ? (
              <span className="font-mono text-2xl leading-8 font-medium tabular-nums text-fg">
                {formatMoney(account.monto)}
              </span>
            ) : (
              <span className="text-[13px] leading-8 text-fg-muted">Sin info</span>
            )}
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          <InfoValue label="DNI" value={normalizeDni(account.dni)} mono />
          <InfoValue label="Teléfono" value={account.telefono ? formatPhone(account.telefono) : undefined} mono />
          <InfoValue label="Entidad" value={account.entidad} title={account.entidad} />
          {account.acuerdo?.producto ? <InfoValue label="Producto" value={account.acuerdo.producto} /> : null}
          <InfoValue label="Mail" value={account.mail} title={account.mail} />
          <InfoValue
            label="Último pago"
            value={lastPayment ? formatIsoDate(lastPayment) : undefined}
            mono
          />
        </dl>

        <TagsEditor
          labels={labels}
          appliedIds={account.etiquetas}
          onApply={onApplyLabel}
          onRemove={onRemoveLabel}
          onCreate={onCreateLabel}
        />
      </header>

      {account.agendado_para || account.acuerdo ? (
        <div className="flex flex-col gap-3 border-b border-line-subtle p-3">
          {installmentAlert ? (
            <InstallmentAlertBanner
              alert={installmentAlert}
              onDone={() => onMarkAlertDone(installmentAlert.installment.id, installmentAlert.kind)}
            />
          ) : null}
          <AgendaSummary account={account} onResolve={onResolveSchedule} onPostpone={onPostponeSchedule} />
          {account.acuerdo ? (
            <AgreementAccordion
              key={`agreement-${account.dni}`}
              agreement={account.acuerdo}
              onToggleInstallment={onToggleInstallment}
              onToggleInstallmentStats={onToggleInstallmentStats}
              onDelete={onDeleteAgreement}
            />
          ) : null}
          {status !== null && status !== "cancelado" ? (
            <ConvenioAction
              key={`convenio-${account.dni}`}
              account={account}
              onEditCase={onEditCase}
              onFillCaseData={onFillCaseData}
            />
          ) : null}
        </div>
      ) : null}

      <Tabs.Root
        value={tab}
        onValueChange={(value) => onTabChange(value as ManagementTab)}
        className="flex flex-col"
      >
        <Tabs.List aria-label="Gestión" className="flex border-b border-line-subtle">
          {TABS.map(({ key, label, shortcut }) => (
            <Tabs.Trigger
              key={key}
              value={key}
              title={`${label} (${shortcut})`}
              className="flex h-8 flex-1 items-center justify-center gap-1.5 text-[13px] text-fg-secondary transition-colors duration-100 hover:bg-raised hover:text-fg data-[state=active]:text-fg data-[state=active]:shadow-[inset_0_-2px_0_var(--accent)] motion-reduce:transition-none"
            >
              {label}
              <Kbd>{shortcut}</Kbd>
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        <Tabs.Content value="nota" className="p-3">
          <NoteForm key={account.dni} notes={account.notas} onSave={onSaveNote} />
        </Tabs.Content>
        <Tabs.Content value="agendar" className="p-3">
          <ScheduleForm key={account.dni} onSave={onSchedule} />
        </Tabs.Content>
        <Tabs.Content value="acuerdos" className="p-3">
          <AgreementPanel key={account.dni} account={account} onSave={onSaveAgreement} />
        </Tabs.Content>
      </Tabs.Root>
    </article>
  );
}
