// app/app/six-sigma/components/theory/index.tsx
"use client";
import React, { useState } from "react";

export type Lang = "es" | "en";

/* ---------- símbolos ---------- */

export const SYM = {
  xbar: "\u0078\u0304",
  sigma: "\u03A3",
  minus: "\u2212",
  times: "\u00D7",
  le: "\u2264",
  ge: "\u2265",
  approx: "\u2248",
  pm: "\u00B1",
  sqrt: "\u221A",
  alpha: "\u03B1",
  kappa: "\u03BA",
  mu: "\u03BC",
  eps: "\u03B5",
  phi: "\u03A6",
  sd: "\u03C3",
  dash: "\u2014",
  ndash: "\u2013",
  lquo: "\u201C",
  rquo: "\u201D",
} as const;

/* ---------- bloques estructurales ---------- */

export const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <section className="space-y-2">
    <h3 className="font-bold text-base text-[#00674d] border-b border-gray-200 pb-1">
      {title}
    </h3>
    <div className="space-y-2 text-sm leading-relaxed">{children}</div>
  </section>
);

export const Sub2 = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-1 mt-3">
    <h4 className="font-semibold text-sm">{title}</h4>
    <div className="space-y-2">{children}</div>
  </div>
);

export const Note = ({ children }: { children: React.ReactNode }) => (
  <div className="my-2 px-3 py-2 bg-amber-50 border-l-4 border-amber-400 text-sm">
    {children}
  </div>
);

export const Formula = ({ children }: { children: React.ReactNode }) => (
  <div className="my-2 px-4 py-3 bg-gray-50 border-l-4 border-[#00674d] font-serif text-base overflow-x-auto">
    {children}
  </div>
);

/* ---------- notación matemática ---------- */

export const Frac = ({
  num,
  den,
}: {
  num: React.ReactNode;
  den: React.ReactNode;
}) => (
  <span className="inline-flex flex-col align-middle text-center mx-1">
    <span className="border-b border-gray-700 px-2 pb-0.5">{num}</span>
    <span className="px-2 pt-0.5">{den}</span>
  </span>
);

export const Sqrt = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center align-middle">
    <span className="text-lg">{SYM.sqrt}</span>
    <span className="border-t border-gray-700 pt-0.5 px-1">{children}</span>
  </span>
);

export const V = ({ children }: { children: React.ReactNode }) => (
  <span className="italic">{children}</span>
);

export const Sub = ({ children }: { children: React.ReactNode }) => (
  <sub className="text-[0.7em]">{children}</sub>
);

export const Sup = ({ children }: { children: React.ReactNode }) => (
  <sup className="text-[0.7em]">{children}</sup>
);

/** Varianza de una componente: sigma con subindice, al cuadrado. */
export const S2 = ({ children }: { children: React.ReactNode }) => (
  <>
    {SYM.sd}
    <Sub>{children}</Sub>
    {"\u00B2"}
  </>
);

/** Desviacion tipica de una componente: sigma con subindice. */
export const SD = ({ children }: { children: React.ReactNode }) => (
  <>
    {SYM.sd}
    <Sub>{children}</Sub>
  </>
);

/* ---------- tabla compacta ---------- */

export const SmallTable = ({
  head,
  rows,
}: {
  head: string[];
  rows: React.ReactNode[][];
}) => (
  <div className="overflow-x-auto">
    <table className="border-collapse text-sm my-2">
      <thead>
        <tr>
          {head.map((h) => (
            <th
              key={h}
              className="border border-gray-300 px-3 py-1 bg-gray-100 text-left font-semibold"
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            {r.map((c, j) => (
              <td key={j} className="border border-gray-300 px-3 py-1">
                {c}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/* ---------- contenedor de pagina con selector de idioma ---------- */

const SUBTITLE: Record<Lang, string> = {
  es: "Fundamento teórico, formulación y criterios de cálculo aplicados en este estudio.",
  en: "Theoretical background, formulation and computation criteria applied in this study.",
};

export function TheoryPage({
  title,
  es,
  en,
}: {
  title: React.ReactNode;
  es: React.ReactNode;
  en: React.ReactNode;
}) {
  const [lang, setLang] = useState<Lang>("es");

  const tab = (code: Lang, label: string) => (
    <button
      key={code}
      type="button"
      onClick={() => setLang(code)}
      className={`px-3 py-1 text-sm border ${
        lang === code
          ? "bg-[#00674d] text-white border-[#00674d]"
          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
      } ${code === "es" ? "rounded-l" : "rounded-r border-l-0"}`}
    >
      {label}
    </button>
  );

  return (
    <div className="max-w-4xl space-y-6 pb-8">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold">{title}</h2>
          <p className="text-sm text-gray-600">{SUBTITLE[lang]}</p>
        </div>
        <div className="shrink-0 flex">
          {tab("es", "ES")}
          {tab("en", "EN")}
        </div>
      </header>

      {lang === "es" ? es : en}
    </div>
  );
}
