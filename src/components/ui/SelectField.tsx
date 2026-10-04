import { useId, type Ref, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  ref?: Ref<HTMLSelectElement>;
}

export function SelectField({ label, options, placeholder, error, className, ref, ...props }: SelectFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs leading-4 font-medium text-fg-secondary">
        {label}
      </label>
      <select
        id={id}
        ref={ref}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          "h-8 w-full rounded-sm border bg-input px-2 text-[13px] text-fg transition-colors duration-100 motion-reduce:transition-none",
          error ? "border-danger-border" : "border-line hover:border-line-strong",
          className,
        )}
        {...props}
      >
        {placeholder !== undefined ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? (
        <p id={errorId} className="text-xs leading-4 text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
