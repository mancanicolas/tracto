import { createAgreement, type NewAgreement } from "./agreements";
import { addDaysIso, addMonthsIso, startOfMonthIso, todayIso } from "./dates";
import type { Label } from "./labels";

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
  etiquetas: string[];
  ultimo_pago_fecha?: string;
  agendado_para?: string;
  agendado_motivo?: string;
  agendado_resuelto?: boolean;
  notas: Note[];
  acuerdo?: Agreement;
  pagos_previos?: boolean;
}

export function createMockLabels(): Label[] {
  return [
    { id: "label-whatsapp", nombre: "Prefiere WhatsApp", color: "turquesa" },
    { id: "label-tarde", nombre: "Llamar de tarde", color: "fucsia" },
    { id: "label-reclamo", nombre: "Reclamo", color: "naranja" },
    { id: "label-prioritario", nombre: "Prioritario", color: "indigo" },
    { id: "label-judicial", nombre: "Judicial", color: "gris" },
  ];
}

function agreementWithPayments(input: NewAgreement, payments: Record<number, string>): Agreement {
  const agreement = createAgreement(input);
  return {
    ...agreement,
    cuotas: agreement.cuotas.map((installment, index) => {
      const paidOn = payments[index];
      return paidOn ? { ...installment, pagada: true, pagada_fecha: paidOn } : installment;
    }),
  };
}

export function createMockCases(today: string = todayIso()): Case[] {
  const monthStart = startOfMonthIso(today);
  const lastMonthStart = addMonthsIso(monthStart, -1);
  const twoMonthsAgoStart = addMonthsIso(monthStart, -2);
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
      etiquetas: ["label-whatsapp", "label-prioritario"],
      agendado_para: today,
      agendado_motivo: "Consultar por confirmación de la transferencia",
      notas: [
        {
          id: "n-1",
          texto: "Confirma que transfiere la cuota de este mes. Pidió el CBU por mail.",
          creada: timestamp(addDaysIso(today, -3)),
        },
      ],
      acuerdo: agreementWithPayments(
        {
          cuotas: 6,
          monto_cuota: 2_500_000,
          primer_vencimiento: addDaysIso(twoMonthsAgoStart, 9),
          anticipo: { fecha: addDaysIso(twoMonthsAgoStart, 2), monto: 3_000_000 },
        },
        {
          0: addDaysIso(twoMonthsAgoStart, 2),
          1: addDaysIso(twoMonthsAgoStart, 10),
          2: addDaysIso(lastMonthStart, 9),
          3: monthStart,
        },
      ),
    },
    {
      dni: "30112456",
      nombre: "Roberto Sosa",
      telefono: "3515234789",
      cartera: "Tarjetas",
      entidad: "Banco Galicia",
      monto: 6_230_050,
      etiquetas: ["label-reclamo"],
      agendado_para: addDaysIso(today, -2),
      agendado_motivo: "Llamar por la cuota de este mes",
      notas: [],
      acuerdo: agreementWithPayments(
        { cuotas: 4, monto_cuota: 1_557_513, primer_vencimiento: addDaysIso(lastMonthStart, 9) },
        { 0: addDaysIso(lastMonthStart, 11) },
      ),
    },
    {
      dni: "34876501",
      nombre: "Lucía Ferreyra",
      monto: 12_980_000,
      etiquetas: ["label-tarde"],
      notas: [],
      acuerdo: agreementWithPayments(
        {
          cuotas: 4,
          monto_cuota: 3_245_000,
          primer_vencimiento: addDaysIso(today, 5),
        },
        {},
      ),
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
      etiquetas: ["label-judicial"],
      ultimo_pago_fecha: lastMonthStart,
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
      etiquetas: ["label-whatsapp"],
      agendado_para: addDaysIso(today, -5),
      agendado_motivo: "Verificar pago de la cuota 2",
      agendado_resuelto: true,
      notas: [],
      acuerdo: agreementWithPayments(
        { cuotas: 3, monto_cuota: 15_025_000, primer_vencimiento: addDaysIso(twoMonthsAgoStart, 9) },
        {
          0: addDaysIso(twoMonthsAgoStart, 9),
          1: addDaysIso(lastMonthStart, 8),
          2: addDaysIso(monthStart, 0),
        },
      ),
    },
    {
      dni: "25600318",
      nombre: "Héctor Molina",
      telefono: "2214871203",
      entidad: "Banco Ciudad",
      etiquetas: [],
      ultimo_pago_fecha: monthStart,
      notas: [],
    },
  ];
}
