# POST_CLOSE_N_PLUS_1_NAVIGATION — Independent Review
## FUNC-02 Final Closure Candidate — Post-close navigation without CLOSED-year writes

**Data Review:** 2026-10-04\
**Auditor / Reviewer:** Principal Software Architect, Transactional Workflow Auditor & Independent Reviewer\
**Repository:** `dinopusceddu/entilocaliapp`\
**Branch:** `ux/toolbox-area-fondo-prototype`\
**HEAD:** `d3170f959b5815c514dbf3d6e5f93366a5f14c67`\
**Verdetto Finale:** **PASS — POST_CLOSE_N_PLUS_1_NAVIGATION_INDEPENDENT_REVIEW = COMPLETE**

---

## 1. Executive Verdict

L'audit indipendente di architettura software, workflow transazionale, persistenza di stato e ciclo di vita annuale emette verdetto **PASS** per lo slice `POST_CLOSE_N_PLUS_1_NAVIGATION`.

### Sintesi delle Valutazioni
1. **`POST_CLOSE_N_PLUS_1_NAVIGATION`:** **`CLOSED_LOCALLY`**.\
   Il bug noto (precedentemente classificato come `CONFIRMED_NON_DESTRUCTIVE_WORKFLOW_BUG`) è stato eliminato alla radice senza compromettere l'immutabilità dello snapshot appena chiuso e senza esporre scorciatoie generiche per saltare i salvataggi ordinari.
2. **`FUNC-02` (Workflow State Integrity):** **`VERIFIED_FIXED`** (Severità originale: `HIGH`).\
   Tutte le 5 dimensioni che componevano il finding `FUNC-02` risultano ora integralmente risolte, verificate e coperte da review indipendente:
   - Cabina Blocking Issue Priority (`CABINA_BLOCKING_ISSUE_PRIORITY` = PASS);
   - Ripartizione esplicita e distinzione personale missing (`DISTRIBUTION_EXPLICIT_DRAFT` = PASS);
   - Readiness istruttoria pre-chiusura (`CLOSURE_INSTRUCTION_READINESS` = PASS);
   - Readiness documentale per tipo atto (`DOCUMENT_KIND_READINESS` = PASS);
   - Transizione e navigazione post-chiusura atomica (`POST_CLOSE_N_PLUS_1_NAVIGATION` = PASS).\
   Nessun residuo funzionale o architetturale rimane aperto nell'alveo di `FUNC-02`.
3. **Contratto Transazionale `DATA-02`:** **`PRESERVED`**.\
   I moduli `yearClosureWorkflow.ts` e `SupabaseStateRepository.ts` rimangono byte-identici. Nessuna RPC, migration o funzione di carry-forward è stata modificata.
4. **Blocker ASTRA Consolidati:**\
   `SEC-01 = VERIFIED_FIXED`, `DATA-02 = VERIFIED_FIXED`, `CALC-02 = VERIFIED_FIXED`, `DOC-02 = VERIFIED_FIXED`, `NORM-01 = VERIFIED_FIXED`, `FUNC-01 = VERIFIED_FIXED`.\
   `ASTRA_BLOCKERS_OPEN = 0`.

---

## 2. Baseline

I controlli di coerenza della baseline confermano l'integrità del repository:
- `git branch --show-current`: `ux/toolbox-area-fondo-prototype`
- `git rev-parse HEAD`: `d3170f959b5815c514dbf3d6e5f93366a5f14c67`
- `git diff --cached --name-status`: *vuoto*
- Working tree preservato;
- Isolamento di rete: 0 tentativi verso Staging (`mcasgpaivyosaroxrodm`) o Produzione (`yggokplxleredipknfbq`).

---

## 3. PRE Bug Reconstruction

La ricostruzione indipendente del bug originario conferma in modo inequivocabile la dinamica osservata:
1. L'utente avviava la chiusura dell'annualità $N$ (`OPEN`);
2. La funzione `closeCurrentYear()` eseguiva con successo la transazione atomica RPC:
   - Lo snapshot dell'anno $N$ veniva congelato con stato `CLOSED` nel database;
   - Lo snapshot dell'anno $N+1$ veniva creato con stato `OPEN`;
3. La promise restituiva `{ success: true, closedYear: N, nextYear: N+1 }`;
4. Nel componente `EntityYearManagementPage.tsx`, il callback di completamento invocava la normale funzione `switchYearAtomic(result.nextYear)`;
5. Essendo stata catturata nel contesto del render in cui l'anno corrente era ancora l'anno $N$ `OPEN`:
   - `switchYearAtomic` invocava `await flush()`;
   - La guardia `canSaveCurrent` verificava `state.hydratedSnapshotKey === hydratedPreviousKey` (condizione vera nel vecchio render);
   - Il workflow procedeva al salvataggio preventivo dell'anno $N$ (`saveAnnualSnapshot(N)`);
6. Il database (tramite trigger Supabase RLS / check constraint) respingeva la scrittura con errore `SNAPSHOT_CLOSED: Annualita chiusa non modificabile`;
7. La transazione di cambio anno abortiva, `lastYearSwitchError` veniva valorizzato e la UI rimaneva bloccata sull'anno $N$, pur essendo l'anno $N+1$ effettivamente creato e l'anno $N$ correttamente chiuso.

**Esito:** Nessuna corruzione dei dati a livello di database; il problema era confinato alla sequenza di navigazione client post-transazione.\
Classificazione: **`PRE_BUG_RECONSTRUCTION = CONFIRMED`**.

---

## 4. POST Navigation Graph

Il nuovo grafo di esecuzione post-chiusura:

```text
EntityYearManagementPage.handleCloseYear
      │
      ├─► [Guard] closureReadiness.status === 'READY'
      │
      ├─► AppContext.closeCurrentYear()
      │     └─► yearClosureWorkflow.closeYearAndPrepareNext()
      │           └─► stateRepository.closeYearAtomic() (RPC Atomica)
      │
      ├─► [Transazione OK] { success: true, closedYear: N, nextYear: N+1 }
      │     ├─► closedSnapshotKeysRef.current.add("userId:entityId:N") (Sincrono)
      │     ├─► completedClosureRef.current = { userId, entity, closedYear: N, nextYear: N+1 }
      │     └─► dispatch({ type: 'LOAD_STATE_FROM_DB', payload: { fundData: CLOSED } })
      │
      ├─► EntityYearManagementPage
      │     ├─► setClosedNavigation({ entityId, closedYear: N, nextYear: N+1 })
      │     └─► switchYearAfterClosure() (Invoca switchYear con autorizzazione post-close)
      │
      └─► switchYear(nextYear, entity, undefined, completedClosure)
            ├─► Valida corrispondenza contesto ed epoch con completedClosure
            ├─► Identifica wasClosed === true (da closedSnapshotKeysRef)
            ├─► Salta categoricamente flush() e saveAnnualSnapshot(N) (ZERO WRITES SU N)
            ├─► Carica fresh snapshot N+1 dal repository (loadAnnualSnapshot(N+1))
            ├─► Idrata reducer con stato N+1
            └─► currentYear diventa N+1, chiusura banner closedNavigation.
```

---

## 5. Normal Switch Contract

Il normale cambio annualità tra anni aperti (`OPEN A` → `B`):
- Non utilizza la funzione `switchYearAfterClosure()`;
- Esegue `switchYearAtomic(B)` dove `completedClosure` è `undefined`;
- Non trova la chiave `userId:entityId:A` in `closedSnapshotKeysRef` (essendo l'anno `OPEN`);
- Esegue regolarmente `await flush()`;
- Valuta `canSaveCurrent = true` e persiste le modifiche pendenti dell'anno $A$ tramite `saveAnnualSnapshot(A)` **prima** di caricare l'anno $B$;
- Il test `N1` conferma che modifiche manuali sull'anno corrente $A$ vengono salvate sul database con ordine di chiamata rigorosamente antecedente alla `getState(B)`.

Classificazione: **`NORMAL_OPEN_SWITCH_CONTRACT = PRESERVED`**.

---

## 6. Post-Close Authorization

L'autorizzazione speciale utilizzata da `switchYearAfterClosure()`:
- Viene creata esclusivamente all'interno di `closeCurrentYear()` in corrispondenza del ramo `if (result.success)`;
- Memorizza: `userId`, `entity`, `closedYear`, `nextYear`;
- Viene verificata da `switchYear`:
  ```ts
  if (completedClosure) {
    const current = calculationFreshnessAuthorityRef.current;
    if (completedClosure !== completedClosureRef.current
      || completedClosure.userId !== user.id
      || current.entityId !== completedClosure.entity.id
      || current.year !== completedClosure.closedYear
      || targetYear !== completedClosure.nextYear) return false;
  }
  ```
- Non può essere invocata prima di una chiusura, non può essere riutilizzata da un altro ente o da un altro anno, e scade non appena l'anno attivo transita a $N+1$.

Classificazione: **`POST_CLOSE_INTENT_SECURITY = BOUND_TO_SUCCESS_AND_CONTEXT`**.

---

## 7. Stale Callback Red-Team

I test `N3`, `N9`, `N12` e `N14` hanno simulato l'invocazione di callback obsoleti catturati dal render `OPEN` prima della chiusura:
1. **`saveState` obsoleto:** invoca `closedSnapshotKeysRef.current.has(...)`. Riscontrando che l'annualità è registrata come congelata, rigetta immediatamente con `{ success: false, reason: 'SNAPSHOT_CLOSED' }` senza emettere chiamate di rete;
2. **`switchYearAtomic` ordinario obsoleto:** consulta `closedSnapshotKeysRef` e rileva che l'anno precedente era chiuso (`wasClosed === true`), inibendo sia il `flush` che il salvataggio preventivo dell'anno $N$;
3. **`switchYearAfterClosure` invocato a vuoto:** in assenza di `completedClosureRef`, fallisce immediatamente restituendo `false` con 0 chiamate di lettura/scrittura.

Classificazione:\
`STALE_CALLBACK_SAVE = DENIED_ZERO_WRITES`\
`STALE_CALLBACK_NORMAL_SWITCH = PROTECTED_ZERO_WRITES_TO_N`.

---

## 8. Zero Writes Proof

Dopo il completamento della transazione atomica RPC `closeYearAtomic`:
- `upsertState(N)`: **0 chiamate**;
- `createState(N)`: **0 chiamate**;
- `deleteState(N)`: **0 chiamate**;
- `saveAnnualSnapshot(N)`: **0 chiamate**;
- `entityRepository.update`: non chiamato per l'anno chiuso;
- Autosave differito: 0 scritture su $N$.

Esito: **`POST_CLOSE_WRITES_TO_CLOSED_YEAR = 0`**.

---

## 9. Autosave Race

Il test `N9` simula l'aggiornamento dei dati dell'anno $N$ con avvio del timer di debounce dell'autosave (2 secondi) seguito dall'esecuzione della chiusura:
- La registrazione sincrona in `closedSnapshotKeysRef` impedisce a qualsiasi timer di debounce residuo o evento `beforeunload` di scaricare dati su Supabase;
- Il test attende 2.100 ms dopo la chiusura ed emette l'evento `beforeunload`: nessuna chiamata `upsert` o `create` per l'anno $N$ viene recapitata al mock del database.

Classificazione: **`AUTOSAVE_POST_CLOSE_GUARD = PASS`**.

---

## 10. N+1 Hydration

All'esito della navigazione post-chiusura (caso 2026 → 2027):
- `currentYear` = `2027`;
- `hydratedSnapshotKey` = `closure-entity:2027`;
- `fundData.annualData.annoRiferimento` = `2027`;
- `fundData.metadata.snapshotStatus` = `OPEN`;
- Dati di distribuzione e allocazioni provengono fedelmente dalla lettura dell'anno 2027 nel repository, senza contaminazioni dal vecchio draft 2026;
- `calculationResult` e `complianceChecks` vengono ricalcolati in modo pulito sui dati del 2027.

Classificazione: **`POST_CLOSE_TARGET_HYDRATION = CONSISTENT`**.

---

## 11. Closure Failure

Nel test `N4`, la chiamata atomica RPC restituisce errore (`Atomic failure`):
- `result.success` è `false`;
- L'anno $N$ rimane `OPEN`;
- L'anno $N+1$ non viene creato;
- Nessuna autorizzazione post-close viene generata;
- Nessun cambio anno viene tentato;
- L'utente riceve l'alert di errore e può ritentare la normale chiusura una volta rimossa la causa.

Classificazione: **`CLOSURE_FAILURE_PATH = PRESERVED`**.

---

## 12. Navigation Failure After Success

I test `N5` e `N6` simulano il caso in cui la chiusura atomica RPC ha successo nel database, ma la successiva lettura di rete di $N+1$ (`getState(N+1)`) fallisce (errore 500 o eccezione di rete):
1. **Nessun Rollback Distruttivo:** L'anno $N$ rimane regolarmente chiuso (`CLOSED`) e l'anno $N+1$ rimane esistente e preparato nel database;
2. **Messaggio Chiaro e Distinto:** L'errore non viene mascherato come fallimento della chiusura. Nella pagina compare il banner dedicato:\
   *“L'esercizio 2026 è chiuso e l'anno 2027 è stato preparato. Il passaggio all'anno successivo non è stato completato. Puoi riprovare senza ripetere la chiusura.”*;
3. **Pulsante di Azione Mirata:** Viene offerto il pulsante *“Apri l'anno 2027”*, che esegue esclusivamente il tentativo di navigazione senza riavviare la chiusura atomica.

Classificazione: **`POST_COMMIT_NAVIGATION_ERROR_SEMANTICS = DISTINCT`**.

---

## 13. Retry

- Il click su *“Apri l'anno 2027”* invoca nuovamente `switchYearAfterClosure()`;
- Poiché `completedClosureRef` è ancora valido per il contesto corrente, il caricamento di $N+1$ viene rieseguito;
- Non viene invocata alcuna nuova RPC di chiusura (`closeYearAtomic` non chiamata);
- L'annualità attiva transita con successo a 2027 e il banner scompare.

Classificazione: **`NAVIGATION_RETRY = INDEPENDENT_WITHOUT_RE_CLOSE`**.

---

## 14. Recovery / Already Closed

- **Caso `ALREADY_CLOSED` con $N+1$ presente (Test N7):** Il workflow idempotente originale riconosce che l'anno è già chiuso e l'anno successivo esiste già. Non emette alcuna RPC di chiusura, aggiorna lo stato e naviga a $N+1$;
- **Caso `CLOSED` con $N+1$ mancante (Test N8):** Il workflow di recovery storico richiama `closeYearAtomic` unicamente per preparare l'annualità mancante, completando poi la transizione a $N+1$;
- **Chiusure Sequenziali Rapide (Test N10):** Due click rapidi sul pulsante di chiusura producono un'unica transazione atomica effettiva e un'unica annualità $N+1$.

Classificazione:\
`ALREADY_CLOSED_N_PLUS_1_PRESENT = IDEMPOTENT_NAVIGATED`\
`ALREADY_CLOSED_N_PLUS_1_MISSING = RECOVERED_AND_NAVIGATED`\
`DOUBLE_CLOSE = SINGLE_ATOMIC_TRANSACTION`.

---

## 15. Manual Switch After Close

Nel test `N12`, in caso di mancata navigazione automatica:
- L'utente seleziona manualmente l'anno $N+1$ dalla lista degli anni disponibili;
- Il componente si trova già nel render con $N$ `CLOSED`;
- L'attivazione ordinaria dell'anno $N+1$ non tenta alcun salvataggio su $N$ e idrata correttamente il target.

Classificazione: **`MANUAL_SWITCH_AFTER_CLOSE = SAFE_ZERO_OLD_WRITES`**.

---

## 16. Local CLOSED Guard

L'insieme interno `closedSnapshotKeysRef`:
- Registra chiavi strutturate con granularità completa: `userId:entityId:year`;
- Non causa collisioni tra utenti o enti differenti;
- Funge da guardia difensiva lato client per disarmare immediatamente callback asincroni pendenti;
- Non si sostituisce all'autorità del database.

Classificazione: **`LOCAL_CLOSED_GUARD = DEFENSIVE_ONLY`**.

---

## 17. Server Authority

L'immutabilità dello snapshot annuale e la protezione contro modifiche post-chiusura rimangono ancorate ai vincoli e ai trigger del database Supabase (`saveAppStateWorkflow returns SNAPSHOT_CLOSED`). La guardia locale serve unicamente ad evitare chiamate di rete condannate a fallire.

Classificazione: **`SERVER_CLOSED_AUTHORITY = PRESERVED`**.

---

## 18. Test Change Review

La modifica apportata al test preesistente `closureInstructionReadiness.integration.test.tsx` (righe 269–283) è stata esaminata:
- Il test originario asseriva `expect(context.state.currentYear).toBe(2025)` a causa dell'interruzione anticipata causata dal bug;
- Con la correzione del bug, la navigazione a $N+1$ va a buon fine, quindi l'asserzione è stata aggiornata a `expect(context.state.currentYear).toBe(2026)`;
- Le asserzioni sull'esecuzione atomica singola, sull'immutabilità dell'anno 2025 e sull'assenza di scritture abusive sull'anno 2025 sono rimaste integralmente attive e verificate.

Classificazione: **`EXISTING_TEST_CHANGE = LEGITIMATE_BEHAVIOR_UPDATE`**.

---

## 19. Test Harness Review

Il nuovo file di test `postCloseNavigation.integration.test.tsx` (16 test) e il test di readiness aggiornato (21 test):
- Istanziano il vero `AppProvider`, il vero `appReducer`, il motore economico completo e il workflow transazionale reale;
- Isolano unicamente il confine di persistenza tramite mock delle classi `SupabaseStateRepository` e `SupabaseEntityRepository`;
- Coprono l'intera casistica (successo, fallimento RPC, fallimento lettura post-commit, retry, autosave race, stale callbacks, chiusure doppie, cancellazione conferma);
- Nessun mock tautologico.

Classificazione: **`TEST_HARNESS_REVIEW = PASS_HIGH_CONFIDENCE`**.

---

## 20. DATA-02 Preservation

I file centrali della transazione atomica mantengono hash SHA-256 byte-identici:
- `yearClosureWorkflow.ts`: `71C052F4CC3C95D97EC81BAC5E9E6C011F1C0AB0753BCD7057B8E40A84CCC91B`;
- `SupabaseStateRepository.ts`: `A817EE36AC8144956CB05AEEB796923A32762A3102AFDAECC6DF7073B483C88F`.

Nessuna alterazione a RPC, rollback o algoritmo di carry-forward.\
Classificazione: **`DATA02_TRANSACTION_CONTRACT = PRESERVED`**.

---

## 21. Closed-Slice Regressions

L'esecuzione delle suite di test relative a tutti i moduli consolidati ha confermato:
- `postCloseNavigation.integration.test.tsx`: 16/16 PASS;
- `closureInstructionReadiness.integration.test.tsx`: 21/21 PASS;
- `closureInstructionReadiness.test.ts`: 17/17 PASS;
- `wave1ClosedSnapshot.test.ts`: 10/10 PASS;
- `DistribuzioneRisorsePage.closed.test.tsx`: 1/1 PASS;
- `ReportsPage.closed.test.tsx`: 2/2 PASS;
- `documentKindReadiness.test.ts`: 73/73 PASS;
- `tsc --noEmit`: 0 errori;
- `git diff --check`: pulito, zero warning;
- Regressioni: **NONE** su `SEC-01`, `DATA-02`, `CALC-02`, `DOC-02`, `NORM-01`, `FUNC-01`.

---

## 22. FUNC-02 Original Acceptance Reassessment

È stata riletta attentamente la formulazione iniziale del finding `FUNC-02` e delle sue acceptance criteria:
1. **Cabina di Regia:** I controlli bloccanti devono avere la precedenza, impedire la progressione indebita e guidare l'utente all'azione correttiva. → **Risolto** (`CABINA_BLOCKING_ISSUE_PRIORITY`).
2. **Distribuzione Risorse:** Nessuna mutazione automatica o ripartizione implicita; la proposta deve restare separata dall'allocazione e richiedere un click esplicito dell'utente; distinzione rigorosa tra personale assente e noto a zero. → **Risolto** (`DISTRIBUTION_EXPLICIT_DRAFT`).
3. **Istruttoria di Chiusura:** Blocco assoluto della chiusura annuale in presenza di fondo non determinato o controlli bloccanti aperti. → **Risolto** (`CLOSURE_INSTRUCTION_READINESS`).
4. **Export Documentali:** Esclusione degli atti definitivi in presenza di blocker, pur garantendo l'accesso alla bozza tecnica. → **Risolto** (`DOCUMENT_KIND_READINESS`).
5. **Navigazione Post-Chiusura:** Transizione trasparente all'annualità successiva senza tentativi di riscrittura dell'anno chiuso. → **Risolto** (`POST_CLOSE_N_PLUS_1_NAVIGATION`).

Non vi sono ulteriori componenti, requisiti o scenari pendenti riferibili a `FUNC-02`.\
Classificazione: **`FUNC_02_FINAL_STATUS = VERIFIED_FIXED`**; **`FUNC_02_RESIDUALS = NONE`**.

---

## 23. Scope Integrity

Il perimetro delle modifiche implementate è rigorosamente circoscritto:
- Produttivi modificati: `src/contexts/AppContext.tsx`, `src/pages/EntityYearManagementPage.tsx`;
- Test modificati/aggiunti: `postCloseNavigation.integration.test.tsx` (nuovo), `closureInstructionReadiness.integration.test.tsx` (adattato);
- Report: `POST_CLOSE_N_PLUS_1_NAVIGATION_IMPLEMENTATION_REPORT.md` e la presente review.

Nessun altro file o modulo applicativo è stato toccato.\
Classificazione: **`SCOPE_INTEGRITY = PRESERVED_2_PROD_1_TEST_1_UPDATED`**.

---

## 24. Next Gate Recommendation

Con la chiusura certificata di `FUNC-02`, tutti i principali blocker funzionali, contabili, documentali e transazionali dell'iniziativa ASTRA risultano risolti e verificati (`ASTRA_BLOCKERS_OPEN = 0`).

Si raccomanda di procedere con:\
**`ASTRA_25_FINDINGS_CURRENT_STATE_RECONCILIATION`**\
per formalizzare il quadro consolidato dei 25 finding di sicurezza, architettura, normativa e UX.
