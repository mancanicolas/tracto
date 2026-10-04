import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Kbd } from "@/components/ui/Kbd";
import { TextField } from "@/components/ui/TextField";
import { useSubmitShortcut } from "@/hooks/useSubmitShortcut";
import { normalizeDni } from "@/lib/format";
import { MOD_LABEL } from "@/lib/shortcuts";
import { newCaseSchema } from "../schemas";

interface NewCaseFormProps {
  existingDnis: string[];
  onCreate: (dni: string) => void;
  onCancel: () => void;
}

export function NewCaseForm({ existingDnis, onCreate, onCancel }: NewCaseFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const schema = useMemo(() => newCaseSchema(existingDnis), [existingDnis]);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { dni: "" } });

  useSubmitShortcut(formRef);

  const submit = handleSubmit(({ dni }) => onCreate(normalizeDni(dni)));

  return (
    <form ref={formRef} onSubmit={submit} noValidate className="flex flex-col gap-3">
      <TextField
        label="DNI"
        inputMode="numeric"
        autoComplete="off"
        autoFocus
        placeholder="12345678"
        className="font-mono tabular-nums"
        error={errors.dni?.message}
        {...register("dni")}
      />
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary">
          Crear caso
          <Kbd tone="onAccent">{MOD_LABEL}+Enter</Kbd>
        </Button>
      </div>
    </form>
  );
}
