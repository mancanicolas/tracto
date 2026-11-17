import type { Content } from "pdfmake/interfaces";
import r2rLogo from "@/assets/r2r.png?inline";
import type { Studio } from "@/features/speecher/lib/speechStore";
import { R2R_EMAIL, R2R_PHONE } from "@/features/speecher/lib/studios";
import logoSvg from "../../5ol.svg?raw";

export const LOGO_COLUMN_WIDTH = 90;
const R2R_LOGO_WIDTH = 66;
const R2R_RED = "#c4161c";

export interface ConvenioBrand {
  primary: string;
  deep: string;
  sky: string;
  tint: string;
  rule: string;
  clause: string;
  companyLine: string;
  signatureLabel: string;
  messageSignature: string;
  messageEmail: string;
  topBarStops: string[] | null;
  logo: () => Content;
}

export const CONVENIO_BRANDS: Record<Studio, ConvenioBrand> = {
  "5ol": {
    primary: "#155595",
    deep: "#24377A",
    sky: "#2598D3",
    tint: "#F1F7FB",
    rule: "#CCDDEB",
    clause: "#155595",
    companyLine: "Carlos Pellegrini 1163, Piso 13 CABA | Tel: (011) 60918325 | info@5ol.com.ar",
    signatureLabel: "DPTO. DE COBRANZA - 5ol",
    messageSignature: "Dpto. de Cobranzas - 5oL",
    messageEmail: "info@5ol.com.ar",
    topBarStops: null,
    logo: () => ({ svg: logoSvg, width: LOGO_COLUMN_WIDTH }),
  },
  r2r: {
    primary: "#165c3b",
    deep: "#0f3b2b",
    sky: "#3dbb5c",
    tint: "#f0f6f2",
    rule: "#cfe3d6",
    clause: R2R_RED,
    companyLine: `R2R - Estudio de cobranza | Tel: ${R2R_PHONE} | ${R2R_EMAIL}`,
    signatureLabel: "DPTO. DE COBRANZA - R2R",
    messageSignature: "Dpto. de Cobranzas - R2R",
    messageEmail: R2R_EMAIL,
    topBarStops: ["#0b1a2a", "#5e9aa6", "#3dbb5c"],
    logo: () => ({ stack: [{ image: r2rLogo, width: R2R_LOGO_WIDTH }], width: LOGO_COLUMN_WIDTH }) as Content,
  },
};
