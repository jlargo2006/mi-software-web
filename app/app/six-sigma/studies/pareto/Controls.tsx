// studies/pareto/Controls.tsx
"use client";
import React from "react";
import type { ColumnInfo } from "../../lib/columns";
import ColumnSelect from "../../components/ColumnSelect";
import type { ParetoParams } from "./types";

export default function ParetoControls({
  params,
  onChange,
  columns,
}: {
  params: ParetoParams;
  onChange: (p: ParetoParams) => void;
  columns: ColumnInfo[];
}) {
  const set = (patch: Partial<ParetoParams>) => onChange({ ...params, ...patch });

  return (
    <div className="w-full">
      <div className="mb-3 flex flex-wrap gap-4">
        <ColumnSelect
          label="Categories (text column)"
          value={params.categoryCol}
          onChange={(v) => set({ categoryCol: v })}
          columns={columns}
        />

        <ColumnSelect
          label="Counts (number column)"
          value={params.countCol}
          onChange={(v) => set({ countCol: v })}
          columns={columns}
        />
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
    </div>
  );
}
