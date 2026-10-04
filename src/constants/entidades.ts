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

const transfer = (fields: Omit<PaymentMethod, "nombre" | "tipo">): PaymentMethod => ({
  nombre: "Transferencia",
  tipo: "transferencia",
  ...fields,
});
const rapipago = (detalle: string): PaymentMethod => ({ nombre: "Rapipago", tipo: "rapipago", detalle });
const pagoFacil = (detalle: string): PaymentMethod => ({ nombre: "Pago Fácil", tipo: "pagoFacil", detalle });
const other = (nombre: string, detalle: string): PaymentMethod => ({ nombre, tipo: "otro", detalle });

const generalEntity = (...metodos: PaymentMethod[]): Entidad => ({
  carteras: [DEFAULT_PORTFOLIO],
  productos: [DEFAULT_PRODUCT],
  metodosPago: { [DEFAULT_PRODUCT]: metodos },
});

const cencosudMethods = [
  pagoFacil("N° de Tarjeta (Línea de cajas)"),
  other("Pago Mis Cuentas", "N° de Tarjeta"),
  other("Pago Digital", "App CencoPay"),
];

export const ENTIDADES: Record<string, Entidad> = {
  "BANCO MACRO": generalEntity(
    transfer({
      cbu: "2850811-3-3009400374292-1",
      alias: "solido.chueco.bigote",
      cuenta: "381109400374292 (Convenio 30788)",
    }),
  ),
  "BANCO COMAFI": generalEntity(
    pagoFacil("Empresa 5 Online + DNI"),
    other("Pago Online", "pagosenlinea.pagofacil.com.ar"),
  ),
  "BIA GROUP": generalEntity(
    transfer({ cbu: "0170123020000000951906", alias: "GRUPOBIA.BBVA" }),
    rapipago("CGF COBRANZAS + ID"),
    pagoFacil("CGF COBRANZAS + DNI"),
    other("Mercado Pago", "Habilitado"),
  ),
  "CENCOSUD LIGA 1": generalEntity(...cencosudMethods),
  "CENCOSUD LIGA 2": generalEntity(...cencosudMethods),
  "CENCOSUD EXTRA 1": generalEntity(...cencosudMethods),
  "CRÉDITO DIRECTO": generalEntity(transfer({ cbu: "3380014930000000248447" })),
  UALÁ: {
    carteras: [DEFAULT_PORTFOLIO],
    productos: ["TC", "PYC"],
    metodosPago: {
      TC: [transfer({ cbu: "3840100200000000619567" })],
      PYC: [transfer({ cbu: "3840100200000004686158" })],
    },
  },
  "EXI GROUP": generalEntity(
    transfer({ cbu: "0070339820000018156535", alias: "EXISACOB" }),
    rapipago("Empresa 3875 (EXI SA)"),
  ),
  PARETO: generalEntity(transfer({ cbu: "3220001805007135800029", alias: "cuotapareto" })),
  "RECUPERO DE ACTIVOS": generalEntity(
    transfer({ cbu: "0070024520000004194671" }),
    rapipago("Empresa 3946"),
    pagoFacil("Empresa 2913"),
  ),
  "CREDITIA CENTAURUS": generalEntity(transfer({ cbu: "0170099220000072077766" })),
};

export const ENTIDAD_NAMES = Object.keys(ENTIDADES);

function foldName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toUpperCase();
}

export function findEntity(name: string | undefined): Entidad | undefined {
  if (!name) return undefined;
  const exact = ENTIDADES[name];
  if (exact) return exact;
  const folded = foldName(name);
  const match = ENTIDAD_NAMES.find((candidate) => foldName(candidate) === folded);
  return match ? ENTIDADES[match] : undefined;
}

const REGULARIZATION_ENTITY = "UALA";
const REGULARIZATION_PRODUCT = "TC";

export function usesRegularizationWording(entidad: string | undefined, producto: string | undefined): boolean {
  return Boolean(entidad) && foldName(entidad ?? "") === REGULARIZATION_ENTITY && producto === REGULARIZATION_PRODUCT;
}

export function hasMultipleProducts(entidad: string | undefined): boolean {
  return (findEntity(entidad)?.productos.length ?? 0) > 1;
}

export function getPaymentMethods(entidad: string, producto: string | undefined): PaymentMethod[] {
  const entity = findEntity(entidad);
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
