import { useCallback, useEffect, useRef } from 'react';
import { FundData, AnnualSnapshotSaveResult } from '../domain';

interface Props {
  user: any; currentEntity: any; currentYear: number | undefined; fundData: FundData;
  hydratedSnapshotKey: string | null | undefined;
  localSources: Record<string, 'manual' | 'wizard2026' | 'system'> | undefined;
  hasPendingDraft: boolean | undefined;
  persistenceBlocked: boolean; hasUnsavedChanges: boolean;
  confirmedVersion?: string | null; reconciliationKey?: number;
  saveState: (data?: FundData, deps?: any, year?: number, entity?: any) => Promise<AnnualSnapshotSaveResult>;
  debounceMs?: number;
}
/** Failure and in-flight state are scoped to the principal and hydration generation. */
export function useFundDataAutosave(props: Props) {
  const latest = useRef(props); latest.current = props;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const failed = useRef<AnnualSnapshotSaveResult | null>(null);
  const scope = JSON.stringify([props.user?.id ?? null, props.currentEntity?.id ?? null,
    props.currentYear ?? null, props.hydratedSnapshotKey ?? null]);
  const generation = useRef({ scope, epoch: 0 });
  if (generation.current.scope !== scope) {
    generation.current = { scope, epoch: generation.current.epoch + 1 }; failed.current = null;
  }
  const active = useRef<{ scope: string; epoch: number; promise: Promise<AnnualSnapshotSaveResult> } | null>(null);
  const previous = useRef({ scope, version: props.confirmedVersion, blocked: props.persistenceBlocked, reconciliationKey: props.reconciliationKey });
  useEffect(() => {
    const p = previous.current;
    if (!props.persistenceBlocked && (p.scope !== scope || p.blocked || p.version !== props.confirmedVersion
      || p.reconciliationKey !== props.reconciliationKey)) failed.current = null;
    previous.current = { scope, version: props.confirmedVersion, blocked: props.persistenceBlocked, reconciliationKey: props.reconciliationKey };
  }, [scope, props.confirmedVersion, props.persistenceBlocked, props.reconciliationKey]);
  const blocked = (): AnnualSnapshotSaveResult => ({ success: false, reason: 'STATE_RECONCILIATION_REQUIRED',
    error: 'La bozza è conservata. Verifica i dati aggiornati prima di proseguire.' });
  const flush = useCallback(async (): Promise<AnnualSnapshotSaveResult> => {
    if (timer.current) { clearTimeout(timer.current); timer.current = null; }
    const captured = { ...generation.current };
    const sameGeneration = () => captured.scope === generation.current.scope && captured.epoch === generation.current.epoch;
    const ongoing = active.current;
    if (ongoing && ongoing.scope === captured.scope && ongoing.epoch === captured.epoch) {
      const result = await ongoing.promise;
      if (!result.success) return result;
    }
    if (!sameGeneration()) return blocked();
    const p = latest.current;
    if (failed.current) return failed.current;
    if (p.persistenceBlocked || p.hasPendingDraft) return blocked();
    if (!p.hasUnsavedChanges) return { success: true, noWrite: true };
    if (!p.user || !p.currentEntity || !p.currentYear
      || p.hydratedSnapshotKey !== p.currentEntity.id + ':' + p.currentYear) return blocked();
    if (p.fundData?.metadata?.snapshotStatus === 'CLOSED') return {
      success: false, reason: 'STATE_CLOSED', error: 'Annualità chiusa: la bozza resta disponibile.' };
    const request = (async (): Promise<AnnualSnapshotSaveResult> => {
      let outcome: AnnualSnapshotSaveResult;
      try {
        outcome = await p.saveState(p.fundData, undefined, p.currentYear, p.currentEntity);
        if (!outcome) outcome = { success: false, reason: 'STATE_OUTCOME_UNKNOWN',
          error: 'Esito non confermato. La bozza è conservata: verifica i dati prima di riprovare.' };
      } catch (technicalCause) {
        outcome = { success: false, reason: 'STATE_OUTCOME_UNKNOWN', technicalCause,
          error: 'Esito non disponibile. La bozza è conservata: verifica i dati prima di riprovare.' };
      }
      // A late failure from A cannot latch a new B session, including A -> B -> A.
      if (!outcome.success && sameGeneration()) failed.current = outcome;
      return outcome;
    })();
    const record = { ...captured, promise: request }; active.current = record;
    try { return await request; }
    finally { if (active.current === record) active.current = null; }
  }, []);
  useEffect(() => {
    if (failed.current || props.persistenceBlocked || props.hasPendingDraft || !props.hasUnsavedChanges
      || props.fundData?.metadata?.snapshotStatus === 'CLOSED') return;
    timer.current = setTimeout(() => { void flush(); }, props.debounceMs ?? 2000);
    return () => { if (timer.current) clearTimeout(timer.current); timer.current = null; };
  }, [scope, props.fundData, props.hasUnsavedChanges, props.persistenceBlocked, props.hasPendingDraft,
    props.confirmedVersion, props.reconciliationKey, props.debounceMs, flush]);
  return { flush };
}
