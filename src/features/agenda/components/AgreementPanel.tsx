import type { NewAgreement } from "@/lib/agreements";
import type { Case } from "@/lib/mock";
import { AgreementAccordion } from "./AgreementAccordion";
import { PlanForm } from "./PlanForm";

interface AgreementPanelProps {
  account: Case;
  onSave: (agreement: NewAgreement) => void;
  onToggleInstallment: (installmentId: string) => void;
  onDelete: () => void;
}

export function AgreementPanel({ account, onSave, onToggleInstallment, onDelete }: AgreementPanelProps) {
  return (
    <div className="flex flex-col gap-3">
      {account.acuerdo ? (
        <AgreementAccordion agreement={account.acuerdo} onToggleInstallment={onToggleInstallment} onDelete={onDelete} />
      ) : (
        <p className="text-xs text-fg-muted">Este caso no tiene un acuerdo.</p>
      )}
      <div className="flex flex-col gap-2 border-t border-line-subtle pt-3">
        <h3 className="text-sm leading-5 font-semibold text-fg">Nuevo acuerdo</h3>
        {account.acuerdo ? <p className="text-xs text-fg-muted">Reemplaza por completo el acuerdo vigente.</p> : null}
        <PlanForm onSave={onSave} />
      </div>
    </div>
  );
}
