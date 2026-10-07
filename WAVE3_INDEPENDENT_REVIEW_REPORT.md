# WAVE 3 — INDEPENDENT DOCUMENT & EXPORT REVIEW REPORT

Data review: 22 settembre 2026\
Reviewer: Codex, revisione indipendente (non autore delle modifiche)\
Repository: `dinopusceddu/entilocaliapp`\
Branch: `ux/toolbox-area-fondo-prototype`

## 1. Baseline

| Controllo | Risultato osservato |
|---|---|
| Branch | `ux/toolbox-area-fondo-prototype` |
| HEAD | `fa0480139d76e938c5ca02312632f698c0acb506` |
| HEAD atteso | coincidente |
| Wave 3 | presente nel working tree non committato |
| Target runtime | `https://mcasgpaivyosaroxrodm.supabase.co` |
| Target autorizzato | sì: project ref `mcasgpaivyosaroxrodm` |
| Produzione vietata | `yggokplxleredipknfbq`, non utilizzata |
| Operazioni DB | nessuna; nessun browser/API write eseguito |

Sono stati letti integralmente i documenti richiesti:

- `ASTRA_RSU_AUDIT_REPORT.md`;
- `ASTRA_NORMATIVE_MATRIX.md`;
- `ASTRA_TEST_MATRIX.md`;
- `WAVE2_CONSOLIDATION_REPORT.md`;
- `WAVE3_DOCUMENT_CONSISTENCY_IMPLEMENTATION_REPORT.md`.

Il report dell'implementatore è stato usato solo come inventario dichiarato, non come prova.

## 2. Diff inventory

`git diff --stat` osservato:

```text
8 files changed, 434 insertions(+), 88 deletions(-)
```

File tracked modificati:

- `src/domain/index.ts`;
- `src/logic/calculation/fundEngine.ts`;
- `src/logic/calculation/tabella15Mapper.ts`;
- `src/presenters/documentPresenter.ts`;
- `src/services/documents/documentFactory.ts`;
- `src/services/documents/pdfDeterminaService.ts`;
- `src/services/templates/determinaTemplateV2.ts`;
- `src/services/templates/relazioneTecnicaTemplate.ts`.

File Wave 3 nuovi, non tracked:

- `src/domain/documentProjection.ts`;
- `src/logic/calculation/__tests__/documentConsistencyWave3.test.ts`.

Il working tree contiene inoltre numerosi file untracked anteriori alla Wave 3. Il confronto con `WAVE2_CONSOLIDATION_REPORT.md` conferma che le migration SQL untracked erano già presenti al consolidamento Wave 2. Nessuna migration tracked è stata modificata dalla Wave 3.

La sola variazione Wave 3 in `fundEngine.ts` aggiunge `denominazioneEnte` ai metadata del risultato. Non sono state rilevate modifiche alle formule normative consolidate in Wave 2.

`git diff --check` è passato; sono presenti soltanto avvisi informativi LF/CRLF.

## 3. Characterization

Caso Astra A/2025 riprodotto indipendentemente:

| Livello | Stable | Variable | Recovery/unresolved | Totale complessivo | Stato |
|---|---:|---:|---|---|---|
| Expected | 3.400,00 | non determinabile | 2.800,00 non istruiti | `UNDETERMINED` | `UNDETERMINED` |
| `CanonicalFundResult` | 3.400,00 | `null` | separato | `null` | `UNDETERMINED` |
| `DocumentProjection` | 3.400,00 verified | `null` | separato | `total=null`, `effectiveTotal=3400` | `UNDETERMINED`/draft |
| Tabella 15 | 3.400,00 | 0,00 | omesso | 3.400,00 | nessun flag unresolved |
| Relazione | 3.400,00 | — | elencato separatamente | etichettato `TOTALE GENERALE` | bozza |
| Determina TXT/PDF | — | — | avviso di bozza | costituisce 3.400,00 come importo complessivo | bozza |
| Prospetto | 3.400,00 | — | avviso di bozza | etichettato “Totale Disponibile” | bozza |

Valori canonici osservati:

```text
verifiedStable = 3400
Art60_2025 = 0
recovery = UNDETERMINED
overallNormativeTotal = UNDETERMINED
```

La parte di calcolo canonico soddisfa l'expected. La semantica documentale a valle non lo preserva integralmente.

Evidenza macchina: [`audit_wave3_independent/evidence/independent_probe_results.json`](audit_wave3_independent/evidence/independent_probe_results.json).

## 4. Arithmetic reconciliation

Per il caso Astra A/2025:

- `CCNL_014_CURRENT`: +1.400,00, mappato una volta;
- `OVERTIME_STABLE_TRANSFER`: +2.000,00, mappato una volta;
- `ART60_CONSOLIDATION`: 0 nel 2025, nessuna riga economica;
- arretrati legacy 2.800,00: `UNDETERMINED`, non sommati al ledger verificato;
- totale stable verificato: 3.400,00;
- totale canonico complessivo: `null`;
- Tabella 15 esportata: 3.400,00.

Le voci valide standard sono conteggiate una sola volta e `economicEffect=false` è escluso. Tuttavia:

1. la Tabella 15 scarta le voci unresolved senza esporre warning/stato di review;
2. il suo `grandTotal` diventa quindi un totale apparentemente completo;
3. l'arrotondamento non è coerente con il ledger canonico.

Caso di arrotondamento indipendente:

| Artefatto | Valore effettivo |
|---|---:|
| `CanonicalFundResult.verifiedTotal` | 100,01 |
| DTO Tabella 15 | 100,005 |
| cella numerica XLSX | 100,005, visualizzata con formato a due decimali |
| riga CSV reale | 100,00 |

La divergenza deriva dalla somma grezza nel mapper e dal successivo `toFixed(2)` del CSV, mentre il ledger arrotonda a centesimi.

## 5. Normative vs verified total distinction

**Esito: BLOCKER DOCUMENT INTEGRITY.**

Quando `canonicalFund.total === null`, `documentProjection.ts:163-165` sostituisce i totali non determinabili con i subtotali verificati:

```ts
const effectiveTotal = total !== null ? total : verifiedTot;
```

Il valore viene poi presentato come totale ordinario e definitivo:

- relazione: `TOTALE GENERALE: Euro € 3400,00` e “TOTALE CERTIFICATO”;
- determina TXT/PDF: `DI COSTITUIRE ... nell'importo complessivo ... € 3400,00`;
- prospetto: `Totale Disponibile Fondo Dipendenti: € 3400,00`;
- Tabella 15: `TOTALE GENERALE` 3.400,00 senza warning unresolved.

Le intestazioni di bozza e l'avviso “subtotale verificato” non neutralizzano una formula dispositiva che costituisce il fondo per un importo complessivo. Il documento resta semanticamente e amministrativamente fuorviante.

Evidenze reali:

- [`Relazione_Tecnica_Fondo_2025.txt`](audit_wave3_independent/evidence/Relazione_Tecnica_Fondo_2025.txt);
- [`Determina_Costituzione_Fondo_2025.txt`](audit_wave3_independent/evidence/Determina_Costituzione_Fondo_2025.txt);
- [`Prospetto_Contrattazione_2025.txt`](audit_wave3_independent/evidence/Prospetto_Contrattazione_2025.txt);
- [`Determina_Costituzione_Fondo_2025.pdf`](audit_wave3_independent/evidence/Determina_Costituzione_Fondo_2025.pdf).

## 6. Tabella 15 mapping matrix

Mappature codificate osservate:

| Entry canonica | Codice scelto | Trattamento aritmetico | Esito aritmetico |
|---|---|---|---|
| `LEGACY_FAD_RESOURCE:st_art79c1_art67c1_unicoImporto2017` | S600 | stabile | coerente internamente |
| `LEGACY_FAD_RESOURCE:st_art79c1_art67c1_art67c1a_unicoImporto2017` | S600 | stabile | coerente internamente |
| `LEGACY_FAD_RESOURCE:st_art79c1_art67c1_art67c1b_8350PerDipendente` | S612 | stabile | coerente internamente |
| `LEGACY_FAD_RESOURCE:st_art79c1_art67c1_art67c1c_RIA` | S613 | stabile | coerente internamente |
| `CCNL_014_CURRENT` | S614 | stabile | coerente internamente |
| `OVERTIME_STABLE_TRANSFER` | S615 | stabile | coerente internamente |
| `LEGACY_FAD_RESOURCE:st_art79c1_art67c1_art67c1d_8450` | S615 | stabile | coerente internamente |
| `LEGACY_FAD_RESOURCE:st_art79c1_art67c1_art67c1e_DL25_2017` | S615 | stabile | coerente internamente |
| `ART60_CONSOLIDATION` | S616 | decurtazione stabile | segno corretto nel 2026 |
| `LEGACY_FAD_RESOURCE:vn_art79c2a_risorseResidueAnnoPrecedente` | V620 | variabile | coerente internamente |
| `LEGACY_FAD_RESOURCE:vn_art79c2b_recuperoEvasione` | V621 | variabile | coerente internamente |
| `LEGACY_FAD_RESOURCE:vn_art79c2c_incentiviTecnici` | V622 | variabile | coerente internamente |
| `CCNL_022_FUND_CURRENT` | V623 | variabile | coerente internamente |
| `CCNL_014_RECOVERY` | V624 | variabile | coerente internamente |
| stable legacy sconosciuto/addition | S615 | fallback | non accettabile senza review |
| stable legacy sconosciuto/deduction | S699 | fallback | non accettabile senza review |
| variable legacy conosciuto solo via definition | V699 | fallback | non accettabile senza review |
| variable canonico totalmente sconosciuto | S615 | default | errore di classificazione di componente |

La quadratura interna non dimostra la correttezza ministeriale del codice.

## 7. RGS schema verification

### Stato

`RGS_SCHEMA_UNVERIFIED`

Sono state cercate fonti ufficiali RGS/MEF/SICO per i codici dell'annualità pertinente. Il portale ufficiale conferma che la “Costituzione dei fondi” distingue risorse fisse e variabili e che la sezione deriva dal monitoraggio della contrattazione integrativa. La pagina download ufficiale specifica inoltre che le descrizioni dei codici sono contenute nei file di anagrafica annuali. Non è stato però reperito, nelle fonti pubbliche accessibili durante la review, uno schema/anagrafica ufficiale 2025/2026 che enumeri e descriva i codici S600, S612-S616, V620-V624, S699 e V699.

Fonti ufficiali consultate:

- [RGS/Conto Annuale — Contrattazione integrativa](https://contoannuale.rgs.mef.gov.it/web/sicosito/contrattazione-integrativa);
- [RGS/Conto Annuale — Dati pubblicati](https://contoannuale.rgs.mef.gov.it/it/web/sicosito/dati-pubblicati);
- [RGS/Conto Annuale — Download dati e anagrafiche](https://contoannuale.rgs.mef.gov.it/web/sicosito/download);
- [RGS, Allegato alla circolare n. 18/2018 — guida Tabella 15](https://www.rgs.mef.gov.it/_Documenti/VERSIONE-I/CIRCOLARI/2018/18/Allegato_alla_Circolare_del_22_maggio_2018_n._18.pdf), utile per la struttura generale ma non sufficiente per validare lo schema 2025/2026.

Matrice richiesta:

| Entry canonica | Codice scelto | Fonte ufficiale | Anno schema | Esito |
|---|---|---|---|---|
| Unico importo consolidato 2017 | S600 | schema annuale ufficiale non reperito | non verificato | `RGS_SCHEMA_UNVERIFIED` |
| 83,20 per dipendente | S612 | schema annuale ufficiale non reperito | non verificato | `RGS_SCHEMA_UNVERIFIED` |
| RIA/assegni ad personam | S613 | schema annuale ufficiale non reperito | non verificato | `RGS_SCHEMA_UNVERIFIED` |
| incremento 0,14% corrente | S614 | schema annuale ufficiale non reperito | 2025/2026 non verificato | `RGS_SCHEMA_UNVERIFIED` |
| trasferimento straordinario consolidato | S615 | schema annuale ufficiale non reperito | 2025/2026 non verificato | `RGS_SCHEMA_UNVERIFIED` |
| 84,50 per dipendente | S615 | schema annuale ufficiale non reperito | non verificato | `RGS_SCHEMA_UNVERIFIED` |
| DL 25/2017 | S615 | schema annuale ufficiale non reperito | non verificato | `RGS_SCHEMA_UNVERIFIED` |
| Art. 60 | S616 | schema annuale ufficiale non reperito | 2026 non verificato | `RGS_SCHEMA_UNVERIFIED` |
| residui anno precedente | V620 | schema annuale ufficiale non reperito | non verificato | `RGS_SCHEMA_UNVERIFIED` |
| recupero evasione | V621 | schema annuale ufficiale non reperito | non verificato | `RGS_SCHEMA_UNVERIFIED` |
| incentivi tecnici | V622 | schema annuale ufficiale non reperito | non verificato | `RGS_SCHEMA_UNVERIFIED` |
| incremento 0,22% | V623 | schema annuale ufficiale non reperito | 2025/2026 non verificato | `RGS_SCHEMA_UNVERIFIED` |
| recupero 0,14% | V624 | schema annuale ufficiale non reperito | 2025/2026 non verificato | `RGS_SCHEMA_UNVERIFIED` |
| residuali stable/variable | S699/V699 | nessuna base annuale ufficiale reperita per uso automatico | non verificato | non autorizzabile come fallback cieco |

Conclusione: il completamento aritmetico DOC-01 è distinto dalla validazione ministeriale. La Wave 3 non può dichiarare validata la codifica RGS.

## 8. Legacy fallback review

`tabella15Mapper.ts:81` inizializza ogni voce a `S615`. Solo dopo applica mapping espliciti o tenta un fallback basato sulle definizioni legacy.

Problemi riprodotti:

- voce stable sconosciuta → S615;
- voce legacy stable sconosciuta → S615;
- voce variable canonica sconosciuta senza definition → **S615**, quindi codice stable;
- deduction stable legacy sconosciuta → S699;
- voce variable legacy riconosciuta solo dalla definition → V699;
- nessun warning o stato `REVIEW_REQUIRED` nel DTO Tabella 15.

Un importo non classificabile viene quindi collocato in una colonna residuale/default per ottenere quadratura. Il comportamento non soddisfa R6.

## 9. Art. 60 treatment

| Caso | Ledger | Projection | Tabella 15 | TXT/PDF | Esito |
|---|---|---|---|---|---|
| 2025 | nessuna riduzione economica | 0 | nessuna riga Art. 60 | nessuna affermazione di riduzione | PASS |
| 2026 | `ART60_CONSOLIDATION` amount 127,44, operation `DEDUCTION` | -127,44 economico | S616, -127,44 | riduzione coerente | PASS aritmetico |
| figurativo | `ART60_ART23_FIGURATIVE`, `economicEffect=false` | informativo | escluso | non duplicato economicamente | PASS |

Il segno è rappresentato correttamente: amount canonico positivo con operation `DEDUCTION`, proiettato/esportato come -127,44. Non è stata osservata doppia contabilizzazione della voce figurativa.

La correttezza del codice ministeriale S616 resta soggetta a `RGS_SCHEMA_UNVERIFIED`.

## 10. Revisors and GC attestations

### Revisori

| Input | Actual |
|---|---|
| numero assente | nessun “favorevole”, ma afferma che il provvedimento “viene trasmesso” |
| data assente | stesso comportamento |
| placeholder | stesso comportamento |
| numero e data valorizzati, esito assente | afferma automaticamente “parere favorevole” |
| esito assente | non distinguibile dal favorevole quando numero/data sono presenti |
| esito favorevole esplicito | non rappresentabile nel modello |
| esito non favorevole | non rappresentabile nel modello |
| trasmissione non documentata | il testo afferma comunque la trasmissione |

`DocumentMetadata` contiene solo numero/data, non esito né prova/stato di trasmissione. Pertanto numero e data vengono usati impropriamente come prova del contenuto favorevole del parere.

### Giunta comunale

| Input | Actual |
|---|---|
| numero/data assenti | “In attesa di adozione” |
| solo numero o solo data | “In attesa di adozione” |
| placeholder | “In attesa di adozione” |
| numero e data | afferma l'esistenza della deliberazione |

Il modello non contiene uno stato di adozione né una prova documentale. “In attesa di adozione” è un'affermazione di stato, non una neutra indicazione “atto non documentato nei dati disponibili”. Anche numero/data, da soli, non provano contenuto o adozione.

## 11. Actual export files

Sono stati generati usando i servizi di produzione e poi riaperti/analizzati:

| Export | Ispezione | Esito |
|---|---|---|
| [`Tabella15_ENTE A_2025.xlsx`](audit_wave3_independent/evidence/Tabella15_ENTE%20A_2025.xlsx) | ExcelJS, celle reali | ente/anno corretti; S615 2.000; S614 1.400; totale generale 3.400; nessun unresolved |
| [`Tabella15_ENTE A_2025.csv`](audit_wave3_independent/evidence/Tabella15_ENTE%20A_2025.csv) | righe reali | stessi importi; totale 3.400; nessun unresolved |
| [`Relazione_Tecnica_Fondo_2025.txt`](audit_wave3_independent/evidence/Relazione_Tecnica_Fondo_2025.txt) | testo reale | warning bozza ma totale 3.400 presentato come generale/certificato |
| [`Determina_Costituzione_Fondo_2025.txt`](audit_wave3_independent/evidence/Determina_Costituzione_Fondo_2025.txt) | testo reale | `DI COSTITUIRE` importo complessivo 3.400 |
| [`Prospetto_Contrattazione_2025.txt`](audit_wave3_independent/evidence/Prospetto_Contrattazione_2025.txt) | testo reale | totale disponibile 3.400 |
| [`Determina_Costituzione_Fondo_2025.pdf`](audit_wave3_independent/evidence/Determina_Costituzione_Fondo_2025.pdf) | file PDF reale, 9.206 byte, due pagine | leggibile, nessun clipping; replica le affermazioni problematiche del TXT |
| [`Tabella15_ROUNDING_2025.xlsx`](audit_wave3_independent/evidence/Tabella15_ROUNDING_2025.xlsx) | cella reale | 100,005 contro canonico 100,01 |
| [`Tabella15_ROUNDING_2025.csv`](audit_wave3_independent/evidence/Tabella15_ROUNDING_2025.csv) | riga reale | 100,00 contro canonico 100,01 |

QA visuale PDF:

- [`pagina 1`](audit_wave3_independent/evidence/Determina_Costituzione_Fondo_2025.page-1.png): testo leggibile, importi visibili, formula dispositiva problematica;
- [`pagina 2`](audit_wave3_independent/evidence/Determina_Costituzione_Fondo_2025.page-2.png): leggibile, nessuna sovrapposizione; pagina poco densa ma non difettosa.

L'estrazione testuale PDF presenta sostituzioni di alcuni glifi dovute all'encoding/estrattore; l'ispezione visuale mostra correttamente euro e accenti. Questo non è classificato come bug applicativo.

## 12. Multi-entity/year

Sequenza eseguita nello stesso processo:

| Caso | Ente output | Anno | Art. 60 | Canonical total | Verified total | Stato |
|---|---|---:|---:|---:|---:|---|
| ENTE A / 2025 | ENTE A | 2025 | 0 | `null` | 3.400,00 | `UNDETERMINED` |
| ENTE A / 2026 | ENTE A | 2026 | -127,44 | 51.272,56 | 51.272,56 | `UNDETERMINED` per altre precondizioni |
| ENTE B / 2026 | ENTE B | 2026 | -127,44 | 51.272,56 | 51.272,56 | `UNDETERMINED` per altre precondizioni |

Ente, anno, Art. 60, totali e metadata sono rimasti coerenti. Non è stata osservata contaminazione tra generazioni successive.

## 13. White-box analysis

Flusso ricostruito:

```text
calculateFundCompletely / buildCanonicalFundLedger
    → CanonicalFundResult
    → projectFundDocument
    → createDocumentViewModel
    → template TXT / PDF / XLSX / CSV
```

Punti principali:

- `fundEngine.ts:253-505`: costruisce e propaga `canonicalFund`; le formule normative Wave 2 restano intatte;
- `documentProjection.ts:155-165`: legge i totali canonici ma trasforma i `null` in subtotali verificati `effective*`;
- `documentProjection.ts:167-168`: deduce parere revisori e delibera GC dalla sola presenza di numero/data;
- `documentPresenter.ts:251-266,310`: usa `projection.effectiveTotal` come totale del fondo e della determina;
- `determinaTemplateV2.ts:46-54`: converte numero/data revisori in parere favorevole e costituisce l'importo effective;
- `pdfDeterminaService.ts:104-117`: replica la stessa logica;
- `relazioneTecnicaTemplate.ts:32-54`: avverte che è un subtotale, ma poi lo definisce totale generale/certificato;
- `documentFactory.ts:32`: usa il totale effective come “Totale Disponibile”;
- `tabella15Mapper.ts:67-72`: esclude correttamente figurative e non-valid;
- `tabella15Mapper.ts:81,95-97`: introduce fallback S615/S699/V699 senza review state;
- `tabella15Mapper.ts:150`: somma valori raw, non il totale canonico arrotondato.

Formule economiche concorrenti residue:

1. `documentProjection.ts` e `documentPresenter.ts` hanno fallback ai vecchi `result.totals`/`summary` quando `canonicalFund` manca;
2. `tabella15Mapper.ts` mantiene un percorso legacy quando `canonicalFund` è assente;
3. i totali documentali `effective*` costituiscono una seconda semantica rispetto ai totali canonici nullable;
4. il mapper Tabella 15 ricalcola il totale dalle righe raw invece di adottare il totale canonico con identica policy di arrotondamento.

I fallback possono servire mock legacy, ma non sono protetti da un esplicito stato “legacy/non canonico” e mantengono il rischio di divergenza.

## 14. Independent test cases

Script temporaneo: [`audit_wave3_independent/independent_wave3_review.test.ts`](audit_wave3_independent/independent_wave3_review.test.ts).

Esito: 1 file, 6 test, 6 pass.

| Caso indipendente | Esito |
|---|---|
| Astra A/2025 completo, confronto di tutti i layer | riprodotto; blocker documentale confermato |
| multiple deductions | 100 - 10 - 20 = 70, PASS |
| negative/invalid deduction | `INVALID`, total `null`, unresolved separato, PASS |
| zero canonico | totale 0, nessuna riga fittizia, PASS |
| recovery `UNDETERMINED` / total `null` | preservato nel canonico, perso come totale finale nei documenti |
| rounding 100.005 | divergenza canonico/XLS/CSV confermata |
| 2025/2026 Art. 60 | segno e annualità corretti |
| `economicEffect=false` | escluso dalla Tabella 15, PASS |
| revisori assenti/parziali/placeholder/completi | false attestations confermate |
| GC assente/parziale/placeholder/completa | stato non provabile confermato |
| multi-year e multi-ente | nessuna contaminazione |
| file XLSX/CSV/TXT/PDF reali | generati, riaperti e ispezionati |

Non sono stati modificati test permanenti del prodotto né golden.

## 15. Full technical gates

| Gate | Esito osservato |
|---|---|
| `git diff --check` | PASS; soli warning LF/CRLF |
| `npx tsc --noEmit` | PASS |
| `npm test -- --run` | PASS: 98 file, 992 test |
| suite prodotto al netto dell'harness temporaneo indipendente | 97 file, 986 test, coincide con l'atteso dichiarato |
| `npm run build` | PASS: 1.865 moduli, build Vite completato; warning chunk >500 kB e `eval` in `pdfjs-dist` |
| `npx vite-node scripts/run_regression_tests.ts` | PASS 8/8 |
| `npx vite-node scripts/run_wave2_oracle.ts` | PASS 14/14 |

Il primo tentativo di build nel sandbox è stato bloccato dall'accesso filesystem di esbuild alla configurazione Vite. La riesecuzione autorizzata fuori sandbox è passata; non è un difetto applicativo.

## 16. Findings

### W3-DOC-001 — BLOCKER — subtotale verificato promosso a fondo finale

- **File/percorso:** `src/domain/documentProjection.ts:163-165`; `src/presenters/documentPresenter.ts:251-266,310`; `src/services/templates/determinaTemplateV2.ts:54`; `src/services/documents/pdfDeterminaService.ts:117`; `src/services/templates/relazioneTecnicaTemplate.ts:39-54`; `src/services/documents/documentFactory.ts:32`; `src/logic/calculation/tabella15Mapper.ts:150`.
- **Input:** Astra A/2025: +1.400 0,14%, +2.000 straordinario, Art. 60 legacy 127,44 non applicabile nel 2025, recuperi legacy 2.800 non istruiti.
- **Expected:** verified subtotal 3.400; final constituted/available/certified total `UNDETERMINED`.
- **Actual:** determina costituisce 3.400 come importo complessivo; relazione lo chiama totale generale/certificato; prospetto lo chiama disponibile; Tabella 15 lo chiama totale generale.
- **Evidenza:** file TXT/PDF/XLSX/CSV reali e `independent_probe_results.json`.
- **Impatto sindacale/amministrativo:** possibile adozione, certificazione o negoziazione su un fondo incompleto presentato come definitivo.
- **Causa tecnica:** fallback `total ?? verifiedTotal` materializzato come `effectiveTotal` e riusato in campi/formule con semantica finale.
- **Correzione raccomandata:** mantenere nullable il totale finale; esporre il verified subtotal in un campo separato e impedirne l'uso nelle formule dispositive/certificate/disponibili.
- **Acceptance criteria:** con Astra A/2025 nessun output deve dichiarare fondo costituito, totale generale/certificato o totale disponibile pari a 3.400; deve mostrare “totale complessivo non determinabile” e, separatamente, “subtotale verificato 3.400”.

### W3-T15-001 — HIGH — fallback RGS ciechi e componente variable classificata S615

- **File/percorso:** `src/logic/calculation/tabella15Mapper.ts:81,95-97`.
- **Input:** `UNMAPPED_STABLE=11`, `UNMAPPED_VARIABLE=12`, `LEGACY_FAD_RESOURCE:UNKNOWN_FIELD=13`.
- **Expected:** voce non classificabile separata con warning/review, senza codice ministeriale inventato.
- **Actual:** tutte e tre le voci finiscono in S615; la voce variable riceve un codice stable.
- **Evidenza:** sezione `mapperFallbacks.unmapped` in `independent_probe_results.json`.
- **Impatto sindacale/amministrativo:** trasmissione SICO/RGS materialmente errata pur in presenza di quadratura contabile.
- **Causa tecnica:** default iniziale S615 e fallback residuali privi di stato di review.
- **Correzione raccomandata:** mapping exhaustivo versionato per annualità; su unknown, nessun codice e warning bloccante/review-required.
- **Acceptance criteria:** ogni ID non mappato produce `RGS_MAPPING_UNRESOLVED`, non entra in una colonna S/V e impedisce l'export ministeriale definitivo.

### W3-T15-002 — HIGH — divergenza di arrotondamento ledger/XLS/CSV

- **File/percorso:** `src/logic/calculation/tabella15Mapper.ts:150`; servizio CSV/XLS downstream.
- **Input:** una entry valida di 100.005.
- **Expected:** policy unica a centesimi; canonico, mapper, XLS e CSV tutti 100,01.
- **Actual:** canonico 100,01; DTO/XLS 100,005; CSV 100,00.
- **Evidenza:** `Tabella15_ROUNDING_2025.xlsx`, `Tabella15_ROUNDING_2025.csv`, JSON probe.
- **Impatto sindacale/amministrativo:** differenze di un centesimo tra documenti ufficiali e impossibilità di riconciliazione esatta.
- **Causa tecnica:** il mapper somma valori raw e il CSV applica `toFixed(2)` indipendentemente dal ledger.
- **Correzione raccomandata:** usare la stessa funzione di arrotondamento monetario canonica prima della somma/esportazione.
- **Acceptance criteria:** un set di casi x.xx5 produce identico importo a due decimali in CanonicalFundResult, DTO, XLSX e CSV.

### W3-ATT-001 — HIGH — numero/data revisori diventano parere favorevole; assenza diventa trasmissione

- **File/percorso:** `src/domain/types.ts:251-257`; `src/domain/documentProjection.ts:167`; `src/services/templates/determinaTemplateV2.ts:46-48`; `src/services/documents/pdfDeterminaService.ts:104-105`.
- **Input:** (a) numero/data 12 e 15/03/2026 senza esito; (b) campi assenti/parziali/placeholder senza prova di trasmissione.
- **Expected:** (a) registrare solo gli estremi, esito non documentato; (b) nessuna affermazione di trasmissione avvenuta.
- **Actual:** (a) “parere favorevole”; (b) “il presente provvedimento viene trasmesso”.
- **Evidenza:** matrice `attestations.cases` nel JSON probe e determina reale.
- **Impatto sindacale/amministrativo:** falsa attestazione dell'organo di revisione e del completamento procedurale.
- **Causa tecnica:** modello privo di outcome/transmission status e booleano derivato dalla sola completezza degli estremi.
- **Correzione raccomandata:** modellare esito e stato/prova di trasmissione separatamente; testi neutrali per dati assenti.
- **Acceptance criteria:** numero/data non implicano esito; favorevole/non favorevole/assente sono distinti; la trasmissione è dichiarata solo con dato esplicito.

### W3-ATT-002 — HIGH — stato della delibera GC inferito da estremi incompleti/assenti

- **File/percorso:** `src/domain/types.ts:251-257`; `src/domain/documentProjection.ts:168`; `src/services/templates/determinaTemplateV2.ts:29-31`; `src/services/documents/pdfDeterminaService.ts:82-83`.
- **Input:** GC assente, parziale, placeholder o con soli numero/data.
- **Expected:** “atto non documentato nei dati disponibili”, salvo esplicito stato di adozione/prova.
- **Actual:** assenza/parziale → “in attesa di adozione”; numero+data → delibera dichiarata presente.
- **Evidenza:** matrice `attestations.cases`.
- **Impatto sindacale/amministrativo:** rappresentazione non provata della sequenza procedimentale.
- **Causa tecnica:** assenza di un campo di stato/adozione e inferenza booleana dagli estremi.
- **Correzione raccomandata:** introdurre stato documentale esplicito e formulazioni neutrali di default.
- **Acceptance criteria:** nessuna affermazione di adozione o attesa senza stato esplicito; placeholder trattati come dati assenti.

### W3-RGS-001 — HIGH — schema annuale ministeriale non validato

- **File/percorso:** `src/logic/calculation/tabella15Mapper.ts` e matrice mapping Wave 3.
- **Input:** codici S600, S612-S616, V620-V624, S699/V699 per output 2025/2026.
- **Expected:** corrispondenza dimostrata con anagrafica/schema ufficiale SICO dell'annualità applicabile.
- **Actual:** nessuna fonte ufficiale annuale allegata o reperita che validi tali associazioni; `RGS_SCHEMA_UNVERIFIED`.
- **Evidenza:** ricerca su portali ufficiali RGS/MEF/SICO; le fonti disponibili confermano solo struttura/scopo generale.
- **Impatto sindacale/amministrativo:** un export aritmeticamente coerente può essere ministerialmente errato.
- **Causa tecnica:** codici hard-coded senza versione schema e senza riferimento ufficiale verificabile.
- **Correzione raccomandata:** acquisire anagrafica/circolare/XSD ufficiale per l'annualità, versionare la mappa e documentare ogni voce.
- **Acceptance criteria:** ogni mapping ha fonte ufficiale, anno schema, descrizione corrispondente e test di compatibilità; fino ad allora export marcato non validato.

### W3-WB-001 — MEDIUM — percorsi legacy concorrenti al Canonical Fund Ledger

- **File/percorso:** `src/domain/documentProjection.ts:155-161`; `src/presenters/documentPresenter.ts:135-222,251-252`; percorso fallback in `src/logic/calculation/tabella15Mapper.ts`.
- **Input:** result sintetico/legacy privo di `canonicalFund`.
- **Expected:** documenti ufficiali generati solo da CanonicalFundResult oppure esplicitamente bloccati/legacy.
- **Actual:** i documenti possono ricostruire totali e voci da `result.totals`, `summary` e sezioni legacy.
- **Evidenza:** analisi white-box dei rami fallback.
- **Impatto sindacale/amministrativo:** future chiamate parziali/mock adattati possono riattivare formule non canoniche e divergere dagli output principali.
- **Causa tecnica:** compatibilità retroattiva non isolata dalla pipeline documentale ufficiale.
- **Correzione raccomandata:** rendere `canonicalFund` precondizione dell'export ufficiale o marcare/bloccare esplicitamente il percorso legacy.
- **Acceptance criteria:** nessun export definitivo senza `canonicalFund`; test che un result privo di ledger fallisca in modo controllato.

## 17. DOC-01 status

`PARTIALLY_FIXED`

La Tabella 15 ora legge il ledger canonico, esclude le figurative e riconcilia correttamente i casi standard, incluso Art. 60. Non è `VERIFIED_FIXED` perché:

- unresolved esclusi senza warning ma il totale è presentato come generale;
- fallback S615/S699/V699 sono pericolosi;
- una voce variable unknown può diventare S615;
- arrotondamento divergente tra canonico, XLS e CSV;
- schema ministeriale annuale non verificato.

## 18. DOC-02 status

`PARTIALLY_FIXED`

Relazione, determina e prospetto usano in gran parte la stessa proiezione e riportano correttamente Art. 60. Non è `VERIFIED_FIXED` perché:

- il subtotale verificato viene presentato come totale finale/costituito/disponibile;
- revisori e GC sono oggetto di attestazioni non provate;
- l'esito del parere e lo stato di trasmissione/adozione non sono modellati;
- i fallback legacy restano disponibili.

## 19. Remaining risks

1. Uso amministrativo o sindacale di documenti draft che contengono formule dispositive definitive.
2. Invio SICO/RGS con codici non validati per l'annualità e fallback silenziosi.
3. Divergenze centesimali tra ledger, XLSX e CSV.
4. Falsa attestazione di parere favorevole, trasmissione ai revisori o stato GC.
5. Tabella 15 priva di unresolved/review state anche quando il totale canonico è `null`.
6. Percorsi legacy concorrenti che possono riemergere con chiamanti parziali.
7. Warning di build su bundle molto grande e `eval` in dipendenza PDF: non bloccanti per Wave 3, ma da monitorare separatamente.

## 20. Final verdict

### ARITHMETIC_DOCUMENT_CONSISTENCY

`PARTIALLY_FIXED`

Il ledger canonico e i casi standard sono coerenti; Art. 60 è trattato correttamente. Restano un blocker semantico sul totale finale, una divergenza di arrotondamento e l'assenza di warning Tabella 15 per unresolved.

### RGS_SCHEMA_VERIFICATION

`RGS_SCHEMA_UNVERIFIED`

La correttezza ministeriale dei codici 2025/2026 non è dimostrata da una fonte annuale ufficiale.

### VERDETTO

`WAVE3_REQUIRES_FIXES`

La Wave 3 non è approvabile per consolidamento finché W3-DOC-001 non è risolto e verificato su tutti gli export reali. Prima del rilascio devono inoltre essere eliminati i fallback RGS ciechi, unificato l'arrotondamento, modellati gli stati documentali di revisori/GC e completata o esplicitamente separata la validazione dello schema ministeriale.
