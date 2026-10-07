import { act, cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppProvider, appReducer, createEmptyAppState, useAppContext } from '../AppContext';
import { createEmptyFundData } from '../../domain/emptyFund';
import { UserRole } from '../../domain';
import { resolveDirigenzaArt23Subject } from '../../logic/calculation/dirigenzaArt23';
import { HistoricalDataForm } from '../../components/dataInput/HistoricalDataForm';

const boundary = vi.hoisted(() => ({
  user: { id: 'data01-provider', email: 'data01@example.invalid' },
  entities: vi.fn(), state: vi.fn(), years: vi.fn(), upsert: vi.fn(), create: vi.fn(), atomic: vi.fn(),
}));
vi.mock('../AuthContext.tsx', () => ({ useAuth: () => ({ user: boundary.user }) }));
vi.mock('../../hooks/useNormativeData.ts', () => ({ useNormativeData: () => ({ data: undefined }) }));
vi.mock('../../infrastructure/persistence/SupabaseStateRepository', () => ({
  SupabaseStateRepository: class {
    getState(...args: unknown[]) { return boundary.state(...args); }
    getAvailableYears(...args: unknown[]) { return boundary.years(...args); }
    upsertState(...args: unknown[]) { return boundary.upsert(...args); }
    createState(...args: unknown[]) { return boundary.create(...args); }
    closeYearAtomic(...args: unknown[]) { return boundary.atomic(...args); }
  },
}));
vi.mock('../../infrastructure/persistence/SupabaseEntityRepository', () => ({
  SupabaseEntityRepository: class {
    getAll() { return boundary.entities(); }
    async update() { return { error: null }; }
  },
}));
vi.mock('../../infrastructure/persistence/SupabaseUserRepository', () => ({
  SupabaseUserRepository: class { async getUserRole() { return { data: UserRole.GUEST, error: null }; } },
}));

let context: ReturnType<typeof useAppContext>;
function Probe() { context = useAppContext(); return null; }
const entity = { id: 'data01-E', user_id: boundary.user.id, name: 'Ente DATA01 reale' };

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  boundary.entities.mockResolvedValue({ data: [], error: null });
  boundary.state.mockResolvedValue({ data: null, error: null });
  boundary.years.mockResolvedValue({ data: [], error: null });
  boundary.upsert.mockResolvedValue({ error: null });
  boundary.create.mockResolvedValue({ error: null });
});
afterEach(() => { cleanup(); vi.useRealTimers(); });

describe('DATA01 AppContext real initialization', () => {
  it('initial shell contains no sample economics and never autosaves or closes', async () => {
    render(<AppProvider><Probe /></AppProvider>);
    await waitFor(() => expect(boundary.entities).toHaveBeenCalled());
    expect(context.state.currentEntity).toBeUndefined();
    expect(context.state.fundData.historicalData).toEqual({});
    expect(context.state.fundData.annualData.simulatoreInput).toEqual({});
    expect(context.state.fundData.annualData.fondoLavoroStraordinario).toBeUndefined();
    expect(context.state.fundData.personaleServizio.manualProgressioni).toBeUndefined();
    vi.useFakeTimers();
    await act(async () => { await vi.advanceTimersByTimeAsync(4000); });
    expect(boundary.create).not.toHaveBeenCalled();
    expect(boundary.upsert).not.toHaveBeenCalled();
    expect(context.closureReadiness.status).toBe('NOT_READY');
    let result: Awaited<ReturnType<typeof context.closeCurrentYear>> | undefined;
    await act(async () => { result = await context.closeCurrentYear(); });
    expect(result?.success).toBe(false);
    expect(boundary.atomic).not.toHaveBeenCalled();
  });
  it('historical UI inputs are blank, not demo limits/personnel/payroll', async () => {
    const { container } = render(<AppProvider><Probe /><HistoricalDataForm /></AppProvider>);
    await waitFor(() => expect(boundary.entities).toHaveBeenCalled());
    for (const field of ['fondoSalarioAccessorioPersonaleNonDirEQ2016', 'fondoElevateQualificazioni2016',
      'fondoDirigenza2016', 'risorseSegretarioComunale2016', 'fondoLavoroStraordinario', 'fondoPersonaleNonDirEQ2018_Art23', 'fondoEQ2018_Art23']) {
      const input = container.querySelector<HTMLInputElement>(`#${field}`);
      expect(input, field).not.toBeNull();
      expect(input!.value, field).toBe('');
    }
  });
  it('new real entity snapshot creation persists only structural state with its actual year/name', async () => {
    boundary.entities.mockResolvedValue({ data: [entity], error: null });
    render(<AppProvider><Probe /></AppProvider>);
    await waitFor(() => expect(context.state.hydratedSnapshotKey).toBe(`${entity.id}:${context.state.currentYear}`));
    expect(boundary.create).toHaveBeenCalledTimes(1);
    const saved = boundary.create.mock.calls[0][0];
    expect(saved.fund_data.historicalData).toEqual({});
    expect(saved.fund_data.annualData.annoRiferimento).toBe(saved.current_year);
    expect(saved.fund_data.annualData.denominazioneEnte).toBe(entity.name);
    expect(saved.fund_data.annualData.simulatoreInput).toEqual({});
    expect(saved.fund_data.annualData.pnrrExerciseDecision).toBeUndefined();
    expect(saved.fund_data.annualData.dl25).toBeUndefined();
    expect(saved.fund_data.fondoDirigenzaData).toEqual({});
    vi.useFakeTimers();
    await act(async () => { await vi.advanceTimersByTimeAsync(4000); });
    expect(boundary.upsert).not.toHaveBeenCalled();
    expect(context.closureReadiness.status).toBe('NOT_READY');
  });
  it('real provider hydration preserves raw legacy cache-only as UNDETERMINED', async () => {
    boundary.entities.mockResolvedValue({ data: [entity], error: null });
    boundary.years.mockResolvedValue({ data: [{ current_year: 2026 }], error: null });
    const raw = { annualData: { annoRiferimento: 2026, hasDirigenza: true },
      historicalData: { fondoSalarioAccessorioPersonaleNonDirEQ2016: 4321 },
      fondoDirigenzaData: { lim_totaleParzialeRisorseConfrontoTetto2016: 999999 } };
    boundary.state.mockResolvedValue({ data: { entity_id: entity.id, user_id: boundary.user.id, current_year: 2026, fund_data: raw }, error: null });
    render(<AppProvider><Probe /></AppProvider>);
    await waitFor(() => expect(context.state.hydratedSnapshotKey).toBe(`${entity.id}:2026`));
    expect(context.state.fundData.historicalData).toEqual(raw.historicalData);
    expect(Object.keys(context.state.fundData.fondoDirigenzaData)).toEqual(['lim_totaleParzialeRisorseConfrontoTetto2016']);
    expect(resolveDirigenzaArt23Subject(context.state.fundData.fondoDirigenzaData, true).status).toBe('UNDETERMINED');
    expect(boundary.create).not.toHaveBeenCalled();
    expect(boundary.upsert).not.toHaveBeenCalled();
  });
  it('real CLOSED provider hydration preserves byte/shape and cannot write', async () => {
    boundary.entities.mockResolvedValue({ data: [entity], error: null });
    boundary.years.mockResolvedValue({ data: [{ current_year: 2026 }], error: null });
    const closed = createEmptyFundData(2026, entity.name);
    closed.historicalData = { fondoSalarioAccessorioPersonaleNonDirEQ2016: 0, fondoEQ2018_Art23: undefined };
    closed.fondoDirigenzaData = { lim_totaleParzialeRisorseConfrontoTetto2016: 5000 };
    closed.metadata = { snapshotStatus: 'CLOSED' };
    const before = structuredClone(closed);
    boundary.state.mockResolvedValue({ data: { entity_id: entity.id, user_id: boundary.user.id, current_year: 2026, fund_data: closed }, error: null });
    render(<AppProvider><Probe /></AppProvider>);
    await waitFor(() => expect(context.state.hydratedSnapshotKey).toBe(`${entity.id}:2026`));
    expect(context.state.fundData).toEqual(before);
    expect(JSON.stringify(context.state.fundData)).toBe(JSON.stringify(before));
    vi.useFakeTimers();
    await act(async () => { await vi.advanceTimersByTimeAsync(4000); });
    expect(boundary.create).not.toHaveBeenCalled();
    expect(boundary.upsert).not.toHaveBeenCalled();
    expect(closed).toEqual(before);
  });
  it('entity reset and provisional year transition expose no previous data or shared defaults', () => {
    const a = createEmptyAppState();
    a.currentEntity = { ...entity, id: 'A' };
    a.fundData.historicalData.fondoSalarioAccessorioPersonaleNonDirEQ2016 = 100000;
    a.fundData.annualData.proventiSpecifici.push({ id: 'real-A', descrizione: 'Real', importo: 123, riferimentoNormativo: 'A' });
    const before = structuredClone(a);
    const b = appReducer(a, { type: 'SET_CURRENT_ENTITY', payload: { ...entity, id: 'B' } });
    expect(b.fundData.historicalData).toEqual({});
    expect(b.fundData.annualData.proventiSpecifici).toEqual([]);
    b.fundData.annualData.personaleServizioAttuale[0].count = 5;
    expect(a).toEqual(before);
    const next = appReducer(a, { type: 'SET_CURRENT_YEAR', payload: a.currentYear + 1 });
    expect(next.fundData.historicalData).toEqual({});
    expect(next.fundData.annualData.simulatoreInput).toEqual({});
    next.fundData.annualData.proventiSpecifici.push({ id: 'real-N1', descrizione: 'N1', importo: 42, riferimentoNormativo: 'N1' });
    expect(a).toEqual(before);
  });
  it('partial reducer imports preserve explicit zero and do not fill absent fields', () => {
    let state = createEmptyAppState();
    state = appReducer(state, { type: 'IMPORT_DATI_GENERALI_CSV', payload: {
      historicalData: { fondoSalarioAccessorioPersonaleNonDirEQ2016: 0 },
      annualData: { simulatoreInput: { simStipendiTabellari2023: 4321 } } as any,
    } });
    expect(state.fundData.historicalData).toEqual({ fondoSalarioAccessorioPersonaleNonDirEQ2016: 0 });
    expect(state.fundData.annualData.simulatoreInput).toEqual({ simStipendiTabellari2023: 4321 });
    state = appReducer(state, { type: 'IMPORT_FUND_DATA', payload: { fondoDirigenzaData: { lim_totaleParzialeRisorseConfrontoTetto2016: 999 } } });
    expect(state.fundData.historicalData.fondoElevateQualificazioni2016).toBeUndefined();
    expect(state.fundData.annualData.fondoLavoroStraordinario).toBeUndefined();
    expect(state.fundData.fondoDirigenzaData).toEqual({ lim_totaleParzialeRisorseConfrontoTetto2016: 999 });
  });
});
