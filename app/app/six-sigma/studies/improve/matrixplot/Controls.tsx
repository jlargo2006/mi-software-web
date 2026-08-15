// app/app/six-sigma/studies/improve/matrixplot/Controls.tsx
"use client";
import React from "react";
import type { ColumnInfo } from "../../../lib/columns";
import {
  KIND_LABEL,
  type ImpMatrixParams,
  type MatrixKind,
  type SmootherKind,
} from "./types";

const label = "block text-sm font-medium text-gray-700 mb-1";
const field =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#00674d] focus:outline-none focus:ring-1 focus:ring-[#00674d]";
const check =
  "h-4 w-4 rounded border-gray-300 text-[#00674d] focus:ring-[#00674d]";
const radio = "h-4 w-4 border-gray-300 text-[#00674d] focus:ring-[#00674d]";

/** Lista de casillas con desplazamiento: el orden de marcado se conserva. */
function VarPicker({
  title,
  selected,
  columns,
  onToggle,
}: {
  title: string;
  selected: string[];
  columns: ColumnInfo[];
  onToggle: (name: string) => void;
}) {
  return (
    <div>
      <span className={label}>
        {title}
        {selected.length > 0 && (
          <span className="ml-1 font-normal text-gray-500">
            ({selected.length})
          </span>
        )}
      </span>
      <div className="max-h-44 overflow-y-auto rounded-md border border-gray-300 p-2 space-y-1">
        {columns.length === 0 && (
          <p className="text-xs text-gray-400">No columns available.</p>
        )}
        {columns.map((c) => (
          <label
            key={c.index}
            className="flex items-center gap-2 text-sm text-gray-700"
          >
            <input
              type="checkbox"
              className={check}
              checked={selected.includes(c.name)}
              onChange={() => onToggle(c.name)}
            />
            {c.name}
          </label>
        ))}
      </div>
    </div>
  );
}

export default function ImpMatrixControls({
  params,
  onChange,
  columns,
}: {
  params: ImpMatrixParams;
  onChange: (p: ImpMatrixParams) => void;
  columns: ColumnInfo[];
}) {
  const set = <K extends keyof ImpMatrixParams>(
    k: K,
    v: ImpMatrixParams[K]
  ) => onChange({ ...params, [k]: v });

  const toggle = (key: "variables" | "yVariables" | "xVariables") => (
    name: string
  ) => {
    const cur = params[key];
    set(key, cur.includes(name) ? cur.filter((s) => s !== name) : [...cur, name]);
  };

  return (
    <div className="space-y-4">
      <div>
        <span className={label}>Type</span>
        <div className="space-y-2">
          {(Object.keys(KIND_LABEL) as MatrixKind[]).map((k) => (
            <label
              key={k}
              className="flex items-center gap-2 text-sm text-gray-700"
            >
              <input
                type="radio"
                name="mx-kind"
                className={radio}
                checked={params.kind === k}
                onChange={() => set("kind", k)}
              />
              {KIND_LABEL[k]}
            </label>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        {params.kind === "matrix" ? (
          <VarPicker
            title="Graph variables"
            selected={params.variables}
            columns={columns}
            onToggle={toggle("variables")}
          />
        ) : (
          <div className="space-y-3">
            <VarPicker
              title="Y variables"
              selected={params.yVariables}
              columns={columns}
              onToggle={toggle("yVariables")}
            />
            <VarPicker
              title="X variables"
              selected={params.xVariables}
              columns={columns}
              onToggle={toggle("xVariables")}
            />
          </div>
        )}
        <p className="mt-1 text-xs text-gray-500">
          {params.kind === "matrix"
            ? "Every pair is plotted both ways; the diagonal holds the names."
            : "One panel per Y and X combination."}
        </p>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <label className={label}>Group by (optional)</label>
        <select
          className={field}
          value={params.groupColumn}
          onChange={(e) => set("groupColumn", e.target.value)}
        >
          <option value="">-- none --</option>
          {columns.map((c) => (
            <option key={c.index} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-gray-500">
          Colours the points by category. Up to 12 groups.
        </p>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <span className={label}>Smoother</span>
        <div className="space-y-2">
          {(
            [
              ["none", "None"],
              ["lowess", "Lowess"],
            ] as [SmootherKind, string][]
          ).map(([k, txt]) => (
            <label
              key={k}
              className="flex items-center gap-2 text-sm text-gray-700"
            >
              <input
                type="radio"
                name="mx-smooth"
                className={radio}
                checked={params.smoother === k}
                onChange={() => set("smoother", k)}
              />
              {txt}
            </label>
          ))}
        </div>
        {params.smoother === "lowess" && (
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div>
              <label className={label}>Degree of smoothing</label>
              <input
                className={field}
                value={params.smootherF}
                onChange={(e) => set("smootherF", e.target.value)}
                placeholder="0,5"
                inputMode="decimal"
              />
            </div>
            <div>
              <label className={label}>Steps</label>
              <input
                className={field}
                value={params.smootherSteps}
                onChange={(e) => set("smootherSteps", e.target.value)}
                placeholder="2"
                inputMode="numeric"
              />
            </div>
          </div>
        )}
        <p className="mt-1 text-xs text-gray-500">
          The smoother follows the data without assuming a shape. Raise the
          degree for a flatter curve, lower it to track local detail.
        </p>
      </div>
    </div>
  );
}
