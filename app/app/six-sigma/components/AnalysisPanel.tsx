"use client";

import React, { useMemo, useState } from "react";
import type { SheetData, Cell } from "../lib/types";
import type { ToolId } from "../lib/ribbon";
import { getColumns, getColumnValues, sameData } from "../lib/columns";
import { capabilityStudy, normalityTest, normInv } from "../lib/stats";
import type { SaveStudyInput, StudyColumn, SavedStudy } from "../lib/studies";
import ResultChart from "./ResultChart";
import ReportLayout from "./ReportLayout";
import StatBlock, { fmt, fmtPPM, StatSection } from "./StatBlock";
import type { Data } from "plotly.js";
import DescriptiveStatsPanel from "./DescriptiveStatsPanel";
import type { StatKey } from "../lib/descriptiveStats";
import StudyControls, { StudyMode } from "./StudyControls";

// La frontera de datos habla Cell[]; convertimos a number[] solo al calcular.
const toNumeric = (values: Cell[]): number[] =>
  values.map(Number).filter((n) => !Number.isNaN(n));

// Estado del formulario/analisis: vive en el padre
export interface AnalysisState {
  colIndex: number;
  lsl: string;
  usl: string;
  target: string;
  subgroupSize: string;
  ran: boolean;
  runValues: Cell[];   // datos congelados al pulsar Run
  runColName: string;    // nombre de columna congelado al pulsar Run
}

export const EMPTY_ANALYSIS: AnalysisState = {
  colIndex: 0,
  lsl: "",
  usl: "",
  target: "",
  subgroupSize: "1",
  ran: false,
  runValues: [],
  runColName: "",
};

interface AnalysisPanelProps {
  tool: ToolId;
  sheet: SheetData;
  state: AnalysisState;
  onStateChange: (next: AnalysisState) => void;
  onSaveStudy: (study: SaveStudyInput) => void;
  study?: SavedStudy | null;
  mode: StudyMode;                          // unica fuente de verdad: "edit" | "view"
  snapshot?: StudyColumn | null;
  liveValues?: Cell[] | null;
  onUpdateSnapshot?: (newValues:Cell[]) => void;
}

export default function AnalysisPanel({
  tool,
  sheet,
  state,
  onStateChange,
  onSaveStudy,
  study = null,
  mode,
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

  // Descriptive: su propio flujo (multi-columna). Recibe el mismo `mode`.
  if (tool === "descriptive") {
    return (
      <DescriptiveStatsPanel
        sheet={sheet}
        mode={mode}
        onSaveStudy={onSaveStudy}
        savedParams={
          study?.type === "descriptive"
            ? (study.params as {
                selectedColNames?: string[];
                selectedStats?: StatKey[];
              })
            : null
        }
        savedCols={
          study?.type === "descriptive" ? study.snapshot.cols : null
        }
      />
    );
  }

  // Modo "viendo estudio guardado" derivado de la unica fuente de verdad
  const viewing = mode === "view";

  // Datos vivos de la hoja activa (para analisis nuevos, ANTES del primer Run)
  const liveSheetValues = getColumnValues(sheet, state.colIndex);

  // Prioridad de datos a pintar:
  //   1) snapshot de estudio guardado (datos congelados al guardar)
  //   2) datos congelados en el ultimo Run (state.runValues)
  //   3) datos vivos de la hoja (solo antes del primer Run)
  const values = snapshot
    ? snapshot.values
    : state.ran
    ? state.runValues
    : liveSheetValues;

  const colName = snapshot
    ? snapshot.name
    : state.ran
    ? state.runColName
    : columns[state.colIndex]?.name ?? "Column";

  // Los datos actuales difieren de los originales del estudio?
  const dataDiffers =
    !!snapshot && !!liveValues && !sameData(snapshot.values, liveValues);

  const parseNum = (s: string): number | null => {
    const n = parseFloat(s);
    return s.trim() !== "" && !Number.isNaN(n) ? n : null;
  };

  const runAnalysis = () => {
    if (liveSheetValues.length < 2) {
      alert("The selected column needs at least 2 numeric values.");
      return;
    }
    set({
      ran: true,
      runValues: liveSheetValues,
      runColName: columns[state.colIndex]?.name ?? "Column",
    });
  };

  return (
    <div className="p-4 h-full overflow-auto">
      {/* Title */}
      <h2 className="text-lg font-semibold text-[#00674d] mb-3">
        {tool === "capability" ? "Capability Study (Cp / Cpk)" : "Normality Test"}
      </h2>

      {/* Controles de configuracion: genericos via StudyControls (ocultos en "view") */}
      <StudyControls mode={mode}>
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
            {"\u2699"} Set up & Run
          </button>
        ) : (
          <button
            onClick={runAnalysis}
            className="bg-[#00674d] text-white px-4 py-2 rounded text-sm font-medium hover:bg-[#00513d]"
          >
            {"\u25B6"} Run
          </button>
        )}
      </StudyControls>

      {/* Banner "los datos difieren": tambien es control -> oculto en "view" */}
      {!viewing && state.ran && snapshot && dataDiffers && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          <span>
            {"\u26A0\uFE0F"} The current data differs from this study&apos;s original data.
          </span>
          <button
            onClick={() => liveValues && onUpdateSnapshot?.(liveValues)}
            className="shrink-0 rounded bg-amber-500 px-3 py-1 text-xs font-medium text-white hover:bg-amber-600"
          >
            Update with the new data?
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
            set({
              ...patch,
              ran: true,
              runValues: liveSheetValues,
              runColName: columns[state.colIndex]?.name ?? "Column",
            });
            setDialogOpen(false);
          }}
        />
      )}

      {/* Results (siempre se pintan al ver estudio guardado o tras Run) */}
      {(state.ran || viewing) && tool === "capability" && (
        <CapabilityResults
          values={values}
          colName={colName}
          lsl={parseNum(state.lsl)}
          usl={parseNum(state.usl)}
          target={parseNum(state.target)}
          subgroupSize={parseInt(state.subgroupSize, 10) || 1}
          onSave={onSaveStudy}
          mode={mode}
        />
      )}

      {(state.ran || viewing) && tool === "normality" && (
        <NormalityResults
          values={values}
          colName={colName}
          onSave={onSaveStudy}
          mode={mode}
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
  mode,
}: {
  values: Cell[];
  colName: string;
  lsl: number | null;
  usl: number | null;
  target: number | null;
  subgroupSize: number;
  onSave: (study: SaveStudyInput) => void;
  mode: StudyMode;
}) {
  const nums = useMemo(() => toNumeric(values), [values]);   // <- conversion
  
  const res = useMemo(
    () => capabilityStudy(nums, lsl, usl, target, subgroupSize),
    [nums, lsl, usl, target, subgroupSize]
  );

  // Rango del eje X (datos + limites)
  const xs = [...nums, lsl, usl, target].filter(
    (v): v is number => v !== null && v !== undefined
  );
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const pad = (xMax - xMin) * 0.1 || 1;
  const lo = xMin - pad;
  const hi = xMax + pad;

  // Generador de curva normal (PDF)
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

  // Histograma (densidad para que case con las curvas)
  const histogram: Data = {
    x: nums,
    type: "histogram",
    histnorm: "probability density",
    marker: {
      color: "#9fd5c4",
      line: { color: "#000000", width: 1 },
    },
    name: colName,
    opacity: 0.85,
  };

  // Curvas Overall (continua) y Within (discontinua)
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

  // Lineas verticales de limites
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
                  title: { text: `Process Capability Report - ${colName}` },
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

      {/* "Save study" es un control: generico via StudyControls (oculto en "view") */}
      <StudyControls mode={mode} boxed={false}>
        <SaveButton
          onSave={() =>
            onSave({
              type: "capability",
              name: `Capability - ${colName}`,
              params: { colName, lsl, usl, target, subgroupSize },
              results: { ...res, data: undefined },
              cols: [{ name: colName, values }],
            })
          }
        />
      </StudyControls>
    </div>
  );
}

/* ---------- Normality results sub-component ---------- */
function NormalityResults({
  values,
  colName,
  onSave,
  mode,
}: {
  values: Cell[];
  colName: string;
  onSave: (study: SaveStudyInput) => void;
  mode: StudyMode;
}) {
  const nums = useMemo(() => toNumeric(values), [values]);   // <- conversion
  
  const res = useMemo(() => normalityTest(nums), [nums]);

  const plot = useMemo(() => {
    const sorted = [...nums].sort((a, b) => a - b);
    const n = sorted.length;

    const tickPercents = [
      0.1, 1, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 99.9,
    ];
    const tickVals = tickPercents.map((p) => normInv(p / 100));
    const tickText = tickPercents.map((p) => String(p));

    const pointsX: number[] = [];
    const pointsY: number[] = [];
    sorted.forEach((x, i) => {
      const p = (i + 1 - 0.3) / (n + 0.4);
      pointsX.push(x);
      pointsY.push(normInv(p));
    });

    const xMin = sorted[0];
    const xMax = sorted[n - 1];
    const pad = (xMax - xMin) * 0.03 || 1;
    const xRange: [number, number] = [xMin - pad, xMax + pad];

    const lineX = [xRange[0], xRange[1]];
    const lineY = lineX.map((x) => (x - res.mean) / res.std);

    return { tickVals, tickText, pointsX, pointsY, lineX, lineY, xRange };
  }, [nums, res.mean, res.std]);

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

  const rightSections: StatSection[] = [
    {
      title: "Statistics",
      rows: [
        { label: "Mean", value: fmt(res.mean, 4) },
        { label: "StDev", value: fmt(res.std, 4) },
        { label: "N", value: String(res.n) },
        { label: "AD", value: fmt(res.adStatistic, 4) },
        { label: "P-Value", value: fmt(res.pValue, 4) },
        { label: "Normal?", value: res.isNormal ? "Yes (p>0.05)" : "No (p\u22640.05)" },
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
                  title: { text: `Probability Plot - ${colName}` },
                  xaxis: {
                    title: { text: colName },
                    range: plot.xRange,
                  },
                  yaxis: {
                    title: { text: "Percent" },
                    tickvals: plot.tickVals,
                    ticktext: plot.tickText,
                    range: [normInv(0.001), normInv(0.999)],
                  },
                  showlegend: true,
                  legend: { orientation: "v", x: 1.02, y: 1 },
                }}
              />
            </div>
          </div>
        }
      />

      {/* "Save study" es un control: generico via StudyControls (oculto en "view") */}
      <StudyControls mode={mode} boxed={false}>
        <SaveButton
          onSave={() =>
            onSave({
              type: "normality",
              name: `Normality - ${colName}`,
              params: { colName },
              results: { ...res, sortedData: undefined },
              cols: [{ name: colName, values }],
            })
          }
        />
      </StudyControls>
    </div>
  );
}

function SaveButton({ onSave }: { onSave: () => void }) {
  return (
    <button
      onClick={onSave}
      className="border border-[#00674d] text-[#00674d] px-4 py-2 rounded text-sm font-medium hover:bg-emerald-50"
    >
      {"\uD83D\uDCBE"}  Save study
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
          Capability Study - Setup
        </h3>

        <div className="space-y-3">
          <label className="block text-xs text-gray-600">
            Lower Spec Limit (LSL)
            <input
              value={lsl}
              onChange={(e) => setLsl(e.target.value)}
              className={field}
              placeholder="e.g. 9.5"
            />
          </label>

          <label className="block text-xs text-gray-600">
            Upper Spec Limit (USL)
            <input
              value={usl}
              onChange={(e) => setUsl(e.target.value)}
              className={field}
              placeholder="e.g. 10.5"
            />
          </label>

          <label className="block text-xs text-gray-600">
            Target (optional)
            <input
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className={field}
              placeholder="e.g. 10.0"
            />
          </label>

          <label className="block text-xs text-gray-600">
            Subgroup size
            <input
              value={subgroupSize}
              onChange={(e) => setSubgroupSize(e.target.value)}
              className={field}
              placeholder="1"
            />
          </label>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-1.5 text-sm rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={() => onRun({ lsl, usl, target, subgroupSize })}
            className="px-4 py-1.5 text-sm rounded bg-[#00674d] text-white font-medium hover:bg-[#00513d]"
          >
            {"\u25B6"} Run
          </button>
        </div>
      </div>
    </div>
  );
}
