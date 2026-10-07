# MONETARY_INPUT_BOUNDARY — implementation V2

## Executive result

`MONETARY_RANGE_POLICY_RESOLUTION = COMPLETE`; decisione `SAFE_SCALED_EXTERNAL_INPUT_PLUS_AGGREGATE_FAIL_CLOSED`, gate PASS. `MONETARY_INPUT_BOUNDARY_IMPLEMENTATION_V2 = COMPLETE`, `RESULT = PASS`, `MONETARY_INPUT_BOUNDARY_STATUS = CLOSED_LOCALLY`. Esiti definitivi dei gate e output terminale in `monetary_input_boundary_v2_evidence/terminal-output.txt`.

Gate finali: **1988/1988 test prodotto, 144 file, zero failed e zero pending; regression 8/8; oracle 14/14; TypeScript PASS; git diff --check PASS**. Nessuna modifica a golden/oracle e nessuna connessione reale.

Authority condivisa: `src/domain/monetaryBoundary.ts`, registro `src/domain/monetaryPolicies.ts`, guard applicativa dataset `src/application/input/monetaryProcessingSafety.ts`. Input esterni invalidi sono respinti; aggregati non rappresentabili producono INVALID e bloccano la persistenza. Il ledger canonico resta l'unica authority economica FAD.

Baseline Git verificata prima delle modifiche: branch `ux/toolbox-area-fondo-prototype`, HEAD `d3170f959b5815c514dbf3d6e5f93366a5f14c67`. Working tree intenzionalmente dirty, preservato. Comandi branch/HEAD/status/diff/index e SHA-256 PRE conservati nella cartella V2. Nessuna operazione Git mutante, DB, migration o deploy.

ASTRA resta VF=16, PF=6, OPEN=3, TOTAL=25, blockers=0. DATA-03 è candidato alla verifica indipendente; ACCESS-02 resta OPEN. Reconciliation non modificata.

## Previous mandatory stop

Letti integralmente `MONETARY_INPUT_BOUNDARY_IMPLEMENTATION_REPORT.md`, il prompt allegato originale e le evidenze precedenti. Report BLOCKED e contenuti di `monetary_input_boundary_evidence/` preservati negli hash PRE/POST.

Controesempio congelato confermato come fatto: due input `1e308` sono singolarmente finite, ma la somma legacy produce Infinity e il motore può terminare con `[big.js] Invalid number`; la serializzazione JSON di Infinity produrrebbe null. `FINITE_DOMAIN_ONLY` rimane rifiutato. Non è stato adottato `Number.MAX_VALUE` come limite.

## Range policy decision

Decisione autorizzata: `SAFE_SCALED_EXTERNAL_INPUT_PLUS_AGGREGATE_FAIL_CLOSED`. Il census preliminare PRE comprendeva 394 campi; l'audit di controlli UI, segni e DTO ha completato il census con cinque importi Compensatore e gli alias snapshot, distinguendo l'adeguamento Dirigenza firmato e quattro cache ritirate. L'evidenza preliminare rimane conservata; il gate conclusivo è `final-census-gate.json`.

Il gate finale controlla corrispondenza census/registro, tutti gli alias monetari del producer snapshot reale, destinazioni strutturate del transfer plan e otto fixture input consolidate. Risultato: nessun gap di registro, scala o segno sconosciuto e nessuna incompatibilità con importi legittimi consolidati.

## Why the range is technical, not normative

Il massimo deriva da `Number.MAX_SAFE_INTEGER` sulle minor units alla scala dichiarata, confrontate mediante Big.js prima della conversione. Non esiste un tetto economico arbitrario o normativo introdotto da questo slice. Il controllo non decide spettanze, eligibility, Art23 o classificazioni.

Per scala 2, massimo teorico decimale: `90071992547409.91`. Il DTO usa JS number: se una forma decimale perde un centesimo nella conversione, viene respinta anziché arrotondata. Test del bordo: `90071992547409.90` rappresentabile e VALID; `.92` oltre il bordo e INVALID. La forma teorica `.91` non supera il controllo aggiuntivo di round trip esatto al formato JS number. Questo limite aggiuntivo deriva dalla rappresentazione effettiva del DTO, non da un business cap.

## Monetary field census

Census completo consultabile in `monetary_input_boundary_v2_evidence/monetary-census-complete.json` e `monetary-field-matrix.csv`. Ogni riga contiene path, source/declaration evidence, esterno/derivato, scala, evidenza della scala, segno, missing e zero policy. Le righe originali hanno collegamenti alla dichiarazione TypeScript; gli alias indicano il producer e la policy ereditata. Array sono rappresentati con `*`, non contati per istanza.

| Census | Campi/path |
|---|---:|
| Origini FundData, Wizard e Compensatore | 399 |
| Input esterni di origine | 298 |
| Derivati di origine, incluse quattro cache compatibility | 101 |
| Derivati processati / cache ritirate | 97 / 4 |
| Alias snapshot, conteggiati separatamente | 324 |
| Alias esterni / derivati | 219 / 105 |
| Totale path monetari, origini più alias | 723 |
| Path numerici non monetari di origine esclusi | 63 |
| Scala / segno sconosciuti | 0 / 0 |

Copertura: risorse FAD, storici, AnnualData, EQ, Segretario, Dirigenza, straordinario, distribuzione, importi economici manuali del personale, DL25, PNRR, Wizard e import. Conteggi, FTE, percentuali, anni, ore ed enum rimangono fuori dal dominio monetario. Le cache ritirate sono metadata; il loro contenuto non alimenta una authority economica attiva.

## Scale-policy matrix

| Famiglia esterna | Scala input | Evidenza |
|---|---:|---|
| FAD/EQ/Segretario/Dirigenza | 2 | MonetarySchema preesistente, FundingItem `step=0.01`, mapping economico |
| Storici, AnnualData e importi manuali | 2 | Controlli EUR `step=0.01`, input certificati, schema/import mapping |
| Distribuzione | 2 | Controlli stanziate/risparmi/a bilancio `step=0.01` |
| DL25, PNRR, Wizard | 2 | Controlli EUR e mapping verso gli stessi campi FundData |
| Compensatore | 2 | Cinque importi mensili opzionali con `step=0.01`, `min=0` |
| Risultati/calcoli/alias calcolati | Non applicabile | Precisione interna; scala output monetaria finale 2 |

Origini: scale0=0, scale2=298, altre scale esterne=0. Questi numeri risultano dal census, non da un'assunzione globale. Alias monetari ereditano le policy dei campi originali. L'alias `input.limiteArt23Comma2Attualizzato` contiene un risultato calcolato e conserva la precisione derivata.

Il CSV `123.456` riferito a un importo esterno è un'accettazione precedente incoerente con il contratto centesimale. Viene respinto con `MONEY_INVALID_PRECISION`; non normalizzato a `123.46`. Nessuna policy nuova di rounding introdotta.

## Sign-policy matrix

| Policy esterna di origine | Numero | Contratto |
|---|---:|---|
| NONNEGATIVE_RESOURCE | 254 | Risorse, basi, spese, allocazioni positive o zero |
| NONNEGATIVE_DEDUCTION_MAGNITUDE | 43 | Magnitudini positive applicate in sottrazione dal calcolo esistente |
| SIGNED_ADJUSTMENT | 1 | Adeguamento annuale del tetto Dirigenza: decurtazione o aumento |
| UNKNOWN | 0 | Nessun campo irrisolto |

Campo signed: `fondoDirigenzaData.lim_art23c2_DLGS75_2017_adeguamentoAnnualeTetto2016`. Evidenza: label esistente «Eventuale decurtazione o aumento annuale» e addizione firmata esistente nel calcolo. Resolver Dirigenza invariato. Le magnitudini negative additive/deduction sono respinte; i deltas e margini derivati possono mantenere il segno previsto dal calcolo esistente.

## External vs derived values

Input esterni: UI, CSV/XLS, dispatch, import, restore utente, OPEN edit e transfer input. Devono rispettare parsing, finite, segno, scala e dominio minor units sicuro.

Derivati: risultati del motore/Wizard, simulatore, conglobamento calcolato, deltas/margini e alias computed. Non sono arrotondati o limitati alla precisione input. Il controllo di range opera alla conversione/output; i normali punti di rounding restano quelli preesistenti. Le quattro cache legacy sono compatibility-only e non vengono reinterpretate come input atomici, preservando CALC-04.

## Safe scaled external domain

`parseMonetaryValue` costruisce Big da una stringa decimale completa, verifica segno e `abs(decimal * 10^scale) <= MAX_SAFE_INTEGER`, quindi precisione e conversione. Il prodotto di confronto non usa aritmetica Number unsafe. Il numero convertito deve essere finite e mantenere il valore decimale esterno nel round trip.

`1e308` produce `MONEY_OUT_OF_SAFE_RANGE`; boolean, oggetti e array producono `MONEY_MALFORMED`. Ogni errore mantiene un path strutturato. Il parser non usa `Number(value)` come coercizione generica di raw arbitrario.

## Aggregate fail-closed contract

`checkedMonetaryOutput`, `checkedMonetarySum` e `checkedMonetaryCalculation` controllano la rappresentazione degli aggregati mediante Big prima della conversione. Failure: `MONEY_AGGREGATE_OUT_OF_SAFE_RANGE`, INVALID, totale canonico non definitivo/null. Nessuna conversione a Infinity, nessun overflow JSON trasformato in null.

Il motore reale, le calculation effects Wizard, il transfer applicativo e la verifica dataset di save utilizzano lo scope checked. `validateMonetaryOutputTree` aggiunge un controllo del DTO numerico per producer che usano aritmetica Number nativa. Il check non produce una seconda contabilità.

## Big.js checked conversion

FinancialMath mantiene formule, `roundHalfUp`, DP=20 e rounding esistente. Solo le conversioni nello scope applicativo checked ricevono la guard. Le funzioni low-level legacy fuori da tale scope mantengono il contratto precedente, compresi i check autonomi già verificati del resolver Dirigenza. Questa compatibilità non è un bypass degli ingressi attivi applicativi.

Una conversione fuori range è intercettata e restituita come INVALID. Lo scope checked intercetta anche l'errore numerico specifico `[big.js] Invalid number` causato da un intermedio Number non finito; altri errori applicativi non sono mascherati. Nessuna eccezione Big.js uncaught nei controesempi e nei test prodotto.

## Accepted formats

Decimali completi e notazione scientifica: `100`, `0`, `1e3` validi alle stesse policy. Adattatore locale separato dal dominio: `1.234,56`, `1,234.56`, `1234,56` diventano rappresentazioni decimali canoniche. Test con servizi CSV/XLS reali. Suffissi tipo `12abc` vengono respinti interamente.

## Schema hardening

Eliminati i cinque `.optional().or(z.any())` delle sezioni economiche. Leaf schema monetarie utilizzano il parser condiviso con issue path e monetary code. `.passthrough()` preserva proprietà legacy sconosciute come metadata.

Restano contenitori compatibility `personaleServizio` e `wizard2026TransferSnapshot` con shape legacy aperta: la superRefine di FundDataSchema valida tutti i loro path monetari conosciuti tramite il registro e le alias policy. Nessun known monetary field può usare quei contenitori come escape hatch. Tipi primitivi/array al posto di sezioni monetarie vengono respinti. Known monetary any bypasses=0.

## Missing vs zero

Optional blank, whitespace, undefined e null producono MISSING. Zero esplicito rimane VALID ZERO e viene salvato come 0. Nessun nuovo `default(0)`, nessun runtime demo value. Non vengono create own-properties monetarie assenti durante schema/normalizzazione. Empty entity e cache-only Dirigenza conservano gli stati precedentemente verificati.

## Malformed/non-finite

Campo primario `fondoAccessorioDipendenteData.st_art79c1_art67c1_unicoImporto2017`: negativi, malformed, NaN, +/-Infinity, `1e308`, boolean, array, oggetti e precisione esterna eccessiva sono respinti. 0 e 100 validi. Errori strutturati e visibili; nessuna riparazione silenziosa a zero/missing del dato persistito.

## Range counterexamples

| Caso | Esito |
|---|---|
| Scala2 `90071992547409.90` | VALID, forma JS rappresentabile al bordo |
| Scala2 `90071992547409.92` | INVALID_OUT_OF_SAFE_RANGE |
| `1e308` esterno | INVALID_OUT_OF_SAFE_RANGE |
| Due risorse da `60000000000000` | Singolarmente VALID; aggregate INVALID, no throw |
| Scope checked `FinancialMath.sumAll(1e308,1e308)` | INVALID, no Infinity |
| Scope checked con intermedio Infinity | INVALID, errore Big.js intercettato |
| Intermedio derivato `123.457` | Precisione conservata fino al rounding esistente |
| Fixture ordinarie | Economics identiche, regression8/oracle14 PASS |

## Normalizer

Normalizer consulta la shared authority. Raw invalidi non passano al calcolo Big.js. Per la sola calculation projection, mantiene `monetaryIssues` esplicite e rimuove i path invalidi da una copia quarantinata, preservando original FundData e snapshot. Motore restituisce INVALID e può conservare un verified subtotal calcolabile; non rende definitivo quel subtotal.

Questa quarantena non è hydration repair, normalizzazione persistita o silent malformed-to-undefined. Save/restore validanti non la usano: bloccano l'intero dataset invalido. Le conversioni di input validi modificano solo proprietà già owned e mantengono missing/zero.

## UI boundary

`MonetaryInput` mantiene localmente il draft testuale invalido e non chiama il writer del dominio. Shared Input sceglie la policy usando semantic field name/path; controlli monetari raw sono migrati al componente. Percentage/count/FTE/year/hour controls restano non monetari.

App reducer valida anche dispatch diretti, import e restore. Una mutation con valore monetario invalido viene respinta atomicamente; la correzione valida aggiorna e normalizza il dato. Per legacy OPEN caricato, il raw invalido è conservato e correggibile. Wizard reducer valida tutti gli ingressi, trattiene issue tecniche e non conserva un risultato economico precedente quando il nuovo risultato è unsafe.

## Accessible feedback

Errori monetari visibili con `role=alert`, `aria-invalid`, id errore e `aria-describedby`. Invalid→valid cancella l'errore. La registrazione dei draft invalidi impedisce save/closure e conferma transfer anche quando il precedente dato nel dominio è valido. Context observable evita che lo stato stale del modal renda confermabile un draft invalido.

ACCESS-02 riceve esclusivamente questo miglioramento parziale nei controlli monetari e resta OPEN. Non è stato eseguito né dichiarato un audit globale accessibility.

## Import

CSV: adattamento locale, shared schema, servizio reale; errore noto impedisce mapped payload. XLS Fondo e XLS Wizard: shared parser per money, parser originale per dimensionless fields. Un known monetary invalid respinge atomicamente il payload, senza mutate parziali. Wizard celle calcolate mantengono il contratto preesistente. No silent rounding.

## Transfer

Transfer reale valida input Wizard e current FundData; mantiene i calcoli/classificazioni DL25/PNRR/Art60. L'applicazione gira nello scope numerico checked e valida il dataset risultante prima di restituirlo al writer. Restore utente valida anche la processabilità aggregata.

Snapshot input/computed, nested facts, destination e transferPlan hanno policy semanticamente strutturate. CONTROL_ONLY monetary destinations `simulato.*` sono incluse; non si usa matching di label. Alias calcolati mantengono precisione derivata.

Rollback snapshot Step8 viene serializzato solo dopo il transfer validato, prima della chiamata remota. Un current dataset invalido/unsafe non viene serializzato prima del rifiuto. Last transfer segue la validazione; draft locali/cloud non possono ignorare issue tecniche di un risultato withheld.

## Save/repository

Guard prima di upsert OPEN in `stateWorkflow`, `snapshotWorkflow` e repository. Raw invalid e dataset aggregate unsafe: errore strutturato, repository calls=0. Correzione a 100: save riesce, repository riceve 100. Zero esplicito salvato come 0. Repository ha la stessa guard come difesa in profondità; nessun server reale contattato.

Local draft FundData salva solo dataset processabili. Repository draft Wizard rifiuta raw invalidi e diagnostics MONEY di aggregati withheld prima di ogni chiamata; flag/allowlist invariati. Draft Wizard non ancora calcolati possono restare incompleti; risultati esistenti e loro failure tecniche non vengono ignorati.

L'indeterminacy amministrativa di una bozza OPEN non diventa automaticamente errore monetario. La guard fallback usa gli stessi adapter, ledger e subfund calculator, dentro scope checked, per verificare la rappresentazione anche quando il calcolo completo è bloccato per classificazione amministrativa. Nessuna nuova authority economica o policy di readiness.

## Legacy OPEN

Load conserva raw malformed, valori non-finite in memoria e metadati; nessun crash e nessuna silent sanitize. Calculation projection INVALID; original reference/value invariati. Save bloccato. Flusso reale AppProvider/UI/repository mock: issue visibile, correzione 100, issue cleared, save riesce. Dispatch invalid→invalid con stesso code ma raw diverso resta respinto.

## CLOSED

Legacy CLOSED invalid rimane consultabile in sola lettura. Nessun writeback o migration. Save diretto CLOSED viene rifiutato; l'operazione di chiusura autorizzata di un OPEN può ancora produrre il payload CLOSED attraverso il workflow preesistente. Numeric guard prima del workflow di closure; transaction/CAS/auth e document policy invariati.

## Aggregate overflow

Due input individualmente validi di 60 trilioni superano insieme il safe output domain. Motore reale restituisce canonical INVALID e total=null per indisponibilità esplicita, non per JSON conversion di Infinity; verified numerics rimangono finite. Entrambi i save workflows chiamano zero repository writer. Anche la bozza con classificazione amministrativa ALTRO non può bypassare il range check.

Un null canonico di INVALID è parte del contratto di unavailable, distinto dal null generato accidentalmente da JSON.stringify(Infinity). Test controllano assenza di Infinity, no throw e no definitive total.

## Big.js crash prevention

Raw known money fermati dal boundary; normalizer non li inoltra ai calculator. Aggregate fuori range fermato prima della conversione. Native non-finite intermediates vengono convertiti in INVALID dallo scope applicativo. `UNCAUGHT_BIGJS_EXCEPTIONS=0` nelle esecuzioni effettuate.

## Bypass census

| Ingresso/mutation attiva | Authority di validazione | Esito |
|---|---|---|
| UI FundingItem/Input, raw monetary forms | MonetaryInput + App reducer | Draft invalido locale, nessun commit |
| App dispatch/update/import/restore draft | shared monetary registry, processing guard al save | Atomic reject |
| Wizard update/import/restore/result | shared registry, checked calculation, persistent technical checks | Atomic reject / INVALID |
| CSV/XLS/Wizard XLS | Locale adapter + shared parser/schema | Atomic reject |
| Apply transfer / snapshot restore | Shared input + checked processing result | Blocked se invalid/unsafe |
| OPEN save/create/upsert/closure | validateMonetaryProcessing prima del repository | Zero calls su invalid |
| Fund local drafts / Wizard local/cloud drafts | Stessa shared validation + technical diagnostics | Nessun unsafe writer |
| Legacy hydration | Lossless raw + issues/calculation quarantine | Safe read-only, no repair writeback |
| Root `services/stateService.saveAppState` | Zero caller statico/dinamico/registry individuato | LATENT, non modificato |

Audit comprende `dispatch`, reducer, import, transfer, restore, save, `.insert/.upsert`, local/session storage e service references. Storage di context id/year, checksums/timestamps e copie di hydration legacy non sono ingressi economici nuovi; ogni application/restore al dominio passa comunque dal boundary. Copie legacy raw non diventano output monetari definitivi.

`KNOWN_MONETARY_ANY_BYPASSES=0`, `ACTIVE_MONETARY_MUTATION_BYPASSES=0`. Residui `z.any` aperti e servizi latent non sono ingressi attivi non validati di known money. Le formule e authority canoniche non sono state duplicate.

## Regressions

Fixture regression 8/8 e oracle 14/14: identiche; golden/oracle non modificati. Suite completa include PNRR, DL25, Art60, CALC04/whole-entity Art23, empty initialization DATA01, ARCH01, Cabina, Distribution, document readiness/closure, CLOSED, canonical XLS/PDF/FAD read model, Auth e security.

FinancialMath ha mantenuto anche la semantica della conversione normale `Number(value.toString())`, evitando drift dei normali risultati e del signed zero. Core canonico e normativo preservato negli hash. Nessun nuovo skip o esclusione product test. Unico generatore storico escluso: `wave3HardeningEvidence.test.ts`, secondo la policy offline consolidata del config preesistente.

## Tests

Baseline indicata: 1902 test, 139 file. Nuovi test mirati: 85 in cinque file, più un caso nel repository Wizard esistente; totale 86 test aggiunti. Conteggi finali e gate in `full-final-state.json`, `quality-final-exit.json`, `focused-counts.json`, `terminal-output.txt`.

| Test mirati nuovi | Casi |
|---|---:|
| Shared parser/schema/normalizer/engine/save | 42 |
| MonetaryInput/aria/transfer modal | 10 |
| Real AppProvider correction/save/CLOSED | 4 |
| Real XLS/CSV/Wizard imports | 19 |
| Wizard mutation/restore/snapshot/technical issue retention | 10 |
| Repository draft guard, file esistente | 1 aggiunto |

Test esistenti aggiornati strettamente: DOM monetary controls ora text/decimal anziché number; invalid text non genera più callback undefined; negative override/precisione esterna a tre decimali ora INVALID come DATA-03 richiede; message transfer strutturato invece di errore generico. Input fixture e expected normativi ordinari invariati. Piccola correzione di accesso opzionale nel test DL25 necessaria ai tipi schema hardened.

Comandi solo binari locali: Vitest con config offline consolidato; vite-node regression/oracle; TypeScript locale `tsc --noEmit`; `git diff --check`. NODE_OPTIONS carica la guard di rete in tool e worker. Manifest del gate finale registra fail/pass e nessuna esclusione aggiuntiva.

## Scope integrity

SHA-256 PRE/POST: `pre-sha256.json`, `post-sha256.json`; inventario effettivo slice `files-changed-this-slice.json` e `new-product-files.json`. Dirty diff contro HEAD non viene usato per attribuire a questo slice il lavoro preesistente. Nessun file preesistente rimosso, nessun untracked cancellato.

| Gruppo production modificato | Motivazione DATA-03 |
|---|---|
| monetaryBoundary/monetaryPolicies, schemas | Authority condivisa, registry, eliminazione escape hatch |
| inputNormalizer, normalizedInput/calculationResult/snapshot types, monetaryInvalidResult | Trasporto issue/status senza silent hydration repair |
| FinancialMath, fundEngine wrappers, monetaryProcessingSafety | Guard numerica autorizzata; formule core invariate |
| AppContext | Boundary dispatch, UI pending issues, save/closure unsafe blocked |
| Shared Input/MonetaryInput e form/page monetarie | Feedback e commit valido, blank/zero, nessuna seconda formula |
| Compensatore input/page | Cinque input EUR esterni e safety del risultato calcolato esistente |
| Wizard reducer/selectors/validation/hook/types/modal/Step8 | Mutation e derived-output safety, no stale technical failure escape, safe serialization |
| Wizard apply/preview transfer | Validation ai confini prima di mutation/persistence; policy economiche invarianti |
| CSV/XLS/import schema/services | Parsing formati distinto dalla shared monetary policy, reject atomico |
| state/snapshot/yearClosure workflows, state repository, local/cloud drafts | Guard prima del writer; nessuna modifica CAS o Auth |
| Test mirati/DOM expectations | Contratto DATA-03 reale, nessuna modifica golden/oracle |

Hash invariati rispetto a PRE: canonicalFundLedger/canonicalFadProjection, PNRR core/faculty, DL25 core/carry, Dirigenza resolver, empty Fund/Wizard factories, Auth, normative JSON, golden/oracle/scripts relativi e report/evidence precedente. DL25 UI controls e test sono modificati esclusivamente al boundary; non il core DL25.

Non implementati NORM-02, ARCH-02, FUNC-03, ACCESS-01 o altri finding. Document kind/readiness policy invariata; monetary draft guard impedisce solo operazioni con input numericamente invalido. Reconciliation ASTRA invariata.

Strict offline: nessun outbound socket/DNS, nessun Supabase reale. Il tooling Vite richiede lookup localhost intercettati e risolti in memoria dalla guard; conteggio separato in `network-summary.json`. Product attempts=0, real connections=0. Nessun registry/npm download.

## DATA-03 reassessment

Acceptance locale: policy risolta, census completo, parsing/sign/precision/range centralizzati, schema/mutation bypasses zero, UI feedback e no invalid commit, import/transfer/save atomici, aggregate fail-closed, legacy OPEN correggibile, CLOSED read-only, missing/zero preservati, regressioni normative e prodotto verdi.

`DATA_03_STATUS_AFTER_SLICE = CANDIDATE_VERIFIED_FIXED`; `MONETARY_INPUT_BOUNDARY_STATUS = CLOSED_LOCALLY`; gate finali tutti PASS registrati nel terminal output. Non viene dichiarato DATA-03 formalmente VERIFIED_FIXED e non si aggiornano i conteggi ASTRA.

## ACCESS-02 residual

`ACCESS_02_STATUS_AFTER_SLICE = OPEN`. Error association e aria-invalid coprono il boundary monetario. Focus, keyboard, labels, contrast e intero census accessibility appartengono al finding residuo e non sono stati ampliati in questo slice.

## Next gate

`MONETARY_INPUT_BOUNDARY_INDEPENDENT_REVIEW`. Verificare range alle forme JS rappresentabili, alias/transfer plan, legacy OPEN/CLOSED, aggregate save blocking, no semantic drift e preservazione missing/own-properties. Solo una review indipendente positiva può aggiornare ASTRA a VF17/PF5/OPEN3.
