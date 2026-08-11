// app/app/six-sigma/studies/ht/moodsmedian/Controls.tsx
"use client";
import React from "react";
import type { ColumnInfo } from "../../../lib/columns";
import type { HTMoodsMedianParams } from "./types";

const label = "block text-sm font-medium text-gray-700 mb-1";
const field =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#00674d] focus:outline-none focus:ring-1 focus:ring-[#00674d]";
const check = "h-4 w-4 rounded border-gray-300 text-[#00674d] focus:ring-[#00674d]";

export default function HTMoodsMedianControls({
  params,
  onChange,
  columns,
}: {
  params: HTMoodsMedianParams;
  onChange: (p: HTMoodsMedianParams) => void;
  columns: ColumnInfo[];
}) {
  const set = <K extends keyof HTMoodsMedianParams>(
    k: K,
    v: HTMoodsMedianParams[K]
  ) => onChange({ ...params, [k]: v });

  return (
    <div className="space-y-4">
      <div>
        <label className={label}>Response</label>
        <select
          className={field}
          value={params.responseColumn}
          onChange={(e) => set("responseColumn", e.target.value)}
        >
          <option value="">Select a column...</option>
          {columns.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-gray-500">
          Numeric column with the measurements.
        </p>
      </div>

      <div>
        <label className={label}>Factor</label>
        <select
          className={field}
          value={params.factorColumn}
          onChange={(e) => set("factorColumn", e.target.value)}
        >
          <option value="">Select a column...</option>
          {columns.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-gray-500">
          Grouping column, may be text. Data must be stacked: one row per
          observation. Rows with an empty group or a non-numeric response are
          dropped.
        </p>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <label className={label}>Confidence level (%)</label>
        <input
          className={field}
          value={params.confidenceLevel}
          onChange={(e) => set("confidenceLevel", e.target.value)}
          placeholder="95,0"
        />
        <p className="mt-1 text-xs text-gray-500">
          Applies to the individual median intervals, not to the test.
        </p>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <span className={label}>Graphs</span>
        <div className="space-y-2">
          {(
            [
              ["showBoxplot", "Boxplot"],
              ["showIndividualValue", "Individual value plot"],
            ] as const
          ).map(([k, txt]) => (
            <label key={k} className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                className={check}
                checked={params[k]}
                onChange={(e) => set(k, e.target.checked)}
              />
              {txt}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
