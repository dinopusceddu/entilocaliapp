import { fixtureRow, fixtureBaseline, confirmedFixtureWrite } from '../../test/fixtures/b1Persistence';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppProvider, useAppContext } from '../AppContext';
import { Input } from '../../components/shared/Input';
import { createEmptyFundData } from '../../domain/emptyFund';
import { UserRole, TipologiaEnte } from '../../domain';
import type { FundData } from '../../domain';
import normativa from '../../../public/normativa.json';

const boundary = vi.hoisted(() => ({ getState: vi.fn(), years: vi.fn(), upsert: vi.fn(), create: vi.fn(), update: vi.fn(), queryYears: vi.fn(), user: { id: 'money-u', email: 'money@example.invalid' } }));
vi.mock('../AuthContext.tsx', () => ({ useAuth: () => ({ user: boundary.user }) }));
vi.mock('../../hooks/useNormativeData.ts', () => ({ useNormativeData: () => ({ data: normativa }) }));
vi.mock('../../infrastructure/persistence/SupabaseStateRepository', () => ({ SupabaseStateRepository: class {
  getState(...args: unknown[]) { return boundary.getState(...args); }
  getAvailableYears(...args: unknown[]) { return boundary.years(...args); }
  upsertState(...args: unknown[]) { return boundary.upsert(...args); }
  createState(...args: unknown[]) { return boundary.create(...args); }
} }));
vi.mock('../../infrastructure/persistence/SupabaseEntityRepository', () => ({ SupabaseEntityRepository: class { async getAll() { return { data: [], error: null }; } update(...args: unknown[]) { return boundary.update(...args); } } }));
vi.mock('../../infrastructure/persistence/SupabaseUserRepository', () => ({ SupabaseUserRepository: class { async getUserRole() { return { data: UserRole.GUEST, error: null }; } } }));
vi.mock('../../services/supabase', () => ({ supabase: { from: () => ({ select: () => ({ eq: () => ({ order: boundary.queryYears }) }) }) } }));

const key = 'st_art79c1_art67c1_unicoImporto2017';
const entity = { id: 'money-e', user_id: boundary.user.id, name: 'Ente' };
let context: ReturnType<typeof useAppContext>;
let data: FundData;
function Probe() {
  context = useAppContext();
  return <Input type="number" monetaryPath={key} label="Risorsa FAD" value={context.state.fundData.fondoAccessorioDipendenteData[key]}
    disabled={context.state.fundData.metadata?.snapshotStatus === 'CLOSED'}
    onChange={e => context.dispatch({ type: 'UPDATE_FONDO_ACCESSORIO_DIPENDENTE_DATA', payload: { [key]: e.target.value === '' ? undefined : Number(e.target.value) } })} />;
}
async function mount() {
  render(<AppProvider><Probe /></AppProvider>);
  await waitFor(() => expect(context.state.normativeData).toBeDefined());
  act(() => context.dispatch({ type: 'LOAD_STATE_FROM_DB', payload: { currentYear: 2025, currentEntity: entity, entities: [entity], fundData: data, snapshotBaseline: fixtureBaseline(boundary.user, entity, 2025, data, { role: UserRole.GUEST }) } }));
  boundary.getState.mockClear(); boundary.upsert.mockClear(); boundary.create.mockClear();
}
beforeEach(() => {
  vi.clearAllMocks(); localStorage.clear(); sessionStorage.clear();
  data = createEmptyFundData(2025);
  Object.assign(data.annualData, { denominazioneEnte: 'Ente', tipologiaEnte: TipologiaEnte.UNIONE_COMUNI, hasDirigenza: false, ccnl2024: { monteSalari2021: 0 } });
  data.historicalData.manualPersonalFundLimit2016 = 100000;
  data.fondoAccessorioDipendenteData[key] = 100;
  boundary.getState.mockImplementation(async () => ({ data: fixtureRow(data, boundary.user, entity, 2025, { role: UserRole.GUEST }), error: null }));
  boundary.years.mockResolvedValue({ data: [{ current_year: 2025 }], error: null });
  boundary.queryYears.mockResolvedValue({ data: [], error: null }); boundary.upsert.mockImplementation(async row => confirmedFixtureWrite(row));
});
afterEach(cleanup);
describe('DATA-03 actual AppProvider mutation and save boundary', () => {
  it('invalid UI draft never enters FundData and blocks save until corrected', async () => {
    await mount(); const input = screen.getByLabelText('Risorsa FAD');
    fireEvent.change(input, { target: { value: 'malformed' } });
    expect(context.state.fundData.fondoAccessorioDipendenteData[key]).toBe(100);
    let saved: Awaited<ReturnType<typeof context.saveState>>;
    await act(async () => { saved = await context.saveState(); });
    expect(saved!.reason).toBe('VALIDATION_ERROR'); expect(boundary.upsert).not.toHaveBeenCalled(); expect(boundary.getState).not.toHaveBeenCalled();
    fireEvent.change(input, { target: { value: '0' } });
    expect(context.state.fundData.fondoAccessorioDipendenteData[key]).toBe(0);
    await act(async () => { saved = await context.saveState(); });
    expect(saved!.success).toBe(true); expect(boundary.upsert.mock.calls[0][0].fund_data.fondoAccessorioDipendenteData[key]).toBe(0);
  });
  it('legacy OPEN malformed is lossless and correctable; direct dispatch cannot replace it with another invalid value', async () => {
    Object.assign(data.fondoAccessorioDipendenteData, { [key]: 'malformed' }); await mount();
    expect(context.state.fundData.fondoAccessorioDipendenteData[key]).toBe('malformed');
    expect(screen.getByLabelText('Risorsa FAD')).toHaveAttribute('aria-invalid', 'true');
    act(() => context.dispatch({ type: 'UPDATE_FONDO_ACCESSORIO_DIPENDENTE_DATA', payload: { [key]: -100 } }));
    expect(context.state.fundData.fondoAccessorioDipendenteData[key]).toBe('malformed');
    let saved: Awaited<ReturnType<typeof context.saveState>>;
    await act(async () => { saved = await context.saveState(); }); expect(saved!.success).toBe(false); expect(boundary.upsert).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText('Risorsa FAD'), { target: { value: '100' } });
    expect(context.state.validationErrors[`fondoAccessorioDipendenteData.${key}`]).toBeUndefined();
    await act(async () => { saved = await context.saveState(); }); expect(saved!.success).toBe(true);
    expect(boundary.upsert.mock.calls[0][0].fund_data.fondoAccessorioDipendenteData[key]).toBe(100);
  });
  it('legacy CLOSED invalid is consultable without mutation or writeback', async () => {
    Object.assign(data.fondoAccessorioDipendenteData, { [key]: 'malformed' }); data.metadata = { snapshotStatus: 'CLOSED' };
    const before = structuredClone(data); await mount();
    expect(screen.getByLabelText('Risorsa FAD')).toBeDisabled();
    let saved: Awaited<ReturnType<typeof context.saveState>>;
    await act(async () => { saved = await context.saveState(); }); expect(saved!.success).toBe(false);
    expect(boundary.upsert).not.toHaveBeenCalled(); expect(boundary.create).not.toHaveBeenCalled(); expect(data).toEqual(before);
  });
  it('direct JSON import is atomic and invalid same-code legacy edits stay rejected', async () => {
    await mount();
    const before = context.state.fundData;
    act(() => context.dispatch({ type: 'UPDATE_FONDO_ACCESSORIO_DIPENDENTE_DATA', payload: { [key]: -100 } }));
    expect(context.state.fundData).toBe(before);
    const legacy = structuredClone(data); legacy.fondoAccessorioDipendenteData[key] = -100;
    act(() => context.dispatch({ type: 'LOAD_STATE_FROM_DB', payload: { fundData: legacy } }));
    act(() => context.dispatch({ type: 'UPDATE_FONDO_ACCESSORIO_DIPENDENTE_DATA', payload: { [key]: -200 } }));
    expect(context.state.fundData.fondoAccessorioDipendenteData[key]).toBe(-100);
  });

  it('RBR6 local validation is repairable on the captured version; real conflicts stay blocked', async () => {
    Object.assign(data.fondoAccessorioDipendenteData, { [key]: 'malformed' });
    await mount();
    const version = context.state.snapshotBaseline!.version;
    let result: Awaited<ReturnType<typeof context.saveState>>;
    await act(async () => { result = await context.saveState(); });
    expect(result!.reason).toBe('VALIDATION_ERROR');
    expect(boundary.upsert).not.toHaveBeenCalled();
    expect(context.persistence.blocked).toBe(false);
    expect(context.state.snapshotBaseline!.version).toBe(version);
    fireEvent.change(screen.getByLabelText('Risorsa FAD'), { target: { value: '100' } });
    await act(async () => { result = await context.saveState(); });
    expect(result!.success).toBe(true);
    expect(boundary.upsert.mock.calls[0][0].b1i4_expected).toBe(version);
    const confirmedVersion = context.state.snapshotBaseline!.version;
    boundary.upsert.mockResolvedValueOnce({ error: { message: 'STATE_VERSION_CONFLICT' } });
    fireEvent.change(screen.getByLabelText('Risorsa FAD'), { target: { value: '200' } });
    await act(async () => { result = await context.saveState(); });
    expect(result!.success).toBe(false);
    expect(context.persistence.blocked).toBe(true);
    fireEvent.change(screen.getByLabelText('Risorsa FAD'), { target: { value: '300' } });
    const calls = boundary.upsert.mock.calls.length;
    await act(async () => { result = await context.saveState(); });
    expect(result!.success).toBe(false);
    expect(boundary.upsert).toHaveBeenCalledTimes(calls);
    expect(context.state.snapshotBaseline!.version).toBe(confirmedVersion);
    expect(context.state.fundData.fondoAccessorioDipendenteData[key]).toBe(300);
  });
});
