"use client";

import { useState, useCallback } from "react";
import type { WorkbookData, Cell } from "../lib/types";
import { createEmptySheet } from "../lib/excel";

const DEFAULT_SHEET = "Sheet1";

export function useWorkbook() {
  // Estado: los datos del libro, el orden de las hojas y cuál está activa
  const [data, setData] = useState<WorkbookData>(() => ({
    [DEFAULT_SHEET]: createEmptySheet(),
  }));
  const [order, setOrder] = useState<string[]>([DEFAULT_SHEET]);
  const [activeSheet, setActiveSheet] = useState<string>(DEFAULT_SHEET);

  // Cargar un libro entero (al importar Excel)
  const loadWorkbook = useCallback(
    (newData: WorkbookData, newOrder: string[]) => {
      setData(newData);
      setOrder(newOrder);
      setActiveSheet(newOrder[0] ?? DEFAULT_SHEET);
    },
    []
  );

  // Editar una celda concreta de la hoja activa
  const setCell = useCallback(
    (row: number, col: number, value: Cell) => {
      setData((prev) => {
        const sheet = prev[activeSheet].map((r) => [...r]); // copia
        // aseguramos que la fila/columna existen
        while (sheet.length <= row) sheet.push([]);
        while (sheet[row].length <= col) sheet[row].push("");
        sheet[row][col] = value;
        return { ...prev, [activeSheet]: sheet };
      });
    },
    [activeSheet]
  );

  // Añadir / borrar filas
  const addRow = useCallback(() => {
    setData((prev) => {
      const sheet = prev[activeSheet];
      const cols = sheet[0]?.length ?? 10;
      const newRow: Cell[] = Array.from({ length: cols }, () => "");
      return { ...prev, [activeSheet]: [...sheet, newRow] };
    });
  }, [activeSheet]);

  const deleteRow = useCallback(() => {
    setData((prev) => {
      const sheet = prev[activeSheet];
      if (sheet.length <= 1) return prev;
      return { ...prev, [activeSheet]: sheet.slice(0, -1) };
    });
  }, [activeSheet]);

  // Añadir / borrar columnas
  const addColumn = useCallback(() => {
    setData((prev) => {
      const sheet = prev[activeSheet].map((r) => [...r, "" as Cell]);
      return { ...prev, [activeSheet]: sheet };
    });
  }, [activeSheet]);

  const deleteColumn = useCallback(() => {
    setData((prev) => {
      const sheet = prev[activeSheet];
      if ((sheet[0]?.length ?? 0) <= 1) return prev;
      return {
        ...prev,
        [activeSheet]: sheet.map((r) => r.slice(0, -1)),
      };
    });
  }, [activeSheet]);

  // Gestión de hojas
  const addSheet = useCallback(() => {
    setOrder((prevOrder) => {
      let i = prevOrder.length + 1;
      let name = `Sheet${i}`;
      while (prevOrder.includes(name)) name = `Sheet${++i}`;
      setData((prev) => ({ ...prev, [name]: createEmptySheet() }));
      setActiveSheet(name);
      return [...prevOrder, name];
    });
  }, []);

  const deleteSheet = useCallback(
    (name: string) => {
      setOrder((prevOrder) => {
        if (prevOrder.length <= 1) return prevOrder; // no borrar la última
        const newOrder = prevOrder.filter((n) => n !== name);
        setData((prev) => {
          const copy = { ...prev };
          delete copy[name];
          return copy;
        });
        setActiveSheet((curr) => (curr === name ? newOrder[0] : curr));
        return newOrder;
      });
    },
    []
  );

  // Pegar datos (desde portapapeles) a partir de una celda
  const pasteData = useCallback(
    (startRow: number, startCol: number, matrix: Cell[][]) => {
      setData((prev) => {
        const sheet = prev[activeSheet].map((r) => [...r]);
        matrix.forEach((rowVals, dr) => {
          rowVals.forEach((val, dc) => {
            const r = startRow + dr;
            const c = startCol + dc;
            while (sheet.length <= r) sheet.push([]);
            while (sheet[r].length <= c) sheet[r].push("");
            sheet[r][c] = val;
          });
        });
        return { ...prev, [activeSheet]: sheet };
      });
    },
    [activeSheet]
  );

  return {
    data,
    order,
    activeSheet,
    setActiveSheet,
    loadWorkbook,
    setCell,
    addRow,
    deleteRow,
    addColumn,
    deleteColumn,
    addSheet,
    deleteSheet,
    pasteData,
  };
}
