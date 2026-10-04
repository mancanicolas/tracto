export const LABEL_COLORS = ["fucsia", "turquesa", "naranja", "lima", "indigo", "gris"] as const;

export type LabelColor = (typeof LABEL_COLORS)[number];

interface LabelColorMeta {
  name: string;
  chip: string;
  swatch: string;
}

export const LABEL_COLOR_META: Record<LabelColor, LabelColorMeta> = {
  fucsia: {
    name: "Fucsia",
    chip: "bg-accent-2-subtle text-accent-2 border-accent-2-border",
    swatch: "bg-accent-2",
  },
  turquesa: {
    name: "Turquesa",
    chip: "bg-label-teal-subtle text-label-teal border-label-teal-border",
    swatch: "bg-label-teal",
  },
  naranja: {
    name: "Naranja",
    chip: "bg-label-orange-subtle text-label-orange border-label-orange-border",
    swatch: "bg-label-orange",
  },
  lima: {
    name: "Lima",
    chip: "bg-label-lime-subtle text-label-lime border-label-lime-border",
    swatch: "bg-label-lime",
  },
  indigo: {
    name: "Índigo",
    chip: "bg-label-indigo-subtle text-label-indigo border-label-indigo-border",
    swatch: "bg-label-indigo",
  },
  gris: {
    name: "Gris",
    chip: "bg-neutral-subtle text-neutral border-neutral/30",
    swatch: "bg-neutral",
  },
};

export interface Label {
  id: string;
  nombre: string;
  color: LabelColor;
}
