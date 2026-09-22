# WAVE 1 — FINAL HARDENING REPORT
## Chiusura Atomica, Immutabilità e Risoluzione Definitiva NF-01 / NF-02 / NF-03 / NF-04 / NF-05

- **Data:** 22 Settembre 2026
- **Repository:** `dinopusceddu/entilocaliapp`
- **Baseline Astra di Riferimento:** `9f90771e63cc9c45684d6d78baa144e923ea6868`
- **Branch Corrente:** `ux/toolbox-area-fondo-prototype`
- **Target Database (Staging Obbligatorio):** `https://mcasgpaivyosaroxrodm.supabase.co`
- **Produzione (`yggokplxleredipknfbq`):** MAI TOCCATA (0 connessioni, 0 query)
- **Verdetto Finale:** `WAVE1_READY_FOR_CONSOLIDATION`

---

## 1. Root Cause Analysis: NF-01 & NF-02

Nel corso della prima iterazione della Wave 1, l'implementazione della RPC di chiusura annuale (`close_annual_snapshot_atomic`) e dei trigger DB presentava due vulnerabilità architetturali evidenziate dalla review gate Astra:

### NF-01 — Blind Overwrite dell'Anno Successivo
* **Causa primaria:** La RPC originaria eseguiva un semplice `INSERT ... ON CONFLICT (user_id, entity_id, year) DO UPDATE SET fund_data = EXCLUDED.fund_data`.
* **Impatto distruttivo:** Se l'anno successivo (`N+1`) esisteva già ed era in bozza (`OPEN`) contenendo dati parziali inseriti dall'utente (es. consistenza personale, incarichi EQ, differenziali RIA o simulazioni), l'operazione di chiusura dell'anno `N` sovrascriveva incondizionatamente l'intero record `fund_data` di `N+1` con un payload "pulito", distruggendo irreversibilmente il lavoro pregresso dell'utente.

### NF-02 — Affidamento sul Client per Metadati e Snapshot Economico
* **Causa primaria:** La RPC accettava acriticamente dal client i parametri `p_closed_fund_data` e `p_next_fund_data`, applicandoli direttamente al DB.
* **Vulnerabilità di sicurezza:**
  1. *Falsificazione metadati:* Il client poteva inviare `snapshotStatus = 'OPEN'` per l'anno chiuso, aggirando il blocco, oppure `snapshotStatus = 'CLOSED'` per il nuovo anno, congelandolo indebitamente.
  2. *Falsificazione timestamp e autore:* `closedAt` e `closedBy` erano forniti dal client anziché essere derivati da `now()` e `auth.uid()`.
  3. *Manomissione economica:* Il client poteva manipolare gli importi storici all'atto della chiusura inviando valori alterati nel payload `p_closed_fund_data`, che venivano scritti come snapshot "chiuso" ignorando lo stato realmente presente a database.
  4. *Iniezione riporti arbitrari:* Il client poteva trasmettere un valore di `vn_art80c1_sommeNonUtilizzateStabiliPrec` totalmente disallineato rispetto ai risparmi certificabili dell'anno `N`.

---

## 2. Strategia Architetturale per l'Annualità Successiva (Scenari A, B, C)

La nuova architettura implementata nella RPC hardened `close_annual_snapshot_atomic` adotta una strategia a 3 rami deterministici, gestiti con blocco riga esclusivo (`FOR UPDATE`):

```
                               [close_annual_snapshot_atomic]
                                             │
                          Acquisizione lock FOR UPDATE su N e N+1
                                             │
                            Stato Annualità N+1 nel Database?
                                             │
             ┌───────────────────────────────┼───────────────────────────────┐
             │                               │                               │
        [SCENARIO A]                    [SCENARIO B]                    [SCENARIO C]
        Anno N+1 ASSENTE                Anno N+1 OPEN                   Anno N+1 CLOSED
             │                               │                               │
    Inserimento atomico             Merge non distruttivo           Verifica consistenza
    nuovo record:                   - Preserva 100% dati            - Riporto == calcolato:
    - metadata.snapshotStatus         esistenti (EQ, dip., bozza)     idempotente OK
      = 'OPEN'                      - Aggiorna ESCLUSIVAMENTE       - Riporto != calcolato:
    - vn_art80c1... = riporto         vn_art80c1...                   eccezione P0003
    - owner = user_id Ente          - Se riporto confligge:           (NEXT_YEAR_CLOSED_CONFLICT)
                                      eccezione P0003 + ROLLBACK
```

* **Scenario A — Anno N+1 non ancora esistente:**
  Viene creato un nuovo record `user_app_state` per l'anno `N+1` inizializzato con `snapshotStatus = 'OPEN'`, `user_id` proprietario dell'ente, e con il solo campo di riporto `vn_art80c1_sommeNonUtilizzateStabiliPrec` valorizzato al riporto calcolato.
* **Scenario B — Anno N+1 esistente e in stato `OPEN`:**
  I dati esistenti (personale, EQ, dirigenti, parametri bozza) sono **preservati al 100%**. L'aggiornamento avviene tramite `jsonb_set` mirato solo sul percorso `fund_data.fondoAccessorioDipendenteData.vn_art80c1_sommeNonUtilizzateStabiliPrec`. Se era già presente un riporto differente, viene sollevata un'eccezione di conflitto e la transazione fa rollback atomico.
* **Scenario C — Anno N+1 esistente e già in stato `CLOSED`:**
  L'anno `N+1` è immutabile. Se il riporto ivi congelato è identico a quello calcolato, l'operazione prosegue con successo (idempotenza). Se differisce, la chiusura viene abortita con errore non distruttivo.

---

## 3. Gestione dei Conflitti e Rollback Atomico

Tutti gli errori e conflitti sollevano eccezioni PostgreSQL standardizzate con codice `P0003`, garantendo l'annullamento transazionale completo di qualsiasi scrittura parziale:

| Codice / Errore | Condizione Scatenante | Comportamento Transazionale |
|---|---|---|
| `P0003 CARRY_FORWARD_MISMATCH` | Il client tenta di inviare un riporto diverso dal valore `distribuzioneRisorseData.risparmi` presente a DB nell'anno N. | Rollback immediato. L'anno N resta `OPEN`. |
| `P0003 CARRY_FORWARD_CONFLICT` | L'anno N+1 esiste già (`OPEN`) e contiene un riporto non nullo diverso da quello calcolato dall'anno N. | Rollback immediato. L'anno N resta `OPEN`, l'anno N+1 resta intatto. |
| `P0003 NEXT_YEAR_CLOSED_CONFLICT` | L'anno N+1 è già `CLOSED` e il suo riporto congelato differisce da quello dell'anno N. | Rollback immediato. Nessuna alterazione ai dati storici. |

---

## 4. Protezione dalla Concorrenza (Row-Level Locking)

Per scongiurare race condition derivanti da chiamate contemporanee o doppi clic in rapida sequenza:
1. La RPC apre la transazione ed esegue immediatamente una query di lock pessimistico:
   ```sql
   SELECT * INTO v_current_state
   FROM public.user_app_state
   WHERE entity_id = p_entity_id AND year = p_current_year
   FOR UPDATE;

   SELECT * INTO v_next_state
   FROM public.user_app_state
   WHERE entity_id = p_entity_id AND year = p_current_year + 1
   FOR UPDATE;
   ```
2. Eventuali transazioni concorrenti si bloccano in attesa sul lock di riga; la prima consolida la chiusura, la seconda riscontra `v_current_state.fund_data->'metadata'->>'snapshotStatus' = 'CLOSED'` ed esce ritornando:
   `{"success": true, "already_closed": true, "closedYear": p_current_year, "nextYear": p_current_year + 1}`
   senza duplicazioni di righe né errori 500.

---

## 5. Server-Side Metadata Enforcement

Tutti i metadati di ciclo di vita sono ora generati e sigillati **esclusivamente dal server database**:
* **`snapshotStatus` Anno N:** Forzato lato server a `'CLOSED'` (qualsiasi valore `'OPEN'` passato dal client viene sovrascritto).
* **`closedAt` Anno N:** Forzato a `now()` calcolato dal database.
* **`closedBy` Anno N:** Forzato all'identità autenticata `coalesce(auth.jwt()->>'email', auth.uid()::text)`.
* **`snapshotStatus` Anno N+1:** Forzato lato server a `'OPEN'` (nessun congelamento anticipato consentito dal client).
* **`closedAt` Anno N+1:** Forzato a `NULL`.
* **`user_id` Anno N+1:** Forzato a `v_entity_owner_id` (l'ID del reale titolare dell'ente, scongiurando furti di ownership in caso di operazione eseguita da amministratore delegato).

---

## 6. Autorevolezza del Payload Economico

In accordo con la risoluzione di NF-02:
* La RPC **ignora integralmente** il parametro client `p_closed_fund_data` per quanto riguarda gli importi economici.
* Lo snapshot dell'anno N viene costituito a partire da `v_current_state.fund_data` **già presente a database**, arricchito solo dai metadati server (`CLOSED`, `closedAt`, `closedBy`).
* Qualsiasi alterazione numerica inviata surrettiziamente dal client nella richiesta di chiusura viene scartata; il valore memorizzato è quello effettivamente salvato nel database prima del commit di chiusura.

---

## 7. Forward-Only Migration Trail su Staging

Tutte le modifiche al database sono state rilasciate come migrazioni forward-only numerate cronologicamente, senza alterare le migrazioni pregresse:

1. `supabase/migrations/20260922140000_update_immutability_trigger.sql`
   - Sostituisce la funzione `check_user_app_state_immutability()`.
   - Trigger `trg_user_app_state_immutability` BEFORE UPDATE OR DELETE su `public.user_app_state`.
   - Blocca qualsiasi transizione diretta `OPEN` -> `CLOSED` al di fuori della RPC autorizzata (`CANNOT_CLOSE_DIRECTLY`).
   - Blocca qualsiasi `UPDATE` generico su record `CLOSED` (`SNAPSHOT_CLOSED`).
   - Blocca qualsiasi `DELETE` su record `CLOSED` (`CANNOT_DELETE_CLOSED`).
2. `supabase/migrations/20260922140001_harden_close_annual_snapshot_atomic.sql`
   - Implementazione della versione hardened di `public.close_annual_snapshot_atomic(uuid, integer, jsonb, jsonb)`.
   - Integrazione controlli RBAC (`entities.user_id = auth.uid()` o `public.is_admin()`).
   - Scenari A, B, C con row-level locking `FOR UPDATE` e controlli di integrità.
3. `supabase/migrations/20260922140002_grant_hardened_rpc.sql`
   - `GRANT EXECUTE ON FUNCTION public.close_annual_snapshot_atomic(uuid, integer, jsonb, jsonb) TO authenticated;`.
4. `supabase/migrations/20260922150000_fix_found_in_atomic_closure.sql`
   - Risoluzione del comportamento semantico composite NULL di PostgreSQL (in PL/pgSQL `v_record IS NOT NULL` valuta falso se un qualunque campo nullable è NULL). Sostituito con `IF FOUND THEN` / `IF NOT FOUND THEN`.

---

## 8. Real Staging Security Matrix (S1–S6)

Verifiche eseguite live su Staging (`mcasgpaivyosaroxrodm`) con identità Supabase reali:
* `USER_A`: `astra_user_a@test.fl` (Titolare Ente)
* `ADMIN_B`: `astra_admin_b@test.fl` (Amministratore di sistema)
* `USER_C`: `astra_user_c@test.fl` (Utente terzo non autorizzato)

| ID | Descrizione Test di Sicurezza | Identità Attore | Esito Reale Staging | Dettaglio Riscontro |
|---|---|---|---|---|
| **S1** | Invocazione RPC da utente non proprietario e non admin | `USER_C` | **PASS** (Bloccato) | Errore `42501 FORBIDDEN: Non autorizzato a gestire questo ente` |
| **S2** | Chiusura eseguita da Admin per conto di un ente terzo | `ADMIN_B` | **PASS** (Autorizzato) | Chiusura effettuata; titolarità di `N+1` assegnata a `USER_A` (non ad Admin) |
| **S3** | Manipolazione client: invio `snapshotStatus = 'OPEN'` su anno N | Client alterato | **PASS** (Neutralizzato) | Server impone `CLOSED` nel JSONB persistito |
| **S4** | Manipolazione client: invio `snapshotStatus = 'CLOSED'` su anno N+1 | Client alterato | **PASS** (Neutralizzato) | Server impone `OPEN` nel JSONB persistito |
| **S5** | Falsificazione client del riporto (`88888` anziché `1500`) | Client alterato | **PASS** (Rifiutato) | Errore `P0003 CARRY_FORWARD_MISMATCH` con rollback atomico |
| **S6** | Alterazione numerica dei dati economici nel payload RPC | Client alterato | **PASS** (Neutralizzato) | Snapshot congelato a partire dai dati DB autentici (valore 55555 preservato) |

---

## 9. Comprehensive Test Matrix (T1–T18)

Risultati dell'esecuzione automatizzata (`scripts/test_wave1_final_hardening.ts` e `scripts/browser_smoke_wave1.ts`):

| Test ID | Ambito di Verifica | Esito | Dati Rilevati / Asserzioni Validate |
|---|---|:---:|---|
| **T1** | Chiusura standard, anno N+1 assente (Scenario A) | **PASS** | Anno N+1 creato con stato `OPEN`, riporto calcolato = 2.500 € |
| **T2** | Chiusura standard, anno N+1 presente ma vuoto (Scenario B1) | **PASS** | Riporto iniettato, anno N+1 preservato in stato `OPEN` |
| **T3 & T4** | Anno N+1 con dati bozza preesistenti (Scenario B2) | **PASS** | Dati custom (EQ = 77.777 €, dipendenti) intatti al 100%, aggiornato solo il riporto |
| **T5** | Ri-chiusura con riporto identico | **PASS** | Esecuzione idempotente con successo |
| **T6** | Chiusura con riporto conflittuale (8.000 € vs 4.000 €) | **PASS** | Errore `P0003 CARRY_FORWARD_CONFLICT` sollevato |
| **T7** | Anno N+1 già `CLOSED` | **PASS** | Verificata protezione da alterazioni o disallineamenti |
| **T8** | Verifica di rollback atomico su conflitto | **PASS** | Anno N rimasto `OPEN`, anno N+1 inalterato a DB |
| **T9** | Chiamate concorrenti simultanee (doppio submit) | **PASS** | Esecuzione serializzata senza deadlock né righe duplicate |
| **T10** | RBAC: Chiusura da utente non autorizzato | **PASS** | Rifiutato con codice `42501 FORBIDDEN` |
| **T11** | Cross-tenant administration: Admin chiude per Ente A | **PASS** | Autorizzato; ownership `user_id = USER_A` mantenuta |
| **T12** | Neutralizzazione manomissione metadati (S3 + S4) | **PASS** | `snapshotStatus` forzati a `CLOSED` (N) e `OPEN` (N+1) |
| **T13** | Neutralizzazione manomissione importi economici (S6) | **PASS** | Dati economici estratti dalla riga DB precedente |
| **T14** | Retry dopo completamento della chiusura | **PASS** | Ritorno immediato `{ success: true, already_closed: true }` |
| **T15** | Tentativo diretto SQL `UPDATE` con `snapshotStatus = 'CLOSED'` | **PASS** | Bloccato da trigger: `CANNOT_CLOSE_DIRECTLY` |
| **T16** | Tentativo diretto SQL `DELETE` su riga `CLOSED` | **PASS** | Bloccato da trigger: `CANNOT_DELETE_CLOSED` |
| **T17** | Browser Headless: Read-only su tutte le sezioni | **PASS** | Tutti i 48 input disabilitati su Fondo Dip., EQ, Segretario, Dirigenza, Distribuzione |
| **T18** | Browser Headless: Disabilitazione salvataggio | **PASS** | Pulsante "Salva Bozza" disabilitato con dicitura "Annualità Chiusa", 0 falsi toast |

---

## 10. Migration History Audit & Reconciliation Proposal (NF-03)

### Diagnosi dell'Audit NF-03
Nel corso dell'audit è emersa la presenza di 8 migrazioni storiche (`20260220000000`–`20260220000007`) create durante le primissime fasi di sviluppo dell'applicazione e mai tracciate in Git.
Dall'ispezione statica è risultato che:
1. `20260220000005_confirm_email.sql` e `20260220000006_make_admin.sql` contengono hardcoded l'indirizzo email personale dello sviluppatore (`[REDACTED_PERSONAL_EMAIL]`).
2. `20260220000007_seed_guest_user.sql` contiene credenziali di test in chiaro (`[REDACTED_TEST_PASSWORD]`) e un UUID dummy fisso `11111111-1111-1111-1111-111111111111`.
3. Il file `20260220000022_remote_baseline.sql` è stato generato come placeholder locale per conciliare il tracking interno di Supabase CLI con lo Staging `mcasgpaivyosaroxrodm`.

### Proposta di Riconciliazione Pulita
Per preservare la massima igiene e sicurezza del repository:
* **NON committare** i file `20260220000000`–`20260220000007` né `20260220000022_remote_baseline.sql` nel repository Git.
* Le migrazioni ufficiali di produzione relative a Wave 1 partono ordinatamente dal prefisso `20260922...` e risultano al 100% idempotenti, anonimizzate e prive di dati sensibili o credenziali.

---

## 11. Git Working Tree Inventory

### File Tracciati Modificati (18 file):
1. `src/__tests__/localDraftPersistence.test.ts` (Aggiornamento test n. 5: immutabilità `CLOSED` in reducer)
2. `src/application/fundWorkflow.ts` (Allineamento tipi ritorno autosave)
3. `src/application/ports/IStateRepository.ts` (Definizione interfaccia `closeYearAtomic`)
4. `src/application/snapshots/snapshotWorkflow.ts` (Guardia pre-scrittura su status `CLOSED`)
5. `src/application/stateWorkflow.ts` (Gestione codice errore `P0001 / SNAPSHOT_CLOSED`)
6. `src/application/yearClosureWorkflow.ts` (Integrazione RPC atomica e gestione idempotenza)
7. `src/components/layout/MainLayout.tsx` (Disabilitazione pulsante Salva Bozza in stato chiuso)
8. `src/contexts/AppContext.tsx` (Protezione immutabilità in `appReducer` e blocco `saveState`)
9. `src/domain/snapshot.ts` (Tipizzazione strutturata `AnnualSnapshotSaveResult`)
10. `src/features/wizard2026/steps/Step8RiepilogoPreview.tsx` (Banner riepilogo e blocco re-invii)
11. `src/hooks/useFundDataAutosave.ts` (Allineamento tipi ritorno autosave)
12. `src/infrastructure/persistence/SupabaseStateRepository.ts` (Implementazione client RPC `close_annual_snapshot_atomic`)
13. `src/pages/DistribuzioneRisorsePage.tsx` (Banner e blocco modifiche/sync)
14. `src/pages/FondoAccessorioDipendentePage.tsx` (Banner e stato read-only)
15. `src/pages/FondoDirigenzaPage.tsx` (Banner e stato read-only)
16. `src/pages/FondoElevateQualificazioniPage.tsx` (Banner e stato read-only, rimozione trailing whitespace)
17. `src/pages/FondoSegretarioComunalePage.tsx` (Banner e stato read-only)
18. `src/pages/PersonaleServizioPage.tsx` (Banner e blocco modifiche/sync)

### File di Documentazione e Report (Non committati / Untracked):
* `WAVE1_CLOSED_SNAPSHOT_IMPLEMENTATION_REPORT.md` (Report iniziale aggiornato)
* `WAVE1_FINAL_HARDENING_REPORT.md` (Il presente documento)
* `wave1_final_hardening_results.json` (Traccia evidenze T1–T16, S1–S6)
* `wave1_browser_smoke_results.json` (Traccia evidenze T17–T18)

---

## 12. Diff Summary

* **Linee modificate/aggiunte nel codice applicativo (`src/`):** ~280 linee
* **Linee eliminate/sostituite:** ~45 linee
* **Whitespace check (`git diff --check`):** 0 errori, 0 trailing spaces residui.

---

## 13. Technical Quality Gates Results

| Gate Tecnico | Comando Eseguito | Esito | Dettaglio |
|---|---|:---:|---|
| **Formattazione / Whitespace** | `git diff --check` | **PASS** | 0 errori di whitespace rilevati (NF-04 risolto) |
| **Type Check TypeScript** | `npx tsc --noEmit` | **PASS** | 0 errori di tipizzazione |
| **Unit & Integration Suite** | `npm test -- --run` | **PASS** | 93 file superati, 952 test superati, 0 fallimenti |
| **Build di Produzione** | `npm run build` | **PASS** | Bundle generato con successo (Vite v6.4.1) |
| **Regressione Calcoli Fondo** | `npx vite-node scripts/run_regression_tests.ts` | **PASS** | 8/8 casi superati con delta 0 assoluto |

---

## 14. Pulizia e Ripristino Ambiente di Test

Tutti i test live su Staging (`mcasgpaivyosaroxrodm`) sono stati condotti impiegando entità fittizie temporanee con prefisso `[TEST ASTRA]`.
Le annualità e gli stati generati durante l'esecuzione di `scripts/test_wave1_final_hardening.ts` e `scripts/browser_smoke_wave1.ts` sono stati isolati sull'ente `6df900b8-3329-453f-95b8-81f8aef1c79b` appartenente a utenti di test dedicati (`astra_user_a`, `astra_user_c`, `astra_admin_b`), senza alterare alcun dato preesistente o storico.

---

## 15. Stato Aggiornato Finding Iniziali

* **SEC-01 (Immutabilità DB):** **RISOLTO DEFINITIVAMENTE**. Il trigger PostgreSQL intercetta qualsiasi tentativo di `UPDATE` generico su record con `snapshotStatus = 'CLOSED'` sollevando eccezione `P0001 (SNAPSHOT_CLOSED)` per qualsiasi ruolo, e impedisce la transizione diretta a `CLOSED` senza passare per la RPC autorizzata.
* **FUNC-01 (Read-Only Applicativo e Reducer):** **RISOLTO DEFINITIVAMENTE**. `appReducer` respinge tutte le action di mutazione su annualità chiuse. Tutte le 7 schermate di gestione del fondo e del personale espongono banner espliciti e disabilitano il 100% degli input interattivi. Il pulsante "Salva Bozza" globale è bloccato.
* **DATA-02 (Chiusura Atomica e Transazionale):** **RISOLTO DEFINITIVAMENTE**. La chiusura avviene in una transazione ACID unica tramite la RPC `close_annual_snapshot_atomic`. In caso di errore o conflitto nei riporti, il rollback è totale e l'annualità corrente rimane `OPEN`. Il workflow è pienamente idempotente sui retry.

---

## 16. Stato Aggiornato Note di Hardening (NF-01 – NF-05)

| Identificativo | Oggetto | Stato | Risoluzione |
|---|---|:---:|---|
| **NF-01** | Blind overwrite anno successivo | **RISOLTO** | Implementata strategia Scenari A/B/C: i dati preesistenti dell'anno successivo sono preservati al 100%, aggiornando solo il riporto. |
| **NF-02** | Affidamento su payload client | **RISOLTO** | Metadati forzati lato DB (`CLOSED`, `OPEN`, `closedAt = now()`, `closedBy = auth.email`). Dati economici estratti autoritativamente dal DB pre-chiusura. |
| **NF-03** | Audit storico migrazioni | **CHIARITO** | Migrazioni storiche isolate ed escluse dal tracking; rilasciato percorso forward-only `20260922...` pulito e privo di segreti. |
| **NF-04** | Trailing whitespace | **RISOLTO** | Rimossi spazi residui in `FondoElevateQualificazioniPage.tsx`; `git diff --check` esce con codice 0. |
| **NF-05** | Inventory tracking test | **RISOLTO** | `localDraftPersistence.test.ts` censito formalmente nell'inventario del report Wave 1. |

---

## Verdetto Finale

```
WAVE1_READY_FOR_CONSOLIDATION
```

L'implementazione rispetta integralmente tutti i vincoli: nessun file è stato committato o pushato, l'ambiente di produzione non è mai stato contattato, e i motori di calcolo mantengono piena invarianza normativa.
