# CALC02_DISTRIBUTION_CANONICAL_BUDGET — Implementation report

## Baseline

Data 2026-10-04. Repository dinopusceddu/entilocaliapp.
Branch: `ux/toolbox-area-fondo-prototype`.
HEAD: `d3170f959b5815c514dbf3d6e5f93366a5f14c67`.

Prima di modificare qualsiasi file sono stati eseguiti status completo, branch, HEAD, diff name-status e staged name-status. Baseline corrispondente; staged vuoto. Il PRE contiene 9 file tracked modificati da slice precedenti e numerosi untracked, tutti preservati.

Inventario PRE SHA256: 1103 file (tracked, untracked non ignorati e tutti i Markdown root, inclusi report ignorati). Evidenze complete in `C:\Users\PUSCED~1\AppData\Local\Temp\calc02-distribution-9761516df84b4f56a40d807d66fe0b58`: baseline-pre.txt, pre-sha256.json, post-sha256.json, integrity.json. Nessuna operazione correttiva sul repository.

Letti integralmente DistribuzioneRisorsePage, FondoAccessorioDipendentePage, resolver Cabina pertinenti e helper economici della pagina; sezioni CALC-02/FUNC-02 della reconciliation; review indipendenti PDF e read model. Il codice corrente prevale sulle descrizioni storiche.

## Original CALC-02 acceptance

“Cabina, Personale, distribuzione ed export concordano al centesimo per risorse importate e manuali.”

La review indipendente PDF chiude il writer ma mantiene CALC-02 PARTIALLY_FIXED: Distribuzione trasforma il verified subtotal 3400 in budget definitivo anche con canonical total null. Questo slice corregge soltanto tale source/semantica economica. La validità monetaria non diventa readiness amministrativa.

## Current Distribution graph

PRE:
AppContext.state.calculationResult
→ fondi.dipendente.summary.totaleFondo || 0
→ totaleDaDistribuire
→ KPI, disponibilità contrattazione, residuo, progress bar, budget performance e maggiorazione
→ effetti di auto-riparto
→ dispatch UPDATE_DISTRIBUZIONE_RISORSE_DATA.

Gli utilizzi stabili/variabili sono sommati localmente dalla pagina. Le formule di performance, percentuali, maggiorazione e la distinzione preventivo/consuntivo sono locali; FinancialMath è usato per sottrazione esatta e rounding già presenti. CLOSED impedisce mutazioni. Salva Distribuzione usa saveState. EQ ha input separati ed è invariato.

POST:
calculationResult.canonicalFund
→ resolveDistributionFundBudget
→ totale autoritativo nullable + verified subtotal nullable + basis qualificata
→ resolveDistributionBalances
→ KPI e calcoli della pagina con semantica AUTHORITATIVE/VERIFIED_DRAFT/UNAVAILABLE.

## Legacy budget source

Rimosso l'accesso a summary.totaleFondo dalla pagina. Nessun fallback a summary, section.total, calculateFadTotals o FundData grezzo come fonte del budget. I dati delle allocazioni restano input legittimi della distribuzione e non sono una nuova authority del Fondo.

Il test runtime avvelena calculationResult.fondi: il rendering e il riparto canonico continuano senza accessi. Il contratto AST impedisce letture summary/totaleFondo/constitution e import calculateFadTotals nel resolver e nella pagina.

## Canonical budget contract

Nuovo resolver puro dedicato:
`src/logic/distribution/resolveDistributionFundBudget.ts`.

| Campo | Fonte / significato |
| --- | --- |
| canonicalStatus | canonical.status, oppure MISSING se canonical assente |
| authoritativeFundTotal | canonical.total esclusivamente per VALID; altrimenti null |
| verifiedFundSubtotal | canonical.verifiedTotal; null se canonical assente |
| basis.mode | AUTHORITATIVE se totale non nullo; altrimenti VERIFIED_DRAFT se subtotal presente; altrimenti UNAVAILABLE |
| basis.amount | Il totale valido oppure il verified subtotal di simulazione; null per UNAVAILABLE |
| balances.mode | Modalità della base preservata |
| availableForNegotiation | Base qualificata meno utilizzi stabili, con FinancialMath.subtractExact; null se base assente |
| residual | Base qualificata meno allocazioni, con FinancialMath.subtractExact; null se base assente |

Nessun ricalcolo del Fondo, entry, percentuale normativa o totale del ledger. Nessun arrotondamento dei valori canonici. Il resolver non legge legacy. Anche VALID con total null conserva authority null e può esporre soltanto la base verificata draft.

## Authoritative vs verified draft semantics

Il KPI “Totale da Distribuire” legge sempre authoritativeFundTotal e mostra “Non determinato” quando null. Non mostra il verified subtotal sotto quella etichetta.

Per VERIFIED_DRAFT: banner con stato canonico, subtotale verificato e dicitura “Base di simulazione BOZZA”; disponibilità, residuo, allocazioni, budget performance e maggiorazione sono qualificati “(bozza)”. Il banner dichiara che non attestano la costituzione del Fondo. Avviso di superamento identifica la base di simulazione. La progress bar usa la stessa base e resta un indicatore visivo, non un totale autoritativo.

Per UNAVAILABLE: budget, disponibilità, residuo e valori performance dipendenti dalla base sono non determinati; nessuna barra su un falso zero. Restano consultabili le allocazioni esistenti e gli input manuali. Non viene bloccata l'intera pagina e non viene implementato DISTRIBUTION_EXPLICIT_DRAFT completo.

## A/2025

Il probe esegue calculateFundCompletely sullo stesso input reale degli slice documentali: 2000 straordinario consolidato, 1400 incremento corrente, Art60 legacy 127,44 e recovery 2800 non istruito.

Risultato:
- canonicalStatus UNDETERMINED;
- verifiedStableTotal 3400;
- verifiedVariableTotal 0;
- verifiedFundSubtotal 3400;
- authoritativeFundTotal null;
- basis VERIFIED_DRAFT / 3400.

La UI reale mostra “Totale da Distribuire — Non determinato”, banner con subtotal 3400 e residuo “(bozza)”. La recovery identificata dall'entry CCNL_014_RECOVERY_LEGACY_2024_2025 è UNDETERMINED, amount informativo 2800: non entra nella base economica né compare come budget in Distribuzione.

## Explicit zero

canonical VALID total 0 contro legacy 900: authority e basis restano zero AUTHORITATIVE. Nessun operatore || con fallback legacy. Residuo con allocazioni 1500 è -1500, come prima per un fondo realmente determinato a zero; non è confuso con input mancante.

## INVALID / missing

INVALID e UNDETERMINED non possono autorizzare un budget finale, anche se canonical.total patologicamente numerico. Il verified subtotal resta una simulazione qualificata.

Canonical undefined/null: canonicalStatus MISSING, authority null, verified null, basis UNAVAILABLE. Nessuna conversione a zero. Due effetti automatici dipendenti dal budget non partono e non sovrascrivono le allocazioni esistenti con importi zero inventati.

## Residual/allocation behavior

VALID 10000, legacy 99999, utilizzi stabili 1000 e altri variabili 500:
disponibile 9000; residuo 8500; auto-performance 4250 individuale e 4250 organizzativa con criterio 50%.

UNDETERMINED verified 3400, legacy 8888, stesse allocazioni:
authority null; disponibile draft 2400; residuo draft 1900; auto-performance draft 950 + 950. Il test verifica sia le etichette UI sia gli effettivi payload dispatch.

La policy generale di auto-performance, le formule, i criteri e l'auto-persistenza delle stanziate rimangono preesistenti. Ora dipendono dalla base canonica qualificata, senza creare o scrivere un authoritative total. Non vengono introdotti campi persistiti di readiness/draft. Gli importi salvati come allocazioni e il relativo avanzamento Cabina restano una questione FUNC-02 distinta; il banner/labels impediscono falsa definitività economica nella pagina.

Effetto collaterale necessario e limitato: in assenza di base canonica, niente automatiche mutazioni budget-driven; importi e input esistenti non vengono cancellati. Cleanup preventivo di risparmi/aBilancio, personale mancante→0, regole Art48, chiusura annualità, CTA e saveState restano invariati.

## Cross-consumer probe

Un unico A/2025 attraversa motore reale, UI Fondo Personale e Distribuzione in SSR, resolver Cabina, FadReportReadModel, workbook reale serializzato/riaperto, PDF reale ed estrazione testo locale.

| Consumer | Stato | Verified | Authoritative |
| --- | --- | ---: | --- |
| CanonicalFundResult | UNDETERMINED | 3400 | null |
| Fondo Personale, HTML reale | UNDETERMINED | 3400 | Non determinabile |
| Cabina constitution | UNDETERMINED | 3400 | null; showDefinitiveTotal false |
| FadReportReadModel | UNDETERMINED | 3400 | null |
| XLS reale | BOZZA / UNDETERMINED | 3400 | NON DETERMINATO |
| PDF reale | BOZZA / UNDETERMINED | 3400 | NON DETERMINATO |
| Distribuzione, modello e HTML reale | UNDETERMINED | 3400, VERIFIED_DRAFT | null / Non determinato |

Cabina non espone campi stable/variable autonomi nella constitution: non sono inventati nel probe. Il risultato di origine conserva stable 3400, variable 0. Nessun consumer presenta 3400 come totale definitivo.

Evidenze in `C:\Users\PUSCED~1\AppData\Local\Temp\calc02-distribution-9761516df84b4f56a40d807d66fe0b58\probe`: cross-consumer-A2025.json, Distribution-A2025.html, FondoPersonale-A2025.html, A2025.xlsx, A2025.pdf e A2025.pdf.txt. Si usano builder, renderer e librerie reali; mock soltanto context/hook esterni. Nessun exporter modificato.

## Tests

| Gate | Esito |
| --- | --- |
| Nuovo resolver/probe D1–D10 e contratto AST | PASS 14/14 |
| Nuova integrazione pagina: authority/draft/missing/mutazioni/legacy | PASS 7/7 |
| CLOSED regression | PASS 1/1; sole fixture aggiornate con autorizzazione |
| Fondo Personale | PASS 6/6 |
| Cabina pagina + resolver | PASS 92/92 |
| FAD read model | PASS 17/17 |
| XLS | PASS 16/16 |
| PDF | PASS 17/17 |
| Canonical ledger contract | PASS 13/13 |
| Wave3 consistency/systemic/wiring/hardening | PASS 34 + 21 + 19 + 7 |
| Auth 01/02A/02B | PASS 95/95 |
| 17 suite mirate precedenti | PASS 337/337 |
| TypeScript npx tsc --noEmit | PASS |
| Regression | PASS 8/8 |
| Oracle Wave2 | PASS 14/14 |
| Full Vitest offline | PASS 1408/1408; 119 file; nessun fail o skip |
| git diff --check | PASS |

I test eseguono produzione reale e spy sui dispatch; nessuna chiamata a saveState remoto. La prima asserzione del nuovo test recovery presumeva una source RECOVERY, mentre l'entry reale è migrata legacy: corretta sul suo ID canonico effettivo, senza modificare ledger o formule. Nessun golden storico cambiato.

### Network gate

NODE_OPTIONS precarica la guardia locale: fetch, HTTP/HTTPS, net.Socket.connect, TLS e DNS vengono intercettati prima della connessione; log di PID/argv/stack con classificazione prodotto/tooling. npm offline e notifier disabilitato; Supabase example.invalid e remote drafts disattivati. Evidenze di suite Wave3 reindirizzate in TEMP.

PRODUCT_NETWORK_ATTEMPTS = 0.
TOOLING_NETWORK_ATTEMPTS = 0.
REAL_NETWORK_CONNECTION_ESTABLISHED = NO.

Nessun tentativo registrato, verificato anche dopo full suite. Configurazione TEMP richiede accesso autorizzato per esbuild oltre il sandbox; guardia offline mantenuta anche in tali esecuzioni. Nessuna installazione. Le evidenze full-vitest.json/full-vitest.log, regression.log (8/8) e oracle.log (14/14) sono conservate nella directory TEMP. La suite completa comprende Tabella15 mapper 3/3, Wave2 characterization 1/1, independent Wave3 document review 6/6 e documentPresenter 1/1, oltre ai gate documentali mirati.

## Scope integrity

File dello slice:
1. src/pages/DistribuzioneRisorsePage.tsx — unico produttivo preesistente modificato.
2. src/logic/distribution/resolveDistributionFundBudget.ts — nuovo resolver e saldi qualificati.
3. src/logic/distribution/__tests__/distributionCanonicalBudget.test.ts — nuovo test puro/probe.
4. src/pages/__tests__/DistribuzioneRisorsePage.canonicalBudget.test.tsx — nuova integrazione UI/effects.
5. src/pages/__tests__/DistribuzioneRisorsePage.closed.test.tsx — soltanto aggiunta di 3 righe fixture canonical VALID 100000; tutte le asserzioni originali identiche.
6. CALC02_DISTRIBUTION_CANONICAL_BUDGET_IMPLEMENTATION_REPORT.md — nuovo report.

L'utente ha autorizzato esplicitamente l'eccezione della fixture CLOSED: “Sì, aggiornare solo la fixture”. Il test originale senza canonical pretendeva un totale legacy, incompatibile con il nuovo missing→null. Non sono state allentate le asserzioni di immutabilità.

PRE 1103 file; confronto finale dopo full suite: due soli PRE modificati (pagina e fixture autorizzata), 1101 PRE byte-identici; nessun file cancellato. POST 1107 file, quattro nuovi file. Tutti gli hash protetti sotto riportati coincidono con il POST; preservati anche tutti i report ed evidence pack preesistenti.

Protetti Cabina, Fondo Personale, writer PDF/XLS, read model/presenter, canonical ledger/fundEngine, documenti moderni, Tabella15, Auth/migrations, evidence pack e report preesistenti. Staged vuoto e invariato. Nessun git add/commit/push/PR/deploy. Nessun DB, migration o contatto staging/produzione.

| File protetto | SHA256 PRE |
| --- | --- |
| src/pages/FondoAccessorioDipendentePage.tsx | 42B32B3CA8E7A38CE2C8F2253C876DC31E576EC272F901D018F47CC102779692 |
| src/logic/cabina/resolveCabinaViewModel.ts | 62C4095B6288A808FAF9CFDE2BA8D27A6D429D0E58220905A71BA22F7B636C83 |
| src/domain/documentProjection.ts | 44F29B081F0B888F8D5E6CAB790BC048555280B72E80CF75C6506F39033C34D3 |
| src/presenters/reportPresenter.ts | A44E86E497219C9AB2DB6A61C23B64CA79996D0CAEB7C27C89798AD8CB622BA0 |
| src/services/documents/pdfReportService.ts | FB8D40E6C5677E3A430A23E6D7856462B9FA779294CF71357D47C4F46512484E |
| src/services/documents/xlsReportService.ts | DE40F1CAA5022778B4806A97664ECEA147BDE1517203197D4DB5AF456E27A249 |
| src/services/__tests__/canonicalFundSummaryPdf.test.ts | AD8BAEAE7745B232EA996495A49A0FEB8288679E5996F08D462CDBE4C9BFFC01 |
| src/services/__tests__/canonicalFadXlsx.test.ts | 9F8AC63BF97C209FA5FD9C794A8CAAB1FE24683BF4283F81913553E16F3C670E |
| src/domain/__tests__/fadReportReadModel.test.ts | 60CF336CDA92F3CB99185900718CB3CE918342D6A995D9BE245F9F737E8A2AA2 |
| src/logic/calculation/canonicalFundLedger.ts | 44E7E20D8D2F062FE3688AF841AD4BCB2B225093C97B3880BC7FFE3D83D639EB |
| src/logic/calculation/fundEngine.ts | 6AC723E7343E1AC6A448464AD761488E6DCB9D7F6491AB2729F8316FD9A83C27 |
| supabase/functions/create-user/index.ts | D95E40ACDC81B16C7AFBF9970C49F6E9361E2C6802F9DFF5D555BC5D1F25CFD4 |
| supabase/functions/update-password/index.ts | 04B07282D4D52DD2F098E38E94A302D425B5BE3DF964491D346FB7E62DA183C1 |
| supabase/functions/delete-user/index.ts | 7E475D7B4A384F0F258EE227ACDF85A7EC9CD71631FC7814F0C7EB37DAABA11C |
| supabase/migrations/20261002000000_harden_auth_profile_role_source.sql | 8670E439CD6FA8AE969652445637168491AFD3388DE710CE2AE9E2752EF2614D |
| CANONICAL_FUND_SUMMARY_PDF_INDEPENDENT_REVIEW.md | C3FA51E8DE1A0E1A033E64AA21E03E7E6749D1A3FD0E1DF1CE5DA2E8389D2D97 |

## Residual FUNC-02 issues

Restano PARTIALLY_FIXED e non implementati:
- priorità dei blocking issue / CTA Cabina;
- richiesta di scelta consapevole prima dell'auto-riparto performance;
- interpretazione personale mancante come zero;
- draft esplicito persistito e workflow distribuzione completo;
- readiness negoziale/amministrativa e chiusura annualità.

L'authority monetaria corretta non dimostra completezza istruttoria o disponibilità negoziale. Non vengono modificate policy di oneri, Art48 o altri fondi.

## Finding reassessment

CALC02_DISTRIBUTION_CANONICAL_BUDGET = CLOSED_LOCALLY. IMPLEMENTATION = COMPLETE. RESULT = PASS; tutti i gate richiesti superati.
CALC-02 = CANDIDATE_VERIFIED_FIXED, subordinato alla review indipendente di chiusura.
NORM-01 = VERIFIED_FIXED, preservato come da review indipendente precedente.
FUNC-02 = PARTIALLY_FIXED.
DOC-02 = PARTIALLY_FIXED.
NORM-02 = PARTIALLY_FIXED.
ARCH-01 = PARTIALLY_FIXED.

Auth 01/02A/02B, FAD read model, XLS e PDF restano CLOSED_LOCALLY e invariati. AUTH_ROLE_03, DELETE_CLEANUP_FINDING e APPLY_PENDING profile-role migration restano untouched. RGS_SCHEMA_UNVERIFIED invariato.

NEXT_GATE_RECOMMENDATION = CALC02_FINAL_INDEPENDENT_CLOSURE_REVIEW.

## Appendice — working-tree PRE

```text
 M src/__tests__/securityMigrations.test.ts
 M src/domain/documentProjection.ts
 M src/features/wizard2026/__tests__/wizard2026RemoteDraftSync.test.ts
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
?? CANONICAL_FAD_XLSX_INDEPENDENT_REVIEW.md
?? CANONICAL_FUND_SUMMARY_PDF_INDEPENDENT_REVIEW.md
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
?? src/domain/__tests__/fadReportReadModel.test.ts
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
```
