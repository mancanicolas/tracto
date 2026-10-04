import { zodResolver } from "@hookform/resolvers/zod";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Kbd } from "@/components/ui/Kbd";
import { TextField } from "@/components/ui/TextField";
import { useSubmitShortcut } from "@/hooks/useSubmitShortcut";
import { todayIso } from "@/lib/dates";
import { MOD_LABEL } from "@/lib/shortcuts";
import { scheduleSchema, type ScheduleValues } from "../schemas";

interface ScheduleFormProps {
  onSave: (fecha: string, motivo: string) => void;
}

export function ScheduleForm({ onSave }: ScheduleFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ScheduleValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: { fecha: todayIso(), motivo: "" },
  });

  useSubmitShortcut(formRef);

  const submit = handleSubmit(({ fecha, motivo }) => onSave(fecha, motivo));

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
      <Button type="submit" variant="primary" className="self-end">
        Agendar seguimiento
        <Kbd tone="onAccent">{MOD_LABEL}+Enter</Kbd>
      </Button>
    </form>
  );
}
