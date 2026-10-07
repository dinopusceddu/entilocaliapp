# FAD_REPORT_READ_MODEL_IMPLEMENTATION_REPORT

## Baseline

Slice: `FAD_REPORT_READ_MODEL`.
Branch: `ux/toolbox-area-fondo-prototype`.
HEAD: `d3170f959b5815c514dbf3d6e5f93366a5f14c67`.

Prima di modificare: eseguiti `git status --short --untracked-files=all`, `git branch --show-current`, `git rev-parse HEAD`, `git diff --name-status`, `git diff --cached --name-status`. Branch/HEAD coincidono con la baseline richiesta. Diff staged PRE vuoto.

Working tree PRE, output esatto completo di git status:

```text
 M src/__tests__/securityMigrations.test.ts
 M src/features/wizard2026/__tests__/wizard2026RemoteDraftSync.test.ts
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

Diff name-status PRE non staged:

```text
M	src/__tests__/securityMigrations.test.ts
M	src/features/wizard2026/__tests__/wizard2026RemoteDraftSync.test.ts
M	supabase/functions/create-user/index.ts
M	supabase/functions/delete-user/index.ts
M	supabase/functions/update-password/index.ts
```

Inventario PRE: 1070 path + SHA-256, catturati prima dell'implementazione. Perimetro: tracked, tutti gli untracked non ignored ed i report root ignored preesistenti; esclusi dipendenze/build/cache ignored. Inventario disponibile in `C:\Users\PUSCED~1\AppData\Local\Temp\fad-report-read-model-7f990176d881490fa8067e4c3e310e25\pre-inventory.json`: il file salvato è stato confrontato chiave per chiave con la mappa PRE catturata in memoria, con uguaglianza completa.

Nessun checkout/pull/fetch/reset/stash/merge/rebase, git add, commit, push, PR o deploy.

## Original ASTRA problem

CALC-02 e NORM-01 restano BLOCKER parzialmente corretti: Fondo Personale e Cabina consumano valori canonici, ma Riepilogo Generale PDF e XLS Fondo usano ancora sezioni legacy. Nel caso A/2025 il dettaglio stabile conserva 2000 + 1400 - 127,44 mentre section.total dichiara 2000. La sorgente canonica ha stabile verificato 3400, Art.60 zero e recovery 2800 non istruito, quindi total null.

Questo slice prepara un contratto economico unico per i futuri writer, senza migrare gli export attivi e senza chiudere artificialmente i finding.

Documenti letti: sezioni CALC-02/DOC-02/NORM-01/NORM-02/ARCH-01 e roadmap FAD_REPORT_READ_MODEL dei due documenti ASTRA; parti pertinenti di WAVE2_CANONICAL_LEDGER_IMPLEMENTATION_REPORT, WAVE2_INDEPENDENT_REVIEW_REPORT, WAVE3_DOCUMENT_CONSISTENCY_IMPLEMENTATION_REPORT, WAVE3_FINAL_HARDENING_REPORT, WAVE3_FINAL_INDEPENDENT_VERIFICATION_REPORT, WAVE3_FINAL_WIRING_FIX_REPORT e WAVE3_FINAL_DRAFT_FIX_REPORT. Le affermazioni storiche di chiusura generale non prevalgono sul codice e sulla riconciliazione ASTRA corrente.

## Current legacy graph

Path reali:

- Tipo `CanonicalFundResult` e `FundLedgerEntry`: `src/domain/canonicalFundLedger.ts`.
- Builder e derivazione: `src/logic/calculation/canonicalFundLedger.ts`.
- Orchestrazione `calculateFundCompletely`: `src/logic/calculation/fundEngine.ts`.
- Helper legacy `calculateFadTotals`: implementazione `src/logic/calculation/fundCalculations.ts:76`, re-export `src/logic/accessory.ts:1`.
- Proiezione documentale esistente `projectFundDocument`: `src/domain/documentProjection.ts`.
- Presenter legacy `createReportViewModel`: `src/presenters/reportPresenter.ts`.
- Entry point report: `src/services/reportService.ts`.
- Writer attivi: `src/services/documents/pdfReportService.ts`, `src/services/documents/xlsReportService.ts`.

```text
FundData -> normalization -> calculateFundCompletely
  -> calculateFadTotals -> fadRes.sections
     -> buildCanonicalFundLedger (adattamento delle items, non dei section.total)
        -> CanonicalFundResult
           -> FondoAccessorioDipendentePage / DashboardSummary
           -> resolveCabinaViewModel -> CabinaDiRegiaPage
     -> fondi.dipendente.constitution.sections (legacy conservato)
        -> createReportViewModel.fondoDipendenti.costituzione
           -> ReportsPage.handleGenerateFullSummary
              -> generateFullSummaryPDF -> generateFondoPDF
           -> ReportsPage.handleGenerateFADXLS
              -> generateFADXLS -> generateFondoDipendenteXLS

CalculationResult -> projectFundDocument -> documentPresenter
  -> DocumentFactory / Determina moderna / Relazione / Prospetto / Tabella15
```

L'engine assegna summary ai verified totals canonici, ma mantiene le items/section.total legacy con contratto diverso. Il PDF attivo legge items e sec.total; l'XLS attivo legge le stesse sezioni. Il percorso documentale moderno è distinto: questa slice non altera `projectFundDocument`, i suoi fallback di compatibilità, le attestazioni né la readiness esistente.

## Target canonical graph

```text
CanonicalFundResult
  -> projectFadReport(canonical)
     -> FadReportReadModel
        -> createReportViewModel.fadCanonical
           -> futuri CANONICAL_FAD_XLSX / CANONICAL_FUND_SUMMARY_PDF

createReportViewModel.fondoDipendenti e altriFondi
  -> consumer attuali invariati
```

Il nuovo ramo non chiama projectFundDocument o calculateFadTotals, non riceve FundData/sections/summary/raw/cache e non importa alcun calcolatore economico. I soli strumenti monetari runtime sono quelli già presenti in FinancialMath. Riusa il dizionario di descrizioni già disponibile nella proiezione documentale; provenance.legacyField è solo una label di fallback, mai una fonte di importi.

`CANONICAL_FUND_IS_ECONOMIC_AUTHORITY = YES`.
`LEGACY_SECTION_AUTHORITY_IN_NEW_MODEL = NO`.

## Read model contract

- Stato esattamente copiato da CanonicalFundResult: VALID / INVALID / UNDETERMINED.
- Assenza dell'intero risultato: canonicalAvailable false, status UNDETERMINED, tutti i totali null, nessun zero inventato.
- Righe economiche: tutte e sole le entries con economicEffect diverso da false. Conservano anche le righe zero e le righe unresolved.
- signedAmount determinato solo per entry VALID con amount non-null; un importo provvisorio numerico unresolved resta amount informativo con signedAmount null.
- Movimenti figurativi esclusi dalle righe economiche, ma preservati in unresolvedItems se unresolved: possono spiegare lo stato globale non valido/indeterminato.
- Subtotali verified copiati direttamente, senza nuova aggregazione o formula.
- authoritativeTotal è canonical.total soltanto per status VALID; è sempre null per INVALID/UNDETERMINED, anche se il risultato contiene un totale numerico. Nessun fallback al verifiedTotal.
- Nessuna nuova readiness amministrativa, inferenza di parere/delibera/firma/trasmissione o reinterpretazione normativa.

## DTO/type structure

`FadReportRow extends FundLedgerEntry` aggiunge description, signedAmount nullable e reason opzionale. Conserva id, amount nullable, component, operation, competenceYear/originYear, source, status, art23Treatment, normativeRef, economicEffect e provenance.

`FadReportReadModel` espone:

```text
canonicalAvailable: boolean
status: CanonicalFundStatus
rows: readonly FadReportRow[]
unresolvedItems: readonly FadReportRow[]
verifiedStableTotal: number | null
verifiedVariableTotal: number | null
verifiedTotal: number | null
authoritativeTotal: number | null
warnings: readonly string[]
missingPrerequisites: readonly string[]
```

I verified totals diventano null solo quando manca l'intero risultato canonico. Un risultato presente con una componente mancante può avere verifiedTotal = 0: questo è il subtotale canonico, distinto strutturalmente da authoritativeTotal = null.

Integrazione minima nel presenter: nuovo campo root `fadCanonical`, costruito esclusivamente da `projectFadReport(result.canonicalFund)`. Tutti i campi legacy e altri fondi mantengono l'implementazione originale. Re-export già disponibile da domain/index.ts; nessun altro file modificato per esportare i tipi.

## Canonical source mapping

| Campo DTO | Sorgente canonica | Nullable/signed semantics |
|---|---|---|
| row.id | entry.id | identità conservata, nessuna identità da label |
| row.amount | entry.amount | copia esatta, anche null/provvisorio; non sommare gli unresolved |
| row.signedAmount | entry.amount + operation + status | VALID/non-null: roundTo2DP canonico; DEDUCTION = -abs(amount), ADDITION = amount; altrimenti null |
| row.component | entry.component | STABLE/VARIABLE, inclusa componente delle deductions |
| row.operation | entry.operation | ADDITION/DEDUCTION, nessuna seconda sottrazione |
| row.status | entry.status | VALID/MISSING/INVALID/UNDETERMINED preservato |
| row.competenceYear/originYear | entry | nullable preservato, nessun ricalcolo per anno |
| row.source/art23Treatment/normativeRef/economicEffect/provenance | entry | dati canonici preservati, nessuna inferenza normativa |
| row.description | dizionario esistente per id, oppure provenance.legacyField/id | solo descrizione, senza autorità economica |
| row.reason | provenance.reason se stringa | reason già presente; nessun motivo istruttorio inventato |
| verifiedStableTotal | canonical.verifiedStableTotal | null solo se canonical assente; saldo verificato netto già derivato |
| verifiedVariableTotal | canonical.verifiedVariableTotal | stesso contratto |
| verifiedTotal | canonical.verifiedTotal | subtotale distinto; non costituisce fondo definitivo |
| authoritativeTotal | canonical.total | copiato solo se status VALID; nessun fallback; altrimenti null |
| status | canonical.status | invariato; assenza intero input rappresentata come UNDETERMINED |
| warnings/missingPrerequisites | canonical | copie degli array, senza nuova policy |

La trasformazione del segno usa FinancialMath.roundTo2DP e multiplyExact, preservando la precisione in centesimi adottata dal ledger. Nessun ricalcolo di percentuali, limiti, CCNL, Art.60, Art.23, DL25 o PNRR.

## A/2025 characterization

Fixture economica locale come la suite documentConsistencyWave3: straordinario consolidato 2000, incremento corrente 1400, recovery legacy 2800 non istruito e Art.60 raw 127,44; anno 2025.

| Voce | Legacy attivo | Nuovo DTO |
|---|---|---|
| Art.60 | riga con amount 127,44 nelle sections | amount 0, signedAmount 0, VALID |
| Stabile | dettaglio 2000 + 1400 - 127,44; section.total 2000 | verifiedStableTotal 3400 |
| Recovery | amount numerico 2800 nella parte variabile | UNDETERMINED, signedAmount null, reason/provenance preservati |
| Variabile verificata | sezioni non autoritative | verifiedVariableTotal 0 |
| Fondo complessivo | writer legacy ancora attivi | authoritativeTotal null |
| Subtotale verificato | non totale definitivo | verifiedTotal 3400 |

Il test esercita il motore corrente e il presenter reale. Non cambia fixture/golden preesistenti né genera nuovi PDF/XLS. Gli importi nuovi si riconciliano con il risultato canonico, senza usare calculateFadTotals come expected authority.

## Art.60 cases

T3 verifica che Art.60 2025 raw 127,44 diventi esclusivamente la entry canonica zero, senza -127,44 reintrodotto.
T4 costruisce il risultato tramite il ledger corrente per 2026 con Art.60 determinato 127,44: signedAmount -127,44 una sola volta. ART60_ART23_FIGURATIVE è escluso dalle righe economiche.

La projection non controlla l'anno per reinterpretare la norma: riflette quanto già deciso dal ledger.

## Recovery UNDETERMINED case

T5 mantiene amount provvisorio 2800, stato UNDETERMINED, reason e prerequisiti esistenti. signedAmount null impedisce di includere la voce nella somma delle righe determinate. authoritativeTotal null, verifiedTotal separato.

Ulteriore test: risultato canonico UNDETERMINED con total numerico 42 per prerequisiti esterni mancanti. Il DTO conserva status e verifiedTotal 42 ma authoritativeTotal null. Lo stesso vale per INVALID con subtotal numerico: nessuna promozione a fondo definitivo.

## Reconciliation invariants

Per il risultato canonico prodotto dal ledger:

```text
sumExact(rows STABLE, signedAmount determinate) = canonical.verifiedStableTotal
sumExact(rows VARIABLE, signedAmount determinate) = canonical.verifiedVariableTotal
sumExact(all economic rows, signedAmount determinate) = canonical.verifiedTotal
VALID: authoritativeTotal = canonical.total
INVALID / UNDETERMINED: authoritativeTotal = null
```

La produzione copia i totali canonici; non ricomputa aggregati. I test aggregano le righe con FinancialMath.sumAll per dimostrare la quadratura. Figurative entries non entrano nella somma economica; deductions riducono una volta sola.

Lo zero esplicito prevale in T2 (canonico 0, alias 900) e T10 (canonico VALID 0 contro legacy summary/section.total non-zero). Precisione multi-entry/mezzo centesimo in T7: 0,34 + 0,34 + 0,34 - 0,01 - 0,01 = 1,00, senza floating point ad hoc nella nuova projection.

Il test cross-view confronta con i campi canonici consumati da Fondo Personale e con resolveCabinaViewModel: stato, subtotale e totale nullable coincidono. Anche un VALID con canonical.total null conserva null.

## Tests

Nuovo test: `src/domain/__tests__/fadReportReadModel.test.ts`, 17 casi, tutti PASS.

| Acceptance | Evidenza |
|---|---|
| T1 | VALID, addizioni/deductions/zero e esclusione figurativi; righe -> subtotali -> totale |
| T2 | canonical zero / legacy alias 900 |
| T3 | A/2025 reale: Art60 zero, stable 3400, recovery unresolved, total null |
| T4 | Art60 2026 canonico e figurativo separato |
| T5 | recovery provvisorio, reason/prerequisiti, totale non promosso |
| T6 | deduction stabile e variabile una sola volta |
| T7 | fractions/multi-entry/half-cent e quadratura esatta |
| T8 | entry MISSING null e risultato interamente assente null/undefined |
| T9 | INVALID, anche con totale canonico numerico |
| T10 | due fixture divergenti, totali canonici 0 e 55,55; legacy del presenter preservato |
| Ulteriori | prerequisiti esterni, figurativi unresolved, input frozen non mutato, metadata/provenance/label, cross-view Cabina |

Quality gates:

| Gate | Risultato |
|---|---|
| Dedicated FAD_REPORT_READ_MODEL | PASS 17/17 (run finale) |
| canonicalFundLedger.contract | PASS 13/13 |
| Wave 2 Astra characterization | PASS 1/1 |
| documentConsistencyWave3 | PASS 34/34 |
| wave3SystemicFix | PASS 21/21 |
| wave3UiWiring | PASS 19/19 |
| wave3HardeningEvidence | PASS 7/7 |
| documentPresenter | PASS 1/1 |
| AUTH_ADMIN_01 / 02A / 02B | PASS 19 + 34 + 42 = 95/95 |
| tsc --noEmit | PASS exit 0 (anche dopo il test T10 rafforzato) |
| Regression suite | PASS 8/8 |
| Wave 2 oracle | PASS 14/14 |
| Full Vitest offline | PASS 1354/1354, 115 file; zero failed/pending |
| git diff --check | PASS finale, exit 0 |
| Network attempts | 0; nessun evento nel log della guardia |

Run mirato iniziale: 207/207, 11 file; comprendeva 16 casi nuovi prima del rafforzamento T10 a due fixture. Run dedicato finale: 17/17. Nessun test storico/golden aggiornato.

Harness offline in `C:\Users\PUSCED~1\AppData\Local\Temp\fad-report-read-model-7f990176d881490fa8067e4c3e310e25`: env npm offline, URL example.invalid e anon key fittizia, remote drafts disabilitati; NODE_OPTIONS preload che blocca/logga fetch/HTTP/HTTPS/net/TLS/DNS e redirige gli artefatti scritti dalle suite Wave3 in TEMP. Config temporanea importa vite.config.ts invariato e limita i worker a 2. Nessuna dipendenza installata. Oracle e regression eseguiti con npx vite-node e stessa guardia.

## Scope integrity

File produttivi modificati:
- `src/domain/documentProjection.ts`: 59 aggiunte/1 rimozione; nuovi tipi/funzione e ampliamento import type. Corpo projectFundDocument invariato.
- `src/presenters/reportPresenter.ts`: 3 aggiunte; import, campo tipo e wiring; campi legacy invariati.

Aggiunte: solo il nuovo test e questo report. Nessun altro type export necessario.

Confronto finale dopo suite completa e creazione del report: 1070 file PRE, 1072 POST. Solo i due file produttivi sopra sono diversi; tutti gli altri 1068 file PRE sono byte-identici. Zero rimossi. Le sole aggiunte sono `src/domain/__tests__/fadReportReadModel.test.ts` e questo report.

Delta git status PRE/POST, senza alcuna riga PRE rimossa:

```text
 M src/domain/documentProjection.ts
 M src/presenters/reportPresenter.ts
?? src/domain/__tests__/fadReportReadModel.test.ts
```

Il report ignored è censito separatamente nell'inventario hash. Inventario POST salvato accanto al PRE nel percorso TEMP del quality harness, come `post-inventory.json`. Branch e HEAD ricontrollati identici; diff cached POST ancora vuoto. Esaminato `git diff -- src/domain/documentProjection.ts src/presenters/reportPresenter.ts` e il nuovo test untracked; nessun git add. Anche il run completo include i 17 casi dedicati finali e tutte le regressioni.

Hash PRE dei file protetti (verificati identici nel primo POST):

| File protetto | SHA-256 PRE |
|---|---|
| `supabase/functions/create-user/index.ts` | `D95E40ACDC81B16C7AFBF9970C49F6E9361E2C6802F9DFF5D555BC5D1F25CFD4` |
| `supabase/functions/update-password/index.ts` | `04B07282D4D52DD2F098E38E94A302D425B5BE3DF964491D346FB7E62DA183C1` |
| `supabase/functions/delete-user/index.ts` | `7E475D7B4A384F0F258EE227ACDF85A7EC9CD71631FC7814F0C7EB37DAABA11C` |
| `src/__tests__/createUserAdminAuthorization.test.ts` | `4AC728B2773092E90937F5B6CD77D5FC28F3264CAA9D5791AFFD2426C6B20326` |
| `src/__tests__/updatePasswordCanonicalAuthorization.test.ts` | `24BE29008EDB71AAA9A1C9DC07ACD1CDB1CD870E147E5212A8D2EE10E799B4A8` |
| `src/__tests__/deleteUserCanonicalAuthorization.test.ts` | `1372BDC3A980958A654A34B5FE64A2EE38A24B32905FB56C38C8A8F9F038E314` |
| `src/pages/UserManagementPage.tsx` | `21124D8B493F03C19493E57C2B69B2913C6EDB5DCF25A54DAFA24FF7AFF47F31` |
| `supabase/migrations/20261002000000_harden_auth_profile_role_source.sql` | `8670E439CD6FA8AE969652445637168491AFD3388DE710CE2AE9E2752EF2614D` |
| `AUTH_ADMIN_01_IMPLEMENTATION_REPORT.md` | `2FC883011037F9FA192815F63318447A6A245DEEDFB2EAAC3A7F8349C256484C` |
| `AUTH_ADMIN_01_INDEPENDENT_REVIEW.md` | `0B1D5CA371CBE0C08680F0EE84616FFAF8253A343E43E40333E73A197CC33E96` |
| `AUTH_ADMIN_02A_IMPLEMENTATION_REPORT.md` | `A99FE6EC16921DDE2D36FB33B3021DED63E3ABCF6A984D584B80A6105ECD6C14` |
| `AUTH_ADMIN_02A_INDEPENDENT_REVIEW.md` | `A2EE8D9B735193A05D472F459320BFBA80C751B888568666D13466A1E7133554` |
| `AUTH_ADMIN_02B_IMPLEMENTATION_REPORT.md` | `463D45AEF090B2E73AB8205176927A0838957002AD4A439A3395C2457CC9C194` |
| `AUTH_ADMIN_02B_INDEPENDENT_REVIEW.md` | `F56F1F84D89561B1EA227736100C4E78A5AF8BC0C6153EDDECB2D823EF22302F` |
| `src/domain/canonicalFundLedger.ts` | `2585F4038D62D1787D9F981D8CC68DF45C6BCE35F4946436FDB74139ABA07F9B` |
| `src/logic/calculation/canonicalFundLedger.ts` | `44E7E20D8D2F062FE3688AF841AD4BCB2B225093C97B3880BC7FFE3D83D639EB` |
| `src/logic/calculation/fundEngine.ts` | `6AC723E7343E1AC6A448464AD761488E6DCB9D7F6491AB2729F8316FD9A83C27` |
| `src/services/documents/pdfReportService.ts` | `86CFDA0A5DDBF5E01F548660660A94242F25AD04820A43647B615DF181C5A6F2` |
| `src/services/documents/xlsReportService.ts` | `E74FA20CF00AB102F46C1EC1635BFA19FEC08F3CDA9775B789DBE95836A56B48` |
| `src/pages/ReportsPage.tsx` | `45B2F80A843419037538AC7E85711B06D477EEAC0B1BBDABA634BAE523F3C29A` |
| `src/logic/calculation/tabella15Mapper.ts` | `390C99EAB60AA0952D33EF6358459793FCF3E6DFF2ADE40B870DBA736D6F0F6A` |

Nessun cambiamento ad Auth, UserManagementPage/role mirror, migration, financial engine/ledger formulas, PDF/XLS writer, ReportsPage CTA, Tabella15, RGS_SCHEMA_UNVERIFIED, readiness, Cabina, Distribuzione, evidence pack o report preesistenti. Il report nuovo è ignored dalla regola preesistente `.gitignore:53:*report*.md`; la regola resta invariata, nessun staging Git.

## Residual findings

- CALC-02 remains PARTIALLY_FIXED until writers migrate.
- NORM-01 remains PARTIALLY_FIXED until active exporters migrate.
- NORM-02 remains PARTIALLY_FIXED.
- DOC-02 remains PARTIALLY_FIXED.
- ARCH-01 remains PARTIALLY_FIXED.
- FAD_REPORT_READ_MODEL is infrastructure prerequisite only.
- AUTH_ADMIN_01 / AUTH_ADMIN_02A / AUTH_ADMIN_02B = CLOSED_LOCALLY, byte-identici al PRE.
- AUTH_ROLE_03, DELETE_CLEANUP_FINDING e AUTH_PROFILE_ROLE_PENDING_GATE non lavorati; migration Auth resta APPLY_PENDING / LIVE_FIX_NOT_VERIFIED.
- DOC-01 / RGS_SCHEMA_UNVERIFIED invariati nel perimetro esistente.
- DOCUMENT_KIND_READINESS non implementato; niente nuovi prerequisiti amministrativi.
- Nessuna formula normativa nuova o correzione del ledger; nessun nuovo finding normativo dedotto dai dati.

FAD_REPORT_READ_MODEL_IMPLEMENTATION = COMPLETE.
RESULT = PASS locale.
NEXT_GATE_RECOMMENDATION = FAD_REPORT_READ_MODEL_INDEPENDENT_REVIEW.
NETWORK_ATTEMPTS = 0. DATABASE_CHANGED = NO. MIGRATIONS_APPLIED = NO.
STAGING_CONTACTED = NO. PRODUCTION_CONTACTED = NO.
GIT_ADD = NO. COMMIT = NO. PUSH = NO. PR = NO. DEPLOY = NO.
