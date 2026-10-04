import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  children: ReactNode;
}

export function IconButton({ label, className, children, type = "button", ...props }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex size-7 items-center justify-center rounded-sm text-fg-secondary transition-colors duration-100 motion-reduce:transition-none",
        "hover:bg-raised hover:text-fg disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:size-4",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
