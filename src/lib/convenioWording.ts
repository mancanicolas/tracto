import { usesRegularizationWording } from "@/constants/entidades";
import type { Agreement } from "./types";

interface ConvenioWording {
  planTitle: string;
  finalInstallment: string;
}

export function getConvenioWording(entidad: string, agreement: Agreement): ConvenioWording {
  const isRegularization = usesRegularizationWording(entidad, agreement.producto);
  if (agreement.tipo === "parcial") {
    return { planTitle: "PLAN DE PAGOS", finalInstallment: "Cuota Convenio" };
  }
  return isRegularization
    ? {
        planTitle: "PLAN DE REGULARIZACIÓN DE SALDO",
        finalInstallment: "Cuota Final",
      }
    : { planTitle: "PLAN DE CANCELACIÓN TOTAL", finalInstallment: "Cuota Cancelatoria" };
}
