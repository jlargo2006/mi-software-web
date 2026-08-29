// app/app/six-sigma/studies/control/imr/Results.tsx
"use client";
import React from "react";
import type { Data, Layout, Shape, Annotations } from "plotly.js";
import ResultChart from "../../../components/ResultChart";
import type { ImrResult, Stage, Violation } from "./types";

const fx = (v: number | null | undefined, dec = 1): string =>
  v === null || v === undefined || !Number.isFinite(v)
    ? "*"
    : v.toFixed(dec).replace(".", ",");

const BLUE = "#1d4ed8";
const RED = "#dc2626";
const GREEN = "#15803d";

/** Un panel de control: puntos, linea central, limites y marcas. */
function Chart({
  title,
  yTitle,
  y,
  stages,
  flagged,
  pick,
  height,
}: {
  title: string;
  yTitle: string;
  y: (number | null)[];
  stages: Stage[];
  flagged: number[];
  pick: (s: Stage) => { cl: number; ucl: number; lcl: number };
  height: number;
}) {
  const n = y.length;
  const xs = Array.from({ length: n }, (_, i) => i + 1);
  const flagSet = new Set(flagged);

  const traces: Data[] = [
    {
      x: xs,
      y,
      type: "scatter",
      mode: "lines+markers",
      line: { color: BLUE, width: 1 },
      marker: { color: BLUE, size: 4 },
      hovertemplate: "Obs %{x}<br>%{y:.4g}<extra></extra>",
    } as unknown as Data,
    {
      x: xs.filter((i) => flagSet.has(i) && y[i - 1] !== null),
      y: xs.filter((i) => flagSet.has(i) && y[i - 1] !== null).map((i) => y[i - 1]),
      type: "scatter",
      mode: "markers",
      marker: { color: RED, size: 7, symbol: "square" },
      hovertemplate: "Obs %{x}<br>%{y:.4g}<extra></extra>",
    } as unknown as Data,
  ];

  // Las lineas se dibujan por etapa: en un grafico con etapas cada tramo
  // tiene su propia linea central y sus propios limites.
  const shapes: Partial<Shape>[] = [];
  const annots: Partial<Annotations>[] = [];

  stages.forEach((s, si) => {
    const { cl, ucl, lcl } = pick(s);
    const x0 = s.from + 0.5;
    const x1 = s.to + 1.5;
    const line = (yv: number, color: string, dash: "solid" | "dash") =>
      shapes.push({
        type: "line",
        x0,
        x1,
        y0: yv,
        y1: yv,
        line: { color, width: 1.2, dash },
      });
    line(cl, GREEN, "solid");
    line(ucl, RED, "dash");
    line(lcl, RED, "dash");

    // Solo se etiqueta la ultima etapa, como hace Minitab, para no llenar el
    // panel de texto cuando hay muchas.
    if (si === stages.length - 1) {
      const tag = (yv: number, text: string, color: string) =>
        annots.push({
          x: 1,
          xref: "paper",
          xanchor: "left",
          y: yv,
          yanchor: "middle",
          text,
          showarrow: false,
          font: { size: 9, color },
        });
      tag(ucl, `UCL = ${fx(ucl)}`, RED);
      tag(cl, `${fx(cl)}`, GREEN);
      tag(lcl, `LCL = ${fx(lcl)}`, RED);
    }

    if (si > 0) {
      shapes.push({
        type: "line",
        x0,
        x1: x0,
        yref: "paper",
        y0: 0,
        y1: 1,
        line: { color: "#9ca3af", width: 1, dash: "dot" },
      });
    }
  });

  const layout: Partial<Layout> = {
    plot_bgcolor: "#ffffff",
    showlegend: false,
    hovermode: "closest",
    modebar: { orientation: "v" },
    margin: { l: 56, r: 96, t: 24, b: 34 },
    title: { text: title, font: { size: 11 }, x: 0.02, xanchor: "left" },
    xaxis: {
      title: { text: "Observation", font: { size: 10 } },
      zeroline: false,
      tick0: 1,
      dtick: 20,
    },
    yaxis: { title: { text: yTitle, font: { size: 10 } }, zeroline: false },
    shapes,
    annotations: annots,
  };

  return (
    <div className="rounded border border-gray-200" style={{ height }}>
      <ResultChart data={traces} layout={{ autosize: true, ...layout }} />
    </div>
  );
}

function TestBlock({
  title,
  violations,
}: {
  title: string;
  violations: Violation[];
}) {
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

export default function ImrResults({ result }: { result: ImrResult }) {
  if (!result.ok) {
    return (
      <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        {result.error ?? "Select a column."}
      </div>
    );
  }

  const r = result;
  const single = r.stages.length === 1;
  const s0 = r.stages[0];
  const nFlag = new Set([...r.iFlagged, ...r.mrFlagged]).size;

  return (
    <div className="w-full space-y-4">
      <h3 className="text-center text-sm font-semibold text-gray-800">
        I-MR Chart of {r.colName}
        {r.lambda !== null && (
          <span className="ml-1 font-normal text-gray-500">
            (Box-Cox, {"\u03BB"} = {fx(r.lambda, 4)})
          </span>
        )}
      </h3>

      <Chart
        title=""
        yTitle="Individual Value"
        y={r.values}
        stages={r.stages}
        flagged={r.iFlagged}
        pick={(s) => ({ cl: s.center, ucl: s.iUCL, lcl: s.iLCL })}
        height={260}
      />

      <Chart
        title=""
        yTitle="Moving Range"
        y={r.mr}
        stages={r.stages}
        flagged={r.mrFlagged}
        pick={(s) => ({ cl: s.mrCenter, ucl: s.mrUCL, lcl: s.mrLCL })}
        height={220}
      />

      {/* --- Limites --- */}
      <div className="overflow-x-auto rounded border border-gray-200">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              {single ? null : (
                <th className="px-3 py-1 text-left font-medium">Stage</th>
              )}
              <th className="px-3 py-1 text-right font-medium">N</th>
              <th className="px-3 py-1 text-right font-medium">Mean</th>
              <th className="px-3 py-1 text-right font-medium">StDev</th>
              <th className="px-3 py-1 text-right font-medium">I LCL</th>
              <th className="px-3 py-1 text-right font-medium">I UCL</th>
              <th className="px-3 py-1 text-right font-medium">MR bar</th>
              <th className="px-3 py-1 text-right font-medium">MR UCL</th>
            </tr>
          </thead>
          <tbody>
            {r.stages.map((s, i) => (
              <tr key={i} className="border-t border-gray-100 font-mono">
                {single ? null : (
                  <td className="px-3 py-1 font-sans">{s.label || i + 1}</td>
                )}
                <td className="px-3 py-1 text-right">{s.nUsed}</td>
                <td className="px-3 py-1 text-right">{fx(s.center, 4)}</td>
                <td className="px-3 py-1 text-right">{fx(s.sigma, 4)}</td>
                <td className="px-3 py-1 text-right">{fx(s.iLCL, 4)}</td>
                <td className="px-3 py-1 text-right">{fx(s.iUCL, 4)}</td>
                <td className="px-3 py-1 text-right">{fx(s.mrCenter, 4)}</td>
                <td className="px-3 py-1 text-right">{fx(s.mrUCL, 4)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- Resultados de los tests --- */}
      <div className="space-y-3">
        <TestBlock
          title={`Test Results for I Chart of ${r.colName}`}
          violations={r.iViolations}
        />
        <TestBlock
          title={`Test Results for MR Chart of ${r.colName}`}
          violations={r.mrViolations}
        />
      </div>

      {/* --- Lecturas --- */}
      {single && s0.iLCL < 0 && (
        <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <p className="font-semibold">The lower control limit is negative</p>
          <p className="mt-1">
            LCL = {fx(s0.iLCL)} on a mean of {fx(s0.center)}. If the quantity
            cannot be negative {"\u2014"} a time, a count, a concentration{" "}
            {"\u2014"} that limit is unreachable and the chart is effectively
            one-sided. Wide limits here are not evidence of a well-behaved
            process: they are what a large average moving range produces.
          </p>
        </div>
      )}

      {r.shapeWarning && (
        <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <p className="font-semibold">Skewed data on a symmetric chart</p>
          <p className="mt-1">
            {r.shapeWarning} The I-MR chart is reasonably robust to mild
            departures from normality for Test 1, but tests 2, 5, 6 and 7 read
            sigma zones that assume symmetry. At this level of skew their false
            alarm rates are no longer the nominal ones, so part of the signals
            above are artefacts of shape rather than assignable causes. Consider
            a Box-Cox transformation, or the median moving range.
          </p>
        </div>
      )}

      {nFlag > 0 && (
        <div className="rounded-md border border-blue-300 bg-blue-50 px-4 py-3 text-sm text-blue-900">
          <p className="font-semibold">
            {nFlag} observation{nFlag === 1 ? "" : "s"} flagged
          </p>
          <p className="mt-1">
            Read the moving range chart first. It measures short-term
            variability, and if it is out of control the sigma used by the
            individuals chart is not trustworthy {"\u2014"} which makes every
            limit above provisional. Bring the MR chart into control, then
            re-read the I chart.
          </p>
        </div>
      )}

      <p className="text-xs text-gray-500">
        {r.n} observations.
        {r.usedHistorical && " Historical parameters were supplied."}
        {r.omitted.length > 0 && (
          <>
            {" "}
            {r.omitted.length} observation(s) omitted from the estimate:{" "}
            {r.omitted.join("; ")}. They are still plotted and still tested.
          </>
        )}
        {r.lambda !== null &&
          " The chart is drawn in transformed units; limits do not read in the original scale."}
        {r.nMissing > 0 && <> {r.nMissing} non-numeric value(s) skipped.</>}
      </p>
    </div>
  );
}
