import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { IconButton } from "@/components/ui/IconButton";
import { cn } from "@/lib/cn";
import type { Case } from "@/lib/types";
import type { CaseEditValues } from "../schemas";
import { EditCaseForm } from "./EditCaseForm";
import { NewCaseForm } from "./NewCaseForm";

interface CaseDialogProps {
  open: boolean;
  account?: Case;
  existingDnis: string[];
  onOpenChange: (open: boolean) => void;
  onCreate: (dni: string) => void;
  onUpdate: (values: CaseEditValues) => void;
}

export function CaseDialog({ open, account, existingDnis, onOpenChange, onCreate, onUpdate }: CaseDialogProps) {
  const close = () => onOpenChange(false);
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-20 bg-canvas/70" />
        <Dialog.Content
          className={cn(
            "fixed top-1/2 left-1/2 z-30 max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-overlay p-4 shadow-[var(--shadow-modal)]",
            account ? "w-[28rem]" : "w-80",
          )}
        >
          <div className="mb-3 flex items-start justify-between gap-2">
            <div className="flex flex-col gap-0.5">
              <Dialog.Title className="text-sm leading-5 font-semibold text-fg">
                {account ? "Editar caso" : "Nuevo caso"}
              </Dialog.Title>
              <Dialog.Description className="text-xs leading-4 text-fg-muted">
                {account
                  ? "Completá o corregí los datos del deudor."
                  : "Cargá el DNI. Los demás datos se completan después."}
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <IconButton label="Cerrar">
                <X strokeWidth={1.75} />
              </IconButton>
            </Dialog.Close>
          </div>
          {account ? (
            <EditCaseForm account={account} onSave={onUpdate} onCancel={close} />
          ) : (
            <NewCaseForm existingDnis={existingDnis} onCreate={onCreate} onCancel={close} />
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
