// app/app/six-sigma/components/SortDialog.tsx
"use client";

import React, { useState } from "react";
import type { SheetData } from "../lib/types";
import { useDraggable } from "../hooks/useDraggable";

function colLabel(i: number): string {
  let label = "";
  let n = i;
  do {
    label = String.fromCharCode(65 + (n % 26)) + label;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return label;
}

const NUM_COLS = 26;

interface Props {
  sheet: SheetData;
  /** Columna preseleccionada: la que estuviera marcada en la rejilla. */
  initialCol?: number;
  onSort: (col: number, dir: "asc" | "desc") => void;
  onClose: () => void;
}

/**
 * Ordenar filas por una columna.
 *
 * Vive en un dialogo y no en la cabecera de la rejilla a proposito: meter
 * controles dentro del <th> interferia con el redimensionado de columnas.
 */
export default function SortDialog({ sheet, initialCol = 0, onSort, onClose }: Props) {
  const [col, setCol] = useState(initialCol);
  const [dir, setDir] = useState<"asc" | "desc">("asc");
  const { boxRef, style, onMouseDown } = useDraggable();


  const apply = () => {
    onSort(col, dir);
    onClose();
  };

  return (
    /* Ventana flotante, no modal: sin velo y sin cierre al pulsar fuera, para
       poder consultar la rejilla mientras esta abierta. */
    <div
      ref={boxRef}
      style={style}
      className="fixed z-[100] w-[26rem] rounded-lg border border-gray-300 bg-white shadow-2xl"
      onKeyDown={(e) => {
        if (e.key === "Enter") apply();
        if (e.key === "Escape") onClose();
      }}
    >
      <div
        onMouseDown={onMouseDown}
        className="flex cursor-move select-none items-center justify-between rounded-t-lg border-b border-gray-200 bg-gray-50 px-5 py-3"
      >
        <h2 className="text-sm font-semibold text-[#00513d]">Ordenar filas</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-700"
          aria-label="Cerrar"
        >
          {"\u2715"}
        </button>
      </div>

      <div className="space-y-4 px-5 py-4">
        <div className="flex items-center gap-3">
          <label className="w-24 shrink-0 text-xs font-medium text-gray-600">
            Columna
          </label>
          <select
            value={col}
            onChange={(e) => setCol(Number(e.target.value))}
            autoFocus
            className="flex-1 rounded border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-[#00674d]"
          >
            {Array.from({ length: NUM_COLS }, (_, c) => (
              <option key={c} value={c}>
                {colLabel(c)}
                {sheet.headers[c] ? ` \u2014 ${sheet.headers[c]}` : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <span className="w-24 shrink-0 text-xs font-medium text-gray-600">
            Sentido
          </span>
          <div className="flex gap-2">
            {(["asc", "desc"] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDir(d)}
                className={`rounded border px-3 py-1.5 text-sm ${
                  dir === d
                    ? "border-[#00674d] bg-[#e6f2ee] text-[#00513d]"
                    : "border-gray-300 text-gray-600 hover:border-gray-400"
                }`}
              >
                {d === "asc" ? "\u25B2 Ascendente" : "\u25BC Descendente"}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-500">
          Se reordenan todas las filas de la hoja. Las celdas vacias quedan
          al final en ambos sentidos.
        </p>
      </div>

      <div className="flex justify-end gap-2 border-t border-gray-200 px-5 py-3">
        <button
          onClick={onClose}
          className="rounded px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
        >
          Cancelar
        </button>
        <button
          onClick={apply}
          className="rounded bg-[#00674d] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#00513d]"
        >
          Ordenar
        </button>
      </div>
    </div>
  );
}
