import { useMemo, useReducer } from "react";
import type { Agreement, Case, Etiqueta, Note } from "@/lib/mock";

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

export type NewAgreement = DistributiveOmit<Agreement, "id" | "creado">;

type Action =
  | { type: "add"; account: Case }
  | { type: "tag_add"; dni: string; tag: Etiqueta }
  | { type: "tag_remove"; dni: string; tag: Etiqueta }
  | { type: "note_add"; dni: string; note: Note }
  | { type: "schedule"; dni: string; fecha: string; motivo: string }
  | { type: "schedule_resolve"; dni: string }
  | { type: "agreement_add"; dni: string; agreement: Agreement };

function withTag(tags: Etiqueta[], tag: Etiqueta): Etiqueta[] {
  return tags.includes(tag) ? tags : [...tags, tag];
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
    case "agreement_add":
      return update(cases, action.dni, (a) => ({
        ...a,
        acuerdos: [action.agreement, ...a.acuerdos],
        etiquetas: withTag(a.etiquetas, action.agreement.tipo === "plan" ? "Acuerdo" : "Pago parcial"),
      }));
  }
}

export function useCases(initial: () => Case[]) {
  const [cases, dispatch] = useReducer(reducer, undefined, initial);

  const actions = useMemo(
    () => ({
      addCase: (dni: string) =>
        dispatch({ type: "add", account: { dni, etiquetas: [], notas: [], acuerdos: [] } }),
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
      addAgreement: (dni: string, agreement: NewAgreement) =>
        dispatch({
          type: "agreement_add",
          dni,
          agreement: { ...agreement, id: crypto.randomUUID(), creado: new Date().toISOString() } as Agreement,
        }),
    }),
    [],
  );

  return { cases, ...actions };
}
