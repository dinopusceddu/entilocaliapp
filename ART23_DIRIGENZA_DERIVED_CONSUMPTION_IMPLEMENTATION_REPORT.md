# ART23_DIRIGENZA_DERIVED_CONSUMPTION — implementation report

## Executive result

**RESULT = BLOCKED — ART23_DIRIGENZA_GOLDEN_CONFLICT.** Nessuna modifica applicativa eseguita. Il conflitto è stato rilevato nel preflight e confermato mediante un probe locale in memoria. Il §45 del prompt allegato dispone: «NON modificare golden/oracle/fixture per far passare lo slice. Se emerge conflitto: STOP con: ART23_DIRIGENZA_GOLDEN_CONFLICT». Questa condizione impedisce di completare contemporaneamente la nuova authority e il requisito regression 8/8 con il golden immutato.

La fixture `tests/fixtures/fondo/ente-con-dirigenza.json` contiene una risorsa atomica soggetta di **280.000 €** e non contiene la cache. Il golden `tests/fixtures/fondo/golden_results.json:148` congela **1.330.000 €** di consumo, omettendo quei 280.000 €. L'aggregazione delle risorse soggette effettivamente presenti produce **1.610.000 €**. Non è possibile conservare 1.330.000 € usando una derivazione conforme al prompt.

Il probe è diagnostico: valorizza esclusivamente una copia normalizzata in memoria per esercitare l'aggregatore esistente con l'importo atomico ricostruito. **Non è un resolver implementato, un nuovo golden o un aggiornamento dello snapshot.** Se le sette voci soggette omesse nella fixture fossero invece considerate necessarie, il nuovo esito sarebbe UNDETERMINED: anche questa interpretazione contraddice un risultato congelato e definitivo. Nessuna decisione sui missing è stata introdotta nel prodotto.

## Baseline

| Controllo | PRE / POST |
|---|---|
| Branch | `ux/toolbox-area-fondo-prototype` / invariato |
| HEAD | `d3170f959b5815c514dbf3d6e5f93366a5f14c67` / invariato |
| Index | vuoto / vuoto |
| Working tree | intenzionalmente sporco; tutte le modifiche pregresse preservate |
| Inventario PRE | SHA-256 di 1.136 file esistenti, prima degli artefatti di analisi |
| File esistenti modificati/rimossi | 0 / 0, confronto byte tramite SHA-256 |

Evidenze in `art23_dirigenza_evidence/pre-sha256.json`, `pre-status.txt`, `pre-diff.txt`, `pre-cache-occurrences.txt`, `existing-files-delta.json`. L'output staged è vuoto; PowerShell non ha creato un file di testo per una pipeline senza righe. Verifica staged ripetuta direttamente a fine lavoro. Nessun comando di mutazione Git.

## ASTRA baseline corrections

Baseline richiesta: VERIFIED_FIXED=13, PARTIALLY_FIXED=8, OPEN=4, TOTAL=25; ASTRA_BLOCKERS_OPEN=0. DATA-01=OPEN e DATA-03=PARTIALLY_FIXED; non adottato lo scambio editoriale presente nella review DL25. CALC-04 e ARCH-01 restano PARTIALLY_FIXED. Reconciliation e review storiche immutate.

Terminologia preservata: D.L.144/2026 riguarda le amministrazioni soggette ai vincoli dell'articolo 33, con `art33ApplicationPolicy` come authority; soglia DL25 48%, fattore 0.48. Nessun cambiamento alla wave DL25.

## Original CALC-04 acceptance

`ASTRA_FINAL_FINDINGS_RECONCILIATION.md:329` e `ASTRA_25_FINDINGS_CURRENT_STATE_RECONCILIATION.md:290`, con relative review indipendenti, richiedono totali sempre derivati. A parità di atomici, cambiare o eliminare la cache non deve cambiare consumo e conformità. Il residuo Dirigenza rende CALC-04 parziale dopo la correzione FAD.

## Art. 23 normative contract

Contratto assunto dall'allegato, senza consultazioni esterne: il consumo complessivo comprende anche la dirigenza, rispettando le classificazioni già modellate. Lo slice non autorizza nuove classificazioni né modifiche al tetto storico. In particolare, `st_art57c2a_CCNL2020_unicoImporto2020` è soggetto nella formula corrente della pagina e nella documentazione di dominio; non è consentito escluderlo per conservare il golden.

## PRE Dirigenza authority graph

```text
Input atomici → FondoDirigenzaPage / somma di 8 voci
             → useEffect → UPDATE_FONDO_DIRIGENZA_DATA → cache persistibile
Cache → fundEngine:354 → comp_dirigenza → consumo Art23 → delta/compliance
                    → checks → Cabina / documenti / chiusura
Atomici → calculateDirigenzaSubFund → totali del fondo (percorso distinto)
```

La costituzione del fondo e il consumo Art23 hanno authority diverse nel PRE. Il golden mostra questa divergenza: 300.000 € di fondo Dirigenza, dei quali 280.000 € soggetti e 20.000 € esclusi, ma contributo Dirigenza al consumo Art23 pari a zero.

## Cache inventory

Inventario globale completo delle occorrenze testuali esistenti prima di modificare qualsiasi codice: `art23_dirigenza_evidence/pre-cache-occurrences.txt`. Classificazione per tutte le superfici censite:

| Superficie / occorrenze | Classe PRE | Ruolo |
|---|---|---|
| `src/logic/calculation/fundEngine.ts:354` | ACTIVE_AUTHORITY | reader economico, `cache || 0` quando hasDirigenza |
| `src/pages/FondoDirigenzaPage.tsx:58,70,73,76,84,86` | ACTIVE_AUTHORITY | calcolo, writer compatibile e derivati locali; il writer alimenta l'authority del motore |
| `src/pages/FondoDirigenzaPage.tsx:131` | DISPLAY_ONLY | campo disabilitato, visualizza il cached |
| `src/domain/types.ts:204` | PERSISTENCE_COMPAT | proprietà opzionale persistibile |
| `src/schemas/fundDataSchemas.ts:365` | PERSISTENCE_COMPAT | validazione MonetarySchema; boundary generale non modificato |
| `src/constants.ts:210` | PERSISTENCE_COMPAT | default undefined |
| `src/logic/__tests__/art23Complessivo.test.ts:28,191` | LATENT | dataset e test che aspettano contributo dalla sola cache |
| `src/logic/__tests__/mod031bEqSegretarioTotals.test.ts:25,255` | LATENT | input di test legacy |
| `src/logic/__tests__/fixtures/limite2016CharacterizationFixtures.ts:129,330,351` | LATENT | fixture di caratterizzazione con dati cache-only |
| `src/logic/calculation/__tests__/fundEngineArt23FteGate.test.ts:32` | LATENT | input di test |
| `src/logic/calculation/__tests__/fundEngineArt33PolicyGate.test.ts:28` | LATENT | input di test |
| `src/pages/__tests__/preReleaseR2Ux.test.tsx:50` | LATENT | alias di risultato in mock |
| `src/pages/__tests__/ReportsPage.closed.test.tsx:17` | LATENT | alias di risultato in mock |
| `astra_evidence/run_20260921/{compare_oracle,supplement_probes,staging_workflow}.cjs` | DEAD nel runtime prodotto | copie storiche del motore; non eseguite e non modificate |
| `ASTRA_*RECONCILIATION*.md` — tutte le occorrenze censite | RECONCILIATION_ONLY | descrizioni e prove storiche del difetto |
| `docs/audit-logiche-calcolo/fondo_dirigenza.md:34,104,115` | RECONCILIATION_ONLY | documentazione storica del calcolo |

Import, normalizzazione, hydration e save/reload trasportano genericamente il sotto-oggetto Dirigenza. Nessun ulteriore reader economico nominale della cache è stato trovato nei report o nel Wizard. Questi percorsi indiretti restano PERSISTENCE_COMPAT. Le occorrenze aggiunte dal presente report e dal probe sono RECONCILIATION_ONLY.

## Dirigenza domain reconstruction

La tabella seguente documenta il modello corrente, non una policy nuova. Per ogni risorsa atomica: SOURCE=immissione manuale; AUTHORITY=ATOMIC; ZERO_SEMANTICS=importo zero esplicito; MISSING_SEMANTICS attuale=campo opzionale, omissione trattata come zero nei calcoli legacy. Questa semantica legacy non certifica la completezza richiesta dal nuovo resolver. CONSUMERS comuni=pagina, sub-fund, snapshot/import generico; le otto voci YES alimentano anche il writer della cache.

| FIELD | CURRENT_MEANING | SUBJECT_TO_ART23 corrente |
|---|---|---|
| st_art57c2a_CCNL2020_unicoImporto2020 | base stabile certificata 2020 | YES |
| st_art57c2a_CCNL2020_riaPersonaleCessato2020 | RIA cessati entro 2020 | YES |
| st_art56c1_CCNL2020_incremento1_53MonteSalari2015 | incremento contrattuale stabile | NO |
| st_art57c2c_CCNL2020_riaCessatidallAnnoSuccessivo | RIA cessazioni successive | YES |
| st_art57c2e_CCNL2020_risorseAutonomeStabili | stanziamenti stabili autonomi | YES |
| st_art39c1_CCNL2024_incremento2_01MonteSalari2018 | incremento contrattuale stabile | NO |
| st_art24c1_CCNL2022_2024_incremento3_05MonteSalari2021 | incremento contrattuale stabile | NO |
| va_art57c2b_CCNL2020_risorseLeggeSponsor | legge/sponsorizzazioni | NO |
| va_art57c2d_CCNL2020_sommeOnnicomprensivita | onnicomprensività | YES |
| va_art57c2e_CCNL2020_risorseAutonomeVariabili | stanziamenti variabili autonomi | YES |
| va_art57c3_CCNL2020_residuiAnnoPrecedente | residui anno precedente | NO |
| va_dl13_2023_art8c3_incrementoPNRR | incremento PNRR Dirigenza | NO |
| va_art39c1_CCNL2024_recupero0_46MonteSalari2018_2020 | recupero contrattuale | NO |
| va_art39c1_CCNL2024_recupero2_01MonteSalari2018_2021_2023 | recupero contrattuale | NO |
| va_art39c2_CCNL2024_incremento0_22MonteSalari2018_valorizzazione | incremento contrattuale | NO |
| va_art33c2_DL34_2019_incrementoDeroga | incremento DL34 | YES, come nella formula esistente |
| va_art24c3_CCNL2022_2024_incremento0_22MonteSalari2021 | incremento contrattuale | NO |
| va_compensiExLege_rilevanti | compensi classificati rilevanti | YES |
| va_compensiExLege_nonRilevanti | compensi classificati esclusi | NO |

Altri campi, con semantiche distinte:

| FIELD | CURRENT_MEANING / SOURCE | AUTHORITY | SUBJECT / MISSING / ZERO / CONSUMERS |
|---|---|---|---|
| lim_totaleParzialeRisorseConfrontoTetto2016 | totale corrente denormalizzato, writer pagina | CACHE | soggetto per PRE; assente→zero; zero autoritativo errato; motore/pagina/persistenza |
| lim_art23c2_DLGS75_2017_adeguamentoAnnualeTetto2016 | regolazione manuale annuale | ATOMIC | non nella formula delle 8 voci; opzionale→zero; zero nessuna regolazione; pagina/sub-fund |
| lim_art4_DL16_2014_misureMancatoRispettoVincoli | decurtazione manuale | ATOMIC | non nella formula delle 8 voci; opzionale→zero; zero nessuna decurtazione; pagina/sub-fund/reductions |
| u_art64c1_CCNL2024_coperturaInterimDirigenziale | utilizzo manuale interim | ATOMIC | non è risorsa da sommare al consumo; omissione→zero utilizzo; pagina/persistenza |
| u_art24c2_CCNL2026_arretratiRisultato | utilizzo manuale arretrati | ATOMIC | non è risorsa da sommare al consumo; omissione→zero utilizzo; pagina/persistenza |
| historicalData.fondoDirigenza2016 | componente storica manuale del tetto | ATOMIC | limite, non consumo corrente; zero limite storico nullo; historicalLimit2016Core/Wizard |
| annualData.hasDirigenza | presenza del perimetro Dirigenza | ATOMIC | false azzera contributo; true non certifica dati completi; motore/pagina |
| totali stabili/variabili/disponibili/esclusi | somme locali o summary sub-fund | DERIVED | non sostituiscono la classificazione delle singole risorse |

Nota da valutare prima della successiva implementazione: la documentazione storica qualifica l'adeguamento manuale del tetto come «Soggetto», ma la formula corrente della pagina lo omette dal consumo. Non risolta questa differenza e non introdotta alcuna nuova classificazione. Il conflitto golden è già autonomamente sufficiente a imporre STOP, anche senza questi campi, assenti nella fixture.

## Atomic subject/excluded components

La selezione PRE ha otto risorse soggette e undici escluse. Nel caso frozen: soggetto presente=280.000 € (`unicoImporto2020`); esclusi presenti=15.000 € (1,53%) + 5.000 € (residui)=20.000 €. La ricostruzione non assume che tutte le risorse siano soggette.

## Derived resolver

NON IMPLEMENTATO a causa dello STOP. Il probe analitico non è una nuova authority. Nessuna entry Dirigenza aggiunta al ledger FAD.

## Zero vs missing

NON IMPLEMENTATO. La fixture ha sette voci soggette omesse. Se optional=zero, l'importo noto 280.000 € entra nel consumo e cambia il golden; se tali voci sono necessarie, l'esito deve essere UNDETERMINED. Nessun fallback alla cache potrebbe soddisfare l'acceptance. Gli zero espliciti non sono stati confusi con missing nel report.

## Invalid handling

NON IMPLEMENTATO. Nessun nuovo controllo locale né modifica al monetary boundary generale. DATA-03 resta PARTIALLY_FIXED. NaN/Infinity/negativi/malformed non sono stati oggetto di una nuova certificazione.

## Cache reconciliation

NON IMPLEMENTATA. PRE conserva il cached come authority economica. Il confronto diagnostico non viene persistito e non è un meccanismo di reconciliation prodotto.

## Whole-entity aggregation

| Valore nel probe frozen | Baseline | Aggregatore esercitato con soggetto atomico noto |
|---|---:|---:|
| Dirigenza soggetta | 0 € | 280.000 € |
| Consumo complessivo | 1.330.000 € | 1.610.000 € |
| Limite attualizzato | 1.680.000 € | 1.680.000 € |
| Margine | 350.000 € | 70.000 € |
| Conforme | true | true |
| Totale fondo | 1.675.000 € | 1.675.000 € |

Il conflitto riguarda il consumo e il margine, anche se questo specifico dataset rimane conforme in entrambi i casi. Il requisito non permette di ignorarlo solo perché isCompliant non cambia qui.

## No-double-count

Nel probe cambia soltanto il contributo Dirigenza di 280.000 €; totali del fondo e limite invariati. Non eseguito il nuovo test combinato 500+100+100+200+100 per assenza dell'implementazione. Nessuna attestazione di chiusura.

## Legacy snapshots

Cache-only presente anche nelle fixture di caratterizzazione e in `art23Complessivo.test.ts`. Il test corrente Caso 6 si aspetta 35.000 € di contributo dalla sola cache, contrario al nuovo contratto missing→UNDETERMINED. Nessuna fixture storica modificata. Questo residuo va distinto dal golden principale, che contiene invece un atomico soggetto positivo e cache assente.

## Hydration / save-reload

`normalizeInput` copia il sotto-oggetto Dirigenza senza ricostruirne i mancanti. `loadAnnualSnapshot` effettua lettura/parsing dello snapshot; `saveAnnualSnapshot` salva il fundData ricevuto con controllo CLOSED. Nessuna modifica a questi percorsi né accesso al database. Probe eseguito su copie in memoria; fixture non mutata confermata. Test nuovi di hydration/save-reload NON ESEGUITI per STOP.

## CLOSED

Zero writeback dell'audit. Protezioni applicative precedenti invariate; non eseguita nuova verifica funzionale CLOSED dello slice. Nessuna migrazione o riscrittura.

## Cabina

NON MODIFICATA. Il prodotto conserva il contratto corrente: canonical INVALID→BLOCKED e UNDETERMINED→TO_COMPLETE. Nessuno stato nuovo Dirigenza propagato; nuove prove di integrazione NON ESEGUITE. Non dichiarato PASS dello slice.

## Document readiness

NON MODIFICATA. Nuovi test Dirigenza NON ESEGUITI. Nessuna attestazione di documenti definitivi per dati incompleti o invalidi.

## Closure readiness

NON MODIFICATA. Nuovi test Dirigenza NON ESEGUITI. Nessuna chiusura o chiamata RPC.

## Active authority inventory POST

| Consumer attivo | Dirigenza source | Authority POST | Cache used economically? |
|---|---|---|---|
| fundEngine / consumo Art23 | cache legacy con fallback zero | ACTIVE_AUTHORITY, invariata | YES |
| compliance / checks | consumo del motore | dipende indirettamente dalla cache | YES |
| Cabina / document / closure | risultati e check upstream | dipendenza indiretta invariata | YES |
| pagina Dirigenza / totale soggetto | cached scritto dall'effetto | display di cached, invariato | valore può alimentare il motore |
| totali sub-fund Dirigenza | risorse atomiche | derivata, invariata | NO |
| report/read model Art23 | risultato del motore | dipendenza indiretta invariata | YES |
| persistence/import | sotto-oggetto Dirigenza | compatibilità, invariata | trasporta il dato |

**ACTIVE_DIRIGENZA_CACHE_AUTHORITIES = 1** reader diretto economico. Il numero non somma ripetutamente i consumer downstream della stessa authority. Il criterio di chiusura pari a zero NON è soddisfatto.

## Tests

| Verifica offline eseguita | Risultato | Qualifica |
|---|---|---|
| Probe frozen + counterfactual in memoria | conflitto confermato, exit 0 | audit, non test di resolver implementato |
| `scripts/run_regression_tests.ts` | 8/8, exit 0 | BASELINE INVARIATA |
| `scripts/run_wave2_oracle.ts` | 14/14, exit 0 | BASELINE INVARIATA |
| `git diff --check` | exit 0 | working tree corrente |
| Confronto SHA-256 1.136 file PRE | zero modifiche/rimozioni | preservazione dello scope |

Log completi e probe riproducibile in `art23_dirigenza_evidence`. Binaries locali `vite-node`, nessun npm/npx o registry. Config offline copiata in TEMP senza modificare l'evidence DL25. Guard `scripts/pnrr-offline-guard.cjs` caricato tramite NODE_OPTIONS. Un primo avvio nel sandbox non ha potuto caricare la config per restrizioni esbuild; ripetuto con accesso locale autorizzato. Corretto un import Windows assoluto nel probe; queste prove non sono conteggiate come PASS di prodotto.

PRODUCT_NETWORK_ATTEMPTS=0; TOOLING_NETWORK_ATTEMPTS=8, tutte richieste di risoluzione dell'etichetta localhost intercettate e risposte in memoria dal guard. Nessuna risoluzione reale né connessione socket. REAL_NETWORK_CONNECTION_ESTABLISHED=NO. Eventi con stack in `network-events.json`.

Nuovi resolver/unit/cache-poisoning/zero/missing/invalid/whole-entity/legacy/CLOSED/hydration/save-reload tests: NOT_RUN_STOP. Full product Vitest, TypeScript e suite specifiche Cabina/Distribution/Document/Closure/DL25/PNRR/XLS/PDF/Auth: NOT_RUN_STOP. Non eseguiti generatori che riscrivono `evidence_wave3_hardening`. I test di baseline non certificano la correzione non implementata.

## Verified-fixed regressions

Tutti i sorgenti, fixture, review ed evidence PRE dei finding SEC-01, DATA-02, CALC-01, CALC-02, CALC-03, CALC-05, DOC-01, DOC-02, NORM-01, NORM-03, NORM-04, FUNC-01 e FUNC-02 sono byte-identici. DL25 e PNRR immutati. Regression 8/8 e oracle 14/14 baseline confermati; nessun claim di nuova verifica completa di questi finding.

## Scope integrity

Solo il presente report e la nuova cartella `art23_dirigenza_evidence` sono stati aggiunti al workspace; file di esecuzione in TEMP. Zero file applicativi modificati; zero file PRE rimossi/modificati. Branch e HEAD invariati, index vuoto, tutti gli untracked precedenti preservati. Nessun database, migration, staging, production, deploy, add, commit, push o PR. Le richieste precedenti DL25 restano preservate.

## CALC-04 reassessment

**PARTIALLY_FIXED**, non CANDIDATE_VERIFIED_FIXED. Lo slice è BLOCKED, non CLOSED_LOCALLY. La cache è ancora authority e il difetto originale permane. ASTRA globale resta 13/8/4 senza aggiornamenti.

## ARCH-01 residual

**PARTIALLY_FIXED**. Nessuna riduzione del debito architetturale eseguita. Residui quali `FundDetailsPage/constitution.sections` fuori scope.

## Next gate

Prima dell'implementazione serve risolvere il conflitto di contratto sui golden: autorizzare una revisione mirata e motivata del risultato atteso Dirigenza, preservando la baseline storica e decidendo esplicitamente quali atomici sono necessari e quali opzionali. Non è autorizzato cambiare le fixture per rendere verde il test né conservare l'omissione dei 280.000 € nel prodotto.

Dopo una nuova istruzione che rimuova il vincolo incompatibile: implementare solo CALC-04, eseguire tutta la matrice e i quality gates dell'allegato, quindi `ART23_DIRIGENZA_DERIVED_CONSUMPTION_INDEPENDENT_REVIEW`. La review indipendente non è raccomandata come certificazione di un fix che oggi non esiste.

```text
ART23_DIRIGENZA_DERIVED_CONSUMPTION_IMPLEMENTATION = BLOCKED
RESULT = BLOCKED
STOP_CODE = ART23_DIRIGENZA_GOLDEN_CONFLICT
BRANCH = ux/toolbox-area-fondo-prototype
HEAD = d3170f959b5815c514dbf3d6e5f93366a5f14c67
ASTRA_BASELINE = VF_13_PF_8_OPEN_4
DATA_01_STATUS = OPEN
DATA_03_STATUS = PARTIALLY_FIXED
ORIGINAL_CALC04_ACCEPTANCE = TOTALI_SEMPRE_DERIVATI_CACHE_INVARIANTE
DIRIGENZA_CACHE_FIELD = lim_totaleParzialeRisorseConfrontoTetto2016
PRE_CACHE_AUTHORITY = fundEngine:354_CACHE_OR_ZERO
DIRIGENZA_DERIVED_RESOLVER = NOT_IMPLEMENTED_STOP
DIRIGENZA_RESOLVER_PURITY = NOT_ASSESSED
DIRIGENZA_ATOMIC_SOURCE = 8_EXISTING_SUBJECT_FIELDS_INVENTORIED
DIRIGENZA_SUBJECT_AMOUNT = CACHE_PRE_UNCHANGED
DIRIGENZA_EXCLUDED_AMOUNT = FROZEN_FIXTURE_20000_ANALYTIC_ONLY
CACHE_USED_AS_ECONOMIC_AUTHORITY = YES
CACHE_RECONCILIATION = NOT_IMPLEMENTED_STOP
DERIVED_ZERO_CACHE_POSITIVE = NOT_TESTED_STOP
MISSING_ATOMIC_CACHE_PRESENT = NOT_IMPLEMENTED_STOP
HAS_DIRIGENZA_FALSE_CACHE_POSITIVE = NOT_TESTED_STOP
CACHE_0_RESULT = NOT_TESTED_NEW_RESOLVER
CACHE_2000_RESULT = NOT_TESTED_NEW_RESOLVER
CACHE_999999_RESULT = NOT_TESTED_NEW_RESOLVER
CACHE_INDEPENDENCE = FAIL_PRE_UNCHANGED
WHOLE_ENTITY_ART23_AGGREGATION = GOLDEN_1330000_VS_KNOWN_ATOMIC_1610000
DIRIGENZA_DOUBLE_COUNT = NOT_CERTIFIED_NEW_SLICE
ACTIVE_DIRIGENZA_CACHE_AUTHORITIES = 1
LEGACY_CACHE_FALLBACK = PRESENT
CLOSED_WRITEBACK = 0_AUDIT_ONLY
CABINA_DIRIGENZA_INVALID = NOT_TESTED_STOP
CABINA_DIRIGENZA_UNDETERMINED = NOT_TESTED_STOP
DOCUMENT_READINESS_DIRIGENZA_INVALID = NOT_TESTED_STOP
DOCUMENT_READINESS_DIRIGENZA_UNDETERMINED = NOT_TESTED_STOP
CLOSURE_READINESS_DIRIGENZA_INVALID = NOT_TESTED_STOP
CLOSURE_READINESS_DIRIGENZA_UNDETERMINED = NOT_TESTED_STOP
DL25_REGRESSION = SOURCES_UNCHANGED_FULL_SUITE_NOT_RERUN
PNRR_REGRESSION = SOURCES_UNCHANGED_FULL_SUITE_NOT_RERUN
ASTRA_BLOCKERS_OPEN = 0_BASELINE
CALC_04_STATUS_AFTER_SLICE = PARTIALLY_FIXED
ARCH_01_STATUS_AFTER_SLICE = PARTIALLY_FIXED
FILES_CHANGED_THIS_SLICE = 0_EXISTING_FILES_REPORT_AND_AUDIT_ARTIFACTS_ADDED
DIRIGENZA_UNIT_TESTS = NOT_RUN_STOP
CACHE_POISONING_TESTS = NOT_RUN_STOP
WHOLE_ENTITY_ART23_TESTS = NOT_RUN_STOP
LEGACY_TESTS = NOT_RUN_STOP
CLOSED_TESTS = NOT_RUN_STOP
FUND_ENGINE_TESTS = NOT_RUN_STOP
CANONICAL_FAD_REGRESSION = BASELINE_ORACLE_PASS
CABINA_REGRESSION = NOT_RUN_STOP
DISTRIBUTION_REGRESSION = NOT_RUN_STOP
DOCUMENT_READINESS_REGRESSION = NOT_RUN_STOP
CLOSURE_READINESS_REGRESSION = NOT_RUN_STOP
XLS_REGRESSION = NOT_RUN_STOP
PDF_REGRESSION = NOT_RUN_STOP
AUTH_REGRESSION = NOT_RUN_STOP
FULL_PRODUCT_TESTS = NOT_RUN_STOP
REGRESSION = BASELINE_8_OF_8
ORACLE = BASELINE_14_OF_14
TYPESCRIPT = NOT_RUN_STOP
DIFF_CHECK = PASS
PRODUCT_NETWORK_ATTEMPTS = 0
TOOLING_NETWORK_ATTEMPTS = 8_LOCALHOST_LABEL_INTERCEPTED
REAL_NETWORK_CONNECTION_ESTABLISHED = NO
SCOPE_INTEGRITY = PASS_1136_PRE_FILES_UNCHANGED
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
ART23_DIRIGENZA_DERIVED_CONSUMPTION_STATUS = BLOCKED
REPORT = ART23_DIRIGENZA_DERIVED_CONSUMPTION_IMPLEMENTATION_REPORT.md
NEXT_GATE_RECOMMENDATION = GOLDEN_CONTRACT_RESOLUTION_THEN_IMPLEMENTATION_AND_INDEPENDENT_REVIEW
```
