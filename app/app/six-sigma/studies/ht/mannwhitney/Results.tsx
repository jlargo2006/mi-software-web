// app/app/six-sigma/studies/ht/mannwhitney/Results.tsx
"use client";
import React from "react";
import type { Data, Layout } from "plotly.js";
import ReportLayout from "../../../components/ReportLayout";
import ResultChart from "../../../components/ResultChart";
import { resolutionBins } from "../../../lib/binning";
import {
  ALT_SYMBOL,
  type HTMannWhitneyParams,
  type HTMannWhitneyResult,
  type MWBox,
} from "./types";

const GREEN = "#00674d";
const BLUE = "#1f6fb2";

// Simbolos como escapes ASCII: el fuente sobrevive a cualquier pegado en un
// editor o consola que no este en UTF-8, y en pantalla salen correctos.
const ETA = "\u03b7";
const INFTY = "\u221e";
const SUB0 = "\u2080";
const SUB1 = "\u2081";
const SUB2 = "\u2082";

const Chart = ({
  traces,
  layout,
  h,
}: {
  traces: Data[];
  layout: Partial<Layout>;
  h: number;
}) => (
  <div className="border border-gray-200 rounded" style={{ height: h }}>
    <ResultChart data={traces} layout={{ autosize: true, ...layout }} />
  </div>
);

/**
 * Formato con coma decimal, sin ceros finales de relleno. Minitab ajusta los
 * decimales a la resolucion de los datos: con enteros imprime 739 y no
 * 739,0000, pero con flotantes conserva 14,8411.
 */
const f = (v: number, dec = 4): string => {
  if (!Number.isFinite(v)) return "\u2014";
  const s = v.toFixed(dec).replace(/0+$/, "").replace(/\.$/, "");
  return s.replace(".", ",");
};

/** Traza de boxplot con los cinco numeros ya calculados al estilo Minitab. */
const boxTraces = (b: MWBox, y: number, color: string, name: string): Data[] => {
  const out: Data[] = [
    {
      type: "box",
      y0: y,
      q1: [b.q1],
      median: [b.median],
      q3: [b.q3],
      lowerfence: [b.lowerFence],
      upperfence: [b.upperFence],
      orientation: "h",
      marker: { color },
      line: { color },
      fillcolor: "rgba(0,103,77,0.12)",
      hoverinfo: "x",
      name,
      showlegend: false,
    } as unknown as Data,
  ];
  if (b.outliers.length) {
    out.push({
      type: "scatter",
      mode: "markers",
      x: b.outliers,
      y: b.outliers.map(() => y),
      marker: { color, symbol: "asterisk-open", size: 8 },
      hovertemplate: "%{x}<extra></extra>",
      showlegend: false,
    });
  }
  return out;
};

export default function HTMannWhitneyResults({
  result,
  params,
}: {
  result: HTMannWhitneyResult;
  params: HTMannWhitneyParams;
}) {
  if (!result.ok) {
    return (
      <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        {result.error ?? "Selecciona dos columnas para ejecutar el an\u00e1lisis."}
      </div>
    );
  }

  const r = result;
  const DIFF = `${ETA}${SUB1} - ${ETA}${SUB2}`;
  const cl = f(r.confLevel, 2);

  const ciHeader =
    r.ciKind === "two"
      ? "CI for Difference"
      : r.ciKind === "lower"
        ? "Lower Bound for Difference"
        : "Upper Bound for Difference";
  const ciText =
    r.ciKind === "two"
      ? `(${f(r.ciLow, 6)}; ${f(r.ciHigh, 6)})`
      : r.ciKind === "lower"
        ? `(${f(r.ciLow, 6)}; ${INFTY})`
        : `(-${INFTY}; ${f(r.ciHigh, 6)})`;

  // Rango X comun a las dos muestras, con margen.
  const all = [...r.valuesX, ...r.valuesY];
  const lo = Math.min(...all);
  const hi = Math.max(...all);
  const pad = (hi - lo) * 0.08 || 1;
  const xRange: [number, number] = [lo - pad, hi + pad];

  // --- Histogramas superpuestos ---
  const bins = resolutionBins(all);
  const histData: Data[] = [
    {
      type: "histogram",
      x: r.valuesX,
      xbins: { start: bins.start, end: bins.end, size: bins.size },
      marker: { color: GREEN, line: { color: "#ffffff", width: 1 } },
      opacity: 0.65,
      name: r.colX,
      hovertemplate: "[%{x}] \u2014 %{y}<extra></extra>",
    },
    {
      type: "histogram",
      x: r.valuesY,
      xbins: { start: bins.start, end: bins.end, size: bins.size },
      marker: { color: BLUE, line: { color: "#ffffff", width: 1 } },
      opacity: 0.65,
      name: r.colY,
      hovertemplate: "[%{x}] \u2014 %{y}<extra></extra>",
    },
  ];
  const histLayout = {
    margin: { l: 60, r: 30, t: 10, b: 40 },
    xaxis: { title: { text: "Data" }, range: xRange },
    yaxis: { title: { text: "Frequency" } },
    barmode: "overlay",
    bargap: 0.02,
    legend: { orientation: "h", y: 1.12 },
  };

  // --- Individual value plot (jitter reproducible) ---
  const jit = (n: number, seed: number) =>
    Array.from({ length: n }, (_, i) => {
      const s = Math.sin((i + seed) * 12.9898) * 43758.5453;
      return (s - Math.floor(s) - 0.5) * 0.35;
    });
  const ivpData: Data[] = [
    {
      type: "scatter",
      mode: "markers",
      x: r.valuesX,
      y: jit(r.n1, 1).map((j) => 1 + j),
      marker: { color: GREEN, size: 8, symbol: "circle-open", line: { width: 2 } },
      name: r.colX,
      hovertemplate: "%{x}<extra></extra>",
      showlegend: false,
    },
    {
      type: "scatter",
      mode: "markers",
      x: r.valuesY,
      y: jit(r.n2, 500).map((j) => 0 + j),
      marker: { color: BLUE, size: 8, symbol: "circle-open", line: { width: 2 } },
      name: r.colY,
      hovertemplate: "%{x}<extra></extra>",
      showlegend: false,
    },
  ];
  const ivpLayout: Partial<Layout> = {
    margin: { l: 90, r: 30, t: 10, b: 40 },
    xaxis: { title: { text: "Data" }, range: xRange },
    yaxis: {
      range: [-0.7, 1.7],
      tickvals: [0, 1],
      ticktext: [r.colY, r.colX],
      fixedrange: true,
    },
  };

  // --- Boxplots enfrentados ---
  const boxData: Data[] = [
    ...boxTraces(r.boxY, 0, BLUE, r.colY),
    ...boxTraces(r.boxX, 1, GREEN, r.colX),
  ];
  const boxLayout: Partial<Layout> = {
    margin: { l: 90, r: 30, t: 10, b: 40 },
    xaxis: { title: { text: "Data" }, range: xRange },
    yaxis: {
      range: [-0.7, 1.7],
      tickvals: [0, 1],
      ticktext: [r.colY, r.colX],
      fixedrange: true,
    },
  };

  const missing = r.nMissingX + r.nMissingY;

  return (
    <ReportLayout
      template="chart-text"
      center={
        <div className="w-full space-y-6">
          {/* Method */}
          <section className="mb-6">
            <h3 className="mb-2 text-sm font-semibold text-gray-800">Method</h3>
            <div className="space-y-1 text-sm text-gray-700">
              <p>
                {ETA}
                {SUB1}: median of {r.colX}
              </p>
              <p>
                {ETA}
                {SUB2}: median of {r.colY}
              </p>
              <p>Difference: {DIFF}</p>
            </div>
          </section>

          {/* Descriptive Statistics */}
          <section className="mb-6">
            <h3 className="mb-2 text-sm font-semibold text-gray-800">
              Descriptive Statistics
            </h3>
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-300 text-left text-gray-600">
                  <th className="py-1 pr-4">Sample</th>
                  <th className="py-1 pr-4">N</th>
                  <th className="py-1">Median</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="py-1 pr-4">{r.colX}</td>
                  <td className="py-1 pr-4">{r.n1}</td>
                  <td className="py-1">{f(r.medianX, 4)}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-1 pr-4">{r.colY}</td>
                  <td className="py-1 pr-4">{r.n2}</td>
                  <td className="py-1">{f(r.medianY, 4)}</td>
                </tr>
              </tbody>
            </table>
            {missing > 0 && (
              <p className="mt-2 text-xs text-amber-700">
                {missing} cell(s) dropped: empty or not numeric.
              </p>
            )}
          </section>

          {/* Estimation for Difference */}
          <section className="mb-6">
            <h3 className="mb-2 text-sm font-semibold text-gray-800">
              Estimation for Difference
            </h3>
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-300 text-left text-gray-600">
                  <th className="py-1 pr-4">Difference</th>
                  <th className="py-1 pr-4">{ciHeader}</th>
                  <th className="py-1">Achieved Confidence</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="py-1 pr-4">{f(r.hlDifference, 5)}</td>
                  <td className="py-1 pr-4">{ciText}</td>
                  <td className="py-1">{f(r.achievedConf, 2)}%</td>
                </tr>
              </tbody>
            </table>
            <p className="mt-2 text-xs italic text-gray-600">
              Hodges-Lehmann estimate: median of all {r.n1} {"\u00d7"} {r.n2}{" "}
              differences ({r.colX} - {r.colY}). Requested level: {cl}%.
            </p>
          </section>

          {/* Test */}
          {r.performTest && (
            <section className="mb-6">
              <h3 className="mb-2 text-sm font-semibold text-gray-800">Test</h3>
              <table className="mb-3 border-collapse text-sm">
                <tbody>
                  <tr>
                    <td className="py-1 pr-6 text-gray-600">Null hypothesis</td>
                    <td className="py-1">
                      H{SUB0}: {DIFF} = {f(r.eta0, 4)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1 pr-6 text-gray-600">
                      Alternative hypothesis
                    </td>
                    <td className="py-1">
                      H{SUB1}: {DIFF} {ALT_SYMBOL[r.alternative]} {f(r.eta0, 4)}
                    </td>
                  </tr>
                </tbody>
              </table>
              <table className="border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-300 text-left text-gray-600">
                    {r.tiesCorrected && <th className="py-1 pr-6">Method</th>}
                    <th className="py-1 pr-6">W-Value</th>
                    <th className="py-1">P-Value</th>
                  </tr>
                </thead>
                <tbody>
                  {r.tiesCorrected ? (
                    <>
                      <tr className="border-b border-gray-200">
                        <td className="py-1 pr-6">Not adjusted for ties</td>
                        <td className="py-1 pr-6">{f(r.wValue, 2)}</td>
                        <td className="py-1">{f(r.pNotAdj, 3)}</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-1 pr-6">Adjusted for ties</td>
                        <td className="py-1 pr-6">{f(r.wValue, 2)}</td>
                        <td className="py-1">{f(r.pAdj, 3)}</td>
                      </tr>
                    </>
                  ) : (
                    <tr className="border-b border-gray-200">
                      <td className="py-1 pr-6">{f(r.wValue, 2)}</td>
                      <td className="py-1">{f(r.pAdj, 3)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>
          )}

          {params.showHistogram && (
            <section className="mb-6">
              <h3 className="mb-2 text-sm font-semibold text-gray-800">
                Histogram of {r.colX} and {r.colY}
              </h3>
              <Chart traces={histData} layout={histLayout} h={300} />
            </section>
          )}

          {params.showIndividualValue && (
            <section className="mb-6">
              <h3 className="mb-2 text-sm font-semibold text-gray-800">
                Individual Value Plot
              </h3>
              <Chart traces={ivpData} layout={ivpLayout} h={240} />
            </section>
          )}

          {params.showBoxplot && (
            <section className="mb-6">
              <h3 className="mb-2 text-sm font-semibold text-gray-800">Boxplot</h3>
              <Chart traces={boxData} layout={boxLayout} h={220} />
            </section>
          )}
        </div>
      }
    />
  );
}
