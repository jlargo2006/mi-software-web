// app/app/six-sigma/studies/capability/poisson/Theory.tsx
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

const REFS = [
  "Garwood, F. (1936). Fiducial limits for the Poisson distribution. Biometrika, 28(3/4), 437\u2013442.",
  "Montgomery, D. C. (2013). Introduction to Statistical Quality Control (7th ed.), ch. 7: Control Charts for Attributes. Wiley.",
  "Nelson, L. S. (1984). The Shewhart control chart \u2014 tests for special causes. Journal of Quality Technology, 16(4), 237\u2013239.",
  "Sachs, L. (1984). Applied Statistics: A Handbook of Techniques (2nd ed.). Springer \u2014 exact limits for Poisson counts.",
  "Wheeler, D. J., & Chambers, D. S. (1992). Understanding Statistical Process Control (2nd ed.). SPC Press.",
  "Barker, L. (2002). A comparison of nine confidence intervals for a Poisson parameter when the expected number of events is \u2264 5. The American Statistician, 56(2), 85\u201389.",
  "AIAG (2005). Statistical Process Control (SPC) Reference Manual (2nd ed.).",
];

const Refs = () => (
  <section className="space-y-2">
    <h3 className="font-bold text-base text-[#00674d] border-b border-gray-200 pb-1">
      Bibliografía / References
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
        Cuando se cuentan <strong>defectos</strong>, no unidades defectuosas. Una
        misma pieza puede tener tres ara&ntilde;azos, y los tres cuentan. Una
        aplicaci&oacute;n puede requerir cinco cambios, y los cinco cuentan.
      </p>
      <p>
        El modelo es la <strong>Poisson</strong>, que describe el n&uacute;mero de
        sucesos en una extensi&oacute;n dada de tiempo, superficie o
        producto.<Cite>2</Cite> Requiere que los defectos ocurran de forma
        independiente y a tasa constante por unidad de exposici&oacute;n.
      </p>
      <Warn>
        <strong>La diferencia con la binomial es esencial, no de matiz.</strong>{" "}
        Ahí el conteo estaba acotado por el tama&ntilde;o de muestra: no puedes
        tener 31 defectuosos de 30. Aquí <strong>no hay techo</strong>: el DPU
        puede valer 2,75 sin ninguna contradicci&oacute;n. Si tus datos tienen
        tope natural, el modelo es binomial; si no lo tienen, Poisson.
      </Warn>
    </Section>

    <Section title="La U Chart y por qué no hay factor (1 − p)">
      <p>
        Los defectos por unidad de cada subgrupo son{" "}
        <V>u</V><Sub>i</Sub> = <V>c</V><Sub>i</Sub> / <V>n</V><Sub>i</Sub>, y la
        l&iacute;nea central es la tasa global:
      </p>
      <Formula>
        <V>ū</V> = {"\u03A3"} <V>c</V><Sub>i</Sub> / {"\u03A3"} <V>n</V>
        <Sub>i</Sub>
      </Formula>
      <p>
        En una Poisson <strong>la varianza es igual a la media</strong>, y de ahi
        salen los l&iacute;mites:<Cite>2</Cite>
      </p>
      <Formula>
        <V>ū</V> {"\u00B1"} 3 {"\u221A"}( <V>ū</V> / <V>n</V><Sub>i</Sub> )
      </Formula>
      <Note>
        Compara con la P Chart, que llevaba <V>p̄</V>(1{"\u2212"}<V>p̄</V>) en la
        ra&iacute;z. Aqu&iacute; <strong>ese factor no aparece</strong>, porque no
        hay un m&aacute;ximo del que quedarse corto. La consecuencia
        pr&aacute;ctica: el UCL <em>no</em> est&aacute; acotado por 1.
      </Note>
      <p>
        El LCL s&iacute; se recorta a cero, porque no puede haber un n&uacute;mero
        negativo de defectos. Con <V>ū</V> peque&ntilde;o o subgrupos
        peque&ntilde;os el LCL queda en cero y el gr&aacute;fico{" "}
        <strong>pierde la capacidad de detectar mejoras</strong>.
      </p>
    </Section>

    <Section title="El intervalo exacto: chi cuadrado, no Beta">
      <p>
        En binomial el intervalo exacto sal&iacute;a de la Beta. En Poisson sale
        de la <strong>chi cuadrado</strong>, por la relaci&oacute;n entre la
        Poisson acumulada y esa distribuci&oacute;n (Garwood,
        1936):<Cite>1</Cite>
      </p>
      <Formula>
        {"\u03BB"}<Sub>L</Sub> = {"\u03C7"}<sup>2</sup>
        <Sub>{"\u03B1"}/2</Sub>(2<V>D</V>) / (2<V>N</V>)
        {"\u00A0\u00A0\u00A0"}
        {"\u03BB"}<Sub>U</Sub> = {"\u03C7"}<sup>2</sup>
        <Sub>1{"\u2212"}{"\u03B1"}/2</Sub>(2<V>D</V> + 2) / (2<V>N</V>)
      </Formula>
      <Warn>
        <strong>Los grados de libertad no son los mismos arriba y abajo:</strong>{" "}
        2<V>D</V> para el inferior y 2<V>D</V>+2 para el superior. Es el error
        m&aacute;s com&uacute;n al implementar esto, y produce un intervalo casi
        correcto {"\u2014"} lo bastante para pasar desapercibido.
      </Warn>
      <p>
        La aproximaci&oacute;n normal <V>ū</V> {"\u00B1"} <V>z</V> {"\u221A"}(
        <V>ū</V>/<V>N</V>) es tentadora por lo simple, pero{" "}
        <strong>falla justo donde importa</strong>: con pocos defectos totales su
        cobertura real cae muy por debajo de la nominal.<Cite>6</Cite> Y en
        capacidad, pocos defectos es el caso interesante.
      </p>
    </Section>

    <Section title="Por qué aquí no hay Process Z">
      <p>
        El informe binomial daba un <V>Z</V> del proceso. Este no, y no es una
        omisi&oacute;n.
      </p>
      <Note>
        Un <V>Z</V> traduce una <strong>proporci&oacute;n de unidades
        conformes</strong> a un nivel sigma, y eso exige que cada unidad sea
        conforme o no. Con defectos por unidad esa dicotom&iacute;a no existe:
        una pieza con tres defectos no es &laquo;tres veces no conforme&raquo;.
        Convertir un DPU en sigma exigir&iacute;a suponer adem&aacute;s{" "}
        <em>c&oacute;mo</em> se reparten los defectos entre las unidades.
      </Note>
      <p>
        Si necesitas un nivel sigma, la ruta habitual es pasar por el rendimiento{" "}
        <V>Y</V> = <V>e</V><sup>{"\u2212"}DPU</sup>, que asume Poisson, y de ahi a
        Z. Pero conviene saber que se est&aacute; a&ntilde;adiendo un supuesto,
        no calculando un dato.
      </p>
    </Section>

    <Section title="Los cuatro gráficos">
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>U Chart</strong> {"\u2014"} estabilidad en el tiempo. Es el
          primero que hay que leer: sin estabilidad, el resto no significa nada.
        </li>
        <li>
          <strong>Defect Rate</strong> {"\u2014"} DPU contra tama&ntilde;o de
          muestra. Las bandas son <em>hip&eacute;rbolas</em>, porque dependen de{" "}
          {"\u221A"}(<V>ū</V>/<V>n</V>): se estrechan al crecer <V>n</V>. Si los
          puntos siguen una tendencia con el tama&ntilde;o, hay un problema de
          muestreo.
        </li>
        <li>
          <strong>Cumulative DPU</strong> {"\u2014"} la estimaci&oacute;n
          seg&uacute;n se acumulan datos. Deber&iacute;a{" "}
          <em>estabilizarse</em>; si al final sigue subiendo o bajando, es deriva,
          no falta de datos.
        </li>
        <li>
          <strong>Histograma</strong> {"\u2014"} distribuci&oacute;n de los DPU de
          los subgrupos.
        </li>
      </ul>
    </Section>

    <Section title="Ejemplo resuelto">
      <p>
        Cambios solicitados en aplicaciones, 25 periodos, tama&ntilde;os de 4 a 29
        aplicaciones, objetivo 1 DPU.
      </p>
      <p>
        Total: 220 cambios en 428 aplicaciones, luego{" "}
        <V>ū</V> = <strong>0,5140</strong> DPU. El intervalo exacto al 95 % es
        (0,4483; 0,5866). M&iacute;nimo 0,0500 y m&aacute;ximo 2,7500.
      </p>
      <p>
        Fallan el test 1 los subgrupos <strong>7, 8, 13, 14 y 25</strong>: cinco
        de 25, el 20 %.
      </p>
      <Warn>
        Fíjate en el <strong>signo</strong> de cada se&ntilde;al. Los subgrupos 7,
        8, 13 y 14 se salen <em>por arriba</em>, pero el <strong>25</strong> se
        sale <em>por abajo</em> (0,1034 frente a un LCL de 0,1146). Un punto bajo
        el LCL no es un problema que corregir: es un periodo que fue mejor de lo
        que el proceso sabe sostener, y hay que entenderlo por la raz&oacute;n
        contraria.
      </Warn>
      <p>
        Y hay un patr&oacute;n temporal claro: los cuatro puntos altos est&aacute;n
        al principio y el bajo al final, mientras el tama&ntilde;o crece de 15 a 29
        y el DPU acumulado cae de 0,67 a 0,51.
      </p>
      <Note>
        Eso no es un proceso inestable: es un proceso que{" "}
        <strong>mejor&oacute; durante el estudio</strong>. Un intervalo
        &uacute;nico sobre estos datos mezcla dos reg&iacute;menes y no estima
        ninguno. La cifra que predice el ma&ntilde;ana es la de la segunda mitad,
        no la global.
      </Note>
    </Section>

    <Refs />
  </div>
);

const EN = () => (
  <div className="space-y-5">
    <Section title="When to use it">
      <p>
        When what is counted is <strong>defects</strong>, not defective units. One
        piece may carry three scratches, and all three count. One application may
        need five changes, and all five count.
      </p>
      <p>
        The model is the <strong>Poisson</strong>, which describes the number of
        events in a given extent of time, area or product.<Cite>2</Cite> It
        requires defects to occur independently and at a constant rate per unit of
        exposure.
      </p>
      <Warn>
        <strong>The difference from the binomial is essential, not a nuance.</strong>{" "}
        There the count was bounded by the sample size: you cannot have 31
        defectives out of 30. Here there is <strong>no ceiling</strong>: a DPU of
        2.75 involves no contradiction. If your data have a natural cap, the model
        is binomial; if they do not, Poisson.
      </Warn>
    </Section>

    <Section title="The U chart, and why there is no (1 − p) factor">
      <p>
        Defects per unit in each subgroup are <V>u</V><Sub>i</Sub> ={" "}
        <V>c</V><Sub>i</Sub> / <V>n</V><Sub>i</Sub>, and the centre line is the
        overall rate:
      </p>
      <Formula>
        <V>ū</V> = {"\u03A3"} <V>c</V><Sub>i</Sub> / {"\u03A3"} <V>n</V>
        <Sub>i</Sub>
      </Formula>
      <p>
        In a Poisson <strong>the variance equals the mean</strong>, and the limits
        follow from that:<Cite>2</Cite>
      </p>
      <Formula>
        <V>ū</V> {"\u00B1"} 3 {"\u221A"}( <V>ū</V> / <V>n</V><Sub>i</Sub> )
      </Formula>
      <Note>
        Compare with the P chart, which carried <V>p̄</V>(1{"\u2212"}<V>p̄</V>)
        inside the root. Here <strong>that factor is absent</strong>, because
        there is no maximum to fall short of. The practical consequence: the UCL
        is <em>not</em> capped at 1.
      </Note>
      <p>
        The LCL is still clipped at zero, since there cannot be a negative number
        of defects. With small <V>ū</V> or small subgroups the LCL sits at zero
        and the chart <strong>loses the ability to detect improvement</strong>.
      </p>
    </Section>

    <Section title="The exact interval: chi-square, not Beta">
      <p>
        In the binomial case the exact interval came from the Beta. For the
        Poisson it comes from the <strong>chi-square</strong>, through the
        relationship between the cumulative Poisson and that distribution
        (Garwood, 1936):<Cite>1</Cite>
      </p>
      <Formula>
        {"\u03BB"}<Sub>L</Sub> = {"\u03C7"}<sup>2</sup>
        <Sub>{"\u03B1"}/2</Sub>(2<V>D</V>) / (2<V>N</V>)
        {"\u00A0\u00A0\u00A0"}
        {"\u03BB"}<Sub>U</Sub> = {"\u03C7"}<sup>2</sup>
        <Sub>1{"\u2212"}{"\u03B1"}/2</Sub>(2<V>D</V> + 2) / (2<V>N</V>)
      </Formula>
      <Warn>
        <strong>The degrees of freedom differ between the two bounds:</strong> 2
        <V>D</V> for the lower and 2<V>D</V>+2 for the upper. This is the most
        common implementation mistake, and it produces an almost-correct interval
        {"\u2014"} close enough to go unnoticed.
      </Warn>
      <p>
        The normal approximation <V>ū</V> {"\u00B1"} <V>z</V> {"\u221A"}(<V>ū</V>/
        <V>N</V>) is tempting for its simplicity, but it{" "}
        <strong>fails exactly where it matters</strong>: with few total defects
        its actual coverage drops well below nominal.<Cite>6</Cite> And in
        capability work, few defects is the interesting case.
      </p>
    </Section>

    <Section title="Why there is no Process Z here">
      <p>
        The binomial report gave a process <V>Z</V>. This one does not, and that
        is not an omission.
      </p>
      <Note>
        A <V>Z</V> translates a <strong>proportion of conforming units</strong>{" "}
        into a sigma level, which requires each unit to be either conforming or
        not. With defects per unit that dichotomy does not exist: a part with
        three defects is not &ldquo;three times non-conforming&rdquo;. Converting
        a DPU into sigma would additionally require assuming <em>how</em> the
        defects are spread across units.
      </Note>
      <p>
        If you need a sigma level, the usual route is through the yield{" "}
        <V>Y</V> = <V>e</V><sup>{"\u2212"}DPU</sup>, which assumes Poisson, and
        from there to Z. But it is worth knowing that this adds an assumption
        rather than computing a fact.
      </p>
    </Section>

    <Section title="The four plots">
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>U chart</strong> {"\u2014"} stability over time. Read this
          first: without stability, nothing else means anything.
        </li>
        <li>
          <strong>Defect Rate</strong> {"\u2014"} DPU against sample size. The
          bands are <em>hyperbolas</em>, because they depend on {"\u221A"}(
          <V>ū</V>/<V>n</V>): they narrow as <V>n</V> grows. If the points trend
          with size, there is a sampling problem.
        </li>
        <li>
          <strong>Cumulative DPU</strong> {"\u2014"} the estimate as data
          accumulate. It should <em>settle</em>; if it is still climbing or
          falling at the end, that is drift, not shortage of data.
        </li>
        <li>
          <strong>Histogram</strong> {"\u2014"} distribution of the subgroup DPUs.
        </li>
      </ul>
    </Section>

    <Section title="Worked example">
      <p>
        Change requests against applications, 25 periods, sizes from 4 to 29
        applications, target 1 DPU.
      </p>
      <p>
        Totals: 220 changes across 428 applications, so <V>ū</V> ={" "}
        <strong>0.5140</strong> DPU. The exact 95 % interval is (0.4483, 0.5866).
        Minimum 0.0500, maximum 2.7500.
      </p>
      <p>
        Subgroups <strong>7, 8, 13, 14 and 25</strong> fail test 1: five out of
        25, or 20 %.
      </p>
      <Warn>
        Note the <strong>direction</strong> of each signal. Subgroups 7, 8, 13 and
        14 break out <em>above</em>, but <strong>25</strong> breaks out{" "}
        <em>below</em> (0.1034 against an LCL of 0.1146). A point under the LCL is
        not a problem to fix: it is a period that went better than the process can
        normally hold, and it deserves attention for the opposite reason.
      </Warn>
      <p>
        And there is a clear time pattern: the four high points are early and the
        low one is last, while subgroup size grows from 15 to 29 and the
        cumulative DPU falls from 0.67 to 0.51.
      </p>
      <Note>
        That is not an unstable process: it is a process that{" "}
        <strong>improved during the study</strong>. A single interval over these
        data mixes two regimes and estimates neither. The figure that predicts
        tomorrow is the one from the second half, not the overall one.
      </Note>
    </Section>

    <Refs />
  </div>
);

export default function CapPoissonTheory() {
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
