import { Copy, FileText, Pencil, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";
import { downloadConvenio, missingConvenioFields } from "@/lib/convenio";
import { copyConvenioMessage } from "@/lib/convenioMessage";
import type { Case } from "@/lib/types";
import type { ConvenioValues } from "../schemas";
import { ConvenioDialog } from "./ConvenioDialog";
import type { ConvenioMode } from "./ConvenioForm";

interface ConvenioActionProps {
  account: Case;
  onEditCase: () => void;
  onFillCaseData: (nombre: string, cartera: string) => void;
}

interface Feedback {
  text: string;
  tone: "error" | "success";
  offersEdit: boolean;
}

function joinFields(fields: string[]): string {
  if (fields.length <= 1) return fields.join("");
  return `${fields.slice(0, -1).join(", ")} y ${fields.at(-1)}`;
}

export function ConvenioAction({ account, onEditCase, onFillCaseData }: ConvenioActionProps) {
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [dialogMode, setDialogMode] = useState<ConvenioMode | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const toast = useToast();

  const openDialog = (mode: ConvenioMode) => {
    const missing = missingConvenioFields(account).filter((field) => field !== "nombre");
    const missingData = missing.filter((field) => field !== "producto");
    if (missingData.length > 0) {
      setFeedback({
        text: `Para generar el convenio falta ${joinFields(missingData)}. Editá el caso para completar los datos.`,
        tone: "error",
        offersEdit: true,
      });
      return;
    }
    if (missing.includes("producto")) {
      setFeedback({
        text: "Falta el producto del acuerdo (TC o PYC). Registrá el acuerdo de nuevo eligiendo el producto.",
        tone: "error",
        offersEdit: false,
      });
      return;
    }
    setFeedback(null);
    setDialogMode(mode);
  };

  const confirm = async (values: ConvenioValues) => {
    const mode = dialogMode;
    setDialogMode(null);
    const { acuerdo, entidad } = account;
    if (!mode || !acuerdo || !entidad) return;

    if (values.nombre !== account.nombre || values.cartera !== account.cartera) {
      onFillCaseData(values.nombre, values.cartera);
    }
    const merged = { ...account, nombre: values.nombre, cartera: values.cartera };

    if (mode === "copy") {
      const result = await copyConvenioMessage({ ...merged, entidad }, acuerdo);
      if (result.ok) toast.show("Convenio copiado");
      else setFeedback({ text: result.error, tone: "error", offersEdit: false });
      return;
    }

    setIsGenerating(true);
    const result = await downloadConvenio(merged);
    setIsGenerating(false);
    if (!result.ok) setFeedback({ text: result.error, tone: "error", offersEdit: false });
    else if (result.data === "saved") setFeedback({ text: "Convenio guardado.", tone: "success", offersEdit: false });
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <Button loading={isGenerating} onClick={() => openDialog("download")}>
          <FileText className="size-4" strokeWidth={1.75} aria-hidden />
          {isGenerating ? "Generando convenio" : "Descargar convenio"}
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
            {feedback.offersEdit ? (
              <Button size="small" onClick={onEditCase}>
                <Pencil className="size-3.5" strokeWidth={1.75} aria-hidden />
                Editar caso
              </Button>
            ) : null}
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
