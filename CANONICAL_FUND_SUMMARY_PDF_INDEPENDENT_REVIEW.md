# CANONICAL_FUND_SUMMARY_PDF — Independent Review
## + Final Blocker Closure Audit for CALC-02 / NORM-01

**Review Date:** 2026-10-04\
**Reviewer:** Principal Software Architect, Regulated Financial Systems Auditor & Independent Reviewer\
**Slice Evaluated:** `CANONICAL_FUND_SUMMARY_PDF`\
**Repository:** `dinopusceddu/entilocaliapp`\
**Branch:** `ux/toolbox-area-fondo-prototype`\
**HEAD:** `d3170f959b5815c514dbf3d6e5f93366a5f14c67`\
**Result:** **PASS — CANONICAL_FUND_SUMMARY_PDF_INDEPENDENT_REVIEW = COMPLETE**

---

## 1. Executive Verdict

L'audit indipendente di architettura software, quadratura contabile e verifica di chiusura dei blocker ASTRA emette verdetto **PASS** per lo slice `CANONICAL_FUND_SUMMARY_PDF`.

### Valutazione Sintetica dei Finding
1. **`CANONICAL_FUND_SUMMARY_PDF`:** **`CLOSED_LOCALLY`**.\
   Il generatore del PDF riepilogativo generale (`src/services/documents/pdfReportService.ts`) è stato migrato con successo al read model canonico approvato (`ReportViewModel.fadCanonical`), eliminando ogni dipendenza autoritativa dalle sezioni legacy (`constitution.sections`), dai totali di sezione (`section.total`), dal summary legacy (`summary.totaleFondo`) e da `calculateFadTotals`.
2. **`NORM-01` (Normalizzazione della pipeline di proiezione e Art. 60):** **`VERIFIED_FIXED`**.\
   Tutti e 4 i criteri originari sono pienamente soddisfatti:
   - Annualità 2025 = 0,00 €;
   - Annualità 2026 = -127,44 € (deduzione singola senza duplicazioni);
   - Annualità 2027 = consolidamento esplicito (probe verificato: la platea 2027 non viene ricalcolata, il valore consolidato viene fedelmente conservato nel ledger, nel read model, nel file XLSX e nel PDF);
   - Tutti gli export attivi del Fondo Dipendenti (XLSX, PDF, Tabella 15, Determina, Relazione, Prospetto) consumano esclusivamente la proiezione canonica.
3. **`CALC-02` (Uniformità economica cross-consumer):** **`PARTIALLY_FIXED`**.\
   Nonostante Fondo Personale, Cabina di Regia, XLSX e PDF convergano perfettamente al centesimo, l'acceptance originaria di CALC-02 prescrive espressamente che *“Cabina, Personale, distribuzione ed export concordano al centesimo”*. La verifica obbligatoria della pagina `DistribuzioneRisorsePage.tsx` ha accertato che essa consuma ancora la proprietà legacy `calculationResult?.fondi.dipendente.summary.totaleFondo || 0` e tratta un fondo con stato canonico `UNDETERMINED` e totale autoritativo `null` come un budget definitivo disponibile di 3.400,00 €. In ottemperanza alle regole rigorose di audit, CALC-02 **non può** essere dichiarato `VERIFIED_FIXED` fino a quando la Distribuzione non sarà allineata all'autorità canonica.

---

## 2. PDF Canonical Graph

Il grafo di invocazione reale del PDF riepilogativo è il seguente:

```text
ReportsPage.handleGenerateFullSummary
       │
       ▼
reportService.generateFullSummaryPDF(calculationResult, denominazioneEnte, user)
       │
       ▼
pdfReportService.generateFondoPDF(calculationResult, denominazioneEnte, user)
       │
       ▼
createReportViewModel(calculationResult, denominazioneEnte)
       │  (FadReportReadModel generato via projectFadReport(canonicalFund))
       ▼
pdfReportService.buildFundSummaryPdf(SummaryInput, user)
       │  (SummaryInput = Pick<ReportViewModel, 'fadCanonical' | 'annoRiferimento' | 'denominazioneEnte' | 'altriFondi'>)
       ▼ [jsPDF in-memory document]
doc.save(filename)
```

### Isolamento Architetturale Accertato
- La funzione `buildFundSummaryPdf` riceve un contratto tipizzato `SummaryInput` che **non include** `fondoDipendenti` (sezioni legacy `costituzione` / `utilizzi` / `limiteArt23`), né `CalculationResult.totals`.
- L'AST TypeScript del modulo è stato verificato: nessun identificatore economico legacy (`fondoDipendenti`, `constitution`, `costituzione`, `sections`, `summary`, `totaleFondo`, `calculateFadTotals`, `totals`, `fondi`) viene importato o acceduto.
- L'ispezione runtime con poison getters su `fondoDipendenti` conferma che il documento viene renderizzato ed esportato senza alcun accesso a rami non canonici.

---

## 3. FAD Economic Mapping

Il mapping tra il read model canonico e gli elementi visivi del PDF riepilogativo è verificato come segue:

| Elemento PDF | Sezione PDF | Sorgente Dati | Comportamento Accertato |
| :--- | :--- | :--- | :--- |
| **KPI Totale FAD** | Copertina (Box 1) | `fad.authoritativeTotal` | Se `null` → `"NON DETERMINATO"`; se numerico → formattato in valuta. |
| **KPI Subtotale Stabile** | Copertina (Box 2) | `fad.verifiedStableTotal` | Copia diretta del subtotale stabile verificato dal ledger. |
| **KPI Subtotale Variabile** | Copertina (Box 3) | `fad.verifiedVariableTotal` | Copia diretta del subtotale variabile verificato dal ledger. |
| **Subtotale Verificato FAD** | Copertina e Dettaglio | `fad.verifiedTotal` | Riportato esplicitamente; mai scambiato per totale autoritativo. |
| **Badge Stato Economico** | Copertina | `fad.status` / `isEconomicDraft` | `"STATO ECONOMICO FAD: <STATUS> - BOZZA / NON DETERMINATO"` se non valido. |
| **Dettaglio Risorse (Quadro A)** | Pagina 2 | `fad.rows` (STABLE / VARIABLE) | Righe raggruppate per componente; colonna importo legge `row.signedAmount`. |
| **Voci Unresolved (Quadro A)** | Pagina 2 | `row.signedAmount === null` | Importo economico riporta `"NON DETERMINATO"`; importo informativo esposto solo nella descrizione con dicitura `[DA ISTRUIRE - escluso dai subtotali]`. |
| **Note Figurative / Prerequisiti** | Pagina 2 (in calce) | `unresolvedItems` & `missingPrerequisites` | Riportate come note testuali; nessun impatto numerico. |
| **Quadro B (Utilizzi)** | Pagina 2 | Testo statico | `"Non rappresentato in questo prospetto"` (nessun dato legacy utilizzato). |
| **Verifica Limite Art. 23 c. 2** | Copertina | Testo statico | `"Non rappresentato in questo prospetto"` (nessuna compliance legacy simulata). |

---

## 4. Real PDF Inspection

I file PDF reali generati durante i test sono stati analizzati tramite `pdfjs-dist` e controlli di layout:
1. **Margini e Coordinate:** Nessun elemento di testo sconfina nei margini (margine sinistro $\ge 35$, margine destro $\le 558$, margine inferiore $\ge 30$). Il footer (`addFooters`) opera separatamente a coordinate protette.
2. **Paginazione Multi-pagina:** Tabelle lunghe fino a 80 righe paginano correttamente oltre 3 pagine senza perdita di righe, senza troncamenti e senza sovrapposizioni sul piè di pagina.
3. **Qualificazione di Bozza:** Nei casi `UNDETERMINED` o `INVALID`, il titolo in copertina include `"BOZZA - RIEPILOGO GENERALE E RISULTANZE"`, il banner di stato è giallo e il nome del file esportato include il prefisso `Fondo_BOZZA_<anno>_<ente>.pdf`.

---

## 5. A/2025 Acceptance

Il test dello scenario A/2025 sul PDF reale conferma la perfetta quadratura:
- **Componenti Stabili Presenti:**
  - Riduzione stabile straordinario: `2.000,00 €`
  - Incremento stabile 0,14%: `1.400,00 €`
  - Decurtazione Art. 60: `0,00 €`
- **Subtotali Verificati:**
  - Subtotale verificato Risorse Stabili: `3.400,00 €`
  - Subtotale verificato Risorse Variabili: `0,00 €`
  - Subtotale verificato FAD: `3.400,00 €`
- **Recupero Arretrati 2024-2025 (2.800 €):**
  - Cella importo economico: `"NON DETERMINATO"`;
  - Descrizione: qualificata con `[UNDETERMINED - DA ISTRUIRE] Aggregato legacy privo di istruttoria distinta per annualità di origine; importo informativo: € 2.800,00 (escluso dai subtotali)`.
  - Escluso al 100% da ogni subtotale e dal totale.
- **Totale Fondo Dipendenti:** `"NON DETERMINATO"`.
- **Valori Spuri Assenti:** I valori legacy non quadrati (`4.800,00`, `6.072,56`, `-127,44`) sono totalmente assenti dal documento.

**Verdetto:** `A2025_PDF_RECONCILIATION = PASS`.

---

## 6. Art. 60 — 2025 / 2026 / 2027

### Annualità 2025
- Ledger: `ART60_CONSOLIDATION` con `amount: 0`, `status: VALID`.
- Read Model: `signedAmount: 0`.
- XLSX: `0.00`.
- PDF: riga contabile con `0,00 €`.
- Eventuale valore legacy raw di 127,44 € ignorato con apposito warning.

### Annualità 2026
- Ledger: `ART60_CONSOLIDATION` con `amount: 127.44`, `operation: DEDUCTION`.
- Read Model: `signedAmount: -127.44`.
- XLSX: `-127.44` (singola riga contabile).
- PDF: `-127,44 €` (singola riga contabile).

### Annualità 2027 (Consolidamento Esplicito)
È stato eseguito un probe dedicato con input 2027:
- Importo consolidato noto: `500,00 €`.
- Platea in servizio al 2027 volutamente impostata a 5 dipendenti (che in caso di ricalcolo errato $5 \times 127,44 \times 12$ avrebbe prodotto 7.646,40 €).
- **Esito del Probe:**
  - Ledger: `ART60_CONSOLIDATION` assume esattamente `amount: 500.00`, con `operation: DEDUCTION`, `competenceYear: 2027`, `originYear: 2026`. Non invoca né ricalcola la platea 2027.
  - Read Model: `signedAmount: -500.00`.
  - XLSX: cella economica `-500.00`.
  - PDF: testo estratto riporta `-500,00 €`. Nessuna traccia di 7.646,40 € o altri ricalcoli.

**Verdetto:** `ART60_2027_CONSOLIDATION = PASS_EXPLICIT_CONSOLIDATION`.

---

## 7. Recovery Unresolved

Il trattamento delle poste provvisorie non istruite:
- Non genera alcuna riga economica numerica: l'importo è indicato come `"NON DETERMINATO"`.
- L'importo informativo (es. 2.800 €) appare unicamente nella stringa descrittiva contrassegnato da `(escluso dai subtotali)`.
- I subtotali e il totale autoritativo rimangono rigorosamente depurati da tale importo.

---

## 8. Other Funds Preservation

La salvaguardia degli altri fondi dell'ente (Elevate Qualificazioni, Segretario Comunale, Dirigenza):
- Riportati nella pagina dedicata `"QUADRO ALTRI FONDI (EQ, SEGRETARIO, DIRIGENZA)"`.
- Isolamento semantico: nessun totale di altri fondi viene sommato o confuso con il Fondo Dipendenti (FAD).
- Policy aggregata complessiva dell'ente: `MULTI_FUND_AGGREGATE_POLICY = SEPARATE_FUNDS`. In copertina è esplicitamente indicato: `"Fondi esposti separatamente; nessun totale complessivo ente."`.
- La presenza di altri fondi determinati non valida né altera lo stato `UNDETERMINED` del Fondo Dipendenti.

---

## 9. Legacy Bypass Proof

La rimozione dell'eredità legacy nel PDF è verificata mediante:
1. **Poison Getters:** Nel test `P9`, l'accesso a `viewModel.fondoDipendenti` lancia eccezione; il PDF viene compilato ed emesso senza alcun errore.
2. **Totali Divergenti Iniettati:** Impostando artificialmente totali legacy a 777.777 €, 888.888 € e 999.999 €, il PDF riporta fedelmente il dato canonico (55,55 €) e nessuna cella o testo include i valori fittizi.
3. **Analisi Statica AST:** Nessun accesso o importazione a funzioni legacy (`calculateFadTotals`, ecc.) o a campi non canonici è presente nel codice sorgente di `pdfReportService.ts`.

**Verdetto:** `LEGACY_BYPASS_IN_PDF = ABSENT`.

---

## 10. Test Harness Review

La suite [`src/services/__tests__/canonicalFundSummaryPdf.test.ts`](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/services/__tests__/canonicalFundSummaryPdf.test.ts) (17 test):
- Esegue il builder reale `buildFundSummaryPdf` con `jsPDF` e `jspdf-autotable` reali;
- Intercetta solo il salvataggio file del browser, estraendo il buffer reale ed analizzandolo con `pdfjs-dist`;
- Verifica testo, numeri, layout, formattazioni, coordinate e paginazione;
- Include scenari completi: A/2025, Art. 60 2025/2026, recuperi, stati INVALID, canonical mancante, frazioni centesimali, altri fondi, isolamento multi-fondo e poison getters.

**Verdetto:** `TEST_HARNESS_REVIEW = PASS_HIGH_CONFIDENCE`.

---

## 11. Network Gate

L'esecuzione delle suite con il guard offline potenziato (`guard-forensic.cjs`) attivo ha registrato:
- `PRODUCT_NETWORK_ATTEMPTS = 0`
- `TOOLING_NETWORK_ATTEMPTS = 0`
- `REAL_NETWORK_CONNECTION_ESTABLISHED = NO`

Nessuna richiesta di rete è stata tentata né effettuata dal writer o dai test.

---

## 12. CALC-02 Original Acceptance Review

L'acceptance originale definita nel report di audit ASTRA per `CALC-02` recita testualmente:
> *"Cabina, Personale, distribuzione ed export concordano al centesimo per risorse importate e manuali."*

Per verificare se `CALC-02` possa essere promosso a `VERIFIED_FIXED`, la review ha esaminato la totalità dei consumer:
1. **Fondo Personale:** Allineato al read model canonico (`verifiedStableTotal`, `verifiedVariableTotal`, `verifiedTotal`, totale `"Non determinabile"` se indeterminato).
2. **Cabina di Regia:** Allineata al read model canonico (`resolveCabinaViewModel` consuma `canonicalFund`, totale definitivo nascosto se non valido).
3. **XLSX FAD:** Allineato al read model canonico (`buildFondoDipendenteWorkbook`).
4. **PDF Riepilogativo:** Allineato al read model canonico (`buildFundSummaryPdf`).
5. **Distribuzione:** Non allineata (vedi sezione successiva).

---

## 13. Distribution Probe

L'analisi del codice sorgente di [`src/pages/DistribuzioneRisorsePage.tsx`](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/pages/DistribuzioneRisorsePage.tsx) rivela:
- **Riga 279:**
  ```typescript
  const totaleDaDistribuire = calculationResult?.fondi.dipendente.summary.totaleFondo || 0;
  ```
- **Riga 542:**
  ```tsx
  <span className="text-2xl font-bold text-gray-900">{formatCurrency(totaleDaDistribuire)}</span>
  ```

### Risultanze del Probe
1. **Sorgente del Totale:** La pagina non legge `canonicalFund` né il read model; legge direttamente la proprietà legacy `calculationResult.fondi.dipendente.summary.totaleFondo`.
2. **Trattamento del Fondo Indeterminato:** Sul dataset A/2025 (in cui `authoritativeTotal` è `null` e lo stato è `UNDETERMINED`), la pagina assume come budget legalmente allocabile `totaleDaDistribuire = 3.400,00 €`.
3. **Mancata Qualificazione di Bozza:** La Distribuzione non segnala lo stato provvisorio o non determinabile del fondo, trasformando un subtotale parziale verificato in un fondo costituito definitivo spendibile.
4. **Distinzione CALC-02 vs FUNC-02:**
   - Il problema di workflow (*“la distribuzione può essere avviata prima della verifica”*) appartiene a `FUNC-02`.
   - Il problema economico (*“la distribuzione consuma una proprietà legacy e promuove un totale nullo a budget numerico definito senza consumare il ledger canonico”*) appartiene a **`CALC-02`**.

In base al criterio fissato nel protocollo di audit, l'esistenza di un consumer principale attivo che consuma il summary legacy impedisce la chiusura definitiva di CALC-02.

---

## 14. Cross-Consumer Matrix (Dataset A/2025)

| Consumer | Status Economico | Risorse Stabili | Risorse Variabili | Subtotale Verificato | Totale Autoritativo | Note di Conformità |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **CanonicalFundResult** | `UNDETERMINED` | 3.400,00 € | 0,00 € | 3.400,00 € | `null` | Autorità economica originaria |
| **Fondo Personale (UI)** | `UNDETERMINED` | 3.400,00 € | 0,00 € | 3.400,00 € | Non determinabile | Conforme al canonico |
| **Cabina di Regia (UI)** | `UNDETERMINED` | 3.400,00 €* | 0,00 €* | 3.400,00 € | `null` | Conforme (`showDefinitiveTotal: false`) |
| **FadReportReadModel** | `UNDETERMINED` | 3.400,00 € | 0,00 € | 3.400,00 € | `null` | Conforme al canonico |
| **XLSX FAD (Export)** | `UNDETERMINED` | 3.400,00 € | 0,00 € | 3.400,00 € | NON DETERMINATO | Conforme (`BOZZA_`) |
| **PDF Summary (Export)** | `UNDETERMINED` | 3.400,00 € | 0,00 € | 3.400,00 € | NON DETERMINATO | Conforme (`BOZZA_`) |
| **Distribuzione (UI)** | *Non qualificato* | N/D | N/D | N/D | **3.400,00 €** | **Non conforme** (legge `summary.totaleFondo`) |

*\*In Cabina di Regia le componenti stabili/variabili sono aggregate nel subtotale verificato.*

---

## 15. Active Export Inventory

È stato condotto il censimento di tutti i punti di esportazione attivi dell'applicazione:

1. **`generateFullSummaryPDF` (ReportsPage):** Migrato al read model canonico via `buildFundSummaryPdf`.
2. **`generateFADXLS` (ReportsPage):** Migrato al read model canonico via `buildFondoDipendenteWorkbook`.
3. **Tabella 15 XLS / CSV (ReportsPage):** Migrata a `mapToTabella15` basata su voci del ledger canonico.
4. **Documenti Amministrativi (Determina, Relazione, Prospetto via `DocumentFactory`):** Migrati alle proiezioni canoniche Wave 3.
5. **Codice Storico / Latente:** Non esistono altri writer documentali attivi invocabili dalla UI.

Tutti gli export attivi del Fondo Dipendenti sono al 100% canonici.

---

## 16. NORM-01 Final Matrix

| Annualità | Canonical Ledger | FadReportReadModel | Workbook XLSX | Documento PDF | Esito di Riconciliazione |
| :---: | :---: | :---: | :---: | :---: | :---: |
| **2025** | `0,00 €` | `0,00 €` | `0,00 €` | `0,00 €` | **PASS** (nessuna decurtazione applicata) |
| **2026** | `-127,44 €` (Deduction) | `-127,44 €` | `-127,44 €` | `-127,44 €` | **PASS** (singola detrazione contabile) |
| **2027** | Consolidato esplicito | Consolidato esplicito | Consolidato esplicito | Consolidato esplicito | **PASS** (nessun ricalcolo della platea) |

---

## 17. Finding Closure Decision

### `CANONICAL_FUND_SUMMARY_PDF` $\rightarrow$ `CLOSED_LOCALLY`
Il generatore PDF riepilogativo è completamente autonomo dall'eredità legacy, non presenta bypass economici e rispetta integralmente la semantica contabile.

### `NORM-01` $\rightarrow$ `VERIFIED_FIXED`
Tutte le condizioni di chiusura sono soddisfatte:
- 2025 = 0;
- 2026 = deduzione singola 127,44;
- 2027 = consolidamento esplicito senza ricalcoli indebiti di organico;
- Tutti gli export FAD attivi sono uniformati.

### `CALC-02` $\rightarrow$ `PARTIALLY_FIXED`
Rimane parzialmente risolto in quanto `DistribuzioneRisorsePage.tsx` fa ancora affidamento su `summary.totaleFondo` per determinare il budget da ripartire anziché consumare `canonicalFund.authoritativeTotal` o gestire lo stato `UNDETERMINED`.

### Altri Finding
- `NORM-02`: `PARTIALLY_FIXED` (istruttoria recuperi non completata).
- `DOC-02`: `PARTIALLY_FIXED` (readiness amministrativa non formalizzata).
- `ARCH-01`: `PARTIALLY_FIXED` (presenza di proprietà legacy residuali nel ViewModel e nel motore).
- `FUNC-02`: `PARTIALLY_FIXED` (workflow e priorità bloccanti di Cabina/Distribuzione).

---

## 18. Scope Integrity

- **File Produttivi Modificati dallo Slice:** Solo ed esclusivamente `src/services/documents/pdfReportService.ts`.
- **File Test Aggiunti:** `src/services/__tests__/canonicalFundSummaryPdf.test.ts`.
- **File Invariati Verificati:** `xlsReportService.ts`, `documentProjection.ts`, `reportPresenter.ts`, `canonicalFundLedger.ts`, `fundEngine.ts`, `tabella15Mapper.ts`, file Auth e migration.
- **Integrità Baseline:** Branch e HEAD invariati. Nessun file tracciato rimosso o modificato oltre il perimetro consentito.

---

## 19. Next Gate Recommendation

Con la chiusura locale del PDF e la risoluzione definitiva di `NORM-01`, il successivo passo raccomandato per completare il disaccoppiamento dei consumatori e consentire la futura chiusura di `CALC-02` e `FUNC-02` è:

`NEXT_GATE_RECOMMENDATION = CABINA_BLOCKING_ISSUE_PRIORITY`\
(seguito da `DISTRIBUTION_EXPLICIT_DRAFT` per rifasare `DistribuzioneRisorsePage` sul risultato canonico).
