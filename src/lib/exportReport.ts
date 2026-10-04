import { todayIso } from "./dates";
import type { InstallmentRow } from "./stats";

export type ReportKind = "pagos" | "proyeccion";

const HEADERS = ["DNI", "CARTERA", "MONTO", "FECHA DE PAGO", "OPERADOR"];
const OPERATOR = "44bis5";
const MISSING_VALUE = "Sin info";
const REVOKE_DELAY_MS = 1000;
const AMOUNT_FORMAT = "#,##0.00";
const XLSX_MIME_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export function reportFileName(kind: ReportKind, today: string = todayIso()): string {
  const [, month = "", day = ""] = today.split("-");
  return `${kind}_${Number(day)}.${Number(month)}_${OPERATOR}.xlsx`;
}

function formatFullDate(iso: string): string {
  const [year = "", month = "", day = ""] = iso.split("-");
  return `${day}/${month}/${year}`;
}

export async function downloadReport(kind: ReportKind, rows: InstallmentRow[]): Promise<void> {
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
  const bytes: ArrayBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });

  const url = URL.createObjectURL(new Blob([bytes], { type: XLSX_MIME_TYPE }));
  const link = document.createElement("a");
  link.href = url;
  link.download = reportFileName(kind);
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), REVOKE_DELAY_MS);
}
