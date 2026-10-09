import { DEFAULT_PORTFOLIO, DEFAULT_PRODUCT, foldName, type Entidad } from "@/constants/entidades";

export interface DraftMethod {
  key: string;
  etiqueta: string;
  valor: string;
}

export interface EntityDraft {
  id?: string;
  nombre: string;
  productos: string[];
  carteras: string[];
  metodos: Record<string, DraftMethod[]>;
}

export function newDraftMethod(etiqueta = "", valor = ""): DraftMethod {
  return { key: crypto.randomUUID(), etiqueta, valor };
}

export function createEmptyDraft(): EntityDraft {
  return {
    nombre: "",
    productos: [DEFAULT_PRODUCT],
    carteras: [DEFAULT_PORTFOLIO],
    metodos: { [DEFAULT_PRODUCT]: [] },
  };
}

export function toDraft(nombre: string, entity: Entidad): EntityDraft {
  const metodos: Record<string, DraftMethod[]> = {};
  for (const producto of entity.productos) {
    metodos[producto] = (entity.metodosPago[producto] ?? []).map((metodo) =>
      newDraftMethod(metodo.etiqueta, metodo.valor),
    );
  }
  return { id: entity.id, nombre, productos: [...entity.productos], carteras: [...entity.carteras], metodos };
}

export function serializeDraft(draft: EntityDraft): string {
  return JSON.stringify({
    nombre: draft.nombre,
    productos: draft.productos,
    carteras: draft.carteras,
    metodos: draft.productos.map((producto) =>
      (draft.metodos[producto] ?? []).map(({ etiqueta, valor }) => [etiqueta, valor]),
    ),
  });
}

export function validateDraft(draft: EntityDraft, existingNames: string[]): string | null {
  const name = draft.nombre.trim();
  if (!name) return "Ingresá el nombre de la entidad.";
  const isDuplicate = !draft.id && existingNames.some((existing) => foldName(existing) === foldName(name));
  if (isDuplicate) return "Ya existe una entidad con ese nombre.";
  if (draft.productos.length === 0) return "La entidad necesita al menos un producto.";
  const hasIncomplete = draft.productos.some((producto) =>
    (draft.metodos[producto] ?? []).some((metodo) => !metodo.etiqueta.trim() || !metodo.valor.trim()),
  );
  if (hasIncomplete) return "Completá la etiqueta y el valor de cada medio de pago, o quitá las filas vacías.";
  return null;
}
