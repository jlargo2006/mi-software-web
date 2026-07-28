// app/app/six-sigma/studies/pss/_shared/rangeParser.ts

export interface ParsedRange {
  values: number[];
  error?: string;
}

/**
 * Acepta:
 *   "20"          -> [20]
 *   "10 20 30"    -> [10,20,30]   (espacios, comas o punto y coma)
 *   "10:40/5"     -> [10,15,...,40]
 *   "10:40"       -> paso 1
 * Coma decimal admitida en valores sueltos ("0,5") salvo que actue de separador.
 */
export function parseRange(raw: string): ParsedRange {
  const s = (raw ?? "").trim();
  if (s === "") return { values: [] };

  const out: number[] = [];
  const tokens = s.split(/[\s;]+/).filter((t) => t !== "");

  for (const tok0 of tokens) {
    const subTokens = tok0.includes(":")
      ? [tok0]
      : tok0.split(",").filter((t) => t !== "");
    // Caso "0,5" (decimal): dos trozos que juntos forman un decimal valido.
    const rejoined = subTokens.join(",");
    const asDecimal = Number(rejoined.replace(",", "."));
    const useDecimal = subTokens.length === 2 && Number.isFinite(asDecimal);

    const parts = useDecimal ? [rejoined] : subTokens;

    for (const tok of parts) {
      if (tok.includes(":")) {
        const [rangePart, stepPart] = tok.split("/");
        const [aS, bS] = rangePart.split(":");
        const a = Number(aS.replace(",", "."));
        const b = Number(bS.replace(",", "."));
        const step = stepPart === undefined ? 1 : Number(stepPart.replace(",", "."));
        if (!Number.isFinite(a) || !Number.isFinite(b))
          return { values: [], error: `Invalid range "${tok}".` };
        if (!Number.isFinite(step) || step <= 0)
          return { values: [], error: `Invalid step in "${tok}".` };
        if (b < a) return { values: [], error: `Range "${tok}" is decreasing.` };
        const k = Math.floor((b - a) / step + 1e-9);
        for (let i = 0; i <= k; i++) out.push(a + i * step);
      } else {
        const v = Number(tok.replace(",", "."));
        if (!Number.isFinite(v))
          return { values: [], error: `Invalid value "${tok}".` };
        out.push(v);
      }
    }
  }

  const uniq = [...new Set(out.map((v) => Number(v.toFixed(10))))];
  uniq.sort((a, b) => a - b);
  return { values: uniq };
}

/** Numero positivo desde texto, admitiendo coma decimal. */
export function parsePositive(raw: string): number {
  return Number((raw ?? "").trim().replace(",", "."));
}
