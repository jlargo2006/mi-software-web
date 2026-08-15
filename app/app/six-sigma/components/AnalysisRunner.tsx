// components/AnalysisRunner.tsx
"use client";
import React, { useMemo, useState } from "react";
import type { SheetData, Cell } from "../lib/types";
import { getColumns } from "../lib/columns";
import StudyControls from "./StudyControls";
import type {
  AnalysisDefinition,
  ColumnSnapshot,
  StudyMode,
} from "../studies/types";
import type { SaveStudyInput } from "../lib/studies";

interface Props<P, R> {
  def: AnalysisDefinition<P, R>;
  sheet: SheetData;
  mode: StudyMode;
  params: P;
  onParamsChange: (p: P) => void;
  savedSnapshot?: ColumnSnapshot | null;
  onSaveStudy: (s: SaveStudyInput) => void;
  /** Escritura en la hoja activa. Ausente: los volcados se ignoran. */
  onWriteData?: (startRow: number, startCol: number, matrix: Cell[][]) => void;
}

export default function AnalysisRunner<P, R>({
  def,
  sheet,
  mode,
  params,
  onParamsChange,
  savedSnapshot = null,
  onSaveStudy,
  onWriteData,
}: Props<P, R>) {
  const columns = useMemo(() => getColumns(sheet), [sheet]);
  const [ran, setRan] = useState(false);
  const [frozen, setFrozen] = useState<ColumnSnapshot | null>(null);
  const [showTheory, setShowTheory] = useState(false);
  const [writeError, setWriteError] = useState<string | null>(null);

  const viewing = mode === "view";

  // Congela las columnas referenciadas por la config actual.
  const freeze = (): ColumnSnapshot => {
    const names = def.referencedColumns(params);
    const snap: ColumnSnapshot = {};
    names.forEach((name) => {
      const col = columns.find((c) => c.name === name);
      const values: Cell[] = col
        ? (sheet.rows?.map((r) => r[col.index]) ?? [])
        : [];
      snap[name] = { name, values };
    });
    return snap;
  };

  const handleRun = () => {
    const snap = freeze();
    setFrozen(snap);
    setRan(true);
    setWriteError(null);

    // Volcado a la hoja, si el estudio lo pide. Se calcula aqui y no en el
    // useMemo: escribir es un efecto, y solo debe ocurrir al pulsar Run.
    if (!def.outputs || !onWriteData) return;
    const res = def.compute(snap, params);
    // Solo se escribe si el calculo ha ido bien.
    if (!res || (res as { ok?: boolean }).ok === false) return;

    for (const out of def.outputs(params, res)) {
      const col = columns.find((c) => c.name === out.column);
      if (!col) {
        setWriteError(`Column "${out.column}" no longer exists.`);
        continue;
      }
      onWriteData(
        0,
        col.index,
        out.values.map((v) => [v])
      );
    }
  };

  // Datos a usar: snapshot guardado (view) > snapshot del Run > nada.
  const data: ColumnSnapshot | null = savedSnapshot ?? frozen;

  const result = useMemo(
    () => (data ? def.compute(data, params) : null),
    [data, params, def]
  );

  const handleSave = () => {
    const snap = frozen ?? freeze();
    onSaveStudy({
      type: def.id,
      name: `${def.label}`,
      params: params as Record<string, unknown>,
      cols: Object.values(snap).map((c) => ({ name: c.name, values: c.values })),
    });
  };

  const ControlsUI = def.Controls;
  const ResultsUI = def.Results;
  const TheoryUI = def.Theory;

  /* ---------- vista teórica ---------- */
  if (showTheory && TheoryUI) {
    return (
      <div className="p-4 h-full overflow-auto">
        <button
          onClick={() => setShowTheory(false)}
          className="mb-4 rounded border border-[#00674d] px-3 py-1.5 text-sm font-medium text-[#00674d] hover:bg-emerald-50"
        >
          {"\u2190"} Back
        </button>
        <TheoryUI />
      </div>
    );
  }

  /* ---------- vista normal ---------- */
  return (
    <div className="p-4 h-full overflow-auto">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-[#00674d]">{def.label}</h2>
        {TheoryUI && (
          <button
            onClick={() => setShowTheory(true)}
            title="Theory and formulas for this study"
            className="shrink-0 rounded border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {"\u{1D453}"}  Theory
          </button>
        )}
      </div>

      {/* Config PROPIA del estudio, oculta en modo view. Ya SIN Run. */}
      <StudyControls mode={mode}>
        <ControlsUI
          params={params}
          onChange={onParamsChange}
          columns={columns}
        />

        {/* Run + Save juntos, gestionados por el runner */}
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={handleRun}
            className="rounded px-4 py-2 text-sm font-medium text-white bg-[#00674d] hover:bg-[#00513d]"
          >
            Run
          </button>
          {(viewing || ran) && (
            <button
              onClick={handleSave}
              className="rounded border border-[#00674d] px-4 py-2 text-sm font-medium text-[#00674d] hover:bg-emerald-50"
            >
              {"\uD83D\uDCBE"} Save study
            </button>
          )}
        </div>
      </StudyControls>

      {writeError && (
        <div className="mb-3 rounded-md border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-800">
          {writeError}
        </div>
      )}

      {/* Resultados: siempre que haya datos (view) o tras Run (edit) */}
      {(viewing || ran) && data && result && (
        <ResultsUI data={data} params={params} result={result} />
      )}
    </div>
  );
}
