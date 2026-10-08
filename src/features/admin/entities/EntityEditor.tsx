import { Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { ChipListField } from "./ChipListField";
import type { EntityDraft } from "./entityDraft";
import { PaymentMethodsEditor } from "./PaymentMethodsEditor";

interface EntityEditorProps {
  draft: EntityDraft;
  isNew: boolean;
  isDirty: boolean;
  isSaving: boolean;
  error: string | null;
  message: string;
  onChange: (draft: EntityDraft) => void;
  onNameChange: (name: string) => void;
  onSave: () => void;
  onDiscard: () => void;
  onDelete: () => void;
}

export function EntityEditor({
  draft,
  isNew,
  isDirty,
  isSaving,
  error,
  message,
  onChange,
  onNameChange,
  onSave,
  onDiscard,
  onDelete,
}: EntityEditorProps) {
  const [pickedProduct, setPickedProduct] = useState<string | null>(null);
  const activeProduct = pickedProduct && draft.productos.includes(pickedProduct) ? pickedProduct : (draft.productos[0] ?? "");
  const methods = draft.metodos[activeProduct] ?? [];

  const addProduct = (name: string) =>
    onChange({
      ...draft,
      productos: [...draft.productos, name],
      metodos: { ...draft.metodos, [name]: [] },
    });

  const removeProduct = (name: string) => {
    const { [name]: removed, ...rest } = draft.metodos;
    void removed;
    onChange({ ...draft, productos: draft.productos.filter((item) => item !== name), metodos: rest });
  };

  return (
    <section aria-label="Editor de entidad" className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="admin-entity-name" className="text-xs leading-4 font-medium text-fg-secondary">
            Nombre de la entidad
          </label>
          <input
            id="admin-entity-name"
            value={draft.nombre}
            onChange={(event) => onNameChange(event.target.value)}
            readOnly={!isNew}
            maxLength={80}
            autoComplete="off"
            placeholder="Por ejemplo, BANCO EJEMPLO"
            className={cn(
              "h-8 w-full max-w-sm rounded-sm border border-line bg-input px-2.5 text-[13px] text-fg placeholder:text-fg-muted",
              isNew ? "hover:border-line-strong" : "cursor-default text-fg-secondary",
            )}
          />
          {isNew ? null : (
            <p className="text-xs text-fg-muted">
              El nombre no se puede cambiar: los casos guardan la entidad por su nombre. Para renombrarla, creá una nueva
              y eliminá esta.
            </p>
          )}
        </div>

        <ChipListField
          label="Productos"
          items={draft.productos}
          addPlaceholder="Nuevo producto"
          onAdd={addProduct}
          onRemove={removeProduct}
        />

        <ChipListField
          label="Carteras"
          items={draft.carteras}
          addPlaceholder="Nueva cartera"
          onAdd={(name) => onChange({ ...draft, carteras: [...draft.carteras, name] })}
          onRemove={(name) => onChange({ ...draft, carteras: draft.carteras.filter((item) => item !== name) })}
        />

        <div className="flex flex-col gap-2">
          <h3 className="text-xs leading-4 font-medium text-fg-secondary">Medios de pago de los convenios</h3>
          {draft.productos.length > 1 ? (
            <div role="tablist" aria-label="Producto" className="flex gap-1">
              {draft.productos.map((producto) => (
                <button
                  key={producto}
                  type="button"
                  role="tab"
                  aria-selected={producto === activeProduct}
                  onClick={() => setPickedProduct(producto)}
                  className={cn(
                    "h-7 rounded-sm border px-2.5 text-xs transition-colors duration-100 motion-reduce:transition-none",
                    producto === activeProduct
                      ? "border-accent-border bg-accent-subtle text-fg"
                      : "border-line text-fg-secondary hover:border-line-strong hover:text-fg",
                  )}
                >
                  {producto}
                </button>
              ))}
            </div>
          ) : null}
          <PaymentMethodsEditor
            methods={methods}
            onChange={(next) => onChange({ ...draft, metodos: { ...draft.metodos, [activeProduct]: next } })}
          />
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 border-t border-line-subtle p-3">
        {isNew ? null : (
          <Button variant="destructive" onClick={onDelete}>
            <Trash2 className="size-4" strokeWidth={1.75} aria-hidden />
            Eliminar entidad
          </Button>
        )}
        <p role="status" aria-live="polite" className={cn("min-w-0 flex-1 truncate text-xs", error ? "text-danger" : "text-success")}>
          {error ?? message}
        </p>
        <Button onClick={onDiscard} disabled={!isDirty || isSaving}>
          Descartar
        </Button>
        <Button variant="primary" onClick={onSave} loading={isSaving} disabled={!isDirty}>
          {isNew ? "Crear entidad" : "Guardar cambios"}
        </Button>
      </div>
    </section>
  );
}
