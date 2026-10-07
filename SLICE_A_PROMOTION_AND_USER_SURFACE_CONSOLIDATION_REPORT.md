# Slice A promotion and USER_SURFACE_CONSOLIDATION

Data: 07.10.2026. Repository: dinopusceddu/entilocaliapp.

## 1. Executive result

**SLICE_A_FORMAL_PROMOTION = PASS. USER_SURFACE_CONSOLIDATION_IMPLEMENTATION = PASS.**

UX-01 e ARCH-02 sono formalmente VERIFIED_FIXED, dopo verifica dell'evidence persistita. Baseline ufficiale **VF20/PF2/OPEN3**, totale 25, blockers open 0. Le sole transizioni formali sono queste due. FUNC-03, UX-02 e UX-03 sono **CANDIDATE_VERIFIED_FIXED** per implementation; il registro mantiene rispettivamente OPEN, PARTIALLY_FIXED e PARTIALLY_FIXED.

Il trasferimento usa un unico stato operativo e una sola conferma condivisa. Il contesto ente/anno/stato rimane disponibile su mobile durante scroll e navigazione; il nome completo è consultabile al tocco. Le modifiche riguardano presentazione e orchestrazione UI, senza modificare formule economiche o policy autorizzative.

Targeted **44/44**, prodotto **2095/2095 in 152 file**, regression **8/8**, oracle **14/14**, TypeScript e diff check PASS. Browser locale reale: quattro viewport PASS. Nessuna independent review B eseguita; nessuna implementation Slice C avviata.

## 2. Preflight

- Branch: `ux/toolbox-area-fondo-prototype`.
- HEAD: `d3170f959b5815c514dbf3d6e5f93366a5f14c67`.
- Working tree intenzionalmente dirty prima del task; stato completo conservato in [pre.json](user_surface_consolidation_evidence/pre.json).
- Index PRE e POST vuoto.

Eseguiti branch, rev-parse, status completo e diff cached prima delle modifiche. Nessuna operazione Git di ripulitura, consolidamento o pubblicazione. Per le interrogazioni successive `core.fsmonitor=false` evita gli errori IPC dell'ambiente. Lo scope deriva dal confronto SHA-256 PRE/POST di 1653 file preesistenti, non dal diff cumulativo contro HEAD.

## 3. Slice A evidence gate

Letti direttamente implementation e independent review:

- [PROVENANCE_METADATA_BOUNDARY_IMPLEMENTATION_REPORT.md](PROVENANCE_METADATA_BOUNDARY_IMPLEMENTATION_REPORT.md): PASS e candidate statuses.
- [PROVENANCE_METADATA_BOUNDARY_INDEPENDENT_REVIEW.md](PROVENANCE_METADATA_BOUNDARY_INDEPENDENT_REVIEW.md): PASS, UX_01_RECOMMENDED_STATUS e ARCH_02_RECOMMENDED_STATUS VERIFIED_FIXED, BLOCKERS/MAJOR/MINOR = 0.

Verificati 15/15 RSU, read model non autoritativo, assenza di seconda authority economica, zero caller autorizzativi dello snapshot role, poisoning e profile refresh, stale metadata senza effetti economici/autorizzativi/readiness, save/reload, CLOSED e transfer. Gate storici: 2074/2074, regression8/8, oracle14/14, TypeScript/diff PASS. Hash della review e controlli esatti in `pre.json`; review ed implementation rimangono immutati.

## 4. UX-01 promotion

PARTIALLY_FIXED → VERIFIED_FIXED. Motivazione: spiegazione RSU 15/15, fonte/input/competenza/supporto e stati espliciti; provenance read model senza ricalcolo economico; independent review favorevole senza finding residui. Registry corrente aggiornato con riferimenti ai due artifact.

## 5. ARCH-02 promotion

PARTIALLY_FIXED → VERIFIED_FIXED. Motivazione: owner `entity.user_id`, actor distinto, ruolo corrente da profilo/policy esistente; ruolo snapshot non autorizzativo, metadata derivati non autoritativi; poisoning, stale metadata, CLOSED e save/reload verificati indipendentemente.

## 6. Census PRE

Census programmatico della tabella corrente: 25 ID univoci, VF18/PF4/OPEN3, blockers0, duplicati/missing/extra0. Fotografia completa in `pre.json`.

## 7. Census POST promotion

La colonna POST della tabella reale è letta nuovamente da `final-audit.cjs`. Non sono conteggiate le tabelle nella sezione storica. `promotion.json`, `post.json` e `scope.json` documentano 25 ID univoci, esattamente due transizioni autorizzate e nessun cambiamento ulteriore durante B.

| Finding | PRE | POST | Changed |
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
| NORM-02 | VERIFIED_FIXED | VERIFIED_FIXED | NO |
| NORM-03 | VERIFIED_FIXED | VERIFIED_FIXED | NO |
| NORM-04 | VERIFIED_FIXED | VERIFIED_FIXED | NO |
| ARCH-01 | VERIFIED_FIXED | VERIFIED_FIXED | NO |
| ARCH-02 | PARTIALLY_FIXED | VERIFIED_FIXED | YES |
| FUNC-01 | VERIFIED_FIXED | VERIFIED_FIXED | NO |
| FUNC-02 | VERIFIED_FIXED | VERIFIED_FIXED | NO |
| FUNC-03 | OPEN | OPEN | NO |
| UX-01 | PARTIALLY_FIXED | VERIFIED_FIXED | YES |
| UX-02 | PARTIALLY_FIXED | PARTIALLY_FIXED | NO |
| UX-03 | PARTIALLY_FIXED | PARTIALLY_FIXED | NO |
| ACCESS-01 | OPEN | OPEN | NO |
| ACCESS-02 | OPEN | OPEN | NO |

VF18+2=20; PF4−2=2; OPEN3 invariato; 20+2+3=25. Blocker findings tutti VERIFIED_FIXED, quindi blockers open0. Summary corrente concorda con la tabella. La sezione `Contesto storico conservato` è stata mantenuta durante l'edit dell'authority; i report storici separati non sono cambiati.

## 8. MEMORIA_AI update

PASS. Aggiunta sezione sintetica di chiusura Slice A: implementation/review PASS, entrambe VF, baseline20/2/3 e prossimo lavoro B. Nessuna duplicazione del report e nessuna promozione dei finding B nella memoria.

## 9. Slice B discovery

Riletti gli acceptance originali FUNC-03, UX-02 e UX-03 in `ASTRA_RSU_AUDIT_REPORT.md`, oltre alla roadmap e all'authority corrente. La matrice contestuale della review Slice A contiene un riferimento editoriale a FUNC-03 non corrispondente al finding trasferimento: non propagato. L'acceptance adottata è quella dell'audit originale.

Discovery completata prima degli edit di prodotto e persistita in [current-state-map.json](user_surface_consolidation_evidence/current-state-map.json). Censiti PreviewPage, SummaryPanel, Layout, Step8, modal, apply/validator/preview, context bar/sidebar, Header/MainLayout, registry e Reports. La contraddizione era reale: footer Summary disabilitato con testo di sviluppo, Step8 con azione operativa e handler separato. L'handler ignorava inoltre il risultato strutturato `saveState.success` e richiedeva protezione contro risposte tardive dopo cambio contesto.

## 10. USER_SURFACE_CURRENT_STATE_MAP

| Area | PRE | POST / authority |
|---|---|---|
| Disponibilità transfer | Summary hardcoded; Step8 validator locale | Unico `projectTransferAction`, consumando il validator esistente |
| Conferma/esecuzione | Handler e modal Step8 | Unico provider nella PreviewPage e unica modal |
| Valori economici | Motore transfer/preview esistenti | Stesse funzioni, nessuna nuova aritmetica |
| Contesto | Nome troncato/title; sticky impedito da overflow ancestor | Disclosure button reale, sticky utilizzabile, anno/stato correnti |
| Owner/Admin | Etichetta creatore ambigua | Owner da entity.user_id; isGlobalAdmin sul profilo corrente |
| Navigazione | Scope app e Fondo, trigger concorrenti mobile | Scope esistenti, un menu Fondo mobile e ritorno Toolbox |
| Documenti | Due label tecniche | Solo presentazione amministrativa, policy/writer invariati |

Sidebar globale, moduleRegistry, apply, validator, authority economiche/autorizzative e repository non modificati. Nessuna terza navigazione o authority aggiunta.

## 11. Transfer action authority

`validateWizard2026Transferable` rimane l'authority di validazione normativa e monetaria. Il nuovo selector è una projection operativa: aggiunge contesto selezionato, anno, CLOSED, invalid draft, in-flight e receipt già acquisita. `WizardTransferProvider` costruisce una sola istanza condivisa per Summary e Step8 nell'applicazione.

Gli adapter standalone usano lo stesso provider quando manca un parent, per compatibilità dei componenti isolati; non introducono logiche alternative. Preview/importi provengono da `buildWizard2026TransferPreview`; applicazione da `applyWizard2026Transfer`, entrambi invariati.

## 12. Transfer action contract

Tipizzato in `transferAction.ts`: AVAILABLE, BLOCKED, INVALID, UNDETERMINED, ALREADY_TRANSFERRED, CLOSED, IN_PROGRESS; enabled, reason, primaryAction, confirmationRequired, entityName e year. Il riepilogo economico è la preview già esistente, senza duplicare importi nel selector.

Entrambi gli ingressi aprono la stessa modal con lo stesso oggetto action e validation. Doppio click bloccato sincronicamente; save strutturato negativo non produce dispatch, navigation o success marker. Retry consentito dopo failure. Utente/ente/anno/contextEpoch/stato e firma dei dati sono verificati rispetto alla conferma; risposta tardiva non contamina un altro Fondo. Unmount impedisce dispatch tardivi. La receipt esistente è solo indicazione operativa e non fonte di permessi o importi; reload e secondo trasferimento identico non duplicano l'acquisizione.

## 13. FUNC-03 acceptance mapping

| Scenario | Evidence | Esito |
|---|---|---|
| AVAILABLE da Summary e Step8 | Due test parametrizzati sulla PreviewPage reale, stessa action/reason/modal/save | PASS |
| Invalid monetary / blocked | Validator reale, entrambi disabled, repository non chiamato | PASS |
| Contesto mancante / anno diverso | UNDETERMINED / BLOCKED e ragione condivisa | PASS |
| CLOSED | Entrambi read-only, nessuna modal/mutation | PASS |
| Save failure + retry | Nessun dispatch iniziale, seconda conferma salva correttamente | PASS |
| Doppio click / secondo transfer / reload | Una chiamata, stato comune IN_PROGRESS/ALREADY_TRANSFERRED | PASS |
| Cambio ente / conferma stale | Nessun dispatch nel contesto nuovo | PASS |

I vecchi test positivi di trasferimento, correlation e CLOSED rimangono verdi. Nessun cambiamento alla semantica economica.

## 14. UX-02 acceptance mapping

Nome lungo, anno e stato nelle superfici reali MainLayout/context bar; nome completo consultabile con button e testo espanso, senza cambiare Fondo e senza dipendere dal title. Nel drawer Fondo il contesto è ripetuto perché l'overlay copre la barra. La conferma transfer espone ente e anno. Stato CLOSED deriva dal workflow corrente; anno dalla selezione corrente, non dalle receipt.

Admin su ente altrui: indicazione esplicita e proprietario dal dato entity/profilo disponibile; nessuna inferenza dal ruolo snapshot. Test DOM con snapshot.role ADMIN e currentUser USER mantengono il boundary. Test Admin foreign-owner usa il profilo corrente reale del contesto testato.

## 15. UX-03 acceptance mapping

La prima azione transfer è prima del riepilogo lungo. Su mobile al passaggio8 esiste una sola CTA visibile; sugli altri passaggi rimane l'ingresso del Summary. Desktop mantiene due ingressi coerenti, quello Summary secondario e quello Step8 primario. La sezione riepilogo è collassabile mobile, la CTA non dipende dalla sua apertura. Eliminato il salvataggio globale concorrente nella sola pagina Wizard, che possiede già il proprio flusso bozza e transfer.

Menu mobile Fondo e navigazione app sono distinti; il logo è un button di ritorno Toolbox. Stepper desktop dispone tutti gli otto passaggi su due righe senza clipping. Nessun redesign delle altre pagine o dei writer.

## 16. User terminology census

Scansione dei componenti raggiungibili nello scope e controllo del testo DOM renderizzato. Simboli/import/commenti non renderizzati conservati.

| Termine | Superficie | User visible PRE? | Decisione / replacement |
|---|---|---|---|
| refactoring / non ancora attivo | Summary footer | YES | REPLACE: azione e ragione operativa condivise |
| Mapping Preview | Summary dettagli | YES | REPLACE: Destinazione dei dati |
| payload / payload atomico | Modal e spiegazioni preview | YES | REPLACE: dati del personale / descrizione dell'acquisizione |
| legacy | Spiegazioni preview | Possibile nei dati | REPLACE alla display boundary: storico |
| READY / enum interni | Summary, Step8, modal | Possibile come label | REPLACE: Pronto, Mancante, Da confermare, Controllo; enum KEEP nel codice |
| DocumentFactory | Reports import/istanza | NO | KEEP interno; mai renderizzato |
| opinionOutcome | Reports label | YES | REPLACE: esito istruttorio amministrativo |
| CanonicalFundLedger | Reports unavailable text | YES | REPLACE: Dati del Fondo non disponibili |
| raw field paths / IDs check | Modal e dettaglio Step8 | YES | REPLACE: etichetta e spiegazione della preview |
| resolver, internal, debug | Caller/simboli interni nello scope | Nessuna label individuata | KEEP codice non renderizzato |

`presentTransferText` opera soltanto sui testi; non rinomina gli ID o cambia il dominio. Test della pagina e modal aperta: nessun termine tecnico della scansione rimasto nel testo renderizzato della fixture. TECHNICAL_USER_TEXT_REMAINING = 0 nello scope verificato; non è un audit globale di ogni pagina del prodotto.

## 17. Mobile context design

Barra compatta con anno/stato non restringibili, nome troncabile con disclosure touch. Ancestor `overflow-x-clip` mantiene lo sticky durante scroll. Header/title meno ingombranti, descrizione estesa non ripetuta mobile; niente context metadata derivati persistiti. A360 la CTA utile termina a y577 nella viewport800, a390 y577 nella viewport844, a430 y561. Nessuno scroll richiesto per raggiungerla.

## 18. Navigation hierarchy

Tre concetti presentati attraverso i due sistemi esistenti: Toolbox/app, sezioni Fondo corrente e azione contextual transfer. Non aggiunta una terza navigazione. Drawer nominato “Sezioni del Fondo corrente”, ritorno Toolbox esplicito. Registry/route IDs preservati. Reports resta raggiungibile attraverso il menu originale.

## 19. Accessibility-ready choices

Button per azioni, disclosure con aria-expanded/controls, reason associata con useId/aria-describedby, modal nominata e descritta, close nominato. Test nessun button annidato nei componenti interessati. Focus trap globale, label sweep, keyboard journey completo e dialog nuovo ente rimangono Slice C. ACCESS-01 e ACCESS-02 restano OPEN.

## 20. Protected Slice A behavior

Provenance panel, 15/15 RSU read model, owner/actor/current-role, snapshot role non-authority e stale metadata non modificati. Test Slice A e profile/authorization/correlation fanno parte della suite completa, tutta verde. Context bar riusa `isGlobalAdmin(currentUser)` e `entity.user_id`; non usa provenance per concedere permessi.

## 21. Protected prior findings

Tutti i 20 VERIFIED_FIXED sono preservati dalla suite completa, regression e oracle. NORM-02 resolver/model/transfer formulas invariati: current/recovery, partial/residual, competence year, Fondo/EQ/performance, duplicate e UNINSTRUCTED restano quelli verificati. DATA-03 validator/save boundary invariati e invalid input non trasferibile. FUNC-01 CLOSED guards preservati e verificati in CTA e save. PNRR/DL25/Art60/Art23/ledger/distribution e document readiness non modificati.

## 22. Files modified

13 production files, 6 test files, runtime config0. Elenco completo e hash in [scope.json](user_surface_consolidation_evidence/scope.json).

| Production path | Motivo |
|---|---|
| src/components/areaFondo/AreaFondoContextBar.tsx | Disclosure nome, stato/anno compatti, owner |
| src/components/areaFondo/AreaFondoSidebar.tsx | Contesto nel drawer e nav scope |
| src/components/layout/Header.tsx | Ritorno Toolbox semantico, header compatto, menu unico |
| src/components/layout/MainLayout.tsx | Sticky ancestor, densità mobile, no Save concorrente Wizard |
| src/features/wizard2026/components/Wizard2026Layout.tsx | Summary mobile e stepper non sovrapposto |
| src/features/wizard2026/components/Wizard2026PreviewPage.tsx | Unico transfer provider |
| src/features/wizard2026/components/Wizard2026Stepper.tsx | Tutti8 passaggi desktop, disclosure nominato |
| src/features/wizard2026/components/Wizard2026SummaryPanel.tsx | Shared action/preview, label amministrative |
| src/features/wizard2026/steps/Step8RiepilogoPreview.tsx | Shared action in apertura, elimina handler duplicato |
| src/features/wizard2026/transfer/Wizard2026TransferModal.tsx | Conferma shared/context e label meaningful |
| src/features/wizard2026/transfer/transferAction.ts (new) | Projection operativa tipizzata |
| src/features/wizard2026/transfer/WizardTransferAction.tsx (new) | Controller condiviso e guards UI |
| src/pages/ReportsPage.tsx | Solo2 label; nessuna policy/writer modification |

Documentazione corrente modificata soltanto per A: authority e MEMORIA_AI. Nuovi artifact: questo report e evidence pack. Harness `offline.config.mjs` è configurazione locale di evidence, non runtime/product config. Nessun file storico separato o artifact precedente modificato.

## 23. Tests added/modified

Nuovi: `userSurface.integration.test.tsx` (14), `userSurfaceContext.test.tsx` (7). Reali PreviewPage/Summary/Step8/modal/layout/context/sidebar con mock alle porte AppContext/repository/profilo e draft hook; validator, preview e apply reali.

Aggiornati quattro test esistenti: wizardTransfer, Step8RiepilogoPreview, Wizard2026SummaryPanel, Wizard2026PreviewPage. Input economici e aspettative economiche invariati. Mock save positivo adeguato al risultato strutturato reale; aspettative obsolete inactive/refactoring e transfer senza ente aggiornate alla nuova availability. La prima full run ha rilevato un'unica aspettativa obsolete su PreviewPage senza ente; corretta in modo mirato, poi targeted e full rieseguite integralmente PASS. Nessun nuovo skip.

## 24. Targeted results

**44/44 PASS in6 file**, zero failure, `targeted.json` e exit0. 21 nuovi test; le suite aggiornate rimangono nello stesso gate. Risultati finali distinguibili dagli output iniziali di sviluppo conservati nell'evidence.

## 25. Responsive results

DOM component test alle quattro larghezze più browser reale:

| Viewport | CTA primary y/height | CTA visibili | Context dopo scroll y | Overflow | Esito |
|---|---|---|---|---|---|
| 360×800 | 519 / 58 | 1 | 78.5 | NO | PASS |
| 390×844 | 519 / 58 | 1 | 78.5 | NO | PASS |
| 430×844 | 503 / 58 | 1 | 78.5 | NO | PASS |
| 1280×900 | 601 / 38 | 2, primary+secondary | 81.5 | NO | PASS |

Nome completo e stato consultabili al tocco, contesto nella conferma, nessun page error. Desktop navigation/stepper/context/modal preservati. RESPONSIVE_TESTS = 4/4 PASS.

## 26. Visual evidence status

**VISUAL_BROWSER_EVIDENCE = PASS.** Chrome installato localmente; bundle/CSS costruiti con binari locali, fixture file:// con componenti reali e porte mock, nessun servizio live. `visual.cjs`, `responsive-browser.json`, viewport/entity/scroll/modal PNG per360/390/430/1280. Immagini360 e1280 ispezionate; nessuna screenshot inventata.

Limite: fixture locale controllata, non sessione autenticata su ambiente remoto; non costituisce un audit screen reader/focus completo. La final review B+C completerà il controllo indipendente. CSP connect-src none, proxy non raggiungibile, DNS bloccato e route abort HTTP; blockedRequests0. Chrome e Playwright già presenti, nessun download.

## 27. Full product

**2095/2095 PASS in152 file**, zero failure, success true, exit0. PRE storico2074 in150file, +21test/+2file. `product.json` e output finale persistiti. Intera suite normale `src/**` inclusa; escluso soltanto `wave3HardeningEvidence.test.ts`, generatore storico già escluso dalla policy consolidata. Nessuna nuova esclusione product.

Test eseguiti con Vitest locale, offline guard, envFilefalse, endpoint dummy example.invalid e remote draftsfalse. Errori iniziali di realpath/permessi nel sandbox hanno richiesto esecuzione locale approvata; nessun bypass di validazione o contatto remoto introdotto.

## 28. Regression

**8/8 PASS**, `scripts/run_regression_tests.ts` via runtime locale; exit0 e output `regression.txt`. Tutte le fixture consolidate e expected preservati.

## 29. Oracle

**14/14 PASS**, `scripts/run_wave2_oracle.ts` locale; exit0 e output `oracle.txt`. Oracle e golden immutati.

## 30. TypeScript

**PASS**, compilatore locale `node node_modules/typescript/bin/tsc --noEmit`, equivalente al comando npx senza accesso registry. Output finale ed exit0 persistiti. Errori di typing/import nei nuovi test emersi durante sviluppo corretti prima della suite finale.

## 31. Diff check

**PASS**, `git -c core.fsmonitor=false diff --check`, exit0. Index finale vuoto; branch/HEAD invariati. Eventuali warning EOL preesistenti non sono whitespace errors. Report/evidence non staged.

## 32. Golden/oracle integrity

SHA-256 PRE/POST: golden NO change, oracle NO change, regression fixtures NO change, document/economic historical evidence NO change. Nessun aggiornamento del riferimento dopo test failure.

## 33. Scope integrity

PASS. 1653 file preesistenti controllati, zero rimossi, nessun delta fuori dai file UI/test/documentazione consentiti. Production13, tests6, runtime config0. Formule canoniche e normative, authorization, repositories, DB/Supabase/migrations/package/lock/env/CI invariati. Tutti gli artifact di implementation/review storici separati mantengono hash PRE.

Strict offline: PRODUCT_NETWORK_ATTEMPTS = 0; TOOLING_NETWORK_ATTEMPTS = 22, tutte chiamate Vite DNS localhost intercettate dall'offline guard prima della rete; REAL_NETWORK_CONNECTION_ESTABLISHED = NO nei processi del task. Nessun tentativo remoto di prodotto o browser HTTP osservato; non si attribuisce questo risultato al traffico generale del sistema operativo.

COMMIT/PUSH/PR/DEPLOY = NO. Nessun DB, migration, staging o production. Nessuna review indipendente creata.

## 34. Candidate status B

- FUNC_03_IMPLEMENTATION_STATUS = CANDIDATE_VERIFIED_FIXED.
- UX_02_IMPLEMENTATION_STATUS = CANDIDATE_VERIFIED_FIXED.
- UX_03_IMPLEMENTATION_STATUS = CANDIDATE_VERIFIED_FIXED.

Acceptance implementation PASS, da validare indipendentemente insieme a Slice C. Registro ufficiale **VF20/PF2/OPEN3**: nessuna promozione B; ACCESS-01/02 restano OPEN.

## 35. Next gate

**ACCESSIBILITY_CONSOLIDATION_IMPLEMENTATION**. Nessuna independent review intermedia B. Dopo C: una sola ASTRA_FINAL_RESIDUAL_INDEPENDENT_REVIEW per FUNC-03/UX-02/UX-03/ACCESS-01/ACCESS-02. Questo task termina senza avviare C.
