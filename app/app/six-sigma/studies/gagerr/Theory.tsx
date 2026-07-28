// app/app/six-sigma/studies/gagerr/Theory.tsx
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

const SmallTable = ({
  head,
  rows,
}: {
  head: string[];
  rows: React.ReactNode[][];
}) => (
  <div className="overflow-x-auto">
    <table className="border-collapse text-sm my-2">
      <thead>
        <tr>
          {head.map((h) => (
            <th
              key={h}
              className="border border-gray-300 px-3 py-1 bg-gray-100 text-left font-semibold"
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            {r.map((c, j) => (
              <td key={j} className="border border-gray-300 px-3 py-1">
                {c}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/* ---------- símbolos ---------- */

const S2 = ({ children }: { children: React.ReactNode }) => (
  <>
    {"\u03C3"}
    <Sub>{children}</Sub>
    {"\u00B2"}
  </>
);

const SD = ({ children }: { children: React.ReactNode }) => (
  <>
    {"\u03C3"}
    <Sub>{children}</Sub>
  </>
);

/* ---------- fórmulas compartidas ---------- */

const FormulaModel = () => (
  <Formula>
    <V>y</V>
    <Sub>ijk</Sub> = {"\u03BC"} + <V>P</V>
    <Sub>i</Sub> + <V>O</V>
    <Sub>j</Sub> + (<V>PO</V>)<Sub>ij</Sub> + {"\u03B5"}
    <Sub>ijk</Sub>
  </Formula>
);

const FormulaMS = () => (
  <Formula>
    MS = <Frac num={<>SS</>} den={<>df</>} />
    <span className="mx-4">
      <V>F</V> = <Frac num={<>MS<Sub>efecto</Sub></>} den={<>MS<Sub>denom</Sub></>} />
    </span>
  </Formula>
);

const FormulaVCWith = () => (
  <Formula>
    <div className="space-y-3">
      <div>
        <S2>repet</S2> = MS<Sub>error</Sub>
      </div>
      <div>
        <S2>PO</S2> ={" "}
        <Frac
          num={<>MS<Sub>PO</Sub> {"\u2212"} MS<Sub>error</Sub></>}
          den={<><V>n</V></>}
        />
      </div>
      <div>
        <S2>oper</S2> ={" "}
        <Frac
          num={<>MS<Sub>oper</Sub> {"\u2212"} MS<Sub>PO</Sub></>}
          den={<><V>p</V> {"\u00B7"} <V>n</V></>}
        />
      </div>
      <div>
        <S2>pieza</S2> ={" "}
        <Frac
          num={<>MS<Sub>pieza</Sub> {"\u2212"} MS<Sub>PO</Sub></>}
          den={<><V>o</V> {"\u00B7"} <V>n</V></>}
        />
      </div>
    </div>
  </Formula>
);

const FormulaVCWithout = () => (
  <Formula>
    <div className="space-y-3">
      <div>
        <S2>repet</S2> = MS<Sub>error</Sub>
        <span className="ml-3 text-sm text-gray-600">(error combinado)</span>
      </div>
      <div>
        <S2>oper</S2> ={" "}
        <Frac
          num={<>MS<Sub>oper</Sub> {"\u2212"} MS<Sub>error</Sub></>}
          den={<><V>p</V> {"\u00B7"} <V>n</V></>}
        />
      </div>
      <div>
        <S2>pieza</S2> ={" "}
        <Frac
          num={<>MS<Sub>pieza</Sub> {"\u2212"} MS<Sub>error</Sub></>}
          den={<><V>o</V> {"\u00B7"} <V>n</V></>}
        />
      </div>
    </div>
  </Formula>
);

const FormulaAggregate = () => (
  <Formula>
    <div className="space-y-2">
      <div>
        <S2>repro</S2> = <S2>oper</S2> + <S2>PO</S2>
      </div>
      <div>
        <S2>GRR</S2> = <S2>repet</S2> + <S2>repro</S2>
      </div>
      <div>
        <S2>total</S2> = <S2>GRR</S2> + <S2>pieza</S2>
      </div>
    </div>
  </Formula>
);

const FormulaMetrics = ({
  contrib,
  studyVar,
  pctStudy,
}: {
  contrib: string;
  studyVar: string;
  pctStudy: string;
}) => (
  <Formula>
    <div className="space-y-3">
      <div>
        {contrib} = <Frac num={<><S2>i</S2></>} den={<><S2>total</S2></>} /> {"\u00D7"} 100
      </div>
      <div>
        {studyVar} = 6 {"\u00B7"} <SD>i</SD>
      </div>
      <div>
        {pctStudy} = <Frac num={<><SD>i</SD></>} den={<><SD>total</SD></>} /> {"\u00D7"} 100
      </div>
    </div>
  </Formula>
);

const FormulaTolerance = ({ label }: { label: string }) => (
  <Formula>
    {label} = <Frac num={<>6 {"\u00B7"} <SD>i</SD></>} den={<>Tol</>} /> {"\u00D7"} 100
  </Formula>
);

const FormulaNdc = () => (
  <Formula>
    ndc = trunc
    <span className="text-lg">(</span>
    1,41 {"\u00B7"} <Frac num={<><SD>pieza</SD></>} den={<><SD>GRR</SD></>} />
    <span className="text-lg">)</span>
  </Formula>
);

/* ---------- contenido ES ---------- */

function ContentES() {
  return (
    <>
      <Section title="1. Objeto del estudio">
        <p>
          El estudio Gage R&amp;R (<em>Repeatability and Reproducibility</em>) cuantifica
          qué proporción de la variabilidad observada en un proceso procede del{" "}
          <strong>sistema de medición</strong> y no de las piezas medidas. Se aplica a
          respuestas <strong>continuas</strong>; cuando la respuesta es categórica
          corresponde emplear el Attribute Agreement Analysis.
        </p>
        <p>La variabilidad total se descompone en dos fuentes fundamentales:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Repetibilidad</strong> {"\u2014"} variación del propio instrumento:
            un mismo operario midiendo repetidamente la misma pieza. Se denomina también
            variación del equipo (EV).
          </li>
          <li>
            <strong>Reproducibilidad</strong> {"\u2014"} variación atribuible al operario:
            diferencias entre personas midiendo las mismas piezas. Incluye, cuando procede,
            el término de interacción operario {"\u00D7"} pieza.
          </li>
        </ul>
        <p>
          La suma de ambas constituye el <strong>Gage R&amp;R total</strong>, que se
          contrasta contra la variación entre piezas y, opcionalmente, contra la tolerancia
          de especificación.
        </p>
      </Section>

      <Section title="2. Diseño de datos y modelo">
        <p>
          Se asume un <strong>diseño cruzado</strong> (<em>crossed</em>): todos los
          operarios miden todas las piezas. Siendo <V>p</V> el número de piezas,{" "}
          <V>o</V> el de operarios y <V>n</V> el de réplicas por combinación, el modelo de
          efectos aleatorios es:
        </p>
        <FormulaModel />
        <p>
          donde {"\u03BC"} es la media global, <V>P</V><Sub>i</Sub> el efecto de la pieza,{" "}
          <V>O</V><Sub>j</Sub> el del operario, (<V>PO</V>)<Sub>ij</Sub> la interacción y{" "}
          {"\u03B5"}<Sub>ijk</Sub> el error residual. Todos los efectos se tratan como{" "}
          <strong>aleatorios</strong>, dado que las piezas y los operarios constituyen
          muestras de poblaciones más amplias.
        </p>
        <Note>
          <strong>Requisitos.</strong> El diseño debe estar balanceado: todas las
          combinaciones pieza {"\u00D7"} operario con el mismo número de réplicas. Se
          requiere <V>n</V> {"\u2265"} 2 para estimar la repetibilidad y{" "}
          <V>o</V> {"\u2265"} 2 para la reproducibilidad. El término de interacción exige
          además <V>n</V> {"\u2265"} 2, pues con réplica única no existen grados de
          libertad residuales.
        </Note>
      </Section>

      <Section title="3. Tabla ANOVA">
        <p>
          El método aplicado es el <strong>ANOVA de dos factores</strong>, preferible al
          método clásico de rangos (X̄-R) porque estima la interacción y proporciona
          estimadores más eficientes de las componentes de varianza.
        </p>
        <SmallTable
          head={["Fuente", "Grados de libertad", "F contrastada frente a"]}
          rows={[
            ["Pieza", <><V>p</V> {"\u2212"} 1</>, "Interacción"],
            ["Operario", <><V>o</V> {"\u2212"} 1</>, "Interacción"],
            [
              <>Operario {"\u00D7"} Pieza</>,
              <>(<V>p</V> {"\u2212"} 1)(<V>o</V> {"\u2212"} 1)</>,
              "Error (repetibilidad)",
            ],
            [
              "Error (repetibilidad)",
              <><V>p</V> {"\u00B7"} <V>o</V> {"\u00B7"} (<V>n</V> {"\u2212"} 1)</>,
              "\u2014",
            ],
            ["Total", <><V>p</V> {"\u00B7"} <V>o</V> {"\u00B7"} <V>n</V> {"\u2212"} 1</>, "\u2014"],
          ]}
        />
        <FormulaMS />
        <p>
          Los p-valores se obtienen de la cola derecha de la distribución <V>F</V>{" "}
          mediante la función beta incompleta regularizada.
        </p>
        <Note>
          <strong>Denominadores del contraste.</strong> En un modelo de efectos aleatorios,
          pieza y operario se contrastan frente a la <strong>interacción</strong>, no
          frente al error. Emplear el error como denominador {"\u2014"} error habitual
          {"\u2014"} inflaría los valores de <V>F</V> y produciría p-valores
          artificialmente reducidos.
        </Note>
      </Section>

      <Section title="4. Eliminación de la interacción: la regla de \u03B1 = 0,25">
        <Note>
          Cuando el p-valor de la interacción operario {"\u00D7"} pieza resulta{" "}
          <strong>{"\u2265"} 0,25</strong>, el término se elimina del modelo y el análisis
          se recalcula con un ANOVA de dos factores <strong>sin interacción</strong>. En
          ese caso los grados de libertad y la suma de cuadrados de la interacción se
          combinan con los del error.
          <p className="mt-2">
            El umbral 0,25 es sensiblemente superior al 0,05 convencional, y esa elección
            es deliberada: se trata de una decisión de{" "}
            <strong>selección de modelo</strong>, no de un contraste de hipótesis. Retener
            una interacción inexistente consume grados de libertad y degrada la estimación
            de la repetibilidad; el umbral holgado reduce el riesgo de descartar una
            interacción real (error de tipo II), que resulta más perjudicial en este
            contexto. Es el criterio adoptado por AIAG y por el software estadístico de
            referencia.
          </p>
          <p className="mt-2">
            En consecuencia, este estudio puede presentar{" "}
            <strong>dos tablas ANOVA</strong>: la completa y la reducida. Las componentes
            de varianza se derivan siempre del <strong>modelo finalmente retenido</strong>.
          </p>
        </Note>
      </Section>

      <Section title="5. Componentes de varianza">
        <p>
          Las componentes se obtienen igualando las medias cuadráticas a sus valores
          esperados. <strong>Con</strong> término de interacción:
        </p>
        <FormulaVCWith />
        <p>
          <strong>Sin</strong> término de interacción, tras la combinación con el error:
        </p>
        <FormulaVCWithout />
        <p>Y la agregación de las fuentes:</p>
        <FormulaAggregate />
        <Note>
          <strong>Componentes negativas.</strong> Las expresiones anteriores son
          diferencias de medias cuadráticas y pueden arrojar valores negativos, carentes de
          sentido físico al tratarse de varianzas. Por convención se{" "}
          <strong>truncan a cero</strong>. Una componente negativa indica que el efecto
          correspondiente es indistinguible del ruido y suele reflejar un tamaño de muestra
          insuficiente. Al truncar, la suma de las componentes puede dejar de coincidir
          exactamente con la varianza total observada.
        </Note>
      </Section>

      <Section title="6. Métricas del informe">
        <p>
          A partir de las componentes se calculan las magnitudes que sustentan la decisión:
        </p>
        <FormulaMetrics
          contrib="%Contribution"
          studyVar="Study Var"
          pctStudy="%Study Var"
        />
        <p>
          El factor <strong>6</strong> corresponde a {"\u00B1"}3 desviaciones típicas, es
          decir el 99,73 % de una distribución normal. Determinadas referencias emplean
          5,15 (99 %), procedente de la 3.ª edición del manual AIAG; el valor 6 es el
          predeterminado en este estudio.
        </p>
        <Note>
          <strong>Distinción esencial entre ambos porcentajes.</strong>{" "}
          %Contribution opera sobre <strong>varianzas</strong> y por ello sus valores suman
          100. %Study Var opera sobre <strong>desviaciones típicas</strong> y, en
          consecuencia, <strong>no suma 100</strong>. No se trata de un defecto del
          cálculo: la raíz cuadrada no es una operación aditiva. %Study Var arroja
          sistemáticamente valores superiores, motivo por el cual los umbrales de
          aceptación difieren entre una y otra métrica.
        </Note>
        <p>
          Si se especifica una tolerancia, se incorpora el porcentaje respecto al rango de
          especificación:
        </p>
        <FormulaTolerance label="%Tolerance" />
        <p>
          Esta métrica responde a una pregunta distinta de las anteriores: no compara el
          error de medición con la variación del proceso, sino con la{" "}
          <strong>amplitud admisible</strong>. Un sistema puede resultar inadecuado frente
          a un proceso muy uniforme y, simultáneamente, aceptable frente a una tolerancia
          amplia.
        </p>
      </Section>

      <Section title="7. Número de categorías distintas (ndc)">
        <FormulaNdc />
        <p>
          Estima cuántos grupos diferenciables es capaz de discriminar el sistema de
          medición dentro del rango del proceso. El resultado se{" "}
          <strong>trunca a entero</strong>, dado que una fracción de categoría carece de
          interpretación.
        </p>
        <SmallTable
          head={["ndc", "Capacidad de discriminación"]}
          rows={[
            ["ndc \u2265 5", "Adecuada"],
            ["ndc = 2 a 4", "Limitada; solo permite clasificación gruesa"],
            ["ndc < 2", "Inaceptable; el sistema no distingue entre piezas"],
          ]}
        />
        <p>
          La constante 1,41 procede de {"\u221A"}2, resultante de la relación entre la
          variación de las piezas y la del sistema de medición al expresarse en unidades de
          6{"\u03C3"}.
        </p>
      </Section>

      <Section title="8. Criterios de aceptación">
        <p>Umbrales de referencia AIAG:</p>
        <SmallTable
          head={["%Study Var", "%Contribution", "Valoración"]}
          rows={[
            ["< 10 %", "< 1 %", "Aceptable"],
            ["10 % a 30 %", "1 % a 9 %", "Marginal; aceptable según criticidad y coste"],
            ["> 30 %", "> 9 %", "Inaceptable; requiere corrección"],
          ]}
        />
        <p>
          La franja intermedia es una decisión de ingeniería, no estadística: depende de la
          criticidad de la característica, del coste de mejora del sistema y de las
          consecuencias de una clasificación errónea.
        </p>
        <p className="mt-3">
          La interpretación del desglose orienta la acción correctiva:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Repetibilidad dominante</strong> {"\u2014"} el problema reside en el
            instrumento: resolución insuficiente, desgaste, fijación deficiente o
            condiciones ambientales.
          </li>
          <li>
            <strong>Reproducibilidad dominante</strong> {"\u2014"} el problema reside en el
            método: procedimientos ambiguos, formación heterogénea o técnica de medición no
            estandarizada. Suele ser más económico de corregir.
          </li>
          <li>
            <strong>Interacción significativa</strong> {"\u2014"} determinados operarios
            miden ciertas piezas de forma sistemáticamente distinta, lo que apunta a
            dificultades con geometrías o rangos concretos.
          </li>
        </ul>
      </Section>

      <Section title="9. Gráficos del informe">
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Components of Variation</strong> {"\u2014"} contrasta visualmente
            %Contribution y %Study Var por fuente. La variación entre piezas debe dominar.
          </li>
          <li>
            <strong>Gráfico R</strong> {"\u2014"} rangos por operario. Puntos fuera de
            control indican problemas de repetibilidad localizados.
          </li>
          <li>
            <strong>Gráfico X̄</strong> {"\u2014"} medias por operario. A diferencia del
            uso habitual, aquí <strong>interesa</strong> que los puntos queden fuera de
            los límites: evidencia que el sistema discrimina entre piezas.
          </li>
          <li>
            <strong>Medición por pieza</strong> {"\u2014"} dispersión dentro de cada pieza.
          </li>
          <li>
            <strong>Medición por operario</strong> {"\u2014"} sesgos entre personas.
          </li>
          <li>
            <strong>Interacción operario {"\u00D7"} pieza</strong> {"\u2014"} líneas no
            paralelas revelan interacción.
          </li>
        </ul>
      </Section>

      <Section title="10. Limitaciones">
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Diseño balanceado obligatorio:</strong> ante combinaciones incompletas
            o desiguales el estudio muestra un aviso, ya que las expresiones de las
            componentes de varianza asumen un número constante de réplicas.
          </li>
          <li>
            <strong>Selección de piezas:</strong> las piezas deben cubrir el rango real del
            proceso. Un conjunto artificialmente uniforme reduce{" "}
            <SD>pieza</SD> y degrada todos los porcentajes, aun con un instrumento
            correcto. Es el error de diseño más frecuente.
          </li>
          <li>
            <strong>Aleatorización:</strong> el orden de medición debe ser aleatorio y las
            valoraciones ciegas. En caso contrario, memoria y expectativa reducen
            artificialmente la variación aparente.
          </li>
          <li>
            <strong>Sesgo no evaluado:</strong> este estudio cuantifica{" "}
            <em>precisión</em>, no <em>exactitud</em>. Un instrumento descalibrado que mida
            de forma consistentemente desviada puede arrojar un Gage R&amp;R excelente. La
            exactitud requiere un estudio de linealidad y sesgo con patrones trazables.
          </li>
          <li>
            <strong>Supuestos del modelo:</strong> normalidad de los residuos y
            homocedasticidad. Desviaciones acusadas comprometen los p-valores, aunque las
            componentes de varianza resultan razonablemente robustas.
          </li>
          <li>
            <strong>Diseño cruzado:</strong> el método implementado exige que todos los
            operarios midan todas las piezas. Los ensayos destructivos requieren un diseño
            anidado (<em>nested</em>), no contemplado en este estudio.
          </li>
        </ul>
      </Section>

      <Section title="11. Referencias">
        <ul className="list-disc pl-6 space-y-1 text-sm">
          <li>
            AIAG (2010). <em>Measurement Systems Analysis (MSA)</em>, 4.ª ed., cap. III
            secc. B {"\u2014"} Variable Measurement Systems.
          </li>
          <li>
            Montgomery, D. C. (2013). <em>Design and Analysis of Experiments</em>, 8.ª ed.,
            cap. 13 {"\u2014"} Random Effects Models.
          </li>
          <li>
            Burdick, R. K., Borror, C. M., Montgomery, D. C. (2005).{" "}
            <em>Design and Analysis of Gauge R&amp;R Studies</em>. ASA-SIAM.
          </li>
          <li>
            Wheeler, D. J. (2006). <em>EMP III: Evaluating the Measurement Process</em>.
            SPC Press.
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
          The Gage R&amp;R (<em>Repeatability and Reproducibility</em>) study quantifies
          what proportion of the variability observed in a process originates in the{" "}
          <strong>measurement system</strong> rather than in the parts being measured. It
          applies to <strong>continuous</strong> responses; when the response is
          categorical, Attribute Agreement Analysis is the appropriate method.
        </p>
        <p>Total variability is decomposed into two fundamental sources:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Repeatability</strong> {"\u2014"} variation of the instrument itself:
            one operator measuring the same part repeatedly. Also referred to as equipment
            variation (EV).
          </li>
          <li>
            <strong>Reproducibility</strong> {"\u2014"} variation attributable to the
            operator: differences between people measuring the same parts. Where
            applicable, it includes the operator {"\u00D7"} part interaction term.
          </li>
        </ul>
        <p>
          The sum of both constitutes the <strong>total Gage R&amp;R</strong>, which is
          compared against part-to-part variation and, optionally, against the specification
          tolerance.
        </p>
      </Section>

      <Section title="2. Data design and model">
        <p>
          A <strong>crossed design</strong> is assumed: every operator measures every part.
          With <V>p</V> parts, <V>o</V> operators and <V>n</V> replicates per combination,
          the random-effects model is:
        </p>
        <FormulaModel />
        <p>
          where {"\u03BC"} is the overall mean, <V>P</V><Sub>i</Sub> the part effect,{" "}
          <V>O</V><Sub>j</Sub> the operator effect, (<V>PO</V>)<Sub>ij</Sub> the
          interaction and {"\u03B5"}<Sub>ijk</Sub> the residual error. All effects are
          treated as <strong>random</strong>, since parts and operators are samples drawn
          from broader populations.
        </p>
        <Note>
          <strong>Requirements.</strong> The design must be balanced: every part{" "}
          {"\u00D7"} operator combination with the same number of replicates. At least{" "}
          <V>n</V> {"\u2265"} 2 is required to estimate repeatability, and{" "}
          <V>o</V> {"\u2265"} 2 for reproducibility. The interaction term also requires{" "}
          <V>n</V> {"\u2265"} 2, since a single replicate leaves no residual degrees of
          freedom.
        </Note>
      </Section>

      <Section title="3. ANOVA table">
        <p>
          The method applied is <strong>two-way ANOVA</strong>, preferable to the classical
          range method (X̄-R) because it estimates the interaction and provides more
          efficient estimators of the variance components.
        </p>
        <SmallTable
          head={["Source", "Degrees of freedom", "F tested against"]}
          rows={[
            ["Part", <><V>p</V> {"\u2212"} 1</>, "Interaction"],
            ["Operator", <><V>o</V> {"\u2212"} 1</>, "Interaction"],
            [
              <>Operator {"\u00D7"} Part</>,
              <>(<V>p</V> {"\u2212"} 1)(<V>o</V> {"\u2212"} 1)</>,
              "Error (repeatability)",
            ],
            [
              "Error (repeatability)",
              <><V>p</V> {"\u00B7"} <V>o</V> {"\u00B7"} (<V>n</V> {"\u2212"} 1)</>,
              "\u2014",
            ],
            ["Total", <><V>p</V> {"\u00B7"} <V>o</V> {"\u00B7"} <V>n</V> {"\u2212"} 1</>, "\u2014"],
          ]}
        />
        <FormulaMS />
        <p>
          P-values are obtained from the upper tail of the <V>F</V> distribution by means of
          the regularised incomplete beta function.
        </p>
        <Note>
          <strong>Test denominators.</strong> In a random-effects model, part and operator
          are tested against the <strong>interaction</strong>, not against the error. Using
          the error as denominator {"\u2014"} a common mistake {"\u2014"} would inflate the{" "}
          <V>F</V> values and yield artificially small p-values.
        </Note>
      </Section>

      <Section title="4. Removing the interaction: the \u03B1 = 0.25 rule">
        <Note>
          When the p-value of the operator {"\u00D7"} part interaction is{" "}
          <strong>{"\u2265"} 0.25</strong>, the term is removed from the model and the
          analysis is recomputed using a two-way ANOVA <strong>without interaction</strong>.
          In that case the degrees of freedom and sum of squares of the interaction are
          pooled with those of the error.
        </Note>
        <p>
          The 0.25 threshold is markedly higher than the conventional 0.05, and the choice
          is deliberate: this is a <strong>model selection</strong> decision, not a
          hypothesis test. Retaining a non-existent interaction consumes degrees of freedom
          and degrades the repeatability estimate; the generous threshold reduces the risk
          of discarding a genuine interaction (type II error), which is more damaging in
          this context. It is the criterion adopted by AIAG and by reference statistical
          software.
        </p>
        <p>
          As a result, this study may present <strong>two ANOVA tables</strong>: the full
          model and the reduced one. Variance components are always derived from the{" "}
          <strong>model finally retained</strong>.
        </p>
      </Section>

      <Section title="5. Variance components">
        <p>
          Components are obtained by equating mean squares to their expected values.{" "}
          <strong>With</strong> the interaction term:
        </p>
        <FormulaVCWith />
        <p>
          <strong>Without</strong> the interaction term, after pooling with the error:
        </p>
        <FormulaVCWithout />
        <p>And the aggregation of sources:</p>
        <FormulaAggregate />
        <Note>
          <strong>Negative components.</strong> The expressions above are differences of
          mean squares and may return negative values, which are physically meaningless for
          variances. By convention they are <strong>truncated to zero</strong>. A negative
          component indicates that the corresponding effect is indistinguishable from noise
          and usually reflects an insufficient sample size. After truncation, the sum of the
          components may no longer match the observed total variance exactly.
        </Note>
      </Section>

      <Section title="6. Report metrics">
        <p>
          The quantities supporting the decision are computed from the components:
        </p>
        <FormulaMetrics
          contrib="%Contribution"
          studyVar="Study Var"
          pctStudy="%Study Var"
        />
        <p>
          The factor <strong>6</strong> corresponds to {"\u00B1"}3 standard deviations,
          that is 99.73 % of a normal distribution. Some references use 5.15 (99 %), taken
          from the 3rd edition of the AIAG manual; the value 6 is the default in this study.
        </p>
        <Note>
          <strong>Essential distinction between the two percentages.</strong>{" "}
          %Contribution operates on <strong>variances</strong> and therefore its values sum
          to 100. %Study Var operates on <strong>standard deviations</strong> and
          consequently <strong>does not sum to 100</strong>. This is not a computation
          defect: the square root is not an additive operation. %Study Var systematically
          returns higher values, which is why the acceptance thresholds differ between the
          two metrics.
        </Note>
        <p>
          If a tolerance is specified, the percentage relative to the specification range is
          included:
        </p>
        <FormulaTolerance label="%Tolerance" />
        <p>
          This metric answers a different question from the previous ones: it compares the
          measurement error not with process variation but with the{" "}
          <strong>permissible width</strong>. A system may be inadequate against a very
          uniform process and simultaneously acceptable against a wide tolerance.
        </p>
      </Section>

      <Section title="7. Number of distinct categories (ndc)">
        <FormulaNdc />
        <p>
          This estimates how many distinguishable groups the measurement system can resolve
          within the process range. The result is <strong>truncated to an integer</strong>,
          since a fraction of a category has no interpretation.
        </p>
        <SmallTable
          head={["ndc", "Discrimination capability"]}
          rows={[
            ["ndc \u2265 5", "Adequate"],
            ["ndc = 2 to 4", "Limited; supports only coarse classification"],
            ["ndc < 2", "Unacceptable; the system cannot distinguish between parts"],
          ]}
        />
        <p>
          The constant 1.41 derives from {"\u221A"}2, arising from the relationship between
          part variation and measurement system variation when both are expressed in units
          of 6{"\u03C3"}.
        </p>
      </Section>

      <Section title="8. Acceptance criteria">
        <p>AIAG reference thresholds:</p>
        <SmallTable
          head={["%Study Var", "%Contribution", "Assessment"]}
          rows={[
            ["< 10 %", "< 1 %", "Acceptable"],
            [
              "10 % to 30 %",
              "1 % to 9 %",
              "Marginal; acceptable depending on criticality and cost",
            ],
            ["> 30 %", "> 9 %", "Unacceptable; correction required"],
          ]}
        />
        <p>
          The intermediate band is an engineering decision, not a statistical one: it
          depends on the criticality of the characteristic, the cost of improving the system
          and the consequences of misclassification.
        </p>
        <p className="mt-3">
          Interpreting the breakdown guides the corrective action:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Repeatability dominant</strong> {"\u2014"} the problem lies in the
            instrument: insufficient resolution, wear, poor fixturing or environmental
            conditions.
          </li>
          <li>
            <strong>Reproducibility dominant</strong> {"\u2014"} the problem lies in the
            method: ambiguous procedures, uneven training or non-standardised measurement
            technique. Usually cheaper to correct.
          </li>
          <li>
            <strong>Significant interaction</strong> {"\u2014"} certain operators measure
            certain parts in a systematically different way, pointing to difficulties with
            specific geometries or ranges.
          </li>
        </ul>
      </Section>

      <Section title="9. Report charts">
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Components of Variation</strong> {"\u2014"} visually contrasts
            %Contribution and %Study Var by source. Part-to-part variation should dominate.
          </li>
          <li>
            <strong>R chart</strong> {"\u2014"} ranges by operator. Out-of-control points
            indicate localised repeatability problems.
          </li>
          <li>
            <strong>X̄ chart</strong> {"\u2014"} means by operator. Unlike its usual
            application, here points falling outside the limits are{" "}
            <strong>desirable</strong>: they evidence that the system discriminates between
            parts.
          </li>
          <li>
            <strong>Measurement by part</strong> {"\u2014"} dispersion within each part.
          </li>
          <li>
            <strong>Measurement by operator</strong> {"\u2014"} biases between people.
          </li>
          <li>
            <strong>Operator {"\u00D7"} part interaction</strong> {"\u2014"} non-parallel
            lines reveal interaction.
          </li>
        </ul>
      </Section>

      <Section title="10. Limitations">
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Balanced design required:</strong> with incomplete or unequal
            combinations the study displays a warning, since the variance component
            expressions assume a constant number of replicates.
          </li>
          <li>
            <strong>Part selection:</strong> parts must span the actual process range. An
            artificially uniform set reduces <SD>part</SD> and degrades every percentage,
            even with a sound instrument. This is the most frequent design error.
          </li>
          <li>
            <strong>Randomisation:</strong> measurement order must be randomised and
            ratings blind. Otherwise memory and expectation artificially reduce the apparent
            variation.
          </li>
          <li>
            <strong>Bias not evaluated:</strong> this study quantifies{" "}
            <em>precision</em>, not <em>accuracy</em>. An uncalibrated instrument measuring
            consistently off-target may return an excellent Gage R&amp;R. Accuracy requires
            a linearity and bias study with traceable standards.
          </li>
          <li>
            <strong>Model assumptions:</strong> normality of residuals and homoscedasticity.
            Marked departures compromise the p-values, although the variance components
            remain reasonably robust.
          </li>
          <li>
            <strong>Crossed design:</strong> the implemented method requires every operator
            to measure every part. Destructive testing calls for a nested design, which is
            not covered by this study.
          </li>
        </ul>
      </Section>

      <Section title="11. References">
        <ul className="list-disc pl-6 space-y-1 text-sm">
          <li>
            AIAG (2010). <em>Measurement Systems Analysis (MSA)</em>, 4th ed., ch. III
            sec. B {"\u2014"} Variable Measurement Systems.
          </li>
          <li>
            Montgomery, D. C. (2013). <em>Design and Analysis of Experiments</em>, 8th ed.,
            ch. 13 {"\u2014"} Random Effects Models.
          </li>
          <li>
            Burdick, R. K., Borror, C. M., Montgomery, D. C. (2005).{" "}
            <em>Design and Analysis of Gauge R&amp;R Studies</em>. ASA-SIAM.
          </li>
          <li>
            Wheeler, D. J. (2006). <em>EMP III: Evaluating the Measurement Process</em>.
            SPC Press.
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
          <h2 className="text-xl font-bold">Gage R&amp;R (Crossed) {"\u2014"} ANOVA</h2>
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
