import { useFormContext, useWatch } from "react-hook-form";
import { SelectField } from "@/components/ui/SelectField";
import { useEntityCatalog } from "@/hooks/useEntityCatalog";

interface EntityFormValues {
  entidad: string;
}

const toOption = (value: string) => ({ value, label: value });

export function EntityFields() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<EntityFormValues>();
  const entidad = useWatch({ control, name: "entidad" });

  const catalogNames = Object.keys(useEntityCatalog());
  const entityNames = entidad && !catalogNames.includes(entidad) ? [...catalogNames, entidad] : catalogNames;
  return (
    <SelectField
      label="Entidad"
      placeholder="Elegí la entidad"
      options={entityNames.map(toOption)}
      error={errors.entidad?.message}
      {...register("entidad")}
    />
  );
}
