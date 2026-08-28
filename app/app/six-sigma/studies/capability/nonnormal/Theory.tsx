// app/app/six-sigma/studies/capability/nonnormal/Theory.tsx
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
  "Clements, J. A. (1989). Process capability calculations for non-normal distributions. Quality Progress, 22(9), 95\u2013100.",
  "ISO 22514-4:2016. Statistical methods in process management \u2014 Capability and performance.",
  "Bothe, D. R. (1997). Measuring Process Capability. McGraw-Hill.",
  "Kotz, S., & Lovelace, C. R. (1998). Process Capability Indices in Theory and Practice. Arnold.",
  "Stephens, M. A. (1974). EDF statistics for goodness of fit and some comparisons. JASA, 69(347), 730\u2013737.",
  "D'Agostino, R. B., & Stephens, M. A. (1986). Goodness-of-Fit Techniques. Marcel Dekker.",
  "Minka, T. P. (2002). Estimating a Gamma distribution. Technical note.",
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
    <Section title="Por qué no vale forzar la normal">
      <p>
        Los &iacute;ndices normales resumen el proceso en media y desviaci&oacute;n
        porque la normal queda determinada por esos dos n&uacute;meros. En una
        distribuci&oacute;n asim&eacute;trica no: dos procesos con la misma media
        y la misma desviaci&oacute;n pueden tener colas radicalmente distintas, y
        la cola <strong>es</strong> la capacidad.
      </p>
      <Warn>
        Con datos sesgados a la derecha {"\u2014"} tiempos de ciclo, duraciones,
        concentraciones {"\u2014"} el ajuste normal <strong>subestima</strong> la
        cola larga y <strong>predice defectos donde no puede haberlos</strong>,
        por debajo de cero. El error no es de precisi&oacute;n: es de signo.
      </Warn>
    </Section>

    <Section title="Los dos Ppk">
      <p>
        Este es el punto que hay que entender antes que ning&uacute;n otro.
        Existen <strong>dos definiciones distintas</strong> de la capacidad no
        normal, y dan resultados que no se parecen.
      </p>
      <p>
        <strong>1 · Benchmark Z.</strong> Se calcula la probabilidad de fallo con
        el modelo ajustado y se traduce al <V>Z</V> normal que dar&iacute;a esa
        misma probabilidad.
      </p>
      <Formula>
        <V>Z</V><Sub>LSL</Sub> = {"\u03A6"}<sup>{"\u22121"}</sup>(1 {"\u2212"}{" "}
        <V>F</V>(LSL)){"\u00A0\u00A0\u00A0\u00A0"}
        Ppk = min(<V>Z</V><Sub>LSL</Sub>, <V>Z</V><Sub>USL</Sub>) / 3
      </Formula>
      <p>
        <strong>2 · Percentiles (ISO 22514).</strong> Se sustituye 6{"\u03C3"} por
        la anchura real entre percentiles.<Cite>2</Cite>
      </p>
      <Formula>
        <V>P</V><Sub>p</Sub> = (USL {"\u2212"} LSL) / (<V>x</V>
        <Sub>99,865</Sub> {"\u2212"} <V>x</V><Sub>0,135</Sub>)
        <br />
        <V>P</V><Sub>pk</Sub> = min[ (USL {"\u2212"} <V>x</V><Sub>50</Sub>) / (
        <V>x</V><Sub>99,865</Sub> {"\u2212"} <V>x</V><Sub>50</Sub>) , (<V>x</V>
        <Sub>50</Sub> {"\u2212"} LSL) / (<V>x</V><Sub>50</Sub> {"\u2212"} <V>x</V>
        <Sub>0,135</Sub>) ]
      </Formula>
      <Note>
        Con el ejemplo de <em>Cycletime</em>: Benchmark Z da Ppk = 0,06 y los
        percentiles dan Ppk = 0,17. <strong>Casi el triple</strong>, sobre el
        mismo proceso y el mismo ajuste. El primero mide riesgo, el segundo mide
        encaje. Ninguno es falso; lo inaceptable es citar uno sin decir
        cu&aacute;l.
      </Note>
      <p>
        La mediana sustituye a la media porque en una distribuci&oacute;n
        asim&eacute;trica la media no est&aacute; en el centro de la
        probabilidad: el percentil 50 s&iacute;.
      </p>
    </Section>

    <Section title="El ajuste manda sobre todo lo demás">
      <Warn>
        Toda la salida cuelga de una decisi&oacute;n: qu&eacute;
        distribuci&oacute;n. Cambiarla mueve los PPM en un orden de magnitud,
        porque los PPM se leen en las colas y es justo ah&iacute; donde dos
        modelos con AD parecido pueden discrepar much&iacute;simo.
      </Warn>
      <p>
        Por eso este m&oacute;dulo ajusta <strong>las nueve candidatas</strong> y
        las ordena por Anderson-Darling, con la elegida marcada. Es media
        identificaci&oacute;n de distribuci&oacute;n integrada, y evita el error
        cl&aacute;sico: aceptar la primera del desplegable.
      </p>
      <p>
        El AD <strong>pondera las colas</strong>, a diferencia de
        Kolmogorov-Smirnov, que es sensible sobre todo al centro. Para capacidad
        esa propiedad no es un detalle: es la raz&oacute;n de usarlo.<Cite>5</Cite>
      </p>
      <Note>
        Un <code>*</code> en la columna P significa que no hay tabla publicada
        fiable para esa familia (gamma, log&iacute;stica, log-log&iacute;stica),
        no que el ajuste haya fallado. El estad&iacute;stico AD sigue siendo
        comparable entre modelos; lo que falta es el p-valor.
      </Note>
    </Section>

    <Section title="Solo dos parámetros">
      <p>
        No se ofrecen las versiones de tres par&aacute;metros. La raz&oacute;n es
        t&eacute;cnica y conviene decirla: cuando el par&aacute;metro de umbral se
        acerca al m&iacute;nimo muestral, la verosimilitud{" "}
        <strong>diverge</strong>. El optimizador encuentra entonces ajustes de AD
        espectacular que no se sostienen con datos nuevos.
      </p>
      <p>
        Un umbral debe venir de la f&iacute;sica del proceso {"\u2014"} un tiempo
        m&iacute;nimo de m&aacute;quina, un espesor de partida {"\u2014"} y
        restarse de los datos antes del an&aacute;lisis, no dejarse estimar.
      </p>
    </Section>

    <Section title="Boundary">
      <p>
        Marcar un l&iacute;mite como <em>Boundary</em> declara que es una frontera{" "}
        <strong>f&iacute;sica</strong>, no un requisito. Un tiempo no puede ser
        negativo; una concentraci&oacute;n no pasa del 100 %. En ese caso no se
        cuentan defectos esperados a ese lado.
      </p>
      <Warn>
        No lo marques porque el l&iacute;mite sea indeseable. Solo si es
        inalcanzable. Marcarlo mal borra la mitad del riesgo del informe.
      </Warn>
    </Section>

    <Section title="Ejemplo resuelto">
      <p>
        <em>Cycletime</em>: 200 observaciones, Weibull, LSL 60 y USL 240.
      </p>
      <p>Ajuste ML: shape = 1,08667 y scale = 101,4576. Media muestral 98,2418.</p>
      <p>
        PPM observados: 450.000 por debajo y 80.000 por encima. PPM esperados por
        el modelo: 431.674 y 78.176, total 509.849. La coincidencia entre
        observado y esperado respalda el ajuste.
      </p>
      <p>
        <V>Z</V><Sub>LSL</Sub> = 0,17 y <V>Z</V><Sub>USL</Sub> = 1,42, luego{" "}
        <V>Z</V><Sub>Bench</Sub> = {"\u2212"}0,02 y Ppk = 0,06. Por percentiles,
        Pp = 0,31 y Ppk = 0,17.
      </p>
      <Note>
        Un <V>Z</V><Sub>Bench</Sub> negativo significa que{" "}
        <strong>
          m&aacute;s de la mitad de la producci&oacute;n est&aacute; fuera de
          especificaci&oacute;n
        </strong>
        : 509.849 PPM es el 51 %. Y f&iacute;jate d&oacute;nde: casi todo el fallo
        est&aacute; por <em>debajo</em> del LSL, no en la cola larga que llama la
        atenci&oacute;n en el histograma. El AD del ajuste es 0,477, que con n =
        200 deja p {"\u2248"} 0,09: la Weibull pasa, pero justa.
      </Note>
    </Section>

    <Refs title="Bibliografía" />
  </div>
);

const EN = () => (
  <div className="space-y-5">
    <Section title="Why forcing a normal does not work">
      <p>
        Normal indices summarise a process by its mean and standard deviation
        because a normal distribution is fully determined by those two numbers. A
        skewed distribution is not: two processes with the same mean and
        deviation can have radically different tails, and the tail{" "}
        <strong>is</strong> the capability.
      </p>
      <Warn>
        With right-skewed data {"\u2014"} cycle times, durations, concentrations{" "}
        {"\u2014"} a normal fit <strong>understates</strong> the long tail and{" "}
        <strong>predicts defects where none can occur</strong>, below zero. The
        error is not one of precision but of sign.
      </Warn>
    </Section>

    <Section title="The two Ppk">
      <p>
        This is the point to grasp before any other. There are{" "}
        <strong>two different definitions</strong> of nonnormal capability, and
        they give results that do not resemble each other.
      </p>
      <p>
        <strong>1 · Benchmark Z.</strong> The failure probability is computed from
        the fitted model and converted into the normal <V>Z</V> that would give
        the same probability.
      </p>
      <Formula>
        <V>Z</V><Sub>LSL</Sub> = {"\u03A6"}<sup>{"\u22121"}</sup>(1 {"\u2212"}{" "}
        <V>F</V>(LSL)){"\u00A0\u00A0\u00A0\u00A0"}
        Ppk = min(<V>Z</V><Sub>LSL</Sub>, <V>Z</V><Sub>USL</Sub>) / 3
      </Formula>
      <p>
        <strong>2 · Percentiles (ISO 22514).</strong> 6{"\u03C3"} is replaced by
        the actual width between percentiles.<Cite>2</Cite>
      </p>
      <Formula>
        <V>P</V><Sub>p</Sub> = (USL {"\u2212"} LSL) / (<V>x</V>
        <Sub>99.865</Sub> {"\u2212"} <V>x</V><Sub>0.135</Sub>)
        <br />
        <V>P</V><Sub>pk</Sub> = min[ (USL {"\u2212"} <V>x</V><Sub>50</Sub>) / (
        <V>x</V><Sub>99.865</Sub> {"\u2212"} <V>x</V><Sub>50</Sub>) , (<V>x</V>
        <Sub>50</Sub> {"\u2212"} LSL) / (<V>x</V><Sub>50</Sub> {"\u2212"} <V>x</V>
        <Sub>0.135</Sub>) ]
      </Formula>
      <Note>
        On the <em>Cycletime</em> example: Benchmark Z gives Ppk = 0.06 and
        percentiles give Ppk = 0.17. <strong>Almost three times as much</strong>,
        for the same process and the same fit. The first measures risk, the second
        measures fit. Neither is false; what is unacceptable is quoting one
        without saying which.
      </Note>
      <p>
        The median replaces the mean because in a skewed distribution the mean is
        not at the centre of the probability. The 50th percentile is.
      </p>
    </Section>

    <Section title="The fit governs everything else">
      <Warn>
        The whole output hangs on one decision: which distribution. Changing it
        moves the PPM by an order of magnitude, because PPM are read off the
        tails, and that is exactly where two models with similar AD can disagree
        wildly.
      </Warn>
      <p>
        That is why this module fits <strong>all nine candidates</strong> and
        ranks them by Anderson{"\u2013"}Darling, with the chosen one marked. It is
        half a distribution-identification study built in, and it prevents the
        classic mistake: accepting whatever the dropdown offered first.
      </p>
      <p>
        AD <strong>weights the tails</strong>, unlike Kolmogorov{"\u2013"}Smirnov,
        which is most sensitive in the centre. For capability that property is not
        a detail: it is the reason to use it.<Cite>5</Cite>
      </p>
      <Note>
        A <code>*</code> in the P column means no reliable published table exists
        for that family (gamma, logistic, loglogistic), not that the fit failed.
        The AD statistic remains comparable across models; only the p-value is
        missing.
      </Note>
    </Section>

    <Section title="Two parameters only">
      <p>
        Three-parameter versions are not offered. The reason is technical and
        worth stating: as the threshold parameter approaches the sample minimum,
        the likelihood <strong>diverges</strong>. The optimiser then finds fits
        with spectacular AD that do not hold up on new data.
      </p>
      <p>
        A threshold should come from the physics of the process {"\u2014"} a
        minimum machine time, a starting thickness {"\u2014"} and be subtracted
        from the data before the analysis, not estimated from it.
      </p>
    </Section>

    <Section title="Boundary">
      <p>
        Marking a limit as <em>Boundary</em> declares it a{" "}
        <strong>physical</strong> barrier rather than a requirement. A time cannot
        be negative; a concentration cannot exceed 100 %. In that case no expected
        defects are counted on that side.
      </p>
      <Warn>
        Do not tick it because the limit is undesirable. Only if it is
        unreachable. Ticking it wrongly erases half the risk from the report.
      </Warn>
    </Section>

    <Section title="Worked example">
      <p>
        <em>Cycletime</em>: 200 observations, Weibull, LSL 60 and USL 240.
      </p>
      <p>ML fit: shape = 1.08667 and scale = 101.4576. Sample mean 98.2418.</p>
      <p>
        Observed PPM: 450,000 below and 80,000 above. Expected from the model:
        431,674 and 78,176, total 509,849. The agreement between observed and
        expected supports the fit.
      </p>
      <p>
        <V>Z</V><Sub>LSL</Sub> = 0.17 and <V>Z</V><Sub>USL</Sub> = 1.42, so{" "}
        <V>Z</V><Sub>Bench</Sub> = {"\u2212"}0.02 and Ppk = 0.06. By percentiles,
        Pp = 0.31 and Ppk = 0.17.
      </p>
      <Note>
        A negative <V>Z</V><Sub>Bench</Sub> means{" "}
        <strong>more than half the output is out of specification</strong>:
        509,849 PPM is 51 %. And note where: almost all of the failure is{" "}
        <em>below</em> the LSL, not in the long tail that draws the eye on the
        histogram. The fit gives AD = 0.477, which at n = 200 leaves p{" "}
        {"\u2248"} 0.09: the Weibull passes, but only just.
      </Note>
    </Section>

    <Refs title="References" />
  </div>
);

export default function CapNonnormalTheory() {
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
