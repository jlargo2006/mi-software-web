// app/app/six-sigma/studies/capability/sixpack/Results.tsx
"use client";
import React from "react";
import type { Data, Layout } from "plotly.js";
import ResultChart from "../../../components/ResultChart";
import { normPDF, normInv } from "../../../lib/stats";
import type { CapSixpackResult } from "./types";

const fx = (v: number | null, dec = 3): string =>
  v === null || !Number.isFinite(v) ? "*" : v.toFixed(dec).replace(".", ",");

const BLUE = "#1d4ed8";
const RED = "#dc2626";
const GREEN = "#15803d";
const GREY = "#6b7280";
const NAVY = "#1e3a8a";

/**
 * Panel con titulo centrado. La barra de iconos de Plotly se pone en vertical
 * para que no compita con las etiquetas de limites del borde derecho: en
 * horizontal ocupaba la misma franja que "UCL = ..." y lo tapaba.
 */
const Panel = ({
  title,
  children,
  height = 250,
}: {
  title: string;
  children: React.ReactNode;
  height?: number;
}) => (
  <div>
    <h4 className="mb-1 text-center text-sm font-semibold text-gray-800">
      {title}
    </h4>
    <div className="rounded border border-gray-200" style={{ height }}>
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
    // La modebar en vertical libera la esquina superior derecha, que es donde
    // caen las anotaciones de UCL.
    modebar: { orientation: "v" },
    margin: { l: 52, r: 104, t: 14, b: 36 },
  };

  /** Rango de eje con holgura: los limites nunca quedan pegados al borde. */
  const padded = (
    vals: number[],
    frac = 0.12
  ): [number, number] => {
    const lo = Math.min(...vals);
    const hi = Math.max(...vals);
    const pad = (hi - lo) * frac || 1;
    return [lo - pad, hi + pad];
  };

  const limitAnnots = (
    items: { y: number; text: string; color: string }[]
  ): Partial<Layout>["annotations"] =>
    items.map((a) => ({
      xref: "paper" as const,
      x: 1.015,
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
      hovertemplate: `${
        r.individuals ? "Obs" : "Sample"
      } %{x}<br>%{y:.3f}<extra></extra>`,
    },
  ] as unknown as Data[];

  const xbarLayout: Partial<Layout> = {
    ...base,
    xaxis: {
      title: { text: "Sample" },
      zeroline: false,
      range: [0.4, centreVals.length + 0.6],
    },
    yaxis: {
      title: { text: r.individuals ? "Individual Value" : "Sample Mean" },
      zeroline: false,
      range: padded([...centreVals, r.xbarUcl, r.xbarLcl]),
    },
    shapes: [hline(r.xbarUcl, RED), hline(r.xbarLcl, RED), hline(r.xbarCenter, GREEN)],
    annotations: limitAnnots([
      { y: r.xbarUcl, text: `UCL = ${fx(r.xbarUcl)}`, color: RED },
      {
        y: r.xbarCenter,
        text: `${r.individuals ? "X\u0304" : "X\u0304\u0304"} = ${fx(r.xbarCenter)}`,
        color: GREEN,
      },
      { y: r.xbarLcl, text: `LCL = ${fx(r.xbarLcl)}`, color: RED },
    ]),
  };

  // --- 2 · Capability Histogram ------------------------------------------
  const [hx0, hx1] = padded(
    [
      ...r.allValues,
      ...(r.lsl !== null ? [r.lsl] : []),
      ...(r.usl !== null ? [r.usl] : []),
    ],
    0.15
  );
  const grid: number[] = [];
  for (let i = 0; i <= 240; i++) grid.push(hx0 + ((hx1 - hx0) * i) / 240);
  const nBins = Math.max(6, Math.ceil(Math.sqrt(r.n)));
  const binW = (hx1 - hx0) / nBins;
  const scale = r.n * binW;

  const histData: Data[] = [
    {
      x: r.allValues,
      type: "histogram",
      xbins: { start: hx0, end: hx1, size: binW },
      marker: { color: "#bfdbfe", line: { color: NAVY, width: 1 } },
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

  // Leyenda y valores de especificacion en un bloque a la derecha, fuera del
  // area de trazado: dentro chocaban con las barras y con las curvas.
  const histSide: string[] = [];
  if (r.lsl !== null) histSide.push(`LSL  ${fx(r.lsl, 0)}`);
  if (r.usl !== null) histSide.push(`USL  ${fx(r.usl, 0)}`);

  const histLayout: Partial<Layout> = {
    ...base,
    margin: { l: 52, r: 112, t: 14, b: 36 },
    bargap: 0.02,
    xaxis: { range: [hx0, hx1], zeroline: false },
    yaxis: { title: { text: "Frequency" }, zeroline: false },
    shapes: specShapes,
    annotations: [
      {
        xref: "paper" as const,
        x: 1.02,
        xanchor: "left" as const,
        yref: "paper" as const,
        y: 0.97,
        yanchor: "top" as const,
        align: "left" as const,
        text:
          `<span style="color:${RED}">\u2014 Overall</span><br>` +
          `<span style="color:${GREY}">- - Within</span>` +
          (histSide.length ? `<br><br>${histSide.join("<br>")}` : ""),
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
      hovertemplate: `Sample %{x}<br>${r.spreadLabel}: %{y:.3f}<extra></extra>`,
    },
  ] as unknown as Data[];

  // El eje arranca en 0 porque una dispersion negativa no existe, pero se deja
  // holgura arriba para que el UCL no toque el borde.
  const spreadTop = Math.max(...spreadVals, r.spreadUcl);
  const spreadLayout: Partial<Layout> = {
    ...base,
    xaxis: {
      title: { text: "Sample" },
      zeroline: false,
      range: [0.4, spreadVals.length + 0.6],
    },
    yaxis: {
      title: {
        text: r.individuals
          ? "Moving Range"
          : r.useSChart
          ? "Sample StDev"
          : "Sample Range",
      },
      zeroline: false,
      range: [-spreadTop * 0.1, spreadTop * 1.14],
    },
    shapes: [
      hline(r.spreadUcl, RED),
      hline(r.spreadLcl, RED),
      hline(r.spreadCenter, GREEN),
    ],
    annotations: limitAnnots([
      { y: r.spreadUcl, text: `UCL = ${fx(r.spreadUcl, 2)}`, color: RED },
      {
        y: r.spreadCenter,
        text: `${r.spreadLabel}\u0304 = ${fx(r.spreadCenter, 2)}`,
        color: GREEN,
      },
      { y: r.spreadLcl, text: `LCL = ${fx(r.spreadLcl, 2)}`, color: RED },
    ]),
  };

  // --- 4 · Normal Probability Plot ---------------------------------------
  // Bandas de confianza puntuales al 95 % sobre la recta ajustada. El error
  // tipico del cuantil estimado combina la incertidumbre de la media y la de
  // la desviacion:  se = sigma · raiz( 1/n + z^2 / (2(n-1)) ).
  const zGrid: number[] = [];
  for (let i = 0; i <= 120; i++) zGrid.push(-3 + (6 * i) / 120);
  const seAt = (z: number) =>
    r.stdOverall * Math.sqrt(1 / r.n + (z * z) / (2 * (r.n - 1)));
  const zCrit = normInv(0.975);
  const fitAt = (z: number) => r.mean + z * r.stdOverall;

  const probData: Data[] = [
    {
      x: zGrid.map((z) => fitAt(z) - zCrit * seAt(z)),
      y: zGrid,
      type: "scatter",
      mode: "lines",
      line: { color: RED, width: 1, dash: "dot" },
      hoverinfo: "skip",
    },
    {
      x: zGrid.map((z) => fitAt(z) + zCrit * seAt(z)),
      y: zGrid,
      type: "scatter",
      mode: "lines",
      line: { color: RED, width: 1, dash: "dot" },
      hoverinfo: "skip",
    },
    {
      x: [fitAt(-3), fitAt(3)],
      y: [-3, 3],
      type: "scatter",
      mode: "lines",
      line: { color: RED, width: 1.4 },
      hoverinfo: "skip",
    },
    {
      x: r.probPoints.map((p) => p.x),
      y: r.probPoints.map((p) => p.z),
      type: "scatter",
      mode: "markers",
      marker: { color: BLUE, size: 5 },
      hovertemplate: "%{x:.3f}<extra></extra>",
    },
  ] as unknown as Data[];

  const probLayout: Partial<Layout> = {
    ...base,
    margin: { l: 52, r: 50, t: 14, b: 36 },
    xaxis: { zeroline: false, range: padded([fitAt(-3.2), fitAt(3.2)], 0.04) },
    yaxis: { title: { text: "Normal score" }, zeroline: false, range: [-3.3, 3.3] },
    annotations: [
      {
        xref: "paper" as const,
        x: 0.03,
        yref: "paper" as const,
        y: 0.96,
        xanchor: "left" as const,
        yanchor: "top" as const,
        align: "left" as const,
        text: `AD = ${fx(r.adStat)}<br>P = ${fx(r.adPValue)}`,
        showarrow: false,
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
      marker: { color: RED, size: 9, symbol: "line-ew-open", line: { width: 2 } },
      hovertemplate: "Sample %{x}<br>Mean: %{y:.3f}<extra></extra>",
    },
  ] as unknown as Data[];

  const lastLayout: Partial<Layout> = {
    ...base,
    margin: { l: 52, r: 50, t: 14, b: 36 },
    xaxis: { title: { text: "Sample" }, zeroline: false },
    yaxis: { title: { text: "Values" }, zeroline: false },
  };

  // --- 6 · Capability Plot ----------------------------------------------
  // Segmentos con topes verticales, al estilo de Minitab: la barra gruesa
  // sugeria una densidad que no existe, mientras que un segmento acotado dice
  // exactamente lo que es, un intervalo de 6 sigma.
  const ROW: Record<string, number> = { overall: 3, within: 2, specs: 1 };
  const CAP = 0.17; // media altura de los topes verticales

  const segment = (
    lo: number,
    hi: number,
    y: number,
    color: string,
    withCentre: boolean
  ) => {
    const parts: NonNullable<Partial<Layout>["shapes"]> = [
      {
        type: "line",
        x0: lo,
        x1: hi,
        y0: y,
        y1: y,
        line: { color, width: 1.6 },
      },
      {
        type: "line",
        x0: lo,
        x1: lo,
        y0: y - CAP,
        y1: y + CAP,
        line: { color, width: 1.6 },
      },
      {
        type: "line",
        x0: hi,
        x1: hi,
        y0: y - CAP,
        y1: y + CAP,
        line: { color, width: 1.6 },
      },
    ];
    if (withCentre) {
      parts.push({
        type: "line",
        x0: (lo + hi) / 2,
        x1: (lo + hi) / 2,
        y0: y - CAP,
        y1: y + CAP,
        line: { color, width: 1.6 },
      });
    }
    return parts;
  };

  const capXs = [
    r.mean - 3 * r.stdOverall,
    r.mean + 3 * r.stdOverall,
    r.mean - 3 * r.stdWithin,
    r.mean + 3 * r.stdWithin,
    ...(r.lsl !== null ? [r.lsl] : []),
    ...(r.usl !== null ? [r.usl] : []),
  ];
  const capRange = padded(capXs, 0.06);

  const capShapes: NonNullable<Partial<Layout>["shapes"]> = [
    ...segment(
      r.mean - 3 * r.stdOverall,
      r.mean + 3 * r.stdOverall,
      ROW.overall,
      NAVY,
      true
    ),
    ...segment(
      r.mean - 3 * r.stdWithin,
      r.mean + 3 * r.stdWithin,
      ROW.within,
      NAVY,
      true
    ),
    ...(r.lsl !== null && r.usl !== null
      ? segment(r.lsl, r.usl, ROW.specs, NAVY, false)
      : []),
    ...specShapes,
  ];

  const withinBox = [
    `<b>Within</b>`,
    `StDev  ${fx(r.stdWithin)}`,
    `Cp     ${fx(r.cp, 2)}`,
    `Cpk    ${fx(r.cpk, 2)}`,
    `PPM    ${fx(r.ppmWithin, 2)}`,
  ].join("<br>");

  const overallBox = [
    `<b>Overall</b>`,
    `StDev  ${fx(r.stdOverall)}`,
    `Pp     ${fx(r.pp, 2)}`,
    `Ppk    ${fx(r.ppk, 2)}`,
    `PPM    ${fx(r.ppmOverall, 2)}`,
  ].join("<br>");

  const capData: Data[] = [
    {
      x: [r.mean],
      y: [ROW.within],
      type: "scatter",
      mode: "markers",
      marker: { color: "rgba(0,0,0,0)", size: 1 },
      hoverinfo: "skip",
    },
  ] as unknown as Data[];

  const capLayout: Partial<Layout> = {
    ...base,
    margin: { l: 62, r: 30, t: 58, b: 36 },
    xaxis: { range: capRange, zeroline: false },
    yaxis: {
      range: [0.45, 3.55],
      tickvals: [ROW.specs, ROW.within, ROW.overall],
      ticktext: ["Specs", "Within", "Overall"],
      zeroline: false,
      showgrid: false,
    },
    shapes: capShapes,
    annotations: [
      {
        xref: "paper" as const,
        x: 0,
        xanchor: "left" as const,
        yref: "paper" as const,
        y: 1.3,
        yanchor: "top" as const,
        align: "left" as const,
        text: withinBox,
        showarrow: false,
        font: { size: 9, family: "monospace" },
        bordercolor: "#d1d5db",
        borderwidth: 1,
        borderpad: 4,
        bgcolor: "#ffffff",
      },
      {
        xref: "paper" as const,
        x: 1,
        xanchor: "right" as const,
        yref: "paper" as const,
        y: 1.3,
        yanchor: "top" as const,
        align: "left" as const,
        text: overallBox,
        showarrow: false,
        font: { size: 9, family: "monospace" },
        bordercolor: "#d1d5db",
        borderwidth: 1,
        borderpad: 4,
        bgcolor: "#ffffff",
      },
    ],
  };

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
        <Panel title={r.individuals ? "MR Chart" : r.useSChart ? "S Chart" : "R Chart"}>
          <ResultChart data={spreadData} layout={{ autosize: true, ...spreadLayout }} />
        </Panel>
        <Panel title="Normal Probability Plot">
          <ResultChart data={probData} layout={{ autosize: true, ...probLayout }} />
        </Panel>
        <Panel title={`Last ${r.lastNShown} Subgroups`}>
          <ResultChart data={lastData} layout={{ autosize: true, ...lastLayout }} />
        </Panel>
        <Panel title="Capability Plot" height={288}>
          <ResultChart data={capData} layout={{ autosize: true, ...capLayout }} />
        </Panel>
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
            An unstable process has no single level or spread to be capable of, so{" "}
            {fx(r.cpk, 2)} does not predict future output. Find the cause first.
          </p>
          {r.spreadOut.length > 0 && (
            <p className="mt-2">
              A point out on the {r.spreadLabel} chart matters more than one on the{" "}
              {r.individuals ? "I" : "Xbar"} chart: the spread estimate feeds the
              control limits themselves, so an unstable {r.spreadLabel} chart makes
              the whole report unreliable.
            </p>
          )}
        </div>
      ) : (
        <div className="rounded-md border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          <p className="font-semibold">The process is stable</p>
          <p className="mt-1">
            No point falls outside the limits on either chart, so the indices below
            can be read as describing a single, repeatable process.
          </p>
        </div>
      )}

      {nonNormal && (
        <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <p className="font-semibold">The normality assumption is doubtful</p>
          <p className="mt-1">
            Anderson{"\u2013"}Darling gives AD = {fx(r.adStat)} with p ={" "}
            {fx(r.adPValue)}, below 0,05. The PPM figures come from a fitted normal
            curve, and if the data are not normal those figures can be wrong by an
            order of magnitude {"\u2014"} usually in the tails, which is exactly what
            capability is about. Consider a non-normal analysis.
          </p>
        </div>
      )}

      {r.cp !== null && r.cpk !== null && Math.abs(r.cp - r.cpk) > 0.05 && (
        <div className="rounded-md border border-blue-300 bg-blue-50 px-4 py-3 text-sm text-blue-900">
          <p className="font-semibold">The process is off centre</p>
          <p className="mt-1">
            Cp = {fx(r.cp, 2)} but Cpk = {fx(r.cpk, 2)}. Cp measures only whether the
            spread would fit inside the tolerance; Cpk also accounts for where the
            process sits. The gap between them is what centring alone could recover,
            with no reduction in variation.
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
            effects. Within-subgroup consistency is better than the long-run output,
            so the gain is in holding the process on target over time, not in
            tightening it moment to moment.
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
        within-subgroup deviation corrected for bias ({fx(r.stdWithin, 4)}). The two
        differ by design.
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
