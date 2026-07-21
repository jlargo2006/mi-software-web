// components/ColumnSelect.tsx
"use client";
import React from "react";
import type { ColumnInfo } from "../lib/columns";

export default function ColumnSelect({
  label,
  value,
  onChange,
  columns,
  minWidth = 180,
}: {
  label: string;
  value: string | null;
  onChange: (v: string | null) => void;
  columns: ColumnInfo[];
  minWidth?: number;
}) {
  return (
    <label className="flex flex-col text-xs text-gray-600">
      {label}
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        style={{ minWidth }}
        className="mt-1 rounded border border-gray-300 px-2 py-1 text-sm"
      >
        <option value="">-- select --</option>
        {columns.map((c) => (
          <option key={c.index} value={c.name}>
            {c.name}
          </option>
        ))}
      </select>
    </label>
  );
}
