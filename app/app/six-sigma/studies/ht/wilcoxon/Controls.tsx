// app/app/six-sigma/studies/ht/wilcoxon/Controls.tsx
"use client";
import React from "react";
import type { ColumnInfo } from "../../../lib/columns";
import {
  ALT_LABEL,
  type WilcoxonAlternative,
  type HTWilcoxonParams,
} from "./types";

const label = "block text-sm font-medium text-gray-700 mb-1";
const field =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#00674d] focus:outline-none focus:ring-1 focus:ring-[#00674d]";
const check = "h-4 w-4 rounded border-gray-300 text-[#00674d] focus:ring-[#00674d]";

export default function HTWilcoxonControls({
  params,
  onChange,
  columns,
}: {
  params: HTWilcoxonParams;
  onChange: (p: HTWilcoxonParams) => void;
  columns: ColumnInfo[];
}) {
  const set = <K extends keyof HTWilcoxonParams>(k: K, v: HTWilcoxonParams[K]) =>
    onChange({ ...params, [k]: v });

  return (
    <div className="space-y-4">
      <div>
        <label className={label}>Sample</label>
        <select
          className={field}
          value={params.column}
          onChange={(e) => set("column", e.target.value)}
        >
          <option value="">Select a column...</option>
          {columns.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-gray-500">
          Empty or non-numeric cells are dropped.
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
            <label className={label}>Hypothesized median</label>
            <input
              className={field}
              value={params.hypothesizedMedian}
              onChange={(e) => set("hypothesizedMedian", e.target.value)}
              disabled={!params.performTest}
              placeholder="0"
            />
          </div>

          <div>
            <label className={label}>Alternative hypothesis</label>
            <select
              className={field}
              value={params.alternative}
              onChange={(e) =>
                set("alternative", e.target.value as WilcoxonAlternative)
              }
              disabled={!params.performTest}
            >
              {(Object.keys(ALT_LABEL) as WilcoxonAlternative[]).map((k) => (
                <option key={k} value={k}>
                  {ALT_LABEL[k]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4 space-y-3">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <input
            type="checkbox"
            className={check}
            checked={params.performCI}
            onChange={(e) => set("performCI", e.target.checked)}
          />
          Confidence interval for the median
        </label>

        <div className={params.performCI ? "" : "opacity-50"}>
          <label className={label}>Confidence level (%)</label>
          <input
            className={field}
            value={params.confidenceLevel}
            onChange={(e) => set("confidenceLevel", e.target.value)}
            disabled={!params.performCI}
            placeholder="95,0"
          />
          <p className="mt-1 text-xs text-gray-500">
            The achieved confidence may differ: the distribution is discrete.
          </p>
        </div>
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
