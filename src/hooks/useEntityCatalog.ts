import { useSyncExternalStore } from "react";
import { getEntityCatalog, subscribeEntityCatalog, type Entidad } from "@/constants/entidades";

export function useEntityCatalog(): Record<string, Entidad> {
  return useSyncExternalStore(subscribeEntityCatalog, getEntityCatalog);
}
