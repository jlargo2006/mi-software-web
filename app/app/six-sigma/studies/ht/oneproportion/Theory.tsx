// app/app/six-sigma/studies/ht/oneproportion/Theory.tsx
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

const ALPHA = "\u03B1";
const NEQ = "\u2260";
const MINUS = "\u2212";
const LE = "\u2264";
const SUM = "\u2211";
const PHAT = "p\u0302";

const FormulaExact = () => (
  <Formula>
    <div className="space-y-2">
      <div>
        <V>p</V><Sub>L</Sub> = <V>B</V><Sup2>{MINUS}1</Sup2>
        <Sub>{ALPHA}/2</Sub>(<V>x</V>, <V>n</V>{MINUS}<V>x</V>+1)
      </div>
      <div>
        <V>p</V><Sub>U</Sub> = <V>B</V><Sup2>{MINUS}1</Sup2>
        <Sub>1{MINUS}{ALPHA}/2</Sub>(<V>x</V>+1, <V>n</V>{MINUS}<V>x</V>)
      </div>
    </div>
  </Formula>
);

const Sup2 = ({ children }: { children: React.ReactNode }) => (
  <sup className="text-[0.7em]">{children}</sup>
);

const FormulaZ = () => (
  <Formula>
    <V>z</V> ={" "}
    <Frac
      num={<>{PHAT} {MINUS} <V>p</V><Sub>0</Sub></>}
      den={
        <Sqrt>
          <Frac
            num={<><V>p</V><Sub>0</Sub>(1{MINUS}<V>p</V><Sub>0</Sub>)</>}
            den={<><V>n</V></>}
          />
        </Sqrt>
      }
    />
  </Formula>
);

const ES = () => (
  <div className="space-y-5">
    <Section title="Qué contrasta">
      <p>
        Compara la <strong>proporci&oacute;n de eventos</strong> de una muestra con un
        valor de referencia conocido: una especificaci&oacute;n, un objetivo, un
        hist&oacute;rico. Los datos entran resumidos, como recuento de eventos y de
        ensayos.
      </p>
      <p>
        H{"\u2080"}: <V>p</V> = <V>p</V><Sub>0</Sub> frente a H{"\u2081"}: <V>p</V>{" "}
        {NEQ} <V>p</V><Sub>0</Sub>, o {"<"} / {">"} en los casos unilaterales.
      </p>
      <p>
        Cada observaci&oacute;n debe ser binaria e independiente, con probabilidad
        constante a lo largo de la muestra.
      </p>
    </Section>

    <Section title="El método exacto">
      <FormulaExact />
      <p>
        El intervalo de <strong>Clopper-Pearson</strong> se obtiene invirtiendo
        directamente la distribuci&oacute;n binomial, usando los cuantiles de la Beta.
        No supone normalidad y es v&aacute;lido para{" "}
        <strong>cualquier tama&ntilde;o de muestra</strong>.
      </p>
      <Note>
        Es un intervalo <strong>conservador</strong>: su cobertura real nunca cae por
        debajo del nivel pedido, pero suele superarlo. Ese es el precio de la
        exactitud, y se traduce en un intervalo algo m&aacute;s ancho que el de Wilson.
      </Note>
      <p>
        El p-valor exacto suma la probabilidad de todos los recuentos cuya masa
        binomial <strong>no supera la del observado</strong>. No es doblar una cola:
        la binomial es asim&eacute;trica salvo cuando <V>p</V><Sub>0</Sub> = 0,5, y
        ambos criterios difieren.
      </p>
      <Note>
        El m&eacute;todo exacto <strong>no produce estad&iacute;stico Z</strong>. Por
        eso el informe muestra solo la columna de p-valor, sin columna de Z.
      </Note>
    </Section>

    <Section title="La aproximación normal">
      <FormulaZ />
      <p>
        Alternativa cl&aacute;sica basada en el teorema central del l&iacute;mite.
        Repara en el denominador: el test usa <V>p</V><Sub>0</Sub>, no {PHAT}, porque
        bajo H{"\u2080"} la varianza queda determinada por la hip&oacute;tesis.
      </p>
      <Note>
        El intervalo de Wald, en cambio, s&iacute; usa {PHAT}: no hay ninguna
        hip&oacute;tesis que imponer al estimar. Como en el estudio de dos
        proporciones, intervalo y test pueden no compartir denominador.
      </Note>
      <p>
        La regla habitual pide <V>np</V><Sub>0</Sub> {"\u2265"} 5 y{" "}
        <V>n</V>(1{MINUS}<V>p</V><Sub>0</Sub>) {"\u2265"} 5. Con proporciones muy
        cercanas a 0 o a 1 la aproximaci&oacute;n falla, y el intervalo de Wald puede
        llegar a salirse del rango [0, 1].
      </p>
    </Section>

    <Section title="Ejemplo resuelto">
      <p>
        Un proceso con objetivo del 99% de conformes, {ALPHA} = 0,05, bilateral,
        m&eacute;todo exacto:
      </p>
      <p className="font-mono text-xs">
        <V>x</V> = 480, <V>n</V> = 500 {"\u00b7"} {PHAT} = 0,960000
      </p>
      <p className="font-mono text-xs">
        IC 95% Clopper-Pearson: (0,938897; 0,975399)
      </p>
      <p className="font-mono text-xs">
        H{"\u2080"}: <V>p</V> = 0,99 {"\u00b7"} <V>p</V>-valor = 0,000
      </p>
      <p>
        El objetivo de 0,99 queda <strong>fuera del intervalo</strong> por su extremo
        superior, y el p-valor confirma el rechazo: el proceso rinde por debajo de lo
        exigido. Con 480 conformes de 500 lo esperado bajo H{"\u2080"} ser&iacute;an
        495, una discrepancia demasiado grande para el azar.
      </p>
      <Note>
        Aqu&iacute; la aproximaci&oacute;n normal dar&iacute;a <V>z</V> = {MINUS}6,74.
        Ambos m&eacute;todos rechazan con holgura, pero {PHAT} = 0,96 est&aacute;
        bastante cerca del borde y con muestras menores la discrepancia entre ambos
        crecer&iacute;a.
      </Note>
    </Section>

    <Section title="Cuándo usarlo">
      <p>
        Para validar una tasa contra un est&aacute;ndar: {"\u00bf"}cumple el lote la
        especificaci&oacute;n del 99%? {"\u00bf"}se mantiene la tasa de defecto
        hist&oacute;rica? Con dos grupos que comparar entre s&iacute;, el contraste
        adecuado es el de dos proporciones.
      </p>
      <p>
        Elige siempre el m&eacute;todo exacto salvo que necesites reproducir un
        informe antiguo basado en la aproximaci&oacute;n normal.
      </p>
    </Section>
  </div>
);

const EN = () => (
  <div className="space-y-5">
    <Section title="What it tests">
      <p>
        Compares the <strong>event proportion</strong> of one sample against a known
        reference value: a specification, a target, a historical rate. Data are
        entered as summarized counts of events and trials.
      </p>
      <p>
        H{"\u2080"}: <V>p</V> = <V>p</V><Sub>0</Sub> against H{"\u2081"}: <V>p</V>{" "}
        {NEQ} <V>p</V><Sub>0</Sub>, or {"<"} / {">"} one-sided. Observations must be
        binary, independent and equally likely throughout.
      </p>
    </Section>

    <Section title="The exact method">
      <FormulaExact />
      <p>
        The <strong>Clopper-Pearson</strong> interval inverts the binomial
        distribution directly through Beta quantiles. It assumes no normality and is
        valid for <strong>any sample size</strong>.
      </p>
      <Note>
        It is <strong>conservative</strong>: actual coverage never drops below the
        requested level but usually exceeds it, which makes it slightly wider than
        Wilson&apos;s.
      </Note>
      <p>
        The exact p-value sums the probability of every count whose binomial mass{" "}
        <strong>does not exceed the observed one</strong> — not the same as doubling
        a tail, since the binomial is asymmetric unless <V>p</V><Sub>0</Sub> = 0.5.
      </p>
      <Note>
        The exact method yields <strong>no Z statistic</strong>, so the report shows
        only a p-value column.
      </Note>
    </Section>

    <Section title="The normal approximation">
      <FormulaZ />
      <p>
        Note the denominator: the test uses <V>p</V><Sub>0</Sub>, not {PHAT}, because
        under H{"\u2080"} the variance is fixed by the hypothesis. The Wald interval
        does use {PHAT}, since estimation imposes no hypothesis.
      </p>
      <p>
        The usual rule requires <V>np</V><Sub>0</Sub> {"\u2265"} 5 and{" "}
        <V>n</V>(1{MINUS}<V>p</V><Sub>0</Sub>) {"\u2265"} 5. Near 0 or 1 the
        approximation breaks down and Wald can even leave the [0, 1] range.
      </p>
    </Section>

    <Section title="Worked example">
      <p>A process targeting 99% conforming, {ALPHA} = 0.05, two-sided, exact:</p>
      <p className="font-mono text-xs">
        <V>x</V> = 480, <V>n</V> = 500 {"\u00b7"} {PHAT} = 0.960000
      </p>
      <p className="font-mono text-xs">
        95% Clopper-Pearson CI: (0.938897; 0.975399)
      </p>
      <p className="font-mono text-xs">
        H{"\u2080"}: <V>p</V> = 0.99 {"\u00b7"} <V>p</V>-value = 0.000
      </p>
      <p>
        The 0.99 target lies <strong>above the interval</strong>, and the p-value
        confirms rejection: the process runs below requirement. With 480 of 500
        conforming against 495 expected, the gap is too large for chance.
      </p>
      <Note>
        The normal approximation would give <V>z</V> = {MINUS}6.74 here. Both reject
        comfortably, but the two would diverge with smaller samples.
      </Note>
    </Section>

    <Section title="When to use it">
      <p>
        To validate a rate against a standard. With two groups to compare against
        each other, use the two-proportions test instead. Prefer the exact method
        unless reproducing an older report.
      </p>
    </Section>
  </div>
);

export default function HTOneProportionTheory() {
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
