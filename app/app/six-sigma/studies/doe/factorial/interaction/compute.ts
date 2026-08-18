// app/app/six-sigma/studies/doe/factorial/interaction/compute.ts
import type { ColumnSnapshot } from "../../../types";
import {
  MAX_FACTORS,
  MAX_LEVELS,
  MAX_PANELS,
  type DoeIntParams,
  type DoeIntResult,
  type IntPanel,
  type IntSeries,
  type PairSummary,
} from "./types";

const cellNum = (c: number | string | null | undefined): number => {
  if (typeof c === "number") return c;
  if (typeof c !== "string") return NaN;
  const t = c.trim().replace(",", ".");
  return t === "" ? NaN : Number(t);
};

const cellText = (c: number | string | null | undefined): string =>
  c === null || c === undefined ? "" : String(c).trim();

const fail = (error: string): DoeIntResult => ({ ok: false, error });

const levelLabel = (raw: string): string => {
  const v = cellNum(raw);
  return Number.isFinite(v) ? String(v).replace(".", ",") : raw;
};

export function computeDoeInt(
  data: ColumnSnapshot,
  params: DoeIntParams
): DoeIntResult {
  const resp = params.response.trim();
  if (resp === "") return fail("Select the response.");

  const facs = params.factors.filter((s) => s.trim() !== "" && s !== resp);
  if (facs.length < 2) {
    return fail("Select at least two factors: an interaction needs a pair.");
  }
  if (facs.length > MAX_FACTORS) {
    return fail(`Too many factors (${facs.length}). The limit is ${MAX_FACTORS}.`);
  }

  const yCol = data[resp];
  if (!yCol) return fail(`Column "${resp}" does not exist.`);
  for (const nm of facs) {
    if (!data[nm]) return fail(`Column "${nm}" does not exist.`);
  }

  const k = facs.length;
  const panelCount = params.fullMatrix ? k * k : (k * (k - 1)) / 2;
  if (panelCount > MAX_PANELS) {
    return fail(
      `Too many panels (${panelCount}). The limit is ${MAX_PANELS}. ` +
        `Turn the full matrix off, or pick fewer factors.`
    );
  }

  // --- Filas utilizables ----------------------------------------------------
  // Se exige la respuesta numerica y TODOS los factores con valor: una celda
  // de la tabla cruzada necesita conocer el nivel de los dos factores.
  const len = Math.max(
    yCol.values.length,
    ...facs.map((nm) => data[nm].values.length)
  );
  const y: number[] = [];
  const raw: string[][] = facs.map(() => []);
  let nMissing = 0;

  for (let i = 0; i < len; i++) {
    const yv = cellNum(yCol.values[i]);
    const texts = facs.map((nm) => cellText(data[nm].values[i]));
    const allBlank =
      cellText(yCol.values[i]) === "" && texts.every((t) => t === "");
    if (allBlank) continue;
    if (!Number.isFinite(yv) || texts.some((t) => t === "")) {
      nMissing++;
      continue;
    }
    y.push(yv);
    texts.forEach((t, j) => raw[j].push(t));
  }

  const n = y.length;
  if (n < 4) return fail("Not enough complete runs to cross two factors.");

  const grandMean = y.reduce((a, b) => a + b, 0) / n;

  // --- Niveles de cada factor ----------------------------------------------
  const levels: string[][] = [];
  for (let j = 0; j < k; j++) {
    const uniq = [...new Set(raw[j])];
    if (uniq.length < 2) {
      return fail(`Factor "${facs[j]}" has a single level.`);
    }
    if (uniq.length > MAX_LEVELS) {
      return fail(
        `Factor "${facs[j]}" has ${uniq.length} levels. The limit is ${MAX_LEVELS}. ` +
          `It looks like a measured variable rather than a factor.`
      );
    }
    const allNum = uniq.every((s) => Number.isFinite(cellNum(s)));
    uniq.sort((a, b) =>
      allNum
        ? cellNum(a) - cellNum(b)
        : a.localeCompare(b, undefined, { numeric: true })
    );
    levels.push(uniq);
  }

  /** Medias de la tabla cruzada de dos factores. */
  const crossMeans = (fa: number, fb: number): (number | null)[][] => {
    const la = levels[fa].length;
    const lb = levels[fb].length;
    const sum: number[][] = Array.from({ length: la }, () =>
      new Array(lb).fill(0)
    );
    const cnt: number[][] = Array.from({ length: la }, () =>
      new Array(lb).fill(0)
    );
    for (let i = 0; i < n; i++) {
      const ia = levels[fa].indexOf(raw[fa][i]);
      const ib = levels[fb].indexOf(raw[fb][i]);
      if (ia < 0 || ib < 0) continue;
      sum[ia][ib] += y[i];
      cnt[ia][ib]++;
    }
    return sum.map((row, ia) =>
      row.map((s, ib) => (cnt[ia][ib] > 0 ? s / cnt[ia][ib] : null))
    );
  };

  const crossCounts = (fa: number, fb: number): number[][] => {
    const cnt: number[][] = Array.from({ length: levels[fa].length }, () =>
      new Array(levels[fb].length).fill(0)
    );
    for (let i = 0; i < n; i++) {
      const ia = levels[fa].indexOf(raw[fa][i]);
      const ib = levels[fb].indexOf(raw[fb][i]);
      if (ia >= 0 && ib >= 0) cnt[ia][ib]++;
    }
    return cnt;
  };

  // --- Paneles --------------------------------------------------------------
  // En el panel (i, j) el eje horizontal es el factor j y cada linea es un
  // nivel del factor i. Lineas paralelas significan ausencia de interaccion.
  const panels: IntPanel[] = [];
  const build = (i: number, j: number): IntPanel => {
    if (i === j) {
      return {
        row: i,
        col: j,
        rowFactor: facs[i],
        colFactor: facs[j],
        diagonal: true,
        xLabels: [],
        series: [],
      };
    }
    const means = crossMeans(i, j);
    const counts = crossCounts(i, j);
    const series: IntSeries[] = levels[i].map((lv, ia) => ({
      label: levelLabel(lv),
      levelIndex: ia,
      means: means[ia],
      ns: counts[ia],
    }));
    return {
      row: i,
      col: j,
      rowFactor: facs[i],
      colFactor: facs[j],
      diagonal: false,
      xLabels: levels[j].map(levelLabel),
      series,
    };
  };

  if (params.fullMatrix) {
    for (let i = 0; i < k; i++) for (let j = 0; j < k; j++) panels.push(build(i, j));
  } else {
    // Una fila: cada par una sola vez, el primero manda las lineas.
    let col = 0;
    for (let i = 0; i < k; i++) {
      for (let j = i + 1; j < k; j++) {
        const p = build(i, j);
        panels.push({ ...p, row: 0, col: col++ });
      }
    }
  }

  // --- Resumen por par ------------------------------------------------------
  const pairs: PairSummary[] = [];
  for (let i = 0; i < k; i++) {
    for (let j = i + 1; j < k; j++) {
      const m = crossMeans(i, j);
      const la = levels[i].length;
      const lb = levels[j].length;

      let emptyCells = 0;
      m.forEach((row) => row.forEach((v) => { if (v === null) emptyCells++; }));

      // Efecto clasico: solo tiene sentido con dos niveles en ambos factores.
      let effect = NaN;
      if (la === 2 && lb === 2 && emptyCells === 0) {
        const simpleLow = (m[1][0] as number) - (m[0][0] as number);
        const simpleHigh = (m[1][1] as number) - (m[0][1] as number);
        effect = (simpleHigh - simpleLow) / 2;
      }

      // Desviacion respecto al modelo aditivo: cero exacto si son paralelas.
      // Se calcula sobre las celdas presentes, con medias marginales propias.
      let maxDeparture = 0;
      const present: { ia: number; ib: number; v: number }[] = [];
      m.forEach((row, ia) =>
        row.forEach((v, ib) => {
          if (v !== null) present.push({ ia, ib, v });
        })
      );
      if (present.length > 0) {
        const gm = present.reduce((a, c) => a + c.v, 0) / present.length;
        const rowMean = (ia: number) => {
          const s = present.filter((c) => c.ia === ia);
          return s.length ? s.reduce((a, c) => a + c.v, 0) / s.length : gm;
        };
        const colMean = (ib: number) => {
          const s = present.filter((c) => c.ib === ib);
          return s.length ? s.reduce((a, c) => a + c.v, 0) / s.length : gm;
        };
        for (const c of present) {
          const d = Math.abs(c.v - rowMean(c.ia) - colMean(c.ib) + gm);
          if (d > maxDeparture) maxDeparture = d;
        }
      }

      pairs.push({ a: facs[i], b: facs[j], effect, maxDeparture, emptyCells });
    }
  }
  pairs.sort((a, b) => b.maxDeparture - a.maxDeparture);

  // --- Efecto principal mayor, para dar contexto ----------------------------
  let largestMain = 0;
  let largestMainName = facs[0];
  for (let j = 0; j < k; j++) {
    const ms = levels[j].map((lv) => {
      const s = y.filter((_, i) => raw[j][i] === lv);
      return s.reduce((a, b) => a + b, 0) / Math.max(1, s.length);
    });
    const rg = Math.max(...ms) - Math.min(...ms);
    if (rg > largestMain) {
      largestMain = rg;
      largestMainName = facs[j];
    }
  }

  // --- Escala comun ---------------------------------------------------------
  const allMeans: number[] = [];
  panels.forEach((p) =>
    p.series.forEach((s) =>
      s.means.forEach((v) => {
        if (v !== null) allMeans.push(v);
      })
    )
  );
  const lo = Math.min(...allMeans);
  const hi = Math.max(...allMeans);
  const span = hi - lo;
  const pad = span > 0 ? span * 0.12 : Math.abs(hi) * 0.12 || 1;

  return {
    ok: true,
    response: resp,
    factors: facs,
    levels: levels.map((ls) => ls.map(levelLabel)),
    panels,
    pairs,
    grandMean,
    yRange: [lo - pad, hi + pad],
    fullMatrix: params.fullMatrix,
    sharedScale: params.sharedScale,
    nRows: params.fullMatrix ? k : 1,
    nCols: params.fullMatrix ? k : (k * (k - 1)) / 2,
    largestMain,
    largestMainName,
    n,
    nMissing,
  };
}
