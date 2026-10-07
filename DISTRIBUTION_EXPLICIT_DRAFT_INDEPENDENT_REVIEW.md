# DISTRIBUTION_EXPLICIT_DRAFT — Independent Review
## FUNC-02 — Explicit Proposal, No Automatic Mutation, Personnel Missing Semantics

**Review Date:** 2026-10-04\
**Reviewer:** Principal Software Architect, Workflow/State-Management Auditor & Regulated Administrative Systems Independent Reviewer\
**Slice Evaluated:** `DISTRIBUTION_EXPLICIT_DRAFT`\
**Target Defect:** `FUNC-02` (Severity: HIGH)\
**Repository:** `dinopusceddu/entilocaliapp`\
**Branch:** `ux/toolbox-area-fondo-prototype`\
**HEAD:** `d3170f959b5815c514dbf3d6e5f93366a5f14c67`\
**Result:** **PASS — DISTRIBUTION_EXPLICIT_DRAFT_INDEPENDENT_REVIEW = COMPLETE**

---

## Executive verdict

L'audit indipendente di architettura, flussi di mutazione, purezza funzionale e gestione dello stato emette verdetto **PASS** per lo slice `DISTRIBUTION_EXPLICIT_DRAFT`.

Lo slice realizza con rigore metodologico l'eliminazione completa dell'auto-riparto economico mutativo nella pagina di Distribuzione delle Risorse e introduce una proposta esplicita non distruttiva e pura:
1. **Eliminazione degli automatismi mutativi:** Tutti i `useEffect` mutativi precedentemente responsabili dell'auto-riparto della performance individuale, della performance organizzativa e della maggiorazione premio sono stati completamente rimossi da [`src/pages/DistribuzioneRisorsePage.tsx`](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/pages/DistribuzioneRisorsePage.tsx). La pagina presenta **zero hook `useEffect`** e **zero hook `useState`**.
2. **Purezza del resolver di proposta:** Il nuovo modulo [`src/logic/distribution/resolveDistributionDraftProposal.ts`](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/logic/distribution/resolveDistributionDraftProposal.ts) opera come funzione pura (`PROPOSAL_RESOLVER_PURITY = PURE`), derivando la proposta unicamente dalla base economica qualificata e dai criteri correnti, senza mutare gli input, senza dispatchare azioni, senza persistere stato e senza promuovere indebitamente una bozza a totale autoritativo.
3. **Equivalenza numerica delle formule:** Le formule economiche di riparto della performance e della maggiorazione sono matematicamente e centesimo-per-centesimo identiche a quelle previgenti a regime (`PROPOSAL_FORMULA_EQUIVALENCE = PASS`), convertendo la mutazione implicita in una preview esplicita.
4. **Zero dispatch e zero dirty on mount / recalculation:** All'apertura della pagina, al ricalcolo del fondo e alla modifica dei criteri, il conteggio dei dispatch è rigorosamente **0**. Nessun timer di autosave viene avviato, il checksum di `fundData` rimane invariato e lo stato di distribuzione in Cabina di Regia permane `NOT_STARTED`.
5. **Azione applicativa esplicita e protetta:** L'aggiornamento degli stanziamenti avviene esclusivamente mediante il gesto volontario dell'utente sul pulsante `"Applica la proposta di riparto"`, che emette un singolo dispatch atomico (`APPLY_DISPATCH_COUNT = 1`) ed è subordinato ai controlli di non-chiusura (`!isClosed`), disponibilità della proposta (`proposal.status === 'AVAILABLE'`) e assenza di criticità bloccanti nella checklist Cabina (`!hasBlockingIssues`).
6. **Semantica del personale (Missing vs Zero vs Positivo):** La funzione pura `resolveDistributionPersonnel` supera l'ambiguità del fallback truthy: un dato assente o un organico vuoto di default non viene promosso a `0` o alla fascia $\le 5$, bensì qualificato come `MISSING`, rendendo l'Art. 48 contrattuale non determinabile ed evitando false maggiorazioni a zero. Lo zero esplicito inserito dall'amministrazione (`KNOWN_ZERO`) governa prioritariamente su elenchi di dettaglio non aggiornati.
7. **Integrità dei blocchi Cabina:** La presenza di una criticità `BLOCKING` nella checklist disabilita l'applicazione della proposta e ne blocca l'esecuzione anche a livello di handler; le anomalie `WARNING` non costituiscono invece blocco ingiustificato.
8. **Nessuna regressione su slice consolidati:** `CALC-02 = VERIFIED_FIXED`, `NORM-01 = VERIFIED_FIXED`, `ASTRA_BLOCKERS_OPEN = 0`, `CABINA_BLOCKING_REGRESSION = NONE`.
9. **Perimetro FUNC-02:** Come prescritto dal mandato ASTRA, il finding `FUNC-02` permane allo stato **`HIGH / PARTIALLY_FIXED`**, in quanto gli ambiti di `CLOSURE_INSTRUCTION_READINESS` e `DOCUMENT_KIND_READINESS` appartengono a slice successivi dedicati.

---

## Baseline

La verifica di integrità del repository ha attestato la piena conformità all'ambiente atteso in modalità **STRICT READ-ONLY**:
- **Branch:** `ux/toolbox-area-fondo-prototype`
- **HEAD:** `d3170f959b5815c514dbf3d6e5f93366a5f14c67`
- **Git Staged:** Nessun file in stage (`git diff --cached` vuoto).
- **Working Tree:** Preservato integralmente, nessun file modificato o cancellato dall'audit.

---

## PRE/POST mutation graph

### Grafo PRE-Slice (Mutativo e Implicito)
```text
calculationResult.canonicalFund
       │
       ▼
resolveDistributionFundBudget (basis qualificata)
       │
       ▼
resolveDistributionBalances ──► importoDisponibileContrattazione
       │
       ├─► useEffect (performance):
       │     calcola residuo - maggiorazione stanziata
       │     split individuale/organizzativa
       │     confronta con valori attuali
       │     se disallineato ──► dispatch(UPDATE_DISTRIBUZIONE_RISORSE_DATA)
       │
       ├─► useEffect (maggiorazione):
       │     calcola maggiorazioneProCapite * numDipendentiBonus
       │     se !isMaggiorazioneUserEdited e disallineato
       │     ──► dispatch(UPDATE_DISTRIBUZIONE_RISORSE_DATA)
       │
       └─► useEffect (preventivo/consuntivo cleanup):
             se !criteri_isConsuntivoMode
             itera campi variabili e azzera risparmi/aBilancio
             ──► dispatch(UPDATE_DISTRIBUZIONE_RISORSE_DATA)
                     │
                     ▼
             appReducer merge in fundData
                     │
                     ├─► Checksum alterato
                     ├─► Autosave schedulato / salvataggio remoto non richiesto
                     └─► Cabina resolveDistributionStatus rileva stanziate > 0
                           ──► transizione indebita NOT_STARTED ──► IN_PROGRESS
```

### Grafo POST-Slice (Puro ed Esplicito)
```text
calculationResult.canonicalFund
       │
       ▼
resolveDistributionFundBudget (basis qualificata)
       │
       ▼
resolveDistributionBalances ──► importoDisponibileContrattazione
       │
       ▼
resolveDistributionPersonnel(rawCcnlCount, employeeDetails)
       │
       ▼
resolveDistributionDraftProposal(basis, utilizziStabili, otherVariabili, criteri, personnel)
       │
       ▼
Render Preview ("Card Proposta di riparto performance")
       │
       ├──► ZERO useEffect
       ├──► ZERO dispatch on mount
       ├──► ZERO dispatch on recalculation
       ├──► ZERO alterazione di fundData o checksum
       └──► Cabina resolveDistributionStatus rimane 'NOT_STARTED'
               │
   [Gesto Intenzionale dell'Utente]
               │
               ▼
   Click "Applica la proposta di riparto"
               │
         (Guardie: !isClosed && !hasBlockingIssues && proposal.status === 'AVAILABLE')
               │
               ▼
   Singolo dispatch atomico:
   dispatch({
     type: 'UPDATE_DISTRIBUZIONE_RISORSE_DATA',
     payload: {
       p_performanceIndividuale: { ...current, stanziate: proposal.individuale },
       p_performanceOrganizzativa: { ...current, stanziate: proposal.organizzativa },
       ...(proposal.maggiorazione !== null ? { p_maggiorazionePerformanceIndividuale: { ...current, stanziate: proposal.maggiorazione } } : {})
     }
   })
               │
               ▼
   appReducer aggiorna fundData
               │
               ├─► Checksum aggiornato legittimamente
               ├─► Normale ciclo di autosave o salvataggio manuale
               └─► Cabina resolveDistributionStatus transiziona a 'IN_PROGRESS'
```

---

## Effect inventory

È stato condotto un red-teaming sistematico dell'AST e del codice sorgente di [`DistribuzioneRisorsePage.tsx`](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/pages/DistribuzioneRisorsePage.tsx):

| Meccanismo | Presenza in DistribuzioneRisorsePage.tsx | Valutazione |
|---|---|---|
| `useEffect` | **0** (completamente assente) | PASS — Nessun effect nel componente |
| `useState` | **0** (completamente assente) | PASS — Nessuno stato locale asincrono |
| `useMemo` | 8 hook (derivati puri di lettura/aggregazione) | PASS — Nessun side effect o dispatch |
| Invocazioni `dispatch` | 6 punti, **esclusivamente all'interno di gestori eventi utente**: | PASS: |
| 1. `handleChange` | Invocato solo da `onChange` controlli generici | Esplicito utente |
| 2. `handleEqChange` | Invocato solo da `onChange` controlli EQ | Esplicito utente |
| 3. `handleVariableChange`| Invocato solo da `onChange` campi variabili | Esplicito utente |
| 4. `handlePerfPercChange`| Invocato solo da `onChange` % individuale | Esplicito utente |
| 5. `handleApplyProposal` | Invocato solo da `onClick` "Applica proposta" | Esplicito utente |
| 6. `handleConsuntivoChange`| Invocato solo da `onChange` toggle consuntivo | Esplicito utente |
| `saveState` | Invocato solo da `onClick` "Salva Distribuzione" | Esplicito utente |
| Lifecycle / Mount Hooks | Nessuno | PASS |

Non sopravvive alcuna mutazione economica automatica né alcun cleanup silente.

---

## Proposal resolver purity

Il modulo [`src/logic/distribution/resolveDistributionDraftProposal.ts`](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/logic/distribution/resolveDistributionDraftProposal.ts) rispetta rigorosamente i canoni delle funzioni matematiche pure:
- **Input ammessi:**
  - `basis: DistributionBudgetBasis` (fornita dal budget canonico qualificato);
  - `stableAllocated: number`;
  - `otherVariableAllocated: number`;
  - `individualPercentage: number`;
  - `allocatedMaggiorazione?: number`;
  - `maggiorazioneProCapite?: number | null`;
  - `numDipendentiBonus?: number | null`.
- **Output deterministico:**
  - `UNAVAILABLE` con motivazione (`'MISSING_BUDGET'` o `'INVALID_INPUT'`) se la base non è disponibile o i valori non sono finiti;
  - `AVAILABLE` con `{ mode, availableForPerformance, individuale, organizzativa, maggiorazione }` se la base è numericamente valida.
- **Ispezione di Purezza:**
  - **Nessuna mutazione degli input:** Verificato con `Object.freeze` e `structuredClone` (test D6).
  - **Nessun dispatch o save:** Modulo privo di dipendenze React o repository.
  - **Nessuna lettura di campi legacy:** Non accede a `fondi.dipendente.summary` né a totali non normalizzati.
  - **Nessuna creazione di autorità indebita:** Quando la base è `VERIFIED_DRAFT`, l'output preserva `mode: 'VERIFIED_DRAFT'`, senza mai promuoverlo ad autoritativo.
  - **Nessuna alterazione di canonical status:** L'oggetto canonico rimane inviolato.

**Classificazione:** `PROPOSAL_RESOLVER_PURITY = PURE`.

---

## Formula equivalence

L'audit ha verificato il confronto matematico tra le formule del vecchio auto-riparto e la proposta corrente:
1. **Risorse disponibili per la performance:**
   $$\text{availableForPerformance} = \max(0, (\text{basis.amount} - \text{stableAllocated}) - \text{otherVariableAllocated})$$
   Identica espressione rispetto a `Math.max(0, importoDisponibileContrattazione - otherVariableUtilizations)`.
2. **Maggiorazione Art. 48:**
   $$\text{maggiorazione} = \text{round}\Big(\text{maggiorazioneProCapite} \times \text{numDipendentiBonus}, 2\Big)$$
   Identico calcolo con `Number.EPSILON` e arrotondamento a 2 decimali.
3. **Budget effettivo per la performance:**
   $$\text{effectivePerformance} = \max(0, \text{availableForPerformance} - (\text{maggiorazione} \mathbin{??} \text{allocatedMaggiorazione}))$$
   Corrisponde esattamente allo stato di regime raggiunto in precedenza dal concatenamento dei due `useEffect`.
4. **Performance individuale:**
   $$\text{individuale} = \text{roundTo2DP}\Big(\text{effectivePerformance} \times \frac{\text{percIndividuale}}{100}\Big)$$
5. **Performance organizzativa (a saldo):**
   $$\text{organizzativa} = \text{subtractExact}(\text{effectivePerformance}, \text{individuale})$$
   Garantisce la perfetta chiusura del residuo senza scarti di centesimi.
6. **Beneficiari bonus:**
   $$\text{numDipendentiBonus} = \lceil \text{numeroDipendenti} \times (\text{percDipendentiBonus} / 100) \rceil$$

I valori restituiti dalla proposta corrispondono esattamente al centesimo ai valori che i vecchi effect avrebbero iscritto automaticamente nel draft.

**Classificazione:** `PROPOSAL_FORMULA_EQUIVALENCE = PASS`.

---

## Mount/recalculation mutation review

Nei test eseguiti sulla pagina reale ([`DistribuzioneRisorsePage.explicitDraft.test.tsx`](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/pages/__tests__/DistribuzioneRisorsePage.explicitDraft.test.tsx)):
- **Mount con budget autoritativo (Test D1):** Con budget autoritativo di $10.000,00\ \text{€}$ e residuo positivo, la proposta di $5.000,00\ \text{€}$ viene renderizzata a schermo, ma `boundary.dispatch` registra $0$ chiamate, `boundary.saveState` registra $0$ chiamate, e `boundary.state` risulta byte-identico a prima del render.
- **Mount con base di bozza (Test D2):** Con budget `UNDETERMINED` e subtotale verificato di $3.400,00\ \text{€}$, la card espone `"Proposta di riparto performance — simulazione BOZZA"` e la quota calcolata di $950,00\ \text{€}$; il conteggio dei dispatch è pari a $0$.
- **Ricalcolo della base canonica (Test D5/D6):** All'aggiornamento del fondo canonico da $10.000,00\ \text{€}$ a $12.000,00\ \text{€}$, la preview della proposta si adegua istantaneamente a $5.950,00\ \text{€}$, mentre i campi di allocazione già presenti nel draft mantengono intatti i rispettivi valori ($123,00\ \text{€}$ e $456,00\ \text{€}$) con zero dispatch.
- **Base non disponibile (Test D3):** Con base `UNAVAILABLE`, non compare alcun importo suggerito né alcuno zero fabbricato; il pulsante di applicazione non viene renderizzato nel DOM e nessun dispatch ha luogo.

**Valutazione:**
- `AUTO_MUTATION_ON_MOUNT = NO`
- `AUTO_MUTATION_ON_RECALC = NO`
- `AUTHORITATIVE_PROPOSAL = AVAILABLE_READONLY`
- `VERIFIED_DRAFT_PROPOSAL = AVAILABLE_READONLY_SIMULATION`
- `UNAVAILABLE_PROPOSAL = UNAVAILABLE_NO_MUTATION`

---

## Explicit apply

L'azione di applicazione è gestita dal metodo `handleApplyProposal`:
```typescript
const handleApplyProposal = () => {
  if (isClosed || hasBlockingIssues || proposal.status !== 'AVAILABLE') return;
  const updates: Partial<DistribuzioneRisorseData> = {
    p_performanceIndividuale: { ...distribuzioneRisorseData.p_performanceIndividuale, stanziate: proposal.individuale },
    p_performanceOrganizzativa: { ...distribuzioneRisorseData.p_performanceOrganizzativa, stanziate: proposal.organizzativa },
  };
  if (proposal.maggiorazione !== null) {
    updates.p_maggiorazionePerformanceIndividuale = {
      ...distribuzioneRisorseData.p_maggiorazionePerformanceIndividuale,
      stanziate: proposal.maggiorazione,
    };
  }
  dispatch({ type: 'UPDATE_DISTRIBUZIONE_RISORSE_DATA', payload: updates });
};
```
Proprietà verificate:
1. **Singolarità del dispatch:** Un solo clic dell'utente produce esattamente un solo dispatch (`APPLY_DISPATCH_COUNT = 1`).
2. **Assenza di cascate reattive:** Poiché non vi sono `useEffect` nella pagina, il render successivo non scatena alcun secondo dispatch o ricalcolo mutativo.
3. **Preservazione dei campi accessori:** Grazie allo spread `{ ...distribuzioneRisorseData.p_performanceIndividuale, stanziate: ... }`, eventuali campi preesistenti quali `risparmi` e `aBilancio` non vengono cancellati né azzerati.
4. **Protezione della maggiorazione non determinabile:** Se `proposal.maggiorazione === null` (ad es. per personale mancante), la proprietà non viene inclusa nel payload di update, preservando integralmente quanto già inserito dall'amministrazione.

---

## Double click / rapid click

- L'handler non applica addizioni cumulative (`+=`), bensì un'assegnazione idempotente del valore suggerito (`stanziate: proposal.individuale`).
- Un doppio clic rapido dell'utente genera due dispatch identici con il medesimo payload, che conducono allo stesso stato finale invariato.
- In ambiente `React.StrictMode` o in caso di rerender immediato, l'idempotenza è garantita: non si verificano duplicazioni di allocazione né scostamenti nei residui.

**Valutazione:** `DOUBLE_CLICK_SEMANTICS = IDEMPOTENT`.

---

## Existing manual values

Nel caso in cui l'utente abbia già stanziato manualmente importi per performance individuale e organizzativa:
- **Al mount:** I valori manuali rimangono immutati nel form.
- **Al ricalcolo della base:** I valori rimangono immutati; solo la preview si aggiorna.
- **Alla variazione dei criteri:** I valori rimangono immutati nel form.
- **Trasparenza UI:** La card di proposta avvisa chiaramente l'utente prima dell'azione con il testo:
  > *"La proposta non modifica gli stanziamenti. Applicarla sostituisce le quote performance con gli importi suggeriti."*

**Valutazione:**
- `MANUAL_VALUES_PRESERVED_ON_MOUNT = YES`
- `MANUAL_VALUES_PRESERVED_ON_RECALC = YES`

---

## Mode cleanup

Nel codice previgente, un `useEffect` ripuliva forzatamente i campi `risparmi` e `aBilancio` quando la modalità consuntivo era disattivata, anche al caricamento iniziale della pagina o su dati importati.

Nel codice corrente:
- L'effetto automatico è stato eliminato.
- Il cleanup è incapsulato in `handleConsuntivoChange(isConsuntivo: boolean)`, invocato **esclusivamente quando l'utente agisce sul checkbox "Modalità consuntivo?"**.
- Quando l'utente passa da consuntivo a preventivo, i campi `risparmi` e `aBilancio` vengono azzerati in modo deliberato e trasparente.
- All'apertura della pagina in preventivo con dati importati contenenti economie, nessun dispatch automatico altera tali importi prima di una scelta dell'utente.

**Classificazione:** `MODE_CLEANUP_SEMANTICS = EXPLICIT_ONLY`.

---

## Dirty/autosave

L'interazione con l'hook produttivo [`useFundDataAutosave`](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/hooks/useFundDataAutosave.ts) e con `appReducer` è stata verificata con timer virtuali:
- **Prima dell'apply:** La proposta a video è solo stato derivato nel render. `fundData` è immutato, il checksum stringa è identico, `lastSavedChecksumRef` coincide con `currentChecksum`, nessun timer di autosave viene avviato e `saveState` non viene chiamato.
- **Dopo l'apply:** L'azione `UPDATE_DISTRIBUZIONE_RISORSE_DATA` modifica `fundData`, variando il checksum. Al decorrere del debounce di autosave, `saveState` viene invocato regolarmente con il nuovo payload contenente le quote applicate.
- Nessun flag dirty ad hoc, layer spurio o stato non tracciato è stato introdotto.

**Valutazione:**
- `UNAPPLIED_PROPOSAL_DIRTY_STATE = CLEAN`
- `UNAPPLIED_PROPOSAL_PERSISTED = NO`

---

## Personnel source and precedence

La risoluzione del personale è affidata alla funzione pura `resolveDistributionPersonnel(explicitCount, employees)`:
- **Sorgente 1 (Principale):** `annualData.ccnl2024.personaleInServizio01012026` (`explicitCount`).
- **Sorgente 2 (Fallback):** `personaleServizio.dettagli` (`employees`).

### Ordine di Precedenza
1. Se `explicitCount !== undefined && explicitCount !== null`, governa `explicitCount` (origine `'CCNL_SETTINGS'`).
2. Se `explicitCount` è assente e `employees?.length > 0`, governa il numero di elementi dell'elenco (origine `'EMPLOYEE_DETAILS'`).
3. Altrimenti il conteggio è non determinabile (`count = null`).

---

## Missing / zero / positive

La tabella di risoluzione del personale e dell'Art. 48 è verificata al 100%:

| Input `explicitCount` | Input `employees` | Status | Count | Source | Art. 48 Applicabile |
|---|---|---|---:|---|---|
| `undefined` / `null` | `[]` / `undefined` | `MISSING` | `null` | `null` | `null` |
| `0` (esplicito) | `[]` | `KNOWN_ZERO` | `0` | `CCNL_SETTINGS` | `false` |
| `0` (esplicito) | `[{}, {}]` (popolato) | `KNOWN_ZERO` | `0` | `CCNL_SETTINGS` | `false` |
| `5` | qualsiasi | `KNOWN_POSITIVE` | `5` | `CCNL_SETTINGS` | `false` ($\le 5$) |
| `6` | qualsiasi | `KNOWN_POSITIVE` | `6` | `CCNL_SETTINGS` | `true` ($> 5$) |
| `undefined` / `null` | 6 elementi | `KNOWN_POSITIVE` | `6` | `EMPLOYEE_DETAILS` | `true` ($> 5$) |
| `NaN` / `Infinity` / `-1` | qualsiasi | `MISSING` | `null` | `null` | `null` |

Punti cardine accertati:
- L'elenco di default vuoto **NON** certifica organico zero: produce `MISSING`.
- Il dato `0` esplicito ha priorità assoluta su elenchi di dettaglio non aggiornati (nessun bug di truthiness).
- Valori negativi o non finiti vengono classificati come `MISSING`.

**Valutazione:**
- `PERSONNEL_BOUNDARY = TYPE_SAFE`
- `PERSONNEL_MISSING = HANDLED_AS_NULL`
- `PERSONNEL_EXPLICIT_ZERO = PRESERVED_ZERO`
- `PERSONNEL_POSITIVE = PRESERVED_POSITIVE`

---

## Art48 behavior

1. **Stato `MISSING`:**
   - La pagina espone il banner di avviso con `data-testid="distribution-personnel-missing"`:
     > *"Personale in servizio mancante. Inserire il dato per determinare l'applicabilità e la maggiorazione Art.48. Le allocazioni già inserite restano invariate."*
   - I controlli `% Maggiorazione Premio` e `% Dipendenti con Bonus` sono disabilitati con testo esplicito di dato mancante.
   - La maggiorazione pro capite e la proposta di maggiorazione espongono `"Non determinato"`.
   - **Nessuna falsa applicazione della fascia $\le 5$ e nessuna maggiorazione zero fabbricata**.
2. **Stato `KNOWN_ZERO`:**
   - Il banner di personale mancante **non** compare.
   - Mostra il testo preesistente `"Non applicabile per enti con dipendenti ≤ 5"`.
   - Maggiorazione calcolata a $0,00\ \text{€}$.
3. **Stato `KNOWN_POSITIVE`:**
   - Con organico $> 5$, i controlli sono abilitati e applicano i minimi contrattuali vigenti:
     - Obiettivi di ente attivi: minimo $20\%$;
     - Dipendenti $\le 10$: minimo $25\%$;
     - Dipendenti $> 10$: minimo $30\%$.

**Valutazione:**
- `ART48_MISSING = UNDETERMINED_NO_FABRICATED_ZERO`
- `ART48_ZERO = EXPLICIT_NON_APPLICABLE`
- `ART48_POSITIVE = THRESHOLDS_PRESERVED`

---

## Blocking issue

Il controllo delle criticità bloccanti nella pagina Distribuzione riusa direttamente il resolver centralizzato di Cabina:
```typescript
const hasBlockingIssues = resolveChecklist({ complianceChecks: state.complianceChecks })
  .some(issue => issue.severity === 'BLOCKING');
```
Comportamento verificato:
- **Criticità `BLOCKING` presente:**
  - Il pulsante `"Applica la proposta di riparto"` è disabilitato (`disabled={hasBlockingIssues}`).
  - Compare l'avviso: *"Risolvere le criticità bloccanti nelle verifiche prima di applicare la proposta."*
  - L'handler esegue `if (hasBlockingIssues) return;`, impedendo qualsiasi dispatch anche se sollecitato direttamente.
- **Criticità `WARNING` presente da sola:**
  - Il pulsante rimane abilitato e l'applicazione viene consentita normalmente (`WARNING_ALLOWS_APPLY = YES`).

Nessuna logica normativa duplicata o divergente rispetto alla Cabina di Regia.

**Valutazione:**
- `BLOCKING_PREVENTS_APPLY = YES`
- `WARNING_ALLOWS_APPLY = YES`

---

## Cabina distribution status

La funzione [`resolveDistributionStatus`](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/logic/cabina/resolveDistributionStatus.ts) valuta esclusivamente la presenza di stanziamenti effettivi strutturati in `distribuzioneRisorseData`:
- Con proposta renderizzata a video ma non applicata dall'utente, `distribuzioneRisorseData` è priva di importi di performance.
- Pertanto, `resolveDistributionStatus` restituisce **`NOT_STARTED`**.
- La proposta a video **non** promuove la distribuzione a stato di avanzamento.
- Solo a seguito del clic esplicito e del salvataggio nel draft, `resolveDistributionStatus` rileva gli stanziamenti positivi e transiziona a **`IN_PROGRESS`**.

**Valutazione:** `UNAPPLIED_PROPOSAL_DISTRIBUTION_STATUS = NOT_STARTED`.

---

## CLOSED

Nello stato `snapshotStatus === 'CLOSED'`:
- La card della proposta e il pulsante di applicazione non vengono renderizzati nel DOM (`{!isClosed && ...}`).
- Il pulsante di salvataggio è disabilitato e recita `"Annualità Chiusa"`.
- Tutti gli handler (`handleApplyProposal`, `handleChange`, `handleConsuntivoChange`, ecc.) presentano la guardia `if (isClosed) return;`.
- Il reducer `appReducer` intercetta e blocca qualsiasi tentativo di `UPDATE_DISTRIBUZIONE_RISORSE_DATA` a livello centrale.
- La suite preesistente [`DistribuzioneRisorsePage.closed.test.tsx`](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/pages/__tests__/DistribuzioneRisorsePage.closed.test.tsx) è byte-identica a quella precedente allo slice e passa con esito verde pieno.

**Valutazione:** `CLOSED_BEHAVIOR = STRICT_READONLY`.

---

## Existing test change review

Nel test preesistente [`DistribuzioneRisorsePage.canonicalBudget.test.tsx`](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/pages/__tests__/DistribuzioneRisorsePage.canonicalBudget.test.tsx), esattamente due asserzioni sono state aggiornate:
1. In `VALID uses 10000, residual 8500, and canonical performance proposal despite legacy 99999`:
   - Precedentemente si attendeva un dispatch automatico al mount con la quota calcolata;
   - Ora si asserisce la presenza della quota calcolata nella preview di proposta (`distribution-proposal`) e `expect(boundary.dispatch).not.toHaveBeenCalled()`.
2. In `UNDETERMINED 3400 is only a draft simulation`:
   - Precedentemente si attendeva un dispatch automatico di bozza;
   - Ora si asserisce la presenza della quota di bozza nella preview e `expect(boundary.dispatch).not.toHaveBeenCalled()`.

Nessuna asserzione economica fondamentale (autorità canonica, divergenza legacy, zero canonico, residui, etichette bozza, immutabilità con input mancanti) è stata indebolita o rimossa.

**Classificazione:** `EXISTING_TEST_CHANGE = LEGITIMATE_BEHAVIOR_UPDATE`.

---

## Test harness review

L'infrastruttura di test comprende:
- **`distributionDraftProposal.test.ts` (23 test):** Test unitari completi del resolver puro, con verifiche di freezing degli input, equivalenza formule, gestione zero canonico, soglie di personale e mancata alterazione del modello Cabina.
- **`DistribuzioneRisorsePage.explicitDraft.test.tsx` (19 test):** Test di integrazione sulla pagina reale, che combinano rendering DOM, `appReducer` reale, `useFundDataAutosave` reale con timer simulati, `resolveDistributionStatus` reale, scenari di personale missing/zero/positivo e verifiche di blocco.
- **`DistribuzioneRisorsePage.canonicalBudget.test.tsx` (7 test):** Test di autorità canonica e assenza di dispatch.
- **`DistribuzioneRisorsePage.closed.test.tsx` (1 test):** Verifica della totale immutabilità in annualità chiusa.

Nessun test fa uso di mock tautologici o logiche duplicate.

**Classificazione:** `TEST_HARNESS_REVIEW = PASS_HIGH_CONFIDENCE`.

---

## Closed-slice regressions

È stata rieseguita l'intera batteria di test dei contratti consolidati:
- **`distributionCanonicalBudget.test.ts` (14/14):** PASS.
- **`DistribuzioneRisorsePage.canonicalBudget.test.tsx` (7/7):** PASS.
- **`DistribuzioneRisorsePage.closed.test.tsx` (1/1):** PASS.
- **`CabinaDiRegiaPage.wave41.integration.test.tsx` (45/45):** PASS.
- **`resolveCabinaViewModel.test.ts` e `resolveOperationalStatus.test.ts`:** PASS.
- **`fadReportReadModel.test.ts`:** PASS.
- **`canonicalFadXlsx.test.ts`:** PASS.
- **`canonicalFundSummaryPdf.test.ts` (17/17):** PASS.
- **TypeScript (`npx tsc --noEmit`):** PASS (exit code 0, 0 errori).
- **Consolidated Regression Suite (8/8):** PASS.
- **Wave2 Oracle Suite (14/14):** PASS.
- **`git diff --check`:** PASS (exit code 0).

Nessuna regressione riscontrata:
- `CALC_02_REGRESSION = NONE`
- `NORM_01_REGRESSION = NONE`
- `CABINA_BLOCKING_REGRESSION = NONE`
- `ASTRA_BLOCKERS_OPEN = 0`

---

## Scope integrity

L'inventario dei file evidenzia il rigoroso rispetto dei confini autorizzati:
- **File di produzione modificato:** Esclusivamente [`src/pages/DistribuzioneRisorsePage.tsx`](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/pages/DistribuzioneRisorsePage.tsx).
- **Nuovo file di logica produttiva:** Esclusivamente [`src/logic/distribution/resolveDistributionDraftProposal.ts`](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/logic/distribution/resolveDistributionDraftProposal.ts).
- **File di test modificato:** Esclusivamente [`src/pages/__tests__/DistribuzioneRisorsePage.canonicalBudget.test.tsx`](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/pages/__tests__/DistribuzioneRisorsePage.canonicalBudget.test.tsx).
- **Nuovi file di test:** [`src/logic/distribution/__tests__/distributionDraftProposal.test.ts`](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/logic/distribution/__tests__/distributionDraftProposal.test.ts) e [`src/pages/__tests__/DistribuzioneRisorsePage.explicitDraft.test.tsx`](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/pages/__tests__/DistribuzioneRisorsePage.explicitDraft.test.tsx).
- **Report di implementazione:** [`DISTRIBUTION_EXPLICIT_DRAFT_IMPLEMENTATION_REPORT.md`](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/DISTRIBUTION_EXPLICIT_DRAFT_IMPLEMENTATION_REPORT.md).

Tutti gli altri 1108 file del progetto sono rimasti byte-identici. Nessun file cancellato, nessun database toccato, nessun ambiente esterno contattato.

**Classificazione:** `SCOPE_INTEGRITY = PASS`.

---

## Residual FUNC-02

In conformità alle prescrizioni del framework di riconciliazione ASTRA:
- Lo slice `DISTRIBUTION_EXPLICIT_DRAFT` risolve esaustivamente:
  1. La rimozione dell'auto-riparto mutativo della performance;
  2. L'introduzione della proposta pura separata dalle allocazioni correnti;
  3. L'applicazione subordinata ad azione esplicita e controllata;
  4. La semantica di personale `MISSING` distinta da `KNOWN_ZERO` ed esente da false maggiorazioni Art. 48.
- **Ambito residuo di FUNC-02 (non oggetto del presente slice):**
  - `CLOSURE_INSTRUCTION_READINESS`: distinzione tra validità e prontezza istruttoria nella chiusura annuale;
  - `DOCUMENT_KIND_READINESS` (DOC-02 / FUNC-02): subordinazione della generazione di prospetti e determine definitive alla completezza documentale;
  - Regole specifiche di delibere e attestazioni dei revisori.

Pertanto, `FUNC-02` è classificato come **`PARTIALLY_FIXED`** e non deve essere promosso prematuramente a `VERIFIED_FIXED`.

---

## Next gate recommendation

Con il completamento con esito **PASS** della presente review indipendente:
1. `DISTRIBUTION_EXPLICIT_DRAFT_STATUS = CLOSED_LOCALLY`.
2. Prossimo slice raccomandato per l'avanzamento ordinato di ASTRA:
   - **`CLOSURE_INSTRUCTION_READINESS`** (perimetro `FUNC-02` / `DATA-02`) oppure **`DOCUMENT_KIND_READINESS`** (perimetro `DOC-02` / `FUNC-02`).
3. Mantenere invariate le guardie di offline e le policy di non-contatto con gli ambienti remoti di staging e produzione.
