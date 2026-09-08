// app/app/six-sigma/lib/formula.ts
"use client";

import type { Cell } from "./types";

/**
 * Evaluador de expresiones para la calculadora de columnas.
 *
 * No se usa eval ni new Function: ademas del riesgo obvio de ejecutar texto
 * del usuario, la CSP de produccion bloquea 'unsafe-eval'. Es un tokenizador
 * mas un descenso recursivo, que ademas permite decidir exactamente que
 * funciones existen y dar errores con posicion.
 *
 * Las referencias son por LETRA de columna (A..Z). El calculo es estatico: se
 * escribe el resultado en la columna destino una vez, y editar despues las
 * celdas de origen no lo recalcula.
 */

// ---------------------------------------------------------------- tokenizador

type TokType = "num" | "col" | "func" | "op" | "lparen" | "rparen" | "comma";

interface Token {
  type: TokType;
  value: string;
  pos: number;
}

export class FormulaError extends Error {
  readonly pos: number;
  constructor(message: string, pos: number) {
    super(message);
    this.name = "FormulaError";
    this.pos = pos;
  }
}

// Operadores de comparacion de dos caracteres primero, para que ">=" no se
// lea como ">" seguido de "=".
const OPS2 = [">=", "<=", "<>"];
const OPS1 = ["+", "-", "*", "/", "^", ">", "<", "="];

const FUNCS = new Set([
  // elemento a elemento
  "SQRT", "LOG", "LN", "EXP", "ABS", "ROUND",
  // agregados de columna
  "MEAN", "STDEV", "MIN", "MAX", "SUM", "COUNT", "MEDIAN",
  // logica
  "IF",
]);

const AGGREGATES = new Set([
  "MEAN", "STDEV", "MIN", "MAX", "SUM", "COUNT", "MEDIAN",
]);

function tokenize(src: string): Token[] {
  const out: Token[] = [];
  let i = 0;

  while (i < src.length) {
    const ch = src[i];

    if (ch === " " || ch === "\t" || ch === "\n" || ch === "\r") {
      i++;
      continue;
    }

    // Numero. Se acepta el punto como separador decimal; la coma esta
    // reservada como separador de argumentos y no puede ser decimal.
    if (/[0-9.]/.test(ch)) {
      const start = i;
      while (i < src.length && /[0-9.]/.test(src[i])) i++;
      const text = src.slice(start, i);
      if ((text.match(/\./g) ?? []).length > 1) {
        throw new FormulaError(`Numero mal formado: "${text}"`, start);
      }
      out.push({ type: "num", value: text, pos: start });
      continue;
    }

    // Identificador: o es una funcion conocida, o una referencia de columna.
    if (/[A-Za-z_]/.test(ch)) {
      const start = i;
      while (i < src.length && /[A-Za-z0-9_]/.test(src[i])) i++;
      const raw = src.slice(start, i);
      const upper = raw.toUpperCase();

      if (upper === "PI") {
        out.push({ type: "num", value: String(Math.PI), pos: start });
        continue;
      }
      if (FUNCS.has(upper)) {
        out.push({ type: "func", value: upper, pos: start });
        continue;
      }
      if (/^[A-Z]$/.test(upper)) {
        out.push({ type: "col", value: upper, pos: start });
        continue;
      }
      throw new FormulaError(
        `No reconozco "${raw}". Las columnas se referencian por su letra (A..Z).`,
        start
      );
    }

    const two = src.slice(i, i + 2);
    if (OPS2.includes(two)) {
      out.push({ type: "op", value: two, pos: i });
      i += 2;
      continue;
    }
    if (OPS1.includes(ch)) {
      out.push({ type: "op", value: ch, pos: i });
      i++;
      continue;
    }
    if (ch === "(") { out.push({ type: "lparen", value: ch, pos: i++ }); continue; }
    if (ch === ")") { out.push({ type: "rparen", value: ch, pos: i++ }); continue; }
    if (ch === ",") { out.push({ type: "comma", value: ch, pos: i++ }); continue; }

    throw new FormulaError(`Caracter no valido: "${ch}"`, i);
  }

  return out;
}

// ----------------------------------------------------------------------- AST

type Node =
  | { kind: "num"; value: number }
  | { kind: "col"; index: number }
  | { kind: "neg"; operand: Node }
  | { kind: "bin"; op: string; left: Node; right: Node }
  | { kind: "call"; name: string; args: Node[] };

/**
 * Descenso recursivo. Precedencia, de menor a mayor:
 *   comparacion  <  suma/resta  <  producto/division  <  potencia  <  unario
 * La potencia asocia por la derecha: 2^3^2 es 2^9, como en Excel.
 */
class Parser {
  private toks: Token[];
  private i = 0;
  private readonly src: string;

  constructor(src: string) {
    this.src = src;
    this.toks = tokenize(src);
  }

  parse(): Node {
    if (this.toks.length === 0) {
      throw new FormulaError("La expresion esta vacia.", 0);
    }
    const node = this.comparison();
    if (this.i < this.toks.length) {
      const t = this.toks[this.i];
      throw new FormulaError(`Sobra "${t.value}".`, t.pos);
    }
    return node;
  }

  private peek(): Token | undefined {
    return this.toks[this.i];
  }

  private eat(type: TokType, value?: string): Token {
    const t = this.toks[this.i];
    if (!t || t.type !== type || (value !== undefined && t.value !== value)) {
      throw new FormulaError(
        `Falta ${value ?? type}${t ? ` antes de "${t.value}"` : " al final"}.`,
        t ? t.pos : this.src.length
      );
    }
    this.i++;
    return t;
  }

  private comparison(): Node {
    let left = this.additive();
    const t = this.peek();
    if (t?.type === "op" && [">", "<", ">=", "<=", "=", "<>"].includes(t.value)) {
      this.i++;
      const right = this.additive();
      left = { kind: "bin", op: t.value, left, right };
    }
    return left;
  }

  private additive(): Node {
    let left = this.multiplicative();
    for (;;) {
      const t = this.peek();
      if (t?.type === "op" && (t.value === "+" || t.value === "-")) {
        this.i++;
        left = { kind: "bin", op: t.value, left, right: this.multiplicative() };
      } else return left;
    }
  }

  private multiplicative(): Node {
    let left = this.power();
    for (;;) {
      const t = this.peek();
      if (t?.type === "op" && (t.value === "*" || t.value === "/")) {
        this.i++;
        left = { kind: "bin", op: t.value, left, right: this.power() };
      } else return left;
    }
  }

  private power(): Node {
    const base = this.unary();
    const t = this.peek();
    if (t?.type === "op" && t.value === "^") {
      this.i++;
      // Recursion sobre power(), no sobre unary(): asocia a la derecha.
      return { kind: "bin", op: "^", left: base, right: this.power() };
    }
    return base;
  }

  private unary(): Node {
    const t = this.peek();
    if (t?.type === "op" && (t.value === "-" || t.value === "+")) {
      this.i++;
      const operand = this.unary();
      return t.value === "-" ? { kind: "neg", operand } : operand;
    }
    return this.primary();
  }

  private primary(): Node {
    const t = this.peek();
    if (!t) throw new FormulaError("Expresion incompleta.", this.src.length);

    if (t.type === "num") {
      this.i++;
      return { kind: "num", value: Number(t.value) };
    }

    if (t.type === "col") {
      this.i++;
      return { kind: "col", index: t.value.charCodeAt(0) - 65 };
    }

    if (t.type === "lparen") {
      this.i++;
      const inner = this.comparison();
      this.eat("rparen");
      return inner;
    }

    if (t.type === "func") {
      this.i++;
      this.eat("lparen");
      const args: Node[] = [];
      if (this.peek()?.type !== "rparen") {
        args.push(this.comparison());
        while (this.peek()?.type === "comma") {
          this.i++;
          args.push(this.comparison());
        }
      }
      this.eat("rparen");
      checkArity(t.value, args.length, t.pos);
      return { kind: "call", name: t.value, args };
    }

    throw new FormulaError(`No esperaba "${t.value}".`, t.pos);
  }
}

function checkArity(name: string, n: number, pos: number): void {
  const expected: Record<string, number[]> = {
    SQRT: [1], LOG: [1], LN: [1], EXP: [1], ABS: [1],
    ROUND: [1, 2],
    MEAN: [1], STDEV: [1], MIN: [1], MAX: [1], SUM: [1], COUNT: [1], MEDIAN: [1],
    IF: [3],
  };
  const ok = expected[name];
  if (ok && !ok.includes(n)) {
    throw new FormulaError(
      `${name} espera ${ok.join(" o ")} argumento(s), no ${n}.`,
      pos
    );
  }
}

// ----------------------------------------------------------------- evaluacion

/** Convierte una celda a numero. Vacio y texto no numerico dan NaN. */
function toNumber(v: Cell | undefined): number {
  if (v === "" || v === undefined || v === null) return NaN;
  if (typeof v === "number") return v;
  const n = Number(String(v).replace(",", "."));
  return Number.isNaN(n) ? NaN : n;
}

/** Valores numericos de una columna, descartando vacios y no numericos. */
function columnValues(rows: Cell[][], col: number): number[] {
  const out: number[] = [];
  for (const row of rows) {
    const n = toNumber(row[col]);
    if (!Number.isNaN(n)) out.push(n);
  }
  return out;
}

function aggregate(name: string, xs: number[]): number {
  if (xs.length === 0) return name === "COUNT" || name === "SUM" ? 0 : NaN;
  switch (name) {
    case "COUNT": return xs.length;
    case "SUM":   return xs.reduce((a, b) => a + b, 0);
    case "MIN":   return Math.min(...xs);
    case "MAX":   return Math.max(...xs);
    case "MEAN":  return xs.reduce((a, b) => a + b, 0) / xs.length;
    case "MEDIAN": {
      const s = [...xs].sort((a, b) => a - b);
      const m = s.length >> 1;
      return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
    }
    case "STDEV": {
      // Desviacion MUESTRAL (n-1): los datos de un estudio son una muestra,
      // no la poblacion. Con un solo dato no esta definida.
      if (xs.length < 2) return NaN;
      const mean = xs.reduce((a, b) => a + b, 0) / xs.length;
      const ss = xs.reduce((a, b) => a + (b - mean) ** 2, 0);
      return Math.sqrt(ss / (xs.length - 1));
    }
    default: return NaN;
  }
}

interface EvalCtx {
  rows: Cell[][];
  row: number;
  /** Los agregados no dependen de la fila: se calculan una vez por columna. */
  cache: Map<string, number>;
}

function evalNode(n: Node, ctx: EvalCtx): number {
  switch (n.kind) {
    case "num":
      return n.value;

    case "col":
      return toNumber(ctx.rows[ctx.row]?.[n.index]);

    case "neg":
      return -evalNode(n.operand, ctx);

    case "bin": {
      const a = evalNode(n.left, ctx);
      const b = evalNode(n.right, ctx);
      switch (n.op) {
        case "+": return a + b;
        case "-": return a - b;
        case "*": return a * b;
        // Dividir por cero da NaN y la celda queda vacia, en vez de Infinity.
        case "/": return b === 0 ? NaN : a / b;
        case "^": return a ** b;
        // Las comparaciones devuelven 1 o 0, para poder combinarlas: (A>1)*(B<5)
        case ">":  return a > b ? 1 : 0;
        case "<":  return a < b ? 1 : 0;
        case ">=": return a >= b ? 1 : 0;
        case "<=": return a <= b ? 1 : 0;
        case "=":  return a === b ? 1 : 0;
        case "<>": return a !== b ? 1 : 0;
        default:   return NaN;
      }
    }

    case "call": {
      if (n.name === "IF") {
        // Cortocircuito: solo se evalua la rama elegida.
        const cond = evalNode(n.args[0], ctx);
        if (Number.isNaN(cond)) return NaN;
        return cond !== 0 ? evalNode(n.args[1], ctx) : evalNode(n.args[2], ctx);
      }

      if (AGGREGATES.has(n.name)) {
        const arg = n.args[0];
        // Un agregado solo tiene sentido sobre una columna entera.
        if (arg.kind !== "col") {
          throw new FormulaError(
            `${n.name} solo acepta una columna, por ejemplo ${n.name}(A).`,
            0
          );
        }
        const key = `${n.name}:${arg.index}`;
        const hit = ctx.cache.get(key);
        if (hit !== undefined) return hit;
        const v = aggregate(n.name, columnValues(ctx.rows, arg.index));
        ctx.cache.set(key, v);
        return v;
      }

      const x = evalNode(n.args[0], ctx);
      switch (n.name) {
        case "ABS":  return Math.abs(x);
        case "EXP":  return Math.exp(x);
        // Dominio invalido da NaN, no un error: la celda se deja vacia.
        case "SQRT": return x < 0 ? NaN : Math.sqrt(x);
        case "LN":   return x <= 0 ? NaN : Math.log(x);
        case "LOG":  return x <= 0 ? NaN : Math.log10(x);
        case "ROUND": {
          const d = n.args.length > 1 ? evalNode(n.args[1], ctx) : 0;
          const f = 10 ** Math.trunc(d);
          return Math.round(x * f) / f;
        }
        default: return NaN;
      }
    }
  }
}

// -------------------------------------------------------------- API publica

export interface CompiledFormula {
  /** Valor para una fila. Devuelve "" cuando el resultado no es un numero. */
  evalRow: (row: number) => Cell;
}

/**
 * Compila la expresion y devuelve un evaluador ligado a estas filas.
 * Lanza FormulaError si la expresion no es valida.
 */
export function compileFormula(src: string, rows: Cell[][]): CompiledFormula {
  const ast = new Parser(src).parse();
  const cache = new Map<string, number>();

  return {
    evalRow(row: number): Cell {
      const v = evalNode(ast, { rows, row, cache });
      // NaN e Infinity se escriben como celda vacia: es lo que espera el resto
      // del grid, que trata "" como ausencia de dato.
      return Number.isFinite(v) ? v : "";
    },
  };
}

/** Valida sin evaluar. Devuelve null si es correcta, o el mensaje de error. */
export function validateFormula(src: string): string | null {
  try {
    new Parser(src).parse();
    return null;
  } catch (e) {
    return e instanceof Error ? e.message : "Expresion no valida";
  }
}

/** Referencia rapida para la ayuda del dialogo. */
export const FORMULA_HELP: { group: string; items: string[] }[] = [
  { group: "Aritmetica", items: ["+", "-", "*", "/", "^", "( )"] },
  { group: "Comparacion", items: [">", "<", ">=", "<=", "=", "<>"] },
  { group: "Por fila", items: ["SQRT(x)", "LOG(x)", "LN(x)", "EXP(x)", "ABS(x)", "ROUND(x, n)"] },
  { group: "De columna", items: ["MEAN(A)", "STDEV(A)", "MIN(A)", "MAX(A)", "SUM(A)", "COUNT(A)", "MEDIAN(A)"] },
  { group: "Logica", items: ["IF(cond, a, b)"] },
  { group: "Constantes", items: ["PI"] },
];
