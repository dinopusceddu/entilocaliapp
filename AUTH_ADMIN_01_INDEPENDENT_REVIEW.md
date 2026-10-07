# AUTH_ADMIN_01 — Independent Security Review Report

**Review Date:** 2026-10-03\
**Reviewer:** Senior Application Security Reviewer (Independent Audit)\
**Slice Evaluated:** `AUTH_ADMIN_01_SERVER_ADMIN_CHECK`\
**Repository:** `dinopusceddu/entilocaliapp`\
**Branch:** `ux/toolbox-area-fondo-prototype`\
**HEAD:** `d3170f959b5815c514dbf3d6e5f93366a5f14c67`\
**Result:** **PASS — AUTH_ADMIN_01_INDEPENDENT_REVIEW = COMPLETE**

---

## 1. Executive Verdict

L'audit indipendente di sicurezza dell'implementazione dello slice `AUTH_ADMIN_01_SERVER_ADMIN_CHECK` ha esito **PASS**.

La vulnerabilità originaria documentata in `ARCH-02` / `AUTH_ADMIN_01` — in cui qualunque chiamante autenticato con un JWT valido poteva invocare l'Edge Function `create-user` e raggiungere `supabaseAdmin.auth.admin.createUser(...)` basandosi esclusivamente sulla visibilità client-side della pagina di amministrazione — risulta **interamente e rigorosamente mitigata lato server**.

Il flusso implementato rispetta scrupolosamente il contratto di sicurezza atteso:
$$\text{Verified JWT Caller} \longrightarrow \text{Verified } \texttt{user.id} \longrightarrow \text{Server-side Lookup } \texttt{public.profiles.role} \longrightarrow \texttt{role === 'ADMIN'} \longrightarrow \text{Admin Mutation}$$

Nessuna mutazione amministrativa (`auth.admin.createUser`) viene eseguita prima o in assenza della verifica autorizzativa server-side. Tutti i percorsi non autorizzati falliscono chiusi (*fail-closed*), senza consumare o leggere il body di business.

---

## 2. Production Diff Review

L'ispezione statica e comparativa del file produttivo `supabase/functions/create-user/index.ts` rispetto all'HEAD evidenzia le seguenti modifiche puntuali:

```diff
@@ -13,19 +13,28 @@ serve(async (req) => {
     }

     try {
+        const authorization = req.headers.get('Authorization')
+        if (!authorization) {
+            return new Response(
+                JSON.stringify({ error: 'Unauthorized' }),
+                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
+            )
+        }
+
         const supabaseClient = createClient(
             Deno.env.get('SUPABASE_URL') ?? '',
             Deno.env.get('SUPABASE_ANON_KEY') ?? '',
-            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
+            { global: { headers: { Authorization: authorization } } }
         )

-        // Check if the user calling this function is an ADMIN
-        // We already have RLS policies, but double-Checking here is good practice
+        // Verify the caller identity before reading the canonical role.
         const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
-        if (userError || !user) throw new Error('Unauthorized')
-
-        // Optional: Query your DB to check if this user is truly an admin if you want strict security
-        // For now, we rely on the fact that only Admins can see the page initiating this call
+        if (userError || !user) {
+            return new Response(
+                JSON.stringify({ error: 'Unauthorized' }),
+                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
+            )
+        }

         // Create the Admin Client (Service Role)
         const supabaseAdmin = createClient(
@@ -33,6 +42,20 @@ serve(async (req) => {
             Deno.env.get('SERVICE_ROLE_KEY') ?? ''
         )

+        // Only public.profiles.role for the verified caller authorizes Admin Auth mutations.
+        const { data: profile, error: profileError } = await supabaseAdmin
+            .from('profiles')
+            .select('role')
+            .eq('id', user.id)
+            .maybeSingle()
+        if (profileError) throw new Error('Authorization check failed')
+        if (profile?.role !== 'ADMIN') {
+            return new Response(
+                JSON.stringify({ error: 'Forbidden' }),
+                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
+            )
+        }
+
         const { email, password } = await req.json()

         // Create User
```

### Analisi del flusso reale di esecuzione
1. **Preflight CORS**: le richieste HTTP `OPTIONS` vengono gestite in testa prima di qualsiasi elaborazione o credenziale.
2. **Controllo presenza header `Authorization`**: se assente, risponde immediatamente con `401 Unauthorized` (senza istanziare client Supabase).
3. **Verifica crittografica JWT**: l'header viene passato a `supabaseClient.auth.getUser()`. Se `userError` o `user` è nullo, restituisce `401 Unauthorized`.
4. **Binding dell'identità del chiamante**: l'identificativo usato per il controllo autorizzativo è tassativamente `user.id` restituito da Supabase Auth.
5. **Lookup server-side del ruolo canonico**: instanziazione di `supabaseAdmin` per interrogare `public.profiles`, filtrando rigidamente su `id = user.id`.
6. **Fail-closed su errore DB**: se `profileError` è presente, lancia un'eccezione generica `'Authorization check failed'`, intercettata dal blocco catch che restituisce `400 Bad Request` senza divulgare dettagli SQL.
7. **Controllo esatto del ruolo**: `if (profile?.role !== 'ADMIN')` restituisce `403 Forbidden`. Profilo assente (`maybeSingle()` $\to$ `null`), ruolo `null`, `GUEST`, `USER`, stringa vuota o tentativi con maiuscole/minuscole non esatte vengono tutti respinti con `403`.
8. **Esecuzione protetta della mutazione**: solo dopo il superamento dell'ALLOW autorizzativo viene letto il body con `req.json()` (`email`, `password`) e invocato `supabaseAdmin.auth.admin.createUser(...)`.

Nessuna mutazione o lettura del body avviene prima del gate di autorizzazione.

---

## 3. Trust Boundary

L'analisi dei confini di fiducia (*trust boundaries*) evidenzia la robustezza dell'approccio:

### A. JWT Verification
L'Edge Function non esegue un banale parsing/decodifica non verificata del token (es. `jwt-decode` o decodifica Base64 del payload), ma delega l'autenticazione al server Supabase Auth tramite il metodo SDK `auth.getUser()`, che verifica firma crittografica, validità temporale ed eventuale revoca del token.

### B. Caller-ID Binding
Non esiste alcun passaggio in cui l'ID dell'utente possa essere iniettato dal client. La clausola `.eq('id', user.id)` è rigidamente vincolata all'oggetto `user` restituito dalla verifica crittografica di Supabase Auth. Il body della richiesta non viene nemmeno parsato prima dell'autorizzazione.

### C. Uso del Service-Role per il Lookup
L'impiego del `SERVICE_ROLE_KEY` per interrogare `profiles` è sicuro e legittimo in questo contesto:
- Il chiamante è già stato autenticato e validato crittograficamente;
- Il filtro è forzato sull'ID verificato del chiamante;
- La tabella `profiles` ha policy RLS che consentono all'utente di vedere solo il proprio profilo (`auth.uid() = id`), ma l'uso del client service-role previene rischi di ricorsione RLS legati a funzioni helper complesse;
- Il client service-role viene utilizzato in sola lettura per risolvere `profiles.role` prima di qualsiasi decisione;
- Nessuna operazione di scrittura o mutazione amministrativa avviene prima della conferma del ruolo `ADMIN`.

### D. Fail-Closed e Gestione Errori HTTP
Qualsiasi condizione anomala (errore di connessione al database, profilo inesistente, ruolo non configurato) blocca l'operazione.
- Un errore sul database genera l'eccezione generica `'Authorization check failed'`, convertita in HTTP 400 dal catch handler preesistente.
- **Valutazione semantica HTTP:** sebbene da una prospettiva puramente RESTful un fallimento del database interno possa essere assimilato a 500 e un rifiuto autorizzativo a 403, dal punto di vista della **sicurezza applicativa** la risposta con status 400 preserva integralmente la proprietà di fail-closed, nega la mutazione e maschera completamente lo schema e l'errore SQL interno all'utente. Non costituisce pertanto un finding né una vulnerabilità.

---

## 4. Adversarial Decision Matrix

| Scenario / Chiamata | Stato Atteso | Esito | `createUser` Chiamate | Body Parsato |
|---|:---:|:---:|:---:|:---:|
| Header `Authorization` assente | 401 | DENY | 0 | NO |
| JWT invalido / `getUser` error | 401 | DENY | 0 | NO |
| Utente non trovato da `getUser` | 401 | DENY | 0 | NO |
| Record `profiles` inesistente | 403 | DENY | 0 | NO |
| `profiles.role` NULL | 403 | DENY | 0 | NO |
| `profiles.role` = 'GUEST' | 403 | DENY | 0 | NO |
| `profiles.role` = 'USER' | 403 | DENY | 0 | NO |
| `profiles.role` = 'admin' (lowercase) | 403 | DENY | 0 | NO |
| `profiles.role` = ' ADMIN ' (spazi) | 403 | DENY | 0 | NO |
| `profiles.role` = '' (stringa vuota) | 403 | DENY | 0 | NO |
| `profiles.role` = 'ADMIN' canonico | 200 | ALLOW | 1 | SÌ |
| Metadata `ADMIN` + `profiles.role` = 'USER' | 403 | DENY | 0 | NO |
| `user_app_state.role` = 'ADMIN' + `profiles.role` = 'USER' | 403 | DENY | 0 | NO |
| Body `role: 'ADMIN'` + `profiles.role` = 'USER' | 403 | DENY | 0 | NO |
| Body `user_id: 'admin-uuid'` + `profiles.role` = 'USER' | 403 | DENY | 0 | NO |
| `profiles.role` = 'ADMIN' + Metadata/State/Body = 'GUEST' | 200 | ALLOW | 1 | SÌ |
| Errore query database (DB down / error) | 400 | DENY | 0 | NO |
| Payload JSON malformato inviato da non-admin | 403 | DENY | 0 | NO |

Per tutti i casi di DENY, la funzione di creazione utente (`supabaseAdmin.auth.admin.createUser`) ha esattamente **0 chiamate**.

---

## 5. Adversarial Spoofing Review

È dimostrato staticamente e dinamicamente che le seguenti fonti **NON partecipano in alcun modo** alla decisione autorizzativa:

1. **`raw_user_meta_data` / `user_metadata`**: mai letti dal codice dell'Edge Function.
2. **`raw_app_meta_data` / `app_metadata`**: mai letti dal codice dell'Edge Function.
3. **Claim JWT personalizzati non canonici**: ignorati.
4. **`user_app_state.role`**: la tabella `user_app_state` non viene mai interrogata all'interno dell'endpoint.
5. **Ruolo passato nel request body**: `req.json()` viene invocato solo dopo l'autorizzazione e destruttura esclusivamente `{ email, password }`.
6. **User ID passato nel request body**: l'ID per il filtro SQL proviene unicamente da `user.id` (output di `auth.getUser()`).
7. **Stato Frontend / Visibilità UI**: l'Edge Function opera interamente lato server; la precedente frase *"For now, we rely on the fact that only Admins can see the page initiating this call"* è stata rimossa.
8. **Storage del browser (`localStorage` / `sessionStorage`)**: inaccessibile dall'ambiente Edge.

L'unica fonte di autorità (*Single Source of Truth*) per l'autorizzazione è:
$$\mathbf{public.profiles.role}$$

---

## 6. TOCTOU / Race Condition Review

È stata valutata la presenza di una potenziale finestra temporale di Time-of-Check to Time-of-Use (TOCTOU) tra la riga di lookup del ruolo (`profiles.role`) e l'invocazione di `createUser`.

- **Analisi tecnica:** tra la risoluzione della query su `profiles` e la chiamata `createUser` intercorrono unicamente il parsing del payload JSON in memoria e la dispatch della chiamata API ad Auth. L'intervallo temporale è nell'ordine dei sub-millisecondi.
- **Architettura distribuita:** il servizio GoTrue di Supabase (Auth daemon) e il database PostgreSQL operano come servizi separati. Non esiste una transazione distribuita (2PC) a livello applicativo tra GoTrue e Postgres.
- **Classificazione:** **`NON_BLOCKING_DESIGN_NOTE`**.
- **Motivazione:** il modello implementato è quello standard e ottimale per architetture cloud stateless/serverless. Le revoche di privilegi ADMIN sono eventi rari e non sincronizzati con transazioni esterne. L'assenza di un blocco transazionale distribuito non rappresenta una vulnerabilità sfruttabile né blocca il rilascio.

---

## 7. Test Harness Review

Il file di test dedicato `src/__tests__/createUserAdminAuthorization.test.ts` è stato sottoposto a revisione critica:

1. **Esercizio del codice reale di produzione:**
   Il test non reimplementa né simula l'handler in un file separato. Legge direttamente il sorgente da `supabase/functions/create-user/index.ts`, rimuove esclusivamente le righe di import URL remoto (`deno.land` e `esm.sh`), transpila con TypeScript (`ts.transpileModule`) ed esegue l'handler reale in un contesto isolato Node.js VM (`runInNewContext`).
2. **Fedeltà dell'ambiente:**
   L'Edge runtime di Supabase è basato su Deno e implementa gli standard WHATWG per `Request` e `Response`. Poiché Node.js moderno adotta gli stessi standard globali WHATWG per `Request` e `Response`, la semantica dei flussi HTTP, degli header e delle Promise è identica.
3. **Isolamento e Mocking rigoroso:**
   I mock sono applicati esclusivamente ai confini esterni (`serve`, `createClient`, `auth.getUser`, `auth.admin.createUser`, `from('profiles')`). La logica di controllo, i rami condizionali e la sequenza temporale degli eventi sono eseguiti fedelmente dal codice originale.
4. **Verifica delle mutazioni:**
   Tutti i casi negativi asseriscono sia l'assenza di chiamate a `createUser` (`expect(h.createUser).not.toHaveBeenCalled()`), sia l'assenza di lettura del body (`expect(json).not.toHaveBeenCalled()`).
5. **Esito dell'esecuzione:**
   Tutti i 19 test della suite sono stati eseguiti localmente e risultano **PASS** (19/19 superati in 54ms).

---

## 8. Scope Integrity

Verifica della delimitazione dello slice e assenza di regressioni fuori perimetro:

- **File modificati in produzione:** esclusivamente `supabase/functions/create-user/index.ts`.
- **File di test aggiunti:** esclusivamente `src/__tests__/createUserAdminAuthorization.test.ts`.
- **File di documentazione aggiunti:** `AUTH_ADMIN_01_IMPLEMENTATION_REPORT.md` e `AUTH_ADMIN_01_INDEPENDENT_REVIEW.md`.
- **File preesistenti preservati con integrità SHA-256 verificata:**
  - `src/__tests__/securityMigrations.test.ts`: `4A2217191B161894846271D47C738BA2DEA1B72CC0626504E273958A8305D403` (Identico)
  - `src/features/wizard2026/__tests__/wizard2026RemoteDraftSync.test.ts`: `188B79924C5A8D387A58D9ED3AFE6251E1E11AC9FFCECD759A1B694204CFE0F4` (Identico)
  - `supabase/migrations/20261002000000_harden_auth_profile_role_source.sql`: `8670E439CD6FA8AE969652445637168491AFD3388DE710CE2AE9E2752EF2614D` (Identico)
- **Nessuna modifica a perimetri sensibili:**
  - Nessuna modifica a `update-password` o `delete-user`.
  - Nessuna modifica a `UserManagementPage` (role mirror).
  - Nessuna nuova migration creata né applicata al database.
  - Nessuna modifica alle formule di calcolo finanziario, al Canonical Fund Ledger, alla pipeline documentale, a Cabina di Regia o a Distribuzione.

---

## 9. Residual Findings Explicitly Untouched

I seguenti finding identificati nel piano generale restano formalmente aperti e non sono stati alterati dallo slice:

1. **`AUTH_ADMIN_02`**:
   - `AUTH_ADMIN_02A`: migrazione della verifica autorizzativa in `update-password` su fonte canonica `profiles`.
   - `AUTH_ADMIN_02B`: migrazione della verifica autorizzativa in `delete-user` su fonte canonica `profiles`.
2. **`AUTH_ROLE_03`**:
   - Disallineamento non transazionale del mirror `user_app_state.role` rispetto a `profiles.role` in `UserManagementPage.tsx`.
3. **`AUTH_PROFILE_ROLE_PENDING_GATE`**:
   - Migration `20261002000000_harden_auth_profile_role_source.sql` nello stato `APPLY_PENDING / LIVE_FIX_NOT_VERIFIED`.
4. **`CALC-02` / `NORM-01`**:
   - Refactoring normativo e documentale delle formule finanziarie e presenter.

---

## 10. Quality Gates Summary

| Quality Gate | Comando Eseguito | Risultato | Dettaglio |
|---|---|:---:|---|
| Dedicated Suite | `npx vitest run src/__tests__/createUserAdminAuthorization.test.ts` | **PASS** | 19 test passati, 0 falliti |
| Pertinent Security Suites | `npx vitest run src/__tests__/securityMigrations.test.ts src/__tests__/rlsPolicySimulation.test.ts src/application/__tests__/authorizationPolicy.test.ts` | **PASS** | 67 test passati, 0 falliti |
| Static Type Check | `npx tsc --noEmit` | **PASS** | Exit code 0, 0 errori TS |
| Git Diff Check | `git diff --check` | **PASS** | Exit code 0, nessun whitespace errato |
| Network Isolation | Test locali isolati, nessuna chiamata HTTP | **PASS** | Zero tentativi di rete verso staging/produzione |

---

## 11. Next-Gate Recommendation

Si raccomanda l'approvazione formale dello slice `AUTH_ADMIN_01_SERVER_ADMIN_CHECK`.

Il percorso di remediation suggerito può ora procedere con:
- **`AUTH_ADMIN_02A_PASSWORD_CANONICAL_AUTH`** (bonifica autorizzativa di `update-password`); oppure
- La presa in carico dei finding documentali e finanziari prioritari (`CALC-02` / `NORM-01`), secondo la roadmap di rilascio concordata.
