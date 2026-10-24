import type { SnapshotBaseline, AnnualSnapshotSaveResult } from '../../domain/snapshot';
import { serializeSnapshotPayload } from './snapshotPersistenceContract';

export const ABSENT_VERSION = '00000000-0000-0000-0000-000000000000';
export type StateFailureCode =
  | 'STATE_VERSION_CONFLICT' | 'STATE_CONCURRENT_CREATION' | 'STATE_VERSION_REQUIRED'
  | 'STATE_NOT_FOUND' | 'STATE_CLOSED' | 'STATE_NOT_OPEN' | 'STATE_PERMISSION_DENIED'
  | 'STATE_WRITE_NOT_CONFIRMED' | 'STATE_PERSISTENCE_ERROR' | 'STATE_OUTCOME_UNKNOWN'
  | 'STATE_RECONCILIATION_REQUIRED' | 'STATE_SAVE_IN_PROGRESS';
export class StatePersistenceError extends Error {
  constructor(public readonly code: StateFailureCode, message: string, public readonly cause?: unknown) {
    super(message); this.name = 'StatePersistenceError';
  }
}
export const conflictMessage = "Questa annualità è stata modificata da un'altra sessione. Le modifiche che hai inserito sono state conservate ma non salvate. Verifica i dati aggiornati prima di riprovare.";
export const isVersion = (value: unknown): value is string =>
  typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value) && value !== ABSENT_VERSION;
export const sameSnapshot = (a: SnapshotBaseline | undefined, principalId: string, entityId: string, year: number) =>
  !!a && a.principalId === principalId && a.entityId === entityId && a.year === year;
export function baselineFromRow(principalId: string, row: any): SnapshotBaseline {
  const fundData = typeof row.fund_data === 'string' ? JSON.parse(row.fund_data) : row.fund_data;
  return {
    principalId, entityId: row.entity_id, year: row.current_year, exists: true,
    version: isVersion(row.b1i4_version) ? row.b1i4_version : null,
    identity: { user_id: row.user_id, email: row.email ?? null, role: row.role ?? null },
    fundData: structuredClone(fundData), rawStatus: fundData?.metadata?.snapshotStatus ?? null,
  };
}
export function absentBaseline(principalId: string, entityId: string, year: number): SnapshotBaseline {
  return { principalId, entityId, year, exists: false, version: null, fundData: null, rawStatus: null };
}
export function requireBaseline(baseline: SnapshotBaseline | undefined, principalId: string, entityId: string, year: number) {
  if (!sameSnapshot(baseline, principalId, entityId, year) || (baseline?.exists && !isVersion(baseline.version))) {
    throw new StatePersistenceError('STATE_VERSION_REQUIRED', 'Versione della bozza non disponibile. Consulta i dati aggiornati prima di salvare.');
  }
  if (baseline?.rawStatus === 'CLOSED') throw new StatePersistenceError('STATE_CLOSED', 'Annualità chiusa: modifiche non consentite.');
  return baseline!;
}
export function persistenceError(error: any): StatePersistenceError {
  if (error instanceof StatePersistenceError) return error;
  const message = String(error?.message ?? '');
  if (error?.code === 'STATE_CONCURRENT_CREATION') return new StatePersistenceError('STATE_CONCURRENT_CREATION', message, error.cause ?? error);
  if (message.includes('STATE_VERSION_CONFLICT')) return new StatePersistenceError('STATE_VERSION_CONFLICT', conflictMessage, error);
  if (message.includes('SNAPSHOT_CLOSED') || message.includes('CANNOT_DELETE_CLOSED')) return new StatePersistenceError('STATE_CLOSED', 'L’annualità è chiusa. La bozza è stata conservata.', error);
  if (message.includes('STATE_NOT_OPEN')) return new StatePersistenceError('STATE_NOT_OPEN', 'L’annualità non è modificabile. La bozza è stata conservata.', error);
  if (error?.code === 'P0002') return new StatePersistenceError('STATE_NOT_FOUND', 'Annualità non trovata. La bozza è stata conservata.', error);
  if (error?.code === '42501' || error?.code === '23514') return new StatePersistenceError('STATE_PERMISSION_DENIED', 'Operazione non consentita. La bozza è stata conservata.', error);
  return new StatePersistenceError('STATE_PERSISTENCE_ERROR', 'Salvataggio non confermato. La bozza è stata conservata; verifica i dati prima di riprovare.', error);
}
export function saveFailure(error: unknown): AnnualSnapshotSaveResult {
  const issue = persistenceError(error);
  return { success: false, reason: issue.code, error: issue.message, technicalCause: issue.cause ?? issue };
}
export function unchangedDraft(baseline: SnapshotBaseline, payload: unknown) {
  return baseline.exists && serializeSnapshotPayload(baseline.fundData) === serializeSnapshotPayload(payload);
}
