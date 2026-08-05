// app/app/six-sigma/studies/ht/pairedt/Theory.tsx
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
const DBAR = "d\u0304";

const FormulaD = () => (
  <Formula>
    <V>d</V><Sub><V>i</V></Sub> = <V>x</V><Sub><V>i</V></Sub> {"\u2212"}{" "}
    <V>y</V><Sub><V>i</V></Sub>
    <span className="mx-4">
      {DBAR} = <Frac num={<>1</>} den={<V>n</V>} /> {"\u2211"}{" "}
      <V>d</V><Sub><V>i</V></Sub>
    </span>
    <span className="mx-4">
      <V>s</V><Sub><V>d</V></Sub> ={" "}
      <Sqrt>
        <Frac
          num={<>{"\u2211"}(<V>d</V><Sub><V>i</V></Sub> {"\u2212"} {DBAR})<sup>2</sup></>}
          den={<><V>n</V> {"\u2212"} 1</>}
        />
      </Sqrt>
    </span>
  </Formula>
);

const FormulaT = () => (
  <Formula>
    <V>t</V> ={" "}
    <Frac
      num={<>{DBAR} {"\u2212"} {MU}<Sub>0</Sub></>}
      den={<>SE(<V>d</V>)</>}
    />
    <span className="mx-4">
      SE(<V>d</V>) ={" "}
      <Frac num={<><V>s</V><Sub><V>d</V></Sub></>} den={<Sqrt><V>n</V></Sqrt>} />
    </span>
    <span className="mx-4">df = <V>n</V> {"\u2212"} 1</span>
  </Formula>
);

const FormulaCI = () => (
  <Formula>
    <div className="space-y-3">
      <div>
        {MU}<Sub><V>d</V></Sub> {"\u2208"} {DBAR} {PM} <V>t</V>
        <Sub>1{"\u2212"}{ALPHA}/2, <V>n</V>{"\u2212"}1</Sub> {"\u00B7"} SE(<V>d</V>)
      </div>
      <div>
        {"\u2265"} {DBAR} {"\u2212"} <V>t</V>
        <Sub>1{"\u2212"}{ALPHA}, <V>n</V>{"\u2212"}1</Sub> {"\u00B7"} SE(<V>d</V>)
      </div>
      <div>
        {"\u2264"} {DBAR} + <V>t</V>
        <Sub>1{"\u2212"}{ALPHA}, <V>n</V>{"\u2212"}1</Sub> {"\u00B7"} SE(<V>d</V>)
      </div>
    </div>
  </Formula>
);

const ES = () => (
  <div className="space-y-5">
    <Section title="Qu\u00e9 contrasta">
      <p>
        El test <V>t</V> pareado compara dos mediciones tomadas sobre las{" "}
        <strong>mismas unidades experimentales</strong>: antes y después de un
        cambio, dos instrumentos sobre la misma pieza, dos operarios midiendo el
        mismo lote. Cada observaci&oacute;n de una muestra tiene su gemela en la otra.
      </p>
      <p>
        No es un test de dos muestras aplicado a datos parecidos: al restar dentro
        de cada par se elimina la variabilidad entre unidades, que suele ser la
        fuente de ruido dominante. Por eso el test pareado detecta diferencias que
        un test de dos muestras independientes dejar&aacute; pasar.
      </p>
      <p>
        H{"\u2080"}: {MU}<Sub><V>d</V></Sub> = {MU}<Sub>0</Sub> frente a
        H{"\u2081"}: {MU}<Sub><V>d</V></Sub> {NEQ} {MU}<Sub>0</Sub> (bilateral),
        o {"<"} / {">"} en los casos unilaterales. Normalmente {MU}<Sub>0</Sub> = 0.
      </p>
    </Section>

    <Section title="Reducci&oacute;n a una muestra">
      <FormulaD />
      <p>
        El procedimiento reduce el problema a un test <V>t</V> de una muestra sobre
        las diferencias. Toda la inferencia usa {DBAR} y{" "}
        <V>s</V><Sub><V>d</V></Sub>; las desviaciones de cada muestra por separado
        son solo descriptivas y no intervienen en el c&aacute;lculo.
      </p>
      <Note>
        Consecuencia pr&aacute;ctica: el emparejamiento es <strong>por fila</strong>. Si
        falta un dato en cualquiera de las dos columnas, la fila entera se
        descarta. No se pueden rellenar huecos ni reordenar las columnas de forma
        independiente.
      </Note>
    </Section>

    <Section title="Estad&iacute;stico de contraste">
      <FormulaT />
      <p>
        El <V>p</V>-valor es el &aacute;rea de la cola (o de las dos colas, con el valor
        absoluto) de la <V>t</V> con <V>n</V>{"\u2212"}1 grados de libertad, donde{" "}
        <V>n</V> es el n&uacute;mero de <strong>pares</strong>, no el de observaciones.
      </p>
    </Section>

    <Section title="Intervalo y cotas de confianza">
      <FormulaCI />
      <p>
        Con hip&oacute;tesis bilateral se muestra un intervalo de dos lados. Con hip&oacute;tesis
        unilateral se muestra una &uacute;nica cota, en el mismo sentido que H{"\u2081"}.
        El intervalo y el test son coherentes: si {MU}<Sub>0</Sub> queda fuera del
        intervalo, el test rechaza al mismo nivel {ALPHA}.
      </p>
    </Section>

    <Section title="Supuestos">
      <ul className="list-disc pl-5 space-y-1">
        <li>Los pares son independientes entre s&iacute;­.</li>
        <li>
          Las <strong>diferencias</strong> son aproximadamente normales. No hace
          falta que lo sean las dos muestras originales.
        </li>
        <li>Sin at&iacute;­picos que dominen {DBAR} y <V>s</V><Sub><V>d</V></Sub>.</li>
      </ul>
      <Note>
        Las tres gr&aacute;ficas del informe se construyen sobre las diferencias, no sobre
        las muestras originales, precisamente porque el supuesto de normalidad se
        aplica a ellas.
      </Note>
    </Section>

    <Section title="Ejemplo resuelto">
      <p>
        Diez piezas medidas con dos materiales, Mat-A y Mat-B,{" "}
        {MU}<Sub>0</Sub> = 0, {ALPHA} = 0,05, bilateral:
      </p>
      <p className="font-mono text-xs">
        {DBAR} = {"\u2212"}0,410 {"\u00b7"} <V>s</V><Sub><V>d</V></Sub> = 0,387 {"\u00b7"} SE ={" "}
        0,387/{"\u221A"}10 = 0,122
      </p>
      <p className="font-mono text-xs">
        <V>t</V> = {"\u2212"}0,410/0,122 = {"\u2212"}3,35 {"\u00b7"} df = 9 {"\u00b7"}{" "}
        <V>p</V> = 0,009
      </p>
      <p className="font-mono text-xs">
        IC 95%: {"\u2212"}0,410 {PM} 2,262 {"\u00B7"} 0,122 ={" "}
        ({"\u2212"}0,687; {"\u2212"}0,133)
      </p>
      <p>
        Como <V>p</V> = 0,009 {"<"} 0,05 se rechaza H{"\u2080"}: Mat-B da valores
        significativamente mayores que Mat-A. El intervalo, enteramente negativo,
        dice lo mismo y adem&aacute;s acota la magnitud: entre 0,13 y 0,69 unidades.
      </p>
      <Note>
        Las medias marginales, 10,630 y 11,040, difieren en 0,410, pero sus
        desviaciones rondan 2,5. Un test de dos muestras independientes sobre estos
        mismos datos no ser&aacute; significativo: la se&iacute;±al solo aparece al emparejar.
      </Note>
    </Section>
  </div>
);

const EN = () => (
  <div className="space-y-5">
    <Section title="What it tests">
      <p>
        The paired <V>t</V> test compares two measurements taken on the{" "}
        <strong>same experimental units</strong>: before and after a change, two
        gauges on the same part, two operators measuring the same batch. Every
        observation in one sample has its twin in the other.
      </p>
      <p>
        It is not a two-sample test applied to similar data: subtracting within each
        pair removes the unit-to-unit variability, usually the dominant source of
        noise. That is why the paired test detects differences an independent
        two-sample test would miss.
      </p>
      <p>
        H{"\u2080"}: {MU}<Sub><V>d</V></Sub> = {MU}<Sub>0</Sub> against
        H{"\u2081"}: {MU}<Sub><V>d</V></Sub> {NEQ} {MU}<Sub>0</Sub> (two-sided),
        or {"<"} / {">"} for one-sided cases. Usually {MU}<Sub>0</Sub> = 0.
      </p>
    </Section>

    <Section title="Reduction to one sample">
      <FormulaD />
      <p>
        The procedure reduces the problem to a one-sample <V>t</V> test on the
        differences. All inference uses {DBAR} and <V>s</V><Sub><V>d</V></Sub>; the
        individual sample standard deviations are descriptive only and play no part
        in the calculation.
      </p>
      <Note>
        Practical consequence: pairing is <strong>by row</strong>. If a value is
        missing in either column, the whole row is dropped. Gaps cannot be filled
        and the columns cannot be reordered independently.
      </Note>
    </Section>

    <Section title="Test statistic">
      <FormulaT />
      <p>
        The <V>p</V>-value is the tail area (or both tails, using the absolute
        value) of the <V>t</V> distribution with <V>n</V>{"\u2212"}1 degrees of
        freedom, where <V>n</V> is the number of <strong>pairs</strong>, not of
        observations.
      </p>
    </Section>

    <Section title="Confidence interval and bounds">
      <FormulaCI />
      <p>
        A two-sided hypothesis yields a two-sided interval. A one-sided hypothesis
        yields a single bound in the direction of H{"\u2081"}. Interval and test
        agree: if {MU}<Sub>0</Sub> falls outside the interval, the test rejects at
        the same {ALPHA} level.
      </p>
    </Section>

    <Section title="Assumptions">
      <ul className="list-disc pl-5 space-y-1">
        <li>Pairs are independent of one another.</li>
        <li>
          The <strong>differences</strong> are approximately normal. The two
          original samples need not be.
        </li>
        <li>No outliers dominating {DBAR} and <V>s</V><Sub><V>d</V></Sub>.</li>
      </ul>
      <Note>
        All three graphs in the report are built on the differences rather than on
        the original samples, precisely because the normality assumption applies to
        them.
      </Note>
    </Section>

    <Section title="Worked example">
      <p>
        Ten parts measured with two materials, Mat-A and Mat-B,{" "}
        {MU}<Sub>0</Sub> = 0, {ALPHA} = 0.05, two-sided:
      </p>
      <p className="font-mono text-xs">
        {DBAR} = {"\u2212"}0,410 {"\u00b7"} <V>s</V><Sub><V>d</V></Sub> = 0,387 {"\u00b7"} SE ={" "}
        0.387/{"\u221A"}10 = 0.122
      </p>
      <p className="font-mono text-xs">
        <V>t</V> = {"\u2212"}0,410/0,122 = {"\u2212"}3,35 {"\u00b7"} df = 9 {"\u00b7"}{" "}
        <V>p</V> = 0.009
      </p>
      <p className="font-mono text-xs">
        95% CI: {"\u2212"}0.410 {PM} 2.262 {"\u00B7"} 0.122 ={" "}
        ({"\u2212"}0.687, {"\u2212"}0.133)
      </p>
      <p>
        Since <V>p</V> = 0.009 {"<"} 0.05, reject H{"\u2080"}: Mat-B yields
        significantly higher values than Mat-A. The interval, entirely negative,
        says the same and bounds the magnitude: between 0.13 and 0.69 units.
      </p>
      <Note>
        The marginal means, 10.630 and 11.040, differ by 0.410, yet their standard
        deviations are around 2.5. An independent two-sample test on the same data
        would not be significant: the signal appears only through pairing.
      </Note>
    </Section>
  </div>
);

export default function HTPairedTTheory() {
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
