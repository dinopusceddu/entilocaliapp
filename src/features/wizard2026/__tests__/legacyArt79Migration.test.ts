import { describe, it, expect } from 'vitest';
import { initialWizard2026DraftState } from '../initialState';
import { Wizard2026DraftState } from '../types';
import { migrateLegacyArt79Estimate } from '../migrations/legacyArt79';
import { calculateArt23Limit } from '../../../logic/wizard2026/art23Limit';

describe('legacyArt79 Migration & Isolation', () => {
  it('1. Old draft with result.incrementoStabileAumentoPersonale = 20000 and absent legacyArt79c1cEstimate is migrated to legacyArt79c1cEstimate = 20000', () => {
    const oldDraft: Wizard2026DraftState = {
      ...initialWizard2026DraftState,
      art23: {
        ...initialWizard2026DraftState.art23,
        fondoCertificatoParteStabile2018: 100000,
        result: {
          limite2016Base: 150000,
          fonteLimite2016: 'CERTIFICATO',
          totaleVoci2016Ricostruite: 150000,
          baseAccessorio2018ProCapite: 120000,
          valoreMedioProCapite2018: 12000,
          differenzaPersonale: 2,
          incrementoProCapiteLimite: 24000,
          limiteArt23Attualizzato: 174000,
          dipendentiEquivalenti2018: 10,
          dipendentiEquivalenti2026: 12,
          incrementoStabileAumentoPersonale: 20000,
          fondoCertificatoParteStabile2018: 100000,
          limiteArt23: 174000,
          limiteRicostruito2016: 150000,
          limiteCertificatoUtilizzato: true,
          risorseSoggetteAttuali: 0,
          risorseEscluseAttuali: 0,
          margineArt23: 0,
          superamentoArt23: 0,
        },
      },
    };

    expect(oldDraft.art23.legacyArt79c1cEstimate).toBeUndefined();

    // Migrazione al restore
    const migrated = migrateLegacyArt79Estimate(oldDraft);
    expect(migrated.art23.legacyArt79c1cEstimate).toBe(20000);

    // Simula ricalcolo live Art. 23 (che neutralizza result.incrementoStabileAumentoPersonale a 0)
    const recalculatedResult = calculateArt23Limit({
      fondoPersonaleDipendente2016: 150000,
      limite2016CertificatoEnte: 150000,
      fondoDipendenti2018Soggetto: 100000,
      risorsePoEq2018Soggette: 20000,
      personaleServizio31122018: 10,
      personalePrevisto2026Piao: 12,
      fondoCertificatoParteStabile2018: migrated.art23.fondoCertificatoParteStabile2018,
      hasDirigenza: false,
    });

    // Nel nuovo result attivo il valore è 0
    expect(recalculatedResult.incrementoStabileAumentoPersonale).toBe(0);

    // MA il campo legacy dedicato nello stato resta preservato a 20000
    const stateAfterRecalc: Wizard2026DraftState = {
      ...migrated,
      art23: {
        ...migrated.art23,
        result: recalculatedResult,
      },
    };
    expect(stateAfterRecalc.art23.legacyArt79c1cEstimate).toBe(20000);
  });

  it('2. New draft without legacy estimate remains undefined after migration', () => {
    const newDraft: Wizard2026DraftState = {
      ...initialWizard2026DraftState,
      art23: {
        ...initialWizard2026DraftState.art23,
        legacyArt79c1cEstimate: undefined,
        result: undefined,
      },
    };

    const migrated = migrateLegacyArt79Estimate(newDraft);
    expect(migrated.art23.legacyArt79c1cEstimate).toBeUndefined();
  });

  it('3. Draft that already has legacyArt79c1cEstimate is not overwritten by result', () => {
    const draftWithExistingLegacy: Wizard2026DraftState = {
      ...initialWizard2026DraftState,
      art23: {
        ...initialWizard2026DraftState.art23,
        legacyArt79c1cEstimate: 35000,
        result: {
          ...({} as any),
          incrementoStabileAumentoPersonale: 0,
        },
      },
    };

    const migrated = migrateLegacyArt79Estimate(draftWithExistingLegacy);
    expect(migrated.art23.legacyArt79c1cEstimate).toBe(35000);
  });
});
