import type { Content, TableCell, TDocumentDefinitions } from "pdfmake/interfaces";
import { parseIsoDate, todayIso } from "./dates";
import { fail, type Result } from "./result";
import { SAVE_ERROR_MESSAGE, saveBytesWithDialog, type SaveOutcome } from "./saveFile";
import { formatDni, formatMoney } from "./format";
import { getPaymentMethods, type Agreement, type Case, type Installment } from "./mock";

const COMPANY_LINE = "Carlos Pellegrini 1163, Piso 13 CABA | Tel: (011) 60918325 | info@5ol.com.ar";
const BRAND_COLOR = "#111F3D";
const MUTED_COLOR = "#555555";
const TABLE_HEADER_FILL = "#EDEDED";
const MONTHS = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

const LIBRE_DE_DEUDA_TEXT =
  "El cliente podrá solicitar el Libre de Deuda en un plazo de 15 días hábiles (posteriores a la acreditación del pago) de la última cuota del presente plan, mediante pedido por escrito al Departamento de Cobranza.";

const INCUMPLIMIENTO_TEXT =
  "Se deja expresa constancia que, en el supuesto de incumplimiento, el presente acuerdo quedará sin efecto, restableciéndose el saldo original de la deuda con más los intereses y gastos que correspondan.";

export type ConvenioField = "nombre" | "DNI" | "entidad";

type ConvenioCase = Case & { nombre: string; entidad: string };

export function missingConvenioFields(account: Case): ConvenioField[] {
  const missing: ConvenioField[] = [];
  if (!account.nombre?.trim()) missing.push("nombre");
  if (!account.dni.trim()) missing.push("DNI");
  if (!account.entidad?.trim()) missing.push("entidad");
  return missing;
}

function formatLongDate(iso: string): string {
  const date = parseIsoDate(iso);
  return `${date.getDate()} de ${MONTHS[date.getMonth()] ?? ""} de ${date.getFullYear()}`;
}

function formatFullDate(iso: string): string {
  const [year = "", month = "", day = ""] = iso.split("-");
  return `${day}/${month}/${year}`;
}

function installmentCell(installment: Installment, totalInstallments: number): string {
  return installment.tipo === "anticipo" ? "Anticipo" : `${installment.numero}/${totalInstallments}`;
}

function installmentDescription(installment: Installment, isLast: boolean): string {
  if (installment.tipo === "anticipo") return "Anticipo";
  return isLast ? "Cuota Cancelatoria" : "Cuota Convenio";
}

function buildPlanTable(agreement: Agreement): Content {
  const regular = agreement.cuotas.filter((installment) => installment.tipo === "cuota");
  const lastId = regular.at(-1)?.id;
  const total = agreement.cuotas.reduce((sum, installment) => sum + installment.monto, 0);
  const headerCells: TableCell[] = ["CUOTA", "DESCRIPCION", "VENCIMIENTO", "IMPORTE"].map((text, index) => ({
    text,
    bold: true,
    fillColor: TABLE_HEADER_FILL,
    alignment: index === 3 ? "right" : "left",
  }));
  const rows: TableCell[][] = agreement.cuotas.map((installment) => [
    { text: installmentCell(installment, regular.length) },
    { text: installmentDescription(installment, installment.id === lastId) },
    { text: formatFullDate(installment.fecha) },
    { text: formatMoney(installment.monto), alignment: "right" },
  ]);
  const totalRow: TableCell[] = [
    { text: "TOTAL", colSpan: 3, bold: true, alignment: "right" },
    {},
    {},
    { text: formatMoney(total), bold: true, alignment: "right" },
  ];

  return {
    table: {
      headerRows: 1,
      widths: [60, "*", 90, 100],
      body: [headerCells, ...rows, totalRow],
    },
    layout: "lightHorizontalLines",
    margin: [0, 4, 0, 10],
  };
}

function signatureBlock(lines: string[]): Content {
  const block = {
    width: "*",
    stack: [
      { canvas: [{ type: "line", x1: 0, y1: 0, x2: 200, y2: 0, lineWidth: 0.8 }] },
      ...lines.map((text, index) => ({
        text,
        bold: index === 0,
        fontSize: 9,
        margin: [0, index === 0 ? 4 : 0, 0, 0] as [number, number, number, number],
      })),
    ],
  };
  return block as Content;
}

export function buildConvenioDefinition(
  account: ConvenioCase,
  agreement: Agreement,
  today: string = todayIso(),
): TDocumentDefinitions {
  const methods = getPaymentMethods(account.entidad);
  const debtorName = account.nombre;

  return {
    pageSize: "A4",
    pageMargins: [44, 32, 44, 48],
    defaultStyle: { font: "Roboto", fontSize: 9.5, lineHeight: 1.15 },
    footer: () => ({
      text: "Documento generado electrónicamente - Válido sin firma ológrafa",
      alignment: "center",
      fontSize: 8,
      color: MUTED_COLOR,
      margin: [0, 16, 0, 0],
    }),
    content: [
      {
        columns: [
          { text: "5L", width: 70, fontSize: 40, bold: true, color: BRAND_COLOR },
          {
            width: "*",
            stack: [
              { text: "CONVENIO DE PAGO", alignment: "center", bold: true, fontSize: 18 },
              { text: account.entidad, alignment: "center", bold: true, fontSize: 13, margin: [0, 2, 0, 4] },
              { text: COMPANY_LINE, alignment: "center", fontSize: 8, color: MUTED_COLOR },
            ],
          },
          { text: "", width: 70 },
        ],
        margin: [0, 0, 0, 10],
      },
      { text: `Buenos Aires, ${formatLongDate(today)}`, alignment: "right", margin: [0, 0, 0, 10] },
      {
        text: `Por medio del presente, y siguiendo expresas instrucciones de nuestro cliente ${account.entidad}, se hace constar que:`,
        margin: [0, 0, 0, 8],
      },
      {
        text: [
          { text: "Apellido y Nombre: ", bold: true },
          `${debtorName}      `,
          { text: "D.N.I.: ", bold: true },
          formatDni(account.dni),
        ],
        margin: [0, 0, 0, 10],
      },
      { text: "PLAN DE CANCELACION TOTAL", bold: true, fontSize: 12 },
      buildPlanTable(agreement),
      { text: "MEDIOS DE PAGO HABILITADOS", bold: true, fontSize: 12, margin: [0, 0, 0, 4] },
      { text: "Transferencia bancaria", bold: true, margin: [0, 2, 0, 2] },
      {
        ul: [
          `Titular: ${methods.transferencia.titular}`,
          `CBU: ${methods.transferencia.cbu}`,
          `Alias: ${methods.transferencia.alias}`,
          `Banco: ${methods.transferencia.banco}`,
        ],
      },
      { text: "Efectivo", bold: true, margin: [0, 6, 0, 2] },
      { ul: [`Rapipago: ${methods.efectivo.rapipago}`, `Pago Fácil: ${methods.efectivo.pagoFacil}`] },
      { text: "LIBRE DE DEUDA", bold: true, fontSize: 9, margin: [0, 10, 0, 2] },
      { text: LIBRE_DE_DEUDA_TEXT, fontSize: 8, alignment: "justify" },
      { text: "CLAUSULA DE INCUMPLIMIENTO", bold: true, fontSize: 9, margin: [0, 8, 0, 2] },
      { text: INCUMPLIMIENTO_TEXT, fontSize: 8, alignment: "justify" },
      {
        columns: [
          signatureBlock(["DPTO. DE COBRANZA - 5ol"]),
          signatureBlock(["CLIENTE/DEUDOR", `${debtorName} - DNI ${account.dni}`]),
        ],
        columnGap: 40,
        margin: [0, 44, 0, 0],
        unbreakable: true,
      },
    ],
  };
}

export async function buildConvenioBytes(account: ConvenioCase, agreement: Agreement): Promise<Uint8Array> {
  const [{ default: pdfMake }, { default: vfs }] = await Promise.all([
    import("pdfmake/build/pdfmake"),
    import("pdfmake/build/vfs_fonts"),
  ]);
  pdfMake.addVirtualFileSystem(vfs);
  const buffer = await pdfMake.createPdf(buildConvenioDefinition(account, agreement)).getBuffer();
  return new Uint8Array(buffer);
}

export async function downloadConvenio(account: Case): Promise<Result<SaveOutcome>> {
  const { acuerdo, nombre, entidad } = account;
  if (!acuerdo || !nombre?.trim() || !entidad?.trim()) {
    return fail("Faltan datos del caso para generar el convenio.");
  }
  let bytes: Uint8Array;
  try {
    bytes = await buildConvenioBytes({ ...account, nombre, entidad }, acuerdo);
  } catch {
    return fail(SAVE_ERROR_MESSAGE);
  }
  return saveBytesWithDialog({
    defaultName: `convenio_${account.dni}.pdf`,
    filterName: "PDF",
    extension: "pdf",
    bytes,
  });
}
