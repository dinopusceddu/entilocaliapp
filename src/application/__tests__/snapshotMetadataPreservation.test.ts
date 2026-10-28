import { fixtureBaseline, confirmedFixtureWrite } from '../../test/fixtures/b1Persistence';
import { describe, expect, it, vi } from 'vitest';
import { saveAppStateWorkflow } from '../stateWorkflow';
import { initializeAnnualSnapshot, saveAnnualSnapshot } from '../snapshots/snapshotWorkflow';
import { UserRole } from '../../types';

const actor = { id: 'fixture-admin', email: 'admin@example.invalid', role: UserRole.ADMIN };
const ownerRole = 'USER' as UserRole;
const entity = { id: 'fixture-entity', user_id: 'fixture-owner', name: 'Fixture' };
const data = { annualData: { denominazioneEnte: 'Fixture' }, metadata: { snapshotStatus: 'OPEN' } };
function dependencies() {
  return {
    stateRepository: {
      getState: vi.fn().mockResolvedValue({ data: { user_id: entity.user_id, email: 'owner@example.invalid', role: ownerRole, fund_data: data }, error: null }),
      upsertState: vi.fn(async row => confirmedFixtureWrite(row)),
      createState: vi.fn(async row => confirmedFixtureWrite(row)),
    },
    entityRepository: { update: vi.fn().mockResolvedValue({ error: null }) },
    userRepository: { getUserRole: vi.fn().mockResolvedValue({ data: ownerRole, error: null }) },
  } as any;
}

describe('POST-ASTRA: descriptive snapshot metadata belongs to the owner', () => {
  it.each(['app', 'annual'])('preserves existing owner email/role when an ADMIN edits via %s', async kind => {
    const deps = dependencies();
    const changed = { ...data, annualData: { ...data.annualData, note: 'fixture edit' } };
    const result = kind === 'app'
      ? await saveAppStateWorkflow(deps, actor, entity, 2026, UserRole.ADMIN, changed, vi.fn(), fixtureBaseline(actor, entity, 2026, data, { email: 'owner@example.invalid', role: ownerRole }))
      : await saveAnnualSnapshot(deps, actor, entity, 2026, UserRole.ADMIN, changed, fixtureBaseline(actor, entity, 2026, data, { email: 'owner@example.invalid', role: ownerRole }));
    expect(result.success).toBe(true);
    expect(deps.stateRepository.upsertState).toHaveBeenCalledWith(expect.objectContaining({ user_id: entity.user_id, email: 'owner@example.invalid', role: ownerRole }));
  });

  it.each(['app', 'annual'])('does not write metadata/timestamps for an unchanged payload via %s', async kind => {
    const deps = dependencies();
    const reordered = { metadata: { snapshotStatus: 'OPEN' }, annualData: { denominazioneEnte: 'Fixture' } };
    const result = kind === 'app'
      ? await saveAppStateWorkflow(deps, actor, entity, 2026, UserRole.ADMIN, reordered, vi.fn(), fixtureBaseline(actor, entity, 2026, data, { email: 'owner@example.invalid', role: ownerRole }))
      : await saveAnnualSnapshot(deps, actor, entity, 2026, UserRole.ADMIN, reordered, fixtureBaseline(actor, entity, 2026, data, { email: 'owner@example.invalid', role: ownerRole }));
    expect(result.success).toBe(true);
    expect(deps.stateRepository.upsertState).not.toHaveBeenCalled();
    expect(deps.entityRepository.update).not.toHaveBeenCalled();
  });

  it.each(['app', 'annual'])('fails closed on a metadata read error via %s', async kind => {
    const deps = dependencies();
    deps.stateRepository.getState.mockResolvedValue({ data: null, error: { message: 'offline' } });
    const result = kind === 'app'
      ? await saveAppStateWorkflow(deps, actor, entity, 2026, UserRole.ADMIN, data, vi.fn())
      : await saveAnnualSnapshot(deps, actor, entity, 2026, UserRole.ADMIN, data);
    expect(result.success).toBe(false);
    expect(deps.stateRepository.upsertState).not.toHaveBeenCalled();
  });

  it('never attributes an ADMIN email to a different owner during initialization', async () => {
    const deps = dependencies();
    const result = await initializeAnnualSnapshot(deps, entity.user_id, entity.id, 2027, actor, data);
    expect(result.success).toBe(true);
    expect(deps.stateRepository.createState).toHaveBeenCalledWith(expect.objectContaining({ user_id: entity.user_id, email: null, role: ownerRole }));
  });

  it('does not use the actor role if the owner role lookup fails', async () => {
    const deps = dependencies();
    deps.userRepository.getUserRole.mockResolvedValue({ data: null, error: { message: 'offline' } });
    expect((await initializeAnnualSnapshot(deps, entity.user_id, entity.id, 2027, actor, data)).success).toBe(false);
    expect(deps.stateRepository.createState).not.toHaveBeenCalled();
  });
});
