import { describe, it, expect } from 'vitest';
import { buildWizard2026LegacyMappingPreview } from '../mappingPreview';
import { initialWizard2026DraftState } from '../initialState';
import { Wizard2026DraftState } from '../types';

describe('Wizard 2026 Legacy Mapping Preview', () => {
  it('1. DIRECTLY_APPLICABLE mappa limite massimo DL25 su limiteMassimoIncrementoDL25_2025', () => {
    const state: Wizard2026DraftState = {
      ...initialWizard2026DraftState,
      dl25: {
        ...initialWizard2026DraftState.dl25,
        result: {
          applicabilityStatus: 'DIRECTLY_APPLICABLE',
          soglia48: 1000,
          limiteMassimoDL25: 500,
          quotaTrasferitaAderenti: 0,
          isApplicabileDirettamente: true,
          isCalcolabile: true,
        },
      },
    };

    const preview = buildWizard2026LegacyMappingPreview(state);
    const item = preview.items.find(
      (i) => i.targetLegacyField === 'istruttorio.limiteMassimoIncrementoDL25_2025'
    );
    expect(item).toBeDefined();
    expect(item?.value).toBe(500);
    expect(item?.status).toBe('READY');

    const legacyItem = preview.items.find(
      (i) => i.targetLegacyField === 'fondoAccessorioDipendenteData.st_incrementoDL25_2025'
    );
    expect(legacyItem).toBeDefined();
    expect(legacyItem?.value).toBeNull();
    expect(legacyItem?.status).toBe('NOT_APPLICABLE');
  });

  it('2. TRANSFER_ONLY mappa limite massimo DL25 trasferibile su limiteMassimoIncrementoDL25_2025', () => {
    const state: Wizard2026DraftState = {
      ...initialWizard2026DraftState,
      dl25: {
        ...initialWizard2026DraftState.dl25,
        result: {
          applicabilityStatus: 'TRANSFER_ONLY',
          soglia48: 0,
          limiteMassimoDL25: 50000,
          quotaTrasferitaAderenti: 50000,
          isApplicabileDirettamente: false,
          isCalcolabile: true,
        },
      },
    };

    const preview = buildWizard2026LegacyMappingPreview(state);
    const item = preview.items.find(
      (i) => i.targetLegacyField === 'istruttorio.limiteMassimoIncrementoDL25_2025'
    );
    expect(item).toBeDefined();
    expect(item?.value).toBe(50000);
    expect(item?.status).toBe('READY');

    const legacyItem = preview.items.find(
      (i) => i.targetLegacyField === 'fondoAccessorioDipendenteData.st_incrementoDL25_2025'
    );
    expect(legacyItem).toBeDefined();
    expect(legacyItem?.value).toBeNull();
    expect(legacyItem?.status).toBe('NOT_APPLICABLE');
  });

  it('3. Conglobamento e PNRR mappano sui campi legacy corretti', () => {
    const state: Wizard2026DraftState = {
      ...initialWizard2026DraftState,
      ente: {
        ...initialWizard2026DraftState.ente,
        hasDirigenza: false,
      },
      conglobamentoArt60: {
        ...initialWizard2026DraftState.conglobamentoArt60,
        result: {
          riduzioneTotale: 1200,
          dettaglioPerArea: {} as any,
          ftePerArea: {} as any,
        },
      },
      pnrr: {
        ...initialWizard2026DraftState.pnrr,
        result: {
          isApplicabile: true,
          isValidable: true,
          limiteMassimoPnrrFondoDipendenti: 5000,
          totaleLimiteMassimoPnrr: 5000,
          incrementoMassimoPnrr: 5000,
          incrementoApplicato: 0,
          incrementoNonAmmesso: 0,
        },
      },
    };

    const preview = buildWizard2026LegacyMappingPreview(state);

    const art60Item = preview.items.find(
      (i) => i.targetLegacyField === 'fondoAccessorioDipendenteData.st_art60c2_CCNL2026_decurtazioneIndennitaComparto'
    );
    expect(art60Item?.value).toBe(1200);

    const pnrrLimitItem = preview.items.find(
      (i) => i.targetLegacyField === 'istruttorio.limiteMassimoPnrrFondoDipendenti'
    );
    expect(pnrrLimitItem?.value).toBe(5000);
    expect(pnrrLimitItem?.status).toBe('READY');

    const pnrrItem = preview.items.find(
      (i) => i.targetLegacyField === 'fondoAccessorioDipendenteData.vn_dl13_art8c3_incrementoPNRR_max5stabile2016'
    );
    expect(pnrrItem?.value).toBeNull();
    expect(pnrrItem?.status).toBe('NOT_APPLICABLE');
  });

  it('4. Incremento straordinario ordinario resta REQUIRES_REVIEW in assenza di campo canonico', () => {
    const state: Wizard2026DraftState = {
      ...initialWizard2026DraftState,
      straordinario: {
        ...initialWizard2026DraftState.straordinario,
        result: {
          incrementoAmmesso: 3000,
          incrementoNonAmmesso: 0,
          riduzioneFondoDecentratoNecessaria: 0,
          economieDaTrasferireVariabileUnaTantum: 0,
          totaleRisorseEscluse: 0,
          fondoStraordinarioOrdinarioAggiornato: 23000,
        } as any,
      },
    };

    const preview = buildWizard2026LegacyMappingPreview(state);
    const item = preview.items.find((i) => i.targetLegacyField === 'ambiguo.fondoStraordinarioIncremento');
    expect(item).toBeDefined();
    expect(item?.status).toBe('REQUIRES_REVIEW');
  });

  it('5. CCNL 2026 mappa 6 campi distinti su nuovo.* (MOD-015)', () => {
    const state: Wizard2026DraftState = {
      ...initialWizard2026DraftState,
      ccnl2026: {
        ...initialWizard2026DraftState.ccnl2026,
        result: {
          isCalcolabile: true,
          isMs2021Consolidato: false,
          isSuperamentoLimite022: false,
          incrementoStabile014: 1400,
          arretrati014: 2800,
          limiteMassimo022: 4400,
          incremento022Anno: 4400,
          incremento022Fondo: 3520,
          incremento022EQ: 880,
          incremento014: 1400,
          incremento022Massimo: 4400,
          incremento022Applicato: 4400,
        },
      },
    };

    const preview = buildWizard2026LegacyMappingPreview(state);

    // 1. Incremento stabile 0,14% — parte stabile
    const inc014StabileItem = preview.items.find(
      (i) => i.targetLegacyField === 'nuovo.incremento014_CCNL2026_parteStabile'
    );
    expect(inc014StabileItem).toBeDefined();
    expect(inc014StabileItem?.value).toBe(1400);
    expect(inc014StabileItem?.status).toBe('READY');

    // 2. Arretrati 0,14% — parte variabile
    const arretrati014Item = preview.items.find(
      (i) => i.targetLegacyField === 'nuovo.arretrati014_CCNL2026_parteVariabile'
    );
    expect(arretrati014Item).toBeDefined();
    expect(arretrati014Item?.value).toBe(2800);
    expect(arretrati014Item?.status).toBe('READY');

    // 3. Limite massimo 0,22%
    const lim022Item = preview.items.find(
      (i) => i.targetLegacyField === 'nuovo.limiteMassimo022_CCNL2026'
    );
    expect(lim022Item).toBeDefined();
    expect(lim022Item?.value).toBe(4400);
    expect(lim022Item?.status).toBe('READY');

    // 4. Incremento 0,22% scelto per l'anno
    const inc022AnnoItem = preview.items.find(
      (i) => i.targetLegacyField === 'nuovo.incremento022Anno_CCNL2026'
    );
    expect(inc022AnnoItem).toBeDefined();
    expect(inc022AnnoItem?.value).toBe(4400);
    expect(inc022AnnoItem?.status).toBe('READY');

    // 5. Quota 0,22% → Fondo
    const fondoItem = preview.items.find(
      (i) => i.targetLegacyField === 'nuovo.incremento022Fondo_CCNL2026'
    );
    expect(fondoItem).toBeDefined();
    expect(fondoItem?.value).toBe(3520);
    expect(fondoItem?.status).toBe('READY');

    // 6. Quota 0,22% → EQ
    const eqItem = preview.items.find(
      (i) => i.targetLegacyField === 'nuovo.incremento022EQ_CCNL2026'
    );
    expect(eqItem).toBeDefined();
    expect(eqItem?.value).toBe(880);
    expect(eqItem?.status).toBe('READY');

    // NON deve esistere il vecchio campo legacy NOT_APPLICABLE
    const oldLegacyItem = preview.items.find(
      (i) => i.targetLegacyField === 'fondoAccessorioDipendenteData.vn_art58c2_CCNL2026_incremento022_MS2021'
    );
    expect(oldLegacyItem).toBeUndefined();
  });

  it('6. Fondo per lo straordinario mappa i 9 campi corretti su nuovo.* e altri (MOD-016)', () => {
    const state: Wizard2026DraftState = {
      ...initialWizard2026DraftState,
      straordinario: {
        ...initialWizard2026DraftState.straordinario,
        result: {
          straordinarioOrdinarioSoggettoArt23: 20000,
          incrementoStraordinarioOrdinarioSoggettoArt23: 1500,
          riduzioneFondoDecentratoPerStraordinario: 500,
          economieStraordinarioAnnoPrecedenteDaRiversare: 1200,
          totaleStraordinarioEsclusoArt23: 6000,
          straordinarioEsclusoArt23Elezioni: 3000,
          straordinarioEsclusoArt23Calamita: 2000,
          straordinarioEsclusoArt23Istat: 500,
          straordinarioEsclusoArt23PoliziaLocaleDeroga: 500,
          economieStraordinarioCalcolate: 1200,
          differenzaEconomieCalcolateCertificate: 0,
          isCalcolabile: true,
          fondoStraordinarioOrdinarioResiduo: 20000,
          incrementoParteStabileDaRiduzioneStraordinario: 0,
          straordinarioOrdinarioFinaleSoggettoArt23: 21500,
          // Retrocompatibilità
          incrementoAmmesso: 1500,
          incrementoNonAmmesso: 0,
          riduzioneFondoDecentratoNecessaria: 500,
          economieDaTrasferireVariabileUnaTantum: 1200,
          totaleRisorseEscluse: 6000,
          fondoStraordinarioOrdinarioAggiornato: 21500,
        }
      }
    };

    const preview = buildWizard2026LegacyMappingPreview(state);

    const checkField = (targetField: string, expectedVal: any) => {
      const item = preview.items.find((i) => i.targetLegacyField === targetField);
      expect(item).toBeDefined();
      expect(item?.value).toBe(expectedVal);
      expect(item?.status).toBe('READY');
    };

    checkField('nuovo.straordinarioOrdinarioSoggettoArt23', 20000);
    checkField('nuovo.incrementoStraordinarioOrdinarioSoggettoArt23', 1500);
    checkField('nuovo.riduzioneFondoDecentratoPerStraordinario', 500);
    checkField('nuovo.economieStraordinarioAnnoPrecedenteDaRiversare', 1200);
    checkField('nuovo.totaleStraordinarioEsclusoArt23', 6000);
    checkField('nuovo.straordinarioEsclusoArt23Elezioni', 3000);
    checkField('nuovo.straordinarioEsclusoArt23Calamita', 2000);
    checkField('nuovo.straordinarioEsclusoArt23Istat', 500);
    checkField('nuovo.straordinarioEsclusoArt23PoliziaLocaleDeroga', 500);
  });
});


