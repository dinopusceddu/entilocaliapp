# Documentazione di Audit — MOD-023 — Audit voce per voce della Costituzione Fondo personale dipendente e impatto Art. 23

Questo documento costituisce l'audit tecnico e normativo per la razionalizzazione del modello dati della **Costituzione Fondo risorse decentrate del personale dipendente** (Fondo Accessorio Dipendenti - FAD), in preparazione del raccordo finale con il nuovo wizard **"Raccolta dati dell'Ente"** (Wizard 2026).

L'audit analizza la corrispondenza tra i campi presenti nell'applicazione reale, le voci del foglio Excel di riferimento `Fondo risorse decentrate 2026 - foglio di calcolo.xlsx` e le regole di computo del limite di spesa del trattamento accessorio ai sensi dell'**art. 23, comma 2, D.Lgs. 75/2017**.

---

## 1. Premessa Metodologica

La corretta governance dei fondi di contrattazione decentrata negli Enti Locali richiede di distinguere nettamente il ruolo finanziario e normativo di ciascun valore inserito. Un errore di classificazione o l'importazione automatica di un limite massimo come risorsa effettiva può generare squilibri di bilancio o violazioni del tetto di spesa del trattamento accessorio (con conseguente responsabilità erariale).

Per blindare il modello concettuale, le voci sono classificate secondo le seguenti categorie operative:
1. **Risorsa effettiva**: Somma finanziaria reale che incrementa (se con segno +) o decrementa stabilmente (se con segno - e qualificato come riduzione stabile) le disponibilità liquide del Fondo.
2. **Limite massimo (o tetto di controllo)**: Valore calcolato su basi teorico-normative (es. 48% per D.L. 25/2025, 5% per PNRR, 0,22% per CCNL) che rappresenta la soglia invalicabile entro cui l'amministrazione può deliberare lo stanziamento di risorse effettive. Non deve alimentare automaticamente il fondo costituito.
3. **Valore figurativo**: Importo considerato esclusivamente ai fini del controllo del limite dell'Art. 23 c. 2 per garantirne la neutralità finanziaria (es. il conglobamento dell'indennità di comparto Art. 60), ma che a livello contabile reale rappresenta una riduzione stabile delle risorse del Fondo.
4. **Aggregato calcolato**: Totali, subtotali o formule non editabili dall'utente che riassumono l'andamento della spesa.
5. **Dato istruttorio / Parametro**: Informazione propedeutica (es. Monte Salari 2021, FTE dipendenti) inserita per alimentare le formule di calcolo delle voci automatiche o dei limiti.

---

## 2. Fonti Analizzate

L'attività di audit si è basata sull'analisi incrociata dei seguenti elementi:
1. **File di configurazione e visualizzazione dell'applicazione**:
   - [src/logic/fundFieldDefinitions.ts](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/logic/fundFieldDefinitions.ts): contiene le chiavi tecniche (`key`), le etichette, le sezioni di appartenenza e la rilevanza ai fini dell'Art. 23.
   - [src/logic/fundEngine.ts](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/logic/fundEngine.ts): definisce l'algoritmo di calcolo del limite Art. 23 e la composizione dei sotto-fondi.
   - [src/logic/fundCalculations.ts](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/logic/fundCalculations.ts): implementa la determinazione analitica dei totali FAD.
   - [src/pages/FondoAccessorioDipendentePage.tsx](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/pages/FondoAccessorioDipendentePage.tsx): gestisce il rendering e la visualizzazione delle sezioni.
2. **Documenti e fogli di calcolo del workspace**:
   - `fileprogetto/Fondo risorse decentrate 2026 - foglio di calcolo.xlsx`: foglio Excel ufficiale strutturato in comparto, EQ, segretario e dirigenza.
   - `result_excel_utf8.txt`: traccia strutturata riga per riga del foglio di calcolo Excel.
   - Documentazione pregressa in `docs/refactoring/` (in particolare `audit-tecnico-campi-fondo-art23.md` e `mappa-wizard-fondo-dipendenti-2026.md`).
3. **Riferimenti normativi**:
   - Art. 23, comma 2, D.Lgs. 75/2017 (Tetto del trattamento accessorio 2016).
   - Art. 67 CCNL 21.05.2018 (Struttura storica del Fondo).
   - Art. 79 e 80 CCNL 16.11.2022 (Struttura ed utilizzi del Fondo).
   - Art. 58 e 60 CCNL 23.02.2026 (Incrementi 0,14% - 0,22% e conglobamento indennità comparto).
   - D.L. 25/2025 (Incremento del fondo entro la capacità del 48% degli stipendi tabellari 2023).
   - Art. 8, commi 3 e 4, D.L. 13/2023 (Incentivi PNRR fuori limite).
   - Art. 45 D.Lgs. 36/2023 (Incentivi funzioni tecniche).

---

## 3. Matrice Voce per Voce della Costituzione Fondo (FAD)

La tabella seguente mappa analiticamente ogni voce definita nel file `src/logic/fundFieldDefinitions.ts` per il Fondo Dipendenti (FAD), confrontandola con il foglio Excel `comparto`:

| Sezione | Codice campo app | Etichetta attuale UI/Excel | Fonte file | Tipo voce | Classificazione Art. 23 | Segno | Editabile | Calcolata | Fonte normativa | Criticità | Proposta modifica |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **Stabili** | `st_art79c1_art67c1_unicoImporto2017` | Unico importo consolidato 2017 | UI / Excel (Row 4) | Risorsa effettiva | `DENTRO_LIMITE_ART23` | `+` | Sì | No | Art. 79 c. 1 CCNL 2022 | Nessuna | Mantenere |
| **Stabili** | `st_art79c1_art67c1_alteProfessionalitaNonUtil` | Alte professionalità non utilizzate al 2017 | UI / Excel (Row 5) | Risorsa effettiva | `DENTRO_LIMITE_ART23` | `+` | Sì | No | Art. 79 c. 1 CCNL 2022 | Rischio di duplicazione se già nel consolidato | Aggiungere helper text di avviso |
| **Stabili** | `st_art79c1_art67c2a_incr8320` | Incremento €83,20 pro-capite (pers. 2015) | UI / Excel (Row 6) | Risorsa effettiva | `FUORI_LIMITE_ART23` | `+` | Sì | No | Art. 79 c. 1 lett. a) CCNL 2022 | Il valore deve essere fisso e immutabile | Bloccare in sola lettura ricavandolo da storici |
| **Stabili** | `st_art79c1_art67c2b_incrStipendialiDiff` | Incrementi stipendiali differenziali (Art. 64) | UI / Excel (Row 7) | Risorsa effettiva | `FUORI_LIMITE_ART23` | `+` | Sì | No | Art. 79 c. 1 lett. b) CCNL 2022 | Storico, non deve variare | Rendere a calcolo da storico |
| **Stabili** | `st_art79c1_art4c2_art67c2c_integrazioneRIA` | Integrazione RIA personale cessato anno prec. | UI / Excel (Row 8) | Risorsa effettiva | `DENTRO_LIMITE_ART23` | `+` | Sì | No | Art. 79 c. 1 lett. c) CCNL 2022 | Rischio di sovrapposizione con anno in corso | Chiarire che riguarda solo i cessati anno precedente |
| **Stabili** | `st_art79c1_art67c2d_risorseRiassorbite165` | Risorse riassorbite (Art. 2 c.3 D.Lgs 165/01) | UI / Excel (Row 9) | Risorsa effettiva | `DENTRO_LIMITE_ART23` | `+` | Sì | No | Art. 79 c. 1 lett. d) CCNL 2022 | Voce molto rara ed obsoleta | Mantenere manuale con descrizione |
| **Stabili** | `st_art79c1_art15c1l_art67c2e_personaleTrasferito` | Risorse personale trasferito (decentramento) | UI / Excel (Row 10) | Risorsa effettiva | `DENTRO_LIMITE_ART23` | `+` | Sì | No | Art. 79 c. 1 lett. e) CCNL 2022 | Richiede accordo bilaterale per quota limite | Aggiungere nota istruttoria |
| **Stabili** | `st_art79c1_art15c1i_art67c2f_regioniRiduzioneDirig`| Regioni: riduzione stabile posti dirig. | UI / Excel (Row 11) | Risorsa effettiva | `DENTRO_LIMITE_ART23` | `+` | Sì | No | Art. 79 c. 1 lett. f) CCNL 2022 | Valido solo per Regioni | Nascondere se tipologia ente non è REGIONE |
| **Stabili** | `st_art79c1_art14c3_art67c2g_riduzioneStraordinario` | Riduzione stabile straordinario | UI / Excel (Row 12) | Risorsa effettiva | `DENTRO_LIMITE_ART23` | `+` | Sì | Sì (da wizard) | Art. 79 c. 1 lett. g) CCNL 2022 | Deve corrispondere alla riduzione dello straordinario | Rendere automatico con blocco di sicurezza |
| **Stabili** | `st_art79c1b_euro8450` | Incremento €84,50 pro-capite (pers. 2018) | UI / Excel (Row 16) | Risorsa effettiva | `FUORI_LIMITE_ART23` | `+` | Sì | No | Art. 79 c. 1 lett. b) CCNL 2022 | Storico consolidato | Rendere a calcolo o precompilato |
| **Stabili** | `st_art79c1c_incrementoStabileConsistenzaPers`| Incremento stabile (diff. consistenza) | UI / Excel (Row 17) | Risorsa effettiva | `FUORI_LIMITE_ART23` | `+` | Sì | No | Art. 79 c. 1 lett. c) CCNL 2022 | Rischio di calcolo errato | Mantenere manuale con help text |
| **Stabili** | `st_art79c1d_differenzialiStipendiali2022` | Differenziali stipendiali (Art. 78 CCNL 2022) | UI / Excel (Row 18) | Risorsa effettiva | `FUORI_LIMITE_ART23` | `+` | Sì | No | Art. 79 c. 1 lett. d) CCNL 2022 | Consolidato storico 2022 | Mantenere precompilato |
| **Stabili** | `st_art79c1bis_diffStipendialiB3D3` | Differenziali stipendiali posizioni B3 e D3 | UI / Excel (Row 19) | Risorsa effettiva | `FUORI_LIMITE_ART23` | `+` | Sì | No | Art. 79 c. 1-bis CCNL 2022 | Storico | Mantenere |
| **Stabili** | `st_incrementoDecretoPA` | Incremento D.L. 75/2023 (Decreto PA bis) | UI / Non in Excel | Risorsa effettiva | `FUORI_LIMITE_ART23` | `+` | Sì | No | D.L. 75/2023 | Ormai superata e assorbita | **Deprecare / Nascondere** |
| **Stabili** | `st_taglioFondoDL78_2010` | Taglio fondo DL 78/2010 (se non in unico) | UI / Excel (Row 13) | Riduzione stabile | `DENTRO_LIMITE_ART23` | `-` | Sì | No | D.L. 78/2010 | Voce negativa | Spostare visivamente sotto i detratori stabili |
| **Stabili** | `st_riduzioniPersonaleATA_PO_Esternalizzazioni` | Riduzioni per ATA, esternalizzazioni, ecc. | UI / Excel (Row 14) | Riduzione stabile | `DENTRO_LIMITE_ART23` | `-` | Sì | No | Disposizioni interne | Voce negativa | Spostare visivamente sotto i detratori stabili |
| **Stabili** | `st_art67c1_decurtazionePO_AP_EntiDirigenza` | Decurtazione PO/AP enti con dirigenza | UI / Excel (Row 15) | Riduzione stabile | `DENTRO_LIMITE_ART23` | `-` | Sì | No | Art. 67 c. 1 CCNL 2018 | Riduce il fondo dipendenti per finanziare le EQ | Spostare visivamente sotto i detratori stabili |
| **Stabili** | `st_art58c1_CCNL2026_incremento014_MS2021` | Incremento stabile 0,14% Monte Salari 2021 | UI / Excel (Row 20) | Risorsa effettiva | `FUORI_LIMITE_ART23` | `+` | No | Sì (da wizard) | Art. 58 c. 1 CCNL 23.02.2026 | Collegato a parametro MS 2021 | Calcolo automatico bloccato |
| **Stabili** | `st_incrementoDL25_2025` | Incremento D.L. 25/2025 (soglia 48%) | UI / Excel (Row 21) | Risorsa effettiva | `DENTRO_LIMITE_ART23` | `+` | Sì | Sì (da wizard) | D.L. 25/2025 | Il wizard calcola il MAX, non l'effettivo | Rendere editabile con capienza max da wizard |
| **Stabili** | `st_riduzionePerIncrementoEQ` | Riduzione per incremento risorse EQ | UI / Non in Excel | Riduzione stabile | `DENTRO_LIMITE_ART23` | `-` | No | Sì | Art. 7 c. 4 CCNL 2022 | Spostamento interno non esplicitato in Excel | Mantenere come sottrattore stabile a calcolo |
| **Stabili** | `st_art60c2_CCNL2026_decurtazioneIndennitaComparto`| Decurtazione per conglobamento comparto | UI / Excel (Row 22) | Riduzione stabile | `COMPUTO_FIGURATIVO` | `-` | No | Sì (da wizard) | Art. 60 c. 2 CCNL 23.02.2026 | Neutralità limite Art. 23 non trasparente in UI | Visualizzazione separata "Effettivo" vs "Figurativo" |
| **Stabili** | `st_riduzioneFondoStraordinario` | Riduzione stabile straordinario | UI / Non in Excel | Riduzione stabile | `DENTRO_LIMITE_ART23` | `-` | No | Sì | Art. 20 c. 1 CCNL 2026 | Spostamento interno | Mantenere come sottrattore stabile a calcolo |
| **Variabili** | `vs_art4c3_art15c1k_art67c3c_recuperoEvasione` | Recupero evasione tributaria (ICI/IMU) | UI / Excel (Row 26) | Risorsa effettiva | `DENTRO_LIMITE_ART23` | `+` | Sì | No | Art. 67 c. 3 lett. c) 2018 | Rischio di confusione con incentivi IMU/TARI | Ridenominare in "Recupero evasione ICI/IMU (storico)" |
| **Variabili** | `vs_art4c2_art67c3d_integrazioneRIAMensile` | Integrazione RIA cessati in corso d'anno | UI / Excel (Row 27) | Risorsa effettiva | `DENTRO_LIMITE_ART23` | `+` | Sì | No | Art. 67 c. 3 lett. d) 2018 | Calcolo pro-rata mensile spesso errato | Inserire nota esplicativa per calcolo pro-rata |
| **Variabili** | `vs_art67c3g_personaleCaseGioco` | Risorse personale case da gioco | UI / Excel (Row 28) | Risorsa effettiva | `DENTRO_LIMITE_ART23` | `+` | Sì | No | Art. 67 c. 3 lett. g) 2018 | Valido solo per pochissimi enti | Disabilitare/nascondere per default |
| **Variabili** | `vs_art79c2b_max1_2MonteSalari1997` | Quota storica max 1,2% Monte Salari 1997 | UI / Excel (Row 29) | Risorsa effettiva | `DENTRO_LIMITE_ART23` | `+` | Sì | No | Art. 79 c. 2 lett. b) 2022 | Valore storico fisso | Rendere a calcolo o precompilato |
| **Variabili** | `vs_art67c3k_integrazioneArt62c2e_personaleTrasferito`| Quota variabile personale trasferito | UI / Excel (Row 30) | Risorsa effettiva | `DENTRO_LIMITE_ART23` | `+` | Sì | No | Art. 67 c. 3 lett. k) 2018 | Soggetta ad accordo di mobilità | Aggiungere help text |
| **Variabili** | `vs_art79c2c_risorseScelteOrganizzative` | Stanziamento scelte organizzative / TD | UI / Excel (Row 31) | Risorsa effettiva | `DENTRO_LIMITE_ART23` | `+` | Sì | No | Art. 79 c. 2 lett. c) 2022 | Etichetta generica per stanziare variabili | Chiarire che rientra nelle variabili soggette |
| **Variabili** | `vn_art15c1d_art67c3a_sponsorConvenzioni` | Sponsorizzazioni, convenzioni, extra | UI / Excel (Row 39) | Risorsa effettiva | `FUORI_LIMITE_ART23` | `+` | Sì | No | Art. 67 c. 3 lett. a) 2018 | Escluso in quanto finanziato da terzi | Mantenere |
| **Variabili** | `vn_art54_art67c3f_rimborsoSpeseNotifica` | Quota rimborso spese notifica (messi) | UI / Excel (Row 40) | Risorsa effettiva | `FUORI_LIMITE_ART23` | `+` | Sì | No | Art. 67 c. 3 lett. f) 2018 | Solo per rimborsi effettivamente riscossi | Mantenere |
| **Variabili** | `vn_art15c1k_art16_dl98_art67c3b_pianiRazionalizzazione`| Piani di razionalizzazione Art. 16 DL 98 | UI / Excel (Row 41) | Risorsa effettiva | `FUORI_LIMITE_ART23` | `+` | Sì | No | Art. 67 c. 3 lett. b) 2018 | Richiede asseverazione revisori | Aggiungere warning operativo |
| **Variabili** | `vn_art15c1k_art67c3c_incentiviTecniciCondoni` | Incentivi funzioni tecniche e condoni | UI / Excel (Row 42) | Risorsa effettiva | `FUORI_LIMITE_ART23` | `+` | Sì | No | Art. 45 D.Lgs. 36/2023 | Sovrapposizione con utilizzi ed ex lege | **Razionalizzare** (vedere par. 6.6) |
| **Variabili** | `vn_art18h_art67c3c_incentiviSpeseGiudizioCensimenti`| Incentivi avvocatura, ISTAT, censimenti | UI / Excel (Row 43) | Risorsa effettiva | `FUORI_LIMITE_ART23` | `+` | Sì | No | Art. 67 c. 3 lett. c) 2018 | Voce aggregata confusa | Dividere o chiarire l'oggetto |
| **Variabili** | `vn_art15c1m_art67c3e_risparmiStraordinario` | Risparmi straordinario anno precedente | UI / Excel (Row 44) | Risorsa effettiva | `FUORI_LIMITE_ART23` | `+` | Sì | Sì (da wizard) | Art. 67 c. 3 lett. e) 2018 | Trasferimento automatico da wizard | Rendere automatico con blocco |
| **Variabili** | `vn_art67c3j_regioniCittaMetro_art23c4_incrPercentuale`| Incremento % Regioni e Città Metropolitane | UI / Excel (Row 45) | Risorsa effettiva | `FUORI_LIMITE_ART23` | `+` | Sì | No | Art. 23 c. 4 D.Lgs. 75/17 | Valido solo per Regioni/CM | Nascondere se non applicabile |
| **Variabili** | `vn_art80c1_sommeNonUtilizzateStabiliPrec` | Avanzi stabili trascinati | UI / Excel (Row 46) | Risorsa effettiva | `FUORI_LIMITE_ART23` | `+` | Sì | No | Art. 80 c. 1 CCNL 2022 | Avanzo vincolato reale | Mantenere manuale |
| **Variabili** | `vn_l145_art1c1091_incentiviRiscossioneIMUTARI`| Incentivi riscossione IMU/TARI | UI / Excel (Row 47) | Risorsa effettiva | `FUORI_LIMITE_ART23` | `+` | Sì | No | Art. 1 c. 1091 L. 145/18 | Limite del 5% spesa tributi | Aggiungere controllo bloccante |
| **Variabili** | `vn_l178_art1c870_risparmiBuoniPasto2020` | Risparmi buoni pasto 2020 | UI / Excel (Row 48) | Risorsa effettiva | `FUORI_LIMITE_ART23` | `+` | Sì | No | L. 178/2020 | Temporanea storica superata | **Deprecare / Eliminare** |
| **Variabili** | `vn_dl135_art11c1b_risorseAccessorieAssunzioniDeroga`| Risorse accessorie assunzioni in deroga | UI / Excel (Row 49) | Risorsa effettiva | `FUORI_LIMITE_ART23` | `+` | Sì | No | D.L. 135/2018 | Storica legata ad assunzioni | Mantenere manuale |
| **Variabili** | `vn_art79c3_022MonteSalari2018_da2022Proporzionale`| 0,22% MS 2018 proporzionale | UI / Excel (Row 50) | Risorsa effettiva | `FUORI_LIMITE_ART23` | `+` | Sì | No | Art. 79 c. 3 CCNL 2022 | Storica assorbita | **Deprecare** |
| **Variabili** | `vn_art79c1b_euro8450_unaTantum2021_2022` | Una tantum €84,50 (anni 2021-2022) | UI / Non in Excel | Risorsa effettiva | `FUORI_LIMITE_ART23` | `+` | Sì | No | Art. 79 c. 1 lett. b) 2022 | Scaduta da tempo | **Eliminare** |
| **Variabili** | `vn_art79c3_022MonteSalari2018_da2022UnaTantum2022`| Una tantum 0,22% (anno 2022) | UI / Non in Excel | Risorsa effettiva | `FUORI_LIMITE_ART23` | `+` | Sì | No | Art. 79 c. 3 CCNL 2022 | Scaduta da tempo | **Eliminare** |
| **Variabili** | `vn_dl13_art8c3_incrementoPNRR_max5stabile2016` | Incremento PNRR (max 5% stabile 2016) | UI / Excel (Row 51) | Risorsa effettiva | `FUORI_LIMITE_ART23` | `+` | Sì | Sì (da wizard) | Art. 8 c. 3 D.L. 13/2023 | Il wizard calcola il MAX, non l'effettivo | Rendere editabile con capienza max da wizard |
| **Variabili** | `vn_art58c2_incremento_max022_ms2021` | Incremento max 0,22% MS 2021 | UI / Excel (Row 53) | Risorsa effettiva | `FUORI_LIMITE_ART23` | `+` | Sì | Sì (da wizard) | Art. 58 c. 2 CCNL 23.02.26 | Importo effettivo scelto dall'ente | Mantenere automatico (conferma quota FRD) |
| **Variabili** | `vn_art58c2_incremento_max022_ms2021_anno2025`| Incremento 0,22% MS 2021 (anno 2025) | UI / Excel (Row 54) | Risorsa effettiva | `FUORI_LIMITE_ART23` | `+` | Sì | No | Art. 58 c. 2 CCNL 23.02.26 | Una tantum arretrati 0.22% | Rinominare "Arretrati 0,22% MS 2021 per 2025" |
| **Variabili** | `vn_art58_CCNL2026_arretrati2024_2025` | Arretrati 2024-2025 (una tantum 0,14%) | UI / Excel (Row 52) | Risorsa effettiva | `FUORI_LIMITE_ART23` | `+` | No | Sì (da wizard) | Art. 58 c. 1 CCNL 23.02.26 | Arretrati 0,14% per 2024-2025 | Calcolo automatico bloccato |
| **Finali** | `fin_art4_dl16_misureMancatoRispettoVincoli` | Misure per mancato rispetto vincoli (DL 16) | UI / Excel (Row 58) | Riduzione stabile | `FUORI_LIMITE_ART23` | `-` | Sì | No | Art. 4 D.L. 16/2014 | Voce di sanzione negativa | Spostare nei detratori di fondo |
| **Limiti** | `cl_art23c2_decurtazioneIncrementoAnnualeTetto2016` | Decurtazione per rispetto tetto 2016 | UI / Excel (Row 36) | Rettifica interna | `SOLO_CONTROLLO` | `-` | No | Sì (calcolato) | Art. 23 c. 2 D.Lgs. 75/17 | Taglio automatico per sforamento | Mantenere automatico |
| **Limiti** | `cl_totaleParzialeRisorsePerConfrontoTetto2016` | Totale parziale risorse per confronto tetto | UI / Excel (Row 35) | Aggregato | `SOLO_CONTROLLO` | `+` | No | Sì (calcolato) | Art. 23 c. 2 D.Lgs. 75/17 | Aggregato di spesa rilevante | Mantenere automatico |

---

## 4. Matrice Risorse Stabili

Le risorse stabili costituiscono l'ossatura permanente del Fondo e sono caratterizzate da un trascinamento obbligatorio degli importi storici consolidati, rettificati dai rinnovi contrattuali e dalle variazioni organizzative.

### A. Voci Storiche e Consolidate (Manuali)
- `st_art79c1_art67c1_unicoImporto2017` (Storicizzato): Rappresenta la base fissa. Editabile solo in caso di rideterminazione asseverata dell'ente.
- `st_art79c1_art67c2a_incr8320` e `st_art79c1b_euro8450`: Risorse fisse contrattuali legate a date storiche (2015 e 2018). Devono rimanere fisse e non variare.
- `st_taglioFondoDL78_2010` e `st_riduzioniPersonaleATA_PO_Esternalizzazioni`: Tagli permanenti del fondo che l'ente deve registrare.

### B. Voci di Integrazione e Calcolo (Alimentabili da Wizard / Automatiche)
- **Incremento 0,14% CCNL 2026** (`st_art58c1_CCNL2026_incremento014_MS2021`): Calcolato automaticamente dal wizard sul Monte Salari 2021. Non deve essere modificato a mano.
- **Incremento D.L. 25/2025** (`st_incrementoDL25_2025`): Il wizard fornisce il **limite massimo** basato sulla spesa degli stipendi tabellari 2023. La costituzione fondo deve permettere l'inserimento manuale dell'importo reale effettivamente stanziato, verificando che sia inferiore o uguale al limite massimo.
- **Riduzione permanente Art. 60** (`st_art60c2_CCNL2026_decurtazioneIndennitaComparto`): Calcolata analiticamente dal wizard sul personale in servizio al 01.01.2026. Riduce stabilmente il fondo a livello contabile reale, ma ha rilevanza figurativa per la neutralità del limite Art. 23 (vedi par. 6.1).
- **Riduzione stabile straordinario ex Art. 67/79** (`st_art79c1_art14c3_art67c2g_riduzioneStraordinario`): Popolato automaticamente dal wizard a seguito delle scelte di riduzione stabile operate nello Step 6.
- **Spostamento EQ** (`st_riduzionePerIncrementoEQ`): Riduzione a calcolo basata sull'ammontare che l'ente decide di destinare al finanziamento del fondo EQ, prelevandolo dal fondo dipendenti.

---

## 5. Matrice Risorse Variabili Soggette al Limite

Queste risorse sono stanziate annualmente su base discrezionale o in relazione a specifiche entrate, ma sono vincolate al rispetto del tetto del trattamento accessorio complessivo 2016.

### A. Voci da mantenere manuali
- `vs_art4c3_art15c1k_art67c3c_recuperoEvasione` (Recupero ICI/IMU): Alimentato in base all'effettivo accertamento e riscossione dei tributi legati al recupero evasione. Rileva nel limite.
- `vs_art4c2_art67c3d_integrazioneRIAMensile` (RIA cessati in corso d'anno): Valore calcolato pro-rata mensile basato sul personale cessato nell'anno corrente.
- `vs_art67c3k_integrazioneArt62c2e_personaleTrasferito`: Integrazione variabile in caso di mobilità in ingresso.
- `vs_art79c2c_risorseScelteOrganizzative`: Stanziamenti discrezionali deliberati dall'ente in sede di bilancio.

### B. Coerenza del Posizionamento
Tutte le voci variabili soggette a limite nel codice dell'applicazione corrispondono esattamente alla sezione *"FONTI DI FINANZIAMENTO VARIABILI SOGGETTE AL LIMITE"* del foglio Excel (Row 25-31). Non sono necessarie riclassificazioni strutturali per questo blocco.

---

## 6. Matrice Risorse Variabili Escluse dal Limite

Le risorse variabili escluse dal limite Art. 23 c. 2 sono destinate a specifici scopi previsti dalla legge o dai contratti collettivi nazionali.

- **Incentivi PNRR** (`vn_dl13_art8c3_incrementoPNRR_max5stabile2016`): Il wizard calcola il **tetto massimo del 5%** della componente stabile 2016. La Costituzione Fondo deve permettere l'inserimento manuale dell'importo effettivamente erogato/stanziato nei progetti reali del PNRR, validando il non superamento del limite.
- **Incentivi Funzioni Tecniche** (`vn_art15c1k_art67c3c_incentiviTecniciCondoni`): Risorsa variabile esclusa, legata ai quadri economici degli appalti. Presenta criticità di sovrapposizione con utilizzi ed ex lege (vedi par. 6.6).
- **Arretrati CCNL 2026** (`vn_art58_CCNL2026_arretrati2024_2025`): Importo una tantum calcolato analiticamente dal wizard per coprire le annualità pregresse 2024-2025 (0,14%). Trasferito automaticamente come risorsa esclusa.
- **Incremento 0,22% CCNL 2026** (`vn_art58c2_incremento_max022_ms2021`): Quota variabile opzionale ripartita proporzionalmente al fondo dipendenti dal Monte Salari 2021. Escluso dal limite Art. 23.
- **Risparmi straordinario** (`vn_art15c1m_art67c3e_risparmiStraordinario`): Riversamento delle economie certificate dell'anno precedente dallo straordinario. Escluso in quanto risorsa già controllata a monte.
- **Somme non utilizzate** (`vn_art80c1_sommeNonUtilizzateStabiliPrec`): Avanzi di contrattazione degli anni precedenti riassegnati alla parte variabile. Escluso.

---

## 7. Verifica del Controllo Art. 23

### 7.1 Analisi del Calcolo Attuale
Il calcolatore legacy (`src/logic/fundEngine.ts`) implementa il controllo del limite dell'Art. 23, comma 2, tramite la seguente formula:
1. **Fondo Base 2016**: Calcolato sommando i fondi storici del 2016 del personale non dirigente, EQ, dirigenti, segretario e lo straordinario storico (`historicalData.fondoSalarioAccessorioPersonaleNonDirEQ2016` + EQ 2016 + Dirigenza 2016 + Segretario 2016 + Straordinario 2016).
2. **Adeguamento personale**: Calcolato confrontando la consistenza media (FTE) del personale in servizio nel 2018 con quella dell'anno corrente. Se c'è un incremento del personale, il limite viene incrementato del valore medio pro-capite del 2018 moltiplicato per la variazione del personale (`importoAdeguamento`).
3. **Limite Art. 23 Attualizzato**: `limiteArt23C2Modificato = fondoBase2016 + importoAdeguamento`.
4. **Valore Soggetto a Limite**: Somma delle risorse stabili soggette (escluso il conglobamento comparto Art. 60) + le risorse variabili soggette FAD + le risorse stabili EQ + lo straordinario ordinario + le stabili della dirigenza e del segretario.
5. **Scostamento**: `delta = Valore Soggetto - Limite Attualizzato`. Se positivo, segnala sforamento.

### 7.2 Proposta di Nuova Struttura di Riepilogo
Per rendere il calcolo trasparente e di immediata lettura per i revisori dei conti e per l'ente, si propone di strutturare il riepilogo finale del limite in quattro valori cardine:

1. **Totale Fondo Costituito**:
   $$\text{Fondo Costituito Realmente} = \text{Somma Stabili Effettive} + \text{Somma Variabili Soggette} + \text{Somma Variabili Escluse}$$
   *Rappresenta l'ammontare reale delle risorse liquide del fondo contrattate con le RSU.*

2. **Totale Risorse Escluse dal Limite**:
   $$\text{Risorse Escluse} = \text{Somma Variabili Non Soggette} + \text{Incrementi CCNL (0,14\% stabile e arretrati)}$$
   *Rappresenta la quota del fondo che non rileva per il rispetto del tetto ex lege.*

3. **Totale Rilevante ai Fini Art. 23 c. 2**:
   $$\text{Valore Rilevante} = \text{Totale Fondo} - \text{Risorse Escluse} + \text{Straordinario Ordinario} + \text{Quota Figurativa Art. 60}$$
   *Rappresenta la spesa accessoria reale depurata delle deroghe, maggiorata delle risorse poste fuori dal fondo ma soggette a limite (straordinario) e delle quote figurative (Art. 60).*

4. **Scostamento rispetto al Limite Art. 23 Attualizzato**:
   $$\text{Scostamento} = \text{Limite Art. 23 Attualizzato} - \text{Valore Rilevante}$$
   *Se positivo, rappresenta il "Margine di sicurezza" inutilizzato. Se negativo, rappresenta il valore dello sforamento da decurtare obbligatoriamente.*

---

## 8. Matrice Wizard 2026 → Costituzione Fondo

La tabella seguente definisce come ogni dato raccolto nel nuovo wizard 2026 si raccorda con il modello dati della Costituzione Fondo:

| Step wizard | Dato wizard | Natura del dato | Destinazione Costituzione Fondo | Automatico/manuale | Effetto Art. 23 | Note |
|---|---|---|---|---|---|---|
| **Step 2** | Limite Art. 23 attualizzato | Limite massimo | `N/A` (Dato di controllo generale) | Automatico | Limite massimo | Presidia la conformità dell'intera spesa accessoria |
| **Step 4** | Incremento stabile 0,14% | Risorsa effettiva | `st_art58c1_CCNL2026_incremento014_MS2021` | Automatico | `FUORI_LIMITE_ART23` | Calcolato sul Monte Salari 2021 |
| **Step 4** | Arretrati 0,14% | Risorsa effettiva | `vn_art58_CCNL2026_arretrati2024_2025` | Automatico | `FUORI_LIMITE_ART23` | Una tantum per coprire 2024-2025 |
| **Step 4** | Incremento effettivo 0,22% Fondo | Risorsa effettiva | `vn_art58c2_incremento_max022_ms2021` | Automatico | `FUORI_LIMITE_ART23` | Quota proporzionale destinata al fondo personale |
| **Step 4** | Incremento effettivo 0,22% EQ | Risorsa effettiva | `va_incremento022_ms2021_eq` (nel fondo EQ) | Automatico | `FUORI_LIMITE_ART23` | Quota proporzionale destinata alle EQ |
| **Step 3** | Limite massimo D.L. 25/2025 | Limite massimo | `N/A` (Dato di controllo) | Automatico | `DENTRO_LIMITE_ART23` | Soglia basata sul 48% degli stipendi tabellari 2023 |
| **Step 3** | Importo effettivo D.L. 25/2025 | Risorsa effettiva | `st_incrementoDL25_2025` | Manuale | `DENTRO_LIMITE_ART23` | L'utente inserisce l'importo reale nel fondo, max = limite |
| **Step 5** | Riduzione Art. 60 | Risorsa effettiva / Fig. | `st_art60c2_CCNL2026_decurtazioneIndennitaComparto` | Automatico | `COMPUTO_FIGURATIVO` | Riduzione reale stabili, ma considerata figurativamente |
| **Step 6** | Riduzione stabile straordinario | Risorsa effettiva | `st_art79c1_art14c3_art67c2g_riduzioneStraordinario`| Automatico | `DENTRO_LIMITE_ART23` | Sostituisce stabili ed è finanziato da riduzione straordinario |
| **Step 6** | Economie straordinario | Risorsa effettiva | `vn_art15c1m_art67c3e_risparmiStraordinario` | Automatico | `FUORI_LIMITE_ART23` | Riversato come variabile una tantum |
| **Step 6** | Straordinario ordinario | Risorsa effettiva | `annualData.fondoLavoroStraordinario` | Automatico | `DENTRO_LIMITE_ART23` | Consistenza ordinaria residua dello straordinario |
| **Step 7** | Limite massimo PNRR Dipendenti | Limite massimo | `N/A` (Dato di controllo) | Automatico | `FUORI_LIMITE_ART23` | 5% stabile 2016 per dipendenti |
| **Step 7** | Importo effettivo PNRR Dipendenti | Risorsa effettiva | `vn_dl13_art8c3_incrementoPNRR_max5stabile2016` | Manuale | `FUORI_LIMITE_ART23` | L'utente inserisce l'importo reale nel fondo, max = limite |
| **Step 7** | Limite massimo PNRR Dirigenti | Limite massimo | `N/A` (Dato di controllo) | Automatico | `FUORI_LIMITE_ART23` | 5% stabile 2016 per dirigenti |
| **Step 7** | Importo effettivo PNRR Dirigenti | Risorsa effettiva | `va_dl13_2023_art8c3_incrementoPNRR` (in Dirigenza) | Manuale | `FUORI_LIMITE_ART23` | L'utente inserisce l'importo reale nel fondo dirigenti |

---

## 9. Campi da Correggere prima del Collegamento

Durante l'audit sono emerse alcune incoerenze, sovrapposizioni o campi obsoleti all'interno della struttura della Costituzione Fondo. Si propone la seguente razionalizzazione prioritaria:

### 9.1 Priorità Alta (Rischio di errore nei calcoli o nei limiti)
1. **Razionalizzazione Incentivi Funzioni Tecniche**:
   - *Criticità*: C'è sovrapposizione tra la voce di risorsa variabile `vn_art15c1k_art67c3c_incentiviTecniciCondoni` (che aggrega in un unico campo funzioni tecniche, condoni ed centralinisti non vedenti) e la voce di utilizzo `p_incentiviFunzioniTecnichePost2018` ("Incentivi per funzioni tecniche post-2018") e `p_indennitaCentralinistiNonVedenti`.
   - *Risoluzione*: Separare nettamente gli incentivi funzioni tecniche (ex art. 45 D.Lgs. 36/2023) in un campo autonomo denominato `vn_incentiviFunzioniTecniche_art45` escluso dall'Art. 23, depurando la voce storica generica.
2. **Esclusione scostamento Art. 60**:
   - *Criticità*: L'algoritmo di calcolo del limite esclude la decurtazione `st_art60c2_CCNL2026_decurtazioneIndennitaComparto` dalla somma delle risorse stabili. Questo è corretto ai fini figurativi, ma nella pagina di Costituzione Fondo non viene visualizzato in modo trasparente l'effetto reale (il fondo reale calante) rispetto a quello virtuale (limite).
   - *Risoluzione*: Creare un blocco di riepilogo "Effetto Neutro Art. 60" nel pannello delle conformità, evidenziando il valore reale del fondo al netto e il valore figurativo al lordo.

### 9.2 Priorità Media (Leggibilità ed etichette)
1. **Ridenominazione voci generiche**:
   - `vs_art79c2c_risorseScelteOrganizzative`: Ridenominare in *"Risorse variabili per scelte organizzative e politiche retributive (CCDI)"*.
   - `vn_art15c1k_art16_dl98_art67c3b_pianiRazionalizzazione`: Ridenominare in *"Risparmi da Piani di Razionalizzazione e Riqualificazione Spesa (Art. 16 DL 98/2011)"*.
   - `vn_art18h_art67c3c_incentiviSpeseGiudizioCensimenti`: Ridenominare in *"Compensi Censimento ISTAT e spese giudizio avvocatura (esclusi)"*.
2. **Deprecazione e pulizia delle voci scadute**:
   - `vn_art79c1b_euro8450_unaTantum2021_2022` (Scaduta): Rimuovere o nascondere definitivamente dall'interfaccia.
   - `vn_art79c3_022MonteSalari2018_da2022UnaTantum2022` (Scaduta): Rimuovere.
   - `vn_art79c3_022MonteSalari2018_da2022Proporzionale`: Deprecare in quanto ormai storicizzata ed assorbita nell'unico importo consolidato.

### 9.3 Priorità Bassa (Ergonomia ed Help Text)
1. **Filtri di visualizzazione per tipologia di ente**:
   - *Miglioria*: Voci come `st_art79c1_art15c1i_art67c2f_regioniRiduzioneDirig` (Regioni) o `vn_art67c3j_regioniCittaMetro_art23c4_incrPercentuale` (Regioni/Città Metropolitane) sono visibili a tutti gli enti locali (comuni, unioni), generando confusione.
   - *Risoluzione*: Utilizzare le proprietà condizionali per nascondere queste righe se la tipologia dell'ente in Step 1 non corrisponde a `REGIONE` o `CITTA_METROPOLITANA`.

---

## 10. Proposta di MOD Successiva

Si propone la pianificazione immediata della seguente evoluzione tecnica:

### **MOD-024 — Riallineamento UI e modello Art. 23 della Costituzione Fondo personale dipendente**

L'obiettivo della MOD-024 sarà l'implementazione fisica delle razionalizzazioni individuate dall'audit, divisa nelle seguenti sotto-fasi operative:

#### 10.1 Modifiche alla UI (User Interface)
- Nascondere condizionatamente i campi stabili e variabili specifici per Regioni e Città Metropolitane sulla base del tipo ente impostato.
- Disabilitare visivamente le righe storiche e le voci scadute deprecate.
- Inserire descrizioni di aiuto (help text) e warning normativi specifici a fianco dei campi manuali di importazione (D.L. 25/2025 e PNRR) per prevenire l'errore di inserimento del limite teorico.

#### 10.2 Modifiche al Modello Dati
- Introdurre il campo `st_incrementoDL25_2025_effettivo` e `vn_dl13_art8c3_incrementoPNRR_effettivo` nel modello dati di `FondoAccessorioDipendenteData` per separare l'inserimento reale rispetto ai massimali ereditati dal wizard.
- Separare la chiave unica degli incentivi tecnici in `vn_incentiviFunzioniTecniche_art45` per depurarla dai condoni edilizi storici.

#### 10.3 Modifiche al Motore di Calcolo (`fundEngine.ts`)
- Ristrutturare la card e il prospetto del limite dell'Art. 23 c. 2 in conformità alla nuova struttura a quattro valori (Fondo Costituito, Quota Esclusa, Quota Rilevante, Scostamento).
- Integrare la logica di controllo che blocca l'inserimento di importi effettivi superiori ai limiti massimi importati dal wizard, emettendo un errore bloccante in caso di violazione.

#### 10.4 Modifiche al Mapping del Wizard (`applyWizard2026Transfer.ts`)
- Aggiornare il payload di trasferimento in modo che popoli esclusivamente i tetti massimi di controllo (come limiti) e non compili automaticamente i campi effettivi per D.L. 25/2025 e PNRR.

#### 10.5 Modifiche da NON fare ancora
- Non eliminare la pagina `DataEntryPage.tsx` o il vecchio wizard in questa fase, per permettere un collaudo parallelo tra i due motori.
- Non modificare lo schema delle tabelle del database su Supabase; tutti i nuovi campi effettivi e limiti saranno gestiti in locale/sessione fino alla stabilizzazione definitiva.
