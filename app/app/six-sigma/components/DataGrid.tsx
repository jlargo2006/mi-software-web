"use client";

import React, { useState, useRef, useEffect } from "react";
import type { SheetData, Cell } from "../lib/types";
import { parseCellValue } from "../lib/excel";

interface DataGridProps {
  sheet: SheetData;
  onCellChange: (row: number, col: number, value: Cell) => void;
  onHeaderChange: (col: number, value: string) => void;
  onPaste: (startRow: number, startCol: number, matrix: Cell[][]) => void;
  onAddRow: () => void;
  selRows: Set<number>;
  selCols: Set<number>;
  setSelRows: (s: Set<number>) => void;
  setSelCols: (s: Set<number>) => void;
}

function colLabel(i: number): string {
  let label = "";
  let n = i;
  do {
    label = String.fromCharCode(65 + (n % 26)) + label;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return label;
}

const DEFAULT_COL_WIDTH = 64;
const MIN_COL_WIDTH = 32;
const FIXED_COLS = 26; // A … Z

type DragMode = "col" | "row" | null;
interface RangeSel { r1: number; c1: number; r2: number; c2: number; }

export default function DataGrid({
  sheet,
  onCellChange,
  onHeaderChange,
  onPaste,
  onAddRow,
  selRows,
  selCols,
  setSelRows,
  setSelCols,
}: DataGridProps) {
  const [active, setActive] = useState<{ r: number; c: number } | null>(null);
  const [colWidths, setColWidths] = useState<Record<number, number>>({});
  const [range, setRange] = useState<RangeSel | null>(null);

  const resizeRef = useRef<{ col: number; startX: number; startW: number } | null>(null);
  const dragRef = useRef<{ mode: DragMode; anchor: number } | null>(null);
  const anchorRef = useRef<{ r: number; c: number } | null>(null);
  const endRef = useRef<{ r: number; c: number } | null>(null);
  const selectingRef = useRef(false);

  const numCols = Math.max(
    FIXED_COLS,
    sheet.headers.length,
    sheet.rows.reduce((m, r) => Math.max(m, r.length), 0)
  );
  const numRows = sheet.rows.length;

  const widthOf = (c: number) => colWidths[c] ?? DEFAULT_COL_WIDTH;

  // ---------- Foco de celdas ----------
  const focusCell = (r: number, c: number) => {
    const el = document.getElementById(`dg-cell-${r}-${c}`) as HTMLInputElement | null;
    if (el) { el.foc
