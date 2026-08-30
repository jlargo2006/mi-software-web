// app/app/six-sigma/studies/control/xbars/compute.ts
import type { ColumnSnapshot } from "../../types";
// Mismo motor de tests que el resto de cartas de control. Aqui si valen los
// ocho: la media de un subgrupo es aproximadamente normal por el teorema
// central del limite, y las zonas sigma que leen los tests 5 a 8 significan
// algo. En atributos no era el caso.
import { runTests } from "../imr/tests";
import { c4, c5 } from "./constants";
import type {
  Stage,
  Violation,
  XbarSParams,
  XbarSResult,
} from "./types";

const fail = (error: string): XbarSResult => ({ ok: false, error });

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

const num = (cell: unknown): number | null => {
  const t = String(cell ?? "").trim();
  if (t === "") return null;
  const v = Number(t.replace(",", "."));
  return Number.isFinite(v) ? v : null;
};

interface Group {
  values: number[];
  /** Fila de la hoja donde empieza, para leer la columna de etapas. */
  row: number;
}

export function computeXbarS(
  data: ColumnSnapshot,
  params: XbarSParams
): XbarSResult {
  const notes: string[] = [];
  const groups: Group[] = [];
  let title = "";
  let dropped = 0;

  // ---------------------------------------------------------------------
  //  Lectura, segun la disposicion de los datos
  // ---------------------------------------------------------------------
  if (params.layout === "columns") {
    const names = params.cols.filter(
      (c): c is string => !!c && c.trim() !== ""
    );
    if (names.length < 2)
      return fail(
        "Tick at least two columns: the subgroup size is the number of columns ticked, and a standard deviation needs two observations."
      );

    const cols = names.map((nm) => {
      const c = data[nm];
      return c ? (c.values ?? []) : null;
    });
    const missing = names.find((nm) => !data[nm]);
    if (missing) return fail(`Column "${missing}" does not exist.`);

    const rows = Math.max(...cols.map((c) => (c ? c.length : 0)));
    for (let r = 0; r < rows; r++) {
      const vals: number[] = [];
      let anyCell = false;
      for (const c of cols) {
        const raw = String(c?.[r] ?? "").trim();
        if (raw !== "") anyCell = true;
        const v = num(c?.[r]);
        if (v !== null) vals.push(v);
      }
      if (!anyCell) continue;
      // Una fila incompleta se descarta: mezclar tamanos por celdas vacias
      // cambia los limites sin que se vea la causa.
      if (vals.length < names.length) {
        dropped += 1;
        continue;
      }
      groups.push({ values: vals, row: r });
    }

    title =
      names.length <= 2
        ? names.join("; ")
        : `${names[0]}; \u2026; ${names[names.length - 1]}`;
  } else {
    const nm = params.col?.trim() ?? "";
    if (nm === "") return fail("Select the column of observations.");
    const col = data[nm];
    if (!col) return fail(`Column "${nm}" does not exist.`);
    title = col.name ?? nm;
    const cells = col.values ?? [];

    if (params.useGroupCol) {
      const gn = params.groupCol?.trim() ?? "";
      if (gn === "") return fail("Select the subgroup label column.");
      const gc = data[gn];
      if (!gc) return fail(`Column "${gn}" does not exist.`);
      const labels = (gc.values ?? []).map((x) => String(x ?? "").trim());

      let cur: string | null = null;
      for (let i = 0; i < cells.length; i++) {
        const v = num(cells[i]);
        if (v === null) continue;
        const lab = labels[i] ?? "";
        // Un cambio de etiqueta abre subgrupo. Se agrupa por tramos
        // consecutivos, no por valor: si la hoja no esta ordenada, el orden de
        // la carta debe seguir siendo el de la hoja.
        if (lab !== cur) {
          groups.push({ values: [v], row: i });
          cur = lab;
        } else {
          groups[groups.length - 1].values.push(v);
        }
      }
    } else {
      const sz = parseNum(params.size);
      if (sz === null || !Number.isInteger(sz) || sz < 2)
        return fail(
          "Subgroup size must be a whole number of at least 2: a standard deviation needs two observations."
        );
      let buf: number[] = [];
      let start = 0;
      for (let i = 0; i < cells.length; i++) {
        const v = num(cells[i]);
        if (v === null) continue;
        if (buf.length === 0) start = i;
        buf.push(v);
        if (buf.length === sz) {
          groups.push({ values: buf, row: start });
          buf = [];
        }
      }
      if (buf.length > 0) {
        // Una cola incompleta no se dibuja: su media y su s no son comparables
        // con las de los subgrupos completos.
        dropped += 1;
        notes.push(
          `The last ${buf.length} observation(s) do not complete a subgroup and were left out.`
        );
      }
    }
  }

  if (dropped > 0 && params.layout === "columns")
    notes.push(`${dropped} incomplete row(s) skipped.`);

  const usable = groups.filter((g) => g.values.length >= 2);
  if (usable.length < groups.length)
    notes.push(
      `${groups.length - usable.length} subgroup(s) with a single observation skipped: a standard deviation needs two.`
    );
  if (usable.length < 2)
    return fail("At least two subgroups are needed to draw control limits.");

  const k = usable.length;
  const n = usable.map((g) => g.values.length);
  const mean = usable.map(
    (g) => g.values.reduce((t, v) => t + v, 0) / g.values.length
  );
  const sd = usable.map((g, i) => {
    const m = mean[i];
    const ss = g.values.reduce((t, v) => t + (v - m) * (v - m), 0);
    return Math.sqrt(ss / (g.values.length - 1));
  });

  const sizes = new Set(n);
  const commonN = sizes.size === 1 ? n[0] : null;
  const minN = Math.min(...n);
  const maxN = Math.max(...n);
  if (commonN === null)
    notes.push(
      `Subgroup sizes range from ${minN} to ${maxN}, so the control limits step with each subgroup.`
    );

  // ---------------------------------------------------------------------
  //  Etapas
  // ---------------------------------------------------------------------
  const stageOf: number[] = new Array(k).fill(0);
  const stageLabels: string[] = [];
  const sName = params.stageCol?.trim() ?? "";
  if (sName !== "") {
    const sCol = data[sName];
    if (!sCol) return fail(`Stage column "${sName}" does not exist.`);
    const cells = (sCol.values ?? []).map((x) => String(x ?? "").trim());
    let cur = -1;
    let prev: string | null = null;
    for (let i = 0; i < k; i++) {
      const raw = cells[usable[i].row] ?? "";
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

  const omitted = parseOmit(params.omit, k);
  const omitSet = new Set(omitted);
  const histMean = parseNum(params.histMean);
  const histSigma = parseNum(params.histSigma);
  if (histSigma !== null && !(histSigma > 0))
    return fail("The historical standard deviation must be greater than zero.");

  // ---------------------------------------------------------------------
  //  Estimacion de sigma dentro de subgrupo, por etapa
  // ---------------------------------------------------------------------
  const stages: Stage[] = [];
  for (let s = 0; s < stageLabels.length; s++) {
    const idx: number[] = [];
    for (let i = 0; i < k; i++) if (stageOf[i] === s) idx.push(i);
    const keep = idx.filter((i) => !omitSet.has(i + 1));
    if (keep.length < 1)
      return fail(
        `Stage "${stageLabels[s] || "1"}" has no usable subgroups after omissions.`
      );

    // La gran media pesa por tamano: con subgrupos desiguales, promediar las
    // medias daria el mismo peso a uno de 2 que a uno de 20.
    const totN = keep.reduce((t, i) => t + n[i], 0);
    const xBar =
      histMean !== null
        ? histMean
        : keep.reduce((t, i) => t + mean[i] * n[i], 0) / totN;

    const sBar = keep.reduce((t, i) => t + sd[i], 0) / keep.length;

    let sigma: number;
    if (histSigma !== null) {
      sigma = histSigma;
    } else if (params.method === "pooled") {
      // Desviacion combinada: promedia varianzas con peso n-1, no
      // desviaciones. Es el estimador mas eficiente si todos los subgrupos
      // comparten la misma sigma, y el que mas se distorsiona si no la
      // comparten, porque elevar al cuadrado agranda los subgrupos dispersos.
      const numr = keep.reduce(
        (t, i) => t + (n[i] - 1) * sd[i] * sd[i],
        0
      );
      const den = keep.reduce((t, i) => t + (n[i] - 1), 0);
      const pooled = Math.sqrt(numr / den);
      sigma = params.unbias ? pooled / c4(den + 1) : pooled;
    } else {
      // Metodo Sbar: se corrige el sesgo de cada s con c4 de su propio
      // tamano. Con tamanos iguales equivale a dividir la media por c4(n).
      if (params.unbias) {
        const wsum = keep.reduce((t, i) => t + sd[i] / c4(n[i]), 0);
        sigma = wsum / keep.length;
      } else {
        sigma = sBar;
      }
    }

    if (!(sigma > 0))
      return fail(
        "The estimated within-subgroup standard deviation is zero: every subgroup has identical observations, so there are no limits to draw."
      );

    stages.push({
      label: stageLabels[s],
      from: idx[0],
      to: idx[idx.length - 1],
      xBar,
      sBar,
      sigma,
      kUsed: keep.length,
    });
  }

  // ---------------------------------------------------------------------
  //  Limites
  // ---------------------------------------------------------------------
  const loB = parseNum(params.lowerBound);
  const upB = parseNum(params.upperBound);

  const xCl: number[] = [];
  const xUcl: number[] = [];
  const xLcl: number[] = [];
  const sCl: number[] = [];
  const sUcl: number[] = [];
  const sLcl: number[] = [];
  const xSigma: number[] = [];
  const sSigma: number[] = [];

  for (let i = 0; i < k; i++) {
    const st = stages[stageOf[i]];
    const ni = n[i];

    // Carta de medias: el error tipico de una media es sigma/raiz(n). De ahi
    // que los limites se estrechen al crecer el subgrupo.
    const se = st.sigma / Math.sqrt(ni);
    xSigma.push(se);
    xCl.push(st.xBar);
    let xu = st.xBar + 3 * se;
    let xl = st.xBar - 3 * se;
    if (upB !== null) xu = Math.min(xu, upB);
    if (loB !== null) xl = Math.max(xl, loB);
    xUcl.push(xu);
    xLcl.push(xl);

    // Carta de desviaciones: el centro no es sigma, es c4(n)*sigma, porque s
    // esta sesgada por abajo. Y su propia desviacion tipica es c5(n)*sigma.
    const cc = c4(ni);
    const c5n = c5(ni);
    const center = cc * st.sigma;
    const spread = c5n * st.sigma;
    sSigma.push(spread);
    sCl.push(center);
    sUcl.push(center + 3 * spread);
    // Una desviacion no puede ser negativa: el limite inferior se recorta en
    // cero, y con n pequeno esta siempre ahi.
    sLcl.push(Math.max(0, center - 3 * spread));
  }

  if (sLcl.every((v) => v === 0))
    notes.push(
      "The lower limit of the S chart is zero: with this subgroup size the chart cannot detect a reduction in variability."
    );

  // ---------------------------------------------------------------------
  //  Tests
  // ---------------------------------------------------------------------
  const on =
    params.testMode === "all"
      ? new Array(8).fill(true)
      : params.testMode === "one"
      ? [true, false, false, false, false, false, false, false]
      : params.testsOn.slice(0, 8);

  const kArr = params.testK.map((s, i) => {
    const v = parseNum(s);
    const dflt = [3, 9, 6, 14, 2, 4, 15, 8][i];
    return v === null || !(v > 0) ? dflt : v;
  });

  const xViolations: Violation[] = runTests({
    values: mean,
    center: xCl,
    sigma: xSigma,
    stageOf,
    on,
    k: kArr,
  });

  // En la carta S solo se aplican los cuatro primeros. Los tests 5 a 8 leen
  // zonas simetricas alrededor del centro, y la distribucion de s es
  // asimetrica: sesgada a la derecha, y mucho con n pequeno.
  const sViolations: Violation[] = runTests({
    values: sd,
    center: sCl,
    sigma: sSigma,
    stageOf,
    on: [...on.slice(0, 4), false, false, false, false],
    k: kArr,
    allowed: [1, 2, 3, 4],
  });

  const xFlagged = [...new Set(xViolations.flatMap((v) => v.points))].sort(
    (a, b) => a - b
  );
  const sFlagged = [...new Set(sViolations.flatMap((v) => v.points))].sort(
    (a, b) => a - b
  );

  return {
    ok: true,
    title,
    k,
    commonN,
    minN,
    maxN,
    n,
    mean,
    sd,
    xCl,
    xUcl,
    xLcl,
    sCl,
    sUcl,
    sLcl,
    stages,
    stageOf,
    xViolations,
    sViolations,
    xFlagged,
    sFlagged,
    method: params.method,
    unbias: params.unbias,
    usedHistMean: histMean !== null,
    usedHistSigma: histSigma !== null,
    omitted,
    notes,
  };
}
