// app/app/six-sigma/studies/ht/_shared/ciStrip.ts
import type { Data, Layout } from "plotly.js";
import type { TTest1Model } from "../../../lib/tTest1";

const GREEN = "#00674d";
const RED = "#d92b2b";

/** Segmento de IC + media + Hâ‚€, para pintar bajo cada grÃ¡fica. */
export function ciStripTraces(r: TTest1Model): Data[] {
  const lo = Number.isFinite(r.ciLow) ? r.ciLow : r.mean;
  const hi = Number.isFinite(r.ciHigh) ? r.ciHigh : r.mean;

  const traces: Data[] = [
    // --- Barra del intervalo ---
    {
      type: "scatter",
      mode: "lines",
      x: [lo, hi],
      y: [0, 0],
      line: { color: GREEN, width: 3 },
      hoverinfo: "skip",
      showlegend: false,
    },
    // --- Topes de los extremos (serifas cortas) ---
    {
      type: "scatter",
      mode: "markers",
      x: [lo, hi],
      y: [0, 0],
      marker: { color: GREEN, size: 10, symbol: "line-ns-open", line: { width: 2 } },
      hoverinfo: "skip",
      showlegend: false,
    },
    // --- Media: segmento vertical + etiqueta arriba ---
    {
      type: "scatter",
      mode: "text+markers",
      x: [r.mean],
      y: [0],
      marker: {
        color: GREEN,
        size: 20,
        symbol: "line-ns-open",
        line: { width: 3 },
      },
      text: ["xÌ„"],
      textposition: "top center",
      textfont: { color: GREEN, size: 12 },
      name: "xÌ„",
      hovertemplate: "xÌ„ = %{x}<extra></extra>",
      showlegend: false,
    },
  ];

  if (r.performTest) {
    // --- Hâ‚€: cÃ­rculo no relleno con cruz + etiqueta abajo ---
    traces.push({
      type: "scatter",
      mode: "text+markers",
      x: [r.mu0],
      y: [0],
      marker: {
        color: RED,
        size: 14,
        symbol: "circle-cross-open",
        line: { width: 2 },
      },
      text: ["Hâ‚€"],
      textposition: "bottom center",
      textfont: { color: RED, size: 12 },
      name: "Hâ‚€",
      hovertemplate: "Hâ‚€: Î¼ = %{x}<extra></extra>",
      showlegend: false,
    });
  }

  return traces;
}

/** Layout de la banda: sin eje Y, eje X compartido con la grÃ¡fica de arriba. */
export function ciStripLayout(range: [number, number]): Partial<Layout> {
  return {
    margin: { l: 60, r: 30, t: 8, b: 34 },
    xaxis: { range, zeroline: false, showgrid: false },
    yaxis: {
      // Rango holgado para que las etiquetas xÌ„ (arriba) y Hâ‚€ (abajo) no se recorten.
      range: [-1.6, 1.6],
      visible: false,
      fixedrange: true,
    },
    showlegend: false,
  };
}
