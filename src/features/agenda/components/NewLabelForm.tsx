import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { useSubmitShortcut } from "@/hooks/useSubmitShortcut";
import { cn } from "@/lib/cn";
import { LABEL_COLORS, LABEL_COLOR_META, type LabelColor } from "@/lib/labels";
import { labelSchema, type LabelValues } from "../schemas";

interface NewLabelFormProps {
  existingNames: string[];
  onCreate: (nombre: string, color: LabelColor) => void;
  onCancel: () => void;
}

export function NewLabelForm({ existingNames, onCreate, onCancel }: NewLabelFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const schema = useMemo(() => labelSchema(existingNames), [existingNames]);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LabelValues>({ resolver: zodResolver(schema), defaultValues: { nombre: "", color: "fucsia" } });

  useSubmitShortcut(formRef);

  const submit = handleSubmit(({ nombre, color }) => onCreate(nombre, color));

  return (
    <form ref={formRef} onSubmit={submit} noValidate className="flex flex-col gap-2.5 p-2">
      <TextField
        label="Nombre de la etiqueta"
        autoComplete="off"
        autoFocus
        placeholder="Reclamo"
        error={errors.nombre?.message}
        {...register("nombre")}
      />
      <Controller
        control={control}
        name="color"
        render={({ field }) => (
          <div className="flex flex-col gap-1.5">
            <span id="label-color-title" className="text-xs leading-4 font-medium text-fg-secondary">
              Color
            </span>
            <div role="radiogroup" aria-labelledby="label-color-title" className="flex gap-1.5">
              {LABEL_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  role="radio"
                  aria-checked={field.value === color}
                  aria-label={LABEL_COLOR_META[color].name}
                  title={LABEL_COLOR_META[color].name}
                  onClick={() => field.onChange(color)}
                  className={cn(
                    "size-6 rounded-sm transition-shadow duration-100 motion-reduce:transition-none",
                    LABEL_COLOR_META[color].swatch,
                    field.value === color
                      ? "shadow-[0_0_0_2px_var(--bg-overlay),0_0_0_4px_var(--text-primary)]"
                      : "opacity-80 hover:opacity-100",
                  )}
                />
              ))}
            </div>
          </div>
        )}
      />
      <div className="flex justify-end gap-2">
        <Button size="small" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button size="small" type="submit">
          Crear etiqueta
        </Button>
      </div>
    </form>
  );
}
