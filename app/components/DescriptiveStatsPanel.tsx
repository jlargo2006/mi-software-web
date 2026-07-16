// components/DescriptiveStatsPanel.tsx
"use client";

import React, { useMemo, useState } from "react";
import DescriptiveStatsDialog from "./DescriptiveStatsDialog";
import {
  STAT_DEFS, StatKey, DEFAULT_KEYS, computeSelected, modeCount,
} from "../lib/descriptiveStats";
import { buildContext } from "../lib/statistics";

const BRAND = "#00674d";

interface Sheet {
  headers: string[];
  rows: (number | string | "")[][];
}

interface Props {
  sheet: Sheet;
}

export default function DescriptiveStatsPanel({ sheet }: Props) {
  const [selectedCols, setSelectedCols] = useState<Set<number>>(new Set());
  const [selectedStats, setSelectedStats] = useState<Set<StatKey>>(new Set(DEFAULT_KEYS));
  const [showDialog, setShowDialog] = useState(false);

  // Columnas que tienen cabecera
  const availableCols = sheet.headers
    .map((h, i) => ({ name: h?.trim() || `C${i + 1}`, index: i }))
    .filter((_, i) => String(sheet.headers[i] ?? "").trim() !== "");

  const toggleCol = (i: number) =>
    setSelectedCols((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });

  // Estadísticos activos en orden fijo (el de STAT_DEFS)
  const activeDefs = STAT_DEFS.filter((d) => selectedStats.has(d.key));
  const showModeCount = selectedStats.has("mode");

  const results = useMemo(() => {
    return [...selectedCols].sort((a, b) => a - b).map((colIdx) => {
      const raw = sheet.rows.map((r) => r[colIdx] ?? "");
      const values = computeSelected(raw, selectedStats);
      const ctx = buildContext(raw);
      return {
        name: sheet.headers[colIdx]?.trim() || `C${colIdx + 1}`,
        values,
        modeN: showModeCount ? modeCount(ctx) : null,
      };
    });
  }, [selectedCols, selectedStats, sheet, showModeCount]);

  return (
    <div className="p-4">
      <h2 className="mb-4 text-lg font-semibold text-gray-800">Descriptive Statistics</h2>

      {/* Selección de columnas */}
      <div className="mb-4">
        <div className="mb-2 text-sm font-medium text-gray-600">Variables</div>
        <div className="flex flex-wrap gap-2">
          {availableCols.length === 0 && (
            <span className="text-sm text-gray-400">Add headers to your columns first.</span>
          )}
          {availableCols.map((c) => (
            <label
              key={c.index}
              className={`flex items-center gap-1.5 rounded border px-2.5 py-1 text-sm cursor-pointer ${
                selectedCols.has(c.index)
                  ? "border-transparent text-white"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
              style={selectedCols.has(c.index) ? { backgroundColor: BRAND } : undefined}
            >
              <input
                type="checkbox"
                className="hidden"
                checked={selectedCols.has(c.index)}
                onChange={() => toggleCol(c.index)}
              />
              {c.name}
            </label>
          ))}
        </div>
      </div>

      <div className="mb-5 flex gap-2">
        <button
          onClick={() => setShowDialog(true)}
          className="rounded border border-gray-300 px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
        >
          Statistics…
        </button>
      </div>

      {/* Tabla de resultados */}
      {results.length > 0 && activeDefs.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr style={{ backgroundColor: BRAND, color: "white" }}>
                <th className="border px-3 py-2 text-left">Variable</th>
                {activeDefs.map((d) => (
                  <th key={d.key} className="border px-3 py-2 text-right whitespace-nowrap">
                    {d.label}
                  </th>
                ))}
                {showModeCount && (
                  <th className="border px-3 py-2 text-right whitespace-nowrap">N for Mode</th>
                )}
              </tr>
            </thead>
            <tbody>
              {results.map((row) => (
                <tr key={row.name} className="odd:bg-white even:bg-gray-50">
                  <td className="border px-3 py-2 font-medium text-gray-800">{row.name}</td>
                  {activeDefs.map((d) => (
                    <td key={d.key} className="border px-3 py-2 text-right tabular-nums">
                      {row.values[d.key] ?? "*"}
                    </td>
                  ))}
                  {showModeCount && (
                    <td className="border px-3 py-2 text-right tabular-nums">{row.modeN}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-sm text-gray-400">
          Select at least one variable and one statistic to see results.
        </div>
      )}

      {showDialog && (
        <DescriptiveStatsDialog
          initial={selectedStats}
          onApply={(sel) => {
            setSelectedStats(sel);
            setShowDialog(false);
          }}
          onClose={() => setShowDialog(false)}
        />
      )}
    </div>
  );
}
