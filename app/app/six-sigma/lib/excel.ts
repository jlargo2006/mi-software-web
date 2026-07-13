import * as XLSX from "xlsx";
import type { WorkbookData, SheetData, Cell } from "./types";

/**
 * Convierte un texto de celda en número si procede, aceptando coma decimal.
 * "3,14" -> 3.14 · "1000" -> 1000 · "abc" -> "abc" · "" -> ""
 */
export function parseCellValue(v: string): Cell {
  const t = String(v).trim();
  if (t === "") return "";
  const normalized = t.replace(",", "."); // coma decimal -> punto
  // Solo lo tratamos como número si TODO el token es numérico
  if (/^-?\d*\.?\d+$/.test(normalized)) {
    const num = Number(normalized);
    if (!Number.isNaN(num)) return num;
  }
  return v; // texto tal cual
}

// Lee un File (xlsx/xls) y lo convierte a nuestro WorkbookData (Opción A)
export async function readExcelFile(
  file: File
): Promise<{ data: WorkbookData; order: string[] }> {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: "array" });

  const data: WorkbookData = {};
  const order: string[] = [];

  wb.SheetNames.forEach((name) => {
    const sheet = wb.Sheets[name];
    const aoa = XLSX.utils.sheet_to_json<(string | number)[]>(sheet, {
      header: 1,
      defval: "",
    });

    const headerRow = (aoa[0] ?? []) as (string | number)[];
    const headers = headerRow.map((h) => String(h ?? ""));

    const rows: Cell[][] = aoa.slice(1).map((row) =>
      (row ?? []).map((cell) =>
        typeof cell === "number" ? cell : parseCellValue(String(cell ?? ""))
      )
    );

    data[name] = { headers, rows };
    order.push(name);
  });

  return { data, order };
}

// Exporta nuestro WorkbookData a un archivo .xlsx descargable
export function writeExcelFile(
  data: WorkbookData,
  order: string[],
  filename = "six-sigma-export.xlsx"
): void {
  const wb = XLSX.utils.book_new();
  order.forEach((name) => {
    const sheet = data[name] ?? { headers: [], rows: [] };
    const aoa: Cell[][] = [sheet.headers, ...sheet.rows]; // reconstruye títulos + datos
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    XLSX.utils.book_append_sheet(wb, ws, name);
  });
  XLSX.writeFile(wb, filename);
}

// Crea una hoja vacía con dimensiones por defecto
export function createEmptySheet(rows = 50, cols = 10): SheetData {
  return {
    headers: Array.from({ length: cols }, () => ""),
    rows: Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => "" as Cell)
    ),
  };
}
