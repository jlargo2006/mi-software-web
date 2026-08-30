// app/app/six-sigma/studies/control/mrchart/Results.tsx
"use client";
import React from "react";
import type { Data, Layout, Shape, Annotations } from "plotly.js";
import ResultChart from "../../../components/ResultChart";
import type { MRResult, Violation } from "./types";

const fx = (v: number | null | undefined, dec = 4): string =>
  v === null || v === undefined || !Number.isFinite(v)
    ? "*"
    : v.toFixed(dec).replace(".", ",");

const BLUE = "#1d4ed8";
const RED = "#dc2626";
const GREEN = "#15803d";
const GREY = "#9ca3af";

export default function MRResults({ result }: { result: MRResult }) {
  if (!result.ok) {
    return (
      <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        {result.error ?? "Select the column of individual values."}
      </div>
    );
  }

  const r = result;
  const single = r.stages.length === 1;
  const xs = r.obsOf;
  const flagSet = new Set(r.flagged);
  const fl = xs.filter((o) => flagSet.has(o));

  const line = (v: number[], color: string, dash: "solid" | "dash"): Data =>
    ({
      x: xs,
      y: v,
      type: "scatter",
      mode: "lines",
      // "hvh" escalona centrado en cada punto: horizontal sobre la
      // observacion y salto vertical en el punto medio. Solo se nota cuando
      // hay etapas, que es cuando los limites cambian.
      line: { color, width: 1.2, dash, shape: "hvh" },
      hoverinfo: "skip",
    } as unknown as Data);

  const traces: Data[] = [line(r.ucl, RED, "dash")];

  // Lineas adicionales de sigma, si se han pedido.
  for (const kk of r.extraSigma) {
    const up = r.cl.map((c, i) => c + (kk * r.d3 * c) / r.d2);
    const lo = r.cl.map((c, i) => Math.max(0, c - (kk * r.d3 * c) / r.d2));
    traces.push(line(up, GREY, "dash"), line(lo, GREY, "dash"));
  }

  traces.push(
    line(r.lcl, RED, "dash"),
    line(r.cl, GREEN, "solid"),
    {
      x: xs,
      y: r.mr,
      type: "scatter",
      mode: "lines+markers",
      line: { color: BLUE, width: 1 },
      marker: { color: BLUE, size: 5 },
      hovertemplate:
        "Observation %{x}<br>moving range = %{y:.4g}<extra></extra>",
    } as unknown as Data,
    {
      x: fl,
      y: fl.map((o) => r.mr[xs.indexOf(o)]),
      type: "scatter",
      mode: "markers",
      marker: { color: RED, size: 8, symbol: "square" },
      hovertemplate: "Observation %{x}<br>MR = %{y:.4g}<extra></extra>",
    } as unknown as Data
  );

  const shapes: Partial<Shape>[] = r.stages.slice(1).map((s) => ({
    type: "line",
    x0: r.obsOf[s.from] - 0.5,
    x1: r.obsOf[s.from] - 0.5,
    yref: "paper",
    y0: 0,
    y1: 1,
    line: { color: GREY, width: 1, dash: "dot" },
  }));

  const last = r.k - 1;
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
    margin: { l: 60, r: 100, t: 20, b: 40 },
    xaxis: {
      title: { text: "Observation", font: { size: 10 } },
      zeroline: false,
      dtick: r.m > 40 ? 5 : 3,
    },
    yaxis: {
      title: { text: "Moving Range", font: { size: 10 } },
      zeroline: false,
      rangemode: "tozero",
    },
    shapes,
    annotations: [
      tag(r.ucl[last], `UCL = ${fx(r.ucl[last], 2)}`, RED),
      tag(r.cl[last], `MR\u0305 = ${fx(r.cl[last], 2)}`, GREEN),
      tag(r.lcl[last], `LCL = ${fx(r.lcl[last], 2)}`, RED),
    ],
  };

  const s0 = r.stages[0];

  return (
    <div className="w-full space-y-4">
      <div className="text-center">
        <h3 className="text-sm font-semibold text-gray-800">
          Moving Range Chart of {r.colName}
        </h3>
        {r.span > 2 && (
          <p className="text-xs text-gray-600">
            Moving range of length {r.span}
          </p>
        )}
      </div>

      <div className="rounded border border-gray-200" style={{ height: 320 }}>
        <ResultChart data={traces} layout={{ autosize: true, ...layout }} />
      </div>

      <div className="overflow-x-auto rounded border border-gray-200">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              {single ? null : (
                <th className="px-3 py-1 text-left font-medium">Stage</th>
              )}
              <th className="px-3 py-1 text-right font-medium">Ranges</th>
              <th className="px-3 py-1 text-right font-medium">MR bar</th>
              <th className="px-3 py-1 text-right font-medium">
                Sigma (MR bar / d{"\u2082"})
              </th>
              <th className="px-3 py-1 text-right font-medium">LCL</th>
              <th className="px-3 py-1 text-right font-medium">UCL</th>
            </tr>
          </thead>
          <tbody>
            {r.stages.map((s, i) => (
              <tr key={i} className="border-t border-gray-100 font-mono">
                {single ? null : (
                  <td className="px-3 py-1 font-sans">{s.label || i + 1}</td>
                )}
                <td className="px-3 py-1 text-right">{s.nUsed}</td>
                <td className="px-3 py-1 text-right">{fx(s.mrBar, 5)}</td>
                <td className="px-3 py-1 text-right">{fx(s.sigma, 5)}</td>
                <td className="px-3 py-1 text-right">{fx(s.lcl, 4)}</td>
                <td className="px-3 py-1 text-right">{fx(s.ucl, 4)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- Tests --- */}
      <div>
        <p className="mb-1 text-xs font-semibold text-gray-800">
          Test Results for Moving Range Chart of {r.colName}
        </p>
        {r.violations.length === 0 ? (
          <p className="text-xs text-gray-500">No test failures.</p>
        ) : (
          <div className="space-y-1">
            {r.violations.map((v: Violation) => (
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

      {/* --- Aviso permanente: el acoplamiento entre rangos --- */}
      <div className="rounded-md border border-blue-300 bg-blue-50 px-4 py-3 text-sm text-blue-900">
        <p className="font-semibold">
          A moving range chart cannot be read on its own
        </p>
        <p className="mt-1">
          Consecutive moving ranges share an observation, so{" "}
          <strong>a single unusual value produces two large ranges in a
          row</strong> {"\u2014"} which looks exactly like a genuine increase in
          variability. Nothing in this chart distinguishes the two cases. The
          largest range here is {fx(r.maxMr, 4)} at observation {r.maxMrAt}; look at
          the individuals chart to see whether that is one odd value or a real
          change in spread.
        </p>
        <p className="mt-1">
          The same overlap makes the run tests optimistic: points are not
          independent, so runs and trends arise more readily than the tests assume.
          Test 1 is the one to trust here.
        </p>
      </div>

      {r.lclStructural && (
        <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <p className="font-semibold">The lower limit is zero by construction</p>
          <p className="mt-1">
            With a moving range of length {r.span}, D{"\u2083"} = 1 {"\u2212"} 3d
            {"\u2083"}/d{"\u2082"} = 1 {"\u2212"} 3 {"\u00D7"} {fx(r.d3, 4)} /{" "}
            {fx(r.d2, 3)} comes out negative, so it is set to zero. That is not a
            clip: it means{" "}
            <strong>this chart cannot signal a reduction in variability</strong>,
            only an increase. An improvement in consistency will show up as points
            drifting towards zero and as test 2, never as a point below a limit.
          </p>
        </div>
      )}

      {r.flagged.length > 0 && (
        <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <p className="font-semibold">
            {r.flagged.length} point{r.flagged.length === 1 ? "" : "s"} out of
            control
          </p>
          <p className="mt-1">
            The short-term variability is not stable, and that matters before
            anything else:{" "}
            <strong>the limits of any individuals chart are computed from MR
            bar</strong>. If the spread is unstable, MR bar is an average of
            different things and the individuals limits it produces are not
            trustworthy either. Resolve this chart first.
          </p>
        </div>
      )}

      {r.flagged.length === 0 && (
        <div className="rounded-md border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          <p className="font-semibold">Short-term variability appears stable</p>
          <p className="mt-1">
            No point exceeds the limits, so MR bar = {fx(s0.mrBar, 4)} is a fair
            summary of the point-to-point variation and the sigma it implies,{" "}
            {fx(s0.sigma, 4)}, can be used for individuals limits and for capability.
            Note that stable spread says nothing about the level: only the
            individuals chart can speak to that.
          </p>
        </div>
      )}

      <p className="text-xs text-gray-500">
        {r.m} observations giving {r.k} moving ranges of length {r.span}. MR
        {"\u0305"} = {fx(s0.mrBar, 5)}, sigma = MR{"\u0305"}/d{"\u2082"} ={" "}
        {fx(s0.mrBar, 5)}/{fx(r.d2, 3)} = {fx(s0.sigma, 5)}. Limits from D
        {"\u2083"} = {fx(r.D3, 4)} and D{"\u2084"} = {fx(r.D4, 4)}, i.e. 1{" "}
        {"\u00B1"} 3 {"\u00D7"} {fx(r.d3, 4)}/{fx(r.d2, 3)}
        {r.usedHistorical && "; historical sigma supplied"}.
        {r.omitted.length > 0 && (
          <>
            {" "}
            {r.omitted.length} observation(s) omitted from the estimate:{" "}
            {r.omitted.join("; ")}. Still plotted and still tested.
          </>
        )}
        {r.notes.map((t, i) => (
          <React.Fragment key={i}> {t}</React.Fragment>
        ))}
      </p>
    </div>
  );
}
