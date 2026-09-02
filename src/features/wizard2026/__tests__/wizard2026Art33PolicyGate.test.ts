import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWizard2026Draft } from '../hooks/useWizard2026Draft';
import { selectWizard2026BlockingErrors } from '../selectors';
import { NavigationScope } from '../../../types';

const mockState: any = {
  currentUser: { id: 'u_art33_test', name: 'Test User' },
  currentEntity: { id: 'e_art33_test', name: 'Ente Test' },
  currentYear: 2026,
  fundData: {
    historicalData: {},
    annualData: {
      personaleServizioAttuale: [],
      proventiSpecifici: [],
    },
    fondoAccessorioDipendenteData: {},
  },
  navigationScope: NavigationScope.FONDO,
};

vi.mock('../../../contexts/AppContext', () => ({
  useAppContext: () => ({
    state: mockState,
    setScopeAndTab: vi.fn(),
  }),
}));

describe('Wizard 2026 — Art. 33 Application Policy Gate (Sections 29 & 30)', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  // Base data con incremento matematico potenziale positivo (+2 dipendenti -> incremento > 0)
  const baseArt23Payload = {
    fondoPersonaleDipendente2016: 100000,
    fondoDipendenti2018Soggetto: 100000,
    risorsePoEq2018Soggette: 10000,
    personaleServizio31122018: 10,
    personalePrevisto2026Piao: 12, // Delta = +2
  };

  describe('Section 29 — Integrazione Step 2, Summary e Mapping con UNIONE_COMUNI', () => {
    it('UNIONE_COMUNI con incremento potenziale > 0 azzera incremento e mapping usa base 2016', async () => {
      const { result } = renderHook(() => useWizard2026Draft());

      act(() => {
        result.current.updateEnte({
          entityType: 'UNIONE_COMUNI',
          annoRiferimento: 2026,
        });
        result.current.updateArt23(baseArt23Payload);
      });

      const res = result.current.state.art23.result!;
      expect(res.limite2016Base).toBe(100000);
      expect(res.incrementoProCapiteLimite).toBe(0);
      expect(res.limiteArt23Attualizzato).toBe(100000);
      expect(res.limiteArt23).toBe(100000);

      // Verifichiamo che i check pro capite siano disabilitati (nessun warning/errore di dati pro capite mancanti)
      expect(result.current.state.art23.checks.some(c => c.id === 'ART23-PRO-CAPITE-MISSING-DATA')).toBe(false);
    });
  });

  describe('Section 30 — Matrice Completa Policy nel Wizard Draft', () => {
    it('1. COMUNE 2026 -> APPLY -> incremento presente (> 0)', () => {
      const { result } = renderHook(() => useWizard2026Draft());
      act(() => {
        result.current.updateEnte({ entityType: 'COMUNE', annoRiferimento: 2026 });
        result.current.updateArt23(baseArt23Payload);
      });

      const res = result.current.state.art23.result!;
      expect(res.incrementoProCapiteLimite).toBeGreaterThan(0);
      expect(res.limiteArt23Attualizzato).toBeGreaterThan(100000);
    });

    it('2. COMUNE 2019 -> SKIP -> incremento 0', () => {
      const { result } = renderHook(() => useWizard2026Draft());
      act(() => {
        result.current.updateEnte({ entityType: 'COMUNE', annoRiferimento: 2019 });
        result.current.updateArt23(baseArt23Payload);
      });

      const res = result.current.state.art23.result!;
      expect(res.incrementoProCapiteLimite).toBe(0);
      expect(res.limiteArt23Attualizzato).toBe(100000);
    });

    it('3. UNIONE_COMUNI 2026 -> SKIP -> incremento 0', () => {
      const { result } = renderHook(() => useWizard2026Draft());
      act(() => {
        result.current.updateEnte({ entityType: 'UNIONE_COMUNI', annoRiferimento: 2026 });
        result.current.updateArt23(baseArt23Payload);
      });

      const res = result.current.state.art23.result!;
      expect(res.incrementoProCapiteLimite).toBe(0);
    });

    it('4. COMUNITA_MONTANA -> SKIP -> incremento 0', () => {
      const { result } = renderHook(() => useWizard2026Draft());
      act(() => {
        result.current.updateEnte({ entityType: 'COMUNITA_MONTANA', annoRiferimento: 2026 });
        result.current.updateArt23(baseArt23Payload);
      });

      const res = result.current.state.art23.result!;
      expect(res.incrementoProCapiteLimite).toBe(0);
    });

    it('5. PROVINCIA + ORDINARY_REGIME -> APPLY -> incremento presente', () => {
      const { result } = renderHook(() => useWizard2026Draft());
      act(() => {
        result.current.updateEnte({
          entityType: 'PROVINCIA',
          territorialContext: 'ORDINARY_REGIME',
          annoRiferimento: 2026,
        });
        result.current.updateArt23(baseArt23Payload);
      });

      const res = result.current.state.art23.result!;
      expect(res.incrementoProCapiteLimite).toBeGreaterThan(0);
    });

    it('6. PROVINCIA + SICILIAN_AREA_VASTA -> SKIP -> incremento 0', () => {
      const { result } = renderHook(() => useWizard2026Draft());
      act(() => {
        result.current.updateEnte({
          entityType: 'PROVINCIA',
          territorialContext: 'SICILIAN_AREA_VASTA',
          annoRiferimento: 2026,
        });
        result.current.updateArt23(baseArt23Payload);
      });

      const res = result.current.state.art23.result!;
      expect(res.incrementoProCapiteLimite).toBe(0);
    });

    it('7. PROVINCIA + context undefined + decision undefined -> BLOCK -> incremento 0 e blocking error', () => {
      const { result } = renderHook(() => useWizard2026Draft());
      act(() => {
        result.current.updateEnte({
          entityType: 'PROVINCIA',
          territorialContext: undefined,
          annoRiferimento: 2026,
          art33ManualDecision: undefined,
        });
        result.current.updateArt23(baseArt23Payload);
      });

      const res = result.current.state.art23.result!;
      expect(res.incrementoProCapiteLimite).toBe(0);
      expect(result.current.state.art23.checks.some(c => c.id === 'ART33-MANUAL-DECISION-REQUIRED' && c.severity === 'error')).toBe(true);

      // Impedisce il trasferimento
      const blocking = selectWizard2026BlockingErrors(result.current.state);
      expect(blocking.some(b => b.id === 'ART33-MANUAL-DECISION-REQUIRED')).toBe(true);
    });

    it('8. PROVINCIA + context undefined + APPLY -> APPLY -> incremento presente', () => {
      const { result } = renderHook(() => useWizard2026Draft());
      act(() => {
        result.current.updateEnte({
          entityType: 'PROVINCIA',
          territorialContext: undefined,
          annoRiferimento: 2026,
          art33ManualDecision: 'APPLY',
        });
        result.current.updateArt23(baseArt23Payload);
      });

      const res = result.current.state.art23.result!;
      expect(res.incrementoProCapiteLimite).toBeGreaterThan(0);
      expect(result.current.state.art23.checks.some(c => c.id === 'ART33-MANUAL-DECISION-REQUIRED')).toBe(false);
    });

    it('9. PROVINCIA + context undefined + DO_NOT_APPLY -> SKIP -> incremento 0', () => {
      const { result } = renderHook(() => useWizard2026Draft());
      act(() => {
        result.current.updateEnte({
          entityType: 'PROVINCIA',
          territorialContext: undefined,
          annoRiferimento: 2026,
          art33ManualDecision: 'DO_NOT_APPLY',
        });
        result.current.updateArt23(baseArt23Payload);
      });

      const res = result.current.state.art23.result!;
      expect(res.incrementoProCapiteLimite).toBe(0);
      expect(result.current.state.art23.checks.some(c => c.id === 'ART33-MANUAL-DECISION-REQUIRED')).toBe(false);
    });

    it('10. REGIONE + ORDINARY_REGIME -> APPLY -> incremento presente', () => {
      const { result } = renderHook(() => useWizard2026Draft());
      act(() => {
        result.current.updateEnte({
          entityType: 'REGIONE',
          territorialContext: 'ORDINARY_REGIME',
          annoRiferimento: 2026,
        });
        result.current.updateArt23(baseArt23Payload);
      });

      const res = result.current.state.art23.result!;
      expect(res.incrementoProCapiteLimite).toBeGreaterThan(0);
    });

    it('11. REGIONE + OTHER_SPECIAL_AUTONOMY -> SKIP -> incremento 0', () => {
      const { result } = renderHook(() => useWizard2026Draft());
      act(() => {
        result.current.updateEnte({
          entityType: 'REGIONE',
          territorialContext: 'OTHER_SPECIAL_AUTONOMY',
          annoRiferimento: 2026,
        });
        result.current.updateArt23(baseArt23Payload);
      });

      const res = result.current.state.art23.result!;
      expect(res.incrementoProCapiteLimite).toBe(0);
    });

    it('12. ALTRO + undefined decision -> BLOCK', () => {
      const { result } = renderHook(() => useWizard2026Draft());
      act(() => {
        result.current.updateEnte({
          entityType: 'ALTRO',
          annoRiferimento: 2026,
          art33ManualDecision: undefined,
        });
        result.current.updateArt23(baseArt23Payload);
      });

      const res = result.current.state.art23.result!;
      expect(res.incrementoProCapiteLimite).toBe(0);
      expect(result.current.state.art23.checks.some(c => c.id === 'ART33-MANUAL-DECISION-REQUIRED')).toBe(true);
    });

    it('13. ALTRO + APPLY -> APPLY -> incremento presente', () => {
      const { result } = renderHook(() => useWizard2026Draft());
      act(() => {
        result.current.updateEnte({
          entityType: 'ALTRO',
          annoRiferimento: 2026,
          art33ManualDecision: 'APPLY',
        });
        result.current.updateArt23(baseArt23Payload);
      });

      const res = result.current.state.art23.result!;
      expect(res.incrementoProCapiteLimite).toBeGreaterThan(0);
      expect(result.current.state.art23.checks.some(c => c.id === 'ART33-MANUAL-DECISION-REQUIRED')).toBe(false);
    });

    it('14. ALTRO + DO_NOT_APPLY -> SKIP -> incremento 0', () => {
      const { result } = renderHook(() => useWizard2026Draft());
      act(() => {
        result.current.updateEnte({
          entityType: 'ALTRO',
          annoRiferimento: 2026,
          art33ManualDecision: 'DO_NOT_APPLY',
        });
        result.current.updateArt23(baseArt23Payload);
      });

      const res = result.current.state.art23.result!;
      expect(res.incrementoProCapiteLimite).toBe(0);
      expect(result.current.state.art23.checks.some(c => c.id === 'ART33-MANUAL-DECISION-REQUIRED')).toBe(false);
    });
  });
});
