import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import type { AppState, CalculationResult } from '../../domain';
import { createEmptyFundData } from '../../domain/emptyFund';
import { deriveCanonicalFundResult } from '../../logic/calculation/canonicalFundLedger';
import { getModuleById } from '../../application/registry/moduleRegistry';
import { UserRole, NavigationScope } from '../../domain';
import { formatCurrency } from '../../utils/formatters';
const boundary = vi.hoisted(() => ({ state: {} as AppState, dispatch: vi.fn(), saveState: vi.fn(), setScopeAndTab: vi.fn() }));
vi.mock('../../contexts/AppContext.tsx', () => ({ useAppContext: () => boundary }));
const makeResult = (status: 'VALID' | 'UNDETERMINED' | 'INVALID' = 'VALID'): CalculationResult => ({
  metadata: { annoRiferimento: 2026, timestamp: '2026-10-07' },
  canonicalFund: deriveCanonicalFundResult([{ id: 'CCNL_014_CURRENT', amount: status === 'VALID' ? 1400 : null,
    component: 'STABLE', operation: 'ADDITION', source: 'CALCULATED', status, art23Treatment: 'EXCLUDED', competenceYear: 2026 }]),
  compliance: { checks: [], art23c2: { limite: 100000, valoreSoggetto: 0, delta: -100000, isCompliant: true } },
} as unknown as CalculationResult);
function mount(result?: CalculationResult, closed = false) {
  const data = createEmptyFundData(2026); if (closed) data.metadata = { snapshotStatus: 'CLOSED' };
  boundary.state = { fundData: data, calculationResult: result, currentYear: 2026, complianceChecks: [], isLoading: false,
    currentEntity: { id: 'entity', name: 'Comune', user_id: 'owner' }, currentUser: { id: 'owner', role: UserRole.GUEST } } as unknown as AppState;
  const module = getModuleById('compliance')!; expect(module.scope).toBe(NavigationScope.FONDO);
  return render(<module.component />);
}
describe('UX01 reachable Verifica consultation', () => {
  beforeEach(() => { cleanup(); vi.clearAllMocks(); }); afterEach(cleanup);
  it('real registry exposes all 15 answers and canonical 1400, with missing support explicit', () => {
    mount(makeResult()); expect(document.querySelectorAll('[data-rsu-question]')).toHaveLength(15);
    expect(screen.getByText('Origine degli importi e verifiche RSU')).toBeTruthy();
    expect(document.querySelector('[data-rsu-question="1"]')?.textContent).toContain(formatCurrency(1400));
    expect(screen.getByText(/Atto di costituzione: Dato mancante/)).toBeTruthy();
    fireEvent.click(screen.getByText('Origine di ogni voce e input utilizzati'));
    expect(document.querySelector('[data-provenance-entry="CCNL_014_CURRENT"]')?.textContent).toContain('Calcolato');
    expect(document.querySelector('[data-provenance-entry="CCNL_014_CURRENT"]')?.textContent).toContain('Escluso dal limite');
    expect(boundary.dispatch).not.toHaveBeenCalled(); expect(boundary.saveState).not.toHaveBeenCalled();
  });
  it.each(['UNDETERMINED', 'INVALID'] as const)('no definitive economic escape from %s', status => {
    mount(makeResult(status)); expect(document.querySelector('[data-rsu-question="1"]')?.textContent).not.toContain('€');
    expect(document.querySelector('[data-rsu-question="1"]')?.textContent).toContain(status === 'INVALID' ? 'Dato invalido' : 'Non determinabile');
  });
  it('empty CLOSED is read-only; consultation never persists or invents actor', () => {
    mount(undefined, true); expect(document.querySelectorAll('[data-rsu-question]')).toHaveLength(15);
    expect(screen.getByText('Non disponibile; non dedotto dal proprietario')).toBeTruthy();
    expect(boundary.dispatch).not.toHaveBeenCalled(); expect(boundary.saveState).not.toHaveBeenCalled();
  });
});
