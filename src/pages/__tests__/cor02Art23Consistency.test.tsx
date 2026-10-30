import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
const boundary = vi.hoisted(() => ({ state: undefined as any, dispatch: vi.fn(), saveState: vi.fn(), performLocalCalculation: vi.fn() }));
vi.mock('../../contexts/AppContext', () => ({ useAppContext: () => boundary }));
vi.mock('../../hooks/useNormativeData', () => ({ useNormativeData: () => ({ data: { riferimenti_normativi: {} } }) }));
import { FondoAccessorioDipendentePage } from '../FondoAccessorioDipendentePage';
import { FundDetailsPage } from '../FundDetailsPage';
import { normalizeInput } from '../../application/input/inputNormalizer';
import { calculateFundCompletely } from '../../logic/calculation/fundEngine';
import { cor02Scenarios } from '../../test/fixtures/cor02Art23';
import type { NormativeData } from '../../domain';
afterEach(() => { cleanup(); vi.clearAllMocks(); });
describe('COR-02 engine / Compliance / actual FAD banner / summary agree', () => {
  it.each(cor02Scenarios)('scenario $id: $name', ({ make, status }) => {
    const fundData = make(); const before = JSON.stringify(fundData);
    const calculationResult = calculateFundCompletely(normalizeInput(fundData), { riferimenti_normativi: {} } as NormativeData);
    boundary.state = { fundData, calculationResult, currentYear: 2026, validationErrors: {},
      currentUser: { id: 'cor02-user' }, currentEntity: { id: 'cor02-entity' }, complianceChecks: calculationResult.compliance.checks };
    const view = render(<FondoAccessorioDipendentePage />);
    const banner = screen.getByTestId('art23-verification-banner');
    if (status === 'VALID') expect(banner).toHaveTextContent('Conforme al Limite Art. 23');
    else {
      expect(banner).toHaveTextContent('NON DETERMINABILE');
      expect(banner).not.toHaveTextContent('Conforme al Limite Art. 23');
      expect(banner.className).not.toContain('bg-emerald');
      expect(calculationResult.compliance.checks.find(c => c.id === 'limite_art23_c2')?.isCompliant).toBe(false);
    }
    expect(boundary.dispatch).not.toHaveBeenCalled(); expect(boundary.saveState).not.toHaveBeenCalled();
    view.unmount(); render(<FundDetailsPage />);
    if (status !== 'VALID') {
      expect(screen.getByText(/Verifica Art. 23: NON DETERMINABILE/)).toBeInTheDocument();
      expect(screen.queryByText(/Nessun superamento del limite 2016 rilevato/)).not.toBeInTheDocument();
    }
    expect(JSON.stringify(fundData)).toBe(before);
  });
});
