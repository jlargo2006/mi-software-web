// app/app/six-sigma/studies/improve/scatterplot/Controls.tsx
"use client";
import React from "react";
import type { ColumnInfo } from "../../../lib/columns";
import {
  KIND_HAS_GROUPS,
  KIND_LABEL,
  type ImpScatterParams,
  type ScatterKind,
} from "./types";

const label = "block text-sm font-medium text-gray-700 mb-1";
const field =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#00674d] focus:outline-none focus:ring-1 focus:ring-[#00674d]";
const check = "h-4 w-4 rounded border-gray-300 text-[#00674d] focus:ring-[#00674d]";

export default function ImpScatterControls({
  params,
  onChange,
  columns,
}: {
  params: ImpScatterParams;
  onChange: (p: ImpScatterParams) => void;
  columns: ColumnInfo[];
}) {
  const set = <K extends keyof ImpScatterParams>(
    k: K,
    v: ImpScatterParams[K]
  ) => onChange({ ...params, [k]: v });

  const needsGroups = KIND_HAS_GROUPS[params.kind];

  return (
    <div className="space-y-4">
      <div>
        <label className={label}>Scatterplot type</label>
        <select
          className={field}
          value={params.kind}
          onChange={(e) => set("kind", e.target.value as ScatterKind)}
        >
          {(Object.keys(KIND_LABEL) as ScatterKind[]).map((k) => (
            <option key={k} value={k}>
              {KIND_LABEL[k]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={label}>Y variable</label>
        <select
          className={field}
          value={params.yColumn}
          onChange={(e) => set("yColumn", e.target.value)}
        >
          <option value="">Select a column...</option>
          {columns.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={label}>X variable</label>
        <select
          className={field}
          value={params.xColumn}
          onChange={(e) => set("xColumn", e.target.value)}
        >
          <option value="">Select a column...</option>
          {columns.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-gray-500">
          Y is the response, X the predictor. Rows with a missing value in
          either one are dropped.
        </p>
      </div>

      {needsGroups && (
        <div>
          <label className={label}>Categorical variable for grouping</label>
          <select
            className={field}
            value={params.groupColumn}
            onChange={(e) => set("groupColumn", e.target.value)}
          >
            <option value="">Select a column...</option>
            {columns.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="border-t border-gray-200 pt-4 space-y-3">
        <div>
          <label className={label}>Title</label>
          <input
            className={field}
            value={params.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="Scatterplot of Y vs X"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            className={check}
            checked={params.showEquation}
            onChange={(e) => set("showEquation", e.target.checked)}
          />
          Show fitted line equation and R{"\u00b2"}
        </label>
      </div>
    </div>
  );
}
