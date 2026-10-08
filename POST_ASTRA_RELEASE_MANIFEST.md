# POST ASTRA RELEASE MANIFEST

Data: 2026-10-07. GITHUB_RELEASE_FILESET = 821 files. Elenco completo proposto della versione repository, non script di staging/apply. I 818 membri PRE SHOULD_VERSION=YES sono legati ai SHA in [ASTRA_LOCAL_CONSOLIDATION_PREFLIGHT_REPORT.md](ASTRA_LOCAL_CONSOLIDATION_PREFLIGHT_REPORT.md); questi tre report portano totale a 821. I 1028 NO e 1 REVIEW PRE sono esclusi. Nessun secret, dump o temp in allowlist.

VERSION: package 1.3.0 / POST_ASTRA_LOCAL_CONSOLIDATION_RC_UNPUBLISHED. Non e stato assegnato un nuovo numero/tag/versione GitHub.

COMMIT GROUP: BASE_ORIGIN=gia su origin/main; EXISTING_LOCAL_COMMITS=gia nei sei commit locali non pubblicati; C1=nuovo SQL profile source + security test; C2=Edge triplet + tre test Auth; C3=app/domain/UI + test/fixture/golden; C4=report/history. Tutte le modifiche a un path gia committato sono rappresentate dalla versione finale e dal gruppo nuovo pertinente. Nessun git add/commit eseguito.

Nota di provenance (2026-10-08): il testo sopra conserva il piano PRE; C1-C4 sono ora commit locali preservati. C5 corregge esclusivamente il test-contract di src/__tests__/securityMigrations.test.ts (originariamente C1) e questa nota, separando A/B/C release obbligatorie dall'audit opzionale dei due bootstrap esclusi. Membership 821 path, allowlist 19 SQL e ordine DB/Edge/frontend invariati; COMMIT GROUP conserva la provenienza del consolidamento originario.

RELEASE ORDER e ordine logico runtime, non ordine di commit. DB solo dopo history/prechecks/backup e solo pending approvati; Edge Auth dopo canonical profile verification; frontend dopo DB/Edge. RAG/sync-users/baseline non ricevono un deploy automatico. Ordine e gate dettagliati in [PRODUCTION_DATABASE_ALIGNMENT_PLAN.md](PRODUCTION_DATABASE_ALIGNMENT_PLAN.md).

ASTRA_VERIFIED_PRODUCT_FILESET = 150 runtime/SQL/Edge path, esattamente marcati ASTRA_PRODUCT=YES nell'appendice locale. Test/supporti e baseline hanno membership release separata. Mantenere la storia dei sei commit esistenti; quattro nuovi proposti, 287 path PRE da consolidare + 3 report.


Baseline normativa gia tracked mantenuta: nessuna rimozione implicita di input/riferimenti/QA origin. Nuovo fileprogetto Analisi_* resta REVIEW escluso; nuovi PDF/XLSX non richiesti restano NO.

| FILE / UNIT | CATEGORY | COMMIT GROUP | RELEASE ORDER | DB DEPENDENCY | VERSION |
| --- | --- | --- | --- | --- | --- |
| .coderabbit.yaml | CONFIG | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| .editorconfig | CONFIG | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| .env.example | CONFIG | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| .eslintignore | CONFIG | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| .eslintrc.cjs | CONFIG | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| .gitignore | CONFIG | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| .prettierrc | CONFIG | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| .replit | CONFIG | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| ACCESSIBILITY_CONSOLIDATION_IMPLEMENTATION_REPORT.md | AUDIT_EVIDENCE | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| ACTIVE_LEGACY_ECONOMIC_AUTHORITY_RETIREMENT_IMPLEMENTATION_REPORT.md | AUDIT_EVIDENCE | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| ACTIVE_LEGACY_ECONOMIC_AUTHORITY_RETIREMENT_INDEPENDENT_REVIEW.md | AUDIT_EVIDENCE | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| ART23_DIRIGENZA_DERIVED_CONSUMPTION_IMPLEMENTATION_REPORT.md | AUDIT_EVIDENCE | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| ART23_DIRIGENZA_DERIVED_CONSUMPTION_IMPLEMENTATION_V2_REPORT.md | AUDIT_EVIDENCE | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| ART23_DIRIGENZA_DERIVED_CONSUMPTION_INDEPENDENT_REVIEW.md | AUDIT_EVIDENCE | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| ASTRA_25_FINDINGS_CURRENT_STATE_RECONCILIATION.md | AUDIT_EVIDENCE | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| ASTRA_25_FINDINGS_CURRENT_STATE_RECONCILIATION_INDEPENDENT_REVIEW.md | AUDIT_EVIDENCE | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| ASTRA_BASELINE_CHECKPOINT_REPORT.md | AUDIT_EVIDENCE | EXISTING_LOCAL_COMMITS | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| ASTRA_BASELINE_FORMAL_RECONCILIATION_REPORT.md | AUDIT_EVIDENCE | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| ASTRA_BASELINE_RECONSTRUCTION_INDEPENDENT_REVIEW.md | AUDIT_EVIDENCE | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| ASTRA_ENVIRONMENT_READY_REPORT.md | AUDIT_EVIDENCE | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| ASTRA_FINAL_FINDINGS_RECONCILIATION.md | AUDIT_EVIDENCE | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| ASTRA_FINAL_RECONCILIATION_INDEPENDENT_REVIEW.md | AUDIT_EVIDENCE | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| ASTRA_FINAL_RESIDUAL_INDEPENDENT_REVIEW.md | AUDIT_EVIDENCE | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| ASTRA_INITIAL_PROJECT_CLOSURE_REPORT.md | AUDIT_EVIDENCE | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| ASTRA_NORMATIVE_MATRIX.md | AUDIT_EVIDENCE | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| ASTRA_POST_RECONCILIATION_BASELINE_REVIEW.md | AUDIT_EVIDENCE | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| ASTRA_RESIDUAL_REMEDIATION_ROADMAP.md | AUDIT_EVIDENCE | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| ASTRA_RSU_AUDIT_REPORT.md | AUDIT_EVIDENCE | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| ASTRA_TEST_MATRIX.md | AUDIT_EVIDENCE | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| AUTH_ADMIN_01_IMPLEMENTATION_REPORT.md | AUDIT_EVIDENCE | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| AUTH_ADMIN_01_INDEPENDENT_REVIEW.md | AUDIT_EVIDENCE | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| AUTH_ADMIN_02A_IMPLEMENTATION_REPORT.md | AUDIT_EVIDENCE | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| AUTH_ADMIN_02A_INDEPENDENT_REVIEW.md | AUDIT_EVIDENCE | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| AUTH_ADMIN_02B_IMPLEMENTATION_REPORT.md | AUDIT_EVIDENCE | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| AUTH_ADMIN_02B_INDEPENDENT_REVIEW.md | AUDIT_EVIDENCE | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| CABINA_BLOCKING_ISSUE_PRIORITY_IMPLEMENTATION_REPORT.md | AUDIT_EVIDENCE | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| CABINA_BLOCKING_ISSUE_PRIORITY_INDEPENDENT_REVIEW.md | AUDIT_EVIDENCE | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| CALC02_DISTRIBUTION_CANONICAL_BUDGET_IMPLEMENTATION_REPORT.md | AUDIT_EVIDENCE | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| CALC02_FINAL_INDEPENDENT_CLOSURE_REVIEW.md | AUDIT_EVIDENCE | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| CANONICAL_FAD_XLSX_IMPLEMENTATION_REPORT.md | AUDIT_EVIDENCE | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| CANONICAL_FAD_XLSX_INDEPENDENT_REVIEW.md | AUDIT_EVIDENCE | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| CANONICAL_FUND_SUMMARY_PDF_IMPLEMENTATION_REPORT.md | AUDIT_EVIDENCE | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| CANONICAL_FUND_SUMMARY_PDF_INDEPENDENT_REVIEW.md | AUDIT_EVIDENCE | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| CCNL_RECOVERY_INSTRUCTION_IMPLEMENTATION_REPORT.md | AUDIT_EVIDENCE | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| CCNL_RECOVERY_INSTRUCTION_IMPLEMENTATION_V2_REPORT.md | AUDIT_EVIDENCE | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| CCNL_RECOVERY_INSTRUCTION_INDEPENDENT_REVIEW.md | AUDIT_EVIDENCE | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| CCNL_RECOVERY_INSTRUCTION_INDEPENDENT_REVIEW_ADDENDUM.md | AUDIT_EVIDENCE | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| CLOSURE_INSTRUCTION_READINESS_IMPLEMENTATION_REPORT.md | AUDIT_EVIDENCE | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| CLOSURE_INSTRUCTION_READINESS_INDEPENDENT_REVIEW.md | AUDIT_EVIDENCE | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| DISTRIBUTION_EXPLICIT_DRAFT_IMPLEMENTATION_REPORT.md | AUDIT_EVIDENCE | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| DISTRIBUTION_EXPLICIT_DRAFT_INDEPENDENT_REVIEW.md | AUDIT_EVIDENCE | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| DL25_COHERENT_REGIME_IMPLEMENTATION_REPORT.md | AUDIT_EVIDENCE | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| DL25_COHERENT_REGIME_IMPLEMENTATION_V2_REPORT.md | AUDIT_EVIDENCE | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| DL25_COHERENT_REGIME_INDEPENDENT_REVIEW.md | AUDIT_EVIDENCE | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| DOCUMENT_KIND_READINESS_IMPLEMENTATION_REPORT.md | AUDIT_EVIDENCE | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| DOCUMENT_KIND_READINESS_INDEPENDENT_REVIEW.md | AUDIT_EVIDENCE | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| EMPTY_FUND_INITIALIZATION_IMPLEMENTATION_REPORT.md | AUDIT_EVIDENCE | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| EMPTY_FUND_INITIALIZATION_INDEPENDENT_REVIEW.md | AUDIT_EVIDENCE | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| FAD_REPORT_READ_MODEL_IMPLEMENTATION_REPORT.md | AUDIT_EVIDENCE | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| FAD_REPORT_READ_MODEL_INDEPENDENT_REVIEW.md | AUDIT_EVIDENCE | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| MONETARY_INPUT_BOUNDARY_IMPLEMENTATION_REPORT.md | AUDIT_EVIDENCE | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| MONETARY_INPUT_BOUNDARY_IMPLEMENTATION_V2_REPORT.md | AUDIT_EVIDENCE | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| MONETARY_INPUT_BOUNDARY_INDEPENDENT_REVIEW.md | AUDIT_EVIDENCE | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| NORM_02_FORMAL_PROMOTION_AND_RESIDUAL_ROADMAP_REPORT.md | AUDIT_EVIDENCE | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| NORM_02_RECONCILIATION_REPORT.md | AUDIT_EVIDENCE | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| PNRR_ZERO_AND_MISSING_CAP_IMPLEMENTATION_REPORT.md | AUDIT_EVIDENCE | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| PNRR_ZERO_AND_MISSING_CAP_INDEPENDENT_REVIEW.md | AUDIT_EVIDENCE | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| PNRR_ZERO_AND_MISSING_CAP_REMEDIATION_REPORT.md | AUDIT_EVIDENCE | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| POST_CLOSE_N_PLUS_1_NAVIGATION_IMPLEMENTATION_REPORT.md | AUDIT_EVIDENCE | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| POST_CLOSE_N_PLUS_1_NAVIGATION_INDEPENDENT_REVIEW.md | AUDIT_EVIDENCE | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| PROVENANCE_METADATA_BOUNDARY_IMPLEMENTATION_REPORT.md | AUDIT_EVIDENCE | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| PROVENANCE_METADATA_BOUNDARY_INDEPENDENT_REVIEW.md | AUDIT_EVIDENCE | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| README.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| ROLE_ESCALATION_GATE_REPORT.md | AUDIT_EVIDENCE | EXISTING_LOCAL_COMMITS | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| SLICE_A_PROMOTION_AND_USER_SURFACE_CONSOLIDATION_REPORT.md | AUDIT_EVIDENCE | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| SUPABASE_REAL_RLS_GATE_REPORT.md | AUDIT_EVIDENCE | EXISTING_LOCAL_COMMITS | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| WAVE1_CLOSED_SNAPSHOT_IMPLEMENTATION_REPORT.md | AUDIT_EVIDENCE | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| WAVE1_CONSOLIDATION_REPORT.md | AUDIT_EVIDENCE | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| WAVE1_FINAL_HARDENING_REPORT.md | AUDIT_EVIDENCE | EXISTING_LOCAL_COMMITS | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| WAVE1_FINAL_REVIEW_REPORT.md | AUDIT_EVIDENCE | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| WAVE2_CANONICAL_LEDGER_IMPLEMENTATION_REPORT.md | AUDIT_EVIDENCE | EXISTING_LOCAL_COMMITS | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| WAVE2_CONSOLIDATION_REPORT.md | AUDIT_EVIDENCE | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| WAVE2_INDEPENDENT_REVIEW_REPORT.md | AUDIT_EVIDENCE | EXISTING_LOCAL_COMMITS | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| WAVE2_WORKLOG.md | AUDIT_EVIDENCE | EXISTING_LOCAL_COMMITS | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| WAVE3_ABSOLUTE_FINAL_GATE_REPORT.md | AUDIT_EVIDENCE | EXISTING_LOCAL_COMMITS | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| WAVE3_CONSOLIDATION_REPORT.md | AUDIT_EVIDENCE | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| WAVE3_DOCUMENT_CONSISTENCY_IMPLEMENTATION_REPORT.md | AUDIT_EVIDENCE | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| WAVE3_FINAL_DRAFT_FIX_REPORT.md | AUDIT_EVIDENCE | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| WAVE3_FINAL_GATE_REPORT.md | AUDIT_EVIDENCE | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| WAVE3_FINAL_HARDENING_REPORT.md | AUDIT_EVIDENCE | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| WAVE3_FINAL_INDEPENDENT_VERIFICATION_REPORT.md | AUDIT_EVIDENCE | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| WAVE3_FINAL_MICRO_GATE_REPORT.md | AUDIT_EVIDENCE | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| WAVE3_FINAL_WIRING_FIX_REPORT.md | AUDIT_EVIDENCE | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| WAVE3_INDEPENDENT_REVIEW_REPORT.md | AUDIT_EVIDENCE | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| WAVE3_SYSTEMIC_FIX_REPORT.md | AUDIT_EVIDENCE | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| WAVE3_TEST_ISOLATION_FIX_REPORT.md | AUDIT_EVIDENCE | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| clean_json.cjs | PRODUCTION_SOURCE | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| docs/allineamento-excel/MOD030_matrice_allineamento_excel_app.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/allineamento-excel/MOD031A_report_motore_art23_complessivo.md | AUDIT_EVIDENCE | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/allineamento-excel/MOD031B_fix_ui_eq_editabilita.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/allineamento-excel/MOD031B_report_allineamento_ui_motore_eq_segretario.md | AUDIT_EVIDENCE | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/allineamento-excel/MOD031C_audit_globale_persistenza_app.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/allineamento-excel/MOD031D_persistenza_locale_bozza.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/architecture/current-state.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/audit-logiche-calcolo/fondo_accessorio_personale_dipendente.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/audit-logiche-calcolo/fondo_dirigenza.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/audit-logiche-calcolo/fondo_elevate_qualificazioni.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/audit-logiche-calcolo/risorse_segretario_comunale.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/audit/ag124_final_checklist.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/audit/ag124_manual_test_report.md | AUDIT_EVIDENCE | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/audit/beta-1.2-post-release-check.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/audit/beta-1.2-smoke-test-funzionale.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/audit/excel_analysis_raw.txt | GENERATED_EVIDENCE | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| docs/audit/sprint-a-gap-parte-stabile.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/audit/sprint-a-gap-verifiche.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/audit/sprint-a-mappa-tecnica.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/audit/sprint-a-mappatura-excel.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/audit/sprint-a-mappatura-guida.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/audit/sprint-a-piano-guida-contestuale.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/audit/sprint-a-report-finale.md | AUDIT_EVIDENCE | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/audit/sprint-b1-audit-finale.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/audit/sprint-b2-audit-guida-contestuale.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/audit/sprint-b2-report-finale.md | AUDIT_EVIDENCE | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/audit/sprint-b3-audit-anti-doppio-conteggio-dl25.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/audit/sprint-b3-audit-correttivo.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/audit/sprint-b3-audit-finale-alias-dl25.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/audit/sprint-b3-audit-guida-voce-per-voce.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/audit/sprint-b3-chiusura-finale.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/audit/sprint-b3-piano-revisione-guida.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/audit/sprint-c1-audit-dati-generali-ente.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/audit/sprint-c1-confronto-excel-dati-generali.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/audit/sprint-c1-generatore-lettera-richiesta-dati.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/audit/sprint-c1-proposta-import-csv.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/audit/sprint-c1-proposta-nuovo-wizard-dati-generali.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/audit/sprint-c1-report-finale.md | AUDIT_EVIDENCE | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/audit/sprint-c2-implementation-plan-import-csv.md | AUDIT_EVIDENCE | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/audit/sprint-c2-mapping-csv-to-funddata.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/audit/sprint-c2-report-finale-import-csv.md | AUDIT_EVIDENCE | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/audit/sprint-c2-smoke-test-import-csv.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/audit/sprint-c2-task-list-import-csv.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/audit/sprint-c2-ui-preview-import.md | AUDIT_EVIDENCE | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/audit/sprint-c2-validation-rules.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/audit/sprint-c3-implementation-plan-generatore-lettera.md | AUDIT_EVIDENCE | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/audit/sprint-c3-mapping-dati-lettera.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/audit/sprint-c3-report-finale-generatore-lettera.md | AUDIT_EVIDENCE | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/audit/sprint-c3-task-list-generatore-lettera.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/audit/sprint-c4-0-matrice-completezza-wizard.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/audit/sprint-c4-0-proposta-finale-wizard.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/audit/sprint-c4-0-report-finale-audit-wizard.md | AUDIT_EVIDENCE | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/audit/sprint-c4-0-rischi-funzionali-wizard.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/audit/sprint-c4-0-verifica-csv-excel-wizard.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/audit/sprint-c4-1-report-finale-wizard-base.md | AUDIT_EVIDENCE | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/audit/sprint-c4-2-architettura-ingresso-configurazione-fondo.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/audit/sprint-c4-2-rischi-e-mitigazioni.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/audit/sprint-c4-2-verifica-flussi-utente.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/audit/sprint-c4-3-precheck-step-2016-2018.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/audit/sprint-c4-3-step-2016-2018-report.md | AUDIT_EVIDENCE | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/audit/sprint-c4-3-verifica-parita-funzionale.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/audit/sprint-c4-4-precheck-parametri-dl25-ccnl2026.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/audit/sprint-c4-4-report-step-5-6.md | AUDIT_EVIDENCE | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/audit/sprint-c4-4-rischi-e-mitigazioni.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/audit/sprint-c4-4-verifica-parita-funzionale.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/audit/sprint-c4-5-report-step-7-10.md | AUDIT_EVIDENCE | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/audit/sprint-c4-5-rischi-e-mitigazioni.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/audit/sprint-c4-5-verifica-coerenza-dati.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/audit/sprint-c4-5-verifica-completezza-funzionale.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/audit/sprint-c4-6-audit-completezza-wizard.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/audit/sprint-c4-implementation-plan-nuovo-wizard.md | AUDIT_EVIDENCE | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/audit/sprint-c4-mapping-step-wizard.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/audit/sprint-c4-prep-report.md | AUDIT_EVIDENCE | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/audit/sprint-c4-task-list-nuovo-wizard.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/audit/sprint-c4-validation-rules-wizard.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/audit_art79_consistenza_personale.md | PROJECT_DOCUMENTATION | C4 | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/audit_motore_normativo_2026.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/import/dati_generali_ente_csv_dictionary.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/normativa-implementation-plan.md | AUDIT_EVIDENCE | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/normativa-maintenance.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/normativa-pipeline.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/normativa-user-guide.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/refactoring/accesso-configurazione-fondo-preview.md | AUDIT_EVIDENCE | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/refactoring/accesso-preview-wizard-2026.md | AUDIT_EVIDENCE | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/refactoring/audit-tecnico-campi-fondo-art23.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/refactoring/collaudo-manuale-mod-011-bis-step3-dl25.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/refactoring/collaudo-normativo-wizard-2026.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/refactoring/collaudo-preview-wizard-2026.md | AUDIT_EVIDENCE | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/refactoring/collaudo-responsive-raccolta-dati-ente.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/refactoring/esito-collaudo-manuale-ui-wizard-2026.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/refactoring/funzioni-pure-wizard-2026.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/refactoring/lettera-richiesta-dati-raccolta-dati-ente.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/refactoring/mappa-wizard-fondo-dipendenti-2026.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/refactoring/matrice-campi-costituzione-fondo-art23.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/refactoring/mod-006-step1-ente-condizioni-cosfel.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/refactoring/mod-007-campi-si-no-prima-fascia.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/refactoring/mod-008-step2-limite-art23.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/refactoring/mod-010-restyling-step2-art23-fp-cgil.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/refactoring/mod-011-ter-correzioni-step3-dl25.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/refactoring/mod-012-step4-incrementi-ccnl-2026.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/refactoring/mod-018-step7-incremento-pnrr.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/refactoring/mod-019-step8-riepilogo-excel.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/refactoring/mod-021-transfer-preview-wizard-costituzione-fondo.md | AUDIT_EVIDENCE | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/refactoring/mod-022-trasferimento-controllato-wizard-costituzione-fondo.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/refactoring/mod-023-audit-costituzione-fondo-dipendenti-art23.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/refactoring/mod-024-matrice-operativa-costituzione-fondo-dipendenti.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/refactoring/mod-025-precheck-costituzione-fondo.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/refactoring/mod-026-collaudo-costituzione-fondo-dipendenti.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/refactoring/mod-027-correzione-art60-costituzione-fondo.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/refactoring/mod-028-collaudo-manuale-pre-pulizia.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/refactoring/modifiche-richieste-utente-wizard-2026.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/refactoring/preparazione-verifica-utente-wizard-2026.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/refactoring/report_mod028.md | AUDIT_EVIDENCE | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/refactoring/stato-draft-mapping-wizard-2026.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/refactoring/ui-preview-wizard-2026.md | AUDIT_EVIDENCE | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/refactoring/verifica-manuale-utente-wizard-2026.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/release/changelog-draft.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/release/checklist-pre-github.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/release/notifica-utenti-beta-1.2.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/release/release-candidate-pre-github.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/release/rischi-residui.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/validazione_casi_normativi_2026.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/walkthroughs/sprint-c3-walkthrough.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/walkthroughs/sprint-c4-1-walkthrough.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/walkthroughs/sprint-c4-2-walkthrough.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/walkthroughs/sprint-c4-3-walkthrough.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/walkthroughs/sprint-c4-4-walkthrough.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| docs/walkthroughs/sprint-c4-5-walkthrough.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| e2e/mod_037c8d.spec.ts | TEST | C3 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| e2e/mod_037c9_fix0.spec.ts | TEST | C3 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| e2e/mod_037d0_costituzione_fondo.spec.ts | TEST | C3 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| e2e/rel004-total-bar-sidebar.spec.ts | TEST | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| e2e/workflow.spec.ts | TEST | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| fileprogetto/Nuovi-Fondi-Salario-Accessorio-Funzioni-Locali-2026.xls | PROJECT_DOCUMENTATION | BASE_ORIGIN | 3 frontend / source baseline | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| fileprogetto/Verifica Fondo Salario Accessorio Enti Locali.md | PROJECT_DOCUMENTATION | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| fileprogetto/ccnl_funzioni_locali_raccoltasistematica_02042026.docx | PROJECT_DOCUMENTATION | BASE_ORIGIN | 3 frontend / source baseline | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| fileprogetto/ccnl_funzioni_locali_raccoltasistematica_def.docx | PROJECT_DOCUMENTATION | BASE_ORIGIN | 3 frontend / source baseline | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| fileprogetto/deep-research-report.md | AUDIT_EVIDENCE | BASE_ORIGIN | Repo documentary | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| fileprogetto/guidaccnlfunzionilocali07042026_def.pdf | GENERATED_EVIDENCE | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| fileprogetto/guidaccnlfunzionilocali07042026_giust.docx | PROJECT_DOCUMENTATION | BASE_ORIGIN | 3 frontend / source baseline | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| fileprogetto/hardening_guida.html | PROJECT_DOCUMENTATION | BASE_ORIGIN | 3 frontend / source baseline | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| fileprogetto/hardening_raccolta.html | PROJECT_DOCUMENTATION | BASE_ORIGIN | 3 frontend / source baseline | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| fileprogetto/pareri_aran_funzioni_locali.txt | GENERATED_EVIDENCE | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| fileprogetto/raw_guida_fixed.html | PROJECT_DOCUMENTATION | BASE_ORIGIN | 3 frontend / source baseline | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| fileprogetto/raw_mammoth_fixed.html | PROJECT_DOCUMENTATION | BASE_ORIGIN | 3 frontend / source baseline | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| fileprogetto/raw_mammoth_output.html | PROJECT_DOCUMENTATION | BASE_ORIGIN | 3 frontend / source baseline | Nessun runtime DB | 1.3.0 / POST_ASTRA RC |
| fileprogetto/tabella_concordanza_word_ccnl_funzioni_locali.csv | GENERATED_EVIDENCE | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| index.html | CONFIG | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| package-lock.json | CONFIG | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| package.json | CONFIG | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| playwright.config.ts | CONFIG | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| postcss.config.js | CONFIG | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| public/logo.png | PRODUCTION_SOURCE | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| public/normativa.json | PRODUCTION_SOURCE | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| qa/normativa/guida_da_rivedere.json | GENERATED_EVIDENCE | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| qa/normativa/pareri_aran_da_rivedere.json | GENERATED_EVIDENCE | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| qa/normativa/raccolta_da_rivedere.json | GENERATED_EVIDENCE | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| qa/normativa/raw_guida.html | FIXTURE | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| qa/normativa/raw_raccolta.html | FIXTURE | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| qa/normativa/raw_raccolta_test.html | FIXTURE | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| qa/normativa/raw_raccolta_test_utf8.html | FIXTURE | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| scripts/debug_cheerio.js | ORACLE | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| scripts/doc-ingestion/00_bootstrap_supabase.js | ORACLE | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| scripts/doc-ingestion/01_convert_docx_to_html.js | ORACLE | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| scripts/doc-ingestion/02_extract_raccolta.js | ORACLE | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| scripts/doc-ingestion/03_extract_guida.js | ORACLE | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| scripts/doc-ingestion/03b_extract_aran.js | ORACLE | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| scripts/doc-ingestion/03b_extract_aran_master.js | ORACLE | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| scripts/doc-ingestion/04_enrich_metadata.js | ORACLE | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| scripts/doc-ingestion/04_extract_indice.js | ORACLE | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| scripts/doc-ingestion/05_build_indexes.js | ORACLE | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| scripts/doc-ingestion/06_match_pareri.js | ORACLE | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| scripts/doc-ingestion/06_validate_outputs.js | ORACLE | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| scripts/doc-ingestion/07_stage_new_pareri.js | ORACLE | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| scripts/doc-ingestion/08_publish_approved.js | ORACLE | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| scripts/doc-ingestion/09_reconcile_legacy_aliases.js | ORACLE | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| scripts/doc-ingestion/10_import_legacy_json.js | ORACLE | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| scripts/doc-ingestion/reports/aran_qa.json | ORACLE | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| scripts/doc-ingestion/reports/guida_qa.json | ORACLE | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| scripts/doc-ingestion/reports/indice_qa.json | ORACLE | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| scripts/doc-ingestion/reports/matching_report.json | ORACLE | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| scripts/doc-ingestion/reports/publishing_report.json | ORACLE | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| scripts/doc-ingestion/reports/raccolta_qa.json | ORACLE | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| scripts/doc-ingestion/reports/reconciliation_report.json | ORACLE | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| scripts/generate_golden.ts | GOLDEN | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| scripts/insert_test_doc_rag.ts | ORACLE | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| scripts/popola_rag.ts | ORACLE | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| scripts/run_regression_tests.ts | ORACLE | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| scripts/run_wave2_oracle.ts | ORACLE | EXISTING_LOCAL_COMMITS | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| scripts/test_edge_function.ts | ORACLE | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| scripts/update_memoria.cjs | ORACLE | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| scripts/update_types.cjs | ORACLE | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| scripts/verify_fixtures.ts | FIXTURE | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/App.tsx | PRODUCTION_UI | BASE_ORIGIN | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/__tests__/appMockResidui.test.tsx | TEST | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/__tests__/appPendingDraft.test.ts | TEST | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/__tests__/appWizardRouting.test.ts | TEST | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/__tests__/bootstrap.smoke.test.tsx | TEST | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/__tests__/createUserAdminAuthorization.test.ts | TEST | C2 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/__tests__/deleteUserCanonicalAuthorization.test.ts | TEST | C2 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/__tests__/fondoAutosave.test.ts | TEST | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/__tests__/localDraftPersistence.test.ts | TEST | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/__tests__/remoteDraftsConfig.test.ts | TEST | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/__tests__/rlsPolicySimulation.test.ts | TEST | EXISTING_LOCAL_COMMITS | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/__tests__/securityMigrations.test.ts | TEST | C1 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/__tests__/updatePasswordCanonicalAuthorization.test.ts | TEST | C2 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/__tests__/uxPrototypeAudit.test.ts | TEST | EXISTING_LOCAL_COMMITS | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/__tests__/wave1ClosedSnapshot.test.ts | TEST | EXISTING_LOCAL_COMMITS | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/__tests__/wizardTransfer.test.tsx | TEST | C3 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/application/__tests__/accessMatrix.test.ts | TEST | BASE_ORIGIN | 3 frontend / source baseline | profiles/entities/user_app_state + RPC; drafts se enabled | 1.3.0 / POST_ASTRA RC |
| src/application/__tests__/authorizationPolicy.test.ts | TEST | C3 | 3 frontend / source baseline | profiles/entities/user_app_state + RPC; drafts se enabled | 1.3.0 / POST_ASTRA RC |
| src/application/__tests__/contextRace.test.ts | TEST | BASE_ORIGIN | 3 frontend / source baseline | profiles/entities/user_app_state + RPC; drafts se enabled | 1.3.0 / POST_ASTRA RC |
| src/application/__tests__/dl25Snapshot.test.ts | TEST | C3 | 3 frontend / source baseline | profiles/entities/user_app_state + RPC; drafts se enabled | 1.3.0 / POST_ASTRA RC |
| src/application/__tests__/fundWorkflow.test.ts | TEST | BASE_ORIGIN | 3 frontend / source baseline | profiles/entities/user_app_state + RPC; drafts se enabled | 1.3.0 / POST_ASTRA RC |
| src/application/__tests__/provenanceBoundary.integration.test.ts | TEST | C3 | 3 frontend / source baseline | profiles/entities/user_app_state + RPC; drafts se enabled | 1.3.0 / POST_ASTRA RC |
| src/application/__tests__/snapshotWorkflow.test.ts | TEST | BASE_ORIGIN | 3 frontend / source baseline | profiles/entities/user_app_state + RPC; drafts se enabled | 1.3.0 / POST_ASTRA RC |
| src/application/__tests__/stateWorkflow.test.ts | TEST | BASE_ORIGIN | 3 frontend / source baseline | profiles/entities/user_app_state + RPC; drafts se enabled | 1.3.0 / POST_ASTRA RC |
| src/application/__tests__/userWorkflow.test.ts | TEST | BASE_ORIGIN | 3 frontend / source baseline | profiles/entities/user_app_state + RPC; drafts se enabled | 1.3.0 / POST_ASTRA RC |
| src/application/__tests__/wizard2026RemoteDraftRepository.test.ts | TEST | C3 | 3 frontend / source baseline | profiles/entities/user_app_state + RPC; drafts se enabled | 1.3.0 / POST_ASTRA RC |
| src/application/__tests__/yearClosure.test.ts | TEST | BASE_ORIGIN | 3 frontend / source baseline | profiles/entities/user_app_state + RPC; drafts se enabled | 1.3.0 / POST_ASTRA RC |
| src/application/fundWorkflow.ts | APPLICATION_LOGIC | BASE_ORIGIN | 3 frontend / source baseline | profiles/entities/user_app_state + RPC; drafts se enabled | 1.3.0 / POST_ASTRA RC |
| src/application/index.ts | APPLICATION_LOGIC | BASE_ORIGIN | 3 frontend / source baseline | profiles/entities/user_app_state + RPC; drafts se enabled | 1.3.0 / POST_ASTRA RC |
| src/application/input/__tests__/inputNormalizerArt23Fte.test.ts | TEST | BASE_ORIGIN | 3 frontend / source baseline | profiles/entities/user_app_state + RPC; drafts se enabled | 1.3.0 / POST_ASTRA RC |
| src/application/input/hydrateFundData.ts | APPLICATION_LOGIC | C3 | 3 frontend / source baseline | profiles/entities/user_app_state + RPC; drafts se enabled | 1.3.0 / POST_ASTRA RC |
| src/application/input/inputNormalizer.ts | APPLICATION_LOGIC | C3 | 3 frontend / source baseline | profiles/entities/user_app_state + RPC; drafts se enabled | 1.3.0 / POST_ASTRA RC |
| src/application/input/monetaryProcessingSafety.ts | APPLICATION_LOGIC | C3 | 3 frontend / source baseline | profiles/entities/user_app_state + RPC; drafts se enabled | 1.3.0 / POST_ASTRA RC |
| src/application/localDraftStorage.ts | APPLICATION_LOGIC | C3 | 3 frontend / source baseline | profiles/entities/user_app_state + RPC; drafts se enabled | 1.3.0 / POST_ASTRA RC |
| src/application/policies/authorizationPolicy.ts | APPLICATION_LOGIC | C3 | 3 frontend / source baseline | profiles/entities/user_app_state + RPC; drafts se enabled | 1.3.0 / POST_ASTRA RC |
| src/application/ports/IEntityRepository.ts | APPLICATION_LOGIC | BASE_ORIGIN | 3 frontend / source baseline | profiles/entities/user_app_state + RPC; drafts se enabled | 1.3.0 / POST_ASTRA RC |
| src/application/ports/IInteractionService.ts | APPLICATION_LOGIC | BASE_ORIGIN | 3 frontend / source baseline | profiles/entities/user_app_state + RPC; drafts se enabled | 1.3.0 / POST_ASTRA RC |
| src/application/ports/IStateRepository.ts | APPLICATION_LOGIC | BASE_ORIGIN | 3 frontend / source baseline | profiles/entities/user_app_state + RPC; drafts se enabled | 1.3.0 / POST_ASTRA RC |
| src/application/ports/IUserRepository.ts | APPLICATION_LOGIC | BASE_ORIGIN | 3 frontend / source baseline | profiles/entities/user_app_state + RPC; drafts se enabled | 1.3.0 / POST_ASTRA RC |
| src/application/ports/IWizard2026DraftRepository.ts | APPLICATION_LOGIC | BASE_ORIGIN | 3 frontend / source baseline | profiles/entities/user_app_state + RPC; drafts se enabled | 1.3.0 / POST_ASTRA RC |
| src/application/ports/index.ts | APPLICATION_LOGIC | BASE_ORIGIN | 3 frontend / source baseline | profiles/entities/user_app_state + RPC; drafts se enabled | 1.3.0 / POST_ASTRA RC |
| src/application/registry/moduleRegistry.ts | APPLICATION_LOGIC | BASE_ORIGIN | 3 frontend / source baseline | profiles/entities/user_app_state + RPC; drafts se enabled | 1.3.0 / POST_ASTRA RC |
| src/application/snapshots/dl25NextAnnuality.ts | APPLICATION_LOGIC | C3 | 3 frontend / source baseline | profiles/entities/user_app_state + RPC; drafts se enabled | 1.3.0 / POST_ASTRA RC |
| src/application/snapshots/snapshotWorkflow.ts | APPLICATION_LOGIC | C3 | 3 frontend / source baseline | profiles/entities/user_app_state + RPC; drafts se enabled | 1.3.0 / POST_ASTRA RC |
| src/application/stateWorkflow.ts | APPLICATION_LOGIC | C3 | 3 frontend / source baseline | profiles/entities/user_app_state + RPC; drafts se enabled | 1.3.0 / POST_ASTRA RC |
| src/application/userWorkflow.ts | APPLICATION_LOGIC | BASE_ORIGIN | 3 frontend / source baseline | profiles/entities/user_app_state + RPC; drafts se enabled | 1.3.0 / POST_ASTRA RC |
| src/application/wizard2026RemoteDraftRepository.ts | APPLICATION_LOGIC | C3 | 3 frontend / source baseline | profiles/entities/user_app_state + RPC; drafts se enabled | 1.3.0 / POST_ASTRA RC |
| src/application/yearClosureWorkflow.ts | APPLICATION_LOGIC | C3 | 3 frontend / source baseline | profiles/entities/user_app_state + RPC; drafts se enabled | 1.3.0 / POST_ASTRA RC |
| src/components/ErrorBoundary.tsx | PRODUCTION_UI | BASE_ORIGIN | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/components/Hello.tsx | PRODUCTION_UI | BASE_ORIGIN | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/components/admin/RagDocumentManager.tsx | PRODUCTION_UI | BASE_ORIGIN | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/components/areaFondo/AreaFondoContextBar.tsx | PRODUCTION_UI | C3 | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/components/areaFondo/AreaFondoSidebar.tsx | PRODUCTION_UI | C3 | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/components/areaFondo/__tests__/userSurfaceContext.test.tsx | TEST | C3 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/components/chatbot/ChatMessage.tsx | PRODUCTION_UI | BASE_ORIGIN | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/components/chatbot/ChatWidget.tsx | PRODUCTION_UI | BASE_ORIGIN | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/components/chatbot/ChatWindow.tsx | PRODUCTION_UI | BASE_ORIGIN | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/components/compensatore/CompensatoreInputForm.tsx | PRODUCTION_UI | C3 | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/components/compensatore/CompensatoreRiepilogo.tsx | PRODUCTION_UI | BASE_ORIGIN | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/components/dashboard/ComplianceStatusWidget.tsx | PRODUCTION_UI | BASE_ORIGIN | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/components/dashboard/ContractedResourcesChart.tsx | PRODUCTION_UI | BASE_ORIGIN | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/components/dashboard/CustomChartTooltip.tsx | PRODUCTION_UI | BASE_ORIGIN | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/components/dashboard/DashboardSummary.tsx | PRODUCTION_UI | BASE_ORIGIN | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/components/dashboard/FundAllocationChart.tsx | PRODUCTION_UI | BASE_ORIGIN | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/components/dashboard/HomePageSkeleton.tsx | PRODUCTION_UI | BASE_ORIGIN | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/components/dashboard/__tests__/ComplianceStatusWidget.navigation.test.tsx | TEST | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/components/dataInput/AnnualDataForm.tsx | PRODUCTION_UI | C3 | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/components/dataInput/Art23EmployeeAndIncrementForm.tsx | PRODUCTION_UI | C3 | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/components/dataInput/Ccnl2024SettingsForm.tsx | PRODUCTION_UI | C3 | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/components/dataInput/Dl25CarryForwardFields.tsx | PRODUCTION_UI | C3 | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/components/dataInput/Dl25FinancialSummary.tsx | PRODUCTION_UI | C3 | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/components/dataInput/EmployeeCountsForm.tsx | PRODUCTION_UI | BASE_ORIGIN | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/components/dataInput/EntityGeneralInfoForm.tsx | PRODUCTION_UI | BASE_ORIGIN | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/components/dataInput/HistoricalDataForm.tsx | PRODUCTION_UI | C3 | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/components/dataInput/ProventiSpecificiForm.tsx | PRODUCTION_UI | C3 | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/components/dataInput/SimulatoreIncrementoForm.tsx | PRODUCTION_UI | C3 | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/components/import/CsvImportModal.tsx | PRODUCTION_UI | BASE_ORIGIN | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/components/import/ImportErrorReport.tsx | PRODUCTION_UI | BASE_ORIGIN | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/components/import/ImportPreviewTable.tsx | PRODUCTION_UI | BASE_ORIGIN | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/components/layout/Header.tsx | PRODUCTION_UI | C3 | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/components/layout/MainLayout.tsx | PRODUCTION_UI | C3 | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/components/layout/Sidebar.tsx | PRODUCTION_UI | BASE_ORIGIN | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/components/letters/RequestDataLetterActions.tsx | PRODUCTION_UI | BASE_ORIGIN | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/components/letters/RequestDataLetterModal.tsx | PRODUCTION_UI | BASE_ORIGIN | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/components/letters/RequestDataLetterPreview.tsx | PRODUCTION_UI | BASE_ORIGIN | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/components/modals/IvcConglobationModal.tsx | PRODUCTION_UI | BASE_ORIGIN | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/components/normativa/ArticoloViewer.tsx | PRODUCTION_UI | BASE_ORIGIN | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/components/normativa/NormativaSearchBar.tsx | PRODUCTION_UI | BASE_ORIGIN | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/components/normativa/NormeCollegatePanel.tsx | PRODUCTION_UI | BASE_ORIGIN | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/components/normativa/SchedaGuidaViewer.tsx | PRODUCTION_UI | BASE_ORIGIN | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/components/shared/Alert.tsx | PRODUCTION_UI | BASE_ORIGIN | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/components/shared/Button.tsx | PRODUCTION_UI | BASE_ORIGIN | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/components/shared/Card.tsx | PRODUCTION_UI | C3 | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/components/shared/Checkbox.tsx | PRODUCTION_UI | BASE_ORIGIN | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/components/shared/EmptyState.tsx | PRODUCTION_UI | BASE_ORIGIN | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/components/shared/ExcelTools.tsx | PRODUCTION_UI | BASE_ORIGIN | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/components/shared/Fallback.tsx | PRODUCTION_UI | BASE_ORIGIN | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/components/shared/FundingItem.tsx | PRODUCTION_UI | C3 | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/components/shared/Input.tsx | PRODUCTION_UI | C3 | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/components/shared/LoadingSpinner.tsx | PRODUCTION_UI | BASE_ORIGIN | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/components/shared/Modal.tsx | PRODUCTION_UI | C3 | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/components/shared/MonetaryInput.tsx | PRODUCTION_UI | C3 | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/components/shared/NormativaPopover.tsx | PRODUCTION_UI | C3 | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/components/shared/ProvenancePanel.tsx | PRODUCTION_UI | C3 | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/components/shared/Select.tsx | PRODUCTION_UI | BASE_ORIGIN | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/components/shared/Skeleton.tsx | PRODUCTION_UI | BASE_ORIGIN | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/components/shared/Table.tsx | PRODUCTION_UI | BASE_ORIGIN | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/components/shared/UserSearchSelect.tsx | PRODUCTION_UI | BASE_ORIGIN | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/components/shared/__tests__/accessibilityPrimitives.test.tsx | TEST | C3 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/components/shared/__tests__/monetaryInput.test.tsx | TEST | C3 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/constants.ts | PRODUCTION_SOURCE | C3 | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| src/contexts/AppContext.tsx | PRODUCTION_UI | C3 | 3 frontend / source baseline | profiles/entities/user_app_state + RPC; drafts se enabled | 1.3.0 / POST_ASTRA RC |
| src/contexts/AuthContext.tsx | PRODUCTION_UI | BASE_ORIGIN | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/contexts/__tests__/AppContext.antiContamination.test.ts | TEST | C3 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/contexts/__tests__/AppContext.closedHardening.test.ts | TEST | C3 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/contexts/__tests__/AppContext.emptyInitialization.test.tsx | TEST | C3 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/contexts/__tests__/AppContext.idempotentHydration.test.ts | TEST | EXISTING_LOCAL_COMMITS | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/contexts/__tests__/closureInstructionReadiness.integration.test.tsx | TEST | C3 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/contexts/__tests__/monetaryBoundary.integration.test.tsx | TEST | C3 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/contexts/__tests__/postCloseNavigation.integration.test.tsx | TEST | C3 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/data/normativa/aran.pareri.json | PRODUCTION_SOURCE | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| src/data/normativa/guida.schede.json | PRODUCTION_SOURCE | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| src/data/normativa/guida.sezioni.json | PRODUCTION_SOURCE | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| src/data/normativa/normativa.indiceAnalitico.json | PRODUCTION_SOURCE | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| src/data/normativa/normativa.searchIndex.json | PRODUCTION_SOURCE | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| src/data/normativa/raccolta.articles.json | PRODUCTION_SOURCE | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| src/data/normativa/raccolta.toc.json | PRODUCTION_SOURCE | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| src/data/normativa/riferimenti.esterni.json | PRODUCTION_SOURCE | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| src/data/strutturaFondo.json | PRODUCTION_SOURCE | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| src/domain/__tests__/emptyFundInitialization.test.ts | TEST | C3 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/domain/__tests__/entityClassification.test.ts | TEST | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/domain/__tests__/fadReportReadModel.test.ts | TEST | C3 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/domain/__tests__/monetaryBoundary.test.ts | TEST | C3 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/domain/__tests__/provenance.test.ts | TEST | C3 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/domain/appState.ts | DOMAIN_LOGIC | BASE_ORIGIN | 3 frontend / source baseline | JSON contracts; nessun DDL diretto | 1.3.0 / POST_ASTRA RC |
| src/domain/calculationResult.ts | DOMAIN_LOGIC | C3 | 3 frontend / source baseline | JSON contracts; nessun DDL diretto | 1.3.0 / POST_ASTRA RC |
| src/domain/canonicalFadProjection.ts | DOMAIN_LOGIC | C3 | 3 frontend / source baseline | JSON contracts; nessun DDL diretto | 1.3.0 / POST_ASTRA RC |
| src/domain/canonicalFundLedger.ts | DOMAIN_LOGIC | EXISTING_LOCAL_COMMITS | 3 frontend / source baseline | JSON contracts; nessun DDL diretto | 1.3.0 / POST_ASTRA RC |
| src/domain/ccnlRecovery.ts | DOMAIN_LOGIC | C3 | 3 frontend / source baseline | JSON contracts; nessun DDL diretto | 1.3.0 / POST_ASTRA RC |
| src/domain/dirigenzaArt23.ts | DOMAIN_LOGIC | C3 | 3 frontend / source baseline | JSON contracts; nessun DDL diretto | 1.3.0 / POST_ASTRA RC |
| src/domain/dl25.ts | DOMAIN_LOGIC | C3 | 3 frontend / source baseline | JSON contracts; nessun DDL diretto | 1.3.0 / POST_ASTRA RC |
| src/domain/documentKindReadiness.ts | DOMAIN_LOGIC | C3 | 3 frontend / source baseline | JSON contracts; nessun DDL diretto | 1.3.0 / POST_ASTRA RC |
| src/domain/documentProjection.ts | DOMAIN_LOGIC | C3 | 3 frontend / source baseline | JSON contracts; nessun DDL diretto | 1.3.0 / POST_ASTRA RC |
| src/domain/emptyFund.ts | DOMAIN_LOGIC | C3 | 3 frontend / source baseline | JSON contracts; nessun DDL diretto | 1.3.0 / POST_ASTRA RC |
| src/domain/entity.ts | DOMAIN_LOGIC | BASE_ORIGIN | 3 frontend / source baseline | JSON contracts; nessun DDL diretto | 1.3.0 / POST_ASTRA RC |
| src/domain/entityClassification.ts | DOMAIN_LOGIC | BASE_ORIGIN | 3 frontend / source baseline | JSON contracts; nessun DDL diretto | 1.3.0 / POST_ASTRA RC |
| src/domain/enums.ts | DOMAIN_LOGIC | BASE_ORIGIN | 3 frontend / source baseline | JSON contracts; nessun DDL diretto | 1.3.0 / POST_ASTRA RC |
| src/domain/feedback.ts | DOMAIN_LOGIC | BASE_ORIGIN | 3 frontend / source baseline | JSON contracts; nessun DDL diretto | 1.3.0 / POST_ASTRA RC |
| src/domain/index.ts | DOMAIN_LOGIC | BASE_ORIGIN | 3 frontend / source baseline | JSON contracts; nessun DDL diretto | 1.3.0 / POST_ASTRA RC |
| src/domain/monetaryBoundary.ts | DOMAIN_LOGIC | C3 | 3 frontend / source baseline | JSON contracts; nessun DDL diretto | 1.3.0 / POST_ASTRA RC |
| src/domain/monetaryPolicies.ts | DOMAIN_LOGIC | C3 | 3 frontend / source baseline | JSON contracts; nessun DDL diretto | 1.3.0 / POST_ASTRA RC |
| src/domain/normalizedInput.ts | DOMAIN_LOGIC | C3 | 3 frontend / source baseline | JSON contracts; nessun DDL diretto | 1.3.0 / POST_ASTRA RC |
| src/domain/normative.ts | DOMAIN_LOGIC | BASE_ORIGIN | 3 frontend / source baseline | JSON contracts; nessun DDL diretto | 1.3.0 / POST_ASTRA RC |
| src/domain/provenance.ts | DOMAIN_LOGIC | C3 | 3 frontend / source baseline | JSON contracts; nessun DDL diretto | 1.3.0 / POST_ASTRA RC |
| src/domain/snapshot.ts | DOMAIN_LOGIC | C3 | 3 frontend / source baseline | JSON contracts; nessun DDL diretto | 1.3.0 / POST_ASTRA RC |
| src/domain/tabella15.ts | DOMAIN_LOGIC | BASE_ORIGIN | 3 frontend / source baseline | JSON contracts; nessun DDL diretto | 1.3.0 / POST_ASTRA RC |
| src/domain/types.ts | DOMAIN_LOGIC | C3 | 3 frontend / source baseline | JSON contracts; nessun DDL diretto | 1.3.0 / POST_ASTRA RC |
| src/domain/user.ts | DOMAIN_LOGIC | BASE_ORIGIN | 3 frontend / source baseline | JSON contracts; nessun DDL diretto | 1.3.0 / POST_ASTRA RC |
| src/domain/valueObjects.ts | DOMAIN_LOGIC | BASE_ORIGIN | 3 frontend / source baseline | JSON contracts; nessun DDL diretto | 1.3.0 / POST_ASTRA RC |
| src/enums.ts | PRODUCTION_SOURCE | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/__tests__/dl25Coherent.contract.test.ts | TEST | C3 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/__tests__/dl25TestData.ts | FIXTURE | C3 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/__tests__/legacyArt79Migration.test.ts | TEST | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/__tests__/mappingPreview.test.ts | TEST | C3 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/__tests__/monetaryMutation.test.ts | TEST | C3 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/__tests__/reducer.test.ts | TEST | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/__tests__/selectors.test.ts | TEST | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/__tests__/validation.test.ts | TEST | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/__tests__/wizard2026Art33PolicyGate.test.ts | TEST | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/__tests__/wizard2026NormativeScenarios.test.ts | TEST | C3 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/__tests__/wizard2026Persistence.test.ts | TEST | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/__tests__/wizard2026RemoteDraftSync.test.ts | TEST | C3 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/components/Wizard2026CheckList.tsx | PRODUCTION_UI | BASE_ORIGIN | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/components/Wizard2026FieldHelp.tsx | PRODUCTION_UI | BASE_ORIGIN | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/components/Wizard2026InfoBox.tsx | PRODUCTION_UI | BASE_ORIGIN | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/components/Wizard2026Layout.tsx | PRODUCTION_UI | C3 | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/components/Wizard2026NavigationButtons.tsx | PRODUCTION_UI | BASE_ORIGIN | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/components/Wizard2026PreviewPage.tsx | PRODUCTION_UI | C3 | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/components/Wizard2026PreviewWrapper.tsx | PRODUCTION_UI | BASE_ORIGIN | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/components/Wizard2026ResultCard.tsx | PRODUCTION_UI | BASE_ORIGIN | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/components/Wizard2026StepHeader.tsx | PRODUCTION_UI | BASE_ORIGIN | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/components/Wizard2026Stepper.tsx | PRODUCTION_UI | C3 | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/components/Wizard2026SummaryPanel.tsx | PRODUCTION_UI | C3 | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/components/Wizard2026SyncStatusBadge.tsx | PRODUCTION_UI | BASE_ORIGIN | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/components/Wizard2026YesNoField.tsx | PRODUCTION_UI | C3 | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/components/__tests__/Wizard2026PreviewPage.test.tsx | TEST | C3 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/components/__tests__/Wizard2026PreviewWrapper.test.tsx | TEST | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/components/__tests__/Wizard2026Stepper.test.tsx | TEST | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/components/__tests__/Wizard2026SummaryPanel.test.tsx | TEST | C3 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/components/index.ts | PRODUCTION_SOURCE | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/dl25Contract.ts | PRODUCTION_SOURCE | C3 | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/entry/FundConfigurationPreviewEntryPage.tsx | PRODUCTION_UI | BASE_ORIGIN | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/entry/Wizard2026StandaloneLayout.tsx | PRODUCTION_UI | BASE_ORIGIN | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/entry/detectFundDataPresence.ts | PRODUCTION_SOURCE | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/excel/__tests__/wizard2026Excel.test.ts | TEST | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/excel/exportWizard2026Excel.ts | PRODUCTION_SOURCE | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/excel/importWizard2026Excel.ts | PRODUCTION_SOURCE | C3 | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/excel/wizard2026ExcelSchema.ts | PRODUCTION_SOURCE | C3 | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/featureFlag.ts | PRODUCTION_SOURCE | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/hooks/useWizard2026Draft.ts | PRODUCTION_SOURCE | C3 | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/hooks/useWizard2026RemoteDraftSync.ts | PRODUCTION_SOURCE | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/index.ts | PRODUCTION_SOURCE | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/initialState.ts | PRODUCTION_SOURCE | C3 | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/letters/__tests__/wizard2026Letters.test.tsx | TEST | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/letters/buildWizard2026LetterContext.ts | PRODUCTION_SOURCE | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/letters/components/Wizard2026DataRequestActions.tsx | PRODUCTION_UI | BASE_ORIGIN | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/letters/components/Wizard2026DataRequestModal.tsx | PRODUCTION_UI | C3 | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/letters/components/Wizard2026DataRequestPanel.tsx | PRODUCTION_UI | BASE_ORIGIN | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/letters/components/Wizard2026DataRequestPreview.tsx | PRODUCTION_UI | BASE_ORIGIN | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/letters/generateWizard2026DataRequestMarkdown.ts | PRODUCTION_SOURCE | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/letters/generateWizard2026DataRequestPdf.ts | PRODUCTION_SOURCE | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/letters/index.ts | PRODUCTION_SOURCE | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/letters/wizard2026LetterCatalog.ts | PRODUCTION_SOURCE | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/letters/wizard2026LetterTypes.ts | PRODUCTION_SOURCE | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/mappingPreview.ts | PRODUCTION_SOURCE | C3 | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/migrations/legacyArt79.ts | PRODUCTION_SOURCE | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/reducer.ts | PRODUCTION_SOURCE | C3 | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/remoteDraft/config.ts | PRODUCTION_SOURCE | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/remoteDraft/types.ts | PRODUCTION_SOURCE | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/remoteDraft/validation.ts | PRODUCTION_SOURCE | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/selectors.ts | PRODUCTION_SOURCE | C3 | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/steps/CcnlRecoveryEditor.tsx | PRODUCTION_UI | C3 | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/steps/Step1EnteCondizioni.tsx | PRODUCTION_UI | C3 | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/steps/Step2Art23Limite.tsx | PRODUCTION_UI | C3 | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/steps/Step3Dl25.tsx | PRODUCTION_UI | C3 | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/steps/Step4Ccnl2026.tsx | PRODUCTION_UI | C3 | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/steps/Step5ConglobamentoArt60.tsx | PRODUCTION_UI | C3 | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/steps/Step6Straordinario.tsx | PRODUCTION_UI | C3 | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/steps/Step7Pnrr.tsx | PRODUCTION_UI | C3 | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/steps/Step8RiepilogoPreview.tsx | PRODUCTION_UI | C3 | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/steps/__tests__/Step1EnteCondizioni.test.tsx | TEST | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/steps/__tests__/Step2Art23Limite.test.tsx | TEST | C3 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/steps/__tests__/Step3Dl25.test.tsx | TEST | C3 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/steps/__tests__/Step4Ccnl2026.test.tsx | TEST | C3 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/steps/__tests__/Step6Straordinario.test.tsx | TEST | C3 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/steps/__tests__/Step7Pnrr.faculty.test.tsx | TEST | C3 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/steps/__tests__/Step7Pnrr.test.tsx | TEST | C3 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/steps/__tests__/Step8RiepilogoPreview.test.tsx | TEST | C3 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/steps/__tests__/ccnlRecoveryEditor.test.tsx | TEST | C3 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/steps/__tests__/dl25CrossView.test.tsx | TEST | C3 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/steps/index.ts | PRODUCTION_SOURCE | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/transfer/Wizard2026TransferModal.tsx | PRODUCTION_UI | C3 | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/transfer/WizardTransferAction.tsx | PRODUCTION_UI | C3 | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/transfer/__tests__/art23FteTransferCharacterization.test.ts | TEST | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/transfer/__tests__/art79c1cSafety.test.ts | TEST | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/transfer/__tests__/audit_motore_2026_characterization.test.ts | TEST | C3 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/transfer/__tests__/normative_engine_2026_validation_cases.test.ts | TEST | C3 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/transfer/__tests__/transferPreviewEngine.test.ts | TEST | C3 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/transfer/__tests__/userSurface.integration.test.tsx | TEST | C3 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/transfer/applyWizard2026Transfer.ts | PRODUCTION_SOURCE | C3 | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/transfer/transferAction.ts | PRODUCTION_SOURCE | C3 | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/transfer/transferPreviewEngine.ts | PRODUCTION_SOURCE | C3 | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/types.ts | PRODUCTION_SOURCE | C3 | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| src/features/wizard2026/validation.ts | PRODUCTION_SOURCE | C3 | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| src/hooks/useComplianceChecks.ts | PRODUCTION_SOURCE | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| src/hooks/useFundCalculations.ts | PRODUCTION_SOURCE | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| src/hooks/useFundDataAutosave.ts | PRODUCTION_SOURCE | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| src/hooks/useNormativeData.ts | PRODUCTION_SOURCE | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| src/hooks/useSimulatoreCalculations.ts | PRODUCTION_SOURCE | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| src/index.css | PRODUCTION_SOURCE | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| src/index.tsx | PRODUCTION_UI | BASE_ORIGIN | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/infrastructure/browser/BrowserInteractionService.ts | PRODUCTION_SOURCE | BASE_ORIGIN | 3 frontend / source baseline | profiles/entities/user_app_state + RPC; drafts se enabled | 1.3.0 / POST_ASTRA RC |
| src/infrastructure/persistence/SupabaseEntityRepository.ts | PRODUCTION_SOURCE | BASE_ORIGIN | 3 frontend / source baseline | profiles/entities/user_app_state + RPC; drafts se enabled | 1.3.0 / POST_ASTRA RC |
| src/infrastructure/persistence/SupabaseStateRepository.ts | PRODUCTION_SOURCE | C3 | 3 frontend / source baseline | profiles/entities/user_app_state + RPC; drafts se enabled | 1.3.0 / POST_ASTRA RC |
| src/infrastructure/persistence/SupabaseUserRepository.ts | PRODUCTION_SOURCE | BASE_ORIGIN | 3 frontend / source baseline | profiles/entities/user_app_state + RPC; drafts se enabled | 1.3.0 / POST_ASTRA RC |
| src/infrastructure/persistence/__tests__/SupabaseStateRepository.test.ts | TEST | BASE_ORIGIN | 3 frontend / source baseline | profiles/entities/user_app_state + RPC; drafts se enabled | 1.3.0 / POST_ASTRA RC |
| src/logic/__tests__/art23Complessivo.test.ts | TEST | C3 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/logic/__tests__/compartoConglobamento2026.test.ts | TEST | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/logic/__tests__/fixtures/limite2016CharacterizationFixtures.ts | FIXTURE | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/logic/__tests__/fundFieldDefinitions.art79.test.ts | TEST | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/logic/__tests__/fundValidation.test.ts | TEST | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/logic/__tests__/limite2016Differential.test.ts | TEST | C3 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/logic/__tests__/mod025ComplianceProspetto.test.ts | TEST | C3 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/logic/__tests__/mod031bEqSegretarioTotals.test.ts | TEST | C3 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/logic/accessory.ts | DOMAIN_LOGIC | BASE_ORIGIN | 3 frontend / source baseline | JSON contracts; nessun DDL diretto | 1.3.0 / POST_ASTRA RC |
| src/logic/arrearsCalculations.ts | DOMAIN_LOGIC | BASE_ORIGIN | 3 frontend / source baseline | JSON contracts; nessun DDL diretto | 1.3.0 / POST_ASTRA RC |
| src/logic/art23Calculations.ts | DOMAIN_LOGIC | BASE_ORIGIN | 3 frontend / source baseline | JSON contracts; nessun DDL diretto | 1.3.0 / POST_ASTRA RC |
| src/logic/cabina/__tests__/resolveCabinaViewModel.test.ts | TEST | C3 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/logic/cabina/__tests__/resolveChecklist.test.ts | TEST | EXISTING_LOCAL_COMMITS | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/logic/cabina/__tests__/resolveDistributionStatus.test.ts | TEST | EXISTING_LOCAL_COMMITS | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/logic/cabina/__tests__/resolveOperationalStatus.test.ts | TEST | C3 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/logic/cabina/resolveCabinaViewModel.ts | DOMAIN_LOGIC | C3 | 3 frontend / source baseline | JSON contracts; nessun DDL diretto | 1.3.0 / POST_ASTRA RC |
| src/logic/cabina/resolveChecklist.ts | DOMAIN_LOGIC | C3 | 3 frontend / source baseline | JSON contracts; nessun DDL diretto | 1.3.0 / POST_ASTRA RC |
| src/logic/cabina/resolveDistributionStatus.ts | DOMAIN_LOGIC | EXISTING_LOCAL_COMMITS | 3 frontend / source baseline | JSON contracts; nessun DDL diretto | 1.3.0 / POST_ASTRA RC |
| src/logic/cabina/resolveOperationalStatus.ts | DOMAIN_LOGIC | C3 | 3 frontend / source baseline | JSON contracts; nessun DDL diretto | 1.3.0 / POST_ASTRA RC |
| src/logic/calculation/__tests__/canonicalFadSections.test.ts | TEST | C3 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/logic/calculation/__tests__/canonicalFundLedger.contract.test.ts | TEST | EXISTING_LOCAL_COMMITS | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/logic/calculation/__tests__/ccnlRecovery.integration.test.ts | TEST | C3 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/logic/calculation/__tests__/dirigenzaArt23.test.ts | TEST | C3 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/logic/calculation/__tests__/documentConsistencyWave3.test.ts | TEST | C3 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/logic/calculation/__tests__/fundEngineArt23FteGate.test.ts | TEST | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/logic/calculation/__tests__/fundEngineArt33PolicyGate.test.ts | TEST | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/logic/calculation/__tests__/fundEngineDirigenzaArt23.test.ts | TEST | C3 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/logic/calculation/__tests__/pnrrFacultyPipeline.test.ts | TEST | C3 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/logic/calculation/__tests__/wave2AstraCharacterization.test.ts | TEST | EXISTING_LOCAL_COMMITS | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/logic/calculation/__tests__/wave3HardeningEvidence.test.ts | TEST | EXISTING_LOCAL_COMMITS | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/logic/calculation/__tests__/wave3SystemicFix.test.ts | TEST | EXISTING_LOCAL_COMMITS | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/logic/calculation/__tests__/wave3UiWiring.test.tsx | TEST | EXISTING_LOCAL_COMMITS | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/logic/calculation/calculationResultFactory.ts | DOMAIN_LOGIC | C3 | 3 frontend / source baseline | JSON contracts; nessun DDL diretto | 1.3.0 / POST_ASTRA RC |
| src/logic/calculation/canonicalFundLedger.ts | DOMAIN_LOGIC | C3 | 3 frontend / source baseline | JSON contracts; nessun DDL diretto | 1.3.0 / POST_ASTRA RC |
| src/logic/calculation/closureCalculations.test.ts | TEST | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/logic/calculation/closureCalculations.ts | DOMAIN_LOGIC | BASE_ORIGIN | 3 frontend / source baseline | JSON contracts; nessun DDL diretto | 1.3.0 / POST_ASTRA RC |
| src/logic/calculation/dirigenzaArt23.ts | DOMAIN_LOGIC | C3 | 3 frontend / source baseline | JSON contracts; nessun DDL diretto | 1.3.0 / POST_ASTRA RC |
| src/logic/calculation/fundCalculations.ts | DOMAIN_LOGIC | C3 | 3 frontend / source baseline | JSON contracts; nessun DDL diretto | 1.3.0 / POST_ASTRA RC |
| src/logic/calculation/fundEngine.ts | DOMAIN_LOGIC | C3 | 3 frontend / source baseline | JSON contracts; nessun DDL diretto | 1.3.0 / POST_ASTRA RC |
| src/logic/calculation/monetaryInvalidResult.ts | DOMAIN_LOGIC | C3 | 3 frontend / source baseline | JSON contracts; nessun DDL diretto | 1.3.0 / POST_ASTRA RC |
| src/logic/calculation/reductionCalculations.test.ts | TEST | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/logic/calculation/reductionCalculations.ts | DOMAIN_LOGIC | BASE_ORIGIN | 3 frontend / source baseline | JSON contracts; nessun DDL diretto | 1.3.0 / POST_ASTRA RC |
| src/logic/calculation/tabella15Mapper.test.ts | TEST | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/logic/calculation/tabella15Mapper.ts | DOMAIN_LOGIC | BASE_ORIGIN | 3 frontend / source baseline | JSON contracts; nessun DDL diretto | 1.3.0 / POST_ASTRA RC |
| src/logic/ccnl2024Calculations.ts | DOMAIN_LOGIC | BASE_ORIGIN | 3 frontend / source baseline | JSON contracts; nessun DDL diretto | 1.3.0 / POST_ASTRA RC |
| src/logic/closure/__tests__/closureInstructionReadiness.test.ts | TEST | C3 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/logic/closure/resolveClosureInstructionReadiness.ts | DOMAIN_LOGIC | C3 | 3 frontend / source baseline | JSON contracts; nessun DDL diretto | 1.3.0 / POST_ASTRA RC |
| src/logic/compensiCalculations.ts | DOMAIN_LOGIC | BASE_ORIGIN | 3 frontend / source baseline | JSON contracts; nessun DDL diretto | 1.3.0 / POST_ASTRA RC |
| src/logic/distribution/__tests__/distributionCanonicalBudget.test.ts | TEST | C3 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/logic/distribution/__tests__/distributionDraftProposal.test.ts | TEST | C3 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/logic/distribution/resolveDistributionDraftProposal.ts | DOMAIN_LOGIC | C3 | 3 frontend / source baseline | JSON contracts; nessun DDL diretto | 1.3.0 / POST_ASTRA RC |
| src/logic/distribution/resolveDistributionFundBudget.ts | DOMAIN_LOGIC | C3 | 3 frontend / source baseline | JSON contracts; nessun DDL diretto | 1.3.0 / POST_ASTRA RC |
| src/logic/distributionCalculations.ts | DOMAIN_LOGIC | BASE_ORIGIN | 3 frontend / source baseline | JSON contracts; nessun DDL diretto | 1.3.0 / POST_ASTRA RC |
| src/logic/fundCalculations.test.ts | TEST | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/logic/fundFieldDefinitions.ts | DOMAIN_LOGIC | BASE_ORIGIN | 3 frontend / source baseline | JSON contracts; nessun DDL diretto | 1.3.0 / POST_ASTRA RC |
| src/logic/import/__fixtures__/errori.csv | FIXTURE | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/logic/import/__fixtures__/numeri_italiani.csv | FIXTURE | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/logic/import/__fixtures__/valido.csv | FIXTURE | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/logic/import/__fixtures__/warning_dirigenza.csv | FIXTURE | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/logic/import/__tests__/csvMapper.test.ts | TEST | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/logic/import/__tests__/csvParser.test.ts | TEST | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/logic/import/__tests__/importDatiGeneraliService.test.ts | TEST | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/logic/import/csvMapper.ts | DOMAIN_LOGIC | BASE_ORIGIN | 3 frontend / source baseline | JSON contracts; nessun DDL diretto | 1.3.0 / POST_ASTRA RC |
| src/logic/import/csvParser.ts | DOMAIN_LOGIC | BASE_ORIGIN | 3 frontend / source baseline | JSON contracts; nessun DDL diretto | 1.3.0 / POST_ASTRA RC |
| src/logic/import/importDatiGeneraliService.ts | DOMAIN_LOGIC | BASE_ORIGIN | 3 frontend / source baseline | JSON contracts; nessun DDL diretto | 1.3.0 / POST_ASTRA RC |
| src/logic/index.ts | DOMAIN_LOGIC | BASE_ORIGIN | 3 frontend / source baseline | JSON contracts; nessun DDL diretto | 1.3.0 / POST_ASTRA RC |
| src/logic/ivcCalculations.ts | DOMAIN_LOGIC | BASE_ORIGIN | 3 frontend / source baseline | JSON contracts; nessun DDL diretto | 1.3.0 / POST_ASTRA RC |
| src/logic/letters/__tests__/letterRequestDataContext.test.ts | TEST | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/logic/letters/__tests__/letterRequestDataGenerator.test.ts | TEST | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/logic/letters/letterRequestDataContext.ts | DOMAIN_LOGIC | BASE_ORIGIN | 3 frontend / source baseline | JSON contracts; nessun DDL diretto | 1.3.0 / POST_ASTRA RC |
| src/logic/letters/letterRequestDataGenerator.ts | DOMAIN_LOGIC | BASE_ORIGIN | 3 frontend / source baseline | JSON contracts; nessun DDL diretto | 1.3.0 / POST_ASTRA RC |
| src/logic/letters/letterRequestDataTypes.ts | DOMAIN_LOGIC | BASE_ORIGIN | 3 frontend / source baseline | JSON contracts; nessun DDL diretto | 1.3.0 / POST_ASTRA RC |
| src/logic/personaleCalculations.ts | DOMAIN_LOGIC | BASE_ORIGIN | 3 frontend / source baseline | JSON contracts; nessun DDL diretto | 1.3.0 / POST_ASTRA RC |
| src/logic/shared/__tests__/art23Fte.test.ts | TEST | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/logic/shared/__tests__/art23FteCurrentBehaviorCharacterization.test.ts | TEST | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/logic/shared/__tests__/art33AdjustmentCore.test.ts | TEST | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/logic/shared/__tests__/art33Applicability.test.ts | TEST | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/logic/shared/__tests__/art33ApplicationPolicy.test.ts | TEST | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/logic/shared/__tests__/ccnlRecovery.test.ts | TEST | C3 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/logic/shared/__tests__/dl25CarryForward.test.ts | TEST | C3 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/logic/shared/__tests__/dl25NetGross.test.ts | TEST | C3 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/logic/shared/__tests__/dl25TemporalRegime.test.ts | TEST | C3 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/logic/shared/__tests__/historicalLimit2016Core.test.ts | TEST | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/logic/shared/__tests__/pnrrFaculty.test.ts | TEST | C3 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/logic/shared/art23Fte.ts | DOMAIN_LOGIC | BASE_ORIGIN | 3 frontend / source baseline | JSON contracts; nessun DDL diretto | 1.3.0 / POST_ASTRA RC |
| src/logic/shared/art33AdjustmentCore.ts | DOMAIN_LOGIC | BASE_ORIGIN | 3 frontend / source baseline | JSON contracts; nessun DDL diretto | 1.3.0 / POST_ASTRA RC |
| src/logic/shared/art33Applicability.ts | DOMAIN_LOGIC | BASE_ORIGIN | 3 frontend / source baseline | JSON contracts; nessun DDL diretto | 1.3.0 / POST_ASTRA RC |
| src/logic/shared/art33ApplicationPolicy.ts | DOMAIN_LOGIC | BASE_ORIGIN | 3 frontend / source baseline | JSON contracts; nessun DDL diretto | 1.3.0 / POST_ASTRA RC |
| src/logic/shared/ccnlRecovery.ts | DOMAIN_LOGIC | C3 | 3 frontend / source baseline | JSON contracts; nessun DDL diretto | 1.3.0 / POST_ASTRA RC |
| src/logic/shared/dl25CarryForward.ts | DOMAIN_LOGIC | C3 | 3 frontend / source baseline | JSON contracts; nessun DDL diretto | 1.3.0 / POST_ASTRA RC |
| src/logic/shared/dl25Regime.ts | DOMAIN_LOGIC | C3 | 3 frontend / source baseline | JSON contracts; nessun DDL diretto | 1.3.0 / POST_ASTRA RC |
| src/logic/shared/historicalLimit2016Core.ts | DOMAIN_LOGIC | BASE_ORIGIN | 3 frontend / source baseline | JSON contracts; nessun DDL diretto | 1.3.0 / POST_ASTRA RC |
| src/logic/shared/pnrrFaculty.ts | DOMAIN_LOGIC | C3 | 3 frontend / source baseline | JSON contracts; nessun DDL diretto | 1.3.0 / POST_ASTRA RC |
| src/logic/simulatoreCalculations.ts | DOMAIN_LOGIC | BASE_ORIGIN | 3 frontend / source baseline | JSON contracts; nessun DDL diretto | 1.3.0 / POST_ASTRA RC |
| src/logic/validation.ts | DOMAIN_LOGIC | BASE_ORIGIN | 3 frontend / source baseline | JSON contracts; nessun DDL diretto | 1.3.0 / POST_ASTRA RC |
| src/logic/verification/__tests__/complianceChecks.navigation.test.ts | TEST | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/logic/verification/complianceChecks.ts | DOMAIN_LOGIC | C3 | 3 frontend / source baseline | JSON contracts; nessun DDL diretto | 1.3.0 / POST_ASTRA RC |
| src/logic/wizard2026/__tests__/MOD007_dirigenza.test.ts | TEST | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/logic/wizard2026/__tests__/art23Limit.test.ts | TEST | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/logic/wizard2026/__tests__/ccnl2026Increments.test.ts | TEST | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/logic/wizard2026/__tests__/conglobamentoArt60.test.ts | TEST | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/logic/wizard2026/__tests__/dl25Increment.test.ts | TEST | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/logic/wizard2026/__tests__/pnrrIncrement.test.ts | TEST | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/logic/wizard2026/__tests__/straordinarioIncrement.test.ts | TEST | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/logic/wizard2026/art23Limit.ts | DOMAIN_LOGIC | BASE_ORIGIN | 3 frontend / source baseline | JSON contracts; nessun DDL diretto | 1.3.0 / POST_ASTRA RC |
| src/logic/wizard2026/ccnl2026Increments.ts | DOMAIN_LOGIC | BASE_ORIGIN | 3 frontend / source baseline | JSON contracts; nessun DDL diretto | 1.3.0 / POST_ASTRA RC |
| src/logic/wizard2026/checks.ts | DOMAIN_LOGIC | BASE_ORIGIN | 3 frontend / source baseline | JSON contracts; nessun DDL diretto | 1.3.0 / POST_ASTRA RC |
| src/logic/wizard2026/conglobamentoArt60.ts | DOMAIN_LOGIC | BASE_ORIGIN | 3 frontend / source baseline | JSON contracts; nessun DDL diretto | 1.3.0 / POST_ASTRA RC |
| src/logic/wizard2026/dl25Increment.ts | DOMAIN_LOGIC | C3 | 3 frontend / source baseline | JSON contracts; nessun DDL diretto | 1.3.0 / POST_ASTRA RC |
| src/logic/wizard2026/index.ts | DOMAIN_LOGIC | BASE_ORIGIN | 3 frontend / source baseline | JSON contracts; nessun DDL diretto | 1.3.0 / POST_ASTRA RC |
| src/logic/wizard2026/pnrrIncrement.ts | DOMAIN_LOGIC | C3 | 3 frontend / source baseline | JSON contracts; nessun DDL diretto | 1.3.0 / POST_ASTRA RC |
| src/logic/wizard2026/straordinarioIncrement.ts | DOMAIN_LOGIC | BASE_ORIGIN | 3 frontend / source baseline | JSON contracts; nessun DDL diretto | 1.3.0 / POST_ASTRA RC |
| src/logic/wizard2026/types.ts | DOMAIN_LOGIC | BASE_ORIGIN | 3 frontend / source baseline | JSON contracts; nessun DDL diretto | 1.3.0 / POST_ASTRA RC |
| src/pages/AdminPareriPage.tsx | PRODUCTION_UI | BASE_ORIGIN | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/pages/Art23EmployeeEntryPage.tsx | PRODUCTION_UI | BASE_ORIGIN | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/pages/AuthPage.tsx | PRODUCTION_UI | BASE_ORIGIN | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/pages/CabinaDiRegiaPage.tsx | PRODUCTION_UI | EXISTING_LOCAL_COMMITS | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/pages/ChecklistPage.tsx | PRODUCTION_UI | BASE_ORIGIN | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/pages/CompensatoreDelegatoPage.tsx | PRODUCTION_UI | C3 | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/pages/CompliancePage.tsx | PRODUCTION_UI | C3 | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/pages/DashboardPage.tsx | PRODUCTION_UI | BASE_ORIGIN | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/pages/DistribuzioneRisorsePage.tsx | PRODUCTION_UI | C3 | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/pages/EntityYearManagementPage.tsx | PRODUCTION_UI | C3 | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/pages/FeedbackAdminPage.tsx | PRODUCTION_UI | BASE_ORIGIN | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/pages/FeedbackPage.tsx | PRODUCTION_UI | BASE_ORIGIN | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/pages/FondiEntiPage.tsx | PRODUCTION_UI | C3 | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/pages/FondoAccessorioDipendentePage.tsx | PRODUCTION_UI | C3 | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/pages/FondoDirigenzaPage.tsx | PRODUCTION_UI | C3 | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/pages/FondoElevateQualificazioniPage.tsx | PRODUCTION_UI | BASE_ORIGIN | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/pages/FondoSegretarioComunalePage.tsx | PRODUCTION_UI | C3 | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/pages/FundDetailsPage.tsx | PRODUCTION_UI | C3 | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/pages/HomePage.tsx | PRODUCTION_UI | BASE_ORIGIN | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/pages/MessagesPage.tsx | PRODUCTION_UI | BASE_ORIGIN | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/pages/NotificationsPage.tsx | PRODUCTION_UI | BASE_ORIGIN | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/pages/PersonaleServizioPage.tsx | PRODUCTION_UI | C3 | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/pages/ReportsPage.tsx | PRODUCTION_UI | C3 | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/pages/Tabella15Page.tsx | PRODUCTION_UI | BASE_ORIGIN | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/pages/ToolboxHomePage.tsx | PRODUCTION_UI | EXISTING_LOCAL_COMMITS | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/pages/UserManagementPage.tsx | PRODUCTION_UI | BASE_ORIGIN | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/pages/YearManagementPage.tsx | PRODUCTION_UI | BASE_ORIGIN | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/pages/__tests__/CabinaDiRegiaPage.wave41.integration.test.tsx | TEST | C3 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/pages/__tests__/CompliancePage.navigation.test.tsx | TEST | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/pages/__tests__/DistribuzioneRisorsePage.canonicalBudget.test.tsx | TEST | C3 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/pages/__tests__/DistribuzioneRisorsePage.closed.test.tsx | TEST | C3 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/pages/__tests__/DistribuzioneRisorsePage.explicitDraft.test.tsx | TEST | C3 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/pages/__tests__/FondoAccessorioDipendentePage.art79c1c.test.tsx | TEST | C3 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/pages/__tests__/FondoDirigenzaPage.art23.test.tsx | TEST | C3 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/pages/__tests__/FondoElevateQualificazioniPage.dl25Limit.test.tsx | TEST | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/pages/__tests__/HomePage.navigation.test.tsx | TEST | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/pages/__tests__/ReportsPage.closed.test.tsx | TEST | EXISTING_LOCAL_COMMITS | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/pages/__tests__/ReportsPage.documentReadiness.test.tsx | TEST | C3 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/pages/__tests__/accessibility.integration.test.tsx | TEST | C3 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/pages/__tests__/activeFadAuthority.integration.test.tsx | TEST | C3 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/pages/__tests__/preReleaseR2Ux.test.tsx | TEST | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/pages/__tests__/provenance.integration.test.tsx | TEST | C3 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/pages/cabinaDiRegiaState.ts | PRODUCTION_UI | EXISTING_LOCAL_COMMITS | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/pages/normativa/GuidaPage.tsx | PRODUCTION_UI | BASE_ORIGIN | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/pages/normativa/IndiceAnaliticoPage.tsx | PRODUCTION_UI | BASE_ORIGIN | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/pages/normativa/NormativaHomePage.tsx | PRODUCTION_UI | BASE_ORIGIN | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/pages/normativa/PareriAranPage.tsx | PRODUCTION_UI | BASE_ORIGIN | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/pages/normativa/RaccoltaPage.tsx | PRODUCTION_UI | BASE_ORIGIN | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/pages/normativa/RicercaNormativaPage.tsx | PRODUCTION_UI | BASE_ORIGIN | 3 frontend / source baseline | DB/Edge contracts via application | 1.3.0 / POST_ASTRA RC |
| src/presenters/documentPresenter.test.ts | TEST | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/presenters/documentPresenter.ts | PRODUCTION_SOURCE | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| src/presenters/index.ts | PRODUCTION_SOURCE | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| src/presenters/reportPresenter.ts | PRODUCTION_SOURCE | C3 | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| src/schemas/fundDataSchemas.ts | PRODUCTION_SOURCE | C3 | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| src/schemas/importSchema.ts | PRODUCTION_SOURCE | C3 | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| src/services/__tests__/canonicalFadXlsx.test.ts | TEST | C3 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/services/__tests__/canonicalFundSummaryPdf.test.ts | TEST | C3 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/services/__tests__/determinaTemplate.art79.test.ts | TEST | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/services/__tests__/documentKindReadiness.test.ts | TEST | C3 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/services/__tests__/documentReadinessFixture.ts | TEST | C3 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/services/__tests__/excelService.art79.test.ts | TEST | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/services/__tests__/monetaryImports.test.ts | TEST | C3 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/services/__tests__/pdfReportService.art79.test.ts | TEST | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/services/chatbotService.ts | PRODUCTION_SOURCE | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| src/services/determinaTemplate.ts | PRODUCTION_SOURCE | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| src/services/documents/documentFactory.ts | PRODUCTION_SOURCE | C3 | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| src/services/documents/pdfDeterminaService.ts | PRODUCTION_SOURCE | C3 | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| src/services/documents/pdfReportService.ts | PRODUCTION_SOURCE | C3 | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| src/services/documents/tabella15XlsService.ts | PRODUCTION_SOURCE | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| src/services/documents/xlsReportService.ts | PRODUCTION_SOURCE | C3 | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| src/services/excelService.ts | PRODUCTION_SOURCE | C3 | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| src/services/feedbackService.ts | PRODUCTION_SOURCE | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| src/services/pdfReportService.ts | PRODUCTION_SOURCE | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| src/services/pdfReportService2.ts | PRODUCTION_SOURCE | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| src/services/reportService.ts | PRODUCTION_SOURCE | C3 | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| src/services/requestDataLetterPdfService.ts | PRODUCTION_SOURCE | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| src/services/stateService.ts | PRODUCTION_SOURCE | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| src/services/supabase.ts | PRODUCTION_SOURCE | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| src/services/templates/determinaTemplateV2.ts | PRODUCTION_SOURCE | C3 | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| src/services/templates/relazioneTecnicaTemplate.ts | PRODUCTION_SOURCE | C3 | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| src/services/userProfilesHelper.ts | PRODUCTION_SOURCE | EXISTING_LOCAL_COMMITS | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| src/services/xlsReportService.ts | PRODUCTION_SOURCE | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| src/setupTests.ts | PRODUCTION_SOURCE | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| src/test/fixtures/ccnlRecovery.ts | FIXTURE | C3 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/test/fixtures/legacyDemoFund.ts | FIXTURE | C3 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| src/types.ts | PRODUCTION_SOURCE | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| src/types/chat.ts | PRODUCTION_SOURCE | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| src/types/communications.ts | PRODUCTION_SOURCE | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| src/types/compensiTypes.ts | PRODUCTION_SOURCE | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| src/utils/financialMath.ts | PRODUCTION_SOURCE | C3 | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| src/utils/formatters.ts | PRODUCTION_SOURCE | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| src/utils/pareriIngestion.ts | PRODUCTION_SOURCE | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| src/vite-env.d.ts | PRODUCTION_SOURCE | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| supabase/config.toml | CONFIG | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| supabase/functions/chat-rag/.npmrc | CONFIG | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| supabase/functions/chat-rag/deno.json | CONFIG | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| supabase/functions/chat-rag/index.ts | EDGE_FUNCTION | BASE_ORIGIN | Baseline invariata; no automatic deploy | Baseline DB/handler: vedi Edge inventory | 1.3.0 / POST_ASTRA RC |
| supabase/functions/chat/index.ts | EDGE_FUNCTION | BASE_ORIGIN | Baseline invariata; no automatic deploy | Baseline DB/handler: vedi Edge inventory | 1.3.0 / POST_ASTRA RC |
| supabase/functions/create-user/index.ts | EDGE_FUNCTION | C2 | 2 Edge Auth | profiles.role canonico + Auth trigger 20261002 | 1.3.0 / POST_ASTRA RC |
| supabase/functions/delete-user/index.ts | EDGE_FUNCTION | C2 | 2 Edge Auth | profiles.role canonico + Auth trigger 20261002 | 1.3.0 / POST_ASTRA RC |
| supabase/functions/process-rag-chunk/.npmrc | CONFIG | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| supabase/functions/process-rag-chunk/deno.json | CONFIG | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| supabase/functions/process-rag-chunk/index.ts | EDGE_FUNCTION | BASE_ORIGIN | Baseline invariata; no automatic deploy | Baseline DB/handler: vedi Edge inventory | 1.3.0 / POST_ASTRA RC |
| supabase/functions/sync-users/index.ts | EDGE_FUNCTION | BASE_ORIGIN | Baseline invariata; no automatic deploy | Baseline DB/handler: vedi Edge inventory | 1.3.0 / POST_ASTRA RC |
| supabase/functions/update-password/index.ts | EDGE_FUNCTION | C2 | 2 Edge Auth | profiles.role canonico + Auth trigger 20261002 | 1.3.0 / POST_ASTRA RC |
| supabase/migrations/20260221131708_create_rag_schema.sql | DATABASE_MIGRATION | BASE_ORIGIN | 1 DB (solo pending reviewed) | Vedi matrice SQL e history gate | 1.3.0 / POST_ASTRA RC |
| supabase/migrations/20260221230945_create_knowledge_documents.sql | DATABASE_MIGRATION | BASE_ORIGIN | 1 DB (solo pending reviewed) | Vedi matrice SQL e history gate | 1.3.0 / POST_ASTRA RC |
| supabase/migrations/20260222182000_create_communications_tables.sql | DATABASE_MIGRATION | BASE_ORIGIN | 1 DB (solo pending reviewed) | Vedi matrice SQL e history gate | 1.3.0 / POST_ASTRA RC |
| supabase/migrations/20260315_add_user_id_to_notifications.sql | DATABASE_MIGRATION | BASE_ORIGIN | 1 DB (solo pending reviewed) | Vedi matrice SQL e history gate | 1.3.0 / POST_ASTRA RC |
| supabase/migrations/20260415120000_create_pareri_aran_staging.sql | DATABASE_MIGRATION | BASE_ORIGIN | 1 DB (solo pending reviewed) | Vedi matrice SQL e history gate | 1.3.0 / POST_ASTRA RC |
| supabase/migrations/20260602000000_create_wizard2026_drafts.sql | DATABASE_MIGRATION | BASE_ORIGIN | 1 DB (solo pending reviewed) | Vedi matrice SQL e history gate | 1.3.0 / POST_ASTRA RC |
| supabase/migrations/20260602001000_adjust_wizard2026_drafts_select_policy.sql | DATABASE_MIGRATION | BASE_ORIGIN | 1 DB (solo pending reviewed) | Vedi matrice SQL e history gate | 1.3.0 / POST_ASTRA RC |
| supabase/migrations/20260921000000_fix_user_app_state_ownership_rls.sql | DATABASE_MIGRATION | EXISTING_LOCAL_COMMITS | 1 DB (solo pending reviewed) | Vedi matrice SQL e history gate | 1.3.0 / POST_ASTRA RC |
| supabase/migrations/20260922000000_enforce_closed_snapshot_immutability.sql | DATABASE_MIGRATION | EXISTING_LOCAL_COMMITS | 1 DB (solo pending reviewed) | Vedi matrice SQL e history gate | 1.3.0 / POST_ASTRA RC |
| supabase/migrations/20260922000001_close_annual_snapshot_atomic.sql | DATABASE_MIGRATION | EXISTING_LOCAL_COMMITS | 1 DB (solo pending reviewed) | Vedi matrice SQL e history gate | 1.3.0 / POST_ASTRA RC |
| supabase/migrations/20260922000002_grant_close_annual_snapshot_atomic.sql | DATABASE_MIGRATION | EXISTING_LOCAL_COMMITS | 1 DB (solo pending reviewed) | Vedi matrice SQL e history gate | 1.3.0 / POST_ASTRA RC |
| supabase/migrations/20260922140000_update_immutability_trigger.sql | DATABASE_MIGRATION | EXISTING_LOCAL_COMMITS | 1 DB (solo pending reviewed) | Vedi matrice SQL e history gate | 1.3.0 / POST_ASTRA RC |
| supabase/migrations/20260922140001_harden_close_annual_snapshot_atomic.sql | DATABASE_MIGRATION | EXISTING_LOCAL_COMMITS | 1 DB (solo pending reviewed) | Vedi matrice SQL e history gate | 1.3.0 / POST_ASTRA RC |
| supabase/migrations/20260922140002_grant_hardened_rpc.sql | DATABASE_MIGRATION | EXISTING_LOCAL_COMMITS | 1 DB (solo pending reviewed) | Vedi matrice SQL e history gate | 1.3.0 / POST_ASTRA RC |
| supabase/migrations/20260922150000_fix_found_in_atomic_closure.sql | DATABASE_MIGRATION | EXISTING_LOCAL_COMMITS | 1 DB (solo pending reviewed) | Vedi matrice SQL e history gate | 1.3.0 / POST_ASTRA RC |
| supabase/migrations/20260928000000_harden_user_app_state_closed_boundary.sql | DATABASE_MIGRATION | EXISTING_LOCAL_COMMITS | 1 DB (solo pending reviewed) | Vedi matrice SQL e history gate | 1.3.0 / POST_ASTRA RC |
| supabase/migrations/20260928000001_restrict_atomic_closure_execute.sql | DATABASE_MIGRATION | EXISTING_LOCAL_COMMITS | 1 DB (solo pending reviewed) | Vedi matrice SQL e history gate | 1.3.0 / POST_ASTRA RC |
| supabase/migrations/20260928000002_quarantine_registrazioni_calcolo_fondo.sql | DATABASE_MIGRATION | EXISTING_LOCAL_COMMITS | 1 DB (solo pending reviewed) | Vedi matrice SQL e history gate | 1.3.0 / POST_ASTRA RC |
| supabase/migrations/20261002000000_harden_auth_profile_role_source.sql | DATABASE_MIGRATION | C1 | 1 DB (solo pending reviewed) | Vedi matrice SQL e history gate | 1.3.0 / POST_ASTRA RC |
| tailwind.config.js | CONFIG | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| templates/import/dati_generali_ente_template.csv | PRODUCTION_SOURCE | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| templates/letters/richiesta_dati_costituzione_fondo.md | PRODUCTION_SOURCE | BASE_ORIGIN | Repo documentary | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| tests/fixtures/fondo/README.md | FIXTURE | BASE_ORIGIN | Repo documentary | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| tests/fixtures/fondo/caso-distribuzione-consuntivo.json | FIXTURE | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| tests/fixtures/fondo/caso-distribuzione-consuntivo.md | FIXTURE | BASE_ORIGIN | Repo documentary | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| tests/fixtures/fondo/caso-incremento-2025.json | FIXTURE | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| tests/fixtures/fondo/caso-incremento-2025.md | FIXTURE | BASE_ORIGIN | Repo documentary | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| tests/fixtures/fondo/caso-riporti-anno-precedente.json | FIXTURE | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| tests/fixtures/fondo/caso-riporti-anno-precedente.md | FIXTURE | BASE_ORIGIN | Repo documentary | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| tests/fixtures/fondo/caso-superamento-tetto-art23.json | FIXTURE | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| tests/fixtures/fondo/caso-superamento-tetto-art23.md | FIXTURE | BASE_ORIGIN | Repo documentary | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| tests/fixtures/fondo/ente-con-dirigenza.json | FIXTURE | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| tests/fixtures/fondo/ente-con-dirigenza.md | FIXTURE | BASE_ORIGIN | Repo documentary | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| tests/fixtures/fondo/ente-con-eq.json | FIXTURE | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| tests/fixtures/fondo/ente-con-eq.md | FIXTURE | BASE_ORIGIN | Repo documentary | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| tests/fixtures/fondo/ente-con-segretario.json | FIXTURE | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| tests/fixtures/fondo/ente-con-segretario.md | FIXTURE | BASE_ORIGIN | Repo documentary | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| tests/fixtures/fondo/ente-senza-dirigenza.json | FIXTURE | BASE_ORIGIN | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| tests/fixtures/fondo/ente-senza-dirigenza.md | FIXTURE | BASE_ORIGIN | Repo documentary | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| tests/fixtures/fondo/golden_results.json | GOLDEN | C3 | 3 frontend / source baseline | Contratto source/test; no apply | 1.3.0 / POST_ASTRA RC |
| tsconfig.json | CONFIG | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| tsconfig.node.json | CONFIG | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| vite.config.ts | CONFIG | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| wrangler.jsonc | CONFIG | BASE_ORIGIN | 3 frontend / source baseline | Baseline/config; nessun nuovo DDL | 1.3.0 / POST_ASTRA RC |
| FILE / UNIT | CATEGORY | COMMIT GROUP | RELEASE ORDER | DB DEPENDENCY | VERSION |
| --- | --- | --- | --- | --- | --- |
| ASTRA_LOCAL_CONSOLIDATION_PREFLIGHT_REPORT.md | PROJECT_DOCUMENTATION | C4 | Repo documentary | Nessun runtime DB | POST_ASTRA plan |
| PRODUCTION_DATABASE_ALIGNMENT_PLAN.md | PROJECT_DOCUMENTATION | C4 | Repo documentary | Piano soltanto, non apply | POST_ASTRA plan |
| POST_ASTRA_RELEASE_MANIFEST.md | PROJECT_DOCUMENTATION | C4 | Repo documentary | Nessun runtime DB | POST_ASTRA plan |
