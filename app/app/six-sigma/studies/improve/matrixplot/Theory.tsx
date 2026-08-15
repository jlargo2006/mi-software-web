// app/app/six-sigma/studies/improve/matrixplot/Theory.tsx
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

const Note = ({ children }: { children: React.ReactNode }) => (
  <div className="my-2 px-3 py-2 bg-amber-50 border-l-4 border-amber-400 text-sm">
    {children}
  </div>
);

const ES = () => (
  <div className="space-y-5">
    <Section title="Para qué sirve">
      <p>
        Antes de modelar nada conviene <strong>mirar los datos</strong>. La
        matriz de gr&aacute;ficos pone todos los pares de variables a la vez y
        revela de un vistazo relaciones, curvaturas, agrupamientos y valores
        extremos que ninguna tabla de coeficientes ense&ntilde;a.
      </p>
      <p>
        Con <strong>k</strong> variables hay <strong>k(k{"\u2212"}1)/2</strong>{" "}
        pares distintos. Con seis son quince: inspeccionarlos de uno en uno es
        tedioso y se acaba mirando solo los esperados.
      </p>
    </Section>

    <Section title="Las dos disposiciones">
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>Matriz de gr&aacute;ficos.</strong> Todas contra todas. Cada
          par sale dos veces, con los ejes intercambiados, y la diagonal lleva
          el nombre. &Uacute;til cuando ninguna variable manda todav&iacute;a.
        </li>
        <li>
          <strong>Cada Y frente a cada X.</strong> Se separan respuestas y
          predictores. M&aacute;s compacta cuando ya sabes qu&eacute; quieres
          explicar.
        </li>
      </ul>
    </Section>

    <Section title="Grupos y suavizador">
      <p>
        Colorear por una <strong>categor&iacute;a</strong> descubre lo que la
        nube conjunta esconde: dos poblaciones con pendientes distintas pueden
        dar una correlaci&oacute;n global de cero.
      </p>
      <p>
        El <strong>suavizador lowess</strong> ajusta una recta en cada punto
        usando solo a sus vecinos, ponderados por cercan&iacute;a, y repite el
        c&aacute;lculo rebajando el peso de los puntos peor ajustados. No supone
        ninguna forma previa: sirve justamente para{" "}
        <strong>ver si la relaci&oacute;n es recta o no</strong>.
      </p>
      <Note>
        El <strong>grado de suavizado</strong> es la fracci&oacute;n de puntos de
        cada ventana. Con 0,5 la curva es estable; por debajo de 0,2 empieza a
        seguir el ruido. Si al bajarlo aparecen ondulaciones nuevas, son ruido,
        no estructura.
      </Note>
    </Section>

    <Section title="Qué buscar">
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>Curvatura.</strong> Una relaci&oacute;n en U pide un
          t&eacute;rmino cuadr&aacute;tico, y su correlaci&oacute;n lineal
          puede salir casi nula.
        </li>
        <li>
          <strong>Predictores correlacionados entre s&iacute;.</strong> Es{" "}
          <em>colinealidad</em>: los coeficientes de la regresi&oacute;n se
          vuelven inestables y cambian de signo al a&ntilde;adir o quitar
          t&eacute;rminos.
        </li>
        <li>
          <strong>Puntos aislados.</strong> Un solo valor alejado en X arrastra
          la recta entero.
        </li>
        <li>
          <strong>Franjas o rejillas.</strong> Se&ntilde;al de redondeo o de
          resoluci&oacute;n limitada del instrumento.
        </li>
      </ul>
      <Note>
        La correlaci&oacute;n de la tabla mide <strong>solo</strong> la parte
        recta. Un valor pr&oacute;ximo a cero no significa independencia: puede
        haber una relaci&oacute;n fuerte y sim&eacute;trica que el coeficiente no
        capta. Por eso la tabla acompa&ntilde;a al gr&aacute;fico y no lo
        sustituye.
      </Note>
    </Section>

    <Section title="Ejemplo">
      <p>
        Con las seis variables de vuelo destacan{" "}
        <strong>velocidad e ICR</strong> con r = {"\u2212"}0,849 y{" "}
        <strong>altitud y velocidad</strong> con 0,628. Que dos predictores
        est&eacute;n as&iacute; de ligados avisa de colinealidad antes de ajustar
        nada.
      </p>
      <p>
        El &aacute;ngulo de turbina apenas se relaciona con el resto, todas por
        debajo de 0,21 en valor absoluto: es la candidata a sobrar del modelo.
      </p>
    </Section>
  </div>
);

const EN = () => (
  <div className="space-y-5">
    <Section title="What it is for">
      <p>
        Before modelling anything, <strong>look at the data</strong>. A matrix
        plot shows every pair at once and exposes curvature, clustering and
        outliers that no coefficient table reveals. With <strong>k</strong>{" "}
        variables there are <strong>k(k{"\u2212"}1)/2</strong> distinct pairs —
        fifteen for six variables.
      </p>
    </Section>

    <Section title="The two layouts">
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>Matrix of plots.</strong> Everything against everything, each
          pair twice with axes swapped, names on the diagonal.
        </li>
        <li>
          <strong>Each Y versus each X.</strong> Responses and predictors kept
          apart; more compact once you know what you are explaining.
        </li>
      </ul>
    </Section>

    <Section title="Groups and smoother">
      <p>
        Colouring by category reveals what the pooled cloud hides: two
        populations with opposite slopes can produce zero overall correlation.
      </p>
      <p>
        The <strong>lowess smoother</strong> fits a line at each point using
        only its neighbours, weighted by distance, then repeats while
        downweighting badly fitted points. It assumes no shape, which is
        precisely why it can tell you whether the relationship is straight.
      </p>
      <Note>
        The <strong>degree of smoothing</strong> is the fraction of points in
        each window. At 0.5 the curve is stable; below 0.2 it starts chasing
        noise. New wiggles that appear when you lower it are noise, not
        structure.
      </Note>
    </Section>

    <Section title="What to look for">
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>Curvature</strong> — a U shape needs a quadratic term and may
          show near-zero linear correlation.
        </li>
        <li>
          <strong>Correlated predictors</strong> — collinearity makes regression
          coefficients unstable and prone to flipping sign.
        </li>
        <li>
          <strong>Isolated points</strong> — one distant X value drags the whole
          line.
        </li>
        <li>
          <strong>Stripes or grids</strong> — rounding or limited instrument
          resolution.
        </li>
      </ul>
      <Note>
        The tabulated correlation measures <strong>only</strong> the straight
        part. Near zero does not mean independent: a strong symmetric
        relationship scores about zero. The table supports the plot; it does not
        replace it.
      </Note>
    </Section>

    <Section title="Example">
      <p>
        Across the six flight variables, <strong>Flight Speed and ICR</strong>{" "}
        stand out at r = {"\u2212"}0.849, and <strong>Altitude and Flight
        Speed</strong> at 0.628 — a collinearity warning before any model is
        fitted. Turbine Angle relates to nothing, all below 0.21 in absolute
        value.
      </p>
    </Section>
  </div>
);

export default function ImpMatrixTheory() {
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
