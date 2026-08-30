// app/app/six-sigma/studies/control/cchart/Theory.tsx
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
  "Wheeler, D. J., & Chambers, D. S. (1992). Understanding Statistical Process Control (2nd ed.). SPC Press.",
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
    <Section title="La carta más simple que existe">
      <p>
        La carta C es la carta U con <V>n</V> = 1 fijo: misma relacion que hay
        entre la NP y la P. Cada subgrupo es <strong>una unidad de
        inspeccion</strong> de la misma extension {"\u2014"} el mismo turno, la
        misma superficie, la misma longitud {"\u2014"} y se dibuja el conteo
        bruto.
      </p>
      <p>
        Como no hay tamano que varie, la linea central es plana y los limites
        tambien. No hay escalonado ni tamanos desiguales que gestionar.
      </p>
      <Note>
        Y hay algo mas notable: <strong>un solo numero define la carta
        entera</strong>. En una Poisson la varianza es igual a la media, asi que
        estimada la media ya no queda nada por estimar. Es el caso extremo de lo
        que empezo con la carta P.
      </Note>
    </Section>

    <Section title="Los límites">
      <Formula>
        c{"\u0305"} = {"\u03A3"}<V>c</V><sub>i</sub> / <V>k</V>
        {"\u00A0\u00A0\u00A0\u00A0"}
        {"\u03C3"} = {"\u221A"}c{"\u0305"}
        {"\u00A0\u00A0\u00A0\u00A0"}
        LC = c{"\u0305"} {"\u00B1"} 3{"\u221A"}c{"\u0305"}
      </Formula>
      <p>
        Aqui si es la media aritmetica de los conteos, no una tasa agregada: sin
        tamanos de subgrupo, todos pesan igual por construccion.
      </p>
      <Warn>
        El limite inferior se recorta en cero, y con medias bajas esto no es un
        detalle. Hace falta c{"\u0305"} {"\u003E"} 9 para que el LCL despegue del
        cero. Por debajo,{" "}
        <strong>la carta no puede detectar una mejora</strong>: ni siquiera cero
        defectos cae fuera. Solo vigila hacia arriba. Convenga saberlo antes de
        usar una carta C para verificar que una accion correctiva ha funcionado.
      </Warn>
    </Section>

    <Section title="El supuesto de área de oportunidad constante">
      <p>
        Toda la carta descansa en que la <strong>extension inspeccionada sea la
        misma</strong> en todos los subgrupos. Si un turno dura mas, produce mas
        defectos por si solo, y eso no es una causa especial: es aritmetica.
      </p>
      <Warn>
        La prueba es sencilla: {"\u00BF"}la cantidad inspeccionada fue identica en
        cada subgrupo? Si la respuesta es no, la carta correcta es la U, que
        divide por el tamano y hace comparables los subgrupos.
      </Warn>
      <p>
        Es el error mas comun con cartas C, y ademas silencioso: la carta se
        dibuja igual de bien y las senales que produce son artefactos del tamano
        variable.
      </p>
    </Section>

    <Section title="Media pequeña y asimetría">
      <p>
        Los tres sigmas vienen de aproximar la Poisson por una normal. Con la
        media por debajo de 5 la Poisson es visiblemente asimetrica: la cola
        derecha es mas larga que la izquierda.
      </p>
      <Warn>
        Los limites simetricos no reparten bien el riesgo. La probabilidad real de
        falsa alarma por arriba y por abajo no es la nominal, y con medias muy
        bajas la carta es casi ciega por debajo. El remedio no es cambiar la
        formula: es <strong>agrupar los conteos en periodos mas largos</strong>{" "}
        hasta que la media suba.
      </Warn>
    </Section>

    <Section title="Sobredispersión">
      <p>
        La Poisson supone que los defectos ocurren de forma independiente y a tasa
        constante. En la practica se agrupan: una tanda con un problema de
        material genera un racimo. Cuando eso pasa la variacion real supera a la
        media, los limites salen demasiado estrechos y la carta senala de mas.
      </p>
      <Note>
        Se mide estandarizando los puntos y calculando su dispersion de corto
        plazo con el rango movil, como en una I-MR. Cerca de 1, la Poisson vale.
        Muy por encima, el remedio estandar es una carta de Laney<Cite>4</Cite>.
      </Note>
    </Section>

    <Section title="Los cuatro tests">
      <p>
        Solo existen los cuatro primeros de Nelson<Cite>2</Cite>. Del 5 al 8 leen
        zonas de una sigma presuponiendo simetria, y ya se ha visto que la Poisson
        no la tiene con media pequena.
      </p>
      <Note>
        Con conteos bajos y discretos, el test 2 {"\u2014"} nueve puntos al mismo
        lado {"\u2014"} tiene una peculiaridad: muchos valores coinciden
        exactamente con la media o quedan muy cerca, y las rachas se vuelven menos
        informativas de lo que sugiere su probabilidad teorica.
      </Note>
    </Section>

    <Section title="Ejemplo resuelto">
      <p>
        20 subgrupos, 47 accidentes. c{"\u0305"} = 47 / 20 = 2,35 y{" "}
        {"\u03C3"} = {"\u221A"}2,35 = 1,533.
      </p>
      <p>
        UCL = 2,35 + 3 {"\u00D7"} 1,533 = 6,949. LCL = 2,35 {"\u2212"} 4,60 ={" "}
        {"\u2212"}2,25, que se recorta a 0.
      </p>
      <Note>
        Ningun punto fuera: los maximos son 5, en los subgrupos 1 y 14, bien por
        debajo de 6,95. Pero note las dos limitaciones juntas {"\u2014"} el LCL en
        cero y la media en 2,35, por debajo de 5. Esta carta puede avisar de un
        empeoramiento; no puede confirmar una mejora ni garantizar su tasa nominal
        de falsas alarmas. Con datos de accidentes, agrupar por trimestres en vez
        de por mes resolveria las dos cosas a la vez.
      </Note>
    </Section>

    <Refs title="Bibliografía" />
  </div>
);

const EN = () => (
  <div className="space-y-5">
    <Section title="The simplest chart there is">
      <p>
        The C chart is the U chart with <V>n</V> fixed at 1 {"\u2014"} the same
        relation NP has to P. Each subgroup is <strong>one inspection unit</strong>{" "}
        of the same extent (the same shift, the same area, the same length) and
        the raw count is plotted.
      </p>
      <p>
        With no size to vary, the centre line is flat and so are the limits. There
        is no stepping and no unequal sizes to manage.
      </p>
      <Note>
        And something more remarkable: <strong>a single number defines the whole
        chart</strong>. In a Poisson the variance equals the mean, so once the
        mean is estimated there is nothing left to estimate. It is the extreme
        case of what began with the P chart.
      </Note>
    </Section>

    <Section title="The limits">
      <Formula>
        c{"\u0305"} = {"\u03A3"}<V>c</V><sub>i</sub> / <V>k</V>
        {"\u00A0\u00A0\u00A0\u00A0"}
        {"\u03C3"} = {"\u221A"}c{"\u0305"}
        {"\u00A0\u00A0\u00A0\u00A0"}
        CL = c{"\u0305"} {"\u00B1"} 3{"\u221A"}c{"\u0305"}
      </Formula>
      <p>
        Here it really is the arithmetic mean of the counts, not an aggregate
        rate: with no subgroup sizes, all subgroups weigh the same by
        construction.
      </p>
      <Warn>
        The lower limit is clipped at zero, and with small means that is no
        detail. A mean above 9 is needed before the LCL lifts off zero. Below
        that, <strong>the chart cannot detect an improvement</strong>: not even a
        count of zero falls outside. It only watches upwards. Worth knowing before
        using a C chart to verify that a corrective action worked.
      </Warn>
    </Section>

    <Section title="The constant area of opportunity">
      <p>
        Everything rests on the <strong>inspected extent being the same</strong> in
        every subgroup. A longer shift produces more defects on its own, and that
        is not a special cause: it is arithmetic.
      </p>
      <Warn>
        The test is simple: was the amount inspected identical in every subgroup?
        If not, the right chart is the U chart, which divides by the size and makes
        subgroups comparable.
      </Warn>
      <p>
        This is the commonest error with C charts, and a silent one: the chart
        draws just as nicely, and the signals it produces are artefacts of the
        varying size.
      </p>
    </Section>

    <Section title="Small mean and skewness">
      <p>
        The three sigmas come from approximating the Poisson with a normal. Below a
        mean of about 5 the Poisson is visibly skewed: its right tail is longer
        than its left.
      </p>
      <Warn>
        Symmetric limits then split the risk unevenly. The real false alarm
        probability above and below is not the nominal one, and with very small
        means the chart is nearly blind below. The remedy is not a different
        formula: it is <strong>grouping the counts over longer periods</strong>{" "}
        until the mean rises.
      </Warn>
    </Section>

    <Section title="Overdispersion">
      <p>
        The Poisson assumes defects occur independently and at a constant rate. In
        practice they cluster: a batch with a material problem produces a cluster.
        When that happens the real variation exceeds the mean, the limits come out
        too narrow and the chart over-signals.
      </p>
      <Note>
        It is measured by standardising the points and taking their short-term
        spread with the moving range, as on an I-MR chart. Near 1, the Poisson
        holds. Well above, the standard remedy is a Laney chart.<Cite>4</Cite>
      </Note>
    </Section>

    <Section title="The four tests">
      <p>
        Only Nelson{"\u2019"}s first four exist<Cite>2</Cite>. Tests 5 to 8 read
        one-sigma zones assuming symmetry, which the Poisson does not have at small
        means.
      </p>
      <Note>
        With low discrete counts test 2 {"\u2014"} nine points on one side {"\u2014"}
        has a quirk: many values land exactly on or very near the mean, so runs
        become less informative than their theoretical probability suggests.
      </Note>
    </Section>

    <Section title="Worked example">
      <p>
        20 subgroups, 47 accidents. c{"\u0305"} = 47 / 20 = 2.35 and {"\u03C3"} ={" "}
        {"\u221A"}2.35 = 1.533.
      </p>
      <p>
        UCL = 2.35 + 3 {"\u00D7"} 1.533 = 6.949. LCL = 2.35 {"\u2212"} 4.60 ={" "}
        {"\u2212"}2.25, clipped to 0.
      </p>
      <Note>
        No point is out of control: the maxima are 5, at subgroups 1 and 14, well
        below 6.95. But note the two limitations together {"\u2014"} the LCL at
        zero and a mean of 2.35, below 5. This chart can warn of a deterioration;
        it cannot confirm an improvement, nor guarantee its nominal false alarm
        rate. With accident data, grouping by quarter instead of by month would fix
        both at once.
      </Note>
    </Section>

    <Refs title="References" />
  </div>
);

export default function CChartTheory() {
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
