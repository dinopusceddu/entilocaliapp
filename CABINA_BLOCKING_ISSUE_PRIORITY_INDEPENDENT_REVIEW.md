# CABINA_BLOCKING_ISSUE_PRIORITY — Independent Workflow Review
## FUNC-02 — Blocking Precedence, CTA Integrity & No-Regression Audit

**Review Date:** 2026-10-04\
**Reviewer:** Principal Software Architect, Workflow/State-Machine Auditor & Independent Reviewer\
**Slice Evaluated:** `CABINA_BLOCKING_ISSUE_PRIORITY_INDEPENDENT_REVIEW`\
**Repository:** `dinopusceddu/entilocaliapp`\
**Branch:** `ux/toolbox-area-fondo-prototype`\
**HEAD:** `d3170f959b5815c514dbf3d6e5f93366a5f14c67`\
**Result:** **PASS — CABINA_BLOCKING_ISSUE_PRIORITY_INDEPENDENT_REVIEW = COMPLETE**

---

## 1. Executive Verdict

L'audit indipendente di architettura, state-machine del workflow e integrità funzionale emette verdetto **PASS** per lo slice `CABINA_BLOCKING_ISSUE_PRIORITY`.

Lo slice risolve con precisione chirurgica l'anomalia di precedenza nella Cabina di Regia:
- **Comportamento Previsto Corretto:** Quando il fondo canonico è numericamente `VALID`, ma è presente almeno una criticità di checklist classificata come `BLOCKING`, lo stato operativo viene forzato a `BLOCKED`.
- **Integrità della CTA:** La Call To Action primaria viene indirizzata alla verifica della criticità (`"Apri le verifiche"` con rotta mirata alla `relatedPage` specifica o fallback su `'compliance'`), rimuovendo in modo assoluto e categorico la CTA prematura e fuorviante `"Inizia la Distribuzione"`.
- **Nessuna Regressione Contabile o Normativa:** Tutti i risultati economici consolidati nei precedenti slice rimangono intatti al centesimo (`CALC-02 = VERIFIED_FIXED`, `NORM-01 = VERIFIED_FIXED`, `ASTRA_BLOCKERS_OPEN = 0`).
- **Perimetro di Severità Preservato:** In conformità ai vincoli di audit, `FUNC-02` permane allo stato **`HIGH / PARTIALLY_FIXED`**, poiché gli aspetti di readiness documentale, gestione esplicita delle bozze di distribuzione e automatismi mutativi non rientrano nel presente slice.

---

## 2. Baseline

La baseline di lavoro è stata verificata all'avvio e mantenuta integralmente in modalità **STRICT READ-ONLY**:
- **Branch:** `ux/toolbox-area-fondo-prototype`
- **HEAD:** `d3170f959b5815c514dbf3d6e5f93366a5f14c67`
- **Git Staged:** Nessun file staged (`git diff --cached` vuoto).
- **File di Produzione Modificati nello Slice:** Esclusivamente 2 file:
  - `src/logic/cabina/resolveOperationalStatus.ts`
  - `src/logic/cabina/resolveCabinaViewModel.ts`
- **File di Test Modificati nello Slice:** Esclusivamente 3 file:
  - `src/logic/cabina/__tests__/resolveOperationalStatus.test.ts`
  - `src/logic/cabina/__tests__/resolveCabinaViewModel.test.ts`
  - `src/pages/__tests__/CabinaDiRegiaPage.wave41.integration.test.tsx`
- **Staging (`mcasgpaivyosaroxrodm`) e Produzione (`yggokplxleredipknfbq`):** Rigorosamente NON contattati.

---

## 3. Pre/Post Cabina Graph

### Grafo PRE-Slice (Vulnerabile a Incoerenza di Workflow)
```text
AppContext.state.calculationResult.canonicalFund
       │
       ▼
resolveOperationalStatus(snapshotStatus, calculationResult, distributionStatus)
       │
       ├─► case 'VALID':
       │      └─► return distributionStatus === 'IN_PROGRESS'
       │             ? 'DISTRIBUTION_IN_PROGRESS'
       │             : 'CONSTITUTION_VERIFIED'   <-- IGNORAVA COMPLETAMENTE LE ISSUE!
       ▼
operationalStatus = 'CONSTITUTION_VERIFIED'
       │
       ▼
primaryAction = { label: 'Inizia la Distribuzione', target: 'distribuzioneRisorse' }

[In parallelo e completamente disconnesso:]
state.complianceChecks + canonicalFund
       │
       ▼
resolveChecklist(...) ──► viewModel.issues (mostrava badge rosso "Bloccante" in disaccordo con la CTA!)
```

### Grafo POST-Slice (Workflow Integrato e Coerente)
```text
distribuzioneRisorseData
       │
       ▼
resolveDistributionStatus ──► distributionStatus ('NOT_STARTED' | 'IN_PROGRESS')

complianceChecks + canonicalFund
       │
       ▼
resolveChecklist(...) ──► issues (risolta una sola volta)
       │
       ├─► firstBlockingIssue = issues.find(i => i.severity === 'BLOCKING')
       ├─► hasBlockingIssues = firstBlockingIssue !== undefined
       │
       ▼
resolveOperationalStatus({
  snapshotStatus,
  calculationResult,
  distributionStatus,
  hasBlockingIssues
})
       │
       ├─► case 'VALID':
       │      if (hasBlockingIssues) return 'BLOCKED';  <-- PREVALENZA DEL BLOCKER
       │      return distributionStatus === 'IN_PROGRESS' ? 'DISTRIBUTION_IN_PROGRESS' : 'CONSTITUTION_VERIFIED';
       ▼
status = 'BLOCKED'
       │
       ▼
primaryAction = {
  label: 'Apri le verifiche',
  target: firstBlockingIssue?.target || PRIMARY_ACTIONS.BLOCKED.target ('compliance')
}
secondaryActions = []  (nessun bypass consentito)
```

**Accertamento di Purity:** Nessun controllo di compliance viene rieseguito; non vi è alcun parsing di stringhe, codici o messaggi. La determinazione poggia unicamente sulla proprietà normalizzata `issue.severity === 'BLOCKING'`.

---

## 4. Single Blocking Authority

La qualifica di criticità bloccante è accentrata in modo univoco e non ambiguo:
1. **Autorità Unica:** Il modulo `src/logic/cabina/resolveChecklist.ts` mappa `check.gravita === 'error'` in `severity: 'BLOCKING'`. I prerequisiti mancanti assumono `severity: 'MISSING_PREREQUISITE'` e le avvertenze assumono `severity: 'WARNING'`.
2. **Consumo a Valle:** `resolveCabinaViewModel.ts` individua la presenza di blocker esclusivamente mediante:
   ```typescript
   const firstBlockingIssue = issues.find(issue => issue.severity === 'BLOCKING');
   const hasBlockingIssues = firstBlockingIssue !== undefined;
   ```
3. **Assenza di Regole Duplicate:** `resolveOperationalStatus.ts` riceve unicamente il boolean `hasBlockingIssues`. Nessun'altra regola euristica o filtro su codici/messaggi esiste in `resolveOperationalStatus`, in `resolveCabinaViewModel` o nel JSX di `CabinaDiRegiaPage.tsx`.

**Classificazione:** `BLOCKING_AUTHORITY = SINGLE_NORMALIZED_CHECKLIST`.

---

## 5. Precedence Table Review

L'ordine di valutazione all'interno di `resolveOperationalStatus` implementa esattamente la decision table richiesta senza possibilità di inversione:

| Snapshot / Annualità | Stato Canonico | Presenza Blocker (`hasBlockingIssues`) | Avanzamento Distribuzione | Stato Operativo Risolto | Precedenza Garantita |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **CLOSED** | *Qualsiasi* | *Qualsiasi* | *Qualsiasi* | **`CLOSED`** | **1 (Assoluta)** |
| **OPEN** | *Assente (`!calc`)* | *Qualsiasi* | *Qualsiasi* | **`NOT_STARTED`** | **2 (Raccolta Dati)** |
| **OPEN** | **`INVALID`** | *Qualsiasi* | *Qualsiasi* | **`BLOCKED`** | **3 (Errore Canonico)** |
| **OPEN** | **`UNDETERMINED`** | *Qualsiasi* | *Qualsiasi* | **`TO_COMPLETE`** | **4 (Costituzione Prioritaria)** |
| **OPEN** | **`VALID`** | **Sì (`true`)** | *NOT_STARTED* o *IN_PROGRESS* | **`BLOCKED`** | **5 (Blocco di Conformità)** |
| **OPEN** | **`VALID`** | No (`false`) | *IN_PROGRESS* | **`DISTRIBUTION_IN_PROGRESS`** | **6 (Avanzamento Ordinario)** |
| **OPEN** | **`VALID`** | No (`false`) | *NOT_STARTED* | **`CONSTITUTION_VERIFIED`** | **7 (Pronto per Distribuzione)** |

Tutti i rami `switch/case` e le condizioni di early-return sono stati verificati: non esiste alcun percorso di codice che possa produrre una precedenza difforme.

**Classificazione:** `BLOCKING_PRECEDENCE = CORRECT`.

---

## 6. Warning & Missing Prerequisite Behavior

### Gestione WARNING
- Se il fondo è `VALID` e le issue contengono esclusivamente avvertenze (`severity === 'WARNING'`), `firstBlockingIssue` è `undefined` e `hasBlockingIssues` è `false`.
- Lo stato risultante è `CONSTITUTION_VERIFIED` (oppure `DISTRIBUTION_IN_PROGRESS` se il lavoro è avviato), e la CTA primaria rimane `"Inizia la Distribuzione"` (o `"Riprendi la Distribuzione"`).
- Non vi è alcuna conversione accidentale di warning in blocker causata da falsy checks o errate interpretazioni di gravità.

### Gestione MISSING_PREREQUISITE vs BLOCKING
- Nello scenario `UNDETERMINED` (es. A/2025 con prerequisito mancante su straordinario):
  - Lo stato operativo rimane rigorosamente **`TO_COMPLETE`** e la CTA primaria rimane `"Vai alla Costituzione"` (`target: 'fondoDipendenti'`).
  - La mancanza di un prerequisito di calcolo non viene trasformata in un'eccezione di compliance.
  - **Soppressione della CTA secondaria:** Se coesistono un prerequisito mancante e una criticità di compliance `BLOCKING`, la CTA secondaria `"Riprendi la Distribuzione"` (precedentemente offerta quando `distributionStatus === 'IN_PROGRESS'`) viene **soppressa** (`!hasBlockingIssues`). L'utente non viene invitato ad aggirare il blocco.

---

## 7. Multiple Blockers & Targetless Routing

### Determinismo Multi-Blocker
- `issues.find(issue => issue.severity === 'BLOCKING')` scansiona l'array nell'ordine nativo restituito da `resolveChecklist` (`[...complianceIssues, ...missingPrerequisiteIssues, ...warningIssues]`).
- È accertato mediante test ripetuti che l'ordine delle issue nell'array checklist governa la destinazione della CTA primaria in modo deterministico, senza riordinamenti alfabetici, ordinamenti per ID o preferenze basate sul testo.

### Fallback in Assenza di Related Page (Targetless Blocker)
- Nel caso in cui il primo blocker abbia `relatedPage === undefined` o stringa vuota:
  ```typescript
  target: status === 'BLOCKED'
    ? firstBlockingIssue?.target || PRIMARY_ACTIONS.BLOCKED.target
    : PRIMARY_ACTIONS[status].target
  ```
- Il target risolto ricade sul fallback predefinito `'compliance'` (`PRIMARY_ACTIONS.BLOCKED.target`).
- Il resolver **non salta** la prima issue per selezionare il target di una issue successiva.

### Routing delle Rotte Supportate
- Tutti i target generati (`'compliance'`, `'fondoDipendenti'`, `'fundDetails'`, `'distribuzioneRisorse'`, `'wizard2026Preview'`) appartengono ai route identifier pienamente gestiti dalla funzione `goToTab` / `setScopeAndTab(NavigationScope.FONDO, target)`.
- Nessun codice tecnico o stringa grezza di enum viene esposta all'interfaccia utente.

---

## 8. Distribution in Progress with Blocker

Questo scenario rappresenta il perimetro funzionale più delicato:
- **Contesto:** Il fondo canonico è `VALID`, ma l'utente ha già inserito quote di utilizzo (`distributionStatus === 'IN_PROGRESS'`, `hasExistingWork === true`), e successivamente emerge o viene rilevata una criticità `BLOCKING`.

### Esito Accertato
1. **Stato Operativo e CTA:**
   - Lo stato complessivo passa a **`BLOCKED`**.
   - La CTA primaria diventa **`"Apri le verifiche"`**.
   - La CTA secondaria o alternativa `"Riprendi la Distribuzione"` viene completamente rimossa dall'header operativo.
2. **Preservazione dei Dati Economici:**
   - I dati di allocazione (`distribuzioneRisorseData`) rimangono **byte-identici**.
   - Nessun rollback, reset, azzeramento, dispatch di rimozione o ricalcolo economico viene eseguito.
   - `distribution.status` rimane `'IN_PROGRESS'` e `distribution.hasExistingWork` rimane `true`.
3. **Coerenza Visiva dell'Interfaccia:**
   - La pipeline mostra per la fase di distribuzione il testo informativo `"In lavorazione"`, indicando correttamente che il lavoro pregresso è conservato in bozza, mentre il badge principale di fase e la scheda di prossima attività indicano senza ambiguità `"Bloccato"` e invitano a risolvere la criticità.

**Classificazione:** `IN_PROGRESS_WITH_BLOCKER_UI = CLEAR`.

---

## 9. Secondary Actions Review

È stata verificata la generazione delle azioni secondarie (`secondaryActions`):
- In stato `BLOCKED`: restituisce array vuoto `[]`.
- In stato `CLOSED`: restituisce array vuoto `[]`.
- In stato `TO_COMPLETE`: restituisce `[{ ...RESUME_DISTRIBUTION_ACTION }]` **solo ed esclusivamente se** `distributionStatus === 'IN_PROGRESS'` E `!hasBlockingIssues`.
- **Conclusione:** Nessuna azione secondaria permette di aggirare o eludere una criticità bloccante segnalata dalla CTA primaria.

**Classificazione:** `SECONDARY_ACTION_BYPASS = NO`.

---

## 10. CLOSED State Integrity

Nello stato `AnnualSnapshotStatus.CLOSED`:
- `resolveOperationalStatus` valuta `if (snapshotStatus === AnnualSnapshotStatus.CLOSED) return 'CLOSED'`.
- `primaryAction` è categoricamente `null`.
- `secondaryActions` è categoricamente `[]`.
- Le pipeline operative e i pulsanti di navigazione mutativi risultano disabilitati (`disabled = true`).
- Le criticità pregresse rimangono consultabili a titolo storico/informativo senza possibilità di alterazione.

**Classificazione:** `CLOSED_WITH_BLOCKER = CLOSED`.

---

## 11. Purity & Side-Effect Review

Entrambe le funzioni analizzate (`resolveOperationalStatus` e `resolveCabinaViewModel`) risultano **pure e prive di side-effect**:
- Nessun array o oggetto in ingresso (`complianceChecks`, `distribuzioneRisorseData`, `calculationResult`) viene mutato o riordinato in-place.
- È stato verificato il test con input congelati (`Object.freeze`), a conferma che nessuna operazione di scrittura viene tentata sugli argomenti.

**Classificazione:** `RESOLVER_PURITY = PURE`.

---

## 12. Action Object Isolation

Il template statico `PRIMARY_ACTIONS` è protetto contro mutazioni condivise:
- Ogni invocazione di `resolveCabinaViewModel` istanzia un nuovo oggetto tramite spread `{ ...PRIMARY_ACTIONS[status], target: ... }`.
- Anche le azioni secondarie vengono clonate mediante `{ ...RESUME_DISTRIBUTION_ACTION }`.
- Chiamate consecutive non condividono riferimenti mutabili che potrebbero essere accidentalmente modificati dai componenti React consumatori.

**Classificazione:** `ACTION_OBJECT_ISOLATION = PASS`.

---

## 13. Page Integration

Il file di pagina `src/pages/CabinaDiRegiaPage.tsx` è rimasto **byte-identico** rispetto alla baseline (0 righe di diff).
- La pagina consuma direttamente le proprietà `viewModel.status`, `viewModel.primaryAction` e `viewModel.secondaryActions`.
- Il badge "Bloccato", la fase "Verifica", la descrizione "Esamina le criticità bloccanti prima di procedere" e il pulsante "Apri le verifiche" vengono renderizzati naturalmente dalla pagina senza l'aggiunta di alcuna logica condizionale o JSX ad-hoc.

**Classificazione:** `PAGE_BUSINESS_LOGIC_CHANGED = NO`.

---

## 14. Test Harness Review

I test modificati e aggiunti sono stati esaminati riga per riga ed eseguiti localmente:
- `resolveOperationalStatus.test.ts`: **16/16 PASS** (copre tutti i rami della decision table, inclusi invalid, undetermined, valid con blocker, closed e calcolo assente).
- `resolveCabinaViewModel.test.ts`: **26/26 PASS** (copre first blocking, warning non bloccanti, fallback targetless, immutabilità distribuzioni, soppressione resume e isolamento referenziale).
- `CabinaDiRegiaPage.wave41.integration.test.tsx`: **45/45 PASS** (test di integrazione React reali con rendering del DOM, verifica dei badge, dispatch spionati e click di navigazione).
- **Totale Suite Cabina:** **111/111 PASS**.

Nessuna asserzione preesistente è stata rimossa o indebolita.

**Classificazione:** `TEST_HARNESS_REVIEW = PASS_HIGH_CONFIDENCE`.

---

## 15. CALC-02 & NORM-01 No-Regression Audit

È stata eseguita la riesecuzione completa di tutte le suite collegate alla quadratura contabile e normativa:
- `distributionCanonicalBudget.test.ts` (14/14 PASS);
- `DistribuzioneRisorsePage.canonicalBudget.test.tsx` (7/7 PASS);
- `DistribuzioneRisorsePage.closed.test.tsx` (1/1 PASS);
- `fadReportReadModel.test.ts` (17/17 PASS);
- `canonicalFadXlsx.test.ts` (16/16 PASS);
- `canonicalFundSummaryPdf.test.ts` (17/17 PASS);
- Motore di calcolo di regressione `run_regression_tests.ts` (8/8 PASS);
- Oracolo normativo `run_wave2_oracle.ts` (14/14 PASS);
- Probes indipendenti `calc02Probes.test.ts` (3/3 PASS) e `probe2027.test.ts` (1/1 PASS).

I totali economici, le deduzioni Art. 60 (2025: $0$, 2026: $-127,44$, 2027: consolidamento esplicito) e i budget canonici rimangono assolutamente intatti al centesimo.

**Classificazione:**
- `CALC_02_REGRESSION = NONE`
- `NORM_01_REGRESSION = NONE`
- `ASTRA_BLOCKERS_OPEN = 0`

---

## 16. Scope Integrity

Il perimetro delle modifiche risulta rigorosamente controllato:
- **File di Produzione:** solo `resolveOperationalStatus.ts` e `resolveCabinaViewModel.ts`.
- **File di Test:** solo le suite dirette di Cabina (`resolveOperationalStatus.test.ts`, `resolveCabinaViewModel.test.ts`, `CabinaDiRegiaPage.wave41.integration.test.tsx`).
- **File Invariati:** `CabinaDiRegiaPage.tsx`, `resolveChecklist.ts`, `resolveDistributionStatus.ts`, `DistribuzioneRisorsePage.tsx`, `canonicalFundLedger.ts`, `documentProjection.ts`, `reportPresenter.ts`, PDF/XLS services, Edge Functions e migrazioni SQL.

**Classificazione:** `SCOPE_INTEGRITY = PRESERVED`.

---

## 17. Residual FUNC-02 Boundary

Questo slice risolve in modo ineccepibile la priorità delle issue bloccanti in Cabina di Regia, ma **non completa** l'intero perimetro del finding `FUNC-02`.

Rimangono esplicitamente fuori scope e richiederanno slice dedicati:
1. `DISTRIBUTION_EXPLICIT_DRAFT`: gestione e scelta esplicita dell'utente nell'operare su una base provvisoria di simulazione anziché sul fondo definitivo;
2. Perfezionamento dell'automatismo di riparto performance e maggiorazioni;
3. Gestione dell'assenza di dati del personale senza default forzato a zero non qualificato;
4. Prontezza alla chiusura amministrativa (`CLOSURE_INSTRUCTION_READINESS`) e readiness formale dei documenti.

Pertanto, in ottemperanza ai criteri di rigore, lo stato del finding viene confermato come:
$$\mathbf{FUNC\_02\_FINAL\_STATUS = PARTIALLY\_FIXED}$$

---

## 18. Severity Integrity

Le severità originali di audit vengono rigorosamente confermate senza alcun declassamento:
- `FUNC-02` = **HIGH** (`PARTIALLY_FIXED`)
- `DOC-02` = **HIGH** (`PARTIALLY_FIXED`)
- `NORM-02` = **HIGH** (`PARTIALLY_FIXED`)
- `ARCH-01` = **HIGH** (`PARTIALLY_FIXED`)

---

## 19. Next Gate Recommendation

Avendo consolidato la priorità e la precedenza operativa dei blocker in Cabina di Regia, la naturale evoluzione del percorso di bonifica funzionale di `FUNC-02` è:

**Raccomandazione Prossimo Gate:**
$$\mathbf{DISTRIBUTION\_EXPLICIT\_DRAFT}$$
(Formalizzazione dell'interazione utente per la gestione esplicita delle bozze di distribuzione su basi provvisorie).

---
