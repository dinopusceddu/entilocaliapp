# CANONICAL_FAD_XLSX — implementation report

Implementation complete. Functional/code gates PASS. Overall RESULT = FAIL because the strict NETWORK_ATTEMPTS = 0 gate was not satisfied: the offline guard recorded one blocked node:https.request invocation. No network connection or remote database operation was performed by that intercepted request. The origin was not captured by the original guard and is not asserted here. This report does not declare CLOSED_LOCALLY or VERIFIED_FIXED.

## Baseline

- Repository: dinopusceddu/entilocaliapp.
- Branch PRE/POST: ux/toolbox-area-fondo-prototype.
- HEAD PRE/POST: d3170f959b5815c514dbf3d6e5f93366a5f14c67.
- All five requested baseline commands ran before modifications. Branch and HEAD matched; no checkout, pull, fetch, reset, stash, merge or rebase.
- Staged diff PRE empty; POST empty.
- PRE SHA-256 inventory: 1,073 existing relevant paths, including tracked/nonignored untracked files and root report files covered by the existing ignore rule. Generated dependencies and Git internals are excluded.
- The captured PRE map is persisted at C:/Users/PUSCED~1/AppData/Local/Temp/canonical-fad-xlsx-0f1a7dba44564e2c96073abfd4ccca75/pre-sha256.json. POST map and comparison are saved alongside it.
- Exact PRE status appears in the appendix below. Seven tracked modifications and all preexisting untracked files were preserved.

## Legacy XLS graph

ReportsPage.handleGenerateFADXLS → reportService.generateFADXLS → xlsReportService.generateFondoDipendenteXLS → createReportViewModel → fondoDipendenti.costituzione / utilizzi / limiteArt23.

Before this slice:
- Quadro A used legacy CalculationSection items and section.total; deductions were negated again by the writer using Math.abs.
- The overall resource total came from calculationResult.fondi.dipendente.summary.totaleFondo.
- Quadro B summed legacy utilization items with floating point arithmetic and displayed legacy section totals.
- Quadro C displayed formatted legacy Art.23 limit/current/delta and a compliance label.
- No canonical economic output mode or BOZZA qualification existed.
- PDF followed its separate legacy presenter path; this remains intentionally unchanged.

The reconciliation findings CALC-02/NORM-01/NORM-02/DOC-02/ARCH-01 and the approved read-model implementation/review were read before implementation. Current code determined the actual consumer graph.

## New canonical XLS graph

ReportsPage.handleGenerateFADXLS → unchanged reportService.generateFADXLS → unchanged public signature generateFondoDipendenteXLS → unchanged createReportViewModel → buildFondoDipendenteWorkbook({ fadCanonical, annoRiferimento, denominazioneEnte }) → real ExcelJS workbook → existing writeBuffer / Blob / saveAs download.

Economic source: CanonicalFundResult → unchanged projectFadReport → unchanged FadReportReadModel → ReportViewModel.fadCanonical.

The builder accepts only a Pick of those three view-model fields. Legacy fields remain in the presenter for other consumers but are outside the builder's typed input contract. No change to reportService was necessary.

## Workbook structure PRE

- One worksheet: Fondo Dipendenti.
- Five columns: SEZIONE, VOCE / DESCRIZIONE, RIFERIMENTO NORMATIVO, IMPORTO (€), ART. 23 C. 2.
- Widths: 25 / 60 / 45 / 18 / 15; amount format #,##0.00.
- A1:E1 title merge, height 30, Arial 16 bold, bordeaux fill 994D51; ente in B2.
- Quadro A legacy stable/variable sections, item rows, section totals, resource total.
- Quadro B utilization sections/items/totals.
- Quadro C limit/current/delta/compliance.
- No Excel formulas.
- Filename: Fondo_Dipendenti_<ente>_<anno>.xlsx.
- MIME: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet; browser saveAs download.

## Workbook structure POST

The same sheet, five columns, widths, title merge, styles, metadata and download boundary remain. The previous blank third row now exposes the canonical economic status. Quadro A groups canonical rows by STABLE and VARIABLE, maintaining their order within each component, with verified section subtotals, a separate verified overall subtotal and a separate authoritative-total row.

Quadri B/C keep their headings and column headers, with no economic values or compliance outcome and the qualification “Non rappresentato in questo prospetto”. This treatment was explicitly selected by the user. It avoids sourcing utilization/limit numbers from legacy fields absent from the approved FadReportReadModel. Variable subject/excluded rows remain identifiable through the existing canonical art23Treatment field, without creating new subgroup totals.

Canonical row reasons and unresolved figurative entries are displayed as notes without economic amount cells. Missing canonical prerequisites are copied as notes; no administrative prerequisite is invented.

## Canonical field mapping

| Workbook field | Sole source | Null / signed semantics |
| --- | --- | --- |
| Economic detail in D | fadCanonical.rows[].signedAmount | Direct copy; null becomes an empty economic cell; no sign interpretation/calculation |
| Description in B | row.description, status, reason | Existing canonical description plus explicit unresolved qualification |
| Informational amount in unresolved description | row.amount | Canonical provisional amount, formatted as text only; expressly excluded from subtotals |
| Normative reference in C | row.normativeRef | Text only |
| Limit relevance in E | row.art23Treatment | SUBJECT → Sì; EXCLUDED → No; UNDETERMINED → Da verificare; no numeric limit calculation |
| Stable verified subtotal | verifiedStableTotal | Copy; absent canonical input remains blank/null |
| Variable verified subtotal | verifiedVariableTotal | Copy; absent canonical input remains blank/null |
| Overall verified subtotal | verifiedTotal | Copy; never substitutes for the authoritative total |
| Authoritative total | authoritativeTotal | Numeric only with canonicalAvailable, VALID and nonnull total; otherwise NON DETERMINATO |
| Economic state / mode | status, canonicalAvailable, authoritativeTotal | No administrative readiness checks |

No raw FundData, cache, alias, legacy summary, calculateFadTotals or section.total supplies a workbook amount. The local sections array only groups the two canonical components; it contains no legacy economic sections.

## Status / draft semantics

| Canonical situation | Filename / title | Authoritative cell | Verified cells |
| --- | --- | --- | --- |
| VALID with numeric total, including explicit zero | Existing definitive filename, no BOZZA prefix | Exact authoritativeTotal | Exact verified fields |
| UNDETERMINED | BOZZA filename and title | NON DETERMINATO, string | Verified numeric subtotals if available |
| INVALID | BOZZA filename and title | NON DETERMINATO, string | Verified numeric subtotals if available |
| Missing canonical result | BOZZA filename and title; UNDETERMINED | NON DETERMINATO, string | Blank/null |
| VALID with null total | BOZZA filename and title; canonical status preserved as VALID | NON DETERMINATO, string | Canonical verified fields |

Draft filename convention: Fondo_Dipendenti_BOZZA_<ente>_<anno>.xlsx, consistent with existing project BOZZA wording. No revision opinion, act, signature or transmission gates were introduced. This is economic output qualification only.

## A/2025 workbook inspection

The test uses calculateFundCompletely on the actual Wave3 A/2025 characterization input and the real presenter. It first verifies the historical mismatch: legacy stable items include 2000, 1400 and 127.44 but the legacy stable section total is 2000.

The serialized/reloaded workbook contains:

| Row / aggregate | D cell | Type / qualification |
| --- | --- | --- |
| Overtime stable transfer | 2000 | Number |
| Current stable increment 0.14% | 1400 | Number |
| Art.60 consolidation | 0 | Number; no legacy deduction |
| Stable verified subtotal | 3400 | Number |
| Legacy-aggregate recovery | Blank/null | Description: UNDETERMINED - DA ISTRUIRE, existing reason; provisional 2800 formatted as informative text excluded from subtotals |
| Variable verified subtotal | 0 | Number |
| Overall verified subtotal | 3400 | Number |
| Authoritative total | NON DETERMINATO | String |
| Output | Fondo_Dipendenti_BOZZA_Comune Astra_2025.xlsx | BOZZA title; UNDETERMINED state |

No numeric cell contains -127.44, 2800, 4800 or 6072.56 in this workbook. Recovery remains a visible unresolved entry rather than constituted resources. The PDF/XLS legacy evidence files and PDF writer are unchanged.

## Art60 inspection

2025: canonical ART60_CONSOLIDATION signedAmount = 0; the workbook writes numeric zero even with raw legacy 127.44 present.

2026: canonical signedAmount = -127.44; the workbook writes that value once in the economic Art.60 row. The figurative Art.23 entry has no economic row. Exact monetary reconciliation of the serialized economic detail with canonical.total is tested. No year-specific rule or Math.abs/sign recalculation exists in the writer.

## Recovery unresolved inspection

A canonical provisional recovery of 2800 with UNDETERMINED status and null signedAmount has an empty D cell. The B cell carries status, existing reason and a formatted informative amount expressly excluded from subtotals. Verified totals are copied from the read model; authoritative total is NON DETERMINATO. There is no SUM formula, hidden formula or numeric informational cell able to include the recovery.

## Precision and formulas inspection

All inspected files are real ExcelJS XLSX buffers, reloaded into a new workbook. Tests inspect cell values and types, worksheet names, visible state/columns, merges, widths, title styling, amount formatting, filename/mode and every nonempty cell for Formula type.

The fraction case serializes 0.34, 0.34, 0.34, -0.01, -0.01; canonical authoritative total = 1. Test reconciliation uses the existing FinancialMath helper. Production writer contains no rounding, toFixed, float sums, percentage formulas or monetary recalculation. Excel formulas PRE = 0, POST = 0.

## Legacy bypass removal proof

- Typed builder input excludes fondoDipendenti, constitution, summary and calculationResult economics.
- Runtime poison getters for fondoDipendenti/altriFondi throw if accessed; the real builder and serialized workbook succeed without accessing them.
- Divergent legacy section totals 777777 and summary 999999 do not change canonical workbook totals 0 or 55.55.
- A TypeScript AST contract test rejects legacy economic property accesses/imports and independent sign/rounding/sum helpers in the XLS module.
- Canonical zero defeats a legacy 900 alias. Missing canonical input produces blank verified aggregates and an undetermined final total.
- The public generateFADXLS path is exercised for VALID and UNDETERMINED with only file-saver mocked; the captured Blob is a real XLSX parsed with ExcelJS, with the original MIME and correct filename.
- The approved read model and presenter are byte-identical to PRE.

## Tests

| Gate | Result |
| --- | --- |
| Dedicated canonicalFadXlsx.test.ts, X1–X10 plus null/status/public download cases | PASS 16/16 |
| fadReportReadModel.test.ts | PASS 17/17 |
| canonicalFundLedger.contract.test.ts | PASS 13/13 |
| Wave2 characterization | PASS 1/1 |
| documentConsistencyWave3 | PASS 34/34 |
| Wave3 systemic / UI / hardening + documentPresenter | PASS 21 + 19 + 7 + 1 = 48/48 |
| Existing Excel Art79 / Wizard Excel | PASS 3 + 11 = 14/14 |
| Auth regressions AUTH_ADMIN_01 / 02A / 02B | PASS 19 + 34 + 42 = 95/95 |
| Combined pertinent suites | PASS 238/238, 14 files |
| Full Vitest | PASS 1370/1370, 116 files; 0 failed, 0 pending |
| Regression script | PASS 8/8 |
| Wave2 oracle | PASS 14/14 |
| npx tsc --noEmit | PASS |
| git diff --check | PASS |
| Strict zero-attempt network gate | FAIL: 1 observed blocked node:https.request invocation |

Initial dedicated test execution exposed two test-only assumptions (hardcoded locale formatting and prefix collisions for one-letter row IDs), plus two test TypeScript boundary types. The test harness was corrected; no historical golden was updated and no canonical formula changed.

Tests used installed dependencies with npm offline mode. An external TEMP Vitest config limited workers; the offline guard intercepted fetch/HTTP/HTTPS/socket/TLS/DNS boundaries and redirected existing evidence/PDF-writing tests to TEMP, preserving preexisting evidence files. A Windows sandbox directory-read denial required local runtime escalation; it was not a remote action.

Evidence directory:
C:/Users/PUSCED~1/AppData/Local/Temp/canonical-fad-xlsx-0f1a7dba44564e2c96073abfd4ccca75/

Files: targeted-tests.json, full-tests.json, regression-output.txt, oracle-output.json, pre-sha256.json, post-sha256.json, integrity-comparison.json, offline-guard.cjs, vitest.config.mjs, network-attempts.log.

### Network gate exception

The guard log contains one line: node:https.request. Its timestamp precedes the successful test executions, during the initial command/toolchain startup window. The guard throws before forwarding the request, and recorded no socket connection, DNS or Supabase request. No host/stack was recorded by that version of the guard, so the precise originating component is unverified. A network-free business test result is not sufficient to claim zero attempted network API calls.

Subsequent validation disabled npm update notifications as an additional precaution and retained the same guard. The log still contains only that one line. No additional remote action was used to investigate it. NETWORK_ATTEMPTS is therefore not declared zero; RESULT = FAIL under the user’s strict pass criteria. No live system security claim or premature closure is made.

## Scope integrity

Only one preexisting file changed: src/services/documents/xlsReportService.ts (48 insertions, 52 deletions). Added:
- src/services/__tests__/canonicalFadXlsx.test.ts.
- CANONICAL_FAD_XLSX_IMPLEMENTATION_REPORT.md.

No reportService, ReportsPage, presenter, projection, ledger, fundEngine, Auth, migration, PDF, Tabella15 or other writer changes. No type-only exception needed.

PRE/POST comparison: 1073 PRE paths → 1075 POST paths; 1072 preexisting files byte-identical, exactly one allowed preexisting writer modified, two new allowed files, zero deletions. All preexisting untracked files and evidence packs remain byte-identical. Staged diff remains empty. The new report matches the existing .gitignore:53 rule *report*.md; ignore rules were not changed and the report exists locally.

Protected PRE hashes below match POST:

| Protected file | SHA-256 PRE = POST |
| --- | --- |
| src/domain/documentProjection.ts | 44F29B081F0B888F8D5E6CAB790BC048555280B72E80CF75C6506F39033C34D3 |
| src/presenters/reportPresenter.ts | A44E86E497219C9AB2DB6A61C23B64CA79996D0CAEB7C27C89798AD8CB622BA0 |
| src/domain/__tests__/fadReportReadModel.test.ts | 60CF336CDA92F3CB99185900718CB3CE918342D6A995D9BE245F9F737E8A2AA2 |
| src/services/reportService.ts | 4B853738CA0250B6BF271362BE57A2D856551908074AA63CDB1B718AC2C33AD8 |
| src/services/documents/pdfReportService.ts | 86CFDA0A5DDBF5E01F548660660A94242F25AD04820A43647B615DF181C5A6F2 |
| src/pages/ReportsPage.tsx | 45B2F80A843419037538AC7E85711B06D477EEAC0B1BBDABA634BAE523F3C29A |
| src/services/documents/tabella15XlsService.ts | 5420745F4C4C90B196D4546C7AD433AABCCB99F9BA21CA795C37170E29E63513 |
| src/logic/calculation/tabella15Mapper.ts | 390C99EAB60AA0952D33EF6358459793FCF3E6DFF2ADE40B870DBA736D6F0F6A |
| src/logic/calculation/canonicalFundLedger.ts | 44E7E20D8D2F062FE3688AF841AD4BCB2B225093C97B3880BC7FFE3D83D639EB |
| src/logic/calculation/fundEngine.ts | 6AC723E7343E1AC6A448464AD761488E6DCB9D7F6491AB2729F8316FD9A83C27 |
| supabase/functions/create-user/index.ts | D95E40ACDC81B16C7AFBF9970C49F6E9361E2C6802F9DFF5D555BC5D1F25CFD4 |
| supabase/functions/update-password/index.ts | 04B07282D4D52DD2F098E38E94A302D425B5BE3DF964491D346FB7E62DA183C1 |
| supabase/functions/delete-user/index.ts | 7E475D7B4A384F0F258EE227ACDF85A7EC9CD71631FC7814F0C7EB37DAABA11C |
| src/__tests__/createUserAdminAuthorization.test.ts | 4AC728B2773092E90937F5B6CD77D5FC28F3264CAA9D5791AFFD2426C6B20326 |
| src/__tests__/updatePasswordCanonicalAuthorization.test.ts | 24BE29008EDB71AAA9A1C9DC07ACD1CDB1CD870E147E5212A8D2EE10E799B4A8 |
| src/__tests__/deleteUserCanonicalAuthorization.test.ts | 1372BDC3A980958A654A34B5FE64A2EE38A24B32905FB56C38C8A8F9F038E314 |
| src/pages/UserManagementPage.tsx | 21124D8B493F03C19493E57C2B69B2913C6EDB5DCF25A54DAFA24FF7AFF47F31 |
| supabase/migrations/20261002000000_harden_auth_profile_role_source.sql | 8670E439CD6FA8AE969652445637168491AFD3388DE710CE2AE9E2752EF2614D |
| src/__tests__/securityMigrations.test.ts | 4A2217191B161894846271D47C738BA2DEA1B72CC0626504E273958A8305D403 |
| src/features/wizard2026/__tests__/wizard2026RemoteDraftSync.test.ts | 188B79924C5A8D387A58D9ED3AFE6251E1E11AC9FFCECD759A1B694204CFE0F4 |
| AUTH_ADMIN_01_IMPLEMENTATION_REPORT.md | 2FC883011037F9FA192815F63318447A6A245DEEDFB2EAAC3A7F8349C256484C |
| AUTH_ADMIN_01_INDEPENDENT_REVIEW.md | 0B1D5CA371CBE0C08680F0EE84616FFAF8253A343E43E40333E73A197CC33E96 |
| AUTH_ADMIN_02A_IMPLEMENTATION_REPORT.md | A99FE6EC16921DDE2D36FB33B3021DED63E3ABCF6A984D584B80A6105ECD6C14 |
| AUTH_ADMIN_02A_INDEPENDENT_REVIEW.md | A2EE8D9B735193A05D472F459320BFBA80C751B888568666D13466A1E7133554 |
| AUTH_ADMIN_02B_IMPLEMENTATION_REPORT.md | 463D45AEF090B2E73AB8205176927A0838957002AD4A439A3395C2457CC9C194 |
| AUTH_ADMIN_02B_INDEPENDENT_REVIEW.md | F56F1F84D89561B1EA227736100C4E78A5AF8BC0C6153EDDECB2D823EF22302F |
| FAD_REPORT_READ_MODEL_IMPLEMENTATION_REPORT.md | 486504948F9C0B01D96F5EF0DAB7CBD7C3DF2F8C23C8115E079CA73E8281BE7F |
| FAD_REPORT_READ_MODEL_INDEPENDENT_REVIEW.md | 051384050C9E4A913624C75559F821306869FB2B4379CC2903EDF7BB2B02DB77 |
| ASTRA_FINAL_FINDINGS_RECONCILIATION.md | 97940094B8742D6BE5B5D24825F8F4F64030B50FFB310CDED7595C582AF82662 |
| ASTRA_FINAL_RECONCILIATION_INDEPENDENT_REVIEW.md | E524D2861CEDD89838D6923412CCDDF7506799B253F4B22FA4EE4D42B57F0F50 |

DATABASE_CHANGED = NO; MIGRATIONS_APPLIED = NO; STAGING_CONTACTED = NO; PRODUCTION_CONTACTED = NO.
GIT_ADD = NO; COMMIT = NO; PUSH = NO; PR = NO; DEPLOY = NO.

## Residual findings

- CANONICAL_FAD_XLSX: implementation complete and functional gates PASS; strict local PASS/CLOSED_LOCALLY withheld because NETWORK_ATTEMPTS = 0 was not satisfied.
- CALC-02 remains PARTIALLY_FIXED: summary PDF still uses its legacy path.
- NORM-01 remains PARTIALLY_FIXED until active PDF exporters migrate.
- NORM-02 remains PARTIALLY_FIXED.
- DOC-02 remains PARTIALLY_FIXED.
- ARCH-01 remains PARTIALLY_FIXED.
- FAD_REPORT_READ_MODEL, AUTH_ADMIN_01, AUTH_ADMIN_02A, AUTH_ADMIN_02B remain unchanged and previously CLOSED_LOCALLY; no reopening/refactoring.
- AUTH_ROLE_03, DELETE_CLEANUP_FINDING, AUTH_PROFILE_ROLE_PENDING_GATE remain untouched; profile-role migration APPLY_PENDING / LIVE_FIX_NOT_VERIFIED.
- RGS_SCHEMA_UNVERIFIED unchanged; no Tabella15/SICO/schema changes.
- No DOCUMENT_KIND_READINESS or new normative rules.

NEXT_GATE_RECOMMENDATION = CANONICAL_FAD_XLSX_INDEPENDENT_REVIEW.
STOP: no PDF migration, no readiness work, no other findings started.

## Appendix — exact working-tree PRE

Output of git status --short --untracked-files=all before modifications:

```text
 M src/__tests__/securityMigrations.test.ts
 M src/domain/documentProjection.ts
 M src/features/wizard2026/__tests__/wizard2026RemoteDraftSync.test.ts
 M src/presenters/reportPresenter.ts
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
