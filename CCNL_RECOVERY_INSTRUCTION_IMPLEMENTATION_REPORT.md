# CCNL_RECOVERY_INSTRUCTION — mandatory preflight stop

## Executive result

`RESULT = BLOCKED`; `NORMATIVE_PREFLIGHT = AMBIGUOUS`; mandatory stop `CCNL_RECOVERY_POLICY_AMBIGUITY`. L'implementazione prodotto non è iniziata. Nessuna formula, campo JSON, UI, registro monetario, readiness o writer modificato.

La documentazione locale conferma casi di recupero nel 2026, ma non permette di definire una policy completa per la finestra di riconoscimento, gli stati amministrativi dell'annualità originaria e il percorso alternativo di arretrati performance. Il prompt impone STOP ai punti 5, 17 e 69 quando questi contratti non sono dimostrabili. Non è stata inventata una finestra universale, né una regola che autorizzi/vieti automaticamente il recupero perché lo snapshot è CLOSED.

NORM-02 resta PARTIALLY_FIXED. ASTRA formale resta VF17/PF5/OPEN3, TOTAL25, blockers0. UX-01 resta PARTIALLY_FIXED; ACCESS-02 OPEN. Nessuna reconciliation aggiornata.

## Baseline

Verificati prima di ogni modifica: `git branch --show-current`, `git rev-parse HEAD`, `git status --short --untracked-files=all`, `git diff --name-status`, `git diff --cached --name-status`.

- Branch: `ux/toolbox-area-fondo-prototype`.
- HEAD: `d3170f959b5815c514dbf3d6e5f93366a5f14c67`.
- Dirty tree intenzionale: 817 righe status, 100 file tracked nel diff iniziale; index vuoto.
- Inventario PRE SHA-256: 756 file, comprendenti src, scripts, tests, public, docs, fileprogetto, fonti ASTRA e report root. Tutti invariati nel confronto POST.

Evidenza: `ccnl_recovery_instruction_evidence/pre-status.txt`, `pre-diff.txt`, `pre-index.txt`, `pre-sha256.json`, `post-sha256.json`, `scope-integrity.json`. I numeri dirty rispetto a HEAD non sono attribuiti a questo slice. Creati soltanto questo report e la cartella di evidenze preflight.

## NORM-02 original acceptance

Acceptance: `RECOVERY IS EXPLICITLY INSTRUCTED PER COMPETENCE YEAR`. Richiede kind/year, decisione, provenance, riconosciuto precedente, importo recuperabile e richiesto, residuo e assenza di duplicazioni, senza alterare CURRENT. La separazione esistente corrente/recovery non equivale alla chiusura dell'istruttoria residua.

## Normative preflight

Fonti locali esaminate:

| Fonte | Evidenza / limite |
|---|---|
| `astra_evidence/run_20260921/sources/CCNL2026.txt:3043` | Testo Art58: 0,14 stabile da2024; 0,22 facoltativo, capacità di bilancio, riparto proporzionale basi2024, esclusione Art23 |
| `ASTRA_NORMATIVE_MATRIX.md:24` e `:54`; `astra_evidence/run_20260921/PASS2_RULES.md:14` | Sintesi locale ARAN37357: recupero 0,14 competenza2024/25 in variabile2026 per annualità chiuse; alternativa performance con clausola automatica integrativa; criterio analogo 0,22 competenza2025 |
| Raccolte sistematiche DOCX locali, Art58/59 e Art79 precedente | Confermano testo contrattuale e distinguono regole espresse del precedente rinnovo; queste ultime non possono essere trasferite al rinnovo2026 per analogia automatica |
| `fileprogetto/9788891682826 Giannotti 2026.pdf`, pp11–12/20–24 PDF | Documento secondario di 25 pagine: cita recupero2025 dello0,22 nel2026 e arretrati0,14; contiene anche ipotesi di riparto0,14 non coincidenti con il contratto applicativo consolidato, quindi non usate per riscrivere CURRENT |
| `fileprogetto/pareri_aran_funzioni_locali.txt` | Raccolta locale consultata: nessuna copia integrale identificata di ARAN37357; contiene orientamenti precedenti relativi anche a MS2018 |
| Guide DOCX/PDF e HTML locali | Ricerca testuale; non identificata una fonte che risolva integralmente le condizioni mancanti |
| `ccnl2026Increments`, test correnti, oracle O022 | Dimostrano CURRENT e recovery non automatico; non definiscono eligibility per-year dei nuovi recovery |
| Ledger, struttura Fondo, Step4, transfer, document projection/read models e writer moderni | Tracciata separazione corrente/recovery e stato non definitivo legacy |

DOCX estratti localmente da XML ZIP; PDF letti con pypdf già disponibile. Nessun download, OCR remoto o installazione. Le estrazioni e match sono nella cartella di evidenze; il report sintetizza, senza riprodurre estesi testi editoriali.

### Policy gaps concreti

| Gap | Caso che richiede una decisione | Perché le fonti locali non bastano |
|---|---|---|
| Finestra di riconoscimento | kind014, competence2024/25, recognition2027; kind022, competence2025, recognition2027; eventuale competence2026/recognition2027 | Sintesi e fonte secondaria trattano il riconoscimento2026; non dimostrano estensione, scadenza o inapplicabilità successiva. Non è lecito inventare nessuna di queste tre regole |
| Stato amministrativo originario | competence2025 con snapshot CLOSED ma contratto integrativo/clausola automatica non qualificati | Snapshot CLOSED dell'app non prova da solo chiusura della contrattazione, presenza della clausola, vincolo di destinazione o regime contabile |
| Percorso alternativo performance | Annualità chiusa con clausola integrativa automatica | La sintesi prevede un'alternativa; non definisce condizioni operative complete per scegliere contributo al Fondo corrente oppure arretrati performance evitando duplicazione |
| Titolo/importo autorizzato0,22 | Massimo2025=2200, decisione inferiore o mancante, recovery nel2026 | Il massimo matematico è noto; non è dimostrato il contratto amministrativo completo per riconoscibilità nel percorso originario/current, né basta chiamare il massimo «autorizzato» |

Il preflight non trasforma la mancanza di prova in un divieto normativo. La policy è non determinata, non «recupero vietato dopo2026». La ricostruzione richiede una fonte locale verificabile o una policy applicativa esplicitamente approvata e ancorata alla fonte, separata per kind014/kind022.

## Existing current formulas

`src/logic/wizard2026/ccnl2026Increments.ts` invariato. Verificati test reali e oracle congelato. 0,14 tutto FAD;0,22 variabile facoltativo, riparto proporzionale FRD/EQ2024. Anni>2026 usano MS2021 consolidato secondo contratto esistente. Nessun current semantic gap rilevato.

## Existing recovery behavior

Wizard restituisce `arretrati014`, `arretrati014Fondo`, `arretrati014EQ` undefined, senza multiplo automatico. Ledger rappresenta l'eventuale aggregato legacy come entry distinta UNDETERMINED/INVALID, senza totale definitivo. Mancano nuove istruzioni per-year risolte; il preflight bloccato impedisce di aggiungerle con policy ipotetiche.

## 0.14 current contract

Art58c1: stabile da2024, MS2021×0,0014, all'attuale rounding. MS2021=1000000 →1400 nel2026; quote automatiche EQ=0. Invariato e testato.

## 0.14 recovery contract

Sintesi locale ARAN: competenze2024/25, possibile variabile una tantum2026, distinto dal corrente. Struttura Fondo legacy: `vn_art58_CCNL2026_arretrati2024_2025` in variabile non soggetta Art23. Non dedotta la recovery policy dalla CURRENT. Finestra successiva e scelta del percorso alternativo performance restano non determinate.

## 0.22 current contract

Oracle reale, MS2021=1000000: 2024=0;2025=2200;2026=2200;2027=2200. Quote con FRD2024=80000,EQ2024=20000:1760/440 quando applicato2200. Nel2026 nessun automatico4400. Preservati discrezionalità, COSFEL e trattamento Art23 esistenti.

## 0.22 recovery contract

Fonti locali citano competence2025 separata dal current2026. Nessuna istruttoria recovery esistente ne governa riconoscibilità per-year. Capacità teorica2200 non dimostra importo autorizzato, già utilizzato, richiesta o ammissibilità della destinazione. Riparto corrente basi2024 noto e non modificato; non costruita una nuova allocation recovery per un percorso amministrativo ancora ambiguo.

## Competence-year model

Non implementato. Il modello proposto dal prompt non viene trasformato in codice prima di risolvere eligibility, recognition window e origin-state policy. Nessun nuovo campo FundData/AnnualData.

## Instruction statuses

Non implementati UNINSTRUCTED/RESOLVED_ZERO/PARTIAL/FULL/INVALID nuovi. Non reinterpretato undefined come zero. Stato legacy UNDETERMINED preservato.

## Provenance model

Non implementato un nuovo modello. Metadata/provenance esistenti restano invariati. Non fabbricati origin year o decisioni dalla label2024–2025.

## Already-recognized / residual

Non implementati nuovi input o formula residual. Il confronto autorizzato−riconosciuto necessita di una definizione normativa/amministrativa verificata dell'importo autorizzato. Nessun clamp automatico.

## Partial recovery

Non implementato per mandatory stop. I test per richiesta<=residuo non sarebbero sufficienti a dimostrare l'ammissibilità del titolo e della finestra.

## Closed competence years

Gap `CCNL_CLOSED_YEAR_RECOVERY_AMBIGUITY` incluso nella primary `CCNL_RECOVERY_POLICY_AMBIGUITY`. CLOSED snapshot non reinterpretato come autorizzazione/divieto. Zero writer o writeback verso anni originari.

## Canonical ledger integration

Nessuna modifica. Ledger rimane authority unica. Entry CURRENT preservate; recovery legacy non definitivo preservato. Non creati importi VALID senza competence/provenance.

## Semantic IDs / duplicate prevention

Nessun nuovo ID. Test L1 di duplicate IDs e contratti current/recovery esistenti passano. Non dichiarata completata la prevenzione duplicazioni delle istruzioni per-year non implementate.

## Legacy aggregate retirement

Inventario preflight: `src/logic/ccnl2024Calculations.ts:33` conserva `MS2021*0.0028`; chiamato dal motore per la riduzione Art60 e da compatibility composition. Questa presenza non autorizza recovery: motore FAD usa ledger, non le somme legacy di quel helper. Il percorso Wizard produce recovery undefined; ledger marca l'aggregato esplicito UNDETERMINED.

Nessuna rimozione o refactor effettuati. Ruolo del valore0.0028 osservato: compatibility/theoretical; non una nuova recovery authority introdotta. Il retirement per-year richiesto da NORM-02 non è stato completato né dichiarato PASS.

## annualita022Considerate

Campo snapshot attuale: anno>=2025 ?1:0. È un indicatore della corrente considerata, non proof di recovery precedente. Wiring nuovo con anni istruiti non implementato; espressione esistente invariata.

## Wizard / UI

Step4 corrente distingue stabile, facoltà variabile e recuperi da istruire. Non introdotto editor recovery. Nessun redesign o cambiamento accessibility.

## Transfer

Transfer legge risultati calcolati; non ricostruisce automaticamente arretrati quando undefined. Nessun nuovo transfer recovery; idempotenza nuova non testata. Guard DATA03 e CLOSED invarianti.

## Save/reload

Nessun campo nuovo da persistere. Save/reload degli instruction state non implementato e non attestato. Persistence, CAS, hydration e repository invariati.

## CLOSED

Nessuna modifica a snapshot CLOSED corrente/originario; nessuna apertura o migration. FUNC01 preservato per invariance dei file, senza nuova prova applicativa CLOSED in questo slice.

## Document projection

`projectFadReport` legge solo canonico; signedAmount di entry unresolved è null. Label esistente recovery legacy distinta da CURRENT; final amounts non ricalcolati autonomamente dai writer moderni. Nessun nuovo breakdown annualità/provenance aggiunto. Document policy invariata.

## Cabina

Nessun nuovo upstream issue wiring. Resolver/priorità esistenti invariati. Nuovi scenari per-year non eseguiti perché modello non implementato.

## Distribution

Budget canonico esistente invariato. Recovery unresolved non promosso a budget da questo slice. Nessuna modifica CALC02.

## Closure readiness

Nessuna nuova regola o RPC. Per introdurre una issue materialmente rilevante, prima va definita la recovery eligibility/window; non inventata readiness universale su tutti gli anni.

## Monetary boundary

Registro e parser DATA03 invariati. Nessun nuovo field path monetario; nessun bypass aggiunto. Missing/zero/sign/scale/range esistenti preservati. Non eseguito nuovo census monetario prodotto non necessario allo STOP.

## Protected regressions

Zero file prodotto/test/fixture/oracle modificati: SHA256 PRE/POST identici. SEC01, DATA01/02/03, CALC01..05, DOC01/02, NORM01/03/04, ARCH01, FUNC01/02 non sono stati implementati o riaperti. Il confronto prova invariance del codice, non una nuova certificazione esaustiva di tutti i workflow.

## Tests

Eseguiti esclusivamente i check utili al preflight, offline e senza nuove fixture:

| Gate | Esito di questa esecuzione |
|---|---|
| `ccnl2026Increments.test.ts` |17/17 PASS |
| `canonicalFundLedger.contract.test.ts` |13/13 PASS |
| Oracle congelato |14/14 PASS |
| git diff --check |PASS |
| Full product suite |Non rieseguita: STOP prima dell'implementation; baseline dichiarata1988/1988,144 file |
| Regression8/8 / TypeScript |Non rieseguiti: nessuna modifica prodotto |
| Nuovi recovery/workflow/document tests |Non creati/eseguiti: policy ambigua |

File esiti: `preflight-tests.json`, `preflight-exit.json`, `oracle.txt`, `diff-check-exit.txt`. Nessun golden/oracle aggiornato. Non dichiarati test nuovi PASS quando non eseguiti.

## Scope integrity

`scope-integrity.json`:756 file inventoried,0 changed,0 product files changed. Creati solo report ed evidenze di lettura/test; source normativo e DOCX/PDF originali intatti. Nessun Git add/commit/push/PR/deploy, checkout/reset/restore/stash/merge/rebase/pull o cancellazione untracked. Database/migrations/staging/production invariati.

Strict offline: product network attempts0;tooling2 richieste localhost risolte in memoria dalla guard,0 outbound,0 connessioni reali. Python legge solo file locali. Nessun registry/Internet/Supabase.

## NORM-02 reassessment

`NORM_02_STATUS_AFTER_SLICE = PARTIALLY_FIXED`; `CCNL_RECOVERY_INSTRUCTION_STATUS = BLOCKED`. Non CANDIDATE_VERIFIED_FIXED: requisiti per-year/provenance/residui/partial/readiness non implementati. ASTRA invariato VF17/PF5/OPEN3,blockers0.

## UX-01 residual

UX01 resta PARTIALLY_FIXED; nessuna nuova provenance production. ACCESS02 OPEN. Nessun finding UX/access/Auth modificato.

## Next gate

Prima `CCNL_RECOVERY_POLICY_RESOLUTION`: rendere disponibili localmente testo/verifica completa ARAN37357 e un contratto esplicito per kind014 e kind022 che specifichi recognition window, condizioni dell'annualità originaria, percorso Fondo/performance e determinazione dell'importo riconoscibile. Non basta autorizzare genericamente «procedi» o fornire un teorico2800/2200.

Poi riprendere `CCNL_RECOVERY_INSTRUCTION` dall'attuale dirty baseline intatta. `CCNL_RECOVERY_INSTRUCTION_INDEPENDENT_REVIEW` rimane il gate successivo a un'implementation completata, non il prossimo gate operativo di questo tentativo BLOCKED.
