// app/app/six-sigma/studies/attragreement/Theory.tsx
"use client";
import React from "react";

/* ---------- helpers de presentación ---------- */

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

/** fracción apilada */
const Frac = ({ num, den }: { num: React.ReactNode; den: React.ReactNode }) => (
  <span className="inline-flex flex-col align-middle text-center mx-1">
    <span className="border-b border-gray-700 px-2 pb-0.5">{num}</span>
    <span className="px-2 pt-0.5">{den}</span>
  </span>
);

const Sqrt = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center align-middle">
    <span className="text-lg">√</span>
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

/* ---------- pantalla teórica ---------- */

export default function Theory() {
  return (
    <div className="max-w-4xl space-y-6 pb-8">
      <header className="space-y-1">
        <h2 className="text-xl font-bold">Attribute Agreement Analysis</h2>
        <p className="text-sm text-gray-600">
          Teoría, fórmulas y decisiones de cálculo implementadas en este estudio.
        </p>
      </header>

      <Section title="1. Qué mide este estudio">
        <p>
          El Attribute Agreement Analysis es el equivalente al Gage R&amp;R cuando la
          respuesta es <strong>categórica</strong> (pasa/no pasa, escalas ordinales
          −2…+2, códigos de defecto) en lugar de continua. No podemos calcular
          desviaciones típicas, así que medimos <strong>concordancia</strong>: con qué
          frecuencia los tasadores coinciden consigo mismos, entre ellos y con un
          estándar conocido.
        </p>
        <p>Se evalúan hasta cuatro bloques:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Within Appraiser</strong> — repetibilidad: cada tasador consigo
            mismo entre ensayos. Requiere 2 o más ensayos.
          </li>
          <li>
            <strong>Each Appraiser vs Standard</strong> — exactitud individual frente
            al valor verdadero.
          </li>
          <li>
            <strong>Between Appraisers</strong> — reproducibilidad: todos los tasadores
            entre sí.
          </li>
          <li>
            <strong>All Appraisers vs Standard</strong> — exactitud del sistema completo.
          </li>
        </ul>
      </Section>

      <Section title="2. Assessment Agreement (porcentaje de coincidencia)">
        <p>
          Es un recuento simple y estricto. Una muestra cuenta como{" "}
          <em>matched</em> solo si <strong>todas</strong> las valoraciones implicadas
          son idénticas; basta una discrepancia para que no cuente.
        </p>
        <Formula>
          Percent = <Frac num={<># Matched</>} den={<># Inspected</>} /> × 100
        </Formula>
        <p>El criterio de &ldquo;matched&rdquo; cambia según el bloque:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Within:</strong> los ensayos de ese tasador para esa muestra son
            todos iguales entre sí.
          </li>
          <li>
            <strong>vs Standard:</strong> todos los ensayos de ese tasador coinciden con
            el estándar.
          </li>
          <li>
            <strong>Between:</strong> las valoraciones de todos los tasadores coinciden
            entre sí (aunque sean todas erróneas).
          </li>
          <li>
            <strong>All vs Standard:</strong> todos los tasadores, en todos sus ensayos,
            coinciden con el estándar.
          </li>
        </ul>
        <Note>
          <strong>Por qué Between y All vs Standard suelen dar lo mismo:</strong> en el
          conjunto de ejemplo ambos dan 6/15 = 40,00 %. No es un error: cuando los
          tasadores coinciden entre sí, casi siempre coinciden también con el estándar.
          Si difirieran, indicaría un sesgo compartido por todo el equipo.
        </Note>
      </Section>

      <Section title="3. Intervalo de confianza — decisión importante">
        <p>
          Usamos el intervalo <strong>exacto de Clopper-Pearson</strong>, basado en la
          distribución beta, no la aproximación normal (que sería inválida con muestras
          pequeñas y proporciones cercanas a 0 o 1).
        </p>
        <Formula>
          <div className="space-y-1">
            <div>
              Límite inferior = <V>B</V>
              <Sub>α/2</Sub>(<V>x</V>, <V>n</V> − <V>x</V> + 1)
            </div>
            <div>
              Límite superior = <V>B</V>
              <Sub>1−α/2</Sub>(<V>x</V> + 1, <V>n</V> − <V>x</V>)
            </div>
          </div>
        </Formula>
        <p>
          donde <V>x</V> = número de coincidencias, <V>n</V> = número de muestras y{" "}
          <V>B</V> es la inversa de la beta incompleta regularizada.
        </p>
        <Note>
          <strong>Caso especial 0 % y 100 %.</strong> Cuando <V>x</V> = 0 o{" "}
          <V>x</V> = <V>n</V>, Minitab cambia a un intervalo{" "}
          <strong>de una sola cola</strong>, y nosotros replicamos ese comportamiento:
          <Formula>
            <div className="space-y-1">
              <div>
                Si <V>x</V> = <V>n</V>: límite inferior = α<sup>1/n</sup>, superior = 100 %
              </div>
              <div>
                Si <V>x</V> = 0: inferior = 0 %, superior = (1 − α<sup>1/n</sup>) × 100
              </div>
            </div>
          </Formula>
          Con 15 de 15 aciertos: 0,05<sup>1/15</sup> = <strong>81,90 %</strong>. Si
          usáramos Clopper-Pearson de dos colas saldría 78,20 % y no coincidiría con
          Minitab. Este detalle es la causa más habitual de discrepancias al replicar
          este análisis.
        </Note>
      </Section>

      <Section title="4. Kappa de Fleiss">
        <p>
          El porcentaje de coincidencia tiene un defecto: parte del acuerdo ocurre{" "}
          <strong>por azar</strong>. Con solo dos categorías, dos personas contestando al
          azar coinciden el 50 % de las veces. El kappa corrige eso.
        </p>
        <Formula>
          κ = <Frac num={<>P̄ − P<Sub>e</Sub></>} den={<>1 − P<Sub>e</Sub></>} />
        </Formula>
        <p>
          <V>P̄</V> es el acuerdo observado y <V>P</V>
          <Sub>e</Sub> el acuerdo esperado por azar. La escala resultante:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>κ = 1</strong> — acuerdo perfecto.
          </li>
          <li>
            <strong>κ = 0</strong> — el acuerdo es exactamente el esperado por azar.
          </li>
          <li>
            <strong>κ &lt; 0</strong> — acuerdo peor que el azar (raro; suele indicar un
            problema sistemático).
          </li>
        </ul>
        <p className="mt-3">
          Con <V>N</V> muestras, <V>n</V> valoraciones por muestra y{" "}
          <V>x</V>
          <Sub>ij</Sub> = número de veces que la muestra <V>i</V> recibió la categoría{" "}
          <V>j</V>:
        </p>
        <Formula>
          <div className="space-y-3">
            <div>
              P̄ = <Frac
                num={<>Σ<Sub>i</Sub> (Σ<Sub>j</Sub> <V>x</V><Sub>ij</Sub>² − <V>n</V>)</>}
                den={<><V>N</V> <V>n</V>(<V>n</V> − 1)</>}
              />
            </div>
            <div>
              P<Sub>e</Sub> = Σ<Sub>j</Sub> <V>p</V><Sub>j</Sub>²
              <span className="ml-3 text-sm text-gray-600">
                con <V>p</V><Sub>j</Sub> = proporción global de la categoría <V>j</V>
              </span>
            </div>
          </div>
        </Formula>

        <h4 className="font-semibold mt-4">Kappa por categoría</h4>
        <p>
          Además del kappa global, se calcula uno por cada nivel de respuesta, tratando
          esa categoría frente a todas las demás:
        </p>
        <Formula>
          κ<Sub>j</Sub> = 1 −{" "}
          <Frac
            num={<>Σ<Sub>i</Sub> <V>x</V><Sub>ij</Sub>(<V>n</V> − <V>x</V><Sub>ij</Sub>)</>}
            den={<><V>N</V> <V>n</V>(<V>n</V> − 1) <V>p</V><Sub>j</Sub>(1 − <V>p</V><Sub>j</Sub>)</>}
          />
        </Formula>
        <p>
          Esto permite detectar que un tasador es fiable en los extremos pero confunde
          las categorías centrales, algo que el kappa global promedia y oculta.
        </p>
      </Section>

      <Section title="5. Error estándar, Z y p-valor">
        <p>Para el kappa de cada categoría el error estándar se simplifica a:</p>
        <Formula>
          SE(κ<Sub>j</Sub>) ={" "}
          <Sqrt>
            <Frac num={<>2</>} den={<><V>N</V> <V>n</V>(<V>n</V> − 1)</>} />
          </Sqrt>
        </Formula>
        <p>
          Nótese que <strong>no depende de la categoría</strong>: por eso todas las filas
          de una misma tabla comparten el mismo SE. Con 15 muestras y 2 valoraciones
          (tasador + estándar) sale 0,258199; con 5 tasadores, 0,0816497.
        </p>
        <p className="mt-3">Para el kappa global la expresión es más larga:</p>
        <Formula>
          SE(κ) ={" "}
          <Frac
            num={
              <>
                <Sqrt>
                  2 [ (Σ<Sub>j</Sub> <V>p</V><Sub>j</Sub>(1−<V>p</V><Sub>j</Sub>))² − Σ
                  <Sub>j</Sub> <V>p</V><Sub>j</Sub>(1−<V>p</V><Sub>j</Sub>)(1−2<V>p</V>
                  <Sub>j</Sub>) ]
                </Sqrt>
              </>
            }
            den={
              <>
                (1 − P<Sub>e</Sub>) <Sqrt><V>N</V> <V>n</V>(<V>n</V> − 1)</Sqrt>
              </>
            }
          />
        </Formula>
        <p>El contraste es unilateral, contra la hipótesis nula de acuerdo puramente aleatorio:</p>
        <Formula>
          <div className="space-y-1">
            <div>
              <V>Z</V> = <Frac num={<>κ</>} den={<>SE(κ)</>} />
            </div>
            <div>
              <V>p</V> = P(<V>Z</V> &gt; <V>z</V>) = 1 − Φ(<V>z</V>)
            </div>
          </div>
        </Formula>
        <p>
          Un p-valor pequeño significa que el acuerdo observado es significativamente{" "}
          <strong>mayor que el azar</strong>. Ojo: eso no equivale a que el sistema sea
          aceptable — un κ = 0,41 puede ser estadísticamente significativo y aun así
          insuficiente en la práctica.
        </p>
      </Section>

      <Section title="6. All Appraisers vs Standard — el cálculo no obvio">
        <Note>
          Este bloque <strong>no se calcula agrupando todos los datos</strong> en una
          única tabla de conteos, como podría parecer natural. Minitab lo obtiene como la{" "}
          <strong>media de los kappas individuales</strong> de cada tasador frente al
          estándar:
          <Formula>
            <div className="space-y-2">
              <div>
                κ<Sub>all</Sub> = <Frac num={<>1</>} den={<><V>k</V></>} /> Σ
                <Sub>i</Sub> κ<Sub>i</Sub>
              </div>
              <div>
                SE(κ<Sub>all</Sub>) ={" "}
                <Frac
                  num={<><Sqrt>Σ<Sub>i</Sub> SE(κ<Sub>i</Sub>)²</Sqrt></>}
                  den={<><V>k</V></>}
                />
              </div>
            </div>
          </Formula>
          donde <V>k</V> es el número de tasadores. Con los datos de ejemplo, agrupar
          daría κ = 0,831952, mientras que promediar da{" "}
          <strong>κ = 0,831455</strong>, que es el valor correcto. La diferencia es
          pequeña pero sistemática.
        </Note>
      </Section>

      <Section title="7. Interpretación práctica">
        <p>Criterio habitual en la industria (AIAG) para el kappa:</p>
        <div className="overflow-x-auto">
          <table className="border-collapse text-sm my-2">
            <thead>
              <tr>
                <th className="border border-gray-300 px-3 py-1 bg-gray-100 text-left">
                  Kappa
                </th>
                <th className="border border-gray-300 px-3 py-1 bg-gray-100 text-left">
                  Valoración
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-3 py-1">κ ≥ 0,90</td>
                <td className="border border-gray-300 px-3 py-1">Excelente</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-3 py-1">0,70 ≤ κ &lt; 0,90</td>
                <td className="border border-gray-300 px-3 py-1">
                  Aceptable; puede requerir mejora
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-3 py-1">κ &lt; 0,70</td>
                <td className="border border-gray-300 px-3 py-1">
                  Inaceptable; el sistema de medición necesita revisión
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Conviene mirar <strong>siempre las dos métricas juntas</strong>. El porcentaje
          de coincidencia es fácil de comunicar pero optimista; el kappa es más honesto
          pero menos intuitivo. Y el kappa por categoría es el que señala{" "}
          <em>dónde</em> está el problema: si un tasador falla solo en las categorías
          centrales, la solución es afinar los criterios límite, no repetir la formación
          entera.
        </p>
      </Section>

      <Section title="8. Requisitos de los datos y limitaciones">
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Diseño balanceado obligatorio:</strong> todas las combinaciones
            tasador × muestra deben tener el mismo número de ensayos. Con datos
            desbalanceados el estudio muestra un aviso en lugar de resultados, porque las
            fórmulas de kappa asumen un <V>n</V> constante por sujeto.
          </li>
          <li>
            <strong>Un solo ensayo:</strong> si cada tasador valora cada muestra una única
            vez, no se puede evaluar la repetibilidad. El bloque Within Appraiser se omite
            y aparece la nota correspondiente.
          </li>
          <li>
            <strong>Estándar opcional:</strong> sin columna de estándar solo se calculan
            Within Appraiser y Between Appraisers; no hay forma de evaluar la exactitud.
          </li>
          <li>
            <strong>Categorías ausentes:</strong> si un nivel no aparece en un subconjunto
            de datos, su kappa es indefinido y se muestra como{" "}
            <span className="font-mono">*</span>.
          </li>
          <li>
            <strong>Kappa y prevalencia:</strong> cuando una categoría domina la muestra,
            el kappa puede salir bajo aunque el acuerdo sea alto. Es una limitación
            conocida del estadístico, no del cálculo. Conviene diseñar el estudio con las
            categorías razonablemente equilibradas.
          </li>
        </ul>
      </Section>

      <Section title="9. Referencias">
        <ul className="list-disc pl-6 space-y-1 text-sm">
          <li>
            Fleiss, J. L. (1971). <em>Measuring nominal scale agreement among many
            raters.</em> Psychological Bulletin, 76(5), 378–382.
          </li>
          <li>
            Fleiss, J. L., Levin, B., Paik, M. C. (2003).{" "}
            <em>Statistical Methods for Rates and Proportions</em>, 3ª ed., cap. 18.
          </li>
          <li>
            AIAG (2010). <em>Measurement Systems Analysis (MSA)</em>, 4ª ed., cap. III
            secc. B — Attribute Measurement Systems.
          </li>
          <li>
            Clopper, C. J., Pearson, E. S. (1934).{" "}
            <em>The use of confidence or fiducial limits illustrated in the case of the
            binomial.</em> Biometrika, 26(4), 404–413.
          </li>
        </ul>
      </Section>
    </div>
  );
}
