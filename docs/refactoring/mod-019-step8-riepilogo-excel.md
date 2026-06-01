# Revisione Step 8 Riepilogo Preview e Import/Export Excel Dati Wizard (MOD-019)

Questo documento descrive il refactoring dello **Step 8 (Riepilogo Preview)** del wizard "Raccolta dati dell'Ente" per l'anno 2026 e l'introduzione della funzionalità di **Import/Export Excel** per la compilazione dei dati offline.

---

## 1. Revisione Step 8 Riepilogo Preview

Lo Step 8 è stato interamente riscritto per fungere da **quadro istruttorio leggibile ed orientato all'utente**, escludendo codici e chiavi tecniche interne (es. `incrementoStabile014`, `quotaTrasferitaAderentiDL25_2025`, ecc.) in favore di etichette descrittive chiare e note normative in lingua italiana.

### Sezioni Istruttorie
Lo Step 8 è organizzato in **8 sezioni** distinte:
1. **Quadro Generale dell'Ente**: anno di riferimento, denominazione, tipologia ente, presenza dirigenza, condizioni di dissesto/riequilibrio/deficitarietà e stato di autorizzazione COSFEL.
2. **Limite Art. 23, comma 2, D.Lgs. 75/2017**: limite storico 2016, adeguamento medio pro capite, limite complessivo attualizzato ed una spiegazione sintetica del significato di tale limite.
3. **D.L. 25/2025 (Capacità Incrementale)**: soglia massima teorica, risorse 2025 da sottrarre, requisiti di virtuosità, quota trasferita da aderenti e limite massimo teoricamente attivabile.
4. **Incrementi CCNL 23.02.2026**:
   - Incremento 0,14% - parte stabile (Monte Salari 2021 × 0,14% × 1);
   - Arretrati 0,14% - parte variabile una tantum (Monte Salari 2021 × 0,14% × 2);
   - Limite massimo incremento 0,22% (x2 per il 2026, x1 dal 2027);
   - Quota 0,22% destinata al Fondo risorse decentrate e quota destinata alle Elevate Qualificazioni (in base al riparto proporzionale tra FRD 2024 e EQ 2024).
   *Nota: È stato evitato qualsiasi totale cumulativo improprio tra 0,14% (stabile/arretrati) e 0,22%.*
5. **Conglobamento Indennità di Comparto (Art. 60)**: riduzione totale calcolata o consolidata, indicazione dello stato del dato (calcolato, consolidato o manuale) e spiegazione obbligatoria sul trascinamento del valore.
6. **Fondo per il Lavoro Straordinario**: fondo straordinario ordinario residuo, riduzione stabile ex art. 67, economie da riversare, risorse escluse e fondo finale soggetto al limite.
7. **Incremento PNRR (Art. 8, comma 3, D.L. 13/2023)**: limite massimo Fondo dipendenti, limite massimo Fondo dirigenza, totale massimo teorico e avviso che si tratta di risorsa esclusa dall'Art. 23. Mostra "Non applicabile" se l'ente non è soggetto attuatore PNRR.
8. **Esiti Istruttori Finali**: riassunto grafico di errori bloccanti, warning e segnalazioni con dettaglio delle anomalie ed evidenza delle norme di riferimento.

### Vincoli di Preview e Visualizzazione
* **Nessun Trasferimento Reale**: È presente un box informativo con badge "Non ancora attivo" e pulsante disabilitato per specificare che i dati calcolati sono a scopo istruttorio preliminare e non effettuano ancora la scrittura sulla Costituzione Fondo legacy.
* **Valori Non Calcolabili**: I parametri non calcolabili o indefiniti vengono mostrati come `n/d` e mai azzerati o visualizzati come `0` o `€ 0,00`.
* **Mobile First**: Tutte le card utilizzano classi utility responsive (es. `grid-cols-1 md:grid-cols-2`, `break-words`, `min-w-0`) per garantire la corretta visualizzazione degli importi anche su smartphone e tablet, evitando overflow orizzontali.

---

## 2. Import/Export Excel dati wizard

È stato aggiunto un box denominato **"Compilazione offline dei dati"** posizionato in cima allo Step 1 del wizard per consentire la gestione completa del ciclo di vita dei dati in formato Excel.

### Struttura del file Excel (Workbook)
Il file Excel generato è composto da più fogli organizzati in maniera logica per l'utente:
1. **Istruzioni**: spiegazione del funzionamento, legenda colori e regole di compilazione (valore inserito, valore facoltativo, valore calcolato).
2. **Dati Ente**: informazioni anagrafiche e condizioni preliminari.
3. **Art. 23 Limite**: parametri per il calcolo del limite storico e pro capite.
4. **D.L. 25-2025**: spesa stipendi 2023 e risorse stabili 2025.
5. **CCNL 2026**: monte salari 2021 e basi di riparto 2024.
6. **Conglobamento Art. 60**: personale in servizio al 1° gennaio 2026 e nota per inserimento manuale.
7. **Straordinario**: fondo straordinario e riduzioni stabili.
8. **PNRR**: soggetto attuatore, basi 2016 e indicatori di virtuosità finanziaria.
9. **Riepilogo Calcolato** *(incluso solo in caso di esportazione dei dati già inseriti)*: un foglio di sola lettura che elenca in italiano tutti gli importi risultanti, la loro rilevanza ai fini dell'Art. 23 e la futura destinazione prevista.

### Principio delle Etichette Leggibili e Resilienza
* **Etichette in Italiano**: Nessuna chiave tecnica interna (es. `st_incrementoDL25_2025`) è visibile all'utente. Tutte le voci mostrano descrizioni chiare.
* **Colonna E Nascosta**: Per consentire l'importazione automatica senza forzare l'utente a conoscere le variabili del codice, ciascun foglio contiene nella **Colonna E** la chiave tecnica interna (es. `ente.entityType`). Questa colonna è impostata come **nascosta (hidden)** all'apertura del file, preservando la pulizia visiva per l'utente.
* **Menu a tendina (Data Validation)**: I campi di tipo booleano contengono una tendina precompilata con "Sì" e "No". I campi a selezione multipla contengono le opzioni permesse (es. tipologie di ente, modalità di calcolo).
* **Celle Colorate e Protette**: Le celle editabili obbligatorie sono colorate in arancio tenue (coerente con la palette FP CGIL), le facoltative sono bianche, e quelle di sola lettura o calcolate sono colorate in grigio chiaro.

### Validazione all'Importazione
Durante il caricamento del file Excel compilato, l'applicazione esegue i seguenti passaggi:
1. **Controllo Struttura**: verifica che tutti i fogli fondamentali definiti nello schema siano presenti nel workbook, altrimenti rifiuta il file con un messaggio d'errore.
2. **Scansione e Parsing**: legge le chiavi tecniche nella colonna E nascosta e mappa i valori della colonna C allo stato del wizard.
3. **Conversione dei Tipi**:
   - I booleani "Sì"/"No" vengono convertiti in `true`/`false`.
   - I numeri immessi come testo o con formattazioni regionali italiane (es. virgola per i decimali) vengono convertiti in float standard.
   - Le etichette descrittive delle select (es. "Comune" per la tipologia ente) vengono tradotte nei rispettivi codici interni (es. `COMUNE`).
4. **Report di Esito**: Viene mostrato un modale di riepilogo con:
   - Numero di campi importati con successo.
   - Numero di campi ignorati (celle calcolate o non editabili).
   - **Warning**: segnalazione di campi obbligatori lasciati vuoti.
   - **Errori**: valori con formato errato (es. testo inserito in un campo numerico). L'importazione non si blocca per singoli errori di formato ma imposta il campo a `undefined` segnalando l'errore all'utente per permettergli di correggerlo manualmente nel wizard.

---

## 3. Persistenza dei dati

La persistenza dello stato è garantita durante la navigazione interna del wizard (da Step 1 a Step 8 e viceversa):
* Il reducer (`wizard2026Reducer`) e l'hook draft (`useWizard2026Draft`) mantengono centralizzato lo stato.
* Il cambio di step avviene modificando la proprietà `meta.currentStep` senza effettuare alcun reset dei dati compilati o calcolati.
* L'azione di importazione Excel aggiorna in blocco le sole celle editabili (`IMPORT_EXCEL_DATA`), lasciando che gli effetti di calcolo integrati nel hook ricalcolino automaticamente tutti i risultati correlati.
