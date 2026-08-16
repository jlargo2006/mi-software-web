// app/app/six-sigma/studies/doe/factorial/maineffects/Controls.tsx
"use client";
import React from "react";
import type { ColumnInfo } from "../../../../lib/columns";
import type { DoeMainParams } from "./types";

const label = "block text-sm font-medium text-gray-700 mb-1";
const field =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#00674d] focus:outline-none focus:ring-1 focus:ring-[#00674d]";
const check =
  "h-4 w-4 rounded border-gray-300 text-[#00674d] focus:ring-[#00674d]";

/** Columnas de servicio del diseno: no son factores. */
const RESERVED = ["stdorder", "runorder", "centerpt", "blocks"];

export default function DoeMainControls({
  params,
  onChange,
  columns,
}: {
  params: DoeMainParams;
  onChange: (p: DoeMainParams) => void;
  columns: ColumnInfo[];
}) {
  const set = <K extends keyof DoeMainParams>(k: K, v: DoeMainParams[K]) =>
    onChange({ ...params, [k]: v });

  const toggle = (name: string) => {
    const cur = params.factors;
    set(
      "factors",
      cur.includes(name) ? cur.filter((s) => s !== name) : [...cur, name]
    );
  };

  const isReserved = (nm: string) => RESERVED.includes(nm.trim().toLowerCase());
  const chosen = params.factors.filter((s) => s !== params.response);

  /** Marca de golpe todo lo que parece factor del diseno. */
  const selectDesign = () => {
    const picks = columns
      .map((c) => c.name)
      .filter((nm) => nm !== params.response && !isReserved(nm));
    set("factors", picks);
  };

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
        <div className="mb-1 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            Factors
            {chosen.length > 0 && (
              <span className="ml-1 font-normal text-gray-500">
                ({chosen.length})
              </span>
            )}
          </span>
          <button
            type="button"
            onClick={selectDesign}
            className="rounded border border-gray-300 px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-50"
          >
            Select design factors
          </button>
        </div>
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
                  checked={params.factors.includes(c.name)}
                  onChange={() => toggle(c.name)}
                />
                <span className={isReserved(c.name) ? "text-gray-400" : ""}>
                  {c.name}
                </span>
              </label>
            ))}
        </div>
        <p className="mt-1 text-xs text-gray-500">
          StdOrder, RunOrder, CenterPt and Blocks are bookkeeping columns, not
          factors.
        </p>
      </div>

      <div className="border-t border-gray-200 pt-4 space-y-2">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            className={check}
            checked={params.sharedScale}
            onChange={(e) => set("sharedScale", e.target.checked)}
          />
          Same vertical scale on every panel
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            className={check}
            checked={params.showGrandMean}
            onChange={(e) => set("showGrandMean", e.target.checked)}
          />
          Reference line at the overall mean
        </label>
      </div>
    </div>
  );
}
