import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AppAction } from '../../domain';
const f = vi.hoisted(() => ({
  actor: { id: 'cor01-user', email: 'cor01@fixture.invalid' },
  entities: [{ id: 'cor01-a', user_id: 'cor01-user', name: 'Ente A' }, { id: 'cor01-b', user_id: 'cor01-user', name: 'Ente B' }],
  stateRepo: { getState: vi.fn(), getAvailableYears: vi.fn(), upsertState: vi.fn(), createState: vi.fn(), closeYearAtomic: vi.fn(), deleteState: vi.fn(), getStateVersions: vi.fn() },
  entityRepo: { getAll: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
  userRepo: { getUserRole: vi.fn() }, interaction: { confirm: vi.fn(), alert: vi.fn(), reload: vi.fn() },
  normative: { riferimenti_normativi: {} }, app: undefined as any, closed: false,
}));
vi.mock('../../contexts/AuthContext', () => ({ useAuth: () => ({ user: f.actor }) }));
vi.mock('../../hooks/useNormativeData', () => ({ useNormativeData: () => ({ data: f.normative }) }));
vi.mock('../../infrastructure/persistence/SupabaseStateRepository', () => ({ SupabaseStateRepository: vi.fn(function () { return f.stateRepo; }) }));
vi.mock('../../infrastructure/persistence/SupabaseEntityRepository', () => ({ SupabaseEntityRepository: vi.fn(function () { return f.entityRepo; }) }));
vi.mock('../../infrastructure/persistence/SupabaseUserRepository', () => ({ SupabaseUserRepository: vi.fn(function () { return f.userRepo; }) }));
vi.mock('../../infrastructure/browser/BrowserInteractionService', () => ({ BrowserInteractionService: vi.fn(function () { return f.interaction; }) }));
vi.mock('../../services/supabase', () => ({ supabase: {
  from: () => { throw new Error('COR-01 prohibits live transport'); },
  rpc: () => { throw new Error('COR-01 prohibits live RPC'); }, auth: {},
} }));
vi.mock('../../logic/calculation/fundEngine', async () => {
  const actual = await vi.importActual<typeof import('../../logic/calculation/fundEngine')>('../../logic/calculation/fundEngine');
  return { ...actual, calculateFundCompletely: vi.fn(actual.calculateFundCompletely) };
});
import { calculateFundCompletely } from '../../logic/calculation/fundEngine';
import { buildWizard2026TransferPreview } from '../../features/wizard2026/transfer/transferPreviewEngine';
import { applyWizard2026Transfer } from '../../features/wizard2026/transfer/applyWizard2026Transfer';
import { AppProvider, appReducer, useAppContext } from '../../contexts/AppContext';
import { FondoAccessorioDipendentePage } from '../FondoAccessorioDipendentePage';
import { FondoElevateQualificazioniPage } from '../FondoElevateQualificazioniPage';
import { FondoSegretarioComunalePage } from '../FondoSegretarioComunalePage';
import { cor01Fund, cor01TransferDraft } from '../../test/fixtures/cor01Fund';
const version = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const nextVersion = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
type Page = 'none' | 'fad' | 'eq' | 'seg';
function Harness({ page }: { page: Page }) {
  f.app = useAppContext();
  return page === 'fad' ? <FondoAccessorioDipendentePage /> : page === 'eq' ? <FondoElevateQualificazioniPage /> : page === 'seg' ? <FondoSegretarioComunalePage /> : null;
}
const surface = (page: Page) => <AppProvider><Harness page={page} /></AppProvider>;
async function boot() {
  const view = render(surface('none'));
  await waitFor(() => expect(f.app.state.hydratedSnapshotKey).toBe('cor01-a:2026'));
  return view;
}
async function debounce() { await act(async () => { await vi.advanceTimersByTimeAsync(2500); }); }
beforeEach(() => {
  vi.clearAllMocks(); localStorage.clear(); sessionStorage.clear(); f.closed = false;
  localStorage.setItem('fl_last_context_' + f.actor.id, JSON.stringify({ entityId: 'cor01-a', year: 2026 }));
  f.entityRepo.getAll.mockResolvedValue({ data: f.entities, error: null });
  f.userRepo.getUserRole.mockResolvedValue({ data: 'GUEST', error: null });
  f.stateRepo.getAvailableYears.mockResolvedValue({ data: [2025, 2026, 2027].map(current_year => ({ current_year })), error: null });
  f.stateRepo.getState.mockImplementation(async (_user: unknown, entityId: string, year: number) => ({
    data: { entity_id: entityId, current_year: year, user_id: f.actor.id, email: null, role: 'GUEST',
      fund_data: cor01Fund(year, f.closed, entityId === 'cor01-b' ? 2000 : 0), b1i4_version: version,
      b1i4_expected: null, updated_at: '2026-10-29T00:00:00Z' }, error: null,
  }));
  f.stateRepo.upsertState.mockImplementation(async (data: any) => ({ data: { ...structuredClone(data),
    b1i4_version: nextVersion, b1i4_expected: null, updated_at: '2026-10-29T01:00:00Z' }, error: null }));
  f.interaction.confirm.mockResolvedValue(true);
});
afterEach(() => { cleanup(); vi.useRealTimers(); localStorage.clear(); sessionStorage.clear(); });

describe('COR-01 real pages/provider/engine/autosave with artificial versioned repository', () => {
  it.each(['fad', 'eq', 'seg'] as const)('T1/T3/T5/T6/T7 %s mount, recalculation and unmount do not mutate or save', async page => {
    const view = await boot(); const before = structuredClone(f.app.state.fundData);
    vi.useFakeTimers(); view.rerender(surface(page));
    await debounce(); await act(async () => { await f.app.performLocalCalculation(); }); await debounce();
    expect(f.app.state.fundData).toEqual(before); expect(f.app.persistence.dirty).toBe(false);
    view.rerender(surface('none')); await debounce();
    expect(f.app.state.fundData).toEqual(before); expect(f.stateRepo.upsertState).not.toHaveBeenCalled();
  });
  it('T7 global recalculation invokes the engine and refreshes the economic projection without dirtying or saving inputs', async () => {
    await boot(); vi.useFakeTimers(); await debounce();
    const before = structuredClone(f.app.state.fundData);
    const priorProjection = f.app.state.calculationResult;
    vi.mocked(calculateFundCompletely).mockClear();
    await act(async () => { await f.app.performFundCalculation(); });
    expect(calculateFundCompletely).toHaveBeenCalled();
    expect(f.app.state.calculationResult).not.toBe(priorProjection);
    expect(f.app.state.validationErrors).toEqual({});
    expect(f.app.state.calculationResult?.fondi.dipendente.summary).toMatchObject({ totaleStabile: 8500, totaleVariabile: 200, totaleFondo: 8700 });
    expect(f.app.state.calculationResult?.reductions.totalFadReductions).toBe(1500);
    expect(f.app.state.calculationResult?.canonicalFund.verifiedArt23Subject).toBe(10200);
    await debounce();
    expect(f.app.state.fundData).toEqual(before);
    expect(f.app.persistence.dirty).toBe(false);
    expect(f.stateRepo.upsertState).not.toHaveBeenCalled();
  });
  it('COR-02 edits invalidate stale conformity and permit a fresh read-only calculation', async () => {
    const load = f.stateRepo.getState.getMockImplementation()!;
    f.stateRepo.getState.mockImplementation(async (...args: any[]) => {
      const r: any = await load(...args); r.data.fund_data.annualData.art33ManualDecision = 'DO_NOT_APPLY'; return r;
    });
    await boot(); vi.useFakeTimers(); await debounce();
    await act(async () => { await f.app.performFundCalculation(); });
    expect(f.app.state.calculationResult.compliance.art23c2.status).toBe('VALID');
    const nullableFte = { ...f.app.state, fundData: { ...f.app.state.fundData,
      annualData: { ...f.app.state.fundData.annualData, manualDipendentiEquivalentiAnnoRif: null } } };
    expect(appReducer(nullableFte, { type: 'UPDATE_ANNUAL_DATA', payload: { manualDipendentiEquivalentiAnnoRif: NaN } }).calculationResult?.compliance.art23c2.status).toBe('STALE');
    const old = f.app.state.calculationResult;
    const runtime = f.app.state.calculationRuntime;
    act(() => f.app.dispatch({ type: 'UPDATE_HISTORICAL_DATA', payload: { manualPersonalFundLimit2016: undefined } }));
    expect(f.app.state.calculationResult?.compliance.art23c2.status).toBe('STALE');
    expect(f.app.state.calculationRuntime.contextEpoch).toBe(runtime.contextEpoch + 1);
    expect(f.app.state.complianceChecks.find((check: any) => check.id === 'limite_art23_c2')).toMatchObject({ isCompliant: false, valoreAttuale: 'RISULTATO OBSOLETO - RICALCOLARE' });
    expect(f.app.state.calculationResult.canonicalFund).toBe(old.canonicalFund);
    expect(f.app.state.calculationResult.totals).toEqual(old.totals);
    const cleared = f.app.state;
    expect(appReducer(cleared, { type: 'CALCULATE_FUND_SUCCESS', payload: { result: old, checks: [], requestContext: runtime.latestRequest! } }).calculationResult?.compliance.art23c2.status).toBe('STALE');
    await debounce(); const writes = f.stateRepo.upsertState.mock.calls.length;
    const inputs = structuredClone(f.app.state.fundData);
    await act(async () => { await f.app.performFundCalculation(); });
    expect(f.app.state.calculationResult.compliance.art23c2.status).toBe('UNDETERMINED');
    expect(f.app.state.fundData).toEqual(inputs);
    await debounce(); expect(f.stateRepo.upsertState).toHaveBeenCalledTimes(writes);
  });
  it('T10 manual zero survives SAVE, provider remount/hydration, PREVIEW and APPLY with unknown provenance', async () => {
    const view = await boot(); vi.useFakeTimers();
    act(() => f.app.dispatch({ type: 'UPDATE_FONDO_ELEVATE_QUALIFICAZIONI_DATA', payload: { va_incremento022_ms2021_eq: 0 } }));
    expect(f.app.state.localSources['fondoElevateQualificazioniData.va_incremento022_ms2021_eq']).toBe('manual');
    await debounce(); expect(f.stateRepo.upsertState).toHaveBeenCalledTimes(1);
    const savedRow = structuredClone(f.stateRepo.upsertState.mock.calls[0][0]);
    expect(savedRow.fund_data.fondoElevateQualificazioniData.va_incremento022_ms2021_eq).toBe(0);
    view.unmount(); vi.useRealTimers();
    f.stateRepo.getState.mockResolvedValue({ data: { ...savedRow, b1i4_version: nextVersion }, error: null });
    await boot();
    expect(f.app.state.localSources['fondoElevateQualificazioniData.va_incremento022_ms2021_eq']).toBeUndefined();
    const fund = f.app.state.fundData; const before = structuredClone(fund); const draft = cor01TransferDraft();
    const preview = buildWizard2026TransferPreview(draft, fund, f.app.state.localSources);
    expect(preview.items.find(item => item.campoDestinazione === 'fondoElevateQualificazioniData.va_incremento022_ms2021_eq'))
      .toMatchObject({ status: 'CONFLICT', valoreAttuale: 0, valoreProposto: 440, differenza: 440 });
    const applied = applyWizard2026Transfer(draft, fund, f.app.state.localSources);
    expect(applied.fondoElevateQualificazioniData.va_incremento022_ms2021_eq).toBe(0);
    expect(f.app.state.fundData).toEqual(before);
    vi.useFakeTimers(); await debounce(); expect(f.stateRepo.upsertState).toHaveBeenCalledTimes(1);
  });
  it.each([0, 17])('T2 manual EQ reduction %s survives closing/reopening FAD with independent effective reduction', async value => {
    const view = await boot(); vi.useFakeTimers();
    act(() => f.app.dispatch({ type: 'UPDATE_FONDO_ACCESSORIO_DIPENDENTE_DATA', payload: { st_riduzionePerIncrementoEQ: value } }));
    expect(f.app.state.localSources['fondoAccessorioDipendenteData.st_riduzionePerIncrementoEQ']).toBe('manual');
    await debounce(); const writesAfterExplicitEdit = f.stateRepo.upsertState.mock.calls.length;
    view.rerender(surface('fad')); await debounce();
    view.rerender(surface('none')); view.rerender(surface('fad')); await debounce();
    expect(f.app.state.fundData.fondoAccessorioDipendenteData.st_riduzionePerIncrementoEQ).toBe(value);
    await act(async () => { await f.app.performLocalCalculation(); });
    expect(f.app.state.validationErrors).toEqual({});
    expect(f.app.state.error).toBeUndefined();
    expect(f.app.state.calculationResult?.reductions.details.fad.riduzionePerIncrementoEQ).toBe(1000);
    // Only the explicit edit may save, never reopening the page.
    expect(f.stateRepo.upsertState).toHaveBeenCalledTimes(writesAfterExplicitEdit);
  });
  it.each([2025, 2026, 2027])('T5 EQ adopted zero survives opening in %s without source labels after hydration', async year => {
    const load = f.stateRepo.getState.getMockImplementation()!;
    f.stateRepo.getState.mockImplementation(async (...args: any[]) => {
      const result: any = await load(...args); result.data.fund_data.fondoElevateQualificazioniData.va_incremento022_ms2021_eq = 0; return result;
    });
    const view = await boot(); if (year !== 2026) await act(async () => { await f.app.switchYearAtomic(year); });
    const before = structuredClone(f.app.state.fundData); f.stateRepo.upsertState.mockClear();
    vi.useFakeTimers(); view.rerender(surface('eq')); await debounce();
    if (year !== 2026) expect(screen.getByTestId('eq-legacy-proposal').textContent).toMatch(/440/);
    view.rerender(surface('none')); await debounce();
    expect(f.app.state.fundData).toEqual(before); expect(f.stateRepo.upsertState).not.toHaveBeenCalled();
  });
  it.each(['isEnteDissestato', 'isEnteStrutturalmenteDeficitario', 'isEnteRiequilibrioFinanziario'] as const)(
    'T4 opening FAD under %s retains inapplicable adopted amounts and does not save', async flag => {
      const load = f.stateRepo.getState.getMockImplementation()!;
      f.stateRepo.getState.mockImplementation(async (...args: any[]) => {
        const result: any = await load(...args); result.data.fund_data.annualData[flag] = true; return result;
      });
      const view = await boot(); const before = structuredClone(f.app.state.fundData);
      vi.useFakeTimers(); view.rerender(surface('fad')); await debounce();
      expect(f.app.state.fundData).toEqual(before);
      expect(f.app.state.fundData.fondoAccessorioDipendenteData.vs_art79c2c_risorseScelteOrganizzative).toBe(200);
      await act(async () => { await f.app.performLocalCalculation(); });
      expect(f.app.state.validationErrors).toEqual({});
      expect(f.app.state.error).toBeUndefined();
      expect(f.app.state.calculationResult?.canonicalFund.verifiedVariableTotal).toBe(0);
      expect(f.stateRepo.upsertState).not.toHaveBeenCalled();
    });
  it('T6 derives the secretary control from atoms without replacing its persisted cache', async () => {
    const view = await boot(); vi.useFakeTimers(); view.rerender(surface('seg')); await debounce();
    fireEvent.click(screen.getByRole('button', { name: /RIEPILOGO E ADEGUAMENTI FINALI/i }));
    expect((document.querySelector('input[name="fin_totaleRisorseRilevantiLimite"]') as HTMLInputElement).value).toBe('600');
    act(() => f.app.dispatch({ type: 'UPDATE_FONDO_SEGRETARIO_COMUNALE_DATA', payload: { st_art3c6_CCNL2011_retribuzionePosizione: 2000 } }));
    expect((document.querySelector('input[name="fin_totaleRisorseRilevantiLimite"]') as HTMLInputElement).value).toBe('1100');
    expect(f.app.state.fundData.fondoSegretarioComunaleData.fin_totaleRisorseRilevantiLimite).toBe(999);
  });
  it('T7 navigating all pages writes nothing; an explicit input still autosaves once after debounce', async () => {
    const view = await boot(); vi.useFakeTimers();
    for (const page of ['fad', 'eq', 'seg', 'eq'] as const) { view.rerender(surface(page)); await debounce(); }
    expect(f.stateRepo.upsertState).not.toHaveBeenCalled();
    fireEvent.change(document.querySelector('input[name="ris_fondoPO2017"]')!, { target: { value: '5500' } });
    fireEvent.blur(document.querySelector('input[name="ris_fondoPO2017"]')!);
    expect(f.app.persistence.dirty).toBe(true); await debounce();
    expect(f.stateRepo.upsertState).toHaveBeenCalledTimes(1);
    expect(f.stateRepo.upsertState.mock.calls[0][0]).toMatchObject({ b1i4_expected: version,
      entity_id: 'cor01-a', current_year: 2026, fund_data: { fondoElevateQualificazioniData: { ris_fondoPO2017: 5500 } } });
    await debounce(); expect(f.stateRepo.upsertState).toHaveBeenCalledTimes(1);
  });
  it('T8 A/2026 -> A/2025 -> B/2025 -> A/2026 loads context-specific amounts without dirtying or writing', async () => {
    const view = await boot(); vi.useFakeTimers();
    const assertContext = async (id: string, year: number, fad: number, eq: number, seg: number) => {
      await debounce();
      expect(f.app.state.hydratedSnapshotKey).toBe(id + ':' + year);
      expect(f.app.state.currentEntity.id).toBe(id); expect(f.app.state.currentYear).toBe(year);
      expect(f.app.state.fundData.fondoAccessorioDipendenteData.st_art79c1c_incrementoStabileConsistenzaPers).toBe(fad);
      expect(f.app.state.fundData.fondoElevateQualificazioniData.ris_fondoPO2017).toBe(eq);
      expect(f.app.state.fundData.fondoSegretarioComunaleData.st_art3c6_CCNL2011_retribuzionePosizione).toBe(seg);
      expect(f.app.persistence.dirty).toBe(false); expect(f.stateRepo.upsertState).not.toHaveBeenCalled();
    };
    view.rerender(surface('fad')); await assertContext('cor01-a', 2026, 10000, 5000, 1000);
    await act(async () => { await f.app.switchYearAtomic(2025); });
    view.rerender(surface('eq')); await assertContext('cor01-a', 2025, 11000, 5100, 1050);
    await act(async () => { await f.app.switchEntity('cor01-b'); });
    view.rerender(surface('seg')); await assertContext('cor01-b', 2025, 13000, 5300, 1150);
    await act(async () => { await f.app.switchEntity('cor01-a'); });
    await act(async () => { await f.app.switchYearAtomic(2026); });
    view.rerender(surface('fad')); await assertContext('cor01-a', 2026, 10000, 5000, 1000);
  });
  it.each(['fad', 'eq', 'seg'] as const)('T9 CLOSED %s rejects direct edits and never autosaves', async page => {
    f.closed = true; const view = await boot(); const before = structuredClone(f.app.state.fundData);
    vi.useFakeTimers(); view.rerender(surface(page));
    act(() => {
      f.app.dispatch({ type: 'UPDATE_FONDO_ACCESSORIO_DIPENDENTE_DATA', payload: { st_riduzionePerIncrementoEQ: 0 } });
      f.app.dispatch({ type: 'UPDATE_FONDO_ELEVATE_QUALIFICAZIONI_DATA', payload: { va_incremento022_ms2021_eq: 0 } });
      f.app.dispatch({ type: 'UPDATE_FONDO_SEGRETARIO_COMUNALE_DATA', payload: { fin_totaleRisorseRilevantiLimite: 0 } });
    });
    await debounce(); view.rerender(surface('none')); await debounce();
    expect(f.app.state.fundData).toEqual(before); expect(f.stateRepo.upsertState).not.toHaveBeenCalled();
  });
  it('T10 origin is supplied by the action for manual zero, explicit instruction and internal update', async () => {
    await boot(); const start = f.app.state;
    const fields = [
      ['UPDATE_FONDO_ACCESSORIO_DIPENDENTE_DATA', 'fondoAccessorioDipendenteData', 'st_riduzionePerIncrementoEQ'],
      ['UPDATE_FONDO_ELEVATE_QUALIFICAZIONI_DATA', 'fondoElevateQualificazioniData', 'va_incremento022_ms2021_eq'],
      ['UPDATE_FONDO_SEGRETARIO_COMUNALE_DATA', 'fondoSegretarioComunaleData', 'fin_totaleRisorseRilevantiLimite'],
    ];
    for (const [type, section, key] of fields) for (const source of [undefined, 'manual', 'wizard2026', 'system'] as const) {
      const action = { type, payload: { [key]: 0 }, ...(source ? { meta: { source } } : {}) } as AppAction;
      const next = appReducer(start, action);
      expect((next.fundData as any)[section][key]).toBe(0);
      expect(next.localSources?.[section + '.' + key]).toBe(source ?? 'manual');
    }
  });
});
