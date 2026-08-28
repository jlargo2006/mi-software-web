// app/app/six-sigma/studies/capability/poisson/compute.ts
import type { ColumnSnapshot } from "../../types";
import { logGamma } from "../../../lib/stats";
import type {
  CapPoissonParams,
  CapPoissonResult,
  CumulativePoint,
  PoissonPoint,
} from "./types";

const cellText = (c: number | string | null | undefined): string =>
  c === null || c === undefined ? "" : String(c).trim();

const cellNum = (c: number | string | null | undefined): number => {
  if (typeof c === "number") return c;
  if (typeof c !== "string") return NaN;
  const t = c.trim().replace(",", ".");
  return t === "" ? NaN : Number(t);
};

const parseNum = (s: string): number | null => {
  const t = s.trim().replace(",", ".");
  if (t === "") return null;
  const v = Number(t);
  return Number.isFinite(v) ? v : null;
};

const fail = (error: string): CapPoissonResult => ({ ok: false, error });

// --- Gamma incompleta regularizada -----------------------------------------
// Base del intervalo exacto: la chi cuadrado acumulada es un caso particular
// de P(a, x), con a = gl/2 y x = valor/2.

/** P(a, x): serie para x pequeno. */
function gammaPSeries(a: number, x: number): number {
  let ap = a;
  let sum = 1 / a;
  let del = sum;
  for (let n = 0; n < 500; n++) {
    ap += 1;
    del *= x / ap;
    sum += del;
    if (Math.abs(del) < Math.abs(sum) * 1e-16) break;
  }
  return sum * Math.exp(-x + a * Math.log(x) - logGamma(a));
}

/** Q(a, x): fraccion continua para x grande. */
function gammaQCF(a: number, x: number): number {
  const FPMIN = 1e-300;
  let b = x + 1 - a;
  let c = 1 / FPMIN;
  let d = 1 / b;
  let h = d;
  for (let i = 1; i <= 500; i++) {
    const an = -i * (i - a);
    b += 2;
    d = an * d + b;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = b + an / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < 1e-16) break;
  }
  return Math.exp(-x + a * Math.log(x) - logGamma(a)) * h;
}

/** Gamma incompleta regularizada inferior, P(a, x). */
function gammaP(a: number, x: number): number {
  if (x <= 0) return 0;
  return x < a + 1 ? gammaPSeries(a, x) : 1 - gammaQCF(a, x);
}

/** Chi cuadrado acumulada con df grados de libertad. */
const chi2CDF = (x: number, df: number): number => gammaP(df / 2, x / 2);

/** Cuantil de la chi cuadrado, por biseccion sobre su acumulada. */
function chi2Inv(prob: number, df: number): number {
  if (!(df > 0)) return NaN;
  if (prob <= 0) return 0;
  let lo = 0;
  let hi = Math.max(20, df * 4);
  while (chi2CDF(hi, df) < prob && hi < 1e12) hi *= 2;
  for (let i = 0; i < 300; i++) {
    const mid = (lo + hi) / 2;
    if (chi2CDF(mid, df) < prob) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/**
 * Intervalo exacto para la media de una Poisson, por su relacion con la chi
 * cuadrado (Garwood, 1936). Con D defectos observados en N unidades:
 *
 *   lambda_L = chi2_{alfa/2}(2D)   / (2N)
 *   lambda_U = chi2_{1-alfa/2}(2D+2) / (2N)
 *
 * Es el que usa Minitab. Ojo a los grados de libertad, que NO son los mismos
 * arriba y abajo: 2D para el inferior y 2D+2 para el superior. Es el analogo
 * de la asimetria que en la binomial daba Clopper-Pearson.
 */
function poissonExactCI(d: number, n: number, alpha: number): [number, number] {
  const lower = d === 0 ? 0 : chi2Inv(alpha / 2, 2 * d) / (2 * n);
  const upper = chi2Inv(1 - alpha / 2, 2 * d + 2) / (2 * n);
  return [lower, upper];
}

// --- Tests para causas especiales ------------------------------------------

function runTests(
  us: number[],
  ucls: number[],
  lcls: number[],
  center: number,
  tests: { test1: boolean; test2: boolean; test3: boolean; test4: boolean }
): number[][] {
  const k = us.length;
  const flags: number[][] = Array.from({ length: k }, () => []);

  if (tests.test1) {
    for (let i = 0; i < k; i++) {
      if (us[i] > ucls[i] || us[i] < lcls[i]) flags[i].push(1);
    }
  }

  if (tests.test2) {
    let run = 0;
    let side = 0;
    for (let i = 0; i < k; i++) {
      const s = us[i] > center ? 1 : us[i] < center ? -1 : 0;
      if (s !== 0 && s === side) run++;
      else {
        side = s;
        run = s === 0 ? 0 : 1;
      }
      if (run >= 9) {
        for (let j = i - 8; j <= i; j++) if (!flags[j].includes(2)) flags[j].push(2);
      }
    }
  }

  if (tests.test3) {
    let run = 1;
    let dir = 0;
    for (let i = 1; i < k; i++) {
      const s = us[i] > us[i - 1] ? 1 : us[i] < us[i - 1] ? -1 : 0;
      if (s !== 0 && s === dir) run++;
      else {
        dir = s;
        run = s === 0 ? 1 : 2;
      }
      if (run >= 6) {
        for (let j = i - 5; j <= i; j++) if (!flags[j].includes(3)) flags[j].push(3);
      }
    }
  }

  if (tests.test4) {
    let run = 1;
    let prev = 0;
    for (let i = 1; i < k; i++) {
      const s = us[i] > us[i - 1] ? 1 : us[i] < us[i - 1] ? -1 : 0;
      if (s !== 0 && prev !== 0 && s === -prev) run++;
      else run = s === 0 ? 1 : 2;
      prev = s;
      if (run >= 14) {
        for (let j = i - 13; j <= i; j++) if (!flags[j].includes(4)) flags[j].push(4);
      }
    }
  }

  return flags;
}

// --- Calculo principal -----------------------------------------------------

export function computeCapPoisson(
  data: ColumnSnapshot,
  params: CapPoissonParams
): CapPoissonResult {
  const dName = params.defects?.trim() ?? "";
  if (dName === "") return fail("Select the column of defects.");
  const dCol = data[dName];
  if (!dCol) return fail(`Column "${dName}" does not exist.`);

  // --- Tamanos de subgrupo -------------------------------------------------
  let sizeAt: (i: number) => number;
  let sizeLen: number;
  if (params.sizeMode === "constant") {
    const cs = parseNum(params.constantSize);
    if (cs === null) return fail("Enter the constant subgroup size.");
    if (!(cs > 0)) return fail("The subgroup size must be greater than zero.");
    sizeAt = () => cs;
    sizeLen = dCol.values.length;
  } else {
    const sName = params.sizeColumn?.trim() ?? "";
    if (sName === "") return fail("Select the column with the subgroup sizes.");
    const sCol = data[sName];
    if (!sCol) return fail(`Column "${sName}" does not exist.`);
    if (sName === dName) {
      return fail("The size column and the defects column must be different.");
    }
    sizeAt = (i) => cellNum(sCol.values[i]);
    sizeLen = Math.max(dCol.values.length, sCol.values.length);
  }

  const conf = parseNum(params.confidence);
  if (conf === null || conf <= 0 || conf >= 100) {
    return fail("The confidence level must be between 0 and 100.");
  }
  const alpha = 1 - conf / 100;

  const target = parseNum(params.target);
  if (target !== null && target < 0) {
    return fail("The target DPU cannot be negative.");
  }

  const histMu = parseNum(params.historicalMu);
  if (histMu !== null && !(histMu > 0)) {
    return fail("Historical \u03BC must be greater than zero.");
  }

  // --- Filas utilizables ---------------------------------------------------
  const ns: number[] = [];
  const ds: number[] = [];
  let nMissing = 0;

  for (let i = 0; i < sizeLen; i++) {
    const dRaw = dCol.values[i];
    const dv = cellNum(dRaw);
    const nv = sizeAt(i);
    const blank =
      cellText(dRaw) === "" && (params.sizeMode === "constant" || !Number.isFinite(nv));
    if (blank) continue;
    if (!Number.isFinite(dv) || !Number.isFinite(nv)) {
      nMissing++;
      continue;
    }
    if (!(nv > 0)) {
      return fail(
        `Subgroup ${ns.length + 1} has size ${nv}. Sizes must be greater than zero.`
      );
    }
    if (dv < 0 || !Number.isInteger(dv)) {
      return fail(
        `Subgroup ${ns.length + 1} has ${dv} defects. Counts must be whole numbers ` +
          `of zero or more.`
      );
    }
    // A diferencia de la binomial, aqui NO se comprueba dv <= nv: una unidad
    // puede acumular varios defectos, y un DPU mayor que 1 es perfectamente
    // valido. Es la diferencia esencial entre los dos modelos.
    ns.push(nv);
    ds.push(dv);
  }

  const k = ns.length;
  if (k < 2) return fail("At least two subgroups are needed.");

  const totalN = ns.reduce((a, b) => a + b, 0);
  const totalD = ds.reduce((a, b) => a + b, 0);
  const uObserved = totalD / totalN;
  const uBar = histMu !== null ? histMu : uObserved;

  if (totalD === 0) {
    return fail(
      "No defects were found in any subgroup. With zero defects there is no rate " +
        "to estimate: the upper bound alone can be quoted, but a DPU cannot."
    );
  }

  // --- U Chart -------------------------------------------------------------
  // Limites por subgrupo. La varianza de una Poisson es su propia media, de
  // modo que sigma = raiz(u / n): no hay factor (1 - u) como en la binomial,
  // y por eso el limite superior no esta acotado por 1.
  const us = ds.map((d, i) => d / ns[i]);
  const ucls = ns.map((n) => uBar + 3 * Math.sqrt(uBar / n));
  const lcls = ns.map((n) => Math.max(0, uBar - 3 * Math.sqrt(uBar / n)));

  const flags = runTests(us, ucls, lcls, uBar, params.tests);

  const points: PoissonPoint[] = ns.map((n, i) => ({
    sample: i + 1,
    n,
    defects: ds[i],
    dpu: us[i],
    ucl: ucls[i],
    lcl: lcls[i],
    violations: flags[i],
  }));

  const cumulative: CumulativePoint[] = [];
  let cn = 0;
  let cd = 0;
  for (let i = 0; i < k; i++) {
    cn += ns[i];
    cd += ds[i];
    cumulative.push({ sample: i + 1, dpu: cd / cn });
  }

  const [lo, hi] = poissonExactCI(totalD, totalN, alpha);

  // Deriva: DPU de cada mitad de la serie, para poder avisar de que el
  // proceso cambio durante el estudio.
  const mid = Math.floor(k / 2);
  const sumIn = (arr: number[], a: number, b: number) =>
    arr.slice(a, b).reduce((x, y) => x + y, 0);
  const dpuFirstHalf = sumIn(ds, 0, mid) / (sumIn(ns, 0, mid) || 1);
  const dpuSecondHalf = sumIn(ds, mid, k) / (sumIn(ns, mid, k) || 1);

  const minN = Math.min(...ns);
  const maxN = Math.max(...ns);

  return {
    ok: true,
    colName: dCol.name ?? dName,
    k,
    totalN,
    totalD,
    uBar,
    uObserved,
    historicalMu: histMu,
    target,
    confidence: conf,
    points,
    cumulative,
    labelUcl: ucls[k - 1],
    labelLcl: lcls[k - 1],
    labelN: ns[k - 1],
    unequal: minN !== maxN,
    meanDpu: uObserved,
    dpuLower: lo,
    dpuUpper: hi,
    minDpu: Math.min(...us),
    maxDpu: Math.max(...us),
    outOfControl: points.filter((p) => p.violations.length > 0).map((p) => p.sample),
    aboveUcl: points.filter((p) => p.dpu > p.ucl).map((p) => p.sample),
    belowLcl: points.filter((p) => p.dpu < p.lcl).map((p) => p.sample),
    dpuFirstHalf,
    dpuSecondHalf,
    nMissing,
    minN,
    maxN,
  };
}
