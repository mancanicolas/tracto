import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { createAgreement, type NewAgreement } from "@/lib/agreements";
import { todayIso } from "@/lib/dates";
import type { InstallmentAlertKind } from "@/lib/installmentAlert";
import type { Label, LabelColor } from "@/lib/labels";
import type { Result } from "@/lib/result";
import type { Agreement, Case, CaseDetails, Installment, Note } from "@/lib/types";
import * as writes from "./actions";
import { fetchAgendaData } from "./queries";

type LoadStatus = "loading" | "ready" | "error";

interface State {
  status: LoadStatus;
  cases: Case[];
  labels: Label[];
}

type Action =
  | { type: "load_started" }
  | { type: "loaded"; cases: Case[]; labels: Label[] }
  | { type: "load_failed" }
  | { type: "add"; account: Case }
  | { type: "case_update"; dni: string; values: CaseDetails }
  | { type: "case_archive"; dni: string; isArchived: boolean }
  | { type: "case_remove"; dni: string }
  | { type: "label_create"; label: Label }
  | { type: "label_apply"; dni: string; labelId: string }
  | { type: "label_remove"; dni: string; labelId: string }
  | { type: "note_add"; dni: string; note: Note }
  | { type: "schedule"; dni: string; fecha: string; motivo: string }
  | { type: "schedule_resolve"; dni: string; note: Note }
  | { type: "agreement_set"; dni: string; agreement: Agreement }
  | { type: "agreement_delete"; dni: string }
  | { type: "installment_toggle"; dni: string; installmentId: string; today: string }
  | { type: "installment_stats_toggle"; dni: string; installmentId: string }
  | { type: "installment_alert_done"; dni: string; installmentId: string; kind: InstallmentAlertKind };

const INITIAL_STATE: State = { status: "loading", cases: [], labels: [] };

function hasPaidInstallment(account: Case): boolean {
  return account.acuerdo?.cuotas.some((installment) => installment.pagada) ?? false;
}

function update(cases: Case[], dni: string, change: (account: Case) => Case): Case[] {
  return cases.map((account) => (account.dni === dni ? change(account) : account));
}

function updateInstallment(
  cases: Case[],
  dni: string,
  installmentId: string,
  change: (installment: Installment) => Installment,
): Case[] {
  return update(cases, dni, (account) =>
    account.acuerdo
      ? {
          ...account,
          acuerdo: {
            ...account.acuerdo,
            cuotas: account.acuerdo.cuotas.map((installment) =>
              installment.id === installmentId ? change(installment) : installment,
            ),
          },
        }
      : account,
  );
}

function reducer(state: State, action: Action): State {
  const withCases = (cases: Case[]): State => ({ ...state, cases });

  switch (action.type) {
    case "load_started":
      return { ...state, status: "loading" };
    case "loaded":
      return { status: "ready", cases: action.cases, labels: action.labels };
    case "load_failed":
      return state.status === "ready" ? state : { ...state, status: "error" };
    case "add":
      return withCases([action.account, ...state.cases]);
    case "case_update":
      return withCases(update(state.cases, action.dni, (a) => ({ ...a, ...action.values })));
    case "case_archive":
      return withCases(update(state.cases, action.dni, (a) => ({ ...a, archivado: action.isArchived })));
    case "case_remove":
      return withCases(state.cases.filter((a) => a.dni !== action.dni));
    case "label_create":
      return { ...state, labels: [...state.labels, action.label] };
    case "label_apply":
      return withCases(
        update(state.cases, action.dni, (a) =>
          a.etiquetas.includes(action.labelId) ? a : { ...a, etiquetas: [...a.etiquetas, action.labelId] },
        ),
      );
    case "label_remove":
      return withCases(
        update(state.cases, action.dni, (a) => ({
          ...a,
          etiquetas: a.etiquetas.filter((id) => id !== action.labelId),
        })),
      );
    case "note_add":
      return withCases(update(state.cases, action.dni, (a) => ({ ...a, notas: [action.note, ...a.notas] })));
    case "schedule":
      return withCases(
        update(state.cases, action.dni, (a) => ({
          ...a,
          agendado_para: action.fecha,
          agendado_motivo: action.motivo,
          agendado_resuelto: false,
        })),
      );
    case "schedule_resolve":
      return withCases(
        update(state.cases, action.dni, (a) => ({ ...a, agendado_resuelto: true, notas: [action.note, ...a.notas] })),
      );
    case "agreement_set":
      return withCases(
        update(state.cases, action.dni, (a) => ({
          ...a,
          acuerdo: action.agreement,
          pagos_previos: a.pagos_previos || hasPaidInstallment(a),
        })),
      );
    case "agreement_delete":
      return withCases(update(state.cases, action.dni, (a) => ({ ...a, acuerdo: undefined })));
    case "installment_toggle":
      return withCases(
        updateInstallment(state.cases, action.dni, action.installmentId, (installment) => ({
          ...installment,
          pagada: !installment.pagada,
          pagada_fecha: installment.pagada ? undefined : action.today,
        })),
      );
    case "installment_alert_done":
      return withCases(
        updateInstallment(state.cases, action.dni, action.installmentId, (installment) =>
          action.kind === "recordatorio" ? { ...installment, reminderDone: true } : { ...installment, claimDone: true },
        ),
      );
    case "installment_stats_toggle":
      return withCases(
        updateInstallment(state.cases, action.dni, action.installmentId, (installment) => ({
          ...installment,
          countedInStats: !installment.countedInStats,
        })),
      );
  }
}

export function useCases() {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  });

  const load = useCallback(async () => {
    const result = await fetchAgendaData();
    if (result.ok) dispatch({ type: "loaded", ...result.data });
    else dispatch({ type: "load_failed" });
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const retry = useCallback(() => {
    dispatch({ type: "load_started" });
    void load();
  }, [load]);

  const commit = useCallback(
    async (action: Action, write: () => Promise<Result>) => {
      setMutationError(null);
      dispatch(action);
      const result = await write();
      if (!result.ok) {
        setMutationError(result.error);
        await load();
      }
    },
    [load],
  );

  const findCase = useCallback(
    (dni: string): Case | undefined => stateRef.current.cases.find((account) => account.dni === dni),
    [],
  );

  const actions = useMemo(
    () => ({
      addCase: (dni: string, values: CaseDetails) => {
        const id = crypto.randomUUID();
        void commit({ type: "add", account: { id, dni, ...values, etiquetas: [], notas: [] } }, () =>
          writes.insertCase(id, dni, values),
        );
      },
      updateCase: (dni: string, values: CaseDetails) => {
        const account = findCase(dni);
        if (!account) return;
        void commit({ type: "case_update", dni, values }, () => writes.updateCaseDetails(account.id, values));
      },
      archiveCase: (dni: string, isArchived: boolean) => {
        const account = findCase(dni);
        if (!account) return;
        void commit({ type: "case_archive", dni, isArchived }, () => writes.updateCaseArchived(account.id, isArchived));
      },
      removeCase: (dni: string) => {
        const account = findCase(dni);
        if (!account) return;
        void commit({ type: "case_remove", dni }, () => writes.deleteCase(account.id));
      },
      applyLabel: (dni: string, labelId: string) => {
        const account = findCase(dni);
        if (!account) return;
        void commit({ type: "label_apply", dni, labelId }, () => writes.linkLabel(account.id, labelId));
      },
      removeLabel: (dni: string, labelId: string) => {
        const account = findCase(dni);
        if (!account) return;
        void commit({ type: "label_remove", dni, labelId }, () => writes.unlinkLabel(account.id, labelId));
      },
      createLabelFor: (dni: string, nombre: string, color: LabelColor) => {
        const account = findCase(dni);
        if (!account) return;
        const label: Label = { id: crypto.randomUUID(), nombre, color };
        dispatch({ type: "label_create", label });
        void commit({ type: "label_apply", dni, labelId: label.id }, async () => {
          const created = await writes.insertLabel(label);
          return created.ok ? writes.linkLabel(account.id, label.id) : created;
        });
      },
      addNote: (dni: string, texto: string) => {
        const account = findCase(dni);
        if (!account) return;
        const note: Note = { id: crypto.randomUUID(), texto, creada: new Date().toISOString() };
        void commit({ type: "note_add", dni, note }, () => writes.insertNote(account.id, note));
      },
      schedule: (dni: string, fecha: string, motivo: string) => {
        const account = findCase(dni);
        if (!account) return;
        void commit({ type: "schedule", dni, fecha, motivo }, () => writes.upsertAgenda(account.id, fecha, motivo));
      },
      resolveSchedule: (dni: string) => {
        const account = findCase(dni);
        if (!account) return;
        const note: Note = {
          id: crypto.randomUUID(),
          texto: account.agendado_motivo?.trim() || "Sin motivo",
          creada: new Date().toISOString(),
          origen: "agenda",
        };
        void commit({ type: "schedule_resolve", dni, note }, async () => {
          const resolved = await writes.resolveAgenda(account.id);
          return resolved.ok ? writes.insertNote(account.id, note) : resolved;
        });
      },
      setAgreement: (dni: string, input: NewAgreement) => {
        const account = findCase(dni);
        if (!account) return;
        const agreement = createAgreement(input);
        const hadPreviousPayments = Boolean(account.pagos_previos) || hasPaidInstallment(account);
        void commit({ type: "agreement_set", dni, agreement }, () =>
          writes.replaceAgreement(account.id, agreement, hadPreviousPayments),
        );
      },
      deleteAgreement: (dni: string) => {
        const account = findCase(dni);
        if (!account) return;
        void commit({ type: "agreement_delete", dni }, () => writes.deleteAgreement(account.id));
      },
      toggleInstallment: (dni: string, installmentId: string) => {
        const installment = findCase(dni)?.acuerdo?.cuotas.find((item) => item.id === installmentId);
        if (!installment) return;
        const today = todayIso();
        const willBePaid = !installment.pagada;
        void commit({ type: "installment_toggle", dni, installmentId, today }, () =>
          writes.updateInstallmentPayment(installmentId, willBePaid, willBePaid ? today : null),
        );
      },
      markAlertDone: (dni: string, installmentId: string, kind: InstallmentAlertKind) => {
        void commit({ type: "installment_alert_done", dni, installmentId, kind }, () =>
          writes.markInstallmentAlertDone(installmentId, kind),
        );
      },
      toggleInstallmentStats: (dni: string, installmentId: string) => {
        const installment = findCase(dni)?.acuerdo?.cuotas.find((item) => item.id === installmentId);
        if (!installment) return;
        void commit({ type: "installment_stats_toggle", dni, installmentId }, () =>
          writes.updateInstallmentStats(installmentId, !installment.countedInStats),
        );
      },
    }),
    [commit, findCase],
  );

  return {
    status: state.status,
    cases: state.cases,
    labels: state.labels,
    mutationError,
    clearMutationError: () => setMutationError(null),
    retry,
    ...actions,
  };
}
