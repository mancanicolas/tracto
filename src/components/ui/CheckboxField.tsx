import { useId, type InputHTMLAttributes, type Ref } from "react";

interface CheckboxFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  ref?: Ref<HTMLInputElement>;
}

export function CheckboxField({ label, ref, ...props }: CheckboxFieldProps) {
  const id = useId();
  return (
    <div className="flex items-center gap-2">
      <input id={id} ref={ref} type="checkbox" className="size-4 rounded-xs accent-accent" {...props} />
      <label htmlFor={id} className="text-[13px] leading-5 text-fg-secondary">
        {label}
      </label>
    </div>
  );
}
