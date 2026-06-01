# Inquadramento Normativo COSFEL e Auto-compilazione Step 1 (MOD-006)

Questo documento descrive il funzionamento della revisione apportata allo Step 1 del wizard "Raccolta dati dell'Ente", con particolare riferimento all'integrazione di AppContext per l'auto-compilazione dei dati identificativi dell'ente e del flusso di controllo per gli enti in stato di deficitarietà strutturale ai sensi della COSFEL.

---

## 1. Revisione Estetica e Vocabolario Normativo

In conformità alle linee guida FP CGIL Lombardia, il box informativo *"Impatto della Tipologia di Ente sulla Normativa"* nello Step 1 è stato riprogettato:
- **Palette colori**: È stata rimossa la palette viola e introdotta una colorazione basata sul rosso/rosso-arancione istituzionale di FP CGIL.
- **Microcopy**: Sono state eliminate le diciture strettamente tecniche del codice (es. `DIRECTLY_APPLICABLE`, `TRANSFER_ONLY`, `NOT_APPLICABLE`). Al loro posto, si descrive l'impatto con un testo discorsivo semplice e chiaro per gli utenti sindacali e degli enti locali.

---

## 2. Integrazione con AppContext (Sola Lettura)

I campi **Denominazione Ente** e **Anno di Riferimento Istruttoria** non sono più editabili liberamente all'interno del wizard per evitare disallineamenti con lo stato globale dell'applicazione.
- La denominazione e l'anno vengono letti in sola lettura dall'Hook `useAppContext()`.
- Se nel sistema non è attivo alcun Ente o Annualità (ad esempio, all'avvio in ambienti di test non configurati), compare un banner di avviso prominente:
  > *"Nessun ente o annualità attiva rilevata. Selezionare prima l'ente e l'anno dalla dashboard o dalla sezione Enti e Annualità."*
- Se il contesto è configurato correttamente, i campi sono auto-compilati e bloccati in sola lettura, corredati da help text esplicativo:
  - *"Dato acquisito dall'Ente attivo selezionato nell'app."*
  - *"Dato acquisito dall'Annualità attiva selezionata nell'app."*

---

## 3. Flag Dirigenza e Straordinario

Nel pannello di governance, l'opzione **Ente dotato di personale Dirigente** è stata arricchita di spiegazioni:
- Viene chiarito che il flag comporta la separazione dei fondi e l'applicazione dei vincoli dell'Art. 23 comma 2 del D.Lgs. 75/2017 anche al Fondo Dirigenti 2016.
- Viene specificato che l'attivazione della gestione del Fondo Dirigenti e dei controlli correlati è legata a questo parametro.

---

## 4. Gestione COSFEL per Enti Strutturalmente Deficitari

La Commissione per la stabilità finanziaria degli enti locali (COSFEL), ai sensi del TUEL (D.Lgs. 267/2000), sottopone a rigido controllo le spese di personale degli enti dissestati o strutturalmente deficitari.

### Flusso Logico di Controllo:
1. **Definizione dello Stato**: Se l'utente seleziona la checkbox *"Strutturalmente Deficitario"* nello Step 1, compare in maniera condizionale un nuovo campo checkbox:
   - **Etichetta**: *"Approvazione COSFEL acquisita per gli incrementi del fondo"*
   - **Testo esplicativo**: *"Dichiarare se la delibera di autorizzazione COSFEL è stata formalmente ottenuta dall'ente per l'anno in corso."*
2. **Validazione e Blocco degli Incrementi Discrezionali**: Se l'ente è segnato come *Strutturalmente Deficitario* e l'approvazione COSFEL *non è acquisita*, il motore di validazione del wizard bloccherà l'avanzamento segnalando come **Errore bloccante (non validabile)** qualsiasi incremento discrezionale o facoltativo:
   - **D.L. 25/2025**: Incremento applicato (stabile) o quote trasferite.
   - **PNRR**: Incrementi in deroga per il personale PNRR stabilizzato o a tempo determinato.
   - **Fondo Straordinario**: Incrementi discrezionali/facoltativi richiesti.
3. **Warning per Incrementi Contrattuali**: Gli incrementi contrattuali di natura vincolata (es. rinnovo CCNL 2026 ordinario) non bloccano il wizard ma producono un **warning forte**:
   - *"Verificare la compatibilità dell'incremento con il regime autorizzatorio COSFEL prima di inserirlo nella costituzione del fondo."*
