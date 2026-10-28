import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CompliancePage } from '../CompliancePage';
import { NavigationScope } from '../../domain';
import { ComplianceCheck } from '../../domain';

const mockSetScopeAndTab = vi.fn();
let mockState: any;

vi.mock('../../contexts/AppContext', () => ({
  useAppContext: () => ({
    state: mockState,
    setScopeAndTab: mockSetScopeAndTab,
  }),
}));

describe('CompliancePage navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('navigates to NavigationScope.FONDO when relatedPage is fondoDipendenti', () => {
    const checks: ComplianceCheck[] = [
      {
        id: 'chk_fondo',
        descrizione: 'Controllo Fondo Dipendenti',
        isCompliant: false,
        gravita: 'warning',
        messaggio: 'Attenzione sui dati del fondo dipendenti',
        riferimentoNormativo: 'Art. 79',
        relatedPage: 'fondoDipendenti',
      },
    ];

    mockState = {
      complianceChecks: checks,
      isLoading: false,
    };

    render(<CompliancePage />);

    const button = screen.getByRole('button', { name: /Vai alla correzione/i });
    fireEvent.click(button);

    expect(mockSetScopeAndTab).toHaveBeenCalledTimes(1);
    expect(mockSetScopeAndTab).toHaveBeenCalledWith(NavigationScope.FONDO, 'fondoDipendenti');
  });

  it('navigates to NavigationScope.DASHBOARD when relatedPage is wizard2026Preview', () => {
    const checks: ComplianceCheck[] = [
      {
        id: 'chk_wizard',
        descrizione: 'Controllo Configurazione 2026',
        isCompliant: false,
        gravita: 'error',
        messaggio: 'Errore limite 0,22% MS 2021',
        riferimentoNormativo: 'Art. 58 c. 2',
        relatedPage: 'wizard2026Preview',
      },
    ];

    mockState = {
      complianceChecks: checks,
      isLoading: false,
    };

    render(<CompliancePage />);

    const button = screen.getByRole('button', { name: /Vai alla correzione/i });
    fireEvent.click(button);

    expect(mockSetScopeAndTab).toHaveBeenCalledTimes(1);
    expect(mockSetScopeAndTab).toHaveBeenCalledWith(NavigationScope.DASHBOARD, 'wizard2026Preview');
  });

  it('does not crash or call setScopeAndTab when relatedPage is an invalid/missing module', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const checks: ComplianceCheck[] = [
      {
        id: 'chk_invalid',
        descrizione: 'Controllo Modulo Inesistente',
        isCompliant: false,
        gravita: 'warning',
        messaggio: 'Target non valido',
        riferimentoNormativo: 'N/A',
        relatedPage: 'missingModule',
      },
    ];

    mockState = {
      complianceChecks: checks,
      isLoading: false,
    };

    render(<CompliancePage />);

    const button = screen.getByRole('button', { name: /Vai alla correzione/i });
    fireEvent.click(button);

    expect(mockSetScopeAndTab).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Modulo relatedPage non trovato nel registry: missingModule')
    );

    warnSpy.mockRestore();
  });

  it('in CLOSED mantiene visibile il problema ma non offre la navigazione alla correzione', () => {
    const checks: ComplianceCheck[] = [
      {
        id: 'chk_closed',
        descrizione: 'Controllo annualità chiusa',
        isCompliant: false,
        gravita: 'error',
        valoreAttuale: 120,
        limite: 100,
        messaggio: 'Il valore supera il limite consentito',
        riferimentoNormativo: 'Art. 23, comma 2',
        relatedPage: 'fondoDipendenti',
      },
    ];

    mockState = {
      complianceChecks: checks,
      isLoading: false,
      fundData: { metadata: { snapshotStatus: 'CLOSED' } },
    };

    render(<CompliancePage />);

    expect(screen.getByText('Controllo annualità chiusa')).toBeInTheDocument();
    expect(screen.getByText('Il valore supera il limite consentito')).toBeInTheDocument();
    expect(screen.getByText(/Art\. 23, comma 2/i)).toBeInTheDocument();
    expect(screen.getByText(/Valore: 120 \(Limite: 100\)/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Vai alla correzione/i })).not.toBeInTheDocument();
    expect(screen.getByText(/Correzione non disponibile per l’annualità chiusa/i)).toBeInTheDocument();
    expect(mockSetScopeAndTab).not.toHaveBeenCalled();
  });
});
