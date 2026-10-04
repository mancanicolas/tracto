import type { Content, ContentTable, TableCell, TDocumentDefinitions } from "pdfmake/interfaces";
import logoSvg from "../../5ol.svg?raw";
import { parseIsoDate, todayIso } from "./dates";
import { formatDni, formatMoney } from "./format";
import { getPaymentMethods, type Agreement, type Case, type Installment, type PaymentMethods } from "./mock";
import { fail, type Result } from "./result";
import { SAVE_ERROR_MESSAGE, saveBytesWithDialog, type SaveOutcome } from "./saveFile";

const COMPANY_LINE = "Carlos Pellegrini 1163, Piso 13 CABA | Tel: (011) 60918325 | info@5ol.com.ar";
const FOOTER_TEXT = "Documento generado electrónicamente - Válido sin firma ológrafa";

const PAGE_WIDTH = 595.28;
const PAGE_MARGIN = 44;
const LOGO_WIDTH = 90;

const NAVY = "#24377A";
const NAVY_SOFT = "#DCE6F2";
const TINT = "#F3F6FA";
const RULE = "#D5DDE8";
const WHITE = "#FFFFFF";
const MUTED = "#6B7280";

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

function sectionBar(title: string): ContentTable {
  return {
    table: {
      widths: ["*"],
      body: [[{ text: title, bold: true, color: WHITE, fontSize: 10, margin: [8, 3, 8, 3] }]],
    },
    layout: { hLineWidth: () => 0, vLineWidth: () => 0, fillColor: () => NAVY },
    margin: [0, 12, 0, 6],
  };
}

function clauseTitle(title: string): Content {
  return {
    stack: [
      { text: title, bold: true, fontSize: 9, color: NAVY },
      {
        canvas: [
          {
            type: "line",
            x1: 0,
            y1: 2,
            x2: PAGE_WIDTH - PAGE_MARGIN * 2,
            y2: 2,
            lineWidth: 0.6,
            lineColor: NAVY,
          },
        ],
      },
    ],
    margin: [0, 8, 0, 3],
  };
}

function buildPlanTable(agreement: Agreement): Content {
  const regular = agreement.cuotas.filter((installment) => installment.tipo === "cuota");
  const lastId = regular.at(-1)?.id;
  const total = agreement.cuotas.reduce((sum, installment) => sum + installment.monto, 0);
  const headerCells: TableCell[] = ["CUOTA", "DESCRIPCION", "VENCIMIENTO", "IMPORTE"].map((text, index) => ({
    text,
    bold: true,
    color: WHITE,
    alignment: index === 3 ? "right" : "left",
  }));
  const rows: TableCell[][] = agreement.cuotas.map((installment) => [
    { text: installmentCell(installment, regular.length) },
    { text: installmentDescription(installment, installment.id === lastId) },
    { text: formatFullDate(installment.fecha) },
    { text: formatMoney(installment.monto), alignment: "right" },
  ]);
  const totalRow: TableCell[] = [
    { text: "TOTAL", colSpan: 3, bold: true, fontSize: 10.5, color: NAVY, alignment: "right" },
    {},
    {},
    { text: formatMoney(total), bold: true, fontSize: 10.5, color: NAVY, alignment: "right" },
  ];
  const lastRowIndex = rows.length + 1;

  return {
    table: {
      headerRows: 1,
      widths: [60, "*", 90, 100],
      body: [headerCells, ...rows, totalRow],
    },
    layout: {
      hLineWidth: (index, node) => (index === node.table.body.length - 1 ? 1.2 : 0.4),
      hLineColor: (index, node) => (index === node.table.body.length - 1 ? NAVY : RULE),
      vLineWidth: () => 0,
      paddingTop: () => 4,
      paddingBottom: () => 4,
      paddingLeft: () => 8,
      paddingRight: () => 8,
      fillColor: (rowIndex) => {
        if (rowIndex === 0) return NAVY;
        if (rowIndex === lastRowIndex) return NAVY_SOFT;
        return rowIndex % 2 === 0 ? TINT : null;
      },
    },
  };
}

function labelValueTable(entries: [string, string][]): Content {
  return {
    table: {
      widths: [56, "*"],
      body: entries.map(([label, value]) => [
        { text: label, color: MUTED, border: [false, false, false, false] },
        { text: value, bold: true, border: [false, false, false, false] },
      ]),
    },
    layout: {
      hLineWidth: () => 0,
      vLineWidth: () => 0,
      paddingTop: () => 1.5,
      paddingBottom: () => 1.5,
      paddingLeft: () => 0,
      paddingRight: () => 0,
    },
  };
}

function paymentCard(methods: PaymentMethods): Content {
  const { transferencia, efectivo } = methods;
  return {
    table: {
      widths: ["*", 175],
      body: [
        [
          {
            stack: [
              { text: "Transferencia bancaria", bold: true, color: NAVY, margin: [0, 0, 0, 3] },
              labelValueTable([
                ["Titular", transferencia.titular],
                ["CBU", transferencia.cbu],
                ["Alias", transferencia.alias],
                ["Banco", transferencia.banco],
              ]),
            ],
            margin: [8, 6, 8, 6],
          },
          {
            stack: [
              { text: "Pago en efectivo", bold: true, color: NAVY, margin: [0, 0, 0, 3] },
              labelValueTable([
                ["Rapipago", efectivo.rapipago],
                ["Pago Fácil", efectivo.pagoFacil],
              ]),
            ],
            margin: [8, 6, 8, 6],
          },
        ],
      ],
    },
    layout: {
      hLineWidth: () => 0.6,
      vLineWidth: () => 0.6,
      hLineColor: () => RULE,
      vLineColor: () => RULE,
      fillColor: () => TINT,
    },
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

function buildFooter(): Content {
  return {
    stack: [
      {
        canvas: [
          {
            type: "line",
            x1: PAGE_MARGIN,
            y1: 0,
            x2: PAGE_WIDTH - PAGE_MARGIN,
            y2: 0,
            lineWidth: 0.5,
            lineColor: RULE,
          },
        ],
      },
      { text: FOOTER_TEXT, alignment: "center", fontSize: 8, color: MUTED, margin: [0, 5, 0, 0] },
    ],
    margin: [0, 14, 0, 0],
  };
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
    pageMargins: [PAGE_MARGIN, 32, PAGE_MARGIN, 52],
    defaultStyle: { font: "Roboto", fontSize: 9.5, lineHeight: 1.15 },
    footer: () => buildFooter(),
    content: [
      {
        columns: [
          { svg: logoSvg, width: LOGO_WIDTH },
          {
            width: "*",
            stack: [
              { text: "CONVENIO DE PAGO", alignment: "center", bold: true, fontSize: 18, color: NAVY },
              { text: account.entidad, alignment: "center", bold: true, fontSize: 13, margin: [0, 2, 0, 4] },
              { text: COMPANY_LINE, alignment: "center", fontSize: 8, color: MUTED },
            ],
            margin: [0, 8, 0, 0],
          },
          { text: "", width: LOGO_WIDTH },
        ],
        margin: [0, 0, 0, 8],
      },
      { text: `Buenos Aires, ${formatLongDate(today)}`, alignment: "right", margin: [0, 0, 0, 8] },
      {
        text: `Por medio del presente, y siguiendo expresas instrucciones de nuestro cliente ${account.entidad}, se hace constar que:`,
      },
      sectionBar("DATOS DEL DEUDOR"),
      {
        text: [
          { text: "Apellido y Nombre: ", bold: true },
          `${debtorName}      `,
          { text: "D.N.I.: ", bold: true },
          formatDni(account.dni),
        ],
      },
      sectionBar("PLAN DE CANCELACIÓN TOTAL"),
      buildPlanTable(agreement),
      sectionBar("MEDIOS DE PAGO HABILITADOS"),
      paymentCard(methods),
      clauseTitle("LIBRE DE DEUDA"),
      { text: LIBRE_DE_DEUDA_TEXT, fontSize: 8, alignment: "justify" },
      clauseTitle("CLAUSULA DE INCUMPLIMIENTO"),
      { text: INCUMPLIMIENTO_TEXT, fontSize: 8, alignment: "justify" },
      {
        columns: [
          signatureBlock(["DPTO. DE COBRANZA - 5ol"]),
          signatureBlock(["CLIENTE/DEUDOR", `${debtorName} - DNI ${account.dni}`]),
        ],
        columnGap: 40,
        margin: [0, 34, 0, 0],
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
