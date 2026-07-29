// app/app/six-sigma/studies/ht/onesamplet/Theory.tsx
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

const Sqrt = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center align-middle">
    <span className="text-lg">{"\u221A"}</span>
    <span className="border-t border-gray-700 pt-0.5 px-1">{children}</span>
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

const MU = "\u03BC";
const ALPHA = "\u03B1";
const NEQ = "\u2260";
const PM = "\u00B1";
const XBAR = "x\u0304";

const FormulaT = () => (
  <Formula>
    <V>t</V> ={" "}
    <Frac
      num={<>{XBAR} {"\u2212"} {MU}<Sub>0</Sub></>}
      den={<>SE(<V>x</V>)</>}
    />
    <span className="mx-4">
      SE(<V>x</V>) = <Frac num={<><V>s</V></>} den={<Sqrt><V>n</V></Sqrt>} />
    </span>
    <span className="mx-4">df = <V>n</V> {"\u2212"} 1</span>
  </Formula>
);

const FormulaCI = () => (
  <Formula>
    <div className="space-y-3">
      <div>
        {MU} {"\u2208"} {XBAR} {PM} <V>t</V>
        <Sub>1{"\u2212"}{ALPHA}/2, <V>n</V>{"\u2212"}1</Sub> {"\u00B7"} SE(<V>x</V>)
      </div>
      <div>
        {"\u2265"} {XBAR} {"\u2212"} <V>t</V>
        <Sub>1{"\u2212"}{ALPHA}, <V>n</V>{"\u2212"}1</Sub> {"\u00B7"} SE(<V>x</V>)
      </div>
      <div>
        {"\u2264"} {XBAR} + <V>t</V>
        <Sub>1{"\u2212"}{ALPHA}, <V>n</V>{"\u2212"}1</Sub> {"\u00B7"} SE(<V>x</V>)
      </div>
    </div>
  </Formula>
);

const ES = () => (
  <div className="space-y-5">
    <Section title="Qué contrasta">
      <p>
        El test <V>t</V> de una muestra compara la media de una población con un valor
        de referencia {MU}<Sub>0</Sub>. Se usa cuando la desviación estándar de la
        población es desconocida y se estima con la muestra: por eso el estadístico
        sigue una distribución <V>t</V> de Student y no una normal.
      </p>
      <p>
        H{"\u2080"}: {MU} = {MU}<Sub>0</Sub> frente a H{"\u2081"}: {MU} {NEQ}{" "}
        {MU}<Sub>0</Sub> (bilateral), o {"<"} / {">"} en los casos unilaterales.
      </p>
    </Section>

    <Section title="Estadístico de contraste">
      <FormulaT />
      <p>
        <V>s</V> es la desviación estándar muestral con <V>n</V>{"\u2212"}1 en el
        denominador. El <V>p</V>-valor es el área de la cola (o de las dos colas, con
        el valor absoluto) de la <V>t</V> con <V>n</V>{"\u2212"}1 grados de libertad.
      </p>
    </Section>

    <Section title="Intervalo y cotas de confianza">
      <FormulaCI />
      <p>
        Con hipótesis bilateral se muestra un intervalo de dos lados. Con hipótesis
        unilateral se muestra una única cota, en el mismo sentido que H{"\u2081"}:
        cota inferior si H{"\u2081"} es {">"}, cota superior si es {"<"}.
      </p>
    </Section>

    <Section title="Supuestos">
      <ul className="list-disc pl-5 space-y-1">
        <li>Observaciones independientes.</li>
        <li>
          Datos aproximadamente normales. Con <V>n</V> {"\u2265"} 20{"\u201330"} el
          test es robusto frente a desviaciones moderadas.
        </li>
        <li>Sin valores atípicos que dominen la media y la desviación.</li>
      </ul>
      <Note>
        Las tres gráficas del informe sirven para verificar esto: el histograma y el
        diagrama de caja revelan asimetría y atípicos, y el gráfico de valores
        individuales muestra cada observación cuando <V>n</V> es pequeño.
      </Note>
    </Section>

    <Section title="Ejemplo resuelto">
      <p>
        Nueve mediciones, {MU}<Sub>0</Sub> = 5, {ALPHA} = 0,05, bilateral:
      </p>
      <p className="font-mono text-xs">
        {XBAR} = 4,7889 · <V>s</V> = 0,2472 · SE = 0,2472/{"\u221A"}9 = 0,0824
      </p>
      <p className="font-mono text-xs">
        <V>t</V> = (4,7889 {"\u2212"} 5)/0,0824 = {"\u2212"}2,56 · df = 8 ·{" "}
        <V>p</V> = 0,034
      </p>
      <p className="font-mono text-xs">
        IC 95%: 4,7889 {PM} 2,306 {"\u00B7"} 0,0824 = (4,5989; 4,9789)
      </p>
      <p>
        Como <V>p</V> = 0,034 {"<"} 0,05 se rechaza H{"\u2080"}: la media difiere de 5.
        Coherente con que el intervalo no contenga el valor 5.
      </p>
    </Section>
  </div>
);

const EN = () => (
  <div className="space-y-5">
    <Section title="What it tests">
      <p>
        The one-sample <V>t</V> test compares a population mean against a reference
        value {MU}<Sub>0</Sub>. It applies when the population standard deviation is
        unknown and estimated from the sample, so the statistic follows a Student{" "}
        <V>t</V> distribution rather than a normal one.
      </p>
      <p>
        H{"\u2080"}: {MU} = {MU}<Sub>0</Sub> against H{"\u2081"}: {MU} {NEQ}{" "}
        {MU}<Sub>0</Sub> (two-sided), or {"<"} / {">"} for one-sided cases.
      </p>
    </Section>

    <Section title="Test statistic">
      <FormulaT />
      <p>
        <V>s</V> is the sample standard deviation with <V>n</V>{"\u2212"}1 in the
        denominator. The <V>p</V>-value is the tail area (or both tails, using the
        absolute value) of the <V>t</V> distribution with <V>n</V>{"\u2212"}1 degrees
        of freedom.
      </p>
    </Section>

    <Section title="Confidence interval and bounds">
      <FormulaCI />
      <p>
        A two-sided hypothesis yields a two-sided interval. A one-sided hypothesis
        yields a single bound in the direction of H{"\u2081"}: a lower bound when
        H{"\u2081"} is {">"}, an upper bound when it is {"<"}.
      </p>
    </Section>

    <Section title="Assumptions">
      <ul className="list-disc pl-5 space-y-1">
        <li>Independent observations.</li>
        <li>
          Approximately normal data. For <V>n</V> {"\u2265"} 20{"\u201330"} the test
          is robust to moderate departures.
        </li>
        <li>No outliers dominating the mean and standard deviation.</li>
      </ul>
      <Note>
        The three graphs in the report support these checks: histogram and boxplot
        expose skewness and outliers, while the individual value plot shows every
        observation when <V>n</V> is small.
      </Note>
    </Section>

    <Section title="Worked example">
      <p>
        Nine measurements, {MU}<Sub>0</Sub> = 5, {ALPHA} = 0.05, two-sided:
      </p>
      <p className="font-mono text-xs">
        {XBAR} = 4.7889 · <V>s</V> = 0.2472 · SE = 0.2472/{"\u221A"}9 = 0.0824
      </p>
      <p className="font-mono text-xs">
        <V>t</V> = (4.7889 {"\u2212"} 5)/0.0824 = {"\u2212"}2.56 · df = 8 ·{" "}
        <V>p</V> = 0.034
      </p>
      <p className="font-mono text-xs">
        95% CI: 4.7889 {PM} 2.306 {"\u00B7"} 0.0824 = (4.5989, 4.9789)
      </p>
      <p>
        Since <V>p</V> = 0.034 {"<"} 0.05, reject H{"\u2080"}: the mean differs from 5.
        Consistent with the interval excluding the value 5.
      </p>
    </Section>
  </div>
);

export default function HT1SampleTTheory() {
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
