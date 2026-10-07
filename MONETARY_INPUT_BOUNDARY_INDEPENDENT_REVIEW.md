# MONETARY_INPUT_BOUNDARY — INDEPENDENT REVIEW
## DATA-03: Audit indipendente del boundary monetario, range tecnico, parser, schema, UI, import, transfer, persistence e aggregate fail-closed

---

## Executive verdict

L'audit indipendente condotto sullo slice `MONETARY_INPUT_BOUNDARY` (finding target **DATA-03**) attesta che la remediation implementata soddisfa integralmente e senza riserve il principio architetturale cardine:

> **INVALID MONEY NEVER CROSSES THE INPUT/PERSISTENCE BOUNDARY**
> Nessun importo monetario malformato, non-finito, con segno errato, precisione non consentita o fuori range tecnico può entrare nel dominio di calcolo, contaminare lo stato applicativo o raggiungere il layer di persistenza.
> Gli aggregati fuori range falliscono in modo controllato (fail-closed) producendo uno stato esplicito `INVALID` e bloccando la persistenza senza eccezioni non gestite di Big.js.

Le verifiche forensi, statiche e dinamiche confermano:
1. **Range tecnico, non business cap**: La soglia di validità deriva dal limite di rappresentazione esatta in minor units rispetto a `Number.MAX_SAFE_INTEGER` alla scala 2 (`90.071.992.547.409,90 €`), senza limiti arbitrari o normativi.
2. **Census esaustivo e centralizzato**: 399 campi di origine (298 esterni scale 2, 101 derivati/cache) e 324 alias snapshot verificati, per un totale di 723 path monetari coperti dalla shared authority (`src/domain/monetaryBoundary.ts` e `src/domain/monetaryPolicies.ts`). Zero gap di registro.
3. **Quarantena di calcolo fail-closed**: I dati grezzi invalidi non vengono silenziosamente corretti o cancellati dall'oggetto originale; una copia di runtime quarantinata consente il calcolo di subtotali verificati ma impone `status: 'INVALID'`, `total: null` e blocca il salvataggio.
4. **Protezione a tutti i confini**: UI (`MonetaryInput` trattiene draft invalidi senza invocare il domain writer), riduttori (rifiuto atomico di mutation invalide), import CSV/XLS (rifiuto atomico senza mutazioni parziali), transfer Wizard (blocco preventivo di snapshot e rollback) e repository (difesa in profondità prima di qualsiasi chiamata remota).
5. **Preservazione dei contratti esistenti**: Immutati i comportamenti di `DATA-01` (missing vs zero), `CALC-04` (own-property check su cache Dirigenza), `ARCH-01` (single economic authority), `PNRR`, `DL25` e `Art. 60`.

Tutti i gate di controllo risultano **GREEN**:
- Full product suite Vitest: **1988/1988 PASS** su 144 test file (0 failed, 0 pending, 0 nuovi skip)
- Test mirati nuovi: **86/86 PASS** (85 in 5 file dedicati + 1 caso repository)
- Regressione consolidata: **8/8 PASS**
- Oracle normativo Wave 2: **14/14 PASS**
- Golden results hash: **Invariato** (`DC0A12CF4BC2EC16C892AED362ADAC2671BA44705155C84A588715EDABF49EF0`)
- TypeScript `tsc --noEmit`: **0 errori**
- `git diff --check`: **0 violazioni**
- Rete: **STRICT OFFLINE** (0 tentativi di rete di prodotto, 0 connessioni esterne)

**Verdetto finale:**
- `RESULT = PASS`
- `DATA_03_FINAL_STATUS = VERIFIED_FIXED`
- `MONETARY_INPUT_BOUNDARY = VERIFIED_FIXED`

---

## Baseline

La verifica di conformità dello stato git restituisce:
- **Branch**: `ux/toolbox-area-fondo-prototype`
- **HEAD commit**: `d3170f959b5815c514dbf3d6e5f93366a5f14c67`
- **Cached index**: pulito (`git diff --cached --name-status` vuoto)
- **Working tree**: working tree dirty intenzionale, preservato.

Stato ASTRA prima della review:
- `VERIFIED_FIXED` = 16
- `PARTIALLY_FIXED` = 6
- `OPEN` = 3
- `TOTAL` = 25
- `ASTRA_BLOCKERS_OPEN` = 0

Stato teorico con la chiusura di DATA-03:
- `VERIFIED_FIXED` = 17
- `PARTIALLY_FIXED` = 5
- `OPEN` = 3
- `TOTAL` = 25
- `ASTRA_BLOCKERS_OPEN` = 0

*(Nota: la riconciliazione ASTRA ufficiale non è stata modificata durante questa review read-only).*

---

## Original DATA-03 acceptance

Il finding `DATA-03` richiedeva che input monetari malformati, non-finiti, negativi non consentiti o privi di range sicuro non potessero penetrare nel dominio di calcolo o essere serializzati a database.

L'accettazione originale:
`INVALID MONEY NEVER CROSSES THE INPUT/PERSISTENCE BOUNDARY`
risulta verificata:
- I valori malformati non entrano nel dominio;
- I valori non-finiti (NaN, +/-Infinity) non entrano;
- I valori con segno errato non entrano;
- I valori con precisione eccessiva (>2 decimali per input esterni) non entrano;
- I valori fuori safe range non entrano;
- Gli aggregati non rappresentabili producono esito `INVALID` fail-closed;
- La persistenza non riceve dataset invalidi (chiamate repository = 0);
- Big.js non produce eccezioni applicative non catturate;
- I dati legacy corrotti restano leggibili e correggibili senza silenti riparazioni automatiche.

Classificazione:
`ORIGINAL_DATA03_ACCEPTANCE = SATISFIED`

---

## Previous range stop reproduction

È stata riprodotta indipendentemente la condizione che aveva causato lo stop obbligatorio precedente:
- Due valori individuali `1e308` sono numeri finiti per JavaScript (`Number.isFinite(1e308) === true`).
- La loro somma nativa produce `Infinity`.
- L'istanziazione `new Big(1e308 + 1e308)` solleva l'eccezione non gestita:
  `[big.js] Invalid number`
- Inoltre, la serializzazione JSON di `Infinity` produce `null`, provocando una silent mutation corrotta a database.

La riproduzione dimostra che una semplice policy `FINITE_DOMAIN_ONLY` era architetturalmente insufficiente. L'arresto precedente è stato pienamente legittimo.

Classificazione:
`PREVIOUS_RANGE_STOP = LEGITIMATE`

---

## Technical range policy

La policy adottata è:
`SAFE_SCALED_EXTERNAL_INPUT_PLUS_AGGREGATE_FAIL_CLOSED`
con natura:
`TECHNICAL_REPRESENTATION_BOUNDARY`

La soglia non è un business cap arbitrario o una limitazione economica introdotta artificiosamente:
- Non sono stati usati tetti arbitrari (`1e9`, `1e12`, ecc.).
- Non è stato usato `Number.MAX_VALUE` (che porterebbe a overflow in `Infinity`).
- Il limite deriva rigorosamente dal massimo intero rappresentabile senza perdita in JavaScript (`Number.MAX_SAFE_INTEGER = 9007199254740991`) sulle minor units alla scala dichiarata.

Classificazione:
`RANGE_POLICY_NATURE = TECHNICAL`

---

## Safe minor-unit implementation

L'ispezione di `parseMonetaryValue` in `src/domain/monetaryBoundary.ts` conferma:
- L'importo decimale viene prima convertito in `Big` dalla stringa canonica.
- Viene calcolato `minor = decimal.times(new Big(10).pow(scale))`.
- Il confronto `minor.abs().gt(maxMinorUnits)` viene effettuato in aritmetica esatta `Big` **PRIMA** di qualsiasi conversione a `Number`.
- Non viene utilizzata l'aritmetica Number insicura (`Number(value) * 100`).

Classificazione:
`SAFE_RANGE_CHECK = BIG_DECIMAL_PRECONVERSION`

---

## Range-edge red team

È stato eseguito un test puntuale ai margini della scala 2 (`scale = 2`):
1. `90071992547409.90`:
   - Minor units = `9007199254740990` (< `MAX_SAFE_INTEGER`).
   - Rappresentabile esattamente come JS Number: round-trip `new Big(Number(d).toString()).eq(d)` confermato.
   - Esito reale: `VALID` (valore `90071992547409.9`).
2. `90071992547409.91`:
   - Minor units = `9007199254740991` (= `MAX_SAFE_INTEGER`).
   - La conversione `Number('90071992547409.91')` in virgola mobile IEEE-754 perde il centesimo finale (`90071992547409.9`).
   - Il controllo di round-trip rileva la perdita e respinge l'importo con `MONEY_OUT_OF_SAFE_RANGE`.
   - Questo comportamento è deterministico e garantisce che nessun centesimo venga alterato.
3. `90071992547409.92`:
   - Minor units = `9007199254740992` (> `MAX_SAFE_INTEGER`).
   - Esito reale: `INVALID` con `MONEY_OUT_OF_SAFE_RANGE`.

Classificazione:
`SAFE_RANGE_EDGE = CONSISTENT`

---

## Number roundtrip

Il round-trip guard confronta la rappresentazione decimale `Big` prima e dopo la conversione in `Number`:
- `0.01` -> VALID
- `0.10` -> VALID
- `0.29` -> VALID
- `1234.56` -> VALID
- `90071992547409.90` -> VALID
- `90071992547409.91` -> INVALID (respinto per perdita di precisione nel DTO Number)

Nessun valore accettato perde centesimi o subisce alterazioni nella rappresentazione.

Classificazione:
`NUMBER_ROUNDTRIP_GUARD = PASS`

---

## Independent monetary census

L'audit indipendente condotto attraverso l'astrazione TypeScript e l'analisi del repository conferma i conteggi:
- **Origini totali**: 399
  - Esterne: 298
  - Derivate / calcolate: 97
  - Cache di compatibilità ritirate: 4
- **Alias snapshot**: 324
  - Alias esterni: 219
  - Alias derivati: 105
- **Totale path monetari censiti**: 723 (399 origini + 324 alias)
- **Campi numerici non-monetari esclusi**: 63 (FTE, percentuali, anni, conteggi, ore)
- **Campi con scala o segno sconosciuti**: 0

I conteggi dell'audit indipendente coincidono al 100% con il census documentato.

Classificazione:
`INDEPENDENT_CENSUS_MATCH = YES`
`ORIGIN_MONETARY_FIELDS = 399`
`SNAPSHOT_ALIAS_PATHS = 324`
`TOTAL_MONETARY_PATHS = 723`

---

## Alias classification

Gli alias snapshot (`324` path) sono strutturati per ereditare rigorosamente le policy dei campi di origine corrispondenti:
- Gli alias di input ereditano la policy di origine (scale 2, sign specificato).
- L'alias calcolato `limiteArt23Comma2Attualizzato` mantiene la natura di valore derivato (`scale: null`, `sign: 'DERIVED_ONLY'`).
- Nessun alias modifica o diverge rispetto alla scala o al segno della sorgente.

Classificazione:
`ALIAS_POLICY_INHERITANCE = PASS`

---

## External field total

Il totale dei campi monetari esterni risulta:
- 298 origini esterne + 219 alias esterni = **517 campi esterni**.
- 101 origini derivate + 105 alias derivati = **206 campi derivati**.
- Nessun alias derivato è stato impropriamente classificato come esterno.

Classificazione:
`EXTERNAL_DERIVED_CLASSIFICATION = PASS`
`EXTERNAL_MONETARY_FIELDS = 517`
`DERIVED_MONETARY_FIELDS = 206`

---

## Scale census

Tutti i **517 campi esterni** (298 di origine + 219 alias) hanno scala 2:
- Risorse FAD, EQ, Segretario, Dirigenza: `step=0.01`, MonetarySchema centesimale.
- Dati storici e AnnualData: controlli EUR in centesimi, schema e import certificati.
- Distribuzione risorse: controlli stanziate/risparmi/aBilancio in centesimi.
- DL25, PNRR, Wizard 2026: form e mapping verso campi centesimali.
- Compensatore delegato: 5 importi mensili EUR con `step=0.01`, `min=0`.
- Nessun campo esterno a scala 0 o scala differente.

Classificazione:
`ALL_EXTERNAL_SCALE2 = EVIDENCE_SUPPORTED`

---

## CSV 3dp policy

Il valore CSV `123.456`:
- Nei vecchi parser veniva accettato con possibile perdita/ambiguità o troncamento.
- Nel nuovo boundary monetario viene esplicitamente respinto con codice `MONEY_INVALID_PRECISION` («Inserire un importo con al massimo 2 cifre decimali, senza arrotondamento automatico»).
- Tale rigetto è pienamente conforme all'accettazione centesimale del dominio economico di Funzioni Locali, evitando rounding silenziosi incontrollati.

Classificazione:
`CSV_3DP_REJECTION = LEGITIMATE_DATA03_FIX`

---

## Sign census

La classificazione del segno sui 517 campi esterni è ripartita in:
- `NONNEGATIVE_RESOURCE`: 254 origini + 197 alias = **451 campi**.
- `NONNEGATIVE_DEDUCTION_MAGNITUDE`: 43 origini + 21 alias = **64 campi**.
- `SIGNED_ADJUSTMENT`: 1 origine + 1 alias = **2 campi**.
- Campi con segno sconosciuto: **0**.

Classificazione:
`SIGN_POLICY_CENSUS = PASS`

---

## Signed Dirigenza adjustment

Il campo:
`fondoDirigenzaData.lim_art23c2_DLGS75_2017_adeguamentoAnnualeTetto2016`
è l'unico campo di input esterno avente policy `SIGNED_ADJUSTMENT`.
- Evidenza storica confermata: etichetta UI «Eventuale decurtazione o aumento annuale» e addizione algebrica nel calcolo.
- Verifica con i valori `-100`, `0`, `100`: tutti e tre risultano `VALID`.

Classificazione:
`SIGNED_DIRIGENZA_ADJUSTMENT = PRESERVED`

---

## Deduction magnitude

Le decurtazioni (es. Art. 60 conglobamento):
- Sono espresse come grandezze positive (`NONNEGATIVE_DEDUCTION_MAGNITUDE`).
- L'inserimento di `20` è `VALID` e viene applicato in sottrazione (`1000 - 20 = 980`).
- L'inserimento di `-20` è `INVALID` (`MONEY_NEGATIVE_NOT_ALLOWED`), evitando fenomeni di doppio negativo o inversione del segno.

Classificazione:
`DEDUCTION_MAGNITUDE_POLICY = PASS`

---

## Raw parsing

Test della matrice completa dei tipi grezzi contro `parseMonetaryValue`:
- `undefined`, `null`, `""`, `"   "` -> `status: 'MISSING'`, `value: undefined`
- `0`, `"0"` -> `status: 'VALID'`, `value: 0`
- `100`, `"100"` -> `status: 'VALID'`, `value: 100`
- `-100`, `"-100"` -> `status: 'INVALID'`, `code: 'MONEY_NEGATIVE_NOT_ALLOWED'`
- `"abc"`, `true`, `false`, `{}`, `[]`, `[100]` -> `status: 'INVALID'`, `code: 'MONEY_MALFORMED'`
- `NaN`, `Infinity`, `-Infinity`, `"Infinity"` -> `status: 'INVALID'`, `code: 'MONEY_NOT_FINITE'`
- `"1e309"` -> `status: 'INVALID'`, `code: 'MONEY_OUT_OF_SAFE_RANGE'`
- `"1e3"` -> `status: 'VALID'`, `value: 1000`

Tutti i casi rispondono esattamente alla specifica.

Classificazione:
`RAW_PARSING = PASS`

---

## Blank semantics

Per tutti i campi monetari opzionali:
- `undefined`, `null`, stringa vuota `""` e spazi `"   "` producono invariabilmente `MISSING` (`value: undefined`).
- Non viene mai assegnato un default zero fittizio.
- Lo zero numerico `0` o `"0"` è preservato come zero esplicito (`VALID`, `value: 0`).

Classificazione:
`BLANK_SEMANTICS = CONSISTENT_MISSING`

---

## Scientific notation

- `1e3` viene accettato e convertito in `1000` (rispetta segno, scala e safe range).
- `1e308` viene respinto con `MONEY_OUT_OF_SAFE_RANGE`.
- Nessun parser consente il passaggio di esponenti oltre il safe range.

Classificazione:
`SCIENTIFIC_NOTATION_POLICY = CONSISTENT`

---

## Locale formats

L'adattatore `monetaryLocaleDecimal`:
- Riconosce formati italiani completi: `1.234,56` e `1234,56` -> `1234.56`.
- Riconosce formati standard: `1,234.56` e `1234.56` -> `1234.56`.
- Non interpreta ambiguamente forme come `1,234` o `1.234`: le trasforma in `1.234` che, avendo 3 decimali, vengono rigettate come `MONEY_INVALID_PRECISION` anziché assumere silenziosamente che il punto o la virgola siano separatori delle migliaia.

Classificazione:
`LOCALE_DECIMAL_PARSING = SAFE`

---

## Trailing garbage

Valori con suffissi testuali (es. `12abc`):
- Vengono controllati dall'espressione regolare dell'intera stringa e respinti con `MONEY_MALFORMED`.
- Nessun `parseFloat` o `parseInt` residuo estrae parzialmente `12`.

Classificazione:
`PARTIAL_NUMERIC_PARSE_BYPASS = ABSENT`

---

## Schema hardening

In `src/schemas/fundDataSchemas.ts`:
- Sono stati eliminati tutti i 5 `.optional().or(z.any())` precedentemente presenti sulle sezioni economiche (`fondoAccessorioDipendenteData`, `fondoElevateQualificazioniData`, `fondoSegretarioComunaleData`, `fondoDirigenzaData`, `distribuzioneRisorseData`).
- Le sezioni utilizzano schema tipizzati e validati.

Classificazione:
`ECONOMIC_SECTION_ANY_ESCAPES = 0`

---

## Passthrough

- La presenza di `.passthrough()` su `FundDataSchema` preserva eventuali metadati sconosciuti non economici.
- La `superRefine` esegue `validateMonetaryData(data)` sull'intero oggetto: se una proprietà nota contiene un valore monetario non valido, lo schema fallisce con `custom issue` e codice monetario specifico. Nessuna chiave monetaria nota può eludere la validazione sfruttando `.passthrough()`.

Classificazione:
`KNOWN_KEY_PASSTHROUGH_ESCAPE = ABSENT`

---

## Compatibility containers

I contenitori `personaleServizio` e `wizard2026TransferSnapshot`:
- Mantengono struttura aperta per compatibilità storica.
- La funzione `validateMonetaryData` ispeziona ricorsivamente tutti i loro path monetari conosciuti (`wizard2026TransferSnapshot.input.*`, `computed.*`, `destination.*`, `transferPlan.*`).
- Valori invalidi in questi path nidificati vengono intercettati e respinti.

Classificazione:
`OPEN_CONTAINER_MONETARY_ESCAPE = ABSENT`

---

## Own-property regression

Il finding `CALC-04` dipende dalla distinzione tra presenza o assenza di proprietà atomiche proprie nella Dirigenza:
- `normalizeMonetaryData` consulta le proprietà usando `hasOwnProperty`.
- Nessun campo atomico assente viene creato come `undefined`.
- Il payload cache-only della Dirigenza mantiene lo stato `UNDETERMINED` per l'Art. 23 c. 2.

Classificazione:
`CALC04_OWN_PROPERTY_SEMANTICS = PRESERVED`

---

## DATA-01 missing

- In un nuovo ente vuoto i campi monetari obbligatori rimangono `MISSING` (`undefined`).
- Non vengono introdotti `default(0)` o valori demo.
- I test di isolamento di DATA-01 continuano a passare con successo.

Classificazione:
`DATA01_MISSING_SEMANTICS = PRESERVED`

---

## Calculation quarantine

In `src/application/input/inputNormalizer.ts`:
- Se sono presenti issue monetarie, `quarantineInvalidMonetaryData` crea una copia di runtime strutturale escludendo i soli path invalidi, conservando l'oggetto grezzo originale intatto.
- `monetaryIssues` vengono trasmesse a `fundEngine.ts`.
- In presenza di issue monetarie, `fundEngine.ts` impone:
  `canonicalFund.status = 'INVALID'`, `stableTotal = null`, `variableTotal = null`, `total = null`, `art23Subject = null`, `art23Excluded = null`.
- Non avviene alcuna conversione silente da invalido a missing che produca un totale autoritativo errato.

Classificazione:
`CALCULATION_QUARANTINE = FAIL_CLOSED`

---

## Verified subtotal safety

Quando un dataset presenta una voce valida (es. 1.000 €) e una voce malformata (es. "abc"):
- Il motore calcola `monetaryInvalidResult`.
- La sezione parziale può riportare un subtotale verificato per la sola voce valida, ma:
  - Lo status complessivo del fondo è `INVALID`.
  - Il totale definitivo del fondo è `null`.
  - I documenti finali sono bloccati.
  - La chiusura dell'esercizio è bloccata.
  - Il budget della distribuzione non è autoritativo.

Classificazione:
`INVALID_WITH_VERIFIED_SUBTOTAL = SAFE`

---

## Quarantine original immutability

- `quarantineInvalidMonetaryData` impiega `structuredClone(data)` prima di eliminare i campi invalidi nella sola copia di calcolo.
- L'oggetto `FundData` originale e lo snapshot rimangono immutati.
- Il dato malformato resta disponibile per la correzione da parte dell'utente.

Classificazione:
`QUARANTINE_MUTATES_ORIGINAL = NO`

---

## Normalizer policy

- Il normalizer non trasforma valori non validi in zero o in valori di default.
- Trascrive e conserva le issue monetarie nel DTO normalizzato (`NormalizedInput.monetaryIssues`).

Classificazione:
`NORMALIZER_POLICY = ISSUE_PRESERVING`

---

## UI domain boundary

Il componente `MonetaryInput`:
- Mantiene lo stato di draft testuale localmente quando l'input non è valido.
- Registra l'issue nel `MonetaryDraftContext`.
- Non invoca il callback `onChange` verso il domain writer.
- Quando l'utente inserisce un valore corretto, invoca `onChange` con il valore normalizzato.

Classificazione:
`UI_DOMAIN_COMMIT_BOUNDARY = PASS`

---

## Stale domain value during invalid draft

Se il dominio contiene un valore valido (es. 50 €) e l'utente digita "abc":
- Il dominio mantiene temporaneamente 50 €, ma la presenza dell'issue registrata in `MonetaryDraftContext`:
  - Blocca il salvataggio (`saveAppStateWorkflow` restituisce `VALIDATION_ERROR`);
  - Blocca la chiusura dell'esercizio (`closureReadiness` restituisce `NOT_READY`);
  - Disabilita il pulsante di conferma nel modal di trasferimento Wizard.
- Non è possibile salvare o consolidare lo stato valido precedente mentre l'interfaccia visualizza un draft invalido.

Classificazione:
`STALE_VALID_DOMAIN_DURING_INVALID_DRAFT = SAFE`

---

## Accessible feedback

In presenza di errore monetario, `MonetaryInput` espone:
- Messaggio visibile in `<p role="alert">`.
- `aria-invalid="true"`.
- `aria-describedby` collegato all'id dell'errore.
- `role="spinbutton"` e `inputMode="decimal"`.
- Alla correzione, l'errore e gli attributi di invalidità vengono rimossi.
- Il finding `ACCESS-02` resta comunque `OPEN` in quanto tale intervento copre esclusivamente il boundary monetario.

Classificazione:
`MONETARY_FIELD_ACCESSIBILITY = PASS`

---

## Direct dispatch

Il riduttore `appReducer` (in `src/contexts/AppContext.tsx`) intercetta qualsiasi mutazione di stato:
- Confronta `validateMonetaryData(next.fundData)`.
- Se un'azione di dispatch diretto introduce un valore monetario non valido, l'azione viene respinta atomicamente con errore `Modifica rifiutata: importi non validi.` e lo stato non viene mutato.

Classificazione:
`DIRECT_DISPATCH_BYPASS = ABSENT`

---

## CSV/XLS/Wizard import

I test mirati sui servizi di importazione reali confermano:
- `importDatiGeneraliFromCsv`: importi con formato locale valido sono accettati; `-100`, `123.456`, `1e308`, `malformed` vengono respinti senza mutazione parziale dello stato.
- `parseExcelData` (XLS Fondo): formati validi (inclusi `0`, `1e3`, `1.234,56`) sono accettati; input malformati o non finiti sollevano `MonetaryBoundaryError`.
- `importWizard2026Excel`: fogli con importi monetari invalidi falliscono atomicamente restituendo `resultState: {}`.

Classificazione:
`CSV_IMPORT_BOUNDARY = PASS`
`FAD_XLS_IMPORT_BOUNDARY = PASS`
`WIZARD_XLS_BOUNDARY = PASS`

---

## Transfer

La funzione `applyWizard2026Transfer`:
- Valida preventivamente gli stati di origine (`draftState` e `currentFundData`).
- Esegue le elaborazioni all'interno di `checkedMonetaryCalculation`.
- Valida il dataset complessivo risultante con `validateMonetaryProcessing` prima del rilascio.
- Rifiuta qualsiasi trasferimento in presenza di input non validi o aggregati fuori range.

Classificazione:
`TRANSFER_MONETARY_BOUNDARY = PASS`

---

## Rollback serialization order

In `Step8RiepilogoPreview.tsx`:
- La chiamata `applyWizard2026Transfer` precede la creazione dello snapshot di rollback.
- Se il dataset corrente o i dati del Wizard sono invalidi, il trasferimento solleva eccezione e il flusso si interrompe prima che `sessionStorage.setItem(snapshotKey, JSON.stringify(snapshot))` possa essere invocato.
- Nessun dato non-finito o corrotto viene serializzato nel rollback snapshot.

Classificazione:
`ROLLBACK_SERIALIZATION_ORDER = SAFE`

---

## Save/repository

I flussi di salvataggio (`stateWorkflow`, `snapshotWorkflow`, `yearClosureWorkflow`):
- Eseguono `validateMonetaryProcessing(fundData)` prima di interagire con il database.
- Se sono presenti importi non validi o aggregati unsafe, il salvataggio fallisce con `VALIDATION_ERROR` e il numero di chiamate verso il repository è zero.
- Alla correzione (es. 100 €), il salvataggio procede regolarmente.

Classificazione:
`SAVE_BOUNDARY = PASS`

---

## Repository defense in depth

`SupabaseStateRepository.ts`:
- Implementa `validateMonetaryProcessing` sia in `createState`, sia in `upsertState`, sia in `closeAnnualSnapshotAtomic`.
- Se un chiamante invoca direttamente il repository bypassando l'application workflow con dati invalidi, il repository rigetta la richiesta con errore locale `MONETARY_VALIDATION_ERROR` prima di qualsiasi chiamata Supabase.

Classificazione:
`REPOSITORY_LAST_LINE_GUARD = PASS`

---

## No second policy

Sia il layer applicativo che il layer di persistenza condividono le stesse definizioni di `monetaryBoundary.ts` e `monetaryPolicies.ts`. Non esistono tabelle duplicate di range, scale o segni.

Classificazione:
`VALIDATION_POLICY_DUPLICATION = ABSENT`

---

## Legacy OPEN

Il caricamento di uno snapshot `OPEN` contenente campi monetari precedentemente corrotti (es. stringa "abc"):
- Mantiene il dato grezzo intatto nello stato senza causare crash dell'applicazione.
- Imposta `validationErrors` e `calculationResult: undefined`.
- Blocca qualsiasi operazione di salvataggio fino a quando il campo non viene corretto.

Classificazione:
`LEGACY_OPEN_MALFORMED = SAFE_FAIL_CLOSED`

---

## Correction flow

Nel flusso di correzione di un dato legacy malformato:
- L'utente corregge il valore a 100 € nell'interfaccia.
- L'errore di validazione viene rimosso.
- Il calcolo torna `VALID`.
- Il salvataggio viene sbloccato e il repository riceve il dato valido.

Classificazione:
`LEGACY_CORRECTION_FLOW = PASS`

---

## CLOSED

Uno snapshot legacy nello stato `CLOSED` contenente dati monetari non validi:
- Resta consultabile in sola lettura senza crash.
- `stateWorkflow.ts` e `snapshotWorkflow.ts` respingono tentativi di salvataggio diretto con codice `SNAPSHOT_CLOSED`.
- Nessuna migration o silent sanitize scrive a database.

Classificazione:
`CLOSED_INVALID_MONETARY = READ_ONLY_SAFE`

---

## Aggregate overflow

Nel controesempio di due risorse singolarmente lecite da 60 trilioni di euro (`60.000.000.000.000 €`):
- Ciascuna risorsa rispetta il limite singolo di scale 2.
- La loro somma (120 trilioni di euro) supera `MAX_SAFE_INTEGER` sulle minor units.
- `checkedMonetaryCalculation` rileva l'overflow prima della conversione e restituisce:
  `status: 'INVALID'`, codice `MONEY_AGGREGATE_OUT_OF_SAFE_RANGE`.
- Il motore non va in crash e restituisce totale canonico `null`.
- Il salvataggio viene bloccato (0 chiamate a DB).

Classificazione:
`AGGREGATE_OVERFLOW = FAIL_CLOSED`

---

## Aggregate near boundary

Un'aggregazione vicina al limite tecnico ma esattamente rappresentabile (es. 40 trilioni + 40 trilioni = 80 trilioni):
- Minor units = `8000000000000000` (< `9007199254740991`).
- Viene correttamente accettata con status `VALID`.
- La guard non è eccessivamente restrittiva e non produce falsi positivi.

Classificazione:
`AGGREGATE_NEAR_BOUNDARY = VALID`

---

## Derived precision

I valori intermedi derivati (es. `123.457`):
- Non vengono arbitrariamente troncati a 2 decimali durante i calcoli interni.
- Mantengono la precisione a 20 cifre decimali di Big.js fino al punto di arrotondamento finale stabilito dalle formule normative.

Classificazione:
`DERIVED_HIGH_PRECISION = PRESERVED`

---

## FinancialMath semantics

Il confronto del comportamento di `FinancialMath`:
- `sumAll`, `subtractAll`, `addExact`, `subtractExact`, `multiplyExact`, `roundTo2DP`: conservano la semantica e l'accuratezza preesistenti.
- Le impostazioni `Big.RM = Big.roundHalfUp` e `Big.DP = 20` sono invariate.
- Nessuna deviazione rispetto ai risultati attesi dalle formule matematiche.

Classificazione:
`FINANCIALMATH_NORMAL_SEMANTICS = UNCHANGED`

---

## Checked-scope error filter

L'intercettazione delle eccezioni in `checkedMonetaryCalculation`:
- Cattura specificamente l'errore numerico `[big.js] Invalid number` (derivante da intermedi non finiti prima di Big.js) e lo converte in `MONEY_AGGREGATE_OUT_OF_SAFE_RANGE`.
- Qualsiasi altra eccezione applicativa o di sistema (es. `TypeError`, errori di logica) viene rilanciata (`throw error`).
- Nessun errore applicativo non correlato viene mascherato.

Classificazione:
`CHECKED_SCOPE_ERROR_FILTER = NUMERIC_ONLY`

---

## Checked-scope isolation/concurrency

- La profondità di annidamento `checkedDepth` è gestita con pattern `try / finally`.
- Gli ambiti controllati possono essere annidati senza perdita di contesto o residui di flag globali (verificato con successo nel test a doppio livello).
- Poiché l'esecuzione di calcolo in JavaScript è sincrona, non vi è rischio di contaminazione tra chiamate concorrenti.

Classificazione:
`CHECKED_SCOPE_ISOLATION = PASS`
`CHECKED_SCOPE_CONCURRENCY = SAFE`

---

## Output tree safety

La funzione `validateMonetaryOutputTree`:
- Valida l'albero dei risultati numerici DTO prodotti da calcolatori con aritmetica nativa.
- Utilizza filtri semantici precisi escludendo chiavi non monetarie (`year`, `annoRiferimento`, `timestamp`, `percentuale`, `ore`, `fte`, `numero`, `conteggio`, `dipendentiEquivalenti`, `aliquota`).
- Non si registrano falsi positivi su percentuali o conteggi.

Classificazione:
`OUTPUT_TREE_FIELD_CLASSIFICATION = PRECISE`
`OUTPUT_TREE_SEMANTIC_BOUNDARY = PASS`

---

## PNRR/DL25/Art60/CALC04/DATA01

Verifica di regressione sui domini consolidati:
- **ARCH-01**: Single economic authority preservata; il ledger canonico resta l'unica fonte di verità economica.
- **PNRR**: Comportamenti di opzione, limiti facoltà e calcoli invariati.
- **DL25**: Carry-forward, date di regime, margini lordi/netti preservati.
- **Art. 60**: Conglobamento 2025/2026/2027 e decurtazioni invariate.
- **CALC-04**: Own-property semantics e calcolo Art. 23 c. 2 invariati.
- **DATA-01**: Inizializzazione ente vuoto priva di demo runtime preservata.

Classificazione:
`ARCH01_SINGLE_AUTHORITY = PRESERVED`
`PNRR_BOUNDARY_REGRESSION = NONE`
`DL25_BOUNDARY_REGRESSION = NONE`
`ART60_BOUNDARY_REGRESSION = NONE`
`CALC04_BOUNDARY_REGRESSION = NONE`
`DATA01_BOUNDARY_REGRESSION = NONE`

---

## Documents/Cabina/Closure

- **Document readiness**: Un dataset con errori monetari blocca l'emissione dei documenti finali (rimangono in stato DRAFT o bloccati).
- **Cabina di regia**: Uno stato monetario invalido produce status operativo bloccato/da completare, impedendo falsi stati verificati.
- **Chiusura esercizio**: La presenza di draft monetari invalidi impone `NOT_READY`, prevenendo l'invocazione della procedura atomica di chiusura.

Classificazione:
`DOCUMENT_INVALID_MONEY = BLOCKED_BY_EXISTING_GATES`
`CABINA_INVALID_MONEY = SAFE`
`CLOSURE_INVALID_DRAFT = SAFE`

---

## ACCESS-02 residual

I controlli monetari hanno introdotto miglioramenti accessibili puntuali (`role="alert"`, `aria-invalid`, `aria-describedby`, `role="spinbutton"`). Tuttavia, i requisiti generali di accessibilità (tastiera, contrasto, census completo di form e tabelle) non sono stati affrontati.

Classificazione:
`ACCESS_02_FINAL_STATUS = OPEN`

---

## Independent bypass census

L'ispezione globale sul codice di produzione per mutazioni attive (`dispatch`, `reducers`, `import`, `transfer`, `save`, `upsert`, storage locale) conferma:
- Tutti gli ingressi attivi transitano dalla shared authority.
- `ACTIVE_MONETARY_MUTATION_BYPASSES = 0`
- `KNOWN_MONETARY_ANY_BYPASSES = 0`
- `services/stateService.saveAppState` ha 0 chiamanti runtime ed è completamente latente (`LATENT_STATE_SERVICE = LATENT`).
- La serializzazione JSON non viene usata come meccanismo di sanificazione (`SERIALIZATION_AS_SANITIZER = ABSENT`).

Classificazione:
`ACTIVE_MONETARY_MUTATION_BYPASSES = 0`
`KNOWN_MONETARY_ANY_BYPASSES = 0`
`LATENT_STATE_SERVICE = LATENT`
`SERIALIZATION_AS_SANITIZER = ABSENT`

---

## Scope integrity

L'audit sui 70 file modificati/creati nello slice attesta:
- 60 file esistenti modificati + 10 file nuovi di prodotto/test.
- Ciascuna modifica è motivata rigorosamente dai requisiti di validazione monetaria di DATA-03.
- Nessun file protetto o non pertinente è stato alterato.
- `canonicalFundLedger`, `canonicalFadProjection`, `dirigenzaArt23`, motori normativi, migrazioni Supabase e file golden/oracle sono rimasti invariati.

Classificazione:
`SCOPE_INTEGRITY = PASS`
`UNJUSTIFIED_PRODUCTION_FILES = 0`

---

## Test modifications

I test preesistenti aggiornati riflettono unicamente l'adeguamento al nuovo contratto monetario:
- I controlli DOM monetari ora utilizzano `type="text"` / `inputMode="decimal"` anziché `type="number"`.
- I testi non validi non generano più callback con `undefined` ma trattengono il draft con errore visibile.
- Input a tre decimali nei test di import CSV ora verificano il rifiuto anziché l'accettazione incoerente.
- Nessuna asserzione è stata indebolita o rimossa.

Classificazione:
`TEST_MODIFICATIONS = LEGITIMATE_DATA03_EXPECTATION_CHANGE`

---

## Test harness

I nuovi test mirati (85 in 5 file dedicati + 1 nel repository Wizard):
- Esercitano parser, schemi, riduttori, componenti React nel DOM (Testing Library), import reali Excel/CSV, flussi di transfer e logica di calcolo.
- Nessun test è basato su mock superficiali o asserzioni tautologiche.

Classificazione:
`TEST_HARNESS_REVIEW = PASS_HIGH_CONFIDENCE`

---

## Product suite

Esecuzione completa offline di Vitest:
- **1988 test superati su 1988**
- **144 file di test**
- 0 test falliti, 0 in sospeso, 0 nuovi skip.

Classificazione:
`FULL_PRODUCT_SUITE = 1988/1988_PASS_144_FILES`

---

## Regression/oracle

- **Regressione consolidata**: 8 test su 8 superati (`8/8_PASS`).
- **Golden results hash**: identico a PRE (`DC0A12CF4BC2EC16C892AED362ADAC2671BA44705155C84A588715EDABF49EF0`).
- **Oracle normativo**: 14 controlli su 14 superati (`14/14_PASS`).
- **TypeScript**: `npx tsc --noEmit` completato con 0 errori (`TYPESCRIPT = PASS`).
- **Diff check**: `git diff --check` completato con 0 violazioni (`DIFF_CHECK = PASS`).

Classificazione:
`REGRESSION = 8/8_PASS`
`ORACLE_INTEGRITY = UNCHANGED_PASS`
`TYPESCRIPT = PASS`
`DIFF_CHECK = PASS`

---

## DATA-03 final decision

Tutti i 73 requisiti di accettazione del boundary monetario, sicurezza degli aggregati, integrità dei dati e assenza di regressioni risultano pienamente soddisfatti:

`DATA_03_FINAL_STATUS = VERIFIED_FIXED`
`MONETARY_INPUT_BOUNDARY = VERIFIED_FIXED`

---

## Updated ASTRA count

In virtù della risoluzione e verifica di DATA-03:
- `VERIFIED_FIXED` = 17
- `PARTIALLY_FIXED` = 5
- `OPEN` = 3
- `TOTAL` = 25
- `ASTRA_BLOCKERS_OPEN` = 0

*(Finding ACCESS-02 rimane confermato in stato OPEN).*

---

## Next recommended slice

Con il consolidamento della single economic authority (ARCH-01) e la messa in sicurezza dell'intero confine monetario (DATA-03), il sistema dispone di una solida barriera numerica all'ingresso e all'aggregazione.

La principale priorità successiva è il completamento delle istruzioni e delle regole normative di recupero contrattuale per il CCNL 2024.

**Prossimo slice raccomandato**:
`CCNL_RECOVERY_INSTRUCTION` (target **NORM-02**, P1).

**Razionale**:
Il finding `NORM-02` è attualmente `PARTIALLY_FIXED`. Il perfezionamento delle istruzioni di recupero e delle clausole di salvaguardia del CCNL 2024 completa l'architettura normativa del fondo del personale dipendente, garantendo la totale coerenza tra i calcoli canonicamente autoritativi e i testi istruttori e amministrativi generati per gli atti di costituzione.
