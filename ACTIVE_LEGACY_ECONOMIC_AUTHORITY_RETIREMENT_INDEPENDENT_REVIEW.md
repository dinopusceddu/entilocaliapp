# ACTIVE_LEGACY_ECONOMIC_AUTHORITY_RETIREMENT — INDEPENDENT REVIEW
## ARCH-01: Verifica indipendente della single economic authority FAD, canonical ledger, compatibility projection e retirement delle formule legacy

---

## Executive verdict

L'audit indipendente condotto sullo slice `ACTIVE_LEGACY_ECONOMIC_AUTHORITY_RETIREMENT` (finding target **ARCH-01**) attesta che la remediation implementata soddisfa integralmente e senza riserve il principio architetturale cardine:

> **ONE ACTIVE ECONOMIC AUTHORITY**
> Il Fondo Accessorio Dipendenti (FAD) possiede una sola ed unica authority economica di runtime: `canonicalFundLedger`.
> Qualsiasi altra struttura dati o vista è esclusivamente una proiezione canonica, un adattatore di compatibilità, oppure codice latente non raggiungibile a runtime.

Le verifiche forensi e le analisi statiche e dinamiche di reachability confermano:
1. **Ritiro del calcolo parallelo nel motore**: `fundEngine.ts` non invoca più `calculateFadTotals`; `constitution.sections` è popolato esclusivamente tramite `projectCanonicalFadSections(canonicalFund)`.
2. **Dettagli Fondo unificato**: `FundDetailsPage.tsx` legge direttamente il risultato canonico tramite `projectCanonicalFadSections` e `projectFadReport`, ignorando sezioni o subtotali legacy/stale.
3. **Pagina FAD priva di fallback**: `FondoAccessorioDipendentePage.tsx` riceve i totali unicamente dalla proiezione canonica; in assenza di `calculationResult`, la pagina entra in stato di attesa/indisponibilità senza eseguire formule locali o fallback numerici.
4. **Documenti e report moderni**: I servizi attivi di esportazione PDF e XLS utilizzano rigorosamente `fadCanonical`; il ramo di compatibilità legacy `fondoDipendenti` non viene mai letto.
5. **Codice legacy reso latente**: `calculateFadTotals` e i suoi helper di aggregazione possiedono **0 chiamanti runtime** nel codice di produzione.

Tutti i gate di controllo risultano **GREEN**:
- Full product suite Vitest: **1902/1902 PASS** su 139 test file (0 skipped)
- Matrice mirata: **74/74 PASS** (11 unit projection/census + 13 UI registry integration)
- Regressione consolidata: **8/8 PASS**
- Oracle normativo Wave 2: **14/14 PASS**
- Golden results: **Zero modifiche**
- TypeScript `tsc --noEmit`: **0 errori**
- `git diff --check`: **0 violazioni**
- Network: **STRICT OFFLINE** (0 tentativi di connessione esterna)

**Verdetto finale:**
- `RESULT = PASS`
- `ARCH_01_FINAL_STATUS = VERIFIED_FIXED`
- `ACTIVE_LEGACY_ECONOMIC_AUTHORITY_RETIREMENT = VERIFIED_FIXED`

---

## Baseline

La verifica di conformità dello stato git restituisce:
- **Branch**: `ux/toolbox-area-fondo-prototype`
- **HEAD commit**: `d3170f959b5815c514dbf3d6e5f93366a5f14c67`
- **Cached index**: pulito (`git diff --cached --name-status` vuoto)
- **Working tree**: working tree dirty intenzionale, identico alla baseline di handoff.

Stato ASTRA prima della review:
- `VERIFIED_FIXED` = 15
- `PARTIALLY_FIXED` = 7
- `OPEN` = 3
- `TOTAL` = 25
- `ASTRA_BLOCKERS_OPEN` = 0

Stato teorico con la chiusura di ARCH-01:
- `VERIFIED_FIXED` = 16
- `PARTIALLY_FIXED` = 6
- `OPEN` = 3
- `TOTAL` = 25
- `ASTRA_BLOCKERS_OPEN` = 0

*(Nota: la riconciliazione ASTRA ufficiale non è stata modificata durante questa review read-only).*

---

## Original ARCH-01 acceptance

Il finding `ARCH-01` evidenziava una grave divergenza architetturale (split-brain economico):
- Il calcolo canonico `canonicalFundLedger` produceva i totali del fondo dipendenti con regole normative aggiornate (CCNL 2024, DL 25, PNRR, Art. 60).
- Contemporaneamente, `calculateFadTotals` e `constitution.sections` calcolavano e pubblicavano totali aggregati concorrenti ed indipendenti.
- La pagina `FundDetailsPage` e la pagina `FondoAccessorioDipendentePage` esponevano valori calcolati da formule legacy differenti rispetto al ledger canonico.

L'accettazione originale richiede che `canonicalFundLedger` sia l'unica fonte di verità economica e che nessun consumer attivo ricavi i totali FAD da formule indipendenti.

Classificazione:
`ORIGINAL_ARCH01_ACCEPTANCE = SATISFIED`

---

## Original split-brain reproduction

Ricostruzione indipendente del controesempio noto:
- `MS2021` = 1.000.000 €
- `st_art58c1_CCNL2026_incremento014_MS2021` = 1.400 €

**Comportamento PRE**:
- `canonicalFundLedger`: parte stabile = 1.400 €
- `constitution.sections.stabili.total` (da `calculateFadTotals`): parte stabile = 0 €
- `FundDetailsPage`: mostrava 0 € nella sezione dettagliata
- Esportazioni che leggevano rami legacy: 0 €

**Comportamento POST verificato**:
- `canonicalFund.stableTotal`: 1.400 €
- `constitution.sections.stabili.total`: 1.400 €
- `FundDetailsPage`: 1.400 € sia nel riepilogo che nella riga analitica `CCNL_014_CURRENT`
- `FondoAccessorioDipendentePage`: 1.400 € sia nel riepilogo canonico che in `SOMMA RISORSE STABILI`
- `createReportViewModel.fadCanonical`: 1.400 €
- Esportazione PDF reale (testo estratto da buffer): 1.400 €
- Esportazione XLS reale (celle ricaricate con ExcelJS): 1.400 €

Il valore legacy divergente 0 € è ora ottenibile solo invocando esplicitamente nei test la funzione latente `calculateFadTotals`.

`ORIGINAL_SPLIT_BRAIN = FIXED`

---

## Canonical ledger integrity

Verifica di integrità tramite hash SHA-256 e git diff su:
- `src/logic/calculation/canonicalFundLedger.ts`
- `src/domain/canonicalFundLedger.ts`

Entrambi i file risultano **rigorosamente intatti** e byte-identici rispetto alla baseline PRE dello slice.
Nessuna formula economica del ledger è stata modificata per forzare la convergenza dei consumer.

`CANONICAL_LEDGER_FORMULAS = UNCHANGED`

---

## PRE authority graph

Il grafo PRE ricostruito evidenziava:
1. `canonicalFundLedger` (autorità economica canonica attiva)
2. `calculateFadTotals` in `fundCalculations.ts` (formula di aggregazione legacy indipendente attiva)
3. `constitution.sections` in `fundEngine.ts` (esposizione delle sezioni calcolate da `calculateFadTotals`)
4. Fallback locale in `FondoAccessorioDipendentePage.tsx` (invocazione locale di `calculateFadTotals`)
5. `FundDetailsPage.tsx` (consumo diretto di `constitution.sections`)

L'inventario del report PRE è completo e accurato: non risultano altri nodi di autorità economica indipendente non censiti.

`PRE_AUTHORITY_GRAPH = COMPLETE`

---

## POST authority graph

Il grafo architetturale POST implementato:
```
FundData (input utente / snapshot)
  │
  ▼
buildFadLedgerInputSections (solo normalizzazione atomica; section.total = 0)
  │
  ▼
buildCanonicalFundLedger (UNICA AUTORITÀ ECONOMICA ATTIVA)
  │
  ├──► CanonicalFundResult
  │      │
  │      ├──► projectCanonicalFadSections (proiezione canonica pura)
  │      │      ├──► dipendente.constitution.sections
  │      │      ├──► FundDetailsPage.tsx
  │      │      └──► FondoAccessorioDipendentePage.tsx
  │      │
  │      └──► projectFadReport / fadCanonical
  │             ├──► FundDetailsPage.tsx (dettaglio righe semantiche)
  │             ├──► modern PDF (services/documents/pdfReportService.ts)
  │             └──► modern XLS (services/documents/xlsReportService.ts)
```

Nessun ramo alternativo o indipendente produce o espone totali economici FAD nel runtime attivo.

`POST_AUTHORITY_GRAPH = SINGLE_AUTHORITY`

---

## calculateFadTotals reachability

Analisi globale di reachability della funzione `calculateFadTotals`:
- Definita in `src/logic/calculation/fundCalculations.ts`.
- Re-esportata in `src/logic/accessory.ts`.
- **Chiamanti runtime di produzione**: **0**.
- La funzione è invocata unicamente all'interno di test di regressione/caratterizzazione storica.
- Il re-export in `accessory.ts` non è importato da alcuna pagina, componente o servizio attivo.

`CALCULATE_FAD_TOTALS_RUNTIME_CALLERS = 0`
`CALCULATE_FAD_TOTALS_POST_ROLE = LATENT`

---

## Aggregate helper reachability

Verifica delle funzioni storiche di aggregazione utilizzate da `calculateFadTotals`:
- `totaleStabile_Dipendenti`
- `totaleVariabile_Dipendenti`
- `sommaVariabiliSoggette_Dipendenti`
- `sommaVariabiliNonSoggette_Dipendenti`
- `totaleRisorseDisponibiliContrattazione_Dipendenti`
- `altreRisorseDecurtazioniFinali_Dipendenti`

Tutte queste variabili/helper risiedono esclusivamente all'interno del corpo di `calculateFadTotals` in `fundCalculations.ts` e non possiedono esportazioni né chiamanti esterni.

`LEGACY_AGGREGATE_HELPER_RUNTIME_CALLERS = 0`

---

## Ledger input adapter

`buildFadLedgerInputSections`:
- Riceve i dati atomici FAD e restituisce le sezioni contenenti le sole righe normalizzate (`items`).
- Imposta esplicitamente `total: 0` su ogni sezione di input, fungendo unicamente da adattatore strutturale verso `buildCanonicalFundLedger`.
- Il ledger consuma esclusivamente gli `items` e non legge mai il campo `total` delle sezioni di input.
- Non calcola totali stabili o variabili, né decide la conformità.

`LEDGER_INPUT_ADAPTER = ATOMIC_ONLY`

---

## Constitution sections

In `src/logic/calculation/fundEngine.ts`:
```typescript
const dipendente: FundResult = {
  label: "Fondo Personale Dipendente",
  constitution: { sections: projectCanonicalFadSections(canonicalFund).sections },
  utilization: { sections: calculateUtilizationSections(distribuzione, normativeData) },
  summary: {
    totaleStabile: totaleStabileDip,
    totaleVariabile: totaleVariabileDip,
    totaleFondo: canonicalFund.verifiedTotal
  }
};
```
Le sezioni di costituzione sono popolate unicamente tramite `projectCanonicalFadSections(canonicalFund).sections`.
Nessun dato grezzo di `FundData` o calcolo di `calculateFadTotals` influenza `constitution.sections`.

`CONSTITUTION_SECTIONS_SOURCE = CANONICAL_ONLY`

---

## Projection pureness

La funzione `projectCanonicalFadSections`:
- È definita in `src/domain/canonicalFadProjection.ts`.
- Riceve come parametro unicamente `canonical: CanonicalFundResult | null | undefined`.
- Non importa né accede a `FundData`, `annualData`, `historicalData`, né a costanti di default o definizioni di campo grezze.
- È una funzione pura deterministica.

`CANONICAL_PROJECTION_INPUT = CANONICAL_ONLY`

---

## Final totals vs group subtotals

Verifica della provenienza dei totali finali nella proiezione:
- `stableTotal`: `model.status === 'VALID' ? canonical?.stableTotal ?? null : null`
- `variableTotal`: `model.status === 'VALID' ? canonical?.variableTotal ?? null : null`
- `total`: `model.authoritativeTotal` (che è `canonical?.total ?? null`)
- `verifiedTotal`: `model.verifiedTotal` (che è `canonical?.verifiedTotal ?? null`)
- `subject`: `model.status === 'VALID' ? canonical?.art23Subject ?? null : null`
- `excluded`: `model.status === 'VALID' ? canonical?.art23Excluded ?? null : null`

I totali finali derivano direttamente dalle proprietà del ledger canonico e **non vengono mai ricalcolati sommando i gruppi**.

`FINAL_TOTAL_SOURCE = DIRECT_CANONICAL`

---

## Projection group arithmetic

L'aritmetica interna di `projectCanonicalFadSections` per costruire i gruppi analitici (`vs_soggette`, `vn_non_soggette`, `variabili_indeterminate`):
- Filtra le righe del report canonico (`FadReportRow`) già validate da `projectFadReport`.
- Somma il campo `signedAmount` di tali righe per fornire i subtotali di visualizzazione delle sezioni.
- Non costituisce una seconda authority: se il canonico è `UNDETERMINED` o `INVALID`, `authoritativeTotal` della sezione è impostato a `null`.

`PROJECTION_GROUP_ARITHMETIC = DISPLAY_ONLY`

---

## Zero / missing / invalid

1. **UNDETERMINED**:
   Se il risultato canonico è `UNDETERMINED`:
   `total` della proiezione è `null`.
   I subtotali verificati (`verifiedTotal`, `verifiedStableTotal`, `verifiedVariableTotal`) restano esposti ma qualificati esplicitamente come tali.
   Nessun consumer attivo trasforma il subtotale in totale definitivo.
   `UNDETERMINED_PROJECTION = SAFE`
2. **INVALID**:
   Se lo stato è `INVALID`:
   `total` è `null`. I consumer visualizzano lo stato di non validità e non permettono la certificazione.
   `INVALID_PROJECTION = SAFE`
3. **VALID ZERO**:
   Se il canonico è valido con totale 0, tutti i consumer attivi visualizzano 0 €, anche in presenza di campi grezzi positivi o DTO di compatibilità obsoleti.
   `VALID_ZERO_STALE_LEGACY = PASS`
4. **Semantica Null vs Zero**:
   L'uso di `??` e `||` è stato verificato: nessun fallback trasforma un `null` non autoritativo in uno zero autoritativo. `value == null` produce esplicitamente `"Non determinabile"`.
   `CANONICAL_NULL_ZERO_SEMANTICS = PRESERVED`

---

## Compatibility key

In `src/domain/canonicalFadProjection.ts`:
- Per le righe con ID strutturato `LEGACY_FAD_RESOURCE:key`, la chiave compatibility `item.key` preserva la chiave atomica storica (es. `st_art79c1b_euro8450`) per retrocompatibilità di mapping nei test e nei locator UI.
- La riga mantiene il riferimento integrale alla voce canonica (`canonicalEntry: row`).
- L'importo, il trattamento Art. 23, la componente (stabile/variabile) e l'operazione derivano esclusivamente dalla voce canonica.

`COMPATIBILITY_KEY_ROLE = IDENTIFIER_ONLY`

---

## Initial full suite remediation

Nel primo run completo dei test si era verificato un fallimento (1901/1902) nel test `art79c1bMapping.test.ts`, dovuto all'assenza della chiave legacy `st_art79c1b_euro8450` all'interno dell'oggetto `item` della sezione.
La correzione ha preservato l'identificativo originario nella proprietà `key` (`row.id.slice('LEGACY_FAD_RESOURCE:'.length)`), mantenendo intatto l'importo canonico ed il test originario, senza alterare formule o logiche economiche.

`INITIAL_FULL_SUITE_REMEDIATION = COMPATIBILITY_FIX`

---

## FundDetails real route

`FundDetailsPage`:
- È registrata nel modulo `fundDetails` del `moduleRegistry`.
- È raggiungibile tramite sidebar `FONDO`, issue navigation (`relatedPage: 'fundDetails'`), e CTA consultativa per esercizi chiusi.
- Quando montata attraverso il registry reale con il controesempio 1.400 €, la pagina visualizza:
  - Totale Risorse Fondo Dipendenti: 1.400 €
  - Risorse Stabili: 1.400 €
  - Dettaglio voce `CCNL_014_CURRENT`: 1.400 €
- Non legge più le sezioni legacy concorrenti.

`FUND_DETAILS_REAL_ROUTE = CANONICAL`
`FUND_DETAILS_CANONICAL_CONSISTENCY = PASS`

---

## All-funds FAD component

In `FundDetailsPage.tsx`:
```typescript
const allFundsVerifiedTotal = fad.verifiedTotal === null ? null : FinancialMath.sumAll(
  fad.verifiedTotal, fondi.eq.summary.totaleFondo, fondi.segretario.summary.totaleFondo,
  fondi.dirigenza.summary.totaleFondo,
);
```
Il totale complessivo di tutti i fondi compone la quota FAD derivandola unicamente da `fad.verifiedTotal`. Gli altri fondi (EQ, Segretario, Dirigenza) mantengono i rispettivi subtotali senza alterazioni.

`ALL_FUNDS_FAD_COMPONENT = CANONICAL`

---

## FAD page real route & result-absent behavior

`FondoAccessorioDipendentePage`:
- Registrata nel modulo `fondoDipendenti` del `moduleRegistry`.
- Utilizza la proiezione canonica memoizzata:
  `const fadProjection = React.useMemo(() => projectCanonicalFadSections(state.calculationResult?.canonicalFund), [state.calculationResult?.canonicalFund]);`
- **Comportamento in assenza di risultato (`calculationResult = undefined`)**:
  - Mostra il messaggio accessibile: `"Risultato canonico non disponibile. Calcolo in attesa; nessun totale economico disponibile."`
  - I totali delle sezioni mostrano `"Non disponibile"`.
  - Non invoca `calculateFadTotals`, non esegue ricalcoli locali e non produce totali di ripiego.
  - I campi di input restano visualizzati e compilabili.

`FAD_PAGE_REAL_ROUTE = CANONICAL`
`FAD_PAGE_NO_RESULT = UNAVAILABLE_NO_FALLBACK`
`RAW_INPUT_ROWS = SOURCE_ONLY`

---

## Report view model

In `src/presenters/reportPresenter.ts`:
- `createReportViewModel` produce il ramo `fadCanonical` (proiezione canonica) ed il ramo `fondoDipendenti` (compatibilità legacy).
- L'audit sui writer di report attivi (`pdfReportService.ts` e `xlsReportService.ts` in `src/services/documents/`) dimostra che entrambi leggono esclusivamente `fadCanonical`.
- Il ramo `fondoDipendenti` è confermato come LATENT: i test di avvelenamento (getter che lancia eccezione) passano senza interruzioni.

`LEGACY_REPORT_BRANCH_ACTIVE_CONSUMERS = 0`

---

## Modern PDF / XLS / documents

1. **Modern PDF** (`src/services/documents/pdfReportService.ts`):
   Utilizza `model.fadCanonical`. Non accede a `model.fondoDipendenti`.
   `MODERN_PDF_LEGACY_DEPENDENCE = ABSENT`
2. **Modern XLS** (`src/services/documents/xlsReportService.ts`):
   Utilizza `model.fadCanonical`. Non accede a `model.fondoDipendenti`.
   `MODERN_XLS_LEGACY_DEPENDENCE = ABSENT`
3. **Determina / Relazione / Prospetto** (`src/services/documents/documentFactory.ts`):
   Tutti i modelli documentali moderni generano il fondo basandosi sulla proiezione canonica.
   `MODERN_DOCUMENT_FAD_AUTHORITY = CANONICAL`
4. **Tabella 15** (`src/logic/calculation/tabella15Mapper.ts`):
   Mappa i dati FAD a partire dalle voci del `canonicalFund`.
   `TABELLA15_FAD_AUTHORITY = CANONICAL`

---

## Root legacy services

L'analisi statica e AST di importazione conferma che:
- `src/services/pdfReportService.ts` (root) -> 0 chiamanti runtime (LATENT)
- `src/services/pdfReportService2.ts` (root) -> 0 chiamanti runtime (LATENT)
- `src/services/xlsReportService.ts` (root) -> 0 chiamanti runtime (LATENT)
- `generateDeterminazioneTXT` in `reportService.ts` -> 0 chiamanti runtime (LATENT)

`ROOT_PDF_SERVICE = LATENT`
`ROOT_PDF2_SERVICE = LATENT`
`ROOT_XLS_SERVICE = LATENT`
`LEGACY_TXT_SERVICE = LATENT`

---

## Dynamic reachability

L'audit AST eseguito dallo script `arch01_retirement_evidence/authority-census.mjs` su 287 file di produzione TypeScript/TSX:
- Zero `import(...)` dinamici a runtime.
- Zero riferimenti riflessivi o tramite string map ai servizi root o a funzioni in pensione.
- I due soli riferimenti dinamici trovati nel codebase sono type expressions all'interno del catalogo schemi.

`DYNAMIC_REACHABILITY_AUDIT = PASS`

---

## Home / chart, Checklist / chat context

1. **HomePage / FundAllocationChart**:
   Non sono mappate in alcun percorso o menu attivo (`moduleRegistry` e sidebar non contengono route verso di esse). Sono elementi LATENT.
   `HOME_CHART_REACHABILITY = LATENT`
2. **ChecklistPage / ChatWindow**:
   Utilizzano il risultato del calcolo canonico dal contesto (`calculationResult.canonicalFund`).
   `CHECKLIST_CHAT_FAD_SOURCE = CANONICAL`

---

## Cabina / Distribution

1. **Cabina di Regia**:
   Il read model di costituzione FAD deriva direttamente dal ledger canonico. Non legge le sezioni legacy come authority.
   `CABINA_FAD_AUTHORITY = CANONICAL`
2. **Distribuzione Risorse**:
   Il budget FAD per la contrattazione integrativa deriva da `resolveDistributionFundBudget(canonicalFund)`.
   Nessuna regressione riscontrata.
   `DISTRIBUTION_FAD_AUTHORITY = CANONICAL`

---

## Closure calculations

La funzione `calculateYearClosureCarryForward` in `src/logic/calculation/closureCalculations.ts`:
- Calcola `leftoverFad` confrontando le risorse destinate con quelle utilizzate per ricavare i residui di contrattazione.
- Non calcola la costituzione del fondo e non rappresenta una seconda autorità di costituzione FAD.

`CLOSURE_CALCULATION_ROLE = DISTRIBUTION_ONLY`

---

## PNRR / DL25 / Art60 projections

1. **PNRR**:
   Un importo PNRR grezzo positivo (3.000 €) in assenza di requisiti/decisione validata produce una voce con stato `UNDETERMINED`. Nessun totale definitivo di 3.000 € viene esposto in `FundDetails` o `FAD page`. Con requisiti validati, la voce canonica di 3.000 € viene proiettata esattamente una sola volta.
   `PNRR_RAW_BYPASS = ABSENT`
   `PNRR_VALID_PROJECTION = PASS`
2. **DL25**:
   Lo stock cumulato (es. 4.000 € pregresso + 15.000 € delta = 19.000 €) viene proiettato esattamente una volta come risorsa stabile in tutte le viste attive.
   `DL25_CANONICAL_PROJECTION = PASS`
3. **Art. 60**:
   La decurtazione (127,44 € nel 2026) compare una sola volta come detrazione economica. L'eventuale voce figurativa Art. 23 non compare nelle righe economiche del fondo. Nel 2025 l'importo è proiettato correttamente a 0 €.
   `ART60_PROJECTION = PASS`

---

## Legacy test expectation changes

I tre test modificati:
1. `src/domain/__tests__/fadReportReadModel.test.ts`
2. `src/services/__tests__/canonicalFadXlsx.test.ts`
3. `src/services/__tests__/canonicalFundSummaryPdf.test.ts`

hanno aggiornato unicamente l'aspettativa sul contenuto della vecchia proprietà legacy `constitution.sections` (che precedentemente conteneva il dato errato di 127,44 € e totale 2.000 € per il 2025 anziché 0 €).
Gli input di test, le asserzioni canoniche (presenza degli importi 2.000 € e 1.400 € nei PDF e negli XLSX) e i risultati finali sono rimasti invariati.

`LEGACY_TEST_EXPECTATION_UPDATES = LEGITIMATE`

---

## Whole-entity Art23

Il confronto delle 8 fixture consolidare tra PRE e POST conferma:
- Totali di perimetro intero ente, componenti EQ, Segretario, Dirigenza e straordinario identici.
- Calcolo del tetto e margine di rispetto dell'Art. 23 c. 2 inalterati.
- Conformità (`isCompliant`) identica per tutte le fixture.

`WHOLE_ENTITY_ART23 = UNCHANGED`

---

## Dirigenza isolation

Nessuna voce di finanziamento o componente della Dirigenza viene immessa nel ledger del fondo accessorio dipendenti. La Dirigenza partecipa esclusivamente al limite aggregato ente Art. 23 c. 2.

`DIRIGENZA_FAD_CONTAMINATION = ABSENT`

---

## DATA-01 empty state & CLOSED

1. **Empty entity**:
   Un nuovo ente vuoto non riceve valori economici fittizi. Il totale canonico FAD è non autoritativo (`null`). `FundDetails` e `FAD page` indicano stato non determinabile senza inventare zeri autoritativi.
   `EMPTY_ENTITY_ARCH01 = SAFE`
2. **CLOSED snapshot**:
   In stato `CLOSED`, `FundDetails` è in sola lettura e la pagina FAD presenta campi disabilitati. Nessuna scrittura o salvataggio della proiezione viene eseguita a DB.
   `CLOSED_PROJECTION = READ_ONLY`
3. **Stale legacy snapshots**:
   Il caricamento di snapshot contenenti vecchi totali legacy divergenti ma dati atomici validi viene governato esclusivamente dal calcolo canonico. I dati legacy stale vengono ignorati.
   `STALE_LEGACY_SNAPSHOT = CANONICAL_WINS`
4. **Real snapshot probe**:
   I 4 snapshot estratti dal backup reale offline producono risultati economici canonici identici tra PRE e POST. Il blocco per scelta Art. 33 mancante è preservato intatto.
   `REAL_SNAPSHOT_PROBE = PASS`

---

## Runtime no-canonical branch & Transient calculationResult

1. **No-canonical result**:
   Il motore attivo produce sempre l'oggetto `canonicalFund`. I rami di fallback per DTO privi di canonico risiedono esclusivamente nei presenter di test sintetici.
   `RUNTIME_NO_CANONICAL_RESULT = UNREACHABLE`
2. **Transient state**:
   Durante il cambio d'anno o il caricamento, quando `calculationResult` è temporaneamente non presente, le pagine attive entrano in stato di attesa/caricamento e non eseguono formule legacy.
   `TRANSIENT_RESULT_GAP = SAFE`

---

## Section status contract & UX

1. **Consumo dello status**:
   I consumer attivi (`FundDetailsPage`, `FondoAccessorioDipendentePage`) verificano esplicitamente se `status !== 'VALID'` prima di mostrare i valori.
   `SECTION_STATUS_CONSUMERS = SAFE`
2. **Etichettatura dei totali**:
   Quando lo stato non è `VALID`, i subtotali sono chiaramente etichettati come `"Subtotale verificato"`, mentre il totale finale è indicato come `"Non determinabile"`. Non viene mai esposto un falso totale definitivo.
   `SECTION_TOTAL_LABELING = QUALIFIED`
   `FUND_DETAILS_UNDETERMINED_DISPLAY = SAFE`
   `FAD_PAGE_UNDETERMINED_DISPLAY = SAFE`
   `DOCUMENT_UNDETERMINED_FAD = SAFE`

---

## Independent authority census

L'audit indipendente eseguito sui sorgenti (`src/`) conferma il censimento Codex:
- `ACTIVE_DUPLICATE_FAD_RULES = 0`
- `ACTIVE_INDEPENDENT_FAD_FORMULAS = 0`
- `ACTIVE_LEGACY_ECONOMIC_AUTHORITIES = 0`
- `ACTIVE_FAD_FALLBACK_AUTHORITIES = 0`
- `INDEPENDENT_CENSUS_MATCH = YES`
- `AUTHORITY_CENSUS_QUALITY = HIGH_CONFIDENCE`

---

## Test harness & Real export evidence

1. **Projection test harness**:
   Esercita `projectCanonicalFadSections` con istanze canoniche reali derivate dal motore e con fixture tipizzate.
   `PROJECTION_TEST_HARNESS = REAL_CANONICAL`
2. **UI test harness**:
   Verifica i componenti montati tramite il vero registro moduli (`getModuleById`), simulando click utente, espansione delle sezioni ed ispezione dei nodi DOM.
   `UI_TEST_HARNESS = PASS_HIGH_CONFIDENCE`
3. **Real export evidence**:
   I file `014.xlsx`, `014.pdf`, `mixed.xlsx`, `mixed.pdf`, `zero.xlsx`, `zero.pdf` sono stati generati fisicamente dai writer di produzione, salvati e ricaricati verificando i dati serializzati.
   `REAL_EXPORT_EVIDENCE = PASS`

---

## Product suite / Regression / Oracle / Lints

1. **Full product suite**:
   - 1902 test passati su 1902 (139 file, 0 skipped).
   `FULL_PRODUCT_SUITE = PASS`
2. **Regression consolidata**:
   - 8 fixture su 8 passate con successo.
   `REGRESSION = 8/8_PASS`
3. **Oracle normativo**:
   - 14 controlli su 14 passati con successo.
   `ORACLE_INTEGRITY = UNCHANGED_PASS`
4. **TypeScript & Diff Check**:
   - `npx tsc --noEmit`: 0 errori. (`TYPESCRIPT = PASS`)
   - `git diff --check`: 0 violazioni di whitespace o formattazione. (`DIFF_CHECK = PASS`)

---

## Verified-fixed regressions

Nessuna regressione su tutti i finding precedentemente chiusi:
- `SEC_01_REGRESSION = NONE`
- `DATA_01_REGRESSION = NONE`
- `DATA_02_REGRESSION = NONE`
- `CALC_01_REGRESSION = NONE`
- `CALC_02_REGRESSION = NONE`
- `CALC_03_REGRESSION = NONE`
- `CALC_04_REGRESSION = NONE`
- `CALC_05_REGRESSION = NONE`
- `DOC_01_REGRESSION = NONE`
- `DOC_02_REGRESSION = NONE`
- `NORM_01_REGRESSION = NONE`
- `NORM_03_REGRESSION = NONE`
- `NORM_04_REGRESSION = NONE`
- `FUNC_01_REGRESSION = NONE`
- `FUNC_02_REGRESSION = NONE`

`ASTRA_BLOCKERS_OPEN = 0`

---

## Latent cleanup debt

Il codice storico non più attivo (`calculateFadTotals`, root `pdfReportService.ts`, root `xlsReportService.ts`, `generateDeterminazioneTXT`, proprietà legacy `fondoDipendenti` nel report view model) è dimostrato essere completamente inattivo e non raggiungibile a runtime. La sua permanenza temporanea come debito tecnico non compromette la correttezza architetturale.

`LATENT_CLEANUP_DEBT = ACCEPTABLE`

---

## Scope integrity

L'audit sui file modificati conferma:
- File di produzione modificati: 5 (`fundEngine.ts`, `fundCalculations.ts`, `canonicalFadProjection.ts`, `FundDetailsPage.tsx`, `FondoAccessorioDipendentePage.tsx`).
- File di test nuovi o aggiornati: 5.
- Nessun file estraneo modificato: canonical ledger, PNRR, DL25, Dirigenza, DATA-01, Auth, golden, oracle e migrazioni sono rigorosamente invariati.

`SCOPE_INTEGRITY = PASS`

---

## ARCH-01 final decision

Tutti i 53 requisiti di accettazione e di conformità architetturale risultano verificati:
`ARCH_01_FINAL_STATUS = VERIFIED_FIXED`
`ACTIVE_LEGACY_ECONOMIC_AUTHORITY_RETIREMENT = VERIFIED_FIXED`

---

## Updated ASTRA count

In virtù della risoluzione e verifica di ARCH-01:
- `VERIFIED_FIXED` = 16
- `PARTIALLY_FIXED` = 6
- `OPEN` = 3
- `TOTAL` = 25
- `ASTRA_BLOCKERS_OPEN` = 0

---

## Next recommended slice

Con la convergenza e unificazione della single economic authority in `canonicalFundLedger`, la principale vulnerabilità architetturale residua per l'integrità dei dati finanziari risiede al confine di immissione dell'utente.

**Prossimo slice raccomandato**:
`MONETARY_INPUT_BOUNDARY` (target **DATA-03**, P1).

**Razionale**:
Il finding `DATA-03` è attualmente `PARTIALLY_FIXED`. L'assenza di una validazione e coercizione sistematica e protetta sui campi monetari (prevenzione di valori NaN, stringhe non parseabili, decimali imprevisti o valori negativi in campi non decurtativi) rappresenta il rischio operativo residuo più elevato di corruzione del calcolo o crash dell'interfaccia. La stabilizzazione del boundary monetario metterà in sicurezza l'intero ciclo di vita economico prima di procedere con i successivi slice normativi e di persistenza.

---
