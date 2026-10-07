# WAVE 1 — FINAL SECURITY & CONSOLIDATION REVIEW GATE REPORT

**Data Audit:** 22 Settembre 2026\
**Repository:** `dinopusceddu/entilocaliapp`\
**Baseline Originaria:** `9f90771e63cc9c45684d6d78baa144e923ea6868`\
**Target Environment:** Staging Supabase (`https://mcasgpaivyosaroxrodm.supabase.co`)\
**Modalità Audit:** STRICT READ-ONLY (nessuna modifica di codice, nessun commit, nessun push)\
**Verdetto Finale:** `WAVE1_REQUIRES_FIXES`

---

## 1. Git Inventory

### 1.1. Comandi di Ispezione Eseguiti
```bash
git status --short --untracked-files=all
git diff --stat
git diff --check
git diff --name-status
```

### 1.2. File Modificati Tracciati (18 file)
1. `src/__tests__/localDraftPersistence.test.ts` *(M)* — Allineamento asserzioni mock al rifiuto salvataggio stato chiuso.
2. `src/application/fundWorkflow.ts` *(M)* — Tipizzazione ritorno workflow di calcolo e salvataggio.
3. `src/application/ports/IStateRepository.ts` *(M)* — Aggiunta firma del metodo atomico `closeYearAtomic`.
4. `src/application/snapshots/snapshotWorkflow.ts` *(M)* — Blocco preventivo salvataggio su snapshot `CLOSED`.
5. `src/application/stateWorkflow.ts` *(M)* — Gestione errori trigger DB (`P0001 / SNAPSHOT_CLOSED`).
6. `src/application/yearClosureWorkflow.ts` *(M)* — Workflow chiusura via RPC atomica e gestione idempotenza.
7. `src/components/layout/MainLayout.tsx` *(M)* — Disabilitazione pulsante "Salva Bozza" con etichetta "Annualità Chiusa".
8. `src/contexts/AppContext.tsx` *(M)* — Blocco azioni mutanti in `appReducer` su stato chiuso e marcatura immediata `CLOSED`.
9. `src/domain/snapshot.ts` *(M)* — Estensione tipo `AnnualSnapshotSaveResult` con union `reason`.
10. `src/features/wizard2026/steps/Step8RiepilogoPreview.tsx` *(M)* — Banner e blocco trasferimento su annualità chiusa.
11. `src/hooks/useFundDataAutosave.ts` *(M)* — Allineamento tipi di ritorno autosave.
12. `src/infrastructure/persistence/SupabaseStateRepository.ts` *(M)* — Implementazione adapter `closeYearAtomic`.
13. `src/pages/DistribuzioneRisorsePage.tsx` *(M)* — Banner, disabilitazione input, controlli e save button.
14. `src/pages/FondoAccessorioDipendentePage.tsx` *(M)* — Banner, disabilitazione input e guardie su `useEffect`.
15. `src/pages/FondoDirigenzaPage.tsx` *(M)* — Banner e disabilitazione voci fondo dirigenza.
16. `src/pages/FondoElevateQualificazioniPage.tsx` *(M)* — Banner e disabilitazione voci fondo EQ.
17. `src/pages/FondoSegretarioComunalePage.tsx` *(M)* — Banner e disabilitazione voci fondo segretario.
18. `src/pages/PersonaleServizioPage.tsx` *(M)* — Banner e disabilitazione azioni personale.

### 1.3. File Nuovi Non Tracciati Rilevanti per Wave 1
- `supabase/migrations/20260922000000_enforce_closed_snapshot_immutability.sql`
- `supabase/migrations/20260922000001_close_annual_snapshot_atomic.sql`
- `supabase/migrations/20260922000002_grant_close_annual_snapshot_atomic.sql`
- `src/__tests__/wave1ClosedSnapshot.test.ts`
- `scripts/reproduce_wave1_before.ts`
- `scripts/test_wave1_staging.ts`
- `wave1_reproduction_before.json`
- `wave1_verification_staging.json`
- `WAVE1_CLOSED_SNAPSHOT_IMPLEMENTATION_REPORT.md`

### 1.4. Discrepanze con `WAVE1_CLOSED_SNAPSHOT_IMPLEMENTATION_REPORT.md`
- **File presente nel git diff ma omesso nella Sezione 9 del report:** `src/__tests__/localDraftPersistence.test.ts`.
- **Verifica `git diff --check`:** Rilevato errore di whitespace formatting:
  `src/pages/FondoElevateQualificazioniPage.tsx:165: trailing whitespace.`

---

## 2. Audit Migration History

### 2.1. Tabella di Riconciliazione Migrazioni
| Migration | File Locale | Staging DB | Tracciata Pre-Wave1 (git @ 9f90771e) | Creata in Wave 1 | Da Committare |
|---|:---:|:---:|:---:|:---:|:---:|
| `20260220000000_init_user_app_state.sql` | SÌ | SÌ | NO (untracked) | NO | Da riconciliare |
| `20260220000001_init_user_profiles.sql` | SÌ | SÌ | NO (untracked) | NO | Da riconciliare |
| `20260220000002_init_multi_entity.sql` | SÌ | SÌ | NO (untracked) | NO | Da riconciliare |
| `20260220000003_init_fix_admin_access.sql` | SÌ | SÌ | NO (untracked) | NO | Da riconciliare |
| `20260220000004_fix_profiles_recursion.sql` | SÌ | SÌ | NO (untracked) | NO | Da riconciliare |
| `20260220000005_confirm_email.sql` | SÌ | SÌ | NO (untracked) | NO | Da riconciliare |
| `20260220000006_make_admin.sql` | SÌ | SÌ | NO (untracked) | NO | Da riconciliare |
| `20260220000007_seed_guest_user.sql` | SÌ | SÌ | NO (untracked) | NO | Da riconciliare |
| **`20260220000022_remote_baseline.sql`** | **SÌ** | **SÌ** | **NO (untracked)** | **SÌ (placeholder)** | **DA ESCLUDERE / RISOLVERE** |
| `20260221131708_create_rag_schema.sql` | SÌ | SÌ | SÌ | NO | Già a repo |
| `20260221230945_create_knowledge_documents.sql` | SÌ | SÌ | SÌ | NO | Già a repo |
| `20260222182000_create_communications_tables.sql` | SÌ | SÌ | SÌ | NO | Già a repo |
| `20260315_add_user_id_to_notifications.sql` | SÌ | SÌ | SÌ | NO | Già a repo |
| `20260415120000_create_pareri_aran_staging.sql` | SÌ | SÌ | SÌ | NO | Già a repo |
| `20260602000000_create_wizard2026_drafts.sql` | SÌ | SÌ | SÌ | NO | Già a repo |
| `20260602001000_adjust_wizard2026_drafts_select_policy.sql` | SÌ | SÌ | SÌ | NO | Già a repo |
| `20260921000000_fix_user_app_state_ownership_rls.sql` | SÌ | SÌ | SÌ | NO | Già a repo |
| `20260922000000_enforce_closed_snapshot_immutability.sql` | SÌ | SÌ | NO | SÌ | **SÌ (Wave 1)** |
| `20260922000001_close_annual_snapshot_atomic.sql` | SÌ | SÌ | NO | SÌ | **SÌ (Wave 1)** |
| `20260922000002_grant_close_annual_snapshot_atomic.sql` | SÌ | SÌ | NO | SÌ | **SÌ (Wave 1)** |

### 2.2. Diagnosi su `20260220000022_remote_baseline.sql`
- **Contenuto effettivo:**
  ```sql
  -- Remote baseline placeholder (historical migration already applied on staging)
  ```
- **Natura:** È un artificio locale di conciliazione creato durante i tentativi di `supabase db push`. Sul database Staging era registrata nella tabella `schema_migrations` una versione `20260220000022` non presente nella directory locale di git. Per evitare che il CLI di Supabase bloccasse l'allineamento con un errore di discrepanza storica, è stato creato questo file vuoto.
- **Modifica schema:** Nessuna (è solo un commento).
- **Rischio:** Se committato, introduce nel repository ufficiale una migrazione fittizia che potrebbe causare conflitti o tentativi di esecuzione anomali su altri ambienti (es. future istanze di test locali o staging pulito). Inoltre le migrazioni `20260220000000` - `20260220000007` risultano non tracciate in git sebbene applicate su Staging.
- **Classificazione:** `MIGRATION_HISTORY_RECONCILIATION_REQUIRED`.

---

## 3. Audit RPC Security Definer

### 3.1. Analisi di `close_annual_snapshot_atomic`
La funzione è definita `SECURITY DEFINER` con `search_path = public` e concessa in esecuzione a `authenticated`.

Analisi delle verifiche autorizzative (righe 20–36 di `20260922000001_close_annual_snapshot_atomic.sql`):
```sql
  v_auth_uid := auth.uid();
  IF v_auth_uid IS NULL THEN
    RAISE EXCEPTION 'UNAUTHORIZED: Utente non autenticato' USING ERRCODE = '42501';
  END IF;

  SELECT user_id INTO v_entity_user_id
  FROM public.entities
  WHERE id = p_entity_id;

  IF v_entity_user_id IS NULL THEN
    RAISE EXCEPTION 'ENTITY_NOT_FOUND: Ente non trovato' USING ERRCODE = 'P0002';
  END IF;

  v_is_admin := public.is_admin();
  IF v_entity_user_id <> v_auth_uid AND NOT v_is_admin THEN
    RAISE EXCEPTION 'FORBIDDEN: Non autorizzato a gestire questo ente' USING ERRCODE = '42501';
  END IF;
```

### 3.2. Esito Audit Logico
- Verifica `auth.uid()`: **PRESENTE** (eccezione 42501 se null).
- Risoluzione owner ente: `SELECT user_id INTO v_entity_user_id FROM public.entities WHERE id = p_entity_id;` **PRESENTE**.
- Regola autorizzativa: `(v_entity_user_id == auth.uid() OR is_admin() == true)`. Se falsa: **RAISE FORBIDDEN (42501)**.
- Chiusura ente altrui da utente non autorizzato: **IMPOSSIBILE**.

---

## 4. Test Reale USER_C Contro RPC

Eseguito live su Staging (`https://mcasgpaivyosaroxrodm.supabase.co`) con script di audit `scripts/run_wave1_review_checks.ts`:
- Dataset isolato: Ente `WAVE1_RPC_AUTH_TEST_1790076035123` creato da `USER_A`.
- Anno 2025 inizializzato in stato `OPEN` con `user_id = USER_A`.
- Invocazione diretta da parte di `USER_C` (autenticato con proprio JWT):
  ```typescript
  clientC.rpc('close_annual_snapshot_atomic', {
    p_entity_id: entityA.id,
    p_current_year: 2025, ...
  });
  ```
- **Esito Chiamata RPC:**
  ```json
  {
    "error": {
      "code": "42501",
      "message": "FORBIDDEN: Non autorizzato a gestire questo ente"
    },
    "status": 403
  }
  ```
- **Stato Database dopo tentativo USER_C:**
  - Anno 2025: **INVARIATO** (`snapshotStatus = 'OPEN'`).
  - Anno 2026: **NON CREATO** (`null`).
  - Audit log di chiusura: **NESSUN LOG REGISTRATO**.
- **Esito Check 4:** **PASS (AUTHORIZATION ENFORCED)**.

---

## 5. Test ADMIN_B Contro RPC

Eseguito live su Staging nello stesso dataset isolato con `ADMIN_B`:
- Invocazione RPC: `clientB.rpc('close_annual_snapshot_atomic', ...)` su ente di `USER_A`.
- **Esito Chiamata RPC:** `success: true, closedYear: 2025, nextYear: 2026`.
- **Verifica Ownership e Integrità Record:**
  - `entities.user_id`: `9b0bc8ea-94d3-4364-859b-20a3365dbc3c` (`USER_A`) — **PRESERVATO**.
  - Anno 2025 (`current user_app_state.user_id`): `USER_A` — **PRESERVATO** (`snapshotStatus = 'CLOSED'`).
  - Anno 2026 (`next user_app_state.user_id`): `USER_A` — **PRESERVATO** (`snapshotStatus = 'OPEN'`).
- `ADMIN_B` ha agito come operatore cross-ente con autorizzazione amministrativa senza appropriarsi della titolarità dell'ente o dei record.
- **Esito Check 5:** **PASS (ADMIN CROSS-OWNER AUTHORIZATION & OWNERSHIP PRESERVED)**.

---

## 6. RPC Payload Integrity

### 6.1. Analisi del Trattamento Payload JSON nella RPC
La RPC riceve dal client i parametri JSONB `p_closed_fund_data` e `p_next_fund_data`.
Analizzando il corpo della funzione SQL:
```sql
  UPDATE public.user_app_state
  SET
    fund_data = p_closed_fund_data,
    updated_at = timezone('utc'::text, now())
  WHERE entity_id = p_entity_id AND current_year = p_current_year;
```
e per l'anno successivo:
```sql
  INSERT INTO public.user_app_state (..., fund_data, ...)
  VALUES (..., p_next_fund_data, ...);
```

### 6.2. Vulnerabilità e Criticità Identificate
1. **Mancanza di Enforcing Server-Side su `snapshotStatus` in Chiusura:**
   Se un client malevolo o manipolato invia `p_closed_fund_data` con `metadata.snapshotStatus = 'OPEN'`, il record viene aggiornato mantenendo lo stato aperto, vanificando la transizione formale e l'immutabilità successiva del trigger.
2. **Mancanza di Enforcing Server-Side su `snapshotStatus` dell'Anno Successivo:**
   `p_next_fund_data` viene salvato integralmente così come inviato dal client, senza forzare server-side `metadata.snapshotStatus = 'OPEN'`.
3. **Mancanza di Validazione Server-Side del Calcolo Riporto (`carry-forward`):**
   Il valore `vn_art80c1_sommeNonUtilizzateStabiliPrec` contenuto in `p_next_fund_data` viene calcolato nel client React (`yearClosureWorkflow.ts`) e salvato acriticamente dal DB. Non c'è ricalcolo o validazione server-side.
4. **Valutazione:** L'ownership di riga nel DB (`user_app_state.user_id`) è correttamente assegnata a `v_entity_user_id` (non manipolabile dal JSON), ma i metadati interni al JSON non sono sanitizzati server-side.

---

## 7. Audit Bypass del Trigger

### 7.1. Analisi del Meccanismo
La migrazione `supabase/migrations/20260922000000_enforce_closed_snapshot_immutability.sql` implementa:
```sql
CREATE OR REPLACE FUNCTION public.check_user_app_state_immutability()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.fund_data->'metadata'->>'snapshotStatus' = 'CLOSED' THEN
    RAISE EXCEPTION 'SNAPSHOT_CLOSED: Annualita chiusa non modificabile'
      USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END;
$$;
```

### 7.2. Esito Audit Bypass
- Nel codice SQL effettivamente applicato su Staging **NON ESISTE ALCUNA VARIABILE DI BYPASS** (`app.bypass_closed_snapshot_immutability` non è presente).
- La transizione naturale da anno aperto a chiuso (`OPEN` → `CLOSED`) ha `OLD.snapshotStatus = 'OPEN'`, per cui la condizione `OLD = 'CLOSED'` è **FALSA** e il trigger non solleva eccezione.
- La gestione del retry su anno già chiuso in `close_annual_snapshot_atomic` controlla preliminarmente se l'anno è già `CLOSED` e non esegue alcun `UPDATE` sull'anno chiuso, limitandosi a verificare o creare l'anno successivo.
- **Classificazione:** `BYPASS_UNNECESSARY_BUT_SAFE` (l'immutabilità è assoluta e a prova di manomissione a livello trigger DB).

---

## 8. Test Anno Successivo Preesistente (Edge Case Critico)

### 8.1. Scenario di Test
Creazione su Staging di:
- Ente `WAVE1_CHECK8_...`
- Anno 2025: `OPEN`
- Anno 2026: `OPEN` con dati personalizzati già inseriti dall'utente (`userCustomField: 'DO_NOT_LOSE_THIS'`, `customSetting: 999`, note).
- Chiamata alla RPC di chiusura dell'anno 2025.

### 8.2. Risultato Rilevato
- La RPC ha eseguito il ramo `ELSE`:
  ```sql
  ELSE
    UPDATE public.user_app_state
    SET
      fund_data = p_next_fund_data,
      updated_at = timezone('utc'::text, now())
    WHERE entity_id = p_entity_id AND current_year = v_next_year;
  ```
- **Esito:** I dati preesistenti dell'anno 2026 sono stati **COMPLETAMENTE SOVRASCRITTI** dal template `p_next_fund_data`. I campi `userCustomField` e `customSetting` sono andati **PERDUTI**.
- **Nota Applicativa:** Sebbene `yearClosureWorkflow.ts` carichi preventivamente l'anno successivo per fondere il riporto, a livello database l'operazione di `UPDATE` cieco espone a sovrascritture distruttive in caso di chiamate concorrenti, disallineamenti client o invocazioni API dirette.
- **Classificazione:** `BLOCKER DATA INTEGRITY`. La RPC deve effettuare un merge conservativo (o il workflow deve garantire la preservazione atomica dei dati dell'anno successivo senza sovrascrittura totale).

---

## 9. Full Test Suite Finale

Esecuzione contestuale dei comandi di quality gate senza riuso di cache:

```
TYPESCRIPT:       0 errors (npx tsc --noEmit: Exit code 0)
TEST_FILES:       93 passed (93/93)
TESTS:            952 passed (952/952)
FAILURES:         0
BUILD:            SUCCESS (npm run build: Exit code 0, 18.25s)
REGRESSION:       8/8 superati (scripts/run_regression_tests.ts)
REGRESSION_DELTA: 0
```

Tutti i test unitari e di regressione del calcolo sono passati con zero delta e zero modifiche ai motori normativi.

---

## 10. Browser Smoke Closed

Test end-to-end eseguito via Playwright headless su Staging (`http://localhost:5002`):
- Creata entità di test reale con annualità 2025 chiusa (`CLOSED`).
- Autenticazione reale con credenziali `USER_A`.
- Apertura dell'annualità dalla lista enti in modalità `Consulta (🔒 CHIUSA)`.
- **Verifiche effettuate su ciascun modulo:**
  - **Salva Bozza:** Disabilitato con testo "Annualità Chiusa" (`opacity-70 cursor-not-allowed`).
  - **Fondo Personale Dipendente:** Banner visibile (`Annualità Chiusa (Sola Lettura)`), 20/20 input numerici disabilitati.
  - **Fondo Elevate Qualificazioni (EQ):** Banner visibile (`Annualità Chiusa (Sola Lettura)`), 11/11 input numerici disabilitati.
  - **Fondo Segretario Comunale:** Banner visibile (`Annualità Chiusa (Sola Lettura)`), 8/8 input numerici disabilitati.
  - **Fondo Dirigenza:** Banner visibile (`Annualità Chiusa (Sola Lettura)`), 9/9 input numerici disabilitati.
  - **Distribuzione Risorse:** Banner visibile, pulsante salvataggio disabilitato con dicitura "Annualità Chiusa".
  - **Persistenza dopo Reload:** I dati su Staging sono rimasti intatti a 55.000€ e status `CLOSED`.
- Evidence salvate in: `smoke_evidence/01_*.png` ... `05_*.png`.
- **Esito:** **PASS**.

---

## 11. Terminologia del Banner

### 11.1. Ricerca Occorrenze
- Nei componenti UI di Wave 1 la stringa adottata è:
  > *"Questo esercizio è stato definitivamente chiuso. Tutte le modifiche sono disabilitate per garantire l'immutabilità dei dati storici."*
- Nel testo del report riassuntivo `WAVE1_CLOSED_SNAPSHOT_IMPLEMENTATION_REPORT.md` era stata impropriamente impiegata la frase *"I dati di questa annualità sono certificati"*.

### 11.2. Valutazione Semantica
Lo stato `CLOSED` indica una chiusura applicativa e tecnica dell'esercizio contabile per impedire ulteriori modifiche, ma **non equivale a certificazione formale** (es. delibera approvata, visto del Collegio dei Revisori o certificazione MEF/Arconet).
- **Classificazione:** `SEMANTIC_FIX_REQUIRED`.
- **Azione richiesta:** Sostituire qualsiasi menzione di "certificati" nella documentazione e nei commenti con formulazioni neutre e tecnicamente rigorose come: *"Annualità chiusa: i dati sono bloccati e non possono essere modificati."*

---

## 12. Finding Status

| Finding ID | Descrizione | Stato Wave 1 | Dettaglio |
|---|---|:---:|---|
| **SEC-01** | Immutabilità database su record CLOSED | **VERIFIED** | Trigger PostgreSQL funzionante, testato contro Owner, Admin e chiamate dirette. Rifiuto garantito con codice `P0001`. |
| **FUNC-01** | Read-only UI e immutabilità reducer | **VERIFIED** | Reducer applicativo bloccato, 5 pagine fondo + personale + distribuzione totalmente non editabili, Salva Bozza disabilitato. |
| **DATA-02** | Chiusura atomica e idempotente | **PARTIALLY_RESOLVED** | Chiusura resa atomica in singola transazione via RPC; tuttavia sussiste il rischio di sovrascrittura totale dei dati dell'anno successivo se preesistente (vedi NF-01). |

---

## 13. New Findings Identificati nel Review Gate

### NF-01 (Severity: BLOCKER DATA INTEGRITY) — Sovrascrittura cieca dell'anno successivo preesistente nella RPC
- **File:** `supabase/migrations/20260922000001_close_annual_snapshot_atomic.sql` (righe 119–124)
- **Descrizione:** Se l'anno successivo esiste già (es. anno 2026 aperto con dati preventivi o bozze inserite), l'invocazione di `close_annual_snapshot_atomic` esegue un `UPDATE` cieco rimpiazzando l'intero oggetto JSONB con `p_next_fund_data`, distruggendo qualsiasi dato o nota già registrata.
- **Risoluzione Necessaria:** La RPC deve fondere i riporti (`jsonb_set` o preservazione delle sezioni non impattate dal carry-forward) o rifiutare la sovrascrittura distruttiva se l'anno successivo ha dati significativi.

### NF-02 (Severity: HIGH) — Assenza di validazione e sanitizzazione server-side dei metadati di chiusura
- **File:** `supabase/migrations/20260922000001_close_annual_snapshot_atomic.sql`
- **Descrizione:** La RPC si fida del parametro `p_closed_fund_data` passato dal client. La funzione deve forzare server-side `metadata.snapshotStatus = 'CLOSED'`, `metadata.closedAt = now()`, `metadata.closedBy = auth.email()` prima di persistere.

### NF-03 (Severity: MEDIUM) — Drift storico delle migrazioni e artificio `20260220000022_remote_baseline.sql`
- **File:** `supabase/migrations/20260220000022_remote_baseline.sql` e migrazioni untracked `20260220000000`–`20260220000007`.
- **Descrizione:** Esiste un disallineamento storico tra il git tree alla baseline `9f90771e` (che tracciava solo da `20260221131708` in avanti) e il database Staging. Prima di committare, occorre formalizzare la cronologia senza inserire file placeholder non concordati.

### NF-04 (Severity: LOW) — Trailing whitespace syntax check failure
- **File:** `src/pages/FondoElevateQualificazioniPage.tsx:165`
- **Descrizione:** `git diff --check` fallisce con exit code 1 a causa di uno spazio a fine riga.

### NF-05 (Severity: LOW) — Omissione file nel report Sezione 9
- **File:** `src/__tests__/localDraftPersistence.test.ts`
- **Descrizione:** Modificato nel git diff ma non elencato nella sezione 9 del report di implementazione.

---

## 14. Final Verdict

In ossequio al principio di massima prudenza e ai vincoli rigorosi di audit:
Poiché l'ispezione ha evidenziato che la RPC atomica sovrascrive interamente i dati dell'anno successivo se preesistente (Check 8 — `BLOCKER DATA INTEGRITY`), e sussiste un drift storico nelle migrazioni (`20260220000022_remote_baseline.sql`), la Wave 1 **NON PUÒ ESSERE CONSOLIDATA** nello stato attuale.

Il verdetto formale di questo review gate è:

```
WAVE1_REQUIRES_FIXES
```
