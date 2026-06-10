import { UserRole } from '../../types';

/**
 * Funzioni pure per la gestione delle policy di autorizzazione e visibilità.
 * Centralizza la logica di business relativa ai permessi, isolandola dai componenti UI.
 */

interface UserAuth {
  role?: UserRole;
}

/**
 * Verifica se l'utente ha privilegi amministrativi globali.
 */
export function isGlobalAdmin(user: UserAuth | null | undefined): boolean {
  return user?.role === UserRole.ADMIN;
}

/**
 * Verifica se l'utente può accedere alle pagine di gestione amministrativa (Utenti, Feedback, etc.)
 */
export function canAccessAdminArea(user: UserAuth | null | undefined): boolean {
  return isGlobalAdmin(user);
}

/**
 * Determina se un modulo deve essere visibile all'utente.
 * @param user Utente autenticato
 * @param adminOnly Se il modulo è riservato agli amministratori
 */
export function canSeeModule(user: UserAuth | null | undefined, adminOnly: boolean): boolean {
  if (!adminOnly) return true;
  return isGlobalAdmin(user);
}

/**
 * Logica per il reducer durante il caricamento dello stato dal DB.
 * Garantisce che il ruolo globale dell'utente (es. ADMIN) non venga sovrascritto 
 * dal ruolo contestuale dell'ente (es. GUEST).
 */
export const resolveRoleOnStateLoad = (currentGlobalRole: UserRole, loadedRole: UserRole): UserRole => {
  // Se l'utente è ADMIN globalmente, preserviamo il ruolo ADMIN.
  // Altrimenti accettiamo il ruolo caricato (che di solito coincide con quello corrente).
  if (currentGlobalRole === UserRole.ADMIN) {
    return UserRole.ADMIN;
  }
  return loadedRole;
};

/**
 * Determina lo scope di visibilità per la lista enti.
 * Gli ADMIN hanno un toggle UI per scegliere tra 'owned' (default) e 'all'.
 * I GUEST vedono sempre e solo i propri enti.
 */
export const getEntityListScope = (
  user: UserAuth | null | undefined,
  showAll = false
): 'owned' | 'all' => {
  if (isGlobalAdmin(user) && showAll) return 'all';
  return 'owned';
};

/**
 * Filtra la lista di enti per il rendering UI in base al ruolo e alla scelta dell'ADMIN.
 *
 * - GUEST (e qualsiasi ruolo non-ADMIN): vede sempre e solo i propri enti.
 * - ADMIN con showAll=false (default): vede solo i propri enti.
 * - ADMIN con showAll=true: vede tutti gli enti caricati dalla RLS.
 *
 * NON modifica la query Supabase: il filtro avviene in memoria sul dato già caricato.
 */
export function filterEntitiesByScope<T extends { user_id: string }>(
  entities: T[],
  user: (UserAuth & { id?: string }) | null | undefined,
  showAll: boolean
): T[] {
  if (!isGlobalAdmin(user)) {
    // Non-ADMIN: sempre e solo i propri enti
    return entities.filter(e => e.user_id === (user as any)?.id);
  }
  // ADMIN: tutti se showAll, altrimenti solo i propri
  if (showAll) return entities;
  return entities.filter(e => e.user_id === (user as any)?.id);
}

/**
 * Indica se la query per il caricamento dati di un ente deve essere filtrata per proprietario.
 */
export const shouldFilterByOwner = (user: UserAuth | null | undefined): boolean => {
  // Se l'utente è ADMIN, non deve filtrare per proprietario (può vedere tutto)
  if (isGlobalAdmin(user)) return false;
  return true;
};
