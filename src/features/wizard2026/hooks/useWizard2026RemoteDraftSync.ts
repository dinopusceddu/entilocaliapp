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

  const isEnabled = useCallback((): boolean => {
    return isWizard2026RemoteDraftsEnabledForUser({ userEmail });
  }, [userEmail]);

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
      const localTimestamp = localStorage.getItem(localTimestampKey);

      if (res.status === 'notFound') {
        // No remote draft exists
        if (localDraft) {
          setSyncStatus('local_only');
        } else {
          setSyncStatus('synced');
        }
        remoteChecksumRef.current = null;
        setRemoteDraftRecord(null);
        return;
      }

      // Success: Remote record found
      const record = res.data;
      setRemoteDraftRecord(record);

      if (!record || record.deleted_at) {
        if (localDraft) {
          setSyncStatus('local_only');
        } else {
          setSyncStatus('synced');
        }
        remoteChecksumRef.current = null;
        return;
      }

      // Load last_transfer if present and no local last_transfer exists
      const localLastTransferKey = `fl_wizard2026_last_transfer_${userId}_${entityId}_${year}`;
      if (record.last_transfer && !localStorage.getItem(localLastTransferKey) && onHydrateLastTransfer) {
        localStorage.setItem(localLastTransferKey, JSON.stringify(record.last_transfer));
        onHydrateLastTransfer(record.last_transfer);
      }

      if (record.draft_state && !isValidDraftPayload(record.draft_state)) {
        console.warn('[useWizard2026RemoteDraftSync] Remote draft payload has invalid shape:', record.draft_state);
        setSyncStatus('invalid_remote_draft');
        remoteChecksumRef.current = null;
        return;
      }

      const remoteChecksum = record.checksum || (record.draft_state ? calculateStringChecksum(JSON.stringify(record.draft_state)) : null);
      remoteChecksumRef.current = remoteChecksum;
      setLastRemoteSave(record.updated_at);

      if (!record.draft_state) {
        // Remote draft is empty (e.g. cleared after transfer)
        if (localDraft) {
          setSyncStatus('local_newer');
        } else {
          setSyncStatus('synced');
        }
        return;
      }

      // Both exist
      if (!localDraft) {
        // Only remote exists -> hydrate it locally
        onHydrate(record.draft_state);
        localStorage.setItem(`fl_wizard2026_draft_${userId}_${entityId}_${year}`, JSON.stringify(record.draft_state));
        localStorage.setItem(localTimestampKey, record.updated_at);
        setSyncStatus('synced');
        return;
      }

      // Compare draft checksums
      const localChecksum = calculateStringChecksum(JSON.stringify(localDraft));
      if (localChecksum === remoteChecksum) {
        setSyncStatus('synced');
        // Align timestamps if they differ
        if (localTimestamp !== record.updated_at) {
          localStorage.setItem(localTimestampKey, record.updated_at);
        }
        return;
      }

      // Different contents: resolve by timestamps
      if (!localTimestamp) {
        // Missing local timestamp -> remote is newer
        setSyncStatus('remote_newer');
      } else {
        const localTime = new Date(localTimestamp).getTime();
        const remoteTime = new Date(record.updated_at).getTime();

        if (localTime > remoteTime) {
          setSyncStatus('local_newer');
        } else if (remoteTime > localTime) {
          setSyncStatus('remote_newer');
        } else {
          setSyncStatus('conflict');
        }
      }
    } catch (err) {
      console.error('[useWizard2026RemoteDraftSync] Initialization error:', err);
      setIsOffline(true);
      setSyncStatus('error');
    } finally {
      isInitializingRef.current = false;
    }
  }, [userId, entityId, year, localDraft, onHydrate, onHydrateLastTransfer, isEnabled, userEmail]);

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

    // Do not overwrite during active conflicts or if remote is newer
    if (
      syncStatus === 'conflict' ||
      syncStatus === 'remote_newer' ||
      syncStatus === 'disabled'
    ) {
      return;
    }

    const localChecksum = calculateStringChecksum(JSON.stringify(localDraft));
    if (remoteChecksumRef.current === localChecksum) {
      return;
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
        deleted_at: null // clear soft-delete on edit
      }, userEmail);

      setIsSavingRemote(false);
      if (res.status === 'success') {
        setSyncStatus('synced');
        setLastRemoteSave(nowStr);
        remoteChecksumRef.current = localChecksum;
        setIsOffline(false);
      } else if (res.status === 'error') {
        setIsOffline(true);
        setSyncStatus('error');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [localDraft, userId, entityId, year, syncStatus, isEnabled, userEmail]);

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
      setSyncStatus('synced');
      setLastRemoteSave(nowStr);
      remoteChecksumRef.current = localChecksum;
      setIsOffline(false);
    } else {
      setIsOffline(true);
      setSyncStatus('error');
    }
  }, [userId, entityId, year, localDraft, userEmail]);

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

      onHydrate(remoteDraft);

      const localDraftKey = `fl_wizard2026_draft_${userId}_${entityId}_${year}`;
      localStorage.setItem(localDraftKey, JSON.stringify(remoteDraft));

      const localTimestampKey = `fl_wizard2026_draft_updated_at_${userId}_${entityId}_${year}`;
      localStorage.setItem(localTimestampKey, res.data.updated_at);

      setSyncStatus('synced');
      setLastRemoteSave(res.data.updated_at);
      remoteChecksumRef.current = res.data.checksum || calculateStringChecksum(JSON.stringify(remoteDraft));
      setIsOffline(false);
    } else if (res.status === 'error') {
      setIsOffline(true);
      setSyncStatus('error');
    }
  }, [userId, entityId, year, onHydrate, userEmail]);

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
    forceRefresh: initializeSync
  };
}

