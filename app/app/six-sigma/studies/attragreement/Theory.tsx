// app/app/six-sigma/studies/attragreement/Theory.tsx
"use client";
import React, { useState } from "react";

type Lang = "es" | "en";

/* ---------- helpers de presentación ---------- */

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

const Frac = ({ num, den }: { num: React.ReactNode; den: React.ReactNode }) => (
  <span className="inline-flex flex-col align-middle text-center mx-1">
    <span className="border-b border-gray-700 px-2 pb-0.5">{num}</span>
    <span className="px-2 pt-0.5">{den}</span>
  </span>
);

const Sqrt = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center align-middle">
    <span className="text-lg">{"\u221A"}</span>
    <span className="border-t border-gray-700 pt-0.5 px-1">{children}</span>
  </span>
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

/* ---------- fórmulas compartidas (independientes del idioma) ---------- */

const FormulaPercent = () => (
  <Formula>
    Percent = <Frac num={<># Matched</>} den={<># Inspected</>} /> {"\u00D7"} 100
  </Formula>
);

const FormulaCP = ({ lower, upper }: { lower: string; upper: string }) => (
  <Formula>
    <div className="space-y-1">
      <div>
        {lower} = <V>B</V>
        <Sub>{"\u03B1"}/2</Sub>(<V>x</V>, <V>n</V> {"\u2212"} <V>x</V> + 1)
      </div>
      <div>
        {upper} = <V>B</V>
        <Sub>1{"\u2212"}{"\u03B1"}/2</Sub>(<V>x</V> + 1, <V>n</V> {"\u2212"} <V>x</V>)
      </div>
    </div>
  </Formula>
);

const FormulaKappa = () => (
  <Formula>
    {"\u03BA"} ={" "}
    <Frac
      num={<>P{"\u0304"} {"\u2212"} P<Sub>e</Sub></>}
      den={<>1 {"\u2212"} P<Sub>e</Sub></>}
    />
  </Formula>
);

const FormulaPbarPe = ({ note }: { note: string }) => (
  <Formula>
    <div className="space-y-3">
      <div>
        P{"\u0304"} ={" "}
        <Frac
          num={<>{"\u03A3"}<Sub>i</Sub> ({"\u03A3"}<Sub>j</Sub> <V>x</V><Sub>ij</Sub>{"\u00B2"} {"\u2212"} <V>n</V>)</>}
          den={<><V>N</V> <V>n</V>(<V>n</V> {"\u2212"} 1)</>}
        />
      </div>
      <div>
        P<Sub>e</Sub> = {"\u03A3"}<Sub>j</Sub> <V>p</V><Sub>j</Sub>{"\u00B2"}
        <span className="ml-3 text-sm text-gray-600">{note}</span>
      </div>
    </div>
  </Formula>
);

const FormulaKappaCat = () => (
  <Formula>
    {"\u03BA"}<Sub>j</Sub> = 1 {"\u2212"}{" "}
    <Frac
      num={<>{"\u03A3"}<Sub>i</Sub> <V>x</V><Sub>ij</Sub>(<V>n</V> {"\u2212"} <V>x</V><Sub>ij</Sub>)</>}
      den={<><V>N</V> <V>n</V>(<V>n</V> {"\u2212"} 1) <V>p</V><Sub>j</Sub>(1 {"\u2212"} <V>p</V><Sub>j</Sub>)</>}
    />
  </Formula>
);

const FormulaSECat = () => (
  <Formula>
    SE({"\u03BA"}<Sub>j</Sub>) ={" "}
    <Sqrt>
      <Frac num={<>2</>} den={<><V>N</V> <V>n</V>(<V>n</V> {"\u2212"} 1)</>} />
    </Sqrt>
  </Formula>
);

const FormulaSEOverall = () => (
  <Formula>
    SE({"\u03BA"}) ={" "}
    <Frac
      num={
        <Sqrt>
          2 [ ({"\u03A3"}<Sub>j</Sub> <V>p</V><Sub>j</Sub>(1{"\u2212"}<V>p</V><Sub>j</Sub>)){"\u00B2"} {"\u2212"}{" "}
          {"\u03A3"}<Sub>j</Sub> <V>p</V><Sub>j</Sub>(1{"\u2212"}<V>p</V><Sub>j</Sub>)(1{"\u2212"}2<V>p</V><Sub>j</Sub>) ]
        </Sqrt>
      }
      den={
        <>
          (1 {"\u2212"} P<Sub>e</Sub>){" "}
          <Sqrt><V>N</V> <V>n</V>(<V>n</V> {"\u2212"} 1)</Sqrt>
        </>
      }
    />
  </Formula>
);

const FormulaZP = () => (
  <Formula>
    <div className="space-y-1">
      <div>
        <V>Z</V> = <Frac num={<>{"\u03BA"}</>} den={<>SE({"\u03BA"})</>} />
      </div>
      <div>
        <V>p</V> = P(<V>Z</V> &gt; <V>z</V>) = 1 {"\u2212"} {"\u03A6"}(<V>z</V>)
      </div>
    </div>
  </Formula>
);

const FormulaAllVsStd = ({ k }: { k: string }) => (
  <Formula>
    <div className="space-y-2">
      <div>
        {"\u03BA"}<Sub>all</Sub> = <Frac num={<>1</>} den={<><V>{k}</V></>} />{" "}
        {"\u03A3"}<Sub>i</Sub> {"\u03BA"}<Sub>i</Sub>
      </div>
      <div>
        SE({"\u03BA"}<Sub>all</Sub>) ={" "}
        <Frac
          num={<Sqrt>{"\u03A3"}<Sub>i</Sub> SE({"\u03BA"}<Sub>i</Sub>){"\u00B2"}</Sqrt>}
          den={<V>{k}</V>}
        />
      </div>
    </div>
  </Formula>
);

/* ---------- tabla de interpretación ---------- */

const KappaScale = ({ head, rows }: { head: [string, string]; rows: [string, string][] }) => (
  <div className="overflow-x-auto">
    <table className="border-collapse text-sm my-2">
      <thead>
        <tr>
          {head.map((h) => (
            <th key={h} className="border border-gray-300 px-3 py-1 bg-gray-100 text-left">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map(([a, b]) => (
          <tr key={a}>
            <td className="border border-gray-300 px-3 py-1">{a}</td>
            <td className="border border-gray-300 px-3 py-1">{b}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/* ---------- contenido ES ---------- */

function ContentES() {
  return (
    <>
      <Section title="1. Objeto del estudio">
        <p>
          El Attribute Agreement Analysis es el equivalente al Gage R&amp;R cuando la
          respuesta es <strong>categórica</strong> (pasa/no pasa, escalas ordinales
          {" \u2212"}2{"\u2026"}+2, códigos de defecto) en lugar de continua. Al no existir
          una magnitud numérica sobre la que calcular dispersión, la evaluación se basa en
          la <strong>concordancia</strong>: con qué frecuencia los tasadores coinciden
          consigo mismos, entre ellos y con un estándar conocido.
        </p>
        <p>Se evalúan hasta cuatro bloques:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Within Appraiser</strong> {"\u2014"} repetibilidad: cada tasador
            consigo mismo entre ensayos. Requiere dos o más ensayos.
          </li>
          <li>
            <strong>Each Appraiser vs Standard</strong> {"\u2014"} exactitud individual
            frente al valor verdadero.
          </li>
          <li>
            <strong>Between Appraisers</strong> {"\u2014"} reproducibilidad: los
            tasadores entre sí.
          </li>
          <li>
            <strong>All Appraisers vs Standard</strong> {"\u2014"} exactitud del sistema
            de medición completo.
          </li>
        </ul>
      </Section>

      <Section title="2. Assessment Agreement (porcentaje de coincidencia)">
        <p>
          Se trata de un recuento estricto. Una muestra se contabiliza como{" "}
          <em>matched</em> únicamente si <strong>todas</strong> las valoraciones
          implicadas son idénticas; una sola discrepancia invalida la coincidencia.
        </p>
        <FormulaPercent />
        <p>El criterio de coincidencia depende del bloque:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Within:</strong> los ensayos del tasador para esa muestra son todos
            iguales entre sí.
          </li>
          <li>
            <strong>vs Standard:</strong> todos los ensayos del tasador coinciden con el
            estándar.
          </li>
          <li>
            <strong>Between:</strong> las valoraciones de todos los tasadores coinciden
            entre sí, aunque sean todas erróneas.
          </li>
          <li>
            <strong>All vs Standard:</strong> todos los tasadores, en todos sus ensayos,
            coinciden con el estándar.
          </li>
        </ul>
        <Note>
          <strong>Coincidencia entre bloques.</strong> Es habitual que Between Appraisers
          y All Appraisers vs Standard arrojen el mismo porcentaje. No indica un error de
          cálculo: cuando los tasadores concuerdan entre sí, normalmente concuerdan
          también con el estándar. Una diferencia apreciable entre ambos valores señalaría
          un sesgo compartido por todo el equipo.
        </Note>
      </Section>

      <Section title="3. Intervalo de confianza">
        <p>
          Se emplea el intervalo <strong>exacto de Clopper-Pearson</strong>, basado en la
          distribución beta, en lugar de la aproximación normal, inválida con tamaños
          muestrales pequeños y proporciones próximas a 0 o 1.
        </p>
        <FormulaCP lower="Límite inferior" upper="Límite superior" />
        <p>
          donde <V>x</V> es el número de coincidencias, <V>n</V> el número de muestras y{" "}
          <V>B</V> la inversa de la beta incompleta regularizada.
        </p>
        <Note>
          <strong>Caso especial 0 % y 100 %.</strong> Cuando <V>x</V> = 0 o{" "}
          <V>x</V> = <V>n</V>, el software estadístico de referencia adopta un intervalo
          de <strong>una sola cola</strong>, criterio que esta implementación replica:
          <Formula>
            <div className="space-y-1">
              <div>
                Si <V>x</V> = <V>n</V>: límite inferior = {"\u03B1"}<sup>1/n</sup>,
                superior = 100 %
              </div>
              <div>
                Si <V>x</V> = 0: límite inferior = 0 %, superior = (1 {"\u2212"}{" "}
                {"\u03B1"}<sup>1/n</sup>) {"\u00D7"} 100
              </div>
            </div>
          </Formula>
          Con 15 coincidencias sobre 15, el límite inferior es 0,05<sup>1/15</sup> ={" "}
          <strong>81,90 %</strong>. Un Clopper-Pearson bilateral daría 78,20 %. Esta
          distinción es la causa más frecuente de discrepancias al comparar resultados
          entre aplicaciones.
        </Note>
      </Section>

      <Section title="4. Kappa de Fleiss">
        <p>
          El porcentaje de coincidencia presenta una limitación: parte del acuerdo se
          produce <strong>por azar</strong>. Con dos categorías, dos valoraciones
          aleatorias coinciden el 50 % de las veces. El estadístico kappa corrige ese
          efecto.
        </p>
        <FormulaKappa />
        <p>
          donde P{"\u0304"} es el acuerdo observado y P<Sub>e</Sub> el acuerdo esperado
          por azar. La escala resultante se interpreta así:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>{"\u03BA"} = 1</strong> {"\u2014"} acuerdo perfecto.
          </li>
          <li>
            <strong>{"\u03BA"} = 0</strong> {"\u2014"} el acuerdo coincide exactamente con
            el esperado por azar.
          </li>
          <li>
            <strong>{"\u03BA"} &lt; 0</strong> {"\u2014"} acuerdo inferior al azar;
            infrecuente, suele revelar un problema sistemático.
          </li>
        </ul>
        <p className="mt-3">
          Siendo <V>N</V> el número de muestras, <V>n</V> las valoraciones por muestra y{" "}
          <V>x</V><Sub>ij</Sub> el número de veces que la muestra <V>i</V> recibió la
          categoría <V>j</V>:
        </p>
        <FormulaPbarPe note={`con p\u2C7C = proporción global de la categoría j`} />

        <h4 className="font-semibold mt-4">Kappa por categoría</h4>
        <p>
          Junto al kappa global se calcula uno por cada nivel de respuesta, contrastando
          esa categoría frente al resto:
        </p>
        <FormulaKappaCat />
        <p>
          Este desglose permite detectar que un tasador resulte fiable en los extremos de
          la escala pero confunda las categorías centrales, circunstancia que el kappa
          global promedia y oculta.
        </p>
      </Section>

      <Section title="5. Error estándar, Z y p-valor">
        <p>Para el kappa de cada categoría el error estándar se simplifica a:</p>
        <FormulaSECat />
        <p>
          La expresión <strong>no depende de la categoría</strong>, motivo por el cual
          todas las filas de una misma tabla comparten idéntico SE. Con 15 muestras y dos
          valoraciones por muestra (tasador y estándar) resulta 0,258199; con cinco
          tasadores, 0,0816497.
        </p>
        <p className="mt-3">Para el kappa global la expresión es más extensa:</p>
        <FormulaSEOverall />
        <p>
          El contraste es unilateral, frente a la hipótesis nula de acuerdo puramente
          aleatorio:
        </p>
        <FormulaZP />
        <p>
          Un p-valor reducido indica que el acuerdo observado supera significativamente al
          azar. Conviene subrayar que esto <strong>no equivale a aceptabilidad</strong>:
          un {"\u03BA"} = 0,41 puede resultar estadísticamente significativo y, aun así,
          insuficiente para uso industrial.
        </p>
      </Section>

      <Section title="6. All Appraisers vs Standard: particularidad del cálculo">
        <Note>
          Este bloque <strong>no se obtiene agrupando la totalidad de los datos</strong> en
          una única tabla de conteos, como cabría suponer. El resultado corresponde a la{" "}
          <strong>media de los kappas individuales</strong> de cada tasador frente al
          estándar:
          <FormulaAllVsStd k="k" />
          donde <V>k</V> es el número de tasadores. Con el conjunto de datos de referencia,
          el enfoque agrupado produce {"\u03BA"} = 0,831952, mientras que el promedio
          arroja <strong>{"\u03BA"} = 0,831455</strong>, valor que concuerda con el
          software estadístico de referencia. La diferencia es reducida pero sistemática.
        </Note>
      </Section>

      <Section title="7. Criterios de interpretación">
        <p>Referencia habitual en la industria (AIAG) para el estadístico kappa:</p>
        <KappaScale
          head={["Kappa", "Valoración"]}
          rows={[
            ["\u03BA \u2265 0,90", "Excelente"],
            ["0,70 \u2264 \u03BA < 0,90", "Aceptable; susceptible de mejora"],
            ["\u03BA < 0,70", "Inaceptable; el sistema de medición requiere revisión"],
          ]}
        />
        <p>
          Se recomienda valorar <strong>ambas métricas de forma conjunta</strong>. El
          porcentaje de coincidencia resulta fácil de comunicar pero optimista; el kappa es
          más riguroso aunque menos intuitivo. El kappa por categoría, por su parte,
          identifica <em>dónde</em> se localiza el problema: si un tasador falla
          exclusivamente en las categorías centrales, la acción correctiva consiste en
          precisar los criterios límite, no en repetir la formación completa.
        </p>
      </Section>

      <Section title="8. Requisitos de los datos y limitaciones">
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Diseño balanceado obligatorio:</strong> todas las combinaciones
            tasador {"\u00D7"} muestra deben presentar el mismo número de ensayos. Ante
            datos desbalanceados el estudio muestra un aviso en lugar de resultados, dado
            que las fórmulas del kappa asumen un <V>n</V> constante por sujeto.
          </li>
          <li>
            <strong>Ensayo único:</strong> si cada tasador valora cada muestra una sola
            vez, la repetibilidad no es evaluable. El bloque Within Appraiser se omite y
            se emite la nota correspondiente.
          </li>
          <li>
            <strong>Estándar opcional:</strong> sin columna de estándar solo se calculan
            Within Appraiser y Between Appraisers; la exactitud no puede determinarse.
          </li>
          <li>
            <strong>Categorías ausentes:</strong> si un nivel no aparece en un subconjunto
            de datos, su kappa queda indefinido y se representa mediante{" "}
            <span className="font-mono">*</span>.
          </li>
          <li>
            <strong>Efecto de la prevalencia:</strong> cuando una categoría domina la
            muestra, el kappa puede resultar bajo pese a un acuerdo elevado. Se trata de
            una limitación conocida del estadístico, no del cálculo. Es aconsejable
            diseñar el estudio con las categorías razonablemente equilibradas.
          </li>
        </ul>
      </Section>

      <Section title="9. Referencias">
        <ul className="list-disc pl-6 space-y-1 text-sm">
          <li>
            Fleiss, J. L. (1971). <em>Measuring nominal scale agreement among many
            raters.</em> Psychological Bulletin, 76(5), 378{"\u2013"}382.
          </li>
          <li>
            Fleiss, J. L., Levin, B., Paik, M. C. (2003).{" "}
            <em>Statistical Methods for Rates and Proportions</em>, 3.ª ed., cap. 18.
          </li>
          <li>
            AIAG (2010). <em>Measurement Systems Analysis (MSA)</em>, 4.ª ed., cap. III
            secc. B {"\u2014"} Attribute Measurement Systems.
          </li>
          <li>
            Clopper, C. J., Pearson, E. S. (1934). <em>The use of confidence or fiducial
            limits illustrated in the case of the binomial.</em> Biometrika, 26(4),
            404{"\u2013"}413.
          </li>
        </ul>
      </Section>
    </>
  );
}

/* ---------- contenido EN ---------- */

function ContentEN() {
  return (
    <>
      <Section title="1. Purpose of the study">
        <p>
          Attribute Agreement Analysis is the counterpart of Gage R&amp;R when the response
          is <strong>categorical</strong> (pass/fail, ordinal scales {"\u2212"}2
          {"\u2026"}+2, defect codes) rather than continuous. Since no numerical magnitude
          is available on which to compute dispersion, the evaluation relies on{" "}
          <strong>agreement</strong>: how often appraisers agree with themselves, with each
          other and with a known standard.
        </p>
        <p>Up to four blocks are evaluated:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Within Appraiser</strong> {"\u2014"} repeatability: each appraiser
            against themselves across trials. Requires two or more trials.
          </li>
          <li>
            <strong>Each Appraiser vs Standard</strong> {"\u2014"} individual accuracy
            against the true value.
          </li>
          <li>
            <strong>Between Appraisers</strong> {"\u2014"} reproducibility: appraisers
            against one another.
          </li>
          <li>
            <strong>All Appraisers vs Standard</strong> {"\u2014"} accuracy of the complete
            measurement system.
          </li>
        </ul>
      </Section>

      <Section title="2. Assessment Agreement (match percentage)">
        <p>
          This is a strict count. A sample is recorded as <em>matched</em> only if{" "}
          <strong>all</strong> the ratings involved are identical; a single discrepancy
          invalidates the match.
        </p>
        <FormulaPercent />
        <p>The matching criterion depends on the block:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Within:</strong> the appraiser&rsquo;s trials for that sample are all
            equal to each other.
          </li>
          <li>
            <strong>vs Standard:</strong> all of the appraiser&rsquo;s trials agree with
            the standard.
          </li>
          <li>
            <strong>Between:</strong> the ratings of all appraisers agree with one another,
            even if all of them are wrong.
          </li>
          <li>
            <strong>All vs Standard:</strong> all appraisers, across all their trials,
            agree with the standard.
          </li>
        </ul>
        <Note>
          <strong>Agreement between blocks.</strong> Between Appraisers and All Appraisers
          vs Standard frequently return the same percentage. This does not indicate a
          computation error: when appraisers agree with each other, they usually agree with
          the standard as well. A noticeable difference between the two values would point
          to a bias shared by the whole team.
        </Note>
      </Section>

      <Section title="3. Confidence interval">
        <p>
          The <strong>exact Clopper-Pearson interval</strong> is used, based on the beta
          distribution, rather than the normal approximation, which is invalid for small
          sample sizes and proportions close to 0 or 1.
        </p>
        <FormulaCP lower="Lower limit" upper="Upper limit" />
        <p>
          where <V>x</V> is the number of matches, <V>n</V> the number of samples and{" "}
          <V>B</V> the inverse of the regularised incomplete beta function.
        </p>
        <Note>
          <strong>Special case 0 % and 100 %.</strong> When <V>x</V> = 0 or{" "}
          <V>x</V> = <V>n</V>, reference statistical software switches to a{" "}
          <strong>one-sided</strong> interval, a criterion this implementation replicates:
          <Formula>
            <div className="space-y-1">
              <div>
                If <V>x</V> = <V>n</V>: lower limit = {"\u03B1"}<sup>1/n</sup>, upper limit
                = 100 %
              </div>
              <div>
                If <V>x</V> = 0: lower limit = 0 %, upper limit = (1 {"\u2212"}{" "}
                {"\u03B1"}<sup>1/n</sup>) {"\u00D7"} 100
              </div>
            </div>
          </Formula>
          With 15 matches out of 15, the lower limit is 0.05<sup>1/15</sup> ={" "}
          <strong>81.90 %</strong>. A two-sided Clopper-Pearson interval would return
          78.20 %. This distinction is the most common source of discrepancies when
          comparing results across applications.
        </Note>
      </Section>

      <Section title="4. Fleiss&rsquo; Kappa">
        <p>
          The match percentage has one limitation: part of the agreement occurs{" "}
          <strong>by chance</strong>. With two categories, two random ratings coincide 50 %
          of the time. The kappa statistic corrects for that effect.
        </p>
        <FormulaKappa />
        <p>
          where P{"\u0304"} is the observed agreement and P<Sub>e</Sub> the agreement
          expected by chance. The resulting scale is interpreted as follows:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>{"\u03BA"} = 1</strong> {"\u2014"} perfect agreement.
          </li>
          <li>
            <strong>{"\u03BA"} = 0</strong> {"\u2014"} agreement exactly matches what
            chance would produce.
          </li>
          <li>
            <strong>{"\u03BA"} &lt; 0</strong> {"\u2014"} agreement below chance;
            uncommon, and usually a sign of a systematic problem.
          </li>
        </ul>
        <p className="mt-3">
          With <V>N</V> samples, <V>n</V> ratings per sample and <V>x</V><Sub>ij</Sub> the
          number of times sample <V>i</V> received category <V>j</V>:
        </p>
        <FormulaPbarPe note={`where p\u2C7C = overall proportion of category j`} />

        <h4 className="font-semibold mt-4">Kappa per category</h4>
        <p>
          Alongside the overall kappa, one value is computed for each response level,
          contrasting that category against all others:
        </p>
        <FormulaKappaCat />
        <p>
          This breakdown reveals cases in which an appraiser is reliable at the ends of the
          scale but confuses the central categories, a pattern the overall kappa averages
          out and conceals.
        </p>
      </Section>

      <Section title="5. Standard error, Z and p-value">
        <p>For the kappa of each category the standard error simplifies to:</p>
        <FormulaSECat />
        <p>
          The expression <strong>does not depend on the category</strong>, which is why all
          rows of a given table share the same SE. With 15 samples and two ratings per
          sample (appraiser and standard) the result is 0.258199; with five appraisers,
          0.0816497.
        </p>
        <p className="mt-3">For the overall kappa the expression is longer:</p>
        <FormulaSEOverall />
        <p>
          The test is one-sided, against the null hypothesis of purely random agreement:
        </p>
        <FormulaZP />
        <p>
          A small p-value indicates that the observed agreement significantly exceeds
          chance. It should be stressed that this{" "}
          <strong>is not equivalent to acceptability</strong>: a {"\u03BA"} = 0.41 may be
          statistically significant and still be inadequate for industrial use.
        </p>
      </Section>

      <Section title="6. All Appraisers vs Standard: a specific computation">
        <Note>
          This block is <strong>not obtained by pooling all the data</strong> into a single
          count table, as might be assumed. The result corresponds to the{" "}
          <strong>mean of the individual kappas</strong> of each appraiser against the
          standard:
          <FormulaAllVsStd k="k" />
          where <V>k</V> is the number of appraisers. With the reference data set, the
          pooled approach yields {"\u03BA"} = 0.831952, whereas the average returns{" "}
          <strong>{"\u03BA"} = 0.831455</strong>, the value that matches reference
          statistical software. The difference is small but systematic.
        </Note>
      </Section>

      <Section title="7. Interpretation criteria">
        <p>Common industry reference (AIAG) for the kappa statistic:</p>
        <KappaScale
          head={["Kappa", "Assessment"]}
          rows={[
            ["\u03BA \u2265 0.90", "Excellent"],
            ["0.70 \u2264 \u03BA < 0.90", "Acceptable; improvement may be required"],
            ["\u03BA < 0.70", "Unacceptable; the measurement system requires review"],
          ]}
        />
        <p>
          Both metrics should be assessed <strong>together</strong>. The match percentage
          is easy to communicate but optimistic; kappa is more rigorous although less
          intuitive. Kappa per category, in turn, identifies <em>where</em> the problem
          lies: if an appraiser fails only on the central categories, the corrective action
          is to sharpen the boundary criteria, not to repeat the entire training.
        </p>
      </Section>

      <Section title="8. Data requirements and limitations">
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Balanced design required:</strong> every appraiser {"\u00D7"} sample
            combination must have the same number of trials. With unbalanced data the study
            displays a warning instead of results, since the kappa formulas assume a
            constant <V>n</V> per subject.
          </li>
          <li>
            <strong>Single trial:</strong> if each appraiser rates each sample only once,
            repeatability cannot be evaluated. The Within Appraiser block is omitted and
            the corresponding note is issued.
          </li>
          <li>
            <strong>Optional standard:</strong> without a standard column only Within
            Appraiser and Between Appraisers are computed; accuracy cannot be determined.
          </li>
          <li>
            <strong>Missing categories:</strong> if a level does not appear in a subset of
            the data, its kappa is undefined and is displayed as{" "}
            <span className="font-mono">*</span>.
          </li>
          <li>
            <strong>Prevalence effect:</strong> when one category dominates the sample,
            kappa may come out low despite high agreement. This is a known limitation of
            the statistic, not of the computation. Studies should be designed with
            reasonably balanced categories.
          </li>
        </ul>
      </Section>

      <Section title="9. References">
        <ul className="list-disc pl-6 space-y-1 text-sm">
          <li>
            Fleiss, J. L. (1971). <em>Measuring nominal scale agreement among many
            raters.</em> Psychological Bulletin, 76(5), 378{"\u2013"}382.
          </li>
          <li>
            Fleiss, J. L., Levin, B., Paik, M. C. (2003).{" "}
            <em>Statistical Methods for Rates and Proportions</em>, 3rd ed., ch. 18.
          </li>
          <li>
            AIAG (2010). <em>Measurement Systems Analysis (MSA)</em>, 4th ed., ch. III
            sec. B {"\u2014"} Attribute Measurement Systems.
          </li>
          <li>
            Clopper, C. J., Pearson, E. S. (1934). <em>The use of confidence or fiducial
            limits illustrated in the case of the binomial.</em> Biometrika, 26(4),
            404{"\u2013"}413.
          </li>
        </ul>
      </Section>
    </>
  );
}

/* ---------- pantalla teórica ---------- */

export default function Theory() {
  const [lang, setLang] = useState<Lang>("es");

  const subtitle =
    lang === "es"
      ? "Fundamento teórico, formulación y criterios de cálculo aplicados en este estudio."
      : "Theoretical background, formulation and computation criteria applied in this study.";

  const tab = (code: Lang, label: string) => (
    <button
      key={code}
      type="button"
      onClick={() => setLang(code)}
      className={`px-3 py-1 text-sm border ${
        lang === code
          ? "bg-[#00674d] text-white border-[#00674d]"
          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
      } ${code === "es" ? "rounded-l" : "rounded-r border-l-0"}`}
    >
      {label}
    </button>
  );

  return (
    <div className="max-w-4xl space-y-6 pb-8">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold">Attribute Agreement Analysis</h2>
          <p className="text-sm text-gray-600">{subtitle}</p>
        </div>
        <div className="shrink-0 flex">
          {tab("es", "ES")}
          {tab("en", "EN")}
        </div>
      </header>

      {lang === "es" ? <ContentES /> : <ContentEN />}
    </div>
  );
}
