// app/app/six-sigma/studies/descriptive/Theory.tsx
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

const Sub2 = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-1 mt-3">
    <h4 className="font-semibold text-sm">{title}</h4>
    <div className="space-y-2">{children}</div>
  </div>
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

const Sup = ({ children }: { children: React.ReactNode }) => (
  <sup className="text-[0.7em]">{children}</sup>
);

const Note = ({ children }: { children: React.ReactNode }) => (
  <div className="my-2 px-3 py-2 bg-amber-50 border-l-4 border-amber-400 text-sm">
    {children}
  </div>
);

const SmallTable = ({ head, rows }: { head: string[]; rows: React.ReactNode[][] }) => (
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
const XBAR = "\u0078\u0304";
const SIGMA = "\u03A3";
const MINUS = "\u2212";
const TIMES = "\u00D7";
const LE = "\u2264";
const GE = "\u2265";
const APPROX = "\u2248";

/* ---------- fórmulas compartidas ---------- */

const FormulaMean = () => (
  <Formula>
    {XBAR} = <Frac num={<>1</>} den={<><V>n</V></>} /> {SIGMA}
    <Sub>i=1</Sub>
    <Sup>n</Sup> <V>x</V>
    <Sub>i</Sub>
  </Formula>
);

const FormulaMedian = ({ odd, even }: { odd: string; even: string }) => (
  <Formula>
    <div className="space-y-1">
      <div>
        {odd}: <V>x</V>
        <Sub>({"("}<V>n</V>+1{")"}/2)</Sub>
      </div>
      <div>
        {even}:{" "}
        <Frac
          num={
            <>
              <V>x</V>
              <Sub>(n/2)</Sub> + <V>x</V>
              <Sub>(n/2+1)</Sub>
            </>
          }
          den={<>2</>}
        />
      </div>
    </div>
  </Formula>
);

const FormulaVariance = () => (
  <Formula>
    <div className="space-y-3">
      <div>
        <V>s</V>
        {"\u00B2"} ={" "}
        <Frac
          num={
            <>
              {SIGMA} (<V>x</V>
              <Sub>i</Sub> {MINUS} {XBAR}){"\u00B2"}
            </>
          }
          den={
            <>
              <V>n</V> {MINUS} 1
            </>
          }
        />
      </div>
      <div>
        <V>s</V> ={" "}
        <Sqrt>
          <V>s</V>
          {"\u00B2"}
        </Sqrt>
      </div>
    </div>
  </Formula>
);

const FormulaSEMean = () => (
  <Formula>
    SE({XBAR}) ={" "}
    <Frac
      num={<><V>s</V></>}
      den={<Sqrt><V>n</V></Sqrt>}
    />
  </Formula>
);

const FormulaCV = () => (
  <Formula>
    CV ={" "}
    <Frac num={<><V>s</V></>} den={<>{XBAR}</>} /> {TIMES} 100
  </Formula>
);

const FormulaQuartilePos = () => (
  <Formula>
    <div className="space-y-2">
      <div>
        <V>pos</V> = <V>p</V> {TIMES} (<V>n</V> + 1)
      </div>
      <div>
        <V>Q</V>
        <Sub>p</Sub> = <V>x</V>
        <Sub>(k)</Sub> + <V>f</V> {TIMES} (<V>x</V>
        <Sub>(k+1)</Sub> {MINUS} <V>x</V>
        <Sub>(k)</Sub>)
      </div>
    </div>
  </Formula>
);

const FormulaIQR = () => (
  <Formula>
    IQR = <V>Q</V>
    <Sub>3</Sub> {MINUS} <V>Q</V>
    <Sub>1</Sub>
  </Formula>
);

const FormulaSkew = () => (
  <Formula>
    <div className="space-y-2">
      <div>
        <V>g</V>
        <Sub>1</Sub> ={" "}
        <Frac
          num={
            <>
              1/<V>n</V> {SIGMA} (<V>x</V>
              <Sub>i</Sub> {MINUS} {XBAR}){"\u00B3"}
            </>
          }
          den={
            <>
              [1/<V>n</V> {SIGMA} (<V>x</V>
              <Sub>i</Sub> {MINUS} {XBAR}){"\u00B2"}]
              <Sup>3/2</Sup>
            </>
          }
        />
      </div>
      <div>
        <V>G</V>
        <Sub>1</Sub> ={" "}
        <Frac
          num={
            <Sqrt>
              <V>n</V>(<V>n</V> {MINUS} 1)
            </Sqrt>
          }
          den={
            <>
              <V>n</V> {MINUS} 2
            </>
          }
        />{" "}
        {TIMES} <V>g</V>
        <Sub>1</Sub>
      </div>
    </div>
  </Formula>
);

const FormulaKurt = () => (
  <Formula>
    <div className="space-y-2">
      <div>
        <V>g</V>
        <Sub>2</Sub> ={" "}
        <Frac
          num={
            <>
              1/<V>n</V> {SIGMA} (<V>x</V>
              <Sub>i</Sub> {MINUS} {XBAR})
              <Sup>4</Sup>
            </>
          }
          den={
            <>
              [1/<V>n</V> {SIGMA} (<V>x</V>
              <Sub>i</Sub> {MINUS} {XBAR}){"\u00B2"}]{"\u00B2"}
            </>
          }
        />{" "}
        {MINUS} 3
      </div>
      <div>
        <V>G</V>
        <Sub>2</Sub> ={" "}
        <Frac
          num={
            <>
              (<V>n</V> {MINUS} 1)
            </>
          }
          den={
            <>
              (<V>n</V> {MINUS} 2)(<V>n</V> {MINUS} 3)
            </>
          }
        />{" "}
        [ (<V>n</V> + 1) <V>g</V>
        <Sub>2</Sub> + 6 ]
      </div>
    </div>
  </Formula>
);

const FormulaCIMean = () => (
  <Formula>
    {XBAR} {"\u00B1"} <V>t</V>
    <Sub>{"\u03B1"}/2, <V>n</V>{MINUS}1</Sub> {TIMES}{" "}
    <Frac num={<><V>s</V></>} den={<Sqrt><V>n</V></Sqrt>} />
  </Formula>
);

const FormulaFences = () => (
  <Formula>
    <div className="space-y-1">
      <div>
        <V>L</V>
        <Sub>inf</Sub> = <V>Q</V>
        <Sub>1</Sub> {MINUS} 1,5 {TIMES} IQR
      </div>
      <div>
        <V>L</V>
        <Sub>sup</Sub> = <V>Q</V>
        <Sub>3</Sub> + 1,5 {TIMES} IQR
      </div>
    </div>
  </Formula>
);

const FormulaMSSD = () => (
  <Formula>
    MSSD ={" "}
    <Frac
      num={
        <>
          {SIGMA}
          <Sub>i=2</Sub>
          <Sup>n</Sup> (<V>x</V>
          <Sub>i</Sub> {MINUS} <V>x</V>
          <Sub>i{MINUS}1</Sub>){"\u00B2"}
        </>
      }
      den={
        <>
          2(<V>n</V> {MINUS} 1)
        </>
      }
    />
  </Formula>
);

const FormulaAD = () => (
  <Formula>
    <V>A</V>
    {"\u00B2"} = {MINUS}<V>n</V> {MINUS}{" "}
    <Frac num={<>1</>} den={<><V>n</V></>} /> {SIGMA}
    <Sub>i=1</Sub>
    <Sup>n</Sup> (2<V>i</V> {MINUS} 1) [ ln <V>F</V>(<V>x</V>
    <Sub>i</Sub>) + ln(1 {MINUS} <V>F</V>(<V>x</V>
    <Sub>n+1{MINUS}i</Sub>)) ]
  </Formula>
);

/* ---------- contenido ES ---------- */

function ContentES() {
  return (
    <>
      <Section title="1. Objeto del estudio">
        <p>
          La estadística descriptiva resume un conjunto de datos mediante un número
          reducido de magnitudes que caracterizan su{" "}
          <strong>posición</strong>, <strong>dispersión</strong> y{" "}
          <strong>forma</strong>. No formula inferencias sobre la población: describe
          exclusivamente la muestra disponible, con la excepción del error estándar y del
          intervalo de confianza, que sí poseen carácter inferencial.
        </p>
        <p>
          Constituye el paso previo obligado a cualquier análisis posterior. Los estudios de
          capacidad, los contrastes de hipótesis y las cartas de control asumen condiciones
          {" "}{"\u2014"} normalidad, homogeneidad, ausencia de valores anómalos{" "}{"\u2014"}{" "}
          que solo la descripción inicial permite verificar.
        </p>
        <Note>
          <strong>Tratamiento de valores ausentes.</strong> Las celdas vacías y los valores
          no numéricos se excluyen del cálculo. El estadístico <V>N</V> refleja el número de
          observaciones efectivamente empleadas, y <V>N*</V> el de valores descartados. Todo
          resultado debe interpretarse sobre <V>N</V>, no sobre el número total de filas de
          la hoja.
        </Note>
      </Section>

      <Section title="2. Medidas de posición central">
        <Sub2 title="Media aritmética">
          <FormulaMean />
          <p>
            Constituye el centro de gravedad de la distribución y el estimador más eficiente
            de la posición central cuando los datos son aproximadamente normales. Su
            limitación reside en la <strong>sensibilidad a valores extremos</strong>: una
            única observación alejada desplaza la media de forma apreciable.
          </p>
        </Sub2>

        <Sub2 title="Mediana">
          <FormulaMedian odd="n impar" even="n par" />
          <p>
            Valor que divide la muestra ordenada en dos mitades de igual frecuencia. Es un
            estadístico <strong>robusto</strong>: su valor no se altera aunque las
            observaciones extremas se desplacen arbitrariamente, siempre que no cambien de
            lado respecto al centro.
          </p>
        </Sub2>

        <Sub2 title="Moda">
          <p>
            Valor de mayor frecuencia. Resulta informativa en datos discretos o
            categorizados, y de escasa utilidad en variables continuas, donde las
            repeticiones exactas son infrecuentes o dependen de la resolución del
            instrumento. Ante varios valores con idéntica frecuencia máxima la distribución
            es multimodal.
          </p>
        </Sub2>

        <Note>
          <strong>Comparación entre media y mediana.</strong> La relación entre ambas
          constituye un indicador inmediato de asimetría. Si {XBAR} {APPROX} mediana, la
          distribución es aproximadamente simétrica; si {XBAR} &gt; mediana, presenta cola
          derecha; si {XBAR} &lt; mediana, cola izquierda. Una discrepancia acusada
          aconseja emplear la mediana como medida de posición y revisar la presencia de
          valores anómalos.
        </Note>

        <Sub2 title="Media recortada (trimmed mean)">
          <p>
            Media calculada tras eliminar un porcentaje fijo de observaciones en cada
            extremo de la muestra ordenada, habitualmente el 5 %. Ofrece un compromiso entre
            la eficiencia de la media y la robustez de la mediana. Una diferencia
            sustancial entre la media y la media recortada indica que los extremos ejercen
            una influencia determinante.
          </p>
        </Sub2>
      </Section>

      <Section title="3. Medidas de dispersión">
        <Sub2 title="Varianza y desviación típica">
          <FormulaVariance />
          <Note>
            <strong>Denominador <V>n</V> {MINUS} 1.</strong> Se emplea la varianza{" "}
            <strong>muestral</strong>, no la poblacional. La corrección de Bessel compensa
            que las desviaciones se calculan respecto a {XBAR}, estimada a partir de los
            propios datos, y no respecto a la media poblacional desconocida. Dividir entre{" "}
            <V>n</V> subestimaría sistemáticamente la variabilidad. La diferencia es
            irrelevante con muestras grandes y significativa por debajo de 30 observaciones.
          </Note>
          <p>
            La desviación típica se expresa en las mismas unidades que los datos, lo que la
            hace directamente interpretable; la varianza, en unidades al cuadrado, resulta
            preferible en los desarrollos algebraicos por su propiedad aditiva.
          </p>
        </Sub2>

        <Sub2 title="Rango">
          <p>
            Diferencia entre el máximo y el mínimo. De cálculo inmediato pero muy limitado:
            depende únicamente de dos observaciones y aumenta con el tamaño de la muestra,
            por lo que no permite comparar conjuntos de distinto tamaño.
          </p>
        </Sub2>

        <Sub2 title="Rango interquartílico (IQR)">
          <FormulaIQR />
          <p>
            Amplitud del 50 % central de los datos. Es la medida de dispersión robusta por
            excelencia y la base de la detección de valores anómalos.
          </p>
        </Sub2>

        <Sub2 title="Coeficiente de variación">
          <FormulaCV />
          <p>
            Dispersión relativa, expresada como porcentaje de la media. Permite comparar la
            variabilidad de magnitudes con unidades o escalas distintas.
          </p>
          <Note>
            Carece de sentido cuando la media se aproxima a cero o cuando la variable admite
            valores negativos, situaciones en las que el cociente se vuelve inestable o de
            signo arbitrario. Solo debe emplearse con variables de razón estrictamente
            positivas.
          </Note>
        </Sub2>

        <Sub2 title="Error estándar de la media">
          <FormulaSEMean />
          <p>
            Cuantifica la precisión con la que {XBAR} estima la media poblacional. Conviene
            distinguirlo de la desviación típica: <V>s</V> describe la dispersión de las{" "}
            <strong>observaciones</strong>; SE({XBAR}) describe la dispersión de la{" "}
            <strong>media muestral</strong> si el muestreo se repitiera. El SE disminuye
            al aumentar <V>n</V>, mientras que <V>s</V> tiende a estabilizarse en el valor
            poblacional.
          </p>
        </Sub2>

        <Sub2 title="MSSD">
          <FormulaMSSD />
          <p>
            Estimador de la desviación típica basado en las diferencias cuadráticas
            sucesivas. A diferencia de <V>s</V>, no se ve afectado por desplazamientos
            graduales de la media, por lo que resulta útil cuando se sospecha que el proceso
            deriva a lo largo del tiempo. Una discrepancia notable entre <V>s</V> y{" "}
            {Sqrt({ children: "MSSD" }) as unknown as React.ReactNode} sugiere falta de
            estabilidad temporal.
          </p>
        </Sub2>
      </Section>

      <Section title="4. Cuantiles y cuartiles">
        <p>
          El cuantil de orden <V>p</V> es el valor por debajo del cual se sitúa una
          proporción <V>p</V> de las observaciones. Su cálculo requiere{" "}
          <strong>interpolación</strong>, dado que la posición resultante rara vez coincide
          con una observación concreta:
        </p>
        <FormulaQuartilePos />
        <p>
          donde <V>k</V> es la parte entera de <V>pos</V> y <V>f</V> su parte fraccionaria.
          Los cuartiles corresponden a <V>p</V> = 0,25, 0,50 y 0,75.
        </p>
        <Note>
          <strong>Existen múltiples definiciones de cuantil.</strong> La literatura recoge
          al menos nueve métodos, que difieren en la fórmula de posición y en el criterio de
          interpolación. Este estudio emplea la posición (<V>n</V> + 1)<V>p</V> con
          interpolación lineal. Las hojas de cálculo habituales utilizan la posición
          1 + (<V>n</V> {MINUS} 1)<V>p</V>, que produce valores ligeramente distintos. Las
          discrepancias se atenúan al aumentar <V>n</V> y pueden ser apreciables en muestras
          reducidas. Ninguno de los métodos es incorrecto: se trata de convenciones
          diferentes.
        </Note>
      </Section>

      <Section title="5. Medidas de forma">
        <Sub2 title="Asimetría (skewness)">
          <FormulaSkew />
          <p>
            Cuantifica el grado de falta de simetría. El valor <V>g</V><Sub>1</Sub>{" "}
            corresponde al momento muestral y <V>G</V><Sub>1</Sub> a la versión corregida
            para estimación poblacional, que es la presentada en el informe.
          </p>
          <SmallTable
            head={["Asimetría", "Interpretación"]}
            rows={[
              [<>{APPROX} 0</>, "Distribución simétrica"],
              ["> 0", "Cola derecha; predominio de valores altos aislados"],
              ["< 0", "Cola izquierda; predominio de valores bajos aislados"],
            ]}
          />
          <p>
            Como referencia práctica, valores comprendidos entre {MINUS}0,5 y +0,5 indican
            simetría aproximada; por encima de 1 en valor absoluto la asimetría es acusada y
            desaconseja los métodos que presuponen normalidad.
          </p>
        </Sub2>

        <Sub2 title="Curtosis">
          <FormulaKurt />
          <p>
            Se presenta la <strong>curtosis de exceso</strong>, referida a la distribución
            normal: el término {MINUS}3 fija en cero el valor correspondiente a la normal.
          </p>
          <SmallTable
            head={["Curtosis", "Interpretación"]}
            rows={[
              [<>{APPROX} 0</>, "Comportamiento similar al de la distribución normal"],
              ["> 0 (leptocúrtica)", "Colas más pesadas; mayor frecuencia de valores extremos"],
              ["< 0 (platicúrtica)", "Colas más ligeras; distribución más aplanada"],
            ]}
          />
          <Note>
            La curtosis se interpreta con frecuencia como {"\u201C"}apuntamiento{"\u201D"}{" "}
            de la distribución. Esa lectura es imprecisa: la magnitud responde
            fundamentalmente al <strong>peso de las colas</strong>, no a la altura del
            máximo central. Una curtosis elevada advierte de la presencia de valores
            extremos, circunstancia relevante en los estudios de capacidad, donde las colas
            determinan la fracción fuera de especificación.
          </Note>
        </Sub2>
      </Section>

      <Section title="6. Intervalo de confianza de la media">
        <FormulaCIMean />
        <p>
          Rango de valores compatible con los datos para la media poblacional, al nivel de
          confianza especificado. Se emplea la distribución <V>t</V> de Student con{" "}
          <V>n</V> {MINUS} 1 grados de libertad, y no la normal, dado que <V>s</V> es una
          estimación de la desviación típica poblacional y no su valor exacto. La diferencia
          entre ambas distribuciones es sustancial con muestras reducidas y despreciable por
          encima de 30 observaciones.
        </p>
        <Note>
          <strong>Interpretación correcta.</strong> Un intervalo al 95 % no significa que
          exista una probabilidad de 0,95 de que la media poblacional se encuentre en él: la
          media poblacional es una constante, no una variable aleatoria. Significa que, si
          el procedimiento se repitiera sobre muestras sucesivas, el 95 % de los intervalos
          construidos contendría el valor verdadero.
        </Note>
      </Section>

      <Section title="7. Detección de valores anómalos">
        <p>
          Se aplica el criterio de Tukey, basado en el rango interquartílico:
        </p>
        <FormulaFences />
        <p>
          Las observaciones situadas fuera de estos límites se señalan como potencialmente
          anómalas. Los bigotes del diagrama de caja se extienden hasta el dato más extremo{" "}
          <strong>contenido</strong> en el rango, no hasta el límite calculado.
        </p>
        <p>
          El factor 1,5 es convencional: con datos normales delimita aproximadamente el
          99,3 % de la distribución, de modo que alrededor del 0,7 % de las observaciones
          legítimas quedará marcado. Algunas referencias distinguen además los valores
          extremos mediante un factor de 3.
        </p>
        <Note>
          <strong>Un valor señalado no es necesariamente erróneo.</strong> El criterio
          identifica observaciones inusuales respecto al resto, sin pronunciarse sobre su
          validez. Puede tratarse de un error de medición o de transcripción, pero también
          de un dato correcto procedente de una condición de proceso poco frecuente{" "}
          {"\u2014"} en cuyo caso constituye la información más valiosa del conjunto. La
          eliminación de datos exige justificación técnica documentada, nunca su condición
          de atípicos.
        </Note>
      </Section>

      <Section title="8. Contraste de normalidad (Anderson-Darling)">
        <FormulaAD />
        <p>
          donde <V>F</V> es la función de distribución normal acumulada evaluada con la
          media y la desviación típica de la muestra, y los datos se emplean ordenados de
          menor a mayor. El estadístico se ajusta posteriormente por el tamaño de la
          muestra.
        </p>
        <p>
          La hipótesis nula establece que los datos proceden de una distribución normal. Un
          p-valor inferior al nivel de significación conduce a rechazarla.
        </p>
        <Note>
          <strong>Dos precauciones.</strong> El contraste otorga mayor peso a las{" "}
          <strong>colas</strong> que otras alternativas, lo que resulta ventajoso en control
          de procesos, donde las colas gobiernan la fracción defectuosa. Por otra parte, su
          potencia crece con <V>n</V>: con muestras muy grandes desviaciones
          irrelevantes en la práctica producen p-valores significativos, mientras que con
          muestras reducidas la ausencia de rechazo no acredita normalidad. El resultado
          debe valorarse junto con el histograma y el gráfico de probabilidad, no de forma
          aislada.
        </Note>
      </Section>

      <Section title="9. Criterios de lectura del informe">
        <p>Secuencia recomendada de interpretación:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Verificar <V>N</V> y <V>N*</V></strong> antes de cualquier otra
            lectura. Un número elevado de valores descartados puede invalidar el análisis.
          </li>
          <li>
            <strong>Comparar media y mediana</strong> para detectar asimetría, y contrastar
            con el valor de la asimetría.
          </li>
          <li>
            <strong>Evaluar la dispersión</strong> mediante <V>s</V> y el CV, situándola en
            el contexto de la tolerancia o del requisito aplicable.
          </li>
          <li>
            <strong>Examinar los valores anómalos</strong> y determinar su origen antes de
            proseguir.
          </li>
          <li>
            <strong>Valorar la forma</strong> {"\u2014"} asimetría, curtosis y contraste de
            normalidad {"\u2014"} para decidir si procede aplicar métodos paramétricos.
          </li>
        </ul>
      </Section>

      <Section title="10. Limitaciones">
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Los estadísticos resumen ocultan estructura.</strong> Conjuntos de datos
            radicalmente distintos pueden compartir media, desviación típica y correlación.
            Ningún resumen numérico sustituye la representación gráfica.
          </li>
          <li>
            <strong>Ausencia de orden temporal.</strong> El estudio trata los datos como una
            muestra sin secuencia. Tendencias, ciclos y cambios de nivel resultan invisibles
            en estas magnitudes y requieren un gráfico de series temporales o una carta de
            control.
          </li>
          <li>
            <strong>Datos multimodales.</strong> Ante dos o más poblaciones mezcladas, la
            media se sitúa en una zona de baja frecuencia y carece de representatividad. El
            histograma es imprescindible para detectar esta condición.
          </li>
          <li>
            <strong>Tamaño de muestra reducido.</strong> Con menos de 15 observaciones, la
            asimetría y la curtosis presentan una variabilidad tan elevada que su
            interpretación resulta poco fiable.
          </li>
          <li>
            <strong>Escala de medida.</strong> Las magnitudes descritas presuponen variables
            cuantitativas. Su aplicación a códigos numéricos que representan categorías
            carece de sentido, aunque el cálculo sea posible.
          </li>
        </ul>
      </Section>

      <Section title="11. Referencias">
        <ul className="list-disc pl-6 space-y-1 text-sm">
          <li>
            Tukey, J. W. (1977). <em>Exploratory Data Analysis</em>. Addison-Wesley.
          </li>
          <li>
            Hyndman, R. J., Fan, Y. (1996). <em>Sample quantiles in statistical
            packages.</em> The American Statistician, 50(4), 361{"\u2013"}365.
          </li>
          <li>
            Joanes, D. N., Gill, C. A. (1998). <em>Comparing measures of sample skewness and
            kurtosis.</em> Journal of the Royal Statistical Society D, 47(1), 183{"\u2013"}189.
          </li>
          <li>
            Stephens, M. A. (1974). <em>EDF statistics for goodness of fit and some
            comparisons.</em> Journal of the American Statistical Association, 69(347),
            730{"\u2013"}737.
          </li>
          <li>
            Montgomery, D. C., Runger, G. C. (2018).{" "}
            <em>Applied Statistics and Probability for Engineers</em>, 7.ª ed., cap. 6.
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
          Descriptive statistics summarise a data set through a small number of quantities
          that characterise its <strong>location</strong>, <strong>dispersion</strong> and{" "}
          <strong>shape</strong>. No inference about the population is made: the description
          applies to the available sample only, with the exception of the standard error and
          the confidence interval, which are inferential in nature.
        </p>
        <p>
          This is the mandatory first step before any further analysis. Capability studies,
          hypothesis tests and control charts all assume conditions {"\u2014"} normality,
          homogeneity, absence of outliers {"\u2014"} that only the initial description
          allows to verify.
        </p>
        <Note>
          <strong>Handling of missing values.</strong> Empty cells and non-numeric values
          are excluded from the computation. The statistic <V>N</V> reflects the number of
          observations actually used, and <V>N*</V> the number of discarded values. All
          results must be interpreted against <V>N</V>, not against the total row count of
          the sheet.
        </Note>
      </Section>

      <Section title="2. Measures of central location">
        <Sub2 title="Arithmetic mean">
          <FormulaMean />
          <p>
            This is the centre of gravity of the distribution and the most efficient
            estimator of central location when the data are approximately normal. Its
            limitation lies in its <strong>sensitivity to extreme values</strong>: a single
            distant observation shifts the mean appreciably.
          </p>
        </Sub2>

        <Sub2 title="Median">
          <FormulaMedian odd="n odd" even="n even" />
          <p>
            The value dividing the ordered sample into two halves of equal frequency. It is
            a <strong>robust</strong> statistic: its value does not change even if the
            extreme observations move arbitrarily, provided they do not cross the centre.
          </p>
        </Sub2>

        <Sub2 title="Mode">
          <p>
            The most frequent value. It is informative for discrete or binned data and of
            limited use for continuous variables, where exact repetitions are rare or depend
            on instrument resolution. When several values share the maximum frequency, the
            distribution is multimodal.
          </p>
        </Sub2>

        <Note>
          <strong>Comparing mean and median.</strong> The relationship between the two is an
          immediate indicator of skewness. If {XBAR} {APPROX} median, the distribution is
          approximately symmetric; if {XBAR} &gt; median, it has a right tail; if{" "}
          {XBAR} &lt; median, a left tail. A marked discrepancy suggests using the median as
          the location measure and reviewing the presence of outliers.
        </Note>

        <Sub2 title="Trimmed mean">
          <p>
            The mean computed after removing a fixed percentage of observations from each
            end of the ordered sample, typically 5 %. It offers a compromise between the
            efficiency of the mean and the robustness of the median. A substantial difference
            between the mean and the trimmed mean indicates that the extremes exert a
            decisive influence.
          </p>
        </Sub2>
      </Section>

      <Section title="3. Measures of dispersion">
        <Sub2 title="Variance and standard deviation">
          <FormulaVariance />
          <Note>
            <strong>Denominator <V>n</V> {MINUS} 1.</strong> The{" "}
            <strong>sample</strong> variance is used, not the population variance.
            Bessel&rsquo;s correction compensates for the fact that deviations are computed
            about {XBAR}, itself estimated from the data, rather than about the unknown
            population mean. Dividing by <V>n</V> would systematically underestimate
            variability. The difference is negligible for large samples and significant
            below 30 observations.
          </Note>
          <p>
            The standard deviation is expressed in the same units as the data, which makes
            it directly interpretable; the variance, in squared units, is preferable in
            algebraic work because of its additive property.
          </p>
        </Sub2>

        <Sub2 title="Range">
          <p>
            The difference between maximum and minimum. Immediate to compute but severely
            limited: it depends on two observations only and grows with sample size, so it
            cannot be used to compare sets of different size.
          </p>
        </Sub2>

        <Sub2 title="Interquartile range (IQR)">
          <FormulaIQR />
          <p>
            The width of the central 50 % of the data. It is the robust dispersion measure
            par excellence and the basis for outlier detection.
          </p>
        </Sub2>

        <Sub2 title="Coefficient of variation">
          <FormulaCV />
          <p>
            Relative dispersion, expressed as a percentage of the mean. It allows the
            variability of quantities with different units or scales to be compared.
          </p>
          <Note>
            It is meaningless when the mean approaches zero or when the variable admits
            negative values, situations in which the ratio becomes unstable or arbitrarily
            signed. It should only be used with strictly positive ratio-scale variables.
          </Note>
        </Sub2>

        <Sub2 title="Standard error of the mean">
          <FormulaSEMean />
          <p>
            This quantifies the precision with which {XBAR} estimates the population mean.
            It must be distinguished from the standard deviation: <V>s</V> describes the
            dispersion of the <strong>observations</strong>; SE({XBAR}) describes the
            dispersion of the <strong>sample mean</strong> were the sampling to be repeated.
            SE decreases as <V>n</V> grows, whereas <V>s</V> tends to settle at the
            population value.
          </p>
        </Sub2>

        <Sub2 title="MSSD">
          <FormulaMSSD />
          <p>
            An estimator of the standard deviation based on successive squared differences.
            Unlike <V>s</V>, it is unaffected by gradual shifts in the mean, which makes it
            useful when the process is suspected of drifting over time. A notable
            discrepancy between <V>s</V> and the square root of MSSD suggests a lack of
            temporal stability.
          </p>
        </Sub2>
      </Section>

      <Section title="4. Quantiles and quartiles">
        <p>
          The quantile of order <V>p</V> is the value below which a proportion <V>p</V> of
          the observations lies. Its computation requires{" "}
          <strong>interpolation</strong>, since the resulting position rarely coincides with
          an actual observation:
        </p>
        <FormulaQuartilePos />
        <p>
          where <V>k</V> is the integer part of <V>pos</V> and <V>f</V> its fractional part.
          The quartiles correspond to <V>p</V> = 0.25, 0.50 and 0.75.
        </p>
        <Note>
          <strong>Multiple quantile definitions exist.</strong> The literature records at
          least nine methods, differing in the position formula and the interpolation
          criterion. This study uses the position (<V>n</V> + 1)<V>p</V> with linear
          interpolation. Common spreadsheet applications use the position
          1 + (<V>n</V> {MINUS} 1)<V>p</V>, which yields slightly different values.
          Discrepancies diminish as <V>n</V> grows and may be appreciable in small samples.
          None of the methods is incorrect: they are different conventions.
        </Note>
      </Section>

      <Section title="5. Measures of shape">
        <Sub2 title="Skewness">
          <FormulaSkew />
          <p>
            This quantifies the degree of asymmetry. The value <V>g</V><Sub>1</Sub>{" "}
            corresponds to the sample moment and <V>G</V><Sub>1</Sub> to the version
            corrected for population estimation, which is the one reported.
          </p>
          <SmallTable
            head={["Skewness", "Interpretation"]}
            rows={[
              [<>{APPROX} 0</>, "Symmetric distribution"],
              ["> 0", "Right tail; isolated high values predominate"],
              ["< 0", "Left tail; isolated low values predominate"],
            ]}
          />
          <p>
            As a practical reference, values between {MINUS}0.5 and +0.5 indicate
            approximate symmetry; above 1 in absolute value the skewness is marked and
            argues against methods that presuppose normality.
          </p>
        </Sub2>

        <Sub2 title="Kurtosis">
          <FormulaKurt />
          <p>
            <strong>Excess kurtosis</strong> is reported, referenced to the normal
            distribution: the {MINUS}3 term sets the normal value at zero.
          </p>
          <SmallTable
            head={["Kurtosis", "Interpretation"]}
            rows={[
              [<>{APPROX} 0</>, "Behaviour similar to the normal distribution"],
              ["> 0 (leptokurtic)", "Heavier tails; extreme values more frequent"],
              ["< 0 (platykurtic)", "Lighter tails; flatter distribution"],
            ]}
          />
          <Note>
            Kurtosis is frequently interpreted as the {"\u201C"}peakedness{"\u201D"} of the
            distribution. That reading is imprecise: the quantity responds primarily to{" "}
            <strong>tail weight</strong>, not to the height of the central maximum. High
            kurtosis warns of the presence of extreme values, a relevant circumstance in
            capability studies, where the tails determine the out-of-specification fraction.
          </Note>
        </Sub2>
      </Section>

      <Section title="6. Confidence interval for the mean">
        <FormulaCIMean />
        <p>
          The range of values for the population mean that is compatible with the data at
          the specified confidence level. Student&rsquo;s <V>t</V> distribution with{" "}
          <V>n</V> {MINUS} 1 degrees of freedom is used, rather than the normal, because{" "}
          <V>s</V> is an estimate of the population standard deviation and not its exact
          value. The difference between the two distributions is substantial for small
          samples and negligible above 30 observations.
        </p>
        <Note>
          <strong>Correct interpretation.</strong> A 95 % interval does not mean there is a
          0.95 probability that the population mean lies within it: the population mean is a
          constant, not a random variable. It means that, were the procedure repeated over
          successive samples, 95 % of the intervals constructed would contain the true
          value.
        </Note>
      </Section>

      <Section title="7. Outlier detection">
        <p>Tukey&rsquo;s criterion, based on the interquartile range, is applied:</p>
        <FormulaFences />
        <p>
          Observations falling outside these fences are flagged as potential outliers. The
          whiskers of the box plot extend to the most extreme value{" "}
          <strong>contained</strong> within the range, not to the computed fence.
        </p>
        <p>
          The factor 1.5 is conventional: with normal data it delimits approximately 99.3 %
          of the distribution, so around 0.7 % of legitimate observations will be flagged.
          Some references additionally distinguish extreme values using a factor of 3.
        </p>
        <Note>
          <strong>A flagged value is not necessarily erroneous.</strong> The criterion
          identifies observations that are unusual relative to the rest, without ruling on
          their validity. It may be a measurement or transcription error, but equally a
          correct datum arising from an infrequent process condition {"\u2014"} in which
          case it is the most valuable information in the set. Removing data requires
          documented technical justification, never merely their outlying status.
        </Note>
      </Section>

      <Section title="8. Normality test (Anderson-Darling)">
        <FormulaAD />
        <p>
          where <V>F</V> is the cumulative normal distribution function evaluated with the
          sample mean and standard deviation, and the data are used in ascending order. The
          statistic is subsequently adjusted for sample size.
        </p>
        <p>
          The null hypothesis states that the data come from a normal distribution. A
          p-value below the significance level leads to its rejection.
        </p>
        <Note>
          <strong>Two cautions.</strong> The test gives greater weight to the{" "}
          <strong>tails</strong> than other alternatives, which is advantageous in process
          control, where the tails govern the defective fraction. On the other hand, its
          power grows with <V>n</V>: with very large samples, practically irrelevant
          departures produce significant p-values, whereas with small samples the absence of
          rejection does not establish normality. The result must be assessed together with
          the histogram and the probability plot, not in isolation.
        </Note>
      </Section>

      <Section title="9. Reading the report">
        <p>Recommended interpretation sequence:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Check <V>N</V> and <V>N*</V></strong> before anything else. A high
            number of discarded values may invalidate the analysis.
          </li>
          <li>
            <strong>Compare mean and median</strong> to detect skewness, and cross-check
            against the skewness value.
          </li>
          <li>
            <strong>Assess dispersion</strong> through <V>s</V> and the CV, placing it in
            the context of the applicable tolerance or requirement.
          </li>
          <li>
            <strong>Examine the outliers</strong> and establish their origin before
            proceeding.
          </li>
          <li>
            <strong>Evaluate shape</strong> {"\u2014"} skewness, kurtosis and the normality
            test {"\u2014"} to decide whether parametric methods are appropriate.
          </li>
        </ul>
      </Section>

      <Section title="10. Limitations">
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Summary statistics conceal structure.</strong> Radically different data
            sets can share the same mean, standard deviation and correlation. No numerical
            summary replaces graphical representation.
          </li>
          <li>
            <strong>No temporal order.</strong> The study treats the data as a sample
            without sequence. Trends, cycles and level shifts are invisible in these
            quantities and require a time series plot or a control chart.
          </li>
          <li>
            <strong>Multimodal data.</strong> With two or more mixed populations, the mean
            falls in a low-frequency region and is not representative. The histogram is
            indispensable for detecting this condition.
          </li>
          <li>
            <strong>Small sample size.</strong> With fewer than 15 observations, skewness
            and kurtosis exhibit such high variability that their interpretation is
            unreliable.
          </li>
          <li>
            <strong>Measurement scale.</strong> The quantities described presuppose
            quantitative variables. Applying them to numeric codes representing categories
            is meaningless, even though the computation is possible.
          </li>
        </ul>
      </Section>

      <Section title="11. References">
        <ul className="list-disc pl-6 space-y-1 text-sm">
          <li>
            Tukey, J. W. (1977). <em>Exploratory Data Analysis</em>. Addison-Wesley.
          </li>
          <li>
            Hyndman, R. J., Fan, Y. (1996). <em>Sample quantiles in statistical
            packages.</em> The American Statistician, 50(4), 361{"\u2013"}365.
          </li>
          <li>
            Joanes, D. N., Gill, C. A. (1998). <em>Comparing measures of sample skewness and
            kurtosis.</em> Journal of the Royal Statistical Society D, 47(1), 183{"\u2013"}189.
          </li>
          <li>
            Stephens, M. A. (1974). <em>EDF statistics for goodness of fit and some
            comparisons.</em> Journal of the American Statistical Association, 69(347),
            730{"\u2013"}737.
          </li>
          <li>
            Montgomery, D. C., Runger, G. C. (2018).{" "}
            <em>Applied Statistics and Probability for Engineers</em>, 7th ed., ch. 6.
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
          <h2 className="text-xl font-bold">Descriptive Statistics</h2>
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
