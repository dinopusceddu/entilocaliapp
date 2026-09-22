# WAVE 2 — Canonical Fund Ledger Implementation Report

## 1. Baseline

- Branch: `ux/toolbox-area-fondo-prototype`
- HEAD: `096056b8c6fa7d436cae24ce6d412580ff420c85`
- Commit: `096056b fix: make annual closure atomic and immutable`
- Report letti integralmente: `ASTRA_RSU_AUDIT_REPORT.md`, `ASTRA_NORMATIVE_MATRIX.md`, `ASTRA_TEST_MATRIX.md`, `WAVE1_FINAL_HARDENING_REPORT.md`, `WAVE1_CONSOLIDATION_REPORT.md`.
- Runtime Vite risolto da `.env.local`: `https://mcasgpaivyosaroxrodm.supabase.co` (`entilocaliapp-staging`).
- La configurazione storica di produzione presente in `.env` non è stata usata.
- Nessun commit, staging Git, push, PR, merge o deploy eseguito.

## 2. Baseline gates

Prima delle modifiche:

- DIFF_CHECK: PASS
- TYPESCRIPT: PASS
- TEST_FILES: 93 passed
- TESTS: 952 passed
- FAILURES: 0
- BUILD: PASS — Vite 6.4.1, 1862 moduli
- REGRESSION_SCENARIOS: 8/8

I golden storici sono stati usati come caratterizzazione tecnica, non come fonte normativa.

## 3. Formula duplication map

La mappa completa è conservata in `WAVE2_WORKLOG.md`. Sintesi dei percorsi concorrenti trovati:

| Concetto | Fonte/formula precedente | File/consumer | Esito Wave 2 |
|---|---|---|---|
| Stable FAD | Campi + helper CCNL − Art.60 | `fundEngine.ts`, Cabina | Derivato dal ledger |
| Stable FAD | Ricalcolo e scritture UI | `FondoAccessorioDipendentePage.tsx` | Rimosso |
| Variable FAD | Campi + helper CCNL/recovery | `fundEngine.ts` | Derivato dal ledger |
| Variable FAD | Seconda somma CCNL lato pagina | Fondo Personale | Rimosso |
| 0,14 current | Motore, Wizard, pagina, alias | più consumer | Unica entry `CCNL_014_CURRENT` |
| 0,14 recovery | `current × 2` e campo aggregato | Wizard/helper/transfer | Mai inferito; entry distinta |
| 0,22 | massimo raddoppiato nel 2026 + alias | Wizard/transfer | Massimo annuale unico |
| Art.60 | platea corrente anche nel 2025 | Wizard/helper | Decorrenza 2026 |
| Art.60 Art.23 | sottrazione + riaggiunta figurativa | motore | Due effetti, un solo movimento economico |
| Art.23 subject | cache `cl_totaleParziale...` o componenti | compliance | Solo entries |
| Alias legacy | `canonical > 0 ? canonical : legacy` | helper | fallback solo su assenza reale |
| Art.33 | prerequisiti assenti convertiti in zero | limite | `UNDETERMINED` |

## 4. Root cause CALC-01 / CALC-02 / CALC-04 / ARCH-01

- CALC-01: il recovery 0,14 veniva generato dal Wizard e sommato di nuovo dall’helper CCNL.
- CALC-02: Fondo Personale ricostruiva localmente 0,14, 0,22, Art.60 e totali già inclusi dal motore.
- CALC-04: una cache persistita poteva prevalere sulle componenti Art.23 reali.
- ARCH-01: campi canonici, alias e formule legacy non avevano un’identità economica condivisa; inoltre `0` era interpretato come valore assente.

La correzione è unica e centrale: normalizzazione → ledger canonico → risultato canonico → consumer.

## 5. Canonical ledger design

`FundLedgerEntry` conserva: ID semantico, importo nullable, componente stabile/variabile, operazione addition/deduction, competenza, origine, source, trattamento Art.23, status, riferimento normativo, effetto economico e provenance.

`CanonicalFundResult` espone totali nullable e subtotali verificati. Le somme sono sempre ottenute dalle entries; gli ID duplicati provocano errore. Le righe `economicEffect=false` descrivono esclusivamente effetti figurativi sul limite e non duplicano l’economia del Fondo.

## 6. Canonical resource IDs

ID principali introdotti:

- `CCNL_014_CURRENT`
- `CCNL_014_RECOVERY_LEGACY_2024_2025`
- `CCNL_022_CURRENT`
- `ART60_CONSOLIDATION`
- `ART60_ART23_FIGURATIVE`
- `OVERTIME_STABLE_TRANSFER`
- `OVERTIME_ART23_CURRENT`
- `RIA`
- `DL25_CURRENT`
- `DL25_ART23_EXCLUSION`
- `LEGACY_FAD_RESOURCE:<field>` per la compatibilità read-time delle altre componenti.

Le label UI e i path Wizard non sono usati come identità primaria.

## 7. Legacy adapter

Architettura realizzata: legacy snapshot → normalizer/read adapter → canonical ledger → canonical result.

WHAT: alias DL25 `st_incrementoDecretoPA` e alias 0,22 `vn_art58c2_incremento_max022_ms2021*`.

WHY: snapshot salvati prima dell’introduzione delle chiavi canoniche.

WHEN USED: soltanto quando la proprietà canonica è `undefined` o `null`.

WHEN NOT USED: quando il canonico è presente, incluso `0`.

REMOVAL PATH: versionare i nuovi snapshot, osservare la quota residua di fallback e rimuovere gli alias dopo una migrazione controllata. Nessuna migrazione massiva è stata eseguita.

L’aggregato recovery 0,14 legacy resta leggibile, ma è marcato `UNDETERMINED` finché origine e ammissibilità non sono istruite.

## 8. 0,14 current

- Formula: `MS2021 × 0,0014`.
- Decorrenza: 01/01/2024.
- Una sola entry stabile `CCNL_014_CURRENT`.
- Se il Wizard ha trasferito il valore, `source=TRANSFERRED`; il motore non lo ricrea.
- Reload e transfer ripetuto conservano una sola entry.

## 9. 0,14 recovery

- Non viene più prodotto come `current × 2`.
- È distinto dalla competenza corrente.
- Un importo legacy aggregato conserva amount/provenance ma ha `originYear=null`, status `UNDETERMINED` e prerequisite esplicito.
- Nessun importo è inventato quando il recovery non è istruito.

## 10. 0,22 current

- Massimo annuale: `MS2021 × 0,0022` dal 2025.
- Oracle MS2021=1.000.000: 2024=0; 2025=2.200; 2026=2.200; 2027=2.200.
- Riparto FRD2024=80.000 / EQ2024=20.000: FRD=1.760, EQ=440.
- Il massimo teorico resta distinto dall’importo effettivamente scelto.

## 11. 0,22 recovery

Non è incorporato nel massimo annuale e non è generato automaticamente. Un eventuale recupero dovrà essere una risorsa separata con anno di origine e istruttoria propria.

## 12. Art.60

- 2025: zero, anche se un campo legacy contiene 127,44; viene emesso un warning di riconciliazione.
- 2026: platea al 01/01/2026; un Funzionario produce 127,44.
- Dopo il 2026: viene riusata una base 2026 persistita; in assenza, `ART60_BASE_2026_UNDETERMINED`.
- `ART60_CONSOLIDATION` è la deduzione economica.
- `ART60_ART23_FIGURATIVE` è solo trattamento del limite (`economicEffect=false`).

## 13. Art.23 derived values

`art23Subject` e `art23Excluded` sono somme algebriche delle entries. Le cache `cl_totaleParziale...` sono ignorate come fonte e possono soltanto generare warning di mancata riconciliazione.

Scenario obbligatorio: componenti soggette 2.000, cache 0 → `art23Subject=2.000`; la conformità usa 2.000.

## 14. Missing/zero/invalid/undetermined semantics

- `0`: valore canonico valido.
- `null`/`undefined`: assenza, con fallback controllato solo se documentato.
- numero negativo/non finito: `INVALID` per le risorse che non lo ammettono.
- prerequisito o provenienza insufficiente: `MISSING`/`UNDETERMINED`.
- Caso canonico 0 / legacy 900: risultato 0.
- Art.33 con FRD2018 missing e personale2018=0: `UNDETERMINED`, non zero.

I subtotali `verified*` permettono di mostrare gli euro verificati senza spacciare il totale complessivo per determinato.

## 15. Wizard transfer

Il transfer scrive componenti riconoscibili e salva un `wizard2026TransferSnapshot` con piano e provenance. Non trasferisce più recovery automatici e non riscrive gli alias 0,22 concorrenti.

Test: transfer 0,14 → una entry `CCNL_014_CURRENT`; reload → ancora una. Anche 0,22 e Art.60 acquisiscono `source=TRANSFERRED` quando presenti nel piano.

## 16. Cabina / Fondo Personale convergence

Cabina e Fondo Personale consumano `CalculationResult.canonicalFund`. Sono stati rimossi i useEffect che riaggiungevano CCNL/Art.60/cache dalla pagina.

È stata inoltre resa idempotente la conferma bootstrap dello stesso ente/anno: una seconda risoluzione non azzera più un ledger già idratato. Questo elimina la race osservata nel passaggio diretto Cabina → Personale.

Acceptance staging 2026: Cabina stabile=1.272,56, variabile=0, totale=1.272,56; Fondo Personale stabile/subtotale=1.272,56, variabile=0, totale=1.272,56.

## 17. Case A/2025 before/after

Prima, osservato da Astra:

- Cabina: stabile 3.272,56; variabile 5.600; totale 8.872,56.
- Fondo Personale: stabile 4.672,56; variabile 5.600; disponibile 10.272,56.
- Riconciliazione puramente aritmetica: stabile 3.272,56; variabile 2.800; totale 6.072,56.

Dopo Wave 2:

- 0,14 current: 1.400.
- overtime stable transfer: 2.000.
- Art.60 2025: 0.
- stable verificato: 3.400.
- recovery legacy 2.800: `UNDETERMINED` perché privo di origine/istruttoria.
- total normativo: `null` / overall `UNDETERMINED`.

## 18. Independent oracle

`scripts/run_wave2_oracle.ts` costruisce gli expected senza chiamare le funzioni sotto test per il calcolo atteso.

Risultato: 14/14 PASS, delta zero per tutti i casi numerici:

`O014-1000000`, `O014-0`, `O014-missing`, `O014-negative`, `O022-2024`, `O022-2025`, `O022-2026`, `O022-2027`, `O060-2025`, `O060-2026`, `O060-2027`, `O033-missing`, `cached-total`, `canonical-zero / legacy-900`.

## 19. Tests changed because of normative corrections

| Test/gruppo | Old behavior | New behavior | Astra rule/finding |
|---|---|---|---|
| `ccnl2026Increments` | 0,22 raddoppiato nel 2026; recovery 0,14 automatico | massimo annuale; recovery separato | N07/N08, NORM-02 |
| `conglobamentoArt60` | 127,44 anche nel 2025 | 2025=0; 2026=127,44 | N09, NORM-01 |
| transfer/mapping Wizard | trasferimento di recovery e alias concorrenti | componenti canoniche, missing esplicito | CALC-01, ARCH-01 |
| Art.23 fixtures | cache autoritativa | componenti autoritative | CALC-04 |
| alias canonical-zero | zero riattivava 900 | zero prevale | ARCH-01 |

Prima è stata corretta l’implementazione; soltanto dopo sono stati aggiornati gli expected dei test normativamente errati.

## 20. Contract tests

Suite permanente `canonicalFundLedger.contract.test.ts`: 13 test, copertura L1-L16 più provenance Wizard. Copre ID univoci, deduplica 0,14, current/recovery, 0,22 per anno, recovery separato, Art.60, zero/legacy, cache, somme e Art.33 missing.

## 21. Browser acceptance

Target esclusivo: staging `mcasgpaivyosaroxrodm`; localhost `127.0.0.1:5002`.

| Caso | Esito | Evidenza |
|---|---|---|
| B1 — Fondo 2025 | PASS | 1 Funzionario, Art.60=0 |
| B2 — Fondo 2026 | PASS | 1 Funzionario, Art.60=127,44 |
| B3 — transfer 0,14 | PASS | current=1.400 trasferito una volta |
| B4 — reload | PASS | attuale=1.400, proposto=1.400, variazione invariata |
| B5 — Cabina/Personale | PASS | 1.272,56 / 0 / 1.272,56 al centesimo |
| B6 — current/recovery | PASS | sezioni e stati distinti |
| B7 — recovery missing | PASS | visualizzato n/d, nessun importo automatico |
| B8 — canonical zero/legacy | PASS | canonico 0 + legacy 900 → variabile 0 |

La race di idratazione rilevata durante B5 è stata riprodotta, corretta e nuovamente verificata da reload pulito.

Dataset isolati rimossi a fine prova: `WAVE2_LEDGER_20260922_1520` e `WAVE2_LEDGER_2026_20260922_1557`. Verifica post-cleanup: enti=0, stati=0, draft=0, utenti eliminati=0.

## 22. Full technical gates

- DIFF_CHECK: PASS (solo warning Git LF→CRLF; nessun errore whitespace)
- TYPESCRIPT: PASS
- TEST_FILES: 96 passed
- TESTS: 972 passed
- FAILURES: 0
- BUILD: PASS — Vite 6.4.1, 1864 moduli
- REGRESSION_SCENARIOS: 8 totali; 6 exact match; 2 expected normative delta
- EXPECTED_NORMATIVE_DELTAS: 2
- UNEXPECTED_DELTAS: 0
- INDEPENDENT_ORACLE: 14/14 PASS

I warning build su `pdfjs eval` e chunk >500 kB sono preesistenti/non bloccanti e fuori perimetro.

## 23. Expected normative regression deltas

SCENARIO: `caso-incremento-2025.json`

OLD: totale Fondo 1.401.600; variabile 17.400; FAD variabile 8.400; FAD totale 1.212.600.

NEW: totale Fondo 1.393.200; variabile 9.000; FAD variabile 0; FAD totale 1.204.200.

WHY: gli 8.400 (`MS2021 3.000.000 × 0,0028`) erano recovery 0,14 inventati automaticamente.

ASTRA RULE: N06/N08, CALC-01, NORM-02.

SCENARIO: `caso-superamento-tetto-art23.json`

OLD: subject 1.230.000; superamento 130.000.

NEW: subject 1.170.000; superamento 70.000.

WHY: il golden usava la cache FAD 1.090.000; le componenti reali producono FAD subject 1.030.000, più EQ 120.000 e Segretario 20.000.

ASTRA RULE: CALC-04 / cached-total scenario.

I golden file non sono stati modificati.

## 24. Unexpected deltas

UNEXPECTED_DELTAS: 0.

Non sono emerse regressioni di sicurezza, richieste di migrazione dati o necessità di review normativa bloccante.

## 25. Files modified

Core/domain/application:

- `src/domain/canonicalFundLedger.ts`
- `src/logic/calculation/canonicalFundLedger.ts`
- `src/logic/calculation/fundEngine.ts`
- `src/logic/calculation/fundCalculations.ts`
- `src/logic/calculation/calculationResultFactory.ts`
- `src/domain/calculationResult.ts`, `src/domain/normalizedInput.ts`, `src/domain/index.ts`
- `src/application/input/inputNormalizer.ts`
- `src/contexts/AppContext.tsx`

Wizard/UI:

- `src/logic/wizard2026/ccnl2026Increments.ts`
- `src/logic/wizard2026/conglobamentoArt60.ts`
- `src/features/wizard2026/mappingPreview.ts`
- `src/features/wizard2026/transfer/applyWizard2026Transfer.ts`
- `src/features/wizard2026/transfer/transferPreviewEngine.ts`
- `src/features/wizard2026/steps/Step4Ccnl2026.tsx`
- `src/features/wizard2026/steps/Step8RiepilogoPreview.tsx`
- `src/features/wizard2026/components/Wizard2026SummaryPanel.tsx`
- `src/components/dashboard/DashboardSummary.tsx`
- `src/pages/FondoAccessorioDipendentePage.tsx`

Test/report:

- nuove suite `canonicalFundLedger.contract.test.ts`, `wave2AstraCharacterization.test.ts`, `AppContext.idempotentHydration.test.ts`
- aggiornati i test normativi Wizard, transfer, Art.23 e fixture collegate
- `scripts/run_wave2_oracle.ts`
- `WAVE2_WORKLOG.md`
- `WAVE2_CANONICAL_LEDGER_IMPLEMENTATION_REPORT.md`

Non modificati: `tabella15Mapper.ts`, `documentFactory.ts`, PDF, XLS, CSV e template documentali.

## 26. Remaining Astra findings

Restano intenzionalmente aperti: DOC-01, DOC-02, CALC-03, NORM-03, NORM-04, CALC-05, DATA-01, DATA-03 generale, UX-02/UX-03, ACCESS-01/ACCESS-02. DOC-01 e DOC-02 potranno consumare il ledger canonico nella Wave successiva.

CALC-01 = FIXED

CALC-02 = FIXED

CALC-04 = FIXED

ARCH-01 = FIXED

NORM-01 = FIXED

NORM-02 = FIXED

## Verdict

WAVE2_READY_FOR_REVIEW
