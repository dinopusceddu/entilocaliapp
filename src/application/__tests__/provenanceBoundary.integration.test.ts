import { describe, it, expect, vi } from 'vitest';
import { hydrateFundData } from '../input/hydrateFundData';
import { projectProvenance } from '../../domain/provenance';
import { createEmptyFundData } from '../../domain/emptyFund';
import { saveAnnualSnapshot, loadAnnualSnapshot } from '../snapshots/snapshotWorkflow';
import { fetchUserRoleWorkflow } from '../userWorkflow';
import { canAccessAdminArea, resolveRoleOnStateLoad } from '../policies/authorizationPolicy';
import { UserRole } from '../../domain/enums';
import { appReducer, createEmptyAppState } from '../../contexts/AppContext';
import { calculateFundCompletely } from '../../logic/calculation/fundEngine';
import { normalizeInput } from '../input/inputNormalizer';
import normativa from '../../../public/normativa.json';
import { resolvedZeroState } from '../../test/fixtures/ccnlRecovery';
import { calculateCcnl2026Increments } from '../../logic/wizard2026/ccnl2026Increments';
import { createEmptyWizard2026DraftState } from '../../features/wizard2026/initialState';
import { applyWizard2026Transfer } from '../../features/wizard2026/transfer/applyWizard2026Transfer';

function fund() { const data = createEmptyFundData(2026); data.annualData.art33ManualDecision = 'DO_NOT_APPLY'; return data; }
const entity = { id: 'entity', name: 'Comune', user_id: 'owner' };
const admin = { id: 'admin', name: 'Autore', role: UserRole.ADMIN }, owner = { id: 'owner', name: 'Proprietario', role: UserRole.GUEST };
describe('metadata identity and snapshot boundary', () => {
  it.each([[UserRole.GUEST, UserRole.ADMIN, false], [UserRole.ADMIN, UserRole.GUEST, true]])('poisoning current %s persisted %s', (current, stored, allowed) => {
    const state = { ...createEmptyAppState(), currentUser: { ...owner, role: current }, currentEntity: entity, fundData: fund() };
    const loaded = appReducer(state, { type: 'LOAD_STATE_FROM_DB', payload: { currentUser: { ...owner, role: stored }, fundData: state.fundData } });
    expect(loaded.currentUser.role).toBe(current); expect(canAccessAdminArea(loaded.currentUser)).toBe(allowed);
    expect(resolveRoleOnStateLoad(current, stored)).toBe(current);
  });
  it('role refresh uses current profile, not snapshot or provenance', async () => {
    const dispatch = vi.fn(); await fetchUserRoleWorkflow({ userRepository: { getUserRole: vi.fn().mockResolvedValue({ data: UserRole.GUEST, error: null }) } }, admin, dispatch);
    expect(dispatch).toHaveBeenCalledWith({ type: 'SET_USER', payload: { ...admin, role: UserRole.GUEST } });
  });
  it('Admin saves user-owned entity; load/hydrate/derive preserves owner and current-user permission', async () => {
    const data = fund(); data.wizard2026TransferSnapshot = { userId: 'admin', year: 2026, computed: { annualita022Considerate: 99 } };
    let row: any = null;
    const deps = { stateRepository: { getState: vi.fn(async () => ({ data: row, error: null })), upsertState: vi.fn(async (value: any) => { row = value; return { error: null }; }) }, entityRepository: { update: vi.fn() } };
    const saved = await saveAnnualSnapshot(deps as any, admin, entity, 2026, admin.role, data); expect(saved.success).toBe(true);
    expect(row.user_id).toBe('owner'); expect(row.role).toBe(UserRole.ADMIN);
    const reloaded = await loadAnnualSnapshot(deps as any, owner, entity.id, 2026); expect(reloaded.snapshot?.userId).toBe('owner');
    const a = calculateFundCompletely(normalizeInput(data), normativa);
    const hydrated = hydrateFundData(reloaded.snapshot!.fundData, 2026, entity.name);
    const b = calculateFundCompletely(normalizeInput(hydrated), normativa);
    const model = projectProvenance(b, hydrated, { entity, currentUser: owner, persistedRole: reloaded.snapshot!.role });
    expect(model.identity).toMatchObject({ ownerId: 'owner', currentRole: UserRole.GUEST, actor: { action: 'TRANSFER', reference: 'admin' } });
    expect(model.questions).toEqual(projectProvenance(a, data, { entity, currentUser: owner }).questions);
    expect(canAccessAdminArea(owner)).toBe(false);
  });
  it('CLOSED stale metadata can be consulted without writeback; save fails before upsert', async () => {
    const data = fund(); data.metadata = { snapshotStatus: 'CLOSED', closedBy: 'closing@example.invalid' };
    data.wizard2026TransferSnapshot = { year: 1900, computed: { capienza: 999999 } };
    const before = JSON.stringify(data), model = projectProvenance(calculateFundCompletely(normalizeInput(data), normativa), data, { entity, currentUser: owner });
    expect(model.identity.actor).toMatchObject({ action: 'CLOSURE', reference: 'closing@example.invalid' });
    expect(JSON.stringify(data)).toBe(before);
    const upsertState = vi.fn(), deps = { stateRepository: { getState: vi.fn().mockResolvedValue({ data: { fund_data: data } }), upsertState }, entityRepository: { update: vi.fn() } };
    expect((await saveAnnualSnapshot(deps as any, owner, entity, 2026, owner.role, data)).reason).toBe('SNAPSHOT_CLOSED');
    expect(upsertState).not.toHaveBeenCalled();
  });
  it('transfer reapplication and explanation do not introduce a second contribution or write derived metadata', () => {
    const draft = createEmptyWizard2026DraftState(); draft.ente.annoRiferimento = 2026;
    Object.assign(draft.ccnl2026, { monteSalari2021: 1000000, fondoRisorseDecentrate2024: 80000, risorseEQ2024: 20000, recoveryInstructions: resolvedZeroState().instructions });
    draft.ccnl2026.result = calculateCcnl2026Increments(draft.ccnl2026);
    const original = fund(), once = applyWizard2026Transfer(draft, original), twice = applyWizard2026Transfer(draft, once);
    once.annualData.art33ManualDecision = twice.annualData.art33ManualDecision = 'DO_NOT_APPLY';
    const a = calculateFundCompletely(normalizeInput(once), normativa), b = calculateFundCompletely(normalizeInput(twice), normativa);
    expect(a.canonicalFund).toEqual(b.canonicalFund);
    const before = JSON.stringify(twice); projectProvenance(b, twice, { entity, currentUser: owner }); expect(JSON.stringify(twice)).toBe(before);
  });
});
