import { zodResolver } from "@hookform/resolvers/zod";
import { Minus, Plus } from "lucide-react";
import { useMemo, useRef } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Kbd } from "@/components/ui/Kbd";
import { SelectField } from "@/components/ui/SelectField";
import { TextField } from "@/components/ui/TextField";
import { findEntity, hasMultipleProducts } from "@/constants/entidades";
import { useEntityCatalog } from "@/hooks/useEntityCatalog";
import { useSubmitShortcut } from "@/hooks/useSubmitShortcut";
import { cn } from "@/lib/cn";
import { normalizeDni } from "@/lib/format";
import { MOD_LABEL } from "@/lib/shortcuts";
import type { Case } from "@/lib/types";
import { convenioSchema, type ConvenioValues } from "../schemas";

export type ConvenioMode = "copy" | "download" | "image";

const EMPTY_PRODUCT_ROW = { cartera: "", producto: "" };

const CONFIRM_LABELS: Record<ConvenioMode, string> = {
  copy: "Confirmar y copiar",
  download: "Confirmar y descargar",
  image: "Confirmar y descargar imagen",
};

const INPUT_CLASS =
  "h-8 w-full rounded-sm border bg-input px-2.5 text-[13px] text-fg placeholder:text-fg-muted transition-colors duration-100 motion-reduce:transition-none";

interface ConvenioFormProps {
  mode: ConvenioMode;
  account: Case;
  onConfirm: (values: ConvenioValues) => void;
  onCancel: () => void;
}

export function ConvenioForm({ mode, account, onConfirm, onCancel }: ConvenioFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const catalog = useEntityCatalog();
  const schema = useMemo(() => convenioSchema(), []);
  const currentEntity = account.entidad?.trim() ?? "";
  const currentProduct = account.acuerdo?.producto ?? "";
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ConvenioValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: account.nombre ?? "",
      entidad: currentEntity,
      productoAcuerdo: currentProduct,
      productos: [EMPTY_PRODUCT_ROW],
    },
  });
  const chosenEntity = useWatch({ control, name: "entidad" });
  const entity = findEntity(chosenEntity);
  const needsAgreementProduct = hasMultipleProducts(chosenEntity);
  const entityNames = Object.keys(catalog);
  const entityOptions = (currentEntity && !entityNames.includes(currentEntity) ? [...entityNames, currentEntity] : entityNames).map(
    (name) => ({ value: name, label: name }),
  );
  const { fields, insert, remove } = useFieldArray({ control, name: "productos" });

  useSubmitShortcut(formRef);

  const submit = handleSubmit(onConfirm);

  return (
    <form ref={formRef} onSubmit={submit} noValidate className="flex flex-col gap-3">
      <TextField
        label="Nombre y apellido / Titular"
        autoComplete="off"
        autoFocus
        error={errors.nombre?.message}
        {...register("nombre")}
      />

      <TextField
        label="DNI"
        value={normalizeDni(account.dni)}
        readOnly
        tabIndex={-1}
        className="cursor-default font-mono tabular-nums text-fg-secondary"
      />

      <SelectField
        label="Entidad"
        placeholder="Elegí la entidad"
        options={entityOptions}
        error={errors.entidad?.message}
        {...register("entidad")}
      />

      {needsAgreementProduct ? (
        <SelectField
          label="Producto del acuerdo"
          placeholder="Elegí el producto"
          options={(entity?.productos ?? []).map((value) => ({ value, label: value }))}
          error={errors.productoAcuerdo?.message}
          {...register("productoAcuerdo")}
        />
      ) : null}

      <fieldset className="flex flex-col gap-1.5">
        <legend className="mb-1.5 text-xs leading-4 font-medium text-fg-secondary">Productos</legend>
        <div className="grid grid-cols-[1fr_1fr_4.5rem] gap-1.5 text-xs leading-4 text-fg-muted" aria-hidden>
          <span>Cartera</span>
          <span>N° de producto</span>
          <span />
        </div>
        <ul className="flex flex-col gap-1.5">
          {fields.map((field, index) => {
            const rowErrors = errors.productos?.[index];
            return (
              <li key={field.id} className="flex flex-col gap-1">
                <div className="grid grid-cols-[1fr_1fr_4.5rem] items-center gap-1.5">
                  <input
                    autoComplete="off"
                    aria-label={`Cartera del producto ${index + 1}`}
                    aria-invalid={rowErrors?.cartera ? true : undefined}
                    placeholder="Cartera"
                    className={cn(INPUT_CLASS, rowErrors?.cartera ? "border-danger-border" : "border-line hover:border-line-strong")}
                    {...register(`productos.${index}.cartera`)}
                  />
                  <input
                    autoComplete="off"
                    aria-label={`N° de producto ${index + 1}`}
                    aria-invalid={rowErrors?.producto ? true : undefined}
                    placeholder="N° de producto"
                    className={cn(
                      INPUT_CLASS,
                      "font-mono tabular-nums",
                      rowErrors?.producto ? "border-danger-border" : "border-line hover:border-line-strong",
                    )}
                    {...register(`productos.${index}.producto`)}
                  />
                  <div className="flex gap-1">
                    <IconButton
                      label="Agregar otro producto"
                      onClick={() => insert(index + 1, EMPTY_PRODUCT_ROW)}
                      className="size-8 border border-line hover:border-line-strong"
                    >
                      <Plus strokeWidth={1.75} />
                    </IconButton>
                    <IconButton
                      label="Quitar este producto"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                      className="size-8 border border-line hover:border-line-strong"
                    >
                      <Minus strokeWidth={1.75} />
                    </IconButton>
                  </div>
                </div>
                {rowErrors?.cartera || rowErrors?.producto ? (
                  <p role="alert" className="text-xs leading-4 text-danger">
                    {rowErrors.cartera?.message ?? rowErrors.producto?.message}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      </fieldset>

      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary">
          {CONFIRM_LABELS[mode]}
          <Kbd tone="onAccent">{MOD_LABEL}+Enter</Kbd>
        </Button>
      </div>
    </form>
  );
}
