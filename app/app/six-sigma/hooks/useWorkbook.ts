"use client";

import { useState, useCallback } from "react";
import type { WorkbookData, Cell } from "../lib/types";
import { createEmptySheet, parseCellValue } from "../lib/excel";

const DEFAULT_SHEET = "Sheet1";

export function useWorkbook() {
  const [data, setData] = useState<WorkbookData>(() => ({
    [DEFAULT_SHEET]: createEmptySheet(),
  }));
  const [order, setOrder] = useState<string[]>([DEFAULT_SHEET]);
  const [activeSheet, setActiveSheet] = useState<string>(DEFAULT_SHEET);

  const loadWorkbook = useCallback(
    (newData: WorkbookData, newOrder: string[]) => {
      setData(newData);
      setOrder(newOrder);
      setActiveSheet(newOrder[0] ?? DEFAULT_SHEET);
    },
    []
  );

  const resetWorkbook = useCallback(() => {
    setData({ [DEFAULT_SHEET]: createEmptySheet() });
    setOrder([DEFAULT_SHEET]);
    setActiveSheet(DEFAULT_SHEET);
  }, []);

  // ---- Editar el TÍTULO de una columna (fila de cabecera) ----
  const setHeader = useCallback(
    (col: number, value: string) => {
      setData((prev) => {
        const sheet = prev[activeSheet];
        const headers = [...sheet.headers];
        while (headers.length <= col) headers.push("");
        headers[col] = value;
        return { ...prev, [activeSheet]: { ...sheet, headers } };
      });
    },
    [activeSheet]
  );

  // ---- Editar una celda de DATOS ----
  const setCell = useCallback(
    (row: number, col: number, value: Cell) => {
      setData((prev) => {
        const sheet = prev[activeSheet];
        const rows = sheet.rows.map((r) => [...r]);
        while (rows.length <= row) rows.push([]);
        while (rows[row].length <= col) rows[row].push("");
        rows[row][col] = value;
        return { ...prev, [activeSheet]: { ...sheet, rows } };
      });
    },
    [activeSheet]
  );

  // ---- Filas ----
  const addRow = useCallback(() => {
    setData((prev) => {
      const sheet = prev[activeSheet];
      const cols = Math.max(
        sheet.headers.length,
        sheet.rows[0]?.length ?? 10
      );
      const newRow: Cell[] = Array.from({ length: cols }, () => "");
      return { ...prev, [activeSheet]: { ...sheet, rows: [...sheet.rows, newRow] } };
    });
  }, [activeSheet]);

  const deleteRow = useCallback(() => {
    setData((prev) => {
      const sheet = prev[activeSheet];
      if (sheet.rows.length <= 1) return prev;
      return { ...prev, [activeSheet]: { ...sheet, rows: sheet.rows.slice(0, -1) } };
    });
  }, [activeSheet]);

  // Borrar un conjunto de filas de datos por índice
  const deleteRowsAt = useCallback(
    (indices: number[]) => {
      const toDrop = new Set(indices);
      setData((prev) => {
        const sheet = prev[activeSheet];
        const rows = sheet.rows.filter((_, i) => !toDrop.has(i));
        return { ...prev, [activeSheet]: { ...sheet, rows } };
      });
    },
    [activeSheet]
  );

  // ---- Columnas ----
  const addColumn = useCallback(() => {
    setData((prev) => {
      const sheet = prev[activeSheet];
      return {
        ...prev,
        [activeSheet]: {
          headers: [...sheet.headers, ""],
          rows: sheet.rows.map((r) => [...r, "" as Cell]),
        },
      };
    });
  }, [activeSheet]);

  const deleteColumn = useCallback(() => {
    setData((prev) => {
      const sheet = prev[activeSheet];
      if (sheet.headers.length <= 1) return prev;
      return {
        ...prev,
        [activeSheet]: {
          headers: sheet.headers.slice(0, -1),
          rows: sheet.rows.map((r) => r.slice(0, -1)),
        },
      };
    });
  }, [activeSheet]);

  // Borrar un conjunto de columnas por índice
  const deleteColumnsAt = useCallback(
    (indices: number[]) => {
      const toDrop = new Set(indices);
      setData((prev) => {
        const sheet = prev[activeSheet];
        return {
          ...prev,
          [activeSheet]: {
            headers: sheet.headers.filter((_, i) => !toDrop.has(i)),
            rows: sheet.rows.map((r) => r.filter((_, i) => !toDrop.has(i))),
          },
        };
      });
    },
    [activeSheet]
  );

  // ---- Hojas ----
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

  const deleteSheet = useCallback((name: string) => {
    setOrder((prevOrder) => {
      if (prevOrder.length <= 1) return prevOrder;
      const newOrder = prevOrder.filter((n) => n !== name);
      setData((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
      setActiveSheet((curr) => (curr === name ? newOrder[0] : curr));
      return newOrder;
    });
  }, []);

  // ---- Pegar datos (coma decimal -> punto) en filas de DATOS ----
  const pasteData = useCallback(
    (startRow: number, startCol: number, matrix: Cell[][]) => {
      setData((prev) => {
        const sheet = prev[activeSheet];
        const rows = sheet.rows.map((r) => [...r]);
        matrix.forEach((rowVals, dr) => {
          rowVals.forEach((val, dc) => {
            const r = startRow + dr;
            const c = startCol + dc;
            while (rows.length <= r) rows.push([]);
            while (rows[r].length <= c) rows[r].push("");
            rows[r][c] =
              typeof val === "number" ? val : parseCellValue(String(val));
          });
        });
        return { ...prev, [activeSheet]: { ...sheet, rows } };
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
    setHeader,
    setCell,
    addRow,
    deleteRow,
    deleteRowsAt,
    addColumn,
    deleteColumn,
    deleteColumnsAt,
    addSheet,
    deleteSheet,
    pasteData,
    resetWorkbook,
  };
}
