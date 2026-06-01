# Fondo delle Elevate Qualificazioni (EQ)

## 1. Scopo della pagina
Questa pagina è dedicata alla costituzione e al monitoraggio delle risorse destinate al finanziamento del trattamento accessorio del personale incaricato di **Elevata Qualificazione (EQ)**, precedentemente denominato Posizioni Organizzative (PO) negli enti privi di personale dirigente o per le posizioni equivalenti negli enti con dirigenza.
La pagina gestisce:
- Le risorse storiche stabili dedicate alle posizioni organizzative;
- Gli incrementi contrattuali stabili e variabili deliberati dall'ente per le EQ;
- I trasferimenti di risorse tra il Fondo del personale dipendente e il budget delle EQ;
- Il riparto degli utilizzi tra la Retribuzione di Posizione e la Retribuzione di Risultato (con verifica del minimo contrattuale del 15% destinato al risultato).

Il trattamento economico delle EQ non transita nel "Fondo risorse decentrate" del comparto (che finanzia la produttività collettiva dei dipendenti), ma costituisce un budget separato a carico del bilancio dell'ente. Tuttavia, ai fini del rispetto dell'**Art. 23, comma 2, del D.Lgs. 75/2017**, le risorse rilevanti delle EQ concorrono insieme a quelle del personale dipendente a consumare il tetto storico del 2016 dell'ente.

---

## 2. File analizzati
| File | Funzione |
|---|---|
| `src/pages/FondoElevateQualificazioniPage.tsx` | Componente React principale dell'interfaccia utente. Gestisce l'inserimento dei dati delle EQ, calcola i totali a schermo e mostra la ripartizione tra quota soggetta ed esclusa dal limite dell'Art. 23. |
| `src/logic/calculation/fundEngine.ts` | Motore di calcolo principale dell'applicazione, che integra i risultati parziali del sub-fund EQ. |
| `src/logic/calculation/fundCalculations.ts` | Contiene la funzione `calculateEqSubFund` che calcola i subtotali stabili e variabili delle EQ per il motore. |
| `src/logic/fundFieldDefinitions.ts` | Definisce le voci di utilizzo del fondo EQ (`st_art16c2_retribuzionePosizione` e `va_art16c3_retribuzioneRisultato`). |
| `src/schemas/fundDataSchemas.ts` | Valida lo schema dei dati delle EQ tramite `FondoElevateQualificazioniDataSchema`. |

---

## 3. Modello dati utilizzato
Il modello dati è registrato nell'oggetto `state.fundData.fondoElevateQualificazioniData` e viene convalidato dallo schema `FondoElevateQualificazioniDataSchema`.

| Gruppo Dati | Campo Tecnico / Oggetto | Origine | Natura | Descrizione |
|---|---|---|---|---|
| **Dati Finanziamento** | `ris_fondoPO2017`, `ris_incrementoConRiduzioneFondoDipendenti`, `ris_incrementoLimiteArt23c2_DL34`, `ris_incremento022MonteSalari2018`, `va_incremento022_ms2021_eq`, `va_dl25_2025_armonizzazione`, `va_art18c5_CCNL2026_maggiorazioneSediLavoro`, `va_art16c5_CCNL2026_maggiorazioneInterim`, `fin_art23c2_adeguamentoTetto2016` | Input manuale + Calcolo automatico (per quota 0.22% MS 2021) | Annuale / Storico | Contiene tutti i proventi e le decurtazioni della parte stabile e variabile destinate alle EQ. |
| **Dati Ripartizione / Utilizzo** | `st_art16c2_retribuzionePosizione`, `va_art16c3_retribuzioneRisultato` | Input manuale | Annuale | Contiene la ripartizione finanziaria tra posizione e risultato delle EQ. |
| **Dati Generali** | `state.fundData.annualData.ccnl2024` | Wizard / Dati Generali | Annuale | Alimenta il calcolo della quota dello 0,22% MS 2021 spettante alle EQ. |

---

## 4. Logica generale di calcolo della pagina
La pagina aggrega le fonti di finanziamento distinguendole tra stabili e variabili, determinando poi la quota soggetta a limite Art. 23 e quella esclusa.

### A. Calcolo del Finanziamento EQ
Il totale delle risorse disponibili per le EQ è dato dalla somma dei finanziamenti stabili e variabili:
- **Componente Stabile**: Si basa sul fondo storico delle PO consolidato al 2017 (`ris_fondoPO2017`). A questo si sommano le risorse trasferite dal fondo dipendenti (`ris_incrementoConRiduzioneFondoDipendenti`), gli incrementi stabili nel limite dell'Art. 23 (`ris_incrementoLimiteArt23c2_DL34`), e si sottrae l'eventuale decurtazione di adeguamento tetto (`fin_art23c2_adeguamentoTetto2016`). Inoltre, nel motore viene aggiunto l'incremento dello 0,14% MS 2021 (`ccnl2024_eq_stabile`).
- **Componente Variabile**: Include l'incremento storico dello 0,22% MS 2018 (`ris_incremento022MonteSalari2018`), l'incremento dello 0,22% MS 2021 (`va_incremento022_ms2021_eq`), le maggiorazioni per convenzioni/sedi di lavoro (`va_art18c5_CCNL2026_maggiorazioneSediLavoro`), e le indennità ad interim (`va_art16c5_CCNL2026_maggiorazioneInterim`).

### B. Gestione del Limite Art. 23 c. 2
Le risorse EQ destinate alla retribuzione di posizione e risultato sono parzialmente soggette al tetto 2016 dell'ente:
- **Quota Soggetta**: La base storica 2017 (`ris_fondoPO2017`), gli incrementi stabili trasferiti dal fondo dipendenti o ex D.L. 34/2019, e l'armonizzazione D.L. 25/2025 (`va_dl25_2025_armonizzazione`).
- **Quota Esclusa**: Gli incrementi contrattuali dello 0,22% (MS 2018 e MS 2021) in quanto disposti da rinnovi contrattuali successivi in deroga speciale, le maggiorazioni per sedi disagiate e gli interim.
- **Ripartizione e quota minima di risultato**: Il CCNL stabilisce che una quota non inferiore al 15% delle risorse destinate complessivamente a posizione e risultato debba essere erogata a titolo di retribuzione di risultato. La pagina verifica e segnala come warning un eventuale mancato rispetto di questa soglia.

---

## 5. Tabella analitica voce per voce

| Voce visibile in pagina | Chiave tecnica | Fonte normativa / contrattuale | Natura della voce | Base di calcolo descritta a parole | Formula tecnica ricostruita | Origine dati | Effetto sul totale pagina | Effetto Art. 23 | Note / criticità |
|---|---|---|---|---|---|---|---|---|---|
| Fondo PO 2017 (valore storico) | `ris_fondoPO2017` | Valore storico Ente / CCNL Precedente | Stabile | Importo storico stanziato dall'ente per le Posizioni Organizzative nell'anno 2017. | Valore inserito | Manuale | Aggiunge (+) | Soggetto | Costituisce la base stabile di partenza del sub-fund. |
| Incremento con riduzione fondo dipendenti | `ris_incrementoConRiduzioneFondoDipendenti` | Delibera dell'ente (CCDI) | Stabile | Importo trasferito in modo permanente dal fondo del personale del comparto a favore dell'area EQ. | Valore inserito | Manuale | Aggiunge (+) | Soggetto | Riduce in misura speculare la parte stabile del fondo dipendenti. |
| Incremento limite Art. 23 (D.L. 34/2019) | `ris_incrementoLimiteArt23c2_DL34` | Art. 23 c.2 D.Lgs. 75/2017 e Art. 33 D.L. 34/2019 | Stabile | Incremento stabile del budget EQ autorizzato nei limiti dell'adeguamento del tetto del personale. | Valore inserito | Manuale | Aggiunge (+) | Soggetto | Consuma la capienza del limite complessivo dell'ente. |
| 0,22% Monte Salari 2018 | `ris_incremento022MonteSalari2018` | Art. 79 c. 3 CCNL 16.11.2022 | Variabile | Quota dell'incremento dello 0,22% MS 2018 destinata al finanziamento delle EQ a decorrere dal 2022. | Valore inserito | Manuale | Aggiunge (+) | Escluso | Riferito al Monte Salari 2018. |
| 0,22% Monte Salari 2021 (CCNL 2026) | `va_incremento022_ms2021_eq` | Art. 58 c. 2 CCNL 23.02.2026 | Variabile | Quota dell'incremento variabile dello 0,22% MS 2021 spettante all'area EQ, ripartita in proporzione al fondo. | `MS2021 * 0.22% * (FondoEQ2025 / (FondoPers2025 + FondoEQ2025))` | Calcolato (automatico) | Aggiunge (+) | Escluso | Calcolato automaticamente dai parametri del wizard. |
| Armonizzazione accessorio | `va_dl25_2025_armonizzazione` | Art. 14 c. 1-bis D.L. 25/2025 | Variabile | Risorse variabili destinate all'armonizzazione della spesa accessoria delle EQ. | Valore inserito | Manuale | Aggiunge (+) | Soggetto | Rileva ai fini del tetto complessivo dell'Art. 23. |
| Maggiorazione sedi lavoro | `va_art18c5_CCNL2026_maggiorazioneSediLavoro` | Art. 18 c. 5 CCNL 23.02.2026 | Variabile | Risorse per la retribuzione di posizione maggiorata in presenza di sedi disagiate o convenzioni. | Valore inserito | Manuale | Aggiunge (+) | Escluso | Finanziata in eccedenza al limite. |
| Maggiorazione interim | `va_art16c5_CCNL2026_maggiorazioneInterim` | Art. 16 c. 5 CCNL 23.02.2026 | Variabile | Quota di retribuzione di risultato aggiuntiva dovuta per la reggenza di incarichi ad interim (15%-25%). | Valore inserito | Manuale | Aggiunge (+) | Escluso | Finanziata in eccedenza al limite. |
| Decurtazione annuale rispetto tetto 2016 | `fin_art23c2_adeguamentoTetto2016` | Art. 23 c. 2 D.Lgs. 75/2017 | Decurtazione Stabile | Riduzione applicata al budget EQ per concorrere al riallineamento della spesa al tetto 2016. | Valore inserito | Manuale | Sottrae (-) | Soggetto (riduce le risorse) | Inserimento manuale a carico dell'operatore. |

---

## 6. Totali e subtotali prodotti dalla pagina
I totali calcolati a schermo sono:

1. **Somma Risorse Base (Fondo accessorio EQ costituito)**
   - *Formula*: `ris_fondoPO2017 + ris_incrementoConRiduzioneFondoDipendenti + ris_incrementoLimiteArt23c2_DL34 - fin_art23c2_adeguamentoTetto2016 + ris_incremento022MonteSalari2018 + va_incremento022_ms2021_eq + va_dl25_2025_armonizzazione + va_art18c5_CCNL2026_maggiorazioneSediLavoro + va_art16c5_CCNL2026_maggiorazioneInterim`.
   - *Significato*: È l'ammontare complessivo delle risorse stanziate per l'area delle Elevate Qualificazioni nell'anno.
2. **Quota Soggetta a Tetto**
   - *Formula*: `ris_fondoPO2017 + ris_incrementoConRiduzioneFondoDipendenti + ris_incrementoLimiteArt23c2_DL34 + va_dl25_2025_armonizzazione`.
   - *Significato*: La parte di risorse EQ che entra nel conteggio del tetto 2016 complessivo dell'ente.
3. **Quota Esclusa dal Tetto**
   - *Formula*: `Totale Risorse - Quota Soggetta a Tetto + Decurtazione Adeguamento Tetto`.
   - *Significato*: Risorse in deroga speciale escluse dal tetto Art. 23 (es. quote 0,22%, interim e maggiorazioni sedi).

---

## 7. Collegamenti con Art. 23, comma 2, D.Lgs. 75/2017
Le risorse dell'area EQ non formano una compliance a sé stante nella pagina, ma inviano i dati al motore centrale di calcolo.
- **Tetto Storico 2016**: La base delle PO storiche del 2016 (`historicalData.fondoElevateQualificazioni2016`) viene aggregata alla base comune dell'ente.
- **Rilevanza**: I tre campi stabili `ris_fondoPO2017`, `ris_incrementoConRiduzioneFondoDipendenti`, e `ris_incrementoLimiteArt23c2_DL34` costituiscono l'oggetto `eq_soggette` in `fundEngine.ts` e vengono interamente sommati alle risorse soggette totali dell'ente.

---

## 8. Collegamenti con il wizard 2026
Il wizard contrattuale 2026 determina alcuni dei parametri chiave delle EQ:

| Voce / Campo | Categoria | Motivazione | Destinazione |
|---|---|---|---|
| Incremento 0,22% MS 2021 | A. Già trasferibili automaticamente | Calcolato in modo deterministico partendo dal Monte Salari 2021 e ripartito in base alla spesa relativa del 2025. | `va_incremento022_ms2021_eq` |
| Quota EQ dello 0,14% MS 2021 | A. Già trasferibili automaticamente | L'incremento dello 0,14% della parte stabile EQ viene calcolato nel wizard e importato nel motore (`ccnl2024_eq_stabile`). | Motore di calcolo (`calculateEqSubFund`) |
| Quota Risultato Minima (15%) | C. Solo controllo, non trasferibile | Verifica di conformità contrattuale sull'utilizzo delle risorse EQ. | Compliance Check della pagina |

---

## 9. Sovrapposizioni e dipendenze con le altre pagine
- **Dipendenza Speculare dal Fondo Dipendenti**: La voce `ris_incrementoConRiduzioneFondoDipendenti` rappresenta il corrispettivo dell'importo detratto in parte stabile nel fondo dipendenti (`st_riduzionePerIncrementoEQ`). Se i due valori non coincidono a livello di inserimento, si crea un disallineamento della spesa complessiva o un errore nel rispetto dell'Art. 23 c. 2.
- **Ripartizione dello 0,22% e dello 0,14%**: Questi incrementi contrattuali dipendono dal Monte Salari 2021 dell'ente e dalla proporzione di spesa 2025 registrata tra fondo personale e fondo EQ. Un'alterazione di questi parametri nel wizard ridetermina i massimali di entrambe le pagine.

---

## 10. Criticità, ambiguità e domande aperte

| Livello | Descrizione | File coinvolti | Effetto potenziale | Proposta di verifica |
|---|---|---|---|---|
| **ERRORE PROBABILE** | **Incoerenza delle Voci tra Pagina e Motore**: Nel motore di calcolo (`calculateEqSubFund` in `fundCalculations.ts`), le chiavi `va_art18c5_CCNL2026_maggiorazioneSediLavoro`, `va_art16c5_CCNL2026_maggiorazioneInterim` e `va_dl25_2025_armonizzazione` non vengono addizionate per determinare il totale del sub-fund EQ. Tuttavia, nella pagina React, esse sono sommate a schermo per determinare il totale disponibile. | `FondoElevateQualificazioniPage.tsx`, `fundCalculations.ts` | Il totale reale delle risorse EQ calcolato nel backend (e salvato nei report) risulta inferiore rispetto a quanto mostrato graficamente all'utente e a quanto effettivamente distribuito. | Aggiornare il calcolo di `eq_variabile` in `calculateEqSubFund` inserendo queste tre chiavi per allinearlo alla UI. |
| **SCELTA PROGETTUALE DA CONFERMARE** | **Esclusione di `va_dl25_2025_armonizzazione` dal limite**: Nel nuovo motore di calcolo (`fundEngine.ts` in `src/logic/calculation/`), la voce dell'armonizzazione EQ `va_dl25_2025_armonizzazione` è stata rimossa dal calcolo di `eq_soggette`, mentre la pagina UI la considera come risorsa soggetta a tetto. | `fundEngine.ts` (calculation), `FondoElevateQualificazioniPage.tsx` | Discrepanza sul calcolo delle risorse rilevanti ai fini dell'Art. 23 dell'ente. | Uniformare il trattamento: se la voce rileva ai fini del limite, deve essere inclusa sia a schermo sia nel motore. |

---

## 11. Sintesi operativa finale
La pagina delle Elevate Qualificazioni gestisce in modo guidato la costituzione delle risorse per le posizioni organizzative, ma presenta due importanti discrepanze logico-matematiche tra il frontend (UI) e il backend (motore di calcolo `fundCalculations.ts` / `fundEngine.ts`) per quanto riguarda il computo delle maggiorazioni per interim, sedi disagiate ed armonizzazione.
Si consiglia di verificare l'esatto trattamento contabile dell'armonizzazione D.L. 25/2025 per le EQ e di allineare le variabili addizionate nel motore per evitare differenze nei report di riepilogo.
Prima di procedere, è opportuno effettuare test di simulazione per accertarsi che il trasferimento di risorse dal fondo dipendenti all'area EQ sia perfettamente bilanciato.
