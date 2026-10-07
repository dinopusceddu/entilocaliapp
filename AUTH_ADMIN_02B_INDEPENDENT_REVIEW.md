# AUTH_ADMIN_02B — Independent Security Review Report
## Canonical Authorization for delete-user

**Review Date:** 2026-10-03\
**Reviewer:** Senior Application Security Reviewer (Independent Audit)\
**Slice Evaluated:** `AUTH_ADMIN_02B_DELETE_CANONICAL_AUTH`\
**Repository:** `dinopusceddu/entilocaliapp`\
**Branch:** `ux/toolbox-area-fondo-prototype`\
**HEAD:** `d3170f959b5815c514dbf3d6e5f93366a5f14c67`\
**Result:** **PASS — AUTH_ADMIN_02B_INDEPENDENT_REVIEW = COMPLETE**

---

## 1. Executive Verdict

L'audit indipendente di sicurezza applicativa dello slice `AUTH_ADMIN_02B_DELETE_CANONICAL_AUTH` emette verdetto **PASS**.

Con questo slice si conclude positivamente la bonifica delle tre Edge Functions amministrative (`create-user`, `update-password`, `delete-user`). La vulnerabilità architetturale documentata in `ARCH-02` e `AUTH_ADMIN_02` (in cui l'autorizzazione all'invocazione dell'API distruttiva `supabaseAdmin.auth.admin.deleteUser(...)` si basava su una query con `.limit(1).single()` sul mirror applicativo `public.user_app_state`) è stata **completamente eliminata** a favore dell'autorità canonica `public.profiles.role`.

Punti cardine confermati:
1. **Autenticazione crittografica e binding dell'identità**: il chiamante è convalidato via `auth.getUser()`, e il ruolo è risolto unicamente su `public.profiles` con filtro `id = currentUser.id`.
2. **Separazione Caller vs Target**: l'identificativo del bersaglio (`userId`) proviene esclusivamente dal body JSON letto DOPO il superamento del gate autorizzativo. Il ruolo dell'utente target non può in alcun modo elevare o autorizzare il chiamante.
3. **Fail-Closed su ogni diniego**: in tutti i rami di errore o rifiuto (assenza token, JWT non valido, utente o profilo assente, ruolo non-ADMIN, errore o rigetto del lookup DB), l'API distruttiva `deleteUser` registra **esattamente 0 chiamate** e il body non viene consumato.
4. **Inventario delle mutazioni distruttive**: `auth.admin.deleteUser(userId)` è l'unica operazione mutativa presente nel file. Nessun'altra DML, RPC o mutazione privilegiata è presente.
5. **Nessuna regressione dei gate precedenti**: sia `create-user` (`AUTH_ADMIN_01`) sia `update-password` (`AUTH_ADMIN_02A`) conservano l'integrità byte-exact dei file e superano i relativi test mirati (162/162 test passati).

---

## 2. Existing Delete Policy Verification

È stato analizzato e verificato il contratto funzionale preesistente dell'endpoint `delete-user` in `HEAD`:

- **Policy del server preesistente:** **`ADMIN-only`**.
  Nel codice originale:
  ```typescript
  if (roleError || adminCheck?.role !== 'ADMIN') {
      throw new Error('Unauthorized: Admin access required')
  }
  ```
  Qualsiasi utente autenticato non-ADMIN riceveva un errore `Unauthorized: Admin access required`. Non esisteva alcun percorso self-service per utenti `USER` o `GUEST`.
- **Casi di autorizzazione preservati:**
  - `ADMIN -> target USER`: **ALLOW**
  - `ADMIN -> target altro ADMIN`: **ALLOW**
  - `ADMIN -> target sé stesso (self)`: **ALLOW** lato server (la UI in `UserManagementPage.tsx:526` disabilita il pulsante `disabled={user.id === state.currentUser.id}`, ma il server non conteneva questo vincolo; tale comportamento server è preservato fedelmente).
  - `USER -> target sé stesso`: **DENY**
  - `USER -> target ADMIN`: **DENY**
- Nessuna nuova policy di protezione (es. blocco self-delete, blocco cancellazione altri admin, o conteggio "last-admin") è stata introdotta arbitrariamente nel server, preservando la compatibilità preesistente.

---

## 3. Production Diff Review

Ispezione comparativa del diff applicato a `supabase/functions/delete-user/index.ts` rispetto ad `HEAD`:

```diff
@@ -13,34 +13,38 @@ serve(async (req) => {
     }

     try {
+        const authorization = req.headers.get('Authorization')
+        if (!authorization) throw new Error('Unauthorized')
+
         const supabaseClient = createClient(
             Deno.env.get('SUPABASE_URL') ?? '',
             Deno.env.get('SUPABASE_ANON_KEY') ?? '',
-            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
+            { global: { headers: { Authorization: authorization } } }
         )

         // Check if the user calling this function is an ADMIN
         const { data: { user: currentUser }, error: userError } = await supabaseClient.auth.getUser()
         if (userError || !currentUser) throw new Error('Unauthorized')

-        // Verify Admin role in public.user_app_state
-        const { data: adminCheck, error: roleError } = await supabaseClient
-            .from('user_app_state')
-            .select('role')
-            .eq('user_id', currentUser.id)
-            .limit(1)
-            .single()
-
-        if (roleError || adminCheck?.role !== 'ADMIN') {
-            throw new Error('Unauthorized: Admin access required')
-        }
-
-        // Create the Admin Client (Service Role) to perform deletion
+        // Create the Admin Client (Service Role) for the canonical read and authorized deletion.
         const supabaseAdmin = createClient(
             Deno.env.get('SUPABASE_URL') ?? '',
             Deno.env.get('SERVICE_ROLE_KEY') ?? ''
         )

+        // Only public.profiles.role for the verified caller authorizes deletion.
+        const { data: adminCheck, error: roleError } = await Promise.resolve(supabaseAdmin
+            .from('profiles')
+            .select('role')
+            .eq('id', currentUser.id)
+            .maybeSingle()
+        ).catch(() => { throw new Error('Authorization check failed') })
+
+        if (roleError) throw new Error('Authorization check failed')
+        if (adminCheck?.role !== 'ADMIN') {
+            throw new Error('Unauthorized: Admin access required')
+        }
+
         const { userId } = await req.json()

         if (!userId) {
```

### Valutazione della pipeline autorizzativa:
1. **OPTIONS preflight**: gestito in testa, risponde `200 ok` senza toccare credenziali, DB o body.
2. **Controllo Authorization Header**: verifica esplicita della presenza; se assente lancia `Unauthorized` prima di creare client.
3. **Verifica crittografica JWT**: `supabaseClient.auth.getUser()` convalidata con l'anon key e l'header fornito; fallisce con `Unauthorized` in caso di errore o assenza utente.
4. **Instanziazione Service-Role isolata**: `supabaseAdmin` creato solo dopo aver stabilito l'identità del chiamante.
5. **Lookup autorizzativo su `public.profiles`**:
   - Query: `.from('profiles').select('role').eq('id', currentUser.id).maybeSingle()`
   - Intercettazione asincrona: `.catch(() => { throw new Error('Authorization check failed') })` previene unhandled rejection mascherando dettagli infrastrutturali.
   - Fail-closed: se `roleError` o `adminCheck?.role !== 'ADMIN'`, l'esecuzione si arresta immediatamente.
6. **Consumo del Body e Cancellazione Distruttiva**:
   - `req.json()` viene invocato unicamente dopo che l'autorizzazione ADMIN è confermata.
   - `if (!userId)` verifica la presenza del target.
   - Solo a questo punto viene invocata `supabaseAdmin.auth.admin.deleteUser(userId)`.

---

## 4. Caller / Target Trust Boundary

La distinzione tra l'utente chiamante (*Caller*) e l'utente da eliminare (*Target*) è rigorosa:

- **Caller**: identificato esclusivamente da `currentUser.id` fornito da `auth.getUser()`.
- **Target**: identificato unicamente da `userId` estratto dal body JSON.
- **Isolamento dell'autorizzazione**:
  - Il ruolo del target non viene mai letto né utilizzato per autorizzare il chiamante.
  - L'attacco *Caller `USER` $\to$ Target `ADMIN`* fallisce invariabilmente con `Unauthorized: Admin access required`.
  - Lo spoofing tramite parametri fasulli nel body (`callerId`, `user_id`, `role: 'ADMIN'`) non ha alcun impatto, poiché il filtro di lookup sul database è unicamente `currentUser.id` proveniente dal token validato.

---

## 5. Canonical Authority

L'unica fonte autorizzativa verificata è:
$$\mathbf{public.profiles.role}$$

Nessuna delle seguenti fonti partecipa o può condizionare la decisione:
- `raw_user_meta_data` / `user_metadata`
- `raw_app_meta_data` / `app_metadata`
- Custom JWT claims
- `user_app_state.role` (completamente rimosso dall'endpoint)
- Numero di annualità (0, 1, multiple) o presenza di record su enti
- Stato `OPEN` o `CLOSED` degli snapshot finanziari
- Parametri nel request body (`role`, `callerRole`, `callerId`)
- Stato della sessione client / visibilità frontend

---

## 6. Destructive Mutation Inventory

Inventario esaustivo di tutte le operazioni eseguite dall'Edge Function `delete-user`:

| Operazione | Categoria | Target | Privilegi | Eseguita prima del Gate? |
|---|---|---|---|:---:|
| `supabaseClient.auth.getUser()` | Read (Auth) | Caller JWT | Anon + Bearer | SÌ (per autenticare) |
| `supabaseAdmin.from('profiles').select(...)` | Read (DB) | `profiles` riga del caller | Service Role | SÌ (per autorizzare) |
| `req.json()` | Read (Memory) | Request Body | - | NO (solo post-ALLOW) |
| `supabaseAdmin.auth.admin.deleteUser(userId)` | **Mutazione Distruttiva** | `auth.users` target | Service Role | **NO (solo post-ALLOW)** |

Nel sorgente **NON esistono**:
- Chiamate `.delete()`, `.update()`, `.insert()`, `.upsert()` su alcuna tabella del database;
- Chiamate ad RPC mutative del database;
- Altre chiamate amministrative ad Auth (`createUser`, `updateUserById`, ecc.).

Su qualsiasi diniego autorizzativo, `deleteUser` registra **esattamente 0 chiamate**.

---

## 7. Adversarial Decision Matrix

| Scenario | Esito | HTTP Status | Body Letto | `deleteUser` Chiamate |
|---|:---:|:---:|:---:|:---:|
| Header `Authorization` assente | DENY | 400 | NO | 0 |
| JWT corrotto o non valido | DENY | 400 | NO | 0 |
| Utente non trovato da `getUser` | DENY | 400 | NO | 0 |
| Profilo chiamante assente in `profiles` | DENY | 400 | NO | 0 |
| Ruolo chiamante `NULL` | DENY | 400 | NO | 0 |
| Ruolo chiamante `'GUEST'` | DENY | 400 | NO | 0 |
| Ruolo chiamante `'USER'`, target sé stesso | DENY | 400 | NO | 0 |
| Ruolo chiamante `'USER'`, target altro utente | DENY | 400 | NO | 0 |
| Ruolo chiamante `'USER'`, target `ADMIN` | DENY | 400 | NO | 0 |
| Ruolo chiamante non-exact (`'admin'`, `' ADMIN '`, `''`) | DENY | 400 | NO | 0 |
| Caller `USER` + Metadata `ADMIN` | DENY | 400 | NO | 0 |
| Caller `USER` + Snapshot `user_app_state` `ADMIN CLOSED` | DENY | 400 | NO | 0 |
| Caller `USER` + Body `{ role: 'ADMIN', callerId: '<admin-id>' }` | DENY | 400 | NO | 0 |
| Errore query database (`roleError`) | DENY | 400 | NO | 0 |
| Rigetto asincrono Promise lookup (DB disconnect) | DENY | 400 | NO | 0 |
| Body JSON malformato inviato da non-admin | DENY | 400 | NO | 0 |
| Caller `ADMIN` + `userId` assente o vuoto | DENY (Validazione) | 400 | SÌ | 0 |
| Caller `ADMIN` + Target `USER` | ALLOW | 200 | SÌ | 1 |
| Caller `ADMIN` + Target altro `ADMIN` | ALLOW | 200 | SÌ | 1 |
| Caller `ADMIN` + Target sé stesso (self-delete) | ALLOW | 200 | SÌ | 1 |
| Preflight CORS `OPTIONS` | ALLOW (Preflight ok) | 200 | NO | 0 |

---

## 8. Test Harness Review

La suite dedicata `src/__tests__/deleteUserCanonicalAuthorization.test.ts` (42 test) è stata analizzata criticamente:

1. **Esecuzione dell'handler produttivo reale:** il test legge `supabase/functions/delete-user/index.ts`, rimuove esclusivamente gli import URL remoti ed esegue il codice compilato in un contesto Node.js VM (`runInNewContext`).
2. **Boundary Mocking rigoroso:** sono mockati unicamente i confini esterni SDK (`serve`, `createClient`, `auth.getUser`, `auth.admin.deleteUser`, `from('profiles')`).
3. **Verifica temporale e sequencing:** include test con lookup asincrono sospeso (`pendingLookup`), provando che prima della risoluzione del profilo nessun parsing del body o chiamata a `deleteUser` può avere inizio.
4. **Verifica dell'inventario statico:** asserisce via regex l'assenza di query DML o RPC mutative nel file di produzione.
5. **Esito:** `TEST_HARNESS_REVIEW = PASS_HIGH_FIDELITY_EDGE_SIMULATION`.

---

## 9. Delete Cleanup / Cascade Finding

L'analisi statica dei vincoli di database ha evidenziato due criticità strutturali relative all'operazione di cancellazione:

### A. Vincolo sui dati chiusi (`user_app_state` CLOSED Boundary)
La migration `20260928000000_harden_user_app_state_closed_boundary.sql` impone un trigger `BEFORE DELETE` su `user_app_state` che lancia eccezione se `snapshotStatus = 'CLOSED'`, a meno che non siano contemporaneamente impostati:
- `current_setting('app.allow_admin_cleanup', true) = 'true'`
- `public.is_admin() = true`

Poiché l'Edge Function `delete-user` delega interamente la cancellazione a `auth.admin.deleteUser(userId)`, la cancellazione in cascata scatenata da Postgres su `user_app_state` fallirà con errore `CANNOT_DELETE_CLOSED` per gli utenti possessori di annualità chiuse, bloccando l'eliminazione dell'utente.

### B. Foreign Key senza Cascade (`knowledge_documents.uploaded_by`)
La migration `20260221230945_create_knowledge_documents.sql` definisce:
```sql
uploaded_by UUID REFERENCES auth.users(id)
```
La FK è sprovvista di clausola `ON DELETE CASCADE` o `ON DELETE SET NULL` (default `ON DELETE NO ACTION / RESTRICT`). Se l'utente target ha caricato documenti di knowledge base, la cancellazione da `auth.users` sarà abortita dal database per violazione di chiave esterna.

### Classificazione del finding:
- **`DELETE_CLEANUP_FINDING = CONFIRMED`**
- **`DELETE_CLEANUP_CLASSIFICATION = SEPARATE_FUNCTIONAL_FINDING`**
- **Motivazione:** il gate autorizzativo dell'Edge Function è impeccabile (solo un ADMIN confermato può tentare l'operazione). L'impossibilità di completare la cancellazione per utenti con determinati record collegati è un problema di modellazione dei vincoli e delle cascade DB, non un difetto di sicurezza o di autorizzazione.
- **`PARTIAL_DELETE_RISK = NOT_VERIFIABLE_STATICALLY`**: in PostgreSQL standard la cancellazione di `auth.users` e le cascade sulle tabelle collegate avvengono all'interno della medesima transazione, garantendo il rollback atomico; tuttavia, l'effettiva atomicità complessiva in staging/produzione richiede validazione live dedicata.

---

## 10. Deployment Dependency

- **`DEPLOYMENT_DEPENDENCY_PROFILE_ROLE_MIGRATION = YES`**
- La migration `20261002000000_harden_auth_profile_role_source.sql` rimane nello stato `APPLY_PENDING / LIVE_FIX_NOT_VERIFIED`.
- La presente review attesta la correttezza della logica applicativa dell'Edge Function `delete-user`, ma la protezione integrale del ruolo richiede che la migration sia applicata e convalidata in ambiente live prima del deploy in produzione.

---

## 11. Scope Integrity

Tutti i vincoli perimetrali sono stati rigorosamente rispettati:

- **Unico file produttivo modificato:** `supabase/functions/delete-user/index.ts` (18 righe aggiunte, 14 rimosse).
- **Nuovo test aggiunto:** `src/__tests__/deleteUserCanonicalAuthorization.test.ts`.
- **Nuovi report:** `AUTH_ADMIN_02B_IMPLEMENTATION_REPORT.md` e `AUTH_ADMIN_02B_INDEPENDENT_REVIEW.md`.
- **Integrità SHA-256 dei file protetti (identità al 100%):**
  - `supabase/functions/create-user/index.ts`: `D95E40ACDC81B16C7AFBF9970C49F6E9361E2C6802F9DFF5D555BC5D1F25CFD4`
  - `supabase/functions/update-password/index.ts`: `04B07282D4D52DD2F098E38E94A302D425B5BE3DF964491D346FB7E62DA183C1`
  - `src/pages/UserManagementPage.tsx`: `21124D8B493F03C19493E57C2B69B2913C6EDB5DCF25A54DAFA24FF7AFF47F31`
  - `src/__tests__/createUserAdminAuthorization.test.ts`: `4AC728B2773092E90937F5B6CD77D5FC28F3264CAA9D5791AFFD2426C6B20326`
  - `src/__tests__/updatePasswordCanonicalAuthorization.test.ts`: `24BE29008EDB71AAA9A1C9DC07ACD1CDB1CD870E147E5212A8D2EE10E799B4A8`
  - `src/__tests__/securityMigrations.test.ts`: `4A2217191B161894846271D47C738BA2DEA1B72CC0626504E273958A8305D403`
  - `src/features/wizard2026/__tests__/wizard2026RemoteDraftSync.test.ts`: `188B79924C5A8D387A58D9ED3AFE6251E1E11AC9FFCECD759A1B694204CFE0F4`
  - `AUTH_ADMIN_01_IMPLEMENTATION_REPORT.md`: `2FC883011037F9FA192815F63318447A6A245DEEDFB2EAAC3A7F8349C256484C`
  - `AUTH_ADMIN_01_INDEPENDENT_REVIEW.md`: `0B1D5CA371CBE0C08680F0EE84616FFAF8253A343E43E40333E73A197CC33E96`
  - `AUTH_ADMIN_02A_IMPLEMENTATION_REPORT.md`: `A99FE6EC16921DDE2D36FB33B3021DED63E3ABCF6A984D584B80A6105ECD6C14`
  - `AUTH_ADMIN_02A_INDEPENDENT_REVIEW.md`: `A2EE8D9B735193A05D472F459320BFBA80C751B888568666D13466A1E7133554`
  - `supabase/migrations/20261002000000_harden_auth_profile_role_source.sql`: `8670E439CD6FA8AE969652445637168491AFD3388DE710CE2AE9E2752EF2614D`
- Nessun file finanziario, documentale, o presenter toccato.

---

## 12. Residual Findings

1. **`AUTH_ADMIN_01`**: `CLOSED_LOCALLY / INDEPENDENT_REVIEW_PASS` (nessuna regressione).
2. **`AUTH_ADMIN_02A`**: `CLOSED_LOCALLY / INDEPENDENT_REVIEW_PASS` (nessuna regressione).
3. **`AUTH_ADMIN_02B`**: `CLOSED_LOCALLY / INDEPENDENT_REVIEW_PASS` (presente documento).
4. **`AUTH_ROLE_03`**: rimane **OPEN** (mirror `user_app_state.role` non transazionale in `UserManagementPage.tsx`).
5. **`DELETE_CLEANUP_FINDING`**: aperto come **`SEPARATE_FUNCTIONAL_FINDING`** per vincoli FK e trigger CLOSED durante la cancellazione a cascata.
6. **`AUTH_PROFILE_ROLE_PENDING_GATE`**: rimane **`APPLY_PENDING / LIVE_FIX_NOT_VERIFIED`**.
7. **`CALC-02` / `NORM-01`**: i due **BLOCKER** primari normativo-finanziari del progetto restano prioritari e intatti.

---

## 13. Next-Gate Recommendation

Con il completamento con successo di `AUTH_ADMIN_02B`, **la flotta delle Edge Functions Auth è interamente bonificata lato server**.

Si raccomanda di non aprire ulteriori slice Auth secondari in questa fase e di concentrare le risorse ingegneristiche sui due Blocker fondamentali del progetto:
1. **`CALC-02`**: allineamento delle formule di calcolo del salario accessorio;
2. **`NORM-01`**: consolidamento della pipeline di normalizzazione dati e presenter documentali.
