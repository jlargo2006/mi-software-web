// app/app/six-sigma/studies/ht/anova1way/Theory.tsx
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

const MU = "\u03BC";
const ALPHA = "\u03B1";
const SIGMA = "\u03C3";
const PM = "\u00B1";
const MINUS = "\u2212";
const SUM = "\u2211";
const XBAR = "x\u0304";
const XBARBAR = "x\u0305\u0305";
const GE = "\u2265";
const NEQ = "\u2260";
const DOT = "\u00B7";
const IN = "\u2208";

const FormulaSS = () => (
  <Formula>
    <div className="space-y-3">
      <div>
        SS<Sub>Factor</Sub> = {SUM}<Sub><V>i</V></Sub> <V>n</V><Sub><V>i</V></Sub>{" "}
        ({XBAR}<Sub><V>i</V></Sub> {MINUS} {XBARBAR})<Sup>2</Sup>
        <span className="ml-4">
          DF = <V>k</V> {MINUS} 1
        </span>
      </div>
      <div>
        SS<Sub>Error</Sub> = {SUM}<Sub><V>i</V></Sub> {SUM}<Sub><V>j</V></Sub>{" "}
        (<V>x</V><Sub><V>ij</V></Sub> {MINUS} {XBAR}<Sub><V>i</V></Sub>)<Sup>2</Sup>
        <span className="ml-4">
          DF = <V>N</V> {MINUS} <V>k</V>
        </span>
      </div>
      <div>
        SS<Sub>Total</Sub> = SS<Sub>Factor</Sub> + SS<Sub>Error</Sub>
        <span className="ml-4">
          DF = <V>N</V> {MINUS} 1
        </span>
      </div>
    </div>
  </Formula>
);

const FormulaF = () => (
  <Formula>
    <V>F</V> ={" "}
    <Frac
      num={<>MS<Sub>Factor</Sub></>}
      den={<>MS<Sub>Error</Sub></>}
    />
    <span className="mx-4">
      MS = <Frac num={<>SS</>} den={<>DF</>} />
    </span>
    <span className="mx-4">
      <V>S</V> = <Sqrt>MS<Sub>Error</Sub></Sqrt>
    </span>
  </Formula>
);

const FormulaCI = () => (
  <Formula>
    {MU}<Sub><V>i</V></Sub> {IN} {XBAR}<Sub><V>i</V></Sub> {PM} <V>t</V>
    <Sub>1{MINUS}{ALPHA}/2, <V>N</V>{MINUS}<V>k</V></Sub> {DOT}{" "}
    <Frac num={<><V>S</V></>} den={<Sqrt><V>n</V><Sub><V>i</V></Sub></Sqrt>} />
  </Formula>
);

const ES = () => (
  <div className="space-y-5">
    <Section title="QuÃ© contrasta">
      <p>
        El ANOVA de un factor compara las medias de <V>k</V> grupos definidos por un
        Ãºnico factor. En lugar de hacer todas las comparaciones dos a dos, contrasta de
        una sola vez si existe alguna diferencia, evitando la inflaciÃ³n del error de
        tipo I que producirÃ­a una baterÃ­a de tests <V>t</V>.
      </p>
      <p>
        H{"\u2080"}: {MU}<Sub>1</Sub> = {MU}<Sub>2</Sub> = {"\u2026"} ={" "}
        {MU}<Sub><V>k</V></Sub> frente a H{"\u2081"}: no todas las medias son iguales.
      </p>
      <Note>
        Rechazar H{"\u2080"} indica que <em>al menos una</em> media difiere, pero no
        cuÃ¡l. Identificarlas requiere comparaciones mÃºltiples (Tukey, Dunnett).
      </Note>
    </Section>

    <Section title="DescomposiciÃ³n de la variabilidad">
      <p>
        La variabilidad total se reparte en la debida al factor (entre grupos) y la
        residual (dentro de los grupos):
      </p>
      <FormulaSS />
      <p>
        {XBAR}<Sub><V>i</V></Sub> es la media del grupo <V>i</V>, {XBARBAR} la media
        global, <V>N</V> el total de observaciones y <V>k</V> el nÃºmero de niveles.
      </p>
    </Section>

    <Section title="EstadÃ­stico de contraste">
      <FormulaF />
      <p>
        Bajo H{"\u2080"} ambos cuadrados medios estiman la misma varianza {SIGMA}
        <Sup>2</Sup> y <V>F</V> vale aproximadamente 1. Si las medias difieren,
        MS<Sub>Factor</Sub> crece y <V>F</V> aumenta. El <V>p</V>-valor es el Ã¡rea de
        la cola derecha de la <V>F</V> con (<V>k</V>{MINUS}1, <V>N</V>{MINUS}<V>k</V>)
        grados de libertad.
      </p>
    </Section>

    <Section title="Resumen del modelo">
      <p>
        <V>S</V> es la desviaciÃ³n estÃ¡ndar agrupada, estimaciÃ³n de {SIGMA} en las
        unidades de la respuesta. R{"\u00B2"} = SS<Sub>Factor</Sub>/SS<Sub>Total</Sub>{" "}
        es la fracciÃ³n de variabilidad explicada por el factor. R{"\u00B2"}(ajustado)
        penaliza el nÃºmero de niveles y R{"\u00B2"}(pred) se obtiene del PRESS, midiendo
        capacidad predictiva sobre datos no usados en el ajuste.
      </p>
    </Section>

    <Section title="Intervalos de confianza de las medias">
      <FormulaCI />
      <Note>
        Punto clave: el intervalo de cada grupo usa la desviaciÃ³n <strong>agrupada</strong>{" "}
        <V>S</V> y los grados de libertad del <strong>error</strong> (<V>N</V>{MINUS}
        <V>k</V>), no la desviaciÃ³n del grupo con <V>n</V><Sub><V>i</V></Sub>{MINUS}1.
        Con grupos del mismo tamaÃ±o esto hace que todos los intervalos tengan idÃ©ntica
        amplitud. Es el motivo habitual de discrepancia al reproducir la tabla a mano.
      </Note>
    </Section>

    <Section title="Supuestos">
      <ul className="list-disc pl-5 space-y-1">
        <li>Observaciones independientes.</li>
        <li>Residuos aproximadamente normales.</li>
        <li>
          Varianzas iguales entre grupos. Regla prÃ¡ctica: aceptable si la mayor
          desviaciÃ³n no supera el doble de la menor.
        </li>
      </ul>
      <p>
        Si las varianzas difieren claramente, el ANOVA de Welch no exige
        homocedasticidad. Con diseÃ±os balanceados el test es bastante robusto.
      </p>
    </Section>

    <Section title="Ejemplo resuelto">
      <p>
        Tres turnos, ocho medidas de COV (ppm) cada uno, {ALPHA} = 0,05:
      </p>
      <p className="font-mono text-xs">
        {XBAR}: 39,50 {DOT} 34,63 {DOT} 28,00 {" | "} {XBARBAR} = 34,04 {DOT}{" "}
        <V>N</V> = 24 {DOT} <V>k</V> = 3
      </p>
      <p className="font-mono text-xs">
        SS<Sub>Factor</Sub> = 533,1 (DF 2) {DOT} SS<Sub>Error</Sub> = 795,9 (DF 21){" "}
        {DOT} SS<Sub>Total</Sub> = 1329,0
      </p>
      <p className="font-mono text-xs">
        MS: 266,54 y 37,90 {DOT} <V>F</V> = 266,54/37,90 = 7,03 {DOT} <V>p</V> = 0,005
      </p>
      <p className="font-mono text-xs">
        <V>S</V> = {"\u221A"}37,90 = 6,1562 {DOT} R{"\u00B2"} = 533,1/1329,0 = 40,11%
      </p>
      <p className="font-mono text-xs">
        IC turno 1: 39,50 {PM} 2,0796 {DOT} 6,1562/{"\u221A"}8 = (34,97; 44,03)
      </p>
      <p>
        Como <V>p</V> = 0,005 {"<"} 0,05 se rechaza H{"\u2080"}: los turnos no producen
        la misma emisiÃ³n media. Los intervalos del turno 1 y del turno 3 no se solapan,
        lo que sugiere que ahÃ­ estÃ¡ la diferencia principal.
      </p>
    </Section>
  </div>
);

const EN = () => (
  <div className="space-y-5">
    <Section title="What it tests">
      <p>
        One-way ANOVA compares the means of <V>k</V> groups defined by a single factor.
        Rather than running every pairwise comparison, it tests in one step whether any
        difference exists, avoiding the type I error inflation that a battery of{" "}
        <V>t</V> tests would produce.
      </p>
      <p>
        H{"\u2080"}: {MU}<Sub>1</Sub> = {MU}<Sub>2</Sub> = {"\u2026"} ={" "}
        {MU}<Sub><V>k</V></Sub> against H{"\u2081"}: not all means are equal.
      </p>
      <Note>
        Rejecting H{"\u2080"} says <em>at least one</em> mean differs, not which one.
        Identifying them requires multiple comparisons (Tukey, Dunnett).
      </Note>
    </Section>

    <Section title="Variability decomposition">
      <p>
        Total variability splits into a factor part (between groups) and a residual part
        (within groups):
      </p>
      <FormulaSS />
      <p>
        {XBAR}<Sub><V>i</V></Sub> is the mean of group <V>i</V>, {XBARBAR} the grand
        mean, <V>N</V> the total number of observations and <V>k</V> the number of
        levels.
      </p>
    </Section>

    <Section title="Test statistic">
      <FormulaF />
      <p>
        Under H{"\u2080"} both mean squares estimate the same variance {SIGMA}
        <Sup>2</Sup> and <V>F</V> is close to 1. When means differ,
        MS<Sub>Factor</Sub> grows and <V>F</V> increases. The <V>p</V>-value is the
        right tail area of the <V>F</V> distribution with (<V>k</V>{MINUS}1,{" "}
        <V>N</V>{MINUS}<V>k</V>) degrees of freedom.
      </p>
    </Section>

    <Section title="Model summary">
      <p>
        <V>S</V> is the pooled standard deviation, an estimate of {SIGMA} in response
        units. R{"\u00B2"} = SS<Sub>Factor</Sub>/SS<Sub>Total</Sub> is the fraction of
        variability explained by the factor. R{"\u00B2"}(adj) penalises the number of
        levels, and R{"\u00B2"}(pred) comes from PRESS, measuring predictive ability on
        data not used to fit the model.
      </p>
    </Section>

    <Section title="Confidence intervals for the means">
      <FormulaCI />
      <Note>
        Key point: each group interval uses the <strong>pooled</strong> standard
        deviation <V>S</V> and the <strong>error</strong> degrees of freedom
        (<V>N</V>{MINUS}<V>k</V>), not the group standard deviation with{" "}
        <V>n</V><Sub><V>i</V></Sub>{MINUS}1. With equal group sizes this makes every
        interval the same width. It is the usual source of mismatch when reproducing the
        table by hand.
      </Note>
    </Section>

    <Section title="Assumptions">
      <ul className="list-disc pl-5 space-y-1">
        <li>Independent observations.</li>
        <li>Approximately normal residuals.</li>
        <li>
          Equal variances across groups. Rule of thumb: acceptable if the largest
          standard deviation is no more than twice the smallest.
        </li>
      </ul>
      <p>
        If variances clearly differ, Welch ANOVA does not require homoscedasticity. With
        balanced designs the test is fairly robust.
      </p>
    </Section>

    <Section title="Worked example">
      <p>
        Three shifts, eight VOC measurements (ppm) each, {ALPHA} = 0.05:
      </p>
      <p className="font-mono text-xs">
        {XBAR}: 39.50 {DOT} 34.63 {DOT} 28.00 {" | "} {XBARBAR} = 34.04 {DOT}{" "}
        <V>N</V> = 24 {DOT} <V>k</V> = 3
      </p>
      <p className="font-mono text-xs">
        SS<Sub>Factor</Sub> = 533.1 (DF 2) {DOT} SS<Sub>Error</Sub> = 795.9 (DF 21){" "}
        {DOT} SS<Sub>Total</Sub> = 1329.0
      </p>
      <p className="font-mono text-xs">
        MS: 266.54 and 37.90 {DOT} <V>F</V> = 266.54/37.90 = 7.03 {DOT} <V>p</V> = 0.005
      </p>
      <p className="font-mono text-xs">
        <V>S</V> = {"\u221A"}37.90 = 6.1562 {DOT} R{"\u00B2"} = 533.1/1329.0 = 40.11%
      </p>
      <p className="font-mono text-xs">
        Shift 1 CI: 39.50 {PM} 2.0796 {DOT} 6.1562/{"\u221A"}8 = (34.97, 44.03)
      </p>
      <p>
        Since <V>p</V> = 0.005 {"<"} 0.05, reject H{"\u2080"}: shifts do not produce the
        same mean emission. The intervals for shift 1 and shift 3 do not overlap,
        suggesting that is where the main difference lies.
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
