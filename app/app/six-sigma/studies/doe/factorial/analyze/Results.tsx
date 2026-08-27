// app/app/six-sigma/studies/doe/factorial/analyze/Results.tsx
//
"use client";
import React from "react";
import type { Data, Layout, Shape } from "plotly.js";
import ReportLayout from "../../../../components/ReportLayout";
import ResultChart from "../../../../components/ResultChart";
import { normalInv } from "../../../../lib/regression";
import { sig4 } from "./compute";
import { RESID_LABEL, type DoeAnalyzeParams, type DoeAnalyzeResult } from "./types";
import { blockLabel, isBlockTerm } from "../../../../lib/factorialmodel";

const BLUE = "#1d4ed8";
const RED = "#b91c1c";
const GREY = "#6b7280";
const BAR = "#a5c8e1";

const fx = (v: number, dec: number): string =>
  Number.isFinite(v) ? v.toFixed(dec).replace(".", ",") : "*";
const fp = (v: number): string => (Number.isFinite(v) ? fx(v, 3) : "*");

// El % solo tiene sentido si hay un numero al que pegarselo.
const pct = (v: number): string =>
  Number.isFinite(v) ? `${fx(v, 2)}%` : "*";

export default function DoeAnalyzeResults({
  result,
  params,
}: {
  result: DoeAnalyzeResult;
  params: DoeAnalyzeParams;
}) {
  if (!result.ok) {
    return (
      <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        {result.error ?? "Selecciona la respuesta y los factores."}
      </div>
    );
  }

  const r = result;
  const f = r.fit;
  const adv = r.advice;
  const n = r.n;

  const th = "px-3 py-1 text-right font-medium text-gray-600 whitespace-nowrap";
  const thL = "px-3 py-1 text-left font-medium text-gray-600 whitespace-nowrap";
  const td = "px-3 py-1 text-right whitespace-nowrap";
  const tdL = "px-3 py-1 text-left whitespace-nowrap";

  /* ---------- Pareto ---------- */
  // Barras de arriba abajo por magnitud, con la linea del valor critico.
  const paretoData: Data[] = [
    {
      type: "bar",
      orientation: "h",
      x: r.effectsPlot.map((e) => e.std),
      y: r.effectsPlot.map((e) => e.label),
      marker: { color: BAR, line: { color: "#374151", width: 1 } },
      showlegend: false,
      hovertemplate: "%{y}: %{x:.2f}<extra></extra>",
    } as unknown as Data,
  ];
  const paretoLayout: Partial<Layout> = {
    margin: { l: 70, r: 30, t: 20, b: 45 },
    xaxis: { title: { text: "Standardized Effect" }, zeroline: false },
    yaxis: {
      title: { text: "Term" },
      autorange: "reversed",
      type: "category",
    },
    shapes: [
      {
        type: "line",
        x0: r.paretoLimit,
        x1: r.paretoLimit,
        yref: "paper",
        y0: 0,
        y1: 1,
        line: { color: RED, width: 1.5, dash: "dash" },
      },
    ],
    annotations: [
      {
        x: r.paretoLimit,
        xref: "x",
        yref: "paper",
        y: 1.02,
        text: fx(r.paretoLimit, 2),
        showarrow: false,
        font: { color: RED, size: 11 },
        xanchor: "center",
        yanchor: "bottom",
      } as unknown as NonNullable<Layout["annotations"]>[number],
    ],
    plot_bgcolor: "#ffffff",
  };

  /* ---------- Normal plot de efectos ---------- */
  // Los efectos tipificados se ordenan CON signo y se situan en una escala de
  // probabilidad normal. Los nulos caen sobre la recta; los reales se escapan.
  const sortedEff = [...r.effectsPlot].sort((a, b) => a.signed - b.signed);
  const m = sortedEff.length;
  const pos = sortedEff.map((_, i) => (i + 1 - 0.375) / (m + 0.25));
  const zq = pos.map((p) => normalInv(p));
  const nsIdx = sortedEff.map((e, i) => (e.significant ? -1 : i)).filter((i) => i >= 0);
  const sgIdx = sortedEff.map((e, i) => (e.significant ? i : -1)).filter((i) => i >= 0);

  // La recta de referencia se ajusta SOLO con los efectos no significativos:
  // son los que representan el ruido.
  const nsX = nsIdx.map((i) => sortedEff[i].signed);
  const nsZ = nsIdx.map((i) => zq[i]);
  let slope = 1;
  let intercept = 0;
  if (nsX.length >= 2) {
    const mx = nsX.reduce((a, b) => a + b, 0) / nsX.length;
    const mz = nsZ.reduce((a, b) => a + b, 0) / nsZ.length;
    let sxy = 0;
    let sxx = 0;
    for (let i = 0; i < nsX.length; i++) {
      sxy += (nsX[i] - mx) * (nsZ[i] - mz);
      sxx += (nsX[i] - mx) * (nsX[i] - mx);
    }
    if (sxx > 0) {
      slope = sxy / sxx;
      intercept = mz - slope * mx;
    }
  }
  const lineX = [Math.min(...nsX, 0) - 1, Math.max(...nsX, 0) + 1];

  const pctTicks = [1, 5, 10, 20, 30, 50, 70, 80, 90, 95, 99];
  const normalData: Data[] = [
    {
      type: "scatter",
      mode: "lines",
      x: lineX,
      y: lineX.map((v) => intercept + slope * v),
      line: { color: RED, width: 1.5 },
      showlegend: false,
      hoverinfo: "skip",
    } as unknown as Data,
    {
      type: "scatter",
      mode: "markers",
      x: nsIdx.map((i) => sortedEff[i].signed),
      y: nsIdx.map((i) => zq[i]),
      marker: { color: BLUE, size: 9, symbol: "diamond" },
      name: "Not Significant",
      text: nsIdx.map((i) => sortedEff[i].label),
      hovertemplate: "%{text}: %{x:.2f}<extra></extra>",
    } as unknown as Data,
    {
      type: "scatter",
      mode: "markers+text",
      x: sgIdx.map((i) => sortedEff[i].signed),
      y: sgIdx.map((i) => zq[i]),
      marker: { color: "#7f1d1d", size: 10, symbol: "square" },
      name: "Significant",
      text: sgIdx.map((i) => sortedEff[i].label),
      textposition: "top center",
      textfont: { size: 10 },
      hovertemplate: "%{text}: %{x:.2f}<extra></extra>",
    } as unknown as Data,
  ];
  const normalLayout: Partial<Layout> = {
    margin: { l: 55, r: 20, t: 20, b: 45 },
    xaxis: { title: { text: "Standardized Effect" }, zeroline: false },
    yaxis: {
      title: { text: "Percent" },
      tickmode: "array",
      tickvals: pctTicks.map((v) => normalInv(v / 100)),
      ticktext: pctTicks.map(String),
      zeroline: false,
    },
    legend: { orientation: "h", y: -0.18, x: 0, font: { size: 11 } },
    plot_bgcolor: "#ffffff",
  };

  /* ---------- Residuos ---------- */
  const resVals =
    r.residualKind === "regular"
      ? f.resid
      : r.residualKind === "standardized"
        ? f.stdResid
        : f.resid.map((e, i) => {
            // Residuo eliminado: externamente studentizado.
            const h = f.leverage[i];
            const s2 =
              (f.errSS - (e * e) / (1 - h)) / Math.max(1, f.errDF - 1);
            return s2 > 0 ? e / Math.sqrt(s2 * (1 - h)) : NaN;
          });
  const axLabel = `${RESID_LABEL[r.residualKind]} Residual`;

  const sortedRes = [...resVals].sort((a, b) => a - b);
  const rp = sortedRes.map((_, i) => (i + 1 - 0.375) / (n + 0.25));
  const rz = rp.map((p) => normalInv(p));
  const mR = resVals.reduce((a, b) => a + b, 0) / n;
  const sR = Math.sqrt(
    resVals.reduce((a, v) => a + (v - mR) * (v - mR), 0) / (n - 1)
  );

  const zeroLine = (ax: string, ay: string): Partial<Shape> => ({
    type: "line",
    xref: `${ax} domain` as never,
    x0: 0,
    x1: 1,
    yref: ay as never,
    y0: 0,
    y1: 0,
    line: { color: GREY, width: 1, dash: "dash" },
  });

  const resData: Data[] = [
    {
      type: "scatter",
      mode: "markers",
      x: sortedRes,
      y: rz,
      xaxis: "x",
      yaxis: "y",
      marker: { color: BLUE, size: 6 },
      showlegend: false,
      hovertemplate: "%{x:.3f}<extra></extra>",
    } as unknown as Data,
    {
      type: "scatter",
      mode: "lines",
      x: [-2.6, 2.6].map((z) => mR + sR * z),
      y: [-2.6, 2.6],
      xaxis: "x",
      yaxis: "y",
      line: { color: RED, width: 1.5 },
      showlegend: false,
      hoverinfo: "skip",
    } as unknown as Data,
    {
      type: "scatter",
      mode: "markers",
      x: f.fitted,
      y: resVals,
      xaxis: "x2",
      yaxis: "y2",
      marker: { color: BLUE, size: 6 },
      showlegend: false,
      hovertemplate: "Fit %{x:.2f}<br>%{y:.3f}<extra></extra>",
    } as unknown as Data,
    {
      type: "histogram",
      x: resVals,
      xaxis: "x3",
      yaxis: "y3",
      marker: { color: BLUE, line: { color: "#ffffff", width: 1 } },
      showlegend: false,
      hovertemplate: "%{x}<br>Frequency %{y}<extra></extra>",
    } as unknown as Data,
    {
      type: "scatter",
      mode: "lines+markers",
      x: resVals.map((_, i) => i + 1),
      y: resVals,
      xaxis: "x4",
      yaxis: "y4",
      line: { color: BLUE, width: 1 },
      marker: { color: BLUE, size: 5 },
      showlegend: false,
      hovertemplate: "Obs %{x}<br>%{y:.3f}<extra></extra>",
    } as unknown as Data,
  ];

  const resLayout: Partial<Layout> & Record<string, unknown> = {
    margin: { l: 60, r: 25, t: 30, b: 45 },
    plot_bgcolor: "#ffffff",
    showlegend: false,
    shapes: [zeroLine("x2", "y2"), zeroLine("x4", "y4")],
    xaxis: {
      domain: [0, 0.44],
      anchor: "y",
      title: { text: axLabel, font: { size: 10 } },
      tickfont: { size: 9 },
      zeroline: false,
    },
    yaxis: {
      domain: [0.58, 1],
      anchor: "x",
      title: { text: "Percent", font: { size: 10 } },
      tickmode: "array",
      tickvals: pctTicks.map((v) => normalInv(v / 100)),
      ticktext: pctTicks.map(String),
      tickfont: { size: 9 },
      zeroline: false,
    },
    xaxis2: {
      domain: [0.56, 1],
      anchor: "y2",
      title: { text: "Fitted Value", font: { size: 10 } },
      tickfont: { size: 9 },
      zeroline: false,
    },
    yaxis2: {
      domain: [0.58, 1],
      anchor: "x2",
      title: { text: axLabel, font: { size: 10 } },
      tickfont: { size: 9 },
      zeroline: false,
    },
    xaxis3: {
      domain: [0, 0.44],
      anchor: "y3",
      title: { text: axLabel, font: { size: 10 } },
      tickfont: { size: 9 },
      zeroline: false,
    },
    yaxis3: {
      domain: [0, 0.42],
      anchor: "x3",
      title: { text: "Frequency", font: { size: 10 } },
      tickfont: { size: 9 },
      zeroline: false,
    },
    xaxis4: {
      domain: [0.56, 1],
      anchor: "y4",
      title: { text: "Observation Order", font: { size: 10 } },
      tickfont: { size: 9 },
      zeroline: false,
    },
    yaxis4: {
      domain: [0, 0.42],
      anchor: "x4",
      title: { text: axLabel, font: { size: 10 } },
      tickfont: { size: 9 },
      zeroline: false,
    },
    annotations: (
      [
        ["Normal Probability Plot", 0.22, 1.0],
        ["Versus Fits", 0.78, 1.0],
        ["Histogram", 0.22, 0.44],
        ["Versus Order", 0.78, 0.44],
      ] as [string, number, number][]
    ).map(([text, x, y]) => ({
      xref: "paper" as const,
      yref: "paper" as const,
      x,
      y,
      text,
      showarrow: false,
      xanchor: "center" as const,
      yanchor: "bottom" as const,
      font: { size: 11 },
    })),
  };

  /* ---------- Main effects ---------- */
  const meAll = r.mainEffects.flatMap((e) => e.points.map((p) => p.mean));
  const meLo = Math.min(...meAll, r.grandMean);
  const meHi = Math.max(...meAll, r.grandMean);
  const mePad = (meHi - meLo) * 0.12 || 1;
  const k = r.mainEffects.length;
  const meGap = 0.035;
  const meW = (1 - (k - 1) * meGap) / k;
  const meData: Data[] = [];
  const meShapes: Partial<Shape>[] = [];
  const meLayout: Partial<Layout> & Record<string, unknown> = {
    margin: { l: 70, r: 20, t: 20, b: 55 },
    plot_bgcolor: "#ffffff",
    showlegend: false,
  };
  r.mainEffects.forEach((e, i) => {
    const id = i + 1;
    const sfx = id === 1 ? "" : String(id);
    meData.push({
      type: "scatter",
      mode: "lines+markers",
      x: e.points.map((_, j) => j),
      y: e.points.map((p) => p.mean),
      xaxis: `x${sfx}`,
      yaxis: `y${sfx}`,
      line: { color: BLUE, width: 2 },
      marker: { color: BLUE, size: 9 },
      showlegend: false,
      text: e.points.map((p) => p.label),
      hovertemplate: `${e.factor} = %{text}<br>Mean %{y:.4f}<extra></extra>`,
    } as unknown as Data);
    meShapes.push({
      type: "line",
      xref: `x${sfx} domain` as never,
      x0: 0,
      x1: 1,
      yref: `y${sfx}` as never,
      y0: r.grandMean,
      y1: r.grandMean,
      line: { color: GREY, width: 1, dash: "dash" },
    });
    meLayout[`xaxis${sfx}`] = {
      domain: [i * (meW + meGap), i * (meW + meGap) + meW],
      anchor: `y${sfx}`,
      range: [-0.35, e.points.length - 0.65],
      tickmode: "array",
      tickvals: e.points.map((_, j) => j),
      ticktext: e.points.map((p) => p.label),
      title: { text: e.factor, font: { size: 11 } },
      tickfont: { size: 10 },
      showgrid: false,
      zeroline: false,
      linecolor: "#9ca3af",
      showline: true,
      mirror: true,
    };
    meLayout[`yaxis${sfx}`] = {
      domain: [0, 1],
      anchor: `x${sfx}`,
      range: [meLo - mePad, meHi + mePad],
      showticklabels: i === 0,
      title: i === 0 ? { text: "Mean", font: { size: 11 } } : undefined,
      tickfont: { size: 10 },
      showgrid: true,
      gridcolor: "#eef2f7",
      zeroline: false,
      linecolor: "#9ca3af",
      showline: true,
      mirror: true,
    };
  });
  meLayout.shapes = meShapes;

  /* ---------- Interaction (matriz completa) ---------- */
  const intAll = r.interactions.flatMap((p) => p.series.flatMap((s) => s.means));
  const intLo = Math.min(...intAll);
  const intHi = Math.max(...intAll);
  const intPad = (intHi - intLo) * 0.12 || 1;
  const iGap = 0.035;
  const iW = (1 - (k - 1) * iGap) / k;
  const iH = (1 - (k - 1) * iGap) / k;
  const intData: Data[] = [];
  const intAnn: NonNullable<Partial<Layout>["annotations"]> = [];
  const intLayout: Partial<Layout> & Record<string, unknown> = {
    margin: { l: 70, r: 20, t: 20, b: 55 },
    plot_bgcolor: "#ffffff",
    showlegend: false,
  };
  const PAIR_COLOR = [BLUE, RED];

  for (let i = 0; i < k; i++) {
    for (let j = 0; j < k; j++) {
      const id = i * k + j + 1;
      const sfx = id === 1 ? "" : String(id);
      const xd: [number, number] = [
        j * (iW + iGap),
        j * (iW + iGap) + iW,
      ];
      const yd: [number, number] = [
        1 - (i * (iH + iGap) + iH),
        1 - i * (iH + iGap),
      ];
      const diag = i === j;
      const panel = diag
        ? null
        : r.interactions.find(
            (p) =>
              p.rowFactor === r.factors[i] && p.colFactor === r.factors[j]
          );

      if (diag) {
        intAnn.push({
          xref: "paper",
          yref: "paper",
          x: (xd[0] + xd[1]) / 2,
          y: (yd[0] + yd[1]) / 2 + 0.015,
          text: `<b>${r.factors[i]}</b>`,
          showarrow: false,
          xanchor: "center",
          yanchor: "bottom",
          font: { size: 11 },
        });
        intAnn.push({
          xref: "paper",
          yref: "paper",
          x: (xd[0] + xd[1]) / 2,
          y: (yd[0] + yd[1]) / 2 - 0.005,
          text: r.mainEffects[i].points
            .map(
              (p, li) =>
                `<span style="color:${PAIR_COLOR[li]}">\u25CF ${p.label}</span>`
            )
            .join("  "),
          showarrow: false,
          xanchor: "center",
          yanchor: "top",
          font: { size: 9 },
        });
      } else if (panel) {
        panel.series.forEach((s, li) => {
          intData.push({
            type: "scatter",
            mode: "lines+markers",
            x: panel.xLabels.map((_, q) => q),
            y: s.means,
            xaxis: `x${sfx}`,
            yaxis: `y${sfx}`,
            line: {
              color: PAIR_COLOR[li],
              width: 2,
              dash: li === 0 ? "solid" : "dash",
            },
            marker: {
              color: PAIR_COLOR[li],
              size: 8,
              symbol: li === 0 ? "circle" : "square",
            },
            showlegend: false,
            text: panel.xLabels,
            hovertemplate:
              `${panel.rowFactor} = ${s.label}<br>${panel.colFactor} = %{text}` +
              `<br>Mean %{y:.4f}<extra></extra>`,
          } as unknown as Data);
        });
      }

      intLayout[`xaxis${sfx}`] = {
        domain: xd,
        anchor: `y${sfx}`,
        range: [-0.35, 1.35],
        tickmode: "array",
        tickvals: [0, 1],
        ticktext: diag ? ["", ""] : (panel?.xLabels ?? ["", ""]),
        showticklabels: !diag && i === k - 1,
        title:
          !diag && i === k - 1
            ? { text: r.factors[j], font: { size: 10 } }
            : undefined,
        tickfont: { size: 9 },
        showgrid: false,
        zeroline: false,
        linecolor: "#9ca3af",
        showline: true,
        mirror: true,
      };
      intLayout[`yaxis${sfx}`] = {
        domain: yd,
        anchor: `x${sfx}`,
        range: [intLo - intPad, intHi + intPad],
        showticklabels: !diag && j === 0,
        title:
          !diag && j === 0
            ? { text: `Mean ${r.response}`, font: { size: 10 } }
            : undefined,
        tickfont: { size: 9 },
        nticks: 4,
        showgrid: true,
        gridcolor: "#eef2f7",
        zeroline: false,
        linecolor: "#9ca3af",
        showline: true,
        mirror: true,
      };
    }
  }
  intLayout.annotations = intAnn;

  /* ---------- Ecuacion ---------- */
  const eqParts = r.uncoded.map((u, i) => {
    const sign = u.value < 0 ? "\u2212" : i === 0 ? "" : "+";
    const val = sig4(Math.abs(u.value));
    return `${i === 0 ? sign : ` ${sign} `}${val}${u.label ? ` ${u.label}` : ""}`;
  });

  const advTone =
    adv.kind === "final"
      ? "border-emerald-300 bg-emerald-50 text-emerald-900"
      : adv.kind === "lenth"
        ? "border-blue-300 bg-blue-50 text-blue-900"
        : "border-amber-300 bg-amber-50 text-amber-900";

  return (
    <ReportLayout
      template="chart-text"
      center={
        <div className="w-full space-y-6">
          <h3 className="text-sm font-semibold text-gray-800">
            Factorial Regression: {r.response} versus{" "}
            {r.usedBlocks ? "Blocks; " : ""}
            {r.factors.join("; ")}
          </h3>

          {r.removedAliased.length > 0 && (
            <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <p className="font-semibold">
                {r.removedAliased.length} of {r.requestedTerms} terms were
                totally confounded and removed
              </p>
              <p className="mt-1">
                This design cannot tell them apart from terms already in the
                model, so they carry no information of their own. The survivor of
                each alias group is the first one in standard order, which is why
                you see{" "}
                <span className="font-mono">
                  {r.rows.find((x) => x.term.order > 0)?.term.key}
                </span>
                -type terms rather than their partners. Nothing was estimated twice.
              </p>
              <p className="mt-2 font-mono text-xs leading-relaxed">
                {r.removedAliased.join("; ")}
              </p>
              <p className="mt-2 text-xs">
                Lower the model order to stop asking for them. Removing them here
                is not a fix for the design: those effects remain unknowable
                without more runs.
              </p>
            </div>
          )}

          {r.droppedCtPt && (
            <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <p className="font-semibold">
                The Ct Pt term was removed: it is not estimable here
              </p>
              <p className="mt-1">
                The center-point indicator coincides with a block column, so
                curvature and the block effect cannot be separated. Curvature is
                not being tested.
              </p>
            </div>
          )}
          
          {r.usedLenth && (
            <div className="rounded-md border border-blue-300 bg-blue-50 px-4 py-3 text-sm text-blue-900">
              <p className="font-semibold">
                No degrees of freedom for error: using Lenth{"\u2019"}s method
              </p>
              <p className="mt-1">
                Every run is spent estimating a term, so there is no residual
                variability to test against. The p-values below come from a
                pseudo standard error of {fx(r.pse, 4)}, built from the median of
                the smaller effects on the assumption that most of them are zero.
              </p>
            </div>
          )}

          {r.hasCenterPoints && (
            <div className="rounded-md border border-blue-300 bg-blue-50 px-4 py-3 text-sm text-blue-900">
              <p className="font-semibold">
                {r.nCenterPoints} center point{r.nCenterPoints === 1 ? "" : "s"}{" "}
                detected
              </p>
              <p className="mt-1">
                They are not a third level of {r.centerFactors.join(", ")}:{" "}
                {params.includeCenterPoints
                  ? "they enter as a separate Ct Pt indicator that tests curvature. If it is significant, the response is not a plane between the levels and no two-level model will describe it."
                  : "the Ct Pt term is switched off, so their variability goes into the error and curvature is not being tested. Switch it on unless you have a reason."}
              </p>
            </div>
          )}

          {r.usedBlocks && (
            <div className="rounded-md border border-blue-300 bg-blue-50 px-4 py-3 text-sm text-blue-900">
              <p className="font-semibold">
                {r.blockLevels.length} blocks fitted
              </p>
              <p className="mt-1">
                The block coefficients are not effects: there is no high or low
                level to measure between. They are deviations from the overall
                mean, coded so that they sum to zero, which is why only{" "}
                {r.blockLevels.length - 1 === 1
                  ? "1 of them is"
                  : `${r.blockLevels.length - 1} of them are`}{" "}
                printed {"\u2014"} the last
                one is whatever makes the total zero.
                {r.blockLevels.length > 2
                  ? " Their VIF exceeds 1,00 for the same reason, and signals nothing wrong."
                  : ""}
              </p>
              <p className="mt-2 text-xs">
                Blocks are a nuisance, not a subject: you do not interpret them,
                you remove them. What they buy you is a smaller error, and with it
                sharper tests on the factors that do interest you.
              </p>
            </div>
          )}          

          {/* Coeficientes codificados */}
          <section className="overflow-x-auto">
            <h4 className="mb-2 text-sm font-semibold text-gray-800">
              Coded Coefficients
            </h4>
            <table className="border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-400">
                  <th className={thL}>Term</th>
                  <th className={th}>Effect</th>
                  <th className={th}>Coef</th>
                  <th className={th}>SE Coef</th>
                  <th className={th}>T-Value</th>
                  <th className={th}>P-Value</th>
                  <th className={th}>VIF</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className={tdL}>Constant</td>
                  <td className={td}>{"\u00a0"}</td>
                  <td className={td}>{fx(f.constant.coef, 3)}</td>
                  <td className={td}>
                    {r.usedLenth ? "*" : fx(f.constant.se, 3)}
                  </td>
                  <td className={td}>
                    {r.usedLenth ? "*" : fx(f.constant.t, 2)}
                  </td>
                  <td className={td}>
                    {r.usedLenth ? "*" : fp(f.constant.p)}
                  </td>
                  <td className={td}>{"\u00a0"}</td>
                </tr>
                {r.rows.map((row, i) => {
                  const drop = adv.term === row.term.key;
                  const blk = isBlockTerm(row.term);
                  // Cabecera "Blocks" sobre la primera fila de bloque, con las
                  // demas sangradas debajo, como en Minitab.
                  const first =
                    blk && (i === 0 || !isBlockTerm(r.rows[i - 1].term));
                  return (
                    <React.Fragment key={row.term.key}>
                      {first && (
                        <tr className="border-b border-gray-200">
                          <td className={tdL}>Blocks</td>
                          <td className={td} colSpan={6}>
                            {"\u00a0"}
                          </td>
                        </tr>
                      )}
                      <tr
                        className={`border-b border-gray-200 ${
                          drop ? "bg-amber-50" : ""
                        }`}
                      >
                        <td
                          className={`${tdL} ${blk ? "pl-8" : ""} ${
                            drop ? "font-semibold" : ""
                          }`}
                        >
                          {blk ? blockLabel(row.term) : row.term.key}
                        </td>
                        {/* Bloques y curvatura no tienen efecto: no hay nivel
                            alto ni bajo entre los que medirlo. */}
                        <td className={td}>
                          {Number.isFinite(row.effect)
                            ? fx(row.effect, 3)
                            : "\u00a0"}
                        </td>
                        <td className={td}>{fx(row.coef, 3)}</td>
                        <td className={td}>{fx(row.se, 3)}</td>
                        <td className={td}>{fx(row.t, 2)}</td>
                        <td
                          className={`${td} ${
                            row.significant
                              ? "font-semibold text-emerald-800"
                              : "text-amber-700"
                          }`}
                        >
                          {fp(row.p)}
                        </td>
                        <td className={td}>{fx(row.vif, 2)}</td>
                      </tr>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
            <p className="mt-2 text-xs text-gray-600">
              Effect is twice the coefficient: the change in {r.response} on
              going from the low level to the high one. The factor VIFs equal
              1,00 in a balanced design, because the coded columns are
              orthogonal.
              {r.usedBlocks
                ? " The block VIFs do not, and cannot: with three or more blocks their columns are necessarily correlated with each other."
                : ""}
            </p>
          </section>

          {/* Resumen */}
          <section className="overflow-x-auto">
            <h4 className="mb-2 text-sm font-semibold text-gray-800">
              Model Summary
            </h4>
            <table className="border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-400">
                  <th className={th}>S</th>
                  <th className={th}>R-sq</th>
                  <th className={th}>R-sq(adj)</th>
                  <th className={th}>R-sq(pred)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className={td}>{fx(f.s, 6)}</td>
                  <td className={td}>{pct(f.r2)}</td>
                  <td className={td}>{pct(f.r2adj)}</td>
                  <td className={td}>{pct(f.r2pred)}</td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* ANOVA */}
          <section className="overflow-x-auto">
            <h4 className="mb-2 text-sm font-semibold text-gray-800">
              Analysis of Variance
            </h4>
            <table className="border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-400">
                  <th className={thL}>Source</th>
                  <th className={th}>DF</th>
                  <th className={th}>Adj SS</th>
                  <th className={th}>Adj MS</th>
                  <th className={th}>F-Value</th>
                  <th className={th}>P-Value</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200 font-medium">
                  <td className={tdL}>Model</td>
                  <td className={td}>{r.modelDF}</td>
                  <td className={td}>{fx(r.modelSS, 3)}</td>
                  <td className={td}>{fx(r.modelMS, 4)}</td>
                  <td className={td}>{fx(r.modelF, 2)}</td>
                  <td className={td}>{fp(r.modelP)}</td>
                </tr>
                {r.groups.map((g) => (
                  <React.Fragment key={g.label}>
                    <tr className="border-b border-gray-200">
                      <td className={`${tdL} pl-6`}>{g.label}</td>
                      <td className={td}>{g.df}</td>
                      <td className={td}>{fx(g.ss, 3)}</td>
                      <td className={td}>{fx(g.ms, 4)}</td>
                      <td className={td}>{fx(g.f, 2)}</td>
                      <td className={td}>{fp(g.p)}</td>
                    </tr>
                    {/* Blocks y Curvature no desglosan: el grupo ya dice todo
                        lo que hay que decir. */}
                    {g.members.length > 1 &&
                      g.label !== "Blocks" &&
                      g.members.map((mrow) => (
                        <tr
                          key={mrow.term.key}
                          className="border-b border-gray-200"
                        >
                          <td className={`${tdL} pl-12`}>{mrow.term.key}</td>
                          <td className={td}>1</td>
                          <td className={td}>{fx(mrow.adjSS, 3)}</td>
                          <td className={td}>{fx(mrow.adjMS, 4)}</td>
                          <td className={td}>{fx(mrow.fValue, 2)}</td>
                          <td className={td}>{fp(mrow.fP)}</td>
                        </tr>
                      ))}
                    {g.members.length === 1 &&
                      g.members[0].term.order > 0 && (
                        <tr className="border-b border-gray-200">
                          <td className={`${tdL} pl-12`}>
                            {g.members[0].term.key}
                          </td>
                          <td className={td}>1</td>
                          <td className={td}>{fx(g.members[0].adjSS, 3)}</td>
                          <td className={td}>{fx(g.members[0].adjMS, 4)}</td>
                          <td className={td}>{fx(g.members[0].fValue, 2)}</td>
                          <td className={td}>{fp(g.members[0].fP)}</td>
                        </tr>
                      )}
                  </React.Fragment>
                ))}
                <tr className="border-b border-gray-200">
                  <td className={tdL}>Error</td>
                  <td className={td}>{f.errDF}</td>
                  <td className={td}>{r.usedLenth ? "*" : fx(f.errSS, 3)}</td>
                  <td className={td}>{r.usedLenth ? "*" : fx(f.errMS, 4)}</td>                  
                  <td className={td}>{"\u00a0"}</td>
                  <td className={td}>{"\u00a0"}</td>
                </tr>
                {/* Desglose del error, sangrado bajo su fila igual que los
                    terminos bajo su grupo. Pure Error va un nivel mas adentro
                    cuando hay falta de ajuste, porque es parte de ella. */}
                {r.errorParts.map((e) => (
                  <tr key={e.label} className="border-b border-gray-200">
                    <td className={`${tdL} ${e.indent === 1 ? "pl-6" : "pl-12"}`}>
                      {e.label}
                    </td>
                    <td className={td}>{e.df}</td>
                    <td className={td}>{fx(e.ss, 3)}</td>
                    <td className={td}>{fx(e.ms, 4)}</td>
                    <td className={td}>
                      {Number.isFinite(e.f) ? fx(e.f, 2) : "\u00a0"}
                    </td>
                    <td className={td}>
                      {Number.isFinite(e.p) ? fp(e.p) : "\u00a0"}
                    </td>
                  </tr>
                ))}                
                <tr className="border-b border-gray-300 font-medium">
                  <td className={tdL}>Total</td>
                  <td className={td}>{f.totDF}</td>
                  <td className={td}>{fx(f.totSS, 3)}</td>
                  <td className={td}>{"\u00a0"}</td>
                  <td className={td}>{"\u00a0"}</td>
                  <td className={td}>{"\u00a0"}</td>
                </tr>
              </tbody>
            </table>
            {r.errorParts.length > 0 && (
              <p className="mt-2 text-xs text-gray-600">
                Pure Error is the scatter between runs made at identical
                settings: no model can explain it, so it is the yardstick for
                everything else. Lack-of-Fit is what the model misses on top of
                that
                {r.errorParts.some((e) => e.label === "Curvature")
                  ? ", once curvature is set aside. Curvature shows up here " +
                    "rather than in the model because the Ct Pt term is off: " +
                    "its variability is inflating the error"
                  : ""}
                . A significant Lack-of-Fit means the model is the wrong shape,
                not just imprecise.
              </p>
            )}            
          </section>

          {/* Ecuacion */}
          <section>
            <h4 className="mb-1 text-sm font-semibold text-gray-800">
              Regression Equation in Uncoded Units
            </h4>
            <p className="font-mono text-sm leading-relaxed text-gray-900">
              {r.response} = {eqParts.join("")}
            </p>
            {r.factors.some((_, i) =>
              r.mainEffects[i].points.some((p) =>
                Number.isNaN(Number(p.label.replace(",", ".")))
              )
            ) && (
              <p className="mt-1 text-xs text-gray-600">
                A text factor keeps its {"\u2212"}1 / +1 coding in this equation:
                there is no real scale to decode it onto.
              </p>
            )}
            {r.hasCenterPoints && params.includeCenterPoints && (
              <p className="mt-1 text-xs text-gray-600">
                Ct Pt is an indicator, not a measurable variable: set it to 0 to
                predict at a corner and to 1 at the centre.
              </p>
            )}
          </section>

          {/* Inusuales */}
          {r.unusual.length > 0 && (
            <section className="overflow-x-auto">
              <h4 className="mb-2 text-sm font-semibold text-gray-800">
                Fits and Diagnostics for Unusual Observations
              </h4>
              <table className="border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-400">
                    <th className={th}>Obs</th>
                    <th className={th}>{r.response}</th>
                    <th className={th}>Fit</th>
                    <th className={th}>Resid</th>
                    <th className={th}>Std Resid</th>
                    <th className={thL}>{"\u00a0"}</th>
                  </tr>
                </thead>
                <tbody>
                  {r.unusual.map((u) => (
                    <tr key={u.obs} className="border-b border-gray-200">
                      <td className={td}>{u.obs}</td>
                      <td className={td}>{fx(u.y, 3)}</td>
                      <td className={td}>{fx(u.fit, 3)}</td>
                      <td className={td}>{fx(u.resid, 3)}</td>
                      <td className={td}>{fx(u.stdResid, 2)}</td>
                      <td className={`${tdL} font-mono`}>
                        {u.largeResid ? "R" : ""}
                        {u.largeResid && u.unusualX ? " " : ""}
                        {u.unusualX ? "X" : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-2 space-y-0.5 text-xs text-gray-600">
                {r.unusual.some((u) => u.largeResid) && (
                  <p>
                    <span className="font-mono font-semibold">R</span> Large
                    residual
                  </p>
                )}
                {r.unusual.some((u) => u.unusualX) && (
                  <p>
                    <span className="font-mono font-semibold">X</span> Unusual X
                  </p>
                )}
              </div>
            </section>
          )}

          {/* Alias */}
          <section>
            <h4 className="mb-2 text-sm font-semibold text-gray-800">
              Alias Structure
            </h4>
            <table className="mb-2 border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-400">
                  <th className={thL}>Factor</th>
                  <th className={thL}>Name</th>
                </tr>
              </thead>
              <tbody>
                {r.factors.map((nm, i) => (
                  <tr key={nm} className="border-b border-gray-200">
                    <td className={`${tdL} font-mono`}>{r.letters[i]}</td>
                    <td className={tdL}>{nm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs font-medium text-gray-700">Aliases</p>
            <div className="space-y-0 font-mono text-xs leading-tight text-gray-800">
              {r.aliases.map((a) => (
                <p key={a.term}>
                  {a.term}
                  {a.aliases.length > 0 ? ` + ${a.aliases.join(" + ")}` : ""}
                </p>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-600">
              {r.aliasClean
                ? "Every term stands alone: nothing is confounded with anything, so each effect can be attributed to its own term."
                : "Terms on the same line cannot be told apart by this design. Their estimated effect is the sum of the whole line."}
              {r.hasCenterPoints
                ? " Aliasing is worked out from the corner runs only: a center point has every column at zero and would distort the comparison."
                : ""}
            </p>
          </section>

          {/* Consejo */}
          <section>
            <h4 className="mb-2 text-sm font-semibold text-gray-800">
              What to do next
            </h4>
            <div className={`rounded-md border px-4 py-3 text-sm ${advTone}`}>
              <p className="font-semibold">{adv.headline}</p>
              <p className="mt-1">{adv.detail}</p>
              {adv.term && (
                <p className="mt-2 text-xs">
                  Next model:{" "}
                  <span className="font-mono">{adv.nextTerms.join(", ")}</span>
                </p>
              )}
            </div>
            {adv.term && (            
              <p className="mt-2 text-xs text-gray-600">
                Uncheck the highlighted term in the controls and run again. The
                hierarchy is kept for you: a main effect never leaves while one of
                its interactions is still in.
              </p>
            )}          
          </section>

          {/* Pareto */}
          {params.showPareto && (
            <section>
              <h4 className="mb-2 text-center text-sm font-semibold text-gray-800">
                Pareto Chart of the Standardized Effects
              </h4>
              <p className="-mt-1 mb-2 text-center text-xs text-gray-500">
                (response is {r.response}; {"\u03B1"} = {fx(r.alpha, 2)})
              </p>
              <div
                className="border border-gray-200 rounded"
                style={{ height: Math.max(280, 34 * r.effectsPlot.length + 90) }}
              >
                <ResultChart
                  data={paretoData}
                  layout={{ autosize: true, ...paretoLayout }}
                />
              </div>
              <p className="mt-2 text-xs text-gray-600">
                Bars past the dashed line at {fx(r.paretoLimit, 2)} are
                significant. That value is the critical t for{" "}
                {r.usedLenth
                  ? "Lenth\u2019s pseudo error"
                  : `${f.errDF} error degrees of freedom`}
                , so it tightens as the model gets leaner.
                {r.hasCenterPoints && params.includeCenterPoints
                  ? " The Ct Pt term is left out: curvature is not a factorial effect."
                  : ""}
              </p>
            </section>
          )}

          {/* Normal plot */}
          {params.showNormal && (
            <section>
              <h4 className="mb-2 text-center text-sm font-semibold text-gray-800">
                Normal Plot of the Standardized Effects
              </h4>
              <p className="-mt-1 mb-2 text-center text-xs text-gray-500">
                (response is {r.response}; {"\u03B1"} = {fx(r.alpha, 2)})
              </p>
              <div
                className="border border-gray-200 rounded"
                style={{ height: 420 }}
              >
                <ResultChart
                  data={normalData}
                  layout={{ autosize: true, ...normalLayout }}
                />
              </div>
              <div className="mt-2 flex flex-wrap gap-4 text-xs text-gray-600">
                {r.factors.map((nm, i) => (
                  <span key={nm}>
                    <span className="font-mono font-semibold">
                      {r.letters[i]}
                    </span>{" "}
                    {nm}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-xs text-gray-600">
                The red line is fitted to the non-significant effects alone,
                because those are the ones that represent noise. Points that fall
                on it are indistinguishable from zero; points that stray from it
                are real.
              </p>
            </section>
          )}

          {/* Main effects */}
          {params.showMainEffects && (
            <section>
              <h4 className="mb-2 text-center text-sm font-semibold text-gray-800">
                Main Effects Plot for {r.response}
              </h4>
              <p className="-mt-1 mb-2 text-center text-xs text-gray-500">
                Fitted Means
              </p>
              <div
                className="border border-gray-200 rounded"
                style={{ height: 360 }}
              >
                <ResultChart
                  data={meData}
                  layout={{ autosize: true, ...meLayout }}
                />
              </div>
              <p className="mt-2 text-xs text-gray-600">
                These are <strong>fitted</strong> means, from the model as it
                stands, not raw averages of the data. Drop a term and these lines
                move. A steep slope means a large effect; a flat one means the
                factor does nothing on average, which is not the same as doing
                nothing.
              </p>
              {r.hasCenterPoints && (
                <p className="mt-1 text-xs text-gray-600">
                  The lines join the corner levels. Center points are not drawn:
                  they are a curvature check, not a third level.
                </p>
              )}
            </section>
          )}

          {/* Interaction */}
          {params.showInteraction && (
            <section>
              <h4 className="mb-2 text-center text-sm font-semibold text-gray-800">
                Interaction Plot for {r.response}
              </h4>
              <p className="-mt-1 mb-2 text-center text-xs text-gray-500">
                Fitted Means
              </p>
              <div
                className="border border-gray-200 rounded"
                style={{ height: Math.max(400, 165 * r.factors.length + 90) }}
              >
                <ResultChart
                  data={intData}
                  layout={{ autosize: true, ...intLayout }}
                />
              </div>
              <p className="mt-2 text-xs text-gray-600">
                Non-parallel lines mean interaction. They do not have to cross to
                matter, and a slight crossing can still be nothing. The p-value of
                the interaction term settles it; the plot only shows you what the
                number means.
              </p>
            </section>
          )}

          {/* Residuos */}
          {params.showResiduals && (
            <section>
              <h4 className="mb-2 text-center text-sm font-semibold text-gray-800">
                Residual Plots for {r.response}
              </h4>
              <div
                className="border border-gray-200 rounded"
                style={{ height: 620 }}
              >
                <ResultChart
                  data={resData}
                  layout={{ autosize: true, ...resLayout }}
                />
              </div>
              <p className="mt-2 text-xs text-gray-600">
                Points near the red line mean normal residuals. Against the fits,
                look for a funnel or a curve; against the order, for drift or
                runs. In a factorial the fitted values sit in a few columns, one
                per treatment combination, so that clustering is normal.
              </p>
              {r.hasCenterPoints && (
                <p className="mt-1 text-xs text-gray-600">
                  The center points form their own column, near the middle of the
                  fitted range.
                </p>
              )}
            </section>
          )}

          <section className="space-y-1 text-xs text-gray-600">
            <p>
              {r.n} run(s)
              {r.hasCenterPoints
                ? `, of which ${r.nCenterPoints} at the centre`
                : ""}
              {r.usedBlocks ? ` in ${r.blockLevels.length} blocks` : ""},{" "}
              {r.rows.length} term(s) in the model,{" "}
              {r.usedLenth ? "no" : f.errDF} error degree(s) of freedom. Overall
              mean {fx(r.grandMean, 4)}.
            </p>
            {r.nMissing > 0 && (
              <p className="text-amber-700">
                {r.nMissing} row(s) skipped: the response or a factor level was
                missing.
              </p>
            )}
          </section>
        </div>
      }
    />
  );
}
