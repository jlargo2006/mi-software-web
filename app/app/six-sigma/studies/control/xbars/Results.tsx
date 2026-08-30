// app/app/six-sigma/studies/control/xbars/Results.tsx
"use client";
import React from "react";
import type { Data, Layout, Shape, Annotations } from "plotly.js";
import ResultChart from "../../../components/ResultChart";
import type { Violation, XbarSResult } from "./types";

const fx = (v: number | null | undefined, dec = 4): string =>
  v === null || v === undefined || !Number.isFinite(v)
    ? "*"
    : v.toFixed(dec).replace(".", ",");

const BLUE = "#1d4ed8";
const RED = "#dc2626";
const GREEN = "#15803d";

export default function XbarSResults({ result }: { result: XbarSResult }) {
  if (!result.ok) {
    return (
      <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        {result.error ?? "Select the columns of observations."}
      </div>
    );
  }

  const r = result;
  const single = r.stages.length === 1;
  const s0 = r.stages[0];
  const xs = Array.from({ length: r.k }, (_, i) => i + 1);

  const line = (
    v: number[],
    color: string,
    dash: "solid" | "dash",
    axis: "y" | "y2"
  ): Data =>
    ({
      x: xs,
      y: v,
      type: "scatter",
      mode: "lines",
      line: { color, width: 1.2, dash },
      yaxis: axis,
      hoverinfo: "skip",
    } as unknown as Data);

  const series = (
    v: number[],
    flagged: number[],
    axis: "y" | "y2",
    label: string
  ): Data[] => {
    const fl = xs.filter((i) => flagged.includes(i));
    return [
      {
        x: xs,
        y: v,
        type: "scatter",
        mode: "lines+markers",
        line: { color: BLUE, width: 1 },
        marker: { color: BLUE, size: 5 },
        yaxis: axis,
        customdata: xs.map((i) => r.n[i - 1]),
        hovertemplate: `Sample %{x}<br>${label} = %{y:.4f}<br>n = %{customdata}<extra></extra>`,
      } as unknown as Data,
      {
        x: fl,
        y: fl.map((i) => v[i - 1]),
        type: "scatter",
        mode: "markers",
        marker: { color: RED, size: 8, symbol: "square" },
        yaxis: axis,
        hovertemplate: `Sample %{x}<br>${label} = %{y:.4f}<extra></extra>`,
      } as unknown as Data,
    ];
  };

  const traces: Data[] = [
    line(r.xUcl, RED, "dash", "y"),
    line(r.xLcl, RED, "dash", "y"),
    line(r.xCl, GREEN, "solid", "y"),
    ...series(r.mean, r.xFlagged, "y", "Mean"),
    line(r.sUcl, RED, "dash", "y2"),
    line(r.sLcl, RED, "dash", "y2"),
    line(r.sCl, GREEN, "solid", "y2"),
    ...series(r.sd, r.sFlagged, "y2", "StDev"),
  ];

  const shapes: Partial<Shape>[] = r.stages.slice(1).flatMap((s) => [
    {
      type: "line" as const,
      x0: s.from + 0.5,
      x1: s.from + 0.5,
      yref: "paper" as const,
      y0: 0,
      y1: 1,
      line: { color: "#9ca3af", width: 1, dash: "dot" as const },
    },
  ]);

  const last = r.k - 1;
  const tag = (
    yv: number,
    text: string,
    color: string,
    ref: "y" | "y2"
  ): Partial<Annotations> => ({
    x: 1,
    xref: "paper",
    xanchor: "left",
    y: yv,
    yref: ref,
    yanchor: "middle",
    text,
    showarrow: false,
    font: { size: 9, color },
  });

  const layout: Partial<Layout> = {
    plot_bgcolor: "#ffffff",
    showlegend: false,
    hovermode: "closest",
    modebar: { orientation: "v" },
    margin: { l: 62, r: 104, t: 16, b: 40 },
    grid: { rows: 2, columns: 1, pattern: "independent" },
    xaxis: {
      domain: [0, 1],
      anchor: "y2",
      title: { text: "Sample", font: { size: 10 } },
      zeroline: false,
      tick0: 1,
      dtick: r.k > 60 ? 12 : r.k > 30 ? 5 : 2,
    },
    yaxis: {
      domain: [0.56, 1],
      title: { text: "Sample Mean", font: { size: 10 } },
      zeroline: false,
    },
    yaxis2: {
      domain: [0, 0.44],
      title: { text: "Sample StDev", font: { size: 10 } },
      zeroline: false,
      rangemode: "tozero",
    },
    shapes,
    annotations: [
      tag(r.xUcl[last], `UCL = ${fx(r.xUcl[last], 2)}`, RED, "y"),
      tag(r.xCl[last], `X\u0305\u0305 = ${fx(r.xCl[last], 2)}`, GREEN, "y"),
      tag(r.xLcl[last], `LCL = ${fx(r.xLcl[last], 2)}`, RED, "y"),
      tag(r.sUcl[last], `UCL = ${fx(r.sUcl[last], 3)}`, RED, "y2"),
      tag(r.sCl[last], `S\u0305 = ${fx(r.sCl[last], 3)}`, GREEN, "y2"),
      tag(r.sLcl[last], `LCL = ${fx(r.sLcl[last], 3)}`, RED, "y2"),
    ],
  };

  const sOut = r.sFlagged.length > 0;
  const xOut = r.xFlagged.length > 0;

  const block = (title: string, vs: Violation[]) => (
    <div>
      <p className="mb-1 text-xs font-semibold text-gray-800">{title}</p>
      {vs.length === 0 ? (
        <p className="text-xs text-gray-500">No test failures.</p>
      ) : (
        <div className="space-y-1">
          {vs.map((v) => (
            <div key={v.test} className="text-xs">
              <p className="text-gray-700">
                <strong>TEST {v.test}.</strong> {v.description}
              </p>
              <p className="pl-4 font-mono text-gray-600">
                Test Failed at points: {v.points.join("; ")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full space-y-4">
      <h3 className="text-center text-sm font-semibold text-gray-800">
        Xbar-S Chart of {r.title}
      </h3>

      <div className="rounded border border-gray-200" style={{ height: 460 }}>
        <ResultChart data={traces} layout={{ autosize: true, ...layout }} />
      </div>

      {r.commonN === null && (
        <p className="text-center text-xs text-gray-500">
          Tests are performed with unequal sample sizes.
        </p>
      )}

      <div className="overflow-x-auto rounded border border-gray-200">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              {single ? null : (
                <th className="px-3 py-1 text-left font-medium">Stage</th>
              )}
              <th className="px-3 py-1 text-right font-medium">Subgroups</th>
              <th className="px-3 py-1 text-right font-medium">n</th>
              <th className="px-3 py-1 text-right font-medium">Mean</th>
              <th className="px-3 py-1 text-right font-medium">StDev</th>
              <th className="px-3 py-1 text-right font-medium">X LCL</th>
              <th className="px-3 py-1 text-right font-medium">X UCL</th>
              <th className="px-3 py-1 text-right font-medium">S bar</th>
              <th className="px-3 py-1 text-right font-medium">S UCL</th>
            </tr>
          </thead>
          <tbody>
            {r.stages.map((s, i) => (
              <tr key={i} className="border-t border-gray-100 font-mono">
                {single ? null : (
                  <td className="px-3 py-1 font-sans">{s.label || i + 1}</td>
                )}
                <td className="px-3 py-1 text-right">{s.kUsed}</td>
                <td className="px-3 py-1 text-right">
                  {r.commonN ?? `${r.minN}\u2013${r.maxN}`}
                </td>
                <td className="px-3 py-1 text-right">{fx(s.xBar)}</td>
                <td className="px-3 py-1 text-right">{fx(s.sigma)}</td>
                <td className="px-3 py-1 text-right">{fx(r.xLcl[s.from])}</td>
                <td className="px-3 py-1 text-right">{fx(r.xUcl[s.from])}</td>
                <td className="px-3 py-1 text-right">{fx(r.sCl[s.from])}</td>
                <td className="px-3 py-1 text-right">{fx(r.sUcl[s.from])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {block(`Test Results for Xbar Chart of ${r.title}`, r.xViolations)}
      {block(`Test Results for S Chart of ${r.title}`, r.sViolations)}

      {/* --- Lecturas --- */}
      {sOut && (
        <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <p className="font-semibold">
            Read the S chart first: {r.sFlagged.length} subgroup
            {r.sFlagged.length === 1 ? "" : "s"} out of control
          </p>
          <p className="mt-1">
            The limits on the chart of means are built from the within-subgroup
            standard deviation. If that spread is not stable, those limits do not
            describe anything and the Xbar chart cannot be interpreted {"\u2014"}
            whatever it shows or fails to show. Resolve the S chart first, then
            recompute.
          </p>
        </div>
      )}

      {!sOut && xOut && (
        <div className="rounded-md border border-blue-300 bg-blue-50 px-4 py-3 text-sm text-blue-900">
          <p className="font-semibold">
            {r.xFlagged.length} subgroup{r.xFlagged.length === 1 ? "" : "s"} out of
            control on the chart of means
          </p>
          <p className="mt-1">
            The spread is stable and the level is not: something moved the process
            average without changing its variability. That points at a setting, a
            batch of material or a changeover {"\u2014"} not at wear or play, which
            would have widened the S chart too.
          </p>
        </div>
      )}

      {!sOut && !xOut && (
        <div className="rounded-md border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          <p className="font-semibold">No points out of control</p>
          <p className="mt-1">
            Both charts are stable, so the process is predictable over this window.
            That says nothing about whether it meets specification: control and
            capability are different questions, and only a capability study answers
            the second.
          </p>
        </div>
      )}

      <p className="text-xs text-gray-500">
        {r.k} subgroups
        {r.commonN !== null ? ` of ${r.commonN}` : ` of ${r.minN} to ${r.maxN}`},
        {"\u00A0"}
        {"\u03C3"}{"\u0302"} = {fx(s0.sigma)} by the{" "}
        {r.method === "pooled" ? "pooled standard deviation" : "Sbar"} method
        {r.unbias ? " with the unbiasing constant" : " without unbiasing"}
        {r.usedHistMean && ", historical mean supplied"}
        {r.usedHistSigma && ", historical sigma supplied"}.
        {r.omitted.length > 0 && (
          <>
            {" "}
            {r.omitted.length} subgroup(s) omitted from the estimate:{" "}
            {r.omitted.join("; ")}. They are still plotted and still tested.
          </>
        )}
        {r.notes.map((t, i) => (
          <React.Fragment key={i}> {t}</React.Fragment>
        ))}
      </p>
    </div>
  );
}
