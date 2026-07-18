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
}

export default function AnalysisRunner<P, R>({
  def,
  sheet,
  mode,
  params,
  onParamsChange,
  savedSnapshot = null,
  onSaveStudy,
}: Props<P, R>) {
  const columns = useMemo(() => getColumns(sheet), [sheet]);
  const [ran, setRan] = useState(false);
  const [frozen, setFrozen] = useState<ColumnSnapshot | null>(null);

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
    setFrozen(freeze());
    setRan(true);
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

  return (
    <div className="p-4 h-full overflow-auto">
      <h2 className="mb-3 text-lg font-semibold text-[#00674d]">{def.label}</h2>

      {/* Config PROPIA del estudio, oculta en modo view */}
      <StudyControls mode={mode}>
        <ControlsUI
          params={params}
          onChange={onParamsChange}
          columns={columns}
          onRun={handleRun}
        />
      </StudyControls>

      {/* Resultados: siempre que haya datos (view) o tras Run (edit) */}
      {(viewing || ran) && data && result && (
        <>
          <ResultsUI data={data} params={params} result={result} />
          <StudyControls mode={mode} boxed={false}>
            <button
              onClick={handleSave}
              className="mt-3 rounded border border-[#00674d] px-4 py-2 text-sm font-medium text-[#00674d] hover:bg-emerald-50"
            >
              {"\uD83D\uDCBE"} Save study
            </button>
          </StudyControls>
        </>
      )}
    </div>
  );
}
