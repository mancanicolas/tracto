import { useFormContext, useWatch } from "react-hook-form";
import { SelectField } from "@/components/ui/SelectField";
import { DEFAULT_PORTFOLIO, findEntity } from "@/constants/entidades";
import { useEntityCatalog } from "@/hooks/useEntityCatalog";

interface EntityFormValues {
  entidad: string;
  cartera: string;
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

  const catalogNames = Object.keys(useEntityCatalog());
  const entityNames = entidad && !catalogNames.includes(entidad) ? [...catalogNames, entidad] : catalogNames;
  const carteras = findEntity(entidad)?.carteras ?? [DEFAULT_PORTFOLIO];
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
          setValue("cartera", findEntity(event.target.value)?.carteras[0] ?? "");
        }}
      />
      <SelectField
        label="Cartera"
        options={carteras.map(toOption)}
        disabled={!entidad}
        error={errors.cartera?.message}
        {...register("cartera")}
      />
    </>
  );
}
