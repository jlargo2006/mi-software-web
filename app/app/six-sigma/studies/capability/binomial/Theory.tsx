// app/app/six-sigma/studies/capability/binomial/Theory.tsx
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

const Refs = ({ items }: { items: string[] }) => (
  <section className="space-y-2">
    <h3 className="font-bold text-base text-[#00674d] border-b border-gray-200 pb-1">
      {items.length > 0 ? "Bibliografía / References" : ""}
    </h3>
    <ol className="list-decimal pl-5 space-y-1 text-xs text-gray-600">
      {items.map((s, i) => (
        <li key={i}>{s}</li>
      ))}
    </ol>
  </section>
);

const REFS = [
  "Clopper, C. J., & Pearson, E. S. (1934). The use of confidence or fiducial limits illustrated in the case of the binomial. Biometrika, 26(4), 404\u2013413.",
  "Montgomery, D. C. (2013). Introduction to Statistical Quality Control (7th ed.), ch. 7: Control Charts for Attributes. Wiley.",
  "Nelson, L. S. (1984). The Shewhart control chart \u2014 tests for special causes. Journal of Quality Technology, 16(4), 237\u2013239.",
  "Bothe, D. R. (1997). Measuring Process Capability. McGraw-Hill \u2014 conversion of defective rates to sigma levels.",
  "Agresti, A., & Coull, B. A. (1998). Approximate is better than \u201cexact\u201d for interval estimation of binomial proportions. The American Statistician, 52(2), 119\u2013126.",
  "Brown, L. D., Cai, T. T., & DasGupta, A. (2001). Interval estimation for a binomial proportion. Statistical Science, 16(2), 101\u2013133.",
  "AIAG (2005). Statistical Process Control (SPC) Reference Manual (2nd ed.).",
];

const ES = () => (
  <div className="space-y-5">
    <Section title="Cuándo se usa">
      <p>
        Cuando la caracter&iacute;stica de calidad es <strong>pasa / no pasa</strong>:
        cada unidad inspeccionada es conforme o defectuosa, y no hay una medida
        continua que analizar. Un informe llega tarde o no llega tarde; no hay
        &laquo;grado de tardanza&raquo;.
      </p>
      <p>
        El modelo es la <strong>binomial</strong>, y de ahi el nombre. Requiere
        que cada unidad tenga la misma probabilidad <V>p</V> de ser defectuosa y
        que las unidades sean independientes.<Cite>2</Cite>
      </p>
      <Warn>
        No confundir con la Poisson. Aqu&iacute; se cuentan{" "}
        <strong>unidades defectuosas</strong> sobre un total inspeccionado, y el
        conteo nunca puede pasar del tama&ntilde;o de muestra. Si lo que se
        cuentan son <strong>defectos por unidad</strong> {"\u2014"} varios en la
        misma pieza {"\u2014"} el modelo es Poisson, no binomial.
      </Warn>
    </Section>

    <Section title="La P Chart y los límites escalonados">
      <p>
        La proporci&oacute;n de cada subgrupo es <V>p</V><Sub>i</Sub> ={" "}
        <V>d</V><Sub>i</Sub> / <V>n</V><Sub>i</Sub>, y la l&iacute;nea central es
        la proporci&oacute;n global, no la media de las proporciones:
      </p>
      <Formula>
        <V>p̄</V> = {"\u03A3"} <V>d</V><Sub>i</Sub> / {"\u03A3"} <V>n</V>
        <Sub>i</Sub>
      </Formula>
      <p>
        Los l&iacute;mites de control salen de la desviaci&oacute;n t&iacute;pica
        de una proporci&oacute;n binomial:<Cite>2</Cite>
      </p>
      <Formula>
        <V>p̄</V> {"\u00B1"} 3 {"\u221A"}( <V>p̄</V> (1 {"\u2212"} <V>p̄</V>) /{" "}
        <V>n</V><Sub>i</Sub> )
      </Formula>
      <Note>
        Fijate en el <V>n</V><Sub>i</Sub> del denominador: <strong>cada subgrupo
        tiene sus propios l&iacute;mites</strong>. Los subgrupos grandes dan
        l&iacute;mites estrechos, porque una muestra grande estima <V>p</V> con
        m&aacute;s precisi&oacute;n. De ah&iacute; el perfil escalonado, que no
        es un defecto del gr&aacute;fico sino informaci&oacute;n.
      </Note>
      <p>
        Cuando la ra&iacute;z se sale del intervalo [0, 1], el l&iacute;mite se
        recorta: una proporci&oacute;n no puede ser negativa. Con <V>p</V>{" "}
        peque&ntilde;o y <V>n</V> peque&ntilde;o el LCL suele quedar en cero, y
        entonces el gr&aacute;fico <strong>pierde la capacidad de detectar
        mejoras</strong>: ning&uacute;n punto puede caer por debajo.
      </p>
    </Section>

    <Section title="Los tests para causas especiales">
      <p>
        Los cuatro tests provienen de la formulaci&oacute;n de Nelson
        (1984)<Cite>3</Cite> y buscan patrones que la aleatoriedad no
        explicar&iacute;a:
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>Test 1</strong> {"\u2014"} un punto a m&aacute;s de 3 sigmas.
          Un salto brusco.
        </li>
        <li>
          <strong>Test 2</strong> {"\u2014"} nueve seguidos al mismo lado. Un
          desplazamiento del nivel.
        </li>
        <li>
          <strong>Test 3</strong> {"\u2014"} seis crecientes o decrecientes. Una
          deriva.
        </li>
        <li>
          <strong>Test 4</strong> {"\u2014"} catorce alternando. Sobreajuste o
          dos fuentes mezcladas.
        </li>
      </ul>
      <Warn>
        Cada test que se a&ntilde;ade <strong>aumenta las falsas alarmas</strong>.
        Con solo el test 1, la probabilidad de se&ntilde;al falsa por punto es
        del orden de 0,0027; con los cuatro activos, sube apreciablemente. En un
        estudio de capacidad lo habitual es dejar solo el primero.
      </Warn>
    </Section>

    <Section title="El intervalo de confianza: por qué exacto">
      <p>
        El intervalo de este informe es el <strong>exacto de
        Clopper{"\u2013"}Pearson</strong> (1934),<Cite>1</Cite> obtenido
        invirtiendo la binomial acumulada mediante su relaci&oacute;n con la
        distribuci&oacute;n Beta:
      </p>
      <Formula>
        <V>p</V><Sub>L</Sub> = Beta<Sub>{"\u03B1"}/2</Sub>(<V>d</V>,{" "}
        <V>n</V> {"\u2212"} <V>d</V> + 1) {"\u00A0\u00A0\u00A0"}
        <V>p</V><Sub>U</Sub> = Beta<Sub>1{"\u2212"}{"\u03B1"}/2</Sub>(
        <V>d</V> + 1, <V>n</V> {"\u2212"} <V>d</V>)
      </Formula>
      <p>
        No es la aproximaci&oacute;n normal <V>p̂</V> {"\u00B1"} <V>z</V>{" "}
        {"\u221A"}(<V>p̂</V>(1{"\u2212"}<V>p̂</V>)/<V>n</V>), que en este mismo
        conjunto de datos dar&iacute;a l&iacute;mites distintos.
      </p>
      <Note>
        La aproximaci&oacute;n normal <strong>incumple su cobertura
        nominal</strong> cuando <V>p</V> se aleja de 0,5 o <V>n</V> es
        peque&ntilde;o: un intervalo &laquo;al 95 %&raquo; puede cubrir bastante
        menos.<Cite>6</Cite> Clopper{"\u2013"}Pearson garantiza{" "}
        <em>al menos</em> 1 {"\u2212"} {"\u03B1"}, a cambio de ser algo
        conservador {"\u2014"} un poco m&aacute;s ancho de lo estrictamente
        necesario.<Cite>5</Cite>
      </Note>
      <p>
        Es una decisi&oacute;n deliberada: en capacidad, un intervalo que promete
        m&aacute;s cobertura de la que tiene es peor que uno algo ancho.
      </p>
    </Section>

    <Section title="El Z del proceso">
      <p>
        Convierte la tasa de defectuosos en un nivel sigma, para poder comparar
        procesos por atributos con procesos por variables:<Cite>4</Cite>
      </p>
      <Formula>
        <V>Z</V> = {"\u03A6"}<sup>{"\u2212"}1</sup>(1 {"\u2212"} <V>p̄</V>)
      </Formula>
      <p>
        Es el punto de una normal est&aacute;ndar que deja a su derecha la misma
        proporci&oacute;n que la tasa de defectuosos observada.
      </p>
      <Warn>
        <strong>Los l&iacute;mites del Z se cruzan respecto a los de <V>p</V>.</strong>{" "}
        M&aacute;s defectuosos significa <em>menos</em> Z, as&iacute; que el
        l&iacute;mite inferior del Z se calcula con el <strong>superior</strong>
        {" "}del intervalo de <V>p</V>. Es un error f&aacute;cil de cometer al
        implementarlo.
      </Warn>
      <Note>
        Este Z <strong>no lleva el desplazamiento de 1,5 sigmas</strong> que
        aparece en la tabla clásica de niveles sigma. Es un Z a corto plazo
        calculado directamente de la proporci&oacute;n observada; si tu
        organizaci&oacute;n trabaja con la escala desplazada, hay que sumar 1,5
        antes de comparar.
      </Note>
    </Section>

    <Section title="Los otros tres gráficos">
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>Rate of Defectives</strong> {"\u2014"} %defectivo contra
          tama&ntilde;o de muestra. Si los puntos suben o bajan con el
          tama&ntilde;o, hay un problema de <em>muestreo</em>: la proporci&oacute;n
          no deber&iacute;a depender de cu&aacute;ntas unidades se miren.
        </li>
        <li>
          <strong>Cumulative %Defective</strong> {"\u2014"} la estimaci&oacute;n
          seg&uacute;n se acumulan datos. Si al final no se ha <em>estabilizado</em>,
          no hay datos suficientes para dar una cifra.
        </li>
        <li>
          <strong>Histograma</strong> {"\u2014"} distribuci&oacute;n de los
          %defectivos de los subgrupos. Bimodal o con cola larga sugiere que no
          hay un &uacute;nico proceso.
        </li>
      </ul>
    </Section>

    <Section title="Ejemplo resuelto">
      <p>
        Informes tardíos, 30 subgrupos de tama&ntilde;o variable entre 72 y 108,
        objetivo 10 %.
      </p>
      <p>
        Total: 485 defectuosos de 2762 inspeccionados, luego{" "}
        <V>p̄</V> = 0,175597, es decir <strong>17,56 %</strong> y 175 597 PPM. El
        intervalo exacto al 95 % es (16,16 %; 19,03 %), y{" "}
        <V>Z</V> = {"\u03A6"}<sup>{"\u2212"}1</sup>(0,824403) ={" "}
        <strong>0,9323</strong>, con l&iacute;mites (0,8768; 0,9880).
      </p>
      <p>
        El subgrupo 27 tiene 31 tard&iacute;os de 80, o sea 38,75 %, frente a un
        UCL de 0,3032 para ese tama&ntilde;o: <strong>fuera de control</strong>.
      </p>
      <Warn>
        Eso invalida la lectura de la capacidad. El 17,56 % es la media de un
        proceso que <em>cambi&oacute;</em> mientras se med&iacute;a, y no describe
        ning&uacute;n estado en el que el proceso haya estado realmente. Primero
        se busca la causa del d&iacute;a 27; luego se lee el &iacute;ndice.
      </Warn>
      <p>
        Y aun ignorando eso: el intervalo (16,16; 19,03) est&aacute;{" "}
        <strong>entero por encima</strong> del objetivo de 10 %. La distancia es
        real, no ruido de muestreo.
      </p>
    </Section>

    <Refs items={REFS} />
  </div>
);

const EN = () => (
  <div className="space-y-5">
    <Section title="When to use it">
      <p>
        When the quality characteristic is <strong>pass / fail</strong>: each
        inspected unit is either conforming or defective, and there is no
        continuous measurement to analyse. A report is late or it is not; there is
        no degree of lateness.
      </p>
      <p>
        The model is the <strong>binomial</strong>, hence the name. It requires
        each unit to have the same probability <V>p</V> of being defective, and
        the units to be independent.<Cite>2</Cite>
      </p>
      <Warn>
        Do not confuse this with Poisson. Here we count{" "}
        <strong>defective units</strong> out of a total inspected, and the count
        can never exceed the sample size. If what is counted is{" "}
        <strong>defects per unit</strong> {"\u2014"} several on the same piece
        {"\u2014"} the model is Poisson, not binomial.
      </Warn>
    </Section>

    <Section title="The P chart and its stepped limits">
      <p>
        Each subgroup proportion is <V>p</V><Sub>i</Sub> = <V>d</V><Sub>i</Sub> /{" "}
        <V>n</V><Sub>i</Sub>, and the centre line is the overall proportion, not
        the average of the proportions:
      </p>
      <Formula>
        <V>p̄</V> = {"\u03A3"} <V>d</V><Sub>i</Sub> / {"\u03A3"} <V>n</V>
        <Sub>i</Sub>
      </Formula>
      <p>
        The control limits come from the standard deviation of a binomial
        proportion:<Cite>2</Cite>
      </p>
      <Formula>
        <V>p̄</V> {"\u00B1"} 3 {"\u221A"}( <V>p̄</V> (1 {"\u2212"} <V>p̄</V>) /{" "}
        <V>n</V><Sub>i</Sub> )
      </Formula>
      <Note>
        Note the <V>n</V><Sub>i</Sub> in the denominator:{" "}
        <strong>every subgroup has its own limits</strong>. Large subgroups get
        narrow limits, because a large sample estimates <V>p</V> more precisely.
        That is where the stepped profile comes from, and it is information, not
        a drawing artefact.
      </Note>
      <p>
        When the root pushes a limit outside [0, 1] it is clipped: a proportion
        cannot be negative. With small <V>p</V> and small <V>n</V> the LCL often
        sits at zero, and the chart then{" "}
        <strong>loses the ability to detect improvement</strong>: no point can
        fall below it.
      </p>
    </Section>

    <Section title="Tests for special causes">
      <p>
        The four tests follow Nelson&rsquo;s formulation (1984)<Cite>3</Cite> and
        look for patterns randomness would not produce:
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>Test 1</strong> {"\u2014"} one point beyond 3 sigmas. A sudden
          jump.
        </li>
        <li>
          <strong>Test 2</strong> {"\u2014"} nine in a row on one side. A shift in
          level.
        </li>
        <li>
          <strong>Test 3</strong> {"\u2014"} six increasing or decreasing. A
          drift.
        </li>
        <li>
          <strong>Test 4</strong> {"\u2014"} fourteen alternating. Over-adjustment
          or two mixed sources.
        </li>
      </ul>
      <Warn>
        Each test added <strong>raises the false-alarm rate</strong>. With test 1
        alone the per-point false-signal probability is about 0.0027; with all
        four active it climbs appreciably. In a capability study the usual choice
        is test 1 only.
      </Warn>
    </Section>

    <Section title="The confidence interval: why exact">
      <p>
        The interval in this report is the{" "}
        <strong>exact Clopper{"\u2013"}Pearson</strong> one (1934),<Cite>1</Cite>{" "}
        obtained by inverting the cumulative binomial through its relationship
        with the Beta distribution:
      </p>
      <Formula>
        <V>p</V><Sub>L</Sub> = Beta<Sub>{"\u03B1"}/2</Sub>(<V>d</V>,{" "}
        <V>n</V> {"\u2212"} <V>d</V> + 1) {"\u00A0\u00A0\u00A0"}
        <V>p</V><Sub>U</Sub> = Beta<Sub>1{"\u2212"}{"\u03B1"}/2</Sub>(
        <V>d</V> + 1, <V>n</V> {"\u2212"} <V>d</V>)
      </Formula>
      <p>
        It is not the normal approximation <V>p̂</V> {"\u00B1"} <V>z</V>{" "}
        {"\u221A"}(<V>p̂</V>(1{"\u2212"}<V>p̂</V>)/<V>n</V>), which on these very
        data gives different limits.
      </p>
      <Note>
        The normal approximation <strong>fails its nominal coverage</strong> when{" "}
        <V>p</V> is far from 0.5 or <V>n</V> is small: a &ldquo;95 %&rdquo;
        interval may cover considerably less.<Cite>6</Cite>{" "}
        Clopper{"\u2013"}Pearson guarantees <em>at least</em> 1 {"\u2212"}{" "}
        {"\u03B1"}, at the price of being somewhat conservative {"\u2014"} a
        little wider than strictly necessary.<Cite>5</Cite>
      </Note>
      <p>
        That is a deliberate choice: in capability work, an interval that promises
        more coverage than it delivers is worse than one that is slightly wide.
      </p>
    </Section>

    <Section title="Process Z">
      <p>
        This converts the defective rate into a sigma level, so attribute
        processes can be compared with variable ones:<Cite>4</Cite>
      </p>
      <Formula>
        <V>Z</V> = {"\u03A6"}<sup>{"\u2212"}1</sup>(1 {"\u2212"} <V>p̄</V>)
      </Formula>
      <p>
        It is the point on a standard normal that leaves the observed defective
        rate to its right.
      </p>
      <Warn>
        <strong>The Z limits swap relative to those of <V>p</V>.</strong> More
        defectives means <em>less</em> Z, so the lower bound of Z is computed from
        the <strong>upper</strong> bound of the interval for <V>p</V>. It is an
        easy mistake to make when implementing this.
      </Warn>
      <Note>
        This Z carries <strong>no 1.5-sigma shift</strong>, unlike the classic
        sigma-level table. It is a short-term Z computed straight from the
        observed proportion; if your organisation works on the shifted scale, add
        1.5 before comparing.
      </Note>
    </Section>

    <Section title="The other three plots">
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>Rate of Defectives</strong> {"\u2014"} %defective against sample
          size. If the points trend with size, there is a <em>sampling</em>{" "}
          problem: the proportion should not depend on how many units are looked
          at.
        </li>
        <li>
          <strong>Cumulative %Defective</strong> {"\u2014"} the estimate as data
          accumulate. If it has not <em>settled</em> by the end, there are not
          enough data to quote a figure.
        </li>
        <li>
          <strong>Histogram</strong> {"\u2014"} distribution of the subgroup
          %defectives. Bimodal or long-tailed suggests more than one process.
        </li>
      </ul>
    </Section>

    <Section title="Worked example">
      <p>
        Late reports, 30 subgroups of varying size between 72 and 108, target
        10 %.
      </p>
      <p>
        Totals: 485 defectives out of 2762 inspected, so <V>p̄</V> = 0.175597,
        that is <strong>17.56 %</strong> and 175,597 PPM. The exact 95 % interval
        is (16.16 %, 19.03 %), and <V>Z</V> = {"\u03A6"}<sup>{"\u2212"}1</sup>
        (0.824403) = <strong>0.9323</strong>, with bounds (0.8768, 0.9880).
      </p>
      <p>
        Subgroup 27 has 31 late out of 80, that is 38.75 %, against a UCL of
        0.3032 for that size: <strong>out of control</strong>.
      </p>
      <Warn>
        That invalidates the capability reading. 17.56 % is the average of a
        process that <em>changed</em> while being measured, and it describes no
        state the process was ever actually in. Find the cause of day 27 first;
        read the index afterwards.
      </Warn>
      <p>
        And even setting that aside: the interval (16.16, 19.03) lies{" "}
        <strong>entirely above</strong> the 10 % target. The gap is real, not
        sampling noise.
      </p>
    </Section>

    <Refs items={REFS} />
  </div>
);

export default function CapBinomialTheory() {
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
