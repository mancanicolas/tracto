import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const VARIANTS = {
  primary: "bg-accent text-fg-on-accent hover:bg-accent-hover active:bg-accent-pressed",
  secondary: "bg-raised border border-line text-fg hover:border-line-strong",
  ghost: "text-fg-secondary hover:bg-raised hover:text-fg",
  destructive: "bg-danger-subtle text-danger border border-danger-border hover:bg-danger/20",
} as const;

const SIZES = {
  default: "h-8 px-3 text-[13px]",
  small: "h-7 px-2 text-xs",
} as const;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
  loading?: boolean;
}

export function Button({
  variant = "secondary",
  size = "default",
  loading = false,
  disabled,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-sm font-medium transition-colors duration-100 motion-reduce:transition-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {loading ? <Loader2 className="size-4 animate-spin motion-reduce:animate-none" strokeWidth={1.75} aria-hidden /> : null}
      {children}
    </button>
  );
}
