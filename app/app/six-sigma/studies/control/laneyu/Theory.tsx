// app/app/six-sigma/studies/control/laneyu/Theory.tsx
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
  "Mohammed, M. A., & Laney, D. (2006). Overdispersion in health care performance data. Statistics in Medicine, 25(7), 1182\u20131192.",
  "Wheeler, D. J., & Chambers, D. S. (1992). Understanding Statistical Process Control (2nd ed.). SPC Press.",
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
        Una carta U construye sus limites a partir de un solo numero, la tasa
        central, porque la Poisson tiene un unico parametro:{" "}
        <strong>su varianza es igual a su media</strong>. No hay margen. Eso
        supone que los defectos ocurren de forma independiente y a tasa constante
        en todo el continuo inspeccionado.
      </p>
      <p>
        En la practica los defectos <em>se agrupan</em>. Una tanda con un problema
        de material genera un racimo, no defectos repartidos al azar. Cuando eso
        pasa la variacion real supera a la media, los limites salen demasiado
        estrechos y la carta se llena de puntos fuera.<Cite>2</Cite>
      </p>
      <Warn>
        La restriccion es aqui mas rigida que en la binomial. La Poisson no tiene
        siquiera el techo de una proporcion que module la varianza: un solo numero
        fija centro y anchura, y si el modelo falla no hay nada que absorba la
        diferencia.
      </Warn>
    </Section>

    <Section title="La idea de Laney">
      <p>
        La misma que en la carta P{"\u2032"}, y por eso las dos son la misma carta
        con distinta sigma de partida. Si no se conoce la dispersion teorica, se{" "}
        <em>mide</em> {"\u2014"} como hace una carta de individuos con el rango
        movil.<Cite>1</Cite>
      </p>
      <p>
        <strong>Uno.</strong> La carta U de siempre: u{"\u0305"} y la sigma de
        Poisson de cada subgrupo.
      </p>
      <Formula>
        {"\u03C3"}<Sub>ui</Sub> = {"\u221A"}( u{"\u0305"} / <V>n</V><Sub>i</Sub> )
      </Formula>
      <p>
        <strong>Dos.</strong> Estandarizar y medir la dispersion real.
      </p>
      <Formula>
        <V>z</V><Sub>i</Sub> = (<V>u</V><Sub>i</Sub> {"\u2212"} u{"\u0305"}) /{" "}
        {"\u03C3"}<Sub>ui</Sub>
        {"\u00A0\u00A0\u00A0\u00A0"}
        {"\u03C3"}<Sub>Z</Sub> = MR{"\u0305"}<Sub>z</Sub> / 1,128
      </Formula>
      <p>
        <strong>Tres.</strong> Reescalar los limites.
      </p>
      <Formula>
        LC = u{"\u0305"} {"\u00B1"} 3 {"\u00B7"} {"\u03C3"}<Sub>ui</Sub>{" "}
        {"\u00B7"} {"\u03C3"}<Sub>Z</Sub>
      </Formula>
      <Note>
        Frente a la P{"\u2032"}, aqui desaparece el factor (1{"\u2212"}p) y no hay
        recorte por arriba: un conteo de defectos no tiene techo. Por eso el limite
        superior ensanchado puede subir mucho en los subgrupos de pocas unidades.
        Si {"\u03C3"}<Sub>Z</Sub> = 1, la U{"\u2032"} coincide con la U:{" "}
        <strong>la carta U es el caso particular</strong>.
      </Note>
    </Section>

    <Section title="Por qué el rango móvil">
      <p>
        Podria tomarse la desviacion tipica de los <V>z</V> directamente, pero
        seria un error: esa desviacion incluye los cambios de nivel de largo plazo,
        que son precisamente lo que la carta debe <em>detectar</em>.
      </p>
      <Warn>
        Estimar la dispersion con algo que ya contiene las senales las hace
        desaparecer: los limites se ensanchan hasta abarcar el propio
        desplazamiento que se buscaba. El rango movil mide solo la variacion entre
        puntos consecutivos y es casi inmune a un cambio de nivel sostenido.
      </Warn>
      <p>
        Es el mismo argumento de las cartas de variables: la sigma de corto plazo
        nunca sale de la dispersion global. Y 1,128 es <V>d</V><Sub>2</Sub> para{" "}
        <V>n</V> = 2, la constante de una I-MR.
      </p>
      <Note>
        Detalle de implementacion: los subgrupos omitidos siguen participando en
        los rangos moviles, porque estos exigen adyacencia real. Saltarse un punto
        crearia un salto artificial que infla {"\u03C3"}<Sub>Z</Sub> y ensancha los
        limites {"\u2014"} lo contrario de lo que se busca al omitir un punto
        anomalo. Y no se cruzan las fronteras de etapa.
      </Note>
    </Section>

    <Section title="Cómo leer Sigma Z">
      <p>
        Es el resultado principal de la carta, no un tecnicismo interno, y por eso
        va en el subtitulo.
      </p>
      <p>
        <strong>{"\u2248"} 1.</strong> La Poisson describe bien los datos. Use la
        carta U.
      </p>
      <p>
        <strong>Hasta 1,2.</strong> Correccion marginal; Laney recomendaba quedarse
        con la U. El ajuste es del orden de la incertidumbre con que se estima.
      </p>
      <p>
        <strong>1,5 o mas.</strong> Sobredispersion real, y la U{"\u2032"} aporta.
      </p>
      <Warn>
        Con {"\u03C3"}<Sub>Z</Sub> alto lo importante no es la carta:{" "}
        <strong>es el hallazgo</strong>. Un valor cercano a 3 dice que la variacion
        real triplica la que el modelo permite, es decir que los defectos se
        agrupan con fuerza o que la tasa cambia de subgrupo a subgrupo. Esa
        estructura suele ser una oportunidad mayor que cualquier punto que la carta
        pueda senalar.
      </Warn>
      <Note>
        Dos comprobaciones antes de seguir: que la unidad de inspeccion signifique
        lo mismo en todos los subgrupos, y que la tasa no este relacionada con el
        tamano. Si los subgrupos grandes llevan sistematicamente otra tasa, la
        Poisson homogenea era el modelo equivocado desde el principio y ninguna
        correccion de anchura lo arregla.
      </Note>
    </Section>

    <Section title="Lo que Sigma Z no arregla">
      <p>
        Corrige la <em>anchura</em> de los limites, nada mas.
      </p>
      <p>
        Sigue haciendo falta un numero esperado de defectos por encima de 5: los
        tres sigmas se apoyan en una aproximacion normal a la Poisson, y un factor
        de escala no repara una distribucion asimetrica.
      </p>
      <Note>
        Tampoco silencia el test 2. Nueve puntos al mismo lado del centro no depende
        de la anchura de los limites. {"\u03C3"}<Sub>Z</Sub> arregla las falsas
        alarmas del test 1, no los patrones de racha.
      </Note>
      <p>
        Y no hace nada con la infradispersion: Laney define la correccion como una{" "}
        <em>ampliacion</em>, asi que por debajo de 1 se mantiene en 1 y la carta
        vuelve a ser una U. La infradispersion es un diagnostico a investigar, no
        algo que corregir estrechando limites.
      </p>
    </Section>

    <Section title="Ejemplo resuelto">
      <p>
        25 subgrupos, tamanos de 1 a 21 unidades, 428 defectos en 220 unidades de
        inspeccion. u{"\u0305"} = 1,94545 defectos por unidad.
      </p>
      <p>
        Estandarizando los 25 puntos y promediando sus 24 rangos moviles sale{" "}
        MR{"\u0305"}<Sub>z</Sub> = 3,1960, luego {"\u03C3"}<Sub>Z</Sub> = 3,1960 /
        1,128 = 2,83336. Los limites de la U casi se triplican.
      </p>
      <p>
        En el ultimo subgrupo (<V>n</V> = 3): {"\u03C3"}<Sub>u</Sub> ={" "}
        {"\u221A"}(1,94545/3) = 0,80528, y 1,94545 + 3 {"\u00D7"} 0,80528{" "}
        {"\u00D7"} 2,83336 = 8,79. El LCL sale negativo y se recorta a cero.
      </p>
      <Note>
        <strong>Compare con la carta U de los mismos datos:</strong> alli fallaban
        doce puntos de veinticinco; aqui solo el 22 y el 25. Diez de aquellas
        senales eran artefactos de la sobredispersion. Este es el contraste con la
        carta P{"\u2032"} del ejemplo anterior, donde {"\u03C3"}<Sub>Z</Sub> = 1,30
        no cambiaba el veredicto: con 2,83 la correccion decide la lectura entera y
        justifica que estas cartas existan.
      </Note>
      <Note>
        Los dos que sobreviven al triple de anchura merecen atencion. El 22 tiene{" "}
        <V>n</V> = 1: veinte defectos en una sola unidad de inspeccion, frente a un
        centro de 1,95 y un UCL de 13,80.
      </Note>
    </Section>

    <Refs title="Bibliografía" />
  </div>
);

const EN = () => (
  <div className="space-y-5">
    <Section title="The problem it solves">
      <p>
        A U chart builds its limits from a single number, the centre rate, because
        the Poisson has one parameter: <strong>its variance equals its mean</strong>
        . There is no slack. It assumes defects occur independently and at a
        constant rate across the inspected continuum.
      </p>
      <p>
        In practice defects <em>cluster</em>. A batch with a material problem
        produces a cluster, not defects scattered at random. When that happens the
        real variation exceeds the mean, the limits come out too narrow and the
        chart fills with out-of-control points.<Cite>2</Cite>
      </p>
      <Warn>
        The restriction is tighter here than with the binomial. The Poisson does not
        even have a proportion{"\u2019"}s ceiling to modulate the variance: one
        number fixes both centre and width, and if the model fails there is nothing
        to absorb the difference.
      </Warn>
    </Section>

    <Section title="Laney's idea">
      <p>
        The same as on the P{"\u2032"} chart, which is why the two are one chart
        with a different starting sigma. If the theoretical dispersion is unknown,{" "}
        <em>measure</em> it {"\u2014"} as an individuals chart does with the moving
        range.<Cite>1</Cite>
      </p>
      <p>
        <strong>One.</strong> The ordinary U chart: u{"\u0305"} and each
        subgroup{"\u2019"}s Poisson sigma.
      </p>
      <Formula>
        {"\u03C3"}<Sub>ui</Sub> = {"\u221A"}( u{"\u0305"} / <V>n</V><Sub>i</Sub> )
      </Formula>
      <p>
        <strong>Two.</strong> Standardise and measure the real scatter.
      </p>
      <Formula>
        <V>z</V><Sub>i</Sub> = (<V>u</V><Sub>i</Sub> {"\u2212"} u{"\u0305"}) /{" "}
        {"\u03C3"}<Sub>ui</Sub>
        {"\u00A0\u00A0\u00A0\u00A0"}
        {"\u03C3"}<Sub>Z</Sub> = MR{"\u0305"}<Sub>z</Sub> / 1.128
      </Formula>
      <p>
        <strong>Three.</strong> Rescale the limits.
      </p>
      <Formula>
        CL = u{"\u0305"} {"\u00B1"} 3 {"\u00B7"} {"\u03C3"}<Sub>ui</Sub>{" "}
        {"\u00B7"} {"\u03C3"}<Sub>Z</Sub>
      </Formula>
      <Note>
        Against the P{"\u2032"} chart, the (1{"\u2212"}p) factor disappears and
        there is no clipping above: a count of defects has no ceiling. That is why
        the widened upper limit can climb a long way at small subgroups. If{" "}
        {"\u03C3"}<Sub>Z</Sub> = 1 the U{"\u2032"} coincides with the U chart:{" "}
        <strong>the U chart is the special case</strong>.
      </Note>
    </Section>

    <Section title="Why the moving range">
      <p>
        One could take the standard deviation of the <V>z</V> values directly, but
        that would be wrong: it includes the long-term level shifts, which are
        precisely what the chart is supposed to <em>detect</em>.
      </p>
      <Warn>
        Estimating dispersion with something that already contains the signals makes
        them vanish: the limits widen until they swallow the very shift you were
        looking for. The moving range measures only variation between consecutive
        points and is nearly immune to a sustained change of level.
      </Warn>
      <p>
        The same argument as on the variables charts: short-term sigma never comes
        from the overall spread. And 1.128 is <V>d</V><Sub>2</Sub> for <V>n</V> = 2,
        the I-MR constant.
      </p>
      <Note>
        Implementation detail: omitted subgroups still take part in the moving
        ranges, because those require genuine adjacency. Skipping a point would
        create an artificial jump that inflates {"\u03C3"}<Sub>Z</Sub> and widens
        the limits {"\u2014"} the opposite of what omitting an odd point is for. And
        stage boundaries are never crossed.
      </Note>
    </Section>

    <Section title="How to read Sigma Z">
      <p>
        It is the chart{"\u2019"}s main result, not an internal technicality, which
        is why it goes in the subtitle.
      </p>
      <p>
        <strong>{"\u2248"} 1.</strong> The Poisson fits. Use the U chart.
      </p>
      <p>
        <strong>Up to 1.2.</strong> Marginal correction; Laney recommended keeping
        the U chart. The adjustment is of the same order as the uncertainty in
        estimating it.
      </p>
      <p>
        <strong>1.5 or more.</strong> Real overdispersion, and the U{"\u2032"} chart
        earns its keep.
      </p>
      <Warn>
        When {"\u03C3"}<Sub>Z</Sub> is high the chart is not the point {"\u2014"}{" "}
        <strong>the finding is</strong>. A value near 3 says the real variation is
        triple what the model allows: defects are clustering strongly, or the rate
        itself changes from subgroup to subgroup. That structure is usually a bigger
        opportunity than anything the chart can flag.
      </Warn>
      <Note>
        Two checks before going further: that the inspection unit means the same in
        every subgroup, and that the rate is not related to the size. If large
        subgroups systematically carry a different rate, the homogeneous Poisson was
        the wrong model from the start and no width correction repairs that.
      </Note>
    </Section>

    <Section title="What Sigma Z does not fix">
      <p>It corrects the <em>width</em> of the limits, nothing else.</p>
      <p>
        You still need an expected count above 5: the three sigmas rest on a normal
        approximation to the Poisson, and a scale factor does not repair a skewed
        distribution.
      </p>
      <Note>
        Nor does it silence test 2. Nine points on one side of the centre does not
        depend on the width of the limits. {"\u03C3"}<Sub>Z</Sub> fixes the false
        alarms of test 1, not run patterns.
      </Note>
      <p>
        And it does nothing about underdispersion: Laney defines the correction as a{" "}
        <em>widening</em>, so below 1 it is held at 1 and the chart is a U chart
        again. Underdispersion is a diagnosis to investigate, not something to fix
        by narrowing limits.
      </p>
    </Section>

    <Section title="Worked example">
      <p>
        25 subgroups, sizes from 1 to 21 units, 428 defects across 220 inspection
        units. u{"\u0305"} = 1.94545 defects per unit.
      </p>
      <p>
        Standardising the 25 points and averaging their 24 moving ranges gives{" "}
        MR{"\u0305"}<Sub>z</Sub> = 3.1960, so {"\u03C3"}<Sub>Z</Sub> = 3.1960 /
        1.128 = 2.83336. The U limits nearly triple.
      </p>
      <p>
        At the last subgroup (<V>n</V> = 3): {"\u03C3"}<Sub>u</Sub> ={" "}
        {"\u221A"}(1.94545/3) = 0.80528, and 1.94545 + 3 {"\u00D7"} 0.80528{" "}
        {"\u00D7"} 2.83336 = 8.79. The LCL comes out negative and is clipped to
        zero.
      </p>
      <Note>
        <strong>Compare with the U chart on the same data:</strong> there twelve of
        twenty-five points failed; here only 22 and 25. Ten of those signals were
        artefacts of overdispersion. This is the contrast with the P{"\u2032"} chart
        of the previous example, where {"\u03C3"}<Sub>Z</Sub> = 1.30 did not change
        the verdict: at 2.83 the correction decides the whole reading, and that is
        why these charts exist.
      </Note>
      <Note>
        The two that survive triple-width limits deserve attention. Subgroup 22 has{" "}
        <V>n</V> = 1: twenty defects in a single inspection unit, against a centre
        of 1.95 and a UCL of 13.80.
      </Note>
    </Section>

    <Refs title="References" />
  </div>
);

export default function LaneyUTheory() {
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
