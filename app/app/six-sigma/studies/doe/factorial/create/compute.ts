// app/app/six-sigma/studies/doe/factorial/create/compute.ts
import type { ColumnSnapshot } from "../../../types";
import type { Cell } from "../../../../lib/types";
import {
  aliasStructure,
  availableDesigns,
  blockAssignment,
  blockOptions,
  mulberry32,
  shuffle,
  splitBlocks,
  standardMatrix,
} from "../../../../lib/doe";
import {
  MAX_FACTORS,
  MIN_FACTORS,
  type DesignRow,
  type DoeCreateParams,
  type DoeCreateResult,
} from "./types";

const num = (s: string): number => {
  const t = s.trim().replace(",", ".");
  return t === "" ? NaN : Number(t);
};

const fail = (error: string): DoeCreateResult => ({ ok: false, error });

/** Semilla por omision: fija, para que dos Run seguidos den lo mismo. */
const DEFAULT_SEED = 20240101;

export function computeDoeCreate(
  _data: ColumnSnapshot,
  params: DoeCreateParams
): DoeCreateResult {
  const k = num(params.numFactors);
  if (!Number.isInteger(k) || k < MIN_FACTORS || k > MAX_FACTORS) {
    return fail(
      `The number of factors must be a whole number from ${MIN_FACTORS} to ${MAX_FACTORS}.`
    );
  }

  const options = availableDesigns(k);
  if (options.length === 0) {
    return fail(`No design is tabulated for ${k} factors.`);
  }

  const wantRuns = num(params.baseRuns);
  const design =
    options.find((o) => o.runs === wantRuns) ?? options[options.length - 1];

  const centerPerBlock = num(params.centerPoints);
  if (!Number.isInteger(centerPerBlock) || centerPerBlock < 0 || centerPerBlock > 20) {
    return fail("Center points per block must be a whole number from 0 to 20.");
  }
  // Un punto central exige que TODOS los factores admitan el nivel intermedio.
  if (centerPerBlock > 0 && params.factors.some((f) => f.type === "text")) {
    return fail(
      "Center points require every factor to be numeric: a text factor has no midpoint."
    );
  }

  const replicates = num(params.replicates);
  if (!Number.isInteger(replicates) || replicates < 1 || replicates > 10) {
    return fail("Replicates for corner points must be a whole number from 1 to 10.");
  }

  // --- Bloques --------------------------------------------------------------
  // Se valida DESPUES de las replicas, porque el numero de bloques admisible
  // depende de ellas: agrupar replicas enteras permite valores que no son
  // potencia de dos, como 3 bloques con 3 replicas.
  const blocks = num(params.blocks);
  if (!Number.isInteger(blocks) || blocks < 1) {
    return fail("The number of blocks must be a whole number of at least 1.");
  }
  const split = splitBlocks(design.runs, replicates, blocks);
  if (!split) {
    const opts = blockOptions(design.runs, replicates);
    return fail(
      `${blocks} blocks cannot be built from ${design.runs} base runs and ` +
        `${replicates} replicate(s). The possible values are ${opts.join(", ")}.`
    );
  }

  // --- Factores -------------------------------------------------------------
  const factors = params.factors.slice(0, k);
  if (factors.length < k) return fail("Some factors are not configured.");
  for (const f of factors) {
    if (f.name.trim() === "") return fail(`Factor ${f.letter} has no name.`);
    if (f.low.trim() === "" || f.high.trim() === "") {
      return fail(`Factor ${f.letter} needs both a low and a high level.`);
    }
    if (f.type === "numeric") {
      const lo = num(f.low);
      const hi = num(f.high);
      if (!Number.isFinite(lo) || !Number.isFinite(hi)) {
        return fail(`Factor ${f.letter} has a non-numeric level.`);
      }
      if (lo === hi) {
        return fail(`Factor ${f.letter} has identical low and high levels.`);
      }
    } else if (f.low.trim() === f.high.trim()) {
      return fail(`Factor ${f.letter} has identical low and high levels.`);
    }
  }
  const names = factors.map((f) => f.name.trim());
  if (new Set(names).size !== names.length) {
    return fail("Two factors share the same name.");
  }

  // --- Matriz base en orden estandar ---------------------------------------
  const matrix = standardMatrix(k, design.base, design.gens);

  // Solo se confunde algo cuando hay que partir DENTRO de una replica. Con
  // within = 1 cada bloque lleva las esquinas completas y no se pierde nada:
  // el bloque absorbe la variacion entre dias o lotes sin coste en efectos.
  const within = split.within;
  const { blockOf, confounded } =
    within > 1
      ? blockAssignment(matrix, design.base, within)
      : { blockOf: matrix.map(() => 1), confounded: [] as string[] };

  // --- Corridas: replicas y puntos centrales -------------------------------
  // El StdOrder numera de corrido: la segunda replica sigue donde acabo la
  // primera, y los puntos centrales van al final de cada bloque.
  const repsPerGroup = replicates / split.repGroups;
  const built: DesignRow[] = [];
  let std = 0;
  for (let rep = 0; rep < replicates; rep++) {
    // Las replicas se reparten en grupos; dentro de cada grupo, la particion
    // por el signo de una interaccion completa el numero de bloques.
    const group = Math.floor(rep / repsPerGroup);
    for (let i = 0; i < matrix.length; i++) {
      std++;
      built.push({
        stdOrder: std,
        runOrder: 0,
        centerPt: 1,
        block: group * within + blockOf[i],
        coded: matrix[i],
      });
    }
  }
  for (let b = 1; b <= blocks; b++) {
    for (let c = 0; c < centerPerBlock; c++) {
      std++;
      built.push({
        stdOrder: std,
        runOrder: 0,
        centerPt: 0,
        block: b,
        coded: Array.from({ length: k }, () => 0),
      });
    }
  }

  // --- Aleatorizacion -------------------------------------------------------
  // Se aleatoriza DENTRO de cada bloque: mezclar entre bloques destruiria el
  // bloqueo, que existe justamente para agrupar corridas contiguas.
  const seedRaw = num(params.seed);
  const seedUsed = Number.isFinite(seedRaw) ? Math.trunc(seedRaw) : DEFAULT_SEED;

  let ordered: DesignRow[] = [];
  if (params.randomize) {
    const rnd = mulberry32(seedUsed);
    for (let b = 1; b <= blocks; b++) {
      ordered.push(...shuffle(built.filter((r) => r.block === b), rnd));
    }
  } else {
    for (let b = 1; b <= blocks; b++) {
      ordered.push(...built.filter((r) => r.block === b));
    }
  }
  ordered = ordered.map((r, i) => ({ ...r, runOrder: i + 1 }));

  // --- Hoja -----------------------------------------------------------------
  // Los niveles se escriben ya DECODIFICADOS a las unidades del factor, que es
  // lo que hace utilizable la hoja para tomar datos.
  const decode = (fi: number, coded: number): Cell => {
    const f = factors[fi];
    if (f.type === "text") {
      if (coded < 0) return f.low.trim();
      if (coded > 0) return f.high.trim();
      return "";
    }
    const lo = num(f.low);
    const hi = num(f.high);
    if (coded === 0) return (lo + hi) / 2;
    return coded < 0 ? lo : hi;
  };

  const sheetHeaders = [
    "StdOrder",
    "RunOrder",
    "CenterPt",
    "Blocks",
    ...names,
  ];
  const sheetRows: Cell[][] = ordered.map((r) => [
    r.stdOrder,
    r.runOrder,
    r.centerPt,
    r.block,
    ...r.coded.map((c, fi) => decode(fi, c)),
  ]);

/**
 * Orden canonico de terminos: primero por numero de letras, luego alfabetico.
 *
 * Es el criterio de Minitab, y no es cosmetico: el primer termino de cada
 * renglon es el nombre con el que ese efecto aparece luego en la tabla de
 * efectos, asi que ambas salidas tienen que coincidir.
 */
const byOrderThenAlpha = (a: string, b: string): number =>
  a.length - b.length || a.localeCompare(b);

  const rawAlias =
    design.gens.length === 0 ? [] : aliasStructure(k, design.base, design.gens, 2);

  // El generador produce los renglones en orden de Yates, que delata el
  // algoritmo. Se reordena dentro de cada renglon y entre renglones.
  const alias = rawAlias
    .map((row) => {
      if (row.term === "I") {
        return { term: "I", aliases: [...row.aliases].sort(byOrderThenAlpha) };
      }
      const all = [row.term, ...row.aliases].sort(byOrderThenAlpha);
      return { term: all[0], aliases: all.slice(1) };
    })
    // `I` encabeza siempre: es la relacion de definicion, no un efecto.
    .sort((x, y) =>
      x.term === "I" ? -1 : y.term === "I" ? 1 : byOrderThenAlpha(x.term, y.term)
    );


  return {
    ok: true,
    numFactors: k,
    baseRuns: design.runs,
    designLabel: design.label,
    notation: design.notation,
    resolutionLabel: design.resolutionLabel,
    isFull: design.gens.length === 0,
    totalRuns: ordered.length,
    replicates,
    blocks,
    blockRepGroups: split.repGroups,
    blockWithin: within,
    centerPerBlock,
    centerTotal: centerPerBlock * blocks,
    randomized: params.randomize,
    seedUsed,
    factors,
    rows: ordered,
    alias,
    // "I = ABD = ACE = BCDE". Es el renglon de la identidad reescrito: define
    // la fraccion por completo, mientras que "1/4, resolucion III" no dice
    // cual de las fracciones posibles es.
    definingRelation:
      alias.length > 0 && alias[0].term === "I"
        ? ["I", ...alias[0].aliases].join(" = ")
        : "",    
    blockConfounded: confounded,
    sheetHeaders,
    sheetRows,
    sheetName: "Design",
  };
}
