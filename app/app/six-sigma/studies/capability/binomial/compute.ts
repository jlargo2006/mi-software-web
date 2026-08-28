// app/app/six-sigma/studies/capability/binomial/compute.ts
import type { ColumnSnapshot } from "../../types";
import { normInv } from "../../../lib/stats";
import { logGamma } from "../../../lib/stats";
import type {
  BinomialPoint,
  CapBinomialParams,
  CapBinomialResult,
  CumulativePoint,
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

const fail = (error: string): CapBinomialResult => ({ ok: false, error });

// --- Beta incompleta regularizada, por fraccion continua (Lentz) ------------
// Necesaria para el intervalo exacto de Clopper-Pearson: la aproximacion
// normal no reproduce los limites de Minitab y ademas se rompe con p pequeno.

function betaCF(a: number, b: number, x: number): number {
  const MAXIT = 300;
  const EPS = 3e-16;
  const FPMIN = 1e-300;
  const qab = a + b;
  const qap = a + 1;
  const qam = a - 1;
  let c = 1;
  let d = 1 - (qab * x) / qap;
  if (Math.abs(d) < FPMIN) d = FPMIN;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= MAXIT; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    h *= d * c;
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < EPS) break;
  }
  return h;
}

/** I_x(a, b). */
function betaInc(a: number, b: number, x: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const bt = Math.exp(
    logGamma(a + b) - logGamma(a) - logGamma(b) + a * Math.log(x) + b * Math.log(1 - x)
  );
  return x < (a + 1) / (a + b + 2)
    ? (bt * betaCF(a, b, x)) / a
    : 1 - (bt * betaCF(b, a, 1 - x)) / b;
}

/** Cuantil de la Beta(a, b), por biseccion sobre betaInc. */
function betaInv(prob: number, a: number, b: number): number {
  if (!(a > 0) || !(b > 0)) return NaN;
  if (prob <= 0) return 0;
  if (prob >= 1) return 1;
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (betaInc(a, b, mid) < prob) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/**
 * Intervalo exacto de Clopper-Pearson (1934) para una proporcion binomial,
 * por la relacion entre la binomial acumulada y la Beta. Es el que usa
 * Minitab, y el que hay que usar: garantiza cobertura al menos 1 menos alfa,
 * mientras que la aproximacion normal la incumple con p alejado de 0,5.
 */
function clopperPearson(d: number, n: number, alpha: number): [number, number] {
  const lower = d === 0 ? 0 : betaInv(alpha / 2, d, n - d + 1);
  const upper = d === n ? 1 : betaInv(1 - alpha / 2, d + 1, n - d);
  return [lower, upper];
}

// --- Tests para causas especiales ------------------------------------------

function runTests(
  ps: number[],
  ucls: number[],
  lcls: number[],
  center: number,
  tests: { test1: boolean; test2: boolean; test3: boolean; test4: boolean }
): number[][] {
  const k = ps.length;
  const flags: number[][] = Array.from({ length: k }, () => []);

  if (tests.test1) {
    for (let i = 0; i < k; i++) {
      if (ps[i] > ucls[i] || ps[i] < lcls[i]) flags[i].push(1);
    }
  }

  // Test 2: nueve puntos seguidos al mismo lado de la linea central. Se marca
  // todo el tramo, no solo el noveno, que es como se lee en la practica.
  if (tests.test2) {
    let run = 0;
    let side = 0;
    for (let i = 0; i < k; i++) {
      const s = ps[i] > center ? 1 : ps[i] < center ? -1 : 0;
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
      const s = ps[i] > ps[i - 1] ? 1 : ps[i] < ps[i - 1] ? -1 : 0;
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
      const s = ps[i] > ps[i - 1] ? 1 : ps[i] < ps[i - 1] ? -1 : 0;
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

export function computeCapBinomial(
  data: ColumnSnapshot,
  params: CapBinomialParams
): CapBinomialResult {
  const dName = params.defectives?.trim() ?? "";
  if (dName === "") return fail("Select the column of defectives.");
  const dCol = data[dName];
  if (!dCol) return fail(`Column "${dName}" does not exist.`);

  // --- Tamanos de subgrupo -------------------------------------------------
  let sizeAt: (i: number) => number;
  let sizeLen: number;
  if (params.sizeMode === "constant") {
    const cs = parseNum(params.constantSize);
    if (cs === null) return fail("Enter the constant subgroup size.");
    if (!Number.isInteger(cs) || cs < 1) {
      return fail("The subgroup size must be a positive whole number.");
    }
    sizeAt = () => cs;
    sizeLen = dCol.values.length;
  } else {
    const sName = params.sizeColumn?.trim() ?? "";
    if (sName === "") return fail("Select the column with the subgroup sizes.");
    const sCol = data[sName];
    if (!sCol) return fail(`Column "${sName}" does not exist.`);
    if (sName === dName) {
      return fail("The size column and the defectives column must be different.");
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
  if (target !== null && (target < 0 || target > 100)) {
    return fail("The target %Defective must be between 0 and 100.");
  }

  const histP = parseNum(params.historicalP);
  if (histP !== null && (histP <= 0 || histP >= 1)) {
    return fail(
      "Historical p is a proportion: it must be between 0 and 1. For 17,56 % " +
        "enter 0,1756."
    );
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
    if (nv <= 0 || !Number.isInteger(nv)) {
      return fail(
        `Subgroup ${ns.length + 1} has size ${nv}. Sizes must be positive whole numbers.`
      );
    }
    if (dv < 0 || !Number.isInteger(dv)) {
      return fail(
        `Subgroup ${ns.length + 1} has ${dv} defectives. Counts must be whole numbers ` +
          `of zero or more.`
      );
    }
    if (dv > nv) {
      return fail(
        `Subgroup ${ns.length + 1} has ${dv} defectives out of ${nv} inspected. ` +
          `A count of defectives cannot exceed the subgroup size.`
      );
    }
    ns.push(nv);
    ds.push(dv);
  }

  const k = ns.length;
  if (k < 2) return fail("At least two subgroups are needed.");

  const totalN = ns.reduce((a, b) => a + b, 0);
  const totalD = ds.reduce((a, b) => a + b, 0);
  const pObserved = totalD / totalN;
  const pBar = histP !== null ? histP : pObserved;

  // --- P Chart -------------------------------------------------------------
  // Limites por subgrupo: con tamanos desiguales cada punto tiene los suyos,
  // y de ahi el perfil escalonado.
  const ps = ds.map((d, i) => d / ns[i]);
  const ucls = ns.map((n) => Math.min(1, pBar + 3 * Math.sqrt((pBar * (1 - pBar)) / n)));
  const lcls = ns.map((n) => Math.max(0, pBar - 3 * Math.sqrt((pBar * (1 - pBar)) / n)));

  const flags = runTests(ps, ucls, lcls, pBar, params.tests);

  const points: BinomialPoint[] = ns.map((n, i) => ({
    sample: i + 1,
    n,
    defectives: ds[i],
    p: ps[i],
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
    cumulative.push({ sample: i + 1, pct: (cd / cn) * 100 });
  }

  // --- Intervalo y Z -------------------------------------------------------
  const [lo, hi] = clopperPearson(totalD, totalN, alpha);

  // Z del proceso: el cuantil normal que deja p a la derecha. Ojo al orden,
  // porque mas defectuosos significa MENOS Z: los limites se cruzan.
  const zOf = (prop: number) =>
    prop <= 0 ? Infinity : prop >= 1 ? -Infinity : normInv(1 - prop);

  const minN = Math.min(...ns);
  const maxN = Math.max(...ns);

  return {
    ok: true,
    colName: dCol.name ?? dName,
    k,
    totalN,
    totalD,
    pBar,
    pObserved,
    historicalP: histP,
    target,
    confidence: conf,
    points,
    cumulative,
    // Minitab rotula los limites del ULTIMO subgrupo, no los del tamano medio.
    labelUcl: ucls[k - 1],
    labelLcl: lcls[k - 1],
    labelN: ns[k - 1],
    unequal: minN !== maxN,
    pctDefective: pObserved * 100,
    pctLower: lo * 100,
    pctUpper: hi * 100,
    ppm: pObserved * 1e6,
    ppmLower: lo * 1e6,
    ppmUpper: hi * 1e6,
    processZ: zOf(pObserved),
    zLower: zOf(hi),
    zUpper: zOf(lo),
    outOfControl: points.filter((p) => p.violations.length > 0).map((p) => p.sample),
    nMissing,
    minN,
    maxN,
  };
}
