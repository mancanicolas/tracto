import { useId, type Ref, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  ref?: Ref<HTMLTextAreaElement>;
}

export function TextAreaField({ label, error, className, ref, ...props }: TextAreaFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs leading-4 font-medium text-fg-secondary">
        {label}
      </label>
      <textarea
        id={id}
        ref={ref}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          "w-full resize-none rounded-sm border bg-input px-2.5 py-1.5 text-sm leading-5 text-fg placeholder:text-fg-muted",
          "transition-colors duration-100 motion-reduce:transition-none",
          error ? "border-danger-border" : "border-line hover:border-line-strong",
          className,
        )}
        {...props}
      />
      {error ? (
        <p id={errorId} className="text-xs leading-4 text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
