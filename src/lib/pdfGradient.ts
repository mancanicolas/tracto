import type { Content } from "pdfmake/interfaces";

const PAGE_WIDTH = 595.28;
const GRADIENT_SLICES = 72;

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

export function gradientBar(y: number, height: number, stops: string[]): Content[] {
  const width = PAGE_WIDTH / GRADIENT_SLICES;
  return Array.from({ length: GRADIENT_SLICES }, (_, index) => ({
    canvas: [
      {
        type: "rect" as const,
        x: 0,
        y: 0,
        w: width + 0.6,
        h: height,
        color: gradientColor(stops, index / (GRADIENT_SLICES - 1)),
      },
    ],
    absolutePosition: { x: index * width, y },
  }));
}
