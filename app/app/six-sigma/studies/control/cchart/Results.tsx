// app/app/six-sigma/studies/control/cchart/Results.tsx
"use client";
import React from "react";
import type { Data, Layout, Shape, Annotations } from "plotly.js";
import ResultChart from "../../../components/ResultChart";
import type { CChartResult, Violation } from "./types";

const fx = (v: number | null | undefined, dec = 2): string =>
  v === null || v === undefined || !Number.isFinite(v)
    ? "*"
    : v.toFixed(dec).replace(".", ",");

const BLUE = "#1d4ed8";
const RED = "#dc2626";
const GREEN = "#15803d";

export default function CChartResults({ result }: { result: CChartResult }) {
  if (!result.ok) {
    return (
      <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        {result.error ?? "Select the column of defect counts."}
      </div>
    );
  }

  const r = result;
  const single = r.stages.length === 1;
  const s0 = r.stages[0];
  const xs = Array.from({ length: r.k }, (_, i) => i + 1);
  const flagSet = new Set(r.flagged);
  const fl = xs.filter((i) => flagSet.has(i));

  // Sin tamano de subgrupo los limites son constantes dentro de cada etapa;
  // solo cambian al cruzar una frontera.
  const line = (v: number[], color: string, dash: "solid" | "dash"): Data =>
    ({
      x: xs,
      y: v,
      type: "scatter",
      mode: "lines",
      line: { color, width: 1.2, dash },
      hoverinfo: "skip",
    } as unknown as Data);

  const traces: Data[] = [
    line(r.ucl, RED, "dash"),
    line(r.lcl, RED, "dash"),
    line(r.cl, GREEN, "solid"),
    {
      x: xs,
      y: r.c,
      type: "scatter",
      mode: "lines+markers",
      line: { color: BLUE, width: 1 },
      marker: { color: BLUE, size: 5 },
      hovertemplate: "Sample %{x}<br>%{y} defects<extra></extra>",
    } as unknown as Data,
    {
      x: fl,
      y: fl.map((i) => r.c[i - 1]),
      type: "scatter",
      mode: "markers",
      marker: { color: RED, size: 8, symbol: "square" },
      hovertemplate: "Sample %{x}<br>%{y} defects<extra></extra>",
    } as unknown as Data,
  ];

  const shapes: Partial<Shape>[] = r.stages.slice(1).map((s) => ({
    type: "line",
    x0: s.from + 0.5,
    x1: s.from + 0.5,
    yref: "paper",
    y0: 0,
    y1: 1,
    line: { color: "#9ca3af", width: 1, dash: "dot" },
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
    margin: { l: 58, r: 100, t: 20, b: 40 },
    xaxis: {
      title: { text: "Sample", font: { size: 10 } },
      zeroline: false,
      tick0: 1,
      dtick: r.k > 40 ? 5 : 2,
    },
    yaxis: {
      title: { text: "Sample Count", font: { size: 10 } },
      zeroline: false,
      rangemode: "tozero",
    },
    shapes,
    annotations: [
      tag(r.ucl[last], `UCL = ${fx(r.ucl[last], 3)}`, RED),
      tag(r.cl[last], `c\u0305 = ${fx(r.cl[last])}`, GREEN),
      tag(r.lcl[last], `LCL = ${fx(r.lcl[last])}`, RED),
    ],
  };

  const over = r.dispersion > 1.4;
  const under = r.dispersion < 0.6;
  const lowMean = Math.min(...r.stages.map((s) => s.cBar)) < 5;
  const noLower = r.clippedLow.some((v) => v);

  return (
    <div className="w-full space-y-4">
      <h3 className="text-center text-sm font-semibold text-gray-800">
        C Chart of {r.colName}
      </h3>

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
              <th className="px-3 py-1 text-right font-medium">Subgroups</th>
              <th className="px-3 py-1 text-right font-medium">Defects</th>
              <th className="px-3 py-1 text-right font-medium">C bar</th>
              <th className="px-3 py-1 text-right font-medium">StDev</th>
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
                <td className="px-3 py-1 text-right">{s.kUsed}</td>
                <td className="px-3 py-1 text-right">{s.totalC}</td>
                <td className="px-3 py-1 text-right">{fx(s.cBar, 4)}</td>
                <td className="px-3 py-1 text-right">{fx(s.sigma, 4)}</td>
                <td className="px-3 py-1 text-right">{fx(r.lcl[s.from], 4)}</td>
                <td className="px-3 py-1 text-right">{fx(r.ucl[s.from], 4)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- Tests --- */}
      <div>
        <p className="mb-1 text-xs font-semibold text-gray-800">
          Test Results for C Chart of {r.colName}
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

      {/* --- Lecturas --- */}
      {r.flagged.length > 0 && (
        <div className="rounded-md border border-blue-300 bg-blue-50 px-4 py-3 text-sm text-blue-900">
          <p className="font-semibold">
            {r.flagged.length} subgroup{r.flagged.length === 1 ? "" : "s"} out of
            control
          </p>
          <p className="mt-1">
            Before hunting for a cause in the process, check two things. That the
            amount inspected really was the same in every subgroup {"\u2014"} a
            longer shift or a larger area produces more defects on its own, and
            that is a U chart, not a special cause. And that the counting did not
            change: a new inspector or a tightened criterion moves the count
            exactly like real deterioration.
          </p>
        </div>
      )}

      {noLower && (
        <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <p className="font-semibold">The lower limit is zero</p>
          <p className="mt-1">
            With a mean of {fx(s0.cBar, 2)} the lower limit falls below zero and
            is clipped there, so <strong>the chart cannot detect an
            improvement</strong>: no count, not even zero defects, will ever fall
            below it. It only watches for things getting worse. A mean above 9 is
            needed before the lower limit lifts off zero, which in practice means
            grouping the counts over longer periods.
          </p>
        </div>
      )}

      {over && (
        <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <p className="font-semibold">
            Overdispersion: the points scatter {fx(r.dispersion, 2)} times more
            than the Poisson model allows
          </p>
          <p className="mt-1">
            The Poisson distribution has a single parameter: its variance equals
            its mean. That is a strong assumption {"\u2014"} defects must occur
            independently and at a constant rate. When they cluster instead, the
            real variation exceeds the mean, the limits come out too narrow and the
            chart signals on ordinary noise. A Laney chart, which widens the limits
            by this factor, is the standard remedy.
          </p>
        </div>
      )}

      {under && (
        <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <p className="font-semibold">
            Underdispersion: the points scatter only {fx(r.dispersion, 2)} of what
            the Poisson model allows
          </p>
          <p className="mt-1">
            Too little variation is as informative as too much. It usually means
            the counts are not independent {"\u2014"} sorted or adjusted data, a
            quota being met, or a reporting threshold that truncates the extremes.
          </p>
        </div>
      )}

      {lowMean && (
        <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <p className="font-semibold">Small expected count</p>
          <p className="mt-1">
            The mean is {fx(s0.cBar, 2)}. The three-sigma limits come from a normal
            approximation to the Poisson, which needs a mean of roughly 5 or more.
            Below that the distribution is visibly skewed {"\u2014"} its right tail
            is longer {"\u2014"} so symmetric limits do not split the risk evenly
            and the false alarm rate is not the nominal one. Counting over longer
            periods is the way out, not a different formula.
          </p>
        </div>
      )}

      {r.flagged.length === 0 && !over && !under && (
        <div className="rounded-md border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          <p className="font-semibold">No points out of control</p>
          <p className="mt-1">
            The count is stable around {fx(s0.cBar, 2)} defects per subgroup, and
            the variation is what a Poisson process of that rate produces on its
            own. Stable is not the same as acceptable: nothing here will change
            the rate except a deliberate change to the process.
          </p>
        </div>
      )}

      <p className="text-xs text-gray-500">
        {r.k} subgroups, {s0.totalC} defects, c{"\u0305"} = {fx(s0.cBar, 4)},
        {"\u00A0"}
        {"\u03C3"} = {"\u221A"}c{"\u0305"} = {fx(s0.sigma, 4)}
        {r.usedHistorical && ", historical mean supplied"}. Dispersion ratio{" "}
        {fx(r.dispersion, 2)}.
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
