# Report MOD-037B1-REVIEW — Audit Pre-Migrazione Persistenza Remota Wizard 2026

**Data:** 2026-06-02  
**Versione:** Beta 1.3 (post-MOD-036C-FIX1)  
**Stato:** ✅ COMPLETATO (Scaffolding locale verificato, pronto per PR e migrazione DB)  
**Autore:** Antigravity AI  

---

## 1. Esito Generale

L'audit pre-migrazione ha dato **esito positivo al 100%**. Lo scaffolding architetturale implementato in MOD-037B1 è sicuro, ben isolato, coperto da test unitari ed integrati ed è governato da un feature flag impostato a `false`. 
Nessuna risorsa remota (database Supabase, hosting Cloudflare, repository Git remoto) è stata in alcun modo modificata o alterata durante questa analisi.

---

## 2. Elenco File Modificati e Nuovi

### Nuovi File (Scaffolding e Test):
- [20260602000000_create_wizard2026_drafts.sql](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/supabase/migrations/20260602000000_create_wizard2026_drafts.sql)
- [types.ts](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/features/wizard2026/remoteDraft/types.ts)
- [wizard2026RemoteDraftRepository.ts](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/application/wizard2026RemoteDraftRepository.ts)
- [IWizard2026DraftRepository.ts](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/application/ports/IWizard2026DraftRepository.ts)
- [useWizard2026RemoteDraftSync.ts](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/features/wizard2026/hooks/useWizard2026RemoteDraftSync.ts)
- [Wizard2026SyncStatusBadge.tsx](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/features/wizard2026/components/Wizard2026SyncStatusBadge.tsx)
- [wizard2026RemoteDraftRepository.test.ts](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/application/__tests__/wizard2026RemoteDraftRepository.test.ts)
- [wizard2026RemoteDraftSync.test.ts](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/features/wizard2026/__tests__/wizard2026RemoteDraftSync.test.ts)

### File Modificati:
- [.env.example](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/.env.example)
- [.env](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/.env) (locale)
- [index.ts (ports)](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/application/ports/index.ts)
- [index.ts (components)](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/features/wizard2026/components/index.ts)
- [useWizard2026Draft.ts](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/features/wizard2026/hooks/useWizard2026Draft.ts)
- [Wizard2026PreviewPage.tsx](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/features/wizard2026/components/Wizard2026PreviewPage.tsx)
- [MEMORIA_AI.md](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/MEMORIA_AI.md)

---

## 3. Stato Git e Sicurezza File

- **Git Status**: Verificato tramite `git status --short` e `git diff --name-only`. I file in staging o working directory appartengono esclusivamente al perimetro dello Sprint C.4.
- **Isolamento file sensibili (`.env`)**:
  - `git ls-files` ha confermato che `.env`, `.env.local` ed `.env.production` **non sono tracciati** e rimangono correttamente ignorati da Git.
  - Solo il file `.env.example` è versionabile.
  - Nessun file (inclusi i test) contiene password, api key, token, service role key o credenziali sensibili configurate manualmente.

---

## 4. Verifica Feature Flag

- Il default nel codice e nei file di configurazione (`.env`, `.env.example`) è rigorosamente impostato su:
  `VITE_ENABLE_WIZARD2026_REMOTE_DRAFTS=false`
- Quando impostato a `false`:
  - `isEnabled()` in `SupabaseWizard2026DraftRepository` blocca le chiamate remota restituendo immediatamente `{ status: 'disabled' }` senza contattare le API Supabase.
  - L'hook `useWizard2026RemoteDraftSync` imposta lo stato della sincronizzazione a `'disabled'` e non esegue query.
  - Il badge `Wizard2026SyncStatusBadge` rileva il flag disattivato ed effettua un *early return* di `null`, rendendosi completamente invisibile all'utente.
  - Il Wizard 2026 funziona esclusivamente in locale basandosi su `localStorage` (comportamento identico a oggi).

---

## 5. Verifica SQL e RLS

L'analisi del file [20260602000000_create_wizard2026_drafts.sql](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/supabase/migrations/20260602000000_create_wizard2026_drafts.sql) ha confermato la correttezza dello schema proposto:
- **Tabella**: `public.wizard2026_drafts` creata con vincolo di unicità `CONSTRAINT wizard2026_drafts_unique UNIQUE (user_id, entity_id, year)`.
- **Indici**: Presenti indici mirati su `user_id`, `entity_id` e la coppia `(entity_id, year)`.
- **Trigger**: Trigger `trg_wizard2026_drafts_updated_at` agganciato correttamente per aggiornare il timestamp `updated_at` ad ogni update.
- **RLS**: Abilitata esplicitamente. Le policy per l'utente proprietario coprono `SELECT`, `INSERT`, `UPDATE`, `DELETE` filtrando rigorosamente per `auth.uid() = user_id`.
- **Policy ADMIN**: La policy `wizard_draft_select_admin` concede solo la `SELECT` agli utenti che passano il controllo `public.is_admin()`. **Non esiste alcuna policy che permetta ad ADMIN o terzi di inserire, modificare o cancellare bozze non proprie**.

### Verifica funzione `public.is_admin()`
La funzione `public.is_admin()` è definita come `SECURITY DEFINER` e verifica se per l'utente corrente `auth.uid()` esiste un ruolo `'ADMIN'` nella tabella `user_app_state`. Essendo questa funzione già presente e collaudata nel database di produzione (MOD-036C), non è strettamente necessario ricrearla, ma per garantire l'indipendenza e la robustezza della migrazione in ambienti di collaudo/staging vergini, abbiamo integrato la dichiarazione della funzione (`CREATE OR REPLACE FUNCTION public.is_admin()`) direttamente in testa al file SQL `20260602000000_create_wizard2026_drafts.sql`. In questo modo, l'esecuzione dello script è del tutto idempotente e autosufficiente.

---

## 6. Verifica Isolamento Wizard / Fondo

La separazione tra bozza Wizard e dati ufficiali del Fondo è preservata a livello logico e fisico:
- **Tabella Separata**: I dati del Wizard risiedono esclusivamente su `wizard2026_drafts`, mentre il Fondo risiede su `user_app_state.fund_data`.
- **Isolamento dei Flussi**:
  - Le modifiche al Wizard invocano solo il repository `SupabaseWizard2026DraftRepository`.
  - Il salvataggio del Fondo avviene solo tramite `AppContext` (`saveState()`) che chiama `SupabaseStateRepository` scrivendo su `user_app_state`.
  - Il trasferimento dei dati dal Wizard alla Costituzione dei Fondi rimane un'azione **esplicita** innescata solo quando l'utente preme "Conferma Trasferimento" nello Step 8.
- **Snapshot Storico**: Il campo `wizard2026TransferSnapshot` inserito in `fund_data` funge da record storico immutabile del trasferimento già effettuato e non interagisce con la bozza attiva presente sul database cloud.

---

## 7. Verifica Sincronizzazione e Gestione Conflitti

Il comportamento dell'hook in caso di sincronizzazione asincrona e multi-dispositivo è stato convalidato:
- **Nessun Overwrite Cieco**: In caso di discrepanze tra checksum locale e remoto, l'hook calcola lo stato (`local_newer`, `remote_newer`, `conflict`) confrontando i timestamp. L'autosalvataggio debounced si disattiva se lo stato è `'conflict'` o `'remote_newer'`.
- **Azioni Esplicite**: L'aggiornamento dei dati (con possibile sovrascrittura) richiede la chiamata manuale di `uploadLocal()` o `downloadRemote()`.
- **Resilienza Offline**: In caso di errore del server Supabase o assenza di rete, l'hook intercetta l'eccezione, imposta lo stato su `'error'` ed abilita l'editing locale su `localStorage` in totale sicurezza.

---

## 8. Esito Test TypeScript / Vitest / Build

I controlli automatizzati hanno riportato i seguenti risultati:
- **Typecheck**: `tsc --noEmit` completato con **successo (0 errori)**.
- **Vitest**: `npx vitest run` completato con **successo (391 test superati su 391, 100% PASS)**.
- **Build**: `npm run build` eseguito con successo, generando il bundle minificato per la produzione.

---

## 9. Rischi Residui

- **Collisione multi-utente sullo stesso Ente/Anno**: Poiché la bozza Wizard è legata sia a `user_id` che a `entity_id` e `year`, se due utenti diversi compilano il Wizard sullo stesso ente contemporaneamente, avranno **due bozze cloud separate** (grazie all'isolamento per-utente). Questo previene collisioni. Le collisioni si verificherebbero solo se condividessero lo stesso account utente. In quel caso, il meccanismo di conflict detection rileva la differenza di checksum all'apertura e richiede l'allineamento manuale.

---

## 10. Raccomandazione Finale

Lo scaffolding è giudicato **sicuro e pronto** per essere integrato. 

**Si raccomanda di procedere a MOD-037B2**, che includerà:
1. Applicazione controllata della migrazione SQL in ambiente di collaudo/staging per verificare le regole RLS sul DB.
2. Abilitazione del feature flag su ambiente di test.
3. Realizzazione completa della UI dei banner di sincronizzazione.
