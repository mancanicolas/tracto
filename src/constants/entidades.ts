export type PaymentKind = "transferencia" | "rapipago" | "pagoFacil" | "otro";

export interface PaymentMethod {
  nombre: string;
  tipo: PaymentKind;
  banco?: string;
  alias?: string;
  cbu?: string;
  titular?: string;
  cuit?: string;
  cuenta?: string;
  detalle?: string;
}

export interface Entidad {
  carteras: string[];
  productos: string[];
  metodosPago: Record<string, PaymentMethod[]>;
}

export const DEFAULT_PRODUCT = "General";
export const DEFAULT_PORTFOLIO = "General";

export const ENTIDADES: Record<string, Entidad> = {};

export const ENTIDAD_NAMES = Object.keys(ENTIDADES);

export function hasMultipleProducts(entidad: string | undefined): boolean {
  return entidad !== undefined && (ENTIDADES[entidad]?.productos.length ?? 0) > 1;
}

export function getPaymentMethods(entidad: string, producto: string | undefined): PaymentMethod[] {
  const entity = ENTIDADES[entidad];
  if (!entity) return [];
  return entity.metodosPago[producto ?? DEFAULT_PRODUCT] ?? [];
}

export function paymentMethodSummary(paymentMethod: PaymentMethod): string {
  const parts = [
    paymentMethod.banco,
    paymentMethod.cbu ? `CBU ${paymentMethod.cbu}` : undefined,
    paymentMethod.alias ? `Alias: ${paymentMethod.alias}` : undefined,
    paymentMethod.titular ? `Titular: ${paymentMethod.titular}` : undefined,
    paymentMethod.cuit ? `CUIT: ${paymentMethod.cuit}` : undefined,
    paymentMethod.cuenta ? `Cuenta: ${paymentMethod.cuenta}` : undefined,
    paymentMethod.detalle,
  ];
  return parts.filter((part): part is string => Boolean(part)).join(" / ");
}
