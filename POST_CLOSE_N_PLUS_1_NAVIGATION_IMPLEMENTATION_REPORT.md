# POST_CLOSE_N_PLUS_1_NAVIGATION — Implementation report

Slice: `POST_CLOSE_N_PLUS_1_NAVIGATION_FIX`. Data: 2026-10-04.
Esito locale: PASS. Nessuna verifica live o modifica remota.

## Baseline

Repository: dinopusceddu/entilocaliapp.
Branch: `ux/toolbox-area-fondo-prototype`.
HEAD: `d3170f959b5815c514dbf3d6e5f93366a5f14c67`.
I cinque comandi sono stati eseguiti prima di qualsiasi modifica. Branch e HEAD coincidono con la baseline richiesta. Index inizialmente vuoto.
Inventario PRE: 1126 file, path + SHA-256, unione file tracked, untracked non ignorati e report Markdown nella root. Copie PRE dei due file produttivi in TEMP.
Evidenze di questa esecuzione: `C:\Users\PUSCED~1\AppData\Local\Temp\post-close-navigation-c70fcabe4fbc4313842f7d258da6e9c0` (baseline-pre.txt, pre-hashes.json, post-hashes.json, integrity.json, risultati JSON dei test, offline-guard.cjs). Nessun evidence pack preesistente viene rigenerato.

<details>
<summary>Working tree PRE esatto e output dei cinque comandi</summary>

```text
git status --short --untracked-files=all
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
 M src/pages/ReportsPage.tsx
 M src/pages/__tests__/CabinaDiRegiaPage.wave41.integration.test.tsx
 M src/pages/__tests__/DistribuzioneRisorsePage.closed.test.tsx
 M src/presenters/reportPresenter.ts
 M src/services/documents/documentFactory.ts
 M src/services/documents/pdfDeterminaService.ts
 M src/services/documents/pdfReportService.ts
 M src/services/documents/xlsReportService.ts
 M src/services/reportService.ts
 M src/services/templates/determinaTemplateV2.ts
 M src/services/templates/relazioneTecnicaTemplate.ts
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
?? DOCUMENT_KIND_READINESS_INDEPENDENT_REVIEW.md
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
?? src/domain/documentKindReadiness.ts
?? src/logic/closure/__tests__/closureInstructionReadiness.test.ts
?? src/logic/closure/resolveClosureInstructionReadiness.ts
?? src/logic/distribution/__tests__/distributionCanonicalBudget.test.ts
?? src/logic/distribution/__tests__/distributionDraftProposal.test.ts
?? src/logic/distribution/resolveDistributionDraftProposal.ts
?? src/logic/distribution/resolveDistributionFundBudget.ts
?? src/pages/__tests__/DistribuzioneRisorsePage.canonicalBudget.test.tsx
?? src/pages/__tests__/DistribuzioneRisorsePage.explicitDraft.test.tsx
?? src/pages/__tests__/ReportsPage.documentReadiness.test.tsx
?? src/services/__tests__/canonicalFadXlsx.test.ts
?? src/services/__tests__/canonicalFundSummaryPdf.test.ts
?? src/services/__tests__/documentKindReadiness.test.ts
?? src/services/__tests__/documentReadinessFixture.ts
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

git branch --show-current
ux/toolbox-area-fondo-prototype

git rev-parse HEAD
d3170f959b5815c514dbf3d6e5f93366a5f14c67

git diff --name-status
warning: in the working copy of 'src/__tests__/securityMigrations.test.ts', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/contexts/AppContext.tsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/domain/documentProjection.ts', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/logic/cabina/__tests__/resolveCabinaViewModel.test.ts', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/logic/cabina/__tests__/resolveOperationalStatus.test.ts', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/logic/cabina/resolveCabinaViewModel.ts', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/logic/cabina/resolveOperationalStatus.ts', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/pages/DistribuzioneRisorsePage.tsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/pages/EntityYearManagementPage.tsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/pages/ReportsPage.tsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/pages/__tests__/CabinaDiRegiaPage.wave41.integration.test.tsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/pages/__tests__/DistribuzioneRisorsePage.closed.test.tsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/presenters/reportPresenter.ts', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/services/documents/documentFactory.ts', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/services/documents/pdfDeterminaService.ts', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/services/documents/pdfReportService.ts', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/services/documents/xlsReportService.ts', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/services/reportService.ts', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/services/templates/determinaTemplateV2.ts', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/services/templates/relazioneTecnicaTemplate.ts', LF will be replaced by CRLF the next time Git touches it
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
M	src/pages/ReportsPage.tsx
M	src/pages/__tests__/CabinaDiRegiaPage.wave41.integration.test.tsx
M	src/pages/__tests__/DistribuzioneRisorsePage.closed.test.tsx
M	src/presenters/reportPresenter.ts
M	src/services/documents/documentFactory.ts
M	src/services/documents/pdfDeterminaService.ts
M	src/services/documents/pdfReportService.ts
M	src/services/documents/xlsReportService.ts
M	src/services/reportService.ts
M	src/services/templates/determinaTemplateV2.ts
M	src/services/templates/relazioneTecnicaTemplate.ts
M	supabase/functions/create-user/index.ts
M	supabase/functions/delete-user/index.ts
M	supabase/functions/update-password/index.ts

git diff --cached --name-status


```
</details>

## Confirmed bug

`CONFIRMED_NON_DESTRUCTIVE_WORKFLOW_BUG`, confermato dalla review indipendente CLOSURE_INSTRUCTION_READINESS. La chiusura congela N e prepara N+1 correttamente; la navigazione successiva può fallire perché il callback conserva il draft OPEN del render precedente. Il server rifiuta correttamente il tentativo di salvataggio di N ormai CLOSED. Nessuna corruzione DB; UI rimane su N.

## PRE navigation graph

EntityYearManagementPage.handleCloseYear → readiness READY → confirm → AppContext.closeCurrentYear → closeYearAndPrepareNext → stateRepository.closeYearAtomic → RPC close_annual_snapshot_atomic → successo + closedYear + nextYear → dispatch locale CLOSED → switchYearAtomic(nextYear) catturato quando N era OPEN → flush → canSaveCurrent → switchActiveYear → saveAnnualSnapshot(N) → controllo remoto CLOSED → fallimento prima del load N+1.

Caller inventory ordinario: EntityYearManagementPage (creazione/attivazione e, PRE, post-close), YearManagementPage, FondiEntiPage, AreaFondoContextBar; AppContext loadEntities e switchEntity. Solo il ramo post-successo di EntityYearManagementPage passa alla nuova API. La chiusura UI attiva è in EntityYearManagementPage; retry/recovery programmatici restano in closeCurrentYear.

## Root cause

`canSaveCurrent` verificava l'allineamento della chiave di idratazione, non il successo della transazione appena conclusa. Il callback portava un fundData OPEN obsoleto al workflow normale. Attendere un render non è un'autorità transazionale affidabile.

## Normal switch protected contract

OPEN A → flush dell'autosave → saveAnnualSnapshot(A) se la chiave coincide e non è un cambio ente → loadAnnualSnapshot(B) → hydrate reducer. Nessun nuovo flag pubblico per evitare il salvataggio. N1 verifica il draft realmente modificato e l'ordine save-before-load. Le guardie keyed, request ID, ownership e freshness preesistenti restano nel percorso condiviso.

## Post-close switch contract

La sola risposta success:true del workflow registra sincronicamente:
- chiave user/entity/closedYear nell'insieme interno delle annualità congelate;
- riferimento interno contenente userId, entity, closedYear, nextYear.

`switchYearAfterClosure()` non riceve anno, flag o receipt dal caller. Usa quel riferimento e verifica identità dell'istanza, utente, ente/anno correnti nell'autorità di freshness e destinazione nextYear. Senza un successo precedente, o in un altro contesto, restituisce false prima di leggere/scrivere. Dopo il passaggio a N+1 il riferimento non autorizza nuovi passaggi da un anno OPEN.

Il percorso evita flush/save di N congelato e riusa la normale lettura/idratazione del target. Le allocazioni esistenti N+1 provengono dal repository, non dal vecchio draft N.

## Implementation

- src/contexts/AppContext.tsx: API semantica switchYearAfterClosure, riferimento di successo e chiavi CLOSED, guardie dinamiche per salvataggi stale e persistenza locale, helper di switch privato condiviso; preservazione dell'errore nel solo percorso post-closure. Nessuna formula/RPC/readiness modificata.
- src/pages/EntityYearManagementPage.tsx: usa la nuova API solo dopo success; aggiorna il catalogo anni; distingue successo della chiusura e fallimento della navigazione con messaggio e azione “Apri l'anno N+1”.
- src/contexts/__tests__/postCloseNavigation.integration.test.tsx: nuovi test con provider, reducer, motore, autosave, workflow e pagina reali. Mock solo Auth/normative loading, repository/database e dialoghi browser; spy sul workflow che esegue l'implementazione originale.
- src/contexts/__tests__/closureInstructionReadiness.integration.test.tsx: soltanto il test parametrico READY click (due casi) era congelato sul precedente comportamento UI. Ora verifica N CLOSED nel repository e currentYear=N+1, mantenendo single workflow/confirm e zero scritture aggiuntive su N. I percorsi NOT_READY, warning, idempotenza e recovery non sono cambiati.
- Questo report.

## Stale closure analysis

Le chiavi CLOSED vengono registrate prima del dispatch e del ritorno della promise. Anche un saveState conservato dal render OPEN consulta questa autorità viva e rifiuta il salvataggio prima del boundary DB. N3 usa l'API post-close catturata prima della chiusura; N9 invoca direttamente saveState stale prima di un altro render; un ulteriore test conserva anche il normale switch OPEN e lo invoca dopo successo. Nessuna dipendenza da canSaveCurrent stale per autorizzare il post-close.

## Zero post-close writes

POST_CLOSE_WRITES_TO_CLOSED_YEAR = 0. Spy individuali su upsertState, createState, deleteState, entityRepository.update e closeYearAtomic. Ogni controllo distingue la transazione iniziale autorizzata dalle eventuali scritture successive. Gli upsert/create sul vecchio anno sono sempre zero dopo successo; non vi sono delete. N9 esercita debounce reale e beforeunload oltre al callback stale.

La normale ricalcolazione/idratazione di N+1 può salvare lo snapshot OPEN e aggiornare il nome ente secondo il contratto preesistente; tali scritture non sono scritture su N CLOSED e non vengono disabilitate. Quando il load N+1 fallisce, anche entityRepository.update rimane non chiamato.

## Closure failure

RPC error → result.success=false → nessun riferimento post-close, nessuna navigazione. N resta OPEN; N+1 non esiste; il retry usa lo stesso workflow. Nessun rollback nuovo.

## Navigation failure after success

Errori DB di lettura e rejection dopo il commit lasciano N CLOSED e N+1 presente. Nessun rollback della chiusura. SET_YEAR_SWITCH_ERROR conserva l'errore nel percorso post-close: non viene cancellato dal dispatch finale, che sarebbe ridondante perché SET_YEAR_SWITCH_ERROR ha già terminato il loading.

La pagina comunica esplicitamente la chiusura riuscita e il passaggio non completato. Non richiede una seconda chiusura. L'errore non viene interpretato come errore della transazione.

## Recovery / ALREADY_CLOSED

CLOSED + N+1 presente: workflow idempotente originale, zero nuova RPC, poi navigazione.
CLOSED + N+1 mancante: workflow di recovery originale con closeYearAtomic, poi navigazione.
Due chiusure sequenziali tramite callback del render OPEN: una transizione atomica effettiva, un solo N+1. Nessuna modifica alla strategia DATA-02.

## Autosave

useFundDataAutosave resta byte-identico. Le guardie CLOSED già presenti cancellano il timer al render aggiornato e impediscono i nuovi flush; la guardia dinamica di saveState copre il callback ancora OPEN prima del render. La persistenza locale controllata rifiuta anch'essa il contesto appena congelato.

AUTOSAVE_POST_CLOSE_WRITES = 0. La protezione riguarda tentativi iniziati dopo il successo ricevuto; non introduce una nuova strategia di concorrenza con richieste già in volo prima della chiusura. L'immutabilità server-side DATA-02 resta l'autorità per tali richieste.

## Manual retry

“Apri l'anno N+1” richiama soltanto switchYearAfterClosure. Il riferimento resta disponibile in caso di errore di lettura. Una selezione manuale con il normale handler di attivazione funziona dal nuovo render CLOSED e non salva N. Il messaggio si rimuove quando N+1 diventa corrente o cambia il contesto ente.

## Integration tests

| Gate | Risultato |
|---|---|
| Post-close navigation integration | PASS 16/16 |
| Closure readiness unit/integration | PASS 17/17 + 21/21 |
| Normal switch/snapshot workflow + context race | PASS 8/8 + 2/2 |
| Year closure workflow + carry-forward | PASS 5/5 + 3/3 |
| Full Vitest offline (126 file, inclusi tutti i gate pertinenti) | PASS 1604/1604 |

I 16 test dedicati sono eseguiti nella suite completa sul codice finale. La prima esecuzione ha rilevato una fixture 2026 con platea Art.60 mancante: completati soltanto i dati del test con zero esplicito, senza cambiare ledger/readiness. Una successiva esecuzione mirata ha rilevato le due asserzioni storiche sul vecchio anno corrente e l'errore post-close cancellato dal finally: analizzati e corretti nel delta indicato. Nessun golden economico aggiornato.

Copertura N1–N12:
- normale switch OPEN dirty, save precedente al load;
- READY click → N+1, status/badge/ente/annualData/fundData/distribuzione aggiornati, calculationResult e complianceChecks ricalcolati sul target;
- callback OPEN stale, zero post-close writes;
- fallimento RPC e retry;
- errore di lettura o rejection dopo commit, errore distinto, retry senza nuova closure;
- CLOSED presente/mancante, idempotenza e recovery;
- autosave reale, debounce e beforeunload;
- due close sequenziali;
- cancel;
- reducer immutabile su CLOSED e attivazione manuale;
- nessun receipt, anno OPEN diverso ed ente diverso non possono usare il percorso speciale.

## Closed-slice regressions

| Perimetro protetto | Risultato |
|---|---|
| Wave1 CLOSED snapshot | PASS 10/10 |
| AppContext CLOSED hardening | PASS 35/35 |
| AppContext anti-contamination / hydration | PASS 18/18 + 2/2 |
| Document kind readiness (policy, factory, service, real file) | PASS 73/73 |
| ReportsPage document readiness | PASS 8/8 |
| Distribuzione (budget, proposta, pagina, CLOSED) | PASS 64/64 |
| Cabina (resolver + pagina) | PASS 111/111 |
| Fondo Personale | PASS 6/6 |
| FAD report read model | PASS 17/17 |
| Canonical FAD XLSX | PASS 16/16 |
| Canonical fund summary PDF | PASS 17/17 |
| Canonical ledger contract | PASS 13/13 |
| Wave3 consistency/systemic/wiring/hardening/independent | PASS 87/87 |
| Auth create/password/delete | PASS 95/95 |

DATA_02_REGRESSION / CALC_02_REGRESSION / DOC_02_REGRESSION / NORM_01_REGRESSION / SEC_01_REGRESSION / FUNC_01_REGRESSION = NONE.
CABINA_BLOCKING / DISTRIBUTION_EXPLICIT_DRAFT / CLOSURE_INSTRUCTION_READINESS / DOCUMENT_KIND_READINESS = nessuna regressione.

TypeScript: PASS (npx tsc --noEmit). Regression script: PASS 8/8. Wave2 oracle: PASS 14/14.
git diff --check: PASS.
PRODUCT_NETWORK_ATTEMPTS = 0.
TOOLING_NETWORK_ATTEMPTS = 0.
REAL_NETWORK_CONNECTION_ESTABLISHED = NO.
Node preload blocca HTTP/HTTPS, socket/TLS, DNS e fetch anche nei worker; npm offline e update notifier disabilitato. File prodotti dai gate storici rediretti in TEMP per preservare gli evidence pack. Esbuild ha richiesto esecuzione fuori sandbox per leggere la configurazione locale TEMP; il guard offline è rimasto attivo.

## Scope integrity

Inventario POST: 1128 file; 1123 PRE byte-identici; 3 PRE modificati (AppContext, EntityYearManagementPage, il test parametrico closure readiness); 2 nuovi (test post-close e questo report); 0 cancellati. Index vuoto prima e dopo; branch e HEAD invariati.

Hash PRE/POST protetti, riportati in pre-hashes.json/post-hashes.json:
- yearClosureWorkflow.ts: 71C052F4CC3C95D97EC81BAC5E9E6C011F1C0AB0753BCD7057B8E40A84CCC91B
- SupabaseStateRepository.ts: A817EE36AC8144956CB05AEEB796923A32762A3102AFDAECC6DF7073B483C88F
- resolveClosureInstructionReadiness.ts: D0649E75D723E223DC5C0A734F1A3B58CA09037E753FA9A40518EACA6FA76D45
- documentKindReadiness.ts: 535EFA428B41A682E100475413DE2FDEC3487E9AD4EA5A17D8E1FE6CDFDEAED1
- pdfReportService.ts: 036CDF0E13A3DCDF7A712D26D2B5238D36EEBB6AA7EC6148ABA5B9DE6DEF018E
- xlsReportService.ts: F594FDA1E29455D283B930FB5E057354F1865EA2A0716D34DB05A600C2896574
- migration Auth pending: 8670E439CD6FA8AE969652445637168491AFD3388DE710CE2AE9E2752EF2614D

Il delta rispetto al PRE, non quello complessivo rispetto a HEAD, è limitato ai cinque file sopra. Il test storico è il solo file extra rispetto ai due file produttivi e nuovo test/report, motivato dalle due asserzioni che presupponevano il bug corretto. Staged resta vuoto. Nessun file PRE cancellato o spostato.

yearClosureWorkflow, SupabaseStateRepository, RPC/migration, carry-forward, resolveClosureInstructionReadiness, document readiness, autosave hook, Distribution, Cabina, ledger, fundEngine, PDF/XLS, Tabella15 e Auth byte-identici al PRE. Tutti gli altri report/evidence pack inventariati sono invariati.

DATABASE_CHANGED = NO; MIGRATIONS_CREATED/APPLIED = NO; STAGING_CONTACTED/PRODUCTION_CONTACTED = NO.
GIT_ADD/COMMIT/PUSH/PR/DEPLOY = NO.

## FUNC-02 reassessment

La ricognizione dell'acceptance originale e della review DOCUMENT_KIND_READINESS identifica questo come l'unico residuo noto FUNC-02 dopo i precedenti slice consolidati: priorità BLOCKING, proposta esplicita/personale missing, closure instruction readiness e document-kind readiness restano coperti dalle regressioni.

POST_CLOSE_N_PLUS_1_NAVIGATION = CLOSED_LOCALLY.
FUNC-02 = CANDIDATE_VERIFIED_FIXED, severità originale HIGH invariata; nessuna auto-promozione a VERIFIED_FIXED.
DOC-02, DATA-02, CALC-02, NORM-01, SEC-01 e FUNC-01 mantengono il loro stato consolidato, senza nuove attestazioni live.
ASTRA_BLOCKERS_OPEN = 0 nel perimetro consolidato.
NORM-02/ARCH-01 e tutti gli altri finding restano fuori scope. TABELLA15_OUTPUT_MODE e CCNL_RECOVERY_INSTRUCTION non avviati.

## Next gate

POST_CLOSE_N_PLUS_1_NAVIGATION_INDEPENDENT_REVIEW.
STOP: nessun successivo slice iniziato.
