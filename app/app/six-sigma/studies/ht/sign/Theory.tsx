// app/app/six-sigma/studies/ht/sign/Theory.tsx
"use client";
import React, { useState } from "react";

type Lang = "es" | "en";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="space-y-2">
    <h3 className="font-bold text-base text-[#00674d] border-b border-gray-200 pb-1">
      {title}
    </h3>
    <div className="space-y-2 text-sm leading-relaxed">{children}</div>
  </section>
);

const Formula = ({ children }: { children: React.ReactNode }) => (
  <div className="my-2 px-4 py-3 bg-gray-50 border-l-4 border-[#00674d] font-serif text-base overflow-x-auto">
    {children}
  </div>
);

const Frac = ({ num, den }: { num: React.ReactNode; den: React.ReactNode }) => (
  <span className="inline-flex flex-col align-middle text-center mx-1">
    <span className="border-b border-gray-700 px-2 pb-0.5">{num}</span>
    <span className="px-2 pt-0.5">{den}</span>
  </span>
);

const V = ({ children }: { children: React.ReactNode }) => (
  <span className="italic">{children}</span>
);
const Sub = ({ children }: { children: React.ReactNode }) => (
  <sub className="text-[0.7em]">{children}</sub>
);
const Note = ({ children }: { children: React.ReactNode }) => (
  <div className="my-2 px-3 py-2 bg-amber-50 border-l-4 border-amber-400 text-sm">
    {children}
  </div>
);

const ETA = "\u03B7";
const ALPHA = "\u03B1";
const NEQ = "\u2260";
const LAMBDA = "\u03BB";
const LE = "\u2264";

const FormulaS = () => (
  <Formula>
    <V>S</V> = #{"{"} <V>x</V><Sub><V>i</V></Sub> {">"} {ETA}<Sub>0</Sub> {"}"}
    <span className="mx-4">
      <V>S</V> ~ Bin(<V>n</V>{"'"}, 1/2) bajo H{"\u2080"}
    </span>
  </Formula>
);

const FormulaCI = () => (
  <Formula>
    <div className="space-y-3">
      <div>
        IC = ( <V>x</V><Sub>(<V>k</V>)</Sub> , <V>x</V><Sub>(<V>n</V>+1{"\u2212"}<V>k</V>)</Sub> )
        <span className="mx-3">
          {"\u03B3"}(<V>k</V>) = 1 {"\u2212"} 2 P(<V>S</V> {LE} <V>k</V>{"\u2212"}1)
        </span>
      </div>
      <div>
        {LAMBDA} ={" "}
        <Frac
          num={<>(<V>n</V>{"\u2212"}<V>k</V>)({"\u03B3"}<Sub>2</Sub>{"\u2212"}{"\u03B3"})</>}
          den={
            <>
              <V>k</V>({"\u03B3"}{"\u2212"}{"\u03B3"}<Sub>1</Sub>) + (<V>n</V>
              {"\u2212"}<V>k</V>)({"\u03B3"}<Sub>2</Sub>{"\u2212"}{"\u03B3"})
            </>
          }
        />
      </div>
    </div>
  </Formula>
);

const ES = () => (
  <div className="space-y-5">
    <Section title="Qué contrasta">
      <p>
        El test del signo compara la mediana de una poblaci&oacute;n con un valor
        de referencia {ETA}<Sub>0</Sub>. Es el contraste no param&eacute;trico{" "}
        <strong>m&aacute;s d&eacute;bil en supuestos</strong>: solo necesita que
        las observaciones sean independientes y que la variable sea continua.
      </p>
      <p>
        H{"\u2080"}: {ETA} = {ETA}<Sub>0</Sub> frente a H{"\u2081"}: {ETA} {NEQ}{" "}
        {ETA}<Sub>0</Sub>, o {"<"} / {">"} en los casos unilaterales.
      </p>
      <p>
        No exige simetr&iacute;a, y ah&iacute; est&aacute; su ventaja sobre
        Wilcoxon: cuando la distribuci&oacute;n es marcadamente asim&eacute;trica,
        este es el contraste v&aacute;lido.
      </p>
    </Section>

    <Section title="Cómo funciona">
      <FormulaS />
      <p>
        Solo se mira el <strong>signo</strong> de cada desviaci&oacute;n respecto a{" "}
        {ETA}<Sub>0</Sub>, descartando por completo su magnitud. Se cuenta cu&aacute;ntas
        observaciones quedan por encima; si la mediana real fuese {ETA}<Sub>0</Sub>,
        cada observaci&oacute;n caer&iacute;a arriba o abajo con probabilidad 1/2.
      </p>
      <p>
        El p-valor es por tanto <strong>binomial exacto</strong>, sin ninguna
        aproximaci&oacute;n: no hay estad&iacute;stico continuo que tipificar.
      </p>
      <Note>
        Las observaciones exactamente iguales a {ETA}<Sub>0</Sub> no tienen signo y
        se excluyen. El informe las muestra en la columna <em>Number =</em>, y{" "}
        <V>n</V>{"'"} es el total menos esos empates.
      </Note>
    </Section>

    <Section title="Intervalo de confianza">
      <FormulaCI />
      <p>
        El intervalo se construye directamente con <strong>estad&iacute;sticos de
        orden</strong>: los valores en las posiciones <V>k</V> y <V>n</V>+1
        {"\u2212"}<V>k</V> de la muestra ordenada. Su cobertura es binomial y por
        tanto <strong>discreta</strong>: solo existe un conjunto finito de niveles
        alcanzables.
      </p>
      <p>
        Por eso el informe muestra tres filas: el intervalo alcanzable justo por
        debajo del nivel pedido, el interpolado, y el alcanzable justo por encima.
        La interpolaci&oacute;n es la <strong>no lineal de
        Hettmansperger-Sheather</strong>, que pondera con {LAMBDA} seg&uacute;n la
        f&oacute;rmula anterior y no como una simple regla de tres.
      </p>
      <Note>
        La columna <em>Position</em> indica qu&eacute; par de estad&iacute;sticos de
        orden delimita cada intervalo. La fila interpolada no corresponde a
        ninguna posici&oacute;n concreta y por eso se rotula{" "}
        <em>Interpolation</em>.
      </Note>
    </Section>

    <Section title="Frente a Wilcoxon">
      <ul className="list-disc pl-5 space-y-1">
        <li>
          El test del signo usa <strong>solo el signo</strong>; Wilcoxon usa signo
          y rango. Descartar la magnitud cuesta potencia.
        </li>
        <li>
          Con datos normales la eficiencia del signo es de aproximadamente 2/{"\u03C0"}{" "}
          {"\u2248"} 64% frente al test <V>t</V>; Wilcoxon ronda el 95%.
        </li>
        <li>
          A cambio, el signo es v&aacute;lido con cualquier forma de
          distribuci&oacute;n y es extremadamente robusto a at&iacute;picos: mover un
          valor extremo no altera su signo.
        </li>
        <li>
          La columna <em>Median</em> aqu&iacute; es la <strong>mediana
          muestral</strong>, no el estimador de Hodges-Lehmann que aparece en
          Wilcoxon. Cada contraste lleva su propio estimador puntual.
        </li>
      </ul>
    </Section>

    <Section title="Ejemplo resuelto">
      <p>
        Los mismos 500 datos asim&eacute;tricos a la derecha, contrastados frente a{" "}
        {ETA}<Sub>0</Sub> = 63, {ALPHA} = 0,05, bilateral:
      </p>
      <p className="font-mono text-xs">
        N = 500 {"\u00b7"} Number {"<"} 63: 37 {"\u00b7"} Number = 63: 0 {"\u00b7"}{" "}
        Number {">"} 63: 463
      </p>
      <p className="font-mono text-xs">
        p = 2 P(<V>S</V> {LE} 37 | Bin(500; 0,5)) = 0,000 {"\u00b7"} Mediana = 65,6953
      </p>
      <p>
        Con 463 de 500 observaciones por encima de 63, el desequilibrio de signos
        es abrumador y se rechaza H{"\u2080"} sin necesidad de mirar magnitudes.
      </p>
      <p className="font-mono text-xs">
        IC 95%: (65,2969; 66,4969) al 94,55% {"\u2192"} posiciones (229; 272)
      </p>
      <p className="font-mono text-xs">
        {LAMBDA} = 0,6083 {"\u2192"} interpolado (65,2604; 66,5013) al 95,00%
      </p>
      <p className="font-mono text-xs">
        IC 95%: (65,2038; 66,5081) al 95,58% {"\u2192"} posiciones (228; 273)
      </p>
      <Note>
        Ninguna pareja de estad&iacute;sticos de orden da exactamente el 95%: el
        salto va del 94,55% al 95,58%. Esa es la discretizaci&oacute;n que la
        interpolaci&oacute;n suaviza.
      </Note>
    </Section>

    <Section title="Cuándo usarlo">
      <p>
        Como contraste de respaldo cuando la asimetr&iacute;a invalida a Wilcoxon,
        con muestras muy peque&ntilde;as donde no puede juzgarse la forma, o con
        datos ordinales en los que las distancias entre valores no son
        interpretables.
      </p>
    </Section>
  </div>
);

const EN = () => (
  <div className="space-y-5">
    <Section title="What it tests">
      <p>
        The sign test compares a population median against a reference value {ETA}
        <Sub>0</Sub>. It has the <strong>weakest assumptions</strong> of the
        nonparametric location tests: independence and a continuous variable.
      </p>
      <p>
        H{"\u2080"}: {ETA} = {ETA}<Sub>0</Sub> against H{"\u2081"}: {ETA} {NEQ}{" "}
        {ETA}<Sub>0</Sub>, or {"<"} / {">"} for one-sided cases. Unlike Wilcoxon it
        does <strong>not</strong> require symmetry, which is exactly why it
        survives strongly skewed data.
      </p>
    </Section>

    <Section title="How it works">
      <FormulaS />
      <p>
        Only the <strong>sign</strong> of each deviation from {ETA}<Sub>0</Sub>{" "}
        matters; magnitude is discarded entirely. Under the null each observation
        falls above or below with probability 1/2, so the p-value is{" "}
        <strong>exact binomial</strong> with no approximation involved.
      </p>
      <Note>
        Observations exactly equal to {ETA}<Sub>0</Sub> carry no sign and are
        excluded; the report lists them under <em>Number =</em>.
      </Note>
    </Section>

    <Section title="Confidence interval">
      <FormulaCI />
      <p>
        The interval is built straight from <strong>order statistics</strong>, so
        its coverage is binomial and therefore <strong>discrete</strong>: only a
        finite set of confidence levels is reachable.
      </p>
      <p>
        The report shows the reachable interval just below the requested level,
        the interpolated one, and the reachable interval just above. The
        interpolation is the <strong>nonlinear Hettmansperger-Sheather</strong>{" "}
        rule, not a plain linear blend.
      </p>
    </Section>

    <Section title="Against Wilcoxon">
      <ul className="list-disc pl-5 space-y-1">
        <li>
          The sign test uses <strong>only signs</strong>; Wilcoxon uses signs and
          ranks. Dropping magnitude costs power.
        </li>
        <li>
          On normal data its efficiency is about 2/{"\u03C0"} {"\u2248"} 64% relative
          to the <V>t</V> test, versus roughly 95% for Wilcoxon.
        </li>
        <li>
          In exchange it is valid for any distribution shape and extremely robust:
          moving an extreme value does not change its sign.
        </li>
        <li>
          The <em>Median</em> column here is the <strong>sample median</strong>,
          not the Hodges-Lehmann estimator shown by Wilcoxon.
        </li>
      </ul>
    </Section>

    <Section title="Worked example">
      <p>
        The same 500 right-skewed observations against {ETA}<Sub>0</Sub> = 63,{" "}
        {ALPHA} = 0.05, two-sided:
      </p>
      <p className="font-mono text-xs">
        N = 500 {"\u00b7"} below 63: 37 {"\u00b7"} equal: 0 {"\u00b7"} above 63: 463{" "}
        {"\u00b7"} p = 0.000
      </p>
      <p className="font-mono text-xs">
        Median = 65.6953 {"\u00b7"} 94.55% (65.2969; 66.4969) at positions (229; 272)
      </p>
      <p className="font-mono text-xs">
        {LAMBDA} = 0.6083 {"\u2192"} 95.00% (65.2604; 66.5013) by interpolation
      </p>
      <p className="font-mono text-xs">
        95.58% (65.2038; 66.5081) at positions (228; 273)
      </p>
      <p>
        With 463 of 500 observations above 63 the sign imbalance is overwhelming
        and H{"\u2080"} is rejected without looking at magnitudes.
      </p>
    </Section>

    <Section title="When to use it">
      <p>
        As a fallback when skewness invalidates Wilcoxon, with very small samples
        where distributional shape cannot be judged, or with ordinal data where
        distances between values are not meaningful.
      </p>
    </Section>
  </div>
);

export default function HTSignTheory() {
  const [lang, setLang] = useState<Lang>("es");

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-1">
        {(["es", "en"] as Lang[]).map((l) => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={`px-3 py-1 text-xs rounded border ${
              lang === l
                ? "bg-[#00674d] text-white border-[#00674d]"
                : "bg-white text-gray-600 border-gray-300"
            }`}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>
      {lang === "es" ? <ES /> : <EN />}
    </div>
  );
}
