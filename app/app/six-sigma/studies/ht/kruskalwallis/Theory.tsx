// app/app/six-sigma/studies/ht/kruskalwallis/Theory.tsx
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

const ALPHA = "\u03B1";
const CHI = "\u03C7";
const SUM = "\u2211";
const MINUS = "\u2212";
const RBAR = "R\u0304";

const FormulaH = () => (
  <Formula>
    <V>H</V> ={" "}
    <Frac num={<>12</>} den={<><V>N</V>(<V>N</V>+1)</>} />
    {SUM}<Sub><V>i</V></Sub> <V>n</V><Sub><V>i</V></Sub> ({RBAR}<Sub><V>i</V></Sub>{" "}
    {MINUS} <Frac num={<><V>N</V>+1</>} den={<>2</>} />)<Sup>2</Sup>
  </Formula>
);

const FormulaZ = () => (
  <Formula>
    <V>Z</V><Sub><V>i</V></Sub> ={" "}
    <Frac
      num={<>{RBAR}<Sub><V>i</V></Sub> {MINUS} (<V>N</V>+1)/2</>}
      den={
        <Sqrt>
          <Frac num={<><V>N</V>(<V>N</V>+1)</>} den={<>12</>} /> (
          <Frac num={<>1</>} den={<><V>n</V><Sub><V>i</V></Sub></>} /> {MINUS}{" "}
          <Frac num={<>1</>} den={<><V>N</V></>} />)
        </Sqrt>
      }
    />
  </Formula>
);

const FormulaTies = () => (
  <Formula>
    <V>H</V><Sub>adj</Sub> ={" "}
    <Frac
      num={<><V>H</V></>}
      den={
        <>
          1 {MINUS}{" "}
          <Frac
            num={<>{SUM}(<V>t</V><Sup>3</Sup>{MINUS}<V>t</V>)</>}
            den={<><V>N</V><Sup>3</Sup>{MINUS}<V>N</V></>}
          />
        </>
      }
    />
  </Formula>
);

const ES = () => (
  <div className="space-y-5">
    <Section title="Qué contrasta">
      <p>
        El test de Kruskal-Wallis compara la localizaci&oacute;n de{" "}
        <strong><V>k</V> grupos independientes</strong>. Es la alternativa no
        param&eacute;trica al ANOVA de un factor y la extensi&oacute;n a varios
        grupos del test de Mann-Whitney.
      </p>
      <p>
        H{"\u2080"}: todas las medianas son iguales, frente a H{"\u2081"}: al menos
        una difiere. Es un contraste global: detecta que hay diferencias, no
        cu&aacute;les.
      </p>
      <Note>
        El supuesto clave no es la normalidad sino que las distribuciones tengan{" "}
        <strong>forma y dispersi&oacute;n comparables</strong>, difiriendo solo en un
        desplazamiento. Con dispersiones muy distintas, un resultado significativo
        puede deberse a la forma y no a la localizaci&oacute;n.
      </Note>
    </Section>

    <Section title="Cómo funciona">
      <FormulaH />
      <p>
        Se mezclan todas las observaciones, se ordenan y se asignan rangos al
        conjunto completo, sin distinguir grupos. Luego se calcula el{" "}
        <strong>rango medio</strong> {RBAR}<Sub><V>i</V></Sub> de cada grupo y se
        compara con el rango medio global (<V>N</V>+1)/2.
      </p>
      <p>
        Si todos los grupos procediesen de la misma poblaci&oacute;n, sus rangos
        medios deber&iacute;an rondar ese valor. <V>H</V> es la suma ponderada de las
        desviaciones al cuadrado, y sigue aproximadamente una {CHI}<Sup>2</Sup> con{" "}
        <V>k</V>{MINUS}1 grados de libertad.
      </p>
    </Section>

    <Section title="Los Z-Value">
      <FormulaZ />
      <p>
        Cada grupo lleva un <V>Z</V> que mide, en desviaciones t&iacute;picas,
        cu&aacute;nto se aparta su rango medio del global. Sirven para{" "}
        <strong>localizar</strong> de d&oacute;nde procede la diferencia que el
        contraste global se&ntilde;ala.
      </p>
      <Note>
        El t&eacute;rmino {MINUS}1/<V>N</V> del denominador es imprescindible y f&aacute;cil
        de omitir. Sin &eacute;l los valores salen ligeramente desviados: en el ejemplo
        de abajo, {MINUS}0,74 en lugar de {MINUS}0,73.
      </Note>
      <p>
        No son contrastes formales por parejas y{" "}
        <strong>no est&aacute;n corregidos por comparaciones m&uacute;ltiples</strong>.
        Un |<V>Z</V>| grande es un indicio de qu&eacute; grupo destaca, no una prueba.
      </p>
    </Section>

    <Section title="Corrección por empates">
      <FormulaTies />
      <p>
        Los empates reducen la variabilidad de los rangos, de modo que <V>H</V> queda
        subestimado. La correcci&oacute;n divide por un factor menor que uno, donde{" "}
        <V>t</V> es el tama&ntilde;o de cada grupo de valores empatados.
      </p>
      <Note>
        Con empates el informe muestra <strong>dos filas</strong>: sin corregir y
        corregida. El valor corregido es siempre mayor o igual, y es el que debe
        usarse. Sin empates ambas coinciden y solo aparece una fila.
      </Note>
    </Section>

    <Section title="Frente a otros contrastes">
      <ul className="list-disc pl-5 space-y-1">
        <li>
          Con datos normales el ANOVA es m&aacute;s potente; Kruskal-Wallis conserva
          cerca del 95% de su eficiencia, un precio bajo por la robustez.
        </li>
        <li>
          Frente al test de la mediana de Mood, usa los{" "}
          <strong>rangos completos</strong> en lugar de un simple recuento por encima
          o por debajo, y por eso es m&aacute;s potente.
        </li>
        <li>
          A cambio Mood es m&aacute;s robusto ante at&iacute;picos extremos. Si los
          dos contrastes discrepan, conviene mirar los boxplots antes de decidir.
        </li>
        <li>
          Con grupos de menos de 5 observaciones la aproximaci&oacute;n {CHI}
          <Sup>2</Sup> se degrada.
        </li>
      </ul>
    </Section>

    <Section title="Ejemplo resuelto">
      <p>
        Tasas de recuperaci&oacute;n en tres plantas, 58 observaciones, {ALPHA} =
        0,05:
      </p>
      <p className="font-mono text-xs">
        Rango medio global = (58+1)/2 = 29,5
      </p>
      <p className="font-mono text-xs">
        Ankhar: n=20, {RBAR}=27,3, Z={MINUS}0,73 {"\u00b7"} Bangor: n=13, {RBAR}=40,2,
        Z=2,60
      </p>
      <p className="font-mono text-xs">
        Savannah: n=25, {RBAR}=25,7, Z={MINUS}1,49
      </p>
      <p className="font-mono text-xs">
        DF = 2 {"\u00b7"} <V>H</V> = 6,86 sin corregir {"\u00b7"} 6,87 corregido{" "}
        {"\u00b7"} <V>p</V> = 0,032
      </p>
      <p>
        Bangor destaca con un rango medio de 40,2 frente al global de 29,5, y su{" "}
        <V>Z</V> = 2,60 es el &uacute;nico que supera 2 en valor absoluto. Se rechaza
        H{"\u2080"}.
      </p>
      <Note>
        La correcci&oacute;n por empates apenas mueve el estad&iacute;stico aqu&iacute;
        (6,8598 {"\u2192"} 6,8697) porque hay pocos valores repetidos, pero s&iacute;
        cambia la segunda cifra que se imprime.
      </Note>
    </Section>
  </div>
);

const EN = () => (
  <div className="space-y-5">
    <Section title="What it tests">
      <p>
        The Kruskal-Wallis test compares the location of{" "}
        <strong><V>k</V> independent groups</strong>. It is the nonparametric
        counterpart of one-way ANOVA and the multi-group extension of Mann-Whitney.
      </p>
      <p>
        H{"\u2080"}: all medians are equal, against H{"\u2081"}: at least one differs.
        It is an omnibus test: it detects that differences exist, not where.
      </p>
      <Note>
        The key assumption is not normality but <strong>comparable shape and
        spread</strong>, with groups differing only by a shift.
      </Note>
    </Section>

    <Section title="How it works">
      <FormulaH />
      <p>
        All observations are pooled and ranked together, then each group&apos;s{" "}
        <strong>mean rank</strong> is compared with the overall mean rank (<V>N</V>
        +1)/2. <V>H</V> is the weighted sum of squared deviations and follows
        approximately a {CHI}<Sup>2</Sup> with <V>k</V>{MINUS}1 degrees of freedom.
      </p>
    </Section>

    <Section title="The Z-Values">
      <FormulaZ />
      <p>
        Each group carries a <V>Z</V> measuring how far its mean rank departs from
        the overall one, in standard deviations. They help{" "}
        <strong>locate</strong> the source of a significant omnibus result.
      </p>
      <Note>
        The {MINUS}1/<V>N</V> term is easy to omit but essential: without it the
        values come out slightly off ({MINUS}0.74 instead of {MINUS}0.73 below).
        These are not formal pairwise tests and carry{" "}
        <strong>no multiple-comparison adjustment</strong>.
      </Note>
    </Section>

    <Section title="Tie correction">
      <FormulaTies />
      <p>
        Ties shrink rank variability and leave <V>H</V> understated. The correction
        divides by a factor below one, where <V>t</V> is the size of each tied group.
      </p>
      <Note>
        With ties the report shows <strong>two rows</strong>, unadjusted and
        adjusted; the adjusted value is always the larger and is the one to use.
      </Note>
    </Section>

    <Section title="Against other tests">
      <ul className="list-disc pl-5 space-y-1">
        <li>
          On normal data ANOVA is more powerful, though Kruskal-Wallis retains about
          95% of its efficiency.
        </li>
        <li>
          Against Mood&apos;s median test it uses <strong>full ranks</strong> rather
          than above/below counts, hence more power.
        </li>
        <li>
          Mood is more robust to extreme outliers, so inspect the boxplots when the
          two disagree.
        </li>
        <li>
          Groups with fewer than 5 observations degrade the {CHI}<Sup>2</Sup>{" "}
          approximation.
        </li>
      </ul>
    </Section>

    <Section title="Worked example">
      <p>Recovery rates at three plants, 58 observations, {ALPHA} = 0.05:</p>
      <p className="font-mono text-xs">Overall mean rank = 29.5</p>
      <p className="font-mono text-xs">
        Ankhar: n=20, {RBAR}=27.3, Z={MINUS}0.73 {"\u00b7"} Bangor: n=13, {RBAR}=40.2,
        Z=2.60 {"\u00b7"} Savannah: n=25, {RBAR}=25.7, Z={MINUS}1.49
      </p>
      <p className="font-mono text-xs">
        DF = 2 {"\u00b7"} <V>H</V> = 6.86 unadjusted {"\u00b7"} 6.87 adjusted{" "}
        {"\u00b7"} <V>p</V> = 0.032
      </p>
      <p>
        Bangor stands out at 40.2 against an overall 29.5, and its <V>Z</V> = 2.60 is
        the only one exceeding 2 in absolute value. H{"\u2080"} is rejected.
      </p>
    </Section>
  </div>
);

export default function HTKruskalWallisTheory() {
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
