import { format } from "date-fns";
import { addDaysIso, parseIsoDate, todayIso } from "@/lib/dates";
import type { Ficha } from "./parser";
import type { SpeechTexts } from "./speechDefaults";

export type SpeechData = Record<string, string>;

export interface Run {
  text: string;
  bold: boolean;
  isValue: boolean;
  isOperator: boolean;
}

export type SpeechBlock =
  | { type: "p"; text: string; warn: boolean; last: boolean }
  | { type: "ul"; kind: "blue" | "red" | "reach"; items: string[] };

export interface SpeechSettings {
  cartera: string;
  operador: string;
  interno: string;
}

const MONTHS = [
  "ENERO",
  "FEBRERO",
  "MARZO",
  "ABRIL",
  "MAYO",
  "JUNIO",
  "JULIO",
  "AGOSTO",
  "SEPTIEMBRE",
  "OCTUBRE",
  "NOVIEMBRE",
  "DICIEMBRE",
];

const CLOSING_DELAY_DAYS = 2;
const WHATSAPP_LINK_BASE = "https://wa.me/";
const ARGENTINA_MOBILE_PREFIX = "549";
const KEY_PATTERN = /\{([A-Z_]+)\}/g;
const TOKEN_PATTERN = /(\{[A-Z_]+\}|\*\*.+?\*\*)/;

export function buildWhatsAppLink(operator: string): string {
  const digits = operator.replace(/\D/g, "");
  if (!digits) return "";
  const number = digits.startsWith(ARGENTINA_MOBILE_PREFIX) ? digits : `${ARGENTINA_MOBILE_PREFIX}${digits}`;
  return `${WHATSAPP_LINK_BASE}${number}`;
}

export function buildSpeechData(ficha: Ficha, settings: SpeechSettings, now: Date = new Date()): SpeechData {
  const today = todayIso(now);
  const date = parseIsoDate(today);
  return {
    TRATO: ficha.TRATO,
    NOMBRE: ficha.NOMBRE,
    DNI: ficha.DNI,
    LABORAL: ficha.LABORAL,
    MES: MONTHS[date.getMonth()] ?? "",
    ANIO: String(date.getFullYear()),
    CARTERA: settings.cartera,
    FECHA: format(parseIsoDate(addDaysIso(today, CLOSING_DELAY_DAYS)), "dd/MM/yyyy"),
    OPERADOR: settings.operador,
    INTERNO: settings.interno,
  };
}

function tokenize(text: string, data: SpeechData, forceBold: boolean): Run[] {
  return text
    .split(TOKEN_PATTERN)
    .filter(Boolean)
    .flatMap((part): Run[] => {
      if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
        return tokenize(part.slice(2, -2), data, true);
      }
      const keyMatch = /^\{([A-Z_]+)\}$/.exec(part);
      if (!keyMatch) return [{ text: part, bold: forceBold, isValue: false, isOperator: false }];
      const key = keyMatch[1] ?? "";
      if (!(key in data)) return [{ text: part, bold: true, isValue: true, isOperator: false }];
      const value = data[key] ?? "";
      if (!value) return [];
      return [
        {
          text: value,
          bold: key !== "LABORAL",
          isValue: key !== "LABORAL",
          isOperator: key === "OPERADOR",
        },
      ];
    });
}

export function toRuns(text: string, data: SpeechData): Run[] {
  return tokenize(text, data, false);
}

function resolveInterno(body: string, data: SpeechData): string {
  return data.INTERNO === "" ? body.replace(/\s*interno\s*\{INTERNO\}/gi, "") : body;
}

function hasContent(item: string, data: SpeechData): boolean {
  return item.replace(KEY_PATTERN, (match, key: string) => (key in data ? (data[key] ?? "") : match)).trim() !== "";
}

export function parseBody(body: string, data: SpeechData): SpeechBlock[] {
  const blocks: SpeechBlock[] = [];
  let previousText = "";
  const groups = resolveInterno(body, data)
    .split(/\n\s*\n/)
    .map((group) =>
      group
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
    )
    .filter((group) => group.length > 0);

  groups.forEach((lines, groupIndex) => {
    const isLast = groupIndex === groups.length - 1;
    let paragraph: string[] = [];
    let items: string[] = [];

    const flushParagraph = () => {
      if (paragraph.length === 0) return;
      previousText = paragraph.join(" ");
      blocks.push({ type: "p", text: previousText, warn: false, last: isLast });
      paragraph = [];
    };

    const flushList = () => {
      const visible = items.filter((item) => hasContent(item, data));
      items = [];
      if (visible.length === 0) return;
      const kind = /embargo/i.test(previousText)
        ? "red"
        : /atentos|contacto|comunic/i.test(previousText)
          ? "reach"
          : "blue";
      const last = blocks.at(-1);
      if (kind === "red" && last?.type === "p") last.warn = true;
      blocks.push({ type: "ul", kind, items: visible });
    };

    for (const line of lines) {
      if (line.startsWith("-")) {
        flushParagraph();
        items.push(line.replace(/^-+\s*/, ""));
      } else {
        flushList();
        paragraph.push(line);
      }
    }
    flushParagraph();
    flushList();
  });

  return blocks;
}

export function splitLines(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function plain(runs: Run[]): string {
  return runs.map((run) => run.text).join("");
}

function whatsApp(runs: Run[]): string {
  return runs.map((run) => (run.bold ? `*${run.text}*` : run.text)).join("");
}

export function renderSpeechText(speech: SpeechTexts, data: SpeechData): string {
  const heading = splitLines(speech.encabezado).map((line) => `*${plain(toRuns(line, data))}*`);
  const body = parseBody(speech.cuerpo, data).map((block) =>
    block.type === "p"
      ? whatsApp(toRuns(block.text, data))
      : block.items.map((item) => `- ${whatsApp(toRuns(item, data))}`).join("\n"),
  );
  const footer = splitLines(speech.pie).join("\n");
  const confidentiality = whatsApp(toRuns(speech.confidencialidad, data));
  return [heading.join("\n"), ...body, footer, confidentiality].filter(Boolean).join("\n\n");
}
