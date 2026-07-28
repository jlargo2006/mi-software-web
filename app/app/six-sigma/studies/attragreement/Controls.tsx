// app/app/six-sigma/studies/attragreement/Controls.tsx
"use client";
import React from "react";
import type { ColumnInfo } from "../../lib/columns";
import type { AttrAgreementParams } from "./types";

export default function Controls({
  params,
  onChange,
  columns,
}: {
  params: AttrAgreementParams;
  onChange: (next: AttrAgreementParams) => void;
  columns: ColumnInfo[];
}) {
  const picker = (
    label: string,
    field: "appraiserCol" | "sampleCol" | "ratingCol" | "standardCol",
    optional = false
  ) => (
    <div>
      <label className="block font-medium mb-1">
        {label} {optional && <span className="text-gray-500">(optional)</span>}
      </label>
      <select
        className="border rounded px-2 py-1 w-full"
        value={params[field] ?? ""}
        onChange={(e) => onChange({ ...params, [field]: e.target.value || null })}
      >
        <option value="">{optional ? "None" : "Select a column…"}</option>
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
      {picker("Appraisers", "appraiserCol")}
      {picker("Samples", "sampleCol")}
      {picker("Attribute data (rating)", "ratingCol")}
      {picker("Known standard", "standardCol", true)}

      <div className="border-t pt-3">
        <label className="block font-medium mb-1">Confidence level (%)</label>
        <input
          type="number"
          step={1}
          min={50}
          max={99.9}
          className="border rounded px-2 py-1 w-24"
          value={params.confidence}
          onChange={(e) =>
            onChange({ ...params, confidence: Number(e.target.value) })
          }
        />
      </div>

      <p className="text-xs text-gray-500">
        Trials are detected automatically from repeated appraiser × sample rows.
        A balanced design is required.
      </p>
    </div>
  );
}
