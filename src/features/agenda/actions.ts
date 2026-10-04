import type { PostgrestError } from "@supabase/supabase-js";
import type { Label } from "@/lib/labels";
import { fail, ok, type Result } from "@/lib/result";
import { supabase } from "@/lib/supabase";
import type { Agreement, CaseDetails, Note } from "@/lib/types";
import { installmentsToPayload } from "./mappers";

export const SAVE_CHANGE_ERROR_MESSAGE = "No se pudo guardar el cambio. Revisá la conexión y probá de nuevo.";

function toResult(error: PostgrestError | null): Result {
  return error ? fail(SAVE_CHANGE_ERROR_MESSAGE) : ok();
}

export async function insertCase(id: string, dni: string, values: CaseDetails): Promise<Result> {
  const { error } = await supabase.from("casos").insert({
    id,
    dni,
    nombre: values.nombre ?? null,
    telefono: values.telefono ?? null,
    entidad: values.entidad ?? null,
    cartera: values.cartera ?? null,
    mail: values.mail ?? null,
    monto: values.monto ?? null,
  });
  return toResult(error);
}

export async function updateCaseDetails(id: string, values: CaseDetails): Promise<Result> {
  const { error } = await supabase
    .from("casos")
    .update({
      nombre: values.nombre ?? null,
      telefono: values.telefono ?? null,
      entidad: values.entidad ?? null,
      cartera: values.cartera ?? null,
      mail: values.mail ?? null,
      monto: values.monto ?? null,
    })
    .eq("id", id);
  return toResult(error);
}

export async function insertLabel(label: Label): Promise<Result> {
  const { error } = await supabase
    .from("etiquetas")
    .insert({ id: label.id, nombre: label.nombre, color: label.color });
  return toResult(error);
}

export async function linkLabel(caseId: string, labelId: string): Promise<Result> {
  const { error } = await supabase.from("caso_etiquetas").insert({ caso_id: caseId, etiqueta_id: labelId });
  return toResult(error);
}

export async function unlinkLabel(caseId: string, labelId: string): Promise<Result> {
  const { error } = await supabase
    .from("caso_etiquetas")
    .delete()
    .eq("caso_id", caseId)
    .eq("etiqueta_id", labelId);
  return toResult(error);
}

export async function insertNote(caseId: string, note: Note): Promise<Result> {
  const { error } = await supabase
    .from("notas")
    .insert({ id: note.id, caso_id: caseId, texto: note.texto, creada: note.creada });
  return toResult(error);
}

export async function upsertAgenda(caseId: string, fecha: string, motivo: string): Promise<Result> {
  const { error } = await supabase
    .from("agenda")
    .upsert({ caso_id: caseId, fecha, motivo, resuelto: false }, { onConflict: "caso_id" });
  return toResult(error);
}

export async function resolveAgenda(caseId: string): Promise<Result> {
  const { error } = await supabase.from("agenda").update({ resuelto: true }).eq("caso_id", caseId);
  return toResult(error);
}

export async function replaceAgreement(
  caseId: string,
  agreement: Agreement,
  hadPreviousPayments: boolean,
): Promise<Result> {
  const { error } = await supabase.rpc("reemplazar_acuerdo", {
    p_caso_id: caseId,
    p_acuerdo_id: agreement.id,
    p_producto: agreement.producto ?? null,
    p_cuotas: installmentsToPayload(agreement.cuotas),
    p_pagos_previos: hadPreviousPayments,
  });
  return toResult(error);
}

export async function deleteAgreement(caseId: string): Promise<Result> {
  const { error } = await supabase.from("acuerdos").delete().eq("caso_id", caseId);
  return toResult(error);
}

export async function updateInstallmentPayment(
  installmentId: string,
  isPaid: boolean,
  paidOn: string | null,
): Promise<Result> {
  const { error } = await supabase
    .from("cuotas")
    .update({ pagada: isPaid, pagada_fecha: paidOn })
    .eq("id", installmentId);
  return toResult(error);
}

export async function updateInstallmentStats(installmentId: string, isCounted: boolean): Promise<Result> {
  const { error } = await supabase.from("cuotas").update({ sumada_metricas: isCounted }).eq("id", installmentId);
  return toResult(error);
}
