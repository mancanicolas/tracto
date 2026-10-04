import { todayIso } from "./dates";
import type { Case } from "./mock";
import { resolveCaseStatus } from "./status";

export interface MonthStats {
  collected: number;
  countedInstallments: number;
  projected: number;
  projectedCases: number;
  pendingCases: number;
}

export function computeStats(cases: Case[], includeColchon: boolean, today: string = todayIso()): MonthStats {
  const currentMonth = today.slice(0, 7);
  const stats: MonthStats = {
    collected: 0,
    countedInstallments: 0,
    projected: 0,
    projectedCases: 0,
    pendingCases: 0,
  };

  for (const account of cases) {
    const installments = account.acuerdo?.cuotas ?? [];
    for (const installment of installments) {
      if (installment.countedInStats) {
        stats.collected += installment.monto;
        stats.countedInstallments += 1;
      }
    }

    const status = resolveCaseStatus(account, today);
    if (status !== "acuerdo" && status !== "acuerdo colchon") continue;
    stats.pendingCases += 1;
    if (status === "acuerdo colchon" && !includeColchon) continue;

    const dueThisMonth = installments
      .filter((installment) => !installment.pagada && installment.fecha.slice(0, 7) === currentMonth)
      .reduce((sum, installment) => sum + installment.monto, 0);
    stats.projected += dueThisMonth;
    if (dueThisMonth > 0) stats.projectedCases += 1;
  }

  return stats;
}
