// app/app/six-sigma/studies/control/laneyp/Results.tsx
"use client";
import React from "react";
import type { Data, Layout, Shape, Annotations } from "plotly.js";
import ResultChart from "../../../components/ResultChart";
import type { LaneyPResult, Violation } from "./types";

const fx = (v: number | null | undefined, dec = 4): string =>
  v === null || v === undefined || !Number.isFinite(v)
    ? "*"
    : v.toFixed(dec).replace(".", ",");

const BLUE = "#1d4ed8";
const RED = "#dc2626";
const GREEN = "#15803d";

export default function LaneyPResults({ result }: { result: LaneyPResult }) {
  if (!result.ok) {
    return (
      <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        {result.error ?? "Select the column of defectives."}
      </div>
    );
  }

  const r = result;
  const single = r.stages.length === 1;
  const s0 = r.stages[0];
  const xs = Array.from({ length: r.k }, (_, i) => i + 1);
  const flagSet = new Set(r.flagged);
  const fl = xs.filter((i) => flagSet.has(i));

  const line = (v: number[], color: string, dash: "solid" | "dash"): Data =>
    ({
      x: xs,
      y: v,
      type: "scatter",
      mode: "lines",
      line: { color, width: 1.2, dash, shape: step ? "hvh" : "linear" },
      hoverinfo: "skip",
    } as unknown as Data);

  const traces: Data[] = [
    line(r.ucl, RED, "dash", true),
    line(r.lcl, RED, "dash", true),
    line(r.cl, GREEN, "solid"),
    {
      x: xs,
      y: r.p,
      type: "scatter",
      mode: "lines+markers",
      line: { color: BLUE, width: 1 },
      marker: { color: BLUE, size: 5 },
      customdata: xs.map((i) => [r.d[i - 1], r.n[i - 1], r.z[i - 1]]),
      hovertemplate:
        "Sample %{x}<br>p = %{y:.4f}<br>%{customdata[0]} of %{customdata[1]}<br>z = %{customdata[2]:.2f}<extra></extra>",
    } as unknown as Data,
    {
      x: fl,
      y: fl.map((i) => r.p[i - 1]),
      type: "scatter",
      mode: "markers",
      marker: { color: RED, size: 8, symbol: "square" },
      hovertemplate: "Sample %{x}<br>p = %{y:.4f}<extra></extra>",
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
    margin: { l: 60, r: 100, t: 20, b: 40 },
    xaxis: {
      title: { text: "Sample", font: { size: 10 } },
      zeroline: false,
      tick0: 1,
      dtick: r.k > 40 ? 5 : 3,
    },
    yaxis: {
      title: { text: "Proportion", font: { size: 10 } },
      zeroline: false,
      rangemode: "tozero",
    },
    shapes,
    annotations: [
      tag(r.ucl[last], `UCL = ${fx(r.ucl[last])}`, RED),
      tag(r.cl[last], `P\u0305 = ${fx(r.cl[last])}`, GREEN),
      tag(r.lcl[last], `LCL = ${fx(r.lcl[last])}`, RED),
    ],
  };

  // Umbrales de lectura de Sigma Z.
  const marginal = r.sigmaZ < 1.2;
  const strong = r.sigmaZ >= 1.5;
  const held = r.sigmaZ === 1;

  return (
    <div className="w-full space-y-4">
      <div className="text-center">
        <h3 className="text-sm font-semibold text-gray-800">
          Laney P{"\u2032"} Chart of {r.colName}
        </h3>
        <p className="text-xs text-gray-600">Sigma Z = {fx(r.sigmaZ, 5)}</p>
      </div>

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
              <th className="px-3 py-1 text-right font-medium">n</th>
              <th className="px-3 py-1 text-right font-medium">Total units</th>
              <th className="px-3 py-1 text-right font-medium">Defectives</th>
              <th className="px-3 py-1 text-right font-medium">P bar</th>
              <th className="px-3 py-1 text-right font-medium">Sigma Z</th>
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
                <td className="px-3 py-1 text-right">{s.totalN}</td>
                <td className="px-3 py-1 text-right">{s.totalD}</td>
                <td className="px-3 py-1 text-right">{fx(s.pBar, 6)}</td>
                <td className="px-3 py-1 text-right">{fx(s.sigmaZ, 5)}</td>
                <td className="px-3 py-1 text-right">{fx(r.lcl[s.from])}</td>
                <td className="px-3 py-1 text-right">{fx(r.ucl[s.from])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- Tests --- */}
      <div>
        <p className="mb-1 text-xs font-semibold text-gray-800">
          Test Results for Laney P{"\u2032"} Chart of {r.colName}
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

      {/* --- Lecturas de Sigma Z --- */}
      {held && (
        <div className="rounded-md border border-blue-300 bg-blue-50 px-4 py-3 text-sm text-blue-900">
          <p className="font-semibold">Sigma Z held at 1</p>
          <p className="mt-1">
            The points scatter no more than the binomial model allows, so there is
            nothing to correct and this chart is identical to an ordinary P chart.
            The P{"\u2032"} chart never narrows the binomial limits {"\u2014"} it
            only widens them {"\u2014"} so underdispersion leaves it unchanged. Use
            the P chart and read its underdispersion warning instead.
          </p>
        </div>
      )}

      {!held && marginal && (
        <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <p className="font-semibold">
            Sigma Z = {fx(r.sigmaZ, 4)}: the correction is marginal
          </p>
          <p className="mt-1">
            Below about 1,2 Laney{"\u2019"}s own advice was to keep the ordinary P
            chart. The correction is of the same order as the uncertainty in
            estimating it: Sigma Z comes from {r.k - 1} moving ranges, and its own
            standard error is not much smaller than the {fx(
              (r.sigmaZ - 1) * 100,
              0
            )}{" "}
            % adjustment it is applying. A more complicated chart that says the same
            thing is not an improvement.
          </p>
        </div>
      )}

      {!held && !marginal && !strong && (
        <div className="rounded-md border border-blue-300 bg-blue-50 px-4 py-3 text-sm text-blue-900">
          <p className="font-semibold">
            Sigma Z = {fx(r.sigmaZ, 4)}: moderate overdispersion
          </p>
          <p className="mt-1">
            The points scatter about {fx((r.sigmaZ - 1) * 100, 0)} % more than the
            binomial allows, so the ordinary P limits are that much too narrow and
            some of its signals were false alarms. Worth comparing the two charts
            directly: any point that fails here would have failed there too, so the
            interesting question is which points the P chart flagged and this one
            does not.
          </p>
        </div>
      )}

      {strong && (
        <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <p className="font-semibold">
            Sigma Z = {fx(r.sigmaZ, 4)}: substantial overdispersion
          </p>
          <p className="mt-1">
            The real variation is {fx(r.sigmaZ, 2)} times the binomial. That is a
            finding in itself, not just a correction to apply: it says the units
            within a subgroup do not share one probability of being defective, so
            something systematic differs from batch to batch or shift to shift. This
            chart lets you monitor the process in spite of that, but{" "}
            <strong>the batch-to-batch difference is usually the bigger
            opportunity</strong> than anything the chart will flag.
          </p>
        </div>
      )}

      {r.flagged.length > 0 && (
        <div className="rounded-md border border-blue-300 bg-blue-50 px-4 py-3 text-sm text-blue-900">
          <p className="font-semibold">
            {r.flagged.length} subgroup{r.flagged.length === 1 ? "" : "s"} out of
            control on the widened limits
          </p>
          <p className="mt-1">
            These survive the correction, which makes them worth taking seriously:
            they are not artefacts of overdispersion. As always on an attribute
            chart, rule out a change in the counting first {"\u2014"} a new
            inspector or a tightened criterion moves the proportion exactly like
            real deterioration and costs nothing to check.
          </p>
        </div>
      )}

      {r.minNP < 5 && (
        <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <p className="font-semibold">Small expected counts</p>
          <p className="mt-1">
            The smallest expected count is {fx(r.minNP, 1)}. The three-sigma limits
            still rest on a normal approximation to the binomial, which needs
            roughly n{"\u00B7"}p{"\u0305"} and n(1{"\u2212"}p{"\u0305"}) above 5.
            Sigma Z corrects the width of the limits, not this: it cannot repair a
            skewed distribution.
          </p>
        </div>
      )}

      {r.flagged.length === 0 && !held && (
        <div className="rounded-md border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          <p className="font-semibold">No points out of control</p>
          <p className="mt-1">
            Nothing exceeds the widened limits. Check whether the ordinary P chart
            flagged anything: if it did, those signals were consistent with ordinary
            batch-to-batch variation and this is the chart to trust.
          </p>
        </div>
      )}

      <p className="text-xs text-gray-500">
        {r.k} subgroups
        {r.commonN !== null ? ` of ${r.commonN}` : ` of ${r.minN} to ${r.maxN}`},{" "}
        {s0.totalD} defectives in {s0.totalN} units, p{"\u0305"} ={" "}
        {fx(s0.pBar, 6)}, Sigma Z = {fx(r.sigmaZ, 5)} from {r.k - 1} moving ranges
        {r.usedHistorical && ", historical proportion supplied"}.
        {r.omitted.length > 0 && (
          <>
            {" "}
            {r.omitted.length} subgroup(s) omitted from the centre line:{" "}
            {r.omitted.join("; ")}. They are still plotted, still tested, and still
            take part in the moving ranges.
          </>
        )}
        {r.notes.map((t, i) => (
          <React.Fragment key={i}> {t}</React.Fragment>
        ))}
      </p>
    </div>
  );
}
