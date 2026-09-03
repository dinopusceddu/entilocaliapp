import { Wizard2026DraftState } from '../types';

/**
 * Migra una bozza pregressa preservando la stima legacy Art. 79 c. 1 lett. c
 * nel campo dedicato `draft.art23.legacyArt79c1cEstimate`.
 *
 * Questo impedisce che il successivo ricalcolo attivo del Wizard Art. 23
 * (che neutralizza `result.incrementoStabileAumentoPersonale` a 0) disperda
 * il valore istruttorio registrato nella bozza storica.
 */
export function migrateLegacyArt79Estimate(draft: Wizard2026DraftState): Wizard2026DraftState {
  if (!draft || !draft.art23) {
    return draft;
  }

  // Se già presente un valore legacy esplicito, preservalo intatto
  if (draft.art23.legacyArt79c1cEstimate !== undefined) {
    return draft;
  }

  // Se è presente una stima legacy positiva nel vecchio result pregresso, copiala nel campo dedicato
  const legacyFromOldResult = draft.art23.result?.incrementoStabileAumentoPersonale;
  if (legacyFromOldResult !== undefined && legacyFromOldResult > 0) {
    return {
      ...draft,
      art23: {
        ...draft.art23,
        legacyArt79c1cEstimate: legacyFromOldResult,
      },
    };
  }

  return draft;
}
