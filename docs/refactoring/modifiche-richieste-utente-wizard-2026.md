# Registro delle Modifiche Richieste dall'Utente — Raccolta dati dell'Ente (Preview)

Questo documento costituisce il registro ufficiale e vincolante per la tracciatura, classificazione e autorizzazione di tutte le variazioni funzionali, normative ed ergonomiche emerse durante il collaudo manuale di **Raccolta dati dell'Ente** (precedentemente noto come Wizard Istruttorio 2026) in modalità anteprima sperimentale.

---

## Tabella Generale di Tracciamento Modifiche

La seguente tabella deve essere compilata o integrata dall'utente/committente al termine della sessione di verifica sul campo.

| ID | Step | Tipo modifica | Descrizione problema / osservazione | Modifica richiesta | Priorità | Impatto | Stato | Note |
|---|---|---|---|---|---|---|---|---|
| **MOD-001** | Generale / UI | UI/Testo | Il nome “Wizard Istruttorio 2026” è troppo tecnico e la palette viola non è coerente con l’identità FP CGIL Lombardia. | Rinominare la UI in “Raccolta dati dell’Ente” e adeguare i colori a una palette rosso/rosso-arancio coerente con FP CGIL Lombardia. | Alta | Solo UI | Approvata | Non modificare nomi tecnici, funzioni di calcolo, mapping, vecchio wizard o Costituzione Fondo. |
| **MOD-002** | Generale / UI responsive | UI/Testo | La grafica della “Raccolta dati dell’Ente” deve essere più facilmente utilizzabile da tablet e smartphone. | Rivedere il layout in ottica mobile/tablet first, semplificando stepper, riepilogo, card risultati, campi input, banner e mapping preview. | Alta | Solo UI | Approvata | Non modificare funzioni di calcolo, mapping, AppContext, vecchio wizard, Costituzione Fondo o trasferimento dati. |
| **MOD-003** | Generale / Lettera richiesta dati | Report/Export | La Raccolta dati dell’Ente deve permettere di generare una lettera di richiesta dati agli enti sulla base dei campi presenti nel nuovo wizard. | Inserire una funzione di generazione lettera completa, lettera solo dati mancanti e lettera per singolo step, con anteprima, copia testo e PDF. | Alta | Solo UI / Report-Export / Stato draft | Approvata | Non modificare calcoli, mapping, AppContext, Supabase, vecchio wizard o Costituzione Fondo. |
| **MOD-004** | Generale / Accesso configurazione fondo | Integrazione futura | L’accesso alla Raccolta dati dell’Ente deve diventare l’accesso sperimentale alla futura Configurazione fondo, con una pagina iniziale di scelta tra dati del fondo già presenti e wizard di raccolta dati. | Rinominare il pulsante preview in “Configurazione fondo”, creare una pagina iniziale senza sidebar con due percorsi: “Vai ai dati del fondo” e “Avvia/continua Raccolta dati dell’Ente”. Anche il wizard deve aprirsi senza sidebar e con pulsante/logo di ritorno alla dashboard. | Alta | Solo UI | Approvata | Nessun trasferimento reale, nessuna modifica ai calcoli legacy, nessuna sostituzione della vecchia configurazione fondo. |
| **MOD-005** | Generale / Navigazione e CTA finale | UI/Testo | Il pulsante “Apri dati del fondo” nella pagina Configurazione fondo preview non apre correttamente il fondo; inoltre il passaggio finale dal wizard alla Costituzione Fondo deve essere più chiaro ma restare disabilitato fino al completamento del refactoring. | Correggere la navigazione del pulsante “Apri dati del fondo”, allinearlo a destra su desktop, e sostituire la dicitura finale con “Trasferisci i dati alla costituzione del fondo e compila”, mantenendo il pulsante disabilitato con messaggio “Non ancora attivo”. | Alta | Solo UI | Approvata | Nessun trasferimento reale e nessuna modifica ai calcoli legacy. |
| **MOD-006** | Step 1 — Ente e condizioni | Normativa/UI/Validazione | Auto-compilazione da contesto, stile FP CGIL Lombardia, dirigenza, e controlli deficitarietà strutturale e COSFEL. | Revisione Step 1 con dati in sola lettura da AppContext, spiegazione dirigenza e deficitarietà, checkbox condizionale COSFEL, errori bloccanti su incrementi discrezionali in assenza di COSFEL e warning forte su CCNL ordinario. | Alta | Stato draft / UI / Validazione | Implementata | Vedere docs/refactoring/mod-006-step1-ente-condizioni-cosfel.md |
| **MOD-007** | Step 1 — Campi Sì/No e prima fascia | UI/Testo/Validazione | Sostituire checkbox Step 1 con selettori Sì/No (tre stati), gestire correttamente false come presente (senza blocchi se non dovuti), e aggiungere il modal esplicativo prima fascia D.L. 34/2019. | Trasformare i campi booleani dello Step 1 in controlli Sì/No espliciti a 3 stati, azzerare COSFEL se non deficitari, creare il popup informativo "Cos'è?" sulla prima fascia D.L. 34/2019, distinguere false e undefined per COSFEL nelle validazioni, e aggiornare i test obbligatori. | Alta | Stato draft / UI / Validazione | Implementata | Vedere docs/refactoring/mod-007-campi-si-no-prima-fascia.md |
| **MOD-01** | Step 1 — Ente | UI/Testo | Verificare chiarezza etichetta sul parametro di virtuosità pluriennale | Valutare inserimento di tooltip informativo sui criteri D.L. 25 | Media | Solo UI | Da valutare | |
| **MOD-02** | Step 2 — Art. 23 | Validazione | Margine Art. 23 visibile ma senza evidenza cromatica sul residuo | Aggiungere colorazione (verde/arancio) per margine positivo o in esaurimento | Media | Solo UI | Da valutare | |
| **MOD-03** | Step 3 — D.L. 25 | UI/Testo | Dicitura su stipendi tabellari 2023 necessita di enfasi per evitare errori con MS 2021 | Grassetto ed etichetta esplicativa "Escluso personale dirigente e indennità" | Alta | Solo UI | Da valutare | |
| **MOD-04** | Step 4 — CCNL 2026 | UI/Testo | Slider della percentuale 0,22% privo di pulsanti per step precisi (+/- 5%) | Aggiungere controlli numerici incrementali a fianco dello slider | Bassa | Solo UI | Da valutare | |
| **MOD-05** | Step 5 — Art. 60 | UI/Testo | I coefficienti unitari annui mostrati non esplicitano chiaramente che sono su 12 mesi | Inserire badge testuale "Valori annui pre-calcolati (non moltiplicare per 12)" | Alta | Solo UI | Da valutare | |
| **MOD-06** | Step 6 — Straord. | Campo mancante | Occorre spazio per annotare causali specifiche su risorse escluse | Valutare campo note testuale opzionale in calce alle detrazioni | Bassa | Stato draft | Da valutare | |
| **MOD-07** | Step 7 — PNRR | Integrazione futura | Asseverazione equilibri per ora gestita solo tramite switch booleano | Prevedere in futuro l'upload o citazione estremi verbale revisori | Media | Integrazione futura | Da valutare | |
| **MOD-08** | Step 8 — Riepilogo | Report/Export | Assenza di funzionalità per esportare e stampare il prospetto di collaudo | Implementare pulsante "Esporta PDF / Excel" per i revisori | Alta | Report/Export | Da valutare | |
| **MOD-09** | Riepilogo generale | Mapping | Ispezione globale del pannello laterale di Mapping Preview | Confermare quadratura e assenza di conflitti con campi legacy | Alta | Mapping preview | Da valutare | |
| **MOD-008** | Step 2 — Art. 23 | UI/Restyling | Restyling grafico Step 2 con palette FP CGIL Lombardia | Uniformare colori, card, variante success, card risultato finale, badge, layout griglia e intestazione ai canoni FP CGIL | Alta | Solo UI | Implementata | Vedere docs/refactoring/mod-008-step2-limite-art23-attualizzato.md |
| **MOD-009** | Step 2 — Art. 23 | Campo/Calcolo | Calcolo automatico dipendenti equivalenti Art. 23 da tabelle | Aggiungere sezioni di calcolo da tabella con modalità manuale/automatica, FTE e personalePiao, con fallback su inserimento manuale | Alta | Stato draft / UI / Calcolo | Implementata | Vedere docs/refactoring/mod-009-step2-calcolo-automatico-personale-art23.md |
| **MOD-010** | Step 2 — Art. 23 | UI/Restyling | Restyling grafico Step 2 Art. 23 con palette FP CGIL Lombardia | Uniformare palette, spaziature, card variante success in verde solo per stati semantici, card risultato finale prominente, badge corretti | Alta | Solo UI | Implementata | Vedere docs/refactoring/ui-preview-wizard-2026.md |
| **MOD-011** | Step 3 — D.L. 25/2025 | Normativa/UI | Trasformazione Step 3 da form semplice a pagina istruttoria completa | Sezioni applicabilità, virtuosità, calcolo, sostenibilità, unioni, esito; logica dati mancanti ≠ zero; blocchi normativi; verifica COSFEL; fascia demografica | Alta | Stato draft / UI / Calcolo / Validazione | Implementata | Vedere docs/refactoring/mod-011-ter-correzioni-step3-dl25.md |
| **MOD-011-bis** | Step 3 — D.L. 25/2025 | Normativa/UI | Revisione sostanziale Step 3 — Istruttoria completa D.L. 25/2025 | Applicabilità soggettiva, virtuosità D.M. 17.03.2020, calcolo 48%, sostenibilità, unioni/CM con quote, mapping preview | Alta | Stato draft / UI / Calcolo | Implementata | Vedere docs/refactoring/mod-011-ter-correzioni-step3-dl25.md |
| **MOD-011-ter** | Step 3 — D.L. 25/2025 | Correzione/Completamento | Correzioni puntuali dopo collaudo MOD-011-bis: banner blocco dettagliato, warning COSFEL mancante, COSFEL input, altreRisorse2025, estremi revisori, base limite storico, scostamento, quota non iscrivibile, costi lordi, tabella quote estesa, catalogo lettera | Implementare le 15 anomalie elencate nel collaudo manuale | Alta | Stato draft / UI / Lettera | Implementata | Vedere docs/refactoring/mod-011-ter-correzioni-step3-dl25.md |
| **MOD-012** | Step 4 — CCNL 2026 | Normativa/UI/Calcolo | Rimozione slider/attivazione, suddivisione in 4 sezioni (base, stabile, limite 0.22%, riepilogo), e regole COSFEL differenziate per l'azzeramento del limite dello 0.22% | Ristrutturare lo Step 4 come scheda di calcolo dei limiti massimi (stabile e limite 0.22% variabile) sul Monte Salari 2021, con logica COSFEL per l'azzeramento (true: calcola, false: zero, undefined: calcola con warning forte), visualizzazione 'n/d' per dati mancanti e mapping legacy disattivato | Alta | Stato draft / UI / Calcolo / Lettera | Implementata | Vedere docs/refactoring/mod-012-step4-incrementi-ccnl-2026.md |
| **MOD-021** | Step 8 — Riepilogo | Mapping | Fase ponte / preview trasferimento tra Wizard 2026 e Costituzione Fondo. | Creare motore di trasferimento in sola preview con tabella delta prima/dopo, classificazione Art. 23 e mitigazione dei rischi dei useEffect legacy. | Alta | Mapping preview | Implementata | Vedere docs/refactoring/mod-021-transfer-preview-wizard-costituzione-fondo.md |
| **MOD-022** | Step 8 / Trasferimento | Mapping / Futuro trasferimento | Attivazione controllata del trasferimento dal Wizard 2026 alla Costituzione Fondo | Implementare il pulsante finale attivo protetto da modale di conferma delta con checkbox, snapshot locale e rollback, navigazione finale e conservazione dei vecchi wizard | Alta | Futuro trasferimento | Implementata | Vedere docs/refactoring/mod-022-trasferimento-controllato-wizard-costituzione-fondo.md |

---

## Nomenclatura e Vocabolario Ammesso

### Valori Ammessi per "Tipo modifica":
- `Normativa`
- `Calcolo`
- `UI/Testo`
- `Campo mancante`
- `Campo ridondante`
- `Mapping`
- `Validazione`
- `Riepilogo`
- `Accessibilità`
- `Report/Export`
- `Integrazione futura`

### Valori Ammessi per "Priorità":
- `Alta`
- `Media`
- `Bassa`

### Valori Ammessi per "Impatto":
- `Solo UI`
- `Funzione pura`
- `Stato draft`
- `Mapping preview`
- `Futuro trasferimento`
- `Legacy da non toccare`

### Valori Ammessi per "Stato":
- `Da valutare`
- `Approvata`
- `Respinta`
- `Da chiarire`
- `Implementata`
- `Rinviata`

---

## Regole per l'Implementazione delle Modifiche (FASE 5)

A garanzia della più rigorosa governance del progetto e per prevenire regressioni, i tecnici e gli sviluppatori devono attenersi alle seguenti direttive inderogabili:
1. **Vincolo di Approvazione Utente:** Nessuna delle modifiche elencate in tabella deve essere tradotta in codice finché l'utente finale o il responsabile di progetto non ne abbia formalizzato l'approvazione variando lo stato in `Approvata`.
2. **Priorità di Esecuzione:** Gli interventi classificati come `Normativa` o di `Calcolo` possiedono priorità di implementazione e collaudo rispetto alle migliorie estetiche (`UI/Testo` o `Ergonomia`).
3. **Integrità Algoritmica:** Le modifiche all'interfaccia visiva non devono in alcun modo alterare la purezza e l'idempotenza delle funzioni di calcolo residenti in `src/logic/wizard2026/`.
4. **Protezione dei Dati:** Gli affinamenti al sistema di mapping non devono ancora abilitare il trasferimento reale o la sovrascrittura di entità verso il database o lo store di Costituzione Fondo (`FundData`).
5. **Continuità Legacy:** Il vecchio wizard e i moduli legacy oggi in produzione permangono attivi, intoccati e operativi fino alla deliberazione formale di rimpiazzo conclusivo.
6. **Esecuzione Isolata per Gruppi:** Ogni blocco omogeneo di modifiche approvate dovrà essere commissionato al team o all'agente di sviluppo mediante un prompt e un task separato.
7. **Verifica Obbligatoria:** Al completamento di ogni iterazione di sviluppo, è prescritta l'esecuzione inderogabile dell'intera suite di collaudo (`npm run test`) e la generazione di una build pulita (`npm run build`) per verificare l'assenza di effetti collaterali.
