import { todayIso } from "@/lib/dates";
import { findEntity, foldName } from "@/constants/entidades";
import { formatTime, normalizeDni } from "@/lib/format";
import type { Case } from "@/lib/types";
import { resolveInstallmentAlert } from "@/lib/installmentAlert";
import { resolveCaseStatus } from "@/lib/status";

export const FILTERS = [
  { key: "todos", label: "Todos" },
  { key: "acuerdo", label: "Acuerdo" },
  { key: "pagos", label: "Pagos" },
  { key: "agenda", label: "Agenda" },
] as const;

export type FilterKey = (typeof FILTERS)[number]["key"];

export const SORTS = [
  { key: "default", label: "Orden por defecto" },
  { key: "note_newest", label: "Última nota: más reciente" },
  { key: "note_oldest", label: "Última nota: más antigua" },
  { key: "tag", label: "Por tag" },
] as const;

export type SortKey = (typeof SORTS)[number]["key"];

export const ALL_ENTITIES = "todas";
export const NO_ENTITY = "sin_entidad";

export const ARCHIVED_VIEW = "archivados";

export type ListView = FilterKey | typeof ARCHIVED_VIEW;

export function hasPendingAgenda(account: Case, today: string = todayIso()): boolean {
  return Boolean(account.agendado_para && !account.agendado_resuelto && account.agendado_para <= today);
}

export function isAgendaPending(account: Case, now: Date = new Date()): boolean {
  const { agendado_para: date, agendado_hora: time, agendado_resuelto: isResolved } = account;
  if (!date || isResolved) return false;
  const today = todayIso(now);
  if (date < today) return true;
  if (date > today) return false;
  return !time || time <= formatTime(now);
}

interface AgendaOrder {
  hasTime: boolean;
  key: string;
}

function agendaOrder(account: Case, today: string): AgendaOrder {
  if (hasPendingAgenda(account, today) && account.agendado_para) {
    const time = account.agendado_hora;
    return { hasTime: Boolean(time), key: `${account.agendado_para}T${time ?? "99:99"}` };
  }
  const alert = resolveInstallmentAlert(account, today);
  return { hasTime: false, key: `${alert?.installment.fecha ?? "9999-99-99"}T99:99` };
}

function compareAgendaOrder(a: Case, b: Case, today: string): number {
  const first = agendaOrder(a, today);
  const second = agendaOrder(b, today);
  if (first.hasTime !== second.hasTime) return first.hasTime ? -1 : 1;
  return first.key.localeCompare(second.key);
}

export function matchesFilter(account: Case, filter: ListView, today: string = todayIso()): boolean {
  if (filter === ARCHIVED_VIEW) return Boolean(account.archivado);
  if (account.archivado) return false;
  const status = resolveCaseStatus(account, today);
  switch (filter) {
    case "todos":
      return true;
    case "acuerdo":
      return status === "acuerdo" || status === "acuerdo colchon";
    case "pagos":
      return status === "pago";
    case "agenda":
      return hasPendingAgenda(account, today) || resolveInstallmentAlert(account, today) !== null;
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

export function countByFilter(cases: Case[], today: string = todayIso()): Record<ListView, number> {
  return {
    todos: cases.filter((c) => matchesFilter(c, "todos", today)).length,
    archivados: cases.filter((c) => matchesFilter(c, ARCHIVED_VIEW, today)).length,
    acuerdo: cases.filter((c) => matchesFilter(c, "acuerdo", today)).length,
    pagos: cases.filter((c) => matchesFilter(c, "pagos", today)).length,
    agenda: cases.filter((c) => matchesFilter(c, "agenda", today)).length,
  };
}

export function matchesEntity(account: Case, entity: string): boolean {
  if (entity === ALL_ENTITIES) return true;
  const name = account.entidad?.trim();
  if (entity === NO_ENTITY) return !name;
  return Boolean(name) && foldName(name ?? "") === foldName(entity);
}

export function listEntityOptions(cases: Case[], catalogNames: string[]): string[] {
  const unknown = cases
    .map((account) => account.entidad?.trim())
    .filter((name): name is string => Boolean(name) && !findEntity(name));
  return [...catalogNames, ...new Set(unknown)];
}

function lastNoteTime(account: Case): number {
  return account.notas.reduce((latest, note) => Math.max(latest, Date.parse(note.creada)), 0);
}

function tagRank(account: Case, today: string): number {
  switch (resolveCaseStatus(account, today)) {
    case null:
      return 0;
    case "acuerdo":
    case "acuerdo colchon":
      return 1;
    case "pago":
      return 2;
    case "cancelado":
      return 3;
  }
}

function sortCases(cases: Case[], sort: SortKey, today: string): Case[] {
  switch (sort) {
    case "note_newest":
      return [...cases].sort((a, b) => lastNoteTime(b) - lastNoteTime(a));
    case "note_oldest":
      return [...cases].sort((a, b) => lastNoteTime(a) - lastNoteTime(b));
    case "tag":
      return [...cases].sort((a, b) => tagRank(a, today) - tagRank(b, today));
    case "default":
      return cases;
  }
}

export function selectVisibleCases(
  cases: Case[],
  filter: ListView,
  query: string,
  today: string = todayIso(),
  sort: SortKey = "default",
): Case[] {
  const visible = cases.filter((c) => matchesFilter(c, filter, today) && matchesQuery(c, query));
  if (sort !== "default") return sortCases(visible, sort, today);
  if (filter !== "agenda") return visible;
  return [...visible].sort((a, b) => compareAgendaOrder(a, b, today));
}
