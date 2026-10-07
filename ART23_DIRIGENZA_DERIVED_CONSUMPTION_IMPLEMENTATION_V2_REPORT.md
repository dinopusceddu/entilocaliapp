# ART23_DIRIGENZA — golden contract resolution and implementation V2

## Executive verdict

Golden conflict confirmed as an obsolete expectation. The new instruction authorizes one targeted correction after semantic reconstruction, resolver tests and verification of the real output. These gates passed in that order. The frozen fixture now produces Dirigenza subject **280,000**, whole-entity subject **1,610,000**, limit **1,680,000**, margin **70,000**, compliance **true** and total fund **1,675,000**.

The economic authority is `resolveDirigenzaArt23Subject`, a pure resolver of classified atomic resources. The legacy cache is only reconciliation metadata. No resource is added to the FAD ledger; FAD/EQ/Segretario/overtime economics and historical limits retain their contracts. The existing prerequisite/status envelope receives Dirigenza unresolved/invalid states upstream so downstream resolvers remain unchanged.

Final suite gate: **PASS — 1813/1813 tests in 135 files**. Regression 8/8, oracle 14/14 and TypeScript pass. CALC-04 is **CANDIDATE_VERIFIED_FIXED**, locally closed pending independent review. Formal ASTRA counts remain VF=13, PF=8, OPEN=4, blockers=0. ARCH-01 remains PARTIALLY_FIXED.

## Previous golden conflict

The previous BLOCKED report and all `art23_dirigenza_evidence` artifacts are preserved. Its fixture hash and reported values were checked again before production edits: old consumption 1,330,000, margin 350,000, limit 1,680,000, compliant true, total fund 1,675,000; counterfactual consumption 1,610,000, margin 70,000, other values unchanged. No `GOLDEN_CONTRACT_EVIDENCE_DRIFT`.

Evidence: `art23_dirigenza_v2_evidence/preflight-frozen.log`. The old report remains historical evidence of the STOP, not the current verdict.

## Golden contract resolution

The golden is a regression contract, not a normative source. The fixture contains `st_art57c2a_CCNL2020_unicoImporto2020=280000`, classified SUBJECT in the existing eight-line page formula. It also contains 15,000 contractual increment and 5,000 prior-year residual, both EXCLUDED in that formula. The cache is absent. The original `cache || 0` reader incorrectly contributed zero subject from Dirigenza, despite a 300,000 total Dirigenza fund.

The seven other SUBJECT lines are optional resource lines. Their absence does not make the frozen scenario unresolved. No classification was changed to preserve an obsolete golden.

Order of work: PRE inventory → semantic reconstruction → production resolver → 53 initial resolver tests and integration tests → real-output probe while golden still 1,330,000 → one targeted golden replacement → real-output probe again → regression/oracle/TypeScript/full suite. The old expectation was not changed before the new code was verified. Three additional resolver tests subsequently protect the declared blank optional model.

## Fixture immutability

GOLDEN_PATH=`tests/fixtures/fondo/golden_results.json`.
SCENARIO=`ente-con-dirigenza.json`.
INPUT_FIXTURE_CHANGED=NO.

FIXTURE_SHA_PRE=`BBBA37E21E47B879618FBBBAC43365E8D453D52B87A7EBFE63F94FA8EDC085E2`.
FIXTURE_SHA_POST=`BBBA37E21E47B879618FBBBAC43365E8D453D52B87A7EBFE63F94FA8EDC085E2`.

No cache or artificial zero added, no amount removed, no hasDirigenza or historical limit changed. Probes normalize copies and assert the original input serialization stays identical.

## Optional vs required field semantics

Every listed resource has `?: number` in `FondoDirigenzaData`, optional `MonetarySchema`, and a FundingItem that permits blank values (blank emits undefined, no required attribute). All eight have RESOURCE_NATURE=OPTIONAL_RESOURCE_LINE, CAN_BE_LEGITIMATELY_ABSENT=YES, REQUIRED_FOR_DETERMINATION=NO. MISSING_SEMANTICS=undefined/null/absent contribution zero once atomic detail exists. ZERO_SEMANTICS=declared zero, never fallback.

| FIELD | CURRENT_SCHEMA_OPTIONALITY | UI_OPTIONALITY | RESOURCE_NATURE | CAN_BE_LEGITIMATELY_ABSENT | REQUIRED_FOR_DETERMINATION | MISSING_SEMANTICS | ZERO_SEMANTICS |
|---|---|---|---|---|---|---|---|
| st_art57c2a_CCNL2020_unicoImporto2020 | optional | blank allowed | OPTIONAL_RESOURCE_LINE: consolidated stable base | YES | NO | contribution 0 | contribution 0 |
| st_art57c2a_CCNL2020_riaPersonaleCessato2020 | optional | blank allowed | OPTIONAL_RESOURCE_LINE: RIA through 2020 | YES | NO | contribution 0 | contribution 0 |
| st_art57c2c_CCNL2020_riaCessatidallAnnoSuccessivo | optional | blank allowed | OPTIONAL_RESOURCE_LINE: subsequent RIA | YES | NO | contribution 0 | contribution 0 |
| st_art57c2e_CCNL2020_risorseAutonomeStabili | optional | blank allowed | OPTIONAL_RESOURCE_LINE: discretionary stable resource | YES | NO | contribution 0 | contribution 0 |
| va_art57c2d_CCNL2020_sommeOnnicomprensivita | optional | blank allowed | OPTIONAL_RESOURCE_LINE: onnicomprensività | YES | NO | contribution 0 | contribution 0 |
| va_art57c2e_CCNL2020_risorseAutonomeVariabili | optional | blank allowed | OPTIONAL_RESOURCE_LINE: discretionary variable resource | YES | NO | contribution 0 | contribution 0 |
| va_art33c2_DL34_2019_incrementoDeroga | optional | blank allowed | OPTIONAL_RESOURCE_LINE: existing DL34 SUBJECT classification | YES | NO | contribution 0 | contribution 0 |
| va_compensiExLege_rilevanti | optional | blank allowed | OPTIONAL_RESOURCE_LINE: relevant ex-lege compensation | YES | NO | contribution 0 | contribution 0 |

Required determination concerns applicability and availability of the atomic detail model, not any particular populated line. A true Dirigenza perimeter with **no declared resource detail model whatsoever**, including a raw cache-only payload, cannot certify its current consumption: `DIRIGENZA_RESOURCE_DETAIL_MISSING`, UNDETERMINED. A declared classified resource key establishes the detail model, including a legitimate absent resource represented by undefined or null, or explicit zero; all other optional rows contribute zero. The complete blank UI model therefore is VALID ZERO. This distinguishes a raw uninitialized/incomplete legacy payload from a declared optional resource model without requiring seven artificial zeros in the frozen fixture. No cache value is inspected to make this distinction.

Direct resolver input hasDirigenza=null/undefined is unresolved (`DIRIGENZA_APPLICABILITY_MISSING`); false disables the perimeter. The engine/page preserve the existing optional flag default: an omitted undefined flag means false; explicit unknown null fails closed. This compatibility default is independent of the cache.

NaN, ±Infinity, negative additive resources, malformed nonnumbers and amounts/totals outside safe numeric representation are INVALID locally. No DATA-03 global boundary refactor.

## Dirigenza domain model

Same eight SUBJECT fields and eleven EXCLUDED fields as the existing page. EXCLUDED: stable 1.53%, 2.01%, 3.05%; sponsorship; prior-year residual; Dirigenza PNRR; two CCNL2018 recovery rows; contractual 0.22% MS2018 and MS2021; nonrelevant ex-lege compensation. These remain optional resource lines.

Utilization rows are not additive consumption resources. `historicalData.fondoDirigenza2016` remains a historical-limit input. Annual manual adjustment and sanctions retain their existing fund-summary treatment and do not enter the eight-line subject selection.

DIRIGENZA_ANNUAL_LIMIT_ADJUSTMENT_CLASSIFICATION=UNTOUCHED_OUT_OF_SCOPE. The historical documentation discrepancy is preserved and documented; it does not prevent retirement of the competing cache authority targeted by CALC-04. No historical-limit change or new normative research.

## Derived resolver

`src/logic/calculation/dirigenzaArt23.ts` exposes static SUBJECT/EXCLUDED selections, `resolveDirigenzaArt23Subject` and a separate `reconcileDirigenzaArt23Cache`. Public result contracts are in `src/domain/dirigenzaArt23.ts`, avoiding a domain-to-calculation implementation dependency.

Economic input type omits the legacy total. Runtime implementation does not read it either: a test uses a throwing getter on the cache and frozen input to verify purity. Result includes status, subjectAmount, excludedAmount and issues. Missing/invalid amounts are null rather than certified zero. Decimal summation uses exact arithmetic and rounds the final sums.

The engine uses only the verified subject result. Its existing numeric DTO component slots use a known subtotal zero when the resolution has no verified amount; the accompanying explicit state, false isCompliant and downstream gates prevent that placeholder being treated as final compliance. Invalid resources never reach legacy sub-fund arithmetic: invalid summaries are provisional zeros under blocking status, not authoritative totals.

FAD entries, verified stable/variable/subject amounts and totals remain unchanged. Dirigenza missing/invalid issues are composed into the existing canonical prerequisite/status envelope solely for readiness; no Dirigenza economic entry is forced into the FAD ledger and no FAD amount is replaced.

## Cache retirement as authority

| Active consumer | Source after implementation | Cache economic authority? |
|---|---|---|
| fundEngine / comp_dirigenza | resolver.subjectAmount | NO |
| whole-entity Art23 / margin / compliance | derived components, once each | NO |
| compliance checks | resolver status and derived consumption | NO |
| Dirigenza page subject display | same resolver | NO |
| XLS/PDF/report Art23 read models | corrected engine output | NO |
| Cabina / document / closure gates | existing upstream statuses/issues | NO |
| persistence/type/schema/import | legacy field remains compatible | NO |

ACTIVE_DIRIGENZA_CACHE_AUTHORITIES=0. `cache || 0` economic reader removed. The page's useEffect writer is removed: neither OPEN nor CLOSED rendering writes reconciliation or derived values to state/DB. The disabled total input displays the derived value. No manual cache authority or new page introduced.

## Cache reconciliation

Reconciliation runs after derivation and is stored only in calculation-result metadata. Cache matching→RECONCILED; stale zero/high→MISMATCH; absent/null→ABSENT; malformed→INVALID_CACHE; no verified derivation→UNAVAILABLE. None of these metadata states changes subject, compliance, blocking, Cabina or readiness. The page qualifies a mismatch as a legacy saved total, without writeback.

## Whole-entity Art23

The FAD source remains canonical verifiedArt23Subject. EQ, Segretario and overtime calculations/derogations remain intact. Only Dirigenza source changes. Dirigenza excluded resources also contribute to the existing whole-entity excluded display, separately from subject.

No-double-count test: FAD500 + EQ100 + Segretario100 + Dirigenza200 + overtime100 = 1,000, with the real field semantics and no Dirigenza ledger entry. Margin test: cap10,000 + other subject8,000 + Dirigenza1,500 = subject9,500/margin500 for caches0/1,500/8,000. Excluded additions do not increase subject.

## Frozen scenario 1.33m → 1.61m

| Value | Old engine/golden | Corrected real engine |
|---|---:|---:|
| Dirigenza subject | 0 | 280,000 |
| Whole entity subject | 1,330,000 | 1,610,000 |
| Remaining margin | 350,000 | 70,000 |
| Updated limit | 1,680,000 | 1,680,000 |
| isCompliant | true | true |
| Total fund | 1,675,000 | 1,675,000 |
| Stable total | 1,670,000 | 1,670,000 |
| Variable total | 5,000 | 5,000 |

`real-output-before-golden.json` verifies these actual outputs with the old golden still present. `real-output-after-golden.json` repeats the same assertions after the correction. Both exercise frozen cache undefined/null/0/1/280,000/2,000/999,999. Unit/integration tests also cover malformed cached values, original 2,000/cap1,000 counterexample, 500/cap1,000/cache2,000 false-positive prevention and declared zero/cache5,000.

The frozen fixture's other canonical prerequisites retain their existing behavior; Dirigenza VALID alone does not promote unrelated incomplete FAD data to definitive readiness.

## Golden targeted update

FINDING=CALC-04.
WHY_CHANGED=LEGITIMATE_GOLDEN_CORRECTION_FOR_VERIFIED_BUG.
INPUT_FIXTURE_CHANGED=NO.

Exactly one scenario and one key changed:

```diff
  "ente-con-dirigenza.json": {
    ...
-   "ammontareSoggettoLimite2016": 1330000,
+   "ammontareSoggettoLimite2016": 1610000,
    ...
  }
```

No margin/isCompliant keys exist in this golden record; those values are asserted in the real-output probes and tests, not added to the file. Unchanged: all fund totals/subfunds, historical limit and warnings; all seven other scenarios and all input fixtures. Surgical replacement preserved byte length, whitespace and ordering: only byte offsets 3481 and 3482 differ from PRE. Full diff: `golden-targeted.diff`. Oracle unchanged.

## Legacy cache-only tests

LEGACY_CACHE_TEST_EXPECTATION_UPDATE applied to three affected tests, preserving all test inputs:

| Test | Obsolete expectation | New verified expectation |
|---|---|---|
| art23Complessivo Caso6 | cache-only Dirigenza35,000 included | no verified subject; UNDETERMINED, false definitive compliance |
| art23Complessivo Caso8 | cache-only Dirigenza30,000 in DTO | subtotal placeholder0, explicit UNDETERMINED |
| mod031bEqSegretarioTotals / Art23 aggregate | cache-only40,000 creates total175,000, breach15,000 | known subtotal135,000, provisional margin25,000, explicit UNDETERMINED, false definitive compliance |

The subtotal placeholder never makes missing Dirigenza a compliant zero. New tests verify cache-only undefined/0/2,000/999,999 remain unresolved with identical economics/gates. Historical characterization fixture files are unchanged. `limite2016Differential` passes unchanged.

## CLOSED

CLOSED derivation is read-only. New page tests exercise DRAFT and CLOSED with mismatched cache and rerender: zero dispatches, unchanged snapshot representation, closed editing blocked. Cache-only CLOSED displays unresolved rather than cached economics. Lifecycle test verifies CLOSED loading does not upsert, and attempted save returns SNAPSHOT_CLOSED. OPEN save/load keeps atomics and the persisted legacy cache, deriving the same economics after reload.

No hydration mutation, migration or automatic correction. Existing AppContext hydration merges undefined defaults with atomics without converting missing resources into economic amounts; no modification made to that layer.

## Downstream readiness

Existing Cabina/DocumentKindReadiness/ClosureInstructionReadiness resolvers are byte-identical. Integration tests use their real functions with corrected upstream results:

| Dirigenza / Art23 case | Cabina | All five document kinds | Closure |
|---|---|---|---|
| INVALID atomic detail | BLOCKED | DRAFT_ONLY | NOT_READY |
| UNDETERMINED detail | TO_COMPLETE | DRAFT_ONLY | NOT_READY |
| VALID amount, breach | BLOCKED | DRAFT_ONLY | NOT_READY |
| VALID compliant amount | CONSTITUTION_VERIFIED | FINAL_READY | READY |

Cache poisoning preserves checks/errors and these states; mismatch does not become a blocker. FAD economic entries and verified totals are asserted identical when only Dirigenza becomes unresolved.

## Regression

**8/8 PASS**, `regression.log`, after the targeted golden correction and confirmed on final code. No fixture changed to obtain a pass. Initial targeted six-file suite **140/140 PASS**: resolver53, new engine/lifecycle37, page3, existing Art23 tests12, EQ/Segretario9, differential26. Initial three legacy assertion failures are retained in `targeted-initial.log`, with the final authorized expectation changes documented above. Final resolver count is 56; the four-file default/closure/N+1 recheck passes **130/130** (`defaults-retest.log`).

## Oracle

**14/14 PASS**, `oracle.log`, without any oracle change. No ART23_DIRIGENZA_ORACLE_CONFLICT.

## Full product suite

**1813/1813 PASS, 135/135 test files, exit 0**, final complete run, evidence `full-product.log` and `full-product.json`. The first full run identified 18 closure/N+1 failures from incorrectly treating declared undefined optional resource lines as missing detail. This was a resolver defect, not an obsolete expected: no consolidated closure/navigation test or input was changed. The resolver now checks presence of the declared detail model, not populated resource values; three new regression tests protect this distinction. `full-product-initial.log/json` preserve the failing run. The final complete run verifies the repaired code, including save/reload, CLOSED, canonical FAD, Cabina, Distribution, document/closure readiness, DL25, PNRR, XLS/PDF and Auth.

Strict offline product config excludes only the seven historical `wave3HardeningEvidence` generator tests that rewrite `evidence_wave3_hardening`; `wave3UiWiring` remains included and uses temporary artifacts. No golden/oracle regeneration. TypeScript **PASS**, zero diagnostics; diff-check PASS.

Local full-suite command (run from repository root; the saved config is an exact copy of the tested temporary config):

```powershell
$env:NODE_OPTIONS = '--require ./scripts/pnrr-offline-guard.cjs'
$env:PNRR_NETWORK_LOG = Join-Path $env:TEMP 'art23-dirigenza-v2/network-full-product-final.jsonl'
node node_modules/vitest/vitest.mjs run --config art23_dirigenza_v2_evidence/offline.config.mjs --reporter=default --reporter=json --outputFile=art23_dirigenza_v2_evidence/full-product.json
node node_modules/typescript/bin/tsc --noEmit --incremental false
```

## Scope integrity

Branch `ux/toolbox-area-fondo-prototype`; HEAD `d3170f959b5815c514dbf3d6e5f93366a5f14c67`; index empty. PRE inventory covers 1,296 files including ignored historical reports/evidence, excluding node_modules/.git and the new V2 evidence directory. Eight existing files changed: five production integration/presentation/type files, two cache-authority expectation tests, one golden. Five new source files: domain result types, resolver, two calculation test files, one page test. New V2 report/evidence only otherwise.

All historical reports/reconciliation, previous blocked artifacts, frozen/input fixtures, oracle, canonical FAD ledger and PNRR implementations preserved. Shared fundEngine/compliance modifications are restricted to necessary CALC-04 integration; DL25 simulator and other compliance sections are unchanged. No unrelated untracked removed. No real database/network, migrations, staging, production, deploy, add, commit, push or PR.

Final PRE/POST audit: **1,288 pre-existing files byte-identical, exactly the eight allowed existing files changed, zero removed files**. Exactly five new implementation/test sources and the V2 report exist outside the V2 evidence folder. `scope-integrity.json`, `post-sha256.json`, `post-status.txt`, `post-diff.txt` and `post-cached-diff.txt` record the final proof; `final-scope-audit.ps1` reproduces the comparison. `preserved-shared-contracts.json` also verifies the DL25 simulator and non-Dirigenza compliance tail against dirty PRE bytes, rather than HEAD.

Network final counts: **product attempts 0; tooling attempts 24; real connections 0**. All 24 events are blocked `DNS_PROMISE` requests for the localhost label, resolved by the guard in memory. Evidence `network-events.json`; no unexpected destinations or product requests. PDF/font/canvas and React warnings are local test-environment diagnostics, not downloads.

## CALC-04 reassessment

**CANDIDATE_VERIFIED_FIXED**. All required local gates pass: atomics govern, cache poisoning leaves economics and gates invariant, optional absences contribute zero, genuine missing detail/applicability fails closed, raw legacy cache fallback is absent, frozen input is immutable, targeted golden correction is verified, no double count or CLOSED writeback, regression 8/8, oracle 14/14, product suite 1813/1813, TypeScript and diff check pass. No global VERIFIED_FIXED promotion before independent review. Formal ASTRA remains VF13/PF8/OPEN4; DATA-01 OPEN, DATA-03 PARTIALLY_FIXED. Thirteen previously verified findings retain their implementations and regression coverage.

## ARCH-01 residual

PARTIALLY_FIXED. `FundDetailsPage/constitution.sections` and unrelated legacy consumers untouched. This slice retires only the Dirigenza competing Art23 cache authority.

## Next gate

ART23_DIRIGENZA_DERIVED_CONSUMPTION_INDEPENDENT_REVIEW. Only a positive independent review may promote formal counts to VF14/PF7/OPEN4. No implementation of other findings, no global reconciliation update, no operational deployment.

Terminal result:

```text
ART23_DIRIGENZA_GOLDEN_CONTRACT_RESOLUTION = COMPLETE
RESULT = PASS
GOLDEN_CONFLICT = CONFIRMED_OBSOLETE_EXPECTATION
FIXTURE_CHANGED = NO
FIXTURE_SHA_PRE = BBBA37E21E47B879618FBBBAC43365E8D453D52B87A7EBFE63F94FA8EDC085E2
FIXTURE_SHA_POST = BBBA37E21E47B879618FBBBAC43365E8D453D52B87A7EBFE63F94FA8EDC085E2
OPTIONAL_RESOURCE_ABSENCE_POLICY = VERIFIED_OPTIONAL_ROWS_CONTRIBUTE_ZERO
REQUIRED_INPUT_MISSING_POLICY = UNDETERMINED_FAIL_CLOSED
FROZEN_DIRIGENZA_SUBJECT = 280000
OLD_WHOLE_ENTITY_ART23_SUBJECT = 1330000
NEW_WHOLE_ENTITY_ART23_SUBJECT = 1610000
OLD_MARGIN = 350000
NEW_MARGIN = 70000
LIMIT = 1680000
IS_COMPLIANT_OLD = true
IS_COMPLIANT_NEW = true
TOTAL_FUND_OLD = 1675000
TOTAL_FUND_NEW = 1675000
GOLDEN_UPDATE_AUTHORIZED = YES_TARGETED_ONLY
GOLDEN_SCENARIOS_CHANGED = ente-con-dirigenza.json
GOLDEN_KEYS_CHANGED = ammontareSoggettoLimite2016
OTHER_GOLDEN_SCENARIOS_CHANGED = 0
ORACLE_CHANGED = NO
ART23_DIRIGENZA_DERIVED_CONSUMPTION_IMPLEMENTATION_V2 = COMPLETE
DIRIGENZA_DERIVED_RESOLVER = resolveDirigenzaArt23Subject_PURE_DETERMINISTIC
CACHE_USED_AS_ECONOMIC_AUTHORITY = NO
ACTIVE_DIRIGENZA_CACHE_AUTHORITIES = 0
CACHE_POISONING_INVARIANCE = PASS
LEGACY_CACHE_FALLBACK = ABSENT
OPTIONAL_ABSENT_AS_ZERO = PASS
REQUIRED_MISSING_FAIL_CLOSED = PASS
DIRIGENZA_DOUBLE_COUNT = ABSENT
WHOLE_ENTITY_ART23_AGGREGATION = DERIVED
CLOSED_WRITEBACK = 0
DIRIGENZA_ANNUAL_LIMIT_ADJUSTMENT_CLASSIFICATION = UNTOUCHED_OUT_OF_SCOPE
CALC_04_STATUS_AFTER_SLICE = CANDIDATE_VERIFIED_FIXED
ARCH_01_STATUS_AFTER_SLICE = PARTIALLY_FIXED
REGRESSION = 8/8_PASS
ORACLE = 14/14_PASS
FULL_PRODUCT_TESTS = 1813/1813_PASS_135/135_FILES
TYPESCRIPT = PASS_ZERO_DIAGNOSTICS
DIFF_CHECK = PASS
DL25_REGRESSION = NONE
PNRR_REGRESSION = NONE
SEC_01_REGRESSION = NONE
DATA_02_REGRESSION = NONE
CALC_01_REGRESSION = NONE
CALC_02_REGRESSION = NONE
CALC_03_REGRESSION = NONE
CALC_05_REGRESSION = NONE
DOC_01_REGRESSION = NONE
DOC_02_REGRESSION = NONE
NORM_01_REGRESSION = NONE
NORM_03_REGRESSION = NONE
NORM_04_REGRESSION = NONE
FUNC_01_REGRESSION = NONE
FUNC_02_REGRESSION = NONE
ASTRA_BLOCKERS_OPEN = 0
PRODUCT_NETWORK_ATTEMPTS = 0
TOOLING_NETWORK_ATTEMPTS = 24
REAL_NETWORK_CONNECTION_ESTABLISHED = NO
SCOPE_INTEGRITY = PASS
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
ART23_DIRIGENZA_DERIVED_CONSUMPTION_STATUS = CLOSED_LOCALLY
REPORT = ART23_DIRIGENZA_DERIVED_CONSUMPTION_IMPLEMENTATION_V2_REPORT.md
NEXT_GATE_RECOMMENDATION = ART23_DIRIGENZA_DERIVED_CONSUMPTION_INDEPENDENT_REVIEW
```
