# MONETARY_INPUT_BOUNDARY — DATA-03

## Executive result

RESULT = BLOCKED. Implementazione di prodotto non iniziata: STOP obbligatorio `MONETARY_RANGE_POLICY_AMBIGUITY`, previsto dal §41 del prompt allegato.

Due importi FAD finiti e singolarmente serializzabili, entrambi `1e308`, vengono accettati dal vero `FundDataSchema`. La somma produce `Infinity`; il vero motore genera `[big.js] Invalid number`; `JSON.stringify` dell'aggregato restituisce `null`. Pertanto `FINITE_DOMAIN_ONLY` non soddisfa la condizione di sicurezza richiesta. Non è stato introdotto un cap arbitrario, né modificato il ledger.

Prove riproducibili: [probe](monetary_input_boundary_evidence/preflight-probe.ts), [risultati](monetary_input_boundary_evidence/preflight-probe.json). Solo repository mock, nessun database.

Questo documento registra una verifica PRE e un arresto, non una remediation completata o una candidata alla independent review.

## Baseline

- BRANCH = `ux/toolbox-area-fondo-prototype`.
- HEAD = `d3170f959b5815c514dbf3d6e5f93366a5f14c67`.
- Working tree avanzato e intenzionalmente sporco; modifiche preesistenti preservate.
- Index invariato; nessun checkout/pull/restore/reset/stash/merge/rebase/add/commit/push/PR/deploy.
- Inventario SHA-256 PRE: 521 file in `src`, `scripts`, `tests`, `public` e configurazioni presenti; [inventario](monetary_input_boundary_evidence/pre-sha256.json).
- Comandi baseline e risultati integrali conservati in `pre-branch.txt`, `pre-head.txt`, `pre-status.txt`, `pre-diff.txt`, `pre-cached-diff.txt` nella directory delle evidenze.
- ASTRA baseline ricevuta: VF=16, PF=6, OPEN=3; ASTRA_BLOCKERS_OPEN=0. Reconciliation non modificata.
- Baseline product ricevuta: 1902/1902, 139 file. Non presentata come nuova esecuzione.

## DATA-03 original acceptance

`INVALID MONEY NEVER CROSSES THE INPUT/PERSISTENCE BOUNDARY`.

Acceptance ancora non soddisfatta: nel probe PRE, negative, malformed e non-finite raggiungono `saveAnnualSnapshot` e causano una chiamata `upsertState` al mock. Nessun risultato PRE viene descritto come PASS di remediation.

## Monetary field census

CENSUS_STATUS = PARTIAL_PRE_STOP. Non esiste un census completo approvato dei sign/precision/range contract: la fase preliminare è stata interrotta dal requisito STOP prima di modificare il prodotto. Nessun totale globale di campi monetari viene inventato.

Domini e percorsi individuati: HistoricalData, AnnualData, FAD, EQ, Segretario, Dirigenza, straordinario, distribuzione, personale manuale, DL25, PNRR, wizard e snapshot transfer. `DocumentMetadata` espone dati amministrativi testuali, non importi editabili. Anni, conteggi, FTE, percentuali ed enum non vengono classificati automaticamente come moneta.

Campi preliminari direttamente pertinenti al blocco:

| FIELD_PATH | DOMAIN | SOURCE | USER_EDITABLE | SIGN_POLICY | MISSING_ALLOWED | ZERO_ALLOWED | PRECISION_POLICY | CURRENT_SCHEMA | CURRENT_UI_CONTROL | SAVE_PATH | IMPORT_PATH |
|---|---|---|---|---|---|---|---|---|---|---|---|
| fondoAccessorioDipendenteData.st_art79c1_art67c1_unicoImporto2017 | FAD | MULTIPLE | YES | NONNEGATIVE_RESOURCE, contratto dichiarato | YES | YES | schema 2 decimali; runtime bypass | MonetarySchema, bypass dell'oggetto | FundingItem / Input number step 0.01 | saveAnnualSnapshot / upsertState | ExcelTools / excelService; JSON restore |
| fondoAccessorioDipendenteData.st_art79c1_art67c1_alteProfessionalitaNonUtil | FAD | MULTIPLE | YES | NONNEGATIVE_RESOURCE, contratto dichiarato | YES | YES | schema 2 decimali; runtime bypass | MonetarySchema, bypass dell'oggetto | FundingItem / Input number step 0.01 | saveAnnualSnapshot / upsertState | import FundData |
| fondoAccessorioDipendenteData.st_art60c2_CCNL2026_decurtazioneIndennitaComparto | FAD / Art60 | MULTIPLE | YES, percorso manuale | NONNEGATIVE_DEDUCTION_MAGNITUDE | YES | YES | distinguere manuale e risultato derivato | MonetarySchema, bypass dell'oggetto | FundingItem; wizard Art60 | saveAnnualSnapshot / upsertState | wizard Excel / transfer |
| annualData.ccnl2024.monteSalari2021 | Annual / CCNL | MULTIPLE | YES | da completare nel census globale | YES | YES | numberOrUndefined, senza limite di decimali | numberOrUndefined | Ccnl2024SettingsForm | saveAnnualSnapshot / upsertState | CSV / XLS / wizard transfer |

Le annotazioni sopra riguardano contratti dichiarati ed evidenze di sorgente, non affermano l'effettiva enforcement PRE. Il probe dimostra il contrario.

## Sign-policy matrix

`strutturaFondo.json` distingue operatori `+` e `-`. Lo schema dichiarato FAD è nonnegative anche per le deduzioni: la magnitude positiva e l'operazione economica sono concetti distinti. Il ledger non va modificato per questo.

SIGNED_MONETARY_FIELDS = NOT_DETERMINED_PRE_STOP. Non si afferma zero e non si inventano signed fields. In particolare gli adjustment EQ/Dirigenza e i risultati derivati richiedono revisione semantica completa prima di una policy globale.

## Precision/range policy

STOP = `MONETARY_RANGE_POLICY_AMBIGUITY`.

Il §41 consente `FINITE_DOMAIN_ONLY` «solo se provato sicuro con Big.js e serialization» e altrimenti richiede STOP. La prova locale confuta quella sicurezza:

| Passaggio reale | Risultato PRE |
|---|---|
| Due risorse additive FAD = 1e308 ciascuna | entrambe finite |
| FundDataSchema.safeParse(dataset) | success |
| FinancialMath.sumAll(1e308) | finito |
| FinancialMath.sumAll(1e308, 1e308) | Infinity |
| calculateFundCompletely(normalizeInput(dataset), normative mock) | throw `[big.js] Invalid number` |
| JSON.stringify(1e308) | `1e+308` |
| JSON.stringify(aggregate) | `null` |

Nei boundary/schema/input FAD esaminati non è definito un massimo comune. `Number.MAX_SAFE_INTEGER` è presente nel resolver Dirigenza e nei relativi aggregati: è una guard locale CALC-04, non una policy dichiarata per ogni campo FundData. Estenderla automaticamente non dimostrerebbe la sicurezza di somme e prodotti e introdurrebbe un contratto nuovo.

Precisione: `MonetarySchema` dichiara due decimali; UI `FundingItem` inoltra `parseFloat` a ogni change; CSV accetta `123.456`; il FundDataSchema complessivo bypassa la restrizione. FinancialMath usa 20 decimali interni, con arrotondamenti contabili in specifiche operazioni. Nessuna policy di arrotondamento o nuova restrizione è stata introdotta. Questo disallineamento resta da risolvere insieme alla distinzione input/derived.

## Accepted raw formats

Ricognizione PRE: input number e parser Number/parseFloat; CSV documenta `1234.56`, `1234,56`, `1.234,56` e gestisce anche separatori anglosassoni; wizard Excel usa parseFloat dopo sostituzione della virgola e rimozione degli spazi. Scientific notation e leading zero sono convertiti dai parser esistenti, ma non esiste ancora una shared input policy. Nessuna nuova sintassi viene autorizzata in questo report.

MONETARY_ACCEPTED_INPUT_FORMATS = NOT_FINALIZED_PRE_STOP.

## PRE schema bypasses

Cinque sezioni economiche hanno `.optional().or(z.any())`: FAD, EQ, Segretario, Dirigenza, Distribuzione. `personaleServizio` e `wizard2026TransferSnapshot` accettano inoltre any, includendo valori economici conosciuti. `numberOrUndefined` converte malformed in missing; `MonetarySchema` usa Number e presenta lo stesso problema.

KNOWN_MONETARY_ANY_BYPASSES = PRESENT, count globale non completato.

## Shared monetary parser

Non implementato per STOP. Autorità condivisa ancora assente; nessuna nuova formula o parser concorrente aggiunti al runtime.

## FundDataSchema hardening

Non implementato. Probe diretto sul vero schema: tutte le 20 varianti del campo congelato sono accettate dallo schema complessivo, inclusi -100, malformed, Infinity, boolean e array. Lo schema atomico e lo schema complessivo divergono.

## Missing vs zero

Probe PRE: undefined, stringa vuota e zero accettati. Lo schema atomico converte whitespace in zero, mentre il normalizer conserva la stringa. Nessun default(0) introdotto. DATA-01 non modificato.

## Malformed / non-finite handling

Probe PRE: malformed e NaN diventano undefined nello schema atomico; il normalizer conserva l'input grezzo; il save accetta l'input. Infinity/-Infinity/1e309 falliscono nell'atomico, ma passano nello schema complessivo e nel save. Nessuna sanitizzazione applicata.

## Additive resources

Controesempio -100 confermato: FundDataSchema success, normalizer -100, save success, mock upsert=1. +100 e zero sono preservati numericamente dal normalizer. Boundary primario non corretto.

## Deductions

Magnitude nonnegative distinta dall'operatore negativo secondo struttura FAD e MonetarySchema dichiarato. Test economico base1000/deduzione20 non eseguito in questo slice arrestato. Art60 core invariato.

## Signed adjustments

Census semantico globale non completato; nessuna restrizione nonnegative universale applicata.

## Normalizer boundary

`inputNormalizer.ts` copia gli importi senza monetary validation. Probe reale conferma la conservazione di malformed, negative e non-finite. Non modificato.

## UI mutation boundary

FundingItem inoltra parseFloat; HistoricalDataForm e wizard hanno handler locali; AppContext contiene update actions, import e restore. Non migrati. Nessun invalid UI draft è stato introdotto in FundData da questo lavoro.

## Accessible field feedback

Input supporta già error visibile, aria-invalid e aria-describedby; FundingItem non applica una monetary validation condivisa. Nessuna modifica o DOM integration test in questo slice bloccato.

## Import boundary

Percorsi individuati: ExcelTools → parseExcelData → IMPORT_FUND_DATA → saveState; CSV service/schema/mapper; wizard importWizard2026Excel; JSON restore FAD e local drafts. Nessuno modificato. Test atomici di remediation non eseguiti.

## Transfer boundary

applyWizard2026Transfer conserva le guard normative esistenti; snapshot input/computed/destination/transferPlan includono importi. Nessuna guard condivisa aggiunta, nessuna reinterpretazione DL25/PNRR.

## Save/repository boundary

20 chiamate al vero saveAnnualSnapshot con repository mock, una per variante. Tutte arrivano a un upsert mock, comprese le invalidità; nessuna chiamata a repository reale. Il repository Supabase non è stato istanziato dal probe. Boundary non corretto; nessuna serializzazione usata per sanificare l'input prima del save.

## Legacy OPEN hydration

hydrateFundData mantiene i valori legacy come da contratto attuale. Non modificato; acceptance safe/fail-closed e correction flow ancora da implementare e testare.

## CLOSED hydration

Nessun writeback o migration introdotto. Snapshot reali non letti né modificati per questo probe. Test CLOSED non rieseguiti.

## Big.js crash prevention

Non implementata. Il probe cattura esplicitamente il throw del vero motore per registrare la condizione bloccante; non modifica il comportamento dell'app. Il report non dichiara UNCAUGHT_BIGJS_EXCEPTIONS=0 nel runtime prodotto.

## Active mutation bypass census

Census globale incompleto dopo STOP. Bypass PRE confermati in normalizer e save; percorsi UI/import/dispatch/transfer identificati. ACTIVE_MONETARY_MUTATION_BYPASSES = PRESENT, nessuna falsa dichiarazione zero.

## Known z.any bypass census

Cinque escape hatch economici di sezione confermati in FundDataSchema, oltre alle due proprietà any citate sopra. Occorrenze preservate; POST uguale a PRE.

## PNRR regression

Core e transfer invariati; nuova regression non eseguita dopo STOP.

## DL25 regression

Core, baseline, stock, delta, net/gross e regimeDate invariati; nuova regression non eseguita.

## Art60 regression

Core e operatore deduction invariati; nuova regression non eseguita.

## CALC-04 regression

Resolver Dirigenza e own-property semantics invariati. La sua guard MAX_SAFE_INTEGER non è stata estesa arbitrariamente.

## DATA-01 regression

Factory empty e INITIAL data invariati. Il probe utilizza createEmptyFundData reale, aggiungendo soltanto dati sintetici in memoria. Nessun runtime demo reintrodotto.

## ARCH-01 regression

Ledger, canonical projection, consumers FAD e modern reports invariati. Il nuovo evidence file non è importato dal runtime. Nessuna authority economica aggiunta.

## Documents / Cabina / Closure

Readiness, kind mapping, document policy e closure invariati. Nessuna certification/readiness claim sui dati invalidi del probe.

## Tests

Eseguito un probe offline riproducibile su schema, normalizer, save workflow con mock e motore reali: 20 varianti + overflow di due importi finiti + divergenza di precisione CSV/schema. È una caratterizzazione PRE, non una suite PASS di remediation.

Comando: `node node_modules/vite-node/vite-node.mjs --config empty_fund_initialization_evidence/offline.config.mjs monetary_input_boundary_evidence/preflight-probe.ts`.

NODE_OPTIONS richiede scripts/pnrr-offline-guard.cjs; endpoint env example.invalid; niente installazioni o registry. Il primo tentativo sandbox è fallito per accesso esbuild alle directory parent; esecuzione locale autorizzata tramite auto-review. Il probe corretto usa UserRole.FINANCE e repository mock.

Product full suite, regression8/8, oracle14/14, TypeScript, UI/import/hydration gates: NOT_RUN_AFTER_MANDATORY_STOP. Non aggiornati golden, oracle, test di prodotto o snapshot.

## Verified-fixed regressions

SEC-01, DATA-01/02, CALC-01/02/03/04/05, DOC-01/02, NORM-01/03/04, ARCH-01, FUNC-01/02: nessuna modifica di prodotto in questo slice; stati baseline preservati. Non si presenta la verifica hash come sostituto di una nuova esecuzione delle regressioni.

## Scope integrity

PRODUCTION_FILES_CHANGED_THIS_SLICE = 0. Test/fixtures/golden/oracle di prodotto invariati. Unici nuovi artefatti: questo report e monetary_input_boundary_evidence. Verifica hash e baseline finale in scope-integrity.json.

PRODUCT_NETWORK_ATTEMPTS = 0 osservati dal probe. TOOLING_NETWORK_ATTEMPTS_EXTERNAL = 0. Quattro richieste DNS localhost strumentate nei due run riusciti sono risolte in memoria dalla guard: nessuna connessione reale. REAL_NETWORK_CONNECTION_ESTABLISHED = NO. Nessun staging/production/Supabase reale/database/migration contattato o modificato.

## DATA-03 reassessment

DATA_03_STATUS_AFTER_SLICE = PARTIALLY_FIXED, invariato rispetto alla baseline. MONETARY_INPUT_BOUNDARY_STATUS = BLOCKED. Non candidato VERIFIED_FIXED. VF16/PF6/OPEN3 e ASTRA_BLOCKERS_OPEN=0 non cambiano: il blocco di implementazione qui registrato non è un nuovo finding ASTRA.

## ACCESS-02 residual

ACCESS_02_STATUS = OPEN. ACCESS_02_IMPACT = NONE_THIS_BLOCKED_RUN. Il planned scope resta feedback monetario soltanto; nessun claim di closure o miglioramento implementato.

## Next gate

Serve una policy esplicita per il range applicativo degli input e degli aggregati, oppure un contratto documentato di validazione fail-closed degli aggregati prima di Big.js/serialization, compatibile con il vincolo di non modificare le formule canoniche. Occorre anche completare la distinzione precisione input/derived e il census obbligatorio prima dell'implementazione.

La independent review MONETARY_INPUT_BOUNDARY resta il gate previsto dopo una futura remediation completa; non è raccomandata come closure gate del run corrente bloccato.

FERMATI: nessun altro slice implementato.
