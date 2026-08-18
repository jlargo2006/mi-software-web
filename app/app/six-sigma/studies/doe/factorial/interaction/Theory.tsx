// app/app/six-sigma/studies/doe/factorial/interaction/Theory.tsx
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

const ES = () => (
  <div className="space-y-5">
    <Section title="Qué es una interacción">
      <p>
        Hay interacci&oacute;n cuando{" "}
        <strong>el efecto de un factor depende del nivel de otro</strong>. No es
        una rareza estad&iacute;stica: es lo normal en cualquier proceso
        f&iacute;sico. El tiempo de horneado &oacute;ptimo depende de la
        temperatura; la presi&oacute;n que conviene depende del material.
      </p>
      <p>
        El gr&aacute;fico cruza cada par de factores y dibuja la{" "}
        <strong>media de la respuesta en cada celda</strong>. Cada l&iacute;nea
        es un nivel del factor de la fila; el eje horizontal, los niveles del
        factor de la columna.
      </p>
      <Formula>
        Interacci&oacute;n AB ={" "}
        <span className="inline-block px-1">
          (efecto de A con B alto) {"\u2212"} (efecto de A con B bajo)
        </span>{" "}
        / 2
      </Formula>
      <p>
        La f&oacute;rmula es sim&eacute;trica: sale lo mismo intercambiando A y
        B. Por eso la matriz completa muestra cada par dos veces y las dos
        versiones cuentan la misma historia desde &aacute;ngulos distintos.
      </p>
    </Section>

    <Section title="Cómo se lee">
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>L&iacute;neas paralelas</strong> {"\u2192"} sin
          interacci&oacute;n. El efecto de A es el mismo con B alto que con B
          bajo, y los dos factores pueden ajustarse por separado.
        </li>
        <li>
          <strong>L&iacute;neas que se abren</strong> {"\u2192"}{" "}
          interacci&oacute;n moderada. A sigue actuando en la misma
          direcci&oacute;n, pero con m&aacute;s o menos fuerza seg&uacute;n B.
        </li>
        <li>
          <strong>L&iacute;neas que se cruzan</strong> {"\u2192"}{" "}
          interacci&oacute;n fuerte, la peor de todas. A <em>invierte</em> su
          efecto: lo que mejora la respuesta con B bajo la empeora con B alto.
        </li>
      </ul>
      <Warn>
        Con l&iacute;neas cruzadas, <strong>el efecto principal de A carece de
        sentido pr&aacute;ctico</strong>. Su media promedia una subida y una
        bajada, y puede salir cero. No se puede elegir el nivel de A sin decidir
        antes el de B: van juntos.
      </Warn>
    </Section>

    <Section title="Las dos medidas de la tabla">
      <p>
        <strong>Effect</strong> es la f&oacute;rmula de arriba. Solo se calcula
        con dos niveles en ambos factores, que es donde tiene sentido hablar de
        alto y bajo. Su signo indica en qu&eacute; direcci&oacute;n act&uacute;a
        el par.
      </p>
      <p>
        <strong>Departure</strong> es la desviaci&oacute;n m&aacute;xima
        respecto a un modelo puramente aditivo:
      </p>
      <Formula>
        <V>d</V><Sub>ij</Sub> = <V>y</V><Sub>ij</Sub> {"\u2212"} <V>y</V>
        <Sub>i</Sub> {"\u2212"} <V>y</V><Sub>j</Sub> + <V>y</V>
      </Formula>
      <p>
        Vale <strong>cero exacto cuando las l&iacute;neas son paralelas</strong>{" "}
        y funciona con cualquier n&uacute;mero de niveles, tambi&eacute;n cuando
        el factor es de texto.
      </p>
      <Note>
        La columna <strong>vs largest main</strong> es la que de verdad decide.
        Una interacci&oacute;n de 0,8 no dice nada por s&iacute; sola: si el
        mayor efecto principal es 3, es un detalle; si es 1, lo domina todo.
      </Note>
    </Section>

    <Section title="Por qué se mira antes que los efectos principales">
      <p>
        Parece natural empezar por los efectos principales y dejar las
        interacciones para el final. Es al rev&eacute;s.
      </p>
      <p>
        Un factor puede tener efecto principal <strong>exactamente
        cero</strong> y ser el m&aacute;s importante del experimento: basta con
        que suba la respuesta tanto con B bajo como la baje con B alto. El
        gr&aacute;fico de efectos principales lo pintar&iacute;a plano, porque
        promedia sobre B, y eso es justo lo que borra la interacci&oacute;n.
      </p>
      <Warn>
        <strong>Si hay interacci&oacute;n fuerte, el efecto principal es
        engañoso.</strong> Primero se mira este gr&aacute;fico; solo si las
        l&iacute;neas salen paralelas tiene sentido interpretar los efectos
        principales por separado.
      </Warn>
    </Section>

    <Section title="Límites">
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>No contrasta nada.</strong> No hay p-valores. Con pocas
          corridas, unas l&iacute;neas no paralelas pueden ser puro ruido.
        </li>
        <li>
          <strong>Solo pares.</strong> Una interacci&oacute;n de tres factores no
          se ve aqu&iacute;, y puede hacer que un panel enga&ntilde;e.
        </li>
        <li>
          <strong>Los dise&ntilde;os fraccionados tienen huecos.</strong> Si una
          combinaci&oacute;n no se ha corrido, la l&iacute;nea se interrumpe. En
          resoluci&oacute;n III o IV, adem&aacute;s, lo que se ve puede ser la
          suma de dos interacciones confundidas.
        </li>
        <li>
          <strong>Cada punto es una media</strong>, no un dato. Sin
          r&eacute;plicas no se sabe cu&aacute;nto se mueve por azar.
        </li>
      </ul>
    </Section>

    <Section title="Ejemplo resuelto">
      <p>
        Catapulta, 8 corridas. Efectos principales: Fulcrum +3,1125, Start Angle
        {" \u2212"}2,3625, Stop Angle +1,7625. Y las tres interacciones:
      </p>
      <table className="text-xs border-collapse">
        <thead>
          <tr className="border-b border-gray-300">
            <th className="py-1 pr-4 text-left font-medium text-gray-600">
              Par
            </th>
            <th className="py-1 pr-4 text-left font-medium text-gray-600">
              Efecto
            </th>
            <th className="py-1 text-left font-medium text-gray-600">
              Frente a Fulcrum
            </th>
          </tr>
        </thead>
        <tbody>
          {[
            ["Start Angle \u00d7 Fulcrum", "\u22120,8375", "27 %"],
            ["Stop Angle \u00d7 Fulcrum", "+0,8375", "27 %"],
            ["Start Angle \u00d7 Stop Angle", "\u22120,3875", "12 %"],
          ].map((row) => (
            <tr key={row[0]} className="border-b border-gray-200">
              {row.map((c, i) => (
                <td key={i} className={i < 2 ? "py-1 pr-4" : "py-1"}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2">
        Ninguna llega a un tercio del efecto principal mayor, as&iacute; que las
        l&iacute;neas salen <strong>casi paralelas y sin cruzarse</strong>. Es el
        caso c&oacute;modo: los efectos principales se pueden interpretar tal
        cual, y la receta <em>Fulcrum alto, Stop Angle alto, Start Angle
        bajo</em> sigue siendo v&aacute;lida.
      </p>
      <Note>
        Que las dos interacciones con Fulcrum tengan{" "}
        <strong>el mismo tama&ntilde;o y signos opuestos</strong> no es
        casualidad aritm&eacute;tica: con Fulcrum alto la catapulta lanza
        m&aacute;s lejos y <em>todos</em> los efectos se amplifican, cada uno en
        su propia direcci&oacute;n. Es lo t&iacute;pico de una respuesta que
        crece de forma multiplicativa; si molestara, se corrige analizando el
        logaritmo de la distancia.
      </Note>
    </Section>
  </div>
);

const EN = () => (
  <div className="space-y-5">
    <Section title="What an interaction is">
      <p>
        An interaction means <strong>the effect of one factor depends on the
        level of another</strong>. Far from exotic, it is the normal state of
        affairs in physical processes.
      </p>
      <Formula>
        AB interaction ={" "}
        <span className="inline-block px-1">
          (effect of A at high B) {"\u2212"} (effect of A at low B)
        </span>{" "}
        / 2
      </Formula>
      <p>
        The formula is symmetric, which is why the full matrix shows every pair
        twice: the same story from two angles.
      </p>
    </Section>

    <Section title="How to read it">
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>Parallel lines</strong> — no interaction. The two factors can
          be set independently.
        </li>
        <li>
          <strong>Diverging lines</strong> — moderate interaction. Same
          direction, different strength.
        </li>
        <li>
          <strong>Crossing lines</strong> — strong interaction. Factor A
          <em>reverses</em>: what helps at low B hurts at high B.
        </li>
      </ul>
      <Warn>
        With crossing lines the <strong>main effect of A is meaningless in
        practice</strong>. Its average blends a rise and a fall and can come out
        at zero. The levels of A and B have to be chosen together.
      </Warn>
    </Section>

    <Section title="The two measures in the table">
      <p>
        <strong>Effect</strong> is the formula above, defined only for two-level
        factors. <strong>Departure</strong> is the largest deviation from an
        additive model:
      </p>
      <Formula>
        <V>d</V><Sub>ij</Sub> = <V>y</V><Sub>ij</Sub> {"\u2212"} <V>y</V>
        <Sub>i</Sub> {"\u2212"} <V>y</V><Sub>j</Sub> + <V>y</V>
      </Formula>
      <p>
        It is exactly zero for parallel lines and works with any number of
        levels, text factors included.
      </p>
      <Note>
        The <strong>vs largest main</strong> column is what decides. An
        interaction of 0.8 means nothing on its own: against a main effect of 3
        it is a detail, against one of 1 it dominates.
      </Note>
    </Section>

    <Section title="Why look here before the main effects">
      <p>
        A factor can have <strong>exactly zero main effect</strong> and still be
        the most important in the experiment, if it raises the response at low B
        by as much as it lowers it at high B. The main effects plot averages over
        B, and averaging is precisely what erases an interaction.
      </p>
      <Warn>
        Interactions first, main effects second. Only if the lines come out
        parallel does it make sense to read the main effects on their own.
      </Warn>
    </Section>

    <Section title="Limits">
      <ul className="list-disc pl-5 space-y-1">
        <li><strong>No testing</strong> — no p-values here.</li>
        <li>
          <strong>Pairs only</strong> — a three-factor interaction does not show
          up, and can make a panel misleading.
        </li>
        <li>
          <strong>Fractional designs have gaps.</strong> Missing combinations
          break the lines, and at resolution III or IV what you see may be two
          confounded interactions added together.
        </li>
        <li>
          <strong>Every point is a mean</strong>, not a datum. Without
          replicates there is no way to know how much it moves by chance.
        </li>
      </ul>
    </Section>

    <Section title="Worked example">
      <p>
        Catapult, 8 runs. Main effects: Fulcrum +3.1125, Start Angle{" "}
        {"\u2212"}2.3625, Stop Angle +1.7625. Interactions:{" "}
        {"\u2212"}0.8375 and +0.8375 with Fulcrum, and {"\u2212"}0.3875 between
        the two angles.
      </p>
      <Note>
        None reaches a third of the largest main effect, so the lines come out{" "}
        <strong>nearly parallel and never cross</strong>. The comfortable case:
        the main effects can be read as they stand, and the recipe{" "}
        <em>Fulcrum high, Stop Angle high, Start Angle low</em> holds.
      </Note>
    </Section>
  </div>
);

export default function DoeIntTheory() {
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
