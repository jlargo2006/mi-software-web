// app/app/six-sigma/studies/ht/moodsmedian/Theory.tsx
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
const CHI = "\u03C7";
const SUM = "\u2211";
const MINUS = "\u2212";
const LE = "\u2264";

const FormulaChi = () => (
  <Formula>
    <div className="space-y-2">
      <div>
        {CHI}<Sup>2</Sup> = {SUM}<Sub><V>i</V>,<V>j</V></Sub>{" "}
        <Frac
          num={<>(<V>O</V><Sub><V>ij</V></Sub> {MINUS} <V>E</V><Sub><V>ij</V></Sub>)<Sup>2</Sup></>}
          den={<><V>E</V><Sub><V>ij</V></Sub></>}
        />
        <span className="mx-4">
          <V>E</V><Sub><V>ij</V></Sub> ={" "}
          <Frac
            num={<>fila<Sub><V>i</V></Sub> {"\u00D7"} col<Sub><V>j</V></Sub></>}
            den={<><V>N</V></>}
          />
        </span>
      </div>
      <div>DF = <V>k</V> {MINUS} 1</div>
    </div>
  </Formula>
);

const ES = () => (
  <div className="space-y-5">
    <Section title="Qué contrasta">
      <p>
        El test de la mediana de Mood compara las medianas de{" "}
        <strong><V>k</V> grupos independientes</strong>. Es la alternativa no
        param&eacute;trica al ANOVA de un factor, y la extensi&oacute;n a varios
        grupos del test del signo.
      </p>
      <p>
        H{"\u2080"}: todas las medianas poblacionales son iguales, frente a H
        {"\u2081"}: al menos una difiere. Como todo contraste global, indica que hay
        diferencias pero no cu&aacute;les.
      </p>
    </Section>

    <Section title="Cómo funciona">
      <p>
        Se calcula la <strong>mediana global</strong> de todos los datos juntos, sin
        distinguir grupos. Despu&eacute;s se cuenta, en cada grupo, cu&aacute;ntas
        observaciones quedan por encima de ella y cu&aacute;ntas no. Eso produce una
        tabla de contingencia de 2 filas por <V>k</V> columnas.
      </p>
      <FormulaChi />
      <p>
        Si todos los grupos tuviesen la misma mediana, cada uno deber&iacute;a
        repartir sus observaciones a partes iguales por encima y por debajo de la
        mediana global. El contraste es por tanto una{" "}
        <strong>chi-cuadrado de independencia</strong> ordinaria sobre esa tabla, con{" "}
        <V>k</V>{MINUS}1 grados de libertad.
      </p>
      <Note>
        Las observaciones exactamente iguales a la mediana global se cuentan en la
        columna {LE}, no se descartan. Es la convenci&oacute;n del informe y afecta a
        los recuentos cuando hay muchos valores repetidos.
      </Note>
    </Section>

    <Section title="Los intervalos individuales">
      <p>
        Cada grupo lleva su propio intervalo para la mediana, construido con{" "}
        <strong>estad&iacute;sticos de orden</strong> igual que en el test del signo:
        los valores en las posiciones <V>k</V> y <V>n</V>+1{MINUS}<V>k</V> de la
        muestra ordenada, con la interpolaci&oacute;n no lineal de
        Hettmansperger-Sheather para alcanzar el nivel pedido.
      </p>
      <Note>
        Son intervalos <strong>individuales</strong>, no simult&aacute;neos: no
        est&aacute;n corregidos por comparaciones m&uacute;ltiples. Que dos
        intervalos no se solapen es un indicio, no una prueba formal de que esos dos
        grupos difieran.
      </Note>
      <p>
        La columna Q3{"\u2013"}Q1 es el rango intercuart&iacute;lico de cada grupo, y
        sirve para juzgar el supuesto de dispersi&oacute;n comparable.
      </p>
    </Section>

    <Section title="Frente a Kruskal-Wallis">
      <ul className="list-disc pl-5 space-y-1">
        <li>
          Mood solo usa la posici&oacute;n <strong>por encima o por debajo</strong> de
          la mediana global; Kruskal-Wallis usa los rangos completos.
        </li>
        <li>
          Descartar esa informaci&oacute;n cuesta potencia: Kruskal-Wallis detecta
          mejor las diferencias cuando sus supuestos se cumplen.
        </li>
        <li>
          A cambio, Mood es notablemente m&aacute;s{" "}
          <strong>robusto a valores at&iacute;picos</strong> y tolera mejor colas
          pesadas o contaminaci&oacute;n, porque un valor extremo solo aporta un
          recuento.
        </li>
        <li>
          Con muestras peque&ntilde;as la tabla puede tener frecuencias esperadas
          bajas y la aproximaci&oacute;n chi-cuadrado se degrada.
        </li>
      </ul>
    </Section>

    <Section title="Ejemplo resuelto">
      <p>
        Tasas de recuperaci&oacute;n en tres plantas, 58 observaciones en total,{" "}
        {ALPHA} = 0,05:
      </p>
      <p className="font-mono text-xs">
        Mediana global = 88,920
      </p>
      <p className="font-mono text-xs">
        Ankhar: {LE} 13 / &gt; 7 {"\u00b7"} Bangor: {LE} 1 / &gt; 12 {"\u00b7"}{" "}
        Savannah: {LE} 15 / &gt; 10
      </p>
      <p className="font-mono text-xs">
        DF = 2 {"\u00b7"} {CHI}<Sup>2</Sup> = 12,11 {"\u00b7"} <V>p</V> = 0,002
      </p>
      <p>
        Bangor es el grupo que rompe el equilibrio: 12 de sus 13 observaciones
        superan la mediana global, cuando lo esperado ser&iacute;a algo m&aacute;s de
        6. Se rechaza H{"\u2080"}.
      </p>
      <Note>
        Obs&eacute;rvese que el intervalo de Bangor, (90,6369; 97,0361), no se solapa
        con los de Ankhar y Savannah, mientras estos dos s&iacute; se solapan entre
        s&iacute;. Es coherente con que la diferencia proceda de Bangor, aunque
        confirmarlo exigir&iacute;a un contraste por parejas.
      </Note>
    </Section>

    <Section title="Cuándo usarlo">
      <p>
        Cuando se comparan varios grupos con datos claramente contaminados por
        at&iacute;picos, o cuando las distribuciones son tan irregulares que ni el
        ANOVA ni Kruskal-Wallis resultan cre&iacute;bles. Es el contraste m&aacute;s
        conservador de los tres.
      </p>
    </Section>
  </div>
);

const EN = () => (
  <div className="space-y-5">
    <Section title="What it tests">
      <p>
        Mood&apos;s median test compares the medians of{" "}
        <strong><V>k</V> independent groups</strong>. It is the nonparametric
        counterpart of one-way ANOVA and the multi-group extension of the sign test.
      </p>
      <p>
        H{"\u2080"}: all population medians are equal, against H{"\u2081"}: at least
        one differs. Like any omnibus test it says that differences exist, not where.
      </p>
    </Section>

    <Section title="How it works">
      <p>
        The <strong>overall median</strong> of the pooled data is computed, then each
        group is split into observations above it and observations at or below it.
        That yields a 2 {"\u00D7"} <V>k</V> contingency table.
      </p>
      <FormulaChi />
      <p>
        Under the null each group should split evenly, so the test is an ordinary{" "}
        <strong>chi-square test of independence</strong> on that table with{" "}
        <V>k</V>{MINUS}1 degrees of freedom.
      </p>
      <Note>
        Observations exactly equal to the overall median fall in the {LE} column
        rather than being discarded.
      </Note>
    </Section>

    <Section title="The individual intervals">
      <p>
        Each group gets its own median interval, built from{" "}
        <strong>order statistics</strong> exactly as in the sign test, with
        Hettmansperger-Sheather interpolation to reach the requested level.
      </p>
      <Note>
        These are <strong>individual</strong>, not simultaneous intervals: they carry
        no multiple-comparison adjustment. Non-overlapping intervals are suggestive,
        not conclusive.
      </Note>
    </Section>

    <Section title="Against Kruskal-Wallis">
      <ul className="list-disc pl-5 space-y-1">
        <li>
          Mood uses only whether each value lies above or below the overall median;
          Kruskal-Wallis uses full ranks and is therefore more powerful.
        </li>
        <li>
          In exchange Mood is markedly more <strong>robust to outliers</strong>,
          since an extreme value contributes just one count.
        </li>
        <li>
          With small samples expected counts may fall below 5 and the chi-square
          approximation degrades.
        </li>
      </ul>
    </Section>

    <Section title="Worked example">
      <p>Recovery rates at three plants, 58 observations, {ALPHA} = 0.05:</p>
      <p className="font-mono text-xs">Overall median = 88.920</p>
      <p className="font-mono text-xs">
        Ankhar: {LE} 13 / &gt; 7 {"\u00b7"} Bangor: {LE} 1 / &gt; 12 {"\u00b7"}{" "}
        Savannah: {LE} 15 / &gt; 10
      </p>
      <p className="font-mono text-xs">
        DF = 2 {"\u00b7"} {CHI}<Sup>2</Sup> = 12.11 {"\u00b7"} <V>p</V> = 0.002
      </p>
      <p>
        Bangor drives the result: 12 of its 13 observations exceed the overall
        median against roughly 6 expected. H{"\u2080"} is rejected.
      </p>
    </Section>

    <Section title="When to use it">
      <p>
        When comparing several groups whose data are heavily contaminated by
        outliers, or so irregular that neither ANOVA nor Kruskal-Wallis is credible.
        It is the most conservative of the three.
      </p>
    </Section>
  </div>
);

export default function HTMoodsMedianTheory() {
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
