# DOCUMENT_KIND_READINESS — Independent Review
## DOC-02 / FUNC-02 — Policy per tipo documento, no-final bypass e preservation audit

**Data Review:** 2026-10-04\
**Auditor / Reviewer:** Principal Software Architect, Document-Workflow Auditor & Independent Reviewer\
**Repository:** `dinopusceddu/entilocaliapp`\
**Branch:** `ux/toolbox-area-fondo-prototype`\
**HEAD:** `d3170f959b5815c514dbf3d6e5f93366a5f14c67`\
**Verdetto Finale:** **PASS — DOCUMENT_KIND_READINESS_INDEPENDENT_REVIEW = COMPLETE**

---

## 1. Executive Verdict

L'audit indipendente di architettura software, completezza documentale, conformità amministrativa e assenza di bypass per lo slice `DOCUMENT_KIND_READINESS` emette verdetto **PASS**.

### Sintesi delle Valutazioni
1. **`DOCUMENT_KIND_READINESS`:** **`CLOSED_LOCALLY`**.\
   L'implementazione rispetta integralmente la policy business approvata dall'utente:
   - Ogni criticità di tipo `BLOCKING` inibisce l'esportazione definitiva di tutti e cinque i documenti attivi;
   - I metadata amministrativi opzionali (`numeroDetermina`, `dataDetermina`, `firmaDigitale`) non sono prerequisiti bloccanti e possono permanere sotto forma di placeholder formali (`{{NUMERO_DETERMINA}}`, etc.) anche nell'atto definitivo;
   - L'anteprima/bozza (`DRAFT_PREVIEW` / `BOZZA`) resta sempre accessibile quando tecnicamente costruibile;
   - Le criticità di tipo `WARNING` non impediscono l'export definitivo;
   - Non viene inferito o richiesto alcun fatto amministrativo non documentato (es. parere favorevole revisori, delibera GC, trasmissione);
   - Relazione tecnica e Prospetto contrattazione mantengono la loro autonomia istruttoria rispetto alla Determina.
2. **`DOC-02` (Integrità e completezza documentale pre-costituzione):** **`VERIFIED_FIXED`**.\
   Tutti e 5 gli entrypoint documentali attivi (`DETERMINA`, `RELAZIONE`, `PROSPETTO`, `SUMMARY_PDF`, `FAD_XLS`) sono ora protetti da una tripla barriera (UI button state, handler guard, factory/service domain guard). Nessun percorso consente l'esportazione di un documento definitivo privo di validazione canonica o in presenza di blocker.
3. **`FUNC-02` (Workflow State Integrity):** **`PARTIALLY_FIXED`** (Severità: `HIGH`).\
   Lo slice documentale chiude la componente DOC-02 di FUNC-02. Il residuo noto `POST_CLOSE_N_PLUS_1_NAVIGATION` (classificato come `CONFIRMED_NON_DESTRUCTIVE_WORKFLOW_BUG`) rimane isolato e circoscritto all'apposita issue, senza impatti sulla chiusura dei documenti.
4. **`NORM-02` & `ARCH-01`:** rimangono **`PARTIALLY_FIXED`** (Severità: `HIGH`), come stabilito dal mandato.
5. **Blocker ASTRA Consolidati:**\
   `DATA-02 = VERIFIED_FIXED`, `CALC-02 = VERIFIED_FIXED`, `NORM-01 = VERIFIED_FIXED`. `ASTRA_BLOCKERS_OPEN = 0`.

---

## 2. Baseline

Prima di procedere all'analisi sono stati verificati i vincoli di integrità:
- `git branch --show-current`: `ux/toolbox-area-fondo-prototype`
- `git rev-parse HEAD`: `d3170f959b5815c514dbf3d6e5f93366a5f14c67`
- `git diff --cached --name-status`: *vuoto* (nessuna modifica indicizzata)
- `git status --short --untracked-files=all`: working tree preservato integralmente
- Zero tentativi di connessione a Staging (`mcasgpaivyosaroxrodm`) o Produzione (`yggokplxleredipknfbq`).

---

## 3. Active Document Inventory

Il censimento puntuale dei documenti accessibili all'utente in `ReportsPage.tsx` conferma l'esistenza di esattamente **5 documenti attivi** legati al Fondo, più un export regolamentare separato:

| Document Kind | Classe | Entrypoint UI | Service / Writer | Output Definitivo | Output Bozza |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`DETERMINA`** | Atto Amministrativo | `handleExportDefinitiveDeterminaPDF`<br>`handleExportDefinitiveDeterminaTXT` | `DocumentFactory`<br>→ `pdfDeterminaService`<br>→ `determinaTemplateV2` | `Determina_Costituzione_Fondo_2026.pdf`<br>`Determina_Costituzione_Fondo_2026.txt` | `Determina_BOZZA_2026.pdf`<br>`Determina_BOZZA_2026.txt` |
| **`RELAZIONE`** | Relazione Tecnico-Finanziaria | `handleExportDefinitiveRelazioneTecnica` | `DocumentFactory`<br>→ `relazioneTecnicaTemplate` | `Relazione_Tecnica_Fondo_2026.txt` | `Relazione_BOZZA_2026.txt` |
| **`PROSPETTO`** | Prospetto Contrattazione | `handleExportDefinitiveProspetto` | `DocumentFactory`<br>→ `buildProspettoContrattazione` | `Prospetto_Contrattazione_2026.txt` | `Prospetto_BOZZA_2026.txt` |
| **`SUMMARY_PDF`** | Report Finanziario Generale | `handleGenerateFullSummary` | `reportService.generateFullSummaryPDF`<br>→ `pdfReportService.generateFondoPDF` | `Fondo_2026_<Ente>.pdf` | `Fondo_BOZZA_2026_<Ente>.pdf` |
| **`FAD_XLS`** | Dettaglio Contabile Fondo | `handleGenerateFADXLS` | `reportService.generateFADXLS`<br>→ `xlsReportService.generateFondoDipendenteXLS` | `Fondo_Dipendenti_<Ente>_2026.xlsx` | `Fondo_Dipendenti_BOZZA_<Ente>_2026.xlsx` |

### Entrypoint Separati e Moduli Latenti / Preparatori
- **`Tabella 15 (SICO/RGS)`:** Gestita separatamente tramite `tabella15XlsService.ts` e `tabella15Mapper.ts`. Mantiene il proprio gate regolamentare (`isArithmeticExportReady`, `RGS_SCHEMA_UNVERIFIED`). Non fa parte di `DOCUMENT_KINDS` e non eredita lo stato `FINAL_READY`.
- **Moduli Preparatori:** `RequestDataLetterModal` (richiesta dati ex-ante), `CompensatoreDelegatoPage` (calcolo compensi isolato), `CsvImportModal` (importazione dati). Sono utility preparatorie antecedenti alla costituzione e non producono atti di costituzione definitiva.
- **Entrypoint Latenti / Dead Code:** `generateDeterminazioneTXT` in `reportService.ts` (vecchio template) non ha caller attivi nella UI di `ReportsPage` né in altre pagine; i vecchi `pdfReportService2.ts` e script top-level rimangono separati e non raggiungibili.

---

## 4. Active Final Export Graph

Il grafo di autorizzazione e generazione per ciascuno dei 5 documenti attivi:

```text
ReportsPage (UI)
   │
   ├─► Check documentReadiness[kind].status === 'FINAL_READY'
   │     └─ Disabilita pulsanti definitivi se non pronto;
   │
   ├─► Handler click (es. handleExportDefinitiveDeterminaPDF)
   │     └─ Guard: assertDocumentFinalReady(readiness[kind]) (throw se non pronto);
   │
   ├─► DocumentFactory / reportService
   │     ├─ assertDefinitiveExportAllowed(kind) (blocco a livello di dominio)
   │     └─ resolveFinancialOutput (blocco a livello di wrapper finanziario)
   │
   └─► Template / Writer
         └─ Mode risolto esplicitamente: 'DEFINITIVE_EXPORT' o 'DRAFT_PREVIEW'
```

Nessun writer riceve autorizzazione a produrre l'atto finale se una qualunque delle tre barriere fallisce.

---

## 5. Resolver Purity

Il resolver `resolveDocumentKindReadiness` in `src/domain/documentKindReadiness.ts`:
- È una funzione pura deterministica;
- Consuma esclusivamente: `documentKind`, `canonicalFund`, `issues`, `previewAvailable`;
- Non effettua chiamate asincrone, I/O, manipolazioni DOM o mutazioni dello stato;
- Non ordina né muta gli array in ingresso (verificato tramite `Object.freeze` nel test suite);
- Determina l'ordine delle ragioni e dei target correttivi basandosi rigidamente sull'ordine originale normalizzato di `issues` (proveniente da `resolveChecklist`).

---

## 6. Policy Fidelity

L'implementazione aderisce al 100% alle decisioni business formalizzate:
1. **Nessun campo obbligatorio artificiale:** `missingFields` restituisce `[]`. I metadati della Determina (`numeroDetermina`, `dataDetermina`, `firmaDigitale`) sono esposti in `compilableFields` a scopo informativo ma non bloccano il rilascio.
2. **Universalità del Blocco per Issue `BLOCKING`:** Qualsiasi criticità di gravità `BLOCKING` (es. anomalie Art. 23 c. 2, errori contabili gravi) impone `status: 'DRAFT_ONLY'` e `mode: 'DRAFT_PREVIEW'` su tutti e 5 i documenti.
3. **Disponibilità della Preview:** Se `previewAvailable === true`, `DRAFT_ONLY` consente il download della bozza con indicazione della motivazione; lo stato `UNAVAILABLE` scatta solo se non esiste alcun dato per costruire il documento.
4. **Non-blocco per `WARNING`:** Una issue di tipo `WARNING` non muta lo stato di un fondo valido, consentendo l'export definitivo.

---

## 7. Decision Matrix

La matrice di decisione effettiva applicata a runtime:

| Condizione di Input | Determina | Relazione | Prospetto | Summary PDF | FAD XLS |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **VALID, totale determinato, 0 blocker** | `FINAL_READY` | `FINAL_READY` | `FINAL_READY` | `FINAL_READY` | `FINAL_READY` |
| **VALID con metadati omessi (placeholder)** | `FINAL_READY` | `FINAL_READY` | `FINAL_READY` | `FINAL_READY` | `FINAL_READY` |
| **VALID con totale canonico = 0,00 €** | `FINAL_READY` | `FINAL_READY` | `FINAL_READY` | `FINAL_READY` | `FINAL_READY` |
| **UNDETERMINED / INVALID / MISSING** | `DRAFT_ONLY` | `DRAFT_ONLY` | `DRAFT_ONLY` | `DRAFT_ONLY` | `DRAFT_ONLY` |
| **VALID + criticità BLOCKING** | `DRAFT_ONLY` | `DRAFT_ONLY` | `DRAFT_ONLY` | `DRAFT_ONLY` | `DRAFT_ONLY` |
| **VALID + MISSING_PREREQUISITE** | `DRAFT_ONLY` | `DRAFT_ONLY` | `DRAFT_ONLY` | `DRAFT_ONLY` | `DRAFT_ONLY` |
| **VALID + criticità WARNING only** | `FINAL_READY` | `FINAL_READY` | `FINAL_READY` | `FINAL_READY` | `FINAL_READY` |
| **Annualità CLOSED** | `FINAL_READY` | `FINAL_READY` | `FINAL_READY` | `FINAL_READY` | `FINAL_READY` |
| **Calcolo assente (preview non costruibile)** | `UNAVAILABLE` | `UNAVAILABLE` | `UNAVAILABLE` | `UNAVAILABLE` | `UNAVAILABLE` |

---

## 8. Placeholder Policy

L'ispezione dei testi generati conferma:
- Quando `numeroDetermina`, `dataDetermina` e `firmaDigitale` non sono compilati:
  - Il documento definitivo TXT e PDF riporta esattamente i placeholder:\
    `DETERMINAZIONE N. {{NUMERO_DETERMINA}} DEL {{DATA_DETERMINA}}`\
    `{{FIRMA_DIGITALE}}`
  - Il sistema **non inventa** valori predefiniti fittizi (es. non scrive "Determina n. 1 del 01/01/2026");
  - L'atto non viene falsamente contrassegnato come già firmato o protocollato.

---

## 9. Determina Review

- **Atto Definitivo:** Contiene la formula dispositiva:\
  `DI COSTITUIRE, per le motivazioni espresse in premessa, il fondo per le risorse decentrate... nell'importo complessivo di Euro <totaleFondo>.`
- **Atto in Bozza (`DRAFT_PREVIEW`):**
  - Riporta il banner: `[SCHEMA DI ATTO NON DEFINITIVO - BOZZA IN ISTRUTTORIA]`;
  - Riporta la motivazione: `Motivo: <draftReason>`;
  - **Esclusione tassativa della clausola costitutiva:** la formula `DI COSTITUIRE` è sostituita da `DI DARE ATTO, in sede istruttoria, del subtotale delle risorse verificate... La presente bozza non costituisce il fondo: occorre risolvere le criticità segnalate.`;
  - Nei "PRESO ATTO", sostituisce l'attestazione del rispetto dei vincoli con `- Delle verifiche ancora da completare prima della costituzione definitiva del fondo.`.

---

## 10. Relazione Review

- È redatta come relazione tecnico-finanziaria autonoma ai sensi dell'art. 40-bis D.Lgs. 165/2001;
- Non richiede né menziona deliberazioni di Giunta o pareri dei Revisori come prerequisiti;
- Non eredita metadati amministrativi dalla Determina;
- In presenza di blocker su fondo numericamente valido, espone esplicitamente:\
  `TOTALE ECONOMICO CANONICO: Euro <totale> (documento non definitivo)`;
- Mantiene l'avvertenza di istruttoria aperta e la qualificazione di bozza senza corrompere il dato contabile.

---

## 11. Prospetto Review

- Documento predisposto per la contrattazione integrativa (art. 7 CCNL 2026);
- Espone la scomposizione tra risorse stabili, variabili e destinazioni;
- Totalmente svincolato da metadata di adozione formale o firma digitale;
- Soggetto al blocco dell'export definitivo in presenza di blocker, con anteprima in bozza sempre consultabile.

---

## 12. Summary PDF Review

- Mantiene immutato il read model canonico approvato (`ReportViewModel.fadCanonical`);
- Non riapre né modifica i contratti consolidati in `CANONICAL_FUND_SUMMARY_PDF`;
- In modalità bozza espone:
  - Intestazione: `BOZZA - RIEPILOGO GENERALE E RISULTANZE`;
  - Banner di stato: `STATO ECONOMICO FAD: VALID - BOZZA / NON DETERMINATO` (o stato equivalente);
  - Nota esplicita con la causale di bozza: `BOZZA: <draftReason>`;
  - Nome file: `Fondo_BOZZA_<anno>_<ente>.pdf`.

---

## 13. FAD XLS Review

- Mantiene immutato il workbook builder canonico approvato (`buildFondoDipendenteWorkbook`);
- Non calcola formule alternative né altera celle o righe di dettaglio;
- In modalità bozza:
  - Cella `A1`: `BOZZA - COSTITUZIONE E UTILIZZO FONDO PERSONALE DIPENDENTE - ANNO <anno>`;
  - Cella `A4`: `BOZZA: <draftReason>`;
  - Nome file: `Fondo_Dipendenti_BOZZA_<ente>_<anno>.xlsx`.

---

## 14. Blocking / Warning / Prerequisite

- **`resolveChecklist`:** Centralizza la determinazione delle criticità dal set normalizzato di `ComplianceCheck` e dal `canonicalFund`.
- **`BLOCKING`:** Errore normativo o contabile insanabile che impedisce l'atto definitivo.
- **`MISSING_PREREQUISITE`:** Dati essenziali di input non forniti, gestiti come fattore inibente distinto.
- **`WARNING`:** Anomalia non bloccante; lascia inalterata la possibilità di procedere al definitivo.

---

## 15. Metadata Inference Red-Team

È stata testata l'intera combinatoria di metadati opzionali parziali o assenti:
1. `numVerbaleRevisori` fornito senza data o esito → Nessun parere favorevole inventato;
2. `opinionOutcome: 'UNKNOWN'` o `'UNFAVORABLE'` → Non viene forzato ad attestazione favorevole (nel caso di `UNFAVORABLE`, il testo riporta esplicitamente "parere NON favorevole");
3. `transmissionStatus: 'NOT_DOCUMENTED'` → Trattato come trasmissione non documentata;
4. `numDeliberaGc` presente ma `adoptionStatus: 'NOT_DOCUMENTED'` → Nessuna adozione attestata;
5. **Esito:** `METADATA_INFERENCE = NONE_DETECTED`. Il sistema documenta fedelmente la realtà storica senza interpolazioni.

---

## 16. False Attestations

L'ispezione red-team esclude categoricamente la generazione di false attestazioni amministrative:
- In assenza di adozione GC, il testo dichiara: *“La deliberazione di indirizzo della Giunta Comunale non risulta documentata nei dati disponibili”*;
- In assenza di verbale revisori, il testo dichiara: *“Gli estremi e l'esito del parere dell'Organo di Revisione non risultano documentati nei dati disponibili”*;
- Nelle bozze, la formula *“Del rispetto degli obiettivi di finanza pubblica...”* viene rimossa e sostituita dall'avviso sulle verifiche pendenti;
- Non compare mai la dicitura di atto adottato o firmato in presenza di soli placeholder.

---

## 17. Preview Availability

Nei quattro scenari critici (`VALID + BLOCKING`, `UNDETERMINED`, `INVALID`, `MISSING_CANONICAL`), la bozza tecnica e l'anteprima a video rimangono disponibili al 100% via UI e via factory:
- `Determina (PDF/TXT)`: preview scaricabile con dicitura BOZZA;
- `Relazione (TXT)`: bozza scaricabile con subtotali verificati;
- `Prospetto (TXT)`: bozza scaricabile;
- `Summary PDF`: anteprima generabile;
- `FAD XLS`: anteprima scaricabile.
Nessun blocco indebito (*no overblocking*) sulle bozze.

---

## 18. Forced Final Handler/Service Tests

I test di sicurezza con invocazione programmatica forzata degli handler definitivi in presenza di `BLOCKING` o `UNDETERMINED` certificano:
1. `handleExportDefinitiveDeterminaPDF`: bloccato con eccezione controllata e alert, 0 download;
2. `handleExportDefinitiveDeterminaTXT`: bloccato, 0 download;
3. `handleExportDefinitiveRelazioneTecnica`: bloccato, 0 download;
4. `handleExportDefinitiveProspetto`: bloccato, 0 download;
5. `handleGenerateFullSummary('DEFINITIVE_EXPORT')`: rejected, 0 download;
6. `handleGenerateFADXLS('DEFINITIVE_EXPORT')`: rejected, 0 download;
7. Invocazione diretta via `DocumentFactory` (`exportDefinitive*`): solleva eccezione controllata;
8. Invocazione diretta via `reportService` con `mode: 'DEFINITIVE_EXPORT'`: solleva eccezione controllata.

---

## 19. Omitted Mode Behavior

Nel caso critico in cui un consumer invochi la generazione omettendo il parametro `mode` (`mode = undefined`):
- Se il fondo presenta `BLOCKING` o è `UNDETERMINED`: il resolver valuta lo stato e restituisce automaticamente `mode: 'DRAFT_PREVIEW'`, forzando la produzione di una bozza (filename `BOZZA`, watermark/header di bozza, esclusione di `DI COSTITUIRE`);
- Nessuna promozione implicita a definitivo può verificarsi per omissione di parametro.\
Classificazione: **`OMITTED_MODE_POLICY = SAFE_RESOLVED`**.

---

## 20. CLOSED

La gestione dell'annualità `CLOSED` è stata verificata:
- I pulsanti di salvataggio metadati risultano disabilitati (`disabled={isClosed}`);
- La generazione di preview e definitivi è permessa in sola lettura applicando la medesima policy di validità;
- Nessun dispatch (`UPDATE_ANNUAL_DATA`, etc.) viene emesso;
- Nessuna transazione o mutazione di stato si verifica.

---

## 21. Tabella15 / SICO Separation

- I file `tabella15Mapper.ts`, `tabella15XlsService.ts` e le funzioni relative in `reportService.ts` sono rimasti byte-identici al PRE;
- `isSicoExportReady` rimane `false` e `RGS_SCHEMA_UNVERIFIED` permane inalterato;
- L'eventuale stato `FINAL_READY` dei 5 documenti non ha alcuna influenza su Tabella 15, che richiede la propria quadratura aritmetica autonoma.\
Classificazione: **`SICO_SEPARATION = PRESERVED`**.

---

## 22. Latent Legacy Callers

- La funzione `generateDeterminazioneTXT` in `reportService.ts` (che richiama il template V1) non è agganciata a nessun elemento attivo della UI;
- `pdfReportService.art79.test.ts`, `excelService.art79.test.ts` e `determinaTemplate.art79.test.ts` sono test specifici di regressione retrocompatibile che non impattano il grafo attivo di `ReportsPage`;
- Non vi sono percorsi paralleli attivi tramite cui un utente possa innescare esportazioni non controllate.

---

## 23. Real File Inspection

L'ispezione indipendente condotta su 24 file reali prodotti sul filesystem temporaneo (inclusi PDF analizzati con `pdfjs-dist` e file Excel ricaricati con `exceljs`) conferma:

| Scenario Testato | Determina (PDF/TXT) | Relazione (TXT) | Prospetto (TXT) | Summary (PDF) | FAD (XLSX) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **FINAL con Metadati** | `Costituzione_Fondo`<br>Formula `DI COSTITUIRE`<br>Dati metadati presenti | `Relazione_Tecnica`<br>Totale certificato | `Prospetto_Contratt.`<br>Totale certificato | `Fondo_2026`<br>Stato VALID<br>Nessun watermark | `Fondo_Dipendenti`<br>Titolo ordinario<br>Zero formule |
| **FINAL con Placeholder** | `Costituzione_Fondo`<br>Placeholder presenti<br>Formula `DI COSTITUIRE` | `Relazione_Tecnica`<br>Totale certificato | `Prospetto_Contratt.`<br>Totale certificato | `Fondo_2026`<br>Stato VALID | `Fondo_Dipendenti`<br>Titolo ordinario |
| **VALID + BLOCKING** | `BOZZA`<br>NO `DI COSTITUIRE`<br>Motivo blocker esposto | `BOZZA`<br>Avvertenza blocker<br>Totale canonico esposto | `BOZZA`<br>Escluso definitivo | `BOZZA`<br>Banner di bozza<br>Motivo blocker esposto | `BOZZA`<br>Nota cella A4<br>Zero formule |
| **UNDETERMINED** | `BOZZA`<br>NO `DI COSTITUIRE`<br>Subtotale esposto | `BOZZA`<br>Totale non determinabile | `BOZZA`<br>Escluso definitivo | `BOZZA`<br>Stato non determinato | `BOZZA`<br>Totale non determ. |

Tutti i PDF estratti hanno coordinate e margini regolari; tutti i file XLSX ricaricati contengono solo celle con valori statici e nessuna formula corrotta.

---

## 24. Cross-Document Consistency

Sullo stesso dataset di test:
- Tutti e 5 i documenti concordano al centesimo sull'ammontare economico canonico verificato;
- Tutti concordano perfettamente sulla qualificazione `FINAL` vs `BOZZA`;
- Nei casi `VALID + BLOCKING`, sia la Determina che la Relazione e i due report finanziari riportano l'identica stringa motivazionale normalizzata originata da `resolveChecklist`.

---

## 25. Active Bypass Inventory

| Kind | UI Guard (Bottone) | Handler Guard | Service / Factory Guard | Final Bypass Possibile? |
| :--- | :---: | :---: | :---: | :---: |
| **`DETERMINA` (PDF/TXT)** | `disabled={!isDefinitiveExportReady}` | `try/catch` + error alert | `assertDefinitiveExportAllowed('DETERMINA')` | **NO** |
| **`RELAZIONE` (TXT)** | `disabled={!isDefinitiveExportReady}` | `try/catch` + error alert | `assertDefinitiveExportAllowed('RELAZIONE')` | **NO** |
| **`PROSPETTO` (TXT)** | `disabled={!isDefinitiveExportReady}` | `try/catch` + error alert | `assertDefinitiveExportAllowed('PROSPETTO')` | **NO** |
| **`SUMMARY_PDF`** | `disabled={status !== 'FINAL_READY'}` | `assertDocumentFinalReady(readiness)` | `resolveFinancialOutput` throws | **NO** |
| **`FAD_XLS`** | `disabled={status !== 'FINAL_READY'}` | `assertDocumentFinalReady(readiness)` | `resolveFinancialOutput` throws | **NO** |

**`ACTIVE_FINAL_EXPORT_BYPASSES = 0`**.

---

## 26. Test Harness Review

I test dedicati introdotti nello slice (`documentKindReadiness.test.ts` e `ReportsPage.documentReadiness.test.tsx`):
- Eseguono i componenti e le factory reali senza mock tautologici;
- Utilizzano componenti reali catturando unicamente i confini di salvataggio file (`saveAs`, `jsPDF.save`);
- Verificano le emissioni reali su disco temporaneo;
- Coprono tutti i rami di errore e le chiamate forzate programmatiche;
- Classificazione: **`TEST_HARNESS_REVIEW = PASS_HIGH_CONFIDENCE`**.

---

## 27. Closed-Slice Regressions

L'esecuzione completa delle suite di regressione ha confermato:
- `tsc --noEmit`: 0 errori;
- Targeted test suite (document readiness): 81/81 pass;
- Closed slices regressions (FAD XLSX, Fund Summary PDF, Closure Readiness, Distribution Budget/Draft, Cabina): 135/135 pass;
- Test storici Determina Art. 79, Document Presenter, ReportsPage Closed: 8/8 pass;
- `git diff --check`: pulito, zero warning;
- Zero regressioni su `DATA-02`, `CALC-02`, `NORM-01`, `CABINA_BLOCKING`, `DISTRIBUTION_EXPLICIT_DRAFT`, `CLOSURE_INSTRUCTION_READINESS`.

---

## 28. Scope Integrity

I file modificati nello slice sono esattamente gli 8 dichiarati:
- `src/pages/ReportsPage.tsx`
- `src/services/documents/documentFactory.ts`
- `src/services/reportService.ts`
- `src/services/documents/pdfReportService.ts`
- `src/services/documents/xlsReportService.ts`
- `src/services/documents/pdfDeterminaService.ts`
- `src/services/templates/determinaTemplateV2.ts`
- `src/services/templates/relazioneTecnicaTemplate.ts`

Tutti gli altri moduli sensibili (`documentProjection`, `canonicalFundLedger`, `fundEngine`, `yearClosureWorkflow`, `Cabina`, `Distribuzione`, `Auth`, migrazioni Supabase e `Tabella15`) sono rimasti intatti e conformi.

---

## 29. DOC-02 Closure Decision

Tutti i 12 criteri di chiusura sono stati rigorosamente soddisfatti:
1. 5 entrypoint censiti e controllati;
2. Zero bypass finali attivi;
3. Preview disponibile quando tecnicamente costruibile;
4. Tripla barriera di guardia attiva (UI, handler, service/factory);
5. Blocco universale per ogni criticità `BLOCKING`;
6. Nessun blocco indebito per soli `WARNING`;
7. Nessuna inferenza automatica o invenzione di metadati amministrativi;
8. Corretta politica di placeholder per dati omessi;
9. Contratti economici canonici di Summary PDF e FAD XLSX preservati;
10. Tabella 15 e SICO isolati;
11. Ispezione dei file reali superata;
12. Test harness ad alta affidabilità.

**Decisione:** **`DOC_02_FINAL_STATUS = VERIFIED_FIXED`**.

---

## 30. Residual FUNC-02

La componente documentale di `FUNC-02` è definitivamente risolta.\
L'unica criticità residua ascrivibile all'area funzionale resta:
- **`POST_CLOSE_N_PLUS_1_NAVIGATION`**: problema di reindirizzamento post-chiusura annualità (catalog/index fetch ridondante) classificato come `CONFIRMED_NON_DESTRUCTIVE_WORKFLOW_BUG`.\
Pertanto: **`FUNC_02_FINAL_STATUS = PARTIALLY_FIXED`**.

---

## 31. Next Gate Recommendation

Procedere con lo slice dedicato alla correzione di `POST_CLOSE_N_PLUS_1_NAVIGATION` per completare la stabilizzazione dell'intero ciclo di vita annuale.\
Mantenere inalterati i vincoli offline: nessun contatto con gli ambienti remoti, nessun push/deploy/merge.
