// app/app/six-sigma/lib/file-dialogs.ts
// ---------------------------------------------------------------------------
//  Save / open dialogs backed by the File System Access API.
//
//  What this gives you over the classic anchor-download:
//    · the user picks the folder AND the file name
//    · the browser reopens in the last folder used (per picker id)
//    · we additionally remember the last directory handle in IndexedDB and
//      pass it as `startIn`, which survives across sessions
//    · saving over an already-opened file writes in place, no "file (1).xlsx"
//
//  Safari and Firefox do not implement showSaveFilePicker. Everything below
//  degrades to a prompt() for the name plus a normal download, so behaviour is
//  never worse than what you have today.
// ---------------------------------------------------------------------------

// --- Minimal typings (TS lib.dom does not ship these everywhere yet) -------

export interface FilePickerAcceptType {
  description?: string;
  accept: Record<string, string[]>;
}

interface SaveFilePickerOptions {
  suggestedName?: string;
  types?: FilePickerAcceptType[];
  excludeAcceptAllOption?: boolean;
  id?: string;
  startIn?: FileSystemDirectoryHandle | FileSystemHandle | string;
}

interface OpenFilePickerOptions {
  types?: FilePickerAcceptType[];
  excludeAcceptAllOption?: boolean;
  multiple?: boolean;
  id?: string;
  startIn?: FileSystemDirectoryHandle | FileSystemHandle | string;
}

interface FileSystemWindow {
  showSaveFilePicker?: (o?: SaveFilePickerOptions) => Promise<FileSystemFileHandle>;
  showOpenFilePicker?: (o?: OpenFilePickerOptions) => Promise<FileSystemFileHandle[]>;
}

function fsWindow(): FileSystemWindow {
  return window as unknown as FileSystemWindow;
}

export function hasFileSystemAccess(): boolean {
  return typeof window !== "undefined" && typeof fsWindow().showSaveFilePicker === "function";
}

/** El usuario cerró el diálogo. No es un error: no hay que avisar de nada. */
export function isAbortError(err: unknown): boolean {
  return err instanceof DOMException && err.name === "AbortError";
}

// --- File type presets -----------------------------------------------------

export const EXCEL_TYPE: FilePickerAcceptType = {
  description: "Excel workbook",
  accept: {
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
  },
};

export const PROJECT_TYPE: FilePickerAcceptType = {
  description: "Six Sigma project",
  accept: { "application/json": [".sixsigma", ".json"] },
};

/**
 * Un `id` estable hace que el navegador recuerde la última carpeta usada
 * para ese tipo de fichero. Proyectos y Excel llevan ids distintos a
 * propósito: mucha gente los guarda en sitios distintos.
 */
export const PICKER_ID = {
  project: "sixsigma-project",
  excel: "sixsigma-excel",
} as const;

// --- Last-used directory, persisted in IndexedDB ---------------------------
//
// Los FileSystemDirectoryHandle son estructurados-clonables, así que se pueden
// guardar en IndexedDB (no en localStorage, que solo admite strings).

const DB_NAME = "sixsigma-fs";
const STORE = "handles";

function openDb(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (typeof indexedDB === "undefined") return resolve(null);
    try {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function idbGet(key: string): Promise<unknown> {
  const db = await openDb();
  if (!db) return undefined;
  return new Promise((resolve) => {
    try {
      const req = db.transaction(STORE, "readonly").objectStore(STORE).get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(undefined);
    } catch {
      resolve(undefined);
    }
  });
}

async function idbSet(key: string, value: unknown): Promise<void> {
  const db = await openDb();
  if (!db) return;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

async function rememberLocation(kind: string, handle: FileSystemFileHandle): Promise<void> {
  // Guardamos el propio handle del fichero: `startIn` acepta un file handle y
  // abre su carpeta contenedora. Más simple y fiable que pedir permiso de
  // directorio, que dispara un prompt adicional.
  await idbSet(`last:${kind}`, handle);
}

async function lastLocation(kind: string): Promise<FileSystemHandle | undefined> {
  const h = await idbGet(`last:${kind}`);
  return (h as FileSystemHandle | undefined) ?? undefined;
}

// --- Name helpers ----------------------------------------------------------

/** Quita la extensión: "Line 3 capability.sixsigma" -> "Line 3 capability" */
export function stripExtension(name: string): string {
  const i = name.lastIndexOf(".");
  return i > 0 ? name.slice(0, i) : name;
}

/** Caracteres que Windows rechaza en un nombre de fichero. */
export function sanitiseFileName(name: string): string {
  return name.replace(/[\\/:*?"<>|]/g, "-").trim();
}

function withExtension(name: string, ext: string): string {
  const clean = sanitiseFileName(name) || "untitled";
  return clean.toLowerCase().endsWith(ext) ? clean : `${clean}${ext}`;
}

// --- Fallback download -----------------------------------------------------

function legacyDownload(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revocar inmediatamente aborta la descarga en algunos navegadores.
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

// --- Public API ------------------------------------------------------------

export interface SaveResult {
  /** false = el usuario canceló el diálogo. */
  saved: boolean;
  /** Nombre final elegido, sin extensión. Úsalo para renombrar el proyecto. */
  baseName?: string;
  /** Handle del fichero escrito, si el navegador lo soporta. */
  handle?: FileSystemFileHandle;
}

export interface SaveOptions {
  blob: Blob;
  /** Nombre propuesto, sin extensión. */
  suggestedName: string;
  extension: string;
  type: FilePickerAcceptType;
  pickerId: string;
  /**
   * Si se pasa, se sobrescribe ese fichero sin abrir diálogo.
   * Es el "Save" frente al "Save as".
   */
  existingHandle?: FileSystemFileHandle | null;
}

/**
 * Escribe un blob dejando que el usuario elija carpeta y nombre.
 *
 * Si `existingHandle` viene informado, escribe directamente sobre él sin
 * preguntar nada — ese es el comportamiento de "Guardar" de toda la vida.
 */
export async function saveBlobAs(opts: SaveOptions): Promise<SaveResult> {
  const { blob, suggestedName, extension, type, pickerId, existingHandle } = opts;
  const fileName = withExtension(suggestedName, extension);

  // Ruta rápida: ya sabemos dónde va.
  if (existingHandle) {
    try {
      const writable = await existingHandle.createWritable();
      await writable.write(blob);
      await writable.close();
      return {
        saved: true,
        baseName: stripExtension(existingHandle.name),
        handle: existingHandle,
      };
    } catch (err) {
      if (isAbortError(err)) return { saved: false };
      // Permiso revocado o fichero movido: caemos al diálogo.
    }
  }

  if (!hasFileSystemAccess()) {
    legacyDownload(blob, fileName);
    return { saved: true, baseName: stripExtension(fileName) };
  }

  try {
    const startIn = await lastLocation(pickerId);
    const handle = await fsWindow().showSaveFilePicker!({
      suggestedName: fileName,
      types: [type],
      excludeAcceptAllOption: false,
      id: pickerId,
      ...(startIn ? { startIn } : {}),
    });

    const writable = await handle.createWritable();
    await writable.write(blob);
    await writable.close();

    await rememberLocation(pickerId, handle);

    return { saved: true, baseName: stripExtension(handle.name), handle };
  } catch (err) {
    if (isAbortError(err)) return { saved: false };
    // Algunos entornos (iframes sin permisos, contextos no seguros) lanzan
    // SecurityError. Mejor guardar de la forma antigua que no guardar.
    legacyDownload(blob, fileName);
    return { saved: true, baseName: stripExtension(fileName) };
  }
}

export interface OpenResult {
  file: File;
  handle?: FileSystemFileHandle;
  /** Nombre sin extensión: se convierte en el nombre del proyecto. */
  baseName: string;
}

/**
 * Abre el diálogo de selección de fichero, recordando la última carpeta.
 * Devuelve null si el usuario cancela.
 */
export async function openFileWithPicker(
  type: FilePickerAcceptType,
  pickerId: string
): Promise<OpenResult | null> {
  if (!hasFileSystemAccess() || typeof fsWindow().showOpenFilePicker !== "function") {
    return null; // el llamante recurre al <input type="file"> oculto
  }

  try {
    const startIn = await lastLocation(pickerId);
    const [handle] = await fsWindow().showOpenFilePicker!({
      types: [type],
      excludeAcceptAllOption: false,
      multiple: false,
      id: pickerId,
      ...(startIn ? { startIn } : {}),
    });

    await rememberLocation(pickerId, handle);
    const file = await handle.getFile();
    return { file, handle, baseName: stripExtension(handle.name) };
  } catch (err) {
    if (isAbortError(err)) return null;
    return null;
  }
}
