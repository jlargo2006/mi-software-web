// app/app/six-sigma/studies/ht/chisqassociation/Theory.tsx
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

const ALPHA = "\u03B1";
const CHI = "\u03C7";
const SUM = "\u2211";
const MINUS = "\u2212";
const TIMES = "\u00D7";

const FormulaExpected = () => (
  <Formula>
    <V>E</V><Sub><V>ij</V></Sub> ={" "}
    <Frac
      num={<>(total fila <V>i</V>) {TIMES} (total columna <V>j</V>)</>}
      den={<><V>N</V></>}
    />
  </Formula>
);

const FormulaPearson = () => (
  <Formula>
    {CHI}<Sup>2</Sup> = {SUM}{" "}
    <Frac
      num={
        <>
          (<V>O</V><Sub><V>ij</V></Sub> {MINUS} <V>E</V><Sub><V>ij</V></Sub>)
          <Sup>2</Sup>
        </>
      }
      den={<><V>E</V><Sub><V>ij</V></Sub></>}
    />
  </Formula>
);

const FormulaLR = () => (
  <Formula>
    <V>G</V><Sup>2</Sup> = 2 {SUM} <V>O</V><Sub><V>ij</V></Sub> ln
    <Frac
      num={<><V>O</V><Sub><V>ij</V></Sub></>}
      den={<><V>E</V><Sub><V>ij</V></Sub></>}
    />
  </Formula>
);

const ES = () => (
  <div className="space-y-5">
    <Section title="Qué contrasta">
      <p>
        Comprueba si dos variables categ&oacute;ricas est&aacute;n{" "}
        <strong>asociadas</strong>, cruzando sus categor&iacute;as en una tabla de
        contingencia de cualquier tama&ntilde;o.
      </p>
      <p>
        H{"\u2080"}: las dos variables son independientes, frente a H{"\u2081"}: existe
        asociaci&oacute;n. Como en Kruskal-Wallis, es un contraste global: detecta que
        hay asociaci&oacute;n, no d&oacute;nde.
      </p>
      <Note>
        Cuidado con la interpretaci&oacute;n: asociaci&oacute;n{" "}
        <strong>no es causalidad</strong>, ni indica direcci&oacute;n. El contraste
        tampoco distingue una asociaci&oacute;n fuerte de una d&eacute;bil detectada
        con muchos datos.
      </Note>
    </Section>

    <Section title="Las frecuencias esperadas">
      <FormulaExpected />
      <p>
        Bajo independencia, la probabilidad conjunta es el producto de las
        marginales. Las esperadas son lo que cabr&iacute;a observar si las variables
        no guardasen relaci&oacute;n, <strong>respetando los totales reales</strong> de
        filas y columnas.
      </p>
      <p>
        Por eso los grados de libertad son (<V>r</V>{MINUS}1)({V ? "" : ""}
        <V>c</V>{MINUS}1): fijados los marginales, solo esas celdas quedan libres.
      </p>
    </Section>

    <Section title="Los dos estadísticos">
      <FormulaPearson />
      <FormulaLR />
      <p>
        <strong>Pearson</strong> es el cl&aacute;sico: suma las discrepancias al
        cuadrado relativas a lo esperado. <strong>El cociente de verosimilitudes</strong>{" "}
        <V>G</V><Sup>2</Sup>, tambi&eacute;n llamado desviaci&oacute;n, procede de la
        teor&iacute;a de la m&aacute;xima verosimilitud.
      </p>
      <p>
        Ambos son asint&oacute;ticamente equivalentes y comparten grados de libertad.
        Con muestras grandes y esperadas holgadas dan casi el mismo valor; si difieren
        de forma apreciable, es se&ntilde;al de que la aproximaci&oacute;n{" "}
        {CHI}<Sup>2</Sup> flaquea.
      </p>
      <Note>
        Una celda con recuento <strong>cero</strong> no aporta nada a{" "}
        <V>G</V><Sup>2</Sup>, porque el l&iacute;mite de <V>O</V>&nbsp;ln(<V>O</V>/
        <V>E</V>) cuando <V>O</V> tiende a cero es cero. A Pearson s&iacute; le aporta,
        y de ahi parte de la divergencia entre ambos en tablas dispersas.
      </Note>
    </Section>

    <Section title="Requisitos y avisos">
      <ul className="list-disc pl-5 space-y-1">
        <li>
          Observaciones <strong>independientes</strong>: cada unidad cuenta en una sola
          celda. Con medidas repetidas el contraste no vale.
        </li>
        <li>
          Recuentos, no porcentajes ni medias. Introducir proporciones invalida el
          resultado.
        </li>
        <li>
          Regla habitual: ninguna esperada por debajo de 1, y{" "}
          <strong>como m&aacute;ximo un 20% de celdas por debajo de 5</strong>. El
          informe avisa cuando ocurre.
        </li>
        <li>
          En tablas 2{TIMES}2 con esperadas peque&ntilde;as, el test exacto de Fisher es
          preferible.
        </li>
      </ul>
    </Section>

    <Section title="Localizar la asociación">
      <p>
        Rechazar H{"\u2080"} no dice qu&eacute; celdas la provocan. Para eso sirven los
        contenidos opcionales de celda:
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>Residuo</strong> <V>O</V>{MINUS}<V>E</V>: la discrepancia bruta, en
          unidades de recuento.
        </li>
        <li>
          <strong>Residuo estandarizado</strong> (<V>O</V>{MINUS}<V>E</V>)/{"\u221A"}
          <V>E</V>: comparable entre celdas. Valores por encima de 2 en valor absoluto
          se&ntilde;alan celdas destacadas.
        </li>
        <li>
          <strong>Aportaci&oacute;n a la {CHI}<Sup>2</Sup></strong>: el cuadrado del
          anterior. Suma exactamente el estad&iacute;stico de Pearson.
        </li>
      </ul>
      <Note>
        Estos indicadores son exploratorios y{" "}
        <strong>no est&aacute;n corregidos por comparaciones m&uacute;ltiples</strong>,
        igual que los Z-Value de Kruskal-Wallis.
      </Note>
    </Section>

    <Section title="Ejemplo resuelto">
      <p>Tabla 3{TIMES}3 con 90 observaciones, {ALPHA} = 0,05:</p>
      <p className="font-mono text-xs">
        Filas: 8/10/12 {"\u00b7"} 10/11/9 {"\u00b7"} 5/9/16
      </p>
      <p className="font-mono text-xs">
        Totales de fila: 30, 30, 30 {"\u00b7"} de columna: 23, 30, 37
      </p>
      <p className="font-mono text-xs">
        Esperadas (id&eacute;nticas en las tres filas): 7,67 {"\u00b7"} 10,00{" "}
        {"\u00b7"} 12,33
      </p>
      <p className="font-mono text-xs">
        DF = 4 {"\u00b7"} Pearson = 3,852, <V>p</V> = 0,426 {"\u00b7"}{" "}
        <V>G</V><Sup>2</Sup> = 3,921, <V>p</V> = 0,417
      </p>
      <p>
        Como los tres totales de fila coinciden, las esperadas se repiten fila a fila:
        es un caso c&oacute;modo para comprobar el c&aacute;lculo a mano.{" "}
        <strong>No se rechaza H{"\u2080"}</strong>: aunque la tercera fila muestra una
        tendencia hacia <em>High</em> (16 frente a 12,33 esperados), con 90
        observaciones no basta para descartar el azar.
      </p>
      <Note>
        La menor esperada es 7,67, holgadamente por encima de 5, as&iacute; que la
        aproximaci&oacute;n {CHI}<Sup>2</Sup> es fiable y ambos estad&iacute;sticos
        casi coinciden.
      </Note>
    </Section>
  </div>
);

const EN = () => (
  <div className="space-y-5">
    <Section title="What it tests">
      <p>
        Checks whether two categorical variables are <strong>associated</strong>, by
        cross-tabulating their categories into a contingency table of any size.
      </p>
      <p>
        H{"\u2080"}: the variables are independent, against H{"\u2081"}: an association
        exists. Like Kruskal-Wallis it is an omnibus test.
      </p>
      <Note>
        Association is <strong>not causation</strong> and carries no direction.
      </Note>
    </Section>

    <Section title="Expected counts">
      <FormulaExpected />
      <p>
        Under independence the joint probability is the product of the marginals, so
        expected counts are what independence would produce{" "}
        <strong>while preserving the observed margins</strong>. That is why the degrees
        of freedom are (<V>r</V>{MINUS}1)(<V>c</V>{MINUS}1).
      </p>
    </Section>

    <Section title="The two statistics">
      <FormulaPearson />
      <FormulaLR />
      <p>
        Pearson sums squared discrepancies relative to expectation; the likelihood
        ratio <V>G</V><Sup>2</Sup>, also called deviance, comes from maximum
        likelihood theory. They are asymptotically equivalent and share the same
        degrees of freedom.
      </p>
      <Note>
        A <strong>zero</strong> count contributes nothing to <V>G</V><Sup>2</Sup>,
        since <V>O</V>&nbsp;ln(<V>O</V>/<V>E</V>) tends to zero, but it does contribute
        to Pearson. Noticeable divergence between the two signals that the{" "}
        {CHI}<Sup>2</Sup> approximation is strained.
      </Note>
    </Section>

    <Section title="Requirements">
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>Independent</strong> observations: each unit in exactly one cell.
        </li>
        <li>Raw counts, never percentages or means.</li>
        <li>
          No expected count below 1, and{" "}
          <strong>at most 20% of cells below 5</strong>.
        </li>
        <li>
          For 2{TIMES}2 tables with small expected counts prefer Fisher&apos;s exact
          test.
        </li>
      </ul>
    </Section>

    <Section title="Locating the association">
      <p>
        Rejecting H{"\u2080"} does not say which cells drive it. The optional cell
        contents do: raw residuals, standardized residuals (|value| above 2 marks a
        notable cell) and each cell&apos;s contribution to the Pearson statistic,
        which sums exactly to it.
      </p>
      <Note>
        These are exploratory and carry{" "}
        <strong>no multiple-comparison adjustment</strong>.
      </Note>
    </Section>

    <Section title="Worked example">
      <p>A 3{TIMES}3 table with 90 observations, {ALPHA} = 0.05:</p>
      <p className="font-mono text-xs">
        Rows: 8/10/12 {"\u00b7"} 10/11/9 {"\u00b7"} 5/9/16
      </p>
      <p className="font-mono text-xs">
        Row totals 30, 30, 30 {"\u00b7"} column totals 23, 30, 37
      </p>
      <p className="font-mono text-xs">
        Expected, identical across rows: 7.67 {"\u00b7"} 10.00 {"\u00b7"} 12.33
      </p>
      <p className="font-mono text-xs">
        DF = 4 {"\u00b7"} Pearson = 3.852, <V>p</V> = 0.426 {"\u00b7"}{" "}
        <V>G</V><Sup>2</Sup> = 3.921, <V>p</V> = 0.417
      </p>
      <p>
        Equal row totals make the expected counts repeat row by row.{" "}
        <strong>H{"\u2080"} is not rejected</strong>: the third row leans towards{" "}
        <em>High</em> (16 against 12.33 expected) but 90 observations cannot rule out
        chance. The smallest expected count is 7.67, so the approximation is sound and
        both statistics nearly agree.
      </p>
    </Section>
  </div>
);

export default function HTChiSqAssocTheory() {
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
