// app/app/six-sigma/studies/doe/factorial/create/Controls.tsx
"use client";
import React from "react";
import type { ColumnInfo } from "../../../../lib/columns";
import { availableDesigns, blockOptions, splitBlocks } from "../../../../lib/doe";
import {
  MAX_FACTORS,
  MIN_FACTORS,
  fitFactors,
  type DoeCreateParams,
  type FactorType,
} from "./types";

const label = "block text-sm font-medium text-gray-700 mb-1";
const field =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#00674d] focus:outline-none focus:ring-1 focus:ring-[#00674d]";
const small =
  "w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-[#00674d] focus:outline-none";
const check =
  "h-4 w-4 rounded border-gray-300 text-[#00674d] focus:ring-[#00674d]";

export default function DoeCreateControls({
  params,
  onChange,
}: {
  params: DoeCreateParams;
  onChange: (p: DoeCreateParams) => void;
  columns: ColumnInfo[];
}) {
  const set = <K extends keyof DoeCreateParams>(k: K, v: DoeCreateParams[K]) =>
    onChange({ ...params, [k]: v });

  const k = Number(params.numFactors);
  const valid = Number.isInteger(k) && k >= MIN_FACTORS && k <= MAX_FACTORS;
  const options = valid ? availableDesigns(k) : [];
  const chosen =
    options.find((o) => o.runs === Number(params.baseRuns)) ??
    options[options.length - 1];

  /** Cambiar el numero de factores redefine el diseno y la lista de factores. */
  const changeFactors = (txt: string) => {
    const nk = Number(txt);
    if (!Number.isInteger(nk) || nk < MIN_FACTORS || nk > MAX_FACTORS) {
      onChange({ ...params, numFactors: txt });
      return;
    }
    const opts = availableDesigns(nk);
    const full = opts.find((o) => o.runs === Math.pow(2, nk));
    const pick = full ?? opts[opts.length - 1];
    onChange({
      ...params,
      numFactors: txt,
      baseRuns: pick ? String(pick.runs) : params.baseRuns,
      blocks: "1",
      factors: fitFactors(params.factors, nk),
    });
  };

  const setFactor = (i: number, patch: Partial<DoeCreateParams["factors"][0]>) => {
    const next = params.factors.map((f, j) => (j === i ? { ...f, ...patch } : f));
    set("factors", next);
  };

  // Las opciones de bloqueo dependen de las replicas: agrupar replicas enteras
  // admite valores que no son potencia de dos, como 3 bloques con 3 replicas.
  const reps = Number(params.replicates);
  const repsOk = Number.isInteger(reps) && reps >= 1 && reps <= 10;
  const blocksAvail = chosen && repsOk ? blockOptions(chosen.base, reps) : [1];

  /** Cambiar las replicas invalida la eleccion de bloques. */
  const changeReplicates = (txt: string) => {
    onChange({ ...params, replicates: txt, blocks: "1" });
  };

  /** Cambiar el diseno base cambia cuantas particiones internas caben. */
  const changeBaseRuns = (runs: number) => {
    onChange({ ...params, baseRuns: String(runs), blocks: "1" });
  };

  const chosenSplit =
    chosen && repsOk
      ? splitBlocks(chosen.base, reps, Number(params.blocks))
      : null;

  return (
    <div className="space-y-4">
      <div>
        <label className={label}>Number of factors</label>
        <input
          className={field}
          value={params.numFactors}
          onChange={(e) => changeFactors(e.target.value)}
          inputMode="numeric"
          placeholder="3"
        />
        <p className="mt-1 text-xs text-gray-500">
          From {MIN_FACTORS} to {MAX_FACTORS}. Changing it rebuilds the design.
        </p>
      </div>

      {/* Disenos disponibles */}
      <div className="border-t border-gray-200 pt-4">
        <span className={label}>Design</span>
        {options.length === 0 ? (
          <p className="text-xs text-amber-700">
            Enter a valid number of factors first.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-md border border-gray-300">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-300 bg-gray-50">
                  <th className="px-2 py-1 text-left font-medium text-gray-600">
                    {"\u00a0"}
                  </th>
                  <th className="px-2 py-1 text-left font-medium text-gray-600">
                    Designs
                  </th>
                  <th className="px-2 py-1 text-right font-medium text-gray-600">
                    Runs
                  </th>
                  <th className="px-2 py-1 text-center font-medium text-gray-600">
                    Resolution
                  </th>
                  <th className="px-2 py-1 text-left font-medium text-gray-600">
                    2^(k-p)
                  </th>
                </tr>
              </thead>
              <tbody>
                {options.map((o) => {
                  const sel = chosen?.runs === o.runs;
                  const tone =
                    o.resolutionLabel === "Full"
                      ? "text-emerald-700"
                      : o.resolution >= 5
                        ? "text-emerald-700"
                        : o.resolution === 4
                          ? "text-amber-700"
                          : "text-red-700";
                  return (
                    <tr
                      key={o.runs}
                      onClick={() => changeBaseRuns(o.runs)}
                      className={`cursor-pointer border-b border-gray-200 last:border-0 ${
                        sel ? "bg-emerald-50" : "hover:bg-gray-50"
                      }`}
                    >
                      <td className="px-2 py-1">
                        <input
                          type="radio"
                          className="h-4 w-4 border-gray-300 text-[#00674d]"
                          checked={sel}
                          onChange={() => changeBaseRuns(o.runs)}
                        />
                      </td>
                      <td className="px-2 py-1">{o.label}</td>
                      <td className="px-2 py-1 text-right">{o.runs}</td>
                      <td className={`px-2 py-1 text-center font-semibold ${tone}`}>
                        {o.resolutionLabel}
                      </td>
                      <td className="px-2 py-1 font-mono text-xs">{o.notation}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Green is safe, amber confounds two-factor interactions with each other,
          red confounds them with main effects. The Theory tab has the full table.
        </p>
      </div>

      {/* Cantidades */}
      <div className="border-t border-gray-200 pt-4 grid grid-cols-3 gap-2">
        <div>
          <label className={label}>Center points per block</label>
          <input
            className={small}
            value={params.centerPoints}
            onChange={(e) => set("centerPoints", e.target.value)}
            inputMode="numeric"
          />
        </div>
        <div>
          <label className={label}>Replicates for corner points</label>
          <input
            className={small}
            value={params.replicates}
            onChange={(e) => changeReplicates(e.target.value)}
            inputMode="numeric"
          />
        </div>
        <div>
          <label className={label}>Number of blocks</label>
          <select
            className={small}
            value={params.blocks}
            onChange={(e) => set("blocks", e.target.value)}
          >
            {blocksAvail.map((b) => {
              // Si cada bloque cabe una replica entera, no se confunde nada.
              const sp = chosen ? splitBlocks(chosen.base, reps, b) : null;
              const clean = sp !== null && sp.within === 1;
              return (
                <option key={b} value={String(b)}>
                  {b === 1 ? "none" : b}
                  {b > 1 && (clean ? " \u2014 by replicate" : " \u2014 confounds")}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {chosenSplit && Number(params.blocks) > 1 && (
        <div
          className={`rounded-md border px-3 py-2 text-xs ${
            chosenSplit.within === 1
              ? "border-emerald-300 bg-emerald-50 text-emerald-900"
              : "border-amber-300 bg-amber-50 text-amber-900"
          }`}
        >
          {chosenSplit.within === 1
            ? `Each block holds a complete replicate, so no effect is confounded ` +
              `with the blocks. This is the cheapest blocking there is.`
            : `Each replicate is split into ${chosenSplit.within} parts` +
              (chosenSplit.repGroups > 1
                ? `, across ${chosenSplit.repGroups} groups of replicates`
                : "") +
              `. Splitting inside a replicate costs an interaction, listed in the ` +
              `results.`}
        </div>
      )}

      {/* Factores */}
      <div className="border-t border-gray-200 pt-4">
        <span className={label}>Factors</span>
        <div className="max-h-72 overflow-y-auto rounded-md border border-gray-300">
          <table className="w-full border-collapse text-sm">
            <thead className="sticky top-0 bg-gray-50">
              <tr className="border-b border-gray-300">
                <th className="px-2 py-1 text-left font-medium text-gray-600">
                  Factor
                </th>
                <th className="px-2 py-1 text-left font-medium text-gray-600">
                  Name
                </th>
                <th className="px-2 py-1 text-left font-medium text-gray-600">
                  Type
                </th>
                <th className="px-2 py-1 text-left font-medium text-gray-600">
                  Low
                </th>
                <th className="px-2 py-1 text-left font-medium text-gray-600">
                  High
                </th>
              </tr>
            </thead>
            <tbody>
              {params.factors.map((f, i) => (
                <tr key={f.letter} className="border-b border-gray-200 last:border-0">
                  <td className="px-2 py-1 font-mono">{f.letter}</td>
                  <td className="px-2 py-1">
                    <input
                      className={small}
                      value={f.name}
                      onChange={(e) => setFactor(i, { name: e.target.value })}
                    />
                  </td>
                  <td className="px-2 py-1">
                    <select
                      className={small}
                      value={f.type}
                      onChange={(e) =>
                        setFactor(i, { type: e.target.value as FactorType })
                      }
                    >
                      <option value="numeric">Numeric</option>
                      <option value="text">Text</option>
                    </select>
                  </td>
                  <td className="px-2 py-1">
                    <input
                      className={small}
                      value={f.low}
                      onChange={(e) => setFactor(i, { low: e.target.value })}
                    />
                  </td>
                  <td className="px-2 py-1">
                    <input
                      className={small}
                      value={f.high}
                      onChange={(e) => setFactor(i, { high: e.target.value })}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Opciones */}
      <div className="border-t border-gray-200 pt-4 space-y-2">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            className={check}
            checked={params.randomize}
            onChange={(e) => set("randomize", e.target.checked)}
          />
          Randomize runs
        </label>
        {params.randomize && (
          <div>
            <label className={label}>Base for random data generator</label>
            <input
              className={small}
              value={params.seed}
              onChange={(e) => set("seed", e.target.value)}
              inputMode="numeric"
              placeholder="20240101"
            />
            <p className="mt-1 text-xs text-gray-500">
              Same seed, same run order. Runs are shuffled within each block, never
              across blocks: mixing them would undo the blocking.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
