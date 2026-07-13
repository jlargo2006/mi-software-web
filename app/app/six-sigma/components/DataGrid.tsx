"use client";

import React, { useState, useRef } from "react";
import type { SheetData, Cell } from "../lib/types";
import { parseCellValue } from "../lib/excel";

interface DataGridProps {
  sheet: SheetData;
  onCellChange: (row: number, col: number, value: Cell) => void;
  onHeaderChange: (col: number, value: string) => void;
  onPaste: (startRow: number, startCol: number, matrix: Cell[][]) => void;
  onDeleteRows: (rows: number[]) => void;
  onDeleteColumns: (cols: number[]) => void;
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
const MIN_COLS = 26;

type DragMode = "col" | "row" | null;

export default function DataGrid({
  sheet,
  onCellChange,
  onHeaderChange,
  onPaste,
  onDeleteRows,
  onDeleteColumns,
}: DataGridProps) {
  const [active, setActive] = useState<{ r: number; c: number } | null>(null);
  const [colWidths, setColWidths] = useState<Record<number, number>>({});
  const [selCols, setSelCols] = useState<Set<number>>(new Set());
  const [selRows, setSelRows] = useState<Set<number>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  const resizeRef = useRef<{ col: number; startX: number; startW: number } | null>(null);
  const dragRef = useRef<{ mode: DragMode; anchor: number } | null>(
