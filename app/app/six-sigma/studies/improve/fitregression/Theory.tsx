// app/app/six-sigma/studies/improve/fitregression/Theory.tsx
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
    <Section title="El modelo">
      <Formula>
        <V>y</V> = {"\u03B2"}<Sub>0</Sub> + {"\u03B2"}<Sub>1</Sub><V>x</V>
        <Sub>1</Sub> + {"\u2026"} + {"\u03B2"}<Sub>k</Sub><V>x</V><Sub>k</Sub> +{" "}
        {"\u03B5"}
      </Formula>
      <p>
        Cada coeficiente es el cambio esperado en la respuesta al subir una
        unidad ese predictor{" "}
        <strong>manteniendo los dem&aacute;s constantes</strong>. Esa
        condici&oacute;n es la clave de todo lo dem&aacute;s: si dos predictores
        se mueven juntos en los datos, <em>nunca se ha observado</em> uno
        cambiando con el otro quieto, y el coeficiente se estima a ciegas.
      </p>
    </Section>

    <Section title="VIF: el primer filtro">
      <Formula>
        VIF<Sub>j</Sub> ={" "}
        <Frac num={<>1</>} den={<>1 {"\u2212"} R<Sub>j</Sub><sup>2</sup></>} />
      </Formula>
      <p>
        R<Sub>j</Sub><sup>2</sup> es lo que explican{" "}
        <strong>los otros predictores</strong> del predictor j. Si ninguno lo
        explica, VIF = 1. Si entre ellos lo reproducen al 80 %, VIF = 5.
      </p>
      <p>
        El nombre es literal: el VIF es el factor por el que se{" "}
        <strong>multiplica la varianza</strong> del coeficiente. Con VIF = 5, su
        error t&iacute;pico es {"\u221A"}5 {"\u2248"} 2,2 veces mayor de lo que
        ser&iacute;a sin colinealidad.
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li><strong>VIF = 1</strong> {"\u2192"} sin relaci&oacute;n entre predictores.</li>
        <li><strong>VIF &gt; 1</strong> {"\u2192"} correlacionados en alg&uacute;n grado.</li>
        <li>
          <strong>VIF entre 5 y 10</strong> {"\u2192"} los coeficientes est&aacute;n{" "}
          <em>mal estimados y son inaceptables</em>.
        </li>
        <li><strong>VIF &gt; 10</strong> {"\u2192"} colinealidad severa.</li>
      </ul>
      <Warn>
        <strong>El VIF se juzga antes que el p-valor.</strong> Un error
        t&iacute;pico inflado hunde el estad&iacute;stico T y sube el p-valor, de
        modo que un t&eacute;rmino colineal puede parecer no significativo{" "}
        <em>solo</em> por la colinealidad. Podar por p-valor sin mirar el VIF
        lleva a eliminar el t&eacute;rmino equivocado.
      </Warn>
    </Section>

    <Section title="Sumas de cuadrados de tipo III">
      <p>
        La Adj SS de un t&eacute;rmino es{" "}
        <strong>cu&aacute;nto empeora el error al quitar solo ese
        t&eacute;rmino</strong>, con los dem&aacute;s dentro. Mide su
        aportaci&oacute;n <em>exclusiva</em>.
      </p>
      <Note>
        Por eso <strong>no suman</strong> la SS de la regresi&oacute;n cuando hay
        correlaci&oacute;n: la parte compartida no se asigna a nadie. En el
        modelo de tres t&eacute;rminos del ejemplo, ICR sola tiene 64070 mientras
        que la regresi&oacute;n entera es 66665. No es un error: es solapamiento.
      </Note>
      <p>
        Con un grado de libertad, el contraste F del t&eacute;rmino y su
        contraste T son el mismo: F = T<sup>2</sup>, y los p-valores coinciden.
      </p>
    </Section>

    <Section title="Los tres R-cuadrado">
      <p>
        <strong>R-sq</strong> nunca baja al a&ntilde;adir t&eacute;rminos, as&iacute;
        que no sirve para decidir. <strong>R-sq(adj)</strong> cobra por cada
        grado de libertad. <strong>R-sq(pred)</strong> deja fuera cada
        observaci&oacute;n y la predice con el modelo ajustado sin ella: es el
        &uacute;nico que <em>baja</em> cuando el modelo se aprende el ruido.
      </p>
      <Note>
        Vigila la <strong>distancia entre adj y pred</strong>. Si se abre, el
        modelo depende de observaciones concretas. En el ejemplo, el modelo
        completo tiene 87,69 y 78,82, casi nueve puntos; el final, 84,84 y 81,45,
        apenas tres. El peque&ntilde;o es m&aacute;s honesto.
      </Note>
    </Section>

    <Section title="Observaciones inusuales">
      <Formula>
        Std Resid<Sub>i</Sub> ={" "}
        <Frac
          num={<><V>e</V><Sub>i</Sub></>}
          den={<><V>s</V> {"\u221A"}(1 {"\u2212"} <V>h</V><Sub>i</Sub>)</>}
        />
      </Formula>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>R</strong>, residuo grande: el modelo falla ah&iacute;, con
          |Std Resid| &gt; 2.
        </li>
        <li>
          <strong>X</strong>, X inusual: la <em>palanca</em> h supera 3p/n. Esa
          fila est&aacute; lejos del centro del espacio de predictores y{" "}
          <strong>arrastra el ajuste</strong>, aunque su residuo parezca
          peque&ntilde;o.
        </li>
      </ul>
      <Note>
        Una <strong>X</strong> preocupa m&aacute;s que una <strong>R</strong>. El
        residuo grande se ve; la palanca alta se esconde, porque la
        observaci&oacute;n tira del ajuste hasta pasar cerca de s&iacute; misma.
        Nunca borres una fila por salir marcada: primero comprueba si el dato es
        v&aacute;lido.
      </Note>
    </Section>

    <Section title="Los gráficos de residuos">
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>Probabilidad normal.</strong> Puntos sobre la recta, residuos
          normales; forma de S, colas mal ajustadas.
        </li>
        <li>
          <strong>Frente a ajustados.</strong> El m&aacute;s informativo. Un{" "}
          <em>embudo</em> indica varianza creciente; una <em>curva</em>, que
          falta un t&eacute;rmino cuadr&aacute;tico.
        </li>
        <li>
          <strong>Histograma.</strong> Con pocos datos enga&ntilde;a;
          &uacute;salo solo para asimetr&iacute;as claras.
        </li>
        <li>
          <strong>Frente al orden.</strong> Rachas o deriva delatan que algo
          cambi&oacute; durante la toma de datos.
        </li>
      </ul>
    </Section>

    <Section title="La depuración, paso a paso">
      <table className="text-xs border-collapse">
        <thead>
          <tr className="border-b border-gray-300">
            <th className="py-1 pr-4 text-left font-medium text-gray-600">Modelo</th>
            <th className="py-1 pr-4 text-left font-medium text-gray-600">Se retira</th>
            <th className="py-1 pr-4 text-left font-medium text-gray-600">Motivo</th>
            <th className="py-1 pr-4 text-left font-medium text-gray-600">adj</th>
            <th className="py-1 text-left font-medium text-gray-600">pred</th>
          </tr>
        </thead>
        <tbody>
          {[
            ["5 terminos", "Temp", "VIF 5,37", "87,69", "78,82"],
            ["4 terminos", "Altitude", "p 0,067", "87,31", "80,68"],
            ["3 terminos", "Turbine Angle", "p 0,093", "85,95", "79,05"],
            ["2 terminos", "\u2014", "todo significativo", "84,84", "81,45"],
          ].map((row) => (
            <tr key={row[0]} className="border-b border-gray-200">
              {row.map((c, i) => (
                <td key={i} className={i < 4 ? "py-1 pr-4" : "py-1"}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2">
        Fue <strong>Temp</strong> quien inflaba los dem&aacute;s VIF. Al
        retirarla, el de Fuel/Air ratio cae de 3,17 a 1,21 y su p-valor pasa de
        0,016 a 0,000: el t&eacute;rmino <em>gana</em> significaci&oacute;n al
        quitar otro.
      </p>
      <Note>
        <strong>Un t&eacute;rmino cada vez</strong>, porque todo se recalcula.
        Y f&iacute;jate en el balance: se pierden 2,85 puntos de R-sq(adj) pero
        se <strong>ganan</strong> 2,63 de R-sq(pred). El modelo de dos
        t&eacute;rminos predice mejor con tres mediciones menos.
      </Note>
    </Section>

    <Section title="Cautelas">
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>Los p-valores del modelo final son optimistas.</strong> Se ha
          llegado a &eacute;l mirando los datos, y esa b&uacute;squeda no entra
          en el c&aacute;lculo.
        </li>
        <li>
          <strong>Correlaci&oacute;n no es causa</strong>, salvo que los datos
          vengan de un experimento dise&ntilde;ado.
        </li>
        <li>
          <strong>No extrapoles</strong> fuera del rango observado.
        </li>
        <li>
          <strong>El criterio t&eacute;cnico manda.</strong> Un t&eacute;rmino
          con sentido f&iacute;sico y p = 0,06 puede merecer quedarse; uno
          absurdo con p = 0,001 merece sospecha.
        </li>
      </ul>
    </Section>
  </div>
);

const EN = () => (
  <div className="space-y-5">
    <Section title="The model">
      <Formula>
        <V>y</V> = {"\u03B2"}<Sub>0</Sub> + {"\u03B2"}<Sub>1</Sub><V>x</V>
        <Sub>1</Sub> + {"\u2026"} + {"\u03B2"}<Sub>k</Sub><V>x</V><Sub>k</Sub> +{" "}
        {"\u03B5"}
      </Formula>
      <p>
        Each coefficient is the expected change in the response per unit of that
        predictor <strong>with the others held constant</strong>. If two
        predictors move together in the data, that situation was never observed
        and the coefficient is estimated blind.
      </p>
    </Section>

    <Section title="VIF: the first filter">
      <Formula>
        VIF<Sub>j</Sub> ={" "}
        <Frac num={<>1</>} den={<>1 {"\u2212"} R<Sub>j</Sub><sup>2</sup></>} />
      </Formula>
      <p>
        R<Sub>j</Sub><sup>2</sup> is how well{" "}
        <strong>the other predictors</strong> explain predictor j. The VIF is
        literally the factor by which the coefficient variance is multiplied: at
        VIF = 5 the standard error is {"\u221A"}5 {"\u2248"} 2.2 times larger
        than it would otherwise be.
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li><strong>VIF = 1</strong> — no relation among predictors.</li>
        <li><strong>VIF &gt; 1</strong> — correlated to some degree.</li>
        <li>
          <strong>VIF between 5 and 10</strong> — coefficients are{" "}
          <em>poorly estimated and unacceptable</em>.
        </li>
        <li><strong>VIF &gt; 10</strong> — severe collinearity.</li>
      </ul>
      <Warn>
        <strong>Judge the VIF before the p-value.</strong> An inflated standard
        error sinks the T statistic and raises the p-value, so a collinear term
        can look insignificant <em>because</em> of the collinearity. Pruning on
        p-values alone removes the wrong term.
      </Warn>
    </Section>

    <Section title="Type III sums of squares">
      <p>
        A term's Adj SS is how much the error grows when{" "}
        <strong>that term alone</strong> is dropped, the others staying in. It
        measures its exclusive contribution.
      </p>
      <Note>
        That is why they <strong>do not add up</strong> to the regression sum of
        squares under correlation: the shared part is credited to nobody. With
        one degree of freedom the F and T tests are identical, F = T<sup>2</sup>.
      </Note>
    </Section>

    <Section title="The three R-squared">
      <p>
        <strong>R-sq</strong> never falls, so it decides nothing.{" "}
        <strong>R-sq(adj)</strong> charges for degrees of freedom.{" "}
        <strong>R-sq(pred)</strong> predicts each observation from a model fitted
        without it, and is the only one that drops when the model learns noise.
      </p>
      <Note>
        Watch the <strong>gap</strong> between adj and pred. The five-term model
        shows 87.69 against 78.82, nearly nine points; the final model, 84.84
        against 81.45. The small model is the honest one.
      </Note>
    </Section>

    <Section title="Unusual observations">
      <Formula>
        Std Resid<Sub>i</Sub> ={" "}
        <Frac
          num={<><V>e</V><Sub>i</Sub></>}
          den={<><V>s</V> {"\u221A"}(1 {"\u2212"} <V>h</V><Sub>i</Sub>)</>}
        />
      </Formula>
      <p>
        <strong>R</strong> flags |Std Resid| &gt; 2. <strong>X</strong> flags
        leverage above 3p/n: that row sits far from the centre of the predictor
        space and <strong>drags the fit</strong> towards itself.
      </p>
      <Note>
        An <strong>X</strong> worries more than an <strong>R</strong>. A large
        residual is visible; high leverage hides, because the point pulls the fit
        until it passes close by. Never delete a flagged row on the strength of
        the flag alone.
      </Note>
    </Section>

    <Section title="Reading the residual plots">
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>Normal probability.</strong> On the line, normal residuals; an
          S shape means bad tails.
        </li>
        <li>
          <strong>Versus fits.</strong> The most useful. A funnel means changing
          variance; a curve means a missing quadratic term.
        </li>
        <li>
          <strong>Histogram.</strong> Misleading with few points; use it only for
          obvious skew.
        </li>
        <li>
          <strong>Versus order.</strong> Runs or drift betray that something
          changed during collection.
        </li>
      </ul>
    </Section>

    <Section title="Pruning, step by step">
      <p>
        The flight speed example runs through four models: <strong>Temp</strong>{" "}
        goes on VIF 5.37, <strong>Altitude</strong> on p = 0.067,{" "}
        <strong>Turbine Angle</strong> on p = 0.093.
      </p>
      <Note>
        Temp was inflating the other VIFs. Once removed, Fuel/Air ratio falls
        from 3.17 to 1.21 and its p-value from 0.016 to 0.000: a term{" "}
        <em>gains</em> significance when another leaves. Overall, 2.85 points of
        R-sq(adj) are lost and 2.63 of R-sq(pred) are <strong>gained</strong> —
        better prediction from three fewer measurements.
      </Note>
    </Section>

    <Section title="Cautions">
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>The final p-values are optimistic.</strong> The model was
          reached by looking at the data.
        </li>
        <li>
          <strong>Correlation is not cause</strong> unless the data come from a
          designed experiment.
        </li>
        <li><strong>Do not extrapolate</strong> beyond the observed range.</li>
        <li>
          <strong>Engineering judgement rules.</strong> A physically meaningful
          term at p = 0.06 may deserve to stay.
        </li>
      </ul>
    </Section>
  </div>
);

export default function ImpFitRegTheory() {
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
