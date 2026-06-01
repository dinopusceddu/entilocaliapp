# Documentazione di Precheck — MOD-025 — Riallineamento pagina Costituzione Fondo personale dipendente e prospetto Art. 23

Questo documento costituisce il mini-audit tecnico e normativo per la pagina **Costituzione Fondo del personale dipendente** prima di procedere con le modifiche al codice.

---

## 1. Elenco delle sezioni attuali della pagina Fondo personale dipendente

Attualmente la pagina `FondoAccessorioDipendentePage.tsx` è strutturata nelle seguenti sezioni fisiche (corrispondenti alle sezioni del file `strutturaFondo.json`):
1. **Fonti di Finanziamento Stabili**: Visualizza tutti i campi con sezione `stabili` (risorse stabili fisse, variabili contrattuali storiche, detratori stabili).
2. **Fonti di Finanziamento Variabili Soggette al Limite**: Visualizza le risorse con sezione `vs_soggette`.
3. **Fonti di Finanziamento Variabili Non Soggette al Limite**: Visualizza le risorse con sezione `vn_non_soggette`.
4. **Altre Risorse e Decurtazioni Finali**: Visualizza i campi con sezione `fin_decurtazioni` (es. sanzioni ex D.L. 16/2014).
5. **Calcolo del Rispetto dei Limiti del Salario Accessorio**: Visualizza i campi `cl_totaleParzialeRisorsePerConfrontoTetto2016` e `cl_art23c2_decurtazioneIncrementoAnnualeTetto2016`.
6. **Totale Risorse Disponibili**: Barra fissa in fondo che mostra il totale complessivo destinato alla contrattazione decentrata del personale dipendente.

---

## 2. Elenco delle voci che risultano oggi soggette al limite Art. 23

Il controllo del limite dell'Art. 23 c. 2 viene eseguito in modalità **differenziale/incrementale**. Il limite storico base 2016 include già al suo interno le risorse stabili fisse storiche (come l'Unico Importo 2017). Di conseguenza, per evitare doppie registrazioni, nel computo della spesa corrente soggetta (`ammontareSoggettoLimite2016`) concorrono:

1. **Detratori stabili (riduzioni della parte stabile con segno -)**:
   - `st_taglioFondoDL78_2010` (Taglio D.L. 78/2010)
   - `st_riduzioniPersonaleATA_PO_Esternalizzazioni` (Riorganizzazioni/ATA)
   - `st_art67c1_decurtazionePO_AP_EntiDirigenza` (Decurtazione PO/AP)
   - `st_riduzioneFondoStraordinario` (Riduzione per straordinario)
2. **Fonti variabili soggette (con segno +)**:
   - `vs_art4c3_art15c1k_art67c3c_recuperoEvasione` (Recupero evasione ICI/IMU)
   - `vs_art4c2_art67c3d_integrazioneRIAMensile` (RIA cessati in anno pro-rata)
   - `vs_art67c3g_personaleCaseGioco` (Case da gioco)
   - `vs_art79c2b_max1_2MonteSalari1997` (1,2% Monte Salari 1997)
   - `vs_art67c3k_integrazioneArt62c2e_personaleTrasferito` (Trasferimento quota variabile)
   - `vs_art79c2c_risorseScelteOrganizzative` (CCDI scelte organizzative)
3. **Risorse esterne al FAD ma computate nel tetto globale dell'ente**:
   - Risorse stabili EQ (`ris_fondoPO2017` + `ris_incrementoConRiduzioneFondoDipendenti` + `ris_incrementoLimiteArt23c2_DL34` + `va_dl25_2025_armonizzazione`)
   - Risorse stabili Dirigenza (se l'ente ha la dirigenza)
   - Risorse stabili Segretario Comunale
   - Spesa straordinario ordinario corrente (`fondoLavoroStraordinario`)
   - Quota figurativa di neutralizzazione ex Art. 60 (re-add).

---

## 3. Elenco delle voci oggi escluse dal limite

Le seguenti risorse non erodono lo spazio finanziario del tetto dell'Art. 23 c. 2 per espressa deroga normativa o contrattuale:

1. **Parte stabile**:
   - `st_art79c1_art67c2a_incr8320` (Incremento contrattuale €83,20)
   - `st_art79c1_art67c2b_incrStipendialiDiff` (Differenziali contrattuali 2018)
   - `st_art79c1b_euro8450` (Incremento contrattuale €84,50)
   - `st_art79c1c_incrementoStabileConsistenzaPers` (Differenziale consistenza organico)
   - `st_art79c1d_differenzialiStipendiali2022` (Differenziali stipendiali 2022)
   - `st_art79c1bis_diffStipendialiB3D3` (Differenziali B3 e D3)
   - `st_art58c1_CCNL2026_incremento014_MS2021` (Incremento 0,14% MS 2021)
2. **Parte variabile** (`vn_non_soggette`):
   - `vn_art15c1d_art67c3a_sponsorConvenzioni` (Finanziate da terzi/sponsor)
   - `vn_art54_art67c3f_rimborsoSpeseNotifica` (Spese notifica messi)
   - `vn_art15c1k_art16_dl98_art67c3b_pianiRazionalizzazione` (Razionalizzazione certificata)
   - `vn_art15c1k_art67c3c_incentiviTecniciCondoni` (Incentivi tecnici D.Lgs. 36/2023, condoni)
   - `vn_art18h_art67c3c_incentiviSpeseGiudizioCensimenti` (Avvocatura e censimenti ISTAT)
   - `vn_art15c1m_art67c3e_risparmiStraordinario` (Riversamento risparmi straordinario)
   - `vn_art67c3j_regioniCittaMetro_art23c4_incrPercentuale` (Incremento Regioni/CM)
   - `vn_art80c1_sommeNonUtilizzateStabiliPrec` (Avanzo vincolato stabili)
   - `vn_l145_art1c1091_incentiviRiscossioneIMUTARI` (Incentivi tributi L. 145/2018)
   - `vn_l178_art1c870_risparmiBuoniPasto2020` (Buoni pasto 2020)
   - `vn_dl135_art11c1b_risorseAccessorieAssunzioniDeroga` (Assunzioni deroga)
   - `vn_art79c3_022MonteSalari2018_da2022Proporzionale` (0,22% MS 2018)
   - `vn_art79c1b_euro8450_unaTantum2021_2022` (Scaduta)
   - `vn_art79c3_022MonteSalari2018_da2022UnaTantum2022` (Scaduta)
   - `vn_dl13_art8c3_incrementoPNRR_max5stabile2016` (PNRR max 5%)
   - `vn_art58c2_incremento_max022_ms2021` (Incremento 0,22% MS 2021 Fondo)
   - `vn_art58c2_incremento_max022_ms2021_anno2025` (Incremento 0,22% MS 2021 arretrati)
   - `vn_art58_CCNL2026_arretrati2024_2025` (Arretrati 0,14%)

---

## 4. Elenco delle voci che richiedono computo figurativo

Le voci che devono essere trattate in modo figurativo nel prospetto Art. 23 per garantire la neutralità finanziaria sono:
1. **Decurtazione comparto Art. 60** (`st_art60c2_CCNL2026_decurtazioneIndennitaComparto`): riduce realmente la parte stabile del fondo (il fondo accessorio liquido diminuisce), ma ai fini del controllo del limite dell'Art. 23 deve essere sommatamente reintegrata (re-add con segno +) per evitare la perdita di spazio finanziario accessorio consolidato.
2. **Quota EQ trasferita dal Fondo** (`st_riduzionePerIncrementoEQ`): riduce il fondo stabili dipendenti, ma siccome si trasferisce all'area EQ (anch'essa soggetta a limite globale), è neutra complessivamente a livello di ente.

---

## 5. Elenco delle voci alimentate o alimentabili dal nuovo wizard

Il nuovo wizard 2026 calcola ed esporta i seguenti dati verso la Costituzione Fondo:
- **0,14% Stabile**: `st_art58c1_CCNL2026_incremento014_MS2021`
- **Arretrati 0,14%**: `vn_art58_CCNL2026_arretrati2024_2025`
- **Quota 0,22% Fondo**: `vn_art58c2_incremento_max022_ms2021`
- **Quota 0,22% EQ**: `va_incremento022_ms2021_eq` (nel fondo EQ)
- **Taglio Art. 60**: `st_art60c2_CCNL2026_decurtazioneIndennitaComparto`
- **Riduzione straordinario**: `st_art79c1_art14c3_art67c2g_riduzioneStraordinario`
- **Economie straordinario**: `vn_art15c1m_art67c3e_risparmiStraordinario`
- **Straordinario ordinario**: `annualData.fondoLavoroStraordinario`
- **Limite Art. 23 attualizzato** (Controllo): `art23.result.limiteArt23Attualizzato`
- **Limite D.L. 25/2025** (Controllo): `dl25.result.limiteMassimoDL25`
- **Limite PNRR** (Controllo): `pnrr.result.limiteMassimoPnrrFondoDipendenti`

---

## 6. Rischi di sovrascrittura da useEffect

La pagina legacy `FondoAccessorioDipendentePage.tsx` contiene molteplici hook `useEffect` che monitorano lo stato locale e ricalcolano i campi a ogni avvio o variazione dello stato.
*   **Rischi principali**:
    1. Se il trasferimento dal wizard scrive solo i campi finali contabili (come `st_art58c1...` o `st_art60c2...`), all'apertura della pagina i `useEffect` legati a parametri vuoti (ad es. `ccnl2024.monteSalari2021` o `ivcConglobation`) ricalcoleranno e azzereranno o modificheranno tali importi, cancellando l'effetto del trasferimento.
    2. Lo stesso avviene per lo 0,22% se il parametro percentuale `optionalIncreaseVariableFrom2026Percentage` non viene allineato in `ccnl2024` durante il trasferimento.
*   **Mitigazione**: Il trasferimento implementato in `transferPreviewEngine.ts` allinea sia le risorse finali sia i parametri istruttori (`ccnl2024Settings`) che guidano questi `useEffect`. Nella pagina, occorre fare in modo che questi `useEffect` non interferiscano o che utilizzino dati controllati.

---

## 7. Proposte di modifica da implementare in MOD-025

Per soddisfare tutti i requisiti di MOD-025, implementeremo le seguenti modifiche:

1.  **Riorganizzazione visiva della pagina**:
    Suddivisione del layout in 6 sezioni grafiche logiche (A, B, C, D, E, F) tramite Card distinte e chiare.
2.  **Quadro di controllo Art. 23 (Nuovo prospetto a 4 valori)**:
    Visualizzazione in primo piano (o in evidenza) di:
    - Fondo complessivamente costituito (Stabili reali + Variabili soggette + Variabili escluse)
    - Risorse escluse dal limite Art. 23
    - Risorse rilevanti ai fini del limite Art. 23 (Fondo - Escluse + Straordinario + Computo figurativo Art. 60)
    - Limite Art. 23 attualizzato (con l'importo calcolato o n/d)
    - Margine residuo o sforamento (con alert rosso in caso di sforamento, giallo per warning, verde per capienza).
3.  **Gestione neutrale dell'Art. 60**:
    Evidenziare nel prospetto il computo figurativo del conglobamento compartments per spiegare la reintegrazione ai fini del rispetto del tetto.
4.  **Separazione tra massimali teorici e importi effettivi**:
    - **D.L. 25/2025**: Mostrare il limite massimo teorico (se disponibile) e consentire l'inserimento manuale dell'importo effettivo. Generare allerta bloccante/warning se l'effettivo supera il massimo.
    - **PNRR**: Mostrare il limite massimo teorico (5% stabile 2016) e consentire l'inserimento manuale dell'importo effettivo, con blocco se superato.
    - **CCNL 0,22%**: Visualizzare la quota massima disponibile e il riparto tra Fondo ed EQ, verificando il non superamento.
5.  **Chiarimenti voci**:
    - Aggiornare definizioni/aiuti per gli Incentivi Funzioni Tecniche, il Recupero Evasione ICI/IMU e gli Incentivi Tributi L. 145/2018.
    - Gestire la visibilità condizionale (o badge "Non applicabile") per le risorse specifiche di Regioni/Città Metropolitane sulla base di `state.fundData.annualData.tipologiaEnte`.
    - Marcare graficamente le voci storicizzate o una tantum scadute come "storica", "non ordinariamente modificabile" o "voce pregressa".
6.  **Validazioni e connettività**:
    Aggiungere allerta e warning bloccanti sui campi in caso di sforamento o incongruenze dei limiti.
7.  **Aggiornamenti a `fundEngine.ts`**:
    Mantenere intatta la compatibilità e assicurare che tutti i calcoli riflettano le regole definite.
