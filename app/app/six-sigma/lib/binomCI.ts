// app/app/six-sigma/lib/binomCI.ts
import { betaInv } from "./fdist";

export interface CI {
  lower: number; // %
  upper: number; // %
  oneSided: boolean;
}

/**
 * Intervalo exacto (Clopper-Pearson) para una proporción, en %.
 * Igual que Minitab: si x=0 o x=n usa el intervalo de UNA cola.
 */
export function binomCI(x: number, n: number, conf = 0.95): CI {
  if (n <= 0) return { lower: 0, upper: 0, oneSided: false };
  const alpha = 1 - conf;

  if (x === 0) {
    return { lower: 0, upper: (1 - Math.pow(alpha, 1 / n)) * 100, oneSided: true };
  }
  if (x === n) {
    return { lower: Math.pow(alpha, 1 / n) * 100, upper: 100, oneSided: true };
  }
  return {
    lower: betaInv(alpha / 2, x, n - x + 1) * 100,
    upper: betaInv(1 - alpha / 2, x + 1, n - x) * 100,
    oneSided: false,
  };
}
