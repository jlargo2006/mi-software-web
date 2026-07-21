// studies/capability/Controls.tsx
"use client";
import React from "react";
import type { ColumnInfo } from "../../lib/columns";
import ColumnSelect from "../../components/ColumnSelect";
import type { CapabilityParams } from "./types";

export default function CapabilityControls({
  params,
  onChange,
  columns,
}: {
  params: CapabilityParams;
  onChange: (p: CapabilityParams) => void;
  columns: ColumnInfo[];
}) {
  const set = (patch: Partial<CapabilityParams>) =>
    onChange({ ...params, ...patch });

  const field =
    "mt-1 rounded border border-gray-300 px-2 py-1 text-sm w-[110px]";

  return (
    <div className="w-full">
      <div className="mb-3 flex flex-wrap gap-4">
        <ColumnSelect
          label="Data column"
          value={params.col}
          onChange={(v) => set({ col: v })}
          columns={columns}
          minWidth={160}
        />

        <label className="flex flex-col text-xs text-gray-600">
          LSL
          <input
            value={params.lsl}
            onChange={(e) => set({ lsl: e.target.value })}
            className={field}
            placeholder="e.g. 9.5"
          />
        </label>

        <label className="flex flex-col text-xs text-gray-600">
          USL
          <input
            value={params.usl}
            onChange={(e) => set({ usl: e.target.value })}
            className={field}
            placeholder="e.g. 10.5"
          />
        </label>

        <label className="flex flex-col text-xs text-gray-600">
          Target (optional)
          <input
            value={params.target}
            onChange={(e) => set({ target: e.target.value })}
            className={field}
            placeholder="e.g. 10.0"
          />
        </label>

        <label className="flex flex-col text-xs text-gray-600">
          Subgroup size
          <input
            value={params.subgroupSize}
            onChange={(e) => set({ subgroupSize: e.target.value })}
            className={field}
            placeholder="1"
          />
        </label>
      </div>
    </div>
  );
}
