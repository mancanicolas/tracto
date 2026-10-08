import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { cn } from "@/lib/cn";
import { newDraftMethod, type DraftMethod } from "./entityDraft";

interface PaymentMethodsEditorProps {
  methods: DraftMethod[];
  onChange: (methods: DraftMethod[]) => void;
}

const INPUT_CLASS =
  "h-8 w-full rounded-sm border border-line bg-input px-2.5 text-[13px] text-fg placeholder:text-fg-muted hover:border-line-strong";

export function PaymentMethodsEditor({ methods, onChange }: PaymentMethodsEditorProps) {
  const update = (key: string, patch: Partial<DraftMethod>) =>
    onChange(methods.map((method) => (method.key === key ? { ...method, ...patch } : method)));

  return (
    <div className="flex flex-col gap-2">
      {methods.length === 0 ? (
        <p className="text-xs text-fg-muted">Este producto todavía no tiene medios de pago.</p>
      ) : (
        <ul className="flex flex-col gap-1.5" aria-label="Medios de pago">
          {methods.map((method, index) => (
            <li key={method.key} className="flex items-center gap-1.5">
              <input
                value={method.etiqueta}
                onChange={(event) => update(method.key, { etiqueta: event.target.value })}
                aria-label={`Etiqueta del medio de pago ${index + 1}`}
                placeholder="Etiqueta (CBU, Alias…)"
                maxLength={60}
                autoComplete="off"
                className={cn(INPUT_CLASS, "w-40 shrink-0")}
              />
              <input
                value={method.valor}
                onChange={(event) => update(method.key, { valor: event.target.value })}
                aria-label={`Valor del medio de pago ${index + 1}`}
                placeholder="Valor"
                maxLength={240}
                autoComplete="off"
                className={cn(INPUT_CLASS, "min-w-0 flex-1")}
              />
              <IconButton
                label={`Quitar medio de pago ${index + 1}`}
                onClick={() => onChange(methods.filter((item) => item.key !== method.key))}
                className="size-8 border border-line hover:border-line-strong"
              >
                <Trash2 strokeWidth={1.75} />
              </IconButton>
            </li>
          ))}
        </ul>
      )}
      <Button size="small" className="self-start" onClick={() => onChange([...methods, newDraftMethod()])}>
        <Plus className="size-3.5" strokeWidth={1.75} aria-hidden />
        Agregar medio de pago
      </Button>
    </div>
  );
}
