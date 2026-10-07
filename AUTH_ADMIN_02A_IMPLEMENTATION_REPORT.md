# AUTH_ADMIN_02A Implementation Report

Slice: `AUTH_ADMIN_02A_PASSWORD_CANONICAL_AUTH`.
Result: **PASS — AUTH_ADMIN_02A_IMPLEMENTATION = COMPLETE**.
Implementazione locale per review indipendente. Nessun deploy o verifica live.

## Baseline

- Branch: `ux/toolbox-area-fondo-prototype`.
- HEAD: `d3170f959b5815c514dbf3d6e5f93366a5f14c67`.
- Branch/HEAD corrispondono ai valori richiesti, verificati prima di qualsiasi modifica.
- Eseguiti PRE: `git status --short --untracked-files=all`, `git branch --show-current`, `git rev-parse HEAD`, `git diff --name-status`, `git diff --cached --name-status`.
- Diff non staged PRE: securityMigrations.test.ts, wizard2026RemoteDraftSync.test.ts, create-user/index.ts. Diff staged PRE vuoto.
- Inventario SHA-256 PRE: **1.064 file**, tracked/untracked non ignored più i report Markdown root esistenti, incluso il report AUTH_ADMIN_01 ignorato da Git.

Working-tree PRE integrale:

```text
 M src/__tests__/securityMigrations.test.ts
 M src/features/wizard2026/__tests__/wizard2026RemoteDraftSync.test.ts
 M supabase/functions/create-user/index.ts
?? .gitnexus/lbug
?? .gitnexus/lbug.wal
?? ASTRA_FINAL_FINDINGS_RECONCILIATION.md
?? ASTRA_FINAL_RECONCILIATION_INDEPENDENT_REVIEW.md
?? ASTRA_NORMATIVE_MATRIX.md
?? ASTRA_TEST_MATRIX.md
?? AUTH_ADMIN_01_INDEPENDENT_REVIEW.md
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

Letti integralmente update-password, create-user, il test AUTH_ADMIN_01, il relativo implementation report e l'independent review. Letti ARCH-02, AUTH_ADMIN_02, AUTH_ROLE_03 e AUTH_PROFILE_ROLE_PENDING_GATE nei due documenti ASTRA. Ispezionati il caller frontend UserManagementPage e gli helper SQL canonici.

## Existing update-password contract

**Policy dell'endpoint: ADMIN-only, anche per target uguale al caller.** Nessun ramo self-service USER/GUEST e nessuna eccezione `targetUserId === user.id`.

Il caller autenticato viene verificato con `auth.getUser()`. Nel PRE il ruolo ADMIN era letto da user_app_state. Una volta ammesso, il caller può cambiare la password di sé stesso oppure di un altro utente: il codice non restringe il target per ruolo o ownership.

Body previsto: `{ targetUserId, newPassword }`.
UserManagementPage seleziona `user.id` come target e invoca update-password con quei due campi. L'endpoint richiede targetUserId/newPassword presenti e password di almeno sei caratteri; il testo originale di validazione resta invariato.

Capability privilegiata: client con `SERVICE_ROLE_KEY`, chiamata `supabaseAdmin.auth.admin.updateUserById(targetUserId, { password: newPassword })`, dopo l'autorizzazione e la validazione.

Successo originale preservato: HTTP 200, `{ success: true, message: 'Password updated successfully' }`.
Errori/dinieghi originali preservati: HTTP 400 con `{ error: ... }`, senza introdurre 401/403 in questo slice.
CORS e OPTIONS (`200 ok`) preservati. Non sono state aggiunte nuove regole per password o target.

**BUSINESS_POLICY_AMBIGUOUS = NO**: codice server e caller frontend documentano il percorso amministrativo; nessuna nuova policy inventata.

## Vulnerability

Il PRE interrogava `user_app_state.role` con filtro user_id del caller e `.single()`. L'autorità era un mirror degli snapshot: zero o più righe potevano causare diniego, mentre un mirror ADMIN obsoleto/spoofato poteva autorizzare un caller con profiles USER. Le annualità applicative e il loro stato non devono determinare privilegi Auth.

Questo slice elimina esclusivamente questa fonte autorizzativa da update-password.

## Canonical authorization design

Flusso:

1. OPTIONS resta preflight senza credenziali/mutazioni.
2. Authorization assente → Unauthorized, termina prima di creare client.
3. Header inoltrato al client anon; `auth.getUser()` verifica il caller. Errore o user assente → Unauthorized.
4. Dopo l'autenticazione si crea il client service-role per leggere soltanto `public.profiles.role`.
5. Query: `.from('profiles').select('role').eq('id', user.id).maybeSingle()`. Lo schema default del client è public; l'ID è quello verificato dal servizio Auth.
6. Error object oppure rigetto della Promise di lookup → errore generico `Authorization check failed`. Nessun dettaglio SQL/database esposto.
7. Profilo assente, NULL o qualsiasi ruolo diverso esattamente da ADMIN → `Forbidden: Only Admins can change passwords`.
8. Solo dopo ALLOW vengono letti targetUserId/newPassword, mantenuta la validazione e chiamata updateUserById.

Il `Promise.resolve(...).catch(...)` locale maschera anche il rigetto asincrono del lookup; non è un helper generale o condiviso.
Nessun uso di `is_admin()` con service-role: quel helper dipende da `auth.uid()`, mentre qui il caller verificato è esplicitamente nel filtro.
Nessuna modifica a create-user.

Delta produttivo: **12 righe aggiunte, 7 rimosse**, soltanto update-password/index.ts. CORS, success response, input validation, password payload e chiamata Auth finale invariati.

## Caller vs target model

| Dato | Fonte | Utilizzo |
|---|---|---|
| Caller identity | user.id di auth.getUser() | Unico ID per il lookup autorizzativo profiles |
| Caller role | profiles.role per l'ID verificato | Solo ADMIN permette l'operazione |
| Target identity | body.targetUserId, letto dopo ALLOW | Primo argomento di updateUserById |
| Target role | Nessuna lettura nel codice produttivo | Nessuna autorità sul caller |
| Body callerId/userId/user_id/id/role | Ignorati | Non sostituiscono l'identità o il ruolo caller |

ADMIN può essere target di sé stesso o di un altro account. USER non può usare questo endpoint nemmeno per la propria password.

## Decision matrix

Richieste operative con input valido; tutti i dinieghi mantengono HTTP 400 esistente.

| Caller / profiles.role | Decisione | updateUserById |
|---|---|---:|
| ANON / header assente | DENY — Unauthorized | 0 |
| INVALID JWT / getUser error | DENY — Unauthorized | 0 |
| Verified user assente | DENY — Unauthorized | 0 |
| PROFILE MISSING | DENY — Forbidden | 0 |
| NULL | DENY — Forbidden | 0 |
| GUEST | DENY — Forbidden | 0 |
| USER, target self o altro | DENY — Forbidden | 0 |
| ADMIN, target self o altro | ALLOW — HTTP 200 se Auth riesce | 1 |
| Lowercase/spazi/vuoto/inatteso | DENY — Forbidden | 0 |
| Lookup error/rejection anche con data ADMIN | DENY — errore generico | 0 |

Un errore Admin Auth successivo ad ALLOW è un fallimento dell'operazione autorizzata, non un diniego autorizzativo: conserva l'errore originale e la singola chiamata Auth.

## Adversarial spoofing cases

- Metadata user/app e raw user/app falsamente ADMIN con profiles USER: DENY, verificati singolarmente.
- user_app_state ADMIN, anche CLOSED, con profiles USER: DENY.
- Body role/callerRole ADMIN e ID caller falsi: DENY se profiles del caller verificato è USER; il filtro continua a usare verified user.id.
- Target distinto con profiles ADMIN + caller profiles USER: DENY; nessun lookup del target per autorizzare.
- Caller profiles ADMIN + target GUEST + metadata USER/GUEST + snapshot USER CLOSED + body role GUEST/ID falso: ALLOW sul target richiesto, usando il profilo del caller.
- Zero, una o tre annualità con ruoli misti e stati OPEN/CLOSED: decisione identica (USER DENY, ADMIN ALLOW). Nessun accesso a user_app_state.
- Lookup error e rigetto con dettagli SQL privati: DENY senza esposizione dei dettagli.
- USER con JSON malformato: diniego prima del parsing, zero mutazioni.

Ricerca negativa `rg` nel produttivo e nel test per raw_user_meta_data/raw_app_meta_data/user_app_state/role/callerId/targetUserId/frontend/req.json: nel produttivo le fonti metadata/state/storage sono assenti. Nel test compaiono esclusivamente come fixture avversariali e asserzioni di assenza dal sorgente. Dal body produttivo sono estratti soltanto targetUserId/newPassword dopo il check.

```text
PROFILES_ROLE_IS_CANONICAL = YES
USER_APP_STATE_ROLE_AUTHORITY = NO
RAW_USER_METADATA_AUTHORITY = NO
RAW_APP_METADATA_AUTHORITY = NO
REQUEST_BODY_ROLE_AUTHORITY = NO
TARGET_ROLE_AUTHORITY_FOR_CALLER = NO
DENIED_REQUEST_HAS_ZERO_PASSWORD_MUTATIONS = YES
```

## Tests

Test dedicato: `src/__tests__/updatePasswordCanonicalAuthorization.test.ts`, **34/34 PASS**.
Esegue l'handler reale con TypeScript locale + VM, rimuovendo solo i due import remoti; mock dei boundary serve, createClient, getUser, lookup profiles, updateUserById e Deno.env. Nessuna reimplementazione della decisione nel test, nessun client Supabase reale.

La Map delle fixture conserva profili distinti per caller e target e risolve il lookup in funzione dell'ID interrogato: la verifica può rilevare un lookup sul target. Gli spy impongono solo profiles/select role/eq id del caller verificato e una sola maybeSingle.

Ogni diniego autorizzativo verifica zero updateUserById e body non letto. I casi input invalido dopo ADMIN verificano anch'essi zero mutazioni; non alterano il contratto di validazione. I percorsi ADMIN self/other verificano argomenti esatti, una sola mutazione, ordine JWT → caller profile → mutation, Authorization inoltrata, CORS e success response originali. Preservati minimo sei caratteri, errori Admin Auth e preflight.

| Quality gate | Risultato |
|---|---|
| AUTH_ADMIN_02A dedicated | PASS 34/34 |
| AUTH_ADMIN_01 regression | PASS 19/19 |
| securityMigrations / rlsPolicySimulation / authorizationPolicy | PASS 67/67 |
| npx tsc --noEmit | PASS, exit 0 |
| Full Vitest offline | PASS 1.295/1.295 test in 113 file, zero failed/pending, exit 0 |
| git diff --check | PASS, exit 0 |
| Nuovo test diff no-index/check | Nessuna diagnostica whitespace; exit 1 indica le differenze del file nuovo |

Targeted/regression/security eseguiti insieme: **120/120 PASS, 5 file**.
Configurazione originale Vite importata da wrapper TEMP, variando soltanto maxThreads=2/minThreads=1; stesso isolamento usato per il full. Nessuna modifica alle configurazioni repository.
TypeScript controlla src, incluso il nuovo test; l'Edge Deno è esclusa dal tsconfig esistente e viene transpiled/eseguita dal test reale.

Comandi:

```text
npx vitest run src/__tests__/updatePasswordCanonicalAuthorization.test.ts src/__tests__/createUserAdminAuthorization.test.ts src/__tests__/securityMigrations.test.ts src/__tests__/rlsPolicySimulation.test.ts src/application/__tests__/authorizationPolicy.test.ts --config <TEMP>/vitest.config.mjs --reporter=dot --silent
npx tsc --noEmit
npx vitest run --config <TEMP>/vitest.config.mjs --reporter=json --outputFile=<TEMP>/full-tests.json --silent
git diff --check
```

TEMP di questa esecuzione: `C:\Users\PUSCED~1\AppData\Local\Temp\auth-admin-02a-bd018b0161ba476b9952baff70c047ae`.
npm offline, URL Supabase dummy .invalid, remote drafts disabilitati. Preload locale blocca/logga fetch, HTTP/HTTPS, TCP/TLS e DNS. Artifact di evidence_wave3_hardening, audit_wave3_independent/evidence e PDF root vengono rediretti a TEMP anche per le letture, preservando gli originali. Test eseguiti fuori sandbox con approvazione per i percorsi esbuild già risultati inaccessibili nel gate precedente. Nessuna dipendenza installata.

## Scope integrity

Confronto SHA-256 PRE/POST finale: **PASS**. Tutti i 1.064 file PRE presenti; unico hash cambiato update-password/index.ts. Gli altri 1.063 hash sono identici, inclusi tutti i file protetti elencati sotto. POST: 1.066 file inventariati, con aggiunta soltanto del nuovo test e del nuovo report. Nessun'altra variazione o rimozione.
Stato Git POST meno PRE: soltanto update-password/index.ts modificato e test dedicato untracked; nessuna riga PRE rimossa. Il report è ignorato come precisato sotto. Branch/HEAD invariati; diff staged ancora vuoto. Diff produttivo rivisto con `git diff -- supabase/functions/update-password/index.ts`; test untracked rivisto e verificato anche con diff no-index/check.

File di questo slice:

1. `supabase/functions/update-password/index.ts`.
2. `src/__tests__/updatePasswordCanonicalAuthorization.test.ts`.
3. `AUTH_ADMIN_02A_IMPLEMENTATION_REPORT.md`.

Il report è ignorato dalla regola .gitignore:53 `*report*.md` preesistente; .gitignore non modificato, nessun git add forzato.

Hash PRE dei file esplicitamente protetti (da confrontare identici nel POST):

| File | SHA-256 PRE |
|---|---|
| `supabase/functions/create-user/index.ts` | `D95E40ACDC81B16C7AFBF9970C49F6E9361E2C6802F9DFF5D555BC5D1F25CFD4` |
| `src/__tests__/createUserAdminAuthorization.test.ts` | `4AC728B2773092E90937F5B6CD77D5FC28F3264CAA9D5791AFFD2426C6B20326` |
| `AUTH_ADMIN_01_IMPLEMENTATION_REPORT.md` | `2FC883011037F9FA192815F63318447A6A245DEEDFB2EAAC3A7F8349C256484C` |
| `AUTH_ADMIN_01_INDEPENDENT_REVIEW.md` | `0B1D5CA371CBE0C08680F0EE84616FFAF8253A343E43E40333E73A197CC33E96` |
| `supabase/functions/delete-user/index.ts` | `46B201971F81FDFCB6C6487A0EED5364A4D7E0A37BC3C07DE9572F11FDFCD6DA` |
| `src/pages/UserManagementPage.tsx` | `21124D8B493F03C19493E57C2B69B2913C6EDB5DCF25A54DAFA24FF7AFF47F31` |
| `src/__tests__/securityMigrations.test.ts` | `4A2217191B161894846271D47C738BA2DEA1B72CC0626504E273958A8305D403` |
| `src/features/wizard2026/__tests__/wizard2026RemoteDraftSync.test.ts` | `188B79924C5A8D387A58D9ED3AFE6251E1E11AC9FFCECD759A1B694204CFE0F4` |
| `supabase/migrations/20261002000000_harden_auth_profile_role_source.sql` | `8670E439CD6FA8AE969652445637168491AFD3388DE710CE2AE9E2752EF2614D` |

Nessuna modifica a delete-user, role mirror/UserManagementPage, create-user/test/reports, migration profile-role/A/B/C, formule finanziarie, documenti/presenter, Cabina o Distribuzione. Tutti gli untracked preesistenti preservati. Nessuna modifica a report ASTRA/Wave3 esistenti.

```text
NETWORK_ATTEMPTS = 0
DATABASE_CHANGED = NO
MIGRATIONS_CREATED = NO
MIGRATIONS_CHANGED = NO
MIGRATIONS_APPLIED = NO
STAGING_CONTACTED = NO
PRODUCTION_CONTACTED = NO
GIT_ADD = NO
COMMIT = NO
PUSH = NO
PR = NO
DEPLOY = NO
```

## Residual findings untouched

- **AUTH_ADMIN_01 remains closed locally**: implementazione e independent review PASS preesistenti; codice, test e report preservati, regression PASS.
- **AUTH_ADMIN_02B remains OPEN**: delete-user non modificato; gate distruttivo separato.
- **AUTH_ROLE_03 remains OPEN**: mirror e scritture non transazionali invariati.
- **AUTH_PROFILE_ROLE_PENDING_GATE remains APPLY_PENDING** / LIVE_FIX_NOT_VERIFIED: nessuna modifica/apply della migration o del trigger; nessuna attestazione live sui writer del ruolo canonico.
- **CALC-02/NORM-01 remain untouched**: nessun refactoring finanziario/documentale o FAD_REPORT_READ_MODEL.

Next gate recommendation: `AUTH_ADMIN_02A_INDEPENDENT_REVIEW`.
