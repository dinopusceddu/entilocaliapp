# AUTH_ADMIN_02B_IMPLEMENTATION_REPORT

## Baseline

Slice: `AUTH_ADMIN_02B_DELETE_CANONICAL_AUTH`.
Branch: `ux/toolbox-area-fondo-prototype`.
HEAD: `d3170f959b5815c514dbf3d6e5f93366a5f14c67`.
Baseline verificata prima di qualsiasi modifica; nessun checkout, fetch, pull, reset, stash, merge o rebase.

Comandi PRE eseguiti: `git status --short --untracked-files=all`, `git branch --show-current`, `git rev-parse HEAD`, `git diff --name-status`, `git diff --cached --name-status`.

Working tree PRE, output completo di git status (incluse le quotature originali di Git):

```text
 M src/__tests__/securityMigrations.test.ts
 M src/features/wizard2026/__tests__/wizard2026RemoteDraftSync.test.ts
 M supabase/functions/create-user/index.ts
 M supabase/functions/update-password/index.ts
?? .gitnexus/lbug
?? .gitnexus/lbug.wal
?? ASTRA_FINAL_FINDINGS_RECONCILIATION.md
?? ASTRA_FINAL_RECONCILIATION_INDEPENDENT_REVIEW.md
?? ASTRA_NORMATIVE_MATRIX.md
?? ASTRA_TEST_MATRIX.md
?? AUTH_ADMIN_01_INDEPENDENT_REVIEW.md
?? AUTH_ADMIN_02A_INDEPENDENT_REVIEW.md
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

Diff PRE non staged:

```text
M	src/__tests__/securityMigrations.test.ts
M	src/features/wizard2026/__tests__/wizard2026RemoteDraftSync.test.ts
M	supabase/functions/create-user/index.ts
M	supabase/functions/update-password/index.ts
```

Diff PRE staged: vuoto. Inventario SHA-256 PRE: 1067 file esistenti, ottenuto da tracked + untracked non ignored + report root preesistenti ignored. Nessun file preesistente è stato cancellato, spostato, ricreato o normalizzato fuori dal file produttivo autorizzato.

## Existing delete-user contract

Ricostruzione prima dell'implementazione dal file completo `supabase/functions/delete-user/index.ts`, dalla chiamata `UserManagementPage.handleDeleteUser` e dalle migration locali di FK/trigger.

L'endpoint è ADMIN-only: prima del fix autentica il caller con `auth.getUser()` e verifica il ruolo ADMIN tramite `user_app_state.role`, filtrando `user_id = currentUser.id`, con `limit(1).single()`. Non esiste ramo self-service per USER/GUEST.

Il body contiene `{ userId }`, che identifica esclusivamente il target. Un controllo di presenza/falsy richiede userId; non è stata aggiunta validazione diversa. Il server non impone restrizioni sul ruolo del target, non impedisce ADMIN self-delete e non impedisce la cancellazione di un altro ADMIN. L'ammissione alla chiamata Auth è distinta dall'effettivo successo dell'operazione Auth/DB.

| Caller | Target | Policy server preesistente e preservata |
|---|---|---|
| ADMIN | sé stesso | ALLOW alla chiamata Auth |
| ADMIN | USER | ALLOW alla chiamata Auth |
| ADMIN | altro ADMIN | ALLOW alla chiamata Auth |
| USER | sé stesso | DENY |
| USER | ADMIN | DENY |

BUSINESS_POLICY_NOTE: l'interfaccia disabilita il pulsante Elimina per il proprio account (`UserManagementPage.tsx:526`), ma il server non contiene questo vincolo. L'endpoint mantiene il comportamento server preesistente; nessuna protezione self-delete o last-admin è stata inventata.

L'API privilegiata è `supabaseAdmin.auth.admin.deleteUser(userId)`, con un solo argomento: nessuna modifica alla modalità di cancellazione. Risposta successo HTTP 200 con `{ success: true, message: "User <userId> deleted successfully" }`. Errori e dinieghi restano HTTP 400, come nel catch preesistente. CORS e preflight OPTIONS sono invariati.

## Vulnerability

Il trust boundary preesistente usa uno snapshot applicativo denormalizzato come authority. `user_app_state.role` può divergere da `profiles.role`; zero/uno/molte annualità e il mirror selezionato possono influenzare l'autorizzazione. Il ruolo canonico DB già usato dagli helper locali è `public.profiles.role`.

Sono state lette le sezioni ARCH-02, AUTH_ADMIN_02, AUTH_ROLE_03 e AUTH_PROFILE_ROLE_PENDING_GATE dei due documenti ASTRA di riconciliazione; inoltre i tre endpoint completi, entrambi i test delle slice precedenti e i relativi implementation/independent review report. I finding storici non equivalgono allo stato delle due slice già chiuse localmente.

## Canonical authorization design

Flusso implementato:

1. OPTIONS conserva il preflight senza autenticazione, body o mutazioni.
2. Header Authorization obbligatorio; assenza termina con Unauthorized nel catch HTTP 400.
3. Il client caller passa quell'header a `auth.getUser()`; error o user assente termina senza lookup/mutazioni.
4. Solo dopo caller verificato viene istanziato il service-role client.
5. Lettura server-side `profiles.select('role').eq('id', currentUser.id).maybeSingle()`.
6. Errore query o Promise rejection termina con `Authorization check failed`, senza dettagli SQL.
7. Solo `adminCheck?.role === 'ADMIN'` permette di proseguire. Profilo assente, NULL, altri valori e non-admin terminano con il messaggio preesistente `Unauthorized: Admin access required`.
8. Solo dopo ALLOW: parsing body, controllo userId e unica mutazione Auth preesistente.

Nessun fallback e nessuna RPC `is_admin()` tramite service-role. Il read usa l'ID del caller verificato esplicitamente e non dipende da `auth.uid()` del service client.

`PROFILES_ROLE_IS_CANONICAL = YES`.
`CALLER_IDENTITY_SOURCE = verified JWT user id via auth.getUser()`.
`CANONICAL_ROLE_SOURCE = public.profiles.role`.

## Caller vs target

CALLER: `currentUser.id` restituito da `supabaseClient.auth.getUser()`.
TARGET: `userId` estratto dal body dopo ALLOW.

Il lookup canonico usa sempre `profiles.id = currentUser.id`. Il target non viene interrogato per autorizzare il caller. Il body non può sostituire l'ID verificato; role, callerRole, callerId, user_id e targetRole avversari sono ignorati.

## Existing destructive workflow

Inventario completo delle operazioni esplicite dell'endpoint:

- Read: `auth.getUser()`, lookup `profiles.role`.
- Unica mutazione: `auth.admin.deleteUser(userId)`.
- Nessun `.delete()`, `.update()`, `.insert()`, `.upsert()`, RPC mutativa, revoke o cleanup esplicito.
- Nessuna modifica applicativa precede l'Auth delete. L'endpoint demanda l'eventuale cleanup ai vincoli e trigger DB; non orchestra due fasi e non cambia ordine.

Le migration locali definiscono cascade da auth.users verso profiles, entities e user_app_state (20260220000000/01/02), wizard2026_drafts (20260602000000), messaggi/ricevute e notifiche/ricevute (20260222182000 e 20260315). Alcuni author_id vengono impostati NULL. Queste sono definizioni locali, non verifica dello schema live né garanzia che tutte le dipendenze consentano il delete.

`user_app_state` può essere coinvolto come dato eliminato dalla cascade, senza partecipare al gate autorizzativo.

SEPARATE_CLEANUP_FINDING: il trigger locale `20260928000000_harden_user_app_state_closed_boundary.sql` blocca DELETE su CLOSED salvo `app.allow_admin_cleanup = true` e `public.is_admin() = true`. Questo endpoint non imposta il flag e non propaga una sessione caller DB per il cleanup Auth. CLOSED e altri vincoli FK possono quindi ostacolare la cancellazione/cascade; non sono condizioni dell'ALLOW nell'Edge Function. In particolare `knowledge_documents.uploaded_by` è una FK senza ON DELETE CASCADE nella definizione locale. Successo, atomicità e cleanup effettivo live non sono provati da questi test. Nessun bypass CLOSED o riparazione di atomicità/cleanup in questo slice.

## Decision matrix

| Scenario | Risultato | HTTP preservato | Body letto | Auth delete |
|---|---|---|---|---|
| ANON / Authorization assente | DENY | 400 | NO | 0 |
| INVALID JWT / getUser error | DENY | 400 | NO | 0 |
| getUser senza user / rejection | DENY | 400 | NO | 0 |
| NO PROFILE | DENY | 400 | NO | 0 |
| NULL | DENY | 400 | NO | 0 |
| GUEST | DENY | 400 | NO | 0 |
| USER | DENY | 400 | NO | 0 |
| admin / spazi / vuoto / inatteso | DENY | 400 | NO | 0 |
| lookup error, anche con riga ADMIN | DENY generico | 400 | NO | 0 |
| lookup Promise rejection | DENY generico | 400 | NO | 0 |
| ADMIN + target valido | ALLOW | 200 se Auth successo | SÌ | 1 |
| ADMIN + userId assente/falsy | validation failure dopo ALLOW | 400 | SÌ | 0 |
| ADMIN + Auth delete error | errore dopo ALLOW, NON deny autorizzativo | 400 | SÌ | 1 tentativo |
| OPTIONS | preflight | 200 | NO | 0 |

Un HTTP 400 dopo un tentativo Auth autorizzato non viene confuso con un diniego del gate. Solo i dinieghi/validation failures prima della mutazione hanno zero chiamate.

## Destructive-side-effect matrix

| API/categoria realmente presente | Prima di ALLOW | Su ogni authorization DENY | Su ALLOW con target valido |
|---|---|---|---|
| `auth.admin.deleteUser` (spy individuale) | 0 | 0 | esattamente 1 |
| DB delete/update espliciti | assenti | 0 | assenti |
| Altre mutazioni privilegiate/RPC | assenti | 0 | assenti |
| Cascade DB indiretta dall'Auth delete | nessuna richiesta Auth avviata | nessuna richiesta Auth avviata | delegata al servizio/DB; non eseguita dai mock |

Non sono stati inventati spy per metodi DB assenti. Il test statico inventaria l'unica API mutativa e vieta l'introduzione di DML/RPC/altre API Auth; gli spy Auth verificano tutti i deny. I test con lookup pendente (poi ADMIN o USER) verificano che nessun parsing/mutazione possa precedere la risoluzione del profilo.

`DENIED_REQUEST_HAS_ZERO_DESTRUCTIVE_MUTATIONS = YES`.
`AUTH_DELETE_MUTATIONS_ON_DENY = 0`.
`DB_MUTATIONS_ON_DENY = 0`.

## Adversarial spoofing

Tutti i seguenti scenari sono esercitati sull'handler produttivo reale, senza contattare Supabase:

- Ognuna delle quattro fonti metadata `user_metadata`, `app_metadata`, `raw_user_meta_data`, `raw_app_meta_data` con ADMIN e profilo USER: DENY, zero delete.
- Custom role claim ADMIN con profilo USER: DENY.
- Snapshot ADMIN con zero/una/molte annualità e OPEN/CLOSED con profilo USER: DENY.
- Body role/callerRole ADMIN e callerId/user_id di un altro profilo ADMIN: DENY per caller USER verificato.
- Caller USER verso target ADMIN e verso sé stesso: DENY.
- Caller ADMIN verso target USER, altro ADMIN e sé stesso: ALLOW preesistente.
- Profilo ADMIN con metadata/custom claim GUEST, snapshot USER/GUEST OPEN/CLOSED e body non-admin/spoofed ID: ALLOW, lookup sempre caller.
- Body JSON malformato da non-admin: DENY prima di parsing.
- Error/rejection lookup: risposta generica, zero delete, nessuna informazione SQL.

La ricerca statica nel file produttivo trova soltanto `profiles.role` come fonte decisionale; metadata, user_app_state, frontend/storage sono assenti. Nel test tali stringhe compaiono esclusivamente nelle fixture avversarie e negli assert di irrilevanza. Il body produttivo destruttura solo userId dopo il gate.

```text
RAW_USER_METADATA_AUTHORITY = NO
RAW_APP_METADATA_AUTHORITY = NO
USER_APP_STATE_ROLE_AUTHORITY = NO
REQUEST_BODY_ROLE_AUTHORITY = NO
REQUEST_BODY_CALLER_ID_AUTHORITY = NO
TARGET_ROLE_AUTHORITY_FOR_CALLER = NO
```

## Tests

Nuovo file: `src/__tests__/deleteUserCanonicalAuthorization.test.ts`.
Esegue l'handler produttivo con transpile TypeScript + VM; sostituisce esclusivamente gli import remoti serve/createClient con boundary mock. Request e Response locali reali; nessun utente/DB reale. Copre tutti i 20 scenari richiesti, includendo variazioni metadata/ruoli/snapshot, errori, preflight, validation, sequencing e inventario API.

Risultati finali mirati:

| Suite | Risultato |
|---|---|
| AUTH_ADMIN_02B dedicati | PASS, 42/42 |
| AUTH_ADMIN_02A regressione | PASS, 34/34 |
| AUTH_ADMIN_01 regressione | PASS, 19/19 |
| securityMigrations | PASS, 27/27 |
| authorizationPolicy | PASS, 27/27 |
| accessMatrix | PASS, 12/12 |
| Totale mirato | PASS, 161/161, 6 file |
| npx tsc --noEmit | PASS, exit 0 |
| Full Vitest offline | PASS, 1337/1337, 114 file, zero failed/pending |
| git diff --check | PASS, exit 0 |
| Network attempts | 0; nessun evento nel log della guardia offline |

Nel primo run del nuovo harness erano emersi problemi di parametrizzazione delle righe snapshot e di sincronizzazione tra Promise/VM. Corretti esclusivamente nel nuovo test; il run mirato finale passa interamente. Nessun file di test preesistente è stato modificato.

Quality harness temporaneo: `C:\Users\PUSCED~1\AppData\Local\Temp\auth-admin-02b-2dfa0ef9f42340b4ae4d4a5aedb9d9b6`.
Config esterna importa vite.config.ts invariato e limita i worker a 2. Preload offline blocca/logga fetch, HTTP/HTTPS, net.Socket.connect, TLS e DNS. Environment: npm offline, URL example.invalid, anon key fittizia, remote drafts disabilitati. Le scritture di evidence/PDF della suite vengono redirette in TEMP, preservando gli evidence pack PRE.

Comandi eseguiti: `npx vitest run` sui sei file indicati con config temporanea e guardia offline; `npx tsc --noEmit`; `npx vitest run --reporter=json --outputFile=<TEMP>/full-tests.json --silent` con stessa config/guardia; `git diff --check`. Nessuna dipendenza installata. tsc controlla il progetto src secondo tsconfig; la Edge Function Deno viene transpiled ed eseguita nei test con boundary mock, senza risolvere URL remoti.

## Deployment dependency

`DEPLOYMENT_DEPENDENCY_PROFILE_ROLE_MIGRATION = YES`.
`supabase/migrations/20261002000000_harden_auth_profile_role_source.sql` resta `APPLY_PENDING / LIVE_FIX_NOT_VERIFIED`; bytes invariati. Fonte canonica letta sul server e integrità dei writer di tale fonte sono gate distinti.

Nessuna migration creata/applicata, nessun db push/up/repair. Nessuna connessione a staging `mcasgpaivyosaroxrodm` o produzione `yggokplxleredipknfbq`. Non si dichiara sicurezza live dell'intero sistema.

## Scope integrity

Delta produttivo: solo `supabase/functions/delete-user/index.ts`, 18 linee aggiunte e 14 rimosse; tutto il flusso da parsing target in avanti è invariato.
Aggiunte autorizzate: un test dedicato e questo report.

Confronto finale SHA-256 PRE/POST dopo suite completa e creazione del report: 1067 file PRE, 1069 POST; solo delete-user cambia. Tutti gli altri 1066 file PRE sono byte-identici; zero mancanti. Le sole aggiunte sono il test dedicato e questo report.

Delta git status rispetto al PRE (nessuna riga PRE rimossa):

```text
 M supabase/functions/delete-user/index.ts
?? src/__tests__/deleteUserCanonicalAuthorization.test.ts
```

Il report ignored è incluso separatamente nell'inventario SHA-256. Diff cached POST ancora vuoto. Branch e HEAD ricontrollati e invariati. Verificato inoltre che il suffisso produttivo da `const { userId } = await req.json()` fino al termine è testualmente invariato rispetto a HEAD (confronto delle linee), quindi validazione target, mutazione, ordine, risposte e catch preesistenti sono preservati. Eseguito `git diff -- supabase/functions/delete-user/index.ts src/__tests__/deleteUserCanonicalAuthorization.test.ts`; il test untracked è verificato direttamente e dalla suite, senza staging.

File protetti (hash PRE e uguaglianza POST già controllata):

| File | SHA-256 PRE | POST |
|---|---|---|
| `supabase/functions/create-user/index.ts` | `D95E40ACDC81B16C7AFBF9970C49F6E9361E2C6802F9DFF5D555BC5D1F25CFD4` | IDENTICO |
| `supabase/functions/update-password/index.ts` | `04B07282D4D52DD2F098E38E94A302D425B5BE3DF964491D346FB7E62DA183C1` | IDENTICO |
| `src/pages/UserManagementPage.tsx` | `21124D8B493F03C19493E57C2B69B2913C6EDB5DCF25A54DAFA24FF7AFF47F31` | IDENTICO |
| `src/__tests__/createUserAdminAuthorization.test.ts` | `4AC728B2773092E90937F5B6CD77D5FC28F3264CAA9D5791AFFD2426C6B20326` | IDENTICO |
| `src/__tests__/updatePasswordCanonicalAuthorization.test.ts` | `24BE29008EDB71AAA9A1C9DC07ACD1CDB1CD870E147E5212A8D2EE10E799B4A8` | IDENTICO |
| `src/__tests__/securityMigrations.test.ts` | `4A2217191B161894846271D47C738BA2DEA1B72CC0626504E273958A8305D403` | IDENTICO |
| `src/features/wizard2026/__tests__/wizard2026RemoteDraftSync.test.ts` | `188B79924C5A8D387A58D9ED3AFE6251E1E11AC9FFCECD759A1B694204CFE0F4` | IDENTICO |
| `AUTH_ADMIN_01_IMPLEMENTATION_REPORT.md` | `2FC883011037F9FA192815F63318447A6A245DEEDFB2EAAC3A7F8349C256484C` | IDENTICO |
| `AUTH_ADMIN_01_INDEPENDENT_REVIEW.md` | `0B1D5CA371CBE0C08680F0EE84616FFAF8253A343E43E40333E73A197CC33E96` | IDENTICO |
| `AUTH_ADMIN_02A_IMPLEMENTATION_REPORT.md` | `A99FE6EC16921DDE2D36FB33B3021DED63E3ABCF6A984D584B80A6105ECD6C14` | IDENTICO |
| `AUTH_ADMIN_02A_INDEPENDENT_REVIEW.md` | `A2EE8D9B735193A05D472F459320BFBA80C751B888568666D13466A1E7133554` | IDENTICO |
| `supabase/migrations/20261002000000_harden_auth_profile_role_source.sql` | `8670E439CD6FA8AE969652445637168491AFD3388DE710CE2AE9E2752EF2614D` | IDENTICO |

Formule finanziarie, Canonical Fund Ledger, Reports/documenti/presenter, Cabina, Distribuzione, migration A/B/C e Auth, role mirror e tutti gli evidence pack/untracked PRE sono conservati. Nessun file estraneo alterato. Il report è ignored dalla regola preesistente `.gitignore:53:*report*.md`, come i report delle slice precedenti; la regola non viene cambiata e non viene eseguito git add.

## Residual findings

- AUTH_ADMIN_01 remains closed locally (implementation + independent review), byte-exact rispetto al PRE.
- AUTH_ADMIN_02A remains closed locally (implementation + independent review), byte-exact rispetto al PRE.
- AUTH_ADMIN_02B: `AUTH_ADMIN_02B_IMPLEMENTATION = COMPLETE`, `RESULT = PASS` locale. Prossimo gate: `AUTH_ADMIN_02B_INDEPENDENT_REVIEW`.
- AUTH_ROLE_03 remains OPEN; nessun intervento sul mirror/UserManagementPage.
- AUTH_PROFILE_ROLE_PENDING_GATE remains APPLY_PENDING / LIVE_FIX_NOT_VERIFIED.
- CALC-02/NORM-01 untouched; DOC-02/NORM-02/ARCH-01 e FAD_REPORT_READ_MODEL non iniziati.
- BUSINESS_POLICY_NOTE e SEPARATE_CLEANUP_FINDING sopra restano separati: nessuna modifica della policy distruttiva o del cleanup.

Nessun git add, commit, push, PR, merge o deploy. Nessuna DB mutation reale, fixture remota, login/signup/delete remoto.
