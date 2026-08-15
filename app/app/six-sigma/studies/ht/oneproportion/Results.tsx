// app/app/six-sigma/studies/ht/oneproportion/Results.tsx
"use client";
import React from "react";
import type { Data, Layout } from "plotly.js";
import ReportLayout from "../../../components/ReportLayout";
import ResultChart from "../../../components/ResultChart";
import { ALT_SYMBOL, type HTOneProportionResult } from "./types";

const GREEN = "#00674d";
const SUB0 = "\u2080";
const SUB1 = "\u2081";
const INFTY = "\u221e";

/** Formato con coma decimal y numero fijo de decimales. */
const fx = (v: number, dec: number): string =>
  Number.isFinite(v) ? v.toFixed(dec).replace(".", ",") : "\u2014";

/** Formato con coma decimal, sin ceros finales de relleno. */
const f = (v: number, dec = 6): string => {
  if (!Number.isFinite(v)) return "\u2014";
  const s = v.toFixed(dec).replace(/0+$/, "").replace(/\.$/, "");
  return s.replace(".", ",");
};

export default function HTOneProportionResults({
  result,
}: {
  result: HTOneProportionResult;
}) {
  if (!result.ok) {
    return (
      <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        {result.error ??
          "Introduce eventos y ensayos para ejecutar el an\u00e1lisis."}
      </div>
    );
  }

  const r = result;
  const cl = f(r.confLevel, 2);

  const ciHeader =
    r.ciKind === "two"
      ? `${cl}% CI for p`
      : r.ciKind === "lower"
        ? `${cl}% Lower Bound for p`
        : `${cl}% Upper Bound for p`;
  const ciText =
    r.ciKind === "two"
      ? `(${fx(r.ciLow, 6)}; ${fx(r.ciHigh, 6)})`
      : r.ciKind === "lower"
        ? `(${fx(r.ciLow, 6)}; 1)`
        : `(0; ${fx(r.ciHigh, 6)})`;

  // Grafico: la proporcion observada con su intervalo y la hipotetica.
  const chartData: Data[] = [
    {
      type: "scatter",
      mode: "markers",
      x: [r.p],
      y: [0],
      error_x: {
        type: "data",
        symmetric: false,
        array: [r.ciHigh - r.p],
        arrayminus: [r.p - r.ciLow],
        visible: true,
        thickness: 2,
        width: 10,
        color: "#555555",
      },
      marker: { color: GREEN, size: 13, symbol: "circle" },
      hovertemplate: "%{x:.6f}<extra></extra>",
      showlegend: false,
    } as unknown as Data,
  ];

  // Rango centrado en el intervalo, ampliado para que p0 quede visible.
  const lo = Math.min(r.ciLow, r.p0);
  const hi = Math.max(r.ciHigh, r.p0);
  const pad = (hi - lo) * 0.25 || 0.05;
  const chartLayout: Partial<Layout> = {
    margin: { l: 40, r: 30, t: 10, b: 40 },
    xaxis: {
      title: { text: "Proportion" },
      range: [Math.max(0, lo - pad), Math.min(1, hi + pad)],
    },
    yaxis: {
      range: [-1, 1],
      showticklabels: false,
      zeroline: false,
      fixedrange: true,
    },
    shapes: [
      {
        type: "line",
        x0: r.p0,
        x1: r.p0,
        yref: "paper",
        y0: 0,
        y1: 1,
        line: { color: "#b91c1c", width: 2, dash: "dash" },
      },
    ],
    annotations: [
      {
        x: r.p0,
        yref: "paper",
        y: 1,
        text: `H${SUB0}: p = ${f(r.p0, 6)}`,
        showarrow: false,
        yanchor: "bottom",
        font: { size: 11, color: "#b91c1c" },
      },
    ],
  };

  return (
    <ReportLayout
      template="chart-text"
      center={
        <div className="w-full space-y-6">
          {/* Method */}
          <section className="mb-6">
            <h3 className="mb-2 text-sm font-semibold text-gray-800">Method</h3>
            <div className="space-y-1 text-sm text-gray-700">
              <p>p: event proportion</p>
              <p>
                {r.method === "exact"
                  ? "Exact method is used for this analysis."
                  : "Normal approximation method is used for this analysis."}
              </p>
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
                  <th className="py-1 pr-4">N</th>
                  <th className="py-1 pr-4">Event</th>
                  <th className="py-1 pr-4">Sample p</th>
                  <th className="py-1">{ciHeader}</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="py-1 pr-4">{r.n}</td>
                  <td className="py-1 pr-4">{r.x}</td>
                  <td className="py-1 pr-4">{fx(r.p, 6)}</td>
                  <td className="py-1">{ciText}</td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* Test */}
          <section className="mb-6">
            <h3 className="mb-2 text-sm font-semibold text-gray-800">Test</h3>
            <table className="mb-3 border-collapse text-sm">
              <tbody>
                <tr>
                  <td className="py-1 pr-6 text-gray-600">Null hypothesis</td>
                  <td className="py-1">
                    H{SUB0}: p = {f(r.p0, 6)}
                  </td>
                </tr>
                <tr>
                  <td className="py-1 pr-6 text-gray-600">
                    Alternative hypothesis
                  </td>
                  <td className="py-1">
                    H{SUB1}: p {ALT_SYMBOL[r.alternative]} {f(r.p0, 6)}
                  </td>
                </tr>
              </tbody>
            </table>
            <table className="border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-300 text-left text-gray-600">
                  {r.method === "normal" && (
                    <th className="py-1 pr-6">Z-Value</th>
                  )}
                  <th className="py-1">P-Value</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  {r.method === "normal" && (
                    <td className="py-1 pr-6">{fx(r.zValue, 2)}</td>
                  )}
                  <td className="py-1">{fx(r.pValue, 3)}</td>
                </tr>
              </tbody>
            </table>
            {r.lowExpected && (
              <p className="mt-2 text-xs text-amber-700">
                np{SUB0} or n(1{"\u2212"}p{SUB0}) is below 5: prefer the exact
                method.
              </p>
            )}
          </section>

          <section className="mb-6">
            <h3 className="mb-2 text-sm font-semibold text-gray-800">
              Sample Proportion
            </h3>
            <div className="border border-gray-200 rounded" style={{ height: 180 }}>
              <ResultChart
                data={chartData}
                layout={{ autosize: true, ...chartLayout }}
              />
            </div>
          </section>
        </div>
      }
    />
  );
}
