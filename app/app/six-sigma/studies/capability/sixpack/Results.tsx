// app/app/six-sigma/studies/capability/sixpack/Results.tsx
"use client";
import React from "react";
import type { Data, Layout } from "plotly.js";
import ResultChart from "../../../components/ResultChart";
import { normPDF } from "../../../lib/stats";
import type { CapSixpackResult } from "./types";

const fx = (v: number | null, dec = 3): string =>
  v === null || !Number.isFinite(v) ? "*" : v.toFixed(dec).replace(".", ",");

const BLUE = "#1d4ed8";
const RED = "#dc2626";
const GREY = "#6b7280";

const Panel = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div>
    <h4 className="mb-1 text-sm font-semibold text-gray-800">{title}</h4>
    <div className="rounded border border-gray-200" style={{ height: 250 }}>
      {children}
    </div>
  </div>
);

export default function CapSixpackResults({
  result,
}: {
  result: CapSixpackResult;
}) {
  if (!result.ok) {
    return (
      <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        {result.error ?? "Select a column and at least one specification limit."}
      </div>
    );
  }

  const r = result;

  const base: Partial<Layout> = {
    plot_bgcolor: "#ffffff",
    showlegend: false,
    hovermode: "closest",
    margin: { l: 55, r: 62, t: 8, b: 36 },
  };

  const limitAnnots = (
    items: { y: number; text: string; color: string }[]
  ): Partial<Layout>["annotations"] =>
    items.map((a) => ({
      xref: "paper" as const,
      x: 1,
      xanchor: "left" as const,
      y: a.y,
      yanchor: "middle" as const,
      text: a.text,
      showarrow: false,
      font: { size: 9, color: a.color },
    }));

  const hline = (y: number, color: string, dash?: "dash") => ({
    type: "line" as const,
    xref: "paper" as const,
    x0: 0,
    x1: 1,
    y0: y,
    y1: y,
    line: { color, width: 1.2, ...(dash ? { dash } : {}) },
  });

  // --- 1 · Xbar (o I) Chart ----------------------------------------------
  const centreVals = r.individuals ? r.allValues : r.subgroups.map((s) => s.mean);
  const centreX = centreVals.map((_, i) => i + 1);
  const outSet = new Set(r.xbarOut);

  const xbarData: Data[] = [
    {
      x: centreX,
      y: centreVals,
      type: "scatter",
      mode: "lines+markers",
      line: { color: BLUE, width: 1.2 },
      marker: {
        color: centreVals.map((_, i) => (outSet.has(i + 1) ? RED : BLUE)),
        size: 6,
      },
      hovertemplate: `${r.individuals ? "Obs" : "Subgroup"} %{x}<br>%{y:.3f}<extra></extra>`,
    },
  ] as unknown as Data[];

  const xbarLayout: Partial<Layout> = {
    ...base,
    xaxis: { title: { text: r.individuals ? "Observation" : "Sample" }, zeroline: false },
    yaxis: {
      title: { text: r.individuals ? "Individual Value" : "Sample Mean" },
      zeroline: false,
    },
    shapes: [
      hline(r.xbarUcl, RED),
      hline(r.xbarLcl, RED),
      hline(r.xbarCenter, "#111827", "dash"),
    ],
    annotations: limitAnnots([
      { y: r.xbarUcl, text: `UCL = ${fx(r.xbarUcl)}`, color: RED },
      {
        y: r.xbarCenter,
        text: `${r.individuals ? "X\u0304" : "X\u0304\u0304"} = ${fx(r.xbarCenter)}`,
        color: "#111827",
      },
      { y: r.xbarLcl, text: `LCL = ${fx(r.xbarLcl)}`, color: RED },
    ]),
  };

  // --- 2 · Capability Histogram ------------------------------------------
  const [x0, x1] = r.xRange;
  const grid: number[] = [];
  for (let i = 0; i <= 200; i++) grid.push(x0 + ((x1 - x0) * i) / 200);
  const nBins = Math.max(6, Math.ceil(Math.sqrt(r.n)));
  const binW = (x1 - x0) / nBins;
  const scale = r.n * binW;

  const histData: Data[] = [
    {
      x: r.allValues,
      type: "histogram",
      xbins: { start: x0, end: x1, size: binW },
      marker: { color: "#bfdbfe", line: { color: "#1e3a8a", width: 1 } },
      hovertemplate: "%{x}<br>Frequency: %{y}<extra></extra>",
    },
    {
      x: grid,
      y: grid.map((v) => normPDF(v, r.mean, r.stdOverall) * scale),
      type: "scatter",
      mode: "lines",
      line: { color: RED, width: 1.6 },
      hoverinfo: "skip",
    },
    {
      x: grid,
      y: grid.map((v) => normPDF(v, r.mean, r.stdWithin) * scale),
      type: "scatter",
      mode: "lines",
      line: { color: GREY, width: 1.6, dash: "dash" },
      hoverinfo: "skip",
    },
  ] as unknown as Data[];

  const specLines = [r.lsl, r.usl]
    .filter((v): v is number => v !== null)
    .map((v) => ({
      type: "line" as const,
      x0: v,
      x1: v,
      yref: "paper" as const,
      y0: 0,
      y1: 1,
      line: { color: RED, width: 1.4, dash: "dash" as const },
    }));

  const histLayout: Partial<Layout> = {
    ...base,
    margin: { l: 55, r: 20, t: 8, b: 36 },
    bargap: 0.02,
    xaxis: { range: r.xRange, zeroline: false },
    yaxis: { title: { text: "Frequency" }, zeroline: false },
    shapes: specLines,
    annotations: [
      ...(r.lsl !== null
        ? [
            {
              x: r.lsl,
              yref: "paper" as const,
              y: 1,
              yanchor: "bottom" as const,
              text: `LSL ${fx(r.lsl, 0)}`,
              showarrow: false,
              font: { size: 9, color: RED },
            },
          ]
        : []),
      ...(r.usl !== null
        ? [
            {
              x: r.usl,
              yref: "paper" as const,
              y: 1,
              yanchor: "bottom" as const,
              text: `USL ${fx(r.usl, 0)}`,
              showarrow: false,
              font: { size: 9, color: RED },
            },
          ]
        : []),
      {
        xref: "paper" as const,
        x: 0.02,
        yref: "paper" as const,
        y: 0.97,
        xanchor: "left" as const,
        text: `<span style="color:${RED}">\u2014 Overall</span>   <span style="color:${GREY}">-- Within</span>`,
        showarrow: false,
        font: { size: 9 },
      },
    ],
  };

  // --- 3 · R / S / MR Chart ----------------------------------------------
  const spreadVals = r.individuals
    ? r.allValues.slice(1).map((v, i) => Math.abs(v - r.allValues[i]))
    : r.useSChart
    ? r.subgroups.map((s) => s.sd)
    : r.subgroups.map((s) => s.range);
  const spreadOutSet = new Set(r.spreadOut);

  const spreadData: Data[] = [
    {
      x: spreadVals.map((_, i) => i + 1),
      y: spreadVals,
      type: "scatter",
      mode: "lines+markers",
      line: { color: BLUE, width: 1.2 },
      marker: {
        color: spreadVals.map((_, i) => (spreadOutSet.has(i + 1) ? RED : BLUE)),
        size: 6,
      },
      hovertemplate: `%{x}<br>${r.spreadLabel}: %{y:.3f}<extra></extra>`,
    },
  ] as unknown as Data[];

  const spreadLayout: Partial<Layout> = {
    ...base,
    xaxis: { title: { text: "Sample" }, zeroline: false },
    yaxis: {
      title: {
        text: r.individuals
          ? "Moving Range"
          : r.useSChart
          ? "Sample StDev"
          : "Sample Range",
      },
      zeroline: false,
      rangemode: "tozero",
    },
    shapes: [
      hline(r.spreadUcl, RED),
      hline(r.spreadLcl, RED),
      hline(r.spreadCenter, "#111827", "dash"),
    ],
    annotations: limitAnnots([
      { y: r.spreadUcl, text: `UCL = ${fx(r.spreadUcl, 2)}`, color: RED },
      {
        y: r.spreadCenter,
        text: `${r.spreadLabel}\u0304 = ${fx(r.spreadCenter, 2)}`,
        color: "#111827",
      },
      { y: r.spreadLcl, text: `LCL = ${fx(r.spreadLcl, 2)}`, color: RED },
    ]),
  };

  // --- 4 · Normal Probability Plot ---------------------------------------
  const probData: Data[] = [
    {
      x: r.probPoints.map((p) => p.x),
      y: r.probPoints.map((p) => p.z),
      type: "scatter",
      mode: "markers",
      marker: { color: BLUE, size: 5 },
      hovertemplate: "%{x:.3f}<extra></extra>",
    },
    {
      x: [r.mean - 3 * r.stdOverall, r.mean + 3 * r.stdOverall],
      y: [-3, 3],
      type: "scatter",
      mode: "lines",
      line: { color: RED, width: 1.4 },
      hoverinfo: "skip",
    },
  ] as unknown as Data[];

  const probLayout: Partial<Layout> = {
    ...base,
    margin: { l: 55, r: 20, t: 8, b: 36 },
    xaxis: { zeroline: false },
    yaxis: { title: { text: "Normal score" }, zeroline: false },
    annotations: [
      {
        xref: "paper" as const,
        x: 0.03,
        yref: "paper" as const,
        y: 0.95,
        xanchor: "left" as const,
        text: `AD = ${fx(r.adStat)}<br>P = ${fx(r.adPValue)}`,
        showarrow: false,
        align: "left" as const,
        font: { size: 10 },
      },
    ],
  };

  // --- 5 · Last N Subgroups ---------------------------------------------
  const lastX: number[] = [];
  const lastY: number[] = [];
  r.lastSubgroups.forEach((s) => {
    s.values.forEach((v) => {
      lastX.push(s.index);
      lastY.push(v);
    });
  });

  const lastData: Data[] = [
    {
      x: lastX,
      y: lastY,
      type: "scatter",
      mode: "markers",
      marker: { color: BLUE, size: 5, opacity: 0.75 },
      hovertemplate: "Sample %{x}<br>%{y:.3f}<extra></extra>",
    },
    {
      x: r.lastSubgroups.map((s) => s.index),
      y: r.lastSubgroups.map((s) => s.mean),
      type: "scatter",
      mode: "markers",
      marker: { color: RED, size: 7, symbol: "line-ew-open", line: { width: 2 } },
      hovertemplate: "Sample %{x}<br>Mean: %{y:.3f}<extra></extra>",
    },
  ] as unknown as Data[];

  const lastLayout: Partial<Layout> = {
    ...base,
    margin: { l: 55, r: 20, t: 8, b: 36 },
    xaxis: { title: { text: "Sample" }, zeroline: false },
    yaxis: { title: { text: "Values" }, zeroline: false },
  };

  // --- 6 · Capability Plot ----------------------------------------------
  // Dos barras de 6 sigma contra el intervalo de especificacion. Es la unica
  // vista del informe que muestra la comparacion sin traducirla a un indice.
  const bar = (
    lo: number,
    hi: number,
    y: number,
    color: string
  ): Partial<Layout>["shapes"] => [
    {
      type: "line",
      x0: lo,
      x1: hi,
      y0: y,
      y1: y,
      line: { color, width: 8 },
    },
  ];

  const capShapes = [
    ...(r.lsl !== null && r.usl !== null
      ? (bar(r.lsl, r.usl, 3, "#111827") ?? [])
      : []),
    ...(bar(r.mean - 3 * r.stdWithin, r.mean + 3 * r.stdWithin, 2, GREY) ?? []),
    ...(bar(r.mean - 3 * r.stdOverall, r.mean + 3 * r.stdOverall, 1, RED) ?? []),
    ...specLines,
  ];

  const capData: Data[] = [
    {
      x: [r.mean],
      y: [2],
      type: "scatter",
      mode: "markers",
      marker: { color: "rgba(0,0,0,0)", size: 1 },
      hoverinfo: "skip",
    },
  ] as unknown as Data[];

  const capLayout: Partial<Layout> = {
    ...base,
    margin: { l: 70, r: 20, t: 8, b: 36 },
    xaxis: { range: r.xRange, zeroline: false },
    yaxis: {
      range: [0.4, 3.6],
      tickvals: [1, 2, 3],
      ticktext: ["Overall", "Within", "Specs"],
      zeroline: false,
    },
    shapes: capShapes,
  };

  const statRow = (
    label: string,
    a: string,
    b: string
  ): React.ReactElement => (
    <tr key={label}>
      <td className="py-0.5 pr-4 text-gray-600">{label}</td>
      <td className="py-0.5 pr-4 text-right">{a}</td>
      <td className="py-0.5 text-right">{b}</td>
    </tr>
  );

  const nonNormal = Number.isFinite(r.adPValue) && r.adPValue < 0.05;
  const unstable = r.xbarOut.length > 0 || r.spreadOut.length > 0;

  return (
    <div className="w-full space-y-4">
      <h3 className="text-center text-sm font-semibold text-gray-800">
        Process Capability Sixpack Report for {r.colName}
      </h3>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Panel title={r.individuals ? "I Chart" : "Xbar Chart"}>
          <ResultChart data={xbarData} layout={{ autosize: true, ...xbarLayout }} />
        </Panel>
        <Panel title="Capability Histogram">
          <ResultChart data={histData} layout={{ autosize: true, ...histLayout }} />
        </Panel>
        <Panel
          title={
            r.individuals ? "MR Chart" : r.useSChart ? "S Chart" : "R Chart"
          }
        >
          <ResultChart data={spreadData} layout={{ autosize: true, ...spreadLayout }} />
        </Panel>
        <Panel title="Normal Probability Plot">
          <ResultChart data={probData} layout={{ autosize: true, ...probLayout }} />
        </Panel>
        <Panel title={`Last ${r.lastNShown} Subgroups`}>
          <ResultChart data={lastData} layout={{ autosize: true, ...lastLayout }} />
        </Panel>
        <Panel title="Capability Plot">
          <ResultChart data={capData} layout={{ autosize: true, ...capLayout }} />
        </Panel>
      </div>

      <div className="flex justify-center">
        <div className="rounded border border-gray-200 px-6 py-3">
          <table className="text-sm">
            <thead>
              <tr className="text-xs text-gray-500">
                <th />
                <th className="pr-4 text-right font-medium">Within</th>
                <th className="text-right font-medium">Overall</th>
              </tr>
            </thead>
            <tbody>
              {statRow("StDev", fx(r.stdWithin), fx(r.stdOverall))}
              {statRow(
                r.lsl !== null && r.usl !== null ? "Cp / Pp" : "\u2014",
                fx(r.cp, 2),
                fx(r.pp, 2)
              )}
              {statRow("Cpk / Ppk", fx(r.cpk, 2), fx(r.ppk, 2))}
              {statRow("PPM", fx(r.ppmWithin, 2), fx(r.ppmOverall, 2))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-center text-xs text-gray-500">
        The actual process spread is represented by 6 sigma.
      </p>

      {/* --- Interpretacion --- */}
      {unstable ? (
        <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <p className="font-semibold">Read the control charts before the indices</p>
          <p className="mt-1">
            {r.xbarOut.length > 0 && (
              <>
                The {r.individuals ? "I" : "Xbar"} chart has{" "}
                {r.xbarOut.length === 1 ? "one point" : `${r.xbarOut.length} points`}{" "}
                outside the limits (sample{r.xbarOut.length === 1 ? " " : "s "}
                {r.xbarOut.join(", ")}).{" "}
              </>
            )}
            {r.spreadOut.length > 0 && (
              <>
                The {r.spreadLabel} chart has{" "}
                {r.spreadOut.length === 1
                  ? "one point"
                  : `${r.spreadOut.length} points`}{" "}
                outside the limits (sample{r.spreadOut.length === 1 ? " " : "s "}
                {r.spreadOut.join(", ")}).{" "}
              </>
            )}
            An unstable process has no single level or spread to be capable of,
            so {fx(r.cpk, 2)} does not predict future output. Find the cause
            first.
          </p>
          {r.spreadOut.length > 0 && (
            <p className="mt-2">
              A point out on the {r.spreadLabel} chart matters more than one on
              the {r.individuals ? "I" : "Xbar"} chart: the spread estimate feeds
              the control limits themselves, so an unstable{" "}
              {r.spreadLabel} chart makes the whole report unreliable.
            </p>
          )}
        </div>
      ) : (
        <div className="rounded-md border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          <p className="font-semibold">The process is stable</p>
          <p className="mt-1">
            No point falls outside the limits on either chart, so the indices
            below can be read as describing a single, repeatable process.
          </p>
        </div>
      )}

      {nonNormal && (
        <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <p className="font-semibold">The normality assumption is doubtful</p>
          <p className="mt-1">
            Anderson{"\u2013"}Darling gives AD = {fx(r.adStat)} with p ={" "}
            {fx(r.adPValue)}, below 0,05. The PPM figures come from a fitted
            normal curve, and if the data are not normal those figures can be
            wrong by an order of magnitude {"\u2014"} usually in the tails, which
            is exactly what capability is about. Consider a non-normal analysis.
          </p>
        </div>
      )}

      {r.cp !== null && r.cpk !== null && Math.abs(r.cp - r.cpk) > 0.05 && (
        <div className="rounded-md border border-blue-300 bg-blue-50 px-4 py-3 text-sm text-blue-900">
          <p className="font-semibold">The process is off centre</p>
          <p className="mt-1">
            Cp = {fx(r.cp, 2)} but Cpk = {fx(r.cpk, 2)}. Cp measures only whether
            the spread would fit inside the tolerance; Cpk also accounts for
            where the process sits. The gap between them is what centring alone
            could recover, with no reduction in variation.
          </p>
        </div>
      )}

      {r.stdWithin > 0 && r.stdOverall / r.stdWithin > 1.2 && (
        <div className="rounded-md border border-blue-300 bg-blue-50 px-4 py-3 text-sm text-blue-900">
          <p className="font-semibold">
            Overall variation exceeds within-subgroup variation
          </p>
          <p className="mt-1">
            {fx(r.stdOverall)} against {fx(r.stdWithin)}. The extra spread is
            variation <em>between</em> subgroups: drift, shift changes, batch
            effects. Within-subgroup consistency is better than the long-run
            output, so the gain is in holding the process on target over time,
            not in tightening it moment to moment.
          </p>
        </div>
      )}

      <p className="text-xs text-gray-500">
        {r.n} observations
        {!r.individuals && (
          <>
            {" "}
            in {r.k} subgroups of {r.subgroupSize}
          </>
        )}
        . Control limits use{" "}
        {r.individuals
          ? "the mean moving range over d\u2082"
          : r.useSChart
          ? "S\u0304 over c\u2084"
          : "R\u0304 over d\u2082"}{" "}
        ({fx(r.sigmaChart, 4)}), while the capability indices use the pooled
        within-subgroup deviation corrected for bias ({fx(r.stdWithin, 4)}). The
        two differ by design.
        {r.nDropped > 0 && (
          <>
            {" "}
            {r.nDropped} trailing observation(s) left out: they do not complete a
            subgroup.
          </>
        )}
        {r.nMissing > 0 && <> {r.nMissing} non-numeric value(s) skipped.</>}
      </p>
    </div>
  );
}
