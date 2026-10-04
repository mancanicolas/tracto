import * as Tabs from "@radix-ui/react-tabs";
import { ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Kbd } from "@/components/ui/Kbd";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/cn";
import { formatIsoDate, formatIsoRelativeDay } from "@/lib/dates";
import { formatDni, formatMoney, formatPhone } from "@/lib/format";
import type { Case, Etiqueta } from "@/lib/mock";
import { resolveCaseStatus } from "@/lib/status";
import type { NewAgreement } from "../useCases";
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
  tab: ManagementTab;
  onTabChange: (tab: ManagementTab) => void;
  onBack: () => void;
  onAddTag: (tag: Etiqueta) => void;
  onRemoveTag: (tag: Etiqueta) => void;
  onSaveNote: (texto: string) => void;
  onSchedule: (fecha: string, motivo: string) => void;
  onResolveSchedule: () => void;
  onSaveAgreement: (agreement: NewAgreement) => void;
}

export function CaseDetail({
  account,
  tab,
  onTabChange,
  onBack,
  onAddTag,
  onRemoveTag,
  onSaveNote,
  onSchedule,
  onResolveSchedule,
  onSaveAgreement,
}: CaseDetailProps) {
  const { status, param } = resolveCaseStatus(account);
  const hasPendingSchedule = Boolean(account.agendado_para && !account.agendado_resuelto);

  return (
    <article className="flex min-h-0 flex-1 flex-col overflow-y-auto" aria-label="Detalle del caso">
      <header className="flex flex-col gap-3 border-b border-line-subtle p-3">
        <div className="flex items-start gap-2">
          <IconButton label="Volver a la lista" onClick={onBack} className="-ml-1 md:hidden">
            <ArrowLeft strokeWidth={1.75} />
          </IconButton>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h2
              className={cn("truncate text-[15px] leading-6 font-semibold", account.nombre ? "text-fg" : "text-fg-muted")}
              title={account.nombre}
            >
              {account.nombre ?? "Sin info"}
            </h2>
            <div>
              <StatusBadge status={status} param={param} />
            </div>
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
          <InfoValue label="DNI" value={formatDni(account.dni)} mono />
          <InfoValue label="Teléfono" value={account.telefono ? formatPhone(account.telefono) : undefined} mono />
          <InfoValue label="Entidad" value={account.entidad} title={account.entidad} />
          <InfoValue label="Cartera" value={account.cartera} title={account.cartera} />
          <InfoValue label="Mail" value={account.mail} title={account.mail} />
          <InfoValue
            label="Último pago"
            value={account.ultimo_pago_fecha ? formatIsoDate(account.ultimo_pago_fecha) : undefined}
            mono
          />
        </dl>

        {hasPendingSchedule && account.agendado_para ? (
          <div className="flex items-center justify-between gap-2 rounded-sm border border-info-border bg-info-subtle px-2.5 py-1.5">
            <p className="min-w-0 text-[13px] leading-5 text-fg-secondary">
              <span className="font-medium text-info">Agendado {formatIsoRelativeDay(account.agendado_para)}</span>
              {account.agendado_motivo ? <span className="text-fg-secondary"> · {account.agendado_motivo}</span> : null}
            </p>
            <Button size="small" onClick={onResolveSchedule}>
              <Check className="size-3.5" strokeWidth={1.75} aria-hidden />
              Marcar resuelto
            </Button>
          </div>
        ) : null}

        <TagsEditor tags={account.etiquetas} onAdd={onAddTag} onRemove={onRemoveTag} />
      </header>

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
