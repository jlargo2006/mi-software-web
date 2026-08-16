// app/app/six-sigma/studies/pss/factorial/Results.tsx
"use client";
import React from "react";
import type { Data, Layout } from "plotly.js";
import ReportLayout from "../../../components/ReportLayout";
import ResultChart from "../../../components/ResultChart";
import type { PssFactResult } from "./types";

const PALETTE = ["#1d4ed8", "#b91c1c", "#00674d", "#a21caf", "#c2410c", "#0369a1"];

const fx = (v: number, dec: number): string =>
  Number.isFinite(v) ? v.toFixed(dec).replace(".", ",") : "*";

/** Numero corto: sin decimales si es entero. */
const fnum = (v: number): string =>
  Number.isInteger(v) ? String(v) : String(v).replace(".", ",");

export default function PssFactResults({
  result,
}: {
  result: PssFactResult;
}) {
  if (!result.ok) {
    return (
      <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        {result.error ?? "Configura el diseno."}
      </div>
    );
  }

  const r = result;
  const showTarget = r.solveFor !== "power";

  const traces: Data[] = r.curves.map((c, i) => ({
    type: "scatter",
    mode: "lines",
    x: c.points.map((p) => p.effect),
    y: c.points.map((p) => p.power),
    name: c.label,
    line: { color: PALETTE[i % PALETTE.length], width: 2 },
    hovertemplate: "Effect %{x:.3f}<br>Power %{y:.4f}<extra></extra>",
  })) as unknown as Data[];

  if (r.markers.length > 0) {
    traces.push({
      type: "scatter",
      mode: "markers",
      x: r.markers.map((m) => m.effect),
      y: r.markers.map((m) => m.power),
      marker: { color: "#111827", size: 9 },
      showlegend: false,
      hovertemplate: "Effect %{x:.3f}<br>Power %{y:.6f}<extra></extra>",
    } as unknown as Data);
  }

  const layout: Partial<Layout> = {
    margin: { l: 60, r: 20, t: 20, b: 50 },
    xaxis: { title: { text: "Effect" }, zeroline: false },
    yaxis: { title: { text: "Power" }, range: [0, 1.03], zeroline: false },
    hovermode: "closest",
    legend: {
      orientation: "v",
      x: 1.01,
      y: 1,
      font: { size: 11 },
      title: { text: "Reps; Ctr Pts", font: { size: 11 } },
    },
    plot_bgcolor: "#ffffff",
  };

  const th = "px-3 py-1 text-right font-medium text-gray-600 whitespace-nowrap";
  const td = "px-3 py-1 text-right whitespace-nowrap";

  return (
    <ReportLayout
      template="chart-text"
      center={
        <div className="w-full space-y-6">
          <h3 className="text-sm font-semibold text-gray-800">
            Power and Sample Size
          </h3>

          <section>
            <p className="text-sm font-medium text-gray-800">
              2-Level Factorial Design
            </p>
            <p className="mt-1 text-sm text-gray-700">
              {"\u03B1"} = {fnum(r.alpha)}
              {"\u00a0\u00a0"}Assumed standard deviation = {fnum(r.sd)}
            </p>
          </section>

          {/* Metodo */}
          <section>
            <h4 className="mb-2 text-sm font-semibold text-gray-800">Method</h4>
            <table className="border-collapse text-sm">
              <tbody>
                <tr>
                  <td className="py-1 pr-4 text-gray-600">Factors:</td>
                  <td className="py-1 pr-10 font-medium">{r.numFactors}</td>
                  <td className="py-1 pr-4 text-gray-600">Base Design:</td>
                  <td className="py-1 font-medium">
                    {r.numFactors}; {r.cornerPoints}
                  </td>
                </tr>
                <tr>
                  <td className="py-1 pr-4 text-gray-600">Blocks:</td>
                  <td className="py-1 pr-10 font-medium">{r.blocksLabel}</td>
                  <td className="py-1 pr-4 text-gray-600">Terms omitted:</td>
                  <td className="py-1 font-medium">{r.termsOmitted}</td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* Resultados */}
          <section className="overflow-x-auto">
            <h4 className="mb-2 text-sm font-semibold text-gray-800">Results</h4>
            <table className="border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-400 align-bottom">
                  <th className={th}>
                    Center
                    <br />
                    Points
                  </th>
                  <th className={th}>Effect</th>
                  <th className={th}>Reps</th>
                  <th className={th}>
                    Total
                    <br />
                    Runs
                  </th>
                  {showTarget && (
                    <th className={th}>
                      Target
                      <br />
                      Power
                    </th>
                  )}
                  <th className={th}>
                    Actual
                    <br />
                    Power
                  </th>
                  <th className={th}>Error DF</th>
                </tr>
              </thead>
              <tbody>
                {r.rows.map((row, i) => (
                  <tr key={i} className="border-b border-gray-200">
                    <td className={td}>{row.centerPoints}</td>
                    <td className={td}>{fnum(Number(row.effect.toFixed(6)))}</td>
                    <td className={td}>{row.reps}</td>
                    <td className={td}>{row.totalRuns}</td>
                    {showTarget && (
                      <td className={td}>{fnum(row.targetPower)}</td>
                    )}
                    <td className={td}>{fx(row.actualPower, 6)}</td>
                    <td className={td}>{row.df}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2 text-xs text-gray-600">
              Center points add degrees of freedom to the error but do not help
              estimate the effects, so they raise the power only indirectly.
              Error DF is not in the Minitab table; it is shown because a design
              with very few of them gives an unstable answer.
            </p>
          </section>

          {/* Curva */}
          {r.showCurve && (
            <section>
              <h4 className="mb-2 text-center text-sm font-semibold text-gray-800">
                Power Curve for 2-Level Factorial Design
              </h4>
              <div
                className="border border-gray-200 rounded"
                style={{ height: 400 }}
              >
                <ResultChart
                  data={traces}
                  layout={{ autosize: true, ...layout }}
                />
              </div>
              <div className="mt-2 grid grid-cols-2 gap-x-6 text-xs text-gray-600 sm:grid-cols-3">
                <p>
                  {"\u03B1"}: {fnum(r.alpha)}
                </p>
                <p>StDev: {fnum(r.sd)}</p>
                <p># Factors: {r.numFactors}</p>
                <p># Corner Pts: {r.cornerPoints}</p>
                <p># Blocks: {r.blocksLabel}</p>
                <p># Terms Omitted: {r.termsOmitted}</p>
              </div>
              <p className="mt-2 text-xs text-gray-600">
                The curve is symmetric because the test is two-sided: only the
                size of the effect matters, not its sign. At an effect of zero
                the power equals {"\u03B1"}, which is the false alarm rate.
              </p>
            </section>
          )}

          {/* Lectura */}
          <section className="rounded-md border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            <p className="font-semibold">
              {r.rows.length === 1
                ? `${r.rows[0].totalRuns} runs give a power of ${fx(
                    r.rows[0].actualPower,
                    4
                  )}`
                : `${r.rows.length} scenarios computed`}
            </p>
            <p className="mt-1">
              Power is the chance of detecting an effect of that size{" "}
              <em>if it is really there</em>. The missing part,{" "}
              {r.rows.length === 1
                ? fx(1 - r.rows[0].actualPower, 4)
                : "1 minus power"}
              , is the risk of running the whole experiment and concluding
              nothing.
            </p>
            <p className="mt-2 text-xs">
              These numbers rest on the assumed standard deviation. Get that
              wrong and the whole calculation moves: an estimate twice too small
              turns a power of 0,94 into something far lower.
            </p>
          </section>
        </div>
      }
    />
  );
}
