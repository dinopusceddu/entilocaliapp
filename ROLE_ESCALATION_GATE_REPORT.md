# ROLE ESCALATION GATE REPORT — Pre-Checkpoint Astra

## 1. Environment & Target Verification

- **PRODUCTION_REF**: `yggokplxleredipknfbq` (`salarioaccessoriofl`, North EU)
- **STAGING_REF**: `mcasgpaivyosaroxrodm` (`entilocaliapp-staging`, Central EU)
- **TEST_TARGET**: `STAGING` (`mcasgpaivyosaroxrodm.supabase.co`)
- **PRODUCTION_TOUCHED**: `NO`
  - Nessuna chiamata, query o scrittura ha toccato l'ambiente di produzione.

---

## 2. Audit Iniziale della Vulnerabilità

### Test 1 — `user_app_state.role` Escalation
- **Azione**: Con JWT autenticato di `USER_A` (`role = GUEST`), eseguito:
  ```ts
  await clientA
    .from('user_app_state')
    .update({ role: 'ADMIN' })
    .eq('entity_id', entityAId)
    .eq('current_year', 2026);
  ```
- **Esito**:
  - L'aggiornamento è stato accettato dal database (`rows returned = 1`).
  - La colonna `user_app_state.role` è diventata `'ADMIN'`.
  - Poiché la precedente definizione di `is_admin()` includeva:
    `OR EXISTS (SELECT 1 FROM public.user_app_state WHERE user_id = auth.uid() AND UPPER(role) = 'ADMIN')`,
    la funzione `public.is_admin()` per `USER_A` è passata da `FALSE` a `TRUE`.
  - Subito dopo, `USER_A` ha interrogato la tabella `entities` riuscendo a leggere gli enti degli altri utenti (`Comune di Treviglio Staging`, `Comune di Staging Guest`).
- **Classificazione Test 1**: **VULNERABILE (`ROLE_ESCALATION_CONFIRMED`)**.

### Test 2 — `profiles.role` Escalation
- **Azione**: Con JWT autenticato di `USER_A`, tentato:
  ```ts
  await clientA
    .from('profiles')
    .update({ role: 'ADMIN' })
    .eq('id', userAId);
  ```
- **Esito**:
  - La policy RLS su `profiles` (`Admins can update all profiles` con `USING: check_is_admin()`) ha bloccato l'operazione (`rows returned = 0`).
  - `profiles.role` è rimasto `GUEST`.
- **Classificazione Test 2**: **PROTETTO (`SECURE`)**.

### Test 3 — Admin Legittimo
- **Azione**: Con JWT autenticato di `ADMIN_B` (`profiles.role = 'ADMIN'`).
- **Esito**:
  - `is_admin()` restituisce `TRUE`.
  - Visibilità completa su tutti gli enti (`3 enti visibili`).
- **Classificazione Test 3**: **PASS**.

---

## 3. Correzione Applicata (Hardening Canonico)

### Principio Architetturale
- `public.profiles` è l'**UNICA fonte autorevole** per la determinazione del ruolo applicativo e dei privilegi amministrativi.
- `user_app_state.role` è un campo storico/denormalizzato puramente descrittivo e **NON deve in alcun caso concedere privilegi**.

### Interventi DDL su Staging e Migration Locale
1. **Ridefinizione di `public.is_admin()`**:
   Eliminato completamente il fallback su `user_app_state.role`:
   ```sql
   CREATE OR REPLACE FUNCTION public.is_admin()
   RETURNS boolean
   LANGUAGE sql
   SECURITY DEFINER
   SET search_path = public
   STABLE
   AS $$
     SELECT EXISTS (
       SELECT 1 FROM public.profiles
       WHERE id = auth.uid() AND UPPER(role) = 'ADMIN'
     );
   $$;
   ```
2. **Allineamento di `public.get_my_role()`**:
   Allineato per leggere esclusivamente da `public.profiles` anziché da `user_app_state`:
   ```sql
   CREATE OR REPLACE FUNCTION public.get_my_role()
   RETURNS text
   LANGUAGE sql
   SECURITY DEFINER
   SET search_path = public
   STABLE
   AS $$
     SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
   $$;
   ```
3. **Aggiornamento Migration Repository**:
   La migration [`supabase/migrations/20260921000000_fix_user_app_state_ownership_rls.sql`](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/supabase/migrations/20260921000000_fix_user_app_state_ownership_rls.sql) include ora formalmente entrambe le definizioni blindate.

---

## 4. Regression Test Reali su Staging (R1 - R5)

Eseguiti post-hardening con sessioni autenticate reali su Supabase Staging:

| Test ID | Scenario di Sicurezza | Expected | Actual | Esito |
| :--- | :--- | :--- | :--- | :---: |
| **R1** | Normale tenta di cambiare `user_app_state.role` | PASS (0 enti altrui visibili) | La modifica del testo in `uas.role` non concede privilegi (0 enti altrui visibili) | **PASS** |
| **R2** | Normale tenta di cambiare `profiles.role` | PASS (ruolo resta GUEST) | RLS blocca l'update (`profiles.role = GUEST`) | **PASS** |
| **R3** | `is_admin()` dopo entrambi i tentativi | PASS (is_admin = FALSE) | `is_admin()` valuta a `FALSE`; query admin respinte | **PASS** |
| **R4** | Admin legittimo (`ADMIN_B`) | PASS (is_admin = TRUE) | Admin legittimo vede tutti gli enti (3 enti) | **PASS** |
| **R5** | Isolamento enti per utente normale | PASS (vede solo propri enti) | Tutte le entità visibili a USER_A appartengono a USER_A | **PASS** |

---

## 5. Re-Verifica Matrice RLS Cross-Owner (12 Test)

Rieseguita la suite E2E reale cross-owner dopo l'hardening:
- **A1** (Owner SELECT): **PASS**
- **A2** (Owner UPDATE): **PASS**
- **A3** (Owner INSERT 2027): **PASS**
- **B1** (Admin SELECT cross-owner): **PASS**
- **B2** (Admin UPDATE cross-owner, owner preservato): **PASS**
- **B3** (Admin INSERT 2028 per USER_A, owner preservato): **PASS**
- **B4** (Admin tentativo appropriazione owner: DENIED da WITH CHECK): **PASS**
- **C1** (Terzo utente SELECT: 0 righe): **PASS**
- **C2** (Terzo utente INSERT: DENIED da RLS): **PASS**
- **C3** (Terzo utente UPDATE: DENIED da RLS): **PASS**
- **C4** (Terzo utente DELETE: DENIED da RLS): **PASS**
- **RE-ENTRY** (Owner rientra post-Admin, vede 2026 e 2028, ownership intatta): **PASS**

---

## 6. Cleanup Staging

- Dataset temporanei eliminati (`RLS_GATE_TEST_%`, `SEC_TEST_%` e relative righe `user_app_state`).
- Utenti temporanei di test eliminati (`USER_A`, `ADMIN_B`, `USER_C`) da `auth.users` e `public.profiles`.
- File locale temporaneo `.env.local` rimosso.
- **Verifica**:
  ```yaml
  TEST_DATA_REMAINING: 0
  BASELINE_ENTITIES_PRESERVED: 2
  BASELINE_USERS_PRESERVED: 2
  ```

---

## 7. Technical Gates

| Gate Tecnico | Comando | Esito | Dettaglio |
| :--- | :--- | :---: | :--- |
| **TypeScript** | `npx tsc --noEmit` | **PASS** | 0 errori |
| **Vitest Suite** | `npm test -- --run` | **PASS** | **92/92 file passati**, **942/942 test superati**, 0 errori |
| **Production Build** | `npm run build` | **PASS** | Built in 30.10s |
| **Regression Runner** | `npx vite-node scripts/run_regression_tests.ts` | **PASS** | **8/8 scenari consolidati OK**, **0 delta** |

---

## 8. Final Verdict

```
ROLE_ESCALATION_CONFIRMED_AND_FIXED
```

### Safety Statement
```yaml
PRODUCTION_TOUCHED: NO
REAL_USER_DATA_CHANGED: NO
COMMIT_CREATED: NO
PUSH_PERFORMED: NO
MERGE_PERFORMED: NO
PRODUCTION_DEPLOY_PERFORMED: NO
```
