import { useState, useEffect, useRef, useCallback } from 'react';
import { Wizard2026DraftState } from '../types';
import {
  Wizard2026SyncStatus,
  Wizard2026RemoteDraftRecord,
  Wizard2026LastTransferPayload
} from '../remoteDraft/types';
import { SupabaseWizard2026DraftRepository } from '../../../application/wizard2026RemoteDraftRepository';
import { isWizard2026RemoteDraftsEnabledForUser } from '../remoteDraft/config';
import { isValidDraftPayload } from '../remoteDraft/validation';

const repository = new SupabaseWizard2026DraftRepository();

function calculateStringChecksum(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return hash.toString(16);
}

interface UseWizard2026RemoteDraftSyncProps {
  userId: string | undefined;
  entityId: string | undefined;
  year: number;
  localDraft: Wizard2026DraftState | null;
  onHydrate: (draft: Wizard2026DraftState) => void;
  onHydrateLastTransfer?: (lastTransfer: Wizard2026LastTransferPayload) => void;
  userEmail?: string | null;
}

export function useWizard2026RemoteDraftSync({
  userId,
  entityId,
  year,
  localDraft,
  onHydrate,
  onHydrateLastTransfer,
  userEmail
}: UseWizard2026RemoteDraftSyncProps) {
  const [syncStatus, setSyncStatus] = useState<Wizard2026SyncStatus>('disabled');
  const [lastRemoteSave, setLastRemoteSave] = useState<string | null>(null);
  const [isSavingRemote, setIsSavingRemote] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [remoteDraftRecord, setRemoteDraftRecord] = useState<Wizard2026RemoteDraftRecord | null>(null);

  const remoteChecksumRef = useRef<string | null>(null);
  const isInitializingRef = useRef(false);
  const isHydratingFromCloudRef = useRef(false);
  const activeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isEnabled = useCallback((): boolean => {
    return isWizard2026RemoteDraftsEnabledForUser({ userEmail });
  }, [userEmail]);

  // Metadata accessors
  const getMetaPrefix = useCallback(() => {
    return `fl_w26_${userId}_${entityId}_${year}`;
  }, [userId, entityId, year]);

  const getMeta = useCallback((key: string): string | null => {
    return localStorage.getItem(`${getMetaPrefix()}_${key}`);
  }, [getMetaPrefix]);

  const setMeta = useCallback((key: string, val: string) => {
    localStorage.setItem(`${getMetaPrefix()}_${key}`, val);
  }, [getMetaPrefix]);

  const removeMeta = useCallback((key: string) => {
    localStorage.removeItem(`${getMetaPrefix()}_${key}`);
  }, [getMetaPrefix]);

  // --- Initial loading and comparison ---
  const initializeSync = useCallback(async () => {
    if (!isEnabled()) {
      setSyncStatus('disabled');
      return;
    }

    if (!userId || !entityId) {
      setSyncStatus('disabled');
      return;
    }

    isInitializingRef.current = true;
    try {
      const res = await repository.loadWizard2026RemoteDraft(userId, entityId, year, userEmail);

      if (res.status === 'disabled') {
        setSyncStatus('disabled');
        return;
      }

      if (res.status === 'error') {
        setIsOffline(true);
        setSyncStatus('error');
        return;
      }

      setIsOffline(false);

      const localTimestampKey = `fl_wizard2026_draft_updated_at_${userId}_${entityId}_${year}`;
      const localDraftKey = `fl_wizard2026_draft_${userId}_${entityId}_${year}`;

      const isDirty = getMeta('dirty') === 'true';
      const lastRemoteChecksum = getMeta('lastRemoteChecksum');
      const lastRemoteUpdatedAt = getMeta('lastRemoteUpdatedAt');

      if (res.status === 'notFound') {
        // No remote draft exists
        setMeta('lastHydrationSource', localDraft ? 'local' : 'none');
        if (localDraft) {
          setSyncStatus('local_only');
          if (!isDirty) {
            // Local is clean cache, align checksum to prevent unwanted immediate autosave
            remoteChecksumRef.current = calculateStringChecksum(JSON.stringify(localDraft));
          } else {
            remoteChecksumRef.current = null;
          }
        } else {
          setSyncStatus('synced');
          remoteChecksumRef.current = null;
        }
        setRemoteDraftRecord(null);
        return;
      }

      // Success: Remote record found
      const record = res.data;
      setRemoteDraftRecord(record);

      if (!record || record.deleted_at) {
        setMeta('lastHydrationSource', localDraft ? 'local' : 'none');
        if (localDraft) {
          setSyncStatus('local_only');
          if (!isDirty) {
            remoteChecksumRef.current = calculateStringChecksum(JSON.stringify(localDraft));
          } else {
            remoteChecksumRef.current = null;
          }
        } else {
          setSyncStatus('synced');
          remoteChecksumRef.current = null;
        }
        return;
      }

      // Load last_transfer if present and no local last_transfer exists
      const localLastTransferKey = `fl_wizard2026_last_transfer_${userId}_${entityId}_${year}`;
      if (record.last_transfer && !localStorage.getItem(localLastTransferKey) && onHydrateLastTransfer) {
        localStorage.setItem(localLastTransferKey, JSON.stringify(record.last_transfer));
        onHydrateLastTransfer(record.last_transfer);
      }

      if (record.draft_state && !isValidDraftPayload(record.draft_state)) {
        console.warn('[useWizard2026RemoteDraftSync] Remote draft payload has invalid shape', {
          recordId: record.id,
          userId: record.user_id,
          entityId: record.entity_id,
          year: record.year,
          schemaVersion: record.schema_version,
          updatedAt: record.updated_at,
        });
        setSyncStatus('invalid_remote_draft');
        remoteChecksumRef.current = null;
        return;
      }

      const remoteChecksum = record.checksum || (record.draft_state ? calculateStringChecksum(JSON.stringify(record.draft_state)) : null);
      remoteChecksumRef.current = remoteChecksum;
      setLastRemoteSave(record.updated_at);

      if (!record.draft_state) {
        // Remote draft is empty
        if (localDraft) {
          if (!isDirty) {
            remoteChecksumRef.current = calculateStringChecksum(JSON.stringify(localDraft));
            setSyncStatus('synced');
          } else {
            setSyncStatus('local_newer');
          }
        } else {
          setSyncStatus('synced');
        }
        return;
      }

      const localChecksum = localDraft ? calculateStringChecksum(JSON.stringify(localDraft)) : null;

      // Cloud hydration: Cloud is primary unless local is explicitly marked dirty and has changes
      if (!isDirty || !localDraft) {
        // Guard anti-loop: se abbiamo già idratato da cloud in questa sessione
        // e il draft locale è cambiato (l'utente ha navigato/modificato dopo l'idratazione),
        // NON re-idratare. Trattiamo il draft locale come "più recente" (local_newer).
        // Senza questa guardia, ogni cambio di localDraft (es. goNext) rieseguiva initializeSync
        // e sovrascriveva il currentStep → navigazione bloccata.
        const lastHydrationSource = getMeta('lastHydrationSource');
        if (
          localDraft &&
          localChecksum !== remoteChecksum &&
          lastHydrationSource === 'cloud'
        ) {
          // L'utente ha modificato il draft dopo l'idratazione cloud.
          // Non re-idratare: mark dirty e imposta local_newer.
          setMeta('dirty', 'true');
          if (!getMeta('localDirtySince')) {
            setMeta('localDirtySince', new Date().toISOString());
          }
          setSyncStatus('local_newer');
          return;
        }

        // Automatically hydrate from cloud
        isHydratingFromCloudRef.current = true;
        onHydrate(record.draft_state);
        localStorage.setItem(localDraftKey, JSON.stringify(record.draft_state));
        localStorage.setItem(localTimestampKey, record.updated_at);

        setMeta('dirty', 'false');
        setMeta('lastRemoteChecksum', remoteChecksum || '');
        setMeta('lastRemoteUpdatedAt', record.updated_at);
        setMeta('lastSuccessfulSyncAt', new Date().toISOString());
        setMeta('lastHydrationSource', 'cloud');

        setSyncStatus('synced');
        return;
      }

      // Local is dirty: compare local checksum and check remote changes
      if (localChecksum === remoteChecksum) {
        setMeta('dirty', 'false');
        setMeta('lastRemoteChecksum', remoteChecksum || '');
        setMeta('lastRemoteUpdatedAt', record.updated_at);
        setMeta('lastSuccessfulSyncAt', new Date().toISOString());
        setMeta('lastHydrationSource', 'cloud');
        setSyncStatus('synced');
        return;
      }

      // Check if remote has changed since our last sync
      const remoteChanged = record.checksum !== lastRemoteChecksum || record.updated_at !== lastRemoteUpdatedAt;
      if (remoteChanged) {
        setSyncStatus('conflict');
      } else {
        setSyncStatus('local_newer');
      }
    } catch (err) {
      console.error('[useWizard2026RemoteDraftSync] Initialization error:', err);
      setIsOffline(true);
      setSyncStatus('error');
    } finally {
      isInitializingRef.current = false;
    }
  }, [userId, entityId, year, localDraft, onHydrate, onHydrateLastTransfer, isEnabled, userEmail, getMeta, setMeta]);

  // Run initialization on mount or when context keys change
  useEffect(() => {
    initializeSync();
  }, [userId, entityId, year, userEmail, initializeSync]);

  // --- Autosave local changes to remote ---
  useEffect(() => {
    if (!isEnabled()) return;
    if (!userId || !entityId) return;
    if (!localDraft) return;
    if (isInitializingRef.current) return;

    if (isHydratingFromCloudRef.current) {
      isHydratingFromCloudRef.current = false;
      return;
    }

    // Do not overwrite during active conflicts
    if (syncStatus === 'conflict' || syncStatus === 'disabled') {
      return;
    }

    const localChecksum = calculateStringChecksum(JSON.stringify(localDraft));
    if (remoteChecksumRef.current === localChecksum) {
      return;
    }

    // Set dirty
    setMeta('dirty', 'true');
    if (!getMeta('localDirtySince')) {
      setMeta('localDirtySince', new Date().toISOString());
    }

    if (syncStatus === 'synced' || syncStatus === 'local_only') {
      setSyncStatus('local_newer');
    }

    const timer = setTimeout(async () => {
      setIsSavingRemote(true);
      const nowStr = new Date().toISOString();

      const localTimestampKey = `fl_wizard2026_draft_updated_at_${userId}_${entityId}_${year}`;
      localStorage.setItem(localTimestampKey, nowStr);

      const res = await repository.upsertWizard2026RemoteDraft(userId, entityId, year, {
        draft_state: localDraft,
        checksum: localChecksum,
        schema_version: 1,
        deleted_at: null
      }, userEmail);

      setIsSavingRemote(false);
      if (res.status === 'success') {
        setMeta('dirty', 'false');
        removeMeta('localDirtySince');
        setMeta('lastRemoteChecksum', localChecksum);
        setMeta('lastRemoteUpdatedAt', nowStr);
        setMeta('lastSuccessfulSyncAt', nowStr);

        setSyncStatus('synced');
        setLastRemoteSave(nowStr);
        remoteChecksumRef.current = localChecksum;
        setIsOffline(false);
      } else if (res.status === 'error') {
        setIsOffline(true);
        setSyncStatus('error');
      }
      activeTimerRef.current = null;
    }, 2000);

    activeTimerRef.current = timer;

    return () => {
      clearTimeout(timer);
      activeTimerRef.current = null;
    };
  }, [localDraft, userId, entityId, year, syncStatus, isEnabled, userEmail, setMeta, getMeta, getMetaPrefix, removeMeta]);

  // --- Manual sync functions ---
  const uploadLocal = useCallback(async () => {
    if (!userId || !entityId || !localDraft) return;
    setIsSavingRemote(true);
    const nowStr = new Date().toISOString();
    const localChecksum = calculateStringChecksum(JSON.stringify(localDraft));

    const localTimestampKey = `fl_wizard2026_draft_updated_at_${userId}_${entityId}_${year}`;
    localStorage.setItem(localTimestampKey, nowStr);

    const res = await repository.upsertWizard2026RemoteDraft(userId, entityId, year, {
      draft_state: localDraft,
      checksum: localChecksum,
      schema_version: 1,
      deleted_at: null
    }, userEmail);

    setIsSavingRemote(false);
    if (res.status === 'success') {
      setMeta('dirty', 'false');
      localStorage.removeItem(`${getMetaPrefix()}_localDirtySince`);
      setMeta('lastRemoteChecksum', localChecksum);
      setMeta('lastRemoteUpdatedAt', nowStr);
      setMeta('lastSuccessfulSyncAt', nowStr);

      setSyncStatus('synced');
      setLastRemoteSave(nowStr);
      remoteChecksumRef.current = localChecksum;
      setIsOffline(false);
    } else {
      setIsOffline(true);
      setSyncStatus('error');
    }
  }, [userId, entityId, year, localDraft, userEmail, setMeta, getMetaPrefix]);

  const downloadRemote = useCallback(async () => {
    if (!userId || !entityId) return;
    const res = await repository.loadWizard2026RemoteDraft(userId, entityId, year, userEmail);
    if (res.status === 'success' && res.data && res.data.draft_state) {
      const remoteDraft = res.data.draft_state;

      if (!isValidDraftPayload(remoteDraft)) {
        console.warn('[useWizard2026RemoteDraftSync] Cannot download remote draft: invalid shape');
        setSyncStatus('invalid_remote_draft');
        remoteChecksumRef.current = null;
        return;
      }

      isHydratingFromCloudRef.current = true;
      onHydrate(remoteDraft);

      const localDraftKey = `fl_wizard2026_draft_${userId}_${entityId}_${year}`;
      localStorage.setItem(localDraftKey, JSON.stringify(remoteDraft));

      const localTimestampKey = `fl_wizard2026_draft_updated_at_${userId}_${entityId}_${year}`;
      localStorage.setItem(localTimestampKey, res.data.updated_at);

      setMeta('dirty', 'false');
      localStorage.removeItem(`${getMetaPrefix()}_localDirtySince`);
      setMeta('lastRemoteChecksum', res.data.checksum || calculateStringChecksum(JSON.stringify(remoteDraft)));
      setMeta('lastRemoteUpdatedAt', res.data.updated_at);
      setMeta('lastSuccessfulSyncAt', new Date().toISOString());
      setMeta('lastHydrationSource', 'cloud');

      setSyncStatus('synced');
      setLastRemoteSave(res.data.updated_at);
      remoteChecksumRef.current = res.data.checksum || calculateStringChecksum(JSON.stringify(remoteDraft));
      setIsOffline(false);
    } else if (res.status === 'error') {
      setIsOffline(true);
      setSyncStatus('error');
    }
  }, [userId, entityId, year, onHydrate, userEmail, setMeta, getMetaPrefix]);

  const resolveConflict = useCallback(async (choice: 'local' | 'remote') => {
    if (choice === 'local') {
      await uploadLocal();
    } else {
      await downloadRemote();
    }
  }, [uploadLocal, downloadRemote]);

  const uploadLastTransfer = useCallback(async (transferPayload: Wizard2026LastTransferPayload) => {
    if (!isEnabled()) return;
    if (!userId || !entityId) return;

    try {
      await repository.upsertWizard2026RemoteDraft(userId, entityId, year, {
        last_transfer: transferPayload,
        draft_state: null, // Clear active draft upon transfer
        deleted_at: null
      }, userEmail);
      setSyncStatus('synced');
      remoteChecksumRef.current = null;
    } catch (err) {
      console.error('[useWizard2026RemoteDraftSync] Error saving last transfer:', err);
    }
  }, [userId, entityId, year, isEnabled, userEmail]);

  const deleteRemoteDraft = useCallback(async () => {
    if (!isEnabled()) return;
    if (!userId || !entityId) return;

    try {
      await repository.deleteWizard2026RemoteDraft(userId, entityId, year, userEmail);
      setSyncStatus('synced');
      remoteChecksumRef.current = null;
    } catch (err) {
      console.error('[useWizard2026RemoteDraftSync] Error deleting remote draft:', err);
    }
  }, [userId, entityId, year, isEnabled, userEmail]);

  return {
    syncStatus,
    lastRemoteSave,
    isSavingRemote,
    isOffline,
    remoteDraftRecord,
    uploadLocal,
    downloadRemote,
    resolveConflict,
    uploadLastTransfer,
    deleteRemoteDraft,
    forceRefresh: initializeSync,
    lastHydrationSource: getMeta('lastHydrationSource')
  };
}

