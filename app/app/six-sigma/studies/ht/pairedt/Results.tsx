// app/app/six-sigma/studies/ht/pairedt/Results.tsx
"use client";
import React from "react";
import type { Data, Layout } from "plotly.js";
import ReportLayout from "../../../components/ReportLayout";
import ResultChart from "../../../components/ResultChart";
import { resolutionBins } from "../../../lib/binning";
import { ciStripTraces, ciStripLayout } from "../_shared/ciStrip";
import { ALT_SYMBOL, type HTPairedTParams, type HTPairedTResult } from "./types";
import type { TTest1Model } from "../../../lib/tTest1";

const GREEN = "#00674d";

// Simbolos como escapes ASCII: el fuente sobrevive a cualquier pegado en un
// editor o consola que no este en UTF-8, y en pantalla salen correctos.
const MU = "\u03bc";       // mu
const INFTY = "\u221e";    // infinito
const SUB0 = "\u2080";     // subindice 0
const SUB1 = "\u2081";     // subindice 1

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

export default function HTPairedTResults({
  result,
  params,
}: {
  result: HTPairedTResult;
  params: HTPairedTParams;
}) {
  if (!result.ok) {
    return (
      <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        {result.error ?? "Selecciona dos columnas para ejecutar el an\u00e1lisis."}
      </div>
    );
  }

  const r = result;
  const cl = f(r.confLevel, 0);
  const DIFF = `${MU}_difference`;

  const ciHeader =
    r.ciKind === "two"
      ? `${cl}% CI for ${DIFF}`
      : r.ciKind === "lower"
        ? `${cl}% Lower Bound for ${DIFF}`
        : `${cl}% Upper Bound for ${DIFF}`;
  const ciText =
    r.ciKind === "two"
      ? `(${f(r.ciLow, 3)}; ${f(r.ciHigh, 3)})`
      : r.ciKind === "lower"
        ? `(${f(r.ciLow, 3)}; ${INFTY})`
        : `(-${INFTY}; ${f(r.ciHigh, 3)})`;

  const d = r.differences;

  // Rango X comun a las 3 capas (grafica + banda), con margen.
  const lo = Math.min(
    ...d,
    r.performTest ? r.mu0 : Infinity,
    Number.isFinite(r.ciLow) ? r.ciLow : Infinity
  );
  const hi = Math.max(
    ...d,
    r.performTest ? r.mu0 : -Infinity,
    Number.isFinite(r.ciHigh) ? r.ciHigh : -Infinity
  );
  const pad = (hi - lo) * 0.12 || 1;
  const xRange: [number, number] = [lo - pad, hi + pad];

  // Un paired t-test es un one-sample t sobre las diferencias, asi que la
  // franja de IC se reutiliza tal cual pasandole un modelo equivalente.
  const stripModel: TTest1Model = {
    ...r,
    column: "Difference",
    values: d,
    nMissing: r.droppedRows,
    mean: r.meanDiff,
    stDev: r.sdDiff,
    seMean: r.seDiff,
  };

  const strip = (
    <Chart traces={ciStripTraces(stripModel)} layout={ciStripLayout(xRange)} h={90} />
  );

  // --- Histogram of differences ---
  const bins = resolutionBins(d);
  const histData: Data[] = [
    {
      type: "histogram",
      x: d,
      xbins: { start: bins.start, end: bins.end, size: bins.size },
      marker: { color: GREEN, line: { color: "#ffffff", width: 1 } },
      hovertemplate: "[%{x}] \u2014 %{y}<extra></extra>",
      showlegend: false,
    },
  ];
  const histLayout: Partial<Layout> = {
    margin: { l: 60, r: 30, t: 10, b: 40 },
    xaxis: { title: { text: "Differences" }, range: xRange },
    yaxis: { title: { text: "Frequency" } },
    bargap: 0.02,
  };

  // --- Individual value plot (jitter reproducible) ---
  const jitter = d.map((_, i) => {
    const x = Math.sin(i * 12.9898) * 43758.5453;
    return (x - Math.floor(x) - 0.5) * 0.5;
  });
  const ivpData: Data[] = [
    {
      type: "scatter",
      mode: "markers",
      x: d,
      y: jitter,
      marker: { color: GREEN, size: 9, symbol: "circle-open", line: { width: 2 } },
      hovertemplate: "%{x}<extra></extra>",
      showlegend: false,
    },
  ];
  const ivpLayout: Partial<Layout> = {
    margin: { l: 60, r: 30, t: 10, b: 40 },
    xaxis: { title: { text: "Differences" }, range: xRange },
    yaxis: { range: [-1, 1], visible: false, fixedrange: true },
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
    xaxis: { title: { text: "Differences" }, range: xRange },
    yaxis: { visible: false, fixedrange: true },
  };

  return (
    <ReportLayout
      template="chart-text"
      center={
        <div className="w-full space-y-6">
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
                  <th className="py-1 pr-4">Mean</th>
                  <th className="py-1 pr-4">StDev</th>
                  <th className="py-1">SE Mean</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="py-1 pr-4">{r.colX}</td>
                  <td className="py-1 pr-4">{r.n}</td>
                  <td className="py-1 pr-4">{f(r.meanX, 3)}</td>
                  <td className="py-1 pr-4">{f(r.sdX, 3)}</td>
                  <td className="py-1">{f(r.seX, 3)}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-1 pr-4">{r.colY}</td>
                  <td className="py-1 pr-4">{r.n}</td>
                  <td className="py-1 pr-4">{f(r.meanY, 3)}</td>
                  <td className="py-1 pr-4">{f(r.sdY, 3)}</td>
                  <td className="py-1">{f(r.seY, 3)}</td>
                </tr>
              </tbody>
            </table>
            {r.droppedRows > 0 && (
              <p className="mt-2 text-xs text-amber-700">
                {r.droppedRows} row(s) dropped: a value was missing in one of the
                two columns.
              </p>
            )}
          </section>

          {/* Estimation for Paired Difference */}
          <section className="mb-6">
            <h3 className="mb-2 text-sm font-semibold text-gray-800">
              Estimation for Paired Difference
            </h3>
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-300 text-left text-gray-600">
                  <th className="py-1 pr-4">Mean</th>
                  <th className="py-1 pr-4">StDev</th>
                  <th className="py-1 pr-4">SE Mean</th>
                  <th className="py-1">{ciHeader}</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="py-1 pr-4">{f(r.meanDiff, 3)}</td>
                  <td className="py-1 pr-4">{f(r.sdDiff, 3)}</td>
                  <td className="py-1 pr-4">{f(r.seDiff, 3)}</td>
                  <td className="py-1">{ciText}</td>
                </tr>
              </tbody>
            </table>
            <p className="mt-2 text-xs italic text-gray-600">
              {DIFF}: population mean of ({r.colX} - {r.colY})
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
                      H{SUB0}: {DIFF} = {f(r.mu0, 2)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1 pr-6 text-gray-600">Alternative hypothesis</td>
                    <td className="py-1">
                      H{SUB1}: {DIFF} {ALT_SYMBOL[r.alternative]} {f(r.mu0, 2)}
                    </td>
                  </tr>
                </tbody>
              </table>
              <table className="border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-300 text-left text-gray-600">
                    <th className="py-1 pr-6">T-Value</th>
                    <th className="py-1">P-Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="py-1 pr-6">{f(r.tValue, 2)}</td>
                    <td className="py-1">{f(r.pValue, 3)}</td>
                  </tr>
                </tbody>
              </table>
            </section>
          )}

          {params.showHistogram && (
            <section className="mb-6">
              <h3 className="mb-2 text-sm font-semibold text-gray-800">
                Histogram of Differences
              </h3>
              <Chart traces={histData} layout={histLayout} h={300} />
              {strip}
            </section>
          )}

          {params.showIndividualValue && (
            <section className="mb-6">
              <h3 className="mb-2 text-sm font-semibold text-gray-800">
                Individual Value Plot of Differences
              </h3>
              <Chart traces={ivpData} layout={ivpLayout} h={240} />
              {strip}
            </section>
          )}

          {params.showBoxplot && (
            <section className="mb-6">
              <h3 className="mb-2 text-sm font-semibold text-gray-800">
                Boxplot of Differences
              </h3>
              <Chart traces={boxData} layout={boxLayout} h={200} />
              {strip}
            </section>
          )}
        </div>
      }
    />
  );
}
