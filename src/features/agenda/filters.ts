import { todayIso } from "@/lib/dates";
import { normalizeDni } from "@/lib/format";
import type { Case } from "@/lib/types";
import { resolveCaseStatus } from "@/lib/status";

export const FILTERS = [
  { key: "todos", label: "Todos" },
  { key: "acuerdo", label: "Acuerdo" },
  { key: "pagos", label: "Pagos" },
  { key: "agenda", label: "Agenda" },
] as const;

export type FilterKey = (typeof FILTERS)[number]["key"];

export function hasPendingAgenda(account: Case, today: string = todayIso()): boolean {
  return Boolean(account.agendado_para && !account.agendado_resuelto && account.agendado_para <= today);
}

export function matchesFilter(account: Case, filter: FilterKey, today: string = todayIso()): boolean {
  const status = resolveCaseStatus(account, today);
  switch (filter) {
    case "todos":
      return true;
    case "acuerdo":
      return status === "acuerdo" || status === "acuerdo colchon";
    case "pagos":
      return status === "pago";
    case "agenda":
      return hasPendingAgenda(account, today);
  }
}

function fold(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

export function matchesQuery(account: Case, query: string): boolean {
  const needle = fold(query.trim());
  if (!needle) return true;
  const digits = normalizeDni(needle);
  const text = [account.nombre, account.entidad, account.cartera, account.mail]
    .filter((value): value is string => Boolean(value))
    .map(fold)
    .join(" ");
  if (text.includes(needle)) return true;
  if (!digits) return false;
  return account.dni.includes(digits) || (account.telefono ?? "").includes(digits);
}

export function countByFilter(cases: Case[], today: string = todayIso()): Record<FilterKey, number> {
  return {
    todos: cases.length,
    acuerdo: cases.filter((c) => matchesFilter(c, "acuerdo", today)).length,
    pagos: cases.filter((c) => matchesFilter(c, "pagos", today)).length,
    agenda: cases.filter((c) => matchesFilter(c, "agenda", today)).length,
  };
}

export function selectVisibleCases(cases: Case[], filter: FilterKey, query: string, today: string = todayIso()): Case[] {
  const visible = cases.filter((c) => matchesFilter(c, filter, today) && matchesQuery(c, query));
  if (filter !== "agenda") return visible;
  return [...visible].sort((a, b) => (a.agendado_para ?? "").localeCompare(b.agendado_para ?? ""));
}
