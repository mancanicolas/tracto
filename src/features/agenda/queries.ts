import type { Label } from "@/lib/labels";
import { fail, ok, type Result } from "@/lib/result";
import { supabase } from "@/lib/supabase";
import type { Case } from "@/lib/types";
import { toCase, toLabel, type CasoRow, type EtiquetaRow } from "./mappers";

const PAGE_SIZE = 1000;
const LOAD_ERROR_MESSAGE = "No se pudieron cargar los casos. Revisá la conexión y probá de nuevo.";

const CASE_COLUMNS =
  "*, caso_etiquetas(etiqueta_id), notas(id, texto, creada, origen), agenda(fecha, motivo, resuelto, hora), acuerdos(id, creado, producto, tipo, cuotas(*))";

export interface AgendaData {
  cases: Case[];
  labels: Label[];
}

async function fetchAllCases(): Promise<CasoRow[] | null> {
  const rows: CasoRow[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("casos")
      .select(CASE_COLUMNS)
      .order("created_at", { ascending: false })
      .range(from, from + PAGE_SIZE - 1);
    if (error) return null;
    const page = data as unknown as CasoRow[];
    rows.push(...page);
    if (page.length < PAGE_SIZE) return rows;
  }
}

export async function fetchAgendaData(): Promise<Result<AgendaData>> {
  const [caseRows, labelsResponse] = await Promise.all([
    fetchAllCases(),
    supabase.from("etiquetas").select("id, nombre, color").order("created_at", { ascending: true }),
  ]);
  if (caseRows === null || labelsResponse.error) return fail(LOAD_ERROR_MESSAGE);
  return ok({
    cases: caseRows.map(toCase),
    labels: (labelsResponse.data as unknown as EtiquetaRow[]).map(toLabel),
  });
}
