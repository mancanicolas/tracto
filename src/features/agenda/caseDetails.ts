import { DEFAULT_PORTFOLIO, findEntity } from "@/constants/entidades";
import { normalizeDni, parseMoneyToCents } from "@/lib/format";
import type { CaseDetails } from "@/lib/types";

interface CaseFormFields {
  nombre?: string;
  telefono?: string;
  mail?: string;
  monto?: string;
  entidad: string;
  cartera: string;
}

export function toCaseDetails(values: CaseFormFields): CaseDetails {
  const entidad = values.entidad || undefined;
  const cartera = entidad ? values.cartera || findEntity(entidad)?.carteras[0] || DEFAULT_PORTFOLIO : undefined;
  return {
    nombre: values.nombre?.trim() || undefined,
    telefono: values.telefono ? normalizeDni(values.telefono) : undefined,
    mail: values.mail?.trim() || undefined,
    monto: values.monto ? (parseMoneyToCents(values.monto) ?? undefined) : undefined,
    entidad,
    cartera,
  };
}
