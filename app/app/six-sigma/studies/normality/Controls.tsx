// studies/normality/Controls.tsx
"use client";
import React from "react";
import type { ColumnInfo } from "../../lib/columns";
import ColumnSelect from "../../components/ColumnSelect";
import type { NormalityParams } from "./types";

export default function NormalityControls({
  params,
  onChange,
  columns,
}: {
  params: NormalityParams;
  onChange: (p: NormalityParams) => void;
  columns: ColumnInfo[];
}) {
  const set = (patch: Partial<NormalityParams>) =>
    onChange({ ...params, ...patch });

  return (
    <div className="w-full">
      <div className="mb-3 flex flex-wrap gap-4">
        <ColumnSelect
          label="Data column"
          value={params.col}
          onChange={(v) => set({ col: v })}
          columns={columns}
        />
      </div>
    </div>
  );
}
