// app/app/six-sigma/studies/improve/fitregression/Results.tsx
"use client";
import React from "react";
import type { Data, Layout, Shape } from "plotly.js";
import ReportLayout from "../../../components/ReportLayout";
import ResultChart from "../../../components/ResultChart";
import { normalInv } from "../../../lib/regression";
import { blomPositions, coefDecimals } from "./compute";
import {
  VIF_SEVERE,
  VIF_WARN,
  type ImpFitRegParams,
  type ImpFitRegResult,
} from "./types";

const BLUE = "#1d4ed8";
const RED = "#b91c1c";
const GREY = "#6b7280";

const fx = (v: number, dec: number): string =>
  Number.isFinite(v) ? v.toFixed(dec).replace(".", ",") : "*";

/** p-valor a tres decimales: por debajo de 0,0005 se escribe 0,000. */
const fp = (v: number): string => (Number.isFinite(v) ? fx(v, 3) : "*");

/**
 * Decimales de una columna de sumas de cuadrados: los que dan cuatro cifras
 * significativas al valor mas pequeno de la columna.
 */
const decCol = (vals: number[]): number => {
  const fin = vals.filter((v) => Number.isFinite(v) && Math.abs(v) > 0);
  if (fin.length === 0) return 1;
  const mn = Math.min(...fin.map(Math.abs));
  return Math.max(0, Math.min(6, 3 - Math.floor(Math.log10(mn))));
};

export default function ImpFitRegResults({
  result,
  params,
}: {
  result: ImpFitRegResult;
  params: ImpFitRegParams;
}) {
  if (!result.ok) {
    return (
      <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        {result.error ?? "Selecciona la respuesta y los predictores."}
      </div>
    );
  }

  const r = result;
  const f = r.fit;
  const adv = r.advice;

  const dSS = decCol([f.regSS, ...f.terms.map((t) => t.adjSS), f.errSS, f.totSS]);
  const dMS = decCol([f.regMS, ...f.terms.map((t) => t.adjMS), f.errMS]);

  /* ---------- graficos de residuos ---------- */
  const n = f.n;
  const sortedRes = [...f.resid].sort((a, b) => a - b);
  const zq = blomPositions(n).map((p) => normalInv(p));
  const mR = f.resid.reduce((a, b) => a + b, 0) / n;
  const sR = Math.sqrt(
    f.resid.reduce((a, v) => a + (v - mR) * (v - mR), 0) / (n - 1)
  );
  const pctTicks = [1, 5, 10, 20, 30, 50, 70, 80, 90, 95, 99];
  const zLine = [-2.6, 2.6];

  const resTraces: Data[] = [
    {
      type: "scatter",
      mode: "markers",
      x: sortedRes,
      y: zq,
      xaxis: "x",
      yaxis: "y",
      marker: { color: BLUE, size: 6 },
      showlegend: false,
      hovertemplate: "Residual %{x:.2f}<extra></extra>",
    } as unknown as Data,
    {
      type: "scatter",
      mode: "lines",
      x: zLine.map((z) => mR + sR * z),
      y: zLine,
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
      y: f.resid,
      xaxis: "x2",
      yaxis: "y2",
      marker: { color: BLUE, size: 6 },
      showlegend: false,
      hovertemplate: "Fit %{x:.1f}<br>Resid %{y:.2f}<extra></extra>",
    } as unknown as Data,
    {
      type: "histogram",
      x: f.resid,
      xaxis: "x3",
      yaxis: "y3",
      marker: { color: BLUE, line: { color: "#ffffff", width: 1 } },
      showlegend: false,
      hovertemplate: "Residual %{x}<br>Frequency %{y}<extra></extra>",
    } as unknown as Data,
    {
      type: "scatter",
      mode: "lines+markers",
      x: f.resid.map((_, i) => i + 1),
      y: f.resid,
      xaxis: "x4",
      yaxis: "y4",
      line: { color: BLUE, width: 1 },
      marker: { color: BLUE, size: 5 },
      showlegend: false,
      hovertemplate: "Obs %{x}<br>Resid %{y:.2f}<extra></extra>",
    } as unknown as Data,
  ];

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

  const resLayout: Partial<Layout> & Record<string, unknown> = {
    margin: { l: 60, r: 25, t: 30, b: 45 },
    plot_bgcolor: "#ffffff",
    showlegend: false,
    shapes: [zeroLine("x2", "y2"), zeroLine("x4", "y4")],
    xaxis: {
      domain: [0, 0.44],
      anchor: "y" as never,
      title: { text: "Residual", font: { size: 10 } },
      tickfont: { size: 9 },
      zeroline: false,
    },
    yaxis: {
      domain: [0.58, 1],
      anchor: "x" as never,
      title: { text: "Percent", font: { size: 10 } },
      tickmode: "array",
      tickvals: pctTicks.map((v) => normalInv(v / 100)),
      ticktext: pctTicks.map(String),
      tickfont: { size: 9 },
      zeroline: false,
    },
    xaxis2: {
      domain: [0.56, 1],
      anchor: "y2" as never,
      title: { text: "Fitted Value", font: { size: 10 } },
      tickfont: { size: 9 },
      zeroline: false,
    },
    yaxis2: {
      domain: [0.58, 1],
      anchor: "x2" as never,
      title: { text: "Residual", font: { size: 10 } },
      tickfont: { size: 9 },
      zeroline: false,
    },
    xaxis3: {
      domain: [0, 0.44],
      anchor: "y3" as never,
      title: { text: "Residual", font: { size: 10 } },
      tickfont: { size: 9 },
      zeroline: false,
    },
    yaxis3: {
      domain: [0, 0.42],
      anchor: "x3" as never,
      title: { text: "Frequency", font: { size: 10 } },
      tickfont: { size: 9 },
      zeroline: false,
    },
    xaxis4: {
      domain: [0.56, 1],
      anchor: "y4" as never,
      title: { text: "Observation Order", font: { size: 10 } },
      tickfont: { size: 9 },
      zeroline: false,
    },
    yaxis4: {
      domain: [0, 0.42],
      anchor: "x4" as never,
      title: { text: "Residual", font: { size: 10 } },
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

  /* ---------- estilos ---------- */
  const th = "px-3 py-1 text-right font-medium text-gray-600 whitespace-nowrap";
  const thL = "px-3 py-1 text-left font-medium text-gray-600 whitespace-nowrap";
  const td = "px-3 py-1 text-right whitespace-nowrap";
  const tdL = "px-3 py-1 text-left whitespace-nowrap";

  const vifClass = (v: number): string => {
    if (!Number.isFinite(v) || v >= VIF_SEVERE) return "text-red-700 font-semibold";
    if (v >= VIF_WARN) return "text-amber-700 font-semibold";
    return "";
  };

  const advTone =
    adv.kind === "final"
      ? "border-emerald-300 bg-emerald-50 text-emerald-900"
      : adv.kind === "vifSevere"
        ? "border-red-300 bg-red-50 text-red-900"
        : "border-amber-300 bg-amber-50 text-amber-900";

  return (
    <ReportLayout
      template="chart-text"
      center={
        <div className="w-full space-y-6">
          <h3 className="text-sm font-semibold text-gray-800">
            Regression Analysis: {r.response} versus {r.predictors.join("; ")}
          </h3>

          <section>
            <h4 className="mb-1 text-sm font-semibold text-gray-800">
              Regression Equation
            </h4>
            <p className="font-mono text-sm text-gray-900">{r.equation}</p>
          </section>

          <section className="overflow-x-auto">
            <h4 className="mb-2 text-sm font-semibold text-gray-800">
              Coefficients
            </h4>
            <table className="border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-400">
                  <th className={thL}>Term</th>
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
                  <td className={td}>
                    {fx(f.constant.coef, coefDecimals(f.constant.se))}
                  </td>
                  <td className={td}>
                    {fx(f.constant.se, coefDecimals(f.constant.se))}
                  </td>
                  <td className={td}>{fx(f.constant.t, 2)}</td>
                  <td className={td}>{fp(f.constant.p)}</td>
                  <td className={td}>{"\u00a0"}</td>
                </tr>
                {f.terms.map((t) => {
                  const d = coefDecimals(t.se);
                  const drop = adv.term === t.name;
                  return (
                    <tr
                      key={t.name}
                      className={`border-b border-gray-200 ${drop ? "bg-amber-50" : ""}`}
                    >
                      <td className={`${tdL} ${drop ? "font-semibold" : ""}`}>
                        {t.name}
                      </td>
                      <td className={td}>{fx(t.coef, d)}</td>
                      <td className={td}>{fx(t.se, d)}</td>
                      <td className={td}>{fx(t.t, 2)}</td>
                      <td
                        className={`${td} ${
                          t.p > r.alpha ? "text-amber-700 font-semibold" : ""
                        }`}
                      >
                        {fp(t.p)}
                      </td>
                      <td className={`${td} ${vifClass(t.vif)}`}>
                        {Number.isFinite(t.vif) ? fx(t.vif, 2) : "\u221e"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>

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
                  <td className={td}>{fx(f.s, 4)}</td>
                  <td className={td}>{fx(f.r2, 2)}%</td>
                  <td className={td}>{fx(f.r2adj, 2)}%</td>
                  <td className={td}>{fx(f.r2pred, 2)}%</td>
                </tr>
              </tbody>
            </table>
          </section>

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
                  <td className={tdL}>Regression</td>
                  <td className={td}>{f.regDF}</td>
                  <td className={td}>{fx(f.regSS, dSS)}</td>
                  <td className={td}>{fx(f.regMS, dMS)}</td>
                  <td className={td}>{fx(f.regF, 2)}</td>
                  <td className={td}>{fp(f.regP)}</td>
                </tr>
                {f.terms.map((t) => (
                  <tr key={t.name} className="border-b border-gray-200">
                    <td className={`${tdL} pl-6`}>{t.name}</td>
                    <td className={td}>1</td>
                    <td className={td}>{fx(t.adjSS, dSS)}</td>
                    <td className={td}>{fx(t.adjMS, dMS)}</td>
                    <td className={td}>{fx(t.fValue, 2)}</td>
                    <td className={td}>{fp(t.fP)}</td>
                  </tr>
                ))}
                <tr className="border-b border-gray-200">
                  <td className={tdL}>Error</td>
                  <td className={td}>{f.errDF}</td>
                  <td className={td}>{fx(f.errSS, dSS)}</td>
                  <td className={td}>{fx(f.errMS, dMS)}</td>
                  <td className={td}>{"\u00a0"}</td>
                  <td className={td}>{"\u00a0"}</td>
                </tr>
                <tr className="border-b border-gray-300 font-medium">
                  <td className={tdL}>Total</td>
                  <td className={td}>{f.totDF}</td>
                  <td className={td}>{fx(f.totSS, dSS)}</td>
                  <td className={td}>{"\u00a0"}</td>
                  <td className={td}>{"\u00a0"}</td>
                  <td className={td}>{"\u00a0"}</td>
                </tr>
              </tbody>
            </table>
            <p className="mt-2 text-xs text-gray-600">
              Adjusted sums of squares are Type III: each is what the error grows
              by when that term alone is dropped. They do not add up to the
              regression total when the predictors are correlated.
            </p>
          </section>

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
                      <td className={td}>{fx(u.y, 2)}</td>
                      <td className={td}>{fx(u.fit, 2)}</td>
                      <td className={td}>{fx(u.resid, 2)}</td>
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
                    <span className="font-mono font-semibold">X</span> Unusual X{" "}
                    <span className="text-gray-500">
                      (leverage above {fx(r.leverageLimit, 3)})
                    </span>
                  </p>
                )}
              </div>
            </section>
          )}

          <section>
            <h4 className="mb-2 text-sm font-semibold text-gray-800">
              What to do next
            </h4>
            <div className={`rounded-md border px-4 py-3 text-sm ${advTone}`}>
              <p className="font-semibold">{adv.headline}</p>
              <p className="mt-1">{adv.detail}</p>
              {adv.term && adv.nextPredictors.length > 0 && (
                <p className="mt-2 text-xs">
                  Next model:{" "}
                  <span className="font-mono">
                    {r.response} versus {adv.nextPredictors.join("; ")}
                  </span>
                </p>
              )}
            </div>
            <p className="mt-2 text-xs text-gray-600">
              Collinearity is judged before significance: while a variance is
              inflated, neither the coefficient nor its p-value can be trusted.
              Drop one term, refit, and read the table again.
            </p>
          </section>

          {params.showResidualPlots && (
            <section>
              <h4 className="mb-2 text-center text-sm font-semibold text-gray-800">
                Residual Plots for {r.response}
              </h4>
              <div
                className="border border-gray-200 rounded"
                style={{ height: 620 }}
              >
                <ResultChart
                  data={resTraces}
                  layout={{ autosize: true, ...resLayout }}
                />
              </div>
              <p className="mt-2 text-xs text-gray-600">
                Points near the red line mean normal residuals. Look for a funnel
                or a curve against the fits, and for drift or runs against the
                order.
              </p>
            </section>
          )}

          <section className="space-y-1 text-xs text-gray-600">
            <p>
              {r.n} complete row(s), {f.p} parameter(s), {f.errDF} error degrees
              of freedom. Confidence level {fx(r.confLevel, 1)}%.
            </p>
            {r.nMissing > 0 && (
              <p className="text-amber-700">
                {r.nMissing} row(s) dropped: a value was missing in the response
                or in a predictor.
              </p>
            )}
          </section>
        </div>
      }
    />
  );
}
