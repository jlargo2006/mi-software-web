// app/app/six-sigma/studies/doe/factorial/analyze/Controls.tsx
"use client";
import React from "react";
import type { ColumnInfo } from "../../../../lib/columns";
import { buildTerms, parentKeys } from "../../../../lib/factorialmodel";
import {
  RESID_LABEL,
  type DoeAnalyzeParams,
  type ResidualKind,
} from "./types";

const label = "block text-sm font-medium text-gray-700 mb-1";
const small =
  "w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-[#00674d] focus:outline-none";
const check =
  "h-4 w-4 rounded border-gray-300 text-[#00674d] focus:ring-[#00674d]";

const RESERVED = ["stdorder", "runorder", "centerpt", "blocks"];

export default function DoeAnalyzeControls({
  params,
  onChange,
  columns,
}: {
  params: DoeAnalyzeParams;
  onChange: (p: DoeAnalyzeParams) => void;
  columns: ColumnInfo[];
}) {
  const set = <K extends keyof DoeAnalyzeParams>(
    k: K,
    v: DoeAnalyzeParams[K]
  ) => onChange({ ...params, [k]: v });

  const isReserved = (nm: string) => RESERVED.includes(nm.trim().toLowerCase());
  const facs = params.factors.filter((s) => s !== params.response);
  const maxOrder = Number(params.maxOrder);
  const terms =
    facs.length > 0 && Number.isInteger(maxOrder)
      ? buildTerms(facs, maxOrder)
      : [];
  const excluded = new Set(params.excluded);

  const toggleFactor = (name: string) => {
    const cur = params.factors;
    const next = cur.includes(name)
      ? cur.filter((s) => s !== name)
      : [...cur, name];
    // Cambiar los factores invalida la seleccion de terminos.
    onChange({
      ...params,
      factors: next,
      excluded: [],
      // Si el nuevo factor era la columna de bloques, deja de serlo.
      blockColumn: params.blockColumn === name ? "" : params.blockColumn,
    });
  };

  /**
   * Al retirar un termino se retiran tambien los que lo contienen, y al
   * devolverlo se devuelven sus padres: el modelo se mantiene jerarquico
   * sin que el usuario tenga que pensarlo.
   */
  const toggleTerm = (key: string) => {
    const next = new Set(excluded);
    if (next.has(key)) {
      next.delete(key);
      const t = terms.find((x) => x.key === key);
      if (t) parentKeys(t, facs).forEach((p) => next.delete(p));
    } else {
      next.add(key);
      terms.forEach((o) => {
        if (parentKeys(o, facs).includes(key)) next.add(o.key);
      });
    }
    set("excluded", [...next]);
  };

  const selectDesign = () => {
    onChange({
      ...params,
      factors: columns
        .map((c) => c.name)
        .filter((nm) => nm !== params.response && !isReserved(nm)),
      excluded: [],
    });
  };

  /** Detecta la columna de bloques por su nombre, como atajo. */
  const guessBlocks = () => {
    const hit = columns.find((c) => c.name.trim().toLowerCase() === "blocks");
    if (hit) set("blockColumn", hit.name);
  };

  const hasBlocksColumn = columns.some(
    (c) => c.name.trim().toLowerCase() === "blocks"
  );

  return (
    <div className="space-y-4">
      <div>
        <label className={label}>Response</label>
        <select
          className={small}
          value={params.response}
          onChange={(e) => set("response", e.target.value)}
        >
          <option value="">Select a column...</option>
          {columns.map((c) => (
            <option key={c.index} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            Factors
            {facs.length > 0 && (
              <span className="ml-1 font-normal text-gray-500">
                ({facs.length})
              </span>
            )}
          </span>
          <button
            type="button"
            onClick={selectDesign}
            className="rounded border border-gray-300 px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-50"
          >
            Select design factors
          </button>
        </div>
        <div className="max-h-44 overflow-y-auto rounded-md border border-gray-300 p-2 space-y-1">
          {columns
            .filter((c) => c.name !== params.response)
            .map((c) => (
              <label
                key={c.index}
                className="flex items-center gap-2 text-sm text-gray-700"
              >
                <input
                  type="checkbox"
                  className={check}
                  checked={params.factors.includes(c.name)}
                  onChange={() => toggleFactor(c.name)}
                />
                <span className={isReserved(c.name) ? "text-gray-400" : ""}>
                  {c.name}
                </span>
              </label>
            ))}
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Do not tick CenterPt or Blocks. Center points are detected from the
          factor levels themselves, and Blocks goes in its own field below.
        </p>
      </div>

      <div className="border-t border-gray-200 pt-4 grid grid-cols-2 gap-2">
        <div>
          <label className={label}>Include terms up through order</label>
          <select
            className={small}
            value={params.maxOrder}
            onChange={(e) =>
              onChange({ ...params, maxOrder: e.target.value, excluded: [] })
            }
          >
            {[1, 2, 3, 4, 5, 6]
              .filter((o) => facs.length === 0 || o <= facs.length)
              .map((o) => (
                <option key={o} value={String(o)}>
                  {o}
                </option>
              ))}
          </select>
        </div>
        <div>
          <label className={label}>Alpha</label>
          <input
            className={small}
            value={params.alpha}
            onChange={(e) => set("alpha", e.target.value)}
            inputMode="decimal"
          />
        </div>
      </div>

      {/* Puntos centrales */}
      <div className="border-t border-gray-200 pt-4">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            className={check}
            checked={params.includeCenterPoints}
            onChange={(e) => set("includeCenterPoints", e.target.checked)}
          />
          Include center points in the model
        </label>
        <p className="mt-1 pl-6 text-xs text-gray-500">
          Adds the Ct Pt term, which tests curvature. It only has an effect when
          the worksheet actually holds center points. Leave it on: unticking it
          sends their variability into the error.
        </p>
      </div>

      {/* Bloques */}
      <div className="border-t border-gray-200 pt-4">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            Block column (optional)
          </span>
          {hasBlocksColumn && params.blockColumn === "" && (
            <button
              type="button"
              onClick={guessBlocks}
              className="rounded border border-gray-300 px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-50"
            >
              Use Blocks
            </button>
          )}
        </div>
        <select
          className={small}
          value={params.blockColumn}
          onChange={(e) => set("blockColumn", e.target.value)}
        >
          <option value="">None: the experiment was not blocked</option>
          {columns
            .filter(
              (c) => c.name !== params.response && !params.factors.includes(c.name)
            )
            .map((c) => (
              <option key={c.index} value={c.name}>
                {c.name}
              </option>
            ))}
        </select>
        {params.blockColumn !== "" && (
          <label className="mt-2 flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              className={check}
              checked={params.includeBlocks}
              onChange={(e) => set("includeBlocks", e.target.checked)}
            />
            Include blocks in the model
          </label>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Pick the Blocks column if the runs were split across days, batches,
          operators or machines. Leaving it out does not remove that variation: it
          hides it inside the error, where it inflates every p-value and can bury
          a real effect.
        </p>
      </div>

      {/* Terminos del modelo */}
      {terms.length > 0 && (
        <div className="border-t border-gray-200 pt-4">
          <span className={label}>
            Terms in the model
            <span className="ml-1 font-normal text-gray-500">
              ({terms.length - excluded.size} of {terms.length})
            </span>
          </span>
          <div className="max-h-52 overflow-y-auto rounded-md border border-gray-300 p-2 space-y-1">
            {terms.map((t) => (
              <label
                key={t.key}
                className="flex items-center gap-2 text-sm text-gray-700"
              >
                <input
                  type="checkbox"
                  className={check}
                  checked={!excluded.has(t.key)}
                  onChange={() => toggleTerm(t.key)}
                />
                <span className="font-mono text-xs text-gray-400">
                  {t.letters}
                </span>
                {t.key}
              </label>
            ))}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Unchecking a term also unchecks the interactions that contain it, so
            the model stays hierarchical. Block and curvature terms are not listed:
            they are not hypotheses to test but facts about how the runs were made.
          </p>
        </div>
      )}

      {/* Graficos */}
      <div className="border-t border-gray-200 pt-4 space-y-2">
        <span className={label}>Effects plots</span>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            className={check}
            checked={params.showPareto}
            onChange={(e) => set("showPareto", e.target.checked)}
          />
          Pareto
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            className={check}
            checked={params.showNormal}
            onChange={(e) => set("showNormal", e.target.checked)}
          />
          Normal
        </label>
      </div>

      <div className="border-t border-gray-200 pt-4 space-y-2">
        <span className={label}>Factorial plots</span>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            className={check}
            checked={params.showMainEffects}
            onChange={(e) => set("showMainEffects", e.target.checked)}
          />
          Main effects plot
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            className={check}
            checked={params.showInteraction}
            onChange={(e) => set("showInteraction", e.target.checked)}
          />
          Interaction plot
        </label>
        <p className="text-xs text-gray-500">
          Both use fitted means from the model
          {params.blockColumn !== "" && params.includeBlocks
            ? ", averaged over the blocks."
            : "."}
        </p>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            className={check}
            checked={params.showResiduals}
            onChange={(e) => set("showResiduals", e.target.checked)}
          />
          Four-in-one residual plots
        </label>
        {params.showResiduals && (
          <div className="mt-2">
            <label className={label}>Residuals for plots</label>
            <select
              className={small}
              value={params.residualKind}
              onChange={(e) =>
                set("residualKind", e.target.value as ResidualKind)
              }
            >
              {(Object.keys(RESID_LABEL) as ResidualKind[]).map((k) => (
                <option key={k} value={k}>
                  {RESID_LABEL[k]}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
