// app/app/six-sigma/studies/capability/iddist/Controls.tsx
"use client";
import React from "react";
import type { ColumnInfo } from "../../../lib/columns";
import ColumnSelect from "../../../components/ColumnSelect";
import { FAMILY_ORDER, FAMILY_LABEL, type FamilyId } from "./families";
import type { IdDistParams } from "./types";

const label = "block text-sm font-medium text-gray-700 mb-1";
const inp =
  "rounded-md border border-gray-300 px-2 py-1 text-sm w-[80px] focus:border-[#00674d] focus:outline-none focus:ring-1 focus:ring-[#00674d]";

export default function IdDistControls({
  params,
  onChange,
  columns,
}: {
  params: IdDistParams;
  onChange: (p: IdDistParams) => void;
  columns: ColumnInfo[];
}) {
  const set = (patch: Partial<IdDistParams>) => onChange({ ...params, ...patch });
  const useAll = params.families === null;

  const toggle = (id: FamilyId) => {
    const cur = params.families ?? [...FAMILY_ORDER];
    const next = cur.includes(id) ? cur.filter((v) => v !== id) : [...cur, id];
    set({ families: next });
  };

  return (
    <div className="space-y-4">
      <ColumnSelect
        label="Single column"
        value={params.col}
        onChange={(v) => set({ col: v })}
        columns={columns}
        minWidth={180}
      />

      <div className="border-t border-gray-200 pt-4 space-y-2">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="radio"
            checked={useAll}
            onChange={() => set({ families: null })}
            className="accent-[#00674d]"
          />
          Use all distributions and transformations
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="radio"
            checked={!useAll}
            onChange={() => set({ families: [...FAMILY_ORDER] })}
            className="accent-[#00674d]"
          />
          Specify
        </label>

        {!useAll && (
          <div className="ml-6 grid grid-cols-1 gap-1 sm:grid-cols-2">
            {FAMILY_ORDER.map((id) => (
              <label
                key={id}
                className="flex items-center gap-1.5 text-xs text-gray-700"
              >
                <input
                  type="checkbox"
                  checked={(params.families ?? []).includes(id)}
                  onChange={() => toggle(id)}
                  className="accent-[#00674d]"
                />
                {FAMILY_LABEL[id]}
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 pt-4">
        <span className={label}>Box-Cox search range for {"\u03BB"}</span>
        <div className="flex items-center gap-2">
          <input
            className={inp}
            value={params.bcLo}
            onChange={(e) => set({ bcLo: e.target.value })}
          />
          <span className="text-sm text-gray-500">to</span>
          <input
            className={inp}
            value={params.bcHi}
            onChange={(e) => set({ bcHi: e.target.value })}
          />
        </div>
        <label className="mt-2 flex items-center gap-1.5 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={params.bcRound}
            onChange={(e) => set({ bcRound: e.target.checked })}
            className="accent-[#00674d]"
          />
          Round {"\u03BB"} to the nearest convenient value
        </label>
        <p className="mt-1 text-xs text-gray-500">
          Rounding gives a transformation that is easier to explain {"\u2014"} a
          square root, a reciprocal {"\u2014"} at some cost in fit.
        </p>
      </div>
    </div>
  );
}
