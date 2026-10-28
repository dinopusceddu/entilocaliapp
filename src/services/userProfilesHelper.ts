import { supabase } from './supabase';

export interface UserProfileSummary {
  name: string;
  email: string;
}

let profilesCache: Record<string, UserProfileSummary> | null = null;

/**
 * Helper per il caricamento e caching in memoria della mappa profili utente.
 * Centralizza la query Supabase 'profiles' per evitare chiamate duplicate tra i componenti UI.
 * In una successiva fase di refactoring architetturale, questa chiamata verrà veicolata
 * attraverso la porta IUserRepository.
 */
export async function fetchUserProfilesMap(): Promise<Record<string, UserProfileSummary>> {
  if (profilesCache) {
    return profilesCache;
  }
  try {
    const { data } = await supabase.from('profiles').select('id, full_name, email');
    const map: Record<string, UserProfileSummary> = {};
    if (data) {
      data.forEach(p => {
        map[p.id] = {
          name: p.full_name || p.email?.split('@')[0] || 'Utente',
          email: p.email || ''
        };
      });
    }
    profilesCache = map;
    return map;
  } catch (err) {
    console.warn('[userProfilesHelper] Impossibile caricare profili:', err);
    return {};
  }
}

export function clearUserProfilesCache() {
  profilesCache = null;
}
