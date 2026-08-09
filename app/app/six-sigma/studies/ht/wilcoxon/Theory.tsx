// app/app/six-sigma/studies/ht/wilcoxon/Theory.tsx
"use client";
import React from "react";
import Section from "../../../components/Section";

const V = ({ children }: { children: React.ReactNode }) => (
  <span className="italic">{children}</span>
);
const Sub = ({ children }: { children: React.ReactNode }) => (
  <sub className="text-[0.8em]">{children}</sub>
);

const ETA = "\u03b7";
const NE = "\u2260";
const SUM = "\u03a3";

export default function HTWilcoxonTheory({ lang }: { lang: "es" | "en" }) {
  if (lang === "es") {
    return (
      <div className="space-y-4 text-sm leading-relaxed text-gray-700">
        <Section title={"Qu\u00e9 contrasta"}>
          Compara la mediana de una poblaci\u00f3n con un valor de referencia{" "}
          <V>{ETA}</V>
          <Sub>0</Sub>. Es la alternativa no param\u00e9trica al t de una
          muestra: no exige normalidad, solo que la distribuci\u00f3n sea{" "}
          <b>sim\u00e9trica</b> alrededor de su mediana.
        </Section>

        <Section title={"C\u00f3mo funciona"}>
          Calcula las diferencias <V>d</V>
          <Sub>i</Sub> = <V>x</V>
          <Sub>i</Sub> {"\u2212"} <V>{ETA}</V>
          <Sub>0</Sub>, descarta las nulas, ordena los valores absolutos y les
          asigna rangos. El estad\u00edstico <V>W</V>
          <Sup>+</Sup> es la suma de los rangos que corresponden a diferencias
          positivas. Si la mediana real fuese {ETA}
          <Sub>0</Sub>, las diferencias positivas y negativas se repartir\u00edan
          por igual y <V>W</V>
          <Sup>+</Sup> valdr\u00eda <V>n</V>(<V>n</V>+1)/4.
        </Section>

        <Section title={"Estad\u00edstico de contraste"}>
          <div className="my-2 rounded bg-gray-50 px-3 py-2 font-mono text-xs">
            <V>W</V>
            <Sup>+</Sup> = {SUM} rango(|<V>d</V>
            <Sub>i</Sub>|) sobre <V>d</V>
            <Sub>i</Sub> &gt; 0
            <br />
            <V>z</V> = (<V>W</V>
            <Sup>+</Sup> {"\u2212"} <V>n</V>(<V>n</V>+1)/4) / {"\u221a"}Var
            <br />
            Var = <V>n</V>(<V>n</V>+1)(2<V>n</V>+1)/24 {"\u2212"} {SUM}(
            <V>t</V>
            <Sup>3</Sup>{"\u2212"}
            <V>t</V>)/48
          </div>
          El segundo t\u00e9rmino corrige los empates en |<V>d</V>
          <Sub>i</Sub>|, donde <V>t</V> es el tama\u00f1o de cada grupo empatado.
        </Section>

        <Section title={"La columna Median"}>
          No es la mediana muestral, sino el <b>estimador de Hodges-Lehmann</b>:
          la mediana de los <V>n</V>(<V>n</V>+1)/2 promedios de Walsh (
          <V>x</V>
          <Sub>i</Sub>+<V>x</V>
          <Sub>j</Sub>)/2 con <V>i</V> {"\u2264"} <V>j</V>. Es el estimador
          puntual coherente con el contraste, y en distribuciones asim\u00e9tricas
          difiere claramente de la mediana simple.
        </Section>

        <Section title={"Interpretaci\u00f3n"}>
          Con <V>p</V> menor que el nivel de significaci\u00f3n se rechaza que la
          mediana valga {ETA}
          <Sub>0</Sub>. La alternativa bilateral contrasta {ETA} {NE} {ETA}
          <Sub>0</Sub>; las unilaterales, &lt; o &gt;.
        </Section>

        <Section title={"Cu\u00e1ndo no usarlo"}>
          Si la distribuci\u00f3n es marcadamente asim\u00e9trica, la hip\u00f3tesis
          de simetr\u00eda falla y el contraste pierde validez: en ese caso el{" "}
          <b>signo</b> (sign test) es m\u00e1s robusto, aunque menos potente.
        </Section>
      </div>
    );
  }

  return (
    <div className="space-y-4 text-sm leading-relaxed text-gray-700">
      <Section title="What it tests">
        Compares a population median against a reference value <V>{ETA}</V>
        <Sub>0</Sub>. It is the nonparametric counterpart of the one-sample t:
        it does not require normality, only that the distribution be{" "}
        <b>symmetric</b> about its median.
      </Section>

      <Section title="How it works">
        It computes the differences <V>d</V>
        <Sub>i</Sub> = <V>x</V>
        <Sub>i</Sub> {"\u2212"} <V>{ETA}</V>
        <Sub>0</Sub>, drops the zeros, ranks the absolute values and sums the
        ranks of the positive differences into <V>W</V>
        <Sup>+</Sup>.
      </Section>

      <Section title="Test statistic">
        <div className="my-2 rounded bg-gray-50 px-3 py-2 font-mono text-xs">
          <V>W</V>
          <Sup>+</Sup> = {SUM} rank(|<V>d</V>
          <Sub>i</Sub>|) over <V>d</V>
          <Sub>i</Sub> &gt; 0
          <br />
          <V>z</V> = (<V>W</V>
          <Sup>+</Sup> {"\u2212"} <V>n</V>(<V>n</V>+1)/4) / {"\u221a"}Var
        </div>
      </Section>

      <Section title="The Median column">
        It is not the sample median but the <b>Hodges-Lehmann estimator</b>: the
        median of the <V>n</V>(<V>n</V>+1)/2 Walsh averages (<V>x</V>
        <Sub>i</Sub>+<V>x</V>
        <Sub>j</Sub>)/2 with <V>i</V> {"\u2264"} <V>j</V>.
      </Section>

      <Section title="Interpretation">
        A <V>p</V>-value below the significance level rejects the hypothesis
        that the median equals {ETA}
        <Sub>0</Sub>.
      </Section>
    </div>
  );
}

const Sup = ({ children }: { children: React.ReactNode }) => (
  <sup className="text-[0.8em]">{children}</sup>
);
