// app/app/six-sigma/studies/improve/fitregression/Controls.tsx
"use client";
import React from "react";
import type { ColumnInfo } from "../../../lib/columns";
import type { ImpFitRegParams } from "./types";

const label = "block text-sm font-medium text-gray-700 mb-1";
const field =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#00674d] focus:outline-none focus:ring-1 focus:ring-[#00674d]";
const check =
  "h-4 w-4 rounded border-gray-300 text-[#00674d] focus:ring-[#00674d]";

export default function ImpFitRegControls({
  params,
  onChange,
  columns,
}: {
  params: ImpFitRegParams;
  onChange: (p: ImpFitRegParams) => void;
  columns: ColumnInfo[];
}) {
  const set = <K extends keyof ImpFitRegParams>(
    k: K,
    v: ImpFitRegParams[K]
  ) => onChange({ ...params, [k]: v });

  const toggle = (name: string) => {
    const cur = params.predictors;
    set(
      "predictors",
      cur.includes(name) ? cur.filter((s) => s !== name) : [...cur, name]
    );
  };

  const chosen = params.predictors.filter((s) => s !== params.response);

  return (
    <div className="space-y-4">
      <div>
        <label className={label}>Response</label>
        <select
          className={field}
          value={params.response}
          onChange={(e) => set("response", e.target.value)}
        >
          <option value="">Select a column...</option>
          {columns.map((c) => (
            <option key={c.index} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <span className={label}>
          Continuous predictors
          {chosen.length > 0 && (
            <span className="ml-1 font-normal text-gray-500">
              ({chosen.length})
            </span>
          )}
        </span>
        <div className="max-h-52 overflow-y-auto rounded-md border border-gray-300 p-2 space-y-1">
          {columns.length === 0 && (
            <p className="text-xs text-gray-400">No columns available.</p>
          )}
          {columns
            .filter((c) => c.name !== params.response)
            .map((c) => (
              <label
                key={c.index}
                className="flex items-center gap-2 text-sm text-gray-700"
              >
                <input
                  type="checkbox"
                  className={check}
                  checked={params.predictors.includes(c.name)}
                  onChange={() => toggle(c.name)}
                />
                {c.name}
              </label>
            ))}
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Uncheck a term and run again to refit without it.
        </p>
      </div>

      <div className="border-t border-gray-200 pt-4 grid grid-cols-2 gap-2">
        <div>
          <label className={label}>Confidence level (%)</label>
          <input
            className={field}
            value={params.confidenceLevel}
            onChange={(e) => set("confidenceLevel", e.target.value)}
            placeholder="95"
            inputMode="decimal"
          />
        </div>
        <div>
          <label className={label}>Alpha to remove terms</label>
          <input
            className={field}
            value={params.alpha}
            onChange={(e) => set("alpha", e.target.value)}
            placeholder="0,05"
            inputMode="decimal"
          />
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            className={check}
            checked={params.showResidualPlots}
            onChange={(e) => set("showResidualPlots", e.target.checked)}
          />
          Four-in-one residual plots
        </label>
      </div>
    </div>
  );
}
