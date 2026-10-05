export interface MetodoPago {
  etiqueta: string;
  valor: string;
}

export interface Entidad {
  carteras: string[];
  productos: string[];
  metodosPago: Record<string, MetodoPago[]>;
}

export const DEFAULT_PRODUCT = "General";
export const DEFAULT_PORTFOLIO = "General";

const generalEntity = (...metodos: MetodoPago[]): Entidad => ({
  carteras: [DEFAULT_PORTFOLIO],
  productos: [DEFAULT_PRODUCT],
  metodosPago: { [DEFAULT_PRODUCT]: metodos },
});

const cencosudMethods: MetodoPago[] = [
  {
    etiqueta: "Línea de cajas",
    valor: "Indicando nro. de tarjeta cencosud e importe a pagar (Easy, Disco, Jumbo y Vea)",
  },
  {
    etiqueta: "Mercado pago",
    valor: "Sección pago mis cuentas, indicando nro. de tarjeta cencosud e importe a pagar",
  },
];

export const ENTIDADES: Record<string, Entidad> = {
  "BANCO MACRO": generalEntity(
    { etiqueta: "CUIT", valor: "30500010084" },
    { etiqueta: "CBU", valor: "2850811-3-3009400374292-1" },
    { etiqueta: "Alias", valor: "solido.chueco.bigote" },
    { etiqueta: "Cuenta", valor: "381109400374292 (Convenio 30788)" },
  ),
  "BANCO COMAFI": generalEntity(
    { etiqueta: "Pago Fácil", valor: "DNI + Importe a pagar" },
    { etiqueta: "Pago Online", valor: "pagosenlinea.pagofacil.com.ar" },
    { etiqueta: "Transferencia/depósito", valor: "Consultar con asesor" },
  ),
  "BIA GROUP": generalEntity(
    { etiqueta: "Cta. Cte.", valor: "$ 123-009519/0" },
    { etiqueta: "CBU", valor: "0170123020000000951906" },
    { etiqueta: "Alias", valor: "GRUPOBIA.BBVA" },
    { etiqueta: "Rapipago", valor: "CGF COBRANZAS + ID" },
    { etiqueta: "Pago Fácil", valor: "CGF COBRANZAS + DNI" },
  ),
  "CENCOSUD EXTRA": generalEntity(...cencosudMethods),
  "CENCOSUD LIGA": generalEntity(...cencosudMethods),
  "CREDITO DIRECTO": generalEntity(
    { etiqueta: "Titular cuenta", valor: "CREDITIO DIRECTO S.A." },
    { etiqueta: "CUIT", valor: "30-71210113-6" },
    { etiqueta: "CBU", valor: "3380014930000000248447" },
  ),
  UALA: {
    carteras: [DEFAULT_PORTFOLIO],
    productos: ["TC", "PYC"],
    metodosPago: {
      TC: [
        { etiqueta: "Banco", valor: "WILOBANK SAU" },
        { etiqueta: "Titular cuenta", valor: "WILOBANK S.A.U." },
        { etiqueta: "CUIT", valor: "30715654632" },
        { etiqueta: "CBU", valor: "3840100200000000619567" },
      ],
      PYC: [
        { etiqueta: "Banco", valor: "WILOBANK" },
        { etiqueta: "Titular cuenta", valor: "ALAU TECNOLOGIA S.A.U." },
        { etiqueta: "CUIT", valor: "30-71542170-0" },
        { etiqueta: "CBU", valor: "3840100200000004686158 (Solo préstamos y cuotificación)" },
      ],
    },
  },
  "EXI GROUP": generalEntity(
    { etiqueta: "Cta. Cte.", valor: "$ 18156-5 339-3" },
    { etiqueta: "CBU", valor: "0070339820000018156535" },
    { etiqueta: "Alias", valor: "EXISACOB" },
    { etiqueta: "Rapipago", valor: "Código de Empresa 3875 (EXI SA)" },
  ),
  PARETO: generalEntity(
    { etiqueta: "Banco", valor: "Banco Bind (Cuenta corriente)" },
    { etiqueta: "Titular cuenta", valor: "Espacio Digital S.A" },
    { etiqueta: "CUIT", valor: "30-71550240-9" },
    { etiqueta: "CBU", valor: "3220001805007135800029" },
    { etiqueta: "Alias", valor: "cuotapareto" },
  ),
  "RECUPERO DE ACTIVOS": generalEntity(
    { etiqueta: "Titular cuenta", valor: "RECUPERO DE ACTIVOS FIDEICOMISO FINANCIERO" },
    { etiqueta: "Cuenta", valor: "00004194-6 024-7" },
    { etiqueta: "CBU", valor: "0070024520000004194671" },
    { etiqueta: "Rapipago", valor: "Código de Empresa 3946 (RECUPERO DE ACTIVOS)" },
    { etiqueta: "Pago Fácil", valor: "Código de Empresa 2913 (RECUPERO DE ACTIVOS)" },
  ),
  "CREDITIA CENTAURUS": generalEntity(
    { etiqueta: "Banco", valor: "BBVA Banco Francés S.A." },
    { etiqueta: "Titular cuenta", valor: "FIDE PRIV ADM CENTAURUS" },
    { etiqueta: "CUIT", valor: "30-71789342-1" },
    { etiqueta: "Cta. Cte.", valor: "099-720777/6" },
    { etiqueta: "CBU", valor: "0170099220000072077766" },
  ),
};

export const ENTIDAD_NAMES = Object.keys(ENTIDADES);

export function foldName(name: string): string {
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

export function getPaymentMethods(entidad: string, producto: string | undefined): MetodoPago[] {
  const entity = findEntity(entidad);
  if (!entity) return [];
  return entity.metodosPago[producto ?? DEFAULT_PRODUCT] ?? [];
}
