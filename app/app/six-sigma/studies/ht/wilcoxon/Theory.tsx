// app/app/six-sigma/studies/ht/wilcoxon/Theory.tsx
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
const LE = "\u2264";

const FormulaW = () => (
  <Formula>
    <V>d</V><Sub><V>i</V></Sub> = <V>x</V><Sub><V>i</V></Sub> {MINUS} {ETA}<Sub>0</Sub>
    <span className="mx-4">
      <V>W</V><Sup>+</Sup> = {SUM} <V>R</V><Sub><V>i</V></Sub> sobre{" "}
      <V>d</V><Sub><V>i</V></Sub> {">"} 0
    </span>
  </Formula>
);

const FormulaZ = () => (
  <Formula>
    <div className="space-y-3">
      <div>
        E[<V>W</V><Sup>+</Sup>] = <Frac num={<><V>n</V>(<V>n</V>+1)</>} den={<>4</>} />
        <span className="mx-4">
          Var = <Frac num={<><V>n</V>(<V>n</V>+1)(2<V>n</V>+1)</>} den={<>24</>} />
          {" "}{MINUS}{" "}
          <Frac num={<>{SUM}(<V>t</V><Sup>3</Sup>{MINUS}<V>t</V>)</>} den={<>48</>} />
        </span>
      </div>
      <div>
        <V>z</V> ={" "}
        <Frac
          num={<><V>W</V><Sup>+</Sup> {MINUS} E[<V>W</V><Sup>+</Sup>]</>}
          den={<Sqrt>Var</Sqrt>}
        />
      </div>
    </div>
  </Formula>
);

const FormulaHL = () => (
  <Formula>
    {ETA}{"\u0302"} = mediana {"{"} (<V>x</V><Sub><V>i</V></Sub> +{" "}
    <V>x</V><Sub><V>j</V></Sub>) / 2 : <V>i</V> {LE} <V>j</V> {"}"}
  </Formula>
);

const ES = () => (
  <div className="space-y-5">
    <Section title="Qué contrasta">
      <p>
        El test de los rangos con signo de Wilcoxon compara la mediana de una
        poblaci&oacute;n con un valor de referencia {ETA}<Sub>0</Sub>. Es la
        alternativa no param&eacute;trica al test <V>t</V> de una muestra.
      </p>
      <p>
        H{"\u2080"}: {ETA} = {ETA}<Sub>0</Sub> frente a H{"\u2081"}: {ETA} {NEQ}{" "}
        {ETA}<Sub>0</Sub> (bilateral), o {"<"} / {">"} en los casos unilaterales.
      </p>
      <p>
        No exige normalidad, pero <strong>s&iacute; simetr&iacute;a</strong> de la
        distribuci&oacute;n alrededor de su mediana. Es un supuesto m&aacute;s
        d&eacute;bil que el del test <V>t</V>, no la ausencia de supuestos.
      </p>
    </Section>

    <Section title="Cómo funciona">
      <FormulaW />
      <p>
        Se calculan las diferencias respecto a {ETA}<Sub>0</Sub>, se descartan las
        nulas, se ordenan los <strong>valores absolutos</strong> y se les asignan
        rangos <V>R</V><Sub><V>i</V></Sub>. El estad&iacute;stico{" "}
        <V>W</V><Sup>+</Sup> suma los rangos de las diferencias positivas.
      </p>
      <p>
        La idea es que el signo se contrasta ponderado por la magnitud: una
        desviaci&oacute;n grande pesa m&aacute;s que una peque&ntilde;a, pero solo a
        trav&eacute;s de su posici&oacute;n en el orden, no de su valor. De ah&iacute;
        la robustez frente a at&iacute;picos.
      </p>
      <Note>
        Las observaciones exactamente iguales a {ETA}<Sub>0</Sub> se excluyen. Por
        eso <em>N for Test</em> puede ser menor que <em>N</em>.
      </Note>
    </Section>

    <Section title="Distribución del estadístico">
      <FormulaZ />
      <p>
        Bajo H{"\u2080"} los signos son equiprobables y <V>W</V><Sup>+</Sup> tiene
        media <V>n</V>(<V>n</V>+1)/4. El segundo t&eacute;rmino de la varianza
        corrige los empates en |<V>d</V><Sub><V>i</V></Sub>|, donde <V>t</V> es el
        tama&ntilde;o de cada grupo empatado.
      </p>
      <p>
        Con muestras grandes la aproximaci&oacute;n normal es excelente y es la que
        emplea el c&aacute;lculo. Con muestras muy peque&ntilde;as (<V>n</V> {"<"} 20)
        conviene interpretar el <V>p</V>-valor con cautela: la distribuci&oacute;n
        exacta es discreta y notablemente escalonada.
      </p>
    </Section>

    <Section title="La columna Median">
      <FormulaHL />
      <p>
        El valor que aparece bajo <em>Median</em> <strong>no es la mediana
        muestral</strong>, sino el <strong>estimador de Hodges-Lehmann</strong>: la
        mediana de los <V>n</V>(<V>n</V>+1)/2 promedios de Walsh, todas las medias
        de pares de observaciones incluyendo cada una consigo misma.
      </p>
      <Note>
        Es el estimador puntual coherente con el contraste, el valor de {ETA}
        <Sub>0</Sub> que anular&iacute;a el estad&iacute;stico. En distribuciones
        asim&eacute;tricas difiere de forma bien visible de la mediana simple, y
        confundirlos es el error m&aacute;s com&uacute;n al replicar esta tabla.
      </Note>
    </Section>

    <Section title="Intervalo de confianza">
      <p>
        El intervalo se obtiene recortando <V>k</V> promedios de Walsh por cada
        cola, con <V>k</V> derivado del cuantil normal. Como el n&uacute;mero de
        promedios es finito, la <strong>confianza alcanzada</strong> rara vez
        coincide con la pedida: por eso el informe muestra ambas.
      </p>
    </Section>

    <Section title="Cuándo no usarlo">
      <ul className="list-disc pl-5 space-y-1">
        <li>
          Si la distribuci&oacute;n es marcadamente asim&eacute;trica falla el
          supuesto de simetr&iacute;a. El <strong>test del signo</strong> es
          entonces m&aacute;s robusto, aunque menos potente.
        </li>
        <li>
          Si los datos son realmente normales, el test <V>t</V> tiene m&aacute;s
          potencia. Wilcoxon conserva cerca del 95% de la eficiencia, un precio
          bajo por la robustez.
        </li>
        <li>
          Con muchos empates la correcci&oacute;n de varianza ayuda, pero un exceso
          de valores repetidos sugiere resoluci&oacute;n de medida insuficiente.
        </li>
      </ul>
    </Section>

    <Section title="Ejemplo resuelto">
      <p>
        Una columna con 500 observaciones de una distribuci&oacute;n asim&eacute;trica
        a la derecha, contrastada frente a {ETA}<Sub>0</Sub> = 63, {ALPHA} = 0,05,
        bilateral:
      </p>
      <p className="font-mono text-xs">
        N = 500 {"\u00b7"} N for Test = 500 {"\u00b7"} <V>W</V><Sup>+</Sup> = 124015,00
      </p>
      <p className="font-mono text-xs">
        E[<V>W</V><Sup>+</Sup>] = 500{"\u00b7"}501/4 = 62625 {"\u00b7"} <V>p</V> = 0,000
      </p>
      <p className="font-mono text-xs">
        Mediana muestral = 65,6953 {"\u00b7"} Hodges-Lehmann = 67,8308
      </p>
      <p>
        <V>W</V><Sup>+</Sup> casi duplica su valor esperado: las desviaciones por
        encima de 63 dominan claramente. Se rechaza H{"\u2080"}.
      </p>
      <Note>
        Obs&eacute;rvese la separaci&oacute;n de m&aacute;s de dos unidades entre la
        mediana muestral y el estimador de Hodges-Lehmann. Es el efecto de la cola
        derecha sobre los promedios de Walsh, y la raz&oacute;n de que la tabla no
        cuadre si se implementa la mediana corriente.
      </Note>
    </Section>
  </div>
);

const EN = () => (
  <div className="space-y-5">
    <Section title="What it tests">
      <p>
        The Wilcoxon signed rank test compares a population median against a
        reference value {ETA}<Sub>0</Sub>. It is the nonparametric counterpart of
        the one-sample <V>t</V> test.
      </p>
      <p>
        H{"\u2080"}: {ETA} = {ETA}<Sub>0</Sub> against H{"\u2081"}: {ETA} {NEQ}{" "}
        {ETA}<Sub>0</Sub> (two-sided), or {"<"} / {">"} for one-sided cases.
      </p>
      <p>
        It does not require normality, but it <strong>does require symmetry</strong>{" "}
        about the median. That is a weaker assumption than the <V>t</V> test&apos;s,
        not the absence of one.
      </p>
    </Section>

    <Section title="How it works">
      <FormulaW />
      <p>
        Differences from {ETA}<Sub>0</Sub> are computed, zeros are dropped, the{" "}
        <strong>absolute values</strong> are ranked, and <V>W</V><Sup>+</Sup> sums
        the ranks belonging to positive differences. Magnitude enters only through
        rank order, which is what makes the test robust to outliers.
      </p>
      <Note>
        Observations exactly equal to {ETA}<Sub>0</Sub> are excluded, so{" "}
        <em>N for Test</em> may be smaller than <em>N</em>.
      </Note>
    </Section>

    <Section title="Distribution of the statistic">
      <FormulaZ />
      <p>
        Under H{"\u2080"} signs are equally likely and <V>W</V><Sup>+</Sup> has mean{" "}
        <V>n</V>(<V>n</V>+1)/4. The second variance term corrects for ties in |
        <V>d</V><Sub><V>i</V></Sub>|, where <V>t</V> is the size of each tied group.
        The normal approximation used here is excellent for large samples.
      </p>
    </Section>

    <Section title="The Median column">
      <FormulaHL />
      <p>
        The value shown under <em>Median</em> is <strong>not the sample
        median</strong> but the <strong>Hodges-Lehmann estimator</strong>: the
        median of the <V>n</V>(<V>n</V>+1)/2 Walsh averages.
      </p>
      <Note>
        It is the point estimate consistent with the test. On skewed data it
        departs visibly from the plain median, and confusing the two is the most
        common mistake when reproducing this table.
      </Note>
    </Section>

    <Section title="Confidence interval">
      <p>
        The interval trims <V>k</V> Walsh averages from each tail. Since their
        number is finite, the <strong>achieved confidence</strong> seldom matches
        the requested level, so the report shows both.
      </p>
    </Section>

    <Section title="When not to use it">
      <ul className="list-disc pl-5 space-y-1">
        <li>
          Markedly skewed data break the symmetry assumption; the{" "}
          <strong>sign test</strong> is then more robust, though less powerful.
        </li>
        <li>
          On genuinely normal data the <V>t</V> test is more powerful, though
          Wilcoxon retains about 95% of its efficiency.
        </li>
        <li>
          Heavy tying is handled by the variance correction, but usually signals
          insufficient measurement resolution.
        </li>
      </ul>
    </Section>

    <Section title="Worked example">
      <p>
        500 observations from a right-skewed distribution, tested against {ETA}
        <Sub>0</Sub> = 63, {ALPHA} = 0.05, two-sided:
      </p>
      <p className="font-mono text-xs">
        N = 500 {"\u00b7"} N for Test = 500 {"\u00b7"} <V>W</V><Sup>+</Sup> = 124015.00
      </p>
      <p className="font-mono text-xs">
        E[<V>W</V><Sup>+</Sup>] = 500{"\u00b7"}501/4 = 62625 {"\u00b7"} <V>p</V> = 0.000
      </p>
      <p className="font-mono text-xs">
        Sample median = 65.6953 {"\u00b7"} Hodges-Lehmann = 67.8308
      </p>
      <p>
        <V>W</V><Sup>+</Sup> nearly doubles its expected value: deviations above 63
        clearly dominate. H{"\u2080"} is rejected.
      </p>
    </Section>
  </div>
);

export default function HTWilcoxonTheory() {
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
