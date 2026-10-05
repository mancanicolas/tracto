import { zodResolver } from "@hookform/resolvers/zod";
import { useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { CheckboxField } from "@/components/ui/CheckboxField";
import { Kbd } from "@/components/ui/Kbd";
import { TextField } from "@/components/ui/TextField";
import { useSubmitShortcut } from "@/hooks/useSubmitShortcut";
import { todayIso } from "@/lib/dates";
import { MOD_LABEL } from "@/lib/shortcuts";
import { scheduleSchema, type ScheduleValues } from "../schemas";

interface ScheduleFormProps {
  onSave: (fecha: string, motivo: string, hora?: string) => void;
}

export function ScheduleForm({ onSave }: ScheduleFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ScheduleValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: { fecha: todayIso(), motivo: "", con_alarma: false, hora: "" },
  });

  const hasAlarm = useWatch({ control, name: "con_alarma" });

  useSubmitShortcut(formRef);

  const submit = handleSubmit(({ fecha, motivo, con_alarma, hora }) =>
    onSave(fecha, motivo, con_alarma ? hora : undefined),
  );

  return (
    <form ref={formRef} onSubmit={submit} noValidate className="flex flex-col gap-3">
      <TextField
        label="Fecha"
        type="date"
        min={todayIso()}
        data-first-field
        className="font-mono tabular-nums"
        error={errors.fecha?.message}
        {...register("fecha")}
      />
      <TextField
        label="Motivo"
        autoComplete="off"
        placeholder="Consultar por confirmación"
        error={errors.motivo?.message}
        {...register("motivo")}
      />
      <div className="flex flex-col gap-2">
        <CheckboxField label="Avisarme con una alarma a un horario" {...register("con_alarma")} />
        {hasAlarm ? (
          <TextField
            label="Horario de la alarma"
            type="time"
            className="font-mono tabular-nums"
            error={errors.hora?.message}
            {...register("hora")}
          />
        ) : null}
      </div>
      <Button type="submit" variant="primary" className="self-end">
        Agendar seguimiento
        <Kbd tone="onAccent">{MOD_LABEL}+Enter</Kbd>
      </Button>
    </form>
  );
}
