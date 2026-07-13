import type { SheetData } from "./types";
import { toNumericColumn } from "./stats";

export interface ColumnInfo {
  index: number;
  name: string;      // header label (or "Column A" if empty)
  letter: string;    // A, B, C...
}

function colLetter(i: number): string {
  let label = "";
  let n = i;
  do {
    label = String.fromCharCode(65 + (n % 26)) + label;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return label;
}

// Nº de columnas de la hoja (máximo entre headers y filas de datos)
function sheetColCount(sheet: SheetData): number {
  const fromRows = sheet.rows.reduce((max, row) => Math.max(max, row.length), 0);
  return Math.max(sheet.headers.length, fromRows);
}

// List all columns of a sheet, using the headers row as titles
export function getColumns(sheet: SheetData): ColumnInfo[] {
  const numCols = sheetColCount(sheet);
  const cols: ColumnInfo[] = [];
  for (let i = 0; i < numCols; i++) {
    const header = String(sheet.headers[i] ?? "").trim();
    cols.push({
      index: i,
      letter: colLetter(i),
      name: header || `Column ${colLetter(i)}`,
    });
  }
  return cols;
}

// Get numeric values of a column (rows already exclude the header)
export function getColumnValues(sheet: SheetData, colIndex: number): number[] {
  const raw = sheet.rows.map((row) => row[colIndex] ?? "");
  return toNumericColumn(raw);
}

// Compara dos series numéricas (mismo orden y valores)
export function sameData(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (Math.abs(a[i] - b[i]) > 1e-9) return false;
  }
  return true;
}
