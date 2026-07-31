// app/app/six-sigma/studies/ht/anova1way/Theory.tsx
//
// ASCII puro: todo caracter no ASCII va como escape \uXXXX.
// Referencia rapida de escapes usados:
//   a=\u00e1  e=\u00e9  i=\u00ed  o=\u00f3  u=\u00fa  n=\u00f1  U=\u00da
//   alpha=\u03b1  mu=\u03bc  sigma=\u03c3  tau=\u03c4  eps=\u03b5  Sigma=\u03a3
//   sub0=\u2080 sub1=\u2081 sub2=\u2082  subi=\u1d62  subj=\u2c7c  subk=\u2096
//   raiz=\u221a  <=\u2264  >=\u2265  menos=\u2212  sup2=\u00b2  pm=\u00b1
//   neq=\u2260  in=\u2208  cdot=\u00b7  ellipsis=\u2026  ndash=\u2013  mdash=\u2014
//   xbar=x\u0304
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

// --- simbolos ---
const MU = "\u03BC";
const ALPHA = "\u03B1";
const SIGMA = "\u03C3";
const TAU = "\u03C4";
const EPS = "\u03B5";
const SUM = "\u03A3";
const NEQ = "\u2260";
const PM = "\u00B1";
const MINUS = "\u2212";
const GE = "\u2265";
const LE = "\u2264";
const CDOT = "\u00B7";
const SUP2 = "\u00B2";
const S0 = "\u2080";
const S1 = "\u2081";
const SI = "\u1D62";
const SJ = "\u2C7C";
const SK = "\u2096";
const ELL = "\u2026";
const XBAR = "x\u0304";

// --- formulas compartidas ---

const FormulaHyp = () => (
  <Formula>
    <div className="space-y-2">
      <div>
        H{S0}: {MU}{S1} = {MU}{"\u2082"} = {ELL} = {MU}{SK}
      </div>
      <div>
        H{S1}: al menos una {MU}{SI} difiere
      </div>
    </div>
  </Formula>
);

const FormulaModel = () => (
  <Formula>
    <V>x</V><Sub>{"ij"}</Sub> = {MU} + {TAU}<Sub>i</Sub> + {EPS}<Sub>{"ij"}</Sub>
    <span className="mx-6">
      {EPS}<Sub>{"ij"}</Sub> ~ N(0, {SIGMA}{SUP2})
    </span>
  </Formula>
);

const FormulaSS = () => (
  <Formula>
    <div className="space-y-3">
      <div>
        SS<Sub>Total</Sub> = SS<Sub>Factor</Sub> + SS<Sub>Error</Sub>
      </div>
      <div>
        SS<Sub>Factor</Sub> = {SUM}<Sub>i</Sub> <V>n</V><Sub>i</Sub> ({XBAR}
        <Sub>i</Sub> {MINUS} {XBAR})<Sup>2</Sup>
        <span className="ml-6">df = <V>k</V> {MINUS} 1</span>
      </div>
      <div>
        SS<Sub>Error</Sub> = {SUM}<Sub>i</Sub> {SUM}<Sub>j</Sub> (<V>x</V>
        <Sub>{"ij"}</Sub> {MINUS} {XBAR}<Sub>i</Sub>)<Sup>2</Sup>
        <span className="ml-6">df = <V>N</V> {MINUS} <V>k</V></span>
      </div>
      <div>
        SS<Sub>Total</Sub> = {SUM}<Sub>i</Sub> {SUM}<Sub>j</Sub> (<V>x</V>
        <Sub>{"ij"}</Sub> {MINUS} {XBAR})<Sup>2</Sup>
        <span className="ml-6">df = <V>N</V> {MINUS} 1</span>
      </div>
    </div>
  </Formula>
);

const FormulaF = () => (
  <Formula>
    <div className="space-y-3">
      <div>
        MS<Sub>Factor</Sub> ={" "}
        <Frac
          num={<>SS<Sub>Factor</Sub></>}
          den={<><V>k</V> {MINUS} 1</>}
        />
        <span className="mx-6">
          MS<Sub>Error</Sub> ={" "}
          <Frac
            num={<>SS<Sub>Error</Sub></>}
            den={<><V>N</V> {MINUS} <V>k</V></>}
          />
        </span>
      </div>
      <div>
        <V>F</V> ={" "}
        <Frac
          num={<>MS<Sub>Factor</Sub></>}
          den={<>MS<Sub>Error</Sub></>}
        />
        <span className="mx-6">
          <V>p</V> = P( <V>F</V>(<V>k</V>{MINUS}1, <V>N</V>{MINUS}<V>k</V>) {GE}{" "}
          <V>F</V><Sub>obs</Sub> )
        </span>
      </div>
    </div>
  </Formula>
);

const FormulaSummary = () => (
  <Formula>
    <div className="space-y-3">
      <div>
        <V>S</V> = <Sqrt>MS<Sub>Error</Sub></Sqrt>
      </div>
      <div>
        R-sq ={" "}
        <Frac num={<>SS<Sub>Factor</Sub></>} den={<>SS<Sub>Total</Sub></>} />
      </div>
      <div>
        R-sq(adj) = 1 {MINUS}{" "}
        <Frac
          num={<>MS<Sub>Error</Sub></>}
          den={<>SS<Sub>Total</Sub> / (<V>N</V>{MINUS}1)</>}
        />
      </div>
      <div>
        R-sq(pred) = 1 {MINUS}{" "}
        <Frac num={<>PRESS</>} den={<>SS<Sub>Total</Sub></>} />
      </div>
    </div>
  </Formula>
);

const FormulaCI = () => (
  <Formula>
    {XBAR}<Sub>i</Sub> {PM} <V>t</V>
    <Sub>
      1{MINUS}{ALPHA}/2, <V>N</V>{MINUS}<V>k</V>
    </Sub>{" "}
    {CDOT} <Frac num={<><V>S</V></>} den={<Sqrt><V>n</V><Sub>i</Sub></Sqrt>} />
  </Formula>
);

// =================== ES ===================

const ES = () => (
  <div className="space-y-5">
    <Section title={"Qu\u00e9 contrasta"}>
      <p>
        {"El ANOVA de un factor compara las medias de "}<V>k</V>
        {" grupos (los niveles del factor) para decidir si las diferencias observadas entre ellas son mayores de lo que cabr\u00eda esperar por la variabilidad natural del proceso."}
      </p>
      <FormulaHyp />
      <p>
        {"N\u00f3tese que H"}{S1}{" no indica "}<em>{"cu\u00e1l"}</em>
        {" media difiere. Si se rechaza H"}{S0}
        {", hace falta un an\u00e1lisis de comparaciones m\u00faltiples (Tukey, Dunnett) para identificar qu\u00e9 pares son significativamente distintos."}
      </p>
    </Section>

    <Section title="Modelo">
      <FormulaModel />
      <p>
        {"donde "}<V>x</V><Sub>{"ij"}</Sub>
        {" es la observaci\u00f3n j del nivel i, "}{MU}{" la media global, "}
        {TAU}<Sub>i</Sub>{" el efecto del nivel i y "}{EPS}<Sub>{"ij"}</Sub>
        {" el error aleatorio. El modelo asume una "}<strong>{"\u00fanica"}</strong>
        {" varianza "}{SIGMA}{SUP2}
        {" com\u00fan a todos los niveles: es la hip\u00f3tesis de igualdad de varianzas."}
      </p>
    </Section>

    <Section title={"Descomposici\u00f3n de la variabilidad"}>
      <p>
        {"La suma de cuadrados total se reparte en la parte explicada por el factor y la parte no explicada (error):"}
      </p>
      <FormulaSS />
      <p>
        {"SS"}<Sub>Factor</Sub>
        {" mide cu\u00e1nto se separan las medias de grupo de la media global; SS"}
        <Sub>Error</Sub>
        {" mide la dispersi\u00f3n dentro de cada grupo. Cada suma se convierte en media cuadr\u00e1tica dividiendo por sus grados de libertad."}
      </p>
    </Section>

    <Section title={"Estad\u00edstico de contraste"}>
      <FormulaF />
      <p>
        {"MS"}<Sub>Error</Sub>{" estima "}{SIGMA}{SUP2}{" siempre; MS"}
        <Sub>Factor</Sub>{" estima "}{SIGMA}{SUP2}{" "}
        <em>{"solo si H"}{S0}{" es cierta"}</em>
        {". Por eso un cociente "}<V>F</V>
        {" pr\u00f3ximo a 1 es compatible con H"}{S0}
        {", y valores grandes la ponen en duda. El contraste es siempre de cola derecha."}
      </p>
      <p>
        <strong>{"Decisi\u00f3n:"}</strong>{" si "}<V>p</V>{" "}{LE}{" "}{ALPHA}
        {" se rechaza H"}{S0}{" y se concluye que no todas las medias son iguales."}
      </p>
    </Section>

    <Section title="Resumen del modelo">
      <FormulaSummary />
      <p>
        <strong><V>S</V></strong>
        {" es la desviaci\u00f3n t\u00edpica agrupada, la mejor estimaci\u00f3n de la variabilidad interna del proceso. "}
        <strong>R-sq</strong>
        {" es la proporci\u00f3n de variabilidad explicada por el factor. "}
        <strong>R-sq(adj)</strong>
        {" penaliza el n\u00famero de niveles y permite comparar modelos distintos. "}
        <strong>R-sq(pred)</strong>
        {" se obtiene por validaci\u00f3n cruzada dejando fuera una observaci\u00f3n cada vez; si es mucho menor que R-sq, el modelo est\u00e1 sobreajustado."}
      </p>
    </Section>

    <Section title="Intervalos de confianza de las medias">
      <FormulaCI />
      <p>
        {"Un detalle importante: el intervalo de cada nivel se construye con la desviaci\u00f3n "}
        <strong>agrupada</strong>{" "}<V>S</V>
        {" y con los grados de libertad del "}<strong>error</strong>{" ("}<V>N</V>
        {" "}{MINUS}{" "}<V>k</V>
        {"), no con la desviaci\u00f3n y el tama\u00f1o de ese grupo por separado. Al usar la informaci\u00f3n de todas las muestras los intervalos son m\u00e1s estrechos y, si el dise\u00f1o est\u00e1 balanceado, todos tienen la misma amplitud. Esto es v\u00e1lido precisamente porque el modelo asume varianza com\u00fan."}
      </p>
    </Section>

    <Section title="Supuestos">
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>Independencia.</strong>
          {" Las observaciones no deben estar correlacionadas. Es el supuesto m\u00e1s cr\u00edtico y no se arregla a posteriori: depende de c\u00f3mo se recogieron los datos (aleatorizaci\u00f3n)."}
        </li>
        <li>
          <strong>Normalidad de los residuos.</strong>
          {" El ANOVA es bastante robusto frente a desviaciones moderadas, sobre todo con muestras equilibradas y "}
          <V>n</V>{" "}{GE}{" 10 por grupo."}
        </li>
        <li>
          <strong>Igualdad de varianzas.</strong>
          {" Si las varianzas difieren mucho (regla pr\u00e1ctica: la desviaci\u00f3n mayor m\u00e1s del doble de la menor), el "}
          <V>F</V>
          {" pierde validez. En ese caso conviene el test de Welch, que no asume varianzas iguales."}
        </li>
      </ul>
      <Note>
        {"Las tres gr\u00e1ficas del informe ayudan a valorar esto: el gr\u00e1fico de intervalos muestra las diferencias entre medias, y el de valores individuales y el diagrama de caja revelan la homogeneidad de la dispersi\u00f3n y la presencia de at\u00edpicos."}
      </Note>
    </Section>

    <Section title="Ejemplo resuelto">
      <p>
        {"Veinticuatro medidas de ppm VOC en tres turnos (8 por turno), "}
        {ALPHA}{" = 0,05:"}
      </p>
      <p className="font-mono text-xs">
        {XBAR}{S1}{" = 39,50 "}{CDOT}{" "}{XBAR}{"\u2082"}{" = 34,63 "}{CDOT}{" "}
        {XBAR}{"\u2083"}{" = 28,00 "}{CDOT}{" "}{XBAR}{" = 34,04"}
      </p>
      <p className="font-mono text-xs">
        {"SS"}{"\u1D62"}{"..."}{" Factor = 533,1 (df 2) "}{CDOT}
        {" Error = 795,9 (df 21) "}{CDOT}{" Total = 1329,0 (df 23)"}
      </p>
      <p className="font-mono text-xs">
        {"MS Factor = 266,54 "}{CDOT}{" MS Error = 37,90 "}{CDOT}{" "}<V>F</V>
        {" = 266,54/37,90 = 7,03 "}{CDOT}{" "}<V>p</V>{" = 0,005"}
      </p>
      <p className="font-mono text-xs">
        <V>S</V>{" = "}{"\u221A"}{"37,90 = 6,1562 "}{CDOT}{" R-sq = 533,1/1329,0 = 40,11%"}
      </p>
      <p className="font-mono text-xs">
        {"IC turno 1: 39,50 "}{PM}{" 2,0796 "}{CDOT}{" 6,1562/"}{"\u221A"}
        {"8 = (34,97; 44,03)"}
      </p>
      <p>
        {"Como "}<V>p</V>{" = 0,005 < 0,05 se rechaza H"}{S0}
        {": las medias de los tres turnos no son todas iguales. Los intervalos del turno 1 y del turno 3 no se solapan, lo que apunta a que la diferencia principal est\u00e1 entre esos dos."}
      </p>
    </Section>

    <Section title={"Interpretaci\u00f3n pr\u00e1ctica"}>
      <p>
        {"Significaci\u00f3n estad\u00edstica no equivale a relevancia industrial. Con muestras grandes, diferencias irrelevantes resultan significativas; con muestras peque\u00f1as, diferencias importantes pueden pasar desapercibidas. Conviene acompa\u00f1ar el "}
        <V>p</V>
        {"-valor con la magnitud de las diferencias entre medias y con los intervalos de confianza, y juzgarlas frente a la tolerancia o al criterio t\u00e9cnico del proceso."}
      </p>
    </Section>
  </div>
);

// =================== EN ===================

const EN = () => (
  <div className="space-y-5">
    <Section title="What it tests">
      <p>
        One-way ANOVA compares the means of <V>k</V> groups (the factor levels) to
        decide whether the observed differences between them are larger than would be
        expected from the natural variability of the process.
      </p>
      <FormulaHyp />
      <p>
        Note that H{S1} does not say <em>which</em> mean differs. If H{S0} is
        rejected, a multiple comparison analysis (Tukey, Dunnett) is needed to
        identify which pairs are significantly different.
      </p>
    </Section>

    <Section title="Model">
      <FormulaModel />
      <p>
        where <V>x</V><Sub>{"ij"}</Sub> is observation j of level i, {MU} the overall
        mean, {TAU}<Sub>i</Sub> the effect of level i and {EPS}<Sub>{"ij"}</Sub> the
        random error. The model assumes a <strong>single</strong> variance{" "}
        {SIGMA}{SUP2} common to all levels: this is the equal-variances assumption.
      </p>
    </Section>

    <Section title="Partition of variability">
      <p>
        The total sum of squares splits into the part explained by the factor and the
        unexplained part (error):
      </p>
      <FormulaSS />
      <p>
        SS<Sub>Factor</Sub> measures how far the group means are from the overall
        mean; SS<Sub>Error</Sub> measures the spread within each group. Each sum
        becomes a mean square when divided by its degrees of freedom.
      </p>
    </Section>

    <Section title="Test statistic">
      <FormulaF />
      <p>
        MS<Sub>Error</Sub> always estimates {SIGMA}{SUP2}; MS<Sub>Factor</Sub>{" "}
        estimates {SIGMA}{SUP2} <em>only if H{S0} is true</em>. That is why an{" "}
        <V>F</V> ratio close to 1 is consistent with H{S0}, while large values cast
        doubt on it. The test is always right-tailed.
      </p>
      <p>
        <strong>Decision:</strong> if <V>p</V> {LE} {ALPHA}, reject H{S0} and conclude
        that not all means are equal.
      </p>
    </Section>

    <Section title="Model summary">
      <FormulaSummary />
      <p>
        <strong><V>S</V></strong> is the pooled standard deviation, the best estimate
        of within-process variability. <strong>R-sq</strong> is the proportion of
        variability explained by the factor. <strong>R-sq(adj)</strong> penalises the
        number of levels and allows comparison across models.{" "}
        <strong>R-sq(pred)</strong> comes from leave-one-out cross validation; if it
        is much lower than R-sq, the model is overfitted.
      </p>
    </Section>

    <Section title="Confidence intervals for the means">
      <FormulaCI />
      <p>
        An important detail: each level interval is built with the{" "}
        <strong>pooled</strong> standard deviation <V>S</V> and the{" "}
        <strong>error</strong> degrees of freedom (<V>N</V> {MINUS} <V>k</V>), not
        with that group{"\u2019"}s own standard deviation and size. Using the
        information from all samples makes the intervals narrower and, in a balanced
        design, all of equal width. This is valid precisely because the model assumes
        a common variance.
      </p>
    </Section>

    <Section title="Assumptions">
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>Independence.</strong> Observations must not be correlated. This is
          the most critical assumption and cannot be fixed afterwards: it depends on
          how the data were collected (randomisation).
        </li>
        <li>
          <strong>Normality of residuals.</strong> ANOVA is fairly robust to moderate
          departures, especially with balanced samples and <V>n</V> {GE} 10 per group.
        </li>
        <li>
          <strong>Equal variances.</strong> If variances differ widely (rule of thumb:
          the largest standard deviation more than twice the smallest), the{" "}
          <V>F</V> test loses validity. Welch{"\u2019"}s test, which does not assume
          equal variances, is then preferable.
        </li>
      </ul>
      <Note>
        The three graphs in the report support these checks: the interval plot shows
        the differences between means, while the individual value plot and the boxplot
        reveal how homogeneous the spread is and whether outliers are present.
      </Note>
    </Section>

    <Section title="Worked example">
      <p>
        Twenty-four ppm VOC measurements across three shifts (8 per shift),{" "}
        {ALPHA} = 0.05:
      </p>
      <p className="font-mono text-xs">
        {XBAR}{S1} = 39.50 {CDOT} {XBAR}{"\u2082"} = 34.63 {CDOT} {XBAR}
        {"\u2083"} = 28.00 {CDOT} {XBAR} = 34.04
      </p>
      <p className="font-mono text-xs">
        SS Factor = 533.1 (df 2) {CDOT} Error = 795.9 (df 21) {CDOT} Total = 1329.0
        (df 23)
      </p>
      <p className="font-mono text-xs">
        MS Factor = 266.54 {CDOT} MS Error = 37.90 {CDOT} <V>F</V> = 266.54/37.90 =
        7.03 {CDOT} <V>p</V> = 0.005
      </p>
      <p className="font-mono text-xs">
        <V>S</V> = {"\u221A"}37.90 = 6.1562 {CDOT} R-sq = 533.1/1329.0 = 40.11%
      </p>
      <p className="font-mono text-xs">
        Shift 1 CI: 39.50 {PM} 2.0796 {CDOT} 6.1562/{"\u221A"}8 = (34.97, 44.03)
      </p>
      <p>
        Since <V>p</V> = 0.005 {"<"} 0.05, reject H{S0}: the three shift means are not
        all equal. The intervals for shift 1 and shift 3 do not overlap, suggesting
        the main difference lies between those two.
      </p>
    </Section>

    <Section title="Practical interpretation">
      <p>
        Statistical significance is not industrial relevance. With large samples,
        trivial differences turn out significant; with small samples, important
        differences may go unnoticed. Always read the <V>p</V>-value together with the
        magnitude of the differences between means and their confidence intervals, and
        judge them against the tolerance or the engineering criterion of the process.
      </p>
    </Section>
  </div>
);

export default function HTAnova1WayTheory() {
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
