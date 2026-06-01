# Fondo accessorio personale dipendente

## 1. Scopo della pagina
Questa pagina costituisce l'hub centrale del modulo di costituzione del **Fondo risorse decentrate per il personale dipendente (comparto non dirigente ed ex-posizioni organizzative)**. Gestisce l'inserimento, la determinazione e la validazione contabile di tutte le fonti di finanziamento del salario accessorio per l'anno di riferimento (2026 o successivi).
La pagina serve a:
- Raccogliere ed aggregare le risorse stabili (fisse) e variabili (soggette e non soggette a vincoli);
- Presidiare i limiti massimi e i tetti derivanti dalla normativa nazionale e dai rinnovi contrattuali;
- Mostrare un **prospetto preliminare di conformità all'Art. 23, comma 2, del D.Lgs. 75/2017 (Tetto 2016)** per la parte relativa al fondo del personale dipendente;
- Visualizzare le economie e i raccordi con il wizard contrattuale e normativo 2026.

I dati raccolti alimentano direttamente il calcolo delle risorse complessivamente disponibili dell'ente e costituiscono la base per la fase successiva di **Distribuzione delle risorse** tra le diverse indennità, performance ed utilizzi.

---

## 2. File analizzati
| File | Funzione |
|---|---|
| `src/pages/FondoAccessorioDipendentePage.tsx` | Componente React principale dell'interfaccia utente. Gestisce la visualizzazione delle voci, la sincronizzazione con i parametri del wizard 2026, e mostra il cruscotto di compliance dell'Art. 23 c. 2. |
| `src/logic/calculation/fundEngine.ts` | Motore di calcolo principale delle risorse accessorie dell'ente, dei totali di costituzione e della compliance dell'Art. 23 c. 2. |
| `src/logic/calculation/fundCalculations.ts` | Helper e sotto-funzioni del motore di calcolo, inclusa la risoluzione degli alias (D.L. 25/2025) e il calcolo parziale delle sezioni del fondo (`calculateFadTotals`). |
| `src/logic/fundFieldDefinitions.ts` | Contiene i metadati, le descrizioni funzionali, le fonti normative e i suggerimenti operativi di tutte le voci della costituzione e della distribuzione del fondo. |
| `src/data/strutturaFondo.json` | Configurazione dichiarativa delle voci, con l'assegnazione alla sezione di bilancio, l'operatore matematico (+ o -) e la rilevanza ai fini del limite dell'Art. 23. |
| `src/schemas/fundDataSchemas.ts` | Schemi Zod di validazione e convalida tipologica dei dati del fondo accessorio dipendente (`FondoDataBaseSchema`). |
| `src/contexts/AppContext.tsx` | Contesto di stato globale dell'applicazione che gestisce le azioni di aggiornamento dei dati e dei risultati di calcolo. |

---

## 3. Modello dati utilizzato
Il modello dati che alimenta la pagina è contenuto all'interno dell'oggetto `state.fundData.fondoAccessorioDipendenteData` e segue lo schema Zod `FondoDataBaseSchema` definito in `src/schemas/fundDataSchemas.ts`.

| Gruppo Dati | Campo Tecnico / Oggetto | Origine | Natura | Descrizione |
|---|---|---|---|---|
| **Dati di Costituzione** | `state.fundData.fondoAccessorioDipendenteData` | Input manuale + Wizard | Annuale / Storico | Contiene tutti gli importi specifici delle voci stabili, variabili e decurtazioni per il fondo dipendenti. |
| **Dati Generali Ente** | `state.fundData.annualData` | Wizard / Parametri generali | Annuale | Contiene variabili strutturali come: `simulatoreRisultati`, `calcolatoIncrementoPNRR3`, `fondoLavoroStraordinario`, `incrementoFondoStraordinario`, `ccnl2024`. |
| **Dati Storici** | `state.fundData.historicalData` | Wizard / Dati Generali | Storico | Contiene le basi storiche: `fondoSalarioAccessorioPersonaleNonDirEQ2016`, `fondoPersonaleNonDirEQ2018_Art23`, `fondoStraordinario2016`. |
| **Risultati di Calcolo** | `state.calculationResult` | Motore di calcolo (`fundEngine.ts`) | Calcolato (Output) | Contiene il DTO di conformità `compliance.art23Compliance` e i totali strutturati `totals`. |

---

## 4. Logica generale di calcolo della pagina
Il calcolo delle risorse del fondo accessorio si articola su due macro-livelli: il **Fondo accessorio reale costituito** (ciò che l'ente stanzia a bilancio e distribuisce al personale) e le **Risorse Rilevanti ai fini del limite dell'Art. 23, comma 2** (il valore usato per il controllo sul tetto storico 2016).

### A. Fondo Costituito Reale
Si compone sommando algebricamente i valori delle sezioni stabili e variabili:
1. **Risorse Stabili (Sezione B)**: Rappresentano le risorse storiche fisse e stabili dell'ente. Vengono sommate le voci ordinarie e gli incrementi contrattuali stabili, e sottratte le decurtazioni permanenti (es. tagli di legge storici, quota trasferita ad EQ).
   - *Nota 2026 (Art. 60)*: Dal 2026, la parte stabile reale viene ridotta per il conglobamento dell'indennità di comparto (`st_art60c2_CCNL2026_decurtazioneIndennitaComparto`). Questa decurtazione riduce realmente le risorse stabili spendibili.
   - *Formula reale*: `Totale Stabile = (Somma voci stabili positive - Somma voci stabili negative) + quota stabile CCNL 2024 (0,14%) - quota decurtazione Art. 60`.
2. **Risorse Variabili (Sezioni C & D)**: Rappresentano le risorse stanziate annualmente in base ad obiettivi, progetti o deroghe di legge.
   - *Variabili Soggette (Sezione C)*: Risorse che concorrono al limite Art. 23 (es. recupero evasione, scelte organizzative).
   - *Variabili Non Soggette (Sezione D)*: Deroghe escluse per legge o contratto (es. PNRR, quote 0,22%, avanzi vincolati storici, arretrati una tantum).
3. **Decurtazioni Finali (Sezione E)**: Eventuali riduzioni straordinarie del fondo (es. sanzioni ex Art. 4 D.L. 16/2014).
4. **Fondo Costituito Totale**: `Totale Stabile + Totale Variabile (Soggette + Non Soggette) - Decurtazioni Finali`.

### B. Risorse Rilevanti al Limite Art. 23 (Valore Soggetto)
Ai fini del rispetto del tetto 2016, il motore di calcolo ricostruisce il valore "virtuale" della spesa accessoria corrente che incide sul tetto:
1. **Base Soggetta Lorda**: Somma di `sommaStabiliSoggetteLimite` (le sole stabili positive/negative con `isRelevantToArt23Limit === true`), `sommaVariabiliSoggette_Dipendenti` e lo **straordinario corrente** (`fondoLavoroStraordinario + incrementoFondoStraordinario` al netto di verifiche anti-doppio conteggio).
2. **Decurtazione Reale Art. 60**: Dal valore soggetto lordo viene detratto il valore reale della riduzione permanente per il conglobamento dell'indennità di comparto (Art. 60).
3. **Reintegro Figurativo Art. 60**: Per garantire la neutralità finanziaria del limite storico (evitando che una riduzione tabellare contrattuale liberi surrettiziamente spazio nel tetto), l'importo dell'Art. 60 viene riaggiunto integralmente come **computo figurativo positivo**.
4. **Risorse Rilevanti Effettive (Valore Soggetto)**: `Base Soggetta Lorda + EQ Soggette + Prog/Indennità Assorbite - Decurtazione Reale Art. 60 + Computo Figurativo Art. 60`. 
   *(In sostanza, l'effetto dell'Art. 60 si annulla sul limite, lasciandolo inalterato)*.

---

## 5. Tabella analitica voce per voce

| Voce visibile in pagina | Chiave tecnica | Fonte normativa / contrattuale | Natura della voce | Base di calcolo descritta a parole | Formula tecnica ricostruita | Origine dati | Effetto sul totale pagina | Effetto Art. 23 | Note / criticità |
|---|---|---|---|---|---|---|---|---|---|
| Unico importo consolidato 2017 | `st_art79c1_art67c1_unicoImporto2017` | Art. 79 c. 1 CCNL 16.11.2022 | Stabile | Importo storico fisso consolidato al 31.12.2017 certificato dai revisori. | Valore inserito | Manuale / CSV | Aggiunge (+) | Soggetto (tramite limite 2016 complessivo) | Base storica invariabile. |
| Alte professionalità non utilizzate | `st_art79c1_art67c1_alteProfessionalitaNonUtil` | Art. 79 c. 1 CCNL 16.11.2022 | Stabile | Quote destinate ad alte professionalità (ora EQ) e non utilizzate al 31.12.2017 se non incluse nell'unico importo. | Valore inserito | Manuale | Aggiunge (+) | Soggetto (tramite limite 2016 complessivo) | Verificare rischio duplicazione con unico importo. |
| Incremento €83,20/unità | `st_art79c1_art67c2a_incr8320` | Art. 79 c. 1 CCNL 16.11.2022 | Stabile | Incremento fisso pro-capite calcolato convenzionalmente sul personale al 31.12.2015. | Valore inserito | Manuale / CSV | Aggiunge (+) | Escluso (ex lege) | Rilevante per il calcolo del limite 48% (D.L. 25/2025). |
| Incrementi stipendiali differenziali | `st_art79c1_art67c2b_incrStipendialiDiff` | Art. 79 c. 1 CCNL 16.11.2022 | Stabile | Oneri differenziali contrattuali ex CCNL 2018. | Valore inserito | Manuale | Aggiunge (+) | Escluso | Voce contrattuale pregressa. |
| Integrazione RIA personale cessato anno precedente | `st_art79c1_art4c2_art67c2c_integrazioneRIA` | Art. 79 c. 1 CCNL 16.11.2022 | Stabile | Somma della RIA del personale cessato nell'esercizio precedente che confluisce stabilmente nel fondo. | Valore inserito | Manuale / CSV | Aggiunge (+) | Soggetto (tramite limite 2016 complessivo) | Deve coincidere con i calcoli dei cessati con RIA. |
| Risorse riassorbite | `st_art79c1_art67c2d_risorseRiassorbite165` | Art. 79 c. 1 CCNL 16.11.2022 | Stabile | Quote fisse riassorbite a seguito di passaggi ordinamentali ex D.Lgs. 165/2001. | Valore inserito | Manuale | Aggiunge (+) | Soggetto (tramite limite 2016 complessivo) | Storica e fissa. |
| Risorse personale trasferito | `st_art79c1_art15c1l_art67c2e_personaleTrasferito` | Art. 79 c. 1 CCNL 16.11.2022 | Stabile | Risorse fisse associate a passaggi di personale per mobilità o decentramento funzioni. | Valore inserito | Manuale | Aggiunge (+) | Soggetto (trasferimento di limite) | Comporta variazione del limite 2016 dell'ente. |
| Regioni: riduzione stabile posti dirig. | `st_art79c1_art15c1i_art67c2f_regioniRiduzioneDirig` | Art. 79 c. 1 CCNL 16.11.2022 | Stabile | Riduzione stabile dei posti dirigenziali per Regioni e Città Metropolitane. | Valore inserito | Manuale | Aggiunge (+) | Soggetto (tramite limite 2016 complessivo) | Disabilitato se l'ente non è una Regione o Città Metropolitana. |
| Riduzione stabile straordinario | `st_art79c1_art14c3_art67c2g_riduzioneStraordinario` | Art. 79 c. 1 CCNL 16.11.2022 | Stabile | Risparmi strutturali del fondo straordinario consolidati in parte stabile del fondo accessorio. | Valore inserito | Manuale | Aggiunge (+) | Soggetto (tramite limite 2016 complessivo) | Richiede parallelo decremento del fondo straordinario. |
| Incremento €84,50/unità | `st_art79c1b_euro8450` | Art. 79 c. 1 lett. b) CCNL 16.11.2022 | Stabile | Incremento stabile pro-capite calcolato convenzionalmente sul personale in servizio al 31.12.2018. | Valore inserito | Manuale / CSV | Aggiunge (+) | Escluso (contrattuale) | Voce fissa consolidata dal triennio 2019-2021. |
| Incremento stabile consistenza personale | `st_art79c1c_incrementoStabileConsistenzaPers` | Art. 79 c. 1 lett. c) CCNL 16.11.2022 | Stabile | Incremento stabile legato all'adeguamento pro-capite per l'aumento della consistenza organica media rispetto al 2018. | `Math.max(0, proCapite2018 * deltaFte2018)` | Calcolato (automatico/modificabile) | Aggiunge (+) | **Soggetto** | Configurato come risorsa soggetta a limite ex MOD-028 per consumare la capienza e prevenire doppie agevolazioni. |
| Differenziali stipendiali 2022 | `st_art79c1d_differenzialiStipendiali2022` | Art. 79 c. 1 lett. d) CCNL 16.11.2022 | Stabile | Risorse contrattuali stabili per il nuovo ordinamento dei differenziali. | Valore inserito | Manuale | Aggiunge (+) | Escluso | Strutturale dal 2022. |
| Differenziali stipendiali B3-D3 | `st_art79c1bis_diffStipendialiB3D3` | Art. 79 c. 1-bis CCNL 16.11.2022 | Stabile | Risorse stabili a presidio del differenziale economico per i profili ex B3 e D3. | Valore inserito | Manuale | Aggiunge (+) | Escluso | Voce contrattuale ad personam. |
| Incremento stabile 0,14% MS 2021 | `st_art58c1_CCNL2026_incremento014_MS2021` | Art. 58 c. 1 CCNL 23.02.2026 | Stabile | Incremento stabile programmato dal rinnovo 2026, calcolato come lo 0,14% del Monte Salari 2021. | `MS2021 * 0.14%` | Calcolato dal wizard | Aggiunge (+) | Escluso (Art. 58 c. 4) | Calcolato dal wizard, non sommato nel subtotale parziale ma sommato globalmente. |
| Incremento D.L. 25/2025 (Limite 48%) | `st_incrementoDL25_2025` | Art. 14 c. 1-bis D.L. 25/2025 | Stabile | Incremento per l'armonizzazione dei trattamenti accessori per enti sotto la soglia del 48%. | Valore inserito | Manuale (suggerito dal wizard) | Aggiunge (+) | Escluso (deroga speciale) | Valore massimo teorico ereditato dal simulatore. |
| Taglio fondo DL 78/2010 | `st_taglioFondoDL78_2010` | Art. 9 c. 2-bis D.L. 78/2010 | Decurtazione Stabile | Riduzione permanente della parte stabile legata ai vecchi blocchi di legge e cessazioni storiche. | Valore inserito | Manuale | Sottrae (-) | Soggetto (riduce il tetto) | Nota di trasparenza: usata come presidio generico delle riduzioni storiche. |
| Riduzioni personale ATA | `st_riduzioniPersonaleATA_PO_Esternalizzazioni` | Disposizioni di bilancio | Decurtazione Stabile | Riduzioni stabili dovute ad esternalizzazioni di servizi o passaggi di personale a comparto scuola (ATA). | Valore inserito | Manuale | Sottrae (-) | Soggetto (riduce il tetto) | Diminuisce in via permanente la capienza del fondo. |
| Decurtazione PO/AP enti dirigenza | `st_art67c1_decurtazionePO_AP_EntiDirigenza` | Art. 67 c. 1 CCNL 21.05.2018 | Decurtazione Stabile | Riduzione permanente del fondo non dirigente per finanziare le PO negli enti con dirigenza. | Valore inserito | Manuale | Sottrae (-) | Soggetto (riduce il tetto) | Riguarda solo enti provvisti di posizioni dirigenziali. |
| Riduzione per incremento risorse EQ | `st_riduzionePerIncrementoEQ` | Art. 7 c. 4 lett. u) CCNL 16.11.2022 | Decurtazione Stabile | Riduzione stabile del fondo dipendenti a favore del budget EQ (ex PO). | Valore da pagina EQ | Calcolato (automatico) | Sottrae (-) | Escluso (spostamento interno) | Riduce il tetto dipendenti e aumenta quello EQ, mantenendo inalterata la spesa totale. |
| Decurtazione stabile per conglobamento indennità comparto | `st_art60c2_CCNL2026_decurtazioneIndennitaComparto` | Art. 60 c. 2 CCNL 23.02.2026 | Decurtazione Stabile | Riduzione stabile del fondo per conglobamento di quota dell'indennità comparto nei tabellari dal 2026. | Valore tabellare da wizard | Calcolato (automatico) | Sottrae (-) | Soggetto (ridotto reale e riaggiunto figurativo) | Riduce realmente il fondo. Raggiunge la neutralità sul limite Art. 23 tramite reintegro figurativo. |
| Riduzione per incremento fondo straordinario | `st_riduzioneFondoStraordinario` | Art. 20 c. 1 lett. a) CCNL 23.02.2026 | Decurtazione Stabile | Decremento stabile del fondo accessorio per finanziare un incremento dello straordinario. | Valore da Step 3 | Calcolato (automatico) | Sottrae (-) | Soggetto (riduce il tetto) | Calcolata automaticamente se attiva la spunta di riduzione stabile per straordinario. |
| Recupero evasione ICI/IMU | `vs_art4c3_art15c1k_art67c3c_recuperoEvasione` | Art. 67 c. 3 lett. c) CCNL 21.05.2018 | Variabile Soggetta | Quota variabile alimentata dal recupero dell'evasione fiscale accertata e riscossa. | Valore inserito | Manuale | Aggiunge (+) | Soggetto | Inseribile solo a fronte di reali riscossioni certificate. |
| Integrazione RIA cessati in anno | `vs_art4c2_art67c3d_integrazioneRIAMensile` | Art. 67 c. 3 lett. d) CCNL 21.05.2018 | Variabile Soggetta | Quota della RIA del personale cessato nell'anno di riferimento (mensilità residue pro-rata). | Valore inserito | Manuale | Aggiunge (+) | Soggetto | Nel fondo dell'anno successivo confluirà poi stabilmente. |
| Risorse personale case gioco | `vs_art67c3g_personaleCaseGioco` | Art. 67 c. 3 lett. g) CCNL 21.05.2018 | Variabile Soggetta | Somme per il personale impiegato in case da gioco. | Valore inserito | Manuale | Aggiunge (+) | Soggetto | Disabilitato se l'ente non gestisce case da gioco. |
| Max 1,2% monte salari 1997 | `vs_art79c2b_max1_2MonteSalari1997` | Art. 79 c. 2 lett. b) CCNL 16.11.2022 | Variabile Soggetta | Risorsa variabile calcolata come quota massima dello 1,2% del monte salari dell'anno 1997. | Valore inserito | Manuale | Aggiunge (+) | Soggetto | Limite storico massimo. Disabilitato per enti dissestati/in riequilibrio. |
| Integrazione personale trasferito (variabile) | `vs_art67c3k_integrazioneArt62c2e_personaleTrasferito` | Art. 67 c. 3 lett. k) CCNL 21.05.2018 | Variabile Soggetta | Quota variabile associata al trasferimento di personale per mobilità o decentramento. | Valore inserito | Manuale | Aggiunge (+) | Soggetto | Disabilitato per enti dissestati/in riequilibrio. |
| Risorse per scelte organizzative | `vs_art79c2c_risorseScelteOrganizzative` | Art. 79 c. 2 lett. c) CCNL 16.11.2022 | Variabile Soggetta | Somme variabili stanziate autonomamente dall'ente nei limiti della capacità di bilancio (incl. personale a tempo determinato). | Valore inserito | Manuale | Aggiunge (+) | Soggetto | Disabilitato per enti dissestati/in riequilibrio. |
| Sponsorizzazioni convenzioni | `vn_art15c1d_art67c3a_sponsorConvenzioni` | Art. 67 c. 3 lett. a) CCNL 21.05.2018 | Variabile Non Soggetta | Risorse da sponsorizzazioni o convenzioni con privati per prestazioni accessorie. | Valore inserito | Manuale | Aggiunge (+) | Escluso | Disabilitato per enti dissestati/in riequilibrio. |
| Quota rimborso spese notifica | `vn_art54_art67c3f_rimborsoSpeseNotifica` | Art. 67 c. 3 lett. f) CCNL 21.05.2018 | Variabile Non Soggetta | Rimborso spese di notifica spettante ai messi notificatori ex lege. | Valore inserito | Manuale | Aggiunge (+) | Escluso | Disabilitato per enti dissestati/in riequilibrio. |
| Piani di razionalizzazione | `vn_art15c1k_art16_dl98_art67c3b_pianiRazionalizzazione` | Art. 16 D.L. 98/2011 | Variabile Non Soggetta | Risorse alimentate dai risparmi certificati dei piani di razionalizzazione delle spese dell'ente. | Valore inserito | Manuale | Aggiunge (+) | Escluso | Disabilitato per enti dissestati/in riequilibrio. |
| Incentivi funzioni tecniche | `vn_art15c1k_art67c3c_incentiviTecniciCondoni` | Art. 45 D.Lgs. 36/2023 | Variabile Non Soggetta | Incentivi accantonati nei quadri economici delle opere pubbliche per funzioni tecniche interne. | Valore inserito | Manuale / CSV | Aggiunge (+) | Escluso | Voce esclusa per deroga di legge speciale. |
| Incentivi spese giudizio | `vn_art18h_art67c3c_incentiviSpeseGiudizioCensimenti` | Art. 67 c. 3 lett. c) CCNL 21.05.2018 | Variabile Non Soggetta | Compensi per avvocatura interna (da spese legali riscosse) e per censimenti ISTAT. | Valore inserito | Manuale | Aggiunge (+) | Escluso | Trattata come voce aggregata nel modello dati. |
| Risparmi straordinario | `vn_art15c1m_art67c3e_risparmiStraordinario` | Art. 67 c. 3 lett. e) CCNL 21.05.2018 | Variabile Non Soggetta | Risparmi certificati del fondo dello straordinario dell'esercizio precedente. | Valore inserito | Manuale | Aggiunge (+) | Escluso | Costituisce trascinamento di fondi già soggetti. |
| Regioni/Città Metro incremento % | `vn_art67c3j_regioniCittaMetro_art23c4_incrPercentuale` | Art. 67 c. 3 lett. j) CCNL 21.05.2018 | Variabile Non Soggetta | Incremento percentuale delle risorse variabili per Regioni e Città Metropolitane. | Valore inserito | Manuale | Aggiunge (+) | Escluso | Disabilitato se l'ente non corrisponde alla tipologia. |
| Somme non utilizzate esercizi precedenti | `vn_art80c1_sommeNonUtilizzateStabiliPrec` | Art. 80 c. 1 CCNL 16.11.2022 | Variabile Non Soggetta | Avanzi di parte stabile non spesi negli esercizi precedenti (trascinati in variabile). | Valore inserito | Manuale | Aggiunge (+) | Escluso | Quota una tantum finanziata da avanzo vincolato. |
| Incentivi riscossione IMU/TARI | `vn_l145_art1c1091_incentiviRiscossioneIMUTARI` | Art. 1 c. 1091 L. 145/2018 | Variabile Non Soggetta | Incentivi per il personale dei tributi alimentati da recupero dell'evasione IMU/TARI. | Valore inserito | Manuale | Aggiunge (+) | Escluso | Soggetta a condizioni di virtuosità finanziaria dell'ente. |
| Risparmi buoni pasto 2020 | `vn_l178_art1c870_risparmiBuoniPasto2020` | L. 178/2020 Art. 1 c. 870 | Variabile Non Soggetta | Risparmi storici straordinari da buoni pasto maturati nel 2020. | Valore inserito | Manuale | Aggiunge (+) | Escluso | Disabilitato per enti dissestati/in riequilibrio. |
| Risorse accessorie assunzioni deroga | `vn_dl135_art11c1b_risorseAccessorieAssunzioniDeroga` | D.L. 135/2018 Art. 11 c. 1-bis | Variabile Non Soggetta | Risorse accessorie collegate ad assunzioni straordinarie effettuate in deroga. | Valore inserito | Manuale | Aggiunge (+) | Escluso | Disabilitato per enti dissestati/in riequilibrio. |
| Incremento PNRR | `vn_dl13_art8c3_incrementoPNRR_max5stabile2016` | Art. 8 c. 3 D.L. 13/2023 | Variabile Non Soggetta | Incremento variabile per personale impegnato nei progetti PNRR. | Valore inserito | Manuale (suggerito dal wizard) | Aggiunge (+) | Escluso | Massimo 5% del fondo stabile 2016. Richiede spunta di virtuosità. |
| Incremento max 0,22% MS 2021 | `vn_art58c2_CCNL2026_incremento022_MS2021` | Art. 58 c. 2 CCNL 23.02.2026 | Variabile Non Soggetta | Incremento variabile opzionale del fondo calcolato come lo 0,22% del Monte Salari 2021. | `MS2021 * 0.22% * quotaFad` | Calcolato dal wizard | Aggiunge (+) | Escluso (Art. 58 c. 4) | Calcolato e popolato in modo automatico. |
| Arretrati 2024-2025 | `vn_art58_CCNL2026_arretrati2024_2025` | Art. 58 CCNL 23.02.2026 | Variabile Non Soggetta | Quota una tantum destinata a finanziare gli arretrati del rinnovo contrattuale per il 2024 e 2025. | Valore inserito | Manuale | Aggiunge (+) | Escluso | Destinato all'erogazione dei soli arretrati. |
| Misure per mancato rispetto vincoli | `fin_art4_dl16_misureMancatoRispettoVincoli` | Art. 4 D.L. 16/2014 | Decurtazione Finale | Sanzioni finanziarie applicate al fondo per irregolarità certificate nella contrattazione. | Valore inserito | Manuale | Sottrae (-) | Escluso | Riduce realmente il totale del fondo. |
| Decurtazione annuale per rispetto tetto 2016 | `cl_art23c2_decurtazioneIncrementoAnnualeTetto2016` | Art. 23, comma 2, D.Lgs. 75/2017 | Decurtazione Limiti | Decurtazione obbligatoria applicata in via automatica se le risorse soggette superano il tetto 2016. | `Math.max(0, valoreSoggetto - limite)` | Calcolato (automatico) | Sottrae (-) | Soggetto (riallinea la spesa al tetto) | Rende l'ente conforme al limite. |

---

## 6. Totali e subtotali prodotti dalla pagina
I principali indicatori calcolati in tempo reale sono:

1. **SOMMA RISORSE STABILI**
   - *Formula*: `(Somma delle voci stabili positive) - (Somma delle voci stabili negative) + quota stabile CCNL 2024 (0,14%) - quota decurtazione Art. 60`.
   - *Significato*: Rappresenta la capienza stabile ordinaria consolidata del fondo per l'anno in corso. È una risorsa reale spendibile.
2. **SOMMA RISORSE VARIABILI SOGGETTE AL LIMITE**
   - *Formula*: Somma di tutte le voci della Sezione C.
   - *Significato*: La componente variabile dell'anno che concorre a consumare il tetto dell'Art. 23.
3. **SOMMA RISORSE VARIABILI NON SOGGETTE AL LIMITE**
   - *Formula*: Somma delle voci della Sezione D + quota variabile contrattuale CCNL 2024 (es. 0,22%).
   - *Significato*: Il totale delle risorse in deroga (finanziamenti esterni o contrattuali esclusi) spendibili extra-limite.
4. **TOTALE RISORSE DISPONIBILI ALLA CONTRATTAZIONE** (Fondo Costituito Totale)
   - *Formula*: `Somma Stabili + Somma Variabili Soggette + Somma Variabili Non Soggette - Somma Decurtazioni Finali`.
   - *Significato*: È l'importo complessivo reale che l'ente ha istituito ed è spendibile per la contrattazione integrativa del personale dipendente.

---

## 7. Collegamenti con Art. 23, comma 2, D.Lgs. 75/2017
La pagina implementa un controllo **parziale** sul solo Fondo del personale dipendente, ma raccoglie le variabili di calcolo necessarie per determinare il rispetto del tetto 2016 complessivo dell'ente.

### Calcolo del Limite 2016 Attualizzato dell'Ente
Il limite storico viene determinato aggregando i valori storici registrati al 2016 per tutte le aree (non dirigenza, elevate qualificazioni, dirigenza, segretario) e aggiungendo l'adeguamento organico 2018:
`Limite = Fondo non dirig 2016 + EQ 2016 + Dirigenza 2016 + Segretario 2016 + Straordinario Storico 2016 + Adeguamento Variazione Personale (pro-capite 2018)`.
- **Rilevanza dello Straordinario Storico**: Il campo `historicalData.fondoStraordinario2016` costituisce la base corretta per lo straordinario storico. In sua assenza, scatta il **fallback transitorio** sullo straordinario corrente, sollevando un warning esplicito in arancione.

### Consumazione del Limite
Le risorse che "consumano" il limite includono:
- Tutte le risorse stabili del fondo dipendenti ad eccezione di quelle contrassegnate come contrattualmente escluse (es. 0,14%, €84,50, differenziali stipendiali);
- Le risorse stabili dell'area EQ (es. fondo PO 2017);
- Tutte le variabili soggette (Sezione C);
- Lo straordinario corrente (al netto del controllo del doppio conteggio);
- La quota dell'Art. 60 (reintegrata figurativamente).

---

## 8. Collegamenti con il wizard 2026
I campi della costituzione fondo sono in stretta relazione con l'istruttoria condotta nel wizard 2026:

| Voce / Campo | Categoria | Motivazione | Destinazione |
|---|---|---|---|
| Incremento 0,14% MS 2021 | A. Già trasferibili automaticamente | Calcolato in modo deterministico sul Monte Salari 2021 inserito nel wizard. | `st_art58c1_CCNL2026_incremento014_MS2021` |
| Incremento 0,22% MS 2021 | A. Già trasferibili automaticamente | Ripartito in proporzione alla spesa storica del fondo dopo che l'ente ha impostato la percentuale di incremento. | `vn_art58c2_CCNL2026_incremento022_MS2021` |
| Decurtazione Art. 60 | A. Già trasferibili automaticamente | Calcolata analiticamente o in forma aggregata in base al personale in servizio al 01.01.2026. | `st_art60c2_CCNL2026_decurtazioneIndennitaComparto` |
| Incremento D.L. 25/2025 | B. Trasferibile solo dopo conferma | Rappresenta un limite massimo teorico (fino al 48%). L'ente deve deliberare lo stanziamento effettivo. | `st_incrementoDL25_2025` |
| Incremento PNRR | B. Trasferibile solo dopo conferma | Calcolato nel limite massimo del 5% del fondo stabile 2016, richiede validazione delle condizioni di bilancio. | `vn_dl13_art8c3_incrementoPNRR_max5stabile2016` |
| Limite Art. 23 Attualizzato | C. Solo controllo, non trasferibile | Rappresenta il tetto massimo invalicabile di spesa per il salario accessorio dell'ente. | Box Prospetto Art. 23 |

---

## 9. Sovrapposizioni e dipendenze con le altre pagine
- **Dipendenza da Dati Generali/Storici**: Il limite attualizzato e i calcoli per l'incremento di consistenza dell'organico dipendono dai dati storici del personale 2018 (`personale2018PerArt23`) e dal tabellare 2023 (`spesaStipendiTabellari2023`).
- **Collegamento con la pagina EQ**: La voce di riduzione stabile `st_riduzionePerIncrementoEQ` è un valore inserito nella pagina delle Elevate Qualificazioni che si ripercuote automaticamente a detrazione nel fondo del personale dipendente. Se non c'è coerenza, si rischia un **doppio conteggio** o una mancata riduzione della spesa.
- **Rapporto con la pagina Distribuzione**: I vincoli di destinazione costringono ad allineare le entrate variabili vincolate (evasione, incentivi tecnici, IMU/TARI) con le corrispondenti allocazioni nella pagina di utilizzo delle risorse, onde evitare rilievi dei revisori dei conti.

---

## 10. Criticità, ambiguità e domande aperte

| Livello | Descrizione | File coinvolti | Effetto potenziale | Proposta di verifica |
|---|---|---|---|---|
| **SCELTA PROGETTUALE DA CONFERMARE** | **Verifica parziale vs complessiva**: Il Box in evidenza in alto effettua la compliance confrontando le sole risorse dipendenti + EQ contro il limite totale dell'ente (escludendo Segretario e Dirigenza dal `valoreSoggetto` ma includendoli nel `limite`). Questo rende il Box dipendente non auticonsistente per un ente con dirigenza o con segretario attivo. | `FondoAccessorioDipendentePage.tsx`, `fundEngine.ts` | Il funzionario potrebbe vedere un "Margine residuo" fittizio che in realtà è già consumato dal Segretario o dai Dirigenti. | Integrare una nota visiva che sommi i valori del Segretario e della Dirigenza nel calcolo del delta finale mostrato, o chiarire che il controllo del tetto è a livello di Ente. |
| **AMBIGUITÀ DA VERIFICARE** | **Art. 60 e reintegro**: La logica dell'Art. 60 riduce la parte stabile reale del fondo, ma viene reintegrata come computo figurativo. Se il funzionario inserisce la riduzione in costituzione ma non inserisce il corrispondente parametro contrattuale, scatta un disallineamento che viene segnalato come warning. | `FondoAccessorioDipendentePage.tsx` | Mancata riduzione reale del fondo o doppio conteggio della decurtazione. | Verificare che il calcolatore utilizzi sempre il valore effettivo inserito nella voce contabile, come già implementato ex MOD-028. |
| **AMBIGUITÀ DA VERIFICARE** | **D.L. 25/2025 e classificazione**: L'incremento del 48% (D.L. 25/2025) è configurato in `strutturaFondo.json` con `"isRelevantToArt23Limit": false` (quindi escluso). Tuttavia, la norma dice che l'incremento "opera in deroga al limite", ma concorre a ridefinire lo spazio finanziario della stabilità. | `strutturaFondo.json` | Errore nel computo del tetto se si sfora il limite complessivo. | Verificare con esperti contabili se l'importo debba confluire nel calcolo delle risorse rilevanti o se la deroga lo escluda del tutto dall'aggregato. |

---

## 11. Sintesi operativa finale
La pagina calcola correttamente la costituzione del fondo accessorio dipendenti sia in parte stabile che variabile, recependo tutti gli incrementi e le riduzioni del CCNL 2026 e dei decreti di legge (D.L. 25/2025 e PNRR). 
Per garantire la correttezza del calcolo complessivo dell'Art. 23 c. 2 dell'ente, l'utente deve inserire manualmente i dati storici del fondo straordinario 2016 per evitare il fallback transitorio sullo straordinario corrente.
Prima di procedere a modifiche del codice, è raccomandabile eseguire la suite di test unitari completi in `mod025ComplianceProspetto.test.ts` per accertarsi che le formule di reintegro dell'Art. 60 e le esclusioni stabili non vengano alterate.
