import type { SheetData } from "./types";
import { toNumericColumn } from "./stats";
import type { Cell } from "./types";

export interface ColumnInfo {
  index: number;
  name: string;      // header label (or "Column A" if empty)
  letter: string;    // A, B, C...
  values: Cell[];    // NEW: raw cell values (for cause/cell pickers)
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

function sheetColCount(sheet: SheetData): number {
  const fromRows = sheet.rows.reduce((max, row) => Math.max(max, row.length), 0);
  return Math.max(sheet.headers.length, fromRows);
}

export function getColumns(sheet: SheetData): ColumnInfo[] {
  const numCols = sheetColCount(sheet);
  const cols: ColumnInfo[] = [];
  for (let i = 0; i < numCols; i++) {
    const header = String(sheet.headers[i] ?? "").trim();
    cols.push({
      index: i,
      letter: colLetter(i),
      name: header || `Column ${colLetter(i)}`,
      values: sheet.rows.map((row) => row[i] ?? ""), // NEW
    });
  }
  return cols;
}

export function getColumnValues(sheet: SheetData, colIndex: number): number[] {
  const raw = sheet.rows.map((row) => row[colIndex] ?? "");
  return toNumericColumn(raw);
}

export function getColumnByName(sheet: SheetData, name: string): number[] {
  const found = getColumns(sheet).find((c) => c.name === name);
  return found ? getColumnValues(sheet, found.index) : [];
}

export function sameData(a: Cell[], b: Cell[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((v, i) => String(v ?? "") === String(b[i] ?? ""));
}

export function cleanNumeric(raw: unknown[]): number[] {
  return raw
    .filter((v) => v !== null && v !== undefined && String(v).trim() !== "")
    .map((v) => Number(v))
    .filter((v) => Number.isFinite(v));
}
