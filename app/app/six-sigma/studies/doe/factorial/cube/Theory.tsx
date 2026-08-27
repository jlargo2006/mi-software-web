// app/app/six-sigma/studies/doe/factorial/cube/Theory.tsx
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
    <Section title="Qué es un cube plot">
      <p>
        Un cube plot pone la respuesta{" "}
        <strong>donde ocurrieron las corridas</strong>. Con tres factores de dos
        niveles el dise&ntilde;o tiene ocho combinaciones, y esas ocho son los
        v&eacute;rtices de un cubo: un eje por factor, el nivel bajo en un
        extremo y el alto en el otro.
      </p>
      <p>
        No hay resumen ni promedio de por medio. La geometr&iacute;a del
        dise&ntilde;o y la del dibujo son la misma cosa, y por eso es el
        gr&aacute;fico que mejor se ense&ntilde;a a quien no es
        estad&iacute;stico: cada n&uacute;mero est&aacute; en su esquina.
      </p>
    </Section>

    <Section title="Cómo se lee">
      <p>
        Se recorre una <strong>arista</strong>. Los dos v&eacute;rtices que une
        difieren en un solo factor, as&iacute; que la diferencia entre ellos es
        el efecto de ese factor con los dem&aacute;s fijos. Hay cuatro aristas
        paralelas por factor, una por cada combinaci&oacute;n de los otros dos.
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>Sin interacci&oacute;n</strong> {"\u2192"} las cuatro aristas
          paralelas cambian lo mismo. El factor hace lo mismo est&eacute;s donde
          est&eacute;s.
        </li>
        <li>
          <strong>Con interacci&oacute;n</strong> {"\u2192"} cambian cantidades
          distintas, o en sentidos opuestos. Entonces el efecto de ese factor no
          es un n&uacute;mero, y dar uno solo enga&ntilde;a.
        </li>
        <li>
          <strong>Mejor v&eacute;rtice</strong> {"\u2192"} el valor extremo es la
          mejor combinaci&oacute;n <em>de las ocho corridas</em>, no el
          &oacute;ptimo del proceso. Para eso est&aacute; el optimizador.
        </li>
      </ul>
      <Note>
        El cubo y el gr&aacute;fico de interacciones dicen lo mismo por caminos
        distintos: aristas paralelas equivalen a l&iacute;neas paralelas. El cubo
        gana en que no promedia nada; el de interacciones, en que admite
        m&aacute;s de tres factores.
      </Note>
    </Section>

    <Section title="Medias de datos y medias ajustadas">
      <p>
        <strong>Medias de datos</strong>: el promedio bruto de las corridas de
        cada v&eacute;rtice. No dependen de ning&uacute;n modelo, y un
        v&eacute;rtice sin corridas se queda en blanco.
      </p>
      <p>
        <strong>Medias ajustadas</strong>: salen de un modelo. Cada
        v&eacute;rtice es la constante m&aacute;s cada coeficiente con el signo
        de esa esquina:
      </p>
      <Formula>
        <V>ŷ</V> = <V>b</V><Sub>0</Sub> + <V>b</V><Sub>A</Sub>
        <V>x</V><Sub>A</Sub> + <V>b</V><Sub>B</Sub><V>x</V><Sub>B</Sub> +{" "}
        <V>b</V><Sub>C</Sub><V>x</V><Sub>C</Sub> + <V>b</V><Sub>AB</Sub>
        <V>x</V><Sub>A</Sub><V>x</V><Sub>B</Sub> + {"\u2026"}
      </Formula>
      <p>
        con <V>x</V> = {"\u2212"}1 en el nivel bajo y +1 en el alto. Con el{" "}
        <strong>modelo completo</strong> el ajuste reproduce exactamente las
        medias de celda: las dos opciones dan el mismo n&uacute;mero hasta el
        &uacute;ltimo decimal.
      </p>
      <p>
        Se separan solo cuando se <strong>quita alg&uacute;n
        t&eacute;rmino</strong>. Los v&eacute;rtices pasan a mostrar lo que
        predice el modelo reducido, y la diferencia es la parte de la respuesta
        que cargaban los t&eacute;rminos retirados.
      </p>
      <Note>
        Por eso aqu&iacute; el modelo completo es el de partida, y la lista de
        t&eacute;rminos est&aacute; a la vista en el panel. Un cubo construido
        sobre un modelo que el usuario no eligi&oacute; muestra n&uacute;meros que
        no aparecen en ninguna otra salida del proyecto, y desde el dibujo no hay
        forma de saber de d&oacute;nde vienen.
      </Note>
    </Section>

    <Section title="El punto central">
      <p>
        Si el dise&ntilde;o tiene corridas centrales, su media se dibuja en el
        medio como una cruz roja. Es <strong>siempre un promedio bruto, nunca un
        valor ajustado</strong>: el modelo del cubo es un plano por los
        v&eacute;rtices y no tiene ning&uacute;n t&eacute;rmino que distinga el
        centro del promedio de las ocho esquinas.
      </p>
      <p>
        Y eso es justo lo que lo hace &uacute;til. Si el centro queda claramente
        por encima o por debajo del promedio de los v&eacute;rtices, la respuesta
        est&aacute; <strong>curvada</strong> y un dise&ntilde;o de dos niveles no
        puede describirla: har&iacute;an falta puntos axiales y un modelo
        cuadr&aacute;tico.
      </p>
      <Formula>
        Curvatura {"\u2248"} <V>y</V><Sub>centro</Sub> {"\u2212"} media de los
        v&eacute;rtices
      </Formula>
      <p>
        El contraste formal de esa diferencia es el t&eacute;rmino Ct Pt del
        an&aacute;lisis factorial. Aqu&iacute; se ve con los ojos, sin p-valor.
      </p>
      <Warn>
        Los puntos centrales se detectan por el <strong>nivel intermedio de los
        factores</strong>, no por la columna CenterPt. Si el nivel del medio no
        est&aacute; centrado entre los dos extremos, no es un factorial con
        centro y el gr&aacute;fico lo rechaza.
      </Warn>
    </Section>

    <Section title="Límites">
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>Dos o tres factores.</strong> Con cuatro los v&eacute;rtices se
          solapan y no se lee nada: para eso est&aacute; el gr&aacute;fico de
          interacciones.
        </li>
        <li>
          <strong>Dos niveles por factor</strong>, m&aacute;s el centro
          opcional. Un factor con tres niveles reales no es una arista.
        </li>
        <li>
          <strong>Un dise&ntilde;o fraccionado no llena el cubo.</strong> Los
          v&eacute;rtices vac&iacute;os quedan en blanco con medias de datos, y
          extrapolados con medias ajustadas: eso es una predicci&oacute;n, no una
          medida.
        </li>
        <li>
          <strong>No contrasta nada.</strong> Una diferencia visible entre dos
          esquinas puede ser ruido; esa pregunta es del an&aacute;lisis
          factorial.
        </li>
      </ul>
    </Section>

    <Section title="Ejemplo resuelto">
      <p>
        Anchura de una pieza, 16 corridas replicadas m&aacute;s 3 centrales.
        Factores: Dwell Time (4, 6), Temp (40, 80), Na2S2O8 (1,8; 2,4).
      </p>
      <p>
        Con el <strong>modelo completo</strong> los v&eacute;rtices son las
        medias de celda: 23,0250 en la esquina baja y 43,3500 en la alta. Los
        efectos: C +9,1688, B +6,4838, A +4,8713, y{" "}
        <strong>BC {"\u2212"}4,8763</strong>, del tama&ntilde;o de un efecto
        principal.
      </p>
      <Note>
        Esa BC se ve en el cubo: subir Na2S2O8 con Temp baja gana m&aacute;s de
        12 unidades (23,0 {"\u2192"} 36,0), y con Temp alta apenas 3,6 (33,2{" "}
        {"\u2192"} 36,9). El persulfato deja de servir cuando la temperatura ya
        es alta. AB y AC, en cambio, valen menos de 1: prescindibles.
      </Note>
      <p>
        Quitando AB, AC y ABC, el modelo reducido{" "}
        <V>ŷ</V> = 34,7244 + 2,4356A + 3,2419B + 4,5844C {"\u2212"} 2,4381BC
        da 22,0244 en la esquina baja, 1,00 por debajo de la media de celda. Ese
        es el precio de simplificar, y la tabla lo imprime.
      </p>
      <p>
        El centro vale 35,0200 frente a 34,7244 de promedio de los
        v&eacute;rtices: <strong>0,30 de diferencia</strong> sobre un rango de 20
        unidades. Sin curvatura apreciable, el plano sirve.
      </p>
    </Section>
  </div>
);

const EN = () => (
  <div className="space-y-5">
    <Section title="What a cube plot is">
      <p>
        A cube plot puts the response <strong>where the runs actually
        happened</strong>. With three two-level factors the design has eight
        combinations, and those eight are the corners of a cube: one axis per
        factor, low at one end and high at the other.
      </p>
      <p>
        Nothing is summarised or averaged away. The geometry of the design and
        the geometry of the picture are the same thing, which is why this is the
        plot to show a non-statistician: every number sits at its own corner.
      </p>
    </Section>

    <Section title="How to read it">
      <p>
        Walk along an <strong>edge</strong>. The two corners it joins differ in
        exactly one factor, so the change between them is the effect of that
        factor with the others held fixed. There are four parallel edges per
        factor, one for each combination of the other two.
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>No interaction</strong> {"\u2192"} the four parallel edges
          change by the same amount. The factor does the same thing wherever you
          stand.
        </li>
        <li>
          <strong>Interaction</strong> {"\u2192"} they change by different
          amounts, or in opposite directions. Then the effect of that factor is
          not a single number, and quoting one is misleading.
        </li>
        <li>
          <strong>Best corner</strong> {"\u2192"} the extreme value is the best
          combination <em>of the eight that were run</em>, not the optimum of the
          process. That is what the optimiser is for.
        </li>
      </ul>
      <Note>
        The cube and the interaction plot say the same thing by different routes:
        parallel edges are parallel lines. The cube never averages anything; the
        interaction plot takes more than three factors.
      </Note>
    </Section>

    <Section title="Data means and fitted means">
      <p>
        <strong>Data means</strong> are the raw average of the runs at each
        corner. They owe nothing to any model, and a corner with no runs stays
        blank.
      </p>
      <p>
        <strong>Fitted means</strong> come from a model. Each corner is the
        constant plus every coefficient with the sign of that corner:
      </p>
      <Formula>
        <V>ŷ</V> = <V>b</V><Sub>0</Sub> + <V>b</V><Sub>A</Sub>
        <V>x</V><Sub>A</Sub> + <V>b</V><Sub>B</Sub><V>x</V><Sub>B</Sub> +{" "}
        <V>b</V><Sub>C</Sub><V>x</V><Sub>C</Sub> + <V>b</V><Sub>AB</Sub>
        <V>x</V><Sub>A</Sub><V>x</V><Sub>B</Sub> + {"\u2026"}
      </Formula>
      <p>
        with <V>x</V> = {"\u2212"}1 at the low level and +1 at the high one. With
        the <strong>full model</strong> the fit reproduces the cell means
        exactly: both options give the same number to the last decimal.
      </p>
      <p>
        They separate only when a <strong>term is taken out</strong>. The corners
        then show what the reduced model predicts, and the gap is the part of the
        response those terms were carrying.
      </p>
      <Note>
        That is why the full model is the default here, with the term list in
        the open on the panel. A cube built on a model the user did not choose
        shows numbers that appear nowhere else in the project, and the picture
        gives no clue where they came from.
      </Note>
    </Section>

    <Section title="The centre point">
      <p>
        If the design has centre runs, their mean is drawn in the middle as a red
        cross. It is <strong>always a raw average, never a fitted value</strong>:
        the model of the cube is a plane through the corners, and it has no term
        that tells the centre apart from the average of the eight of them.
      </p>
      <p>
        That is exactly what makes it useful. If the centre sits clearly above or
        below the average of the corners, the response is{" "}
        <strong>curved</strong>, and a two-level design cannot describe it: you
        would need axial runs and a quadratic model.
      </p>
      <Formula>
        Curvature {"\u2248"} <V>y</V><Sub>centre</Sub> {"\u2212"} mean of the
        corners
      </Formula>
      <p>
        The formal test of that difference is the Ct Pt term in the factorial
        analysis. Here you see it with your eyes, without a p-value.
      </p>
      <Warn>
        Centre points are found from the <strong>middle level of the
        factors</strong>, not from a CenterPt column. If the middle level is not
        centred between the two extremes, this is not a factorial with a centre
        and the plot refuses it.
      </Warn>
    </Section>

    <Section title="Limits">
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>Two or three factors.</strong> With four the corners fall on
          top of each other and nothing can be read: use the interaction plot.
        </li>
        <li>
          <strong>Two levels per factor</strong>, plus an optional centre. A
          factor with three real levels is not a cube edge.
        </li>
        <li>
          <strong>A fractional design does not fill the cube.</strong> Empty
          corners are blank under data means and extrapolated under fitted
          means {"\u2014"} a prediction, not a measurement.
        </li>
        <li>
          <strong>No testing.</strong> A visible difference between two corners
          can still be noise; that question belongs to the factorial analysis.
        </li>
      </ul>
    </Section>

    <Section title="Worked example">
      <p>
        Part width, 16 replicated runs plus 3 centre runs. Factors: Dwell Time
        (4, 6), Temp (40, 80), Na2S2O8 (1.8, 2.4).
      </p>
      <p>
        Under the <strong>full model</strong> the corners are the cell means:
        23.0250 at the low corner, 43.3500 at the high one. Effects: C +9.1688,
        B +6.4838, A +4.8713, and <strong>BC {"\u2212"}4.8763</strong>, the size
        of a main effect.
      </p>
      <Note>
        That BC is visible on the cube: raising Na2S2O8 at low Temp gains over 12
        units (23.0 {"\u2192"} 36.0), at high Temp barely 3.6 (33.2 {"\u2192"}{" "}
        36.9). The persulfate stops buying anything once the temperature is
        already high. AB and AC, by contrast, are under 1: expendable.
      </Note>
      <p>
        Dropping AB, AC and ABC, the reduced model{" "}
        <V>ŷ</V> = 34.7244 + 2.4356A + 3.2419B + 4.5844C {"\u2212"} 2.4381BC
        gives 22.0244 at the low corner, 1.00 below the cell mean. That is the
        price of simplifying, and the table prints it.
      </p>
      <p>
        The centre is 35.0200 against 34.7244 for the average of the corners:{" "}
        <strong>0.30 apart</strong> on a 20-unit range. No appreciable curvature,
        so the plane will do.
      </p>
    </Section>
  </div>
);

export default function DoeCubeTheory() {
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
