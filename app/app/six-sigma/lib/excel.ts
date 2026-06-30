import * as XLSX from "xlsx";
import type { WorkbookData, SheetData } from "./types";

// Lee un File (xlsx/xls) y lo convierte a nuestro WorkbookData
export async function readExcelFile(
  file: File
): Promise<{ data: WorkbookData; order: string[] }> {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: "array" });

  const data: WorkbookData = {};
  const order: string[] = [];

  wb.SheetNames.forEach((name) => {
    const sheet = wb.Sheets[name];
    const rows = XLSX.utils.sheet_to_json<(string | number)[]>(sheet, {
      header: 1,
      defval: "",
    });
    data[name] = rows as SheetData;
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
    const ws = XLSX.utils.aoa_to_sheet(data[name] ?? []);
    XLSX.utils.book_append_sheet(wb, ws, name);
  });
  XLSX.writeFile(wb, filename);
}

// Crea una hoja vacía con dimensiones por defecto
export function createEmptySheet(rows = 50, cols = 10): SheetData {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => "" as string | number)
  );
}
