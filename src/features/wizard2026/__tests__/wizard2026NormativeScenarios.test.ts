import { describe, it, expect } from 'vitest';
import {
  calculateArt23Limit,
  validateArt23Limit,
  calculateDl25Increment,
  validateDl25Increment,
  calculateCcnl2026Increments,
  calculateConglobamentoArt60,
  calculateStraordinarioIncrement,
  validateStraordinarioIncrement,
  calculatePnrrIncrement,
  validatePnrrIncrement,
  PnrrIncrementInput,
} from '../../../logic/wizard2026';
import { buildWizard2026LegacyMappingPreview } from '../mappingPreview';
import { initialWizard2026DraftState } from '../initialState';
import { Wizard2026DraftState } from '../types';

describe('Collaudo Normativo Wizard Istruttorio 2026 (Scenari A-S)', () => {
  it('SCENARIO A — Art. 23 con limite ricostruito', () => {
    const input = {
      fondoPersonaleDipendente2016: 1000000,
      fondoEqPo2016: 100000,
      fondoDirigenza2016: 200000,
      risorseSegretario2016: 30000,
      fondoStraordinario2016: 50000,
      hasDirigenza: true,
      risorseSoggetteAttuali: 1300000,
      risorseEscluseAttuali: 80000,
    };
    const res = calculateArt23Limit(input);
    const checks = validateArt23Limit(input);

    expect(res.limiteRicostruito2016).toBe(1380000);
    expect(res.limiteCertificatoUtilizzato).toBe(false);
    expect(res.limiteArt23).toBe(1380000);
    expect(res.margineArt23).toBe(0); // Deprecated in MOD-008
    expect(res.superamentoArt23).toBe(0); // Deprecated in MOD-008
    expect(checks.some(c => c.severity === 'error')).toBe(false);
  });

  it('SCENARIO B — Art. 23 con limite certificato prevalente', () => {
    const input = {
      fondoPersonaleDipendente2016: 1000000,
      fondoEqPo2016: 100000,
      fondoDirigenza2016: 200000,
      risorseSegretario2016: 30000,
      fondoStraordinario2016: 50000,
      limite2016CertificatoEnte: 1500000,
      hasDirigenza: true,
      risorseSoggetteAttuali: 1420000,
    };
    const res = calculateArt23Limit(input);

    expect(res.limiteArt23).toBe(1500000);
    expect(res.limiteCertificatoUtilizzato).toBe(true);
    expect(res.margineArt23).toBe(0); // Deprecated in MOD-008
  });

  it('SCENARIO C — Art. 23 senza dirigenza', () => {
    const input = {
      fondoPersonaleDipendente2016: 1000000,
      fondoEqPo2016: 100000,
      fondoDirigenza2016: 200000,
      risorseSegretario2016: 30000,
      fondoStraordinario2016: 50000,
      hasDirigenza: false,
    };
    const res = calculateArt23Limit(input);

    // Senza dirigenza, i 200.000 non vengono sommati nel limite
    expect(res.limiteRicostruito2016).toBe(1180000);
  });

  it('SCENARIO D — D.L. 25/2025 Comune applicabile', () => {
    const input = {
      entityType: 'COMUNE' as const,
      stipendiTabellari2023NonDirigenti: 2500000,
      fondoStabile2025Certificato: 1000000,
      budgetEq2025: 100000,
      isPrimaFasciaDl34: true,
      isEquilibrioPluriennaleAsseverato: true,
      isDissesto: false,
      isStrutturalmenteDeficitario: false,
      isPianoRiequilibrio: false,
    };
    const res = calculateDl25Increment(input);
    const checks = validateDl25Increment(input);

    expect(res.applicabilityStatus).toBe('DIRECTLY_APPLICABLE');
    expect(res.soglia48).toBe(1200000); // 2.500.000 * 0.48
    expect(res.limiteMassimoDL25).toBe(100000); // 1.200.000 - 1.000.000 - 100.000
    expect(checks.some(c => c.severity === 'error')).toBe(false);
  });

  it('SCENARIO E — D.L. 25/2025 calcolo del limite massimo', () => {
    const input = {
      entityType: 'COMUNE' as const,
      stipendiTabellari2023NonDirigenti: 2500000,
      fondoStabile2025Certificato: 1000000,
      budgetEq2025: 100000,
      isPrimaFasciaDl34: true,
      isEquilibrioPluriennaleAsseverato: true,
    };
    const res = calculateDl25Increment(input);
    const checks = validateDl25Increment(input);

    expect(res.limiteMassimoDL25).toBe(100000);
    expect(checks.some(c => c.severity === 'error')).toBe(false);
  });

  it('SCENARIO F — D.L. 25/2025 Unione di Comuni', () => {
    const input = {
      entityType: 'UNIONE_COMUNI' as const,
      quotaTrasferitaAderentiDL25_2025: 25000,
      attiComuniAderentiPresenti: false,
      riduzionePermanenteFondiComuniCertificata: false,
    };
    const res = calculateDl25Increment(input);
    const checks = validateDl25Increment(input);

    expect(res.applicabilityStatus).toBe('TRANSFER_ONLY');
    expect(res.soglia48).toBe(0);
    expect(res.limiteMassimoDL25).toBe(0);
    expect(res.quotaTrasferitaAderenti).toBe(25000);
    expect(checks.some(c => c.id === 'DL25-TRANSFER-NO-ATTI')).toBe(true);
    expect(checks.some(c => c.id === 'DL25-TRANSFER-NO-RIDUZIONE')).toBe(true);
  });

  it('SCENARIO G — D.L. 25/2025 Camera di Commercio', () => {
    const input = {
      entityType: 'CAMERA_COMMERCIO' as const,
      quotaTrasferitaAderentiDL25_2025: 10000,
    };
    const res = calculateDl25Increment(input);
    const checks = validateDl25Increment(input);

    expect(res.applicabilityStatus).toBe('NOT_APPLICABLE');
    expect(res.limiteMassimoDL25).toBe(0);
    expect(checks.some(c => c.id === 'DL25-NOT-APPLICABLE-HAS-VALUE' && c.severity === 'error')).toBe(true);
  });

  it('SCENARIO H — CCNL 23.02.2026 0,14% e 0,22% (MOD-015)', () => {
    const input = {
      monteSalari2021: 1000000,
      annoRiferimento: 2026,
    };
    const res = calculateCcnl2026Increments(input);

    expect(res.isCalcolabile).toBe(true);
    expect(res.incrementoStabile014).toBe(1400);  // 1.000.000 * 0.0014 * 1
    expect(res.arretrati014).toBe(2800);           // 1.000.000 * 0.0014 * 2
    expect(res.limiteMassimo022).toBe(4400);       // 1.000.000 * 0.0022 * 2 (anno 2026)
    expect(res.incremento014).toBe(1400);
    expect(res.incremento022Massimo).toBe(4400);
  });

  it('SCENARIO I — Conglobamento art. 60', () => {
    const input = {
      ftePerArea: {
        FUNZIONARIO_EQ: 0.75,
        OPERATORE_ESPERTO: 0.80,
      },
    };
    const res = calculateConglobamentoArt60(input);

    // FUNZIONARIO_EQ: 127.44 * 0.75 = 95.58
    // OPERATORE_ESPERTO: 96.72 * 0.80 = 77.376
    // Totale: 172.956
    expect(res.dettaglioPerArea.FUNZIONARIO_EQ.riduzione).toBeCloseTo(95.58, 4);
    expect(res.dettaglioPerArea.OPERATORE_ESPERTO.riduzione).toBeCloseTo(77.376, 4);
    expect(res.riduzioneTotale).toBeCloseTo(172.956, 4);
  });

  it('SCENARIO L — Straordinario con dirigenza', () => {
    const inputValido = {
      hasDirigenza: true,
      fondoStraordinarioOrdinarioAnnoCorrente: 50000,
      incrementoStraordinarioOrdinario: 8000,
      quotaFinanziataConCapienzaArt23: 8000,
      quotaFinanziataConRiduzioneFondo: 0,
    };
    const resValido = calculateStraordinarioIncrement(inputValido);
    const checksValido = validateStraordinarioIncrement(inputValido);

    expect(resValido.straordinarioOrdinarioSoggettoArt23).toBe(58000);
    expect(resValido.incrementoStraordinarioOrdinarioSoggettoArt23).toBe(8000);
    expect(checksValido.filter(c => c.severity === 'error').length).toBe(0);

    const inputErrore = {
      hasDirigenza: true,
      incrementoStraordinarioOrdinario: 8000,
      quotaFinanziataConRiduzioneFondo: 2000,
    };
    const checksErrore = validateStraordinarioIncrement(inputErrore);
    expect(checksErrore.some(c => c.id === 'STRAORD-DIR-RIDUZIONE-VIOLATION')).toBe(true);
  });

  it('SCENARIO M — Straordinario senza dirigenza, riduzione mancante', () => {
    const input = {
      hasDirigenza: false,
      incrementoStraordinarioOrdinario: 8000,
      quotaFinanziataConRiduzioneFondo: 8000,
      contrattazioneIntegrativaRiduzioneFondo: false,
    };
    const checks = validateStraordinarioIncrement(input);

    expect(checks.some(c => c.id === 'STRAORD-NO-DIR-CONTRATTAZIONE-MISSING' && c.severity === 'error')).toBe(true);
  });

  it('SCENARIO N — Straordinario senza dirigenza, operazione neutrale', () => {
    const input = {
      hasDirigenza: false,
      fondoStraordinarioOrdinarioAnnoCorrente: 20000,
      incrementoStraordinarioOrdinario: 8000,
      quotaFinanziataConRiduzioneFondo: 8000,
      contrattazioneIntegrativaRiduzioneFondo: true,
    };
    const res = calculateStraordinarioIncrement(input);
    const checks = validateStraordinarioIncrement(input);

    expect(res.straordinarioOrdinarioSoggettoArt23).toBe(28000);
    expect(res.riduzioneFondoDecentratoPerStraordinario).toBe(8000);
    expect(checks.filter(c => c.severity === 'error').length).toBe(0);
  });

  it('SCENARIO O — Economie straordinario', () => {
    const input = {
      hasDirigenza: true,
      stanziamentoStraordinarioOrdinarioAnnoPrecedente: 30000,
      spesaStraordinarioOrdinarioAnnoPrecedente: 27000,
    };
    const res = calculateStraordinarioIncrement(input);

    expect(res.economieStraordinarioAnnoPrecedenteDaRiversare).toBe(3000);
  });

  it('SCENARIO P — PNRR', () => {
    const input: PnrrIncrementInput = {
      annoRiferimento: 2026,
      soggettoAttuatorePnrr: true,
      componenteStabileFondoDipendenti2016: 1000000,
      hasDirigenza: false,
      equilibrioEsercizioPrecedente: true,
      parametriDebitoCommercialeEsercizioPrecedente: true,
      rendicontoApprovatoTermini: true,
      incidenzaSalarioAccessorioScelta: 'diretto',
      incidenzaSalarioAccessorioPercentuale: 6.0,
    };
    const res = calculatePnrrIncrement(input);
    const checks = validatePnrrIncrement(input);

    expect(res.isApplicabile).toBe(true);
    expect(res.isValidable).toBe(true);
    expect(res.limiteMassimoPnrrFondoDipendenti).toBe(50000); // 5% di 1.000.000
    expect(res.totaleLimiteMassimoPnrr).toBe(50000);
    expect(checks.some(c => c.severity === 'error')).toBe(false);
  });

  it('SCENARIO Q — PNRR requisiti contabili non rispettati', () => {
    const input: PnrrIncrementInput = {
      annoRiferimento: 2026,
      soggettoAttuatorePnrr: true,
      componenteStabileFondoDipendenti2016: 1000000,
      hasDirigenza: false,
      equilibrioEsercizioPrecedente: false, // Equilibrio non rispettato
      parametriDebitoCommercialeEsercizioPrecedente: true,
      rendicontoApprovatoTermini: true,
      incidenzaSalarioAccessorioScelta: 'diretto',
      incidenzaSalarioAccessorioPercentuale: 6.0,
    };
    const res = calculatePnrrIncrement(input);
    const checks = validatePnrrIncrement(input);

    expect(res.isApplicabile).toBe(true);
    expect(res.isValidable).toBe(true);
    expect(res.limiteMassimoPnrrFondoDipendenti).toBe(0); // Limite azzerato
    expect(checks.some(c => c.id === 'PNRR-NO-EQUILIBRIO' && c.severity === 'error')).toBe(true);
  });

  it('SCENARIO R & S — Mapping preview complessivo e TRANSFER_ONLY', () => {
    // SCENARIO R
    const stateR: Wizard2026DraftState = {
      ...initialWizard2026DraftState,
      ente: {
        ...initialWizard2026DraftState.ente,
        entityType: 'COMUNE',
      },
      dl25: {
        ...initialWizard2026DraftState.dl25,
        result: {
          applicabilityStatus: 'DIRECTLY_APPLICABLE',
          soglia48: 1200000,
          incrementoMassimoTeorico: 100000,
          incrementoApplicato: 80000,
          limiteMassimoDL25: 80000,
          quotaTrasferitaAderenti: 0,
          isApplicabileDirettamente: true,
          isCalcolabile: true,
        },
      },
      ccnl2026: {
        ...initialWizard2026DraftState.ccnl2026,
        result: {
          isCalcolabile: true,
          isMs2021Consolidato: false,
          isSuperamentoLimite022: false,
          incrementoStabile014: 1400,
          arretrati014: 2800,
          limiteMassimo022: 4400,
          incremento014: 1400,
          incremento022Massimo: 4400,
          incremento022Applicato: 4400,
        },
      },
      conglobamentoArt60: {
        ...initialWizard2026DraftState.conglobamentoArt60,
        result: {
          dettaglioPerArea: {
            FUNZIONARIO_EQ: { fte: 0.75, importoAnnuo: 127.44, riduzione: 95.58 },
            OPERATORE_ESPERTO: { fte: 0.80, importoAnnuo: 96.72, riduzione: 77.376 },
            ISTRUTTORE: { fte: 0, importoAnnuo: 112.80, riduzione: 0 },
            OPERATORE: { fte: 0, importoAnnuo: 79.56, riduzione: 0 },
          },
          riduzioneTotale: 172.956,
          ftePerArea: {
            FUNZIONARIO_EQ: 0.75,
            OPERATORE_ESPERTO: 0.80,
            ISTRUTTORE: 0,
            OPERATORE: 0,
          },
        },
      },
      straordinario: {
        ...initialWizard2026DraftState.straordinario,
        result: {
          incrementoAmmesso: 5000,
          incrementoNonAmmesso: 0,
          riduzioneFondoDecentratoNecessaria: 0,
          economieDaTrasferireVariabileUnaTantum: 3000,
          totaleRisorseEscluse: 0,
          fondoStraordinarioOrdinarioAggiornato: 55000,
        } as any,
      },
      pnrr: {
        ...initialWizard2026DraftState.pnrr,
        result: {
          isApplicabile: true,
          isValidable: true,
          limiteMassimoPnrrFondoDipendenti: 50000,
          totaleLimiteMassimoPnrr: 50000,
          incrementoMassimoPnrr: 50000,
          incrementoApplicato: 0,
          incrementoNonAmmesso: 0,
        },
      },
    };

    const previewR = buildWizard2026LegacyMappingPreview(stateR);
    const dl25Item = previewR.items.find(i => i.targetLegacyField === 'fondoAccessorioDipendenteData.st_incrementoDL25_2025');
    const ccnl014StabileItem = previewR.items.find(i => i.targetLegacyField === 'nuovo.incremento014_CCNL2026_parteStabile');
    const ccnl014ArretratiItem = previewR.items.find(i => i.targetLegacyField === 'nuovo.arretrati014_CCNL2026_parteVariabile');
    const ccnlMax022Item = previewR.items.find(i => i.targetLegacyField === 'nuovo.limiteMassimo022_CCNL2026');
    const ccnl022AnnoItem = previewR.items.find(i => i.targetLegacyField === 'nuovo.incremento022Anno_CCNL2026');
    const ccnl022FondoItem = previewR.items.find(i => i.targetLegacyField === 'nuovo.incremento022Fondo_CCNL2026');
    const ccnl022EQItem = previewR.items.find(i => i.targetLegacyField === 'nuovo.incremento022EQ_CCNL2026');
    const art60Item = previewR.items.find(i => i.targetLegacyField === 'fondoAccessorioDipendenteData.st_art60c2_CCNL2026_decurtazioneIndennitaComparto');
    const strItem = previewR.items.find(i => i.targetLegacyField === 'fondoAccessorioDipendenteData.vn_art15c1m_art67c3e_risparmiStraordinario');
    const pnrrItem = previewR.items.find(i => i.targetLegacyField === 'istruttorio.limiteMassimoPnrrFondoDipendenti');
    const legacyPnrrItem = previewR.items.find(i => i.targetLegacyField === 'fondoAccessorioDipendenteData.vn_dl13_art8c3_incrementoPNRR_max5stabile2016');

    expect(dl25Item?.value).toBeNull();
    expect(dl25Item?.status).toBe('NOT_APPLICABLE');

    const dl25LimiteItem = previewR.items.find(i => i.targetLegacyField === 'istruttorio.limiteMassimoIncrementoDL25_2025');
    expect(dl25LimiteItem?.value).toBe(80000);
    expect(dl25LimiteItem?.status).toBe('READY');

    expect(ccnl014StabileItem?.value).toBe(1400);
    expect(ccnl014StabileItem?.status).toBe('READY');

    expect(ccnl014ArretratiItem?.value).toBe(2800);
    expect(ccnl014ArretratiItem?.status).toBe('READY');

    expect(ccnlMax022Item?.value).toBe(4400);
    expect(ccnlMax022Item?.status).toBe('READY');

    expect(ccnl022AnnoItem?.value).toBeNull();
    expect(ccnl022AnnoItem?.status).toBe('MISSING');

    expect(ccnl022FondoItem?.value).toBeNull();
    expect(ccnl022FondoItem?.status).toBe('MISSING');

    expect(ccnl022EQItem?.value).toBeNull();
    expect(ccnl022EQItem?.status).toBe('MISSING');

    expect(art60Item?.value).toBe(172.956);
    expect(art60Item?.status).toBe('READY');

    expect(strItem?.value).toBe(3000);
    expect(strItem?.status).toBe('READY');

    expect(pnrrItem?.value).toBe(50000);
    expect(pnrrItem?.status).toBe('READY');
    expect(legacyPnrrItem?.value).toBeNull();
    expect(legacyPnrrItem?.status).toBe('NOT_APPLICABLE');

    // SCENARIO S
    const stateS: Wizard2026DraftState = {
      ...initialWizard2026DraftState,
      ente: {
        ...initialWizard2026DraftState.ente,
        entityType: 'UNIONE_COMUNI',
      },
      dl25: {
        ...initialWizard2026DraftState.dl25,
        result: {
          applicabilityStatus: 'TRANSFER_ONLY',
          soglia48: 0,
          incrementoMassimoTeorico: 0,
          incrementoApplicato: 0,
          limiteMassimoDL25: 25000,
          quotaTrasferitaAderenti: 25000,
          isApplicabileDirettamente: false,
          isCalcolabile: true,
        },
      },
    };

    const previewS = buildWizard2026LegacyMappingPreview(stateS);
    const transferItem = previewS.items.find(i => i.targetLegacyField === 'nuovo.quotaTrasferitaAderentiDL25_2025');
    const directItem = previewS.items.find(i => i.targetLegacyField === 'fondoAccessorioDipendenteData.st_incrementoDL25_2025');

    expect(transferItem?.value).toBe(25000);
    expect(transferItem?.status).toBe('READY');
    expect(directItem?.status).toBe('NOT_APPLICABLE');
    expect(directItem?.value).toBeNull();
  });
});
