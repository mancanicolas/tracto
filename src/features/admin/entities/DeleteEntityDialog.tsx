import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/Button";

interface DeleteEntityDialogProps {
  name: string | null;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteEntityDialog({ name, isDeleting, onCancel, onConfirm }: DeleteEntityDialogProps) {
  return (
    <Dialog.Root open={name !== null} onOpenChange={(open) => (open ? undefined : onCancel())}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-canvas/70" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[26rem] max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-overlay p-4 shadow-[var(--shadow-modal)]">
          <Dialog.Title className="text-sm leading-5 font-semibold text-fg">Eliminar entidad</Dialog.Title>
          <Dialog.Description className="mt-1 text-[13px] leading-5 text-fg-secondary">
            Se elimina {name} y todos sus medios de pago para todos los usuarios. Los casos que ya tienen esta entidad
            conservan el nombre, pero sus convenios van a salir sin medios de pago. No se puede deshacer.
          </Dialog.Description>
          <div className="mt-4 flex justify-end gap-2">
            <Button onClick={onCancel} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={onConfirm} loading={isDeleting}>
              Eliminar entidad
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
