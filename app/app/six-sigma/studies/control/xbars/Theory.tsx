// app/app/six-sigma/studies/control/xbars/Theory.tsx
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
const Warn = ({ children }: { children: React.ReactNode }) => (
  <div className="my-2 px-3 py-2 bg-red-50 border-l-4 border-red-500 text-sm">
    {children}
  </div>
);
const Cite = ({ children }: { children: React.ReactNode }) => (
  <sup className="text-[0.7em] text-[#00674d] font-semibold">[{children}]</sup>
);

const REFS = [
  "Shewhart, W. A. (1931). Economic Control of Quality of Manufactured Product. Van Nostrand.",
  "Nelson, L. S. (1984). The Shewhart control chart \u2014 tests for special causes. Journal of Quality Technology, 16(4), 237\u2013239.",
  "Montgomery, D. C. (2013). Introduction to Statistical Quality Control (7th ed.). Wiley.",
  "Burr, I. W. (1969). Control charts for measurements with varying sample sizes. Journal of Quality Technology, 1(3), 163\u2013167.",
  "Wheeler, D. J., & Chambers, D. S. (1992). Understanding Statistical Process Control (2nd ed.). SPC Press.",
  "Bissell, A. F. (1990). How reliable is your capability index? Applied Statistics, 39(3), 331\u2013340.",
];

const Refs = ({ title }: { title: string }) => (
  <section className="space-y-2">
    <h3 className="font-bold text-base text-[#00674d] border-b border-gray-200 pb-1">
      {title}
    </h3>
    <ol className="list-decimal pl-5 space-y-1 text-xs text-gray-600">
      {REFS.map((s, i) => (
        <li key={i}>{s}</li>
      ))}
    </ol>
  </section>
);

const ES = () => (
  <div className="space-y-5">
    <Section title="Por qué S y no R">
      <p>
        Las dos cartas responden a lo mismo: {"\u00BF"}es estable la dispersion
        dentro del subgrupo? La diferencia esta en como la miden.
      </p>
      <p>
        El <strong>rango</strong> usa dos observaciones, la mayor y la menor, e
        ignora las demas. La <strong>desviacion tipica</strong> usa todas. Con
        subgrupos pequenos apenas importa {"\u2014"} con <V>n</V> = 2 son
        equivalentes, porque hay solo dos datos {"\u2014"} pero al crecer <V>n</V>{" "}
        el rango desperdicia cada vez mas informacion.
      </p>
      <Note>
        La regla practica: hasta <V>n</V> = 8, la carta R es casi tan eficiente y
        se calcula a mano. Desde <V>n</V> = 9 conviene la carta S. El rango tiene
        ademas un problema propio: al depender de los extremos, un solo valor
        atipico lo domina por completo.
      </Note>
      <p>
        El rango sobrevive por razones historicas: se calculaba de cabeza en
        planta. Con un ordenador delante, esa ventaja ya no existe.
      </p>
    </Section>

    <Section title="El sesgo de s, y por qué hace falta c4">
      <p>
        Aqui hay algo que sorprende la primera vez. La varianza muestral con{" "}
        <V>n</V>{"\u2212"}1 es un estimador sin sesgo de {"\u03C3"}
        {"\u00B2"}. Pero <strong>su raiz no lo es de {"\u03C3"}</strong>: la raiz
        no conmuta con la esperanza. En concreto
      </p>
      <Formula>
        E[<V>s</V>] = <V>c</V><Sub>4</Sub> {"\u00B7"} {"\u03C3"}
        {"\u00A0\u00A0\u00A0\u00A0"}
        <V>c</V><Sub>4</Sub> = {"\u221A"}(2/(<V>n</V>{"\u2212"}1)) {"\u00B7"}{" "}
        {"\u0393"}(<V>n</V>/2) / {"\u0393"}((<V>n</V>{"\u2212"}1)/2)
      </Formula>
      <p>
        <V>c</V><Sub>4</Sub> siempre es menor que 1, asi que <V>s</V>{" "}
        <strong>subestima</strong> {"\u03C3"} de forma sistematica. Con <V>n</V> =
        2 vale 0,7979 = {"\u221A"}(2/{"\u03C0"}): un sesgo del 20 %. Con <V>n</V> =
        10 ya es 0,9727, y tiende a 1 al crecer <V>n</V>.
      </p>
      <Warn>
        Por eso <V>c</V><Sub>4</Sub> no es una tabla, aunque los libros lo
        presenten asi: es una expresion cerrada con funciones gamma y se puede
        evaluar para cualquier <V>n</V>. Este modulo la calcula, en lugar de
        interpolar, lo que evita el problema de los tamanos grandes que las tablas
        no recogen.
      </Warn>
    </Section>

    <Section title="Los límites">
      <Formula>
        {"\u03C3"}{"\u0302"} = s{"\u0305"} / <V>c</V><Sub>4</Sub>
        {"\u00A0\u00A0\u00A0\u00A0"}
        X{"\u0305"}{"\u0305"} {"\u00B1"} 3 {"\u03C3"}{"\u0302"} / {"\u221A"}
        <V>n</V>
      </Formula>
      <p>
        En la carta de medias, el error tipico de una media es {"\u03C3"}/
        {"\u221A"}<V>n</V>. De ahi que los limites se estrechen al crecer el
        subgrupo: no es que el proceso varie menos, es que la media se estima
        mejor.
      </p>
      <Formula>
        LC(<V>S</V>) = <V>c</V><Sub>4</Sub>{"\u03C3"}{"\u0302"} {"\u00B1"} 3{" "}
        {"\u221A"}(1{"\u2212"}<V>c</V><Sub>4</Sub>
        <sup className="text-[0.7em]">2</sup>) {"\u03C3"}{"\u0302"}
      </Formula>
      <Note>
        Fijese en el centro de la carta S: <strong>no es {"\u03C3"}
        {"\u0302"}</strong>, es <V>c</V><Sub>4</Sub>{"\u03C3"}{"\u0302"}. La linea
        central es el valor esperado de <V>s</V>, no el de {"\u03C3"}, justamente
        por el sesgo. Es el detalle que se cuela en la mayoria de
        implementaciones hechas a mano.
      </Note>
      <Warn>
        El limite inferior de la carta S se recorta en cero, y con <V>n</V> pequeno
        esta siempre ahi: hasta <V>n</V> = 5 el LCL es cero por construccion. La
        carta no puede entonces detectar una <em>reduccion</em> de la
        variabilidad, solo un aumento.
      </Warn>
    </Section>

    <Section title="Sbar o desviación combinada">
      <p>
        Dos maneras de estimar {"\u03C3"} con los mismos datos.
      </p>
      <p>
        <strong>Sbar</strong> promedia las desviaciones, corrigiendo cada una con
        el <V>c</V><Sub>4</Sub> de su tamano.
      </p>
      <p>
        <strong>Combinada</strong> promedia las <em>varianzas</em> con peso{" "}
        <V>n</V>{"\u2212"}1 y luego extrae la raiz.
      </p>
      <Note>
        Si todos los subgrupos comparten de verdad la misma {"\u03C3"}, la
        combinada es mas eficiente. Si no la comparten, es la que mas se
        distorsiona: elevar al cuadrado agranda la contribucion de los subgrupos
        dispersos. Sbar es mas robusta, y por eso es el valor por omision aqui.
      </Note>
      <p>
        La diferencia entre ambas suele quedarse en el tercer decimal. Si en un
        caso concreto es grande, eso ya es informacion: significa que los
        subgrupos no comparten dispersion, y entonces el problema no es que metodo
        elegir sino que la carta S ya deberia estar senalando.
      </p>
    </Section>

    <Section title="El orden de lectura">
      <Warn>
        <strong>Primero la carta S, siempre.</strong> Los limites de la carta de
        medias se construyen con {"\u03C3"}{"\u0302"}, que sale de la dispersion
        dentro de los subgrupos. Si esa dispersion no es estable, esos limites no
        describen nada y la carta de medias no se puede interpretar {"\u2014"}
        muestre lo que muestre.
      </Warn>
      <p>
        Y hay una lectura conjunta que vale la pena: si se mueve solo la carta de
        medias, algo desplazo el nivel sin tocar la variabilidad (un ajuste, un
        lote de material, un cambio de utillaje). Si se mueve la S, ha cambiado el
        propio mecanismo de variacion (desgaste, holgura, un operario distinto).
      </p>
    </Section>

    <Section title="Los ocho tests, y los cuatro">
      <p>
        En la carta de medias se aplican los ocho de Nelson<Cite>2</Cite>: por el
        teorema central del limite la media de un subgrupo es aproximadamente
        normal aunque las observaciones no lo sean, asi que las zonas sigma que
        leen los tests 5 a 8 significan algo.
      </p>
      <p>
        En la carta S solo los cuatro primeros. La distribucion de <V>s</V> es
        asimetrica {"\u2014"} sesgada a la derecha, y bastante con <V>n</V> pequeno
        {"\u2014"} de modo que unas zonas simetricas alrededor del centro no
        reparten la probabilidad como los tests suponen.
      </p>
      <Note>
        Es el mismo criterio que en las cartas de atributos, y por la misma razon:
        los tests 5 a 8 solo son validos donde la simetria se sostiene.
      </Note>
    </Section>

    <Section title="Ejemplo resuelto">
      <p>
        120 subgrupos de 2 (dos columnas, <V>filler1</V> y <V>filler2</V>).{" "}
        s{"\u0305"} = 2,1394 y <V>c</V><Sub>4</Sub>(2) = 0,7979, luego{" "}
        {"\u03C3"}{"\u0302"} = 2,1394 / 0,7979 = 2,6813.
      </p>
      <p>
        X{"\u0305"}{"\u0305"} = 220,509 y {"\u03C3"}{"\u0302"}/{"\u221A"}2 =
        1,8961, de donde los limites 220,509 {"\u00B1"} 5,688 {"\u2192"} 226,197 y
        214,821.
      </p>
      <p>
        En la carta S el centro es 0,7979 {"\u00D7"} 2,6813 = 2,1394 {"\u2014"} que
        coincide con s{"\u0305"}, como debe ser {"\u2014"} y el UCL es 6,988. El
        LCL sale negativo y se recorta a cero.
      </p>
      <Note>
        Falla el subgrupo 6 en las dos cartas, y ademas los subgrupos 54 y 72 en
        la carta S. Esa coincidencia en el 6 no es casual: cuando una sola
        observacion se dispara {"\u2014"} aqui 232,570 frente a 220,099{" "}
        {"\u2014"} con <V>n</V> = 2 arrastra a la vez la media y la desviacion del
        subgrupo. Con subgrupos de dos, las dos cartas no son independientes, y una
        senal simultanea suele ser <em>un</em> dato raro, no dos problemas.
      </Note>
    </Section>

    <Refs title="Bibliografía" />
  </div>
);

const EN = () => (
  <div className="space-y-5">
    <Section title="Why S and not R">
      <p>
        Both charts answer the same question: is the within-subgroup spread stable?
        They differ in how they measure it.
      </p>
      <p>
        The <strong>range</strong> uses two observations, the largest and the
        smallest, and ignores the rest. The <strong>standard deviation</strong>{" "}
        uses all of them. With small subgroups it hardly matters {"\u2014"} at{" "}
        <V>n</V> = 2 they are equivalent, since there are only two values{" "}
        {"\u2014"} but as <V>n</V> grows the range wastes more and more
        information.
      </p>
      <Note>
        The practical rule: up to <V>n</V> = 8 the R chart is nearly as efficient
        and can be done by hand. From <V>n</V> = 9 the S chart is the better
        choice. The range has a further weakness: depending on the extremes, a
        single outlier dominates it completely.
      </Note>
      <p>
        The range survives for historical reasons {"\u2014"} it could be computed
        in the head on the shop floor. With a computer to hand, that advantage is
        gone.
      </p>
    </Section>

    <Section title="The bias of s, and why c4 is needed">
      <p>
        Here is something that surprises on first sight. The sample variance with{" "}
        <V>n</V>{"\u2212"}1 is an unbiased estimator of {"\u03C3"}
        {"\u00B2"}. But <strong>its square root is not unbiased for {"\u03C3"}
        </strong>: the root does not commute with the expectation. Specifically
      </p>
      <Formula>
        E[<V>s</V>] = <V>c</V><Sub>4</Sub> {"\u00B7"} {"\u03C3"}
        {"\u00A0\u00A0\u00A0\u00A0"}
        <V>c</V><Sub>4</Sub> = {"\u221A"}(2/(<V>n</V>{"\u2212"}1)) {"\u00B7"}{" "}
        {"\u0393"}(<V>n</V>/2) / {"\u0393"}((<V>n</V>{"\u2212"}1)/2)
      </Formula>
      <p>
        <V>c</V><Sub>4</Sub> is always below 1, so <V>s</V>{" "}
        <strong>systematically underestimates</strong> {"\u03C3"}. At <V>n</V> = 2
        it is 0.7979 = {"\u221A"}(2/{"\u03C0"}), a 20 % bias. At <V>n</V> = 10 it is
        already 0.9727, tending to 1 as <V>n</V> grows.
      </p>
      <Warn>
        This is why <V>c</V><Sub>4</Sub> is not really a table, though books
        present it as one: it is a closed expression in gamma functions and can be
        evaluated for any <V>n</V>. This module computes it rather than
        interpolating, which avoids the problem of large sizes the tables do not
        cover.
      </Warn>
    </Section>

    <Section title="The limits">
      <Formula>
        {"\u03C3"}{"\u0302"} = s{"\u0305"} / <V>c</V><Sub>4</Sub>
        {"\u00A0\u00A0\u00A0\u00A0"}
        X{"\u0305"}{"\u0305"} {"\u00B1"} 3 {"\u03C3"}{"\u0302"} / {"\u221A"}
        <V>n</V>
      </Formula>
      <p>
        On the chart of means the standard error of a mean is {"\u03C3"}/{"\u221A"}
        <V>n</V>. Hence the limits tighten as the subgroup grows: not because the
        process varies less, but because the mean is estimated better.
      </p>
      <Formula>
        CL(<V>S</V>) = <V>c</V><Sub>4</Sub>{"\u03C3"}{"\u0302"} {"\u00B1"} 3{" "}
        {"\u221A"}(1{"\u2212"}<V>c</V><Sub>4</Sub>
        <sup className="text-[0.7em]">2</sup>) {"\u03C3"}{"\u0302"}
      </Formula>
      <Note>
        Look at the centre of the S chart: <strong>it is not {"\u03C3"}
        {"\u0302"}</strong>, it is <V>c</V><Sub>4</Sub>{"\u03C3"}{"\u0302"}. The
        centre line is the expected value of <V>s</V>, not of {"\u03C3"}, precisely
        because of the bias. This is the detail most hand-rolled implementations
        get wrong.
      </Note>
      <Warn>
        The lower limit of the S chart is clipped at zero, and with small <V>n</V>
        it is always there: up to <V>n</V> = 5 the LCL is zero by construction. The
        chart then cannot detect a <em>reduction</em> in variability, only an
        increase.
      </Warn>
    </Section>

    <Section title="Sbar or pooled">
      <p>Two ways to estimate {"\u03C3"} from the same data.</p>
      <p>
        <strong>Sbar</strong> averages the standard deviations, correcting each
        with the <V>c</V><Sub>4</Sub> of its own size.
      </p>
      <p>
        <strong>Pooled</strong> averages the <em>variances</em> weighted by{" "}
        <V>n</V>{"\u2212"}1 and then takes the root.
      </p>
      <Note>
        If every subgroup genuinely shares the same {"\u03C3"}, pooled is more
        efficient. If they do not, pooled is the more distorted: squaring inflates
        the contribution of the scattered subgroups. Sbar is more robust, and is
        the default here.
      </Note>
      <p>
        The difference between them usually sits in the third decimal. If in a
        given case it is large, that is itself information: it means the subgroups
        do not share a spread, and then the question is not which method to pick
        but why the S chart is not already signalling.
      </p>
    </Section>

    <Section title="The order of reading">
      <Warn>
        <strong>The S chart first, always.</strong> The limits on the chart of
        means are built from {"\u03C3"}{"\u0302"}, which comes from the
        within-subgroup spread. If that spread is not stable, those limits describe
        nothing and the chart of means cannot be interpreted {"\u2014"} whatever it
        shows.
      </Warn>
      <p>
        And there is a joint reading worth having: if only the chart of means
        moves, something shifted the level without touching the variability (a
        setting, a batch of material, a changeover). If the S chart moves, the
        mechanism of variation itself has changed (wear, play, a different
        operator).
      </p>
    </Section>

    <Section title="Eight tests, and four">
      <p>
        On the chart of means all eight of Nelson{"\u2019"}s apply<Cite>2</Cite>:
        by the central limit theorem a subgroup mean is approximately normal even
        when the observations are not, so the sigma zones read by tests 5 to 8 mean
        something.
      </p>
      <p>
        On the S chart only the first four. The distribution of <V>s</V> is skewed
        {"\u2014"} to the right, and markedly so at small <V>n</V> {"\u2014"} so
        symmetric zones about the centre do not carry the probabilities those tests
        assume.
      </p>
      <Note>
        The same criterion as on the attribute charts, and for the same reason:
        tests 5 to 8 are valid only where symmetry holds.
      </Note>
    </Section>

    <Section title="Worked example">
      <p>
        120 subgroups of 2 (two columns, <V>filler1</V> and <V>filler2</V>).{" "}
        s{"\u0305"} = 2.1394 and <V>c</V><Sub>4</Sub>(2) = 0.7979, so {"\u03C3"}
        {"\u0302"} = 2.1394 / 0.7979 = 2.6813.
      </p>
      <p>
        X{"\u0305"}{"\u0305"} = 220.509 and {"\u03C3"}{"\u0302"}/{"\u221A"}2 =
        1.8961, giving limits 220.509 {"\u00B1"} 5.688 {"\u2192"} 226.197 and
        214.821.
      </p>
      <p>
        On the S chart the centre is 0.7979 {"\u00D7"} 2.6813 = 2.1394 {"\u2014"}
        which coincides with s{"\u0305"}, as it must {"\u2014"} and the UCL is
        6.988. The LCL comes out negative and is clipped to zero.
      </p>
      <Note>
        Subgroup 6 fails on both charts, and subgroups 54 and 72 fail on the S
        chart. The coincidence at 6 is not accidental: when a single observation
        jumps {"\u2014"} here 232.570 against 220.099 {"\u2014"} with <V>n</V> = 2 it
        drags the subgroup mean and its standard deviation at the same time. With
        subgroups of two the charts are not independent, and a simultaneous signal
        usually means <em>one</em> odd value, not two problems.
      </Note>
    </Section>

    <Refs title="References" />
  </div>
);

export default function XbarSTheory() {
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
