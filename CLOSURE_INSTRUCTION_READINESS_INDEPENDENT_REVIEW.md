# CLOSURE_INSTRUCTION_READINESS — Independent Review
## FUNC-02 — Readiness Pre-Chiusura, Protezione DATA-02 e Post-Close Navigation Classification

**Review Date:** 2026-10-04\
**Reviewer:** Principal Software Architect, Transactional-Workflow Auditor & Regulated Administrative Systems Independent Reviewer\
**Slice Evaluated:** `CLOSURE_INSTRUCTION_READINESS`\
**Target Defect:** `FUNC-02` (Severity: HIGH) / Co-protezione `DATA-02` (VERIFIED_FIXED)\
**Repository:** `dinopusceddu/entilocaliapp`\
**Branch:** `ux/toolbox-area-fondo-prototype`\
**HEAD:** `d3170f959b5815c514dbf3d6e5f93366a5f14c67`\
**Result:** **PASS — CLOSURE_INSTRUCTION_READINESS_INDEPENDENT_REVIEW = COMPLETE**

---

## Executive verdict

L'audit indipendente di architettura, coerenza transazionale e state machine del workflow emette verdetto **PASS** per lo slice `CLOSURE_INSTRUCTION_READINESS`.

Lo slice colma la lacuna istruttoria di pre-chiusura dell'annualità senza intaccare in alcun modo l'atomicità o il contratto transazionale consolidato in `DATA-02`:
1. **Separazione tra readiness istruttoria ed esecuzione transazionale:** L'ammissibilità alla chiusura è ora governata dal resolver puro [`resolveClosureInstructionReadiness`](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/logic/closure/resolveClosureInstructionReadiness.ts). L'istruttoria deve essere conclusa e verificata (`status === 'READY'`) prima che qualsiasi chiamata transazionale o modifica di stato possa avere luogo.
2. **Preservazione integrale del contratto DATA-02:** [`yearClosureWorkflow.ts`](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/application/yearClosureWorkflow.ts), la persistenza repository, le RPC SQL di database, le migration e i meccanismi di rollback compensativo rimangono **rigorosamente byte-identici** rispetto al baseline. Nessun'operazione client intermedia, bypass di lock o scrittura asincrona è stata inserita.
3. **Fail-closed su risultati stantii o draft correnti invalidi:** La composizione di readiness in [`AppContext.tsx`](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/contexts/AppContext.tsx) esegue una doppia verifica: valida il risultato canonico memorizzato e, se apparentemente pronto, riesegue una validazione a freddo del draft corrente con il motore e il normalizer produttivi (`calculateFundCompletely`). Questa seconda verifica opera in modalità strettamente restrittiva (`FAIL_CLOSED`): non promuove mai uno stato non pronto e impedisce che modifiche successive al salvataggio (es. recuperi irrisolti o negativi) consentano la chiusura.
4. **Zero-write in stato NOT_READY:** In caso di fondo `UNDETERMINED`, `INVALID`, calcolo assente, criticità `BLOCKING` o `MISSING_PREREQUISITE`, qualsiasi invocazione (anche forzata direttamente a livello di context command o handler) produce $0$ chiamate al workflow, $0$ esecuzioni RPC, $0$ mutazioni di snapshot e $0$ alterazioni di AppState.
5. **Compatibilità piena con recovery e retry CLOSED:** Lo stato `ALREADY_CLOSED` è accuratamente separato da `NOT_READY`: il command boundary non blocca i percorsi di recovery di `DATA-02` (recupero di N+1 mancante dopo interruzione di rete o retry idempotente a transazione conclusa), garantendo continuità operativa.
6. **Classificazione del difetto preesistente di navigazione post-chiusura:** L'analisi del comportamento post-successo ha confermato la presenza di un bug di navigazione lato client non distruttivo (`POST_CLOSE_NAVIGATION_FINDING = CONFIRMED_NON_DESTRUCTIVE_WORKFLOW_BUG`), originato dal tentativo di `switchYearAtomic` di effettuare un flush/save sul snapshot appena chiuso. I dati su DB (annualità chiusa e anno N+1) risultano integri e corretti. Viene raccomandato lo slice separato `POST_CLOSE_N_PLUS_1_NAVIGATION`.
7. **Perimetro FUNC-02:** Come prescritto dalle regole dell'audit, `FUNC-02` permane allo stato **`HIGH / PARTIALLY_FIXED`**, poiché il perimetro di `DOCUMENT_KIND_READINESS` rimane distinto e non ancora implementato.

---

## Baseline

La verifica di integrità dell'ambiente di lavoro attesta la piena conformità ai requisiti in modalità **STRICT READ-ONLY**:
- **Branch:** `ux/toolbox-area-fondo-prototype`
- **HEAD:** `d3170f959b5815c514dbf3d6e5f93366a5f14c67`
- **Git Staged:** Nessun file staged (`git diff --cached` vuoto).
- **Working Tree:** Preservato integralmente, nessun file modificato o cancellato dall'audit.

---

## PRE/POST closure graph

### Grafo PRE-Slice (Esecuzione senza Verifica Istruttoria)
```text
EntityYearManagementPage (Gestione Enti e Anni)
       │
       ▼
Gesto Utente ──► window.confirm(...)
       │
       ▼
AppContext.closeCurrentYear()
       │
       ▼ (NESSUN GATE ISTRUTTORIO: fondo UNDETERMINED o BLOCKING veniva eseguito!)
closeYearAndPrepareNext(deps, user, entity, year, ...)
       │
       ▼
SupabaseStateRepository.closeYearAtomic(...) ──► RPC close_annual_snapshot_atomic
```

### Grafo POST-Slice (Workflow Istruttorio Protetto)
```text
EntityYearManagementPage
       │
       ▼
state.fundData + state.calculationResult + state.complianceChecks
       │
       ▼
AppContext.closureReadiness (useMemo puro)
  ├─ 1. Valuta risultato canonico memorizzato: resolveClosureInstructionReadiness(stored)
  │      └─► Se != 'READY' ──► Ritorna immediatamente stored (NOT_READY / ALREADY_CLOSED)
  ├─ 2. Se stored == 'READY':
  │      └─► Re-validazione a freddo: calculateFundCompletely(normalizeInput(fundData))
  │            ├─► Se genera eccezione ──► NOT_READY
  │            └─► resolveClosureInstructionReadiness(current) (può solo restringere)
  ▼
UI Rendering (EntityYearManagementPage):
  ├─ Se NOT_READY:
  │    ├─ Pulsante "Chiudi Esercizio" DISABILITATO
  │    ├─ Banner esplicito con primaryReason.message
  │    └─ Pulsante correttivo contestuale ("Vai alla Costituzione" o "Apri le verifiche")
  └─ Se READY:
       └─ Pulsante "Chiudi Esercizio" ABILITATO
               │
               ▼ [Gesto Utente su pulsante abilitato]
       handleCloseYear (Guard 1: if (closureReadiness.status !== 'READY') return)
               │
               ▼
       window.confirm(...)
               │
               ▼
       AppContext.closeCurrentYear (Guard 2: if (closureReadiness.status === 'NOT_READY') return error)
               │
               ▼ [SOLO SE ISTRUTTORIA CONFERMATA READY]
       closeYearAndPrepareNext (Workflow atomico esistente DATA-02)
               │
               ▼
       closeYearAtomic ──► RPC PostgreSQL atomica
```

### Censimento Entrypoint Produttivi
L'ispezione dell'intera codebase ha rilevato che:
- `closeYearAndPrepareNext` è invocato in produzione esclusivamente da `AppContext.tsx:1579` all'interno di `closeCurrentYear`.
- `closeCurrentYear` è invocato in produzione esclusivamente da `EntityYearManagementPage.tsx:173` all'interno di `handleCloseYear`.
- Entrambi i punti sono protetti in modo indipendente dal controllo di readiness.

**Classificazione:** `CLOSURE_ENTRYPOINT_INVENTORY = SINGLE_GUARDED`.

---

## DATA-02 protected contract

L'audit ha verificato il confronto crittografico e semantico per tutti i componenti della transazione atomica `DATA-02`:
- `src/application/yearClosureWorkflow.ts`: **Byte-identico** a HEAD.
- `src/infrastructure/persistence/SupabaseStateRepository.ts`: **Byte-identico** a HEAD.
- `supabase/migrations/`: **Byte-identico** a HEAD; nessuna migration creata né applicata.
- `src/application/helpers/yearClosureCarryForward.ts`: **Byte-identico** a HEAD.
- I test di regressione dedicati (`wave1ClosedSnapshot.test.ts` e `yearClosureWorkflow.test.ts`) continuano a superare tutte le verifiche di atomicità, rollback in caso di errore, lock transazionale e idempotenza.

**Classificazione:** `DATA02_TRANSACTION_CONTRACT = PRESERVED`.

---

## Readiness resolver purity

Il modulo [`src/logic/closure/resolveClosureInstructionReadiness.ts`](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/logic/closure/resolveClosureInstructionReadiness.ts) opera come funzione pura:
- **Input:**
  - `snapshotStatus?: AnnualSnapshotStatus`
  - `canonicalFund?: Pick<CanonicalFundResult, 'status' | 'total'> | null`
  - `issues?: readonly CabinaIssue[]`
- **Output:**
  - `status: 'READY' | 'NOT_READY' | 'ALREADY_CLOSED'`
  - `reasons: ClosureReadinessReason[]`
  - `primaryReason: ClosureReadinessReason | null`
- **Ispezione di Purezza:**
  - Nessun ricalcolo o formula economica autonoma.
  - Nessuna lettura di campi legacy (`fondi.dipendente.summary.totaleFondo`, totali non normalizzati).
  - Nessuna mutazione degli array in ingresso (verificato con `Object.freeze` e `structuredClone`).
  - Nessun dispatch, salvataggio o accesso a repository.
  - Nessun parsing fragile del testo dei messaggi; consuma solo gli enum tipizzati di severità e i target pre-normalizzati.

**Classificazione:** `READINESS_RESOLVER_PURITY = PURE`.

---

## Decision table

Il resolver implementa la seguente matrice decisionale verificata formalmente:

| Scenario / Condizione | Snapshot | Canonical | Checklist Issues | Esito Readiness | Azione / Target |
|---|---|---|---|---|---|
| Annualità già chiusa | `CLOSED` | qualsiasi | qualsiasi | `ALREADY_CLOSED` | Nessuna nuova azione |
| Fondo valido, nessun blocco | `OPEN` | `VALID`, total > 0 | Nessuna issue o solo WARNING | `READY` | Chiusura consentita |
| Fondo valido con totale zero | `OPEN` | `VALID`, total = 0 | Nessuna issue o solo WARNING | `READY` | Zero esplicito valido |
| Fondo non determinato | `OPEN` | `UNDETERMINED`, total null | qualsiasi | `NOT_READY` | Vai alla Costituzione (`fondoDipendenti` o target prerequisito) |
| Fondo invalido | `OPEN` | `INVALID`, total null | qualsiasi | `NOT_READY` | Vai alla Costituzione (`fondoDipendenti`) |
| Calcolo canonico assente | `OPEN` | `undefined` / `null` | qualsiasi | `NOT_READY` | Vai alla Costituzione (`fondoDipendenti`) |
| Bloccante di conformità | `OPEN` | `VALID`, total > 0 | Almeno una `BLOCKING` | `NOT_READY` | Apri le verifiche (`relatedPage` o `compliance`) |
| Solo avvisi | `OPEN` | `VALID`, total > 0 | Solo `WARNING` | `READY` | Avvisi non bloccanti |
| Prerequisito mancante | `OPEN` | `VALID` o `UNDETERMINED`| Almeno una `MISSING_PREREQUISITE` | `NOT_READY` | Vai alla Costituzione (target normalizzato) |

**Valutazioni:**
- `READY = VERIFIED`
- `VALID_ZERO = VERIFIED`
- `UNDETERMINED = VERIFIED`
- `INVALID = VERIFIED`
- `MISSING_CALCULATION = VERIFIED`
- `BLOCKING = VERIFIED`
- `WARNING_ONLY = VERIFIED`
- `MISSING_PREREQUISITE = VERIFIED`
- `ALREADY_CLOSED = VERIFIED`

---

## Stored vs current canonical

La composizione di readiness in `AppContext.tsx` previene il rischio di *stale authorization* (un risultato calcolato in precedenza e memorizzato in `state.calculationResult` che non riflette modifiche recenti al draft):
```typescript
if (stored.status !== 'READY') return stored;
```
Matrice di comportamento verificata:

| Risultato Memorizzato | Draft Corrente Ricalcolato | Esito Finale | Motivazione di Sicurezza |
|---|---|---|---|
| `VALID` | `VALID` | **`READY`** | Entrambi conformi |
| `VALID` | `UNDETERMINED` | **`NOT_READY`** | Nuova voce non determinata nel draft (es. arretrati senza MS) |
| `VALID` | `INVALID` | **`NOT_READY`** | Importo negativo inserito nel draft |
| `VALID` | Eccezione motore calcolo | **`NOT_READY`** | Catturata dal `try/catch`, degradata a `INVALID` |
| `UNDETERMINED` | `VALID` | **`NOT_READY`** | `stored` non pronto esce immediatamente; nessuna promozione |
| `INVALID` | `VALID` | **`NOT_READY`** | `stored` non pronto esce immediatamente; nessuna promozione |

Il gate opera secondo il principio di minimo privilegio e sicurezza contabile: la validazione a caldo può unicamente **restringere** l'accesso alla chiusura, mai promuovere uno stato incompleto.

**Classificazione:** `STALE_CANONICAL_GUARD = FAIL_CLOSED`.

---

## Current draft revalidation

Il ricalcolo di verifica eseguito in `AppContext.tsx`:
- Riutilizza esclusivamente le funzioni produttive [`normalizeInput`](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/application/input/inputNormalizer.ts) e [`calculateFundCompletely`](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/logic/calculation/fundEngine.ts).
- Non effettua dispatch di azioni Redux/Context.
- Non invoca `saveState` né altera `fundData` o `calculationResult` nello stato React.
- Non modifica lo snapshot su disco o database.
- Non genera né altera il payload dell'anno successivo N+1.
- In caso di eccezione del motore (es. parametri FTE inconsistenti), il blocco `catch` restituisce un oggetto canonico `INVALID`, determinando lo stato `NOT_READY` senza far crashare il rendering.

**Classificazione:** `CURRENT_DRAFT_REVALIDATION = PURE_READONLY_FAIL_CLOSED`.

---

## Legacy authority probe

È stata verificata l'indipendenza da qualunque residuo legacy:
- La presenza o manipolazione di campi legacy (`fondi.dipendente.summary.totaleFondo`, totali aggregati di sezione, parametri non normalizzati) non altera minimamente il giudizio di readiness se i campi canonici rimangono immutati.
- In assenza di risultato canonico, la presenza di importi legacy arbitrari (es. `99999`) produce inesorabilmente `NOT_READY`.

**Classificazione:** `LEGACY_CLOSURE_AUTHORITY = ABSENT`.

---

## Zero-write NOT_READY

Nei test di integrazione, per ciascuno scenario non pronto (`UNDETERMINED`, `INVALID`, `MISSING_CALCULATION`, `BLOCKING`, `MISSING_PREREQUISITE`, draft corrente invalido o eccezione motore):
- L'invocazione diretta di `context.closeCurrentYear()` ha restituito `{ success: false, error: ... }`.
- Chiamate a `closeYearAndPrepareNext`: **0**.
- Chiamate a `closeYearAtomic`: **0**.
- Chiamate di persistenza (`upsertState`, `createState`, `deleteState`, `updateEntity`): **0**.
- Letture al repository di stato: **0**.
- Lo snapshot locale e remoto permane invariato allo stato `OPEN`.
- Nessun record per l'anno N+1 viene generato nel DB o nelle mappe di test.

**Valutazioni:**
- `NOT_READY_ZERO_WRITE = PASS`
- `FORCED_NOT_READY_HANDLER_CALLS = 0`

---

## READY path

Nel caso in cui l'istruttoria sia pienamente `READY`:
1. Il pulsante `"Chiudi Esercizio"` è abilitato.
2. Al clic, viene mostrato il dialogo modale di conferma `window.confirm`.
3. In caso di conferma, viene invocato `closeCurrentYear()`.
4. Il workflow atomico esistente `closeYearAndPrepareNext` viene eseguito **esattamente 1 volta** (`READY_WORKFLOW_CALLS = 1`).
5. La chiamata `closeYearAtomic` viene eseguita **esattamente 1 volta** (`READY_ATOMIC_CALLS = 1`).
6. Non ha luogo alcuna scrittura client intermedia prima della transazione atomica.
7. Vengono preservati integralmente i calcoli e le regole di riporto FAD stabiliti in `DATA-02`.

---

## Distribution policy

L'audit ha accertato indipendentemente se la distribuzione delle risorse o il completamento del riparto costituiscano un prerequisito normativo vincolante per la chiusura dell'esercizio:
- **Analisi del Contratto Storico:** Il workflow `yearClosureWorkflow.ts` non richiede che `distribuzioneRisorseData` sia popolata, né consulta `resolveDistributionStatus`. Se la distribuzione è vuota, le somme variabili ed economie non utilizzate vengono semplicemente conteggiate a zero e il riporto FAD è pari a $0,00\ \text{€}$.
- **Comportamento Verificato:** Un fondo con Costituzione `VALID`, checklist priva di blocker e Distribuzione non iniziata risulta legittimamente `READY` per la chiusura.
- Nessuna regola artificiale è stata introdotta per forzare l'avvio della Distribuzione prima della chiusura.

**Classificazione:** `DISTRIBUTION_CLOSURE_POLICY = NOT_REQUIRED_CONFIRMED`.

---

## Warning / missing prerequisite

- **Gestione `WARNING`:** Una issue con severità `'WARNING'` viene esplicitamente ignorata dal ciclo di accumulo motivi in `resolveClosureInstructionReadiness` (`if (issue.severity === 'WARNING') continue;`). La presenza di soli avvisi consente la chiusura regolare dell'anno, preservando la flessibilità per l'amministrazione.
- **Gestione `MISSING_PREREQUISITE`:** Viene nettamente distinta da una violazione di conformità `'BLOCKING'`:
  - `BLOCKING` impone label `"Apri le verifiche"` e rotta verso `'compliance'` o la specifica `relatedPage`.
  - `MISSING_PREREQUISITE` impone label `"Vai alla Costituzione"` e rotta verso `'fondoDipendenti'` o il target specificato della raccolta.

---

## CLOSED recovery compatibility

Un punto critico di coerenza architetturale risiede nella compatibilità con i percorsi di recovery di `DATA-02`:
- Quando l'annualità sul server è già `CLOSED`, il resolver restituisce `status: 'ALREADY_CLOSED'`.
- La guardia di `AppContext.tsx` verifica esclusivamente `if (closureReadiness.status === 'NOT_READY') return ...;`, permettendo ad `ALREADY_CLOSED` di transitare verso il workflow.
- **Caso A (Chiusura completata con N+1 presente):** Il workflow rileva la chiusura pregressa e l'esistenza dell'anno successivo e conclude con successo senza eseguire una nuova transazione RPC (`zero nuova RPC`).
- **Caso B (Recupero storico con N+1 mancante):** In caso di chiusura parziale o interruzione remota pregressa, il workflow esegue la transazione atomica di completamento di N+1.
- Se il nuovo gate avesse bloccato genericamente tutto ciò che non è `READY`, il recovery storico di `DATA-02` sarebbe risultato spezzato. L'implementazione ha preservato questa compatibilità al 100%.

**Classificazione:** `DATA02_RECOVERY_COMPATIBILITY = PASS`.

---

## RPC failure / retry / double submit

- **Fallimento RPC:** In caso di errore durante l'invocazione di `closeYearAtomic` (es. simulazione di rollback DB), l'annualità corrente rimane `OPEN`, nessun dato N+1 viene confermato, e lo stato non viene corrotto. Un retry successivo riesegue la stessa transazione atomica con esito positivo (`RPC_FAILURE_RETRY = PASS`).
- **Doppio clic ravvicinato / chiamate sequenziali:** Due invocazioni consecutive sullo stesso handler eseguono il workflow due volte, ma l'idempotenza garantita dal server e dal workflow fa sì che la RPC atomica venga eseguita una sola volta (`DOUBLE_SUBMIT_SEMANTICS = IDEMPOTENT`).

---

## Post-close navigation classification

Durante l'integrazione end-to-end è stato esaminato a fondo il comportamento post-chiusura:
1. **Localizzazione del Meccanismo:** In [`EntityYearManagementPage.tsx:177`](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/pages/EntityYearManagementPage.tsx#L177), dopo il successo di `closeCurrentYear()`, il codice esegue `await switchYearAtomic(result.nextYear)`.
2. **Origine dell'Anomalia:** In [`AppContext.tsx:1207-1223`](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/contexts/AppContext.tsx#L1207-L1223), la funzione `switchYearAtomic` verifica se `canSaveCurrent` è vero e tenta di persistere lo stato dell'annualità corrente prima di passare a `nextYear`. Poiché l'annualità corrente è appena stata congelata (`CLOSED`) sul database dalla transazione atomica, i meccanismi di immutabilità (RLS/trigger di `DATA-02`) rifiutano legittimamente il salvataggio. Questo provoca il fallimento di `switchYearAtomic` con l'impostazione di `yearSwitchError`.
3. **Impatto sui Dati:** **Nessun danno o corruzione ai dati**.
   - L'annualità corrente è regolarmente `CLOSED` sul database.
   - L'annualità successiva N+1 è regolarmente creata con il corretto riporto FAD.
   - L'unico effetto è che la navigazione automatica all'anno N+1 non viene completata in UI, lasciando l'utente sulla visualizzazione dell'anno chiuso (da cui può comunque selezionare manualmente l'anno N+1 dal selettore).
4. **Classificazione Formale:**
   - `POST_CLOSE_NAVIGATION_FINDING = CONFIRMED_NON_DESTRUCTIVE_WORKFLOW_BUG`
   - `POST_CLOSE_NAVIGATION_DATA_INTEGRITY = PRESERVED_INTACT`
   - `POST_CLOSE_NAVIGATION_RECOMMENDED_SLICE = POST_CLOSE_N_PLUS_1_NAVIGATION`
   - `POST_CLOSE_NAVIGATION_PRIORITY = WORKFLOW_POLISH_AFTER_READINESS` (da affrontare dopo `DOCUMENT_KIND_READINESS` o come rifinitura pre-release, non essendo bloccante per l'integrità dei dati).

---

## Test harness review

L'infrastruttura di test comprende:
- **`closureInstructionReadiness.test.ts` (17 test):** Test unitari completi del resolver con input congelati (`Object.freeze`), verifiche su tutti gli stati della decision table, fallback deterministici, assenza di autorità legacy e isolamento delle istanze di action.
- **`closureInstructionReadiness.integration.test.tsx` (21 test):** Test di integrazione ad alta fedeltà con `AppProvider` reale, reducer reale, motore di calcolo reale (`calculateFundCompletely`), normalizer reale (`normalizeInput`), mockando esclusivamente i confini esterni (database Supabase e dialoghi browser). Copre scenari di invalidazione a caldo del draft, eccezioni motore, fail-closed, zero-write, transazione atomica, fallimento RPC con retry, idempotenza sequenziale, recovery programmatico e interazione UI completa.
- **Suite di regressione storiche collegate:** `yearClosureWorkflow.test.ts` (5 test) e `wave1ClosedSnapshot.test.ts` (10 test) superate integralmente.

**Classificazione:** `TEST_HARNESS_REVIEW = PASS_HIGH_CONFIDENCE`.

---

## Closed-slice regressions

È stata rieseguita la verifica dei contratti consolidati negli slice precedenti:
- **`DATA-02`:** Nessuna regressione (`DATA_02_REGRESSION = NONE`).
- **`CALC-02`:** Budget canonico e verifiche cross-consumer intatte (`CALC_02_REGRESSION = NONE`).
- **`NORM-01`:** Art. 60 e proiezioni normative intatte (`NORM_01_REGRESSION = NONE`).
- **`CABINA_BLOCKING`:** Precedenza blocker e CTA intatte (`CABINA_BLOCKING_REGRESSION = NONE`).
- **`DISTRIBUTION_EXPLICIT_DRAFT`:** Proposta pura ed esplicita intatta (`DISTRIBUTION_EXPLICIT_DRAFT_REGRESSION = NONE`).
- **Bloccanti ASTRA Aperti:** `ASTRA_BLOCKERS_OPEN = 0`.
- **TypeScript (`npx tsc --noEmit`):** PASS (0 errori).
- **Consolidated Regression Suite (8/8):** PASS.
- **Wave2 Oracle Suite (14/14):** PASS.
- **`git diff --check`:** PASS (0 errori di formattazione o whitespace).

---

## Scope integrity

L'inventario dei file conferma il rispetto millimetrico dei confini assegnati allo slice:
- **File di logica pura aggiunti:** [`src/logic/closure/resolveClosureInstructionReadiness.ts`](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/logic/closure/resolveClosureInstructionReadiness.ts).
- **File di contesto/UI modificati:** [`src/contexts/AppContext.tsx`](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/contexts/AppContext.tsx) e [`src/pages/EntityYearManagementPage.tsx`](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/pages/EntityYearManagementPage.tsx).
- **File di test aggiunti:** [`src/logic/closure/__tests__/closureInstructionReadiness.test.ts`](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/logic/closure/__tests__/closureInstructionReadiness.test.ts) e [`src/contexts/__tests__/closureInstructionReadiness.integration.test.tsx`](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/contexts/__tests__/closureInstructionReadiness.integration.test.tsx).
- **Report di implementazione:** [`CLOSURE_INSTRUCTION_READINESS_IMPLEMENTATION_REPORT.md`](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/CLOSURE_INSTRUCTION_READINESS_IMPLEMENTATION_REPORT.md).

Tutti gli altri 1113 file del repository sono rimasti byte-identici. Nessun file cancellato, nessun database toccato, nessun ambiente esterno contattato.

**Classificazione:** `SCOPE_INTEGRITY = PASS`.

---

## Residual FUNC-02

In conformità al mandato ASTRA:
- Lo slice `CLOSURE_INSTRUCTION_READINESS` risolve esaustivamente il gate di ammissibilità dell'istruttoria prima della chiusura annuale.
- **Ambito residuo di FUNC-02:**
  - `DOCUMENT_KIND_READINESS` (intersezione con `DOC-02`): subordinazione della generazione ed esportazione di prospetti e determine definitive all'effettiva completezza documentale e contabile;
  - Il bug non distruttivo di navigazione post-chiusura `POST_CLOSE_N_PLUS_1_NAVIGATION`.

Pertanto, `FUNC-02` rimane correttamente classificato come **`HIGH / PARTIALLY_FIXED`** e non deve essere promosso a `VERIFIED_FIXED`.
Tutte le severità originali rimangono confermate a `HIGH`: `FUNC-02 = HIGH`, `DOC-02 = HIGH`, `NORM-02 = HIGH`, `ARCH-01 = HIGH`.

---

## Next gate recommendation

Con il completamento con esito **PASS** della presente review indipendente:
1. `CLOSURE_INSTRUCTION_READINESS_STATUS = CLOSED_LOCALLY`.
2. Prossimo slice raccomandato:
   - **`DOCUMENT_KIND_READINESS`** (perimetro `DOC-02` / `FUNC-02`).
   - Successivamente (o in rifinitura pre-release): **`POST_CLOSE_N_PLUS_1_NAVIGATION`**.
3. Mantenere rigorosamente offline le procedure di verifica e il divieto di contatto verso gli ambienti remoti di staging e produzione.
