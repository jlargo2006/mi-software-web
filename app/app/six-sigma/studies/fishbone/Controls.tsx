// studies/fishbone/Controls.tsx
"use client";
import React from "react";
import type { ColumnInfo } from "../../lib/columns";
import type { FishboneParams } from "./types";
import { FISHBONE_ROWS } from "./types";

export default function FishboneControls({
  params,
  onChange,
  columns,
}: {
  params: FishboneParams;
  onChange: (p: FishboneParams) => void;
  columns: ColumnInfo[];
}) {
  const setRow = (idx: number, patch: Partial<FishboneParams["rows"][number]>) => {
    const rows = params.rows.map((r, i) => (i === idx ? { ...r, ...patch } : r));
    onChange({ ...params, rows });
  };

  // Causas (celdas no vacias) de una columna, para el selector "From cause".
  const causesOf = (colName: string | null): string[] => {
    if (!colName) return [];
    const col = columns.find((c) => c.name === colName);
    if (!col) return [];
    return col.values
      .map((v) => String(v ?? "").trim())
      .filter((s) => s.length > 0);
  };

  return (
    <div className="w-full">
      {/* Title (arriba del diagrama) + Effect (cabeza del pez) */}
      <div className="mb-3 flex flex-wrap gap-4">
        <label className="flex flex-col text-xs text-gray-600">
          Title
          <input
            value={params.title}
            onChange={(e) => onChange({ ...params, title: e.target.value })}
            className="mt-1 w-64 rounded border border-gray-300 px-2 py-1 text-sm"
            placeholder="e.g. Cause-and-Effect Diagram"
          />
        </label>

        <label className="flex flex-col text-xs text-gray-600">
          Effect (fish head)
          <input
            value={params.effect}
            onChange={(e) => onChange({ ...params, effect: e.target.value })}
            className="mt-1 w-64 rounded border border-gray-300 px-2 py-1 text-sm"
            placeholder="e.g. Late deliveries"
          />
        </label>
      </div>

      <table className="border-collapse text-sm">
        <thead>
          <tr className="text-left text-xs text-gray-500">
            <th className="px-2 py-1">Branch</th>
            <th className="px-2 py-1">Causes (column)</th>
            <th className="px-2 py-1">Hangs from</th>
            <th className="px-2 py-1">From cause</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: FISHBONE_ROWS }, (_, idx) => {
            const row = params.rows[idx];
            const branch = idx + 1;
            const isSub = row.hangsFrom !== null;
            const parentRow = isSub ? params.rows[row.hangsFrom! - 1] : null;
            const parentCauses = causesOf(parentRow?.colName ?? null);
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
                        // al cambiar de padre, resetea la causa de anclaje
                        fromCause: null,
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
                <td className="px-2 py-1">
                  {/* Solo aplica si es subespina: elige la celda del padre */}
                  <select
                    value={row.fromCause ?? ""}
                    disabled={!isSub}
                    onChange={(e) =>
                      setRow(idx, { fromCause: e.target.value || null })
                    }
                    className="rounded border border-gray-300 px-2 py-1 text-sm min-w-[160px] disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    <option value="">
                      {isSub ? "-- hang from spine --" : "n/a"}
                    </option>
                    {parentCauses.map((c, i) => (
                      <option key={`${c}-${i}`} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            );
            })}
        </tbody>
      </table>
    </div>
  );
}

