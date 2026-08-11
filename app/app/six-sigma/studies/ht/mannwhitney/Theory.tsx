// app/app/six-sigma/studies/ht/mannwhitney/Theory.tsx
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
const Sup = ({ children }: { children: React.ReactNode }) => (
  <sup className="text-[0.7em]">{children}</sup>
);
const Note = ({ children }: { children: React.ReactNode }) => (
  <div className="my-2 px-3 py-2 bg-amber-50 border-l-4 border-amber-400 text-sm">
    {children}
  </div>
);

const ETA = "\u03B7";
const ALPHA = "\u03B1";
const NEQ = "\u2260";
const SUM = "\u2211";
const MINUS = "\u2212";
const TIMES = "\u00D7";

const FormulaW = () => (
  <Formula>
    <V>W</V> = {SUM} <V>R</V><Sub><V>i</V></Sub> (rangos de la muestra 1 en la
    combinada)
    <div className="mt-2">
      E[<V>W</V>] = <Frac num={<><V>n</V><Sub>1</Sub>(<V>N</V>+1)</>} den={<>2</>} />
      <span className="mx-4">
        <V>U</V> = <V>W</V> {MINUS}{" "}
        <Frac num={<><V>n</V><Sub>1</Sub>(<V>n</V><Sub>1</Sub>+1)</>} den={<>2</>} />
      </span>
    </div>
  </Formula>
);

const FormulaZ = () => (
  <Formula>
    <div className="space-y-3">
      <div>
        Var[<V>W</V>] ={" "}
        <Frac num={<><V>n</V><Sub>1</Sub><V>n</V><Sub>2</Sub></>} den={<>12</>} />
        <span className="mx-1">
          ( <V>N</V>+1 {MINUS}{" "}
          <Frac
            num={<>{SUM}(<V>t</V><Sup>3</Sup>{MINUS}<V>t</V>)</>}
            den={<><V>N</V>(<V>N</V>{MINUS}1)</>}
          />
          {" "})
        </span>
      </div>
      <div>
        <V>z</V> ={" "}
        <Frac
          num={<><V>W</V> {MINUS} E[<V>W</V>] {"\u00B1"} 0,5</>}
          den={<Sqrt>Var[<V>W</V>]</Sqrt>}
        />
      </div>
    </div>
  </Formula>
);

const FormulaHL = () => (
  <Formula>
    {"\u0394"}{"\u0302"} = mediana {"{"} <V>x</V><Sub><V>i</V></Sub> {MINUS}{" "}
    <V>y</V><Sub><V>j</V></Sub> : <V>i</V> = 1..<V>n</V><Sub>1</Sub>, <V>j</V> =
    1..<V>n</V><Sub>2</Sub> {"}"}
  </Formula>
);

const ES = () => (
  <div className="space-y-5">
    <Section title="Qué contrasta">
      <p>
        El test de Mann-Whitney compara la <strong>localizaci&oacute;n de dos
        muestras independientes</strong>. Es la alternativa no param&eacute;trica
        al test <V>t</V> de dos muestras, y equivale al test de la suma de rangos
        de Wilcoxon.
      </p>
      <p>
        H{"\u2080"}: {ETA}<Sub>1</Sub> {MINUS} {ETA}<Sub>2</Sub> = {"\u0394"}
        <Sub>0</Sub> frente a H{"\u2081"}: {ETA}<Sub>1</Sub> {MINUS} {ETA}
        <Sub>2</Sub> {NEQ} {"\u0394"}<Sub>0</Sub>, o {"<"} / {">"} en los casos
        unilaterales.
      </p>
      <Note>
        El supuesto clave no es la normalidad sino que ambas distribuciones tengan{" "}
        <strong>la misma forma y dispersi&oacute;n</strong>, difiriendo solo en un
        desplazamiento. Si las varianzas son muy distintas, un resultado
        significativo puede deberse a la forma y no a la localizaci&oacute;n.
      </Note>
    </Section>

    <Section title="Cómo funciona">
      <FormulaW />
      <p>
        Se mezclan las dos muestras, se ordenan y se asignan rangos al conjunto.{" "}
        <V>W</V> es la <strong>suma de los rangos de la primera muestra</strong>.
        Si ambas poblaciones tuviesen la misma mediana, los rangos altos y bajos se
        repartir&iacute;an por igual y <V>W</V> valdr&iacute;a{" "}
        <V>n</V><Sub>1</Sub>(<V>N</V>+1)/2.
      </p>
      <Note>
        Minitab informa <V>W</V>, la suma de rangos, no el estad&iacute;stico{" "}
        <V>U</V> de Mann-Whitney. Ambos son equivalentes y se convierten con la
        f&oacute;rmula anterior, pero producen cifras distintas: no hay que
        confundirlos al comparar con otros programas.
      </Note>
      <p>
        Con {"\u0394"}<Sub>0</Sub> distinto de cero se desplaza la primera muestra
        antes de mezclar, de modo que el contraste siempre se reduce al caso nulo.
      </p>
    </Section>

    <Section title="Distribución del estadístico">
      <FormulaZ />
      <p>
        El t&eacute;rmino que se resta en la varianza corrige los{" "}
        <strong>empates</strong> en la muestra combinada, donde <V>t</V> es el
        tama&ntilde;o de cada grupo empatado. El {"\u00B1"}0,5 del numerador es la{" "}
        <strong>correcci&oacute;n de continuidad</strong>: acerca <V>W</V> a su
        media en media unidad, porque se aproxima una distribuci&oacute;n discreta
        mediante una continua.
      </p>
      <Note>
        Cuando hay empates el informe muestra <strong>dos filas</strong>: el
        p-valor sin corregir y el corregido. Suelen diferir muy poco, y el
        segundo es el que debe usarse. Sin empates ambos coinciden y solo se
        muestra una fila.
      </Note>      
      <p>
        Con muestras moderadas o grandes la aproximaci&oacute;n normal es muy
        buena. Con muestras muy peque&ntilde;as conviene recurrir a la
        distribuci&oacute;n exacta.
      </p>
    </Section>

    <Section title="Estimación de la diferencia">
      <FormulaHL />
      <p>
        La diferencia que aparece en el informe es el{" "}
        <strong>estimador de Hodges-Lehmann de dos muestras</strong>: la mediana de{" "}
        <strong>todas</strong> las <V>n</V><Sub>1</Sub>{TIMES}<V>n</V><Sub>2</Sub>{" "}
        diferencias entre pares de observaciones de una y otra muestra.
      </p>
      <Note>
        No es la diferencia de las medianas. En el ejemplo de abajo la diferencia de
        medianas vale {MINUS}1,5049 mientras el estimador da {MINUS}1,60358.
        Confundirlos es el error m&aacute;s com&uacute;n al replicar esta tabla.
      </Note>
      <p>
        El intervalo se obtiene recortando <V>k</V> de esas diferencias ordenadas
        por cada cola. Como su n&uacute;mero es finito, la{" "}
        <strong>confianza alcanzada</strong> rara vez coincide con la pedida: por eso
        el informe muestra ambas.
      </p>
    </Section>

    <Section title="Frente al test t">
      <ul className="list-disc pl-5 space-y-1">
        <li>
          No exige normalidad y es robusto a at&iacute;picos, porque solo usa el
          orden de los datos.
        </li>
        <li>
          Con datos normales conserva cerca del 95% de la eficiencia del test{" "}
          <V>t</V>: un precio bajo por la robustez.
        </li>
        <li>
          S&iacute; exige igualdad de forma y dispersi&oacute;n, mientras que el{" "}
          <V>t</V> de Welch tolera varianzas desiguales. No es un contraste libre de
          supuestos.
        </li>
      </ul>
    </Section>

    <Section title="Ejemplo resuelto">
      <p>
        Dos m&aacute;quinas con 200 observaciones cada una, {ALPHA} = 0,05,
        bilateral:
      </p>
      <p className="font-mono text-xs">
        N{"\u2081"} = 200 {"\u00b7"} N{"\u2082"} = 200 {"\u00b7"} N = 400 {"\u00b7"}{" "}
        E[<V>W</V>] = 200{"\u00b7"}401/2 = 40100
      </p>
      <p className="font-mono text-xs">
        <V>W</V> = 36509,00 {"\u00b7"} <V>z</V> = {MINUS}3,097 {"\u00b7"} <V>p</V> =
        0,002
      </p>
      <p className="font-mono text-xs">
        Medianas: 14,8411 y 16,3460 {"\u00b7"} Hodges-Lehmann = {MINUS}1,60358
      </p>
      <p className="font-mono text-xs">
        IC 95%: ({MINUS}2,63498; {MINUS}0,593951) al 95,01%
      </p>
      <p>
        <V>W</V> queda 3591 unidades por debajo de su valor esperado: la primera
        m&aacute;quina produce valores sistem&aacute;ticamente menores. Se rechaza H
        {"\u2080"}, y el intervalo no contiene el cero, lo que confirma la
        conclusi&oacute;n.
      </p>
    </Section>
  </div>
);

const EN = () => (
  <div className="space-y-5">
    <Section title="What it tests">
      <p>
        The Mann-Whitney test compares the <strong>location of two independent
        samples</strong>. It is the nonparametric counterpart of the two-sample{" "}
        <V>t</V> test and is equivalent to the Wilcoxon rank-sum test.
      </p>
      <p>
        H{"\u2080"}: {ETA}<Sub>1</Sub> {MINUS} {ETA}<Sub>2</Sub> = {"\u0394"}
        <Sub>0</Sub> against H{"\u2081"}: {ETA}<Sub>1</Sub> {MINUS} {ETA}
        <Sub>2</Sub> {NEQ} {"\u0394"}<Sub>0</Sub>, or {"<"} / {">"} one-sided.
      </p>
      <Note>
        The key assumption is not normality but that both distributions share{" "}
        <strong>the same shape and spread</strong>, differing only by a shift.
        With very unequal variances a significant result may reflect shape rather
        than location.
      </Note>
    </Section>

    <Section title="How it works">
      <FormulaW />
      <p>
        Both samples are pooled and ranked together; <V>W</V> is the{" "}
        <strong>sum of the ranks of the first sample</strong>. Under the null it is
        expected to equal <V>n</V><Sub>1</Sub>(<V>N</V>+1)/2.
      </p>
      <Note>
        Minitab reports <V>W</V>, the rank sum, not the Mann-Whitney <V>U</V>.
        They are equivalent but numerically different, so do not compare them
        directly across software.
      </Note>
    </Section>

    <Section title="Distribution of the statistic">
      <FormulaZ />
      <p>
        The subtracted term corrects for <strong>ties</strong> in the pooled
        sample, where <V>t</V> is the size of each tied group. The {"\u00B1"}0.5 is
        the <strong>continuity correction</strong>, needed because a discrete
        distribution is being approximated by a continuous one.
      </p>
    </Section>

    <Section title="Estimating the difference">
      <FormulaHL />
      <p>
        The reported difference is the{" "}
        <strong>two-sample Hodges-Lehmann estimator</strong>: the median of{" "}
        <strong>all</strong> <V>n</V><Sub>1</Sub>{TIMES}<V>n</V><Sub>2</Sub>{" "}
        pairwise differences between the samples.
      </p>
      <Note>
        It is not the difference of the medians. In the example below the median
        difference is {MINUS}1.5049 while the estimator gives {MINUS}1.60358.
      </Note>
      <p>
        The interval trims <V>k</V> of those sorted differences from each tail.
        Since their number is finite, the <strong>achieved confidence</strong>{" "}
        rarely matches the requested level, so the report shows both.
      </p>
    </Section>

    <Section title="Against the t test">
      <ul className="list-disc pl-5 space-y-1">
        <li>
          No normality required and robust to outliers, since only ranks are used.
        </li>
        <li>
          On normal data it retains roughly 95% of the <V>t</V> test&apos;s
          efficiency.
        </li>
        <li>
          It does require equal shape and spread, whereas Welch&apos;s <V>t</V>{" "}
          tolerates unequal variances.
        </li>
      </ul>
    </Section>

    <Section title="Worked example">
      <p>Two machines, 200 observations each, {ALPHA} = 0.05, two-sided:</p>
      <p className="font-mono text-xs">
        N{"\u2081"} = 200 {"\u00b7"} N{"\u2082"} = 200 {"\u00b7"} E[<V>W</V>] = 40100{" "}
        {"\u00b7"} <V>W</V> = 36509.00
      </p>
      <p className="font-mono text-xs">
        <V>z</V> = {MINUS}3.097 {"\u00b7"} <V>p</V> = 0.002 {"\u00b7"} Hodges-Lehmann
        = {MINUS}1.60358
      </p>
      <p className="font-mono text-xs">
        95% CI: ({MINUS}2.63498; {MINUS}0.593951) at 95.01%
      </p>
      <p>
        <V>W</V> falls 3591 below its expected value: the first machine runs
        systematically lower. H{"\u2080"} is rejected and the interval excludes
        zero.
      </p>
    </Section>
  </div>
);

export default function HTMannWhitneyTheory() {
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
