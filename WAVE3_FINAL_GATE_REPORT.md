# WAVE 3 — FINAL EVIDENCE & SYSTEMIC VERIFICATION GATE

Data: 23 settembre 2026\
Reviewer: Codex, gate indipendente\
Branch: `ux/toolbox-area-fondo-prototype`\
HEAD: `fa0480139d76e938c5ca02312632f698c0acb506`

## 1. Verdetto

```text
W3-DOC-001 = VERIFIED_FIXED
W3-T15-001 = VERIFIED_FIXED
W3-T15-002 = VERIFIED_FIXED
W3-ATT-001 = VERIFIED_FIXED
W3-ATT-002 = VERIFIED_FIXED
W3-WB-001 = PARTIALLY_FIXED
W3-RGS-001 = RGS_SCHEMA_UNVERIFIED
EVIDENCE_PACK_CONSISTENCY = INCONSISTENT

APPLICATION_READY_FOR_CONSOLIDATION = NO
SICO_SCHEMA_VALIDATED = NO — RGS_SCHEMA_UNVERIFIED

WAVE3_REQUIRES_FIXES
```

Il Systemic Fix ha corretto la semantica documentale, il rounding per voce, il roundtrip dei metadata e la separazione aritmetica/SICO. Il gate non approva però il consolidamento perché gli entry point reali di `ReportsPage` non invocano la modalità definitiva guardata: usano i metodi generici di `DocumentFactory` e `reportService`. Nei casi non ready i documenti prodotti sono effettivamente bozze sicure, ma XLSX/CSV vengono comunque generati dal percorso UI-equivalente predefinito; ciò contraddice sia il requisito “un guard method esistente ma non chiamato non vale come fix” sia la dichiarazione `N/A (Guarded)` del Systemic Fix Report.

La mancata validazione dello schema annuale RGS/SICO resta separata: la quadratura aritmetica può essere completa, ma `isSicoExportReady` resta correttamente `false`.

## 2. Preflight

| Verifica | Actual |
|---|---|
| Branch | `ux/toolbox-area-fondo-prototype` |
| HEAD | `fa0480139d76e938c5ca02312632f698c0acb506` — coincidente con la baseline richiesta |
| Working tree | Wave 3 non committata, con numerosi artefatti preesistenti; nessun reset/stash/cleanup eseguito |
| `git diff --stat` | 17 file tracked, 865 insertions, 147 deletions al preflight |
| `git diff --check` | PASS; soli warning LF/CRLF |
| Commit/push/PR/merge/deploy | non eseguiti |

Sono stati letti integralmente:

- `WAVE3_FINAL_INDEPENDENT_VERIFICATION_REPORT.md`;
- `WAVE3_SYSTEMIC_FIX_REPORT.md`;
- `WAVE3_FINAL_HARDENING_REPORT.md`;
- `evidence_wave3_hardening/manifest.json`.

## 3. Contraddizione del pacchetto precedente

### 3.1 Quale dataset appartiene ai file presenti

Il dataset realmente contenuto nell’ultima esecuzione file-backed di `evidence_wave3_hardening/` è quello del vecchio hardening:

- manifest Scenario A: `canonicalTotal = 51272.56`, `tableGrandTotal = 51272.56`;
- CSV Scenario A: `TOTALE GENERALE;51272,56`;
- Relazione Scenario A: `TOTALE GENERALE: Euro € 51.272,56`;
- XLSX/PDF/TXT Scenario A appartengono alla stessa famiglia nominale;
- manifest e file hanno `LastWriteTime` circa 13:10 del 23/09/2026;
- il Systemic Fix Report è successivo, circa 13:15, ma dichiara Scenario A `277.44`.

Conclusione: i file non sono semplicemente residui non toccati. Sono stati rigenerati prima del report sistemico usando la vecchia tassonomia/scenari e conservano il dataset `51272.56`. Il Systemic Fix Report descrive un dataset diverso che non è quello del manifest né dei file presenti.

### 3.2 XLSX/CSV “N/A (Guarded)”

Il Systemic Fix Report dichiara XLSX/CSV `N/A (Guarded)` per gli scenari non ready, ma:

- il vecchio manifest elenca XLSX/CSV per Scenario B e C;
- i file esistono materialmente;
- nel codice corrente `ReportsPage` chiama `generateTabella15ExportXLS/CSV` senza `mode: 'DEFINITIVE_EXPORT'`;
- il percorso predefinito genera i file senza invocare `assertDefinitiveTabella15ExportAllowed`;
- la harness nuova ha riprodotto la stessa cosa per fondo `UNDETERMINED`, canonical mancante e mapping unresolved.

I file generati in questi casi sono chiaramente marcati come non completi/non SICO e non espongono un totale generale definitivo. Tuttavia non sono `N/A (Guarded)`. La dichiarazione del report è errata e il manifest è semanticamente stale rispetto alla nuova matrice A–G.

### 3.3 Nomi scenario reali

| Concetto | Vecchio manifest/file | Systemic Fix Report | Nuovo gate indipendente |
|---|---|---|---|
| Fondo completo principale | Scenario A, `51272.56` | Scenario A, `277.44` | `A_VALID_277_44` |
| Single rounding | Scenario G, `100.01` | non Scenario G | incluso nell’oracolo indipendente |
| Multi-entry rounding | assente dal vecchio manifest | Scenario F, `89.99` | `D_MULTI_ENTRY_ROUNDING_89_99` |
| Unmapped RGS | Scenario C, una voce | Scenario G | `E_RGS_UNMAPPED_THREE_COMPONENTS` |

Questa rinumerazione non è riflessa nel manifest precedente.

## 4. Metodo indipendente e nuova evidenza

Directory nuova, senza sovrascrivere il pacchetto precedente:

`audit_wave3_final_gate/`

La harness `final_gate.audit.ts` ha eseguito, dove applicabile:

```text
form data
→ FundDataSchema Zod
→ JSON serialized application data
→ JSON load + seconda parse Zod
→ normalizeInput
→ calculateFundCompletely / CanonicalFundLedger
→ DocumentProjection
→ DocumentViewModel
→ TXT/PDF/XLSX/CSV reali
→ rilettura dei byte e SHA256
→ manifest.json nella stessa esecuzione
```

Per l’oracolo al terzo decimale è stata usata aritmetica indipendente su stringhe decimali e centesimi interi, senza riusare `FinancialMath` per gli expected.

I PDF sono stati riletti dal file reale tramite PDF.js; gli XLSX tramite ExcelJS a livello di cella numerica; CSV/TXT dai byte salvati. Ogni file incluso nel nuovo manifest contiene size, SHA256 e valori osservati.

## 5. Matrice scenari nuova

| Scenario | Canonical | Totale | Subtotale | Document readiness | Arithmetic | SICO | File generati | Definitivi bloccati |
|---|---|---:|---:|---|---:|---:|---:|---:|
| A_VALID_277_44 | VALID | 277.44 | 277.44 | DOCUMENT_FINAL_READY | true | false | 6 | 0 |
| B_UNDETERMINED_NUMERIC_TOTAL | UNDETERMINED | 277.44 | 277.44 | DOCUMENT_DRAFT | false | false | 6 | 6 |
| C_CANONICAL_FUND_MISSING | MISSING | null | 277.44 | DOCUMENT_DRAFT | false | false | 6 | 4 |
| D_MULTI_ENTRY_ROUNDING_89_99 | VALID | 89.99 | 89.99 | DOCUMENT_FINAL_READY | true | false | 6 | 0 |
| E_RGS_UNMAPPED_THREE_COMPONENTS | VALID | 10.00 | 10.00 | DOCUMENT_FINAL_READY | false | false | 2 | 2 |
| F1 UNKNOWN con estremi | VALID | 277.44 | 277.44 | DOCUMENT_FINAL_READY | true | false | 1 PDF | 0 |
| F2 FAVORABLE | VALID | 277.44 | 277.44 | DOCUMENT_FINAL_READY | true | false | 1 PDF | 0 |
| F3 UNFAVORABLE | VALID | 277.44 | 277.44 | DOCUMENT_FINAL_READY | true | false | 1 PDF | 0 |
| F4 transmitted | VALID | 277.44 | 277.44 | DOCUMENT_FINAL_READY | true | false | 1 PDF | 0 |
| F5 not documented | VALID | 277.44 | 277.44 | DOCUMENT_FINAL_READY | true | false | 1 PDF | 0 |
| G1 adoption NOT_DOCUMENTED | VALID | 277.44 | 277.44 | DOCUMENT_FINAL_READY | true | false | 1 PDF | 0 |
| G2 adoption DOCUMENTED_ADOPTED | VALID | 277.44 | 277.44 | DOCUMENT_FINAL_READY | true | false | 1 PDF | 0 |

## 6. W3-DOC-001 — VERIFIED_FIXED

Caso richiesto:

```text
status = UNDETERMINED
total = 277.44
missingPrerequisites = [AUDIT_REQUIRED_EXTERNAL_PREREQUISITE]
```

Actual:

- `DocumentProjection.exportReadiness = DOCUMENT_DRAFT`;
- Determina TXT reale: banner bozza, formula `DI DARE ATTO`, nessun `DI COSTITUIRE`;
- Determina PDF reale: banner bozza, nessun `DI COSTITUIRE` nell’estrazione PDF.js;
- Relazione TXT: subtotale 277.44, totale complessivo non determinabile, nessun `TOTALE GENERALE`;
- Prospetto TXT: bozza e totale non determinabile;
- i quattro export definitivi DocumentFactory sono bloccati.

Caso `VALID`, totale non nullo, prerequisiti vuoti:

- `DOCUMENT_FINAL_READY`;
- `DI COSTITUIRE` presente in TXT/PDF;
- totale 277.44 coerente in canonical, projection, VM e Tabella 15.

## 7. W3-T15-002 — VERIFIED_FIXED

Oracolo indipendente:

```text
+100.005 → +100.01
+100.004 → +100.00
-100.005 → -100.01
-10.005  → -10.01
aggregate = 89.99
```

Actual:

| Livello | Valore |
|---|---:|
| CanonicalFundResult | 89.99 |
| DocumentProjection | 89.99 |
| Determina DTO | 89.99 |
| Determina TXT reale | 89.99 |
| Determina PDF reale | 89.99 |
| Relazione TXT reale | 89.99 |
| Tabella15 DTO | 89.99 |
| XLSX cella numerica reale | 89.99 |
| CSV campo numerico reale | 89.99 |

Tutti i check sono PASS.

## 8. W3-ATT-001 / W3-ATT-002 — VERIFIED_FIXED

I metadata sono stati immessi nel normale `FundData`, validati con `FundDataSchema`, serializzati, ricaricati, rivalidati e poi proiettati.

- `UNKNOWN` con numero/data conserva `Verbale n. 12 del 15/03/2026`, non genera “favorevole” e dichiara soltanto l’esito non documentato;
- `FAVORABLE` genera il parere favorevole con estremi;
- `UNFAVORABLE` genera il parere non favorevole con estremi;
- `DOCUMENTED_SENT` genera la trasmissione documentata;
- `NOT_DOCUMENTED`/campo non documentato non inventa la trasmissione;
- `adoptionStatus = NOT_DOCUMENTED` sopravvive al roundtrip e non attesta adozione anche con numero/data;
- `adoptionStatus = DOCUMENTED_ADOPTED` con numero/data completi attesta la delibera.

I controlli sono effettivamente raggiungibili in `ReportsPage` e persistiti tramite `UPDATE_ANNUAL_DATA` nel normale snapshot annuale.

## 9. W3-T15-001 — VERIFIED_FIXED

Tre voci distinte sono state provate:

```text
unknown stable    +11.00
unknown variable  +12.00
unknown deduction -13.00
```

Actual:

- tre classificazioni `RGS_MAPPING_UNRESOLVED`;
- identità, componente e segno preservati;
- nessun fallback automatico `S615`, `S699`, `V699`;
- `grandTotal = null`;
- `isArithmeticExportReady = false`;
- export definitivo XLSX/CSV con `DEFINITIVE_EXPORT` bloccato;
- output di riconciliazione predefiniti ancora materialmente generabili, con warning e subtotale 10.00.

## 10. W3-WB-001 — PARTIALLY_FIXED

### Parte verificata

- canonical mancante: `DOCUMENT_DRAFT`, nessuna formula definitiva TXT/PDF, wrapper definitivi DocumentFactory bloccati;
- canonical `UNDETERMINED`: stesso contenimento;
- reportService con `mode: 'DEFINITIVE_EXPORT'`: XLSX/CSV bloccati quando la quadratura non è pronta;
- template TXT e PDF selezionano la formula tramite `exportReadiness`, non tramite il solo totale numerico.

### Residuo sistemico

`ReportsPage` non chiama i wrapper definitivi né passa `mode: 'DEFINITIVE_EXPORT'`:

```text
generateTabella15ExportXLS(calculationResult, normativeData)
generateTabella15ExportCSV(calculationResult, normativeData)
factory.generateDetermina()
factory.generateDeterminaDocumentPDF()
factory.generateRelazioneTecnica()
factory.generateProspettoContrattazione()
```

Quindi il guard esiste e funziona, ma non è attraversato dall’entry point utente. La harness ha confermato che i percorsi UI-equivalenti predefiniti generano XLSX/CSV per:

- canonical `UNDETERMINED`;
- canonical mancante;
- tre mapping unresolved.

I file prodotti sono semanticamente prudenti: niente totale generale, header `RGS_SCHEMA_UNVERIFIED`, `Pronto per SICO: NO`, quadratura non completa. Questo evita una falsa certificazione, ma non soddisfa la dichiarazione “N/A (Guarded)” né il requisito di wiring sistemico del gate.

## 11. W3-RGS-001 — RGS_SCHEMA_UNVERIFIED

Caso `VALID`, nessun unresolved, totale 277.44:

```text
isArithmeticExportReady = true
isSicoExportReady = false
schemaVerificationStatus = RGS_SCHEMA_UNVERIFIED
```

Actual:

- XLSX: stato schema esplicito;
- CSV: `RGS_SCHEMA_UNVERIFIED`, `Pronto per SICO: NO`, quadratura aritmetica separata;
- `Tabella15Page`: warning esplicito e divieto di caricamento SICO;
- `ReportsPage`: warning esplicito “non costituisce validazione ministeriale”;
- nessuna UI dichiara SICO ready, validato RGS o pronto per trasmissione ministeriale.

Lo stato non viene promosso a VERIFIED.

## 12. SHA256 principali

| Scenario/file | SHA256 |
|---|---|
| A Determina TXT | `14d9e12043f24b7643a3e4bf565d254b9407ee7f20e64259079fd35b913180ba` |
| A Determina PDF | `d6a3b0a87731b2cbeffc995cf321f5df47c208e7558771b4e3f5d4c73546f053` |
| A Tabella XLSX | `94f6b402547d1427a07167d013f65a020875a3727bbb7663f928442001ff99a3` |
| A Tabella CSV | `6ad98b294067931b7d9aaec35104c1f0b445a687aaeffa9dfd1cc275cea29ae5` |
| D rounding Determina TXT | `9691c215328aacec48fd8b82da5a394ba6864db29f2aab9104929dd57967a069` |
| D rounding Determina PDF | `d80963d44b7a075d9f7c1ac0ef4f4dc0dc19aa62a9e48749df6ae0e82f7a23fd` |
| D rounding XLSX | `97fea7dbad0c491a364d87fbd7f37ea74f1fd532759608300b14ddd271ef96e3` |
| D rounding CSV | `68421293729640d3eb02b0353b5ea9e02e9b1b01a43227d38869fce28d4d1e70` |
| E unresolved XLSX | `45386f81c7b1e7b60260c46d778c7d9e17350f30987f0bbee6cd39433fdfeca5` |
| E unresolved CSV | `0e4cdbb6253012c3258ede302b5f4f5cf3001a8030bb8af87086f6d0d54ffcb2` |

Il manifest contiene gli SHA256 di tutti i 33 file del nuovo pacchetto.

## 13. Quality gates actual

| Comando | Actual |
|---|---|
| `git diff --check` | PASS, exit 0; soli warning EOL |
| `npx tsc --noEmit` | PASS, exit 0 |
| `npm test -- --run` | PASS — **100 file, 1040 test, 0 failure** |
| `npm run build` | PASS — 1865 moduli; warning non bloccanti `eval` pdfjs e chunk size |
| `npx vite-node scripts/run_regression_tests.ts` | PASS — **8/8** |
| `npx vite-node scripts/run_wave2_oracle.ts` | PASS — **14/14** |
| Harness indipendente | PASS esecuzione — 12 scenari, 68 check, 1 finding di wiring |

Le prime invocazioni Vite/Vitest in sandbox hanno fallito per accesso negato alle directory runtime superiori; i comandi sono stati ripetuti fuori sandbox con autorizzazione mirata. Non è un difetto applicativo.

## 14. Confronto automatico report / manifest / file

Il seguente blocco è machine-readable ed è verificato da `audit_wave3_final_gate/verify_report_consistency.mjs` contro il nuovo manifest e contro size/hash/contenuto dei file reali.

<!-- AUDIT_VALUES_BEGIN
{
  "A_VALID_277_44": {"canonicalStatus":"VALID","canonicalTotal":277.44,"verifiedSubtotal":277.44,"documentReadiness":"DOCUMENT_FINAL_READY","arithmeticReadiness":true,"sicoReadiness":false},
  "B_UNDETERMINED_NUMERIC_TOTAL": {"canonicalStatus":"UNDETERMINED","canonicalTotal":277.44,"verifiedSubtotal":277.44,"documentReadiness":"DOCUMENT_DRAFT","arithmeticReadiness":false,"sicoReadiness":false},
  "C_CANONICAL_FUND_MISSING": {"canonicalStatus":"MISSING","canonicalTotal":null,"verifiedSubtotal":277.44,"documentReadiness":"DOCUMENT_DRAFT","arithmeticReadiness":false,"sicoReadiness":false},
  "D_MULTI_ENTRY_ROUNDING_89_99": {"canonicalStatus":"VALID","canonicalTotal":89.99,"verifiedSubtotal":89.99,"documentReadiness":"DOCUMENT_FINAL_READY","arithmeticReadiness":true,"sicoReadiness":false},
  "E_RGS_UNMAPPED_THREE_COMPONENTS": {"canonicalStatus":"VALID","canonicalTotal":10,"verifiedSubtotal":10,"documentReadiness":"DOCUMENT_FINAL_READY","arithmeticReadiness":false,"sicoReadiness":false},
  "F1_UNKNOWN_WITH_EXTREMES": {"canonicalStatus":"VALID","canonicalTotal":277.44,"verifiedSubtotal":277.44,"documentReadiness":"DOCUMENT_FINAL_READY","arithmeticReadiness":true,"sicoReadiness":false},
  "F2_FAVORABLE": {"canonicalStatus":"VALID","canonicalTotal":277.44,"verifiedSubtotal":277.44,"documentReadiness":"DOCUMENT_FINAL_READY","arithmeticReadiness":true,"sicoReadiness":false},
  "F3_UNFAVORABLE": {"canonicalStatus":"VALID","canonicalTotal":277.44,"verifiedSubtotal":277.44,"documentReadiness":"DOCUMENT_FINAL_READY","arithmeticReadiness":true,"sicoReadiness":false},
  "F4_TRANSMITTED": {"canonicalStatus":"VALID","canonicalTotal":277.44,"verifiedSubtotal":277.44,"documentReadiness":"DOCUMENT_FINAL_READY","arithmeticReadiness":true,"sicoReadiness":false},
  "F5_NOT_DOCUMENTED": {"canonicalStatus":"VALID","canonicalTotal":277.44,"verifiedSubtotal":277.44,"documentReadiness":"DOCUMENT_FINAL_READY","arithmeticReadiness":true,"sicoReadiness":false},
  "G1_ADOPTION_NOT_DOCUMENTED": {"canonicalStatus":"VALID","canonicalTotal":277.44,"verifiedSubtotal":277.44,"documentReadiness":"DOCUMENT_FINAL_READY","arithmeticReadiness":true,"sicoReadiness":false},
  "G2_ADOPTION_DOCUMENTED": {"canonicalStatus":"VALID","canonicalTotal":277.44,"verifiedSubtotal":277.44,"documentReadiness":"DOCUMENT_FINAL_READY","arithmeticReadiness":true,"sicoReadiness":false}
}
AUDIT_VALUES_END -->

Risultato eseguito del verificatore: `REPORT_VALUES == NEW_MANIFEST_VALUES == ACTUAL_FILE_VALUES` per tutti i valori applicabili. Esito `CONSISTENT`: 12 scenari, 33 file, 172 controlli, zero divergenze e zero file stale inclusi.

## 15. Conclusione

Le correzioni sostanziali ai calcoli e ai documenti sono verificate. Non è invece verificata la dichiarazione sistemica secondo cui tutti gli entry point reali attraversano il guardrail: l’UI usa ancora la modalità predefinita e genera artefatti Tabella 15 nei casi che il report definisce “N/A (Guarded)”. Il pacchetto precedente, inoltre, non corrisponde alla matrice/scenari del Systemic Fix Report.

Per questi motivi il solo verdetto consentito è:

```text
WAVE3_REQUIRES_FIXES
```
