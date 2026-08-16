// app/app/six-sigma/studies/doe/factorial/create/Theory.tsx
"use client";
import React, { useState } from "react";
import { availableDesigns } from "../../../../lib/doe";

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
const Warn = ({ children }: { children: React.ReactNode }) => (
  <div className="my-2 px-3 py-2 bg-red-50 border-l-4 border-red-500 text-sm">
    {children}
  </div>
);
const Formula = ({ children }: { children: React.ReactNode }) => (
  <div className="my-2 px-4 py-3 bg-gray-50 border-l-4 border-[#00674d] font-serif text-base overflow-x-auto">
    {children}
  </div>
);

/** Rejilla de disenos disponibles, calculada con la misma tabla del motor. */
function DesignGrid() {
  const runsRows = [4, 8, 16, 32, 64, 128];
  const factors = Array.from({ length: 14 }, (_, i) => i + 2);

  const cellFor = (runs: number, k: number) => {
    const opt = availableDesigns(k).find((o) => o.runs === runs);
    if (!opt) return null;
    return opt.resolutionLabel;
  };

  const tone = (lab: string): string => {
    if (lab === "Full") return "bg-emerald-200 text-emerald-900";
    if (lab === "III") return "bg-red-200 text-red-900";
    if (lab === "IV") return "bg-amber-200 text-amber-900";
    return "bg-emerald-100 text-emerald-900";
  };

  return (
    <div className="overflow-x-auto">
      <table className="border-collapse text-xs">
        <thead>
          <tr>
            <th className="border border-gray-300 px-2 py-1 font-medium text-gray-600">
              Runs
            </th>
            <th
              className="border border-gray-300 px-2 py-1 font-medium text-gray-600"
              colSpan={factors.length}
            >
              Factors
            </th>
          </tr>
          <tr>
            <th className="border border-gray-300 px-2 py-1" />
            {factors.map((k) => (
              <th
                key={k}
                className="border border-gray-300 px-2 py-1 font-medium text-gray-600"
              >
                {k}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {runsRows.map((runs) => (
            <tr key={runs}>
              <td className="border border-gray-300 px-2 py-1 text-center font-medium text-gray-700">
                {runs}
              </td>
              {factors.map((k) => {
                const lab = cellFor(runs, k);
                return (
                  <td
                    key={k}
                    className={`border border-gray-300 px-2 py-1 text-center font-semibold ${
                      lab ? tone(lab) : ""
                    }`}
                  >
                    {lab ?? ""}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-2 flex flex-wrap gap-3 text-xs">
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded bg-emerald-200" /> Full o
          resolucion V o mas
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded bg-amber-200" /> Resolucion
          IV
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded bg-red-200" /> Resolucion
          III
        </span>
      </div>
    </div>
  );
}

const ES = () => (
  <div className="space-y-5">
    <Section title="Por qué un diseño y no probar de uno en uno">
      <p>
        Cambiar un factor cada vez, dejando quietos los dem&aacute;s, parece lo
        prudente y es lo peor. Gasta m&aacute;s corridas para la misma
        precisi&oacute;n y, sobre todo, <strong>no puede detectar
        interacciones</strong>: si el efecto de la temperatura depende de la
        presi&oacute;n, ese m&eacute;todo nunca lo ver&aacute;.
      </p>
      <p>
        Un dise&ntilde;o factorial mueve <strong>todos los factores a la
        vez</strong>, de forma organizada. Cada corrida informa sobre todos los
        efectos, y por eso el mismo esfuerzo rinde mucho m&aacute;s.
      </p>
      <Formula>
        Corridas del factorial completo = 2<sup>k</sup>
      </Formula>
      <p>
        Con 3 factores son 8 corridas; con 7, ya 128. Ese crecimiento es el que
        obliga a las fracciones.
      </p>
    </Section>

    <Section title="Diseños disponibles">
      <p>
        Esta es la rejilla de la ayuda <em>Display Available Designs</em>: para
        cada n&uacute;mero de corridas y de factores, la resoluci&oacute;n del
        mejor dise&ntilde;o conocido.
      </p>
      <DesignGrid />
    </Section>

    <Section title="Fracciones y resolución">
      <p>
        Una fracci&oacute;n corre solo una parte del factorial completo:{" "}
        <strong>2<sup>k{"\u2212"}p</sup></strong> corridas en vez de 2
        <sup>k</sup>. El ahorro no es gratis: algunos efectos quedan{" "}
        <strong>confundidos</strong>, es decir, se suman y ya no se pueden
        separar. Dos efectos confundidos se llaman <em>alias</em>.
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>Resoluci&oacute;n III.</strong> Los efectos principales se
          confunden con interacciones de dos factores. Solo sirve para{" "}
          <em>cribar</em>: descartar factores irrelevantes cuando sospechas que
          no hay interacciones.
        </li>
        <li>
          <strong>Resoluci&oacute;n IV.</strong> Los principales est&aacute;n
          limpios, pero las interacciones de dos factores se confunden entre
          s&iacute;. Muy usada.
        </li>
        <li>
          <strong>Resoluci&oacute;n V o m&aacute;s.</strong> Principales e
          interacciones de dos factores, todos limpios. Casi tan bueno como el
          completo.
        </li>
        <li>
          <strong>Full.</strong> Nada se confunde con nada.
        </li>
      </ul>
      <Note>
        La regla pr&aacute;ctica: con <strong>muchos factores y poca idea</strong>{" "}
        de cu&aacute;les importan, empieza en resoluci&oacute;n IV con pocas
        corridas. Con <strong>pocos factores ya seleccionados</strong>, ve al
        factorial completo.
      </Note>
    </Section>

    <Section title="Réplicas, puntos centrales y bloques">
      <p>
        <strong>R&eacute;plicas.</strong> Repetir el dise&ntilde;o entero da una
        estimaci&oacute;n del <em>error puro</em>, sin la cual no hay contraste
        de significaci&oacute;n posible en un factorial completo. Con una sola
        r&eacute;plica y todos los t&eacute;rminos en el modelo no quedan grados
        de libertad para el error.
      </p>
      <p>
        <strong>Puntos centrales.</strong> Corridas con todos los factores a
        medio camino. Sirven para dos cosas: dan error puro sin duplicar el
        dise&ntilde;o, y <strong>detectan curvatura</strong>. Si la respuesta en
        el centro se aparta de la media de las esquinas, el plano no vale y hace
        falta un modelo con t&eacute;rminos cuadr&aacute;ticos.
      </p>
      <p>
        <strong>Bloques.</strong> Si no puedes hacer todas las corridas en las
        mismas condiciones —dos lotes de materia prima, dos turnos, dos
        d&iacute;as—, se agrupan en bloques. El efecto del bloque se estima y se
        aparta, en lugar de contaminar los factores.
      </p>
      <Warn>
        Bloquear <strong>cuesta</strong>: el bloque se confunde con alguna
        interacci&oacute;n de orden alto, que se pierde. El resumen te dice
        siempre con cu&aacute;l.
      </Warn>
    </Section>

    <Section title="Aleatorizar no es opcional">
      <p>
        La tabla en orden est&aacute;ndar es c&oacute;moda de leer y{" "}
        <strong>p&eacute;sima para ejecutar</strong>. Si haces las corridas en
        ese orden, el factor C —que cambia una sola vez, a mitad— recoger&aacute;
        cualquier deriva del proceso: el calentamiento de la m&aacute;quina, el
        cansancio del operario, el cambio de turno.
      </p>
      <Note>
        La aleatorizaci&oacute;n reparte esa deriva entre todos los efectos en
        vez de cargarla sobre uno. Aqu&iacute; se aleatoriza{" "}
        <strong>dentro de cada bloque</strong>: mezclar entre bloques
        destruir&iacute;a el bloqueo, que existe precisamente para agrupar
        corridas contiguas.
      </Note>
      <p>
        La <strong>base para los datos aleatorios</strong> es la semilla: la
        misma base reproduce siempre el mismo orden, lo que permite volver a
        obtener una hoja id&eacute;ntica.
      </p>
    </Section>

    <Section title="La hoja generada">
      <p>Se crea una hoja nueva con estas columnas:</p>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>StdOrder</strong> {"\u2014"} posici&oacute;n en el orden
          est&aacute;ndar. Es la identidad de la corrida.
        </li>
        <li>
          <strong>RunOrder</strong> {"\u2014"} el orden en que hay que{" "}
          <em>ejecutarlas</em>. S&iacute;guelo.
        </li>
        <li>
          <strong>CenterPt</strong> {"\u2014"} 1 en las esquinas, 0 en los puntos
          centrales.
        </li>
        <li>
          <strong>Blocks</strong> {"\u2014"} bloque de cada corrida.
        </li>
        <li>
          <strong>Una columna por factor</strong>, con los niveles ya en tus
          unidades, no en {"\u2212"}1 y +1.
        </li>
      </ul>
      <Note>
        A&ntilde;ade a mano una columna de respuesta y rell&eacute;nala{" "}
        <strong>siguiendo RunOrder</strong>. No reordenes la hoja: StdOrder y
        RunOrder son los que permiten analizarla despu&eacute;s.
      </Note>
    </Section>

    <Section title="Ejemplo">
      <p>
        Tres factores, factorial completo, una r&eacute;plica, un bloque, sin
        puntos centrales: <strong>8 corridas</strong>, base 3; 8, y todos los
        t&eacute;rminos libres de alias. Con dos r&eacute;plicas son 16 corridas,
        que ya dan error puro para contrastar los siete efectos.
      </p>
    </Section>
  </div>
);

const EN = () => (
  <div className="space-y-5">
    <Section title="Why design instead of one factor at a time">
      <p>
        Changing one factor at a time looks careful and is the worst option. It
        spends more runs for the same precision and, above all,{" "}
        <strong>cannot detect interactions</strong>: if the effect of temperature
        depends on pressure, that method will never see it.
      </p>
      <Formula>
        Full factorial runs = 2<sup>k</sup>
      </Formula>
      <p>
        Three factors need 8 runs; seven need 128. That growth is what forces
        fractions.
      </p>
    </Section>

    <Section title="Available designs">
      <p>
        This is the <em>Display Available Designs</em> grid: for each number of
        runs and factors, the resolution of the best known design.
      </p>
      <DesignGrid />
    </Section>

    <Section title="Fractions and resolution">
      <p>
        A fraction runs only part of the full factorial:{" "}
        <strong>2<sup>k{"\u2212"}p</sup></strong> runs instead of 2<sup>k</sup>.
        The saving costs you <strong>confounding</strong>: some effects add
        together and can no longer be separated. Confounded effects are called{" "}
        <em>aliases</em>.
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>Resolution III</strong> — main effects confounded with
          two-factor interactions. Screening only.
        </li>
        <li>
          <strong>Resolution IV</strong> — main effects clean, two-factor
          interactions confounded with each other.
        </li>
        <li>
          <strong>Resolution V or more</strong> — main effects and two-factor
          interactions all clean.
        </li>
        <li>
          <strong>Full</strong> — nothing is confounded with anything.
        </li>
      </ul>
      <Note>
        With <strong>many factors and little idea</strong> which matter, start at
        resolution IV with few runs. With <strong>few factors already
        screened</strong>, go full factorial.
      </Note>
    </Section>

    <Section title="Replicates, center points and blocks">
      <p>
        <strong>Replicates</strong> give an estimate of <em>pure error</em>,
        without which no significance test is possible in a saturated full
        factorial.
      </p>
      <p>
        <strong>Center points</strong> sit every factor midway. They give pure
        error without doubling the design, and they{" "}
        <strong>detect curvature</strong>: if the centre response departs from the
        average of the corners, a plane will not do.
      </p>
      <p>
        <strong>Blocks</strong> group runs you cannot make under identical
        conditions — two batches, two shifts, two days. The block effect is
        estimated and set aside instead of contaminating the factors.
      </p>
      <Warn>
        Blocking <strong>costs</strong>: the block is confounded with some
        high-order interaction, which is lost. The summary always says which.
      </Warn>
    </Section>

    <Section title="Randomizing is not optional">
      <p>
        Standard order is convenient to read and <strong>terrible to
        run</strong>. Executed in that order, factor C — which changes just once,
        halfway — would absorb any process drift: machine warm-up, operator
        fatigue, a shift change.
      </p>
      <Note>
        Randomization spreads that drift across all effects instead of loading it
        onto one. Runs are randomized <strong>within each block</strong>: mixing
        across blocks would destroy the blocking.
      </Note>
      <p>
        The <strong>base for random data</strong> is the seed: the same base
        always reproduces the same order.
      </p>
    </Section>

    <Section title="The generated worksheet">
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>StdOrder</strong> — position in standard order, the run{"\u2019"}s
          identity.
        </li>
        <li>
          <strong>RunOrder</strong> — the order to actually <em>run</em> them.
        </li>
        <li>
          <strong>CenterPt</strong> — 1 at corners, 0 at center points.
        </li>
        <li>
          <strong>Blocks</strong> — the block of each run.
        </li>
        <li>
          <strong>One column per factor</strong>, in your own units.
        </li>
      </ul>
      <Note>
        Add a response column by hand and fill it in{" "}
        <strong>following RunOrder</strong>. Do not re-sort the sheet: StdOrder
        and RunOrder are what make it analysable later.
      </Note>
    </Section>
  </div>
);

export default function DoeCreateTheory() {
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
