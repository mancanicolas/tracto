import { todayIso } from "./dates";
import { fail, type Result } from "./result";
import { SAVE_ERROR_MESSAGE, saveBytesWithDialog, type SaveOutcome } from "./saveFile";
import type { InstallmentRow } from "./stats";

export type ReportKind = "pagos" | "proyeccion";

const HEADERS = ["DNI", "CARTERA", "MONTO", "FECHA DE PAGO", "OPERADOR"];
const OPERATOR = "44bis5";
const MISSING_VALUE = "Sin info";
const AMOUNT_FORMAT = "#,##0.00";

export function reportFileName(kind: ReportKind, today: string = todayIso()): string {
  const [, month = "", day = ""] = today.split("-");
  return `${kind}_${Number(day)}.${Number(month)}_${OPERATOR}.xlsx`;
}

function formatFullDate(iso: string): string {
  const [year = "", month = "", day = ""] = iso.split("-");
  return `${day}/${month}/${year}`;
}

export async function buildReportBytes(kind: ReportKind, rows: InstallmentRow[]): Promise<Uint8Array> {
  const XLSX = await import("xlsx");
  const data = [
    HEADERS,
    ...rows.map((row) => [
      row.dni,
      row.entidad ?? MISSING_VALUE,
      row.monto / 100,
      formatFullDate(row.fecha),
      OPERATOR,
    ]),
  ];
  const sheet = XLSX.utils.aoa_to_sheet(data);
  rows.forEach((_, index) => {
    const cell = sheet[XLSX.utils.encode_cell({ r: index + 1, c: 2 })];
    if (cell) cell.z = AMOUNT_FORMAT;
  });
  sheet["!cols"] = [{ wch: 12 }, { wch: 22 }, { wch: 16 }, { wch: 16 }, { wch: 12 }];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, kind === "pagos" ? "Pagos" : "Proyeccion");
  const buffer: ArrayBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  return new Uint8Array(buffer);
}

export async function downloadReport(kind: ReportKind, rows: InstallmentRow[]): Promise<Result<SaveOutcome>> {
  let bytes: Uint8Array;
  try {
    bytes = await buildReportBytes(kind, rows);
  } catch {
    return fail(SAVE_ERROR_MESSAGE);
  }
  return saveBytesWithDialog({
    defaultName: reportFileName(kind),
    filterName: "Excel",
    extension: "xlsx",
    bytes,
  });
}
