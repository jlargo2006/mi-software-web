"use client";

import React, { useRef } from "react";

interface TopBarProps {
  onImport: (file: File) => void;
  onExport: () => void;
}

export default function TopBar({ onImport, onExport }: TopBarProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex items-center gap-3 bg-[#00674d] text-white px-4 py-2 shrink-0">
      <span className="font-bold text-lg">Six Sigma Analyzer</span>
      <div className="flex-1" />
      <button
        onClick={() => fileRef.current?.click()}
        className="bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded text-sm font-medium"
      >
        📂 Open Excel
      </button>
      <button
        onClick={onExport}
        className="bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded text-sm font-medium"
      >
        💾 Download Excel
      </button>
      <input
        ref={fileRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onImport(f);
          e.target.value = ""; // permite reabrir el mismo archivo
        }}
      />
    </div>
  );
}
