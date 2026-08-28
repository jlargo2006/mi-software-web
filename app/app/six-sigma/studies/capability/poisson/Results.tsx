// app/app/six-sigma/studies/capability/poisson/Results.tsx
"use client";
import React from "react";
import type { Data, Layout } from "plotly.js";
import ResultChart from "../../../components/ResultChart";
import type { CapPoissonResult } from "./types";

const fx = (v: number, dec = 4): string =>
  Number.isFinite(v) ? v.toFixed(dec).replace(".", ",") : "*";

const BLUE = "#1d4ed8";
const RED = "#dc2626";
const GREEN = "#15803d";

const Panel = ({
  title,
  children,
  height = 300,
}: {
  title: string;
  children: React.ReactNode;
  height?: number;
}) => (
  <div>
    <h4 className="mb-1 text-sm font-semibold text-gray-800">{title}</h4>
    <div className="rounded border border-gray-200" style={{ height }}>
      {children}
    </div>
  </div>
);

export default function CapPoissonResults({
  result,
}: {
  result: CapPoissonResult;
}) {
  if (!result.ok) {
    return (
      <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        {result.error ?? "Select the defects column and the subgroup sizes."}
      </div>
    );
  }

  const r = result;
  const samples = r.points.map((p) => p.sample);
  const inControl = r.points.filter((p) => p.violations.length === 0);
  const flagged = r.points.filter((p) => p.violations.length > 0);

  const base: Partial<Layout> = {
    plot_bgcolor: "#ffffff",
    showlegend: false,
    hovermode: "closest",
    margin: { l: 60, r: 70, t: 10, b: 42 },
  };

  // --- 1 · U Chart ---------------------------------------------------------
  const uChart: Data[] = [
    {
      x: samples,
      y: r.points.map((p) => p.ucl),
      type: "scatter",
      mode: "lines",
      line: { color: RED, width: 1.2, shape: "hv" },
      hoverinfo: "skip",
    },
    {
      x: samples,
      y: r.points.map((p) => p.lcl),
      type: "scatter",
      mode: "lines",
      line: { color: RED, width: 1.2, shape: "hv" },
      hoverinfo: "skip",
    },
    {
      x: samples,
      y: r.points.map((p) => p.dpu),
      type: "scatter",
      mode: "lines+markers",
      line: { color: BLUE, width: 1.2 },
      marker: { color: BLUE, size: 6 },
      customdata: r.points.map((p) => [p.defects, p.n]),
      hovertemplate:
        "Sample %{x}<br>DPU: %{y:.4f}<br>" +
        "%{customdata[0]} defects in %{customdata[1]} units<extra></extra>",
    },
  ] as unknown as Data[];

  if (flagged.length > 0) {
    uChart.push({
      x: flagged.map((p) => p.sample),
      y: flagged.map((p) => p.dpu),
      type: "scatter",
      mode: "markers+text",
      marker: { color: RED, size: 9, symbol: "square" },
      text: flagged.map((p) => p.violations.join(",")),
      textposition: "top center",
      textfont: { size: 9, color: RED },
      hovertemplate:
        "Sample %{x}<br>DPU: %{y:.4f}<br>Test %{text}<extra></extra>",
    } as unknown as Data);
  }

  const uLayout: Partial<Layout> = {
    ...base,
    xaxis: { title: { text: "Sample" }, zeroline: false },
    yaxis: { title: { text: "Sample Count Per Unit" }, zeroline: false, rangemode: "tozero" },
    shapes: [
      {
        type: "line",
        xref: "paper",
        x0: 0,
        x1: 1,
        y0: r.uBar,
        y1: r.uBar,
        line: { color: GREEN, width: 1.2 },
      },
    ],
    annotations: [
      { y: r.labelUcl, text: `UCL = ${fx(r.labelUcl, 3)}`, color: RED },
      {
        y: r.uBar,
        text: `${r.historicalMu !== null ? "\u03BC" : "U\u0304"} = ${fx(r.uBar, 3)}`,
        color: GREEN,
      },
      { y: r.labelLcl, text: `LCL = ${fx(r.labelLcl, 3)}`, color: RED },
    ].map((a) => ({
      xref: "paper" as const,
      x: 1,
      xanchor: "left" as const,
      y: a.y,
      yanchor: "middle" as const,
      text: a.text,
      showarrow: false,
      font: { size: 9, color: a.color },
    })),
  };

  // --- 2 · Defect Rate ----------------------------------------------------
  // DPU contra tamano de muestra. Las bandas son hiperbolas, no rectas:
  // dependen de raiz(u / n), asi que se estrechan al crecer n.
  const gLo = Math.max(r.minN * 0.85, 0.1);
  const gHi = r.maxN * 1.1;
  const grid: number[] = [];
  for (let i = 0; i <= 80; i++) grid.push(gLo + ((gHi - gLo) * i) / 80);
  const bandU = grid.map((n) => r.uBar + 3 * Math.sqrt(r.uBar / n));
  const bandL = grid.map((n) => Math.max(0, r.uBar - 3 * Math.sqrt(r.uBar / n)));

  const rateChart: Data[] = [
    {
      x: grid,
      y: bandU,
      type: "scatter",
      mode: "lines",
      line: { color: RED, width: 1.2 },
      hoverinfo: "skip",
    },
    {
      x: grid,
      y: bandL,
      type: "scatter",
      mode: "lines",
      line: { color: RED, width: 1.2 },
      hoverinfo: "skip",
    },
    {
      x: inControl.map((p) => p.n),
      y: inControl.map((p) => p.dpu),
      type: "scatter",
      mode: "markers",
      marker: { color: BLUE, size: 6 },
      hovertemplate: "n = %{x}<br>DPU: %{y:.4f}<extra></extra>",
    },
  ] as unknown as Data[];

  if (flagged.length > 0) {
    rateChart.push({
      x: flagged.map((p) => p.n),
      y: flagged.map((p) => p.dpu),
      type: "scatter",
      mode: "markers",
      marker: { color: RED, size: 8, symbol: "square" },
      hovertemplate: "n = %{x}<br>DPU: %{y:.4f}<extra></extra>",
    } as unknown as Data);
  }

  const rateLayout: Partial<Layout> = {
    ...base,
    margin: { l: 60, r: 20, t: 10, b: 42 },
    xaxis: { title: { text: "Sample Size" }, zeroline: false },
    yaxis: { title: { text: "DPU" }, zeroline: false, rangemode: "tozero" },
    shapes: [
      {
        type: "line",
        xref: "paper",
        x0: 0,
        x1: 1,
        y0: r.uBar,
        y1: r.uBar,
        line: { color: GREEN, width: 1.2 },
      },
    ],
  };

  // --- 3 · Cumulative DPU -------------------------------------------------
  const cumChart: Data[] = [
    {
      x: r.cumulative.map((c) => c.sample),
      y: r.cumulative.map((c) => c.dpu),
      type: "scatter",
      mode: "lines+markers",
      line: { color: BLUE, width: 1.2 },
      marker: { color: BLUE, size: 5 },
      hovertemplate: "Sample %{x}<br>Cumulative DPU: %{y:.4f}<extra></extra>",
    },
  ] as unknown as Data[];

  const hline = (y: number, color: string, dash: "dash" | "dot") => ({
    type: "line" as const,
    xref: "paper" as const,
    x0: 0,
    x1: 1,
    y0: y,
    y1: y,
    line: { color, width: dash === "dash" ? 1.2 : 1, dash },
  });

  const cumLayout: Partial<Layout> = {
    ...base,
    xaxis: { title: { text: "Sample" }, zeroline: false },
    yaxis: { title: { text: "DPU" }, zeroline: false },
    shapes: [
      hline(r.meanDpu, GREEN, "dash"),
      hline(r.dpuUpper, "#9ca3af", "dot"),
      hline(r.dpuLower, "#9ca3af", "dot"),
    ],
  };

  // --- 4 · Histogram ------------------------------------------------------
  // Mismo criterio que en binomial: anchura redonda arrancando en el minimo,
  // que deja el objetivo en un borde de clase y no enterrado en una barra.
  const dpus = r.points.map((p) => p.dpu);
  const hLo = Math.min(...dpus);
  const hHi = Math.max(...dpus);
  const rawW = (hHi - hLo) / Math.ceil(Math.log2(r.k) + 1) || 1;
  const mag = Math.pow(10, Math.floor(Math.log10(rawW)));
  const nw = rawW / mag;
  const binW = (nw <= 1 ? 1 : nw <= 2 ? 2 : nw <= 5 ? 5 : 10) * mag;

  const histChart: Data[] = [
    {
      x: dpus,
      type: "histogram",
      xbins: { start: hLo, end: hHi + binW, size: binW },
      marker: { color: "#93c5fd", line: { color: "#1e3a8a", width: 1 } },
      hovertemplate: "DPU: %{x}<br>Frequency: %{y}<extra></extra>",
    },
  ] as unknown as Data[];

  const histLayout: Partial<Layout> = {
    ...base,
    margin: { l: 60, r: 20, t: 10, b: 42 },
    bargap: 0.02,
    xaxis: { title: { text: "DPU" }, zeroline: false },
    yaxis: { title: { text: "Frequency" }, zeroline: false },
    shapes:
      r.target !== null
        ? [
            {
              type: "line",
              x0: r.target,
              x1: r.target,
              yref: "paper",
              y0: 0,
              y1: 1,
              line: { color: GREEN, width: 2, dash: "dash" },
            },
          ]
        : [],
    annotations:
      r.target !== null
        ? [
            {
              x: r.target,
              yref: "paper" as const,
              y: 1,
              yanchor: "bottom" as const,
              text: "Target",
              showarrow: false,
              font: { size: 10, color: GREEN },
            },
          ]
        : [],
  };

  const row = (l: string, v: string, strong = false) => (
    <tr key={l} className={strong ? "font-semibold" : ""}>
      <td className="py-0.5 pr-4 text-gray-600 whitespace-nowrap">{l}</td>
      <td className="py-0.5 text-right whitespace-nowrap">{v}</td>
    </tr>
  );

  // Deriva relevante: mitades que difieren en mas del 40 %.
  const drift =
    r.dpuFirstHalf > 0 &&
    Math.abs(r.dpuSecondHalf - r.dpuFirstHalf) / r.dpuFirstHalf > 0.4;

  return (
    <div className="w-full space-y-4">
      <h3 className="text-center text-sm font-semibold text-gray-800">
        Poisson Process Capability Report for {r.colName}
      </h3>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel title="U Chart">
          <ResultChart data={uChart} layout={{ autosize: true, ...uLayout }} />
        </Panel>
        <Panel title="Defect Rate">
          <ResultChart data={rateChart} layout={{ autosize: true, ...rateLayout }} />
        </Panel>
        <Panel title="Cumulative DPU">
          <ResultChart data={cumChart} layout={{ autosize: true, ...cumLayout }} />
        </Panel>
        <Panel title="Histogram">
          <ResultChart data={histChart} layout={{ autosize: true, ...histLayout }} />
        </Panel>
      </div>

      {/* Bloque de estadisticos, debajo de la rejilla de cuatro */}
      <div className="flex justify-center">
        <div className="rounded border border-gray-200 px-6 py-3">
          <p className="mb-2 text-center text-xs font-semibold text-gray-700">
            Summary Stats
            <span className="ml-1 font-normal text-gray-500">
              ({fx(r.confidence, 1)}% confidence)
            </span>
          </p>
          <table className="text-sm">
            <tbody>
              {row("Mean DPU", fx(r.meanDpu, 4), true)}
              {row("Lower CI", fx(r.dpuLower, 4))}
              {row("Upper CI", fx(r.dpuUpper, 4))}
              {row("Min DPU", fx(r.minDpu, 4))}
              {row("Max DPU", fx(r.maxDpu, 4))}
              {r.target !== null && row("Targ DPU", fx(r.target, 4))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Interpretacion --- */}
      {r.outOfControl.length > 0 ? (
        <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <p className="font-semibold">
            The process is not stable: {r.outOfControl.length} of {r.k} subgroups
            out of control
          </p>
          <p className="mt-1">
            Sample{r.outOfControl.length === 1 ? " " : "s "}
            <b>{r.outOfControl.join(", ")}</b> fail
            {r.outOfControl.length === 1 ? "s" : ""} a test for special causes.
            {r.outOfControl.length / r.k > 0.1 && (
              <>
                {" "}
                That is {fx((r.outOfControl.length / r.k) * 100, 0)} % of the
                subgroups, which is not an isolated incident: it is a process
                without a settled level.
              </>
            )}{" "}
            {fx(r.meanDpu, 4)} DPU is then an average over states the process
            passed through, and it describes none of them.
          </p>
          {r.belowLcl.length > 0 && r.aboveUcl.length > 0 && (
            <p className="mt-2">
              Note the direction. Sample{r.aboveUcl.length === 1 ? " " : "s "}
              <b>{r.aboveUcl.join(", ")}</b> sit above the upper limit, but{" "}
              <b>{r.belowLcl.join(", ")}</b> fall
              {r.belowLcl.length === 1 ? "s" : ""} <em>below</em> the lower one.
              A point under the LCL is not a problem to fix: it is a period that
              went better than the process can normally hold, and it is worth
              understanding for the opposite reason.
            </p>
          )}
        </div>
      ) : (
        <div className="rounded-md border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          <p className="font-semibold">The process appears stable</p>
          <p className="mt-1">
            No subgroup fails the selected tests, so {fx(r.meanDpu, 4)} DPU can be
            read as the level of the process, and the interval as the precision
            with which {fx(r.totalN, 0)} inspected units pin it down.
          </p>
        </div>
      )}

      {drift && (
        <div className="rounded-md border border-blue-300 bg-blue-50 px-4 py-3 text-sm text-blue-900">
          <p className="font-semibold">
            The rate {r.dpuSecondHalf < r.dpuFirstHalf ? "fell" : "rose"} during
            the study
          </p>
          <p className="mt-1">
            First half: {fx(r.dpuFirstHalf, 4)} DPU. Second half:{" "}
            {fx(r.dpuSecondHalf, 4)} DPU. That is a change of{" "}
            {fx(
              Math.abs((r.dpuSecondHalf - r.dpuFirstHalf) / r.dpuFirstHalf) * 100,
              0
            )}{" "}
            %, and the Cumulative DPU plot shows it as a trend rather than a
            settling curve.
          </p>
          <p className="mt-2">
            This matters more than the index. A single interval over these data
            mixes two different regimes, and it estimates neither. If the{" "}
            {r.dpuSecondHalf < r.dpuFirstHalf ? "improvement" : "deterioration"}{" "}
            has a known cause, split the data at that point and analyse the
            periods separately: the recent one is what predicts tomorrow.
          </p>
        </div>
      )}

      {r.target !== null && (
        <div
          className={`rounded-md border px-4 py-3 text-sm ${
            r.dpuLower > r.target
              ? "border-red-300 bg-red-50 text-red-800"
              : r.dpuUpper < r.target
              ? "border-emerald-300 bg-emerald-50 text-emerald-900"
              : "border-blue-300 bg-blue-50 text-blue-900"
          }`}
        >
          <p className="font-semibold">
            Against the target of {fx(r.target, 4)} DPU
          </p>
          <p className="mt-1">
            {r.dpuLower > r.target ? (
              <>
                The whole confidence interval lies above the target: the gap is
                real, not sampling noise. Even the most favourable reading of
                these data, {fx(r.dpuLower, 4)}, misses {fx(r.target, 4)}.
              </>
            ) : r.dpuUpper < r.target ? (
              <>
                The whole interval lies below the target: the process meets it
                with room to spare, since even the least favourable reading,{" "}
                {fx(r.dpuUpper, 4)}, stays under {fx(r.target, 4)}.
              </>
            ) : (
              <>
                The interval spans the target, so these data cannot tell whether
                the process meets it. More inspected units would be needed to
                decide.
              </>
            )}
          </p>
        </div>
      )}

      {r.unequal && (
        <p className="text-xs text-gray-500">
          Tests are performed with unequal sample sizes: subgroups range from{" "}
          {fx(r.minN, 0)} to {fx(r.maxN, 0)} units, so each point has its own
          control limits. The labelled UCL and LCL are those of the last subgroup
          (n = {fx(r.labelN, 0)}).
        </p>
      )}

      <p className="text-xs text-gray-500">
        {r.k} subgroups, {fx(r.totalN, 0)} units inspected,{" "}
        {fx(r.totalD, 0)} defects.
        {r.historicalMu !== null && (
          <>
            {" "}
            Control limits are centred on the historical {"\u03BC"} ={" "}
            {fx(r.historicalMu, 4)}, not on the {fx(r.uObserved, 4)} of these
            data.
          </>
        )}
        {r.nMissing > 0 && (
          <> {r.nMissing} row(s) skipped for a missing or non-numeric value.</>
        )}{" "}
        The confidence interval is exact, from the Poisson{"\u2013"}chi-square
        relationship, not the normal approximation.
      </p>
    </div>
  );
}
