// app/app/six-sigma/studies/gagerr/Controls.tsx
"use client";
import React from "react";
import type { ColumnInfo } from "../../lib/columns";
import type { GageRRParams } from "./types";

export default function Controls({
  params,
  onChange,
  columns,
}: {
  params: GageRRParams;
  onChange: (next: GageRRParams) => void;
  columns: ColumnInfo[];
}) {
  const picker = (
    label: string,
    field: "partCol" | "operatorCol" | "measCol"
  ) => (
    <div>
      <label className="block font-medium mb-1">{label}</label>
      <select
        className="border rounded px-2 py-1 w-full"
        value={params[field] ?? ""}
        onChange={(e) => onChange({ ...params, [field]: e.target.value || null })}
      >
        <option value="">Select a column…</option>
        {columns.map((c) => (
          <option key={c.name} value={c.name}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="space-y-4 text-sm">
      {picker("Part numbers", "partCol")}
      {picker("Operators", "operatorCol")}
      {picker("Measurement data", "measCol")}

      <div className="border-t pt-3">
        <label className="block font-medium mb-1">
          Process tolerance (optional)
        </label>
        <input
          type="text"
          placeholder="e.g. 1"
          className="border rounded px-2 py-1 w-full"
          value={params.tolerance}
          onChange={(e) => onChange({ ...params, tolerance: e.target.value })}
        />
        <p className="text-xs text-gray-500 mt-1">
          Leave blank to omit the %Tolerance column.
        </p>
      </div>

      <div>
        <label className="block font-medium mb-1">
          α to remove interaction term
        </label>
        <input
          type="number"
          step={0.01}
          min={0}
          max={1}
          className="border rounded px-2 py-1 w-24"
          value={params.alphaInteraction}
          onChange={(e) =>
            onChange({ ...params, alphaInteraction: Number(e.target.value) })
          }
        />
      </div>
    </div>
  );
}
