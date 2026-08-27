// app/app/six-sigma/studies/doe/factorial/contour/Theory.tsx
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
    <Section title="Qué es un gráfico de contornos">
      <p>
        Es el <strong>mapa topogr&aacute;fico de la respuesta</strong>. Dos
        factores en los ejes, y cada l&iacute;nea une los ajustes que dan el
        mismo valor previsto, igual que una curva de nivel une los puntos de un
        mapa que est&aacute;n a la misma altura.
      </p>
      <p>
        A diferencia del cubo, que solo tiene valores en ocho esquinas, aqu&iacute;
        hay una <strong>superficie continua</strong>: el modelo se eval&uacute;a
        en una rejilla fina y se puede leer cualquier combinaci&oacute;n
        intermedia.
      </p>
      <Formula>
        <V>ŷ</V> = <V>b</V><Sub>0</Sub> + <V>b</V><Sub>1</Sub><V>x</V>
        <Sub>1</Sub> + <V>b</V><Sub>2</Sub><V>x</V><Sub>2</Sub> + <V>b</V>
        <Sub>12</Sub><V>x</V><Sub>1</Sub><V>x</V><Sub>2</Sub> + {"\u2026"}
      </Formula>
    </Section>

    <Section title="Cómo se lee">
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>L&iacute;neas juntas</strong> {"\u2192"} superficie empinada.
          Un peque&ntilde;o cambio del factor mueve mucho la respuesta: zona
          delicada de controlar.
        </li>
        <li>
          <strong>L&iacute;neas separadas</strong> {"\u2192"} zona plana. Ah&iacute;
          el proceso es <em>robusto</em>, y suele ser mejor sitio para operar
          que el &oacute;ptimo te&oacute;rico.
        </li>
        <li>
          <strong>L&iacute;neas rectas y paralelas</strong> {"\u2192"} no hay
          interacci&oacute;n entre los dos factores del gr&aacute;fico.
        </li>
        <li>
          <strong>L&iacute;neas curvadas o en abanico</strong> {"\u2192"} s&iacute;
          la hay: el efecto de un factor cambia seg&uacute;n d&oacute;nde
          est&eacute; el otro. Es el t&eacute;rmino <V>x</V><Sub>1</Sub>
          <V>x</V><Sub>2</Sub> quien las dobla.
        </li>
      </ul>
      <Note>
        Con un modelo de dos niveles la superficie es un{" "}
        <strong>plano alabeado</strong>, no una c&uacute;pula. Nunca
        aparecer&aacute; un m&aacute;ximo dentro del recuadro: el mejor punto
        siempre cae en un borde o en una esquina. Para ver un m&aacute;ximo
        interior hacen falta t&eacute;rminos cuadr&aacute;ticos, y eso es un
        dise&ntilde;o de superficie de respuesta.
      </Note>
    </Section>

    <Section title="Los valores fijos: el gráfico es un corte">
      <p>
        Con tres o m&aacute;s factores, dos van a los ejes y{" "}
        <strong>los dem&aacute;s se fijan en un valor</strong>. Lo que ves no es
        la respuesta: es una <strong>rebanada</strong> de la respuesta a esos
        valores concretos.
      </p>
      <p>
        Si un factor fijado interact&uacute;a con los de los ejes, cambiar su
        valor <strong>deforma el mapa</strong>. Si no interact&uacute;a, solo lo
        desplaza en bloque, y las l&iacute;neas se mueven sin cambiar de forma.
      </p>
      <Warn>
        Un contorno sin sus valores fijos a la vista no se puede interpretar. Por
        eso aparecen siempre bajo el t&iacute;tulo: la misma superficie con otro
        corte cuenta otra cosa.
      </Warn>
    </Section>

    <Section title="Banda de especificación">
      <p>
        En vez de niveles autom&aacute;ticos se puede pedir un{" "}
        <strong>l&iacute;mite inferior y superior</strong>. Se sombrea entonces
        lo que queda <strong>fuera</strong> de la banda, y la zona limpia es la
        regi&oacute;n de ajustes que cumplen la especificaci&oacute;n.
      </p>
      <p>
        Es la salida m&aacute;s &uacute;til para llevar a producci&oacute;n: no
        da un punto &oacute;ptimo, da un <strong>&aacute;rea de trabajo</strong>.
        Y un &aacute;rea admite deriva; un punto, no.
      </p>
      <Note>
        Si un l&iacute;mite pedido queda fuera del rango que alcanza la
        superficie en ese corte, <strong>la l&iacute;nea no se dibuja</strong>,
        porque no existe. No es un fallo del gr&aacute;fico: es la respuesta de
        que ninguna combinaci&oacute;n dentro del dise&ntilde;o llega ah&iacute;.
      </Note>
    </Section>

    <Section title="Límites">
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>Todo es predicci&oacute;n.</strong> Ninguna l&iacute;nea es un
          dato medido; salen del modelo, y valen lo que valga el modelo.
        </li>
        <li>
          <strong>Sin incertidumbre.</strong> El mapa no dice cu&aacute;nto se
          equivoca. Dos zonas que parecen distintas pueden estar dentro del error
          de ajuste.
        </li>
        <li>
          <strong>Solo dentro del dise&ntilde;o.</strong> Fuera de los niveles
          ensayados la extrapolaci&oacute;n de un plano es una invitaci&oacute;n
          al error.
        </li>
        <li>
          <strong>Los t&eacute;rminos importan.</strong> Dibujar la superficie con
          t&eacute;rminos que son ruido la hace doblarse donde nada se dobla.
        </li>
      </ul>
    </Section>

    <Section title="Ejemplo resuelto">
      <p>
        Anchura, con el modelo reducido{" "}
        <V>ŷ</V> = 34,7244 + 2,4356 A + 3,2419 B + 4,5844 C {"\u2212"} 2,4381 BC,
        donde A es Dwell Time, B Temp y C Na2S2O8. En los ejes B y C; A fijo.
      </p>
      <p>
        Con <strong>A = 4</strong>, la l&iacute;nea de Width = 35 va de (40;
        2,354) a (80; 2,026): para mantener la anchura al subir la temperatura hay
        que <em>bajar</em> el persulfato.
      </p>
      <Note>
        Esa curva no es recta porque el t&eacute;rmino BC est&aacute; en el
        modelo. Es el mismo {"\u2212"}4,876 que en el cubo hac&iacute;a que las
        aristas no fueran paralelas: aqu&iacute; se ve como pendiente que
        cambia.
      </Note>
      <p>
        Subiendo el valor fijo, la l&iacute;nea se desplaza hacia abajo: con{" "}
        <strong>A = 5</strong> pasa por (40; 2,250) y toca el borde inferior en
        T {"\u2248"} 77; con <strong>A = 6</strong>, por (40; 2,146) y ya sale
        del recuadro en T {"\u2248"} 68. M&aacute;s Dwell Time deja m&aacute;s
        sitio para cumplir.
      </p>
      <Warn>
        Si se pide la banda 35{"\u2013"}45, el contorno de 45{" "}
        <strong>no aparece nunca</strong>: el m&aacute;ximo que alcanza la
        superficie es 42,55, y eso con A = 6 en la esquina m&aacute;s favorable.
        Con este dise&ntilde;o no se llega a 45.
      </Warn>
    </Section>
  </div>
);

const EN = () => (
  <div className="space-y-5">
    <Section title="What a contour plot is">
      <p>
        It is the <strong>topographic map of the response</strong>. Two factors
        on the axes, and each line joins the settings that give the same
        predicted value, exactly as a contour on a map joins points at the same
        height.
      </p>
      <p>
        Unlike the cube, which only has values at eight corners, this is a{" "}
        <strong>continuous surface</strong>: the model is evaluated on a fine
        grid, so any intermediate combination can be read off.
      </p>
      <Formula>
        <V>ŷ</V> = <V>b</V><Sub>0</Sub> + <V>b</V><Sub>1</Sub><V>x</V>
        <Sub>1</Sub> + <V>b</V><Sub>2</Sub><V>x</V><Sub>2</Sub> + <V>b</V>
        <Sub>12</Sub><V>x</V><Sub>1</Sub><V>x</V><Sub>2</Sub> + {"\u2026"}
      </Formula>
    </Section>

    <Section title="How to read it">
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>Lines close together</strong> {"\u2192"} steep surface. A small
          move in a factor shifts the response a lot: hard to hold.
        </li>
        <li>
          <strong>Lines far apart</strong> {"\u2192"} flat region. The process is{" "}
          <em>robust</em> there, and that is often a better place to run than the
          theoretical optimum.
        </li>
        <li>
          <strong>Straight parallel lines</strong> {"\u2192"} no interaction
          between the two factors on the plot.
        </li>
        <li>
          <strong>Curved or fanning lines</strong> {"\u2192"} there is one: the
          effect of one factor depends on where the other sits. The{" "}
          <V>x</V><Sub>1</Sub><V>x</V><Sub>2</Sub> term is what bends them.
        </li>
      </ul>
      <Note>
        With a two-level model the surface is a <strong>warped plane</strong>,
        not a dome. A maximum will never appear inside the box: the best point is
        always on an edge or a corner. An interior optimum needs quadratic terms,
        which means a response-surface design.
      </Note>
    </Section>

    <Section title="Hold values: this is a slice">
      <p>
        With three or more factors, two go on the axes and{" "}
        <strong>the rest are held fixed</strong>. What you see is not the
        response: it is a <strong>slice</strong> of it at those particular
        values.
      </p>
      <p>
        If a held factor interacts with the ones on the axes, changing its value{" "}
        <strong>reshapes the map</strong>. If it does not, the lines just shift
        without changing form.
      </p>
      <Warn>
        A contour plot without its hold values on show cannot be interpreted,
        which is why they are printed under the title. The same surface, sliced
        elsewhere, tells a different story.
      </Warn>
    </Section>

    <Section title="Specification band">
      <p>
        Instead of automatic levels you can ask for a{" "}
        <strong>lower and upper limit</strong>. What lies <strong>outside</strong>{" "}
        the band is shaded, and the clear area is the set of settings that meet
        the spec.
      </p>
      <p>
        This is the output to take to production: not an optimal point but a{" "}
        <strong>working region</strong>. A region tolerates drift; a point does
        not.
      </p>
      <Note>
        If a requested limit falls outside the range the surface reaches in that
        slice, <strong>no line is drawn</strong>, because none exists. That is
        not a failure of the plot: it is the answer that nothing within the
        design gets there.
      </Note>
    </Section>

    <Section title="Limits">
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>It is all prediction.</strong> No line is a measurement; they
          come from the model and are worth what the model is worth.
        </li>
        <li>
          <strong>No uncertainty shown.</strong> The map never says how wrong it
          might be. Two regions that look different may be within the fitting
          error.
        </li>
        <li>
          <strong>Inside the design only.</strong> Beyond the levels that were
          run, extrapolating a plane invites trouble.
        </li>
        <li>
          <strong>The terms matter.</strong> Drawing the surface with noise terms
          makes it bend where nothing bends.
        </li>
      </ul>
    </Section>

    <Section title="Worked example">
      <p>
        Width, with the reduced model{" "}
        <V>ŷ</V> = 34.7244 + 2.4356 A + 3.2419 B + 4.5844 C {"\u2212"} 2.4381 BC,
        where A is Dwell Time, B Temp and C Na2S2O8. B and C on the axes, A held.
      </p>
      <p>
        At <strong>A = 4</strong>, the Width = 35 line runs from (40, 2.354) to
        (80, 2.026): to keep the width as temperature rises you must{" "}
        <em>lower</em> the persulfate.
      </p>
      <Note>
        That curve is not straight because the BC term is in the model. It is the
        same {"\u2212"}4.876 that made the cube edges non-parallel; here it shows
        up as a slope that changes.
      </Note>
      <p>
        Raise the hold value and the line moves down: at <strong>A = 5</strong>{" "}
        it passes through (40, 2.250) and reaches the bottom edge near T{" "}
        {"\u2248"} 77; at <strong>A = 6</strong>, through (40, 2.146), leaving
        the box by T {"\u2248"} 68. More dwell time leaves more room to comply.
      </p>
      <Warn>
        Ask for the 35{"\u2013"}45 band and the 45 contour{" "}
        <strong>never appears</strong>: the highest the surface reaches is 42.55,
        and that is at A = 6 in the most favourable corner. This design does not
        get to 45.
      </Warn>
    </Section>
  </div>
);

export default function DoeContourTheory() {
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
