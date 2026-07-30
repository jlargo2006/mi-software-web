// app/app/six-sigma/studies/ht/anova1way/Theory.tsx
//
// IMPORTANTE / IMPORTANT:
// Este archivo es ASCII puro. Todo caracter no ASCII (tildes, griegas,
// subindices, simbolos matematicos) se escribe SIEMPRE como escape \uXXXX
// dentro de una cadena JavaScript, nunca como caracter literal en el JSX.
// Motivo: la cadena de build servia el archivo como Latin-1 y los literales
// UTF-8 aparecian como mojibake (p.ej. "columnÃ¢â‚¬Â¦", "(ÃŽÂ±)").
//
// Tabla de escapes usados:
//   \u00e1 a-acute      \u00e9 e-acute      \u00ed i-acute
//   \u00f3 o-acute      \u00fa u-acute      \u00f1 enye
//   \u00bf inv.question \u00b7 middot       \u2014 em-dash
//   \u2026 ellipsis     \u2212 minus        \u00b2 superscript 2
//   \u03b1 alpha        \u03bc mu           \u03c3 sigma        \u03c4 tau
//   \u03b5 epsilon      \u03a3 Sigma        \u221a sqrt
//   \u2264 le           \u2265 ge           \u007e tilde (ASCII)
//   \u2080..\u2089 subindices 0..9
//   \u1d62 subindice i  \u2c7c subindice j  \u2096 subindice k
//   \u0304 macron combinante (para x-bar)

import React from "react";

/* ------------------------------------------------------------------ */
/* Constantes de simbolos                                              */
/* ------------------------------------------------------------------ */

const ALPHA = "\u03b1";
const MU = "\u03bc";
const SIGMA = "\u03c3";
const TAU = "\u03c4";
const EPS = "\u03b5";
const SUM = "\u03a3";
const SQRT = "\u221a";
const LE = "\u2264";
const GE = "\u2265";
const MINUS = "\u2212";
const SUP2 = "\u00b2";
const EMDASH = "\u2014";

const SUB0 = "\u2080";
const SUB1 = "\u2081";
const SUB2 = "\u2082";
const SUBI = "\u1d62";
const SUBJ = "\u2c7c";
const SUBK = "\u2096";

/** x con macron: "x" + U+0304. En HTML normal compone correctamente. */
const XBAR = "x\u0304";

/* Derivados de uso frecuente */
const H0 = "H" + SUB0;
const H1 = "H" + SUB1;
const MU0 = MU + SUB0;
const MUI = MU + SUBI;
const XBARI = XBAR + SUBI;
const XIJ = "x" + SUBI + SUBJ;
const NI = "n" + SUBI;
const SIGMA2 = SIGMA + SUP2;

/* ------------------------------------------------------------------ */
/* Componentes de presentacion                                         */
/* ------------------------------------------------------------------ */

const H = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-sm font-semibold text-gray-900 mt-5 mb-2">{children}</h3>
);

const P = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm text-gray-700 leading-relaxed mb-2">{children}</p>
);

const F = ({ children }: { children: React.ReactNode }) => (
  <div className="my-3 px-3 py-2 bg-gray-50 border-l-2 border-gray-300 font-mono text-[13px] text-gray-800 whitespace-pre overflow-x-auto">
    {children}
  </div>
);

const Li = ({ children }: { children: React.ReactNode }) => (
  <li className="text-sm text-gray-700 leading-relaxed mb-1">{children}</li>
);

/* ------------------------------------------------------------------ */
/* Bloques de formulas (cadenas ASCII con escapes)                     */
/* ------------------------------------------------------------------ */

const FML_HYP =
  H0 +
  ":  " +
  MU +
  SUB1 +
  " = " +
  MU +
  SUB2 +
  " = ... = " +
  MU +
  SUBK +
  "      (todas las medias son iguales)\n" +
  H1 +
  ":  al menos una " +
  MUI +
  " es distinta";

const FML_MODEL =
  XIJ +
  " = " +
  MU +
  " + " +
  TAU +
  SUBI +
  " + " +
  EPS +
  SUBI +
  SUBJ +
  "        " +
  EPS +
  SUBI +
  SUBJ +
  " ~ N(0, " +
  SIGMA2 +
  ")";

const FML_SS =
  "SS_Total = SS_Factor + SS_Error\n\n" +
  "SS_Factor = " +
  SUM +
  SUBI +
  " " +
  NI +
  " (" +
  XBARI +
  " " +
  MINUS +
  " " +
  XBAR +
  ")" +
  SUP2 +
  "          DF = k " +
  MINUS +
  " 1\n" +
  "SS_Error  = " +
  SUM +
  SUBI +
  " " +
  SUM +
  SUBJ +
  " (" +
  XIJ +
  " " +
  MINUS +
  " " +
  XBARI +
  ")" +
  SUP2 +
  "         DF = N " +
  MINUS +
  " k\n" +
  "SS_Total  = " +
  SUM +
  SUBI +
  " " +
  SUM +
  SUBJ +
  " (" +
  XIJ +
  " " +
  MINUS +
  " " +
  XBAR +
  ")" +
  SUP2 +
  "          DF = N " +
  MINUS +
  " 1";

const FML_MS =
  "MS_Factor = SS_Factor / (k " +
  MINUS +
  " 1)\n" +
  "MS_Error  = SS_Error  / (N " +
  MINUS +
  " k)";

const FML_F =
  "F = MS_Factor / MS_Error        ~  F(k" +
  MINUS +
  "1, N" +
  MINUS +
  "k)   bajo " +
  H0 +
  "\n\n" +
  "p = P( F(k" +
  MINUS +
  "1, N" +
  MINUS +
  "k) " +
  GE +
  " F_obs )";

const FML_SUMMARY =
  "S         = " +
  SQRT +
  "MS_Error                  (desviaci\u00f3n agrupada)\n" +
  "R-sq      = SS_Factor / SS_Total\n" +
  "R-sq(adj) = 1 " +
  MINUS +
  " MS_Error / ( SS_Total / (N" +
  MINUS +
  "1) )\n" +
  "R-sq(pred)= 1 " +
  MINUS +
  " PRESS / SS_Total";

const FML_CI =
  XBARI +
  " \u00b1 t(1" +
  MINUS +
  ALPHA +
  "/2; N" +
  MINUS +
  "k) \u00b7 S / " +
  SQRT +
  NI;

/* ------------------------------------------------------------------ */
/* Componente                                                          */
/* ------------------------------------------------------------------ */

export default function Theory() {
  return (
    <div className="max-w-3xl">
      <h2 className="text-base font-bold text-gray-900 mb-1">One-Way ANOVA</h2>
      <p className="text-xs text-gray-500 mb-4">
        {"An\u00e1lisis de la varianza con un factor"}
      </p>

      <P>
        {"El ANOVA de un factor compara las medias de "}
        <strong>k</strong>
        {" grupos (niveles del factor) para decidir si las diferencias observadas entre ellas son mayores de lo que cabr\u00eda esperar por la variabilidad natural del proceso."}
      </P>

      <H>{"Hip\u00f3tesis"}</H>
      <F>{FML_HYP}</F>
      <P>
        {"N\u00f3tese que " + H1 + " no indica "}
        <em>{"cu\u00e1l"}</em>
        {" media difiere. Si se rechaza " +
          H0 +
          ", hace falta un an\u00e1lisis de comparaciones m\u00faltiples (Tukey, Dunnett) para identificar qu\u00e9 pares son significativamente distintos."}
      </P>

      <H>{"Modelo"}</H>
      <F>{FML_MODEL}</F>
      <P>
        {"donde " +
          XIJ +
          " es la observaci\u00f3n j del nivel i, " +
          MU +
          " la media global, " +
          TAU +
          SUBI +
          " el efecto del nivel i y " +
          EPS +
          SUBI +
          SUBJ +
          " el error aleatorio. El modelo asume una "}
        <strong>{"\u00fanica"}</strong>
        {" varianza " +
          SIGMA2 +
          " com\u00fan a todos los niveles: es la hip\u00f3tesis de igualdad de varianzas."}
      </P>

      <H>{"Descomposici\u00f3n de la variabilidad"}</H>
      <P>
        {"La suma de cuadrados total se reparte en la parte explicada por el factor y la parte no explicada (error):"}
      </P>
      <F>{FML_SS}</F>
      <P>
        {"SS_Factor mide cu\u00e1nto se separan las medias de grupo de la media global; SS_Error mide la dispersi\u00f3n dentro de cada grupo. Cada suma se convierte en media cuadr\u00e1tica dividiendo por sus grados de libertad:"}
      </P>
      <F>{FML_MS}</F>

      <H>{"Estad\u00edstico de contraste"}</H>
      <F>{FML_F}</F>
      <P>
        {"MS_Error estima " + SIGMA2 + " siempre; MS_Factor estima " + SIGMA2 + " "}
        <em>{"solo si " + H0 + " es cierta"}</em>
        {". Por eso un cociente F pr\u00f3ximo a 1 es compatible con " +
          H0 +
          ", y valores grandes la ponen en duda. El contraste es siempre de cola derecha."}
      </P>
      <P>
        <strong>{"Decisi\u00f3n:"}</strong>
        {" si p " + LE + " " + ALPHA + " se rechaza " + H0 + " y se concluye que no todas las medias son iguales."}
      </P>

      <H>{"Resumen del modelo"}</H>
      <F>{FML_SUMMARY}</F>
      <P>
        <strong>S</strong>
        {" es la desviaci\u00f3n t\u00edpica agrupada, la mejor estimaci\u00f3n de la variabilidad interna del proceso. "}
        <strong>R-sq</strong>
        {" es la proporci\u00f3n de variabilidad explicada por el factor. "}
        <strong>R-sq(adj)</strong>
        {" penaliza el n\u00famero de niveles y permite comparar modelos distintos. "}
        <strong>R-sq(pred)</strong>
        {" se obtiene por validaci\u00f3n cruzada dejando fuera una observaci\u00f3n cada vez; si es mucho menor que R-sq, el modelo est\u00e1 sobreajustado."}
      </P>

      <H>{"Intervalos de confianza de las medias"}</H>
      <F>{FML_CI}</F>
      <P>
        {"Un detalle importante: el intervalo de cada nivel se construye con la desviaci\u00f3n "}
        <strong>{"agrupada"}</strong>
        {" S y con los grados de libertad del "}
        <strong>{"error"}</strong>
        {" (N " +
          MINUS +
          " k), no con la desviaci\u00f3n y el tama\u00f1o de ese grupo por separado. Al usar la informaci\u00f3n de todas las muestras, los intervalos son m\u00e1s estrechos y " +
          EMDASH +
          "si el dise\u00f1o est\u00e1 balanceado" +
          EMDASH +
          " todos tienen la misma amplitud. Esto es v\u00e1lido precisamente porque el modelo asume varianza com\u00fan."}
      </P>

      <H>{"Supuestos"}</H>
      <ul className="list-disc pl-5 mb-2">
        <Li>
          <strong>{"Independencia."}</strong>
          {" Las observaciones no deben estar correlacionadas. Es el supuesto m\u00e1s cr\u00edtico y no se arregla a posteriori: depende de c\u00f3mo se recogieron los datos (aleatorizaci\u00f3n)."}
        </Li>
        <Li>
          <strong>{"Normalidad de los residuos."}</strong>
          {" El ANOVA es bastante robusto frente a desviaciones moderadas, sobre todo con muestras equilibradas y n " +
            GE +
            " 10 por grupo."}
        </Li>
        <Li>
          <strong>{"Igualdad de varianzas."}</strong>
          {" Si las varianzas difieren mucho (regla pr\u00e1ctica: la mayor m\u00e1s del doble de la menor en desviaci\u00f3n t\u00edpica), el F pierde validez. En ese caso conviene el test de Welch, que no asume varianzas iguales."}
        </Li>
      </ul>
      <P>
        {"Los gr\u00e1ficos de intervalos, de valores individuales y el diagrama de caja ayudan a valorar visualmente tanto las diferencias entre medias como la homogeneidad de la dispersi\u00f3n y la presencia de valores at\u00edpicos."}
      </P>

      <H>{"Interpretaci\u00f3n pr\u00e1ctica"}</H>
      <P>
        {"Significaci\u00f3n estad\u00edstica no equivale a relevancia industrial. Con muestras grandes, diferencias irrelevantes resultan significativas; con muestras peque\u00f1as, diferencias importantes pueden pasar desapercibidas. Conviene siempre acompa\u00f1ar el p-valor con la magnitud de las diferencias entre medias y con los intervalos de confianza, y juzgarlas frente a la tolerancia o al criterio t\u00e9cnico del proceso."}
      </P>

      <p className="text-xs text-gray-400 mt-6">
        {"Ejemplo de referencia: ppm VOC versus Shift " +
          EMDASH +
          " k = 3, N = 24, F = 7,03, p = 0,005, R-sq = 40,11 % (" +
          MU0 +
          " no aplica en ANOVA)."}
      </p>
    </div>
  );
}
