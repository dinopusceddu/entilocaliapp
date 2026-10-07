# ACTIVE_LEGACY_ECONOMIC_AUTHORITY_RETIREMENT — ARCH-01

## Executive result

Implementazione limitata ad ARCH-01. `canonicalFundLedger` rimane l'unica authority economica FAD attiva. Il motore non esegue più `calculateFadTotals`; `constitution.sections` è una proiezione del canonico; Dettagli legge direttamente il canonico; la pagina FAD non ha più fallback economici indipendenti. Nessuna formula del ledger è stata modificata.

RESULT=PASS. CLOSED_LOCALLY; ARCH_01_STATUS_AFTER_SLICE=CANDIDATE_VERIFIED_FIXED. Full product 1902/1902, 139 file, zero skipped; matrice mirata 74/74; regression 8/8; oracle 14/14; TypeScript e diff-check PASS. Risultato finale dei gate e output terminale: `arch01_retirement_evidence/terminal-output.txt`. Censimento eseguibile: `authority-census.json`. Stato candidato soggetto a independent review; reconciliation ASTRA non modificata.

## Baseline

Branch: `ux/toolbox-area-fondo-prototype`. HEAD: `d3170f959b5815c514dbf3d6e5f93366a5f14c67`. Entrambi verificati prima delle modifiche. Eseguiti branch, rev-parse, status completo, diff name-status e cached diff. Index vuoto; working tree intenzionalmente già avanzato e preservato. Nessun checkout/pull/restore/reset/stash/merge/rebase/add/commit/push/PR/deploy.

SHA-256 PRE dei file pertinenti: `arch01_retirement_evidence/pre-sha256.json` (src, scripts, tests, public e configurazioni). Copie PRE dei sette file inizialmente previsti; stato/diff PRE conservati. Backup reale locale scoperto con ricerca `--hidden --no-ignore`, hash prima del suo confronto in `real-snapshot-pre-sha256.json`. Nessun file untracked cancellato. Nessun AGENTS.md trovato nella ricerca del repository.

ASTRA baseline corretta: VF=15, PF=7, OPEN=3, TOTAL=25, ASTRA_BLOCKERS_OPEN=0. Non aggiornata durante implementation. DATA-01: demo rimossi, required missing/undefined; nessun azzeramento economico. Policy document kind invariata.

## ARCH-01 original acceptance

`ONE ACTIVE ECONOMIC AUTHORITY`. Il dataset MS2021=1.000.000 con `st_art58c1_CCNL2026_incremento014_MS2021=1400` produce 1400 nel canonico e in ogni vista FAD attiva. Il valore legacy 0 resta riproducibile solo chiamando esplicitamente il helper latent nei test, non nel runtime attivo.

## PRE active authority graph

Grafo completo con i nove attributi richiesti, salvato **prima delle modifiche production**: [PRE_ACTIVE_AUTHORITY_GRAPH.md](arch01_retirement_evidence/PRE_ACTIVE_AUTHORITY_GRAPH.md).

PRE: un'autorità canonica e tre nodi di produzione/esposizione indipendente degli aggregati: helper calculateFadTotals, composition legacy sections nel motore, helper/fallback locale nella pagina FAD. FundDetails è il consumer attivo delle sezioni legacy. Questo conteggio distingue nodi di authority da consumer e re-export: non sono quattro formule indipendenti.

Grafo POST: FundData -> normalizzazione atomica già esistente -> canonicalFundLedger -> canonical projection/read models -> UI e writer attivi. Le righe atomiche erano già input del ledger PRE; i loro importi e classificazioni non sono stati cambiati.

## Active vs latent classification

FundDetails è ACTIVE: module registry `fundDetails`, sidebar FONDO, issue `relatedPage`, CTA di gestione annualità e target consultativo CLOSED. FondoAccessorioDipendentePage è ACTIVE: registry `fondoDipendenti`, sidebar e corrective links. Entrambe restano raggiungibili.

Root PDF/PDF2/XLS e TXT storico sono LATENT: zero importer/caller operativo; nessuna selezione dinamica. `createReportViewModel.fondoDipendenti` viene costruito ma non letto dai writer moderni: proprietà LATENT/compatibility. Nessuna cancellazione aggressiva.

I rami documentali per DTO sintetici senza canonico restano compatibility-only: non sono prodotti dal motore attivo. AppContext inizializza/azzera calculationResult, poi riceve il risultato del motore, sempre dotato di canonicalFund. Anche il fondo economicamente vuoto ha entry canoniche required. Gli importi di quei rami non possono sostituire il canonico nelle pagine migrate né nei writer moderni.

## Canonical ledger authority

`src/logic/calculation/canonicalFundLedger.ts` e `src/domain/canonicalFundLedger.ts` invariati rispetto al PRE sporco. Le sezioni input del ledger sono lette solo per gli items, non per section.total. Il nuovo adattatore preserva integralmente le righe normalizzate, senza aggregati economici. La summary FAD copia verifiedStableTotal, verifiedVariableTotal e verifiedTotal, senza ricostruire totaleFondo.

Nessun CANONICAL_LEDGER_SEMANTIC_GAP rilevato. PNRR/DL25/Art60, resolver Dirigenza e whole-entity Art23 non modificati.

## calculateFadTotals analysis

PRE_ROLE=ACTIVE_INDEPENDENT_AUTHORITY. POST_ROLE=LATENT. La funzione e il re-export accessory restano disponibili per compatibilità/test; non hanno caller runtime. Il vecchio controesempio 0 è mantenuto in un test che prova il retirement.

`buildFadLedgerInputSections` separa l'adattamento atomico dagli aggregati. Condivide le regole già presenti (alias e normalizzazione di singola voce); i total dei DTO input sono placeholder inerti. `calculateFadTotals` riusa l'adattatore e conserva la sua contabilità storica solo nel percorso latent. Questo modifica fundCalculations.ts, fuori dall'elenco production ristretto iniziale, perché è necessario evitare l'esecuzione degli aggregati concorrenti nel motore senza duplicare o cambiare l'adattamento delle righe del ledger. Nessun altro calcolo nel file è cambiato.

## constitution.sections analysis

Strategia B. PRE_ROLE=ACTIVE_INDEPENDENT_AUTHORITY. POST_ROLE=CANONICAL_PROJECTION. `fundEngine` assegna esclusivamente `projectCanonicalFadSections(canonicalFund).sections`.

Stable section usa verifiedStableTotal del canonico. Le sezioni variabili raggruppano le sole entry economiche canoniche SUBJECT, EXCLUDED e UNDETERMINED; non leggono FundData. I campi numerici di compatibilità sono subtotali verificati, accompagnati da status, authoritativeTotal nullable e unresolvedItems. Nessun consumer attivo somma questi gruppi per ricostruire il totale finale.

`constitution.total` non è un campo del DTO FundResult: il simbolo presente nella Cabina appartiene al suo read model e deriva già dal canonico. Rimane invariato.

## Canonical compatibility projection

Nuovo `src/domain/canonicalFadProjection.ts`, funzione pura e tipizzata, input esclusivamente CanonicalFundResult. Riusa projectFadReport per ID, descrizione canonica esistente e signedAmount. Nessun description.includes, mapping per label o raw-field sum.

Semantic ID e metadata completi sono preservati in canonicalEntry. Per il namespace strutturato LEGACY_FAD_RESOURCE il compatibility key conserva la chiave atomica preesistente; i gruppi sono sempre derivati da component/art23Treatment canonici. Questa scelta preserva il contratto Art79 senza modificare il suo test economico.

Final stable/variable/total e subject/excluded sono nullable e non pubblicati come definitivi su INVALID/UNDETERMINED. I subtotali verificati restano distinguibili. Le entry unresolved mantengono amount nullable/provisional, status e provenance. economicEffect=false non entra nelle righe economiche; verifiedArt23Subject/Excluded provengono direttamente dal ledger e preservano i suoi movimenti figurativi.

CANONICAL_PROJECTION_DETAIL_GAP=NO: sono disponibili ID, descrizione del read model già esistente (anche identificatore tecnico per le risorse legacy generiche), component, treatment, amount, operation, source, competence/origin year, status e provenance. Non sono state inventate descrizioni o provenienze mancanti.

## FundDetails migration

La pagina usa due read model memoizzati del risultato canonico. Ignora constitution.sections e summary FAD salvate/stale. Espone stable, variable, total, subject/excluded; in missing/invalid mostra indisponibilità e subtotali qualificati. Il totale da tutti i fondi compone la quota FAD canonica e le summary degli altri fondi: non usa un totale globale stale per reintrodurre una quota FAD diversa.

Righe read-only con semantic ID, signedAmount, status, manual/calculated/transferred source, normativa, origin year e reason. Nessun input editabile o writer. I test montano il componente selezionato da getModuleById/getAccessibleModuleOrFallback reali e aprono le Card reali.

## FondoAccessorioDipendentePage migration

Rimosso calculateFadTotals e tutti i fadTotals/fallback. Una projection memoizzata alimenta gli aggregati; risultato assente -> unavailable, senza ricalcolo locale indipendente. Il prospetto aggregato Art23 non viene mostrato se il risultato manca; non produce più zeri di cortesia transitori.

Le righe editabili rimangono esplicitamente `Campi di input / fonte`, senza attribuire loro autorità economica. Deductions sono un dettaglio canonico qualificato come già incluso nei totali. Aggiunto riepilogo canonico di totale variabile e subject/excluded FAD, distinto dal prospetto whole-entity già esistente. Le regole input preesistenti e la policy Art23 non sono state riscritte.

## Report view model analysis

createReportViewModel invariato. fadCanonical è l'unico ramo letto da XLS/PDF moderni. fondoDipendenti è LATENT: nessun writer operativo legge costituzione/utilizzi/totaleDisponibile legacy. Per i risultati del motore, le sue sezioni sono ora già proiezioni canoniche; restano possibili DTO sintetici divergenti nei test. I poisoning test con getter legacy che lancia un errore continuano a passare.

## Legacy root services analysis

Root `src/services/pdfReportService.ts`, `pdfReportService2.ts`, `xlsReportService.ts`: LATENT. Il test storico Art79 del root PDF resta eseguito, senza rendere quel service attivo. `generateDeterminazioneTXT`/determinaTemplate storico: LATENT, zero caller runtime. reportService operativo importa esplicitamente i servizi documents/. Nessuna modifica ai file storici.

## Dynamic import / registry audit

Censimento TypeScript AST eseguibile in `arch01_retirement_evidence/authority-census.mjs`: 287 file runtime, escludendo solo file test per l'analisi della reachability. Zero dynamic import runtime, zero importer root services, zero call expressions a calculateFadTotals o generateDeterminazioneTXT. Anche re-export, registry e stringhe di navigazione cercati. I due import(...) trovati nel catalogo wizard sono type expressions.

Registry/sidebar/issue navigation conservati; test U7 e regressioni navigation della suite completa. DYNAMIC_IMPORT_AUDIT=PASS.

## Stable / variable / total consistency

Test UI attraverso registry reale e probe export effettivamente serializzati/riaperti. `display-consistency.json` e file .pdf/.xlsx/.txt conservati in arch01_retirement_evidence.

| Consumer attivo | Stabile (014) | Variabile only | Misto stable/variable/total |
|---|---:|---:|---|
| canonical ledger | 1400 | 600 | 1400 / 600 / 2000 |
| FAD page | 1400 | 600 | 1400 / 600 / 2000 |
| FundDetails via registry | 1400 | 600 | 1400 / 600 / 2000 |
| constitution compatibility | 1400 | 600 | 1400 / 600 / 2000 |
| report model fadCanonical | 1400 | 600 | 1400 / 600 / 2000 |
| PDF reale, testo estratto | 1400 | 600 | 1400 / 600 / 2000 |
| XLS reale, buffer ricaricato | 1400 | 600 | 1400 / 600 / 2000 |

Tutti concordano anche sullo zero. I writer non leggono il getter legacy avvelenato. Non è necessario eseguire i servizi latent per l'acceptance.

## Subject / excluded consistency

Totali subject/excluded copiati dal ledger, incluso il suo contratto su figurative/overtime. Nessuna riclassificazione Art23 in UI. Gruppi variabili ricavati da treatment canonico, non da field definitions. Unit test subject VARIABLE ed excluded STABLE; test UI sul breakdown dei risultati reali, entry excluded CCNL, PNRR e Art60. Le sezioni sono subtotali economici; il totale subject è quello del ledger e non la somma dei soli gruppi economici, preservando i figurativi.

## Zero / missing / invalid

Zero VALID -> 0, anche con raw fields positivi e DTO summary/sections stale. UNDETERMINED/INVALID -> nessun totale definitivo alternativo; subtotali verificati espliciti. canonical assente -> non disponibile, non total ?? 0. Amount unresolved non promosso a valore verificato. UNDETERMINED_LEGACY_ESCAPE=ABSENT; INVALID_LEGACY_ESCAPE=ABSENT.

## PNRR regression

Core PNRR invariato. Nuovo test UI raw positive 3000 con decisione/evidenze unresolved: entry non autorevole, zero subtotale noto qualificato, nessun totale positivo definitivo. Decisione/evidenze validate: stessa entry canonica 3000 in Dettagli e nei gruppi FAD. Suite faculty/pipeline/wizard eseguite integralmente.

## DL25 regression

Core DL25 invariato. Test UI stock 19000 derivato da prior 4000 + currentYearDelta 15000 e baseline canonica: entry VALID, stesso importo una sola volta. Carry-forward, regime date, baseline e net/gross non modificati. Regressioni DL25 incluse nella full suite e oracle.

## Art60 regression

Formula e trattamento invariati. Nel 2026 la deduction 127,44 compare una volta; figurative entry esclusa dalle righe economiche, mantenuta dal subject canonico. Nel 2025 la proiezione usa Art60 canonico zero, non il raw 127,44. Aggiornate soltanto tre aspettative obsolete sulla sezione/voce legacy in test di read model/XLS/PDF; input e aspettative documentali canoniche invariati.

## Whole-entity Art23 regression

Resolver Dirigenza, riduzioni, classification Art23 e componenti EQ/Segretario/Dirigenza/overtime invariati. Confronto PRE/POST sulle otto fixture: canonicalFund, totals, compliance e reductions identici; altri fondi identici. Nessuna entry Dirigenza inserita nel ledger FAD. CALC-04 e test whole-entity eseguiti nella full suite.

## CLOSED / empty entity

CLOSED: Dettagli solo lettura; FAD input disabilitati, nessun dispatch/save della projection, byte del fundData invariati. Nessuna migration/writeback/persistence della projection.

Nuovo ente: required missing/undefined preservati; nessun INITIAL demo importato. Test empty con sola decisione amministrativa Art33 esplicita per raggiungere il ledger, senza evidenze economiche inventate. In assenza di risultato: UI unavailable. In presenza di canonico undetermined: nessun falso totale zero definitivo.

Snapshot reali: backup_user_app_state.json, quattro record completi letti offline senza esportare identità personali. `real-snapshot-comparison.json`: due record attraversano engine PRE/POST con risultati identici; gli altri due conservano il medesimo blocco Art33 per scelta amministrativa mancante e sono confrontati direttamente nel ledger. Tutti e quattro hanno canonical economics e canonical Art23 identici. Nessuna scelta amministrativa inventata per bypassare il gate; bytes del backup invariati. Otto fixture complete confrontate anche per altri fondi e whole-entity compliance. Hash del backup acquisito prima della lettura/comparazione; nessun accesso al database.

## Active authority census POST

| PATH | SYMBOL | ACTIVE? | USER_REACHABLE? | ECONOMIC_SOURCE | POST_ROLE |
|---|---|---|---|---|---|
| logic/calculation/canonicalFundLedger.ts | build/derive canonical ledger | YES | YES, tramite consumer | CANONICAL | ACTIVE_AUTHORITY |
| logic/calculation/fundCalculations.ts | buildFadLedgerInputSections / getFadEffectiveValueHelper | YES | tramite engine | normalizzazione atomica upstream, nessun aggregato | COMPATIBILITY_ONLY input adapter |
| logic/calculation/fundCalculations.ts | calculateFadTotals / totaleStabile_Dipendenti / sommaVariabili* / totaleRisorseDisponibili* | NO | NO | independent storico | LATENT |
| logic/accessory.ts | helper re-export | NO caller | NO | nessun calcolo al re-export | LATENT |
| domain/canonicalFadProjection.ts | projectCanonicalFadSections | YES | YES | CANONICAL | ACTIVE_CANONICAL_PROJECTION |
| domain/documentProjection.ts | projectFadReport | YES | YES | CANONICAL | ACTIVE_CANONICAL_PROJECTION |
| logic/calculation/fundEngine.ts | constitution.sections / section.total | YES | YES | CANONICAL_PROJECTION | ACTIVE_CANONICAL_PROJECTION |
| logic/calculation/fundEngine.ts | dipendente.summary.totaleStabile/Variabile/Fondo | YES | YES | CANONICAL verified subtotals | ACTIVE_CANONICAL_PROJECTION |
| logic/calculation/fundEngine.ts | whole-entity totals / art23Compliance | YES | YES | canonical quota FAD + altri fondi | ACTIVE_CANONICAL_PROJECTION |
| pages/FundDetailsPage.tsx | main FAD totals / detail rows / all-funds total | YES | YES, registry/issue/CTA | CANONICAL_PROJECTION | ACTIVE_CANONICAL_PROJECTION |
| pages/FondoAccessorioDipendentePage.tsx | stable/variable/total/groups/subject/excluded/deductions | YES | YES, registry | CANONICAL_PROJECTION | ACTIVE_CANONICAL_PROJECTION |
| pages/FondoAccessorioDipendentePage.tsx | funding form fields | YES | YES | raw input chiaramente qualificato | DISPLAY_ONLY source/input |
| presenters/reportPresenter.ts | fadCanonical | YES | YES, exports | CANONICAL_PROJECTION | ACTIVE_CANONICAL_PROJECTION |
| presenters/reportPresenter.ts | fondoDipendenti compatibility summary | costruito, NON letto | NO | proiezione engine, o DTO sintetico | LATENT |
| services/documents/pdfReportService.ts | modern PDF | YES | YES | fadCanonical | ACTIVE_CANONICAL_PROJECTION |
| services/documents/xlsReportService.ts | modern XLS | YES | YES | fadCanonical | ACTIVE_CANONICAL_PROJECTION |
| services/reportService.ts | PDF/XLS orchestration | YES | YES | modern canonical writers | ACTIVE_CANONICAL_PROJECTION |
| domain/documentProjection.ts; presenters/documentPresenter.ts | administrative projection | YES | YES | canonical entries/result | ACTIVE_CANONICAL_PROJECTION |
| services/documents/documentFactory.ts; services/templates/* | DETERMINA/RELAZIONE/PROSPETTO | YES | YES | canonical document projection | ACTIVE_CANONICAL_PROJECTION |
| logic/calculation/tabella15Mapper.ts; pages/Tabella15Page.tsx | canonical exports | YES | YES | canonical entries/result | ACTIVE_CANONICAL_PROJECTION |
| presenters/documentPresenter.ts; domain/documentProjection.ts; logic/calculation/tabella15Mapper.ts | no-canonical synthetic fallback | NO nel runtime engine | NO | sintetico legacy | COMPATIBILITY_ONLY |
| logic/cabina/*; pages/CabinaDiRegiaPage.tsx | constitution read model | YES | YES | CANONICAL | ACTIVE_CANONICAL_PROJECTION |
| logic/distribution/*; pages/DistribuzioneRisorsePage.tsx | budget FAD | YES | YES | CANONICAL | ACTIVE_CANONICAL_PROJECTION |
| pages/ChecklistPage.tsx; components/chatbot/ChatWindow.tsx | context summary / aggregate totals | YES | YES | engine canonical verified quota FAD | ACTIVE_CANONICAL_PROJECTION |
| pages/HomePage.tsx; components/dashboard/FundAllocationChart.tsx | summary display | NO route | NO | engine canonical projection | LATENT |
| logic/calculation/closureCalculations.ts | leftoverFad | YES | YES | risparmi distribution, non constitution | DISPLAY_ONLY per authority census |
| services/pdfReportService.ts | root PDF | NO | NO | independent storico | LATENT |
| services/pdfReportService2.ts | root PDF2 | NO | NO | independent storico | LATENT |
| services/xlsReportService.ts | root XLS | NO | NO | independent storico | LATENT |
| services/reportService.ts; services/determinaTemplate.ts | generateDeterminazioneTXT / buildDetermina | NO | NO | independent storico | LATENT |
| application/registry/moduleRegistry.ts; areaFondo sidebar; compliance issues; closed CTA | navigation | YES | YES | NONE | DISPLAY_ONLY |

ACTIVE_LEGACY_ECONOMIC_AUTHORITIES=0. ACTIVE_INDEPENDENT_FAD_FORMULAS=0. ACTIVE_DUPLICATE_FAD_RULES=0. ACTIVE_FAD_FALLBACK_AUTHORITIES=0.

L'unica aritmetica di raggruppamento della projection usa signedAmount di entry già canoniche. Le somme UI all-funds aggiungono esclusivamente la quota canonica FAD ad altre quote: non sono formule autonome di costituzione FAD. Gli adattatori di singola voce upstream rimangono parte della pipeline canonica già esistente, non authority aggregate parallele.

## Latent cleanup debt

LEGACY_CLEANUP_DEBT: helper calculateFadTotals e re-export; root PDF/PDF2/XLS; storico determina TXT/template; property report fondoDipendenti; HomePage/chart non registrati; rami compatibility per test senza canonico. Zero caller operativo/selection runtime, nessuna influenza sui writer attivi. Non cancellati nello slice.

## Tests

Gate finali e conteggi per suite: `arch01_retirement_evidence/test-summary.json`, log/JSON dei runner e output terminale. Full product usa la stessa policy offline PRE: tutti i test src, escluso soltanto il historical evidence generator wave3HardeningEvidence già escluso nella baseline; nessun product test normale escluso.

| Gate | Risultato |
|---|---|
| Full product | 1902/1902, 139 file, zero skipped |
| Matrice mirata, 5 file | 74/74 |
| Nuovi projection/census test | 11/11 |
| Nuovi test UI registry | 13/13 (12 raggiungono Dettagli, 12 raggiungono FAD) |
| PNRR | 66/66 su 5 file + nuove UI |
| DL25 | 105/105 su 9 file + nuova UI stock/delta |
| Art60 / canonical contract | 26/26 su 2 file + nuove UI |
| CALC-04 | 96/96 su 3 file |
| DATA-01 | 65/65 su 2 file |
| Whole-entity Art23 | 128/128 su 5 file |
| Cabina | 111/111 su 5 file |
| Distribution | 84/84 su 6 file |
| Document readiness | 81/81 su 2 file |
| Closure readiness | 38/38 su 2 file |
| CLOSED/closure/post-close | 110/110 su 9 file + nuova UI |
| XLS | 16/16 + 4 export reali |
| PDF | 17/17 + 4 export reali |
| FAD read model | 17/17 |
| Auth/security/ownership | 162/162 su 6 file |
| PRE/POST fixture | 8/8 |
| PRE/POST backup reale | 4/4 ledger; 2/2 engine completi + 2/2 gate invariati |
| Regression | 8/8 |
| Oracle | 14/14 |
| TypeScript | PASS, exit 0 |
| git diff --check + whitespace nuovi file | PASS |

I gruppi sono selezioni documentate per nome file e possono sovrapporsi: non sommarli per ricavare il totale prodotto. Nessuna regressione protetta rilevata.

Matrice mirata: canonical projection unit/census; FundDetails e FAD integration tramite registry; 014/variable/mixed/excluded/zero/undetermined/invalid; PNRR unresolved/validated; DL25 stock; Art60; CLOSED/empty/stale; navigation. Writer reali estratti/serializzati. TypeScript e diff-check. Regression 8/8 e oracle 14/14 richiesti, senza aggiornare fixture.

La prima full suite: 1901/1902, errore di chiave di compatibilità Art79 (importo canonico preservato). Risolto preservando il compatibility key; quel test invariato. I fallimenti intermedi dei nuovi test riguardavano locator/shape unavailable e il gate amministrativo empty, corretti nei test senza cambiare policy/core. Evidenza iniziale conservata in full-product-initial.json.

## Verified-fixed regressions

SEC-01, DATA-01, DATA-02, CALC-01..05, DOC-01..02, NORM-01/03/04, FUNC-01..02 protetti. Suite Auth/security, empty initialization, snapshots/CLOSED/post-close, whole-entity Art23/Dirigenza, Cabina/Distribution, document readiness/closure readiness, PNRR/DL25/Art60, FAD read model e canonical PDF/XLS incluse nella full suite. Nessuna esclusione per far passare test. NORM-02/DATA-03/ARCH-02 e gli altri finding non implementati.

## Scope integrity

Production: fundEngine, estrazione strettamente necessaria in fundCalculations, nuovo canonicalFadProjection, FundDetailsPage e FondoAccessorioDipendentePage. Test: due file nuovi e tre aggiornamenti mirati di aspettative obsolete. Nessun altro source production modificato.

Report/evidence: grafo, hash, copie PRE, audit statico, runner esclusivamente locale, confronti snapshot e output export. Le copie engine/calculations PRE sono probe offline di evidenza, non importate dal prodotto o dai test product. Nessun writer verso snapshot/database.

Source delta rispetto agli hash PRE in scope-integrity.json: 7 file esistenti cambiati, 3 source nuovi, totale 10 (5 production, 5 test). Golden/oracle e tutti i core protetti verificati tramite hash. Network guard respinge socket/dgram/DNS esterni; gli unici eventi locali localhost sono risoluzioni in memoria del tooling Vite, senza connessione. PRODUCT_NETWORK_ATTEMPTS=0, TOOLING_NETWORK_ATTEMPTS=0 (outbound; contatore delle risoluzioni locali non di rete in network-events.json), REAL_NETWORK_CONNECTION_ESTABLISHED=NO. Nessun browser, registry/package fetch, staging, production o Supabase reale.

## ARCH-01 reassessment

Tutti i gate finali sono verdi: ACTIVE_LEGACY_ECONOMIC_AUTHORITY_RETIREMENT=CLOSED_LOCALLY; ARCH_01_STATUS_AFTER_SLICE=CANDIDATE_VERIFIED_FIXED. Non dichiarato VERIFIED_FIXED. ASTRA resta VF15/PF7/OPEN3, blockers0. Dopo review indipendente positiva, e solo allora: VF16/PF6/OPEN3.

## Next gate

ACTIVE_LEGACY_ECONOMIC_AUTHORITY_RETIREMENT_INDEPENDENT_REVIEW. Verificare il grafo/censimento, le differenze PRE dirty, i casi controesempio e gli artefatti reali. Fermarsi dopo questo slice. Nessuna implementazione MONETARY_INPUT_BOUNDARY, CCNL_RECOVERY_INSTRUCTION, ARCH-02 o migration.
