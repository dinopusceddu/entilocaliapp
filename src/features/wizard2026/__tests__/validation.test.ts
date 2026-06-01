import { describe, it, expect } from 'vitest';
import {
  validateWizard2026All,
  validateWizard2026Dl25Step,
  validateWizard2026ConglobamentoArt60Step,
  validateWizard2026StraordinarioStep,
} from '../validation';
import { initialWizard2026DraftState } from '../initialState';
import { Wizard2026DraftState } from '../types';

describe('Wizard 2026 Validation Aggregate', () => {
  it('1. DL25 con ente non ammesso e importo richiesto produce check di error', () => {
    const state: Wizard2026DraftState = {
      ...initialWizard2026DraftState,
      ente: {
        ...initialWizard2026DraftState.ente,
        entityType: 'CAMERA_COMMERCIO',
      },
      dl25: {
        ...initialWizard2026DraftState.dl25,
        quotaTrasferitaAderentiDL25_2025: 10000,
      },
    };

    const checks = validateWizard2026Dl25Step(state);
    const err = checks.find((c) => c.id === 'DL25-NOT-APPLICABLE-HAS-VALUE');
    expect(err).toBeDefined();
    expect(err?.severity).toBe('error');
  });

  it('2. Conglobamento con FTE negativo produce check', () => {
    const state: Wizard2026DraftState = {
      ...initialWizard2026DraftState,
      conglobamentoArt60: {
        ...initialWizard2026DraftState.conglobamentoArt60,
        personaleInteroArea: { FUNZIONARIO_EQ: -1 },
        checks: [],
      },
    };

    const checks = validateWizard2026ConglobamentoArt60Step(state);
    const err = checks.find((c) => c.id === 'ART60-NEG-INTERO-FUNZIONARIO_EQ');
    expect(err).toBeDefined();
    expect(err?.severity).toBe('error');
  });

  it('3. Straordinario senza dirigenza e riduzione senza contrattazione produce errore bloccante', () => {
    const state: Wizard2026DraftState = {
      ...initialWizard2026DraftState,
      ente: {
        ...initialWizard2026DraftState.ente,
        hasDirigenza: false,
      },
      straordinario: {
        ...initialWizard2026DraftState.straordinario,
        quotaFinanziataConRiduzioneFondo: 5000,
        contrattazioneIntegrativaRiduzioneFondo: false,
      },
    };

    const checks = validateWizard2026StraordinarioStep(state);
    const err = checks.find((c) => c.id === 'STRAORD-NO-DIR-CONTRATTAZIONE-MISSING');
    expect(err).toBeDefined();
    expect(err?.severity).toBe('error');
  });

  it('4. validateWizard2026All aggrega tutti i controlli', () => {
    const state: Wizard2026DraftState = {
      ...initialWizard2026DraftState,
      ente: {
        ...initialWizard2026DraftState.ente,
        entityType: 'CAMERA_COMMERCIO',
      },
      dl25: {
        ...initialWizard2026DraftState.dl25,
        quotaTrasferitaAderentiDL25_2025: 10000,
      },
      conglobamentoArt60: {
        ...initialWizard2026DraftState.conglobamentoArt60,
        personaleInteroArea: { OPERATORE: -2 },
        checks: [],
      },
    };

    const all = validateWizard2026All(state);
    expect(all.some((c) => c.id === 'DL25-NOT-APPLICABLE-HAS-VALUE')).toBe(true);
    expect(all.some((c) => c.id === 'ART60-NEG-INTERO-OPERATORE')).toBe(true);
  });

  it('5. Ente strutturalmente deficitario senza approvazione COSFEL produce errori aggregati su incrementi discrezionali', () => {
    const state: Wizard2026DraftState = {
      ...initialWizard2026DraftState,
      ente: {
        ...initialWizard2026DraftState.ente,
        entityType: 'COMUNE',
        isStrutturalmenteDeficitario: true,
        hasApprovazioneCosfel: false,
      },
      dl25: {
        ...initialWizard2026DraftState.dl25,
      },
      ccnl2026: {
        ...initialWizard2026DraftState.ccnl2026,
        applicaIncremento022: true,
        percentualeApplicata022: 100,
      },
      straordinario: {
        ...initialWizard2026DraftState.straordinario,
        incrementoRichiesto: 5000,
      },
      pnrr: {
        ...initialWizard2026DraftState.pnrr,
        incrementoApplicato: 8000,
      },
    };

    const all = validateWizard2026All(state);
    
    expect(all.some((c) => c.id === 'COSFEL-BLOCKED-DL25')).toBe(true);
    expect(all.some((c) => c.id === 'COSFEL-BLOCKED-CCNL2026-022')).toBe(true);
    expect(all.some((c) => c.id === 'COSFEL-BLOCKED-STRAORDINARIO')).toBe(true);
    expect(all.some((c) => c.id === 'COSFEL-NOT-APPROVED-PNRR')).toBe(true);

    const stateWithCosfel: Wizard2026DraftState = {
      ...state,
      ente: {
        ...state.ente,
        hasApprovazioneCosfel: true,
      },
    };
    const allWithCosfel = validateWizard2026All(stateWithCosfel);
    expect(allWithCosfel.some((c) => c.id === 'COSFEL-BLOCKED-DL25' || c.id === 'COSFEL-BLOCKED-CCNL2026-022' || c.id === 'COSFEL-BLOCKED-STRAORDINARIO')).toBe(false);
    expect(allWithCosfel.some((c) => c.id === 'COSFEL-NOT-APPROVED-PNRR')).toBe(false);
  });
});
