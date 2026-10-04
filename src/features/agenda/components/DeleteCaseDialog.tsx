import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/Button";
import { formatDni } from "@/lib/format";
import type { Case } from "@/lib/types";

interface DeleteCaseDialogProps {
  account: Case | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteCaseDialog({ account, onCancel, onConfirm }: DeleteCaseDialogProps) {
  return (
    <Dialog.Root open={account !== null} onOpenChange={(open) => (open ? undefined : onCancel())}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-canvas/70" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[24rem] max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-overlay p-4 shadow-[var(--shadow-modal)]">
          <Dialog.Title className="text-sm leading-5 font-semibold text-fg">Eliminar caso</Dialog.Title>
          <Dialog.Description className="mt-1 text-[13px] leading-5 text-fg-secondary">
            Se borra {account?.nombre ?? "el caso"} (DNI {account ? formatDni(account.dni) : ""}) con sus notas, agenda y
            acuerdo. No se puede deshacer.
          </Dialog.Description>
          <div className="mt-4 flex justify-end gap-2">
            <Button onClick={onCancel}>Cancelar</Button>
            <Button variant="destructive" onClick={onConfirm}>
              Eliminar caso
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
