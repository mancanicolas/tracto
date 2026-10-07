import type { Content, ContentText, TDocumentDefinitions } from "pdfmake/interfaces";
import logoSvg from "../../../../5ol.svg?raw";
import type { SpeechTexts } from "./speechDefaults";
import { parseBody, splitLines, toRuns, type Run, type SpeechBlock, type SpeechData } from "./speechContent";

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MM = 72 / 25.4;
const mm = (value: number): number => value * MM;

const NAVY = "#24377a";
const BLUE = "#155595";
const SKY = "#2598d3";
const RED = "#c4161c";
const INK = "#1b2033";
const MUTED = "#5d6580";
const PAPER = "#f3f5f9";
const WHITE = "#ffffff";
const SOFT_RED = "#fbeeee";
const DARK_RED = "#7d0f14";
const BRAND_SUBTITLE = "#b9c6e8";
const WHATSAPP_GREEN = "#25d366";

const RED_BAR_HEIGHT = mm(4);
const HEADER_HEIGHT = mm(33);
const HEADER_BOTTOM = RED_BAR_HEIGHT + HEADER_HEIGHT;
const SIDE_MARGIN = mm(20);
const BADGE_SIZE = mm(22);
const LOGO_WIDTH = mm(14.5);
const LEGAL_HEIGHT = mm(11);
const CONTACT_HEIGHT = mm(19);
const FOOTER_HEIGHT = LEGAL_HEIGHT + CONTACT_HEIGHT;
const CONTENT_WIDTH = PAGE_WIDTH - SIDE_MARGIN * 2;
const BODY_FONT_SIZE = 10.8;
const LIST_FONT_SIZE = 9.8;
const BULLET_SIZE = mm(2);
const WHATSAPP_ICON_SIZE = mm(4.2);

const WHATSAPP_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${WHATSAPP_GREEN}"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.07.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35Z"/><path d="M12.05 21.79h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.82 9.82 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88ZM20.47 3.49A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.69 1.45h.01c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.17-3.48-8.42Z"/></svg>`;

type ListKind = "blue" | "red" | "reach";

interface ListStyle {
  fill: string;
  color: string;
  bullet: string;
  bold: boolean;
}

const LIST_STYLES: Record<ListKind, ListStyle> = {
  blue: { fill: PAPER, color: NAVY, bullet: RED, bold: false },
  red: { fill: SOFT_RED, color: DARK_RED, bullet: RED, bold: false },
  reach: { fill: NAVY, color: WHITE, bullet: SKY, bold: true },
};

function node(value: object): Content {
  return value as Content;
}

function rect(x: number, y: number, width: number, height: number, color: string): Content {
  return {
    canvas: [{ type: "rect", x: 0, y: 0, w: width, h: height, color }],
    absolutePosition: { x, y },
  };
}

function buildBackground(speech: SpeechTexts, data: SpeechData): Content[] {
  const footerTop = PAGE_HEIGHT - FOOTER_HEIGHT;
  const footerLines = splitLines(speech.pie);
  const [name = "", subtitle = "", ...contact] = footerLines;
  const badgeTop = RED_BAR_HEIGHT + (HEADER_HEIGHT - BADGE_SIZE) / 2;
  const slantWidth = mm(46);
  const slantLeft = PAGE_WIDTH - slantWidth;
  const confidentiality = toRuns(speech.confidencialidad, data);

  return [
    rect(0, 0, PAGE_WIDTH, RED_BAR_HEIGHT, RED),
    rect(0, RED_BAR_HEIGHT, PAGE_WIDTH, HEADER_HEIGHT, NAVY),
    {
      canvas: [
        {
          type: "polyline",
          closePath: true,
          color: BLUE,
          points: [
            { x: slantWidth * 0.3, y: 0 },
            { x: slantWidth, y: 0 },
            { x: slantWidth, y: HEADER_HEIGHT },
            { x: 0, y: HEADER_HEIGHT },
          ],
        },
      ],
      absolutePosition: { x: slantLeft, y: RED_BAR_HEIGHT },
    },
    rect(SIDE_MARGIN, badgeTop, BADGE_SIZE, BADGE_SIZE, WHITE),
    {
      svg: logoSvg,
      width: LOGO_WIDTH,
      absolutePosition: { x: SIDE_MARGIN + (BADGE_SIZE - LOGO_WIDTH) / 2, y: badgeTop + (BADGE_SIZE - LOGO_WIDTH * 0.56) / 2 },
    },
    {
      stack: [
        { text: "5 ONLINE SRL", color: WHITE, fontSize: 21, bold: true, characterSpacing: 1 },
        { text: "GESTIÓN INTEGRAL DIGITAL", color: BRAND_SUBTITLE, fontSize: 7.6, characterSpacing: 2.4, margin: [0, 4, 0, 0] },
      ],
      absolutePosition: { x: SIDE_MARGIN + BADGE_SIZE + mm(7), y: RED_BAR_HEIGHT + mm(10.5) },
    },
    rect(0, footerTop, PAGE_WIDTH, CONTACT_HEIGHT, PAPER),
    rect(0, footerTop, PAGE_WIDTH, mm(0.5), NAVY),
    {
      stack: [
        { text: name.toUpperCase(), color: NAVY, fontSize: 11, bold: true, characterSpacing: 0.8 },
        { text: subtitle, color: BLUE, fontSize: 8.4, bold: true, characterSpacing: 0.5, margin: [0, 2, 0, 0] },
      ],
      absolutePosition: { x: SIDE_MARGIN, y: footerTop + mm(5) },
    },
    {
      columns: [
        {
          text: contact.join("\n"),
          color: NAVY,
          fontSize: 8.4,
          bold: true,
          alignment: "right",
          width: mm(70),
        },
      ],
      absolutePosition: { x: PAGE_WIDTH - SIDE_MARGIN - mm(70), y: footerTop + mm(5) },
    },
    rect(0, footerTop + CONTACT_HEIGHT, PAGE_WIDTH, LEGAL_HEIGHT, NAVY),
    {
      columns: [
        {
          text: confidentiality.map((run) => ({ text: run.text, bold: run.bold })),
          color: WHITE,
          fontSize: 7.4,
          alignment: "center",
          width: PAGE_WIDTH - mm(24),
        },
      ],
      absolutePosition: { x: mm(12), y: footerTop + CONTACT_HEIGHT + mm(2.6) },
    },
  ];
}

function runToText(run: Run, color: string, forceBold: boolean): ContentText {
  return {
    text: run.text,
    bold: forceBold || run.bold,
    color: run.isValue || run.bold ? color : undefined,
  };
}

function leftBorderBox(content: Content, fill: string | null, borderColor: string, borderWidth: number, padding: number): Content {
  return {
    table: { widths: ["*"], body: [[content]] },
    layout: {
      hLineWidth: () => 0,
      vLineWidth: (index) => (index === 0 ? borderWidth : 0),
      vLineColor: () => borderColor,
      fillColor: () => fill,
      paddingLeft: () => padding,
      paddingRight: () => padding,
      paddingTop: () => padding * 0.8,
      paddingBottom: () => padding * 0.8,
    },
    margin: [0, 0, 0, mm(3.8)],
  };
}

function buildParagraph(block: Extract<SpeechBlock, { type: "p" }>, data: SpeechData): Content {
  const runs = toRuns(block.text, data);
  if (block.last) {
    return {
      text: runs.map((run) => ({ text: run.text, bold: run.bold, italics: true })),
      color: MUTED,
      alignment: "left",
      fontSize: BODY_FONT_SIZE,
      margin: [0, mm(1.2), 0, mm(3.8)],
    };
  }
  const text: Content = {
    text: runs.map((run) => runToText(run, NAVY, false)),
    alignment: "justify",
    fontSize: BODY_FONT_SIZE,
    lineHeight: 1.3,
    color: INK,
  };
  return block.warn ? leftBorderBox(text, null, RED, mm(0.9), mm(3.5)) : { ...text, margin: [0, 0, 0, mm(3.8)] } as Content;
}

function bulletMarker(color: string): Content {
  return node({
    canvas: [{ type: "rect", x: 0, y: 2.6, w: BULLET_SIZE, h: BULLET_SIZE, color }],
    width: BULLET_SIZE + mm(3),
  });
}

function buildListItem(item: string, data: SpeechData, style: ListStyle): Content {
  const runs = toRuns(item, data);
  const operatorIndex = runs.findIndex((run) => run.isOperator);
  const textOf = (parts: Run[]): ContentText[] => parts.map((run) => runToText(run, style.color, style.bold));
  const textStyle = { fontSize: LIST_FONT_SIZE, color: style.color, lineHeight: 1.25 };

  if (operatorIndex < 0) {
    return { columns: [bulletMarker(style.bullet), { text: textOf(runs), ...textStyle, width: "*" }], columnGap: 0, margin: [0, 0, 0, mm(1.3)] };
  }
  const before = runs.slice(0, operatorIndex);
  const operator = runs[operatorIndex];
  return {
    columns: [
      bulletMarker(style.bullet),
      { text: textOf(before), ...textStyle, width: "auto" },
      node({ text: "", width: mm(1.6) }),
      { svg: WHATSAPP_ICON_SVG, width: WHATSAPP_ICON_SIZE },
      node({ text: "", width: mm(1.6) }),
      { text: operator ? textOf([operator]) : "", ...textStyle, width: "*" },
    ],
    columnGap: 0,
    margin: [0, 0, 0, mm(1.3)],
  };
}

function buildList(block: Extract<SpeechBlock, { type: "ul" }>, data: SpeechData): Content {
  const style = LIST_STYLES[block.kind];
  return leftBorderBox(
    { stack: block.items.map((item) => buildListItem(item, data, style)) },
    style.fill,
    RED,
    mm(1.2),
    mm(4),
  );
}

function buildHeading(speech: SpeechTexts, data: SpeechData): Content[] {
  const [addressee = "", ...title] = splitLines(speech.encabezado);
  const plainText = (line: string) => toRuns(line, data).map((run) => run.text).join("");
  return [
    {
      stack: [
        { text: plainText(addressee).toUpperCase(), color: NAVY, fontSize: 11.2, bold: true, characterSpacing: 0.5 },
        { canvas: [{ type: "line", x1: 0, y1: 4, x2: CONTENT_WIDTH, y2: 4, lineWidth: mm(0.5), lineColor: RED }] },
      ],
      margin: [0, 0, 0, mm(5)],
    },
    leftBorderBox(
      { text: plainText(title.join(" ")).toUpperCase(), color: RED, fontSize: 14.4, bold: true, characterSpacing: 0.5 },
      null,
      RED,
      mm(1.4),
      mm(3),
    ),
  ];
}

export function buildSpeechDefinition(speech: SpeechTexts, data: SpeechData): TDocumentDefinitions {
  const blocks = parseBody(speech.cuerpo, data).map((block) =>
    block.type === "p" ? buildParagraph(block, data) : buildList(block, data),
  );
  return {
    pageSize: "A4",
    pageMargins: [SIDE_MARGIN, HEADER_BOTTOM + mm(9), SIDE_MARGIN, FOOTER_HEIGHT + mm(6)],
    defaultStyle: { font: "Roboto" },
    background: () => buildBackground(speech, data),
    content: [...buildHeading(speech, data), { text: "", margin: [0, 0, 0, mm(2)] }, ...blocks],
  };
}

export async function buildSpeechPdfBytes(speech: SpeechTexts, data: SpeechData): Promise<Uint8Array> {
  const [{ default: pdfMake }, { default: vfs }] = await Promise.all([
    import("pdfmake/build/pdfmake"),
    import("pdfmake/build/vfs_fonts"),
  ]);
  pdfMake.addVirtualFileSystem(vfs);
  const buffer = await pdfMake.createPdf(buildSpeechDefinition(speech, data)).getBuffer();
  return new Uint8Array(buffer);
}
