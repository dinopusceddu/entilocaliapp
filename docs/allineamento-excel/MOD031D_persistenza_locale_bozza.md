# Relazione Tecnica Finale - MOD-031D: Persistenza Locale Bozza e Protezione Anti-Sovrascrittura

## 1. Obiettivo e Sintesi dell'Intervento
L'intervento risolve in modo robusto il problema della perdita di dati e delle sovrascritture concorrenti scatenate dagli effetti collaterali (`useEffect`) all'interno dell'applicazione React (`entilocaliapp`). 

Per rispettare i vincoli operativi di non apportare scritture in questa fase sul database di produzione Supabase o sul repository GitHub remoto, è stata introdotta un'architettura **client-side isolata in locale**, basata sul tracciamento delle sorgenti e sul salvataggio temporaneo delle sessioni in `sessionStorage`.

---

## 2. Elenco dei File Modificati e Aggiunti

### Aggiunti:
1. **[localDraftStorage.ts](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/application/localDraftStorage.ts):**
   * Nuovo modulo per la gestione sicura (con gestione try/catch di `sessionStorage` non disponibile) delle bozze in locale, indicizzate in modo univoco per la chiave combinata `userId_entityId_year`.

### Modificati:
2. **[appState.ts](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/domain/appState.ts):**
   * Estensione dell'interfaccia `AppState` con i campi di gestione bozza locale (`hasPendingDraft`, `pendingDraftData`, `pendingDraftSources`, `pendingDraftMetadata`, `localSources`).
   * Aggiunta delle action `SET_PENDING_DRAFT`, `CLEAR_PENDING_DRAFT` e `UPDATE_LOCAL_SOURCES`.
3. **[AppContext.tsx](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/contexts/AppContext.tsx):**
   * Reducer aggiornato per memorizzare le sorgenti manuali nelle action `UPDATE_*`.
   * Integrazione del controllo di presenza bozza all'interno di `switchYearAtomic` per attivare la risoluzione del conflitto.
   * Aggiunta di un `useEffect` controllato e puro (esterno al reducer) che monitora `state.fundData` e scrive in `sessionStorage` solo se l'utente ha modificato manualmente almeno un campo.
   * Esposizione dei metodi `restorePendingDraft`, `discardPendingDraft` e `savePendingDraftRemotely` (mock/stub isolato senza Supabase).
4. **[App.tsx](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/App.tsx):**
   * Inserimento del banner UI globale di notifica della bozza locale pendente in cima al layout principale.
5. **[HomePage.tsx](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/pages/HomePage.tsx):**
   * Modifica dell'auto-calcolo al mount affinché utilizzi `performLocalCalculation(skipPersistence = true)` eliminando qualsiasi chiamata automatica a Supabase all'avvio.
6. **[Step8RiepilogoPreview.tsx](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/features/wizard2026/steps/Step8RiepilogoPreview.tsx):**
   * dispatch dell'azione `UPDATE_LOCAL_SOURCES` al momento del trasferimento dei dati per marcare tutte le chiavi importate con sorgente `"wizard2026"`.

---

## 3. Elenco degli useEffect Messi in Sicurezza

I seguenti effetti collaterali legati ad auto-calcoli legati al mount/aggiornamento sono stati messi in sicurezza per impedire che sovrascrivano i valori inseriti manualmente dagli utenti o trasferiti dal wizard:

1. **Auto-calcolo dello 0,22% MS 2021 (in `FondoElevateQualificazioniPage.tsx`):**
   * Bloccata la sovrascrittura se il percorso completo `fondoElevateQualificazioniData.va_incremento022_ms2021_eq` è marcato come `"manual"` o `"wizard2026"`.
   * Anche il valore `0` viene preservato.
   * Aggiunto un avviso visivo in UI con pulsante di riallineamento manuale in caso di discrepanza con il valore teorico.
2. **Auto-calcolo della consistenza del personale dipendente (in `FondoAccessorioDipendentePage.tsx`):**
   * Bloccato l'auto-calcolo di `fondoAccessorioDipendenteData.st_art79c1c_incrementoStabileConsistenzaPers` se la sorgente è contrassegnata.
3. **Auto-calcolo del limite rilevante del Segretario (in `FondoSegretarioComunalePage.tsx`):**
   * Bloccato l'auto-calcolo del totale rilevante al limite del Segretario `fondoSegretarioComunaleData.fin_totaleRisorseRilevantiLimite` se la sorgente è contrassegnata.

---

## 4. Test Aggiunti

È stato creato il file di test Vitest **[localDraftPersistence.test.ts](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/__tests__/localDraftPersistence.test.ts)** che copre:
* L'isolamento e la distinzione delle chiavi di bozza per `userId`/`entityId`/`year`.
* Il comportamento sicuro senza crash in assenza di `sessionStorage`.
* Il corretto salvataggio e recupero client-side dei metadati della bozza e del dizionario `sources`.
* La corretta pulizia della bozza locale al trigger di rimozione.

---

## 5. Conferma di Rispetto dei Vincoli Operativi

Si certifica che durante lo svolgimento dell'attività di implementazione del MOD-031D:
* ❌ Non è stato effettuato alcun `git commit`, `git push`, `git pull`, `git merge` o `git rebase`.
* ❌ Non è stata applicata alcuna modifica o deploy al repository GitHub remoto o su Cloudflare Workers.
* ❌ Non sono state eseguite migrazioni strutturali o scritture reali sul database di produzione Supabase.
* ✅ Tutte le operazioni di verifica e build di produzione (`npx tsc`, `npx vitest run`, `npm run build`) sono state eseguite con successo e concluse senza errori in ambiente locale offline.
