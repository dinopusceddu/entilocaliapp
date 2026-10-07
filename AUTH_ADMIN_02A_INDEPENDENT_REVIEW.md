# AUTH_ADMIN_02A — Independent Security Review Report
## Canonical Authorization for update-password

**Review Date:** 2026-10-03\
**Reviewer:** Senior Application Security Reviewer (Independent Audit)\
**Slice Evaluated:** `AUTH_ADMIN_02A_PASSWORD_CANONICAL_AUTH`\
**Repository:** `dinopusceddu/entilocaliapp`\
**Branch:** `ux/toolbox-area-fondo-prototype`\
**HEAD:** `d3170f959b5815c514dbf3d6e5f93366a5f14c67`\
**Result:** **PASS — AUTH_ADMIN_02A_INDEPENDENT_REVIEW = COMPLETE**

---

## 1. Executive Verdict

L'audit indipendente di sicurezza applicativa per lo slice `AUTH_ADMIN_02A_PASSWORD_CANONICAL_AUTH` emette verdetto **PASS**.

La vulnerabilità originaria documentata in `ARCH-02` e `AUTH_ADMIN_02` consisteva nell'uso di `user_app_state.role` (un mirror denormalizzato legato agli snapshot delle annualità applicative) come fonte autorizzativa per l'esecuzione della mutazione amministrativa `supabaseAdmin.auth.admin.updateUserById(...)` nell'Edge Function `update-password`.

Il diff analizzato elimina totalmente `user_app_state` e qualsiasi metadato o parametro del client come fonte di autorità, vincolando l'accesso alla verifica server-side del ruolo canonico in `public.profiles.role`.

Punti cardine confermati:
1. **Verifica crittografica del JWT**: l'identità del chiamante (`user.id`) è ottenuta unicamente da `auth.getUser()`.
2. **Autorità canonica esclusiva**: la decisione dipende esclusivamente dalla query `public.profiles.role` con filtro `id = user.id`.
3. **Netta separazione Caller vs Target**: il `targetUserId` e il ruolo dell'utente target non partecipano in alcun modo all'autorizzazione del chiamante.
4. **Nessun bypass per non-admin**: gli utenti con ruolo `USER` o `GUEST` non possono invocare questo endpoint, neppure per la propria password (coerentemente con la policy preesistente).
5. **Fail-closed assoluto**: per qualsiasi scenario di diniego (assenza token, token invalido, profilo mancante, ruolo non-ADMIN, errore DB, rigetto asincrono), il numero di chiamate a `updateUserById` è esattamente **0**, e il body della richiesta non viene letto.
6. **Integrità e non-regressione**: `create-user` (`AUTH_ADMIN_01`) e le suite di sicurezza preesistenti rimangono integre e superano tutti i test (120/120 passati).

---

## 2. Existing Policy Verification

È stato verificato il contratto preesistente dell'endpoint `update-password` sia nel codice originario presente in `HEAD`, sia nell'interfaccia client `src/pages/UserManagementPage.tsx`:

- **Policy preesistente confermata:** **`ADMIN-only, per sé stesso o altro utente`**.
- Nel codice preesistente:
  ```typescript
  if (requesterError || !requesterData || requesterData.role !== 'ADMIN') {
      throw new Error('Forbidden: Only Admins can change passwords')
  }
  ```
  Non esisteva alcun ramo self-service condizionato a `targetUserId === user.id`. Qualsiasi utente non-admin veniva respinto con errore `Forbidden`.
- Il chiamante ammesso (ADMIN) specifica l'utente destinatario tramite il campo del body `targetUserId` e la nuova password in `newPassword`. L'amministratore può quindi aggiornare la password di sé stesso o di qualsiasi altro account censito nel sistema.
- La mutazione finale avviene tramite l'API privilegiata `supabaseAdmin.auth.admin.updateUserById(targetUserId, { password: newPassword })`.
- La ricostruzione contrattuale effettuata nel report di implementazione è **esatta e confermata per tabulas**. Nessuna policy arbitraria o non documentata è stata introdotta.

---

## 3. Production Diff Review

Ispezione puntuale del diff di `supabase/functions/update-password/index.ts` rispetto ad `HEAD`:

```diff
@@ -12,10 +12,13 @@ serve(async (req) => {
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

         // 1. Authenticate User
@@ -30,14 +33,16 @@ serve(async (req) => {
         )

         // 3. Check if Requester is ADMIN
-        // querying user_app_state to verify role
-        const { data: requesterData, error: requesterError } = await supabaseAdmin
-            .from('user_app_state')
+        // Only public.profiles.role for the verified caller authorizes password mutations.
+        const { data: requesterData, error: requesterError } = await Promise.resolve(supabaseAdmin
+            .from('profiles')
             .select('role')
-            .eq('user_id', user.id)
-            .single()
+            .eq('id', user.id)
+            .maybeSingle()
+        ).catch(() => { throw new Error('Authorization check failed') })

-        if (requesterError || !requesterData || requesterData.role !== 'ADMIN') {
+        if (requesterError) throw new Error('Authorization check failed')
+        if (!requesterData || requesterData.role !== 'ADMIN') {
             throw new Error('Forbidden: Only Admins can change passwords')
         }
```

### Valutazione della sequenza di esecuzione:
1. **Preflight CORS**: `OPTIONS` risponde `200 ok` immediatamente, prima di toccare credenziali o body.
2. **Presenza Header Authorization**: se assente, lancia immediatamente `Unauthorized` prima di invocare Supabase.
3. **Autenticazione crittografica**: `supabaseClient.auth.getUser()` convalida il token; fallisce con `Unauthorized` se il JWT è invalido o il chiamante è assente.
4. **Binding sull'ID verificato**: `user.id` restituito da Supabase Auth è l'unico parametro impiegato per il lookup.
5. **Lookup autorizzativo su `public.profiles`**:
   - Tabella interrogata: `profiles` (eliminato `user_app_state`).
   - Metodo: `.maybeSingle()` anziché `.single()`, evitando errori postgREST quando il record non esiste e restituendo `data: null`.
   - Intercettazione di rigetto asincrono: `Promise.resolve(...).catch(...)` converte qualsiasi disconnessione o errore infrastrutturale in eccezione `Authorization check failed`.
6. **Fail-closed su errore o ruolo non ADMIN**:
   - `requesterError` $\to$ lancia `Authorization check failed` (mascherando dettagli interni).
   - `!requesterData || requesterData.role !== 'ADMIN'` $\to$ lancia `Forbidden: Only Admins can change passwords`.
7. **Consumo del Body e Mutazione**: solo dopo che la condizione `requesterData.role === 'ADMIN'` è verificata, l'Edge Function esegue `req.json()`, valida la lunghezza minima di 6 caratteri e chiama `updateUserById(targetUserId, ...)`.

Nessuna operazione di mutazione o lettura del payload avviene prima del gate autorizzativo.

---

## 4. Caller / Target Trust Boundaries

La separazione tra identità del chiamante (*Caller*) e utente destinatario (*Target*) è rigorosa:

| Dimensione | Chiamante (Caller) | Destinatario (Target) |
|---|---|---|
| **Sorgente Identità** | JWT verificato via `auth.getUser()` $\to$ `user.id` | Body della richiesta $\to$ `targetUserId` |
| **Ruolo Autorizzativo** | `public.profiles.role` letto dal database | Nessuna verifica di ruolo (irrilevante ai fini autorizzativi) |
| **Parsing Temporale** | Immediato all'avvio della richiesta | Solo DOPO aver validato che il Caller è `ADMIN` |
| **Potere di Elevazione** | Se `ADMIN`, autorizzato a procedere | Nessun potere di elevare o autorizzare il chiamante |

### Scenari di attacco testati:
- **Caller `USER` $\to$ Target `ADMIN`**:
  Il chiamante con `profiles.role = 'USER'` tenta di cambiare la password di un amministratore fornendo `targetUserId = <admin-id>`.
  Il controllo esamina esclusivamente `profiles.role` del chiamante (`USER`).
  Esito: **DENY (Forbidden)**. Zero chiamate a `updateUserById`.
- **Caller `ADMIN` $\to$ Target `USER` / `GUEST` / `ADMIN` (self o other)**:
  Il chiamante ha `profiles.role = 'ADMIN'`. Il controllo autorizzativo passa. La password del target indicato viene aggiornata.
  Esito: **ALLOW**. Esattamente 1 chiamata a `updateUserById`.
- **Tentativo di spoofing via body (`callerId`, `userId`, `user_id`, `role: 'ADMIN'`)**:
  Il chiamante `USER` inserisce parametri arbitrari nel JSON per simulare un'identità amministrativa.
  Poiché il body non viene nemmeno letto prima del gate e il filtro SQL è rigidamente ancorato a `user.id` del token, l'attacco fallisce senza alcun effetto.

---

## 5. Canonical Authority Review

L'unica fonte autorizzativa verificata dal codice è:
$$\mathbf{public.profiles.role}$$

È formalmente provato che nessuna delle seguenti fonti influenza o partecipa alla decisione:
- `raw_user_meta_data` / `user_metadata`
- `raw_app_meta_data` / `app_metadata`
- Claim di ruolo JWT personalizzati
- `public.user_app_state.role` (completamente rimosso)
- Numero di annualità (0, 1 o multiple) dell'ente o dell'utente
- Stato `OPEN` o `CLOSED` degli snapshot finanziari
- Parametri nel request body (`role`, `callerRole`, `callerId`, `userId`)
- Ruolo o permessi del `targetUserId`
- Visibilità o guardie di routing del frontend

---

## 6. Adversarial Matrix

| Scenario Chiamata | Stato HTTP | Esito | `updateUserById` | Lettura Body |
|---|:---:|:---:|:---:|:---:|
| Header `Authorization` assente | 400 | DENY (Unauthorized) | 0 | NO |
| JWT invalido o corrotto | 400 | DENY (Unauthorized) | 0 | NO |
| Utente assente da `getUser` | 400 | DENY (Unauthorized) | 0 | NO |
| Profilo chiamante assente in `profiles` | 400 | DENY (Forbidden) | 0 | NO |
| Ruolo chiamante `NULL` | 400 | DENY (Forbidden) | 0 | NO |
| Ruolo chiamante `'GUEST'` | 400 | DENY (Forbidden) | 0 | NO |
| Ruolo chiamante `'USER'`, target altro utente | 400 | DENY (Forbidden) | 0 | NO |
| Ruolo chiamante `'USER'`, target sé stesso | 400 | DENY (Forbidden) | 0 | NO |
| Ruolo chiamante `'admin'` (minuscolo) | 400 | DENY (Forbidden) | 0 | NO |
| Ruolo chiamante `' ADMIN '` (spazi) | 400 | DENY (Forbidden) | 0 | NO |
| Ruolo chiamante stringa vuota `''` | 400 | DENY (Forbidden) | 0 | NO |
| Ruolo chiamante inatteso (es. `'AUDITOR'`) | 400 | DENY (Forbidden) | 0 | NO |
| Caller `USER` + Target `ADMIN` | 400 | DENY (Forbidden) | 0 | NO |
| Caller `USER` + Snapshot `user_app_state` `ADMIN CLOSED` | 400 | DENY (Forbidden) | 0 | NO |
| Caller `USER` + Metadata `ADMIN` | 400 | DENY (Forbidden) | 0 | NO |
| Caller `USER` + Body `{ role: 'ADMIN', callerId: 'admin' }` | 400 | DENY (Forbidden) | 0 | NO |
| Errore query database (`requesterError`) | 400 | DENY (Auth check failed) | 0 | NO |
| Rigetto asincrono della Promise di lookup (DB connection drop) | 400 | DENY (Auth check failed) | 0 | NO |
| Caller `ADMIN` + Input non valido (password < 6 caratteri) | 400 | DENY (Invalid input) | 0 | SÌ |
| Caller `ADMIN` + Target sé stesso (`targetUserId = callerId`) | 200 | ALLOW | 1 | SÌ |
| Caller `ADMIN` + Target altro utente (`targetUserId = targetId`) | 200 | ALLOW | 1 | SÌ |
| Preflight CORS `OPTIONS` | 200 | ALLOW (Preflight ok) | 0 | NO |

In tutti i casi di diniego autorizzativo, `updateUserById` registra **zero mutazioni**.

---

## 7. Service-Role Review

L'uso del client privilegiato con `SERVICE_ROLE_KEY` (`supabaseAdmin`) rispetta i principi di minimo privilegio ed isolamento:
1. Viene istanziato unicamente **dopo** che il chiamante ha dimostrato crittograficamente la propria identità via `auth.getUser()`.
2. Viene utilizzato per interrogare `public.profiles` forzando la clausola `.eq('id', user.id)` sull'ID verificato del chiamante. L'adozione del service-role in lettura protegge da problemi di policy RLS ricorsive o non allineate.
3. L'operazione di mutazione con privilegi massimi (`auth.admin.updateUserById`) è invocata **esclusivamente** dopo il controllo `requesterData.role === 'ADMIN'`. Non sussiste alcuna mutazione anticipata o incontrollata.

---

## 8. HTTP Semantics & Security Properties

Nel codice originale, tutte le eccezioni venivano intercettate dal blocco catch globale e restituite con HTTP 400 (`Bad Request`):
```typescript
} catch (error) {
    return new Response(
        JSON.stringify({ error: error.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
}
```

- **Valutazione di Sicurezza:**
  La proprietà fondamentale richiesta per l'autorizzazione server-side è il **Fail-Closed**: ogni richiesta non autorizzata deve arrestarsi con zero mutazioni e non esporre informazioni riservate (stack trace, schemi SQL, credenziali). Questa proprietà è pienamente rispettata.
- **Valutazione Semantica HTTP (`NON_BLOCKING_HTTP_SEMANTICS_NOTE`):**
  L'uso di status 400 anziché 401 per `Unauthorized` o 403 per `Forbidden` è una scelta contrattuale preesistente preservata per compatibilità con il frontend (`UserManagementPage.tsx`), che gestisce i messaggi di errore restituiti dal corpo JSON. Non costituisce vulnerabilità né difetto bloccante.

---

## 9. Deployment Dependency: Profile-Role Migration

È imperativo distinguere tra la correttezza del codice Edge e lo stato dell'ambiente live:

1. **Stato del codice Edge:**
   La correzione implementata in `update-password/index.ts` è architetturalmente e logicamente corretta in ambiente locale.
2. **Dipendenza di deploy (`DEPLOYMENT_DEPENDENCY`):**
   La migration di sicurezza `20261002000000_harden_auth_profile_role_source.sql` (che impone vincoli e trigger di protezione sulla colonna `profiles.role` nel database) si trova nello stato:
   $$\mathbf{APPLY\_PENDING \ / \ LIVE\_FIX\_NOT\_VERIFIED}$$
   La presente review attesta la correttezza del gate applicativo dell'Edge Function `update-password`, ma **non certifica** che il database di staging o produzione sia già impermeabile a scritture indebite su `profiles.role`.
   Il gate della migration Auth resta una dipendenza di deployment indispensabile prima del rilascio in produzione.

---

## 10. Scope Integrity

Tutti i vincoli di non alterazione del repository sono stati verificati:

- **File modificati in produzione:** esclusivamente `supabase/functions/update-password/index.ts` (12 righe aggiunte, 7 rimosse).
- **File di test aggiunti:** `src/__tests__/updatePasswordCanonicalAuthorization.test.ts`.
- **File di report:** `AUTH_ADMIN_02A_IMPLEMENTATION_REPORT.md` e `AUTH_ADMIN_02A_INDEPENDENT_REVIEW.md`.
- **Verifica hash SHA-256 dei file protetti (identità al 100%):**
  - `supabase/functions/create-user/index.ts`: `D95E40ACDC81B16C7AFBF9970C49F6E9361E2C6802F9DFF5D555BC5D1F25CFD4`
  - `src/__tests__/createUserAdminAuthorization.test.ts`: `4AC728B2773092E90937F5B6CD77D5FC28F3264CAA9D5791AFFD2426C6B20326`
  - `AUTH_ADMIN_01_IMPLEMENTATION_REPORT.md`: `2FC883011037F9FA192815F63318447A6A245DEEDFB2EAAC3A7F8349C256484C`
  - `AUTH_ADMIN_01_INDEPENDENT_REVIEW.md`: `0B1D5CA371CBE0C08680F0EE84616FFAF8253A343E43E40333E73A197CC33E96`
  - `supabase/functions/delete-user/index.ts`: `46B201971F81FDFCB6C6487A0EED5364A4D7E0A37BC3C07DE9572F11FDFCD6DA`
  - `src/pages/UserManagementPage.tsx`: `21124D8B493F03C19493E57C2B69B2913C6EDB5DCF25A54DAFA24FF7AFF47F31`
  - `src/__tests__/securityMigrations.test.ts`: `4A2217191B161894846271D47C738BA2DEA1B72CC0626504E273958A8305D403`
  - `src/features/wizard2026/__tests__/wizard2026RemoteDraftSync.test.ts`: `188B79924C5A8D387A58D9ED3AFE6251E1E11AC9FFCECD759A1B694204CFE0F4`
  - `supabase/migrations/20261002000000_harden_auth_profile_role_source.sql`: `8670E439CD6FA8AE969652445637168491AFD3388DE710CE2AE9E2752EF2614D`
- **Componenti core intatti:** nessun impatto su formule finanziarie, motori di calcolo, Canonical Fund Ledger, presenter/documenti, Cabina di Regia o Distribuzione.

---

## 11. Residual Findings

I seguenti finding del piano di bonifica ASTRA rimangono formalmente aperti e non alterati:

1. **`AUTH_ADMIN_02B_DELETE_CANONICAL_AUTH`**: bonifica autorizzativa dell'operazione distruttiva in `delete-user/index.ts`.
2. **`AUTH_ROLE_03`**: gestione transazionale del disallineamento ruolo in `UserManagementPage.tsx`.
3. **`AUTH_PROFILE_ROLE_PENDING_GATE`**: applicazione e validazione live della migration `20261002000000`.
4. **`CALC-02` / `NORM-01`**: i due **BLOCKER** primari del progetto relativi alle formule di calcolo finanziario e alla pipeline di normalizzazione dati.

---

## 12. Quality Gates Summary

| Gate | Comando | Esito | Note |
|---|---|:---:|---|
| Test Dedicato 02A | `npx vitest run src/__tests__/updatePasswordCanonicalAuthorization.test.ts` | **PASS** | 34/34 superati in 85ms |
| Regressione 01 | `npx vitest run src/__tests__/createUserAdminAuthorization.test.ts` | **PASS** | 19/19 superati in 55ms |
| Security Suites | `npx vitest run securityMigrations rlsPolicySimulation authorizationPolicy` | **PASS** | 67/67 superati in 54ms |
| Esecuzione Congiunta | 5 suite targeted eseguite simultaneamente | **PASS** | 120/120 superati in 236ms |
| Type Checking | `npx tsc --noEmit` | **PASS** | Exit code 0, 0 errori |
| Git Formatting | `git diff --check` | **PASS** | Exit code 0 |

---

## 13. Next-Gate Recommendation

Si raccomanda l'approvazione formale dello slice `AUTH_ADMIN_02A`.

La sequenza di avanzamento suggerita:
1. Procedere con **`AUTH_ADMIN_02B_DELETE_CANONICAL_AUTH`** per completare la blindatura delle Edge Functions Auth (`delete-user`).
2. Indirizzare prioritariamente i due Blocker normativo-finanziari **`CALC-02`** e **`NORM-01`**, che costituiscono il nucleo critico del valore di business dell'applicazione.
