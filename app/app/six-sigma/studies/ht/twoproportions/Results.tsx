// app/app/six-sigma/studies/ht/twoproportions/Results.tsx
"use client";
import React from "react";
import type { Data, Layout } from "plotly.js";
import ReportLayout from "../../../components/ReportLayout";
import ResultChart from "../../../components/ResultChart";
import { ALT_SYMBOL, type HTTwoProportionsResult } from "./types";

const GREEN = "#00674d";
const BLUE = "#1f6fb2";
const SUB0 = "\u2080";
const SUB1 = "\u2081";
const SUB2 = "\u2082";
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

export default function HTTwoProportionsResults({
  result,
}: {
  result: HTTwoProportionsResult;
}) {
  if (!result.ok) {
    return (
      <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        {result.error ??
          "Introduce eventos y ensayos de las dos muestras para ejecutar el an\u00e1lisis."}
      </div>
    );
  }

  const r = result;
  const DIFF = `p${SUB1} - p${SUB2}`;
  const cl = f(r.confLevel, 2);

  const ciHeader =
    r.ciKind === "two"
      ? `${cl}% CI for Difference`
      : r.ciKind === "lower"
        ? `${cl}% Lower Bound for Difference`
        : `${cl}% Upper Bound for Difference`;
  const ciText =
    r.ciKind === "two"
      ? `(${fx(r.ciLow, 6)}; ${fx(r.ciHigh, 6)})`
      : r.ciKind === "lower"
        ? `(${fx(r.ciLow, 6)}; ${INFTY})`
        : `(-${INFTY}; ${fx(r.ciHigh, 6)})`;

  // Grafico: las dos proporciones con su intervalo individual de Wald.
  const zc = 1.959963984540054; // 95% fijo para el grafico
  const se1 = Math.sqrt((r.p1 * (1 - r.p1)) / r.n1);
  const se2 = Math.sqrt((r.p2 * (1 - r.p2)) / r.n2);
  const chartData: Data[] = [
    {
      type: "scatter",
      mode: "markers",
      x: [r.p1, r.p2],
      y: [1, 0],
      error_x: {
        type: "data",
        array: [zc * se1, zc * se2],
        visible: true,
        thickness: 2,
        width: 8,
        color: "#555555",
      },
      marker: { color: [GREEN, BLUE], size: 12, symbol: "circle" },
      hovertemplate: "%{x:.4f}<extra></extra>",
      showlegend: false,
    } as unknown as Data,
  ];
  const chartLayout: Partial<Layout> = {
    margin: { l: 110, r: 30, t: 10, b: 40 },
    xaxis: { title: { text: "Proportion" }, range: [0, 1] },
    yaxis: {
      range: [-0.6, 1.6],
      tickvals: [0, 1],
      ticktext: [r.label2, r.label1],
      fixedrange: true,
    },
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
              <p>
                p{SUB1}: proportion where {r.label1} = Event
              </p>
              <p>
                p{SUB2}: proportion where {r.label2} = Event
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
                  <th className="py-1 pr-4">Event</th>
                  <th className="py-1">Sample p</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="py-1 pr-4">{r.label1}</td>
                  <td className="py-1 pr-4">{r.n1}</td>
                  <td className="py-1 pr-4">{r.x1}</td>
                  <td className="py-1">{fx(r.p1, 6)}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-1 pr-4">{r.label2}</td>
                  <td className="py-1 pr-4">{r.n2}</td>
                  <td className="py-1 pr-4">{r.x2}</td>
                  <td className="py-1">{fx(r.p2, 6)}</td>
                </tr>
              </tbody>
            </table>
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
                  <th className="py-1">{ciHeader}</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="py-1 pr-4">{f(r.difference, 7)}</td>
                  <td className="py-1">{ciText}</td>
                </tr>
              </tbody>
            </table>
            <p className="mt-2 text-xs italic text-gray-600">
              CI based on normal approximation
            </p>
          </section>

          {/* Test */}
          <section className="mb-6">
            <h3 className="mb-2 text-sm font-semibold text-gray-800">Test</h3>
            <table className="mb-3 border-collapse text-sm">
              <tbody>
                <tr>
                  <td className="py-1 pr-6 text-gray-600">Null hypothesis</td>
                  <td className="py-1">
                    H{SUB0}: {DIFF} = {f(r.eta0, 6)}
                  </td>
                </tr>
                <tr>
                  <td className="py-1 pr-6 text-gray-600">
                    Alternative hypothesis
                  </td>
                  <td className="py-1">
                    H{SUB1}: {DIFF} {ALT_SYMBOL[r.alternative]} {f(r.eta0, 6)}
                  </td>
                </tr>
              </tbody>
            </table>
            <table className="border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-300 text-left text-gray-600">
                  <th className="py-1 pr-6">Method</th>
                  <th className="py-1 pr-6">Z-Value</th>
                  <th className="py-1">P-Value</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="py-1 pr-6">Normal approximation</td>
                  <td className="py-1 pr-6">{fx(r.zValue, 2)}</td>
                  <td className="py-1">{fx(r.pNormal, 3)}</td>
                </tr>
                {r.showFisher && Number.isFinite(r.pFisher) && (
                  <tr className="border-b border-gray-200">
                    <td className="py-1 pr-6">Fisher&apos;s exact</td>
                    <td className="py-1 pr-6" />
                    <td className="py-1">{fx(r.pFisher, 3)}</td>
                  </tr>
                )}
              </tbody>
            </table>
            {r.continuityCorrection && (
              <p className="mt-2 text-xs text-gray-600">
                The normal approximation includes a continuity correction.
              </p>
            )}
            {r.shiftedNull && (
              <p className="mt-2 text-xs text-amber-700">
                With a non-zero hypothesized difference the test uses separate
                variances and Fisher&apos;s exact test does not apply.
              </p>
            )}
            {r.lowExpected && (
              <p className="mt-2 text-xs text-amber-700">
                Some expected counts are below 5: prefer Fisher&apos;s exact test.
              </p>
            )}
          </section>

          <section className="mb-6">
            <h3 className="mb-2 text-sm font-semibold text-gray-800">
              Sample Proportions
            </h3>
            <div className="border border-gray-200 rounded" style={{ height: 200 }}>
              <ResultChart
                data={chartData}
                layout={{ autosize: true, ...chartLayout }}
              />
            </div>
            <p className="mt-2 text-xs italic text-gray-600">
              Individual 95% Wald intervals, shown for reference only: the test
              uses the pooled proportion.
            </p>
          </section>
        </div>
      }
    />
  );
}
