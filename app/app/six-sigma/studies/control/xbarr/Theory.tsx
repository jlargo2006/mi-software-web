// app/app/six-sigma/studies/control/xbarr/Theory.tsx
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
  "Wheeler, D. J., & Chambers, D. S. (1992). Understanding Statistical Process Control (2nd ed.). SPC Press.",
  "Duncan, A. J. (1986). Quality Control and Industrial Statistics (5th ed.). Irwin.",
  "Woodall, W. H. (2000). Controversies and contradictions in statistical process control. Journal of Quality Technology, 32(4), 341\u2013350.",
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
    <Section title="Qué añade el subgrupo">
      <p>
        Con la carta I-MR habia que fabricar una ventana de corto plazo a partir
        de puntos consecutivos. Aqui esa ventana viene dada: cada subgrupo son{" "}
        <V>n</V> piezas tomadas <strong>juntas</strong>, en condiciones lo mas
        parecidas posible.
      </p>
      <p>
        De ahi sale la idea central de Shewhart<Cite>1</Cite>: el subgrupo mide
        la variacion <em>dentro</em>, el ruido inevitable del proceso. Los
        limites de la carta de medias se construyen con esa variacion, y luego se
        comprueba si la variacion <em>entre</em> subgrupos cabe dentro. Si no
        cabe, hay algo que no es ruido.
      </p>
      <Note>
        <strong>El subgrupo racional.</strong> Toda la carta descansa en como se
        forma. Cinco piezas consecutivas de la misma maquina capturan solo la
        variacion instantanea, y los limites saldran estrechos: la carta sera
        sensible. Cinco piezas repartidas por el turno incluyen la deriva dentro
        del subgrupo, los limites se ensanchan y la carta se vuelve ciega
        justamente al problema que buscaba.<Cite>4</Cite>
      </Note>
    </Section>

    <Section title="Los límites">
      <Formula>
        {"\u03C3"}{"\u0302"} = R{"\u0305"} / <V>d</V><Sub>2</Sub>(<V>n</V>)
        {"\u00A0\u00A0\u00A0\u00A0"}
        Xbar: <V>x</V>{"\u0305"}{"\u0305"} {"\u00B1"} 3{"\u03C3"}{"\u0302"} /
        {"\u221A"}<V>n</V>
      </Formula>
      <Formula>
        R: CL = <V>d</V><Sub>2</Sub>{"\u03C3"}{"\u0302"}
        {"\u00A0\u00A0"}UCL = CL + 3<V>d</V><Sub>3</Sub>{"\u03C3"}{"\u0302"}
        {"\u00A0\u00A0"}LCL = max(0, CL {"\u2212"} 3<V>d</V><Sub>3</Sub>
        {"\u03C3"}{"\u0302"})
      </Formula>
      <p>
        En los libros esto aparece condensado en <V>A</V><Sub>2</Sub>,{" "}
        <V>D</V><Sub>3</Sub> y <V>D</V><Sub>4</Sub>: para <V>n</V> = 4,{" "}
        <V>A</V><Sub>2</Sub> = 0,729 y <V>D</V><Sub>4</Sub> = 2,282. Son la misma
        formula con las constantes ya multiplicadas, un atajo de la epoca del
        lapiz.
      </p>
      <Note>
        <strong>El {"\u221A"}<V>n</V> es lo decisivo.</strong> Los limites de la
        carta de medias no encierran observaciones, encierran{" "}
        <em>medias</em>, cuyo error tipico es <V>n</V> veces menor en varianza.
        Por eso una carta Xbar detecta desplazamientos que una carta de
        individuos no ve: promediar cuatro piezas reduce el ruido a la mitad y
        deja al descubierto el cambio de nivel.
      </Note>
    </Section>

    <Section title="R̄ o desviación combinada">
      <p>
        Con subgrupos pequenos y sin datos anomalos las dos estimaciones son casi
        identicas. Difieren en dos cosas.
      </p>
      <p>
        La <strong>desviacion combinada</strong> es mas eficiente: usa toda la
        informacion de cada subgrupo, no solo el maximo y el minimo. Su ventaja
        crece con <V>n</V>, y por encima de 8 o 10 el rango empieza a
        desperdiciar demasiado.
      </p>
      <p>
        El <strong>rango</strong> es mas transparente y mas facil de calcular a
        mano, razon de su exito historico, pero tambien mas sensible a un valor
        extremo: un solo dato disparatado infla R y ensancha todos los limites.
      </p>
      <Note>
        La casilla <em>use unbiasing constant</em> esta fija en la opcion R{"\u0305"}:
        dividir por <V>d</V><Sub>2</Sub> ya elimina el sesgo. Solo es una eleccion
        real con la desviacion combinada, donde el trabajo lo hace{" "}
        <V>c</V><Sub>4</Sub>.
      </Note>
    </Section>

    <Section title="El orden de lectura">
      <Warn>
        <strong>Primero la carta R, siempre.</strong> Sus limites dependen solo
        de {"\u03C3"}{"\u0302"}; los de la carta de medias dependen de{" "}
        {"\u03C3"}{"\u0302"} <em>y</em> de la media global. Si la variacion
        interna no es estable, la sigma estimada no describe nada y los limites
        de arriba son provisionales. Estabilizar R, y despues leer Xbar.
      </Warn>
      <p>
        La combinacion informativa es la contraria: <strong>R estable y Xbar
        fuera de control</strong>. Ahi los limites son de fiar y la senal es un
        desplazamiento real entre subgrupos {"\u2014"} un cambio de lote, de
        ajuste, de operario.
      </p>
    </Section>

    <Section title="Los ocho tests, y dónde se aplican">
      <p>
        Son los mismos de Nelson<Cite>2</Cite> que en la carta I-MR. La
        restriccion tambien es la misma: <strong>en la carta R solo se aplican
        los tests 1 a 4</strong>, porque del 5 al 8 leen zonas sigma que
        presuponen simetria, y la distribucion del rango es asimetrica con el
        limite inferior pegado al cero.
      </p>
      <Note>
        Un detalle a favor de la carta Xbar frente a la de individuos: por el
        teorema central del limite, la media de <V>n</V> observaciones es mas
        normal que las observaciones. Con <V>n</V> = 4 o 5 la carta tolera bastante
        no normalidad sin que los tests pierdan su tasa nominal, algo que la I-MR
        no puede permitirse.
      </Note>
    </Section>

    <Section title="Etapas y tamaños desiguales">
      <p>
        Si los subgrupos no son todos del mismo tamano, los limites{" "}
        <strong>escalonan</strong>: cada punto tiene el suyo, porque{" "}
        {"\u221A"}<V>n</V>, <V>d</V><Sub>2</Sub> y <V>d</V><Sub>3</Sub> dependen
        de <V>n</V>. Por eso este modulo dibuja las lineas como series
        escalonadas y no como rectas.
      </p>
      <p>
        La media global se pondera por el tamano: con subgrupos desiguales, la
        media de las medias daria el mismo peso a uno de dos que a uno de diez.
      </p>
      <Warn>
        Las etapas se declaran <em>antes</em> de mirar los datos. Trocear la serie
        donde uno ve un escalon convierte cualquier proceso en uno bajo control.
      </Warn>
    </Section>

    <Section title="Ejemplo resuelto">
      <p>
        52 subgrupos de 4. R{"\u0305"} = 11,05, luego {"\u03C3"}{"\u0302"} =
        11,05 / 2,059 = 5,37 y el error tipico de la media es 5,37/2 = 2,68.
      </p>
      <p>
        Xbar: 26,98 {"\u00B1"} 3 {"\u00D7"} 2,68 {"\u2192"} 35,03 y 18,92.{" "}
        Carta R: UCL = 2,282 {"\u00D7"} 11,05 = 25,22.
      </p>
      <Note>
        Ningun punto fuera con el test 1, pero dos rozan el limite: el rango del
        subgrupo 16 vale 25,19 contra un UCL de 25,22, y la media del 52 vale
        35,00 contra 35,03. Una carta de control no es un semaforo: un punto a
        tres milesimas del limite merece la misma atencion que uno que acaba de
        cruzarlo.
      </Note>
    </Section>

    <Refs title="Bibliografía" />
  </div>
);

const EN = () => (
  <div className="space-y-5">
    <Section title="What the subgroup adds">
      <p>
        With the I-MR chart a short-term window had to be manufactured out of
        consecutive points. Here the window is given: each subgroup is <V>n</V>{" "}
        parts taken <strong>together</strong>, under conditions as alike as
        possible.
      </p>
      <p>
        That is Shewhart{"\u2019"}s central idea<Cite>1</Cite>: the subgroup
        measures <em>within</em> variation, the process noise that cannot be
        removed. The limits of the means chart are built from it, and then{" "}
        <em>between</em>-subgroup variation is checked against them. What does not
        fit is not noise.
      </p>
      <Note>
        <strong>The rational subgroup.</strong> Everything rests on how it is
        formed. Five consecutive parts off one machine capture only instantaneous
        variation, the limits come out narrow and the chart is sensitive. Five
        parts spread across the shift fold drift into the subgroup, the limits
        widen, and the chart goes blind to the very problem it was meant to
        catch.<Cite>4</Cite>
      </Note>
    </Section>

    <Section title="The limits">
      <Formula>
        {"\u03C3"}{"\u0302"} = R{"\u0305"} / <V>d</V><Sub>2</Sub>(<V>n</V>)
        {"\u00A0\u00A0\u00A0\u00A0"}
        Xbar: <V>x</V>{"\u0305"}{"\u0305"} {"\u00B1"} 3{"\u03C3"}{"\u0302"} /
        {"\u221A"}<V>n</V>
      </Formula>
      <Formula>
        R: CL = <V>d</V><Sub>2</Sub>{"\u03C3"}{"\u0302"}
        {"\u00A0\u00A0"}UCL = CL + 3<V>d</V><Sub>3</Sub>{"\u03C3"}{"\u0302"}
        {"\u00A0\u00A0"}LCL = max(0, CL {"\u2212"} 3<V>d</V><Sub>3</Sub>
        {"\u03C3"}{"\u0302"})
      </Formula>
      <p>
        Textbooks compress this into <V>A</V><Sub>2</Sub>, <V>D</V><Sub>3</Sub>{" "}
        and <V>D</V><Sub>4</Sub>: at <V>n</V> = 4, <V>A</V><Sub>2</Sub> = 0.729
        and <V>D</V><Sub>4</Sub> = 2.282. Same formula with the constants
        pre-multiplied, a shortcut from the pencil era.
      </p>
      <Note>
        <strong>The {"\u221A"}<V>n</V> is what matters.</strong> The means chart
        limits do not enclose observations, they enclose <em>means</em>, whose
        variance is <V>n</V> times smaller. That is why an Xbar chart detects
        shifts an individuals chart misses: averaging four parts halves the noise
        and exposes the change in level.
      </Note>
    </Section>

    <Section title="R̄ or pooled standard deviation">
      <p>
        With small subgroups and no odd values the two estimates are nearly
        identical. They differ in two ways.
      </p>
      <p>
        The <strong>pooled standard deviation</strong> is more efficient: it uses
        all the information in each subgroup, not just the largest and smallest
        value. Its advantage grows with <V>n</V>, and above 8 or 10 the range
        wastes too much.
      </p>
      <p>
        The <strong>range</strong> is more transparent and easier to compute by
        hand, which is why it prevailed historically, but it is also more
        sensitive to an outlier: one wild value inflates R and widens every
        limit.
      </p>
      <Note>
        The <em>use unbiasing constant</em> box is fixed on for R{"\u0305"}:
        dividing by <V>d</V><Sub>2</Sub> already removes the bias. It is a real
        choice only for the pooled standard deviation, where <V>c</V>
        <Sub>4</Sub> does that job.
      </Note>
    </Section>

    <Section title="Reading order">
      <Warn>
        <strong>The R chart first, always.</strong> Its limits depend only on{" "}
        {"\u03C3"}{"\u0302"}; the means chart depends on {"\u03C3"}{"\u0302"}{" "}
        <em>and</em> on the grand mean. If within-subgroup variation is not
        stable, the estimated sigma describes nothing and the limits above are
        provisional. Settle R, then read Xbar.
      </Warn>
      <p>
        The informative combination is the opposite one:{" "}
        <strong>R stable and Xbar out of control</strong>. There the limits can be
        trusted and the signal is a genuine shift between subgroups {"\u2014"} a
        change of batch, of setting, of operator.
      </p>
    </Section>

    <Section title="The eight tests, and where they apply">
      <p>
        The same Nelson tests<Cite>2</Cite> as on the I-MR chart, with the same
        restriction: <strong>only tests 1 to 4 apply to the R chart</strong>,
        because tests 5 to 8 read sigma zones that assume symmetry, and the range
        distribution is skewed with its lower limit pinned at zero.
      </p>
      <Note>
        One point in the Xbar chart{"\u2019"}s favour over the individuals chart:
        by the central limit theorem the mean of <V>n</V> observations is more
        normal than the observations themselves. At <V>n</V> = 4 or 5 the chart
        tolerates a fair amount of non-normality without the tests losing their
        nominal rates, which the I-MR chart cannot afford.
      </Note>
    </Section>

    <Section title="Stages and unequal sizes">
      <p>
        If the subgroups are not all the same size the limits{" "}
        <strong>step</strong>: each point has its own, because {"\u221A"}
        <V>n</V>, <V>d</V><Sub>2</Sub> and <V>d</V><Sub>3</Sub> all depend on{" "}
        <V>n</V>. That is why this module draws the lines as step series rather
        than straight rules.
      </p>
      <p>
        The grand mean is weighted by size: with unequal subgroups the mean of the
        means would give a subgroup of two the same weight as one of ten.
      </p>
      <Warn>
        Stages are declared <em>before</em> looking at the data. Slicing the
        series wherever a step appears turns any process into a controlled one.
      </Warn>
    </Section>

    <Section title="Worked example">
      <p>
        52 subgroups of 4. R{"\u0305"} = 11.05, so {"\u03C3"}{"\u0302"} = 11.05 /
        2.059 = 5.37 and the standard error of the mean is 5.37/2 = 2.68.
      </p>
      <p>
        Xbar: 26.98 {"\u00B1"} 3 {"\u00D7"} 2.68 {"\u2192"} 35.03 and 18.92. R
        chart: UCL = 2.282 {"\u00D7"} 11.05 = 25.22.
      </p>
      <Note>
        Nothing fails test 1, but two points graze the limit: the range of
        subgroup 16 is 25.19 against a UCL of 25.22, and the mean of subgroup 52
        is 35.00 against 35.03. A control chart is not a traffic light: a point
        three thousandths inside deserves the same attention as one that has just
        crossed.
      </Note>
    </Section>

    <Refs title="References" />
  </div>
);

export default function XbarRTheory() {
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
