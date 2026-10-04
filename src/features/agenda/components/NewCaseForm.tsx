import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useRef } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Kbd } from "@/components/ui/Kbd";
import { TextField } from "@/components/ui/TextField";
import { useSubmitShortcut } from "@/hooks/useSubmitShortcut";
import { normalizeDni } from "@/lib/format";
import { MOD_LABEL } from "@/lib/shortcuts";
import type { CaseDetails } from "@/lib/types";
import { toCaseDetails } from "../caseDetails";
import { newCaseSchema, type NewCaseValues } from "../schemas";
import { EntityFields } from "./EntityFields";

interface NewCaseFormProps {
  existingDnis: string[];
  onCreate: (dni: string, details: CaseDetails) => void;
  onCancel: () => void;
}

export function NewCaseForm({ existingDnis, onCreate, onCancel }: NewCaseFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const schema = useMemo(() => newCaseSchema(existingDnis), [existingDnis]);
  const methods = useForm<NewCaseValues>({
    resolver: zodResolver(schema),
    defaultValues: { dni: "", nombre: "", monto: "", entidad: "", cartera: "", producto: "" },
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = methods;

  useSubmitShortcut(formRef);

  const submit = handleSubmit((values) => onCreate(normalizeDni(values.dni), toCaseDetails(values)));

  return (
    <FormProvider {...methods}>
      <form ref={formRef} onSubmit={submit} noValidate className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
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
          <TextField
            label="Deuda total"
            inputMode="decimal"
            autoComplete="off"
            placeholder="0,00"
            className="font-mono tabular-nums text-right"
            error={errors.monto?.message}
            {...register("monto")}
          />
          <div className="col-span-2">
            <TextField
              label="Nombre del titular"
              autoComplete="off"
              error={errors.nombre?.message}
              {...register("nombre")}
            />
          </div>
          <EntityFields />
        </div>
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
    </FormProvider>
  );
}
