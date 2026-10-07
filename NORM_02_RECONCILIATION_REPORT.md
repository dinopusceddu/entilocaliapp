# NORM-02 — Reconciliation report

### 1. Executive result

**NORM_02_RECONCILIATION = FAIL.** Data: 2026-10-06. Nessuna promozione eseguita. Il census reale dell'ultimo registro completo disponibile restituisce VF9/PF8/OPEN8, non VF17/PF5/OPEN3. La sola promozione NORM-02 darebbe VF10/PF7/OPEN8; ottenere VF18/PF4/OPEN3 richiederebbe otto transizioni aggiuntive, vietate dal task. La review NORM-02 contiene il verdetto VERIFIED_FIXED e tutti i gate tecnici PASS, ma non le tre attestazioni esplicite BLOCKERS=0, MAJOR=0 e MINOR=0 richieste come condizione documentale. Questo esito riguarda esclusivamente il gate di reconciliation; non annulla il PASS tecnico dell'implementation o il verdetto favorevole presente nella review.

### 2. Baseline

- Branch: ux/toolbox-area-fondo-prototype.
- HEAD: d3170f959b5815c514dbf3d6e5f93366a5f14c67; entrambi coincidono con gli attesi.
- Working tree intenzionalmente dirty: 929 righe PRE; 103 file tracked modificati. Modifiche preesistenti preservate.
- Index: vuoto, zero entry in git diff --cached --name-status.
- Comandi PRE eseguiti: git branch --show-current; git rev-parse HEAD; git status --short --untracked-files=all; git diff --cached --name-status.
- Snapshot di controllo locale fuori repository: C:/Users/PUSCED~1/AppData/Local/Temp/norm02-reconciliation-v8UC36/pre.json; include output PRE completi, diff tracked PRE, census e SHA-256 di 1556 file preesistenti. Nessuna evidenza precedente riscritta.

### 3. Authority files

| Path | Funzione / authority | Decisione e motivo |
|---|---|---|
| ASTRA_25_FINDINGS_CURRENT_STATE_RECONCILIATION.md | Ultimo registro completo trovato, matrice di 25 ID; fotografia datata 04.10.2026 e verificata dalla propria review | Invariato: riporta 9/8/8. Nessun successivo registro completo 17/5/3 individuato; non riscrivere la fotografia né promuovere altri finding per adeguare i numeri. |
| ASTRA_25_FINDINGS_CURRENT_STATE_RECONCILIATION_INDEPENDENT_REVIEW.md | Review storica che conferma esplicitamente 9/8/8 | Evidence immutabile, invariata. |
| ASTRA_FINAL_FINDINGS_RECONCILIATION.md | Reconciliation precedente, 5/12/8 | Documento storico, invariato. |
| ASTRA_RSU_AUDIT_REPORT.md | Audit originario, identità/severità/acceptance dei 25 finding | Documento storico, invariato. |
| ASTRA_TEST_MATRIX.md / ASTRA_NORMATIVE_MATRIX.md | Matrici di prove e contratto originario dell'audit | Snapshot storico, non un registro corrente 17/5/3; invariato. |
| MEMORIA_AI.md | Memoria canonica di continuità, si dichiara baseline per il prossimo agente; sezione corrente Wave 4.1, nessun census ASTRA aggiornato | Invariata: non registrare una chiusura formale che il gate non consente. |
| MONETARY_INPUT_BOUNDARY_INDEPENDENT_REVIEW.md | Review DATA-03, dichiara teoricamente 17/5/3 e precisa che la reconciliation ufficiale non è stata modificata | Evidence storica, non un nuovo registro; invariata. |

FILES_TO_UPDATE annunciato prima della scrittura: **NORM_02_RECONCILIATION_REPORT.md soltanto**, nuovo resoconto del gate fallito. Nessun secondo registro operativo creato: il census riportato sotto è una copia di verifica PRE/POST, non una nuova authority.

Ricerca effettuata con rg --files --hidden e rg su Markdown/JSON del repository, incluse regole ignore disattivate per la ricerca di contenuto. Cercati reconciliation, finding registry, ledger, memoria, conteggi 17 e stati DATA-03/ARCH-01. Nessun AGENTS.md presente nei livelli workspace/parent controllati. Report di implementation e review più recenti citano i conteggi, ma non sostituiscono il census ufficiale mancante.

### 4. Evidence chain

- [Implementation V2](CCNL_RECOVERY_INSTRUCTION_IMPLEMENTATION_V2_REPORT.md): presenti CCNL_RECOVERY_INSTRUCTION_STATUS=CLOSED_LOCALLY e NORM_02_STATUS_AFTER_SLICE=CANDIDATE_VERIFIED_FIXED. IMPLEMENTATION_EVIDENCE=PASS.
- [Independent review](CCNL_RECOVERY_INSTRUCTION_INDEPENDENT_REVIEW.md): intestazione Independent Review Verdict=VERIFIED_FIXED; sezione 19 documenta full product2041/2041, regression8/8, oracle14/14, TypeScript PASS, diff check PASS.
- La review non contiene le attestazioni BLOCKERS=0, MAJOR=0, MINOR=0. Il valore ASTRA_BLOCKERS_OPEN=0 alla fine riguarda l'intero audit, non il conteggio di rilievi BLOCKER/MAJOR/MINOR della review. Non inferirlo come attestazione equivalente.
- Anche i token conclusivi CCNL_RECOVERY_INSTRUCTION_INDEPENDENT_REVIEW=PASS e NORM_02_RECOMMENDED_STATUS=VERIFIED_FIXED non sono espliciti nel file; il verdetto favorevole in prosa è presente. La mancanza determinante resta quella delle tre attestazioni richieste.
- INDEPENDENT_REVIEW_EVIDENCE=FAIL limitatamente alla completezza documentale richiesta da questo task; nessun test dichiarato fallito o rieseguito.

Entrambi gli artifact restano byte-identici; non corretti refusi o risultati. Il riferimento descrittivo CCNL 16.07.2024 della review non è assunto come authority normativa.

### 5. Stato NORM-02 PRE

PARTIALLY_FIXED, ricavato dalla colonna Stato corrente del registro reale.

### 6. Stato NORM-02 POST

PARTIALLY_FIXED, invariato. VERIFIED_FIXED è il verdetto raccomandato dalla review, non una transizione formalmente eseguita in questo task.

### 7. Motivazione

Il fondamento della promozione proposta resta il **CCNL Funzioni Locali 2022-2024 sottoscritto il 23.02.2026**, articoli 58 e 59, secondo il policy contract approvato; fonti ARAN 37357/39114/35083 e distinguo contabile autorizzati. Nessuna ricerca normativa o modifica del prodotto in questo task.

L'implementation V2 documenta recovery CCNL istruita per competence year, separazione CURRENT/RECOVERY e formule current preservate; provenance obbligatoria; importi già riconosciuti separati dagli importi richiesti; recupero parziale; residui derivati; distinzione Fondo/EQ/performance. UNINSTRUCTED produce UNDETERMINED senza default implicito a zero. L'autorità automatica legacy 0,0028 è ritirata, con canonical ledger single economic authority. Sono verificati assenza di current/recovery double count, EQ double count e performance leakage nel Fondo, transfer idempotente, save/reload, document projection, Cabina/Distribution/Closure readiness. Gate tecnici documentati: product2041/2041, regression8/8, oracle14/14, TypeScript e diff check PASS. Il verdetto indipendente favorevole è presente; manca il completamento formale della chain e della baseline documentale.

### 8. Census dei 25 finding

| ID | PRE reale | POST reale |
|---|---|---|
| SEC-01 | VERIFIED_FIXED | VERIFIED_FIXED |
| DATA-01 | OPEN | OPEN |
| DATA-02 | VERIFIED_FIXED | VERIFIED_FIXED |
| DATA-03 | PARTIALLY_FIXED | PARTIALLY_FIXED |
| CALC-01 | VERIFIED_FIXED | VERIFIED_FIXED |
| CALC-02 | VERIFIED_FIXED | VERIFIED_FIXED |
| CALC-03 | OPEN | OPEN |
| CALC-04 | PARTIALLY_FIXED | PARTIALLY_FIXED |
| CALC-05 | OPEN | OPEN |
| DOC-01 | VERIFIED_FIXED | VERIFIED_FIXED |
| DOC-02 | VERIFIED_FIXED | VERIFIED_FIXED |
| NORM-01 | VERIFIED_FIXED | VERIFIED_FIXED |
| NORM-02 | PARTIALLY_FIXED | PARTIALLY_FIXED |
| NORM-03 | OPEN | OPEN |
| NORM-04 | OPEN | OPEN |
| ARCH-01 | PARTIALLY_FIXED | PARTIALLY_FIXED |
| ARCH-02 | PARTIALLY_FIXED | PARTIALLY_FIXED |
| FUNC-01 | VERIFIED_FIXED | VERIFIED_FIXED |
| FUNC-02 | VERIFIED_FIXED | VERIFIED_FIXED |
| FUNC-03 | OPEN | OPEN |
| UX-01 | PARTIALLY_FIXED | PARTIALLY_FIXED |
| UX-02 | PARTIALLY_FIXED | PARTIALLY_FIXED |
| UX-03 | PARTIALLY_FIXED | PARTIALLY_FIXED |
| ACCESS-01 | OPEN | OPEN |
| ACCESS-02 | OPEN | OPEN |

Membership confrontata con i 25 ID originali: 25 righe, 25 ID univoci, zero duplicati, zero mancanti, zero extra. Tutte le righe mantenute invarianti. Le cinque severità BLOCKER originali hanno tutte status VERIFIED_FIXED: BLOCKERS_OPEN=0.

### 9. Conteggi PRE

| Fonte | VF | PF | OPEN | TOTAL | BLOCKERS_OPEN |
|---|---:|---:|---:|---:|---:|
| Registro reale censito | 9 | 8 | 8 | 25 | 0 |
| Baseline dichiarata nel task / review successive | 17 | 5 | 3 | 25 | 0 |

9+8+8=25. Il census non dimostra la baseline 17+5+3=25: la seconda somma è corretta aritmeticamente, ma non rappresenta la matrice effettivamente disponibile.

### 10. Conteggi POST

Registro invariato: VF9/PF8/OPEN8, TOTAL25, BLOCKERS_OPEN0. Delta effettivo 0/0/0/0/0. La destinazione richiesta VF18/PF4/OPEN3 è **non raggiunta e non dichiarata come nuova baseline**.

### 11. Status transition audit

STATUS_TRANSITIONS=0; OTHER_STATUS_CHANGES=0. NORM-02 PARTIALLY_FIXED -> PARTIALLY_FIXED. Promuovere soltanto NORM-02 nella matrice reale produrrebbe 10/7/8. Per raggiungere anche la baseline dichiarata sarebbero necessarie le seguenti otto ulteriori transizioni, non autorizzate:

| ID | Stato nella matrice disponibile | Stato nella baseline dichiarata |
|---|---|---|
| DATA-01 | OPEN | VERIFIED_FIXED |
| DATA-03 | PARTIALLY_FIXED | VERIFIED_FIXED |
| CALC-03 | OPEN | VERIFIED_FIXED |
| CALC-04 | PARTIALLY_FIXED | VERIFIED_FIXED |
| CALC-05 | OPEN | VERIFIED_FIXED |
| NORM-03 | OPEN | VERIFIED_FIXED |
| NORM-04 | OPEN | VERIFIED_FIXED |
| ARCH-01 | PARTIALLY_FIXED | VERIFIED_FIXED |

Nessuna di queste transizioni è stata eseguita. Non basta sostituire i numeri nel report: prima serve individuare o riconciliare, con mandato separato, il registro antecedente 17/5/3.

### 12. Scope integrity

Unico nuovo artifact nel workspace: NORM_02_RECONCILIATION_REPORT.md. Nessuna authority preesistente modificata; nessun file src, test, schema, UI, engine, runtime/config, package/lock, oracle/golden, DB/migration modificato. Tutti i 1556 hash PRE sono preservati. Snapshot includente tracked/untracked, root Markdown ignorati da Git, src/tests/scripts/supabase ed evidenze CCNL; nessuna evidence PDF/XLS esistente riscritta. Delta tracked rispetto al PRE zero, index sempre vuoto. SCOPE_INTEGRITY=PASS, RECONCILIATION_SCOPE_VIOLATION=FALSE.

### 13. MEMORIA_AI

MEMORIA_AI_UPDATE=FAIL: il file esiste ed è memoria canonica, ma l'aggiornamento di chiusura richiesto è sospeso perché il gate di reconciliation non passa. NOT_APPLICABLE sarebbe inesatto. Nessuna sezione storica o corrente riscritta.

### 14. Diff integrity

Git diff --check PASS, exit0. Eseguiti inoltre git diff --name-status, git diff e git status --short --untracked-files=all, con confronto byte-esatto dell'output tracked PRE/POST e confronto dei file. Il dirty diff complessivo è preesistente: non è attribuito a questa operazione. Le avvertenze Git LF/CRLF già presenti non sono errori diff-check. Il nuovo report viene controllato separatamente perché un file untracked/ignorato non appare nel normale git diff.

### 15. Production integrity

PRODUCTION_FILES_CHANGED=0; TEST_FILES_CHANGED=0; CONFIG_FILES_CHANGED=0. Golden, oracle, DB, migration e tutti i file preesistenti censiti invariati. Nessuna chiamata DB, Supabase, staging o produzione; nessuna rete, migration, commit, push, PR o deploy. Product suite non rieseguita: FULL_PRODUCT_NOT_RERUN_REASON=DOCUMENTATION_ONLY_RECONCILIATION. I numeri 2041/2041,8/8,14/14 sono evidence della review appena letta, non risultati di una nuova esecuzione.

| Artifact preservato | SHA-256 PRE = POST | Esito |
|---|---|---|
| CCNL_RECOVERY_INSTRUCTION_IMPLEMENTATION_V2_REPORT.md | 9e2b9539d0514b35b89c8002bc70779eb9d93129421e9611e6ecb4291357945b | UNCHANGED |
| CCNL_RECOVERY_INSTRUCTION_INDEPENDENT_REVIEW.md | 55810dd3bd1a65585edfabd75fe38c4b8f37f1dbfe19facfc38667352123f108 | UNCHANGED |
| ccnl_recovery_instruction_evidence/v2-terminal-output.txt | ddfe49a81587ae4fe4a09209d7ed02ae9afcefb2e3d3488ee547457ec035693b | UNCHANGED |
| ccnl_recovery_instruction_evidence/v2-scope.json | e5b8c3eadc1588dd4266bdce32ade5f20f1991cd6c7661fb7e719b863407a06f | UNCHANGED |
| ccnl_recovery_instruction_evidence/v2-exits.json | d472edb144953d77a71f7b0f99c54d406676241cf52ce4d8e979a3c1d39ba730 | UNCHANGED |
| ccnl_recovery_instruction_evidence/v2-product-verified.json | c50e1995e27db27dafbe4a59aec5aebca86c86c8b24a1bdb88d85ac7e9a3d0a2 | UNCHANGED |
| ASTRA_25_FINDINGS_CURRENT_STATE_RECONCILIATION.md | a20337684a71a5dfdd561df2bdd9597a6f717d866ac10569df712272e9b5df0f | UNCHANGED |
| MEMORIA_AI.md | 653ff350dd2cc5b17e4a4712ecd47262fcaa92635701da090e3db39fbce1d17f | UNCHANGED |
| tests/fixtures/fondo/golden_results.json | dc0a12cf4bc2ec16c892aed362adac2671ba44705155c84a588715edabf49ef0 | UNCHANGED |
| scripts/run_wave2_oracle.ts | 0ea62eb3db62506625b1e60dfedc986d5938b1411792903f4f10f3df0e67879f | UNCHANGED |

### 16. Next gate

POST_RECONCILIATION_BASELINE_REVIEW: verificare il disallineamento fra registro 9/8/8 e baseline dichiarata 17/5/3 e acquisire le attestazioni esplicite mancanti della review in un artifact successivo, preservando il report storico. Poi riprendere la sola promozione NORM-02 con census PRE coerente. Nessuna nuova remediation avviata.

### Output terminale

~~~text
NORM_02_RECONCILIATION = FAIL
NORM_02_PRE = PARTIALLY_FIXED
NORM_02_POST = PARTIALLY_FIXED
STATUS_TRANSITIONS = 0
ASTRA_VERIFIED_FIXED = 9
ASTRA_PARTIALLY_FIXED = 8
ASTRA_OPEN = 8
ASTRA_TOTAL = 25
ASTRA_BLOCKERS_OPEN = 0
ASTRA_COUNT_RECONCILIATION = FAIL
FINDING_CENSUS = 25/25 PASS
DUPLICATE_FINDINGS = 0
MISSING_FINDINGS = 0
OTHER_STATUS_CHANGES = 0
IMPLEMENTATION_EVIDENCE = PASS
INDEPENDENT_REVIEW_EVIDENCE = FAIL
PRODUCTION_FILES_CHANGED = 0
TEST_FILES_CHANGED = 0
CONFIG_FILES_CHANGED = 0
GOLDEN_CHANGED = NO
ORACLE_CHANGED = NO
DATABASE_CHANGED = NO
MIGRATIONS_CHANGED = NO
MEMORIA_AI_UPDATE = FAIL
FULL_PRODUCT_NOT_RERUN_REASON = DOCUMENTATION_ONLY_RECONCILIATION
DIFF_CHECK = PASS
SCOPE_INTEGRITY = PASS
RECONCILIATION_SCOPE_VIOLATION = FALSE
COMMIT = NO
PUSH = NO
PR = NO
DEPLOY = NO
NEXT_GATE = POST_RECONCILIATION_BASELINE_REVIEW
~~~
