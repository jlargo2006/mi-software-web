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
  subgroupSize,
  onSave,
}: {
  values: number[];
  colName: string;
  lsl: number | null;
  usl: number | null;
  target: number | null;
  subgroupSize: number;
  onSave: AnalysisPanelProps["onSaveStudy"];
}) {
  const res = useMemo(
    () => capabilityStudy(values, lsl, usl, target, subgroupSize),
    [values, lsl, usl, target, subgroupSize]
  );

  // --- Rango del eje X (datos + límites) ---
  const xs = [...values, lsl, usl, target].filter(
    (v): v is number => v !== null && v !== undefined
  );
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const pad = (xMax - xMin) * 0.1 || 1;
  const lo = xMin - pad;
  const hi = xMax + pad;

  // --- Generador de curva normal (PDF) ---
  const STEPS = 200;
  const gaussian = (s: number): { x: number[]; y: number[] } => {
    const x: number[] = [];
    const y: number[] = [];
    if (s <= 0) return { x, y };
    const coef = 1 / (s * Math.sqrt(2 * Math.PI));
    for (let i = 0; i <= STEPS; i++) {
      const xi = lo + ((hi - lo) * i) / STEPS;
      x.push(xi);
      y.push(coef * Math.exp(-((xi - res.mean) ** 2) / (2 * s * s)));
    }
    return { x, y };
  };

  const overall = gaussian(res.stdOverall);
  const within = gaussian(res.stdWithin);

  // --- Histograma (densidad para que case con las curvas) ---
  const histogram: Data = {
    x: values,
    type: "histogram",
    histnorm: "probability density",
    marker: {
      color: "#9fd5c4",
      line: { color: "#000000", width: 1 }, // contorno negro (punto 5)
    },
    name: colName,
    opacity: 0.85,
  };

  // --- Curvas Overall (continua) y Within (discontinua) (punto 1) ---
  const overallCurve: Data = {
    x: overall.x,
    y: overall.y,
    type: "scatter",
    mode: "lines",
    name: "Overall",
    line: { color: "#00674d", width: 2 },
  };
  const withinCurve: Data = {
    x: within.x,
    y: within.y,
    type: "scatter",
    mode: "lines",
    name: "Within",
    line: { color: "#dc2626", width: 2, dash: "dash" },
  };

  // --- Líneas verticales de límites ---
  const specLines = [
    lsl !== null && { x: lsl, color: "#111827", label: "LSL" },
    usl !== null && { x: usl, color: "#111827", label: "USL" },
    target !== null && { x: target, color: "#2563eb", label: "Target" },
  ].filter(Boolean) as { x: number; color: string; label: string }[];

  // Columna izquierda
  const leftSections: StatSection[] = [
    {
      title: "Process Data",
      rows: [
        { label: "LSL", value: fmt(res.lsl) },
        { label: "Target", value: fmt(res.target) },
        { label: "USL", value: fmt(res.usl) },
        { label: "Sample Mean", value: fmt(res.mean) },
        { label: "Sample N", value: String(res.n) },
        { label: "StDev(Overall)", value: fmt(res.stdOverall) },
        { label: "StDev(Within)", value: fmt(res.stdWithin) },
      ],
    },
    {
      title: "Observed Performance",
      rows: [
        { label: "PPM < LSL", value: fmtPPM(res.ppmObsLSL) },
        { label: "PPM > USL", value: fmtPPM(res.ppmObsUSL) },
        { label: "PPM Total", value: fmtPPM(res.ppmObsTotal) },
      ],
    },
    {
      title: "Exp. Overall Performance",
      rows: [
        { label: "PPM < LSL", value: fmtPPM(res.ppmExpOverallLSL) },
        { label: "PPM > USL", value: fmtPPM(res.ppmExpOverallUSL) },
        { label: "PPM Total", value: fmtPPM(res.ppmExpOverallTotal) },
      ],
    },
    {
      title: "Exp. Within Performance",
      rows: [
        { label: "PPM < LSL", value: fmtPPM(res.ppmExpWithinLSL) },
        { label: "PPM > USL", value: fmtPPM(res.ppmExpWithinUSL) },
        { label: "PPM Total", value: fmtPPM(res.ppmExpWithinTotal) },
      ],
    },
  ];

  // Columna derecha
  const rightSections: StatSection[] = [
    {
      title: "Overall Capability",
      rows: [
        { label: "Z.Bench", value: fmt(res.zBenchOverall) },
        { label: "Z.LSL", value: fmt(res.zLSLOverall) },
        { label: "Z.USL", value: fmt(res.zUSLOverall) },
        { label: "Pp", value: fmt(res.pp, 2) },
        { label: "PPL", value: fmt(res.ppl, 2) },
        { label: "PPU", value: fmt(res.ppu, 2) },
        { label: "Ppk", value: fmt(res.ppk, 2) },
      ],
    },
    {
      title: "Potential (Within) Capability",
      rows: [
        { label: "Z.Bench", value: fmt(res.zBenchWithin) },
        { label: "Z.LSL", value: fmt(res.zLSLWithin) },
        { label: "Z.USL", value: fmt(res.zUSLWithin) },
        { label: "Cp", value: fmt(res.cp, 2) },
        { label: "CPL", value: fmt(res.cpl, 2) },
        { label: "CPU", value: fmt(res.cpu, 2) },
        { label: "Cpk", value: fmt(res.cpk, 2) },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      <ReportLayout
        template="text-chart-text"
        left={<StatBlock sections={leftSections} />}
        right={<StatBlock sections={rightSections} />}
        center={
          // Proporción 3 ancho : 4 alto (punto 4)
          <div
            className="border border-gray-200 rounded w-full"
            style={{ aspectRatio: "3 / 4" }}
          >
            <ResultChart
              data={[histogram, overallCurve, withinCurve]}
              layout={{
                title: { text: `Process Capability Report — ${colName}` },
                xaxis: { title: { text: colName }, range: [lo, hi] },
                yaxis: { title: { text: "Density" } },
                showlegend: true,
                legend: { orientation: "h", y: -0.2 },
                shapes: specLines.map((s) => ({
                  type: "line",
                  x0: s.x,
                  x1: s.x,
                  yref: "paper",
                  y0: 0,
                  y1: 1,
                  line: { color: s.color, width: 2, dash: "dot" },
                })),
                // Etiquetas LSL/USL/Target encima de las líneas (punto 3)
                annotations: specLines.map((s) => ({
                  x: s.x,
                  yref: "paper",
                  y: 1.02,
                  text: s.label,
                  showarrow: false,
                  font: { color: s.color, size: 11 },
                })),
              }}
            />
          </div>
        }
      />

      <SaveButton
        onSave={() =>
          onSave({
            type: "capability",
            name: `Capability — ${colName}`,
            params: { colName, lsl, usl, target, subgroupSize },
            results: { ...res, data: undefined },
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
