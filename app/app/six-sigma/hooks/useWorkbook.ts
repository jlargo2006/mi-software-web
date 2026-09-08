// app/app/six-sigma/hooks/useWorkbook.ts

"use client";

import { useState, useCallback } from "react";
import type { WorkbookData, Cell } from "../lib/types";
import { createEmptySheet, parseCellValue } from "../lib/excel";

const DEFAULT_SHEET = "Sheet1";
const GRID_COLS = 26; // A … Z (debe coincidir con FIXED_COLS del DataGrid)

// helper: copia un array y lo rellena hasta `len`
const padTo = <T,>(arr: T[], len: number, fill: T): T[] => {
  const a = [...arr];
  while (a.length < len) a.push(fill);
  return a;
};

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

  /**
   * Ordena las filas de datos por una columna.
   *
   * Reordena los DATOS, no una vista: los estudios guardados llevan su propia
   * copia, asi que no se rompe nada, y una vista ordenada obligaria a traducir
   * indices en cada insercion, borrado o pegado.
   */
  const sortRowsBy = useCallback(
    (col: number, dir: "asc" | "desc") => {
      setData((prev) => {
        const sheet = prev[activeSheet];
        if (!sheet) return prev;
        const sign = dir === "asc" ? 1 : -1;
        const rows = [...sheet.rows].sort((a, b) => {
          const va = a[col] ?? "";
          const vb = b[col] ?? "";
          // Los vacios van siempre al final, en los dos sentidos: si se
          // ordenaran, en descendente saldrian primero y taparian los datos.
          if (va === "" && vb === "") return 0;
          if (va === "") return 1;
          if (vb === "") return -1;
          const na = typeof va === "number" ? va : Number(va);
          const nb = typeof vb === "number" ? vb : Number(vb);
          // Numerico cuando ambos lo son: si no, "10" iria antes que "9".
          if (!Number.isNaN(na) && !Number.isNaN(nb)) return (na - nb) * sign;
          return (
            String(va).localeCompare(String(vb), undefined, {
              numeric: true,
              sensitivity: "base",
            }) * sign
          );
        });
        return { ...prev, [activeSheet]: { ...sheet, rows } };
      });
    },
    [activeSheet]
  );

  /**
   * Escribe una columna entera de golpe (calculadora de columnas).
   * En un solo setData: hacerlo con setCell fila a fila encadenaria un
   * render por celda y con 500 filas se nota.
   */
  const setColumnValues = useCallback(
    (col: number, values: Cell[]) => {
      setData((prev) => {
        const sheet = prev[activeSheet];
        if (!sheet) return prev;
        const rows = sheet.rows.map((r) => [...r]);
        values.forEach((v, i) => {
          if (i >= rows.length) return;
          while (rows[i].length <= col) rows[i].push("");
          rows[i][col] = v;
        });
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
      // El sufijo se calcula como "el mayor Sheet-N existente + 1", no como
      // "numero de hojas + 1": al insertar en medio, contar hojas repetiria
      // nombres ya usados (Sheet1, Sheet2, borras Sheet1 -> Sheet2 otra vez).
      let maxN = 0;
      for (const n of prevOrder) {
        const m = /^Sheet(\d+)$/.exec(n);
        if (m) maxN = Math.max(maxN, Number(m[1]));
      }
      let name = `Sheet${maxN + 1}`;
      let bump = maxN + 1;
      while (prevOrder.includes(name)) name = `Sheet${++bump}`;

      setData((prev) => ({ ...prev, [name]: createEmptySheet() }));
      setActiveSheet(name);

      // Se inserta a la derecha de la hoja activa, como Excel. Si la activa
      // no esta en la lista (no deberia pasar), cae al final.
      const idx = prevOrder.indexOf(activeSheet);
      const next = [...prevOrder];
      next.splice(idx < 0 ? prevOrder.length : idx + 1, 0, name);
      return next;
    });
  }, [activeSheet]);

  const deleteSheet = useCallback((name: string) => {
    setOrder((prevOrder) => {
      if (prevOrder.length <= 1) return prevOrder;
      const idx = prevOrder.indexOf(name);
      const newOrder = prevOrder.filter((n) => n !== name);
      setData((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
      // Se queda la hoja que ocupa ahora esa posicion (la posterior); si
      // borraste la ultima, la anterior. Es el comportamiento de Excel.
      const fallback = newOrder[Math.min(idx, newOrder.length - 1)];
      setActiveSheet((curr) => (curr === name ? fallback : curr));
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

  // ---- Crear una hoja NUEVA ya rellena (generadores de disenos) ----
  const createSheetWithData = useCallback(
    (baseName: string, headers: string[], rows: Cell[][]): string => {
      let created = baseName;
      setOrder((prevOrder) => {
        let name = baseName;
        let i = 1;
        while (prevOrder.includes(name)) name = `${baseName}${++i}`;
        created = name;

        const width = Math.max(GRID_COLS, headers.length);
        const paddedHeaders = padTo(headers, width, "");
        // Se rellena hasta el ancho de la rejilla y se garantiza un minimo de
        // filas, para que la hoja se vea utilizable al abrirla.
        const paddedRows: Cell[][] = rows.map((r) =>
          padTo(r as Cell[], width, "" as Cell)
        );
        while (paddedRows.length < 30) {
          paddedRows.push(Array.from({ length: width }, () => "" as Cell));
        }

        setData((prev) => ({
          ...prev,
          [name]: { headers: paddedHeaders, rows: paddedRows },
        }));
        setActiveSheet(name);
        return [...prevOrder, name];
      });
      return created;
    },
    []
  );

  // ---- Insertar columnas ANTES de `start` (empuja a la derecha, recorta a Z) ----
  const insertColumnsAt = useCallback(
    (start: number, count: number) => {
      setData((prev) => {
        const sheet = prev[activeSheet];
        const headers = padTo(sheet.headers, GRID_COLS, "");
        headers.splice(start, 0, ...Array(count).fill(""));
        headers.length = GRID_COLS; // recorta la cola
        const rows = sheet.rows.map((r) => {
          const rr = padTo(r as Cell[], GRID_COLS, "" as Cell);
          rr.splice(start, 0, ...Array(count).fill("" as Cell));
          rr.length = GRID_COLS;
          return rr;
        });
        return { ...prev, [activeSheet]: { headers, rows } };
      });
    },
    [activeSheet]
  );

  // ---- Insertar filas ANTES de `start` (las filas crecen sin límite) ----
  const insertRowsAt = useCallback(
    (start: number, count: number) => {
      setData((prev) => {
        const sheet = prev[activeSheet];
        const width = Math.max(GRID_COLS, sheet.headers.length);
        const empties: Cell[][] = Array.from({ length: count }, () =>
          Array.from({ length: width }, () => "" as Cell)
        );
        const rows = [...sheet.rows];
        rows.splice(start, 0, ...empties);
        return { ...prev, [activeSheet]: { ...sheet, rows } };
      });
    },
    [activeSheet]
  );

  // ---- Mover la hoja activa una posicion adelante o atras ----
  const moveSheet = useCallback((name: string, delta: number) => {
    setOrder((prev) => {
      const i = prev.indexOf(name);
      const j = i + delta;
      if (i < 0 || j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }, []);

  /**
   * Renombra una hoja. Devuelve null si todo fue bien, o un mensaje de error.
   *
   * Se validan las mismas restricciones que Excel, porque el libro se exporta
   * a .xlsx y un nombre invalido reventaria al escribir el fichero.
   */
  const renameSheet = useCallback(
    (oldName: string, rawNew: string): string | null => {
      const newName = rawNew.trim();

      if (newName === oldName) return null; // sin cambios, sin ruido
      if (!newName) return "The sheet name cannot be empty.";
      if (newName.length > 31)
        return "The sheet name cannot exceed 31 characters.";
      if (/[:\\/?*[\]]/.test(newName))
        return "A sheet name cannot contain : \\ / ? * [ ]";
      if (order.some((n) => n.toLowerCase() === newName.toLowerCase()))
        return `There is already a sheet named "${newName}".`;

      // Se reconstruye el objeto en el mismo orden de claves: aunque el orden
      // real lo manda `order`, mantenerlos alineados evita sorpresas al
      // serializar el proyecto.
      setData((prev) => {
        const next: WorkbookData = {};
        for (const key of Object.keys(prev)) {
          next[key === oldName ? newName : key] = prev[key];
        }
        return next;
      });
      setOrder((prev) => prev.map((n) => (n === oldName ? newName : n)));
      setActiveSheet((curr) => (curr === oldName ? newName : curr));
      return null;
    },
    [order]
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
    sortRowsBy,
    setColumnValues,    
    addColumn,
    deleteColumn,
    deleteColumnsAt,
    addSheet,
    deleteSheet,
    pasteData,
    resetWorkbook,
    insertColumnsAt,
    insertRowsAt,
    createSheetWithData,
    moveSheet,
    renameSheet,
  };
}
