// app/app/six-sigma/studies/ht/eqvar/Theory.tsx
"use client";
import React from "react";

// ---------------------------------------------------------------------------
// ARCHIVO ASCII PURO. Todo caracter no ASCII va como escape \uXXXX.
// Tabla de referencia:
//   a=\u00e1  e=\u00e9  i=\u00ed  o=\u00f3  u=\u00fa  n~=\u00f1  ?=\u00bf
//   alpha=\u03b1  mu=\u03bc  sigma=\u03c3  Sigma=\u03a3  gamma=\u03b3  chi=\u03c7
//   sub0=\u2080 sub1=\u2081 sub2=\u2082 sub4=\u2084 subi=\u1d62 subj=\u2c7c subk=\u2096
//   sqrt=\u221a  <=\u2264  >=\u2265  !=\u2260  minus=\u2212  sup2=\u00b2  sup4=\u2074
//   +-=\u00b1  dash=\u2014  apos=\u2019
// ---------------------------------------------------------------------------

const GREEN = "#00674d";

const A = "\u00e1";
const E = "\u00e9";
const I = "\u00ed";
const O = "\u00f3";
const U = "\u00fa";
const N = "\u00f1";
const IQ = "\u00bf";
const ALPHA = "\u03b1";
const SIGMA = "\u03c3";
const GAMMA = "\u03b3";
const SUB0 = "\u2080";
const SUB1 = "\u2081";
const SUB2 = "\u2082";
const SUB4 = "\u2084";
const SUBI = "\u1d62";
const SUBJ = "\u2c7c";
const SUBK = "\u2096";
const SQRT = "\u221a";
const NE = "\u2260";
const MINUS = "\u2212";
const SUP2 = "\u00b2";
const SUP4 = "\u2074";
const PM = "\u00b1";
const DASH = "\u2014";
const APOS = "\u2019";

// --- helpers de presentacion (mismo patron que twosamplet/Theory.tsx) ---

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <section className="mb-4">
    <h4 className="font-semibold text-gray-800 mb-1">{title}</h4>
    <div className="text-sm text-gray-700 space-y-2">{children}</div>
  </section>
);

const Formula = ({ children }: { children: React.ReactNode }) => (
  <pre className="bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm overflow-x-auto whitespace-pre">
    {children}
  </pre>
);

const V = ({ children }: { children: React.ReactNode }) => (
  <span className="font-medium text-gray-900">{children}</span>
);

const Note = ({ children }: { children: React.ReactNode }) => (
  <p className="text-xs text-gray-500">{children}</p>
);

// --- formulas compartidas por los dos idiomas ---

const FML_BONETT =
  "                      /                                        \\\n" +
  "  " + SIGMA + SUBI + "  " + MINUS + MINUS + ">   exp | ln(c " + DASH + " s" + SUBI + SUP2 + ")  " + PM + "  z " + DASH + " c " + DASH + " " + SQRT + "( (" + GAMMA + SUB4 + " " + MINUS + " (n" + MINUS + "3)/n) / (n" + MINUS + "1) ) |\n" +
  "                      \\                                        /\n" +
  "\n" +
  "                    n\n" +
  "        c  =  ---------- ,      z = z(1 " + MINUS + " " + ALPHA + "/2k)\n" +
  "                 n " + MINUS + " z\n" +
  "\n" +
  "  El IC para " + SIGMA + SUBI + " es la ra" + I + "z cuadrada del intervalo anterior.";

const FML_KURT =
  "               n " + DASH + " " + "\u03a3" + " (x" + SUBI + " " + MINUS + " x_trim)" + SUP4 + "\n" +
  "  " + GAMMA + SUB4 + "  =  ------------------------------\n" +
  "                 ( " + "\u03a3" + " (x" + SUBI + " " + MINUS + " x" + DASH + ")" + SUP2 + " )" + SUP2 + "\n" +
  "\n" +
  "  x_trim = media recortada, proporci" + O + "n  1 / ( 2 " + SQRT + "(n " + MINUS + " 4) )\n" +
  "           (recorte FRACCIONARIO, interpolado en los extremos)";

const FML_MC =
  "            ln(c" + SUBI + " s" + SUBI + SUP2 + ")  " + MINUS + "  ln(c" + SUBJ + " s" + SUBJ + SUP2 + ")\n" +
  "  T(z)  =  ---------------------------- ,   se resuelve  |T(z)| = z\n" +
  "                  " + SQRT + "( v" + SUBI + " + v" + SUBJ + " )\n" +
  "\n" +
  "  v" + SUBI + " = (" + GAMMA + SUB4 + "," + SUBI + " " + MINUS + " (n" + SUBI + MINUS + "3)/n" + SUBI + ") / (n" + SUBI + MINUS + "1)\n" +
  "  p  =  2 " + DASH + " ( 1 " + MINUS + " " + "\u03a6" + "(z*) )";

const FML_LEVENE =
  "  d" + SUBI + SUBJ + "  =  | x" + SUBI + SUBJ + "  " + MINUS + "  mediana(grupo i) |\n" +
  "\n" +
  "              " + "\u03a3" + " n" + SUBI + " (d" + SUBI + "\u0304 " + MINUS + " d\u0304)" + SUP2 + " / (k " + MINUS + " 1)\n" +
  "  F  =  ------------------------------------\n" +
  "          " + "\u03a3\u03a3" + " (d" + SUBI + SUBJ + " " + MINUS + " d" + SUBI + "\u0304)" + SUP2 + " / (N " + MINUS + " k)";

// ==========================================================================
// ESPA\u00d1OL
// ==========================================================================

function ES() {
  return (
    <div>
      <Section title={IQ + "Qu" + E + " contrasta?"}>
        <p>
          Compara la <V>variabilidad</V> de dos o m{A}s poblaciones. No mira las
          medias: pregunta si la dispersi{O}n es la misma en todos los grupos.
        </p>
        <Formula>
          {"H" + SUB0 + ":  " + SIGMA + SUB1 + SUP2 + " = " + SIGMA + SUB2 + SUP2 + " = " + DASH + DASH + DASH + " = " + SIGMA + SUBK + SUP2 + "\n" +
            "H" + SUB1 + ":  al menos una varianza es distinta"}
        </Formula>
        <p>
          Es el estudio que valida el supuesto de <V>igualdad de varianzas</V>{" "}
          antes de un 2-Sample t agrupado o de un ANOVA. Tambi{E}n es un an{A}lisis
          por s{I} mismo: en muchos procesos reducir la variaci{O}n importa m{A}s que
          mover la media.
        </p>
      </Section>

      <Section title={"Intervalos de confianza: m" + E + "todo de Bonett"}>
        <p>
          Los intervalos <V>no</V> son los cl{A}sicos de la {"\u03c7"}{SUP2}. Esos
          exigen normalidad estricta y se descalibran mucho con colas pesadas.
          Se usa el m{E}todo de <V>Bonett</V>, que corrige por la curtosis
          observada:
        </p>
        <Formula>{FML_BONETT}</Formula>
        <p>
          El factor <V>c</V> multiplica al centro <V>y</V> al error est{A}ndar. La
          curtosis {GAMMA}{SUB4} se calcula respecto a una <V>media recortada</V>:
        </p>
        <Formula>{FML_KURT}</Formula>
        <Note>
          {"El recorte es fraccionario: si 1/(2" + SQRT + "(n" + MINUS + "4)) " + DASH + " n no es entero, " +
            "las observaciones de los extremos entran con peso parcial. Con recorte " +
            "entero los intervalos fallan en el tercer decimal."}
        </Note>
        <p>
          La correcci{O}n de <V>Bonferroni</V> reparte el riesgo entre los k
          grupos: cada intervalo se construye al nivel individual{" "}
          1 {MINUS} {ALPHA}/k, de modo que la confianza conjunta sea al menos
          1 {MINUS} {ALPHA}. Con k = 2 y {ALPHA} = 0,05 el nivel individual es
          97,5 %.
        </p>
      </Section>

      <Section title={"Contraste de comparaciones m" + U + "ltiples"}>
        <p>
          Compara las varianzas por pares en escala logar{I}tmica. Como el factor
          c depende de z, el estad{I}stico es <V>autoconsistente</V>: hay que
          resolver la ecuaci{O}n en z.
        </p>
        <Formula>{FML_MC}</Formula>
        <Note>
          {"Con m" + A + "s de dos grupos se toma el p-valor m" + I + "nimo de los pares y se " +
            "ajusta por Bonferroni multiplicando por k(k" + MINUS + "1)/2."}
        </Note>
      </Section>

      <Section title={"Contraste de Levene"}>
        <p>
          Transforma cada dato en su <V>distancia absoluta a la mediana</V> del
          grupo y aplica un ANOVA de un factor sobre esas distancias. Si la
          dispersi{O}n fuese igual, las distancias medias tambi{E}n lo ser{I}an.
        </p>
        <Formula>{FML_LEVENE}</Formula>
        <Note>
          {"Es la variante de Brown-Forsythe (mediana, no media): la m" + A + "s robusta " +
            "y la que usa Minitab en este estudio."}
        </Note>
      </Section>

      <Section title={IQ + "Cu" + A + "l de los dos leer?"}>
        <p>
          Los dos aparecen porque atacan el problema de forma distinta y a veces
          discrepan. <V>Bonett</V> es m{A}s potente cuando los datos son
          razonablemente sim{E}tricos; <V>Levene</V> aguanta mejor las
          distribuciones muy asim{E}tricas o con valores at{I}picos fuertes. Si
          discrepan, mira primero el gr{A}fico: casi siempre hay un grupo peque{N}o
          o un at{I}pico detr{A}s de la diferencia.
        </p>
      </Section>

      <Section title={"Supuestos"}>
        <ul className="list-disc pl-5 space-y-1">
          <li>Muestras independientes entre s{I} y dentro de cada grupo.</li>
          <li>
            Al menos <V>5 observaciones</V> por nivel. Bonett necesita estimar la
            curtosis y con menos datos no es fiable.
          </li>
          <li>
            No hace falta normalidad, pero s{I} que los datos sean continuos y
            provengan de un proceso estable.
          </li>
        </ul>
      </Section>

      <Section title={"Ejemplo resuelto"}>
        <p>
          BTU.In seg{U}n Damper, con 40 y 50 observaciones:
        </p>
        <Formula>
          {"Damper   N    StDev      IC de Bonferroni al 95 %\n" +
            "  1     40   3,01987    (2,25901;  4,27664)\n" +
            "  2     50   2,76702    (2,27551;  3,52261)\n" +
            "\n" +
            "Nivel de confianza individual = 97,5 %\n" +
            "\n" +
            "Comparaciones m" + U + "ltiples   p = 0,587\n" +
            "Levene              F = 0,00   p = 0,996"}
        </Formula>
        <p>
          Ambos p-valores est{A}n muy por encima de 0,05: <V>no se rechaza</V>{" "}
          H{SUB0}. Las desviaciones (3,02 y 2,77) son pr{A}cticamente iguales y los
          intervalos se solapan ampliamente.
        </p>
      </Section>

      <Section title={"Interpretaci" + O + "n pr" + A + "ctica"}>
        <p>
          Como las varianzas pueden considerarse iguales, ser{I}a leg{I}timo usar el
          2-Sample t <V>agrupado</V> sobre estos mismos datos. Aun as{I}, la
          aproximaci{O}n de Welch es la opci{O}n por defecto y sigue siendo v{A}lida:
          cuando las varianzas coinciden, ambas dan pr{A}cticamente el mismo
          resultado.
        </p>
        <Note>
          {"Nota: los intervalos del gr" + A + "fico son intervalos de comparaci" + O + "n " +
            "m" + U + "ltiple y NO coinciden con los de la tabla. Est" + A + "n construidos para " +
            "que el solapamiento se lea directamente como el contraste (" + SIGMA + SUBI + " " + NE + " " + SIGMA + SUBJ + ")."}
        </Note>
      </Section>
    </div>
  );
}

// ==========================================================================
// ENGLISH
// ==========================================================================

function EN() {
  return (
    <div>
      <Section title="What does it test?">
        <p>
          It compares the <V>variability</V> of two or more populations. It does
          not look at the means: it asks whether the spread is the same across
          all groups.
        </p>
        <Formula>
          {"H" + SUB0 + ":  " + SIGMA + SUB1 + SUP2 + " = " + SIGMA + SUB2 + SUP2 + " = " + DASH + DASH + DASH + " = " + SIGMA + SUBK + SUP2 + "\n" +
            "H" + SUB1 + ":  at least one variance is different"}
        </Formula>
        <p>
          This is the study that validates the <V>equal variances</V> assumption
          before a pooled 2-Sample t or an ANOVA. It is also an analysis in its
          own right: in many processes, reducing variation matters more than
          shifting the mean.
        </p>
      </Section>

      <Section title="Confidence intervals: the Bonett method">
        <p>
          The intervals are <V>not</V> the classical {"\u03c7"}{SUP2} ones. Those
          require strict normality and become badly miscalibrated with heavy
          tails. The <V>Bonett</V> method is used instead, correcting for the
          observed kurtosis:
        </p>
        <Formula>{FML_BONETT}</Formula>
        <p>
          The <V>c</V> factor multiplies the centre <V>and</V> the standard
          error. The kurtosis {GAMMA}{SUB4} is computed about a{" "}
          <V>trimmed mean</V>:
        </p>
        <Formula>{FML_KURT}</Formula>
        <Note>
          {"The trimming is fractional: if 1/(2" + SQRT + "(n" + MINUS + "4)) " + DASH + " n is not an " +
            "integer, the extreme observations enter with partial weight. With " +
            "integer trimming the intervals are off in the third decimal."}
        </Note>
        <p>
          The <V>Bonferroni</V> correction spreads the risk across the k groups:
          each interval is built at the individual level 1 {MINUS} {ALPHA}/k, so
          that the joint confidence is at least 1 {MINUS} {ALPHA}. With k = 2 and{" "}
          {ALPHA} = 0.05 the individual level is 97.5%.
        </p>
      </Section>

      <Section title="Multiple comparisons test">
        <p>
          It compares variances pairwise on the log scale. Because the c factor
          depends on z, the statistic is <V>self-consistent</V>: the equation in
          z has to be solved.
        </p>
        <Formula>{FML_MC}</Formula>
        <Note>
          {"With more than two groups, the smallest pairwise p-value is taken and " +
            "adjusted by Bonferroni, multiplying by k(k" + MINUS + "1)/2."}
        </Note>
      </Section>

      <Section title="Levene test">
        <p>
          It turns every observation into its <V>absolute distance to the group
          median</V> and runs a one-way ANOVA on those distances. If the spread
          were equal, the mean distances would be equal too.
        </p>
        <Formula>{FML_LEVENE}</Formula>
        <Note>
          {"This is the Brown-Forsythe variant (median, not mean): the most robust " +
            "one, and the one Minitab uses in this study."}
        </Note>
      </Section>

      <Section title="Which of the two should you read?">
        <p>
          Both are shown because they attack the problem differently and
          sometimes disagree. <V>Bonett</V> is more powerful when the data are
          reasonably symmetric; <V>Levene</V> copes better with strongly skewed
          distributions or heavy outliers. If they disagree, look at the plot
          first: there is almost always a small group or an outlier behind the
          discrepancy.
        </p>
      </Section>

      <Section title="Assumptions">
        <ul className="list-disc pl-5 space-y-1">
          <li>Samples independent of each other and within each group.</li>
          <li>
            At least <V>5 observations</V> per level. Bonett has to estimate the
            kurtosis, and with fewer data it is not reliable.
          </li>
          <li>
            Normality is not required, but the data must be continuous and come
            from a stable process.
          </li>
        </ul>
      </Section>

      <Section title="Worked example">
        <p>BTU.In by Damper, with 40 and 50 observations:</p>
        <Formula>
          {"Damper   N    StDev      95% Bonferroni CI\n" +
            "  1     40   3.01987    (2.25901;  4.27664)\n" +
            "  2     50   2.76702    (2.27551;  3.52261)\n" +
            "\n" +
            "Individual confidence level = 97.5%\n" +
            "\n" +
            "Multiple comparisons   p = 0.587\n" +
            "Levene            F = 0.00   p = 0.996"}
        </Formula>
        <p>
          Both p-values are well above 0.05: <V>do not reject</V> H{SUB0}. The
          standard deviations (3.02 and 2.77) are practically identical and the
          intervals overlap widely.
        </p>
      </Section>

      <Section title="Practical interpretation">
        <p>
          Since the variances can be treated as equal, using the <V>pooled</V>{" "}
          2-Sample t on this same data would be legitimate. Even so, the Welch
          approximation is the default and remains valid: when the variances
          agree, both give practically the same answer.
        </p>
        <Note>
          {"Note: the intervals in the plot are multiple comparison intervals and " +
            "do NOT match those in the table. They are built so that overlap reads " +
            "directly as the test (" + SIGMA + SUBI + " " + NE + " " + SIGMA + SUBJ + ")."}
        </Note>
      </Section>
    </div>
  );
}

// ==========================================================================

export default function Theory() {
  const [lang, setLang] = React.useState<"es" | "en">("es");

  return (
    <div className="p-4">
      <div className="flex justify-end mb-3">
        <div className="inline-flex rounded border border-gray-300 overflow-hidden text-xs">
          {(["es", "en"] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLang(l)}
              className="px-3 py-1 font-medium"
              style={
                lang === l
                  ? { backgroundColor: GREEN, color: "white" }
                  : { backgroundColor: "white", color: "#374151" }
              }
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      {lang === "es" ? <ES /> : <EN />}
    </div>
  );
}
