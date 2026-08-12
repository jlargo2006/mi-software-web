// app/app/six-sigma/studies/ht/chisqassociation/Controls.tsx
"use client";
import React from "react";
import type { ColumnInfo } from "../../../lib/columns";
import {
  MODE_LABEL,
  type CSDataMode,
  type HTChiSqAssocParams,
} from "./types";

const label = "block text-sm font-medium text-gray-700 mb-1";
const field =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#00674d] focus:outline-none focus:ring-1 focus:ring-[#00674d]";
const check = "h-4 w-4 rounded border-gray-300 text-[#00674d] focus:ring-[#00674d]";

export default function HTChiSqAssocControls({
  params,
  onChange,
  columns,
}: {
  params: HTChiSqAssocParams;
  onChange: (p: HTChiSqAssocParams) => void;
  columns: ColumnInfo[];
}) {
  const set = <K extends keyof HTChiSqAssocParams>(
    k: K,
    v: HTChiSqAssocParams[K]
  ) => onChange({ ...params, [k]: v });

  /** Alterna una columna manteniendo el orden de seleccion. */
  const toggleTableColumn = (name: string) => {
    const cur = params.tableColumns;
    set(
      "tableColumns",
      cur.includes(name) ? cur.filter((c) => c !== name) : [...cur, name]
    );
  };

  const move = (name: string, delta: number) => {
    const cur = [...params.tableColumns];
    const i = cur.indexOf(name);
    const j = i + delta;
    if (i < 0 || j < 0 || j >= cur.length) return;
    [cur[i], cur[j]] = [cur[j], cur[i]];
    set("tableColumns", cur);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className={label}>Data arrangement</label>
        <select
          className={field}
          value={params.mode}
          onChange={(e) => set("mode", e.target.value as CSDataMode)}
        >
          {(Object.keys(MODE_LABEL) as CSDataMode[]).map((k) => (
            <option key={k} value={k}>
              {MODE_LABEL[k]}
            </option>
          ))}
        </select>
      </div>

      {params.mode === "summarized" ? (
        <>
          <div>
            <span className={label}>Columns containing the table</span>
            <div className="max-h-52 overflow-y-auto rounded-md border border-gray-300 divide-y divide-gray-100">
              {columns.length === 0 && (
                <p className="px-3 py-2 text-xs text-gray-500">
                  No columns available.
                </p>
              )}
              {columns.map((c) => {
                const sel = params.tableColumns.includes(c.name);
                return (
                  <label
                    key={c.name}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      className={check}
                      checked={sel}
                      onChange={() => toggleTableColumn(c.name)}
                    />
                    {c.name}
                  </label>
                );
              })}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              One worksheet column per table column. Each worksheet row is a
              table row. Empty cells count as zero.
            </p>
          </div>

          {params.tableColumns.length > 0 && (
            <div>
              <span className={label}>Column order</span>
              <ol className="rounded-md border border-gray-300 divide-y divide-gray-100">
                {params.tableColumns.map((name, i) => (
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
                        disabled={i === params.tableColumns.length - 1}
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

          <div>
            <label className={label}>Row labels (optional)</label>
            <select
              className={field}
              value={params.rowLabelColumn}
              onChange={(e) => set("rowLabelColumn", e.target.value)}
            >
              <option value="">Use 1, 2, 3...</option>
              {columns.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </>
      ) : (
        <>
          <div>
            <label className={label}>Rows: categorical variable</label>
            <select
              className={field}
              value={params.rowFactorColumn}
              onChange={(e) => set("rowFactorColumn", e.target.value)}
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
            <label className={label}>Columns: categorical variable</label>
            <select
              className={field}
              value={params.colFactorColumn}
              onChange={(e) => set("colFactorColumn", e.target.value)}
            >
              <option value="">Select a column...</option>
              {columns.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              One row per observation. Rows with a blank category are dropped.
            </p>
          </div>
        </>
      )}

      <div className="border-t border-gray-200 pt-4 space-y-3">
        <div>
          <label className={label}>Row title</label>
          <input
            className={field}
            value={params.rowTitle}
            onChange={(e) => set("rowTitle", e.target.value)}
            placeholder="Worksheet rows"
          />
        </div>
        <div>
          <label className={label}>Column title</label>
          <input
            className={field}
            value={params.colTitle}
            onChange={(e) => set("colTitle", e.target.value)}
            placeholder="Worksheet columns"
          />
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <span className={label}>Cell contents</span>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-gray-500">
            <input type="checkbox" className={check} checked disabled />
            Count
          </label>
          {(
            [
              ["showExpected", "Expected count"],
              ["showResiduals", "Residual"],
              ["showStdResiduals", "Standardized residual"],
              ["showContribution", "Contribution to Chi-Square"],
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
