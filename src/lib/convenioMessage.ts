import { getPaymentMethods, type MetodoPago } from "@/constants/entidades";
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

function paymentLines(methods: MetodoPago[]): string[] {
  return methods.map(({ etiqueta, valor }) => `• *${etiqueta}:* ${valor}`);
}

export function buildConvenioMessage(account: ConvenioCase, agreement: Agreement, today: string = todayIso()): string {
  const methods = getPaymentMethods(account.entidad, agreement.producto);
  const total = agreement.cuotas.reduce((sum, installment) => sum + installment.monto, 0);
  const { planTitle, purpose } = getConvenioWording(account.entidad, agreement);

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
    ...paymentLines(methods),
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
