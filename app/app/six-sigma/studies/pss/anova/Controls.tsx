// app/app/six-sigma/studies/pss/anova/Controls.tsx
"use client";
import React from "react";
import type { ColumnInfo } from "../../../lib/columns";
import PssFields from "../_shared/PssFields";
import type { PssAnovaParams } from "./types";

export default function PssAnovaControls({
  params,
  onChange,
}: {
  params: PssAnovaParams;
  onChange: (p: PssAnovaParams) => void;
  columns: ColumnInfo[];
}) {
  return (
    <PssFields
      params={params}
      onChange={onChange}
      showAlternative={false}
      sizeLabel="Sample sizes"
      sizeHint="per level, e.g. 10:40/5"
      diffLabel="Maximum difference between means"
      diffHint="largest minus smallest"
      extra={
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Number of levels</span>
            <input
              type="number"
              min="2"
              step="1"
              className="border border-gray-300 rounded px-2 py-1 text-sm"
              value={params.levels}
              onChange={(e) => onChange({ ...params, levels: e.target.value })}
            />
          </label>
        </div>
      }
    />
  );
}
