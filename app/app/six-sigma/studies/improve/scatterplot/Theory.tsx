// app/app/six-sigma/studies/improve/scatterplot/Theory.tsx
"use client";
import React, { useState } from "react";

type Lang = "es" | "en";

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

const MINUS = "\u2212";
const SUM = "\u2211";
const HAT = "\u0302";

const ES = () => (
  <div className="space-y-5">
    <Section title="Para qué sirve">
      <p>
        Muestra la relaci&oacute;n entre dos variables continuas: cada punto es una
        observaci&oacute;n con su par (<V>x</V>, <V>y</V>). Es{" "}
        <strong>el primer paso obligatorio</strong> antes de calcular cualquier
        correlaci&oacute;n o ajustar una regresi&oacute;n.
      </p>
      <p>
        Por convenci&oacute;n, <V>Y</V> es la respuesta y <V>X</V> el predictor o
        la variable que se controla.
      </p>
      <Note>
        El gr&aacute;fico <strong>no demuestra causalidad</strong>. Una relaci&oacute;n
        clara puede deberse a una tercera variable que influya en ambas.
      </Note>
    </Section>

    <Section title="Qué buscar">
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>Direcci&oacute;n</strong>: creciente, decreciente o sin tendencia.
        </li>
        <li>
          <strong>Forma</strong>: lineal o curva. Una relaci&oacute;n curva fuerte
          puede dar una correlaci&oacute;n pr&oacute;xima a cero.
        </li>
        <li>
          <strong>Dispersi&oacute;n</strong>: cu&aacute;nto se separan los puntos de
          la tendencia. Si el ancho crece con <V>x</V>, hay heterocedasticidad y la
          regresi&oacute;n simple queda comprometida.
        </li>
        <li>
          <strong>At&iacute;picos</strong>: puntos alejados. Los alejados en <V>x</V>{" "}
          son los m&aacute;s peligrosos, porque arrastran la recta.
        </li>
        <li>
          <strong>Agrupamientos</strong>: c&uacute;mulos separados suelen delatar una
          variable de grupo no considerada.
        </li>
      </ul>
    </Section>

    <Section title="Las seis variantes">
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>Simple</strong>: solo los puntos. El punto de partida.
        </li>
        <li>
          <strong>With Groups</strong>: color y s&iacute;mbolo por categor&iacute;a.
          Revela si la relaci&oacute;n cambia entre grupos o si un grupo explica un
          c&uacute;mulo aparte.
        </li>
        <li>
          <strong>With Regression</strong>: a&ntilde;ade la recta de m&iacute;nimos
          cuadrados. &Uacute;sala solo si los puntos ya parecen lineales.
        </li>
        <li>
          <strong>With Regression and Groups</strong>: una recta por grupo. Si las
          pendientes difieren mucho, existe <strong>interacci&oacute;n</strong>: el
          efecto de <V>X</V> depende del grupo.
        </li>
        <li>
          <strong>With Connect Line</strong>: une los puntos en orden de <V>x</V>. No
          es un ajuste, es un recorrido: sirve para series ordenadas o para seguir la
          secuencia.
        </li>
        <li>
          <strong>With Connect and Groups</strong>: un recorrido por grupo, &uacute;til
          para perfiles o trayectorias.
        </li>
      </ul>
      <Note>
        No confundas la <strong>l&iacute;nea de uni&oacute;n</strong> con la recta de
        regresi&oacute;n. La primera pasa por todos los puntos y sube y baja; la
        segunda es un &uacute;nico segmento recto.
      </Note>
    </Section>

    <Section title="La recta de mínimos cuadrados">
      <Formula>
        <V>y</V>{HAT} = <V>b</V><Sub>0</Sub> + <V>b</V><Sub>1</Sub><V>x</V>
        {"\u00a0\u00a0\u00a0"}con{"\u00a0\u00a0"}<V>b</V><Sub>1</Sub> ={" "}
        <V>S</V><Sub><V>xy</V></Sub> / <V>S</V><Sub><V>xx</V></Sub>
      </Formula>
      <p>
        Minimiza la suma de los residuos al cuadrado, {SUM}(<V>y</V> {MINUS}{" "}
        <V>y</V>{HAT})<Sup>2</Sup>. El <V>R</V><Sup>2</Sup> es la proporci&oacute;n
        de variabilidad de <V>Y</V> que la recta explica, y en regresi&oacute;n simple
        coincide con <V>r</V><Sup>2</Sup>.
      </p>
      <Note>
        La recta se traza <strong>solo dentro del rango observado</strong>. Extrapolar
        fuera de &eacute;l no est&aacute; respaldado por los datos.
      </Note>
    </Section>

    <Section title="Ejemplo resuelto">
      <p>Trece temporadas, acarreos frente a yardas:</p>
      <p className="font-mono text-xs">
        <V>n</V> = 13 {"\u00b7"} media de <V>x</V> = 295,23 {"\u00b7"} media de{" "}
        <V>y</V> = 1287,92
      </p>
      <p className="font-mono text-xs">
        yardas{HAT} = {MINUS}163,50 + 4,9162 {"\u00b7"} acarreos
      </p>
      <p className="font-mono text-xs">
        <V>r</V> = 0,9345 {"\u00b7"} <V>R</V><Sup>2</Sup> = 87,3% {"\u00b7"}{" "}
        <V>S</V> = 153,99
      </p>
      <p>
        Relaci&oacute;n positiva y fuerte: cada acarreo adicional supone unas{" "}
        <strong>4,9 yardas</strong> m&aacute;s. El 87,3% de la variabilidad en yardas
        queda explicado.
      </p>
      <Note>
        Dos detalles que el gr&aacute;fico revela y el <V>r</V> esconde. Con 339
        acarreos hay <strong>dos temporadas muy dispares</strong>, 1852 y 1222 yardas:
        mismo <V>x</V>, casi 630 yardas de diferencia. Y las dos temporadas cortas
        (146 y 148 acarreos) est&aacute;n aisladas a la izquierda:{" "}
        <strong>sostienen buena parte del ajuste</strong>. Sin ellas la relaci&oacute;n
        se debilitar&iacute;a mucho.
      </Note>
      <p>
        La interseccion, {MINUS}163,50 yardas para cero acarreos, no tiene sentido
        f&iacute;sico: es lo normal cuando <V>x</V> = 0 queda lejos de los datos.
      </p>
    </Section>
  </div>
);

const EN = () => (
  <div className="space-y-5">
    <Section title="What it is for">
      <p>
        Displays the relationship between two continuous variables, one point per
        observation. It is the <strong>mandatory first step</strong> before computing
        any correlation or fitting a regression. By convention <V>Y</V> is the
        response and <V>X</V> the predictor.
      </p>
      <Note>
        The plot <strong>does not prove causation</strong>: a third variable may drive
        both.
      </Note>
    </Section>

    <Section title="What to look for">
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>Direction</strong>: rising, falling or flat.
        </li>
        <li>
          <strong>Shape</strong>: linear or curved. A strong curve can yield a
          correlation near zero.
        </li>
        <li>
          <strong>Spread</strong>: widening scatter means heteroscedasticity.
        </li>
        <li>
          <strong>Outliers</strong>: those extreme in <V>X</V> are the most
          influential on the line.
        </li>
        <li>
          <strong>Clusters</strong>: separate clumps usually reveal a missing
          grouping variable.
        </li>
      </ul>
    </Section>

    <Section title="The six variants">
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>Simple</strong>: points only.
        </li>
        <li>
          <strong>With Groups</strong>: colour and symbol per category.
        </li>
        <li>
          <strong>With Regression</strong>: adds the least-squares line.
        </li>
        <li>
          <strong>With Regression and Groups</strong>: one line per group; differing
          slopes indicate <strong>interaction</strong>.
        </li>
        <li>
          <strong>With Connect Line</strong>: joins points in <V>x</V> order — a path,
          not a fit.
        </li>
        <li>
          <strong>With Connect and Groups</strong>: one path per group, useful for
          profiles.
        </li>
      </ul>
      <Note>
        Do not confuse the <strong>connect line</strong>, which passes through every
        point, with the straight regression line.
      </Note>
    </Section>

    <Section title="The least-squares line">
      <Formula>
        <V>y</V>{HAT} = <V>b</V><Sub>0</Sub> + <V>b</V><Sub>1</Sub><V>x</V>
        {"\u00a0\u00a0\u00a0"}with{"\u00a0\u00a0"}<V>b</V><Sub>1</Sub> ={" "}
        <V>S</V><Sub><V>xy</V></Sub> / <V>S</V><Sub><V>xx</V></Sub>
      </Formula>
      <p>
        It minimises {SUM}(<V>y</V> {MINUS} <V>y</V>{HAT})<Sup>2</Sup>.{" "}
        <V>R</V><Sup>2</Sup> is the share of variability in <V>Y</V> explained, equal
        to <V>r</V><Sup>2</Sup> in simple regression. The line is drawn{" "}
        <strong>only within the observed range</strong>.
      </p>
    </Section>

    <Section title="Worked example">
      <p>Thirteen seasons, carries against yards:</p>
      <p className="font-mono text-xs">
        <V>n</V> = 13 {"\u00b7"} yards{HAT} = {MINUS}163.50 + 4.9162 {"\u00b7"} carries
      </p>
      <p className="font-mono text-xs">
        <V>r</V> = 0.9345 {"\u00b7"} <V>R</V><Sup>2</Sup> = 87.3% {"\u00b7"}{" "}
        <V>S</V> = 153.99
      </p>
      <p>
        Strong positive relationship: roughly <strong>4.9 extra yards</strong> per
        carry, explaining 87.3% of the variability.
      </p>
      <Note>
        Two things the plot shows and <V>r</V> hides. At 339 carries{" "}
        <strong>two seasons differ by nearly 630 yards</strong> (1852 against 1222),
        and the two short seasons at 146 and 148 carries sit alone on the left,{" "}
        <strong>carrying much of the fit</strong>.
      </Note>
    </Section>
  </div>
);

export default function ImpScatterTheory() {
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
