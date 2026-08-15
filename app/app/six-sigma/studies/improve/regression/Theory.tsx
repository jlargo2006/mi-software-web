// app/app/six-sigma/studies/improve/regression/Theory.tsx
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

const ALPHA = "\u03B1";
const MINUS = "\u2212";
const SUM = "\u2211";
const HAT = "\u0302";

const FormulaModel = () => (
  <Formula>
    <V>y</V>{HAT} = <V>b</V><Sub>0</Sub> + <V>b</V><Sub>1</Sub><V>x</V> +{" "}
    <V>b</V><Sub>2</Sub><V>x</V><Sup>2</Sup> + <V>b</V><Sub>3</Sub><V>x</V>
    <Sup>3</Sup>
  </Formula>
);

const FormulaS = () => (
  <Formula>
    <V>S</V> ={" "}
    <Sqrt>
      <Frac
        num={<>SSE</>}
        den={<><V>n</V> {MINUS} <V>p</V></>}
      />
    </Sqrt>
    {"\u00a0\u00a0\u00a0"}
    <V>R</V><Sup>2</Sup> = <Frac num={<>SSR</>} den={<>SST</>} />
  </Formula>
);

const FormulaAdj = () => (
  <Formula>
    <V>R</V><Sup>2</Sup><Sub>aj</Sub> = 1 {MINUS} (1 {MINUS} <V>R</V><Sup>2</Sup>){" "}
    <Frac
      num={<><V>n</V> {MINUS} 1</>}
      den={<><V>n</V> {MINUS} <V>p</V></>}
    />
  </Formula>
);

const ES = () => (
  <div className="space-y-5">
    <Section title="Qué hace">
      <FormulaModel />
      <p>
        Ajusta una <strong>ecuaci&oacute;n</strong> que describe c&oacute;mo la
        respuesta <V>Y</V> depende del predictor <V>X</V>. A diferencia de la
        correlaci&oacute;n, que solo da un n&uacute;mero, aqu&iacute; se obtiene un
        modelo con el que <strong>predecir</strong>.
      </p>
      <p>
        Los coeficientes se eligen minimizando {SUM}(<V>y</V> {MINUS} <V>y</V>
        {HAT})<Sup>2</Sup>, la suma de los residuos al cuadrado. De ah&iacute; el
        nombre de m&iacute;nimos cuadrados.
      </p>
      <Note>
        El grado 2 y el 3 siguen siendo <strong>regresi&oacute;n lineal</strong>: lo
        que ha de ser lineal son los <em>coeficientes</em>, no la <V>x</V>. Por eso
        se resuelven con la misma maquinaria.
      </Note>
    </Section>

    <Section title="Medidas de ajuste">
      <FormulaS />
      <FormulaAdj />
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong><V>S</V></strong> es la desviaci&oacute;n t&iacute;pica de los
          residuos, <strong>en las unidades de <V>Y</V></strong>. Es la medida
          m&aacute;s directa del error t&iacute;pico de predicci&oacute;n: cuanto
          menor, mejor.
        </li>
        <li>
          <strong><V>R</V><Sup>2</Sup></strong> es la fracci&oacute;n de
          variabilidad explicada. Pero <strong>nunca baja</strong> al a&ntilde;adir
          t&eacute;rminos, aunque sean in&uacute;tiles.
        </li>
        <li>
          <strong><V>R</V><Sup>2</Sup> ajustado</strong> penaliza por cada
          coeficiente extra, y s&iacute; puede bajar. Es el que sirve para{" "}
          <strong>comparar modelos de distinto grado</strong>.
        </li>
      </ul>
      <Note>
        Si al subir de grado el <V>R</V><Sup>2</Sup> sube pero el ajustado{" "}
        <strong>baja</strong>, el t&eacute;rmino nuevo no aporta: est&aacute;s
        ajustando ruido.
      </Note>
    </Section>

    <Section title="La tabla ANOVA">
      <p>
        Descompone la variabilidad total en la que el modelo explica y la que deja
        sin explicar: SST = SSR + SSE. El estad&iacute;stico{" "}
        <V>F</V> = MSR/MSE contrasta si el modelo en conjunto sirve de algo.
      </p>
      <p>
        H{"\u2080"}: todos los coeficientes de pendiente son cero. Un{" "}
        <V>p</V> peque&ntilde;o lo rechaza.
      </p>
      <Note>
        En regresi&oacute;n simple <strong>este contraste equivale al de la
        correlaci&oacute;n</strong>: <V>F</V> = <V>t</V><Sup>2</Sup>, y el p-valor es
        el mismo. No son dos pruebas independientes.
      </Note>
    </Section>

    <Section title="La tabla secuencial">
      <p>
        Solo aparece con grado 2 o 3. Cada fila mide{" "}
        <strong>lo que su t&eacute;rmino a&ntilde;ade</strong> al modelo anterior, no
        lo que explica por s&iacute; solo.
      </p>
      <p>
        Es la herramienta correcta para decidir el grado: se sube mientras el
        t&eacute;rmino nuevo salga significativo, y se para en cuanto deje de serlo.
      </p>
      <Note>
        Cada fila se contrasta con el error del{" "}
        <strong>modelo que contiene ese t&eacute;rmino</strong>, no con el del modelo
        m&aacute;s complejo. Por eso la fila lineal puede dar un <V>F</V> distinto
        seg&uacute;n hasta d&oacute;nde llegue la tabla.
      </Note>
    </Section>

    <Section title="Intervalos de confianza y de predicción">
      <p>
        Son dos cosas distintas y se confunden a menudo:
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          El <strong>intervalo de confianza</strong> acota la{" "}
          <em>media</em> de <V>Y</V> para ese valor de <V>X</V>. Es estrecho.
        </li>
        <li>
          El <strong>intervalo de predicci&oacute;n</strong> acota una{" "}
          <em>observaci&oacute;n futura individual</em>. Es mucho m&aacute;s ancho,
          porque suma la variabilidad del propio dato a la incertidumbre del modelo.
        </li>
      </ul>
      <p>
        Ambos se estrechan en el centro de los datos y se abren hacia los extremos:
        el modelo est&aacute; mejor determinado donde m&aacute;s informaci&oacute;n
        hay.
      </p>
      <Note>
        <strong>No extrapoles.</strong> Fuera del rango observado la ecuaci&oacute;n
        no est&aacute; respaldada por nada, y con grado 2 o 3 se dispara muy
        deprisa.
      </Note>
    </Section>

    <Section title="Los cuatro gráficos de residuos">
      <p>
        El ajuste no vale de nada si los supuestos fallan. Los residuos deben ser
        independientes, de varianza constante y aproximadamente normales.
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>Normal</strong>: los puntos deben seguir la recta. Curvatura en
          forma de S delata colas pesadas.
        </li>
        <li>
          <strong>Frente a ajustados</strong>: el m&aacute;s informativo. Debe ser
          una nube sin forma. Un <strong>patr&oacute;n en U</strong> indica que falta
          curvatura, y un <strong>embudo</strong> que la varianza no es constante.
        </li>
        <li>
          <strong>Histograma</strong>: orientativo, poco fiable con pocos datos.
        </li>
        <li>
          <strong>Frente al orden</strong>: rachas o tendencia delatan
          dependencia temporal, que invalida el contraste.
        </li>
      </ul>
    </Section>

    <Section title="Ejemplo resuelto">
      <p>Trece temporadas. Modelo lineal, yardas frente a acarreos:</p>
      <p className="font-mono text-xs">
        yardas = {MINUS}163,5 + 4,916 acarreos
      </p>
      <p className="font-mono text-xs">
        <V>S</V> = 153,985 {"\u00b7"} <V>R</V><Sup>2</Sup> = 87,33% {"\u00b7"} aj =
        86,18%
      </p>
      <p className="font-mono text-xs">
        <V>F</V> = 75,85 con 1 y 11 gl {"\u00b7"} <V>p</V> = 0,000
      </p>
      <p>
        Modelo claramente &uacute;til. Cada acarreo vale unas 4,9 yardas, y el error
        t&iacute;pico de predicci&oacute;n es de <strong>154 yardas</strong>: esa es
        la cifra que dice si el modelo sirve en la pr&aacute;ctica, no el{" "}
        <V>R</V><Sup>2</Sup>.
      </p>
      <p>
        Predicci&oacute;n en 250 acarreos: {MINUS}163,497 + 4,91622 {"\u00d7"} 250 ={" "}
        <strong>1065,6 yardas</strong>, con IC (956; 1175) y IP (709; 1422). Repara
        en la diferencia de anchura entre ambos.
      </p>
      <Note>
        Ahora al rev&eacute;s, acarreos frente a yardas, subiendo de grado:
        <br />
        Lineal <V>R</V><Sup>2</Sup>aj = 86,18% {"\u2192"} cuadr&aacute;tico 92,89%{" "}
        {"\u2192"} c&uacute;bico 92,56%.
        <br />
        La secuencial lo confirma: el t&eacute;rmino cuadr&aacute;tico da{" "}
        <V>p</V> = 0,007, y el c&uacute;bico <strong><V>p</V> = 0,474</strong>. El
        modelo correcto es el <strong>cuadr&aacute;tico</strong>.
      </Note>
      <p>
        Fij&aacute;te en el detalle revelador: al pasar a c&uacute;bico el{" "}
        <V>R</V><Sup>2</Sup> sube de 94,07% a 94,42%, pero{" "}
        <strong>el ajustado baja</strong> y la <V>S</V> empeora de 21,00 a 21,48. Las
        tres se&ntilde;ales apuntan a lo mismo: ese t&eacute;rmino sobra.
      </p>
    </Section>
  </div>
);

const EN = () => (
  <div className="space-y-5">
    <Section title="What it does">
      <FormulaModel />
      <p>
        Fits an <strong>equation</strong> describing how the response <V>Y</V>{" "}
        depends on the predictor <V>X</V>. Unlike correlation, which returns a single
        number, this yields a model you can <strong>predict</strong> with, by
        minimising {SUM}(<V>y</V> {MINUS} <V>y</V>{HAT})<Sup>2</Sup>.
      </p>
      <Note>
        Quadratic and cubic are still <strong>linear regression</strong>: linearity
        refers to the <em>coefficients</em>, not to <V>x</V>.
      </Note>
    </Section>

    <Section title="Goodness of fit">
      <FormulaS />
      <FormulaAdj />
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong><V>S</V></strong> is the residual standard deviation,{" "}
          <strong>in the units of <V>Y</V></strong> — the most direct measure of
          typical prediction error.
        </li>
        <li>
          <strong><V>R</V><Sup>2</Sup></strong> <strong>never decreases</strong> when
          terms are added, useful or not.
        </li>
        <li>
          <strong>Adjusted <V>R</V><Sup>2</Sup></strong> penalises extra
          coefficients and can decrease. Use it to{" "}
          <strong>compare models of different degree</strong>.
        </li>
      </ul>
      <Note>
        If raising the degree lifts <V>R</V><Sup>2</Sup> but{" "}
        <strong>lowers</strong> the adjusted one, you are fitting noise.
      </Note>
    </Section>

    <Section title="The ANOVA table">
      <p>
        Splits total variability into explained and unexplained, SST = SSR + SSE, and{" "}
        <V>F</V> = MSR/MSE tests the model as a whole.
      </p>
      <Note>
        In simple regression this <strong>is the correlation test</strong>:{" "}
        <V>F</V> = <V>t</V><Sup>2</Sup> with the same p-value.
      </Note>
    </Section>

    <Section title="The sequential table">
      <p>
        Shown for degree 2 and 3. Each row measures{" "}
        <strong>what its term adds</strong> to the previous model. Raise the degree
        while the new term is significant, then stop.
      </p>
      <Note>
        Each row is tested against the error of{" "}
        <strong>the model containing that term</strong>, not the largest model.
      </Note>
    </Section>

    <Section title="Confidence and prediction intervals">
      <ul className="list-disc pl-5 space-y-1">
        <li>
          The <strong>confidence interval</strong> bounds the <em>mean</em> of{" "}
          <V>Y</V> at that <V>X</V>. Narrow.
        </li>
        <li>
          The <strong>prediction interval</strong> bounds a{" "}
          <em>single future observation</em>. Much wider, since it adds the data&apos;s
          own variability.
        </li>
      </ul>
      <Note>
        <strong>Do not extrapolate</strong>, especially with degree 2 or 3, where the
        curve diverges fast outside the data.
      </Note>
    </Section>

    <Section title="The four residual plots">
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>Normal plot</strong>: points should follow the line.
        </li>
        <li>
          <strong>Versus fits</strong>: the most informative. A{" "}
          <strong>U shape</strong> means missing curvature, a{" "}
          <strong>funnel</strong> means non-constant variance.
        </li>
        <li>
          <strong>Histogram</strong>: indicative only with few points.
        </li>
        <li>
          <strong>Versus order</strong>: runs or drift reveal time dependence.
        </li>
      </ul>
    </Section>

    <Section title="Worked example">
      <p>Thirteen seasons. Linear, yards on carries:</p>
      <p className="font-mono text-xs">
        yards = {MINUS}163.5 + 4.916 carries
      </p>
      <p className="font-mono text-xs">
        <V>S</V> = 153.985 {"\u00b7"} <V>R</V><Sup>2</Sup> = 87.33% {"\u00b7"} adj =
        86.18% {"\u00b7"} <V>F</V> = 75.85, <V>p</V> = 0.000
      </p>
      <p>
        Predicting at 250 carries gives <strong>1065.6 yards</strong>, CI (956;
        1175), PI (709; 1422). The typical prediction error of{" "}
        <strong>154 yards</strong> matters more than the <V>R</V><Sup>2</Sup>.
      </p>
      <Note>
        Reversing the roles and raising the degree: adjusted{" "}
        <V>R</V><Sup>2</Sup> goes 86.18% {"\u2192"} 92.89% {"\u2192"} 92.56%. The
        sequential table gives <V>p</V> = 0.007 for the quadratic term and{" "}
        <strong>0.474</strong> for the cubic. The{" "}
        <strong>quadratic</strong> model is the right one: going cubic lifts{" "}
        <V>R</V><Sup>2</Sup> to 94.42% while the adjusted value falls and{" "}
        <V>S</V> worsens from 21.00 to 21.48.
      </Note>
    </Section>
  </div>
);

export default function ImpRegTheory() {
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
