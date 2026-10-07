# PNRR_ZERO_AND_MISSING_CAP — CALC-05

**Remediation update — 5 October 2026:** the implementation-run failure record below is retained as history. The authorized remediation reconciled the historical test through seven PNRR input fields with unchanged expected totals, restored all six historical binaries to exact original PRE hashes from local Git objects, and passed the isolated product suite (1,645/1,645 cases; seven historical generator cases excluded). Regression 8/8, oracle 14/14, TypeScript, diff and scope integrity pass. Current local status: **CLOSED_LOCALLY / CANDIDATE_VERIFIED_FIXED**. Official CALC-05 remains OPEN. See `PNRR_ZERO_AND_MISSING_CAP_REMEDIATION_REPORT.md`; no independent review was started and no further productive logic was changed.

## Executive result

RESULT = FAIL. PNRR_ZERO_AND_MISSING_CAP_STATUS = IMPLEMENTED_NOT_CLOSED. CALC_05_STATUS_AFTER_SLICE = PARTIALLY_FIXED (local assessment only; official OPEN remains unchanged).

Implementation and verification are confined to the annual PNRR faculty and the canonical Fondo dipendenti. The new 55 tests pass; the full product suite passes 1,651 of 1,652 tests. Local closure is withheld because of the preserved conflicting regression expectation, six historical binary evidence files overwritten by the test runner that could not be recovered, and the limitation concerning separate non-FAD economic paths. No independent VERIFIED_FIXED status is assigned.

The mandatory normative scenarios pass in the new domain/pipeline tests. An existing regression assertion includes EUR 4,000 of PNRR without a decision or eligibility evidence. Its input and expected result have been preserved. This conflict prevents claiming a green full suite or local closure unless independently reconciled.

## Baseline

- Branch: `ux/toolbox-area-fondo-prototype`.
- HEAD: `d3170f959b5815c514dbf3d6e5f93366a5f14c67`.
- All five requested Git baseline commands ran before edits; staged diff was empty.
- PRE inventory: SHA-256 of every tracked/nonignored untracked file, saved to `%TEMP%/pnrr_calc05_pre_inventory.json` before code changes. The command transcript records the baseline and source reads used for reconstruction.
- Existing local source changes were preserved. Evidence preservation failed for six binary artifacts, described under Scope integrity. No reconstruction from HEAD, checkout, pull, reset, stash, merge, rebase, add, commit, push, PR or deployment.

## Normative contract

Source: the user-supplied frozen contract, art. 8, commi 3–4, D.L. 13/2023, converted by L. 41/2023. Strict offline: no external legal lookup. Period 2023–2026 inclusive; variable annual resource, excluded from art. 23, comma 2, D.Lgs. 75/2017. No extension to 2027 or permanent consolidation.

The special Segretari rule remains outside this ordinary Fondo dipendenti resolver. Reconstruction found separate Segretari fields and no special Segretari base substituted into the ordinary 5% base. `PNRR_SCOPE_NORMATIVE_COLLISION = NO` for the inspected calculation path.

## Faculty vs entitlement

The administrative decision, eligibility, theoretical maximum and validated applied amount are separate. The maximum is an opportunity, not a resource. NOT_EXERCISED resolves to zero without asking for eligibility or historical-base evidence. No maximum automatically populates an economic field.

## Existing PNRR domain reconstruction

Before edits, `annualData.calcolatoIncrementoPNRR3` meant **A: theoretical maximum**, calculated by AnnualDataForm and read by fundEngine as a cap. It was not the applied economic amount. `PNRR_DOMAIN_MODEL_COLLISION = NO` for that specific field. The model did lack an exercise decision and collapsed different reasons for a zero maximum.

The misleadingly named `vn_dl13_art8c3_incrementoPNRR_max5stabile2016` was already a manual economic amount, consumed as an addition by calculateFadTotals and the generic canonical ledger. Wizard Step 7 calculated theoretical employee/dirigenza caps. Its transfer was CONTROL_ONLY and hardcoded the applied snapshot amount to zero. `incrementoApplicato` existed in Wizard state as a legacy manual field but was not used by its PNRR calculator or transferred as the selected amount.

AnnualDataForm persisted a zero maximum for missing base or unmet conditions. Wizard also seeded the stable 2016 bases from total historical Art. 23 fund values. That is not proof of the certified **stable component** and has been removed. Sample annual defaults (positive historical base and satisfied requirements) were also removed to avoid reconstructing missing evidence during initialization/hydration.

## Field semantics

The table describes the reconstructed pre-slice meanings; the last rows specify the minimum new contract. SOURCE paths identify the original producing/consuming code. Missing is absent/undefined/null unless specified. PERSISTED refers to storage of the field/state, not the use of a real database in this verification.

| FIELD | CURRENT_MEANING | SOURCE | CALCULATED_OR_MANUAL | MISSING_SEMANTICS | ZERO_SEMANTICS | PERSISTED | CONSUMERS |
|---|---|---|---|---|---|---|---|
| annualData.fondoStabile2016PNRR | Ordinary employee stable certified 2016 base | domain/types.ts; AnnualDataForm.tsx | Manual | Previously a positive sample default could fill absence; now absent | Certified base zero, maximum zero | YES | AnnualDataForm, FAD page, annual faculty resolver |
| pnrr.componenteStabileFondoDipendenti2016 | Wizard stable certified employee base | wizard2026/types.ts; Step7Pnrr.tsx | Manual; formerly auto-seeded from Art. 23 total | Missing base | Certified zero; UI formerly parsed it as missing | YES | PNRR calculator, Wizard, transfer, Excel |
| pnrr.componenteStabileFondoDirigenza2016 | Separate ordinary dirigenza stable base | Same Wizard sources | Manual; formerly auto-seeded | Missing independent dirigenza cap | Known zero | YES | Theoretical Wizard dirigenza calculation/control preview |
| art23.fondoPersonaleDipendente2016 / fondoDirigenza2016 | Total historical fund for Art. 23, not certified stable PNRR base | useWizard2026Draft.ts | Manual | No PNRR evidence | Historical total zero | YES | Art. 23; PNRR auto-seeding removed |
| pnrr.componenteStabile2016 | Legacy generic Wizard base, unused by current PNRR computation | PnrrIncrementInput; Wizard types | Manual | No alternative-base fallback | Legacy explicit zero | YES | State/import persistence; no authoritative ordinary-base consumer |
| 0.05 | Fixed statutory maximum percentage | pnrrIncrement.ts; former AnnualDataForm arithmetic | Calculated rule constant | Not an optional monetary datum | Not a selectable zero rate | NO | Maximum calculation, now FinancialMath |
| annualData.calcolatoIncrementoPNRR3 | Legacy calculated maximum cache | AnnualDataForm; AppContext UPDATE_CALCOLATO action | Calculated | Formerly written as zero; now preserved absent | Cache zero alone cannot certify eligibility/base | YES | Retained compatibility storage; no economic authority |
| pnrr.result.limiteMassimoPnrrFondoDipendenti | Theoretical employee cap | calculatePnrrIncrement | Calculated | Undefined if not calculable | Historically also zero for failed requirements; new faculty preserves reason separately | YES | Step 7, mapping, CONTROL_ONLY legacy preview, snapshot |
| pnrr.result.limiteMassimoPnrrFondoDirigenza | Independent theoretical dirigenza cap | calculatePnrrIncrement | Calculated | Undefined if absent/not calculable | Known/theoretical zero | YES | Wizard control preview/snapshot; not employee budget |
| pnrr.result.totaleLimiteMassimoPnrr / incrementoMassimoPnrr | Aggregate knowledge of employee + dirigenza maximum | calculatePnrrIncrement | Calculated | Former alias fell back to zero; now undefined if missing | Theoretical total zero | YES | Wizard summaries and snapshot, never canonical economic input |
| fondoAccessorioDipendenteData.vn_dl13_art8c3_incrementoPNRR_max5stabile2016 | Actual manual employee PNRR claim despite the name | domain/types; fundFieldDefinitions; fundCalculations | Manual; selected amount can now transfer | No economic claim; EXERCISED without amount is unresolved | Explicit applied zero is valid with eligibility/base known | YES | FAD page, fundEngine, canonical PNRR_APPLIED entry |
| pnrr.incrementoApplicato | Legacy manual selection, previously ignored | Wizard state/types | Manual | Selected amount missing, distinct from zero | Explicit administrative zero | YES | New Step 7 input, resolver, transfer, Excel |
| snapshot.computed.pnrrImportoApplicato | Previously hardcoded zero | applyWizard2026Transfer.ts | Derived snapshot | Now absent if actual destination amount absent | Actual destination zero, not a maximum | YES | Imported-summary provenance, never authority |
| rispettoEquilibrioBilancioPrecedente / equilibrioEsercizioPrecedente | Requirement A | AnnualData / Wizard | Manual attestation | Unknown, not false | Boolean false means requirement failed | YES | Eligibility resolver; A relates to Y-1 |
| rispettoDebitoCommercialePrecedente / parametriDebitoCommercialeEsercizioPrecedente | Requirement B combines residual debt and annual payment-delay conditions | AnnualData / Wizard | Manual attestation of both conditions | Unknown | Boolean false means requirement failed | YES | Eligibility; B relates to Y-1 |
| incidenzaSalarioAccessorioUltimoRendiconto / incidenzaSalarioAccessorioPercentuale | Requirement C, ratio from latest approved statement | AnnualData / Wizard | Manual percentage | Unknown; no substitution with Y-1 | Ratio zero is known and <=8% | YES | Eligibility, Step 7; no statement-year metadata exists here |
| incidenzaSalarioAccessorioScelta | Direct/assisted percentage mode | Wizard types | Manual selection | Existing direct mode is used | Not a monetary value | YES | Percentage resolver, Step 7, Excel |
| salarioAccessorioIndicatori / spesaPersonaleIndicatori | Assisted C numerator/denominator | Wizard types | Manual | Unknown ratio if evidence absent or denominator unusable | Numerator zero valid; denominator zero cannot produce a ratio | YES | Wizard percentage resolver and transfer |
| approvazioneRendicontoPrecedente / rendicontoApprovatoTermini | Requirement D, Council approval within applicable deadline | AnnualData / Wizard | Manual attestation | Unknown | Boolean false means requirement failed | YES | Eligibility; D relates to Y-1 |
| soggettoAttuatorePnrr | Subjective applicability, not exercise decision | Wizard Step 7 | Manual tri-state | Unknown | Boolean false means not a subject; never equated with administrative waiver | YES | Wizard applicability/validation and transferred pnrrSubject |
| annualData.annoRiferimento / ente.annoRiferimento | Reference annuality | AnnualData / Wizard Step 1 | Manual/configuration | Core unresolved if missing; historical Wizard API retains its 2026 default | Invalid annuality, outside period | YES | Period resolver, Y-1, competence year |
| previousYear / prevYear | Requirements reference year | resolver / Step 7 | Calculated Y-1 | Undefined if year unknown | No monetary meaning | NO | A/B/D labels and result provenance |
| fondoSegretarioComunaleData.va_art8c3_DL13_2023_incrementoPNRR | Separate Segretari manual resource | Segretario page / calculateSegretarioSubFund | Manual | Existing separate semantics unchanged | Existing zero | YES | Separate subfund; no ordinary-base sharing introduced |
| fondoDirigenzaData.va_dl13_2023_art8c3_incrementoPNRR | Existing separate manual dirigenza resource | Dirigenza page / calculateDirigenzaSubFund | Manual | Existing separate semantics unchanged | Existing zero | YES | Separate subfund; Wizard remains theoretical CONTROL_ONLY |
| incentiviPNRROpMisureStraordinarie | Other existing PNRR/extraordinary concept | AnnualData | Manual | Unchanged | Unchanged | YES | Not interpreted as art. 8 ordinary increment |
| pnrr.exerciseDecision / annualData.pnrrExerciseDecision | NEW explicit annual administrative choice | Wizard / AnnualData / schema | Manual | UNSET, never inferred NOT_EXERCISED | Not a monetary value | YES | Resolver, UI, transfer, hydration, canonical ledger |
| annualData.pnrrSubject | NEW preservation of Wizard subjective evidence | Transfer / AnnualData schema | Transferred boolean | Core legacy absence preserved; Wizard exercises require subjective evidence | False remains false and prohibits exercise | YES | Annual resolver |
| faculty.eligibility / requirements | NEW independent tri-state eligibility and A/B/C/D facts | shared/pnrrFaculty.ts | Calculated | UNDETERMINED | False dominates unknown | Derived; Wizard result/provenance can persist | Canonical validation and diagnostics |
| faculty.maximumAvailable | NEW pure theoretical maximum from certified stable base | shared/pnrrFaculty.ts | Calculated FinancialMath | Undefined, never zero fallback | Known zero | Derived; Wizard result/provenance can persist | Applied-amount validation; no addition to Fondo |
| faculty.amountApplied / contribution | NEW selected amount versus validated contribution | shared/pnrrFaculty.ts | Selection manual; contribution derived | Selected amount stays missing; unresolved contribution excluded | Explicit zero valid; NOT_EXERCISED resolves zero | Derived; selection persists in existing fields | Canonical ledger and pipeline |

## Root cause

The actual bypass was `maxPnrr = annualData.calcolatoIncrementoPNRR3 ?? 0`, then validation only under `maxPnrr > 0`, with an additional one-cent tolerance. The generic canonical ledger classified the manual PNRR resource only by its numeric sign, without any faculty/eligibility/base/period gate. Therefore a zero or missing cap could authorize a positive total.

Upstream missing evidence and false requirements were flattened into zero. There was no administrative exercise decision. Wizard maximum/actual transfer were separate but did not preserve a real economic selection. Historical-total auto-seeding and positive example defaults could also create unsupported evidence.

## Exercise decision

`NOT_EXERCISED | EXERCISED | UNSET`, persisted in the annual record and Wizard draft. Absence remains UNSET at read time. UNSET with a positive claim is unresolved (or invalid if a known monetary maximum is exceeded), with zero authoritative contribution. UNSET without an economic claim is not reclassified as a waiver and does not manufacture a positive resource.

## Eligibility

ANY_FALSE -> NOT_ELIGIBLE; otherwise ANY_UNKNOWN -> UNDETERMINED; otherwise ALL_TRUE -> ELIGIBLE. Eligibility is evaluated independently of the maximum. NOT_EXERCISED does not require its resolution and has no PNRR issue.

## Four requirements

A is the balance condition; B is the combined commercial-debt/payment-delay condition; C is latest-approved-statement accessory/incentive salary incidence <=8%; D is timely Council approval. The complete matrix tests each false, each unknown, and false plus unknown. A known failure wins over missing evidence.

## Annuality

2022/2027 NOT_APPLICABLE; 2023/2024/2025/2026 APPLICABLE_PERIOD. Outside the period a copied positive claim is invalid with zero contribution. No carry-forward was introduced. Existing year closure starts new years from defaults, not by copying current variable PNRR.

## Previous-year requirements

Y-1: 2023->2022, 2024->2023, 2025->2024, 2026->2025. A dedicated 2026 assertion detects accidental 2024 use. C retains the concept of latest approved statement; the domain does not currently carry its actual year, so none was invented. The Wizard C label no longer substitutes the previous year for that concept.

## Maximum theoretical amount

`maximumAvailable = roundHalfUp(stableCertifiedFund2016 * 0.05, 2)` using FinancialMath/Big.js. No cached-cap fallback or alternative Art. 23 total is authoritative. Examples and fractional-base half-cent rounding are tested. Legacy theoretical dirigenza information remains separate and cannot raise the employee maximum.

## Applied amount

The persisted selection is separate from the maximum. Only a VALID resolved contribution enters `PNRR_APPLIED`. Cases 0, 1, 4,999.99 and 5,000 pass against 5,000; 5,000.01 fails without a tolerance. 7,500 against 20,000 contributes 7,500. An eligible maximum alone contributes nothing.

## Zero vs missing

Known base zero -> maximum zero; positive application -> INVALID. Missing base -> undefined maximum; EXERCISED positive -> UNDETERMINED. NOT_EXERCISED with either missing base or missing requirements remains VALID for PNRR. NaN, Infinity and negatives fail closed locally before the legacy arithmetic and canonical sum. No shared DATA-03 monetary-boundary redesign.

## Canonical contribution

The generic PNRR item is excluded from the generic ledger loop. A semantic `PNRR_APPLIED` VARIABLE/EXCLUDED entry is resolved from annual input and actual selected amount, with decision/eligibility/maximum/reasons in provenance. Invalid/unresolved entries have null economic amount. fundEngine also sends only its validated contribution to legacy analytic totals, preventing invalid nonfinite amounts from reaching Big.js.

## Verified subtotal

Other VALID entries remain in verifiedStableTotal/verifiedVariableTotal/verifiedTotal. Tests keep EUR 10,000 of ordinary verified resources when PNRR alone is invalid or unresolved. Authoritative total is null in those cases.

## UI behavior

AnnualDataForm and Step 7 expose the faculty question with YES/NO/UNSET. NO sets selected amount to zero as a user action, hides the optional instruction and produces no issue. Mounting AnnualDataForm no longer dispatches a calculated cap. YES exposes requirements, stable certified base, theoretical cap and a separate selected employee amount. UI parsing preserves explicit zero. The FAD page reads the resolver's cap rather than a combined employee/dirigenza snapshot maximum, and preserves an over-cap request for validation rather than silently clamping it.

## Wizard transfer

Decision/evidence/maximum/selection are distinct. Transfers recompute eligibility from inputs rather than trusting result caches. Selected amount is transferred, not maximum. Forced apply with unresolved faculty rejects. Applied snapshot value reflects the actual destination field, including explicit zero or missing. The plan records decision and selected amount. Legacy Wizard drafts without a decision remain theoretical CONTROL_ONLY; no administrative waiver is inferred.

## Save / reload

JSON roundtrips preserve decision, partial amount, explicit base zero and missing base. Existing snapshot workflow is exercised with an in-memory repository (no real DB), followed by reload. New fields are part of AnnualData schema. Missing keys retain missing semantics. Wizard storage/reducer spreads preserve the added decision and existing applied field without a data migration.

## Import / hydration

Normalizer spreads annual and fund inputs without PNRR coercion. Wizard Excel schema includes the annual decision and selected amount. Reducer import/hydration preserves enum/zero/missing; the generic importer supports select/string and numeric zero. Sample PNRR base and eligibility defaults were removed to avoid filling absent information on hydration.

## Compliance / checklist

Only INVALID PNRR emits a PNRR_INVALID error compliance check; missing causes are emitted via canonical missingPrerequisites, avoiding the same cause appearing as both compliance warning and canonical missing issue. NOT_EXERCISED emits none. No Cabina/checklist production edit was needed.

## Cabina

Actual engine result plus existing projection yields CONSTITUTION_VERIFIED for valid zero/selected resources, BLOCKED for invalid/noneligible claims and TO_COMPLETE for unresolved claims. The PNRR pipeline exercises that composition; existing Cabina tests are regression gates.

## Distribution

The existing resolver exposes an authoritative budget only for VALID canonical status; invalid/unresolved PNRR cannot become budget. NOT_EXERCISED does not independently block distribution. No Distribution production edit.

## Document readiness

All five document kinds receive FINAL_READY only for VALID canonical results with no blocking/missing issues. Invalid/unresolved PNRR yields DRAFT_ONLY; preview remains available. NOT_EXERCISED is not an export prerequisite. No PDF/XLS/readiness production edit.

## Closure readiness

Existing readiness receives READY for validated zero/partial application; invalid/unresolved produces NOT_READY. Its already consolidated forced-handler guard is covered by existing integration tests. No closure production edit.

## CLOSED behavior

No migration, background rewrite or auto-persistence was added. Resolver and transfer simulation are pure. The actual apply helper explicitly rejects CLOSED. Existing reducer/context and snapshot workflow CLOSED protections remain intact. Snapshot tests show zero upsert calls when CLOSED, and unchanged source objects.

## Tests

Final full offline product suite: **1,651/1,652 PASS; 1 FAIL**, across 127 source test files (126 passed, one failed). The JSON reporter's suite counter includes nested suites; the terminal log's 127-file count is used here. The only failed assertion is the frozen expectation described below. Final evidence: `%TEMP%/pnrr_calc05_final_tests.json` and `%TEMP%/pnrr_calc05_final_tests.log`.

New domain suite: **33/33 PASS**. New canonical/downstream/roundtrip suite: **19/19 PASS**. New faculty UI suite: **3/3 PASS**. Total new cases: **55/55 PASS**, also passing in the final full suite. Existing PNRR domain 6/6, Step 7 UI 5/5, transfer 43/43 and mapping 6/6 pass.

| Protected gate | Final result |
|---|---|
| canonical ledger contract | 13/13 PASS |
| fundEngine Art. 23 FTE / Art. 33 gates | 9/9 and 21/21 PASS |
| Cabina page wave 4.1 | 45/45 PASS |
| Distribution canonical resolver / page | 14/14 and 7/7 PASS |
| DocumentKindReadiness / Reports page readiness | 73/73 and 8/8 PASS |
| Closure readiness / integration | 17/17 and 21/21 PASS |
| CLOSED distribution / reports / post-close navigation | 1/1, 2/2 and 16/16 PASS |
| Canonical FAD XLS / summary PDF | 16/16 and 17/17 PASS |
| FAD report read model | 17/17 PASS |
| Auth create / delete / update handlers | 19/19, 42/42 and 34/34 PASS |
| Auth admin policy | 27/27 PASS |

Regression golden: **8/8 PASS**. Oracle: **14/14 PASS**. No golden/fixture changed.

Verification tooling: `scripts/pnrr-offline-guard.cjs` rejects sockets/dgram and records DNS requests. Supabase environment is `https://example.invalid`, dummy key, remote drafts disabled. `npx --offline tsc --noEmit` passed, but npm attempted two registry sockets despite the offline flag; both were blocked before connection. Product network attempts = 0; tooling network attempts = 2; actual connections = NO. Subsequent commands invoked installed local binaries directly. Final direct TypeScript check and `git diff --check` both exit 0. No installation.

The first generic full-suite attempt was interrupted because the default include also discovers a historical audit test that writes old evidence; that checkpoint's audit hashes were unchanged. A sequential product attempt exposed Testing Library DOM/cleanup leakage across files and was interrupted; those failures are not treated as product regressions. This installed Vitest rejects max/min worker CLI flags. A first dedicated-config run inadvertently retained the root include because mergeConfig concatenates arrays; it rewrote seven independent-audit evidence files. All seven were recovered from the existing doc.zip only after their archive bytes matched PRE SHA-256 exactly. The final config explicitly replaces include and uses isolated workers (1–4), selecting all src tests and excluding historical root audit runners/e2e.

The source suite itself contains `wave3HardeningEvidence.test.ts`, which writes historical workspace evidence. Final PRE comparison detected ten changed artifacts there. Four text artifacts differed only in the generation date and were restored only after candidate bytes matched their PRE hashes exactly (02/10/2026). Six binary PDF/XLS artifacts remain changed: no byte-identical PRE copy was found in existing workspace archives or available temporary audit/export copies. These are an accidental scope violation, not intended slice changes. The full suite must run with artifact writes isolated in future reviews; no further full rerun was performed.

Frozen expectation conflict: `src/logic/__tests__/mod025ComplianceProspetto.test.ts`, test “should verify regression of Art 60, 0.14%, 0.22%, DL 25 and PNRR logic”, expects excluded verified resources 10,700 and fund subtotal 77,700. Its input supplies a PNRR claim of 4,000 without choice or eligibility/base evidence. Correct verified values are 6,700 and 73,700. The original test input/assertions are untouched. `tests/fixtures/fondo/golden_results.json` does not contain this positive PNRR counterexample and remains green (8/8); it must not be confused with the conflicting inline regression expectation.

## Regression of verified findings

Official ASTRA counts remain VERIFIED_FIXED=9, PARTIALLY_FIXED=8, OPEN=8, ASTRA_BLOCKERS_OPEN=0. No reconciliation report was modified. Protected gate results are recorded in the final test record; no claim of independent reclassification. DATA-03, CALC-04, NORM-02 and ARCH-01 have not been implemented as new slices.

## Scope integrity

The post-check compares hashes against PRE, not Git HEAD (which would lose preexisting local slices). Branch/HEAD/staged state remain unchanged. No preexisting untracked deletion, no changes to old source tests, golden files, fixtures or reconciliation reports. Seven audit files and four hardening text files were recovered with exact PRE hashes. Six preexisting hardening binaries remain overwritten: **SCOPE_INTEGRITY = FAIL**. The baseline inventory covers tracked and nonignored untracked files; the new report is explicitly listed although ignored by the repository's report pattern.

Unrecovered accidental changes (outside the intended slice):

- `evidence_wave3_hardening/Scenario_A_Determina_Costituzione_Fondo_2026.pdf`
- `evidence_wave3_hardening/Scenario_A_Tabella15_COMUNE_SCENARIO_A_2026.xlsx`
- `evidence_wave3_hardening/Scenario_B_Determina_BOZZA_2025.pdf`
- `evidence_wave3_hardening/Scenario_B_Tabella15_COMUNE_SCENARIO_B_2025.xlsx`
- `evidence_wave3_hardening/Scenario_C_Tabella15_COMUNE_SCENARIO_C_2026.xlsx`
- `evidence_wave3_hardening/Scenario_G_Tabella15_COMUNE_SCENARIO_G_2026.xlsx`

Each expected PRE hash is preserved in `%TEMP%/pnrr_calc05_pre_inventory.json`. The regenerated binary versions are preserved in the workspace and copied to `%TEMP%/pnrr_calc05_overwritten_evidence/` for diagnosis; none is represented as an original recovered artifact. Their economic scenarios pass, but that does not satisfy byte preservation. No source reconstruction or evidence rebasing was attempted to hide this failure.

The existing standalone Segretari and manual Dirigenza economic subfund paths were not rewritten as an extension of the employee canonical ledger. Wizard dirigenza remains theoretical control information. The authoritative PNRR gate proven here is the Fondo dipendenti canonical path; this is a limitation of any assertion about all possible PNRR paths in the entire app.

## CALC-05 reassessment

The original employee positive-with-zero/missing-cap bypass is corrected, and the optional nonexercise scenario passes. Full local closure requires all gates and acceptance criteria, including resolution of the preserved regression-expectation conflict, recovery/reconciliation of the six overwritten artifacts and independent confirmation of scope. Local assessment: PARTIALLY_FIXED; official finding remains OPEN/HIGH. Do not label CALC-05 VERIFIED_FIXED, CANDIDATE_VERIFIED_FIXED or update official counts.

## Next gate

PNRR_ZERO_AND_MISSING_CAP_INDEPENDENT_REVIEW, after the unpassed/frozen expectation gate is explicitly reconciled. No DL25_COHERENT_REGIME, Art. 23 Dirigenza, DATA-01/DATA-03, Auth, migration or other finding work was started.

### Exact intended slice files

- `src/components/dataInput/AnnualDataForm.tsx`
- `src/constants.ts`
- `src/domain/types.ts`
- `src/features/wizard2026/excel/wizard2026ExcelSchema.ts`
- `src/features/wizard2026/hooks/useWizard2026Draft.ts`
- `src/features/wizard2026/mappingPreview.ts`
- `src/features/wizard2026/steps/Step7Pnrr.tsx`
- `src/features/wizard2026/transfer/applyWizard2026Transfer.ts`
- `src/features/wizard2026/transfer/transferPreviewEngine.ts`
- `src/features/wizard2026/types.ts`
- `src/features/wizard2026/validation.ts`
- `src/logic/calculation/canonicalFundLedger.ts`
- `src/logic/calculation/fundEngine.ts`
- `src/logic/verification/complianceChecks.ts`
- `src/logic/wizard2026/pnrrIncrement.ts`
- `src/pages/FondoAccessorioDipendentePage.tsx`
- `src/schemas/fundDataSchemas.ts`
- `src/logic/shared/pnrrFaculty.ts`
- `src/logic/shared/__tests__/pnrrFaculty.test.ts`
- `src/logic/calculation/__tests__/pnrrFacultyPipeline.test.ts`
- `src/features/wizard2026/steps/__tests__/Step7Pnrr.faculty.test.tsx`
- `scripts/pnrr-offline-guard.cjs`
- `scripts/pnrr-offline.vitest.config.ts`
- `PNRR_ZERO_AND_MISSING_CAP_IMPLEMENTATION_REPORT.md`

### Terminal record

```
PNRR_ZERO_AND_MISSING_CAP_IMPLEMENTATION = COMPLETE
RESULT = FAIL
BRANCH = ux/toolbox-area-fondo-prototype
HEAD = d3170f959b5815c514dbf3d6e5f93366a5f14c67
NORMATIVE_SOURCE = ART_8_COMMA_3_4_DL_13_2023
NORMATIVE_PERIOD = 2023_2026
RESOURCE_NATURE = VARIABLE_ANNUAL_FACULTY
ART23_LIMIT = EXCLUDED_FOR_THIS_INCREMENT
ROOT_CAUSE = ZERO_MISSING_COLLAPSE_AND_MAX_GT_ZERO_GATE_AND_UNGATED_CANONICAL_ENTRY
PNRR_DOMAIN_MODEL_COLLISION = NO_FOR_calcolatoIncrementoPNRR3; EXERCISE_DECISION_PREVIOUSLY_MISSING
CURRENT_MAX_FIELD = faculty.maximumAvailable; legacy calcolatoIncrementoPNRR3 retained_as_cache
CURRENT_APPLIED_FIELD = vn_dl13_art8c3_incrementoPNRR_max5stabile2016; Wizard incrementoApplicato
CURRENT_EXERCISE_DECISION_FIELD = annualData.pnrrExerciseDecision; pnrr.exerciseDecision
FACULTY_MODEL = DECISION_ELIGIBILITY_MAXIMUM_SELECTION_VALIDATED_CONTRIBUTION
AUTO_INCREMENT = NO
EXERCISE_DECISION = NOT_EXERCISED | EXERCISED | UNSET
NOT_EXERCISED_BEHAVIOR = VALID_ZERO_CONTRIBUTION_NO_PNRR_ISSUE
NOT_EXERCISED_REQUIRES_ELIGIBILITY = NO
ELIGIBILITY_RESOLVER = resolvePnrrFaculty
ELIGIBILITY_ALL_TRUE = ELIGIBLE
ELIGIBILITY_ANY_FALSE = NOT_ELIGIBLE
ELIGIBILITY_UNKNOWN = UNDETERMINED_UNLESS_ANY_FALSE
REQUIREMENT_A = PREVIOUS_YEAR_BUDGET_BALANCE
REQUIREMENT_B = PREVIOUS_YEAR_COMMERCIAL_DEBT_AND_ANNUAL_PAYMENT_DELAY
REQUIREMENT_C = ACCESSORY_INCENTIVE_SALARY_RATIO_LATEST_APPROVED_STATEMENT_LE_8_PERCENT
REQUIREMENT_D = TIMELY_COUNCIL_APPROVAL_PREVIOUS_YEAR_STATEMENT
REFERENCE_YEAR = ANNUAL_YEAR
PREVIOUS_YEAR_RULE = Y_MINUS_1
YEAR_2022 = NOT_APPLICABLE
YEAR_2023 = APPLICABLE_PERIOD
YEAR_2024 = APPLICABLE_PERIOD
YEAR_2025 = APPLICABLE_PERIOD
YEAR_2026 = APPLICABLE_PERIOD
YEAR_2027 = NOT_APPLICABLE
YEAR_2026_PREVIOUS_YEAR_REQUIREMENTS = 2025
STABLE_2016_SOURCE = fondoStabile2016PNRR; Wizard componenteStabileFondoDipendenti2016
MAXIMUM_FORMULA = 5_PERCENT_STABLE_CERTIFIED_2016
MAXIMUM_AUTO_APPLIED = NO
MAXIMUM_ZERO_AMOUNT_ZERO = VALID_WITH_EXERCISED_ELIGIBLE
MAXIMUM_ZERO_AMOUNT_POSITIVE = INVALID_ZERO_CONTRIBUTION
MAXIMUM_MISSING_NOT_EXERCISED = VALID_ZERO_CONTRIBUTION
MAXIMUM_MISSING_EXERCISED = UNDETERMINED
AMOUNT_BELOW_MAX = VALID_WITH_ELIGIBILITY
AMOUNT_EQUAL_MAX = VALID_WITH_ELIGIBILITY
AMOUNT_ABOVE_MAX = INVALID_ZERO_CONTRIBUTION
PARTIAL_USE_OF_MAXIMUM = SUPPORTED
PNRR_CARRY_FORWARD = NONE
CANONICAL_NOT_EXERCISED = VALID_ZERO
CANONICAL_ELIGIBLE_APPLIED = VALIDATED_AMOUNT_ONLY
CANONICAL_NOT_ELIGIBLE_POSITIVE = INVALID_NULL_ENTRY_ZERO_CONTRIBUTION
CANONICAL_UNDETERMINED_POSITIVE = UNDETERMINED_NULL_ENTRY_ZERO_CONTRIBUTION
VERIFIED_SUBTOTAL_PRESERVED = YES
WIZARD_MAXIMUM_VS_APPLIED = DISTINCT
WIZARD_TRANSFER_MAXIMUM_NOT_AUTOMATIC = YES
SAVE_RELOAD_DECISION = PRESERVED
SAVE_RELOAD_ZERO_VS_MISSING = PRESERVED
HYDRATION_DECISION = PRESERVED_UNSET_NOT_INFERRED_AS_NO
HYDRATION_ZERO_VS_MISSING = PRESERVED
PNRR_COMPLIANCE_NOT_EXERCISED = NO_ISSUE
PNRR_COMPLIANCE_NOT_ELIGIBLE = ERROR_BLOCKING
PNRR_COMPLIANCE_UNDETERMINED = CANONICAL_MISSING_PREREQUISITE
PNRR_COMPLIANCE_EXCEEDED = ERROR_BLOCKING
CABINA_NOT_EXERCISED = NO_PNRR_BLOCK
CABINA_NOT_ELIGIBLE = BLOCKED
CABINA_UNDETERMINED = TO_COMPLETE
DISTRIBUTION_NOT_EXERCISED = AUTHORITATIVE_IF_OTHER_GATES_VALID
DISTRIBUTION_UNRESOLVED = NO_AUTHORITATIVE_BUDGET
DOCUMENT_READINESS_NOT_EXERCISED = FINAL_READY_IF_OTHER_GATES_VALID
DOCUMENT_READINESS_UNRESOLVED = DRAFT_ONLY
CLOSURE_READINESS_NOT_EXERCISED = READY_IF_OTHER_GATES_VALID
CLOSURE_READINESS_UNRESOLVED = NOT_READY
POST_FIX_ACTIVE_PNRR_BYPASSES = 0_IN_FAD_CANONICAL_PATH; NON_FAD_LEGACY_PATHS_UNCHANGED
SEC_01_REGRESSION = NONE_OBSERVED_IN_TESTS
DATA_02_REGRESSION = NONE_OBSERVED_IN_TESTS
CALC_01_REGRESSION = NONE_OBSERVED_IN_TESTS
CALC_02_REGRESSION = NONE_OBSERVED_IN_TESTS
DOC_01_REGRESSION = NONE_OBSERVED_IN_TESTS
DOC_02_REGRESSION = NONE_OBSERVED_IN_TESTS
NORM_01_REGRESSION = NONE_OBSERVED_IN_TESTS
FUNC_01_REGRESSION = NONE_OBSERVED_IN_TESTS
FUNC_02_REGRESSION = NONE_OBSERVED_IN_TESTS
ASTRA_BLOCKERS_OPEN = 0_OFFICIAL_UNCHANGED
CALC_05_STATUS_AFTER_SLICE = PARTIALLY_FIXED_LOCAL; OFFICIAL_OPEN_UNCHANGED
FILES_CHANGED_THIS_SLICE = 24_INTENDED_PATHS_LISTED_BELOW
UNINTENDED_FILES_CHANGED = 6_HISTORICAL_BINARIES_LISTED_IN_SCOPE_INTEGRITY
SCOPE_INTEGRITY = FAIL
TARGETED_TESTS = 55_NEW_PASS_PLUS_EXISTING_RELEVANT_TESTS_PASS
PNRR_NORMATIVE_TESTS = PASS_IN_NEW_DOMAIN_PIPELINE_SUITES
PNRR_DOMAIN_TESTS = 33/33_PASS
PNRR_ELIGIBILITY_TESTS = PASS_FULL_FOUR_REQUIREMENTS_MATRIX
YEAR_BOUNDARY_TESTS = PASS_2022_THROUGH_2027
WIZARD_TESTS = 3/3_NEW_AND_5/5_EXISTING_STEP7_PASS
TRANSFER_TESTS = 43/43_EXISTING_PLUS_NEW_PIPELINE_PASS
ROUNDTRIP_TESTS = PASS_JSON_HYDRATION_IMPORT_MOCK_SNAPSHOT_SAVE_RELOAD
DOWNSTREAM_TESTS = PASS_IN_19/19_NEW_PIPELINE_SUITE
CANONICAL_LEDGER_TESTS = 13/13_CONTRACT_PLUS_NEW_PIPELINE_PASS
CABINA_REGRESSION = PASS
DISTRIBUTION_REGRESSION = PASS
DOCUMENT_READINESS_REGRESSION = PASS
CLOSURE_READINESS_REGRESSION = PASS
CLOSED_REGRESSION = PASS
XLS_REGRESSION = 16/16_PASS
PDF_REGRESSION = 17/17_PASS
FAD_READ_MODEL_REGRESSION = 17/17_PASS
AUTH_REGRESSION = PASS
FULL_TESTS = 1651/1652_PASS; 1_FROZEN_EXPECTATION_FAIL
REGRESSION = 8/8_PASS
ORACLE = 14/14_PASS
TYPESCRIPT = PASS
DIFF_CHECK = PASS
PRODUCT_NETWORK_ATTEMPTS = 0
TOOLING_NETWORK_ATTEMPTS = 2_NPM_REGISTRY_SOCKETS_BLOCKED
REAL_NETWORK_CONNECTION_ESTABLISHED = NO
DATABASE_CHANGED = NO
MIGRATIONS_CREATED = NO
MIGRATIONS_APPLIED = NO
STAGING_CONTACTED = NO
PRODUCTION_CONTACTED = NO
GIT_ADD = NO
COMMIT = NO
PUSH = NO
PR = NO
DEPLOY = NO
PNRR_ZERO_AND_MISSING_CAP_STATUS = IMPLEMENTED_NOT_CLOSED
REPORT = PNRR_ZERO_AND_MISSING_CAP_IMPLEMENTATION_REPORT.md
NEXT_GATE_RECOMMENDATION = PNRR_ZERO_AND_MISSING_CAP_INDEPENDENT_REVIEW
```
