import { useState } from "react";
import { cn } from "@/lib/cn";
import type { Case } from "@/lib/mock";
import type { NewAgreement } from "../useCases";
import { AgreementHistory } from "./AgreementHistory";
import { PartialForm } from "./PartialForm";
import { PlanForm } from "./PlanForm";

type AgreementMode = "plan" | "parcial";

const MODES: { key: AgreementMode; label: string }[] = [
  { key: "plan", label: "Plan de cuotas" },
  { key: "parcial", label: "Pago parcial" },
];

interface AgreementPanelProps {
  account: Case;
  onSave: (agreement: NewAgreement) => void;
}

export function AgreementPanel({ account, onSave }: AgreementPanelProps) {
  const [mode, setMode] = useState<AgreementMode>("plan");

  return (
    <div className="flex flex-col gap-3">
      <div role="group" aria-label="Tipo de acuerdo" className="flex rounded-sm border border-line p-0.5">
        {MODES.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            aria-pressed={mode === key}
            onClick={() => setMode(key)}
            className={cn(
              "h-6 flex-1 rounded-xs text-xs font-medium transition-colors duration-100 motion-reduce:transition-none",
              mode === key ? "bg-raised text-fg shadow-[var(--shadow-inset)]" : "text-fg-secondary hover:text-fg",
            )}
          >
            {label}
          </button>
        ))}
      </div>
      {mode === "plan" ? (
        <PlanForm onSave={onSave} />
      ) : (
        <PartialForm balance={account.monto} onSave={onSave} />
      )}
      <AgreementHistory agreements={account.acuerdos} />
    </div>
  );
}
