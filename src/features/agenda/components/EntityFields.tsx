import { useFormContext, useWatch } from "react-hook-form";
import { SelectField } from "@/components/ui/SelectField";
import { DEFAULT_PORTFOLIO, ENTIDADES, ENTIDAD_NAMES, hasMultipleProducts } from "@/constants/entidades";

interface EntityFormValues {
  entidad: string;
  cartera: string;
  producto: string;
}

const toOption = (value: string) => ({ value, label: value });

export function EntityFields() {
  const {
    register,
    setValue,
    control,
    formState: { errors },
  } = useFormContext<EntityFormValues>();
  const entidad = useWatch({ control, name: "entidad" });

  const entityNames = entidad && !ENTIDAD_NAMES.includes(entidad) ? [...ENTIDAD_NAMES, entidad] : ENTIDAD_NAMES;
  const carteras = ENTIDADES[entidad]?.carteras ?? [DEFAULT_PORTFOLIO];
  const entidadField = register("entidad");

  return (
    <>
      <SelectField
        label="Entidad"
        placeholder="Elegí la entidad"
        options={entityNames.map(toOption)}
        error={errors.entidad?.message}
        {...entidadField}
        onChange={(event) => {
          void entidadField.onChange(event);
          setValue("cartera", ENTIDADES[event.target.value]?.carteras[0] ?? "");
          setValue("producto", "");
        }}
      />
      <SelectField
        label="Cartera"
        options={carteras.map(toOption)}
        disabled={!entidad}
        error={errors.cartera?.message}
        {...register("cartera")}
      />
      {hasMultipleProducts(entidad) ? (
        <SelectField
          label="Producto"
          placeholder="Elegí el producto"
          options={(ENTIDADES[entidad]?.productos ?? []).map(toOption)}
          error={errors.producto?.message}
          {...register("producto")}
        />
      ) : null}
    </>
  );
}
