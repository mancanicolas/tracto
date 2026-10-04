import { useMemo, useReducer } from "react";
import { createAgreement, type NewAgreement } from "@/lib/agreements";
import { todayIso } from "@/lib/dates";
import type { Label, LabelColor } from "@/lib/labels";
import type { Agreement, Case, Installment, Note } from "@/lib/mock";

export type CaseDetails = Pick<Case, "nombre" | "telefono" | "entidad" | "cartera" | "mail" | "monto">;

interface State {
  cases: Case[];
  labels: Label[];
}

type Action =
  | { type: "add"; account: Case }
  | { type: "case_update"; dni: string; values: CaseDetails }
  | { type: "label_create"; label: Label }
  | { type: "label_apply"; dni: string; labelId: string }
  | { type: "label_remove"; dni: string; labelId: string }
  | { type: "note_add"; dni: string; note: Note }
  | { type: "schedule"; dni: string; fecha: string; motivo: string }
  | { type: "schedule_resolve"; dni: string }
  | { type: "agreement_set"; dni: string; agreement: Agreement }
  | { type: "agreement_delete"; dni: string }
  | { type: "installment_toggle"; dni: string; installmentId: string; today: string }
  | { type: "installment_stats_toggle"; dni: string; installmentId: string };

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
    case "add":
      return withCases([action.account, ...state.cases]);
    case "case_update":
      return withCases(update(state.cases, action.dni, (a) => ({ ...a, ...action.values })));
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
      return withCases(update(state.cases, action.dni, (a) => ({ ...a, agendado_resuelto: true })));
    case "agreement_set":
      return withCases(update(state.cases, action.dni, (a) => ({
          ...a,
          acuerdo: action.agreement,
          pagos_previos: a.pagos_previos || (a.acuerdo?.cuotas.some((installment) => installment.pagada) ?? false),
        })));
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
    case "installment_stats_toggle":
      return withCases(
        updateInstallment(state.cases, action.dni, action.installmentId, (installment) => ({
          ...installment,
          countedInStats: !installment.countedInStats,
        })),
      );
  }
}

export function useCases(initialCases: () => Case[], initialLabels: () => Label[]) {
  const [state, dispatch] = useReducer(reducer, undefined, () => ({
    cases: initialCases(),
    labels: initialLabels(),
  }));

  const actions = useMemo(
    () => ({
      addCase: (dni: string) => dispatch({ type: "add", account: { dni, etiquetas: [], notas: [] } }),
      updateCase: (dni: string, values: CaseDetails) => dispatch({ type: "case_update", dni, values }),
      applyLabel: (dni: string, labelId: string) => dispatch({ type: "label_apply", dni, labelId }),
      removeLabel: (dni: string, labelId: string) => dispatch({ type: "label_remove", dni, labelId }),
      createLabelFor: (dni: string, nombre: string, color: LabelColor) => {
        const label: Label = { id: crypto.randomUUID(), nombre, color };
        dispatch({ type: "label_create", label });
        dispatch({ type: "label_apply", dni, labelId: label.id });
      },
      addNote: (dni: string, texto: string) =>
        dispatch({
          type: "note_add",
          dni,
          note: { id: crypto.randomUUID(), texto, creada: new Date().toISOString() },
        }),
      schedule: (dni: string, fecha: string, motivo: string) => dispatch({ type: "schedule", dni, fecha, motivo }),
      resolveSchedule: (dni: string) => dispatch({ type: "schedule_resolve", dni }),
      setAgreement: (dni: string, input: NewAgreement) =>
        dispatch({ type: "agreement_set", dni, agreement: createAgreement(input) }),
      deleteAgreement: (dni: string) => dispatch({ type: "agreement_delete", dni }),
      toggleInstallmentStats: (dni: string, installmentId: string) =>
        dispatch({ type: "installment_stats_toggle", dni, installmentId }),
      toggleInstallment: (dni: string, installmentId: string) =>
        dispatch({ type: "installment_toggle", dni, installmentId, today: todayIso() }),
    }),
    [],
  );

  return { cases: state.cases, labels: state.labels, ...actions };
}
