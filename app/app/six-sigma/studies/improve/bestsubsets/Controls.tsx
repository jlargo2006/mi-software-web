// app/app/six-sigma/studies/improve/bestsubsets/Controls.tsx
"use client";
import React from "react";
import type { ColumnInfo } from "../../../lib/columns";
import { MAX_PREDICTORS, type ImpSubsetsParams } from "./types";

const label = "block text-sm font-medium text-gray-700 mb-1";
const field =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#00674d] focus:outline-none focus:ring-1 focus:ring-[#00674d]";
const check =
  "h-4 w-4 rounded border-gray-300 text-[#00674d] focus:ring-[#00674d]";

export default function ImpSubsetsControls({
  params,
  onChange,
  columns,
}: {
  params: ImpSubsetsParams;
  onChange: (p: ImpSubsetsParams) => void;
  columns: ColumnInfo[];
}) {
  const set = <K extends keyof ImpSubsetsParams>(
    k: K,
    v: ImpSubsetsParams[K]
  ) => onChange({ ...params, [k]: v });

  const toggle = (name: string) => {
    const cur = params.freePredictors;
    set(
      "freePredictors",
      cur.includes(name) ? cur.filter((s) => s !== name) : [...cur, name]
    );
  };

  const chosen = params.freePredictors.filter((s) => s !== params.response);
  const subsets = chosen.length > 0 ? Math.pow(2, chosen.length) - 1 : 0;

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
          Free predictors
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
                  checked={params.freePredictors.includes(c.name)}
                  onChange={() => toggle(c.name)}
                />
                {c.name}
              </label>
            ))}
        </div>
        <p className="mt-1 text-xs text-gray-500">
          {subsets > 0
            ? `${subsets} model(s) will be fitted. Limit: ${MAX_PREDICTORS} predictors.`
            : `Every combination is fitted. Limit: ${MAX_PREDICTORS} predictors.`}
        </p>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <label className={label}>Models of each size to print</label>
        <select
          className={field}
          value={params.modelsPerSize}
          onChange={(e) => set("modelsPerSize", e.target.value)}
        >
          {["1", "2", "3", "4", "5"].map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-gray-500">
          Within a given size the models are ranked by R-Sq.
        </p>
      </div>
    </div>
  );
}
