import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { DistribuzioneRisorsePage } from '../DistribuzioneRisorsePage';
import { deriveCanonicalFundResult } from '../../logic/calculation/canonicalFundLedger';
import type { CanonicalFundResult } from '../../domain';
import { formatCurrency } from '../../utils/formatters';
import normative from '../../../public/normativa.json';

const boundary = vi.hoisted(() => ({ state: {} as Record<string, unknown>, dispatch: vi.fn(), saveState: vi.fn() }));
vi.mock('../../contexts/AppContext.tsx', () => ({ useAppContext: () => boundary }));
vi.mock('../../hooks/useNormativeData.ts', () => ({ useNormativeData: () => ({ data: normative }) }));

const canonical = (amount: number) => deriveCanonicalFundResult([{
  id: 'BASE', amount, status: 'VALID', component: 'STABLE', operation: 'ADDITION',
  competenceYear: 2025, source: 'MANUAL', art23Treatment: 'EXCLUDED',
}]);
function setup(canonicalFund: CanonicalFundResult | undefined, legacy = 99999) {
  boundary.state = { calculationResult: { canonicalFund, fondi: { dipendente: { summary: { totaleFondo: legacy } } } },
    fundData: { annualData: { annoRiferimento: 2025, ccnl2024: { personaleInServizio01012026: 10 } },
      distribuzioneRisorseData: { u_indennitaComparto: 1000, p_specificheResponsabilita: { stanziate: 500 },
        criteri_percPerfIndividuale: 50 }, personaleServizio: { dettagli: [] },
      fondoElevateQualificazioniData: {}, metadata: { snapshotStatus: 'OPEN' } } };
}
const card = (label: string) => screen.getByText(label, { exact: true }).closest('div')!;
beforeEach(() => { boundary.dispatch.mockClear(); boundary.saveState.mockClear(); });
afterEach(cleanup);

describe('Distribution page uses qualified canonical budgets and preserves allocation workflow', () => {
  it('VALID uses 10000, residual 8500, and canonical performance proposal despite legacy 99999', () => {
    setup(canonical(10000));
    render(<DistribuzioneRisorsePage />);
    expect(card('Totale da Distribuire')).toHaveTextContent(formatCurrency(10000));
    expect(card('Disponibile Contrattazione')).toHaveTextContent(formatCurrency(9000));
    expect(card('Rimanenza')).toHaveTextContent(formatCurrency(8500));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByTestId('distribution-proposal')).toHaveTextContent(formatCurrency(4250));
    expect(boundary.dispatch).not.toHaveBeenCalled();
  });
  it('canonical zero beats legacy 900 even in the UI and over-allocation comparison', () => {
    setup(canonical(0), 900);
    render(<DistribuzioneRisorsePage />);
    expect(card('Totale da Distribuire')).toHaveTextContent(formatCurrency(0));
    expect(card('Rimanenza')).toHaveTextContent(formatCurrency(-1500));
    expect(card('Totale da Distribuire')).not.toHaveTextContent(formatCurrency(900));
  });
  it('UNDETERMINED 3400 is only a draft simulation: final budget null and residual draft 1900', () => {
    setup({ ...canonical(3400), status: 'UNDETERMINED', total: null }, 8888);
    render(<DistribuzioneRisorsePage />);
    expect(card('Totale da Distribuire')).toHaveTextContent('Non determinato');
    expect(card('Totale da Distribuire')).not.toHaveTextContent(formatCurrency(3400));
    expect(screen.getByRole('status')).toHaveTextContent(`Subtotale verificato: ${formatCurrency(3400)}`);
    expect(screen.getByRole('status')).toHaveTextContent('Base di simulazione BOZZA');
    expect(card('Disponibile Contrattazione (bozza)')).toHaveTextContent(formatCurrency(2400));
    expect(card('Rimanenza (bozza)')).toHaveTextContent(formatCurrency(1900));
    expect(screen.getByText('Budget Base Performance (calcolato) (bozza)')).toBeInTheDocument();
    expect(screen.getByTestId('distribution-proposal')).toHaveTextContent(formatCurrency(950));
    expect(boundary.dispatch).not.toHaveBeenCalled();
  });
  it('INVALID cannot render a numeric authoritative total even if canonical.total is numeric', () => {
    setup({ ...canonical(3400), status: 'INVALID', total: 10000 });
    render(<DistribuzioneRisorsePage />);
    expect(card('Totale da Distribuire')).toHaveTextContent('Non determinato');
    expect(screen.getByRole('status')).toHaveTextContent('INVALID');
    expect(card('Rimanenza (bozza)')).toHaveTextContent(formatCurrency(1900));
  });
  it('missing canonical shows unknown budgets and skips all budget-driven automatic mutations', () => {
    setup(undefined);
    render(<DistribuzioneRisorsePage />);
    expect(card('Totale da Distribuire')).toHaveTextContent('Non determinato');
    expect(card('Disponibile Contrattazione (bozza)')).toHaveTextContent('Non determinato');
    expect(card('Rimanenza (bozza)')).toHaveTextContent('Non determinato');
    expect(screen.getByRole('status')).toHaveTextContent('Base canonica assente');
    expect(boundary.dispatch).not.toHaveBeenCalled();
  });
  it('changing legacy only cannot alter rendering or dispatch; poison getter is never read', () => {
    const value = canonical(10000);
    setup(value);
    const { container, rerender } = render(<DistribuzioneRisorsePage />);
    const originalText = container.textContent;
    boundary.dispatch.mockClear();
    setup(value, 1);
    const result = boundary.state.calculationResult as Record<string, unknown>;
    Object.defineProperty(result, 'fondi', { get() { throw new Error('Forbidden legacy FAD read'); } });
    rerender(<DistribuzioneRisorsePage />);
    expect(container.textContent).toBe(originalText);
    expect(boundary.dispatch).not.toHaveBeenCalled();
  });
  it('losing the canonical input does not overwrite existing allocations with fabricated zero budgets', () => {
    setup(canonical(10000));
    const { rerender } = render(<DistribuzioneRisorsePage />);
    boundary.dispatch.mockClear();
    setup(undefined);
    rerender(<DistribuzioneRisorsePage />);
    expect(card('Totale da Distribuire')).toHaveTextContent('Non determinato');
    expect(boundary.dispatch).not.toHaveBeenCalled();
  });
});
