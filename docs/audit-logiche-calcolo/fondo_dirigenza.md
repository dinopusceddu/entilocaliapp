# Fondo Dirigenza

## 1. Scopo della pagina
Questa pagina presidia la costituzione, la ripartizione e il controllo del **Fondo per il finanziamento della retribuzione di posizione e di risultato del personale con qualifica dirigenziale**.
La pagina serve a:
- Raccogliere ed aggregare le risorse stabili destinate alla dirigenza (base storica 2020, incrementi contrattuali stabilizzati, RIA dei cessati);
- Gestire le risorse variabili della dirigenza (sponsorizzazioni, residui dell'anno precedente, incentivi ex lege, incrementi in deroga);
- Effettuare il confronto tra la spesa corrente rilevante e la spesa storica ex **Art. 23, comma 2, del D.Lgs. 75/2017** per la quota parte della dirigenza;
- Monitorare l'utilizzo del fondo per l'erogazione degli incarichi ad interim dirigenziali o arretrati di risultato.

Negli enti locali provvisti di posizioni dirigenziali, la dirigenza dispone di un fondo autonomo regolato dall'apposito CCNL dell'Area delle Funzioni Locali (sezione Dirigenti). Tuttavia, ai fini del limite nazionale della spesa accessoria, il Fondo Dirigenza concorre insieme al Fondo dipendenti, alle EQ ed al Segretario a determinare il tetto complessivo del trattamento accessorio dell'ente.

---

## 2. File analizzati
| File | Funzione |
|---|---|
| `src/pages/FondoDirigenzaPage.tsx` | Componente React principale dell'interfaccia utente. Gestisce la visualizzazione delle voci, calcola i totali del finanziamento e degli utilizzi, e determina la ripartizione tra quota soggetta ed esclusa dal limite dell'Art. 23. |
| `src/logic/calculation/fundEngine.ts` | Motore di calcolo principale dell'applicazione, che integra i risultati parziali del sub-fund della dirigenza. |
| `src/logic/calculation/fundCalculations.ts` | Contiene la funzione `calculateDirigenzaSubFund` che calcola i subtotali stabili e variabili della dirigenza per il motore. |
| `src/schemas/fundDataSchemas.ts` | Valida lo schema dei dati della dirigenza tramite `FondoDirigenzaDataSchema`. |

---

## 3. Modello dati utilizzato
Il modello dati è contenuto nell'oggetto `state.fundData.fondoDirigenzaData` ed è convalidato dallo schema `FondoDirigenzaDataSchema`.

| Gruppo Dati | Campo Tecnico / Oggetto | Origine | Natura | Descrizione |
|---|---|---|---|---|
| **Dati Finanziamento** | `st_art57c2a_CCNL2020_unicoImporto2020`, `st_art57c2a_CCNL2020_riaPersonaleCessato2020`, `st_art56c1_CCNL2020_incremento1_53MonteSalari2015`, `st_art57c2c_CCNL2020_riaCessatidallAnnoSuccessivo`, `st_art57c2e_CCNL2020_risorseAutonomeStabili`, `st_art39c1_CCNL2024_incremento2_01MonteSalari2018`, `st_art24c1_CCNL2022_2024_incremento3_05MonteSalari2021` (stabili) | Input manuale | Annuale / Storico | Risorse stabili per la retribuzione di posizione, RIA dei cessati ed incrementi stabili contrattuali. |
| **Dati Variabili** | `va_art57c2b_CCNL2020_risorseLeggeSponsor`, `va_art57c2d_CCNL2020_sommeOnnicomprensivita`, `va_art57c2e_CCNL2020_risorseAutonomeVariabili`, `va_art57c3_CCNL2020_residuiAnnoPrecedente`, `va_dl13_2023_art8c3_incrementoPNRR`, `va_art39c1_CCNL2024_recupero0_46MonteSalari2018_2020`, `va_art39c1_CCNL2024_recupero2_01MonteSalari2018_2021_2023`, `va_art39c2_CCNL2024_incremento0_22MonteSalari2018_valorizzazione`, `va_art24c3_CCNL2022_2024_incremento0_22MonteSalari2021`, `va_art33c2_DL34_2019_incrementoDeroga`, `va_compensiExLege_rilevanti`, `va_compensiExLege_nonRilevanti` | Input manuale | Annuale | Risorse variabili destinate a risultato, sponsorizzazioni, residui ed incrementi in deroga. |
| **Dati Controllo / Decurtazioni** | `lim_art23c2_DLGS75_2017_adeguamentoAnnualeTetto2016`, `lim_art4_DL16_2014_misureMancatoRispettoVincoli` | Input manuale | Annuale | Decurtazione o adeguamento per rispetto tetto e sanzioni di bilancio. |
| **Dati Ripartizione / Utilizzo** | `u_art64c1_CCNL2024_coperturaInterimDirigenziale`, `u_art24c2_CCNL2026_arretratiRisultato` | Input manuale | Annuale | Costi per utilizzi specifici come supplenze/interim ed arretrati. |
| **Output Calcolato** | `lim_totaleParzialeRisorseConfrontoTetto2016` | Calcolo automatico | Annuale | Totale delle risorse che incidono sul limite dell'Art. 23 c. 2. |

---

## 4. Logica generale di calcolo della pagina
La pagina calcola il totale delle risorse disponibili per il Fondo Dirigenza e ne isola la quota soggetta al limite del salario accessorio.

### A. Calcolo del Finanziamento Complessivo della Dirigenza
Le risorse sono aggregate in base alla stabilità e regolate da decurtazioni finali:
- **Somma Stabili**: Aggrega l'importo unico consolidato al 2020 (`st_art57c2a_unicoImporto2020`), la RIA del personale cessato, gli incrementi contrattuali stabili (1,53% MS 2015, 2,01% MS 2018, 3,05% MS 2021) e le risorse autonome stabili dell'ente.
- **Somma Variabili**: Aggrega sponsorizzazioni, avanzi del risultato dell'anno precedente, onnicomprensività, recuperi dei rinnovi precedenti, quote di incremento PNRR e compensi ex lege.
- **Totale Reale Disponibile**: `Somma Stabili + Somma Variabili + Adeguamento Tetto 2016 - Decurtazione Art. 4 D.L. 16/2014`.

### B. Gestione del Limite Art. 23 c. 2 per la Dirigenza
Per il confronto con il tetto di spesa storica 2016:
- **Voci Rilevanti (Soggette)**: Solo le voci stabili storiche o quelle variabili collegate alla produttività/risultato che non godono di deroga espressa di legge. Nello specifico:
  - Unico Importo 2020;
  - RIA Personale Cessato 2020;
  - RIA Cessati Anno Successivo;
  - Risorse Autonome Stabili dell'ente;
  - Somme per Onnicomprensività;
  - Risorse Autonome Variabili;
  - Incremento in deroga D.L. 34/2019;
  - Compensi ex Lege Rilevanti.
- **Voci Escluse (In deroga)**: Gli incrementi del monte salari legati ai rinnovi nazionali (1,53%, 2,01%, 3,05% stabili, e 0,22% variabile), i residui dell'anno precedente, le sponsorizzazioni, il PNRR e i compensi ex lege specificamente esclusi.
- **Formula Rilevanza (Tetto 2016)**: `Totale Rilevante = Unico Importo 2020 + RIA Cessati 2020 + RIA Cessati Anno Successivo + Risorse Autonome Stabili + Onnicomprensività + Risorse Autonome Variabili + Incremento Deroga DL 34 + Compensi ex Lege Rilevanti`.

---

## 5. Tabella analitica voce per voce

| Voce visibile in pagina | Chiave tecnica | Fonte normativa / contrattuale | Natura della voce | Base di calcolo descritta a parole | Formula tecnica ricostruita | Origine dati | Effetto sul totale pagina | Effetto Art. 23 | Note / criticità |
|---|---|---|---|---|---|---|---|---|---|
| Unico importo 2020 | `st_art57c2a_CCNL2020_unicoImporto2020` | Art. 57 c. 2 lett. a) CCNL 17.12.2020 | Stabile | Importo consolidato di retribuzione di posizione e risultato nell'anno 2020 certificato dagli organi di controllo. | Valore inserito | Manuale | Aggiunge (+) | Soggetto | Base stabile di partenza del fondo. |
| RIA personale cessato 2020 | `st_art57c2a_CCNL2020_riaPersonaleCessato2020` | Art. 57 c. 2 lett. a) CCNL 17.12.2020 | Stabile | Quota di RIA del personale dirigenziale cessato dal servizio fino al 31 dicembre 2020. | Valore inserito | Manuale | Aggiunge (+) | Soggetto | Storica e fissa. |
| Incremento 1,53% MS 2015 | `st_art56c1_CCNL2020_incremento1_53MonteSalari2015` | Art. 56 c. 1 CCNL 17.12.2020 | Stabile | Incremento contrattuale stabile a valere dal 2018, pari all'1,53% del Monte Salari 2015. | Valore inserito | Manuale | Aggiunge (+) | Escluso | Voce contrattuale in deroga. |
| RIA cessati dall'anno successivo | `st_art57c2c_CCNL2020_riaCessatidallAnnoSuccessivo` | Art. 57 c. 2 lett. c) CCNL 17.12.2020 | Stabile | RIA del personale dirigenziale cessato nell'esercizio precedente che incrementa stabilmente il fondo. | Valore inserito | Manuale | Aggiunge (+) | Soggetto | Include i ratei di RIA dell'anno di cessazione. |
| Risorse autonome stabili | `st_art57c2e_CCNL2020_risorseAutonomeStabili` | Art. 57 c. 2 lett. e) CCNL 17.12.2020 | Stabile | Risorse stanziate autonomamente dall'ente nei limiti della capacità di bilancio e del tetto di spesa. | Valore inserito | Manuale | Aggiunge (+) | Soggetto | Incremento stabile discrezionale. |
| Incremento 2,01% MS 2018 | `st_art39c1_CCNL2024_incremento2_01MonteSalari2018` | Art. 39 c. 1 CCNL 16.07.2024 | Stabile | Incremento contrattuale stabile del 2,01% del Monte Salari dirigenza 2018 a valere dal 2021. | Valore inserito | Manuale | Aggiunge (+) | Escluso | Incremento contrattuale escluso ex legge. |
| Incremento 3,05% MS 2021 | `st_art24c1_CCNL2022_2024_incremento3_05MonteSalari2021` | Art. 24 c. 1 CCNL 2022-2024 | Stabile | Incremento stabile del 3,05% del Monte Salari 2021 destinato a retribuzione di posizione o risultato. | Valore inserito | Manuale | Aggiunge (+) | Escluso | Escluso dal tetto. |
| Risorse legge sponsor | `va_art57c2b_CCNL2020_risorseLeggeSponsor` | Art. 57 c. 2 lett. b) CCNL 17.12.2020 | Variabile | Entrate da sponsorizzazioni, accordi di collaborazione o convenzioni per prestazioni dei dirigenti. | Valore inserito | Manuale | Aggiunge (+) | Escluso | Risorsa esterna in deroga. |
| Somme onnicomprensività | `va_art57c2d_CCNL2020_sommeOnnicomprensivita` | Art. 57 c. 2 lett. d) CCNL 17.12.2020 | Variabile | Somme derivanti dall'applicazione del principio di onnicomprensività del trattamento dei dirigenti. | Valore inserito | Manuale | Aggiunge (+) | Soggetto | Confluiscono nel fondo per finanziare il risultato. |
| Risorse autonome variabili | `va_art57c2e_CCNL2020_risorseAutonomeVariabili` | Art. 57 c. 2 lett. e) CCNL 17.12.2020 | Variabile | Quota variabile stanziata autonomamente dall'ente nei limiti della capacità di bilancio. | Valore inserito | Manuale | Aggiunge (+) | Soggetto | Incremento variabile discrezionale. |
| Residui anno precedente | `va_art57c3_CCNL2020_residuiAnnoPrecedente` | Art. 57 c. 3 CCNL 17.12.2020 | Variabile | Importi residui non spesi del fondo dell'esercizio precedente che incrementano il risultato una tantum. | Valore inserito | Manuale | Aggiunge (+) | Escluso | Trascinamento di somme già verificate. |
| Incremento accessorio PNRR | `va_dl13_2023_art8c3_incrementoPNRR` | Art. 8 c. 3 D.L. 13/2023 | Variabile | Incremento variabile pro-quota (fino al 5%) del trattamento accessorio legato ad attività PNRR. | Valore inserito | Manuale | Aggiunge (+) | Escluso | Risorsa esterna in deroga speciale. |
| Recupero 0,46% MS 2018 | `va_art39c1_CCNL2024_recupero0_46MonteSalari2018_2020` | Art. 39 c. 1 CCNL 16.07.2024 | Variabile | Recupero una tantum dell'incremento dello 0,46% MS 2018 per l'esercizio 2020. | Valore inserito | Manuale | Aggiunge (+) | Escluso | Risorsa contrattuale arretrata. |
| Recupero 2,01% MS 2018 | `va_art39c1_CCNL2024_recupero2_01MonteSalari2018_2021_2023` | Art. 39 c. 1 CCNL 16.07.2024 | Variabile | Recupero una tantum dell'incremento dello 2,01% MS 2018 per gli esercizi 2021, 2022 e 2023. | Valore inserito | Manuale | Aggiunge (+) | Escluso | Risorsa contrattuale arretrata. |
| Incremento 0,22% MS 2018 | `va_art39c2_CCNL2024_incremento0_22MonteSalari2018_valorizzazione` | Art. 39 c. 2 CCNL 16.07.2024 | Variabile | Ulteriore incremento fino allo 0,22% MS 2018 per la valorizzazione del merito dei dirigenti. | Valore inserito | Manuale | Aggiunge (+) | Escluso | Escluso dal tetto. |
| Incremento 0,22% MS 2021 | `va_art24c3_CCNL2022_2024_incremento0_22MonteSalari2021` | Art. 24 c. 3 CCNL 2022-2024 | Variabile | Incremento variabile dello 0,22% MS 2021 destinato a incrementare il risultato. | Valore inserito | Manuale | Aggiunge (+) | Escluso | Escluso dal tetto. |
| Incremento deroga D.L. 34/2019 | `va_art33c2_DL34_2019_incrementoDeroga` | Art. 33 D.L. 34/2019 | Variabile | Eventuale incremento straordinario in deroga realizzato per adeguare la spesa del personale. | Valore inserito | Manuale | Aggiunge (+) | Soggetto | Incide sul limite complessivo dell'ente. |
| Compensi ex Lege Rilevanti | `va_compensiExLege_rilevanti` | Dich. Congiunta n. 1, CCNL 11/11/2025 | Variabile | Compensi derivanti da norme speciali transitate nel fondo e soggetti a tetto in assenza di deroga. | Valore inserito | Manuale | Aggiunge (+) | Soggetto | Inserimento manuale. |
| Compensi ex Lege Non Rilevanti | `va_compensiExLege_nonRilevanti` | Dich. Congiunta n. 1, CCNL 11/11/2025 | Variabile | Compensi ex lege transitati nel fondo ma esclusi dal tetto per espressa deroga nella fonte primaria. | Valore inserito | Manuale | Aggiunge (+) | Escluso | Escluso per deroga speciale. |
| Adeguamento annuale tetto 2016 | `lim_art23c2_DLGS75_2017_adeguamentoAnnualeTetto2016` | Art. 23 c. 2 D.Lgs. 75/2017 | Decurtazione Limiti | Regolazione annuale (+ o -) applicata al fondo per riallineare la spesa della dirigenza al tetto 2016. | Valore inserito | Manuale | Regola (+/-) | Soggetto | Campo di regolazione manuale. |
| Sanzioni DL 16/2014 | `lim_art4_DL16_2014_misureMancatoRispettoVincoli` | Art. 4 D.L. 16/2014 | Decurtazione Finale | Misure correttive e riduzioni applicate in caso di mancato rispetto di vincoli finanziari. | Valore inserito | Manuale | Sottrae (-) | Escluso | Riduce realmente il totale disponibile. |

---

## 6. Subtotali e totali prodotti dalla pagina
La pagina calcola in tempo reale:

1. **SOMMA RISORSE STABILI**
   - *Formula*: Somma dei valori delle 7 voci stabili.
   - *Significato*: Rappresenta la quota fissa consolidata del Fondo Dirigenza per l'ente.
2. **SOMMA RISORSE VARIABILI**
   - *Formula*: Somma dei valori delle 12 voci variabili.
   - *Significato*: Rappresenta la quota variabile una tantum (onnicomprensività, sponsor, residui) del Fondo Dirigenza.
3. **TOTALE RISORSE EFETTIVAMENTE DISPONIBILI**
   - *Formula*: `Somma Stabili + Somma Variabili + Adeguamento Tetto 2016 - Sanzioni DL 16/2014`.
   - *Significato*: È l'importo complessivo reale che l'ente stanzia a bilancio e può distribuire per il trattamento accessorio dei dirigenti (totale reale della pagina).
4. **TOTALE RISORSE ESCLUSE DAL LIMITE**
   - *Formula*: `Somma Stabili + Somma Variabili - lim_totaleParzialeRisorseConfrontoTetto2016`.
   - *Significato*: La quota di spesa della dirigenza esclusa dal tetto dell'Art. 23 c. 2 (es. incrementi contrattuali stabili e variabili dello 0,22% e 3,05%, residui, sponsor).

---

## 7. Collegamenti con Art. 23, comma 2, D.Lgs. 75/2017
Le risorse del Fondo Dirigenza concorrono alla compliance dell'Art. 23 c. 2 dell'ente.
- **Dato Storico 2016**: La base storica del Fondo Dirigenza 2016 (`historicalData.fondoDirigenza2016`) viene aggregata alla base comune dell'ente.
- **Rilevanza corrente (Anomalia)**:
  - *Nel motore di calcolo principale (`src/logic/calculation/fundEngine.ts`)*: La Dirigenza è **esclusa** dal calcolo delle risorse rilevanti effettive `risorseRilevantiArt23`.
  - *Nel motore legacy (`src/logic/fundEngine.ts`)*: Le risorse stabili della dirigenza erano incluse in `ammontareSoggettoLimite2016` se l'ente era configurato come provvisto di personale dirigente (`annualData.hasDirigenza === true`).
  - La pagina produce unicamente il valore `lim_totaleParzialeRisorseConfrontoTetto2016`, che rappresenta il dato da aggregare esternamente per il controllo generale.

---

## 8. Collegamenti con il wizard 2026
Il wizard contrattuale 2026 non gestisce la dirigenza, per cui tutte le voci del fondo rimangono interamente in carico all'inserimento manuale dell'ente:

| Voce / Campo | Categoria | Motivazione | Destinazione |
|---|---|---|---|
| Incrementi del Monte Salari 2018 e 2021 | D. Non gestibili dal wizard | Richiedono l'analisi del monte salari specifico della sola area dirigenziale. | `st_art39c1_CCNL2024_incremento2_01MonteSalari2018` e `st_art24c1_CCNL2022_2024_incremento3_05MonteSalari2021` |
| RIA Personale Cessato | D. Non gestibili dal wizard | Richiede l'inserimento manuale in base alle cessazioni storiche e correnti certificate dei dirigenti. | `st_art57c2a_CCNL2020_riaPersonaleCessato2020` e `st_art57c2c_CCNL2020_riaCessatidallAnnoSuccessivo` |

---

## 9. Sovrapposizioni e dipendenze con le altre pagine
- **Indipendenza Funzionale**: Il Fondo Dirigenza opera su capitoli di bilancio separati e non ha dipendenze dirette con il Fondo dipendenti o delle EQ.
- **Interferenza sul Tetto Complessivo**: La spesa rilevante della dirigenza consuma il limite dell'Art. 23 dell'ente. Di conseguenza, un eventuale aumento del fondo dirigenziale riduce lo spazio finanziario disponibile per i dipendenti (e viceversa), in quanto il tetto dell'Art. 23 c. 2 è unico per l'ente.

---

## 10. Criticità, ambiguità e domande aperte

| Livello | Descrizione | File coinvolti | Effetto potenziale | Proposta di verifica |
|---|---|---|---|---|
| **AMBIGUITÀ DA VERIFICARE** | **Esclusione della Dirigenza dal Limite nel Nuovo Motore**: Nel nuovo motore `fundEngine.ts`, la Dirigenza è esclusa dal calcolo delle risorse rilevanti effettive dell'ente (`risorseRilevantiArt23`), mentre il suo valore storico del 2016 è incluso nel limite. Nel vecchio motore era inclusa se `hasDirigenza === true`. | `fundEngine.ts` (calculation) | Il calcolo della compliance dell'ente risulta distorto, mostrando una conformità fittizia per gli enti con dirigenza attiva. | Uniformare le logiche: se si include la base storica della dirigenza nel limite complessivo, la spesa corrente rilevante della dirigenza deve concorrere a consumare quel limite. |

---

## 11. Sintesi operativa finale
La pagina del Fondo Dirigenza gestisce in modo completo le fonti di finanziamento stabili e variabili e gli utilizzi per incarichi ad interim ed arretrati. Tuttavia, l'esclusione della spesa corrente rilevante della dirigenza dal calcolo centralizzato della compliance dell'Art. 23 c. 2 del nuovo motore di calcolo costituisce un'importante anomalia che inficia la correttezza del cruscotto di compliance dell'ente.
Si raccomanda di verificare l'esatto coordinamento del fondo dirigenziale nel controllo centralizzato ed allineare le logiche di calcolo del backend.
