import { getPaymentMethods, type PaymentMethod } from "@/constants/entidades";
import type { ConvenioCase } from "./convenio";
import { installmentLabel } from "./agreements";
import { todayIso } from "./dates";
import { formatArs } from "./format";
import { getConvenioWording } from "./convenioWording";
import { fail, ok, type Result } from "./result";
import type { Agreement, Installment } from "./types";

const COPY_ERROR_MESSAGE = "No se pudo copiar el convenio. Probá de nuevo.";

const IMPORTANT_LINES = [
  "Acreditado el pago total, podrá solicitar el certificado de Libre de Deuda dentro de los 15 días hábiles a través de su asesor o vía email a info@5ol.com.ar",
  "En caso de incumplimiento, el presente acuerdo quedará sin efecto de forma automática, perdiéndose los beneficios y bonificaciones otorgados",
];

function formatFullDate(iso: string): string {
  const [year = "", month = "", day = ""] = iso.split("-");
  return `${day}/${month}/${year}`;
}

function installmentLine(installment: Installment): string {
  const label = installment.tipo === "cuota" ? `Cuota #${installment.numero}` : installmentLabel(installment);
  return `• ${label}: ${formatArs(installment.monto)} (Vencimiento: ${formatFullDate(installment.fecha)})`;
}

function labeled(label: string, value: string | undefined): string[] {
  return value ? [`• *${label}:* ${value}`] : [];
}

function transferBlock(methods: PaymentMethod[]): string[] {
  const transfer = methods.find((paymentMethod) => paymentMethod.tipo === "transferencia");
  if (!transfer) return [];
  return [
    "*Transferencia / Depósito Bancario*",
    ...labeled("Banco", transfer.banco),
    ...labeled("Alias", transfer.alias),
    ...labeled("CBU", transfer.cbu),
    ...labeled("Titular", transfer.titular),
    ...labeled("CUIT", transfer.cuit),
    ...labeled("Cuenta", transfer.cuenta),
  ];
}

function cashBlock(methods: PaymentMethod[]): string[] {
  const cash = methods.filter((paymentMethod) => paymentMethod.tipo === "rapipago" || paymentMethod.tipo === "pagoFacil");
  if (cash.length === 0) return [];
  return [
    "*Pago en Efectivo*",
    ...cash.map((paymentMethod) =>
      paymentMethod.detalle ? `• *${paymentMethod.nombre}:* ${paymentMethod.detalle}` : `• *${paymentMethod.nombre}*`,
    ),
  ];
}

function otherBlock(methods: PaymentMethod[]): string[] {
  const others = methods.filter((paymentMethod) => paymentMethod.tipo === "otro");
  if (others.length === 0) return [];
  return [
    "*Otros medios de pago*",
    ...others.map((paymentMethod) =>
      paymentMethod.detalle ? `• *${paymentMethod.nombre}:* ${paymentMethod.detalle}` : `• *${paymentMethod.nombre}*`,
    ),
  ];
}

function numberedBlocks(blocks: string[][]): string[] {
  const present = blocks.filter((block) => block.length > 0);
  return present.flatMap((block, index) => {
    const [title = "", ...lines] = block;
    const numbered = `${title.slice(0, 1)}${index + 1}. ${title.slice(1)}`;
    return [...(index > 0 ? [""] : []), numbered, ...lines];
  });
}

export function buildConvenioMessage(account: ConvenioCase, agreement: Agreement, today: string = todayIso()): string {
  const methods = getPaymentMethods(account.entidad, agreement.producto);
  const total = agreement.cuotas.reduce((sum, installment) => sum + installment.monto, 0);
  const { planTitle, purpose } = getConvenioWording(account.entidad, agreement);
  const paymentBlocks = numberedBlocks([transferBlock(methods), cashBlock(methods), otherBlock(methods)]);

  return [
    `*Estimado/a ${account.nombre} - ${account.dni}:*`,
    "",
    `Le informamos desde 5oL, en representación de ${account.entidad}, los términos del convenio de pago formalizado el ${formatFullDate(today)} para la ${purpose} de sus obligaciones de ${account.cartera ?? ""}`,
    "",
    `*${planTitle} (${formatArs(total)})*`,
    ...agreement.cuotas.map(installmentLine),
    "",
    "*MEDIOS DE PAGO HABILITADOS*",
    "",
    ...paymentBlocks,
    "",
    "*IMPORTANTE:*",
    ...IMPORTANT_LINES.map((line) => `• ${line}`),
    "",
    `*Dpto. de Cobranzas - 5oL / ${account.entidad}*`,
  ].join("\n");
}

export async function copyConvenioMessage(account: ConvenioCase, agreement: Agreement): Promise<Result> {
  try {
    await navigator.clipboard.writeText(buildConvenioMessage(account, agreement));
    return ok();
  } catch {
    return fail(COPY_ERROR_MESSAGE);
  }
}
