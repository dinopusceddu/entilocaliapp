# WAVE 3 — CONSOLIDATION REPORT

Data: 2026-09-24
Repository: dinopusceddu/entilocaliapp
Branch: ux/toolbox-area-fondo-prototype

## Esito

WAVE3_CONSOLIDATED

Il consolidation gate è stato ripreso dal solo blocker di collisione concorrente fra artefatti PDF temporanei. Nessun finding applicativo già chiuso è stato riaperto e non è stata avviata Wave 4.

## Baseline

| Controllo | Risultato |
|---|---|
| Branch iniziale | ux/toolbox-area-fondo-prototype — MATCH |
| HEAD iniziale | fa0480139d76e938c5ca02312632f698c0acb506 — MATCH |
| git diff --check pre-staging | PASS; soli warning informativi LF/CRLF |
| Reset/stash/checkout/cleanup globale | Non eseguiti |

## Test-artifact isolation

Sono stati ispezionati direttamente:

- src/logic/calculation/__tests__/wave3UiWiring.test.tsx;
- src/logic/calculation/__tests__/wave3HardeningEvidence.test.ts.

Il fix è limitato all'harness:

- directory temporanee univoche create con mkdtemp;
- mock trasparente di jspdf.save, con preservazione del basename produttivo;
- lettura degli artefatti dalla directory posseduta dalla suite/test;
- cleanup ricorsivo limitato alla directory temporanea posseduta;
- nessuna rimozione o scansione della root del repository per i PDF concorrenti.

Non risultano .skip, .todo o .only. Le asserzioni MG1–MG7 e P1/P2 sono presenti e semanticamente invariate: banner/formule draft, assenza o presenza di DI COSTITUIRE, blocco dei wrapper definitivi e verifica dei PDF reali restano attivi.

TEST_ISOLATION_FIX_ACCEPTED

Esecuzione congiunta:

~~~text
2/2 test files PASS
26/26 tests PASS
0 failures
~~~

## Quality gates

| Gate | Actual | Esito |
|---|---:|---|
| git diff --check | Nessun errore whitespace | PASS |
| npx tsc --noEmit | Exit 0 | PASS |
| npm test -- --run | 101/101 file; 1059/1059 test; 0 failure | PASS |
| npm run build | Build Vite completata | PASS |
| npx vite-node scripts/run_regression_tests.ts | 8/8 | PASS |
| npx vite-node scripts/run_wave2_oracle.ts | 14/14 | PASS |

I warning pdfjs/font, React act(...), chunk size ed eval erano non bloccanti e non hanno prodotto failure.

## Inventario INCLUDE

I seguenti 23 file sono stati verificati e inclusi tramite path Git espliciti:

| File | Stato | Ragione |
|---|---|---|
| src/domain/index.ts | Modified | Export della proiezione documentale |
| src/domain/tabella15.ts | Modified | Stato RGS/SICO e readiness aritmetica |
| src/domain/types.ts | Modified | Metadati documentali attestazioni |
| src/domain/documentProjection.ts | Added | Proiezione canonica documenti/export |
| src/logic/calculation/canonicalFundLedger.ts | Modified | Totali verificati e stato canonico |
| src/logic/calculation/fundEngine.ts | Modified | Collegamento del risultato canonico |
| src/logic/calculation/tabella15Mapper.ts | Modified | Mapping/guardrail Tabella 15 |
| src/logic/calculation/tabella15Mapper.test.ts | Modified | Copertura mapper |
| src/pages/ReportsPage.tsx | Modified | Wiring preview/definitivo |
| src/pages/Tabella15Page.tsx | Modified | UI tecnica RGS non verificata |
| src/presenters/documentPresenter.ts | Modified | View model documentale canonico |
| src/schemas/fundDataSchemas.ts | Modified | Persistenza metadati |
| src/services/documents/documentFactory.ts | Modified | Wrapper e guardrail export |
| src/services/documents/pdfDeterminaService.ts | Modified | Semantica PDF draft/final |
| src/services/documents/tabella15XlsService.ts | Modified | Output XLS/CSV coerente |
| src/services/reportService.ts | Modified | Wrapper definitivi Tabella 15 |
| src/services/templates/determinaTemplateV2.ts | Modified | Determina draft/final |
| src/services/templates/relazioneTecnicaTemplate.ts | Modified | Relazione draft/final |
| src/logic/calculation/__tests__/documentConsistencyWave3.test.ts | Added | Regressione consistenza documenti |
| src/logic/calculation/__tests__/wave3HardeningEvidence.test.ts | Added | Test artefatti e isolamento I/O |
| src/logic/calculation/__tests__/wave3SystemicFix.test.ts | Added | Regressione guardrail sistemici |
| src/logic/calculation/__tests__/wave3UiWiring.test.tsx | Added | W1–W11, MG1–MG7, P1/P2 e isolamento I/O |
| WAVE3_ABSOLUTE_FINAL_GATE_REPORT.md | Added | Unico documento storico Wave 3; scan preventivo pulito |

src/presenters/documentPresenter.test.ts non era modificato e non è stato incluso.

## Inventario EXCLUDE

Sono rimasti esclusi:

- audit_wave3_independent/, audit_wave3_final_independent/, audit_wave3_final_gate/: harness ed evidenze di audit temporanee;
- evidence_wave3/, evidence_wave3_hardening/, tmp/pdfs/: PDF/XLSX/CSV/TXT/PNG/JSON generati;
- scripts/characterize_wave3_before.ts e scripts/verify_wave3_acceptance.ts: helper di audit non permanenti;
- tutti gli altri report Wave 3 locali, compresi questo report e WAVE3_TEST_ISOLATION_FIX_REPORT.md: documenti locali ignorati;
- .env, .env.local, .astra-test-users.local: ambiente/credenziali locali;
- supabase/migrations/20260220000000_*.sql–20260220000007_*.sql e 20260220000022_remote_baseline.sql: migration storiche fuori Wave 3;
- astra_evidence/, evidence_pack*/, smoke_evidence/, file Wave 1, patch locali e output diagnostici: materiale preesistente fuori scope;
- .gitnexus/, fileprogetto/, test_dump.sql, temp_fundCalculations.ts, err.txt, chat_history_AG123.txt: stato tool, riferimenti, dump o diagnostica locale.

Nessun git add ., git add -A o git add --all è stato usato.

## Staged inspection e secret scan

Prima del commit:

- git diff --cached --name-status: 23 file attesi;
- git diff --cached --stat: 3634 inserimenti, 203 eliminazioni;
- git diff --cached --check: PASS;
- git diff --cached: ispezionato;
- nessun audit pack, artefatto generato, dist, migration, file ambientale o modifica estranea;
- scan limitato ai soli file staged per password, service_role, chiavi Supabase, Authorization/Bearer/JWT, private key, token e API key: nessuna occorrenza;
- scan di email personali, token strutturati e percorsi locali personali: nessuna occorrenza.

SECRET_SCAN_RESULT = PASS

## Commit

~~~text
COMMIT_SHA  = e52c0cb53e53833a4646dc53b110ed4b2c88df70
SUBJECT     = refactor: align fund documents and exports with canonical ledger
PARENT_SHA  = fa0480139d76e938c5ca02312632f698c0acb506
BRANCH      = ux/toolbox-area-fondo-prototype
~~~

Il commit contiene esattamente i 23 file dell'inventario INCLUDE. I due test con il fix di isolamento sono presenti. Non contiene evidence directory, migration, file ambientali o artefatti binari/generati.

## Post-commit verification

- nuovo commit creato: SÌ;
- parent esatto: SÌ;
- branch invariato: SÌ;
- modifiche tracked residue: nessuna;
- file non tracciati esclusi rimasti: 384 file non ignored, oltre ai report/file ambientali ignored già esclusi;
- push: non eseguito;
- PR/merge/deploy: non eseguiti.

La limitazione RGS/SICO resta invariata:

~~~ini
schemaVerificationStatus = RGS_SCHEMA_UNVERIFIED
isSicoExportReady = false
SICO_SCHEMA_VALIDATED = NO
~~~

## Riepilogo obbligatorio

~~~makefile
COMMIT_SHA = e52c0cb53e53833a4646dc53b110ed4b2c88df70
PARENT_SHA = fa0480139d76e938c5ca02312632f698c0acb506
BRANCH = ux/toolbox-area-fondo-prototype

TRACKED_CHANGES_REMAINING = 0
UNTRACKED_TEMP_FILES_REMAINING = 384_NON_IGNORED_PLUS_IGNORED_LOCAL_REPORTS_AND_ENV_FILES

SECRET_SCAN_RESULT = PASS
TYPECHECK_RESULT = PASS
TEST_RESULT = PASS_101_OF_101_FILES_1059_OF_1059_TESTS
BUILD_RESULT = PASS
REGRESSION_RESULT = PASS_8_OF_8
ORACLE_RESULT = PASS_14_OF_14

RGS_SCHEMA_VERIFICATION = RGS_SCHEMA_UNVERIFIED
~~~

## Verdetto finale

WAVE3_CONSOLIDATED

Nessun push, PR, merge, deploy, reset, stash, checkout distruttivo, cleanup globale, modifica RGS o avvio Wave 4 è stato eseguito.
