import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { summarizeAgreement } from "@/lib/agreements";
import { formatMoney } from "@/lib/format";
import type { Agreement } from "@/lib/types";
import { InstallmentRow } from "./InstallmentRow";

interface AgreementAccordionProps {
  agreement: Agreement;
  onToggleInstallment: (installmentId: string) => void;
  onToggleInstallmentStats: (installmentId: string) => void;
  onDelete: () => void;
}

export function AgreementAccordion({
  agreement,
  onToggleInstallment,
  onToggleInstallmentStats,
  onDelete,
}: AgreementAccordionProps) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const { paidCount, totalCount, pendingAmount } = summarizeAgreement(agreement);

  return (
    <Accordion.Root type="single" collapsible className="rounded-sm border border-line bg-raised">
      <Accordion.Item value="agreement">
        <Accordion.Header className="flex">
          <Accordion.Trigger className="group flex min-h-10 flex-1 items-center justify-between gap-3 px-2.5 py-1.5 text-left transition-colors duration-100 hover:bg-row-hover motion-reduce:transition-none">
            <span className="flex flex-col">
              <span className="text-[13px] leading-5 font-medium text-fg">Acuerdo vigente</span>
              <span className="text-xs leading-4 text-fg-muted">
                <span className="font-mono tabular-nums">
                  {paidCount} de {totalCount}
                </span>{" "}
                pagadas · pendiente{" "}
                <span className="font-mono tabular-nums">{formatMoney(pendingAmount)}</span>
              </span>
            </span>
            <ChevronDown
              className="size-4 shrink-0 text-fg-muted transition-transform duration-100 group-data-[state=open]:rotate-180 motion-reduce:transition-none"
              strokeWidth={1.75}
              aria-hidden
            />
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content className="border-t border-line-subtle">
          <ul aria-label="Cuotas del acuerdo" className="flex flex-col divide-y divide-line-subtle">
            {agreement.cuotas.map((installment) => (
              <InstallmentRow
                key={installment.id}
                installment={installment}
                onTogglePaid={() => onToggleInstallment(installment.id)}
                onToggleStats={() => onToggleInstallmentStats(installment.id)}
              />
            ))}
          </ul>
          <div className="flex items-center justify-end gap-2 border-t border-line-subtle p-2">
            {isConfirmingDelete ? (
              <>
                <span className="mr-auto text-xs text-fg-secondary">Se pierde el acuerdo y el estado de sus cuotas.</span>
                <Button size="small" variant="ghost" onClick={() => setIsConfirmingDelete(false)}>
                  Cancelar
                </Button>
                <Button size="small" variant="destructive" onClick={onDelete}>
                  Confirmar eliminación
                </Button>
              </>
            ) : (
              <Button size="small" variant="destructive" onClick={() => setIsConfirmingDelete(true)}>
                Eliminar acuerdo
              </Button>
            )}
          </div>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  );
}
