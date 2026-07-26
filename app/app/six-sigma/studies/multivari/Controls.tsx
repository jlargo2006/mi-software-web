// app/app/six-sigma/studies/multivari/Controls.tsx
"use client";
import React from "react";
import type { ColumnInfo } from "../../lib/columns";
import type { MultiVariParams } from "./types";

const Select = ({
  label,
  value,
  onChange,
  columns,
  allowNone,
  hint,
}: {
  label: string;
  value: string | null;
  onChange: (v: string | null) => void;
  columns: ColumnInfo[];
  allowNone?: boolean;
  hint?: string;
}) => (
  <label className="flex flex-col gap-1 text-sm">
    <span className="font-medium">
      {label}
      {hint && <span className="ml-1 font-normal text-gray-500">({hint})</span>}
    </span>
    <select
      className="border border-gray-300 rounded px-2 py-1 text-sm"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value === "" ? null : e.target.value)}
    >
      <option value="">{allowNone ? "\u2014 none \u2014" : "\u2014 select \u2014"}</option>
      {columns.map((c) => (
        <option key={c.name} value={c.name}>
          {c.name}
        </option>
      ))}
    </select>
  </label>
);

const Check = ({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <label className="flex items-center gap-2 text-sm">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="accent-[#00674d]"
    />
    {label}
  </label>
);

export default function MultiVariControls({
  params,
  onChange,
  columns,
}: {
  params: MultiVariParams;
  onChange: (p: MultiVariParams) => void;
  columns: ColumnInfo[];
}) {
  const set = <K extends keyof MultiVariParams>(k: K, v: MultiVariParams[K]) =>
    onChange({ ...params, [k]: v });

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <Select
          label="Response"
          value={params.responseCol}
          onChange={(v) => set("responseCol", v)}
          columns={columns}
        />
        <Select
          label="Factor 1"
          hint="X axis"
          value={params.factor1}
          onChange={(v) => set("factor1", v)}
          columns={columns}
        />
        <Select
          label="Factor 2"
          hint="lines"
          value={params.factor2}
          onChange={(v) => set("factor2", v)}
          columns={columns}
          allowNone
        />
        <Select
          label="Factor 3"
          hint="panels"
          value={params.factor3}
          onChange={(v) => set("factor3", v)}
          columns={columns}
          allowNone
        />
        <Select
          label="Factor 4"
          hint="panel rows"
          value={params.factor4}
          onChange={(v) => set("factor4", v)}
          columns={columns}
          allowNone
        />
      </div>

      <div className="flex flex-wrap gap-4 pt-1">
        <Check
          label="Show individual points"
          checked={params.showPoints}
          onChange={(v) => set("showPoints", v)}
        />
        <Check
          label="Connect means"
          checked={params.connectMeans}
          onChange={(v) => set("connectMeans", v)}
        />
        <Check
          label="Show grand mean"
          checked={params.showGrandMean}
          onChange={(v) => set("showGrandMean", v)}
        />
      </div>
    </div>
  );
}
