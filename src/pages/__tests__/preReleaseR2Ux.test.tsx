import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FondoSegretarioComunalePage } from '../FondoSegretarioComunalePage';
import { FondoDirigenzaPage } from '../FondoDirigenzaPage';
import { FondoAccessorioDipendentePage } from '../FondoAccessorioDipendentePage';
import { FondoElevateQualificazioniPage } from '../FondoElevateQualificazioniPage';
import { ReportsPage } from '../ReportsPage';
import * as constants from '../../constants';
import mockNormativeData from '../../../public/normativa.json';

// Mock icons
vi.mock('lucide-react', () => ({
  Undo2: (props: any) => <span data-testid="icon-Undo2" {...props} />,
  AlertCircle: (props: any) => <span data-testid="icon-AlertCircle" {...props} />,
  CheckCircle2: (props: any) => <span data-testid="icon-CheckCircle2" {...props} />,
  AlertTriangle: (props: any) => <span data-testid="icon-AlertTriangle" {...props} />,
  Info: (props: any) => <span data-testid="icon-Info" {...props} />,
  FileText: (props: any) => <span data-testid="icon-FileText" {...props} />,
  Download: (props: any) => <span data-testid="icon-Download" {...props} />,
  Table: (props: any) => <span data-testid="icon-Table" {...props} />,
  Check: (props: any) => <span data-testid="icon-Check" {...props} />,
  Save: (props: any) => <span data-testid="icon-Save" {...props} />,
}));

vi.mock('../../hooks/useNormativeData', () => ({
  useNormativeData: () => ({
    data: mockNormativeData,
    isLoading: false,
  }),
}));

const mockDispatch = vi.fn();
const mockSaveState = vi.fn().mockResolvedValue(undefined);
const mockPerformLocalCalculation = vi.fn();

const baseMockState: any = {
  isLoading: false,
  error: null,
  currentUser: { id: 'u1', email: 'test@example.com', role: 'ADMIN' },
  currentEntity: { id: 'e1', name: 'Ente Test' },
  currentYear: 2026,
  localSources: {},
  complianceChecks: [],
  calculationResult: {
    totaleRisorseDisponibili: 50000,
    fondoAccessorioDipendente: {
      totaleRisorseDisponibili: 30000,
      sommaRisorseStabili: 20000,
      sommaRisorseVariabili: 10000,
      lim_totaleParzialeRisorseConfrontoTetto2016_calculated: 25000,
      totaleRisorseEscluseDalLimite: 5000,
    },
    fondoElevateQualificazioni: {
      totaleRisorseEQ: 10000,
    },
    fondoSegretarioComunale: {
      totaleRisorseDisponibili: 5000,
    },
    fondoDirigenza: {
      totaleRisorseDisponibili: 5000,
    },
  },
  fundData: {
    annualData: {
      annoRiferimento: 2026,
      denominazioneEnte: 'Ente Test',
      hasDirigenza: true,
      documentMetadata: {
        numeroDetermina: '123',
        dataDetermina: '2026-03-01',
      },
    },
    historicalData: {
      fondoSalarioAccessorioPersonaleNonDirEQ2016: 100000,
    },
    fondoAccessorioDipendenteData: {},
    fondoElevateQualificazioniData: {},
    fondoSegretarioComunaleData: {},
    fondoDirigenzaData: {},
    distribuzioneRisorseData: {},
    personaleServizio: { dettagli: [] },
  },
};

vi.mock('../../contexts/AppContext', () => ({
  useAppContext: () => ({
    state: baseMockState,
    dispatch: mockDispatch,
    saveState: mockSaveState,
    performLocalCalculation: mockPerformLocalCalculation,
    setScopeAndTab: vi.fn(),
  }),
}));

describe('PR R2 Visual & UX Improvements', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('REL-005: Card Initial Expansion in Segretario and Dirigenza', () => {
    it('renders RISORSE STABILI expanded by default in FondoSegretarioComunalePage, other cards collapsed', () => {
      render(<FondoSegretarioComunalePage />);

      const stabiliButton = screen.getByRole('button', { name: /RISORSE STABILI/i });
      expect(stabiliButton).toHaveAttribute('aria-expanded', 'true');

      const variabiliButton = screen.getByRole('button', { name: /RISORSE VARIABILI/i });
      expect(variabiliButton).toHaveAttribute('aria-expanded', 'false');

      const riepilogoButton = screen.getByRole('button', { name: /RIEPILOGO E ADEGUAMENTI FINALI/i });
      expect(riepilogoButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('renders RISORSE STABILI expanded by default in FondoDirigenzaPage, other collapsible cards collapsed', () => {
      render(<FondoDirigenzaPage />);

      const stabiliButton = screen.getByRole('button', { name: /RISORSE STABILI/i });
      expect(stabiliButton).toHaveAttribute('aria-expanded', 'true');

      const variabiliButton = screen.getByRole('button', { name: /RISORSE VARIABILI/i });
      expect(variabiliButton).toHaveAttribute('aria-expanded', 'false');

      const limitiButton = screen.getByRole('button', { name: /CALCOLO DEL RISPETTO DEI LIMITI/i });
      expect(limitiButton).toHaveAttribute('aria-expanded', 'false');

      const altreButton = screen.getByRole('button', { name: /ALTRE RISORSE E DECURTAZIONI FINALI/i });
      expect(altreButton).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('REL-006: Normative References Update (CCNL Area Funzioni Locali 23.02.2026)', () => {
    it('ensures all 7 constants in constants.ts refer to CCNL Area Funzioni Locali 23.02.2026', () => {
      expect(constants.RIF_CCNL_DIR_2022_2024_ART24C1).toBe('Art. 24, c.1, CCNL Area Funzioni Locali 23.02.2026');
      expect(constants.RIF_CCNL_DIR_2022_2024_ART24C2).toBe('Art. 24, c.2, CCNL Area Funzioni Locali 23.02.2026');
      expect(constants.RIF_CCNL_DIR_2022_2024_ART24C3).toBe('Art. 24, c.3, CCNL Area Funzioni Locali 23.02.2026');
      expect(constants.RIF_CCNL_SEG_2022_2024_ART36).toBe('Art. 36, CCNL Area Funzioni Locali 23.02.2026');
      expect(constants.RIF_CCNL_SEG_2022_2024_ART40C1).toBe('Art. 40, c.1, CCNL Area Funzioni Locali 23.02.2026');
      expect(constants.RIF_CCNL_SEG_2022_2024_ART40C2).toBe('Art. 40, c.2, CCNL Area Funzioni Locali 23.02.2026');
      expect(constants.RIF_CCNL_SEG_2022_2024_ART39).toBe('Art. 39, CCNL Area Funzioni Locali 23.02.2026');
    });

    it('ensures FondoDirigenzaPage displays updated Dich. Congiunta n. 1 reference without Ipotesi 11/11/2025', () => {
      render(<FondoDirigenzaPage />);
      expect(screen.queryByText(/Ipotesi 11\/11\/2025/i)).toBeNull();

      // Expand RISORSE VARIABILI to view the items
      const variabiliButton = screen.getByRole('button', { name: /RISORSE VARIABILI/i });
      fireEvent.click(variabiliButton);

      const elements = screen.getAllByText(/Dich\. Congiunta n\. 1, CCNL Area Funzioni Locali 23\.02\.2026/i);
      expect(elements.length).toBeGreaterThanOrEqual(2);
      expect(screen.queryByText(/Ipotesi 11\/11\/2025/i)).toBeNull();
    });
  });

  describe('REL-007: Fondo Dirigenza Typos Fix', () => {
    it('verifies that typos "dello 2,01%" and "accessorioe" are resolved in FondoDirigenzaPage', () => {
      const { container } = render(<FondoDirigenzaPage />);
      // Expand RISORSE VARIABILI to view all funding items
      const variabiliButton = screen.getByRole('button', { name: /RISORSE VARIABILI/i });
      fireEvent.click(variabiliButton);

      const text = container.textContent || '';
      expect(text).not.toContain('dello 2,01%');
      expect(text).not.toContain('accessorioe');
      expect(text).toContain('del 2,01%');
      expect(text).toContain('salario accessorio e al netto');
    });
  });

  describe('REL-008: ReportsPage Cleanup of Obsolete Bozza Storica Determina Card', () => {
    it('does not display Bozza Storica Determina or Genera Vecchia Determina (TXT)', () => {
      render(<ReportsPage />);
      expect(screen.queryByText('Bozza Storica Determina (Testuale)')).toBeNull();
      expect(screen.queryByText('Genera Vecchia Determina (TXT)')).toBeNull();
      expect(screen.getByText('Esportazione Dati Fondo (XLS)')).toBeInTheDocument();
      expect(screen.getByText('Genera XLS Fondo')).toBeInTheDocument();
    });
  });

  describe('REL-004: Bottom Bar Alignment (md:left-16) and Responsive Padding', () => {
    it('has md:left-16 and responsive hover clearance padding on FondoAccessorioDipendentePage bottom bar', () => {
      const { container } = render(<FondoAccessorioDipendentePage />);
      const bottomBar = container.querySelector('.fixed.bottom-0');
      expect(bottomBar).not.toBeNull();
      expect(bottomBar?.className).toContain('md:left-16');
      expect(bottomBar?.className).not.toContain('md:left-64');

      const inner = bottomBar?.querySelector('div');
      expect(inner?.className).toContain('md:pl-52');
      expect(inner?.className).toContain('xl:pl-24');
      expect(inner?.className).toContain('2xl:pl-0');
    });

    it('has md:left-16 and responsive hover clearance padding on FondoElevateQualificazioniPage bottom bar', () => {
      const { container } = render(<FondoElevateQualificazioniPage />);
      const bottomBar = container.querySelector('.fixed.bottom-0');
      expect(bottomBar).not.toBeNull();
      expect(bottomBar?.className).toContain('md:left-16');
      expect(bottomBar?.className).not.toContain('md:left-64');

      const inner = bottomBar?.querySelector('div');
      expect(inner?.className).toContain('md:pl-52');
      expect(inner?.className).toContain('xl:pl-24');
      expect(inner?.className).toContain('2xl:pl-0');
    });

    it('has md:left-16 and responsive hover clearance padding on FondoSegretarioComunalePage bottom bar', () => {
      const { container } = render(<FondoSegretarioComunalePage />);
      const bottomBar = container.querySelector('.fixed.bottom-0');
      expect(bottomBar).not.toBeNull();
      expect(bottomBar?.className).toContain('md:left-16');
      expect(bottomBar?.className).not.toContain('md:left-64');

      const inner = bottomBar?.querySelector('div');
      expect(inner?.className).toContain('md:pl-52');
      expect(inner?.className).toContain('xl:pl-24');
      expect(inner?.className).toContain('2xl:pl-0');
    });

    it('has md:left-16 and responsive hover clearance padding on FondoDirigenzaPage bottom bar', () => {
      const { container } = render(<FondoDirigenzaPage />);
      const bottomBar = container.querySelector('.fixed.bottom-0');
      expect(bottomBar).not.toBeNull();
      expect(bottomBar?.className).toContain('md:left-16');
      expect(bottomBar?.className).not.toContain('md:left-64');

      const inner = bottomBar?.querySelector('div');
      expect(inner?.className).toContain('md:pl-52');
      expect(inner?.className).toContain('xl:pl-24');
      expect(inner?.className).toContain('2xl:pl-0');
    });
  });
});
