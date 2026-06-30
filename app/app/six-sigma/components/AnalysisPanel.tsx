"use client";

import React, { useMemo } from "react";
import type { SheetData } from "../lib/types";
import type { ToolId } from "../lib/ribbon";
import { getColumns, getColumnValues } from "../lib/columns";
import { capabilityStudy, normalityTest } from "../lib/stats";
import ResultChart from "./ResultChart";
import type { Data } from "plotly.js";

// Estado del formulario/análisis: ahora vive en el padre
export interface AnalysisState {
  colIndex: number;
  lsl: string;
  usl: string;
  target: string;
  ran: boolean;
}

export const EMPTY_ANALYSIS: AnalysisState = {
  colIndex: 0,
  lsl: "",
  usl: "",
  target: "",
  ran: false,
};

interface AnalysisPanelProps {
  tool: ToolId;
  sheet: SheetData;
  state: AnalysisState;
  onStateChange: (next: AnalysisState) => void;
  onSaveStudy: (study: {
    type: "capability" | "normality";
    name: string;
    params: Record<string, unknown>;
    results: Record<string, unknown>;
  }) => void;
}

export default function AnalysisPanel({
  tool,
  sheet,
  state,
  onStateChange,
  onSaveStudy,
}: AnalysisPanelProps) {
  const columns = useMemo(() => getColumns(sheet), [sheet]);

  const set = (patch: Partial<AnalysisState>) =>
    onStateChange({ ...state, ...patch });

  if (!tool) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        Select a phase tool to run an analysis. Results and charts will appear
        here.
      </div>
    );
  }

  const values = getColumnValues(sheet, state.colIndex);
  const colName = columns[state.colIndex]?.name ?? "Column";

  const parseNum = (s: string): number | null => {
    const n = parseFloat(s);
    return s.trim() !== "" && !Number.isNaN(n) ? n : null;
  };

  const runAnalysis = () => {
    if (values.length < 2) {
      alert("The selected column needs at least 2 numeric values.");
      return;
    }
    set({ ran: true });
  };

  return (
    <div className="p-4 h-full overflow-auto">
      {/* Title */}
      <h2 className="text-lg font-semibold text-[#00674d] mb-3">
        {tool === "capability" ? "Capability Study (Cp / Cpk)" : "Normality Test"}
      </h2>

      {/* Form */}
      <div className="flex flex-wrap items-end gap-3 mb-4 bg-gray-50 p-3 rounded border border-gray-200">
        <label className="flex flex-col text-xs text-gray-600">
          Data column
          <select
            value={state.colIndex}
            onChange={(e) =>
              set({ colIndex: Number(e.target.value), ran: false })
            }
            className="mt-1 border border-gray-300 rounded px-2 py-1 text-sm text-gray-800 min-w-[160px]"
          >
            {columns.map((c) => (
              <option key={c.index} value={c.index}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        {tool === "capability" && (
          <>
            <label className="flex flex-col text-xs text-gray-600">
              LSL (Lower Spec)
              <input
                value={state.lsl}
                onChange={(e) => set({ lsl: e.target.value })}
                className="mt-1 border border-gray-300 rounded px-2 py-1 text-sm w-28"
                placeholder="optional"
              />
            </label>
            <label className="flex flex-col text-xs text-gray-600">
              USL (Upper Spec)
              <input
                value={state.usl}
                onChange={(e) => set({ usl: e.target.value })}
                className="mt-1 border border-gray-300 rounded px-2 py-1 text-sm w-28"
                placeholder="optional"
              />
            </label>
            <label className="flex flex-col text-xs text-gray-600">
              Target
              <input
                value={state.target}
                onChange={(e) => set({ target: e.target.value })}
                className="mt-1 border border-gray-300 rounded px-2 py-1 text-sm w-28"
                placeholder="optional"
              />
            </label>
          </>
        )}

        <button
          onClick={runAnalysis}
          className="bg-[#00674d] text-white px-4 py-2 rounded text-sm font-medium hover:bg-[#00513d]"
        >
          ▶ Run
        </button>
      </div>

      {/* Results */}
      {state.ran && tool === "capability" && (
        <CapabilityResults
          values={values}
          colName={colName}
          lsl={parseNum(state.lsl)}
          usl={parseNum(state.usl)}
          target={parseNum(state.target)}
          onSave={onSaveStudy}
        />
      )}
      {state.ran && tool === "normality" && (
        <NormalityResults
          values={values}
          colName={colName}
          onSave={onSaveStudy}
        />
      )}
    </div>
  );
}

/* ---------- Capability results sub-component ---------- */
function CapabilityResults({
  values,
  colName,
  lsl,
  usl,
  target,
  onSave,
}: {
  values: number[];
  colName: string;
  lsl: number | null;
  usl: number | null;
  target: number | null;
  onSave: AnalysisPanelProps["onSaveStudy"];
}) {
  const res = useMemo(
    () => capabilityStudy(values, lsl, usl, target),
    [values, lsl, usl, target]
  );

  const histogram: Data = {
    x: values,
    type: "histogram",
    marker: { color: "#00674d" },
    name: colName,
  };

  const shapes =
    [
      lsl !== null && { x: lsl, color: "#dc2626", label: "LSL" },
      usl !== null && { x: usl, color: "#dc2626", label: "USL" },
      target !== null && { x: target, color: "#2563eb", label: "Target" },
    ].filter(Boolean) as { x: number; color: string; label: string }[];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
        <Stat label="N" value={res.n} />
        <Stat label="Mean" value={res.mean.toFixed(4)} />
        <Stat label="StDev" value={res.std.toFixed(4)} />
        <Stat label="Cp" value={res.cp?.toFixed(3) ?? "—"} />
        <Stat label="Cpk" value={res.cpk?.toFixed(3) ?? "—"} highlight />
        <Stat label="Cpl" value={res.cpl?.toFixed(3) ?? "—"} />
        <Stat label="Cpu" value={res.cpu?.toFixed(3) ?? "—"} />
      </div>

      <div className="h-72 border border-gray-200 rounded">
        <ResultChart
          data={[histogram]}
          layout={{
            title: { text: `Capability — ${colName}` },
            xaxis: { title: { text: colName } },
            yaxis: { title: { text: "Frequency" } },
            shapes: shapes.map((s) => ({
              type: "line",
              x0: s.x,
              x1: s.x,
              yref: "paper",
              y0: 0,
              y1: 1,
              line: { color: s.color, width: 2, dash: "dash" },
            })),
          }}
        />
      </div>

      <SaveButton
        onSave={() =>
          onSave({
            type: "capability",
            name: `Capability — ${colName}`,
            params: { colName, lsl, usl, target },
            results: { ...res },
          })
        }
      />
    </div>
  );
}

/* ---------- Normality results sub-component ---------- */
function NormalityResults({
  values,
  colName,
  onSave,
}: {
  values: number[];
  colName: string;
  onSave: AnalysisPanelProps["onSaveStudy"];
}) {
  const res = useMemo(() => normalityTest(values), [values]);

  const histogram: Data = {
    x: values,
    type: "histogram",
    marker: { color: "#00674d" },
    name: colName,
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
        <Stat label="N" value={res.n} />
        <Stat label="Mean" value={res.mean.toFixed(4)} />
        <Stat label="StDev" value={res.std.toFixed(4)} />
        <Stat label="AD" value={res.adStatistic.toFixed(4)} />
        <Stat label="P-Value" value={res.pValue.toFixed(4)} highlight />
        <Stat
          label="Normal?"
          value={res.isNormal ? "Yes (p>0.05)" : "No (p≤0.05)"}
        />
      </div>

      <div className="h-72 border border-gray-200 rounded">
        <ResultChart
          data={[histogram]}
          layout={{
            title: { text: `Normality — ${colName}` },
            xaxis: { title: { text: colName } },
            yaxis: { title: { text: "Frequency" } },
          }}
        />
      </div>

      <SaveButton
        onSave={() =>
          onSave({
            type: "normality",
            name: `Normality — ${colName}`,
            params: { colName },
            results: { ...res, sortedData: undefined },
          })
        }
      />
    </div>
  );
}

/* ---------- Small reusable UI bits ---------- */
function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded border px-3 py-2 ${
        highlight
          ? "border-[#00674d] bg-emerald-50"
          : "border-gray-200 bg-white"
      }`}
    >
      <div className="text-xs text-gray-500">{label}</div>
      <div className="font-semibold text-gray-800">{value}</div>
    </div>
  );
}

function SaveButton({ onSave }: { onSave: () => void }) {
  return (
    <button
      onClick={onSave}
      className="border border-[#00674d] text-[#00674d] px-4 py-2 rounded text-sm font-medium hover:bg-emerald-50"
    >
      💾 Save study
    </button>
  );
}
