import { formatPaymentMethod, getPaymentMethods } from "@/constants/entidades";
import type { ConvenioCase } from "./convenio";
import { formatAmount } from "./format";
import { fail, ok, type Result } from "./result";
import type { Agreement } from "./types";

const PENDING_METHODS_TEXT = "A confirmar con el operador";
const COPY_ERROR_MESSAGE = "No se pudo copiar el convenio. Probá de nuevo.";

function formatFullDate(iso: string): string {
  const [year = "", month = "", day = ""] = iso.split("-");
  return `${day}/${month}/${year}`;
}

export function buildConvenioMessage(account: ConvenioCase, agreement: Agreement): string {
  const methods = getPaymentMethods(account.entidad, agreement.producto).map(formatPaymentMethod).join(" | ");
  const pending = agreement.cuotas.filter((installment) => !installment.pagada);
  const source = pending.length > 0 ? pending : agreement.cuotas;
  const total = source.reduce((sum, installment) => sum + installment.monto, 0);
  const dueDate = source.map((installment) => installment.fecha).sort()[0] ?? "";

  return [
    `CONVENIO DE PAGO - 5 ONLINE Entidad: ${account.entidad} Titular: ${account.nombre} DNI: ${account.dni}`,
    `DATOS PARA EL PAGO: ${methods || PENDING_METHODS_TEXT}`,
    `Total a abonar: $${formatAmount(total)} Vencimiento: ${formatFullDate(dueDate)}`,
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
