# CABINA_BLOCKING_ISSUE_PRIORITY — Implementation report

## Baseline

Slice esclusivo `CABINA_BLOCKING_ISSUE_PRIORITY`, repository `dinopusceddu/entilocaliapp`, 4 ottobre 2026.
Branch: `ux/toolbox-area-fondo-prototype`.
HEAD: `d3170f959b5815c514dbf3d6e5f93366a5f14c67`.
Verificati prima di qualsiasi modifica: `git status --short --untracked-files=all`, `git branch --show-current`, `git rev-parse HEAD`, `git diff --name-status`, `git diff --cached --name-status`. Branch/HEAD conformi; staged vuoto.

PRE tracked modificati (tutti preservati byte-identici):
- `src/__tests__/securityMigrations.test.ts`
- `src/domain/documentProjection.ts`
- `src/features/wizard2026/__tests__/wizard2026RemoteDraftSync.test.ts`
- `src/pages/DistribuzioneRisorsePage.tsx`
- `src/pages/__tests__/DistribuzioneRisorsePage.closed.test.tsx`
- `src/presenters/reportPresenter.ts`
- `src/services/documents/pdfReportService.ts`
- `src/services/documents/xlsReportService.ts`
- `supabase/functions/create-user/index.ts`
- `supabase/functions/delete-user/index.ts`
- `supabase/functions/update-password/index.ts`

Stato PRE completo e inventario SHA-256 di 1108 file tracked/untracked non ignorati e Markdown di root:
`C:\Users\PUSCED~1\AppData\Local\Temp\cabina-blocking-ad9b0309e2734b139022dbe29f01d8b0/baseline-pre.txt`, `pre-hashes.json`.
Gli untracked preesistenti e i report dei precedenti slice sono preservati. Nessuna operazione Git di modifica dello stato/branch.

Materiali letti: quattro resolver Cabina e rispettive suite, pagina `CabinaDiRegiaPage.tsx`, tipi `ComplianceCheck`/VM/action, pagina integration Wave 4.1, sezione FUNC-02 delle due reconciliation ASTRA, contratto Slice 1–3/Wave 4.1 in `MEMORIA_AI.md`, report CLOSED Wave 1 e stato verificato in `CALC02_FINAL_INDEPENDENT_CLOSURE_REVIEW.md`. Non risultano report separati denominati Slice 1/Wave 4.1 nel checkout; il codice e i test S1-003/G9/Wave 4.1 sono il contratto corrente verificato. SHA storico della memoria non sostituisce la baseline richiesta.

## FUNC-02 original acceptance

Severità originale HIGH. Separare validità numerica, completezza istruttoria/documentale e disponibilità negoziale. Il presente slice corregge esclusivamente il mancato primato di una issue già classificata BLOCKING sullo stato operativo e sulla CTA Cabina. Non completa FUNC-02 e non amplia readiness o obblighi amministrativi.

## Current Cabina graph

PRE:
`AppContext.state.calculationResult.canonicalFund` → `resolveOperationalStatus` insieme a snapshot/distribution status → stato → tabella PRIMARY_ACTIONS.
Separatamente `state.complianceChecks` + prerequisite/warning canonici → `resolveChecklist` → `viewModel.issues` → checklist visuale.
`fundData.distribuzioneRisorseData` → `resolveDistributionStatus` (dettagli positivi e finiti stanziate/risparmi/aBilancio).
`projectFundDocument` → document projection → VM, senza nuova valutazione.

POST:
La checklist viene risolta una sola volta nel VM; `issues.find(severity === 'BLOCKING')` determina primo blocker e `hasBlockingIssues`. Il flag tipizzato obbligatorio è passato al resolver operativo; l'array identico è esposto alla pagina. Nessun compliance check rieseguito, nessun parsing dei messaggi, nessuna condizione normativa duplicata.

La pagina renderizza già badge “Bloccato”, fase Verifica, descrizione “Esamina le criticità bloccanti prima di procedere” e CTA da VM; resta byte-identica. L'helper storico `cabinaDiRegiaState.ts` non è importato dalla pagina corrente e resta invariato.

## Root cause

Il ramo VALID ignorava la checklist: sceglieva soltanto tra CONSTITUTION_VERIFIED e DISTRIBUTION_IN_PROGRESS. Un errore compliance visibile come BLOCKING poteva coesistere con “Inizia la Distribuzione”. Il nuovo contratto richiede esplicitamente l'esito normalizzato al resolver.

## Blocking precedence contract

Precedenza preservata ed esplicitata:
1. CLOSED → CLOSED, anche con blocker/calcolo assente/allocazioni.
2. Calcolo assente → NOT_STARTED.
3. Canonico INVALID → BLOCKED.
4. Canonico UNDETERMINED → TO_COMPLETE.
5. Canonico VALID + BLOCKING → BLOCKED, anche se distribuzione avviata.
6. Canonico VALID senza BLOCKING → stato distribuzione esistente o CONSTITUTION_VERIFIED.

I punti 3/4 rappresentano alternative di stato canonico. UNDETERMINED mantiene la precedenza sui lavori esistenti (S1-003) e il percorso verso Costituzione; non viene reinterpretato come fallimento compliance. Le issue rimangono visibili. Non è introdotto alcuno stato nuovo.

## Operational status decision table

| Snapshot/calcolo | BLOCKING | Distribuzione | Stato operativo |
|---|---|---|---|
| CLOSED, qualunque calcolo | qualunque | qualunque | CLOSED |
| Calcolo assente, OPEN | qualunque | qualunque | NOT_STARTED |
| INVALID, OPEN | qualunque | qualunque | BLOCKED |
| UNDETERMINED, OPEN | qualunque | qualunque | TO_COMPLETE |
| VALID, OPEN | sì | NOT_STARTED / IN_PROGRESS | BLOCKED |
| VALID, OPEN | no | NOT_STARTED | CONSTITUTION_VERIFIED |
| VALID, OPEN | no | IN_PROGRESS | DISTRIBUTION_IN_PROGRESS |

## Primary action decision table

| Stato | CTA primaria | Destinazione |
|---|---|---|
| CLOSED | assente | assente |
| NOT_STARTED | Inizia raccolta dati | wizard2026Preview |
| TO_COMPLETE | Vai alla Costituzione | fondoDipendenti |
| BLOCKED con issue | Apri le verifiche | target della prima BLOCKING |
| BLOCKED senza target/issue | Apri le verifiche | compliance |
| CONSTITUTION_VERIFIED | Inizia la Distribuzione | distribuzioneRisorse |
| DISTRIBUTION_IN_PROGRESS | Riprendi la Distribuzione | distribuzioneRisorse |

Priorità deterministica nell'ordine della checklist, ignorando le WARNING nella selezione. Nessun ordinamento alfabetico/codice/messaggio. Se la prima BLOCKING è senza target (anche stringa vuota), fallback a compliance; non si sceglie arbitrariamente il target di una issue successiva. Il label business già presente è conservato. Le action sono nuovi oggetti per ogni chiamata.

## Warning behavior

WARNING canoniche e compliance non bloccano. VALID + sole WARNING conserva CONSTITUTION_VERIFIED e “Inizia la Distribuzione”; distribuzione esistente senza blocker conserva la ripresa.

La classificazione resta quella di `resolveChecklist`: compliance gravita error → BLOCKING, warning → WARNING; info omessa. Questo slice non cambia tali regole né reinterpreta isCompliant.

## Missing prerequisite behavior

Missing prerequisites restano MISSING_PREREQUISITE, con target fondoDipendenti. UNDETERMINED resta TO_COMPLETE e “Vai alla Costituzione”. Senza blocker, G9 continua a offrire la CTA secondaria “Riprendi la Distribuzione” quando esiste lavoro.
Se coesiste una BLOCKING, si sopprime soltanto quella CTA secondaria: il percorso di completamento canonico rimane prioritario, senza suggerire un avanzamento regolare.

## Distribution-in-progress behavior

Con VALID senza blocker: DISTRIBUTION_IN_PROGRESS, CTA di ripresa invariata.
Con VALID e blocker emerso: BLOCKED, CTA verifiche; `distribution.status = IN_PROGRESS` e `hasExistingWork = true` restano presenti.
Nessun rollback, reset, cancellazione, scrittura o ricalcolo delle allocazioni. La pagina continua a mostrare “In lavorazione”/“Lavoro esistente rilevato”: descrive dati esistenti, senza dichiarare workflow verificato. La navigazione ordinaria resta consultabile; non è introdotto un nuovo gate nella pagina Distribuzione.

## CLOSED behavior

CLOSED conserva precedenza assoluta e read-only. Primary null, secondary vuota; issue storiche consultabili. Pipeline mutativa disabilitata dalla pagina preesistente. Nessun ricalcolo automatico riattivato e nessuna modifica allo snapshot.

## UI behavior

Pagina invariata. Lo stato complessivo mostra Bloccato e l'invito a esaminare le criticità; la CTA esistente guida verso la prima relatedPage, oppure Verifiche. Non vengono introdotti codici tecnici o nuovi componenti.

Il read model economico `constitution` resta invariato: canonical VALID significa ancora dato numerico valido, anche quando lo stato operativo è BLOCKED. Totali e subtotali non vengono alterati per simulare una nuova readiness.

## Tests

19 casi aggiunti; nessun golden o asserzione legacy di CLOSED rimossa. Aggiornate le chiamate del test operativo con il nuovo parametro obbligatorio.
- `resolveOperationalStatus.test.ts`: 16/16 (9 preesistenti + 7). Flag blocker, precedenza UNDETERMINED/INVALID/CLOSED/calcolo assente.
- `resolveCabinaViewModel.test.ts`: 26/26 (20 + 6). Prima issue, warning non bloccante, target/fallback, allocazioni congelate/invariate, CLOSED, prerequisiti con blocker, campi economici/documentali identici.
- `CabinaDiRegiaPage.wave41.integration.test.tsx`: 45/45 (39 + 6). Component React e resolver reali; mock del solo boundary AppContext. CTA/navigazione, warning, blocker emergente, CLOSED, prerequisiti, assenza di mutazioni/ricalcolo.
- `resolveChecklist.test.ts`: 4/4 invariati.
- `resolveDistributionStatus.test.ts`: 20/20 invariati.

Matrice acceptance:
| Caso | Prova |
|---|---|
| C1 VALID senza issue | tabella VM/status + T4 pagina, CTA Inizia Distribuzione |
| C2 WARNING | VM G8 e pagina C2 |
| C3 BLOCKING | VM C3 e pagina C3 |
| C4 più BLOCKING | ordine Z-FIRST prima di A-SECOND, warning esclusa; targetless prima conservata |
| C5 missing/UNDETERMINED | S1-003/G5/G9 + VM/pagina C5 |
| C6 distribuzione senza blocker | G9 VM e T5 pagina |
| C7 distribuzione con blocker | VM input frozen e pagina rerender, dati invariati |
| C8 CLOSED con blocker | resolver/VM/pagina, nessuna CTA |
| C9 relatedPage | VM/pagina navigano fundDetails |
| C10 target assente | VM/pagina fallback compliance, nessun parsing messaggi |

Gate Cabina dedicato: **111/111**, cinque file.
Prima esecuzione: 110/111; un nuovo test usava una query singola su testo presente nelle due varianti responsive. Corretta esclusivamente la selezione DOM; successivo gate 111/111. Errore iniziale di accesso esbuild nel sandbox, risolto con esecuzione autorizzata e stesso guard offline.

Full Vitest offline: **1427/1427**, **119/119 file**, zero failed, zero skipped (report `full-vitest.json`). Include e riesegue:
| Suite/gate | Risultato |
|---|---|
| Cabina resolver (16 + 26 + 4 + 20) e pagina (45) | 111/111 |
| CLOSED: Wave1 snapshot / AppContext / Reports / Distribution | 10/10 + 35/35 + 2/2 + 1/1 |
| Distribution canonical budget / pagina / CLOSED | 14/14 + 7/7 + 1/1 |
| Fondo Personale art79c1c | 6/6 |
| FAD read model | 17/17 |
| XLS FAD workbook | 16/16 |
| PDF summary real-file | 17/17 |
| Canonical ledger contract | 13/13 |
| Wave3 consistency / systemic / UI wiring / hardening | 34/34 + 21/21 + 19/19 + 7/7 |
| Auth create / password / delete | 19/19 + 34/34 + 42/42 |
| Conglobamento Art60 | 13/13 |

Gli stessi test cross-consumer A/2025 e Art60 dei precedenti slice restano invariati e sono rieseguiti nel full gate. Nessun expected economico aggiornato.

TypeScript `npx tsc --noEmit`: PASS (exit 0).
Regressione `npx vite-node scripts/run_regression_tests.ts`: 8/8, delta 0.
Oracle `npx vite-node scripts/run_wave2_oracle.ts`: 14/14, delta 0.
`git diff --check`: PASS. Avvisi Git LF/CRLF non corrispondono a modifiche di file fuori scope; hash confrontati sul contenuto effettivo.

## Scope integrity

Delta produttivo confinato a:
- `src/logic/cabina/resolveOperationalStatus.ts`
- `src/logic/cabina/resolveCabinaViewModel.ts`

Delta test confinato ai tre file Cabina sopra. Unico file nuovo: questo report.
Nessuna modifica a pagina Cabina, resolveChecklist, resolveDistributionStatus o moduli economici/readiness.

Confronto PRE/POST SHA-256: 5 file preesistenti modificati (solo resolver/test Cabina), 1103 file PRE invariati, 0 file mancanti; aggiunto soltanto il report. Inventario POST e confronto salvati in TEMP come `post-hashes.json` e `integrity-post.json`.

Hash PRE = POST per i seguenti file protetti (SHA-256):
| Path | SHA-256 invariato |
|---|---|
| `src/pages/DistribuzioneRisorsePage.tsx` | `AA132B6B4660019676E1387610CD884894259BDE1201746237A227259A74B9F2` |
| `src/logic/distribution/resolveDistributionFundBudget.ts` | `04526EA1D7E03AF8F4C9FA232FDD0A04CA22D2C64F9D963DAB0D154889006742` |
| `src/pages/CabinaDiRegiaPage.tsx` | `9CD65D8BDDDDB3F9C3BF4CD9F14156878460C0D42185D67136FF45CE69736D9E` |
| `src/logic/cabina/resolveChecklist.ts` | `DA517F1B92EE82479440512FFCF044702D9175CC44832B403242B33641508DD6` |
| `src/logic/cabina/resolveDistributionStatus.ts` | `553F798C77BCBF430BC8EC6B41AE7A30F2C6A6BE1BDAB0132786987DE1D31621` |
| `src/domain/documentProjection.ts` | `44F29B081F0B888F8D5E6CAB790BC048555280B72E80CF75C6506F39033C34D3` |
| `src/presenters/reportPresenter.ts` | `A44E86E497219C9AB2DB6A61C23B64CA79996D0CAEB7C27C89798AD8CB622BA0` |
| `src/services/documents/pdfReportService.ts` | `FB8D40E6C5677E3A430A23E6D7856462B9FA779294CF71357D47C4F46512484E` |
| `src/services/documents/xlsReportService.ts` | `DE40F1CAA5022778B4806A97664ECEA147BDE1517203197D4DB5AF456E27A249` |
| `src/logic/calculation/canonicalFundLedger.ts` | `44E7E20D8D2F062FE3688AF841AD4BCB2B225093C97B3880BC7FFE3D83D639EB` |
| `supabase/functions/create-user/index.ts` | `D95E40ACDC81B16C7AFBF9970C49F6E9361E2C6802F9DFF5D555BC5D1F25CFD4` |
| `supabase/functions/update-password/index.ts` | `04B07282D4D52DD2F098E38E94A302D425B5BE3DF964491D346FB7E62DA183C1` |
| `supabase/functions/delete-user/index.ts` | `7E475D7B4A384F0F258EE227ACDF85A7EC9CD71631FC7814F0C7EB37DAABA11C` |
| `supabase/migrations/20261002000000_harden_auth_profile_role_source.sql` | `8670E439CD6FA8AE969652445637168491AFD3388DE710CE2AE9E2752EF2614D` |

Tutti gli altri file PRE, inclusi precedenti test/report/evidence pack, risultano invariati. Nessun file preesistente cancellato/spostato. Staged ancora vuoto, branch/HEAD invariati. Nessun git add, commit, push, PR, deploy; nessuna migration creata/applicata, nessun DB staging/produzione contattato.

Guard offline copiato in TEMP da quello già usato nei gate precedenti: blocca http/https/net/tls/dns/fetch prima della connessione e registra origin product/test vs npm/npx. Artefatti Wave3 e PDF generati nei test deviati in TEMP; nessun evidence pack preesistente sovrascritto. Variabili Supabase dummy example.invalid e remote drafts disabilitati, npm offline/update notifier false.
PRODUCT_NETWORK_ATTEMPTS = 0. TOOLING_NETWORK_ATTEMPTS = 0. REAL_NETWORK_CONNECTION_ESTABLISHED = NO. Nessun record in `network-attempts.jsonl`, inclusi full suite, TypeScript, regression e oracle.
Log/config/artefatti: `C:\Users\PUSCED~1\AppData\Local\Temp\cabina-blocking-ad9b0309e2734b139022dbe29f01d8b0`.

## Regression of CALC-02 / NORM-01

CALC_02_REGRESSION = NONE.
NORM_01_REGRESSION = NONE.
CALC-02 = VERIFIED_FIXED e NORM-01 = VERIFIED_FIXED restano invariati; ASTRA_BLOCKERS_OPEN = 0.
I resolver economici, canonical ledger/formule, Fondo Personale, Distribuzione, FAD read model, XLS/PDF e Tabella15 restano byte-identici. Suite cross-consumer e Art60 pertinenti verdi. Lo stato operativo BLOCKED non muta lo stato canonico VALID o i suoi valori.

## Residual FUNC-02

FUNC-02 = HIGH / PARTIALLY_FIXED.
Restano fuori scope: DISTRIBUTION_EXPLICIT_DRAFT, auto-performance mutativo e scelta esplicita, personale assente interpretato come zero, CLOSURE_INSTRUCTION_READINESS e document readiness amministrativa.
DISTRIBUTION_POLICY_CHANGED = NO.
DOCUMENT_READINESS_CHANGED = NO.
Nessuna correzione di altri finding; slice precedenti protetti e review-pass preservati.

## Severity integrity

Le severità originali restano HIGH:
| Finding | Severità | Stato |
|---|---|---|
| FUNC-02 | HIGH | PARTIALLY_FIXED |
| DOC-02 | HIGH | PARTIALLY_FIXED |
| NORM-02 | HIGH | PARTIALLY_FIXED |
| ARCH-01 | HIGH | PARTIALLY_FIXED |

Nessuna riclassificazione di severity adottata da report storici successivi. La modifica riguarda una priorità operativa, non la chiusura integrale dei finding.

CABINA_BLOCKING_ISSUE_PRIORITY_IMPLEMENTATION = COMPLETE
RESULT = PASS
CABINA_BLOCKING_ISSUE_PRIORITY_STATUS = CLOSED_LOCALLY
NEXT_GATE_RECOMMENDATION = CABINA_BLOCKING_ISSUE_PRIORITY_INDEPENDENT_REVIEW
