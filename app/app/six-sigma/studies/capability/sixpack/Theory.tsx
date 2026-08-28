// app/app/six-sigma/studies/capability/sixpack/Theory.tsx
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
  "Montgomery, D. C. (2013). Introduction to Statistical Quality Control (7th ed.), ch. 6 y 8. Wiley.",
  "Kotz, S., & Johnson, N. L. (2002). Process capability indices \u2014 a review, 1992\u20132000. Journal of Quality Technology, 34(1), 2\u201319.",
  "Bothe, D. R. (1997). Measuring Process Capability. McGraw-Hill.",
  "Stephens, M. A. (1974). EDF statistics for goodness of fit and some comparisons. JASA, 69(347), 730\u2013737.",
  "D'Agostino, R. B., & Stephens, M. A. (1986). Goodness-of-Fit Techniques. Marcel Dekker.",
  "Wheeler, D. J., & Chambers, D. S. (1992). Understanding Statistical Process Control (2nd ed.). SPC Press.",
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
    <Section title="Qué añade al análisis normal">
      <p>
        Los mismos &iacute;ndices, pero acompa&ntilde;ados de las{" "}
        <strong>tres comprobaciones de las que dependen</strong>: que el proceso
        sea estable, que los datos sean razonablemente normales, y que la
        variaci&oacute;n dentro de los subgrupos represente de verdad el corto
        plazo.
      </p>
      <Warn>
        Un Cpk sin esas comprobaciones es una cifra sin garant&iacute;a. La
        capacidad <strong>predice</strong> el comportamiento futuro, y una
        predicci&oacute;n exige que el proceso sea repetible. Si los
        gr&aacute;ficos de control muestran se&ntilde;ales, no hay un proceso
        &uacute;nico del que ser capaz.<Cite>6</Cite>
      </Warn>
      <p>Orden de lectura: gr&aacute;ficos, normalidad, y solo entonces &iacute;ndices.</p>
    </Section>

    <Section title="Los dos sigmas del informe">
      <p>
        Este es el punto que m&aacute;s confunde. El informe usa{" "}
        <strong>dos estimadores distintos</strong> de la variaci&oacute;n de
        corto plazo, y no es un descuido.
      </p>
      <Formula>
        Gr&aacute;ficos: {"\u03C3"}<Sub>chart</Sub> = <V>R̄</V> / <V>d</V>
        <Sub>2</Sub>
        {"\u00A0\u00A0\u00A0\u00A0"}
        &Iacute;ndices: {"\u03C3"}<Sub>within</Sub> = <V>s</V><Sub>pooled</Sub> /{" "}
        <V>c</V><Sub>4</Sub>
      </Formula>
      <p>
        Los l&iacute;mites del gr&aacute;fico de medias se calculan con{" "}
        <V>R̄</V>/<V>d</V><Sub>2</Sub>, el estimador cl&aacute;sico del
        gr&aacute;fico de control. Los &iacute;ndices Cp y Cpk se calculan con la
        desviaci&oacute;n pooled corregida por sesgo, que es m&aacute;s eficiente.
      </p>
      <Note>
        Con <em>filler2</em> y subgrupo 6: {"\u03C3"}<Sub>chart</Sub> = 2,1079 y{" "}
        {"\u03C3"}<Sub>within</Sub> = 2,1263. Los l&iacute;mites del Xbar salen en
        222,474; con el pooled sald&iacute;an en 222,496. Son valores
        pr&oacute;ximos, pero distintos, y la diferencia delata si una
        implementaci&oacute;n usa el estimador correcto en cada sitio.
      </Note>
      <p>
        La correcci&oacute;n <V>c</V><Sub>4</Sub> merece atenci&oacute;n aparte:{" "}
        <V>s</V><Sub>pooled</Sub><sup>2</sup> estima sin sesgo la{" "}
        <em>varianza</em>, pero su ra&iacute;z <strong>subestima</strong>{" "}
        {"\u03C3"}, porque la ra&iacute;z es c&oacute;ncava. La correcci&oacute;n
        es peque&ntilde;a {"\u2014"} el 0,25 % con 100 grados de libertad{" "}
        {"\u2014"} y aun as&iacute; mueve el Cp de 0,78 a 0,79 en el redondeo.
      </p>
    </Section>

    <Section title="Panel a panel">
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>Xbar Chart</strong> {"\u2014"} {"\u00BF"}se mantiene el{" "}
          <em>centro</em> del proceso? Con subgrupo 1 pasa a ser gr&aacute;fico de
          individuales.
        </li>
        <li>
          <strong>R o S Chart</strong> {"\u2014"} {"\u00BF"}se mantiene la{" "}
          <em>dispersi&oacute;n</em>? Desde subgrupo 9 se usa S, porque el rango
          solo aprovecha dos de las <V>n</V> observaciones y pierde eficiencia.
        </li>
        <li>
          <strong>Histograma</strong> {"\u2014"} las dos curvas ajustadas contra
          las especificaciones. La separaci&oacute;n entre la roja (overall) y la
          gris (within) es la variaci&oacute;n <em>entre</em> subgrupos.
        </li>
        <li>
          <strong>Gr&aacute;fico de probabilidad normal</strong> {"\u2014"}{" "}
          normalidad, con el estad&iacute;stico de Anderson-Darling. Este test{" "}
          <strong>pondera las colas</strong>, y por eso es el adecuado
          aqu&iacute;: las colas son lo que determina los PPM.<Cite>4</Cite>
        </li>
        <li>
          <strong>&Uacute;ltimos N subgrupos</strong> {"\u2014"} los valores
          individuales, no las medias. Una media tranquila puede esconder dos
          poblaciones.
        </li>
        <li>
          <strong>Capability Plot</strong> {"\u2014"} las dos anchuras de 6
          {"\u03C3"} contra el intervalo de tolerancia. Es la &uacute;nica vista
          que no traduce nada a un &iacute;ndice.
        </li>
      </ul>
    </Section>

    <Section title="El tamaño de subgrupo no está en los datos">
      <Warn>
        Es una <strong>decisi&oacute;n del analista</strong>, y determina el
        resultado m&aacute;s que cualquier detalle de c&aacute;lculo.
      </Warn>
      <p>
        Con las 120 medidas de <em>filler2</em>, seg&uacute;n c&oacute;mo se
        agrupen:
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li>Subgrupo 6, pooled corregido {"\u2192"} 2,1263 {"\u2192"} Cp 0,78</li>
        <li>
          Subgrupo 1, rangos m&oacute;viles {"\u2192"} 2,0754 {"\u2192"} Cp 0,80
        </li>
      </ul>
      <Note>
        La regla es <strong>f&iacute;sica, no estad&iacute;stica</strong>: un
        subgrupo debe agrupar unidades producidas en condiciones tan homogeneas
        como sea posible, de modo que dentro solo act&uacute;e la
        variaci&oacute;n com&uacute;n. Si eliges mal, {"\u03C3"}
        <Sub>within</Sub> deja de medir el corto plazo y el Cp deja de significar
        nada.
      </Note>
    </Section>

    <Section title="Ejemplo resuelto">
      <p>
        <em>filler2</em>: 120 medidas, subgrupo 6, LSL 215 y USL 225.
      </p>
      <p>
        Media 219,892. <V>R̄</V> = 5,34, luego el R chart tiene UCL ={" "}
        <V>D</V><Sub>4</Sub><V>R̄</V> = 10,70. Los l&iacute;mites del Xbar quedan
        en 222,474 y 217,311. Ning&uacute;n punto se sale en ninguno de los dos:{" "}
        <strong>proceso estable</strong>.
      </p>
      <p>
        Anderson-Darling da AD = 0,138 con p = 0,976: no hay ninguna prueba
        contra la normalidad.
      </p>
      <p>
        {"\u03C3"}<Sub>within</Sub> = 2,126 y {"\u03C3"}<Sub>overall</Sub> =
        2,107, casi iguales, lo que confirma que apenas hay deriva entre
        subgrupos. Cp = 0,78, Cpk = 0,77, Pp = 0,79, Ppk = 0,77.
      </p>
      <Note>
        Las comprobaciones salen todas bien, y sin embargo{" "}
        <strong>el proceso no es capaz</strong>. Cpk 0,77 corresponde a unos
        18.850 PPM fuera de especificaci&oacute;n, cerca del 2 %. Y como Cp y Cpk
        est&aacute;n casi juntos, el problema no es el centrado: es la{" "}
        <strong>dispersi&oacute;n</strong>. Centrar no arregla nada aqu&iacute;;
        hay que reducir la variabilidad.
      </Note>
    </Section>

    <Refs />
  </div>
);

const EN = () => (
  <div className="space-y-5">
    <Section title="What it adds to the normal analysis">
      <p>
        The same indices, but alongside the{" "}
        <strong>three checks they depend on</strong>: that the process is stable,
        that the data are reasonably normal, and that within-subgroup variation
        really represents the short term.
      </p>
      <Warn>
        A Cpk without those checks is a figure with no warranty. Capability{" "}
        <strong>predicts</strong> future behaviour, and a prediction requires a
        repeatable process. If the control charts show signals, there is no
        single process to be capable of.<Cite>6</Cite>
      </Warn>
      <p>Reading order: charts, normality, and only then the indices.</p>
    </Section>

    <Section title="The two sigmas in the report">
      <p>
        This is the most confusing point. The report uses{" "}
        <strong>two different estimators</strong> of short-term variation, and
        that is deliberate.
      </p>
      <Formula>
        Charts: {"\u03C3"}<Sub>chart</Sub> = <V>R̄</V> / <V>d</V><Sub>2</Sub>
        {"\u00A0\u00A0\u00A0\u00A0"}
        Indices: {"\u03C3"}<Sub>within</Sub> = <V>s</V><Sub>pooled</Sub> /{" "}
        <V>c</V><Sub>4</Sub>
      </Formula>
      <p>
        The Xbar chart limits use <V>R̄</V>/<V>d</V><Sub>2</Sub>, the classical
        control-chart estimator. Cp and Cpk use the pooled deviation corrected
        for bias, which is more efficient.
      </p>
      <Note>
        With <em>filler2</em> at subgroup 6: {"\u03C3"}<Sub>chart</Sub> = 2.1079
        and {"\u03C3"}<Sub>within</Sub> = 2.1263. The Xbar UCL comes out at
        222.474; with the pooled value it would be 222.496. Close, but different,
        and the difference reveals whether an implementation uses the right
        estimator in each place.
      </Note>
      <p>
        The <V>c</V><Sub>4</Sub> correction deserves its own note:{" "}
        <V>s</V><Sub>pooled</Sub><sup>2</sup> is an unbiased estimator of the{" "}
        <em>variance</em>, but its square root{" "}
        <strong>underestimates</strong> {"\u03C3"}, because the root is concave.
        The correction is small {"\u2014"} 0.25 % at 100 degrees of freedom{" "}
        {"\u2014"} and still moves Cp from 0.78 to 0.79 on rounding.
      </p>
    </Section>

    <Section title="Panel by panel">
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>Xbar chart</strong> {"\u2014"} does the process{" "}
          <em>centre</em> hold? At subgroup 1 it becomes an individuals chart.
        </li>
        <li>
          <strong>R or S chart</strong> {"\u2014"} does the <em>spread</em> hold?
          From subgroup 9 onwards S is used, because the range draws on only two
          of the <V>n</V> observations and loses efficiency.
        </li>
        <li>
          <strong>Histogram</strong> {"\u2014"} both fitted curves against the
          specifications. The gap between the red (overall) and grey (within)
          curves is the variation <em>between</em> subgroups.
        </li>
        <li>
          <strong>Normal probability plot</strong> {"\u2014"} normality, with the
          Anderson{"\u2013"}Darling statistic. That test{" "}
          <strong>weights the tails</strong>, which is why it belongs here: the
          tails are what set the PPM.<Cite>4</Cite>
        </li>
        <li>
          <strong>Last N subgroups</strong> {"\u2014"} individual values, not
          means. A calm mean can hide two populations.
        </li>
        <li>
          <strong>Capability plot</strong> {"\u2014"} both 6{"\u03C3"} widths
          against the tolerance band. The only view that translates nothing into
          an index.
        </li>
      </ul>
    </Section>

    <Section title="Subgroup size is not in the data">
      <Warn>
        It is an <strong>analyst's decision</strong>, and it drives the result
        more than any computational detail.
      </Warn>
      <p>
        With the 120 measurements in <em>filler2</em>, depending on the grouping:
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li>Subgroup 6, corrected pooled {"\u2192"} 2.1263 {"\u2192"} Cp 0.78</li>
        <li>Subgroup 1, moving ranges {"\u2192"} 2.0754 {"\u2192"} Cp 0.80</li>
      </ul>
      <Note>
        The rule is <strong>physical, not statistical</strong>: a subgroup should
        gather units produced under conditions as homogeneous as possible, so
        that only common-cause variation acts inside it. Choose wrongly and{" "}
        {"\u03C3"}<Sub>within</Sub> stops measuring the short term, and Cp stops
        meaning anything.
      </Note>
    </Section>

    <Section title="Worked example">
      <p>
        <em>filler2</em>: 120 measurements, subgroup 6, LSL 215 and USL 225.
      </p>
      <p>
        Mean 219.892. <V>R̄</V> = 5.34, so the R chart UCL is{" "}
        <V>D</V><Sub>4</Sub><V>R̄</V> = 10.70. The Xbar limits fall at 222.474 and
        217.311. No point breaks out on either chart:{" "}
        <strong>the process is stable</strong>.
      </p>
      <p>
        Anderson{"\u2013"}Darling gives AD = 0.138 with p = 0.976: no evidence
        against normality.
      </p>
      <p>
        {"\u03C3"}<Sub>within</Sub> = 2.126 and {"\u03C3"}<Sub>overall</Sub> =
        2.107, almost equal, confirming there is little drift between subgroups.
        Cp = 0.78, Cpk = 0.77, Pp = 0.79, Ppk = 0.77.
      </p>
      <Note>
        Every check passes, and yet{" "}
        <strong>the process is not capable</strong>. Cpk 0.77 corresponds to some
        18,850 PPM out of specification, close to 2 %. And since Cp and Cpk sit
        almost together, the problem is not centring: it is{" "}
        <strong>spread</strong>. Recentring fixes nothing here; the variability
        has to come down.
      </Note>
    </Section>

    <Refs />
  </div>
);

export default function CapSixpackTheory() {
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
