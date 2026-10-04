import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { todayIso } from "@/lib/dates";
import type { NewAgreement } from "@/lib/agreements";
import type { LabelColor } from "@/lib/labels";
import { createMockCases, createMockLabels } from "@/lib/mock";
import { useShortcut } from "@/lib/shortcuts";
import { normalizeDni, parseMoneyToCents } from "@/lib/format";
import { FILTERS, countByFilter, selectVisibleCases, type FilterKey } from "../filters";
import type { CaseEditValues } from "../schemas";
import { useCases } from "../useCases";
import { CaseDetail, type ManagementTab } from "./CaseDetail";
import { CaseList } from "./CaseList";
import { CaseDialog } from "./CaseDialog";
import { StatsDialog } from "./StatsDialog";

export function AgendaView() {
  const {
    cases,
    labels,
    addCase,
    updateCase,
    applyLabel,
    removeLabel,
    createLabelFor,
    addNote,
    schedule,
    resolveSchedule,
    setAgreement,
    deleteAgreement,
    toggleInstallment,
    toggleInstallmentStats,
  } = useCases(createMockCases, createMockLabels);
  const [filter, setFilter] = useState<FilterKey>("todos");
  const [query, setQuery] = useState("");
  const [selectedDni, setSelectedDni] = useState<string | null>(() => cases[0]?.dni ?? null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [tab, setTab] = useState<ManagementTab>("nota");
  const [isNewCaseOpen, setIsNewCaseOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const listRef = useRef<HTMLUListElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const isWide = useMediaQuery("(min-width: 768px)");

  const today = todayIso();
  const visibleCases = useMemo(
    () => selectVisibleCases(cases, filter, query, today),
    [cases, filter, query, today],
  );
  const counts = useMemo(() => countByFilter(cases, today), [cases, today]);

  const selectedCase = cases.find((account) => account.dni === selectedDni) ?? null;
  const showDetailPane = isWide || isDetailOpen;
  const showListPane = isWide || !isDetailOpen;

  useEffect(() => {
    if (selectedDni) document.getElementById(`case-${selectedDni}`)?.scrollIntoView({ block: "nearest" });
  }, [selectedDni, showListPane]);

  const openCase = useCallback((dni: string) => {
    setSelectedDni(dni);
    setIsDetailOpen(true);
  }, []);

  const moveSelection = useCallback(
    (delta: number) => {
      if (visibleCases.length === 0) return;
      const currentIndex = visibleCases.findIndex((account) => account.dni === selectedDni);
      const nextIndex = Math.min(Math.max(currentIndex + delta, 0), visibleCases.length - 1);
      const next = visibleCases[nextIndex];
      if (next) setSelectedDni(next.dni);
    },
    [visibleCases, selectedDni],
  );

  const focusManagementTab = useCallback((next: ManagementTab) => {
    setTab(next);
    setIsDetailOpen(true);
    window.setTimeout(() => document.querySelector<HTMLElement>("[data-first-field]")?.focus(), 0);
  }, []);

  const finishManagement = useCallback(
    (message: string) => {
      setAnnouncement(message);
      const currentIndex = visibleCases.findIndex((account) => account.dni === selectedDni);
      const next = visibleCases[currentIndex + 1];
      if (next) setSelectedDni(next.dni);
      setIsDetailOpen(false);
      window.setTimeout(() => listRef.current?.focus(), 0);
    },
    [visibleCases, selectedDni],
  );

  const createCase = (dni: string) => {
    addCase(dni);
    setFilter("todos");
    setQuery("");
    setIsNewCaseOpen(false);
    setSelectedDni(dni);
    setIsDetailOpen(true);
    setAnnouncement("Caso creado");
  };

  const closeCaseDialog = (open: boolean) => {
    if (open) return;
    setIsNewCaseOpen(false);
    setIsEditOpen(false);
  };

  const saveCaseDetails = (values: CaseEditValues) => {
    if (!selectedCase) return;
    updateCase(selectedCase.dni, {
      nombre: values.nombre || undefined,
      telefono: values.telefono ? normalizeDni(values.telefono) : undefined,
      entidad: values.entidad || undefined,
      cartera: values.cartera || undefined,
      mail: values.mail || undefined,
      monto: values.monto ? (parseMoneyToCents(values.monto) ?? undefined) : undefined,
    });
    setIsEditOpen(false);
    setAnnouncement("Caso actualizado");
  };

  const shortcutsEnabled = !isNewCaseOpen && !isEditOpen && !isStatsOpen;
  const hasSelection = selectedCase !== null;

  useShortcut("j", () => moveSelection(1), { enabled: shortcutsEnabled });
  useShortcut("k", () => moveSelection(-1), { enabled: shortcutsEnabled });
  useShortcut("/", () => searchRef.current?.focus(), { enabled: shortcutsEnabled });
  useShortcut("c", () => setIsNewCaseOpen(true), { enabled: shortcutsEnabled });
  useShortcut("e", () => setIsStatsOpen(true), { enabled: shortcutsEnabled });
  useShortcut("m", () => setIsEditOpen(true), { enabled: shortcutsEnabled && hasSelection });
  useShortcut("n", () => focusManagementTab("nota"), { enabled: shortcutsEnabled && hasSelection });
  useShortcut("s", () => focusManagementTab("agendar"), { enabled: shortcutsEnabled && hasSelection });
  useShortcut("p", () => focusManagementTab("acuerdos"), { enabled: shortcutsEnabled && hasSelection });
  useShortcut("Escape", () => setIsDetailOpen(false), { enabled: shortcutsEnabled && !isWide && isDetailOpen });
  useShortcut("1", () => setFilter(FILTERS[0].key), { enabled: shortcutsEnabled });
  useShortcut("2", () => setFilter(FILTERS[1].key), { enabled: shortcutsEnabled });
  useShortcut("3", () => setFilter(FILTERS[2].key), { enabled: shortcutsEnabled });
  useShortcut("4", () => setFilter(FILTERS[3].key), { enabled: shortcutsEnabled });

  const saveAgreement = (dni: string, agreement: NewAgreement) => {
    setAgreement(dni, agreement);
    finishManagement("Acuerdo registrado");
  };

  return (
    <div className="flex h-full min-h-0">
      {showListPane ? (
        <section
          aria-label="Casos"
          className="flex w-full min-w-0 flex-col border-line-subtle bg-surface md:w-80 md:shrink-0 md:border-r"
        >
          <CaseList
            cases={visibleCases}
            selectedDni={selectedDni}
            filter={filter}
            counts={counts}
            query={query}
            listRef={listRef}
            searchRef={searchRef}
            onFilterChange={setFilter}
            onQueryChange={setQuery}
            onOpen={openCase}
            onMove={moveSelection}
            onNewCase={() => setIsNewCaseOpen(true)}
            onOpenStats={() => setIsStatsOpen(true)}
          />
        </section>
      ) : null}

      {showDetailPane ? (
        <section aria-label="Detalle" className="flex min-w-0 flex-1 flex-col bg-surface">
          {selectedCase ? (
            <CaseDetail
              account={selectedCase}
              labels={labels}
              tab={tab}
              onTabChange={setTab}
              onBack={() => setIsDetailOpen(false)}
              onEditCase={() => setIsEditOpen(true)}
              onApplyLabel={(labelId) => applyLabel(selectedCase.dni, labelId)}
              onRemoveLabel={(labelId) => removeLabel(selectedCase.dni, labelId)}
              onCreateLabel={(nombre: string, color: LabelColor) => createLabelFor(selectedCase.dni, nombre, color)}
              onSaveNote={(texto) => {
                addNote(selectedCase.dni, texto);
                finishManagement("Nota guardada");
              }}
              onSchedule={(fecha, motivo) => {
                schedule(selectedCase.dni, fecha, motivo);
                finishManagement("Seguimiento agendado");
              }}
              onResolveSchedule={() => {
                resolveSchedule(selectedCase.dni);
                setAnnouncement("Seguimiento resuelto");
              }}
              onSaveAgreement={(agreement) => saveAgreement(selectedCase.dni, agreement)}
              onToggleInstallment={(installmentId) => {
                toggleInstallment(selectedCase.dni, installmentId);
                setAnnouncement("Cuota actualizada");
              }}
              onToggleInstallmentStats={(installmentId) => {
                toggleInstallmentStats(selectedCase.dni, installmentId);
                setAnnouncement("Métricas actualizadas");
              }}
              onDeleteAgreement={() => {
                deleteAgreement(selectedCase.dni);
                setAnnouncement("Acuerdo eliminado");
              }}
            />
          ) : (
            <p className="p-3 text-[13px] text-fg-muted">Elegí un caso de la lista.</p>
          )}
        </section>
      ) : null}

      <CaseDialog
        open={isNewCaseOpen || isEditOpen}
        account={isEditOpen && selectedCase ? selectedCase : undefined}
        existingDnis={cases.map((account) => account.dni)}
        onOpenChange={closeCaseDialog}
        onCreate={createCase}
        onUpdate={saveCaseDetails}
      />
      <StatsDialog open={isStatsOpen} cases={cases} onOpenChange={setIsStatsOpen} />
      <p className="sr-only" role="status" aria-live="polite">
        {announcement}
      </p>
    </div>
  );
}
