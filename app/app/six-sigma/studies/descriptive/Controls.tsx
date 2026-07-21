// studies/descriptive/Controls.tsx
"use client";
import React, { useState } from "react";
import type { ColumnInfo } from "../../lib/columns";
import type { DescriptiveParams } from "./types";
import type { StatKey } from "../../lib/descriptiveStats";
import DescriptiveStatsDialog from "./StatsDialog";
import { BRAND } from "../../lib/theme";

export default function DescriptiveControls({
  params,
  onChange,
  columns,
}: {
  params: DescriptiveParams;
  onChange: (p: DescriptiveParams) => void;
  columns: ColumnInfo[];
}) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const selected = new Set(params.selectedColNames);
  const toggleCol = (name: string) => {
    const next = new Set(selected);
    if (next.has(name)) {
      next.delete(name);
    } else {
      next.add(name);
    }
    onChange({ ...params, selectedColNames: [...next] });
  };

  return (
    <div className="w-full">
      <div className="mb-3">
        <div className="mb-1 text-xs text-gray-600">Data columns</div>
        <div className="flex flex-wrap gap-2">
          {columns.map((c) => {
            const on = selected.has(c.name);
            return (
              <button
                key={c.index}
                onClick={() => toggleCol(c.name)}
                className="rounded border px-2 py-1 text-sm"
                style={{
                  backgroundColor: on ? BRAND : "white",
                  color: on ? "white" : "#374151",
                  borderColor: on ? BRAND : "#d1d5db",
                }}
              >
                {c.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setDialogOpen(true)}
          className="rounded border border-gray-300 px-3 py-2 text-sm"
        >
          Statistics…
        </button>
      </div>

      {dialogOpen && (
        <DescriptiveStatsDialog
          initial={new Set(params.selectedStats)}
          onApply={(keys: Set<StatKey>) => {
            onChange({ ...params, selectedStats: [...keys] });
            setDialogOpen(false);
          }}
          onClose={() => setDialogOpen(false)}
        />
      )}
    </div>
  );
}
