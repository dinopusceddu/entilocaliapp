# PNRR_ZERO_AND_MISSING_CAP — Remediation gate

## Executive verdict

**PASS — CLOSED_LOCALLY.** Local CALC-05 status after remediation: **CANDIDATE_VERIFIED_FIXED**. Official CALC-05 remains OPEN pending independent review; no independent review was started.

The historical test now supplies a valid EUR 4,000 PNRR instruction without changing its economic expectations. All six historical binaries were recovered from local Git objects, exported to TEMP first, matched against the original PRE SHA-256 and then restored. The offline product suite passes **1,645/1,645 tests in 126 files**. Seven historical evidence-generation cases are excluded by a TEMP configuration; no ordinary regression was excluded, deleted, skipped or marked todo.

No productive code, new PNRR tests, golden files, fixtures, oracle or regression runner changed during this remediation.

## Baseline

- Branch: `ux/toolbox-area-fondo-prototype`.
- HEAD: `d3170f959b5815c514dbf3d6e5f93366a5f14c67`.
- All five requested Git baseline commands ran before reads/edits; branch and HEAD matched and staged diff was empty.
- Original slice PRE: `%TEMP%/pnrr_calc05_pre_inventory.json`, unchanged. Its actual array contains **1,076 files**, rather than the estimated 1,129+ in the request. Every entry was checked.
- Supplemental remediation PRE: `%TEMP%/pnrr_remediation_pre.json`, captured before edits, contains **1,138 files**, including root Markdown reports ignored by Git patterns. Every entry was checked, preserving the current source slices and prior reports.
- No checkout, restore, reset, stash, merge, rebase, add, commit, push, PR or deploy command was used. Git was used only for read-only inspection and export of candidate objects to TEMP.

## Frozen test intent reconstruction

Intent: **A — VALID_PNRR_REGRESSION**. The test name asks for combined regression of Art. 60, 0.14%, 0.22%, DL25 and PNRR. The input/comment classifies EUR 4,000 PNRR as an excluded variable resource and the assertions include it in excluded resources and the verified subtotal. There is no assertion or comment that missing PNRR instruction itself should authorize an amount.

The neighboring PNRR test explicitly checks an amount exceeding its maximum and supplies the four eligibility facts and historical base. This contradicts interpreting the combined regression as a deliberate unlimited numeric-addition contract.

Read-only history checks found commits `536a467c61eb99873cb022d029f391a60e9e12b5` and `fa0480139d76e938c5ca02312632f698c0acb506`. The original test at the former commit described the same economic combination, including PNRR in excluded resources; later canonical expectations separately removed the unresolved legacy arrears. The remediation preserves the current frozen expectations, rather than reverting historical totals.

The implementation report and entire current test source were read before modification.

## Frozen expectation reconciliation

Classification: **LEGITIMATE_INPUT_UPDATE**. Only seven lines were added inside this test's annual-data input:

```ts
annoRiferimento: 2026,
pnrrExerciseDecision: 'EXERCISED',
rispettoEquilibrioBilancioPrecedente: true,
rispettoDebitoCommercialePrecedente: true,
incidenzaSalarioAccessorioUltimoRendiconto: 5,
approvazioneRendicontoPrecedente: true,
fondoStabile2016PNRR: 80000,
```

OLD_INPUT_PNRR_CONTRACT: reference year 2026 inherited from the helper; applied amount 4,000; exercise decision absent/UNSET; A/B/C/D and certified stable 2016 base absent.

NEW_INPUT_PNRR_CONTRACT: explicit reference year 2026; EXERCISED; A=true, B=true, C=5% from latest approved statement, D=true; certified stable base 80,000; theoretical maximum 4,000; existing applied amount 4,000 unchanged. A/B/D refer to 2025 under the unchanged Y-1 resolver.

EXPECTED_ECONOMIC_TOTALS_CHANGED = NO: excluded verified resources remain **10,700**, fund verified subtotal remains **77,700**, and resources relevant to Art. 23 remain **121,000**. Existing global UNDETERMINED/total-null assertions remain because of the independent unresolved legacy arrears, not PNRR.

All assertions, comments and other inputs are byte-preserved. The edit tool initially normalized mixed line endings; an existing TEMP cleanroom copy was found with the exact original test PRE hash and used to preserve them. Removing only the seven new input lines from the final source reproduces original SHA-256 `97F193073FB061B5EA1E4BFD17C90A5DDC12EFF9CAA3F43D33EDF4DD0438823D`. The tested full-suite content and final source are identical after line-ending normalization. The targeted file passes 14/14.

## PRE evidence hashes

The authoritative expected hashes are from the original slice inventory, never changed or rebased. The actual hashes below were measured on workspace paths after restore and after the product suite.

| Binary | PATH | EXPECTED_PRE_SHA256 = POST_RESTORE_SHA256 |
|---|---|---|
| 1 | `evidence_wave3_hardening/Scenario_A_Determina_Costituzione_Fondo_2026.pdf` | `9042480B004007BFCF003040D22DB4AB173C80292F3D7835FE3444A1BACC2D01` |
| 2 | `evidence_wave3_hardening/Scenario_A_Tabella15_COMUNE_SCENARIO_A_2026.xlsx` | `3A9E3D4DB9CA07A71CC3E30D3AF8789E5111D4D73B739C63B4744ED98D0833B7` |
| 3 | `evidence_wave3_hardening/Scenario_B_Determina_BOZZA_2025.pdf` | `5C8CBEBFE74535730FC5889D2C324A6E27018887816F6C4BF2C5BB06FE1C7564` |
| 4 | `evidence_wave3_hardening/Scenario_B_Tabella15_COMUNE_SCENARIO_B_2025.xlsx` | `439D9D87AEB57739A54E79A6152364C67D9A7CA25E491723934C8C3500035FA1` |
| 5 | `evidence_wave3_hardening/Scenario_C_Tabella15_COMUNE_SCENARIO_C_2026.xlsx` | `698C5290C623FDF9BF5AD6D75806B29379FCCF4402D0F768A99A4754475C935F` |
| 6 | `evidence_wave3_hardening/Scenario_G_Tabella15_COMUNE_SCENARIO_G_2026.xlsx` | `3A299A0AE91008DD96D37FA8F7902DF28A4F539B41A1C0077D4158C83F9796F0` |

## Recovery source search

The six paths are untracked in the current index and absent from HEAD. Path-based `git log --all` returned no commits. Inspecting objects reachable through all local refs with `git rev-list --all --objects` nevertheless found three candidate blob versions for each path. Each blob was exported using `git cat-file blob <object>` into `%TEMP%/pnrr_remediation_candidates/`, then hashed there. Exact PRE matches existed for all six.

The read-only search also inspected 2,407 local blobs, including otherwise unreachable objects. The candidate manifest records 223 binary candidate exports (including duplicate source routes), with hashes and matching paths. No blob, ref, index or working-tree source was reset. Archive/snapshot/backup stages were unnecessary once all six exact candidates were available.

| Binary | Exact local Git blob | RECOVERY_SOURCE |
|---|---|---|
| 1 | `45785d39f82f57ad508d55a716371a7843661f9c` | GIT_OBJECT_EXACT_HASH |
| 2 | `cda4fd5f85b46560ef2ddc49c35c9f56678b166c` | GIT_OBJECT_EXACT_HASH |
| 3 | `69e23164aff5a30b194e35f40837f07b79ef3f03` | GIT_OBJECT_EXACT_HASH |
| 4 | `b5607109cae25ff271ed23845a3c798e86086886` | GIT_OBJECT_EXACT_HASH |
| 5 | `01401d2385a540aaa18fc0d65c841fdead34a53d` | GIT_OBJECT_EXACT_HASH |
| 6 | `3b291f4d2a0fdff1fa55c74e2db8161be1c01ae7` | GIT_OBJECT_EXACT_HASH |

Candidate hashes/source checks: `%TEMP%/pnrr_remediation_git_recovery.json`. Post-restore record: `%TEMP%/pnrr_remediation_restore.json`. Byte identity, not visual or economic equivalence, authorized copying.

## Exact binary recovery

All six candidate files were independently rehashed and matched before any final restore. Only then were all six copied to their exact workspace paths. Direct post-copy hashes all matched the original PRE. The final scope scan also confirms those matches after testing.

**HISTORICAL_BINARY_RECOVERY = 6_OF_6_EXACT.** No PDF/XLS regeneration, metadata edit, timestamp manipulation, manual reconstruction or PRE hash substitution was used.

## Evidence-generator isolation

`src/logic/calculation/__tests__/wave3HardeningEvidence.test.ts:61` resolves the fixed workspace output directory `evidence_wave3_hardening`; its seven scenarios write PDF/XLS/CSV/TXT and a manifest into that directory. The file is unchanged and was not executed in this remediation.

TEMP configuration `%TEMP%/pnrr-remediation-vitest.config.mjs` imports the already declared offline product configuration, retains all `src/**` product tests and excludes exactly this additional source file. It also directs Vitest cache into TEMP. Existing root audit runners and e2e remain outside the product suite. Ordinary Wave3 systemic/UI regression tests remain included; their temporary exports do not target historical workspace evidence.

PRODUCT_TEST_SUITE = 126 files / 1,645 cases. EVIDENCE_GENERATION_TESTS = one historical generator / seven cases, source inspected read-only and not rerun. The full source collection remains 1,652 cases; the difference of seven is the explicit evidence-generation isolation, not removal of a failed ordinary test.

The generator source SHA-256 matches both inventories. All historical evidence entries in the original PRE inventory match. The remediation does not modify productive Wave3 code or its consolidated findings.

## Full product test suite

**1,645/1,645 PASS; 126/126 files PASS; zero skipped/todo product cases.** The formerly failing test is present and passes with the original assertions.

Command uses the installed local `node_modules/.bin/vitest.cmd`, TEMP configuration, the existing network guard, dummy Supabase configuration and remote drafts disabled. JSON/log outputs go to `%TEMP%/pnrr_remediation_full_tests.json` and `%TEMP%/pnrr_remediation_full_tests.log`. Duration: 190.58 seconds. No installation or registry command.

Esbuild could not read configuration under the filesystem sandbox. The same offline, isolated commands were rerun through approved escalation; this was a tooling filesystem limitation, not a product test failure or a network connection.

## PNRR gates

All gates below were rerun in the full product suite; unrelated productive source and new test source remain unchanged.

| Gate | Result |
|---|---|
| New pnrrFaculty domain | 33/33 PASS |
| New pipeline/downstream/roundtrip | 19/19 PASS |
| New Step7 faculty | 3/3 PASS |
| Existing Step7 / PNRR calculator | 5/5 and 6/6 PASS |
| Historical reconciled test file | 14/14 PASS |
| TransferPreviewEngine / mapping | 43/43 and 6/6 PASS |
| Canonical ledger contract | 13/13 PASS |
| FundEngine FTE / Art33 gates | 9/9 and 21/21 PASS |
| Cabina page / view model / operational status | 45/45, 26/26 and 16/16 PASS |
| Distribution canonical resolver / page / explicit draft page | 14/14, 7/7 and 19/19 PASS |
| DocumentKindReadiness | 73/73 PASS |
| Closure pure / integration | 17/17 and 21/21 PASS |
| CLOSED AppContext / distribution / reports / post-close | 35/35, 1/1, 2/2 and 16/16 PASS |
| Canonical XLS / PDF | 16/16 and 17/17 PASS |
| FAD read model | 17/17 PASS |
| Auth create / delete / update / authorization policy | 19/19, 42/42, 34/34 and 27/27 PASS |

Exercise decision, eligibility, A/B/C/D precedence, Y-1, period, missing versus zero, maximum versus selection, no automatic application, canonical contribution, verified subtotal and downstream gates retain the implementation tested by the 55 new cases.

## Regression / oracle

- Regression: **8/8 PASS**, installed `vite-node.cmd scripts/run_regression_tests.ts`.
- Oracle: **14/14 PASS**, installed `vite-node.cmd scripts/run_wave2_oracle.ts`.
- TypeScript: **PASS**, installed `tsc.cmd --noEmit`, exit 0.
- `git diff --check`: **PASS**, exit 0.
- Golden, all fixtures, oracle and regression sources match remediation PRE hashes.
- Logs: `%TEMP%/pnrr_remediation_regression.log`, `pnrr_remediation_oracle.log`, `pnrr_remediation_typescript.log`.

## Network

This remediation: PRODUCT_NETWORK_ATTEMPTS = **0**; TOOLING_NETWORK_ATTEMPTS = **0**; REAL_NETWORK_CONNECTION_ESTABLISHED = **NO**. The dedicated remediation network log has no events. Node workers and local runners inherit the existing socket/DNS guard.

Previous implementation attempts remain recorded separately: product 0, tooling 2 blocked npm-registry sockets, actual connections NO. They are not erased or counted as this remediation's attempts.

No Supabase real endpoint, staging, production, registry, download, database mutation or migration was used.

## Scope integrity

**PASS.** Recomputed every entry in both inventories. Against the original 1,076-file PRE, only the 17 preexisting intended PNRR implementation paths plus the authorized historical test differ. All six recovered binaries and all other inventoried evidence match their original hashes; no PRE file was deleted.

Against the 1,138-file remediation PRE, the only preexisting differences are the six authorized binary restorations, the input-only historical test and the implementation report addendum. The sole new workspace file is this remediation report; TEMP candidates/config/logs remain outside the workspace. No productive logic, new PNRR test or permanent verification script changed during remediation. Exact scope records are stored in `%TEMP%/pnrr_remediation_final_scope.json`.

FILES_CHANGED_BY_REMEDIATION:

1. `src/logic/__tests__/mod025ComplianceProspetto.test.ts` — seven PNRR input lines only.
2. `evidence_wave3_hardening/Scenario_A_Determina_Costituzione_Fondo_2026.pdf` — exact PRE restoration.
3. `evidence_wave3_hardening/Scenario_A_Tabella15_COMUNE_SCENARIO_A_2026.xlsx` — exact PRE restoration.
4. `evidence_wave3_hardening/Scenario_B_Determina_BOZZA_2025.pdf` — exact PRE restoration.
5. `evidence_wave3_hardening/Scenario_B_Tabella15_COMUNE_SCENARIO_B_2025.xlsx` — exact PRE restoration.
6. `evidence_wave3_hardening/Scenario_C_Tabella15_COMUNE_SCENARIO_C_2026.xlsx` — exact PRE restoration.
7. `evidence_wave3_hardening/Scenario_G_Tabella15_COMUNE_SCENARIO_G_2026.xlsx` — exact PRE restoration.
8. `PNRR_ZERO_AND_MISSING_CAP_IMPLEMENTATION_REPORT.md` — dated remediation addendum; original failure record retained.
9. `PNRR_ZERO_AND_MISSING_CAP_REMEDIATION_REPORT.md` — this report.

Branch and HEAD unchanged; staged empty. Prior ASTRA reports/reconciliations unchanged. Official counts remain VERIFIED_FIXED=9, PARTIALLY_FIXED=8, OPEN=8 and ASTRA_BLOCKERS_OPEN=0.

## CALC-05 scope check

NON_FAD_CALC05_SCOPE = **IN_SCOPE_NOT_REQUIRED**: this means separate non-FAD economic paths are not required by the original CALC-05 counterexample. The original finding in `astra_evidence/run_20260921/FINDINGS.json` identifies the engine/constitution PNRR maximum-zero case. The actual `supplement_probes.ts:9` assigns `fondoAccessorioDipendenteData.vn_dl13_art8c3_incrementoPNRR_max5stabile2016=100`, with `annualData.calcolatoIncrementoPNRR3=0`. The current-state reconciliation's CALC-05 section cites the same fundEngine maximum gate and employee canonical ledger.

No original CALC-05 evidence inspected requires the separate manual Dirigenza or special Segretari economic paths. They remain unchanged and no global all-PNRR-path claim is made. This is a remediation scope check, not the independent review.

## Final status

PNRR_ZERO_AND_MISSING_CAP_REMEDIATION = COMPLETE; RESULT = PASS.

PNRR_ZERO_AND_MISSING_CAP_STATUS = **CLOSED_LOCALLY**.

CALC_05_STATUS_AFTER_REMEDIATION = **CANDIDATE_VERIFIED_FIXED**.

All eleven requested closure criteria pass: legitimate test reconciliation, all product/new PNRR cases green, 8/8 regression, 14/14 oracle, TypeScript, diff check, six exact recoveries, scope integrity, no new historical side effect and no additional productive change. No independent VERIFIED_FIXED classification or official reconciliation update.

## Next gate

**PNRR_ZERO_AND_MISSING_CAP_INDEPENDENT_REVIEW**, recommended only. Not started. Stop here: no DL25_COHERENT_REGIME, other finding, Auth migration or further functional implementation.

### Terminal record

```
PNRR_ZERO_AND_MISSING_CAP_REMEDIATION = COMPLETE
RESULT = PASS
BRANCH = ux/toolbox-area-fondo-prototype
HEAD = d3170f959b5815c514dbf3d6e5f93366a5f14c67
FROZEN_TEST_INTENT = VALID_PNRR_REGRESSION
FROZEN_TEST_INPUT_CHANGED = YES
OLD_INPUT_PNRR_CONTRACT = YEAR_2026_APPLIED_4000_DECISION_UNSET_REQUIREMENTS_AND_STABLE_BASE_MISSING
NEW_INPUT_PNRR_CONTRACT = YEAR_2026_EXERCISED_A_TRUE_B_TRUE_C_5_PERCENT_D_TRUE_STABLE_80000_MAXIMUM_4000_APPLIED_4000
EXPECTED_ECONOMIC_TOTALS_CHANGED = NO
FROZEN_EXPECTATION_RECONCILIATION = LEGITIMATE_INPUT_UPDATE
BINARY_1_RECOVERY = EXACT_GIT_OBJECT_45785d39f82f57ad508d55a716371a7843661f9c
BINARY_2_RECOVERY = EXACT_GIT_OBJECT_cda4fd5f85b46560ef2ddc49c35c9f56678b166c
BINARY_3_RECOVERY = EXACT_GIT_OBJECT_69e23164aff5a30b194e35f40837f07b79ef3f03
BINARY_4_RECOVERY = EXACT_GIT_OBJECT_b5607109cae25ff271ed23845a3c798e86086886
BINARY_5_RECOVERY = EXACT_GIT_OBJECT_01401d2385a540aaa18fc0d65c841fdead34a53d
BINARY_6_RECOVERY = EXACT_GIT_OBJECT_3b291f4d2a0fdff1fa55c74e2db8161be1c01ae7
HISTORICAL_BINARY_RECOVERY = 6_OF_6_EXACT
PRE_HASH_MATCH_AFTER_RESTORE = 6/6_AFTER_RESTORE_AND_AFTER_TESTS
EVIDENCE_GENERATOR_RERUN_ON_WORKSPACE = NO
FULL_PRODUCT_TESTS = 1645/1645_PASS_126_FILES; 7_HISTORICAL_GENERATOR_CASES_ISOLATED
PNRR_NEW_TESTS = 55/55_PASS
PNRR_DOMAIN_TESTS = 33/33_PASS
PNRR_PIPELINE_TESTS = 19/19_PASS
WIZARD_TESTS = 3/3_NEW_FACULTY_AND_5/5_EXISTING_STEP7_PASS
TRANSFER_TESTS = 43/43_PASS
MAPPING_TESTS = 6/6_PASS
CANONICAL_LEDGER_TESTS = 13/13_CONTRACT_PLUS_19/19_PIPELINE_PASS
REGRESSION = 8/8_PASS
ORACLE = 14/14_PASS
TYPESCRIPT = PASS
DIFF_CHECK = PASS
PRODUCT_NETWORK_ATTEMPTS = 0
TOOLING_NETWORK_ATTEMPTS = 0_THIS_REMEDIATION; PREVIOUS_IMPLEMENTATION_2_BLOCKED_UNCHANGED
REAL_NETWORK_CONNECTION_ESTABLISHED = NO
SCOPE_INTEGRITY = PASS
NON_FAD_CALC05_SCOPE = IN_SCOPE_NOT_REQUIRED
PRODUCT_LOGIC_CHANGED_DURING_REMEDIATION = NO
CALC_05_STATUS_AFTER_REMEDIATION = CANDIDATE_VERIFIED_FIXED
PNRR_ZERO_AND_MISSING_CAP_STATUS = CLOSED_LOCALLY
FILES_CHANGED_BY_REMEDIATION = 9_EXACT_PATHS_LISTED_IN_SCOPE_INTEGRITY
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
REPORT = PNRR_ZERO_AND_MISSING_CAP_REMEDIATION_REPORT.md
NEXT_GATE_RECOMMENDATION = PNRR_ZERO_AND_MISSING_CAP_INDEPENDENT_REVIEW
```
