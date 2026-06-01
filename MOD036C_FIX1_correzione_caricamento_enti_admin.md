# MOD-036C-FIX1 — Correzione Caricamento Enti e Annualità ADMIN dopo deploy Beta 1.3

Questo documento descrive la correzione applicata per risolvere il bug del caricamento enti e delle annualità per gli utenti con ruolo `ADMIN` riscontrato in produzione dopo il deploy della Beta 1.3.

---

## 1. Causa Tecnica Confermata

1. **Race Condition ed Effetto Non-Reattivo (Inizializzazione):**
   Durante l'avvio o la fase di login, la funzione `loadEntities()` in [AppContext.tsx](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/contexts/AppContext.tsx) veniva invocata passando l'oggetto `user` grezzo derivante dall'autenticazione (`useAuth()`), che è privo della proprietà `role`.
   Questo faceva ricadere la policy `shouldFilterByOwner` per default su `true` (filtrando gli enti con `user_id = user.id`).
   Una volta recuperato il ruolo effettivo dall'endpoint asincrono (es. `ADMIN`) e dispatchato nello stato globale `state.currentUser.role`, il `useEffect` associato a `loadEntities()` non si riattivava perché dipendeva unicamente da `[user]` e non reagiva al cambio del ruolo.
   Per gli utenti `ADMIN` che non possiedono direttamente record in tabella `entities`, la query restituiva una lista vuota `[]`, disabilitando la card di configurazione del fondo e mostrando il banner di errore.

2. **Loop Infinito di Chiamate (Risolto in corso d'opera):**
   Inizialmente, nel primo abbozzo della correzione, la dipendenza `loadEntities` (callback) era inserita nell'array di dipendenze del `useEffect` di caricamento.
   Poiché `loadEntities` dipendeva dall'intero oggetto `state.currentUser` (il quale viene ricreato a livello di riferimento ad ogni dispatch di tipo `LOAD_STATE_FROM_DB`), il cambio dell'annualità scatenava a catena la ricreazione del callback, provocando una riesecuzione ciclica infinita dell'effetto e esaurendo le risorse del browser.
   *Risoluzione:* Abbiamo rimosso la dipendenza del callback dall'effetto di bootstrap, impostando come dipendenze unicamente le proprietà primitive dell'utente (`user?.id`, `state.currentUser?.id`, `state.currentUser?.role`), spezzando in modo definitivo il ciclo.

3. **Filtro Proprietario Rigido nella Gestione Annualità:**
   La pagina [EntityYearManagementPage.tsx](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/pages/EntityYearManagementPage.tsx) filtrava le annualità in modo fisso inserendo `.eq('user_id', state.currentUser.id)`, impedendo all'amministratore di visualizzare gli esercizi inseriti per enti creati da altri utenti.

---

## 2. File Modificati e Logica Prima / Dopo

### 2.1 [AppContext.tsx](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/contexts/AppContext.tsx)

#### Prima:
```typescript
  const loadEntities = useCallback(async () => {
    const ctx = await loadEntitiesWorkflow(deps, user, dispatch);
    if (ctx && ctx.entity && ctx.year) {
      await switchYearAtomic(ctx.year, ctx.entity);
    }
  }, [deps, user, dispatch, switchYearAtomic]);

  useEffect(() => {
    if (user) {
      loadEntities();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);
```

#### Dopo:
```typescript
  const loadEntities = useCallback(async () => {
    const ctx = await loadEntitiesWorkflow(deps, state.currentUser, dispatch);
    if (ctx && ctx.entity && ctx.year) {
      await switchYearAtomic(ctx.year, ctx.entity);
    }
  }, [deps, state.currentUser, dispatch, switchYearAtomic]);

  useEffect(() => {
    if (user) {
      loadEntities();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, state.currentUser?.id, state.currentUser?.role]);
```

---

### 2.2 [EntityYearManagementPage.tsx](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/pages/EntityYearManagementPage.tsx)

#### Prima:
```typescript
                const { data, error } = await supabase
                    .from('user_app_state')
                    .select('current_year, fund_data')
                    .eq('user_id', state.currentUser.id)
                    .eq('entity_id', selectedEntityId)
                    .order('current_year', { ascending: false });
```

#### Dopo:
```typescript
                let query = supabase
                    .from('user_app_state')
                    .select('current_year, fund_data')
                    .eq('entity_id', selectedEntityId);

                if (state.currentUser.role !== 'ADMIN') {
                    query = query.eq('user_id', state.currentUser.id);
                }

                const { data, error } = await query.order('current_year', { ascending: false });
```

---

## 3. Test Automatici Aggiunti o Aggiornati

Nel file [stateWorkflow.test.ts](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/application/__tests__/stateWorkflow.test.ts) sono stati aggiunti e configurati i seguenti scenari:
- **`loadEntitiesWorkflow` per utente non-ADMIN (GUEST):** Verifica che la query del repository enti applichi il filtro `user_id = user.id`.
- **`loadEntitiesWorkflow` per utente ADMIN:** Verifica che il parametro inviato a `getAll` sia `undefined` (disattivando il filtro proprietario).
- **`loadAvailableYearsWorkflow` per utente non-ADMIN (GUEST):** Verifica che la query delle annualità applichi il filtro proprietario.
- **`loadAvailableYearsWorkflow` per utente ADMIN:** Verifica che la query delle annualità salti il filtro `user_id`.

Tutti i test unitari esistenti continuano a passare regolarmente, assicurando l'assenza di regressioni.

---

## 4. Esiti Validazioni Locali

- **Typecheck (`npx tsc --noEmit`):** Superato con successo (0 errori).
- **Unit Tests (`npx vitest run`):** 369/369 test passati con successo (incluso la suite di test modificata).
- **Production Build (`npm run build`):** Compilazione terminata correttamente senza errori di bundling o minificazione.
- **Verifica via Browser Automation (Collaudo locale):**
  - Autenticato come utente `ADMIN` (`dino.pusceddu@cgil.lombardia.it`).
  - Caricamento corretto ed immediato della lista enti storica contenuta in Supabase.
  - Caricamento corretto degli anni (2026, 2027, 2030) collegati all'ente, inclusi gli enti creati e posseduti da altri utenti.
  - Abilitazione della card della dashboard "Configurazione fondi incentivanti" ed accesso fluido alla schermata di onboarding.
  - Assenza completa di errori di loop in console browser (log pulito, nessuna chiamata ridondante).

---

## 5. Stato dei Vincoli e Database Remoto

- **Sincronizzazione DB Supabase:** Nessun DDL o migrazione SQL è stato applicato a Supabase. Lo schema del database è rimasto completamente inalterato.
- **Integrità Dati:** Non è stata eseguita alcuna operazione distruttiva, cancellazione o scrittura manuale sul database.
- **Deploy:** Nessun deploy di produzione (live) è stato effettuato in questa fase.

---

## 6. Checklist per Collaudo in Produzione post-Merge

Dopo il merge controllato su `main` e la pubblicazione automatica in produzione tramite pipeline, eseguire le seguenti verifiche:
1. Accedere alla pagina di login in produzione e verificare la versione: `Versione Beta 1.3`.
2. Effettuare il login con account amministratore (`dino.pusceddu@cgil.lombardia.it`).
3. Verificare che la dashboard carichi regolarmente l'ente attivo selezionato dall'ultimo contesto e che la card **"Configurazione fondi incentivanti"** sia abilitata.
4. Navigare su **"Enti e Annualità"**:
   - Selezionare un ente non posseduto (es. `Comune di Breno`).
   - Verificare che compaiano le annualità collegate senza errori.
5. Aprire la console sviluppatore (F12) e assicurarsi che non siano presenti errori bloccanti o cicli infiniti di chiamate GET.

---

> [!IMPORTANT]
> **Lo sviluppo della funzionalità MOD-037 (Persistenza remota del Wizard 2026 su Supabase) rimane formalmente sospeso** fino al collaudo positivo in produzione di questo fix.

---
*Il team attende autorizzazione per procedere con il commit locale controllato e la PR.*
