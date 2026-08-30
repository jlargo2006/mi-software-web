// app/app/six-sigma/studies/control/uchart/Theory.tsx
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
const Cite = ({ children }: { children: React.ReactNode }) => (
  <sup className="text-[0.7em] text-[#00674d] font-semibold">[{children}]</sup>
);

const REFS = [
  "Shewhart, W. A. (1931). Economic Control of Quality of Manufactured Product. Van Nostrand.",
  "Nelson, L. S. (1984). The Shewhart control chart \u2014 tests for special causes. Journal of Quality Technology, 16(4), 237\u2013239.",
  "Montgomery, D. C. (2013). Introduction to Statistical Quality Control (7th ed.). Wiley.",
  "Laney, D. B. (2002). Improved control charts for attributes. Quality Engineering, 14(4), 531\u2013537.",
  "Jones, L. A., & Champ, C. W. (2002). Phase I control charts for times between events. Quality and Reliability Engineering International, 18(6), 479\u2013488.",
  "Wheeler, D. J., & Chambers, D. S. (1992). Understanding Statistical Process Control (2nd ed.). SPC Press.",
];

const Refs = ({ title }: { title: string }) => (
  <section className="space-y-2">
    <h3 className="font-bold text-base text-[#00674d] border-b border-gray-200 pb-1">
      {title}
    </h3>
    <ol className="list-decimal pl-5 space-y-1 text-xs text-gray-600">
      {REFS.map((s, i) => (
        <li key={i}>{s}</li>
      ))}
    </ol>
  </section>
);

const ES = () => (
  <div className="space-y-5">
    <Section title="Defectos, no unidades defectuosas">
      <p>
        Las cartas P y NP cuentan <em>unidades</em>: cada pieza pasa o falla, y el
        conteo nunca puede superar el tamano de muestra. La carta U cuenta{" "}
        <em>defectos</em>, y una misma pieza puede llevar varios. Una puerta con
        tres aranazos aporta tres.
      </p>
      <p>
        Ese cambio no es de matiz: cambia el modelo. Ya no hay un numero fijo de
        ensayos con dos resultados, sino sucesos que ocurren en un{" "}
        <strong>continuo</strong> {"\u2014"} de superficie, de tiempo, de
        longitud. El modelo pasa de binomial a <strong>Poisson</strong>.
      </p>
      <Note>
        La prueba practica para elegir: {"\u00BF"}puede el conteo superar el numero
        de unidades inspeccionadas? Si puede, es una carta C o U. Si no puede, es
        una P o NP.
      </Note>
    </Section>

    <Section title="Los límites">
      <Formula>
        u{"\u0305"} = {"\u03A3"}<V>c</V><Sub>i</Sub> / {"\u03A3"}<V>n</V>
        <Sub>i</Sub>
        {"\u00A0\u00A0\u00A0\u00A0"}
        LC = u{"\u0305"} {"\u00B1"} 3 {"\u221A"}( u{"\u0305"} / <V>n</V>
        <Sub>i</Sub> )
      </Formula>
      <p>
        Compare con la carta P: alli la sigma era {"\u221A"}(p(1{"\u2212"}p)/
        <V>n</V>). Aqui <strong>desaparece el factor (1{"\u2212"}p)</strong>. No
        hay techo del que acercarse, porque un conteo de defectos no esta acotado
        por el numero de unidades.
      </p>
      <p>
        La linea central es la <strong>tasa agregada</strong>, no la media de las
        tasas: cada unidad inspeccionada debe pesar igual.
      </p>
      <Warn>
        El limite inferior se recorta en cero y no hay recorte por arriba. Cuando
        el LCL toca el cero {"\u2014"} y ocurre siempre que <V>n</V>u{"\u0305"} es
        pequeno {"\u2014"} la carta pierde su mitad inferior:{" "}
        <strong>ya no puede detectar una mejora</strong>.
      </Warn>
    </Section>

    <Section title="La unidad de inspección">
      <p>
        El <V>n</V><Sub>i</Sub> de la carta U no cuenta piezas: cuenta{" "}
        <strong>unidades de inspeccion</strong>, y puede ser fraccionario. 2,5
        metros de cable, 0,7 de un turno, 120 metros cuadrados de chapa. Lo unico
        que se exige es que sea positivo y que la unidad signifique lo mismo en
        todos los subgrupos.
      </p>
      <Note>
        Definir la unidad es una decision, no un dato. Si se elige demasiado
        pequena, el numero esperado de defectos baja de 5 y la aproximacion normal
        deja de valer. Si se elige demasiado grande, la carta pierde resolucion
        temporal. Es el equivalente al subgrupo racional de las cartas de
        variables.
      </Note>
    </Section>

    <Section title="Sobredispersión: aquí es más grave">
      <p>
        La Poisson tiene un unico parametro, y de ahi sale su restriccion
        caracteristica: <strong>la varianza es igual a la media</strong>. No hay
        margen. Supone que los defectos ocurren de forma independiente y a tasa
        constante en todo el continuo inspeccionado.
      </p>
      <p>
        En la practica casi nunca es asi: los defectos se agrupan. Una tanda con
        un problema de material genera un racimo, no defectos repartidos al azar.
        Cuando eso pasa la variacion real supera a la media, los limites salen{" "}
        <strong>demasiado estrechos</strong> y la carta se llena de puntos
        fuera.
      </p>
      <Warn>
        <strong>Como leerlo.</strong> Si falla una cuarta parte de los puntos o
        mas, la explicacion no suele ser que el proceso tenga tantas causas
        asignables: es que el modelo no describe los datos. Antes de abrir una
        sola investigacion, mire el indice de dispersion.
      </Warn>
      <p>
        Se mide estandarizando los puntos y calculando su dispersion de corto
        plazo con el rango movil, como en una I-MR. Cerca de 1, la Poisson vale.
        Muy por encima, el remedio estandar es la carta U{"\u2032"} de Laney
        <Cite>4</Cite>.
      </p>
    </Section>

    <Section title="Los cuatro tests">
      <p>
        Solo existen los cuatro primeros de Nelson<Cite>2</Cite>. Del 5 al 8 leen
        zonas de una sigma presuponiendo simetria, y la Poisson es marcadamente
        asimetrica salvo con un numero esperado de defectos alto.
      </p>
      <Note>
        Con tamanos desiguales los limites escalonan, asi que dos puntos a la
        misma altura pueden estar uno dentro y otro fuera. No es un error de
        dibujo: un subgrupo con mas unidades inspeccionadas estima mejor la tasa y
        merece limites mas estrechos.
      </Note>
    </Section>

    <Section title="U o C">
      <p>
        La <strong>C</strong> es la U con <V>n</V> = 1 fijo: dibuja el conteo
        bruto y su sigma es {"\u221A"}c{"\u0305"}. Misma relacion que hay entre NP
        y P.
      </p>
      <p>
        Si el tamano de inspeccion es siempre el mismo, la C dice lo mismo de
        forma mas directa y con la linea central plana. En cuanto varia, hace
        falta la U: solo la tasa por unidad es comparable entre subgrupos.
      </p>
    </Section>

    <Section title="Ejemplo resuelto">
      <p>
        25 subgrupos, 425 defectos en 218,5 unidades de inspeccion.{" "}
        u{"\u0305"} = 425 / 218,5 = 1,9455 defectos por unidad.
      </p>
      <p>
        Los tamanos van de 1 a 21 unidades, asi que los limites escalonan mucho:
        con <V>n</V> = 21 el UCL vale 2,86, y con <V>n</V> = 1 sube a 6,13. El
        ultimo subgrupo, con 3 unidades, tiene UCL = 4,36.
      </p>
      <Note>
        Fallan doce de los veinticinco puntos. Eso no es un proceso con doce
        causas asignables: es un modelo Poisson que no describe estos datos. Note
        ademas que los tamanos varian veintiuno a uno y que los puntos senalados
        son casi todos los de <V>n</V> pequeno, justo donde la aproximacion normal
        es mas pobre. Antes de investigar nada, conviene revisar como se definio
        la unidad de inspeccion.
      </Note>
    </Section>

    <Refs title="Bibliografía" />
  </div>
);

const EN = () => (
  <div className="space-y-5">
    <Section title="Defects, not defective units">
      <p>
        The P and NP charts count <em>units</em>: each part passes or fails, and
        the count can never exceed the sample size. The U chart counts{" "}
        <em>defects</em>, and one part may carry several. A door with three
        scratches contributes three.
      </p>
      <p>
        That is not a nuance, it changes the model. There is no longer a fixed
        number of two-outcome trials, but events occurring over a{" "}
        <strong>continuum</strong> {"\u2014"} of area, of time, of length. The
        model moves from binomial to <strong>Poisson</strong>.
      </p>
      <Note>
        The practical test: can the count exceed the number of units inspected? If
        it can, it is a C or U chart. If it cannot, it is a P or NP.
      </Note>
    </Section>

    <Section title="The limits">
      <Formula>
        u{"\u0305"} = {"\u03A3"}<V>c</V><Sub>i</Sub> / {"\u03A3"}<V>n</V>
        <Sub>i</Sub>
        {"\u00A0\u00A0\u00A0\u00A0"}
        CL = u{"\u0305"} {"\u00B1"} 3 {"\u221A"}( u{"\u0305"} / <V>n</V>
        <Sub>i</Sub> )
      </Formula>
      <p>
        Compare with the P chart, where sigma was {"\u221A"}(p(1{"\u2212"}p)/
        <V>n</V>). Here <strong>the (1{"\u2212"}p) factor disappears</strong>.
        There is no ceiling to approach, because a count of defects is not bounded
        by the number of units.
      </p>
      <p>
        The centre line is the <strong>aggregate rate</strong>, not the mean of
        the rates: every unit inspected should count equally.
      </p>
      <Warn>
        The lower limit is clipped at zero and there is no clipping above. When
        the LCL reaches zero {"\u2014"} which it always does when <V>n</V>u
        {"\u0305"} is small {"\u2014"} the chart loses its lower half:{" "}
        <strong>it can no longer detect an improvement</strong>.
      </Warn>
    </Section>

    <Section title="The inspection unit">
      <p>
        The <V>n</V><Sub>i</Sub> on a U chart does not count parts: it counts{" "}
        <strong>inspection units</strong>, and it may be fractional. 2.5 metres of
        cable, 0.7 of a shift, 120 square metres of sheet. All that is required is
        that it be positive and mean the same thing in every subgroup.
      </p>
      <Note>
        Defining the unit is a decision, not a datum. Too small and the expected
        number of defects drops below 5, where the normal approximation fails. Too
        large and the chart loses time resolution. It is the counterpart of the
        rational subgroup on a variables chart.
      </Note>
    </Section>

    <Section title="Overdispersion: worse here">
      <p>
        The Poisson has a single parameter, and hence its characteristic
        restriction: <strong>the variance equals the mean</strong>. There is no
        slack. It assumes defects occur independently and at a constant rate
        across the whole continuum inspected.
      </p>
      <p>
        In practice they rarely do: defects cluster. A batch with a material
        problem produces a cluster, not defects scattered at random. When that
        happens the real variation exceeds the mean, the limits come out{" "}
        <strong>far too narrow</strong> and the chart fills with out-of-control
        points.
      </p>
      <Warn>
        <strong>How to read it.</strong> If a quarter of the points or more fail,
        the explanation is rarely that the process has that many special causes:
        it is that the model does not describe the data. Look at the dispersion
        ratio before opening a single investigation.
      </Warn>
      <p>
        It is measured by standardising the points and taking their short-term
        spread with the moving range, as on an I-MR chart. Near 1, the Poisson
        holds. Well above, the standard remedy is Laney{"\u2019"}s U{"\u2032"}
        chart.<Cite>4</Cite>
      </p>
    </Section>

    <Section title="The four tests">
      <p>
        Only Nelson{"\u2019"}s first four exist<Cite>2</Cite>. Tests 5 to 8 read
        one-sigma zones assuming symmetry, and the Poisson is markedly skewed
        unless the expected count is large.
      </p>
      <Note>
        With unequal sizes the limits step, so two points at the same height may
        be one inside and one outside. That is not a drawing error: a subgroup
        with more units inspected estimates the rate better and deserves tighter
        limits.
      </Note>
    </Section>

    <Section title="U or C">
      <p>
        The <strong>C chart</strong> is the U chart with <V>n</V> fixed at 1: it
        plots the raw count and its sigma is {"\u221A"}c{"\u0305"}. The same
        relation NP has to P.
      </p>
      <p>
        If the inspection size is always the same, the C chart says it more
        directly and with a flat centre line. As soon as it varies the U chart is
        needed: only the rate per unit is comparable across subgroups.
      </p>
    </Section>

    <Section title="Worked example">
      <p>
        25 subgroups, 425 defects across 218.5 inspection units. u{"\u0305"} = 425
        / 218.5 = 1.9455 defects per unit.
      </p>
      <p>
        The sizes run from 1 to 21 units, so the limits step a great deal: at{" "}
        <V>n</V> = 21 the UCL is 2.86, and at <V>n</V> = 1 it rises to 6.13. The
        last subgroup, with 3 units, has UCL = 4.36.
      </p>
      <Note>
        Twelve of the twenty-five points fail. That is not a process with twelve
        special causes: it is a Poisson model that does not describe these data.
        Note too that the sizes vary twenty-one to one and that the flagged points
        are mostly those with small <V>n</V>, exactly where the normal
        approximation is poorest. Before investigating anything, revisit how the
        inspection unit was defined.
      </Note>
    </Section>

    <Refs title="References" />
  </div>
);

export default function UChartTheory() {
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
