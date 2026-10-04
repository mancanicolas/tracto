export interface PaymentMethod {
  nombre: string;
  detalle: string[];
}

export interface Entidad {
  carteras: string[];
  productos: string[];
  metodosPago: Record<string, PaymentMethod[]>;
}

export const DEFAULT_PRODUCT = "General";
export const DEFAULT_PORTFOLIO = "General";

const method = (nombre: string, ...detalle: string[]): PaymentMethod => ({ nombre, detalle });

const generalEntity = (...metodos: PaymentMethod[]): Entidad => ({
  carteras: [DEFAULT_PORTFOLIO],
  productos: [DEFAULT_PRODUCT],
  metodosPago: { [DEFAULT_PRODUCT]: metodos },
});

export const ENTIDADES: Record<string, Entidad> = {
  "BANCO MACRO": generalEntity(
    method("Transferencia", "CBU 2850811-3-3009400374292-1", "Alias: solido.chueco.bigote"),
    method("Pago Fácil", "Empresa 5 ONLINE"),
    method("Pago Fácil Online"),
  ),
  "BANCO COMAFI": generalEntity(
    method("Transferencia"),
    method("Pago Fácil", "Empresa 5 ONLINE"),
    method("Pago Fácil Online"),
  ),
  "BIA GROUP": generalEntity(
    method("Transferencia", "CBU 0170123020000000951906"),
    method("Rapipago", "CGF COBRANZAS + ID"),
    method("Pago Fácil", "CGF COBRANZAS + DNI"),
    method("Mercado Pago"),
  ),
  CENCOSUD: generalEntity(method("Pago Fácil"), method("Pago Mis Cuentas"), method("App CencoPay")),
  "CREDITO DIRECTO": generalEntity(method("Transferencia", "CBU 3380014930000000248447")),
  UALA: {
    carteras: [DEFAULT_PORTFOLIO],
    productos: ["TC", "PYC"],
    metodosPago: {
      TC: [method("Transferencia", "CBU 3840100200000000619567")],
      PYC: [method("Transferencia", "CBU 3840100200000004686158")],
    },
  },
  "EXI GROUP": generalEntity(
    method("Transferencia", "CBU 0070339820000018156535"),
    method("Rapipago", "Empresa 3875"),
  ),
  PARETO: generalEntity(method("Transferencia", "CBU 3220001805007135800029")),
  "RECUPERO DE ACTIVOS": generalEntity(
    method("Transferencia", "CBU 0070024520000004194671"),
    method("Rapipago", "Empresa 3946"),
    method("Pago Fácil", "Empresa 2913"),
  ),
  "CREDITIA CENTAURUS": generalEntity(method("Transferencia", "CBU 0170099220000072077766")),
};

export const ENTIDAD_NAMES = Object.keys(ENTIDADES);

export function hasMultipleProducts(entidad: string | undefined): boolean {
  return entidad !== undefined && (ENTIDADES[entidad]?.productos.length ?? 0) > 1;
}

export function getPaymentMethods(entidad: string, producto: string | undefined): PaymentMethod[] {
  const entity = ENTIDADES[entidad];
  if (!entity) return [];
  return entity.metodosPago[producto ?? DEFAULT_PRODUCT] ?? [];
}

export function formatPaymentMethod(paymentMethod: PaymentMethod): string {
  return paymentMethod.detalle.length > 0
    ? `${paymentMethod.nombre} (${paymentMethod.detalle.join(" / ")})`
    : paymentMethod.nombre;
}
