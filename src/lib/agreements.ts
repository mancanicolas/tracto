import type { Agreement, Installment } from "./mock";

export interface NewAgreement {
  cuotas: number;
  monto_cuota: number;
  anticipo?: { fecha: string; monto: number };
}

export function createAgreement({ cuotas, monto_cuota, anticipo }: NewAgreement): Agreement {
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
    installments.push({ id: crypto.randomUUID(), tipo: "cuota", numero, monto: monto_cuota, pagada: false });
  }
  return { id: crypto.randomUUID(), creado: new Date().toISOString(), cuotas: installments };
}

export function installmentLabel(installment: Installment): string {
  return installment.tipo === "anticipo" ? "Anticipo" : `Cuota ${installment.numero}`;
}

export function summarizeAgreement(agreement: Agreement) {
  const paid = agreement.cuotas.filter((installment) => installment.pagada);
  const pendingAmount = agreement.cuotas
    .filter((installment) => !installment.pagada)
    .reduce((sum, installment) => sum + installment.monto, 0);
  return { paidCount: paid.length, totalCount: agreement.cuotas.length, pendingAmount };
}
