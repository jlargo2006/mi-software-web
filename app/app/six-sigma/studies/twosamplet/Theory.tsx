// app/app/six-sigma/studies/ht/twosamplet/Theory.tsx
"use client";
import React from "react";

// ---------------------------------------------------------------------------
// ARCHIVO ASCII PURO. Todo caracter no ASCII va como escape \uXXXX.
// Tabla de referencia:
//   a=\u00e1  e=\u00e9  i=\u00ed  o=\u00f3  u=\u00fa  n~=\u00f1  ?=\u00bf
//   alpha=\u03b1  mu=\u03bc  sigma=\u03c3  Sigma=\u03a3  nu=\u03bd
//   sub0=\u2080 sub1=\u2081 sub2=\u2082 subi=\u1d62
//   sqrt=\u221a  <=\u2264  >=\u2265  !=\u2260  minus=\u2212  sup2=\u00b2
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
const MU = "\u03bc";
const SIGMA = "\u03c3";
const SUB0 = "\u2080";
const SUB1 = "\u2081";
const SUB2 = "\u2082";
const SQRT = "\u221a";
const NE = "\u2260";
const MINUS = "\u2212";
const SUP2 = "\u00b2";
const PM = "\u00b1";
const DASH = "\u2014";
const APOS = "\u2019";

const MU1 = MU + SUB1;
const MU2 = MU + SUB2;
const DIFF = MU1 + " " + MINUS + " " + MU2;

// --- helpers de presentaci\u00f3n (mismo patr\u00f3n que onesamplet/Theory.tsx) ---

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

// --- f\u00f3rmulas compartidas por los dos idiomas ---

const FML_T =
  "          (x" + SUB1 + " " + MINUS + " x" + SUB2 + ") " + MINUS + " D" + SUB0 + "\n" +
  "  t = ------------------------\n" +
  "            SE(dif)";

const FML_SE_WELCH =
  "  SE(dif) = " + SQRT + "( s" + SUB1 + SUP2 + "/n" + SUB1 +
  "  +  s" + SUB2 + SUP2 + "/n" + SUB2 + " )";

const FML_DF_WELCH =
  "            ( s" + SUB1 + SUP2 + "/n" + SUB1 + " + s" + SUB2 + SUP2 + "/n" + SUB2 + " )" + SUP2 + "\n" +
  "  df = ------------------------------------------\n" +
  "       (s" + SUB1 + SUP2 + "/n" + SUB1 + ")" + SUP2 + "/(n" + SUB1 + MINUS + "1) + (s" +
  SUB2 + SUP2 + "/n" + SUB2 + ")" + SUP2 + "/(n" + SUB2 + MINUS + "1)";

const FML_SE_POOLED =
  "  s_p" + SUP2 + " = [ (n" + SUB1 + MINUS + "1)s" + SUB1 + SUP2 + " + (n" +
  SUB2 + MINUS + "1)s" + SUB2 + SUP2 + " ] / (n" + SUB1 + " + n" + SUB2 + " " + MINUS + " 2)\n\n" +
  "  SE(dif) = s_p " + SQRT + "( 1/n" + SUB1 + " + 1/n" + SUB2 + " )\n\n" +
  "  df = n" + SUB1 + " + n" + SUB2 + " " + MINUS + " 2";

const FML_CI =
  "  (x" + SUB1 + " " + MINUS + " x" + SUB2 + ")  " + PM + "  t(1" + MINUS + ALPHA +
  "/2; df) " + "\u00b7" + " SE(dif)";

const FormulaT = () => <Formula>{FML_T}</Formula>;
const FormulaWelch = () => (
  <Formula>{FML_SE_WELCH + "\n\n" + FML_DF_WELCH}</Formula>
);
const FormulaPooled = () => <Formula>{FML_SE_POOLED}</Formula>;
const FormulaCI = () => <Formula>{FML_CI}</Formula>;

// =========================== ESPA\u00d1OL ===========================

function ES() {
  return (
    <div>
      <Section title={IQ + "Qu" + E + " contrasta?"}>
        <p>
          {"Compara las medias de "}
          <V>{"dos poblaciones independientes"}</V>
          {" a partir de una muestra de cada una. Las hip" + O + "tesis son:"}
        </p>
        <Formula>
          {"  H" + SUB0 + ":  " + DIFF + " = D" + SUB0 + "\n" +
            "  H" + SUB1 + ":  " + DIFF + " " + NE + " D" + SUB0 +
            "   (o bien <, o bien >)"}
        </Formula>
        <p>
          {"Normalmente D" + SUB0 + " = 0, es decir, se contrasta si las dos medias " +
            "son iguales. Las muestras deben ser independientes: si cada dato de " +
            "una se corresponde con un dato de la otra (antes/despu" + E + "s, dos " +
            "medidas de la misma pieza), el estudio correcto es el t emparejado."}
        </p>
      </Section>

      <Section title={"Estad" + I + "stico de contraste"}>
        <FormulaT />
        <p>
          {"El numerador es la diferencia observada menos la hipot" + E + "tica; el " +
            "denominador, su error est" + A + "ndar. El c" + A + "lculo de SE(dif) y de los " +
            "grados de libertad depende de si se asumen varianzas iguales."}
        </p>
      </Section>

      <Section title={"Varianzas no iguales: aproximaci" + O + "n de Welch (opci" + O + "n por defecto)"}>
        <FormulaWelch />
        <p>
          {"Cada muestra aporta su propia varianza. Los grados de libertad ya no " +
            "son un entero: la f" + O + "rmula de Welch-Satterthwaite los aproxima y el " +
            "resultado suele ser fraccionario."}
        </p>
        <Note>
          {"Minitab TRUNCA esos grados de libertad al entero inferior y usa el " +
            "valor truncado tanto para el p-valor como para el t cr" + I + "tico del " +
            "intervalo. Este estudio hace lo mismo, por eso las cifras coinciden " +
            "d" + I + "gito a d" + I + "gito con la salida de Minitab."}
        </Note>
      </Section>

      <Section title={"Varianzas iguales: desviaci" + O + "n agrupada"}>
        <FormulaPooled />
        <p>
          {"Si es razonable suponer " + SIGMA + SUB1 + " = " + SIGMA + SUB2 + ", ambas " +
            "muestras se combinan en una sola estimaci" + O + "n de la varianza. Se gana " +
            "algo de potencia y los grados de libertad son exactos."}
        </p>
        <Note>
          {"Conviene comprobarlo antes con el estudio Test for Equal Variances. " +
            "Si las varianzas difieren y los tama" + N + "os son desiguales, la versi" + O +
            "n agrupada distorsiona el nivel de significaci" + O + "n real; Welch es la " +
            "opci" + O + "n segura y es la que se usa por defecto."}
        </Note>
      </Section>

      <Section title={"Intervalo de confianza de la diferencia"}>
        <FormulaCI />
        <p>
          {"Es la informaci" + O + "n m" + A + "s " + U + "til de la salida, m" + A + "s incluso que el " +
            "p-valor: dice no solo si hay diferencia, sino de qu" + E + " tama" + N + "o puede " +
            "ser. Si el intervalo contiene a D" + SUB0 + ", no se rechaza H" + SUB0 + "; test " +
            "e intervalo son coherentes por construcci" + O + "n."}
        </p>
      </Section>

      <Section title={"Supuestos"}>
        <ul className="list-disc pl-5 space-y-1">
          <li>{"Muestras independientes entre s" + I + " y dentro de cada grupo."}</li>
          <li>
            {"Normalidad de los datos. Con n " + "\u2265" + " 30 por grupo, el teorema " +
              "central del l" + I + "mite hace el contraste robusto; con muestras " +
              "peque" + N + "as y asimetr" + I + "a marcada, conviene revisar el boxplot o " +
              "recurrir a Mann-Whitney."}
          </li>
          <li>
            {"Varianzas iguales " + DASH + " solo si se marca esa opci" + O + "n. Welch no " +
              "lo exige."}
          </li>
        </ul>
      </Section>

      <Section title={"Ejemplo resuelto"}>
        <p>
          {"Consumo BTU.In de dos tipos de amortiguador (Damper 1 y 2), con " +
            "n = 40 y n = 50:"}
        </p>
        <Formula>
          {"  Damper 1:  n=40   media=9,91   s=3,02   SE=0,48\n" +
            "  Damper 2:  n=50   media=10,14  s=2,77   SE=0,39\n\n" +
            "  Diferencia = " + MINUS + "0,235\n" +
            "  IC 95%     = (" + MINUS + "1,464; 0,993)\n" +
            "  t = " + MINUS + "0,38    df = 80    P = 0,704"}
        </Formula>
        <p>
          {"P = 0,704 est" + A + " muy por encima de " + ALPHA + " = 0,05, y el intervalo " +
            "contiene el cero. No hay evidencia de que el tipo de amortiguador " +
            "cambie el consumo medio."}
        </p>
        <Note>
          {"Welch da df = 80,1897, que truncado es 80. Sin truncar, el intervalo " +
            "cambiar" + I + "a en el cuarto decimal."}
        </Note>
      </Section>

      <Section title={"Interpretaci" + O + "n pr" + A + "ctica"}>
        <p>
          {"Un P alto no demuestra que las medias sean iguales: solo indica que " +
            "los datos no bastan para distinguirlas. Mira la anchura del " +
            "intervalo. Si es ancho, el estudio simplemente no tiene potencia " +
            "suficiente y la conclusi" + O + "n honesta es que el resultado no es " +
            "concluyente, no que no haya diferencia."}
        </p>
      </Section>
    </div>
  );
}

// =========================== ENGLISH ===========================

function EN() {
  return (
    <div>
      <Section title="What it tests">
        <p>
          {"It compares the means of "}
          <V>{"two independent populations"}</V>
          {" using one sample from each. The hypotheses are:"}
        </p>
        <Formula>
          {"  H" + SUB0 + ":  " + DIFF + " = D" + SUB0 + "\n" +
            "  H" + SUB1 + ":  " + DIFF + " " + NE + " D" + SUB0 + "   (or <, or >)"}
        </Formula>
        <p>
          {"D" + SUB0 + " is usually 0, so the test asks whether the two means are " +
            "equal. The samples must be independent: if each observation in one " +
            "is paired with one in the other (before/after, two gauges on the " +
            "same part), the correct study is the paired t."}
        </p>
      </Section>

      <Section title="Test statistic">
        <FormulaT />
        <p>
          {"The numerator is the observed difference minus the hypothesized one; " +
            "the denominator is its standard error. How SE(dif) and the degrees " +
            "of freedom are computed depends on whether equal variances are " +
            "assumed."}
        </p>
      </Section>

      <Section title="Unequal variances: Welch approximation (default)">
        <FormulaWelch />
        <p>
          {"Each sample contributes its own variance. The degrees of freedom are " +
            "no longer an integer: the Welch-Satterthwaite formula approximates " +
            "them and the result is typically fractional."}
        </p>
        <Note>
          {"Minitab TRUNCATES those degrees of freedom to the lower integer and " +
            "uses the truncated value for both the p-value and the critical t of " +
            "the interval. This study does the same, which is why the figures " +
            "match Minitab digit by digit."}
        </Note>
      </Section>

      <Section title="Equal variances: pooled standard deviation">
        <FormulaPooled />
        <p>
          {"If " + SIGMA + SUB1 + " = " + SIGMA + SUB2 + " is a reasonable assumption, both " +
            "samples are combined into a single variance estimate. This buys a " +
            "little power and the degrees of freedom are exact."}
        </p>
        <Note>
          {"Check it first with the Test for Equal Variances study. If the " +
            "variances differ and the sample sizes are unequal, the pooled " +
            "version distorts the actual significance level; Welch is the safe " +
            "choice and is the default here."}
        </Note>
      </Section>

      <Section title="Confidence interval for the difference">
        <FormulaCI />
        <p>
          {"This is the most useful part of the output, more so than the " +
            "p-value: it tells you not only whether there is a difference, but " +
            "how large it might be. If the interval contains D" + SUB0 + ", H" + SUB0 +
            " is not rejected; test and interval agree by construction."}
        </p>
      </Section>

      <Section title="Assumptions">
        <ul className="list-disc pl-5 space-y-1">
          <li>{"Observations independent between and within groups."}</li>
          <li>
            {"Normality. With n " + "\u2265" + " 30 per group the central limit theorem " +
              "makes the test robust; with small, clearly skewed samples check " +
              "the boxplot or switch to Mann-Whitney."}
          </li>
          <li>
            {"Equal variances " + DASH + " only if that option is checked. Welch does " +
              "not require it."}
          </li>
        </ul>
      </Section>

      <Section title="Worked example">
        <p>
          {"BTU.In consumption for two damper types (Damper 1 and 2), with " +
            "n = 40 and n = 50:"}
        </p>
        <Formula>
          {"  Damper 1:  n=40   mean=9.91   s=3.02   SE=0.48\n" +
            "  Damper 2:  n=50   mean=10.14  s=2.77   SE=0.39\n\n" +
            "  Difference = " + MINUS + "0.235\n" +
            "  95% CI     = (" + MINUS + "1.464; 0.993)\n" +
            "  t = " + MINUS + "0.38    df = 80    P = 0.704"}
        </Formula>
        <p>
          {"P = 0.704 is well above " + ALPHA + " = 0.05, and the interval contains " +
            "zero. There is no evidence that the damper type changes mean " +
            "consumption."}
        </p>
        <Note>
          {"Welch gives df = 80.1897, truncated to 80. Without truncation the " +
            "interval would change in the fourth decimal."}
        </Note>
      </Section>

      <Section title="Practical interpretation">
        <p>
          {"A large P does not prove the means are equal: it only says the data " +
            "cannot tell them apart. Look at the width of the interval. If it is " +
            "wide, the study simply lacks power, and the honest conclusion is " +
            "that the result is inconclusive" + DASH + "not that there is no " +
            "difference."}
        </p>
      </Section>
    </div>
  );
}

// =========================== CONMUTADOR ===========================

export default function Theory() {
  const [lang, setLang] = React.useState<"es" | "en">("es");

  return (
    <div className="p-1">
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
              {l === "es" ? "ES" : "EN"}
            </button>
          ))}
        </div>
      </div>

      <h3 className="text-base font-bold mb-3">
        {lang === "es"
          ? "t de dos muestras (2-Sample t)"
          : "Two-Sample t Test"}
      </h3>

      {lang === "es" ? <ES /> : <EN />}

      <p className="text-xs text-gray-400 mt-4">
        {lang === "es"
          ? "Nota" + APOS + " los c" + A + "lculos replican la salida de Minitab, incluido el truncamiento de los grados de libertad de Welch."
          : "Note: calculations replicate Minitab output, including truncation of the Welch degrees of freedom."}
      </p>
    </div>
  );
}
