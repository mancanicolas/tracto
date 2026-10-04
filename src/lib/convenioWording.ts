import { usesRegularizationWording } from "@/constants/entidades";
import type { Agreement } from "./types";

interface ConvenioWording {
  planTitle: string;
  purpose: string;
  finalInstallment: string;
}

export function getConvenioWording(entidad: string, agreement: Agreement): ConvenioWording {
  const isRegularization = usesRegularizationWording(entidad, agreement.producto);
  if (agreement.tipo === "parcial") {
    return { planTitle: "PLAN DE PAGOS", purpose: "regularización parcial", finalInstallment: "Cuota Convenio" };
  }
  return isRegularization
    ? {
        planTitle: "PLAN DE REGULARIZACIÓN DE SALDO",
        purpose: "regularización del saldo adeudado",
        finalInstallment: "Cuota Final",
      }
    : { planTitle: "PLAN DE CANCELACIÓN TOTAL", purpose: "cancelación total", finalInstallment: "Cuota Cancelatoria" };
}
