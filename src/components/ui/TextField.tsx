import { useId, type InputHTMLAttributes, type ReactNode, type Ref } from "react";
import { cn } from "@/lib/cn";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  trailing?: ReactNode;
  ref?: Ref<HTMLInputElement>;
}

export function TextField({ label, error, trailing, className, ref, ...props }: TextFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs leading-4 font-medium text-fg-secondary">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          ref={ref}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            "h-8 w-full rounded-sm border bg-input px-2.5 text-[13px] text-fg placeholder:text-fg-muted",
            "transition-colors duration-100 motion-reduce:transition-none",
            error ? "border-danger-border" : "border-line hover:border-line-strong",
            trailing ? "pr-9" : null,
            className,
          )}
          {...props}
        />
        {trailing ? <div className="absolute inset-y-0 right-0.5 flex items-center">{trailing}</div> : null}
      </div>
      {error ? (
        <p id={errorId} className="text-xs leading-4 text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
