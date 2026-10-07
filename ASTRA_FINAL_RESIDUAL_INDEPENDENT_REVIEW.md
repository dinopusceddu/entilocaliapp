# ASTRA — FINAL RESIDUAL INDEPENDENT REVIEW
## Consolidated Independent Audit of Findings FUNC-03, UX-02, UX-03, ACCESS-01, and ACCESS-02

**Review Date**: 2026-10-07\
**Auditor**: Principal Software Architect, Accessibility Reviewer, UX Reviewer & Independent Audit Lead\
**Repository**: `dinopusceddu/entilocaliapp`\
**Target Branch**: `ux/toolbox-area-fondo-prototype`\
**Target HEAD**: `d3170f959b5815c514dbf3d6e5f93366a5f14c67`\
**Under Review**:
- `SLICE_A_PROMOTION_AND_USER_SURFACE_CONSOLIDATION_REPORT.md` (Slice B implementation report)
- `ACCESSIBILITY_CONSOLIDATION_IMPLEMENTATION_REPORT.md` (Slice C implementation report)
- Associated codebase, unit/integration test suites, and evidence packs\
**Target Findings**: `FUNC-03`, `UX-02`, `UX-03`, `ACCESS-01`, `ACCESS-02`\
**Prior Formal Baseline**: `VF20 / PF2 / OPEN3` (Blockers Open: 0)\

---

## 1. Executive Verdict

**ASTRA_FINAL_RESIDUAL_INDEPENDENT_REVIEW = PASS.**

An exhaustive, adversarial, and forensic independent review was performed across the five residual findings of the ASTRA project:
1. **FUNC-03** (`OPEN` → `CANDIDATE_VERIFIED_FIXED`): Verified. The transfer workflow has been unified under a single operational state projection (`transferAction.ts`) and a single shared controller (`WizardTransferAction.tsx`). Both entry points (Summary panel and Step 8 preview) share identical availability, identical business reasons, identical dialog lifecycle, synchronous in-flight protection against double clicks, context epoch and unmount guards against stale response poisoning, idempotency, retry capability upon failure, and strict enforcement of the `CLOSED` read-only boundary. No parallel economic calculations or amount mutations have been introduced.
2. **UX-02** (`PARTIALLY_FIXED` → `CANDIDATE_VERIFIED_FIXED`): Verified. The Area Fondo context bar maintains entity name, reference year, and snapshot status (`CLOSED` vs. `In lavorazione`) visibly across all tested viewports (360×800, 390×844, 430×844, and 1280×900). Touch-accessible disclosure of the full entity name is implemented via a native button with `aria-expanded` and `aria-controls` targeting an expandable card, completely removing reliance on CSS `title` or desktop-only hover. Context persistence during scroll is guaranteed by sticky positioning on a container using `overflow-x-clip`. Modal and drawer overlays maintain unambiguous context, and Admin viewing of non-owned entities explicitly displays owner attribution without authorization contamination.
3. **UX-03** (`PARTIALLY_FIXED` → `CANDIDATE_VERIFIED_FIXED`): Verified. An audit of all rendered user-facing text confirms that zero internal technical jargon terms remain in the user interface (`TECHNICAL_USER_TEXT_REMAINING = 0`). The navigation hierarchy clearly differentiates between application-level Toolbox navigation, current Fund sections (drawer/sidebar), and contextual actions. In Step 8 and mobile viewports, the primary transfer action has clear visual hierarchy without competing duplicate CTA actions, and the first useful action is immediately accessible above the fold (ending at y577 within an 800px viewport).
4. **ACCESS-01** (`OPEN` → `CANDIDATE_VERIFIED_FIXED`): Verified. The "Nuovo Ente" modal dialog in `FondiEntiPage.tsx` and all shared modals have been refactored onto the `ModalSurface` primitive (`src/components/shared/Modal.tsx`). Semantics use native `<dialog role="dialog" aria-modal="true">` with descriptive accessible names. Focus is dynamically trapped with bidirectional wrap (Tab and Shift+Tab), initial focus is set to the first interactive field (Entity Name input), Escape dismisses the dialog when not in-flight, background siblings in `document.body` are made strictly `inert` with `aria-hidden="true"`, and closing the dialog reliably restores focus to the invoking trigger element without falling back to `BODY`. The shared modal stack tracks nested/stacked overlays without leaking inertness or focus.
5. **ACCESS-02** (`OPEN` → `CANDIDATE_VERIFIED_FIXED`): Verified. All active interactive fields within the audited perimeter possess programmatic accessible names (`ACTIVE_FIELDS_WITHOUT_ACCESSIBLE_NAME = 0`). The 10 Report metadata controls (7 textboxes, 3 selects) are individually associated with label elements via `useId()`. `MonetaryInput` operates as a decimal textbox with explicit currency unit description, `aria-invalid` semantics, and `aria-describedby` linking to error alerts. All active IDs are unique (`DUPLICATE_ACTIVE_IDS = 0`). Cards and accordions feature single native button triggers with `aria-expanded` and `aria-controls`, and zero nested interactive control violations exist (`NESTED_INTERACTIVE_VIOLATIONS = 0`).

All verification gates succeeded without regressions:
- Targeted B+C suite: **138/138 PASS** across 12 files.
- Full product suite: **2120/2120 PASS** across 154 files.
- Regression suite: **8/8 PASS**.
- Wave 2 oracle: **14/14 PASS**.
- TypeScript (`tsc --noEmit`): **PASS**.
- Git diff formatting check (`git diff --check`): **PASS**.
- Severity findings: **BLOCKERS = 0, MAJOR = 0, MINOR = 0**.

All 5 residual findings are supported for transition to `VERIFIED_FIXED` in the subsequent final reconciliation gate.

---

## 2. Baseline

The official state before this review is documented in `ASTRA_25_FINDINGS_CURRENT_STATE_RECONCILIATION.md`:
- **VERIFIED_FIXED**: 20 (`SEC-01`, `DATA-01`, `DATA-02`, `DATA-03`, `CALC-01`, `CALC-02`, `CALC-03`, `CALC-04`, `CALC-05`, `DOC-01`, `DOC-02`, `NORM-01`, `NORM-02`, `NORM-03`, `NORM-04`, `ARCH-01`, `ARCH-02`, `FUNC-01`, `FUNC-02`, `UX-01`)
- **PARTIALLY_FIXED**: 2 (`UX-02`, `UX-03`)
- **OPEN**: 3 (`FUNC-03`, `ACCESS-01`, `ACCESS-02`)
- **TOTAL**: 25
- **BLOCKERS_OPEN**: 0

The ASTRA registry was not altered during this independent review and remains strictly byte-identical at `VF20 / PF2 / OPEN3`.

---

## 3. Preflight

Preflight execution confirmed repository consistency:
- `git branch --show-current`: `ux/toolbox-area-fondo-prototype`
- `git rev-parse HEAD`: `d3170f959b5815c514dbf3d6e5f93366a5f14c67`
- `git status --short --untracked-files=all`: Verified intentional dirty working tree containing implementation changes from prior verified slices and evidence artifacts.
- `git diff --cached --name-status`: Verified empty index (no staged files).
- Diff checks confirmed no merge conflicts, no broken formatting, and zero destructive git operations.

---

## 4. Original Acceptance Matrix

Verification was conducted directly against the original authoritative acceptance criteria defined in `ASTRA_RSU_AUDIT_REPORT.md`:

| Finding | Original Audit Finding Summary | Authoritative Acceptance Criteria | Review Evaluation |
|---|---|---|---|
| **FUNC-03** | Trasferimento Wizard con due messaggi contraddittori: CTA centrale funziona, laterale disabilitata con riferimento a refactoring | *Ogni accesso al trasferimento ha disponibilità coerente e stesso risultato verificabile.* | **PASS** — Single operational projection, identical availability, identical dialog, idempotency and retry guards. |
| **UX-02** | Contesto ente/anno poco visibile sui telefoni: nome ente e anno spariscono dalla barra compatta; a 360px badge tagliato | *A 360px ente/anno/stato restano accessibili durante scroll e modali; nome completo leggibile senza cambiare Fondo.* | **PASS** — Compact persistent context bar, touch disclosure button for full name, preserved during scroll. |
| **UX-03** | Terminologia tecnica e gerarchia mobile dispersiva: READY, legacy, mapping, payload atomico, DocumentFactory, refactoring | *Nessun termine interno nelle azioni RSU; una prima azione chiara visibile senza quasi una schermata di scroll.* | **PASS** — 0 technical terms in rendered UI, clear primary action hierarchy, first useful action visible above fold. |
| **ACCESS-01** | La modale Nuovo ente non trattiene il focus: focus passa al BODY e allo sfondo; Escape non chiude | *Tab/ShiftTab restano nel dialog; sfondo non interagibile; chiusura ripristina il focus.* | **PASS** — Native `<dialog role="dialog" aria-modal="true">`, focus trap, Shift+Tab wrap, Escape, background inert, focus return. |
| **ACCESS-02** | Label e semantica dei controlli incomplete: 7 textbox metadati report senza nome; spinbutton senza label; nested button | *Ogni campo ha nome univoco e unità; errori annunciabili; ordine Tab senza duplicazioni.* | **PASS** — 10 report controls labeled, MonetaryInput decimal textbox with unit/error associations, 0 nested buttons, unique IDs. |

---

## 5. Slice B Code & Evidence Audited

The review inspected all production code, test additions, and evidence artifacts introduced by Slice B (`USER_SURFACE_CONSOLIDATION`):
- `src/features/wizard2026/transfer/transferAction.ts`: New operational projection module mapping validation and context to single UI status.
- `src/features/wizard2026/transfer/WizardTransferAction.tsx`: Unified provider and controller managing modal open/close, sync in-flight locking, context matching, and navigation.
- `src/features/wizard2026/components/Wizard2026PreviewPage.tsx`: Integrated `WizardTransferProvider`.
- `src/features/wizard2026/components/Wizard2026SummaryPanel.tsx`: Replaced hardcoded inactive button with `TransferActionPanel`.
- `src/features/wizard2026/steps/Step8RiepilogoPreview.tsx`: Replaced duplicated transfer handler with `TransferActionPanel`.
- `src/components/areaFondo/AreaFondoContextBar.tsx`: Added touch-accessible full entity name disclosure, compact sticky bar, and owner label.
- `src/components/areaFondo/AreaFondoSidebar.tsx`: Added context repetition inside mobile drawer.
- `src/components/layout/Header.tsx` & `MainLayout.tsx`: Consolidated navigation and sticky container ancestor.
- Evidence pack `user_surface_consolidation_evidence/`: Reviewed `current-state-map.json`, `targeted.json` (44/44 PASS), `product.json` (2095/2095 PASS), `responsive-browser.json`, and screenshots across viewports.

---

## 6. Slice C Code & Evidence Audited

The review inspected all production code, test additions, and evidence artifacts introduced by Slice C (`ACCESSIBILITY_CONSOLIDATION`):
- `src/components/shared/Modal.tsx`: Introduced `ModalSurface` with native `<dialog>` portal, background `inert` and `aria-hidden` management, dynamic focus trap, Escape handler, and trigger focus restoration.
- `src/pages/FondiEntiPage.tsx`: Migrated "Nuovo Ente", "Nuova Annualità", "Rinomina Ente", and "Elimina Ente" dialogs to `ModalSurface` with associated labels.
- `src/components/shared/MonetaryInput.tsx`: Updated input semantics to decimal textbox with currency description, `aria-invalid`, `aria-describedby` linking to error alerts, and fail-closed parser.
- `src/components/shared/Card.tsx`: Replaced clickable `div role="button"` with a single native `<button aria-expanded aria-controls>` trigger.
- `src/components/shared/FundingItem.tsx`: Decoupled `NormativaPopover` trigger from the field label to eliminate nested interactive controls.
- `src/pages/ReportsPage.tsx`: Associated all 10 report metadata controls (7 textboxes and 3 select dropdowns) with explicit `<label htmlFor>` using `useId()`.
- Evidence pack `accessibility_consolidation_evidence/`: Reviewed `scope.json`, `targeted.json` (132/132 PASS), `fad-protection.json` (6/6 PASS), `product-final.json` (2120/2120 PASS), `browser-keyboard.json`, and viewport screenshots.

---

## 7. FUNC-03 Audit

The independent review analyzed the functional transfer workflow against the requirement of complete consistency across entry points:
- **Root Cause Verified**: Prior to remediation, `Wizard2026SummaryPanel.tsx` had a disabled button referencing "refactoring in corso", whereas `Step8RiepilogoPreview.tsx` possessed an active button wired to an independent handler that ignored `saveState.success` and lacked context mismatch guards.
- **Architectural Solution**: Slice B introduced a single source of operational status: `projectTransferAction(input)` in `src/features/wizard2026/transfer/transferAction.ts`.
- **UI Unification**: Both `Step8RiepilogoPreview.tsx` and `Wizard2026SummaryPanel.tsx` consume `TransferActionPanel` from `WizardTransferAction.tsx`, which queries the shared `WizardTransferController`.
- **Verdict**: Verified. `SAME_TRANSFER_STATE_ACROSS_ENTRY_POINTS = PASS`.

---

## 8. Transfer Authority

The transfer authority boundaries were strictly verified:
1. **Normative & Monetary Validator Authority**: `validateWizard2026Transferable` remains the sole validation authority.
2. **Economic Projection Authority**: `buildWizard2026TransferPreview` remains the sole preview builder; amounts and line item distributions are not recalculated in UI components.
3. **Application Authority**: `applyWizard2026Transfer` remains the sole function producing the transferred `FundData` payload.
4. **Presentation Authority**: `projectTransferAction` is strictly a presentation projection that combines validator output with session context (`closed`, `isYearSwitching`, `alreadyTransferred`, `monetaryDraftInvalid`). It introduces zero economic arithmetic.
- **Authorities Count**: `TRANSFER_ACTION_AUTHORITIES = 1`.
- **Parallel Economic Logic**: `PARALLEL_TRANSFER_ECONOMIC_LOGIC = ABSENT`.

---

## 9. Transfer Scenarios

The review audited the behavior of `useTransferController` and its integration tests across all critical operational scenarios:

| Scenario | Expected Behavior | Implementation Mechanism | Test Evidence | Verdict |
|---|---|---|---|---|
| **AVAILABLE** | Both entry points enable action; click opens single modal | `status: 'AVAILABLE', enabled: true` | `userSurface.integration.test.tsx` (cases 1, 2) | **PASS** |
| **BLOCKED / Invalid** | Both disabled; business reason explained | `!validation.isTransferable` or invalid monetary draft | `userSurface.integration.test.tsx` (cases 3, 4) | **PASS** |
| **CLOSED** | Both read-only; no modal allowed; reason displayed | `input.closed === true` | `userSurface.integration.test.tsx` (case 6) | **PASS** |
| **Double Click** | First click executes; second click ignored synchronously | `inFlight.current = true` synchronously checked | `userSurface.integration.test.tsx` (case 7) | **PASS** |
| **Save Failure & Retry** | Error displayed via `role="alert"`; state unlocked for retry | `if (!saved?.success) throw Error(...)` in `catch` blocks | `userSurface.integration.test.tsx` (case 8) | **PASS** |
| **Context Switch In-Flight** | Stale response rejected; no dispatch to new entity | `liveContext.current !== origin` check after `await` | `userSurface.integration.test.tsx` (case 9) | **PASS** |
| **Unmount In-Flight** | No state update or dispatch after unmount | `mounted.current` checked after `await` | `userSurface.integration.test.tsx` (case 10) | **PASS** |
| **Duplicate Transfer** | Second transfer shows "Dati già acquisiti" | `alreadyTransferred` signature detection | `userSurface.integration.test.tsx` (case 11) | **PASS** |

Summary:
- `TRANSFER_IDEMPOTENCY = PASS`
- `TRANSFER_RETRY = PASS`
- `STALE_RESPONSE_PROTECTION = PASS`
- `CLOSED_TRANSFER_GUARD = PASS`

---

## 10. UX-02 Responsive & Context Audit

The context persistence and readability were verified across target viewports:
- **360 × 800 (Compact Mobile)**: Context bar occupies top header with sticky positioning. Entity name, reference year, and status badge are rendered compactly. Horizontal overflow is absent (`horizontalOverflow: false`).
- **390 × 844 & 430 × 844 (Standard/Large Mobile)**: Context bar renders cleanly without wrapping disruptions.
- **1280 × 900 (Desktop)**: Full context bar layout with Autosave indicator, entity selector, and breadcrumbs.
- **Touch Full Name Access**: Truncated entity name contains an interactive button:
  `<button type="button" aria-expanded={showFullName} aria-controls={identityId} onClick={() => setShowFullName(v => !v)} aria-label="...">`
  Tapping this button expands an explicit card (`data-testid="full-entity-name"`) displaying the unclipped entity name, year, status, and ownership details. It does not navigate away or depend on hover/title attributes.
  `FULL_ENTITY_NAME_TOUCH_ACCESS = PASS`.
- **Scroll Persistence**: The parent container uses `overflow-x-clip`, allowing CSS `sticky top-16 z-30` to function properly during vertical scrolling.
  `CONTEXT_PERSISTENCE_DURING_SCROLL = PASS`.
- **Modal / Drawer Context Clarity**: When the mobile navigation drawer or transfer modal opens, the active entity and year are explicitly restated in the overlay header.
  `MODAL_CONTEXT_CLARITY = PASS`.
- **Admin Foreign Owner Context**: When an Administrator inspects an entity owned by another user (`isAdmin && currentEntity.user_id !== currentUser.id`), the context bar displays "Ente di altro utente" and resolves the owner's name via profile lookup without altering permission logic.
  `ADMIN_FOREIGN_OWNER_CONTEXT = PASS`.

---

## 11. UX-03 Terminology & Hierarchy Audit

An automated and manual census of all user-facing strings was performed:
- **Internal Technical Terms Scan**: Scanned for `refactoring`, `payload`, `payload atomico`, `mapping`, `legacy`, `DocumentFactory`, `READY`, `canonical`, `resolver`, `internal`, and `debug`.
  - Non-rendered source code symbols (such as TypeScript imports `import { DocumentFactory }` and enum definitions) were preserved.
  - Rendered UI text contains **0** technical terms:
    - `refactoring` → replaced by operational status and business reason.
    - `Mapping Preview` → "Destinazione dei dati".
    - `payload / payload atomico` → "dati del personale" / "descrizione dell'acquisizione".
    - `legacy` → "storico".
    - `READY` → "Pronto" (via display boundary translation `presentTransferText`).
    - `CanonicalFundLedger` unavailable text → "Dati del Fondo non disponibili".
  - `TECHNICAL_USER_TEXT_REMAINING = 0`.
- **Primary Action Clarity**: Step 8 places the primary transfer action at the top of the review surface, avoiding confusion with secondary navigation.
  `PRIMARY_ACTION_AMBIGUITY = ABSENT`.
- **Navigation Hierarchy**: Clarified into three distinct levels:
  1. *Toolbox Application*: Accessible via the logo / "Tutti i Fondi" button.
  2. *Current Fund Sections*: Accessible via the sidebar (desktop) or "Sezioni del Fondo corrente" drawer (mobile).
  3. *In-Page Contextual Action*: Transfer action card embedded within the Wizard workflow.
  `NAVIGATION_HIERARCHY = PASS`.
- **Mobile Vertical Priority**: On mobile devices, the primary transfer CTA is positioned at y = 519 (height 58px) in 360×800 and 390×844 viewports, and y = 503 in 430×844 viewports, terminating at y = 577/561 well above the 800/844px fold. Users do not need to scroll to discover the primary action.
  `MOBILE_VERTICAL_PRIORITY = PASS`.

---

## 12. ACCESS-01 Dialog Audit

The "Nuovo Ente" dialog and the underlying `ModalSurface` component were audited in detail:
- **Dialog Role & Semantics**: Utilizes native `<dialog tabIndex={-1} role="dialog" aria-modal="true" aria-label={name}>`.
  `DIALOG_SEMANTICS = PASS`.
- **Accessible Name**: Explicitly labeled with `aria-label="Nuovo Ente"`.
  `DIALOG_ACCESSIBLE_NAME = PASS`.
- **Initial Focus**: `focusFirst()` executes on mount, prioritizing `[data-autofocus]`, then inputs/textareas/selects. Focus moves immediately to the "Denominazione dell'Ente" input, never resting on `BODY`.
  `DIALOG_INITIAL_FOCUS = PASS`.
- **Tab & Shift+Tab Trap**: An active `keydown` listener intercepts `Tab`. When tabbing forward from the last interactive element ("Crea e apri Fondo"), focus wraps to the first ("Chiudi finestra"). When tabbing backward (`Shift+Tab`) from the first element, focus wraps to the last.
  `DIALOG_TAB_TRAP = PASS`.
  `DIALOG_SHIFT_TAB_TRAP = PASS`.
- **Escape Handling**: Keydown listener captures `Escape`, preventing default and calling `onClose()` (unless `closeDisabled` is set).
  `DIALOG_ESCAPE = PASS`.
- **Background Inertness**: `syncBackground()` iterates across all direct children of `document.body`. Every element except the topmost active `<dialog>` has `inert = true`, `setAttribute('inert', '')`, and `setAttribute('aria-hidden', 'true')` applied. Clicks and focus events outside the dialog are trapped.
  `DIALOG_BACKGROUND_INERT = PASS`.
- **Focus Return**: The active element before dialog open is captured in `trigger.current`. Upon unmount, `trigger.current.focus()` restores focus to the initiating button ("Nuovo ente"). If the trigger has been removed or disabled, a fallback microtask focuses the first interactive element of the page.
  `DIALOG_FOCUS_RETURN = PASS`.
- **Modal Stack Integrity**: A global array `surfaces` tracks open dialogs. When stacked modals exist, only the topmost surface is interactive; dismissing the topmost surface restores inertness settings for the underlying dialog.
  `MODAL_STACK_INTEGRITY = PASS`.
- **Transfer Modal Protection**: The transfer modal was migrated to `ModalSurface` with `closeDisabled={isTransferring}`, ensuring that backdrop clicks and Escape are locked during in-flight transfer requests.
  `TRANSFER_MODAL_REGRESSION = ABSENT`.

---

## 13. ACCESS-02 Field & Semantic Audit

The interactive fields across the application were audited for accessibility compliance:
- **Active Field Census**: Evaluated Catalogo, Wizard steps 1–8, Reports page, and shared components. All interactive inputs, textareas, and selects feature accessible names derived from `<label htmlFor>`, wrapping labels, or contextual `aria-label`.
  `ACTIVE_FIELDS_WITHOUT_ACCESSIBLE_NAME = 0`.
- **Report Metadata**: Verified the 10 metadata controls in `ReportsPage.tsx`:
  1. `Numero Determina` (textbox) — labeled via `htmlFor`
  2. `Data Determina` (textbox date) — labeled via `htmlFor`
  3. `Num. Delibera GC` (textbox) — labeled via `htmlFor`
  4. `Data Delibera GC` (textbox date) — labeled via `htmlFor`
  5. `Num. Verbale Revisori` (textbox) — labeled via `htmlFor`
  6. `Data Verbale Revisori` (textbox date) — labeled via `htmlFor`
  7. `Firma Digitale` (textbox) — labeled via `htmlFor`
  8. `Esito Parere Revisori` (select) — labeled via `htmlFor`
  9. `Stato trasmissione ai Revisori` (select) — labeled via `htmlFor`
  10. `Adozione delibera GC` (select) — labeled via `htmlFor`
  `REPORT_METADATA_ACCESSIBLE_NAMES = PASS`.
- **Monetary Input Accessibility**: In `MonetaryInput.tsx`:
  - Renders `<input type="text" inputMode="decimal" />` instead of an incomplete `spinbutton` without arrow handlers.
  - Links to currency unit and decimal format description via `aria-describedby`.
  - Associative validation: invalid input triggers `aria-invalid="true"` and appends the error message ID to `aria-describedby`; correcting the input reverts `aria-invalid="false"` and removes the error ID.
  - Valid zero (`0,00`) is accepted cleanly without triggering invalid states.
  - Extreme values (`1e308`), negative values, and precision errors fail-closed locally without propagating corrupted state.
  `MONETARY_INPUT_ACCESSIBILITY = PASS`.
  `ERROR_ASSOCIATION = PASS`.
- **Unique ID Census**: All dynamic controls generate IDs via React `useId()` combined with structured field suffixes. Multiple instances of `Input`, `MonetaryInput`, `Card`, and `FundingItem` render without collisions.
  `DUPLICATE_ACTIVE_IDS = 0`.
- **Accordion / Card Semantics**: `Card.tsx` renders a single native `<button aria-expanded aria-controls>` trigger. The content body has `role="region"` and `hidden={!isOpen}`. Child controls are housed inside the region, strictly outside the header button.
  `ACCORDION_SEMANTICS = PASS`.
- **Nested Interactive Controls**: Verified that no `<button>` contains a `<button>` or `<a>`, and no `role="button"` contains interactive children. In `FundingItem.tsx`, the `NormativaPopover` trigger button is placed outside the label element.
  `NESTED_INTERACTIVE_VIOLATIONS = 0`.
- **Tab Order Duplications**: No positive `tabIndex` attributes exist; hidden and collapsed elements are removed from the sequential focus navigation order.
  `TAB_ORDER_DUPLICATIONS = 0`.
- **Keyboard Contract**: Verified native keyboard handling:
  - `KEYBOARD_TAB = PASS`
  - `KEYBOARD_SHIFT_TAB = PASS`
  - `KEYBOARD_ENTER = PASS`
  - `KEYBOARD_SPACE = PASS`
  - `KEYBOARD_ESCAPE = PASS`

---

## 14. Browser & Keyboard Evidence

The automated browser testing results persisted in `accessibility_consolidation_evidence/browser-keyboard.json` were audited:
- **Environment**: Real Chrome instance executing against locally bundled fixtures with mocked persistence ports; strictly offline with zero remote network calls (`blockedRequests: []`).
- **Journey A (Catalogo → Nuovo Ente → Focus Trap → Escape → Focus Return)**:
  - Opened "Nuovo Ente" dialog from trigger button.
  - Verified initial focus on "Denominazione dell'Ente" input.
  - Verified Tab cycling through inputs, cancel, and submit, wrapping back to close button.
  - Verified Shift+Tab cycling in reverse.
  - Tested Escape dismissal: verified focus returns to the initiating "Nuovo ente" button.
  - Tested close button dismissal: focus returned to trigger.
  - Tested cancel button dismissal: focus returned to trigger.
  - Tested submit action: focus returned cleanly to page content.
  - Journey A Result: **PASS** across 360, 390, 430, and 1280 viewports.
- **Journey B (Area Fondo → Context Disclosure → Drawer → Wizard → Transfer Modal)**:
  - Tapped full name disclosure button: expanded unclipped entity card.
  - Tapped mobile menu button: opened Fund navigation drawer, verified context repetition.
  - Navigated to Wizard Step 8: verified single primary transfer action.
  - Clicked transfer action: opened `Wizard2026TransferModal`, verified backdrop inertness.
  - Journey B Result: **PASS** across all viewports.
- **Journey C (Report Metadata → Monetary Input Error Association)**:
  - Edited Report metadata fields via keyboard; verified dispatch.
  - Tested invalid monetary input: verified `aria-invalid="true"` and error description link. Corrected input to `100,00`: verified error removed and `aria-invalid="false"`.
  - Journey C Result: **PASS** across all viewports.
- `BROWSER_KEYBOARD_EVIDENCE = PASS`.
- **Disclaimer**: No screen reader execution was simulated; no unfounded claims of WCAG certification or full screen reader compliance are made.
  `FALSE_ACCESSIBILITY_CERTIFICATION = ABSENT`.

---

## 15. Responsive Matrix

Visual and layout metrics from browser characterization across target viewports:

| Viewport | Dialog Trap & Escape | Context Bar & Sticky | Report Metadata & Labels | Wizard Primary CTA Position | Horizontal Overflow | Result |
|---|---|---|---|---|---|---|
| **360 × 800** | PASS | PASS (y=78.5px after scroll) | PASS (10 fields) | y=519px, height=58px (bottom: 577px) | NO | **PASS** |
| **390 × 844** | PASS | PASS (y=78.5px after scroll) | PASS (10 fields) | y=519px, height=58px (bottom: 577px) | NO | **PASS** |
| **430 × 844** | PASS | PASS (y=78.5px after scroll) | PASS (10 fields) | y=503px, height=58px (bottom: 561px) | NO | **PASS** |
| **1280 × 900** | PASS | PASS (y=81.5px after scroll) | PASS (10 fields) | y=601px, height=38px (bottom: 639px) | NO | **PASS** |

Summary:
- `RESPONSIVE_360 = PASS`
- `RESPONSIVE_390 = PASS`
- `RESPONSIVE_430 = PASS`
- `RESPONSIVE_DESKTOP = PASS`

---

## 16. Out-of-Scope Accessibility Debt Classification

The implementation report documented 5 families of existing debt outside the audited perimeter. The review independently evaluated each family against the original acceptance criteria in `ASTRA_RSU_AUDIT_REPORT.md`:

| Debt Family | Description & Location | Original Acceptance Overlap? | Blocking for ACCESS-01/02? | Detailed Technical Justification |
|---|---|---|---|---|
| **1. Art23 Employee Dialog** | Ad-hoc modal in `Art23EmployeeEntryPage.tsx` | **NO** | **NO** | Original acceptance for ACCESS-01 explicitly targets `Catalogo → Nuovo ente`. Art. 23 employee entry is an auxiliary sub-page. |
| **2. PersonaleServizioPage Grid** | Field labeling in standalone legacy personnel grid | **NO** | **NO** | ACCESS-02 perimeters were `Wizard / Report / accordion`. Personale in servizio is maintained outside the active Wizard workflow. |
| **3. IvcConglobationModal** | Modal dialog on IVC stand-alone configuration page | **NO** | **NO** | Outside Catalogo and Wizard 2026 boundaries; does not affect negotiation fund constitution. |
| **4. UserManagementPage Dialogs** | Admin CRUD modals for user accounts | **NO** | **NO** | System administration features outside the RSU fund negotiation domain. |
| **5. Toolbox Sidebar Drawer** | Generic application drawer in catalog view | **NO** | **NO** | Area Fondo has its own consolidated navigation drawer (`AreaFondoSidebar.tsx`); the top-level Toolbox drawer is non-blocking. |

- `OUT_OF_SCOPE_DEBT_TOTAL = 5`
- `OUT_OF_SCOPE_DEBT_BLOCKING = 0`

---

## 17. Slice A Protection

Verified that Slice B and Slice C changes did not alter or regress Slice A (`PROVENANCE_METADATA_BOUNDARY`):
- `UX-01`: Provenance read model (`src/domain/provenance.ts`) and `ProvenancePanel.tsx` remain intact, covering all 15 RSU questions without parallel economic calculations.
- `ARCH-02`: Ownership authority remains `entity.user_id`. Authorization authority remains `public.profiles.role` via active session. Snapshot metadata (`snapshot.role`) is never read by authorization callers (`ACTIVE_AUTHORIZATION_CALLERS_OF_SNAPSHOT_ROLE = 0`). Stale metadata poisoning protections remain active.
- Tests in `provenance.test.ts` (23), `provenanceBoundary.integration.test.ts` (6), `provenance.integration.test.tsx` (4), and `authorizationPolicy.test.ts` (27) all pass cleanly.
- `SLICE_A_REGRESSION = ABSENT`.

---

## 18. Prior 20 Findings Regression Protection

The 20 findings already marked `VERIFIED_FIXED` in the formal baseline were verified through targeted integration tests and full test suite execution:
- Security findings (`SEC-01`, `AUTH-ADMIN`): Server RLS, profile role authority, and immutable closed snapshot policies untouched.
- Data initialization and monetary boundary (`DATA-01`, `DATA-02`, `DATA-03`): Empty fund factories, multi-year isolation, and monetary fail-closed boundaries fully respected.
- Calculation engine and limits (`CALC-01` to `CALC-05`): Single economic authority FAD, Art. 23 ceiling, DL 25 net/gross formulas, and PNRR faculty pipeline verified via 14/14 oracle tests and 8/8 regression tests.
- Document and readiness models (`DOC-01`, `DOC-02`): Canonical ledger, Table 15 mapping, and document readiness predicates verified.
- Normative findings (`NORM-01`, `NORM-02`, `NORM-03`, `NORM-04`): Art. 60 conglobation, CCNL recovery instruction model, DL 25 temporal regimes, and base year validations intact.
- Lifecycle and UX (`FUNC-01`, `FUNC-02`, `ARCH-01`, `ARCH-02`, `UX-01`): Operational statuses, read-only consultation on closed funds, and provenance models intact.
- `PRIOR_VERIFIED_FINDINGS_REGRESSION = ABSENT`.

---

## 19. NORM-02 Protection

The implementation of `CCNL_RECOVERY_INSTRUCTION` was protected against regression:
- Dedicated tests in `ccnlRecoveryEditor.test.tsx` (8), `ccnlRecovery.integration.test.ts`, and `ccnlRecovery.test.ts` pass cleanly.
- The distinction between current year competence and recovery installments, the 0,0028 calculation retirement, Fund vs. EQ splits, and duplicate row handling remain verified.
- `NORM_02_REGRESSION = ABSENT`.

---

## 20. FUNC-01 Protection

The `CLOSED` fund immutability boundary was verified:
- Closed funds are strictly read-only: inputs and save buttons are disabled, mutation attempts throw error, and transfer actions reflect `CLOSED` state ("Annualità chiusa: il riepilogo è consultabile in sola lettura").
- Consultation and export of closed historical records remain fully functional.
- `FUNC_01_REGRESSION = ABSENT`.

---

## 21. Security & Auth Boundary

- No changes were made to Supabase Edge Functions, database schemas, migration files, or RLS policies.
- User authorization continues to evaluate `public.profiles.role` via `currentUser` in `authorizationPolicy.ts`.
- `AUTH_SERVER_CHANGED = NO`.
- `AUTHORIZATION_BOUNDARY_REGRESSION = ABSENT`.

---

## 22. Targeted B+C Tests

The targeted test suite for Slices B and C was independently executed with Vitest:
- `src/application/__tests__/authorizationPolicy.test.ts`: 27 passed
- `src/application/__tests__/provenanceBoundary.integration.test.ts`: 6 passed
- `src/domain/__tests__/provenance.test.ts`: 23 passed
- `src/pages/__tests__/accessibility.integration.test.tsx`: 12 passed
- `src/pages/__tests__/provenance.integration.test.tsx`: 4 passed
- `src/components/areaFondo/__tests__/userSurfaceContext.test.tsx`: 7 passed
- `src/components/shared/__tests__/accessibilityPrimitives.test.tsx`: 13 passed
- `src/components/shared/__tests__/monetaryInput.test.tsx`: 10 passed
- `src/features/wizard2026/steps/__tests__/ccnlRecoveryEditor.test.tsx`: 8 passed
- `src/features/wizard2026/steps/__tests__/dl25CrossView.test.tsx`: 8 passed
- `src/features/wizard2026/transfer/__tests__/userSurface.integration.test.tsx`: 14 passed
- `src/pages/__tests__/FondoAccessorioDipendentePage.art79c1c.test.tsx`: 6 passed
- **Result**: `TARGETED_BC = 138/138 PASS` across 12 files.

---

## 23. Full Product Test Suite

The full product test suite was independently executed with Vitest under offline configuration:
- Test Files: **154 passed (154)**
- Tests: **2120 passed (2120)**
- Pending: 0
- Failures: 0
- Execution duration: 290.28s
- Single consolidated historical exclusion: `wave3HardeningEvidence.test.ts` (artifact generator). Zero product tests skipped or excluded.
- **Result**: `FULL_PRODUCT = 2120/2120 PASS`.

---

## 24. Regression Suite

Executed `npx vite-node scripts/run_regression_tests.ts`:
- Tested: `caso-distribuzione-consuntivo.json` — OK
- Tested: `caso-incremento-2025.json` — OK
- Tested: `caso-riporti-anno-precedente.json` — OK
- Tested: `caso-superamento-tetto-art23.json` — OK
- Tested: `ente-con-dirigenza.json` — OK
- Tested: `ente-con-eq.json` — OK
- Tested: `ente-con-segretario.json` — OK
- Tested: `ente-senza-dirigenza.json` — OK
- **Result**: `REGRESSION = 8/8 PASS`.

---

## 25. Oracle Suite

Executed `npx vite-node scripts/run_wave2_oracle.ts`:
- Tested 14 mathematical/normative boundary test cases (O014, O022, O060, O033, cached-total, canonical-zero).
- Passed: 14 / 14 (100%).
- **Result**: `ORACLE = 14/14 PASS`.

---

## 26. TypeScript Check

Executed `npx tsc --noEmit`:
- Exit code: 0.
- Standard error: empty.
- Standard output: empty.
- **Result**: `TYPESCRIPT = PASS`.

---

## 27. Diff Check

Executed `git diff --check`:
- Exit code: 0.
- Zero whitespace errors or conflict markers detected.
- **Result**: `DIFF_CHECK = PASS`.

---

## 28. Golden & Oracle Integrity

- `tests/fixtures/fondo/golden_results.json` SHA-256 PRE and POST match (`dc0a12cf4bc2ec16...`).
  `GOLDEN_CHANGED = NO`.
- `scripts/run_wave2_oracle.ts` SHA-256 PRE and POST match (`0ea62eb3db625066...`).
  `ORACLE_CHANGED = NO`.
- Database schema and migrations unchanged (`DATABASE_CHANGED = NO`, `MIGRATIONS_CHANGED = NO`).

---

## 29. Severity Findings

- **BLOCKER**: 0
- **MAJOR**: 0
- **MINOR**: 0

No new bugs, security vulnerabilities, accessibility blockers, or normative violations were discovered.

---

## 30. Per-Finding Final Verdict

1. **FUNC-03**: `VERIFIED_FIXED_SUPPORTED`. Unified transfer action state projection across summary and step 8, synchronous double-click protection, in-flight context and unmount guards, idempotency and retry capability, and strict closed enforcement.
2. **UX-02**: `VERIFIED_FIXED_SUPPORTED`. Responsive context bar with sticky scroll persistence at 360, 390, 430, and 1280px, touch-accessible disclosure button for full entity name, drawer context repetition, and clear non-owned entity attribution for Admin.
3. **UX-03**: `VERIFIED_FIXED_SUPPORTED`. Complete removal of technical internal vocabulary from rendered user interface, single unambiguous primary transfer action in Step 8, clear three-level navigation hierarchy, and mobile vertical priority with CTA above the fold.
4. **ACCESS-01**: `VERIFIED_FIXED_SUPPORTED`. Shared `ModalSurface` with native `<dialog>` semantics, accessible names, dynamic focus trap, Tab/Shift+Tab wrapping, Escape dismissal, background `inert` and `aria-hidden` enforcement, trigger focus restoration, and robust modal stack handling.
5. **ACCESS-02**: `VERIFIED_FIXED_SUPPORTED`. Zero active fields without accessible names, all 10 report metadata controls explicitly labeled, `MonetaryInput` converted to decimal textbox with currency description and error alert association, zero duplicate active IDs, single-button accordion triggers, zero nested button violations, and clean tab order.

---

## 31. Recommended ASTRA Statuses

Upon entry to the final reconciliation gate (`ASTRA_FINAL_RECONCILIATION`), the recommended statuses are:
- `FUNC-03`: `OPEN` → **`VERIFIED_FIXED`**
- `UX-02`: `PARTIALLY_FIXED` → **`VERIFIED_FIXED`**
- `UX-03`: `PARTIALLY_FIXED` → **`VERIFIED_FIXED`**
- `ACCESS-01`: `OPEN` → **`VERIFIED_FIXED`**
- `ACCESS-02`: `OPEN` → **`VERIFIED_FIXED`**

Projected post-reconciliation ASTRA totals:
- **VERIFIED_FIXED**: 25 (100%)
- **PARTIALLY_FIXED**: 0
- **OPEN**: 0
- **TOTAL**: 25
- **BLOCKERS_OPEN**: 0

---

## 32. Final Recommendation

All five findings meet the strict criteria for complete remediation. No code changes, test updates, or documentation edits beyond this independent review report were made.

---

## 33. Next Gate

**NEXT_GATE = ASTRA_FINAL_RECONCILIATION**

The project is ready for formal final reconciliation in `ASTRA_25_FINDINGS_CURRENT_STATE_RECONCILIATION.md`, closing out the entire initial ASTRA finding catalog.
