# Interfaccia Utente Preview del Wizard Istruttorio 2026

In aderenza alla **regola fondamentale di transizione**, l'interfaccia React del nuovo Wizard Istruttorio 2026 è stata interamente progettata e implementata come un ecosistema isolato in `src/features/wizard2026/`.

## 1. File e Componenti Creati

### Hook e Motore di Gestione
- `useWizard2026Draft.ts`: un custom hook locale basato su `useReducer` che gestisce le transizioni dello stato di bozza locale (`Wizard2026DraftState`) e innesca automaticamente l'esecuzione delle funzioni pure di calcolo e validazione ad ogni variazione dei parametri istruttori.

### Componenti Comuni e di Struttura (`components/`)
- `Wizard2026Layout.tsx`: struttura generale della pagina con banner fisso di avviso della modalità preview, barra di navigazione a stepper superiore e layout a due colonne (corpo istruttorio e sidebar riepilogativa).
- `Wizard2026Stepper.tsx`: barra interattiva con indicatori di stato (corrente, completato, errore, avviso) per spostarsi agevolmente tra gli 8 passaggi normativi.
- `Wizard2026StepHeader.tsx`: testata standard per i singoli step con titoli, sottotitoli e inquadramento normativo.
- `Wizard2026InfoBox.tsx`: riquadro di documentazione normativa e spiegazione delle regole di calcolo.
- `Wizard2026FieldHelp.tsx`: guida contestuale per ogni input con riferimenti di legge.
- `Wizard2026CheckList.tsx`: lista espandibile per la visualizzazione di errori bloccanti, warning e note informative.
- `Wizard2026ResultCard.tsx`: card contabile per mostrare con chiarezza importi calcolati e relative formule.
- `Wizard2026SummaryPanel.tsx`: pannello laterale fisso che riassume i totali contabili, il conteggio delle anomalie e la simulazione in tempo reale del riversamento nei campi legacy.
- `Wizard2026NavigationButtons.tsx`: pulsantiera inferiore per avanzare, arretrare, passare al riepilogo o azzerare la bozza.

### Componenti Istruttori a Step (`steps/`)
- `Step1EnteCondizioni.tsx`: inquadramento giuridico (`COMUNE`, `PROVINCIA`, `UNIONE_COMUNI`, ecc.) e flag di governance finanziaria.
- `Step2Art23Limite.tsx`: determinazione del limite globale 2016 per sommatoria o certificazione prevalente.
- `Step3Dl25.tsx`: calcolo della soglia 48% della spesa 2023 o gestione delle quote trasferite per le Unioni di Comuni.
- `Step4Ccnl2026.tsx`: incrementi contrattuali stabili (0,14%) e variabili (fino allo 0,22% sul Monte Salari 2021).
- `Step5ConglobamentoArt60.tsx`: inserimento del personale in FTE e calcolo della decurtazione stabile annua.
- `Step6Straordinario.tsx`: gestione dei limiti ordinari e riversamento dei risparmi pregressi in risorse variabili una tantum.
- `Step7Pnrr.tsx`: calcolo della deroga 5% per la gestione dei progetti PNRR e verifica degli equilibri pluriennali.
- `Step8RiepilogoPreview.tsx`: quadro riassuntivo e simulazione completa del mapping descrittivo.

## 2. Funzionamento della Modalità Preview

La modalità preview permette al funzionario o all'operatore di svolgere un'intera istruttoria simulata per l'anno 2026, testando in tempo reale l'impatto dei nuovi istituti normativi. In ogni momento un banner fisso rosso in testa all'applicazione ricorda all'utente la natura transitoria dell'ambiente.
> **Nota di aggiornamento:** A seguito della richiesta utente MOD-001, l'interfaccia utente ha assunto la denominazione pubblica di **"Raccolta dati dell'Ente"** e una veste grafica coerente con la palette rosso/rosso-arancio di FP CGIL Lombardia (#cc4331), pur conservando l'architettura tecnica isolata nel modulo `wizard2026`.

## 3. Isolamento dai Sistemi Legacy (Regola di Transizione)

- **Nessuna modifica al vecchio wizard:** `DataEntryPage.tsx` e il `DatiGeneraliWizard` preesistenti non sono stati in alcun modo alterati o disattivati.
- **Nessun impatto su AppContext e Costituzione Fondo:** Lo store globale, i dati `fundData` e il motore di calcolo `fundEngine.ts` continuano a funzionare regolarmente sui vecchi schemi di calcolo.
- **Nessun salvataggio persistente:** Non vi è alcuna chiamata a Supabase o scrittura in `localStorage` o `sessionStorage`. L'istruttoria vive in memoria nel contesto del componente React.

## 4. Stato Attuale e Accesso in Preview (MOD-004)

L'accesso in modalità preview è stato integrato nel menu generale e nella dashboard sotto il nome pubblico di **"Configurazione fondo"** (con badge **"Preview"**). 

Il click su questa voce apre una **Entry Page** iniziale che:
- Non visualizza la sidebar ordinaria, garantendo un'esperienza isolata e focalizzata.
- Utilizza la utility `detectFundDataPresence.ts` (in sola lettura) per verificare la presenza di dati pregressi nella Costituzione Fondo, evidenziando condizionalmente la scelta più appropriata.
- Offre due percorsi chiari all'utente:
  1. **"Vai ai dati del fondo"**: esce dalla modalità preview ed entra nella schermata di Costituzione Fondo legacy (dove la sidebar torna visibile).
  2. **"Avvia o continua Raccolta dati"**: apre il percorso guidato interno (il wizard "Raccolta dati dell'Ente") rimanendo all'interno del layout standalone privo di sidebar.
- Dispone di un'intestazione minimale con il logo FP CGIL Lombardia ed un pulsante esplicito *"Torna alla dashboard"* sempre visibile.

L'intero flusso è protetto dalla variabile d'ambiente `VITE_ENABLE_WIZARD_2026_PREVIEW`. Se disattivata, l'accesso viene bloccato con un messaggio di protezione.


## 5. Revisione UI Responsive (Mobile/Tablet First)

A seguito della modifica richiesta **MOD-002**, l'interfaccia utente di "Raccolta dati dell'Ente" è stata integralmente rivista secondo principi mobile-first e touch-friendly:
- **Layout Fluido:** Il layout si adatta in colonna singola su smartphone e tablet (`flex-col lg:flex-row`), riducendo i padding laterali dell'area di lavoro principale a risoluzioni inferiori a 1024px.
- **Banner Flessibile:** Su schermi stretti (< 640px) viene mostrato un avviso sintetico: `"Preview sperimentale: nessun dato viene salvato o trasferito."`, evitando overflow orizzontali.
- **Stepper Navigazione Collassabile:** Su mobile visualizza unicamente lo step corrente (es. `"Step 3 di 8 — D.L. 25/2025"`) e permette di espandere/collassare l'elenco completo in verticale tramite un comodo menu a tendina.
- **Pannello di Riepilogo a Comparsa (Summary Panel):** Su mobile e tablet si trasforma in una barra di riepilogo in fondo allo schermo con accordion espandibile. Mostra immediatamente errori e warning, formattando gli importi come valuta. Il blocco **Mapping Preview** all'interno del pannello è racchiuso in un tag nativo `<details>` ed è chiuso di default.
- **Mapping Preview a Schede (Card):** Sostituito il layout a tabelle larghe con schede individuali contenenti campo sorgente, campo destinazione, valore simulato, note e status testuale tradotto in italiano (**Pronto**, **Mancante**, **N/A**, **Verificare**).
- **Controlli Touch-friendly:** Tutti i pulsanti di navigazione ("Avanti", "Indietro", etc.) e i campi di input hanno un'altezza target di almeno `44px` su mobile, con label e help-text ben distanziati.
- **Card Risultati Ottimizzate:** Su schermi stretti le card dei risultati contabili presentano l'importo calcolato in primo piano e la formula dettagliata (con wrap automatico) posizionata sotto.

---

## 6. Affinamenti di Navigazione e CTA di Trasferimento (MOD-005)

A seguito del collaudo, per rendere ottimale il flusso e la chiarezza dell'anteprima:
*   **Escape standalone e ripristino sidebar**: Il pulsante *"Apri dati del fondo"* nella card di sinistra dell'Entry Page riporta l'URL del browser a `/` tramite `window.history.pushState(null, '', '/')` e cambia tab a `fondoDipendenti` (Fondo Personale), facendo riapparire la sidebar ordinaria legacy.
*   **Layout Pulsanti Entry Page**: Su desktop, il pulsante *"Apri dati del fondo"* è allineato a destra (`md:self-end` e `md:w-auto`), mentre su mobile si estende a tutta larghezza (`w-full`) per favorire il touch.
*   **CTA finale "Trasferisci i dati alla costituzione del fondo e compila"**: Sostituisce la dicitura generica *"Trasferimento al Modello di Calcolo"* nello Step 8 e nel Summary Panel. 
*   **Badge e Blocco Esplicito**: Il pulsante di riversamento rimane disabilitato con lo stato visuale spento, accompagnato dal badge ben visibile *"Non ancora attivo"* e dalle seguenti spiegazioni descrittive:
    *   *Step 8*: *"Funzione non ancora attiva: il trasferimento automatico sarà collegato solo dopo il completamento del refactoring e del collaudo del modello di calcolo."*
    *   *Summary Panel (Mobile/Compresso)*: *"Non ancora attivo: sarà disponibile dopo il refactoring."*

---

## 7. Auto-compilazione e Controlli COSFEL nello Step 1 (MOD-006)

Nello Step 1 ("Ente e condizioni preliminari") sono stati introdotti affinamenti normativi e di integrazione con il contesto globale:
*   **Auto-compilazione in sola lettura**: La Denominazione Ente e l'Anno di Riferimento Istruttoria non sono più editabili dall'utente. Vengono acquisiti automaticamente da `AppContext` (in sola lettura) e aggiornati dinamicamente. Se l'ente o l'annualità non sono impostati a sistema, viene mostrato un banner di warning e i campi restano vuoti (senza applicare default fittizi come "2026").
*   **Box Tipologia Ente in stile FP CGIL**: Il box informativo è stato riscritto con un linguaggio discorsivo privo di diciture tecniche del codice (es. `DIRECTLY_APPLICABLE`) ed è colorato coerentemente con la palette istituzionale FP CGIL Lombardia (sfondo chiaro `#fff7f5`, bordo `#f3c7bf` e testi scuri).
*   **Checkbox condizionale COSFEL**: Se l'ente dichiara lo stato di *deficitarietà strutturale*, viene visualizzata una checkbox condizionale per l'acquisizione dell'approvazione/autorizzazione COSFEL per gli incrementi del fondo. Se la deficitarietà viene deselezionata, il flag COSFEL viene automaticamente azzerato nello stato locale del wizard per prevenire warning orfani o residui incoerenti.
*   **Flusso di blocco / warning COSFEL**: Il motore di validazione applica controlli stringenti sugli enti strutturalmente deficitari sprovvisti di approvazione COSFEL, bloccando gli incrementi discrezionali (D.L. 25/2025, PNRR, straordinario facoltativo, 0.22% CCNL 2026) e generando warning per gli incrementi contrattuali di natura ordinaria/automatica.


## 8. Step 4 — Incrementi CCNL Funzioni Locali 23.2.2026 (MOD-012)

Lo Step 4 è stato riorganizzato per essere una scheda di calcolo dei limiti massimi consentiti dal CCNL 23.02.2026, eliminando qualsiasi slider per la percentuale di applicazione o checkbox di attivazione gestionale dell'incremento 0,22% variabile:
*   **Eliminazione Comandi Gestionali**: Lo slider di percentuale e il checkbox di applicazione sono stati interamente rimossi.
*   **Riorganizzazione in 4 Sezioni**:
    1.  *Sezione 1 — Base di calcolo*: Input per il Monte Salari dell'anno 2021 (personale non dirigente). Se il campo viene svuotato, viene passato `undefined` (non zero) per evidenziare il dato mancante.
    2.  *Sezione 2 — Incremento Stabile 0,14%*: Card che visualizza il valore dell'adeguamento fisso e ricorrente consolidato nel fondo decentrato ($MonteSalari2021 \times 0.14\%$).
    3.  *Sezione 3 — Limite massimo quota 0,22%*: Card che visualizza il tetto massimo teorico per le risorse variabili discrezionali ($MonteSalari2021 \times 0.22\%$). Se l'ente è strutturalmente deficitario e sprovvisto di approvazione COSFEL, la card mostra esplicitamente "Forzato a 0 per blocco COSFEL".
    4.  *Sezione 4 — Riepilogo istruttorio*: Card che mostra il "Totale Potenziale Istruttorio" (stabile + limite variabile) e un box informativo di colore rosso/corallo che avvisa l'utente del mancato trasferimento automatico del dato (la scelta effettiva spetterà alla fase di Costituzione del Fondo decentrato).
*   **Gestione Regole COSFEL per Enti Deficitari**:
    -   *COSFEL Approvata (`hasApprovazioneCosfel === true`)*: Calcola normalmente il limite massimo dello 0,22%.
    -   *COSFEL Negata (`hasApprovazioneCosfel === false`)*: Forza a zero il limite dello 0,22% e mostra un banner rosso di blocco istruttorio (`data-testid="cosfel-blocked-banner"`).
    -   *COSFEL Indefinita (`hasApprovazioneCosfel === undefined`)*: Calcola teoricamente il limite massimo dello 0,22% (non forza a zero in automatico) e mostra un banner ambra di warning (`data-testid="cosfel-missing-warning"`) specificando che l'istruttoria non è validabile.
*   **Summary Panel e Mapping Preview**:
    -   Il Summary Panel sdoppia l'esposizione del CCNL 2026 in due righe separate ("stabile" e "limite variabile").
    -   La utility `formatEur` restituisce `'n/d'` per valori indefiniti (evitando visualizzazioni di zero spuri).
    -   Nel Mapping Preview, il vecchio campo operativo `vn_art58c2_CCNL2026_incremento022_MS2021` viene impostato come `NOT_APPLICABLE`, salvaguardando il dato inserito manualmente dall'utente.
