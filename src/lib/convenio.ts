import type { Content, ContentTable, TableCell, TDocumentDefinitions } from "pdfmake/interfaces";
import { getPaymentMethods, hasMultipleProducts, type MetodoPago } from "@/constants/entidades";
import logoSvg from "../../5ol.svg?raw";
import { parseIsoDate, todayIso } from "./dates";
import { getConvenioWording } from "./convenioWording";
import { formatDni, formatMoney } from "./format";
import { fail, type Result } from "./result";
import { SAVE_ERROR_MESSAGE, saveBytesWithDialog, type SaveOutcome } from "./saveFile";
import type { Agreement, Case, Installment } from "./types";

const COMPANY_LINE = "Carlos Pellegrini 1163, Piso 13 CABA | Tel: (011) 60918325 | info@5ol.com.ar";
const FOOTER_TEXT = "Documento generado electrónicamente - Válido sin firma ológrafa";

const PAGE_WIDTH = 595.28;
const PAGE_MARGIN = 44;
const LOGO_WIDTH = 90;

const BRAND_PRIMARY = "#155595";
const BRAND_DEEP = "#24377A";
const BRAND_SKY = "#2598D3";
const PRIMARY_SOFT = "#D6E6F3";
const TINT = "#F1F7FB";
const RULE = "#CCDDEB";
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

export type ConvenioField = "nombre" | "DNI" | "entidad" | "producto";

export type ConvenioCase = Case & { nombre: string; entidad: string };

export function missingConvenioFields(account: Case): ConvenioField[] {
  const missing: ConvenioField[] = [];
  if (!account.nombre?.trim()) missing.push("nombre");
  if (!account.dni.trim()) missing.push("DNI");
  if (!account.entidad?.trim()) missing.push("entidad");
  else if (hasMultipleProducts(account.entidad) && !account.acuerdo?.producto) missing.push("producto");
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
  if (installment.tipo === "anticipo") return "Anticipo";
  if (installment.tipo === "parcial") return "Unico";
  return `${installment.numero}/${totalInstallments}`;
}

function installmentDescription(installment: Installment, isFinal: boolean, finalLabel: string): string {
  if (installment.tipo === "anticipo") return "Anticipo";
  if (installment.tipo === "parcial") return "Pago a cuenta";
  return isFinal ? finalLabel : "Cuota Convenio";
}

function sectionBar(title: string): ContentTable {
  return {
    table: {
      widths: ["*"],
      body: [[{ text: title, bold: true, color: WHITE, fontSize: 10, margin: [8, 3, 8, 3] }]],
    },
    layout: {
      hLineWidth: (index) => (index === 1 ? 1.5 : 0),
      hLineColor: () => BRAND_SKY,
      vLineWidth: () => 0,
      fillColor: () => BRAND_PRIMARY,
    },
    margin: [0, 12, 0, 6],
  };
}

function clauseTitle(title: string): Content {
  return {
    stack: [
      { text: title, bold: true, fontSize: 9, color: BRAND_PRIMARY },
      {
        canvas: [
          {
            type: "line",
            x1: 0,
            y1: 2,
            x2: PAGE_WIDTH - PAGE_MARGIN * 2,
            y2: 2,
            lineWidth: 0.6,
            lineColor: BRAND_PRIMARY,
          },
        ],
      },
    ],
    margin: [0, 8, 0, 3],
  };
}

function buildPlanTable(agreement: Agreement, finalLabel: string): Content {
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
    { text: installmentDescription(installment, installment.id === lastId, finalLabel) },
    { text: formatFullDate(installment.fecha) },
    { text: formatMoney(installment.monto), alignment: "right" },
  ]);
  const totalRow: TableCell[] = [
    { text: "TOTAL", colSpan: 3, bold: true, fontSize: 10.5, color: BRAND_PRIMARY, alignment: "right" },
    {},
    {},
    { text: formatMoney(total), bold: true, fontSize: 10.5, color: BRAND_PRIMARY, alignment: "right" },
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
      hLineColor: (index, node) => (index === node.table.body.length - 1 ? BRAND_PRIMARY : RULE),
      vLineWidth: () => 0,
      paddingTop: () => 4,
      paddingBottom: () => 4,
      paddingLeft: () => 8,
      paddingRight: () => 8,
      fillColor: (rowIndex) => {
        if (rowIndex === 0) return BRAND_PRIMARY;
        if (rowIndex === lastRowIndex) return PRIMARY_SOFT;
        return rowIndex % 2 === 0 ? TINT : null;
      },
    },
  };
}

function labelValueTable(entries: [string, string][]): Content {
  return {
    table: {
      widths: [120, "*"],
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

function paymentCard(methods: MetodoPago[]): Content {
  const entries: [string, string][] =
    methods.length > 0
      ? methods.map(({ etiqueta, valor }) => [etiqueta, valor])
      : [["Consultar", "Los medios de pago se informan por el Departamento de Cobranza"]];
  return {
    table: {
      widths: ["*"],
      body: [[{ stack: [labelValueTable(entries)], margin: [8, 6, 8, 6] }]],
    },
    layout: {
      hLineWidth: () => 0.8,
      vLineWidth: () => 0.8,
      hLineColor: () => BRAND_PRIMARY,
      vLineColor: () => BRAND_PRIMARY,
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
  const methods = getPaymentMethods(account.entidad, agreement.producto);
  const wording = getConvenioWording(account.entidad, agreement);
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
              { text: "CONVENIO DE PAGO", alignment: "center", bold: true, fontSize: 18, color: BRAND_DEEP },
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
        text: `Por medio del presente, y siguiendo expresas instrucciones de nuestro cliente ${account.entidad}, se formaliza el convenio de pago con el titular, sujeto a los términos y condiciones que se detallan a continuación:`,
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
      sectionBar(wording.planTitle),
      buildPlanTable(agreement, wording.finalInstallment),
      sectionBar("MEDIOS DE PAGO HABILITADOS"),
      paymentCard(methods),
      ...(agreement.tipo === "parcial"
        ? []
        : [clauseTitle("LIBRE DE DEUDA"), { text: LIBRE_DE_DEUDA_TEXT, fontSize: 8, alignment: "justify" } as Content]),
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
