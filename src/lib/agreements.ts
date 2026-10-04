import { addMonthsIso } from "./dates";
import type { Agreement, Case, Installment } from "./types";

interface NewInstallmentPlan {
  tipo: "cuotas";
  cuotas: number;
  monto_cuota: number;
  primer_vencimiento: string;
  producto?: string;
  anticipo?: { fecha: string; monto: number };
}

interface NewPartialPayment {
  tipo: "parcial";
  monto: number;
  fecha: string;
  producto?: string;
}

export type NewAgreement = NewInstallmentPlan | NewPartialPayment;

function newInstallment(fields: Omit<Installment, "id" | "pagada" | "countedInStats">): Installment {
  return { id: crypto.randomUUID(), pagada: false, countedInStats: false, ...fields };
}

function buildInstallments(input: NewAgreement): Installment[] {
  if (input.tipo === "parcial") {
    return [newInstallment({ tipo: "parcial", monto: input.monto, fecha: input.fecha })];
  }
  const installments: Installment[] = [];
  if (input.anticipo) {
    installments.push(newInstallment({ tipo: "anticipo", monto: input.anticipo.monto, fecha: input.anticipo.fecha }));
  }
  for (let numero = 1; numero <= input.cuotas; numero += 1) {
    installments.push(
      newInstallment({
        tipo: "cuota",
        numero,
        monto: input.monto_cuota,
        fecha: addMonthsIso(input.primer_vencimiento, numero - 1),
      }),
    );
  }
  return installments;
}

export function createAgreement(input: NewAgreement): Agreement {
  return {
    id: crypto.randomUUID(),
    creado: new Date().toISOString(),
    tipo: input.tipo,
    producto: input.producto,
    cuotas: buildInstallments(input),
  };
}

export function installmentLabel(installment: Installment): string {
  if (installment.tipo === "anticipo") return "Anticipo";
  if (installment.tipo === "parcial") return "Pago parcial";
  return `Cuota ${installment.numero}`;
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
