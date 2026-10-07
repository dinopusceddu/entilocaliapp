# EMPTY_FUND_INITIALIZATION — INDEPENDENT REVIEW
## DATA-01: Verifica forense della rimozione dei demo runtime e isolamento dei default

---

## Executive verdict

L'audit indipendente condotto sullo slice `EMPTY_FUND_INITIALIZATION` (finding target **DATA-01**) attesta che la remediation implementata soddisfa pienamente e rigorosamente il principio cardine:

> **NO RUNTIME DEMO ECONOMIC FABRICATION**
> Un nuovo ente o una nuova annualità NON riceve valori economici o attestazioni amministrative mai inseriti dall'utente, mai importati, mai persistiti e mai prodotti da un carry-forward qualificato.

Tutte le 5 famiglie di costanti demo popolate (`INITIAL_HISTORICAL_DATA`, `INITIAL_SIMULATORE_INPUT`, `INITIAL_ANNUAL_DATA`, `INITIAL_FONDO_SEGRETARIO_COMUNALE_DATA`, `INITIAL_DISTRIBUZIONE_RISORSE_DATA`) sono state completamente svuotate di qualsiasi valore economico e preset amministrativo in produzione. I relativi 23 campi numerici demo e 6 preset amministrativi sono stati azzerati nei factory di default (`createEmptyFundData`, `createEmptyAnnualData`, `createEmptyHistoricalData`, `createEmptyAppState`, `createEmptyWizard2026DraftState`).

I vecchi dati demo sono stati isolati ad uso esclusivo dei test in `src/test/fixtures/legacyDemoFund.ts`, con zero importazioni nel codice produttivo.

Tutti i gate di sicurezza, regressione e integrità sono risultati **GREEN**:
- Test dedicati DATA-01: **65/65 PASS**
- Test di regressione calcolo consolidati: **8/8 PASS**
- Test Oracle normativi Wave 2: **14/14 PASS**
- Full product suite Vitest: **1878/1878 PASS** su 137 test files
- TypeScript `tsc --noEmit`: **0 errori**
- `git diff --check`: **0 violazioni**
- Network: **STRICT OFFLINE** (0 chiamate verso l'esterno)
- Golden results: **ZERO modifiche** rispetto alla baseline PRE

**Verdetto finale:**
- `RESULT = PASS`
- `DATA_01_FINAL_STATUS = VERIFIED_FIXED`
- `EMPTY_FUND_INITIALIZATION = VERIFIED_FIXED`

---

## Baseline

La verifica di conformità dello stato git restituisce:
- **Branch**: `ux/toolbox-area-fondo-prototype`
- **HEAD commit**: `d3170f959b5815c514dbf3d6e5f93366a5f14c67`
- **Cached index**: pulito (`git diff --cached --name-status` vuoto)
- **Working tree**: working tree dirty intenzionale conforme alla baseline di handoff, contenente i file modificati dello slice e le directory di evidenza.

Stato ASTRA ufficiale prima della review:
- `VERIFIED_FIXED` = 14
- `PARTIALLY_FIXED` = 7
- `OPEN` = 4
- `TOTAL` = 25
- `ASTRA_BLOCKERS_OPEN` = 0

Stato corretto prima della chiusura:
- `DATA-01` = OPEN
- `DATA-03` = PARTIALLY_FIXED
- `ARCH-01` = PARTIALLY_FIXED

Con la chiusura formale di DATA-01:
- `VERIFIED_FIXED` = 15
- `PARTIALLY_FIXED` = 7
- `OPEN` = 3
- `TOTAL` = 25
- `ASTRA_BLOCKERS_OPEN` = 0

---

## Original DATA-01 acceptance

Il finding `DATA-01` segnalava la fabbricazione automatica di un intero fondo economico e di requisiti amministrativi per ogni nuovo ente e nuova annualità tramite costanti globali popolate:
- Fondo personale 2016: 1.200.000 €
- EQ 2016: 150.000 €
- Dirigenza 2016: 300.000 €
- Segretario 2016: 30.000 €
- Straordinario 2016: 50.000 €
- Totale perimetro 2016: 1.730.000 €
- Personale in servizio 2018: 125 unità
- Stipendi tabellari 2023: 2.500.000 €
- Fondo 2018 Art. 23: 1.250.000 €
- Fondo EQ 2018 Art. 23: 160.000 €
- Simulatore incremento: fondo stabile 1.300.000 €, spesa personale consuntivo 4.000.000 €, entrate correnti 15.000.000 €, tetto L. 296/06 3.800.000 €, costo assunzioni PIAO 100.000 €, oneri 27,4%
- Annualità: abitanti 15.000, straordinario 50.000 €
- Copertura Segretario: 100%
- Criteri di distribuzione: 50% performance individuale, 20% maggiorazione premio, 5% bonus
- Tipologia: COMUNE
- Dirigenza: hasDirigenza = true
- Requisiti finanziari: dissestato = false, deficitario = false, riequilibrio = false, virtuosità = true.

La review forense attesta che **nessuno** di questi valori viene più generato o iniettato di default. Un nuovo ente presenta campi vuoti o `undefined`, e la mancanza di evidenza blocca o qualifica correttamente i calcoli come non determinabili (`UNDETERMINED` / `TO_COMPLETE` / `DRAFT_ONLY`).

Classificazione:
`ORIGINAL_DATA01_ACCEPTANCE = SATISFIED`

---

## PRE demo reconstruction

L'inventario dei demo identificati PRE comprende:
1. **5 famiglie di costanti popolate**:
   - `INITIAL_HISTORICAL_DATA`
   - `INITIAL_SIMULATORE_INPUT`
   - `INITIAL_ANNUAL_DATA`
   - `INITIAL_FONDO_SEGRETARIO_COMUNALE_DATA`
   - `INITIAL_DISTRIBUZIONE_RISORSE_DATA`
2. **23 percorsi di campi numerici demo**:
   - `historicalData.fondoSalarioAccessorioPersonaleNonDirEQ2016` (1.200.000)
   - `historicalData.fondoElevateQualificazioni2016` (150.000)
   - `historicalData.fondoDirigenza2016` (300.000)
   - `historicalData.risorseSegretarioComunale2016` (30.000)
   - `historicalData.fondoStraordinario2016` (50.000)
   - `historicalData.personaleServizio2018` (125)
   - `historicalData.spesaStipendiTabellari2023` (2.500.000)
   - `historicalData.fondoPersonaleNonDirEQ2018_Art23` (1.250.000)
   - `historicalData.fondoEQ2018_Art23` (160.000)
   - `annualData.simulatoreInput.simStipendiTabellari2023` (2.500.000)
   - `annualData.simulatoreInput.simFondoStabileAnnoApplicazione` (1.300.000)
   - `annualData.simulatoreInput.simRisorsePOEQAnnoApplicazione` (160.000)
   - `annualData.simulatoreInput.simSpesaPersonaleConsuntivo2023` (4.000.000)
   - `annualData.simulatoreInput.simMediaEntrateCorrenti2021_2023` (15.000.000)
   - `annualData.simulatoreInput.simTettoSpesaPersonaleL296_06` (3.800.000)
   - `annualData.simulatoreInput.simCostoAnnuoNuoveAssunzioniPIAO` (100.000)
   - `annualData.simulatoreInput.simPercentualeOneriIncremento` (27.4)
   - `annualData.numeroAbitanti` (15.000)
   - `annualData.fondoLavoroStraordinario` (50.000)
   - `fondoSegretarioComunaleData.fin_percentualeCoperturaPostoSegretario` (100)
   - `distribuzioneRisorseData.criteri_percPerfIndividuale` (50)
   - `distribuzioneRisorseData.criteri_percMaggiorazionePremio` (20)
   - `distribuzioneRisorseData.criteri_percDipendentiBonus` (5)
3. **6 preset amministrativi e di classificazione**:
   - `annualData.tipologiaEnte` (TipologiaEnte.COMUNE)
   - `annualData.hasDirigenza` (true)
   - `annualData.isEnteDissestato` (false)
   - `annualData.isEnteStrutturalmenteDeficitario` (false)
   - `annualData.isEnteRiequilibrioFinanziario` (false)
   - `annualData.condizioniVirtuositaFinanziariaSoddisfatte` (true)
4. **Modelli e default opzionali verificati**:
   - `personaleServizio.manualProgressioni` (0)
   - `personaleServizio.manualIndennita` (0)
   - `personaleServizio.manualDipendentiEquivalenti` (0)
   - `annualData.incentiviPNRROpMisureStraordinarie` (0)
   - `annualData.ccnl2024.ivcConglobation` (modello fittizio conglobamento)

La ricerca globale sui sorgenti production (`src/`) non ha evidenziato alcun consumo non autorizzato:
- `PRE_DEMO_FAMILIES = 5`
- `PRE_NUMERIC_DEMO_FIELDS = 23`
- `PRE_ADMIN_PRESETS = 6`
- `UNSAFE_RUNTIME_DEMO_CONSUMERS = 0`

---

## Field-level default audit

La tabella di classificazione del report è stata confrontata riga per riga con l'implementazione in `src/domain/emptyFund.ts`, `src/constants.ts`, `src/contexts/AppContext.tsx`, `src/application/input/hydrateFundData.ts`, `src/application/input/inputNormalizer.ts`.

| Campo | Old Default | New Default | Semantica | Required/Optional | Runtime Consumers | Audit Result |
|---|---:|---|---|---|---|:---:|
| `historicalData.fondoSalarioAccessorioPersonaleNonDirEQ2016` | 1200000 | `undefined` | ECONOMIC_REQUIRED_MISSING | Required Art. 23 | Nessuno (input vuoto) | PASS |
| `historicalData.fondoElevateQualificazioni2016` | 150000 | `undefined` | ECONOMIC_REQUIRED_MISSING | Required if EQ present | Nessuno | PASS |
| `historicalData.fondoDirigenza2016` | 300000 | `undefined` | ECONOMIC_REQUIRED_MISSING | Required if Dirigenza | Nessuno | PASS |
| `historicalData.risorseSegretarioComunale2016` | 30000 | `undefined` | ECONOMIC_REQUIRED_MISSING | Applicable historical | Nessuno | PASS |
| `historicalData.fondoStraordinario2016` | 50000 | `undefined` | ECONOMIC_REQUIRED_MISSING | Applicable historical | Nessuno | PASS |
| `historicalData.personaleServizio2018` | 125 | `undefined` | ECONOMIC_REQUIRED_MISSING | Personnel evidence | Nessuno | PASS |
| `historicalData.spesaStipendiTabellari2023` | 2500000 | `undefined` | ECONOMIC_REQUIRED_MISSING | Payroll baseline | Nessuno | PASS |
| `historicalData.fondoPersonaleNonDirEQ2018_Art23` | 1250000 | `undefined` | ECONOMIC_REQUIRED_MISSING | Art23 reference | Nessuno | PASS |
| `historicalData.fondoEQ2018_Art23` | 160000 | `undefined` | ECONOMIC_REQUIRED_MISSING | Art23 reference | Nessuno | PASS |
| `simulatoreInput.*` (tutti i 8 campi) | Demo numerici | `undefined` | ECONOMIC_REQUIRED_MISSING | Simulatore DL25 | Nessuno (oggetto `{}`) | PASS |
| `annualData.numeroAbitanti` | 15000 | `undefined` | ECONOMIC_REQUIRED_MISSING | Demografia/DM 2020 | Form renderizza vuoto | PASS |
| `annualData.fondoLavoroStraordinario` | 50000 | `undefined` | ECONOMIC_REQUIRED_MISSING | Annual allocation | Form renderizza vuoto | PASS |
| `annualData.tipologiaEnte` | COMUNE | `undefined` | Administrative input | Incompleto senza scelta | Cabina blocca se unset | PASS |
| `annualData.hasDirigenza` | true | `undefined` | Administrative input | Applicabilità Dirigenza | Nessun detail model | PASS |
| `annualData.isEnteDissestato` | false | `undefined` | Administrative input | Nessuna auto-attestazione | Nessuno | PASS |
| `annualData.isEnteStrutturalmenteDeficitario` | false | `undefined` | Administrative input | Nessuna auto-attestazione | Nessuno | PASS |
| `annualData.isEnteRiequilibrioFinanziario` | false | `undefined` | Administrative input | Nessuna auto-attestazione | Nessuno | PASS |
| `annualData.condizioniVirtuositaFinanziariaSoddisfatte` | true | `undefined` | Administrative input | Nessuna auto-virtuosità | DL25 non approva senza dati | PASS |
| `fin_percentualeCoperturaPostoSegretario` | 100 | `undefined` | Segretario coverage | Reale dato ente | Motore usa fallback compatibile | PASS |
| `criteri_perc*` (50, 20, 5) | 50, 20, 5 | `undefined` | Distribution criteria | Decisioni non assunte | Nessun budget autoritativo | PASS |
| `personaleServizio.manual*` | 0, 0, 0 | `undefined` | Manual personnel | Richiesto in manual mode | Manual mode richiede dati reali | PASS |
| `ccnl2024.ivcConglobation` | Popolato | `undefined` | Modello conglobamento | Art. 60 determination | Nessuna riduzione fittizia | PASS |

`FIELD_DEFAULT_AUDIT = PASS`

---

## 27.4 percent policy review

Nel codice sorgente, nella documentazione interna e nei componenti UI (`src/components/dataInput/SimulatoreIncrementoForm.tsx`, `docs/audit/sprint-c1-audit-dati-generali-ente.md`):
- Il campo `simPercentualeOneriIncremento` ha come etichetta: *"Percentuale oneri riflessi al netto dell'IRAP e maggiorato con i contributi INAIL sull'incremento del fondo"*.
- Il testo di ausilio nella UI specifica: *"La Circ. RGS indica convenzionalmente il 27,4% + INAIL"*.
- In `docs/audit/sprint-c1-audit-dati-generali-ente.md`, la fonte del dato è esplicitamente classificata come: `Fonte: Ente`.
- Il valore 27,4% rappresenta la quota previdenziale fissa CPDEL (23,80% + addizionali) prima dell'aliquota INAIL, che varia a seconda del tasso di rischio dell'ente locale e dei profili professionali.

Pertanto, 27,4% non costituiva una costante normativa immutabile valida erga omnes, bensì un valore campione di base (convenzionale) su cui ciascun ente deve sommare la propria componente INAIL specifica.
La classificazione adottata dalla implementation come tasso dipendente dall'ente e dato di input dell'utente da non pre-fabbricare è esatta e fondata.
La sua rimozione dai default di runtime è legittima e non danneggia la normativa.

`ONERI_27_4_POLICY = ENTITY_DEPENDENT`

---

## New entity real path

Esecuzione e analisi del flusso reale completo:
`AppProvider` → Selezione/Creazione nuovo ente → Inizializzazione snapshot annuale tramite `initializeAnnualSnapshot` → Caricamento in memoria via `appReducer`.

Risultato verificato:
1. Nessuno dei 23 valori demo numerici è presente nello stato.
2. I 6 preset amministrativi risultano tutti `undefined`. L'ente non è automaticamente qualificato come Comune, non ha presenza dirigenza assunta, non ha attestazione negativa di dissesto/deficit/riequilibrio e non ha virtuosità finanziaria pre-asseverata.
3. Lo snapshot persistito a DB contiene unicamente:
   - `current_year`
   - `denominazioneEnte`
   - Strutture dati vuote (`historicalData: {}`, `simulatoreInput: {}`, `fondoDirigenzaData: {}`, categorie personale con conteggio `undefined`).
4. Nel form UI `HistoricalDataForm`, tutti i campi relativi a perimetro 2016, 2018, stipendi e straordinario si presentano come stringa vuota (`""`), senza valori preimpostati.

`REAL_NEW_ENTITY_PATH = EMPTY`

---

## Art23 / PNRR / DL25 initialization

### Art. 23 c. 2
Per un nuovo ente:
- Nessun dato storico 2016 o 2018 è pre-caricato.
- Il calcolo `calculateFundCompletely` rileva l'assenza dei limiti storici.
- `result.compliance.art23c2.isCompliant` è `false` (incompleto/non verificato).
`NEW_ENTITY_ART23 = MISSING_CORRECTLY`

### PNRR
Per un nuovo ente:
- `annualData.pnrrExerciseDecision` è `undefined`.
- `resolvePnrrFaculty` restituisce: `exerciseDecision: 'UNSET'`, `eligibility: 'UNDETERMINED'`, `contribution: 0`.
- Nessun importo massimo, nessun requisito soddisfatto d'ufficio e nessun importo applicato.
- La facoltà NON viene pre-configurata come `NOT_EXERCISED` (nessuna decisione amministrativa fabbricata).
`NEW_ENTITY_PNRR = UNSET_NO_EVIDENCE`

### DL25
Per un nuovo ente:
- `simulatoreInput` è `{}`.
- `annualData.dl25` è `undefined`.
- `resolveAnnualDl25` restituisce stato `'UNDETERMINED'` con issue `'DL25_BASELINE_MISSING'`.
- Nessun dato tabellare 2023, fondo stabile 2025 o stock pregresso è presente.
`NEW_ENTITY_DL25 = NO_EVIDENCE`

---

## Dirigenza legacy red-team

L'audit ha verificato scrupolosamente la non-regressione di CALC-04:
1. **Nuovo ente senza selezione Dirigenza**:
   `fondoDirigenzaData` è `{}`, non un oggetto con 19 proprietà.
   `DIRIGENZA_DEFAULT_DETAIL_FABRICATION = ABSENT`
2. **Nuovo ente con `hasDirigenza = true` ma senza risorse atomiche dichiarate**:
   `resolveDirigenzaArt23Subject` restituisce `{ status: 'UNDETERMINED', subjectAmount: null }`. Nessun modello a zero è fabbricato.
3. **Legacy cache-only snapshot**:
   Snapshot grezzo con `hasDirigenza = true`, `lim_totaleParzialeRisorseConfrontoTetto2016 = 2000` (o 0 o 999999) e zero proprietà atomiche:
   - Sottoposto a `hydrateFundData`: la cache è preservata intatta, nessuna risorsa atomica viene aggiunta.
   - Sottoposto a `normalizeInput`: il branch `dirigenza` contiene esclusivamente la proprietà cache.
   - Eseguito in `fundEngine`: `result.compliance.dirigenzaArt23?.status` resta rigorosamente `'UNDETERMINED'`.
   - Nessuna autorità economica viene concessa alla cache legacy.
`DIRIGENZA_LEGACY_AFTER_EMPTY_REFACTOR = UNDETERMINED`

---

## Structural hydration audit

`hydrateFundData` per snapshot OPEN o legacy:
- Strutture aggiunte: esclusivamente forme strutturali minime necessarie per l'interfaccia e la navigazione:
  - `annoRiferimento`, `denominazioneEnte`
  - Array vuoti per collezioni (`proventiSpecifici: []`, `personale2018PerArt23: []`, `personaleAnnoRifPerArt23: []`)
  - Righe del personale in servizio con `count: undefined`
  - Oggetti vuoti per simulatori e modelli (`simulatoreInput: {}`, `ccnl2024: {}`, `historicalData: {}`, fondi `{}`)
  - Flag tecnici di modalità UI (`isDistributionMode: false`, `criteri_isConsuntivoMode: false`, `personaleServizio.isManualMode: false`).
- Nessun merge profondo nei sotto-oggetti dei fondi: `fondoDirigenzaData`, `fondoAccessorioDipendenteData`, ecc. non ricevono proprietà mancanti.
- Nessun resolver di dominio o verifica di conformità interpreta la presenza di questi array/oggetti vuoti o dei flag UI come attestazione economica o amministrativa.
`STRUCTURAL_SHAPE_SEMANTIC_LEAK = ABSENT`

---

## CLOSED hydration

Per snapshot con `metadata.snapshotStatus === 'CLOSED'`:
- `hydrateFundData` esegue una copia clonata distaccata (`structuredClone(snapshot)`) e la restituisce immediatamente come `FundData`, senza alcun merge con `createEmptyFundData`.
- Nessun campo strutturale mancante viene inserito.
- Proprietà `null`, `undefined` e `0` sono preservate integralmente byte per byte.
- La serializzazione JSON di prima e dopo l'idratazione è identica.
- `saveAnnualSnapshot` rifiuta esplicitamente la scrittura con motivazione `'SNAPSHOT_CLOSED'`.
`CLOSED_HYDRATION = PRESERVED`

---

## Historical-data lifecycle

L'analisi dell'architettura di persistenza e dello schema conferma:
- Non esiste una tabella indipendente `entity_historical_data`.
- I dati storici (`historicalData`) risiedono esclusivamente all'interno del payload JSON `fund_data` di ciascun record annuale (`current_year`).
- Il workflow di transizione anno `switchActiveYear` e quello di chiusura `closeYearAndPrepareNext` storicamente non hanno mai effettuato una copia generica di `historicalData` da anno N ad anno N+1.
- La classificazione `historicalData = ANNUAL_SNAPSHOT` è pertanto corretta e coerente con l'architettura applicativa preesistente.
`HISTORICAL_DATA_LIFECYCLE = ANNUAL_SNAPSHOT`

---

## Target snapshot precedence

Nel passaggio ad una nuova annualità:
- Se l'annualità target N+1 esiste già a database, `switchActiveYear` la carica tramite `loadAnnualSnapshot` e restituisce esattamente i dati persistiti, senza sovrascriverli con i factory vuoti né con i valori dell'anno N.
- Se l'annualità target contiene dati storici o zeri espliciti, essi vengono caricati intatti.
- Nessuna chiamata di inserimento o aggiornamento viene effettuata se il target è già presente.
`TARGET_SNAPSHOT_PRECEDENCE = PASS`

---

## Provisional year switch

Durante il cambio d'anno nel reducer (`SET_CURRENT_YEAR`):
- Lo stato temporaneo `fundData` viene inizializzato con `createEmptyFundData(action.payload, state.currentEntity?.name || '')`.
- Non espone più lo stato economico dell'anno N precedente durante il caricamento dell'anno N+1.
- In caso di errore nel caricamento dell'annualità target (`loadAnnualSnapshot` fallisce):
  - Il workflow restituisce `{ success: false, error: ... }`.
  - Non viene invocato `initializeAnnualSnapshot`.
  - Nessuno stato vuoto sovrascrive a database lo snapshot esistente.
`PROVISIONAL_YEAR_SWITCH = SAFE`

---

## Post-close N+1

Verifica del flusso di chiusura esercizio (`FUNC-02`):
- Chiusura atomica di N tramite `closeYearAndPrepareNext`.
- Nessuna scrittura successiva su N (garantita da immutabilità CLOSED).
- Preparazione automatica dell'annualità N+1:
  - Il riporto dei residui FAD (`vn_art80c1_sommeNonUtilizzateStabiliPrec`) viene calcolato e trasferito.
  - Lo stock DL25 qualificato viene propagato a `priorCumulativeApplied`.
  - Nessun dato demo viene iniettato.
  - Nessuna propagazione generica delle altre sezioni economiche di N.
`POST_CLOSE_N_PLUS_1 = PASS`

---

## DL25 / PNRR / FAD carry policies

1. **DL25 Carry-Forward**:
   Lo stock cumulato dell'anno N (es. 15.000 €) viene correttamente propagato all'anno N+1 come `priorCumulativeApplied` tramite `carryDl25ToNextYear` / `prepareDl25NextAnnuality`. L'isolamento impedisce qualsiasi trasferimento cross-entity.
   `DL25_CARRY_FORWARD = PRESERVED`
2. **PNRR N+1**:
   Una scelta PNRR esercitata nel 2026 non viene duplicata o propagata al 2027. Nel 2027 `pnrrExerciseDecision` e le risorse correlate restano `undefined`.
   `PNRR_N_PLUS_1 = NO_CARRY`
3. **FAD Residual Carry**:
   Il builder preesistente dei residui del fondo accessorio in `yearClosureWorkflow` calcola i residui e li posiziona in `vn_art80c1_sommeNonUtilizzateStabiliPrec` dell'anno successivo. Il meccanismo è rimasto intatto.
   `FAD_RESIDUAL_CARRY = PRESERVED`

---

## Entity/year isolation

1. **Isolamento tra Enti**:
   Due istanze `createEmptyFundData` per Enti A e B non condividono alcun riferimento annidato (`objects.has(bObject)` è sempre falso). La mutazione profonda di A lascia B rigorosamente inalterato e identico al clone congelato iniziale.
   `ENTITY_OBJECT_ISOLATION = PASS`
2. **Isolamento tra Anni**:
   La modifica dell'annualità target N+1 non altera in alcun modo i valori o le collezioni dell'annualità N di origine.
   `YEAR_OBJECT_ISOLATION = PASS`

---

## Factory purity

Ogni invocazione dei factory:
- `createEmptyAppState()`
- `createEmptyFundData()`
- `createEmptyHistoricalData()`
- `createEmptyAnnualData()`
- `createEmptyWizard2026DraftState()`

alloca istanze fresche e distinte per tutti gli array e oggetti annidati.
`EMPTY_FACTORY_PURITY = PASS`

---

## INITIAL compatibility exports

Le costanti di compatibilità esportate da `src/constants.ts` (`INITIAL_HISTORICAL_DATA`, `INITIAL_SIMULATORE_INPUT`, `INITIAL_ANNUAL_DATA`, `INITIAL_FONDO_SEGRETARIO_COMUNALE_DATA`, `INITIAL_DISTRIBUZIONE_RISORSE_DATA`, `INITIAL_FONDO_DIRIGENZA_DATA`, `INITIAL_FONDO_ACCESSORIO_DIPENDENTE_DATA`, `INITIAL_FONDO_ELEVATE_QUALIFICAZIONI_DATA`, `INITIAL_IVC_DATA`):
- Restano disponibili per non rompere eventuali import di tipi/costanti esterne.
- Sono ora popolate tramite chiamata ai factory vuoti (`createEmpty...()`).
- Nessun file sorgente di produzione (`src/`) importa o consuma questi oggetti come autorità di stato runtime.
`INITIAL_COMPAT_RUNTIME_AUTHORITY = ABSENT`

---

## Demo fixture isolation

Il dataset demo storico completo è stato collocato esclusivamente in `src/test/fixtures/legacyDemoFund.ts`.
Una scansione esaustiva di tutti i file di produzione dimostra:
- `LEGACY_DEMO_FIXTURE_PRODUCTION_IMPORTS = 0`
Nessun file di produzione importa da `legacyDemoFund` o dalla cartella `test/fixtures`.

---

## Test setup reconciliation

I 7 file di test preesistenti modificati per importare i valori di test da `src/test/fixtures/legacyDemoFund.ts`:
1. `src/contexts/__tests__/postCloseNavigation.integration.test.tsx`
2. `src/contexts/__tests__/AppContext.closedHardening.test.ts`
3. `src/contexts/__tests__/AppContext.antiContamination.test.ts`
4. `src/contexts/__tests__/closureInstructionReadiness.integration.test.tsx`
5. `src/pages/__tests__/DistribuzioneRisorsePage.explicitDraft.test.tsx`
6. `src/pages/__tests__/CabinaDiRegiaPage.wave41.integration.test.tsx`
7. `src/features/wizard2026/__tests__/dl25TestData.ts`

sono stati verificati tramite diff:
- Hanno modificato **esclusivamente** il modulo sorgente dell'import (da `constants` a `test/fixtures/legacyDemoFund`).
- Stessi dati di input numerici.
- Stesse asserzioni ed aspettative.
- Zero modifiche alle formule o alla logica di test.
`IMPORT_ONLY_TEST_EDITS = 7_OF_7`

---

## DL25 snapshot identity test

Nel file `src/application/__tests__/dl25Snapshot.test.ts`:
- L'asserzione originaria `toBe(defaults)` verificava che il repository ricevesse l'identità di riferimento dello stesso oggetto memory passato dal chiamante.
- In architetture sicure, il passaggio di riferimenti condivisi mutabili è un anti-pattern.
- L'aggiornamento mantiene la stretta uguaglianza profonda (`toStrictEqual(defaults)`) e aggiunge il controllo di non-identità di riferimento (`not.toBe(defaults)` e `not.toBe(defaults.fondoAccessorioDipendenteData)`).
- Tutte le asserzioni su stock e valori economici rimangono invariate.
`DL25_IDENTITY_TEST_UPDATE = LEGITIMATE_STRENGTHENING`

---

## Partial/full import

1. **Partial import**:
   Importando via CSV un singolo importo reale (3.210 €) e uno zero esplicito (0 €) per il 2016, entrambi i valori vengono preservati attraverso reducer, salvataggio a DB, ricaricamento e idratazione. I campi omessi rimangono `undefined` senza inserimento di valori demo.
   `PARTIAL_IMPORT = PASS`
2. **Full import**:
   Un import completo conserva integralmente l'economia dichiarata. Un import parziale senza dettagli Dirigenza non fabbrica alcuna proprietà atomica Dirigenza.
   `FULL_IMPORT_HYDRATION = PASS`

---

## Missing / zero / optional semantics

- `EXPLICIT_ZERO = PRESERVED`: uno zero inserito dall'utente per un dato storico o annuale è preservato come `0`, non viene trattato come campo assente.
- `REQUIRED_MISSING = PRESERVED`: campi obbligatori assenti restano `undefined`, senza collassare a zero.
- `OPTIONAL_ABSENCE = PRESERVED`: voci di finanziamento opzionali assenti continuano a contribuire zero solo attraverso i rispettivi resolver di calcolo.

---

## IVC / Art60

- `createEmptyAnnualData` inizializza `ccnl2024: {}` senza il modello `ivcConglobation`.
- L'assenza del modello non genera una falsa determinazione dell'importo di conglobamento Art. 60.
- Modelli IVC reali forniti dall'utente o salvati nello snapshot sono preservati.
`ART60_INITIALIZATION = PASS`

---

## Distribution / manual fields

- `createEmptyDistribuzioneRisorseData` mantiene unicamente `criteri_isConsuntivoMode: false`. I criteri di ripartizione percentuali (50, 20, 5) rimangono `undefined`.
- `personaleServizio` non inizializza più `manualProgressioni: 0`, `manualIndennita: 0`, `manualDipendentiEquivalenti: 0`. Tali valori rimangono `undefined` finché non esplicitati dall'utente in modalità manuale.
`DISTRIBUTION_DEFAULTS = PASS`
`MANUAL_PERSONNEL_DEFAULTS = PASS`

---

## App shell / persistence

Avvio di `AppProvider` senza ente selezionato:
- Nessun dato economico di test in memoria.
- Zero chiamate di `createState` o `upsertState` su Supabase.
- Zero tentativi di chiusura atomica.
- Stato di prontezza chiusura: `'NOT_READY'`.
`APP_SHELL = NEUTRAL_NO_WRITE`
`NEW_ENTITY_PERSISTED_EVIDENCE_FIELDS = NONE (0 economic/admin fields)`
`NEW_YEAR_PERSISTENCE = CLEAN`
`LOAD_FAILURE_SAFETY = PASS`

---

## Cabina

Per un ente vuoto:
1. Senza classificazione Art. 33: il motore di calcolo blocca l'elaborazione richiedendo una scelta esplicita.
2. Con classificazione esplicita (`DO_NOT_APPLY`) ma senza economia: `canonicalFund.status` è `'UNDETERMINED'`, e lo stato della Cabina di Regia è `'TO_COMPLETE'`. Non diventa mai `'CONSTITUTION_VERIFIED'`.
`CABINA_EMPTY = SAFE`

---

## Distribution readiness

Per un ente economicamente vuoto:
- `resolveDistributionFundBudget` restituisce `authoritativeFundTotal: null` e base di calcolo in modalità `'VERIFIED_DRAFT'` con importo 0.
- Nessun budget autoritativo fittizio viene esposto.
`DISTRIBUTION_EMPTY = SAFE_DRAFT_ONLY`

---

## Document readiness

Tutti e cinque i tipi di documento (`DETERMINA`, `RELAZIONE`, `PROSPETTO`, `TABELLA_15`, `ATTO_APPROVAZIONE`):
- Restano nello stato `'DRAFT_ONLY'`.
- Nessun documento finale può essere generato o validato per un ente privo di evidenza economica.
`DOCUMENT_EMPTY = DRAFT_ONLY`

---

## Closure readiness

- Per un ente economicamente vuoto, lo stato di prontezza chiusura è `'NOT_READY'`.
- La funzione `closeCurrentYear` fallisce prima di effettuare qualsiasi invocazione RPC o scrittura a database.
`CLOSURE_EMPTY = NOT_READY_ZERO_CALLS`

---

## No plausible total

Per un nuovo ente vuoto:
- `canonicalFund.total` = `null` (non autoritativo).
- `canonicalFund.verifiedTotal` = `0` (subtotale parziale/bozza, non finale certificato).
- Non viene prodotto alcun totale economico credibile da dati presunti.
`EMPTY_CANONICAL_TOTAL = NON_AUTHORITATIVE`

---

## Existing snapshot preservation

- Snapshot preesistenti con valori reali diversi dai vecchi demo mantengono esattamente la loro economia intatta prima e dopo l'idratazione.
- Snapshot che casualmente contengono valori numerici uguali a quelli dei vecchi campioni li conservano invariati (l'intervento non effettua data cleanup o mutazione retroattiva dei dati salvati).
`EXISTING_SNAPSHOT = PRESERVED`
`CLOSED_SPARSE_SNAPSHOT = PRESERVED`
`UNKNOWN_LEGACY_PROPERTIES = PRESERVED_SAFE`

---

## Wizard initialization

- La creazione e il reset del Wizard 2026 utilizzano `createEmptyWizard2026DraftState()`.
- Nessun valore numerico 2016, 2023 o 2025 di default.
- L'import parziale conserva i dati senza colmare i campi vuoti con demo.
`WIZARD_INITIALIZATION = EMPTY_FRESH`
`WIZARD_IMPORT = PASS`

---

## Active runtime demo inventory

- `UNSAFE_RUNTIME_DEMO_CONSUMERS = 0`
- `LITERAL_DEMO_LEAK = ABSENT`
Tutti i literal del vecchio sample rintracciati nel codice di produzione appartengono a placeholder UI, commenti o stringhe esemplificative di importazione, mai a valori di calcolo o default operativi.

---

## Golden / oracle

1. **Golden Results**:
   Confronto SHA-256 su `tests/fixtures/fondo/golden_results.json`: identico al byte rispetto al PRE di questo slice (`DC0A12CF4BC2EC16C892AED362ADAC2671BA44705155C84A588715EDABF49EF0`).
   `DATA01_GOLDEN_CHANGE = NONE`
2. **Oracle Normativo**:
   Esecuzione di `scripts/run_wave2_oracle.ts` (14 scenari):
   `passed = 14`, `total = 14`, exit code 0.
   `ORACLE_INTEGRITY = UNCHANGED_PASS`

---

## Regression / product suite

1. **Suite di Regressione Consolidata**:
   Esecuzione di `scripts/run_regression_tests.ts` (8 fixture reali del fondo):
   `8/8 superati`, exit code 0.
   `REGRESSION = 8/8_PASS`
2. **Full Product Suite Vitest**:
   - `1878/1878 PASS` su 137 test file.
   - Nessun fallimento residuo.
   `FULL_PRODUCT_TESTS = 1878/1878_PASS_137_FILES`

---

## Test harness review

I 65 test dedicati (`emptyFundInitialization.test.ts` e `AppContext.emptyInitialization.test.tsx`):
- Esercitano le factory reali, il provider React reale, l'idratazione reale, i boundary di persistenza realistici con mock di repository conformi all'infrastruttura, il cambio d'anno, la chiusura d'esercizio, l'import e tutti i resolver downstream.
- Non si limitano a verificare strutture dati statiche create ad hoc, ma mettono alla prova i flussi applicativi completi.
`TEST_HARNESS_REVIEW = PASS_HIGH_CONFIDENCE`
`IDENTITY_ASSERTION_REMEDIATION = LEGITIMATE_STRENGTHENING`
`FOCUSED_TEST_REMEDIATION = HARNESS_ONLY`

---

## Verified-fixed regressions

Nessuna regressione su tutti i finding precedentemente dichiarati `VERIFIED_FIXED`:
- `SEC_01_REGRESSION = NONE`
- `DATA_02_REGRESSION = NONE`
- `CALC_01_REGRESSION = NONE`
- `CALC_02_REGRESSION = NONE`
- `CALC_03_REGRESSION = NONE`
- `CALC_04_REGRESSION = NONE`
- `CALC_05_REGRESSION = NONE`
- `DOC_01_REGRESSION = NONE`
- `DOC_02_REGRESSION = NONE`
- `NORM_01_REGRESSION = NONE`
- `NORM_03_REGRESSION = NONE`
- `NORM_04_REGRESSION = NONE`
- `FUNC_01_REGRESSION = NONE`
- `FUNC_02_REGRESSION = NONE`

`ASTRA_BLOCKERS_OPEN = 0`

---

## Scope integrity

L'audit sui file modificati conferma:
- File preesistenti nel perimetro PRE: 1.338
- File preesistenti modificati: 15 (7 file di produzione + 7 file di import test + 1 test di isolamento identity)
- Nuovi file sorgente/test creati: 5
- Nuovo report: 1 (`EMPTY_FUND_INITIALIZATION_IMPLEMENTATION_REPORT.md`)
- File rimossi: 0
- File byte-identici: 1.323
- Nessuna modifica a golden, oracle, core PNRR, core DL25, core Dirigenza, migrazioni o Auth.
`SCOPE_INTEGRITY = PASS`

---

## DATA-01 final decision

Tutti i 44 criteri di accettazione e di controllo forense sono pienamente soddisfatti:
`DATA_01_FINAL_STATUS = VERIFIED_FIXED`
`EMPTY_FUND_INITIALIZATION = VERIFIED_FIXED`

---

## Updated theoretical ASTRA count

In base alla verifica positiva di DATA-01:
- `VERIFIED_FIXED` = 15
- `PARTIALLY_FIXED` = 7
- `OPEN` = 3
- `TOTAL` = 25
- `ASTRA_BLOCKERS_OPEN` = 0

*(Nota: la riconciliazione ASTRA ufficiale non è stata modificata nel repository durante questa review read-only, come da istruzioni).*

---

## Next recommended slice

L'analisi dei rischi residui tra i finding ancora aperti o parziali evidenzia:
- **Target raccomandato**: `ACTIVE_LEGACY_ECONOMIC_AUTHORITY_RETIREMENT` (target **ARCH-01**, P1).
- **Razionale architetturale**: Con la chiusura di CALC-04 e DATA-01, l'infrastruttura del fondo ha ora un'inizializzazione rigorosamente neutra ed un calcolo canonico deterministico. Tuttavia, `ARCH-01` rimane `PARTIALLY_FIXED` a causa della persistenza di percorsi legacy concorrenti (come `FundDetailsPage` e `constitution.sections`) che possono calcolare o visualizzare aggregati economici disallineati dal `canonicalFundLedger`. Chiudere definitivamente l'autorità economica legacy eliminerà alla radice il rischio di split-brain nel calcolo del fondo, aprendo la strada alla stabilizzazione delle restanti barriere di input monetario (`DATA-03`).

---
