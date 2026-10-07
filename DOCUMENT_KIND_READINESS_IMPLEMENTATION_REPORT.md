# DOCUMENT_KIND_READINESS — implementation report

## Baseline

Repository: dinopusceddu/entilocaliapp. Branch: ux/toolbox-area-fondo-prototype.
HEAD: d3170f959b5815c514dbf3d6e5f93366a5f14c67.
I cinque comandi PRE richiesti sono stati eseguiti prima di qualunque modifica.
Branch/HEAD coincidono; index vuoto, nessun checkout/fetch/reset/stash/add.

Inventario PRE: 1120 file, unione di tracked, untracked non ignorati e tutti i Markdown root (anche evidence/report ignorati).
Path → SHA256: C:\Users\PUSCED~1\AppData\Local\Temp\document-readiness-2e9ff14e05434eb4b0087bf19a5a20e9\pre-hashes.json.
SHA256 dell'inventario PRE: EA6945722A162C3E26F01C4923074DE8057F2D6A47CE4D7A33AD45701A37EDC8.
Output integrale PRE: C:\Users\PUSCED~1\AppData\Local\Temp\document-readiness-2e9ff14e05434eb4b0087bf19a5a20e9\baseline-pre.txt, riprodotto nell'appendice.
Output dei gate, network guard, inventario POST e artefatti storici reindirizzati sono nella stessa directory TEMP.

## Active document inventory

Censimento PRE dei pulsanti attivi di ReportsPage; tutti restano raggiungibili secondo preview/final readiness.

| Kind / classe | UI → service → writer | Fonte economica | Metadata/attestazioni | Preview/finale PRE e filename |
|---|---|---|---|---|
| DETERMINA / ADMINISTRATIVE_DOCUMENT | handleExportDefinitiveDeterminaPDF/TXT e preview → DocumentFactory → pdfDeterminaService / buildDeterminaV2 | createDocumentViewModel → projectFundDocument → CanonicalFundResult; legacy solo preview senza canonico | ente/anno; numero/data/responsabile come placeholder; Revisori e GC espliciti; clausola DI COSTITUIRE solo definitivo | PDF/TXT: Determina_Costituzione_Fondo_2026 oppure Determina_BOZZA_2026; TXT senza canonico: LEGACY_PREVIEW |
| RELAZIONE / ADMINISTRATIVE_DOCUMENT | handleExportDefinitiveRelazioneTecnica e preview → DocumentFactory → generateRelazioneTecnicaTXT | stessa projection economica canonica | ente/anno, generazione/versione, esito tecnico Art23; non legge numero/data determina, parere o adozione | Relazione_Tecnica_Fondo_2026.txt / Relazione_BOZZA_2026.txt; LEGACY_PREVIEW senza canonico |
| PROSPETTO / ADMINISTRATIVE_DOCUMENT | handleExportDefinitiveProspetto e preview → DocumentFactory → buildProspettoContrattazione | stessa projection canonica | ente/anno/data generazione, nessuna attestazione revisori/GC | Prospetto_Contrattazione_2026.txt / Prospetto_BOZZA_2026.txt; LEGACY_PREVIEW senza canonico |
| SUMMARY_PDF / FINANCIAL_REPORT | handleGenerateFullSummary → generateFullSummaryPDF → generateFondoPDF/buildFundSummaryPdf | ReportViewModel.fadCanonical per FAD; altri fondi separati, invariati | ente/anno, operatore/data; nessuna attestazione amministrativa di adozione/parere | Fondo_2026_Comune_Policy.pdf / Fondo_BOZZA_2026_Comune_Policy.pdf; PRE modalità economica automatica |
| FAD_XLS / FINANCIAL_REPORT | handleGenerateFADXLS → generateFADXLS → generateFondoDipendenteXLS/buildFondoDipendenteWorkbook | ReportViewModel.fadCanonical | ente/anno; nessuna attestazione amministrativa | Fondo_Dipendenti_Comune Policy_2026.xlsx / Fondo_Dipendenti_BOZZA_Comune Policy_2026.xlsx; PRE modalità economica automatica |
| TABELLA15 / SEPARATE_REGULATORY_EXPORT | quattro handler XLS/CSV preview/final → reportService → mapToTabella15 → tabella15XlsService | ledger canonico classificato con quadratura aritmetica | anno/ente/schema RGS non verificato; non attesta validazione ministeriale | Tabella15_ente_anno.csv/xlsx, gate aritmetico separato; mode filename distinto ancora pending |

ReportsPage non espone ulteriori fondi/documenti come export autonomi.
La pagina Tabella15 mostra una preview a schermo, non un ulteriore download bypass.

Censimento supplementare fuori dalla catena di definitive export del Fondo:
- ExcelTools → RequestDataLetterModal → letterRequestDataGenerator / requestDataLetterPdfService: richiesta dati Markdown/PDF, testo anteprima, nessuna attestazione di fondo costituito. Lifecycle preparatorio, non uno dei cinque documenti oggetto della policy approvata.
- CompensatoreDelegatoPage: CSV compensi del calcolatore distinto, non documento di costituzione FAD.
- ExcelTools/CsvImportModal: template CSV di importazione; non definitivo documentale.
Questi entrypoint non sono stati modificati né assoggettati a un fondo già costituito per poter richiedere/importare dati.

LATENT_OR_DEAD:
generateDeterminazioneTXT → legacy buildDetermina è ancora esportata da reportService, ma non ha caller produttivo UI corrente.
I vecchi servizi top-level pdfReportService.ts, pdfReportService2.ts, xlsReportService.ts non appartengono al grafo ReportsPage attivo.
Non sono stati migrati in questo slice.

## Current readiness graph

PRE: canonical status/total/missingPrerequisites → projectFundDocument.isDetermined →
isDefinitiveDocumentReady = isDetermined → exportReadiness DOCUMENT_FINAL_READY →
DocumentFactory assert condiviso → ReportsPage final buttons.
I report finanziari deducevano BOZZA esclusivamente dallo stato economico in fadCanonical.
Le criticità compliance normalizzate non partecipavano al gate documentale.

POST: CanonicalFundResult + resolveChecklist(complianceChecks, canonicalFund) + documentKind →
resolveDocumentKindReadiness → readiness motivata →
guard handler/factory/service → output mode → writer.
Il vecchio flag economico della projection rimane compatibile per i consumer già validati,
ma non è più sufficiente ad autorizzare un definitivo nei cinque entrypoint attivi.

## Document kind classification

Il tipo condiviso DocumentKind ha cinque valori, un solo catalogo di policy.
I tre amministrativi hanno lifecycle distinti: atto di costituzione, relazione tecnico-finanziaria,
prospetto per contrattazione. Gli ultimi due sono report finanziari e non attestazioni di adozione.
Tabella15 è esclusa dal tipo e dal resolver: gate regolamentare separato.

## Existing metadata semantics

La projection semantica esistente resta byte-identica.
Numero/data verbale non implicano parere favorevole. FAVORABLE/UNFAVORABLE con riferimenti
documentati rappresentano l'esito esplicito; UNKNOWN/OTHER non lo inventano.
DOCUMENTED_SENT è fatto esplicito, non conseguenza dell'assenza di verbale.
GC richiede DOCUMENTED_ADOPTED e riferimenti per l'affermazione di adozione;
soli numero/data non bastano. NOT_DOCUMENTED resta distinto.
firmaDigitale è una stringa identificativa nel template, non prova di firma crittografica.

## Policy ambiguity analysis

Prima di implementare sono state ricostruite due lacune: placeholder essenziali e pertinenza delle issue.
Non è stata inventata una policy universale revisori/GC: sono state chieste le decisioni business.

Decisioni esplicite dell'utente in questo slice:
1. «non sono dati essenziali. se non imputati possono essere prodotti atti con placeholder»
   in risposta a numero, data e identificazione del responsabile.
2. «Ogni BLOCKING blocca tutti e cinque; preview consentita».

DOCUMENT_POLICY_AMBIGUITY = NO dopo queste risposte.
Conseguenza: metadata opzionali mancanti, incluso esito sconosciuto, NON rendono da soli un documento DRAFT_ONLY.
L'acceptance generica “VALID + metadata insufficienti = DRAFT_ONLY” non autorizza a introdurre
nuovi obblighi in conflitto con questa decisione: nessun campo amministrativo essenziale è stato approvato.
Il caso VALID ma istruttoria non pronta è concretamente rappresentato da BLOCKING/prerequisiti normalizzati.
Un documento esportabile con placeholder non viene dichiarato firmato, protocollato o adottato dal sistema.

## Readiness resolver

src/domain/documentKindReadiness.ts:
resolveDocumentKindReadiness è puro e consuma stato/totale/prerequisiti canonici e issue normalizzate.
Non legge legacy summary, raw totals, testo UI, cache o formule normative.
Output: documentKind, FINAL_READY/DRAFT_ONLY/UNAVAILABLE, mode, reasons, primaryReason,
missingFields, blockingIssues, correctiveTarget.
missingFields è vuoto: nessun campo amministrativo essenziale è stato approvato.
compilableFields documenta i tre placeholder della sola Determina.

UNAVAILABLE è riservato all'assenza di una preview tecnicamente costruibile.
Missing canonical con CalculationResult disponibile permette una bozza; assenza di CalculationResult
non consente la costruzione e ReportsPage presenta l'empty state.

## Decision matrix by document kind

| Condizione | Determina | Relazione | Prospetto | PDF riepilogo | XLS FAD |
|---|---|---|---|---|---|
| VALID, total non-null, nessun blocker/prerequisito | FINAL_READY | FINAL_READY | FINAL_READY | FINAL_READY | FINAL_READY |
| Metadata opzionali assenti | come sopra; placeholder | come sopra | come sopra | come sopra | come sopra |
| VALID total esplicitamente 0 | FINAL_READY | FINAL_READY | FINAL_READY | FINAL_READY | FINAL_READY |
| UNDETERMINED / INVALID / canonical assente | DRAFT_ONLY | DRAFT_ONLY | DRAFT_ONLY | DRAFT_ONLY | DRAFT_ONLY |
| VALID + BLOCKING | DRAFT_ONLY | DRAFT_ONLY | DRAFT_ONLY | DRAFT_ONLY | DRAFT_ONLY |
| MISSING_PREREQUISITE | DRAFT_ONLY | DRAFT_ONLY | DRAFT_ONLY | DRAFT_ONLY | DRAFT_ONLY |
| WARNING only | non blocca | non blocca | non blocca | non blocca | non blocca |
| CLOSED | stesso gate, solo lettura | stesso | stesso | stesso | stesso |
| Preview non costruibile | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE |

## Determina policy

Stato canonico valido e determinato + nessuna issue impeditiva.
Numero/data/responsabile possono restare {{NUMERO_DETERMINA}}, {{DATA_DETERMINA}},
{{FIRMA_DIGITALE}}, per decisione esplicita.
Revisori/GC sono fatti opzionali rappresentati in modo neutrale quando assenti.
La BOZZA non contiene la clausola costitutiva DI COSTITUIRE.
La ragione di un BLOCKING su fondo VALID viene esposta senza cambiare lo stato numerico.

## Relazione policy

Documento tecnico-finanziario che supporta l'istruttoria, non attestazione che i Revisori
abbiano già espresso un parere. Nessun parere favorevole preesistente imposto.
Nessun numero/data atto o GC ereditato dalla Determina.
Definitivo soggetto a canonico e issue normalizzate; bozza conserva valori verificati e motivo.

## Prospetto policy

Prospetto per contrattazione, senza adozione GC/parere/firma come prerequisiti nuovi.
Nessuna ereditarietà artificiale della policy metadata Determina.
La policy issue approvata è comune, mentre il template e i metadata consumati restano specifici.

## Financial report policy

PDF riepilogo e XLS FAD ricevono il mode già risolto dal service.
La modifica ai writer è limitata alla rappresentazione di BOZZA, motivazione e filename.
Signed amounts, righe, subtotali, authoritativeTotal e altri fondi non sono ricalcolati né cambiati.
VALID + BLOCKING conserva un totale economico canonico determinato, ma documento BOZZA.
UNDETERMINED/INVALID mantiene authoritativeTotal null/NON DETERMINATO;
un subtotale non diventa definitivo.
I builder conservano il precedente comportamento economico di sicurezza per compatibilità,
senza introdurre regole amministrative proprie.

## Tabella15 / RGS exclusion

Mapper, writer e loro gate byte-identici al PRE.
isSicoExportReady resta false, RGS_SCHEMA_UNVERIFIED invariato.
TABELLA15_OUTPUT_MODE_PENDING: modalità BOZZA/definitivo e filename della riconciliazione
restano nello slice separato richiesto. FINAL_READY dei cinque documenti non significa SICO_READY.

## Preview vs final

Le preview restano disponibili anche in presenza di blocker o canonical mancante quando costruibili.
Mode omesso nei boundary attivi viene risolto dalla policy, non promuove implicitamente un BLOCKING.
Mode esplicito DEFINITIVE_EXPORT deve superare il guard prima di qualunque writer/download.
Filename e intestazioni BOZZA rispettano la qualificazione risolta.
Gli optional placeholder autorizzati rimangono anche in export finale; nessuna neutralizzazione
dei fatti espliciti viene convertita in attestazione inventata.

## Blocking / warning

resolveChecklist è riusato senza duplicare condizioni normative:
gravita error → BLOCKING, warning → WARNING; prerequisiti canonici restano distinti.
Ogni BLOCKING è pertinente ai cinque documenti per la decisione business sopra riportata.
Ordine delle issue preservato; primo motivo e target deterministici, nessun parsing dei messaggi.
Il resolver non ordina/muta gli input (test frozen).

## Metadata inference red-team

Test combinatori: assente, number-only, date-only, number+date UNKNOWN, FAVORABLE,
UNFAVORABLE, DOCUMENTED_SENT, NOT_DOCUMENTED; GC number-only/date-only,
number+date senza adozione, DOCUMENTED_ADOPTED, NOT_DOCUMENTED.
Readiness non inferisce outcome/adozione e non li usa come prerequisiti universali.
La projection esistente decide quali affermazioni sono supportate, senza modificarne la semantica.
UNFAVORABLE è rappresentato come tale, non riscritto in favorevole.

## Real document inspection

Test node con writer reali: solo saveAs e jsPDF.save intercettati al boundary download.
Quattro scenari, ciascuno con Determina PDF/TXT, Relazione TXT, Prospetto TXT,
riepilogo PDF e workbook XLSX:
- FINAL_READY con metadata opzionali forniti;
- FINAL_READY con placeholder autorizzati;
- UNDETERMINED;
- VALID + BLOCKING.
Non è stato simulato un DRAFT_ONLY causato dai tre campi opzionali: contraddirebbe la policy utente.

File reali in TEMP/document-kind-inspection-*; PDF ricaricati da disco con pdfjs-dist,
testo estratto senza OCR e salvato .pdf.txt; XLSX ricaricati con ExcelJS.
Manifest: nella directory del gate, real-file-manifest.json. Campioni sul delta finale:
- VALID + BLOCKING: TEMP/document-kind-inspection-DfFfSV.
- UNDETERMINED: TEMP/document-kind-inspection-pnfvWU.
- FINAL_READY con placeholder: TEMP/document-kind-inspection-onULcH.
- FINAL_READY con metadata: TEMP/document-kind-inspection-GgVQBH.
Sono 24 export reali e 8 file di testo estratto. Relazione e Prospetto VALID + BLOCKING
espongono il totale economico canonico come dato del documento non definitivo, senza
descriverlo falsamente come economicamente non determinabile. Le bozze della Determina
richiamano le verifiche da completare, evitando affermazioni di rispetto dei vincoli
quando il gate segnala una criticità impeditiva.
Verificati filename, banner BOZZA, motivo BLOCKING, placeholder, assenza di parere favorevole
inventato, clausola costitutiva assente nelle bozze, foglio/merge/formule senza somme alternative.
Nessuna fixture remota, nessun download remoto.

## ReportsPage integration

Ogni kind in scope espone disponibilità preview, definitivo e motivo del rifiuto.
Preview aggiunta anche per Relazione/Prospetto quando il definitivo è disponibile.
Financial reports hanno preview esplicita e pulsante definitivo soggetto al gate;
il download automatico precedente resta compatibile e viene qualificato dalla policy.
I controlli compliance effettivi vengono passati alla factory e ai due wrapper finanziari.
La UI non inferisce readiness da stringhe amministrative.

## Forced handler guard

Test della pagina reale, mantenendo il componente Button e catturando gli handler:
invocazioni programmatiche di definitive export con UNDETERMINED/INVALID/missing/BLOCKING
→ zero service definitivo e zero download.
Guard anche nel DocumentFactory e nei financial report services:
quattro export moderni e due financial wrappers rifiutano prima del writer.
Generazioni generiche factory con mode omesso e blocker producono BOZZA, non definitivo.

## CLOSED behavior

Nessuna mutazione per generare documenti. Metadati CLOSED restano consultabili, non editabili.
Preview e final read-only rispettano la stessa policy; nessuna riapertura.
Nessun cambio a switchYearAtomic, yearClosureWorkflow, RPC o navigazione N+1.

## Tests

RESULT = PASS. DOCUMENT_KIND_READINESS = CLOSED_LOCALLY (review indipendente ancora richiesta).

| Gate sul delta finale | Risultato |
|---|---:|
| Nuovi test policy/factory/service/metadata/file reali | 73/73 PASS |
| Nuova ReportsPage integration, inclusi handler forzati | 8/8 PASS |
| Totale dedicati | 81/81 PASS |
| Full Vitest offline, 125 file | 1588/1588 PASS |
| Wave3 consistency / systemic / UI wiring / hardening / independent | 34 + 21 + 19 + 7 + 6 = 87/87 PASS |
| FAD read model | 17/17 PASS |
| Canonical XLS FAD / summary PDF | 16/16 + 17/17 PASS |
| Canonical ledger contract | 13/13 PASS |
| Closure readiness pura/integration | 17/17 + 21/21 PASS |
| Year closure / carry calculations | 5/5 + 3/3 PASS |
| CLOSED: snapshot, AppContext, ReportsPage, Distribution | 10 + 35 + 2 + 1 = 48/48 PASS |
| Cabina resolver/checklist/status/page | 26 + 4 + 20 + 16 + 45 = 111/111 PASS |
| Distribution canonical/draft resolver + page + CLOSED | 14 + 23 + 7 + 19 + 1 = 64/64 PASS |
| Fondo Personale page | 6/6 PASS |
| Auth create/password/delete | 19 + 34 + 42 = 95/95 PASS |
| Security migrations / RLS simulation | 27/27 + 13/13 PASS |
| Regression script | 8/8 PASS |
| Wave2 oracle | 14/14 PASS |
| npx tsc --noEmit | PASS |
| git diff --check | PASS |

Tutti i gruppi sopra sono inclusi nell'esecuzione completa finale, non risultati storici.
JSON: targeted.json e full.json nella directory del gate; script: regression.txt e oracle.txt.
La suite completa è passata sia prima sia dopo l'ultima correzione puramente testuale.
Prima esecuzione mirata: 80/81; un'asserzione del nuovo test pretendeva “100” nel PDF
della Determina UNDETERMINED, che correttamente espone subtotale verificato 0.
Corretta esclusivamente l'asserzione del test; successiva esecuzione: 81/81 PASS.
TypeScript: PASS dopo correzione type-only del cast dello spy jsPDF.save nei nuovi test.
Regression: 8/8 PASS. Wave2 oracle: 14/14 PASS.
Test storici/golden non modificati.

Network gate: NODE_OPTIONS carica offline-guard.cjs, bloccando http/https, net/tls,
DNS e fetch, con logging distinto TOOLING / PRODUCT_OR_TEST. npm offline/update notifier disattivato;
URL Supabase example.invalid e wizard remote drafts disabilitati. Esbuild ha richiesto
rerun locale fuori sandbox per Access denied al config: nessun errore di rete né installazione.
Gli artefatti storici Wave3 vengono reindirizzati in TEMP per proteggere gli evidence pack.
PRODUCT_NETWORK_ATTEMPTS = 0; TOOLING_NETWORK_ATTEMPTS = 0; REAL_NETWORK_CONNECTION_ESTABLISHED = NO.
Nessun file network-attempts.jsonl è stato prodotto, quindi nessun boundary di rete intercettato.

## Scope integrity

Otto file preesistenti modificati:
- src/pages/ReportsPage.tsx: disponibilità per tipo, motivazioni e guarded handlers.
- src/services/documents/documentFactory.ts: policy per tipo e output mode centralizzato.
- src/services/reportService.ts: propagazione compliance e guard/mode per PDF/XLS FAD.
- src/services/documents/pdfReportService.ts: solo mode/motivo/filename, economics invariata.
- src/services/documents/xlsReportService.ts: solo mode/motivo/filename, economics invariata.
- src/services/documents/pdfDeterminaService.ts: render motivo bozza.
- src/services/templates/determinaTemplateV2.ts: render motivo e formula istruttoria coerente.
- src/services/templates/relazioneTecnicaTemplate.ts: render motivo bozza.

Nuovi:
- src/domain/documentKindReadiness.ts (policy/resolver puro).
- src/services/__tests__/documentKindReadiness.test.ts.
- src/pages/__tests__/ReportsPage.documentReadiness.test.tsx.
- src/services/__tests__/documentReadinessFixture.ts (fixture condivisa dei soli nuovi test).
- DOCUMENT_KIND_READINESS_IMPLEMENTATION_REPORT.md.

documentProjection, FadReportReadModel, reportPresenter, ledger, fundEngine, Cabina,
Distribution, closure workflow, Auth, migrazioni, Tabella15 e report/evidence preesistenti
restano byte-identici al PRE.
Nessun file preesistente eliminato. Nessun index change.
Confronto finale: PRE 1120, POST 1125, 1112 byte-identici, 8 modificati autorizzati,
5 aggiunti (resolver, due test, fixture e report), 0 cancellati. Staged ancora vuoto.
Hash branch/HEAD invariati. integrity.json e post-hashes.json documentano il confronto.

Esempi SHA256 identici PRE/POST:
- documentProjection: 44F29B081F0B888F8D5E6CAB790BC048555280B72E80CF75C6506F39033C34D3.
- reportPresenter: A44E86E497219C9AB2DB6A61C23B64CA79996D0CAEB7C27C89798AD8CB622BA0.
- canonicalFundLedger: 44E7E20D8D2F062FE3688AF841AD4BCB2B225093C97B3880BC7FFE3D83D639EB.
- fundEngine: 6AC723E7343E1AC6A448464AD761488E6DCB9D7F6491AB2729F8316FD9A83C27.
- yearClosureWorkflow: 71C052F4CC3C95D97EC81BAC5E9E6C011F1C0AB0753BCD7057B8E40A84CCC91B.
- migration Auth pending: 8670E439CD6FA8AE969652445637168491AFD3388DE710CE2AE9E2752EF2614D.
L'inventario completo prova anche l'identità degli endpoint/test Auth, dei resolver Cabina/
Distribution, di tutte le migration e di tutti i report/evidence preesistenti non in scope.

## Closed-slice regressions

Gate consolidati verificati nella suite completa di questo slice, senza modificare i contratti.
DATA-02, CALC-02 e NORM-01 restano VERIFIED_FIXED; severità originali non riclassificate.
Cabina BLOCKING, Distribution explicit draft e closure readiness protetti.
ASTRA_BLOCKERS_OPEN = 0.

## Finding reassessment

DOCUMENT_KIND_READINESS = CLOSED_LOCALLY / PASS.
DOC-02 = CANDIDATE_VERIFIED_FIXED per i cinque entrypoint attivi;
nessuna proclamazione VERIFIED_FIXED automatica.
FUNC-02 resta PARTIALLY_FIXED: POST_CLOSE_N_PLUS_1_NAVIGATION è
CONFIRMED_NON_DESTRUCTIVE_WORKFLOW_BUG e non è stato corretto.
NORM-02 resta PARTIALLY_FIXED, CCNL_RECOVERY_INSTRUCTION non implementato.
ARCH-01 resta PARTIALLY_FIXED: flag/helper/projection legacy compatibili e caller latenti
non sono ritirati in questo slice.
Severità originali invariate: DOC-02 HIGH, FUNC-02 HIGH, NORM-02 HIGH, ARCH-01 HIGH.

## Residual FUNC-02 / DOC-02

ACTIVE_FINAL_EXPORT_BYPASSES = 0 nei cinque documenti in scope.
Tabella15 output mode e readiness RGS/SICO hanno gate separati; nessuna estensione implicita.
Placeholder consentiti non equivalgono ad atto adottato, firmato/protocollato o trasmesso.
POST_CLOSE_N_PLUS_1_NAVIGATION, CCNL_RECOVERY_INSTRUCTION e altri finding restano separati.

## Next gate

DOCUMENT_KIND_READINESS_INDEPENDENT_REVIEW.
Nessun git add/commit/push/PR/deploy, nessun DB o migration, nessun contatto staging/production.

## Appendice — working-tree PRE integrale

```text
 M src/__tests__/securityMigrations.test.ts
 M src/contexts/AppContext.tsx
 M src/domain/documentProjection.ts
 M src/features/wizard2026/__tests__/wizard2026RemoteDraftSync.test.ts
 M src/logic/cabina/__tests__/resolveCabinaViewModel.test.ts
 M src/logic/cabina/__tests__/resolveOperationalStatus.test.ts
 M src/logic/cabina/resolveCabinaViewModel.ts
 M src/logic/cabina/resolveOperationalStatus.ts
 M src/pages/DistribuzioneRisorsePage.tsx
 M src/pages/EntityYearManagementPage.tsx
 M src/pages/__tests__/CabinaDiRegiaPage.wave41.integration.test.tsx
 M src/pages/__tests__/DistribuzioneRisorsePage.closed.test.tsx
 M src/presenters/reportPresenter.ts
 M src/services/documents/pdfReportService.ts
 M src/services/documents/xlsReportService.ts
 M supabase/functions/create-user/index.ts
 M supabase/functions/delete-user/index.ts
 M supabase/functions/update-password/index.ts
?? .gitnexus/lbug
?? .gitnexus/lbug.wal
?? ASTRA_FINAL_FINDINGS_RECONCILIATION.md
?? ASTRA_FINAL_RECONCILIATION_INDEPENDENT_REVIEW.md
?? ASTRA_NORMATIVE_MATRIX.md
?? ASTRA_TEST_MATRIX.md
?? AUTH_ADMIN_01_INDEPENDENT_REVIEW.md
?? AUTH_ADMIN_02A_INDEPENDENT_REVIEW.md
?? AUTH_ADMIN_02B_INDEPENDENT_REVIEW.md
?? CABINA_BLOCKING_ISSUE_PRIORITY_INDEPENDENT_REVIEW.md
?? CALC02_FINAL_INDEPENDENT_CLOSURE_REVIEW.md
?? CANONICAL_FAD_XLSX_INDEPENDENT_REVIEW.md
?? CANONICAL_FUND_SUMMARY_PDF_INDEPENDENT_REVIEW.md
?? CLOSURE_INSTRUCTION_READINESS_INDEPENDENT_REVIEW.md
?? DISTRIBUTION_EXPLICIT_DRAFT_INDEPENDENT_REVIEW.md
?? astra_evidence/PREFLIGHT.md
?? astra_evidence/run_20260921/CLEANUP.json
?? astra_evidence/run_20260921/FINAL_VERIFICATION.json
?? astra_evidence/run_20260921/FINDINGS.json
?? astra_evidence/run_20260921/INDEX.md
?? astra_evidence/run_20260921/MANIFEST.json
?? astra_evidence/run_20260921/P01_empty_fund.png
?? astra_evidence/run_20260921/P01_empty_fund.txt
?? astra_evidence/run_20260921/P02_wizard_2025.txt
?? astra_evidence/run_20260921/P03_art23_manual.txt
?? astra_evidence/run_20260921/P04_dl25_empty.txt
?? astra_evidence/run_20260921/P04_dl25_negative.txt
?? astra_evidence/run_20260921/P05_ccnl_2025.txt
?? astra_evidence/run_20260921/P06_art60_2025.txt
?? astra_evidence/run_20260921/P07_straordinario.txt
?? astra_evidence/run_20260921/P08_pnrr_notapplicable.txt
?? astra_evidence/run_20260921/P09_summary.txt
?? astra_evidence/run_20260921/P10_transfer.txt
?? astra_evidence/run_20260921/P11_stable.txt
?? astra_evidence/run_20260921/P12_negative_constitution.txt
?? astra_evidence/run_20260921/P13_verification.txt
?? astra_evidence/run_20260921/P14_distribution.txt
?? astra_evidence/run_20260921/P15_resumed_dashboard.txt
?? astra_evidence/run_20260921/P16_documents.txt
?? astra_evidence/run_20260921/P17_table15.txt
?? astra_evidence/run_20260921/P18_catalog_year_mismatch.txt
?? astra_evidence/run_20260921/P19_entityB.txt
?? astra_evidence/run_20260921/P20_admin_miei.txt
?? astra_evidence/run_20260921/P21_admin_altri.txt
?? astra_evidence/run_20260921/P22_A2026_defaults.txt
?? astra_evidence/run_20260921/P23_admin_created_2027.txt
?? astra_evidence/run_20260921/P24_owner_sees_admin_year.txt
?? astra_evidence/run_20260921/P25_owner_admin_edit.txt
?? astra_evidence/run_20260921/P26_owner_admin_edit_verified.txt
?? astra_evidence/run_20260921/P27_userC_no_entities.txt
?? astra_evidence/run_20260921/P28_modal_keyboard.json
?? astra_evidence/run_20260921/P29_closed_dashboard.txt
?? astra_evidence/run_20260921/P30_closed_edit.txt
?? astra_evidence/run_20260921/PASS1_BLACKBOX.md
?? astra_evidence/run_20260921/PASS2_RULES.md
?? astra_evidence/run_20260921/PASS3_EXPECTED_FROZEN.json
?? astra_evidence/run_20260921/PASS5_ORACLE_COMPARISON.json
?? astra_evidence/run_20260921/R1024.png
?? astra_evidence/run_20260921/R1366.png
?? astra_evidence/run_20260921/R1440.png
?? astra_evidence/run_20260921/R360.png
?? astra_evidence/run_20260921/R360_drawer.png
?? astra_evidence/run_20260921/R390.png
?? astra_evidence/run_20260921/R430.png
?? astra_evidence/run_20260921/R768.png
?? astra_evidence/run_20260921/STAGING_SECURITY.json
?? astra_evidence/run_20260921/STAGING_WORKFLOW_EXPORT.json
?? astra_evidence/run_20260921/SUPPLEMENT_PROBES.json
?? astra_evidence/run_20260921/capture_download.ts
?? astra_evidence/run_20260921/cleanup.mjs
?? astra_evidence/run_20260921/compare_oracle.cjs
?? astra_evidence/run_20260921/compare_oracle.ts
?? astra_evidence/run_20260921/exports/Determina_Costituzione_Fondo_2025.pdf
?? astra_evidence/run_20260921/exports/Determina_Costituzione_Fondo_2025.txt
?? astra_evidence/run_20260921/exports/PDF_EXTRACT.txt
?? astra_evidence/run_20260921/exports/PDF_page-1.png
?? astra_evidence/run_20260921/exports/PDF_page-2.png
?? astra_evidence/run_20260921/exports/Prospetto_Contrattazione_2025.txt
?? astra_evidence/run_20260921/exports/Relazione_Tecnica_Fondo_2025.txt
?? astra_evidence/run_20260921/exports/Tabella15_Ente_2025.csv
?? astra_evidence/run_20260921/exports/Tabella15_Ente_2025.xlsx
?? astra_evidence/run_20260921/exports/XLSX_EXTRACT.txt
?? astra_evidence/run_20260921/final_verify.py
?? astra_evidence/run_20260921/independent_oracle.py
?? astra_evidence/run_20260921/jspdf_adapter.ts
?? astra_evidence/run_20260921/previous_reports/ASTRA_NORMATIVE_MATRIX.md
?? astra_evidence/run_20260921/previous_reports/ASTRA_TEST_MATRIX.md
?? astra_evidence/run_20260921/sources/CCNL2026.pdf
?? astra_evidence/run_20260921/sources/CCNL2026.txt
?? astra_evidence/run_20260921/sources/DL144art2.html
?? astra_evidence/run_20260921/sources/RGS175706.pdf
?? astra_evidence/run_20260921/sources/RGS175706.txt
?? astra_evidence/run_20260921/staging_probe.mjs
?? astra_evidence/run_20260921/staging_workflow.cjs
?? astra_evidence/run_20260921/staging_workflow.ts
?? astra_evidence/run_20260921/supplement_probes.cjs
?? astra_evidence/run_20260921/supplement_probes.ts
?? astra_evidence/run_20260921/write_matrices.py
?? astra_evidence/run_20260921/write_reports.py
?? audit_wave3_final_gate/consistency_verification.json
?? audit_wave3_final_gate/files/A_VALID_277_44__Determina_Costituzione_Fondo_2026.pdf
?? audit_wave3_final_gate/files/A_VALID_277_44__Determina_Costituzione_Fondo_2026.txt
?? audit_wave3_final_gate/files/A_VALID_277_44__Prospetto_Contrattazione_2026.txt
?? audit_wave3_final_gate/files/A_VALID_277_44__Relazione_Tecnica_Fondo_2026.txt
?? audit_wave3_final_gate/files/A_VALID_277_44__Tabella15_GATE_A_VALID_2026.csv
?? audit_wave3_final_gate/files/A_VALID_277_44__Tabella15_GATE_A_VALID_2026.xlsx
?? audit_wave3_final_gate/files/B_UNDETERMINED_NUMERIC_TOTAL__Determina_BOZZA_2026.txt
?? audit_wave3_final_gate/files/B_UNDETERMINED_NUMERIC_TOTAL__Determina_Costituzione_Fondo_2026.pdf
?? audit_wave3_final_gate/files/B_UNDETERMINED_NUMERIC_TOTAL__Prospetto_BOZZA_2026.txt
?? audit_wave3_final_gate/files/B_UNDETERMINED_NUMERIC_TOTAL__Relazione_BOZZA_2026.txt
?? audit_wave3_final_gate/files/B_UNDETERMINED_NUMERIC_TOTAL__Tabella15_GATE_B_UNDETERMINED_NUMERIC_2026.csv
?? audit_wave3_final_gate/files/B_UNDETERMINED_NUMERIC_TOTAL__Tabella15_GATE_B_UNDETERMINED_NUMERIC_2026.xlsx
?? audit_wave3_final_gate/files/C_CANONICAL_FUND_MISSING__Determina_Costituzione_Fondo_2026.pdf
?? audit_wave3_final_gate/files/C_CANONICAL_FUND_MISSING__Determina_LEGACY_PREVIEW_2026.txt
?? audit_wave3_final_gate/files/C_CANONICAL_FUND_MISSING__Prospetto_LEGACY_PREVIEW_2026.txt
?? audit_wave3_final_gate/files/C_CANONICAL_FUND_MISSING__Relazione_LEGACY_PREVIEW_2026.txt
?? audit_wave3_final_gate/files/C_CANONICAL_FUND_MISSING__Tabella15_GATE_C_NO_CANONICAL_2026.csv
?? audit_wave3_final_gate/files/C_CANONICAL_FUND_MISSING__Tabella15_GATE_C_NO_CANONICAL_2026.xlsx
?? audit_wave3_final_gate/files/D_MULTI_ENTRY_ROUNDING_89_99__Determina_Costituzione_Fondo_2026.pdf
?? audit_wave3_final_gate/files/D_MULTI_ENTRY_ROUNDING_89_99__Determina_Costituzione_Fondo_2026.txt
?? audit_wave3_final_gate/files/D_MULTI_ENTRY_ROUNDING_89_99__Prospetto_Contrattazione_2026.txt
?? audit_wave3_final_gate/files/D_MULTI_ENTRY_ROUNDING_89_99__Relazione_Tecnica_Fondo_2026.txt
?? audit_wave3_final_gate/files/D_MULTI_ENTRY_ROUNDING_89_99__Tabella15_GATE_D_ROUNDING_2026.csv
?? audit_wave3_final_gate/files/D_MULTI_ENTRY_ROUNDING_89_99__Tabella15_GATE_D_ROUNDING_2026.xlsx
?? audit_wave3_final_gate/files/E_RGS_UNMAPPED_THREE_COMPONENTS__Tabella15_GATE_E_UNMAPPED_2026.csv
?? audit_wave3_final_gate/files/E_RGS_UNMAPPED_THREE_COMPONENTS__Tabella15_GATE_E_UNMAPPED_2026.xlsx
?? audit_wave3_final_gate/files/F1_UNKNOWN_WITH_EXTREMES__Determina_Costituzione_Fondo_2026.pdf
?? audit_wave3_final_gate/files/F2_FAVORABLE__Determina_Costituzione_Fondo_2026.pdf
?? audit_wave3_final_gate/files/F3_UNFAVORABLE__Determina_Costituzione_Fondo_2026.pdf
?? audit_wave3_final_gate/files/F4_TRANSMITTED__Determina_Costituzione_Fondo_2026.pdf
?? audit_wave3_final_gate/files/F5_NOT_DOCUMENTED__Determina_Costituzione_Fondo_2026.pdf
?? audit_wave3_final_gate/files/G1_ADOPTION_NOT_DOCUMENTED__Determina_Costituzione_Fondo_2026.pdf
?? audit_wave3_final_gate/files/G2_ADOPTION_DOCUMENTED__Determina_Costituzione_Fondo_2026.pdf
?? audit_wave3_final_gate/final_gate.audit.ts
?? audit_wave3_final_gate/manifest.json
?? audit_wave3_final_gate/verify_report_consistency.mjs
?? audit_wave3_final_gate/vitest.audit.config.ts
?? audit_wave3_final_independent/evidence/att001_absent_unknown_documented_sent.pdf
?? audit_wave3_final_independent/evidence/att001_absent_unknown_not_documented.pdf
?? audit_wave3_final_independent/evidence/att001_extremes_favorable_not_documented.pdf
?? audit_wave3_final_independent/evidence/att001_extremes_unfavorable_not_documented.pdf
?? audit_wave3_final_independent/evidence/att001_extremes_unknown_not_documented.pdf
?? audit_wave3_final_independent/evidence/att002_absent.pdf
?? audit_wave3_final_independent/evidence/att002_adopted_complete.pdf
?? audit_wave3_final_independent/evidence/att002_adopted_incomplete.pdf
?? audit_wave3_final_independent/evidence/att002_date_only.pdf
?? audit_wave3_final_independent/evidence/att002_extremes_no_status.pdf
?? audit_wave3_final_independent/evidence/att002_number_only.pdf
?? audit_wave3_final_independent/evidence/att002_placeholder.pdf
?? audit_wave3_final_independent/evidence/doc001_complete_Determina_Costituzione_Fondo_2025.txt
?? audit_wave3_final_independent/evidence/doc001_complete_Prospetto_Contrattazione_2025.txt
?? audit_wave3_final_independent/evidence/doc001_complete_Relazione_Tecnica_Fondo_2025.txt
?? audit_wave3_final_independent/evidence/doc001_complete_Tabella15_COMPLETE_2025.csv
?? audit_wave3_final_independent/evidence/doc001_complete_Tabella15_COMPLETE_2025.xlsx
?? audit_wave3_final_independent/evidence/doc001_complete_determina.pdf
?? audit_wave3_final_independent/evidence/doc001_partial_Determina_Costituzione_Fondo_2025.txt
?? audit_wave3_final_independent/evidence/doc001_partial_Prospetto_Contrattazione_2025.txt
?? audit_wave3_final_independent/evidence/doc001_partial_Relazione_Tecnica_Fondo_2025.txt
?? "audit_wave3_final_independent/evidence/doc001_partial_Tabella15_ASTRA A_2025.csv"
?? "audit_wave3_final_independent/evidence/doc001_partial_Tabella15_ASTRA A_2025.xlsx"
?? audit_wave3_final_independent/evidence/doc001_partial_determina.pdf
?? audit_wave3_final_independent/evidence/independent_hardening_results.json
?? audit_wave3_final_independent/evidence/remaining_Determina_LEGACY_PREVIEW_2025.txt
?? audit_wave3_final_independent/evidence/remaining_Prospetto_LEGACY_PREVIEW_2025.txt
?? audit_wave3_final_independent/evidence/remaining_Relazione_LEGACY_PREVIEW_2025.txt
?? audit_wave3_final_independent/evidence/remaining_Tabella15_COMPLETE_2025.csv
?? audit_wave3_final_independent/evidence/remaining_Tabella15_COMPLETE_2025.xlsx
?? audit_wave3_final_independent/evidence/render_doc001_complete_p1.png
?? audit_wave3_final_independent/evidence/render_doc001_partial_p1.png
?? audit_wave3_final_independent/evidence/render_wb001_legacy_p1.png
?? audit_wave3_final_independent/evidence/rgs001_complete_Tabella15_COMPLETE_2025.csv
?? audit_wave3_final_independent/evidence/rgs001_complete_Tabella15_COMPLETE_2025.xlsx
?? audit_wave3_final_independent/evidence/t15001_unknown_Determina_Costituzione_Fondo_2025.txt
?? audit_wave3_final_independent/evidence/t15001_unknown_Prospetto_Contrattazione_2025.txt
?? audit_wave3_final_independent/evidence/t15001_unknown_Relazione_Tecnica_Fondo_2025.txt
?? "audit_wave3_final_independent/evidence/t15001_unknown_Tabella15_ASTRA A_2025.csv"
?? "audit_wave3_final_independent/evidence/t15001_unknown_Tabella15_ASTRA A_2025.xlsx"
?? audit_wave3_final_independent/evidence/t15001_unknown_Tabella15_COMPLETE_2025.csv
?? audit_wave3_final_independent/evidence/t15001_unknown_Tabella15_COMPLETE_2025.xlsx
?? audit_wave3_final_independent/evidence/t15002_multi_Tabella15_COMPLETE_2025.csv
?? audit_wave3_final_independent/evidence/t15002_multi_Tabella15_COMPLETE_2025.xlsx
?? audit_wave3_final_independent/evidence/t15002_negative_half_Tabella15_COMPLETE_2025.csv
?? audit_wave3_final_independent/evidence/t15002_negative_half_Tabella15_COMPLETE_2025.xlsx
?? audit_wave3_final_independent/evidence/t15002_positive_below_Tabella15_COMPLETE_2025.csv
?? audit_wave3_final_independent/evidence/t15002_positive_below_Tabella15_COMPLETE_2025.xlsx
?? audit_wave3_final_independent/evidence/t15002_positive_half_Determina_Costituzione_Fondo_2025.txt
?? audit_wave3_final_independent/evidence/t15002_positive_half_Prospetto_Contrattazione_2025.txt
?? audit_wave3_final_independent/evidence/t15002_positive_half_Relazione_Tecnica_Fondo_2025.txt
?? audit_wave3_final_independent/evidence/t15002_positive_half_Tabella15_COMPLETE_2025.csv
?? audit_wave3_final_independent/evidence/t15002_positive_half_Tabella15_COMPLETE_2025.xlsx
?? audit_wave3_final_independent/evidence/wb001_legacy_Determina_LEGACY_PREVIEW_2025.txt
?? audit_wave3_final_independent/evidence/wb001_legacy_Prospetto_LEGACY_PREVIEW_2025.txt
?? audit_wave3_final_independent/evidence/wb001_legacy_Relazione_LEGACY_PREVIEW_2025.txt
?? audit_wave3_final_independent/evidence/wb001_legacy_Tabella15_COMPLETE_2025.csv
?? audit_wave3_final_independent/evidence/wb001_legacy_Tabella15_COMPLETE_2025.xlsx
?? audit_wave3_final_independent/evidence/wb001_legacy_determina.pdf
?? audit_wave3_final_independent/independent_hardening_verification.audit.ts
?? audit_wave3_final_independent/vitest.audit.config.ts
?? audit_wave3_independent/evidence/Determina_BOZZA_2025.pdf
?? audit_wave3_independent/evidence/Determina_BOZZA_2025.txt
?? audit_wave3_independent/evidence/Determina_Costituzione_Fondo_2025.page-1.png
?? audit_wave3_independent/evidence/Determina_Costituzione_Fondo_2025.page-2.png
?? audit_wave3_independent/evidence/Determina_Costituzione_Fondo_2025.pdf
?? audit_wave3_independent/evidence/Determina_Costituzione_Fondo_2025.txt
?? audit_wave3_independent/evidence/Prospetto_BOZZA_2025.txt
?? audit_wave3_independent/evidence/Prospetto_Contrattazione_2025.txt
?? audit_wave3_independent/evidence/Relazione_BOZZA_2025.txt
?? audit_wave3_independent/evidence/Relazione_Tecnica_Fondo_2025.txt
?? "audit_wave3_independent/evidence/Tabella15_ENTE A_2025.csv"
?? "audit_wave3_independent/evidence/Tabella15_ENTE A_2025.xlsx"
?? audit_wave3_independent/evidence/Tabella15_ROUNDING_2025.csv
?? audit_wave3_independent/evidence/Tabella15_ROUNDING_2025.xlsx
?? audit_wave3_independent/evidence/doc.zip
?? audit_wave3_independent/evidence/independent_probe_results.json
?? audit_wave3_independent/independent_wave3_review.test.ts
?? chat_history_AG123.txt
?? docs/audit_art79_consistenza_personale.md
?? err.txt
?? evidence_pack/P01_desktop_toolbox_admin.png
?? evidence_pack/P02_desktop_toolbox_non_admin.png
?? evidence_pack/P03_desktop_area_fondo_selection.png
?? evidence_pack/P04_desktop_ente_selector_dropdown.png
?? evidence_pack/P05_desktop_cabina_in_lavorazione.png
?? evidence_pack/P06_desktop_cabina_non_iniziata.png
?? evidence_pack/P07_desktop_area_fondo_sidebar.png
?? evidence_pack/P08_desktop_nav_fondo_personale.png
?? evidence_pack/P09_desktop_nav_raccolta_guidata.png
?? evidence_pack/P10_desktop_gestione_utenti.png
?? evidence_pack/PM01_mobile_toolbox.png
?? evidence_pack/PM02_mobile_area_fondo.png
?? evidence_pack/PM03_mobile_area_fondo_menu.png
?? evidence_pack/PT01_tablet_toolbox.png
?? evidence_pack/PT02_tablet_area_fondo.png
?? evidence_pack_iteration_2/I2-P01_toolbox_senza_card_enti.png
?? evidence_pack_iteration_2/I2-P01_toolbox_senza_card_enti.zip
?? evidence_pack_iteration_2/I2-P02_toolbox_hero_continua_fondo.png
?? evidence_pack_iteration_2/I2-P03_fondi_enti_catalogo_completo.png
?? evidence_pack_iteration_2/I2-P04_fondi_enti_filtri_admin.png
?? evidence_pack_iteration_2/I2-P05_fondi_enti_vista_compatta.png
?? evidence_pack_iteration_2/I2-P06_fondi_enti_modale_nuovo_ente.png
?? evidence_pack_iteration_2/I2-P07_fondi_enti_modale_nuova_annualita.png
?? evidence_pack_iteration_2/I2-P08_fondi_enti_menu_azioni.png
?? evidence_pack_iteration_2/I2-P09_area_fondo_context_bar_unificata.png
?? evidence_pack_iteration_2/I2-P10_area_fondo_dropdown_cambia_fondo.png
?? evidence_pack_iteration_2/I2-P11_cabina_regia_pipeline_leggera.png
?? evidence_pack_iteration_2/I2-P12_cabina_regia_prossima_attivita.png
?? evidence_pack_iteration_2/I2-P13_sidebar_fondo_link_tutti_i_fondi.png
?? evidence_pack_iteration_2/I2-PM01_mobile_toolbox.png
?? evidence_pack_iteration_2/I2-PM02_mobile_fondi_enti.png
?? evidence_pack_iteration_2/I2-PM03_mobile_cabina_regia_pipeline_compatta.png
?? evidence_pack_iteration_2/I2-PT01_tablet_fondi_enti.png
?? evidence_pack_iteration_2/I2-PT02_tablet_cabina_regia.png
?? evidence_pack_iteration_3/I3-P01_toolbox_desktop_hero_snella.png
?? evidence_pack_iteration_3/I3-P02_fondi_enti_lista_compatta.png
?? evidence_pack_iteration_3/I3-P03_fondi_enti_modale_crea_e_apri.png
?? evidence_pack_iteration_3/I3-P04_cabina_regia_desktop_header_senza_duplicati.png
?? evidence_pack_iteration_3/I3-P05_cabina_regia_next_action_distribuzione.png
?? evidence_pack_iteration_3/I3-P06_cabina_regia_pipeline_desktop_grammatica.png
?? evidence_pack_iteration_3/I3-P07_cabina_regia_compliance_messaging_prudente.png
?? evidence_pack_iteration_3/I3-P08_contextbar_cambia_fondo_popover_aperto.png
?? evidence_pack_iteration_3/I3-P09_contextbar_stato_chiuso_readonly.png
?? evidence_pack_iteration_3/I3-P10_cabina_regia_annualita_chiusa.png
?? evidence_pack_iteration_3/I3-PM01_mobile_toolbox_390px.png
?? evidence_pack_iteration_3/I3-PM02_mobile_fondi_enti_390px.png
?? evidence_pack_iteration_3/I3-PM03_mobile_cabina_regia_390px.png
?? evidence_pack_iteration_3/I3-PM04_mobile_pipeline_espansa_390px.png
?? evidence_pack_iteration_3/I3-PM05_mobile_drawer_sezioni_390px.png
?? evidence_pack_iteration_3/I3-PM06_mobile_contextbar_cambia_fondo_390px.png
?? evidence_pack_iteration_3/I3-PM07_mobile_360px_no_overflow.png
?? evidence_pack_iteration_3/I3-PT01_tablet_toolbox_768px.png
?? evidence_pack_iteration_3/I3-PT02_tablet_cabina_regia_768px_no_squeeze.png
?? evidence_pack_iteration_3/I3-PT03_tablet_drawer_sezioni_aperto_768px.png
?? evidence_pack_iteration_3/I3-PT04_tablet_fondi_enti_768px.png
?? evidence_pack_iteration_3/RESPONSIVE_OVERFLOW_REPORT.json
?? evidence_pack_iteration_3_1/I31-P01_toolbox_desktop_1440x900.png
?? evidence_pack_iteration_3_1/I31-P02_fondi_enti_desktop_1440x900.png
?? evidence_pack_iteration_3_1/I31-P03_modale_nuovo_ente_1440x900.png
?? evidence_pack_iteration_3_1/I31-P04_cabina_regia_desktop_header_1440x900.png
?? evidence_pack_iteration_3_1/I31-P05_pipeline_desktop_5fasi_1440x900.png
?? evidence_pack_iteration_3_1/I31-P06_prossima_attivita_distribuzione_1440x900.png
?? evidence_pack_iteration_3_1/I31-P07_sezioni_operative_verifiche_1440x900.png
?? evidence_pack_iteration_3_1/I31-P08_contextbar_dropdown_cambia_fondo_1440x900.png
?? evidence_pack_iteration_3_1/I31-P09_cabina_regia_annualita_chiusa_1440x900.png
?? evidence_pack_iteration_3_1/I31-P10_cabina_regia_desktop_1200x800_no_truncate.png
?? evidence_pack_iteration_3_1/I31-P11_denominazione_lunga_no_clipping.png
?? evidence_pack_iteration_3_1/I31-PM01_toolbox_mobile_390x844.png
?? evidence_pack_iteration_3_1/I31-PM02_fondi_enti_mobile_390x844.png
?? evidence_pack_iteration_3_1/I31-PM03_cabina_regia_mobile_390x844.png
?? evidence_pack_iteration_3_1/I31-PM04_pipeline_espansa_mobile_390x844.png
?? evidence_pack_iteration_3_1/I31-PM05_drawer_sezioni_mobile_390x844.png
?? evidence_pack_iteration_3_1/I31-PM06_contextbar_cambia_fondo_mobile_390x844.png
?? evidence_pack_iteration_3_1/I31-PM07_mobile_360x800_zero_overflow.png
?? evidence_pack_iteration_3_1/I31-PT01_cabina_regia_tablet_landscape_1024x768.png
?? evidence_pack_iteration_3_1/I31-PT02_cabina_regia_tablet_portrait_768x1024.png
?? evidence_pack_iteration_3_1/I31-PT03_pipeline_espansa_tablet_1024x768.png
?? evidence_pack_iteration_3_1/RESPONSIVE_OVERFLOW_REPORT_I3_1.json
?? evidence_pack_iteration_3_1b/I31B-P01_toolbox_desktop_1440x900.png
?? evidence_pack_iteration_3_1b/I31B-P02_fondi_degli_enti_desktop_1440x900.png
?? evidence_pack_iteration_3_1b/I31B-P03_cabina_di_regia_desktop_1440x900.png
?? evidence_pack_iteration_3_1b/I31B-P04_cabina_di_regia_desktop_1200x800.png
?? evidence_pack_iteration_3_1b/I31B-P05_cabina_di_regia_closed_1440x900.png
?? evidence_pack_iteration_3_1b/I31B-PM01_toolbox_mobile_390x844.png
?? evidence_pack_iteration_3_1b/I31B-PM02_fondi_degli_enti_mobile_390x844.png
?? evidence_pack_iteration_3_1b/I31B-PM03_cabina_di_regia_mobile_360x800.png
?? evidence_pack_iteration_3_1b/RESPONSIVE_BOUNDARY_REPORT_I3_1B.json
?? evidence_wave3/Determina_Costituzione_2025.txt
?? evidence_wave3/Determina_Costituzione_2026.txt
?? evidence_wave3/Prospetto_Contrattazione_2025.txt
?? evidence_wave3/Relazione_Tecnica_2025.txt
?? evidence_wave3/Tabella15_2025.json
?? evidence_wave3/Tabella15_2026.json
?? evidence_wave3_hardening/Scenario_A_Determina_BOZZA_2026.pdf
?? evidence_wave3_hardening/Scenario_A_Determina_Costituzione_Fondo_2026.pdf
?? evidence_wave3_hardening/Scenario_A_Tabella15_COMUNE_SCENARIO_A_2026.csv
?? evidence_wave3_hardening/Scenario_A_Tabella15_COMUNE_SCENARIO_A_2026.xlsx
?? evidence_wave3_hardening/Scenario_A_determina.txt
?? evidence_wave3_hardening/Scenario_A_prospetto.txt
?? evidence_wave3_hardening/Scenario_A_relazione.txt
?? evidence_wave3_hardening/Scenario_B_Determina_BOZZA_2025.pdf
?? evidence_wave3_hardening/Scenario_B_Determina_Costituzione_Fondo_2025.pdf
?? evidence_wave3_hardening/Scenario_B_Tabella15_COMUNE_SCENARIO_B_2025.csv
?? evidence_wave3_hardening/Scenario_B_Tabella15_COMUNE_SCENARIO_B_2025.xlsx
?? evidence_wave3_hardening/Scenario_B_determina.txt
?? evidence_wave3_hardening/Scenario_B_prospetto.txt
?? evidence_wave3_hardening/Scenario_B_relazione.txt
?? evidence_wave3_hardening/Scenario_C_Tabella15_COMUNE_SCENARIO_C_2026.csv
?? evidence_wave3_hardening/Scenario_C_Tabella15_COMUNE_SCENARIO_C_2026.xlsx
?? evidence_wave3_hardening/Scenario_D_determina.txt
?? evidence_wave3_hardening/Scenario_E_determina.txt
?? evidence_wave3_hardening/Scenario_F_determina.txt
?? evidence_wave3_hardening/Scenario_G_Tabella15_COMUNE_SCENARIO_G_2026.csv
?? evidence_wave3_hardening/Scenario_G_Tabella15_COMUNE_SCENARIO_G_2026.xlsx
?? evidence_wave3_hardening/manifest.json
?? "fileprogetto/9788891682826 Giannotti 2026.pdf"
?? fileprogetto/Analisi_Nuovi_Fondi_Salario_Accessorio_Funzioni_Locali_2026.md
?? "fileprogetto/Fondo risorse decentrate 2026 - foglio di calcolo.xlsx"
?? scripts/browser_smoke_wave1.cjs
?? scripts/browser_smoke_wave1.ts
?? scripts/characterize_wave3_before.ts
?? scripts/diagnose_390.cjs
?? scripts/diagnose_intrinsic.cjs
?? scripts/generate_evidence_pack.cjs
?? scripts/generate_evidence_pack_i2.cjs
?? scripts/generate_evidence_pack_i3.cjs
?? scripts/generate_evidence_pack_i3_1.cjs
?? scripts/generate_evidence_pack_i3_1b.cjs
?? scripts/inspect_data.cjs
?? scripts/reproduce_wave1_before.ts
?? scripts/run_wave1_review_checks.ts
?? scripts/test_admin_login.cjs
?? scripts/test_guest_login.cjs
?? scripts/test_login_headless.cjs
?? scripts/test_wave1_final_hardening.ts
?? scripts/test_wave1_staging.ts
?? scripts/verify_wave3_acceptance.ts
?? smoke.test.ts
?? smoke_evidence/01_fondo_dipendenti_closed.png
?? smoke_evidence/01_salva_bozza_closed.png
?? smoke_evidence/02_fondo_dipendenti_closed.png
?? smoke_evidence/02_fondo_eq_closed.png
?? smoke_evidence/02_salva_bozza_closed.png
?? smoke_evidence/03_fondo_eq_closed.png
?? smoke_evidence/03_fondo_segretario_closed.png
?? smoke_evidence/04_fondo_dirigenza_closed.png
?? smoke_evidence/04_fondo_segretario_closed.png
?? smoke_evidence/05_distribuzione_closed.png
?? smoke_evidence/05_fondo_dirigenza_closed.png
?? smoke_evidence/06_personale_closed.png
?? smoke_evidence/07_distribuzione_closed.png
?? src/__tests__/createUserAdminAuthorization.test.ts
?? src/__tests__/deleteUserCanonicalAuthorization.test.ts
?? src/__tests__/updatePasswordCanonicalAuthorization.test.ts
?? src/contexts/__tests__/closureInstructionReadiness.integration.test.tsx
?? src/domain/__tests__/fadReportReadModel.test.ts
?? src/logic/closure/__tests__/closureInstructionReadiness.test.ts
?? src/logic/closure/resolveClosureInstructionReadiness.ts
?? src/logic/distribution/__tests__/distributionCanonicalBudget.test.ts
?? src/logic/distribution/__tests__/distributionDraftProposal.test.ts
?? src/logic/distribution/resolveDistributionDraftProposal.ts
?? src/logic/distribution/resolveDistributionFundBudget.ts
?? src/pages/__tests__/DistribuzioneRisorsePage.canonicalBudget.test.tsx
?? src/pages/__tests__/DistribuzioneRisorsePage.explicitDraft.test.tsx
?? src/services/__tests__/canonicalFadXlsx.test.ts
?? src/services/__tests__/canonicalFundSummaryPdf.test.ts
?? supabase/migrations/20260220000000_init_user_app_state.sql
?? supabase/migrations/20260220000001_init_user_profiles.sql
?? supabase/migrations/20260220000002_init_multi_entity.sql
?? supabase/migrations/20260220000003_init_fix_admin_access.sql
?? supabase/migrations/20260220000004_fix_profiles_recursion.sql
?? supabase/migrations/20260220000005_confirm_email.sql
?? supabase/migrations/20260220000006_make_admin.sql
?? supabase/migrations/20260220000007_seed_guest_user.sql
?? supabase/migrations/20260220000022_remote_baseline.sql
?? supabase/migrations/20261002000000_harden_auth_profile_role_source.sql
?? temp_fundCalculations.ts
?? test_dump.sql
?? tmp/pdfs/wave3_absolute_gate/MG2_VALID_DRAFT_Determina.txt
?? tmp/pdfs/wave3_absolute_gate/MG3_VALID_DRAFT_Relazione.txt
?? tmp/pdfs/wave3_absolute_gate/MG4_VALID_DRAFT_Prospetto.txt
?? tmp/pdfs/wave3_absolute_gate/P1_UI_DRAFT_Determina_BOZZA_2026.pdf
?? tmp/pdfs/wave3_absolute_gate/P1_render-1.png
?? tmp/pdfs/wave3_absolute_gate/P1_render-2.png
?? tmp/pdfs/wave3_absolute_gate/P2_UI_FINAL_Determina_Costituzione_Fondo_2026.pdf
?? tmp/pdfs/wave3_absolute_gate/P2_render-1.png
?? tmp/pdfs/wave3_absolute_gate/P2_render-2.png
?? tracked_files_iteration_3.patch
?? tracked_files_iteration_3_1.patch
?? wave1_browser_smoke_results.json
?? wave1_final_hardening_results.json
?? wave1_reproduction_before.json
?? wave1_review_gate_results.json
?? wave1_verification_staging.json
ux/toolbox-area-fondo-prototype
d3170f959b5815c514dbf3d6e5f93366a5f14c67
warning: in the working copy of 'src/__tests__/securityMigrations.test.ts', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/contexts/AppContext.tsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/domain/documentProjection.ts', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/logic/cabina/__tests__/resolveCabinaViewModel.test.ts', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/logic/cabina/__tests__/resolveOperationalStatus.test.ts', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/logic/cabina/resolveCabinaViewModel.ts', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/logic/cabina/resolveOperationalStatus.ts', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/pages/DistribuzioneRisorsePage.tsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/pages/EntityYearManagementPage.tsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/pages/__tests__/CabinaDiRegiaPage.wave41.integration.test.tsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/pages/__tests__/DistribuzioneRisorsePage.closed.test.tsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/presenters/reportPresenter.ts', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/services/documents/pdfReportService.ts', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/services/documents/xlsReportService.ts', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'supabase/functions/create-user/index.ts', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'supabase/functions/delete-user/index.ts', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'supabase/functions/update-password/index.ts', LF will be replaced by CRLF the next time Git touches it
M	src/__tests__/securityMigrations.test.ts
M	src/contexts/AppContext.tsx
M	src/domain/documentProjection.ts
M	src/features/wizard2026/__tests__/wizard2026RemoteDraftSync.test.ts
M	src/logic/cabina/__tests__/resolveCabinaViewModel.test.ts
M	src/logic/cabina/__tests__/resolveOperationalStatus.test.ts
M	src/logic/cabina/resolveCabinaViewModel.ts
M	src/logic/cabina/resolveOperationalStatus.ts
M	src/pages/DistribuzioneRisorsePage.tsx
M	src/pages/EntityYearManagementPage.tsx
M	src/pages/__tests__/CabinaDiRegiaPage.wave41.integration.test.tsx
M	src/pages/__tests__/DistribuzioneRisorsePage.closed.test.tsx
M	src/presenters/reportPresenter.ts
M	src/services/documents/pdfReportService.ts
M	src/services/documents/xlsReportService.ts
M	supabase/functions/create-user/index.ts
M	supabase/functions/delete-user/index.ts
M	supabase/functions/update-password/index.ts

```
