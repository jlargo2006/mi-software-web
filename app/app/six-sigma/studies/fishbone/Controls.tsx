// studies/fishbone/Controls.tsx
"use client";
import React from "react";
import type { ColumnInfo } from "../../lib/columns";
import type { FishboneParams } from "./types";
import { FISHBONE_ROWS } from "./types";

const BRAND = "#00674d";

export default function FishboneControls({
  params,
  onChange,
  columns,
  onRun,
}: {
  params: FishboneParams;
  onChange: (p: FishboneParams) => void;
  columns: ColumnInfo[];
  onRun: () => void;
}) {
  const setRow = (idx: number, patch: Partial<FishboneParams["rows"][number]>) => {
    const rows = params.rows.map((r, i) => (i === idx ? { ...r, ...patch } : r));
    onChange({ ...params, rows });
  };

  return (
    <div className="w-full">
      <label className="mb-3 flex flex-col text-xs text-gray-600">
        Effect (fish head)
        <input
          value={params.effect}
          onChange={(e) => onChange({ ...params, effect: e.target.value })}
          className="mt-1 w-64 rounded border border-gray-300 px-2 py-1 text-sm"
          placeholder="e.g. Late deliveries"
        />
      </label>

      <table className="border-collapse text-sm">
        <thead>
          <tr className="text-left text-xs text-gray-500">
            <th className="px-2 py-1">Branch</th>
            <th className="px-2 py-1">Causes (column)</th>
            <th className="px-2 py-1">Hangs from</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: FISHBONE_ROWS }, (_, idx) => {
            const row = params.rows[idx];
            const branch = idx + 1;
            return (
              <tr key={branch}>
                <td className="px-2 py-1 font-medium text-gray-700">{branch}</td>
                <td className="px-2 py-1">
                  <select
                    value={row.colName ?? ""}
                    onChange={(e) =>
                      setRow(idx, { colName: e.target.value || null })
                    }
                    className="rounded border border-gray-300 px-2 py-1 text-sm min-w-[160px]"
                  >
                    <option value="">-- none --</option>
                    {columns.map((c) => (
                      <option key={c.index} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-2 py-1">
                  <select
                    value={row.hangsFrom ?? ""}
                    onChange={(e) =>
                      setRow(idx, {
                        hangsFrom: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    className="rounded border border-gray-300 px-2 py-1 text-sm"
                  >
                    <option value="">(main spine)</option>
                    {/* Solo branches anteriores: evita ciclos */}
                    {Array.from({ length: idx }, (_, k) => k + 1).map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <button
        onClick={onRun}
        className="mt-3 rounded px-4 py-2 text-sm font-medium text-white"
        style={{ backgroundColor: BRAND }}
      >
        {"\u25B6"} Run
      </button>
    </div>
  );
}
