import { Archive, ChartColumn, Plus, Search } from "lucide-react";
import { useState, type KeyboardEvent, type MouseEvent, type Ref, type RefObject } from "react";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Kbd } from "@/components/ui/Kbd";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/cn";
import { formatNoteAge } from "@/lib/dates";
import { normalizeDni } from "@/lib/format";
import type { Case } from "@/lib/types";
import { hasOverdueInstallment } from "@/lib/installmentAlert";
import { resolveCaseStatus } from "@/lib/status";
import {
  ALL_ENTITIES,
  ARCHIVED_VIEW,
  FILTERS,
  NO_ENTITY,
  SORTS,
  isAgendaPending,
  type ListView,
  type SortKey,
} from "../filters";
import { PendingDot } from "./PendingDot";
import { CaseContextMenu, type ContextMenuTarget } from "./CaseContextMenu";
import { DeleteCaseDialog } from "./DeleteCaseDialog";

const SELECT_CLASS =
  "h-7 min-w-0 rounded-sm border border-line bg-input px-1.5 text-xs text-fg-secondary transition-colors duration-100 hover:border-line-strong motion-reduce:transition-none";

interface CaseListProps {
  cases: Case[];
  selectedDni: string | null;
  filter: ListView;
  counts: Record<ListView, number>;
  query: string;
  listRef: RefObject<HTMLUListElement | null>;
  searchRef: Ref<HTMLInputElement>;
  now: Date;
  onFilterChange: (filter: ListView) => void;
  onQueryChange: (query: string) => void;
  sort: SortKey;
  onSortChange: (sort: SortKey) => void;
  entity: string;
  entityOptions: string[];
  onEntityChange: (entity: string) => void;
  onOpen: (dni: string) => void;
  onMove: (delta: number) => void;
  onNewCase: () => void;
  onOpenStats: () => void;
  onArchive: (dni: string, isArchived: boolean) => void;
  onDelete: (dni: string) => void;
}

export function CaseList({
  cases,
  selectedDni,
  filter,
  counts,
  query,
  listRef,
  searchRef,
  now,
  onFilterChange,
  onQueryChange,
  sort,
  onSortChange,
  entity,
  entityOptions,
  onEntityChange,
  onOpen,
  onMove,
  onNewCase,
  onOpenStats,
  onArchive,
  onDelete,
}: CaseListProps) {
  const [menu, setMenu] = useState<ContextMenuTarget | null>(null);
  const [pendingDeleteDni, setPendingDeleteDni] = useState<string | null>(null);
  const pendingDelete = cases.find((account) => account.dni === pendingDeleteDni) ?? null;

  const openMenu = (account: Case, event: MouseEvent) => {
    event.preventDefault();
    setMenu({ dni: account.dni, x: event.clientX, y: event.clientY, isArchived: Boolean(account.archivado) });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      onMove(1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      onMove(-1);
    } else if (event.key === "Enter" && selectedDni) {
      event.preventDefault();
      onOpen(selectedDni);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-col gap-2 border-b border-line-subtle p-3">
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-fg-muted"
            strokeWidth={1.75}
            aria-hidden
          />
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            aria-label="Buscar casos"
            placeholder="Nombre, DNI o teléfono"
            className="h-8 w-full rounded-sm border border-line bg-input pr-8 pl-8 text-[13px] text-fg transition-colors duration-100 placeholder:text-fg-muted hover:border-line-strong motion-reduce:transition-none"
          />
          <span className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2">
            <Kbd>/</Kbd>
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <select
            value={sort}
            onChange={(event) => onSortChange(event.target.value as SortKey)}
            aria-label="Ordenar casos"
            className={cn(SELECT_CLASS, sort !== "default" && "border-accent-border text-fg")}
          >
            {SORTS.map(({ key, label }) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          <select
            value={entity}
            onChange={(event) => onEntityChange(event.target.value)}
            aria-label="Filtrar por entidad"
            className={cn(SELECT_CLASS, entity !== ALL_ENTITIES && "border-accent-border text-fg")}
          >
            <option value={ALL_ENTITIES}>Todas las entidades</option>
            {entityOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
            <option value={NO_ENTITY}>Sin entidad</option>
          </select>
        </div>
        <div className="flex gap-2">
          <Button className="flex-1" onClick={onNewCase} title="Nuevo caso (C)">
            <Plus className="size-4" strokeWidth={1.75} aria-hidden />
            Nuevo caso
            <Kbd>C</Kbd>
          </Button>
          <IconButton label="Estadísticas (E)" onClick={onOpenStats} className="size-8 border border-line hover:border-line-strong">
            <ChartColumn strokeWidth={1.75} />
          </IconButton>
        </div>
      </div>

      <div role="group" aria-label="Filtros" className="flex border-b border-line-subtle">
        {FILTERS.map(({ key, label }, index) => (
          <button
            key={key}
            type="button"
            aria-pressed={filter === key}
            title={`${label} (${index + 1})`}
            onClick={() => onFilterChange(key)}
            className={cn(
              "flex h-8 flex-1 items-center justify-center gap-1.5 text-[13px] transition-colors duration-100 motion-reduce:transition-none",
              filter === key
                ? "text-fg shadow-[inset_0_-2px_0_var(--accent)]"
                : "text-fg-secondary hover:bg-raised hover:text-fg",
            )}
          >
            {label}
            <span className="font-mono text-[11px] tabular-nums text-fg-muted">{counts[key]}</span>
          </button>
        ))}
      </div>

      {cases.length === 0 ? (
        <EmptyList filter={filter} hasQuery={query.trim() !== "" || entity !== ALL_ENTITIES} onShowAll={() => onFilterChange("todos")} />
      ) : (
        <ul
          ref={listRef}
          role="listbox"
          tabIndex={0}
          aria-label="Casos"
          aria-activedescendant={selectedDni ? `case-${selectedDni}` : undefined}
          onKeyDown={handleKeyDown}
          className="min-h-0 flex-1 overflow-y-auto focus-visible:outline-offset-[-2px]"
        >
          {cases.map((account) => (
            <CaseRow
              key={account.dni}
              account={account}
              selected={account.dni === selectedDni}
              onClick={() => onOpen(account.dni)}
              now={now}
              onContextMenu={(event) => openMenu(account, event)}
            />
          ))}
        </ul>
      )}

      <div className="border-t border-line-subtle">
        <button
          type="button"
          aria-pressed={filter === ARCHIVED_VIEW}
          onClick={() => onFilterChange(filter === ARCHIVED_VIEW ? "todos" : ARCHIVED_VIEW)}
          className={cn(
            "flex h-7 w-full items-center justify-center gap-1.5 text-xs transition-colors duration-100 motion-reduce:transition-none",
            filter === ARCHIVED_VIEW ? "bg-raised text-fg" : "text-fg-muted hover:bg-raised hover:text-fg",
          )}
        >
          <Archive className="size-3.5" strokeWidth={1.75} aria-hidden />
          {filter === ARCHIVED_VIEW ? "Volver a los casos" : "Archivados"}
          <span className="font-mono text-[11px] tabular-nums">{counts[ARCHIVED_VIEW]}</span>
        </button>
      </div>

      {menu ? (
        <CaseContextMenu
          target={menu}
          onClose={() => setMenu(null)}
          onArchive={() => {
            onArchive(menu.dni, !menu.isArchived);
            setMenu(null);
          }}
          onDelete={() => {
            setPendingDeleteDni(menu.dni);
            setMenu(null);
          }}
        />
      ) : null}
      <DeleteCaseDialog
        account={pendingDelete}
        onCancel={() => setPendingDeleteDni(null)}
        onConfirm={() => {
          if (pendingDeleteDni) onDelete(pendingDeleteDni);
          setPendingDeleteDni(null);
        }}
      />
    </div>
  );
}

interface CaseRowProps {
  account: Case;
  selected: boolean;
  onClick: () => void;
  now: Date;
  onContextMenu: (event: MouseEvent) => void;
}

function CaseRow({ account, selected, now, onClick, onContextMenu }: CaseRowProps) {
  const status = resolveCaseStatus(account);
  const lastNote = account.notas[0];
  return (
    <li
      id={`case-${account.dni}`}
      role="option"
      aria-selected={selected}
      onClick={onClick}
      onContextMenu={onContextMenu}
      className={cn(
        "flex h-12 cursor-pointer flex-col justify-center gap-0.5 border-b border-line-subtle px-3",
        selected ? "bg-row-selected shadow-[inset_2px_0_0_var(--accent)]" : "hover:bg-row-hover",
      )}
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="flex min-w-0 items-center gap-1.5">
          {isAgendaPending(account, now) ? <PendingDot /> : null}
          <span
            className={cn("truncate text-[13px] leading-5 font-medium", account.nombre ? "text-fg" : "text-fg-muted")}
            title={account.nombre}
          >
            {account.nombre ?? "Sin info"}
          </span>
        </span>
        <span className="shrink-0 text-xs leading-5 text-fg-muted">
          {lastNote ? `Última nota ${formatNoteAge(lastNote.creada)}` : "Sin notas"}
        </span>
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-xs leading-4 tabular-nums text-fg-muted">{normalizeDni(account.dni)}</span>
        {status ? <StatusBadge status={status} overdue={hasOverdueInstallment(account)} /> : null}
      </div>
    </li>
  );
}

interface EmptyListProps {
  filter: ListView;
  hasQuery: boolean;
  onShowAll: () => void;
}

const EMPTY_MESSAGES: Record<ListView, string> = {
  archivados: "No hay casos archivados.",
  todos: "No hay casos cargados.",
  acuerdo: "No hay casos con acuerdo.",
  pagos: "No hay pagos registrados este mes.",
  agenda: "No hay gestiones agendadas para hoy.",
};

function EmptyList({ filter, hasQuery, onShowAll }: EmptyListProps) {
  return (
    <div className="flex flex-1 flex-col items-start gap-2 p-3">
      <p className="text-[13px] text-fg-secondary">
        {hasQuery ? "Ningún caso coincide con los filtros." : EMPTY_MESSAGES[filter]}
      </p>
      {filter !== "todos" ? (
        <Button size="small" onClick={onShowAll}>
          Ver todos
        </Button>
      ) : null}
    </div>
  );
}
