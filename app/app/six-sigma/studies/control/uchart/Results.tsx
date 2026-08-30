// app/app/six-sigma/studies/control/uchart/Results.tsx
"use client";
import React from "react";
import type { Data, Layout, Shape, Annotations } from "plotly.js";
import ResultChart from "../../../components/ResultChart";
import type { UChartResult, Violation } from "./types";

const fx = (v: number | null | undefined, dec = 2): string =>
  v === null || v === undefined || !Number.isFinite(v)
    ? "*"
    : v.toFixed(dec).replace(".", ",");

const BLUE = "#1d4ed8";
const RED = "#dc2626";
const GREEN = "#15803d";

export default function UChartResults({ result }: { result: UChartResult }) {
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

  // Escalonadas: con tamanos de inspeccion desiguales cada punto tiene su
  // propio limite, porque la sigma va con 1/raiz(n).
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
    step(r.ucl, RED, "dash"),
    step(r.lcl, RED, "dash"),
    step(r.cl, GREEN, "solid"),
    {
      x: xs,
      y: r.u,
      type: "scatter",
      mode: "lines+markers",
      line: { color: BLUE, width: 1 },
      marker: { color: BLUE, size: 5 },
      customdata: xs.map((i) => [r.c[i - 1], r.n[i - 1]]),
      hovertemplate:
        "Sample %{x}<br>u = %{y:.4g}<br>%{customdata[0]} defects in %{customdata[1]} unit(s)<extra></extra>",
    } as unknown as Data,
    {
      x: fl,
      y: fl.map((i) => r.u[i - 1]),
      type: "scatter",
      mode: "markers",
      marker: { color: RED, size: 8, symbol: "square" },
      hovertemplate: "Sample %{x}<br>u = %{y:.4g}<extra></extra>",
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
    margin: { l: 62, r: 100, t: 20, b: 40 },
    xaxis: {
      title: { text: "Sample", font: { size: 10 } },
      zeroline: false,
      tick0: 1,
      dtick: r.k > 40 ? 5 : 2,
    },
    yaxis: {
      title: { text: "Sample Count Per Unit", font: { size: 10 } },
      zeroline: false,
      rangemode: "tozero",
    },
    shapes,
    annotations: [
      tag(r.ucl[last], `UCL = ${fx(r.ucl[last])}`, RED),
      tag(r.cl[last], `u\u0305 = ${fx(r.cl[last])}`, GREEN),
      tag(r.lcl[last], `LCL = ${fx(r.lcl[last])}`, RED),
    ],
  };

  const over = r.dispersion > 1.4;
  const under = r.dispersion < 0.6;
  const many = r.flagged.length > r.k / 4;

  return (
    <div className="w-full space-y-4">
      <h3 className="text-center text-sm font-semibold text-gray-800">
        U Chart of {r.colName}
      </h3>

      <div className="rounded border border-gray-200" style={{ height: 320 }}>
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
              <th className="px-3 py-1 text-right font-medium">Units</th>
              <th className="px-3 py-1 text-right font-medium">Total units</th>
              <th className="px-3 py-1 text-right font-medium">Defects</th>
              <th className="px-3 py-1 text-right font-medium">U bar</th>
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
                <td className="px-3 py-1 text-right">
                  {r.commonN ?? `${r.minN}\u2013${r.maxN}`}
                </td>
                <td className="px-3 py-1 text-right">{fx(s.totalN, 0)}</td>
                <td className="px-3 py-1 text-right">{s.totalC}</td>
                <td className="px-3 py-1 text-right">{fx(s.uBar, 4)}</td>
                <td className="px-3 py-1 text-right">
                  {r.commonN === null
                    ? `${fx(Math.min(...r.lcl), 4)}\u2013${fx(
                        Math.max(...r.lcl),
                        4
                      )}`
                    : fx(r.lcl[s.from], 4)}
                </td>
                <td className="px-3 py-1 text-right">
                  {r.commonN === null
                    ? `${fx(Math.min(...r.ucl), 4)}\u2013${fx(
                        Math.max(...r.ucl),
                        4
                      )}`
                    : fx(r.ucl[s.from], 4)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- Tests --- */}
      <div>
        <p className="mb-1 text-xs font-semibold text-gray-800">
          Test Results for U Chart of {r.colName}
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
      {many && (
        <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <p className="font-semibold">
            {r.flagged.length} of {r.k} points out of control
          </p>
          <p className="mt-1">
            When this many points fail, the usual explanation is not that the
            process has that many special causes. It is that{" "}
            <strong>the Poisson model does not describe these data</strong>: the
            limits are built from the mean alone, and if the real variation
            exceeds it they end up far too narrow. Check the dispersion ratio
            below before opening a single investigation.
          </p>
        </div>
      )}

      {!many && r.flagged.length > 0 && (
        <div className="rounded-md border border-blue-300 bg-blue-50 px-4 py-3 text-sm text-blue-900">
          <p className="font-semibold">
            {r.flagged.length} subgroup{r.flagged.length === 1 ? "" : "s"} out of
            control
          </p>
          <p className="mt-1">
            Before hunting for a cause in the process, check the counting. On an
            attribute chart the commonest special cause is a change in the
            inspection itself {"\u2014"} a new inspector, a tightened criterion, a
            different definition of defect. Those move the rate exactly like real
            deterioration and cost nothing to rule out.
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
            independently and at a constant rate. When batches, shifts or products
            differ, the real variation exceeds the mean, the limits come out too
            narrow and the chart signals on ordinary noise. A Laney U{"\u2032"}
            chart, which widens the limits by this factor, is the standard remedy.
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
            quota being met, or an inspection size that is not really the amount
            inspected.
          </p>
        </div>
      )}

      {r.minExpected < 5 && (
        <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <p className="font-semibold">Small expected counts</p>
          <p className="mt-1">
            The smallest expected number of defects is {fx(r.minExpected, 1)}. The
            three-sigma limits come from a normal approximation to the Poisson,
            which needs an expected count of roughly 5 or more. Below that the
            distribution is visibly skewed, the symmetric limits are wrong on the
            short side, and the false alarm rate is not the nominal one. Larger
            inspection units are the way out.
          </p>
        </div>
      )}

      {r.flagged.length === 0 && !over && !under && (
        <div className="rounded-md border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          <p className="font-semibold">No points out of control</p>
          <p className="mt-1">
            The defect rate is stable at {fx(s0.uBar, 3)} per unit. Stable is not
            the same as acceptable: a controlled process simply keeps producing
            the same rate, and only a deliberate change to the process will lower
            it.
          </p>
        </div>
      )}

      <p className="text-xs text-gray-500">
        {r.k} subgroups
        {r.commonN !== null
          ? ` of ${r.commonN} unit(s)`
          : ` of ${r.minN} to ${r.maxN} units`}
        , {s0.totalC} defects in {fx(s0.totalN, 0)} inspection units
        {r.usedHistorical && ", historical rate supplied"}. Dispersion ratio{" "}
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
