// app/app/six-sigma/studies/ht/anova1way/Theory.tsx
import React from "react";

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

export default function Theory() {
  return (
    <div className="max-w-3xl">
      <h2 className="text-base font-bold text-gray-900 mb-1">
        One-Way ANOVA
      </h2>
      <p className="text-xs text-gray-500 mb-4">
        AnÃ¡lisis de la varianza con un factor
      </p>

      <P>
        El ANOVA de un factor compara las medias de <strong>k</strong> grupos (niveles
        del factor) para decidir si las diferencias observadas entre ellas son
        mayores de lo que cabrÃ­a esperar por la variabilidad natural del proceso.
      </P>

      <H>HipÃ³tesis</H>
      <F>{`Hâ‚€:  Î¼â‚ = Î¼â‚‚ = ... = Î¼_k      (todas las medias son iguales)
Hâ‚:  al menos una Î¼áµ¢ es distinta`}</F>
      <P>
        NÃ³tese que Hâ‚ no indica <em>cuÃ¡l</em> media difiere. Si se rechaza Hâ‚€, hace
        falta un anÃ¡lisis de comparaciones mÃºltiples (Tukey, Dunnett) para
        identificar quÃ© pares son significativamente distintos.
      </P>

      <H>Modelo</H>
      <F>{`xáµ¢â±¼ = Î¼ + Ï„áµ¢ + Îµáµ¢â±¼        Îµáµ¢â±¼ ~ N(0, ÏƒÂ²)`}</F>
      <P>
        donde xáµ¢â±¼ es la observaciÃ³n j del nivel i, Î¼ la media global, Ï„áµ¢ el efecto
        del nivel i y Îµáµ¢â±¼ el error aleatorio. El modelo asume una <strong>Ãºnica</strong>{" "}
        varianza ÏƒÂ² comÃºn a todos los niveles: es la hipÃ³tesis de igualdad de
        varianzas.
      </P>

      <H>DescomposiciÃ³n de la variabilidad</H>
      <P>
        La suma de cuadrados total se reparte en la parte explicada por el factor
        y la parte no explicada (error):
      </P>
      <F>{`SS_Total = SS_Factor + SS_Error

SS_Factor = Î£áµ¢ náµ¢ (xÌ„áµ¢ âˆ’ xÌ„)Â²          DF = k âˆ’ 1
SS_Error  = Î£áµ¢ Î£â±¼ (xáµ¢â±¼ âˆ’ xÌ„áµ¢)Â²         DF = N âˆ’ k
SS_Total  = Î£áµ¢ Î£â±¼ (xáµ¢â±¼ âˆ’ xÌ„)Â²          DF = N âˆ’ 1`}</F>
      <P>
        SS_Factor mide cuÃ¡nto se separan las medias de grupo de la media global;
        SS_Error mide la dispersiÃ³n dentro de cada grupo. Cada suma se convierte en
        media cuadrÃ¡tica dividiendo por sus grados de libertad:
      </P>
      <F>{`MS_Factor = SS_Factor / (k âˆ’ 1)
MS_Error  = SS_Error  / (N âˆ’ k)`}</F>

      <H>EstadÃ­stico de contraste</H>
      <F>{`F = MS_Factor / MS_Error        ~  F(kâˆ’1, Nâˆ’k)   bajo Hâ‚€

p = P(F(kâˆ’1, Nâˆ’k) â‰¥ F_obs)`}</F>
      <P>
        MS_Error estima ÏƒÂ² siempre; MS_Factor estima ÏƒÂ² <em>solo si Hâ‚€ es cierta</em>.
        Por eso un cociente F prÃ³ximo a 1 es compatible con Hâ‚€, y valores grandes
        la ponen en duda. El contraste es siempre de cola derecha.
      </P>
      <P>
        <strong>DecisiÃ³n:</strong> si p â‰¤ Î± se rechaza Hâ‚€ y se concluye que no todas
        las medias son iguales.
      </P>

      <H>Resumen del modelo</H>
      <F>{`S         = âˆšMS_Error                  (desviaciÃ³n agrupada)
R-sq      = SS_Factor / SS_Total
R-sq(adj) = 1 âˆ’ MS_Error / (SS_Total/(Nâˆ’1))
R-sq(pred)= 1 âˆ’ PRESS / SS_Total`}</F>
      <P>
        <strong>S</strong> es la desviaciÃ³n tÃ­pica agrupada, la mejor estimaciÃ³n de la
        variabilidad interna del proceso. <strong>R-sq</strong> es la proporciÃ³n de
        variabilidad explicada por el factor. <strong>R-sq(adj)</strong> penaliza el
        nÃºmero de niveles y permite comparar modelos distintos.{" "}
        <strong>R-sq(pred)</strong> se obtiene por validaciÃ³n cruzada dejando fuera
        una observaciÃ³n cada vez; si es mucho menor que R-sq, el modelo estÃ¡
        sobreajustado.
      </P>

      <H>Intervalos de confianza de las medias</H>
      <F>{`xÌ„áµ¢ Â± t(1âˆ’Î±/2; Nâˆ’k) Â· S / âˆšnáµ¢`}</F>
      <P>
        Un detalle importante: el intervalo de cada nivel se construye con la
        desviaciÃ³n <strong>agrupada</strong> S y con los grados de libertad del{" "}
        <strong>error</strong> (N âˆ’ k), no con la desviaciÃ³n y el tamaÃ±o de ese grupo
        por separado. Al usar la informaciÃ³n de todas las muestras, los intervalos
        son mÃ¡s estrechos y â€”si el diseÃ±o estÃ¡ balanceadoâ€” todos tienen la misma
        amplitud. Esto es vÃ¡lido precisamente porque el modelo asume varianza comÃºn.
      </P>

      <H>Supuestos</H>
      <ul className="list-disc pl-5 mb-2">
        <Li>
          <strong>Independencia.</strong> Las observaciones no deben estar
          correlacionadas. Es el supuesto mÃ¡s crÃ­tico y no se arregla a posteriori:
          depende de cÃ³mo se recogieron los datos (aleatorizaciÃ³n).
        </Li>
        <Li>
          <strong>Normalidad de los residuos.</strong> El ANOVA es bastante robusto
          frente a desviaciones moderadas, sobre todo con muestras equilibradas y
          n â‰¥ 10 por grupo.
        </Li>
        <Li>
          <strong>Igualdad de varianzas.</strong> Si las varianzas difieren mucho
          (regla prÃ¡ctica: la mayor mÃ¡s del doble de la menor en desviaciÃ³n tÃ­pica),
          el F pierde validez. En ese caso conviene el test de Welch, que no asume
          varianzas iguales.
        </Li>
      </ul>
      <P>
        Los grÃ¡ficos de intervalos, de valores individuales y el diagrama de caja
        ayudan a valorar visualmente tanto las diferencias entre medias como la
        homogeneidad de la dispersiÃ³n y la presencia de valores atÃ­picos.
      </P>

      <H>InterpretaciÃ³n prÃ¡ctica</H>
      <P>
        SignificaciÃ³n estadÃ­stica no equivale a relevancia industrial. Con muestras
        grandes, diferencias irrelevantes resultan significativas; con muestras
        pequeÃ±as, diferencias importantes pueden pasar desapercibidas. Conviene
        siempre acompaÃ±ar el p-valor con la magnitud de las diferencias entre medias
        y con los intervalos de confianza, y juzgarlas frente a la tolerancia o al
        criterio tÃ©cnico del proceso.
      </P>
    </div>
  );
}
