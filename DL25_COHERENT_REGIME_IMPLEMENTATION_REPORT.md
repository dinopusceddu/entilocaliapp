# DL25_COHERENT_REGIME — preflight and implementation report

Data della verifica: 5 ottobre 2026. Esecuzione strettamente offline.

## Executive verdict

**RESULT = BLOCKED. Nessuna implementazione produttiva eseguita.** È stato applicato lo STOP della sezione 25 del prompt: `DL25_CARRY_FORWARD_POLICY_AMBIGUITY`.

La regola normativa è chiara: il plafond determinato sulla base 2025 può essere utilizzato gradualmente, ma non ricreato integralmente in ogni annualità. Non è invece determinabile dal contratto applicativo attuale se gli importi DL25 salvati rappresentino un incremento della singola annualità, un valore strutturale cumulativo, oppure una componente già incorporata nella base stabile. È questa distinzione sui dati esistenti, non la regola normativa, a impedire un'implementazione senza una nuova assunzione.

Le acceptance restano separate:

| Sub-slice | Verdict | Implementazione | Finding dopo questa esecuzione |
|---|---|---|---|
| DL25_NET_GROSS_MARGIN | BLOCKED | NOT_IMPLEMENTED, arresto al preflight della wave | CALC-03 OPEN |
| DL25_TEMPORAL_REGIME | BLOCKED | NOT_IMPLEMENTED, arresto al preflight della wave | NORM-03 OPEN |
| DL25_BASE_YEAR_LABELS | BLOCKED | NOT_IMPLEMENTED, contratto di riporto non determinabile | NORM-04 OPEN |

Non si afferma che CALC-03 o NORM-03 abbiano una root cause ambigua: i loro difetti sono riprodotti. Nessun finding è candidato a VERIFIED_FIXED; reconciliation ASTRA immutata. Lo STOP esplicito è stato interpretato come arresto dell'implementazione della wave prima delle modifiche al codice, non come autorizzazione a inventare il contratto dei dati persistiti.

## Baseline

Prima di qualunque scrittura sono stati eseguiti i cinque comandi prescritti: branch, HEAD, status completo, diff unstaged e diff staged.

- BRANCH: `ux/toolbox-area-fondo-prototype`.
- HEAD: `d3170f959b5815c514dbf3d6e5f93366a5f14c67`.
- Staged: vuoto.
- Working tree: numerose modifiche locali e file untracked preesistenti, conservati.
- Inventario PRE: 1.083 file tracked/untracked non ignorati, SHA-256 dei byte effettivi del working tree; nessuna ricostruzione da HEAD.

Evidenze in `dl25_coherent_regime_evidence/`. L'inventario esclude file ignorati, dipendenze e internals `.git`; comprende sorgenti, fixture, golden, oracle, materiale normativo, evidenze storiche e untracked pertinenti. I log e il runner di verifica sono stati inizialmente creati nella directory temporanea dedicata, esterna al repository.

## Normative preflight

Letture locali precedenti alle modifiche produttive, che non sono avvenute:

- `ASTRA_NORMATIVE_MATRIX.md`: N04/N05/N09/N13 e matrice dei consumer.
- `ASTRA_TEST_MATRIX.md`: controesempio T29 e regole congelate.
- `ASTRA_25_FINDINGS_CURRENT_STATE_RECONCILIATION.md`: sezioni CALC-03, NORM-03, NORM-04.
- `ASTRA_25_FINDINGS_CURRENT_STATE_RECONCILIATION_INDEPENDENT_REVIEW.md`: conferma dei tre OPEN.
- `PNRR_ZERO_AND_MISSING_CAP_INDEPENDENT_REVIEW.md`: stato consolidato 10/8/7 e isolamento del generatore di evidenze.
- `astra_evidence/run_20260921/sources/RGS175706.txt`: nota MEF 175706 del 27/06/2025, §§2.1–2.3 e 3; copia locale PDF disponibile, testo estratto utilizzato.
- Probe ASTRA `supplement_probes.ts`, risultati congelati e test DL25/trasferimento esistenti.

Il contratto normativo dell'allegato è stato usato come authority congelata, senza ricerca internet o attestazione autonoma di vigenza. Il contratto di unità e quello temporale sono verificati rispetto alle fonti locali; il contratto applicativo di riporto è incompleto.

## Art.14 comma 1-bis contract

Dal 2025, facoltà di Regioni, Città metropolitane, Province e Comuni. Incremento strutturale in deroga all'art.23, comma 2, subordinato al rispetto dell'art.33 e all'equilibrio pluriennale asseverato. Massimo teorico, sostenibilità e importo scelto sono concetti distinti.

La nota MEF, §2.3, pagg.7–9, consente il frazionamento in più annualità entro lo stesso valore complessivo. L'utilizzo completo nel 2025 non permette di riaprire il plafond DL25 negli anni successivi; gli incrementi contrattuali futuri hanno titolo distinto.

## 48 percent formula

`plafondNetto = max(0, 0.48 * TAB2023 - CS2025 - EQ2025 - rettifichePertinenti)`.

Con TAB2023=300.000, CS=100.000, EQ=20.000: soglia=144.000, margine netto=24.000. Il rapporto è 48%, mai 4,8%. La nota MEF esclude straordinario e distingue gli oneri dell'ente dalle risorse del Fondo.

## Net vs gross unit model

Target ricostruito: margine48 in `NET_FUND_AMOUNT`; margini Art33 e L296 in `GROSS_EMPLOYER_COST`. Solo gli ultimi devono essere divisi per `1 + oneri/100` prima del minimo.

Il simulatore dispone già di `simPercentualeOneriIncremento`; 1,274 non è una costante normativa universale. Corrisponde all'input 27,4%; la nota richiede anche la considerazione dell'INAIL. Il contratto condiviso `src/utils/financialMath.ts` usa Big.js, DP=20 e arrotondamento half-up. L'implementazione futura deve mantenere Big.js attraverso conversione e minimo e arrotondare il risultato finale ai centesimi, documentando i valori intermedi.

## CALC-03 root cause

`src/logic/calculation/fundEngine.ts:66`: `calculateSimulazione` calcola un minimo tra margine48 netto e margini finanziari lordi, poi divide tutto per il coefficiente degli oneri. Il nome `fase1_incrementoPotenzialeLordo` è inoltre semanticamente errato per il margine48.

Probe offline di questa esecuzione: actual **18.838,304552590267**, expected congelato **24.000**. Il caso finanziario vincolante richiede invece 12.740 lordo / 1,274 = **10.000 netto**. Root cause confermata, correzione non applicata per STOP del preflight.

## CALC-03 implementation

NOT_IMPLEMENTED. Nessun helper nuovo, nessun cambiamento al motore, nessuna acceptance C1–C6 dichiarata soddisfatta. Non sono stati modificati test o expected per occultare il difetto. Il probe è una caratterizzazione della baseline, non un test di chiusura del finding.

## DL144 temporal contract

Dal **2026-08-08**, L296 commi 557–557-quater e 562 non partecipa al minimo per amministrazioni soggette ad Art33. Il giorno 2026-08-07 conserva il regime storico. La deroga non elimina Art33 né modifica il limite Art23 negli altri percorsi.

## Art33 subject scope

Authority disponibile: `src/logic/shared/art33ApplicationPolicy.ts`, `resolveArt33ApplicationPolicy` / `resolveArt33AnnualDataPolicy`, con risultato APPLY/SKIP/BLOCK e classificazione canonica prioritaria rispetto al fallback legacy. Include territorialità e decisione manuale. Non è stata introdotta una seconda authority soggettiva né modificata la policy condivisa.

Nessun `ART33_SUBJECT_SCOPE_CONTRACT_GAP` è stato dichiarato in questa esecuzione: il blocco riscontrato riguarda il riporto DL25. I test esistenti della policy sono inclusi nella suite baseline.

## Effective-date model

La firma corrente del simulatore riceve input economici, abitanti e tipo ente; non riceve una data business. Nei campi DL25 non è presente `regimeDate`, `dataIstruttoria` o `dataSimulazione`. `updatedAt` è un timestamp tecnico di salvataggio, non una authority normativa. Le date degli atti in `documentMetadata` non sono automaticamente la data dell'istruttoria del simulatore.

Nessun campo introdotto. Nessun utilizzo di Date.now/new Date per decidere il regime DL25 introdotto dalla wave.

## Legacy date handling

Target: anno 2025 storico; 2027 post-riforma per ente soggetto; 2026 senza data richiede UNDETERMINED se L296 cambia il risultato. Un risultato identico nei due regimi può essere conservato spiegando l'indifferenza. Nessun fallback a data corrente o al 31 dicembre del 2026 è autorizzato.

Comportamento attuale: L296 è sempre incluso, anche senza data. Il probe trasmette intenzionalmente date aggiuntive tramite cast per dimostrare che la firma corrente le ignora; non si tratta di date business attualmente supportate.

## NORM-03 implementation

NOT_IMPLEMENTED. Probe sul dataset 2026 con L296=0: risultato attuale **0** per 07/08, 08/08 e 09/08. Il target post-riforma è 24.000 con gli altri margini capienti. Nessuna acceptance N1–N8 dichiarata soddisfatta.

## Base-year reconstruction

I campi DL25 effettivi del Wizard sono `fondoStabile2025Certificato`, `budgetEq2025`, `altreRisorse2025DaSottrarre`; non vanno confusi con `annualData.ccnl2024.fondoPersonale2025` / `fondoEQ2025`, che il mapping CCNL usa anche per le basi proporzionali 2024. Correggere questi ultimi allargherebbe lo scope ad ARCH-01/NORM-02.

La nota MEF rende determinabile la base amministrativa fissa 2025 (categoria A), ma non determina il significato degli importi DL25 già salvati dall'applicazione. `Dl25IncrementInput` non riceve anno di istruttoria né storico degli utilizzi del plafond. `calculateDl25Increment` restituisce il plafond della base inserita; non restituisce un residuo pluriennale qualificato.

Evidenze applicative del blocco:

- `src/features/wizard2026/types.ts:117`: stato DL25 senza campo per incremento cumulativo incorporato, esercizio di origine o attestazione di mancato utilizzo precedente.
- `src/logic/wizard2026/dl25Increment.ts:303`: stessa formula sulla base2025; nessuna sottrazione degli utilizzi anteriori qualificati.
- `src/features/wizard2026/transfer/transferPreviewEngine.ts:552`: `incrementoApplicato` scrive `st_incrementoDL25_2025`; non è distinto un delta annuale da uno stock strutturale cumulativo.
- `src/logic/calculation/canonicalFundLedger.ts:27`: il campo è classificato `DL25_CURRENT`; non fornisce una ricostruzione del riporto tra annualità.
- `src/features/wizard2026/transfer/__tests__/transferPreviewEngine.test.ts:266`: idempotenza di due trasferimenti nella stessa annualità. Il successivo caso sostituisce 4.000 con 15.000; non prova se, tra annualità, sia corretto mantenere 4.000 e aggiungere 15.000 o sostituire il totale cumulativo con 15.000.
- `src/application/snapshots/snapshotWorkflow.ts:142`: una nuova annualità riceve `defaultFundData`; nessuna provenance degli utilizzi DL25 anteriori è ricostruita da questo flusso.

Il probe con la medesima base restituisce 24.000 per ciascun anno aggiuntivo 2025/26/27, ignorato dalla firma attuale. Non dimostra un doppio incremento realmente salvato; dimostra che questo calcolo non può stabilire il residuo in presenza di utilizzi anteriori.

Decision table prima dell'implementazione:

| Istruttoria | Denominatore | Base stabile / EQ | DL25 già incorporato | Ulteriore margine | Art60 | Label coerente attesa |
|---|---|---|---|---|---|---|
| 2025 | TAB2023 | CS2025 certificato ante DL25 / EQ2025 | Distinguere eventuale quota2025 già stanziata; contratto persistito non esplicito | Plafond meno quota già utilizzata, da qualificare | Nessuna riduzione2025 | Fondo stabile 2025; EQ2025 |
| 2026 | TAB2023 | Stessa baseline amministrativa2025 | Utilizzi2025 strutturali; presenza nella base/stanza non qualificata | Residuo complessivo meno utilizzi anteriori; non determinabile dai soli campi attuali | Computo figurativo secondo NORM-01, senza nuova risorsa | Base amministrativa2025; quota già utilizzata con provenance |
| 2027 | TAB2023 | Stessa baseline amministrativa2025 | Utilizzi cumulativi2025/26; contratto applicativo non determinato | Medesima regola cumulativa, non un nuovo plafond | Contratto Art60 consolidato2026 esistente | Base amministrativa2025; quota cumulativa qualificata |

La tabella normativa è coerente; le celle applicative mancanti impediscono la tabella operativa completa richiesta dalla sezione24. Non sono state riempite con 0, anno precedente o una reinterpretazione degli snapshot.

## 2023 denominator

Confermato dal §2.1/§2.2 della nota e dalla formula attuale 0,48. Nessuna modifica necessaria al coefficiente o al denominatore. Il denominatore non diventa annoIstruttoria−1.

## 2025 administrative-base semantics

`fondoStabile2025Certificato` = CS2025 ricostruito secondo MEF §2.3 lettera a, inclusa la distinzione delle decurtazioni temporanee; `budgetEq2025` = remunerazione EQ2025 (§2.3 lettera b). Non sono campi dinamici Y−1.

`DL25_BASE_YEAR_POLICY_AMBIGUITY = NO` per la baseline normativa; `DL25_CARRY_FORWARD_POLICY_AMBIGUITY = YES` per l'interpretazione della base e degli incrementi preesistenti negli snapshot applicativi. Non è stato assunto che il campo generico `altreRisorse2025DaSottrarre` rappresenti automaticamente lo storico cumulativo DL25.

## Art60 figurative adjustments

NORM-01 preservato. `calculateConglobamentoArt60` restituisce 0 prima del 2026; dal 2027 richiede la base consolidata2026 secondo il contratto esistente. Una componente figurativa serve alla comparabilità e non rende disponibile una nuova risorsa. La baseline MEF2025 non va automaticamente ridotta una seconda volta per Art60. La spiegazione coordinata nelle viste DL25 rimane da implementare dopo il gate; nessuna modifica ad Art60.

## NORM-04 implementation

NOT_IMPLEMENTED per STOP. L'errore Y−1 dello Step3 e la label 4,8% dello Step8 sono confermati. Nessuna correzione cosmetica isolata è presentata come chiusura del contratto annuale completo. Acceptance B1–B8 non dichiarata soddisfatta.

## Step3

`Step3Dl25.tsx:53` deriva le label della base da annoIstruttoria−1: 2024/2025/2026 nelle istruttorie2025/26/27. Le formule visibili seguono la stessa label dinamica. L'hook `useWizard2026Draft.ts:454` continua invece a passare campi base2025. Percorso letto, non modificato.

## Simulatore

`SimulatoreIncrementoForm.tsx:29` chiama il motore attraverso il re-export pubblico. Input stabile/EQ descritti come anno di applicazione, unità48 chiamata lordo, minimo misto e divisione successiva confermano CALC-03. Nessuna auto-assegnazione del massimo al Fondo: il simulatore espone un potenziale e il trasferimento usa un importo scelto. La formulazione finale può sembrare troppo conclusiva rispetto ai requisiti pluriennali; il Wizard e la validazione trasferimento già rappresentano l'equilibrio, per cui non viene dichiarata una totale assenza del modello né creato un workflow documentale.

## Step8

`Step8RiepilogoPreview.tsx:358`: unica occorrenza attiva trovata di `4,8%` nei sorgenti ricercati. Formula reale 0,48, label errata. Nessuna modifica alla formula. Report factory e consumer di altri finding intatti.

## Cross-view consistency

NON VERIFICATA COME CORRETTA. Differenze confermate: base fissa2025 del core contro label Y−1 dello Step3; 48% contro 4,8% dello Step8; massimo teorico netto del Wizard contro risultato convertito due volte nel simulatore. Mapping letto: massimo istruttorio e importo applicato separati. La concordanza sul residuo pluriennale non può essere attestata senza contratto di riporto.

## Persistence

Nessun nuovo campo, nessuna migration, nessuna normalizzazione o riscrittura degli snapshot. Sono passati i test baseline di salvataggio/caricamento e sync del Wizard inclusi nella suite; non equivalgono a un nuovo test save/reload di regimeDate, che non è stato introdotto. L'esecuzione non ha usato Supabase reale.

## CLOSED

Percorsi CLOSED intatti. Nessun calcolo consultivo o persistito nuovo. Le regressioni baseline verificano i guard esistenti; nessun write-back effettuato su annualità chiuse.

## Tests

Verifica della baseline, non della remediation. Runner locale temporaneo con plugin React e configurazione test di prodotto equivalente: globals/jsdom/setupTests, solo `src/**/*.{test,spec}.*`, isolamento, massimo4 worker. È escluso soltanto il generatore `wave3HardeningEvidence.test.ts` (7 casi), oltre ai runner audit esterni a src. `wave3UiWiring.test.tsx` rimane incluso e isola già i suoi export in temp.

Comandi effettivi: binari locali `node_modules/vitest/vitest.mjs`, `node_modules/typescript/bin/tsc --noEmit --incremental false`, `node_modules/vite-node/vite-node.mjs` per regression/oracle/probe. Nessun npm/npx/registry.

Tutti i processi Node e worker hanno caricato `scripts/pnrr-offline-guard.cjs` mediante NODE_OPTIONS. Le richieste di lettura del progetto di esbuild hanno richiesto il profilo di esecuzione esteso dopo un access denied del sandbox; la guard di rete è rimasta attiva. La versione locale di Vitest non supporta `--exclude`: l'esclusione è stata impostata nel runner temporaneo prima di eseguire qualunque test. Il primo tentativo con NODE_OPTIONS a percorso Windows aveva errori di quoting e non ha avviato test; corretto usando il percorso relativo. Questi tentativi non sono test funzionali falliti.

Gli esiti definitivi sono riportati nell'output terminale e nei log allegati. Nessun test nuovo C/N/B o test di chiusura aggiunto dopo lo STOP. Il probe temporaneo caratterizza i difetti senza modificare fixture o golden.

## Regression of VERIFIED_FIXED findings

Lo stato consolidato fornito è 10 VERIFIED_FIXED / 8 PARTIALLY_FIXED / 7 OPEN, ASTRA_BLOCKERS_OPEN=0. Non è aggiornato. SEC-01, DATA-02, CALC-01, CALC-02, CALC-05, DOC-01, DOC-02, NORM-01, FUNC-01 e FUNC-02 sono preservati: sorgenti invariati e test baseline eseguiti. DATA-03, CALC-04, NORM-02, ARCH-01 non modificati. Nessuna nuova attestazione generale sui limiti normativi esterni.

## Scope integrity

Inventari PRE/POST e confronto per path e SHA-256. Nessun file preesistente modificato, cancellato o ripristinato. Branch, HEAD e staged invariati; golden, fixture, oracle, reconciliation ASTRA, PNRR e binari `evidence_wave3_hardening` preservati byte per byte. Nessuna operazione Git vietata.

File aggiunti esclusivamente per rendere lo STOP reviewable: questo report e la directory `dl25_coherent_regime_evidence` con manifesti, stato Git, log, configurazione e probe temporanei riproducibili. Non sono file produttivi o test aggiunti alla suite dell'applicazione.

## Three finding reassessment

CALC-03 = OPEN; NORM-03 = OPEN; NORM-04 = OPEN. Tre verdict BLOCKED separati, con le motivazioni della tabella iniziale. Nessun CANDIDATE_VERIFIED_FIXED. Il risultato della suite baseline non sostituisce le acceptance dei tre finding.

## Next gate

**DL25_CARRY_FORWARD_POLICY_RESOLUTION**, prima di DL25_COHERENT_REGIME_INDEPENDENT_REVIEW.

Serve un contratto esplicito, applicabile anche agli snapshot validi preesistenti, che specifichi: base2025 ante incremento; dove viene contabilizzato lo stock DL25 già utilizzato; se `st_incrementoDL25_2025` è stock cumulativo o delta dell'annualità; come distinguere base che lo incorpora da base che lo esclude; quali dati attestano utilizzo precedente zero rispetto a missing. Le fonti normative prescrivono il tetto complessivo, ma non permettono di ricavare queste proprietà dei dati applicativi da un numero senza provenance.

Una volta risolto questo gate, A/B/C possono essere implementati e accettati separatamente. La review indipendente rimane necessaria prima di qualsiasi aggiornamento formale ASTRA. Nessun intervento su altri finding è stato eseguito.

<!-- DL25_TERMINAL_OUTPUT -->

```text
DL25_COHERENT_REGIME_IMPLEMENTATION = BLOCKED
PREFLIGHT_AND_BASELINE_VERIFICATION = COMPLETE
RESULT = BLOCKED
BRANCH = ux/toolbox-area-fondo-prototype
HEAD = d3170f959b5815c514dbf3d6e5f93366a5f14c67
NORMATIVE_CONTRACT_VERIFIED = FROZEN_LOCAL_RULES_YES; PERSISTED_CARRY_FORWARD_CONTRACT_NO
DL25_FACULTY = OPTIONAL
DL25_THRESHOLD = 48_PERCENT
DL25_DENOMINATOR_YEAR = 2023
DL25_DENOMINATOR_SOURCE = RGS175706_LOCAL_SECTION_2_1_2_2; FROZEN_ASTRA_N04_N05
DL25_ART23_DEROGATION = YES
DL25_ART33_REQUIREMENT = PRESERVED
DL25_MULTIYEAR_EQUILIBRIUM_REQUIREMENT = PRESERVED
NET_GROSS_MODEL = CURRENT_MIXED_UNITS_UNCHANGED; TARGET_HOMOGENEOUS_NET_MINIMUM
MARGIN_48_UNIT = NET_FUND_AMOUNT
ART33_MARGIN_UNIT = GROSS_EMPLOYER_COST
L296_MARGIN_UNIT = GROSS_EMPLOYER_COST
GROSS_TO_NET_COEFFICIENT = 1_PLUS_INPUT_ONERI_DIV_100; FROZEN_CASE_1_274
CALC03_FROZEN_24000_CASE = CURRENT_FAIL_ACTUAL_18838.304552590267_EXPECTED_24000
CALC03_FINANCIAL_BINDING_CASE = NEW_ACCEPTANCE_NOT_RUN_AFTER_PREFLIGHT_STOP
CALC_03_STATUS_AFTER_WAVE = OPEN
DL144_EFFECTIVE_DATE = 2026-08-08
ART33_SUBJECT_SCOPE = SHARED_POLICY_AVAILABLE_UNCHANGED
PRE_2026_08_08_L296 = APPLICABLE_HISTORICAL_CONTRACT
FROM_2026_08_08_L296_ART33_ENTITY = TARGET_DISAPPLIED; CURRENT_STILL_INCLUDED
FROM_2026_08_08_L296_NON_ART33_ENTITY = NO_AUTOMATIC_DISAPPLICATION
DATE_AUTHORITY = MISSING_IN_CURRENT_SIMULATOR
DATE_NOW_USED = NO_BY_THIS_WAVE
LEGACY_DATE_MISSING_BEHAVIOR = CURRENT_ALWAYS_HISTORICAL; TARGET_UNDETERMINED_WHEN_RESULT_DEPENDS_ON_L296
NORM_03_STATUS_AFTER_WAVE = OPEN
BASE_YEAR_POLICY = FIXED_2025_ADMINISTRATIVE_BASE; PERSISTED_USAGE_PROVENANCE_UNRESOLVED
DL25_BASE_YEAR_POLICY_AMBIGUITY = NO_FOR_NORMATIVE_BASELINE
DL25_CARRY_FORWARD_POLICY_AMBIGUITY = YES
FONDO_PERSONALE_2025_SEMANTICS = DL25_CS2025_ANTE_INCREMENT; DISTINCT_FROM_CCNL_LEGACY_FIELD
EQ_2025_SEMANTICS = DL25_EQ2025_ADMINISTRATIVE_BASE
YEAR_2025_BASE_LABEL = CURRENT_2024_WRONG; TARGET_2025
YEAR_2026_BASE_LABEL = CURRENT_2025_BY_Y_MINUS_1; TARGET_FIXED_2025
YEAR_2027_BASE_LABEL = CURRENT_2026_WRONG; TARGET_FIXED_2025
STEP3_DYNAMIC_Y_MINUS_1_LABEL_REMOVED = NO
STEP8_PERCENT_LABEL = CURRENT_4_8_PERCENT; TARGET_48_PERCENT
ACTIVE_4_8_PERCENT_LABELS = 1_STEP8_UNCHANGED
ART60_FIGURATIVE_EXPLANATION = REQUIRED_NOT_IMPLEMENTED; EXISTING_ART60_LOGIC_PRESERVED
NORM_04_STATUS_AFTER_WAVE = OPEN
DL25_NET_GROSS_MARGIN_STATUS = BLOCKED
DL25_TEMPORAL_REGIME_STATUS = BLOCKED
DL25_BASE_YEAR_LABELS_STATUS = BLOCKED
DL25_NET_GROSS_MARGIN_IMPLEMENTATION = NOT_IMPLEMENTED
DL25_TEMPORAL_REGIME_IMPLEMENTATION = NOT_IMPLEMENTED
DL25_BASE_YEAR_LABELS_IMPLEMENTATION = NOT_IMPLEMENTED
CROSS_VIEW_CONSISTENCY = CURRENT_DIVERGENCES_CONFIRMED; NOT_FIXED
PNRR_REGRESSION = NONE; BASELINE_TESTS_PASS
SEC_01_REGRESSION = NONE
DATA_02_REGRESSION = NONE
CALC_01_REGRESSION = NONE
CALC_02_REGRESSION = NONE
CALC_05_REGRESSION = NONE
DOC_01_REGRESSION = NONE
DOC_02_REGRESSION = NONE
NORM_01_REGRESSION = NONE
FUNC_01_REGRESSION = NONE
FUNC_02_REGRESSION = NONE
ASTRA_BLOCKERS_OPEN = 0_CONSOLIDATED_STATE_UNCHANGED
FILES_CHANGED_THIS_WAVE = NEW_REPORT_AND_NEW_DL25_COHERENT_REGIME_EVIDENCE_ONLY
PREEXISTING_FILES_CHANGED = 0_OF_1083
PRODUCT_FILES_CHANGED = 0
TARGETED_TESTS = BASELINE_PROBE_ONLY; NO_NEW_REMEDIATION_TESTS_AFTER_STOP
CALC03_TESTS = BASELINE_COUNTEREXAMPLE_REPRODUCED; C1_C6_NOT_IMPLEMENTED
NORM03_TESTS = BASELINE_DATE_IGNORED_PROBE_REPRODUCED; N1_N8_NOT_IMPLEMENTED
NORM04_TESTS = EXISTING_LABELS_AND_CARRY_CHARACTERIZED; B1_B8_NOT_IMPLEMENTED
STEP3_TESTS = BASELINE_16_OF_16_PASS
SIMULATORE_TESTS = READ_ONLY_BASELINE_PROBE; NO_NEW_ACCEPTANCE_TEST
STEP8_TESTS = BASELINE_11_OF_11_PASS
TEMPORAL_BOUNDARY_TESTS = CURRENT_07_08_09_ALL_ZERO; NEW_ACCEPTANCE_NOT_RUN
PERSISTENCE_TESTS = BASELINE_SNAPSHOT_WORKFLOW_8_OF_8_PASS; NO_REGIME_DATE_ADDED
CLOSED_REGRESSION = BASELINE_PASS_IN_FULL_SUITE
CANONICAL_LEDGER_REGRESSION = BASELINE_PASS_IN_FULL_SUITE
CABINA_REGRESSION = BASELINE_PASS_IN_FULL_SUITE
DISTRIBUTION_REGRESSION = BASELINE_PASS_IN_FULL_SUITE
DOCUMENT_READINESS_REGRESSION = BASELINE_73_OF_73_PASS
CLOSURE_READINESS_REGRESSION = BASELINE_PASS_CORE_AND_INTEGRATION
XLS_REGRESSION = BASELINE_CANONICAL_FAD_16_OF_16_PASS
PDF_REGRESSION = BASELINE_CANONICAL_SUMMARY_17_OF_17_PASS
FAD_READ_MODEL_REGRESSION = BASELINE_17_OF_17_PASS
AUTH_REGRESSION = BASELINE_PASS_IN_FULL_SUITE
FULL_PRODUCT_TESTS = 1645_OF_1645_PASS; 126_OF_126_FILES_PASS
HISTORICAL_EVIDENCE_GENERATOR = 7_CASES_NOT_RUN_BY_DESIGN
REGRESSION = BASELINE_8_OF_8_PASS
ORACLE = BASELINE_14_OF_14_PASS
TYPESCRIPT = PASS_ZERO_ERRORS
DIFF_CHECK = PASS
PRODUCT_NETWORK_ATTEMPTS = 0_OBSERVED
TOOLING_NETWORK_ATTEMPTS = 0_OUTBOUND
TOOLING_LOCALHOST_LABEL_LOOKUPS = 8_INTERCEPTED_NO_REAL_DNS
REAL_NETWORK_CONNECTION_ESTABLISHED = NO
SCOPE_INTEGRITY = PASS_EXACT_PREEXISTING_BYTE_PRESERVATION
DATABASE_CHANGED = NO
MIGRATIONS_CREATED = NO
MIGRATIONS_APPLIED = NO
STAGING_CONTACTED = NO
PRODUCTION_CONTACTED = NO
GIT_ADD = NO
COMMIT = NO
PUSH = NO
PR = NO
DEPLOY = NO
IF_ALL_THREE_PASS = NOT_SATISFIED; NO_CANDIDATE_VERIFIED_FIXED
DL25_COHERENT_REGIME_STATUS = BLOCKED
REPORT = DL25_COHERENT_REGIME_IMPLEMENTATION_REPORT.md
NEXT_GATE_RECOMMENDATION = DL25_CARRY_FORWARD_POLICY_RESOLUTION_THEN_DL25_COHERENT_REGIME_INDEPENDENT_REVIEW
```

L'output distingue deliberatamente preflight concluso e implementazione bloccata: dichiarare `IMPLEMENTATION = COMPLETE`, le label corrette o i nuovi test PASS senza averli implementati sarebbe inesatto.
