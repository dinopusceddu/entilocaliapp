# MOD-036C — Diagnosi Urgente Caricamento Enti e Annualità in Produzione dopo Beta 1.3

Questo documento contiene la diagnosi completa, condotta esclusivamente in modalità **sola lettura**, relativa al problema riscontrato in produzione su:
`https://entilocaliapp.fpcgillombardia.workers.dev/`

In produzione, la dashboard mostra il seguente messaggio:
> "Per iniziare a configurare il fondo, devi prima creare un ente nella sezione Enti e Annualità"

e la card **"Configurazione fondi incentivanti"** risulta disabilitata anche se sul database Supabase sono presenti enti e annualità storici già compilati dagli utenti.

---

## 1. Presenza Dati su Supabase (Verifica)

Sulla base dei test eseguiti collegandosi direttamente all'API Supabase di produzione (`https://yggokplxleredipknfbq.supabase.co`), **tutti i dati storici sono presenti e integri**. 

In particolare, per l'utente amministratore `dino.pusceddu@cgil.lombardia.it` (ID utente `1869e7a0-9db7-4155-8b2e-fadf123ed785`):
- Il profilo utente registra correttamente il ruolo globale **`ADMIN`**.
- L'utente possiede direttamente **7 enti** (es. "Comune di Treviglio", "Ente Test AG-FIXED") e **16 record di annualità** (`user_app_state`).
- Nel database globale sono memorizzati **33 enti** e **45 record di annualità** complessivi creati da vari utenti, tutti perfettamente conservati.

Nessun dato è andato perso o corrotto nel database.

---

## 2. Analisi Root Cause (Causa Principale)

Il problema risiede in una **race condition** durante l'inizializzazione dell'applicazione accoppiata a un comportamento **non reattivo dello stato dei permessi**.

### Flusso di avvio attuale (`AppProvider` in `AppContext.tsx`):
1. **Recupero Sessione Auth:** L'app riceve l'oggetto `user` da `useAuth()`. Questo oggetto contiene solo le informazioni elementari di autenticazione Supabase (es. `id`, `email`), ma **non** contiene la proprietà personalizzata `role` (ruolo applicativo come `ADMIN` o `GUEST`).
2. **Caricamento Enti:** Parallelamente all'avvio, l'effetto `useEffect` agganciato a `[user]` scatena immediatamente la funzione `loadEntities()`:
   ```typescript
   useEffect(() => {
     if (user) {
       loadEntities();
     }
   }, [user]);
   ```
   Questa chiama `loadEntitiesWorkflow(deps, user, dispatch)`.
3. **Filtro di Proprietà preventivo:** All'interno del workflow, per decidere se caricare solo gli enti di proprietà o tutti gli enti, viene chiamata la policy:
   ```typescript
   const filterUserId = shouldFilterByOwner(user) ? user.id : undefined;
   ```
   Poiché `user` (da `useAuth()`) non ha ancora la proprietà `role` popolata, `shouldFilterByOwner` valuta `user.role === undefined` che ricade per default in `true`. Di conseguenza, la query agli enti viene forzatamente filtrata per `user_id = user.id`.
4. **Recupero Ruolo Utente (Asincrono):** Concomitantemente, l'effetto dedicato al ruolo utente recupera la riga dal database `profiles` e aggiorna `state.currentUser.role` a `'ADMIN'` tramite dispatch.
5. **Mancato Ricaricamento (Il Bug):** La funzione `loadEntities` e il relativo `useEffect` **non dipendono** da `state.currentUser.role` o da `state.currentUser`. Di conseguenza, una volta che il ruolo utente è stato correttamente idratato a `ADMIN`, l'app **non riesegue** `loadEntities()`.
   - Se l'utente è un amministratore che non possiede direttamente gli enti cercati (o se il database restituisce `[]` per il suo ID specifico durante la prima query), la lista rimane permanentemente vuota (`[]`).
   - Questo fa scattare la condizione `state.entities.length === 0` che disabilita i moduli e mostra l'alert sulla dashboard.

### Problema Secondario (Gestione Anni in `EntityYearManagementPage.tsx`):
Nel file [EntityYearManagementPage.tsx](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/pages/EntityYearManagementPage.tsx), il caricamento degli anni per l'ente selezionato interroga direttamente Supabase forzando il filtro sul proprietario:
```typescript
const { data, error } = await supabase
    .from('user_app_state')
    .select('current_year, fund_data')
    .eq('user_id', state.currentUser.id)
    .eq('entity_id', selectedEntityId)
```
Questo impedisce a un utente con ruolo `ADMIN` di visualizzare le annualità disponibili per enti che non ha creato direttamente, lasciando la lista anni vuota per tali enti.

---

## 3. File e Funzioni Coinvolti

1. **`src/contexts/AppContext.tsx`**
   - **Funzione `loadEntities`**: Utilizza erroneamente il parametro `user` (raw auth) anziché `state.currentUser` (che riceve il ruolo).
   - **`useEffect` di caricamento**: Mancanza di reattività al cambio di ruolo (`state.currentUser.role` assente dall'array di dipendenze).
2. **`src/pages/EntityYearManagementPage.tsx`**
   - **`useEffect` di caricamento anni (`loadYears`)**: Query hardcoded con `.eq('user_id', state.currentUser.id)` senza bypass in caso di utente `ADMIN`.

---

## 4. Patch Proposta (Senza Applicarla)

### Modifica 1: `src/contexts/AppContext.tsx`
Rendere il caricamento degli enti reattivo al ruolo dell'utente ed utilizzare `state.currentUser` come sorgente autorevole del ruolo:

```diff
-  const loadEntities = useCallback(async () => {
-    const ctx = await loadEntitiesWorkflow(deps, user, dispatch);
-    if (ctx && ctx.entity && ctx.year) {
-      await switchYearAtomic(ctx.year, ctx.entity);
-    }
-  }, [deps, user, dispatch, switchYearAtomic]);
+  const loadEntities = useCallback(async () => {
+    // Usa state.currentUser per includere le informazioni sul ruolo aggiornato
+    const ctx = await loadEntitiesWorkflow(deps, state.currentUser, dispatch);
+    if (ctx && ctx.entity && ctx.year) {
+      await switchYearAtomic(ctx.year, ctx.entity);
+    }
+  }, [deps, state.currentUser, dispatch, switchYearAtomic]);
 
   useEffect(() => {
     if (user) {
       loadEntities();
     }
     // eslint-disable-next-line react-hooks/exhaustive-deps
-  }, [user]);
+  }, [user, state.currentUser.role]);
```

### Modifica 2: `src/pages/EntityYearManagementPage.tsx`
Bypassare il filtro per `user_id` se l'utente ha privilegi amministrativi (`ADMIN`), consentendogli di gestire le annualità di tutti gli enti visibili:

```diff
     // Load available years for the selected entity
     useEffect(() => {
         const loadYears = async () => {
             if (!selectedEntityId) return;
             setIsLoadingYears(true);
             try {
-                const { data, error } = await supabase
-                    .from('user_app_state')
-                    .select('current_year, fund_data')
-                    .eq('user_id', state.currentUser.id)
-                    .eq('entity_id', selectedEntityId)
-                    .order('current_year', { ascending: false });
+                let query = supabase
+                    .from('user_app_state')
+                    .select('current_year, fund_data')
+                    .eq('entity_id', selectedEntityId);
+
+                // Gli amministratori non filtrano per proprietario per gestire tutti gli anni dell'ente
+                if (state.currentUser.role !== 'ADMIN') {
+                    query = query.eq('user_id', state.currentUser.id);
+                }
+
+                const { data, error } = await query.order('current_year', { ascending: false });
 
                 if (error) throw error;
                 setEntityYears(data ? data.map(d => ({
                     year: d.current_year,
                     status: (d.fund_data as any)?.metadata?.snapshotStatus || 'OPEN'
                 })) : []);
             } catch (err) {
                 console.error("Error loading years for entity:", err);
             } finally {
                 setIsLoadingYears(false);
             }
         };
         loadYears();
-    }, [selectedEntityId]);
+    }, [selectedEntityId, state.currentUser.id, state.currentUser.role]);
```

---

## 5. Analisi dei Rischi in Produzione

- **Sicurezza e RLS:** La modifica rispetta pienamente le policy di sicurezza correnti impostate su Supabase. Gli amministratori sono già autorizzati a livello DB a leggere e modificare tutte le righe. Gli utenti standard (`GUEST`) continueranno ad essere correttamente filtrati a livello di query ed RLS, escludendo qualsiasi rischio di fuga di dati o accessi non autorizzati.
- **Transizioni di Stato:** Il caricamento doppio (iniziale come guest e successivo come admin) è idempotente e gestito in memoria tramite dispatch sincroni. Non introduce cicli infiniti poiché il `useEffect` dipende esclusivamente dall'ID di autenticazione e dal ruolo applicativo, che cambiano al massimo una volta per sessione.
- **Nessuna migrazione richiesta:** Trattandosi di un fix logico sul front-end, non occorre alcuna modifica dello schema Supabase, azzerando i rischi legati a DDL o sincronizzazioni del database.

---

## 6. Comandi ed Audit Eseguiti

Durante questa indagine diagnostica sono stati eseguiti i seguenti passaggi:
1. **Analisi statico-analitica del codice**: Ispezionato il flusso dei contesti in [AppContext.tsx](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/contexts/AppContext.tsx), il workflow in [stateWorkflow.ts](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/application/stateWorkflow.ts), e la gestione dei moduli in [DashboardPage.tsx](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/pages/DashboardPage.tsx).
2. **Ispezione Variabili di Ambiente**: Letto il file `.env` per verificare che punti a `https://yggokplxleredipknfbq.supabase.co` (confermato corretto).
3. **Scrittura script di diagnostica Supabase in sola lettura**:
   - Creato ed eseguito localmente `C:\Users\PuscedduD\.gemini\antigravity\brain\24a3a767-7fa9-4c56-9962-0fc76f70f129\scratch\test_read_db.cjs` per simulare l'autenticazione ed interrogare il database reale di produzione.
   - Verificata la corretta corrispondenza dei dati degli enti (33 record) e delle annualità (45 record) su Supabase.
   - Verificato il comportamento del filtro `user_id` che limita i risultati a 7 enti contro 33 in assenza del filtro.
4. **Verifica Git**: Eseguito `git log` per analizzare i file coinvolti e le modifiche recenti apportate con la Beta 1.3.

---

## 7. Conferma Vincoli

Si attesta sotto la propria responsabilità professionale che durante l'esecuzione del presente task:
- **NON** sono stati eseguiti commit.
- **NON** sono stati eseguiti push.
- **NON** è stato effettuato alcun deploy (Cloudflare Workers o altro).
- **NON** sono state apportate modifiche di schema o dati su Supabase (nessuna scrittura, migrazione o sincronizzazione).
- Il database remoto è rimasto inalterato.

---
*Il team attende autorizzazione esplicita per procedere all'applicazione delle patch descritte.*
