import { Copy, FileText, Pencil, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";
import { downloadConvenio, missingConvenioFields } from "@/lib/convenio";
import { copyConvenioMessage } from "@/lib/convenioMessage";
import type { Case } from "@/lib/types";

interface ConvenioActionProps {
  account: Case;
  onEditCase: () => void;
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

export function ConvenioAction({ account, onEditCase }: ConvenioActionProps) {
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const toast = useToast();

  const hasRequiredData = (): boolean => {
    const missing = missingConvenioFields(account);
    if (missing.length === 0) return true;
    setFeedback({
      text: `Para generar el convenio falta ${joinFields(missing)}. Editá el caso para completar los datos.`,
      tone: "error",
      offersEdit: true,
    });
    return false;
  };

  const handleDownload = async () => {
    if (!hasRequiredData()) return;
    setFeedback(null);
    setIsGenerating(true);
    const result = await downloadConvenio(account);
    setIsGenerating(false);
    if (!result.ok) setFeedback({ text: result.error, tone: "error", offersEdit: false });
    else if (result.data === "saved") setFeedback({ text: "Convenio guardado.", tone: "success", offersEdit: false });
  };

  const handleCopy = async () => {
    if (!hasRequiredData()) return;
    const { acuerdo, nombre, entidad } = account;
    if (!acuerdo || !nombre || !entidad) return;
    setFeedback(null);
    const result = await copyConvenioMessage({ ...account, nombre, entidad }, acuerdo);
    if (result.ok) toast.show("Convenio copiado");
    else setFeedback({ text: result.error, tone: "error", offersEdit: false });
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <Button loading={isGenerating} onClick={() => void handleDownload()}>
          <FileText className="size-4" strokeWidth={1.75} aria-hidden />
          {isGenerating ? "Generando convenio" : "Descargar convenio"}
        </Button>
        <Button onClick={() => void handleCopy()}>
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
      <Toast message={toast.message} />
    </div>
  );
}
