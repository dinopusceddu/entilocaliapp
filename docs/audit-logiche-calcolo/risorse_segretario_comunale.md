# Risorse Segretario Comunale

## 1. Scopo della pagina
Questa pagina gestisce e documenta le fonti di finanziamento del trattamento accessorio spettante alla figura del **Segretario Comunale e Provinciale**. 
Il Segretario Comunale è un funzionario statale (iscritto in apposito Albo e dipendente dal Ministero dell'Interno) che presta servizio presso l'ente locale. Di conseguenza:
- Non appartiene al personale del comparto dell'ente e le sue risorse non confluiscono nel Fondo risorse decentrate dei dipendenti;
- Il suo trattamento economico accessorio (retribuzione di posizione, di risultato, diritti di rogito, maggiorazioni per convenzioni) è stanziato direttamente a bilancio dall'ente in base ai contratti collettivi nazionali dell'Area delle Funzioni Locali (sezione Segretari).

Nonostante l'autonomia di finanziamento, l'**Art. 23, comma 2, del D.Lgs. 75/2017** impone che il trattamento accessorio del Segretario rientri nel computo del **tetto complessivo di spesa accessoria 2016 dell'ente**. La pagina raccoglie quindi gli importi effettivi per determinare la quota soggetta e la quota esclusa dal limite dell'Art. 23, applicando la percentuale di copertura del posto per gli enti che gestiscono la segreteria in forma convenzionata (posto condiviso).

---

## 2. File analizzati
| File | Funzione |
|---|---|
| `src/pages/FondoSegretarioComunalePage.tsx` | Componente React principale dell'interfaccia utente. Consente l'inserimento dei dati, gestisce il calcolo automatico della quota rilevante basato sulla percentuale di copertura e riepiloga le risorse totali. |
| `src/logic/calculation/fundEngine.ts` | Motore di calcolo principale dell'applicazione, che integra i risultati parziali delle risorse del Segretario. |
| `src/logic/calculation/fundCalculations.ts` | Contiene la funzione `calculateSegretarioSubFund` che calcola i subtotali stabili e variabili del Segretario per il motore. |
| `src/schemas/fundDataSchemas.ts` | Valida lo schema dei dati del Segretario tramite `FondoSegretarioComunaleDataSchema`. |

---

## 3. Modello dati utilizzato
Il modello dati fa capo all'oggetto `state.fundData.fondoSegretarioComunaleData` ed è validato da `FondoSegretarioComunaleDataSchema`.

| Gruppo Dati | Campo Tecnico / Oggetto | Origine | Natura | Descrizione |
|---|---|---|---|---|
| **Dati Finanziamento** | `st_art3c6_CCNL2011_retribuzionePosizione`, `st_art58c1_CCNL2024_differenzialeAumento`, `st_art60c1_CCNL2024_retribuzionePosizioneClassi`, `st_art60c3_CCNL2024_maggiorazioneComplessita`, `st_art60c5_CCNL2024_allineamentoDirigEQ`, `st_art56c1g_CCNL2024_retribuzioneAggiuntivaConvenzioni`, `st_art56c1h_CCNL2024_indennitaReggenzaSupplenza`, `st_art36_CCNL2022_2024_incrementoRetribuzionePosizione` (stabili) | Input manuale | Annuale / Storico | Risorse stabili per la retribuzione di posizione ordinarie, differenziali e convenzioni. |
| **Dati Variabili** | `va_art56c1f_CCNL2024_dirittiSegreteria`, `va_art56c1i_CCNL2024_altriCompensiLegge`, `va_art8c3_DL13_2023_incrementoPNRR`, `va_art61c2_CCNL2024_retribuzioneRisultato10`, `va_art61c2bis_CCNL2024_retribuzioneRisultato15`, `va_art61c2ter_CCNL2024_superamentoLimiteMetropolitane`, `va_art61c3_CCNL2024_incremento022MonteSalari2018`, `va_art40c1_CCNL2022_2024_incremento0_80MonteSalari2021`, `va_art40c2_CCNL2022_2024_incremento0_22MonteSalari2021`, `va_art40c1_CCNL2026_incremento080MS2021`, `va_art40c2_CCNL2026_incremento022MS2021_L207`, `va_art21c1m_CCNL2026_incentiviFunzioniTecniche` | Input manuale | Annuale | Risorse variabili per diritti di rogito, altri compensi ex lege, PNRR, retribuzioni di risultato ed incrementi contrattuali. |
| **Dati Controllo / Parametri** | `fin_percentualeCoperturaPostoSegretario` | Input manuale (%) | Annuale | Percentuale di carico finanziario dell'ufficio di segreteria (es. 100% per segreteria singola, 50% per convenzione tra due comuni). |
| **Output Calcolato** | `fin_totaleRisorseRilevantiLimite` | Calcolo automatico | Annuale | Totale delle risorse che incidono sul limite dell'Art. 23 c. 2. |

---

## 4. Logica generale di calcolo della pagina
La pagina calcola il totale delle risorse teoriche spettanti al Segretario e le riproporziona in base alla percentuale di effettivo carico finanziario per l'ente.

### A. Calcolo del Trattamento Accessorio Complessivo
Le voci stabili e variabili sono sommate separatamente:
- **Somma Stabili**: Aggrega la retribuzione di posizione base (storica o ridefinita per classi), le maggiorazioni per strutture complesse o per allineamento dirigenziale, e le indennità stabili di reggenza o supplenza.
- **Somma Variabili**: Aggrega i diritti di segreteria (rogito), gli incentivi per funzioni tecniche, le retribuzioni di risultato (fino al 10% o 15% del monte salari) e gli incrementi contrattuali (0,22% e 0,80% MS 2021).
- **Riproporzionamento**: `Totale Disponibile = (Somma Stabili + Somma Variabili) * (% Copertura Segretario / 100)`.

### B. Determinazione della Rilevanza ai Fini del Limite Art. 23 c. 2
Non tutte le componenti economiche concorrono al limite del salario accessorio:
- **Voci Rilevanti (Soggette)**: Solo le voci che compongono il trattamento accessorio ordinario di posizione e risultato. Nello specifico:
  - Retribuzione di posizione base (`st_art3c6_retribuzionePosizione` e `st_art60c1_retribuzionePosizioneClassi`);
  - Maggiorazione per complessità (`st_art60c3_maggiorazioneComplessita`);
  - Allineamento dirigenziale/EQ (`st_art60c5_allineamentoDirigEQ`);
  - Retribuzione di risultato ordinaria ed elevata (`va_art61c2_retribuzioneRisultato10`, `va_art61c2bis_retribuzioneRisultato15` e `va_art61c2ter_superamentoLimiteMetropolitane`).
- **Voci Escluse (In deroga)**: I diritti di rogito (spettanti ex lege nei limiti del terzo del trattamento economico complessivo), le indennità di reggenza/supplenza, gli incentivi per funzioni tecniche e gli incrementi dello 0,22% e 0,80% contrattuali (in quanto disposti da norme successive in deroga).
- **Formula Rilevanza**: `Totale Rilevante = (Somma voci rilevanti) * (% Copertura Segretario / 100)`.

---

## 5. Tabella analitica voce per voce

| Voce visibile in pagina | Chiave tecnica | Fonte normativa / contrattuale | Natura della voce | Base di calcolo descritta a parole | Formula tecnica ricostruita | Origine dati | Effetto sul totale pagina | Effetto Art. 23 | Note / criticità |
|---|---|---|---|---|---|---|---|---|---|
| Retribuzione Posizione 2011 | `st_art3c6_CCNL2011_retribuzionePosizione` | Art. 3 c. 6 CCNL 01.03.2011 | Stabile | Valore annuo lordo storico consolidato per la retribuzione di posizione. | Valore inserito | Manuale | Aggiunge (+) | Soggetto | Base stabile di partenza. |
| Differenziale aumento 2024 | `st_art58c1_CCNL2024_differenzialeAumento` | Art. 58 c. 1 CCNL 16.07.2024 | Stabile | Solo il differenziale di incremento stabile a decorrere dal 2021 rispetto al CCNL precedente. | Valore inserito | Manuale | Aggiunge (+) | Escluso | Trattasi di incremento contrattuale escluso ex legge. |
| Retribuzione posizione per classi | `st_art60c1_CCNL2024_retribuzionePosizioneClassi` | Art. 60 c. 1 CCNL 16.07.2024 | Stabile | La quota di retribuzione di posizione erogata in base alla classe demografica dell'ente di titolarità. | Valore inserito | Manuale | Aggiunge (+) | Soggetto | Rilevante per il tetto. |
| Maggiorazione complessità (max 15%) | `st_art60c3_CCNL2024_maggiorazioneComplessita` | Art. 60 c. 3 CCNL 16.07.2024 | Stabile | Incremento della posizione (fino al 15%) autorizzato per enti capoluogo, province o città metropolitane. | Valore inserito | Manuale | Aggiunge (+) | Soggetto | Soggetta a capacità di bilancio dell'ente. |
| Allineamento dirig EQ | `st_art60c5_CCNL2024_allineamentoDirigEQ` | Art. 60 c. 5 CCNL 16.07.2024 | Stabile | Integrazione per assicurare che la posizione del segretario non sia inferiore all'incarico dirigenziale o EQ più elevato. | Valore inserito | Manuale | Aggiunge (+) | Soggetto | Rilevante per il limite complessivo. |
| Retribuzione aggiuntiva convenzioni | `st_art56c1g_CCNL2024_retribuzioneAggiuntivaConvenzioni` | Art. 56 c. 1 lett. g) CCNL 16.07.2024 | Stabile | Quota aggiuntiva spettante per la gestione della segreteria in convenzione tra più enti. | Valore inserito | Manuale | Aggiunge (+) | Escluso | Escluso per espressa qualificazione normativa. |
| Indennità reggenza o supplenza | `st_art56c1h_CCNL2024_indennitaReggenzaSupplenza` | Art. 56 c. 1 lett. h) CCNL 16.07.2024 | Stabile | Compensi spettanti per incarichi di reggenza o supplenza di sedi vacanti. | Valore inserito | Manuale | Aggiunge (+) | Escluso | Escluso per espressa qualificazione normativa. |
| Incremento posizione 2022-2024 | `st_art36_CCNL2022_2024_incrementoRetribuzionePosizione` | Art. 36 CCNL 2022-2024 | Stabile | Rideterminazione contrattuale della retribuzione di posizione in base alla classe. | Valore inserito | Manuale | Aggiunge (+) | Escluso (solo per quota incrementale) | La quota incrementale è esclusa, la pregressa rientra. |
| Diritti di segreteria | `va_art56c1f_CCNL2024_dirittiSegreteria` | Art. 56 c. 1 lett. f) CCNL 16.07.2024 | Variabile | Quota spettante sui diritti di rogito per contratti stipulati dal segretario in forma pubblica-amministrativa. | Valore inserito | Manuale | Aggiunge (+) | Escluso | Limite massimo di un terzo del trattamento economico complessivo. |
| Altri compensi legge | `va_art56c1i_CCNL2024_altriCompensiLegge` | Art. 56 c. 1 lett. i) CCNL 16.07.2024 | Variabile | Ulteriori indennità e gettoni di presenza previsti da disposizioni legislative speciali. | Valore inserito | Manuale | Aggiunge (+) | Escluso | Escluso ex lege. |
| Incremento accessorio PNRR | `va_art8c3_DL13_2023_incrementoPNRR` | Art. 8 c. 3 D.L. 13/2023 | Variabile | Incremento variabile pro-quota (fino al 5%) della posizione e risultato legato ad attività PNRR. | Valore inserito | Manuale | Aggiunge (+) | Escluso | Rileva fuori limite. |
| Risultato ordinario (max 10%) | `va_art61c2_CCNL2024_retribuzioneRisultato10` | Art. 61 c. 2 CCNL 16.07.2024 | Variabile | Retribuzione di risultato erogata a bilancio nel limite massimo del 10% del monte salari. | Valore inserito | Manuale | Aggiunge (+) | Soggetto | Voce ordinaria rilevante. |
| Risultato elevato (max 15%) | `va_art61c2bis_CCNL2024_retribuzioneRisultato15` | Art. 61 c. 2-bis CCNL 16.07.2024 | Variabile | Elevazione del compenso di risultato fino al 15% in casi particolari (es. segreterie convenzionate). | Valore inserito | Manuale | Aggiunge (+) | Soggetto | Rilevante ai fini del tetto. |
| Superamento limite metropolitane | `va_art61c2ter_CCNL2024_superamentoLimiteMetropolitane` | Art. 61 c. 2-ter CCNL 16.07.2024 | Variabile | Integrazione per allineamento stipendiale specifico negli enti metropolitani. | Valore inserito | Manuale | Aggiunge (+) | Soggetto | Rilevante ai fini del tetto. |
| Incremento 0,22% MS 2018 | `va_art61c3_CCNL2024_incremento022MonteSalari2018` | Art. 61 c. 3 CCNL 16.07.2024 | Variabile | Ulteriore incremento facoltativo dello 0,22% MS 2018 per retribuzione di risultato. | Valore inserito | Manuale | Aggiunge (+) | Escluso | Escluso in base alla Legge di Bilancio 2022. |
| Incremento 0,80% MS 2021 | `va_art40c1_CCNL2022_2024_incremento0_80MonteSalari2021` | Art. 40 c. 1 CCNL 2022-2024 | Variabile | Incremento dello 0,80% MS 2021 destinato a incrementare il risultato. | Valore inserito | Manuale | Aggiunge (+) | Escluso | Dichiarazione congiunta n. 2 (escluso dal limite). |
| Incremento 0,22% MS 2021 | `va_art40c2_CCNL2022_2024_incremento0_22MonteSalari2021` | Art. 40 c. 2 CCNL 2022-2024 | Variabile | Ulteriore incremento dello 0,22% MS 2021 per retribuzione di risultato. | Valore inserito | Manuale | Aggiunge (+) | Escluso | Escluso dal tetto. |
| Incremento 0,80% MS 2021 (CCNL 2026) | `va_art40c1_CCNL2026_incremento080MS2021` | Art. 40 c. 1 CCNL 23.02.2026 | Variabile | Incremento variabile dello 0,80% del Monte Salari 2021 destinabile a misure di welfare. | Valore inserito | Manuale | Aggiunge (+) | Escluso | Escluso per espressa disposizione contrattuale. |
| Incremento 0,22% MS 2021 (Legge Bilancio 2025) | `va_art40c2_CCNL2026_incremento022MS2021_L207` | Art. 40 c. 2 CCNL 23.02.2026 | Variabile | Ulteriore incremento dello 0,22% MS 2021 introdotto a seguito della Legge di Bilancio 2025. | Valore inserito | Manuale | Aggiunge (+) | Escluso | Escluso dal tetto. |
| Incentivi funzioni tecniche | `va_art21c1m_CCNL2026_incentiviFunzioniTecniche` | Art. 21 c. 1 lett. m) CCNL 23.02.2026 | Variabile | Incentivi per lo svolgimento di attività tecniche erogati al segretario ex lege. | Valore inserito | Manuale | Aggiunge (+) | Escluso | Escluso per deroga speciale. |

---

## 6. Subtotali e totali prodotti dalla pagina
La pagina produce i seguenti subtotali:

1. **SOMMA RISORSE STABILI**
   - *Formula*: Somma dei valori delle 8 voci stabili.
   - *Significato*: Rappresenta la quota teorica intera dei costi fissi del Segretario per l'ente.
2. **SOMMA RISORSE VARIABILI**
   - *Formula*: Somma dei valori delle 12 voci variabili.
   - *Significato*: Rappresenta la quota teorica intera dei compensi variabili (rogito e risultato) del Segretario.
3. **TOTALE RISORSE (Stabili + Variabili)**
   - *Formula*: `Somma Stabili + Somma Variabili`.
   - *Significato*: Il costo totale teorico a tempo pieno (100% di copertura) per la segreteria.
4. **TOTALE RISORSE DISPONIBILI**
   - *Formula*: `Totale Risorse * (% Copertura Posto Segretario / 100)`.
   - *Significato*: L'importo economico reale che l'ente deve effettivamente finanziare a bilancio (il totale effettivo della pagina).
5. **TOTALE RISORSE RILEVANTI LIMITE**
   - *Formula*: `(Somma delle 7 voci rilevanti) * (% Copertura Posto Segretario / 100)`.
   - *Significato*: La quota reale delle risorse del Segretario che consuma il tetto dell'Art. 23 dell'ente.

---

## 7. Collegamenti con Art. 23, comma 2, D.Lgs. 75/2017
Il trattamento accessorio del Segretario Comunale concorre a consumare il tetto complessivo dell'ente.
- **Dato Storico 2016**: La base storica delle risorse accessorie erogate al Segretario nel 2016 (`historicalData.risorseSegretarioComunale2016`) viene sommata al limite complessivo dell'ente.
- **Rilevanza corrente (Anomalia)**:
  - *Nel motore di calcolo principale (`src/logic/calculation/fundEngine.ts`)*: Il Segretario è **escluso** dal calcolo delle risorse rilevanti effettive `risorseRilevantiArt23`.
  - *Nel motore legacy (`src/logic/fundEngine.ts`)*: Le risorse stabili del Segretario erano incluse in `ammontareSoggettoLimite2016`.
  - La pagina produce unicamente il valore `fin_totaleRisorseRilevantiLimite` (inviato a DB), che rappresenta il dato da aggregare esternamente per il controllo generale.

---

## 8. Collegamenti con il wizard 2026
Il wizard contrattuale 2026 non esegue calcoli automatici diretti per il Segretario, lasciando i dati in carico all'inserimento manuale dell'utente:

| Voce / Campo | Categoria | Motivazione | Destinazione |
|---|---|---|---|
| Percentuale di Copertura | D. Non gestibili dal wizard | Richiede l'inserimento manuale in base all'atto di convenzione dell'ente in corso d'anno. | `fin_percentualeCoperturaPostoSegretario` |
| Retribuzione di Risultato (10% - 15%) | D. Non gestibili dal wizard | Dipende dal rendiconto del monte salari specifico e dalla delibera del sindaco. | `va_art61c2_CCNL2024_retribuzioneRisultato10` |
| Incrementi contrattuali (0,22% e 0,80% MS 2021) | D. Non gestibili dal wizard | Calcolo autonomo su base Monte Salari 2021 specifico del Segretario. | `va_art40c1_CCNL2026_incremento080MS2021` |

---

## 9. Sovrapposizioni e dipendenze con le altre pagine
- **Indipendenza Funzionale**: La pagina non ha relazioni dirette con il Fondo dipendenti o delle EQ, operando su un capitolo di bilancio separato.
- **Interferenza sul Tetto Complessivo**: Pur essendo capitoli indipendenti, il superamento del tetto del Segretario riduce lo spazio finanziario accessorio per il personale dipendente (e viceversa), in quanto il tetto dell'Art. 23 c. 2 è unico per tutto l'ente.

---

## 10. Criticità, ambiguità e domande aperte

| Livello | Descrizione | File coinvolti | Effetto potenziale | Proposta di verifica |
|---|---|---|---|---|
| **ERRORE PROBABILE** | **Mancata inclusione delle voci del CCNL 2026 nel Motore**: Il motore di calcolo (`calculateSegretarioSubFund` in `fundCalculations.ts`) non somma le nuove chiavi variabili del CCNL 2026 (`va_art40c1_CCNL2026_incremento080MS2021`, `va_art40c2_CCNL2026_incremento022MS2021_L207` e `va_art21c1m_CCNL2026_incentiviFunzioniTecniche`), né la quota del CCNL precedente `va_art40c1_CCNL2022_2024_incremento0_80MonteSalari2021`. Queste sono esposte solo graficamente nella pagina. | `fundCalculations.ts`, `FondoSegretarioComunalePage.tsx` | La spesa totale calcolata per il Segretario a livello di consolidamento generale dell'ente risulta inferiore a quanto effettivamente deliberato e visualizzato a schermo. | Aggiornare il calcolo di `sommaRisorseVariabiliSeg` all'interno di `calculateSegretarioSubFund` per includere queste quattro chiavi. |
| **AMBIGUITÀ DA VERIFICARE** | **Esclusione del Segretario dal Limite nel Nuovo Motore**: Nel nuovo motore `fundEngine.ts`, il Segretario è escluso dal calcolo delle risorse rilevanti effettive dell'ente (`risorseRilevantiArt23`), mentre il suo valore storico del 2016 è incluso nel limite. Nel vecchio motore era parzialmente incluso. | `fundEngine.ts` (calculation) | Il calcolo della compliance Art. 23 dell'ente risulta distorto e non veritiero. | Uniformare le logiche: se si include la base storica 2016 nel limite comune, la spesa corrente rilevante del Segretario deve concorrere a consumare quel limite. |

---

## 11. Sintesi operativa finale
La pagina delle risorse del Segretario Comunale delinea correttamente le voci fisse e variabili e applica la percentuale di copertura del posto. Tuttavia, si registrano gravi disallineamenti di calcolo tra frontend e backend per via della mancata integrazione delle nuove voci contrattuali del CCNL 2026 e del CCNL precedente nel motore di calcolo, oltre a una mancata inclusione della spesa rilevante del Segretario all'interno del calcolo complessivo dell'Art. 23 c. 2.
Si raccomanda vivamente di allineare le variabili sommate nel motore di calcolo e di integrare il Segretario nella compliance centralizzata.
