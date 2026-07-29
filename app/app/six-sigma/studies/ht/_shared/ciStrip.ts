// app/app/six-sigma/studies/ht/_shared/ciStrip.ts
import type { Data, Layout } from "plotly.js";
import type { TTest1Model } from "../../../lib/tTest1";

const GREEN = "#00674d";

/** Segmento de IC + media + H₀, para pintar bajo cada gráfica. */
export function ciStripTraces(r: TTest1Model): Data[] {
  const lo = Number.isFinite(r.ciLow) ? r.ciLow : r.mean;
  const hi = Number.isFinite(r.ciHigh) ? r.ciHigh : r.mean;

  const traces: Data[] = [
    {
      type: "scatter",
      mode: "lines",
      x: [lo, hi],
      y: [0, 0],
      line: { color: GREEN, width: 3 },
      hoverinfo: "skip",
      showlegend: false,
    },
    {
      type: "scatter",
      mode: "markers",
      x: [lo, hi],
      y: [0, 0],
      marker: { color: GREEN, size: 10, symbol: "line-ns-open" },
      hoverinfo: "skip",
      showlegend: false,
    },
    {
      type: "scatter",
      mode: "markers",
      x: [r.mean],
      y: [0],
      marker: { color: GREEN, size: 11, symbol: "circle" },
      name: "X̄",
      hovertemplate: "X̄ = %{x}<extra></extra>",
      showlegend: false,
    },
  ];

  if (r.performTest) {
    traces.push({
      type: "scatter",
      mode: "markers+text",
      x: [r.mu0],
      y: [0],
      marker: { color: "#d92b2b", size: 12, symbol: "circle" },
      text: ["H₀"],
      textposition: "top center",
      textfont: { color: "#d92b2b", size: 11 },
      hovertemplate: "H₀ = %{x}<extra></extra>",
      showlegend: false,
    });
  }

  return traces;
}

/** Layout de la banda: sin eje Y, eje X compartido con la gráfica de arriba. */
export function ciStripLayout(range: [number, number]): Partial<Layout> {
  return {
    margin: { l: 60, r: 30, t: 8, b: 34 },
    xaxis: { range, zeroline: false, showgrid: false },
    yaxis: {
      range: [-1, 1],
      visible: false,
      fixedrange: true,
    },
    showlegend: false,
  };
}
