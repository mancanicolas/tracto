export interface Note {
  id: string;
  texto: string;
  creada: string;
}

export interface Installment {
  id: string;
  tipo: "anticipo" | "cuota";
  numero?: number;
  monto: number;
  fecha: string;
  pagada: boolean;
  pagada_fecha?: string;
  countedInStats: boolean;
}

export interface Agreement {
  id: string;
  creado: string;
  cuotas: Installment[];
}

export type CaseDetails = Pick<Case, "nombre" | "telefono" | "entidad" | "cartera" | "producto" | "mail" | "monto">;

export interface Case {
  id: string;
  dni: string;
  nombre?: string;
  telefono?: string;
  cartera?: string;
  producto?: string;
  entidad?: string;
  monto?: number;
  mail?: string;
  etiquetas: string[];
  ultimo_pago_fecha?: string;
  agendado_para?: string;
  agendado_motivo?: string;
  agendado_resuelto?: boolean;
  notas: Note[];
  acuerdo?: Agreement;
  pagos_previos?: boolean;
}
