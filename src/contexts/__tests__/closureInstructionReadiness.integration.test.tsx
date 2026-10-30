import { fixtureRow, fixtureBaseline, confirmedFixtureWrite, confirmedFixtureClosure, FIXTURE_VERSION } from '../../test/fixtures/b1Persistence';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppProvider, useAppContext } from '../AppContext';
import { EntityYearManagementPage } from '../../pages/EntityYearManagementPage';
import { closeYearAndPrepareNext } from '../../application/yearClosureWorkflow';
import { calculateFundCompletely } from '../../logic/calculation/fundEngine';
import { normalizeInput } from '../../application/input/inputNormalizer';
import { deriveCanonicalFundResult } from '../../logic/calculation/canonicalFundLedger';
import { AnnualSnapshotStatus, NavigationScope, UserRole } from '../../domain';
import type { CanonicalFundResult, ComplianceCheck, FundData } from '../../domain';
import { INITIAL_ANNUAL_DATA, INITIAL_HISTORICAL_DATA, INITIAL_DISTRIBUZIONE_RISORSE_DATA,
  INITIAL_FONDO_ACCESSORIO_DIPENDENTE_DATA, INITIAL_FONDO_ELEVATE_QUALIFICAZIONI_DATA,
  INITIAL_FONDO_SEGRETARIO_COMUNALE_DATA, INITIAL_FONDO_DIRIGENZA_DATA } from '../../test/fixtures/legacyDemoFund';
import normativa from '../../../public/normativa.json';

const boundary = vi.hoisted(() => ({
  getState: vi.fn(), years: vi.fn(), atomic: vi.fn(), upsert: vi.fn(), create: vi.fn(),
  delete: vi.fn(), entityUpdate: vi.fn(), queryYears: vi.fn(),
  user: { id: 'closure-local', email: 'closure@example.invalid' },
}));
vi.mock('../AuthContext.tsx', () => ({ useAuth: () => ({ user: boundary.user }) }));
vi.mock('../../hooks/useNormativeData.ts', () => ({ useNormativeData: () => ({ data: normativa }) }));
vi.mock('../../infrastructure/persistence/SupabaseStateRepository', () => ({
  SupabaseStateRepository: class {
    getState(...args: unknown[]) { return boundary.getState(...args); }
    getAvailableYears(...args: unknown[]) { return boundary.years(...args); }
    closeYearAtomic(...args: unknown[]) { return boundary.atomic(...args); }
    upsertState(...args: unknown[]) { return boundary.upsert(...args); }
    createState(...args: unknown[]) { return boundary.create(...args); }
    deleteState(...args: unknown[]) { return boundary.delete(...args); }
  },
}));
vi.mock('../../infrastructure/persistence/SupabaseEntityRepository', () => ({
  SupabaseEntityRepository: class {
    async getAll() { return { data: [], error: null }; }
    update(...args: unknown[]) { return boundary.entityUpdate(...args); }
  },
}));
vi.mock('../../infrastructure/persistence/SupabaseUserRepository', () => ({
  SupabaseUserRepository: class {
    async getUserRole() { return { data: UserRole.GUEST, error: null }; }
  },
}));
vi.mock('../../services/supabase', () => ({
  supabase: { from: () => ({ select: () => ({ eq: () => ({ order: boundary.queryYears }) }) }) },
}));
// Instrument the real workflow; no transactional behavior is replaced.
vi.mock('../../application/yearClosureWorkflow', async importOriginal => {
  const actual = await importOriginal<typeof import('../../application/yearClosureWorkflow')>();
  return { ...actual, closeYearAndPrepareNext: vi.fn(actual.closeYearAndPrepareNext) };
});

const entity = { id: 'closure-entity', user_id: boundary.user.id, name: 'Comune Closure' };
const canonical = () => deriveCanonicalFundResult([{
  id: 'BASE', amount: 10000, status: 'VALID', component: 'STABLE', operation: 'ADDITION',
  competenceYear: 2025, source: 'MANUAL', art23Treatment: 'EXCLUDED',
}]);
const check = (gravita: 'error' | 'warning'): ComplianceCheck => ({
  id: 'CHECK', descrizione: 'Verifica', messaggio: 'Correggere il dato di base',
  riferimentoNormativo: 'Test', isCompliant: false, gravita, relatedPage: 'fundDetails',
});
const createFund = (snapshotStatus = AnnualSnapshotStatus.OPEN): FundData => ({
  historicalData: { ...INITIAL_HISTORICAL_DATA, manualPersonalFundLimit2016: 100000,
    fondoPersonaleNonDirEQ2018_Art23: 10000 },
  annualData: { ...INITIAL_ANNUAL_DATA, annoRiferimento: 2025, art33ManualDecision: 'DO_NOT_APPLY',
    ccnl2024: { monteSalari2021: 0 }, isArt23FteManualMode: true, manualDipendentiEquivalenti2018: 10,
    manualDipendentiEquivalentiAnnoRif: 10 },
  fondoAccessorioDipendenteData: { ...INITIAL_FONDO_ACCESSORIO_DIPENDENTE_DATA,
    vn_art58_CCNL2026_arretrati2024_2025: undefined,
    vn_art58c2_CCNL2026_incremento022_MS2021: 0,
    st_art79c1_art67c1_unicoImporto2017: 10000 },
  fondoElevateQualificazioniData: { ...INITIAL_FONDO_ELEVATE_QUALIFICAZIONI_DATA },
  fondoDirigenzaData: { ...INITIAL_FONDO_DIRIGENZA_DATA },
  fondoSegretarioComunaleData: { ...INITIAL_FONDO_SEGRETARIO_COMUNALE_DATA },
  distribuzioneRisorseData: { ...INITIAL_DISTRIBUZIONE_RISORSE_DATA },
  personaleServizio: { dettagli: [] }, metadata: { snapshotStatus },
});
let context: ReturnType<typeof useAppContext>;
const snapshots = new Map<number, FundData>();
const versions = new Map<number, string>();
function Probe() { context = useAppContext(); return null; }
async function mount({ canonicalFund = canonical(), checks = [], closed = false, page = false }: {
  canonicalFund?: CanonicalFundResult | null; checks?: ComplianceCheck[]; closed?: boolean; page?: boolean;
} = {}) {
  const fundData = createFund(closed ? AnnualSnapshotStatus.CLOSED : AnnualSnapshotStatus.OPEN);
  snapshots.set(2025, fundData);
  const view = render(<AppProvider><Probe />{page && <EntityYearManagementPage />}</AppProvider>);
  await waitFor(() => expect(context.state.normativeData).toBeDefined());
  act(() => context.dispatch({ type: 'LOAD_STATE_FROM_DB', payload: {
    currentYear: 2025, currentEntity: entity, entities: [entity], fundData,
    snapshotBaseline: fixtureBaseline(boundary.user, entity, 2025, fundData, { role: UserRole.GUEST, b1i4_version: versions.get(2025) || FIXTURE_VERSION }),
  } }));
  if (canonicalFund) {
    const requestContext = { entityId: entity.id, year: 2025,
      contextEpoch: context.state.calculationRuntime!.contextEpoch, requestId: 1 };
    const realResult = calculateFundCompletely(normalizeInput(fundData), normativa);
    act(() => {
      context.dispatch({ type: 'CALCULATE_FUND_START', payload: { requestContext } });
      context.dispatch({ type: 'CALCULATE_FUND_SUCCESS', payload: {
        requestContext, result: { ...realResult, canonicalFund }, checks,
      } });
    });
  }
  if (page) await screen.findByTestId('badge-active-year-2025');
  vi.mocked(closeYearAndPrepareNext).mockClear();
  for (const spy of [boundary.getState, boundary.atomic, boundary.upsert, boundary.create,
    boundary.delete, boundary.entityUpdate]) spy.mockClear();
  return view;
}
function expectNoWrites() {
  expect(closeYearAndPrepareNext).not.toHaveBeenCalled();
  expect(boundary.atomic).not.toHaveBeenCalled();
  expect(boundary.upsert).not.toHaveBeenCalled();
  expect(boundary.create).not.toHaveBeenCalled();
  expect(boundary.delete).not.toHaveBeenCalled();
  expect(boundary.entityUpdate).not.toHaveBeenCalled();
}
beforeEach(() => {
  vi.clearAllMocks(); snapshots.clear(); versions.clear(); localStorage.clear(); sessionStorage.clear();
  boundary.getState.mockImplementation(async (_userId, _entityId, year: number) => ({
    data: snapshots.has(year) ? fixtureRow(snapshots.get(year), boundary.user, entity, year,
      { role: UserRole.GUEST, b1i4_version: versions.get(year) || FIXTURE_VERSION }) : null,
    error: null,
  }));
  boundary.years.mockImplementation(async () => ({ data: [...snapshots.keys()].map(current_year => ({ current_year })), error: null }));
  boundary.queryYears.mockImplementation(async () => ({ data: [...snapshots].map(([current_year, fund_data]) => ({ current_year, fund_data })), error: null }));
  const write = async (row: any) => {
    const result = confirmedFixtureWrite(row);
    snapshots.set(row.current_year, result.data.fund_data);
    versions.set(row.current_year, result.data.b1i4_version);
    return result;
  };
  boundary.upsert.mockImplementation(write);
  boundary.create.mockImplementation(write);
  boundary.atomic.mockImplementation(async (params: any) => {
    const result = confirmedFixtureClosure(params, boundary.user, entity);
    for (const row of [result.data.currentSnapshot, result.data.nextSnapshot]) {
      snapshots.set(row.current_year, row.fund_data);
      versions.set(row.current_year, row.b1i4_version);
    }
    return result;
  });
  vi.spyOn(window, 'confirm').mockReturnValue(true);
  vi.spyOn(window, 'alert').mockImplementation(() => {});
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe('Closure readiness: real AppProvider handler and existing atomic workflow', () => {
  it('READY fixture is genuinely VALID in the existing engine with no BLOCKING compliance', () => {
    const result = calculateFundCompletely(normalizeInput(createFund()), normativa);
    expect(result.canonicalFund.entries.filter(entry => entry.status !== 'VALID')).toEqual([]);
    expect(result.canonicalFund.missingPrerequisites).toEqual([]);
    expect(result.canonicalFund.status).toBe('VALID');
    expect(result.compliance.checks.filter(issue => issue.gravita === 'error')).toEqual([]);
  });
  it('a stored VALID result cannot freeze a newly unresolved recovery in the current draft', async () => {
    await mount({ page: true });
    expect(context.closureReadiness.status).toBe('READY');
    expect(context.state.calculationResult?.canonicalFund.status).toBe('VALID');
    act(() => context.dispatch({ type: 'UPDATE_FONDO_ACCESSORIO_DIPENDENTE_DATA', payload: {
      vn_art58_CCNL2026_arretrati2024_2025: 2800,
    } }));
    // COR-02: a modified draft must not retain the previous qualified result.
    expect(context.state.calculationResult).toBeUndefined();
    expect(context.closureReadiness.status).toBe('NOT_READY');
    expect(screen.getByTestId('close-year-button')).toBeDisabled();
    const before = context.state;
    expect((await context.closeCurrentYear()).success).toBe(false);
    expect(context.state).toBe(before);
    expectNoWrites();
  });
  it('a stored VALID result cannot freeze a current invalid canonical amount', async () => {
    await mount();
    act(() => context.dispatch({ type: 'UPDATE_FONDO_ACCESSORIO_DIPENDENTE_DATA', payload: {
      st_art79c1_art67c1_unicoImporto2017: -100,
    } }));
    expect(context.closureReadiness.status).toBe('NOT_READY');
    expect((await context.closeCurrentYear()).success).toBe(false);
    expectNoWrites();
  });
  it('a current engine exception fails closed before any loading/closure write', async () => {
    await mount();
    act(() => context.dispatch({ type: 'UPDATE_ANNUAL_DATA', payload: {
      isArt23FteManualMode: false,
      personaleAnnoRifPerArt23: [{ id: 'invalid-fte', partTimePercentage: 100, cedoliniEmessi: 0 }],
    } }));
    expect(context.closureReadiness.status).toBe('NOT_READY');
    const before = context.state;
    expect((await context.closeCurrentYear()).success).toBe(false);
    expect(context.state).toBe(before);
    expectNoWrites();
  });
  it.each(['UNDETERMINED', 'INVALID', 'MISSING', 'BLOCKING', 'MISSING_PREREQUISITE'] as const)
  ('R2/R3/R4/R5/R7/R10 forced %s closure has zero workflow calls, writes or local CLOSED mutation', async mode => {
    const canon = mode === 'MISSING' ? null : {
      ...canonical(), ...(mode === 'UNDETERMINED' || mode === 'INVALID' ? { status: mode, total: null } : {}),
      ...(mode === 'MISSING_PREREQUISITE' ? { missingPrerequisites: ['Completare il dato'] } : {}),
    };
    await mount({ canonicalFund: canon, checks: mode === 'BLOCKING' ? [check('error')] : [] });
    const before = context.state;
    const result = await context.closeCurrentYear();
    expect(result.success).toBe(false);
    expectNoWrites();
    expect(boundary.getState).not.toHaveBeenCalled();
    expect(context.state).toBe(before);
    expect(context.state.fundData.metadata.snapshotStatus).toBe(AnnualSnapshotStatus.OPEN);
    expect(snapshots.has(2026)).toBe(false);
  });
  it('R1/R9 READY, without distribution or document metadata, invokes the original atomic path once', async () => {
    await mount();
    let result;
    await act(async () => { result = await context.closeCurrentYear(); });
    expect(result).toMatchObject({ success: true, closedYear: 2025, nextYear: 2026, carryForward: 0 });
    expect(closeYearAndPrepareNext).toHaveBeenCalledTimes(1);
    expect(boundary.atomic).toHaveBeenCalledTimes(1);
    expect(boundary.upsert).not.toHaveBeenCalled();
    expect(boundary.create).not.toHaveBeenCalled();
    expect(context.state.fundData.metadata.snapshotStatus).toBe(AnnualSnapshotStatus.CLOSED);
    expect(snapshots.get(2026)?.metadata?.snapshotStatus).not.toBe(AnnualSnapshotStatus.CLOSED);
  });
  it('R11 RPC failure leaves OPEN and retry executes the same workflow successfully', async () => {
    await mount();
    const before = context.state.fundData;
    boundary.atomic.mockResolvedValueOnce({ data: null, error: { message: 'Simulated atomic rollback' } });
    let failed;
    await act(async () => { failed = await context.closeCurrentYear(); });
    expect(failed).toMatchObject({ success: false, technicalCause: { message: 'Simulated atomic rollback' } });
    expect(context.state.fundData).toBe(before);
    expect(snapshots.get(2025)?.metadata.snapshotStatus).toBe(AnnualSnapshotStatus.OPEN);
    expect(snapshots.has(2026)).toBe(false);
    // Unknown remote outcome requires explicit review, never an automatic retry.
    await act(async () => { expect((await context.closeCurrentYear()).success).toBe(false); });
    expect(boundary.atomic).toHaveBeenCalledTimes(1);
    await act(async () => { await context.reviewCurrentSnapshot(); });
    await act(async () => { await context.acceptReviewedSnapshot(); });
    expect(context.persistence.blocked).toBe(false);
    await act(async () => { await context.performLocalCalculation(); });
    expect(context.closureReadiness.status).toBe('READY');
    await act(async () => { expect((await context.closeCurrentYear()).success).toBe(true); });
    expect(boundary.atomic).toHaveBeenCalledTimes(2);
    expect(boundary.upsert).not.toHaveBeenCalled();
    expect(boundary.create).not.toHaveBeenCalled();
  });
  it('R12 repeated CLOSED closure is denied with one atomic execution', async () => {
    await mount();
    const originalHandler = context.closeCurrentYear;
    await act(async () => {
      expect((await originalHandler()).success).toBe(true);
      expect((await originalHandler()).success).toBe(false);
    });
    expect(closeYearAndPrepareNext).toHaveBeenCalledTimes(2);
    expect(boundary.atomic).toHaveBeenCalledTimes(1);
  });
  it('R8 programmatic CLOSED retry is denied without another RPC', async () => {
    await mount({ closed: true, canonicalFund: null });
    snapshots.set(2026, createFund());
    await act(async () => { expect((await context.closeCurrentYear()).success).toBe(false); });
    expect(closeYearAndPrepareNext).toHaveBeenCalledTimes(1);
    expect(boundary.atomic).not.toHaveBeenCalled();
    expect(snapshots.get(2025)?.metadata.snapshotStatus).toBe(AnnualSnapshotStatus.CLOSED);
    expect(snapshots.has(2026)).toBe(true);
    expect(boundary.upsert).not.toHaveBeenCalled();
    expect(boundary.create).not.toHaveBeenCalled();
  });
  it('historical CLOSED-without-next-year recovery is denied by the versioned OPEN-only contract', async () => {
    await mount({ closed: true, canonicalFund: null });
    await act(async () => { expect((await context.closeCurrentYear()).success).toBe(false); });
    expect(closeYearAndPrepareNext).toHaveBeenCalledTimes(1);
    expect(boundary.atomic).not.toHaveBeenCalled();
    expect(snapshots.has(2026)).toBe(false);
    expect(snapshots.get(2025)?.metadata.snapshotStatus).toBe(AnnualSnapshotStatus.CLOSED);
    expect(boundary.upsert).not.toHaveBeenCalled();
    expect(boundary.create).not.toHaveBeenCalled();
  });
});

describe('Closure readiness: real EntityYearManagementPage integration', () => {
  it.each(['UNDETERMINED', 'INVALID', 'MISSING', 'BLOCKING'] as const)
  ('%s disables closure, explains the cause and navigates to its corrective action', async mode => {
    await mount({ page: true, canonicalFund: mode === 'MISSING' ? null : {
      ...canonical(), ...(mode === 'UNDETERMINED' || mode === 'INVALID' ? { status: mode, total: null } : {}),
    }, checks: mode === 'BLOCKING' ? [check('error')] : [] });
    const button = screen.getByTestId('close-year-button');
    expect(button).toBeDisabled();
    expect(screen.getByTestId('closure-not-ready')).not.toHaveTextContent('NOT_READY');
    fireEvent.click(button);
    expect(window.confirm).not.toHaveBeenCalled();
    expectNoWrites();
    fireEvent.click(screen.getByRole('button', { name: mode === 'BLOCKING' ? 'Apri le verifiche' : 'Vai alla Costituzione' }));
    await waitFor(() => expect(context.state.activeTab).toBe(mode === 'BLOCKING' ? 'fundDetails' : 'fondoDipendenti'));
    expect(context.state.navigationScope).toBe(NavigationScope.FONDO);
    expectNoWrites();
  });
  it.each([false, true])('READY click, warning-only=%s, calls the actual workflow once', async warning => {
    await mount({ page: true, checks: warning ? [check('warning')] : [] });
    expect(screen.getByTestId('close-year-button')).toBeEnabled();
    fireEvent.click(screen.getByTestId('close-year-button'));
    await waitFor(() => expect(boundary.atomic).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(context.state.currentYear).toBe(2026));
    expect(snapshots.get(2025)?.metadata.snapshotStatus).toBe(AnnualSnapshotStatus.CLOSED);
    expect(snapshots.has(2026)).toBe(true);
    // Post-close navigation now selects N+1; the closed snapshot and readiness contract stay protected.
    await waitFor(() => expect(context.state.isYearSwitching).toBe(false));
    expect(closeYearAndPrepareNext).toHaveBeenCalledTimes(1);
    expect(window.confirm).toHaveBeenCalledTimes(2);
    expect(vi.mocked(window.confirm).mock.calls[1][0]).toContain('Confermi la chiusura');
    expect(boundary.upsert.mock.calls.filter(([row]) => row.current_year === 2025)).toEqual([]);
    expect(boundary.create.mock.calls.filter(([row]) => row.current_year === 2025)).toEqual([]);
  });
  it('CLOSED + BLOCKING hides closure and does not reopen instruction or execute writes', async () => {
    await mount({ page: true, closed: true, checks: [check('error')] });
    expect(screen.queryByTestId('close-year-button')).not.toBeInTheDocument();
    expect(screen.queryByTestId('closure-not-ready')).not.toBeInTheDocument();
    expect(screen.getByTestId('status-badge-2025-closed')).toBeInTheDocument();
    expectNoWrites();
  });
});
