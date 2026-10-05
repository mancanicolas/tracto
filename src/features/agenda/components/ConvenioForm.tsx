import { zodResolver } from "@hookform/resolvers/zod";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Kbd } from "@/components/ui/Kbd";
import { TextField } from "@/components/ui/TextField";
import { DEFAULT_PORTFOLIO, findEntity } from "@/constants/entidades";
import { useSubmitShortcut } from "@/hooks/useSubmitShortcut";
import { MOD_LABEL } from "@/lib/shortcuts";
import type { Case } from "@/lib/types";
import { convenioSchema, type ConvenioValues } from "../schemas";

export type ConvenioMode = "copy" | "download" | "image";

const CARTERAS_LIST_ID = "convenio-carteras";

const CONFIRM_LABELS: Record<ConvenioMode, string> = {
  copy: "Confirmar y copiar",
  download: "Confirmar y descargar",
  image: "Confirmar y descargar imagen",
};

interface ConvenioFormProps {
  mode: ConvenioMode;
  account: Case;
  onConfirm: (values: ConvenioValues) => void;
  onCancel: () => void;
}

export function ConvenioForm({ mode, account, onConfirm, onCancel }: ConvenioFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const carteras = findEntity(account.entidad)?.carteras ?? [DEFAULT_PORTFOLIO];
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ConvenioValues>({
    resolver: zodResolver(convenioSchema),
    defaultValues: {
      nombre: account.nombre ?? "",
      cartera: account.cartera ?? carteras[0] ?? "",
    },
  });

  useSubmitShortcut(formRef);

  const submit = handleSubmit(onConfirm);

  return (
    <form ref={formRef} onSubmit={submit} noValidate className="flex flex-col gap-3">
      <TextField
        label="Nombre y apellido / Titular"
        autoComplete="off"
        autoFocus
        error={errors.nombre?.message}
        {...register("nombre")}
      />
      <TextField
        label="Cartera"
        autoComplete="off"
        list={CARTERAS_LIST_ID}
        error={errors.cartera?.message}
        {...register("cartera")}
      />
      <datalist id={CARTERAS_LIST_ID}>
        {carteras.map((cartera) => (
          <option key={cartera} value={cartera} />
        ))}
      </datalist>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary">
          {CONFIRM_LABELS[mode]}
          <Kbd tone="onAccent">{MOD_LABEL}+Enter</Kbd>
        </Button>
      </div>
    </form>
  );
}
