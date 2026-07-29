// app/app/six-sigma/studies/ht/onesamplet/Results.tsx
"use client";
import React from "react";
import type { Data, Layout } from "plotly.js";
import ReportLayout from "../../_shared/ReportLayout";
import ResultChart from "../../_shared/ResultChart";
import { niceBins, dotBins } from "../../../lib/binning";
import { percentile, buildContext, median } from "../../../lib/statistics";
import { ciStripTraces, ciStripLayout } from "../_shared/ciStrip";
import { ALT_SYMBOL, type HT1SampleTParams, type HT1SampleTResult } from "./types";

const GREEN = "#00674d";

/** Formato con coma decimal. */
const f = (v: number, dec = 4): string =>
  Number.isFinite(v) ? v.toFixed(dec).replace(".", ",") : "—";

export default function HT1SampleTResults({
  result,
  params,
}: {
  result: HT1SampleTResult;
  params: HT1SampleTParams;
}) {
  if (!result.ok) {
    return (
      <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        {result.error ?? "Selecciona una columna para ejecutar el análisis."}
      </div>
    );
  }

  const r = result;
  const cl = f(r.confLevel, 0).replace(",", ",");
  const ciHeader =
    r.ciKind === "two"
      ? `${cl}% CI for μ`
      : r.ciKind === "lower"
        ? `${cl}% Lower Bound for μ`
        : `${cl}% Upper Bound for μ`;
  const ciText =
    r.ciKind === "two"
      ? `(${f(r.ciLow)}; ${f(r.ciHigh)})`
      : r.ciKind === "lower"
        ? f(r.ciLow)
        : f(r.ciHigh);

  // Rango X común a las 4 capas (gráfica + banda), con margen.
  const lo = Math.min(...r.values, r.performTest ? r.mu0 : Infinity, r.ciLow || Infinity);
  const hi = Math.max(...r.values, r.performTest ? r.mu0 : -Infinity, r.ciHigh || -Infinity);
  const pad = (hi - lo) * 0.12 || 1;
  const xRange: [number, number] = [lo - pad, hi + pad];

  const strip = (
    <ResultChart
      data={ciStripTraces(r)}
      layout={ciStripLayout(xRange)}
      title=""
    />
  );

  // --- Histogram ---
  const bins = niceBins(r.values);
  const histData: Data[] = [
    {
      type: "histogram",
      x: r.values,
      xbins: { start: bins.start, end: bins.end, size: bins.size },
      marker: { color: GREEN, line: { color: "#ffffff", width: 1 } },
      hovertemplate: "[%{x}] — %{y}<extra></extra>",
      showlegend: false,
    },
  ];
  const histLayout: Partial<Layout> = {
    height: 300,
    margin: { l: 60, r: 30, t: 10, b: 40 },
    xaxis: { title: { text: r.column }, range: xRange },
    yaxis: { title: { text: "Frequency" } },
    bargap: 0.02,
  };

  // --- Individual value plot (jitter reproducible) ---
  const jitter = r.values.map((_, i) => {
    const x = Math.sin(i * 12.9898) * 43758.5453;
    return (x - Math.floor(x) - 0.5) * 0.5;
  });
  const ivpData: Data[] = [
    {
      type: "scatter",
      mode: "markers",
      x: r.values,
      y: jitter,
      marker: { color: GREEN, size: 9, symbol: "circle-open", line: { width: 2 } },
      hovertemplate: "%{x}<extra></extra>",
      showlegend: false,
    },
  ];
  const ivpLayout: Partial<Layout> = {
    height: 240,
    margin: { l: 60, r: 30, t: 10, b: 40 },
    xaxis: { title: { text: r.column }, range: xRange },
    yaxis: { range: [-1, 1], visible: false, fixedrange: true },
  };

  // --- Boxplot (cuartiles Minitab vía percentile) ---
  const ctx = buildContext(r.values);
  const boxData: Data[] = [
    {
      type: "box",
      x: r.values,
      q1: [percentile(ctx, 0.25)],
      median: [median(ctx)],
      q3: [percentile(ctx, 0.75)],
      boxpoints: "outliers",
      marker: { color: GREEN },
      line: { color: GREEN },
      fillcolor: "rgba(0,103,77,0.15)",
      orientation: "h",
      hoverinfo: "x",
      showlegend: false,
    },
  ];
  const boxLayout: Partial<Layout> = {
    height: 200,
    margin: { l: 60, r: 30, t: 10, b: 40 },
    xaxis: { title: { text: r.column }, range: xRange },
    yaxis: { visible: false, fixedrange: true },
  };

  return (
    <ReportLayout title="1-Sample t Test">
      {/* Descriptive Statistics */}
      <section className="mb-6">
        <h3 className="mb-2 text-sm font-semibold text-gray-800">
          Descriptive Statistics
        </h3>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-300 text-left text-gray-600">
              <th className="py-1 pr-4">N</th>
              <th className="py-1 pr-4">Mean</th>
              <th className="py-1 pr-4">StDev</th>
              <th className="py-1 pr-4">SE Mean</th>
              <th className="py-1">{ciHeader}</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="py-1 pr-4">{r.n}</td>
              <td className="py-1 pr-4">{f(r.mean)}</td>
              <td className="py-1 pr-4">{f(r.stDev)}</td>
              <td className="py-1 pr-4">{f(r.seMean)}</td>
              <td className="py-1">{ciText}</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-2 text-xs italic text-gray-600">
          μ: population mean of {r.column}
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
                <td className="py-1">H₀: μ = {f(r.mu0, 2)}</td>
              </tr>
              <tr>
                <td className="py-1 pr-6 text-gray-600">Alternative hypothesis</td>
                <td className="py-1">
                  H₁: μ {ALT_SYMBOL[r.alternative]} {f(r.mu0, 2)}
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
            Histogram of {r.column}
          </h3>
          <ResultChart data={histData} layout={histLayout} title="" />
          {strip}
        </section>
      )}

      {params.showIndividualValue && (
        <section className="mb-6">
          <h3 className="mb-2 text-sm font-semibold text-gray-800">
            Individual Value Plot of {r.column}
          </h3>
          <ResultChart data={ivpData} layout={ivpLayout} title="" />
          {strip}
        </section>
      )}

      {params.showBoxplot && (
        <section className="mb-6">
          <h3 className="mb-2 text-sm font-semibold text-gray-800">
            Boxplot of {r.column}
          </h3>
          <ResultChart data={boxData} layout={boxLayout} title="" />
          {strip}
        </section>
      )}
    </ReportLayout>
  );
}
