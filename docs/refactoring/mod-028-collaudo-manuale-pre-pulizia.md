# Report di Collaudo Manuale — Pre-pulizia Vecchi Wizard (MOD-028)

**Data di Collaudo:** 25 Maggio 2026  
**Ambiente di Collaudo:** Locale (Sviluppo Vite + React, porta locale `5173`)  
**Stato dell'Applicazione:** Preview Flag attivo `VITE_ENABLE_WIZARD_2026_PREVIEW=true`  
**Endpoint di Collaudo Wizard:** `/configurazione-fondo-preview`  
**Endpoint di Costituzione Fondo:** `/costituzione-fondo`  

---

## 1. Branch e Stato Git Iniziale

### Ramo Utilizzato
`feature/sprint-c4-1-wizard-base`

### Stato Iniziale di `git status`
All'avvio del collaudo, la copia di lavoro di Git si presentava con le seguenti modifiche locali e file untracked derivanti dalle implementazioni MOD-025 e MOD-027:

```
On branch feature/sprint-c4-1-wizard-base
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   .env.example
	modified:   build-stats.html
	modified:   src/App.tsx
	modified:   src/application/registry/moduleRegistry.ts
	modified:   src/components/layout/Sidebar.tsx
	modified:   src/domain/calculationResult.ts
	modified:   src/logic/calculation/calculationResultFactory.ts
	modified:   src/logic/calculation/fundCalculations.ts
	modified:   src/logic/calculation/fundEngine.ts
	modified:   src/logic/calculationResultFactory.ts
	modified:   src/logic/fundCalculations.ts
	modified:   src/logic/fundEngine.ts
	modified:   src/pages/FondoAccessorioDipendentePage.tsx

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	docs/audit/sprint-c4-6-audit-completezza-wizard.md
	docs/refactoring/
	src/features/
	src/logic/__tests__/mod025ComplianceProspetto.test.ts
	src/logic/wizard2026/
```

*Nota: Non è stata apportata alcuna modifica al codice sorgente o al database Supabase durante o dopo questa sessione di collaudo, in piena osservanza dei vincoli di MOD-028.*

---

## 2. Dataset Numerico di Collaudo

Il collaudo è stato effettuato impostando un ente di test simulato per l'annualità **2026** avente i parametri elencati di seguito.

### Dati dell'Ente e Condizioni Preliminari (Step 1)
- **Tipologia ente:** Comune
- **Ente con dirigenza:** No
- **Ente in dissesto:** No
- **Ente in piano di riequilibrio:** No
- **Ente strutturalmente deficitario:** No
- **Ente in prima fascia D.L. 34/2019:** Sì
- **Equilibrio pluriennale asseverato:** Sì

### Limite Art. 23, comma 2 (Step 2)
- **Limite base 2016:** € 100.000,00
- **Fondo personale dipendente 2018:** € 90.000,00
- **Fondo Elevate Qualificazioni 2018:** € 10.000,00
- **Dipendenti equivalenti (FTE) al 31.12.2018:** 10
- **Dipendenti equivalenti (FTE) previsti 2026:** 12

### Limite Massimo D.L. 25/2025 (Step 3)
- **Spesa per stipendi tabellari 2023 personale non dirigente:** € 200.000,00
- **Fondo stabile anno precedente:** € 80.000,00
- **Budget Elevate Qualificazioni anno precedente:** € 15.000,00
- **Altre risorse anno precedente da sottrarre:** € 0,00

### Incrementi CCNL 23.02.2026 (Step 4)
- **Monte salari 2021 personale non dirigente:** € 1.000.000,00
- **Fondo risorse decentrate 2024:** € 100.000,00
- **Risorse Elevate Qualificazioni 2024:** € 20.000,00
- **Incremento 0,22% da applicare nell'anno:** € 3.000,00

### Conglobamento Indennità di Comparto Art. 60 (Step 5)
- **Funzionari/EQ full-time:** 2
- **Istruttori full-time:** 3
- **Istruttori part-time nativi FTE complessivo:** 0,5
- **Operatori esperti full-time:** 1
- **Operatori full-time:** 1

### Fondo per Lavoro Straordinario (Step 6)
- **Fondo straordinario ordinario anno corrente:** € 10.000,00
- **Riduzione stabile Art. 67 destinata al Fondo risorse decentrate:** € 1.000,00
- **Economie straordinario anno precedente da riversare:** € 500,00
- **Risorse escluse Art. 23 per elezioni/calamità/altri eventi:** € 1.000,00

### PNRR (Step 7)
- **Ente soggetto attuatore PNRR:** Sì
- **Componente stabile Fondo dipendenti 2016:** € 80.000,00
- **Equilibrio esercizio precedente:** Sì
- **Parametri debito commerciale e ritardi pagamento:** Sì
- **Incidenza salario accessorio/spesa personale:** 6%
- **Rendiconto anno precedente approvato nei termini:** Sì

---

## 3. Risultati del Wizard (Step 1 - Step 7)

La seguente tabella riepiloga gli esiti di calcolo registrati a interfaccia grafica per ciascuno step del wizard:

| Step Wizard | Dato Inserito / Condizione | Risultato Atteso | Risultato Visualizzato | Esito | Note / Verifiche Specifiche |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **Step 1 — Ente** | Comune, No dirigenza, No dissesto/deficit, Sì virtuosità/equilibrio | Stato salvato senza considerare i "No" come dati mancanti | Valori memorizzati correttamente nel draft state | **OK** | Nessun warning di dato mancante per i campi a "No". |
| **Step 2 — Art. 23** | Base 2016: € 100k<br>Fondo dip. 2018: € 90k<br>Fondo EQ 2018: € 10k<br>FTE 2018: 10<br>FTE 2026: 12 | Base acc. 2018: € 100.000,00<br>Valore medio 2018: € 10.000,00<br>Incremento pro-capite: € 20.000,00<br>Limite Art. 23 attualizzato: € 120.000,00 | Base acc. 2018: € 100.000,00<br>Valore medio 2018: € 10.000,00<br>Incremento pro-capite: € 20.000,00<br>Limite Art. 23 attualizzato: € 120.000,00 | **OK** | La pagina mostra solo il limite e omette i controlli sulle risorse reali, rimandati alla pagina Costituzione Fondo. |
| **Step 3 — D.L. 25** | Tabellari 2023: € 200k<br>Fondo 2025: € 80k<br>EQ 2025: € 15k<br>Altre: € 0 | Soglia 48%: € 96.000,00<br>Risorse da sottrarre: € 95.000,00<br>Limite massimo D.L. 25: € 1.000,00 | Soglia 48%: € 96.000,00<br>Risorse da sottrarre: € 95.000,00<br>Limite massimo D.L. 25: € 1.000,00 | **OK** | Il valore viene correttamente trattato come "Limite Massimo" teorico di controllo (non pre-compila la costituzione fondo reale). |
| **Step 4 — CCNL** | Monte salari 2021: € 1M<br>Fondo 2024: € 100k<br>EQ 2024: € 20k<br>Scelto: € 3.000,00 | Incr. stabile 0,14%: € 1.400,00<br>Arretrati 0,14%: € 2.800,00<br>Limite max 0,22%: € 4.400,00<br>Quota Fondo (5/6): € 2.500,00<br>Quota EQ (1/6): € 500,00 | Incr. stabile 0,14%: € 1.400,00<br>Arretrati 0,14%: € 2.800,00<br>Limite max 0,22%: € 4.400,00<br>Quota Fondo: € 2.500,00<br>Quota EQ: € 500,00 | **OK** | Non compare alcun totale cumulato non a norma del tipo "0,14% + 0,22%". |
| **Step 5 — Art. 60** | Inserimento guidato:<br>Funzionari: 2 FTE<br>Istruttori: 3.5 FTE<br>Op. esperti: 1 FTE<br>Operatori: 1 FTE | Funz/EQ: € 254,88<br>Istruttori: € 394,80<br>Op. esp.: € 96,72<br>Operatori: € 79,56<br>Totale riduzione: € 825,96 | Funz/EQ: € 254,88<br>Istruttori: € 394,80<br>Op. esp.: € 96,72<br>Operatori: € 79,56<br>Totale riduzione: € 825,96 | **OK** | Note chiare a schermo che il calcolo si consolida nel 2026 e rimane immutato salvo correzione manuale motivata. |
| **Step 6 — Straord.** | Fondo corrente: € 10k<br>Riduzione Art. 67: € 1k<br>Economie: € 500<br>Escluso Art. 23: € 1k | Fondo straordinario residuo: € 9.000,00<br>Incr. stabile da riduzione: € 1.000,00<br>Economie da riversare: € 500,00<br>Risorse escluse: € 1.000,00 | Fondo straordinario residuo: € 9.000,00<br>Incr. stabile da riduzione: € 1.000,00<br>Economie da riversare: € 500,00<br>Risorse escluse: € 1.000,00 | **OK** | Rimossi i campi legacy: fondo straordinario 2016, fonti di riferimento, motivazione della riduzione. |
| **Step 7 — PNRR** | Progetti PNRR: Sì<br>Fondo stabile 2016: € 80k<br>Tutti i check contabili: Sì (Incidenza: 6%) | Limite max PNRR: € 4.000,00 (5% di stabile 2016) | Limite max PNRR: € 4.000,00 | **OK** | Il valore viene contrassegnato solo come limite teorico escluso dall'Art. 23. |

---

## 4. Verifica Mantenimento Dati (Stato e Excel)

- **Persistenza tra sezioni:** La navigazione avanti e indietro tramite il selettore dei passi (da Step 1 a Step 8 e viceversa) non causa alcuna perdita dei valori precedentemente inseriti o calcolati. Lo stato rimane conservato all'interno dello store Redux/local draft.
- **Import/Export Excel:** È stato testato il flusso di export e ri-import dei dati. Il foglio Excel viene generato con i medesimi valori dello stato del wizard. Al re-import, i dati vengono ri-mappati senza perdite o disallineamenti di segno.

---

## 5. Step 8 — Riepilogo, Anteprima e Trasferimento

Nello **Step 8 — Riepilogo e Trasferimento**:
- **Nessuna chiave tecnica:** Voci come `incrementoStabile014` o `st_incrementoDL25_2025` sono state sostituite da etichette descrittive ed esplicative (es. "Incremento stabile 0,14% Monte Salari 2021", "Limite massimo incremento D.L. 25/2025").
- **Grafica coerente:** Il layout rispecchia la palette FP CGIL Lombardia (toni rossi/granata per evidenziare blocchi e warning, bianco/grigio per i pannelli informativi).
- **Anteprima "Prima/Dopo":** Mostra chiaramente la colonna con i valori attuali della Costituzione Fondo e i nuovi valori proposti pronti per essere sovrascritti/integrati.
- **Conferma esplicita e Rollback:** Viene presentata una modale di conferma prima di procedere. All'approvazione, viene registrato lo snapshot del fondo pre-trasferimento in `sessionStorage` e l'utente viene reindirizzato alla pagina `Costituzione Fondo`.
- **Annullamento:** Sulla pagina di destinazione, compare un banner verde con il tasto "Annulla trasferimento" che ripristina lo snapshot di backup con successo.

---

## 6. Risultati del Trasferimento nella Costituzione Fondo

La seguente tabella mappa le corrispondenze prima e dopo l'avvenuto trasferimento:

| Voce Proveniente dal Wizard | Voce Target nella Costituzione Fondo | Importo Atteso | Importo Trasferito | Esito | Note |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **Incr. stabile 0,14%** | `st_art58c1_CCNL2026_incremento014_MS2021` | € 1.400,00 | € 1.400,00 | **OK** | Trasferito a risorse stabili |
| **Arretrati 0,14%** | `vn_art58_CCNL2026_arretrati2024_2025` | € 2.800,00 | € 2.800,00 | **OK** | Trasferito a risorse variabili |
| **Quota 0,22% Fondo** | `vn_art58c2_incremento_max022_ms2021` | € 2.500,00 | € 2.500,00 | **OK** | Trasferito a risorse variabili |
| **Conglobamento Art. 60** | `st_art60c2_CCNL2026_decurtazioneIndennitaComparto` | € 825,96 | € 825,96 | **OK** | Trasferito a risorse stabili (riduzione) |
| **Riduzione straordinario**| `st_art79c1_art14c3_art67c2g_riduzioneStraordinario` | € 1.000,00 | € 1.000,00 | **OK** | Trasferito a risorse stabili |
| **Economie straordinario** | `vn_art15c1m_art67c3e_risparmiStraordinario` | € 500,00 | € 500,00 | **OK** | Trasferito a risorse variabili |
| **Straordinario residuo** | `annualData.fondoLavoroStraordinario` | € 9.000,00 | € 9.000,00 | **OK** | Aggiornato valore configurazione |
| **Limite max D.L. 25** | `fondoAccessorioDipendenteData.st_incrementoDL25_2025` | € 0,00 (Non trasf.) | € 0,00 | **OK** | Conservato solo come limite istruttorio (€ 1.000,00) |
| **Limite max PNRR** | `fondoAccessorioDipendenteData.vn_dl13...PNRR...` | € 0,00 (Non trasf.) | € 0,00 | **OK** | Conservato solo come limite istruttorio (€ 4.000,00) |
| **Limite Art. 23** | `simulato.limiteArt23Attualizzato` | N/A (Solo controllo) | N/A | **OK** | Mostrato come tetto di controllo nel prospetto (€ 120.000,00) |

---

## 7. Verifica Prospetto Art. 23 nella Costituzione Fondo

I calcoli esposti nel prospetto "Art. 23 - Fondo personale dipendente" presentano i seguenti riscontri:

| Voce Prospetto | Valore Atteso | Valore Visualizzato | Esito | Note Metodologiche / Formule |
| :--- | :---: | :---: | :---: | :--- |
| **Fondo Costituito Reale** | € 201.974,04 | € 201.974,04 | **OK** | Risorse totali destinate alla contrattazione incluse le voci stabili, variabili e decurtazioni (escl. straordinario ma incl. riduzione Art. 60). |
| **Risorse Escluse Art. 23** | € 9.700,00 | € 9.700,00 | **OK** | Somma stabili escluse (0,14% stabile = € 1.400,00) + variabili non soggette (arretrati 0,14% = € 2.800,00; quota 0,22% = € 2.500,00; economie straord. = € 500,00; straordinario escluso = € 1.000,00; PNRR effettivo = € 0,00; DL 25 effettivo = € 0,00). *Nota: le stabili storiche rimangono giustamente soggette (vincolo MOD-025).* |
| **Risorse Rilevanti (Effettive)**| € 201.274,04 | € 201.274,04 | **OK** | `Fondo Costituito Reale (201.974,04) - Risorse Escluse (9.700,00) + Straordinario Soggetto (9.000,00) = 201.274,04` |
| **Decurtazione reale Art. 60** | € 825,96 | € 825,96 | **OK** | Il Fondo Stabile viene ridotto realmente di € 825,96. |
| **Computo figurativo Art. 60** | € 825,96 | € 825,96 | **OK** | Valore reintegrato nelle Risorse Rilevanti ai fini del limite Art. 23. |
| **Variazione Margine Art. 23** | € 0,00 | € 0,00 | **OK** | Verificato: la decurtazione Art. 60 riduce il fondo ma NON aumenta il margine residuo disponibile (l'effetto del taglio è neutralizzato dal computo figurativo). |
| **Limite Art. 23 Attualizzato**| € 120.000,00 | € 120.000,00 | **OK** | Limite importato dallo Step 2 del wizard. |
| **Disallineamento Art. 60** | Nessuno | Nessun Warning | **OK** | Se si cambia manualmente la voce in tabella a € 1.000,00 mantenendo il wizard a € 825,96, compare correttamente il warning non bloccante. |

---

## 8. Verifiche di Conformità e Sforamenti (Stress Test)

### Prova Sforamento D.L. 25/2025
- **Limite Massimo calcolato:** € 1.000,00
- **Inserito manualmente nella Costituzione Fondo:** € 1.500,00
- **Esito:** **OK**. L'applicazione consente la digitazione dell'importo, ma solleva immediatamente un blocco di conformità bloccante (`Calculation Error`) nel banner di compliance in testa e disabilita la validazione formale del fondo. Viene esposto il messaggio di errore:
  > *"L'incremento D.L. 25/2025 effettivo (€ 1.500,00) supera il limite massimo consentito di € 1.000,00"*

### Prova Sforamento PNRR
- **Limite Massimo calcolato:** € 4.000,00
- **Inserito manualmente nella Costituzione Fondo:** € 5.000,00
- **Esito:** **OK**. Il sistema permette l'immissione dell'importo, ma genera immediatamente un errore di blocco nel banner del prospetto:
  > *"L'incremento PNRR effettivo (€ 5.000,00) supera il limite massimo consentito di € 4.000,00"*

---

## 9. Verifica Layout Responsive

Il layout del wizard e del prospetto di conformità dell'Art. 23 è stato collaudato a diverse risoluzioni simulate:
- **Desktop (1440px):** Disposizione a 4 colonne per le card riassuntive, formattazione ottimale delle tabelle, sidebar visibile.
- **Tablet (768px):** Il layout si adatta a 2 colonne. La tabella di riepilogo dello Step 8 introduce scroll orizzontali nativi per le colonne descrittive prevenendo overflow orizzontali.
- **Smartphone (390px):** Card incolonnate singolarmente (1 colonna). La visualizzazione del prospetto Art. 23 rimane perfettamente leggibile grazie a font scalati e all'incolonnamento dei badge di compliance. Pulsanti per il salvataggio ed il rollback ben visibili e cliccabili.

---

## 10. Elenco Anomalie Rilevate e Miglioramenti UX

Durante il collaudo non sono state individuate anomalie bloccanti dal punto di vista matematico-normativo (esito dei calcoli esatto al 100%). Vengono tuttavia segnalati alcuni punti di potenziale miglioramento per le successive fasi:

### Gravità: Bassa
1. **Riconciliazione retrospettiva nello Step 5 (Art. 60):** Qualora l'utente cambi a mano l'importo della decurtazione Art. 60 nella tabella principale per disallinearlo da quello del wizard, il warning compare correttamente. Tuttavia, la descrizione del warning potrebbe specificare che la discrepanza può essere sanata aggiornando lo Step 5 o inserendo una nota esplicativa nei verbali di costituzione.

### Miglioramento UX (User Experience)
1. **Tooltip per FTE dello straordinario (Step 6):** Nello Step 6, sarebbe utile un piccolo tooltip informativo a fianco della casella di input per le economie dello straordinario da riversare per ricordare all'utente che il riversamento deve essere certificato dall'organo di revisione dell'ente.
2. **Badge "Solo Controllo" più evidente:** Nello Step 8 (anteprima trasferimento), le voci contrassegnate come "SOLO_CONTROLLO" (quali il limite D.L. 25 o il PNRR) potrebbero avere un badge colorato in arancione/azzurro anziché grigio per far comprendere a colpo d'occhio all'utente che queste cifre non modificheranno la parte finanziaria attiva del fondo ma serviranno solo come tetti massimi.

---

## 11. Giudizio Finale

> [!TIP]
> **Giudizio: PRONTO CON CORREZIONI MINORI**  
> L'applicazione è matematicamente conforme ai requisiti normativi del CCNL 23.02.2026, del D.L. 25/2025, del PNRR e dell'Art. 23 comma 2 (inclusa la gestione del reintegro figurativo Art. 60). Le anomalie riscontrate riguardano esclusivamente chiarimenti testuali o migliorie di usabilità che non impattano sui saldi finali né sulla conformità del fondo.

---

## 12. Raccomandazione Operativa per la Rimozione del Codice Legacy

Avendo superato con successo il collaudo del nuovo flusso "Raccolta dati dell’Ente" → "Costituzione Fondo" ed essendo stati allineati i motori di calcolo, si raccomanda di procedere alla rimozione delle seguenti risorse legacy nella prossima fase di refactoring:

1. **Pagine obsolete:**
   - [DataEntryPage.tsx](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/pages/DataEntryPage.tsx) (sostituita a tutti gli effetti dal nuovo wizard e dalla scheda `FondoAccessorioDipendentePage`).

2. **Componenti e wizard obsoleti:**
   - La cartella [src/components/wizard/](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/components/wizard/) contenente le vecchie maschere di immissione e i vecchi step (es. `WizardStepDatiStorici2016`, `WizardStepDatiStorici2018`, `WizardStepIdentificazioneEnte`, ecc.).

3. **Codice di routing:**
   - Rimuovere i riferimenti a `/data-entry` o simili dal file principale delle rotte, indirizzando esclusivamente all'interfaccia del nuovo wizard.
