import { createAgreement, type NewAgreement } from "./agreements";
import { addDaysIso, addMonthsIso, startOfMonthIso, todayIso } from "./dates";

export const ETIQUETAS = ["acuerdo", "pago", "acuerdo colchon", "cancelado"] as const;

export type Etiqueta = (typeof ETIQUETAS)[number];

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
  fecha?: string;
  pagada: boolean;
}

export interface Agreement {
  id: string;
  creado: string;
  cuotas: Installment[];
}

export interface Case {
  dni: string;
  nombre?: string;
  telefono?: string;
  cartera?: string;
  entidad?: string;
  monto?: number;
  mail?: string;
  etiquetas: Etiqueta[];
  ultimo_pago_fecha?: string;
  agendado_para?: string;
  agendado_motivo?: string;
  agendado_resuelto?: boolean;
  notas: Note[];
  acuerdo?: Agreement;
}

function agreementWithPaid(input: NewAgreement, paidCount: number): Agreement {
  const agreement = createAgreement(input);
  return {
    ...agreement,
    cuotas: agreement.cuotas.map((installment, index) => ({ ...installment, pagada: index < paidCount })),
  };
}

export function createMockCases(today: string = todayIso()): Case[] {
  const monthStart = startOfMonthIso(today);
  const lastMonth = addMonthsIso(today, -1);
  const timestamp = (iso: string) => `${iso}T13:00:00.000Z`;

  return [
    {
      dni: "27345128",
      nombre: "Marcela Giménez",
      telefono: "1155123456",
      cartera: "Mora 90+",
      entidad: "Banco Nación",
      monto: 18_450_000,
      mail: "marcela.gimenez@correo.com",
      etiquetas: ["acuerdo", "pago"],
      ultimo_pago_fecha: monthStart,
      agendado_para: today,
      agendado_motivo: "Consultar por confirmación de la transferencia",
      notas: [
        {
          id: "n-1",
          texto: "Confirma que transfiere el anticipo esta semana. Pidió el CBU por mail.",
          creada: timestamp(addDaysIso(today, -3)),
        },
      ],
      acuerdo: agreementWithPaid(
        { cuotas: 6, monto_cuota: 2_500_000, anticipo: { fecha: addDaysIso(today, -3), monto: 3_000_000 } },
        3,
      ),
    },
    {
      dni: "30112456",
      nombre: "Roberto Sosa",
      telefono: "3515234789",
      cartera: "Tarjetas",
      entidad: "Banco Galicia",
      monto: 6_230_050,
      etiquetas: ["acuerdo colchon"],
      agendado_para: addDaysIso(today, -2),
      agendado_motivo: "Llamar por la primera cuota",
      notas: [],
      acuerdo: agreementWithPaid({ cuotas: 3, monto_cuota: 2_076_683 }, 0),
    },
    {
      dni: "34876501",
      nombre: "Lucía Ferreyra",
      monto: 12_980_000,
      etiquetas: ["pago"],
      ultimo_pago_fecha: monthStart,
      notas: [],
    },
    {
      dni: "22987654",
      etiquetas: [],
      notas: [],
    },
    {
      dni: "28431907",
      nombre: "Diego Paz",
      telefono: "1144567890",
      cartera: "Consumo",
      entidad: "Naranja X",
      monto: 92_000_000,
      etiquetas: ["pago"],
      ultimo_pago_fecha: lastMonth,
      agendado_para: addDaysIso(today, 1),
      agendado_motivo: "Retomar contacto después del feriado",
      notas: [],
    },
    {
      dni: "31220874",
      nombre: "Carolina Ibarra",
      cartera: "Préstamos personales",
      entidad: "Banco Provincia",
      monto: 45_075_000,
      mail: "c.ibarra@correo.com",
      etiquetas: ["acuerdo", "cancelado"],
      ultimo_pago_fecha: lastMonth,
      agendado_para: addDaysIso(today, -5),
      agendado_motivo: "Verificar pago de la cuota 2",
      agendado_resuelto: true,
      notas: [],
      acuerdo: agreementWithPaid({ cuotas: 3, monto_cuota: 15_025_000 }, 3),
    },
    {
      dni: "25600318",
      nombre: "Héctor Molina",
      telefono: "2214871203",
      entidad: "Banco Ciudad",
      etiquetas: ["pago", "cancelado"],
      ultimo_pago_fecha: monthStart,
      notas: [],
    },
  ];
}
