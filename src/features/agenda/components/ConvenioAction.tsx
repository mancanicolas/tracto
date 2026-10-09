import { Copy, FileText, Image, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";
import { completeProducts, downloadConvenio, downloadConvenioImage } from "@/lib/convenio";
import { copyConvenioMessage } from "@/lib/convenioMessage";
import type { Case } from "@/lib/types";
import type { ConvenioValues } from "../schemas";
import { ConvenioDialog } from "./ConvenioDialog";
import type { ConvenioMode } from "./ConvenioForm";

interface ConvenioActionProps {
  account: Case;
  onFillCaseData: (patch: { nombre?: string; entidad?: string }) => void;
  onSetAgreementProduct: (producto: string) => void;
}

interface Feedback {
  text: string;
  tone: "error" | "success";
}

export function ConvenioAction({ account, onFillCaseData, onSetAgreementProduct }: ConvenioActionProps) {
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [dialogMode, setDialogMode] = useState<ConvenioMode | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const toast = useToast();

  const openDialog = (mode: ConvenioMode) => {
    setFeedback(null);
    setDialogMode(mode);
  };

  const confirm = async (values: ConvenioValues) => {
    const mode = dialogMode;
    setDialogMode(null);
    const { acuerdo } = account;
    const entidad = account.entidad?.trim() || values.entidad;
    if (!mode || !acuerdo || !entidad) return;

    const patch: { nombre?: string; entidad?: string } = {};
    if (values.nombre !== account.nombre) patch.nombre = values.nombre;
    if (!account.entidad?.trim()) patch.entidad = entidad;
    if (patch.nombre !== undefined || patch.entidad !== undefined) onFillCaseData(patch);
    if (!acuerdo.producto && values.productoAcuerdo) onSetAgreementProduct(values.productoAcuerdo);

    const agreement = { ...acuerdo, producto: acuerdo.producto ?? (values.productoAcuerdo || undefined) };
    const merged = { ...account, nombre: values.nombre, entidad, acuerdo: agreement };
    const products = completeProducts(values.productos);

    if (mode === "copy") {
      const result = await copyConvenioMessage(merged, agreement, products);
      if (result.ok) toast.show("Convenio copiado");
      else setFeedback({ text: result.error, tone: "error" });
      return;
    }

    setIsGenerating(true);
    const result = mode === "image" ? await downloadConvenioImage(merged, products) : await downloadConvenio(merged, products);
    setIsGenerating(false);
    if (!result.ok) setFeedback({ text: result.error, tone: "error" });
    else if (result.data === "saved") setFeedback({ text: "Convenio guardado.", tone: "success" });
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <Button loading={isGenerating} onClick={() => openDialog("download")}>
          <FileText className="size-4" strokeWidth={1.75} aria-hidden />
          {isGenerating ? "Generando convenio" : "Descargar convenio"}
        </Button>
        <Button disabled={isGenerating} onClick={() => openDialog("image")}>
          <Image className="size-4" strokeWidth={1.75} aria-hidden />
          Descargar imagen
        </Button>
        <Button onClick={() => openDialog("copy")}>
          <Copy className="size-4" strokeWidth={1.75} aria-hidden />
          Copiar convenio
        </Button>
      </div>
      <div aria-live="polite">
        {feedback ? (
          <div
            role={feedback.tone === "error" ? "alert" : "status"}
            className={
              feedback.tone === "error"
                ? "flex items-start gap-2 rounded-sm border border-danger-border bg-danger-subtle px-2.5 py-2 text-[13px] text-danger"
                : "text-xs text-fg-muted"
            }
          >
            {feedback.tone === "error" ? (
              <TriangleAlert className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} aria-hidden />
            ) : null}
            <span className="flex-1">{feedback.text}</span>
          </div>
        ) : null}
      </div>
      {dialogMode ? (
        <ConvenioDialog
          open
          mode={dialogMode}
          account={account}
          onOpenChange={(open) => {
            if (!open) setDialogMode(null);
          }}
          onConfirm={(values) => void confirm(values)}
        />
      ) : null}
      <Toast message={toast.message} />
    </div>
  );
}
