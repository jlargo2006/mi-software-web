// studies/pareto/Controls.tsx
"use client";
import React from "react";
import type { ColumnInfo } from "../../lib/columns";
import type { ParetoParams } from "./types";

const BRAND = "#00674d";

export default function ParetoControls({
  params,
  onChange,
  columns,
  onRun,
}: {
  params: ParetoParams;
  onChange: (p: ParetoParams) => void;
  columns: ColumnInfo[];
  onRun: () => void;
}) {
  const set = (patch: Partial<ParetoParams>) => onChange({ ...params, ...patch });

  return (
    <div className="w-full">
      <div className="mb-3 flex flex-wrap gap-4">
        <label className="flex flex-col text-xs text-gray-600">
          Categories (text column)
          <select
            value={params.categoryCol ?? ""}
            onChange={(e) => set({ categoryCol: e.target.value || null })}
            className="mt-1 min-w-[180px] rounded border border-gray-300 px-2 py-1 text-sm"
          >
            <option value="">-- select --</option>
            {columns.map((c) => (
              <option key={c.index} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col text-xs text-gray-600">
          Counts (number column)
          <select
            value={params.countCol ?? ""}
            onChange={(e) => set({ countCol: e.target.value || null })}
            className="mt-1 min-w-[180px] rounded border border-gray-300 px-2 py-1 text-sm"
          >
            <option value="">-- select --</option>
            {columns.map((c) => (
              <option key={c.index} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mb-3 flex flex-wrap items-end gap-4">
        <label className="flex flex-col text-xs text-gray-600">
          Combine
          <select
            value={params.combine}
            onChange={(e) =>
              set({ combine: e.target.value as ParetoParams["combine"] })
            }
            className="mt-1 rounded border border-gray-300 px-2 py-1 text-sm"
          >
            <option value="none">Do not combine</option>
            <option value="combine">Combine</option>
          </select>
        </label>

        <label className="flex flex-col text-xs text-gray-600">
          Combine remaining defects into one category after this percent
          <input
            type="number"
            min={1}
            max={100}
            value={params.combinePercent}
            disabled={params.combine !== "combine"}
            onChange={(e) => set({ combinePercent: Number(e.target.value) })}
            className="mt-1 w-24 rounded border border-gray-300 px-2 py-1 text-sm disabled:bg-gray-100 disabled:text-gray-400"
          />
        </label>
      </div>

      <button
        onClick={onRun}
        className="mt-1 rounded px-4 py-2 text-sm font-medium text-white"
        style={{ backgroundColor: BRAND }}
      >
        Run
      </button>
    </div>
  );
}
