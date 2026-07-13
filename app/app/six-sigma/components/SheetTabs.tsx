"use client";

import React from "react";

interface SheetTabsProps {
  order: string[];
  activeSheet: string;
  onSelect: (name: string) => void;
  onAddSheet: () => void;
  onDeleteSheet: (name: string) => void;
  onAddRow: () => void;
  onDeleteRow: () => void;
  onAddColumn: () => void;
  onDeleteColumn: () => void;
}

export default function SheetTabs({
  order,
  activeSheet,
  onSelect,
  onAddSheet,
  onDeleteSheet,
  onAddRow,
  onDeleteRow,
  onAddColumn,
  onDeleteColumn,
}: SheetTabsProps) {
  const btn =
    "px-2 py-1 text-xs rounded border border-gray-300 hover:bg-gray-100 text-gray-700";

  return (
    <div className="flex items-center justify-between bg-gray-50 border-t border-gray-300 px-2 py-1 shrink-0">
      {/* Pestañas */}
      <div className="flex items-center gap-1 overflow-x-auto">
        {order.map((name) => (
          <div
            key={name}
            className={`group flex items-center rounded-t px-3 py-1 text-sm cursor-pointer whitespace-nowrap ${
              name === activeSheet
                ? "bg-white border border-b-white border-gray-300 font-semibold text-[#00674d]"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
            onClick={() => onSelect(name)}
          >
            {name}
            {order.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSheet(name);
                }}
                className="ml-2 text-gray-400 hover:text-red-500"
                title="Delete sheet"
              >
                ×
              </button>
            )}
          </div>
        ))}
        <button
          onClick={onAddSheet}
          className="px-2 py-1 text-sm text-[#00674d] hover:bg-gray-200 rounded"
          title="Add sheet"
        >
          +
        </button>
      </div>
    </div>
  );
}
