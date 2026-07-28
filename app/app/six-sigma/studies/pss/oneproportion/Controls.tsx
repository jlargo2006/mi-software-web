// app/app/six-sigma/studies/pss/oneproportion/Controls.tsx
"use client";
import React from "react";
import type { ColumnInfo } from "../../../lib/columns";
import PssFields from "../_shared/PssFields";
import type { PssPropParams, PropMethod } from "./types";

export default function PssPropControls({
  params,
  onChange,
}: {
  params: PssPropParams;
  onChange: (p: PssPropParams) => void;
  columns: ColumnInfo[];
}) {
  return (
    <PssFields
      params={params}
      onChange={onChange}
      showSd={false}
      sizeLabel="Sample sizes"
      sizeHint="e.g. 20:100/10"
      diffLabel="Comparison proportions"
      diffHint="alternative values of p"
      extra={
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Hypothesized proportion (p₀)</span>
            <input
              type="text"
              className="border border-gray-300 rounded px-2 py-1 text-sm"
              value={params.nullProportion}
              onChange={(e) =>
                onChange({ ...params, nullProportion: e.target.value })
              }
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Method</span>
            <select
              className="border border-gray-300 rounded px-2 py-1 text-sm"
              value={params.method}
              onChange={(e) =>
                onChange({ ...params, method: e.target.value as PropMethod })
              }
            >
              <option value="exact">Exact (binomial)</option>
              <option value="normal">Normal approximation</option>
            </select>
          </label>
        </div>
      }
    />
  );
}
