// app/app/six-sigma/studies/control/xbarr/Results.tsx
"use client";
import React from "react";
import type { Data, Layout, Shape, Annotations } from "plotly.js";
import ResultChart from "../../../components/ResultChart";
import type { Violation, XbarRResult } from "./types";

const fx = (v: number | null | undefined, dec = 2): string =>
  v === null || v === undefined || !Number.isFinite(v)
    ? "*"
    : v.toFixed(dec).replace(".", ",");

const BLUE = "#1d4ed8";
const RED = "#dc2626";
const GREEN = "#15803d";

function Chart({
  yTitle,
  y,
  cl,
  ucl,
  lcl,
  flagged,
  stageStarts,
  height,
}: {
  yTitle: string;
  y: number[];
  cl: number[];
  ucl: number[];
  lcl: number[];
  flagged: number[];
  stageStarts: number[];
  height: number;
}) {
  const k = y.length;
  const xs = Array.from({ length: k }, (_, i) => i + 1);
  const flagSet = new Set(flagged);
  const fx1 = xs.filter((i) => flagSet.has(i));

  // Los limites se dibujan como series escalonadas y no como lineas rectas:
  // con tamanos de subgrupo desiguales, o con etapas, cambian de un punto al
  // siguiente y una recta mentiria.
  const step = (v: number[], color: string, dash: "solid" | "dash"): Data =>
    ({
      x: xs,
      y: v,
      type: "scatter",
      mode: "lines",
      line: { color, width: 1.2, dash, shape: "hv" },
      hoverinfo: "skip",
    } as unknown as Data);

  const traces: Data[] = [
    step(ucl, RED, "dash"),
    step(lcl, RED, "dash"),
    step(cl, GREEN, "solid"),
    {
      x: xs,
      y,
      type: "scatter",
      mode: "lines+markers",
      line: { color: BLUE, width: 1 },
      marker: { color: BLUE, size: 4 },
      hovertemplate: "Sample %{x}<br>%{y:.4g}<extra></extra>",
    } as unknown as Data,
    {
      x: fx1,
      y: fx1.map((i) => y[i - 1]),
      type: "scatter",
      mode: "markers",
      marker: { color: RED, size: 7, symbol: "square" },
      hovertemplate: "Sample %{x}<br>%{y:.4g}<extra></extra>",
    } as unknown as Data,
  ];

  const shapes: Partial<Shape>[] = stageStarts.slice(1).map((s) => ({
    type: "line",
    x0: s + 0.5,
    x1: s + 0.5,
    yref: "paper",
    y0: 0,
    y1: 1,
    line: { color: "#9ca3af", width: 1, dash: "dot" },
  }));

  const last = k - 1;
  const tag = (yv: number, text: string, color: string): Partial<Annotations> => ({
    x: 1,
    xref: "paper",
    xanchor: "left",
    y: yv,
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
    margin: { l: 58, r: 96, t: 18, b: 34 },
    xaxis: {
      title: { text: "Sample", font: { size: 10 } },
      zeroline: false,
      tick0: 1,
      dtick: 5,
    },
    yaxis: { title: { text: yTitle, font: { size: 10 } }, zeroline: false },
    shapes,
    annotations: [
      tag(ucl[last], `UCL = ${fx(ucl[last])}`, RED),
      tag(cl[last], fx(cl[last]), GREEN),
      tag(lcl[last], `LCL = ${fx(lcl[last])}`, RED),
    ],
  };

  return (
    <div className="rounded border border-gray-200" style={{ height }}>
      <ResultChart data={traces} layout={{ autosize: true, ...layout }} />
    </div>
  );
}

function TestBlock({ title, violations }: { title: string; violations: Violation[] }) {
  if (violations.length === 0) {
    return (
      <div>
        <p className="text-xs font-semibold text-gray-800">{title}</p>
        <p className="text-xs text-gray-500">No test failures.</p>
      </div>
    );
  }
  return (
    <div>
      <p className="mb-1 text-xs font-semibold text-gray-800">{title}</p>
      <div className="space-y-1">
        {violations.map((v) => (
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
    </div>
  );
}

export default function XbarRResults({ result }: { result: XbarRResult }) {
  if (!result.ok) {
    return (
      <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        {result.error ?? "Select the subgroup columns."}
      </div>
    );
  }

  const r = result;
  const single = r.stages.length === 1;
  const s0 = r.stages[0];
  const stageStarts = r.stages.map((s) => s.from);
  const nFlag = new Set([...r.xFlagged, ...r.rFlagged]).size;

  return (
    <div className="w-full space-y-4">
      <h3 className="text-center text-sm font-semibold text-gray-800">
        Xbar-R Chart of {r.title}
        {r.lambda !== null && (
          <span className="ml-1 font-normal text-gray-500">
            (Box-Cox, {"\u03BB"} = {fx(r.lambda, 4)})
          </span>
        )}
      </h3>

      <Chart
        yTitle="Sample Mean"
        y={r.xbar}
        cl={r.xCL}
        ucl={r.xUCL}
        lcl={r.xLCL}
        flagged={r.xFlagged}
        stageStarts={stageStarts}
        height={250}
      />

      <Chart
        yTitle="Sample Range"
        y={r.ranges}
        cl={r.rCL}
        ucl={r.rUCL}
        lcl={r.rLCL}
        flagged={r.rFlagged}
        stageStarts={stageStarts}
        height={220}
      />

      <div className="overflow-x-auto rounded border border-gray-200">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              {single ? null : <th className="px-3 py-1 text-left font-medium">Stage</th>}
              <th className="px-3 py-1 text-right font-medium">Subgroups</th>
              <th className="px-3 py-1 text-right font-medium">n</th>
              <th className="px-3 py-1 text-right font-medium">Mean</th>
              <th className="px-3 py-1 text-right font-medium">StDev</th>
              <th className="px-3 py-1 text-right font-medium">X LCL</th>
              <th className="px-3 py-1 text-right font-medium">X UCL</th>
              <th className="px-3 py-1 text-right font-medium">R bar</th>
              <th className="px-3 py-1 text-right font-medium">R UCL</th>
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
                  {r.commonN ?? "\u2014"}
                </td>
                <td className="px-3 py-1 text-right">{fx(s.center, 4)}</td>
                <td className="px-3 py-1 text-right">{fx(s.sigma, 4)}</td>
                <td className="px-3 py-1 text-right">{fx(r.xLCL[s.from], 4)}</td>
                <td className="px-3 py-1 text-right">{fx(r.xUCL[s.from], 4)}</td>
                <td className="px-3 py-1 text-right">{fx(r.rCL[s.from], 4)}</td>
                <td className="px-3 py-1 text-right">{fx(r.rUCL[s.from], 4)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3">
        <TestBlock
          title={`Test Results for Xbar Chart of ${r.title}`}
          violations={r.xViolations}
        />
        <TestBlock
          title={`Test Results for R Chart of ${r.title}`}
          violations={r.rViolations}
        />
      </div>

      {r.rFlagged.length > 0 && (
        <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <p className="font-semibold">Read the R chart first</p>
          <p className="mt-1">
            {r.rFlagged.length} subgroup range{r.rFlagged.length === 1 ? "" : "s"}{" "}
            out of control. The R chart measures within-subgroup variation, and
            that is the very quantity the Xbar limits are built from. While it is
            unstable, every limit on the chart above is provisional. Settle the R
            chart, then re-read the means.
          </p>
        </div>
      )}

      {r.rFlagged.length === 0 && r.xFlagged.length > 0 && (
        <div className="rounded-md border border-blue-300 bg-blue-50 px-4 py-3 text-sm text-blue-900">
          <p className="font-semibold">
            {r.xFlagged.length} subgroup mean
            {r.xFlagged.length === 1 ? "" : "s"} out of control, with a stable R
            chart
          </p>
          <p className="mt-1">
            This is the informative combination. Within-subgroup variation is
            consistent, so the limits are trustworthy and the signal is a real
            shift between subgroups {"\u2014"} a change in setup, material or
            operator, not a change in the noise.
          </p>
        </div>
      )}

      {nFlag === 0 && (
        <div className="rounded-md border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          <p className="font-semibold">No points out of control</p>
          <p className="mt-1">
            Both charts are stable, so the process is predictable over this
            window. That says nothing about whether it meets specification:
            control and capability are different questions, and only a capability
            study answers the second.
          </p>
        </div>
      )}

      <p className="text-xs text-gray-500">
        {r.k} subgroups
        {r.commonN !== null && ` of ${r.commonN}`}, {"\u03C3"}
        {"\u0302"} = {fx(s0.sigma, 4)}
        {r.usedHistorical && ", historical parameters supplied"}.
        {r.omitted.length > 0 && (
          <>
            {" "}
            {r.omitted.length} subgroup(s) omitted from the estimate:{" "}
            {r.omitted.join("; ")}. They are still plotted and still tested.
          </>
        )}
        {r.lambda !== null &&
          " The chart is drawn in transformed units; limits do not read in the original scale."}
        {r.nMissing > 0 && <> {r.nMissing} non-numeric value(s) skipped.</>}
        {r.notes.map((t, i) => (
          <React.Fragment key={i}> {t}</React.Fragment>
        ))}
      </p>
    </div>
  );
}
