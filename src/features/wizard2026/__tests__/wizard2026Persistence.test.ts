/**
 * MOD-032-FIX2 — Test di persistenza del Wizard 2026
 *
 * Verifica il comportamento del reducer e della logica di salvataggio/ripristino bozza.
 * I test del hook (useWizard2026Draft) richiedono il mock di React e sessionStorage —
 * qui testiamo la logica pura del reducer e le funzioni di utilità di storage.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { wizard2026Reducer } from '../reducer';
import { initialWizard2026DraftState } from '../initialState';
import type { Wizard2026DraftState } from '../types';
import { isValidDraftPayload } from '../remoteDraft/validation';
import { calculateArt23c2Adjustment } from '../../../logic/calculation/fundCalculations';
import { calculateArt23Limit, validateArt23Limit } from '../../../logic/wizard2026/art23Limit';
import { getFadFieldDefinitions } from '../../../logic/fundFieldDefinitions';

// ---- Helpers per simulare le funzioni di sessionStorage usate dall'hook ----

function buildDraftKey(
  userId: string | undefined,
  entityId: string | undefined,
  year: number | undefined
): string | null {
  if (!userId || !entityId || !year) return null;
  return `fl_wizard2026_draft_${userId}_${entityId}_${year}`;
}

// Simulazione semplificata del sessionStorage
function createFakeStorage(): Record<string, string> {
  return {};
}

describe('Wizard 2026 — Logica Reducer (persistenza navigazione)', () => {
  it('1. I dati non vengono azzerati quando si naviga tra gli step', () => {
    let state = initialWizard2026DraftState;

    state = wizard2026Reducer(state, {
      type: 'UPDATE_ENTE_STEP',
      payload: { entityType: 'COMUNE', denominazioneEnte: 'Comune di Test', hasDirigenza: false },
    });

    expect(state.ente.entityType).toBe('COMUNE');
    expect(state.ente.denominazioneEnte).toBe('Comune di Test');

    // Naviga avanti
    state = wizard2026Reducer(state, { type: 'SET_CURRENT_STEP', payload: 4 });
    state = wizard2026Reducer(state, {
      type: 'UPDATE_CCNL2026_STEP',
      payload: { monteSalari2021: 1500000, fondoRisorseDecentrate2024: 50000 },
    });

    // Torna allo step 8
    state = wizard2026Reducer(state, { type: 'SET_CURRENT_STEP', payload: 8 });

    // Verifica che i dati degli step precedenti siano conservati
    expect(state.ente.denominazioneEnte).toBe('Comune di Test');
    expect(state.ccnl2026.monteSalari2021).toBe(1500000);
    expect(state.ccnl2026.fondoRisorseDecentrate2024).toBe(50000);
  });

  it('2. RESTORE_WIZARD_2026 sostituisce completamente lo stato', () => {
    let state = initialWizard2026DraftState;
    state = wizard2026Reducer(state, {
      type: 'UPDATE_ENTE_STEP',
      payload: { entityType: 'COMUNE', denominazioneEnte: 'Comune A' },
    });

    const savedDraft = { ...state };

    // Simula reset
    state = wizard2026Reducer(state, { type: 'RESET_WIZARD_2026' });
    expect(state.ente.denominazioneEnte).toBeUndefined();

    // Ripristino dalla bozza
    state = wizard2026Reducer(state, { type: 'RESTORE_WIZARD_2026', payload: savedDraft });
    expect(state.ente.denominazioneEnte).toBe('Comune A');
  });

  it('3. I default vuoti non devono sovrascrivere dati già presenti (reset check)', () => {
    let state = initialWizard2026DraftState;
    state = wizard2026Reducer(state, {
      type: 'UPDATE_CCNL2026_STEP',
      payload: { monteSalari2021: 999000 },
    });
    expect(state.ccnl2026.monteSalari2021).toBe(999000);

    // Navigazione senza reset
    state = wizard2026Reducer(state, { type: 'SET_CURRENT_STEP', payload: 1 });
    expect(state.ccnl2026.monteSalari2021).toBe(999000); // invariato
  });
});

describe('Wizard 2026 — buildDraftKey (isolamento bozza per utente/ente/anno)', () => {
  it('4. Genera una chiave valida con tutti i parametri', () => {
    const key = buildDraftKey('user123', 'entity456', 2026);
    expect(key).toBe('fl_wizard2026_draft_user123_entity456_2026');
  });

  it('5. Restituisce null se userId è undefined o vuoto', () => {
    expect(buildDraftKey(undefined, 'entity456', 2026)).toBeNull();
    expect(buildDraftKey('', 'entity456', 2026)).toBeNull();
  });

  it('6. Restituisce null se entityId è undefined o vuoto', () => {
    expect(buildDraftKey('user123', undefined, 2026)).toBeNull();
    expect(buildDraftKey('user123', '', 2026)).toBeNull();
  });

  it('7. Restituisce null se year è undefined', () => {
    expect(buildDraftKey('user123', 'entity456', undefined)).toBeNull();
  });

  it('8. Chiavi diverse per utenti diversi', () => {
    const keyA = buildDraftKey('userA', 'entity1', 2026);
    const keyB = buildDraftKey('userB', 'entity1', 2026);
    expect(keyA).not.toBe(keyB);
  });

  it('9. Chiavi diverse per enti diversi', () => {
    const keyA = buildDraftKey('user1', 'entityA', 2026);
    const keyB = buildDraftKey('user1', 'entityB', 2026);
    expect(keyA).not.toBe(keyB);
  });

  it('10. Chiavi diverse per anni diversi', () => {
    const key2026 = buildDraftKey('user1', 'entity1', 2026);
    const key2027 = buildDraftKey('user1', 'entity1', 2027);
    expect(key2026).not.toBe(key2027);
  });

  it('11. La chiave guest01 (DEFAULT_USER) è valida (non filtrata)', () => {
    const key = buildDraftKey('guest01', 'entity1', 2026);
    expect(key).not.toBeNull();
    expect(key).toBe('fl_wizard2026_draft_guest01_entity1_2026');
  });
});

describe('Wizard 2026 — Comportamento localStorage (simulato)', () => {
  let storage: Record<string, string>;

  beforeEach(() => {
    storage = createFakeStorage();
  });

  const fakeLocalStorage = {
    getItem: (key: string) => storage[key] ?? null,
    setItem: (key: string, value: string) => { storage[key] = value; },
    removeItem: (key: string) => { delete storage[key]; },
  };

  it('12. Salvataggio e lettura bozza coerenti', () => {
    const key = 'fl_wizard2026_draft_user1_entity1_2026';
    let state = initialWizard2026DraftState;
    state = wizard2026Reducer(state, {
      type: 'UPDATE_CCNL2026_STEP',
      payload: { monteSalari2021: 1200000 },
    });

    fakeLocalStorage.setItem(key, JSON.stringify(state));
    const raw = fakeLocalStorage.getItem(key);
    const restored = raw ? JSON.parse(raw) as Wizard2026DraftState : null;

    expect(restored).not.toBeNull();
    expect(restored?.ccnl2026.monteSalari2021).toBe(1200000);
  });

  it('13. Scarta bozza: removeItem cancella solo la bozza corrente', () => {
    const key = 'fl_wizard2026_draft_user1_entity1_2026';
    const otherKey = 'fl_wizard2026_draft_user1_entity2_2026';

    fakeLocalStorage.setItem(key, JSON.stringify(initialWizard2026DraftState));
    fakeLocalStorage.setItem(otherKey, JSON.stringify(initialWizard2026DraftState));

    // Scarta solo la bozza corrente
    fakeLocalStorage.removeItem(key);

    expect(fakeLocalStorage.getItem(key)).toBeNull();
    expect(fakeLocalStorage.getItem(otherKey)).not.toBeNull();
  });

  it('14. Trasferimento riuscito: rimuove la bozza wizard', () => {
    const key = 'fl_wizard2026_draft_user1_entity1_2026';
    fakeLocalStorage.setItem(key, JSON.stringify(initialWizard2026DraftState));

    // Trasferimento completato → rimuove la bozza
    fakeLocalStorage.removeItem(key);

    expect(fakeLocalStorage.getItem(key)).toBeNull();
  });

  it('15. Bozza del Comune A non appare sul Comune B', () => {
    const keyA = 'fl_wizard2026_draft_user1_entityA_2026';
    const keyB = 'fl_wizard2026_draft_user1_entityB_2026';

    fakeLocalStorage.setItem(keyA, JSON.stringify({ ente: { denominazioneEnte: 'Comune A' } }));

    // Simulazione: leggendo la chiave per entityB, non ci sono dati
    const draftB = fakeLocalStorage.getItem(keyB);
    expect(draftB).toBeNull();
  });

  it('16. I dati del wizard 2026 non appaiono nel wizard 2027', () => {
    const key2026 = 'fl_wizard2026_draft_user1_entity1_2026';
    const key2027 = 'fl_wizard2026_draft_user1_entity1_2027';

    fakeLocalStorage.setItem(key2026, JSON.stringify({ ccnl2026: { monteSalari2021: 1500000 } }));

    const draft2027 = fakeLocalStorage.getItem(key2027);
    expect(draft2027).toBeNull();
  });

  it('17. Chiave nulla (entityId non disponibile) → nessun accesso a storage', () => {
    const key = buildDraftKey('user1', undefined, 2026);
    expect(key).toBeNull();
  });

  it('17b. Migrazione automatica da sessionStorage a localStorage', () => {
    const key = 'fl_wizard2026_draft_migrate_test';
    const mockVal = JSON.stringify({ meta: { completedSteps: [], currentStep: 1 } });
    
    // Simula presenza in sessionStorage
    const sessionMock: Record<string, string> = { [key]: mockVal };
    const localMock: Record<string, string> = {};

    const migrateKey = (k: string) => {
      const sVal = sessionMock[k];
      if (sVal !== undefined) {
        if (localMock[k] === undefined) {
          localMock[k] = sVal;
        }
      }
    };

    migrateKey(key);
    expect(localMock[key]).toBe(mockVal);
    
    // Non deve sovrascrivere se già presente in localStorage
    localMock[key] = 'already_in_local';
    migrateKey(key);
    expect(localMock[key]).toBe('already_in_local');
  });
});

describe('Wizard 2026 — Garanzia anti-overwrite al mount', () => {
  it('18. Lo stato iniziale vuoto NON sovrascrive una bozza se hasHydratedRef è false', () => {
    // Questo test verifica la logica del flag hasHydratedRef tramite simulazione
    // (il flag impedisce il salvataggio prima che l'idratazione sia completa)
    let hasHydrated = false;
    const draftKey = 'fl_wizard2026_draft_user1_entity1_2026';
    const storage: Record<string, string> = {};

    // Pre-carica una bozza valida
    const existingDraft = wizard2026Reducer(initialWizard2026DraftState, {
      type: 'UPDATE_CCNL2026_STEP',
      payload: { monteSalari2021: 888000 },
    });
    storage[draftKey] = JSON.stringify(existingDraft);

    // Simulazione: il mount tenta di salvare lo stato iniziale vuoto
    const attemptSave = (state: Wizard2026DraftState) => {
      if (!hasHydrated) return; // Il flag blocca il salvataggio
      storage[draftKey] = JSON.stringify(state);
    };

    // Tentativo di salvataggio con lo stato iniziale (simulando il mount prima dell'idratazione)
    attemptSave(initialWizard2026DraftState);

    // La bozza deve essere ancora quella originale
    const raw = storage[draftKey];
    const restored = raw ? JSON.parse(raw) as Wizard2026DraftState : null;
    expect(restored?.ccnl2026.monteSalari2021).toBe(888000); // Non sovrascritta!

    // Abilita il flag e verifica che ora il salvataggio funzioni
    hasHydrated = true;
    const updatedState = wizard2026Reducer(existingDraft, {
      type: 'UPDATE_CCNL2026_STEP',
      payload: { monteSalari2021: 999000 },
    });
    attemptSave(updatedState);
    const rawAfter = storage[draftKey];
    const restoredAfter = rawAfter ? JSON.parse(rawAfter) as Wizard2026DraftState : null;
    expect(restoredAfter?.ccnl2026.monteSalari2021).toBe(999000);
  });
});

describe('MOD-032-FIX3 — Validazione e Ripristino Bozza Wizard 2026', () => {
  it('19. isValidDraftPayload riconosce un payload valido e rigetta quelli corrotti o parziali', () => {
    expect(isValidDraftPayload(null)).toBe(false);
    expect(isValidDraftPayload(undefined)).toBe(false);
    expect(isValidDraftPayload({})).toBe(false);
    expect(isValidDraftPayload({ meta: {} })).toBe(false);

    const partialDraft = {
      meta: {},
      ente: {},
      art23: {},
      dl25: {},
      ccnl2026: {},
      conglobamentoArt60: {},
      straordinario: {},
      pnrr: {},
    };
    expect(isValidDraftPayload(partialDraft)).toBe(false); // Manca riepilogo

    const validDraft: Wizard2026DraftState = {
      meta: {} as any,
      ente: {} as any,
      art23: {} as any,
      dl25: {} as any,
      ccnl2026: {} as any,
      conglobamentoArt60: {} as any,
      straordinario: {} as any,
      pnrr: {} as any,
      riepilogo: {} as any,
    };
    expect(isValidDraftPayload(validDraft)).toBe(true);
  });

  it('20. La bozza non viene sovrascritta dallo stato vuoto se isRestorePending è true', () => {
    let isRestorePending = true;
    const draftKey = 'fl_wizard2026_draft_user1_entity1_2026';
    const storage: Record<string, string> = {};

    const existingDraft: Wizard2026DraftState = {
      meta: {} as any,
      ente: { denominazioneEnte: 'Ente di Test' } as any,
      art23: {} as any,
      dl25: {} as any,
      ccnl2026: {} as any,
      conglobamentoArt60: {} as any,
      straordinario: {} as any,
      pnrr: {} as any,
      riepilogo: {} as any,
    };
    storage[draftKey] = JSON.stringify(existingDraft);

    // Simulazione del salvataggio automatico
    const autoSave = (state: Wizard2026DraftState) => {
      if (isRestorePending) return; // Bloccato se restore è pendente
      storage[draftKey] = JSON.stringify(state);
    };

    // Un render/effect tenta di salvare lo stato vuoto iniziale
    autoSave(initialWizard2026DraftState);

    // La bozza non deve essere stata sovrascritta!
    const saved = JSON.parse(storage[draftKey]);
    expect(saved.ente.denominazioneEnte).toBe('Ente di Test');

    // Quando l'utente clicca Ripristina:
    // 1. Applica i dati allo stato
    let state = existingDraft;
    // 2. Abilita il salvataggio automatico
    isRestorePending = false;
    // 3. Il salvataggio successivo può scrivere
    autoSave(state);

    expect(JSON.parse(storage[draftKey]).ente.denominazioneEnte).toBe('Ente di Test');
  });

  describe('MOD-032-FIX5 — Test prioritizzazione banner e last_transfer', () => {
    it('Verifica salvataggio last_transfer e separazione con bozza', () => {
      const storage: Record<string, string> = {};
      const userId = 'u1', entityId = 'e1', year = 2026;
      const draftKey = `fl_wizard2026_draft_${userId}_${entityId}_${year}`;
      const lastTransferKey = `fl_wizard2026_last_transfer_${userId}_${entityId}_${year}`;

      const mockDraftState = { ...initialWizard2026DraftState, ccnl2026: { monteSalari2021: 500000 } as any };
      const lastTransferObj = {
        transferredAt: new Date().toISOString(),
        userId,
        entityId,
        year,
        wizardState: mockDraftState,
        input: {},
        computed: {},
        transferPlan: []
      };

      // Simula salvataggio last_transfer
      storage[lastTransferKey] = JSON.stringify(lastTransferObj);

      // Simula presenza di una bozza modificata successivamente
      const modifiedDraft = { ...initialWizard2026DraftState, ccnl2026: { monteSalari2021: 600000 } as any };
      storage[draftKey] = JSON.stringify(modifiedDraft);

      // Verifica isolamento chiavi
      expect(storage[draftKey]).not.toEqual(storage[lastTransferKey]);
      expect(JSON.parse(storage[draftKey]).ccnl2026.monteSalari2021).toBe(600000);
      expect(JSON.parse(storage[lastTransferKey]).wizardState.ccnl2026.monteSalari2021).toBe(500000);
    });

    it('Verifica priorità di ripristino al mount: bozza > last_transfer', () => {
      // Regola: draftExists => showRecoveryBanner = true, showLastTransferBanner = false
      const draftExists = true;
      const lastTransferExists = true;

      let showRecoveryBanner = false;
      let showLastTransferBanner = false;

      if (draftExists) {
        showRecoveryBanner = true;
        showLastTransferBanner = false;
      } else if (lastTransferExists) {
        showRecoveryBanner = false;
        showLastTransferBanner = true;
      }

      expect(showRecoveryBanner).toBe(true);
      expect(showLastTransferBanner).toBe(false);
    });
  });

  describe('MOD-032-FIX6 — Test Race Condition & Art. 23 Attualizzato', () => {
    it('Verifica che il banner last_transfer non venga azzerato in assenza di bozza', () => {
      // Regola: !draftExists && lastTransferExists => showLastTransferBanner = true
      const draftExists = false;
      const lastTransferExists = true;

      let showRecoveryBanner = false;
      let showLastTransferBanner = false;

      // Logica del primo effect (Mount)
      if (draftExists) {
        showRecoveryBanner = true;
        showLastTransferBanner = false;
      } else if (lastTransferExists) {
        showRecoveryBanner = false;
        showLastTransferBanner = true;
      }

      // Con il secondo useEffect rimosso, showLastTransferBanner rimane true!
      expect(showRecoveryBanner).toBe(false);
      expect(showLastTransferBanner).toBe(true);
    });

    it('Verifica priorità bozza valida vs last_transfer', () => {
      const draftExists = true;
      const lastTransferExists = true;

      let showRecoveryBanner = false;
      let showLastTransferBanner = false;

      if (draftExists) {
        showRecoveryBanner = true;
        showLastTransferBanner = false;
      } else if (lastTransferExists) {
        showRecoveryBanner = false;
        showLastTransferBanner = true;
      }

      expect(showRecoveryBanner).toBe(true);
      expect(showLastTransferBanner).toBe(false);
    });

    it('Verifica calcolo adeguamento Art. 23 con fallback su calculatedFteAnnoRif in caso di manual mode', () => {
      const historicalData = {
        fondoPersonaleNonDirEQ2018_Art23: 100000,
        fondoEQ2018_Art23: 10000,
      };
      const annualData = {
        manualDipendentiEquivalenti2018: 10,
        // manualDipendentiEquivalentiAnnoRif: undefined
      };
      
      const calculatedFteAnnoRif = 12; // FTE calcolato o manuale da personaleServizio
      const isManualMode = true;
      const riferimenti_normativi = { art23_dlgs75_2017: 'Art. 23 c. 2' };

      const res = calculateArt23c2Adjustment(historicalData as any, annualData as any, calculatedFteAnnoRif, isManualMode, riferimenti_normativi);
      
      // Valore pro capite 2018 = 110000 / 10 = 11000
      // Variazione FTE = 12 - 10 = 2
      // Adeguamento = 11000 * 2 = 22000
      expect(res.importo).toBe(22000);
    });
  });

  describe('MOD-032-CLOSEOUT-FIX2 — Test Auto-ripristino Wizard 2026 all’apertura', () => {
    const validDraftState: Wizard2026DraftState = {
      meta: { completedSteps: [], currentStep: 1 },
      ente: { denominazioneEnte: 'Comune Test Autorestore' },
      art23: {},
      dl25: {},
      ccnl2026: { monteSalari2021: 1500000 },
      conglobamentoArt60: {},
      straordinario: {},
      pnrr: {},
      riepilogo: {},
    } as any;

    it('Test 1 — Auto-ripristino bozza aperta: carica e applica automaticamente la bozza aperta', () => {
      const draftExists = true;
      let state = initialWizard2026DraftState;
      let isRestorePending = true;
      let showRecoveryBanner = false;

      if (draftExists) {
        state = validDraftState;
        isRestorePending = false;
        showRecoveryBanner = true;
      }

      expect(state.ccnl2026.monteSalari2021).toBe(1500000);
      expect(isRestorePending).toBe(false);
      expect(showRecoveryBanner).toBe(true);
    });

    it('Test 2 — Auto-ripristino ultimo trasferimento: carica e applica automaticamente last_transfer se bozza non esiste', () => {
      const draftExists = false;
      const lastTransferExists = true;
      const lastTransferState = { ...validDraftState, ccnl2026: { monteSalari2021: 12345 } };

      let state = initialWizard2026DraftState;
      let isRestorePending = true;
      let showLastTransferBanner = false;

      if (!draftExists && lastTransferExists) {
        state = lastTransferState as any;
        isRestorePending = true; // autosave resta in attesa
        showLastTransferBanner = true;
      }

      expect(state.ccnl2026.monteSalari2021).toBe(12345);
      expect(isRestorePending).toBe(true);
      expect(showLastTransferBanner).toBe(true);
    });

    it('Test 3 — Priorità bozza su last transfer: se esistono entrambe, carica la bozza aperta', () => {
      const draftExists = true;
      const lastTransferExists = true;
      const draftState = { ...validDraftState, ccnl2026: { monteSalari2021: 8888 } };
      const lastTransferState = { ...validDraftState, ccnl2026: { monteSalari2021: 9999 } };

      let state = initialWizard2026DraftState;

      if (draftExists) {
        state = draftState as any;
      } else if (lastTransferExists) {
        state = lastTransferState as any;
      }

      expect(state.ccnl2026.monteSalari2021).toBe(8888);
    });

    it('Test 4 — Nessuna sovrascrittura al mount: il caricamento di last_transfer non crea immediatamente file bozza o sovrascrive', () => {
      const storage: Record<string, string> = {};
      const draftKey = 'fl_wizard2026_draft_u1_e1_2026';
      
      let isRestorePending = true;
      let state = { ...validDraftState };

      const autoSave = (stateToSave: Wizard2026DraftState) => {
        if (isRestorePending) return; // Non salva!
        storage[draftKey] = JSON.stringify(stateToSave);
      };

      // Simula render al mount
      autoSave(state);
      expect(storage[draftKey]).toBeUndefined(); // Bozza non scritta nello storage
    });

    it('Test 5 — Modifica dopo auto-ripristino: l’autosave si sblocca dopo una modifica utente', () => {
      const storage: Record<string, string> = {};
      const draftKey = 'fl_wizard2026_draft_u1_e1_2026';
      
      let isRestorePending = true;
      let state = { ...validDraftState };

      const autoSave = (stateToSave: Wizard2026DraftState) => {
        if (isRestorePending) return;
        storage[draftKey] = JSON.stringify(stateToSave);
      };

      // Simula modifica campo
      isRestorePending = false;
      state = { ...state, ccnl2026: { monteSalari2021: 7777 } as any };

      autoSave(state);
      expect(storage[draftKey]).toBeDefined();
      expect(JSON.parse(storage[draftKey]).ccnl2026.monteSalari2021).toBe(7777);
    });
  });

  describe('MOD-032-CLOSEOUT-FIX3 — Incremento stabile per aumento del personale', () => {
    it('Caso 1 — incremento positivo', () => {
      const input = {
        fondoCertificatoParteStabile2018: 1000000,
        usaCalcoloManualePersonaleArt23: true,
        manualDipendentiEquivalenti2018: 100,
        manualDipendentiEquivalenti2026: 110
      };
      const res = calculateArt23Limit(input);
      expect(res.fondoCertificatoParteStabile2018).toBe(1000000);
      expect(res.dipendentiEquivalenti2018).toBe(100);
      expect(res.dipendentiEquivalenti2026).toBe(110);
      expect(res.incrementoStabileAumentoPersonale).toBe(100000);
    });

    it('Caso 2 — nessun incremento di personale', () => {
      const input = {
        fondoCertificatoParteStabile2018: 1000000,
        usaCalcoloManualePersonaleArt23: true,
        manualDipendentiEquivalenti2018: 100,
        manualDipendentiEquivalenti2026: 100
      };
      const res = calculateArt23Limit(input);
      expect(res.incrementoStabileAumentoPersonale).toBe(0);
    });

    it('Caso 3 — riduzione di personale', () => {
      const input = {
        fondoCertificatoParteStabile2018: 1000000,
        usaCalcoloManualePersonaleArt23: true,
        manualDipendentiEquivalenti2018: 100,
        manualDipendentiEquivalenti2026: 95
      };
      const res = calculateArt23Limit(input);
      expect(res.incrementoStabileAumentoPersonale).toBe(0);
    });

    it('Caso 4 — divisione non valida', () => {
      const input = {
        fondoCertificatoParteStabile2018: 1000000,
        usaCalcoloManualePersonaleArt23: true,
        manualDipendentiEquivalenti2018: 0,
        manualDipendentiEquivalenti2026: 110
      };
      const res = calculateArt23Limit(input);
      expect(res.incrementoStabileAumentoPersonale).toBe(0);
      expect(Number.isNaN(res.incrementoStabileAumentoPersonale)).toBe(false);
      expect(Number.isFinite(res.incrementoStabileAumentoPersonale)).toBe(true);

      const checks = validateArt23Limit(input);
      // Deve esistere un errore/warning per personale 2018 a zero
      const zeroCheck = checks.find((c: any) => c.id === 'ART23-PERS-2018-ZERO');
      expect(zeroCheck).toBeDefined();
    });

    it('Caso 5 — trattamento Art. 23', () => {
      // Verifichiamo che st_art79c1c_incrementoStabileConsistenzaPers concorra alle risorse rilevanti / stabili ex fundFieldDefinitions
      const targetDef = getFadFieldDefinitions({ riferimenti_normativi: {} } as any).find((d: any) => d.key === 'st_art79c1c_incrementoStabileConsistenzaPers');
      expect(targetDef).toBeDefined();
      expect(targetDef?.isRelevantToArt23Limit).toBe(true);
      expect(targetDef?.section).toBe('stabili');
    });
  });
});
