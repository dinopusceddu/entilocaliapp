/**
 * Nucleo condiviso per il calcolo dell'adeguamento del limite per variazione del personale
 * ex art. 33 D.L. 34/2019 (art. 23 c. 2 D.Lgs. 75/2017).
 *
 * Modulo puro e deterministico: non accede a stato globale, UI o persistenza.
 */

export interface Art33AdjustmentCoreInput {
  baseAccessoria2018: number;
  fte2018: number;
  fteAnnoCorrente: number;
}

export interface Art33AdjustmentCoreResult {
  valoreMedioProCapite2018: number;
  differenzialeFte: number;
  adeguamento: number;
}

/**
 * Calcola il valore medio pro capite 2018, il differenziale di personale e l'adeguamento economico.
 * L'adeguamento economico viene calcolato applicando la variazione positiva di personale (Math.max(0, differenzialeFte))
 * al valore medio pro capite 2018.
 */
export function calculateArt33AdjustmentCore(
  input: Art33AdjustmentCoreInput
): Art33AdjustmentCoreResult {
  const { baseAccessoria2018, fte2018, fteAnnoCorrente } = input;

  const differenzialeFte = fteAnnoCorrente - fte2018;

  if (fte2018 <= 0) {
    return {
      valoreMedioProCapite2018: 0,
      differenzialeFte,
      adeguamento: 0
    };
  }

  const valoreMedioProCapite2018 = baseAccessoria2018 / fte2018;
  const incrementoPersonale = Math.max(0, differenzialeFte);
  const adeguamento = incrementoPersonale * valoreMedioProCapite2018;

  return {
    valoreMedioProCapite2018,
    differenzialeFte,
    adeguamento
  };
}
