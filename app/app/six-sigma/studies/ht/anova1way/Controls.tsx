// app/app/six-sigma/studies/ht/anova1way/Controls.tsx
// Nota: el archivo se mantiene en ASCII puro. Todo caracter no ASCII va como
// escape \uXXXX para evitar el mojibake de la cadena de build.
//   \u2026 ...   \u03b1 alpha   \u2212 signo menos
"use client";
import React from "react";
import type { ColumnInfo } from "../../../lib/columns";
import type { Anova1WayParams, DataFormat } from "./types";

const ELLIPSIS = "\u2026";
const ALPHA = "\u03b1";
const MINUS = "\u2212";

export default function Controls({
  params,
  onChange,
  columns,
}: {
  params: Anova1WayParams;
  onChange: (next: Anova1WayParams) => void;
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

  // --- helpers formato desapilado ---
  const setLevelCol = (i: number, value: string) => {
    const next = [...params.levelCols];
    next[i] = value || null;
    onChange({ ...params, levelCols: next });
  };
  const addLevelCol = () =>
    onChange({ ...params, levelCols: [...params.levelCols, null] });
  const removeLevelCol = (i: number) =>
    onChange({
      ...params,
      levelCols: params.levelCols.filter((_, j) => j !== i),
    });

  return (
    <div className="space-y-4 text-sm">
      {/* ---- Formato de los datos ---- */}
      <fieldset className="space-y-2">
        <legend className="font-medium mb-1">Data arrangement</legend>

        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="radio"
            name="anova-format"
            className="mt-0.5"
            checked={params.format === "stacked"}
            onChange={() => setFormat("stacked")}
          />
          <span>Response data are in one column for all factor levels</span>
        </label>

        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="radio"
            name="anova-format"
            className="mt-0.5"
            checked={params.format === "unstacked"}
            onChange={() => setFormat("unstacked")}
          />
          <span>Response data are in a separate column for each factor level</span>
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
              The factor may be numeric or text.
            </p>
          </div>
        </div>
      )}

      {/* ---- Desapilado ---- */}
      {params.format === "unstacked" && (
        <div className="space-y-2 border-t pt-3">
          <label className="block font-medium mb-1">
            Responses (one column per level)
          </label>

          {params.levelCols.map((col, i) => (
            <div key={i} className="flex gap-1 items-center">
              <select
                className="border rounded px-2 py-1 flex-1 min-w-0"
                value={col ?? ""}
                onChange={(e) => setLevelCol(i, e.target.value)}
              >
                {columnOptions}
              </select>
              <button
                type="button"
                onClick={() => removeLevelCol(i)}
                disabled={params.levelCols.length <= 2}
                title="Remove this level"
                className="px-2 py-1 border rounded text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                {MINUS}
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addLevelCol}
            className="px-2 py-1 border rounded text-gray-700 hover:bg-gray-50"
          >
            {"+ Add level"}
          </button>
          <p className="text-xs text-gray-500">
            The column name is used as the level label.
          </p>
        </div>
      )}

      {/* ---- Opciones ---- */}
      <div className="border-t pt-3">
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
          Equal variances are assumed for the analysis.
        </p>
      </div>

      {/* ---- Graficos ---- */}
      <div className="border-t pt-3 space-y-1">
        <div className="font-medium mb-1">Graphs</div>
        {(
          [
            ["showIntervalPlot", "Interval plot"],
            ["showIndividualValue", "Individual value plot"],
            ["showBoxplot", "Boxplot"],
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

      {/* ---- Residuos ---- */}
      <div className="border-t pt-3 space-y-1">
        <div className="font-medium mb-1">Residuals</div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={params.showResiduals}
            onChange={(e) =>
              onChange({ ...params, showResiduals: e.target.checked })
            }
          />
          <span>Four in one</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={params.showResidualTable}
            onChange={(e) =>
              onChange({ ...params, showResidualTable: e.target.checked })
            }
          />
          <span>Residual table</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={params.standardizedResiduals}
            onChange={(e) =>
              onChange({ ...params, standardizedResiduals: e.target.checked })
            }
          />
          <span>Use standardized residuals</span>
        </label>
        <p className="text-xs text-gray-500">
          Standardized residuals beyond {MINUS}2 / +2 flag unusual observations.
        </p>
      </div>
    </div>
  );
}
