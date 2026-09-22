# WAVE 2 WORKLOG — Canonical Fund Ledger

CURRENT_PHASE: W2.9 — Full regression + report (COMPLETED)

COMPLETED:
- Pre-flight Git: branch `ux/toolbox-area-fondo-prototype`, HEAD `096056b8c6fa7d436cae24ce6d412580ff420c85`.
- Read in full: `ASTRA_RSU_AUDIT_REPORT.md`, `ASTRA_NORMATIVE_MATRIX.md`, `ASTRA_TEST_MATRIX.md`, `WAVE1_FINAL_HARDENING_REPORT.md`, `WAVE1_CONSOLIDATION_REPORT.md`.
- Runtime target resolved through Vite `loadEnv('development')`: `https://mcasgpaivyosaroxrodm.supabase.co` (STAGING).
- Baseline gates completed.
- Formula duplication map completed before ledger implementation.
- W2.1 characterization distinguishes arithmetic reconciliation from normative result.
- W2.2 canonical ledger/result introduced and wired into the calculation result.
- W2.3 current 0.14% de-duplicated; recovery represented separately and never inferred.
- W2.4 annual 0.22% corrected for 2024-2027; maximum kept separate from allocation/recovery.
- W2.5 Art. 60 starts in 2026; economic deduction and Art. 23 figurative effect are separate entries; Art. 23 caches are non-authoritative.
- W2.6 read-time legacy adapter and component-aware Wizard transfer completed.
- W2.7 Cabina and Fondo Personale consume the same canonical result; duplicate UI calculations removed.
- W2.8 independent oracle 14/14 and staging browser acceptance B1-B8 completed.
- W2.9 final gates completed; historical golden deltas classified, not overwritten.
- Staging cleanup completed for exactly `WAVE2_LEDGER_20260922_1520` and `WAVE2_LEDGER_2026_20260922_1557`; remaining entities/state/drafts = 0; users deleted = 0.

FILES_CHANGED:
- `WAVE2_WORKLOG.md`
- Canonical domain/core, engine/normalizer/result factory, Wizard transfer/UI, Cabina/Fondo Personale consumers, normative tests, contract/oracle tests, hydration-race guard, this worklog and the final implementation report.

TESTS_RUN:
- `git diff --check`
- `npx tsc --noEmit`
- `npm test -- --run`
- `npm run build`
- `npx vite-node scripts/run_regression_tests.ts`
- `npx vite-node scripts/run_wave2_oracle.ts`
- Staging browser acceptance B1-B8 on `http://127.0.0.1:5002`

TESTS_PASSING:
- DIFF_CHECK: PASS
- TYPESCRIPT: PASS
- VITEST: PASS — 96 files, 972 tests
- BUILD: PASS — Vite 6.4.1, 1864 modules
- INDEPENDENT_ORACLE: PASS — 14/14
- HISTORICAL_REGRESSION: 6/8 exact golden matches; 2/8 `EXPECTED_NORMATIVE_DELTA`; 0 unexpected deltas.
- W2.1_CHARACTERIZATION: first run exposed the expected IEEE-754 raw sum (`6072.5599999999995`); the independent oracle now rounds explicitly to cents before comparison.
- NOTE: first sandboxed attempts of Vitest/build/regression could not load `vite.config.ts` because esbuild was denied access to an ancestor directory; identical commands passed outside the sandbox.

OPEN_ISSUES:
- Legacy aggregate `vn_art58_CCNL2026_arretrati2024_2025` remains readable only as an `UNDETERMINED` recovery because it cannot prove origin years/eligibility; no massive data migration was performed.
- DOC-01/DOC-02 and every other out-of-scope Astra finding remain open for later waves.
- Historical golden files still contain the two intentionally obsolete outcomes; they were not changed.

NEXT_PHASE: Human review of `WAVE2_CANONICAL_LEDGER_IMPLEMENTATION_REPORT.md`

## Formula duplication map

| Concetto | Fonte | Formula / precedence observed | File | Consumer | Canonico? | Legacy? |
|---|---|---|---|---|---|---|
| Parte stabile FAD | Campi costituzione + risultati CCNL + Art.60 | `fadRes.stabile + ccnl_fad_stabile - art60Effettivo` | `src/logic/calculation/fundEngine.ts` | Cabina, workflow, compliance | No | Yes |
| Parte stabile FAD | Campi costituzione + risultati CCNL + Art.60 | Ricalcolo locale identico ma senza lo stesso contratto del motore | `src/pages/FondoAccessorioDipendentePage.tsx` | Fondo Personale | No | Yes |
| Parte variabile FAD | Campi variabili + risultati CCNL legacy | `soggette + nonSoggette - decurtazioni + ccnl_fad_variabile` | `src/logic/calculation/fundEngine.ts` | Cabina | No | Yes |
| Parte variabile FAD | Campi variabili + risultati CCNL legacy | La pagina somma di nuovo `incrementoVariabile2026` e gli opzionali | `src/pages/FondoAccessorioDipendentePage.tsx` | Fondo Personale | No | Yes |
| Totale Fondo dipendenti | Riepilogo motore | `stabile + variabile` | `src/logic/calculation/fundEngine.ts` | Cabina, document presenter | Parzialmente | Yes |
| Totale Fondo dipendenti | Riepilogo pagina | Totale ricostruito da `calculateFadTotals` + CCNL + Art.60 | `src/pages/FondoAccessorioDipendentePage.tsx` | Fondo Personale | No | Yes |
| Totale globale | Quattro sottofondi | Somma FAD + EQ + Segretario + Dirigenza | `src/logic/calculation/fundEngine.ts` | Dashboard/consumer generali | Parzialmente | Yes |
| 0,14 current | Wizard | `MS2021 * 0.0014`, 100% Fondo | `src/logic/wizard2026/ccnl2026Increments.ts` | Wizard/transfer | Intended canonical | No |
| 0,14 current | Helper CCNL legacy | `MS2021 * 0.0014`, riparto Fondo/EQ sulle basi 2024/25 | `src/logic/ccnl2024Calculations.ts` | Motore, pagina Personale | No | Yes |
| 0,14 current | Transfer | Scrive campo FAD e campo EQ, poi sincronizza `annualData.ccnl2024` | `src/features/wizard2026/transfer/transferPreviewEngine.ts` | Snapshot/normalizer/motore | No | Adapter legacy |
| 0,14 current | Pagina | useEffect ricalcola e riscrive il campo per anni diversi dal 2026 | `src/pages/FondoAccessorioDipendentePage.tsx` | Snapshot/UI | No | Yes |
| 0,14 recovery | Wizard | `current * 2`, automatico, senza istruttoria per annualità chiuse | `src/logic/wizard2026/ccnl2026Increments.ts` | Transfer | No | Yes, erroneous |
| 0,14 recovery | Transfer | Scrive aggregate 2024/2025 nel campo `vn_art58...arretrati2024_2025` | `transferPreviewEngine.ts`, `applyWizard2026Transfer.ts` | Snapshot/motore | No | Yes |
| 0,14 recovery | Helper CCNL legacy | `MS2021 * 0.0028` e successiva somma col campo trasferito | `src/logic/ccnl2024Calculations.ts`, `fundCalculations.ts` | Cabina/Personale | No | Yes, duplicate |
| 0,22 massimo annuale | Wizard | `MS2021 * 0.0022 * (year===2026 ? 2 : 1)` | `src/logic/wizard2026/ccnl2026Increments.ts` | Wizard/validation | No | Yes, erroneous |
| 0,22 stanziamento | Wizard | Valore scelto, riparto proporzionale FRD/EQ 2024 | `src/logic/wizard2026/ccnl2026Increments.ts` | Transfer | Intended canonical | No |
| 0,22 alias | Transfer | Lo stesso importo Fondo è scritto in tre campi legacy | `src/features/wizard2026/transfer/transferPreviewEngine.ts` | Snapshot/motore/UI | No | Yes, duplicate aliases |
| 0,22 pagina | useEffect | Ricalcola quota dal parametro percentuale e riscrive due alias | `src/pages/FondoAccessorioDipendentePage.tsx` | Snapshot/UI | No | Yes |
| Art.60 effetto economico | Wizard | Platea guidata × Tabella C; applicato anche al 2025 | `src/logic/wizard2026/conglobamentoArt60.ts` | Transfer | No | Yes, wrong date |
| Art.60 effetto economico | Helper CCNL legacy | `valoreTabellaC * 12 * personale`, o totale IVC | `src/logic/ccnl2024Calculations.ts` | Motore/pagina | No | Yes |
| Art.60 precedence | Campo Fondo vs helper | Preferisce campo positivo, altrimenti ricalcolato; zero non è autorevole | `src/logic/calculation/fundEngine.ts` | Totali + Art.23 | No | Yes |
| Art.60 Art.23 | Motore | Sottrae economicamente e riaggiunge figurativamente nel limite | `src/logic/calculation/fundEngine.ts` | Compliance | Semantica corretta ma non ledger | Transitional |
| Consumo Art.23 FAD | Cache oppure componenti | Preferisce `cl_totaleParziale...` se definito, anche zero | `src/logic/calculation/fundEngine.ts` | Compliance | No | Yes, erroneous |
| Consumo Art.23 cache | UI | Ricalcola e persiste `cl_totaleParziale...` | `src/pages/FondoAccessorioDipendentePage.tsx` | Snapshot/motore | No | Yes |
| Esclusioni Art.23 | Set chiavi + variabili non soggette + CCNL | Ricostruzione parallela separata dal totale economico | `src/logic/calculation/fundEngine.ts` | Compliance | No | Yes |
| DL25 alias | Campo canonico/legacy | `canonical > 0 ? canonical : legacy`; zero perde precedenza | `src/logic/calculation/fundCalculations.ts` | Motore/compliance | No | Yes, erroneous |
| Art.33 missing | Storici/FTE | Missing viene trasformato in `0` prima del core | `src/logic/calculation/fundCalculations.ts` | Limite Art.23 | No | Yes, erroneous |
| Snapshot normalization | Spread/default | Conserva campi legacy e cache senza identità semantica | `src/application/input/inputNormalizer.ts`, `src/contexts/AppContext.tsx` | Motore | No | Yes |
| Wizard transfer snapshot | Transfer plan | Registra path e importo ma non ID canonico, competenza/origine/stato | `src/features/wizard2026/transfer/applyWizard2026Transfer.ts` | Reload/explainability | No | Yes |
| Compliance 0,22 | Campo singolo | Legge solo `vn_art58c2_CCNL2026_incremento022_MS2021` | `src/logic/verification/complianceChecks.ts` | Verifiche | No | Yes |

## Test storici con expected normativamente errati individuati

| Test | Old behavior | New behavior richiesto | Astra rule/finding |
|---|---|---|---|
| `ccnl2026Increments.test.ts` — 2026 | massimo 0,22 raddoppiato e arretrati 0,14 automatici | massimo annuale 0,22 singolo; recovery separato/istruito | N07/N08, NORM-02 |
| `ccnl2026Increments.test.ts` — 2024/anni | 0,22 calcolabile senza gate 2025 | 2024 = 0 | N07, O022-2024 |
| `conglobamentoArt60.test.ts` — anni <=2026 | usa la platea corrente anche nel 2025 | 2025 = 0; 2026 platea 01/01/2026; >2026 consolidato o undetermined | N09, NORM-01 |
| `transferPreviewEngine.test.ts` / `wizardTransfer.test.tsx` | transfer di arretrati automatici e tre alias 0,22 | current e recovery separati; una sola identità canonica | CALC-01, NORM-02 |
| test alias DL25 da aggiungere | canonico zero riattiva legacy 900 | zero canonico prevale | ARCH-01 |

## Legacy fallback inventory

WHAT: alias `st_incrementoDecretoPA` per DL25.
WHY: snapshot antecedenti alla chiave `st_incrementoDL25_2025`.
WHEN USED: solo se la proprietà canonica è realmente `undefined`/`null`.
WHEN NOT USED: quando la proprietà canonica vale `0` o qualsiasi numero valido.
REMOVAL PATH: migrazione read-time con provenance, poi rimozione dopo versionamento snapshot.

WHAT: alias 0,22 `vn_art58c2_incremento_max022_ms2021` e `...anno2025`.
WHY: snapshot e transfer Wizard precedenti.
WHEN USED: solo se il campo canonico `vn_art58c2_CCNL2026_incremento022_MS2021` è assente.
WHEN NOT USED: campo canonico presente, incluso `0`.
REMOVAL PATH: adapter read-time verso `CCNL_022_CURRENT`, nessuna nuova scrittura degli alias.

WHAT: `annualData.ccnl2024` come fonte di parametri storici CCNL.
WHY: compatibilità con snapshot esistenti e schermate legacy.
WHEN USED: per calcolare una risorsa solo se la corrispondente voce canonica è assente e la decorrenza/stato sono determinabili.
WHEN NOT USED: voce canonica presente, incluso `0`; mai per creare recovery automatici.
REMOVAL PATH: introdurre campi canonici/versione snapshot e cessare i useEffect di sincronizzazione.

## Checkpoint log

| Phase | Completed | Targeted verification | Diff review |
|---|---|---|---|
| W2.1 | Characterization and duplication map | Astra A/2025 characterization | Checked |
| W2.2 | Ledger types, builder, derived result, unique IDs | Ledger contract core | Checked |
| W2.3 | 0.14 current/recovery split | L2/L3, Wizard reload | Checked |
| W2.4 | 0.22 annual rule and FRD/EQ split | O022-2024..2027 | Checked |
| W2.5 | Art.60 and Art.23 derived entries | O060, cached-total, O033 | Checked |
| W2.6 | Legacy read adapter and Wizard provenance | transfer suites + canonical-zero | Checked |
| W2.7 | Cabina/Personale common result | component tests + hydration guard | Checked |
| W2.8 | Oracle and browser acceptance | 14/14 + B1-B8 | Checked |
| W2.9 | Full gates, delta classification, cleanup/report | 96/972; build; 6/8+2 expected | Checked |
