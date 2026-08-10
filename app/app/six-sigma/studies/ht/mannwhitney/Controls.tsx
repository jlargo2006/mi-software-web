// app/app/six-sigma/studies/ht/mannwhitney/Controls.tsx
"use client";
import React from "react";
import type { ColumnInfo } from "../../../lib/columns";
import {
  ALT_LABEL,
  type MWAlternative,
  type HTMannWhitneyParams,
} from "./types";

const label = "block text-sm font-medium text-gray-700 mb-1";
const field =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#00674d] focus:outline-none focus:ring-1 focus:ring-[#00674d]";
const check = "h-4 w-4 rounded border-gray-300 text-[#00674d] focus:ring-[#00674d]";

export default function HTMannWhitneyControls({
  params,
  onChange,
  columns,
}: {
  params: HTMannWhitneyParams;
  onChange: (p: HTMannWhitneyParams) => void;
  columns: ColumnInfo[];
}) {
  const set = <K extends keyof HTMannWhitneyParams>(
    k: K,
    v: HTMannWhitneyParams[K]
  ) => onChange({ ...params, [k]: v });

  return (
    <div className="space-y-4">
      <div>
        <label className={label}>First sample</label>
        <select
          className={field}
          value={params.columnX}
          onChange={(e) => set("columnX", e.target.value)}
        >
          <option value="">Select a column...</option>
          {columns.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={label}>Second sample</label>
        <select
          className={field}
          value={params.columnY}
          onChange={(e) => set("columnY", e.target.value)}
        >
          <option value="">Select a column...</option>
          {columns.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-gray-500">
          Samples are independent and may have different sizes. Empty or
          non-numeric cells are dropped.
        </p>
      </div>

      <div className="border-t border-gray-200 pt-4 space-y-3">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <input
            type="checkbox"
            className={check}
            checked={params.performTest}
            onChange={(e) => set("performTest", e.target.checked)}
          />
          Perform hypothesis test
        </label>

        <div className={params.performTest ? "space-y-3" : "space-y-3 opacity-50"}>
          <div>
            <label className={label}>Hypothesized difference</label>
            <input
              className={field}
              value={params.hypothesizedDifference}
              onChange={(e) => set("hypothesizedDifference", e.target.value)}
              disabled={!params.performTest}
              placeholder="0"
            />
          </div>

          <div>
            <label className={label}>Alternative hypothesis</label>
            <select
              className={field}
              value={params.alternative}
              onChange={(e) => set("alternative", e.target.value as MWAlternative)}
              disabled={!params.performTest}
            >
              {(Object.keys(ALT_LABEL) as MWAlternative[]).map((k) => (
                <option key={k} value={k}>
                  {ALT_LABEL[k]}
                </option>
              ))}
            </select>
          </div>
        </div>
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
          The achieved confidence may differ: the distribution is discrete.
        </p>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <span className={label}>Graphs</span>
        <div className="space-y-2">
          {(
            [
              ["showHistogram", "Histogram"],
              ["showIndividualValue", "Individual value plot"],
              ["showBoxplot", "Boxplot"],
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
