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
    if (el) {
      el.focus();
      el.select();
    }
  };

  const focusCellWhenReady = (r: number, c: number, tries = 5) => {
    requestAnimationFrame(() => {
      const el = document.getElementById(`dg-cell-${r}-${c}`) as HTMLInputElement | null;
      if (el) {
        el.focus();
        el.select();
      } else if (tries > 0) {
        focusCellWhenReady(r, c, tries - 1);
      }
    });
  };

  // ---------- Selección de filas/columnas (cabeceras) ----------
  const clearSelection = () => {
    setSelCols(new Set());
    setSelRows(new Set());
  };

  const clearRange = () => {
    setRange(null);
    anchorRef.current = null;
    endRef.current = null;
  };

  const rangeSet = (a: number, b: number): Set<number> => {
    const lo = Math.min(a, b);
    const hi = Math.max(a, b);
    const s = new Set<number>();
    for (let i = lo; i <= hi; i++) s.add(i);
    return s;
  };

  const handleColHeaderMouseDown = (c: number, e: React.MouseEvent) => {
    e.preventDefault();
    setActive(null);
    clearRange();
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

  const handleRowHeaderMouseDown = (r: number, e: React.MouseEvent) => {
    e.preventDefault();
    setActive(null);
    clearRange();
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

  // ---------- Selección de RANGO de celdas con ratón ----------
  const applyRange = () => {
    const a = anchorRef.current;
    const b = endRef.current;
    if (!a || !b) return;
    setRange({
      r1: Math.min(a.r, b.r),
      c1: Math.min(a.c, b.c),
      r2: Math.max(a.r, b.r),
      c2: Math.max(a.c, b.c),
    });
  };

  const handleCellMouseDown = (r: number, c: number, e: React.MouseEvent) => {
    // Solo iniciamos selección de rango con arrastre; el clic simple deja editar
    clearSelection();
    if (e.shiftKey && anchorRef.current) {
      endRef.current = { r, c };
      applyRange();
      e.preventDefault();
      return;
    }
    anchorRef.current = { r, c };
    endRef.current = { r, c };
    selectingRef.current = true;
    setRange(null); // aún no hay rango hasta que arrastre
  };

  const handleCellMouseEnter = (r: number, c: number) => {
    if (selectingRef.current && anchorRef.current) {
      endRef.current = { r, c };
      applyRange();
      // Si el rango abarca más de una celda, saca el foco del input
      // para que Supr borre todo el rango (y no solo el texto de una celda).
      const a = anchorRef.current;
      if (a.r !== r || a.c !== c) {
        (document.activeElement as HTMLElement | null)?.blur();
      }
    }
  };

  // Fin de cualquier arrastre (selección de fila/col/rango)
  useEffect(() => {
    const up = () => {
      dragRef.current = null;
      selectingRef.current = false;
    };
    window.addEventListener("mouseup", up);
    return () => window.removeEventListener("mouseup", up);
  }, []);

  const inRange = (r: number, c: number): boolean =>
    !!range && r >= range.r1 && r <= range.r2 && c >= range.c1 && c <= range.c2;

  // ---------- Copiar (Ctrl+C) el rango / fila / columna seleccionados ----------
  const buildClipboardMatrix = (): string | null => {
    // Prioridad: rango de celdas > columnas > filas
    if (range) {
      const lines: string[] = [];
      for (let r = range.r1; r <= range.r2; r++) {
        const cells: string[] = [];
        for (let c = range.c1; c <= range.c2; c++) {
          const v = sheet.rows[r]?.[c] ?? "";
          cells.push(v === "" ? "" : String(v));
        }
        lines.push(cells.join("\t"));
      }
      return lines.join("\n");
    }
    if (selCols.size > 0) {
      const cols = [...selCols].sort((a, b) => a - b);
      const lines: string[] = [];
      // incluye títulos arriba
      lines.push(cols.map((c) => String(sheet.headers[c] ?? "")).join("\t"));
      for (let r = 0; r < numRows; r++) {
        lines.push(
          cols
            .map((c) => {
              const v = sheet.rows[r]?.[c] ?? "";
              return v === "" ? "" : String(v);
            })
            .join("\t")
        );
      }
      return lines.join("\n");
    }
    if (selRows.size > 0) {
      const rows = [...selRows].sort((a, b) => a - b);
      const lines = rows.map((r) =>
        (sheet.rows[r] ?? [])
          .map((v) => (v === "" ? "" : String(v)))
          .join("\t")
      );
      return lines.join("\n");
    }
    return null;
  };

  const handleGridCopy = (e: React.ClipboardEvent) => {
    const text = buildClipboardMatrix();
    if (text !== null) {
      e.preventDefault();
      e.clipboardData.setData("text/plain", text);
    }
  };

  // ---------- Borrar contenido (Supr / Delete) ----------
  const clearSelectedContent = () => {
    // Prioridad: rango de celdas > columnas > filas
    if (range) {
      for (let r = range.r1; r <= range.r2; r++) {
        for (let c = range.c1; c <= range.c2; c++) {
          onCellChange(r, c, "");
        }
      }
      return true;
    }
    if (selCols.size > 0) {
      for (const c of selCols) {
        for (let r = 0; r < numRows; r++) onCellChange(r, c, "");
      }
      return true;
    }
    if (selRows.size > 0) {
      for (const r of selRows) {
        for (let c = 0; c < numCols; c++) onCellChange(r, c, "");
      }
      return true;
    }
    return false;
  };

  // Captura Supr/Delete a nivel de contenedor cuando hay selección múltiple.
  const handleGridKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "Delete") return;
    // Solo actuamos si hay rango / columnas / filas seleccionadas.
    // (Si estás editando una sola celda, dejamos el Delete nativo del input.)
    if (range || selCols.size > 0 || selRows.size > 0) {
      // Evita borrar cuando el foco está dentro de una celda sin rango real
      const activeEl = document.activeElement as HTMLElement | null;
      const editingSingle =
        activeEl?.tagName === "INPUT" && !range && selCols.size === 0 && selRows.size === 0;
      if (editingSingle) return;
      e.preventDefault();
      clearSelectedContent();
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

  // ---------- Pegado ----------
  const textToMatrix = (text: string): string[][] =>
    text
      .replace(/\r/g, "")
      .split("\n")
      .filter((line, i, arr) => !(i === arr.length - 1 && line === ""))
      .map((line) => line.split("\t"));

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

  const handleHeaderPaste = (e: React.ClipboardEvent, c: number) => {
    const text = e.clipboardData.getData("text");
    if (!text) return;
    if (!text.includes("\t") && !text.includes("\n")) return;
    e.preventDefault();
    const matrix = textToMatrix(text);
    if (matrix.length === 0) return;
    matrix[0].forEach((h, dc) => onHeaderChange(c + dc, h.trim()));
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

    // Selección con Shift + cursores (para copiar luego)
    if (e.shiftKey && ["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"].includes(e.key)) {
      e.preventDefault();
      if (!anchorRef.current) anchorRef.current = { r, c };
      const cur = endRef.current ?? { r, c };
      let nr = cur.r;
      let nc = cur.c;
      if (e.key === "ArrowDown") nr = Math.min(numRows - 1, cur.r + 1);
      if (e.key === "ArrowUp") nr = Math.max(0, cur.r - 1);
      if (e.key === "ArrowLeft") nc = Math.max(0, cur.c - 1);
      if (e.key === "ArrowRight") nc = Math.min(numCols - 1, cur.c + 1);
      endRef.current = { r: nr, c: nc };
      applyRange();
      focusCell(nr, nc);
      return;
    }

    // Movimiento normal → limpia rango
    switch (e.key) {
      case "Enter":
      case "ArrowDown":
        e.preventDefault();
        clearRange();
        if (r + 1 >= numRows) {
          onAddRow();
          focusCellWhenReady(r + 1, c);
        } else focusCell(r + 1, c);
        break;
      case "ArrowUp":
        e.preventDefault();
        clearRange();
        if (r > 0) focusCell(r - 1, c);
        break;
      case "ArrowLeft":
        if (atStart && c > 0) {
          e.preventDefault();
          clearRange();
          focusCell(r, c - 1);
        }
        break;
      case "ArrowRight":
        if (atEnd && c < numCols - 1) {
          e.preventDefault();
          clearRange();
          focusCell(r, c + 1);
        }
        break;
      case "Tab":
        e.preventDefault();
        clearRange();
        if (e.shiftKey) {
          if (c > 0) focusCell(r, c - 1);
        } else if (c < numCols - 1) {
          focusCell(r, c + 1);
        }
        break;
    }
  };

  const handleHeaderKeyDown = (e: React.KeyboardEvent, c: number) => {
    if (e.key === "Enter" || e.key === "ArrowDown") {
      e.preventDefault();
      if (numRows === 0) {
        onAddRow();
        focusCellWhenReady(0, c);
      } else focusCell(0, c);
    }
  };

  const displayCell = (v: Cell): string => (v === "" ? "" : String(v));

  return (
    <div className="overflow-auto h-full" onCopy={handleGridCopy} onKeyDown={handleGridKeyDown} tabIndex={0}>
      <table className="border-collapse select-none" style={{ tableLayout: "fixed" }}>
        <thead>
          {/* Letras de columna (A..Z) */}
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

          {/* Fila de TÍTULOS */}
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
                const highlighted =
                  selCols.has(c) || selRows.has(r) || inRange(r, c);
                return (
                  <td
                    key={c}
                    onMouseDown={(e) => handleCellMouseDown(r, c, e)}
                    onMouseEnter={() => handleCellMouseEnter(r, c)}
                    className={`border border-gray-200 p-0 ${
                      highlighted ? "bg-emerald-50" : "bg-white"
                    }`}
                    style={{ width: widthOf(c), minWidth: widthOf(c) }}
                  >
                    <input
                      id={`dg-cell-${r}-${c}`}
                      value={displayCell(sheet.rows[r]?.[c] ?? "")}
                      onFocus={() => setActive({ r, c })}
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





    
