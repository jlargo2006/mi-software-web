// app/app/six-sigma/studies/ht/twosamplet/Controls.tsx
"use client";
import React from "react";
import type { ColumnInfo } from "../../../lib/columns";
import type { TwoSampleTParams, DataFormat } from "./types";
import type { TAlternative } from "../../../lib/twosamplet";

// Todo caracter no ASCII va como escape \uXXXX: el archivo queda ASCII puro
// y no depende de como la cadena de build interprete los bytes.
const ELLIPSIS = "\u2026"; // ...
const ALPHA = "\u03b1"; // alpha
const MU = "\u03bc"; // mu
const SUB1 = "\u2081"; // subindice 1
const SUB2 = "\u2082"; // subindice 2
const NE = "\u2260"; // distinto
const LE = "\u2264"; // <=
const GE = "\u2265"; // >=
const MINUS = "\u2212"; // signo menos

const D1 = MU + SUB1 + " " + MINUS + " " + MU + SUB2;

export default function Controls({
  params,
  onChange,
  columns,
}: {
  params: TwoSampleTParams;
  onChange: (next: TwoSampleTParams) => void;
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

  const alternatives: [TAlternative, string][] = [
    ["two-sided", "Difference " + NE + " " + params.hypDiff],
    ["less", "Difference < " + params.hypDiff],
    ["greater", "Difference > " + params.hypDiff],
  ];

  return (
    <div className="space-y-4 text-sm">
      {/* ---- Formato de los datos ---- */}
      <fieldset className="space-y-2">
        <legend className="font-medium mb-1">Data arrangement</legend>

        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="radio"
            name="tt-format"
            className="mt-0.5"
            checked={params.format === "stacked"}
            onChange={() => setFormat("stacked")}
          />
          <span>Both samples are in one column</span>
        </label>

        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="radio"
            name="tt-format"
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
            <label className="block font-medium mb-1">Samples</label>
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
            <label className="block font-medium mb-1">Sample IDs</label>
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
              Must have exactly two levels. Numeric or text; the lower level is
              sample 1.
            </p>
          </div>
        </div>
      )}

      {/* ---- Desapilado ---- */}
      {params.format === "unstacked" && (
        <div className="space-y-3 border-t pt-3">
          <div>
            <label className="block font-medium mb-1">Sample 1</label>
            <select
              className="border rounded px-2 py-1 w-full"
              value={params.sample1Col ?? ""}
              onChange={(e) =>
                onChange({ ...params, sample1Col: e.target.value || null })
              }
            >
              {columnOptions}
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Sample 2</label>
            <select
              className="border rounded px-2 py-1 w-full"
              value={params.sample2Col ?? ""}
              onChange={(e) =>
                onChange({ ...params, sample2Col: e.target.value || null })
              }
            >
              {columnOptions}
            </select>
          </div>
        </div>
      )}

      {/* ---- Hipotesis ---- */}
      <div className="border-t pt-3 space-y-3">
        <div>
          <label className="block font-medium mb-1">
            {"Hypothesized difference (" + D1 + ")"}
          </label>
          <input
            type="text"
            className="border rounded px-2 py-1 w-24"
            value={params.hypDiff}
            onChange={(e) => onChange({ ...params, hypDiff: e.target.value })}
          />
        </div>

        <div>
          <div className="font-medium mb-1">Alternative hypothesis</div>
          {alternatives.map(([value, label]) => (
            <label key={value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="tt-alt"
                checked={params.alternative === value}
                onChange={() => onChange({ ...params, alternative: value })}
              />
              <span>{label}</span>
            </label>
          ))}
          <p className="text-xs text-gray-500 mt-1">
            {"One-sided tests report a one-sided bound (" +
              LE +
              " or " +
              GE +
              ") instead of an interval."}
          </p>
        </div>

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
        </div>

        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="mt-0.5"
            checked={params.assumeEqualVariances}
            onChange={(e) =>
              onChange({ ...params, assumeEqualVariances: e.target.checked })
            }
          />
          <span>
            Assume equal variances
            <span className="block text-xs text-gray-500">
              Unchecked (default) uses the Welch approximation, as Minitab does.
              Run Test for Equal Variances first if unsure.
            </span>
          </span>
        </label>
      </div>

      {/* ---- Graficos ---- */}
      <div className="border-t pt-3 space-y-1">
        <div className="font-medium mb-1">Graphs</div>
        {(
          [
            ["showIndividualValue", "Individual value plot"],
            ["showBoxplot", "Boxplot"],
            ["showDiffCI", "CI for the difference"],
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
