# EMPTY_FUND_INITIALIZATION — DATA-01 implementation

## Executive result

Implementation removes demo economics and unentered administrative evidence from real entity/year initialization. Runtime state now comes from fresh empty factories, target snapshots, explicit user/import input or the existing qualified carry-forward builders. No real snapshot or database has been cleaned or rewritten.

Final result: **PASS / CLOSED_LOCALLY**. Dedicated DATA-01 tests: 65/65 PASS. Full product suite: 1878/1878 PASS in 137 files. Regression: 8/8 PASS. Oracle: 14/14 PASS. TypeScript, diff check and scope integrity: PASS. DATA-01 is **CANDIDATE_VERIFIED_FIXED**, pending independent review. Official ASTRA remains VF14/PF7/OPEN4, blockers0. DATA-03 and ARCH-01 remain PARTIALLY_FIXED.

## Baseline

Branch `ux/toolbox-area-fondo-prototype`; HEAD `d3170f959b5815c514dbf3d6e5f93366a5f14c67`. Branch/HEAD matched before edits. The intentionally dirty working tree and empty index were captured in `empty_fund_initialization_evidence/pre-status.txt`, `pre-diff.txt` and `pre-cached-diff.txt`. SHA-256 PRE inventory covers 1,338 files, including ignored previous evidence, excluding node_modules/.git and this new evidence directory. Source/fixture byte backups were placed in the task's TEMP directory for slice diffs.

DATA-01=OPEN; DATA-03=PARTIALLY_FIXED. The CALC-04 independent review is the current authority for VF14/PF7/OPEN4; stale earlier report counts are not adopted. Remaining implementation slices before this work:16; operational gates:3. Global ASTRA reconciliation is unchanged.

## DATA-01 original acceptance

`NO RUNTIME DEMO ECONOMIC FABRICATION`. PRE historical defaults included 1,200,000 +150,000 +300,000 +30,000 +50,000 = **1,730,000** for the 2016 perimeter, plus 125 personnel, 2,500,000 payroll and 2018 fund figures. Simulator defaults added financial inputs and a 27.4% charge rate. Annual defaults added population15,000, overtime50,000 and financial-virtue=true. Coverage and distribution criteria were also prepopulated. None of these values can certify a real newly created entity.

## Initialization graph PRE

The complete graph and classifications were written **before production edits** in `empty_fund_initialization_evidence/INITIALIZATION_GRAPH_PRE.md`. It records purpose, economic/admin evidence, runtime/test consumers and shared-reference risk for every INITIAL_* family, defaultInitialState, DEFAULT_USER/year, Wizard defaults, standalone calculator defaults and unused reference tables.

Paths covered: AppProvider pre-selection shell; entity creation/reset; provisional year transition; switchActiveYear; initialize/load/save snapshot; switchYear hydration; closure N+1; CSV/full import; local drafts; normalization/schema; Wizard creation/reset/XLS import; Excel export. No explicit production demo mode exists. No numeric demo schema default or parser fallback exists outside the identified graph. The standalone compensator initializes profile choices and missing hours, never injects FundData; it is outside this slice.

## Runtime demo inventory

Five initial constant families held populated economic/decision presets: HISTORICAL, SIMULATORE, ANNUAL, SEGRETARIO, DISTRIBUZIONE. Unique populated numeric field paths: **23**. Six additional administrative/classification presets are removed. Three manual zero defaults and the legacy optional incentive zero are separately classified. The IVC zero/model was also audited because its presence is a valid Art.60 determination input, even without demo personnel.

`INITIAL_*` compatibility names remain available, now returning empty shapes produced by factories. Runtime AppContext and normalizer do not consume their singleton objects. The former dataset is frozen as explicit test-only literals in `src/test/fixtures/legacyDemoFund.ts`, with no production import. Unused placeholder progression/indennità tables and placeholder entity name remain unused; normative/reference rate tables are not entity initialization inputs.

## Field-level default classification

For every row below: NEW_ENTITY_BEHAVIOR=MISSING until entered/imported; NEW_YEAR_BEHAVIOR=target persisted value if present, otherwise MISSING (no generic copy); EXISTING_SNAPSHOT_BEHAVIOR=PRESERVED, including numbers equal to old samples. The table explicitly records these rules in each row. Historical requiredness is conditional on the applicable perimeter; it never authorizes inserting an assumed zero.

| FIELD | OLD_DEFAULT | OLD_SOURCE | NEW_DEFAULT | NEW_SEMANTICS | REQUIRED_OR_OPTIONAL | NEW_ENTITY_BEHAVIOR | NEW_YEAR_BEHAVIOR | EXISTING_SNAPSHOT_BEHAVIOR |
|---|---:|---|---|---|---|---|---|---|
| historicalData.fondoSalarioAccessorioPersonaleNonDirEQ2016 | 1200000 | INITIAL_HISTORICAL_DATA | absent | ECONOMIC_REQUIRED_MISSING | required Art23 evidence | MISSING | persisted target or MISSING | PRESERVED |
| historicalData.fondoElevateQualificazioni2016 | 150000 | INITIAL_HISTORICAL_DATA | absent | ECONOMIC_REQUIRED_MISSING | required when applicable | MISSING | persisted target or MISSING | PRESERVED |
| historicalData.fondoDirigenza2016 | 300000 | INITIAL_HISTORICAL_DATA | absent | ECONOMIC_REQUIRED_MISSING | required when applicable | MISSING | persisted target or MISSING | PRESERVED |
| historicalData.risorseSegretarioComunale2016 | 30000 | INITIAL_HISTORICAL_DATA | absent | ECONOMIC_REQUIRED_MISSING | applicable historical evidence | MISSING | persisted target or MISSING | PRESERVED |
| historicalData.fondoStraordinario2016 | 50000 | INITIAL_HISTORICAL_DATA | absent | ECONOMIC_REQUIRED_MISSING | applicable historical evidence | MISSING | persisted target or MISSING | PRESERVED |
| historicalData.personaleServizio2018 | 125 | INITIAL_HISTORICAL_DATA | absent | ECONOMIC_REQUIRED_MISSING | personnel evidence | MISSING | persisted target or MISSING | PRESERVED |
| historicalData.spesaStipendiTabellari2023 | 2500000 | INITIAL_HISTORICAL_DATA | absent | ECONOMIC_REQUIRED_MISSING | payroll baseline | MISSING | persisted target or MISSING | PRESERVED |
| historicalData.fondoPersonaleNonDirEQ2018_Art23 | 1250000 | INITIAL_HISTORICAL_DATA | absent | ECONOMIC_REQUIRED_MISSING | Art23 reference | MISSING | persisted target or MISSING | PRESERVED |
| historicalData.fondoEQ2018_Art23 | 160000 | INITIAL_HISTORICAL_DATA | absent | ECONOMIC_REQUIRED_MISSING | Art23 reference | MISSING | persisted target or MISSING | PRESERVED |
| annualData.simulatoreInput.simStipendiTabellari2023 | 2500000 | INITIAL_SIMULATORE_INPUT | absent | ECONOMIC_REQUIRED_MISSING | payroll input | MISSING | persisted target or MISSING | PRESERVED |
| annualData.simulatoreInput.simFondoStabileAnnoApplicazione | 1300000 | INITIAL_SIMULATORE_INPUT | absent | ECONOMIC_REQUIRED_MISSING | fund baseline | MISSING | persisted target or MISSING | PRESERVED |
| annualData.simulatoreInput.simRisorsePOEQAnnoApplicazione | 160000 | INITIAL_SIMULATORE_INPUT | absent | ECONOMIC_REQUIRED_MISSING | EQ baseline | MISSING | persisted target or MISSING | PRESERVED |
| annualData.simulatoreInput.simSpesaPersonaleConsuntivo2023 | 4000000 | INITIAL_SIMULATORE_INPUT | absent | ECONOMIC_REQUIRED_MISSING | actual personnel spending | MISSING | persisted target or MISSING | PRESERVED |
| annualData.simulatoreInput.simMediaEntrateCorrenti2021_2023 | 15000000 | INITIAL_SIMULATORE_INPUT | absent | ECONOMIC_REQUIRED_MISSING | actual revenue | MISSING | persisted target or MISSING | PRESERVED |
| annualData.simulatoreInput.simTettoSpesaPersonaleL296_06 | 3800000 | INITIAL_SIMULATORE_INPUT | absent | ECONOMIC_REQUIRED_MISSING | spending limit evidence | MISSING | persisted target or MISSING | PRESERVED |
| annualData.simulatoreInput.simCostoAnnuoNuoveAssunzioniPIAO | 100000 | INITIAL_SIMULATORE_INPUT | absent | ECONOMIC_REQUIRED_MISSING | no assumed absence of hiring cost | MISSING | persisted target or MISSING | PRESERVED |
| annualData.simulatoreInput.simPercentualeOneriIncremento | 27.4 | INITIAL_SIMULATORE_INPUT | absent | ECONOMIC_REQUIRED_MISSING | entity-specific charge rate | MISSING | persisted target or MISSING | PRESERVED |
| annualData.numeroAbitanti | 15000 | INITIAL_ANNUAL_DATA | absent | ECONOMIC_REQUIRED_MISSING | population/classification evidence | MISSING | persisted target or MISSING | PRESERVED |
| annualData.fondoLavoroStraordinario | 50000 | INITIAL_ANNUAL_DATA | absent | ECONOMIC_REQUIRED_MISSING | annual allocation | MISSING | persisted target or MISSING | PRESERVED |
| fondoSegretarioComunaleData.fin_percentualeCoperturaPostoSegretario | 100 | INITIAL_FONDO_SEGRETARIO_COMUNALE_DATA | absent | ECONOMIC_REQUIRED_MISSING | actual coverage evidence | MISSING | persisted target or MISSING | PRESERVED |
| distribuzioneRisorseData.criteri_percPerfIndividuale | 50 | INITIAL_DISTRIBUZIONE_RISORSE_DATA | absent | ECONOMIC_REQUIRED_MISSING | entered decision | MISSING | persisted target or MISSING | PRESERVED |
| distribuzioneRisorseData.criteri_percMaggiorazionePremio | 20 | INITIAL_DISTRIBUZIONE_RISORSE_DATA | absent | ECONOMIC_REQUIRED_MISSING | entered decision | MISSING | persisted target or MISSING | PRESERVED |
| distribuzioneRisorseData.criteri_percDipendentiBonus | 5 | INITIAL_DISTRIBUZIONE_RISORSE_DATA | absent | ECONOMIC_REQUIRED_MISSING | entered decision | MISSING | persisted target or MISSING | PRESERVED |
| annualData.tipologiaEnte | COMUNE | INITIAL_ANNUAL_DATA | absent | classification missing | administrative input | MISSING | persisted target or MISSING | PRESERVED |
| annualData.hasDirigenza | true | INITIAL_ANNUAL_DATA | absent | applicability missing | administrative input | MISSING | persisted target or MISSING | PRESERVED |
| annualData.isEnteDissestato | false | INITIAL_ANNUAL_DATA | absent | no negative attestation | administrative input | MISSING | persisted target or MISSING | PRESERVED |
| annualData.isEnteStrutturalmenteDeficitario | false | INITIAL_ANNUAL_DATA | absent | no negative attestation | administrative input | MISSING | persisted target or MISSING | PRESERVED |
| annualData.isEnteRiequilibrioFinanziario | false | INITIAL_ANNUAL_DATA | absent | no negative attestation | administrative input | MISSING | persisted target or MISSING | PRESERVED |
| annualData.condizioniVirtuositaFinanziariaSoddisfatte | true | INITIAL_ANNUAL_DATA | absent | no eligibility attestation | administrative input | MISSING | persisted target or MISSING | PRESERVED |
| personaleServizio.manualProgressioni | 0 | defaultInitialState | absent | ECONOMIC_REQUIRED_MISSING | required if manual mode | MISSING | persisted target or MISSING | PRESERVED |
| personaleServizio.manualIndennita | 0 | defaultInitialState | absent | ECONOMIC_REQUIRED_MISSING | required if manual mode | MISSING | persisted target or MISSING | PRESERVED |
| personaleServizio.manualDipendentiEquivalenti | 0 | defaultInitialState | absent | ECONOMIC_REQUIRED_MISSING | required if manual mode | MISSING | persisted target or MISSING | PRESERVED |
| annualData.incentiviPNRROpMisureStraordinarie | 0 | INITIAL_ANNUAL_DATA | absent | OPTIONAL_RESOURCE_ABSENT | legacy optional resource, no faculty authority | ABSENT | persisted target or ABSENT | PRESERVED |
| historicalData.includeDifferenzialiStipendiali2023 | false | INITIAL_HISTORICAL_DATA | absent | unentered optional choice | optional legacy choice | ABSENT | persisted target or ABSENT | PRESERVED |
| annualData.ccnl2024.ivcConglobation.totalReduction / model | 0 / aggregated empty model | INITIAL_IVC_DATA via INITIAL_ANNUAL_DATA | absent model | REQUIRED_DETERMINATION_INPUT remains missing | model presence certifies Art60 amount | MISSING | persisted target or MISSING | PRESERVED |

No mass numeric replacement or new zero fallback. Resource rows keep the existing resolver classifications. Removing the assumed secretary coverage from initialization does not change the existing formula's compatibility rule for missing coverage; that calculation is outside DATA-01.

## Structural vs economic defaults

Kept: requested year, actual entity name/empty UI string, fresh empty collections, employee category rows with undefined counts, UI distribution/manual-mode=false, Wizard preview/diagnostic counters and empty guided input shapes. Empty CCNL object is structural; no ivcConglobation or totalReduction is created in new FundData. `createEmptyIvcData` remains a compatible empty model helper, unused by real entity/year initialization.

All economic/admin evidence is absent until supplied. Zero stays a real value when explicitly supplied, including historical zero, optional resource zero and persisted distribution decisions. Missing historical/base/manual evidence does not become zero. Optional resource absence contributes zero only through the existing domain resolvers.

## New entity contract

`createEmptyFundData(year, entityName)` accepts no previous entity, sample or economic input. Historical/fund/simulator objects are sparse; no 2016/2018/2023/2025 demo baseline, personnel, payroll, EQ/Dirigenza/Segretario/overtime allocation, DL25 stock or PNRR evidence is inserted. `SET_CURRENT_ENTITY` uses this factory; app shell/provider use fresh `createEmptyAppState()`.

The counterexample test checks **all 23 known numeric demo paths**, separately and together. Actual provider creation persists the requested year/name and structural data only, consistent with the existing missing-snapshot workflow. Unentered inputs render blank in the historical form. The no-entity shell produces zero snapshot writes and zero atomic closure calls.

## New year contract

Target persisted snapshot has precedence. Missing immediate N+1 of the same entity runs the existing qualified DL25 builder; missing other targets use fresh empty data. No full previous annual spread is introduced. Provisional SET_CURRENT_YEAR now shows neutral fresh state while awaiting the target snapshot, rather than exposing the prior year's economics. This is a transient initialization change, not a carry-forward policy.

New snapshot inputs use the **target** year and real entity name, including closure N+1; no globally cached year/default object is reused. Existing N+1 snapshots retain their actual values. Cross-entity initialization receives neither old historical values nor DL25 stock.

## Historical-data lifecycle

**ANNUAL_SNAPSHOT (B)**. FundData embeds historicalData in each user/entity/year snapshot; there is no entity-level historical repository or existing historical inheritance builder. Loading a target year preserves that target's real historical evidence. A missing target remains historical-missing. The existing switch/closure builders did not carry previous historicalData, so no historical carry-forward was removed and no new inheritance policy was invented. Source-year historical records remain intact.

## Carry-forward preservation

`carryDl25ToNextYear`, `prepareDl25NextAnnuality`, DL25 core and yearClosureWorkflow are byte-identical PRE/POST. Current cumulative stock N becomes prior stock N+1 only through the verified builder/provenance gates. New tests verify 15,000 qualified stock into N+1 and isolation after draft mutation. Existing tests preserve source CLOSED, cross-entity refusal, save/reload and post-close navigation.

The existing FAD residual builder in closure is unchanged. PNRR choice/amount/requirements/stable2016 are not copied into N+1; 2026 exercised data does not silently populate 2027. No generic annual/historical carry was added. No migration or compatibility reinterpretation.

## Demo isolation

No explicit production demo mode existed, so the original dataset is retained only as `src/test/fixtures/legacyDemoFund.ts`. D1 explicit test sample remains 1,200,000/2,500,000; D2 normal factory paths omit all samples; D3 a recursive production-source import guard verifies no test/demo fixture import. Isolation classification: **EXPLICIT_ONLY / TEST_ONLY**. No new UI demo flag, demo entity or real persistence path was created.

## Factory purity / object isolation

Factories allocate new objects/arrays and category rows. Entity A deep mutation leaves B equal to its frozen copy; object traversal verifies no mutable-reference intersection. N+1 mutation leaves N unchanged. Wizard initialization/reset/discard now use a factory rather than the shared exported empty object. Old compatibility constants are not runtime state authority.

initializeAnnualSnapshot detaches both the repository creation payload and returned snapshot from caller defaults using structuredClone, preserving undefined/typed semantics. It does not normalize economic input. A pre-existing DL25 initialization test asserted payload identity; the legitimate DATA-01 contract update retains **strict deep equality** and adds nonidentity/nested nonidentity. Existing loaded target identity and all stock/economic assertions remain unchanged.

## Hydration

`hydrateFundData` supplies fresh structural shape for OPEN/legacy inputs and preserves provided fields, null/zero, sparse historical/fund models and unknown legacy properties. Annual defaults supply required UI collections and empty simulation shape only. No default merge into each resource sub-object. This removes both numeric demo filling and own-property evidence fabrication.

Eight explicit regression fixtures are calculated raw and after hydration with a frozen test clock: complete result equality, including economics/checks/canonical entries. Partial one-value snapshots preserve only that actual historical amount. The clock freeze avoids comparing different generation timestamps; no economic assertion was relaxed. Existing persisted values numerically equal to old demos remain values, because this is initialization remediation, not data cleanup.

## Partial import

CSV mapper/parsers and reducers retain their established merge semantics. New empty base has no sample data to leak. A partial import with one actual amount and explicit zero is preserved through reducer, save/reload and structural hydration; omitted required inputs remain missing and optional resources remain absent. Full FundData import does not gain a Dirigenza model through fallback. No writer/parser redesign.

## Save/reload

Repository-mock tests simulate the actual JSON persistence boundary: empty state remains empty; undefined omitted by storage still reads missing; explicit zero remains zero; partial CSV amounts remain real; no sample value appears after reload. The application uses structuredClone for object isolation, not JSON as a general cloning workaround. Local-draft persistence behavior and ownership guards are unchanged. Excel export is exercised with the real workbook builder and a mocked download boundary, verifying real3210/zero and no unentered sample values.

## CLOSED

CLOSED hydration returns a detached copy of the frozen record **without default/shape/identity-field fill**. Tests compare full shape, own undefined/null/zero and serialized bytes; actual provider hydration remains identical and never autosaves. saveAnnualSnapshot rejects a CLOSED record before upsert. Existing FUNC-01 protected reducer paths/read-only consumers remain unchanged. CLOSED_WRITEBACK=0.

## PNRR regression

Core unchanged. New entity has no exercised decision, requirements, maximum, stable2016 or applied amount. Existing resolver interprets absent decision as UNSET, not NOT_EXERCISED; no eligibility attestation is fabricated. Wizard optional inputs remain unset. N+1 does not copy PNRR2026 state into2027. CALC-05 product coverage is included in the complete offline suite.

## DL25 regression

Core unchanged. New simulator input is `{}`; canonical DL25 state absent; resolveAnnualDl25 is UNDETERMINED with missing baseline. No TAB2023, stable2025, EQ2025, prior stock, regimeDate or financial-room demo is created. Verified builder stock/provenance carries remain intact. dl25TestData now explicitly imports the frozen test sample rather than relying on production defaults; formula expected values are unchanged.

## Dirigenza detail-model regression

CALC-04 resolver/domain/engine/page are byte-identical. Empty Dirigenza factory is `{}`, not 19 own resource properties. Raw cache-only snapshot → real AppProvider hydration → normalizeInput remains UNDETERMINED, for cache0/2000/999999; no authoritative fallback. hasDirigenza=true alone does not fabricate atomic detail. Once a real classified amount123 is supplied, the other absent optional rows contribute0. Frozen golden scenario remains subject1,610,000/margin70,000 with unchanged input/golden.

## Cabina

Unmodified. Before any classification choice, the existing engine blocks unknown Art33 applicability. After an explicit DO_NOT_APPLY classification decision with economics still empty, canonical state is UNDETERMINED and Cabina is TO_COMPLETE. The empty state never becomes CONSTITUTION_VERIFIED. Actual pre-calculation shell has no canonical result.

## Distribution

Unmodified. Empty canonical authoritative total is null; only a **VERIFIED_DRAFT subtotal0** is available. No sample budget or final allocation base is invented. Empty distribution factory keeps technical consuntivo=false but no 50/20/5 economic decisions. Persisted criteria are preserved.

## Document readiness

Unmodified. All five document kinds remain DRAFT_ONLY for the economically empty entity; no final document readiness is inferred from empty subtotals. Complete real-data existing document/PDF/XLS paths are part of the full gate.

## Closure readiness

Unmodified. Empty entity/year is NOT_READY; provider closeCurrentYear returns before any closeYearAtomic call. Classified but economically empty canonical input remains undetermined/null. The post-close N+1 navigation workflow and CLOSED protection remain intact.

## Test fixture decoupling

**LEGITIMATE**. Seven test setup consumers formerly imported INITIAL_* as convenient economic fixtures. Only the module dependency changes to explicit test-only `legacyDemoFund`; their assertions and intended numeric inputs are unchanged. The legacy sample literal definitions retain PRE values and shapes, including declared undefined Dirigenza rows, for those explicit tests.

Separate category A update: one newly initialized snapshot payload's shared-reference expectation in dl25Snapshot.test.ts now requires strict deep equality plus independent references. This strengthens initialization isolation and preserves economic and no-carry assertions. No skips/todos or economic expected edits; no golden/oracle edits.

## Active demo consumer inventory POST

| Consumer/source | POST classification |
|---|---|
| AppProvider shell/create/reset/year defaults | STRUCTURAL_EMPTY via factories |
| snapshot initialization | STRUCTURAL_EMPTY or explicit qualified carry/persisted input |
| OPEN hydration | PERSISTED_REAL_DATA plus structural UI fields |
| CLOSED hydration | PERSISTED_REAL_DATA, detached frozen shape |
| inputNormalizer distribution fallback | STRUCTURAL_EMPTY factory |
| INITIAL_* compatibility exports | STRUCTURAL_EMPTY; no product state consumer |
| legacyDemoFund / seven economic test builders | TEST_ONLY |
| Wizard creation/reset | STRUCTURAL_EMPTY fresh factory |
| DL25 carry builder | PERSISTED_REAL_DATA / qualified explicit carry |
| CSV/XLS import, JSON draft, Excel export | explicit supplied/persisted data |
| unused sample reference tables / placeholder name | no runtime consumer; unchanged |
| actual normative rate tables | derived from explicit real personnel, no initialization evidence |

UNSAFE_RUNTIME_DEMO_CONSUMERS=0. Static import search and dedicated production-import regression guard are evidence; matching numbers in explicit test/regression fixtures are not runtime defaults.

## Tests

Dedicated new tests: **65/65 PASS** (58 domain/integration,7 actual AppContext/UI). Initial protected targeted suite:191/191 PASS. New tests cover E1–E7,Y1–Y5,H1–H6,D1–D3, persistence/export, missing vs zero, object isolation and actual gates. Initial focused failures are preserved in focused-initial.log/json: test clock/API/UI selector/classification setup errors were corrected; no product oracle was weakened.

Final full gate: **1878/1878 PASS, 137/137 files, exit0**, duration194.52s. The first complete run passed1877/1878; only the obsolete shared-payload identity assertion failed. Its input/data/no-carry assertions are unchanged and identity isolation is now positively checked. Failing evidence is retained in full-product-initial.log/json; the final complete run includes every normal product test. Only the seven historical wave3HardeningEvidence generator tests are excluded by the existing policy; wave3UiWiring remains included. No historical evidence generator was run.

Regression8/8, oracle14/14, TypeScript zero diagnostics. Diff check: PASS. Local binaries only; guard blocks outbound socket/DNS/dgram in tooling/workers. **PRODUCT_NETWORK_ATTEMPTS=0; TOOLING_NETWORK_ATTEMPTS=10; REAL_NETWORK_CONNECTION_ESTABLISHED=NO**. All ten attempts were Vite/tooling DNS_PROMISE resolutions of localhost, blocked in memory by the offline guard. No remote destination was attempted. The final network event inventory is retained in network-events.json. Local PDF/font/canvas and React act warnings are recorded in test logs, not downloads.

## Verified-fixed regressions

Protected formal findings: SEC-01,DATA-02,CALC-01/02/03/04/05,DOC-01/02,NORM-01/03/04,FUNC-01/02 remain VERIFIED_FIXED. Core Auth, PNRR, DL25, Dirigenza, canonical ledger, Cabina, Distribution and document/closure readiness implementations are untouched. Existing tests for all these areas remain in the full suite. Golden8 scenarios and oracle14 cases are unchanged and pass. ASTRA_BLOCKERS_OPEN=0.

## Scope integrity

Verified existing delta:15 files — seven production initialization/hydration/default consumers, seven test fixture import setups and one initialization-reference test. Five new source files: emptyFund factory, hydration helper, two focused test files, explicit legacy test fixture. New report/evidence only otherwise. **21 files changed/created for this slice excluding evidence (15 existing +5 new source +1 report)**. Scope audit final: **PASS**; 1,323 of the 1,338 PRE files are byte-identical, zero files removed, index unchanged. scope-integrity.json lists the exact paths; post-sha256.json records the final hashes. Seven test setup edits are proven import-only, and the explicit sample literal body matches PRE byte-for-byte.

Every production change is initialization-specific: constants separation; AppContext shell/entity/year/hydration defaults; normalizer fresh structural fallback; snapshot initialization payload isolation; Wizard initialState/reducer/hook factory wiring. The hook's remote synchronization, transfer validation and PNRR/DL25 computations are unchanged. The DL25 snapshot test change is strictly the new reference isolation contract; no DL25 policy changes.

All PRE unrelated files, previous implementation/review reports, global ASTRA reconciliation, frozen fixtures/golden/oracle, calculation/core consumers and migrations are hash-protected. No database changes, migrations, staging/production contact, external network connection, Git staging/commit/push/PR or deploy. No untracked removed.

## DATA-01 reassessment

**CANDIDATE_VERIFIED_FIXED / CLOSED_LOCALLY**. All 25 closure criteria have focused tests or scope proof, and the final product/regression/oracle/TypeScript/diff/scope gates pass. DATA-03 remains PARTIALLY_FIXED: no monetary-boundary expansion. ARCH-01 remains PARTIALLY_FIXED: FundDetailsPage/constitution.sections and other competing consumers unchanged. No NORM-02 remediation or operational gate performed.

## Next gate

EMPTY_FUND_INITIALIZATION_INDEPENDENT_REVIEW. No formal DATA-01 VERIFIED_FIXED claim during implementation. Official VF14/PF7/OPEN4 stays unchanged until positive independent review; then the authorized candidate counts would be VF15/PF7/OPEN3. Stop after this slice; no global reconciliation edit.

Terminal output:

```text
EMPTY_FUND_INITIALIZATION_IMPLEMENTATION = COMPLETE
RESULT = PASS
BRANCH = ux/toolbox-area-fondo-prototype
HEAD = d3170f959b5815c514dbf3d6e5f93366a5f14c67
ASTRA_BASELINE = VF_14_PF_7_OPEN_4
DATA_01_PRE_STATUS = OPEN
INITIALIZATION_GRAPH_RECONSTRUCTED = YES
RUNTIME_DEMO_CONSTANTS_FOUND = 5_POPULATED_CONSTANT_FAMILIES_PRE
RUNTIME_DEMO_FIELDS_FOUND = 23_NUMERIC_PRE_PLUS_6_ADMINISTRATIVE_PRE
STRUCTURAL_EMPTY_FACTORY = createEmptyAppState / createEmptyFundData
HISTORICAL_EMPTY_FACTORY = createEmptyHistoricalData
ANNUAL_EMPTY_FACTORY = createEmptyAnnualData
FUND_EMPTY_FACTORY = createEmptyFundData
SHARED_DEFAULT_REFERENCE = ABSENT
DEMO_DATA_RUNTIME_ISOLATION = EXPLICIT_ONLY_TEST_ONLY
NEW_ENTITY_DEMO_VALUES = 0
NEW_ENTITY_ART23_HISTORICAL_LIMIT = MISSING
NEW_ENTITY_PNRR_EVIDENCE = NONE
NEW_ENTITY_DL25_EVIDENCE = NONE
NEW_YEAR_DEMO_FALLBACK = ABSENT
HISTORICAL_DATA_LIFECYCLE = ANNUAL_SNAPSHOT
HISTORICAL_REAL_VALUES_CARRY = PERSISTED_TARGET_PRESERVED_NO_GENERIC_SOURCE_COPY
ANNUAL_CARRY_FORWARD_POLICY = EXISTING_EXPLICIT_QUALIFIED_DL25_AND_FAD_RESIDUAL_BUILDERS
DL25_N_PLUS_1_CARRY = PRESERVED
PNRR_CARRY_POLICY = PRESERVED
DIRIGENZA_DETAIL_MODEL_DEFAULT_FABRICATION = ABSENT
PARTIAL_IMPORT_DEMO_FILL = ABSENT
EXPLICIT_ZERO_PRESERVED = YES
REQUIRED_MISSING_PRESERVED = YES
OPTIONAL_ABSENCE_PRESERVED = YES
CLOSED_WRITEBACK = 0
APP_SHELL_AUTOSAVE = 0
ENTITY_ISOLATION = PASS
YEAR_ISOLATION = PASS
CABINA_EMPTY_ENTITY = TO_COMPLETE
DISTRIBUTION_EMPTY_ENTITY = VERIFIED_DRAFT_SUBTOTAL_0_NO_AUTHORITATIVE_BUDGET
DOCUMENT_READINESS_EMPTY_ENTITY = DRAFT_ONLY
CLOSURE_READINESS_EMPTY_ENTITY = NOT_READY
TEST_FIXTURE_DEMO_DECOUPLING = LEGITIMATE
UNSAFE_RUNTIME_DEMO_CONSUMERS = 0
GOLDEN_CHANGED = NO
ORACLE_CHANGED = NO
SEC_01_REGRESSION = NONE
DATA_02_REGRESSION = NONE
CALC_01_REGRESSION = NONE
CALC_02_REGRESSION = NONE
CALC_03_REGRESSION = NONE
CALC_04_REGRESSION = NONE
CALC_05_REGRESSION = NONE
DOC_01_REGRESSION = NONE
DOC_02_REGRESSION = NONE
NORM_01_REGRESSION = NONE
NORM_03_REGRESSION = NONE
NORM_04_REGRESSION = NONE
FUNC_01_REGRESSION = NONE
FUNC_02_REGRESSION = NONE
ASTRA_BLOCKERS_OPEN = 0
DATA_01_STATUS_AFTER_SLICE = CANDIDATE_VERIFIED_FIXED
ARCH_01_STATUS_AFTER_SLICE = PARTIALLY_FIXED
DATA_03_STATUS_AFTER_SLICE = PARTIALLY_FIXED
FILES_CHANGED_THIS_SLICE = 21_EXCLUDING_EVIDENCE_15_EXISTING_5_NEW_SOURCE_1_REPORT
NEW_ENTITY_TESTS = PASS_E1_E7
NEW_YEAR_TESTS = PASS_Y1_Y5
HYDRATION_TESTS = PASS_H1_H6
IMPORT_TESTS = PASS
OBJECT_ISOLATION_TESTS = PASS
DEMO_ISOLATION_TESTS = PASS_D1_D3
PNRR_REGRESSION = PASS
DL25_REGRESSION = PASS
DIRIGENZA_REGRESSION = PASS
CABINA_REGRESSION = PASS
DISTRIBUTION_REGRESSION = PASS
DOCUMENT_READINESS_REGRESSION = PASS
CLOSURE_READINESS_REGRESSION = PASS
CLOSED_REGRESSION = PASS
FULL_PRODUCT_TESTS = 1878/1878_PASS_137_FILES
REGRESSION = 8/8_PASS
ORACLE = 14/14_PASS
TYPESCRIPT = PASS
DIFF_CHECK = PASS
PRODUCT_NETWORK_ATTEMPTS = 0
TOOLING_NETWORK_ATTEMPTS = 10_BLOCKED_LOCALHOST_DNS_ONLY
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
EMPTY_FUND_INITIALIZATION_STATUS = CLOSED_LOCALLY
REPORT = EMPTY_FUND_INITIALIZATION_IMPLEMENTATION_REPORT.md
NEXT_GATE_RECOMMENDATION = EMPTY_FUND_INITIALIZATION_INDEPENDENT_REVIEW
```
