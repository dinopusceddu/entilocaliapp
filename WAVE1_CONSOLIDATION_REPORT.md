# WAVE 1 — FINAL GIT & MIGRATION CONSOLIDATION REPORT

- **Data:** 22 Settembre 2026
- **Repository:** `dinopusceddu/entilocaliapp`
- **Branch:** `ux/toolbox-area-fondo-prototype`
- **Baseline Astra pre-Wave 1:** `9f90771e63cc9c45684d6d78baa144e923ea6868`
- **Commit Consolidato Wave 1:** `096056b8c6fa7d436cae24ce6d412580ff420c85`
- **Ambiente Target Staging:** `https://mcasgpaivyosaroxrodm.supabase.co`
- **Produzione (`yggokplxleredipknfbq`):** MAI TOCCATA (0 connessioni, 0 query)

---

## 1. Migration Inventory Completo

Rilevazione integrata tra file system locale, tracking Git e stato remoto su Supabase Staging (`npx supabase migration list`):

| File Migrazione | Versione | Git Tracked (Pre-Commit)? | Staging Applied? | Wave 1? | Inclusa nel Commit Wave 1? | Note / Ruolo |
|---|:---:|:---:|:---:|:---:|:---:|---|
| `20260220000000_init_user_app_state.sql` | `20260220000000` | No (untracked) | Sì | No | **NO** | Storico iniziale (escluso) |
| `20260220000001_init_user_profiles.sql` | `20260220000001` | No (untracked) | Sì | No | **NO** | Storico profili (escluso) |
| `20260220000002_init_multi_entity.sql` | `20260220000002` | No (untracked) | Sì | No | **NO** | Storico multi-ente (escluso) |
| `20260220000003_init_fix_admin_access.sql` | `20260220000003` | No (untracked) | Sì | No | **NO** | Storico accessi admin (escluso) |
| `20260220000004_fix_profiles_recursion.sql` | `20260220000004` | No (untracked) | Sì | No | **NO** | Storico policy RLS (escluso) |
| `20260220000005_confirm_email.sql` | `20260220000005` | No (untracked) | Sì | No | **NO** | Contiene email personale (escluso) |
| `20260220000006_make_admin.sql` | `20260220000006` | No (untracked) | Sì | No | **NO** | Contiene email personale (escluso) |
| `20260220000007_seed_guest_user.sql` | `20260220000007` | No (untracked) | Sì | No | **NO** | Contiene credenziali test (escluso) |
| `20260220000022_remote_baseline.sql` | `20260220000022` | No (untracked) | Sì | No | **NO** | Placeholder locale staging (escluso) |
| `20260221131708_create_rag_schema.sql` | `20260221131708` | Sì (in baseline) | Sì | No | Già in baseline | Schema RAG documentale |
| `20260221230945_create_knowledge_documents.sql` | `20260221230945` | Sì (in baseline) | Sì | No | Già in baseline | Knowledge documents |
| `20260222182000_create_communications_tables.sql` | `20260222182000` | Sì (in baseline) | Sì | No | Già in baseline | Communications |
| `20260315_add_user_id_to_notifications.sql` | `20260315` | Sì (in baseline) | Sì | No | Già in baseline | Notifiche utente |
| `20260415120000_create_pareri_aran_staging.sql` | `20260415120000` | Sì (in baseline) | Sì | No | Già in baseline | Pareri ARAN staging |
| `20260602000000_create_wizard2026_drafts.sql` | `20260602000000` | Sì (in baseline) | Sì | No | Già in baseline | Bozze Wizard 2026 |
| `20260602001000_adjust_wizard2026_drafts_select_policy.sql` | `20260602001000` | Sì (in baseline) | Sì | No | Già in baseline | Policy Wizard 2026 |
| `20260921000000_fix_user_app_state_ownership_rls.sql` | `20260921000000` | Sì (in baseline) | Sì | No | Già in baseline | Ownership RLS pre-Wave 1 |
| `20260922000000_enforce_closed_snapshot_immutability.sql` | `20260922000000` | No (nuova Wave 1) | Sì | Sì | **SÌ** | Trigger immutabilità BEFORE UPDATE |
| `20260922000001_close_annual_snapshot_atomic.sql` | `20260922000001` | No (nuova Wave 1) | Sì | Sì | **SÌ** | Prima versione RPC atomica |
| `20260922000002_grant_close_annual_snapshot_atomic.sql` | `20260922000002` | No (nuova Wave 1) | Sì | Sì | **SÌ** | Permessi RPC ad authenticated |
| `20260922140000_update_immutability_trigger.sql` | `20260922140000` | No (nuova Wave 1) | Sì | Sì | **SÌ** | Hardening trigger (blocco DELETE/UPDATE) |
| `20260922140001_harden_close_annual_snapshot_atomic.sql` | `20260922140001` | No (nuova Wave 1) | Sì | Sì | **SÌ** | Hardened RPC (Scenari A, B, C, FOR UPDATE) |
| `20260922140002_grant_hardened_rpc.sql` | `20260922140002` | No (nuova Wave 1) | Sì | Sì | **SÌ** | Permessi RPC hardened |
| `20260922150000_fix_found_in_atomic_closure.sql` | `20260922150000` | No (nuova Wave 1) | Sì | Sì | **SÌ** | Fix composite record NULL -> IF FOUND |

---

## 2. Duplicate-Version Check

È stata verificata esplicitamente l'ipotesi di collisione tra:
- `20260922000000_atomic_annual_closure.sql`
- `20260922000000_enforce_closed_snapshot_immutability.sql`

**Esito verifica:**
- Il file `20260922000000_atomic_annual_closure.sql` **non esiste e non è mai esistito** né nel working tree né nello storico Git.
- La chiusura annuale atomica è stata creata fin dall'origine con timestamp univoco successivo `20260922000001_close_annual_snapshot_atomic.sql`.
- Esiste un'unica migrazione registrata con timestamp `20260922000000` (`enforce_closed_snapshot_immutability.sql`).
- **Nessuna versione duplicata** è presente nella sequenza di migrazione.

---

## 3. Catena Ufficiale Wave 1 (Forward-Only)

Tutte le migrazioni Wave 1 formano una sequenza forward-only strettamente incrementale, già applicata allo staging ed inclusa inalterata nel commit:

1. **`20260922000000_enforce_closed_snapshot_immutability.sql`**
   - *Oggetto:* Crea la funzione trigger `enforce_user_app_state_closed_immutability()` e il trigger `trg_enforce_user_app_state_closed_immutability` BEFORE UPDATE su `user_app_state`.
   - *Dipendenza:* Dipende dallo schema pre-Wave 1 (`public.user_app_state`).
   - *Stato Staging:* Applicata.
2. **`20260922000001_close_annual_snapshot_atomic.sql`**
   - *Oggetto:* Crea la funzione RPC `public.close_annual_snapshot_atomic(uuid, integer, jsonb, jsonb)`.
   - *Dipendenza:* Dipende dalla session variable creata in `20260922000000`.
   - *Stato Staging:* Applicata.
3. **`20260922000002_grant_close_annual_snapshot_atomic.sql`**
   - *Oggetto:* `GRANT EXECUTE` sul contratto iniziale della RPC al ruolo `authenticated`.
   - *Dipendenza:* Dipende da `20260922000001`.
   - *Stato Staging:* Applicata.
4. **`20260922140000_update_immutability_trigger.sql`**
   - *Oggetto:* Sostituisce la logica del trigger con `check_user_app_state_immutability()` per BEFORE UPDATE OR DELETE, bloccando esplicitamente i tentativi di passaggio diretto a `CLOSED` (`CANNOT_CLOSE_DIRECTLY`) e di eliminazione di record chiusi (`CANNOT_DELETE_CLOSED`).
   - *Dipendenza:* Sostituisce la funzione introdotta in `20260922000000`.
   - *Stato Staging:* Applicata.
5. **`20260922140001_harden_close_annual_snapshot_atomic.sql`**
   - *Oggetto:* Rilascia la versione hardened della RPC con Scenari A/B/C, blocco riga `FOR UPDATE`, calcolo server-side dei metadati (`now()`, `auth.email`), estrazione autorevole dei dati dal DB ed eccezioni strutturate `P0003`.
   - *Dipendenza:* Aggiorna la RPC introdotta in `20260922000001`.
   - *Stato Staging:* Applicata.
6. **`20260922140002_grant_hardened_rpc.sql`**
   - *Oggetto:* Riafferma il `GRANT EXECUTE` al ruolo `authenticated`.
   - *Dipendenza:* Dipende da `20260922140001`.
   - *Stato Staging:* Applicata.
7. **`20260922150000_fix_found_in_atomic_closure.sql`**
   - *Oggetto:* Corregge il costrutto PL/pgSQL sostituendo `IF record IS NOT NULL` (che valuta falso in presenza di colonne composite nullable) con la forma canonica `IF FOUND THEN` / `IF NOT FOUND THEN`.
   - *Dipendenza:* Perfeziona la RPC definitiva introdotta in `20260922140001`.
   - *Stato Staging:* Applicata.

Nessuna migration è stata squasha o rinominata retroattivamente, preservando l'integrità 1:1 con il database di staging.

---

## 4. Historical Migrations Excluded

I seguenti 9 file storici/placeholder locali **NON sono stati inclusi nel commit** e permangono rigorosamente untracked:
1. `supabase/migrations/20260220000000_init_user_app_state.sql`
2. `supabase/migrations/20260220000001_init_user_profiles.sql`
3. `supabase/migrations/20260220000002_init_multi_entity.sql`
4. `supabase/migrations/20260220000003_init_fix_admin_access.sql`
5. `supabase/migrations/20260220000004_fix_profiles_recursion.sql`
6. `supabase/migrations/20260220000005_confirm_email.sql` (escluso: contiene email personale dello sviluppatore)
7. `supabase/migrations/20260220000006_make_admin.sql` (escluso: contiene email personale dello sviluppatore)
8. `supabase/migrations/20260220000007_seed_guest_user.sql` (escluso: contiene credenziali di test in chiaro)
9. `supabase/migrations/20260220000022_remote_baseline.sql` (escluso: placeholder di sincronizzazione locale staging)

---

## 5. Riproducibilità e Tracciamento Debito Tecnico

È stato eseguito:
```bash
npx supabase db push --dry-run
```
**Esito:**
```
DRY RUN: migrations will *not* be pushed to the database.
Connecting to remote database...
Remote database is up to date.
```

### Registrazione Debito Tecnico di Deployment:
```
STATUS: DEPLOYMENT_MIGRATION_REPRODUCIBILITY_DEBT
```
* **Dettaglio:** Le migrazioni iniziali del DB (`20260220000000`–`20260220000007` e `20260220000022`), create prima dell'audit Astra, risiedono nella cronologia dello Staging remoto ma non sono mai state committate nel repository Git per motivi di riservatezza (presenza di email personali e credenziali).
* **Impatto:** L'applicazione su un database vergine richiederà prima la baseline dello schema principale (tramite dump di struttura DDL anonimizzato) o l'esecuzione della catena standard. La sequenza Wave 1 (`20260922...`) è pienamente riproducibile su qualsiasi DB che possieda la tabella `public.user_app_state` pre-Wave 1.

---

## 6. Secret Scan Pre-Commit

È stata eseguita una scansione rigorosa su tutti i 27 file staged cercando:
`password`, `service_role`, `access_token`, `refresh_token`, `eyJ`, `GuestPassword`, `dino.pusceddu`.

- File di codice applicativo (`src/`): **0 secret rilevati**
- Migrazioni SQL (`supabase/migrations/`): **0 secret rilevati**
- Test suite (`src/__tests__/`): **0 secret rilevati**
- Documentazione: solo occorrenze descrittive anonimizzate (`[REDACTED_PERSONAL_EMAIL]`, `[REDACTED_TEST_PASSWORD]`).
- **Nessun secret reale è presente nel commit.**

---

## 7. File Inclusi nel Commit Consolidato (27 file)

### File Applicativi Modificati (18 file):
1. `src/__tests__/localDraftPersistence.test.ts`
2. `src/application/fundWorkflow.ts`
3. `src/application/ports/IStateRepository.ts`
4. `src/application/snapshots/snapshotWorkflow.ts`
5. `src/application/stateWorkflow.ts`
6. `src/application/yearClosureWorkflow.ts`
7. `src/components/layout/MainLayout.tsx`
8. `src/contexts/AppContext.tsx`
9. `src/domain/snapshot.ts`
10. `src/features/wizard2026/steps/Step8RiepilogoPreview.tsx`
11. `src/hooks/useFundDataAutosave.ts`
12. `src/infrastructure/persistence/SupabaseStateRepository.ts`
13. `src/pages/DistribuzioneRisorsePage.tsx`
14. `src/pages/FondoAccessorioDipendentePage.tsx`
15. `src/pages/FondoDirigenzaPage.tsx`
16. `src/pages/FondoElevateQualificazioniPage.tsx`
17. `src/pages/FondoSegretarioComunalePage.tsx`
18. `src/pages/PersonaleServizioPage.tsx`

### Test Permanenti Aggiunti (1 file):
19. `src/__tests__/wave1ClosedSnapshot.test.ts` (10 test C1–C10, unit & mock integration)

### Migrazioni Wave 1 Ufficiali (7 file):
20. `supabase/migrations/20260922000000_enforce_closed_snapshot_immutability.sql`
21. `supabase/migrations/20260922000001_close_annual_snapshot_atomic.sql`
22. `supabase/migrations/20260922000002_grant_close_annual_snapshot_atomic.sql`
23. `supabase/migrations/20260922140000_update_immutability_trigger.sql`
24. `supabase/migrations/20260922140001_harden_close_annual_snapshot_atomic.sql`
25. `supabase/migrations/20260922140002_grant_hardened_rpc.sql`
26. `supabase/migrations/20260922150000_fix_found_in_atomic_closure.sql`

### Report di Hardening Finale (1 file):
27. `WAVE1_FINAL_HARDENING_REPORT.md`

---

## 8. File Esclusi dal Commit (Untracked)

I seguenti file sono stati deliberatamente esclusi dal commit per preservare l'igiene del repository:
- Script di test live/staging e browser smoke: `scripts/test_wave1_final_hardening.ts`, `scripts/browser_smoke_wave1.ts`, `scripts/browser_smoke_wave1.cjs`, `scripts/reproduce_wave1_before.ts`, `scripts/test_wave1_staging.ts`.
- File JSON e artefatti di evidenza: `wave1_final_hardening_results.json`, `wave1_browser_smoke_results.json`, `wave1_reproduction_before.json`, `wave1_review_gate_results.json`, `wave1_verification_staging.json`, `smoke_evidence/`.
- Migrazioni storiche locali e placeholder: `20260220000000`–`20260220000007`, `20260220000022_remote_baseline.sql`.
- File locali protetti da gitignore: `.env.local`, `.astra-test-users.local`.

---

## 9. Quality Gates Pre-Commit

Tutti i gate tecnici sono stati eseguiti e superati con successo prima della creazione del commit:

| Gate | Comando | Risultato |
|---|---|:---:|
| **Whitespace / Formatting** | `git diff --cached --check` | **PASS (0 errori)** |
| **TypeScript Type Check** | `npx tsc --noEmit` | **PASS (0 errori)** |
| **Vitest Full Test Suite** | `npm test -- --run` | **PASS (93 file, 952 test)** |
| **Production Build** | `npm run build` | **PASS (0 errori, Vite v6.4.1)** |
| **Calcolo Fondo Non-Regression** | `npx vite-node scripts/run_regression_tests.ts` | **PASS (8/8 scenari, delta 0)** |

---

## 10. Commit Details & SHA

```bash
git commit -m "fix: make annual closure atomic and immutable"
```

- **Commit SHA Completo:** `096056b8c6fa7d436cae24ce6d412580ff420c85`
- **Short SHA:** `096056b`
- **Branch:** `ux/toolbox-area-fondo-prototype`
- **Push / PR / Deploy:** NESSUNO ESEGUITO.

---

## Verdetto Finale

```
WAVE1_CONSOLIDATED
```
