# Manuale Operativo di Verifica e Validazione Utente — Wizard 2026 Preview

Questo documento fornisce all'utente finale (funzionario, revisore o collaudatore) una guida operativa e strutturata per la verifica manuale sul campo del nuovo **Wizard Istruttorio 2026**, accessibile in anteprima sperimentale isolata.

---

## 1. Scopo della Verifica Manuale Utente

Lo scopo di questa fase è accertare l'usabilità, la chiarezza espositiva e la rispondenza alle esigenze operative quotidiane di ciascun passaggio istruttorio del nuovo wizard. Il collaudo utente mira a raccogliere osservazioni mirate, individuare eventuali ambiguità terminologiche o lacune informative e strutturare un elenco di modifiche prima di procedere al collegamento reale con la sezione "Costituzione Fondo" o al salvataggio permanente.

---

## 2. Regola Fondamentale di Transizione

> **Invarianza del sistema in produzione:** Durante l'intera esecuzione delle verifiche utente, la sezione canonica "Costituzione Fondo" e il vecchio wizard rimangono attivi, funzionanti e del tutto inalterati. Nessun dato inserito nell'anteprima 2026 modificherà i calcoli legacy o il database gestionale dell'ente.

---

## 3. Come Avviare la Preview (FASE 2, Punti 1-4)

Per accedere alla modalità di verifica interattiva:
1. Verificare che nel file di configurazione d'ambiente `.env` sia abilitato il feature flag sperimentale:
   ```env
   VITE_ENABLE_WIZARD_2026_PREVIEW=true
   ```
2. Avviare o mantenere in esecuzione l'applicazione in ambiente di sviluppo locale:
   ```bash
   npm run dev
   ```
3. Nel browser, aprire direttamente il percorso:
   ```url
   http://localhost:5000/wizard-2026-preview
   ```
4. Accertare visivamente la comparsa in testa all'interfaccia dell'avviso di sicurezza in campo viola:
   > *"Modalità preview sperimentale. I dati inseriti non modificano il vecchio wizard, non aggiornano la Costituzione Fondo e non vengono salvati."*
5. Verificare nello Step 8 e nel Summary Panel laterale che il pulsante finale di riversamento riporti l'etichetta *"Trasferimento non ancora attivo"* e sia inequivocabilmente disabilitato.

---

## 4. Percorso Consigliato di Verifica

Si suggerisce di percorrere il wizard in sequenza da Step 1 a Step 8, simulando una reale istruttoria di costituzione del fondo per l'anno contrattuale 2026. Al termine di ogni scheda, utilizzare i criteri di valutazione e la scheda di osservazione per annotare impressioni e richieste di variazione.

---

## 5. Checklist Operativa per Ogni Step (FASE 2, Punto 5)

Per ciascun campo e sezione incontrati, l'utente è invitato a verificare e spuntare i seguenti quesiti di qualità:
- [ ] Il dato richiesto in input è immediatamente comprensibile?
- [ ] Le didascalie e le note esplicative di supporto sono sufficienti ed esaurienti?
- [ ] I riferimenti di legge e gli articoli contrattuali citati sono pertinenti e chiari?
- [ ] Le formule matematiche applicate dal motore di calcolo sono visibili e intellegibili?
- [ ] Il risultato intermedio o totale visualizzato a video è chiaro e inequivocabile?
- [ ] Eventuali avvisi (warning) o blocchi d'errore (error) compaiono correttamente quando si superano le soglie di legge?
- [ ] Manca qualche parametro o dato fondamentale per l'istruttoria dell'ente?
- [ ] Sono presenti campi ridondanti o non necessari alla determinazione delle grandezze?
- [ ] La sequenza logica ed ergonomica degli step rispecchia il normale flusso di lavoro contabile?
- [ ] La tabella di riepilogo generale nello Step 8 e nel cassetto di "Mapping Preview" è direttamente fruibile?

---

## 6. Checklist Specifica per Step Istruttorio (FASE 3)

### Step 1 — Ente e Condizioni Preliminari
- [ ] Le tipologie di ente territoriale o strumentale selezionabili in tendina sono sufficienti per censire la propria casistica?
- [ ] È chiara la motivazione per cui si richiede la presenza o assenza di personale dirigente (impatto sulla determinazione del limite di straordinario e Art. 23)?
- [ ] È chiaro il motivo per cui vengono indagate le condizioni di dissesto, piano di riequilibrio e deficitarietà strutturale?
- [ ] È evidente il nesso di condizionalità tra questi parametri di virtuosità e l'ammissione all'incremento diretto previsto dal D.L. 25/2025?

### Step 2 — Art. 23, comma 2, D.Lgs. 75/2017
- [ ] I 5 sottofondi storici del 2016 richiesti per la ricostruzione del tetto sono completi ed esaurienti?
- [ ] L'opzione e il funzionamento del "Limite 2016 Certificato dall'Ente" sono illustrati con la dovuta chiarezza?
- [ ] Si coglie in modo inequivocabile la prevalenza gerarchica del limite certificato rispetto alla somma ricostruita dei singoli sottofondi?
- [ ] La dicotomia tra "Risorse Soggette" e "Risorse Escluse" attuali è sufficientemente trasparente per il compilatore?
- [ ] La visualizzazione in tempo reale del margine disponibile (o dell'eventuale superamento del tetto) risulta efficace e di supporto decisionale?

### Step 3 — D.L. 25/2025
- [ ] È chiaro all'operatore che la grandezza di base per il calcolo della soglia 48% è costituita dagli stipendi tabellari 2023 del personale non dirigente?
- [ ] È chiaro che per questo specifico istituto non si deve utilizzare il Monte Salari 2021?
- [ ] La netta separazione concettuale e procedurale tra "Applicazione Diretta" (Comuni, Province, ecc.) e "Quota Trasferita" (Unioni e Comunità montane) è percepibile?
- [ ] Per gli enti classificati in status `TRANSFER_ONLY`, è palese la ragione per cui la capienza diretta viene azzerata e si richiedono gli atti di asseverazione dei Comuni aderenti?
- [ ] Per gli enti strumentali in status `NOT_APPLICABLE` (es. Camere di Commercio), il messaggio di esclusione normativa risulta perentorio e motivato?

### Step 4 — Incrementi CCNL 2026
- [ ] La formula e l'esito della quota stabile dello 0,14% sono di immediata lettura?
- [ ] I criteri e l'esito della quota variabile facoltativa dello 0,22% risultano lineari?
- [ ] È evidente all'operatore che la base di computo per ambedue le percentuali è il Monte Salari 2021?
- [ ] Lo slider o campo di input per modulare la percentuale applicata (da 0% a 100%) sullo 0,22% si dimostra ergonomico e reattivo?

### Step 5 — Conglobamento Art. 60
- [ ] È del tutto trasparente che i coefficienti unitari indicati per le 4 aree contrattuali rappresentano importi già annualizzati su 12 mensilità?
- [ ] È chiaro all'utente che non occorre eseguire alcuna moltiplicazione per 12 sul risultato?
- [ ] L'immissione aggregata tramite il numero di Full Time Equivalents (FTE) per area professionale è adatta e sufficiente per la compilazione?
- [ ] Risulterebbe utile o necessaria l'introduzione opzionale di un cruscotto di censimento analitico per singolo nominativo di dipendente?
- [ ] Il riepilogo parziale delle riduzioni stabili per singola area è di facile consultazione?

### Step 6 — Fondo Lavoro Straordinario
- [ ] La separazione temporale e contabile tra fondo straordinario 2016 e stanziamento ordinario dell'anno in corso è espressa in modo intellegibile?
- [ ] La distinzione tra l'incremento ordinario richiesto e la ricognizione delle economie dell'esercizio precedente è trasparente?
- [ ] Le due opposte regole di finanziamento (margine Art. 23 per enti con dirigenza vs corrispondente riduzione stabile del fondo decentrato per enti privi di dirigenza) sono veicolate con precisione?
- [ ] L'avviso secondo cui le economie affluiscono a risorse variabili una tantum (e non consolidano lo stanziamento stabile) è ben messo in luce?
- [ ] Le causali di esenzione per straordinari elettorali, calamità naturali e censimenti sono debitamente valorizzabili in UI?

### Step 7 — PNRR
- [ ] È chiaro che il massimale teorico di incremento in deroga è pari esattamente al 5% della componente stabile del fondo 2016?
- [ ] Il legame logico e contabile con la base del 2016 è esplicitato a video?
- [ ] Le asseverazioni obbligatorie (equilibrio di bilancio e verifica preventiva dei requisiti di virtuosità) espresse sotto forma di interruttori (switch/checkbox) sono adeguate?
- [ ] Si riterrebbe opportuno aggiungere un campo di testo libero per l'annotazione degli estremi delle delibere o note del collegio dei revisori?

### Step 8 — Riepilogo Preview e Mappatura
- [ ] La schermata conclusiva offre una sinossi organica e leggibile di tutti i sottofondi calcolati in anteprima?
- [ ] Il pannello a comparsa "Mapping Preview" risulta intellegibile anche per un revisore o ispettore contabile?
- [ ] La semantica degli stati di trasferimento (`READY`, `MISSING`, `REQUIRES_REVIEW`, `NOT_APPLICABLE`) è inequivocabile?
- [ ] Sarebbe gradita la presenza di filtri veloci per isolare con un clic le sole voci in anomalia o in stato di revisione?
- [ ] Si avverte l'esigenza di un pulsante di esportazione istantanea (in formato PDF o foglio di calcolo Excel/CSV) del prospetto riepilogativo di collaudo?
- [ ] È ribadito a sufficienza che la sessione corrente ha carattere unicamente simulativo e non altera la contabilità canonica dell'ente?

---

## 7. Scheda per Annotare Osservazioni e Proporre Modifiche

Durante o al termine dell'ispezione, l'operatore può avvalersi del seguente schema per la raccolta ordinata dei feedback da registrare successivamente nel documento di tracciamento delle modifiche (`modifiche-richieste-utente-wizard-2026.md`):

```markdown
### Scheda di Segnalazione Feedback
- **Step / Sezione:** [es. Step 4 — CCNL 2026]
- **Tipologia di Rilievo:** [es. Dicitura poco chiara / Richiesta nuovo campo]
- **Descrizione dell'Osservazione:** [es. La formula dello 0,22% non mostra il valore intermedio calcolato prima dell'applicazione della percentuale.]
- **Soluzione o Variazione Proposta:** [es. Inserire una riga di dettaglio che rechi la dicitura "Incremento Massimo Teorico 0,22% = € X,XX".]
- **Impatto Stimato:** [es. Solo UI ed etichette testo]
```

---

## 8. Criteri di Classificazione delle Modifiche

Per assicurare un flusso di lavoro ordinato e protetto, ogni segnalazione utente dovrà essere inquadrata secondo una precisa tassonomia:
- **Normativa:** Rilievi attinenti a una scorretta o parziale interpretazione del dettato legislativo e contrattuale.
- **Di Calcolo:** Segnalazioni di errori algoritmici, arrotondamenti non conformi o errata applicazione di formule matematiche.
- **Di UI / Testo:** Proposte di variazione di etichette, titoli, note descrittive, formattazione di valute o disposizione cromatica.
- **Di Mapping:** Necessità di ridefinire l'associazione tra le grandezze calcolate in preview e i campi di destinazione del database di produzione (`FundData`).
- **Di Ergonomia:** Suggerimenti per snellire la compilazione, aggiungere filtri, pulsanti di reset o funzionalità di esportazione.
- **Di Sicurezza / Isolamento:** Interventi volti a rafforzare le tutele contro il salvataggio accidentale o l'alterazione di dati operativi.
- **Di Futura Integrazione:** Specifiche architetturali in preparazione dello sblocco del trasferimento reale verso la pagina Costituzione Fondo.

---

## 9. Regole di Blocco e Salvaguardia (Governance dell'Implementazione)

A garanzia della totale stabilità del software:
1. **Divieto di intervento non approvato:** Nessun programmatore o agente di sviluppo è autorizzato a modificare il codice applicativo, le funzioni pure o i componenti React sulla base di impressioni informali. Qualsiasi variazione deve transitare preventivamente dall'approvazione esplicita e formale del committente/utente nel registro dedicato.
2. **Precedenza alla conformità:** Le correzioni di natura normativa e di calcolo hanno priorità assoluta su qualsiasi miglioria estetica.
3. **Isolamento invariabile:** Le modifiche di UI non devono in alcun caso alterare le funzioni pure di calcolo `src/logic/wizard2026/` né inquinare i moduli legacy del sistema.
