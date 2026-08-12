// app/app/six-sigma/studies/improve/correlation/Theory.tsx
"use client";
import React, { useState } from "react";

type Lang = "es" | "en";

const Section = ({
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
const RHO = "\u03C1";
const MINUS = "\u2212";
const NEQ = "\u2260";

const FormulaR = () => (
  <Formula>
    <V>r</V> ={" "}
    <Frac
      num={<><V>S</V><Sub><V>xy</V></Sub></>}
      den={
        <Sqrt>
          <V>S</V><Sub><V>xx</V></Sub> {"\u00b7"} <V>S</V><Sub><V>yy</V></Sub>
        </Sqrt>
      }
    />
  </Formula>
);

const FormulaZ = () => (
  <Formula>
    <div className="space-y-2">
      <div>
        <V>z</V> = artanh(<V>r</V>) = ½ ln
        <Frac num={<>1 + <V>r</V></>} den={<>1 {MINUS} <V>r</V></>} />
      </div>
      <div>
        IC: tanh(<V>z</V> {"\u00b1"} <V>z</V><Sub>{ALPHA}/2</Sub> /{" "}
        <Sqrt><V>n</V> {MINUS} 3</Sqrt>)
      </div>
    </div>
  </Formula>
);

const FormulaT = () => (
  <Formula>
    <V>t</V> = <V>r</V> {"\u00b7"}{" "}
    <Sqrt>
      <Frac
        num={<><V>n</V> {MINUS} 2</>}
        den={<>1 {MINUS} <V>r</V><Sup>2</Sup></>}
      />
    </Sqrt>
    {"\u00a0\u00a0"}con <V>n</V>{MINUS}2 grados de libertad
  </Formula>
);

const ES = () => (
  <div className="space-y-5">
    <Section title="Qué mide">
      <p>
        Cuantifica en un solo n&uacute;mero la <strong>fuerza y el sentido</strong> de
        la relaci&oacute;n entre dos variables continuas. Es el complemento
        num&eacute;rico del diagrama de dispersi&oacute;n, no su sustituto.
      </p>
      <p>
        H{"\u2080"}: {RHO} = 0 frente a H{"\u2081"}: {RHO} {NEQ} 0. El contraste
        responde a si existe asociaci&oacute;n, no a cu&aacute;nto vale.
      </p>
      <Note>
        <strong>Mira siempre el gr&aacute;fico antes.</strong> El mismo <V>r</V> puede
        salir de una nube limpia, de una relaci&oacute;n curva o de un solo
        at&iacute;pico que lo fabrica todo.
      </Note>
    </Section>

    <Section title="Pearson">
      <FormulaR />
      <p>
        Es la covarianza dividida por el producto de las desviaciones t&iacute;picas,
        lo que la deja acotada entre {MINUS}1 y +1 y libre de unidades. Mide
        exclusivamente <strong>asociaci&oacute;n lineal</strong>.
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li>|<V>r</V>| pr&oacute;ximo a 1: los puntos se pegan a una recta.</li>
        <li>
          <V>r</V> pr&oacute;ximo a 0: no hay <em>relaci&oacute;n lineal</em>. Puede
          haber una curva perfecta y dar cero.
        </li>
        <li>
          El signo es el de la pendiente. <V>r</V><Sup>2</Sup> es el{" "}
          <V>R</V><Sup>2</Sup> de la regresi&oacute;n simple.
        </li>
      </ul>
      <Note>
        <strong>Correlaci&oacute;n no es causalidad</strong>, y tampoco implica
        pendiente grande: un <V>r</V> de 0,99 es compatible con un efecto
        min&uacute;sculo, y un <V>r</V> de 0,5 con uno enorme y ruidoso.
      </Note>
    </Section>

    <Section title="Spearman">
      <p>
        Es el Pearson calculado <strong>sobre los rangos</strong>. Detecta cualquier
        relaci&oacute;n <strong>mon&oacute;tona</strong>, no solo la lineal, y como
        depende del orden y no de los valores, resulta{" "}
        <strong>robusto frente a at&iacute;picos</strong>. Los empates reciben el
        rango promedio.
      </p>
      <p>
        &Uacute;salo con relaciones curvas pero crecientes, con datos ordinales o
        cuando un valor extremo domina el Pearson. A cambio pierde algo de potencia
        si la relaci&oacute;n s&iacute; era lineal y normal.
      </p>
    </Section>

    <Section title="El intervalo y el p-valor">
      <FormulaZ />
      <FormulaT />
      <p>
        El intervalo usa la <strong>transformaci&oacute;n z de Fisher</strong>, que
        convierte la distribuci&oacute;n muy asim&eacute;trica de <V>r</V> en algo
        aproximadamente normal. Se calcula el intervalo en la escala <V>z</V> y se
        deshace la transformaci&oacute;n, por eso{" "}
        <strong>no queda sim&eacute;trico</strong> alrededor de <V>r</V> y nunca se
        sale de [{MINUS}1, 1].
      </p>
      <Note>
        Intervalo y p-valor <strong>proceden de criterios distintos</strong>: el
        primero de la z de Fisher, el segundo del estad&iacute;stico <V>t</V>. Es la
        convenci&oacute;n habitual, pero implica que en muestras muy peque&ntilde;as
        pueden no concordar del todo. El intervalo exige adem&aacute;s <V>n</V> {">"}{" "}
        3.
      </Note>
    </Section>

    <Section title="Con más de dos variables">
      <p>
        La matriz recoge todos los pares. El borrado es{" "}
        <strong>por parejas</strong>: cada correlaci&oacute;n usa las filas completas
        de <em>sus dos</em> columnas, as&iacute; que las <V>N</V> pueden diferir entre
        pares. Es lo que maximiza el uso de los datos, pero deja una matriz cuyas
        celdas no proceden todas de la misma muestra.
      </p>
      <Note>
        Los p-valores de la matriz{" "}
        <strong>
          no est&aacute;n corregidos por comparaciones m&uacute;ltiples
        </strong>
        . Con <V>k</V> variables hay <V>k</V>(<V>k</V>{MINUS}1)/2 contrastes, y a{" "}
        {ALPHA} = 0,05 aparecer&aacute;n falsos positivos por puro n&uacute;mero.
      </Note>
    </Section>

    <Section title="Ejemplo resuelto">
      <p>Trece temporadas, acarreos frente a yardas, {ALPHA} = 0,05:</p>
      <p className="font-mono text-xs">
        <V>N</V> = 13 {"\u00b7"} <V>r</V> = 0,935 {"\u00b7"} IC 95%: (0,791; 0,981)
      </p>
      <p className="font-mono text-xs">
        <V>p</V>-valor = 0,000 {"\u00b7"} <V>t</V> = 8,71 con 11 grados de libertad
      </p>
      <p>
        Asociaci&oacute;n positiva fuerte. El intervalo excluye el cero con holgura,
        pero repara en su <strong>anchura</strong>: la correlaci&oacute;n
        poblacional podr&iacute;a estar en 0,79 o en 0,98, dos escenarios bien
        distintos. Con trece observaciones no se puede precisar m&aacute;s.
      </p>
      <Note>
        Fij&aacute;te en la <strong>asimetr&iacute;a</strong>: el intervalo se extiende
        0,144 hacia abajo pero solo 0,046 hacia arriba. Es el efecto de la
        transformaci&oacute;n de Fisher, que comprime el espacio cerca de 1 — no un
        error de c&aacute;lculo.
      </Note>
      <p>
        Los mismos datos con Spearman dan <strong>0,740</strong>, bastante menos.
        No es contradicci&oacute;n: los rangos ignoran <em>cu&aacute;nto</em> se
        separan del resto las dos temporadas cortas, y eran justamente ellas las que
        sosten&iacute;an el Pearson alto. La discrepancia es la se&ntilde;al de que
        unos pocos puntos extremos pesan mucho.
      </p>
      <p>
        Con otro corredor, doce temporadas, sale <V>r</V> = 0,975 e IC (0,910;
        0,993): <strong>relaci&oacute;n m&aacute;s estrecha y mejor determinada</strong>{" "}
        con una observaci&oacute;n menos. Un <V>r</V> mayor estrecha el intervalo muy
        deprisa.
      </p>
    </Section>
  </div>
);

const EN = () => (
  <div className="space-y-5">
    <Section title="What it measures">
      <p>
        Summarises in one number the <strong>strength and direction</strong> of the
        relationship between two continuous variables. It complements the
        scatterplot, it does not replace it.
      </p>
      <p>
        H{"\u2080"}: {RHO} = 0 against H{"\u2081"}: {RHO} {NEQ} 0.
      </p>
      <Note>
        <strong>Always look at the plot first.</strong> The same <V>r</V> can come
        from a clean cloud, a curved relationship or a single outlier.
      </Note>
    </Section>

    <Section title="Pearson">
      <FormulaR />
      <p>
        Covariance scaled by both standard deviations, hence bounded in [{MINUS}1, 1]
        and unit-free. It captures <strong>linear</strong> association only: a perfect
        curve can still give zero. Its square is the <V>R</V><Sup>2</Sup> of simple
        regression.
      </p>
      <Note>
        <strong>Correlation is not causation</strong>, and a large <V>r</V> does not
        mean a large slope.
      </Note>
    </Section>

    <Section title="Spearman">
      <p>
        Pearson applied <strong>to the ranks</strong>. It detects any{" "}
        <strong>monotonic</strong> relationship and is{" "}
        <strong>robust to outliers</strong>, since only order matters. Ties take
        average ranks. Prefer it for curved-but-increasing relationships, ordinal
        data, or when one extreme value dominates.
      </p>
    </Section>

    <Section title="Interval and p-value">
      <FormulaZ />
      <FormulaT />
      <p>
        The interval uses <strong>Fisher&apos;s z transformation</strong>, which makes
        the heavily skewed distribution of <V>r</V> approximately normal. Because the
        interval is built on the <V>z</V> scale and transformed back, it is{" "}
        <strong>asymmetric</strong> about <V>r</V> and never leaves [{MINUS}1, 1].
      </p>
      <Note>
        Interval and p-value come from <strong>different criteria</strong> — Fisher z
        and the <V>t</V> statistic respectively — so they may disagree slightly in
        very small samples. The interval also needs <V>n</V> {">"} 3.
      </Note>
    </Section>

    <Section title="More than two variables">
      <p>
        Deletion is <strong>pairwise</strong>: each correlation uses the complete rows
        of its own two columns, so <V>N</V> can differ across pairs.
      </p>
      <Note>
        Matrix p-values carry{" "}
        <strong>no multiple-comparison adjustment</strong>; with <V>k</V> variables
        there are <V>k</V>(<V>k</V>{MINUS}1)/2 tests.
      </Note>
    </Section>

    <Section title="Worked example">
      <p>Thirteen seasons, carries against yards, {ALPHA} = 0.05:</p>
      <p className="font-mono text-xs">
        <V>N</V> = 13 {"\u00b7"} <V>r</V> = 0.935 {"\u00b7"} 95% CI: (0.791; 0.981){" "}
        {"\u00b7"} <V>p</V> = 0.000
      </p>
      <p>
        A strong positive association, but note the <strong>width</strong>: the
        population value could be 0.79 or 0.98. Thirteen observations cannot pin it
        down further.
      </p>
      <Note>
        Note the <strong>asymmetry</strong>: 0.144 downwards against 0.046 upwards.
        That is Fisher&apos;s transformation compressing the space near 1, not a
        rounding error.
      </Note>
      <p>
        Spearman on the same data gives <strong>0.740</strong>. No contradiction: the
        ranks ignore <em>how far</em> the two short seasons sit from the rest, and
        those were the points sustaining the high Pearson value.
      </p>
    </Section>
  </div>
);

export default function ImpCorrTheory() {
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
