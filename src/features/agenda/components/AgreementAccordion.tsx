import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown, Circle, CircleCheck } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { installmentLabel, summarizeAgreement } from "@/lib/agreements";
import { cn } from "@/lib/cn";
import { formatIsoDate } from "@/lib/dates";
import { formatMoney } from "@/lib/format";
import type { Agreement } from "@/lib/mock";

interface AgreementAccordionProps {
  agreement: Agreement;
  onToggleInstallment: (installmentId: string) => void;
  onDelete: () => void;
}

export function AgreementAccordion({ agreement, onToggleInstallment, onDelete }: AgreementAccordionProps) {
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
              <li key={installment.id}>
                <button
                  type="button"
                  aria-pressed={installment.pagada}
                  onClick={() => onToggleInstallment(installment.id)}
                  className="flex h-8 w-full items-center gap-2 px-2.5 text-left text-[13px] transition-colors duration-100 hover:bg-row-hover motion-reduce:transition-none"
                >
                  <span className="min-w-0 flex-1 truncate text-fg-secondary">
                    {installmentLabel(installment)}
                    {installment.fecha ? (
                      <span className="ml-2 font-mono text-xs tabular-nums text-fg-muted">
                        {formatIsoDate(installment.fecha)}
                      </span>
                    ) : null}
                  </span>
                  <span className="font-mono tabular-nums text-fg">{formatMoney(installment.monto)}</span>
                  <span
                    className={cn(
                      "inline-flex w-20 items-center justify-end gap-1 text-xs font-medium",
                      installment.pagada ? "text-success" : "text-fg-muted",
                    )}
                  >
                    {installment.pagada ? (
                      <CircleCheck className="size-3.5" strokeWidth={1.75} aria-hidden />
                    ) : (
                      <Circle className="size-3.5" strokeWidth={1.75} aria-hidden />
                    )}
                    {installment.pagada ? "Pagada" : "Pendiente"}
                  </span>
                </button>
              </li>
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
