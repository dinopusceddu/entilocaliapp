# ASTRA — 25 findings current state reconciliation

Authority canonica corrente. Aggiornamento formale: **7 ottobre 2026**, task ASTRA_FINAL_RECONCILIATION. Chiusura del catalogo ASTRA iniziale dei 25 finding originari, supportata dalla review indipendente finale.

## Executive verdict

**ASTRA_FINAL_RECONCILIATION = PASS. Baseline ufficiale: VF25 / PF0 / OPEN0, TOTAL = 25, BLOCKERS_OPEN = 0.** Le sole cinque transizioni di questo task sono **FUNC-03, UX-02, UX-03, ACCESS-01 e ACCESS-02 → VERIFIED_FIXED**. I precedenti 20 finding restano VERIFIED_FIXED. **INITIAL_ASTRA_FINDING_CATALOG = CLOSED**; i debiti post-ASTRA non sono dichiarati chiusi.

Il presente file rimane l’unica authority del census ASTRA; MEMORIA_AI ne conserva una sintesi. La roadmap residua è stata completata e resta immutata come piano storico. La chiusura riguarda le acceptance dei 25 finding originari: non certifica globalmente accessibilità, sicurezza live o readiness di produzione e non autorizza un deploy.

## Baseline e gate documentali

Branch: ux/toolbox-area-fondo-prototype. HEAD: d3170f959b5815c514dbf3d6e5f93366a5f14c67. Working tree dirty intenzionale preservato; index vuoto. PRE di questa chiusura autonomamente censito: VF20/PF2/OPEN3, 25 ID univoci, zero duplicati/mancanti/extra, blocker aperti 0.

Gate finale letto direttamente: [ASTRA_FINAL_RESIDUAL_INDEPENDENT_REVIEW.md](ASTRA_FINAL_RESIDUAL_INDEPENDENT_REVIEW.md), PASS; cinque verdict VERIFIED_FIXED_SUPPORTED e raccomandazioni espresse VERIFIED_FIXED; BLOCKERS=0, MAJOR=0, MINOR=0. Evidence tecnica persistita: targeted B+C138/138, product2120/2120, regression8/8, oracle14/14, TypeScript e diff PASS. Questo task documentale non riesegue i test: DOCUMENTATION_ONLY_FINAL_RECONCILIATION. Census, delta completo e integrity sono registrati in [ASTRA_INITIAL_PROJECT_CLOSURE_REPORT.md](ASTRA_INITIAL_PROJECT_CLOSURE_REPORT.md).

La precedente formalizzazione VF9/PF8/OPEN8 → VF17/PF5/OPEN3 resta documentata da [ricostruzione](ASTRA_POST_RECONCILIATION_BASELINE_REVIEW.md), [independent reconstruction review](ASTRA_BASELINE_RECONSTRUCTION_INDEPENDENT_REVIEW.md) e [formal reconciliation report](ASTRA_BASELINE_FORMAL_RECONCILIATION_REPORT.md). Le otto transizioni precedenti non vengono riapplicate.

La promozione NORM-02 deriva da implementation V2, independent review e addendum formale, tutti letti direttamente. L’addendum attesta PASS, formal completeness COMPLETE, recommended status VERIFIED_FIXED, BLOCKERS = 0, MAJOR = 0, MINOR = 0. Il [report di questo task](NORM_02_FORMAL_PROMOTION_AND_RESIDUAL_ROADMAP_REPORT.md) conserva census, delta e controlli di scope. Product/regression/oracle non rieseguiti: DOCUMENTATION_ONLY_PROMOTION_AND_ROADMAP.

## 25 finding current matrix

La colonna “Stato corrente” è l’authority primaria del conteggio. “Stato precedente” conserva la fotografia storica della promozione registrata; per gli ultimi cinque finding coincide con il PRE di questa chiusura. La matrice completa PRE20/PF2/OPEN3 → POST25/PF0/OPEN0 è nel report finale. Severità, identità ed evidence dei precedenti 20 finding restano invariate; i rinvii ereditati a NORM-02/ARCH-01 descrivono responsibility storiche, non finding ancora aperti. Nessuna acceptance è estesa o ridotta.

| ID | Severity originale | Stato precedente | Stato corrente | Evidenza principale | Residuo | Slice necessario |
|---|---|---|---|---|---|---|
| SEC-01 | BLOCKER | VERIFIED_FIXED | VERIFIED_FIXED | Boundary SQL CLOSED, revoche/ACL; Wave1 hardening + gate storico; securityMigrations verdi | Nessuno nell’acceptance originale; stato live corrente non riacquisito | — |
| DATA-01 | HIGH | VERIFIED_FIXED | VERIFIED_FIXED | [EMPTY_FUND_INITIALIZATION_IMPLEMENTATION_REPORT.md](EMPTY_FUND_INITIALIZATION_IMPLEMENTATION_REPORT.md) + [EMPTY_FUND_INITIALIZATION_INDEPENDENT_REVIEW.md](EMPTY_FUND_INITIALIZATION_INDEPENDENT_REVIEW.md); independent review favorevole, EVIDENCE_QUALITY=STRONG | Nessuno nell’acceptance verificata; limiti esterni allo slice restano separati | — |
| DATA-02 | HIGH | VERIFIED_FIXED | VERIFIED_FIXED | RPC atomica + FOR UPDATE, merge N+1, conflitti/idempotenza; workflow/review Wave1 | CAS tra writer OPEN appartiene a ARCH-PERSIST-01 | — |
| DATA-03 | HIGH | VERIFIED_FIXED | VERIFIED_FIXED | [MONETARY_INPUT_BOUNDARY_IMPLEMENTATION_V2_REPORT.md](MONETARY_INPUT_BOUNDARY_IMPLEMENTATION_V2_REPORT.md) + [MONETARY_INPUT_BOUNDARY_INDEPENDENT_REVIEW.md](MONETARY_INPUT_BOUNDARY_INDEPENDENT_REVIEW.md); independent review favorevole, EVIDENCE_QUALITY=STRONG | Nessuno nell’acceptance verificata; limiti esterni allo slice restano separati | — |
| CALC-01 | BLOCKER | VERIFIED_FIXED | VERIFIED_FIXED | Ledger unique semantic IDs, CCNL corrente una volta, recovery unresolved escluso; oracle/test verdi | Istruttoria recuperi resta NORM-02, senza doppio conteggio | — |
| CALC-02 | BLOCKER | VERIFIED_FIXED | VERIFIED_FIXED | FAD/Cabina/Distribuzione da canonico; resolver budget; XLSX/PDF da fadCanonical; review CALC02 | Sezioni legacy alternative restano ARCH-01; non aggiunta 0,14% nei consumer migrati | — |
| CALC-03 | HIGH | VERIFIED_FIXED | VERIFIED_FIXED | [DL25_COHERENT_REGIME_IMPLEMENTATION_V2_REPORT.md](DL25_COHERENT_REGIME_IMPLEMENTATION_V2_REPORT.md) + [DL25_COHERENT_REGIME_INDEPENDENT_REVIEW.md](DL25_COHERENT_REGIME_INDEPENDENT_REVIEW.md); independent review favorevole, EVIDENCE_QUALITY=STRONG | Nessuno nell’acceptance verificata; limiti esterni allo slice restano separati | — |
| CALC-04 | HIGH | VERIFIED_FIXED | VERIFIED_FIXED | [ART23_DIRIGENZA_DERIVED_CONSUMPTION_IMPLEMENTATION_V2_REPORT.md](ART23_DIRIGENZA_DERIVED_CONSUMPTION_IMPLEMENTATION_V2_REPORT.md) + [ART23_DIRIGENZA_DERIVED_CONSUMPTION_INDEPENDENT_REVIEW.md](ART23_DIRIGENZA_DERIVED_CONSUMPTION_INDEPENDENT_REVIEW.md); independent review favorevole, EVIDENCE_QUALITY=STRONG | Nessuno nell’acceptance verificata; limiti esterni allo slice restano separati | — |
| CALC-05 | HIGH | VERIFIED_FIXED | VERIFIED_FIXED | [PNRR_ZERO_AND_MISSING_CAP_REMEDIATION_REPORT.md](PNRR_ZERO_AND_MISSING_CAP_REMEDIATION_REPORT.md) + [PNRR_ZERO_AND_MISSING_CAP_INDEPENDENT_REVIEW.md](PNRR_ZERO_AND_MISSING_CAP_INDEPENDENT_REVIEW.md); independent review favorevole, EVIDENCE_QUALITY=STRONG | Nessuno nell’acceptance verificata; limiti esterni allo slice restano separati | — |
| DOC-01 | BLOCKER | VERIFIED_FIXED | VERIFIED_FIXED | Tabella15 signed mapping/unknown conservati/totale nullable; Wave3 finale e suite verdi | RGS_SCHEMA_UNVERIFIED separato, fuori dai 25 | — |
| DOC-02 | HIGH | VERIFIED_FIXED | VERIFIED_FIXED | Modern projection/factory, attestazioni esplicite, canonical XLSX/PDF, five-kind readiness e review | Tabella15 output mode debito separato; placeholder espliciti secondo contratto approvato | — |
| NORM-01 | BLOCKER | VERIFIED_FIXED | VERIFIED_FIXED | Art60: 2025=0; 2026=127,44 €; 2027 base consolidata esplicita; consumer/test/review | Nessuno nell’acceptance 2025/2026/2027 | — |
| NORM-02 | HIGH | VERIFIED_FIXED | VERIFIED_FIXED | [CCNL_RECOVERY_INSTRUCTION_IMPLEMENTATION_V2_REPORT.md](CCNL_RECOVERY_INSTRUCTION_IMPLEMENTATION_V2_REPORT.md) CLOSED_LOCALLY/CANDIDATE; [CCNL_RECOVERY_INSTRUCTION_INDEPENDENT_REVIEW.md](CCNL_RECOVERY_INSTRUCTION_INDEPENDENT_REVIEW.md) verdict VERIFIED_FIXED; [addendum formale](CCNL_RECOVERY_INSTRUCTION_INDEPENDENT_REVIEW_ADDENDUM.md) PASS, completeness COMPLETE, BLOCKERS/MAJOR/MINOR=0; product2041/2041, regression8/8, oracle14/14 | Nessuno nell’acceptance verificata; promozione formale completata | — |
| NORM-03 | HIGH | VERIFIED_FIXED | VERIFIED_FIXED | [DL25_COHERENT_REGIME_IMPLEMENTATION_V2_REPORT.md](DL25_COHERENT_REGIME_IMPLEMENTATION_V2_REPORT.md) + [DL25_COHERENT_REGIME_INDEPENDENT_REVIEW.md](DL25_COHERENT_REGIME_INDEPENDENT_REVIEW.md); independent review favorevole, EVIDENCE_QUALITY=STRONG | Nessuno nell’acceptance verificata; limiti esterni allo slice restano separati | — |
| NORM-04 | HIGH | VERIFIED_FIXED | VERIFIED_FIXED | [DL25_COHERENT_REGIME_IMPLEMENTATION_V2_REPORT.md](DL25_COHERENT_REGIME_IMPLEMENTATION_V2_REPORT.md) + [DL25_COHERENT_REGIME_INDEPENDENT_REVIEW.md](DL25_COHERENT_REGIME_INDEPENDENT_REVIEW.md); independent review favorevole, EVIDENCE_QUALITY=STRONG | Nessuno nell’acceptance verificata; limiti esterni allo slice restano separati | — |
| ARCH-01 | HIGH | VERIFIED_FIXED | VERIFIED_FIXED | [ACTIVE_LEGACY_ECONOMIC_AUTHORITY_RETIREMENT_IMPLEMENTATION_REPORT.md](ACTIVE_LEGACY_ECONOMIC_AUTHORITY_RETIREMENT_IMPLEMENTATION_REPORT.md) + [ACTIVE_LEGACY_ECONOMIC_AUTHORITY_RETIREMENT_INDEPENDENT_REVIEW.md](ACTIVE_LEGACY_ECONOMIC_AUTHORITY_RETIREMENT_INDEPENDENT_REVIEW.md); independent review favorevole, EVIDENCE_QUALITY=STRONG | Nessuno nell’acceptance verificata; limiti esterni allo slice restano separati | — |
| ARCH-02 | MEDIUM | PARTIALLY_FIXED | VERIFIED_FIXED | [implementation Slice A](PROVENANCE_METADATA_BOUNDARY_IMPLEMENTATION_REPORT.md) + [independent review](PROVENANCE_METADATA_BOUNDARY_INDEPENDENT_REVIEW.md) PASS; recommended VERIFIED_FIXED, BLOCKERS/MAJOR/MINOR=0; product2074/2074, regression8/8, oracle14/14; provenance read model, 15/15 RSU, owner/actor/current-role separati, snapshot role non autorizzativo, stale metadata senza effetti | Nessuno nell’acceptance verificata; limiti live esterni restano separati | — |
| FUNC-01 | HIGH | VERIFIED_FIXED | VERIFIED_FIXED | Reducer CLOSED, save error, consumer/read-only/import/transfer guards, correlation Wave 4.1; regressioni | Multiwriter/CAS separato; consultazione non implica attestazione | — |
| FUNC-02 | HIGH | VERIFIED_FIXED | VERIFIED_FIXED | Cabina priority + explicit draft + closure readiness + kind readiness + post-close N+1; cinque review PASS | Nessun residuo dello stesso workflow; difetti upstream mantengono i propri ID | — |
| FUNC-03 | MEDIUM | OPEN | VERIFIED_FIXED | [Slice B implementation](SLICE_A_PROMOTION_AND_USER_SURFACE_CONSOLIDATION_REPORT.md) + [review finale](ASTRA_FINAL_RESIDUAL_INDEPENDENT_REVIEW.md) PASS, VERIFIED_FIXED_SUPPORTED; unica projection transfer, stesso stato/reason Summary e Step8, unica modal/controller; idempotenza, doppio click, retry, stale response e CLOSED verificati; nessuna logica economica parallela | Nessuno nell’acceptance verificata | — |
| UX-01 | MEDIUM | PARTIALLY_FIXED | VERIFIED_FIXED | [implementation Slice A](PROVENANCE_METADATA_BOUNDARY_IMPLEMENTATION_REPORT.md) + [independent review](PROVENANCE_METADATA_BOUNDARY_INDEPENDENT_REVIEW.md) PASS; recommended VERIFIED_FIXED, BLOCKERS/MAJOR/MINOR=0; product2074/2074, regression8/8, oracle14/14; provenance read model, 15/15 RSU, owner/actor/current-role separati, snapshot role non autorizzativo, stale metadata senza effetti | Nessuno nell’acceptance verificata; limiti live esterni restano separati | — |
| UX-02 | HIGH | PARTIALLY_FIXED | VERIFIED_FIXED | [Slice B implementation](SLICE_A_PROMOTION_AND_USER_SURFACE_CONSOLIDATION_REPORT.md) + [review finale](ASTRA_FINAL_RESIDUAL_INDEPENDENT_REVIEW.md) PASS, VERIFIED_FIXED_SUPPORTED; ente/anno/stato a360/390/430/desktop, contesto durante scroll/drawer/modal, nome completo touch; Admin foreign-owner context senza contaminazione authorization | Nessuno nell’acceptance verificata | — |
| UX-03 | MEDIUM | PARTIALLY_FIXED | VERIFIED_FIXED | [Slice B implementation](SLICE_A_PROMOTION_AND_USER_SURFACE_CONSOLIDATION_REPORT.md) + [review finale](ASTRA_FINAL_RESIDUAL_INDEPENDENT_REVIEW.md) PASS, VERIFIED_FIXED_SUPPORTED; zero termini tecnici nello scope utente verificato, primary action non ambigua, gerarchia Toolbox/Fondo/azione e priorità mobile; desktop preservato | Nessuno nell’acceptance verificata; Tabella15 output mode resta debt separato | — |
| ACCESS-01 | HIGH | OPEN | VERIFIED_FIXED | [Slice C implementation](ACCESSIBILITY_CONSOLIDATION_IMPLEMENTATION_REPORT.md) + [review finale](ASTRA_FINAL_RESIDUAL_INDEPENDENT_REVIEW.md) PASS, VERIFIED_FIXED_SUPPORTED; Nuovo ente dialog/name, initial focus, Tab/ShiftTab trap, Escape, background inert, focus return e modal stack; browser keyboard PASS | Cinque famiglie accessibility fuori acceptance, non bloccanti e non risolte; nessuna certificazione WCAG globale | — |
| ACCESS-02 | MEDIUM | OPEN | VERIFIED_FIXED | [Slice C implementation](ACCESSIBILITY_CONSOLIDATION_IMPLEMENTATION_REPORT.md) + [review finale](ASTRA_FINAL_RESIDUAL_INDEPENDENT_REVIEW.md) PASS, VERIFIED_FIXED_SUPPORTED; unnamed active fields0 nello scope, metadata Report10/10, monetary unità/error association; duplicate IDs0, accordion semantici, nested interactive0 e tab duplication0; DATA-03 preservato | Cinque famiglie accessibility fuori acceptance, non bloccanti e non risolte | — |

## Count reconciliation

Conteggi ricostruiti dalle 25 righe reali, verificando unicità, completezza, membership e delta autorizzato:

| Stato | PRE task | Corrente | Delta |
|---|---:|---:|---:|
| VERIFIED_FIXED | 20 | 25 | +5 |
| PARTIALLY_FIXED | 2 | 0 | -2 |
| OPEN | 3 | 0 | -3 |
| NOT_VERIFIED | 0 | 0 | 0 |
| ACCEPTED_LIMITATION | 0 | 0 | 0 |
| OUT_OF_SCOPE | 0 | 0 | 0 |
| **TOTAL** | **25** | **25** | **0** |

FUNC-03, ACCESS-01 e ACCESS-02: OPEN → VF; UX-02 e UX-03: PF → VF. VF=20+5=25; PF=2−2=0; OPEN=3−3=0; **25+0+0=25**. STATUS_TRANSITIONS=5; UNEXPECTED_STATUS_CHANGES=0. Nessun finding aggiunto, rimosso o trasferito a categorie di deroga.

## Blocker / High / Medium remaining

| Severity originale | Totale originale | VERIFIED_FIXED | Non chiusi | PARTIALLY_FIXED | OPEN |
|---|---:|---:|---:|---:|---:|
| BLOCKER | 5 | 5 | 0 | 0 | 0 |
| HIGH | 15 | 15 | 0 | 0 | 0 |
| MEDIUM | 5 | 5 | 0 | 0 | 0 |

- BLOCKER non chiusi: 0; SEC-01, CALC-01, CALC-02, DOC-01, NORM-01 restano VERIFIED_FIXED.
- HIGH non chiusi: 0.
- MEDIUM non chiusi: 0.

ASTRA_BLOCKERS_OPEN=0. Non equivale a verifica live della sicurezza o dei debiti fuori dai 25 finding.

## Evidence delle otto promozioni formalizzate

### DATA-01 — OPEN → VERIFIED_FIXED

Empty fund initialization; demo economici rimossi dal runtime, missing preservato; nuova entità/annualità fail-safe; hydration, save/reload, CLOSED e N+1 verificati. Independent review favorevole; EVIDENCE_QUALITY=STRONG. Evidence: [EMPTY_FUND_INITIALIZATION_IMPLEMENTATION_REPORT.md](EMPTY_FUND_INITIALIZATION_IMPLEMENTATION_REPORT.md) e [EMPTY_FUND_INITIALIZATION_INDEPENDENT_REVIEW.md](EMPTY_FUND_INITIALIZATION_INDEPENDENT_REVIEW.md).

### DATA-03 — PARTIALLY_FIXED → VERIFIED_FIXED

Monetary boundary condivisa, scala 2; negative/malformed/NaN/Infinity/huge values fail-closed; zero distinto da missing; mutation/import/restore/transfer/save/repository e Big.js aggregate safety verificati. Independent review favorevole; EVIDENCE_QUALITY=STRONG. Evidence: [MONETARY_INPUT_BOUNDARY_IMPLEMENTATION_V2_REPORT.md](MONETARY_INPUT_BOUNDARY_IMPLEMENTATION_V2_REPORT.md) e [MONETARY_INPUT_BOUNDARY_INDEPENDENT_REVIEW.md](MONETARY_INPUT_BOUNDARY_INDEPENDENT_REVIEW.md).

### CALC-03 — OPEN → VERIFIED_FIXED

Margine 48% netto preservato; spazio finanziario lordo convertito correttamente, senza doppio abbattimento; oneri nel regime coerente e IRAP distinta secondo acceptance. Independent review favorevole; EVIDENCE_QUALITY=STRONG. Evidence: [DL25_COHERENT_REGIME_IMPLEMENTATION_V2_REPORT.md](DL25_COHERENT_REGIME_IMPLEMENTATION_V2_REPORT.md) e [DL25_COHERENT_REGIME_INDEPENDENT_REVIEW.md](DL25_COHERENT_REGIME_INDEPENDENT_REVIEW.md).

### CALC-04 — PARTIALLY_FIXED → VERIFIED_FIXED

Consumo Art23 Dirigenza derivato dagli atomici; cache non autoritativa e cache poisoning verificato; whole-entity coerente, no double count; golden delta storico autorizzato e verificato. Independent review favorevole; EVIDENCE_QUALITY=STRONG. Evidence: [ART23_DIRIGENZA_DERIVED_CONSUMPTION_IMPLEMENTATION_V2_REPORT.md](ART23_DIRIGENZA_DERIVED_CONSUMPTION_IMPLEMENTATION_V2_REPORT.md) e [ART23_DIRIGENZA_DERIVED_CONSUMPTION_INDEPENDENT_REVIEW.md](ART23_DIRIGENZA_DERIVED_CONSUMPTION_INDEPENDENT_REVIEW.md).

### CALC-05 — OPEN → VERIFIED_FIXED

PNRR come facoltà NOT_EXERCISED/EXERCISED/UNSET; zero esplicito valido, missing cap fail-closed, requested positivo con cap zero INVALID; massimo, provenance, ledger e readiness coerenti. Independent review favorevole; EVIDENCE_QUALITY=STRONG. Evidence: [PNRR_ZERO_AND_MISSING_CAP_REMEDIATION_REPORT.md](PNRR_ZERO_AND_MISSING_CAP_REMEDIATION_REPORT.md) e [PNRR_ZERO_AND_MISSING_CAP_INDEPENDENT_REVIEW.md](PNRR_ZERO_AND_MISSING_CAP_INDEPENDENT_REVIEW.md).

### NORM-03 — OPEN → VERIFIED_FIXED

Decorrenza temporale e Art33 scope APPLY/SKIP/BLOCK verificati; regime storico quando necessario, disapplicazione solo se applicabile, missing/malformed fail-safe. Independent review favorevole; EVIDENCE_QUALITY=STRONG. Evidence: [DL25_COHERENT_REGIME_IMPLEMENTATION_V2_REPORT.md](DL25_COHERENT_REGIME_IMPLEMENTATION_V2_REPORT.md) e [DL25_COHERENT_REGIME_INDEPENDENT_REVIEW.md](DL25_COHERENT_REGIME_INDEPENDENT_REVIEW.md).

### NORM-04 — OPEN → VERIFIED_FIXED

Base 2025 fissa, TAB 2023 × 48%, CS2025/EQ2025; carry qualificato e stock/delta/cumulativo/residuo distinti, nessun nuovo plafond artificiale per annualità. Independent review favorevole; EVIDENCE_QUALITY=STRONG. Evidence: [DL25_COHERENT_REGIME_IMPLEMENTATION_V2_REPORT.md](DL25_COHERENT_REGIME_IMPLEMENTATION_V2_REPORT.md) e [DL25_COHERENT_REGIME_INDEPENDENT_REVIEW.md](DL25_COHERENT_REGIME_INDEPENDENT_REVIEW.md).

### ARCH-01 — PARTIALLY_FIXED → VERIFIED_FIXED

Canonical ledger unica active authority FAD, canonical projection; active legacy economic authorities = 0, caller ritirati e writer moderni allineati; zero prevale su stale, missing/invalid/undetermined non diventano zero definitivo. Independent review favorevole; EVIDENCE_QUALITY=STRONG. Evidence: [ACTIVE_LEGACY_ECONOMIC_AUTHORITY_RETIREMENT_IMPLEMENTATION_REPORT.md](ACTIVE_LEGACY_ECONOMIC_AUTHORITY_RETIREMENT_IMPLEMENTATION_REPORT.md) e [ACTIVE_LEGACY_ECONOMIC_AUTHORITY_RETIREMENT_INDEPENDENT_REVIEW.md](ACTIVE_LEGACY_ECONOMIC_AUTHORITY_RETIREMENT_INDEPENDENT_REVIEW.md).

## NORM-02 — promozione formale

**NORM_02_PRE=PARTIALLY_FIXED; NORM_02_POST=VERIFIED_FIXED.** CCNL Funzioni Locali 2022-2024 sottoscritto il 23.02.2026, articoli 58 e 59, secondo il policy contract già approvato. CURRENT e RECOVERY separati; competence year e provenance espliciti; recupero parziale, importi già riconosciuti e richiesti separati, residui derivati. Fondo/EQ/performance distinti; UNINSTRUCTED → UNDETERMINED, nessun default a zero; invalid e duplicate fail-closed. Autorità automatica legacy 0,0028 ritirata; canonical ledger unica authority economica; assenti current/recovery double count, EQ double count e performance leakage nel Fondo.

Transfer idempotente e save/reload, document projection, Cabina, Distribution e Closure readiness verificati. Evidence: [implementation V2](CCNL_RECOVERY_INSTRUCTION_IMPLEMENTATION_V2_REPORT.md), [independent review](CCNL_RECOVERY_INSTRUCTION_INDEPENDENT_REVIEW.md), [addendum formale](CCNL_RECOVERY_INSTRUCTION_INDEPENDENT_REVIEW_ADDENDUM.md). Review verdict VERIFIED_FIXED; addendum PASS, formal completeness COMPLETE; BLOCKERS/MAJOR/MINOR=0; product2041/2041, regression8/8, oracle14/14, TypeScript e diff check PASS. Si tratta di evidence storica verificata, non di nuove esecuzioni.

Le due assertion contestuali errate della review DL25 restano EDITORIAL (DATA-01 PF anziché OPEN; DATA-03 OPEN anziché PF). Quel report resta immutato; tali valori non sono il PRE di questa promozione. Non propagato il refuso CCNL 16.07.2024 della review NORM-02.

## Slice A — promozione formale

La [implementation](PROVENANCE_METADATA_BOUNDARY_IMPLEMENTATION_REPORT.md) e la [review indipendente](PROVENANCE_METADATA_BOUNDARY_INDEPENDENT_REVIEW.md), lette direttamente, attestano completezza UX-01/ARCH-02: 15 risposte RSU, provenance esclusivamente read model, economic authority unica, owner entity.user_id distinto da actor e current role; zero caller autorizzativi dello snapshot role e poisoning/profile-refresh/stale-metadata verificati. Save/reload, CLOSED e transfer preservati. Review PASS, recommended VERIFIED_FIXED per entrambi, BLOCKERS/MAJOR/MINOR=0; product2074/2074, regression8/8, oracle14/14, TypeScript/diff PASS (evidence storica).

Census e delta di questo task: [SLICE_A_PROMOTION_AND_USER_SURFACE_CONSOLIDATION_REPORT.md](SLICE_A_PROMOTION_AND_USER_SURFACE_CONSOLIDATION_REPORT.md). NORM-02 resta VERIFIED_FIXED; nessun altro finding cambia.

## Final residual review e chiusura del piano

Il piano consolidato [ASTRA_RESIDUAL_REMEDIATION_ROADMAP.md](ASTRA_RESIDUAL_REMEDIATION_ROADMAP.md) resta immutato come history della strategia completata: Slice A e review A, Slice B, Slice C, review finale B+C e questa reconciliation. Nessuna nuova independent review richiesta o creata dal solo aggiornamento documentale.

La [review finale](ASTRA_FINAL_RESIDUAL_INDEPENDENT_REVIEW.md) conferma tutte le cinque acceptance, BLOCKERS/MAJOR/MINOR=0, regressioni Slice A/20 finding precedenti/NORM-02/FUNC-01/DATA-03/authorization assenti. Golden/oracle/DB/migrations/Auth server invariati. Test e browser sono evidence persistita della review, non nuove esecuzioni di questa reconciliation.

IMPLEMENTATION_SLICES_REMAINING=0; INDEPENDENT_REVIEWS_REMAINING=0 per il catalogo ASTRA iniziale. Eventuali attività successive sono una nuova fase, non remediation necessaria dei25 finding chiusi.

## POST_ASTRA_NON_BLOCKING_DEBT

ACCESSIBILITY_DEBT_FAMILIES=5; ASTRA_BLOCKING=NO. Restano non risolti: Art23EmployeeEntryPage dialog; PersonaleServizioPage; IvcConglobationModal; UserManagementPage admin dialogs; Toolbox general Sidebar drawer. La review finale ne conferma il perimetro esterno all’acceptance ACCESS-01/02.

Gli altri debt già documentati restano separati: ARCH-PERSIST-01 multiwriter/CAS, RGS_SCHEMA_UNVERIFIED/SICO non validato, TABELLA15_OUTPUT_MODE, gate profile-role/Edge deployment e verifica live, timestamp profile/cleanup FK/CLOSED e riproducibilità migration; cleanup documentale latente. Dettagli e fonti nel [report finale](ASTRA_INITIAL_PROJECT_CLOSURE_REPORT.md); la history sotto resta immutata. Nessun debt è aggiunto retroattivamente al catalogo, cancellato o dichiarato risolto per effetto di VF25.

## Output corrente

~~~text
ASTRA_FINAL_RECONCILIATION = PASS
VERIFIED_FIXED = 25
PARTIALLY_FIXED = 0
OPEN = 0
TOTAL = 25
BLOCKERS_OPEN = 0
STATUS_TRANSITIONS = 5
UNEXPECTED_STATUS_CHANGES = 0
ALL_25_ORIGINAL_FINDINGS_RECONCILED = YES
INITIAL_ASTRA_FINDING_CATALOG = CLOSED
POST_ASTRA_DEBT_EXISTS = YES
POST_ASTRA_DEBT_BLOCKS_INITIAL_CATALOG_CLOSURE = NO
NEXT_GATE = ASTRA_INITIAL_PROJECT_CLOSED
~~~

## Contesto storico conservato — fotografia del 4 ottobre 2026

**Le sezioni seguenti sono history/evidence della precedente fotografia9/8/8, non authority corrente.** Diagnosi,piani,roadmap,conteggi,risultati,scope e output qui citati descrivono esclusivamente il4ottobre. Non sono nuove acceptance o istruzioni operative. Nessun numero di roadmap è ricalcolato per analogia in questo task. La precedente matrice/count/severity è sostituita dalla tabella corrente sopra; il census PRE completo è preservato nel report di reconciliation e nello snapshotPRE. Gli altri testi storici qui sotto restano byte-identici alle porzioni originali, e le relative review esterne restano immutabili.

<details>
<summary>History/evidence immutabile del contenuto precedente — 04.10.2026, VF9/PF8/OPEN8</summary>

# ASTRA — 25 findings current state reconciliation

Data: 4 ottobre 2026. Operazione esclusiva: **ASTRA_25_FINDINGS_CURRENT_STATE_RECONCILIATION**. Nessuna implementazione.

## Executive verdict

**Reconciliation completata; RESULT = REQUIRES_REVIEW.** Il working tree corrente chiude 9 finding, ne corregge parzialmente 8 e ne lascia aperti 8. I cinque BLOCKER originali sono VERIFIED_FIXED; rimangono 11 HIGH e 5 MEDIUM non integralmente corretti. Le severità sono quelle dell’audit originario, mai ridotte dopo una correzione.

**FUNC-02 = VERIFIED_FIXED** sulle cinque dimensioni richieste, incluso il passaggio CLOSED → N+1 senza salvataggio dell’anno appena chiuso. **CALC-02, DOC-02 e NORM-01 = VERIFIED_FIXED** sulla base dei consumer correnti, delle regressioni locali e delle review specifiche. **ARCH-01 resta PARTIALLY_FIXED**: migrare i documenti non ha eliminato tutte le autorità economiche attive. **ARCH-02 resta PARTIALLY_FIXED**: le tre funzioni Auth sono SOURCE_FIXED, ma mirror e gate profile-role/live non sono chiusi.

I test verdi non coprono automaticamente le acceptance ancora aperte: i controesempi caratterizzano il comportamento corrente, compresi DL25 netto 18.838,30 € invece di 24.000 €, PNRR 100 € accettato con cap zero/missing e Dirigenza conforme o non conforme a seconda della cache.

REQUIRES_REVIEW indica il gate indipendente di questa nuova fotografia e una deviazione dichiarata dal requisito tooling-network=0: la guardia ha intercettato una richiesta DNS del tooling per localhost, bloccandola prima dell’esecuzione. Nessuna connessione reale è stata stabilita e nessun prodotto ha tentato accessi di rete. Non è un fallimento delle regressioni applicative.

Prossimo slice raccomandato, soltanto come proposta: **PNRR_ZERO_AND_MISSING_CAP**. Il suo controesempio produce una risorsa positiva con stato canonico VALID in assenza di un massimo utilizzabile, e può quindi attraversare gate downstream correttamente implementati. Nessuna correzione o migration è autorizzata o eseguita da questo report.

## Baseline

Repository indicato: dinopusceddu/entilocaliapp. Directory: C:/Users/PuscedduD/Il mio Drive/Progetto FL APP/entilocaliapp.

Comandi PRE eseguiti prima dell’analisi, nell’ordine richiesto:

~~~text
git branch --show-current
git rev-parse HEAD
git status --short --untracked-files=all
git diff --name-status
git diff --cached --name-status
~~~

~~~text
BRANCH = ux/toolbox-area-fondo-prototype
HEAD = d3170f959b5815c514dbf3d6e5f93366a5f14c67
EXPECTED_BRANCH_MATCH = YES
EXPECTED_HEAD_MATCH = YES
BASELINE = CURRENT_WORKING_TREE
PRE_TRACKED_MODIFIED_FILES = 24
PRE_STATUS_LINES = 443
PRE_STAGED_FILES = 0
~~~

HEAD è intenzionalmente precedente ai cambiamenti locali. Tutti i nuovi slice locali, inclusi sorgenti/test untracked e report ignorati da Git, appartengono alla fotografia analizzata. I commit citati nei report Wave o in MEMORIA_AI.md identificano evidenze storiche: non sostituiscono questo HEAD né attestano il working tree attuale.

Il PRE comprende 419 righe untracked oltre alle 24 modifiche tracciate. L’inventario iniziale tracked/untracked comprende 1.074 file; prima dei test è stato esteso a **1.129 file** includendo tutti i Markdown root, anche quelli nascosti dalle regole ignore dei report. Nessun file preesistente è stato normalizzato o riscritto.

Le 24 modifiche tracciate preesistenti:

~~~text
src/__tests__/securityMigrations.test.ts
src/contexts/AppContext.tsx
src/domain/documentProjection.ts
src/features/wizard2026/__tests__/wizard2026RemoteDraftSync.test.ts
src/logic/cabina/__tests__/resolveCabinaViewModel.test.ts
src/logic/cabina/__tests__/resolveOperationalStatus.test.ts
src/logic/cabina/resolveCabinaViewModel.ts
src/logic/cabina/resolveOperationalStatus.ts
src/pages/DistribuzioneRisorsePage.tsx
src/pages/EntityYearManagementPage.tsx
src/pages/ReportsPage.tsx
src/pages/__tests__/CabinaDiRegiaPage.wave41.integration.test.tsx
src/pages/__tests__/DistribuzioneRisorsePage.closed.test.tsx
src/presenters/reportPresenter.ts
src/services/documents/documentFactory.ts
src/services/documents/pdfDeterminaService.ts
src/services/documents/pdfReportService.ts
src/services/documents/xlsReportService.ts
src/services/reportService.ts
src/services/templates/determinaTemplateV2.ts
src/services/templates/relazioneTecnicaTemplate.ts
supabase/functions/create-user/index.ts
supabase/functions/delete-user/index.ts
supabase/functions/update-password/index.ts
~~~

## Method

Per ogni finding sono stati confrontati problema, root cause e acceptance del report originario con sorgente attivo, chiamanti, test correnti, risultati locali e review indipendenti. Ogni ID ha esattamente uno dei sei stati ammessi. VERIFIED_FIXED richiede la chiusura dell’acceptance originale e dei suoi consumer attivi; un core corretto con autorità alternativa ancora usata rimane PARTIALLY_FIXED.

“Stato precedente” è quello di ASTRA_FINAL_FINDINGS_RECONCILIATION.md, confermato rispetto alla sua review: 5 VERIFIED_FIXED, 12 PARTIALLY_FIXED, 8 OPEN. Non si usa l’ultima affermazione favorevole di un report intermedio come stato canonico precedente. I delta sono spiegati sotto.

L’autorità normativa è esclusivamente il contratto congelato in ASTRA_RSU_AUDIT_REPORT.md / ASTRA_NORMATIVE_MATRIX.md, comprese N05, N08 e N13. Nessuna ricerca normativa aggiornata o accesso alle fonti esterne. Le aree originariamente UNCERTAIN non sono trasformate in nuovi bug per supposizione.

### Documenti confrontati

Sono stati letti i cinque documenti iniziali e i report/review pertinenti. Il confronto riguarda il loro contenuto e le acceptance, non il titolo:

- [ASTRA_RSU_AUDIT_REPORT.md](ASTRA_RSU_AUDIT_REPORT.md), [ASTRA_NORMATIVE_MATRIX.md](ASTRA_NORMATIVE_MATRIX.md), [ASTRA_TEST_MATRIX.md](ASTRA_TEST_MATRIX.md), [ASTRA_FINAL_FINDINGS_RECONCILIATION.md](ASTRA_FINAL_FINDINGS_RECONCILIATION.md), [ASTRA_FINAL_RECONCILIATION_INDEPENDENT_REVIEW.md](ASTRA_FINAL_RECONCILIATION_INDEPENDENT_REVIEW.md).
- Auth: AUTH_ADMIN_01_IMPLEMENTATION_REPORT.md / AUTH_ADMIN_01_INDEPENDENT_REVIEW.md; AUTH_ADMIN_02A_IMPLEMENTATION_REPORT.md / AUTH_ADMIN_02A_INDEPENDENT_REVIEW.md; AUTH_ADMIN_02B_IMPLEMENTATION_REPORT.md / AUTH_ADMIN_02B_INDEPENDENT_REVIEW.md; ROLE_ESCALATION_GATE_REPORT.md; SUPABASE_REAL_RLS_GATE_REPORT.md; migration profile e riferimenti storici di clean-room/rehearsal nella precedente reconciliation. Un PASS conclusivo di rehearsal V2 o un apply profile-role non è stato riacquisito: il gate resta pendente.
- Canonical/report: FAD_REPORT_READ_MODEL_IMPLEMENTATION_REPORT.md / FAD_REPORT_READ_MODEL_INDEPENDENT_REVIEW.md; CANONICAL_FAD_XLSX_IMPLEMENTATION_REPORT.md / CANONICAL_FAD_XLSX_INDEPENDENT_REVIEW.md; CANONICAL_FUND_SUMMARY_PDF_IMPLEMENTATION_REPORT.md / CANONICAL_FUND_SUMMARY_PDF_INDEPENDENT_REVIEW.md; CALC02_DISTRIBUTION_CANONICAL_BUDGET_IMPLEMENTATION_REPORT.md / CALC02_FINAL_INDEPENDENT_CLOSURE_REVIEW.md.
- Workflow: implementation report e independent review di CABINA_BLOCKING_ISSUE_PRIORITY, DISTRIBUTION_EXPLICIT_DRAFT, CLOSURE_INSTRUCTION_READINESS, DOCUMENT_KIND_READINESS e POST_CLOSE_N_PLUS_1_NAVIGATION.
- Wave1: CLOSED_SNAPSHOT_IMPLEMENTATION, FINAL_REVIEW, FINAL_HARDENING e CONSOLIDATION. Il primo FAIL non viene ignorato: sono confrontate le correzioni successive e la versione SQL finale.
- Wave2: CANONICAL_LEDGER_IMPLEMENTATION, INDEPENDENT_REVIEW, WORKLOG e CONSOLIDATION. La promozione storica globale di CALC-04, ARCH-01 e NORM-02 non è confermata dall’acceptance completa corrente.
- Wave3: DOCUMENT_CONSISTENCY_IMPLEMENTATION, INDEPENDENT_REVIEW, FINAL_HARDENING, FINAL_INDEPENDENT_VERIFICATION, SYSTEMIC_FIX, FINAL_GATE, FINAL_WIRING_FIX, FINAL_MICRO_GATE, FINAL_DRAFT_FIX, ABSOLUTE_FINAL_GATE, TEST_ISOLATION_FIX e CONSOLIDATION. Le regressioni intermedie draft/final sono confrontate con il codice successivo.
- Wave4.1: riepilogo delle prove locali in MEMORIA_AI.md e codice/suite di correlation, CLOSED protection, Cabina e remote-draft isolation. L’evidence pack precedente/prototipo non è assunto come collaudo mobile di questo working tree.

### Esecuzione locale/offline e limiti

I test sono stati eseguiti su una copia temporanea del working tree, fuori repository, con gli stessi byte di src/scripts/supabase/tests/fixtures e dipendenze già installate. Nessuna installazione, env reale o credenziale copiata. URL configurato example.invalid, chiave dummy, remote drafts disabilitati. Vite envFile=false; cache/config/probe e output nella directory temporanea. La configurazione di test usa isolamento e quattro worker; i file test/golden/fixture di prodotto sono immutati.

La guardia Node preload blocca fetch, HTTP/HTTPS, TCP/TLS, DNS e datagram prima della chiamata effettiva e registra l’origine degli eventuali tentativi. Non è stato aperto un browser con autenticazione né avviato un server applicativo con env reale.

| Verifica corrente | Risultato | Cosa dimostra / limite |
|---|---|---|
| Intera suite src esistente | **124 file, 1.597 test PASS**, zero failure di prodotto | Consumer e regressioni attuali; non garantisce acceptance non coperte |
| Probe temporanei di caratterizzazione | **7/7 PASS** | Comportamenti numerici/boundary correnti, inclusi controesempi; PASS del probe non significa finding corretto |
| scripts/run_wave2_oracle.ts | **14/14 PASS** | Contratti CCNL/Art60/ledger congelati coperti dall’oracle esistente |
| scripts/run_regression_tests.ts | **8/8 PASS** | Golden esistenti, senza modifiche a expected o fixture |
| Nuova verifica DB/Edge live | Non eseguita | SOURCE_FIXED non implica LIVE_VERIFIED |
| Nuovo collaudo visuale 360/390/430 o screen reader | Non eseguito | Nessuna promozione mobile/accessibilità per analogia |

La prima esecuzione del tooling ha incontrato il limite di lettura esbuild delle directory superiori; è stata ripetuta con escalation autorizzata e con guardia offline invariata. Una diagnostica iniziale single-thread ha prodotto contaminazione dei mount RTL tra file; è stata fermata e sostituita dalla configurazione isolata. Nel primo run completo tutti i 124 file di prodotto erano verdi, mentre tre probe temporanei fallivano per un import di defaultInitialState che è privato e per un’asserzione aggregata. L’harness esterno è stato corretto usando constants pubbliche e il reducer reale. Il successivo probe ha registrato l’eccezione big.js del valore malformato come comportamento da caratterizzare, e il run finale è 7/7. Nessun fallimento è stato nascosto cambiando test di prodotto.

I tre suite Auth (19 + 34 + 42 = 95 test) eseguono il sorgente reale delle Edge Functions con i soli import remoti/SDK sostituiti da boundary mock. Non importano librerie dalla rete e non effettuano mutazioni Auth/DB reali. Le prove di save boundary usano un repository mock OPEN: dimostrano l’assenza di validazione applicativa, non l’effettivo inserimento di Infinity in PostgreSQL/JSON.

Output e manifest temporanei conservati in C:/Users/PUSCED~1/AppData/Local/Temp/astra25-current-cleanroom/ e C:/Users/PUSCED~1/AppData/Local/Temp/astra25-reconciliation-pre-complete.json. I risultati essenziali e i controesempi sono riportati qui, senza dipendere da una futura disponibilità di TEMP.

~~~text
PRODUCT_NETWORK_ATTEMPTS = 0
TOOLING_NETWORK_ATTEMPTS = 1
REAL_NETWORK_CONNECTION_ESTABLISHED = NO
~~~

L’unico evento è dns.promises.lookup da Vite getLocalhostAddressIfDiffersFromDNS. È stato **intercettato prima dell’invocazione** dal preload, quindi non prova una richiesta DNS uscita dal processo né una connessione. La configurazione temporanea è stata resa esplicita su 127.0.0.1; tutti i run successivi non hanno aggiunto eventi. Il valore TOOLING_NETWORK_ATTEMPTS non è falsificato a zero per adeguarlo all’atteso.


## Verified-fixed evidence

### SEC-01 — BLOCKER — VERIFIED_FIXED

La root cause era UPDATE API del proprietario su CLOSED. Il sorgente finale [20260928000000_harden_user_app_state_closed_boundary.sql](supabase/migrations/20260928000000_harden_user_app_state_closed_boundary.sql) rifiuta INSERT CLOSED e qualunque UPDATE di uno snapshot già CLOSED; OPEN→CLOSED richiede il contesto atomico. La policy UPDATE restrittiva impedisce al normale ruolo authenticated di ottenere una chiusura diretta falsificando il solo GUC. TRUNCATE/TRIGGER/REFERENCES non sono concessi al client.

DELETE CLOSED richiede insieme flag esplicito di cleanup e ADMIN canonico: è un’eccezione amministrativa distinta, non un UPDATE bypass. Nessun ADMIN generico può riscrivere importi CLOSED attraverso il normale save. Sono state confrontate Wave1, il successivo hardening e il gate storico; i test statici migration e CLOSED runtime correnti sono verdi.

L’evidenza equivalente comprende l’ispezione SQL finale e i gate reali storici, qualificati temporalmente. **SOURCE_FIXED; live odierno non riverificato**. Nessuna migration eseguita qui. Lo stato del trigger profile-role non riapre l’acceptance specifica UPDATE CLOSED, ma impedisce una dichiarazione globale “produzione sicura”.

### DATA-02 — HIGH — VERIFIED_FIXED

[SupabaseStateRepository](src/infrastructure/persistence/SupabaseStateRepository.ts) instrada la chiusura produttiva alla RPC atomica. La versione [20260922150000_fix_found_in_atomic_closure.sql](supabase/migrations/20260922150000_fix_found_in_atomic_closure.sql) usa FOUND e lock FOR UPDATE, autorizza owner entity.user_id o ADMIN canonico, ricava il riporto dai dati DB, congela la riga DB anziché fidarsi degli importi client.

N+1 assente viene creato nella stessa transazione; N+1 OPEN viene preservato integralmente con modifica del solo riporto; conflitti espliciti causano rollback. N+1 CLOSED accetta soltanto riporto identico e non viene riscritto. Retry di N già chiuso è idempotente/riprendibile. Il fallback compensativo di repository privi di closeYearAtomic non è l’adapter produttivo attivo.

Acceptance atomica/riprendibile coperta da workflow, review/hardening Wave1, evidenza storica e test correnti. POST_CLOSE_N_PLUS_1_NAVIGATION conserva questi invarianti nella UI. Default demo N+1 è DATA-01; multiwriter OPEN è ARCH-PERSIST-01. Non sono residui di una chiusura parziale non recuperabile.

### CALC-01 — BLOCKER — VERIFIED_FIXED

[canonicalFundLedger.ts](src/logic/calculation/canonicalFundLedger.ts) è l’autorità economica FRD: ID semantici unici, blocco duplicati, entry economiche e figurative distinte. Le voci CCNL speciali non vengono sommate di nuovo come generiche. Incremento corrente 0,14% è aggiunto una volta, integralmente al FRD; recovery non istruito è conservato unresolved, senza aggiungerlo al totale determinato.

A/2025 dell’audit non deve tornare a 6.072,56 € come valore legale: con Art60 zero e recupero non istruito il subtotale verificato è 3.400 €, mentre il totale finale è non determinabile. Il doppio conteggio è rimosso; la mancata istruttoria dei recuperi resta NORM-02. Oracle 14/14 e suite ledger/Wizard/consumer sono verdi; review Wave2 confrontata con il codice.

### CALC-02 — BLOCKER — VERIFIED_FIXED

[FondoAccessorioDipendentePage.tsx](src/pages/FondoAccessorioDipendentePage.tsx) usa i totali canonici per costituito e disponibile; Cabina usa il medesimo stato/totale. [DistribuzioneRisorsePage.tsx](src/pages/DistribuzioneRisorsePage.tsx) legge il resolver [resolveDistributionFundBudget](src/logic/distribution/resolveDistributionFundBudget.ts): VALID usa totale canonico, UNDETERMINED usa il subtotale verificato come base istruttoria qualificata, missing/INVALID non promuove un numero legacy a budget definitivo. Calcoli monetari in centesimi/FinancialMath.

XLSX Fondo e PDF generale consumano fadCanonical, senza sommare ancora 0,14% o leggere section.total per il totale FRD. I test “poison getter” rendono osservabile una dipendenza illegittima dal vecchio DTO: i writer migrati non la usano. La review CALC02_FINAL_INDEPENDENT_CLOSURE_REVIEW e le 14 regressioni budget sono verdi, con regressioni pagina/exports.

L’acceptance originale “aggiunta UI dello 0,14%” è chiusa nei consumer riconciliati. FundDetails e le sezioni analitiche residue espongono un diverso debito di autorità concorrente: restano esplicitamente ARCH-01, non un residuo nascosto dichiarato chiuso.

### DOC-01 — BLOCKER — VERIFIED_FIXED

Il mapper Tabella15 parte dalle entry canoniche, mantiene segni e natura delle decurtazioni, arrotonda coerentemente, include i movimenti pertinenti e conserva componenti non mappate come unresolved. Una riga sconosciuta non scompare dal conto. Grand total nullable e verified subtotal non vengono confusi; il definitivo aritmetico è bloccato se mapping irrisolto.

Wave3 finale/consolidation e suite mapper/writer/guard sono coerenti col codice corrente. Gli errori originari di omissione/inversione segno non restano attivi. **RGS_SCHEMA_UNVERIFIED e isSicoExportReady=false** rimangono limiti ministeriali separati: correttezza aritmetica non valida lo schema SICO.

### DOC-02 — HIGH — VERIFIED_FIXED

Proiezione canonica → view model → factory governa Determina PDF/TXT, Relazione e Prospetto. XLSX Fondo/PDF generale sono ora migrati allo stesso read model FRD. Totali, stabile/variabile, segni e stato incompletezza sono coerenti con il canonico; il perimetro “altri fondi” nel riepilogo generale è separato.

opinionOutcome, transmissionStatus e adoptionStatus sono dati espliciti persistiti dallo schema. Numero/data di un parere non implicano automaticamente esito favorevole, trasmissione o adozione. Metadata mancanti rimangono placeholder dichiarati secondo il contratto approvato, senza inventare requisiti universali di favorevole/GC/firma.

DOCUMENT_KIND_READINESS distingue cinque tipi, usa le issue BLOCKING e impedisce definitivo pertinente su INVALID/UNDETERMINED/missing. Factory/service e chiamanti attivi applicano il guard; DRAFT_PREVIEW forza banner/nome bozza e niente formula costitutiva anche con ledger VALID. CLOSED da solo non rende finale un documento.

Review Wave3 successiva alle regressioni W3-MG-001 e review canonical/kind correnti disponibili, 73 test service + 8 UI verdi oltre ai writer reali. Vecchio TXT assertivo esportato ma senza caller UI è latente; qualificazione Tabella15 VALID-preview appartiene al debito TABELLA15_OUTPUT_MODE/UX-03, non agli errori originari di attestazioni/componenti DOC-02.

### NORM-01 — BLOCKER — VERIFIED_FIXED

Conglobamento Art60 applicato secondo N09 congelata: 2025 zero anche se snapshot legacy contiene 127,44 €; 2026 un funzionario produce decurtazione economica 127,44 € una sola volta, con computo figurativo separato che non aggiunge denaro al Fondo. Dal 2027 la base consolidata 2026 è esplicita; non si ricalcola automaticamente sulla platea corrente.

Una base esplicita 500 € viene rispettata; assenza della base richiesta produce UNDETERMINED. Motore/normalizer, Wizard calcolo/transfer, ledger, FAD e documenti migrati preservano decorrenza e natura figurativa. Oracle, test Art60/2027 e review Wave2 + report canonical sono verdi. Restano i limiti normativi originariamente non verificati su altre casistiche, senza un residuo dimostrato di NORM-01.

### FUNC-01 — HIGH — VERIFIED_FIXED

[AppContext.tsx](src/contexts/AppContext.tsx) rifiuta azioni mutanti quando metadata.snapshotStatus=CLOSED; il guard comprende import/transfer e i consumer correnti. Save/autosave producono errore tipizzato o esito non-success, senza falso toast di salvataggio. Reports metadata, costituzione/distribuzione, Wizard transfer/rollback e gestione annualità rispettano la consultazione read-only.

Correlation user/entity/year, epoch/request identity e pending draft contestuali evitano risposte stale o applicazioni nel contesto sbagliato; remote-draft test usa repository mock isolato, senza fallback rete. Le regressioni CLOSED e Wave4.1 correnti sono verdi. POST_CLOSE rafforza il passaggio senza riscrivere N. Questo non costituisce CAS tra due dispositivi.

### FUNC-02 — HIGH — VERIFIED_FIXED: cinque dimensioni

| Dimensione | Root cause/consumer corretto | Acceptance e evidenza corrente |
|---|---|---|
| 1. Cabina blocker priority | resolveOperationalStatus / resolveCabinaViewModel → Cabina | CLOSED prevale; INVALID e VALID+BLOCKING non anticipano distribuzione; CTA “Apri verifiche” porta al target reale; warning non blocca. Test resolver/page e review dedicata PASS |
| 2. Distribution explicit draft | DistribuzioneRisorsePage + proposta pura | Personale mancante diverso da zero esplicito; nessun useEffect allocante/persistente; preview senza dispatch; applicazione solo click e preserva dati estranei; issue blocking negano proposta. 23 test proposta + 19 pagina e review PASS |
| 3. Closure instruction readiness | policy pura + AppContext/yearClosureWorkflow command | NOT_READY/READY/ALREADY_CLOSED distinti; stored readiness e ricalcolo draft corrente possono soltanto restringere; guard prima di write; warning consentito, blocking/missing negato; retry atomico intatto. 17 policy + 21 integrazione e review PASS |
| 4. Document kind readiness | policy per DETERMINA/RELAZIONE/PROSPETTO/SUMMARY_PDF/FAD_XLS | Gate definitivo numerico+BLOCKING/prerequisiti; draft consultabile e qualificato; guard UI e service/factory; CLOSED non equivale a FINAL. 73 service + 8 UI e review PASS |
| 5. Post-close N+1 navigation | receipt contestuale e switchYearAfterClosure | Successo RPC sincronizza prima il guard CLOSED; non fa flush/save N, idrata N+1, preserva target; OPEN switch ordinario mantiene save-before-load; errore post-commit consente “Apri l’anno N+1” senza re-close; callback stale/rollback/autosave non scrivono N. 16 integrazioni provider e review PASS |

I cinque percorsi sono controllati sui sorgenti successivi alla precedente reconciliation. Non rimane una prossima azione/chiusura/export anticipata per le issue riconosciute nel contratto. I controesempi upstream PNRR/Dirigenza/default non sono sanati dal workflow: mantengono CALC-05/CALC-04/DATA-01.

La readiness di chiusura verificata è quella dei consumer applicativi attivi e del comando, come nello slice e nella review. Non si sostiene che ogni invocazione SQL autorizzata ricomputi il motore normativo o che il DB certifichi l’istruttoria giuridica. Nessun nuovo requisito di distribuzione completa, documenti preventivi o gate SQL viene introdotto per analogia.


## Partially-fixed evidence

### DATA-03 — HIGH — PARTIALLY_FIXED

[fundDataSchemas.ts](src/schemas/fundDataSchemas.ts) contiene un MonetarySchema nonnegative, ma le sezioni economiche di FundDataSchema mantengono optional().or(z.any()). Il ramo any consente il dato che il ramo tipizzato rifiuta. Inoltre il preprocess Number(...) converte una stringa malformata in undefined e l’optional la accetta: non è una validazione “malformed → errore”.

[inputNormalizer.ts](src/application/input/inputNormalizer.ts) conserva valori raw delle sezioni; [snapshotWorkflow.ts](src/application/snapshots/snapshotWorkflow.ts) non applica un boundary monetario uniforme prima dell’upsert. Import/hydration/transfer possono quindi portare nello stato dati che un singolo input UI avrebbe limitato.

Probe su st_art79c1_art67c1_unicoImporto2017, schema reale + normalizer reale + save reale con adapter mock OPEN:

| Input additivo | FundDataSchema accetta | MonetarySchema diretto | Valore dopo normalizer / passato al repository mock | Errore associato al campo | Core |
|---|---|---|---|---|---|
| -100 | Sì | Rifiuta | -100 / -100; save success | Assente | INVALID, total=null |
| stringa malformed | Sì | Accetta come undefined | malformed / malformed; save success | Assente | Eccezione big.js Invalid number nel helper legacy |
| Infinity | Sì | Rifiuta | Infinity / Infinity; save success | Assente | Nessuna attestazione di persistenza reale/serializzazione DB |

Un additivo +100 è VALID/100. Una decurtazione positiva 20 su stabile 1.000 produce 980: operazione sottrattiva e quantità positiva sono distinguibili. Non si propone di vietare indiscriminatamente ogni campo negativo o di capovolgere le decurtazioni.

Il ledger corregge il caso negativo come INVALID: progresso reale, quindi PARTIALLY_FIXED. L’acceptance originaria richiede però diniego/errore visibile all’ingresso e salvataggio/import coerenti. Il crash malformed appartiene allo stesso DATA-03, non diventa un 26° finding. MONETARY_FIELD_FEEDBACK è assorbito nello slice boundary senza eliminare l’obbligo di errore accessibile.

### CALC-04 — HIGH — PARTIALLY_FIXED

In [fundEngine.ts](src/logic/calculation/fundEngine.ts), FAD usa verifiedArt23Subject dal canonico; EQ deriva il perimetro dalle componenti, non dalla cache globale; Segretario deriva le componenti ordinarie con coverage/esclusioni motivate. Dirigenza, invece, legge ancora lim_totaleParzialeRisorseConfrontoTetto2016 quando hasDirigenza=true, con fallback zero (riga 338).

| Perimetro nel probe | Risorse | Tetto | Cache impostata | Consumo soggetto corrente | Conforme |
|---|---:|---:|---:|---:|---|
| FAD | 2.000 | 1.000 | 0 | 2.000 | NO |
| EQ | 2.000 | 1.000 | 0/assente | 2.000 | NO |
| Segretario ordinario, senza deroga | 2.000 | 1.000 | 0 | 2.000 | NO |
| Dirigenza | 2.000 | 1.000 | 0 | 0 | SÌ |
| Dirigenza identica | 2.000 | 1.000 | 2.000 | 2.000 | NO |

Il cambio della sola cache ribalta la conformità Dirigenza. Wave2 ha corretto una parte significativa, non la root cause su tutti i fondi. Il nuovo slice deve derivare il perimetro normativamente motivato, senza assumere che ogni componente Dirigenza sia soggetta.

### NORM-02 — HIGH — PARTIALLY_FIXED

Corrente e recovery sono ora economicamente separati. Il massimo corrente 0,22% su MS2021=1.000.000 è 0 nel 2024 e 2.200 annui nel 2025/26/27; il 2026 non produce automaticamente 4.400. Il recovery aggregato non istruito è unresolved, non diventa automaticamente componente variabile utilizzabile.

Questo soddisfa la mitigazione aritmetica, non tutta N07/N08/acceptance. Non esiste ancora un’istruttoria completa per ogni annualità di competenza con provenance del titolo/decisione, importo già utilizzato, residuo recuperabile, recupero parziale e verifica anno chiuso. Alcune entry conservano originYear nullo; il transfer preview/Step4 rimanda al futuro flusso di istruttoria.

Il semplice “non sommare 2.800” non documenta se siano già stati utilizzati né consente un recupero parziale legittimo. Serve CCNL_RECOVERY_INSTRUCTION; non si inventa un obbligo universale di recupero o un nuovo automatismo.

### ARCH-01 — HIGH — PARTIALLY_FIXED

La ricostruzione distingue uso operativo da mera presenza di codice. Il resolver DL25 ora rispetta canonico zero su alias legacy 900 e registra provenance della compatibilità. I nuovi documenti FRD non leggono l’autorità legacy. Il vecchio helper CCNL che ripartisce 0,14% FRD/EQ è ancora chiamato per diagnostica/compatibilità, ma questa sola chiamata non prova che il suo risultato sia ancora sommato come corrente nel ledger.

Restano consumer **ACTIVE** concorrenti:

| Autorità / percorso | Attività corrente | Esito |
|---|---|---|
| calculateFadTotals → fundEngine | Costruisce constitution.sections e aggregati legacy in parallelo | Contratto diverso dal ledger; non eliminato dalla migrazione report |
| FondoAccessorioDipendentePage | Fallback helper quando manca calculationResult, più dettagli legacy analitici | Totali principali canonici corretti, ma concorrente non integralmente ritirato |
| FundDetailsPage | Registrato nel module registry, accessibile da navigazione/issue; legge section.total e compatibility summary | Consumer attivo, non dead code |
| createReportViewModel.fondoDipendenti legacy | Proprietà ancora costruita | I writer moderni tipizzati su fadCanonical/altriFondi non la leggono; debito latente per i documenti migrati |
| Vecchi services root pdfReportService/pdfReportService2/xlsReportService | Service operativo importa services/documents | Nessun caller attivo operativo trovato per quei vecchi root |
| generateDeterminazioneTXT/buildDetermina storico | Export sorgente senza caller UI trovato | Latente, non bypass documentale attivo dimostrato |

Controesempio eseguito sul motore corrente: MS2021=1.000.000, entry corrente st_art58c1_CCNL2026_incremento014_MS2021=1.400. Canonical stableTotal=1.400; constitution.sections.stabili.total=0; helper legacy totaleStabile_Dipendenti=0. FundDetails mostra il valore della sezione. La stessa risorsa può quindi cambiare esposizione secondo il percorso attivo.

Il residuo non è il vecchio doppio incremento della pagina FAD già chiuso in CALC-02, né un errore nei writer migrati. È la persistenza di autorità analitiche economiche alternative. VERIFIED_FIXED richiede ritiro/allineamento di tutti i consumer attivi; il solo ritiro di codice latente non basta.

### ARCH-02 — MEDIUM — PARTIALLY_FIXED

Le tre Edge Functions ora autenticano JWT e leggono il ruolo da profiles del chiamante verificato prima di mutazioni service-role. user_app_state.role e auth metadata non decidono più create-user/update-password/delete-user. Owner resta entity.user_id; author/owner/role corrente non sono confusi nei guard verificati.

[UserManagementPage.tsx](src/pages/UserManagementPage.tsx) aggiorna prima profiles, poi tenta user_app_state.role e ignora il secondo errore. Un mirror fallito, anche per CLOSED, può essere presentato come aggiornamento completamente riuscito. Il mirror è ormai non autoritativo per le tre Edge, ma il contratto d’esito e compatibilità non è chiuso.

La migration profile-role locale non è stata dimostrata applicata. Il vecchio trigger può ancora costituire la fonte upstream di un ruolo profile controllabile dai metadata se è quello installato. La correttezza del check profiles nel sorgente non certifica la correttezza live della fonte profiles.

Lo slice mirror e il gate operativo profile restano necessari; **SOURCE_FIXED dei tre endpoint, LIVE_FIX_NOT_VERIFIED complessivo**. Dettagli e debiti fuori dai 25 nella sezione Auth.

### UX-01 — MEDIUM — PARTIALLY_FIXED

Ledger/proiezione/read model espongono semantic ID, fonte, status, natura economica/figurativa, alcuni anni di origine e missing; canonical report ed explicit draft rendono più corretto e leggibile il numero. Non esiste ancora una catena completa, utilizzabile dall’RSU, **numero → origine → periodo → manuale/calcolato → decisione/facoltà → documento o missing** per tutte le risorse e tutte le 15 risposte originali.

Provenance tecnica di un alias non prova certificazione documentale o decisione amministrativa; recovery unresolved non ha automaticamente un dossier. Non è stata rieseguita una sessione RSU corrente che risponda alle 15 domande. Ci sono miglioramenti comprovati ma un acceptance globale non soddisfatto: RESOURCE_PROVENANCE_READ_MODEL rimane necessario.

### UX-02 — HIGH — PARTIALLY_FIXED

[AreaFondoContextBar.tsx](src/components/areaFondo/AreaFondoContextBar.tsx) rende persistenti ente/anno/stato con contesto sticky; è un miglioramento rispetto al black box originario. Il nome lungo resta truncate con title HTML; l’owner/context amministrativo è demandato al popover e non è garantito sempre consultabile da touch.

Gli screenshot precedenti 360/390/430 e i test/evidence pack di prototipo o Wave4.1 non dimostrano nome completo, owner, scroll, dialog/menu e stato CLOSED del working tree post-slice. Non è stato eseguito un nuovo collaudo visuale corrente. PARTIALLY_FIXED deriva dal codice migliorato e dai residui concreti, senza promozione a VERIFIED o dichiarazione mobile completa.

### UX-03 — MEDIUM — PARTIALLY_FIXED

Cabina e i nuovi workflow usano azioni più chiare e distinguono draft/final. Reports però mostra letteralmente opinionOutcome, transmissionStatus e adoptionStatus nei label, con token tecnici nelle opzioni; mapping preview del Wizard conserva source/targetLegacyField e linguaggio di refactoring. La contraddizione “Non ancora attivo” appartiene anche a FUNC-03.

La gerarchia mobile e il lessico globale non sono coperti da una review attuale completa. Tabella15 espone correttamente il limite RGS/SICO, ma il writer non distingue ancora la qualificazione VALID+DRAFT dal definitivo aritmetico tramite mode/basename/banner. RSU_BUSINESS_LABELS e TABELLA15_OUTPUT_MODE restano necessari. La sola correttezza del nuovo read model non chiude UX-03.


## Open evidence

### DATA-01 — HIGH — OPEN

[constants.ts](src/constants.ts) mantiene INITIAL_HISTORICAL_DATA economici: FRD2016=1.200.000, EQ2016=150.000, Dirigenza2016=300.000, Segretario2016=30.000, straordinario2016=50.000, per un totale storico **1.730.000 €**, senza un input dell’ente appena creato. Tabellari2023=2.500.000, personale2018=125, FRD2018=1.250.000 ed EQ2018=160.000. Esistono inoltre default finanziari del simulatore e base PNRR non neutri.

AppContext defaultInitialState usa queste costanti; SET_CURRENT_ENTITY resetta il fondo da tale stato. Il reducer reale, invocato dal probe con un nuovo ente, restituisce gli importi sopra. Non sono fixture/demo isolate dal runtime.

Switch/initializeAnnualSnapshot e builder nuova annualità ricevono la stessa base di default quando non esiste un dato salvato; il percorso N+1 non ha introdotto un builder economicamente vuoto. Se si copia uno storico reale già noto è necessaria una policy/provenance esplicita: non autorizza importi demo per un nuovo ente. Acceptance nuovo ente/anno senza importi non inseriti resta aperta.

### CALC-03 — HIGH — OPEN

Scenario riprodotto: TAB2023=300.000, stabile=100.000, EQ=20.000 → 0,48×300.000−100.000−20.000 = **24.000 € netti**. Margini Art33 e L296 capienti, oneri 27,4%.

calculateSimulazione calcola il minimo tra margine48 netto e margini finanziari lordi e poi divide tutto per 1,274. Actual **18.838,304552590267 €**; expected congelato **24.000 €**; differenza −5.161,695447409733 €. L’arrotondamento non spiega la differenza. Il consumer SimulatoreIncrementoForm usa la funzione/re-export: percorso attivo.

Il caso finanziario vincolante dovrà invece convertire soltanto quello spazio in netto. Nessuna modifica alla formula effettuata; DL25_NET_GROSS_MARGIN resta necessario.

### CALC-05 — HIGH — OPEN

[fundEngine.ts](src/logic/calculation/fundEngine.ts), righe 467–470: maxPnrr = annualData.calcolatoIncrementoPNRR3 ?? 0, confronto solo se maxPnrr > 0. Un valore positivo può essere immesso/importato senza far scattare il confronto quando il massimo è zero o assente.

| Cap corrente | Incremento richiesto | Ledger corrente | Compliance PNRR | Expected del contratto congelato |
|---|---:|---|---|---|
| 0 | 100 | VALID, totale=100 | Nessun errore | INVALID / non applicabile, nessuna risorsa positiva utilizzabile |
| Missing | 100 | VALID, totale=100 | Nessun errore | UNDETERMINED, nessun definitivo |
| 200 | 100 | VALID, totale=100 | Nessun errore | Ammissibile nel caso per gli altri requisiti soddisfatti |
| 50 | 100 | VALID, totale=100 | Errore “supera limite massimo …50” | Non utilizzabile come conforme; controllare anche stato/consumer downstream |

Il cap positivo conserva un controllo compliance; non si afferma che il ledger globale diventi INVALID nel quarto caso, perché actual resta VALID e il blocco è nella checklist. Zero/missing non producono nemmeno tale errore. Contratto anno/requisiti/perimetro rimane quello congelato; nessun nuovo requisito normativo UNCERTAIN viene introdotto.

### NORM-03 — HIGH — OPEN

N13 congelata stabilisce l’8 agosto 2026 e il campo soggettivo degli enti cui si applica Art33 per il superamento dei commi L296 557/557-quater/562. Non è una rimozione indiscriminata di Art23 o dei vincoli per enti non coperti.

La firma calculateSimulazione riceve dati finanziari/abitanti/tipologia, senza data/regime; include sempre fase3_margineDisponibileL296_06 nel minimo. Nel probe con margine finanziario Art33 269.900 €, margine48 24.000 €, spesa e tetto L296 entrambi 100, il risultato è **0**. Non può distinguere due casi identici prima/dopo 8/8/2026.

La shared Art33 application policy distingue entità/ambito/manual decision e ha test verdi, ma non sostituisce il gate temporale in questo simulatore attivo. Nessuna ricerca normativa nuova; DL25_TEMPORAL_REGIME resta necessario secondo l’audit congelato.

### NORM-04 — HIGH — OPEN

[Step3Dl25.tsx](src/features/wizard2026/steps/Step3Dl25.tsx) usa annoPrecedente=annoIstruttoria−1 per label di campi base amministrativa denominati fondoPersonale2025/EQ2025. Nel 2025 chiede quindi 2024, nel 2026 2025 e nel 2027 2026, senza un contratto amministrativo coerente di base/rettifiche.

[Step8RiepilogoPreview.tsx](src/features/wizard2026/steps/Step8RiepilogoPreview.tsx) continua a indicare **4,8%** nel testo mentre la formula usa **0,48 = 48%**. L’errore percentuale verificato è di label, non una formula 4,8% introdotta nel calcolo. Il dato base sbagliato chiesto all’operatore può comunque produrre un risultato errato con formula corretta.

Acceptance nessuna richiesta2024 per CS25/EQ25 nel 2025, 48% nel riepilogo e rettifiche figurative Art60 chiaramente spiegate non è soddisfatta integralmente. Wizard/simulatore/report labels non hanno un unico contratto anno-base verificato per 2025/26/27.

### FUNC-03 — MEDIUM — OPEN

[Wizard2026SummaryPanel.tsx](src/features/wizard2026/components/Wizard2026SummaryPanel.tsx), footer, mantiene un pulsante disabilitato con messaggio **“Non ancora attivo” / dopo il refactoring**. Step8RiepilogoPreview presenta invece l’azione effettiva di trasferimento, correttamente guardata per CLOSED/context e condizioni del flusso.

Le due superfici coesistono nello stesso Wizard: un trasferimento attivo con un secondo messaggio che lo dichiara non disponibile. Le iterazioni UX/readiness non hanno rimosso la root cause, e i test generali non provano un unico stato/messaggio di disponibilità. WIZARD_SINGLE_TRANSFER_ACTION rimane necessario.

### ACCESS-01 — HIGH — OPEN

La modal Nuovo ente in [FondiEntiPage.tsx](src/pages/FondiEntiPage.tsx), blocco overlay intorno alla riga 699, è un div custom. Non usa il contratto del componente Modal eventualmente accessibile altrove.

| Dimensione richiesta | Evidenza corrente |
|---|---|
| role=dialog, aria-modal, nome associato | Assenti sul contenitore Nuovo ente |
| Trap Tab | Nessuna gestione dei limiti del dialog |
| Shift+Tab | Nessun loop inverso |
| Escape | Nessun handler del dialog |
| Focus return | Nessun ref/restore al trigger |
| Background inert | Nessuna inertizzazione del contenuto sottostante |

autoFocus sul primo input non è una focus trap. Il click su chiusura/backdrop non soddisfa tastiera/focus return. Il codice basta a confermare il residuo, senza pretendere uno screen-reader test non eseguito. NEW_ENTITY_DIALOG_KEYBOARD necessario.

### ACCESS-02 — MEDIUM — OPEN

[ReportsPage.tsx](src/pages/ReportsPage.tsx) conserva i sette textbox metadata con label visivi senza associazione htmlFor/id e i nuovi select non sono tutti nominati. Non è sufficiente una scritta adiacente per il nome accessibile.

Wizard Step3 e altri controlli economici hanno spinbutton/input senza nomi/unità/errori coerentemente associati. FundingItem mostra un miglioramento locale label/id/aria-label, ma non un contratto globale di aria-describedby e campo-errore annunciabile.

[Card.tsx](src/components/shared/Card.tsx) ha un div focusable role=button con onClick/onKeyDown che contiene un button nativo. È interattività annidata e potenziale doppio Tab/bubbling, anche se il contenitore non è letteralmente un elemento button. Il toggle mobile SummaryPanel è un altro consumer da coprire.

Acceptance “ogni campo ha nome univoco e unità, errori annunciabili, ordine Tab senza duplicazioni” ancora aperta. Sono necessari Reports names, trigger unico e uno slice esplicito Wizard economic controls; il feedback errori è integrato nel boundary monetario e non contato due volte.


## Auth/security outside the 25

### SECURITY / AUTH GATES OUTSIDE THE ORIGINAL 25

Questa sezione non aggiunge finding alla matrice ASTRA né modifica severity ARCH-02. Per gli endpoint si distingue implementazione verificata dal target installato.

| Debito/gate | Sorgente/evidenza | Stato corrente | Residuo |
|---|---|---|---|
| AUTH_ADMIN_01 | create-user/index.ts: getUser/JWT → profiles del caller verificato → ADMIN; diniego prima di parse body/service mutation; 19 test real-source + review indipendente PASS | **SOURCE_FIXED** | Deploy Edge e verifica runtime target non riacquisiti |
| AUTH_ADMIN_02A | update-password/index.ts: ruolo da profiles, metadata e snapshot role irrilevanti, error/missing/NULL fail-closed; 34 test + review PASS | **SOURCE_FIXED** | Stesso gate operativo; nessuna password realmente cambiata qui |
| AUTH_ADMIN_02B | delete-user/index.ts: caller canonico e ADMIN prima di DML/Auth delete; 42 test + review PASS | **SOURCE_FIXED** | Runtime/deploy e cleanup funzionale CLOSED/FK separati |
| AUTH_ROLE_03 / AUTH_ROLE_MIRROR_CONTRACT | profiles update seguito da mirror user_app_state; secondo esito ignorato | **OPEN** | Esito consistente/parziale, contratto compatibilità e nessun rewrite implicito CLOSED |
| Profile-role migration | 20261002000000_harden_auth_profile_role_source.sql, byte-identica al PRE | **APPLY_PENDING / LIVE_FIX_NOT_VERIFIED** | Rehearsal byte-exact, rollback, apply autorizzato e riscontro live separati |
| Runtime/live security validation | Nessun contatto remoto/deploy in questa reconciliation; source test non esercita il target Edge reale | **LIVE_NOT_VERIFIED** | Gate operativo controllato, non nuova implementazione dei tre check già corretti |
| Cleanup/delete funzionale | CLOSED boundary richiede cleanup flag+ADMIN DB; knowledge_documents.uploaded_by FK senza ON DELETE CASCADE | **OPEN_CONTRACT / FUNCTIONAL_DEBT** | Definire cleanup e comportamento di errore; non verificato con delete reale |

I test coprono diniego anon/invalid JWT, GUEST/USER/NULL/missing profile, identità incoerente e dati non autoritativi; ADMIN canonico autorizzato solo secondo il contratto. Le tre review sono indipendenti e disponibili. Il client service-role è mockato: “nessuna mutazione dopo diniego” è osservabile senza cambiare account o dati.

### Profile trigger e evidenza rehearsal

Hash SHA256 del file congelato:

~~~text
8670E439CD6FA8AE969652445637168491AFD3388DE710CE2AE9E2752EF2614D
~~~

Il patch contiene CREATE OR REPLACE handle_new_user_profile(): nuovo profile con literal GUEST, in conflitto aggiorna soltanto email/updated_at, preservando ADMIN/USER/GUEST/NULL esistenti. Non legge raw_user_meta_data/raw_app_meta_data. Non introduce nuove constraint di ruolo, non cambia trigger/ACL/owner, non normalizza ruoli esistenti e non modifica user_app_state.role. Un report che descrive genericamente ulteriori “constraint hardening” non dimostra che siano nel file.

La definizione storica 20260220000004_fix_profiles_recursion.sql legge metadata.role e può colmare NULL. Il trigger auth.users AFTER INSERT OR UPDATE mantiene la sincronizzazione/timestamp. Il patch elimina la fonte metadata per il ruolo, non il side effect updated_at.

La precedente reconciliation conserva il riferimento storico history27 / A=1 / B=1 / C=1 / AUTH=0 e fingerprint pre-fix 0379c1ca21dd0a98c08a2125e9469bf2355d51d02a9c39514ee1f4a2e4619d38. Sono dati di un gate precedente, non query odierne.

Il precedente rehearsal riferito falliva per LF→CRLF, con rollback e POST=PRE; la successiva autorizzazione V2 byte-exact non equivale a PASS/apply. Non è stato trovato/riacquisito un artefatto conclusivo corrente sufficiente a promuovere il gate. La disponibilità di una clean-room locale o di test statici è evidenza di preparazione/source, non installazione permanente.

**LIVE_SECURITY_STATUS = LIVE_NOT_VERIFIED**. Nessuna conclusione “produzione sicura”, “staging allineato”, “migration applicata” o “Edge deployata”.

## Non-25 debts

### NON-25 DEBTS / FOLLOW-UP

| Debito | Verifica corrente / residuo | Classificazione operativa |
|---|---|---|
| ARCH-PERSIST-01 multiwriter/CAS | Ordinary OPEN save/autosave/import/transfer/rollback restano read/upsert senza expected server version comune. Context epoch locale e row lock di closure non proteggono due client OPEN concorrenti | **OPEN_HIGH_DEBT_OUT_OF_SCOPE rispetto a Wave4.1**; inventario writer + contratto CAS necessario, fuori dai 25 |
| RGS_SCHEMA_UNVERIFIED | Mapper/writer/UI dichiarano schema annuale non verificato; nessun contratto ministeriale versionato validato riacquisito | Limite esplicito; gate RGS_ANNUAL_SCHEMA_VERIFICATION |
| isSicoExportReady=false | Readiness aritmetica e SICO sono distinte; nessun export ministeriale validato | **SICO_READINESS = FALSE**; non “DOC-01 ancora aritmeticamente rotto” |
| TABELLA15_OUTPUT_MODE | Wrapper guardato riceve mode, writer XLSX/CSV riceve DTO senza options di resa; VALID+DRAFT può avere basename/totale generale del definitivo aritmetico | **STILL_REQUIRED**, qualificazione output; non riapre gli atti moderni DOC-02 |
| AUTH_PROFILE_LOGIN_TIMESTAMP_SIDE_EFFECT | Trigger auth.users UPDATE può modificare profiles.updated_at; UserManagement ordina/mostra quel timestamp | Debito di significato temporale non bloccante; patch ruolo lo conserva deliberatamente |
| Delete/cleanup FK/CLOSED | knowledge_documents.uploaded_by REFERENCES auth.users senza cascade; cleanup CLOSED richiede contesto ADMIN/flag non stabilito dal semplice service-role endpoint | Follow-up funzionale/contrattuale; nessun delete reale o guasto remoto indotto |
| Riproducibilità history migration | Baseline/migration storiche e file SQL locali non attestano schema remoto effettivo o equivalenza dei payload byte-exact | Parte del gate operativo; nessuna modifica della history o apply |
| Codice documentale latente | Vecchi writer root e TXT assertivo esportati ma nessun caller UI attivo trovato | Ritiro eventuale nel lavoro ARCH-01, non slice autonomo indispensabile |
| Vecchi finding review Wave3 | W3-DOC-001, W3-T15-001/002, W3-ATT-001/002, W3-WB-001, W3-MG-001 confrontati con fix successivi/readiness/writer correnti e suite verde | Nessun nuovo OPEN corrente confermato da questi ID; RGS e Tab15 mode restano distinti |

L’eccezione malformed scoperta dal probe rafforza DATA-03 e la dipendenza legacy di ARCH-01; non modifica il censimento. Gli errori di configurazione/probe temporanei non sono nuovi finding applicativi.

Questi debiti non diventano il 26°, 27° o successivo finding ASTRA. La sola presenza di un possibile FK failure non viene presentata come una cancellazione live fallita osservata: è un contratto funzionale non coperto che richiede lavoro separato.


## Original roadmap reconciliation

La roadmap originale ha **29 slice**, contati dai nomi della sezione G del precedente report. La tabella conserva ogni slice e aggiunge POST_CLOSE_N_PLUS_1_NAVIGATION come emerso successivamente, quattro nuovi slice tecnicamente necessari e due gate operativi mancanti nel vecchio inventario.

DONE_VERIFIED significa acceptance locale del relativo slice verificata e review disponibile. Per le tre Edge Functions DONE_SOURCE_ONLY significa **sorgente e review completati, deployment/runtime non verificati**: non indica che manchi la review né che i check vadano riscritti. Una review pura non è uno slice di implementazione.


| Slice | Classificazione corrente | Origine | Evidenza / acceptance residua |
|---|---|---|---|
| AUTH_ADMIN_01_SERVER_ADMIN_CHECK | DONE_SOURCE_ONLY | ORIGINAL | Check ADMIN da profiles + JWT prima di body/mutazioni; 19 test e review PASS |
| AUTH_ADMIN_02A_PASSWORD_CANONICAL_AUTH | DONE_SOURCE_ONLY | ORIGINAL | profiles canonico, mirror/metadata irrilevanti; 34 test e review PASS |
| AUTH_ADMIN_02B_DELETE_CANONICAL_AUTH | DONE_SOURCE_ONLY | ORIGINAL | Auth canonica prima di DML/Auth delete; 42 test e review PASS; cleanup distinto |
| AUTH_ROLE_MIRROR_CONTRACT | STILL_REQUIRED | ORIGINAL | Gestire errore del secondo update, esito parziale e CLOSED senza riscrittura implicita |
| AUTH_PROFILE_ROLE_PENDING_GATE | OPERATIONAL_GATE_PENDING | ORIGINAL | Patch congelato: rehearsal byte-exact/rollback, apply autorizzato, verifica live |
| FAD_REPORT_READ_MODEL | DONE_VERIFIED | ORIGINAL | fadCanonical deriva entry/totali/provenance; 17 test presenter e review |
| CANONICAL_FAD_XLSX | DONE_VERIFIED | ORIGINAL | Writer reale canonico, mode/gate, rounding, poison legacy getter; 16 test + review |
| CANONICAL_FUND_SUMMARY_PDF | DONE_VERIFIED | ORIGINAL | PDF reale: FRD canonico/perimetri distinti, draft/final e 17 test + review |
| DOCUMENT_KIND_READINESS | DONE_VERIFIED | ORIGINAL | Cinque tipi, blocking precedence, mode e service/factory guard; 73 service + 8 UI e review |
| TABELLA15_OUTPUT_MODE | STILL_REQUIRED | ORIGINAL | Passare mode al writer per basename/banner BOZZA su VALID+DRAFT; SICO sempre false |
| DL25_NET_GROSS_MARGIN | STILL_REQUIRED | ORIGINAL | Minimo su grandezze omogenee; expected netto 24.000; finanziario/(1+oneri) |
| DL25_TEMPORAL_REGIME | STILL_REQUIRED | ORIGINAL | Contratto N13 8/8/2026; data/regime/ente, test prima/dopo e non coperti |
| DL25_BASE_YEAR_LABELS | STILL_REQUIRED | ORIGINAL | Base amministrativa/rettifiche e label 48% per 2025/26/27; non formula implicita |
| PNRR_ZERO_AND_MISSING_CAP | STILL_REQUIRED | ORIGINAL | Zero+100 INVALID; missing UNDETERMINED; positivo centesimi/anno/requisiti su tutti gli ingressi |
| ART23_DIRIGENZA_DERIVED_CONSUMPTION | STILL_REQUIRED | ORIGINAL | Derivare dalle componenti motivate; cache toggle/delete ininfluente, 2.000/1.000 |
| EMPTY_FUND_INITIALIZATION | STILL_REQUIRED | ORIGINAL | Nuovo ente/anno senza demo, missing distinto da zero; snapshot esistenti preservati |
| MONETARY_INPUT_BOUNDARY | STILL_REQUIRED | ORIGINAL | Schema/normalizer/import/save coerenti; negativi additivi, malformed, Infinity e feedback associato |
| MONETARY_FIELD_FEEDBACK | MERGE_INTO_OTHER | ORIGINAL | Assorbito in MONETARY_INPUT_BOUNDARY; errori visibili/annunciabili restano acceptance vincolante |
| CCNL_RECOVERY_INSTRUCTION | STILL_REQUIRED | ORIGINAL | Per competenza, già usato, titolo/decisione, residuo parziale e anno chiuso; nessun automatico |
| CABINA_BLOCKING_ISSUE_PRIORITY | DONE_VERIFIED | ORIGINAL | VALID+BLOCKING → Apri verifiche; CLOSED precedence, missing e warning distinti; review |
| DISTRIBUTION_EXPLICIT_DRAFT | DONE_VERIFIED | ORIGINAL | Missing personale distinto da zero; preview pura, persist solo scelta esplicita; review |
| CLOSURE_INSTRUCTION_READINESS | DONE_VERIFIED | ORIGINAL | Guard stato stored+draft corrente, BLOCKING/not-ready, retry atomicità preservata; review |
| WIZARD_SINGLE_TRANSFER_ACTION | STILL_REQUIRED | ORIGINAL | Unico stato disponibilità/messaggio/esito con guard CLOSED/context |
| NEW_ENTITY_DIALOG_KEYBOARD | STILL_REQUIRED | ORIGINAL | Dialog named, Tab/ShiftTab, Escape, focusreturn/inert con prova locale |
| REPORT_METADATA_ACCESSIBLE_NAMES | STILL_REQUIRED | ORIGINAL | Tutti i textbox/select nominati, unità/error association OPEN/CLOSED |
| SINGLE_ACCORDION_TRIGGER | STILL_REQUIRED | ORIGINAL | Unico trigger semantico, niente doppio Tab/bubbling, Enter/Space/aria-expanded |
| MOBILE_FUND_CONTEXT | STILL_REQUIRED | ORIGINAL | 360/390/430 corrente: sticky ente/anno/stato/owner, nome completo touch e scroll/modal |
| RSU_BUSINESS_LABELS | STILL_REQUIRED | ORIGINAL | Rimuovere internal identifiers e lessico refactoring dai flussi, gerarchia mobile completa |
| RESOURCE_PROVENANCE_READ_MODEL | STILL_REQUIRED | ORIGINAL | Numero→periodo→fonte/manuale/calcolato→decisione→documento/missing; 15 domande RSU |
| POST_CLOSE_N_PLUS_1_NAVIGATION | DONE_VERIFIED | SUBSEQUENT | Receipt contestuale; niente flush/save N chiuso; hydrate N+1/retry e review PASS |
| ACTIVE_LEGACY_ECONOMIC_AUTHORITY_RETIREMENT | STILL_REQUIRED | NEW | Chiudere ARCH-01 ACTIVE FundDetails/sections/fallback senza confondere dead code |
| WIZARD_ECONOMIC_CONTROLS_ACCESSIBILITY | STILL_REQUIRED | NEW | Colmare ACCESS-02 fuori da Reports/Card; nomi/unità/errori per Wizard e ingressi economici |
| ARCH_PERSIST_01_MULTIWRITER_CAS | STILL_REQUIRED | NEW | Inventario writer e contratto server version/CAS; progettazione e test concorrenza separati |
| DELETE_CLEANUP_CONTRACT | STILL_REQUIRED | NEW | Cleanup autorizzato CLOSED/FK knowledge_documents e semantica errori/transaction |
| AUTH_EDGE_DEPLOYMENT_AND_RUNTIME_VALIDATION | OPERATIONAL_GATE_PENDING | NEW | Tre funzioni SOURCE_FIXED: deploy autorizzato + matrix JWT/profiles/runtime sul target |
| RGS_ANNUAL_SCHEMA_VERIFICATION | OPERATIONAL_GATE_PENDING | NEW | Confronto ufficiale annuale/mapping; SICO false finché validato; nessuna rete in questa fase |

| Classificazione | Solo 29 originali | Inventario corrente |
|---|---:|---:|
| DONE_VERIFIED | 7 | 8 |
| DONE_SOURCE_ONLY | 3 | 3 |
| STILL_REQUIRED | 17 | 21 |
| MERGE_INTO_OTHER | 1 | 1 |
| NO_LONGER_REQUIRED | 0 | 0 |
| OPERATIONAL_GATE_PENDING | 1 | 3 |
| **TOTAL** | **29** | **36** |

POST_CLOSE_N_PLUS_1_NAVIGATION è DONE_VERIFIED, aggiunto al conteggio corrente e assente dai 29 originali. Nessuno slice originale è cancellato per titolo o per analogia. MONETARY_FIELD_FEEDBACK è MERGE_INTO_OTHER nel boundary; la sua acceptance resta esplicitamente richiesta.

## Remaining implementation slices

**REMAINING_IMPLEMENTATION_SLICES = 21**, derivato dagli elementi STILL_REQUIRED, non da 29 meno completed.

| Componente del conteggio | Numero | Criterio |
|---|---:|---|
| A. Originali ancora tecnicamente necessari | 17 | Ogni STILL_REQUIRED della roadmap originale |
| B. Gate soltanto operativi | 3 | Conteggiati separatamente, zero implementation |
| C. Slice assorbiti | 1 | MONETARY_FIELD_FEEDBACK → MONETARY_INPUT_BOUNDARY; non duplicato |
| D. Slice non più necessari | 0 | Nessun acceptance rimosso |
| E. Nuovi slice tecnici necessari | 4 | Ritiro autorità attive, Wizard accessibilità, CAS, cleanup/delete |
| Slice successivo già chiuso | 1 | POST_CLOSE_N_PLUS_1_NAVIGATION non è lavoro rimasto |

A + E = 17 + 4 = **21**. I tre source-only Auth attendono il gate operativo condiviso, non tre implementazioni aggiuntive. Il ritiro helper concorrenti non è automaticamente assorbito negli export già terminati.

I quattro slice nuovi necessari sono:
- **ACTIVE_LEGACY_ECONOMIC_AUTHORITY_RETIREMENT**: Chiudere ARCH-01 ACTIVE FundDetails/sections/fallback senza confondere dead code.
- **WIZARD_ECONOMIC_CONTROLS_ACCESSIBILITY**: Colmare ACCESS-02 fuori da Reports/Card; nomi/unità/errori per Wizard e ingressi economici.
- **ARCH_PERSIST_01_MULTIWRITER_CAS**: Inventario writer e contratto server version/CAS; progettazione e test concorrenza separati.
- **DELETE_CLEANUP_CONTRACT**: Cleanup autorizzato CLOSED/FK knowledge_documents e semantica errori/transaction.

Il debito timestamp/login non è contato come un fix indispensabile: richiede prima una decisione sul significato del campo e può essere documentato nel contratto Auth. Il codice latente può essere ritirato nello slice architetturale senza aggiungere una seconda unità. Il gate schema RGS potrebbe rivelare nuove necessità di implementazione, ma non si contano fix ipotetici prima del confronto.

**REMAINING_INDEPENDENT_REVIEWS_ESTIMATE = 25**: una per ciascuno dei 21 slice necessari + 3 verifiche indipendenti dei gate operativi + questa reconciliation. Le review già PASS non sono conteggiate di nuovo. È una stima di pianificazione a scope corrente: CAS o cleanup potrebbero richiedere più slice piccoli dopo la definizione del contratto; un gate operativo potrebbe essere accorpato nella stessa review. Non si contabilizza una review come implementation.

## Remaining operational gates

**REMAINING_OPERATIONAL_GATES = 3**:

1. **AUTH_PROFILE_ROLE_PENDING_GATE**: source bytes=payload bytes, target inequivocabile, PRE/inside/POST, rollback provato; eventuale apply richiede una sessione/autorizzazione distinta. Stato attuale APPLY_PENDING / LIVE_FIX_NOT_VERIFIED.
2. **AUTH_EDGE_DEPLOYMENT_AND_RUNTIME_VALIDATION**: deployment autorizzato e collaudo reale delle tre funzioni sul target e della fonte profiles installata; security source e suite già completate. Dipende dalla chiarificazione/chiusura del gate profile-role, senza inferire applicazione dalle migration locali.
3. **RGS_ANNUAL_SCHEMA_VERIFICATION**: confronto con contratto ufficiale annuale e review del mapping/prerequisiti; nessun SICO-ready fino a verifica positiva. Pura verifica prevista qui, non nuovo schema/fix ipotetico contato come implementation.

Nessuno di questi gate è stato eseguito. Tutti gli accessi live, l’apply e i deploy rimangono fuori dall’autorizzazione di questa reconciliation.


## Updated priority roadmap

P0/P1/P2/P3 sono priorità di pianificazione, non nuove severity dei finding. Si ordinano prima correzioni che possono rendere falso il numero/stato normativo, poi fonte autorizzativa/integrità dati/autorità parallele, infine workflow e accessibilità/UX. I gate Auth con rischio live sono P0 anche se non sono implementation.

| Priorità | Implementation rimaste | Gate operativi | Totale unità rimaste | Ordine / motivazione |
|---|---:|---:|---:|---|
| P0 | 4 | 2 | 6 | PNRR_ZERO_AND_MISSING_CAP; ART23_DIRIGENZA_DERIVED_CONSUMPTION; DL25_NET_GROSS_MARGIN; DL25_TEMPORAL_REGIME. In percorso operativo separato: AUTH_PROFILE_ROLE_PENDING_GATE, poi AUTH_EDGE_DEPLOYMENT_AND_RUNTIME_VALIDATION |
| P1 | 7 | 0 | 7 | EMPTY_FUND_INITIALIZATION; MONETARY_INPUT_BOUNDARY (con feedback); ACTIVE_LEGACY_ECONOMIC_AUTHORITY_RETIREMENT; CCNL_RECOVERY_INSTRUCTION; DL25_BASE_YEAR_LABELS; AUTH_ROLE_MIRROR_CONTRACT; ARCH_PERSIST_01_MULTIWRITER_CAS |
| P2 | 8 | 1 | 9 | WIZARD_SINGLE_TRANSFER_ACTION; NEW_ENTITY_DIALOG_KEYBOARD; REPORT_METADATA_ACCESSIBLE_NAMES; SINGLE_ACCORDION_TRIGGER; WIZARD_ECONOMIC_CONTROLS_ACCESSIBILITY; MOBILE_FUND_CONTEXT; RESOURCE_PROVENANCE_READ_MODEL; DELETE_CLEANUP_CONTRACT. Gate distinto: RGS_ANNUAL_SCHEMA_VERIFICATION |
| P3 | 2 | 0 | 2 | RSU_BUSINESS_LABELS; TABELLA15_OUTPUT_MODE, mantenendo qualificazione RGS/SICO |
| **TOTAL** | **21** | **3** | **24** | Review pura esclusa |

Prima di attestare documenti/chiusure come amministrativamente utilizzabili è necessario risolvere i difetti upstream pertinenti. I gate workflow chiusi non “certificano” dati demo, un cap mancante o una cache sbagliata. L’ordine storico Auth → report → calcoli non viene ripetuto automaticamente dopo che il sorgente Auth e gli export sono corretti.

Mobile/semantica tastiera hanno acceptance autonome; non si rinviano per mera estetica e non si assorbono in un generico polish. Il rischio cleanup è distinto dalla correttezza del diniego Auth già verificato.

## Next recommended slice

**NEXT_RECOMMENDED_SLICE = PNRR_ZERO_AND_MISSING_CAP**

Il controesempio cap0+100 e missing+100 produce attualmente **VALID, total=100, nessun errore PNRR**. Il problema può sovrastimare direttamente una risorsa negoziale senza capienza dimostrata e superare gli attuali gate Cabina/documenti/chiusura, perché essi leggono correttamente uno stato upstream errato.

Ha precedenza rispetto al net/gross DL25, che nel caso storico sottrae capacità anziché inventarla; rispetto alla cache Dirigenza, ugualmente prioritaria ma circoscritta al consumer con hasDirigenza; e rispetto ai default/boundary, che richiedono un contratto d’ingresso più ampio. I check server Auth sono già SOURCE_FIXED: i rischi profile/live richiedono un gate operativo P0 separato, non un altro rewrite degli endpoint.

Acceptance futura minima, non implementata: massimo zero noto con richiesta positiva non utilizzabile/INVALID; massimo missing UNDETERMINED; cap positivo e centesimi corretti; anni/requisiti secondo contratto congelato; stessi esiti per UI manuale, import, save/normalizer/core e readiness downstream. Nessuna nuova interpretazione dei requisiti originariamente UNCERTAIN.

Questa è l’unica raccomandazione di prossimo slice. **Fermarsi dopo la reconciliation: non iniziare il fix, non applicare migration Auth.**

## Scope integrity

PRE e POST confrontati su branch/HEAD, inventario dimensioni/SHA256, status, diff non staged e staged. Il manifest esteso include tutti i 1.129 file preesistenti del perimetro tracked/untracked e Markdown root ignorati; i report preesistenti non sono stati aggiornati. L’unica aggiunta ammessa nel confronto è ASTRA_25_FINDINGS_CURRENT_STATE_RECONCILIATION.md.

| Controllo | PRE | POST |
|---|---|---|
| Branch | ux/toolbox-area-fondo-prototype | Identico |
| HEAD | d3170f959b5815c514dbf3d6e5f93366a5f14c67 | Identico |
| File preesistenti inventariati | 1.129 | Tutti presenti, **0 mismatch byte/SHA256** |
| Nuovi file nel perimetro | 0 | Solo il presente report |
| Modifiche tracked | 24, preesistenti | Stesse 24, medesimo diff |
| Staged | Vuoto | Vuoto |
| Status | 443 righe | 444; rimossa la riga del report, identico al PRE |
| Golden/fixture/test/sorgenti/migration esistenti | Hash PRE | Byte-identici nel perimetro |
| Database, staging, produzione | Nessuna operazione autorizzata | Nessuna operazione/connessione |
| Git add/commit/push/PR/merge/deploy/reset/stash | Non eseguiti | Non eseguiti |

SHA256 manifest PRE esteso: **0EC085D42229EF375F630CF4D1F747E86512655237402A8A16233D7D8EC07E36**.

Il perimetro dell’inventario non comprende .git internals, dipendenze/build/cache ignorate o file segreti/env esclusi; non si presenta come hash di tutto il disco. Non è stato richiesto né effettuato alcun write su quei sorgenti/config/env. Le dipendenze installate sono usate come runtime di lettura; config/cache/output dei run finali stanno in TEMP. Manifest, clean-room e probe temporanei sono fuori repo e non sono nuovi artifact del progetto. Non sono stati cancellati untracked né modificati file per eliminare warning EOL.

~~~text
DATABASE_CHANGED = NO
MIGRATIONS_APPLIED = NO
STAGING_CONTACTED = NO
PRODUCTION_CONTACTED = NO
GIT_ADD = NO
COMMIT = NO
PUSH = NO
PR = NO
MERGE = NO
DEPLOY = NO
FILES_CHANGED_BY_RECONCILIATION = ASTRA_25_FINDINGS_CURRENT_STATE_RECONCILIATION.md
~~~

Il gate successivo è **ASTRA_25_FINDINGS_CURRENT_STATE_RECONCILIATION_INDEPENDENT_REVIEW**. La review dovrà controllare anche la deviazione tooling DNS bloccata, l’assenza di prove live attuali e il conteggio di unità roadmap rispetto ai 25 finding. Nessuna di queste limitazioni è un’autorizzazione per continuare con implementazione o ambienti remoti.


### Output terminale

~~~text
ASTRA_25_FINDINGS_CURRENT_STATE_RECONCILIATION = COMPLETE
RESULT = REQUIRES_REVIEW
BRANCH = ux/toolbox-area-fondo-prototype
HEAD = d3170f959b5815c514dbf3d6e5f93366a5f14c67

ORIGINAL_FINDINGS_TOTAL = 25
VERIFIED_FIXED = 9
PARTIALLY_FIXED = 8
OPEN = 8
NOT_VERIFIED = 0
ACCEPTED_LIMITATION = 0
OUT_OF_SCOPE = 0
STATUS_TOTAL = 25

BLOCKERS_OPEN = 0
HIGH_NOT_FIXED = 11
MEDIUM_NOT_FIXED = 5
VERIFIED_FIXED_IDS = SEC-01, DATA-02, CALC-01, CALC-02, DOC-01, DOC-02, NORM-01, FUNC-01, FUNC-02
PARTIALLY_FIXED_IDS = DATA-03, CALC-04, NORM-02, ARCH-01, ARCH-02, UX-01, UX-02, UX-03
OPEN_IDS = DATA-01, CALC-03, CALC-05, NORM-03, NORM-04, FUNC-03, ACCESS-01, ACCESS-02

FUNC_02_STATUS = VERIFIED_FIXED
DOC_02_STATUS = VERIFIED_FIXED
CALC_02_STATUS = VERIFIED_FIXED
NORM_01_STATUS = VERIFIED_FIXED

AUTH_ADMIN_01_SOURCE = SOURCE_FIXED
AUTH_ADMIN_02A_SOURCE = SOURCE_FIXED
AUTH_ADMIN_02B_SOURCE = SOURCE_FIXED
AUTH_ROLE_MIRROR = OPEN
AUTH_PROFILE_ROLE_MIGRATION = APPLY_PENDING / LIVE_FIX_NOT_VERIFIED
LIVE_SECURITY_STATUS = LIVE_NOT_VERIFIED

RGS_SCHEMA_STATUS = RGS_SCHEMA_UNVERIFIED
SICO_READINESS = FALSE
ARCH_PERSIST_01 = OPEN_HIGH_DEBT_OUT_OF_SCOPE

ORIGINAL_ROADMAP_SLICES = 29
CURRENT_ROADMAP_UNITS = 36
DONE_VERIFIED_SLICES = 8
DONE_SOURCE_ONLY_SLICES = 3
STILL_REQUIRED_SLICES = 21
MERGED_OR_NO_LONGER_REQUIRED_SLICES = 1

REMAINING_IMPLEMENTATION_SLICES = 21
REMAINING_OPERATIONAL_GATES = 3
REMAINING_INDEPENDENT_REVIEWS_ESTIMATE = 25

P0_REMAINING = 6 (4 implementation, 2 operational gates)
P1_REMAINING = 7 (7 implementation, 0 operational gates)
P2_REMAINING = 9 (8 implementation, 1 operational gates)
P3_REMAINING = 2 (2 implementation, 0 operational gates)

NEXT_RECOMMENDED_SLICE = PNRR_ZERO_AND_MISSING_CAP
NEXT_RECOMMENDED_REASON = Cap zero/missing +100 produce VALID senza errore: risorsa non dimostrata può superare gate downstream.

PRODUCT_NETWORK_ATTEMPTS = 0
TOOLING_NETWORK_ATTEMPTS = 1 (localhost DNS intercepted before invocation)
REAL_NETWORK_CONNECTION_ESTABLISHED = NO

FILES_CHANGED_BY_RECONCILIATION =
ASTRA_25_FINDINGS_CURRENT_STATE_RECONCILIATION.md

DATABASE_CHANGED = NO
MIGRATIONS_APPLIED = NO
STAGING_CONTACTED = NO
PRODUCTION_CONTACTED = NO

GIT_ADD = NO
COMMIT = NO
PUSH = NO
PR = NO
DEPLOY = NO

REPORT = ASTRA_25_FINDINGS_CURRENT_STATE_RECONCILIATION.md
NEXT_GATE_RECOMMENDATION = ASTRA_25_FINDINGS_CURRENT_STATE_RECONCILIATION_INDEPENDENT_REVIEW
~~~


</details>
