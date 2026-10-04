import { formatMoney } from "@/lib/format";
import { formatIsoDate } from "@/lib/dates";
import type { Agreement } from "@/lib/mock";

const money = (cents: number) => <span className="font-mono tabular-nums text-fg">{formatMoney(cents)}</span>;

const date = (iso: string) => <span className="font-mono tabular-nums">{formatIsoDate(iso)}</span>;

export function AgreementHistory({ agreements }: { agreements: Agreement[] }) {
  if (agreements.length === 0) {
    return <p className="text-xs text-fg-muted">Todavía no hay acuerdos.</p>;
  }
  return (
    <ul className="flex flex-col divide-y divide-line-subtle border-t border-line-subtle" aria-label="Acuerdos del caso">
      {agreements.map((agreement) => (
        <li key={agreement.id} className="flex flex-col gap-0.5 py-2 text-[13px] leading-5 text-fg-secondary">
          {agreement.tipo === "plan" ? (
            <>
              <span className="font-medium text-fg">Plan de cuotas</span>
              <span>
                {agreement.cuotas} cuotas de {money(agreement.monto_cuota)}
              </span>
              {agreement.anticipo ? (
                <span>
                  Anticipo {money(agreement.anticipo.monto)} el {date(agreement.anticipo.fecha)}
                </span>
              ) : null}
            </>
          ) : (
            <>
              <span className="font-medium text-fg">Pago parcial</span>
              <span>
                {money(agreement.monto)} el {date(agreement.fecha)}
              </span>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}
