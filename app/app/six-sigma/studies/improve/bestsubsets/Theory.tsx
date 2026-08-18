// app/app/six-sigma/studies/improve/bestsubsets/Theory.tsx
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

const ES = () => (
  <div className="space-y-5">
    <Section title="Para qué sirve">
      <p>
        Con <strong>k</strong> predictores hay{" "}
        <strong>2<sup>k</sup> {"\u2212"} 1</strong> modelos posibles: 31 con
        cinco, 1023 con diez. Esta herramienta los ajusta{" "}
        <strong>todos</strong> y muestra los mejores de cada tama&ntilde;o.
      </p>
      <p>
        Frente a los m&eacute;todos por pasos, que recorren un solo camino y
        pueden dejar atr&aacute;s el modelo bueno,{" "}
        <strong>aqu&iacute; no se pierde ninguno</strong>. El precio es que hay
        que decidir a mano cu&aacute;l elegir.
      </p>
    </Section>

    <Section title="Los cuatro criterios">
      <p>
        <strong>R-Sq</strong> es la fracci&oacute;n de variabilidad explicada.
        Solo sirve para comparar modelos <em>del mismo tama&ntilde;o</em>: al
        a&ntilde;adir cualquier t&eacute;rmino, aunque sea ruido puro,{" "}
        <strong>nunca baja</strong>.
      </p>
      <Formula>
        R<Sub>adj</Sub><sup>2</sup> = 1 {"\u2212"}{" "}
        <Frac
          num={<>SSE / (<V>n</V> {"\u2212"} <V>p</V>)</>}
          den={<>SST / (<V>n</V> {"\u2212"} 1)</>}
        />
      </Formula>
      <p>
        <strong>R-Sq(adj)</strong> penaliza los t&eacute;rminos: baja si el
        nuevo no compensa el grado de libertad que consume. Ya permite comparar
        modelos de distinto tama&ntilde;o.
      </p>
      <Formula>
        R<Sub>pred</Sub><sup>2</sup> = 1 {"\u2212"}{" "}
        <Frac num={<>PRESS</>} den={<>SST</>} />
        {"\u00a0\u00a0\u00a0"}PRESS = {"\u2211"}{" "}
        <span className="text-lg">(</span>
        <Frac
          num={<><V>e</V><Sub>i</Sub></>}
          den={<>1 {"\u2212"} <V>h</V><Sub>i</Sub></>}
        />
        <span className="text-lg">)</span>
        <sup>2</sup>
      </Formula>
      <p>
        <strong>R-Sq(pred)</strong> es el m&aacute;s exigente: mide c&oacute;mo
        predice cada observaci&oacute;n{" "}
        <strong>un modelo ajustado sin ella</strong>. Es el &uacute;nico que{" "}
        <em>puede bajar y hasta salir negativo</em> cuando el modelo se ha
        aprendido el ruido de la muestra.
      </p>
      <Formula>
        <V>C</V><Sub>p</Sub> ={" "}
        <Frac num={<>SSE<Sub>p</Sub></>} den={<>MSE<Sub>completo</Sub></>} />{" "}
        {"\u2212"} (<V>n</V> {"\u2212"} 2<V>p</V>)
      </Formula>
      <p>
        <strong>Mallows Cp</strong> compara con el modelo completo. Si el
        subconjunto no ha dejado fuera nada importante, su valor esperado es{" "}
        <strong>{"\u2248"} p</strong>, el n&uacute;mero de par&aacute;metros con
        el intercepto. Muy por encima de p indica{" "}
        <strong>sesgo</strong>: falta algo.
      </p>
      <Note>
        <strong>La regla pr&aacute;ctica:</strong> busca modelos con{" "}
        <strong>Cp peque&ntilde;o y pr&oacute;ximo a p</strong>. El modelo
        completo siempre da Cp = p exactamente, as&iacute; que ese caso no
        informa de nada.
      </Note>
    </Section>

    <Section title="Cómo se lee la tabla">
      <p>
        Cada fila es un modelo; las <strong>X</strong> de la derecha dicen
        qu&eacute; predictores lleva. Dentro de cada tama&ntilde;o los modelos
        se ordenan por R-Sq.
      </p>
      <p>
        La lectura &uacute;til es <strong>vertical</strong>: mira d&oacute;nde
        deja de mejorar R-Sq(adj) y, sobre todo, d&oacute;nde{" "}
        <strong>R-Sq(pred) se da la vuelta</strong>. Ese giro es la se&ntilde;al
        de sobreajuste.
      </p>
      <Note>
        Un predictor que aparece en <strong>todos</strong> los mejores modelos
        es s&oacute;lido. Uno que entra y sale seg&uacute;n el tama&ntilde;o
        est&aacute; compitiendo con otro correlacionado con &eacute;l.
      </Note>
    </Section>

    <Section title="Advertencias">
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>Los p-valores del modelo elegido mienten.</strong> Se ha
          seleccionado entre decenas de candidatos, y esa b&uacute;squeda no
          entra en el c&aacute;lculo. Los intervalos saldr&aacute;n demasiado
          estrechos.
        </li>
        <li>
          <strong>Todas las filas han de estar completas.</strong> Si falta un
          valor en cualquier predictor, la fila se descarta entera: los modelos
          han de compararse sobre los mismos datos.
        </li>
        <li>
          <strong>No sustituye al criterio t&eacute;cnico.</strong> Un
          predictor caro de medir que aporta dos d&eacute;cimas de R-Sq(adj) no
          merece estar. La tabla no sabe lo que cuesta cada variable.
        </li>
        <li>
          <strong>Verifica siempre el modelo elegido</strong> con una
          regresi&oacute;n completa y sus gr&aacute;ficos de residuos.
        </li>
      </ul>
    </Section>

    <Section title="Ejemplo resuelto">
      <p>
        Velocidad de vuelo frente a cinco predictores, 29 observaciones y 31
        modelos:
      </p>
      <table className="text-xs border-collapse">
        <thead>
          <tr className="border-b border-gray-300">
            <th className="py-1 pr-4 text-left font-medium text-gray-600">
              Vars
            </th>
            <th className="py-1 pr-4 text-left font-medium text-gray-600">
              R-Sq
            </th>
            <th className="py-1 pr-4 text-left font-medium text-gray-600">
              R-Sq(adj)
            </th>
            <th className="py-1 pr-4 text-left font-medium text-gray-600">
              R-Sq(pred)
            </th>
            <th className="py-1 text-left font-medium text-gray-600">Cp</th>
          </tr>
        </thead>
        <tbody>
          {[
            ["1", "72,1", "71,1", "67,0", "38,4"],
            ["2", "85,9", "84,8", "81,5", "9,0"],
            ["3", "87,5", "85,9", "79,0", "7,5"],
            ["4", "89,1", "87,3", "80,7", "5,7"],
            ["5", "89,9", "87,7", "78,8", "6,0"],
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
        R-Sq sube siempre, de 72,1 a 89,9. Pero{" "}
        <strong>R-Sq(pred) alcanza su m&aacute;ximo en dos variables</strong>{" "}
        con 81,5 y desde ah&iacute; oscila a la baja hasta 78,8. El quinto
        t&eacute;rmino <em>empeora</em> la capacidad predictiva.
      </p>
      <Note>
        El modelo de <strong>dos variables</strong> tiene Cp = 9,0 frente a p =
        3: hay sesgo, falta algo. El de <strong>cuatro</strong> da Cp = 5,7
        frente a p = 5, el primero que baja de su propio p, y es el que la
        herramienta sugiere.
      </Note>
      <p>
        Ahora bien: pasar de dos a cuatro variables cuesta dos mediciones
        m&aacute;s y gana 2,5 puntos de R-Sq(adj), mientras que{" "}
        <strong>pierde 0,8 de R-Sq(pred)</strong>. Con datos as&iacute;, el
        modelo de dos t&eacute;rminos es defendible, y probablemente el que
        elegir&iacute;a un ingeniero. La tabla informa; decidir es tuyo.
      </p>
    </Section>
  </div>
);

const EN = () => (
  <div className="space-y-5">
    <Section title="What it is for">
      <p>
        With <strong>k</strong> predictors there are{" "}
        <strong>2<sup>k</sup> {"\u2212"} 1</strong> possible models — 31 for
        five, 1023 for ten. This tool fits <strong>all of them</strong> and
        reports the best of each size. Unlike stepwise methods, which follow a
        single path and can walk past the good model, nothing is missed.
      </p>
    </Section>

    <Section title="The four criteria">
      <p>
        <strong>R-Sq</strong> never falls when a term is added, so it only
        compares models of equal size.
      </p>
      <Formula>
        R<Sub>adj</Sub><sup>2</sup> = 1 {"\u2212"}{" "}
        <Frac
          num={<>SSE / (<V>n</V> {"\u2212"} <V>p</V>)</>}
          den={<>SST / (<V>n</V> {"\u2212"} 1)</>}
        />
      </Formula>
      <p>
        <strong>R-Sq(adj)</strong> charges for each term and can therefore
        compare sizes.
      </p>
      <Formula>
        R<Sub>pred</Sub><sup>2</sup> = 1 {"\u2212"}{" "}
        <Frac num={<>PRESS</>} den={<>SST</>} />
      </Formula>
      <p>
        <strong>R-Sq(pred)</strong> measures how each observation is predicted
        by a model fitted <strong>without it</strong>. It is the only one that
        can fall, and even go negative, once the model starts learning noise.
      </p>
      <Formula>
        <V>C</V><Sub>p</Sub> ={" "}
        <Frac num={<>SSE<Sub>p</Sub></>} den={<>MSE<Sub>full</Sub></>} />{" "}
        {"\u2212"} (<V>n</V> {"\u2212"} 2<V>p</V>)
      </Formula>
      <p>
        <strong>Mallows Cp</strong> has expected value <strong>{"\u2248"} p</strong>{" "}
        for an unbiased subset. Well above p means something important is
        missing.
      </p>
      <Note>
        Look for <strong>small Cp close to p</strong>. The full model always
        gives exactly Cp = p, so that row carries no information.
      </Note>
    </Section>

    <Section title="Reading the table">
      <p>
        Each row is a model and the <strong>X</strong> marks show its
        predictors. Read <strong>down</strong> the columns: find where
        R-Sq(adj) stops improving and, above all, where{" "}
        <strong>R-Sq(pred) turns down</strong>. That turn is overfitting.
      </p>
      <Note>
        A predictor present in every best model is solid. One that comes and
        goes is competing with something correlated with it.
      </Note>
    </Section>

    <Section title="Warnings">
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>The p-values of the chosen model are optimistic.</strong> It
          won a contest among dozens, and that search is not in the arithmetic.
        </li>
        <li>
          <strong>Rows must be complete.</strong> Any missing predictor value
          drops the whole row, so all models share the same data.
        </li>
        <li>
          <strong>Engineering judgement still decides.</strong> The table does
          not know what each variable costs to measure.
        </li>
        <li>
          <strong>Always verify</strong> the chosen model with a full
          regression and its residual plots.
        </li>
      </ul>
    </Section>

    <Section title="Worked example">
      <p>
        Flight speed on five predictors, 29 observations, 31 models. R-Sq climbs
        from 72.1 to 89.9, but <strong>R-Sq(pred) peaks at two variables</strong>{" "}
        with 81.5 and drifts down to 78.8. The fifth term makes prediction{" "}
        <em>worse</em>.
      </p>
      <Note>
        The four-variable model is the first with Cp (5.7) below its own p (5),
        and is the one suggested. Yet moving from two to four costs two extra
        measurements, gains 2.5 points of R-Sq(adj) and{" "}
        <strong>loses 0.8 of R-Sq(pred)</strong>. The two-term model is
        defensible. The table informs; you decide.
      </Note>
    </Section>
  </div>
);

export default function ImpSubsetsTheory() {
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
