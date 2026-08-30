// app/app/six-sigma/studies/control/pchart/compute.ts
import type { ColumnSnapshot } from "../../types";
// Mismo motor de tests que las cartas de variables. En cartas de atributos
// solo existen los cuatro primeros: los tests 5 a 8 leen zonas sigma que
// presuponen simetria, y la binomial no la tiene cuando p esta lejos de 0,5.
import { runTests } from "../imr/tests";
import type {
  PChartParams,
  PChartResult,
  Stage,
  Violation,
} from "./types";

const fail = (error: string): PChartResult => ({ ok: false, error });

const parseNum = (s: string): number | null => {
  const t = s.trim().replace(",", ".");
  if (t === "") return null;
  const v = Number(t);
  return Number.isFinite(v) ? v : null;
};

function parseOmit(s: string, k: number): number[] {
  const out = new Set<number>();
  for (const tok of s.split(/[\s,;]+/)) {
    if (tok === "") continue;
    const m = tok.match(/^(\d+):(\d+)$/);
    if (m) {
      const a = Number(m[1]);
      const b = Number(m[2]);
      for (let i = Math.min(a, b); i <= Math.max(a, b); i++)
        if (i >= 1 && i <= k) out.add(i);
    } else {
      const v = Number(tok);
      if (Number.isInteger(v) && v >= 1 && v <= k) out.add(v);
    }
  }
  return [...out].sort((a, b) => a - b);
}

export function computePChart(
  data: ColumnSnapshot,
  params: PChartParams
): PChartResult {
  const notes: string[] = [];

  const nm = params.col?.trim() ?? "";
  if (nm === "") return fail("Select the column of defectives.");
  const col = data[nm];
  if (!col) return fail(`Column "${nm}" does not exist.`);

  const dCells = (col.values ?? []).map((c) => String(c ?? "").trim());

  // --- Tamanos de subgrupo ---------------------------------------------
  let sizeAt: (i: number) => string;
  if (params.sizeMode === "number") {
    const sz = parseNum(params.size);
    if (sz === null || !(sz >= 1) || !Number.isInteger(sz))
      return fail("Subgroup size must be a positive whole number.");
    sizeAt = () => String(sz);
  } else {
    const sn = params.sizeCol?.trim() ?? "";
    if (sn === "") return fail("Select the column containing the subgroup sizes.");
    const sc = data[sn];
    if (!sc) return fail(`Column "${sn}" does not exist.`);
    const cells = (sc.values ?? []).map((c) => String(c ?? "").trim());
    sizeAt = (i) => cells[i] ?? "";
  }

  // --- Lectura pareada --------------------------------------------------
  const d: number[] = [];
  const n: number[] = [];
  const rowOf: number[] = [];
  let skipped = 0;

  for (let i = 0; i < dCells.length; i++) {
    const dt = dCells[i];
    const st = sizeAt(i);
    // Una fila sin defectuosos ni tamano es final de hoja, no un subgrupo.
    if (dt === "" && st === "") continue;
    const dv = Number(dt.replace(",", "."));
    const sv = Number(st.replace(",", "."));
    if (!Number.isFinite(dv) || !Number.isFinite(sv)) {
      skipped += 1;
      continue;
    }
    if (sv <= 0) {
      skipped += 1;
      continue;
    }
    if (dv < 0) return fail(`Subgroup ${i + 1} has a negative count of defectives.`);
    if (dv > sv)
      return fail(
        `Subgroup ${i + 1} has ${dv} defectives out of ${sv} units. A proportion cannot exceed 1 \u2014 check that the size column is the sample size and not the number of conforming units.`
      );
    if (!Number.isInteger(dv) || !Number.isInteger(sv))
      return fail(
        `Subgroup ${i + 1} has a non-integer count or size. A P chart counts whole units; for a continuous rate use a U chart.`
      );
    d.push(dv);
    n.push(sv);
    rowOf.push(i);
  }

  if (skipped > 0)
    notes.push(`${skipped} row(s) skipped for a missing or invalid count or size.`);

  const k = d.length;
  if (k < 2)
    return fail("At least two subgroups are needed to draw control limits.");

  const sizes = new Set(n);
  const commonN = sizes.size === 1 ? n[0] : null;
  const minN = Math.min(...n);
  const maxN = Math.max(...n);
  if (commonN === null)
    notes.push(
      `Subgroup sizes range from ${minN} to ${maxN}, so the control limits step with each subgroup.`
    );

  // --- Etapas -----------------------------------------------------------
  const stageOf: number[] = new Array(k).fill(0);
  const stageLabels: string[] = [];
  const sName = params.stageCol?.trim() ?? "";
  if (sName !== "") {
    const sCol = data[sName];
    if (!sCol) return fail(`Stage column "${sName}" does not exist.`);
    const cells = (sCol.values ?? []).map((c) => String(c ?? "").trim());
    let cur = -1;
    let prev: string | null = null;
    for (let i = 0; i < k; i++) {
      const raw = cells[rowOf[i]] ?? "";
      const v = raw === "" ? "\u2014" : raw;
      if (v !== prev) {
        cur += 1;
        stageLabels.push(v);
        prev = v;
      }
      stageOf[i] = cur;
    }
  } else {
    stageLabels.push("");
  }

  const p = d.map((v, i) => v / n[i]);

  const omitted = parseOmit(params.omit, k);
  const omitSet = new Set(omitted);
  const histP = parseNum(params.histP);
  if (histP !== null && (histP <= 0 || histP >= 1))
    return fail("The historical proportion must lie strictly between 0 and 1.");
  const usedHistorical = histP !== null;

  // --- Estimacion por etapa --------------------------------------------
  const stages: Stage[] = [];
  for (let s = 0; s < stageLabels.length; s++) {
    const idx: number[] = [];
    for (let i = 0; i < k; i++) if (stageOf[i] === s) idx.push(i);
    const keep = idx.filter((i) => !omitSet.has(i + 1));
    if (keep.length < 1)
      return fail(
        `Stage "${stageLabels[s] || "1"}" has no usable subgroups after omissions.`
      );

    const totalN = keep.reduce((t, i) => t + n[i], 0);
    const totalD = keep.reduce((t, i) => t + d[i], 0);
    // La linea central es la proporcion agregada, no la media de las
    // proporciones: cada unidad inspeccionada debe pesar igual, y con tamanos
    // desiguales promediar las proporciones daria el mismo peso a un subgrupo
    // de 20 que a uno de 2000.
    const pBar = histP !== null ? histP : totalD / totalN;

    stages.push({
      label: stageLabels[s],
      from: idx[0],
      to: idx[idx.length - 1],
      pBar,
      kUsed: keep.length,
      totalN,
      totalD,
    });
  }

  const allZero = stages.every((s) => s.pBar <= 0);
  if (allZero)
    return fail(
      "No defectives were found in any subgroup, so there is no proportion to chart."
    );
  const allOne = stages.every((s) => s.pBar >= 1);
  if (allOne)
    return fail("Every unit is defective, so there is no proportion to chart.");

  // --- Limites ----------------------------------------------------------
  const loB = parseNum(params.lowerBound);
  const upB = parseNum(params.upperBound);

  let effN: number[] = n;
  if (params.unequalMode === "assume" && commonN === null) {
    const a = parseNum(params.assumeSize);
    if (a === null || !(a >= 1))
      return fail("Enter the size to assume for all subgroups.");
    effN = new Array(k).fill(a);
    notes.push(
      `Limits computed as if every subgroup had size ${a}; the plotted proportions still use the actual sizes.`
    );
  }

  const cl: number[] = [];
  const ucl: number[] = [];
  const lcl: number[] = [];
  const clippedLow: boolean[] = [];
  const clippedHigh: boolean[] = [];
  const sigma: number[] = [];

  for (let i = 0; i < k; i++) {
    const pb = stages[stageOf[i]].pBar;
    const se = Math.sqrt((pb * (1 - pb)) / effN[i]);
    sigma.push(se);
    cl.push(pb);

    let u = pb + 3 * se;
    let l = pb - 3 * se;
    // Una proporcion vive en [0, 1]: los limites se recortan ahi. Un LCL
    // negativo no significa nada, y con el se pierde la mitad de la carta.
    const cLow = l < 0;
    const cHigh = u > 1;
    if (cLow) l = 0;
    if (cHigh) u = 1;
    if (loB !== null) l = Math.max(l, loB);
    if (upB !== null) u = Math.min(u, upB);

    ucl.push(u);
    lcl.push(l);
    clippedLow.push(cLow);
    clippedHigh.push(cHigh);
  }

  if (clippedLow.some((v) => v))
    notes.push(
      "The lower limit is zero in at least one subgroup: with this proportion and sample size the chart cannot detect an improvement there."
    );

  // --- Tests ------------------------------------------------------------
  const on4 =
    params.testMode === "all"
      ? [true, true, true, true]
      : params.testMode === "one"
      ? [true, false, false, false]
      : params.testsOn.slice(0, 4);
  const on = [...on4, false, false, false, false];

  const kArr4 = params.testK.map((s, i) => {
    const v = parseNum(s);
    const dflt = [3, 9, 6, 14][i];
    return v === null || !(v > 0) ? dflt : v;
  });
  const kArr = [...kArr4, 2, 4, 15, 8];

  const violations: Violation[] = runTests({
    values: p,
    center: cl,
    sigma,
    stageOf,
    on,
    k: kArr,
    allowed: [1, 2, 3, 4],
  });

  const flagged = [...new Set(violations.flatMap((v) => v.points))].sort(
    (a, b) => a - b
  );

  // --- Diagnosticos -----------------------------------------------------
  // Sobredispersion: si los z estandarizados varian mas de lo que la binomial
  // permite, los limites son demasiado estrechos y la carta senala de mas.
  // Se mide con la desviacion de corto plazo de los z, igual que en una I-MR.
  let dispersion = 1;
  if (k >= 3) {
    const z = p.map((v, i) => (sigma[i] > 0 ? (v - cl[i]) / sigma[i] : 0));
    let tot = 0;
    for (let i = 1; i < k; i++) tot += Math.abs(z[i] - z[i - 1]);
    dispersion = tot / (k - 1) / 1.128;
  }

  const minNP = Math.min(
    ...p.map((_, i) => {
      const pb = stages[stageOf[i]].pBar;
      return Math.min(n[i] * pb, n[i] * (1 - pb));
    })
  );

  return {
    ok: true,
    colName: col.name ?? nm,
    k,
    commonN,
    minN,
    maxN,
    p,
    n,
    d,
    cl,
    ucl,
    lcl,
    clippedLow,
    clippedHigh,
    stages,
    stageOf,
    violations,
    flagged,
    dispersion,
    minNP,
    usedHistorical,
    omitted,
    notes,
  };
}
