// app/app/six-sigma/studies/capability/sixpack/Controls.tsx
"use client";
import React from "react";
import type { ColumnInfo } from "../../../lib/columns";
import ColumnSelect from "../../../components/ColumnSelect";
import type { CapSixpackParams } from "./types";

const label = "block text-sm font-medium text-gray-700 mb-1";
const inp =
  "rounded-md border border-gray-300 px-2 py-1 text-sm w-[110px] focus:border-[#00674d] focus:outline-none focus:ring-1 focus:ring-[#00674d]";

export default function CapSixpackControls({
  params,
  onChange,
  columns,
}: {
  params: CapSixpackParams;
  onChange: (p: CapSixpackParams) => void;
  columns: ColumnInfo[];
}) {
  const set = (patch: Partial<CapSixpackParams>) => onChange({ ...params, ...patch });
  const sub = parseInt(params.subgroupSize, 10) || 1;

  return (
    <div className="space-y-4">
      <ColumnSelect
        label="Single column"
        value={params.col}
        onChange={(v) => set({ col: v })}
        columns={columns}
        minWidth={180}
      />

      <label className="block">
        <span className={label}>Subgroup size</span>
        <input
          className={inp}
          value={params.subgroupSize}
          onChange={(e) => set({ subgroupSize: e.target.value })}
          placeholder="6"
        />
      </label>
      <p className="-mt-2 text-xs text-gray-500">
        {sub === 1
          ? "With a size of 1 the report shows I and MR charts, and short-term variation is estimated from moving ranges."
          : sub > 8
          ? `Consecutive rows are grouped in ${sub}s. Above 8 the spread chart is S rather than R.`
          : `Consecutive rows are grouped in ${sub}s. This choice is not in the data: it says which readings you consider to share the same conditions.`}
      </p>

      <div className="border-t border-gray-200 pt-4 space-y-3">
        <div className="flex gap-3">
          <label className="block">
            <span className={label}>Lower spec</span>
            <input
              className={inp}
              value={params.lsl}
              onChange={(e) => set({ lsl: e.target.value })}
              placeholder="e.g. 215"
            />
          </label>
          <label className="block">
            <span className={label}>Upper spec</span>
            <input
              className={inp}
              value={params.usl}
              onChange={(e) => set({ usl: e.target.value })}
              placeholder="e.g. 225"
            />
          </label>
        </div>
        <label className="block">
          <span className={label}>Target (optional)</span>
          <input
            className={inp}
            value={params.target}
            onChange={(e) => set({ target: e.target.value })}
            placeholder="e.g. 220"
          />
        </label>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <label className="block">
          <span className={label}>Subgroups to display</span>
          <input
            className={inp}
            value={params.lastN}
            onChange={(e) => set({ lastN: e.target.value })}
            placeholder="20"
          />
        </label>
        <p className="mt-1 text-xs text-gray-500">
          The lower-left panel shows the individual values of the most recent
          subgroups, to reveal spread that the means hide.
        </p>
      </div>
    </div>
  );
}
