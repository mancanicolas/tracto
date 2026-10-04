import { useMemo, useReducer } from "react";
import { createAgreement, type NewAgreement } from "@/lib/agreements";
import type { Agreement, Case, Etiqueta, Note } from "@/lib/mock";

type Action =
  | { type: "add"; account: Case }
  | { type: "tag_add"; dni: string; tag: Etiqueta }
  | { type: "tag_remove"; dni: string; tag: Etiqueta }
  | { type: "note_add"; dni: string; note: Note }
  | { type: "schedule"; dni: string; fecha: string; motivo: string }
  | { type: "schedule_resolve"; dni: string }
  | { type: "agreement_set"; dni: string; agreement: Agreement }
  | { type: "agreement_delete"; dni: string }
  | { type: "installment_toggle"; dni: string; installmentId: string };

function withTag(tags: Etiqueta[], tag: Etiqueta): Etiqueta[] {
  return tags.includes(tag) ? tags : [...tags, tag];
}

function withAgreementTag(tags: Etiqueta[]): Etiqueta[] {
  return tags.includes("acuerdo") || tags.includes("acuerdo colchon") ? tags : [...tags, "acuerdo"];
}

function update(cases: Case[], dni: string, change: (account: Case) => Case): Case[] {
  return cases.map((account) => (account.dni === dni ? change(account) : account));
}

function reducer(cases: Case[], action: Action): Case[] {
  switch (action.type) {
    case "add":
      return [action.account, ...cases];
    case "tag_add":
      return update(cases, action.dni, (a) => ({ ...a, etiquetas: withTag(a.etiquetas, action.tag) }));
    case "tag_remove":
      return update(cases, action.dni, (a) => ({ ...a, etiquetas: a.etiquetas.filter((t) => t !== action.tag) }));
    case "note_add":
      return update(cases, action.dni, (a) => ({ ...a, notas: [action.note, ...a.notas] }));
    case "schedule":
      return update(cases, action.dni, (a) => ({
        ...a,
        agendado_para: action.fecha,
        agendado_motivo: action.motivo,
        agendado_resuelto: false,
      }));
    case "schedule_resolve":
      return update(cases, action.dni, (a) => ({ ...a, agendado_resuelto: true }));
    case "agreement_set":
      return update(cases, action.dni, (a) => ({
        ...a,
        acuerdo: action.agreement,
        etiquetas: withAgreementTag(a.etiquetas),
      }));
    case "agreement_delete":
      return update(cases, action.dni, (a) => ({ ...a, acuerdo: undefined }));
    case "installment_toggle":
      return update(cases, action.dni, (a) =>
        a.acuerdo
          ? {
              ...a,
              acuerdo: {
                ...a.acuerdo,
                cuotas: a.acuerdo.cuotas.map((installment) =>
                  installment.id === action.installmentId
                    ? { ...installment, pagada: !installment.pagada }
                    : installment,
                ),
              },
            }
          : a,
      );
  }
}

export function useCases(initial: () => Case[]) {
  const [cases, dispatch] = useReducer(reducer, undefined, initial);

  const actions = useMemo(
    () => ({
      addCase: (dni: string) => dispatch({ type: "add", account: { dni, etiquetas: [], notas: [] } }),
      addTag: (dni: string, tag: Etiqueta) => dispatch({ type: "tag_add", dni, tag }),
      removeTag: (dni: string, tag: Etiqueta) => dispatch({ type: "tag_remove", dni, tag }),
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
      toggleInstallment: (dni: string, installmentId: string) =>
        dispatch({ type: "installment_toggle", dni, installmentId }),
    }),
    [],
  );

  return { cases, ...actions };
}
