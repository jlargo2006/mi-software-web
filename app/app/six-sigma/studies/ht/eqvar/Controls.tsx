// app/app/six-sigma/studies/ht/eqvar/Controls.tsx
"use client";
import React from "react";
import type { ColumnInfo } from "../../../lib/columns";
import type { EqVarParams, DataFormat } from "./types";

// Todo caracter no ASCII va como escape \uXXXX: el archivo queda ASCII puro
// y no depende de como la cadena de build interprete los bytes.
const ELLIPSIS = "\u2026"; // ...
const ALPHA = "\u03b1"; // alpha

export default function Controls({
  params,
  onChange,
  columns,
}: {
  params: EqVarParams;
  onChange: (next: EqVarParams) => void;
  columns: ColumnInfo[];
}) {
  const setFormat = (format: DataFormat) => onChange({ ...params, format });

  const columnOptions = (
    <>
      <option value="">{"Select a column" + ELLIPSIS}</option>
      {columns.map((c) => (
        <option key={c.name} value={c.name}>
          {c.name}
        </option>
      ))}
    </>
  );

  const setSample = (i: number, value: string | null) => {
    const next = [...params.sampleCols];
    next[i] = value;
    onChange({ ...params, sampleCols: next });
  };

  const addSample = () =>
    onChange({ ...params, sampleCols: [...params.sampleCols, null] });

  const removeSample = (i: number) =>
    onChange({
      ...params,
      sampleCols: params.sampleCols.filter((_, j) => j !== i),
    });

  return (
    <div className="space-y-4 text-sm">
      {/* ---- Formato de los datos ---- */}
      <fieldset className="space-y-2">
        <legend className="font-medium mb-1">Data arrangement</legend>

        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="radio"
            name="ev-format"
            className="mt-0.5"
            checked={params.format === "stacked"}
            onChange={() => setFormat("stacked")}
          />
          <span>All samples are in one column</span>
        </label>

        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="radio"
            name="ev-format"
            className="mt-0.5"
            checked={params.format === "unstacked"}
            onChange={() => setFormat("unstacked")}
          />
          <span>Each sample is in its own column</span>
        </label>
      </fieldset>

      {/* ---- Apilado ---- */}
      {params.format === "stacked" && (
        <div className="space-y-3 border-t pt-3">
          <div>
            <label className="block font-medium mb-1">Response</label>
            <select
              className="border rounded px-2 py-1 w-full"
              value={params.responseCol ?? ""}
              onChange={(e) =>
                onChange({ ...params, responseCol: e.target.value || null })
              }
            >
              {columnOptions}
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1">Factor</label>
            <select
              className="border rounded px-2 py-1 w-full"
              value={params.factorCol ?? ""}
              onChange={(e) =>
                onChange({ ...params, factorCol: e.target.value || null })
              }
            >
              {columnOptions}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Two or more levels. Each level needs at least 5 observations.
            </p>
          </div>
        </div>
      )}

      {/* ---- Desapilado ---- */}
      {params.format === "unstacked" && (
        <div className="space-y-2 border-t pt-3">
          <div className="font-medium mb-1">Samples</div>
          {params.sampleCols.map((col, i) => (
            <div key={i} className="flex items-center gap-2">
              <select
                className="border rounded px-2 py-1 flex-1"
                value={col ?? ""}
                onChange={(e) => setSample(i, e.target.value || null)}
              >
                {columnOptions}
              </select>
              {params.sampleCols.length > 2 && (
                <button
                  type="button"
                  className="text-gray-400 hover:text-red-600 px-1"
                  onClick={() => removeSample(i)}
                  aria-label="Remove sample"
                >
                  &times;
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="text-xs text-[#00674d] hover:underline"
            onClick={addSample}
          >
            + Add sample
          </button>
        </div>
      )}

      {/* ---- Opciones ---- */}
      <div className="border-t pt-3 space-y-3">
        <div>
          <label className="block font-medium mb-1">
            {"Significance level (" + ALPHA + ")"}
          </label>
          <input
            type="text"
            className="border rounded px-2 py-1 w-24"
            value={params.alpha}
            onChange={(e) => onChange({ ...params, alpha: e.target.value })}
          />
          <p className="text-xs text-gray-500 mt-1">
            The confidence intervals use the Bonferroni individual level
            1 {"\u2212"} {ALPHA}/k.
          </p>
        </div>
      </div>

      {/* ---- Graficos ---- */}
      <div className="border-t pt-3 space-y-1">
        <div className="font-medium mb-1">Graphs</div>
        {(
          [
            ["showIntervalPlot", "Multiple comparison intervals"],
            ["showBoxplot", "Boxplot"],
            ["showKurtosis", "Show kurtosis column (diagnostic)"],
          ] as const
        ).map(([field, label]) => (
          <label key={field} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={params[field]}
              onChange={(e) => onChange({ ...params, [field]: e.target.checked })}
            />
            <span>{label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
