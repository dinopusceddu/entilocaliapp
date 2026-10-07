# WAVE 3 — FINAL INDEPENDENT HARDENING VERIFICATION REPORT

Data review: 23 settembre 2026\
Reviewer: Codex, revisione indipendente\
Repository: `dinopusceddu/entilocaliapp`\
Branch: `ux/toolbox-area-fondo-prototype`

## 1. Verdetto sintetico

```text
W3-DOC-001 = PARTIALLY_FIXED
W3-T15-001 = VERIFIED_FIXED
W3-T15-002 = PARTIALLY_FIXED
W3-ATT-001 = PARTIALLY_FIXED
W3-ATT-002 = PARTIALLY_FIXED
W3-WB-001 = NOT_FIXED
W3-RGS-001 = RGS_SCHEMA_UNVERIFIED

DOC-01_ARITHMETIC_AND_SAFETY = PARTIALLY_FIXED
DOC-02_DOCUMENT_INTEGRITY = PARTIALLY_FIXED
RGS_SCHEMA_VERIFICATION = RGS_SCHEMA_UNVERIFIED

WAVE3_REQUIRES_FIXES
```

Il caso Astra A/2025 richiesto è ora correttamente rappresentato come bozza: `verifiedSubtotal = 3400`, `finalTotal = null`, `overallStatus = UNDETERMINED`; nessuno dei sei file reali verificati costituisce o certifica il fondo complessivo per euro 3.400. Anche lo scenario completamente determinato torna correttamente definitivo.

Il consolidamento non è tuttavia approvabile perché restano percorsi reali che producono una clausola dispositiva definitiva pur avendo `exportReadiness = DOCUMENT_DRAFT`, il guardrail dichiarato non è invocato dagli entry point utente, gli stati amministrativi nuovi non attraversano schema e UI ordinari, e la regola di arrotondamento non è uniforme tra CanonicalFundResult, DocumentProjection e Tabella 15.

`RGS_SCHEMA_UNVERIFIED` resta una limitazione separata dalla quadratura aritmetica. Non prova un difetto del refactoring contabile, ma impedisce di qualificare Tabella 15 come export ufficialmente validato per SICO.

## 2. Baseline e sicurezza ambiente

| Verifica | Esito osservato |
|---|---|
| Branch | `ux/toolbox-area-fondo-prototype` |
| HEAD | `fa0480139d76e938c5ca02312632f698c0acb506` |
| HEAD atteso | coincidente |
| Working tree | Wave 3/hardening non committati, oltre a evidenze e materiali preesistenti; nessun reset, stash o cleanup eseguito |
| Diff tracked | 12 file, `652 insertions(+), 120 deletions(-)` |
| `git diff --check` | PASS; soli warning informativi LF/CRLF |
| Target Supabase effettivo dopo precedenza Vite | `mcasgpaivyosaroxrodm.supabase.co` |
| Target autorizzato | sì: `mcasgpaivyosaroxrodm` |
| Produzione vietata | `yggokplxleredipknfbq`, non selezionata |
| Browser/API | non usati |

La `.env` contiene anche il riferimento vietato, ma la `.env.local` prevalente seleziona il target autorizzato. La verifica è stata eseguita con `loadEnv` di Vite, non per semplice ispezione nominale dei file.

Non risultano modifiche tracked a migration DB. La sola modifica tracked a `fundEngine.ts` aggiunge `denominazioneEnte` ai metadata del risultato; non altera formule normative. Regression 8/8 e oracle Wave 2 14/14 confermano l'assenza di regressioni osservate nei calcoli coperti.

## 3. Inventario della diff Wave 3/hardening

File tracked modificati:

- `src/domain/index.ts`
- `src/domain/tabella15.ts`
- `src/domain/types.ts`
- `src/logic/calculation/fundEngine.ts`
- `src/logic/calculation/tabella15Mapper.ts`
- `src/pages/Tabella15Page.tsx`
- `src/presenters/documentPresenter.ts`
- `src/services/documents/documentFactory.ts`
- `src/services/documents/pdfDeterminaService.ts`
- `src/services/documents/tabella15XlsService.ts`
- `src/services/templates/determinaTemplateV2.ts`
- `src/services/templates/relazioneTecnicaTemplate.ts`

Sono stati aggiunti soltanto come artefatti di questa review:

- `audit_wave3_final_independent/independent_hardening_verification.audit.ts`
- `audit_wave3_final_independent/vitest.audit.config.ts`
- `audit_wave3_final_independent/evidence/*`
- il presente report.

Non sono stati modificati codice applicativo, test permanenti, golden, migration o template.

## 4. Metodo e indipendenza della prova

Sono stati letti integralmente:

- `WAVE3_DOCUMENT_CONSISTENCY_IMPLEMENTATION_REPORT.md`
- `WAVE3_INDEPENDENT_REVIEW_REPORT.md`
- `WAVE3_FINAL_HARDENING_REPORT.md`
- `WAVE2_CONSOLIDATION_REPORT.md`
- `audit_wave3_independent/evidence/independent_probe_results.json`
- `evidence_wave3_hardening/manifest.json`

Le sei sonde originali, successivamente modificate dall'implementatore, sono state considerate test permanenti/adattati e non prova esclusiva. La suite nuova usa expected autonomi, configurazione separata e suffisso `.audit.ts`, così non entra nei 99 file della suite di prodotto.

Esito della suite indipendente: **1 test passato, 6 falliti su 7**. I fallimenti finali sono assertion di accettazione deliberate e riproducibili, non errori di harness. Un primo run aveva evidenziato contaminazione fra artefatti catturati; l'harness è stato corretto, gli output sono stati rigenerati e il run finale è quello riportato qui.

Evidenza strutturata principale: `audit_wave3_final_independent/evidence/independent_hardening_results.json`.

## 5. W3-DOC-001 — PARTIALLY_FIXED

### Caso Astra A/2025 richiesto

Input canonico:

| Entry | Importo/stato |
|---|---:|
| `CCNL_014_CURRENT` | +1.400,00 |
| `OVERTIME_STABLE_TRANSFER` | +2.000,00 |
| `LEGACY_RECOVERY` | 2.800,00 `UNDETERMINED` |
| Art. 60 2025 | 0,00 |

Risultato osservato:

| Livello | Stable verificato | Variable verificato | Totale finale | Stato |
|---|---:|---:|---:|---|
| CanonicalFundResult | 3.400,00 | 0,00 | `null` | `UNDETERMINED` |
| DocumentProjection | 3.400,00 | 0,00 | `null` | bozza |
| Tabella 15 | 3.400,00 | 0,00 | `null` | subtotale verificato |

File reali verificati:

- Relazione TXT: banner di bozza, `SUBTOTALE ... 3400,00`, totale complessivo non determinabile, recovery separato.
- Determina TXT: `DI DARE ATTO, in sede istruttoria`; nessun `DI COSTITUIRE` riferito a euro 3.400.
- Determina PDF: stesso contenuto, due pagine, leggibile, banner rosso e paginazione corretta.
- Prospetto TXT: subtotale euro 3.400 e totale non determinabile.
- Tabella 15 XLSX: riga numerica `SUBTOTALE VERIFICATO = 3400`; nessun totale generale.
- Tabella 15 CSV: `SUBTOTALE VERIFICATO;3400,00;(TOTALE COMPLESSIVO NON DETERMINABILE)`.

### Scenario completamente determinato

Con le sole voci valide `1400 + 2000 + 0 - 0`, gli output reali riportano `TOTALE GENERALE = 3400,00`, la Determina usa `DI COSTITUIRE`, il PDF non contiene banner di bozza e `isDraft = false`. Il fix non blocca erroneamente il caso valido.

### Scostamento residuo

- **Severity:** BLOCKER document integrity.
- **File/percorso:** `src/domain/documentProjection.ts:172-181`; `src/services/templates/determinaTemplateV2.ts:46-47`; `src/services/documents/pdfDeterminaService.ts:112-113`.
- **Input:** ledger con tutte le entries numeriche valide ma `missingPrerequisites = ['REQUIRED_EXTERNAL_PREREQUISITE']`; risultato canonico `status = UNDETERMINED`, `total = 3400`.
- **Expected:** bozza senza clausola dispositiva costitutiva; lo stato complessivo deve prevalere sul mero numero.
- **Actual:** `isDraft = true`, `exportReadiness = DOCUMENT_DRAFT`, ma `isDetermined = true` perché calcolato solo come `total !== null`; TXT/PDF selezionano quindi `DI COSTITUIRE`.
- **Evidenza:** sezione `doc001.unresolvedStatusWithNumericTotal` nel JSON indipendente: `status=UNDETERMINED`, `total=3400`, `isDraft=true`, `constitutes=true`.
- **Impatto:** un atto marcato bozza contiene comunque una formula dispositiva idonea a essere estratta, copiata o usata come costituzione definitiva del fondo.
- **Causa tecnica:** la scelta della formula finale usa `isDetermined && finalTotal !== null`, non `exportReadiness === DOCUMENT_FINAL_READY`/status canonico valido.
- **Correzione raccomandata:** rendere l'idoneità definitiva un unico predicato canonico e usarlo in tutti i template/servizi.
- **Acceptance criteria:** per ogni `status !== VALID`, nessun TXT/PDF/Prospetto deve contenere clausole costitutive o certificative definitive anche se `total` è numerico; il caso `VALID` deve restare definitivo.

## 6. W3-T15-001 — VERIFIED_FIXED

Input indipendente:

| Entry | Componente | Operazione | Importo |
|---|---|---|---:|
| `UNMAPPED_STABLE` | stabile | addizione | 11,00 |
| `UNMAPPED_VARIABLE` | variabile | addizione | 12,00 |
| `UNMAPPED_DEDUCTION` | stabile | decurtazione | 13,00 |

Risultato osservato:

- tutte e tre le identità sono preservate;
- componente stabile/variabile preservata;
- segno della decurtazione preservato come `-13,00`;
- tutte classificate `RGS_MAPPING_UNRESOLVED`;
- nessun fallback a `S615`, `S699`, `V699`;
- tre warning e tre unresolved classifications;
- `verifiedSubtotal = 10,00`, `grandTotal = null`, `isExportReady = false`;
- XLSX e CSV di bozza espongono le tre righe e il blocco di warning.

Acceptance criteria soddisfatti. La rimozione dei fallback ciechi è verificata indipendentemente.

## 7. W3-T15-002 — PARTIALLY_FIXED

### Prove singole

| Input | Expected half-up | Canonical | Projection | Tabella DTO | XLSX cella numerica | CSV |
|---:|---:|---:|---:|---:|---:|---:|
| +100.005 | 100,01 | 100,01 | **100,005** | 100,01 | 100,01 | 100,01 |
| +100.004 | 100,00 | 100,00 | **100,004** | 100,00 | 100,00 | 100,00 |
| -100.005 | -100,01 | -100,01 | **-100,005** | -100,01 | -100,01 | -100,01 |

### Caso multi-entry/multi-deduction

Input: `+100.005 +100.004 -100.005 -10.005`.

- Expected indipendente, con arrotondamento half-up per riga: `100,01 + 100,00 - 100,01 - 10,01 = 89,99`.
- CanonicalFundResult: **90,00**.
- DocumentProjection: `[100.005, 100.004, -100.005, -10.005]`.
- Tabella 15 DTO: `[100,01, 100,00, -100,01, -10,01]`, totale `89,99`.
- XLSX numeric total: `89,99`.
- CSV numeric total: `89,99`.

Finding:

- **Severity:** HIGH.
- **File/percorso:** `src/logic/calculation/canonicalFundLedger.ts:29-67`; `src/domain/documentProjection.ts:139-148`; `src/logic/calculation/tabella15Mapper.ts:85,180-191`.
- **Input:** valori sopra indicati.
- **Expected:** ogni livello riconcilia al centesimo con la stessa policy.
- **Actual:** ledger arrotonda dopo la somma raw; projection non arrotonda le righe; mapper arrotonda ogni riga prima di sommare.
- **Evidenza:** `t15002` nel JSON; XLSX/CSV `t15002_multi_*`.
- **Impatto:** possibile differenza di un centesimo tra fondo canonico, documento e Tabella 15; non è soltanto formattazione visiva Excel.
- **Causa tecnica:** tre momenti diversi di quantizzazione monetaria.
- **Correzione raccomandata:** definire e applicare una sola policy contabile (quantizzazione delle entries canoniche oppure somma uniforme degli stessi valori quantizzati).
- **Acceptance criteria:** i tre casi singoli e il caso multi producono valori e totale identici in CanonicalFundResult, DocumentProjection, DTO, cella numerica XLSX e CSV.

## 8. W3-ATT-001 — PARTIALLY_FIXED

La logica interna, quando i nuovi campi sono iniettati manualmente, evita le precedenti attestazioni automatiche. TXT e PDF reali mostrano:

| Verbale | Outcome | Transmission | Actual |
|---|---|---|---|
| assente | UNKNOWN | NOT_DOCUMENTED | attestazione neutra; nessun parere/trasmissione inventati |
| numero/data | UNKNOWN | NOT_DOCUMENTED | nessun favorevole, ma gli estremi forniti vengono soppressi e il testo afferma che gli estremi non risultano documentati |
| numero/data | FAVORABLE | NOT_DOCUMENTED | parere favorevole con estremi; nessuna trasmissione inventata |
| numero/data | UNFAVORABLE | NOT_DOCUMENTED | parere non favorevole con estremi |
| assente | UNKNOWN | DOCUMENTED_SENT | trasmissione documentata; nessun esito inventato |

Finding:

- **Severity:** HIGH.
- **File/percorso:** `src/domain/documentProjection.ts:187-203`; `src/schemas/fundDataSchemas.ts:175-183`; `src/pages/ReportsPage.tsx` (form metadata).
- **Input:** matrice sopra.
- **Expected:** stati espliciti raggiungibili dai normali flussi; numero/data con outcome unknown conservati senza favorevole.
- **Actual:** comportamento template in gran parte corretto con oggetti manuali; `DocumentMetadataSchema.parse()` elimina `opinionOutcome`, `transmissionStatus`, `adoptionStatus`; ReportsPage non espone né salva i nuovi campi. Nel caso estremi + unknown il testo dichiara anche, impropriamente, che gli estremi non sono documentati.
- **Evidenza:** `att001.parsedByNormalSchema` contiene solo numero/data; flag UI entrambi `false`; PDF reali `att001_*.pdf`.
- **Impatto:** il comportamento corretto non è utilizzabile dall'utente ordinario e i dati espliciti possono essere persi in validazione/persistenza.
- **Causa tecnica:** estensione del type TypeScript e projection senza estensione coordinata dello schema Zod e dell'input UI.
- **Correzione raccomandata:** integrare i campi nell'intero percorso input-schema-persistenza-UI e distinguere “estremi presenti, esito non documentato”.
- **Acceptance criteria:** i cinque casi devono essere riproducibili dal flusso applicativo normale, sopravvivere a parse/save/reload e produrre gli stessi TXT/PDF.

```text
METADATA_INPUT_INTEGRATION_REQUIRED
```

## 9. W3-ATT-002 — PARTIALLY_FIXED

Con metadata costruiti manualmente, TXT e PDF non deducono l'adozione da:

- dati assenti;
- solo numero;
- solo data;
- placeholder;
- numero e data senza `adoptionStatus`;
- `DOCUMENTED_ADOPTED` con estremi incompleti.

Solo `DOCUMENTED_ADOPTED` con numero e data completi genera “La deliberazione della G.C. n. 45 del 10/03/2026...”. La semantica del template è quindi corretta.

Finding:

- **Severity:** HIGH.
- **File/percorso:** `src/domain/documentProjection.ts:206-215`; `src/schemas/fundDataSchemas.ts:175-183`; `src/pages/ReportsPage.tsx`.
- **Input:** sette casi richiesti.
- **Expected:** nessuna adozione implicita e stato esplicito acquisibile normalmente.
- **Actual:** nessuna inferenza nel template, ma lo schema elimina `adoptionStatus` e la UI non lo espone/salva.
- **Evidenza:** `att002.reportsPageHasAdoptionStatusInput = false`; PDF `att002_*.pdf`.
- **Impatto:** l'applicazione normale non può distinguere l'atto adottato documentato dall'assenza di prova; la correzione è accessibile solo a oggetti costruiti in test/codice.
- **Causa tecnica:** integrazione incompleta dei metadata.
- **Correzione raccomandata:** attraversamento completo schema/UI/persistenza.
- **Acceptance criteria:** i sette casi devono essere impostabili da UI, persistiti e riprodotti identicamente in TXT/PDF.

```text
METADATA_INPUT_INTEGRATION_REQUIRED
```

## 10. W3-WB-001 — NOT_FIXED

Flusso ricostruito:

```text
CalculationResult
  -> CanonicalFundResult (se presente)
  -> projectFundDocument()
  -> createDocumentViewModel()
  -> DocumentFactory / template TXT / PDF service
  -> mapToTabella15()
  -> reportService -> XLSX / CSV
  -> ReportsPage / Tabella15Page
```

Finding:

- **Severity:** BLOCKER document integrity.
- **File/percorso:** `src/services/documents/documentFactory.ts:89-148`; `src/services/reportService.ts:67-83`; `src/pages/ReportsPage.tsx:87-138,251-275`; `src/logic/calculation/tabella15Mapper.ts:185-199`.
- **Input:** CalculationResult numerico privo di `canonicalFund`.
- **Expected:** nessun documento definitivo; guardrail effettivamente invocato da tutti gli entry point; al massimo anteprima inequivocabilmente non dispositiva.
- **Actual:** `isDefinitiveExportReady() = false`, ma nessun metodo `generate*` chiama `assertDefinitiveExportAllowed()`. Il PDF/TXT legacy presenta banner di bozza e contemporaneamente `DI COSTITUIRE ... Euro 1400,00`; relazione e prospetto espongono totali finali. Tabella 15 legacy ha `isExportReady=false`, ma `grandTotal=0` e XLSX/CSV emettono `TOTALE GENERALE`. `reportService` e `ReportsPage` non controllano readiness. I pulsanti restano abilitati e la UI descrive i documenti come “Modulistica Amministrativa Certificata” e “pronti per l'adozione”.
- **Evidenza:** `wb001` nel JSON; `wb001_legacy_determina.pdf` (due pagine, leggibile); `wb001_legacy_*` TXT/XLSX/CSV; source lines sopra.
- **Impatto:** il controllo dichiarato è soltanto un metodo disponibile, non un guardrail operativo; un chiamante diretto o il normale flusso UI può scaricare output semanticamente definitivi senza ledger canonico.
- **Causa tecnica:** controllo non collegato agli entry point e fallback legacy che promuovono valori numerici a finali.
- **Correzione raccomandata:** centralizzare il gate in ogni metodo di export e nei servizi Tabella 15; separare esplicitamente anteprima bozza da export definitivo; rendere i fallback incapaci di generare formule dispositive/totali generali.
- **Acceptance criteria:** nessun entry point utente o diretto produce clausola finale/TOTALE GENERALE se canonicalFund manca o readiness non è finale; testare factory, template diretto, PDF, reportService, XLSX, CSV e pagine.

Nota: il prefisso filename `LEGACY_PREVIEW` non neutralizza una clausola interna `DI COSTITUIRE`.

## 11. W3-RGS-001 — RGS_SCHEMA_UNVERIFIED

Stato confermato:

```text
RGS_SCHEMA_UNVERIFIED
```

Separazione osservata:

| Aspetto | Stato |
|---|---|
| Quadratura aritmetica del caso completo | `ARITHMETICALLY_RECONCILED` |
| Validazione schema annuale RGS/SICO | `RGS_SCHEMA_UNVERIFIED` |
| XLSX | espone `Stato Validazione Schema RGS: RGS_SCHEMA_UNVERIFIED` |
| CSV | non espone lo stato schema |
| Tabella15Page | non espone lo stato schema |
| ReportsPage | non espone lo stato; testo “mappato istituzionalmente” |
| `isExportReady` caso completo | `true` pur con schema non verificato |

Finding di contenimento:

- **Severity:** HIGH per uso ufficiale, non per quadratura aritmetica.
- **File/percorso:** `src/logic/calculation/tabella15Mapper.ts:199-222`; `src/services/documents/tabella15XlsService.ts:124-153`; `src/pages/Tabella15Page.tsx`; `src/pages/ReportsPage.tsx:273-275`.
- **Input:** fondo canonico valido, nessuna classificazione unresolved, totale 3.400.
- **Expected:** assenza di unresolved non equivale a schema verificato; ogni canale distingue bozza aritmetica da export SICO ufficiale.
- **Actual:** DTO e XLSX conservano lo stato unverified, ma CSV/UI no; `isExportReady=true` e i percorsi di download non hanno un gate di schema.
- **Evidenza:** `rgs001` nel JSON; `rgs001_complete_*.xlsx/.csv`.
- **Impatto:** il CSV può apparire come Tabella 15 finale pur senza validazione ministeriale annuale.
- **Causa tecnica:** schema status aggiunto al DTO e al solo XLSX, non propagato a UI/CSV né separato dalla readiness aritmetica.
- **Correzione raccomandata:** distinguere nominativamente `arithmeticReadiness` e `rgsSchemaVerification`; marcare ogni output come bozza/non SICO finché lo schema resta unverified.
- **Acceptance criteria:** CSV, XLSX e UI espongono lo stato; nessuna azione è descritta come ufficiale/SICO-ready; `unresolvedClassifications.length === 0` non muta lo schema status.

Non è stata inventata alcuna anagrafica RGS e non viene attestata la correttezza ministeriale dei codici S600/S612/S613/S614/S615/S616/V620/V621/V622/V623/V624/V699/S699.

## 12. Ispezione dei file reali

### Spreadsheet

I workbook sono stati letti con ExcelJS a livello di cella, non valutati soltanto per il formato visivo. Verificati:

- valori numerici reali nelle celle importo;
- ente e anno;
- subtotal/final total;
- warning unresolved;
- stato schema nel workbook;
- decurtazioni negative;
- casi rounding singoli e multi-entry.

### CSV/TXT

I byte dei Blob prodotti dai servizi reali sono stati decodificati e ispezionati riga per riga. Il CSV conserva valori al centesimo e warning unresolved, ma manca lo stato `RGS_SCHEMA_UNVERIFIED`.

### PDF

I PDF prodotti dal servizio reale sono stati:

1. catturati dal `jsPDF.save()` reale;
2. letti con pypdf;
3. renderizzati con Poppler a 120 DPI;
4. ispezionati visivamente.

Tutti i PDF controllati hanno due pagine e risultano leggibili. Il warning Poppler sui display font e i caratteri sostitutivi nell'estrazione pypdf non sono stati attribuiti all'app: il rendering visivo mostra correttamente apostrofi, simbolo euro e layout.

SHA-256 dei tre campioni principali:

| PDF | SHA-256 |
|---|---|
| Astra parziale | `9EB25B235B545813399D626BA534405BCE3B1745C8E713EAEB54B5BCBEA2F653` |
| Completo | `47C20E318B51CC6C3DC52C8DE7B8BFCD9CE4C77C2890CC3E61F412C400943BB4` |
| Legacy senza canonical | `EA381D4CA90D69EBF2CBB2FB0CCA708CB89D005DE79F67816A108E746836D4F9` |

## 13. White-box: formule economiche concorrenti residue

Le formule/template non ricalcolano più il caso Astra principale, ma restano tre fonti concorrenti di semantica economica:

1. `projectFundDocument()` usa fallback legacy per stable/variable/total in assenza di canonicalFund e determina `isDetermined` dal solo `total !== null`.
2. `mapToTabella15()` in assenza di canonicalFund imposta `grandTotal = verifiedSubtotal` anche se `isExportReady=false`.
3. i template e il PDF scelgono la formula dispositiva tramite `isDetermined && finalTotal !== null`, senza usare `exportReadiness`.

Per l'arrotondamento esistono inoltre due basi diverse: il ledger arrotonda la somma raw, il mapper arrotonda le singole righe e poi somma; la projection conserva il terzo decimale.

## 14. Stato DOC-01 / DOC-02

### DOC-01_ARITHMETIC_AND_SAFETY = PARTIALLY_FIXED

- Astra A/2025: riconciliato e sicuro.
- Unknown mappings: fix verificato.
- Segni e celle numeriche: corretti nei casi singoli.
- Residui: divergenza al centesimo multi-entry, fallback legacy con totale generale, RGS non verificato.

### DOC-02_DOCUMENT_INTEGRITY = PARTIALLY_FIXED

- Caso Astra parziale e caso completo: corretti nei file reali.
- Attestazioni manualmente iniettate: logica sostanzialmente corretta.
- Residui: formula dispositiva su status non valido/assenza canonical; metadata non integrati nei normali input; estremi revisori unknown rappresentati come non documentati.

### RGS_SCHEMA_VERIFICATION = RGS_SCHEMA_UNVERIFIED

La quadratura interna non equivale a conformità ministeriale. Il debito resta esplicito e deve rimanere tale finché non viene verificato lo schema annuale ufficiale.

## 15. Full technical gates

| Gate | Risultato reale |
|---|---|
| `git diff --check` | PASS; warning LF/CRLF, nessun errore whitespace |
| `npx tsc --noEmit` | PASS |
| `npm test -- --run` | PASS — **99 file, 1019 test, 0 failure** |
| `npm run build` | PASS — 1865 moduli; warning non bloccanti su `eval` in pdfjs e chunk size |
| `npx vite-node scripts/run_regression_tests.ts` | PASS — **8/8** |
| `npx vite-node scripts/run_wave2_oracle.ts` | PASS — **14/14** |
| Suite indipendente reviewer | **1/7 PASS, 6/7 FAIL** contro gli acceptance criteria del gate |

Le prime invocazioni di Vitest/Vite fuori dal profilo autorizzato hanno fallito perché esbuild non poteva leggere directory superiori del workspace. Sono state ripetute con autorizzazione fuori sandbox; i risultati sopra sono quelli effettivi finali. Non è un bug applicativo.

## 16. Output ammessi e azioni ufficiali bloccate

Finché i finding restano aperti:

- Astra/annualità `UNDETERMINED`: Relazione, Determina, PDF, Prospetto, XLSX e CSV sono soltanto **BOZZA ISTRUTTORIA**.
- Voci `RGS_MAPPING_UNRESOLVED`: XLSX/CSV sono soltanto **BOZZA DI RICONCILIAZIONE**, non export ufficiale.
- Fondo canonico `VALID` senza unresolved: documenti amministrativi possono essere prodotti come finali solo dopo aver corretto il bypass globale e integrato gli stati amministrativi; la Tabella 15 resta comunque **NON VALIDATA PER SICO**.
- CSV/XLSX non devono essere caricati o dichiarati pronti per SICO finché `RGS_SCHEMA_VERIFICATION` non diventa verificato su fonte annuale ufficiale.

## 17. Verdetto finale

```text
WAVE3_REQUIRES_FIXES
```

Motivazione decisiva: il fix del caso Astra è reale, ma il requisito di sicurezza è sistemico. Oggi un risultato `UNDETERMINED` con totale numerico o un CalculationResult senza canonicalFund può ancora produrre una formula `DI COSTITUIRE`, perché il metodo di guardia non è invocato. Questa condizione, insieme alla divergenza di arrotondamento e alla mancata integrazione dei metadata, impedisce il consolidamento.
