// app/app/six-sigma/studies/capability/nonnormal/Results.tsx
"use client";
import React from "react";
import type { Data, Layout } from "plotly.js";
import ResultChart from "../../../components/ResultChart";
import { distPDF } from "./distributions";
import type { CapNonnormalResult } from "./types";

const fx = (v: number | null, dec = 2): string => {
  if (v === null || !Number.isFinite(v)) return "*";
  return v.toFixed(dec).replace(".", ",");
};

const RED = "#dc2626";
const NAVY = "#1e3a8a";

const Block = ({
  title,
  rows,
}: {
  title: string;
  rows: [string, string][];
}) => (
  <div>
    <p className="mb-1 text-xs font-semibold text-gray-800">{title}</p>
    <table className="text-xs">
      <tbody>
        {rows.map(([k, v]) => (
          <tr key={k}>
            <td className="pr-3 text-gray-600">{k}</td>
            <td className="text-right font-mono">{v}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default function CapNonnormalResults({
  result,
}: {
  result: CapNonnormalResult;
}) {
  if (!result.ok) {
    return (
      <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        {result.error ?? "Select a column and at least one specification limit."}
      </div>
    );
  }

  const r = result;
  const { fit } = r;
  const oneParam = fit.id === "exponential";

  // --- Histograma con la densidad ajustada superpuesta --------------------
  const [x0, x1] = r.xRange;
  const nBins = Math.max(8, Math.ceil(Math.sqrt(r.n)));
  const binW = (x1 - x0) / nBins;
  const scale = r.n * binW;

  const grid: number[] = [];
  for (let i = 0; i <= 400; i++) grid.push(x0 + ((x1 - x0) * i) / 400);

  const chartData: Data[] = [
    {
      x: r.values,
      type: "histogram",
      xbins: { start: x0, end: x1, size: binW },
      marker: { color: "#bfdbfe", line: { color: NAVY, width: 1 } },
      hovertemplate: "%{x}<br>Frequency: %{y}<extra></extra>",
    },
    {
      x: grid,
      y: grid.map((v) => distPDF(fit.id, v, fit.a, fit.b) * scale),
      type: "scatter",
      mode: "lines",
      line: { color: "#991b1b", width: 1.8 },
      hoverinfo: "skip",
    },
  ] as unknown as Data[];

  const specShapes = [r.lsl, r.usl]
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

  const specAnnots = [
    ...(r.lsl !== null ? [{ x: r.lsl, text: "LSL" }] : []),
    ...(r.usl !== null ? [{ x: r.usl, text: "USL" }] : []),
  ].map((s) => ({
    x: s.x,
    yref: "paper" as const,
    y: 1.02,
    yanchor: "bottom" as const,
    text: s.text,
    showarrow: false,
    font: { size: 10, color: RED },
  }));

  const layout: Partial<Layout> = {
    plot_bgcolor: "#ffffff",
    showlegend: false,
    hovermode: "closest",
    modebar: { orientation: "v" },
    bargap: 0.02,
    margin: { l: 52, r: 40, t: 26, b: 40 },
    xaxis: { range: [x0, x1], zeroline: false },
    yaxis: { title: { text: "Frequency" }, zeroline: false },
    shapes: specShapes,
    annotations: specAnnots,
  };

  // --- Bloques de texto ---------------------------------------------------
  const processRows: [string, string][] = [
    ["LSL", r.lsl === null ? "*" : fx(r.lsl, 0)],
    ["Target", r.target === null ? "*" : fx(r.target, 0)],
    ["USL", r.usl === null ? "*" : fx(r.usl, 0)],
    ["Sample Mean", fx(r.sampleMean, 4)],
    ["Sample N", String(r.n)],
    [oneParam ? "Mean" : "Shape", fx(fit.a, 5)],
    ...(oneParam ? [] : ([["Scale", fx(fit.b, 4)]] as [string, string][])),
  ];

  const observedRows: [string, string][] = [
    ["PPM < LSL", fx(r.obsBelow)],
    ["PPM > USL", fx(r.obsAbove)],
    ["PPM Total", fx(r.obsTotal)],
  ];

  const zRows: [string, string][] = [
    ["Z.Bench", fx(r.zBench)],
    ["Z.LSL", fx(r.zLsl)],
    ["Z.USL", fx(r.zUsl)],
    ["Ppk", fx(r.ppkZ)],
  ];

  const pctRows: [string, string][] = [
    ["Pp", fx(r.pp)],
    ["PPL", fx(r.ppl)],
    ["PPU", fx(r.ppu)],
    ["Ppk", fx(r.ppkPct)],
  ];

  const expectedRows: [string, string][] = [
    ["PPM < LSL", fx(r.expBelow)],
    ["PPM > USL", fx(r.expAbove)],
    ["PPM Total", fx(r.expTotal)],
  ];

  const best = r.allFits.find((f) => f.ok);
  const betterFit = best && best.id !== fit.id ? best : null;
  const weakFit = fit.adP !== null && fit.adP < 0.05;

  return (
    <div className="w-full space-y-4">
      <div className="text-center">
        <h3 className="text-sm font-semibold text-gray-800">
          Process Capability Report for {r.colName}
        </h3>
        <p className="text-xs text-gray-500">
          Calculations based on {fit.label} distribution model
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[170px_1fr_190px]">
        <div className="space-y-4">
          <Block title="Process Data" rows={processRows} />
          <Block title="Observed Performance" rows={observedRows} />
        </div>

        <div className="rounded border border-gray-200" style={{ height: 320 }}>
          <ResultChart data={chartData} layout={{ autosize: true, ...layout }} />
        </div>

        <div className="space-y-4">
          <Block title="Overall Capability (Z)" rows={zRows} />
          <Block title={`Overall Capability (K = ${fx(r.k, 0)})`} rows={pctRows} />
          <Block title="Exp. Overall Performance" rows={expectedRows} />
        </div>
      </div>

      <p className="text-center text-xs text-gray-500">
        The actual process spread is represented by {fx(r.k, 0)} sigma.
      </p>

      {/* --- Los dos Ppk --- */}
      <div className="rounded-md border border-blue-300 bg-blue-50 px-4 py-3 text-sm text-blue-900">
        <p className="font-semibold">There are two Ppk here, and they differ</p>
        <p className="mt-1">
          <strong>Benchmark Z</strong> gives Ppk = {fx(r.ppkZ)}: the expected
          fraction outside specification is converted into the normal Z that
          would produce the same risk, and divided by three. It answers{" "}
          <em>how much scrap</em>.
        </p>
        <p className="mt-1">
          <strong>Percentiles</strong> give Ppk = {fx(r.ppkPct)}: the tolerance is
          compared with the distance from the median to the {fx(r.k, 0)}-sigma
          percentiles ({fx(r.xLow, 3)} and {fx(r.xHigh, 3)}, median{" "}
          {fx(r.xMid, 3)}). It answers <em>how well the spread fits</em>.
        </p>
        <p className="mt-1">
          Neither is wrong. On a skewed distribution they can differ by a factor
          of two or three, so quote which one you used. Minitab shows one or the
          other depending on a radio button in Options; both are shown here.
        </p>
      </div>

      {/* --- Calidad del ajuste --- */}
      <div>
        <p className="mb-1 text-xs font-semibold text-gray-800">
          Goodness of fit, all candidates
        </p>
        <div className="overflow-x-auto rounded border border-gray-200">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-3 py-1 text-left font-medium">Distribution</th>
                <th className="px-3 py-1 text-right font-medium">AD</th>
                <th className="px-3 py-1 text-right font-medium">P</th>
                <th className="px-3 py-1 text-left font-medium">Parameters</th>
              </tr>
            </thead>
            <tbody>
              {r.allFits.map((f) => (
                <tr
                  key={f.id}
                  className={
                    f.id === fit.id
                      ? "bg-emerald-50 font-semibold"
                      : "border-t border-gray-100"
                  }
                >
                  <td className="px-3 py-1">
                    {f.label}
                    {f.id === fit.id && " \u2190 selected"}
                  </td>
                  <td className="px-3 py-1 text-right font-mono">
                    {f.ok ? fx(f.ad, 3) : "\u2014"}
                  </td>
                  <td className="px-3 py-1 text-right font-mono">
                    {f.ok ? (f.adP === null ? "*" : fx(f.adP, 3)) : "\u2014"}
                  </td>
                  <td className="px-3 py-1 font-mono text-gray-600">
                    {f.ok
                      ? f.id === "exponential"
                        ? fx(f.a, 4)
                        : `${fx(f.a, 4)} / ${fx(f.b, 4)}`
                      : f.error ?? ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Lower AD is a closer fit. A <code>*</code> in the P column means no
          reliable published table exists for that family, not that the fit
          failed {"\u2014"} an invented p-value would be worse than none.
        </p>
      </div>

      {weakFit && (
        <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <p className="font-semibold">The chosen model fits poorly</p>
          <p className="mt-1">
            The {fit.label} fit gives AD = {fx(fit.ad, 3)} with p ={" "}
            {fx(fit.adP, 3)}, below 0,05. Every PPM figure above is read off this
            curve in its tails, which is precisely where a poor fit does most
            damage. Treat the numbers as indicative until a better model is
            found.
          </p>
        </div>
      )}

      {betterFit && (
        <div className="rounded-md border border-blue-300 bg-blue-50 px-4 py-3 text-sm text-blue-900">
          <p className="font-semibold">
            Another distribution fits these data more closely
          </p>
          <p className="mt-1">
            {betterFit.label} gives AD = {fx(betterFit.ad, 3)} against{" "}
            {fx(fit.ad, 3)} for {fit.label}. A smaller AD is not by itself a
            reason to switch {"\u2014"} if the physics of the process points to a
            particular family, keep it {"\u2014"} but it is worth checking how
            much the PPM change.
          </p>
        </div>
      )}

      {(r.lslBoundary || r.uslBoundary) && (
        <div className="rounded-md border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-700">
          <p className="font-semibold">Boundary in force</p>
          <p className="mt-1">
            The{" "}
            {r.lslBoundary && r.uslBoundary
              ? "lower and upper limits are"
              : r.lslBoundary
              ? "lower limit is"
              : "upper limit is"}{" "}
            treated as a physical boundary, so no expected defects are counted
            there and the corresponding Z is left blank. Use this only when the
            value is unreachable, not merely undesirable.
          </p>
        </div>
      )}

      {r.expTotal > 0 &&
        Math.abs(r.expTotal - r.obsTotal) / Math.max(r.obsTotal, 1) > 0.25 && (
          <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <p className="font-semibold">
              Observed and expected performance disagree
            </p>
            <p className="mt-1">
              {fx(r.obsTotal)} PPM counted against {fx(r.expTotal)} PPM predicted
              by the model. The observed figure is what the sample actually did;
              the expected one is what the fitted curve says. A wide gap usually
              means the model is not describing the tails well.
            </p>
          </div>
        )}

      <p className="text-xs text-gray-500">
        {r.n} observations. Parameters estimated by maximum likelihood; the model
        mean is {fx(r.modelMean, 4)} against a sample mean of{" "}
        {fx(r.sampleMean, 4)}.
        {r.nMissing > 0 && <> {r.nMissing} non-numeric value(s) skipped.</>}
      </p>
    </div>
  );
}
