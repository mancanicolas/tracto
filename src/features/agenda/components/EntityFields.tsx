import { useFormContext, useWatch } from "react-hook-form";
import { SelectField } from "@/components/ui/SelectField";
import { DEFAULT_PORTFOLIO, ENTIDAD_NAMES, findEntity } from "@/constants/entidades";

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

  const entityNames = entidad && !ENTIDAD_NAMES.includes(entidad) ? [...ENTIDAD_NAMES, entidad] : ENTIDAD_NAMES;
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
