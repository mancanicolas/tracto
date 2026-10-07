export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PlacementInput {
  main: Box;
  monitor: Box;
  widget: { width: number; height: number };
  gap: number;
  offsetTop: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

export function computeWidgetPlacement({ main, monitor, widget, gap, offsetTop }: PlacementInput): {
  x: number;
  y: number;
} {
  const monitorRight = monitor.x + monitor.width;
  const monitorBottom = monitor.y + monitor.height;
  const mainRight = main.x + main.width;
  const fitsRight = mainRight + gap + widget.width <= monitorRight;
  const fitsLeft = main.x - gap - widget.width >= monitor.x;

  let x: number;
  if (fitsRight) x = mainRight + gap;
  else if (fitsLeft) x = main.x - gap - widget.width;
  else x = monitorRight - widget.width - gap;

  const y = clamp(main.y + offsetTop, monitor.y, monitorBottom - widget.height);
  return { x: clamp(x, monitor.x, monitorRight - widget.width), y };
}
