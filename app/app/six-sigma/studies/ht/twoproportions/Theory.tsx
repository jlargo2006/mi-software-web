// app/app/six-sigma/studies/ht/twoproportions/Theory.tsx
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
const PHAT = "p\u0302";
const PBAR = "p\u0304";

const FormulaCI = () => (
  <Formula>
    ({PHAT}<Sub>1</Sub> {MINUS} {PHAT}<Sub>2</Sub>) {"\u00B1"} <V>z</V>
    <Sub>{ALPHA}/2</Sub>{" "}
    <Sqrt>
      <Frac
        num={<>{PHAT}<Sub>1</Sub>(1{MINUS}{PHAT}<Sub>1</Sub>)</>}
        den={<><V>n</V><Sub>1</Sub></>}
      />
      +
      <Frac
        num={<>{PHAT}<Sub>2</Sub>(1{MINUS}{PHAT}<Sub>2</Sub>)</>}
        den={<><V>n</V><Sub>2</Sub></>}
      />
    </Sqrt>
  </Formula>
);

const FormulaZ = () => (
  <Formula>
    <div className="space-y-2">
      <div>
        {PBAR} ={" "}
        <Frac
          num={<><V>x</V><Sub>1</Sub> + <V>x</V><Sub>2</Sub></>}
          den={<><V>n</V><Sub>1</Sub> + <V>n</V><Sub>2</Sub></>}
        />
      </div>
      <div>
        <V>z</V> ={" "}
        <Frac
          num={<>{PHAT}<Sub>1</Sub> {MINUS} {PHAT}<Sub>2</Sub></>}
          den={
            <Sqrt>
              {PBAR}(1{MINUS}{PBAR}) (
              <Frac num={<>1</>} den={<><V>n</V><Sub>1</Sub></>} /> +
              <Frac num={<>1</>} den={<><V>n</V><Sub>2</Sub></>} />)
            </Sqrt>
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
        Compara la <strong>proporci&oacute;n de eventos</strong> de dos muestras
        independientes: tasas de defecto, de aprobaci&oacute;n, de conversi&oacute;n.
        Los datos entran resumidos, como recuentos de eventos y de ensayos.
      </p>
      <p>
        H{"\u2080"}: p<Sub>1</Sub> {MINUS} p<Sub>2</Sub> = 0 frente a H{"\u2081"}: p
        <Sub>1</Sub> {MINUS} p<Sub>2</Sub> {NEQ} 0, o {"<"} / {">"} en los casos
        unilaterales.
      </p>
      <p>
        Cada observaci&oacute;n debe ser binaria e independiente, y las dos muestras
        no relacionadas entre s&iacute;. Con datos emparejados el contraste adecuado
        es otro.
      </p>
    </Section>

    <Section title="El intervalo usa varianzas separadas">
      <FormulaCI />
      <p>
        El intervalo estima la diferencia sin suponer nada sobre ella, de modo que
        cada muestra aporta <strong>su propia</strong> proporci&oacute;n a la
        varianza. Es el intervalo de Wald, basado en la aproximaci&oacute;n normal.
      </p>
    </Section>

    <Section title="El test usa la proporción combinada">
      <FormulaZ />
      <Note>
        Intervalo y test <strong>no comparten denominador</strong>, y eso es
        deliberado. El informe permite desactivar la combinaci&oacute;n: con
        varianzas separadas el ejemplo de abajo dar&iacute;a <V>z</V> = {MINUS}4,17
        en lugar de {MINUS}4,33. Ambos valores son correctos; el segundo es el
        contraste por defecto y el m&aacute;s potente bajo H{"\u2080"}.
      </Note>
      <Note>
        Es el error m&aacute;s frecuente al implementar este estudio:{" "}
        <strong>el intervalo y el test no comparten denominador</strong>. En el
        ejemplo de abajo, emplear la varianza del intervalo tambi&eacute;n en el test
        dar&iacute;a <V>z</V> = {MINUS}4,17 en lugar de {MINUS}4,33.
      </Note>
      <p>
        Como consecuencia, intervalo y p-valor pueden discrepar en casos l&iacute;mite:
        un intervalo que roza el cero con un p-valor algo por debajo de {ALPHA}. No es
        un fallo, sino dos estimaciones de varianza distintas.
      </p>
      <Note>
        Con una diferencia hipot&eacute;tica <strong>distinta de cero</strong> la nula
        ya no implica igualdad de proporciones, y entonces no cabe combinar: el
        contraste pasa a usar varianzas separadas.
      </Note>
    </Section>

    <Section title="El test exacto de Fisher">
      <p>
        Fisher no aproxima nada: fija los totales marginales de la tabla 2{"\u00D7"}2 y
        calcula la probabilidad hipergeom&eacute;trica exacta de cada tabla posible. El
        p-valor bilateral suma las tablas cuya probabilidad{" "}
        <strong>no supera la observada</strong>.
      </p>
      <Note>
        Ese criterio no equivale a doblar una cola. Con tablas asim&eacute;tricas ambos
        m&eacute;todos difieren, y el de suma de probabilidades es el que reproduce el
        informe.
      </Note>
      <p>
        Es el contraste preferible cuando alguna frecuencia esperada baja de 5, donde
        la aproximaci&oacute;n normal deja de ser fiable. Con muestras grandes ambos
        p-valores casi coinciden.
      </p>
    </Section>

    <Section title="Ejemplo resuelto">
      <p>Dos muestras con tasas de &eacute;xito distintas, {ALPHA} = 0,05, bilateral:</p>
      <p className="font-mono text-xs">
        Muestra 1: 510/600 = 0,850000 {"\u00b7"} Muestra 2: 212/225 = 0,942222
      </p>
      <p className="font-mono text-xs">
        Diferencia = {MINUS}0,0922222 {"\u00b7"} IC 95%: ({MINUS}0,134005;{" "}
        {MINUS}0,050440)
      </p>
      <p className="font-mono text-xs">
        {PBAR} = 722/825 = 0,875152 {"\u00b7"} <V>z</V> = {MINUS}4,33 {"\u00b7"}{" "}
        <V>p</V> = 0,000
      </p>
      <p className="font-mono text-xs">Fisher exacto: <V>p</V> = 0,000</p>
      <p>
        La segunda muestra tiene una tasa de evento claramente superior. El intervalo
        queda enteramente por debajo de cero, lo que coincide con el rechazo de H
        {"\u2080"}, y ambos m&eacute;todos concuerdan porque las muestras son grandes.
      </p>
    </Section>

    <Section title="Cuándo usarlo">
      <p>
        Para comparar dos tasas: antes y despu&eacute;s de un cambio de proceso, dos
        proveedores, dos turnos, dos variantes de un dise&ntilde;o. Con m&aacute;s de
        dos grupos, el contraste adecuado es una chi-cuadrado de independencia.
      </p>
    </Section>
  </div>
);

const EN = () => (
  <div className="space-y-5">
    <Section title="What it tests">
      <p>
        Compares the <strong>event proportion</strong> of two independent samples:
        defect rates, pass rates, conversion rates. Data are entered as summarized
        counts of events and trials.
      </p>
      <p>
        H{"\u2080"}: p<Sub>1</Sub> {MINUS} p<Sub>2</Sub> = 0 against H{"\u2081"}: p
        <Sub>1</Sub> {MINUS} p<Sub>2</Sub> {NEQ} 0, or {"<"} / {">"} one-sided.
        Observations must be binary and independent, and the samples unrelated.
      </p>
    </Section>

    <Section title="The interval uses separate variances">
      <FormulaCI />
      <p>
        The interval estimates the difference without assuming anything about it, so
        each sample contributes <strong>its own</strong> proportion to the variance.
        This is the Wald interval based on the normal approximation.
      </p>
    </Section>

    <Section title="The test uses the pooled proportion">
      <FormulaZ />
      <Note>
        Interval and test <strong>do not share a denominator</strong>, and that is
        deliberate. Pooling can be switched off: with separate variances the
        example below gives <V>z</V> = {MINUS}4.17 instead of {MINUS}4.33. Both are
        correct; the latter is the default and the more powerful under H{"\u2080"}.
      </Note>
      <Note>
        This is the most common implementation error:{" "}
        <strong>interval and test do not share a denominator</strong>. Using the
        interval&apos;s variance in the test below would give <V>z</V> = {MINUS}4.17
        instead of {MINUS}4.33.
      </Note>
      <p>
        As a result the interval and the p-value can disagree in borderline cases.
        That is not a bug but two different variance estimates.
      </p>
      <Note>
        With a <strong>non-zero</strong> hypothesized difference the null no longer
        implies equal proportions, so pooling is dropped in favour of separate
        variances.
      </Note>
    </Section>

    <Section title="Fisher's exact test">
      <p>
        Fisher approximates nothing: it fixes the marginal totals of the 2{"\u00D7"}2
        table and computes the exact hypergeometric probability of every possible
        table. The two-sided p-value sums those tables whose probability{" "}
        <strong>does not exceed the observed one</strong>.
      </p>
      <Note>
        That criterion is not the same as doubling one tail; with asymmetric tables
        the two differ, and the probability-sum method is the one matching the report.
      </Note>
      <p>
        It is preferable whenever an expected count falls below 5. With large samples
        both p-values nearly coincide.
      </p>
    </Section>

    <Section title="Worked example">
      <p>Two samples with different success rates, {ALPHA} = 0.05, two-sided:</p>
      <p className="font-mono text-xs">
        Sample 1: 510/600 = 0.850000 {"\u00b7"} Sample 2: 212/225 = 0.942222
      </p>
      <p className="font-mono text-xs">
        Difference = {MINUS}0.0922222 {"\u00b7"} 95% CI: ({MINUS}0.134005;{" "}
        {MINUS}0.050440)
      </p>
      <p className="font-mono text-xs">
        {PBAR} = 0.875152 {"\u00b7"} <V>z</V> = {MINUS}4.33 {"\u00b7"} <V>p</V> =
        0.000 {"\u00b7"} Fisher: <V>p</V> = 0.000
      </p>
      <p>
        The second sample has a clearly higher event rate. The interval lies entirely
        below zero, consistent with rejecting H{"\u2080"}, and both methods agree
        because the samples are large.
      </p>
    </Section>

    <Section title="When to use it">
      <p>
        To compare two rates: before and after a process change, two suppliers, two
        shifts, two design variants. With more than two groups use a chi-square test
        of independence.
      </p>
    </Section>
  </div>
);

export default function HTTwoProportionsTheory() {
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
