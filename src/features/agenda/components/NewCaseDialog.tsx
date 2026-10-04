import { zodResolver } from "@hookform/resolvers/zod";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Kbd } from "@/components/ui/Kbd";
import { TextField } from "@/components/ui/TextField";
import { useSubmitShortcut } from "@/hooks/useSubmitShortcut";
import { normalizeDni } from "@/lib/format";
import { MOD_LABEL } from "@/lib/shortcuts";
import { newCaseSchema } from "../schemas";

interface NewCaseDialogProps {
  open: boolean;
  existingDnis: string[];
  onOpenChange: (open: boolean) => void;
  onCreate: (dni: string) => void;
}

export function NewCaseDialog({ open, existingDnis, onOpenChange, onCreate }: NewCaseDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-20 bg-canvas/70" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-30 w-80 max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-overlay p-4 shadow-[var(--shadow-modal)]">
          <NewCaseForm existingDnis={existingDnis} onCreate={onCreate} onCancel={() => onOpenChange(false)} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

interface NewCaseFormProps {
  existingDnis: string[];
  onCreate: (dni: string) => void;
  onCancel: () => void;
}

function NewCaseForm({ existingDnis, onCreate, onCancel }: NewCaseFormProps) {
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
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <Dialog.Title className="text-sm leading-5 font-semibold text-fg">Nuevo caso</Dialog.Title>
          <Dialog.Description className="text-xs leading-4 text-fg-muted">
            Cargá el DNI. Los demás datos se completan después.
          </Dialog.Description>
        </div>
        <Dialog.Close asChild>
          <IconButton label="Cerrar">
            <X strokeWidth={1.75} />
          </IconButton>
        </Dialog.Close>
      </div>
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
