// components/DescriptiveStatsPanel.tsx
"use client";

import React, { useMemo, useState } from "react";
import DescriptiveStatsDialog from "./DescriptiveStatsDialog";
import {
  STAT_DEFS, StatKey, DEFAULT_KEYS, computeSelected, modeCount,
  getRawColumn,
} from "../lib/descriptiveStats";
import { buildContext } from "../lib/statistics";
import { getColumns, getColumnValues } from "../lib/columns";
import type { SheetData, Cell } from "../lib/types";
import type { SaveStudyInput } from "../lib/studies";
import StudyControls, { StudyMode } from "./StudyControls";

const BRAND = "#00674d";

interface Props {
  sheet: SheetData;
  mode: StudyMode;                          // unica fuente de verdad: "edit" | "view"
  onSaveStudy?: (study: SaveStudyInput) => void;
  // Params restaurados para recomputar (por NOMBRE)
  savedParams?: {
    selectedColNames?: string[];
    selectedStats?: StatKey[];
  } | null;
  // Snapshot congelado (independiente de la hoja activa)
  savedCols?: { name: string; values: number[] }[] | null;
}

export default function DescriptiveStatsPanel({
  sheet,
  mode,
  onSaveStudy,
  savedParams = null,
  savedCols = null,
}: Props) {
  const availableCols = getColumns(sheet);

  // Modo "viendo estudio guardado" derivado de la unica fuente de verdad
  const viewing = mode === "view";

  // Si venimos de un estudio guardado, reconstruye la seleccion POR NOMBRE
  const initialCols = useMemo(() => {
    if (!savedParams?.selectedColNames) return new Set<number>();
    const set = new Set<number>();
    for (const name of savedParams.selectedColNames) {
      const col = availableCols.find((c) => c.name === name);
      if (col) set.add(col.index);
    }
    return set;
  }, [savedParams, availableCols]);

  const [selectedCols, setSelectedCols] = useState<Set<number>>(initialCols);
  const [selectedStats, setSelectedStats] = useState<Set<StatKey>>(
    new Set(savedParams?.selectedStats ?? DEFAULT_KEYS)
  );
  const [showDialog, setShowDialog] = useState(false);

  const toggleCol = (i: number) =>
    setSelectedCols((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });

  const activeDefs = STAT_DEFS.filter((d) => selectedStats.has(d.key));
  const showModeCount = selectedStats.has("mode");

  // Resultados:
  //   - Viendo estudio guardado -> se calculan del snapshot CONGELADO
  //   - Analisis nuevo          -> se calculan EN VIVO de la hoja activa
  const results = useMemo(() => {
    if (viewing && savedCols) {
      return savedCols.map((col) => {
        const raw = col.values as Cell[];
        const values = computeSelected(raw, selectedStats);
        const ctx = buildContext(raw);
        return {
          name: col.name,
          values,
          modeN: showModeCount ? modeCount(ctx) : null,
        };
      });
    }
    return [...selectedCols].sort((a, b) => a - b).map((colIdx) => {
      const raw = getRawColumn(sheet, colIdx);
      const values = computeSelected(raw, selectedStats);
      const ctx = buildContext(raw);
      return {
        name: sheet.headers[colIdx]?.trim() || `C${colIdx + 1}`,
        values,
        modeN: showModeCount ? modeCount(ctx) : null,
      };
    });
  }, [viewing, savedCols, selectedCols, selectedStats, sheet, showModeCount]);

  const handleSaveStudy = () => {
    if (!onSaveStudy || results.length === 0) return;
    const chosen = [...selectedCols].sort((a, b) => a - b);
    const colNames = chosen.map(
      (i) => availableCols.find((c) => c.index === i)?.name ?? `C${i + 1}`
    );
    onSaveStudy({
      type: "descriptive",
      name: `Descriptive - ${colNames.join(", ")}`,
      // params = configuracion reproducible (POR NOMBRE, no por indice)
      params: {
        selectedColNames: colNames,
        selectedStats: [...selectedStats],
      },
      // cols = snapshot de datos crudos
      cols: chosen.map((i) => ({
        name: availableCols.find((c) => c.index === i)?.name ?? `C${i + 1}`,
        values: getColumnValues(sheet, i),
      })),
    });
  };

  return (
    <div className="p-4">
      <h2 className="mb-4 text-lg font-semibold text-gray-800">Descriptive Statistics</h2>

      {/* Selector de variables: control -> generico via StudyControls (oculto en "view") */}
      <StudyControls mode={mode} boxed={false}>
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
      </StudyControls>

      {/* Botones de configuracion: control -> generico via StudyControls (oculto en "view") */}
      <StudyControls mode={mode} boxed={false}>
        <div className="mb-5 flex gap-2">
          <button
            onClick={() => setShowDialog(true)}
            className="rounded border border-gray-300 px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
          >
            Statistics{"\u2026"}
          </button>

          <button
            onClick={handleSaveStudy}
            disabled={results.length === 0 || activeDefs.length === 0}
            className="rounded px-4 py-1.5 text-sm font-medium text-white disabled:opacity-40"
            style={{ backgroundColor: BRAND }}
          >
            {"\uD83D\uDCBE"} Save study
          </button>
        </div>
      </StudyControls>

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
