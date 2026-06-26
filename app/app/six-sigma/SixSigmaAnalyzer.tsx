"use client";

import React, { useRef, useState } from "react";
import { useWorkbook } from "./hooks/useWorkbook";
import { readExcelFile, writeExcelFile } from "./lib/excel";
import TopBar from "./components/TopBar";
import DataGrid from "./components/DataGrid";
import SheetTabs from "./components/SheetTabs";
import Splitter from "./components/Splitter";
import AnalysisPanel, { ToolId } from "./components/AnalysisPanel";

type ViewMode = "split" | "grid" | "graphics";

// Each DMAIC phase exposes its available tools
const PHASES: { name: string; tools: { id: ToolId; label: string }[] }[] = [
  { name: "Define", tools: [] },
  { name: "Measure", tools: [{ id: "capability", label: "Capability Study" }] },
  { name: "Analyze", tools: [{ id: "normality", label: "Normality Test" }] },
  { name: "Improve", tools: [] },
  { name: "Control", tools: [] },
];

interface SavedStudy {
  id: string;
  type: "capability" | "normality";
  name: string;
  params: Record<string, unknown>;
  results: Record<string, unknown>;
}

export default function SixSigmaAnalyzer() {
  const wb = useWorkbook();
  const [view, setView] = useState<ViewMode>("split");
  const [topPercent, setTopPercent] = useState(45);
  const [activePhase, setActivePhase] = useState("Measure");
  const [activeTool, setActiveTool] = useState<ToolId>(null);
  const [studies, setStudies] = useState<SavedStudy[]>([]);
  const splitRef = useRef<HTMLDivElement>(null);

  const handleImport = async (file: File) => {
    try {
      const { data, order } = await readExcelFile(file);
      wb.loadWorkbook(data, order);
    } catch (err) {
      alert("Could not read file: " + (err as Error).message);
    }
  };

  const handleExport = () => writeExcelFile(wb.data, wb.order);

  const saveStudy = (study: Omit<SavedStudy, "id">) => {
    setStudies((prev) => [{ ...study, id: crypto.randomUUID() }, ...prev]);
  };

  const showTop = view === "split" || view === "graphics";
  const showBottom = view === "split" || view === "grid";

  const phaseTools = PHASES.find((p) => p.name === activePhase)?.tools ?? [];

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

  return (
    <div className="flex flex-col h-full w-full bg-white">
      <TopBar onImport={handleImport} onExport={handleExport} />

      {/* DMAIC phase bar */}
      <div className="flex items-center gap-1 bg-gray-100 border-b border-gray-300 px-3 py-1.5 shrink-0">
        {PHASES.map((p) => (
          <button
            key={p.name}
            onClick={() => {
              setActivePhase(p.name);
              setActiveTool(null);
            }}
            className={`px-4 py-1 text-sm rounded font-medium ${
              activePhase === p.name
                ? "bg-[#00674d] text-white"
                : "text-gray-600 hover:bg-gray-200"
            }`}
          >
            {p.name}
          </button>
        ))}

        {/* Tools for the active phase */}
        {phaseTools.length > 0 && (
          <>
            <span className="mx-2 text-gray-300">|</span>
            {phaseTools.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setActiveTool(t.id);
                  if (view === "grid") setView("split");
                }}
                className={`px-3 py-1 text-sm rounded border ${
                  activeTool === t.id
                    ? "bg-emerald-100 border-[#00674d] text-[#00674d]"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {t.label}
              </button>
            ))}
          </>
        )}
      </div>

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
                  setActiveTool(s.type);
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
            {/* TOP FRAME: results / charts */}
            {showTop && (
              <div
                className="overflow-auto bg-white border-b border-gray-200"
                style={{ height: view === "split" ? `${topPercent}%` : "100%" }}
              >
                <AnalysisPanel
                  tool={activeTool}
                  sheet={wb.data[wb.activeSheet] ?? []}
                  onSaveStudy={saveStudy}
                />
              </div>
            )}

            {view === "split" && (
              <Splitter onChange={setTopPercent} containerRef={splitRef} />
            )}

            {/* BOTTOM FRAME: grid */}
            {showBottom && (
              <div
                className="overflow-hidden flex flex-col min-h-0"
                style={{
                  height: view === "split" ? `${100 - topPercent}%` : "100%",
                }}
              >
                <div className="flex-1 overflow-auto">
                  <DataGrid
                    sheet={wb.data[wb.activeSheet] ?? []}
                    onCellChange={wb.setCell}
                    onPaste={wb.pasteData}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sheet tabs (below the grid) */}
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

          {/* View mode buttons (bottom right) */}
          <div className="flex justify-end gap-2 bg-gray-100 border-t border-gray-300 px-3 py-1.5 shrink-0">
            {viewBtn("split", "⊞ Split")}
            {viewBtn("grid", "▦ Grid only")}
            {viewBtn("graphics", "📊 Charts only")}
          </div>
        </div>
      </div>
    </div>
  );
}
