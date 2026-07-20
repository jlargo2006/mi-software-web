// studies/normality/Controls.tsx
"use client";
import React from "react";
import type { ColumnInfo } from "../../lib/columns";
import type { NormalityParams } from "./types";

const BRAND = "#00674d";

export default function NormalityControls({
  params,
  onChange,
  columns,
  onRun,
}: {
  params: NormalityParams;
  onChange: (p: NormalityParams) => void;
  columns: ColumnInfo[];
  onRun: () => void;
}) {
  const set = (patch: Partial<NormalityParams>) =>
    onChange({ ...params, ...patch });

  return (
    <div className="w-full">
      <div className="mb-3 flex flex-wrap gap-4">
        <label className="flex flex-col text-xs text-gray-600">
          Data column
          <select
            value={params.col ?? ""}
            onChange={(e) => set({ col: e.target.value || null })}
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
