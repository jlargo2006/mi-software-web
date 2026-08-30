// app/app/six-sigma/studies/control/npchart/Theory.tsx
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
  "Heimann, P. A. (1996). Attributes control charts with large sample sizes. Journal of Quality Technology, 28(4), 451\u2013459.",
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
    <Section title="La misma carta en otra escala">
      <p>
        La carta NP y la carta P contienen{" "}
        <strong>exactamente la misma informacion</strong>. Una dibuja el conteo{" "}
        <V>d</V><Sub>i</Sub>, la otra la proporcion <V>d</V><Sub>i</Sub>/
        <V>n</V>. Con <V>n</V> constante la diferencia es un factor de escala: los
        puntos, los limites y las senales son los mismos, y ninguna prueba puede
        fallar en una y no en la otra.
      </p>
      <Note>
        Entonces, {"\u00BF"}por que existen las dos? Por quien lee la carta. Un
        supervisor de linea razona en <em>piezas</em>: {"\u00AB"}hoy han salido 78
        defectuosas{"\u00BB"} se entiende sin dividir nada. La proporcion 0,312 es
        mas correcta estadisticamente y menos inmediata. La NP no aporta
        estadistica; aporta legibilidad.
      </Note>
    </Section>

    <Section title="Los límites">
      <Formula>
        p{"\u0305"} = {"\u03A3"}<V>d</V><Sub>i</Sub> / {"\u03A3"}<V>n</V>
        <Sub>i</Sub>
        {"\u00A0\u00A0\u00A0\u00A0"}
        LC = <V>n</V>p{"\u0305"} {"\u00B1"} 3 {"\u221A"}( <V>n</V>p{"\u0305"}(1
        {"\u2212"}p{"\u0305"}) )
      </Formula>
      <p>
        El parametro estimado sigue siendo la <strong>proporcion</strong>: la
        linea central se obtiene despues multiplicando por <V>n</V>. No se
        promedian los conteos directamente, aunque con <V>n</V> constante el
        resultado coincida.
      </p>
      <p>
        La desviacion tipica es {"\u221A"}(<V>n</V>p(1{"\u2212"}p)), que es la de
        la carta P multiplicada por <V>n</V>. Ese es todo el cambio de escala.
      </p>
      <Warn>
        Y los limites se recortan al intervalo 0 a <V>n</V>: un conteo de unidades
        defectuosas no puede salirse de ahi. Cuando el LCL toca el cero{" "}
        {"\u2014"} y ocurre siempre que <V>n</V>p{"\u0305"} es pequeno {"\u2014"}{" "}
        la carta pierde su mitad inferior y <strong>ya no puede detectar una
        mejora</strong>, solo un empeoramiento.
      </Warn>
    </Section>

    <Section title="Cuándo NO usar la NP">
      <Warn>
        <strong>Si el tamano de muestra varia, use la carta P.</strong> En una NP
        con tamanos desiguales no solo escalonan los limites: escalona tambien{" "}
        <em>la linea central</em>, porque el centro es <V>n</V><Sub>i</Sub>p
        {"\u0305"}. La carta se vuelve ilegible, y ademas dos puntos a la misma
        altura dejan de ser comparables {"\u2014"} 40 defectuosas en 100 unidades y
        40 en 500 son cosas muy distintas dibujadas en el mismo sitio.
      </Warn>
      <p>
        Este modulo permite tamanos desiguales y los calcula correctamente, pero
        avisa. La ventaja de la NP {"\u2014"} legibilidad {"\u2014"} desaparece
        justo cuando los tamanos dejan de ser constantes, y con ella su unica
        razon de ser.
      </p>
    </Section>

    <Section title="Sobredispersión">
      <p>
        Vale lo mismo que en la carta P. La binomial supone que todas las unidades
        del subgrupo tienen la misma probabilidad de fallar y que son
        independientes; con subgrupos grandes esa suposicion se rompe con
        facilidad, la variacion real supera a {"\u221A"}(<V>n</V>p(1{"\u2212"}p)),
        los limites salen demasiado estrechos y la carta senala sin parar.
        <Cite>5</Cite>
      </p>
      <Note>
        Se mide estandarizando los puntos y calculando su dispersion de corto
        plazo con el rango movil, igual que en una I-MR. Cerca de 1, la binomial
        describe bien los datos. Muy por encima, hay sobredispersion y el remedio
        estandar es una carta de Laney.<Cite>4</Cite>
      </Note>
    </Section>

    <Section title="Los cuatro tests">
      <p>
        Solo existen los cuatro primeros de Nelson<Cite>2</Cite>. Del 5 al 8 leen
        zonas de una sigma presuponiendo simetria, y la binomial solo es simetrica
        cuando <V>p</V> ronda 0,5.
      </p>
      <Note>
        El test 2 {"\u2014"} nueve puntos al mismo lado {"\u2014"} suele ser el
        mas util: una tasa de defectos rara vez salta de golpe, empeora
        despacio.
      </Note>
    </Section>

    <Section title="P, NP, C o U">
      <p>
        <strong>P</strong> y <strong>NP</strong> cuentan <em>unidades
        defectuosas</em>: cada unidad pasa o falla, y el conteo nunca puede
        exceder el tamano de muestra.
      </p>
      <p>
        <strong>C</strong> y <strong>U</strong> cuentan <em>defectos</em>, y una
        misma unidad puede llevar varios. Ahi el modelo es Poisson y el conteo no
        tiene techo.
      </p>
      <Warn>
        La prueba practica: si el conteo puede superar el numero de unidades
        inspeccionadas, no es una carta NP. Este modulo lo comprueba y rechaza la
        entrada.
      </Warn>
    </Section>

    <Section title="Ejemplo resuelto">
      <p>
        23 semanas, 250 empleados por semana, 1.225 con errores.{" "}
        p{"\u0305"} = 1225 / 5750 = 0,21304, luego <V>n</V>p{"\u0305"} = 250{" "}
        {"\u00D7"} 0,21304 = 53,26.
      </p>
      <p>
        {"\u03C3"} = {"\u221A"}(53,26 {"\u00D7"} 0,78696) = 6,474, y los limites
        53,26 {"\u00B1"} 19,42 {"\u2192"} 72,68 y 33,84.
      </p>
      <Note>
        La semana 23 da 78 y falla el test 1, el mismo punto que senalaba la carta
        P {"\u2014"} como tenia que ser. Y la misma lectura: las tres ultimas
        semanas son 63 {"\u00B7"} 65 {"\u00B7"} 78, subiendo. La carta senala un
        punto; la tendencia que lo precede es lo que permite actuar antes de la
        siguiente.
      </Note>
    </Section>

    <Refs title="Bibliografía" />
  </div>
);

const EN = () => (
  <div className="space-y-5">
    <Section title="The same chart on another scale">
      <p>
        The NP and P charts carry <strong>exactly the same information</strong>.
        One plots the count <V>d</V><Sub>i</Sub>, the other the proportion{" "}
        <V>d</V><Sub>i</Sub>/<V>n</V>. With constant <V>n</V> the difference is a
        scale factor: the points, the limits and the signals are the same, and no
        test can fail on one and not the other.
      </p>
      <Note>
        So why do both exist? Because of who reads the chart. A line supervisor
        thinks in <em>parts</em>: {"\u201C"}78 defective today{"\u201D"} needs no
        division. The proportion 0.312 is statistically cleaner and less
        immediate. The NP chart adds no statistics; it adds readability.
      </Note>
    </Section>

    <Section title="The limits">
      <Formula>
        p{"\u0305"} = {"\u03A3"}<V>d</V><Sub>i</Sub> / {"\u03A3"}<V>n</V>
        <Sub>i</Sub>
        {"\u00A0\u00A0\u00A0\u00A0"}
        CL = <V>n</V>p{"\u0305"} {"\u00B1"} 3 {"\u221A"}( <V>n</V>p{"\u0305"}(1
        {"\u2212"}p{"\u0305"}) )
      </Formula>
      <p>
        The estimated parameter is still the <strong>proportion</strong>: the
        centre line comes from multiplying it by <V>n</V> afterwards. The counts
        are not averaged directly, even though with constant <V>n</V> the answer
        coincides.
      </p>
      <p>
        The standard deviation is {"\u221A"}(<V>n</V>p(1{"\u2212"}p)), the P
        chart{"\u2019"}s multiplied by <V>n</V>. That is the whole change of
        scale.
      </p>
      <Warn>
        And the limits are clipped to 0 to <V>n</V>: a count of defective units
        cannot fall outside. When the LCL reaches zero {"\u2014"} which it always
        does when <V>n</V>p{"\u0305"} is small {"\u2014"} the chart loses its lower
        half and <strong>can no longer detect an improvement</strong>, only a
        deterioration.
      </Warn>
    </Section>

    <Section title="When NOT to use the NP chart">
      <Warn>
        <strong>If the sample size varies, use the P chart.</strong> On an NP
        chart with unequal sizes it is not only the limits that step: so does{" "}
        <em>the centre line</em>, because the centre is <V>n</V><Sub>i</Sub>p
        {"\u0305"}. The chart becomes unreadable, and worse, two points at the
        same height stop being comparable {"\u2014"} 40 defectives out of 100 and
        40 out of 500 are very different things drawn in the same place.
      </Warn>
      <p>
        This module allows unequal sizes and computes them correctly, but warns.
        The NP chart{"\u2019"}s one advantage {"\u2014"} readability {"\u2014"}
        disappears exactly when the sizes stop being constant, and with it its
        reason to exist.
      </p>
    </Section>

    <Section title="Overdispersion">
      <p>
        The same as on the P chart. The binomial assumes every unit in a subgroup
        shares the same probability of failing and that units are independent;
        with large subgroups that breaks easily, real variation exceeds{" "}
        {"\u221A"}(<V>n</V>p(1{"\u2212"}p)), the limits come out too narrow and the
        chart signals constantly.<Cite>5</Cite>
      </p>
      <Note>
        It is measured by standardising the points and taking their short-term
        spread with the moving range, as on an I-MR chart. Near 1, the binomial
        fits. Well above, there is overdispersion, and the standard remedy is a
        Laney chart.<Cite>4</Cite>
      </Note>
    </Section>

    <Section title="The four tests">
      <p>
        Only Nelson{"\u2019"}s first four exist<Cite>2</Cite>. Tests 5 to 8 read
        one-sigma zones assuming symmetry, and the binomial is symmetric only when{" "}
        <V>p</V> is near 0.5.
      </p>
      <Note>
        Test 2 {"\u2014"} nine points on one side {"\u2014"} is usually the most
        useful: a defect rate rarely jumps, it worsens slowly.
      </Note>
    </Section>

    <Section title="P, NP, C or U">
      <p>
        <strong>P</strong> and <strong>NP</strong> count <em>defective units</em>:
        each unit passes or fails, and the count can never exceed the sample size.
      </p>
      <p>
        <strong>C</strong> and <strong>U</strong> count <em>defects</em>, and one
        unit may carry several. There the model is Poisson and the count has no
        ceiling.
      </p>
      <Warn>
        The practical test: if the count can exceed the number of units inspected,
        it is not an NP chart. This module checks that and rejects the input.
      </Warn>
    </Section>

    <Section title="Worked example">
      <p>
        23 weeks, 250 employees a week, 1,225 with errors. p{"\u0305"} = 1225 /
        5750 = 0.21304, so <V>n</V>p{"\u0305"} = 250 {"\u00D7"} 0.21304 = 53.26.
      </p>
      <p>
        {"\u03C3"} = {"\u221A"}(53.26 {"\u00D7"} 0.78696) = 6.474, and the limits
        are 53.26 {"\u00B1"} 19.42 {"\u2192"} 72.68 and 33.84.
      </p>
      <Note>
        Week 23 is 78 and fails test 1 {"\u2014"} the same point the P chart
        flagged, as it had to be. And the same reading: the last three weeks run
        63 {"\u00B7"} 65 {"\u00B7"} 78, climbing. The chart flags a point; the
        trend leading to it is what lets you act before the next one.
      </Note>
    </Section>

    <Refs title="References" />
  </div>
);

export default function NPChartTheory() {
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
