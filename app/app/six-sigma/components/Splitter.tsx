"use client";

import React, { useCallback } from "react";

interface SplitterProps {
  onChange: (percent: number) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export default function Splitter({ onChange, containerRef }: SplitterProps) {
  const startDrag = useCallback(() => {
    // Definimos los handlers DENTRO para evitar referencias circulares
    const onMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((e.clientY - rect.top) / rect.height) * 100;
      // límites: que ningún frame desaparezca del todo
      const clamped = Math.min(85, Math.max(15, pct));
      onChange(clamped);
    };

    const stopDrag = () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", stopDrag);
    };

    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", stopDrag);
  }, [onChange, containerRef]);

  return (
    <div
      onMouseDown={startDrag}
      className="h-1.5 bg-gray-300 hover:bg-[#00674d] cursor-row-resize flex items-center justify-center transition-colors shrink-0"
      title="Arrastra para redimensionar"
    >
      <div className="w-10 h-0.5 bg-gray-500 rounded" />
    </div>
  );
}
