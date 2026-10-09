import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { IconButton } from "@/components/ui/IconButton";
import type { Case } from "@/lib/types";
import type { ConvenioValues } from "../schemas";
import { ConvenioForm, type ConvenioMode } from "./ConvenioForm";

interface ConvenioDialogProps {
  open: boolean;
  mode: ConvenioMode;
  account: Case;
  onOpenChange: (open: boolean) => void;
  onConfirm: (values: ConvenioValues) => void;
}

export function ConvenioDialog({ open, mode, account, onOpenChange, onConfirm }: ConvenioDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-20 bg-canvas/70" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-30 max-h-[calc(100%-2rem)] w-[30rem] max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg bg-overlay p-4 shadow-[var(--shadow-modal)]">
          <div className="mb-3 flex items-start justify-between gap-2">
            <div className="flex flex-col gap-0.5">
              <Dialog.Title className="text-sm leading-5 font-semibold text-fg">Detalles del convenio</Dialog.Title>
              <Dialog.Description className="text-xs leading-4 text-fg-muted">
                Revisá y editá los datos antes de generar el convenio. El plan de cuotas no se modifica desde acá.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <IconButton label="Cerrar">
                <X strokeWidth={1.75} />
              </IconButton>
            </Dialog.Close>
          </div>
          <ConvenioForm
            mode={mode}
            account={account}
            onConfirm={onConfirm}
            onCancel={() => onOpenChange(false)}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
