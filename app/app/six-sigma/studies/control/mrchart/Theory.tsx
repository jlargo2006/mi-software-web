// app/app/six-sigma/studies/control/mrchart/Theory.tsx
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
  "Montgomery, D. C. (2013). Introduction to Statistical Quality Control (7th ed.). Wiley.",
  "Wheeler, D. J., & Chambers, D. S. (1992). Understanding Statistical Process Control (2nd ed.). SPC Press.",
  "Nelson, L. S. (1982). Control charts for individual measurements. Journal of Quality Technology, 14(3), 172\u2013173.",
  "Roes, K. C. B., Does, R. J. M. M., & Schurink, Y. (1993). Shewhart-type control charts for individual observations. Journal of Quality Technology, 25(3), 188\u2013198.",
  "Rigdon, S. E., Cruthis, E. N., & Champ, C. W. (1994). Design strategies for individuals and moving range control charts. Journal of Quality Technology, 26(4), 274\u2013287.",
  "Duncan, A. J. (1986). Quality Control and Industrial Statistics (5th ed.). Irwin.",
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
    <Section title="Qué mide">
      <p>
        Es la mitad inferior de una carta I-MR, sola. Vigila cuanto se mueve el
        proceso <em>entre observaciones consecutivas</em> {"\u2014"} la
        variabilidad de corto plazo {"\u2014"} y no dice nada del nivel.
      </p>
      <p>
        Con una sola medida por instante no hay subgrupo del que sacar una
        dispersion interna. El rango movil la construye por diferencias:
      </p>
      <Formula>
        MR<Sub>i</Sub> = |<V>x</V><Sub>i</Sub> {"\u2212"} <V>x</V>
        <Sub>i{"\u2212"}1</Sub>|
      </Formula>
      <p>
        La idea es que dos observaciones seguidas estan suficientemente proximas
        en el tiempo para que solo actue la causa comun. Lo que separa a esa pareja
        es entonces una medida limpia del ruido de fondo.
      </p>
    </Section>

    <Section title="Los límites">
      <p>
        La linea central es el rango medio, y de ahi sale la sigma del proceso:
      </p>
      <Formula>
        MR{"\u0305"} = {"\u2211"} MR<Sub>i</Sub> / (<V>m</V>{"\u2212"}1)
        {"\u00A0\u00A0\u00A0\u00A0"}
        {"\u03C3"}{"\u0302"} = MR{"\u0305"} / <V>d</V><Sub>2</Sub>
      </Formula>
      <p>
        Los limites son tres sigmas <em>de la distribucion del rango</em>, no del
        proceso. La desviacion tipica del rango relativo es <V>d</V><Sub>3</Sub>, de
        modo que:
      </p>
      <Formula>
        UCL = <V>D</V><Sub>4</Sub> MR{"\u0305"} = (1 + 3<V>d</V><Sub>3</Sub>/
        <V>d</V><Sub>2</Sub>) MR{"\u0305"}
        <br />
        LCL = <V>D</V><Sub>3</Sub> MR{"\u0305"} = (1 {"\u2212"} 3<V>d</V>
        <Sub>3</Sub>/<V>d</V><Sub>2</Sub>) MR{"\u0305"}
      </Formula>
      <p>
        Con <V>w</V> = 2: <V>d</V><Sub>2</Sub> = 1,128 y <V>d</V><Sub>3</Sub> =
        0,8525, luego <V>D</V><Sub>4</Sub> = 3,2673.
      </p>
      <Warn>
        <strong>El limite inferior es cero por construccion</strong>, no por
        recorte: 1 {"\u2212"} 3 {"\u00D7"} 0,8525/1,128 sale negativo. Y sigue
        siendo negativo hasta <V>w</V> = 7. Consecuencia practica: esta carta{" "}
        <em>no puede detectar una reduccion</em> de la variabilidad, solo un
        aumento. Una mejora en consistencia aparece como deriva de los puntos
        hacia cero y como test 2, nunca como punto por debajo de un limite.
      </Warn>
      <Note>
        Los limites no son simetricos respecto a la linea central, y no deben
        serlo: la distribucion de un rango es asimetrica a la derecha. Es la misma
        razon por la que solo se ofrecen cuatro tests.
      </Note>
    </Section>

    <Section title="El acoplamiento: lo que hay que entender de esta carta">
      <p>
        Los rangos moviles consecutivos <strong>comparten una observacion</strong>.
        MR<Sub>i</Sub> y MR<Sub>i+1</Sub> contienen los dos a <V>x</V><Sub>i</Sub>.
      </p>
      <Warn>
        De ahi la consecuencia central: <strong>un solo valor atipico produce dos
        rangos grandes seguidos</strong>, uno al entrar y otro al salir. Y eso es
        indistinguible, dentro de esta carta, de un aumento real de la dispersion.
        Nada en el grafico separa los dos casos.
      </Warn>
      <p>
        Por eso la carta MR no se interpreta sola. Con la carta de individuos al
        lado la ambiguedad desaparece de inmediato: si el individuo se dispara y
        vuelve, era un punto raro; si la serie se ensancha, era dispersion.
      </p>
      <p>
        El acoplamiento tambien afecta a los tests. Los puntos no son
        independientes, asi que las rachas y las tendencias surgen con mas
        facilidad de la que los tests suponen. Con MR el test 1 es el fiable; el
        test 2 es optimista.<Cite>4</Cite>
      </p>
      <Note>
        Hay literatura que directamente recomienda no aplicar tests de racha a la
        carta MR y usarla solo con el test 1, precisamente por esto.<Cite>3</Cite>{" "}
        Los cuatro estan disponibles, pero el aviso es deliberado.
      </Note>
    </Section>

    <Section title="La longitud del rango móvil">
      <p>
        Se puede usar <V>w</V> {"\u003E"} 2, con las constantes correspondientes,
        pero rara vez conviene.
      </p>
      <Warn>
        Con <V>w</V> = 3 cada ventana comparte <em>dos</em> observaciones con la
        siguiente. La autocorrelacion inducida crece rapido, los tests de racha
        dejan de tener sentido y la carta se suaviza: pierde precisamente la
        sensibilidad al cambio brusco que justificaba mirar rangos consecutivos.
      </Warn>
      <p>
        El unico caso razonable es un proceso con una deriva lenta conocida, donde
        una ventana algo mas larga separa mejor la deriva del ruido. Aun asi, para
        eso hay herramientas mejores: una EWMA o una CUSUM.
      </p>
    </Section>

    <Section title="Cuándo tiene sentido esta carta sola">
      <p>
        Casi nunca, y conviene decirlo: <strong>lo normal es usar I-MR</strong>.
        Esta carta esta aqui para tres situaciones concretas.
      </p>
      <p>
        <strong>Documentar solo la dispersion.</strong> Un informe donde el nivel
        ya se ha tratado aparte y solo interesa demostrar que la variabilidad es
        estable.
      </p>
      <p>
        <strong>Validar una sigma antes de usarla.</strong> Los limites de
        cualquier carta de individuos, y todo estudio de capacidad de corto plazo,
        se calculan a partir de MR{"\u0305"}. Si la dispersion no es estable, MR
        {"\u0305"} es una media de cosas distintas y los limites que produce no son
        de fiar. Comprobar esta carta primero tiene un orden logico claro.
      </p>
      <p>
        <strong>Diagnostico.</strong> Cuando la carta de individuos senala mucho y
        se quiere saber si el problema es el nivel o la dispersion.
      </p>
      <Note>
        Ese segundo punto es el importante y suele pasarse por alto:{" "}
        <strong>la carta MR se resuelve antes que la de individuos</strong>. No al
        contrario. Si la variabilidad esta fuera de control, los limites de la
        carta de individuos estan mal calculados y sus senales no significan lo que
        parece.
      </Note>
    </Section>

    <Section title="Ejemplo resuelto">
      <p>
        31 observaciones dan 30 rangos moviles. Su media es MR{"\u0305"} = 7,46667.
      </p>
      <p>
        {"\u03C3"}{"\u0302"} = 7,46667 / 1,128 = 6,61939. UCL = 3,2673{" "}
        {"\u00D7"} 7,46667 = 24,3957, y LCL = 0 porque <V>D</V><Sub>3</Sub> = 0.
      </p>
      <p>Ningun punto falla ningun test: la variabilidad de corto plazo es estable.</p>
      <Note>
        El mayor rango de la serie es 23, en la observacion 31, y viene de un salto
        de 17 a 40. Queda por debajo del UCL de 24,40, pero es el caso de libro del
        acoplamiento: <strong>un unico dato</strong> genera ese rango. Sin la carta
        de individuos al lado no se puede afirmar si el proceso se volvio mas
        variable al final o si simplemente hubo un valor alto aislado {"\u2014"} y
        son conclusiones muy distintas.
      </Note>
    </Section>

    <Refs title="Bibliografía" />
  </div>
);

const EN = () => (
  <div className="space-y-5">
    <Section title="What it measures">
      <p>
        This is the lower half of an I-MR chart, on its own. It tracks how much the
        process moves <em>between consecutive observations</em> {"\u2014"} the
        short-term variability {"\u2014"} and says nothing about the level.
      </p>
      <p>
        With one measurement per instant there is no subgroup from which to take an
        internal spread. The moving range constructs one from differences:
      </p>
      <Formula>
        MR<Sub>i</Sub> = |<V>x</V><Sub>i</Sub> {"\u2212"} <V>x</V>
        <Sub>i{"\u2212"}1</Sub>|
      </Formula>
      <p>
        The idea is that two successive observations are close enough in time for
        only common cause to act. What separates that pair is then a clean measure
        of the background noise.
      </p>
    </Section>

    <Section title="The limits">
      <p>
        The centre line is the average range, and the process sigma follows from it:
      </p>
      <Formula>
        MR{"\u0305"} = {"\u2211"} MR<Sub>i</Sub> / (<V>m</V>{"\u2212"}1)
        {"\u00A0\u00A0\u00A0\u00A0"}
        {"\u03C3"}{"\u0302"} = MR{"\u0305"} / <V>d</V><Sub>2</Sub>
      </Formula>
      <p>
        The limits are three sigmas <em>of the distribution of the range</em>, not
        of the process. The standard deviation of the relative range is <V>d</V>
        <Sub>3</Sub>, so:
      </p>
      <Formula>
        UCL = <V>D</V><Sub>4</Sub> MR{"\u0305"} = (1 + 3<V>d</V><Sub>3</Sub>/
        <V>d</V><Sub>2</Sub>) MR{"\u0305"}
        <br />
        LCL = <V>D</V><Sub>3</Sub> MR{"\u0305"} = (1 {"\u2212"} 3<V>d</V>
        <Sub>3</Sub>/<V>d</V><Sub>2</Sub>) MR{"\u0305"}
      </Formula>
      <p>
        At <V>w</V> = 2: <V>d</V><Sub>2</Sub> = 1.128 and <V>d</V><Sub>3</Sub> =
        0.8525, so <V>D</V><Sub>4</Sub> = 3.2673.
      </p>
      <Warn>
        <strong>The lower limit is zero by construction</strong>, not by clipping:
        1 {"\u2212"} 3 {"\u00D7"} 0.8525/1.128 is negative. And it stays negative up
        to <V>w</V> = 7. The practical consequence: this chart{" "}
        <em>cannot detect a reduction</em> in variability, only an increase. An
        improvement in consistency shows up as points drifting towards zero and as
        test 2, never as a point below a limit.
      </Warn>
      <Note>
        The limits are not symmetric about the centre line, and should not be: the
        distribution of a range is skewed to the right. It is the same reason only
        four tests are offered.
      </Note>
    </Section>

    <Section title="The overlap: the thing to understand about this chart">
      <p>
        Consecutive moving ranges <strong>share an observation</strong>. MR
        <Sub>i</Sub> and MR<Sub>i+1</Sub> both contain <V>x</V><Sub>i</Sub>.
      </p>
      <Warn>
        Hence the central consequence:{" "}
        <strong>one outlying value produces two large ranges in a row</strong>, one
        going in and one coming out. And within this chart that is
        indistinguishable from a genuine increase in spread. Nothing in the plot
        separates the two cases.
      </Warn>
      <p>
        That is why the MR chart is not read alone. With the individuals chart
        beside it the ambiguity disappears at once: if the individual spikes and
        returns, it was an odd point; if the series widens, it was spread.
      </p>
      <p>
        The overlap also affects the tests. The points are not independent, so runs
        and trends arise more readily than the tests assume. On an MR chart test 1
        is the reliable one; test 2 is optimistic.<Cite>4</Cite>
      </p>
      <Note>
        Some of the literature recommends not applying run tests to the MR chart at
        all and using test 1 only, precisely for this reason.<Cite>3</Cite> All four
        are available, but the warning is deliberate.
      </Note>
    </Section>

    <Section title="The length of the moving range">
      <p>
        You can use <V>w</V> {"\u003E"} 2 with the corresponding constants, but it
        is rarely worth it.
      </p>
      <Warn>
        At <V>w</V> = 3 each window shares <em>two</em> observations with the next.
        The induced autocorrelation grows quickly, the run tests stop meaning
        anything, and the chart smooths: it loses exactly the sensitivity to abrupt
        change that motivated looking at consecutive ranges.
      </Warn>
      <p>
        The one reasonable case is a process with a known slow drift, where a
        slightly longer window separates drift from noise better. Even then there
        are better tools: an EWMA or a CUSUM.
      </p>
    </Section>

    <Section title="When this chart makes sense alone">
      <p>
        Almost never, and it is worth saying:{" "}
        <strong>the normal choice is I-MR</strong>. This chart is here for three
        specific situations.
      </p>
      <p>
        <strong>Documenting spread only.</strong> A report where the level has been
        dealt with separately and all that is needed is evidence that variability
        is stable.
      </p>
      <p>
        <strong>Validating a sigma before using it.</strong> The limits of any
        individuals chart, and every short-term capability study, are computed from
        MR{"\u0305"}. If the spread is not stable, MR{"\u0305"} is an average of
        different things and the limits it produces cannot be trusted. Checking this
        chart first has a clear logical order.
      </p>
      <p>
        <strong>Diagnosis.</strong> When the individuals chart signals a great deal
        and you want to know whether the problem is level or spread.
      </p>
      <Note>
        That second point is the important one and is often missed:{" "}
        <strong>the MR chart is resolved before the individuals chart</strong>, not
        the other way round. If the variability is out of control, the individuals
        limits are wrongly computed and its signals do not mean what they appear to.
      </Note>
    </Section>

    <Section title="Worked example">
      <p>31 observations give 30 moving ranges, averaging MR{"\u0305"} = 7.46667.</p>
      <p>
        {"\u03C3"}{"\u0302"} = 7.46667 / 1.128 = 6.61939. UCL = 3.2673 {"\u00D7"}{" "}
        7.46667 = 24.3957, and LCL = 0 because <V>D</V><Sub>3</Sub> = 0.
      </p>
      <p>No point fails any test: the short-term variability is stable.</p>
      <Note>
        The largest range in the series is 23, at observation 31, from a jump of 17
        to 40. It stays below the UCL of 24.40, but it is the textbook case of the
        overlap: <strong>a single data point</strong> generates that range. Without
        the individuals chart beside it you cannot say whether the process became
        more variable at the end or whether there was simply one isolated high value
        {"\u2014"} and those are very different conclusions.
      </Note>
    </Section>

    <Refs title="References" />
  </div>
);

export default function MRTheory() {
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
