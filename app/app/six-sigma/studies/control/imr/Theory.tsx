// app/app/six-sigma/studies/control/imr/Theory.tsx
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
  "Roes, K. C. B., Does, R. J. M. M., & Schurink, Y. (1993). Shewhart-type control charts for individual observations. Journal of Quality Technology, 25(3), 188\u2013198.",
  "Borror, C. M., Montgomery, D. C., & Runger, G. C. (1999). Robustness of the EWMA control chart to non-normality. Journal of Quality Technology, 31(3), 309\u2013316.",
  "Box, G. E. P., & Cox, D. R. (1964). An analysis of transformations. JRSS-B, 26(2), 211\u2013252.",
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
    <Section title="Cuándo se usa">
      <p>
        Cuando cada punto es <strong>una sola medida</strong>: no hay subgrupo
        del que sacar un rango interno. Ocurre siempre que medir es caro, lento o
        destructivo, o cuando el proceso produce de uno en uno {"\u2014"} un lote
        por dia, una lectura por turno.
      </p>
      <p>
        Sin subgrupo no hay variacion interna, asi que hay que inventarse una
        ventana: el <strong>rango movil</strong>, la diferencia absoluta entre
        observaciones consecutivas.
      </p>
    </Section>

    <Section title="Los límites">
      <Formula>
        MR<Sub>i</Sub> = | <V>x</V><Sub>i</Sub> {"\u2212"} <V>x</V>
        <Sub>i{"\u2212"}1</Sub> |{"\u00A0\u00A0\u00A0\u00A0"}
        {"\u03C3"}{"\u0302"} = MR{"\u0305"} / <V>d</V><Sub>2</Sub>
        {"\u00A0\u00A0\u00A0\u00A0"}<V>d</V><Sub>2</Sub> = 1,128
      </Formula>
      <Formula>
        I:{"\u00A0"} <V>x</V>{"\u0305"} {"\u00B1"} 3{"\u03C3"}{"\u0302"}
        {"\u00A0\u00A0\u00A0\u00A0"}
        MR:{"\u00A0"} UCL = MR{"\u0305"} (1 + 3 <V>d</V><Sub>3</Sub>/<V>d</V>
        <Sub>2</Sub>) = 3,267 {"\u00B7"} MR{"\u0305"}
      </Formula>
      <p>
        El 3,267 no es magia: sale de <V>d</V><Sub>3</Sub>/<V>d</V><Sub>2</Sub> =
        0,8525 / 1,128. Y el LCL del rango movil es cero porque{" "}
        MR{"\u0305"} {"\u2212"} 3<V>d</V><Sub>3</Sub>{"\u03C3"} sale negativo con{" "}
        <V>n</V> = 2.
      </p>
      <Note>
        <strong>Por qu&eacute; el rango movil y no la desviacion global.</strong>{" "}
        La desviacion de toda la serie incluye la deriva entre puntos lejanos. El
        rango movil solo mira vecinos, asi que estima la variacion{" "}
        <em>de corto plazo</em>. Esa es la que debe fijar los limites: si la
        deriva entrase en el calculo, los limites se ensancharian lo justo para
        contener el problema que se pretende detectar.
      </Note>
    </Section>

    <Section title="Los ocho tests, y dónde se aplican">
      <p>
        Los tests de Nelson<Cite>2</Cite> dividen la banda en zonas de una sigma
        y buscan patrones que el azar no producirla con facilidad. El test 1
        detecta saltos grandes; el 2 y el 6, desplazamientos pequenos y
        sostenidos; el 3, derivas; el 7, una variabilidad{" "}
        <em>demasiado pequena</em>, que casi siempre significa limites mal
        estimados o datos agrupados.
      </p>
      <Warn>
        <strong>
          En el grafico MR solo se aplican los tests 1 a 4.
        </strong>{" "}
        Los tests 5 a 8 razonan por zonas sigma y presuponen simetria alrededor
        de la linea central. La distribucion del rango movil esta sesgada y su
        limite inferior se pega al cero: las zonas de abajo no existen. Aplicar
        alli el test 5 produce falsas alarmas sistematicas. Con estos datos, sin
        esa restriccion, aparecian seis senales del test 5 y una del 6 que son
        puro artefacto.
      </Warn>
      <Note>
        Cuantos mas tests se activan, mas se dispara la tasa de falsas alarmas.
        Con el test 1 solo, un proceso en control da una senal cada 370 puntos;
        con los ocho, una cada 90 aproximadamente. Activarlos todos en una serie
        larga garantiza ruido.
      </Note>
    </Section>

    <Section title="Leer primero el MR, siempre">
      <Warn>
        El grafico de rangos moviles no es un adorno debajo del principal. Es{" "}
        <strong>la validacion del otro</strong>. Si el MR esta fuera de control,
        la sigma que sale de MR{"\u0305"} no describe nada estable, y entonces{" "}
        <em>todos</em> los limites del grafico de individuos son provisionales.
        Se arregla el MR primero, y luego se lee el I.
      </Warn>
    </Section>

    <Section title="No normalidad">
      <p>
        La I-MR es razonablemente robusta para el test 1: con datos moderadamente
        sesgados la tasa de falsas alarmas se mueve, pero no se descontrola.
        <Cite>5</Cite> Los tests de zonas son otra cosa: leen probabilidades de
        cola que en una distribucion asimetrica no son las supuestas.
      </p>
      <Warn>
        Sintoma inequivoco: un <strong>LCL negativo</strong> en una magnitud que
        no puede serlo. No significa que el proceso vaya sobrado: significa que
        una MR{"\u0305"} grande, alimentada por una cola larga, ha ensanchado los
        limites hasta dejarlos sin contenido.
      </Warn>
      <p>
        Dos salidas: transformar con Box-Cox<Cite>7</Cite>, aceptando que el
        grafico pasa a unidades transformadas; o usar la{" "}
        <strong>mediana</strong> de los rangos moviles, mucho menos sensible a
        unos pocos saltos grandes.
      </p>
    </Section>

    <Section title="Etapas">
      <p>
        Una etapa es un cambio <strong>conocido y declarado</strong>: nuevo
        proveedor, revision del utillaje, cambio de receta. Cada etapa recibe su
        linea central y sus limites.
      </p>
      <p>
        Dos decisiones de este modulo. Los rangos moviles que cruzan una frontera{" "}
        <strong>se descartan</strong>: ese salto es el cambio que define la
        etapa, no variacion del proceso, y contarlo inflaria sigma justo donde se
        quiere medir mejor. Y ninguna racha cruza la frontera: los tests se
        reinician en cada etapa.
      </p>
      <Warn>
        Las etapas se declaran <em>antes</em> de mirar los datos. Trocear la serie
        donde uno ve un escalon convierte cualquier proceso en uno bajo control,
        que es precisamente lo contrario de lo que sirve un grafico de control.
      </Warn>
    </Section>

    <Section title="Ejemplo resuelto">
      <p>
        <em>Cycletime</em>, 200 observaciones. <V>x</V>{"\u0305"} = 98,24 y{" "}
        MR{"\u0305"} = 89,67, luego {"\u03C3"}{"\u0302"} = 89,67 / 1,128 = 79,49.
      </p>
      <p>
        Limites del I: 336,72 y {"\u2212"}140,24. UCL del MR: 3,267{" "}
        {"\u00D7"} 89,67 = 292,95.
      </p>
      <Note>
        El LCL de {"\u2212"}140 en un tiempo de ciclo lo dice todo. Con asimetria
        2,05 {"\u2014"} la que dio el modulo de identificacion, con la normal
        rechazada a AD 8,77 {"\u2014"} buena parte de las veinte senales son
        forma, no causa asignable. La lectura honesta: transformar antes, o pasar
        a la mediana movil.
      </Note>
    </Section>

    <Refs title="Bibliografía" />
  </div>
);

const EN = () => (
  <div className="space-y-5">
    <Section title="When it is used">
      <p>
        When each point is <strong>a single measurement</strong>: there is no
        subgroup from which to take an internal range. This happens whenever
        measuring is expensive, slow or destructive, or when the process produces
        one unit at a time {"\u2014"} one batch a day, one reading a shift.
      </p>
      <p>
        Without a subgroup there is no within variation, so a window has to be
        manufactured: the <strong>moving range</strong>, the absolute difference
        between consecutive observations.
      </p>
    </Section>

    <Section title="The limits">
      <Formula>
        MR<Sub>i</Sub> = | <V>x</V><Sub>i</Sub> {"\u2212"} <V>x</V>
        <Sub>i{"\u2212"}1</Sub> |{"\u00A0\u00A0\u00A0\u00A0"}
        {"\u03C3"}{"\u0302"} = MR{"\u0305"} / <V>d</V><Sub>2</Sub>
        {"\u00A0\u00A0\u00A0\u00A0"}<V>d</V><Sub>2</Sub> = 1.128
      </Formula>
      <Formula>
        I:{"\u00A0"} <V>x</V>{"\u0305"} {"\u00B1"} 3{"\u03C3"}{"\u0302"}
        {"\u00A0\u00A0\u00A0\u00A0"}
        MR:{"\u00A0"} UCL = MR{"\u0305"} (1 + 3 <V>d</V><Sub>3</Sub>/<V>d</V>
        <Sub>2</Sub>) = 3.267 {"\u00B7"} MR{"\u0305"}
      </Formula>
      <p>
        The 3.267 is not magic: it is <V>d</V><Sub>3</Sub>/<V>d</V><Sub>2</Sub> =
        0.8525 / 1.128. And the moving range LCL is zero because MR{"\u0305"}{" "}
        {"\u2212"} 3<V>d</V><Sub>3</Sub>{"\u03C3"} comes out negative at{" "}
        <V>n</V> = 2.
      </p>
      <Note>
        <strong>Why the moving range and not the overall deviation.</strong> The
        deviation of the whole series includes drift between distant points. The
        moving range looks only at neighbours, so it estimates{" "}
        <em>short-term</em> variation. That is what should set the limits: if
        drift entered the calculation, the limits would widen just enough to
        contain the very problem they are meant to detect.
      </Note>
    </Section>

    <Section title="The eight tests, and where they apply">
      <p>
        Nelson{"\u2019"}s tests<Cite>2</Cite> divide the band into one-sigma zones and
        look for patterns chance would not readily produce. Test 1 catches large
        jumps; tests 2 and 6, small sustained shifts; test 3, drift; test 7, a
        variability that is <em>too small</em>, which almost always means badly
        estimated limits or rounded data.
      </p>
      <Warn>
        <strong>Only tests 1 to 4 are applied to the MR chart.</strong> Tests 5
        to 8 reason in sigma zones and assume symmetry about the centre line. The
        moving range distribution is skewed and its lower limit sits at zero: the
        zones below do not exist. Applying test 5 there produces systematic false
        alarms. On these data, without that restriction, six test 5 signals and
        one test 6 signal appeared that are pure artefact.
      </Warn>
      <Note>
        The more tests are switched on, the higher the false alarm rate. With
        test 1 alone an in-control process signals about once every 370 points;
        with all eight, about once every 90. Turning them all on over a long
        series guarantees noise.
      </Note>
    </Section>

    <Section title="Read the MR chart first, always">
      <Warn>
        The moving range chart is not decoration under the main one. It is{" "}
        <strong>the validation of the other</strong>. If the MR chart is out of
        control, the sigma derived from MR{"\u0305"} describes nothing stable, and
        then <em>every</em> limit on the individuals chart is provisional. Fix the
        MR chart first, then read the I chart.
      </Warn>
    </Section>

    <Section title="Non-normality">
      <p>
        The I-MR chart is reasonably robust for test 1: with moderately skewed
        data the false alarm rate moves but does not run away.<Cite>5</Cite> The
        zone tests are another matter: they read tail probabilities that a skewed
        distribution does not have.
      </p>
      <Warn>
        The unmistakable symptom is a <strong>negative LCL</strong> on a quantity
        that cannot be negative. It does not mean the process has room to spare:
        it means a large MR{"\u0305"}, fed by a long tail, has widened the limits
        until they contain nothing.
      </Warn>
      <p>
        Two ways out: transform with Box-Cox<Cite>7</Cite>, accepting that the
        chart moves into transformed units; or use the{" "}
        <strong>median</strong> moving range, far less sensitive to a few large
        jumps.
      </p>
    </Section>

    <Section title="Stages">
      <p>
        A stage is a <strong>known and declared</strong> change: a new supplier, a
        tooling overhaul, a recipe change. Each stage gets its own centre line and
        limits.
      </p>
      <p>
        Two decisions in this module. Moving ranges that straddle a boundary are{" "}
        <strong>dropped</strong>: that jump is the change defining the stage, not
        process variation, and counting it would inflate sigma exactly where the
        measurement needs to be sharpest. And no run carries across a boundary:
        the tests restart in each stage.
      </p>
      <Warn>
        Stages are declared <em>before</em> looking at the data. Slicing the
        series wherever a step appears turns any process into a controlled one,
        which is precisely the opposite of what a control chart is for.
      </Warn>
    </Section>

    <Section title="Worked example">
      <p>
        <em>Cycletime</em>, 200 observations. <V>x</V>{"\u0305"} = 98.24 and{" "}
        MR{"\u0305"} = 89.67, so {"\u03C3"}{"\u0302"} = 89.67 / 1.128 = 79.49.
      </p>
      <p>
        I chart limits: 336.72 and {"\u2212"}140.24. MR chart UCL: 3.267{" "}
        {"\u00D7"} 89.67 = 292.95.
      </p>
      <Note>
        An LCL of {"\u2212"}140 on a cycle time says it all. With a skewness of
        2.05 {"\u2014"} the figure the identification module produced, with the
        normal rejected at AD 8.77 {"\u2014"} a good part of the twenty signals is
        shape, not assignable cause. The honest reading: transform first, or move
        to the median moving range.
      </Note>
    </Section>

    <Refs title="References" />
  </div>
);

export default function ImrTheory() {
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
