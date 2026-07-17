"use client";

import React, { useRef, useState } from "react";
import { useWorkbook } from "./hooks/useWorkbook";
import { readExcelFile, writeExcelFile } from "./lib/excel";
import { exportProject, importProject } from "./lib/project";
import { ToolId } from "./lib/ribbon";
import { getColumnByName } from "./lib/columns"; // ðŸ‘ˆ por NOMBRE (recÃ¡lculo genÃ©rico)
import type { SavedStudy, SaveStudyInput, StudyColumn } from "./lib/studies";
import MenuBar from "./components/MenuBar";
import DataGrid from "./components/DataGrid";
import SheetTabs from "./components/SheetTabs";
import Splitter from "./components/Splitter";
import AnalysisPanel, { AnalysisState, EMPTY_ANALYSIS } from "./components/AnalysisPanel";

type ViewMode = "split" | "grid" | "graphics";

interface SixSigmaAnalyzerProps {
  userEmail?: string;
  onSignOut: () => void;
}

// Timestamp aaaa/mm/dd hh:mm:ss
function timestamp(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())} ${p(
    d.getHours()
  )}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

export default function SixSigmaAnalyzer({
  userEmail,
  onSignOut,
}: SixSigmaAnalyzerProps) {
  const wb = useWorkbook();
  const EMPTY_SHEET = { headers: [], rows: [] }; // fallback OpciÃ³n A
  const [view, setView] = useState<ViewMode>("split");
  const [topPercent, setTopPercent] = useState(80);
  const [activeTool, setActiveTool] = useState<ToolId>(null);
  const [analysis, setAnalysis] = useState<AnalysisState>(EMPTY_ANALYSIS);
  const [studies, setStudies] = useState<SavedStudy[]>([]);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [selRows, setSelRows] = useState<Set<number>>(new Set());
  const [selCols, setSelCols] = useState<Set<number>>(new Set());
  const [warning, setWarning] = useState<string | null>(null);
  const splitRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const projectInputRef = useRef<HTMLInputElement>(null);

  const handleImport = async (file: File) => {
    try {
      const { data, order } = await readExcelFile(file);
      wb.loadWorkbook(data, order);
    } catch (err) {
      alert("Could not read file: " + (err as Error).message);
    }
  };

  const handleExport = () => writeExcelFile(wb.data, wb.order);

  const handleNew = () => {
    const ok = window.confirm(
      "Do you want to save your current work before clearing it?\n\nOK = save first, Cancel = discard."
    );
    if (ok) handleExport();
    wb.resetWorkbook();
    setStudies([]);
    setActiveTool(null);
    setAnalysis(EMPTY_ANALYSIS);
    setViewingId(null);
  };

  // --- Proyecto: exportar / importar todo ---
  const handleExportProject = () => {
    exportProject(wb.data, wb.order, studies);
  };

  const handleImportProject = async (file: File) => {
    try {
      const project = await importProject(file);
      wb.loadWorkbook(project.workbook.data, project.workbook.order);
      setStudies((project.studies as SavedStudy[]) ?? []);
      setActiveTool(null);
      setAnalysis(EMPTY_ANALYSIS);
      setViewingId(null);
      alert("Proyecto importado correctamente âœ…");
    } catch (err) {
      alert((err as Error).message);
    }
  };

  // ðŸ‘‡ saveStudy GENÃ‰RICO: snapshot multi-columna + form solo si aplica
  const saveStudy = (study: SaveStudyInput) => {
    setStudies((prev) => [
      {
        id: crypto.randomUUID(),
        type: study.type,
        name: `${timestamp()} â€” ${study.name}`, // timestamp delante
        params: study.params,
        results: study.results ?? {},
        snapshot: { sheetName: wb.activeSheet, cols: study.cols },
        form:
          study.type === "capability" || study.type === "normality"
            ? analysis
            : undefined,
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

  // ðŸ‘‡ Estudio en visualizaciÃ³n + columnas VIVAS resueltas por NOMBRE (N columnas)
  const viewingStudy = studies.find((s) => s.id === viewingId) ?? null;
  const liveCols: StudyColumn[] | null = viewingStudy
    ? viewingStudy.snapshot.cols.map((c) => ({
        name: c.name,
        values: getColumnByName(
          wb.data[viewingStudy.snapshot.sheetName] ?? EMPTY_SHEET,
          c.name
        ),
      }))
    : null;

  // Compatibilidad capability/normality: primera columna del estudio (1 col)
  const viewingSnapshotCol = viewingStudy
    ? viewingStudy.snapshot.cols[0] ?? null
    : null;
  const liveValues = liveCols ? liveCols[0]?.values ?? null : null;

  // ---------- Insertar filas/columnas ----------
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
        `No se pueden insertar ${count} columna(s): las Ãºltimas ${count} columna(s) ` +
          `contienen datos que se perderÃ­an. Borra primero esos datos y vuelve a intentarlo.`
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
          setViewingId(null); // nuevo anÃ¡lisis: salimos de modo "viewing"
          setAnalysis((prev) => ({ ...prev, ran: false }));
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
              <button
                key={s.id}
                onClick={() => {
                  setActiveTool(s.type as ToolId);
                  setAnalysis(s.form ?? EMPTY_ANALYSIS); // rehidrata si aplica
                  setViewingId(s.id); // modo "viewing" de este estudio
                  if (view === "grid") setView("split");
                }}
                className="w-full text-left text-sm px-2 py-1.5 rounded hover:bg-emerald-50 border border-transparent hover:border-[#00674d] text-gray-700"
              >
                {s.name}
              </button>
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
                <AnalysisPanel
                  tool={activeTool}
                  sheet={wb.data[wb.activeSheet] ?? EMPTY_SHEET}
                  state={analysis}
                  onStateChange={setAnalysis}
                  onSaveStudy={saveStudy}
                  study={viewingStudy}
                  snapshot={viewingSnapshotCol}
                  liveValues={liveValues}
                  onUpdateSnapshot={(newValues) => {
                    if (!viewingStudy) return;
                    setStudies((prev) =>
                      prev.map((s) =>
                        s.id === viewingStudy.id
                          ? {
                              ...s,
                              snapshot: {
                                ...s.snapshot,
                                // actualiza SOLO la primera columna (capability/normality)
                                cols: s.snapshot.cols.map((c, i) =>
                                  i === 0 ? { ...c, values: newValues } : c
                                ),
                              },
                            }
                          : s
                      )
                    );
                  }}
                />
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
              onAddRow={wb.addRow}
              onDeleteRow={wb.deleteRow}
              onAddColumn={wb.addColumn}
              onDeleteColumn={wb.deleteColumn}
            />
          )}

          <div className="flex justify-end gap-2 bg-gray-100 border-t border-gray-300 px-3 py-1.5 shrink-0">
             {(selRows.size > 0 || selCols.size > 0) && (
              <>
                <span className="mx-1 h-4 w-px bg-gray-300" />
                <span className="text-xs text-gray-500">
                  {selCols.size > 0
                    ? `${selCols.size} col.`
                    : `${selRows.size} fila(s)`}
                </span>

                {selCols.size > 0 ? (
                  <button
                    onClick={handleInsertColumns}
                    className="rounded bg-[#00674d] px-2 py-0.5 text-xs text-white hover:bg-[#00513d]"
                  >
                    âž• Insertar {selCols.size} columna{selCols.size > 1 ? "s" : ""}
                  </button>
                ) : (
                  <button
                    onClick={handleInsertRows}
                    className="rounded bg-[#00674d] px-2 py-0.5 text-xs text-white hover:bg-[#00513d]"
                  >
                    âž• Insertar {selRows.size} fila{selRows.size > 1 ? "s" : ""}
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
                  ðŸ—‘ Borrar selecciÃ³n
                </button>
                <span className="mx-1 h-4 w-px bg-gray-300" />
              </>
            )}

            {viewBtn("split", "âŠž Split")}
            {viewBtn("grid", "â–¦ Grid only")}
            {viewBtn("graphics", "ðŸ“Š Charts only")}
          </div>
        </div>
      </div>

      {/* Pop-up de aviso */}
      {warning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-xl">âš ï¸</span>
              <h3 className="font-semibold text-gray-800">No se puede insertar</h3>
            </div>
            <p className="mb-4 text-sm text-gray-600">{warning}</p>
            <div className="flex justify-end">
              <button
                onClick={() => setWarning(null)}
                className="rounded bg-[#00674d] px-4 py-1.5 text-sm text-white hover:bg-[#00513d]"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
