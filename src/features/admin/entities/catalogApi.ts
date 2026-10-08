import { DEFAULT_PRODUCT, setEntityCatalog, type Entidad, type MetodoPago } from "@/constants/entidades";
import { fail, ok, type Result } from "@/lib/result";
import { supabase } from "@/lib/supabase";
import type { EntityDraft } from "./entityDraft";

interface MetodoPagoRow {
  producto: string;
  etiqueta: string;
  valor: string;
  orden: number;
}

interface EntidadRow {
  id: string;
  nombre: string;
  productos: string[];
  carteras: string[];
  metodos_pago: MetodoPagoRow[];
}

const LOAD_ERROR_MESSAGE = "No se pudo cargar el catálogo de entidades.";
export const SAVE_ENTITY_ERROR_MESSAGE = "No se pudo guardar la entidad. Revisá la conexión y tus permisos.";
export const DELETE_ENTITY_ERROR_MESSAGE = "No se pudo eliminar la entidad. Revisá la conexión y tus permisos.";

function toEntidad(row: EntidadRow): Entidad {
  const metodosPago: Record<string, MetodoPago[]> = {};
  const productos = row.productos.length > 0 ? row.productos : [DEFAULT_PRODUCT];
  for (const producto of productos) metodosPago[producto] = [];
  [...row.metodos_pago]
    .sort((a, b) => a.orden - b.orden)
    .forEach((metodo) => {
      const list = metodosPago[metodo.producto] ?? [];
      list.push({ etiqueta: metodo.etiqueta, valor: metodo.valor });
      metodosPago[metodo.producto] = list;
    });
  return { id: row.id, carteras: row.carteras, productos, metodosPago };
}

export async function refreshCatalog(): Promise<Result> {
  const { data, error } = await supabase
    .from("entidades")
    .select("id, nombre, productos, carteras, metodos_pago(producto, etiqueta, valor, orden)")
    .order("nombre", { ascending: true });
  if (error) return fail(LOAD_ERROR_MESSAGE);
  const rows = data as unknown as EntidadRow[];
  setEntityCatalog(Object.fromEntries(rows.map((row) => [row.nombre, toEntidad(row)])));
  return ok();
}

export async function saveEntity(draft: EntityDraft): Promise<Result<string>> {
  const metodos = draft.productos.flatMap((producto) =>
    (draft.metodos[producto] ?? []).map((metodo, orden) => ({
      producto,
      etiqueta: metodo.etiqueta.trim(),
      valor: metodo.valor.trim(),
      orden,
    })),
  );
  const { data, error } = await supabase.rpc("guardar_entidad", {
    p_id: draft.id ?? null,
    p_nombre: draft.nombre.trim(),
    p_productos: draft.productos,
    p_carteras: draft.carteras,
    p_metodos: metodos,
  });
  if (error) return fail(SAVE_ENTITY_ERROR_MESSAGE);
  await refreshCatalog();
  return ok(String(data));
}

export async function deleteEntity(id: string): Promise<Result> {
  const { error } = await supabase.from("entidades").delete().eq("id", id);
  if (error) return fail(DELETE_ENTITY_ERROR_MESSAGE);
  await refreshCatalog();
  return ok();
}
