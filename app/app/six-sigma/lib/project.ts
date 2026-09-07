// app/app/six-sigma/lib/project.ts
import type { WorkbookData } from "./types";
import type { SavedStudy } from "./studies";
// El registro de definiciones, indexado por id de estudio.
import { REGISTRY } from "../studies/_registry";
import { splitLegacyName } from "./studies";


export interface ProjectFile {
  app: "mi-software-web";
  kind: "sixsigma-project";
  version: 1;
  savedAt: string;
  workbook: {
    data: WorkbookData;
    order: string[];
  };
  studies: SavedStudy[];
}

/**
 * Parametros guardados, completados con los del estudio actual.
 *
 * Un fichero antiguo no conoce los parametros anadidos despues de guardarlo.
 * Sin este relleno llegan como undefined a compute, que revienta en pleno
 * render y tumba la aplicacion entera: el usuario pierde la sesion por un solo
 * campo que no existia. Los valores por omision van DELANTE para que lo
 * guardado tenga siempre prioridad.
 */
function mergeParams(
  saved: unknown,
  defaults: Record<string, unknown>
): Record<string, unknown> {
  if (saved === null || typeof saved !== "object" || Array.isArray(saved)) {
    return { ...defaults };
  }
  return { ...defaults, ...(saved as Record<string, unknown>) };
}

/**
 * Descarta lo irrecuperable y completa lo que se pueda.
 *
 * Un estudio de un tipo que ya no existe se retira en silencio: es preferible
 * abrir el proyecto sin el a no abrirlo en absoluto.
 */
function sanitizeStudies(raw: unknown): SavedStudy[] {
  if (!Array.isArray(raw)) return [];
  const out: SavedStudy[] = [];
  for (const s of raw) {
    if (s === null || typeof s !== "object") continue;
    const st = s as Partial<SavedStudy>;
    if (typeof st.type !== "string" || typeof st.id !== "string") continue;
    const def = REGISTRY[st.type];
    if (!def) continue;
    // Los diagramas (fishbone) no declaran defaultParams: no hay nada que
    // rellenar y sus params se pasan tal cual.
    const defaults =
      "defaultParams" in def
        ? (def.defaultParams as Record<string, unknown>)
        : {};
    const rawName = typeof st.name === "string" ? st.name : st.type;
    // Ficheros anteriores llevaban la fecha dentro del nombre. Se extrae para
    // que el nombre quede limpio y la fecha sirva para ordenar.
    const legacy = splitLegacyName(rawName);
    const createdAt =
      typeof st.createdAt === "string" && !Number.isNaN(Date.parse(st.createdAt))
        ? st.createdAt
        : legacy.createdAt ?? new Date(0).toISOString();

    out.push({
      id: st.id,
      type: st.type,
      name: legacy.name,
      createdAt,
      params: mergeParams(st.params, defaults),
      results: (st.results as Record<string, unknown>) ?? {},
      snapshot:
        st.snapshot && Array.isArray(st.snapshot.cols)
          ? st.snapshot
          : { sheetName: "", cols: [] },
    });
  }
  return out;
}

/**
 * Nombre por omision cuando el proyecto todavia no tiene uno: sello de fecha y
 * hora, como hasta ahora. En cuanto el usuario guarda o abre un fichero, manda
 * el nombre de ese fichero y esto deja de usarse.
 */
export function defaultProjectFileName(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `project_${d.getFullYear()}${p(d.getMonth() + 1)}${p(
    d.getDate()
  )}_${p(d.getHours())}${p(d.getMinutes())}`;
}

/**
 * Serializa el proyecto y devuelve el Blob, SIN descargarlo.
 *
 * Separado de exportProject para que quien llama pueda decidir el destino:
 * diálogo nativo con carpeta y nombre, o descarga clásica.
 */
export function buildProjectBlob(
  data: WorkbookData,
  order: string[],
  studies: SavedStudy[]
): Blob {
  const project: ProjectFile = {
    app: "mi-software-web",
    kind: "sixsigma-project",
    version: 1,
    savedAt: new Date().toISOString(),
    workbook: { data, order },
    studies,
  };

  return new Blob([JSON.stringify(project, null, 2)], {
    type: "application/json",
  });
}

/**
 * Exporta con descarga directa a la carpeta de Descargas.
 *
 * Se mantiene como camino de respaldo para navegadores sin File System Access
 * API. El camino normal es buildProjectBlob + saveBlobAs.
 */
export function exportProject(
  data: WorkbookData,
  order: string[],
  studies: SavedStudy[],
  baseName: string = defaultProjectFileName()
) {
  const blob = buildProjectBlob(data, order, studies);
  const url = URL.createObjectURL(blob);

  const fname = baseName.toLowerCase().endsWith(".sixsigma")
    ? baseName
    : `${baseName}.sixsigma`;

  const a = document.createElement("a");
  a.href = url;
  a.download = fname;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}


export function importProject(file: File): Promise<ProjectFile> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string) as ProjectFile;
        if (parsed.kind !== "sixsigma-project") {
          reject(new Error("Archivo no válido: no es un proyecto Six Sigma."));
          return;
        }
        // Un fichero de una version posterior puede traer estudios que aqui no
        // existen, o parametros con otra forma.
        if (typeof parsed.version === "number" && parsed.version > 1) {
          reject(
            new Error(
              "Este proyecto se guardó con una versión más reciente de la aplicación."
            )
          );
          return;
        }
        resolve({ ...parsed, studies: sanitizeStudies(parsed.studies) });
      } catch {
        reject(new Error("No se pudo leer el archivo (JSON inválido)."));
      }
    };
    reader.onerror = () => reject(new Error("Error leyendo el archivo."));
    reader.readAsText(file);
  });
}
