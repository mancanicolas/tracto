import { todayIso } from "./dates";
import type { Case } from "./types";
import { resolveCaseStatus } from "./status";

export interface InstallmentRow {
  dni: string;
  entidad?: string;
  monto: number;
  fecha: string;
}

export interface MonthStats {
  collected: number;
  countedInstallments: number;
  projected: number;
  projectedCases: number;
  pendingCases: number;
}

export function collectedRows(cases: Case[]): InstallmentRow[] {
  return cases.flatMap((account) =>
    (account.acuerdo?.cuotas ?? [])
      .filter((installment) => installment.countedInStats)
      .map((installment) => ({
        dni: account.dni,
        entidad: account.entidad,
        monto: installment.monto,
        fecha: installment.fecha,
      })),
  );
}

export function projectedRows(
  cases: Case[],
  includeColchon: boolean,
  today: string = todayIso(),
): InstallmentRow[] {
  const currentMonth = today.slice(0, 7);
  return cases.flatMap((account) => {
    const status = resolveCaseStatus(account, today);
    const isIncluded = status === "acuerdo" || (includeColchon && status === "acuerdo colchon");
    if (!isIncluded) return [];
    return (account.acuerdo?.cuotas ?? [])
      .filter((installment) => !installment.pagada && installment.fecha.slice(0, 7) === currentMonth)
      .map((installment) => ({
        dni: account.dni,
        entidad: account.entidad,
        monto: installment.monto,
        fecha: installment.fecha,
      }));
  });
}

function sumAmounts(rows: InstallmentRow[]): number {
  return rows.reduce((sum, row) => sum + row.monto, 0);
}

export function computeStats(cases: Case[], includeColchon: boolean, today: string = todayIso()): MonthStats {
  const collected = collectedRows(cases);
  const projected = projectedRows(cases, includeColchon, today);
  const pendingCases = cases.filter((account) => {
    const status = resolveCaseStatus(account, today);
    return status === "acuerdo" || status === "acuerdo colchon";
  }).length;

  return {
    collected: sumAmounts(collected),
    countedInstallments: collected.length,
    projected: sumAmounts(projected),
    projectedCases: new Set(projected.map((row) => row.dni)).size,
    pendingCases,
  };
}
