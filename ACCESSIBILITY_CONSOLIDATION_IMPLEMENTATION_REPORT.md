# ACCESSIBILITY_CONSOLIDATION — implementation report

Data: 07.10.2026. Target: ACCESS-01 + ACCESS-02. Implementation locale; nessuna independent review in questo task.

## 1. Executive result

**PASS.** Dialog Nuovo ente confinato e nominato; primitive condivise migrate; controlli del perimetro nominati, unità ed errori associati; accordion con un solo trigger. Targeted **138/138 PASS**, product **2120/2120 PASS** (154 file), regression 8/8, oracle 14/14, TypeScript e diff PASS. ACCESS-01/02 sono soltanto CANDIDATE_VERIFIED_FIXED.

## 2. Baseline

Registro corrente letto direttamente: ASTRA_25_FINDINGS_CURRENT_STATE_RECONCILIATION.md. Census 25 ID univoci: VF20/PF2/OPEN3, BLOCKERS_OPEN 0. Registry e MEMORIA_AI restano byte-identici. FUNC-03/UX-02/UX-03 restano candidati B; nessuna promozione formale.

## 3. Preflight

Branch: ux/toolbox-area-fondo-prototype. HEAD: d3170f959b5815c514dbf3d6e5f93366a5f14c67. Working tree dirty intenzionale, index vuoto. Branch, HEAD, git status --short --untracked-files=all e git diff --cached --name-status persistiti in pre.json. SHA-256 PRE su 1717 file: misura del delta rispetto allo stato iniziale, distinta dal diff complessivo contro HEAD. Discovery eseguita prima delle modifiche. Nessun reset/restore/stash/clean/pull/merge/rebase/add/commit.

Letti direttamente registry, ASTRA_RSU_AUDIT_REPORT.md (acceptance ACCESS-01/02), roadmap, report Slice B, implementation e independent review Slice A e memoria canonica.

## 4. Original ACCESS-01 acceptance

Audit: «Tab/ShiftTab restano nel dialog; sfondo non interagibile; chiusura ripristina il focus». Il caso obbligatorio è Catalogo → Nuovo ente. Non basta aggiungere aria-modal a un overlay.

## 5. Original ACCESS-02 acceptance

Audit: «Ogni campo ha nome univoco e unità; errori annunciabili; ordine Tab senza duplicazioni». Osservazioni originarie: metadata report senza nome, campi numerici Wizard non associati e trigger annidati nei collapsible. Perimetro di questo slice: Catalogo, Wizard, Report, primitive riusate dalle schede Fondo, contesto/drawer/trasferimento B. Nessuna dichiarazione WCAG globale.

## 6. Accessibility current state map

Discovery PRE: current-state-map.json e control-census-pre.json (inventario AST, non sostituisce il DOM). Riutilizzo di Modal/Input/MonetaryInput/Card già esistenti; nessuna seconda libreria UI. FundingItem e NormativaPopover verificati anche come caller economici condivisi. ProvenancePanel mantiene details nativo già corretto.

| Surface | PRE Issue | Remediation | Keyboard | Accessible name | Error semantics | Verdict |
|---|---|---|---|---|---|---|
| Nuovo ente | Overlay ad hoc; focus fuori dal dialog | ModalSurface, nome e campi associati | PASS | PASS | Vincoli HTML esistenti | PASS |
| shared Modal | Focus/Escape/return assenti; ID titolo fisso | Native dialog + stack + inert + useId | PASS | PASS | Caller invariati | PASS |
| Report metadata | 7 textbox + 3 select senza for/id | 10 associazioni univoche; OPEN/CLOSED | PASS | PASS | Nessuna nuova policy di validazione | PASS |
| MonetaryInput | Unità non associata; ruolo spinbutton senza incremento a frecce | Textbox decimale, unità + errori concatenati | PASS | PASS | aria-invalid/describedby/alert | PASS |
| shared Input / FundingItem | Descrizioni sovrascrivibili; JSX label con fallback ID tecnico | Merge hint; label semantica; unità; ID istanza | PASS | PASS | Parser e policy immutati | PASS |
| Card / accordion | Div role button con button annidato | Unico button nativo, region hidden e ID univoci | PASS | PASS | Non pertinente | PASS |
| Context disclosure | Target/expanded incompleti | useId, hidden region, Enter/Space | PASS | PASS | Non pertinente | PASS |
| Fondo drawer | Overlay ad hoc, Escape/focus non condivisi | ModalSurface e expanded/target nel trigger | PASS | PASS | Non pertinente | PASS |
| Transfer modal | Overlay ad hoc e ID statici | ModalSurface, workflow locked in-flight | PASS | PASS | Errore di salvataggio role alert | PASS |

Callers: Modal già alimenta Header, CsvImportModal, RequestDataLetterModal e Ccnl2024SettingsForm; ModalSurface alimenta ora quattro dialog Catalogo, aiuti/esito import Wizard, lettera Wizard, drawer Fondo e conferma transfer. Card è condivisa da Fondo, distribuzione, checklist e simulatore. Test di primitive + pagine reali + browser locali coprono il wiring.

## 7. Shared primitives strategy

ModalSurface è comportamento comune dentro il modulo Modal esistente: portal con dialog nativo, stack delle superfici aperte, backdrop del caller, inert/aria-hidden ripristinati e focus dinamico. I caller conservano layout e workflow. Input e MonetaryInput concatenano descrizioni; FundingItem associa anche label JSX, fonte e percentuale. Card usa button nativo e region hidden.

## 8. New entity dialog

Ruolo dialog, aria-modal true, accessible name Nuovo Ente. Form e createEntity/switchYear restano invariati. Denominazione e annualità hanno label for/id. Nomi anche per chiusura e ricerca. Gli altri tre dialog del Catalogo usano la stessa primitive.

## 9. Initial focus

Policy: data-autofocus → primo input utile/textarea/select → primo controllo → dialog tabindex -1 se vuoto. Nuovo ente porta il focus alla denominazione. Elementi disabilitati, hidden, inert, display none e visibility hidden esclusi. Test reale e Chrome confermano.

## 10. Focus trap

Tab/Shift+Tab ricalcolano i focusable del dialog a ogni evento, senza endpoint congelati. Wrap entrambi i versi; empty/single/dynamic-control test; focusin esterno ricondotto nella superficie superiore. I soli event handler appartengono alla primitive, non a ciascun caller.

## 11. Escape

Escape consuma l'evento e chiude la superficie superiore. closeDisabled esplicito per transfer in-flight. Evento cancel nativo allineato. Nessuna azione imprevista sul background.

## 12. Background inertness

Dialog nativo in top layer; siblings body resi inert e aria-hidden. Stato originario conservato/ripristinato con stack comune, incluso smontaggio contemporaneo parent/child. Overflow body ripristinato. Fallback test DOM impedisce anche click/focus esterno. Browser prova ripetuti Tab, ShiftTab e tentativo di azione sul trigger sotto il dialog.

## 13. Focus return

Trigger reale acquisito all'apertura. Close, Escape, cancel e successful submit Catalogo restituiscono focus al trigger nei test e in Chrome, senza BODY. Per trigger rimosso/disabilitato dalla navigazione riuscita, fallback alla superficie precedente o a un controllo corrente utilizzabile; nessuna modifica del workflow economico.

## 14. Transfer modal interaction

Converge su ModalSurface; ID univoci per titolo, contesto e conferma. Close/Escape bloccati durante richiesta. Il miglioramento non modifica provider, projectTransferAction, validator, preview engine o apply. Retry, secondo transfer, doppio click, correlation, stale confirmation e CLOSED coperti dai 14 test B. Errore di save ha role alert.

## 15. Label census

DOM dei sette step reali in quattro scenari: ordinario, righe dinamiche, manuale, post-2026; recovery editor multiplo e dati amministrativi duplicati; report OPEN/CLOSED; Catalogo; lettera Wizard. Campi hidden esclusi correttamente. Label for/id o wrapping label, aria-label contestuale per righe tabellari, fieldset/legend per istruttorie per competenza. Nessun fallback a nome tecnico per descrizioni JSX in FundingItem. ACTIVE_FIELDS_WITHOUT_ACCESSIBLE_NAME = 0 nel perimetro verificato.

## 16. Report metadata

Numero reale: **10**, sette textbox e tre select; tutte le label associate a ID useId. Dieci accessible name distinti. CLOSED rende i controlli disabilitati e non scrive. Browser compila Numero Determina e verifica dispatch della stessa metadata. Nessuna nuova policy date/formato/obbligatorietà: gli errori di boundary monetario sono verificati nel percorso monetario, non inventati nei metadata opzionali.

## 17. Numeric/monetary input semantics

MonetaryInput è textbox decimale: non dichiara spinbutton senza implementare incremento a frecce. Nome amministrativo associato e descrizione euro/massimo due decimali. Numeri di dipendenti, mensilità, anni e percentuali conservano controlli nativi e unità nelle label/descrizioni. FundingItem distingue percentuale da money mantenendo name di dominio e policy esistente.

## 18. Error association

aria-invalid true per draft invalido o issue esterna, false dopo correzione. aria-describedby concatena hint, unità e ID errore; messaggio role alert. 1e308, malformed, negativi e precisione invalida restano locali: callback non chiamata. Zero valido preservato. Test DATA-03 e CCNL reali; browser invalid→100 associa e poi rimuove l'errore.

## 19. Unique ID census

useId per Input, MonetaryInput, Card, titolo Modal, context/disclosure, Report, FundingItem, lettera e recovery editor. Recovery include indice della riga anche con istruttorie duplicate invalide: nessun cambio ai semantic ID economici. Più istanze testate; DOM browser e test: DUPLICATE_ACTIVE_IDS = 0.

## 20. Accordion/Card semantics

Un unico button nativo nominato dal titolo, aria-expanded e aria-controls, regione collegata al trigger. Contenuto hidden quando chiuso; controlli nascosti fuori dal Tab. Footer/azioni figli restano nella regione, fuori dal trigger. Enter e Space verificati in Chrome; nessun div onClick sostitutivo del button.

## 21. Nested interactive census

Query DOM: button button, button a, a button, summary button, role-button con input/button. Zero violazioni nelle superfici testate. FundingItem sposta il popover normativo fuori dalla label del campo: non introduce un controllo concorrente nella label. Il suo trigger mantiene nome, descrizione della voce, expanded/target ed Escape.

## 22. Keyboard contract

Chrome installato, quattro viewport: Tab/ShiftTab confinement; Enter/Space per trigger Nuovo ente, context disclosure e Card; Escape/return per dialog, drawer e transfer. Component test aggiungono lock, nesting, zero/single/dynamic focusable. Native input/select/button conservano semantica tastiera.

## 23. Tab order

Ordine DOM nativo, nessun tabindex positivo. Un solo trigger per Card; hidden/collapsed fuori dal Tab; drawer e dialog confinano il focus. TAB_ORDER_DUPLICATIONS = 0 nel perimetro. Controlli separati che svolgono azioni distinte restano accessibili, non eliminati per ridurre artificialmente il numero.

## 24. Slice B context protection

Nome completo consultabile con button, aria-expanded e target univoco hidden; Enter/Space reali. Ente/anno/stato persistono dopo scroll; stato a circa 78–82 px nelle quattro viewport. Admin su ente altrui conserva source owner corrente. Nessun uso di snapshot.role per presentation autorizzativa.

## 25. Slice B transfer protection

SAME_TRANSFER_STATE_ACROSS_ENTRY_POINTS PASS. Entry Summary/Step8 consumano ancora un solo controller. Nomi, motivazione, disabled, retry/idempotenza e summary economico esistenti preservati. Non introdotta una seconda action authority. Nessuna modifica resolver NORM-02, split Fondo/EQ/performance o boundary monetary.

## 26. Slice B navigation protection

Fondo drawer nominato, trigger expanded/controls, Escape e ritorno al menu. Costituzione mantiene button nativo con expanded/target; navigazione Fondo e Toolbox distinta. MainLayout passa soltanto ID e stato drawer. Nessun redesign navigation.

## 27. CLOSED protection

Report CLOSED, recovery readOnly, transfer CLOSED e Fondo Art23/rollback disabilitati verificati. Consultazione consentita; zero chiamate save/mutation vietate. Focus iniziale evita controlli disabilitati; provenance consultabile senza rewrite.

## 28. Provenance protection

Targeted Slice A: 23 domain provenance, 6 integration boundary, 4 UI, 27 authorization. Copertura originale 15/15 RSU preservata; owner entity.user_id, actor e ruolo corrente distinti; snapshot poisoning/stale metadata invariati. Nessuna modifica production a dominio, authorization, AppContext o persistence.

## 29. Browser keyboard evidence

**PASS**, Chrome installato; esbuild/Tailwind locali, file fixture con componenti reali e porte repository/profilo simulate. browser.cjs riproducibile, browser-keyboard.json con risultati/census e screenshot realmente acquisiti. Journey A Catalogo completo (quattro modalità di chiusura); B context/drawer/Wizard/transfer; C Report metadata keyboard edit/save e validazione monetaria reale del Wizard. Conferma economica/retry testati nelle integration B, non attribuiti a un backend browser live.

Nessun vero screen reader eseguito: non si dichiara NVDA/VoiceOver PASS, certificazione o conformità WCAG globale. Verificati nomi accessibili, tastiera e semantica DOM.

## 30. Responsive regression

| Viewport | Dialog/keyboard | Context/navigation | Report/error | Bottom prima CTA Wizard | Page horizontal overflow |
|---|---|---|---|---|---|
| 360 × 800 | PASS | PASS | PASS | 577px | NO |
| 390 × 844 | PASS | PASS | PASS | 577px | NO |
| 430 × 844 | PASS | PASS | PASS | 561px | NO |
| 1280 × 900 | PASS | PASS | PASS | 639px | NO |

Desktop non regredito nei percorsi verificati. Screenshot dialog/transfer/viewport/report reali per ogni width. Ispezionati dialog-360 e transfer-360; la linea di dettaglio transfer già troncata nella precedente screenshot B resta debito visuale preesistente, non dovuto alla primitive nuova.

## 31. Out-of-scope accessibility debt

**5 famiglie rilevate, non audit WCAG completo**: dialog autonomi Art23EmployeeEntryPage; PersonaleServizioPage; IvcConglobationModal; dialog amministrazione utenti UserManagementPage; drawer Toolbox generale Sidebar. Sono fuori dall'acceptance originale Catalogo/Wizard/Report e dal percorso drawer Fondo B. Nessuna remediation Auth/admin/IVC/personale globale intrapresa. Debito visuale di dettaglio transfer preesistente annotato separatamente; nessun nuovo finding ASTRA aggiunto.

## 32. Files modified

Delta del task: **22 production UI**, **6 test**, **0 config runtime**. Nuovo report e pack locale. Nessun file economico/core/auth/persistence/writer modificato. Per-file SHA PRE/POST e allowlist in scope.json/post.json.

| File production | Motivazione |
|---|---|
| src/components/areaFondo/AreaFondoContextBar.tsx | Wiring di target/expanded e comportamento tastiera delle superfici B. |
| src/components/areaFondo/AreaFondoSidebar.tsx | Wiring di target/expanded e comportamento tastiera delle superfici B. |
| src/components/layout/MainLayout.tsx | Wiring di target/expanded e comportamento tastiera delle superfici B. |
| src/components/shared/Card.tsx | Primitive riusata: semantica, nomi, unità, focus o disclosure. |
| src/components/shared/FundingItem.tsx | Primitive riusata: semantica, nomi, unità, focus o disclosure. |
| src/components/shared/Input.tsx | Primitive riusata: semantica, nomi, unità, focus o disclosure. |
| src/components/shared/Modal.tsx | Primitive riusata: semantica, nomi, unità, focus o disclosure. |
| src/components/shared/MonetaryInput.tsx | Primitive riusata: semantica, nomi, unità, focus o disclosure. |
| src/components/shared/NormativaPopover.tsx | Primitive riusata: semantica, nomi, unità, focus o disclosure. |
| src/features/wizard2026/components/Wizard2026YesNoField.tsx | Wiring di target/expanded e comportamento tastiera delle superfici B. |
| src/features/wizard2026/letters/components/Wizard2026DataRequestModal.tsx | Riusa dialog; ID dei sei campi; nessuna modifica generazione lettera. |
| src/features/wizard2026/steps/CcnlRecoveryEditor.tsx | Solo label, ID, descrizioni, grouping e dialog; nessun handler economico modificato. |
| src/features/wizard2026/steps/Step1EnteCondizioni.tsx | Solo label, ID, descrizioni, grouping e dialog; nessun handler economico modificato. |
| src/features/wizard2026/steps/Step2Art23Limite.tsx | Solo label, ID, descrizioni, grouping e dialog; nessun handler economico modificato. |
| src/features/wizard2026/steps/Step3Dl25.tsx | Solo label, ID, descrizioni, grouping e dialog; nessun handler economico modificato. |
| src/features/wizard2026/steps/Step4Ccnl2026.tsx | Solo label, ID, descrizioni, grouping e dialog; nessun handler economico modificato. |
| src/features/wizard2026/steps/Step5ConglobamentoArt60.tsx | Solo label, ID, descrizioni, grouping e dialog; nessun handler economico modificato. |
| src/features/wizard2026/steps/Step6Straordinario.tsx | Solo label, ID, descrizioni, grouping e dialog; nessun handler economico modificato. |
| src/features/wizard2026/steps/Step7Pnrr.tsx | Solo label, ID, descrizioni, grouping e dialog; nessun handler economico modificato. |
| src/features/wizard2026/transfer/Wizard2026TransferModal.tsx | Solo superficie dialog e annuncio errore; controller/validator/apply invariati. |
| src/pages/FondiEntiPage.tsx | Quattro dialog migrati e label/nomi; workflow esistente. |
| src/pages/ReportsPage.tsx | Solo dieci associazioni label/id. |

## 33. Tests

Nuovi: accessibilityPrimitives.test.tsx (13) e accessibility.integration.test.tsx (12). Modificati strettamente: ccnlRecoveryEditor test (nomi textbox qualificati e più ID descrittivi); dl25CrossView (nome del trigger unico); userSurface integration (ispezione stato del background con hidden:true mentre inert); FondoAccessorioDipendentePage.art79c1c (locator name di dominio, nomi/unità accessibili). Input e expected economici invariati; fixture/golden/oracle intatti.

Prima full run: aspettative obsolete su ruolo/nome trigger; seconda: tre selector CSS di vecchi ID FundingItem. Corrette soltanto query UI; nessun test escluso per passare.

## 34. Targeted result

**138/138 PASS** su 12 file: targeted.json (132) + fad-protection.json (6), senza sovrapposizione. 25 nuovi test utili per dialog, campi, census e caller reali. Nessun nuovo skip.

## 35. Full product

**2120/2120 PASS**, 154 file, pending 0. vitest run src/ con configurazione offline equivalente consolidata, envFile false, Supabase dummy e guard di rete. Unica esclusione già consolidata: wave3HardeningEvidence.test.ts, generatore storico di evidence; nessun normale product test escluso. Config package/runtime originali invariati.

## 36. Regression

**8/8 PASS**, scripts/run_regression_tests.ts eseguito con runtime/esbuild locali e guard. Output regression.txt; exit 0. Fixture e golden non modificati.

## 37. Oracle

**14/14 PASS**, scripts/run_wave2_oracle.ts locale e guard. Output oracle.txt; exit 0. Oracle originale byte-identico.

## 38. TypeScript

**PASS**, node node_modules/typescript/bin/tsc --noEmit, equivalente offline senza npx/registry. Tipi production e test verificati. Il test DOM usa la libreria già installata; annotazione mirata per dichiarazioni non esportate dal package, nessuna modifica dipendenze.

## 39. Diff

**PASS**, git diff --check, index immutato. Warning LF/CRLF del dirty preesistente non sono errori di whitespace. Nuove linee Report senza trailing whitespace. Status POST nel pack; nessuna pulizia del dirty state.

## 40. Golden/oracle integrity

SHA PRE/POST: golden, oracle, regression/economic fixtures invariati. Formule, ledger, recovery/DL25/PNRR/Art60/Art23 e document writer invariati. Tutti i 20 VERIFIED_FIXED protetti dal product/regression/oracle e dai test boundary pertinenti, senza 20 review separate.

## 41. Scope integrity

**PASS**. 22 componenti/wiring UI, 6 test; 0 config runtime. Nessun DB/migration/RLS/Auth server/profile/Edge Function/Supabase remoto. Registry e MEMORIA_AI invariati. Historical implementation/review/evidence preservati. No commit/push/PR/deploy.

Strict offline: tentativi prodotto osservati 0, tentativi tooling 22 (Vite dns.promises.lookup localhost intercettati, senza DNS reale); browser page HTTP(S) 0. Guard socket/DNS, proxy Chrome chiuso e DNS blackhole; nessuna connessione reale stabilita nei percorsi. Nessun contatto staging/produzione. Il pack distingue scope dal dirty contro HEAD.

## 42. Candidate statuses

ACCESS_01_IMPLEMENTATION_STATUS = CANDIDATE_VERIFIED_FIXED.
ACCESS_02_IMPLEMENTATION_STATUS = CANDIDATE_VERIFIED_FIXED.
FUNC-03, UX-02, UX-03 rimangono CANDIDATE_VERIFIED_FIXED B protetti. Nessuna promozione formale. ASTRA_FORMAL_BASELINE_AFTER_TASK = VF20/PF2/OPEN3.

## 43. Next gate

**ASTRA_FINAL_RESIDUAL_INDEPENDENT_REVIEW**, una sola review su FUNC-03, UX-02, UX-03, ACCESS-01 e ACCESS-02. Nessuna review creata in questo task; nessun nuovo micro-slice avviato. Dopo il report si ferma il lavoro.
