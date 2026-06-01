# Collaudo Responsive — Raccolta dati dell’Ente

Questo documento fornisce la checklist operativa e le linee guida per la verifica manuale e l'audit visivo del modulo "Raccolta dati dell'Ente" (in preview sperimentale) a diverse risoluzioni, garantendo l'approccio mobile-first richiesto dall'utente.

## 1. Dispositivi e Risoluzioni di Riferimento

Le verifiche devono essere condotte simulando (tramite DevTools del browser o dispositivi fisici) i seguenti breakpoint:
- **Smartphone Stretti (360px - 390px):** es. Samsung Galaxy S8, iPhone 12 Pro.
- **Smartphone Standard (412px - 430px):** es. Pixel 7, iPhone 14 Pro Max.
- **Tablet Portabile (768px):** es. iPad Mini, iPad (verticale).
- **Tablet Standard / Desktop Basso (1024px):** es. iPad Pro, Laptop standard.
- **Desktop Standard (1280px - 1440px+):** Schermi desktop.

---

## 2. Checklist di Collaudo per Componente

### A. Banner di Avviso Preview (in alto)
- [ ] **Smartphone (< 640px):** Il banner mostra la dicitura corta: `"Preview sperimentale: nessun dato viene salvato o trasferito."` su due righe o singola riga compatta, senza causare overflow orizzontale. La dimensione del font è `text-xs`.
- [ ] **Desktop (>= 640px):** Il banner mostra il testo informativo completo: `"Raccolta dati dell’Ente — modalità preview sperimentale. I dati inseriti non modificano il vecchio wizard, non aggiornano la Costituzione Fondo e non vengono salvati."`
- [ ] Il colore di sfondo è rosso FP CGIL (`#cc4331`) con testo chiaro e icona `AlertCircle` pulsante.

### B. Stepper Navigazione
- [ ] **Smartphone & Tablet (< 1024px):**
  - Mostra l'intestazione compatta: `"Step X di 8"` e il titolo dello step corrente (es. `"Limite art. 23"`).
  - Un pulsante `"Elenco step"` con icona Chevron (Down/Up) apre/chiude l'elenco completo in verticale.
  - Cliccando su uno step dell'elenco, la navigazione avviene correttamente e il menu a tendina si chiude automaticamente.
  - Le etichette degli step mostrate sono quelle abbreviate prescritte: *Ente, Art. 23, D.L. 25, CCNL 2026, Art. 60, Straordinario, PNRR, Riepilogo*.
- [ ] **Desktop (>= 1024px):**
  - Lo stepper è visibile per intero in orizzontale.
  - Le etichette visualizzate sono quelle estese per massima chiarezza.
  - La linea di avanzamento collega correttamente gli step.

### C. Layout Principale e Spaziature
- [ ] **Smartphone & Tablet (< 1024px):**
  - Il layout si dispone su una sola colonna.
  - Il margine esterno è ridotto a `px-2` o `px-4` per massimizzare lo spazio dell'area di lavoro.
  - Il padding interno del contenitore principale è ridotto a `p-4` per non stringere eccessivamente i campi di input.
  - Il Summary Panel si posiziona **sotto** il contenuto dello step corrente, comportandosi come blocco collassabile.
- [ ] **Desktop (>= 1024px):**
  - Il layout è a due colonne (`flex-row` con `lg:w-96` per il Summary Panel).
  - Il Summary Panel è una sidebar fissa e non collassabile, sempre visibile a destra.

### D. Campi Input e Touch-friendliness
- [ ] Tutti gli input numerici e a scelta (select/checkbox/radio) hanno un'altezza touch-friendly di circa `44px` (classe `h-11` o padding adeguato).
- [ ] Le label di ogni campo rimangono sempre visibili sopra l'input e non vengono mai troncate o sovrapposte.
- [ ] Gli help-text informativi sono posizionati chiaramente sotto il relativo campo di input, scritti in formato leggibile ed esplicativo.
- [ ] Da mobile/tablet, i campi multipli si dispongono in colonna singola per evitare restringimenti orizzontali.

### E. Card Risultati (Risultati Calcolati)
- [ ] Su smartphone le card si dispongono in colonna singola (stack verticale).
- [ ] Il valore del risultato (importo) viene posizionato **in primo piano** (sopra la formula), ben visibile in font grande (`text-2xl` / `text-3xl`).
- [ ] La formula e la spiegazione testuale sono posizionate sotto il valore.
- [ ] Le formule lunghe usano la classe `break-all` per evitare overflow orizzontale e si avvalgono di un'etichetta di testata `"Dettaglio formula"`.

### F. Summary Panel (Riepilogo Laterale/Inferiore)
- [ ] **Smartphone & Tablet (< 1024px):**
  - Si presenta come un accordion con intestazione scura che indica il numero totale di errori e avvisi.
  - Cliccando sull'intestazione, si espande per rivelare i dettagli del riepilogo.
- [ ] Gli importi visualizzati sono formattati correttamente come valuta (`€ X.XXX,XX`).
- [ ] Il pulsante di trasferimento dati è chiaramente disabilitato, di colore grigio/slate e reca la scritta `"Trasferimento non ancora attivo"`.
- [ ] Il blocco **Mapping Preview** all'interno del pannello è racchiuso in un tag `<details>` ed è **chiuso di default** per evitare spreco di spazio verticale.

### G. Mapping Preview Dettagliato (Step 8 e Summary Panel)
- [ ] Su smartphone non sono presenti tabelle larghe a più colonne.
- [ ] Ogni riga di mapping è trasformata in una card con:
  - Indicazione esplicita del campo sorgente e del campo destinazione legacy.
  - Valore simulato ben formattato.
  - Lo status (READY, MISSING, ecc.) è tradotto con etichette testuali in italiano: **Pronto**, **Mancante**, **N/A**, **Verificare**.
  - La nota esplicativa del mapping è visibile sotto i campi.

---

## 3. Criteri di Accettazione (Zero-Tolerance)
1. **Nessun Overflow Orizzontale:** A qualsiasi risoluzione compresa tra 360px e 1920px non deve apparire la barra di scorrimento orizzontale della pagina principale.
2. **Accessibilità Visiva:** Gli stati READY (verde), MISSING (rosso), REQUIRES_REVIEW (arancione) devono essere distinguibili non solo dal colore ma anche dal testo del badge.
3. **Touch Targets:** Tutti i pulsanti di navigazione ("Avanti", "Indietro", "Vai al riepilogo", "Reset preview") e i controlli di step sullo smartphone devono avere un target di click non inferiore a `44px` di altezza per agevolare l'uso con un solo dito.
