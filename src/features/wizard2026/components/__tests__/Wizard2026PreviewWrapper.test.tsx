import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { featureFlags } from '../../featureFlag';
import { Wizard2026PreviewWrapper } from '../Wizard2026PreviewWrapper';
import { NavigationScope } from '../../../../types';

// Mock di AppContext
const mockSetScopeAndTab = vi.fn();
const mockState: any = {
  currentUser: { id: 'u123', name: 'Test User' },
  currentEntity: { id: 'e123', name: 'Comune di Test' },
  currentYear: 2026,
  fundData: {
    historicalData: {},
    annualData: {
      personaleServizioAttuale: [],
      proventiSpecifici: []
    },
    fondoAccessorioDipendenteData: {}
  },
  navigationScope: NavigationScope.FONDO
};

vi.mock('../../../../contexts/AppContext', () => ({
  useAppContext: () => ({
    state: mockState,
    setScopeAndTab: mockSetScopeAndTab
  })
}));

describe('Wizard2026PreviewWrapper & Configurazione Fondo Preview (MOD-032-CLOSEOUT-FIX4)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockSetScopeAndTab.mockClear();
    sessionStorage.clear();
    localStorage.clear();
    window.history.pushState(null, '', '/configurazione-fondo-preview');
    mockState.currentYear = 2026;
    mockState.fundData = {
      historicalData: {},
      annualData: {},
      fondoAccessorioDipendenteData: {}
    };
  });

  it('1. Renderizza il messaggio di blocco se il feature flag è disattivato', () => {
    vi.spyOn(featureFlags, 'ENABLE_WIZARD_2026_PREVIEW', 'get').mockReturnValue(false);
    render(<Wizard2026PreviewWrapper />);
    expect(screen.getByText(/Accesso Non Consentito/i)).toBeInTheDocument();
  });

  it('2. Mostra la card primaria e secondaria con i pulsanti corretti', () => {
    vi.spyOn(featureFlags, 'ENABLE_WIZARD_2026_PREVIEW', 'get').mockReturnValue(true);
    render(<Wizard2026PreviewWrapper />);

    expect(screen.getByText('Raccolta dati')).toBeInTheDocument();
    expect(screen.getByText('Costituzione dei fondi')).toBeInTheDocument();
    expect(screen.getByText('Apri raccolta dati')).toBeInTheDocument();
    expect(screen.getByText('Vai alla costituzione dei fondi')).toBeInTheDocument();
  });

  it('3. Scenario A — Nessun dato Wizard e nessun trasferimento', () => {
    vi.spyOn(featureFlags, 'ENABLE_WIZARD_2026_PREVIEW', 'get').mockReturnValue(true);
    render(<Wizard2026PreviewWrapper />);

    expect(screen.getByText('Raccolta dati: non ancora compilata')).toBeInTheDocument();
    expect(screen.getByText('Trasferimento al Fondo: non ancora effettuato')).toBeInTheDocument();
    expect(screen.getByText('da avviare')).toBeInTheDocument();
  });

  it('4. Scenario B — Bozza Wizard presente, nessun trasferimento', () => {
    vi.spyOn(featureFlags, 'ENABLE_WIZARD_2026_PREVIEW', 'get').mockReturnValue(true);
    
    const draftKey = 'fl_wizard2026_draft_u123_e123_2026';
    const mockDraft = {
      ente: { denominazioneEnte: 'Comune di Test' }
    };
    sessionStorage.setItem(draftKey, JSON.stringify(mockDraft));

    render(<Wizard2026PreviewWrapper />);

    expect(screen.getByText('Raccolta dati: dati presenti')).toBeInTheDocument();
    expect(screen.getByText('Trasferimento al Fondo: non ancora effettuato')).toBeInTheDocument();
    expect(screen.getByText('non ancora trasferito')).toBeInTheDocument();
    expect(screen.getByText('Attenzione: i dati della Raccolta dati non risultano ancora trasferiti alla Costituzione dei fondi.')).toBeInTheDocument();
  });

  it('5. Scenario C — Last transfer presente, nessuna bozza successiva (allineato)', () => {
    vi.spyOn(featureFlags, 'ENABLE_WIZARD_2026_PREVIEW', 'get').mockReturnValue(true);

    const draftKey = 'fl_wizard2026_draft_u123_e123_2026';
    const lastTransferKey = 'fl_wizard2026_last_transfer_u123_e123_2026';
    const mockStateData = {
      ente: { denominazioneEnte: 'Comune di Test' }
    };

    sessionStorage.setItem(draftKey, JSON.stringify(mockStateData));
    sessionStorage.setItem(lastTransferKey, JSON.stringify({
      transferredAt: '2026-05-29T12:30:00.000Z',
      wizardState: mockStateData
    }));

    render(<Wizard2026PreviewWrapper />);

    expect(screen.getByText('Raccolta dati: dati presenti')).toBeInTheDocument();
    expect(screen.getByText(/Trasferimento al Fondo: effettuato/i)).toBeInTheDocument();
    expect(screen.getByText('allineato')).toBeInTheDocument();
  });

  it('6. Scenario D — Last transfer presente e bozza modificata dopo', () => {
    vi.spyOn(featureFlags, 'ENABLE_WIZARD_2026_PREVIEW', 'get').mockReturnValue(true);

    const draftKey = 'fl_wizard2026_draft_u123_e123_2026';
    const lastTransferKey = 'fl_wizard2026_last_transfer_u123_e123_2026';

    sessionStorage.setItem(draftKey, JSON.stringify({
      ente: { denominazioneEnte: 'Comune di Test Modificato' }
    }));
    sessionStorage.setItem(lastTransferKey, JSON.stringify({
      transferredAt: '2026-05-29T12:30:00.000Z',
      wizardState: {
        ente: { denominazioneEnte: 'Comune di Test' }
      }
    }));

    render(<Wizard2026PreviewWrapper />);

    expect(screen.getByText('Raccolta dati: modifiche non ancora trasferite al Fondo')).toBeInTheDocument();
    expect(screen.getByText('Trasferimento al Fondo: da aggiornare')).toBeInTheDocument();
    expect(screen.getByText('da aggiornare')).toBeInTheDocument();
    expect(screen.getByText('Attenzione: sono presenti modifiche nella Raccolta dati non ancora trasferite al Fondo.')).toBeInTheDocument();
  });

  it('7. Scenario E — Anno 2026 caricato come stringa', () => {
    vi.spyOn(featureFlags, 'ENABLE_WIZARD_2026_PREVIEW', 'get').mockReturnValue(true);
    mockState.currentYear = '2026';

    const draftKey = 'fl_wizard2026_draft_u123_e123_2026';
    sessionStorage.setItem(draftKey, JSON.stringify({
      ente: { denominazioneEnte: 'Comune di Test' }
    }));

    render(<Wizard2026PreviewWrapper />);
    expect(screen.getByText('Raccolta dati: dati presenti')).toBeInTheDocument();
  });
});
