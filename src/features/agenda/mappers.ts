import type { Label, LabelColor } from "@/lib/labels";
import type { Agreement, Case, Installment, Note } from "@/lib/types";

export interface CuotaRow {
  id: string;
  orden: number;
  tipo: "anticipo" | "cuota" | "parcial";
  numero: number | null;
  monto: number;
  fecha: string;
  pagada: boolean;
  pagada_fecha: string | null;
  sumada_metricas: boolean;
  recordatorio_hecho: boolean;
  reclamo_hecho: boolean;
}

export interface AcuerdoRow {
  id: string;
  creado: string;
  producto: string | null;
  tipo: "cuotas" | "parcial" | null;
  cuotas: CuotaRow[];
}

export interface NotaRow {
  id: string;
  texto: string;
  creada: string;
  origen: "agenda" | null;
}

export interface AgendaRow {
  fecha: string;
  motivo: string;
  resuelto: boolean;
  hora: string | null;
}

export interface CasoRow {
  id: string;
  dni: string;
  nombre: string | null;
  telefono: string | null;
  cartera: string | null;
  entidad: string | null;
  monto: number | null;
  mail: string | null;
  ultimo_pago_fecha: string | null;
  pagos_previos: boolean;
  archivado: boolean;
  caso_etiquetas: { etiqueta_id: string }[];
  notas: NotaRow[];
  agenda: AgendaRow | AgendaRow[] | null;
  acuerdos: AcuerdoRow | AcuerdoRow[] | null;
}

export interface EtiquetaRow {
  id: string;
  nombre: string;
  color: LabelColor;
}

function single<T>(value: T | T[] | null): T | undefined {
  if (value === null) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

function toInstallment(row: CuotaRow): Installment {
  return {
    id: row.id,
    tipo: row.tipo,
    numero: row.numero ?? undefined,
    monto: row.monto,
    fecha: row.fecha,
    pagada: row.pagada,
    pagada_fecha: row.pagada_fecha ?? undefined,
    countedInStats: row.sumada_metricas,
    reminderDone: row.recordatorio_hecho,
    claimDone: row.reclamo_hecho,
  };
}

function toAgreement(row: AcuerdoRow): Agreement {
  return {
    id: row.id,
    creado: row.creado,
    tipo: row.tipo ?? "cuotas",
    producto: row.producto ?? undefined,
    cuotas: [...row.cuotas].sort((a, b) => a.orden - b.orden).map(toInstallment),
  };
}

function toNote(row: NotaRow): Note {
  return { id: row.id, texto: row.texto, creada: row.creada, origen: row.origen ?? undefined };
}

export function toCase(row: CasoRow): Case {
  const agenda = single(row.agenda);
  const acuerdo = single(row.acuerdos);
  return {
    id: row.id,
    dni: row.dni,
    nombre: row.nombre ?? undefined,
    telefono: row.telefono ?? undefined,
    cartera: row.cartera ?? undefined,
    entidad: row.entidad ?? undefined,
    monto: row.monto ?? undefined,
    mail: row.mail ?? undefined,
    etiquetas: row.caso_etiquetas.map((link) => link.etiqueta_id),
    ultimo_pago_fecha: row.ultimo_pago_fecha ?? undefined,
    agendado_para: agenda?.fecha,
    agendado_motivo: agenda?.motivo,
    agendado_hora: agenda?.hora ?? undefined,
    agendado_resuelto: agenda?.resuelto,
    notas: [...row.notas].sort((a, b) => b.creada.localeCompare(a.creada)).map(toNote),
    acuerdo: acuerdo ? toAgreement(acuerdo) : undefined,
    pagos_previos: row.pagos_previos,
    archivado: row.archivado,
  };
}

export function toLabel(row: EtiquetaRow): Label {
  return { id: row.id, nombre: row.nombre, color: row.color };
}

export function installmentsToPayload(installments: Installment[]) {
  return installments.map((installment, orden) => ({
    id: installment.id,
    orden,
    tipo: installment.tipo,
    numero: installment.numero ?? null,
    monto: installment.monto,
    fecha: installment.fecha,
  }));
}
