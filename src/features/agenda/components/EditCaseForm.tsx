import { zodResolver } from "@hookform/resolvers/zod";
import { useRef } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Kbd } from "@/components/ui/Kbd";
import { TextField } from "@/components/ui/TextField";
import { useSubmitShortcut } from "@/hooks/useSubmitShortcut";
import { formatCentsInput, formatDni } from "@/lib/format";
import type { Case } from "@/lib/types";
import { MOD_LABEL } from "@/lib/shortcuts";
import { caseEditSchema, type CaseEditValues } from "../schemas";
import { EntityFields } from "./EntityFields";

interface EditCaseFormProps {
  account: Case;
  onSave: (values: CaseEditValues) => void;
  onCancel: () => void;
}

export function EditCaseForm({ account, onSave, onCancel }: EditCaseFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const methods = useForm<CaseEditValues>({
    resolver: zodResolver(caseEditSchema),
    defaultValues: {
      nombre: account.nombre ?? "",
      telefono: account.telefono ?? "",
      entidad: account.entidad ?? "",
      cartera: account.cartera ?? "",
      mail: account.mail ?? "",
      monto: account.monto === undefined ? "" : formatCentsInput(account.monto),
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = methods;

  useSubmitShortcut(formRef);

  const submit = handleSubmit(onSave);

  return (
    <FormProvider {...methods}>
    <form ref={formRef} onSubmit={submit} noValidate className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <TextField
            label="Apellido y nombre"
            autoComplete="off"
            autoFocus
            error={errors.nombre?.message}
            {...register("nombre")}
          />
        </div>
        <TextField
          label="DNI"
          readOnly
          value={formatDni(account.dni)}
          className="font-mono tabular-nums text-fg-muted"
        />
        <TextField
          label="Teléfono"
          inputMode="tel"
          autoComplete="off"
          placeholder="11 5555-1234"
          className="font-mono tabular-nums"
          error={errors.telefono?.message}
          {...register("telefono")}
        />
        <EntityFields />
        <TextField
          label="Mail"
          type="email"
          autoComplete="off"
          error={errors.mail?.message}
          {...register("mail")}
        />
        <TextField
          label="Monto"
          inputMode="decimal"
          autoComplete="off"
          placeholder="0,00"
          className="font-mono tabular-nums text-right"
          error={errors.monto?.message}
          {...register("monto")}
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary">
          Guardar caso
          <Kbd tone="onAccent">{MOD_LABEL}+Enter</Kbd>
        </Button>
      </div>
    </form>
    </FormProvider>
  );
}
