// app/app/six-sigma/studies/capability/nonnormal/Controls.tsx
"use client";
import React from "react";
import type { ColumnInfo } from "../../../lib/columns";
import ColumnSelect from "../../../components/ColumnSelect";
import { DISTRIBUTIONS, type DistId } from "./distributions";
import type { CapNonnormalParams } from "./types";

const label = "block text-sm font-medium text-gray-700 mb-1";
const inp =
  "rounded-md border border-gray-300 px-2 py-1 text-sm w-[110px] focus:border-[#00674d] focus:outline-none focus:ring-1 focus:ring-[#00674d]";
const sel =
  "rounded-md border border-gray-300 px-2 py-1 text-sm w-[220px] focus:border-[#00674d] focus:outline-none focus:ring-1 focus:ring-[#00674d]";

export default function CapNonnormalControls({
  params,
  onChange,
  columns,
}: {
  params: CapNonnormalParams;
  onChange: (p: CapNonnormalParams) => void;
  columns: ColumnInfo[];
}) {
  const set = (patch: Partial<CapNonnormalParams>) =>
    onChange({ ...params, ...patch });

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
        <span className={label}>Fit distribution</span>
        <select
          className={sel}
          value={params.dist}
          onChange={(e) => set({ dist: e.target.value as DistId })}
        >
          {DISTRIBUTIONS.map((d) => (
            <option key={d.id} value={d.id}>
              {d.label}
            </option>
          ))}
        </select>
      </label>
      <p className="-mt-2 text-xs text-gray-500">
        The results panel fits every candidate and ranks them by
        Anderson{"\u2013"}Darling, so you can see whether this choice is the one
        the data support.
      </p>

      <div className="border-t border-gray-200 pt-4 space-y-3">
        <div className="flex items-end gap-3">
          <label className="block">
            <span className={label}>Lower spec</span>
            <input
              className={inp}
              value={params.lsl}
              onChange={(e) => set({ lsl: e.target.value })}
              placeholder="e.g. 60"
            />
          </label>
          <label className="mb-1.5 flex items-center gap-1.5 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={params.lslBoundary}
              onChange={(e) => set({ lslBoundary: e.target.checked })}
              className="accent-[#00674d]"
            />
            Boundary
          </label>
        </div>

        <div className="flex items-end gap-3">
          <label className="block">
            <span className={label}>Upper spec</span>
            <input
              className={inp}
              value={params.usl}
              onChange={(e) => set({ usl: e.target.value })}
              placeholder="e.g. 240"
            />
          </label>
          <label className="mb-1.5 flex items-center gap-1.5 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={params.uslBoundary}
              onChange={(e) => set({ uslBoundary: e.target.checked })}
              className="accent-[#00674d]"
            />
            Boundary
          </label>
        </div>

        <p className="text-xs text-gray-500">
          Tick <em>Boundary</em> when the limit is physically unreachable rather
          than a customer requirement: no expected defects are then counted on
          that side.
        </p>

        <label className="block">
          <span className={label}>Target (optional)</span>
          <input
            className={inp}
            value={params.target}
            onChange={(e) => set({ target: e.target.value })}
          />
        </label>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <label className="block">
          <span className={label}>Tolerance width K</span>
          <input
            className={inp}
            value={params.k}
            onChange={(e) => set({ k: e.target.value })}
            placeholder="6"
          />
        </label>
        <p className="mt-1 text-xs text-gray-500">
          Used only by the percentile indices. K = 6 gives the 0,135 and 99,865
          percentiles, the nonnormal counterpart of {"\u00B1"}3{"\u03C3"}.
        </p>
      </div>
    </div>
  );
}
