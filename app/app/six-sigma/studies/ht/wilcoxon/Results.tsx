// app/app/six-sigma/studies/ht/wilcoxon/Results.tsx
"use client";
import React from "react";
import type { Data, Layout } from "plotly.js";
import ReportLayout from "../../../components/ReportLayout";
import ResultChart from "../../../components/ResultChart";
import { resolutionBins } from "../../../lib/binning";
import { ALT_SYMBOL, type HTWilcoxonParams, type HTWilcoxonResult } from "./types";

const GREEN = "#00674d";

// Simbolos como escapes ASCII: el fuente sobrevive a cualquier pegado en un
// editor o consola que no este en UTF-8, y en pantalla salen correctos.
const ETA = "\u03b7";    // eta
const INFTY = "\u221e";
const SUB0 = "\u2080";
const SUB1 = "\u2081";

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

/** Formato con coma decimal. */
const f = (v: number, dec = 4): string =>
  Number.isFinite(v) ? v.toFixed(dec).replace(".", ",") : "\u2014";

export default function HTWilcoxonResults({
  result,
  params,
}: {
  result: HTWilcoxonResult;
  params: HTWilcoxonParams;
}) {
  if (!result.ok) {
    return (
      <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        {result.error ?? "Selecciona una columna para ejecutar el an\u00e1lisis."}
      </div>
    );
  }

  const r = result;
  const v = r.values;

  const ciText =
    r.ciKind === "two"
      ? `(${f(r.ciLow, 3)}; ${f(r.ciHigh, 3)})`
      : r.ciKind === "lower"
        ? `(${f(r.ciLow, 3)}; ${INFTY})`
        : `(-${INFTY}; ${f(r.ciHigh, 3)})`;

  // Rango X comun a las graficas, con margen.
  const lo = Math.min(...v, r.performTest ? r.eta0 : Infinity);
  const hi = Math.max(...v, r.performTest ? r.eta0 : -Infinity);
  const pad = (hi - lo) * 0.08 || 1;
  const xRange: [number, number] = [lo - pad, hi + pad];

  // Linea vertical en la mediana hipotetica, comun a las tres graficas.
  const eta0Shape = r.performTest
    ? [
        {
          type: "line" as const,
          x0: r.eta0,
          x1: r.eta0,
          yref: "paper" as const,
          y0: 0,
          y1: 1,
          line: { color: "#b91c1c", width: 2, dash: "dash" as const },
        },
      ]
    : [];

  // --- Histogram ---
  const bins = resolutionBins(v);
  const histData: Data[] = [
    {
      type: "histogram",
      x: v,
      xbins: { start: bins.start, end: bins.end, size: bins.size },
      marker: { color: GREEN, line: { color: "#ffffff", width: 1 } },
      hovertemplate: "[%{x}] \u2014 %{y}<extra></extra>",
      showlegend: false,
    },
  ];
  const histLayout: Partial<Layout> = {
    margin: { l: 60, r: 30, t: 10, b: 40 },
    xaxis: { title: { text: r.column }, range: xRange },
    yaxis: { title: { text: "Frequency" } },
    bargap: 0.02,
    shapes: eta0Shape,
  };

  // --- Individual value plot (jitter reproducible) ---
  const jitter = v.map((_, i) => {
    const s = Math.sin(i * 12.9898) * 43758.5453;
    return (s - Math.floor(s) - 0.5) * 0.5;
  });
  const ivpData: Data[] = [
    {
      type: "scatter",
      mode: "markers",
      x: v,
      y: jitter,
      marker: { color: GREEN, size: 9, symbol: "circle-open", line: { width: 2 } },
      hovertemplate: "%{x}<extra></extra>",
      showlegend: false,
    },
  ];
  const ivpLayout: Partial<Layout> = {
    margin: { l: 60, r: 30, t: 10, b: 40 },
    xaxis: { title: { text: r.column }, range: xRange },
    yaxis: { range: [-1, 1], visible: false, fixedrange: true },
    shapes: eta0Shape,
  };

  // --- Boxplot con cuartiles precalculados al estilo Minitab ---
  // Plotly no reproduce el metodo (n+1)p, por eso se pasan los cinco numeros
  // ya calculados. Con estadisticos precalculados Plotly no dibuja atipicos:
  // van en una traza scatter aparte.
  const b = r.box;
  const boxData: Data[] = [
    {
      type: "box",
      x0: 0,
      q1: [b.q1],
      median: [b.median],
      q3: [b.q3],
      lowerfence: [b.lowerFence],
      upperfence: [b.upperFence],
      orientation: "h",
      marker: { color: GREEN },
      line: { color: GREEN },
      fillcolor: "rgba(0,103,77,0.15)",
      hoverinfo: "x",
      showlegend: false,
    } as unknown as Data,
  ];
  if (b.outliers.length) {
    boxData.push({
      type: "scatter",
      mode: "markers",
      x: b.outliers,
      y: b.outliers.map(() => 0),
      marker: { color: GREEN, symbol: "asterisk-open", size: 8 },
      hovertemplate: "%{x}<extra></extra>",
      showlegend: false,
    });
  }
  const boxLayout: Partial<Layout> = {
    margin: { l: 60, r: 30, t: 10, b: 40 },
    xaxis: { title: { text: r.column }, range: xRange },
    yaxis: { visible: false, fixedrange: true },
    shapes: eta0Shape,
  };

  return (
    <ReportLayout
      template="chart-text"
      center={
        <div className="w-full space-y-6">
          {/* Method */}
          <section className="mb-6">
            <h3 className="mb-2 text-sm font-semibold text-gray-800">Method</h3>
            <p className="text-sm text-gray-700">
              {ETA}: median of {r.column}
            </p>
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
                  <th className="py-1 pr-4">Median</th>
                  {r.performCI && (
                    <>
                      <th className="py-1 pr-4">CI for {ETA}</th>
                      <th className="py-1">Achieved Confidence</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="py-1 pr-4">{r.column}</td>
                  <td className="py-1 pr-4">{r.n}</td>
                  <td className="py-1 pr-4">{f(r.hodgesLehmann, 4)}</td>
                  {r.performCI && (
                    <>
                      <td className="py-1 pr-4">{ciText}</td>
                      <td className="py-1">{f(r.achievedConf, 2)}%</td>
                    </>
                  )}
                </tr>
              </tbody>
            </table>
            {r.nMissing > 0 && (
              <p className="mt-2 text-xs text-amber-700">
                {r.nMissing} row(s) dropped: the cell was empty or not numeric.
              </p>
            )}
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
                      H{SUB0}: {ETA} = {f(r.eta0, 0)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1 pr-6 text-gray-600">
                      Alternative hypothesis
                    </td>
                    <td className="py-1">
                      H{SUB1}: {ETA} {ALT_SYMBOL[r.alternative]} {f(r.eta0, 0)}
                    </td>
                  </tr>
                </tbody>
              </table>
              <table className="border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-300 text-left text-gray-600">
                    <th className="py-1 pr-6">Sample</th>
                    <th className="py-1 pr-6">N for Test</th>
                    <th className="py-1 pr-6">Wilcoxon Statistic</th>
                    <th className="py-1">P-Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="py-1 pr-6">{r.column}</td>
                    <td className="py-1 pr-6">{r.nTest}</td>
                    <td className="py-1 pr-6">{f(r.wStatistic, 2)}</td>
                    <td className="py-1">{f(r.pValue, 3)}</td>
                  </tr>
                </tbody>
              </table>
              {r.nZeros > 0 && (
                <p className="mt-2 text-xs text-amber-700">
                  {r.nZeros} observation(s) equal to the hypothesized median were
                  excluded from the test.
                </p>
              )}
            </section>
          )}

          {params.showHistogram && (
            <section className="mb-6">
              <h3 className="mb-2 text-sm font-semibold text-gray-800">
                Histogram of {r.column}
              </h3>
              <Chart traces={histData} layout={histLayout} h={300} />
            </section>
          )}

          {params.showIndividualValue && (
            <section className="mb-6">
              <h3 className="mb-2 text-sm font-semibold text-gray-800">
                Individual Value Plot of {r.column}
              </h3>
              <Chart traces={ivpData} layout={ivpLayout} h={240} />
            </section>
          )}

          {params.showBoxplot && (
            <section className="mb-6">
              <h3 className="mb-2 text-sm font-semibold text-gray-800">
                Boxplot of {r.column}
              </h3>
              <Chart traces={boxData} layout={boxLayout} h={200} />
            </section>
          )}
        </div>
      }
    />
  );
}
