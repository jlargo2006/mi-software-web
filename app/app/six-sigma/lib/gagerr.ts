// app/app/six-sigma/lib/gagerr.ts
import { fPValue } from "./fdist";

export interface AnovaRow {
  source: string;
  df: number;
  ss: number;
  ms: number | null;
  f: number | null;
  p: number | null;
}

export interface VarCompRow {
  source: string;
  indent: number;      // 0,1,2 para la sangría de la tabla
  varComp: number;
  pctContribution: number;
}

export interface EvalRow {
  source: string;
  indent: number;
  sd: number;
  studyVar: number;         // 6 × SD
  pctStudyVar: number;
  pctTolerance: number | null;
}

export interface GageCell {
  part: string;
  operator: string;
  values: number[];
}

export interface GageRRModel {
  ok: boolean;
  error?: string;

  parts: string[];
  operators: string[];
  reps: number;
  cells: GageCell[];

  anovaWith: AnovaRow[];
  anovaWithout: AnovaRow[];
  interactionRemoved: boolean;
  alpha: number;

  varComps: VarCompRow[];
  evaluation: EvalRow[];

  totalVar: number;
  ndc: number;
  tolerance: number | null;

  /** medias por parte×operador para el gráfico de interacción */
  cellMeans: Map<string, number>;
}

const key = (p: string, o: string) => `${p}||${o}`;

export function computeGageRR(
  partVals: unknown[],
  operVals: unknown[],
  measVals: unknown[],
  alpha: number,
  tolerance: number | null
): GageRRModel {
  const base: GageRRModel = {
    ok: false, parts: [], operators: [], reps: 0, cells: [],
    anovaWith: [], anovaWithout: [], interactionRemoved: false, alpha,
    varComps: [], evaluation: [], totalVar: 0, ndc: 0, tolerance,
    cellMeans: new Map(),
  };

  // --- recoger filas válidas ---
  const n = Math.min(partVals.length, operVals.length, measVals.length);
  const parts: string[] = [];
  const operators: string[] = [];
  const cellMap = new Map<string, number[]>();
  let count = 0;

  for (let i = 0; i < n; i++) {
    const p = String(partVals[i] ?? "").trim();
    const o = String(operVals[i] ?? "").trim();
    const raw = measVals[i];
    if (!p || !o) continue;
    if (raw === null || raw === undefined || String(raw).trim() === "") continue;
    const v = Number(String(raw).replace(",", "."));
    if (!Number.isFinite(v)) continue;

    if (!parts.includes(p)) parts.push(p);
    if (!operators.includes(o)) operators.push(o);
    const k = key(p, o);
    if (!cellMap.has(k)) cellMap.set(k, []);
    cellMap.get(k)!.push(v);
    count++;
  }

  if (count === 0) return { ...base, error: "No valid measurement rows found." };
  if (parts.length < 2)
    return { ...base, error: "At least 2 parts are required." };
  if (operators.length < 2)
    return { ...base, error: "At least 2 operators are required." };

  // --- comprobar balanceo ---
  const sizes = new Set<number>();
  for (const p of parts)
    for (const o of operators) {
      const arr = cellMap.get(key(p, o));
      if (!arr || arr.length === 0)
        return {
          ...base,
          error: `Unbalanced design: missing data for part "${p}" / operator "${o}". The ANOVA method requires a balanced design.`,
        };
      sizes.add(arr.length);
    }
  if (sizes.size > 1)
    return {
      ...base,
      error:
        "Unbalanced design: not all part × operator combinations have the same number of replicates. The ANOVA method requires a balanced design.",
    };

  const P = parts.length;
  const O = operators.length;
  const R = [...sizes][0];
  const N = P * O * R;
  if (R < 2)
    return {
      ...base,
      error: "At least 2 replicates per part × operator are required.",
    };

  // --- medias ---
  const cellMeans = new Map<string, number>();
  let grandSum = 0;
  for (const p of parts)
    for (const o of operators) {
      const arr = cellMap.get(key(p, o))!;
      const m = arr.reduce((a, b) => a + b, 0) / arr.length;
      cellMeans.set(key(p, o), m);
      grandSum += arr.reduce((a, b) => a + b, 0);
    }
  const grand = grandSum / N;

  const partMean = new Map<string, number>();
  for (const p of parts) {
    let s = 0;
    for (const o of operators) s += cellMap.get(key(p, o))!.reduce((a, b) => a + b, 0);
    partMean.set(p, s / (O * R));
  }
  const operMean = new Map<string, number>();
  for (const o of operators) {
    let s = 0;
    for (const p of parts) s += cellMap.get(key(p, o))!.reduce((a, b) => a + b, 0);
    operMean.set(o, s / (P * R));
  }

  // --- sumas de cuadrados ---
  let ssPart = 0;
  for (const p of parts) ssPart += (partMean.get(p)! - grand) ** 2;
  ssPart *= O * R;

  let ssOper = 0;
  for (const o of operators) ssOper += (operMean.get(o)! - grand) ** 2;
  ssOper *= P * R;

  let ssInt = 0;
  for (const p of parts)
    for (const o of operators)
      ssInt +=
        (cellMeans.get(key(p, o))! - partMean.get(p)! - operMean.get(o)! + grand) ** 2;
  ssInt *= R;

  let ssErr = 0;
  for (const p of parts)
    for (const o of operators) {
      const m = cellMeans.get(key(p, o))!;
      for (const v of cellMap.get(key(p, o))!) ssErr += (v - m) ** 2;
    }

  const ssTotal = ssPart + ssOper + ssInt + ssErr;

  const dfPart = P - 1;
  const dfOper = O - 1;
  const dfInt = (P - 1) * (O - 1);
  const dfErr = P * O * (R - 1);
  const dfTotal = N - 1;

  const msPart = ssPart / dfPart;
  const msOper = ssOper / dfOper;
  const msInt = ssInt / dfInt;
  const msErr = ssErr / dfErr;

  // --- ANOVA con interacción (F de Part/Operator contra la interacción) ---
  const fPart = msPart / msInt;
  const fOper = msOper / msInt;
  const fInt = msInt / msErr;

  const anovaWith: AnovaRow[] = [
    { source: "Part", df: dfPart, ss: ssPart, ms: msPart, f: fPart, p: fPValue(fPart, dfPart, dfInt) },
    { source: "Operator", df: dfOper, ss: ssOper, ms: msOper, f: fOper, p: fPValue(fOper, dfOper, dfInt) },
    { source: "Part * Operator", df: dfInt, ss: ssInt, ms: msInt, f: fInt, p: fPValue(fInt, dfInt, dfErr) },
    { source: "Repeatability", df: dfErr, ss: ssErr, ms: msErr, f: null, p: null },
    { source: "Total", df: dfTotal, ss: ssTotal, ms: null, f: null, p: null },
  ];

  // --- ANOVA sin interacción (error agrupado) ---
  const dfRep2 = dfInt + dfErr;
  const ssRep2 = ssInt + ssErr;
  const msRep2 = ssRep2 / dfRep2;
  const fPart2 = msPart / msRep2;
  const fOper2 = msOper / msRep2;

  const anovaWithout: AnovaRow[] = [
    { source: "Part", df: dfPart, ss: ssPart, ms: msPart, f: fPart2, p: fPValue(fPart2, dfPart, dfRep2) },
    { source: "Operator", df: dfOper, ss: ssOper, ms: msOper, f: fOper2, p: fPValue(fOper2, dfOper, dfRep2) },
    { source: "Repeatability", df: dfRep2, ss: ssRep2, ms: msRep2, f: null, p: null },
    { source: "Total", df: dfTotal, ss: ssTotal, ms: null, f: null, p: null },
  ];

  const pInt = fPValue(fInt, dfInt, dfErr);
  const interactionRemoved = pInt >= alpha;

  // --- componentes de varianza ---
  const nz = (x: number) => (x > 0 ? x : 0);
  let vRepeat: number, vOperator: number, vInteract: number, vPart: number;

  if (interactionRemoved) {
    vRepeat = msRep2;
    vOperator = nz((msOper - msRep2) / (P * R));
    vInteract = 0;
    vPart = nz((msPart - msRep2) / (O * R));
  } else {
    vRepeat = msErr;
    vInteract = nz((msInt - msErr) / R);
    vOperator = nz((msOper - msInt) / (P * R));
    vPart = nz((msPart - msInt) / (O * R));
  }

  const vReprod = vOperator + vInteract;
  const vGage = vRepeat + vReprod;
  const totalVar = vGage + vPart;

  const pct = (v: number) => (totalVar > 0 ? (v / totalVar) * 100 : 0);

  const varComps: VarCompRow[] = [
    { source: "Total Gage R&R", indent: 0, varComp: vGage, pctContribution: pct(vGage) },
    { source: "Repeatability", indent: 1, varComp: vRepeat, pctContribution: pct(vRepeat) },
    { source: "Reproducibility", indent: 1, varComp: vReprod, pctContribution: pct(vReprod) },
    { source: "Operator", indent: 2, varComp: vOperator, pctContribution: pct(vOperator) },
  ];
  if (!interactionRemoved) {
    varComps.push({
      source: "Operator * Part", indent: 2,
      varComp: vInteract, pctContribution: pct(vInteract),
    });
  }
  varComps.push(
    { source: "Part-To-Part", indent: 0, varComp: vPart, pctContribution: pct(vPart) },
    { source: "Total Variation", indent: 0, varComp: totalVar, pctContribution: 100 }
  );

  // --- evaluación (SD, StudyVar, %SV, %Tol) ---
  const sdTotal = Math.sqrt(totalVar);
  const mk = (source: string, indent: number, v: number): EvalRow => {
    const sd = Math.sqrt(v);
    const sv = 6 * sd;
    return {
      source, indent, sd, studyVar: sv,
      pctStudyVar: sdTotal > 0 ? (sd / sdTotal) * 100 : 0,
      pctTolerance: tolerance && tolerance > 0 ? (sv / tolerance) * 100 : null,
    };
  };

  const evaluation: EvalRow[] = [
    mk("Total Gage R&R", 0, vGage),
    mk("Repeatability", 1, vRepeat),
    mk("Reproducibility", 1, vReprod),
    mk("Operator", 2, vOperator),
  ];
  if (!interactionRemoved) evaluation.push(mk("Operator * Part", 2, vInteract));
  evaluation.push(mk("Part-To-Part", 0, vPart), mk("Total Variation", 0, totalVar));

  const sdGage = Math.sqrt(vGage);
  const sdPart = Math.sqrt(vPart);
  const ndc = sdGage > 0 ? Math.floor(1.41 * (sdPart / sdGage)) : 0;

  const cells: GageCell[] = [];
  for (const p of parts)
    for (const o of operators)
      cells.push({ part: p, operator: o, values: cellMap.get(key(p, o))! });

  return {
    ok: true,
    parts, operators, reps: R, cells,
    anovaWith, anovaWithout, interactionRemoved, alpha,
    varComps, evaluation, totalVar, ndc, tolerance,
    cellMeans,
  };
}
