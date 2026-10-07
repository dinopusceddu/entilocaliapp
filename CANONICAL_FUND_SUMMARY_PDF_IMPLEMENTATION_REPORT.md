# CANONICAL_FUND_SUMMARY_PDF — Implementation report

## Baseline

Data: 2026-10-04. Branch: `ux/toolbox-area-fondo-prototype`.
HEAD: `d3170f959b5815c514dbf3d6e5f93366a5f14c67`.

Eseguite prima di qualsiasi modifica le cinque verifiche richieste: status short completo, branch, HEAD, diff name-status e staged name-status. Branch/HEAD corrispondono; staged vuoto.
PRE: 1076 file inventariati con path e SHA256: tracked, untracked non ignorati e report root preesistenti (inclusi quelli ignorati). Modifiche tracked preesistenti: securityMigrations.test.ts, wizard2026RemoteDraftSync.test.ts, documentProjection.ts, reportPresenter.ts, xlsReportService.ts e le tre Edge Function Auth. Tutti preservati.

Evidenze locali complete: `C:\Users\PUSCED~1\AppData\Local\Temp\canonical-fund-summary-pdf-03891f7de37241c7b9d5f9ee4c75484d\baseline-pre.txt`, `pre-sha256.json` e `post-sha256.json` nella medesima directory TEMP. Il testo integrale dello status PRE è incluso in appendice.

Letti i report implementation/review FAD read model e XLS; le sezioni ASTRA CALC-02, NORM-01/02, DOC-02, ARCH-01 e roadmap; writer PDF, reportService, presenter, helper e test pertinenti. Nessun checkout o altra modifica Git di stato.

## Current PDF graph

`src/pages/ReportsPage.tsx:handleGenerateFullSummary`
→ `src/services/reportService.ts:generateFullSummaryPDF`
→ `src/services/documents/pdfReportService.ts:generateFondoPDF`
→ `createReportViewModel`
→ cover, dettaglio dipendenti, altri fondi, footer e `doc.save`.

PRE: cover con `result.totals` e compliance Art.23 complessiva; dettaglio con `vm.fondoDipendenti.costituzione`, items.amount e section.total; utilizzi con `vm.fondoDipendenti.utilizzi`; altri fondi con `vm.altriFondi`. Presenter conserva il percorso legacy constitution.sections/calculateFadTotals. Altri servizi PDF omonimi storici non sono il writer chiamato da questa CTA.

## PDF economic perimeter

Titolo originale “RIEPILOGO GENERALE E RISULTANZE”; intestazione ente/anno. Ordine: cover, dettaglio Quadro A risorse e B destinazioni, quadro altri fondi EQ/Segretario/Dirigenza. Tabelle jsPDF-autoTable; A4, margini 14 mm, footer ente/anno e numerazione. Nessuna formula PDF.
Filename PRE: `Fondo_<anno>_<ente>.pdf`. Il writer attivo non applicava un proprio output-mode BOZZA; le regole Wave3 dei documenti moderni appartengono ad altri writer e non sono state modificate.

## FAD-only vs other-fund vs aggregate classification

| Elemento PRE | Perimetro | Scelta POST |
| --- | --- | --- |
| Costituzione dipendenti e subtotali | FAD_ONLY | fadCanonical |
| Utilizzi dipendenti | FAD_ONLY, assenti dal DTO | Quadro B senza importi, qualificato |
| KPI result.totals totale/stabile/variabile | MULTI_FUND_AGGREGATE | Rimossi come aggregati; fondi separati, KPI esplicitamente FAD |
| Compliance/limite Art.23 complessivo ente | MULTI_FUND_AGGREGATE | Senza valori o giudizio di conformità, qualificato |
| EQ, Segretario, Dirigenza | OTHER_FUND_ONLY | Stesso mapping, tabella e comportamento PRE |

L'utente ha approvato esplicitamente “Quadri senza importi, qualificati come XLSX”. Non si è esteso il read model per utilizzi o limite. L'indicatore Art.23 di appartenenza di una riga resta metadata canonico, distinto dalla verifica del limite dell'ente.

## Legacy bypass

Il rendering accetta `SummaryInput`, un Pick di ReportViewModel limitato a fadCanonical, annoRiferimento, denominazioneEnte e altriFondi. Non riceve FundData o CalculationResult; il wrapper conserva la firma pubblica e costruisce il presenter prima del rendering.

Il builder non legge costituzione, sections, section.total, summary, result.totals o calculateFadTotals. Il presenter può ancora calcolare campi legacy per compatibilità, ma nessuno viene letto dal ramo FAD PDF. Test P9 avvelena il getter fondoDipendenti: il PDF reale continua a generarsi. Test AST P12 impedisce accessi/import economici legacy e helper di segno/rounding/somma nel writer.

## Canonical mapping

| Valore PDF | Authority | Null / segno |
| --- | --- | --- |
| Righe stabili/variabili | fadCanonical.rows, component | Nessun filtro su importi raw |
| Importo economico di riga | row.signedAmount | null → NON DETERMINATO; zero conservato; nessuna negazione |
| Descrizione e Art.23 | description, art23Treatment | Metadata già proiettato |
| Importo informativo unresolved | row.amount, status, reason | Solo nella descrizione “DA ISTRUIRE”, escluso dai subtotali |
| Subtotale stabile | verifiedStableTotal | Copia diretta; null non diventa zero |
| Subtotale variabile | verifiedVariableTotal | Copia diretta |
| Subtotale verificato FAD | verifiedTotal | Mai rinominato totale definitivo |
| Totale Fondo Dipendenti | authoritativeTotal | null → NON DETERMINATO |
| Stato / motivi | status, canonicalAvailable, unresolvedItems, missingPrerequisites | Nessuna readiness nuova |

formatCurrency/formatNumber sono solo formattazione. Nessuna somma, percentuale, inversione di operation, Math.abs, toFixed o rounding economico nel rendering FAD.

## Draft/final economic semantics

BOZZA se canonicalAvailable è false, status non è VALID oppure authoritativeTotal è null. Cover e filename esplicitano BOZZA. VALID conserva il filename precedente e può mostrare authoritativeTotal; questo non certifica definitività amministrativa. Nessun ampliamento della readiness Wave3, nessuna modifica a DocumentFactory o documenti moderni.

INVALID e UNDETERMINED mantengono i subtotali verificati distinti dal totale nullo. Un risultato INVALID con total canonico numerico resta privo di authoritativeTotal secondo la projection approvata.

## A/2025 PDF inspection

Fixture reale del motore: straordinario consolidato 2000, incremento corrente 1400, Art60 raw 127,44, recovery raw 2800 senza istruttoria. La section legacy contiene dettaglio non riconciliato e total 2000: il test caratterizza il bypass prima di verificare il nuovo PDF.

PDF reale A/2025, 4 pagine:
- cover BOZZA, stabile verificato 3400, variabile verificato 0, subtotale 3400, totale NON DETERMINATO;
- righe canoniche 2000 e 1400, Art60 0;
- recovery UNDETERMINED / DA ISTRUIRE, 2800 solo nella nota informativa “escluso dai subtotali”;
- quadro altri fondi invariato.

Asserite assenze di 4.800,00, 6.072,56 e -127,44, comprese le varianti effettive prodotte dal formatter locale. Il formatter esistente stampa, ad esempio, `€ 3400,00`; non è stato cambiato il formato.
L'importo 2800 compare una sola volta nel testo estratto, esclusivamente nella nota qualificata.

## Art60 2025/2026

Nessuna logica annuale nel writer. Probe sul ledger reale:
2025: amount canonico 0, operation DEDUCTION, signedAmount 0 nel DTO/XLS/PDF.
2026: amount canonico 127,44, operation DEDUCTION, signedAmount -127,44 nel DTO/XLS/PDF, una sola riga economica.
Il ledger conserva la magnitudine e l'operation; la semantica signed già risolta proviene dalla projection.

## Recovery unresolved

Riga economica NON DETERMINATO, status e reason visibili. Nessuna promozione dei 2800 informativi a risorsa costituita o totale. Subtotali canonicali copiati senza includerla. Missing input e missing entry non vengono trasformati in zero; i reason/prerequisiti canonici sono riportati.

## Other funds preservation

Tabella altri fondi e mapping EQ/Segretario/Dirigenza invariati. Test con valori distinti 222,22 / 333,33 / 444,44, sia con FAD VALID sia UNDETERMINED: ciascuno resta nel proprio fondo e non entra nei KPI FAD. Dirigenza assente conserva N/A.
Nessun intervento su formule/read model di altri fondi; CALC-04/cache Dirigenza resta separato.

## Multi-fund aggregate safety

I totali PRE result.totals sono aggregati dei fondi, non FAD. Non vengono sostituiti semanticamente da un totale FAD mantenendo un'etichetta generica: sono rimossi, i KPI esplicitano “FONDO PERSONALE DIPENDENTE (FAD)” e compare “Fondi esposti separatamente; nessun totale complessivo ente.”
Con FAD nullo e altri fondi determinati non viene prodotto alcun aggregato definitivo. Il test usa aggregati legacy discordanti 888888/777777/999999 e verifica che non compaiano.

## Cross-consumer probe

Un solo input A/2025 eseguito attraverso motore reale, SSR reale Fondo Personale, resolver Cabina, presenter, XLS serializzato e riaperto, PDF scritto e riaperto.

| Consumer | Status | Stable | Variable | Verified | Authoritative |
| --- | --- | ---: | ---: | ---: | --- |
| CanonicalFundResult | UNDETERMINED | 3400 | 0 | 3400 | null |
| Fondo Personale | UNDETERMINED | 3400 | 0 | 3400 | Non determinabile |
| Cabina constitution | UNDETERMINED | input canonico 3400* | input canonico 0* | 3400 | null |
| FadReportReadModel | UNDETERMINED | 3400 | 0 | 3400 | null |
| XLS FAD reale | UNDETERMINED | 3400 | 0 | 3400 | NON DETERMINATO |
| PDF riepilogativo reale | UNDETERMINED | 3400 | 0 | 3400 | NON DETERMINATO |

*Cabina non espone due campi stable/variable autonomi in constitution: il resolver viene verificato esattamente come implementato (canonicalStatus, verifiedSubtotal, total null, showDefinitiveTotal false). Non sono inventati output UI. Le card reali Fondo Personale vengono aperte solo nel test per osservare i subtotali nascosti.

Distribuzione usa ancora summary.totaleFondo come budget: sul medesimo input vale 3400, uguale al verified subtotal, senza divergenza numerica CALC-02. La qualificazione del workflow/distribuibilità resta FUNC-02; non è corretta qui. Nel riepilogo Wizard UI persistono campi informativi raw Art60: non sono l'authority del fondo canonico né un exporter, e non sono modificati in questo slice.

Evidenze: `dedicated-pdfs/cross-consumer-A2025.json`, `FondoPersonale-A2025.html`, PDF e testi nella directory TEMP.

## NORM-01 final probe

`dedicated-pdfs/norm01-2025.json` e `norm01-2026.json` registrano ledger, operation, read model, cella del workbook riaperto e importo osservato nel PDF estratto. 2025 zero ovunque; 2026 -127,44 una sola volta nei consumer signed. Nessun consumer XLS/PDF applica regole annuali.

## PDF real-file inspection

17 test dedicati; jsPDF e autoTable reali. Intercettato esclusivamente save/download, non il contenuto. I file vengono scritti in TEMP, riaperti e letti con pdfjs-dist locale. Verificati testo, valori, titoli, footer, stato, filename, numero pagine e coordinate entro margini; footer trattato separatamente.

Render Poppler a PNG e ispezione visiva: tutte le 4 pagine A/2025, dettaglio Art60 2026 e pagina intermedia della tabella da 80 righe (5 pagine totali). Nessuna sovrapposizione, clipping o contatto fra righe e footer osservato. Poppler segnala font display Symbol/ArialUnicode non disponibili, ma usa i font PDF Helvetica e produce i render corretti; nessuna installazione richiesta.

## Network gate

NODE_OPTIONS precarica guardia locale che blocca fetch, HTTP/HTTPS, net.Socket.connect, TLS e DNS prima della connessione. Log JSONL include PID, argv, stack e classificazione tooling/prodotto. npm offline e update notifier disabilitato; URL Supabase example.invalid; draft remote flag false.

PRODUCT_NETWORK_ATTEMPTS = 0.
TOOLING_NETWORK_ATTEMPTS = 0.
REAL_NETWORK_CONNECTION_ESTABLISHED = NO.

Nessun record di tentativo a questo gate. Non viene ereditato né reinterpretato il tentativo tooling del vecchio slice XLS. Artefatti dei test Wave3 reindirizzati in TEMP per preservare evidenze preesistenti.

Il sandbox impedisce a esbuild di leggere gli ancestor della configurazione TEMP: i test sono stati eseguiti con accesso autorizzato, mantenendo la medesima guardia offline. Un'esecuzione iniziale si è fermata prima dei test per questo limite. Prime asserzioni footer e fixture TypeScript corrette nel solo nuovo test; nessun golden storico modificato.

## Tests

| Gate | Risultato |
| --- | --- |
| PDF dedicato P1–P12, cross-consumer, public download, pagination | PASS 17/17 |
| FAD read model | PASS 17/17 |
| XLS FAD | PASS 16/16 |
| Canonical ledger contract | PASS 13/13 |
| Wave3 document consistency | PASS 34/34 |
| Wave3 systemic | PASS 21/21 |
| Wave3 UI wiring | PASS 19/19 |
| Wave3 hardening | PASS 7/7 |
| documentPresenter / PDF art79 esistente | PASS 1/1 ciascuno |
| Auth regressions 01/02A/02B | PASS 19 + 34 + 42 = 95/95 |
| securityMigrations | PASS 27/27 |
| npx tsc --noEmit | PASS |
| Regression | PASS 8/8 |
| Wave2 oracle | PASS 14/14 |
| Full Vitest offline | PASS 1387/1387, 117 file, nessun fail o skip |
| git diff --check | PASS |

P1 valid signed reconciliation; P2 zero contro alias 900; P3 A/2025; P4 Art60 2025/2026; P5 recovery; P6 INVALID; P7 canonical assente/entry missing; P8 centesimi; P9 getter legacy avvelenato; P10 altri fondi; P11 aggregato non definitivo; P12 contratto AST. Nessuna modifica alle formule, nessun aggiornamento automatico dei golden. La suite completa include anche Wave2 Astra characterization 1/1. Evidenze full-vitest.json/full-vitest.log, regression.log (8/8) e oracle.log (14/14) nella directory TEMP del gate. Le 11 suite mirate passano 225/225; wiring/hardening separati 26/26.

## Scope integrity

Delta dello slice:
1. `src/services/documents/pdfReportService.ts` — unico produttivo, rendering e builder PDF.
2. `src/services/__tests__/canonicalFundSummaryPdf.test.ts` — nuovo test.
3. `CANONICAL_FUND_SUMMARY_PDF_IMPLEMENTATION_REPORT.md` — questo report.

Confronto rilevante PRE/POST finale: 1076 → 1078 file; un solo file PRE modificato, 1075 PRE invariati, nessun PRE cancellato; due nuovi file. Verificato dopo la suite completa. Tutti gli hash PRE protetti sotto riportati coincidono con il POST. I path ignorati estranei non inventariati non sono stati oggetto di operazioni; nessuna scrittura del prodotto o delle suite è stata diretta a essi.

XLS, presenter, projection, ledger, fundEngine, Auth, migration, ReportsPage, reportService, Tabella15, documenti moderni e tutti gli evidence pack preesistenti protetti da SHA256. Staged invariato vuoto. Nessun git add/commit/push/PR/merge/deploy, DB o migration; staging e produzione mai contattati.

### Protected PRE SHA256

| File | SHA256 PRE (POST deve coincidere) |
| --- | --- |
| CANONICAL_FAD_XLSX_INDEPENDENT_REVIEW.md | 9131AF5C4D0F2596EA4D498CEFDB6485B29C1222A3CDCDEAC3852DE927A3F61E |
| src/services/__tests__/canonicalFadXlsx.test.ts | 9F8AC63BF97C209FA5FD9C794A8CAAB1FE24683BF4283F81913553E16F3C670E |
| src/domain/documentProjection.ts | 44F29B081F0B888F8D5E6CAB790BC048555280B72E80CF75C6506F39033C34D3 |
| src/presenters/reportPresenter.ts | A44E86E497219C9AB2DB6A61C23B64CA79996D0CAEB7C27C89798AD8CB622BA0 |
| FAD_REPORT_READ_MODEL_INDEPENDENT_REVIEW.md | 051384050C9E4A913624C75559F821306869FB2B4379CC2903EDF7BB2B02DB77 |
| src/services/reportService.ts | 4B853738CA0250B6BF271362BE57A2D856551908074AA63CDB1B718AC2C33AD8 |
| AUTH_ADMIN_02A_INDEPENDENT_REVIEW.md | A2EE8D9B735193A05D472F459320BFBA80C751B888568666D13466A1E7133554 |
| AUTH_ADMIN_01_IMPLEMENTATION_REPORT.md | 2FC883011037F9FA192815F63318447A6A245DEEDFB2EAAC3A7F8349C256484C |
| FAD_REPORT_READ_MODEL_IMPLEMENTATION_REPORT.md | 486504948F9C0B01D96F5EF0DAB7CBD7C3DF2F8C23C8115E079CA73E8281BE7F |
| AUTH_ADMIN_02A_IMPLEMENTATION_REPORT.md | A99FE6EC16921DDE2D36FB33B3021DED63E3ABCF6A984D584B80A6105ECD6C14 |
| src/pages/UserManagementPage.tsx | 21124D8B493F03C19493E57C2B69B2913C6EDB5DCF25A54DAFA24FF7AFF47F31 |
| supabase/functions/update-password/index.ts | 04B07282D4D52DD2F098E38E94A302D425B5BE3DF964491D346FB7E62DA183C1 |
| supabase/migrations/20261002000000_harden_auth_profile_role_source.sql | 8670E439CD6FA8AE969652445637168491AFD3388DE710CE2AE9E2752EF2614D |
| AUTH_ADMIN_02B_INDEPENDENT_REVIEW.md | F56F1F84D89561B1EA227736100C4E78A5AF8BC0C6153EDDECB2D823EF22302F |
| CANONICAL_FAD_XLSX_IMPLEMENTATION_REPORT.md | DCCF528C0BDF5CD8D35BF3CA2A8F057777347B86D7A500A96EF5201AF393556D |
| AUTH_ADMIN_02B_IMPLEMENTATION_REPORT.md | 463D45AEF090B2E73AB8205176927A0838957002AD4A439A3395C2457CC9C194 |
| src/domain/__tests__/fadReportReadModel.test.ts | 60CF336CDA92F3CB99185900718CB3CE918342D6A995D9BE245F9F737E8A2AA2 |
| AUTH_ADMIN_01_INDEPENDENT_REVIEW.md | 0B1D5CA371CBE0C08680F0EE84616FFAF8253A343E43E40333E73A197CC33E96 |
| src/pages/ReportsPage.tsx | 45B2F80A843419037538AC7E85711B06D477EEAC0B1BBDABA634BAE523F3C29A |
| supabase/functions/delete-user/index.ts | 7E475D7B4A384F0F258EE227ACDF85A7EC9CD71631FC7814F0C7EB37DAABA11C |
| supabase/functions/create-user/index.ts | D95E40ACDC81B16C7AFBF9970C49F6E9361E2C6802F9DFF5D555BC5D1F25CFD4 |
| src/services/documents/xlsReportService.ts | DE40F1CAA5022778B4806A97664ECEA147BDE1517203197D4DB5AF456E27A249 |

## Finding reassessment

CANONICAL_FUND_SUMMARY_PDF: CLOSED_LOCALLY; RESULT = PASS. Suite e integrità finale superate; review indipendente richiesta.
CALC-02: CANDIDATE_VERIFIED_FIXED per i consumer economici Fondo Personale/Cabina/XLS/PDF allineati; non VERIFIED_FIXED, resta la review indipendente e la distinzione FUNC-02.
NORM-01: CANDIDATE_VERIFIED_FIXED nel perimetro degli active export richiesti, con probe 2025/2026; non VERIFIED_FIXED.
NORM-02: PARTIALLY_FIXED; istruttoria recovery non completata.
DOC-02: PARTIALLY_FIXED; DOCUMENT_KIND_READINESS non implementato.
ARCH-01: PARTIALLY_FIXED; campi/helper legacy e altri percorsi continuano a esistere, anche se non autoritativi nel nuovo ramo FAD PDF.

AUTH_ADMIN_01/02A/02B, FAD_REPORT_READ_MODEL e CANONICAL_FAD_XLSX restano CLOSED_LOCALLY, byte-identici. AUTH_ROLE_03, DELETE_CLEANUP_FINDING e AUTH_PROFILE_ROLE_PENDING_GATE restano untouched; migration profile-role APPLY_PENDING/LIVE_FIX_NOT_VERIFIED. RGS_SCHEMA_UNVERIFIED invariato. Nessuna dichiarazione di sicurezza live o readiness amministrativa.

NEXT_GATE_RECOMMENDATION = CANONICAL_FUND_SUMMARY_PDF_INDEPENDENT_REVIEW.

## Appendice — working-tree PRE esatto

```text
 M src/__tests__/securityMigrations.test.ts
 M src/domain/documentProjection.ts
 M src/features/wizard2026/__tests__/wizard2026RemoteDraftSync.test.ts
 M src/presenters/reportPresenter.ts
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
