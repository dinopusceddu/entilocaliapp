import { useEffect, useRef, useCallback } from 'react';
import { FundData } from '../domain';

function calculateStringChecksum(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return hash.toString(16);
}

interface UseFundDataAutosaveProps {
  user: any;
  currentEntity: any;
  currentYear: number | undefined;
  fundData: FundData;
  hydratedSnapshotKey: string | null | undefined;
  localSources: Record<string, 'manual' | 'wizard2026' | 'system'> | undefined;
  hasPendingDraft: boolean | undefined;
  saveState: (
    fundDataOverride?: FundData,
    overriddenDeps?: any,
    yearOverride?: number,
    entityOverride?: any
  ) => Promise<void>;
  debounceMs?: number;
}

export function useFundDataAutosave({
  user,
  currentEntity,
  currentYear,
  fundData,
  hydratedSnapshotKey,
  localSources,
  hasPendingDraft,
  saveState,
  debounceMs = 2000,
}: UseFundDataAutosaveProps) {
  const stateRef = useRef({
    user,
    currentEntity,
    currentYear,
    fundData,
    hydratedSnapshotKey,
    localSources,
    hasPendingDraft,
  });

  // Keep state ref in sync
  useEffect(() => {
    stateRef.current = {
      user,
      currentEntity,
      currentYear,
      fundData,
      hydratedSnapshotKey,
      localSources,
      hasPendingDraft,
    };
  });

  const lastSavedChecksumRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSavingRef = useRef<boolean>(false);
  const pendingSaveRef = useRef<boolean>(false);
  const activeSavePromiseRef = useRef<Promise<void> | null>(null);

  const currentChecksum = calculateStringChecksum(JSON.stringify(fundData));

  // Initialize or reset checksum refs when entity/year or hydration status changes
  useEffect(() => {
    if (hydratedSnapshotKey) {
      lastSavedChecksumRef.current = currentChecksum;
    } else {
      lastSavedChecksumRef.current = null;
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, [hydratedSnapshotKey]);

  // Main autosave logic
  useEffect(() => {
    // Guards
    if (!user || !currentEntity || !currentYear || !hydratedSnapshotKey) return;
    if (hasPendingDraft) return;
    if (fundData?.metadata?.snapshotStatus === 'CLOSED') return;

    // Check if the current context matches the hydration context
    const currentContextKey = `${currentEntity.id}:${currentYear}`;
    if (hydratedSnapshotKey !== currentContextKey) return;

    // Detect if we actually have manual changes in localSources to avoid saving default state before user action
    const hasManualChanges = Object.keys(localSources || {}).some(
      (key) => localSources?.[key] === 'manual' || localSources?.[key] === 'wizard2026'
    );
    if (!hasManualChanges) return;

    // Check if data actually changed since last success save
    if (lastSavedChecksumRef.current === currentChecksum) return;

    // Debounce the save operation
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(async () => {
      // If a save is already in progress, mark as pending and exit
      if (isSavingRef.current) {
        pendingSaveRef.current = true;
        return;
      }

      const executeSave = async () => {
        isSavingRef.current = true;
        pendingSaveRef.current = false;
        
        // Capture context at scheduling time
        const saveContextKey = `${stateRef.current.currentEntity?.id}:${stateRef.current.currentYear}`;
        const saveEntity = stateRef.current.currentEntity;
        const saveYear = stateRef.current.currentYear;
        const payloadToSave = stateRef.current.fundData;
        const payloadChecksum = calculateStringChecksum(JSON.stringify(payloadToSave));

        // Double check context matches right before save
        const latestContextKey = `${stateRef.current.currentEntity?.id}:${stateRef.current.currentYear}`;
        if (saveContextKey !== latestContextKey || stateRef.current.hydratedSnapshotKey !== latestContextKey) {
          console.warn('[FundDataAutosave] Save skipped: context changed since debounce started.');
          isSavingRef.current = false;
          return;
        }

        const savePromise = (async () => {
          try {
            await saveState(payloadToSave, undefined, saveYear, saveEntity);
            lastSavedChecksumRef.current = payloadChecksum;
          } catch (error) {
            console.error('[FundDataAutosave] Autosave failed:', error);
          }
        })();

        activeSavePromiseRef.current = savePromise;
        try {
          await savePromise;
        } finally {
          activeSavePromiseRef.current = null;
          isSavingRef.current = false;
          if (pendingSaveRef.current) {
            await executeSave();
          }
        }
      };

      await executeSave();
    }, debounceMs);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [
    currentChecksum,
    user,
    currentEntity,
    currentYear,
    hydratedSnapshotKey,
    hasPendingDraft,
    localSources,
    saveState,
    debounceMs
  ]);

  // Flush is stable as it reads from stateRef
  const flush = useCallback(async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // Wait for active save to complete if any
    if (activeSavePromiseRef.current) {
      await activeSavePromiseRef.current;
    }

    const {
      user: u,
      currentEntity: ce,
      currentYear: cy,
      fundData: fd,
      hydratedSnapshotKey: hsk,
      localSources: ls,
      hasPendingDraft: hpd,
    } = stateRef.current;

    if (!u || !ce || !cy || !hsk || hpd) return;
    if (fd?.metadata?.snapshotStatus === 'CLOSED') return;

    // Check context matches hydration key
    const currentContextKey = `${ce.id}:${cy}`;
    if (hsk !== currentContextKey) return;

    const hasManualChanges = Object.keys(ls || {}).some(
      (key) => ls?.[key] === 'manual' || ls?.[key] === 'wizard2026'
    );
    if (!hasManualChanges) return;

    const checkSum = calculateStringChecksum(JSON.stringify(fd));
    if (lastSavedChecksumRef.current === checkSum) return;

    isSavingRef.current = true;
    const savePromise = (async () => {
      try {
        await saveState(fd, undefined, cy, ce);
        lastSavedChecksumRef.current = checkSum;
      } catch (error) {
        console.error('[FundDataAutosave] Flush failed:', error);
      }
    })();

    activeSavePromiseRef.current = savePromise;
    try {
      await savePromise;
    } finally {
      activeSavePromiseRef.current = null;
      isSavingRef.current = false;
    }
  }, [saveState]);

  // Flush on visibilitychange / beforeunload
  useEffect(() => {
    const handleBeforeUnload = () => {
      flush();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        flush();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [flush]);

  return { flush };
}
