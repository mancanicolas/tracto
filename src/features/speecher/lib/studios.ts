import type { PdfPresetId, SpeechTexts } from "./speechDefaults";
import type { Studio } from "./speechStore";

export const LEGACY_PHONE = "(011) 6091 8325";
export const LEGACY_HOURS = "de 8 a 20:00 horas";

export const R2R_WHATSAPP = "11 5741 4680";
export const R2R_PHONE = "(011) 3220-3010";
export const R2R_EMAIL = "Gestor35@r2r.com.ar";

const R2R_PIE = `R2R
Estudio de cobranza
Teléfono fijo: ${R2R_PHONE}
WhatsApp: ${R2R_WHATSAPP}
${R2R_EMAIL}`;

interface StudioProfile {
  telefono: string;
  horario: string;
  fixedOperator: string | null;
  pie: string | null;
  preset: PdfPresetId | null;
}

export const STUDIO_PROFILES: Record<Studio, StudioProfile> = {
  "5ol": { telefono: LEGACY_PHONE, horario: LEGACY_HOURS, fixedOperator: null, pie: null, preset: null },
  r2r: { telefono: R2R_PHONE, horario: "", fixedOperator: R2R_WHATSAPP, pie: R2R_PIE, preset: "r2r" },
};

export function applyStudio(texts: SpeechTexts, studio: Studio): SpeechTexts {
  const profile = STUDIO_PROFILES[studio];
  return { ...texts, preset: profile.preset ?? texts.preset, pie: profile.pie ?? texts.pie };
}

export function upgradeLegacyContact(texts: SpeechTexts): SpeechTexts {
  const upgrade = (text: string) =>
    text.replaceAll(LEGACY_PHONE, "{TELEFONO}").replaceAll(` ${LEGACY_HOURS}`, " {HORARIO}");
  return { ...texts, cuerpo: upgrade(texts.cuerpo) };
}
