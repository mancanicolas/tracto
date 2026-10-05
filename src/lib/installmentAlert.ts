import { addDaysIso, todayIso } from "./dates";
import type { Case, Installment } from "./types";

export type InstallmentAlertKind = "recordatorio" | "reclamo";

export interface InstallmentAlert {
  kind: InstallmentAlertKind;
  installment: Installment;
}

type CaseWithAgreement = Pick<Case, "acuerdo">;

function unpaidInstallments(account: CaseWithAgreement): Installment[] {
  return (account.acuerdo?.cuotas ?? [])
    .filter((installment) => !installment.pagada)
    .sort((a, b) => a.fecha.localeCompare(b.fecha));
}

export function hasOverdueInstallment(account: CaseWithAgreement, today: string = todayIso()): boolean {
  return unpaidInstallments(account).some((installment) => installment.fecha < today);
}

export function resolveInstallmentAlert(
  account: CaseWithAgreement,
  today: string = todayIso(),
): InstallmentAlert | null {
  const unpaid = unpaidInstallments(account);
  const overdue = unpaid.find((installment) => installment.fecha < today && !installment.claimDone);
  if (overdue) return { kind: "reclamo", installment: overdue };
  const tomorrow = addDaysIso(today, 1);
  const upcoming = unpaid.find(
    (installment) => installment.fecha >= today && installment.fecha <= tomorrow && !installment.reminderDone,
  );
  return upcoming ? { kind: "recordatorio", installment: upcoming } : null;
}
