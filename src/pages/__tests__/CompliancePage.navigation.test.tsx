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
});
