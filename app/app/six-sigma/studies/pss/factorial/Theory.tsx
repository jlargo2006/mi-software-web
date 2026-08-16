// app/app/six-sigma/studies/pss/factorial/Theory.tsx
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
    <Section title="Para qué sirve">
      <p>
        Se calcula <strong>antes</strong> de correr el experimento. Responde a la
        pregunta que decide el presupuesto: cu&aacute;ntas corridas hacen falta
        para tener una posibilidad razonable de detectar el efecto que te
        importa.
      </p>
      <p>
        La <strong>potencia</strong> es la probabilidad de declarar significativo
        un efecto <em>que realmente existe</em>. Su complemento, 1 {"\u2212"}{" "}
        potencia, es el riesgo de gastar el experimento entero y volver con las
        manos vac&iacute;as habiendo un efecto real ah&iacute; delante.
      </p>
      <Warn>
        Con potencia 0,50 y un efecto real presente, el experimento{" "}
        <strong>falla la mitad de las veces</strong>. Es tirar una moneda con
        todo el coste del ensayo ya pagado.
      </Warn>
    </Section>

    <Section title="Las cuatro piezas">
      <p>Est&aacute;n atadas entre s&iacute;: fijadas tres, la cuarta sale sola.</p>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>Efecto.</strong> La diferencia que quieres poder ver, en las
          unidades de la respuesta. En un factorial de dos niveles es{" "}
          <em>la media en el nivel alto menos la media en el bajo</em>.
        </li>
        <li>
          <strong>Desviaci&oacute;n t&iacute;pica.</strong> El ruido del proceso.
        </li>
        <li>
          <strong>Corridas.</strong> Puntos de esquina {"\u00d7"} r&eacute;plicas.
        </li>
        <li>
          <strong>Alfa.</strong> El riesgo de dar por bueno un efecto que no
          existe, normalmente 0,05.
        </li>
      </ul>
      <Note>
        Lo que manda no es el efecto en bruto sino{" "}
        <strong>el efecto dividido por la desviaci&oacute;n t&iacute;pica</strong>
        . Detectar 2 con ruido 1 es igual de f&aacute;cil que detectar 200 con
        ruido 100.
      </Note>
    </Section>

    <Section title="Cómo se calcula">
      <p>El efecto se estima como diferencia de dos medias, y su error t&iacute;pico es:</p>
      <Formula>
        SE(efecto) ={" "}
        <Frac
          num={<>2{"\u03C3"}</>}
          den={
            <>
              {"\u221A"}<V>N</V><Sub>esquinas</Sub>
            </>
          }
        />
        {"\u00a0\u00a0\u00a0\u00a0"}
        {"\u03BB"} ={" "}
        <Frac
          num={
            <>
              |efecto| {"\u00b7"} {"\u221A"}<V>N</V><Sub>esquinas</Sub>
            </>
          }
          den={<>2{"\u03C3"}</>}
        />
      </Formula>
      <p>
        Ese {"\u03BB"} es el <strong>par&aacute;metro de no centralidad</strong>:
        cu&aacute;ntos errores t&iacute;picos separan el efecto real del cero. La
        potencia sale de la <em>t no central</em> con {"\u03BB"} y los grados de
        libertad del error.
      </p>
      <Formula>
        gl<Sub>error</Sub> = <V>N</V><Sub>total</Sub> {"\u2212"} t&eacute;rminos{" "}
        {"\u2212"} (bloques {"\u2212"} 1) {"\u2212"} [1 si hay puntos centrales]
      </Formula>
      <Warn>
        Fíjate en que {"\u03BB"} usa{" "}
        <strong>solo las corridas de las esquinas</strong>. Los puntos centrales
        no aportan nada a la estimaci&oacute;n de un efecto: est&aacute;n a mitad
        de camino en todos los factores, as&iacute; que no ayudan a distinguir el
        nivel alto del bajo. Solo suman grados de libertad al error.
      </Warn>
    </Section>

    <Section title="El diseño saturado">
      <p>
        Un factorial completo con <strong>una sola r&eacute;plica</strong> y
        todos los t&eacute;rminos en el modelo gasta{" "}
        <em>exactamente todas</em> sus corridas en estimar par&aacute;metros: 8
        corridas para 8 t&eacute;rminos. No queda ni un grado de libertad para el
        error, no hay con qu&eacute; comparar, y la potencia no existe.
      </p>
      <p>Tres salidas, en orden de preferencia:</p>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>A&ntilde;adir una r&eacute;plica.</strong> Duplica el coste pero
          da error puro, que es la estimaci&oacute;n honesta.
        </li>
        <li>
          <strong>A&ntilde;adir puntos centrales.</strong> Mucho m&aacute;s
          barato, y de paso detectan curvatura.
        </li>
        <li>
          <strong>Omitir t&eacute;rminos.</strong> Decidir de antemano que no vas
          a ajustar la interacci&oacute;n de tres factores libera un grado de
          libertad. Gratis, pero apuesta a que ese t&eacute;rmino es
          despreciable: si no lo es, su efecto contamina el error.
        </li>
      </ul>
    </Section>

    <Section title="Por qué la curva es simétrica">
      <p>
        El contraste es <strong>bilateral</strong>: solo importa el
        tama&ntilde;o del efecto, no su signo. Da lo mismo que el factor suba o
        baje la respuesta.
      </p>
      <p>
        En efecto cero la potencia vale <strong>exactamente {"\u03B1"}</strong>.
        Tiene sentido: sin efecto real, la probabilidad de declararlo
        significativo es justo la tasa de falsas alarmas que has aceptado.
      </p>
    </Section>

    <Section title="La letra pequeña">
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>Todo depende de {"\u03C3"}.</strong> Es el n&uacute;mero que
          menos se conoce y el que m&aacute;s manda. Si lo subestimas a la mitad,
          la potencia real se derrumba respecto a la calculada.
        </li>
        <li>
          <strong>Estima {"\u03C3"} con datos</strong>: un estudio de
          repetibilidad, un gr&aacute;fico de control, un hist&oacute;rico. No de
          memoria.
        </li>
        <li>
          <strong>Calcula varios escenarios.</strong> Pon 0,8 / 1 / 1,5 en la
          desviaci&oacute;n y mira c&oacute;mo se mueve. Si el plan aguanta el
          peor caso, es un buen plan.
        </li>
        <li>
          <strong>No calcules la potencia despu&eacute;s.</strong> La potencia
          <em>a posteriori</em>, con la desviaci&oacute;n observada, es una
          funci&oacute;n del p-valor y no informa de nada. Esto se hace antes o no
          se hace.
        </li>
      </ul>
    </Section>

    <Section title="Ejemplo resuelto">
      <p>
        Tres factores, factorial completo de 8 esquinas, sin bloques ni puntos
        centrales. Efecto a detectar 2, desviaci&oacute;n 1, {"\u03B1"} = 0,05,
        potencia objetivo 0,90.
      </p>
      <table className="text-xs border-collapse">
        <thead>
          <tr className="border-b border-gray-300">
            <th className="py-1 pr-4 text-left font-medium text-gray-600">
              R&eacute;plicas
            </th>
            <th className="py-1 pr-4 text-left font-medium text-gray-600">
              Corridas
            </th>
            <th className="py-1 pr-4 text-left font-medium text-gray-600">
              gl error
            </th>
            <th className="py-1 text-left font-medium text-gray-600">Potencia</th>
          </tr>
        </thead>
        <tbody>
          {[
            ["1", "8", "0", "no calculable"],
            ["2", "16", "8", "0,936743"],
            ["3", "24", "16", "0,995707"],
          ].map((row) => (
            <tr key={row[0]} className="border-b border-gray-200">
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
        Con una r&eacute;plica el dise&ntilde;o est&aacute; saturado. Con dos,{" "}
        {"\u03BB"} = 2{"\u00b7"}{"\u221A"}16 / 2 = 4 sobre 8 grados de libertad, y
        la potencia sale <strong>0,936743</strong>: por encima del 0,90 pedido, y
        es el primer valor que lo alcanza.
      </p>
      <Note>
        Pasar de 2 a 3 r&eacute;plicas sube la potencia de 0,937 a 0,996 a cambio
        de 8 corridas m&aacute;s. Ganar esas seis cent&eacute;simas casi nunca
        compensa: <strong>los rendimientos decrecen deprisa</strong> una vez
        superado el 0,90.
      </Note>
      <p>
        Vista al rev&eacute;s, la misma tabla dice que con 16 corridas el menor
        efecto detectable con potencia 0,90 es <strong>1,856</strong>. Cualquier
        cosa m&aacute;s peque&ntilde;a se te escapar&aacute; m&aacute;s de una vez
        de cada diez.
      </p>
    </Section>
  </div>
);

const EN = () => (
  <div className="space-y-5">
    <Section title="What it is for">
      <p>
        Run this <strong>before</strong> the experiment. Power is the probability
        of declaring an effect significant <em>when it is really there</em>; 1{" "}
        {"\u2212"} power is the risk of spending the whole experiment and coming
        back empty-handed.
      </p>
      <Warn>
        At a power of 0.50 the experiment <strong>fails half the time</strong>{" "}
        even though the effect exists.
      </Warn>
    </Section>

    <Section title="The four pieces">
      <p>They are tied together: fix three and the fourth follows.</p>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>Effect</strong> — the high-level mean minus the low-level mean.
        </li>
        <li><strong>Standard deviation</strong> — the process noise.</li>
        <li><strong>Runs</strong> — corner points times replicates.</li>
        <li><strong>Alpha</strong> — the false alarm rate, usually 0.05.</li>
      </ul>
      <Note>
        What matters is the <strong>ratio</strong> of effect to standard
        deviation. Detecting 2 against noise of 1 is exactly as hard as detecting
        200 against noise of 100.
      </Note>
    </Section>

    <Section title="How it is computed">
      <Formula>
        {"\u03BB"} ={" "}
        <Frac
          num={
            <>
              |effect| {"\u00b7"} {"\u221A"}<V>N</V><Sub>corner</Sub>
            </>
          }
          den={<>2{"\u03C3"}</>}
        />
      </Formula>
      <p>
        That is the <strong>non-centrality parameter</strong>: how many standard
        errors separate the true effect from zero. Power comes from the{" "}
        <em>non-central t</em> with {"\u03BB"} and the error degrees of freedom.
      </p>
      <Formula>
        df<Sub>error</Sub> = <V>N</V><Sub>total</Sub> {"\u2212"} terms {"\u2212"}{" "}
        (blocks {"\u2212"} 1) {"\u2212"} [1 if center points]
      </Formula>
      <Warn>
        Note that {"\u03BB"} uses <strong>only the corner runs</strong>. Center
        points sit midway on every factor, so they cannot help tell the high
        level from the low one. They only add error degrees of freedom.
      </Warn>
    </Section>

    <Section title="The saturated design">
      <p>
        A full factorial with <strong>one replicate</strong> and every term in
        the model spends all its runs estimating parameters: 8 runs, 8 terms.
        Nothing is left for error and power does not exist.
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li><strong>Add a replicate</strong> — doubles cost, gives pure error.</li>
        <li>
          <strong>Add center points</strong> — much cheaper, and detects
          curvature too.
        </li>
        <li>
          <strong>Omit terms</strong> — free, but bets that the term is
          negligible. If it is not, its effect contaminates the error.
        </li>
      </ul>
    </Section>

    <Section title="Why the curve is symmetric">
      <p>
        The test is two-sided: only the size of the effect matters, not its sign.
        At zero effect the power equals <strong>exactly {"\u03B1"}</strong> — with
        no real effect, the chance of declaring one is the false alarm rate you
        accepted.
      </p>
    </Section>

    <Section title="The small print">
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>Everything hangs on {"\u03C3"}</strong>, the least known and
          most influential number in the calculation.
        </li>
        <li>
          <strong>Estimate it from data</strong> — a repeatability study, a
          control chart, historical records. Not from memory.
        </li>
        <li>
          <strong>Try several scenarios.</strong> If the plan survives the worst
          case, it is a good plan.
        </li>
        <li>
          <strong>Never compute power afterwards.</strong> Post hoc power, using
          the observed deviation, is a function of the p-value and tells you
          nothing new.
        </li>
      </ul>
    </Section>

    <Section title="Worked example">
      <p>
        Three factors, 8 corner points, no blocks, no center points, effect 2,
        deviation 1, {"\u03B1"} = 0.05, target power 0.90. One replicate is
        saturated. Two replicates give {"\u03BB"} = 4 on 8 degrees of freedom and
        a power of <strong>0.936743</strong>, the first value to clear 0.90.
      </p>
      <Note>
        Going to three replicates lifts power to 0.996 for eight more runs.
        Returns fall away quickly once past 0.90. Read the other way: with 16
        runs the smallest effect detectable at power 0.90 is{" "}
        <strong>1.856</strong>.
      </Note>
    </Section>
  </div>
);

export default function PssFactTheory() {
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
