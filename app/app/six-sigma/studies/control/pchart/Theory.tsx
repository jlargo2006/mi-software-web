// app/app/six-sigma/studies/control/pchart/Theory.tsx
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
  "Laney, D. B. (2002). Improved control charts for attributes. Quality Engineering, 14(4), 531\u2013537.",
  "Heimann, P. A. (1996). Attributes control charts with large sample sizes. Journal of Quality Technology, 28(4), 451\u2013459.",
  "Ryan, T. P., & Schwertman, N. C. (1997). Optimal limits for attributes control charts. Journal of Quality Technology, 29(1), 86\u201398.",
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
    <Section title="Qué cambia respecto a las cartas de variables">
      <p>
        En una carta Xbar-R hay que estimar dos cosas por separado: el nivel y la
        dispersion. De ahi que hagan falta dos paneles.
      </p>
      <p>
        Aqui no. La variable es <strong>binaria</strong> {"\u2014"} cada unidad
        pasa o no pasa {"\u2014"} y la binomial tiene un solo parametro: la
        varianza es <V>p</V>(1{"\u2212"}<V>p</V>)/<V>n</V>, funcion de la propia
        media. Fijado el nivel, la dispersion queda determinada. Por eso la carta
        P tiene <strong>un solo panel</strong>: no hay nada independiente que
        vigilar.
      </p>
      <Note>
        Esta es tambien la debilidad de la carta. En una Xbar-R la carta de rangos
        avisa cuando el modelo falla. Aqui no hay segundo panel que avise, asi
        que la comprobacion hay que hacerla explicitamente {"\u2014"} de ahi el
        indice de dispersion que este modulo calcula.
      </Note>
    </Section>

    <Section title="Los límites">
      <Formula>
        p{"\u0305"} = {"\u03A3"}<V>d</V><Sub>i</Sub> / {"\u03A3"}<V>n</V>
        <Sub>i</Sub>
        {"\u00A0\u00A0\u00A0\u00A0"}
        LC = p{"\u0305"} {"\u00B1"} 3 {"\u221A"}( p{"\u0305"}(1{"\u2212"}p
        {"\u0305"}) / <V>n</V><Sub>i</Sub> )
      </Formula>
      <p>
        Dos detalles en esa formula que no son cosmeticos.
      </p>
      <p>
        <strong>La linea central es la proporcion agregada</strong>, no la media
        de las proporciones. Cada unidad inspeccionada debe pesar igual; promediar
        las proporciones daria el mismo peso a un subgrupo de 20 que a uno de
        2000.
      </p>
      <p>
        <strong>El <V>n</V><Sub>i</Sub> del denominador es el del subgrupo</strong>,
        no uno comun. Si los tamanos varian, los limites <em>escalonan</em>: una
        muestra mas grande estima mejor y merece limites mas estrechos. Una carta
        con limites en zigzag no esta mal dibujada; esta bien calculada.
      </p>
      <Warn>
        Y los limites se recortan al intervalo 0 a 1. Un LCL negativo no
        significa nada en una proporcion. Cuando eso pasa {"\u2014"} y pasa
        siempre que <V>n</V>p{"\u0305"} es pequeno {"\u2014"} la carta pierde su
        mitad inferior: <strong>ya no puede detectar una mejora</strong>, solo un
        empeoramiento. Es una limitacion real, no un detalle grafico.
      </Warn>
    </Section>

    <Section title="Sobredispersión: el fallo silencioso">
      <p>
        La binomial supone que <em>todas</em> las unidades del subgrupo tienen la
        misma probabilidad de fallar y que son independientes. Con subgrupos
        grandes esa suposicion se rompe con facilidad: los lotes difieren, los
        turnos difieren, los operarios difieren.
      </p>
      <p>
        Cuando se rompe, la variacion real supera a {"\u221A"}(p{"\u0305"}(1
        {"\u2212"}p{"\u0305"})/<V>n</V>), los limites salen{" "}
        <strong>demasiado estrechos</strong> y la carta senala sin parar. El
        efecto crece con <V>n</V>: con muestras de 10.000 casi cualquier carta P
        clasica se llena de puntos fuera.<Cite>5</Cite>
      </p>
      <Note>
        <strong>Como se mide.</strong> Se estandarizan los puntos,{" "}
        <V>z</V><Sub>i</Sub> = (<V>p</V><Sub>i</Sub> {"\u2212"} p{"\u0305"}) /
        {"\u03C3"}<Sub>i</Sub>, y se calcula su dispersion de corto plazo con el
        rango movil, igual que en una carta I-MR. Si el resultado ronda 1, la
        binomial describe bien los datos. Muy por encima de 1 hay
        sobredispersion; muy por debajo, subdispersion.
      </Note>
      <p>
        El remedio estandar es la carta <strong>P{"\u2032"} de Laney</strong>
        <Cite>4</Cite>, que multiplica la sigma por ese mismo factor. Este modulo
        calcula el indice y avisa, pero no dibuja la P{"\u2032"}.
      </p>
    </Section>

    <Section title="Aproximación normal y muestras pequeñas">
      <p>
        Los tres sigmas vienen de aproximar la binomial por una normal. La regla
        habitual pide <V>n</V>p{"\u0305"} {"\u2265"} 5 y <V>n</V>(1{"\u2212"}p
        {"\u0305"}) {"\u2265"} 5.
      </p>
      <Warn>
        Por debajo de eso la binomial es marcadamente asimetrica y los limites
        simetricos dejan de valer: la tasa de falsas alarmas no es la nominal, y
        el error es mayor en el lado corto. Con <V>p</V> muy pequena hace falta
        muestra mucho mas grande, o una carta binomial exacta.
      </Warn>
    </Section>

    <Section title="Los cuatro tests">
      <p>
        Solo existen los cuatro primeros de Nelson<Cite>2</Cite>. Los tests 5 a 8
        leen zonas de una sigma presuponiendo simetria alrededor de la linea
        central, y la binomial solo es simetrica cuando <V>p</V> ronda 0,5. En
        una carta con p{"\u0305"} = 0,02 esas zonas no describen nada.
      </p>
      <Note>
        El test 2 {"\u2014"} nueve puntos al mismo lado {"\u2014"} es el mas util
        aqui, y en la practica el mas informativo: detecta desplazamientos
        pequenos y sostenidos, que es la forma tipica en que una tasa de defectos
        empeora. Rara vez salta de golpe.
      </Note>
    </Section>

    <Section title="P, NP, C o U">
      <p>
        Confundirlas es el error mas comun con datos de atributos.
      </p>
      <p>
        <strong>P</strong> y <strong>NP</strong> cuentan <em>unidades
        defectuosas</em>: cada unidad pasa o falla, y el conteo nunca puede
        exceder el tamano de muestra. La P dibuja la proporcion, la NP el numero
        absoluto; son la misma carta con distinta escala, y la NP solo sirve con
        tamano constante.
      </p>
      <p>
        <strong>C</strong> y <strong>U</strong> cuentan <em>defectos</em>, y una
        misma unidad puede llevar varios. Ahi el modelo es Poisson, no binomial, y
        el conteo no tiene techo.
      </p>
      <Warn>
        La prueba practica: si el conteo puede superar el numero de unidades
        inspeccionadas, no es una carta P. Este modulo lo comprueba y rechaza la
        entrada.
      </Warn>
    </Section>

    <Section title="La causa especial que casi nadie busca">
      <Warn>
        En una carta de atributos, la causa especial mas frecuente no esta en el
        proceso: <strong>esta en la inspeccion</strong>. Un inspector nuevo, un
        criterio que se endurece, una definicion de defectuoso que cambia sin
        avisar. Todo eso desplaza la proporcion exactamente igual que un deterioro
        real, y comprobarlo no cuesta nada. Conviene descartarlo antes de tocar el
        proceso.
      </Warn>
    </Section>

    <Section title="Ejemplo resuelto">
      <p>
        23 semanas, 250 empleados por semana, 1.225 con errores en total.{" "}
        p{"\u0305"} = 1225 / 5750 = 0,21304.
      </p>
      <p>
        {"\u03C3"} = {"\u221A"}(0,21304 {"\u00D7"} 0,78696 / 250) = 0,02590,
        luego LC = 0,21304 {"\u00B1"} 0,07769 {"\u2192"} 0,29073 y 0,13535.
      </p>
      <Note>
        La semana 23 da 78/250 = 0,312 y falla el test 1. Pero mirando la serie
        completa el patron es mas elocuente que el punto: las tres ultimas semanas
        son 0,252 {"\u00B7"} 0,260 {"\u00B7"} 0,312, subiendo. Una carta de
        control senala un punto; leer la tendencia que lo precede es lo que
        permite actuar antes de la siguiente.
      </Note>
      <p>
        El indice de dispersion sale 0,91, cerca de 1: la binomial describe bien
        estos datos y no hay que recurrir a una P{"\u2032"}.
      </p>
    </Section>

    <Refs title="Bibliografía" />
  </div>
);

const EN = () => (
  <div className="space-y-5">
    <Section title="What changes from the variables charts">
      <p>
        An Xbar-R chart has to estimate two things separately, level and spread.
        That is why it needs two panels.
      </p>
      <p>
        Not here. The variable is <strong>binary</strong> {"\u2014"} each unit
        passes or fails {"\u2014"} and the binomial has a single parameter: the
        variance is <V>p</V>(1{"\u2212"}<V>p</V>)/<V>n</V>, a function of the mean
        itself. Fix the level and the spread follows. Hence the P chart has{" "}
        <strong>one panel</strong>: there is nothing independent left to watch.
      </p>
      <Note>
        That is also its weakness. On an Xbar-R chart the range panel warns you
        when the model fails. Here there is no second panel to do that, so the
        check has to be made explicitly {"\u2014"} hence the dispersion ratio this
        module reports.
      </Note>
    </Section>

    <Section title="The limits">
      <Formula>
        p{"\u0305"} = {"\u03A3"}<V>d</V><Sub>i</Sub> / {"\u03A3"}<V>n</V>
        <Sub>i</Sub>
        {"\u00A0\u00A0\u00A0\u00A0"}
        CL = p{"\u0305"} {"\u00B1"} 3 {"\u221A"}( p{"\u0305"}(1{"\u2212"}p
        {"\u0305"}) / <V>n</V><Sub>i</Sub> )
      </Formula>
      <p>Two details in that formula are not cosmetic.</p>
      <p>
        <strong>The centre line is the aggregate proportion</strong>, not the mean
        of the proportions. Every unit inspected should count equally; averaging
        proportions would give a subgroup of 20 the same weight as one of 2000.
      </p>
      <p>
        <strong>The <V>n</V><Sub>i</Sub> in the denominator is the subgroup{"\u2019"}s
        own</strong>, not a common one. If the sizes vary the limits{" "}
        <em>step</em>: a larger sample estimates better and deserves tighter
        limits. A chart with zigzag limits is not badly drawn, it is correctly
        computed.
      </p>
      <Warn>
        And the limits are clipped to the interval 0 to 1. A negative LCL means
        nothing for a proportion. When that happens {"\u2014"} and it always does
        when <V>n</V>p{"\u0305"} is small {"\u2014"} the chart loses its lower
        half: <strong>it can no longer detect an improvement</strong>, only a
        deterioration. That is a real limitation, not a drawing detail.
      </Warn>
    </Section>

    <Section title="Overdispersion: the silent failure">
      <p>
        The binomial assumes <em>every</em> unit in a subgroup shares the same
        probability of failing and that units are independent. With large
        subgroups that assumption breaks easily: batches differ, shifts differ,
        operators differ.
      </p>
      <p>
        When it breaks, real variation exceeds {"\u221A"}(p{"\u0305"}(1{"\u2212"}p
        {"\u0305"})/<V>n</V>), the limits come out <strong>too narrow</strong> and
        the chart signals constantly. The effect grows with <V>n</V>: at samples of
        10,000 almost any classical P chart fills with out-of-control points.
        <Cite>5</Cite>
      </p>
      <Note>
        <strong>How it is measured.</strong> Standardise the points,{" "}
        <V>z</V><Sub>i</Sub> = (<V>p</V><Sub>i</Sub> {"\u2212"} p{"\u0305"}) /
        {"\u03C3"}<Sub>i</Sub>, then take their short-term spread with the moving
        range, exactly as on an I-MR chart. A result near 1 means the binomial
        describes the data. Well above 1 is overdispersion; well below,
        underdispersion.
      </Note>
      <p>
        The standard remedy is Laney{"\u2019"}s <strong>P{"\u2032"} chart</strong>
        <Cite>4</Cite>, which multiplies sigma by that same factor. This module
        computes the ratio and warns, but does not draw the P{"\u2032"}.
      </p>
    </Section>

    <Section title="Normal approximation and small samples">
      <p>
        The three sigmas come from approximating the binomial with a normal. The
        usual rule asks for <V>n</V>p{"\u0305"} {"\u2265"} 5 and <V>n</V>(1
        {"\u2212"}p{"\u0305"}) {"\u2265"} 5.
      </p>
      <Warn>
        Below that the binomial is markedly skewed and symmetric limits stop
        working: the false alarm rate is not the nominal one, and the error is
        worse on the short side. With very small <V>p</V> a much larger sample is
        needed, or an exact binomial chart.
      </Warn>
    </Section>

    <Section title="The four tests">
      <p>
        Only Nelson{"\u2019"}s first four exist<Cite>2</Cite>. Tests 5 to 8 read
        one-sigma zones assuming symmetry about the centre line, and the binomial
        is symmetric only when <V>p</V> is near 0.5. On a chart with p{"\u0305"} =
        0.02 those zones describe nothing.
      </p>
      <Note>
        Test 2 {"\u2014"} nine points on one side {"\u2014"} is the most useful
        one here, and in practice the most informative: it catches small sustained
        shifts, which is how a defect rate typically worsens. It rarely jumps.
      </Note>
    </Section>

    <Section title="P, NP, C or U">
      <p>Confusing them is the commonest mistake with attribute data.</p>
      <p>
        <strong>P</strong> and <strong>NP</strong> count <em>defective units</em>:
        each unit passes or fails, and the count can never exceed the sample size.
        P plots the proportion, NP the absolute number; they are the same chart on
        a different scale, and NP only works with a constant size.
      </p>
      <p>
        <strong>C</strong> and <strong>U</strong> count <em>defects</em>, and one
        unit may carry several. There the model is Poisson, not binomial, and the
        count has no ceiling.
      </p>
      <Warn>
        The practical test: if the count can exceed the number of units inspected,
        it is not a P chart. This module checks that and rejects the input.
      </Warn>
    </Section>

    <Section title="The special cause almost nobody looks for">
      <Warn>
        On an attribute chart the commonest special cause is not in the process:{" "}
        <strong>it is in the inspection</strong>. A new inspector, a criterion
        quietly tightened, a definition of defective that changed. All of it shifts
        the proportion exactly like genuine deterioration, and ruling it out costs
        nothing. Do that before touching the process.
      </Warn>
    </Section>

    <Section title="Worked example">
      <p>
        23 weeks, 250 employees a week, 1,225 with errors in total. p{"\u0305"} =
        1225 / 5750 = 0.21304.
      </p>
      <p>
        {"\u03C3"} = {"\u221A"}(0.21304 {"\u00D7"} 0.78696 / 250) = 0.02590, so CL
        = 0.21304 {"\u00B1"} 0.07769 {"\u2192"} 0.29073 and 0.13535.
      </p>
      <Note>
        Week 23 is 78/250 = 0.312 and fails test 1. But across the whole series
        the pattern says more than the point: the last three weeks run 0.252{" "}
        {"\u00B7"} 0.260 {"\u00B7"} 0.312, climbing. A control chart flags a
        point; reading the trend that led to it is what lets you act before the
        next one.
      </Note>
      <p>
        The dispersion ratio is 0.91, close to 1: the binomial describes these
        data well and no P{"\u2032"} chart is needed.
      </p>
    </Section>

    <Refs title="References" />
  </div>
);

export default function PChartTheory() {
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
