// app/app/six-sigma/studies/doe/factorial/analyze/Theory.tsx
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
    <Section title="Qué hace este estudio">
      <p>
        Ajusta un modelo de regresi&oacute;n donde los predictores son los
        factores <strong>codificados en {"\u2212"}1 y +1</strong>, m&aacute;s sus
        interacciones. Con esa codificaci&oacute;n las columnas quedan{" "}
        <strong>ortogonales</strong>: los VIF valen 1,00 exacto y cada efecto se
        estima sin interferencia de los dem&aacute;s.
      </p>
      <p>
        El objetivo pr&aacute;ctico es <strong>quitar t&eacute;rminos</strong>{" "}
        hasta quedarte con los pocos que de verdad mueven la respuesta.
      </p>
    </Section>

    <Section title="Efecto y coeficiente">
      <Formula>
        Efecto = <V>y</V><Sub>alto</Sub> {"\u2212"} <V>y</V><Sub>bajo</Sub>{" "}
        {"\u00a0\u00a0\u00a0"} Coef ={" "}
        <Frac num={<>Efecto</>} den={<>2</>} />
      </Formula>
      <p>
        El <strong>efecto</strong> es lo que cambia la respuesta al pasar del
        nivel bajo al alto: se lee directamente en unidades reales. El{" "}
        <strong>coeficiente</strong> es su mitad, porque al ir de {"\u2212"}1 a
        +1 la variable codificada recorre <em>dos</em> unidades.
      </p>
      <Note>
        Usa el <strong>efecto</strong> para hablar con ingenier&iacute;a y el{" "}
        <strong>coeficiente</strong> para escribir la ecuaci&oacute;n. Dicen lo
        mismo con distinta escala.
      </Note>
    </Section>

    <Section title="La regla de la jerarquía">
      <p>
        Un modelo es <strong>jer&aacute;rquico</strong> si cada
        interacci&oacute;n tiene dentro todos sus factores por separado. Si
        est&aacute; A*C, tienen que estar A y C.
      </p>
      <Warn>
        <strong>Un efecto principal no se retira mientras siga viva una
        interacci&oacute;n suya</strong>, por muy alto que sea su p-valor. No es
        una convenci&oacute;n: sin el t&eacute;rmino principal, el coeficiente de
        la interacci&oacute;n depende de d&oacute;nde pongas el cero de la
        escala, y deja de significar nada.
      </Warn>
      <p>
        Por eso el consejo de esta herramienta{" "}
        <strong>solo propone t&eacute;rminos retirables</strong>: los que no son
        padres de ning&uacute;n otro que siga dentro. En la pr&aacute;ctica se
        poda <em>de arriba abajo</em>, empezando por las interacciones de orden
        m&aacute;s alto.
      </p>
    </Section>

    <Section title="Cómo se poda">
      <ol className="list-decimal pl-5 space-y-1">
        <li>Mira los t&eacute;rminos que pueden salir sin romper la jerarqu&iacute;a.</li>
        <li>De esos, quita <strong>el de mayor p-valor</strong>, si pasa de alfa.</li>
        <li>Vuelve a ajustar. <strong>Todo cambia.</strong></li>
        <li>Repite hasta que no quede nada que quitar.</li>
      </ol>
      <Note>
        <strong>Uno cada vez.</strong> Cada t&eacute;rmino que sale devuelve un
        grado de libertad al error, lo que reduce el cuadrado medio residual y{" "}
        <em>afila todos los contrastes restantes</em>. Quitar tres de golpe se
        salta esa mejora y puede tirar algo que habr&iacute;a sobrevivido.
      </Note>
    </Section>

    <Section title="Los dos gráficos de efectos">
      <p>
        <strong>Pareto.</strong> Barras de |T| ordenadas de mayor a menor, con
        una l&iacute;nea en el valor cr&iacute;tico de la t. Lo que la pasa es
        significativo. Es el m&aacute;s r&aacute;pido de leer, y la l&iacute;nea
        se mueve seg&uacute;n avanzas: con m&aacute;s grados de libertad, baja.
      </p>
      <p>
        <strong>Normal.</strong> Los efectos tipificados sobre papel
        probabil&iacute;stico normal. La idea es elegante: si un efecto es nulo,
        lo que mides es ruido, y los ruidos se alinean en una recta. Los que{" "}
        <strong>se salen de la recta</strong> son los reales.
      </p>
      <Note>
        La recta se ajusta <strong>solo con los no significativos</strong>, que
        son los que representan el ruido. Incluir los grandes la
        inclinar&iacute;a y disimular&iacute;a justo lo que se busca.
      </Note>
    </Section>

    <Section title="Cuando no queda error: el método de Lenth">
      <p>
        Un factorial completo con <strong>una sola r&eacute;plica</strong> y
        todos los t&eacute;rminos gasta cada corrida en estimar un
        par&aacute;metro: 8 corridas, 8 t&eacute;rminos, cero grados de libertad.
        Sin residuo no hay con qu&eacute; comparar y ning&uacute;n p-valor es
        posible por la v&iacute;a normal.
      </p>
      <Formula>
        PSE = 1,5 {"\u00b7"} mediana{"\u007B"} |efecto| : |efecto| &lt; 2,5{" "}
        <V>s</V><Sub>0</Sub> {"\u007D"}
      </Formula>
      <p>
        Lenth apuesta a que <strong>la mayor&iacute;a de los efectos son
        nulos</strong>. Si es as&iacute;, la mediana de sus magnitudes mide el
        ruido. Se calcula, se descartan los grandes para que no la contaminen, y
        se recalcula.
      </p>
      <Warn>
        Es un <strong>apa&ntilde;o</strong>, no un contraste con error puro. Si
        muchos efectos son reales, el PSE se infla y el m&eacute;todo pierde
        potencia. Con&nbsp;fi&aacute;rmalo con r&eacute;plicas antes de tomar
        decisiones caras.
      </Warn>
    </Section>

    <Section title="Puntos centrales: la prueba de curvatura">
      <p>
        Con dos niveles el modelo es un <strong>plano</strong>: por dos puntos
        pasa una recta y no hay forma de saber si el camino entre ellos es recto o
        curvo. Los <strong>puntos centrales</strong> lo resuelven a&ntilde;adiendo
        corridas en el punto medio de todos los factores.
      </p>
      <Formula>
        Ct Pt = <V>y</V><Sub>centro</Sub> {"\u2212"} <V>y</V><Sub>esquinas</Sub>
      </Formula>
      <p>
        No entran como un tercer nivel. Entran como un{" "}
        <strong>t&eacute;rmino indicador</strong>: vale 1 en las corridas
        centrales y 0 en las esquinas. Su coeficiente mide cu&aacute;nto se
        desv&iacute;a el centro de lo que el plano predice.
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>Ct Pt no significativo:</strong> el centro cae donde el plano
          dice. El modelo lineal con interacciones basta.
        </li>
        <li>
          <strong>Ct Pt significativo:</strong> hay curvatura. Un modelo de dos
          niveles <em>no puede</em> describir el proceso, y hace falta un
          dise&ntilde;o de superficie de respuesta.
        </li>
      </ul>
      <Note>
        Su error t&iacute;pico es <strong>distinto</strong> del de los
        dem&aacute;s t&eacute;rminos, y con raz&oacute;n: los puntos centrales son
        pocos frente a las esquinas, as&iacute; que su coeficiente se estima con
        menos precisi&oacute;n.
      </Note>
      <Warn>
        <strong>Ct Pt no se retira nunca para ganar un grado de
        libertad.</strong> Si lo quitas teniendo puntos centrales, su
        variabilidad se va al error, que queda inflado, y todos los
        contrastes salen sesgados. Es lo contrario de lo que buscabas.
      </Warn>
    </Section>

    <Section title="Bloques: separar la molestia del efecto">
      <p>
        Rara vez se corre un experimento entero de una sentada. Se parte en dos
        d&iacute;as, tres lotes de materia prima, dos operarios. Esa
        divisi&oacute;n <strong>a&ntilde;ade variaci&oacute;n</strong>, y si no la
        declaras acaba en el error.
      </p>
      <p>
        Un <strong>bloque</strong> es un grupo de corridas hechas en condiciones
        homog&eacute;neas. Declararlo le da al modelo un sitio donde poner esa
        variaci&oacute;n, en vez de dejar que contamine el residuo.
      </p>
      <Formula>
        <V>Z</V><Sub>1</Sub> = (1, 0, {"\u2212"}1){"\u00a0\u00a0\u00a0"}
        <V>Z</V><Sub>2</Sub> = (0, 1, {"\u2212"}1)
      </Formula>
      <p>
        Con <V>b</V> bloques hacen falta <V>b</V> {"\u2212"} 1 columnas. No son
        variables indicadoras 0/1, sino <strong>codificaci&oacute;n de
        efectos</strong>: cada columna vale 1 en su bloque, {"\u2212"}1 en el{" "}
        <em>&uacute;ltimo</em> y 0 en el resto.
      </p>
      <Note>
        La diferencia importa por tres motivos. Los coeficientes{" "}
        <strong>suman cero</strong>, de modo que el del &uacute;ltimo bloque es
        menos la suma de los otros y no se imprime. La constante del modelo es la{" "}
        <strong>media global</strong>, no la media de un bloque de referencia. Y
        los VIF de los bloques <strong>pasan de 1</strong> {"\u2014"} con tres
        bloques valen 1,33 {"\u2014"} porque sus columnas est&aacute;n
        correlacionadas entre s&iacute;. Es inevitable y no indica ning&uacute;n
        problema.
      </Note>
      <Warn>
        <strong>Un bloque no es un factor.</strong> No te interesa saber
        qu&eacute; d&iacute;a fue mejor: no vas a fabricar los martes. Los bloques
        se declaran para <em>quitarlos de en medio</em>, y no se interpretan ni se
        podan por su p-valor.
      </Warn>
      <p>
        Lo que compras es un <strong>error m&aacute;s peque&ntilde;o</strong>, y
        con &eacute;l contrastes m&aacute;s finos sobre los factores que s&iacute;
        te importan. El precio son <V>b</V> {"\u2212"} 1 grados de libertad.
      </p>
    </Section>

    <Section title="Ejemplo: lo que cambia al declarar los bloques">
      <p>
        Doce corridas, dos factores, tres bloques. Los mismos datos analizados de
        las dos maneras:
      </p>
      <table className="text-xs border-collapse">
        <thead>
          <tr className="border-b border-gray-300">
            <th className="py-1 pr-4 text-left font-medium text-gray-600">
              {"\u00a0"}
            </th>
            <th className="py-1 pr-4 text-left font-medium text-gray-600">
              Sin bloques
            </th>
            <th className="py-1 text-left font-medium text-gray-600">
              Con bloques
            </th>
          </tr>
        </thead>
        <tbody>
          {[
            ["S", "3,2517", "1,8966"],
            ["R-sq(adj)", "47,18 %", "82,03 %"],
            ["Error MS", "10,574", "3,597"],
            ["Error DF", "8", "6"],
            ["Efecto de A*B", "\u22123,035", "\u22123,035"],
            ["p de A*B", "0,145", "0,032"],
          ].map((row) => (
            <tr key={row[0]} className="border-b border-gray-200">
              {row.map((c, i) => (
                <td key={i} className={i < 2 ? "py-1 pr-4" : "py-1"}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <Note>
        Mira las dos &uacute;ltimas filas. <strong>El efecto de A*B no cambia ni
        un decimal</strong>: sigue siendo {"\u2212"}3,035. Lo &uacute;nico que
        cambia es el denominador del contraste. Al declarar los bloques, 63,0 de
        suma de cuadrados salen del error y se van a donde correspond&iacute;an, y
        el cuadrado medio residual cae de 10,574 a 3,597.
      </Note>
      <p>
        A*B pasa de <strong>no significativa a significativa</strong> sin que el
        efecto se mueva. Cost&oacute; dos grados de libertad, de 8 a 6, y aun
        as&iacute; los contrastes salen m&aacute;s potentes: lo que se retira del
        error es muy superior a lo que cuesta retirarlo.
      </p>
      <Warn>
        La lectura pr&aacute;ctica es inc&oacute;moda. Si <em>no</em> declaras los
        bloques, la interacci&oacute;n se te escapa y concluyes que no existe.
        Habr&iacute;as tomado la decisi&oacute;n equivocada con los datos
        correctos, por no contarle al modelo c&oacute;mo se hizo el experimento.
      </Warn>
    </Section>
    
    <Section title="La ecuación en unidades no codificadas">
      <p>
        La ecuaci&oacute;n codificada sirve para comparar efectos; la{" "}
        <strong>no codificada</strong>, para predecir con valores reales. Se
        obtiene sustituyendo cada variable codificada por su definici&oacute;n y
        expandiendo:
      </p>
      <Formula>
        <V>x</V><Sub>cod</Sub> ={" "}
        <Frac
          num={
            <>
              <V>x</V> {"\u2212"} centro
            </>
          }
          den={<>semirrecorrido</>}
        />
      </Formula>
      <Warn>
        <strong>Un factor de texto se queda en {"\u2212"}1 / +1.</strong> No hay
        una escala real sobre la que decodificarlo: &laquo;proveedor A&raquo; no
        es un n&uacute;mero. Su coeficiente en la ecuaci&oacute;n sigue siendo el
        codificado.
      </Warn>
      <Note>
        Los coeficientes no codificados <strong>no son comparables</strong> entre
        s&iacute;: cada uno viene en las unidades de su factor. Para ordenar por
        importancia, usa siempre los codificados.
      </Note>
    </Section>

    <Section title="Alias">
      <p>
        En un factorial completo cada t&eacute;rmino aparece solo en su
        l&iacute;nea: nada se confunde con nada. En uno fraccionado, dos o
        m&aacute;s t&eacute;rminos comparten columna y{" "}
        <strong>su efecto estimado es la suma de todos ellos</strong>.
      </p>
      <p>
        Aqu&iacute; los alias se detectan <strong>sobre los datos</strong>,
        comparando columnas codificadas, no a partir de los generadores. Es lo
        &uacute;nico posible cuando el dise&ntilde;o llega desde una hoja de
        c&aacute;lculo, y tiene una ventaja: detecta tambi&eacute;n la
        confusi&oacute;n accidental de un dise&ntilde;o mal introducido.
      </p>
    </Section>

    <Section title="Cautelas">
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>Los p-valores del modelo final son optimistas.</strong> Se ha
          llegado a &eacute;l mirando los datos, y esa b&uacute;squeda no entra
          en el c&aacute;lculo.
        </li>
        <li>
          <strong>R-sq siempre sube</strong> al a&ntilde;adir t&eacute;rminos. Con
          el modelo saturado vale 100 % y no informa de nada. Mira R-sq(pred).
        </li>
        <li>
          <strong>Los gr&aacute;ficos usan medias ajustadas</strong>, no medias de
          los datos. Con el modelo completo coinciden; con uno reducido, no, y
          las ajustadas son las buenas porque han filtrado el ruido.
        </li>
        <li>
          <strong>No extrapoles.</strong> El modelo solo vale entre los dos
          niveles ensayados.
        </li>
        <li>
          <strong>Con dos niveles no hay curvatura</strong> detectable: por dos
          puntos siempre pasa una recta. Para eso hacen falta puntos centrales.
        </li>
      </ul>
    </Section>

    <Section title="Ejemplo resuelto">
      <p>
        Rendimiento frente a Temp, Conc y Supplier. 16 corridas, dos
        r&eacute;plicas, modelo completo de orden 3. S = 0,7246, R-sq = 99,84 %,
        8 grados de libertad para el error.
      </p>
      <table className="text-xs border-collapse">
        <thead>
          <tr className="border-b border-gray-300">
            <th className="py-1 pr-4 text-left font-medium text-gray-600">
              T&eacute;rmino
            </th>
            <th className="py-1 pr-4 text-left font-medium text-gray-600">
              Efecto
            </th>
            <th className="py-1 text-left font-medium text-gray-600">p</th>
          </tr>
        </thead>
        <tbody>
          {[
            ["Temp", "23,450", "0,000"],
            ["Temp*Supplier", "10,050", "0,000"],
            ["Conc", "0,575", "0,151"],
            ["Conc*Supplier", "\u22120,475", "0,226"],
            ["Temp*Conc*Supplier", "0,175", "0,642"],
            ["Temp*Conc", "\u22120,025", "0,947"],
            ["Supplier", "0,000", "1,000"],
          ].map((row) => (
            <tr key={row[0]} className="border-b border-gray-200">
              {row.map((c, i) => (
                <td key={i} className={i < 2 ? "py-1 pr-4" : "py-1"}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2">
        <strong>Supplier tiene p = 1,000 y efecto exactamente cero</strong>, y
        aun as&iacute; <em>no se puede quitar</em>: participa en Temp*Supplier,
        que es el segundo efecto m&aacute;s grande del experimento. Es el caso de
        libro de la regla jer&aacute;rquica.
      </p>
      <p>La poda va de arriba abajo:</p>
      <table className="text-xs border-collapse">
        <thead>
          <tr className="border-b border-gray-300">
            <th className="py-1 pr-4 text-left font-medium text-gray-600">
              Paso
            </th>
            <th className="py-1 pr-4 text-left font-medium text-gray-600">
              Se retira
            </th>
            <th className="py-1 text-left font-medium text-gray-600">p</th>
          </tr>
        </thead>
        <tbody>
          {[
            ["1", "Temp*Conc*Supplier", "0,642"],
            ["2", "Temp*Conc", "0,944"],
            ["3", "Conc*Supplier", "0,179"],
            ["4", "Conc", "0,123"],
          ].map((row) => (
            <tr key={row[0]} className="border-b border-gray-200">
              {row.map((c, i) => (
                <td key={i} className={i < 2 ? "py-1 pr-4" : "py-1"}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2">
        Quedan <strong>Temp, Supplier y Temp*Supplier</strong>. Y f&iacute;jate en
        el paso 3: el p-valor de Conc*Supplier era 0,226 al principio y{" "}
        <strong>0,179</strong> cuando le toc&oacute;. Los p-valores se mueven a
        cada paso, que es justo la raz&oacute;n de podar de uno en uno.
      </p>
      <Note>
        La lectura t&eacute;cnica: la concentraci&oacute;n <strong>no importa</strong>{" "}
        en el rango ensayado, y el proveedor <strong>solo importa a
        temperatura alta</strong>. A 25 grados los dos proveedores rinden igual; a
        45 se separan diez unidades. Ese es todo el experimento en una frase, y
        no se ve&iacute;a en la tabla de efectos principales.
      </Note>
    </Section>
  </div>
);

const EN = () => (
  <div className="space-y-5">
    <Section title="What this study does">
      <p>
        It fits a regression whose predictors are the factors coded{" "}
        <strong>{"\u2212"}1 and +1</strong>, plus their interactions. That coding
        makes the columns <strong>orthogonal</strong>: every VIF is exactly 1.00
        and each effect is estimated free of the others.
      </p>
    </Section>

    <Section title="Effect and coefficient">
      <Formula>
        Effect = <V>y</V><Sub>high</Sub> {"\u2212"} <V>y</V><Sub>low</Sub>{" "}
        {"\u00a0\u00a0\u00a0"} Coef = <Frac num={<>Effect</>} den={<>2</>} />
      </Formula>
      <p>
        The coefficient is half the effect, because going from {"\u2212"}1 to +1
        covers <em>two</em> coded units.
      </p>
    </Section>

    <Section title="The hierarchy rule">
      <Warn>
        <strong>A main effect never leaves while one of its interactions
        stays</strong>, however large its p-value. Without the main term, the
        interaction coefficient depends on where the zero of the scale sits, and
        stops meaning anything.
      </Warn>
      <p>
        So the advice panel only ever proposes <strong>removable</strong> terms:
        those that are not contained in anything still in the model. Pruning goes{" "}
        <em>top down</em>, highest-order interactions first.
      </p>
    </Section>

    <Section title="How to prune">
      <ol className="list-decimal pl-5 space-y-1">
        <li>List the terms that can leave without breaking the hierarchy.</li>
        <li>Drop the one with the <strong>largest p-value</strong>, if above alpha.</li>
        <li>Refit. <strong>Everything changes.</strong></li>
        <li>Repeat until nothing is left to drop.</li>
      </ol>
      <Note>
        <strong>One at a time.</strong> Each term removed returns a degree of
        freedom to the error, which lowers the residual mean square and{" "}
        <em>sharpens every remaining test</em>.
      </Note>
    </Section>

    <Section title="The two effects plots">
      <p>
        <strong>Pareto</strong> — bars of |T| in descending order with the
        critical t drawn across. Fastest to read.
      </p>
      <p>
        <strong>Normal</strong> — standardized effects on normal probability
        paper. Null effects are noise, and noise falls on a straight line. What{" "}
        <strong>strays from the line</strong> is real.
      </p>
      <Note>
        The line is fitted to the <strong>non-significant effects only</strong>.
        Including the large ones would tilt it and hide the very thing being
        looked for.
      </Note>
    </Section>

    <Section title="When there is no error left: Lenth">
      <Formula>
        PSE = 1.5 {"\u00b7"} median{"\u007B"} |effect| : |effect| &lt; 2.5{" "}
        <V>s</V><Sub>0</Sub> {"\u007D"}
      </Formula>
      <p>
        A saturated design has no residual to test against. Lenth bets that{" "}
        <strong>most effects are null</strong>, so the median of their magnitudes
        measures the noise. The large ones are trimmed out so they cannot
        contaminate it.
      </p>
      <Warn>
        It is a <strong>workaround</strong>, not a test against pure error. If
        many effects are real the PSE inflates and the method loses power.
        Confirm with replicates.
      </Warn>
    </Section>

    <Section title="The uncoded equation">
      <Formula>
        <V>x</V><Sub>coded</Sub> ={" "}
        <Frac
          num={
            <>
              <V>x</V> {"\u2212"} centre
            </>
          }
          den={<>half-range</>}
        />
      </Formula>
      <Warn>
        <strong>A text factor keeps its {"\u2212"}1 / +1 coding.</strong> There is
        no real scale to decode it onto: &ldquo;supplier A&rdquo; is not a number.
      </Warn>
      <Note>
        Uncoded coefficients are <strong>not comparable</strong> with each other,
        since each carries the units of its own factor. Rank importance on the
        coded ones.
      </Note>
    </Section>

    <Section title="Cautions">
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>Final p-values are optimistic</strong> — the model was reached
          by looking at the data.
        </li>
        <li>
          <strong>R-sq only rises.</strong> A saturated model gives 100% and says
          nothing. Read R-sq(pred).
        </li>
        <li>
          <strong>Plots use fitted means</strong>, which follow the terms you
          keep.
        </li>
        <li>
          <strong>Two levels cannot show curvature.</strong> Center points can.
        </li>
      </ul>
    </Section>

    <Section title="Worked example">
      <p>
        Yield against Temp, Conc and Supplier; 16 runs, two replicates. Temp has
        an effect of 23.450 and Temp*Supplier one of 10.050, both at p = 0.000.
      </p>
      <Note>
        <strong>Supplier has p = 1.000 and an effect of exactly zero</strong>, yet
        cannot be removed: it sits inside Temp*Supplier, the second largest effect
        in the experiment. Pruning removes Temp*Conc*Supplier, Temp*Conc,
        Conc*Supplier and Conc, leaving{" "}
        <strong>Temp, Supplier and Temp*Supplier</strong>. In one sentence:
        concentration does not matter, and the supplier only matters at high
        temperature.
      </Note>
    </Section>
  </div>
);

export default function DoeAnalyzeTheory() {
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
