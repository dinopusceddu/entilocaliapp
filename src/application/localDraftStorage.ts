// src/application/localDraftStorage.ts
import { FundData } from '../domain/types.ts';

export interface DraftMetadata {
  updatedAt: string;
  entityName: string;
  year: number;
}

export interface DraftEnvelope {
  fundData: FundData;
  sources: Record<string, 'manual' | 'wizard2026' | 'system'>;
  metadata: DraftMetadata;
}

/**
 * Genera la chiave univoca per la sessione locale basandosi su utente, ente ed anno.
 */
function getDraftKey(userId: string, entityId: string, year: number): string {
  return `fl_draft_${userId}_${entityId}_${year}`;
}

/**
 * Esegue la migrazione automatica di una chiave da sessionStorage a localStorage se non presente in quest'ultimo.
 */
function migrateDraftKeyToLocalStorage(key: string): void {
  try {
    const sessionVal = sessionStorage.getItem(key);
    if (sessionVal !== null) {
      const localVal = localStorage.getItem(key);
      if (localVal === null) {
        localStorage.setItem(key, sessionVal);
      }
    }
  } catch (e) {
    console.error(`[DraftStorage] Errore di migrazione per la chiave ${key}:`, e);
  }
}

/**
 * Verifica se localStorage è accessibile nel browser corrente (evita crash in navigazione privata).
 */
function isStorageAvailable(): boolean {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Salva una bozza locale nello storage durevole.
 */
export function saveLocalDraft(
  userId: string,
  entityId: string,
  year: number,
  fundData: FundData,
  sources: Record<string, 'manual' | 'wizard2026' | 'system'>,
  entityName: string
): boolean {
  if (!isStorageAvailable()) return false;
  if (!userId || !entityId || !year) return false;

  try {
    const key = getDraftKey(userId, entityId, year);
    const envelope: DraftEnvelope = {
      fundData,
      sources,
      metadata: {
        updatedAt: new Date().toLocaleString('it-IT'),
        entityName,
        year,
      },
    };
    localStorage.setItem(key, JSON.stringify(envelope));
    return true;
  } catch (error) {
    console.error('[DraftStorage] Errore durante il salvataggio della bozza locale:', error);
    return false;
  }
}

/**
 * Carica la busta contenente la bozza locale.
 */
export function loadLocalDraft(userId: string, entityId: string, year: number): DraftEnvelope | null {
  if (!isStorageAvailable()) return null;
  if (!userId || !entityId || !year) return null;

  try {
    const key = getDraftKey(userId, entityId, year);
    migrateDraftKeyToLocalStorage(key);
    const stored = localStorage.getItem(key);
    if (!stored) return null;
    return JSON.parse(stored) as DraftEnvelope;
  } catch (error) {
    console.error('[DraftStorage] Errore durante il caricamento della bozza locale:', error);
    return null;
  }
}

/**
 * Rimuove la bozza locale per l'ente ed anno specificati.
 */
export function clearLocalDraft(userId: string, entityId: string, year: number): boolean {
  if (!isStorageAvailable()) return false;
  if (!userId || !entityId || !year) return false;

  try {
    const key = getDraftKey(userId, entityId, year);
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('[DraftStorage] Errore durante la rimozione della bozza locale:', error);
    return false;
  }
}

/**
 * Controlla se è presente una bozza locale per le coordinate specificate.
 */
export function hasLocalDraft(userId: string, entityId: string, year: number): boolean {
  if (!isStorageAvailable()) return false;
  if (!userId || !entityId || !year) return false;

  const key = getDraftKey(userId, entityId, year);
  migrateDraftKeyToLocalStorage(key);
  return localStorage.getItem(key) !== null;
}

/**
 * Recupera solo i metadati della bozza locale.
 */
export function getLocalDraftMetadata(userId: string, entityId: string, year: number): DraftMetadata | null {
  const envelope = loadLocalDraft(userId, entityId, year);
  return envelope ? envelope.metadata : null;
}
