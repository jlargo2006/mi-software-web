// app/app/six-sigma/studies/pss1samplet/Controls.tsx
"use client";
import React from "react";
import type { ColumnInfo } from "../../../lib/columns";
import type { Alternative, Pss1SampleTParams } from "./types";
import { parseRange } from "./compute";

const Text = ({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
}) => (
  <label className="flex flex-col gap-1 text-sm">
    <span className="font-medium">
      {label}
      {hint && <span className="ml-1 font-normal text-gray-500">({hint})</span>}
    </span>
    <input
      type="text"
      className="border border-gray-300 rounded px-2 py-1 text-sm"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  </label>
);

export default function Pss1SampleTControls({
  params,
  onChange,
}: {
  params: Pss1SampleTParams;
  onChange: (p: Pss1SampleTParams) => void;
  columns: ColumnInfo[];
}) {
  const set = <K extends keyof Pss1SampleTParams>(
    k: K,
    v: Pss1SampleTParams[K]
  ) => onChange({ ...params, [k]: v });

  const n = parseRange(params.sampleSizes);
  const d = parseRange(params.differences);
  const p = parseRange(params.powerValues);

  const filled = [n.values.length > 0, d.values.length > 0, p.values.length > 0];
  const count = filled.filter(Boolean).length;
  const solving = !filled[0]
    ? "sample size"
    : !filled[1]
    ? "difference"
    : "power";

  const parseError = n.error ?? d.error ?? p.error;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Text
          label="Sample sizes"
          hint="e.g. 10:40/5"
          value={params.sampleSizes}
          onChange={(v) => set("sampleSizes", v)}
          placeholder="leave blank to calculate"
        />
        <Text
          label="Differences"
          hint="mean − null"
          value={params.differences}
          onChange={(v) => set("differences", v)}
          placeholder="leave blank to calculate"
        />
        <Text
          label="Power values"
          hint="0 to 1"
          value={params.powerValues}
          onChange={(v) => set("powerValues", v)}
          placeholder="leave blank to calculate"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Text
          label="Standard deviation"
          hint="assumed"
          value={params.sd}
          onChange={(v) => set("sd", v)}
        />

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Alternative hypothesis</span>
          <select
            className="border border-gray-300 rounded px-2 py-1 text-sm"
            value={params.alternative}
            onChange={(e) => set("alternative", e.target.value as Alternative)}
          >
            <option value="less">Less than</option>
            <option value="two-sided">Not equal</option>
            <option value="greater">Greater than</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Significance level (α)</span>
          <input
            type="number"
            step="0.01"
            min="0.001"
            max="0.999"
            className="border border-gray-300 rounded px-2 py-1 text-sm"
            value={params.alpha}
            onChange={(e) => set("alpha", Number(e.target.value))}
          />
        </label>
      </div>

      <p className="text-xs text-gray-500">
        Enter values in exactly two of the first three fields. The blank one is
        calculated. Ranges use <code>start:end/step</code>; a single value is
        also accepted.
      </p>

      {parseError && <p className="text-xs text-red-600">{parseError}</p>}

      {!parseError && count === 2 && (
        <p className="text-xs text-gray-600">
          Calculating <b>{solving}</b>.
        </p>
      )}
      {!parseError && count === 3 && (
        <p className="text-xs text-amber-700">
          All three fields are filled. Clear one of them.
        </p>
      )}
      {!parseError && count < 2 && (
        <p className="text-xs text-amber-700">
          Two of the three fields must be filled in.
        </p>
      )}
    </div>
  );
}
