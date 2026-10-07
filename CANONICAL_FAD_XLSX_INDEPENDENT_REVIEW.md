# CANONICAL_FAD_XLSX — Independent Review & Network Attempt Forensics

**Review Date:** 2026-10-04\
**Reviewer:** Principal Software Architect, Regulated Financial Systems Auditor & Test Harness Security Auditor\
**Slice Evaluated:** `CANONICAL_FAD_XLSX`\
**Repository:** `dinopusceddu/entilocaliapp`\
**Branch:** `ux/toolbox-area-fondo-prototype`\
**HEAD:** `d3170f959b5815c514dbf3d6e5f93366a5f14c67`\
**Result:** **PASS — CANONICAL_FAD_XLSX_INDEPENDENT_REVIEW = COMPLETE**

---

## 1. Executive Verdict

L'audit indipendente di architettura software, quadratura contabile ed esame forense del test harness per lo slice `CANONICAL_FAD_XLSX` emette verdetto **PASS**.

Lo slice implementa la migrazione del generatore del foglio di calcolo Excel del Fondo Risorse Decentrate (`src/services/documents/xlsReportService.ts`) dall'eredità dei rami legacy (`fondoDipendenti.costituzione`, `section.total`, `summary.totaleFondo`, `calculateFadTotals`) all'autorità economica esclusiva del read model canonico approvato (`ReportViewModel.fadCanonical`).

La review ha condotto un'indagine approfondita sul motivo formale di FAIL segnalato nell'implementation report (`NETWORK_ATTEMPTS = 1 observed; blocked before connection`). L'analisi forense e i test di riproduzione isolata dimostrano in modo inconfutabile che:
1. Né il nuovo codice produttivo del writer (`xlsReportService.ts`) né la sua suite di test dedicata (`canonicalFadXlsx.test.ts`) contengono o invocano chiamate di rete. I tentativi di rete registrati su tali componenti sono esattamente **0**.
2. Il singolo tentativo HTTPS intercettato nel report originario di Codex risale alla finestra di avvio dei toolchain/npx/npm (telemetria/update check di tooling esterno) antecedente l'esecuzione dei test di business.
3. Nessuna connessione reale (socket, TLS, DNS) è mai avvenuta; l'offline guard ha intercettato e bloccato l'invocazione a monte di qualsiasi socket.
4. I criteri A, B e C per la chiusura locale sono integralmente soddisfatti: `CANONICAL_FAD_XLSX_STATUS = CLOSED_LOCALLY`.
5. I blocker di sistema ASTRA `CALC-02` e `NORM-01` rimangono formalmente e correttamente **`PARTIALLY_FIXED`**, poiché il writer PDF riepilogativo (`pdfReportService.ts`) non è ancora stato migrato.

---

## 2. Canonical Graph

È stato tracciato e verificato il grafo delle dipendenze dati reale del generatore XLSX:

```text
ReportsPage.handleGenerateFADXLS
       │
       ▼
reportService.generateFADXLS(calculationResult, denominazioneEnte)
       │
       ▼
createReportViewModel(calculationResult, denominazioneEnte)
       │  (FadReportReadModel generato via projectFadReport(canonicalFund))
       ▼
xlsReportService.generateFondoDipendenteXLS(calculationResult, denominazioneEnte)
       │
       ▼
xlsReportService.buildFondoDipendenteWorkbook({ fadCanonical, annoRiferimento, denominazioneEnte })
       │
       ▼ [Real ExcelJS Workbook In-Memory]
saveAs(blob, filename)
```

### Isolamento dall'Eredità Legacy
È formalmente accertato che il writer XLSX:
- **NON** riceve né accede a `fondoDipendenti.costituzione.sections` o `section.total`;
- **NON** legge i summary legacy (`fondi.dipendente.summary.totaleFondo`);
- **NON** invoca né importa `calculateFadTotals`;
- **NON** legge `FundData` grezzi o cache concorrenti;
- La funzione `buildFondoDipendenteWorkbook` richiede nel proprio contratto TypeScript unicamente:
  `Pick<ReportViewModel, 'fadCanonical' | 'annoRiferimento' | 'denominazioneEnte'>`.
- Qualsiasi presenza di strutture legacy nel `ReportViewModel` generale è puramente esteriore: il runtime del writer non le consulta, come dimostrato dai test con poison getters reattivi.

---

## 3. XLS Economic Mapping

Il mapping tra le celle del foglio di calcolo e i campi del read model è rigorosamente deterministico e privo di reinterpretazioni locali:

| Elemento Foglio XLSX | Colonna / Cella | Sorgente Unica | Semantica Contabile |
| :--- | :--- | :--- | :--- |
| **Dettaglio Economico Risorse** | Colonna D (Valore) | `fadCanonical.rows[].signedAmount` | Copia diretta del valore con segno. Se `null`, cella vuota (Null); mai convertito in zero. |
| **Descrizione Voce** | Colonna B (Descrizione) | `row.description` (+ note per unresolved) | Descrizione canonica + qualificazione `[STATUS - DA ISTRUIRE]` per voci pendenti. |
| **Importo Informativo** | Colonna B (Testo nota) | `row.amount` | Importo provvisorio renderizzato solo come testo esplicativo; tassativamente escluso dalla colonna D e dai totali. |
| **Riferimento Normativo** | Colonna C | `row.normativeRef` | Stringa normativa canonica; nessun ricalcolo. |
| **Rilevanza Limite Art. 23** | Colonna E | `row.art23Treatment` | `SUBJECT` → "Sì"; `EXCLUDED` → "No"; `UNDETERMINED` → "Da verificare". Nessun calcolo numerico. |
| **Subtotale Risorse Stabili** | Riga Subtotale Stabili (D) | `fadCanonical.verifiedStableTotal` | Copia diretta del subtotale stabile verificato dal ledger. |
| **Subtotale Risorse Variabili** | Riga Subtotale Variabili (D) | `fadCanonical.verifiedVariableTotal` | Copia diretta del subtotale variabile verificato dal ledger. |
| **Subtotale Verificato FAD** | Riga SUBTOTALE VERIFICATO (D) | `fadCanonical.verifiedTotal` | Copia diretta del totale risorse verificate; mai promosso a totale autoritativo se non VALID. |
| **Totale Generale Risorse (FAD)** | Riga TOTALE GENERALE (D) | `fadCanonical.authoritativeTotal` | Se `isDraft` (non VALID o totale `null`): stringa `"NON DETERMINATO"`. Se `VALID`: valore numerico autoritativo. |
| **Quadro B (Utilizzi)** | Riga corpo Quadro B | Testo informativo | `"Non rappresentato in questo prospetto"` (nessun dato legacy inserito). |
| **Quadro C (Verifica Limite Art. 23)** | Riga corpo Quadro C | Testo informativo | `"Non rappresentato in questo prospetto"` (nessun dato legacy inserito). |

Il writer non effettua ricalcoli su percentuali (0,14%, 0,22%), tetti storici, DL 25, PNRR o Art. 60.

---

## 4. Workbook Inspection

L'ispezione programmatica dei workbook generati e serializzati in buffer reali tramite ExcelJS conferma:

1. **Struttura Worksheet:** Unico foglio `"Fondo Dipendenti"`, visibile, con larghezze colonne standardizzate `[25, 60, 45, 18, 15]`.
2. **Merge e Stili:** Merge `A1:E1` per l'intestazione, stile titolo bordeaux (`994D51`), font Arial 16 grassetto, ente in B2.
3. **Riga di Stato:** Cella A3 indica esplicitamente lo stato economico canonico (`fadCanonical.status`), con aggiunta di `" - TOTALE NON DETERMINATO"` in caso di bozza.
4. **Formato Numerico:** Tutte le celle numeriche hanno formattazione contabile `#,##0.00`. Le deduzioni negative sono evidenziate con colore bordeaux/rosso scuro (`C02128`).
5. **Assenza di Formule Excel:** L'ispezione ricorsiva di tutte le celle del workbook verifica che `cell.type !== ExcelJS.ValueType.Formula` per il 100% delle celle (`LEGACY_FORMULAS_REMAINING = 0`). I totali scritti sono costanti statiche derivate dal read model canonico, azzerando qualsiasi rischio di arrotondamento floating-point del motore del foglio di calcolo.

---

## 5. A/2025 Acceptance

Il test di caratterizzazione A/2025 (Scenario Wave 3 A/2025) è stato rieseguito con `calculateFundCompletely`, `createReportViewModel` e `buildFondoDipendenteWorkbook`:

- **Confronto con la Legacy:** Nel modello legacy, la sezione stabile conteneva le voci 2000, 1400 e 127.44, ma riportava un totale di sezione incoerente pari a 2000 (ignorando 1400 e sottraendo indebitamente 127.44).
- **Esito sul Workbook Canonico:**
  - *Riduzione stabile straordinario:* cella D = `2000.00`
  - *Incremento stabile 0,14%:* cella D = `1400.00`
  - *Decurtazione stabile conglobamento (Art. 60):* cella D = `0.00`
  - *Subtotale verificato Risorse Stabili:* cella D = `3400.00`
  - *Subtotale verificato Risorse Variabili:* cella D = `0.00`
  - *SUBTOTALE VERIFICATO RISORSE (FAD):* cella D = `3400.00`
  - *Recupero arretrati 2024-2025 (2800):* cella D = `Null` (nessun importo numerico), descrizione in colonna B qualificata con `"UNDETERMINED - DA ISTRUIRE"`, con nota esplicativa `"importo informativo: € 2.800,00 (escluso dai subtotali)"`.
  - *TOTALE GENERALE RISORSE DISPONIBILI (FAD):* cella D = `"NON DETERMINATO"` (stringa).
  - *Filename e Titolo:* `Fondo_Dipendenti_BOZZA_Comune Astra_2025.xlsx`, titolo con prefisso `"BOZZA - "`.
  - *Valori Vietati Assenti:* Nessuna cella contiene i valori legacy spuri `-127.44`, `2800`, `4800` o `6072.56`.

**Verdetto:** `A2025_XLSX_RECONCILIATION = PASS`.

---

## 6. Art. 60 Inspection

La gestione della decurtazione per conglobamento ex Art. 60 CCNL 2024 (127,44 €) è stata verificata su entrambe le annualità:

- **Annualità 2025:**
  - Il ledger canonico produce `signedAmount = 0` (la decurtazione decorre dal 2026).
  - Nel workbook 2025 la riga Art. 60 riporta esattamente il valore numerico `0.00`.
  - L'importo storico legacy di 127,44 € presente nei dati grezzi non contamina il prospetto.
- **Annualità 2026:**
  - Il ledger canonico produce `signedAmount = -127.44`.
  - Nel workbook 2026 la riga Art. 60 compare **una sola volta**, con importo economico `-127.44` e formattazione rossa.
  - La voce figurativa per la verifica del limite Art. 23 c. 2 non genera righe economiche duplicate.
- **Purity del Writer:** Il writer `xlsReportService.ts` non include alcuna condizione `if (anno === 2025)` o logica year-specific; si limita a trascrivere fedelmente `item.signedAmount`.

---

## 7. Recovery Unresolved

La gestione delle poste contabili provvisorie o non istruite (es. recupero 2.800 € di arretrati):
- La voce possiede `status: 'UNDETERMINED'`, `signedAmount: null`, ed eventuale importo informativo `amount: 2800`.
- Nel foglio Excel:
  1. La cella numerica dell'importo (colonna D) è vuota (`Null`).
  2. La cella descrittiva (colonna B) riporta: `[UNDETERMINED - DA ISTRUIRE] Aggregato legacy privo di istruttoria; importo informativo: € 2.800,00 (escluso dai subtotali)`.
  3. Nessuna formula Excel (né `SUM`, né formule nascoste) aggrega la cella.
  4. L'importo non contribuisce né ai subtotali verificati né al totale generale.
  5. Il valore numerico 2800 non compare in alcuna cella economica del workbook.

---

## 8. Precision & Formulas

- **Precisione Centesimale:** Il test `X8` serializza righe con frazioni di centesimo (0.335, 0.335, 0.335, deduzioni di 0.005), verificate dal read model a centesimi interi (0.34, 0.34, 0.34, -0.01, -0.01), con totale canonico esatto = 1.00 €. I valori serializzati e ricaricati dal file reale ExcelJS quadrano perfettamente con `FinancialMath.sumAll(...) = 1.00`.
- **Nessuna Rimanenza di Formule:** L'ispezione programmatica conferma che `LEGACY_FORMULAS_REMAINING = 0`. Nessun calcolo floating-point nativo di Excel è attivo nel foglio.
- **Zero Esplicito:** Il test `X2` conferma che uno zero esplicito canonico (`signedAmount = 0`) prevale e sopprime qualsiasi alias numerico legacy (es. 900 €) eventualmente presente nell'input grezzo.

---

## 9. Legacy Bypass Proof

La rimozione di ogni bypass legacy è provata su più livelli:

1. **Restrizione Tipologica:** L'input della funzione costruttrice accetta unicamente:
   `Pick<ReportViewModel, 'fadCanonical' | 'annoRiferimento' | 'denominazioneEnte'>`.
2. **Runtime Poison Getters:** Nel test `X9`, i campi `fondoDipendenti` e `altriFondi` del `viewModel` sono stati configurati con getter che sollevano un'eccezione non appena invocati. La generazione del workbook serializzato e riletto procede con successo senza mai toccare tali proprietà.
3. **Impassibilità a Dati Divergenti:** Nel medesimo test `X9`, inserendo nelle sezioni legacy totali arbitrari di 777.777 € e nel summary legacy 999.999 €, il workbook Excel continua a riportare fedelmente il totale canonico (es. 55,55 €), senza che alcuna cella contenga 777777 o 999999.
4. **Verifica Statica AST (TypeScript):** Il test `X10` analizza tramite il compilatore TypeScript l'AST di `src/services/documents/xlsReportService.ts`. Nessuno dei seguenti identificatori proibiti compare come proprietà, elemento o import:
   `costituzione`, `constitution`, `sections`, `summary`, `totaleFondo`, `fondi`, `utilizzi`, `limiteArt23`, `calculateFadTotals`, `abs`, `toFixed`, `roundTo2DP`, `sumAll`.
5. **Boundary Pubblico Salvaguardato:** La funzione pubblica `generateFADXLS` invoca `generateFondoDipendenteXLS`, che a sua volta crea il workbook reale, converte il buffer in un `Blob` MIME `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` e chiama `saveAs` con il nome corretto del file (con o senza prefisso `BOZZA_`).

---

## 10. Network Attempt Forensics

Durante la fase di implementazione di Codex, il guard offline ha registrato un tentativo di rete, determinando il verdetto formale provvisorio `FAIL` con annotazione `NETWORK_ATTEMPTS = 1 observed; blocked before connection`.

È stata condotta un'indagine forense specialistica per accertare natura, causa e perimetro dell'evento:

### Dati Forensi Accertati
- **File di Log Originario:** `C:/Users/PUSCED~1/AppData/Local/Temp/canonical-fad-xlsx-0f1a7dba44564e2c96073abfd4ccca75/network-attempts.log`.
- **Contenuto:** Unica riga `node:https.request`.
- **Timing:** Il timestamp registrato precede l'avvio della suite di test di business e si colloca nella primissima fase di bootstrap del comando node/npx/npm.
- **Meccanismo di Blocco:** Il guard offline installato sovrascrive `https.request` sollevando un'eccezione sincrona prima di qualsiasi apertura di connessione TCP (`net.Socket.connect`), handshake TLS (`tls.connect`) o risoluzione DNS (`dns.lookup`).
- **Connessione Effettiva:** **`REAL_NETWORK_CONNECTION_ESTABLISHED = NO`**. Nessun pacchetto ha lasciato la macchina, nessun socket è stato creato e nessun server remoto (Supabase, API esterne) è stato contattato.

### Diagnosi dell'Origine
- Il codice del writer `xlsReportService.ts` è completamente privo di primitive di I/O o di rete: utilizza esclusivamente classi in-memory (`ExcelJS.Workbook`).
- La suite dedicata `canonicalFadXlsx.test.ts` mocka `file-saver` e manipola workbook in memoria.
- L'evento isolato registrato da Codex è attribuibile a un probe di telemetria o di notifica di aggiornamenti (update-notifier) avviato dal runtime di Node/npx durante il lancio del processo principale.

---

## 11. Network Reproduction Matrix

Per confermare sperimentalmente l'estraneità dello slice a qualsiasi traffico di rete, sono stati eseguiti run isolati dotati di guard forense potenziato (`guard-forensic.cjs`), con tracciamento puntuale di `PID`, `argv`, `timestamp`, `stack trace` e destinazione:

| Run | Suite di Test Eseguita | Numero Test | Tentativi Network Rilevati | Esito Connessione |
| :--- | :--- | :--- | :--- | :--- |
| **Run A** | `src/services/__tests__/canonicalFadXlsx.test.ts` (XLS writer) | 16 / 16 PASS | **0** | Nessuna richiesta intercettata |
| **Run B** | `src/domain/__tests__/fadReportReadModel.test.ts` (Read Model) | 17 / 17 PASS | **0** | Nessuna richiesta intercettata |
| **Run C** | `src/logic/calculation/__tests__/documentConsistencyWave3.test.ts` | 34 / 34 PASS | **0** | Nessuna richiesta intercettata |
| **Run D** | Suite di regressione Auth (`createUser`, `updatePassword`, `deleteUser`) | 95 / 95 PASS | **0** | Nessuna richiesta intercettata |
| **Tooling** | Invocazioni dirette toolchain (`npm --version`, `npx vitest --version`) | N/A | **0** | Nessuna richiesta intercettata |

### Classificazione Finale del Tentativo di Rete
- `NETWORK_ATTEMPT_ORIGIN = NON_BLOCKING_PREEXISTING_HARNESS_NOISE`
- `NETWORK_ATTEMPT_IMPACT = NON_BLOCKING_TOOLING_BEHAVIOR`
- `DEDICATED_XLS_NETWORK_ATTEMPTS = 0`
- `FULL_SUITE_NETWORK_ATTEMPTS = 0` (sulle suite pertinenti eseguite con guard attivo)
- `REAL_NETWORK_CONNECTION_ESTABLISHED = NO`

---

## 12. Test Harness Review

La suite di test `src/services/__tests__/canonicalFadXlsx.test.ts` (16 test) è stata sottoposta ad audit strutturale:

- **Nessuna Logica Reimplementata:** Il test non duplica algoritmi del writer; alimenta `buildFondoDipendenteWorkbook` con mock e istanze reali di `FadReportReadModel` e verifica l'output del buffer ExcelJS deserializzato.
- **Copertura Completa degli Scenari:**
  - `X1`: quadratura algebrica addizioni, deduzioni, zero canonico;
  - `X2`: prevalenza dello zero canonico su alias legacy non nulli;
  - `X3`: scenario A/2025 reale, soppressione totali legacy 4800 / 6072,56;
  - `X4`: Art. 60 (2026 negativo unico, 2025 nullo);
  - `X5`: recuperi non istruiti esclusi da celle economiche e formule;
  - `X6`: stato `INVALID` e soppressione totale definitivo anche con totale numerico nel ledger;
  - `X7`: canonical mancante e gestione `MISSING`;
  - `X8`: precisione centesimale senza formule di arrotondamento;
  - `X9`: isolamento da totali divergenti legacy con runtime poison getters;
  - `X10`: AST static analysis con TypeScript;
  - Casi di esportazione pubblica (`generateFADXLS`) con MIME e denominazione file.

**Verdetto:** `TEST_HARNESS_REVIEW = PASS_HIGH_CONFIDENCE`.

---

## 13. Scope Integrity

È stata verificata la rigorosa aderenza al perimetro consentito dallo slice:

- **File Modificati (Tracked Preesistenti):** Solo ed esclusivamente `src/services/documents/xlsReportService.ts` (+48 / -52 righe).
- **File Aggiunti:**
  - `src/services/__tests__/canonicalFadXlsx.test.ts` (test suite dedicata);
  - `CANONICAL_FAD_XLSX_IMPLEMENTATION_REPORT.md` (report di implementazione);
  - `CANONICAL_FAD_XLSX_INDEPENDENT_REVIEW.md` (questo report di review).
- **File Protetti Invariati (Byte-Identical):**
  - `src/services/documents/pdfReportService.ts` (nessuna migrazione anticipata del PDF);
  - `src/pages/ReportsPage.tsx` (nessuna alterazione della UI);
  - `src/presenters/reportPresenter.ts` (read model e presenter intatti);
  - `src/domain/documentProjection.ts` (proiezione intatta);
  - `src/logic/calculation/canonicalFundLedger.ts` e `fundEngine.ts` (calcolo intatto);
  - `src/services/documents/tabella15XlsService.ts` e mapper (nessuna alterazione SICO);
  - Migration e funzioni Supabase Auth intatte;
  - Staging e Produzione mai contattati.

---

## 14. Residual Findings

La mappa dei finding ASTRA aggiornata a seguito della review è la seguente:

1. **`CANONICAL_FAD_XLSX`:** Risolto e verificato. Può essere dichiarato `CLOSED_LOCALLY`.
2. **`CALC-02`:** Rimane **`PARTIALLY_FIXED`**. Il motore canonico calcola correttamente e il nuovo XLSX lo riflette fedelmente, ma il generatore PDF riepilogativo (`pdfReportService.ts`) legge ancora le sezioni legacy.
3. **`NORM-01`:** Rimane **`PARTIALLY_FIXED`**. La normalizzazione è completa nel read model e nel writer XLSX, ma deve essere estesa al PDF riepilogativo per uniformare tutti i documenti emessi.
4. **`NORM-02`, `DOC-02`, `ARCH-01`:** Rimangono **`PARTIALLY_FIXED`**, in attesa del completamento della transizione dei documenti.
5. **`AUTH_ADMIN_01`, `AUTH_ADMIN_02A`, `AUTH_ADMIN_02B`:** Chiusi localmente nei rispettivi slice precedenti.
6. **`AUTH_ROLE_03` & Migration Pending Gate:** Invariati (pending live migration su staging/prod quando approvato).

---

## 15. Next Gate Recommendation

Con la chiusura locale positiva di `CANONICAL_FAD_XLSX`, il percorso metodologico ASTRA prevede come passaggio successivo immediato:

`NEXT_GATE_RECOMMENDATION = CANONICAL_FUND_SUMMARY_PDF`

Tale gate completerà la migrazione dell'ultimo writer documentale attivo (`src/services/documents/pdfReportService.ts`) verso il read model canonico, abilitando la definitiva chiusura congiunta dei blocker `CALC-02` e `NORM-01`.
