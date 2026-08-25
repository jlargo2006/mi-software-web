// app/app/six-sigma/studies/improve/boxcox/Results.tsx
"use client";
import React from "react";
import type { Data, Layout, Shape } from "plotly.js";
import ReportLayout from "../../../components/ReportLayout";
import ResultChart from "../../../components/ResultChart";
import type { ImpBoxCoxResult } from "./types";

const BLUE = "#1d4ed8";
const GREY = "#6b7280";
const LAMBDA = "\u03BB";

const fx = (v: number, dec: number): string =>
  Number.isFinite(v) ? v.toFixed(dec).replace(".", ",") : "*";

export default function ImpBoxCoxResults({
  result,
}: {
  result: ImpBoxCoxResult;
}) {
  if (!result.ok) {
    return (
      <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        {result.error ??
          "Selecciona la columna y una columna vac\u00eda de destino."}
      </div>
    );
  }

  const r = result;
  const lx = r.curve.map((p) => p.lambda);
  const ly = r.curve.map((p) => p.sd);

  const traces: Data[] = [
    {
      type: "scatter",
      mode: "lines+markers",
      x: lx,
      y: ly,
      line: { color: BLUE, width: 1 },
      marker: { color: BLUE, size: 4 },
      showlegend: false,
      hovertemplate: `${LAMBDA}: %{x:.2f}<br>StDev: %{y:.4f}<extra></extra>`,
    } as unknown as Data,
  ];

  const vline = (xv: number): Partial<Shape> => ({
    type: "line",
    x0: xv,
    x1: xv,
    yref: "paper",
    y0: 0,
    y1: 1,
    line: { color: GREY, width: 1, dash: "dash" },
  });

  const shapes: Partial<Shape>[] = [
    {
      type: "line",
      xref: "paper",
      x0: 0,
      x1: 1,
      y0: r.sdLimit,
      y1: r.sdLimit,
      line: { color: GREY, width: 1, dash: "dash" },
    },
  ];
  if (Number.isFinite(r.lowerCL)) shapes.push(vline(r.lowerCL));
  if (Number.isFinite(r.upperCL)) shapes.push(vline(r.upperCL));

  const layout: Partial<Layout> = {
    margin: { l: 70, r: 170, t: 20, b: 55 },
    xaxis: { title: { text: LAMBDA }, zeroline: false },
    yaxis: { title: { text: "StDev" }, zeroline: false },
    hovermode: "closest",
    showlegend: false,
    shapes,
    annotations: [
      ...(Number.isFinite(r.lowerCL)
        ? [
            {
              x: r.lowerCL,
              yref: "paper" as const,
              y: 0.98,
              text: "Lower CL",
              showarrow: false,
              textangle: -90,
              xanchor: "right" as const,
              yanchor: "top" as const,
              font: { size: 10, color: GREY },
            },
          ]
        : []),
      ...(Number.isFinite(r.upperCL)
        ? [
            {
              x: r.upperCL,
              yref: "paper" as const,
              y: 0.98,
              text: "Upper CL",
              showarrow: false,
              textangle: -90,
              xanchor: "left" as const,
              yanchor: "top" as const,
              font: { size: 10, color: GREY },
            },
          ]
        : []),
      {
        xref: "paper" as const,
        x: 1.0,
        y: r.sdLimit,
        text: "Limit",
        showarrow: false,
        xanchor: "left" as const,
        yanchor: "bottom" as const,
        font: { size: 10, color: GREY },
      },
      {
        xref: "paper" as const,
        yref: "paper" as const,
        x: 1.03,
        y: 1,
        xanchor: "left" as const,
        yanchor: "top" as const,
        align: "left" as const,
        showarrow: false,
        bordercolor: "#9ca3af",
        borderwidth: 1,
        borderpad: 6,
        bgcolor: "#ffffff",
        font: { size: 11, family: "monospace" },
        text:
          `<b>${LAMBDA}</b><br>` +
          `(using ${fx(r.confLevel, 1)}% confidence)<br><br>` +
          `Estimate      ${fx(r.lambdaHat, 2)}<br>` +
          `Lower CL      ${fx(r.lowerCL, 2)}<br>` +
          `Upper CL      ${fx(r.upperCL, 2)}<br><br>` +
          `Rounded Value ${fx(r.roundedLambda, 2)}`,
      },
    ],
  };

  const th = "py-1 pr-6 text-left font-medium text-gray-600";
  const td = "py-1 pr-6";

  return (
    <ReportLayout
      template="chart-text"
      center={
        <div className="w-full space-y-6">
          <h3 className="text-sm font-semibold text-gray-800">
            Box-Cox Transformation: {r.title}
          </h3>

          <section className="mb-6">
            <h4 className="mb-2 text-sm font-semibold text-gray-800">Method</h4>
            <table className="border-collapse text-sm">
              <tbody>
                <tr>
                  <td className="py-1 pr-6 text-gray-600">Subgroups</td>
                  <td className="py-1">
                    {r.subgroupColumn
                      ? `by column ${r.subgroupColumn} (${r.nSubgroups})`
                      : r.subgroupSize === 1
                        ? "size 1 (overall variation)"
                        : `size ${r.subgroupSize} (${r.nSubgroups})`}
                  </td>
                </tr>
                <tr>
                  <td className="py-1 pr-6 text-gray-600">Observations</td>
                  <td className="py-1">{r.n}</td>
                </tr>
                <tr>
                  <td className="py-1 pr-6 text-gray-600">
                    {LAMBDA} applied
                  </td>
                  <td className="py-1">
                    {fx(r.lambdaUsed, 4)}
                    {r.usedRounded ? " (rounded)" : " (user value)"}
                  </td>
                </tr>
                <tr>
                  <td className="py-1 pr-6 text-gray-600">Transformation</td>
                  <td className="py-1 font-mono">
                    {Math.abs(r.lambdaUsed) < 1e-12
                      ? `W = ln(${r.title})`
                      : `W = ${r.title} ^ ${fx(r.lambdaUsed, 4)}`}
                  </td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className="mb-6">
            <h4 className="mb-2 text-sm font-semibold text-gray-800">
              Estimation of {LAMBDA}
            </h4>
            <table className="border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className={th}>Estimate</th>
                  <th className={th}>Lower CL</th>
                  <th className={th}>Upper CL</th>
                  <th className="py-1 text-left font-medium text-gray-600">
                    Rounded Value
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className={td}>{fx(r.lambdaHat, 2)}</td>
                  <td className={td}>{fx(r.lowerCL, 2)}</td>
                  <td className={td}>{fx(r.upperCL, 2)}</td>
                  <td className="py-1">{fx(r.roundedLambda, 2)}</td>
                </tr>
              </tbody>
            </table>
            <p className="mt-2 text-xs text-gray-600">
              Minimum StDev {fx(r.sdMin, 4)} at {LAMBDA} ={" "}
              {fx(r.lambdaHat, 4)}; the interval is where the curve stays below{" "}
              {fx(r.sdLimit, 4)}.
            </p>
          </section>

          <section className="mb-6">
            <h4 className="mb-2 text-sm font-semibold text-gray-800">
              Effect of the transformation
            </h4>
            <table className="border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className={th}>Data</th>
                  <th className={th}>StDev</th>
                  <th className="py-1 text-left font-medium text-gray-600">
                    Skewness
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className={td}>Original</td>
                  <td className={td}>{fx(r.sdBefore, 4)}</td>
                  <td className="py-1">{fx(r.skewBefore, 4)}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className={td}>Transformed</td>
                  <td className={td}>{fx(r.sdAfter, 4)}</td>
                  <td className="py-1">{fx(r.skewAfter, 4)}</td>
                </tr>
              </tbody>
            </table>
            <p className="mt-2 text-xs text-gray-600">
              A skewness near zero is the sign the transformation worked. Run a
              normality test on {r.storeColumn} to confirm it.
            </p>
          </section>

          <section className="mb-6">
            <h4 className="mb-2 text-center text-sm font-semibold text-gray-800">
              Box-Cox Plot of {r.title}
            </h4>
            <div
              className="border border-gray-200 rounded"
              style={{ height: 420 }}
            >
              <ResultChart
                data={traces}
                layout={{ autosize: true, ...layout }}
              />
            </div>
          </section>

          <section className="space-y-1 text-xs text-gray-600">
            <p>
              {r.n} value(s) transformed into column {r.storeColumn}.
            </p>
            {r.nMissing > 0 && (
              <p className="text-amber-700">
                {r.nMissing} row(s) skipped: the value was missing or
                non-numeric.
              </p>
            )}
          </section>
        </div>
      }
    />
  );
}
