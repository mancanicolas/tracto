import { todayIso } from "./dates";
import type { Case } from "./mock";
import { resolveCaseStatus } from "./status";

export interface MonthStats {
  collected: number;
  countedInstallments: number;
  projected: number;
  activeAgreements: number;
  pendingCases: number;
}

export function computeStats(cases: Case[], today: string = todayIso()): MonthStats {
  const stats: MonthStats = {
    collected: 0,
    countedInstallments: 0,
    projected: 0,
    activeAgreements: 0,
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
    if (status === null || status === "cancelado") continue;
    stats.activeAgreements += 1;
    stats.projected += installments
      .filter((installment) => !installment.pagada)
      .reduce((sum, installment) => sum + installment.monto, 0);
    if (status === "acuerdo" || status === "acuerdo colchon") stats.pendingCases += 1;
  }

  return stats;
}
