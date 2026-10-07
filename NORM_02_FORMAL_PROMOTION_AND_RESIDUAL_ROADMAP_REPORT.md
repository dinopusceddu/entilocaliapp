# NORM-02 formal promotion and residual roadmap — report

Data: 07.10.2026. **NORM_02_FORMAL_PROMOTION_AND_RESIDUAL_ROADMAP = PASS.** Unica promozione NORM-02 PF→VF; baseline ufficiale **VF18/PF4/OPEN3**, TOTAL25, BLOCKERS_OPEN0. Roadmap consolidata: sette finding, tre implementation slice, due independent review. Nessuna nuova implementation o independent review eseguita.

## 1. Preflight

- Branch: ux/toolbox-area-fondo-prototype.
- HEAD: d3170f959b5815c514dbf3d6e5f93366a5f14c67.
- Eseguiti prima di scrivere: git branch --show-current, git rev-parse HEAD, git status --short --untracked-files=all, git diff --cached --name-status.
- Working tree intenzionalmente dirty: 932 righe di status PRE, 103 entry tracked già modificate; index vuoto. Nessuna pulizia, staging o operazione di consolidamento Git.
- Snapshot PRE in C:\Users\PUSCED~1\AppData\Local\Temp\norm02-promotion-roadmap-SKFcBM: pre.json contiene branch, HEAD, status completo, index, diff tracked binario, 1627 hash SHA-256, census e gate; authority-pre.md e memory-pre.md conservano i due file prima della modifica. Snapshot tecnico in TEMP, nessun artifact ulteriore nel repository.

Il confronto è fra filesystem PRE/POST di questo task: il diff rispetto a HEAD include remediation precedenti e non misura da solo lo scope odierno.

## 2. Evidence gate

Lette direttamente implementation V2, independent review e addendum formale. Gate PASS per tutti e tre:

| Artifact | Attestazioni verificate |
|---|---|
| [Implementation V2](CCNL_RECOVERY_INSTRUCTION_IMPLEMENTATION_V2_REPORT.md) | RESULT PASS; CCNL_RECOVERY_INSTRUCTION_STATUS CLOSED_LOCALLY; NORM_02_STATUS_AFTER_SLICE CANDIDATE_VERIFIED_FIXED |
| [Independent review](CCNL_RECOVERY_INSTRUCTION_INDEPENDENT_REVIEW.md) | Independent Review Verdict VERIFIED_FIXED; product2041/2041, regression8/8, oracle14/14, TypeScript e diff check PASS |
| [Formal addendum](CCNL_RECOVERY_INSTRUCTION_INDEPENDENT_REVIEW_ADDENDUM.md) | ADDENDUM PASS; ORIGINAL_REVIEW_VERDICT VERIFIED_FIXED; technical gates e acceptance completeness PASS; BLOCKERS=0, MAJOR=0, MINOR=0; FORMAL_REVIEW_COMPLETENESS COMPLETE; RECOMMENDED_STATUS VERIFIED_FIXED |

Il precedente impedimento era formale e risulta risolto dall’addendum, senza modificare la review originaria. L’authority corrente è ancora ASTRA_25_FINDINGS_CURRENT_STATE_RECONCILIATION.md: la sezione attiva si dichiara canonica e contiene la tabella completa; le precedenti review/formal reconciliation la identificano nello stesso modo. Roadmap e memoria non costituiscono registri paralleli.

## 3. NORM-02 PRE

PARTIALLY_FIXED nel census reale, con implementation/review favorevoli e addendum precedentemente pendente. Non ricavato da baseline aggregate di report successivi.

## 4. Addendum result

**PASS. BLOCKERS0 / MAJOR0 / MINOR0; formal completeness COMPLETE; recommended status VERIFIED_FIXED.** Gate storici persistiti: full product2041/2041 (147 file, zero skipped), regression8/8, oracle14/14, TypeScriptPASS, diff checkPASS. Nessuna nuova remediation richiesta dall’addendum. Questi sono risultati della catena tecnica precedente, letti e verificati documentalmente; non sono nuove esecuzioni di questo task.

## 5. NORM-02 POST e motivazione

**VERIFIED_FIXED.** CCNL Funzioni Locali 2022-2024 sottoscritto il 23.02.2026, articoli58 e59, secondo il policy contract già approvato. CURRENT formulas preservate e CURRENT/RECOVERY separati; competence year e provenance espliciti; già riconosciuto distinto da richiesto, recupero parziale e residui derivati. Fondo/EQ/performance separati; UNINSTRUCTED→UNDETERMINED senza default a zero; invalid e duplicate fail-closed. Retirement dell’autorità automatica legacy0,0028; canonical ledger single economic authority. Assenti current/recovery double count, EQ double count e performance leakage nel Fondo.

Transfer idempotente, save/reload, document projection, Cabina readiness, Distribution readiness e Closure readiness verificati nella catena implementation/review. Motivazione e riferimenti ai tre artifact registrati nell’authority senza copiarne il contenuto integrale. Non propagato il refuso CCNL16.07.2024 della review storica; le anomalie editoriali DL25 restano history immutabile.

## 6. Census PRE

Parser della sola sezione corrente prima del marcatore storico, colonne ID e Stato corrente; confronto con l’insieme dei25 ID originari. **25/25**, duplicati0, mancanti0, extra0. VF17 / PF5 / OPEN3 / TOTAL25 / BLOCKERS_OPEN0. Il registro storico incluso in details non viene contato una seconda volta.

## 7. Census POST

Stesso parser e controllo di membership: **25/25**, duplicati0, mancanti0, extra0. **VF18 / PF4 / OPEN3 / TOTAL25 / BLOCKERS_OPEN0**. Summary della tabella e output corrente concordano. Severity invariata: cinque BLOCKER tutti VF; HIGH13VF,1PF,1OPEN; MEDIUM0VF,3PF,2OPEN. Nessun nuovo finding o stato di deroga.

17+5+3=25 → (17+1)+(5−1)+3=18+4+3=25. Unico delta +1VF/−1PF; OPEN e blocker invariati.

## 8. Unique status transition

| ID | PRE | POST | Changed |
|---|---|---|---|
| SEC-01 | VERIFIED_FIXED | VERIFIED_FIXED | NO |
| DATA-01 | VERIFIED_FIXED | VERIFIED_FIXED | NO |
| DATA-02 | VERIFIED_FIXED | VERIFIED_FIXED | NO |
| DATA-03 | VERIFIED_FIXED | VERIFIED_FIXED | NO |
| CALC-01 | VERIFIED_FIXED | VERIFIED_FIXED | NO |
| CALC-02 | VERIFIED_FIXED | VERIFIED_FIXED | NO |
| CALC-03 | VERIFIED_FIXED | VERIFIED_FIXED | NO |
| CALC-04 | VERIFIED_FIXED | VERIFIED_FIXED | NO |
| CALC-05 | VERIFIED_FIXED | VERIFIED_FIXED | NO |
| DOC-01 | VERIFIED_FIXED | VERIFIED_FIXED | NO |
| DOC-02 | VERIFIED_FIXED | VERIFIED_FIXED | NO |
| NORM-01 | VERIFIED_FIXED | VERIFIED_FIXED | NO |
| NORM-02 | PARTIALLY_FIXED | VERIFIED_FIXED | YES |
| NORM-03 | VERIFIED_FIXED | VERIFIED_FIXED | NO |
| NORM-04 | VERIFIED_FIXED | VERIFIED_FIXED | NO |
| ARCH-01 | VERIFIED_FIXED | VERIFIED_FIXED | NO |
| ARCH-02 | PARTIALLY_FIXED | PARTIALLY_FIXED | NO |
| FUNC-01 | VERIFIED_FIXED | VERIFIED_FIXED | NO |
| FUNC-02 | VERIFIED_FIXED | VERIFIED_FIXED | NO |
| FUNC-03 | OPEN | OPEN | NO |
| UX-01 | PARTIALLY_FIXED | PARTIALLY_FIXED | NO |
| UX-02 | PARTIALLY_FIXED | PARTIALLY_FIXED | NO |
| UX-03 | PARTIALLY_FIXED | PARTIALLY_FIXED | NO |
| ACCESS-01 | OPEN | OPEN | NO |
| ACCESS-02 | OPEN | OPEN | NO |

**STATUS_TRANSITIONS=1; UNEXPECTED_STATUS_CHANGES=0.** La colonna Stato precedente è riallineata alla fotografia PRE17/5/3, senza riapplicare le otto promozioni precedenti. Le righe degli altri24 finding mantengono status e evidence; soltanto i sette nomi della colonna Slice necessario sono aggregati nei tre nomi canonici del nuovo piano. Questa è pianificazione, non una modifica dell’acceptance né una promozione aggiuntiva.

## 9. Residual finding census

Derivato dalle righe POST non VERIFIED_FIXED, senza utilizzare una lista sostitutiva del census:

- PARTIALLY_FIXED4: ARCH-02, UX-01, UX-02, UX-03.
- OPEN3: FUNC-03, ACCESS-01, ACCESS-02.
- Totale7; coverage A2+B3+C2=7, senza sovrapposizioni o finding extra.

Rilette integralmente le acceptance originali in ASTRA_RSU_AUDIT_REPORT.md: FUNC-03 righe531–557; UX-01 589–615; UX-02 619–645; UX-03 647–673; ACCESS-01 677–703; ACCESS-02 705–731; ARCH-02 763–789. Nessuna acceptance ridotta al solo titolo.

## 10. Rationale del consolidamento

UX-01/ARCH-02 condividono la catena provenienza→read model→metadata e il confine fra informazioni descrittive, valori economici e permessi: due modelli separati creerebbero incoerenze. FUNC-03/UX-02/UX-03 richiedono interventi sullo stesso riepilogo Wizard, context bar, navigation e CTA. ACCESS-01/ACCESS-02 richiedono primitive comuni per dialog, input, errori e accordion, attraversando le superfici B.

La riduzione dei report/review non riduce acceptance o gate tecnici: test per area più una review sul boundary A e una review cumulativa B+C. L’obiettivo finale VF25/PF0/OPEN0 è un target futuro, non una baseline già raggiunta.

## 11. Tre slice residui

| Slice | Target | Acceptance essenziale | Review dedicata |
|---|---|---|---|
| PROVENANCE_METADATA_BOUNDARY | UX-01, ARCH-02 | Tutte15 risposte RSU riferite ai dati; manuale/calcolato/facoltativo/mancante; owner/autore/ruolo distinti, snapshot metadata non autorizzativi, anno/capienza derivati coerenti | YES, una sola |
| USER_SURFACE_CONSOLIDATION | FUNC-03, UX-02, UX-03 | Trasferimento coerente e verificabile; contesto mobile360px anche scroll/modali e nome completo; lessico RSU, prima azione chiara, desktop preservato | NO |
| ACCESSIBILITY_CONSOLIDATION | ACCESS-01, ACCESS-02 | Dialog focus/keyboard/background/return; nomi/unità/errori associati, trigger singolo e Tab senza duplicazioni | NO |

[ASTRA_RESIDUAL_REMEDIATION_ROADMAP.md](ASTRA_RESIDUAL_REMEDIATION_ROADMAP.md) contiene candidati, rischi, test strategy e ordine. Nessuno di questi slice viene avviato oggi.

## 12. Review policy

Ordine ufficiale: A implementation → PROVENANCE_METADATA_BOUNDARY_INDEPENDENT_REVIEW → B implementation → C implementation → ASTRA_FINAL_RESIDUAL_INDEPENDENT_REVIEW → ASTRA_FINAL_RECONCILIATION.

**IMPLEMENTATION_SLICES_REMAINING=3; INDEPENDENT_REVIEWS_REMAINING=2.** Review finale target FUNC-03/UX-02/UX-03/ACCESS-01/ACCESS-02, con protezione delle closure precedenti. Nessuna review della promozione odierna o dei singoli finding/refactor UI B/C; nessuna reconciliation intermedia di micro-modifiche. Stati formali aggiornabili solo sulla catena di evidence richiesta, non dalla sola implementation locale.

Nuovi gate solo per blocker, ambiguità normativa, regressione strutturale, test failure o nuovo security/auth concern. Debiti CAS/RGS/gate operativi esterni ai25 restano separati. Non diventano risolti per effetto di un numero di slice più piccolo.

## 13. Dependency analysis

Ispezione read-only di file e caller reali; i candidati sono superfici da verificare nella futura implementation, non modifiche già effettuate:

| Dipendenza | Evidenza corrente nel codice | Conseguenza per il piano |
|---|---|---|
| UX-01 ↔ ARCH-02 | Entry/source/provenance in src/domain/canonicalFundLedger.ts e src/logic/calculation/canonicalFundLedger.ts; projectFadReport in src/domain/documentProjection.ts, usato da src/presenters/reportPresenter.ts; metadata/role in src/domain/snapshot.ts e applyWizard2026Transfer.ts | Riutilizzare lineage canonico e distinguere metadata calcolati/descrittivi da authority. NORM-02 già deriva annualita022Considerate: non assumere che l’hardcoding originario sia ancora presente |
| Owner ↔ actor ↔ ruolo corrente | src/contexts/AppContext.tsx, userWorkflow.ts, authorizationPolicy.ts, SupabaseStateRepository.ts, SupabaseUserRepository.ts; UserManagementPage.tsx aggiorna profiles.role e un mirror user_app_state.role | Provare owner entity.user_id e snapshot-role poisoning; qualificare failure/mirror senza falsa autorizzazione. Nessuna vista di provenance può sostituire tali prove; nessuna live migration implicita |
| FUNC-03 ↔ UX-02/03 | Wizard2026PreviewPage passa solo state a Wizard2026SummaryPanel; CTA summary disabled con testo refactoring, mentre Step8RiepilogoPreview gestisce conferma e trasferimento | Un solo stato/contratto di azione, con business reasons e conferma. Proteggere validateWizard2026Transferable, correlation, money boundary, CLOSED e idempotenza |
| Contesto A → superficie B | AreaFondoContextBar usa ente/anno/stato e dati profilo; nome completo oggi affidato anche a truncate/title; Header/MainLayout/Sidebar e AreaFondoSidebar condividono navigazione | B presenta owner/actor dal boundary A e rende il contesto consultabile al tocco, senza inferire permessi da metadata |
| B ↔ C | Toggle riepilogo mobile e drawer/menu, transfer modal e metadata ReportsPage; shared Card contiene header rolebutton e button interno | B deve già adottare primitive semantiche/ID/associazioni compatibili; C completa focus e keyboard globale. Dipendenza forte gestita dentro3 slice, senza quarto slice |
| ACCESS-01 ↔ ACCESS-02 | FondiEntiPage inline overlay Nuovo ente; Modal.tsx senza contratto completo focus/dialog; Card.tsx, Input.tsx, MonetaryInput.tsx e label metadata ReportsPage | Primitive comuni, censire caller attivi e verificare journey completo; preservare feedback DATA-03 esistente |

Test futuri: targeted/unit/integration reali, responsive360×800/390×844/430px e desktop, keyboard/accessibility e full product offline. Regression8/8, oracle14/14, TypeScript e diff check; golden e oracle invariati. Per screen reader/evidence visiva dichiarare solo verifiche realmente eseguite. Nessun test futuro è dichiarato già PASS in questo report.

## 14. Modified files

Sono gli unici quattro artifact di repository autorizzati e modificati/creati:

1. ASTRA_25_FINDINGS_CURRENT_STATE_RECONCILIATION.md — authority corrente: NORM-02, summary/count/severity derivati, fotografia PRE e mapping dei sette finding ai tre slice; storico conservato.
2. MEMORIA_AI.md — nuova sintesi corrente in testa, history preesistente preservata; non è un secondo registry.
3. ASTRA_RESIDUAL_REMEDIATION_ROADMAP.md — nuovo piano operativo consolidato.
4. NORM_02_FORMAL_PROMOTION_AND_RESIDUAL_ROADMAP_REPORT.md — questo report.

SHA-256 PRE/POST degli artifact già verificabili senza riferimento circolare al report stesso:

| Artifact | PRE SHA-256 | POST SHA-256 |
|---|---|---|
| ASTRA_25_FINDINGS_CURRENT_STATE_RECONCILIATION.md | 5c9d3e0dd2a34e5d55ffeebc86cc29638dfd60a6d2040b6cbe5f6f2fb7c1ab4f | 6dbbb66439d5252173cf5694e4c35a7fe8073101f9040a98af3edd09c04a1855 |
| MEMORIA_AI.md | 8bff10a237831945db5f0e56f487b24cd6ba56fa3a7f8b41333cc9e41dbb3b46 | dca2ccbdd7e7ef122b94480bb9f1a5a98fd6788cd071dd20b67ef020f3c858f7 |
| ASTRA_RESIDUAL_REMEDIATION_ROADMAP.md | NEW | b5f9eafbea210826c5648fd726cc8c8ccf301c14617499c52d561b54434b6add |

Evidence storiche preservate:

| Artifact | SHA-256 PRE | POST |
|---|---|---|
| CCNL_RECOVERY_INSTRUCTION_IMPLEMENTATION_V2_REPORT.md | 9e2b9539d0514b35b89c8002bc70779eb9d93129421e9611e6ecb4291357945b | IDENTICO |
| CCNL_RECOVERY_INSTRUCTION_INDEPENDENT_REVIEW.md | 55810dd3bd1a65585edfabd75fe38c4b8f37f1dbfe19facfc38667352123f108 | IDENTICO |
| CCNL_RECOVERY_INSTRUCTION_INDEPENDENT_REVIEW_ADDENDUM.md | 982268f5deccfe9c1c22c750e43a1c55c38bbce143a47612976e237902bf5eb0 | IDENTICO |

## 15. Scope integrity e post check

Filesystem PRE/POST: **due file esistenti modificati e due nuovi documenti**; nessun file rimosso. Tutti gli altri1625 file censiti PRE conservano SHA-256, incluse implementation/review/addendum, baseline review/reconstruction/formal reconciliation, src, test, config, golden/oracle e DB/migrations. La porzione storica dell’authority dal marcatore4ottobre resta byte-identica; anche la memoria preesistente è preservata. Nessun nuovo registro parallelo o independent review.

Branch/HEAD/index e diff tracked binario invariati rispetto al PRE. Git status POST933 righe: l’unica nuova entry visibile è la roadmap; il report e la memoria ricadono in regole ignore già esistenti, mentre l’authority era già untracked. Per questo il controllo include filesystem/hashes e non soltanto git diff. Nessuna regola ignore/config modificata.

Eseguiti git diff --check (exit0, nessun errore whitespace), git diff --cached --name-status (vuoto), git status --short --untracked-files=all. Le segnalazioni LF→CRLF di Git riguardano il dirty preesistente e non sono errori whitespace; nessuna normalizzazione applicata. Inoltre check no-index delle modifiche documentali e dei due nuovi file: nessun errore whitespace; exit1 indica differenza di file, non failure di whitespace.

PRODUCTION_FILES_CHANGED=0; TEST_FILES_CHANGED=0; CONFIG_FILES_CHANGED=0. GOLDEN_CHANGED=NO; ORACLE_CHANGED=NO; DATABASE_CHANGED=NO; MIGRATIONS_CHANGED=NO. Nessuna connessione esterna, Supabase, staging/production, migration, deploy, commit, push o PR.

**PRODUCT_TESTS_NOT_RERUN_REASON=DOCUMENTATION_ONLY_PROMOTION_AND_ROADMAP.** Full product/regression/oracle/TypeScript non rieseguiti: nessun codice/test/config cambiato. DIFF_CHECK=PASS; SCOPE_INTEGRITY=PASS. MEMORIA_AI_UPDATE=PASS; ROADMAP_CREATED=PASS.

## 16. Next gate

**PROVENANCE_METADATA_BOUNDARY_IMPLEMENTATION**, target UX-01+ARCH-02. Task concluso con promozione NORM-02 e roadmap; nessuna implementation residua, nessuna nuova review avviata. Final target futuro: VF25/PF0/OPEN0/BLOCKERS0.
