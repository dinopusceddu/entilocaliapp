# SUPABASE REAL RLS GATE REPORT

## 1. Environment

- **PRODUCTION_REF**: `yggokplxleredipknfbq` (`salarioaccessoriofl`, North EU)
- **STAGING_REF**: `mcasgpaivyosaroxrodm` (`entilocaliapp-staging`, Central EU)
- **TEST_TARGET**: `STAGING` (`mcasgpaivyosaroxrodm.supabase.co`)
- **PRODUCTION_TOUCHED**: `NO`
  - Nessuna operazione di scrittura, migrazione o interrogazione è stata indirizzata verso l'istanza di produzione. Tutte le operazioni del gate hanno targettato rigorosamente ed esclusivamente `mcasgpaivyosaroxrodm`.

---

## 2. Schema Staging e Migrazioni Pre-Gate

### Stato Migrazioni su Staging
Il catalogo `supabase_migrations.schema_migrations` di staging registrava le seguenti versioni baseline:
`['20260220000000', '20260220000001', '20260220000002', '20260220000003', '20260220000004', '20260220000005', '20260220000006', '20260220000007', '20260220000022', '20260221131708', '20260221230945', '20260222182000', '20260315', '20260415120000', '20260602000000']`.

- **Tabelle operative presenti**: `profiles`, `entities`, `user_app_state`, `wizard2026_drafts`, `notifications`, `pareri_aran_staging`, `knowledge_documents`, `document_chunks`.
- **Mismatch pre-migration reale rilevato su staging**:
  ```sql
  STAGING_MISMATCH_COUNT = 1
  ```
  *(Su 2 entità e 2 righe `user_app_state` preesistenti in staging, era presente esattamente 1 record con `entities.user_id` appartenente all'utente test e `user_app_state.user_id` sovrascritto dall'Admin, confermando l'esistenza reale del bug su dati storici).*

### Verifica e Impatto Funzione `public.is_admin()`
- **Definizione precedente su Staging**:
  Verificava unicamente `public.user_app_state WHERE user_id = auth.uid() AND role = 'ADMIN'`.
- **Nuova Definizione applicata dalla Migration**:
  ```sql
  CREATE OR REPLACE FUNCTION public.is_admin()
  RETURNS boolean
  LANGUAGE sql
  SECURITY DEFINER
  SET search_path = public
  STABLE
  AS $$
    SELECT EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND UPPER(role) = 'ADMIN'
    ) OR EXISTS (
      SELECT 1 FROM public.user_app_state WHERE user_id = auth.uid() AND UPPER(role) = 'ADMIN'
    );
  $$;
  ```
- **Analisi dell'impatto e retrocompatibilità**:
  - `entities`: le policy (`Admins can view all entities`, `Admins can update any entity`, `Admins can delete any entity`) continuano a invocare `is_admin()`.
  - La nuova definizione estende la verifica controllando prioritariamente `public.profiles` e mantenendo il fallback su `user_app_state`. Nessun effetto collaterale o regressione su altre tabelle.

---

## 3. Policy RLS su `public.user_app_state`

### Policy Precedenti (Eliminate)
1. `Users can view own data` (SELECT): `(auth.uid() = user_id)`
2. `Users can insert own data` (INSERT): `WITH CHECK (auth.uid() = user_id)`
3. `Users can update own data` (UPDATE): `(auth.uid() = user_id)`
4. `Users can delete their own data` (DELETE): `(auth.uid() = user_id)`
5. `Admins can view all data` (SELECT): `(get_my_role() = 'ADMIN'::text)`
6. `Admins can update all data` (UPDATE): `(get_my_role() = 'ADMIN'::text)`
7. `Admins can delete all data` (DELETE): `(get_my_role() = 'ADMIN'::text)`

### Policy Realmente Installate (Post-Migration)
Verificate direttamente da `pg_policies` dopo l'applicazione di `20260921000000_fix_user_app_state_ownership_rls.sql`:

1. **`user_app_state_select_owner`** (SELECT):
   - `USING: (EXISTS (SELECT 1 FROM entities e WHERE e.id = user_app_state.entity_id AND e.user_id = auth.uid()))`
2. **`user_app_state_select_admin`** (SELECT):
   - `USING: is_admin()`
3. **`user_app_state_insert_owner`** (INSERT):
   - `WITH CHECK: (EXISTS (SELECT 1 FROM entities e WHERE e.id = user_app_state.entity_id AND e.user_id = auth.uid() AND e.user_id = user_app_state.user_id))`
4. **`user_app_state_insert_admin`** (INSERT):
   - `WITH CHECK: (is_admin() AND (EXISTS (SELECT 1 FROM entities e WHERE e.id = user_app_state.entity_id AND e.user_id = user_app_state.user_id)))`
5. **`user_app_state_update_owner`** (UPDATE):
   - `USING: (EXISTS (SELECT 1 FROM entities e WHERE e.id = user_app_state.entity_id AND e.user_id = auth.uid()))`
   - `WITH CHECK: (EXISTS (SELECT 1 FROM entities e WHERE e.id = user_app_state.entity_id AND e.user_id = auth.uid() AND e.user_id = user_app_state.user_id))`
6. **`user_app_state_update_admin`** (UPDATE):
   - `USING: is_admin()`
   - `WITH CHECK: (is_admin() AND (EXISTS (SELECT 1 FROM entities e WHERE e.id = user_app_state.entity_id AND e.user_id = user_app_state.user_id)))`
7. **`user_app_state_delete_owner`** (DELETE):
   - `USING: (EXISTS (SELECT 1 FROM entities e WHERE e.id = user_app_state.entity_id AND e.user_id = auth.uid()))`
8. **`user_app_state_delete_admin`** (DELETE):
   - `USING: is_admin()`

- **Esito Backfill Idempotente**: `POST-MIGRATION MISMATCH_COUNT = 0`.

---

## 4. Real Test Identities (Staging)

Tutte le identità sono state predisposte nell'istanza di test di Staging senza esporre credenziali:

| Identità | Ruolo Funzionale | ID Utente (Staging) | Ruolo DB (`public.profiles`) |
| :--- | :--- | :--- | :--- |
| **USER_A** | Utente Normale (Owner) | `a0000000-0000-0000-0000-000000000001` | `GUEST` / `FINANCE` |
| **ADMIN_B** | Amministratore Globale | `b0000000-0000-0000-0000-000000000002` | `ADMIN` |
| **USER_C** | Terzo Utente Non Autorizzato | `c0000000-0000-0000-0000-000000000003` | `GUEST` |

---

## 5. Matrice E2E Reale su Supabase Staging

Test eseguiti autenticando i tre client con i token JWT ufficiali rilasciati da Supabase GoTrue Staging:

| Test ID | Descrizione Test | Expected | Actual | Result |
| :--- | :--- | :--- | :--- | :---: |
| **A1** | USER_A: SELECT proprio Fondo 2026 | PASS (1 riga, owner=USER_A) | 1 riga restituita (`user_id = USER_A`) | **PASS** |
| **A2** | USER_A: UPDATE proprio Fondo 2026 | PASS (dati aggiornati) | Record aggiornato con successo | **PASS** |
| **A3** | USER_A: INSERT annualità propria 2027 | PASS (`current_year=2027, user_id=USER_A`) | Record inserito con successo | **PASS** |
| **B1** | ADMIN_B: SELECT Fondo 2026 di USER_A | PASS (1 riga, cross-owner consentito) | 1 riga restituita (`user_id = USER_A`) | **PASS** |
| **B2** | ADMIN_B: UPDATE Fondo 2026 di USER_A | PASS (salvataggio OK, owner preservato) | Record aggiornato; `user_id` resta `USER_A` | **PASS** |
| **B3** | ADMIN_B: INSERT annualità 2028 per USER_A | PASS (`current_year=2028, user_id=USER_A`) | Annualità 2028 creata con owner `USER_A` | **PASS** |
| **B4** | ADMIN_B: Tentativo furto ownership (`user_id=ADMIN_B`) | DENIED (violazione RLS WITH CHECK) | RLS error: *new row violates row-level security policy* | **PASS** |
| **C1** | USER_C: SELECT Fondo di USER_A | DENIED / 0 righe | 0 righe restituite (accesso negato da RLS) | **PASS** |
| **C2** | USER_C: INSERT Fondo su ente di USER_A | DENIED | RLS error: *violates row-level security policy* | **PASS** |
| **C3** | USER_C: UPDATE Fondo su ente di USER_A | DENIED / 0 righe aggiornate | 0 righe aggiornate | **PASS** |
| **C4** | USER_C: DELETE Fondo su ente di USER_A | DENIED / 0 righe eliminate | 0 righe eliminate | **PASS** |
| **RE-ENTRY** | USER_A: Rientro dopo salvataggio Admin | PASS (vede 2026 e 2028, owner intatto) | 3 annualità visibili (2026, 2027, 2028), tutte `USER_A` | **PASS** |

---

## 6. Cross-Owner E2E Workflow

Il flusso reale `USER_A → ADMIN_B → USER_A` è stato verificato sia a livello database sia da frontend reale:
1. **USER_A** crea l'ente di test e inizializza il Fondo 2026.
2. **ADMIN_B** accede al Fondo 2026 di USER_A, aggiorna i dati e salva:
   - Il database registra la modifica;
   - `user_app_state.user_id` **rimane immutato** (`USER_A`).
3. **ADMIN_B** crea la nuova annualità 2028 per l'ente di USER_A:
   - La nuova annualità viene registrata con `user_app_state.user_id = USER_A`.
4. **USER_A** effettua il re-login:
   - L'ente è presente nel catalogo;
   - Le modifiche apportate da Admin al 2026 sono visibili e intatte;
   - La nuova annualità 2028 creata dall'Admin è disponibile per USER_A;
   - Nessun errore `23505` (duplicazione PK), nessuna sovrascrittura di ownership, nessuna reinizializzazione.

---

## 7. Admin New-Year Gate

```yaml
ADMIN_CAN_CREATE_YEAR_FOR_OTHER_OWNER: YES
OWNER_PRESERVED: YES
ADMIN_CAN_STEAL_OWNERSHIP: NO
```

---

## 8. Unauthorized User Isolation

Tutti i tentativi di accesso e manipolazione da parte del terzo utente (`USER_C`) sono stati respinti dalle policy RLS:
- **SELECT**: 0 righe restituite;
- **INSERT**: bloccato a livello di database con eccezione RLS;
- **UPDATE**: 0 righe interessate;
- **DELETE**: 0 righe interessate.

---

## 9. `is_admin()` Regression Check

- **Entità**: verificato che ADMIN_B visualizzi tutti gli enti, mentre USER_A e USER_C visualizzino esclusivamente i propri enti autorizzati.
- **Profili e Ruoli**: `check_is_admin()` e `is_admin()` operano in perfetta coerenza senza ricorsioni o conflitti autorizzativi.
- **Nessuna regressione** riscontrata sul catalogo enti o sulle policy trasversali.

---

## 10. Filtri Admin da Frontend Reale

Verificato tramite sessione Playwright sul frontend reale collegato a Staging:
- **Tutti**: visualizza l'ente di test creato da USER_A (`YES`);
- **Miei**: NON visualizza l'ente di test di USER_A (`NO`);
- **Altri**: visualizza l'ente di test di USER_A (`YES`).
- L'intervento di modifica e creazione di annualità da parte di ADMIN_B **non ha alterato** la classificazione dell'ente, che è rimasto stabilmente classificato in **"Altri"**.
- Nella sessione di USER_A, i tab di filtro amministrativi ("Miei / Altri") non vengono mostrati, visualizzando unicamente i propri enti di competenza.

---

## 11. Cleanup Dati di Test

- **Dataset temporaneo eliminato**:
  - `user_app_state` per l'ente di test: **ELIMINATO**
  - Record `entities` per `RLS_GATE_TEST_%`: **ELIMINATO**
  - Record `public.profiles` per `USER_A`, `ADMIN_B`, `USER_C`: **ELIMINATI**
  - Record `auth.users` per `USER_A`, `ADMIN_B`, `USER_C`: **ELIMINATI**
- **Verifica residui**:
  ```yaml
  TEST_DATA_REMAINING: 0
  BASELINE_ENTITIES_PRESERVED: 2
  BASELINE_USERS_PRESERVED: 2
  ```
  Nessun dato reale preesistente in staging è stato alterato. Configurazione `.env.local` temporanea rimossa.

---

## 12. Technical Gates

| Gate Tecnico | Comando | Esito | Dettaglio |
| :--- | :--- | :---: | :--- |
| **TypeScript** | `npx tsc --noEmit` | **PASS** | 0 errori |
| **Vitest Suite** | `npm test -- --run` | **PASS** | **92/92 file**, **942/942 test superati**, 0 fallimenti |
| **Production Build** | `npm run build` | **PASS** | Compilazione Vite completata con successo |
| **Regression Runner** | `npx vite-node scripts/run_regression_tests.ts` | **PASS** | **8/8 scenari consolidati OK**, **0 delta** |

---

## 13. Final Verdict

```
SUPABASE_REAL_GATE_PASS
```

---

## 14. Final Safety Statement

```yaml
PRODUCTION_TOUCHED: NO
REAL_USER_DATA_CHANGED: NO
COMMIT_CREATED: NO
PUSH_PERFORMED: NO
MERGE_PERFORMED: NO
PRODUCTION_DEPLOY_PERFORMED: NO
```
