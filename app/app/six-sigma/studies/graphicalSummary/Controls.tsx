// studies/graphicalSummary/Controls.tsx
"use client";
import React from "react";
import type { ColumnInfo } from "../../lib/columns";
import type { GraphicalSummaryParams } from "./types";

export default function GraphicalSummaryControls({
  params,
  onChange,
  columns,
}: {
  params: GraphicalSummaryParams;
  onChange: (p: GraphicalSummaryParams) => void;
  columns: ColumnInfo[];
}) {
  return (
    <div className="w-full space-y-3">
      <div>
        <div className="mb-1 text-xs text-gray-600">Variable</div>
        <select
          value={params.col ?? ""}
          onChange={(e) =>
            onChange({ ...params, col: e.target.value || null })
          }
          className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
        >
          <option value="">— Select column —</option>
          {columns.map((c) => (
            <option key={c.index} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <div className="mb-1 text-xs text-gray-600">Confidence level (%)</div>
        <input
          type="number"
          step={0.1}
          min={0.1}
          max={99.9}
          value={params.confidence}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            onChange({ ...params, confidence: Number.isFinite(v) ? v : 95.0 });
          }}
          className="w-28 rounded border border-gray-300 px-2 py-1 text-sm"
        />
      </div>
    </div>
  );
}
