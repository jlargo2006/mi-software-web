"use client";

import React, { useCallback, useRef } from "react";

interface SplitterProps {
  // porcentaje de altura del frame superior (0-100)
  topPercent: number;
  onChange: (percent: number) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export default function Splitter({
  topPercent,
  onChange,
  containerRef,
}: SplitterProps) {
  const dragging = useRef(false);

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((e.clientY - rect.top) / rect.height) * 100;
      // límites: no dejar que un frame desaparezca del todo
      const clamped = Math.min(85, Math.max(15, pct));
      onChange(clamped);
    },
    [onChange, containerRef]
  );

  const stopDrag = useCallback(() => {
    dragging.current = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", stopDrag);
  }, [onMouseMove]);

  const startDrag = useCallback(() => {
    dragging.current = true;
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", stopDrag);
  }, [onMouseMove, stopDrag]);

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
