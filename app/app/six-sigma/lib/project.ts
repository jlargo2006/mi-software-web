// app/app/six-sigma/lib/project.ts
import type { WorkbookData } from "./types";
import type { SavedStudy } from "./studies";
// El registro de definiciones, indexado por id de estudio.
import { REGISTRY } from "../studies/_registry";

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
    out.push({
      id: st.id,
      type: st.type,
      name: typeof st.name === "string" ? st.name : st.type,
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

export function exportProject(
  data: WorkbookData,
  order: string[],
  studies: SavedStudy[]
) {
  const project: ProjectFile = {
    app: "mi-software-web",
    kind: "sixsigma-project",
    version: 1,
    savedAt: new Date().toISOString(),
    workbook: { data, order },
    studies,
  };

  const blob = new Blob([JSON.stringify(project, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);

  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  const fname = `project_${d.getFullYear()}${p(d.getMonth() + 1)}${p(
    d.getDate()
  )}_${p(d.getHours())}${p(d.getMinutes())}.sixsigma`;

  const a = document.createElement("a");
  a.href = url;
  a.download = fname;
  a.click();
  URL.revokeObjectURL(url);
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
