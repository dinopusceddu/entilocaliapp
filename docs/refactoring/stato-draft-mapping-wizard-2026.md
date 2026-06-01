# Documentazione Stato Draft e Mapping Preview — Wizard Fondo 2026

In ossequio alla regola fondamentale di transizione, la gestione dello stato del nuovo Wizard 2026 e la simulazione del trasferimento dati sono stati implementati in un modulo isolato e disaccoppiato in `src/features/wizard2026/`.

## 1. File Creati

La struttura del modulo feature è la seguente:

```
src/features/wizard2026/
├── types.ts                    # Interfaccia globale Wizard2026DraftState e sotto-stati di step
├── initialState.ts             # initialWizard2026DraftState con valori null/undefined puliti
├── reducer.ts                  # Reducer locale puro per la gestione del form a step
├── selectors.ts                # Selettori puri per aggregazione controlli, errori e riepiloghi
├── validation.ts               # Servizio di validazione globale che orchestra le logiche pure
├── mappingPreview.ts           # Motore di simulazione del mapping verso i campi legacy
├── index.ts                    # Barile di esportazione globale della feature
└── __tests__/                  # Suite di unit test dedicati e isolati
    ├── reducer.test.ts
    ├── selectors.test.ts
    ├── validation.test.ts
    └── mappingPreview.test.ts
```

## 2. Struttura dello Stato Draft (`Wizard2026DraftState`)

Lo stato locale è organizzato gerarchicamente per riflettere i singoli passaggi normativi dell'istruttoria:
- `meta`: informazioni di navigazione (`currentStep`, `completedSteps`, `isPreviewMode`, `canTransferToLegacy` inizializzato a `false`).
- `ente`: dati anagrafici, presenza dirigenza e parametri di virtuosità o dissesto.
- `art23`: risorse 2016 soggette ed escluse per ricostruzione o prevalenza del limite certificato.
- `dl25`: stipendi tabellari 2023, spesa 2025, quote aderenti e flag di asseverazione revisori/atti.
- `ccnl2026`: monte salari 2021 e percentuali di applicazione dello 0,14% e 0,22%.
- `conglobamentoArt60`: dizionario dei dipendenti in FTE suddivisi per area di inquadramento.
- `straordinario`: fondi storici, correnti, economie e voci escluse per il dimensionamento tetti.
- `pnrr`: componente stabile 2016 e requisiti per la deroga del massimale 5%.
- `riepilogo`: sintesi contabile e contatori di check.

## 3. Perché non è uno Stato Parallelo Permanente e non tocca Supabase

La scelta architetturale chiave consiste nel mantenere `Wizard2026DraftState` come una struttura **strettamente temporanea in memoria (in-memory draft)**, non collegata al context globale né al database:
1. **Protezione dei dati legacy:** Qualsiasi salvataggio prematuro su `fundData` o Supabase prima della definitiva validazione utente rischierebbe di corrompere schede storiche e campi strutturati per i preesistenti flussi di calcolo.
2. **Reversibilità e dismissione:** Essendo circoscritto al ciclo di vita del contenitore wizard in modalità preview, lo stato draft potrà essere facilmente azzerato, migrato in blocco o eliminato una volta collaudata e attivata la transizione finale.

## 4. Come Funziona il Mapping Preview (`buildWizard2026LegacyMappingPreview`)

La funzione `buildWizard2026LegacyMappingPreview` ispeziona i risultati calcolati nel draft state e produce una lista descrittiva di oggetti `Wizard2026LegacyMappingPreviewItem`. 
**Nessuna azione di dispatch o scrittura viene eseguita.**

Il sistema assegna uno status semantico a ciascuna voce di destinazione:
- `READY`: Il dato è calcolato, valido e pronto ad alimentare il campo target al momento del collaudo.
- `MISSING`: Manca un parametro obbligatorio per completare la valorizzazione.
- `NOT_APPLICABLE`: L'ente non è soggetto alla specifica norma (es. incremento diretto D.L. 25 per Unioni di Comuni o 0,22% non attivato).
- `REQUIRES_REVIEW`: L'integrazione con il modello dati esistente richiede attenzione (es. l'incremento ordinario del lavoro straordinario che al momento non gode di un campo legacy canonico univoco).

### Mappature Isolate
- `dl25.result.incrementoApplicato` $\rightarrow$ `st_incrementoDL25_2025` (solo per enti `DIRECTLY_APPLICABLE`).
- `dl25.result.quotaTrasferitaAderenti` $\rightarrow$ `quotaTrasferitaAderentiDL25_2025` (per enti `TRANSFER_ONLY`).
- `ccnl2026.result.incremento022Applicato` $\rightarrow$ `vn_art58c2_CCNL2026_incremento022_MS2021`.
- `conglobamentoArt60.result.riduzioneTotale` $\rightarrow$ `st_art60c2_CCNL2026_decurtazioneIndennitaComparto`.
- `pnrr.result.incrementoApplicato` $\rightarrow$ `vn_dl13_art8c3_incrementoPNRR_max5stabile2016`.
- `straordinario.result.economieDaTrasferireVariabileUnaTantum` $\rightarrow$ `vn_art15c1m_art67c3e_risparmiStraordinario`.

## 5. Cosa Resta Legacy, Non Toccato e Non Ancora Collegato

- **Vecchio Wizard e UI:** Il flusso esistente di `DataEntryPage.tsx` e il preesistente `DatiGeneraliWizard` rimangono pienamente operativi e intoccati. Il nuovo wizard non è ancora connesso alla barra di navigazione principale né reso obbligatorio.
- **Store e Calcoli Globali:** Lo store `AppContext`, la pagina "Costituzione Fondo" e le funzioni di calcolo in `fundEngine.ts` continuano a leggere in via esclusiva il `fundData` originario, ignorando totalmente la presenza del nuovo draft state.
- **Import/Export:** Le utilità CSV, Excel e il generatore di lettere di richiesta dati non sono stati alterati.
