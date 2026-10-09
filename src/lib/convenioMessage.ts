import { getPaymentMethods, type MetodoPago } from "@/constants/entidades";
import { completeProducts, type ConvenioCase, type ConvenioProduct } from "./convenio";
import { installmentLabel } from "./agreements";
import { formatArs } from "./format";
import { getConvenioWording } from "./convenioWording";
import { fail, ok, type Result } from "./result";
import type { Agreement, Installment } from "./types";

const COPY_ERROR_MESSAGE = "No se pudo copiar el convenio. Probá de nuevo.";

const LIBRE_DE_DEUDA_LINE =
  "Acreditado el pago total, podrá solicitar el certificado de Libre de Deuda dentro de los 15 días hábiles a través de su asesor o vía email a info@5ol.com.ar";

const INCUMPLIMIENTO_LINE =
  "En caso de incumplimiento, el presente acuerdo quedará sin efecto de forma automática, perdiéndose los beneficios y bonificaciones otorgados";

function formatFullDate(iso: string): string {
  const [year = "", month = "", day = ""] = iso.split("-");
  return `${day}/${month}/${year}`;
}

function installmentLine(installment: Installment): string {
  const label = installment.tipo === "cuota" ? `Cuota #${installment.numero}` : installmentLabel(installment);
  return `* ${label}: ${formatArs(installment.monto)} (Vencimiento: ${formatFullDate(installment.fecha)})`;
}

function paymentLines(methods: MetodoPago[]): string[] {
  return methods.map(({ etiqueta, valor }) => `* ${etiqueta}: ${valor}`);
}

function introductionLines(entidad: string, products: ConvenioProduct[]): string[] {
  const instructions = `Por medio del presente, y siguiendo expresas instrucciones de nuestro cliente ${entidad}`;
  const agreementText =
    "se formaliza el convenio de pago con el titular, sujeto a los términos y condiciones que se detallan a continuación:";
  if (products.length === 0) return [`${instructions}, ${agreementText}`];
  return [
    `${instructions}, se informa que el titular mantiene una deuda al día de la fecha originada con la entidad con los siguientes productos:`,
    "",
    ...products.map((row) => `* ${row.cartera} -${row.producto}`),
    "",
    `En virtud de ello, ${agreementText}`,
  ];
}

export function buildConvenioMessage(
  account: ConvenioCase,
  agreement: Agreement,
  products: ConvenioProduct[] = [],
): string {
  const methods = getPaymentMethods(account.entidad, agreement.producto);
  const total = agreement.cuotas.reduce((sum, installment) => sum + installment.monto, 0);
  const { planTitle } = getConvenioWording(account.entidad, agreement);
  const importantLines =
    agreement.tipo === "parcial" ? [INCUMPLIMIENTO_LINE] : [LIBRE_DE_DEUDA_LINE, INCUMPLIMIENTO_LINE];

  return [
    `Estimado/a ${account.nombre} -${account.dni}:`,
    ...introductionLines(account.entidad, completeProducts(products)),
    "",
    `${planTitle} (${formatArs(total)})`,
    ...agreement.cuotas.map(installmentLine),
    "",
    "MEDIOS DE PAGO HABILITADOS",
    "",
    ...paymentLines(methods),
    "",
    "IMPORTANTE:",
    ...importantLines.map((line) => `> ${line}`),
    "",
    `Dpto. de Cobranzas - 5oL / ${account.entidad}`,
  ].join("\n");
}

export async function copyConvenioMessage(
  account: ConvenioCase,
  agreement: Agreement,
  products: ConvenioProduct[] = [],
): Promise<Result> {
  try {
    await navigator.clipboard.writeText(buildConvenioMessage(account, agreement, products));
    return ok();
  } catch {
    return fail(COPY_ERROR_MESSAGE);
  }
}
