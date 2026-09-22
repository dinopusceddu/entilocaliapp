# WAVE 2 — INDEPENDENT REVIEW GATE REPORT
## Canonical Fund Ledger / Normative Calculations / Cross-Consumer Consistency

**Reviewer:** Independent Review Gate (Astra Architecture & Normative Protocol)
**Target Repository:** `dinopusceddu/entilocaliapp`
**Target Branch:** `ux/toolbox-area-fondo-prototype`
**Consolidated Baseline:** `096056b8c6fa7d436cae24ce6d412580ff420c85` (`fix: make annual closure atomic and immutable`)
**Target Environment:** Supabase STAGING (`https://mcasgpaivyosaroxrodm.supabase.co` / `mcasgpaivyosaroxrodm`)
**Production Target:** FORBIDDEN (`yggokplxleredipknfbq` — never accessed)
**Review Status:** COMPLETED
**Verdict:** `WAVE2_APPROVED_FOR_CONSOLIDATION`

---

## 1. Baseline

- **Baseline Commit:** `096056b8c6fa7d436cae24ce6d412580ff420c85` (Wave 1 consolidation commit).
- **Branch:** `ux/toolbox-area-fondo-prototype`.
- **Environment Safety Verification:** `.env.local` explicitly overrides `VITE_SUPABASE_URL` to staging `https://mcasgpaivyosaroxrodm.supabase.co`. Production is strictly protected and untouched.
- **Audited Scope:** Finding CALC-01, CALC-02, CALC-04, ARCH-01, NORM-01, NORM-02.

---

## 2. Diff Inventory (R1)

Total modified tracked files: 31 files (346 insertions, 448 deletions).

### Classification:
1. **Canonical Ledger & Domain:**
   - `src/domain/canonicalFundLedger.ts` (NEW domain contract)
   - `src/domain/calculationResult.ts`
   - `src/domain/normalizedInput.ts`
   - `src/domain/index.ts`
   - `src/logic/calculation/canonicalFundLedger.ts` (NEW ledger engine)
   - `src/logic/calculation/calculationResultFactory.ts`
2. **Calculation Engine:**
   - `src/logic/calculation/fundEngine.ts`
   - `src/logic/calculation/fundCalculations.ts`
3. **Application & Normalizer:**
   - `src/application/input/inputNormalizer.ts`
   - `src/contexts/AppContext.tsx`
4. **Wizard & Transfer Logic:**
   - `src/logic/wizard2026/ccnl2026Increments.ts`
   - `src/logic/wizard2026/conglobamentoArt60.ts`
   - `src/features/wizard2026/mappingPreview.ts`
   - `src/features/wizard2026/transfer/applyWizard2026Transfer.ts`
   - `src/features/wizard2026/transfer/transferPreviewEngine.ts`
   - `src/features/wizard2026/steps/Step4Ccnl2026.tsx`
   - `src/features/wizard2026/steps/Step8RiepilogoPreview.tsx`
   - `src/features/wizard2026/components/Wizard2026SummaryPanel.tsx`
5. **UI Consumers:**
   - `src/components/dashboard/DashboardSummary.tsx`
   - `src/pages/FondoAccessorioDipendentePage.tsx`
6. **Tests & Test Fixtures:**
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
7. **Verification Scripts:**
   - `scripts/run_wave2_oracle.ts`
   - `scripts/test_wave2_staging_acceptance.ts` (Independent review harness)

### Explicit Non-Modification Verification:
The following files and components were confirmed **UNMODIFIED**:
- `src/logic/calculation/tabella15Mapper.ts` (0 changes)
- `src/logic/letters/documentFactory.ts` (0 changes)
- PDF generation templates (0 changes)
- XLS/CSV exporters (0 changes)
- Database migrations (`supabase/migrations/` has 0 new migrations in Wave 2)

---

## 3. Independent Behavioral Verification (R2)

| Test ID | Case Description | Input Scenario | Expected Outcome | Actual Outcome | Status |
|---|---|---|---|---|---|
| **V1** | 0,14% Current | MS2021 = 1.000.000 € | 1.400,00 € once only | 1.400,00 € (1 entry `CCNL_014_CURRENT`) | **PASS** |
| **V2** | 0,14% Transfer & Reload | Wizard Transfer -> Reload | Single resource with `source=TRANSFERRED` | 1 entry, survives reload unchanged | **PASS** |
| **V3** | Recovery 0,14% Legacy | Legacy aggregate without verified origin | `status=UNDETERMINED`, `total=null` | Marked `UNDETERMINED`, not summed in total | **PASS** |
| **V4** | 0,22% Annual Ceiling | MS2021 = 1.000.000 € across 2024–2027 | 2024: 0 €; 2025: 2.200 €; 2026: 2.200 €; 2027: 2.200 € | 2024: 0 €; 2025: 2.200 €; 2026: 2.200 €; 2027: 2.200 € | **PASS** |
| **V5** | Art. 60 Consolidation | 1 FTE Funzionario across 2025–2026 | 2025: 0 €; 2026: 127,44 € | 2025: 0 €; 2026: 127,44 € | **PASS** |
| **V6** | Canonical Zero vs Legacy | Canonical = 0, Legacy = 900 | 0,00 € (canonical 0 authoritative) | 0,00 € (never revives 900) | **PASS** |
| **V7** | Art. 23 Cache Bypass | Subject components = 2.000 €, cache = 0 € | Subject = 2.000 €, cache ignored | Subject = 2.000 €, warning emitted | **PASS** |
| **V8** | Art. 33 Missing Prereq | Historical base missing / staff = 0 | `UNDETERMINED`, not 0 € | `status=UNDETERMINED`, missing flags emitted | **PASS** |

---

## 4. Independent Numerical Oracle (R3)

All 14 oracle test vectors were independently verified:

| Case ID | Input | Expected Reviewer | Codex Actual | Result |
|---|---|---|---|---|
| `O014-1000000` | MS2021 = 1.000.000 € | 1.400,00 € | 1.400,00 € | **PASS** |
| `O014-0` | MS2021 = 0 € | 0,00 € | 0,00 € | **PASS** |
| `O014-missing` | MS2021 = null | `"UNDETERMINED"` | `"UNDETERMINED"` | **PASS** |
| `O014-negative` | MS2021 = -100 € | `"INVALID"` | `"INVALID"` | **PASS** |
| `O022-2024` | MS2021 = 1M, year = 2024 | `{ max: 0, frd: 0, eq: 0 }` | `{ max: 0, frd: 0, eq: 0 }` | **PASS** |
| `O022-2025` | MS2021 = 1M, year = 2025, base 80/20 | `{ max: 2200, frd: 1760, eq: 440 }` | `{ max: 2200, frd: 1760, eq: 440 }` | **PASS** |
| `O022-2026` | MS2021 = 1M, year = 2026, base 80/20 | `{ max: 2200, frd: 1760, eq: 440 }` | `{ max: 2200, frd: 1760, eq: 440 }` | **PASS** |
| `O022-2027` | MS2021 = 1M, year = 2027, base 80/20 | `{ max: 2200, frd: 1760, eq: 440 }` | `{ max: 2200, frd: 1760, eq: 440 }` | **PASS** |
| `O060-2025` | 1 FTE Funzionario, year = 2025 | 0,00 € | 0,00 € | **PASS** |
| `O060-2026` | 1 FTE Funzionario, year = 2026 | 127,44 € | 127,44 € | **PASS** |
| `O060-2027` | 1 FTE Funzionario, year = 2027 (consolidated) | 127,44 € | 127,44 € | **PASS** |
| `O033-missing` | FRD2018 = null, staff2018 = 0 | `"UNDETERMINED"` | `"UNDETERMINED"` | **PASS** |
| `cached-total` | Subject = 2.000 €, cache = 0 € | 2.000,00 € | 2.000,00 € | **PASS** |
| `canonical-zero / legacy-900` | Canonical = 0, Legacy = 900 | 0,00 € | 0,00 € | **PASS** |

---

## 5. Canonical Ledger Architecture Review (R4)

The architecture establishes a strict unidirectional pipeline:
$$\text{Legacy / DB Snapshot} \longrightarrow \text{Read Adapter} \longrightarrow \text{Canonical Fund Ledger} \longrightarrow \text{CalculationResult} \longrightarrow \text{UI Consumers}$$

1. **`FundLedgerEntry`:** Strongly typed with `id`, `amount` (nullable), `component` (`STABLE` | `VARIABLE`), `operation` (`ADDITION` | `DEDUCTION`), `competenceYear`, `originYear`, `source` (`MANUAL` | `CALCULATED` | `TRANSFERRED` | `RECOVERY` | `LEGACY_MIGRATED`), `art23Treatment` (`SUBJECT` | `EXCLUDED` | `UNDETERMINED`), `status` (`VALID` | `MISSING` | `INVALID` | `UNDETERMINED`), and `economicEffect` boolean flag.
2. **`CanonicalFundResult`:** Exposes nullable totals (`stableTotal`, `variableTotal`, `total`) alongside verified subtotals (`verifiedStableTotal`, `verifiedVariableTotal`, `verifiedTotal`).
3. **Immutability & Integrity:** Duplicate semantic entry IDs immediately throw an invariant error during derivation.

---

## 6. Resource Identity Review

- **Unique IDs:** Semantic IDs (`CCNL_014_CURRENT`, `CCNL_014_RECOVERY_LEGACY_2024_2025`, `CCNL_022_CURRENT`, `ART60_CONSOLIDATION`, `ART60_ART23_FIGURATIVE`, `OVERTIME_STABLE_TRANSFER`, `OVERTIME_ART23_CURRENT`, `RIA`, `DL25_CURRENT`, `DL25_ART23_EXCLUSION`, `LEGACY_FAD_RESOURCE:<field>`) prevent duplicate entries.
- **Economic Effect Separation:** Figurative entries (such as `ART60_ART23_FIGURATIVE` with `economicEffect: false` and `DL25_ART23_EXCLUSION` with `economicEffect: false`) affect only limit computations and never modify the economic fund totals.
- **Algebra:**
  - $\text{stableTotal} = \sum (\text{STABLE economic entries with status VALID})$
  - $\text{variableTotal} = \sum (\text{VARIABLE economic entries with status VALID})$
  - If any economic entry is `MISSING` or `UNDETERMINED`, total is strictly `null` and overall status is `UNDETERMINED`.

---

## 7. Review 0,14% (CCNL 23.02.2026 Art. 58 c. 1)

- Calculated as $\text{MS2021} \times 0.0014$, effective from 01/01/2024.
- Entirely allocated to the stable part of Fondo Risorse Decentrate (FRD), with no automatic split to EQ.
- Only a single entry `CCNL_014_CURRENT` is created across Wizard, normalizer, engine, and UI.
- All duplicate downstream additions in `FondoAccessorioDipendentePage.tsx` have been eliminated.

---

## 8. Review Recovery 0,14% (Arretrati 2024–2025)

- Historical/legacy aggregate `vn_art58_CCNL2026_arretrati2024_2025` is mapped to `CCNL_014_RECOVERY_LEGACY_2024_2025`.
- Marked with `status: 'UNDETERMINED'`, `originYear: null`, and `art23Treatment: 'EXCLUDED'`.
- The entry is **never automatically added** to the determined `variableTotal` or `total` of the fund.
- The UI exposes the verified subtotal and displays clear warnings indicating that eligibility and origin year investigation must be completed.

---

## 9. Review 0,22% (CCNL 23.02.2026 Art. 58 c. 2)

- Maximum theoretical ceiling is $\text{MS2021} \times 0.0022$ starting from 2025 (2024 ceiling is 0 €).
- The theoretical maximum is strictly separated from the **actual chosen amount** (`incremento022Anno`).
- **Partial Chosen Verification:**
  - Test scenario: Maximum = 2.200 €, Chosen = 1.100 €, 2024 Base: FRD 80.000 € / EQ 20.000 € (80/20 ratio).
  - Calculated: FRD chosen = 880,00 €, EQ chosen = 220,00 € (Sum = 1.100,00 €).
  - Verified: The application transfers 880,00 € to FRD and 220,00 € to EQ, without incorrectly using the theoretical maximum of 1.760 € / 440 €.

---

## 10. Review Art. 60 (Conglobamento Indennità di Comparto)

- **2025:** Strictly 0 € (effective date 01/01/2026 per CCNL). Any legacy entry present in 2025 is ignored in economic calculation and generates a reconciliation warning.
- **2026:** Reduction calculated on headcount at 01/01/2026 (1 Funzionario = 127,44 €/year). Represented as `ART60_CONSOLIDATION` (deduction from stable fund) and `ART60_ART23_FIGURATIVE` (`economicEffect: false`, figurative inclusion for Art. 23 limit).
- **2027+:** Uses persisted 2026 consolidated base. If missing, flags `ART60_BASE_2026_UNDETERMINED`.

---

## 11. Review Art. 23 c. 2 Compliance

- `art23Subject` and `art23Excluded` are computed strictly by summing the algebraic values of the canonical ledger entries.
- Legacy cache `cl_totaleParzialeRisorsePerConfrontoTetto2016` is completely decoupled from the compliance check. If the cache differs from the actual entries sum (e.g. cache = 0 €, entries sum = 2.000 €), the cache is ignored, the 2.000 € sum is used, and a reconciliation warning is emitted.

---

## 12. Legacy Fallback & Zero-Preservation Review

- Full codebase audit was performed for patterns such as `canonical || legacy` or `canonical > 0 ? canonical : legacy`.
- All fallback resolvers (including `resolveDL25IncrementValue` and `resolve022LegacyValue`) use explicit nullish checks (`value !== undefined && value !== null`).
- A canonical value of `0` is treated as a valid authoritative value and **never** triggers a fallback to legacy numbers (e.g., canonical 0 with legacy 900 results in 0).

---

## 13. Wizard Transfer Review

- Wizard transfer creates structured transfer plans and attaches a `wizard2026TransferSnapshot` containing provenance and destination paths.
- Transferred resources acquire `source: 'TRANSFERRED'`.
- Upon reload or re-application, resources maintain their unique semantic identity without generating duplicates.

---

## 14. Cabina di Regia vs Fondo Personale Consistency

- `DashboardSummary.tsx` (Cabina di Regia) and `FondoAccessorioDipendentePage.tsx` (Fondo Personale) both consume `CalculationResult.canonicalFund`.
- Removed all obsolete `useEffect` hooks in `FondoAccessorioDipendentePage.tsx` that previously re-added CCNL increments, Art. 60 deductions, or Art. 23 caches.
- Both pages display exact matching numbers to the cent for stable, variable, and total resources.

---

## 15. Hydration & Race Condition Review

- **The Issue:** A race condition previously occurred when re-confirming the active entity or year during bootstrap, resetting `fundData` to defaults while a fetch was in flight.
- **The Fix:** `appReducer` in `src/contexts/AppContext.tsx` now handles `SET_CURRENT_ENTITY` and `SET_CURRENT_YEAR` idempotently:
  - If `action.payload.id === state.currentEntity?.id`, the state is retained.
  - If `action.payload === state.currentYear`, the state is retained.
- **Integrity Check:** Switching between different entities (A $\rightarrow$ B $\rightarrow$ A) or years (2025 $\rightarrow$ 2026 $\rightarrow$ 2025) cleanly triggers state transition, resetting `hydratedSnapshotKey` and allowing fresh hydration from Supabase. No stale data is retained across transitions.

---

## 16. Case A/2025 Reconstruction

### Input Scenario:
- 0,14% current: 1.400,00 €
- Overtime stable transfer: 2.000,00 €
- Legacy recovery: 2.800,00 €
- Art. 60 legacy: 127,44 €

### Reconstruction & Normative Result:
1. **Art. 60 in 2025:** Strictly 0,00 € (127,44 € legacy ignored).
2. **Verified Stable:** $1.400,00 + 2.000,00 = 3.400,00$ €.
3. **Legacy Recovery 2.800,00 €:** `UNDETERMINED` (lacks origin year / documentation).
4. **Overall Total:** `null` / `UNDETERMINED`.
5. **App Display:** The app does **not** display 6.072,56 € as a legally valid total. It displays the verified subtotal and flags the recovery as requiring investigation.
6. **Cross-View Equality:** Cabina stable = Personale stable = 3.400,00 €.

---

## 17. Regression Delta Review

- Total regression scenarios in test suite: 8.
- Exact matches: 6.
- Expected normative deltas: 2.
  1. `caso-incremento-2025.json`: Old total 1.401.600 € $\rightarrow$ New total 1.393.200 € (difference of 8.400 € corresponds to uninstructed automatic recovery removal per CALC-01 / NORM-02).
  2. `caso-superamento-tetto-art23.json`: Old subject 1.230.000 € $\rightarrow$ New subject 1.170.000 € (difference corresponds to using true component sums rather than stale cache per CALC-04).
- Unexpected deltas: **0**.
- Golden files were preserved untouched.

---

## 18. Full Technical Gates

| Gate | Command | Expected | Actual Result | Status |
|---|---|---|---|---|
| **Diff Check** | `git diff --check` | 0 errors | 0 errors | **PASS** |
| **TypeScript** | `npx tsc --noEmit` | 0 errors | 0 errors | **PASS** |
| **Vitest Suite** | `npm test -- --run` | 96 files, 972 tests | 96 files, 972 tests | **PASS** |
| **Vite Build** | `npm run build` | Clean production bundle | Built in 18.95s (1864 modules) | **PASS** |
| **Regression Suite** | `scripts/run_regression_tests.ts` | 6 exact, 2 expected deltas | 6 exact, 2 expected deltas | **PASS** |
| **Independent Oracle** | `scripts/run_wave2_oracle.ts` | 14/14 PASS | 14/14 PASS | **PASS** |

---

## 19. Independent Staging Browser Acceptance

Executed independently against Supabase staging (`mcasgpaivyosaroxrodm`):

- **Case A (2025 + 1 Funzionario):** Art. 60 reduction = 0,00 € (**PASS**)
- **Case B (2026 + 1 Funzionario):** Art. 60 reduction = 127,44 € (**PASS**)
- **Case C (0,14% current):** Single instance, 1.400,00 € (**PASS**)
- **Case D (Transfer + reload):** Preserves `TRANSFERRED` status, 0 duplicates (**PASS**)
- **Case E (Cabina vs Personale):** Exact match at 1.272,56 € (**PASS**)
- **Case F (Uninstructed recovery):** `UNDETERMINED`, total null (**PASS**)
- **Case G (Canonical 0 + legacy 900):** Evaluates to 0,00 € (**PASS**)
- **Case H (Partial 0,22% chosen):** Max 2.200 €, chosen 1.100 € $\rightarrow$ FRD 880 €, EQ 220 € (**PASS**)
- **Case I (Entity & Year Switching):** State switching between Ente A (2025, 2026) and Ente B (2026) clean, 0 stale state (**PASS**)
- **Cleanup Verification:** All temporary test entities and states were deleted; 0 leaked records.

---

## 20. New Findings

No new BLOCKER, HIGH, MEDIUM, or LOW severity defects were introduced by Wave 2.

---

## 21. Original Astra Findings Status

| Finding ID | Description | Severity | Verdict |
|---|---|---|---|
| **CALC-01** | Arretrati 0,14% contati due volte | `BLOCKER` | **VERIFIED_FIXED** |
| **CALC-02** | Pagina Personale aggiunge ancora lo 0,14% | `BLOCKER` | **VERIFIED_FIXED** |
| **CALC-04** | Totale denormalizzato ribalta conformità Art. 23 | `HIGH` | **VERIFIED_FIXED** |
| **ARCH-01** | Alias legacy e formule CCNL concorrenti | `HIGH` | **VERIFIED_FIXED** |
| **NORM-01** | Articolo 60 applicato nel 2025 | `BLOCKER` | **VERIFIED_FIXED** |
| **NORM-02** | Competenza e recuperi incrementi non separati | `HIGH` | **VERIFIED_FIXED** |

---

## 22. Remaining Risks & Non-Wave-2 Findings

The following findings remain intentionally open for subsequent waves per project scope:
- **Wave 3+ Findings:** `DOC-01`, `DOC-02` (document generation and Tabella 15 mapping to consume canonical ledger), `CALC-03`, `CALC-05`, `NORM-03`, `NORM-04`, `DATA-01`, `DATA-03`, `UX-02`, `UX-03`, `ACCESS-01`, `ACCESS-02`.
- Historical golden files contain the old pre-Wave 2 expectations for the 2 normative delta scenarios and should be updated during consolidation/release management.

---

## 23. Final Verdict

# `WAVE2_APPROVED_FOR_CONSOLIDATION`
