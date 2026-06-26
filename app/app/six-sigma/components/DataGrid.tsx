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

export default function DataGrid({
  sheet,
  onCellChange,
  onPaste,
}: DataGridProps) {
  const [active, setActive] = useState<{ r: number; c: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const numCols = sheet.reduce((max, row) => Math.max(max, row.length), 1);

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
      <table className="border-collapse text-sm">
        <thead className="sticky top-0 z-10">
          <tr>
            <th className="sticky left-0 z-20 bg-gray-200 border border-gray-300 w-12 h-7" />
            {Array.from({ length: numCols }).map((_, c) => (
              <th
                key={c}
                className="bg-gray-200 border border-gray-300 px-2 h-7 min-w-[90px] font-semibold text-gray-700"
              >
                {colLabel(c)}
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
