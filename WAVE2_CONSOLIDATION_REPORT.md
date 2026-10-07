# WAVE 2 — FINAL CONSOLIDATION REPORT
## Canonical Fund Ledger / Normative Calculations / Cross-Consumer Consistency

**Consolidation Gate:** Wave 2 Consolidation Complete
**Branch:** `ux/toolbox-area-fondo-prototype`
**Pre-Wave2 Baseline SHA:** `096056b8c6fa7d436cae24ce6d412580ff420c85` (`fix: make annual closure atomic and immutable`)
**Consolidated Commit SHA:** `fa0480139d76e938c5ca02312632f698c0acb506`
**Commit Message:** `refactor: introduce canonical fund ledger`
**Target Environment:** Staging (`https://mcasgpaivyosaroxrodm.supabase.co`)
**Production Environment:** UNTOUCHED / FORBIDDEN
**Final Verdict:** `WAVE2_CONSOLIDATED`

---

## 1. Baseline

- **Repository:** `dinopusceddu/entilocaliapp`
- **Branch:** `ux/toolbox-area-fondo-prototype`
- **Pre-Wave2 Baseline:** `096056b8c6fa7d436cae24ce6d412580ff420c85`
- **Consolidated Commit:** `fa0480139d76e938c5ca02312632f698c0acb506`

---

## 2. Files Committed (41 files, +1961 / -454)

### Domain & Canonical Ledger Core:
- `src/domain/canonicalFundLedger.ts` (NEW)
- `src/domain/calculationResult.ts`
- `src/domain/normalizedInput.ts`
- `src/domain/index.ts`
- `src/logic/calculation/canonicalFundLedger.ts` (NEW)
- `src/logic/calculation/calculationResultFactory.ts`

### Calculation Engines & Domain Normalization:
- `src/logic/calculation/fundEngine.ts`
- `src/logic/calculation/fundCalculations.ts`
- `src/application/input/inputNormalizer.ts`
- `src/contexts/AppContext.tsx`

### Wizard 2026 & Transfer Subsystem:
- `src/logic/wizard2026/ccnl2026Increments.ts`
- `src/logic/wizard2026/conglobamentoArt60.ts`
- `src/features/wizard2026/mappingPreview.ts`
- `src/features/wizard2026/transfer/applyWizard2026Transfer.ts`
- `src/features/wizard2026/transfer/transferPreviewEngine.ts`
- `src/features/wizard2026/steps/Step4Ccnl2026.tsx`
- `src/features/wizard2026/steps/Step8RiepilogoPreview.tsx`
- `src/features/wizard2026/components/Wizard2026SummaryPanel.tsx`

### UI Consumers:
- `src/components/dashboard/DashboardSummary.tsx`
- `src/pages/FondoAccessorioDipendentePage.tsx`

### Permanent Automated Tests & Fixtures:
- `src/domain/canonicalFundLedger.ts`
- `src/logic/calculation/__tests__/canonicalFundLedger.contract.test.ts` (NEW)
- `src/logic/calculation/__tests__/wave2AstraCharacterization.test.ts` (NEW)
- `src/contexts/__tests__/AppContext.idempotentHydration.test.ts` (NEW)
- `src/features/wizard2026/__tests__/mappingPreview.test.ts`
- `src/features/wizard2026/__tests__/wizard2026NormativeScenarios.test.ts`
- `src/features/wizard2026/steps/__tests__/Step4Ccnl2026.test.tsx`
- `src/features/wizard2026/transfer/__tests__/audit_motore_2026_characterization.test.ts`
- `src/features/wizard2026/transfer/__tests__/normative_engine_2026_validation_cases.test.ts`
- `src/features/wizard2026/transfer/__tests__/transferPreviewEngine.test.ts`
- `src/logic/__tests__/art23Complessivo.test.ts`
- `src/logic/__tests__/fixtures/limite2016CharacterizationFixtures.ts`
- `src/logic/__tests__/limite2016Differential.test.ts`
- `src/logic/__tests__/mod025ComplianceProspetto.test.ts`
- `src/logic/__tests__/mod031bEqSegretarioTotals.test.ts`
- `src/logic/wizard2026/__tests__/ccnl2026Increments.test.ts`
- `src/logic/wizard2026/__tests__/conglobamentoArt60.test.ts`
- `tests/fixtures/fondo/golden_results.json`

### Permanent Scripts & Reports:
- `scripts/run_wave2_oracle.ts` (NEW deterministic oracle)
- `WAVE2_WORKLOG.md` (NEW)
- `WAVE2_CANONICAL_LEDGER_IMPLEMENTATION_REPORT.md` (NEW)
- `WAVE2_INDEPENDENT_REVIEW_REPORT.md` (NEW)

---

## 3. Files Excluded

The following temporary and sensitive files were explicitly excluded from staging and commit:
- `.env.local` (local staging environment override)
- `.astra-test-users.local` (local temporary test credentials)
- `scripts/test_wave2_staging_acceptance.ts` (temporary staging test harness created for the review gate)
- Local evidence packs (`evidence_pack/`, `evidence_pack_iteration_2/`, etc.)
- Screenshots (`smoke_evidence/`, etc.)
- Historical uncommitted migrations with test seeds (`supabase/migrations/20260220000000_*.sql` through `...07.sql`, `20260220000022_remote_baseline.sql`)
- Out of scope project PDFs and Excel spreadsheets (`fileprogetto/`)

---

## 4. Golden Regression Updates

Only the two previously characterized normative deltas in `tests/fixtures/fondo/golden_results.json` were updated:

| Scenario | Old Baseline Value | New Consolidated Value | Finding Reference | Review Evidence |
|---|---|---|---|---|
| `caso-incremento-2025.json` | `totaleFondo`: 1.401.600 €<br>`totaleParteVariabile`: 17.400 €<br>`dipendente.variabile`: 8.400 €<br>`dipendente.totale`: 1.212.600 € | `totaleFondo`: 1.393.200 €<br>`totaleParteVariabile`: 9.000 €<br>`dipendente.variabile`: 0 €<br>`dipendente.totale`: 1.204.200 € | CALC-01, NORM-02, Astra N06/N08 | Eliminazione del recupero 0,14% aggregato e non istruito calcolato automaticamente come multiplo del corrente. |
| `caso-superamento-tetto-art23.json` | `ammontareSoggettoLimite2016`: 1.230.000 €<br>`superamentoLimite2016`: 130.000 € | `ammontareSoggettoLimite2016`: 1.170.000 €<br>`superamentoLimite2016`: 70.000 € | CALC-04, Astra N01 | La cache FAD denormalizzata non è più autoritativa; la conformità deriva esclusivamente dalla somma delle singole voci analitiche del ledger canonico. |

---

## 5. Regression Before / After

- **Before Golden Update:**
  - Tests run: 8
  - Exact match: 6
  - Expected normative deltas: 2 (`caso-incremento-2025.json`, `caso-superamento-tetto-art23.json`)
  - Unexpected deltas: 0
- **After Golden Update:**
  - Tests run: 8
  - Exact match: 8/8 (100%)
  - Expected normative deltas: 0
  - Unexpected deltas: 0

---

## 6. Secret Scan

- Scan performed across all candidate commit files for patterns: `password`, `service_role`, `access_token`, `refresh_token`, `eyJ`, `GuestPassword`, `astra_user`.
- Result: **0 secrets found**.
- Fixture tokens in mock tests are confirmed harmless and non-functional.

---

## 7. Full Quality Gates

| Gate | Execution Command | Result | Status |
|---|---|---|---|
| Git Diff Check | `git diff --check` | 0 errors | **PASS** |
| TypeScript Compiler | `npx tsc --noEmit` | 0 errors | **PASS** |
| Automated Tests | `npm test -- --run` | 96 test files, 972 passed | **PASS** |
| Production Build | `npm run build` | 1864 modules, built in 17.93s | **PASS** |
| Regression Suite | `npx vite-node scripts/run_regression_tests.ts` | 8/8 exact match | **PASS** |
| Independent Oracle | `npx vite-node scripts/run_wave2_oracle.ts` | 14/14 test cases pass | **PASS** |

---

## 8. Commit Information

- **Commit SHA:** `fa0480139d76e938c5ca02312632f698c0acb506`
- **Author:** Dino Pusceddu / Astra Audit Pair
- **Message:** `refactor: introduce canonical fund ledger`
- **Total Changes:** 41 files changed, 1961 insertions(+), 454 deletions(-)

---

## 9. Remaining Untracked Files

All pre-existing untracked files were preserved untouched:
- Pre-existing local evidence packs and screenshots
- Pre-existing historical test scripts
- Pre-existing mock/seed migrations
- Local environment files (`.env.local`, `.astra-test-users.local`)

---

## 10. Remaining Astra Findings (Wave 3+)

The following Astra audit findings remain open for subsequent waves per project scope:
- **Wave 3:** `DOC-01`, `DOC-02` (Tabella 15 mapper and document factory migration to consume Canonical Fund Ledger).
- **Wave 4+:** `CALC-03` (DL25 netto/lordo oneri), `CALC-05` (PNRR max check), `NORM-03` (Simulatore art. 33 post-agosto 2026), `NORM-04` (Wizard Step 3 DL25 labels), `DATA-01`, `DATA-03`, `UX-02`, `UX-03`, `ACCESS-01`, `ACCESS-02`.

---

## 11. Consolidated Astra Findings Status

- **CALC-01:** `CONSOLIDATED_FIXED`
- **CALC-02:** `CONSOLIDATED_FIXED`
- **CALC-04:** `CONSOLIDATED_FIXED`
- **ARCH-01:** `CONSOLIDATED_FIXED`
- **NORM-01:** `CONSOLIDATED_FIXED`
- **NORM-02:** `CONSOLIDATED_FIXED`

---

## 12. Final Verdict

# `WAVE2_CONSOLIDATED`
