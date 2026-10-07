# Wave 1 Implementation Report — Immutabilità e Chiusura Atomica delle Annualità

**Data:** 22 Settembre 2026\
**Repository:** `dinopusceddu/entilocaliapp`\
**Baseline auditata da Astra:** `9f90771e63cc9c45684d6d78baa144e923ea6868`\
**Branch:** `ux/toolbox-area-fondo-prototype`\
**Ambiente di verifica live:** Staging (`https://mcasgpaivyosaroxrodm.supabase.co`)\
**Stato finale:** `WAVE1_READY_FOR_REVIEW`

---

## 1. Executive Summary

La presente Wave 1 ha implementato la soluzione strutturale, atomica e verificata per le tre vulnerabilità e difetti critici evidenziati nell'audit Astra:
- **SEC-01 (Blocker):** Mancanza di immutabilità a livello database per annualità chiuse (`snapshotStatus = 'CLOSED'`), che consentiva UPDATE arbitrari a chiunque.
- **FUNC-01 (High):** Mancanza di stato read-only coerente e permissività del reducer UI, con conseguenti mutazioni visive, autosave non bloccati e falsi messaggi di successo.
- **DATA-02 (High):** Mancanza di atomicità transazionale nel workflow di chiusura annuale; in caso di errore di rete/DB durante la creazione dell'anno successivo, l'anno corrente rimaneva "CLOSED" e il retry falliva permanentemente lasciando il database in stato corrotto.

L'invariante fondamentale è ora pienamente operativa e verificata sia in test automatici isolati (10/10) sia live su Staging Supabase:
> **Invariante:** *Una annualità CLOSED è immutabile a livello database e applicativo. Nessun normale UPDATE diretto può modificarne i dati (nemmeno da parte dell'owner o dell'amministratore). La chiusura annuale è un'operazione atomica, transazionale, ripetibile e recuperabile. La UI non può mostrare modifiche né messaggi di successo non corrispondenti alla realtà persistita.*

Nessun motore di calcolo, norma contrattuale (CCNL 0,14 / 0,22, Art. 60, DL 25, PNRR, Tabella 15) o documento è stato toccato. I test di regressione del calcolo mantengono **8/8 OK con delta 0**.

---

## 2. Audit Baseline & Findings Addressed

| Finding ID | Severità | Descrizione Originale | Risoluzione Wave 1 |
|---|---|---|---|
| **SEC-01** | **BLOCKER** | Generic `UPDATE` SQL consentito su righe con `snapshotStatus = 'CLOSED'`. Qualsiasi utente con permessi di riga o admin poteva sovrascrivere dati storici e importi consolidati. | Trigger PostgreSQL `enforce_user_app_state_closed_immutability` BEFORE UPDATE su `user_app_state`. Solleva eccezione `P0001 (SNAPSHOT_CLOSED)` bloccando qualsiasi `UPDATE` generico. Nessuna eccezione per ruolo utente. |
| **FUNC-01** | **HIGH** | In UI, i componenti dei fondi e del personale consentivano modifiche locali quando l'annualità era chiusa. `appReducer` applicava le modifiche allo stato in memoria e i toast mostravano falsi successi. | 1) `appReducer` intercetta e scarta tutte le azioni mutanti se `snapshotStatus === 'CLOSED'`.<br>2) `saveAppStateWorkflow` e `useFundDataAutosave` intercettano lo status chiuso e ritornano `{ success: false, reason: 'SNAPSHOT_CLOSED' }`.<br>3) 7 schermate chiave e layout globale rendono tutti i controlli disabled, bloccano handler ed effect di sincronizzazione, ed espongono un banner informativo chiaro. |
| **DATA-02** | **HIGH** | Il workflow di chiusura eseguiva due scritture separate e sequenziali (marcatura `CLOSED` poi creazione anno successivo con riporti). In caso di fallimento della seconda scrittura, l'annualità corrente rimaneva bloccata in `CLOSED` e il ri-tentativo falliva per sempre. | RPC atomica PostgreSQL `close_annual_snapshot_atomic` eseguita in singola transazione ACID. In caso di errore, si verifica il rollback completo. Il workflow applicativo è ora idempotente e gestisce retry senza duplicazioni. |

---

## 3. Architectural Changes & Database Migrations

Sono state applicate e verificate 3 migrazioni sullo schema Staging Supabase:

### 3.1. `supabase/migrations/20260922000000_enforce_closed_snapshot_immutability.sql`
- **Funzione `enforce_user_app_state_closed_immutability()`:**
  - Verifica lo stato precedente nel JSONB: `OLD.fund_data->'metadata'->>'snapshotStatus'`.
  - Se è `'CLOSED'`, verifica se la variabile di sessione della transazione `app.bypass_closed_snapshot_immutability` è impostata su `'true'`.
  - Se non lo è, solleva l'eccezione SQL:
    ```sql
    RAISE EXCEPTION 'SNAPSHOT_CLOSED: Annualita chiusa non modificabile'
      USING ERRCODE = 'P0001';
    ```
- **Trigger `trg_enforce_user_app_state_closed_immutability`:**
  - Registrato `BEFORE UPDATE ON public.user_app_state FOR EACH ROW`.

### 3.2. `supabase/migrations/20260922000001_close_annual_snapshot_atomic.sql`
- **RPC `close_annual_snapshot_atomic`:**
  - Parametri: `p_entity_id UUID`, `p_current_year INTEGER`, `p_closed_fund_data JSONB`, `p_next_fund_data JSONB`.
  - Configurato `SECURITY DEFINER` e `SET search_path = public`.
  - Esegue `SET LOCAL app.bypass_closed_snapshot_immutability = 'true'`.
  - Aggiorna atomisticamente la riga dell'anno corrente a `CLOSED`.
  - Esegue l'UPSERT della riga dell'anno successivo con lo stato `OPEN` e i riporti calcolati (`vn_art80c1_sommeNonUtilizzateStabiliPrec`).
  - Emette log di audit nella tabella `audit_logs`.
  - Qualsiasi eccezione genera un `ROLLBACK` completo della transazione.

### 3.3. `supabase/migrations/20260922000002_grant_close_annual_snapshot_atomic.sql`
- Concessione dei permessi di esecuzione:
  ```sql
  GRANT EXECUTE ON FUNCTION public.close_annual_snapshot_atomic(uuid, integer, jsonb, jsonb) TO authenticated;
  ```

---

## 4. Domain & Application Layer Implementation

### 4.1. Domain: `src/domain/snapshot.ts`
- Tipizzazione di ritorno strutturata:
  ```typescript
  export interface AnnualSnapshotSaveResult {
    success: boolean;
    reason?: 'SNAPSHOT_CLOSED' | 'OWNERSHIP_VIOLATION' | 'VALIDATION_ERROR' | 'DB_ERROR' | 'UNKNOWN';
    error?: string;
    data?: any;
  }
  ```

### 4.2. Repository Port & Adapter:
- **`src/application/ports/IStateRepository.ts`:**
  - Aggiunto contratto `closeYearAtomic(params: CloseYearAtomicParams): Promise<{ data: any; error: any }>`.
- **`src/infrastructure/persistence/SupabaseStateRepository.ts`:**
  - Implementato `closeYearAtomic` tramite invocazione sicura della RPC Supabase `close_annual_snapshot_atomic`.

### 4.3. Workflows:
- **`src/application/snapshots/snapshotWorkflow.ts`:**
  - Controlla preventivamente `snapshotStatus === AnnualSnapshotStatus.CLOSED` prima di qualsiasi tentativo di persistenza.
  - Ritorna immediatamente `{ success: false, reason: 'SNAPSHOT_CLOSED', error: '...' }`.
- **`src/application/stateWorkflow.ts`:**
  - In caso di errore sollevato dal trigger database (codice `P0001` o messaggio contenente `SNAPSHOT_CLOSED`), ritorna `{ success: false, reason: 'SNAPSHOT_CLOSED' }`.
  - Non genera notifiche o toast di successo fuorvianti.
- **`src/application/yearClosureWorkflow.ts`:**
  - Sostituita la precedente chiusura a due step con l'invocazione della RPC atomica `closeYearAtomic`.
  - Implementata protezione di idempotenza: se l'anno corrente è già `CLOSED` e l'anno successivo esiste già con i riporti corretti, ritorna successo immediato senza ri-eseguire scritture né generare duplicati.
- **`src/contexts/AppContext.tsx`:**
  - `appReducer`: Prima di applicare qualsiasi azione mutante (es. `UPDATE_FONDO_ACCESSORIO_DIPENDENTE_DATA`, `UPDATE_DISTRIBUZIONE_RISORSE_DATA`, `ADD_PERSONALE_SERVIZIO_DETTAGLIO`, ecc.), verifica se lo stato corrente ha `metadata.snapshotStatus === AnnualSnapshotStatus.CLOSED`. In caso affermativo, logga un warning e ritorna l'oggetto `state` inalterato (referential equality preservata).
  - `saveState`: In caso di stato `CLOSED`, intercetta e ritorna `{ success: false, reason: 'SNAPSHOT_CLOSED' }`.
  - `closeCurrentYear`: All'esito positivo della RPC, aggiorna immediatamente lo stato in memoria marcandolo `CLOSED`.

---

## 5. UI Read-Only Enforcement Details

Tutte le pagine e i flussi di modifica sono stati resi impermeabili a modifiche quando `snapshotStatus === 'CLOSED'`:

1. **`src/pages/FondoAccessorioDipendentePage.tsx`:**
   - Calcola `isClosed = state.fundData?.metadata?.snapshotStatus === AnnualSnapshotStatus.CLOSED`.
   - Banner visivo: *"Annualità Chiusa: I dati di questa annualità sono bloccati e non possono essere modificati."*
   - Gli handler di modifica e gli `useEffect` di background sync sono protetti da early return.
   - Componenti `FundingItem` e pulsanti di salvataggio/riallineamento disabilitati.
2. **`src/pages/FondoElevateQualificazioniPage.tsx`:**
   - Banner di annualità chiusa.
   - Tutti i campi numerici e toggle disabilitati.
   - Pulsante "Riallinea Posizioni Organizzative" nascosto in stato chiuso.
3. **`src/pages/FondoSegretarioComunalePage.tsx`:**
   - Banner e disabilitazione di tutti i campi (galleggiamento, maggiorazioni).
4. **`src/pages/FondoDirigenzaPage.tsx`:**
   - Banner e disabilitazione di quota base, RIA e voci variabili.
5. **`src/pages/PersonaleServizioPage.tsx`:**
   - Banner informativo.
   - Pulsanti "Aggiungi Dipendente", "Sincronizza da Art. 23", "Modalità Manuale" e cancellazione riga disabilitati.
   - `useEffect` di sync da Art. 23 neutralizzato per evitare mutazioni asincrone.
6. **`src/pages/DistribuzioneRisorsePage.tsx`:**
   - Banner di avviso.
   - Input criteri, `VariableFundingItem`, `SimpleFundingItem` e salvataggio disabilitati con blocco degli handler.
   - Neutralizzati i 3 `useEffect` di calcolo/sincronizzazione residui.
7. **`src/features/wizard2026/steps/Step8RiepilogoPreview.tsx`:**
   - Banner informativo sul riepilogo.
   - Pulsante o modale di chiusura annuale protetto contro re-invii.
8. **`src/components/layout/MainLayout.tsx`:**
   - Pulsante globale "Salva Bozza" disabilitato con dicitura "Annualità Chiusa".

---

## 6. Automated Test Suite Results (C1–C10)

Il file `src/__tests__/wave1ClosedSnapshot.test.ts` implementa e valida formalmente tutti i casi di test previsti dalla specifica Wave 1:

```
 RUN  v0.34.6 C:/Users/PuscedduD/Il mio Drive/Progetto FL APP/entilocaliapp

 ✓ src/__tests__/wave1ClosedSnapshot.test.ts (10 tests) 38ms
   ✓ C1: saves successfully when annual snapshot is OPEN
   ✓ C2: rejects normal application save on a CLOSED snapshot with reason SNAPSHOT_CLOSED
   ✓ C3: blocks direct SQL UPDATE by entity owner on a CLOSED row via DB trigger
   ✓ C4: blocks direct SQL UPDATE by administrator on a CLOSED row via DB trigger (no role exemption)
   ✓ C5: appReducer rejects mutating actions and preserves existing state when snapshotStatus is CLOSED
   ✓ C6: saveAppStateWorkflow returns SNAPSHOT_CLOSED when database trigger aborts update
   ✓ C7: when next-year creation fails, the atomic transaction rolls back and current year is not left closed
   ✓ C8: retrying closure on an already closed year returns success with carry-forward idempotently
   ✓ C9: handles rapid sequential / double submit closure calls safely
   ✓ C10: executes full atomic closure with carry-forward injected into next year

 Test Files  1 passed (1)
      Tests  10 passed (10)
```

---

## 7. Live Staging Verification Results

La verifica live è stata condotta eseguendo `scripts/test_wave1_staging.ts` direttamente sul database Supabase di Staging (`https://mcasgpaivyosaroxrodm.supabase.co`).

### 7.1. Esito da `wave1_verification_staging.json`:
```json
{
  "timestamp": "2026-09-22T11:05:44.048Z",
  "target": "https://mcasgpaivyosaroxrodm.supabase.co",
  "checks": {
    "ownerDirectUpdateBlocked": {
      "passed": true,
      "errorReported": "SNAPSHOT_CLOSED: Annualita chiusa non modificabile"
    },
    "adminDirectUpdateBlocked": {
      "passed": true,
      "errorReported": "SNAPSHOT_CLOSED: Annualita chiusa non modificabile"
    },
    "atomicClosureRpcSuccess": {
      "passed": true,
      "rpcData": {
        "success": true,
        "nextYear": 2024,
        "closedYear": 2023
      }
    },
    "newlyClosedYearIsImmutable": {
      "passed": true
    }
  },
  "overallStatus": "ALL_TESTS_PASSED"
}
```

### 7.2. Confronto Prima / Dopo (Baseline vs Wave 1):
- **Prima (Vulnerabilità confermata in `wave1_reproduction_before.json`):**
  - Owner direct update: `rowsUpdated: 1`, `persistedRIA: 99999` (Vulnerabilità SEC-01 confermata).
  - UI local state: `afterLocalMutationRIA: 12345` (Vulnerabilità FUNC-01 confermata).
  - Chiusura non atomica: `currentYearStatusAfterFailure: "CLOSED"`, `nextYearExists: false`, retry bloccato per sempre (Vulnerabilità DATA-02 confermata).
- **Dopo (Verifica in `wave1_verification_staging.json`):**
  - Owner direct update: **BLOCCATO** con eccezione `P0001: SNAPSHOT_CLOSED: Annualita chiusa non modificabile`.
  - Admin direct update: **BLOCCATO** con eccezione `P0001: SNAPSHOT_CLOSED: Annualita chiusa non modificabile`.
  - Chiusura atomica: **RIUSCITA** via RPC `close_annual_snapshot_atomic` in transazione singola, con riporto `vn_art80c1_sommeNonUtilizzateStabiliPrec`.
  - Nuova annualità chiusa: **IMMEDIATAMENTE IMMUTABILE** nel DB.

---

## 8. Calculation Engine Non-Regression Evidence

L'esecuzione dello script di regressione attesta l'assenza totale di alterazioni logiche o numeriche ai motori di calcolo:

```bash
npx vite-node scripts/run_regression_tests.ts
```
```
--- Test di Regressione del Motore di Calcolo (Consolidato) ---
Testing: caso-distribuzione-consuntivo.json... ✅ OK
Testing: caso-incremento-2025.json... ✅ OK
Testing: caso-riporti-anno-precedente.json... ✅ OK
Testing: caso-superamento-tetto-art23.json... ✅ OK
Testing: ente-con-dirigenza.json... ✅ OK
Testing: ente-con-eq.json... ✅ OK
Testing: ente-con-segretario.json... ✅ OK
Testing: ente-senza-dirigenza.json... ✅ OK

--- Risultato Finale: 8/8 superati ---
```

---

## 9. Files Modified / Created

### Nuovi File:
- `supabase/migrations/20260922000000_enforce_closed_snapshot_immutability.sql` (Trigger BEFORE UPDATE)
- `supabase/migrations/20260922000001_close_annual_snapshot_atomic.sql` (RPC atomica con bypass sessionale)
- `supabase/migrations/20260922000002_grant_close_annual_snapshot_atomic.sql` (Grant permessi authenticated)
- `src/__tests__/wave1ClosedSnapshot.test.ts` (Test suite automatizzata C1–C10)
- `scripts/reproduce_wave1_before.ts` (Script di riproduzione pre-fix)
- `scripts/test_wave1_staging.ts` (Script di verifica live post-fix su Staging)
- `wave1_reproduction_before.json` (Traccia evidenza vulnerabilità prima del fix)
- `wave1_verification_staging.json` (Traccia evidenza superamento verifiche live)
- `WAVE1_CLOSED_SNAPSHOT_IMPLEMENTATION_REPORT.md` (Questo documento)

### File Modificati:
- `src/__tests__/localDraftPersistence.test.ts` (Aggiornamento test 5: verifica che le action di mutazione vengano rifiutate da appReducer quando snapshotStatus è CLOSED)
- `src/domain/snapshot.ts` (Aggiunta tipizzazione e ragioni di rifiuto salvataggio)
- `src/application/ports/IStateRepository.ts` (Aggiunto metodo `closeYearAtomic`)
- `src/infrastructure/persistence/SupabaseStateRepository.ts` (Implementato `closeYearAtomic`)
- `src/application/snapshots/snapshotWorkflow.ts` (Guardia pre-scrittura su status `CLOSED`)
- `src/application/stateWorkflow.ts` (Gestione codice errore `P0001 / SNAPSHOT_CLOSED`)
- `src/application/yearClosureWorkflow.ts` (Integrazione RPC atomica e gestione idempotenza)
- `src/contexts/AppContext.tsx` (Protezione immutabilità in `appReducer` e blocco `saveState`)
- `src/hooks/useFundDataAutosave.ts` (Allineamento tipi ritorno autosave)
- `src/application/fundWorkflow.ts` (Allineamento tipi ritorno autosave)
- `src/pages/FondoAccessorioDipendentePage.tsx` (Banner e stato read-only)
- `src/pages/FondoElevateQualificazioniPage.tsx` (Banner e stato read-only)
- `src/pages/FondoSegretarioComunalePage.tsx` (Banner e stato read-only)
- `src/pages/FondoDirigenzaPage.tsx` (Banner e stato read-only)
- `src/pages/PersonaleServizioPage.tsx` (Banner e blocco modifiche/sync)
- `src/pages/DistribuzioneRisorsePage.tsx` (Banner e blocco modifiche/sync)
- `src/features/wizard2026/steps/Step8RiepilogoPreview.tsx` (Banner riepilogo e blocco re-invii)
- `src/components/layout/MainLayout.tsx` (Disabilitazione pulsante Salva Bozza in stato chiuso)

---

## 10. Verification Commands & Repro Steps

Per rieseguire l'intera suite di verifiche locali ed esterne:

1. **Verifica statica TypeScript:**
   ```bash
   npx tsc --noEmit
   # Exit code 0 atteso
   ```
2. **Build di produzione (Vite + Rollup):**
   ```bash
   npm run build
   # Exit code 0 atteso
   ```
3. **Suite automatizzata Vitest Wave 1 (C1–C10):**
   ```bash
   npx vitest run src/__tests__/wave1ClosedSnapshot.test.ts
   # 10 tests passed
   ```
4. **Regressione motori di calcolo:**
   ```bash
   npx vite-node scripts/run_regression_tests.ts
   # 8/8 superati, 0 delta
   ```
5. **Verifica live su Staging Supabase:**
   ```bash
   npx vite-node scripts/test_wave1_staging.ts
   # Staging check: ALL_TESTS_PASSED
   ```

---

## 11. Final Declaration

Tutti gli obiettivi definiti per la **Wave 1** risultano pienamente implementati, coperti da test unitari ed end-to-end su DB reale, e privi di regressioni rispetto alla baseline auditata:

```
WAVE1_READY_FOR_REVIEW
```
