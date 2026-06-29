"use client";

import React, { useState, useRef } from "react";
import type { SheetData, Cell } from "../lib/types";

interface DataGridProps {
  sheet: SheetData;
  onCellChange: (row: number, col: number, value: Cell) => void;
  onPaste: (startRow: number, startCol: number, matrix: Cell[][]) => void;
}

// Convierte índice de columna a letra (0->A, 1->B, ... 26->AA)
function colLabel(i: number): string {
  let label = "";
  let n = i;
  do {
    label = String.fromCharCode(65 + (n % 26)) + label;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return label;
}

const DEFAULT_COL_WIDTH = 64; // Minitab "8.00" ≈ 64px
const MIN_COL_WIDTH = 32;

export default function DataGrid({
  sheet,
  onCellChange,
  onPaste,
}: DataGridProps) {
  const [active, setActive] = useState<{ r: number; c: number } | null>(null);
  const [colWidths, setColWidths] = useState<Record<number, number>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  // Resize state (kept in a ref so mousemove doesn't re-render every frame)
  const resizeRef = useRef<{ col: number; startX: number; startW: number } | null>(
    null
  );

  const numCols = sheet.reduce((max, row) => Math.max(max, row.length), 1);

  const widthOf = (c: number) => colWidths[c] ?? DEFAULT_COL_WIDTH;

  const startResize = (e: React.MouseEvent, col: number) => {
    e.preventDefault();
    e.stopPropagation();
    resizeRef.current = { col, startX: e.clientX, startW: widthOf(col) };

    const onMove = (ev: MouseEvent) => {
      const st = resizeRef.current;
      if (!st) return;
      const delta = ev.clientX - st.startX;
      const newW = Math.max(MIN_COL_WIDTH, st.startW + delta);
      setColWidths((prev) => ({ ...prev, [st.col]: newW }));
    };
    const onUp = () => {
      resizeRef.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  // Doble clic en el borde -> volver al ancho por defecto
  const resetWidth = (col: number) => {
    setColWidths((prev) => {
      const copy = { ...prev };
      delete copy[col];
      return copy;
    });
  };

  // Mover el foco con flechas / Enter / Tab
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    r: number,
    c: number
  ) => {
    let nr = r;
    let nc = c;
    if (e.key === "ArrowUp") nr = Math.max(0, r - 1);
    else if (e.key === "ArrowDown" || e.key === "Enter")
      nr = Math.min(sheet.length - 1, r + 1);
    else if (e.key === "ArrowLeft" && e.currentTarget.selectionStart === 0)
      nc = Math.max(0, c - 1);
    else if (e.key === "ArrowRight") nc = Math.min(numCols - 1, c + 1);
    else if (e.key === "Tab") {
      e.preventDefault();
      nc = e.shiftKey ? Math.max(0, c - 1) : Math.min(numCols - 1, c + 1);
    } else return;

    if (nr !== r || nc !== c) {
      e.preventDefault();
      const sel = `input[data-r="${nr}"][data-c="${nc}"]`;
      const el = containerRef.current?.querySelector<HTMLInputElement>(sel);
      el?.focus();
      el?.select();
      setActive({ r: nr, c: nc });
    }
  };

  // Pegar varias celdas (TSV del portapapeles)
  const handlePaste = (
    e: React.ClipboardEvent<HTMLInputElement>,
    r: number,
    c: number
  ) => {
    const text = e.clipboardData.getData("text");
    if (!text.includes("\t") && !text.includes("\n")) return; // celda simple
    e.preventDefault();
    const matrix: Cell[][] = text
      .replace(/\r/g, "")
      .split("\n")
      .filter((line, i, arr) => !(i === arr.length - 1 && line === ""))
      .map((line) =>
        line.split("\t").map((v) => {
          const num = parseFloat(v);
          return v !== "" && !Number.isNaN(num) && String(num) === v ? num : v;
        })
      );
    onPaste(r, c, matrix);
  };

  return (
    <div ref={containerRef} className="overflow-auto h-full w-full">
      <table className="border-collapse text-sm table-fixed">
        <thead className="sticky top-0 z-10">
          <tr>
            <th className="sticky left-0 z-20 bg-gray-200 border border-gray-300 w-12 h-7" />
            {Array.from({ length: numCols }).map((_, c) => (
              <th
                key={c}
                style={{ width: widthOf(c), minWidth: widthOf(c) }}
                className="relative bg-gray-200 border border-gray-300 px-2 h-7 font-semibold text-gray-700 select-none"
              >
                {colLabel(c)}
                {/* Resize handle */}
                <span
                  onMouseDown={(e) => startResize(e, c)}
                  onDoubleClick={() => resetWidth(c)}
                  className="absolute top-0 right-0 h-full w-1.5 cursor-col-resize hover:bg-[#00674d]/40"
                  title="Drag to resize · double-click to reset"
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sheet.map((row, r) => (
            <tr key={r}>
              <td className="sticky left-0 z-10 bg-gray-200 border border-gray-300 text-center text-gray-600 font-semibold w-12">
                {r + 1}
              </td>
              {Array.from({ length: numCols }).map((_, c) => {
                const isActive = active?.r === r && active?.c === c;
                return (
                  <td
                    key={c}
                    style={{ width: widthOf(c), minWidth: widthOf(c) }}
                    className={`border border-gray-300 p-0 ${
                      isActive ? "outline outline-2 outline-[#00674d]" : ""
                    }`}
                  >
                    <input
                      data-r={r}
                      data-c={c}
                      className="w-full h-7 px-2 outline-none bg-transparent focus:bg-emerald-50"
                      value={row[c] ?? ""}
                      onChange={(e) => onCellChange(r, c, e.target.value)}
                      onFocus={() => setActive({ r, c })}
                      onKeyDown={(e) => handleKeyDown(e, r, c)}
                      onPaste={(e) => handlePaste(e, r, c)}
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
