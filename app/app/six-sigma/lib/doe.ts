// app/app/six-sigma/lib/doe.ts
// Generacion de disenos factoriales de dos niveles.

export const ROMAN: Record<number, string> = {
  3: "III",
  4: "IV",
  5: "V",
  6: "VI",
  7: "VII",
  8: "VIII",
};

const LETTER = (i: number): string => String.fromCharCode(65 + i);

/**
 * Generadores estandar por (factores, factores base). Cada cadena dice de que
 * producto de columnas base se obtiene el factor anadido: con base 3 y
 * generador "AB", el cuarto factor D = A*B.
 *
 * La tabla esta elegida para MAXIMIZAR la resolucion en cada casilla, y
 * reproduce exactamente la ayuda "Display Available Designs".
 */
const GENERATORS: Record<string, string[]> = {
  "3,2": ["AB"],
  "4,3": ["ABC"],
  "5,3": ["AB", "AC"],
  "6,3": ["AB", "AC", "BC"],
  "7,3": ["AB", "AC", "BC", "ABC"],
  "5,4": ["ABCD"],
  "6,4": ["ABC", "ABD"],
  "7,4": ["ABC", "ABD", "ACD"],
  // El ORDEN de las palabras no altera la resolucion, pero decide que corrida
  // lleva que combinacion de niveles. Este es el de Minitab, comprobado contra
  // su estructura de alias: permite pegar alli una respuesta medida aqui.
  "8,4": ["BCD", "ACD", "ABC", "ABD"],
  "9,4": ["ABC", "ABD", "ACD", "BCD", "ABCD"],
  "10,4": ["ABC", "ABD", "ACD", "BCD", "ABCD", "AB"],
  "11,4": ["ABC", "ABD", "ACD", "BCD", "ABCD", "AB", "AC"],
  "12,4": ["ABC", "ABD", "ACD", "BCD", "ABCD", "AB", "AC", "AD"],
  "13,4": ["ABC", "ABD", "ACD", "BCD", "ABCD", "AB", "AC", "AD", "BC"],
  "14,4": ["ABC", "ABD", "ACD", "BCD", "ABCD", "AB", "AC", "AD", "BC", "BD"],
  "15,4": ["ABC", "ABD", "ACD", "BCD", "ABCD", "AB", "AC", "AD", "BC", "BD", "CD"],
  "6,5": ["ABCDE"],
  "7,5": ["ABCD", "ABCE"],
  "8,5": ["ABC", "ABDE", "BCDE"],
  "9,5": ["ABC", "ABD", "ABE", "ACDE"],
  "10,5": ["ABC", "ABD", "ABE", "ACD", "ACE"],
  "11,5": ["ABC", "ABD", "ABE", "ACD", "ACE", "ADE"],
  "12,5": ["ABC", "ABD", "ABE", "ACD", "ACE", "ADE", "BCD"],
  "13,5": ["ABC", "ABD", "ABE", "ACD", "ACE", "ADE", "BCD", "BCE"],
  "14,5": ["ABC", "ABD", "ABE", "ACD", "ACE", "ADE", "BCD", "BCE", "BDE"],
  "15,5": ["ABC", "ABD", "ABE", "ACD", "ACE", "ADE", "BCD", "BCE", "BDE", "CDE"],
  "7,6": ["ABCDEF"],
  "8,6": ["ABCD", "ABEF"],
  // Minima aberracion. El anterior ["ABC","ABD","ABE"] tenia A4 = 6 frente a
  // A4 = 1: seguia siendo resolucion IV, pero enredaba entre si seis pares de
  // interacciones dobles en lugar de uno.
  "9,6": ["ABC", "ABDE", "ACDF"],
  // Igual: A4 = 5 en el anterior, A4 = 2 en este.
  "10,6": ["ABC", "DEF", "ABDE", "ACDF"],
  "11,6": ["ABCD", "ABCE", "ABCF", "ADEF"],
  "12,6": ["ABC", "ABD", "ABE", "ABF", "ACDE", "ACDF"],
  "13,6": ["ABC", "ABD", "ABE", "ABF", "ACD", "ACE", "ACF"],
  "14,6": ["ABC", "ABD", "ABE", "ABF", "ACD", "ACE", "ACF", "ADE"],
  "15,6": ["ABC", "ABD", "ABE", "ABF", "ACD", "ACE", "ACF", "ADE", "ADF"],
  "8,7": ["ABCDEFG"],
  "9,7": ["ABCDE", "ABCFG"],
  "10,7": ["ABCDE", "ABCFG", "BCDEFG"],
  "11,7": ["ABCD", "ABEF", "ACEG", "BDFG"],
  "12,7": ["ABCD", "ABCE", "ABFG", "ACEF"],
  "13,7": ["ABCD", "ABCE", "ABCF", "ABCG", "ADEF"],
  "14,7": ["ABCD", "ABCE", "ABCF", "ABCG", "ADE", "ADF"],
  "15,7": ["ABCD", "ABCE", "ABCF", "ABCG", "ADE", "ADF", "ADG"],
};

export function generatorsFor(k: number, base: number): string[] | null {
  if (k === base) return [];
  return GENERATORS[`${k},${base}`] ?? null;
}

/** Conjunto de letras como mascara de bits, para operar con XOR. */
const maskOf = (word: string): number => {
  let m = 0;
  for (const ch of word) m |= 1 << (ch.charCodeAt(0) - 65);
  return m;
};

const wordOf = (mask: number, k: number): string => {
  let s = "";
  for (let i = 0; i < k; i++) if (mask & (1 << i)) s += LETTER(i);
  return s;
};

const popcount = (m: number): number => {
  let c = 0;
  let x = m;
  while (x) {
    c += x & 1;
    x >>= 1;
  }
  return c;
};

/**
 * Grupo definidor completo: todos los productos de las palabras generadoras.
 * Cada generador "ABC" para el factor D aporta la palabra ABCD.
 */
export function definingWords(k: number, base: number, gens: string[]): number[] {
  const seeds = gens.map((g, i) => maskOf(g) | (1 << (base + i)));
  const out = new Set<number>();
  const total = 1 << seeds.length;
  for (let m = 1; m < total; m++) {
    let w = 0;
    for (let i = 0; i < seeds.length; i++) if (m & (1 << i)) w ^= seeds[i];
    if (w !== 0) out.add(w);
  }
  return [...out];
}

/** Resolucion: longitud de la palabra mas corta del grupo definidor. */
export function resolutionOf(k: number, base: number, gens: string[]): number {
  if (gens.length === 0) return Infinity;
  const words = definingWords(k, base, gens);
  return Math.min(...words.map(popcount));
}

export interface AliasRow {
  /** Termino principal, "A" o "AB". */
  term: string;
  /** Terminos con los que se confunde. */
  aliases: string[];
}

/**
 * Estructura de alias hasta un orden dado. Un termino T se confunde con
 * T xor W para cada palabra W del grupo definidor.
 */
export function aliasStructure(
  k: number,
  base: number,
  gens: string[],
  maxOrder: number
): AliasRow[] {
  if (gens.length === 0) return [];
  const words = definingWords(k, base, gens);
  const rows: AliasRow[] = [];

  // I = producto de las palabras definidoras.
  rows.push({
    term: "I",
    aliases: words
      .slice()
      .sort((a, b) => popcount(a) - popcount(b) || a - b)
      .map((w) => wordOf(w, k)),
  });

  const seen = new Set<number>([0, ...words]);
  const totalTerms = 1 << k;
  for (let t = 1; t < totalTerms; t++) {
    if (popcount(t) > maxOrder) continue;
    if (seen.has(t)) continue;
    const group = [t, ...words.map((w) => t ^ w)];
    group.forEach((g) => seen.add(g));
    const main = group.reduce((a, b) =>
      popcount(b) < popcount(a) || (popcount(b) === popcount(a) && b < a) ? b : a
    );
    const others = group
      .filter((g) => g !== main)
      .sort((a, b) => popcount(a) - popcount(b) || a - b)
      .map((w) => wordOf(w, k));
    rows.push({ term: wordOf(main, k), aliases: others });
  }
  return rows;
}

/**
 * Matriz del diseno en ORDEN ESTANDAR (Yates): la primera columna alterna en
 * cada fila, la segunda cada dos, y asi. Es el orden de la hoja de referencia:
 * std 1 = todo bajo, std 2 = A alto.
 */
export function standardMatrix(k: number, base: number, gens: string[]): number[][] {
  const runs = 1 << base;
  const rows: number[][] = [];
  for (let i = 0; i < runs; i++) {
    const row: number[] = [];
    for (let j = 0; j < base; j++) row.push(i & (1 << j) ? 1 : -1);
    for (const g of gens) {
      let v = 1;
      for (const ch of g) v *= row[ch.charCodeAt(0) - 65];
      row.push(v);
    }
    rows.push(row);
  }
  return rows;
}

/** PRNG mulberry32: reproducible, para que la hoja y la tabla coincidan. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher-Yates con el generador dado. */
export function shuffle<T>(arr: T[], rnd: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export interface DesignOption {
  /** Etiqueta: "Full factorial" o "1/2 fraction". */
  label: string;
  runs: number;
  /** Factores base, log2 de las corridas. */
  base: number;
  /** Resolucion: Infinity para el factorial completo. */
  resolution: number;
  resolutionLabel: string;
  /** Notacion 2^k o 2^(k-p). */
  notation: string;
  gens: string[];
}

const FRACTION_LABEL = (p: number): string => `1/${1 << p} fraction`;

/**
 * Disenos disponibles para k factores, de menos corridas a mas. Se listan solo
 * los que tienen generadores en la tabla, igual que en la ayuda.
 */
export function availableDesigns(k: number): DesignOption[] {
  const out: DesignOption[] = [];
  for (let base = 2; base <= Math.min(k, 7); base++) {
    const gens = generatorsFor(k, base);
    if (gens === null) continue;
    const p = k - base;
    const res = resolutionOf(k, base, gens);
    out.push({
      label: p === 0 ? "Full factorial" : FRACTION_LABEL(p),
      runs: 1 << base,
      base,
      resolution: res,
      resolutionLabel: p === 0 ? "Full" : (ROMAN[res] ?? String(res)),
      notation: p === 0 ? `2^${k}` : `2^(${k}-${p})`,
      gens,
    });
  }
  return out;
}

/**
 * Numeros de bloques admisibles.
 *
 * Dos mecanismos distintos se combinan. Agrupar REPLICAS enteras no confunde
 * nada: cada bloque contiene todas las esquinas, asi que todos los efectos
 * siguen estimables. Partir una replica por el signo de una interaccion si
 * confunde, y exige potencias de dos.
 *
 * De ahi b = g x w, con g divisor del numero de replicas y w potencia de dos
 * como maximo la mitad de las corridas base.
 */
export function blockOptions(baseRuns: number, replicates: number): number[] {
  const reps = Number.isInteger(replicates) && replicates >= 1 ? replicates : 1;
  const out = new Set<number>();
  for (let g = 1; g <= reps; g++) {
    if (reps % g !== 0) continue;
    for (let w = 1; w <= baseRuns / 2; w *= 2) out.add(g * w);
  }
  return [...out].sort((a, b) => a - b);
}

/**
 * Descompone un numero de bloques en sus dos mecanismos.
 *
 * Se maximiza g, el numero de grupos de replicas: cuantas mas replicas se
 * usen para bloquear, menos hay que confundir dentro de cada una. Devuelve
 * null si b no es alcanzable.
 */
export function splitBlocks(
  baseRuns: number,
  replicates: number,
  blocks: number
): { repGroups: number; within: number } | null {
  const reps = Number.isInteger(replicates) && replicates >= 1 ? replicates : 1;
  let best: { repGroups: number; within: number } | null = null;
  for (let g = 1; g <= reps; g++) {
    if (reps % g !== 0) continue;
    if (blocks % g !== 0) continue;
    const w = blocks / g;
    if ((w & (w - 1)) !== 0) continue;
    if (w > baseRuns / 2) continue;
    if (best === null || g > best.repGroups) best = { repGroups: g, within: w };
  }
  return best;
}


/**
 * Genera las columnas de bloque confundiendo con las interacciones de orden
 * MAS ALTO disponibles entre los factores base: son las que menos duele
 * perder. Devuelve el bloque de cada corrida y los terminos confundidos.
 */
export function blockAssignment(
  matrix: number[][],
  base: number,
  nBlocks: number
): { blockOf: number[]; confounded: string[] } {
  if (nBlocks <= 1) {
    return { blockOf: matrix.map(() => 1), confounded: [] };
  }
  const bits = Math.round(Math.log2(nBlocks));

  // Candidatas: interacciones de los factores base, de mayor orden a menor.
  const cands: number[] = [];
  for (let m = 1; m < 1 << base; m++) if (popcount(m) >= 2) cands.push(m);
  cands.sort((a, b) => popcount(b) - popcount(a) || a - b);

  const chosen: number[] = [];
  for (const c of cands) {
    if (chosen.length === bits) break;
    // Se rechaza si es producto de las ya elegidas: no aportaria un bit nuevo.
    const span = new Set<number>([0]);
    for (const ch of chosen) {
      [...span].forEach((s) => span.add(s ^ ch));
    }
    if (!span.has(c)) chosen.push(c);
  }

  const confounded = new Set<string>();
  const span = new Set<number>([0]);
  for (const ch of chosen) [...span].forEach((s) => span.add(s ^ ch));
  span.forEach((s) => {
    if (s !== 0) confounded.add(wordOf(s, base));
  });

  const blockOf = matrix.map((row) => {
    let idx = 0;
    chosen.forEach((c, i) => {
      let v = 1;
      for (let j = 0; j < base; j++) if (c & (1 << j)) v *= row[j];
      if (v < 0) idx |= 1 << i;
    });
    return idx + 1;
  });

  return {
    blockOf,
    confounded: [...confounded].sort((a, b) => a.length - b.length || a.localeCompare(b)),
  };
}
