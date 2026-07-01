// app/app/six-sigma/lib/project.ts
import type { WorkbookData } from "./types";

export interface ProjectFile {
  app: "mi-software-web";
  kind: "sixsigma-project";
  version: 1;
  savedAt: string;
  workbook: {
    data: WorkbookData;
    order: string[];
  };
  studies: unknown[];
}

export function exportProject(
  data: WorkbookData,
  order: string[],
  studies: unknown[]
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
        resolve(parsed);
      } catch {
        reject(new Error("No se pudo leer el archivo (JSON inválido)."));
      }
    };
    reader.onerror = () => reject(new Error("Error leyendo el archivo."));
    reader.readAsText(file);
  });
}
