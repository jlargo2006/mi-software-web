// app/app/six-sigma/SixSigmaAnalyzer.tsx
"use client";

import React, { useRef, useState } from "react";
import { useWorkbook } from "./hooks/useWorkbook";
import { readExcelFile, writeExcelFile } from "./lib/excel";
import { exportProject, importProject } from "./lib/project";
import { ToolId } from "./lib/ribbon";
import { getColumnByName } from "./lib/columns"; // by NAME (generic recompute)
import type { SavedStudy, SaveStudyInput, StudyColumn } from "./lib/studies";
import MenuBar from "./components/MenuBar";
import DataGrid from "./components/DataGrid";
import SheetTabs from "./components/SheetTabs";
import Splitter from "./components/Splitter";
import { getArtifact } from "./studies/_registry";
import type { ColumnSnapshot } from "./studies/types";
import AnalysisRunner from "./components/AnalysisRunner";

type ViewMode = "split" | "grid" | "graphics";

interface SixSigmaAnalyzerProps {
  userEmail?: string;
  onSignOut: () => void;
}

// Timestamp yyyy/mm/dd hh:mm:ss
function timestamp(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())} ${p(
    d.getHours()
  )}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

/** ¿Hay algo escrito en la hoja? Cabeceras y celdas, ignorando espacios. */
function sheetHasData(sheet: { headers: unknown[]; rows: unknown[][] }): boolean {
  if (sheet.headers.some((h) => String(h ?? "").trim() !== "")) return true;
  return sheet.rows.some((r) => r.some((v) => String(v ?? "").trim() !== ""));
}

export default function SixSigmaAnalyzer({
  userEmail,
  onSignOut,
}: SixSigmaAnalyzerProps) {
  const wb = useWorkbook();
  const EMPTY_SHEET = { headers: [], rows: [] }; // fallback (Option A)
  const [view, setView] = useState<ViewMode>("split");
  const [topPercent, setTopPercent] = useState(80);
  const [activeTool, setActiveTool] = useState<ToolId>(null);
  // Params genéricos para estudios del REGISTRY.
  const [artifactParams, setArtifactParams] = useState<Record<string, unknown>>({});
  const [studies, setStudies] = useState<SavedStudy[]>([]);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [selRows, setSelRows] = useState<Set<number>>(new Set());
  const [selCols, setSelCols] = useState<Set<number>>(new Set());
  const [warning, setWarning] = useState<string | null>(null);
  const splitRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const projectInputRef = useRef<HTMLInputElement>(null);

  // --- Project: export / import everything (declared first: used by handleImport/handleNew) ---
  const handleExportProject = () => {
    exportProject(wb.data, wb.order, studies);
  };
  
  // Nada que perder: libro recien abierto y sin estudios. En ese caso no se
  // pregunta nada, porque no hay trabajo que exportar.
  const nothingToLose =
    studies.length === 0 &&
    !Object.values(wb.data).some((s) => sheetHasData(s));

  /**
   * Ofrece exportar antes de una accion destructiva.
   *
   * No puede abortar la accion: con dos botones, Cancel significa "descartar",
   * no "no hagas nada". Si en el futuro quieres una tercera salida, hace falta
   * un modal propio en lugar de window.confirm.
   */
  const offerExportFirst = (message: string): void => {
    if (nothingToLose) return;
    const exportFirst = window.confirm(
      `${message}\n\nDo you want to export your current project first?` +
        `\n\nOK = export first, Cancel = discard.`
    );
    if (exportFirst) handleExportProject();
  };


  const handleImportProject = async (file: File) => {
    offerExportFirst("Opening a project will discard your current work.");
    try {
      const project = await importProject(file);
      wb.loadWorkbook(project.workbook.data, project.workbook.order);
      setStudies(project.studies ?? []);
      setActiveTool(null);
      setViewingId(null);
      // Sin aviso de exito: los estudios aparecen en la barra lateral y los
      // datos en la rejilla. Confirmar lo que ya se ve solo estorba.
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleImport = async (file: File) => {
    offerExportFirst(
      "Opening an Excel file will discard your current work (including saved studies)."
    );
    try {
      const { data, order } = await readExcelFile(file);
      wb.loadWorkbook(data, order);
      setStudies([]);
      setActiveTool(null);
      setViewingId(null);
    } catch (err) {
      alert("Could not read file: " + (err as Error).message);
    }
  };

  const handleExport = () => writeExcelFile(wb.data, wb.order);

  const handleNew = () => {
    if (nothingToLose) {
      // Sin datos ni estudios no hay nada que preguntar, pero si el usuario
      // ha creado hojas vacias hay que dejar el libro en su estado inicial.
      wb.resetWorkbook();
      setActiveTool(null);
      setViewingId(null);
      return;
    }
    offerExportFirst("This will clear the current project.");
    wb.resetWorkbook();
    setStudies([]);
    setActiveTool(null);
    setViewingId(null);
  };

  const handleNew = () => {
    …
  };

  /**
   * Renombra la hoja y arrastra la procedencia de los estudios guardados.
   * Devuelve null si fue bien, o el motivo del rechazo para que SheetTabs
   * lo muestre sin cerrar la edicion.
   */
  const handleRenameSheet = (oldName: string, newName: string): string | null => {
    const msg = wb.renameSheet(oldName, newName);
    if (msg) return msg;
    // El snapshot guarda de que hoja salio: se sigue el renombrado para que la
    // procedencia no apunte a una hoja inexistente.
    setStudies((prev) =>
      prev.map((s) =>
        s.snapshot.sheetName === oldName
          ? { ...s, snapshot: { ...s.snapshot, sheetName: newName } }
          : s
      )
    );
    return null;
  };

  const saveStudy = (study: SaveStudyInput) => {
    …
  };
  
  // GENERIC saveStudy: multi-column snapshot
  const saveStudy = (study: SaveStudyInput) => {
    setStudies((prev) => [
      {
        id: crypto.randomUUID(),
        type: study.type,
        name: `${timestamp()} - ${study.name}`, // timestamp first
        params: study.params,
        results: study.results ?? {},
        snapshot: { sheetName: wb.activeSheet, cols: study.cols },
      },
      ...prev,
    ]);
  };

  const showTop = view === "split" || view === "graphics";
  const showBottom = view === "split" || view === "grid";

  const viewBtn = (mode: ViewMode, label: string) => (
    <button
      onClick={() => setView(mode)}
      className={`px-3 py-1 text-xs rounded border ${
        view === mode
          ? "bg-[#00674d] text-white border-[#00674d]"
          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
      }`}
    >
      {label}
    </button>
  );

  // Study being viewed
  const viewingStudy = studies.find((s) => s.id === viewingId) ?? null;

  // ¿La herramienta activa es un estudio genérico del REGISTRY?
  const activeArtifact = activeTool ? getArtifact(activeTool) : undefined;
  const activeAnalysisDef =
    activeArtifact && activeArtifact.kind === "analysis" ? activeArtifact : null;

  // Snapshot guardado (StudyColumn[]) -> ColumnSnapshot (Record por nombre) para el runner.
  const savedArtifactSnapshot: ColumnSnapshot | null =
    viewingStudy && getArtifact(viewingStudy.type)
      ? Object.fromEntries(
          viewingStudy.snapshot.cols.map((c) => [
            c.name,
            { name: c.name, values: c.values },
          ])
        )
      : null;

  // ---------- Insert rows/columns ----------
  const GRID_COLS = 26;

  const lastColumnsHaveData = (count: number): boolean => {
    const sheet = wb.data[wb.activeSheet];
    if (!sheet) return false;
    for (let c = GRID_COLS - count; c < GRID_COLS; c++) {
      if (String(sheet.headers[c] ?? "").trim() !== "") return true;
      for (const row of sheet.rows) {
        const v = row[c] ?? "";
        if (v !== "" && String(v).trim() !== "") return true;
      }
    }
    return false;
  };

  const handleInsertColumns = () => {
    const count = selCols.size;
    const start = Math.min(...selCols);
    if (lastColumnsHaveData(count)) {
      setWarning(
        `Cannot insert ${count} column(s): the last ${count} column(s) ` +
          `contain data that would be lost. Delete that data first and try again.`
      );
      return;
    }
    wb.insertColumnsAt(start, count);
    setSelCols(new Set());
  };

  const handleInsertRows = () => {
    const count = selRows.size;
    const start = Math.min(...selRows);
    wb.insertRowsAt(start, count);
    setSelRows(new Set());
  };

  return (
      <div className="flex flex-col h-full w-full bg-white">
      <MenuBar
        userEmail={userEmail}
        onNew={handleNew}
        onOpen={() => fileInputRef.current?.click()}
        onSave={handleExport}
        onExportProject={handleExportProject}
        onImportProject={() => projectInputRef.current?.click()}
        onSignOut={onSignOut}
        onSelectTool={(tool) => {
          setActiveTool(tool);
          setViewingId(null); // new analysis: leave "viewing" mode
          // Si es un estudio del registry, arranca con sus defaultParams
          const def = tool ? getArtifact(tool) : undefined;
          if (def && def.kind === "analysis") {
            setArtifactParams(def.defaultParams as Record<string, unknown>);
          }
          if (view === "grid") setView("split");
        }}
      />

      {/* Hidden file input for "Open Excel" */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleImport(f);
          e.target.value = "";
        }}
      />

      {/* Hidden file input for "Import project" */}
      <input
        ref={projectInputRef}
        type="file"
        accept=".sixsigma,application/json"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleImportProject(f);
          e.target.value = "";
        }}
      />

      {/* Body: sidebar + central area */}
      <div className="flex flex-1 min-h-0">
        {/* Saved studies sidebar */}
        <aside className="w-52 bg-gray-50 border-r border-gray-300 flex flex-col shrink-0">
          <div className="px-3 py-2 font-semibold text-sm text-gray-700 border-b border-gray-300">
            Saved Studies
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {studies.length === 0 && (
              <div className="text-sm text-gray-400">No saved studies yet.</div>
            )}
            {studies.map((s) => (
              <div
                key={s.id}
                className="group relative flex items-center rounded hover:bg-emerald-50 border border-transparent hover:border-[#00674d]"
              >
                <button
                  onClick={() => {
                    setActiveTool(s.type as ToolId);
                    setArtifactParams(s.params);
                    setViewingId(s.id);
                    if (view === "grid") setView("split");
                  }}
                  className="flex-1 text-left text-sm px-2 py-1.5 pr-6 text-gray-700"
                >
                  {s.name}
                </button>
                <button
                  onClick={() => {
                    setStudies((prev) => prev.filter((x) => x.id !== s.id));
                    if (viewingId === s.id) {
                      setViewingId(null);
                      setActiveTool(null);
                    }
                  }}
                  className="absolute right-1 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600"
                  title="Delete study"
                >
                  {"\u2715"}
                </button>
              </div>
            ))}
          </div>
        </aside>

        {/* Central area: two frames + splitter */}
        <div className="flex-1 flex flex-col min-w-0">
          <div ref={splitRef} className="flex-1 flex flex-col min-h-0">
            {showTop && (
              <div
                className="overflow-auto bg-white border-b border-gray-200"
                style={{ height: view === "split" ? `${topPercent}%` : "100%" }}
              >
                {activeAnalysisDef && (
                  /* Motor genérico: cualquier estudio del REGISTRY */
                  <AnalysisRunner
                    key={`${activeTool}-${viewingId ?? "edit"}`}
                    def={activeAnalysisDef}
                    sheet={wb.data[wb.activeSheet] ?? EMPTY_SHEET}
                    mode={viewingId ? "view" : "edit"}
                    params={artifactParams}
                    onParamsChange={setArtifactParams}
                    savedSnapshot={savedArtifactSnapshot}
                    onSaveStudy={saveStudy}
                    onWriteData={wb.pasteData}
                    onCreateSheet={wb.createSheetWithData}
                  />
                )}
              </div>
            )}


            {view === "split" && (
              <Splitter onChange={setTopPercent} containerRef={splitRef} />
            )}

            {showBottom && (
              <div
                className="overflow-hidden flex flex-col min-h-0"
                style={{
                  height: view === "split" ? `${100 - topPercent}%` : "100%",
                }}
              >
                <div className="flex-1 overflow-auto">
                  <DataGrid
                    sheet={wb.data[wb.activeSheet] ?? EMPTY_SHEET}
                    onCellChange={wb.setCell}
                    onHeaderChange={wb.setHeader}
                    onPaste={wb.pasteData}
                    onAddRow={wb.addRow}
                    selRows={selRows}
                    selCols={selCols}
                    setSelRows={setSelRows}
                    setSelCols={setSelCols}
                  />
                </div>
              </div>
            )}
          </div>

          {showBottom && (
            <SheetTabs
              order={wb.order}
              activeSheet={wb.activeSheet}
              onSelect={wb.setActiveSheet}
              onAddSheet={wb.addSheet}
              onDeleteSheet={wb.deleteSheet}
              onMoveSheet={wb.moveSheet}
              onRenameSheet={handleRenameSheet}
            />
          )}

          <div className="flex justify-end gap-2 bg-gray-100 border-t border-gray-300 px-3 py-1.5 shrink-0">
             {(selRows.size > 0 || selCols.size > 0) && (
              <>
                <span className="mx-1 h-4 w-px bg-gray-300" />
                <span className="text-xs text-gray-500">
                  {selCols.size > 0
                    ? `${selCols.size} col.`
                    : `${selRows.size} row(s)`}
                </span>

                {selCols.size > 0 ? (
                  <button
                    onClick={handleInsertColumns}
                    className="rounded bg-[#00674d] px-2 py-0.5 text-xs text-white hover:bg-[#00513d]"
                  >
                    {"\u2795"} Insert {selCols.size} column{selCols.size > 1 ? "s" : ""}
                  </button>
                ) : (
                  <button
                    onClick={handleInsertRows}
                    className="rounded bg-[#00674d] px-2 py-0.5 text-xs text-white hover:bg-[#00513d]"
                  >
                    {"\u2795"} Insert {selRows.size} row{selRows.size > 1 ? "s" : ""}
                  </button>
                )}

                <button
                  onClick={() => {
                    if (selCols.size > 0) wb.deleteColumnsAt([...selCols]);
                    else wb.deleteRowsAt([...selRows]);
                    setSelRows(new Set());
                    setSelCols(new Set());
                  }}
                  className="rounded bg-red-500 px-2 py-0.5 text-xs text-white hover:bg-red-600"
                >
                  {"\uD83D\uDDD1"} Delete selection
                </button>
                <span className="mx-1 h-4 w-px bg-gray-300" />
              </>
            )}

            {viewBtn("split", "\u229E Split")}
            {viewBtn("grid", "\u25A6 Grid only")}
            {viewBtn("graphics", "\uD83D\uDCCA Charts only")}
          </div>
        </div>
      </div>

      {/* Warning pop-up */}
      {warning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-xl">{"\u26A0\uFE0F"}</span>
              <h3 className="font-semibold text-gray-800">Cannot insert</h3>
            </div>
            <p className="mb-4 text-sm text-gray-600">{warning}</p>
            <div className="flex justify-end">
              <button
                onClick={() => setWarning(null)}
                className="rounded bg-[#00674d] px-4 py-1.5 text-sm text-white hover:bg-[#00513d]"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
