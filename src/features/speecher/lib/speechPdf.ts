import type { Content, ContentText, TDocumentDefinitions } from "pdfmake/interfaces";
import logoSvg from "../../../../5ol.svg?raw";
import r2rLogo from "@/assets/r2r.png?inline";
import type { PdfPresetId, SpeechTexts } from "./speechDefaults";
import {
  buildWhatsAppLink,
  parseBody,
  splitLeadingEmoji,
  splitLines,
  stripEmoji,
  toRuns,
  type Run,
  type SpeechBlock,
  type SpeechData,
} from "./speechContent";

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
const R2R_DEEP = "#0f3b2b";
const R2R_MID = "#165c3b";
const R2R_GREEN = "#3dbb5c";
const R2R_PAPER = "#f0f6f2";
const R2R_CALLOUT = "#e8f5ec";
const R2R_MINT = "#7be0a0";
const R2R_SUBTITLE = "#b7e3c7";
const R2R_RING = ["#0b1a2a", "#5e9aa6", "#3dbb5c"];
const R2R_LOGO_SIZE = mm(27.5);
const GRADIENT_SLICES = 72;
const WHATSAPP_GREEN = "#25d366";
const BUTTON_PADDING = "\u00A0".repeat(7);
const SOFT_TOP_BAR = "#7fcdf2";
const SOFT_WARN_FILL = "#fff6e5";
const SOFT_WARN_TEXT = "#6b4a0a";
const SOFT_WARN_BORDER = "#f0a93a";
const SOFT_CALLOUT = "#eaf6fd";
const CHECK_GREEN = "#3dbb7e";
const EMOJI_ICON_SIZE = mm(4.4);
const EMOJI_ICON_GAP = mm(2.2);
const SPLIT_CONTACT_THRESHOLD = 3;
const SPLIT_CONTACT_WIDTH = mm(48);
const SPLIT_CONTACT_GAP = mm(4);
const LINK_BUTTON_COLOR = "#0b2e1a";
const BUTTON_WIDTH = 376;
const BUTTON_HEIGHT = 32;
const BUTTON_RADIUS = 7;
const BUTTON_FONT_SIZE = 11.5;
const BUTTON_LINE_HEIGHT = 13.5;
const BUTTON_TOP_PADDING = mm(3.5);
const BUTTON_ICON_SIZE = 17;
const BUTTON_ICON_GAP = 9;
const CONTACT_TEXT_GAP = 9;

const RED_BAR_HEIGHT = mm(4);
const HEADER_HEIGHT = mm(33);
const HEADER_BOTTOM = RED_BAR_HEIGHT + HEADER_HEIGHT;
const SIDE_MARGIN = mm(20);
const BADGE_SIZE = mm(22);
const LOGO_WIDTH = mm(14.5);
const LEGAL_HEIGHT = mm(11);
const CONTACT_HEIGHT = mm(30);
const FOOTER_HEIGHT = LEGAL_HEIGHT + CONTACT_HEIGHT;
const CONTENT_WIDTH = PAGE_WIDTH - SIDE_MARGIN * 2;
const BODY_FONT_SIZE = 10.8;
const LIST_FONT_SIZE = 9.8;
const BULLET_SIZE = mm(2);
const WHATSAPP_ICON_SIZE = mm(4.2);

const WHATSAPP_ICON_TEMPLATE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="__COLOR__"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.07.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35Z"/><path d="M12.05 21.79h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.82 9.82 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88ZM20.47 3.49A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.69 1.45h.01c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.17-3.48-8.42Z"/></svg>`;
const whatsAppIcon = (color: string): string => WHATSAPP_ICON_TEMPLATE.replace("__COLOR__", color);

const CHECK_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="${CHECK_GREEN}"/><path d="M7 12.5l3.2 3.2L17 8.8" fill="none" stroke="#ffffff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const CHAT_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M4 3h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-9l-5 4v-4H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" fill="${SKY}"/><circle cx="8" cy="10" r="1.4" fill="#ffffff"/><circle cx="12" cy="10" r="1.4" fill="#ffffff"/><circle cx="16" cy="10" r="1.4" fill="#ffffff"/></svg>`;
const EMOJI_ICONS: Record<string, string> = { "✅": CHECK_ICON, "💬": CHAT_ICON };

interface PdfPreset {
  primary: string;
  secondary: string;
  paper: string;
  highlight: string;
  headerSubtitleColor: string;
  brandName: string;
  brandSubtitle: string;
  badge: "square" | "round";
  topBarGradient: string[] | null;
  topBar: string;
  accent: string;
  headingAccent: string;
  titleColor: string;
  bulletColor: string;
  warnFill: string;
  warnText: string;
  warnBorder: string;
  calloutFill: string;
  buttonLabel: string;
  isHeadingUppercase: boolean;
}

const PRESETS: Record<PdfPresetId, PdfPreset> = {
  normal: {
    primary: NAVY,
    secondary: BLUE,
    paper: PAPER,
    highlight: SKY,
    headerSubtitleColor: BRAND_SUBTITLE,
    brandName: "5 ONLINE SRL",
    brandSubtitle: "GESTIÓN INTEGRAL DIGITAL",
    badge: "square",
    topBarGradient: null,
    topBar: RED,
    accent: RED,
    headingAccent: RED,
    titleColor: RED,
    bulletColor: RED,
    warnFill: SOFT_RED,
    warnText: DARK_RED,
    warnBorder: RED,
    calloutFill: PAPER,
    buttonLabel: "TOCÁ ACÁ PARA ESCRIBIRNOS POR WHATSAPP",
    isHeadingUppercase: true,
  },
  suave: {
    primary: NAVY,
    secondary: BLUE,
    paper: PAPER,
    highlight: SKY,
    headerSubtitleColor: BRAND_SUBTITLE,
    brandName: "5 ONLINE SRL",
    brandSubtitle: "GESTIÓN INTEGRAL DIGITAL",
    badge: "square",
    topBarGradient: null,
    topBar: SOFT_TOP_BAR,
    accent: SKY,
    headingAccent: SKY,
    titleColor: BLUE,
    bulletColor: SKY,
    warnFill: SOFT_WARN_FILL,
    warnText: SOFT_WARN_TEXT,
    warnBorder: SOFT_WARN_BORDER,
    calloutFill: SOFT_CALLOUT,
    buttonLabel: "Tocá acá para escribirnos por WhatsApp",
    isHeadingUppercase: false,
  },
  r2r: {
    primary: R2R_DEEP,
    secondary: R2R_MID,
    paper: R2R_PAPER,
    highlight: R2R_MINT,
    headerSubtitleColor: R2R_SUBTITLE,
    brandName: "R2R",
    brandSubtitle: "ESTUDIO DE COBRANZA",
    badge: "round",
    topBarGradient: R2R_RING,
    topBar: R2R_GREEN,
    accent: R2R_GREEN,
    headingAccent: RED,
    titleColor: RED,
    bulletColor: RED,
    warnFill: SOFT_RED,
    warnText: DARK_RED,
    warnBorder: RED,
    calloutFill: R2R_CALLOUT,
    buttonLabel: "Tocá acá para escribirnos por WhatsApp",
    isHeadingUppercase: true,
  },
};

function mixColor(from: string, to: string, ratio: number): string {
  const channel = (hex: string, offset: number) => Number.parseInt(hex.slice(offset, offset + 2), 16);
  return `#${[1, 3, 5]
    .map((offset) => Math.round(channel(from, offset) + (channel(to, offset) - channel(from, offset)) * ratio))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("")}`;
}

function gradientColor(stops: string[], position: number): string {
  const scaled = position * (stops.length - 1);
  const index = Math.min(Math.floor(scaled), stops.length - 2);
  return mixColor(stops[index] ?? "#000000", stops[index + 1] ?? "#000000", scaled - index);
}

function gradientBar(y: number, height: number, stops: string[]): Content[] {
  const width = PAGE_WIDTH / GRADIENT_SLICES;
  return Array.from({ length: GRADIENT_SLICES }, (_, index) =>
    rect(index * width, y, width + 0.6, height, gradientColor(stops, index / (GRADIENT_SLICES - 1))),
  );
}

type ListKind = "blue" | "red" | "reach";

interface ListStyle {
  fill: string;
  color: string;
  bullet: string;
  bold: boolean;
}

function listStyles(preset: PdfPreset): Record<ListKind, ListStyle> {
  return {
    blue: { fill: preset.paper, color: preset.primary, bullet: preset.bulletColor, bold: false },
    red: { fill: preset.warnFill, color: preset.warnText, bullet: preset.warnBorder, bold: false },
    reach: { fill: preset.primary, color: WHITE, bullet: preset.highlight, bold: true },
  };
}

function pdfRuns(text: string, data: SpeechData): Run[] {
  return toRuns(text, data)
    .map((run) => ({ ...run, text: stripEmoji(run.text) }))
    .filter((run) => run.text !== "");
}

function emojiMarker(emoji: string): Content | null {
  const icon = EMOJI_ICONS[emoji];
  if (!icon) return null;
  return node({ stack: [{ svg: icon, width: EMOJI_ICON_SIZE }], width: EMOJI_ICON_SIZE + EMOJI_ICON_GAP });
}

function stripQuoteMarker(runs: Run[]): Run[] {
  const [first, ...rest] = runs;
  if (!first || first.isValue || first.bold) return runs;
  const text = first.text.replace(/^\s*>\s*/, "");
  return text ? [{ ...first, text }, ...rest] : rest;
}

function node(value: object): Content {
  return value as Content;
}

function rect(x: number, y: number, width: number, height: number, color: string): Content {
  return {
    canvas: [{ type: "rect", x: 0, y: 0, w: width, h: height, color }],
    absolutePosition: { x, y },
  };
}

function buildContactButton(operator: string, footerTop: number, label: string): Content[] {
  const link = buildWhatsAppLink(operator);
  if (!link) return [];
  const x = (PAGE_WIDTH - BUTTON_WIDTH) / 2;
  const y = footerTop + BUTTON_TOP_PADDING;
  const textTop = y + (BUTTON_HEIGHT - BUTTON_LINE_HEIGHT) / 2;
  const buttonText = `${BUTTON_PADDING}${label}${BUTTON_PADDING}`;
  return [
    {
      canvas: [{ type: "rect", x: 0, y: 0, w: BUTTON_WIDTH, h: BUTTON_HEIGHT, r: BUTTON_RADIUS, color: WHATSAPP_GREEN }],
      absolutePosition: { x, y },
    },
    {
      svg: whatsAppIcon(LINK_BUTTON_COLOR),
      width: BUTTON_ICON_SIZE,
      absolutePosition: { x: x + BUTTON_ICON_GAP + 2, y: y + (BUTTON_HEIGHT - BUTTON_ICON_SIZE) / 2 },
    },
    {
      columns: [
        {
          text: buttonText,
          link,
          bold: true,
          color: LINK_BUTTON_COLOR,
          fontSize: BUTTON_FONT_SIZE,
          alignment: "center",
          width: BUTTON_WIDTH - BUTTON_ICON_SIZE - BUTTON_ICON_GAP,
        },
      ],
      absolutePosition: { x: x + BUTTON_ICON_SIZE + BUTTON_ICON_GAP, y: textTop },
    },
  ];
}

function badgeWidth(preset: PdfPreset): number {
  return preset.badge === "round" ? R2R_LOGO_SIZE : BADGE_SIZE;
}

function buildBadge(preset: PdfPreset): Content[] {
  if (preset.badge === "round") {
    return [
      {
        image: r2rLogo,
        width: R2R_LOGO_SIZE,
        absolutePosition: { x: SIDE_MARGIN, y: RED_BAR_HEIGHT + (HEADER_HEIGHT - R2R_LOGO_SIZE) / 2 },
      },
    ];
  }
  const badgeTop = RED_BAR_HEIGHT + (HEADER_HEIGHT - BADGE_SIZE) / 2;
  return [
    rect(SIDE_MARGIN, badgeTop, BADGE_SIZE, BADGE_SIZE, WHITE),
    {
      svg: logoSvg,
      width: LOGO_WIDTH,
      absolutePosition: { x: SIDE_MARGIN + (BADGE_SIZE - LOGO_WIDTH) / 2, y: badgeTop + (BADGE_SIZE - LOGO_WIDTH * 0.56) / 2 },
    },
  ];
}

function buildBackground(speech: SpeechTexts, data: SpeechData, preset: PdfPreset): Content[] {
  const footerTop = PAGE_HEIGHT - FOOTER_HEIGHT;
  const contactTextTop = footerTop + BUTTON_TOP_PADDING + BUTTON_HEIGHT + CONTACT_TEXT_GAP;
  const footerLines = splitLines(speech.pie);
  const [name = "", subtitle = "", ...contact] = footerLines;
  const slantWidth = mm(46);
  const slantLeft = PAGE_WIDTH - slantWidth;
  const confidentiality = stripQuoteMarker(pdfRuns(speech.confidencialidad, data));
  const isContactSplit = contact.length > SPLIT_CONTACT_THRESHOLD;
  const splitAt = Math.ceil(contact.length / 2);
  const contactStyle = { color: preset.primary, fontSize: 8.4, bold: true, alignment: "right" } as const;
  const contactBlocks: Content[] = isContactSplit
    ? [
        {
          columns: [{ text: contact.slice(0, splitAt).join("\n"), ...contactStyle, width: SPLIT_CONTACT_WIDTH }],
          absolutePosition: {
            x: PAGE_WIDTH - SIDE_MARGIN - SPLIT_CONTACT_WIDTH * 2 - SPLIT_CONTACT_GAP,
            y: contactTextTop,
          },
        },
        {
          columns: [{ text: contact.slice(splitAt).join("\n"), ...contactStyle, width: SPLIT_CONTACT_WIDTH }],
          absolutePosition: { x: PAGE_WIDTH - SIDE_MARGIN - SPLIT_CONTACT_WIDTH, y: contactTextTop },
        },
      ]
    : [
        {
          columns: [{ text: contact.join("\n"), ...contactStyle, width: mm(70) }],
          absolutePosition: { x: PAGE_WIDTH - SIDE_MARGIN - mm(70), y: contactTextTop },
        },
      ];

  return [
    ...(preset.topBarGradient
      ? gradientBar(0, RED_BAR_HEIGHT, preset.topBarGradient)
      : [rect(0, 0, PAGE_WIDTH, RED_BAR_HEIGHT, preset.topBar)]),
    rect(0, RED_BAR_HEIGHT, PAGE_WIDTH, HEADER_HEIGHT, preset.primary),
    {
      canvas: [
        {
          type: "polyline",
          closePath: true,
          color: preset.secondary,
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
    ...buildBadge(preset),
    {
      stack: [
        { text: preset.brandName, color: WHITE, fontSize: 21, bold: true, characterSpacing: 1 },
        {
          text: preset.brandSubtitle,
          color: preset.headerSubtitleColor,
          fontSize: 7.6,
          characterSpacing: 2.4,
          margin: [0, 4, 0, 0],
        },
      ],
      absolutePosition: { x: SIDE_MARGIN + badgeWidth(preset) + mm(7), y: RED_BAR_HEIGHT + mm(10.5) },
    },
    rect(0, footerTop, PAGE_WIDTH, CONTACT_HEIGHT, preset.paper),
    rect(0, footerTop, PAGE_WIDTH, mm(0.5), preset.primary),
    ...buildContactButton(data.OPERADOR ?? "", footerTop, preset.buttonLabel),
    {
      stack: [
        { text: name.toUpperCase(), color: preset.primary, fontSize: 11, bold: true, characterSpacing: 0.8 },
        ...(isContactSplit
          ? []
          : [node({ text: subtitle, color: preset.secondary, fontSize: 8.4, bold: true, characterSpacing: 0.5, margin: [0, 2, 0, 0] })]),
      ],
      absolutePosition: { x: SIDE_MARGIN, y: contactTextTop },
    },
    ...contactBlocks,
    rect(0, footerTop + CONTACT_HEIGHT, PAGE_WIDTH, LEGAL_HEIGHT, preset.primary),
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

function buildParagraph(block: Extract<SpeechBlock, { type: "p" }>, data: SpeechData, preset: PdfPreset): Content {
  const { emoji, rest } = splitLeadingEmoji(block.text);
  const marker = block.last ? null : emojiMarker(emoji);
  const runs = pdfRuns(marker ? rest : block.text, data);
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
    text: runs.map((run) => runToText(run, preset.primary, false)),
    alignment: "justify",
    fontSize: BODY_FONT_SIZE,
    lineHeight: 1.3,
    color: INK,
  };
  if (marker) {
    return leftBorderBox(
      { columns: [marker, { ...text, alignment: "left", width: "*" }], columnGap: 0 },
      preset.calloutFill,
      preset.accent,
      mm(0.9),
      mm(3.5),
    );
  }
  return block.warn
    ? leftBorderBox(text, null, preset.warnBorder, mm(0.9), mm(3.5))
    : ({ ...text, margin: [0, 0, 0, mm(3.8)] } as Content);
}

function bulletMarker(color: string): Content {
  return node({
    canvas: [{ type: "rect", x: 0, y: 2.6, w: BULLET_SIZE, h: BULLET_SIZE, color }],
    width: BULLET_SIZE + mm(3),
  });
}

function buildListItem(item: string, data: SpeechData, style: ListStyle): Content {
  const { emoji, rest } = splitLeadingEmoji(item);
  const marker = emojiMarker(emoji) ?? bulletMarker(style.bullet);
  const runs = pdfRuns(emoji ? rest : item, data);
  const operatorIndex = runs.findIndex((run) => run.isOperator);
  const textOf = (parts: Run[]): ContentText[] => parts.map((run) => runToText(run, style.color, style.bold));
  const textStyle = { fontSize: LIST_FONT_SIZE, color: style.color, lineHeight: 1.25 };

  if (operatorIndex < 0) {
    return { columns: [marker, { text: textOf(runs), ...textStyle, width: "*" }], columnGap: 0, margin: [0, 0, 0, mm(1.3)] };
  }
  const before = runs.slice(0, operatorIndex);
  const operator = runs[operatorIndex];
  const after = runs.slice(operatorIndex + 1);
  return {
    columns: [
      marker,
      { text: textOf(before), ...textStyle, width: "auto" },
      node({ text: "", width: mm(1.6) }),
      { svg: whatsAppIcon(WHATSAPP_GREEN), width: WHATSAPP_ICON_SIZE },
      node({ text: "", width: mm(1.6) }),
      { text: operator ? textOf([operator, ...after]) : "", ...textStyle, width: "*" },
    ],
    columnGap: 0,
    margin: [0, 0, 0, mm(1.3)],
  };
}

function buildList(block: Extract<SpeechBlock, { type: "ul" }>, data: SpeechData, preset: PdfPreset): Content {
  const style = listStyles(preset)[block.kind];
  return leftBorderBox(
    { stack: block.items.map((item) => buildListItem(item, data, style)) },
    style.fill,
    block.kind === "red" ? preset.warnBorder : preset.accent,
    mm(1.2),
    mm(4),
  );
}

function buildHeading(speech: SpeechTexts, data: SpeechData, preset: PdfPreset): Content[] {
  const [addressee = "", ...title] = splitLines(speech.encabezado);
  const plainText = (line: string) => {
    const text = pdfRuns(line, data).map((run) => run.text).join("");
    return preset.isHeadingUppercase ? text.toUpperCase() : text;
  };
  return [
    {
      stack: [
        { text: plainText(addressee), color: preset.primary, fontSize: 11.2, bold: true, characterSpacing: 0.5 },
        { canvas: [{ type: "line", x1: 0, y1: 4, x2: CONTENT_WIDTH, y2: 4, lineWidth: mm(0.5), lineColor: preset.headingAccent }] },
      ],
      margin: [0, 0, 0, mm(5)],
    },
    leftBorderBox(
      { text: plainText(title.join(" ")), color: preset.titleColor, fontSize: 14.4, bold: true, characterSpacing: 0.5 },
      null,
      preset.headingAccent,
      mm(1.4),
      mm(3),
    ),
  ];
}

export function buildSpeechDefinition(speech: SpeechTexts, data: SpeechData): TDocumentDefinitions {
  const preset = PRESETS[speech.preset] ?? PRESETS.normal;
  const blocks = parseBody(speech.cuerpo, data).map((block) =>
    block.type === "p" ? buildParagraph(block, data, preset) : buildList(block, data, preset),
  );
  return {
    pageSize: "A4",
    pageMargins: [SIDE_MARGIN, HEADER_BOTTOM + mm(9), SIDE_MARGIN, FOOTER_HEIGHT + mm(6)],
    defaultStyle: { font: "Roboto" },
    background: () => buildBackground(speech, data, preset),
    content: [...buildHeading(speech, data, preset), { text: "", margin: [0, 0, 0, mm(2)] }, ...blocks],
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
