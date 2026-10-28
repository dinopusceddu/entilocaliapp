// RBR6 test fixtures only. No hosted clients or economic calculations.
import { baselineFromRow } from '../../application/snapshots/versionedSnapshotContract';
export const FIXTURE_VERSION = '11111111-1111-4111-8111-111111111111';
let revision = 1;
export const freshFixtureVersion = () =>
  'dddddddd-dddd-4ddd-8ddd-' + (++revision).toString(16).padStart(12, '0');
export function fixtureRow(fundData: any, user: any, entity: any, year: number,
  extra: Record<string, any> = {}) {
  return { entity_id: entity.id, current_year: year, user_id: entity.user_id,
    email: user.id === entity.user_id ? user.email ?? null : null,
    role: user.role ?? 'GUEST', fund_data: fundData,
    b1i4_version: FIXTURE_VERSION, b1i4_expected: null, ...extra };
}
export function fixtureBaseline(user: any, entity: any, year: number, fundData: any,
  extra: Record<string, any> = {}) {
  return baselineFromRow(user.id, fixtureRow(fundData, user, entity, year, extra));
}
export function confirmedFixtureWrite(record: any) {
  return { data: { ...structuredClone(record), b1i4_expected: null,
    b1i4_version: freshFixtureVersion() }, error: null };
}
export function confirmedFixtureClosure(params: any, user: any, entity: any) {
  const currentVersion = freshFixtureVersion(), nextVersion = freshFixtureVersion();
  const currentSnapshot = fixtureRow(structuredClone(params.closedFundData), user, entity,
    params.currentYear, { b1i4_version: currentVersion });
  const nextSnapshot = fixtureRow(structuredClone(params.nextFundData), user, entity,
    params.currentYear + 1, { b1i4_version: nextVersion });
  return { data: { success: true, currentVersion, nextVersion, currentSnapshot, nextSnapshot }, error: null };
}

