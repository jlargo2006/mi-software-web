// app/app/six-sigma/SixSigmaAnalyzer.tsx
"use client";

import React, { useRef, useState } from "react";
import { useWorkbook } from "./hooks/useWorkbook";
import { readExcelFile, buildExcelBlob } from "./lib/excel";
import { buildProjectBlob, importProject, defaultProjectFileName } from "./lib/project";
import {
  saveBlobAs,
  openFileWithPicker,
  hasFileSystemAccess,
  stripExtension,
  EXCEL_TYPE,
  PROJECT_TYPE,
  PICKER_ID,
} from "./lib/file-dialogs";
import { ToolId } from "./lib/ribbon";
import type { SavedStudy, SaveStudyInput } from "./lib/studies";
import MenuBar from "./components/MenuBar";
import DataGrid from "./components/DataGrid";
import SheetTabs from "./components/SheetTabs";
import Splitter from "./components/Splitter";
import { getArtifact } from "./studies/_registry";
import type { ColumnSnapshot } from "./studies/types";
import AnalysisRunner from "./components/AnalysisRunner";
import StudyList from "./components/StudyList";
import { useSidebar } from "./hooks/useSidebar";
import SidebarSplitter from "./components/SidebarSplitter";

type ViewMode = "split" | "grid" | "graphics";

interface SixSigmaAnalyzerProps {
  userEmail?: string;
  onSignOut: () => void;
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
  const sidebar = useSidebar();

  // El nombre del proyecto ES el nombre del fichero. Se fija al abrir y al
  // guardar, y es lo que se propone la siguiente vez.
  const [projectName, setProjectName] = useState<string>(defaultProjectFileName);
  // Handle del .sixsigma abierto o guardado: permite que "Save" escriba encima
  // sin volver a preguntar. Se pierde al recargar la pagina, y es lo correcto:
  // tras un refresco vuelve a pedir destino.
  const projectHandleRef = useRef<FileSystemFileHandle | null>(null);

  // --- Project: save / open everything (declared first: used by handleImport/handleNew) ---

  /** Save as… : siempre abre el dialogo, con carpeta y nombre recordados. */
  const handleSaveProjectAs = async (): Promise<void> => {
    const res = await saveBlobAs({
      blob: buildProjectBlob(wb.data, wb.order, studies),
      suggestedName: projectName,
      extension: ".sixsigma",
      type: PROJECT_TYPE,
      pickerId: PICKER_ID.project,
    });
    if (!res.saved) return; // el usuario cancelo: no se toca nada
    if (res.baseName) setProjectName(res.baseName);
    projectHandleRef.current = res.handle ?? null;
  };

  /** Save : escribe sobre el fichero abierto. Si no hay, se comporta como Save as. */
  const handleSaveProject = async (): Promise<void> => {
    const res = await saveBlobAs({
      blob: buildProjectBlob(wb.data, wb.order, studies),
      suggestedName: projectName,
      extension: ".sixsigma",
      type: PROJECT_TYPE,
      pickerId: PICKER_ID.project,
      existingHandle: projectHandleRef.current,
    });
    if (!res.saved) return;
    if (res.baseName) setProjectName(res.baseName);
    projectHandleRef.current = res.handle ?? null;
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
  const offerExportFirst = async (message: string): Promise<void> => {
    if (nothingToLose) return;
    const exportFirst = window.confirm(
      `${message}\n\nDo you want to save your current project first?` +
        `\n\nOK = save first, Cancel = discard.`
    );
    // Sin await, la accion destructiva se ejecutaba MIENTRAS el dialogo seguia
    // abierto: el trabajo se perdia antes de llegar a guardarse.
    if (exportFirst) await handleSaveProjectAs();
  };

  const handleImportProject = async (file: File) => {
    await offerExportFirst("Opening a project will discard your current work.");
    try {
      const project = await importProject(file);
      wb.loadWorkbook(project.workbook.data, project.workbook.order);
      setStudies(project.studies ?? []);
      setActiveTool(null);
      setViewingId(null);
      // El nombre del fichero pasa a ser el nombre del proyecto.
      setProjectName(stripExtension(file.name));      
      // Sin aviso de exito: los estudios aparecen en la barra lateral y los
      // datos en la rejilla. Confirmar lo que ya se ve solo estorba.
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleImport = async (file: File) => {
    await offerExportFirst(
      "Opening an Excel file will discard your current work (including saved studies)."
    );
    try {
      const { data, order } = await readExcelFile(file);
      wb.loadWorkbook(data, order);
      setStudies([]);
      setActiveTool(null);
      setViewingId(null);
      // Un .xlsx da nombre al proyecto, pero no es un proyecto guardado:
      // el siguiente Save tiene que preguntar destino.
      setProjectName(stripExtension(file.name));
      projectHandleRef.current = null;      
    } catch (err) {
      alert("Could not read file: " + (err as Error).message);
    }
  };

  const handleExport = async (): Promise<void> => {
    await saveBlobAs({
      blob: buildExcelBlob(wb.data, wb.order),
      suggestedName: projectName, // mismo nombre que el proyecto
      extension: ".xlsx",
      type: EXCEL_TYPE,
      pickerId: PICKER_ID.excel,  // carpeta recordada aparte de la del proyecto
    });
    // Exportar a Excel no renombra el proyecto: es una salida, no el documento.
  };

  const handleNew = async () => {
    if (nothingToLose) {
      wb.resetWorkbook();
      setActiveTool(null);
      setViewingId(null);
      return;
    }
    await offerExportFirst("This will clear the current project.");
    wb.resetWorkbook();
    setStudies([]);
    setActiveTool(null);
    setViewingId(null);
    setProjectName(defaultProjectFileName());
    projectHandleRef.current = null;
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

  const handleRenameStudy = (id: string, newName: string) => {
    setStudies((prev) =>
      prev.map((s) => (s.id === id ? { ...s, name: newName } : s))
    );
  };

  // GENERIC saveStudy: multi-column snapshot
  const saveStudy = (study: SaveStudyInput) => {
    setStudies((prev) => [
      {
        id: crypto.randomUUID(),
        type: study.type,
        name: study.name, // sin fecha: ahora vive en createdAt
        createdAt: new Date().toISOString(),
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

  /**
   * El <input type="file"> oculto no puede recordar carpeta: es una limitacion
   * del navegador, no algo configurable. Por eso se usa el picker cuando existe
   * y solo se cae al input en Firefox y Safari.
   */
  const openProject = async () => {
    if (hasFileSystemAccess()) {
      const picked = await openFileWithPicker(PROJECT_TYPE, PICKER_ID.project);
      if (picked) {
        await handleImportProject(picked.file);
        projectHandleRef.current = picked.handle ?? null;
      }
      return; // cancelar es cancelar: no se abre un segundo dialogo
    }
    projectInputRef.current?.click();
  };

  const openExcel = async () => {
    if (hasFileSystemAccess()) {
      const picked = await openFileWithPicker(EXCEL_TYPE, PICKER_ID.excel);
      if (picked) await handleImport(picked.file);
      return;
    }
    fileInputRef.current?.click();
  };
  
  return (
      <div className="flex flex-col h-full w-full bg-white">
      <MenuBar
        userEmail={userEmail}
        projectName={projectName}
        onNew={handleNew}
        onOpen={openExcel}
        onSave={handleExport}
        onSaveProject={handleSaveProject}
        onExportProject={handleSaveProjectAs}
        onImportProject={openProject}
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
        {/* Saved studies sidebar: plegable y de ancho ajustable */}
        {sidebar.collapsed ? (
          // Plegado deja un tirador estrecho, no un panel vacio: asi se
          // recupera sin tener que buscar el control en un menu.
          <div className="w-8 shrink-0 bg-gray-50 border-r border-gray-300 flex flex-col items-center pt-2">
            <button
              onClick={sidebar.expand}
              className="text-[#00674d] hover:bg-gray-200 rounded px-1 py-1 text-sm"
              title="Show saved studies"
              aria-label="Show saved studies"
            >
              {"\u25B6"}
            </button>
            <span
              className="mt-3 text-[11px] text-gray-500 tracking-wide"
              style={{ writingMode: "vertical-rl" }}
            >
              Saved Studies
              {studies.length > 0 && ` (${studies.length})`}
            </span>
          </div>
        ) : (
          <>
            <aside
              suppressHydrationWarning
              style={{ width: sidebar.width }}
              className="bg-gray-50 border-r border-gray-300 flex flex-col shrink-0 min-w-0"
            >
              <div className="flex items-center justify-end px-1 pt-1">
                <button
                  onClick={sidebar.toggle}
                  className="text-gray-400 hover:text-[#00674d] px-1 text-sm"
                  title="Hide panel"
                  aria-label="Hide saved studies panel"
                >
                  {"\u25C0"}
                </button>
              </div>
              <StudyList
                studies={studies}
                viewingId={viewingId}
                onSelect={(s) => {
                  setActiveTool(s.type as ToolId);
                  setArtifactParams(s.params);
                  setViewingId(s.id);
                  if (view === "grid") setView("split");
                }}
                onDelete={(id) => {
                  setStudies((prev) => prev.filter((x) => x.id !== id));
                  if (viewingId === id) {
                    setViewingId(null);
                    setActiveTool(null);
                  }
                }}
                onRename={handleRenameStudy}
              />
            </aside>

            <SidebarSplitter
              dragging={sidebar.dragging}
              width={sidebar.width}
              onStartDrag={sidebar.startDrag}
              onReset={sidebar.reset}
              onNudge={sidebar.nudge}
            />
          </>
        )}
        
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
