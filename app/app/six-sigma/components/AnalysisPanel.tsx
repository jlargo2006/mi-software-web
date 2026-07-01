"use client";

import React, { useMemo, useState } from "react";
import type { SheetData } from "../lib/types";
import type { ToolId } from "../lib/ribbon";
import { getColumns, getColumnValues, sameData } from "../lib/columns";
import { capabilityStudy, normalityTest, normInv} from "../lib/stats";
import ResultChart from "./ResultChart";
import ReportLayout from "./ReportLayout";
import StatBlock, { fmt, fmtPPM, StatSection } from "./StatBlock";
import type { Data } from "plotly.js";

// Estado del formulario/análisis: vive en el padre
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

// Snapshot congelado de los datos de un estudio guardado
export interface StudySnapshot {
  values: number[];
  colName: string;
  sheetName: string;
}

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
  // NUEVO: modo "viendo estudio guardado"
  snapshot?: StudySnapshot | null;
  liveValues?: number[] | null; // datos vivos de la columna/hoja original del estudio
  onUpdateSnapshot?: (newValues: number[]) => void;
}


export default function AnalysisPanel({
  tool,
  sheet,
  state,
  onStateChange,
  onSaveStudy,
  snapshot = null,
  liveValues = null,
  onUpdateSnapshot,
}: AnalysisPanelProps) {
  const columns = useMemo(() => getColumns(sheet), [sheet]);
  const [dialogOpen, setDialogOpen] = useState(false);

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

  // Datos vivos de la hoja activa (para análisis nuevos)
  const liveSheetValues = getColumnValues(sheet, state.colIndex);

  // Si estamos viendo un estudio guardado, usamos su snapshot (datos congelados)
  const values = snapshot ? snapshot.values : liveSheetValues;
  const colName = snapshot
    ? snapshot.colName
    : columns[state.colIndex]?.name ?? "Column";

  // ¿Los datos actuales difieren de los originales del estudio?
  const dataDiffers =
    !!snapshot && !!liveValues && !sameData(snapshot.values, liveValues);

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

      {/* Form / controls */}
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

        {tool === "capability" ? (
          <button
            onClick={() => setDialogOpen(true)}
            className="bg-[#00674d] text-white px-4 py-2 rounded text-sm font-medium hover:bg-[#00513d]"
          >
            ⚙ Set up & Run
          </button>
        ) : (
          <button
            onClick={runAnalysis}
            className="bg-[#00674d] text-white px-4 py-2 rounded text-sm font-medium hover:bg-[#00513d]"
          >
            ▶ Run
          </button>
        )}
      </div>

      {/* Banner "datos diferentes a los originales" (estilo Minitab) */}
      {state.ran && snapshot && dataDiffers && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          <span>
            ⚠️ Los datos actuales difieren de los originales de este estudio.
          </span>
          <button
            onClick={() => liveValues && onUpdateSnapshot?.(liveValues)}
            className="shrink-0 rounded bg-amber-500 px-3 py-1 text-xs font-medium text-white hover:bg-amber-600"
          >
            ¿Actualizar con los nuevos datos?
          </button>
        </div>
      )}

      {/* Capability setup dialog (pop-up) */}
      {dialogOpen && tool === "capability" && (
        <CapabilityDialog
          state={state}
          onCancel={() => setDialogOpen(false)}
          onRun={(patch) => {
            if (liveSheetValues.length < 2) {
              alert("The selected column needs at least 2 numeric values.");
              return;
            }
            set({ ...patch, ran: true });
            setDialogOpen(false);
          }}
        />
      )}

      {/* Results */}
      {state.ran && tool === "capability" && (
        <CapabilityResults
          values={values}
          colName={colName}
          lsl={parseNum(state.lsl)}
          usl={parseNum(state.usl)}
          target={parseNum(state.target)}
          subgroupSize={state.subgroupSize}
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

          <div className="flex justify-center">
            <div
              className="border border-gray-200 rounded"
              style={{ width: "70%", aspectRatio: "4 / 3" }}
            >
              <ResultChart
                data={[histogram, overallCurve, withinCurve]}
                layout={{
                  autosize: true,
                  title: { text: `Process Capability Report — ${colName}` },
                  xaxis: { title: { text: colName }, range: [lo, hi] },
                  yaxis: { title: { text: "Density" } },
                  showlegend: true,
                  legend: { orientation: "v", x: 1.02, y: 1 },
                  shapes: specLines.map((s) => ({
                    type: "line",
                    x0: s.x,
                    x1: s.x,
                    yref: "paper",
                    y0: 0,
                    y1: 1,
                    line: { color: s.color, width: 2, dash: "dot" },
                  })),
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

  const plot = useMemo(() => {
    const sorted = [...values].sort((a, b) => a - b);
    const n = sorted.length;

    // (1) Percentiles de 0.1 a 99.9
    const tickPercents = [
      0.1, 1, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 99.9,
    ];
    const tickVals = tickPercents.map((p) => normInv(p / 100));
    const tickText = tickPercents.map((p) => String(p));

    // Posiciones de trazado (median rank) → z-score
    const pointsX: number[] = [];
    const pointsY: number[] = [];
    sorted.forEach((x, i) => {
      const p = (i + 1 - 0.3) / (n + 0.4);
      pointsX.push(x);
      pointsY.push(normInv(p));
    });

    // (2) Ajuste eje X a los datos reales (con pequeño padding)
    const xMin = sorted[0];
    const xMax = sorted[n - 1];
    const pad = (xMax - xMin) * 0.03 || 1;
    const xRange: [number, number] = [xMin - pad, xMax + pad];

    // Recta normal en z-score
    const lineX = [xRange[0], xRange[1]];
    const lineY = lineX.map((x) => (x - res.mean) / res.std);

    return { tickVals, tickText, pointsX, pointsY, lineX, lineY, xRange };
  }, [values, res.mean, res.std]);

  const pointsTrace: Data = {
    x: plot.pointsX,
    y: plot.pointsY,
    type: "scatter",
    mode: "markers",
    name: "Data",
    marker: { color: "#00674d", size: 6 },
  };

  const lineTrace: Data = {
    x: plot.lineX,
    y: plot.lineY,
    type: "scatter",
    mode: "lines",
    name: "Normal fit",
    line: { color: "#dc2626", width: 2 },
  };

  // (3) Datos a la derecha
  const rightSections: StatSection[] = [
    {
      title: "Statistics",
      rows: [
        { label: "Mean", value: fmt(res.mean, 4) },
        { label: "StDev", value: fmt(res.std, 4) },
        { label: "N", value: String(res.n) },
        { label: "AD", value: fmt(res.adStatistic, 4) },
        { label: "P-Value", value: fmt(res.pValue, 4) },
        { label: "Normal?", value: res.isNormal ? "Yes (p>0.05)" : "No (p≤0.05)" },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      <ReportLayout
        template="chart-text"
        right={<StatBlock sections={rightSections} />}
        center={
          <div className="flex justify-center">
            <div
              className="border border-gray-200 rounded"
              style={{ width: "70%", aspectRatio: "4 / 3" }}
            >
              <ResultChart
                data={[pointsTrace, lineTrace]}
                layout={{
                  autosize: true,
                  title: { text: `Probability Plot — ${colName}` },
                  xaxis: {
                    title: { text: colName },
                    range: plot.xRange, // (2)
                  },
                  yaxis: {
                    title: { text: "Percent" },
                    tickvals: plot.tickVals,
                    ticktext: plot.tickText,
                    range: [normInv(0.001), normInv(0.999)], // (1) 0.1 → 99.9
                  },
                  showlegend: true,
                  legend: { orientation: "v", x: 1.02, y: 1 },
                }}
              />
            </div>
          </div>
        }
      />

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

/* ---------- Capability setup dialog ---------- */
function CapabilityDialog({
  state,
  onCancel,
  onRun,
}: {
  state: AnalysisState;
  onCancel: () => void;
  onRun: (patch: Partial<AnalysisState>) => void;
}) {
  const [lsl, setLsl] = useState(state.lsl);
  const [usl, setUsl] = useState(state.usl);
  const [target, setTarget] = useState(state.target);
  const [subgroupSize, setSubgroupSize] = useState(state.subgroupSize || "1");

  const field = "mt-1 border border-gray-300 rounded px-2 py-1 text-sm w-full";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl w-80 p-5">
        <h3 className="text-base font-semibold text-[#00674d] mb-4">
          Capability Study — Setup
        </h3>

        <div className="space-y-3">
          <label className="flex flex-col text-xs text-gray-600">
            LSL (Lower Spec)
            <input
              value={lsl}
              onChange={(e) => setLsl(e.target.value)}
              className={field}
              placeholder="optional"
            />
          </label>
          <label className="flex flex-col text-xs text-gray-600">
            Target
            <input
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className={field}
              placeholder="optional"
            />
          </label>
          <label className="flex flex-col text-xs text-gray-600">
            USL (Upper Spec)
            <input
              value={usl}
              onChange={(e) => setUsl(e.target.value)}
              className={field}
              placeholder="optional"
            />
          </label>
          <label className="flex flex-col text-xs text-gray-600">
            Subgroup size
            <input
              type="number"
              min={1}
              value={subgroupSize}
              onChange={(e) => setSubgroupSize(e.target.value)}
              className={field}
            />
            <span className="mt-1 text-[11px] text-gray-400">
              1 = moving range (MR/d₂). &gt;1 = pooled subgroups.
            </span>
          </label>
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-sm rounded border border-gray-300 text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={() => onRun({ lsl, usl, target, subgroupSize })}
            className="px-4 py-1.5 text-sm rounded bg-[#00674d] text-white font-medium hover:bg-[#00513d]"
          >
            ▶ Run
          </button>
        </div>
      </div>
    </div>
  );
}
