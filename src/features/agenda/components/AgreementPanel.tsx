import type { NewAgreement } from "@/lib/agreements";
import type { Case } from "@/lib/types";
import { PlanForm } from "./PlanForm";

interface AgreementPanelProps {
  account: Case;
  onSave: (agreement: NewAgreement) => void;
}

export function AgreementPanel({ account, onSave }: AgreementPanelProps) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm leading-5 font-semibold text-fg">Nuevo acuerdo</h3>
      <p className="text-xs text-fg-muted">
        {account.acuerdo ? "Reemplaza por completo el acuerdo vigente." : "Este caso todavía no tiene un acuerdo."}
      </p>
      <PlanForm entidad={account.entidad} onSave={onSave} />
    </div>
  );
}
