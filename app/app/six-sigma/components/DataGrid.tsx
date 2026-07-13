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
  const dragRef = useRef<{ mode: DragMode; anchor: number } | null>(null);

  const numCols = Math.max(
    sheet.headers.length,
    sheet.rows.reduce((m, r) => Math.max(m, r.length), 0),
    MIN_COLS
  );
  const numRows = sheet.rows.length;

  const widthOf = (c: number) => colWidths[c] ?? DEFAULT_COL_WIDTH;

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

  // ---------- Selección de columna (clic en cabecera de letra) ----------
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
    if (dragRef.current?.mode === "col") {
      setSelCols(rangeSet(dragRef.current.anchor, c));
    }
  };

  // ---------- Selección de fila (clic en número de fila) ----------
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
    if (dragRef.current?.mode === "row") {
      setSelRows(rangeSet(dragRef.current.anchor, r));
    }
  };

  // Fin del arrastre de selección
  React.useEffect(() => {
    const up = () => {
      if (dragRef.current) dragRef.current = null;
    };
    window.addEventListener("mouseup", up);
    return () => window.removeEventListener("mouseup", up);
  }, []);

  // ---------- Borrado con tecla Supr cuando hay filas/cols seleccionadas ----------
  const handleGridKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === "Delete" || e.key === "Backspace") && !active) {
      if (selCols.size > 0) {
        onDeleteColumns([...selCols]);
        clearSelection();
        e.preventDefault();
      } else if (selRows.size > 0) {
        onDeleteRows([...selRows]);
        clearSelection();
        e.preventDefault();
      }
    }
  };

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

  // ---------- Pegado (coma -> punto) ----------
  const handlePaste = (e: React.ClipboardEvent, r: number, c: number) => {
    const text = e.clipboardData.getData("text");
    if (!text) return;
    // Solo interceptamos si hay tabuladores o saltos (pegado tipo tabla)
    if (text.includes("\t") || text.includes("\n")) {
      e.preventDefault();
      const matrix: Cell[][] = text
        .replace(/\r/g, "")
        .split("\n")
        .filter((line, i, arr) => !(i === arr.length - 1 && line === ""))
        .map((line) => line.split("\t").map((v) => parseCellValue(v)));
      onPaste(r, c, matrix);
    }
  };

  const displayCell = (v: Cell): string => (v === "" ? "" : String(v));

  return (
    <div
      ref={containerRef}
      className="overflow-auto h-full outline-none"
      tabIndex={0}
      onKeyDown={handleGridKeyDown}
    >
      {/* Barra de acciones para selección */}
      {(selCols.size > 0 || selRows.size > 0) && (
        <div className="sticky top-0 z-30 flex items-center gap-2 bg-emerald-50 border-b border-emerald-200 px-3 py-1 text-xs">
          <span className="text-emerald-800">
            {selCols.size > 0
              ? `${selCols.size} columna(s) seleccionada(s)`
              : `${selRows.size} fila(s) seleccionada(s)`}
          </span>
          <button
            onClick={() => {
              if (selCols.size > 0) onDeleteColumns([...selCols]);
              else onDeleteRows([...selRows]);
              clearSelection();
            }}
            className="rounded bg-red-500 px-2 py-0.5 text-white hover:bg-red-600"
          >
            🗑 Borrar
          </button>
          <button
            onClick={clearSelection}
            className="rounded border border-gray-300 px-2 py-0.5 text-gray-600 hover:bg-white"
          >
            Cancelar
          </button>
        </div>
      )}

      <table className="border-collapse select-none" style={{ tableLayout: "fixed" }}>
        <thead>
          {/* Fila de letras de columna (A, B, C...) — clic para seleccionar columna */}
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
                {/* Tirador de redimensión */}
                <span
                  onMouseDown={(e) => startResize(c, e)}
                  className="absolute top-0 right-0 h-full w-1 cursor-col-resize hover:bg-emerald-400"
                />
              </th>
            ))}
          </tr>

          {/* Fila de TÍTULOS (editable, color distinto — estilo Minitab) */}
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
                const inSelCol = selCols.has(c);
                const inSelRow = selRows.has(r);
                return (
                  <td
                    key={c}
                    className={`border border-gray-200 p-0 ${
                      inSelCol || inSelRow ? "bg-emerald-50" : "bg-white"
                    }`}
                    style={{ width: widthOf(c), minWidth: widthOf(c) }}
                  >
                    <input
                      value={displayCell(sheet.rows[r]?.[c] ?? "")}
                      onFocus={() => {
                        setActive({ r, c });
                        clearSelection();
                      }}
                      onBlur={() => setActive(null)}
                      onChange={(e) =>
                        onCellChange(r, c, e.target.value)
                      }
                      onPaste={(e) => handlePaste(e, r, c)}
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




    
