// app/app/six-sigma/studies/doe/factorial/optimizer/Theory.tsx
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

const Frac = ({ num, den }: { num: React.ReactNode; den: React.ReactNode }) => (
  <span className="inline-flex flex-col align-middle text-center mx-1">
    <span className="border-b border-gray-700 px-2 pb-0.5">{num}</span>
    <span className="px-2 pt-0.5">{den}</span>
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
const Warn = ({ children }: { children: React.ReactNode }) => (
  <div className="my-2 px-3 py-2 bg-red-50 border-l-4 border-red-500 text-sm">
    {children}
  </div>
);

const ES = () => (
  <div className="space-y-5">
    <Section title="El problema">
      <p>
        El an&aacute;lisis factorial dice <em>qu&eacute;</em> factores importan.
        El optimizador responde a la pregunta siguiente:{" "}
        <strong>d&oacute;nde hay que ponerlos</strong>.
      </p>
      <p>
        Con una sola respuesta es casi trivial: se busca el m&aacute;ximo del
        modelo. La dificultad aparece con <strong>varias respuestas a la
        vez</strong>, que casi siempre tiran en direcciones opuestas. M&aacute;s
        rendimiento suele traer m&aacute;s coste; m&aacute;s dureza, menos
        tenacidad. Hay que negociar, y para negociar hace falta una moneda
        com&uacute;n.
      </p>
    </Section>

    <Section title="La deseabilidad: una moneda común">
      <p>
        No se pueden sumar megapascales con euros. La soluci&oacute;n de
        Derringer y Suich es traducir cada respuesta a una puntuaci&oacute;n{" "}
        <strong>sin unidades entre 0 y 1</strong>: cero es inaceptable, uno es
        plenamente satisfactorio.
      </p>
      <Formula>
        Maximizar: <V>d</V> ={" "}
        <Frac
          num={
            <>
              <V>y</V> {"\u2212"} inferior
            </>
          }
          den={<>objetivo {"\u2212"} inferior</>}
        />
        <sup>{"\u00a0"}peso</sup>
      </Formula>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>Maximizar</strong> {"\u2192"} <V>d</V> = 0 por debajo del
          l&iacute;mite inferior, 1 al llegar al objetivo.
        </li>
        <li>
          <strong>Minimizar</strong> {"\u2192"} al contrario: 1 hasta el
          objetivo, 0 al pasar del superior.
        </li>
        <li>
          <strong>Objetivo intermedio</strong> {"\u2192"} un pico en el objetivo
          que cae hacia ambos lados.
        </li>
      </ul>
      <Note>
        El <strong>l&iacute;mite</strong> es lo que consideras inaceptable; el{" "}
        <strong>objetivo</strong>, lo que te dar&iacute;a por satisfecho. Son
        decisiones de ingenier&iacute;a, no estad&iacute;sticas, y son la
        entrada m&aacute;s influyente de todo el c&aacute;lculo.
      </Note>
    </Section>

    <Section title="Peso e importancia: no son lo mismo">
      <p>
        Se confunden constantemente, y hacen cosas distintas.
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>El peso curva la funci&oacute;n</strong> de una respuesta. Con
          peso 1 es una recta. Con peso 10, la <V>d</V> se queda cerca de cero
          hasta casi tocar el objetivo: exiges acercarte mucho para dar algo por
          bueno. Con peso 0,1, casi cualquier valor por encima del l&iacute;mite
          ya te vale.
        </li>
        <li>
          <strong>La importancia pondera unas respuestas frente a
          otras.</strong> No cambia ninguna curva; cambia cu&aacute;nto pesa cada
          una en el reparto final.
        </li>
      </ul>
      <Note>
        Regla pr&aacute;ctica: deja ambos en <strong>1</strong> mientras no
        tengas un motivo concreto. Un peso de 10 puesto sin pensar puede hacer
        que el optimizador abandone una soluci&oacute;n razonable.
      </Note>
    </Section>

    <Section title="Por qué la media es geométrica">
      <Formula>
        <V>D</V> = ({" "}
        <V>d</V><Sub>1</Sub><sup>i1</sup> {"\u00b7"} <V>d</V><Sub>2</Sub>
        <sup>i2</sup> {"\u00b7"} {"\u2026"} ){" "}
        <sup>
          1/{"\u03A3"}<V>i</V>
        </sup>
      </Formula>
      <p>
        La elecci&oacute;n de la media geom&eacute;trica no es est&eacute;tica.
        Tiene una consecuencia decisiva:
      </p>
      <Warn>
        <strong>Un solo cero anula la deseabilidad compuesta.</strong> Si una
        respuesta cae en zona inaceptable, la soluci&oacute;n entera queda
        descartada, por bien que est&eacute;n las dem&aacute;s. Con una media
        aritm&eacute;tica, un cero se compensar&iacute;a con unos y el
        optimizador propondr&iacute;a algo inviable.
      </Warn>
      <p>
        Es exactamente el comportamiento que se quiere en ingenier&iacute;a: un
        producto que incumple una especificaci&oacute;n no se salva por cumplir
        las otras cinco.
      </p>
    </Section>

    <Section title="Dónde está el óptimo">
      <p>
        Con factores codificados en {"\u2212"}1 y +1, el modelo es{" "}
        <strong>multilineal</strong>: fijados todos menos uno, la respuesta es
        una recta en ese. Y una recta alcanza su extremo{" "}
        <em>siempre en un extremo del intervalo</em>.
      </p>
      <Note>
        De ahi un hecho &uacute;til: con <strong>una sola respuesta</strong>, el
        &oacute;ptimo est&aacute; siempre en un <strong>v&eacute;rtice</strong>{" "}
        del cubo de dise&ntilde;o, es decir, en una de las combinaciones de
        niveles que ya has ensayado. No hace falta buscar: basta enumerar los 2
        <sup>k</sup> v&eacute;rtices y quedarse con el mejor. Es exacto, sin
        aproximaciones ni riesgo de caer en un &oacute;ptimo local.
      </Note>
      <p>
        Con <strong>varias respuestas</strong> la deseabilidad compuesta ya no es
        mon&oacute;tona, y el compromiso puede caer{" "}
        <em>dentro</em> de una arista: un valor intermedio que no has ensayado
        pero que el modelo sabe predecir. Por eso, con m&aacute;s de una
        respuesta, se refina la b&uacute;squeda tras enumerar los v&eacute;rtices.
      </p>
    </Section>

    <Section title="Los dos intervalos">
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>Intervalo de confianza (CI).</strong> D&oacute;nde est&aacute;
          la <em>media</em> de la respuesta en esas condiciones. Se estrecha si
          a&ntilde;ades corridas.
        </li>
        <li>
          <strong>Intervalo de predicci&oacute;n (PI).</strong> D&oacute;nde
          caer&aacute; <em>una sola corrida futura</em>. Siempre m&aacute;s
          ancho, y no se estrecha por debajo del ruido del proceso.
        </li>
      </ul>
      <Formula>
        SE<Sub>ajuste</Sub> = <V>s</V> {"\u221A"}<V>q</V>
        {"\u00a0\u00a0\u00a0\u00a0"}
        SE<Sub>predicci&oacute;n</Sub> = <V>s</V> {"\u221A"}(1 + <V>q</V>)
      </Formula>
      <Note>
        El <strong>1 adicional</strong> es toda la diferencia: representa la
        variabilidad propia de una observaci&oacute;n nueva. Para prometer a
        producci&oacute;n lo que dar&aacute; <em>la pr&oacute;xima pieza</em>, el
        n&uacute;mero honesto es el PI, no el CI.
      </Note>
    </Section>

    <Section title="Cautelas">
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>Poda el modelo antes.</strong> Optimizar sobre t&eacute;rminos
          no significativos mueve la soluci&oacute;n siguiendo ruido. Si el
          estudio avisa de t&eacute;rminos d&eacute;biles, vuelve a{" "}
          <em>Analyze Factorial Design</em>.
        </li>
        <li>
          <strong>Nunca extrapoles.</strong> Fuera del rango ensayado el modelo
          no sabe nada, y una recta ajustada entre dos puntos se dispara
          alegremente m&aacute;s all&aacute;.
        </li>
        <li>
          <strong>D = 1 no significa perfecci&oacute;n</strong>, solo que has
          alcanzado el objetivo <em>que t&uacute; fijaste</em>. Si sale 1 con
          holgura, prueba a subir el objetivo: puede que el proceso d&eacute;
          m&aacute;s.
        </li>
        <li>
          <strong>Confirma con corridas reales.</strong> El &oacute;ptimo es una
          predicci&oacute;n, no un hecho. Unas pocas corridas en las condiciones
          propuestas cierran el ciclo.
        </li>
        <li>
          <strong>El &oacute;ptimo matem&aacute;tico no es la
          soluci&oacute;n.</strong> Coste, seguridad, desgaste y capacidad no
          entran en el c&aacute;lculo, y a menudo deciden.
        </li>
      </ul>
    </Section>

    <Section title="Ejemplo resuelto">
      <p>
        Rendimiento frente a Temp, Conc y Supplier. Tras podar, el modelo
        conserva <strong>Temp, Supplier y Temp*Supplier</strong>: la
        concentraci&oacute;n no influye. Objetivo: maximizar, l&iacute;mite
        inferior 50, objetivo 75.
      </p>
      <p>
        Con dos factores el cubo tiene cuatro v&eacute;rtices, y basta
        evaluarlos:
      </p>
      <table className="text-xs border-collapse">
        <thead>
          <tr className="border-b border-gray-300">
            <th className="py-1 pr-4 text-left font-medium text-gray-600">Temp</th>
            <th className="py-1 pr-4 text-left font-medium text-gray-600">
              Supplier
            </th>
            <th className="py-1 pr-4 text-left font-medium text-gray-600">
              Ajuste
            </th>
            <th className="py-1 text-left font-medium text-gray-600">d</th>
          </tr>
        </thead>
        <tbody>
          {[
            ["25", "A", "54,425", "0,177"],
            ["25", "B", "44,375", "0,000"],
            ["45", "A", "67,825", "0,713"],
            ["45", "B", "77,875", "1,000"],
          ].map((row) => (
            <tr key={row[0] + row[1]} className="border-b border-gray-200">
              {row.map((c, i) => (
                <td key={i} className={i < 3 ? "py-1 pr-4" : "py-1"}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2">
        Gana <strong>Temp 45, Supplier B</strong>, con un ajuste de{" "}
        <strong>77,875</strong>. Como pasa del objetivo de 75, la deseabilidad
        vale <strong>1</strong> exacto. Y el intervalo de predicci&oacute;n va de
        76,08 a 79,68: una corrida futura caer&aacute; ah&iacute; dentro.
      </p>
      <Note>
        Lo instructivo es la <strong>fila del 44,375</strong>. El proveedor B a
        temperatura baja es la <em>peor</em> combinaci&oacute;n de las cuatro,
        por debajo del l&iacute;mite inferior de 50, con d = 0. El mismo
        proveedor B a temperatura alta es la mejor. Eso{" "}
        <strong>es</strong> la interacci&oacute;n Temp*Supplier: el proveedor no
        es bueno ni malo, lo es <em>seg&uacute;n</em> la temperatura.
      </Note>
      <Warn>
        Y f&iacute;jate en lo que el optimizador <strong>no</strong> te dice: la
        concentraci&oacute;n. Al no influir, cualquier valor entre 5 y 15 sirve
        igual, y el optimizador la ha dejado fuera. La decisi&oacute;n de usar el
        5 % es <strong>de ingenier&iacute;a</strong>, no estad&iacute;stica: si da
        lo mismo, se elige el m&aacute;s barato. As&iacute; se llega a la{" "}
        <em>soluci&oacute;n pr&aacute;ctica</em>: <strong>Temp 45 &deg;C,
        concentraci&oacute;n 5 %, proveedor B</strong>.
      </Warn>
      <p>
        Esa &uacute;ltima frase resume para qu&eacute; sirve todo esto. La
        estad&iacute;stica acota qu&eacute; da igual y qu&eacute; no; la
        decisi&oacute;n final es tuya.
      </p>
    </Section>
  </div>
);

const EN = () => (
  <div className="space-y-5">
    <Section title="The problem">
      <p>
        The factorial analysis says <em>which</em> factors matter. The optimizer
        answers the next question: <strong>where to set them</strong>.
      </p>
      <p>
        With one response it is nearly trivial. The difficulty arrives with{" "}
        <strong>several responses at once</strong>, which almost always pull in
        opposite directions. More yield usually costs more; more hardness, less
        toughness. Trade-offs need a common currency.
      </p>
    </Section>

    <Section title="Desirability: a common currency">
      <Formula>
        Maximize: <V>d</V> ={" "}
        <Frac
          num={
            <>
              <V>y</V> {"\u2212"} lower
            </>
          }
          den={<>target {"\u2212"} lower</>}
        />
        <sup>{"\u00a0"}weight</sup>
      </Formula>
      <p>
        Megapascals cannot be added to euros. Derringer and Suich translate every
        response onto a <strong>unitless score from 0 to 1</strong>: zero is
        unacceptable, one is fully satisfactory.
      </p>
      <Note>
        The <strong>bound</strong> is what you call unacceptable; the{" "}
        <strong>target</strong> is what would satisfy you. Both are engineering
        decisions, not statistical ones, and they are the most influential input
        in the whole calculation.
      </Note>
    </Section>

    <Section title="Weight and importance are not the same">
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>Weight bends one response{"\u2019"}s curve.</strong> At 1 it is
          a straight line. At 10, <V>d</V> stays near zero until you almost touch
          the target. At 0.1, nearly anything above the bound already counts.
        </li>
        <li>
          <strong>Importance weighs responses against each other.</strong> It
          changes no curve, only the share each one takes in the final blend.
        </li>
      </ul>
      <Note>
        Leave both at <strong>1</strong> until you have a specific reason. A
        weight of 10 set carelessly can make the optimizer abandon a perfectly
        reasonable solution.
      </Note>
    </Section>

    <Section title="Why the mean is geometric">
      <Formula>
        <V>D</V> = ( <V>d</V><Sub>1</Sub><sup>i1</sup> {"\u00b7"} <V>d</V>
        <Sub>2</Sub><sup>i2</sup> {"\u00b7"} {"\u2026"} ){" "}
        <sup>
          1/{"\u03A3"}<V>i</V>
        </sup>
      </Formula>
      <Warn>
        <strong>A single zero wipes out the composite.</strong> If one response
        falls in unacceptable territory, the whole solution is discarded however
        good the rest are. An arithmetic mean would let a zero be offset by ones
        and the optimizer would propose something unusable.
      </Warn>
      <p>
        That is exactly the engineering behaviour wanted: a product failing one
        specification is not rescued by meeting the other five.
      </p>
    </Section>

    <Section title="Where the optimum lies">
      <p>
        With factors coded {"\u2212"}1 and +1 the model is{" "}
        <strong>multilinear</strong>: hold all but one and the response is a
        straight line in that one. A straight line reaches its extreme{" "}
        <em>always at an end of the interval</em>.
      </p>
      <Note>
        Hence a useful fact: with <strong>a single response</strong> the optimum
        always sits at a <strong>vertex</strong> of the design cube, one of the
        level combinations already run. No search is needed — enumerate the 2
        <sup>k</sup> vertices and take the best. Exact, with no risk of a local
        optimum.
      </Note>
      <p>
        With <strong>several responses</strong> the composite is no longer
        monotone and the compromise can fall <em>inside</em> an edge: an
        intermediate value never run but which the model can predict.
      </p>
    </Section>

    <Section title="The two intervals">
      <Formula>
        SE<Sub>fit</Sub> = <V>s</V> {"\u221A"}<V>q</V>
        {"\u00a0\u00a0\u00a0\u00a0"}
        SE<Sub>pred</Sub> = <V>s</V> {"\u221A"}(1 + <V>q</V>)
      </Formula>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>CI</strong> — where the <em>mean</em> response lies. It narrows
          as you add runs.
        </li>
        <li>
          <strong>PI</strong> — where <em>one future run</em> will land. Always
          wider, and it never narrows below the process noise.
        </li>
      </ul>
      <Note>
        The <strong>extra 1</strong> is the whole difference: it is the
        variability of a fresh observation. To promise production what{" "}
        <em>the next part</em> will do, the honest number is the PI.
      </Note>
    </Section>

    <Section title="Cautions">
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>Prune the model first.</strong> Optimizing over non-significant
          terms moves the solution to follow noise.
        </li>
        <li>
          <strong>Never extrapolate.</strong> Outside the tested range the model
          knows nothing.
        </li>
        <li>
          <strong>D = 1 is not perfection</strong>, only that you met the target{" "}
          <em>you set</em>. If it clears it easily, try raising the target.
        </li>
        <li>
          <strong>Confirm with real runs.</strong> The optimum is a prediction,
          not a fact.
        </li>
        <li>
          <strong>The mathematical optimum is not the decision.</strong> Cost,
          safety, wear and capability are not in the calculation, and often
          decide.
        </li>
      </ul>
    </Section>

    <Section title="Worked example">
      <p>
        Yield against Temp, Conc and Supplier. After pruning, the model keeps{" "}
        <strong>Temp, Supplier and Temp*Supplier</strong>. Goal: maximize, lower
        bound 50, target 75. Four vertices to evaluate: 54.425 and 44.375 at low
        temperature, 67.825 and 77.875 at high.
      </p>
      <p>
        <strong>Temp 45, Supplier B</strong> wins with a fit of{" "}
        <strong>77.875</strong>, past the target, so d = 1 exactly. The prediction
        interval runs from 76.08 to 79.68.
      </p>
      <Note>
        The instructive row is <strong>44.375</strong>. Supplier B at low
        temperature is the <em>worst</em> of the four, below the lower bound, d =
        0. The same supplier B at high temperature is the best. That{" "}
        <strong>is</strong> the Temp*Supplier interaction: the supplier is neither
        good nor bad, it is one or the other <em>depending on</em> temperature.
      </Note>
      <Warn>
        Note what the optimizer does <strong>not</strong> tell you:
        concentration. Having no effect, any value from 5 to 15 does equally well,
        so it was left out. Choosing 5% is an{" "}
        <strong>engineering</strong> decision: if it makes no difference, take the
        cheaper. That is how you reach the <em>practical solution</em>:{" "}
        <strong>Temp 45 &deg;C, concentration 5%, supplier B</strong>.
      </Warn>
    </Section>
  </div>
);

export default function DoeOptTheory() {
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
 
