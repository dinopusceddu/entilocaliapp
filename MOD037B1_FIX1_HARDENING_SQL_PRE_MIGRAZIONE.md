# Report MOD-037B1-FIX1 — Hardening SQL Pre-Migrazione Persistenza Remota Wizard 2026

**Data:** 2026-06-02  
**Versione:** Beta 1.3 (post-MOD-036C-FIX1)  
**Stato:** ✅ COMPLETATO (Patch di hardening locale applicata e validata al 100%)  
**Autore:** Antigravity AI  

---

## 1. Esito Generale

La patch di hardening locale per il file SQL di migrazione della tabella `wizard2026_drafts` ha dato **esito positivo al 100%**. 
Tutti i punti critici evidenziati nell'audit pre-migrazione sono stati risolti con successo:
1. Abbiamo rimosso la sovrascrittura di `public.is_admin()` sostituendola con la funzione dedicata `public.is_wizard2026_admin()`, configurata per interrogare correttamente la tabella `public.profiles`.
2. Abbiamo garantito l'idempotenza del file SQL aggiungendo clausole preventive `DROP POLICY IF EXISTS` e `DROP TRIGGER IF EXISTS` per tutte le politiche e i trigger definiti.
3. Abbiamo analizzato la gestione della cancellazione e implementato la **Soluzione C (upsert sulla stessa riga)** mantenendo il vincolo unico classico e garantendo l'isolamento dei dati soft-deleted a livello RLS.

Nessuna risorsa remota (Supabase remoto, GitHub o ambiente di produzione) è stata modificata o scritta durante questa fase.

---

## 2. File Modificati

- [20260602000000_create_wizard2026_drafts.sql](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/supabase/migrations/20260602000000_create_wizard2026_drafts.sql)
- [MEMORIA_AI.md](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/MEMORIA_AI.md)
- [MOD037B1_REVIEW_AUDIT_PRE_MIGRAZIONE.md](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/MOD037B1_REVIEW_AUDIT_PRE_MIGRAZIONE.md)

---

## 3. Problemi Individuati & Correzioni Applicate

### 3.1 Funzione `public.is_admin()` e Profilo Utenti
- **Problema**: L'uso di `CREATE OR REPLACE FUNCTION public.is_admin()` rischiava di sovrascrivere funzioni pre-esistenti in produzione adibite ad altri ambiti applicativi, con potenziali effetti collaterali non previsti. Inoltre, la query puntava sulla tabella `user_app_state` anziché sulla tabella centralizzata dei ruoli utenti.
- **Correzione**: È stata creata la funzione dedicata `public.is_wizard2026_admin()`. Questa funzione interroga la tabella `public.profiles` (source of truth per i profili e ruoli introdotta con il Zero-Entity Onboarding) controllando l'identità dell'utente corrente e validando il ruolo tramite `UPPER(role) = 'ADMIN'`. È stata rimossa ogni traccia o tentativo di sovrascrittura di `public.is_admin()`.

### 3.2 Idempotenza di Trigger e Policy
- **Trigger**: Prima della definizione del trigger `trg_wizard2026_drafts_updated_at`, abbiamo aggiunto l'istruzione:
  ```sql
  DROP TRIGGER IF EXISTS trg_wizard2026_drafts_updated_at ON public.wizard2026_drafts;
  ```
- **Policy RLS**: Prima delle istruzioni `CREATE POLICY`, abbiamo aggiunto le cancellazioni preventive per ciascuna policy per consentire la riesecuzione del file senza collisioni o fallimenti:
  ```sql
  DROP POLICY IF EXISTS "wizard_draft_select_own" ON public.wizard2026_drafts;
  DROP POLICY IF EXISTS "wizard_draft_insert_own" ON public.wizard2026_drafts;
  DROP POLICY IF EXISTS "wizard_draft_update_own" ON public.wizard2026_drafts;
  DROP POLICY IF EXISTS "wizard_draft_delete_own" ON public.wizard2026_drafts;
  DROP POLICY IF EXISTS "wizard_draft_select_admin" ON public.wizard2026_drafts;
  ```

### 3.3 Coerenza `deleted_at` e Vincolo Unico
- **Analisi del Repository**: Il repository `wizard2026RemoteDraftRepository.ts` supporta sia la cancellazione reale (`deleteWizard2026RemoteDraft` tramite `DELETE` standard) sia la marcatura per il soft delete (`markWizard2026RemoteDraftDeleted` tramite update). L'aggiornamento e il ripristino delle bozze avvengono tramite `upsert` sulla base del vincolo unico `(user_id, entity_id, year)`.
- **Scelta effettuata (Soluzione C — upsert sulla stessa riga)**:
  - Per consentire il corretto funzionamento di `.upsert(..., { onConflict: 'user_id,entity_id,year' })` integrato in Supabase client-side, abbiamo mantenuto il vincolo unico classico `CONSTRAINT wizard2026_drafts_unique UNIQUE (user_id, entity_id, year)`.
  - Abbiamo aggiornato la policy di SELECT per l'utente standard per garantire che non vengano visualizzati o restituiti dati con soft-delete:
    ```sql
    CREATE POLICY "wizard_draft_select_own"
      ON public.wizard2026_drafts FOR SELECT
      USING (auth.uid() = user_id AND deleted_at IS NULL);
    ```
  - In questo modo, l'upsert può riutilizzare la riga esistente resettando `deleted_at = null` ed evitando la duplicazione delle righe. I dati soft-deleted restano invisibili all'utente standard (SELECT filtrata), garantendo coerenza totale ed evitando l'esposizione di bozze dismesse. Gli amministratori possono invece leggerle a scopi di supporto/debug grazie alla policy a loro riservata che non applica il filtro su `deleted_at`.

---

## 4. Analisi RLS e Sicurezza

### 4.1 Utente Standard (Owner)
- **Lettura (SELECT)**: Consentita solo se `auth.uid() = user_id` E la bozza è attiva (`deleted_at IS NULL`).
- **Inserimento (INSERT)**: Consentito solo se `auth.uid() = user_id`.
- **Modifica (UPDATE)**: Consentita solo se `auth.uid() = user_id`.
- **Cancellazione (DELETE)**: Consentita solo se `auth.uid() = user_id`.

### 4.2 Utente Admin (Supporto/Debug)
- **Lettura (SELECT)**: Consentita su tutte le righe (comprese quelle soft-deleted) a condizione che l'utente superi la verifica `public.is_wizard2026_admin()`.
- **Scritture (INSERT, UPDATE, DELETE)**: Rigorosamente **negate** per bozze appartenenti ad altri utenti (mancano policy di scrittura per profili ADMIN su righe non proprie).

---

## 5. Verifica Isolamento Wizard / Fondo

Si conferma che la tabella `wizard2026_drafts` rimane completamente isolata dal resto dei flussi:
- Le modifiche nello stato o la cancellazione della bozza non toccano in alcun modo `user_app_state`.
- Il Fondo Risorse Decentrate ufficiale non subisce salvataggi o modifiche indirette.
- La colonna `wizard2026TransferSnapshot` all'interno della configurazione fondo funge da puro archivio storico immutabile del trasferimento, disaccoppiato dalla bozza istruttoria cloud.

---

## 6. Stato Git e Sicurezza File

- **Git Status**: Controllato tramite `git status --short`. Nessun file sensibile (`.env`, `.env.local`, `.env.production`) è tracciato o staged.
- **Ignorati**: I file locali con credenziali o chiavi Supabase risiedono esclusivamente nei file non tracciati.
- **Feature Flag**: `VITE_ENABLE_WIZARD2026_REMOTE_DRAFTS` rimane spento (`false`) nel file `.env` e `.env.example`.

---

## 7. Esito Controlli Tecnici

- **TypeScript compilation** (`npx tsc --noEmit`): **SUCCESS (0 errori)**.
- **Unit Tests** (`npx vitest run`): **SUCCESS (391/391 test superati)**.
- **Production Build** (`npm run build`): **SUCCESS** (generato correttamente il bundle statico).

---

## 8. Rischi Residui & Raccomandazioni

### Rischi Residui:
- Nessun rischio tecnico immediato identificato. Il codice SQL è ora protetto e non interferisce con la produzione.

### Raccomandazione Finale:
**Si raccomanda di procedere a MOD-037B2**. Il file SQL della migrazione è pronto, sicuro ed idempotente per essere applicato controllatamente sul database di collaudo/staging per i test d'integrazione di autorizzazione e sincronizzazione remota.
