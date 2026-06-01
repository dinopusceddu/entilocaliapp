# Report di Consegna: Preparazione alla Verifica Manuale Utente (Wizard 2026)

Il presente report attesta l'avvenuta predisposizione dell'impianto documentale a supporto della fase di **Verifica e Validazione Manuale** da parte dell'utente finale per il nuovo **Wizard Istruttorio 2026**, nel pieno rispetto della **Regola Fondamentale di Transizione**.

---

## 1. Elenco dei File Creati

A supporto dell'attività ispettiva dell'utente sono stati generati due nuovi strumenti di governance all'interno della cartella di progetto:
1. `docs/refactoring/verifica-manuale-utente-wizard-2026.md`: Il manuale operativo contenente le istruzioni di accesso, la metodologia di collaudo e le checklist di qualità articolate per singolo step istruttorio.
2. `docs/refactoring/modifiche-richieste-utente-wizard-2026.md`: Il registro ufficiale per l'annotazione, classificazione (per priorità e impatto) e autorizzazione vincolante delle richieste di intervento o di miglioria emerse a video.

---

## 2. Scopo e Valore della Verifica Manuale

La verifica sul campo offre all'utente finale (responsabile finanziario, segretario generale o revisore dei conti) l'opportunità di navigare ed esplorare in ambiente di anteprima isolata tutte le schede del nuovo contratto 2026 e D.L. 25/2025. 
Questo passaggio assicura che l'interfaccia visiva sia immediatamente chiara, le formule trasparenti e la user experience aderente ai processi reali di rendicontazione dell'ente, prevenendo modifiche affrettate al software prima che vi sia una piena consapevolezza dei requisiti operativi.

---

## 3. Guida all'Uso Sinergico dei Documenti

Durante la sessione di collaudo interattivo sulla rotta `http://localhost:5000/wizard-2026-preview`:
- **Consultare** `verifica-manuale-utente-wizard-2026.md` per seguire il percorso logico suggerito e rispondere ai quesiti mirati di controllo per ciascuno degli Step (1 - 8).
- **Compilare** in tempo reale la tabella in `modifiche-richieste-utente-wizard-2026.md`, registrando ogni osservazione, etichetta ambigua o proposta di nuova funzionalità secondo la nomenclatura standardizzata (Priorità `Alta`/`Media`/`Bassa` e Stato `Da valutare`).

---

## 4. Invarianza del Sistema e Protezione del Dominio

Si attesta in via incondizionata che nel corso della presente fase:
- **Nessun file di codice sorgente** (`.ts`, `.tsx`, `.css`) o logica di calcolo è stato modificato o sovrascritto.
- L'ambiente in produzione, la sezione **Costituzione Fondo**, lo store globale `AppContext` e l'infrastruttura di calcolo legacy (`fundEngine.ts`) non hanno subito alcuna variazione.
- **Blocco del riversamento:** Il pulsante di travaso conclusivo nello Step 8 e nel Summary Panel permane staticamente disabilitato e riporta il messaggio *"Trasferimento non ancora attivo"*. Non vi è alcun salvataggio su Supabase o `localStorage`.

---

## 5. Prossimo Passo Consigliato (Roadmap Operativa)

Una volta completata la sessione ispettiva, l'iter procedurale suggerito prevede:
1. **Riunione di Validazione:** Analisi congiunta tra utente e sviluppatore della tabella delle modifiche in `modifiche-richieste-utente-wizard-2026.md`.
2. **Approvazione Formale:** Variazione dello stato in `Approvata` per tutte e sole le righe che si intende commissionare allo sviluppo.
3. **Esecuzione in Sandbox:** Trasmissione del pacchetto di modifiche approvate all'agente AI tramite prompt mirati e successiva verifica di stabilità (`npm run test` e `npm run build`).
4. **Sblocco del Trasferimento:** Solo a valle del superamento totale e senza riserve del collaudo utente si procederà in futuro alla scrittura dell'adapter di reidratazione per riversare lo stato draft nella canonica Costituzione Fondo.
