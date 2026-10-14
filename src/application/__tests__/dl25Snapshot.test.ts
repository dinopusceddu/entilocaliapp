import { it, expect, vi } from 'vitest';
import { switchActiveYear, saveAnnualSnapshot, loadAnnualSnapshot } from '../snapshots/snapshotWorkflow';
const user = { id: 'u', email: 'u@example.test' };
const entity = { id: 'e', user_id: 'u', name: 'Comune' };
const facts = { version: 1, stipendiTabellari2023NonDirigenti: 300000, fondoStabile2025Certificato: 100000, budgetEq2025: 20000, currentYearDelta: 4000 };
const source = { annualData: { annoRiferimento: 2025, dl25: facts }, fondoAccessorioDipendenteData: { st_incrementoDL25_2025: 4000 }, metadata: { snapshotStatus: 'CLOSED' } };
const defaults = { annualData: { annoRiferimento: 2026 }, fondoAccessorioDipendenteData: {} };
const deps = () => ({ stateRepository: { getState: vi.fn().mockResolvedValue({ data: null }), createState: vi.fn().mockResolvedValue({}), upsertState: vi.fn().mockResolvedValue({}) }, entityRepository: { update: vi.fn() }, userRepository: { getUserRole: vi.fn().mockResolvedValue({ data: 'GUEST' }) } }) as any;
it('new same-entity N+1 receives qualified prior and source CLOSED stays unchanged', async () => {
  const d = deps(); const before = JSON.stringify(source);
  const r = await switchActiveYear(d, user, entity, 2025, 2026, 'guest' as any, source, defaults, false, entity);
  expect(r.newSnapshot?.fundData.annualData.dl25?.priorCumulativeApplied).toBe(4000);
  expect(d.stateRepository.createState.mock.calls[0][0].fund_data.fondoAccessorioDipendenteData.st_incrementoDL25_2025).toBe(4000);
  expect(JSON.stringify(source)).toBe(before); expect(d.stateRepository.upsertState).not.toHaveBeenCalled();
});
it('existing target and cross-entity initialization never receive automatic reinterpretation', async () => {
  const d = deps(); d.stateRepository.getState.mockResolvedValue({ data: { current_year: 2026, fund_data: defaults } });
  const r = await switchActiveYear(d, user, entity, 2025, 2026, 'guest' as any, source, defaults, false, entity);
  expect(r.newSnapshot?.fundData).toBe(defaults); expect(d.stateRepository.createState).not.toHaveBeenCalled();
  const cross = deps(); await switchActiveYear(cross, user, entity, 2025, 2026, 'guest' as any, source, defaults, false, { id: 'other' });
  // DATA-01: same explicit data, independently allocated initialization payload.
  const initialized = cross.stateRepository.createState.mock.calls[0][0].fund_data;
  expect(initialized).toStrictEqual(defaults);
  expect(initialized).not.toBe(defaults);
  expect(initialized.fondoAccessorioDipendenteData).not.toBe(defaults.fondoAccessorioDipendenteData);
});
it('actual save/reload preserves facts; CLOSED guard refuses writes', async () => {
  const d = deps(); const payload = { ...defaults, annualData: { annoRiferimento: 2026, dl25: { ...facts, priorCumulativeApplied: 4000, priorStockProvenance: 'Determina 2025', currentYearDelta: 15000, legacyQualification: 'CURRENT_YEAR_DELTA', regimeDate: '2026-08-08' } }, fondoAccessorioDipendenteData: { st_incrementoDL25_2025: 19000 } };
  await saveAnnualSnapshot(d, user, entity, 2026, 'guest' as any, payload);
  const persisted = JSON.parse(JSON.stringify(d.stateRepository.upsertState.mock.calls[0][0]));
  d.stateRepository.getState.mockResolvedValue({ data: persisted });
  expect((await loadAnnualSnapshot(d, user, entity.id, 2026)).snapshot?.fundData).toEqual(payload);
  d.stateRepository.getState.mockResolvedValue({ data: { fund_data: source } });
  expect((await saveAnnualSnapshot(d, user, entity, 2025, 'guest' as any, payload)).reason).toBe('SNAPSHOT_CLOSED');
  expect(d.stateRepository.upsertState).toHaveBeenCalledTimes(1);
});
