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
      {/* Data arrangement */}
      <div>
        <span className={label}>Data arrangement</span>
        <div className="space-y-2">
          {(
            [
              ["stacked", "Response in one column, factor in another"],
              ["unstacked", "Each sample in its own column"],
            ] as const
          ).map(([v, txt]) => (
            <label
              key={v}
              className="flex items-center gap-2 text-sm text-gray-700"
            >
              <input
                type="radio"
                name="mood-format"
                className={check}
                checked={params.format === v}
                onChange={() => set("format", v)}
              />
              {txt}
            </label>
          ))}
        </div>
      </div>      
      {params.format === "stacked" && (
      <>
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
      </>
      )}

      {params.format === "unstacked" && (
        <div>
          <label className={label}>Samples</label>
          <div className="space-y-2">
            {params.sampleColumns.map((sel, i) => (
              <div key={i} className="flex items-center gap-2">
                <select
                  className={field}
                  value={sel}
                  onChange={(e) => {
                    const next = [...params.sampleColumns];
                    next[i] = e.target.value;
                    set("sampleColumns", next);
                  }}
                >
                  <option value="">Select a column...</option>
                  {columns.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="shrink-0 rounded-md border border-gray-300 px-2 py-2 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                  disabled={params.sampleColumns.length <= 2}
                  onClick={() =>
                    set(
                      "sampleColumns",
                      params.sampleColumns.filter((_, j) => j !== i)
                    )
                  }
                  aria-label="Remove sample"
                >
                  {"\u2715"}
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="mt-2 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
            onClick={() =>
              set("sampleColumns", [...params.sampleColumns, ""])
            }
          >
            + Add sample
          </button>
          <p className="mt-1 text-xs text-gray-500">
            One numeric column per sample; the column name is used as the group
            label. Columns may have different lengths: empty cells are ignored.
          </p>
        </div>
      )}

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
