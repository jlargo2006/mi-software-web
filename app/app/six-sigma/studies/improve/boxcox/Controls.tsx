// app/app/six-sigma/studies/improve/boxcox/Controls.tsx
"use client";
import React from "react";
import type { ColumnInfo } from "../../../lib/columns";
import type { ImpBoxCoxParams, LambdaMode } from "./types";

const label = "block text-sm font-medium text-gray-700 mb-1";
const field =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#00674d] focus:outline-none focus:ring-1 focus:ring-[#00674d]";
const radio = "h-4 w-4 border-gray-300 text-[#00674d] focus:ring-[#00674d]";

export default function ImpBoxCoxControls({
  params,
  onChange,
  columns,
}: {
  params: ImpBoxCoxParams;
  onChange: (p: ImpBoxCoxParams) => void;
  columns: ColumnInfo[];
}) {
  const set = <K extends keyof ImpBoxCoxParams>(
    k: K,
    v: ImpBoxCoxParams[K]
  ) => onChange({ ...params, [k]: v });

  return (
    <div className="space-y-4">
      <div>
        <label className={label}>Column to transform</label>
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
          All values must be strictly positive.
        </p>
      </div>

      <div>
        <label className={label}>Subgroup size</label>
        <input
          className={field}
          value={params.subgroupSize}
          onChange={(e) => set("subgroupSize", e.target.value)}
          placeholder="1"
        />
        <p className="mt-1 text-xs text-gray-500">
          Enter a number or column.
        </p>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <span className={label}>Lambda</span>
        <div className="space-y-2">
          {(
            [
              ["optimal", "Optimal or rounded \u03BB"],
              ["other", "Other (enter a value between -5 and 5)"],
            ] as [LambdaMode, string][]
          ).map(([k, txt]) => (
            <label
              key={k}
              className="flex items-start gap-2 text-sm text-gray-700"
            >
              <input
                type="radio"
                name="bc-lambda"
                className={`${radio} mt-0.5`}
                checked={params.lambdaMode === k}
                onChange={() => set("lambdaMode", k)}
              />
              <span>{txt}</span>
            </label>
          ))}
        </div>
        {params.lambdaMode === "other" && (
          <input
            className={`${field} mt-2`}
            value={params.otherLambda}
            onChange={(e) => set("otherLambda", e.target.value)}
            placeholder="e.g. 0,5"
            inputMode="decimal"
          />
        )}
        <p className="mt-1 text-xs text-gray-500">
          The optimal option stores the data using the rounded value, which is
          the nearest of -2, -1, -0,5, 0, 0,5, 1 and 2.
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
      </div>

      <div className="border-t border-gray-200 pt-4">
        <label className={label}>Store transformed values in</label>
        <select
          className={field}
          value={params.storeColumn}
          onChange={(e) => set("storeColumn", e.target.value)}
        >
          <option value="">Select a column...</option>
          {columns.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-gray-500">
          The column must be empty.
        </p>
      </div>
    </div>
  );
}
