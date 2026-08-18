// app/app/six-sigma/studies/doe/factorial/maineffects/compute.ts
import type { ColumnSnapshot } from "../../../types";
import {
  MAX_FACTORS,
  MAX_LEVELS,
  type DoeMainParams,
  type DoeMainResult,
  type FactorEffect,
  type LevelMean,
} from "./types";

const cellNum = (c: number | string | null | undefined): number => {
  if (typeof c === "number") return c;
  if (typeof c !== "string") return NaN;
  const t = c.trim().replace(",", ".");
  return t === "" ? NaN : Number(t);
};

const cellText = (c: number | string | null | undefined): string =>
  c === null || c === undefined ? "" : String(c).trim();

const fail = (error: string): DoeMainResult => ({ ok: false, error });

/** Etiqueta de nivel: coma decimal y sin ceros de relleno. */
const levelLabel = (raw: string): string => {
  const v = cellNum(raw);
  if (!Number.isFinite(v)) return raw;
  return String(v).replace(".", ",");
};

export function computeDoeMain(
  data: ColumnSnapshot,
  params: DoeMainParams
): DoeMainResult {
  const resp = params.response.trim();
  if (resp === "") return fail("Select the response.");

  const facs = params.factors.filter((s) => s.trim() !== "" && s !== resp);
  if (facs.length < 1) return fail("Select at least one factor.");
  if (facs.length > MAX_FACTORS) {
    return fail(`Too many factors. The limit is ${MAX_FACTORS}.`);
  }

  const yCol = data[resp];
  if (!yCol) return fail(`Column "${resp}" does not exist.`);
  for (const nm of facs) {
    if (!data[nm]) return fail(`Column "${nm}" does not exist.`);
  }

  // --- Filas utilizables ----------------------------------------------------
  // Basta con que la respuesta sea numerica y el factor tenga valor: cada
  // factor se promedia por separado, asi que un hueco en otro factor no
  // invalida la fila entera.
  const len = Math.max(
    yCol.values.length,
    ...facs.map((nm) => data[nm].values.length)
  );

  const y: number[] = [];
  const raw: string[][] = facs.map(() => []);
  let nMissing = 0;
  let nUsed = 0;

  for (let i = 0; i < len; i++) {
    const yv = cellNum(yCol.values[i]);
    const texts = facs.map((nm) => cellText(data[nm].values[i]));
    const allBlank =
      cellText(yCol.values[i]) === "" && texts.every((t) => t === "");
    if (allBlank) continue;
    if (!Number.isFinite(yv)) {
      nMissing++;
      continue;
    }
    y.push(yv);
    texts.forEach((t, j) => raw[j].push(t));
    nUsed++;
  }

  if (nUsed < 2) return fail("Not enough numeric responses to average.");

  const grandMean = y.reduce((a, b) => a + b, 0) / y.length;

  // --- Medias por nivel -----------------------------------------------------
  const effects: FactorEffect[] = [];
  for (let j = 0; j < facs.length; j++) {
    const buckets = new Map<string, { sum: number; n: number }>();
    for (let i = 0; i < y.length; i++) {
      const key = raw[j][i];
      if (key === "") continue;
      const b = buckets.get(key) ?? { sum: 0, n: 0 };
      b.sum += y[i];
      b.n++;
      buckets.set(key, b);
    }

    if (buckets.size === 0) {
      return fail(`Factor "${facs[j]}" has no usable levels.`);
    }
    if (buckets.size === 1) {
      return fail(
        `Factor "${facs[j]}" has a single level: it cannot show an effect.`
      );
    }
    if (buckets.size > MAX_LEVELS) {
      return fail(
        `Factor "${facs[j]}" has ${buckets.size} levels. The limit is ${MAX_LEVELS}. ` +
          `It looks like a measured variable rather than a factor.`
      );
    }

    // Orden numerico si todos los niveles lo son; alfabetico en otro caso.
    const keys = [...buckets.keys()];
    const allNum = keys.every((k) => Number.isFinite(cellNum(k)));
    keys.sort((a, b) =>
      allNum
        ? cellNum(a) - cellNum(b)
        : a.localeCompare(b, undefined, { numeric: true })
    );

    const levels: LevelMean[] = keys.map((k) => {
      const b = buckets.get(k)!;
      return {
        label: levelLabel(k),
        value: cellNum(k),
        mean: b.sum / b.n,
        n: b.n,
      };
    });

    const means = levels.map((l) => l.mean);
    effects.push({
      name: facs[j],
      levels,
      range: Math.max(...means) - Math.min(...means),
      // Con mas de dos niveles el signo no tiene sentido: no hay "alto" ni
      // "bajo", solo un recorrido.
      signed: levels.length === 2 ? levels[1].mean - levels[0].mean : NaN,
      thin: levels.some((l) => l.n < 2),
    });
  }

  // --- Escala comun ---------------------------------------------------------
  // Todos los paneles comparten eje: si cada uno se escalara solo, un efecto
  // diminuto parecería tan grande como el mayor.
  const allMeans = effects.flatMap((e) => e.levels.map((l) => l.mean));
  const lo = Math.min(...allMeans, params.showGrandMean ? grandMean : Infinity);
  const hi = Math.max(...allMeans, params.showGrandMean ? grandMean : -Infinity);
  const span = hi - lo;
  const pad = span > 0 ? span * 0.12 : Math.abs(hi) * 0.12 || 1;

  return {
    ok: true,
    response: resp,
    effects,
    grandMean,
    yRange: [lo - pad, hi + pad],
    sharedScale: params.sharedScale,
    showGrandMean: params.showGrandMean,
    n: nUsed,
    nMissing,
    ranked: [...effects].sort((a, b) => b.range - a.range),
  };
}
