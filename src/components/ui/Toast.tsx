import { Check } from "lucide-react";

interface ToastProps {
  message: string | null;
}

export function Toast({ message }: ToastProps) {
  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center">
      {message ? (
        <p className="flex items-center gap-2 rounded-md border border-line bg-overlay px-3 py-2 text-[13px] text-fg shadow-[var(--shadow-popover)]">
          <Check className="size-4 text-success" strokeWidth={1.75} aria-hidden />
          {message}
        </p>
      ) : null}
    </div>
  );
}
