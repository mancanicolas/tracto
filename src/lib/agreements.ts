import { addMonthsIso } from "./dates";
import type { Agreement, Case, Installment } from "./mock";

export interface NewAgreement {
  cuotas: number;
  monto_cuota: number;
  primer_vencimiento: string;
  anticipo?: { fecha: string; monto: number };
}

export function createAgreement({ cuotas, monto_cuota, primer_vencimiento, anticipo }: NewAgreement): Agreement {
  const installments: Installment[] = [];
  if (anticipo) {
    installments.push({
      id: crypto.randomUUID(),
      tipo: "anticipo",
      monto: anticipo.monto,
      fecha: anticipo.fecha,
      pagada: false,
    });
  }
  for (let numero = 1; numero <= cuotas; numero += 1) {
    installments.push({
      id: crypto.randomUUID(),
      tipo: "cuota",
      numero,
      monto: monto_cuota,
      fecha: addMonthsIso(primer_vencimiento, numero - 1),
      pagada: false,
    });
  }
  return { id: crypto.randomUUID(), creado: new Date().toISOString(), cuotas: installments };
}

export function installmentLabel(installment: Installment): string {
  return installment.tipo === "anticipo" ? "Anticipo" : `Cuota ${installment.numero}`;
}

export function summarizeAgreement(agreement: Agreement) {
  const paidCount = agreement.cuotas.filter((installment) => installment.pagada).length;
  const pendingAmount = agreement.cuotas
    .filter((installment) => !installment.pagada)
    .reduce((sum, installment) => sum + installment.monto, 0);
  return { paidCount, totalCount: agreement.cuotas.length, pendingAmount };
}

export function lastPaymentDate(account: Pick<Case, "acuerdo" | "ultimo_pago_fecha">): string | undefined {
  const dates = (account.acuerdo?.cuotas ?? [])
    .map((installment) => installment.pagada_fecha)
    .filter((date): date is string => Boolean(date));
  if (account.ultimo_pago_fecha) dates.push(account.ultimo_pago_fecha);
  return dates.sort().at(-1);
}
