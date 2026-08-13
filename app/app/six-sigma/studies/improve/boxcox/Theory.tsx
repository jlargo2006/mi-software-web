// app/app/six-sigma/studies/improve/boxcox/Theory.tsx
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
const Sup = ({ children }: { children: React.ReactNode }) => (
  <sup className="text-[0.7em]">{children}</sup>
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

const LAM = "\u03BB";
const MINUS = "\u2212";
const NEQ = "\u2260";
const ARROW = "\u2192";
const CHI = "\u03C7";

const FormulaBC = () => (
  <Formula>
    <div className="space-y-2">
      <div>
        <V>W</V> = <V>x</V><Sup>{LAM}</Sup>
        {"\u00a0\u00a0\u00a0"}si {LAM} {NEQ} 0
      </div>
      <div>
        <V>W</V> = ln(<V>x</V>)
        {"\u00a0\u00a0\u00a0"}si {LAM} = 0
      </div>
    </div>
  </Formula>
);

const FormulaNorm = () => (
  <Formula>
    <V>w</V> ={" "}
    <Frac
      num={<><V>x</V><Sup>{LAM}</Sup> {MINUS} 1</>}
      den={<>{LAM} {"\u00b7"} <V>g</V><Sup>{LAM}{MINUS}1</Sup></>}
    />
    {"\u00a0\u00a0\u00a0"}
    <V>g</V> = media geom&eacute;trica
  </Formula>
);

const ES = () => (
  <div className="space-y-5">
    <Section title="Para qué sirve">
      <p>
        Muchas herramientas —capacidad, gr&aacute;ficos de control, contrastes de
        medias— <strong>suponen normalidad</strong>. Cuando los datos son
        as&iacute;m&eacute;tricos, esta transformaci&oacute;n busca una potencia de
        la variable que los acerque a una normal, para poder aplicarlas.
      </p>
      <FormulaBC />
      <p>
        El caso {LAM} = 0 se define como el logaritmo porque es{" "}
        <strong>el l&iacute;mite</strong> de la familia cuando {LAM} tiende a cero,
        no una excepci&oacute;n arbitraria.
      </p>
      <Note>
        <strong>Todos los valores han de ser positivos.</strong> Con ceros o
        negativos no hay logaritmo ni potencia fraccionaria: suma antes una
        constante a la columna.
      </Note>
    </Section>

    <Section title="Cómo se elige lambda">
      <FormulaNorm />
      <p>
        Se recorre {LAM} entre {MINUS}5 y 5 y se elige el valor que{" "}
        <strong>minimiza la desviaci&oacute;n t&iacute;pica</strong> de los datos
        transformados. La divisi&oacute;n por la media geom&eacute;trica es lo que
        hace comparable la escala entre distintas lambdas: sin ella, bastar&iacute;a
        encoger los datos para bajar la desviaci&oacute;n y la curva no
        tendr&iacute;a m&iacute;nimo.
      </p>
      <p>
        La curva resultante es el gr&aacute;fico principal. Su forma de{" "}
        <strong>U</strong> muestra el m&iacute;nimo y, sobre todo,{" "}
        <strong>cu&aacute;n plano es</strong>: un valle ancho significa que muchas
        lambdas funcionan casi igual de bien.
      </p>
    </Section>

    <Section title="Valor redondeado">
      <p>
        El &oacute;ptimo suele ser un n&uacute;mero incomodo. Se redondea al m&aacute;s
        pr&oacute;ximo de la lista {MINUS}2, {MINUS}1, {MINUS}0,5, 0, 0,5, 1 y 2,
        que corresponden a transformaciones con significado:
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li>{LAM} = 0,5 {ARROW} ra&iacute;z cuadrada</li>
        <li>{LAM} = 0 {ARROW} logaritmo</li>
        <li>{LAM} = {MINUS}1 {ARROW} inversa</li>
        <li>{LAM} = 1 {ARROW} sin transformar</li>
      </ul>
      <Note>
        <strong>Usa siempre el redondeado</strong> si cae dentro del intervalo. Un
        exponente de 0,3409 ajusta un pel&iacute;n mejor <em>a esta muestra</em>,
        pero es irreproducible y no se puede explicar a nadie. La ra&iacute;z
        cuadrada, s&iacute;.
      </Note>
      <p>
        Que el intervalo <strong>contenga el 1</strong> es la se&ntilde;al de que no
        hace falta transformar nada.
      </p>
    </Section>

    <Section title="El intervalo de confianza">
      <p>
        Se traza una l&iacute;nea horizontal por encima del m&iacute;nimo, y los
        cortes con la curva dan los l&iacute;mites. La altura sale del criterio de
        raz&oacute;n de verosimilitudes:
      </p>
      <Formula>
        l&iacute;mite = <V>s</V><Sub>m&iacute;n</Sub> {"\u00b7"} exp
        <span className="text-lg">(</span>
        <Frac
          num={<>{CHI}<Sup>2</Sup><Sub>1,{"\u00a0"}1{MINUS}{"\u03B1"}</Sub></>}
          den={<>2 <V>gl</V></>}
        />
        <span className="text-lg">)</span>
      </Formula>
      <p>
        Cuanto m&aacute;s plano sea el valle, m&aacute;s ancho ser&aacute; el
        intervalo. Su anchura mide{" "}
        <strong>cu&aacute;nta confianza merece el {LAM} estimado</strong>, y suele ser
        mucho mayor de lo que la cifra puntual sugiere.
      </p>
      <Warn>
        <strong>Advertencia sobre este c&aacute;lculo.</strong> El intervalo{" "}
        <strong>no est&aacute; validado</strong> contra la referencia. En el conjunto
        de prueba nuestro criterio devuelve (0,18; 0,51) mientras que Minitab
        publica (0,14; 0,54), un 20&nbsp;% m&aacute;s ancho, y no hemos identificado
        qu&eacute; convenci&oacute;n reproduce esa cifra: se probaron la raz&oacute;n
        de verosimilitudes, la aproximaci&oacute;n normal con la informaci&oacute;n
        observada y tres variantes del l&iacute;mite horizontal, todas dentro de
        (0,17{MINUS}0,18; 0,51). <strong>El {LAM} estimado y el redondeado
        s&iacute; est&aacute;n verificados al d&iacute;gito</strong>; trata los dos
        l&iacute;mites como orientativos y no bases en ellos una decisi&oacute;n
        ajustada.
      </Warn>
    </Section>

    <Section title="Los subgrupos">
      <p>
        Con tama&ntilde;o 1 se usa la variabilidad global de la columna. Con
        subgrupos mayores se combina solo la variabilidad{" "}
        <strong>dentro</strong> de cada uno, que es lo pertinente en control de
        procesos: as&iacute; la transformaci&oacute;n no se deja arrastrar por las
        diferencias entre subgrupos, que son justamente lo que se quiere vigilar.
      </p>
      <Note>
        Si vas a usar el resultado en un gr&aacute;fico de control,{" "}
        <strong>emplea el mismo subgrupo</strong> que usar&aacute;s all&iacute;. Si
        solo buscas normalidad para un contraste, tama&ntilde;o 1.
      </Note>
    </Section>

    <Section title="Qué comprobar después">
      <p>
        Que el m&eacute;todo devuelva una lambda{" "}
        <strong>no garantiza que funcione</strong>: siempre devuelve una. Hay que
        verificarlo en la columna transformada.
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          Un <strong>contraste de normalidad</strong> sobre la nueva columna.
        </li>
        <li>
          La <strong>asimetr&iacute;a</strong>, que deber&iacute;a acercarse a cero.
        </li>
        <li>
          Un <strong>histograma</strong>, para ver si queda alguna cola o
          bimodalidad que la transformaci&oacute;n no puede arreglar.
        </li>
      </ul>
      <Note>
        Box-Cox corrige <strong>asimetr&iacute;a</strong>, nada m&aacute;s. No
        arregla datos bimodales, mezclas de poblaciones ni at&iacute;picos: esos
        problemas sobreviven a cualquier potencia.
      </Note>
    </Section>

    <Section title="Ejemplo resuelto">
      <p>Cien observaciones con asimetr&iacute;a positiva marcada:</p>
      <p className="font-mono text-xs">
        {LAM} estimado = 0,34 {"\u00b7"} redondeado = <strong>0,50</strong>
      </p>
      <p className="font-mono text-xs">
        desviaci&oacute;n m&iacute;nima = 0,661
      </p>
      <p>
        El redondeado cae dentro del intervalo, as&iacute; que se aplica{" "}
        <strong>la ra&iacute;z cuadrada</strong>. Los efectos:
      </p>
      <table className="text-xs border-collapse">
        <thead>
          <tr className="border-b border-gray-300">
            <th className="py-1 pr-6 text-left font-medium text-gray-600">
              Datos
            </th>
            <th className="py-1 pr-6 text-left font-medium text-gray-600">
              Asimetr&iacute;a
            </th>
            <th className="py-1 text-left font-medium text-gray-600">
              Anderson-Darling
            </th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-gray-200">
            <td className="py-1 pr-6">Originales</td>
            <td className="py-1 pr-6">1,953</td>
            <td className="py-1">2,883</td>
          </tr>
          <tr className="border-b border-gray-200">
            <td className="py-1 pr-6">Transformados</td>
            <td className="py-1 pr-6">0,457</td>
            <td className="py-1">0,265</td>
          </tr>
        </tbody>
      </table>
      <p className="mt-2">
        El estad&iacute;stico cae de 2,88 a 0,27: los originales rechazan la
        normalidad de forma contundente y los transformados no. La
        transformaci&oacute;n ha cumplido.
      </p>
      <Note>
        Repara en la <strong>curva</strong>: vale 0,661 en el m&iacute;nimo y 0,672
        en {LAM} = 0,5. La diferencia es del <strong>1,7&nbsp;%</strong>. Ese es el
        argumento a favor de redondear: se pierde una cantidad despreciable de
        ajuste y se gana una transformaci&oacute;n que cualquiera entiende.
      </Note>
      <p>
        Hacia los extremos, en cambio, la curva se dispara: 0,849 en {LAM} = 1 y
        2,434 en {LAM} = 2. Elegir mal la potencia se paga caro.
      </p>
    </Section>
  </div>
);

const EN = () => (
  <div className="space-y-5">
    <Section title="What it is for">
      <FormulaBC />
      <p>
        Capability studies, control charts and mean tests{" "}
        <strong>assume normality</strong>. When data are skewed, this
        transformation looks for a power of the variable that brings them close to
        a normal distribution. The {LAM} = 0 case is the logarithm because it is
        the <strong>limit</strong> of the family, not an arbitrary exception.
      </p>
      <Note>
        <strong>All values must be positive.</strong> Add a constant to the column
        first if they are not.
      </Note>
    </Section>

    <Section title="Choosing lambda">
      <FormulaNorm />
      <p>
        {LAM} is searched between {MINUS}5 and 5, keeping the value that{" "}
        <strong>minimises the standard deviation</strong> of the transformed data.
        Dividing by the geometric mean is what makes different lambdas comparable:
        without it, simply shrinking the scale would lower the deviation and the
        curve would have no minimum.
      </p>
      <p>
        The <strong>flatness</strong> of the resulting U-shaped curve matters as
        much as its minimum: a wide valley means many lambdas work almost equally
        well.
      </p>
    </Section>

    <Section title="Rounded value">
      <p>
        The optimum is rounded to the nearest of {MINUS}2, {MINUS}1, {MINUS}0.5, 0,
        0.5, 1 and 2 — square root, logarithm, reciprocal, no transformation.
      </p>
      <Note>
        <strong>Always prefer the rounded value</strong> when it falls inside the
        interval. An exponent of 0.3409 fits <em>this sample</em> marginally
        better but is irreproducible and impossible to explain. If the interval{" "}
        <strong>contains 1</strong>, no transformation is needed.
      </Note>
    </Section>

    <Section title="The confidence interval">
      <p>
        A horizontal line is drawn above the minimum and its intersections with
        the curve give the limits. The height follows the likelihood-ratio
        criterion, so a flatter valley yields a wider interval.
      </p>
      <Warn>
        <strong>This calculation is not validated.</strong> On the test data our
        criterion returns (0.18; 0.51) while the reference publishes (0.14; 0.54),
        some 20&nbsp;% wider, and we could not identify the convention behind it:
        likelihood ratio, the normal approximation from the observed information
        and three variants of the horizontal limit all land in (0.17{MINUS}0.18;
        0.51). <strong>The estimated and rounded {LAM} are verified exactly</strong>
        ; treat both limits as indicative only.
      </Warn>
    </Section>

    <Section title="Subgroups">
      <p>
        Size 1 uses the overall variation. Larger subgroups pool only the{" "}
        <strong>within-subgroup</strong> variation, which is what matters for
        process control: the transformation is then not driven by the
        between-subgroup differences you actually want to monitor.
      </p>
      <Note>
        Use the <strong>same subgrouping</strong> you will use in the control
        chart. For a plain normality fix, size 1.
      </Note>
    </Section>

    <Section title="What to check afterwards">
      <p>
        The method <strong>always</strong> returns a lambda, which is no guarantee
        that it worked. Verify on the transformed column with a normality test,
        the skewness and a histogram.
      </p>
      <Note>
        Box-Cox fixes <strong>skewness only</strong>. Bimodality, mixed
        populations and outliers survive any power transformation.
      </Note>
    </Section>

    <Section title="Worked example">
      <p>One hundred positively skewed observations:</p>
      <p className="font-mono text-xs">
        estimated {LAM} = 0.34 {"\u00b7"} rounded = <strong>0.50</strong>{" "}
        {"\u00b7"} minimum StDev = 0.661
      </p>
      <p>
        The square root is applied. Skewness falls from{" "}
        <strong>1.953 to 0.457</strong> and the Anderson-Darling statistic from{" "}
        <strong>2.883 to 0.265</strong>: the original data reject normality
        decisively, the transformed data do not.
      </p>
      <Note>
        The curve reads 0.661 at the minimum and 0.672 at {LAM} = 0.5 — a{" "}
        <strong>1.7&nbsp;%</strong> difference. That is the case for rounding.
        Further out it climbs fast: 0.849 at {LAM} = 1 and 2.434 at {LAM} = 2.
      </Note>
    </Section>
  </div>
);

export default function ImpBoxCoxTheory() {
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
