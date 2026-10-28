import { fixtureRow, fixtureBaseline, confirmedFixtureWrite, confirmedFixtureClosure, FIXTURE_VERSION } from '../../test/fixtures/b1Persistence';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppProvider, useAppContext } from '../AppContext';
import { EntityYearManagementPage } from '../../pages/EntityYearManagementPage';
import { closeYearAndPrepareNext } from '../../application/yearClosureWorkflow';
import { calculateFundCompletely } from '../../logic/calculation/fundEngine';
import { normalizeInput } from '../../application/input/inputNormalizer';
import { deriveCanonicalFundResult } from '../../logic/calculation/canonicalFundLedger';
import { AnnualSnapshotStatus, UserRole } from '../../domain';
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
  competenceYear: 2026, source: 'MANUAL', art23Treatment: 'EXCLUDED',
}]);
const createFund = (snapshotStatus = AnnualSnapshotStatus.OPEN): FundData => ({
  historicalData: { ...INITIAL_HISTORICAL_DATA, manualPersonalFundLimit2016: 100000,
    fondoPersonaleNonDirEQ2018_Art23: 10000 },
  annualData: { ...INITIAL_ANNUAL_DATA, annoRiferimento: 2026, art33ManualDecision: 'DO_NOT_APPLY',
    ccnl2024: { monteSalari2021: 0, personaleInServizio01012026: 0, valoreTabellaCCol3: 0 },
    isArt23FteManualMode: true, manualDipendentiEquivalenti2018: 10,
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
  snapshots.set(2026, fundData);
  const view = render(<AppProvider><Probe />{page && <EntityYearManagementPage />}</AppProvider>);
  await waitFor(() => expect(context.state.normativeData).toBeDefined());
  act(() => context.dispatch({ type: 'LOAD_STATE_FROM_DB', payload: {
    currentYear: 2026, currentEntity: entity, entities: [entity], fundData,
    snapshotBaseline: fixtureBaseline(boundary.user, entity, 2026, fundData, { role: UserRole.GUEST, b1i4_version: versions.get(2026) || FIXTURE_VERSION }),
  } }));
  if (canonicalFund) {
    const requestContext = { entityId: entity.id, year: 2026,
      contextEpoch: context.state.calculationRuntime!.contextEpoch, requestId: 1 };
    const realResult = calculateFundCompletely(normalizeInput(fundData), normativa);
    act(() => {
      context.dispatch({ type: 'CALCULATE_FUND_START', payload: { requestContext } });
      context.dispatch({ type: 'CALCULATE_FUND_SUCCESS', payload: {
        requestContext, result: { ...realResult, canonicalFund }, checks,
      } });
    });
  }
  if (page) await screen.findByTestId('badge-active-year-2026');
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
  boundary.entityUpdate.mockResolvedValue({ error: null });
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

function expectNoOldWrites() {
  expect(boundary.upsert.mock.calls.filter(([row]) => row.current_year === 2026)).toEqual([]);
  expect(boundary.create.mock.calls.filter(([row]) => row.current_year === 2026)).toEqual([]);
  expect(boundary.delete).not.toHaveBeenCalled();
}
async function closeThenNavigate() {
  // Deliberately retain the functions from the render in which the year was OPEN.
  const close = context.closeCurrentYear;
  const navigate = context.switchYearAfterClosure;
  await act(async () => {
    expect((await close()).success).toBe(true);
    expect(await navigate()).toBe(true);
  });
  await waitFor(() => expect(context.state.currentYear).toBe(2027));
}

describe('Post-close navigation: real AppProvider, reducer, closure workflow and page', () => {
  it('the 2026 fixture is READY in the unmodified readiness and economic engine', async () => {
    await mount();
    expect(context.closureReadiness).toMatchObject({ status: 'READY' });
  });
  it('N1 normal dirty OPEN switch preserves save-before-load', async () => {
    await mount();
    snapshots.set(2027, createFund());
    act(() => context.dispatch({ type: 'UPDATE_FONDO_ACCESSORIO_DIPENDENTE_DATA', payload: {
      st_art79c1_art67c1_unicoImporto2017: 12000,
    } }));
    await act(async () => { expect(await context.switchYearAtomic(2027)).toBe(true); });
    const saves = boundary.upsert.mock.calls.filter(([row]) => row.current_year === 2026);
    expect(saves.length).toBeGreaterThan(0);
    expect(saves[0][0].fund_data.fondoAccessorioDipendenteData.st_art79c1_art67c1_unicoImporto2017).toBe(12000);
    const loadIndex = boundary.getState.mock.calls.findIndex(([, , year]) => year === 2027);
    expect(boundary.upsert.mock.invocationCallOrder[0]).toBeLessThan(boundary.getState.mock.invocationCallOrder[loadIndex]);
    expect(context.state.currentYear).toBe(2027);
  });

  it('no successful closure receipt means no special navigation and no writes', async () => {
    await mount();
    await act(async () => { expect(await context.switchYearAfterClosure()).toBe(false); });
    expect(boundary.getState).not.toHaveBeenCalled();
    expectNoWrites();
    expect(context.state.currentYear).toBe(2026);
  });

  it('N2/N3 READY click uses the stale OPEN callback safely and hydrates fresh N+1', async () => {
    await mount({ page: true });
    // Existing target data must survive the transaction and then come from repository read.
    const next = createFund();
    next.annualData.annoRiferimento = 2027;
    next.distribuzioneRisorseData.p_performanceIndividuale = { stanziate: 456, risparmi: 12 };
    snapshots.set(2027, next);
    fireEvent.click(screen.getByTestId('close-year-button'));
    await screen.findByTestId('badge-active-year-2027');
    expect(screen.getByTestId('status-badge-2026-closed')).toBeInTheDocument();
    expect(screen.getByTestId('status-badge-2027-open')).toBeInTheDocument();
    expect(context.state.currentYear).toBe(2027);
    expect(context.state.currentEntity?.id).toBe(entity.id);
    expect(context.state.hydratedSnapshotKey).toBe(`${entity.id}:2027`);
    expect(context.state.fundData.annualData.annoRiferimento).toBe(2027);
    expect(context.state.fundData.distribuzioneRisorseData.p_performanceIndividuale?.stanziate).toBe(456);
    expect(context.state.fundData.metadata.snapshotStatus).toBe(AnnualSnapshotStatus.OPEN);
    expect(context.state.lastYearSwitchError).toBeUndefined();
    expect(snapshots.get(2026)?.metadata.snapshotStatus).toBe(AnnualSnapshotStatus.CLOSED);
    expect(boundary.atomic).toHaveBeenCalledTimes(1);
    expectNoOldWrites();
    await waitFor(() => expect(context.state.calculationResult).toBeDefined());
    const calculated = calculateFundCompletely(normalizeInput(context.state.fundData), normativa);
    expect(context.state.calculationResult?.canonicalFund).toEqual(calculated.canonicalFund);
    expect(context.state.complianceChecks).toEqual(calculated.compliance.checks);
  });

  it('N4 RPC failure does not navigate and preserves rollback/retry', async () => {
    await mount({ page: true });
    boundary.atomic.mockResolvedValueOnce({ data: null, error: { message: 'Atomic failure' } });
    fireEvent.click(screen.getByTestId('close-year-button'));
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Errore durante la chiusura')));
    expect(context.state.currentYear).toBe(2026);
    expect(context.state.fundData.metadata.snapshotStatus).toBe(AnnualSnapshotStatus.OPEN);
    expect(snapshots.has(2027)).toBe(false);
    expect(screen.queryByTestId('post-close-navigation')).not.toBeInTheDocument();
    expectNoOldWrites();
    await act(async () => { expect((await context.closeCurrentYear()).success).toBe(false); });
    expect(boundary.atomic).toHaveBeenCalledTimes(1);
    await act(async () => { await context.reviewCurrentSnapshot(); });
    await act(async () => { await context.acceptReviewedSnapshot(); });
    expect(context.persistence.blocked).toBe(false);
    await act(async () => { await context.performLocalCalculation(); });
    expect(context.closureReadiness.status).toBe('READY');
    fireEvent.click(screen.getByTestId('close-year-button'));
    await screen.findByTestId('badge-active-year-2027');
    expect(boundary.atomic).toHaveBeenCalledTimes(2);
  });

  it.each(['READ_ERROR', 'REJECTED_READ'] as const)('N5/N6 %s after success has independent navigation retry', async mode => {
    await mount({ page: true });
    const original = boundary.getState.getMockImplementation()!;
    let fail = true;
    boundary.getState.mockImplementation(async (...args: unknown[]) => {
      if (args[2] === 2027 && snapshots.get(2026)?.metadata.snapshotStatus === 'CLOSED' && fail) {
        fail = false;
        if (mode === 'REJECTED_READ') throw new Error('Read failed');
        return { data: null, error: { message: 'Read failed' } };
      }
      return original(...args);
    });
    fireEvent.click(screen.getByTestId('close-year-button'));
    const warning = await screen.findByTestId('post-close-navigation');
    expect(warning).toHaveTextContent('è chiuso');
    expect(warning).toHaveTextContent('senza ripetere la chiusura');
    expect(context.state.currentYear).toBe(2026);
    expect(context.state.fundData.metadata.snapshotStatus).toBe(AnnualSnapshotStatus.CLOSED);
    expect(context.state.lastYearSwitchError).toContain('Read failed');
    expect(boundary.entityUpdate).not.toHaveBeenCalled();
    expect(snapshots.has(2027)).toBe(true);
    expect(boundary.atomic).toHaveBeenCalledTimes(1);
    expectNoOldWrites();
    fireEvent.click(screen.getByRole('button', { name: "Apri l'anno 2027" }));
    await screen.findByTestId('badge-active-year-2027');
    expect(screen.queryByTestId('post-close-navigation')).not.toBeInTheDocument();
    expect(context.state.lastYearSwitchError).toBeUndefined();
    expect(closeYearAndPrepareNext).toHaveBeenCalledTimes(1);
    expect(boundary.atomic).toHaveBeenCalledTimes(1);
    expectNoOldWrites();
  });

  it('N7 ALREADY_CLOSED denies reclosure; ordinary read-only navigation reaches existing N+1', async () => {
    await mount({ closed: true, canonicalFund: null });
    snapshots.set(2027, createFund());
    const closed = structuredClone(snapshots.get(2026));
    await act(async () => { expect((await context.closeCurrentYear()).success).toBe(false); });
    expect(snapshots.get(2026)).toEqual(closed);
    // Explicit review acknowledges the denial before ordinary navigation.
    await act(async () => { await context.reviewCurrentSnapshot(); });
    await act(async () => { await context.acceptReviewedSnapshot(); });
    await act(async () => { expect(await context.switchYearAtomic(2027)).toBe(true); });
    expect(context.state.currentYear).toBe(2027);
    expect(boundary.atomic).not.toHaveBeenCalled();
    expectNoOldWrites();
  });

  it('N8 historical CLOSED-without-N+1 is denied without automatic creation', async () => {
    await mount({ closed: true, canonicalFund: null });
    await act(async () => { expect((await context.closeCurrentYear()).success).toBe(false); });
    expect(context.state.currentYear).toBe(2026);
    expect(context.state.fundData.metadata.snapshotStatus).toBe(AnnualSnapshotStatus.CLOSED);
    expect(boundary.atomic).not.toHaveBeenCalled();
    expect(snapshots.has(2027)).toBe(false);
    expectNoOldWrites();
  });

  it('N9 stale save/autosave callbacks are denied synchronously before another render', async () => {
    await mount();
    act(() => context.dispatch({ type: 'UPDATE_FONDO_ACCESSORIO_DIPENDENTE_DATA', payload: {
      st_art79c1_art67c1_unicoImporto2017: 11000,
    } }));
    const staleSave = context.saveState;
    const openDraft = context.state.fundData;
    const staleClose = context.closeCurrentYear;
    let writesAtClosure = 0;
    await act(async () => {
      expect((await staleClose()).success).toBe(true);
      writesAtClosure = boundary.upsert.mock.calls.length;
      expect(writesAtClosure).toBe(1);
      expect(boundary.upsert.mock.invocationCallOrder[0]).toBeLessThan(boundary.atomic.mock.invocationCallOrder[0]);
      expect(await staleSave(openDraft, undefined, 2026, entity)).toMatchObject({ success: false, reason: 'STATE_PERSISTENCE_ERROR' });
      window.dispatchEvent(new Event('beforeunload'));
    });
    await new Promise(resolve => setTimeout(resolve, 2100));
    expect(boundary.upsert).toHaveBeenCalledTimes(writesAtClosure);
    expect(boundary.upsert.mock.calls[0][0].fund_data.fondoAccessorioDipendenteData.st_art79c1_art67c1_unicoImporto2017).toBe(11000);
    expect(boundary.create).not.toHaveBeenCalled();
    expect(boundary.delete).not.toHaveBeenCalled();
    expect(context.state.currentYear).toBe(2026);
    expect(context.state.fundData.metadata.snapshotStatus).toBe(AnnualSnapshotStatus.CLOSED);
  });

  it('N10 two sequential closes from the OPEN render have one effective transition and one N+1', async () => {
    await mount();
    const close = context.closeCurrentYear;
    const navigate = context.switchYearAfterClosure;
    await act(async () => {
      expect((await close()).success).toBe(true);
      expect((await close()).success).toBe(false);
      expect(await navigate()).toBe(false);
    });
    await act(async () => { await context.reviewCurrentSnapshot(); });
    await act(async () => { await context.acceptReviewedSnapshot(); });
    await act(async () => { expect(await context.switchYearAfterClosure()).toBe(true); });
    expect(boundary.atomic).toHaveBeenCalledTimes(1);
    expect([...snapshots.keys()].sort()).toEqual([2026, 2027]);
    expect(context.state.currentYear).toBe(2027);
    expectNoOldWrites();
  });

  it('N11 cancel confirmation has no closure, navigation or writes', async () => {
    await mount({ page: true });
    vi.mocked(window.confirm).mockReturnValue(false);
    fireEvent.click(screen.getByTestId('close-year-button'));
    expectNoWrites();
    expect(boundary.getState).not.toHaveBeenCalled();
    expect(context.state.currentYear).toBe(2026);
  });

  it('N12 failed navigation keeps CLOSED immutable and normal manual activation still works', async () => {
    await mount({ page: true });
    const original = boundary.getState.getMockImplementation()!;
    let fail = true;
    boundary.getState.mockImplementation(async (...args: unknown[]) => {
      if (args[2] === 2027 && snapshots.has(2027) && fail) {
        fail = false; return { data: null, error: { message: 'Temporary read error' } };
      }
      return original(...args);
    });
    fireEvent.click(screen.getByTestId('close-year-button'));
    await screen.findByTestId('post-close-navigation');
    const closedFund = context.state.fundData;
    act(() => context.dispatch({ type: 'UPDATE_DISTRIBUZIONE_RISORSE_DATA', payload: {
      p_performanceIndividuale: { stanziate: 999, risparmi: 0 },
    } }));
    expect(context.state.fundData).toBe(closedFund);
    fireEvent.click(screen.getByTestId('activate-year-2027'));
    await screen.findByTestId('badge-active-year-2027');
    expect(context.state.currentYear).toBe(2027);
    expect(boundary.atomic).toHaveBeenCalledTimes(1);
    expectNoOldWrites();
  });

  it('post-close receipt cannot bypass saving an unrelated OPEN year', async () => {
    await mount();
    await closeThenNavigate();
    const reads = boundary.getState.mock.calls.length;
    await act(async () => { expect(await context.switchYearAfterClosure()).toBe(false); });
    expect(context.state.currentYear).toBe(2027);
    expect(boundary.getState.mock.calls).toHaveLength(reads);
  });

  it('a stale ordinary callback also recognizes the transaction-confirmed CLOSED context', async () => {
    await mount();
    const oldSwitch = context.switchYearAtomic;
    const close = context.closeCurrentYear;
    await act(async () => {
      expect((await close()).success).toBe(true);
      expect(await oldSwitch(2027)).toBe(true);
    });
    expect(context.state.currentYear).toBe(2027);
    expectNoOldWrites();
  });

  it('a closure receipt cannot navigate a different entity context', async () => {
    await mount();
    await act(async () => { expect((await context.closeCurrentYear()).success).toBe(true); });
    const navigate = context.switchYearAfterClosure;
    const other = { ...entity, id: 'other-entity' };
    // Model a completed unrelated hydration, not a newly requested async navigation.
    const otherFund = createFund();
    act(() => context.dispatch({ type: 'LOAD_STATE_FROM_DB', payload: {
      currentEntity: other, currentYear: 2026, fundData: otherFund,
      snapshotBaseline: fixtureBaseline(boundary.user, other, 2026, otherFund),
    } }));
    const readCount = boundary.getState.mock.calls.length;
    await act(async () => { expect(await navigate()).toBe(false); });
    expect(boundary.getState.mock.calls).toHaveLength(readCount);
    expect(context.state.currentEntity?.id).toBe(other.id);
    expectNoOldWrites();
  });
});
