# PROVENANCE_METADATA_BOUNDARY — implementation report

Data: 07.10.2026. Target esclusivi: UX-01 e ARCH-02.

## 1. Executive result

**PROVENANCE_METADATA_BOUNDARY_IMPLEMENTATION = PASS.** Implementata una projection tipizzata, deterministica e consultabile nella route reale Verifica, con le 15 voci RSU originali, gli importi e gli stati canonici, le fonti, gli input, le competenze e i supporti registrati o mancanti. Owner, autore disponibile e ruolo corrente restano distinti. La provenance è un read model, senza calcolo economico autonomo, decisioni autorizzative o writeback.

Targeted 137/137, product 2074/2074 in 150 file, regression 8/8, oracle 14/14, TypeScript e diff check PASS. I 33 nuovi test portano il prodotto da 2041 a 2074. Nessuno skip nuovo o test prodotto escluso.

UX-01 e ARCH-02: **CANDIDATE_VERIFIED_FIXED**, in attesa della review separata. Baseline formale invariata VF18/PF4/OPEN3, 25 finding, blocker aperti 0. Nessuna independent review avviata.

## 2. Baseline

Authority letta direttamente: [ASTRA current state](ASTRA_25_FINDINGS_CURRENT_STATE_RECONCILIATION.md). Letti acceptance originali UX-01/ARCH-02 e le 15 risposte numerate in [audit RSU](ASTRA_RSU_AUDIT_REPORT.md), [roadmap](ASTRA_RESIDUAL_REMEDIATION_ROADMAP.md), [promozione NORM-02](NORM_02_FORMAL_PROMOTION_AND_RESIDUAL_ROADMAP_REPORT.md) e memoria corrente MEMORIA_AI.md.

Census corrente dalle 25 righe: VERIFIED_FIXED 18, PARTIALLY_FIXED 4, OPEN 3. UX-01 e ARCH-02 restano formalmente PARTIALLY_FIXED. Tutti questi artifact sono preservati rispetto allo SHA-256 PRE.

## 3. Preflight

Branch: ux/toolbox-area-fondo-prototype.
HEAD: d3170f959b5815c514dbf3d6e5f93366a5f14c67.
Eseguiti branch, HEAD, status completo e diff cached prima degli edit. Index vuoto. Working tree dirty intenzionale: 933 righe status, 103 file tracked già modificati.

[PRE](provenance_metadata_boundary_evidence/pre.json) registra branch, HEAD, status, index e SHA-256 di 1629 file, inclusi documenti root e evidence storiche. Il controllo dello slice usa quel filesystem PRE, non il diff complessivo contro HEAD. Nessun reset/restore/stash/clean/checkout/pull/merge/rebase.

## 4. Current authority map — CURRENT_AUTHORITY_MAP

La mappa [PRE](provenance_metadata_boundary_evidence/authority-map-pre.json) è stata scritta prima degli edit di prodotto. Il [census POST](provenance_metadata_boundary_evidence/authority-census-post.json) registra i caller e i confini finali.

| Concetto | Authority / source reale | Confine |
|---|---|---|
| Economia FAD | src/logic/calculation/canonicalFundLedger.ts; CanonicalFundResult; projectFadReport | Importi, stato, componenti e trattamento Art.23 copiati dal canonico |
| Permessi correnti | SupabaseUserRepository.getUserRole su public.profiles.role → fetchUserRoleWorkflow → SET_USER → authorizationPolicy | Nessun ruolo snapshot concede o revoca privilegi |
| Autorizzazione server | JWT verificato del caller + profiles nei tre Edge handler esistenti | Nessun cambiamento Auth, RLS, SQL o deploy |
| Owner | entity.user_id | Il repository snapshot salva quell’owner anche se agisce un Admin |
| Actor disponibile | transfer.userId non vuoto; metadata.closedBy per la chiusura | Non dedotto dall’owner o dall’utente che consulta |
| Ruolo persistito | AnnualSnapshot.role / user_app_state.role | Descrittivo e compatibility-only |
| Metadata derivati | CalculationResult.metadata.annoRiferimento, margine Art.23, annualità 0,22 qualificate | Non letti dalle cache persistite per decidere importi/permessi/readiness |
| Metadata descrittivi | updatedAt, transferredAt, closedAt/closedBy | Non attestano certificazione amministrativa |
| Rischio stale | transfer.year, computed.annualita022Considerate/capienza e vecchie cache del dominio | Ignorati come authority; le divergenze pertinenti sono segnalate |

Non è emerso un nuovo caller autorizzativo del ruolo snapshot né una nuova esigenza di migrazione/RLS/Auth. Il precedente debito operativo di hardening/deployment profiles non viene dichiarato applicato o verificato live da questo slice.

## 5. UX-01 acceptance map

| Acceptance originale | Implementazione / prova |
|---|---|
| Ricostruire le 15 risposte RSU | questions[0..14], source reference all’audit originale, details con dati reali; route compliance |
| Manuale / calcolato / facoltativo | mode distinto da source e determination status; parametric source tests |
| Missing / undetermined / invalid / zero | Stato canonico preservato; nessun total default a zero; route tests e unit test |
| Esclusione distinta da zero | inclusion dall’entry; amount e normativeRef preservati |
| Fonte, input, competenza, regola | semantic entry identity, input paths/valori, lineage, competence/origin/recognition year |
| Supporto presente / mancante | SupportStatus; riferimenti dichiarati e contenuto non verificato, nessuna certificazione inventata |
| Spiegazione non autoritativa | Nessun engine o FinancialMath nel nuovo modello; static census ed end-to-end real engine |

## 6. ARCH-02 acceptance map

| Acceptance originale | Implementazione / prova |
|---|---|
| Ruolo snapshot non autorizzativo | Census caller e role poisoning su reducer/policy reali |
| Ruolo corrente dall’authority esistente | Profile refresh reale con repository mock; SET_USER |
| Owner / actor / ruolo distinti | IdentityExplanation e Admin che salva ente di un altro owner |
| entity.user_id owner | Upsert riceve owner, non actor Admin; reload/hydration preservano owner |
| Anno e capienza coerenti | Read model usa anno del risultato e margine del controllo reale |
| Metadata derivati qualificati | considered022Years applicato a istruzioni già risolte del ledger; nessun recovery resolver |
| Stale non governa | Engine, compliance e document readiness identici con metadata avvelenati |
| Nessuna authority parallela | Read-only projection; persistence e server authorization invariati |

## 7. 15 RSU questions coverage

L’audit originale contiene **15 risposte numerate basate sul browser**, non una separata lista interrogativa. Conserviamo numero e oggetto di ciascuna. Le cifre storiche allora discordanti non diventano risposte economiche correnti. Il testo originale integrale è in [original items](provenance_metadata_boundary_evidence/rsu-original-items.json); la [matrice testabile](provenance_metadata_boundary_evidence/rsu-matrix.json) associa ogni voce al dato, al read model e alla UI.

| N. / oggetto originale | Dato corrente / canonical value | Provenance, stato e supporto | Entry UI/read model |
|---|---|---|---|
| 1 Fondo univoco | canonicalFund.total | Definitivo solo VALID; fonte delle voci e supporti espliciti | questions[0], data-rsu-question=1 |
| 2 Stabili | canonicalFund.stableTotal | Entry, input, competenza, fonte e stato invariati | questions[1], dettaglio voci |
| 3 Variabili | canonicalFund.variableTotal | Recovery distinto per competence year; nessun arretrato automatico | questions[2], dettaglio voci |
| 4 Soggetto complessivo | compliance.art23Compliance / art23c2 | Componenti dell’ente dal controllo condiviso, non sommate nella UI | questions[3].details |
| 5 Esclusioni | canonicalFund.art23Excluded / entries.art23Treatment | Importi esclusi, stato e riferimento normativo; escluso ≠ zero | questions[4].details |
| 6 Limite e adeguamento | controllo Art.23 + historicalData come input | Valore derivato; supporti storici non attestati da un numero | questions[5].details |
| 7 Conformità/margine | checks + margine reale | Check assente/incompleto non è conformità; nessuna certificazione automatica | questions[6].details |
| 8 Titoli esclusioni/Art60 | entry.normativeRef / economicEffect | Computo figurativo distinto dal Fondo; regola e voce consultabili | questions[7].details |
| 9 Mancanti/condizioni | missingPrerequisites, monetaryIssues, checks | Mancanze e criticità reali, non convertite in zero | questions[8].details |
| 10 Origine/certificazione | source e supporto per entry | Operatore ≠ certificazione; fonte non documentata esplicita | questions[9].details |
| 11 Formule/input | descrizione regola, input e lineage canonico | Spiegazione descrittiva; nessuna formula eseguita dal read model | questions[10].details |
| 12 Massimi/scelte | istruttorie facoltative PNRR/DL25/0,22 | Scelta e stato canonici, massimo non automaticamente spendibile | questions[11].details |
| 13 Competenze/prerequisiti | documentMetadata e distribuzione come input | CCDI, competenze e supporti non verificati dichiarati UNDETERMINED | questions[12].details |
| 14 Budget/disponibilità | resolveDistributionFundBudget sul canonico | Budget ≠ disponibilità negoziale; impieghi/personale/economie da verificare | questions[13].details |
| 15 Documenti/contestazioni | metadata, supporti e criticità già elencate | Atti storici, basi, certificazioni, requisiti e impieghi da richiedere se non documentati | questions[14].details |

Ogni voce offre dati riferibili oppure un’assenza esplicita. I supporti amministrativi non censiti non diventano “presenti” o “conformi”. Le domande non numeriche possono restare UNDETERMINED per la parte non documentata anche quando il dettaglio economico è consultabile.

## 8. Provenance domain model

Nuovo src/domain/provenance.ts: ResourceProvenance, RsuAnswer, DocumentSupport, IdentityExplanation, ProvenanceContext e ProvenanceReadModel. Campi readonly; projectProvenance pura.

Mode MANUAL/CALCULATED/FACULTATIVE/UNDETERMINED, determination VALID/MISSING/UNDETERMINED/INVALID e inclusion SUBJECT/EXCLUDED/FIGURATIVE/UNDETERMINED sono dimensioni indipendenti. La fonte canonica TRANSFERRED/RECOVERY/LEGACY_MIGRATED è preservata; un trasferimento privo di qualificazione non viene inventato come manuale. Le etichette recovery usano kind o semantic ID strutturato; un tipo assente non viene inventato come 0,22%. Gli ID senza descrizione restano nel dettaglio tecnico.

SupportStatus AVAILABLE significa riferimento registrato disponibile, con esplicita avvertenza “contenuto non verificato”; MISSING e UNDETERMINED non attestano documenti inesistenti. NOT_REQUIRED per movimento figurativo riguarda il supporto di un separato importo economico, non elimina l’istruttoria della voce Art.60.

## 9. Economic authority boundary

FundData → engine già esistente → canonicalFund → projectFadReport / projectProvenance → ProvenancePanel e reportPresenter.

Il nuovo percorso non importa il motore economico, non somma risorse raw, non esegue formule normative e non risolve autonomamente recovery. Amount, source, determination, competenza e trattamento sono quelli delle entry. Le formule scritte sono descrizioni. La UI riusa CalculationResult; nessuna cache economica persistita.

La prova end-to-end usa normalizeInput, engine, ledger, read model e presenter reali con MS2021=1.000.000 e current 0,14=1.400. L’entry e la projection coincidono. I writer moderni continuano a usare fadCanonical; non è stata riscritta alcuna pipeline documentale o policy readiness.

ECONOMIC_AUTHORITIES = 1 nel percorso FAD interessato.

## 10. Authorization boundary

Le due produzioni runtime LOAD_STATE_FROM_DB già riusavano state.currentUser, senza leggere snapshot.role. resolveRoleOnStateLoad poteva accettare un ruolo descrittivo come secondo argomento: ora preserva sempre il ruolo corrente, in entrambi i sensi del poisoning. La vecchia aspettativa di unit test che caricava ADMIN da metadata è stata corretta.

Nessuna nuova permission policy: canAccessAdminArea, scope owner/Admin e refresh da profiles restano le authority esistenti. Nessun Edge handler, repository Auth, RLS o SQL modificato. La modifica rende esplicito il confine di hydration richiesto da ARCH-02; non è remediation server-side.

## 11. Owner / actor / role boundary

Owner solo da entity.user_id. Actor di trasferimento o chiusura solo da identificatore/email realmente registrato. Autore di creazione/modifica/riapertura assente resta non disponibile; non è ricostruito retroattivamente.

Il test Admin che gestisce ente altrui salva owner=owner, role descrittivo=ADMIN, poi carica e idrata per il proprietario con ruolo corrente GUEST. La provenance distingue owner, actor Admin registrato e ruolo corrente del proprietario; Admin autore non diventa owner. Riaprire la consultazione di uno snapshot non è sbloccare tecnicamente un’annualità CLOSED: nessun nuovo workflow di riapertura viene introdotto.

## 12. Snapshot role caller census

| Path / symbol | Classificazione POST |
|---|---|
| src/domain/snapshot.ts / AnnualSnapshot.role | HISTORICAL_METADATA / COMPATIBILITY, commento esplicito |
| snapshotWorkflow load/save / row.role | COMPATIBILITY, non autorizzazione |
| AppContext LOAD_STATE_FROM_DB producers | Ruolo corrente da state.currentUser; snapshot role non usato |
| authorizationPolicy.resolveRoleOnStateLoad | Ignora ruolo descrittivo; current profile role |
| services/stateService.loadAppState | LATENT, nessun caller operativo/import dinamico individuato |
| UserManagementPage mirror user_app_state.role | COMPATIBILITY writer; profile è la source |
| SupabaseUserRepository.getUserRole | AUTHORIZATION da profiles |
| create-user/update-password/delete-user | Server JWT+profiles; nessuno snapshot role |

ACTIVE_AUTHORIZATION_CALLERS_OF_SNAPSHOT_ROLE = 0. I census statici sono complementari ai test su reducer/policy reali e al refresh del profilo; non sostituiscono i test di comportamento.

## 13. Derived metadata classification

| Dato | Ruolo |
|---|---|
| anno del risultato | DERIVED, dal calcolo corrente; non transfer.year |
| totale/stabile/variabile/esclusioni | AUTHORITATIVE canonici, solo referenziati |
| margine Art.23 | DERIVED da art23Compliance, non computed.capienza |
| annualita022Considerate | METADATA_ONLY derivato da anni di istruzioni canoniche qualificate |
| snapshot role | COMPATIBILITY_ONLY / descrittivo |
| autore e timestamp disponibili | DESCRIPTIVE, nessuna ownership/permission |
| documentMetadata | Dati amministrativi dichiarati; nessuna attestazione implicita |
| vecchie cache transfer/simulator/PNRR | Non promosse ad authority dalla nuova projection |

## 14. Stale metadata behavior

Test con transfer.year=1900, annualita022Considerate=99 e capienza arbitraria: engine canonicalFund e compliance identici al dataset pulito; document readiness identica. Il read model mostra anno 2026, annualità derivate e margine reale oppure null se non determinato. Elenca i tre metadata divergenti ignorati senza correggere/salvare lo snapshot.

Poisoning del ruolo non altera permissions, owner o ruolo corrente. UNDETERMINED/INVALID non diventano un totale legacy positivo o zero definitivo.

## 15. annualita022Considerate behavior

Riutilizzata considered022Years sulle istruzioni già risolte contenute nelle entry recovery canoniche. Non chiamato resolveCcnlRecoveries e non usata la cache computed.annualita022Considerate. Il conteggio resta descrittivo: non produce importi, recovery, permessi o readiness.

Test dedicati con 99 stale e risultati canonici invariati. Nessuna modifica al contratto NORM-02, ai resolver correnti o alle finestre recovery/carry.

## 16. CLOSED behavior

Panel senza mutation callback; consultation possibile anche CLOSED e senza risultato disponibile. Test conserva integralmente JSON del FundData, mostra solo autore registrato e stato/dati disponibili. Save reale bloccato SNAPSHOT_CLOSED prima dell’upsert (0 chiamate).

Nessun derived metadata writeback, correzione retroattiva, migration o riscrittura frozen. La chiusura applicativa non viene usata come prova ARAN CLOSED_AND_DEFINED.

## 17. Transfer behavior

Test con draft CCNL qualificato e applyWizard2026Transfer reale: due applicazioni producono identico canonicalFund. L’arricchimento di spiegazione non cambia FundData né aggiunge contributi o persistenza.

CLOSED, correlation e monetary boundary continuano a essere esercitati dalla suite prodotto esistente. Nessun edit di transfer, CTA, SummaryPanel o stato FUNC-03.

## 18. Save/reload

Pipeline reale saveAnnualSnapshot → loadAnnualSnapshot → hydrateFundData → normalizeInput → engine → projectProvenance. Repository mock, nessuna rete. Domande/read model semanticamente equivalenti, owner invariato, ruolo dalla sessione corrente. Il read model non viene salvato nello snapshot.

Provenance non dipendente da un necessario stato UI volatile: si deriva da risultato, dati caricati, ente e profilo corrente. Se una fonte/autore/supporto non è disponibile è esplicitamente assente.

## 19. Files modified

Delta rispetto al PRE: 6 production, 4 test, 0 config.

| Production file | Cambio |
|---|---|
| src/domain/provenance.ts (nuovo) | Typed explanation/read model |
| src/components/shared/ProvenancePanel.tsx (nuovo) | Consultazione RSU e dati di origine |
| src/pages/CompliancePage.tsx | Integrazione nella route reale Verifica, anche senza checks |
| src/presenters/reportPresenter.ts | Projection provenance; terzo argomento opzionale, caller precedenti compatibili |
| src/domain/snapshot.ts | Qualificazione del ruolo persistito come non autorizzativo |
| src/application/policies/authorizationPolicy.ts | Confine hydration: ruolo corrente sempre preservato |

Fuori produzione: questo report ed evidence pack minimale. Nessun aggiornamento di registry, MEMORIA_AI, roadmap, review o implementation report preesistenti.

## 20. Tests added/modified

- src/domain/__tests__/provenance.test.ts: 23 nuovi test, original 15-item coverage, stati/fonti, document support, normative/year, facultative, engine-to-presenter, stale real engine/readiness, DTO senza checks, static census.
- src/application/__tests__/provenanceBoundary.integration.test.ts: 6 nuovi test, role poisoning in entrambi i sensi, profile refresh, Admin/owner save-load-hydrate, CLOSED, transfer idempotente.
- src/pages/__tests__/provenance.integration.test.tsx: 4 nuovi test montando il componente del module registry reale compliance; importo 1.400, 15 voci, UNDETERMINED/INVALID/empty CLOSED, nessuna scrittura.
- src/application/__tests__/authorizationPolicy.test.ts: una aspettativa obsolete loaded-role aggiornata; file 27 test totali.
- documentKindReadiness.test.ts: invariato, 73 test rieseguiti tra i targeted.
- CompliancePage.navigation.test.tsx: invariato, 4 test rieseguiti, inclusa navigazione CLOSED con snapshot parziale.

## 21. Targeted test results

137/137 PASS, 6 file, exit 0. I 33 test nuovi sono tutti PASS; gli altri 104 coprono policy esistenti e document readiness/writer reali.

Durante l’implementazione tre nuovi workflow fixture richiedevano la decisione Art.33 esplicita: è stato corretto il setup dei nuovi test, senza cambiare policy/formule. Il primo full run ha rilevato tre DTO documentali senza checks: corretta la projection con assenza esplicita, mai default di conformità. Il test CLOSED esistente con snapshot parziale ha inoltre verificato annualData assente: anche questa assenza è gestita come dato non disponibile. Ultimi targeted e full run verdi sulla versione finale.

[JSON targeted](provenance_metadata_boundary_evidence/targeted.json), [gates](provenance_metadata_boundary_evidence/gates.json).

## 22. Product test result

2074/2074 PASS, 150 file prodotto, failed 0, pending/skipped 0, exit 0. Baseline 2041 + 33 nuovi test = 2074.

Usato config offline già consolidato art23_dirigenza_v2_evidence/offline.config.mjs, invariato. Escluso soltanto il generatore storico wave3HardeningEvidence.test.ts secondo policy esistente; nessun normale test prodotto escluso e nessun nuovo skip.

Full suite protegge i 18 VERIFIED_FIXED: SEC-01, DATA-01/02/03, CALC-01/02/03/04/05, DOC-01/02, NORM-01/02/03/04, ARCH-01, FUNC-01/02. Inclusi monetary boundary, PNRR, DL25, recovery, Art60, Dirigenza/whole-entity, empty initialization, Cabina, Distribution, closure, snapshots/Auth e modern PDF/XLS/document consistency.

[JSON product](provenance_metadata_boundary_evidence/product.json). Nessun claim su RLS/deployment remoto: sono regressioni locali/offline.

## 23. Regression result

8/8 PASS, exit 0. Runner locale scripts/run_regression_tests.ts, fixture e golden invariati. [Output](provenance_metadata_boundary_evidence/regression.txt).

## 24. Oracle result

14/14 PASS, exit 0. Runner locale scripts/run_wave2_oracle.ts, oracle invariato. [Output](provenance_metadata_boundary_evidence/oracle.txt).

## 25. TypeScript

PASS, exit 0: node node_modules/typescript/bin/tsc --noEmit, equivalente locale di npx tsc --noEmit senza registry. [Output](provenance_metadata_boundary_evidence/typescript.txt).

## 26. Diff check

git diff --check PASS, exit 0; index ancora vuoto. Gli avvisi Git LF→CRLF non sono errori whitespace. [Output](provenance_metadata_boundary_evidence/diff-check.txt). Nessun git add/commit/push/PR.

## 27. Golden/oracle integrity

SHA-256 PRE/POST: golden, oracle, regression fixture, historical evidence, config/package/lockfile e tutti gli altri artifact preesistenti non autorizzati invariati. Nessuna formula canonica, classificazione PNRR/DL25/Art60/recovery o monetary boundary modificata.

## 28. Scope integrity

[Scope](provenance_metadata_boundary_evidence/scope.json), [POST](provenance_metadata_boundary_evidence/post.json). Dei 1629 file PRE cambiano solo cinque file previsti: quattro production e un test; 1624 file preesistenti invariati, zero eliminati. Cinque nuovi file src (due production, tre test). Totale production 6, test 4, config 0. Authority ASTRA e MEMORIA_AI SHA-256 invariati, zero status transitions.

Nessuna nuova persistenza, colonna, migration, DB/RLS/Auth server change, live environment o deploy. Nessuna implementazione Slice B/C, modifica globale della navigazione, CTA, dialog o accordion. Le nuove details native e label non introducono controlli interattivi annidati; nessuna pretesa di chiusura ACCESS-01/02.

STRICT OFFLINE: guard esistente in NODE_OPTIONS per tooling/worker. Il log registra soltanto richieste di label localhost soddisfatte dal guard con 127.0.0.1, senza DNS/socket reali. Outbound tooling attempts 0, product network attempts 0, real network connections 0; il numero esatto delle label è nel scope JSON. Le esecuzioni esbuild richiedevano lettura degli antenati del workspace: escalation locale approvata, nessun accesso remoto.

## 29. Candidate status

UX_01_ACCEPTANCE = PASS; ARCH_02_ACCEPTANCE = PASS; RSU_QUESTION_COVERAGE = 15/15.
UX_01_IMPLEMENTATION_STATUS = CANDIDATE_VERIFIED_FIXED.
ARCH_02_IMPLEMENTATION_STATUS = CANDIDATE_VERIFIED_FIXED.

Formalmente UX-01/ARCH-02 restano PARTIALLY_FIXED; VF18/PF4/OPEN3, blockers 0. Nessun finding residuo fuori scope promosso o implementato. NEW_SECURITY_AUTH_CONCERN = NO; DATABASE_CHANGE_REQUIRED = NO; MIGRATION_REQUIRED = NO.

## 30. Next gate

**PROVENANCE_METADATA_BOUNDARY_INDEPENDENT_REVIEW**, una sola review mirata UX-01 + ARCH-02, da eseguire separatamente.

Implementation conclusa. Nessuna independent review avviata, nessun commit/push/PR/deploy, nessun successivo slice iniziato.
