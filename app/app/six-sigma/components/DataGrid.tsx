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
  // Selección elevada al padre (para borrar desde la barra inferior)
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
  const [pendingFocus, setPendingFocus] = useState<{ r: number; c: number } | null>(null);

  const resizeRef = useRef<{ col: number; startX: number; startW: number } | null>(null);
  const dragRef = useRef<{ mode: DragMode; anchor: number } | null>(null);

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
    if (el) {
      el.focus();
      el.select();
    }
  };

  // Enfoca una celda que quizá aún no existía (tras crear fila)
  useEffect(() => {
    if (pendingFocus) {
      focusCell(pendingFocus.r, pendingFocus.c);
      setPendingFocus(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingFocus, numRows]);

  // ---------- Selección helpers ----------
  const clearSelection = () => {
    setSelCols(new Set());
    setSelRows(new Set());
  };

  const rangeSet = (a: number, b: number): Set<number> => {
    const lo = Math.min(a, b);
    const hi = Math.max(a, b);
    const s = new Set<number>();
    for (let i = lo; i <= hi; i++) s.add(i);
    return s;
  };

  // Selección de columna
  const handleColHeaderMouseDown = (c: number, e: React.MouseEvent) => {
    e.preventDefault();
    setActive(null);
    setSelRows(new Set());
    if (e.shiftKey && dragRef.current?.mode === "col") {
      setSelCols(rangeSet(dragRef.current.anchor, c));
      return;
    }
    dragRef.current = { mode: "col", anchor: c };
    setSelCols(new Set([c]));
  };
  const handleColHeaderMouseEnter = (c: number) => {
    if (dragRef.current?.mode === "col") setSelCols(rangeSet(dragRef.current.anchor, c));
  };

  // Selección de fila
  const handleRowHeaderMouseDown = (r: number, e: React.MouseEvent) => {
    e.preventDefault();
    setActive(null);
    setSelCols(new Set());
    if (e.shiftKey && dragRef.current?.mode === "row") {
      setSelRows(rangeSet(dragRef.current.anchor, r));
      return;
    }
    dragRef.current = { mode: "row", anchor: r };
    setSelRows(new Set([r]));
  };
  const handleRowHeaderMouseEnter = (r: number) => {
    if (dragRef.current?.mode === "row") setSelRows(rangeSet(dragRef.current.anchor, r));
  };

  useEffect(() => {
    const up = () => {
      if (dragRef.current) dragRef.current = null;
    };
    window.addEventListener("mouseup", up);
    return () => window.removeEventListener("mouseup", up);
  }, []);

  // ---------- Redimensionar columnas ----------
  const startResize = (col: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    resizeRef.current = { col, startX: e.clientX, startW: widthOf(col) };
    window.addEventListener("mousemove", onResizeMove);
    window.addEventListener("mouseup", stopResize);
  };
  const onResizeMove = (e: MouseEvent) => {
    if (!resizeRef.current) return;
    const { col, startX, startW } = resizeRef.current;
    const w = Math.max(MIN_COL_WIDTH, startW + (e.clientX - startX));
    setColWidths((prev) => ({ ...prev, [col]: w }));
  };
  const stopResize = () => {
    resizeRef.current = null;
    window.removeEventListener("mousemove", onResizeMove);
    window.removeEventListener("mouseup", stopResize);
  };

  // ---------- Parseo de texto pegado a matriz ----------
  const textToMatrix = (text: string): string[][] =>
    text
      .replace(/\r/g, "")
      .split("\n")
      .filter((line, i, arr) => !(i === arr.length - 1 && line === ""))
      .map((line) => line.split("\t"));

  // Pegado en una celda de DATOS
  const handleCellPaste = (e: React.ClipboardEvent, r: number, c: number) => {
    const text = e.clipboardData.getData("text");
    if (!text) return;
    if (text.includes("\t") || text.includes("\n")) {
      e.preventDefault();
      const matrix: Cell[][] = textToMatrix(text).map((row) =>
        row.map((v) => parseCellValue(v))
      );
      onPaste(r, c, matrix);
    }
  };

  // Pegado en la CABECERA: 1ª fila = títulos, resto = datos debajo
  const handleHeaderPaste = (e: React.ClipboardEvent, c: number) => {
    const text = e.clipboardData.getData("text");
    if (!text) return;
    if (!text.includes("\t") && !text.includes("\n")) return; // valor simple: comportamiento normal
    e.preventDefault();
    const matrix = textToMatrix(text);
    if (matrix.length === 0) return;
    // Primera fila → títulos
    matrix[0].forEach((h, dc) => onHeaderChange(c + dc, h.trim()));
    // Resto → datos a partir de la fila 0
    const dataMatrix: Cell[][] = matrix
      .slice(1)
      .map((row) => row.map((v) => parseCellValue(v)));
    if (dataMatrix.length > 0) onPaste(0, c, dataMatrix);
  };

  // ---------- Teclado en celdas ----------
  const handleCellKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, r: number, c: number) => {
    const input = e.currentTarget;
    const atStart = input.selectionStart === 0 && input.selectionEnd === 0;
    const atEnd =
      input.selectionStart === input.value.length &&
      input.selectionEnd === input.value.length;

    switch (e.key) {
      case "Enter":
      case "ArrowDown":
        e.preventDefault();
        if (r + 1 >= numRows) {
          onAddRow();
          setPendingFocus({ r: r + 1, c });
        } else focusCell(r + 1, c);
        break;
      case "ArrowUp":
        e.preventDefault();
        if (r > 0) focusCell(r - 1, c);
        break;
      case "ArrowLeft":
        if (atStart && c > 0) {
          e.preventDefault();
          focusCell(r, c - 1);
        }
        break;
      case "ArrowRight":
        if (atEnd && c < numCols - 1) {
          e.preventDefault();
          focusCell(r, c + 1);
        }
        break;
      case "Tab":
        e.preventDefault();
        if (e.shiftKey) {
          if (c > 0) focusCell(r, c - 1);
        } else if (c < numCols - 1) {
          focusCell(r, c + 1);
        }
        break;
    }
  };

  // Enter en la cabecera → baja a la primera fila de datos
  const handleHeaderKeyDown = (e: React.KeyboardEvent, c: number) => {
    if (e.key === "Enter" || e.key === "ArrowDown") {
      e.preventDefault();
      if (numRows === 0) {
        onAddRow();
        setPendingFocus({ r: 0, c });
      } else focusCell(0, c);
    }
  };

  const displayCell = (v: Cell): string => (v === "" ? "" : String(v));

  return (
    <div className="overflow-auto h-full">
      <table className="border-collapse select-none" style={{ tableLayout: "fixed" }}>
        <thead>
          {/* Letras de columna (A..Z) — clic para seleccionar columna */}
          <tr>
            <th className="sticky top-0 left-0 z-20 w-12 min-w-12 bg-gray-200 border border-gray-300" />
            {Array.from({ length: numCols }, (_, c) => (
              <th
                key={c}
                onMouseDown={(e) => handleColHeaderMouseDown(c, e)}
                onMouseEnter={() => handleColHeaderMouseEnter(c)}
                className={`sticky top-0 z-10 border border-gray-300 text-xs font-semibold text-gray-600 cursor-pointer relative ${
                  selCols.has(c) ? "bg-emerald-200" : "bg-gray-100 hover:bg-gray-200"
                }`}
                style={{ width: widthOf(c), minWidth: widthOf(c) }}
              >
                {colLabel(c)}
                <span
                  onMouseDown={(e) => startResize(c, e)}
                  className="absolute top-0 right-0 h-full w-1 cursor-col-resize hover:bg-emerald-400"
                />
              </th>
            ))}
          </tr>

          {/* Fila de TÍTULOS (editable, verde Ford) */}
          <tr>
            <th className="sticky left-0 z-10 w-12 min-w-12 bg-[#00674d] border border-[#00513d] text-[10px] text-white">
              ↓
            </th>
            {Array.from({ length: numCols }, (_, c) => (
              <td
                key={c}
                className={`border border-[#00513d] p-0 ${
                  selCols.has(c) ? "bg-emerald-100" : "bg-[#e6f2ee]"
                }`}
                style={{ width: widthOf(c), minWidth: widthOf(c) }}
              >
                <input
                  value={sheet.headers[c] ?? ""}
                  onChange={(e) => onHeaderChange(c, e.target.value)}
                  onPaste={(e) => handleHeaderPaste(e, c)}
                  onKeyDown={(e) => handleHeaderKeyDown(e, c)}
                  placeholder={colLabel(c)}
                  className="w-full bg-transparent px-1 py-0.5 text-xs font-semibold text-[#00513d] placeholder-[#8bbcab] outline-none"
                />
              </td>
            ))}
          </tr>
        </thead>

        <tbody>
          {Array.from({ length: numRows }, (_, r) => (
            <tr key={r}>
              {/* Número de fila (empieza en 1) — clic para seleccionar fila */}
              <td
                onMouseDown={(e) => handleRowHeaderMouseDown(r, e)}
                onMouseEnter={() => handleRowHeaderMouseEnter(r)}
                className={`sticky left-0 z-10 w-12 min-w-12 border border-gray-300 text-center text-xs text-gray-600 cursor-pointer ${
                  selRows.has(r) ? "bg-emerald-200" : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                {r + 1}
              </td>

              {Array.from({ length: numCols }, (_, c) => {
                const isActive = active?.r === r && active?.c === c;
                const inSel = selCols.has(c) || selRows.has(r);
                return (
                  <td
                    key={c}
                    className={`border border-gray-200 p-0 ${
                      inSel ? "bg-emerald-50" : "bg-white"
                    }`}
                    style={{ width: widthOf(c), minWidth: widthOf(c) }}
                  >
                    <input
                      id={`dg-cell-${r}-${c}`}
                      value={displayCell(sheet.rows[r]?.[c] ?? "")}
                      onFocus={() => {
                        setActive({ r, c });
                        clearSelection();
                      }}
                      onBlur={() => setActive(null)}
                      onChange={(e) => onCellChange(r, c, e.target.value)}
                      onPaste={(e) => handleCellPaste(e, r, c)}
                      onKeyDown={(e) => handleCellKeyDown(e, r, c)}
                      className={`w-full px-1 py-0.5 text-xs text-gray-800 outline-none bg-transparent ${
                        isActive ? "ring-2 ring-[#00674d] ring-inset" : ""
                      }`}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}



                  
