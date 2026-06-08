# MOD-037C1 — Patch allowlist utenti per attivazione controllata persistenza remota Wizard 2026

## File Modificati / Aggiunti

- **Nuovo helper**: [config.ts](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/features/wizard2026/remoteDraft/config.ts) (contiene la funzione `isWizard2026RemoteDraftsEnabledForUser`)
- **Variabili d'ambiente**: [.env.example](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/.env.example)
- **Modifiche core**:
  - [useWizard2026Draft.ts](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/features/wizard2026/hooks/useWizard2026Draft.ts)
  - [useWizard2026RemoteDraftSync.ts](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/features/wizard2026/hooks/useWizard2026RemoteDraftSync.ts)
  - [Wizard2026SyncStatusBadge.tsx](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/features/wizard2026/components/Wizard2026SyncStatusBadge.tsx)
  - [Wizard2026PreviewPage.tsx](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/features/wizard2026/components/Wizard2026PreviewPage.tsx)
  - [IWizard2026DraftRepository.ts](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/application/ports/IWizard2026DraftRepository.ts)
  - [wizard2026RemoteDraftRepository.ts](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/application/wizard2026RemoteDraftRepository.ts)
- **File di test aggiornati**:
  - [wizard2026RemoteDraftRepository.test.ts](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/application/__tests__/wizard2026RemoteDraftRepository.test.ts)
  - [wizard2026RemoteDraftSync.test.ts](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/features/wizard2026/__tests__/wizard2026RemoteDraftSync.test.ts)

---

## Helper Introdotto

La funzione `isWizard2026RemoteDraftsEnabledForUser` è definita centralmente in `src/features/wizard2026/remoteDraft/config.ts`:

```typescript
export function isWizard2026RemoteDraftsEnabledForUser({
  userEmail
}: {
  userEmail?: string | null;
}): boolean {
  const globallyEnabled =
    import.meta.env.VITE_ENABLE_WIZARD2026_REMOTE_DRAFTS === 'true';

  if (!globallyEnabled) return false;

  const allowedEmailsRaw =
    import.meta.env.VITE_WIZARD2026_REMOTE_DRAFTS_ALLOWED_EMAILS || '';

  const allowedEmails = allowedEmailsRaw
    .split(',')
    .map((email: string) => email.trim().toLowerCase())
    .filter(Boolean);

  if (allowedEmails.length === 0) return false;

  const normalizedUserEmail = userEmail?.trim().toLowerCase();

  return !!normalizedUserEmail && allowedEmails.includes(normalizedUserEmail);
}
```

---

## Comportamenti Verificati

### 1. Comportamento con Flag Globale Spento (`VITE_ENABLE_WIZARD2026_REMOTE_DRAFTS=false`)
- **Funzionalità**: Completamente spenta per tutti gli utenti, indipendentemente dalla presenza del loro indirizzo email nella allowlist.
- **UI**: Il badge cloud non viene renderizzato (ritorna `null`).
- **Rete**: Nessuna chiamata Supabase al database remoto viene effettuata (ritorna stato `disabled` a livello repository ed hook).

### 2. Comportamento con Flag Globale Acceso e Allowlist Vuota
- **Funzionalità**: Spenta per tutti gli utenti.
- **Prudenza**: Nessun fallback automatico sugli utenti ADMIN. Se la lista è vuota, nessuno è autorizzato.
- **UI & Rete**: Equivalente a flag spento.

### 3. Comportamento con Utente Autorizzato (Email presente in allowlist)
- **Funzionalità**: Sincronizzazione remota completamente attiva.
- **UI**: Badge di sincronizzazione visibile con stati (es. "Bozza salvata sul cloud", "Bozza locale più recente", ecc.).
- **Rete**: Esegue correttamente le chiamate a `loadWizard2026RemoteDraft`, `upsertWizard2026RemoteDraft`, `deleteWizard2026RemoteDraft`, ecc. su Supabase.
- **Autosave**: Autosave remoto abilitato e funzionante (intervallo di debounce collaudato).

### 4. Comportamento con Utente Non Autorizzato (Email non presente in allowlist o mancante)
- **Funzionalità**: Spenta. I dati sono persistiti esclusivamente nel `localStorage` del browser.
- **UI**: Nessun badge cloud visibile.
- **Rete**: Le chiamate remote vengono bypassate lato client a monte e non raggiungono mai la tabella `wizard2026_drafts`.

---

## Esito Test Automatici

Tutte le suite di test sono state eseguite con successo.
I test specifici per la sincronizzazione remota e per il repository includono ora i casi d'uso:
1. Flag globale `false` + email in lista → `disabled`
2. Flag globale `true` + lista vuota → `disabled`
3. Flag globale `true` + email non in lista → `disabled`
4. Flag globale `true` + email in lista → `enabled`
5. Case-insensitivity (confronto email maiuscolo/minuscolo) → superato
6. Trimming degli spazi (spazi intorno alle email in allowlist o all'input dell'utente) → superato
7. Assenza email utente → `disabled`
8. Bypassing delle chiamate a Supabase per utenti non autorizzati.

**Totale Test superati**: 402/402 test.
**Verifica Tipi**: `npx tsc --noEmit` completato con successo senza errori.
**Build Produzione**: `npm run build` completato con successo.

---

## Dichiarazione di Conformità ai Vincoli di Sicurezza

Confermo sotto la mia responsabilità che per questo task:
- [x] **Non** sono state eseguite query SQL o migrazioni database in staging o produzione.
- [x] **Non** è stato effettuato alcun deploy.
- [x] **Non** è stata modificata alcuna configurazione o variabile d'ambiente su Cloudflare.
- [x] **Non** sono state alterate le tabelle core (`user_app_state`, `profiles`, ecc.).
- [x] **Non** sono stati commessi o pushati i file locali né create Pull Request su GitHub (in attesa di autorizzazione successiva).
- [x] I file locali di configurazione sensibili (`.env`, `.env.local`, `.env.production`) **non** sono stati modificati o tracciati.
