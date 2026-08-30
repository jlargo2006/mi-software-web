// app/app/six-sigma/studies/control/laneyp/Theory.tsx
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
  "Laney, D. B. (2002). Improved control charts for attributes. Quality Engineering, 14(4), 531\u2013537.",
  "Heimann, P. A. (1996). Attributes control charts with large sample sizes. Journal of Quality Technology, 28(4), 451\u2013459.",
  "Nelson, L. S. (1984). The Shewhart control chart \u2014 tests for special causes. Journal of Quality Technology, 16(4), 237\u2013239.",
  "Montgomery, D. C. (2013). Introduction to Statistical Quality Control (7th ed.). Wiley.",
  "Wheeler, D. J. (2011). What about p-charts? Quality Digest.",
  "Mohammed, M. A., & Laney, D. (2006). Overdispersion in health care performance data. Statistics in Medicine, 25(7), 1182\u20131192.",
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
    <Section title="El problema que resuelve">
      <p>
        Una carta P construye sus limites a partir de un solo numero: la
        proporcion central. La binomial no tiene un parametro de dispersion
        aparte, asi que p{"\u0305"} fija a la vez el centro <em>y</em> la
        anchura.
      </p>
      <p>
        Eso funciona si dentro de cada subgrupo todas las unidades comparten la
        misma probabilidad de fallar y son independientes. Con subgrupos grandes
        casi nunca se cumple: los lotes difieren, los turnos difieren, las
        maquinas difieren. La variacion real supera entonces a la binomial, los
        limites salen demasiado estrechos y{" "}
        <strong>la carta senala sin parar sobre ruido ordinario</strong>.
        <Cite>2</Cite>
      </p>
      <Warn>
        Con subgrupos de miles de unidades el efecto es brutal: los limites se
        estrechan como 1/{"\u221A"}<V>n</V> y acaban tan pegados al centro que
        practicamente todos los puntos quedan fuera. Es el escenario tipico en
        datos administrativos y sanitarios.<Cite>6</Cite>
      </Warn>
    </Section>

    <Section title="La idea de Laney">
      <p>
        Laney<Cite>1</Cite> observo que la solucion ya estaba inventada: si no se
        conoce la dispersion teorica, se <em>mide</em>. Es lo que hace una carta
        de individuos con el rango movil.
      </p>
      <p>Tres pasos.</p>
      <p>
        <strong>Uno.</strong> Se calcula la carta P de siempre: p{"\u0305"} y la
        sigma binomial de cada subgrupo.
      </p>
      <Formula>
        {"\u03C3"}<Sub>pi</Sub> = {"\u221A"}( p{"\u0305"}(1{"\u2212"}p{"\u0305"})
        / <V>n</V><Sub>i</Sub> )
      </Formula>
      <p>
        <strong>Dos.</strong> Se estandarizan los puntos y se mide cuanto se
        dispersan <em>de verdad</em>.
      </p>
      <Formula>
        <V>z</V><Sub>i</Sub> = (<V>p</V><Sub>i</Sub> {"\u2212"} p{"\u0305"}) /{" "}
        {"\u03C3"}<Sub>pi</Sub>
        {"\u00A0\u00A0\u00A0\u00A0"}
        {"\u03C3"}<Sub>Z</Sub> = MR{"\u0305"}<Sub>z</Sub> / 1,128
      </Formula>
      <p>
        <strong>Tres.</strong> Se reescalan los limites de la P con ese factor.
      </p>
      <Formula>
        LC = p{"\u0305"} {"\u00B1"} 3 {"\u00B7"} {"\u03C3"}<Sub>pi</Sub>{" "}
        {"\u00B7"} {"\u03C3"}<Sub>Z</Sub>
      </Formula>
      <Note>
        Si {"\u03C3"}<Sub>Z</Sub> = 1, los puntos se dispersan justo lo que la
        binomial predice y la carta P{"\u2032"} coincide con la P.{" "}
        <strong>La carta P es el caso particular</strong>, no una carta
        distinta.
      </Note>
    </Section>

    <Section title="Por qué el rango móvil, y no la desviación típica">
      <p>
        Es el punto mas fino de la construccion. Podria calcularse la desviacion
        tipica de los <V>z</V> directamente, pero seria un error: esa desviacion
        incluye los cambios de nivel de largo plazo, y son precisamente lo que la
        carta debe <em>detectar</em>.
      </p>
      <Warn>
        Estimar la dispersion con algo que ya contiene las senales las hace
        desaparecer: los limites se ensanchan hasta abarcar el propio
        desplazamiento que se buscaba. El rango movil mide solo la variacion{" "}
        <em>entre puntos consecutivos</em> y es casi inmune a un cambio de nivel
        sostenido.
      </Warn>
      <p>
        Es exactamente el argumento de las cartas de variables: la sigma de corto
        plazo viene de dentro del subgrupo, nunca de la dispersion global. Y{" "}
        1,128 es <V>d</V><Sub>2</Sub> para <V>n</V> = 2, la misma constante que
        una I-MR.
      </p>
      <Note>
        Detalle de implementacion: los rangos moviles exigen adyacencia real. Los
        subgrupos omitidos siguen participando en ellos, porque saltarse un punto
        crearia un salto artificial que infla {"\u03C3"}<Sub>Z</Sub> y ensancha
        los limites {"\u2014"} lo contrario de lo que se busca al omitir un punto
        anomalo. Y no se cruzan las fronteras de etapa.
      </Note>
    </Section>

    <Section title="Cómo leer Sigma Z">
      <p>
        No es un tecnicismo interno: es el resultado principal de la carta, y por
        eso va en el subtitulo.
      </p>
      <p>
        <strong>{"\u2248"} 1.</strong> La binomial describe bien los datos. Use la
        carta P: es mas simple y dice lo mismo.
      </p>
      <p>
        <strong>Hasta 1,2.</strong> Correccion marginal. Laney mismo recomendaba
        quedarse con la P: el ajuste es del orden de la incertidumbre con que se
        estima {"\u03C3"}<Sub>Z</Sub>, asi que una carta mas complicada que dice
        lo mismo no es una mejora.
      </p>
      <p>
        <strong>1,5 o mas.</strong> Sobredispersion real. Aqui la P{"\u2032"}{" "}
        aporta.
      </p>
      <Warn>
        Y con {"\u03C3"}<Sub>Z</Sub> alto, lo importante no es la carta:{" "}
        <strong>es el hallazgo</strong>. Un valor de 2 dice que las unidades de un
        mismo subgrupo no comparten una probabilidad comun, es decir que algo
        sistematico cambia de lote a lote. Esa diferencia entre lotes suele ser
        una oportunidad mayor que cualquier punto que la carta pueda senalar.
      </Warn>
    </Section>

    <Section title="Lo que Sigma Z no arregla">
      <p>
        Corrige la <em>anchura</em> de los limites. No corrige nada mas.
      </p>
      <p>
        Sigue haciendo falta <V>n</V>p{"\u0305"} por encima de 5, porque los tres
        sigmas siguen apoyandose en una aproximacion normal a la binomial: un
        factor de escala no repara una distribucion asimetrica.
      </p>
      <Note>
        Y no silencia el test 2. Nueve puntos al mismo lado del centro es una
        senal que no depende de la anchura de los limites, asi que ensancharlos no
        la afecta. {"\u03C3"}<Sub>Z</Sub> arregla las falsas alarmas del test 1, no
        los patrones de racha.
      </Note>
      <p>
        Tampoco hace nada con la infradispersion. Laney define la correccion como
        una <em>ampliacion</em>: si {"\u03C3"}<Sub>Z</Sub> sale por debajo de 1 se
        mantiene en 1 y la carta vuelve a ser una P. La infradispersion es un
        diagnostico a investigar, no algo que corregir estrechando limites.
      </p>
    </Section>

    <Section title="Ejemplo resuelto">
      <p>
        30 subgrupos, tamanos de 72 a 108, 481 informes tardios en 2.740.{" "}
        p{"\u0305"} = 481 / 2740 = 0,175597.
      </p>
      <p>
        Estandarizando los 30 puntos y promediando sus 29 rangos moviles sale{" "}
        MR{"\u0305"}<Sub>z</Sub> = 1,4649, luego {"\u03C3"}<Sub>Z</Sub> = 1,4649 /
        1,128 = 1,29869. Los limites de la P se ensanchan un 30 %.
      </p>
      <p>
        En el ultimo subgrupo (<V>n</V> = 97): {"\u03C3"}<Sub>p</Sub> = 0,038651,
        y 0,175597 {"\u00B1"} 3 {"\u00D7"} 0,038651 {"\u00D7"} 1,29869{" "}
        {"\u2192"} 0,32611 y 0,02509.
      </p>
      <Note>
        El subgrupo 27 falla igualmente: 31 de 80 es una proporcion de 0,3875
        frente a un UCL de 0,3413. Ensanchar los limites un 30 % no lo salva, y eso
        es informacion valiosa {"\u2014"}{" "}
        <strong>esa senal no es un artefacto de sobredispersion</strong>. Con{" "}
        {"\u03C3"}<Sub>Z</Sub> = 1,30 la correccion esta en la zona intermedia:
        merece la pena comparar las dos cartas y ver que puntos senalaba la P que
        esta ya no senala.
      </Note>
    </Section>

    <Refs title="Bibliografía" />
  </div>
);

const EN = () => (
  <div className="space-y-5">
    <Section title="The problem it solves">
      <p>
        A P chart builds its limits from a single number: the centre proportion.
        The binomial has no separate dispersion parameter, so p{"\u0305"} fixes
        both the centre <em>and</em> the width.
      </p>
      <p>
        That works if within each subgroup every unit shares the same probability
        of failing and the units are independent. With large subgroups it almost
        never holds: batches differ, shifts differ, machines differ. Real variation
        then exceeds the binomial, the limits come out too narrow and{" "}
        <strong>the chart signals constantly on ordinary noise</strong>.
        <Cite>2</Cite>
      </p>
      <Warn>
        With subgroups of thousands the effect is brutal: the limits shrink like
        1/{"\u221A"}<V>n</V> and end so close to the centre that nearly every point
        falls outside. This is the standard situation in administrative and
        healthcare data.<Cite>6</Cite>
      </Warn>
    </Section>

    <Section title="Laney's idea">
      <p>
        Laney<Cite>1</Cite> noticed the fix was already invented: if the
        theoretical dispersion is unknown, <em>measure</em> it. That is what an
        individuals chart does with the moving range.
      </p>
      <p>Three steps.</p>
      <p>
        <strong>One.</strong> Compute the ordinary P chart: p{"\u0305"} and each
        subgroup{"\u2019"}s binomial sigma.
      </p>
      <Formula>
        {"\u03C3"}<Sub>pi</Sub> = {"\u221A"}( p{"\u0305"}(1{"\u2212"}p{"\u0305"})
        / <V>n</V><Sub>i</Sub> )
      </Formula>
      <p>
        <strong>Two.</strong> Standardise the points and measure how much they{" "}
        <em>actually</em> scatter.
      </p>
      <Formula>
        <V>z</V><Sub>i</Sub> = (<V>p</V><Sub>i</Sub> {"\u2212"} p{"\u0305"}) /{" "}
        {"\u03C3"}<Sub>pi</Sub>
        {"\u00A0\u00A0\u00A0\u00A0"}
        {"\u03C3"}<Sub>Z</Sub> = MR{"\u0305"}<Sub>z</Sub> / 1.128
      </Formula>
      <p>
        <strong>Three.</strong> Rescale the P limits by that factor.
      </p>
      <Formula>
        CL = p{"\u0305"} {"\u00B1"} 3 {"\u00B7"} {"\u03C3"}<Sub>pi</Sub>{" "}
        {"\u00B7"} {"\u03C3"}<Sub>Z</Sub>
      </Formula>
      <Note>
        If {"\u03C3"}<Sub>Z</Sub> = 1 the points scatter exactly as the binomial
        predicts and the P{"\u2032"} chart coincides with the P chart.{" "}
        <strong>The P chart is the special case</strong>, not a different chart.
      </Note>
    </Section>

    <Section title="Why the moving range, not the standard deviation">
      <p>
        This is the subtlest part of the construction. One could take the standard
        deviation of the <V>z</V> values directly, but that would be wrong: it
        includes the long-term level shifts, which are precisely what the chart is
        supposed to <em>detect</em>.
      </p>
      <Warn>
        Estimating dispersion with something that already contains the signals
        makes them vanish: the limits widen until they swallow the very shift you
        were looking for. The moving range measures only variation{" "}
        <em>between consecutive points</em> and is nearly immune to a sustained
        change of level.
      </Warn>
      <p>
        It is exactly the argument from the variables charts: short-term sigma
        comes from within the subgroup, never from the overall spread. And 1.128 is{" "}
        <V>d</V><Sub>2</Sub> for <V>n</V> = 2, the same constant an I-MR chart
        uses.
      </p>
      <Note>
        Implementation detail: moving ranges require genuine adjacency. Omitted
        subgroups still take part in them, because skipping a point would create an
        artificial jump that inflates {"\u03C3"}<Sub>Z</Sub> and widens the limits
        {"\u2014"} the opposite of what omitting an odd point is for. And stage
        boundaries are never crossed.
      </Note>
    </Section>

    <Section title="How to read Sigma Z">
      <p>
        It is not an internal technicality: it is the chart{"\u2019"}s main result,
        which is why it goes in the subtitle.
      </p>
      <p>
        <strong>{"\u2248"} 1.</strong> The binomial fits. Use the P chart: it is
        simpler and says the same thing.
      </p>
      <p>
        <strong>Up to 1.2.</strong> Marginal correction. Laney himself recommended
        keeping the P chart: the adjustment is of the same order as the uncertainty
        in estimating {"\u03C3"}<Sub>Z</Sub>, so a more complicated chart that says
        the same thing is no improvement.
      </p>
      <p>
        <strong>1.5 or more.</strong> Real overdispersion. Here the P{"\u2032"}
        chart earns its keep.
      </p>
      <Warn>
        And when {"\u03C3"}<Sub>Z</Sub> is high, the chart is not the point{" "}
        {"\u2014"} <strong>the finding is</strong>. A value of 2 says the units in
        a subgroup do not share a common probability, meaning something systematic
        changes from batch to batch. That difference between batches is usually a
        bigger opportunity than anything the chart can flag.
      </Warn>
    </Section>

    <Section title="What Sigma Z does not fix">
      <p>
        It corrects the <em>width</em> of the limits. Nothing else.
      </p>
      <p>
        You still need <V>n</V>p{"\u0305"} above 5, because the three sigmas still
        rest on a normal approximation to the binomial: a scale factor does not
        repair a skewed distribution.
      </p>
      <Note>
        And it does not silence test 2. Nine points on one side of the centre is a
        signal that does not depend on the width of the limits, so widening them
        does not affect it. {"\u03C3"}<Sub>Z</Sub> fixes the false alarms of test 1,
        not run patterns.
      </Note>
      <p>
        Nor does it do anything about underdispersion. Laney defines the correction
        as a <em>widening</em>: if {"\u03C3"}<Sub>Z</Sub> comes out below 1 it is
        held at 1 and the chart is a P chart again. Underdispersion is a diagnosis
        to investigate, not something to fix by narrowing limits.
      </p>
    </Section>

    <Section title="Worked example">
      <p>
        30 subgroups, sizes from 72 to 108, 481 late reports out of 2,740.{" "}
        p{"\u0305"} = 481 / 2740 = 0.175597.
      </p>
      <p>
        Standardising the 30 points and averaging their 29 moving ranges gives{" "}
        MR{"\u0305"}<Sub>z</Sub> = 1.4649, so {"\u03C3"}<Sub>Z</Sub> = 1.4649 /
        1.128 = 1.29869. The P limits widen by 30 %.
      </p>
      <p>
        At the last subgroup (<V>n</V> = 97): {"\u03C3"}<Sub>p</Sub> = 0.038651, and
        0.175597 {"\u00B1"} 3 {"\u00D7"} 0.038651 {"\u00D7"} 1.29869 {"\u2192"}
        0.32611 and 0.02509.
      </p>
      <Note>
        Subgroup 27 fails anyway: 31 out of 80 is a proportion of 0.3875 against a
        UCL of 0.3413. Widening the limits by 30 % does not save it, and that is
        valuable information {"\u2014"}{" "}
        <strong>that signal is not an artefact of overdispersion</strong>. With{" "}
        {"\u03C3"}<Sub>Z</Sub> = 1.30 the correction sits in the middle band: worth
        comparing both charts to see which points the P chart flagged that this one
        no longer does.
      </Note>
    </Section>

    <Refs title="References" />
  </div>
);

export default function LaneyPTheory() {
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
