// src/__tests__/localDraftPersistence.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { saveLocalDraft, loadLocalDraft, clearLocalDraft, hasLocalDraft } from '../application/localDraftStorage.ts';
import { FundData } from '../domain/types.ts';
import { calculateFundCompletely } from '../logic/calculation/fundEngine.ts';
import { normalizeInput } from '../application/input/inputNormalizer.ts';
import { appReducer } from '../contexts/AppContext.tsx';

// Mock di sessionStorage e localStorage per l'ambiente di test Node
const sessionStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, 'sessionStorage', {
  value: sessionStorageMock,
  writable: true
});

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true
});

describe('MOD-031D - Local Draft Persistence and Anti-Overwrite Protection Tests', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    vi.restoreAllMocks();
  });

  const mockFundData: FundData = {
    historicalData: {},
    annualData: {
      annoRiferimento: 2026,
      denominazioneEnte: 'Comune Test',
      personaleServizioAttuale: [],
      proventiSpecifici: [],
      personale2018PerArt23: [],
      personaleAnnoRifPerArt23: [],
      simulatoreInput: {}
    },
    fondoAccessorioDipendenteData: {},
    fondoElevateQualificazioniData: {},
    fondoSegretarioComunaleData: {},
    fondoDirigenzaData: {},
    distribuzioneRisorseData: {},
    personaleServizio: { dettagli: [], isManualMode: false, manualProgressioni: 0, manualIndennita: 0, manualDipendentiEquivalenti: 0 }
  };

  it('1. Chiavi draft distinte per userId/entityId/year', () => {
    const userId = 'userA';
    const entityId = 'entityX';
    const year1 = 2026;
    const year2 = 2027;

    saveLocalDraft(userId, entityId, year1, mockFundData, {}, 'Comune X');
    expect(hasLocalDraft(userId, entityId, year1)).toBe(true);
    expect(hasLocalDraft(userId, entityId, year2)).toBe(false);

    saveLocalDraft(userId, 'entityY', year1, mockFundData, {}, 'Comune Y');
    expect(hasLocalDraft(userId, 'entityY', year1)).toBe(true);
  });

  it('2. localStorage non disponibile gestito senza crash', () => {
    // Simuliamo localStorage non disponibile (es. navigazione privata)
    const spySet = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new Error('Quota exceeded or Security error');
    });

    const result = saveLocalDraft('userA', 'entityX', 2026, mockFundData, {}, 'Comune X');
    expect(result).toBe(false); // fallisce silenziosamente senza crashare
    spySet.mockRestore();
  });

  it('3. Salvataggio e recupero corretto dei metadati client-side e sorgenti', () => {
    const userId = 'userA';
    const entityId = 'entityX';
    const year = 2026;
    const mockSources: Record<string, 'manual' | 'wizard2026'> = {
      'fondoElevateQualificazioniData.va_incremento022_ms2021_eq': 'wizard2026',
      'fondoAccessorioDipendenteData.st_art79c1c_incrementoStabileConsistenzaPers': 'manual'
    };

    saveLocalDraft(userId, entityId, year, mockFundData, mockSources, 'Comune Test');
    
    const draft = loadLocalDraft(userId, entityId, year);
    expect(draft).not.toBeNull();
    expect(draft?.sources).toEqual(mockSources);
    expect(draft?.metadata.entityName).toBe('Comune Test');
    expect(draft?.metadata.year).toBe(2026);
  });

  it('4. Rimozione bozza (clearLocalDraft)', () => {
    const userId = 'userA';
    const entityId = 'entityX';
    const year = 2026;

    saveLocalDraft(userId, entityId, year, mockFundData, {}, 'Comune X');
    expect(hasLocalDraft(userId, entityId, year)).toBe(true);

    clearLocalDraft(userId, entityId, year);
    expect(hasLocalDraft(userId, entityId, year)).toBe(false);
  });

  it('4b. Migrazione automatica fl_draft_* da sessionStorage a localStorage', () => {
    const userId = 'userMigrate';
    const entityId = 'entityMigrate';
    const year = 2026;
    const key = `fl_draft_${userId}_${entityId}_${year}`;
    const envelope = {
      fundData: mockFundData,
      sources: {},
      metadata: { updatedAt: '29/05/2026', entityName: 'Ente Migrato', year }
    };

    // Scrive in sessionStorage
    sessionStorage.setItem(key, JSON.stringify(envelope));

    // Carica tramite loadLocalDraft (che farà la migrazione su localStorage)
    const draft = loadLocalDraft(userId, entityId, year);
    expect(draft).not.toBeNull();
    expect(draft?.metadata.entityName).toBe('Ente Migrato');

    // Verifica che sia migrato su localStorage
    const localStored = localStorage.getItem(key);
    expect(localStored).not.toBeNull();
    expect(JSON.parse(localStored!).metadata.entityName).toBe('Ente Migrato');
  });

  // Nuovi test per MOD-031D-FIX2
  it('5. Le action UPDATE_* modificano fundData anche se snapshotStatus è CLOSED (working copy)', () => {
    const reducer = appReducer;
    
    // Costruiamo uno stato fittizio iniziale CLOSED
    const initialState = {
      currentUser: { id: 'u1', name: 'Test User', role: 'GUEST' },
      currentYear: 2026,
      entities: [],
      currentEntity: { id: 'e1', name: 'Ente 1' },
      fundData: {
        ...mockFundData,
        metadata: {
          snapshotStatus: 'CLOSED' // snapshot chiuso
        }
      },
      complianceChecks: [],
      isLoading: false,
      validationErrors: {},
      activeTab: 'dashboard',
      navigationScope: 'DASHBOARD'
    };

    // Inviamo un'azione di modifica per verificare che non venga bloccata
    const action = {
      type: 'UPDATE_FONDO_ACCESSORIO_DIPENDENTE_DATA',
      payload: {
        st_art79c1_art67c1_unicoImporto2017: 5000
      }
    };

    // @ts-ignore
    const newState = reducer(initialState, action);

    // Il valore deve essere stato aggiornato nel React Context locale
    expect(newState.fundData.fondoAccessorioDipendenteData.st_art79c1_art67c1_unicoImporto2017).toBe(5000);
    
    // Verifichiamo che localSources sia stato popolato con percorso chiave completo e sorgente manual
    expect(newState.localSources).toBeDefined();
    expect(newState.localSources?.['fondoAccessorioDipendenteData.st_art79c1_art67c1_unicoImporto2017']).toBe('manual');
  });

  describe('MOD-031E-FIX1 - Live Art. 23 Calculation Tests', () => {
    // Utilizziamo le funzioni già importate staticamente a livello globale nel file di test
    // Per farlo, importiamole staticamente in cima al file.

    it('1. Con unico importo consolidato 2017 = 100000, le risorse rilevanti Art. 23 aumentano di 100000', () => {
      const fundData = {
        ...mockFundData,
        historicalData: {
          fondoSalarioAccessorioPersonaleNonDirEQ2016: 100000
        },
        fondoAccessorioDipendenteData: {
          st_art79c1_art67c1_unicoImporto2017: 100000,
          cl_totaleParzialeRisorsePerConfrontoTetto2016: undefined
        }
      };
      const normalized = normalizeInput(fundData);
      // Rimuoviamo cl_totaleParzialeRisorsePerConfrontoTetto2016 per forzare il ricalcolo live nel motore
      normalized.fondi.dipendente.cl_totaleParzialeRisorsePerConfrontoTetto2016 = undefined;
      const result = calculateFundCompletely(normalized, { riferimenti_normativi: {} } as any);
      expect(result.compliance.art23Compliance?.risorseRilevantiArt23).toBe(100000);
    });

    it('2. Con variabile soggetta = 9600, le risorse rilevanti Art. 23 aumentano di 9600', () => {
      const fundData = {
        ...mockFundData,
        fondoAccessorioDipendenteData: {
          st_art79c1_art67c1_unicoImporto2017: 100000,
          vs_art79c2c_risorseScelteOrganizzative: 9600,
          cl_totaleParzialeRisorsePerConfrontoTetto2016: undefined
        }
      };
      const normalized = normalizeInput(fundData);
      normalized.fondi.dipendente.cl_totaleParzialeRisorsePerConfrontoTetto2016 = undefined;
      const result = calculateFundCompletely(normalized, { riferimenti_normativi: {} } as any);
      expect(result.compliance.art23Compliance?.risorseRilevantiArt23).toBe(109600);
    });

    it('3. Con variabile non soggetta = 10150, le risorse escluse Art. 23 aumentano di 10150 e le rilevanti non aumentano', () => {
      const fundData = {
        ...mockFundData,
        fondoAccessorioDipendenteData: {
          st_art79c1_art67c1_unicoImporto2017: 100000,
          vn_art15c1k_art67c3c_incentiviTecniciCondoni: 10150,
          cl_totaleParzialeRisorsePerConfrontoTetto2016: undefined
        }
      };
      const normalized = normalizeInput(fundData);
      normalized.fondi.dipendente.cl_totaleParzialeRisorsePerConfrontoTetto2016 = undefined;
      const result = calculateFundCompletely(normalized, { riferimenti_normativi: {} } as any);
      expect(result.compliance.art23Compliance?.risorseEscluseArt23).toBe(10150);
      expect(result.compliance.art23Compliance?.risorseRilevantiArt23).toBe(100000);
    });

    it('4. Con fondo lavoro straordinario corrente = 50000, le risorse rilevanti Art. 23 includono 50000 ma il fondo costituito non aumenta per effetto dello straordinario', () => {
      const fundData = {
        ...mockFundData,
        annualData: {
          ...mockFundData.annualData,
          fondoLavoroStraordinario: 50000
        },
        fondoAccessorioDipendenteData: {
          st_art79c1_art67c1_unicoImporto2017: 100000,
          cl_totaleParzialeRisorsePerConfrontoTetto2016: undefined
        }
      };
      const normalized = normalizeInput(fundData);
      normalized.fondi.dipendente.cl_totaleParzialeRisorsePerConfrontoTetto2016 = undefined;
      const result = calculateFundCompletely(normalized, { riferimenti_normativi: {} } as any);
      // Rilevanti include lo straordinario (100k + 50k = 150k)
      expect(result.compliance.art23Compliance?.risorseRilevantiArt23).toBe(150000);
      // Il fondo costituito non aumenta per lo straordinario (resta a 100k)
      expect(result.compliance.art23Compliance?.fondoCostituitoTotale).toBe(100000);
    });

    it('5. Con Art. 60 = 5000, il fondo reale diminuisce di 5000, ma il prospetto Art. 23 lo riaggiunge figurativamente', () => {
      const fundData = {
        ...mockFundData,
        fondoAccessorioDipendenteData: {
          st_art79c1_art67c1_unicoImporto2017: 100000,
          st_art60c2_CCNL2026_decurtazioneIndennitaComparto: 5000,
          cl_totaleParzialeRisorsePerConfrontoTetto2016: undefined
        }
      };
      const normalized = normalizeInput(fundData);
      normalized.fondi.dipendente.cl_totaleParzialeRisorsePerConfrontoTetto2016 = undefined;
      const result = calculateFundCompletely(normalized, { riferimenti_normativi: {} } as any);
      // Fondo reale costituito diminuisce di 5k: 100k - 5k = 95k
      expect(result.compliance.art23Compliance?.fondoCostituitoTotale).toBe(95000);
      // Rilevanti aggiunge figurativamente i 5k dell'art 60: 95k + 5k = 100k
      expect(result.compliance.art23Compliance?.risorseRilevantiArt23).toBe(100000);
    });
  });
});
