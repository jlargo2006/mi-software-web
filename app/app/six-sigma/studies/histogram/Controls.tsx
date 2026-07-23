// app/app/six-sigma/studies/histogram/Controls.tsx
"use client";
import React from "react";
import type { HistogramParams } from "./types";

export default function Controls({
  params,
  onChange,
  columns,
}: {
  params: HistogramParams;
  onChange: (next: HistogramParams) => void;
  columns: string[];
}) {
  const available = columns.filter((c) => !params.cols.includes(c));

  const addCol = (c: string) => {
    if (c && !params.cols.includes(c)) {
      onChange({ ...params, cols: [...params.cols, c] });
    }
  };
  const removeCol = (c: string) =>
    onChange({ ...params, cols: params.cols.filter((x) => x !== c) });

  // 4 opciones Minitab ↔ 2 booleanos
  const variant = `${params.groups ? "G" : ""}${params.fit ? "F" : ""}`;
  const setVariant = (v: string) =>
    onChange({ ...params, groups: v.includes("G"), fit: v.includes("F") });

  return (
    <div className="space-y-4 text-sm">
      {/* Añadir columnas */}
      <div>
        <label className="block font-medium mb-1">Add column</label>
        <select
          className="border rounded px-2 py-1 w-full"
          value=""
          onChange={(e) => addCol(e.target.value)}
        >
          <option value="" disabled>
            Select a column…
          </option>
          {available.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Columnas añadidas */}
      {params.cols.length > 0 && (
        <div>
          <label className="block font-medium mb-1">Selected columns</label>
          <ul className="space-y-1">
            {params.cols.map((c) => (
              <li
                key={c}
                className="flex items-center justify-between border rounded px-2 py-1"
              >
                <span>{c}</span>
                <button
                  type="button"
                  className="text-red-600 hover:underline"
                  onClick={() => removeCol(c)}
                >
                  remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tipo (4 opciones Minitab) */}
      <div>
        <label className="block font-medium mb-1">Type</label>
        <select
          className="border rounded px-2 py-1 w-full"
          value={variant}
          onChange={(e) => setVariant(e.target.value)}
        >
          <option value="">Simple</option>
          <option value="F">With Fit</option>
          <option value="G">With Groups</option>
          <option value="GF">With Fit and Groups</option>
        </select>
      </div>

      {/* Binning */}
      <div>
        <label className="block font-medium mb-1">Bins</label>
        <div className="flex items-center gap-2">
          <select
            className="border rounded px-2 py-1"
            value={params.binMode}
            onChange={(e) =>
              onChange({
                ...params,
                binMode: e.target.value as HistogramParams["binMode"],
              })
            }
          >
            <option value="nice">Automatic (nice)</option>
            <option value="fixed">Fixed number</option>
          </select>
          {params.binMode === "fixed" && (
            <input
              type="number"
              min={1}
              className="border rounded px-2 py-1 w-20"
              value={params.nBins}
              onChange={(e) =>
                onChange({ ...params, nBins: Number(e.target.value) })
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
