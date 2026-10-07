# DL25_COHERENT_REGIME_IMPLEMENTATION_V2

Esecuzione locale del 5 ottobre 2026, strettamente offline. Il contratto applicativo è quello approvato nel prompt `DL25_CARRY_FORWARD_POLICY_RESOLUTION_AND_RESUME`; le authority normative sono congelate dal committente. Nessuna ricerca o connessione esterna.

## Executive verdict

Carry-forward risolto e implementato. Il gate iniziale è passato prima della ripresa dei tre sub-slice. CALC-03, NORM-03 e NORM-04 hanno acceptance separate. Nessuna promozione formale a VERIFIED_FIXED e nessun aggiornamento della reconciliation ASTRA.

| Contratto / finding | Esito locale | Stato proposto per independent review |
|---|---|---|
| DL25_CARRY_FORWARD_POLICY | CLOSED_LOCALLY | Policy applicativa risolta |
| CALC-03 — netto/lordo | CLOSED_LOCALLY | CANDIDATE_VERIFIED_FIXED |
| NORM-03 — regime temporale/soggettivo | CLOSED_LOCALLY | CANDIDATE_VERIFIED_FIXED |
| NORM-04 — anno base e label | CLOSED_LOCALLY | CANDIDATE_VERIFIED_FIXED |

La suite completa verificata comprende 1.717 test in 132 file; regression 8/8, oracle 14/14, TypeScript senza errori. L'acceptance conclusiva sullo stato finale è registrata nelle evidenze. I numeri sotto non comprendono i sette test del generatore storico che riscrive `evidence_wave3_hardening`.

## Baseline

Repository: `C:/Users/PuscedduD/Il mio Drive/Progetto FL APP/entilocaliapp`.

Branch `ux/toolbox-area-fondo-prototype`; HEAD `d3170f959b5815c514dbf3d6e5f93366a5f14c67`, verificati all'avvio e riconfermati alla fine. Working tree deliberatamente sporco: sono stati conservati tutti gli slice precedenti. Inventario PRE: 1.095 file, SHA-256 e status. Index invariato e senza percorsi staged. Nessun comando Git di modifica eseguito.

Le evidenze V2 sono separate in `C:/Users/PuscedduD/Il mio Drive/Progetto FL APP/entilocaliapp/dl25_coherent_regime_v2_evidence`. I file sorgente della wave sono elencati, con hash PRE/POST, in `WAVE_SOURCE_FILES.json`; la baseline completa è in `PRE_SHA256.json`.

## Previous blocked preflight

Il report storico `C:/Users/PuscedduD/Il mio Drive/Progetto FL APP/entilocaliapp/DL25_COHERENT_REGIME_IMPLEMENTATION_REPORT.md` resta intatto, insieme alla precedente directory di evidenze. Il suo STOP `DL25_CARRY_FORWARD_POLICY_AMBIGUITY` era corretto: non consentiva di ricavare stock e delta da un solo numero legacy.

Il nuovo prompt risolve la policy futura, senza inventare il significato dei numeri già salvati. Questo report V2 documenta l'implementazione successiva allo STOP. SHA-256 del report storico: `0C05E0B52EDB6AD824D7D0CA40B4AFCA43048CFFD6A85306E212FD7E361E5075`.

## Normative carry-forward contract

Authority congelate: art.14, comma 1-bis, D.L.25/2025; nota RGS/MEF prot.175706 del 27/06/2025; art.58, comma 3, CCNL Funzioni Locali 2022-2024. Il plafond è complessivo e frazionabile nel tempo. Lo stock già stabilmente incorporato resta nel fondo e consuma il plafond; il delta corrente lo incrementa una sola volta.

Il resolver puro condiviso restituisce VALID, INVALID o UNDETERMINED, importi distinti e issue business. Zero esplicito e dato mancante restano distinti. Nessuna tolleranza permette di spendere oltre il residuo.

## Fixed 2025 baseline

`annualData.dl25.fondoStabile2025Certificato` rappresenta la baseline stabile 2025 ante DL25; `budgetEq2025` la baseline EQ. I nomi dei campi corrispondono a quelli già presenti nel repository. Il totale stabile corrente e gli incrementi successivi non sono mai usati per ricalcolare la baseline.

TAB resta 2023, soglia 0,48. La baseline viene copiata nella nuova annualità, senza aggiornamenti automatici al fondo corrente. Le eventuali rettifiche sono fatti dell'istruttoria sulla base 2025, non un meccanismo di capitalizzazione annuale.

## Total ceiling

`max(0, TAB2023 × 0,48 − CS2025 − EQ2025 − rettifiche2025)`, con Big.js e arrotondamento monetario. Se uno dei tre dati obbligatori manca, il plafond non viene trasformato in zero.

Esempio congelato: 300.000 × 48% − 100.000 − 20.000 = **24.000 euro netti**. Questo massimo resta 24.000 nel 2025, 2026 e 2027.

## Prior cumulative stock

`priorCumulativeApplied`: stock fino a Y−1. Solo nel primo anno normativo 2025 il prior è statutariamente zero. Dal 2026 il prior deve essere esplicito, anche quando è zero, e corredato da `priorStockProvenance` leggibile: costituzione precedente, determina, atto o snapshot.

Prior mancante → PRIOR_DL25_STOCK_MISSING / UNDETERMINED. Prior negativo, non finito o superiore al plafond → INVALID. Nessuna correzione automatica dello stock storico.

## Current-year delta

`currentYearDelta`: nuova decisione dell'annualità. Deve essere non negativo e non superiore al margine residuo. La decisione positiva richiede inoltre una disponibilità finanziaria determinata e sufficiente e i requisiti applicativi già previsti dal Wizard.

Un vecchio `incrementoApplicato = 0` non è una prova dello stock precedente: non diventa una decisione DL25 qualificata. Consente il lavoro sulle altre sezioni del Wizard lasciando il DL25 da determinare. Una nuova decisione canonica zero richiede invece il prior qualificato.

## Current cumulative stock

`currentCumulativeApplied = priorCumulativeApplied + currentYearDelta`, derivato dal resolver. Nel FundData questo valore è materializzato nella sola voce stabile `st_incrementoDL25_2025`. Il suffisso fisico `_2025` è mantenuto per compatibilità; la semantica nuova è CURRENT_CUMULATIVE_STABLE_STOCK, non un delta riservato al 2025.

| Annualità | Plafond complessivo | Prior | Delta | Stock corrente | Residuo dopo la scelta |
|---|---:|---:|---:|---:|---:|
| 2025 | 24.000 | 0 | 4.000 | 4.000 | 20.000 |
| 2026 | 24.000 | 4.000 | 15.000 | 19.000 | 5.000 |
| 2027 | 24.000 | 19.000 | 5.000 | 24.000 | 0 |

## Remaining capacity

`remainingCapacity = plafond − prior`, prima della decisione. `remainingAfterApplication = plafond − stock corrente`, dopo la decisione. Il prior superiore al plafond è un'incoerenza, non un residuo silenziosamente azzerato. Plafond esaurito più delta zero è valido; anche 0,01 euro di nuovo delta è INVALID.

## Legacy snapshot policy

La hydration dei JSON non qualifica né riscrive gli importi. Un legacy 2025 può essere letto come first-year stock solo con una fonte che attesti l'effettiva applicazione al fondo. Sample, default o un semplice numero non bastano.

Un legacy OPEN successivo al 2025 privo di semantica/provenance resta UNDETERMINED nella nuova istruttoria DL25. Gli importi salvati restano conservati; il riporto non li trasforma in nuovo prior. I read model storici senza il nuovo contratto non vengono migrati automaticamente.

## Legacy qualification

Scelte esplicite: CUMULATIVE_STOCK, CURRENT_YEAR_DELTA, UNKNOWN. Con prior 4.000 e legacy cumulativo 19.000 si ricostruisce delta 15.000; con legacy delta 15.000 si ottiene stock 19.000. Un cumulativo inferiore al prior è INVALID. UNKNOWN resta UNDETERMINED anche se si inserisce un nuovo delta, finché il legacy non viene qualificato.

La UI conserva il numero legacy, rende visibile la qualificazione e mostra il delta ricostruito solo dopo una scelta valida. La qualificazione nel simulatore salva fatti istruttori OPEN senza modificare la voce stabile: la conversione avviene nel trasferimento esplicito.

## N+1 carry-forward

Il builder opera soltanto sulla creazione di un nuovo snapshot, per la stessa entità e l'annualità immediatamente successiva. Copia lo stock corrente qualificato come prior N+1, con fonte business, copia la baseline fissa e imposta il nuovo delta a zero. Le date e la qualificazione legacy della vecchia istruttoria non vengono riciclate come fatti del nuovo esercizio.

Lo stock salvato nel fondo sorgente deve coincidere con quello ricostruito. Uno stock legacy ambiguo non viene riportato automaticamente. Snapshot target già esistenti e target CLOSED non vengono reinterpretati. Il source CLOSED non subisce alcuna mutazione.

L'aggancio al workflow di chiusura è limitato al ramo che costruisce il nuovo target OPEN: non cambia calcolo dei residui, readiness, RPC, rollback o condizioni di chiusura.

## No-double-count contract

Il default builder ha le componenti stabili ordinarie e DL25 non valorizzate; non contiene una base consolidata comprensiva del DL25 precedente. Il riporto sostituisce la singola voce DL25, non aggiunge una seconda risorsa o ingloba lo stock in una base ordinaria.

Per dati con contratto DL25 esplicito, il canonical ledger verifica la coerenza fra fatti e importo corrente, espone una sola contribution economica DL25 e rimuove l'alias dalla seconda contribution. La riga Art23 già esistente resta informativa, senza effetto economico. Nessuna riga stabile distinta per il delta.

Test contabile: altre componenti stabili 100.000 + stock DL25 19.000 → stabile verificato 119.000, anche in presenza di un vecchio alias 4.000 nel dataset di prova. Non 123.000 e non 134.000.

## Transfer semantics

Preview, simulazione e applicazione usano il resolver fresco, non il risultato cache come authority del plafond. Il trasferimento scrive lo stock cumulativo; annualData conserva prior, delta, fonte, data e qualificazione. La snapshot istruttoria contiene campi distinti per prior, delta e residui.

Prior 4.000 + prima decisione 10.000 = 14.000. Correzione a delta 15.000 → 19.000; ripetere l'operazione lascia 19.000. Nessuna somma con la precedente decisione della stessa annualità.

La verifica finanziaria blocca le decisioni positive non determinabili o oltre il margine netto; scope dell'ente e anno target incoerenti non autorizzano un write DL25. Le protezioni sui valori manuali sono conservate: se il conflitto mantiene lo stock precedente, non vengono salvati fatti DL25 incompatibili con quel numero. Preview e piano espongono CONFLICT; i computed di audit riportano stock/delta effettivamente mantenuti, mentre la decisione richiesta rimane distinta nell'input e in dl25RequestedCurrentYearDelta. La successiva risoluzione esplicita del conflitto applica il nuovo stock una sola volta.

## Save/reload

Campi JSON opzionali e backward-compatible, senza migration. Test dello schema e del workflow di save/load con repository in memoria: prior 4.000, delta 15.000, stock 19.000, qualificazione, fonte e data business rimangono invariati. Missing, zero e date non vengono sostituiti con default. Nessun Supabase reale è stato contattato.

## CALC-03 net/gross model

Il margine 48% e il residuo del plafond sono NET_FUND_AMOUNT. Art33 e L296 esprimono GROSS_EMPLOYER_COST. Si convertono soltanto i margini finanziari dividendo per `1 + oneri/100`; poi si confrontano importi netti omogenei. Big.js DP=20, half-up; risultato monetario finale a due decimali.

| Acceptance | Expected | Esito |
|---|---:|---|
| C1 margine 48% vincolante, finanze capienti | 24.000 | PASS |
| C2 Art33 lordo 12.740, oneri 27,4% | 10.000 | PASS |
| C3 L296 lordo 6.370 nel regime storico | 5.000 | PASS |
| C4 post 08/08, L296 non partecipa | 24.000 | PASS |
| C5 margine netto zero | 0 | PASS |
| C6 margine negativo, floor | 0 | PASS |
| Precisione: 1 euro lordo / 1,274 | 0,78 | PASS |

L'alias legacy `fase1_incrementoPotenzialeLordo` viene conservato per compatibilità, ma il valore è il margine netto; sono introdotti campi espliciti Netto. `fase4_spazioUtilizzabileLordo` è ora un autentico controvalore lordo del massimo netto, non la base da dividere una seconda volta.

I tipi di ente per cui il simulatore non ha una tabella finanziaria supportata restituiscono UNDETERMINED: nessuno spazio Art33 viene inventato come zero o come capacità spendibile.

## NORM-03 temporal regime

Authority temporale: `regimeDate`, data business ISO civile, con anno coerente all'istruttoria; non timestamp di salvataggio o clock di sistema. Authority soggettiva: la shared `art33ApplicationPolicy`, compresi territorialContext e manualDecision.

| Caso | L296 / risultato |
|---|---|
| Art33 APPLY, 07/08/2026 | Storico, partecipa al minimo |
| Art33 APPLY, 08/08 e 09/08/2026 | Disapplicato, non partecipa |
| Art33 SKIP, dopo 08/08/2026 | Resta storico |
| Annualità 2025 | Storico |
| Annualità 2027, Art33 APPLY | Post riforma |
| Annualità 2026, data mancante, risultato diverso | UNDETERMINED |
| Data mancante, stesso valore pre/post | Valore determinabile, dateIndifferent documentato |
| Data invalida / anno incoerente | UNDETERMINED, nessuna indifferenza permissiva |
| Perimetro Art33 BLOCK | UNDETERMINED, anche con margini capienti |

L'indifferenza è ammessa per la data mancante; non risolve un soggetto sconosciuto. Il nuovo delta non è accettato sulla sola base di una classificazione cache.

## NORM-04 base-year/labels

Step3, Step8 e Simulatore espongono la base amministrativa 2025 ante incremento per tutte le annualità 2025/2026/2027. Il precedente label Y−1 dei campi CS/EQ è eliminato. TAB resta 2023 e formula 0,48. Scansione dei consumer produttivi: nessuna label attiva 4,8% o 4.8%.

Le rettifiche figurative Art60 sono descritte come comparabilità, non come nuove risorse o nuovo margine. Formula e pipeline NORM-01 preesistenti rimangono immutate.

## Step3

Distingue plafond, prior, residuo prima della scelta, nuovo delta, stock risultante e residuo dopo la scelta. Raccoglie fonte, qualificazione legacy e data business. Il delta ricostruito da un legacy qualificato è visualizzato senza un write automatico al fondo.

Espone i dati finanziari del simulatore condiviso e il massimo netto dopo i vincoli. I vecchi confronti storici L296 non sono presentati come un vincolo operativo post riforma. Superare il residuo mostra un errore specifico; plafond esaurito è esplicito.

## Simulatore

Utilizza annualità, fatti DL25 e shared subject policy. Le etichette distinguono il margine netto DL25 dagli spazi lordi finanziari e dalla loro conversione. L296 disapplicato è reso come “Non applicabile”, non come un falso limite zero. Il massimo simulato non applica automaticamente un incremento al fondo.

Un legacy dal 2026 senza prior determinato resta UNDETERMINED anche nella firma compatibile a tre argomenti; una mancanza di contesto temporale non certifica un nuovo plafond annuale. Il form CLOSED disabilita gli input e non dispatcha una nuova simulazione.

## Step8

Corretto 4,8% → 48%; base 2025 fissa. Riepilogo dello stesso resolver carry-forward e dello stesso motore finanziario. La decisione positiva con data materialmente mancante o margine insufficiente blocca il trasferimento. Il delta ricostruito del legacy qualificato è mostrato anche nella riga riepilogativa della decisione.

## Cross-view consistency

Test sul medesimo dataset: Step3, Step8, Simulatore, preview e FundData concordano su 24.000 / 4.000 / 20.000 / 15.000 / 19.000 / 5.000. Il massimo finanziario disponibile è 20.000, al netto degli oneri, con L296 non applicabile al dataset datato 08/08/2026. Verificata anche la variante legacy cumulativa 19.000, con delta ricostruito 15.000.

I valori cache non modificano baseline, prior o scelta corrente. La decisione e lo stock sono conservati separatamente durante transfer e reload.

## CLOSED

Apply rifiutato prima di qualsiasi modifica, save guard preservata, simulatore senza dispatch e input disabilitati. Le sorgenti CLOSED qualificate possono essere lette dal builder N+1 senza modificarle. I CLOSED ambigui successivi al 2025 non vengono reinterpretati o migrati. Nessuna nuova qualificazione viene scritta su CLOSED.

## Tests

Gate iniziale carry-forward: **40/40**, eseguito prima della ripresa CALC-03/NORM-03/NORM-04. La suite finale include anche gli hardening successivi di legacy 2025, scope e data.

| Gruppo | Test | Esito |
|---|---:|---|
| Carry-forward CF1–CF14, invalidi, fonte, first-year, N+1 | 25 | PASS |
| CALC-03 unità e precisione | 7 | PASS |
| NORM-03 soglia temporale, scope, data mancante/invalida | 12 | PASS |
| DL25 snapshot save/load, N+1, protezioni target | 3 | PASS |
| Integrazione DL25 transfer/core/ledger/schema | 17 | PASS |
| Cross-view UI, label, qualificazione, CLOSED | 8 | PASS |
| Step3 preesistente, adattato al nuovo input delta | 16 | PASS |
| Step8 preesistente | 11 | PASS |
| Transfer preview preesistente | 43 | PASS |
| Snapshot workflow preesistente | 8 | PASS |
| Chiusura annualità preesistente | 5 | PASS |
| Wizard DL25 calculator preesistente | 16 | PASS |
| Full product offline | 1.717 / 132 file | PASS |
| Regression congelata | 8/8 | PASS |
| Oracle congelato | 14/14 | PASS |
| TypeScript noEmit, incremental false | 0 errori | PASS |
| git diff --check | 0 errori | PASS |

I nuovi test sono 72. Gli adattamenti ai normali test di feature dichiarano il nuovo prior/provenance o verificano che il legacy ambiguo non venga più trasferito. Non sono stati alterati i file di fixture congelati, golden, oracle o i generatori storici. Il generatore `wave3HardeningEvidence.test.ts` è escluso dalla product suite per proteggere l'evidenza storica; `wave3UiWiring.test.tsx` rimane incluso e usa directory temporanee isolate.

I log intermedi sono mantenuti distinti dai log di acceptance: non sono presentati come gate verdi. La prova conclusiva è `full-final-acceptance.log`, insieme a `tsc-final-acceptance.log`, `regression-verified.log` e `oracle-verified.log`.

## Verified-fixed regressions

SEC-01, DATA-02, CALC-01, CALC-02, CALC-05, DOC-01, DOC-02, NORM-01, FUNC-01 e FUNC-02 non mostrano regressioni nei gate locali. Full suite comprende Auth, PNRR, ledger canonico, Cabina, distribuzione, DocumentKindReadiness, ClosureInstructionReadiness, XLS, PDF, FAD read model e CLOSED. Le authority e i file produttivi specifici degli altri finding restano invariati rispetto al PRE.

La fotografia ASTRA 10 VERIFIED_FIXED / 8 PARTIALLY_FIXED / 7 OPEN e ASTRA_BLOCKERS_OPEN=0 non viene riscritta: le tre proposte DL25 attendono independent review.

## Scope integrity

1.095 file PRE: 23 modificati previsti, 1.072 invariati, zero cancellazioni e zero modifiche inattese. 14 nuovi file sorgente; totale wave **37 file sorgente**, oltre a questo report e alle nuove evidenze. Nessuna modifica a PNRR, Auth, Art23 Dirigenza, RGS, document factory, migrazioni o reconciliation. L'unico intervento nel workflow di chiusura è l'aggancio al builder del nuovo snapshot DL25.

I documenti correnti continuano a leggere la voce stabile cumulativa, con importi contabili coerenti. Il delta annuale è conservato nell'istruttoria, ma non è stampato separatamente da tutti i template: eventuale `DL25_DOCUMENT_PROJECTION_GAP = ANNUAL_DELTA_NOT_SEPARATELY_PRINTED`, da valutare editorialmente in independent review. Non richiede una modifica contabile e non è stato esteso il document factory.

Solo binari locali. Guardia offline ereditata da tutti i worker; log prodotti nella directory temporanea dedicata e copiati nelle evidenze. Product network attempts=0; le richieste tooling sono esclusivamente lookup del nome localhost di Vite, intercettate e risolte in memoria. Nessuna DNS effettiva, socket outbound o connessione reale. Database e ambienti remoti invariati.

## Three finding reassessment

CALC-03: scenario 24.000 netto e caso finanziario 10.000 risolti senza doppia divisione; **CANDIDATE_VERIFIED_FIXED**.

NORM-03: soglia 08/08/2026 e perimetro condiviso, autorità business esplicita, legacy data-missing fail-closed e indifferenza limitata; **CANDIDATE_VERIFIED_FIXED**.

NORM-04: baseline fissa 2025, TAB2023, 48% e Art60 figurativo preservato; **CANDIDATE_VERIFIED_FIXED**.

Verdict separati: DL25_NET_GROSS_MARGIN_STATUS=CLOSED_LOCALLY; DL25_TEMPORAL_REGIME_STATUS=CLOSED_LOCALLY; DL25_BASE_YEAR_LABELS_STATUS=CLOSED_LOCALLY. Nessun altro finding rivalutato.

## Next gate

**DL25_COHERENT_REGIME_INDEPENDENT_REVIEW**. Verificare contratto legacy e provenance, builder N+1, accounting, salvataggio, minimi netti e date sui log e sul diff di questa wave. Nessuna azione su altri finding, nessun commit/push/PR/deploy e nessuna reconciliation anticipata.

## Output terminale

```text
DL25_COHERENT_REGIME_IMPLEMENTATION_V2 = COMPLETE
RESULT = PASS
BRANCH = ux/toolbox-area-fondo-prototype
HEAD = d3170f959b5815c514dbf3d6e5f93366a5f14c67
PREVIOUS_GATE = DL25_CARRY_FORWARD_POLICY_AMBIGUITY
CARRY_FORWARD_POLICY_RESOLVED = YES
DL25_BASELINE = FIXED_2025_PRE_INCREMENT
DL25_DENOMINATOR_YEAR = 2023
DL25_THRESHOLD = 48_PERCENT
DL25_TOTAL_CEILING = max(0, TAB2023*0.48-CS2025-EQ2025-rettifiche2025)
PRIOR_CUMULATIVE_MODEL = annualData.dl25.priorCumulativeApplied + business provenance
CURRENT_YEAR_DELTA_MODEL = annualData.dl25.currentYearDelta
CURRENT_CUMULATIVE_MODEL = prior + delta; derived resolver; materialized stable slot
REMAINING_CAPACITY_MODEL = ceiling-prior; after decision ceiling-cumulative
ST_INCREMENTODL25_2025_SEMANTICS = CURRENT_CUMULATIVE_STABLE_STOCK
LEGACY_2025_POLICY = FIRST_YEAR_CUMULATIVE_STOCK only with actual-applied provenance
LEGACY_POST_2025_POLICY = explicit CUMULATIVE_STOCK / CURRENT_YEAR_DELTA / UNKNOWN
LEGACY_UNKNOWN_BEHAVIOR = UNDETERMINED
N_PLUS_1_CARRY_FORWARD = PASS; qualified prior; new delta0; new same-entity snapshot only
NO_DOUBLE_COUNT = PASS; one economic DL25 contribution
TRANSFER_WRITES = CURRENT_CUMULATIVE_STOCK
TRANSFER_CURRENT_YEAR_DELTA_PRESERVED = YES
TRANSFER_IDEMPOTENCY = PASS; 14000 -> 19000 -> 19000
DL25_CARRY_FORWARD_POLICY_STATUS = CLOSED_LOCALLY
NET_GROSS_MODEL = NET48; financial gross/coefficient; minimum of NET amounts
CALC03_FROZEN_24000_CASE = PASS; 24000.00
CALC03_FINANCIAL_BINDING_CASE = PASS; 12740 gross / 1.274 = 10000.00 net
CALC_03_STATUS_AFTER_WAVE = CANDIDATE_VERIFIED_FIXED
DL144_EFFECTIVE_DATE = 2026-08-08
ART33_SUBJECT_SCOPE = shared art33ApplicationPolicy APPLY/SKIP/BLOCK
PRE_2026_08_08_L296 = APPLICABLE
FROM_2026_08_08_L296_ART33_ENTITY = NOT_APPLICABLE
FROM_2026_08_08_L296_NON_ART33_ENTITY = HISTORICAL_RETAINED
DATE_AUTHORITY = regimeDate; explicit business date and instruction year
DATE_NOW_USED = NO
LEGACY_DATE_MISSING_BEHAVIOR = UNDETERMINED if material; documented indifference otherwise
NORM_03_STATUS_AFTER_WAVE = CANDIDATE_VERIFIED_FIXED
BASE_YEAR_POLICY = FIXED_2025_ADMINISTRATIVE_BASE
YEAR_2025_BASE_LABEL = 2025
YEAR_2026_BASE_LABEL = 2025
YEAR_2027_BASE_LABEL = 2025
STEP3_DYNAMIC_Y_MINUS_1_LABEL_REMOVED = YES
STEP8_PERCENT_LABEL = 48_PERCENT
ACTIVE_4_8_PERCENT_LABELS = 0
NORM_04_STATUS_AFTER_WAVE = CANDIDATE_VERIFIED_FIXED
CROSS_VIEW_CONSISTENCY = PASS; canonical and qualified legacy datasets
PNRR_REGRESSION = NONE; PASS
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
ASTRA_BLOCKERS_OPEN = 0
FILES_CHANGED_THIS_WAVE = 37 source files (23 modified +14 added); report/evidence separate
CARRY_FORWARD_TESTS = PASS;25 final domain tests; initial gated run40/40
LEGACY_TESTS = PASS; CF9-CF12; first-year provenance; unknown fail-closed; UI/transfer
N_PLUS_1_TESTS = PASS; CF14; 2025->2026->2027; snapshot workflow
NO_DOUBLE_COUNT_TESTS = PASS; canonical stable119000=100000+19000
TRANSFER_TESTS = PASS;43 existing preview tests +17 coherent integration tests
CALC03_TESTS = PASS;7 unit tests +core binding probes
NORM03_TESTS = PASS;12 separate temporal/subject tests +core probes
NORM04_TESTS = PASS;2025/2026/2027;48%;TAB2023;Art60
STEP3_TESTS = PASS;16 existing +cross-view probes
SIMULATORE_TESTS = PASS;core boundaries;legacy guards;cross-view;CLOSED
STEP8_TESTS = PASS;11 existing +cross-view probes
TEMPORAL_BOUNDARY_TESTS = PASS;07/08,08/08,09/08
PERSISTENCE_TESTS = PASS;3 snapshot tests +schema/JSON integration
CLOSED_REGRESSION = PASS
CANONICAL_LEDGER_REGRESSION = PASS
CABINA_REGRESSION = PASS
DISTRIBUTION_REGRESSION = PASS
DOCUMENT_READINESS_REGRESSION = PASS
CLOSURE_READINESS_REGRESSION = PASS
XLS_REGRESSION = PASS
PDF_REGRESSION = PASS
AUTH_REGRESSION = PASS
FULL_PRODUCT_TESTS = PASS;1717/1717;132 files;historical evidence generator excluded
REGRESSION = PASS;8/8;frozen inputs/expected results unchanged
ORACLE = PASS;14/14;unchanged
TYPESCRIPT = PASS;0 errors
DIFF_CHECK = PASS
PRODUCT_NETWORK_ATTEMPTS = 0
TOOLING_NETWORK_ATTEMPTS = 32;localhost name lookups intercepted in-memory
REAL_NETWORK_CONNECTION_ESTABLISHED = NO
SCOPE_INTEGRITY = PASS;1072 preexisting files unchanged;0 unexpected;0 deleted
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
IF_ALL_THREE_FINDINGS_PASS = CALC_03_CANDIDATE_VERIFIED_FIXED;NORM_03_CANDIDATE_VERIFIED_FIXED;NORM_04_CANDIDATE_VERIFIED_FIXED
DL25_COHERENT_REGIME_STATUS = CLOSED_LOCALLY
REPORT = DL25_COHERENT_REGIME_IMPLEMENTATION_V2_REPORT.md
NEXT_GATE_RECOMMENDATION = DL25_COHERENT_REGIME_INDEPENDENT_REVIEW
```
