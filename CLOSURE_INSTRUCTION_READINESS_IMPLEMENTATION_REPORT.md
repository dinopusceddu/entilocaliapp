# CLOSURE_INSTRUCTION_READINESS — implementation report

## Baseline

Slice esclusivo FUNC-02; implementazione locale del 4 ottobre 2026.
Branch: `ux/toolbox-area-fondo-prototype`.
HEAD: `d3170f959b5815c514dbf3d6e5f93366a5f14c67`.
Branch/HEAD coincidono con la baseline richiesta. Nessuna operazione Git mutativa.

Inventario PRE: 1115 path con SHA-256 (tracked, untracked non ignorati, report Markdown root inclusi anche se ignorati).
Evidenze locali TEMP: `C:\Users\PUSCED~1\AppData\Local\Temp\closure-readiness-fa501db3c32f417e89e75952328a6c67`.
`pre-hashes.json` SHA-256: `15581499B37C9458A90C916A21A2D42619D9DADA288D7EE7CDADD7CF22751183`.
`baseline-pre.txt` conserva esattamente l'output dei cinque comandi richiesti.
La sezione finale riporta l'intero working tree PRE. Staged PRE vuoto.

## Current closure graph

`EntityYearManagementPage` (Gestione Enti e Anni, annualità attiva)
→ conferma utente
→ `AppContext.closeCurrentYear`
→ `closeYearAndPrepareNext` in `src/application/yearClosureWorkflow.ts`
→ `SupabaseStateRepository.closeYearAtomic`
→ RPC `close_annual_snapshot_atomic`
→ annualità corrente CLOSED e payload N+1 nella stessa transazione
→ aggiornamento locale del snapshot e tentativo di navigazione N+1.

È l'unico caller produttivo del workflow individuato. Cabina risolve stato/CTA ma non è l'executor di chiusura.
Il workflow ricalcola con normalizer/motore esistenti, poi usa `calculateYearClosureCarryForward`: i risparmi delle voci `p_`/`u_` confluiscono nel riporto FAD N+1; gli altri residui restano informativi come prima.

## DATA-02 protected contract

Byte-identici rispetto al PRE: workflow, repository/adapter, RPC/SQL/migration e helper di riporto.
Nessuna write nuova/intermedia, modifica di lock, transazione, rollback, idempotenza, conflict handling o struttura N+1.

Il workflow remoto mantiene `closeYearAtomic` come unica esecuzione atomica. I test locali mockano esclusivamente i boundary esterni; non invocano RPC reale.
Il fallback dei repository locali/in-memory e il rollback compensativo storico non sono stati modificati.

## Current closure preconditions

Decision table PRE:

| Condizione | Comportamento PRE |
|---|---|
| Annualità attiva, elenco non CLOSED | CTA Chiudi Esercizio disponibile; conferma utente |
| Utente/ente/anno/normativa mancanti | Guard tecniche esistenti nel context |
| Snapshot key incompatibile | Workflow nega prima delle scritture |
| Calcolo genera eccezione | Workflow fallisce prima delle scritture |
| Canonical UNDETERMINED/INVALID senza eccezione | Nessun gate istruttorio esplicito |
| BLOCKING checklist | Nessun gate esplicito sul percorso di chiusura |
| WARNING | Nessuna precondizione di chiusura aggiuntiva |
| Distribuzione vuota/non completata | Nessuna precondizione di avvio/completamento/salvataggio |
| CLOSED remoto + N+1 esistente | Retry idempotente, successo senza nuova RPC |
| CLOSED remoto + N+1 mancante | Recovery storico delegato al workflow/RPC |

Non è emersa una policy che richieda Distribuzione iniziata/completata/salvata. Non è stata inventata.
Le guard tecniche già previste rimangono dopo il gate istruttorio.

## Readiness contract

Nuovo resolver puro: `src/logic/closure/resolveClosureInstructionReadiness.ts`.
Input: snapshot status, canonical status/total, issue checklist già normalizzate.
Output tipizzato: `READY | NOT_READY | ALREADY_CLOSED`, reasons, primaryReason e azione business con target esistente.

La classificazione BLOCKING/WARNING/MISSING_PREREQUISITE è riusata da `resolveChecklist`; nessuna duplicazione dei controlli normativi, nessun parsing del testo, nessun ordinamento degli input.

La readiness condivisa è composta in AppContext:
1. proiezione del risultato canonico memorizzato e checklist corrente;
2. un risultato non pronto non viene promosso;
3. se pronto, verifica anche il draft corrente tramite gli stessi normalizer e motore canonico già usati dal workflow;
4. la verifica corrente può soltanto restringere la readiness; non dispatcha e non salva;
5. eccezione del motore → NOT_READY.

Questo passaggio impedisce che un risultato VALID precedente all'ultima modifica autorizzi il congelamento di un nuovo recupero non istruito o di dati invalidi. Non introduce formule né cambia il ledger. La verifica del draft produce prima un risultato canonico, quindi il resolver continua a consumare soltanto risultati canonici e checklist normalizzata.

Il gate è client-side nel command boundary esistente. Non è un nuovo contratto server né una dichiarazione di readiness amministrativa dei documenti.

## Decision table

| Snapshot / canonico / checklist | Readiness | Azione |
|---|---|---|
| CLOSED, anche con blocker o calcolo missing | ALREADY_CLOSED | Nessuna CTA nuova |
| OPEN, VALID + total non-null + nessun blocker/prerequisito mancante | READY | Chiusura tramite workflow esistente |
| VALID total=0 | READY | Zero esplicito valido |
| UNDETERMINED | NOT_READY | Vai alla Costituzione |
| INVALID | NOT_READY | Vai alla Costituzione |
| Canonico assente o total null | NOT_READY | Vai alla Costituzione |
| VALID + BLOCKING | NOT_READY | Apri le verifiche |
| VALID + sola WARNING | READY | Warning non trasformata in hard gate |
| MISSING_PREREQUISITE | NOT_READY | Target già presente / Costituzione |
| Risultato memorizzato VALID ma draft corrente non pronto | NOT_READY | Motivo del risultato corrente |

Per più issue viene conservato l'ordine normalizzato. Il motivo canonico ha precedenza quando il risultato non è determinato; il target del primo prerequisito mancante viene conservato. Target assente: fallback deterministico Costituzione/verifiche.

## Canonical invalid/undetermined

Status non VALID o total null non autorizzano una nuova chiusura.
Nessuna authority da summary legacy, sections, totali raw, testi UI o documenti.
Esplicitamente distinto missing da zero canonico VALID.
Il ricalcolo di verifica non modifica FundData, snapshot, canonical result memorizzato o N+1.

## Blocking/warning behavior

Canonical VALID non supera una issue BLOCKING.
La CTA correttiva usa `relatedPage` già normalizzato in `target`; fallback verifiche.
Una WARNING da sola non blocca. Cabina e i suoi resolver restano byte-identici.

## Missing prerequisite behavior

MISSING_PREREQUISITE resta distinto da compliance BLOCKING.
UNDETERMINED produce una causa business e un'azione verso Costituzione/dato mancante.
Anche l'input incoerente VALID con prerequisito normalizzato mancante resta NOT_READY.
Nessun nuovo prerequisito documentale.

## Distribution dependency analysis

DISTRIBUTION_REQUIRED_FOR_CLOSURE = NO.
Fonte: CTA/context/workflow/carry-forward correnti e test storici.
Non è utilizzato `hasExistingWork` come proxy di readiness.
La fixture READY reale ha Distribuzione vuota e nessun metadata documentale; il workflow chiude e riporta zero secondo il contratto esistente.
Distribuzione economics, proposta esplicita, dirty/save e resolver Cabina non sono cambiati.

## CLOSED / retry / idempotency

UI CLOSED: nessuna CTA Chiudi Esercizio né azione di riapertura.
Il command boundary conserva ALREADY_CLOSED per retry/recovery programmatico storico:
- CLOSED con N+1 già presente → workflow idempotente, zero nuova RPC;
- CLOSED storico con N+1 mancante → percorso di recovery precedente, senza write separate aggiunte.
Questa seconda operazione è recovery DATA-02, non una nuova istruttoria READY: non è stata bloccata o reinterpretata.

READY con errore RPC: FundData locale/remoto resta OPEN nel mock atomico; retry usa la stessa funzione.
Due invocazioni sequenziali ravvicinate sullo stesso handler: workflow eseguito due volte, RPC atomica una volta, secondo il contratto idempotente preesistente.
I test non rivendicano una nuova garanzia concorrente lato client/server.

## UI behavior

La pagina reale espone CTA disabilitata quando NOT_READY, causa leggibile e azione correttiva.
Guard anche nel page handler; invocazione diretta del command context NOT_READY nega prima di qualsiasi dispatch.
READY mantiene conferma e chiamata al workflow. CLOSED viene nascosto anche quando l'elenco anni non è ancora aggiornato.
Nessun redesign, enum tecnico in UI, prerequisito atti/revisori/firma/protocollo o DOCUMENT_KIND_READINESS.

SEPARATE_WORKFLOW_NOTE (non corretto): nell'integrazione reale, dopo successo atomico il `switchYearAtomic` catturato dal render OPEN può tentare il save del precedente draft OPEN contro il snapshot ormai CLOSED. La guard di salvataggio può rifiutare tale passaggio e la navigazione automatica N+1 può non completarsi. Il snapshot corrente è CLOSED e N+1 è stato creato correttamente; questa semantica di navigazione preesistente è fuori dal gate istruttorio e non è stata modificata.

## Zero-write unready proof

Per UNDETERMINED, INVALID, calcolo assente, BLOCKING e prerequisito mancante, invocazione diretta del vero `closeCurrentYear`:
- workflow calls = 0;
- closeYearAtomic = 0;
- upsert/create/delete snapshot = 0;
- update ente = 0;
- lettura closure repository = 0;
- oggetto AppState invariato, annualità OPEN, nessun N+1.

Ulteriori casi: risultato memorizzato VALID con draft recovery unresolved, importo negativo canonico o input FTE che causa eccezione → zero workflow e zero write.
Il test UI verifica disabilitazione, nessuna conferma/chiamata e navigazione correttiva.

## Tests

Nuovi test:
- `src/logic/closure/__tests__/closureInstructionReadiness.test.ts`: 17/17; resolver pubblico, input frozen, zero valido, warning, priority/target, CLOSED, assenza di authority legacy.
- `src/contexts/__tests__/closureInstructionReadiness.integration.test.tsx`: 21/21; AppProvider/reducer/pagina/motore/workflow reali, spy boundary, R1–R12, stale-result guard, recovery storico.

Gate dedicato: 53/53 in 4 file, inclusi yearClosure 5/5 e wave1ClosedSnapshot 10/10.
Le prime fixture READY artificiali sono state rifiutate dal nuovo controllo del motore reale: corretto solo il nuovo fixture (storico Art33/FTE e voci canoniche determinate); nessun test storico/golden aggiornato.
TypeScript `npx tsc --noEmit`: PASS.
Regression suite: 8/8 PASS.
Wave2 oracle: 14/14 PASS.
Full Vitest offline: 1507/1507 PASS, 123 file, zero failed/skipped; processo exit 0.

| Gate nella suite completa | Risultato |
|---|---|
| yearClosure / wave1ClosedSnapshot / carry-forward | 5/5 + 10/10 + 3/3 |
| AppContext CLOSED hardening | 35/35 |
| Cabina resolver/view model/checklist/status + pagina | 66/66 + 45/45 |
| Distribution budget resolver/pagina | 14/14 + 7/7 |
| Distribution draft proposal/pagina | 23/23 + 19/19 |
| Distribution CLOSED / Reports CLOSED | 1/1 + 2/2 |
| Fondo Personale Art79c1c | 6/6 |
| FAD read model | 17/17 |
| XLS / PDF canonici | 16/16 + 17/17 |
| Canonical ledger contract | 13/13 |
| Wave3 consistency/hardening/systemic/wiring/independent | 34/34 + 7/7 + 21/21 + 19/19 + 6/6 |
| Auth create/update/delete | 19/19 + 34/34 + 42/42 |
| Security migrations (sola verifica locale) | 27/27 |

I gruppi si sovrappongono ai gate mirati; non sono conteggi additivi rispetto ai 1507 test.
Evidenze: targeted.log, full-results.json/full.log, typescript-final.log, regression.log, oracle.log nel TEMP indicato.

Guard offline applicato a Node/npm/Vitest: HTTP/HTTPS, socket/TLS, DNS e fetch bloccati prima della connessione; ambienti Supabase dummy .invalid. Artefatti di test storici rediretti in TEMP per preservare evidence pack.
PRODUCT_NETWORK_ATTEMPTS = 0.
TOOLING_NETWORK_ATTEMPTS = 0.
REAL_NETWORK_CONNECTION_ESTABLISHED = NO.
Il primo lancio nel sandbox non aveva accesso ai file esbuild TEMP: rieseguito con autorizzazione per esecuzione locale. Non era un tentativo di rete e non ha richiesto installazioni.

## Scope integrity

File produttivi:
1. `src/logic/closure/resolveClosureInstructionReadiness.ts` (nuovo resolver puro).
2. `src/contexts/AppContext.tsx` (readiness condivisa e guard al vero closure command; necessario per impedire bypass del disabled UI).
3. `src/pages/EntityYearManagementPage.tsx` (CTA/feedback/guard minima).

Solo due nuovi test e questo report oltre ai tre file produttivi.
Inventario POST: 1119 file; 1113 preesistenti byte-identici, 2 preesistenti modificati (solo AppContext.tsx e EntityYearManagementPage.tsx), 4 nuovi (resolver, due test, report), zero cancellazioni. Evidenze pre-hashes.json/post-hashes.json/integrity.json nel TEMP.
Staged invariato vuoto. Nessun file preesistente cancellato.
Protetti: RPC/migration/adapter/yearClosureWorkflow/carry-forward, Auth, Cabina, Distribution, normalizer, engine/ledger, presenter/projection, writer XLS/PDF, Tabella15, report/evidence pack precedenti.
`git diff --check`: PASS; nessun problema di whitespace. Le notifiche LF/CRLF sono advisory Git, non modifiche applicate a file protetti.

## Regression of closed slices

DATA-02/CALC-02/NORM-01 conservano VERIFIED_FIXED.
Cabina blocking e Distribution explicit draft conservano CLOSED_LOCALLY + independent PASS.
ASTRA_BLOCKERS_OPEN = 0.
Tutti i gate elencati PASS; DATA_02_REGRESSION = NONE, CALC_02_REGRESSION = NONE, NORM_01_REGRESSION = NONE, CABINA_BLOCKING_REGRESSION = NONE, DISTRIBUTION_EXPLICIT_DRAFT_REGRESSION = NONE.

## Residual FUNC-02

Questo slice introduce il gate di istruttoria pre-transazione, non finalità amministrativa per tipo documento.
FUNC-02 = HIGH / PARTIALLY_FIXED, in attesa della review finale dei residui.
DOCUMENT_KIND_READINESS resta separato e non implementato.
DOC-02/NORM-02/ARCH-01 mantengono severità originale HIGH e stato PARTIALLY_FIXED.
Nessuna riclassificazione delle severità; nessuna dichiarazione di sicurezza/readiness live.

## Next gate

RESULT = PASS (locale; soggetto a review indipendente).
CLOSURE_INSTRUCTION_READINESS_STATUS = CLOSED_LOCALLY.
NEXT_GATE_RECOMMENDATION = CLOSURE_INSTRUCTION_READINESS_INDEPENDENT_REVIEW.

DATABASE_CHANGED = NO
MIGRATIONS_CREATED = NO
MIGRATIONS_APPLIED = NO
STAGING_CONTACTED = NO
PRODUCTION_CONTACTED = NO
GIT_ADD = NO
COMMIT = NO
PUSH = NO
PR = NO
DEPLOY = NO

## Exact working-tree PRE

Output completo dei cinque comandi iniziali, nell'ordine richiesto:

```text
 M src/__tests__/securityMigrations.test.ts
 M src/domain/documentProjection.ts
 M src/features/wizard2026/__tests__/wizard2026RemoteDraftSync.test.ts
 M src/logic/cabina/__tests__/resolveCabinaViewModel.test.ts
 M src/logic/cabina/__tests__/resolveOperationalStatus.test.ts
 M src/logic/cabina/resolveCabinaViewModel.ts
 M src/logic/cabina/resolveOperationalStatus.ts
 M src/pages/DistribuzioneRisorsePage.tsx
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
?? src/domain/__tests__/fadReportReadModel.test.ts
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
warning: in the working copy of 'src/domain/documentProjection.ts', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/logic/cabina/__tests__/resolveCabinaViewModel.test.ts', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/logic/cabina/__tests__/resolveOperationalStatus.test.ts', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/logic/cabina/resolveCabinaViewModel.ts', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/logic/cabina/resolveOperationalStatus.ts', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/pages/DistribuzioneRisorsePage.tsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/pages/__tests__/CabinaDiRegiaPage.wave41.integration.test.tsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/pages/__tests__/DistribuzioneRisorsePage.closed.test.tsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/presenters/reportPresenter.ts', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/services/documents/pdfReportService.ts', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/services/documents/xlsReportService.ts', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'supabase/functions/create-user/index.ts', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'supabase/functions/delete-user/index.ts', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'supabase/functions/update-password/index.ts', LF will be replaced by CRLF the next time Git touches it
M	src/__tests__/securityMigrations.test.ts
M	src/domain/documentProjection.ts
M	src/features/wizard2026/__tests__/wizard2026RemoteDraftSync.test.ts
M	src/logic/cabina/__tests__/resolveCabinaViewModel.test.ts
M	src/logic/cabina/__tests__/resolveOperationalStatus.test.ts
M	src/logic/cabina/resolveCabinaViewModel.ts
M	src/logic/cabina/resolveOperationalStatus.ts
M	src/pages/DistribuzioneRisorsePage.tsx
M	src/pages/__tests__/CabinaDiRegiaPage.wave41.integration.test.tsx
M	src/pages/__tests__/DistribuzioneRisorsePage.closed.test.tsx
M	src/presenters/reportPresenter.ts
M	src/services/documents/pdfReportService.ts
M	src/services/documents/xlsReportService.ts
M	supabase/functions/create-user/index.ts
M	supabase/functions/delete-user/index.ts
M	supabase/functions/update-password/index.ts
```
