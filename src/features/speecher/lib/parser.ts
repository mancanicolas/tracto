export interface Ficha {
  TRATO: string;
  NOMBRE: string;
  DNI: string;
  LABORAL: string;
}

const LABELS: Record<string, string> = {
  nombre: "nombre",
  apellido: "apellido",
  sexo: "sexo",
  "fecha de nacimiento": "nacimiento",
  "fecha de nacimieto": "nacimiento",
  documento: "documento",
  "tipo documento": "tipodoc",
  "tipo de documento": "tipodoc",
  cuil: "cuil",
  cuit: "cuil",
  domicilio: "domicilio",
  "situacion laboral": "laboral",
};

const HARD_LABELS = ["sexo", "nacimiento", "documento"];
const MIN_LABOR_LETTERS = 2;
const DNI_MIN_DIGITS = 7;
const DNI_MAX_DIGITS = 8;

function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[:\s]+$/g, "")
    .trim();
}

function formatSpeechDni(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length >= DNI_MIN_DIGITS && digits.length <= DNI_MAX_DIGITS && !raw.includes(".")) {
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
  return raw;
}

export function describeLabor(value: string): string {
  const normalized = normalize(value);
  if (!normalized || normalized.includes("sin registro")) return "";
  if (normalized.includes("monotribut")) return "Ingresos registrados por ARCA";
  if (normalized.includes("jubila") || normalized.includes("pension")) {
    return `Ingresos percibidos de ${value.trim()}`;
  }
  if (normalized.replace(/[^a-z]/g, "").length > MIN_LABOR_LETTERS) return `Sueldos percibidos de ${value.trim()}`;
  return "";
}

export function parseFicha(text: string): Ficha {
  const lines = text
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const segments: Record<string, string[]> = {};
  const nameLines: string[] = [];
  let current: string | null = null;
  let hardSeen = false;
  let skipping = false;

  for (const raw of lines) {
    const key = LABELS[normalize(raw)];
    if (key) {
      skipping = false;
      current = key;
      segments[key] = segments[key] ?? [];
      if (HARD_LABELS.includes(key)) hardSeen = true;
      continue;
    }
    if (skipping) continue;
    let line = raw;
    const salaryIndex = normalize(raw).search(/sueld/);
    if (salaryIndex >= 0) {
      skipping = true;
      line = raw
        .slice(0, salaryIndex)
        .replace(/[\s:;,\-–—]+$/, "")
        .trim();
      if (!line) continue;
    }
    if (current) segments[current]?.push(line);
    if (!hardSeen && (current === null || current === "nombre" || current === "apellido")) nameLines.push(line);
  }

  const nameParts = nameLines.length ? nameLines : [...(segments.nombre ?? []), ...(segments.apellido ?? [])];
  const sex = normalize(segments.sexo?.[0] ?? "");
  const documentMatch = (segments.documento ?? []).join(" ").match(/[\d.]+/);
  const documentRaw = (documentMatch?.[0] ?? "").replace(/^\.+|\.+$/g, "");

  return {
    TRATO: sex.includes("femenino") ? "Sra." : "Sr.",
    NOMBRE: nameParts.join(" ").replace(/\s+/g, " ").trim(),
    DNI: documentRaw ? formatSpeechDni(documentRaw) : "",
    LABORAL: describeLabor((segments.laboral ?? []).join(" ")),
  };
}
