import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HomePage } from '../HomePage';
import { NavigationScope } from '../../domain';

const mockSetScopeAndTab = vi.fn();
let mockState: any;

vi.mock('../../contexts/AppContext', () => ({
  useAppContext: () => ({
    state: mockState,
    setScopeAndTab: mockSetScopeAndTab,
    performLocalCalculation: vi.fn(),
  }),
}));

vi.mock('../../logic/index.ts', () => ({
  validateFundData: () => ({
    'fundData.annualData.denominazioneEnte': "La denominazione dell'ente è obbligatoria.",
  }),
}));

vi.mock('../../components/dashboard/FundAllocationChart', () => ({
  FundAllocationChart: () => <div data-testid="fund-allocation-chart" />,
}));
vi.mock('../../components/dashboard/ContractedResourcesChart', () => ({
  ContractedResourcesChart: () => <div data-testid="contracted-resources-chart" />,
}));
vi.mock('../../components/dashboard/ComplianceStatusWidget', () => ({
  ComplianceStatusWidget: () => <div data-testid="compliance-status-widget" />,
}));

describe('HomePage navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('navigates to NavigationScope.DASHBOARD and wizard2026Preview when clicking Apri Configurazione Fondo 2026', () => {
    mockState = {
      isLoading: false,
      error: null,
      currentUser: { id: 'u1', role: 'USER' },
      currentEntity: { id: 'e1', name: 'Comune Test' },
      currentYear: 2026,
      complianceChecks: [],
      calculationResult: null,
      fundData: {
        annualData: {
          annoRiferimento: 2026,
          denominazioneEnte: '',
        },
        historicalData: {},
        fondoAccessorioDipendenteData: {},
        fondoElevateQualificazioniData: {},
        fondoSegretarioComunaleData: {},
        fondoDirigenzaData: {},
        distribuzioneRisorseData: {},
      },
    };

    render(<HomePage />);

    const button = screen.getByRole('button', { name: /Apri Configurazione Fondo 2026/i });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);

    expect(mockSetScopeAndTab).toHaveBeenCalledTimes(1);
    expect(mockSetScopeAndTab).toHaveBeenCalledWith(NavigationScope.DASHBOARD, 'wizard2026Preview');
  });
});
