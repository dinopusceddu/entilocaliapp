# ASTRA — residual remediation roadmap

Data: 07.10.2026. Piano operativo; nessuna remediation avviata in questo task. L’unica authority degli stati rimane [ASTRA_25_FINDINGS_CURRENT_STATE_RECONCILIATION.md](ASTRA_25_FINDINGS_CURRENT_STATE_RECONCILIATION.md). Acceptance originarie: [ASTRA_RSU_AUDIT_REPORT.md](ASTRA_RSU_AUDIT_REPORT.md), sezioni FUNC-03, UX-01/02/03, ACCESS-01/02 e ARCH-02.

## Current baseline

**VF18/PF4/OPEN3; TOTAL25; BLOCKERS_OPEN0.** NORM-02 VERIFIED_FIXED dopo implementation V2, independent review e addendum formale PASS. Target finale, ancora da raggiungere: VF25/PF0/OPEN0/BLOCKERS0.

## Residual findings

| Finding | Stato corrente | Slice | Acceptance da soddisfare |
|---|---|---|---|
| UX-01 | PARTIALLY_FIXED | A | Tutte le 15 risposte RSU ricavabili con riferimenti ai dati; manuale/calcolato/facoltativo/mancante sempre distinguibili |
| ARCH-02 | PARTIALLY_FIXED | A | Ruolo snapshot mai fonte di autorizzazione; anno/capienza metadata coerenti col calcolo; owner sempre entity.user_id |
| FUNC-03 | OPEN | B | Ogni accesso al trasferimento con disponibilità coerente e stesso risultato verificabile |
| UX-02 | PARTIALLY_FIXED | B | A 360px ente/anno/stato accessibili durante scroll e modali; nome completo leggibile senza cambiare Fondo |
| UX-03 | PARTIALLY_FIXED | B | Nessun termine interno nelle azioni RSU; prima azione chiara senza quasi una schermata di scroll |
| ACCESS-01 | OPEN | C | Tab/ShiftTab nel dialog; sfondo non interagibile; chiusura ripristina il focus |
| ACCESS-02 | OPEN | C | Ogni campo con nome programmatico univoco e unità; errori annunciabili; Tab senza duplicazioni |

## Slice A — PROVENANCE_METADATA_BOUNDARY

**Target: UX-01 + ARCH-02. Independent review: YES, una sola alla fine.**

Un’unica rappresentazione tipizzata della provenienza collega cifra, fonte, input, calcolo, competenza, esclusione, scelta amministrativa e documentazione disponibile/mancante. Riutilizzare le entry canoniche e le proiezioni già presenti, compresa la provenance CCNL, evitando un dossier parallelo. La rappresentazione deve distinguere owner, actor/autore, ruolo corrente e metadata storici; derivare anno/capienza dai risultati e dichiarare quali metadata sono descrittivi.

- Acceptance: mappare tutte le 15 domande RSU dell’audit ai dati e ai riferimenti effettivamente disponibili; rendere esplicita ogni mancanza, senza inventare fonti o attestazioni. Manuale, calcolato, facoltativo e mancante restano distinguibili anche per zero, INVALID e UNDETERMINED.
- Boundary: canonicalFundLedger governa gli importi; il sistema autorizzativo corrente governa i permessi; entity.user_id governa l’owner. Autore del salvataggio e ruolo snapshot non diventano permessi. Evitare duplicazioni persistite e ricalcolare soltanto metadata derivati, senza riscrivere formule.
- Candidati domain/read model: src/domain/canonicalFundLedger.ts; src/logic/calculation/canonicalFundLedger.ts; src/domain/documentProjection.ts (projectFadReport); src/presenters/reportPresenter.ts; src/domain/snapshot.ts; viste Cabina/Verifica/Documenti.
- Candidati boundary: src/contexts/AppContext.tsx; src/application/userWorkflow.ts; src/application/policies/authorizationPolicy.ts; src/application/snapshots/snapshotWorkflow.ts; src/infrastructure/persistence/SupabaseStateRepository.ts e SupabaseUserRepository.ts; src/pages/UserManagementPage.tsx; src/features/wizard2026/transfer/applyWizard2026Transfer.ts. Sono superfici da censire, non un elenco di file obbligatoriamente da modificare.
- Test: lineage end-to-end ledger → read model → UI/documenti, 15 risposte RSU, signed/excluded/missing/zero e normative PNRR/DL25/CCNL; owner diverso dall’Admin autore, ruolo snapshot ADMIN avvelenato riaperto dal proprietario, refresh del ruolo corrente, failure del mirror compatibile senza falsa autorizzazione; anno/capienza stale, save/reload, CLOSED e transfer idempotente. Riutilizzare authorizationPolicy/userWorkflow/snapshotWorkflow tests e regressioni canoniche; full product offline, regression8/8, oracle14/14, TypeScript e diff check, golden/oracle invariati.

Rischio principale: confondere spiegazione con authority. Il mirror di user_app_state.role e i gate profile-role già documentati devono essere qualificati rispetto all’acceptance effettiva: una nuova vista non dimostra da sola il boundary autorizzativo. Nessuna verifica live, migration o modifica del sistema autorizzativo è autorizzata implicitamente dalla roadmap; un nuovo security/auth concern richiede un gate esplicito.

Review prevista: **PROVENANCE_METADATA_BOUNDARY_INDEPENDENT_REVIEW**, con UX-01 e ARCH-02 valutati insieme. Il dossier di evidence deve coprire entrambe le acceptance, senza promuoverle sulla sola implementation locale.

## Slice B — USER_SURFACE_CONSOLIDATION

**Target: FUNC-03 + UX-02 + UX-03. Independent review dedicata: NO.**

Un solo intervento su azioni, navigazione e lessico: stessa semantica e stato di trasferimento per tutti gli entry point; motivi di business quando indisponibile; importi/anno e conferma comprensibili; contesto ente/anno/stato persistente e nome completo consultabile anche al tocco. Distinguere proprietà altrui per Admin usando il boundary definito in A. Toolbox e Fondo devono avere una gerarchia chiara e una prima azione utile evidente.

- Acceptance: verificare tutti gli accessi al trasferimento e il risultato persistito, anche dopo re-transfer, errore e CLOSED; eliminare “refactoring”, “payload atomico”, “mapping”, “legacy”, “DocumentFactory” e stati interni dalle azioni RSU. Tradurre solo la presentazione: enum, readiness, policy documentali e guards restano invariati.
- Candidati: src/features/wizard2026/components/Wizard2026PreviewPage.tsx, Wizard2026SummaryPanel.tsx e Wizard2026Layout.tsx; src/features/wizard2026/steps/Step8RiepilogoPreview.tsx; src/features/wizard2026/transfer/Wizard2026TransferModal.tsx; src/components/areaFondo/AreaFondoContextBar.tsx e AreaFondoSidebar.tsx; src/components/layout/Header.tsx, Sidebar.tsx e MainLayout.tsx; src/application/registry/moduleRegistry.ts; src/pages/ReportsPage.tsx.
- Test: targeted e integration per CTA/stato condivisi, validazione, importi, conferma, correlation e idempotenza; nomi lunghi, più enti/anni, proprietà altrui, scroll e modali a 360×800, 390×844, 430px e desktop; prima azione visibile e scansione del lessico sui percorsi raggiungibili. Eseguire responsive test con evidenze visive, full product offline, regression/oracle, TypeScript e diff check.
- Dipendenza C: usare già trigger singoli, button semantici, ID stabili, associazioni label/error e primitive compatibili con gestione focus; non creare nuovi controlli interattivi annidati. B prepara la superficie, C completa e verifica il contratto accessibile globale. Nessun quarto slice.

La validazione indipendente di B avverrà nella review finale dopo C; nessuna review per FUNC-03, UX-02 o UX-03 isolatamente.

## Slice C — ACCESSIBILITY_CONSOLIDATION

**Target: ACCESS-01 + ACCESS-02. Independent review dedicata: NO.**

Remediation coerente di dialog, controlli e accordion. Il dialog Nuovo ente deve avere nome/ruolo, focus iniziale, trap bidirezionale, Escape quando appropriato, sfondo non interagibile e ritorno al trigger. Ogni controllo raggiungibile nel perimetro dell’audit deve esporre nome univoco, unità e descrizioni/errori associati; accordion con un solo trigger interattivo, aria-expanded/controls coerenti e ordine Tab senza duplicazioni.

- Candidati: src/pages/FondiEntiPage.tsx (overlay Nuovo ente); src/components/shared/Modal.tsx, Card.tsx, Input.tsx e MonetaryInput.tsx; metadata di src/pages/ReportsPage.tsx; controlli economici Wizard e superfici B, inclusi riepilogo, menu/drawer e transfer modal. Riutilizzare primitive accessibili comuni invece di fix isolati.
- Test: UI reale con getByRole/name e tastiera, Tab/ShiftTab/Escape/Enter/Space, focus iniziale/ritorno, background non interagibile, id univoci anche con istanze multiple, collapsible state e assenza di nested interactive controls; error invalid→valid annunciabile senza commit invalido. Proteggere DATA-03, CLOSED e correlation. Integrare keyboard journey Catalogo → Nuovo ente → Wizard → trasferimento → report e responsive regressions delle superfici B.
- Eseguire full product offline, regression/oracle, TypeScript e diff check; registrare ciò che è realmente verificato con albero accessibile e lettore schermo. Non presentare controlli DOM automatizzati come una certificazione WCAG complessiva o come un test con screen reader reale mai eseguito.

## Final review

**ASTRA_FINAL_RESIDUAL_INDEPENDENT_REVIEW** dopo B+C: target cumulativo FUNC-03, UX-02, UX-03, ACCESS-01, ACCESS-02. Verificare congiuntamente UX, responsive, keyboard/accessibility e regressioni; proteggere anche le closure precedenti e la review A. Un solo dossier finale con acceptance matrix dei cinque finding, evidence UI e gate tecnici.

## Order and review policy

1. PROVENANCE_METADATA_BOUNDARY_IMPLEMENTATION.
2. PROVENANCE_METADATA_BOUNDARY_INDEPENDENT_REVIEW.
3. USER_SURFACE_CONSOLIDATION_IMPLEMENTATION.
4. ACCESSIBILITY_CONSOLIDATION_IMPLEMENTATION.
5. ASTRA_FINAL_RESIDUAL_INDEPENDENT_REVIEW.
6. ASTRA_FINAL_RECONCILIATION.

**IMPLEMENTATION_SLICES_REMAINING=3; INDEPENDENT_REVIEWS_REMAINING=2.** Una implementation e un report utile per area; nessuna review per questa promozione, per singoli finding B/C o per refactor UI intermedi. Nessuna reconciliation intermedia di micro-modifiche. Gli stati formali restano quelli del registro fino alla riconciliazione supportata dalle review richieste; implementation locale al massimo CANDIDATE_VERIFIED_FIXED.

Nuovi gate solo in caso di blocker, ambiguità normativa, regressione strutturale, test failure o nuovo security/auth concern. Debiti fuori dai 25 (es. CAS/multiwriter, RGS_SCHEMA_UNVERIFIED e gate operativi live) restano separati e non vengono dichiarati risolti dal consolidamento.

## Final target

VF25 / PF0 / OPEN0 / TOTAL25 / BLOCKERS_OPEN0, soltanto dopo acceptance complete, evidence tecnica positiva e le due review previste. Prossimo gate: **PROVENANCE_METADATA_BOUNDARY_IMPLEMENTATION**. Nessuna implementation eseguita in questo task.
