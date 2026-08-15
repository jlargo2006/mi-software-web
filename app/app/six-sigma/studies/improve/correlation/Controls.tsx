// app/app/six-sigma/studies/improve/correlation/Controls.tsx
"use client";
import React from "react";
import type { ColumnInfo } from "../../../lib/columns";
import {
  CORR_ALT_LABEL,
  CORR_LABEL,
  type CorrAlternative,
  type CorrType,
  type ImpCorrParams,
} from "./types";

const label = "block text-sm font-medium text-gray-700 mb-1";
const field =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#00674d] focus:outline-none focus:ring-1 focus:ring-[#00674d]";
const check =
  "h-4 w-4 rounded border-gray-300 text-[#00674d] focus:ring-[#00674d]";

export default function ImpCorrControls({
  params,
  onChange,
  columns,
}: {
  params: ImpCorrParams;
  onChange: (p: ImpCorrParams) => void;
  columns: ColumnInfo[];
}) {
  const set = <K extends keyof ImpCorrParams>(k: K, v: ImpCorrParams[K]) =>
    onChange({ ...params, [k]: v });

  /** Alterna una columna manteniendo el orden de seleccion. */
  const toggle = (name: string) => {
    const cur = params.columns;
    set(
      "columns",
      cur.includes(name) ? cur.filter((c) => c !== name) : [...cur, name]
    );
  };

  const move = (name: string, delta: number) => {
    const cur = [...params.columns];
    const i = cur.indexOf(name);
    const j = i + delta;
    if (i < 0 || j < 0 || j >= cur.length) return;
    [cur[i], cur[j]] = [cur[j], cur[i]];
    set("columns", cur);
  };

  return (
    <div className="space-y-4">
      <div>
        <span className={label}>Variables</span>
        <div className="max-h-52 overflow-y-auto rounded-md border border-gray-300 divide-y divide-gray-100">
          {columns.length === 0 && (
            <p className="px-3 py-2 text-xs text-gray-500">
              No columns available.
            </p>
          )}
          {columns.map((c) => (
            <label
              key={c.name}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              <input
                type="checkbox"
                className={check}
                checked={params.columns.includes(c.name)}
                onChange={() => toggle(c.name)}
              />
              {c.name}
            </label>
          ))}
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Two or more numeric columns. Every pair is correlated using its own
          complete observations.
        </p>
      </div>

      {params.columns.length > 1 && (
        <div>
          <span className={label}>Order</span>
          <ol className="rounded-md border border-gray-300 divide-y divide-gray-100">
            {params.columns.map((name, i) => (
              <li
                key={name}
                className="flex items-center justify-between px-3 py-1.5 text-sm"
              >
                <span className="text-gray-700">
                  {i + 1}. {name}
                </span>
                <span className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => move(name, -1)}
                    disabled={i === 0}
                    className="px-1.5 text-gray-500 disabled:opacity-30"
                    aria-label={`Move ${name} up`}
                  >
                    {"\u2191"}
                  </button>
                  <button
                    type="button"
                    onClick={() => move(name, 1)}
                    disabled={i === params.columns.length - 1}
                    className="px-1.5 text-gray-500 disabled:opacity-30"
                    aria-label={`Move ${name} down`}
                  >
                    {"\u2193"}
                  </button>
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="border-t border-gray-200 pt-4 space-y-3">
        <div>
          <label className={label}>Correlation type</label>
          <select
            className={field}
            value={params.corrType}
            onChange={(e) => set("corrType", e.target.value as CorrType)}
          >
            {(Object.keys(CORR_LABEL) as CorrType[]).map((k) => (
              <option key={k} value={k}>
                {CORR_LABEL[k]}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Pearson measures linear association. Spearman works on ranks and
            captures any monotonic relationship.
          </p>
        </div>

        <div>
          <label className={label}>Alternative hypothesis</label>
          <select
            className={field}
            value={params.alternative}
            onChange={(e) =>
              set("alternative", e.target.value as CorrAlternative)
            }
          >
            {(Object.keys(CORR_ALT_LABEL) as CorrAlternative[]).map((k) => (
              <option key={k} value={k}>
                {CORR_ALT_LABEL[k]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={label}>Confidence level (%)</label>
          <input
            className={field}
            value={params.confidenceLevel}
            onChange={(e) => set("confidenceLevel", e.target.value)}
            placeholder="95,0"
          />
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <span className={label}>Display</span>
        <div className="space-y-2">
          {(
            [
              ["showPValues", "P-values"],
              ["showCI", "Confidence interval for the correlation"],
              ["showMatrixPlot", "Matrix plot"],
            ] as const
          ).map(([k, txt]) => (
            <label
              key={k}
              className="flex items-center gap-2 text-sm text-gray-700"
            >
              <input
                type="checkbox"
                className={check}
                checked={params[k]}
                onChange={(e) => set(k, e.target.checked)}
              />
              {txt}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
