# ASTRA — ART23_DIRIGENZA_DERIVED_CONSUMPTION INDEPENDENT REVIEW
## Forensic Audit & Independent Closure Verification: CALC-04 (Art. 23 Dirigenza Derived Consumption)

**Data review:** 2026-10-05\
**Auditor / Reviewer:** Principal Software Architect, Independent Reviewer, Domain-Model Auditor & Specialist in Local Government Public Employment Remuneration Caps (Art. 23, c. 2, D.Lgs. 75/2017)\
**Repository:** `dinopusceddu/entilocaliapp`\
**Target Branch:** `ux/toolbox-area-fondo-prototype`\
**Target HEAD:** `d3170f959b5815c514dbf3d6e5f93366a5f14c67`\
**Audit Target:** `CALC-04`\
**Slice sotto Review:** `ART23_DIRIGENZA_DERIVED_CONSUMPTION`

---

## 0. EXECUTIVE VERDICT & SUMMARY TABLE

A seguito dell'audit forense, dell'ispezione analitica del codice sorgente TypeScript/TSX, dell'analisi comparativa dei modelli di aggregazione del consumo del tetto 2016 (Art. 23, c. 2, D.Lgs. 75/2017), della verifica di immutabilità della fixture e della correzione mirata del golden, nonché dell'esecuzione dell'intera suite di regressione, degli oracoli e della suite di prodotto:

```text
================================================================================
ART23_DIRIGENZA_DERIVED_CONSUMPTION_STATUS = VERIFIED_FIXED
CALC-04_STATUS                             = VERIFIED_FIXED
ARCH-01_STATUS                             = PARTIALLY_FIXED (preservato)
================================================================================
PRE-REVIEW ASTRA OFFICIAL COUNTS  : VF = 13 | PF = 8 | OPEN = 4 | BLOCKERS = 0
POST-REVIEW ASTRA AUDIT COUNTS    : VF = 14 | PF = 7 | OPEN = 4 | BLOCKERS = 0
TOTAL FINDINGS                    : 25 / 25
REMAINING IMPLEMENTATION SLICES   : 17
REMAINING OPERATIONAL GATES       : 3
NEXT RECOMMENDED SLICE            : EMPTY_FUND_INITIALIZATION
================================================================================
```

### Matrice di Sintesi del Finding

| Finding ID | Titolo Sintetico | Severity Originale | Stato Pre-Review | Esito Audit Indipendente | Stato Post-Review |
|---|---|---|---|---|---|
| **CALC-04** | Derivazione consumo Art. 23 c. 2 Dirigenza da atomici e rimozione cache authority | **HIGH** | `PARTIALLY_FIXED` | **PASS (Totali sempre derivati, cache pura riconciliazione)** | **VERIFIED_FIXED** |
| **ARCH-01** | Concorrenza di autorità economiche e sezioni parallele | **HIGH** | `PARTIALLY_FIXED` | **PASS (Debito ridotto su Dirigenza, residuo sezioni preservato)** | `PARTIALLY_FIXED` |

---

## 1. BASELINE & VERIFICA STRICT READ-ONLY

L'audit indipendente è stato condotto in modalità **STRICT READ-ONLY**. Nessun file di codice applicativo, test, fixture o configurazione è stato modificato durante questa review.

- **Branch:** `ux/toolbox-area-fondo-prototype` (identico all'atteso).
- **HEAD:** `d3170f959b5815c514dbf3d6e5f93366a5f14c67` (identico all'atteso).
- **Index Git (staged):** Rigorosamente vuoto (`git diff --cached --name-status` vuoto).
- **Working Tree:** Modifiche tracked preesistenti e file di report/evidence pregressi intatti; nuovi file sorgente dello slice (`dirigenzaArt23.ts`, relativi test e report V2) presenti come atteso.
- **Rete ed Esecuzione:** Rigorosamente offline. Zero richieste di rete esterne (`PRODUCT_NETWORK_ATTEMPTS = 0`); 24 probe `localhost` in-memory intercettati internamente dal guard di Vitest. Staging, produzione e database remoti mai contattati.

---

## 2. ORIGINAL CALC-04 ACCEPTANCE

Il finding originale `CALC-04` è fondato sul principio cardine:
$$\text{TOTALI SEMPRE DERIVATI DALLE RISORSE ATOMICHE SOGGETTE}$$

Nel sistema legacy, la voce `lim_totaleParzialeRisorseConfrontoTetto2016` memorizzata nel payload `fondoDirigenzaData` agiva come authority economica concorrente (tramite `cache || 0` in `fundEngine.ts`). Di conseguenza, una variazione manuale o l'omissione di tale campo alterava il consumo del fondo Dirigenza e il consumo complessivo d'ente ai fini dell'Art. 23 c. 2.

**Criterio di Accettazione:**
A parità di componenti economiche atomiche inserite, la modifica, corruzione o cancellazione di `lim_totaleParzialeRisorseConfrontoTetto2016`:
- **NON** deve modificare il consumo del fondo Dirigenza;
- **NON** deve modificare il consumo complessivo Art. 23 dell'ente;
- **NON** deve modificare il margine residuo rispetto al tetto 2016;
- **NON** deve modificare l'esito di conformità (`isCompliant`);
- **NON** deve alterare lo stato di blocco (blocking/errors);
- **NON** deve alterare lo stato di Cabina di Regia;
- **NON** deve alterare la document readiness (DRAFT vs. FINAL_READY);
- **NON** deve alterare la closure readiness (NOT_READY vs. READY).

**Classificazione:**
`ORIGINAL_CALC04_ACCEPTANCE = SATISFIED`

---

## 3. RICOSTRUZIONE DEL CONFLITTO SUL GOLDEN (V1 vs. V2)

### 3.1 La natura del blocco V1
Nella prima iterazione (V1), l'implementazione si era arrestata su `ART23_DIRIGENZA_GOLDEN_CONFLICT`.
- La fixture congelata `tests/fixtures/fondo/ente-con-dirigenza.json` conteneva la risorsa atomica soggetta:
  `st_art57c2a_CCNL2020_unicoImporto2020 = 280000.0`
  mentre il campo cache `lim_totaleParzialeRisorseConfrontoTetto2016` era **assente**.
- Il codice previgente, leggendo `cache || 0`, valutava a `0` il contributo della Dirigenza al tetto 2016.
- Il file golden di regressione (`tests/fixtures/fondo/golden_results.json:148`) congelava l'aspettativa:
  `ammontareSoggettoLimite2016 = 1330000`
  comprendente esclusivamente FAD ($1.150.000\ \text{€}$ soggetti ex art. 67 c. 1) + EQ ($150.000\ \text{€}$) + Segretario ($30.000\ \text{€}$) $= 1.330.000\ \text{€}$, con contributo Dirigenza pari a $0\ \text{€}$.
- Una corretta derivazione economica dai dati atomici produce:
  $$1.330.000 + 280.000 = 1.610.000\ \text{€}$$
- Il vecchio golden cristallizzava formalmente l'aspettativa del **bug di mancato calcolo** della Dirigenza.

### 3.2 Valutazione Indipendente
La verifica indipendente conferma in modo inequivocabile che:
1. Il vecchio golden era viziato da un'aspettativa errata generata dalla mancata derivazione atomica.
2. Mantenere $1.330.000\ \text{€}$ avrebbe preteso che una risorsa dichiarata di $280.000\ \text{€}$ venisse ignorata nel tetto 2016, in palese violazione dell'art. 23 c. 2.
3. La risoluzione adottata in V2 non è stata un aggiustamento opportunistico per far passare i test, bensì la necessaria bonifica di una falsa aspettativa di regressione.

**Classificazione:**
`OLD_GOLDEN_CONTRACT = OBSOLETE_BUG_EXPECTATION`

---

## 4. IMMUTABILITÀ DELLA FIXTURE E SCOPE DELLA CORREZIONE GOLDEN

### 4.1 Immutabilità della Fixture di Input
È stato calcolato lo SHA-256 del file fixture congelato `tests/fixtures/fondo/ente-con-dirigenza.json`:
- **SHA-256 Atteso:** `BBBA37E21E47B879618FBBBAC43365E8D453D52B87A7EBFE63F94FA8EDC085E2`
- **SHA-256 Rilevato:** `BBBA37E21E47B879618FBBBAC43365E8D453D52B87A7EBFE63F94FA8EDC085E2`
- `git diff tests/fixtures/fondo/ente-con-dirigenza.json` è **completamente vuoto**.

**Classificazione:**
`FROZEN_FIXTURE_INTEGRITY = BYTE_IDENTICAL`

### 4.2 Ambito Chirurgico dell'Aggiornamento Golden
L'ispezione del diff su `tests/fixtures/fondo/golden_results.json` evidenzia un intervento rigidamente limitato a:
- **Uno scenario:** `ente-con-dirigenza.json`
- **Una chiave:** `ammontareSoggettoLimite2016` da `1330000` a `1610000`
- Nessun'altra chiave (totale fondo, stabile, variabile, limite 2016, altri enti) è stata modificata.

**Classificazione:**
`GOLDEN_CORRECTION_SCOPE = ONE_SCENARIO_ONE_KEY`

### 4.3 Indipendenza del Codice dal Golden
Il nuovo resolver `resolveDirigenzaArt23Subject` e il motore `fundEngine.ts` non contengono alcun riferimento testuale o numerico cablato al golden o al valore `1610000`. Il risultato scaturisce unicamente dalla somma pura al centesimo delle risorse atomiche presenti.

**Classificazione:**
`GOLDEN_DRIVEN_IMPLEMENTATION = ABSENT`

---

## 5. CLASSIFICAZIONE DEL DOMINIO E SEMANTICA DELLE RISORSE

### 5.1 Le 8 Risorse Soggette ad Art. 23 c. 2
Le risorse classificate come **soggette** nel resolver (`DIRIGENZA_ART23_SUBJECT_FIELDS`) sono:
1. `st_art57c2a_CCNL2020_unicoImporto2020` (Unico importo consolidato 2020)
2. `st_art57c2a_CCNL2020_riaPersonaleCessato2020` (RIA cessati entro il 2020)
3. `st_art57c2c_CCNL2020_riaCessatidallAnnoSuccessivo` (RIA cessati anni successivi)
4. `st_art57c2e_CCNL2020_risorseAutonomeStabili` (Risorse autonome stabili)
5. `va_art57c2d_CCNL2020_sommeOnnicomprensivita` (Somme onnicomprensività)
6. `va_art57c2e_CCNL2020_risorseAutonomeVariabili` (Risorse autonome variabili)
7. `va_art33c2_DL34_2019_incrementoDeroga` (Incremento deroga DL 34/2019)
8. `va_compensiExLege_rilevanti` (Compensi ex lege rilevanti)

Confrontando tale elenco con la formula previgente in `FondoDirigenzaPage.tsx:58-67`, le 8 voci coincidono esattamente. Nessuna nuova risorsa è stata introdotta o riclassificata arbitrariamente.

**Classificazione:**
`SUBJECT_FIELD_CLASSIFICATION = PRESERVED_EXISTING_POLICY`

### 5.2 Le 11 Risorse Escluse da Art. 23 c. 2
Le risorse classificate come **escluse** (`DIRIGENZA_ART23_EXCLUDED_FIELDS`) sono:
1. `st_art56c1_CCNL2020_incremento1_53MonteSalari2015`
2. `st_art39c1_CCNL2024_incremento2_01MonteSalari2018`
3. `st_art24c1_CCNL2022_2024_incremento3_05MonteSalari2021`
4. `va_art57c2b_CCNL2020_risorseLeggeSponsor`
5. `va_art57c3_CCNL2020_residuiAnnoPrecedente`
6. `va_dl13_2023_art8c3_incrementoPNRR`
7. `va_art39c1_CCNL2024_recupero0_46MonteSalari2018_2020`
8. `va_art39c1_CCNL2024_recupero2_01MonteSalari2018_2021_2023`
9. `va_art39c2_CCNL2024_incremento0_22MonteSalari2018_valorizzazione`
10. `va_art24c3_CCNL2022_2024_incremento0_22MonteSalari2021`
11. `va_compensiExLege_nonRilevanti`

Anche per le risorse escluse la policy storica della pagina e delle linee guida di comparto è integralmente preservata.

**Classificazione:**
`EXCLUDED_FIELD_CLASSIFICATION = PRESERVED_EXISTING_POLICY`

### 5.3 Semantica delle Voci Opzionali vs. Dati Mancanti
Tutte le 19 proprietà del fondo dirigenza sono dichiarate opzionali (`?: number`) nell'interfaccia `FondoDirigenzaData` e convalidate tramite `MonetarySchema` opzionale in Zod. L'assenza di una voce specifica non costituisce un'incompletezza istruttoria, bensì attesta l'assenza di quello stanziamento (contributo pari a zero).

**Classificazione:**
`OPTIONAL_RESOURCE_ABSENCE = ZERO_CONTRIBUTION`

---

## 6. RED TEAM: PRESENZA DEL MODELLO ATOMICO E DISTINZIONE LEGACY CACHE

### 6.1 Meccanismo di Riconoscimento del Modello di Dettaglio
Il rischio critico analizzato dall'audit riguarda la capacità del resolver di distinguere tra:
- **Caso A (Payload Legacy Cache-Only):** Uno snapshot storico o un import in cui non è mai stato compilato il dettaglio atomico del fondo Dirigenza e sussiste unicamente il campo `lim_totaleParzialeRisorseConfrontoTetto2016` (o l'oggetto vuoto `{}`).
- **Caso B (Modello UI Dichiarato Bianco/Zero):** Un ente con dirigenza in cui l'utente ha aperto e salvato la scheda Dirigenza senza valorizzare risorse soggette, rappresentando legittimamente uno stanziamento soggetto nullo.

Nel file `src/logic/calculation/dirigenzaArt23.ts`:
```ts
const allFields = [...DIRIGENZA_ART23_SUBJECT_FIELDS, ...DIRIGENZA_ART23_EXCLUDED_FIELDS];
if (!data || !allFields.some(field => Object.prototype.hasOwnProperty.call(data, field))) {
  return {
    status: 'UNDETERMINED',
    subjectAmount: null,
    excludedAmount: null,
    issues: ['DIRIGENZA_RESOURCE_DETAIL_MISSING'],
  };
}
```

### 6.2 Segnali di Discriminazione e Invarianza di Roundtrip
1. **Segnale Payload Legacy:**
   `RAW_LEGACY_SIGNAL = NO_OWN_PROPERTY_OF_ANY_ATOMIC_RESOURCE_FIELD`
   In uno snapshot legacy con sola cache, nessuna delle 19 chiavi atomiche è presente come *own property*. La condizione `allFields.some(...)` restituisce `false`. L'esito è rigorosamente **`UNDETERMINED`** (fail-closed), inibendo l'approvazione definitiva di dati non istruiti.
2. **Segnale Modello Dichiarato UI:**
   `DECLARED_UI_SIGNAL = AT_LEAST_ONE_OWN_PROPERTY_AMONG_19_ATOMIC_FIELDS`
   Nel modello UI o nei dati istruiti, i campi atomici sono presenti nell'oggetto (anche se con valore `undefined`, `null` o `0`). In tal caso il resolver rileva la presenza del modello di dettaglio, somma le risorse presenti (zero) e restituisce **`VALID`** con `subjectAmount = 0`.
3. **Verifica Fabbricazione di Default (`Default Fabrication`):**
   L'audit ha verificato il comportamento di `normalizeInput` e `loadAnnualSnapshot`: tali layer non iniettano chiavi atomiche fittizie su oggetti storici cache-only. Il segnale legacy non viene mascherato.
4. **Verifica Roundtrip Save / Reload:**
   - Modello dichiarato a zero $\to$ Save $\to$ Reload $\to$ `VALID ZERO`.
   - Modello legacy cache-only $\to$ Load $\to$ `UNDETERMINED` (nessuna migrazione silenziosa).
   - Modello con atomico $280.000\ \text{€}$ $\to$ Save $\to$ Reload $\to$ `VALID 280000`.

**Classificazioni:**
- `RAW_CACHE_ONLY_AFTER_NORMALIZATION = UNDETERMINED`
- `DETAIL_MODEL_DEFAULT_FABRICATION = ABSENT`
- `BLANK_UI_MODEL = VALID_ZERO`
- `DETAIL_MODEL_ROUNDTRIP = PASS`

---

## 7. PUREZZA DEL RESOLVER, ISOLAMENTO DELLA CACHE E TOLLERANZA AL VELENO

### 7.1 Purezza del Resolver Economico
Il tipo di input per il calcolo economico è `DirigenzaAtomicData = Omit<FondoDirigenzaData, 'lim_totaleParzialeRisorseConfrontoTetto2016'>`.\
Il test unitario `dirigenzaArt23.test.ts:68-74` definisce un getter con eccezione bloccante (`throw new Error('Cache must not be read')`) sulla proprietà cache: il resolver esegue il calcolo economico senza sollevare l'eccezione, dimostrando l'assoluta purezza di lettura.

**Classificazione:**
`CACHE_READ_BY_ECONOMIC_RESOLVER = NO`

### 7.2 Riconciliazione Separata come Metadata
La funzione `reconcileDirigenzaArt23Cache` opera esclusivamente **dopo** che il calcolo economico atomico si è concluso. Restituisce uno stato informativo (`ABSENT`, `RECONCILED`, `MISMATCH`, `INVALID_CACHE`, `UNAVAILABLE`) allocato unicamente in `calculationResult.compliance.dirigenzaArt23.reconciliation`. Nessuno di questi metadati influenza importi economici, totali di bilancio, indici di compliance o blocchi operativi.

**Classificazione:**
`CACHE_RECONCILIATION_ONLY = YES`

### 7.3 Test di Avvelenamento della Cache (Cache Poisoning Invariance)
L'audit ha verificato il comportamento del sistema iniettando valori arbitrari di cache nel dataset congelato:
`cache = undefined, null, 0, 1, 2000, 280000, 999999, NaN, Infinity, 'malformed'`
In tutti i casi:
- Soggetto Dirigenza $= 280.000\ \text{€}$ esatti;
- Soggetto complessivo Ente $= 1.610.000\ \text{€}$ esatti;
- Limite $2016 = 1.680.000\ \text{€}$;
- Margine residuo $= 70.000\ \text{€}$;
- `isCompliant = true`.

**Classificazione:**
`CACHE_POISONING_INVARIANCE = PASS`

### 7.4 Analisi dei Controesempi Chiave
- **Controesempio Originale CALC-04:**
  Dirigenza derivata $= 2.000\ \text{€}$, limite disponibile $= 1.000\ \text{€}$, cache variata a $0, 2.000, 999.999\ \text{€}$.
  Esito: sempre non conforme (`isCompliant: false`, Cabina: `BLOCKED`, Documenti: `DRAFT_ONLY`, Chiusura: `NOT_READY`).
  `ORIGINAL_COUNTEREXAMPLE = FIXED`
- **Prevenzione Falso Positivo da Cache:**
  Dirigenza derivata $= 500\ \text{€}$, limite $= 1.000\ \text{€}$, vecchia cache $= 2.000\ \text{€}$.
  Esito: conforme (`isCompliant: true`, Cabina: `CONSTITUTION_VERIFIED`, Documenti: `FINAL_READY`), stato di riconciliazione `MISMATCH`. La cache non provoca più un falso sforamento.
  `FALSE_POSITIVE_CACHE = FIXED`
- **Derivato Zero con Cache Positiva:**
  Modello atomico dichiarato $= 0\ \text{€}$, cache $= 5.000\ \text{€}$.
  Esito: soggetto Dirigenza $= 0\ \text{€}$, nessun fallback alla cache.
  `DERIVED_ZERO_CACHE_POSITIVE = ZERO_NO_FALLBACK`
- **Valori Atomici Non Validi:**
  L'inserimento di valori `NaN`, `Infinity`, negativi o non numerici produce lo stato `INVALID` e blocca fail-closed.
  `DIRIGENZA_LOCAL_INVALID_HANDLING = FAIL_CLOSED`
- **Ente senza Dirigenza (`hasDirigenza = false`):**
  L'eventuale presenza di cache o dati sporchi residui viene ignorata: contributo pari a zero esatto.
  `NO_DIRIGENZA_PERIMETER = ZERO`
- **Compatibilità Flag `hasDirigenza`:**
  Un flag esplicitamente `null` produce `UNDETERMINED`. L'omissione `undefined` nel motore/pagina adotta il preesistente default `false`.
  `HAS_DIRIGENZA_COMPATIBILITY = PRESERVED`

---

## 8. AGGREGAZIONE COMPLESSIVA D'ENTE, ISOLAMENTO FAD E CONSUMO PROVVISORIO

### 8.1 Aggregazione d'Ente (Whole-Entity Aggregation)
Il calcolo del tetto unico 2016 consolida tutte le componenti senza duplicazioni:
$$\text{FAD (500)} + \text{EQ (100)} + \text{Segretario (100)} + \text{Dirigenza (200)} + \text{Straordinario (100)} = 1.000\ \text{€}$$
I test confermano che ciascuna voce concorre esattamente una volta.

**Classificazione:**
`WHOLE_ENTITY_AGGREGATION = PASS`

### 8.2 Isolamento del Ledger FAD
Nessuna riga o stanziamento relativo alla Dirigenza viene inserito nel ledger canonico FAD (`canonicalFundLedger`). L'economia e le entry del FAD rimangono byte-identiche.

**Classificazione:**
`FAD_LEDGER_CONTAMINATION = ABSENT`

### 8.3 Rischio di Bypass da Zero Provvisorio (Provisional Zero Risk)
L'audit ha esaminato tutti i consumer della proprietà numerica `comp_dirigenza`.
Quando la Dirigenza si trova nello stato `UNDETERMINED` o `INVALID`, `comp_dirigenza` riporta `0` come segnaposto di subtotale noto, ma:
- `art23c2.isCompliant` richiede tassativamente `dirigenzaArt23.status === 'VALID'`; se non valido, restituisce `false`;
- `canonicalFund.status` viene degradato a `UNDETERMINED` o `INVALID`;
- `canonicalFund.missingPrerequisites` incorpora gli issue della Dirigenza;
- Cabina di Regia, Document Readiness e Chiusura Annuale leggono lo stato formale e bloccano l'avanzamento.
Nessun componente downstream scambia lo zero provvisorio per conformità definitiva.

**Classificazione:**
`PROVISIONAL_ZERO_BYPASS = ABSENT`

---

## 9. CABINA DI REGIA, DOCUMENT READINESS E CHIUSURA ANNUALE

I resolver di gating downstream interagiscono correttamente con lo stato della Dirigenza:

| Stato Dirigenza / Art. 23 | Cabina di Regia | Tutti i 5 Tipi di Documento | Chiusura Annuale |
|---|---|---|---|
| **INVALID** (dato corrotto) | `BLOCKED` | `DRAFT_ONLY` | `NOT_READY` |
| **UNDETERMINED** (dettaglio assente) | `TO_COMPLETE` | `DRAFT_ONLY` | `NOT_READY` |
| **VALID Sforamento** (delta > 0) | `BLOCKED` | `DRAFT_ONLY` | `NOT_READY` |
| **VALID Conforme** (delta $\le$ 0) | `CONSTITUTION_VERIFIED` | `FINAL_READY` | `READY` |

L'avvelenamento della cache non altera nessuno di questi stati.

**Classificazioni:**
- `COMPLIANCE = PASS`
- `CABINA = PASS`
- `DOCUMENT_READINESS = PASS`
- `CLOSURE_READINESS = PASS`

---

## 10. IMMUTABILITÀ DI CLOSED E DISMISSIONE DEL PAGE WRITER

### 10.1 Immutabilità dello Stato CLOSED
Nei test di ciclo di vita e rendering di annualità chiuse (`snapshotStatus = CLOSED`), l'eventuale mismatch di cache non provoca alcun dispatch, nessuna riscrittura nel database e nessuna alterazione dello snapshot.

**Classificazione:**
`CLOSED_IMMUTABILITY = PASS`

### 10.2 Dismissione del Page Writer
In `src/pages/FondoDirigenzaPage.tsx`, il previgente `useEffect` che inviava l'azione `UPDATE_FONDO_DIRIGENZA_DATA` per persistere `lim_totaleParzialeRisorseConfrontoTetto2016` è stato **completamente eliminato**.
- Il campo a schermo è disabilitato e mostra esclusivamente l'importo derivato da `dirigenzaArt23.subjectAmount`.
- Non esistono più writer automatici della cache.

**Classificazione:**
`ACTIVE_CACHE_WRITERS = 0`

---

## 11. RICONCILIAZIONE DEI TEST STORICI ED EPISODIO DEI 18 FAILURES

### 11.1 Aggiornamento dei Test Legacy Cache-Only
Tre test storici sono stati aggiornati:
1. `art23Complessivo.test.ts` (Caso 6): Il test attendeva un contributo di $35.000\ \text{€}$ da un payload con sola cache; ora verifica che, in assenza di dettaglio atomico, il contributo sia $0\ \text{€}$ e lo stato sia `UNDETERMINED`.
2. `art23Complessivo.test.ts` (Caso 8): Il segnaposto numerico è $0\ \text{€}$ e lo stato è `UNDETERMINED`.
3. `mod031bEqSegretarioTotals.test.ts`: Il vecchio test contava $40.000\ \text{€}$ di cache portando il totale a $175.000\ \text{€}$ con sforamento; ora verifica subtotale noto $135.000\ \text{€}$, margine provvisorio $25.000\ \text{€}$ e stato `UNDETERMINED`.

Tutti gli input di test sono stati mantenuti intatti; nessuna asserzione è stata indebolita o soppressa.

**Classificazione:**
`LEGACY_TEST_RECONCILIATION = LEGITIMATE`

### 11.2 Revisione dei 18 Fallimenti Iniziali della Full Suite
Durante la prima esecuzione della suite completa, si erano verificati 18 fallimenti nei test di navigazione e chiusura annuale.
- **Causa accertata:** Il resolver considerava erroneamente qualsiasi riga opzionale con valore `undefined` come un prerequisito mancante, classificando indebitamente come `UNDETERMINED` modelli UI legittimamente compilati.
- **Risoluzione:** Il controllo di presenza è stato corretto vincolandolo all'esistenza di almeno una *own property* tra le 19 risorse atomiche (`allFields.some(...)`), consentendo alle singole righe opzionali non valorizzate di contribuire con zero.
- Nessun test o input esterno è stato manomesso per far passare la suite.

**Classificazione:**
`EIGHTEEN_FAILURE_REMEDIATION = SEMANTIC_FIX`

---

## 12. VERIFICA SUITE DI REGRESSIONE, ORACOLO E PRODUCT SUITE

L'audit ha rieseguito i controlli di integrità:
1. **Test di Regressione (Consolidato):** `scripts/run_regression_tests.ts` $\to$ **8/8 PASS**.
2. **Oracoli Normativi Wave 2:** `scripts/run_wave2_oracle.ts` $\to$ **14/14 PASS** (`ORACLE_INTEGRITY = UNCHANGED_PASS`).
3. **Compilazione TypeScript:** `npx tsc --noEmit` $\to$ **0 errori**.
4. **Full Product Suite:** Esecuzione Vitest su 135 file di test $\to$ **1813/1813 test PASS** (100% successo).
5. **Affidabilità Test Harness:** I nuovi test utilizzano i componenti e i flussi reali senza formule duplicate.
   `TEST_HARNESS_REVIEW = PASS_HIGH_CONFIDENCE`.

---

## 13. CENSIMENTO DELLE AUTORITÀ ATTIVE E GAP DI ADEGUAMENTO LIMITE

### 13.1 Censimento Globale della Cache
La ricerca globale del campo `lim_totaleParzialeRisorseConfrontoTetto2016` conferma che:
- Non vi è alcun componente che lo utilizzi più come autority economica attiva.
- Le occorrenze residue sono limitate a compatibilità di persistenza, metadati di riconciliazione e documentazione storica.

**Classificazione:**
`ACTIVE_DIRIGENZA_CACHE_AUTHORITIES = 0`

### 13.2 Campo Adeguamento Annuale Tetto
Il campo `lim_art23c2_DLGS75_2017_adeguamentoAnnualeTetto2016` (regolazione manuale del limite) è rimasto inalterato e non costituisce un'autorità economica concorrente per il consumo della Dirigenza.

**Classificazione:**
`DIRIGENZA_LIMIT_ADJUSTMENT_MATERIAL_GAP = NO_GAP_OUT_OF_SCOPE`

---

## 14. STATO ARCHITETTURALE DI ARCH-01 E NON-REGRESSIONE

### 14.1 Stato di ARCH-01
Sebbene lo slice ritiri con successo la cache concorrente della Dirigenza, l'architettura applicativa presenta ancora sezioni parallele non migrate in `FundDetailsPage/constitution.sections`. ARCH-01 non viene pertanto promosso a VERIFIED_FIXED.

**Classificazione:**
`ARCH_01_FINAL_STATUS = PARTIALLY_FIXED`

### 14.2 Assenza di Regressioni sui Finding Chiusi
Tutti i 13 finding precedentemente verificati e chiusi rimangono intatti e pienamente operativi:
- `SEC-01`: NONE
- `DATA-02`: NONE
- `CALC-01`: NONE
- `CALC-02`: NONE
- `CALC-03`: NONE
- `CALC-05`: NONE
- `DOC-01`: NONE
- `DOC-02`: NONE
- `NORM-01`: NONE
- `NORM-03`: NONE
- `NORM-04`: NONE
- `FUNC-01`: NONE
- `FUNC-02`: NONE

`ASTRA_BLOCKERS_OPEN = 0`.

---

## 15. DECISIONE FINALE SU CALC-04 E CONTEGGIO TEORICO ASTRA

Tutti i 30 criteri di verifica prescritti per la chiusura indipendente sono stati pienamente e positivamente riscontrati.

```text
RESULT = PASS
CALC_04_FINAL_STATUS = VERIFIED_FIXED
ART23_DIRIGENZA_DERIVED_CONSUMPTION = VERIFIED_FIXED
```

### Riconciliazione Statistica Teorica ASTRA (25 Finding)

| Categoria di Stato | Pre-Review CALC-04 | Variazione | Post-Review CALC-04 |
|---|---:|---:|---:|
| **VERIFIED_FIXED** | 13 | +1 | **14** |
| **PARTIALLY_FIXED** | 8 | -1 | **7** |
| **OPEN** | 4 | 0 | **4** |
| **NOT_VERIFIED** | 0 | 0 | **0** |
| **ACCEPTED_LIMITATION** | 0 | 0 | **0** |
| **OUT_OF_SCOPE** | 0 | 0 | **0** |
| **TOTALE** | **25** | **0** | **25** |

- **BLOCKERS OPEN:** **0**
- **HIGH OPEN:** **2** (`DATA-03`, `ACCESS-01`)
- **MEDIUM OPEN:** **2** (`FUNC-03`, `ACCESS-02`)

---

## 16. PROSSIMA PRIORITÀ RACCOMANDATA

Con la chiusura di `ART23_DIRIGENZA_DERIVED_CONSUMPTION`, **tutti gli slice implementativi di priorità P0 sono stati completati e verificati con successo**.
I residui P0 sono costituiti esclusivamente dai due gate operativi (`AUTH_PROFILE_ROLE_PENDING_GATE` e `AUTH_EDGE_DEPLOYMENT_AND_RUNTIME_VALIDATION`), che richiedono sessioni e autorizzazioni dedicate per l'accesso all'infrastruttura di runtime.

Tra gli slice implementativi residui (priorità P1):
- `EMPTY_FUND_INITIALIZATION` (DATA-01)
- `MONETARY_INPUT_BOUNDARY` (DATA-03)
- `ACTIVE_LEGACY_ECONOMIC_AUTHORITY_RETIREMENT` (ARCH-01)
- `CCNL_RECOVERY_INSTRUCTION` (NORM-02)
- `AUTH_ROLE_MIRROR_CONTRACT` (ARCH-02)
- `ARCH_PERSIST_01_MULTIWRITER_CAS`

```text
================================================================================
NEXT_GATE_RECOMMENDATION = EMPTY_FUND_INITIALIZATION
Priorità                : P1
Finding target          : DATA-01 (promozione a VERIFIED_FIXED)
Motivazione             : Evita che l'inizializzazione di un nuovo ente o nuova annualità
                          erediti o contamini lo stato con importi demo non verificati,
                          garantendo la corretta tabula rasa amministrativa upstream.
================================================================================
```
