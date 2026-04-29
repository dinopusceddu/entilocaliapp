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
 * Per ora restituisce sempre 'owned', ma è predisposto per consentire 'all' agli ADMIN in futuro.
 */
export const getEntityListScope = (_user: UserAuth | null | undefined): 'owned' | 'all' => {
  // Per ora, anche gli admin vedono solo i propri enti nella lista standard "Enti e Annualità"
  // per evitare confusione. Un'altra pagina (UserManagement) gestisce la visione globale.
  return 'owned';
};

/**
 * Indica se la query per il caricamento dati di un ente deve essere filtrata per proprietario.
 */
export const shouldFilterByOwner = (user: UserAuth | null | undefined): boolean => {
  // Se l'utente è ADMIN, non deve filtrare per proprietario (può vedere tutto)
  if (isGlobalAdmin(user)) return false;
  return true;
};
