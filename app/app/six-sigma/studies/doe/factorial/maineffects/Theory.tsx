// app/app/six-sigma/studies/doe/factorial/maineffects/Theory.tsx
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
    <Section title="Qué muestra">
      <p>
        Para cada factor se calcula la <strong>media de la respuesta en cada
        nivel</strong> y se unen los puntos. La pendiente de esa recta{" "}
        <em>es</em> el efecto del factor.
      </p>
      <Formula>
        Efecto de A = <V>y</V><Sub>A alto</Sub> {"\u2212"} <V>y</V>
        <Sub>A bajo</Sub>
      </Formula>
      <p>
        Cada media promedia <strong>sobre todos los niveles de los
        dem&aacute;s factores</strong>. Con un dise&ntilde;o factorial eso es
        exactamente lo que se quiere: como el dise&ntilde;o est&aacute;
        equilibrado, los otros factores se cancelan y lo que queda es el efecto
        limpio de A.
      </p>
      <Note>
        Esta cancelaci&oacute;n es lo que hace superior al dise&ntilde;o frente
        a cambiar un factor cada vez: <strong>todas</strong> las corridas
        contribuyen a <strong>todos</strong> los efectos. Con 8 corridas se
        estiman tres efectos con cuatro observaciones cada media.
      </Note>
    </Section>

    <Section title="Cómo se lee">
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>L&iacute;nea inclinada</strong> {"\u2192"} el factor cambia la
          respuesta. Cuanto m&aacute;s inclinada, mayor efecto.
        </li>
        <li>
          <strong>L&iacute;nea plana</strong> {"\u2192"} el factor no cambia la
          media. Ojo con la letra peque&ntilde;a, m&aacute;s abajo.
        </li>
        <li>
          <strong>El signo</strong> dice hacia d&oacute;nde mover el factor.
        </li>
      </ul>
      <Warn>
        <strong>La escala com&uacute;n no es un adorno.</strong> Si cada panel se
        escalara por su cuenta, un efecto min&uacute;sculo llenar&iacute;a el
        panel y parecer&iacute;a tan importante como el mayor. Comparar
        pendientes solo tiene sentido con el mismo eje vertical.
      </Warn>
    </Section>

    <Section title="La trampa: una línea plana no significa nada por sí sola">
      <p>
        Un factor puede tener efecto <strong>nulo en media</strong> y ser
        decisivo. Imagina que con B bajo, subir A sube la respuesta 10; y con B
        alto, la baja 10. La media de A en cada nivel sale{" "}
        <strong>id&eacute;ntica</strong> y su l&iacute;nea, perfectamente plana.
        A importa mucho: importa <em>de forma distinta</em> seg&uacute;n B.
      </p>
      <Warn>
        Eso es una <strong>interacci&oacute;n</strong>, y este gr&aacute;fico no
        puede verla, por construcci&oacute;n: promediar sobre B es justamente lo
        que la borra. Mira siempre el <strong>gr&aacute;fico de
        interacciones</strong> antes de descartar un factor por plano.
      </Warn>
      <p>
        El orden correcto es el inverso al intuitivo:{" "}
        <strong>primero interacciones, despu&eacute;s efectos
        principales</strong>. Si A y B interact&uacute;an, hablar del efecto de
        A a secas no significa gran cosa.
      </p>
    </Section>

    <Section title="Qué NO hace este gráfico">
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>No contrasta nada.</strong> No hay p-valores. Una pendiente
          puede ser pura variabilidad, sobre todo con pocas corridas.
        </li>
        <li>
          <strong>No ordena por importancia estad&iacute;stica</strong>, solo por
          tama&ntilde;o. Para separar se&ntilde;al de ruido hacen falta
          r&eacute;plicas o puntos centrales, y el an&aacute;lisis factorial.
        </li>
        <li>
          <strong>No detecta curvatura</strong> con dos niveles: por dos puntos
          siempre pasa una recta. Los puntos centrales son los que la revelan.
        </li>
      </ul>
      <Note>
        Es una herramienta de <strong>lectura r&aacute;pida</strong>, no de
        decisi&oacute;n. Sirve para ver de un vistazo qui&eacute;n manda y
        hacia d&oacute;nde, antes de ajustar el modelo.
      </Note>
    </Section>

    <Section title="Ejemplo resuelto">
      <p>
        Catapulta, 8 corridas, respuesta <strong>Distance</strong>, media general
        3,5188:
      </p>
      <table className="text-xs border-collapse">
        <thead>
          <tr className="border-b border-gray-300">
            <th className="py-1 pr-4 text-left font-medium text-gray-600">
              Factor
            </th>
            <th className="py-1 pr-4 text-left font-medium text-gray-600">
              Media en {"\u2212"}1
            </th>
            <th className="py-1 pr-4 text-left font-medium text-gray-600">
              Media en +1
            </th>
            <th className="py-1 text-left font-medium text-gray-600">Efecto</th>
          </tr>
        </thead>
        <tbody>
          {[
            ["Fulcrum", "1,9625", "5,0750", "+3,1125"],
            ["Start Angle", "4,7000", "2,3375", "\u22122,3625"],
            ["Stop Angle", "2,6375", "4,4000", "+1,7625"],
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
        <strong>Fulcrum</strong> manda: cambia la distancia en 3,11, casi el
        doble que Stop Angle. Su l&iacute;nea es la m&aacute;s inclinada del
        gr&aacute;fico.
      </p>
      <p>
        Los signos dicen la receta para llegar m&aacute;s lejos:{" "}
        <strong>Fulcrum alto, Stop Angle alto, Start Angle bajo</strong>. Esa
        combinaci&oacute;n es la corrida 7, que dio 8,20, la mayor de las ocho.
        El gr&aacute;fico y los datos coinciden.
      </p>
      <Note>
        Ning&uacute;n factor sale plano aqu&iacute;, as&iacute; que los tres
        cuentan. A&uacute;n falta comprobar si el efecto de uno depende de otro:
        eso es el gr&aacute;fico de interacciones.
      </Note>
    </Section>
  </div>
);

const EN = () => (
  <div className="space-y-5">
    <Section title="What it shows">
      <p>
        For each factor, the <strong>mean response at every level</strong> is
        computed and the points joined. The slope of that line{" "}
        <em>is</em> the effect.
      </p>
      <Formula>
        Effect of A = <V>y</V><Sub>A high</Sub> {"\u2212"} <V>y</V>
        <Sub>A low</Sub>
      </Formula>
      <p>
        Each mean averages <strong>over all levels of the other
        factors</strong>. In a balanced factorial design that is exactly right:
        the other factors cancel out and what remains is the clean effect of A.
      </p>
      <Note>
        That cancellation is why designed experiments beat changing one factor
        at a time: <strong>every</strong> run contributes to{" "}
        <strong>every</strong> effect.
      </Note>
    </Section>

    <Section title="How to read it">
      <ul className="list-disc pl-5 space-y-1">
        <li><strong>Steep line</strong> — large effect.</li>
        <li><strong>Flat line</strong> — no effect on the mean. See the warning below.</li>
        <li><strong>The sign</strong> tells you which way to move the factor.</li>
      </ul>
      <Warn>
        <strong>The shared scale matters.</strong> Scaled panel by panel, a tiny
        effect would fill its panel and look as important as the largest one.
        Slopes are comparable only on a common vertical axis.
      </Warn>
    </Section>

    <Section title="The trap: a flat line means nothing on its own">
      <p>
        A factor can have <strong>zero average effect</strong> and still be
        decisive. Suppose that with B low, raising A adds 10; and with B high, it
        subtracts 10. The two means for A come out{" "}
        <strong>identical</strong> and its line is perfectly flat. A matters a
        great deal: it matters <em>differently</em> depending on B.
      </p>
      <Warn>
        That is an <strong>interaction</strong>, and this plot cannot see it by
        construction: averaging over B is precisely what erases it. Always check
        the <strong>interaction plot</strong> before dismissing a flat factor.
      </Warn>
      <p>
        The right order is the counter-intuitive one:{" "}
        <strong>interactions first, main effects second</strong>.
      </p>
    </Section>

    <Section title="What this plot does NOT do">
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>No testing.</strong> There are no p-values here; a slope can be
          pure noise.
        </li>
        <li>
          <strong>No curvature</strong> with two levels: a straight line always
          fits two points. Center points are what reveal it.
        </li>
        <li>
          <strong>No ranking by significance</strong>, only by size.
        </li>
      </ul>
    </Section>

    <Section title="Worked example">
      <p>
        Catapult, 8 runs, response <strong>Distance</strong>, overall mean
        3.5188. Fulcrum leads with an effect of +3.1125, then Start Angle at
        {" \u2212"}2.3625 and Stop Angle at +1.7625.
      </p>
      <Note>
        The signs give the recipe for distance:{" "}
        <strong>Fulcrum high, Stop Angle high, Start Angle low</strong>. That is
        run 7, which measured 8.20 — the longest of the eight. Plot and data
        agree.
      </Note>
    </Section>
  </div>
);

export default function DoeMainTheory() {
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
