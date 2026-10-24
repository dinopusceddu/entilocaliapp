import type { SnapshotBaseline, AnnualSnapshotSaveResult } from '../../domain/snapshot';
import { persistenceError, StatePersistenceError } from './versionedSnapshotContract';
import { serializeSnapshotPayload } from './snapshotPersistenceContract';

export interface DraftSession {
  baseline: SnapshotBaseline; values: any; viewBaseline: any; revision: number; dirty: boolean;
  status: 'idle' | 'saving' | 'closing' | 'saved' | 'failed' | 'conflicted';
  error?: StatePersistenceError;
  review?: { baseline: SnapshotBaseline; values: any };
}
export interface SaveAttempt {
  principalId: string; entityId: string; year: number;
  revision: number; baseline: SnapshotBaseline; values: any; session: DraftSession;
}
/** In-memory only. Retained copies are never silently rebased or automatically retried. */
export class DraftConcurrencyController {
  current?: DraftSession;
  readonly retained: DraftSession[] = [];
  private same(b: SnapshotBaseline, principalId: string, entityId: string, year: number) {
    return b.principalId === principalId && b.entityId === entityId && b.year === year;
  }
  hydrate(baseline: SnapshotBaseline, values: any, explicitReplacement = false): boolean {
    if (this.current && this.hasPendingWork() && !explicitReplacement) return false;
    if (this.current && this.hasPendingWork() && explicitReplacement) this.retain(this.current);
    this.current = { baseline: structuredClone(baseline), values: structuredClone(values),
      viewBaseline: structuredClone(values), revision: 0, dirty: false, status: 'idle' };
    return true;
  }
  private retain(session: DraftSession) {
    const duplicate = this.retained.some(s => this.same(s.baseline, session.baseline.principalId,
      session.baseline.entityId, session.baseline.year) && s.baseline.version === session.baseline.version
      && serializeSnapshotPayload(s.values) === serializeSnapshotPayload(session.values));
    if (!duplicate) this.retained.push({ ...session, values: structuredClone(session.values),
      baseline: structuredClone(session.baseline), viewBaseline: structuredClone(session.viewBaseline), review: undefined });
  }
  retainExternal(baseline: SnapshotBaseline, values: any) {
    this.retain({ baseline, values, viewBaseline: null, dirty: true, revision: 0, status: 'failed' });
  }
  invalidate() {
    if (this.current && this.hasPendingWork()) this.retain(this.current);
    this.current = undefined;
  }
  touch() { if (this.current) { this.current.revision += 1; this.current.dirty = true; } }
  observe(principalId: string, entityId: string, year: number, values: any) {
    const s = this.current;
    if (!s || !this.same(s.baseline, principalId, entityId, year)) return;
    if (serializeSnapshotPayload(s.values) !== serializeSnapshotPayload(values)) {
      s.values = structuredClone(values); s.revision += 1;
      s.dirty = !!s.error || serializeSnapshotPayload(s.viewBaseline) !== serializeSnapshotPayload(values);
    }
  }
  baselineFor(principalId: string, entityId: string, year: number) {
    const s = this.current;
    return s && this.same(s.baseline, principalId, entityId, year) ? s.baseline : undefined;
  }
  hasPendingWork() {
    const s = this.current;
    return !!s && (s.dirty || s.status === 'saving' || s.status === 'closing' || !!s.error);
  }
  isBlocked() { return !!this.current?.error; }
  begin(principalId: string, entityId: string, year: number, values: any): SaveAttempt {
    const s = this.current;
    if (!s || !this.same(s.baseline, principalId, entityId, year))
      throw new StatePersistenceError('STATE_VERSION_REQUIRED', 'Carica una versione valida prima di salvare.');
    if (s.error) throw new StatePersistenceError('STATE_RECONCILIATION_REQUIRED', s.error.message, s.error);
    if (s.status === 'saving' || s.status === 'closing')
      throw new StatePersistenceError('STATE_SAVE_IN_PROGRESS', 'Un’operazione è già in corso. Attendi il risultato.');
    this.observe(principalId, entityId, year, values);
    s.status = 'saving';
    return { principalId, entityId, year, baseline: structuredClone(s.baseline),
      revision: s.revision, values: structuredClone(values), session: s };
  }
  succeed(attempt: SaveAttempt, result: AnnualSnapshotSaveResult) {
    const s = attempt.session;
    if (!result.success || !result.baseline) throw new StatePersistenceError('STATE_WRITE_NOT_CONFIRMED', 'Versione salvata non confermata.');
    s.baseline = structuredClone(result.baseline);
    s.viewBaseline = structuredClone(result.persistedRow?.fund_data ?? attempt.values);
    s.dirty = s.revision !== attempt.revision || serializeSnapshotPayload(s.values) !== serializeSnapshotPayload(attempt.values);
    s.status = s.dirty ? 'idle' : 'saved'; s.error = undefined;
    if (this.current !== s && s.dirty) this.retain(s);
  }
  fail(attempt: SaveAttempt | undefined, error: unknown) {
    const issue = persistenceError(error);
    if (issue.code === 'STATE_SAVE_IN_PROGRESS') return;
    const s = attempt?.session ?? this.current;
    if (!s) return;
    s.error = issue; s.dirty = true;
    s.status = issue.code === 'STATE_VERSION_CONFLICT' || issue.code === 'STATE_CONCURRENT_CREATION' ? 'conflicted' : 'failed';
    // Preserve overrides and values sent, including values not yet committed to the reducer.
    if (attempt) this.retain({ ...s, baseline: attempt.baseline, values: attempt.values });
  }
  cancelClosing(session: DraftSession) {
    if (session.status === 'closing') session.status = session.dirty ? 'idle' : 'saved';
  }
  setReview(baseline: SnapshotBaseline, values: any) {
    const s = this.current;
    if (!s || !this.same(s.baseline, baseline.principalId, baseline.entityId, baseline.year)) return false;
    s.review = { baseline: structuredClone(baseline), values: structuredClone(values) }; return true;
  }
  acceptReview() {
    const s = this.current;
    if (!s?.review || s.status === 'saving' || s.status === 'closing') return undefined;
    const review = s.review; this.retain(s);
    this.current = { baseline: review.baseline, values: review.values, viewBaseline: structuredClone(review.values),
      revision: 0, dirty: false, status: 'idle' };
    return this.current;
  }
  visibleRetained(principalId: string) { return this.retained.filter(s => s.baseline.principalId === principalId); }
  discardRetained(principalId: string) {
    for (let i = this.retained.length - 1; i >= 0; i--) if (this.retained[i].baseline.principalId === principalId) this.retained.splice(i, 1);
  }
}
