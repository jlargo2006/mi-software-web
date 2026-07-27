// app/app/six-sigma/studies/pss/onesamplet/Results.tsx
"use client";
import React from "react";
import type { Data } from "plotly.js";
import type { ColumnSnapshot } from "../types";
import type { Pss1SampleTParams, Pss1SampleTResult } from "./types";
import ResultChart from "../../../components/ResultChart";
import ReportLayout from "../../../components/ReportLayout";

const PALETTE = [
  "#c0392b", "#2980b9", "#27ae60", "#8e44ad", "#d35400",
  "#16a085", "#2c3e50", "#7f8c8d", "#e67e22", "#1abc9c",
];

const num = (v: number, dec: number): string =>
  Number.isFinite(v) ? v.toFixed(dec).replace(".", ",") : "*";

const Th = ({ children }: { children?: React.ReactNode }) => (
  <th className="border border-gray-300 px-2 py-1 bg-gray-100 text-left font-semibold">
    {children}
  </th>
);

const Td = ({ children, right }: { children?: React.ReactNode; right?: boolean }) => (
  <td className={`border border-gray-300 px-2 py-1 ${right ? "text-right" : ""}`}>
    {children}
  </td>
);

const ALT_TEXT: Record<string, string> = {
  "two-sided": "≠ null",
  less: "< null",
  greater: "> null",
};

export default function Pss1SampleTResults({
  result,
}: {
  data: ColumnSnapshot;
  params: Pss1SampleTParams;
  result: Pss1SampleTResult;
}) {
  const r = result;

  if (!r || !r.ok) {
    return (
      <div className="p-4 text-sm text-gray-600">
        {r?.error ?? "Fill in two of the three fields to calculate the third."}
      </div>
    );
  }

  const traces: Data[] = r.curves.map((c, i) => ({
    type: "scatter",
    mode: "lines",
    x: c.x,
    y: c.y,
    line: { color: PALETTE[i % PALETTE.length], width: 2 },
    name: String(c.n),
    hovertemplate: `n = ${c.n}<br>diff %{x:.4f}<br>power %{y:.4f}<extra></extra>`,
  }));

  traces.push({
    type: "scatter",
    mode: "markers",
    x: r.markers.map((m) => m.x),
    y: r.markers.map((m) => m.y),
    marker: { color: "#111827", size: 7, symbol: "circle" },
    name: "Design points",
    hovertemplate: "diff %{x:.5f}<br>power %{y:.4f}<extra></extra>",
  });

  const showTarget = r.solveFor === "size";

  return (
    <div className="space-y-6">
      <ReportLayout
        template="chart-text"
        center={
          <div className="space-y-5 w-full text-xs">
            <div>
              <h4 className="font-bold text-sm">Power and Sample Size</h4>
              <p className="mt-1">1-Sample t Test</p>
              <p>
                Testing mean = null (versus {ALT_TEXT[r.alternative]})
              </p>
              <p>Calculating power for mean = null + difference</p>
              <p>
                α = {num(r.alpha, 2)}&nbsp;&nbsp;Assumed standard deviation ={" "}
                {num(r.sd, 4).replace(/,?0+$/, "")}
              </p>
            </div>

            <section>
              <h5 className="font-semibold mb-1">Results</h5>
              <table className="border-collapse">
                <thead>
                  <tr>
                    <Th>Sample Size</Th>
                    {showTarget && <Th>Target Power</Th>}
                    <Th>Power</Th>
                    <Th>Difference</Th>
                  </tr>
                </thead>
                <tbody>
                  {r.rows.map((row, i) => (
                    <tr key={i}>
                      <Td right>{row.n}</Td>
                      {showTarget && <Td right>{num(row.targetPower ?? NaN, 2)}</Td>}
                      <Td right>{num(row.power, showTarget ? 6 : 1)}</Td>
                      <Td right>{num(row.difference, 5)}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <div style={{ height: 420 }} className="border border-gray-200 rounded">
              <ResultChart
                data={traces}
                layout={{
                  autosize: true,
                  title: {
                    text: "Power Curve for 1-Sample t Test",
                    font: { size: 14 },
                  },
                  margin: { t: 50, b: 55, l: 65, r: 150 },
                  xaxis: { title: { text: "Difference" }, zeroline: false },
                  yaxis: { title: { text: "Power" }, range: [0, 1.02], zeroline: false },
                  legend: {
                    x: 1.02,
                    xanchor: "left",
                    y: 1,
                    yanchor: "top",
                    title: { text: "Sample Size", font: { size: 11 } },
                  },
                  annotations: [
                    {
                      xref: "paper",
                      yref: "paper",
                      x: 1.02,
                      y: 0,
                      xanchor: "left",
                      yanchor: "bottom",
                      showarrow: false,
                      align: "left",
                      font: { size: 10, color: "#6b7280" },
                      text: `Assumptions<br>α &nbsp; ${num(r.alpha, 2)}<br>StDev &nbsp; ${num(r.sd, 4).replace(/,?0+$/, "")}<br>Alternative &nbsp; ${ALT_TEXT[r.alternative]}`,
                    },
                  ],
                  hovermode: "closest",
                }}
              />
            </div>

            {r.notes.length > 0 && (
              <div className="space-y-1">
                {r.notes.map((nt, i) => (
                  <p key={i} className="italic">
                    * NOTE * {nt}
                  </p>
                ))}
              </div>
            )}
          </div>
        }
      />
    </div>
  );
}
