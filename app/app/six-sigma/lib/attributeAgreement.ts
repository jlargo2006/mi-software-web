// app/app/six-sigma/lib/attributeAgreement.ts
import { normalCdf } from "./fdist";
import { binomCI, type CI } from "./binomCI";

export interface KappaRow {
  label: string;          // nivel de respuesta u "Overall"
  kappa: number | null;
  se: number | null;
  z: number | null;
  p: number | null;
}

export interface AgreementRow {
  label: string;          // nombre del tasador o "" para bloques globales
  inspected: number;
  matched: number;
  percent: number;
  ci: CI;
}

export interface KappaBlock {
  label: string;          // tasador (o "" en bloques globales)
  rows: KappaRow[];
}

export interface AttrAgreementModel {
  ok: boolean;
  error?: string;

  appraisers: string[];
  samples: string[];
  levels: string[];
  trials: number;
  hasStandard: boolean;
  singleTrial: boolean;
  conf: number;

  withinAppraiser: AgreementRow[];   // vacío si trials === 1
  withinKappa: KappaBlock[];

  eachVsStandard: AgreementRow[];
  eachVsStandardKappa: KappaBlock[];

  betweenAppraisers: AgreementRow | null;
  betweenKappa: KappaRow[];

  allVsStandard: AgreementRow | null;
  allVsStandardKappa: KappaRow[];

  notes: string[];
}

/** Kappa de Fleiss a partir de una matriz de conteos N×L (filas suman n). */
function fleiss(counts: number[][], L: number): { cat: (number | null)[]; overall: KappaRow } {
  const N = counts.length;
  const n = counts[0].reduce((a, b) => a + b, 0);
  const totals = new Array(L).fill(0);
  for (const row of counts) for (let j = 0; j < L; j++) totals[j] += row[j];
  const p = totals.map((t) => t / (N * n));

  const cat: (number | null)[] = [];
  for (let j = 0; j < L; j++) {
    const den = N * n * (n - 1) * p[j] * (1 - p[j]);
    if (den <= 0) { cat.push(null); continue; }
    let num = 0;
    for (const row of counts) num += row[j] * (n - row[j]);
    cat.push(1 - num / den);
  }

  let sumSq = 0;
  for (const row of counts) {
    let s = 0;
    for (let j = 0; j < L; j++) s += row[j] * row[j];
    sumSq += s - n;
  }
  const Pbar = sumSq / (N * n * (n - 1));
  const Pe = p.reduce((a, v) => a + v * v, 0);
  const q = 1 - Pe;
  const overallK = q > 0 ? (Pbar - Pe) / q : null;

  const sA = p.reduce((a, v) => a + v * (1 - v), 0);
  const sB = p.reduce((a, v) => a + v * (1 - v) * (1 - 2 * v), 0);
  const seOv = q > 0
    ? Math.sqrt(2 * (sA * sA - sB)) / (q * Math.sqrt(N * n * (n - 1)))
    : null;

  return {
    cat,
    overall: mkRow("Overall", overallK, seOv),
  };

  function mkRow(label: string, k: number | null, se: number | null): KappaRow {
    if (k === null || se === null || se <= 0) return { label, kappa: k, se, z: null, p: null };
    const z = k / se;
    return { label, kappa: k, se, z, p: 1 - normalCdf(z) };
  }
}

function kappaRows(
  counts: number[][],
  levels: string[]
): KappaRow[] {
  const { cat, overall } = fleiss(counts, levels.length);
  const seCat = Math.sqrt(
    2 / (counts.length * counts[0].reduce((a, b) => a + b, 0) *
      (counts[0].reduce((a, b) => a + b, 0) - 1))
  );
  const rows: KappaRow[] = levels.map((lv, j) => {
    const k = cat[j];
    if (k === null) return { label: lv, kappa: null, se: null, z: null, p: null };
    const z = k / seCat;
    return { label: lv, kappa: k, se: seCat, z, p: 1 - normalCdf(z) };
  });
  rows.push(overall);
  return rows;
}

export function computeAttributeAgreement(
  appraiserVals: unknown[],
  sampleVals: unknown[],
  ratingVals: unknown[],
  standardVals: unknown[] | null,
  conf = 0.95
): AttrAgreementModel {
  const base: AttrAgreementModel = {
    ok: false, appraisers: [], samples: [], levels: [], trials: 0,
    hasStandard: false, singleTrial: true, conf,
    withinAppraiser: [], withinKappa: [],
    eachVsStandard: [], eachVsStandardKappa: [],
    betweenAppraisers: null, betweenKappa: [],
    allVsStandard: null, allVsStandardKappa: [],
    notes: [],
  };

  const n = Math.min(appraiserVals.length, sampleVals.length, ratingVals.length);
  const appraisers: string[] = [];
  const samples: string[] = [];
  const levels: string[] = [];
  const standardOf = new Map<string, string>();

  // ratings[appraiser][sample] = lista de respuestas (una por trial)
  const R = new Map<string, Map<string, string[]>>();

  for (let i = 0; i < n; i++) {
    const a = String(appraiserVals[i] ?? "").trim();
    const s = String(sampleVals[i] ?? "").trim();
    const r = String(ratingVals[i] ?? "").trim();
    if (!a || !s || !r) continue;
    if (!appraisers.includes(a)) appraisers.push(a);
    if (!samples.includes(s)) samples.push(s);
    if (!levels.includes(r)) levels.push(r);
    if (!R.has(a)) R.set(a, new Map());
    const m = R.get(a)!;
    if (!m.has(s)) m.set(s, []);
    m.get(s)!.push(r);

    if (standardVals) {
      const st = String(standardVals[i] ?? "").trim();
      if (st) {
        if (!levels.includes(st)) levels.push(st);
        standardOf.set(s, st);
      }
    }
  }

  if (appraisers.length === 0) return { ...base, error: "No valid rows found." };
  if (samples.length < 2) return { ...base, error: "At least 2 samples are required." };

  appraisers.sort();
  // orden de niveles: numérico si todos son números, si no alfabético
  const allNum = levels.every((l) => Number.isFinite(Number(l.replace(",", "."))));
  levels.sort(allNum
    ? (x, y) => Number(x.replace(",", ".")) - Number(y.replace(",", "."))
    : (x, y) => x.localeCompare(y));
  const L = levels.length;
  const li = new Map(levels.map((l, i) => [l, i]));

  // --- comprobar balanceo de trials ---
  const sizes = new Set<number>();
  for (const a of appraisers)
    for (const s of samples) {
      const arr = R.get(a)?.get(s);
      if (!arr || arr.length === 0)
        return { ...base, error: `Missing data for appraiser "${a}" / sample "${s}". A balanced design is required.` };
      sizes.add(arr.length);
    }
  if (sizes.size > 1)
    return { ...base, error: "Unbalanced design: not all appraiser × sample combinations have the same number of trials." };

  const trials = [...sizes][0];
  const singleTrial = trials === 1;
  const hasStandard = !!standardVals && standardOf.size === samples.length;
  const notes: string[] = [];

  const emptyRow = () => new Array(L).fill(0);

  // ---------- Within Appraiser (solo si trials > 1) ----------
  const withinAppraiser: AgreementRow[] = [];
  const withinKappa: KappaBlock[] = [];
  if (!singleTrial) {
    for (const a of appraisers) {
      let matched = 0;
      const counts: number[][] = [];
      for (const s of samples) {
        const arr = R.get(a)!.get(s)!;
        if (new Set(arr).size === 1) matched++;
        const row = emptyRow();
        for (const v of arr) row[li.get(v)!]++;
        counts.push(row);
      }
      withinAppraiser.push({
        label: a, inspected: samples.length, matched,
        percent: (matched / samples.length) * 100,
        ci: binomCI(matched, samples.length, conf),
      });
      withinKappa.push({ label: a, rows: kappaRows(counts, levels) });
    }
  } else {
    notes.push(
      "Single trial within each appraiser. No percentage of assessment agreement within appraiser is plotted."
    );
  }

  // ---------- Each Appraiser vs Standard ----------
  const eachVsStandard: AgreementRow[] = [];
  const eachVsStandardKappa: KappaBlock[] = [];
  if (hasStandard) {
    for (const a of appraisers) {
      let matched = 0;
      const counts: number[][] = [];
      for (const s of samples) {
        const arr = R.get(a)!.get(s)!;
        const st = standardOf.get(s)!;
        if (arr.every((v) => v === st)) matched++;
        // cada (sample, trial) es un sujeto con 2 "jueces": tasador y estándar
        for (const v of arr) {
          const row = emptyRow();
          row[li.get(v)!]++;
          row[li.get(st)!]++;
          counts.push(row);
        }
      }
      eachVsStandard.push({
        label: a, inspected: samples.length, matched,
        percent: (matched / samples.length) * 100,
        ci: binomCI(matched, samples.length, conf),
      });
      eachVsStandardKappa.push({ label: a, rows: kappaRows(counts, levels) });
    }
  }

  // ---------- Between Appraisers ----------
  let betweenAppraisers: AgreementRow | null = null;
  let betweenKappa: KappaRow[] = [];
  if (appraisers.length > 1) {
    let matched = 0;
    const counts: number[][] = [];
    for (const s of samples) {
      const all: string[] = [];
      for (const a of appraisers) all.push(...R.get(a)!.get(s)!);
      if (new Set(all).size === 1) matched++;
      const row = emptyRow();
      for (const v of all) row[li.get(v)!]++;
      counts.push(row);
    }
    betweenAppraisers = {
      label: "", inspected: samples.length, matched,
      percent: (matched / samples.length) * 100,
      ci: binomCI(matched, samples.length, conf),
    };
    betweenKappa = kappaRows(counts, levels);
  }

  // ---------- All Appraisers vs Standard ----------
  let allVsStandard: AgreementRow | null = null;
  const allVsStandardKappa: KappaRow[] = [];
  if (hasStandard && appraisers.length > 1) {
    let matched = 0;
    for (const s of samples) {
      const st = standardOf.get(s)!;
      let ok = true;
      for (const a of appraisers)
        if (!R.get(a)!.get(s)!.every((v) => v === st)) { ok = false; break; }
      if (ok) matched++;
    }
    allVsStandard = {
      label: "", inspected: samples.length, matched,
      percent: (matched / samples.length) * 100,
      ci: binomCI(matched, samples.length, conf),
    };

    // MEDIA de los kappas individuales; SE = sqrt(Σ SE²)/k  (método Minitab)
    const k = eachVsStandardKappa.length;
    const nRows = eachVsStandardKappa[0]?.rows.length ?? 0;
    for (let j = 0; j < nRows; j++) {
      const label = eachVsStandardKappa[0].rows[j].label;
      let sumK = 0, sumSE2 = 0, valid = 0;
      for (const blk of eachVsStandardKappa) {
        const row = blk.rows[j];
        if (row.kappa === null || row.se === null) { valid = -1; break; }
        sumK += row.kappa; sumSE2 += row.se * row.se; valid++;
      }
      if (valid <= 0) {
        allVsStandardKappa.push({ label, kappa: null, se: null, z: null, p: null });
        continue;
      }
      const kap = sumK / k;
      const se = Math.sqrt(sumSE2) / k;
      const z = se > 0 ? kap / se : null;
      allVsStandardKappa.push({
        label, kappa: kap, se, z, p: z !== null ? 1 - normalCdf(z) : null,
      });
    }
  }

  if (!hasStandard)
    notes.push("No known standard provided. Only within-appraiser and between-appraisers results are shown.");

  return {
    ok: true,
    appraisers, samples, levels, trials, hasStandard, singleTrial, conf,
    withinAppraiser, withinKappa,
    eachVsStandard, eachVsStandardKappa,
    betweenAppraisers, betweenKappa,
    allVsStandard, allVsStandardKappa,
    notes,
  };
}
