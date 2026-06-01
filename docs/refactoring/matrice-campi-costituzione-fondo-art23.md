# Matrice Campi Costituzione Fondo e Impatto Art. 23 (CCNL 2026 & D.L. 25/2025)

## 1. Premessa Metodologica

Questo documento definisce la mappatura completa per il raccordo e la futura transizione tra il nuovo wizard **"Raccolta dati dell’Ente / Configurazione fondo"** (sviluppato in stato draft isolato in `src/features/wizard2026/`) e la pagina di **"Costituzione Fondo"** (`FondoAccessorioDipendentePage`).

L'obiettivo di questa mappatura è garantire che il riversamento dei dati dal wizard all'applicazione reale avvenga in modo strutturato, coerente e privo di rischi per l'integrità dei dati storici. Per fare questo, distinguiamo i dati in quattro categorie operative:
1. **Importo effettivo da trasferire**: Valore calcolato dal wizard che deve popolare in modo diretto un campo della Costituzione Fondo.
2. **Limite massimo**: Tetto normativo calcolato (es. D.L. 25/2025 o PNRR) che funge da blocco di convalida per l'inserimento manuale o per calcoli a valle.
3. **Dato di controllo**: Parametro che serve a presidiare la conformità (es. il totale dello straordinario escluso).
4. **Dato solo istruttorio**: Informazione di supporto inserita dall'utente (es. personale FTE o tetti storici 2016) utilizzata esclusivamente per determinare i calcoli interni al wizard.

> [!IMPORTANT]
> **Vincolo di Sicurezza Mandatorio**
> In questa fase preliminare di mappatura e documentazione, non viene modificato alcun codice di produzione. Tutte le modifiche applicative, le scritture su Supabase, le alterazioni del context e l'effettivo trasferimento dei dati rimangono disabilitati fino alla completa approvazione e al superamento del collaudo.

---

## 2. Tabella Completa dei Campi Legacy (Costituzione Fondo e sotto-fondi)

Questa tabella elenca tutte le variabili attualmente definite per la Costituzione del Fondo dipendenti (`FondoAccessorioDipendenteData`), delle Elevate Qualificazioni (`FondoElevateQualificazioniData`), della Dirigenza (`FondoDirigenzaData`) e del Lavoro Straordinario.

### 2.1 Fondo Accessorio Dipendenti (FAD) - Risorse Stabili

| Nome Tecnico | Descrizione Utente | Sezione / Area | Rilevanza Art. 23 c. 2 | Tipo Dato | Stato Futuro | Note |
|---|---|---|---|---|---|---|
| `st_art79c1_art67c1_unicoImporto2017` | Unico importo consolidato 2017 | Parte Stabile FAD | **Sì** (Dentro Limite) | Manuale | Da mantenere | Base storica consolidata |
| `st_art79c1_art67c1_alteProfessionalitaNonUtil` | Alte professionalità non utilizzate al 2017 | Parte Stabile FAD | **Sì** (Dentro Limite) | Manuale | Da mantenere | Riferimento ex Art. 67 c. 1 |
| `st_art79c1_art67c2a_incr8320` | Incremento €83,20 pro-capite (pers. 2015) | Parte Stabile FAD | **No** (Fuori Limite) | Manuale | Da mantenere | Escluso per contratto/legge |
| `st_art79c1_art67c2b_incrStipendialiDiff` | Incrementi stipendiali differenziali 2018 | Parte Stabile FAD | **No** (Fuori Limite) | Manuale | Da mantenere | Risorse contrattuali escluse |
| `st_art79c1_art4c2_art67c2c_integrazioneRIA` | Integrazione RIA personale cessato anno prec. | Parte Stabile FAD | **Sì** (Dentro Limite) | Manuale | Da mantenere | Costo RIA storico |
| `st_art79c1_art67c2d_risorseRiassorbite165` | Risorse riassorbite ex D.Lgs. 165/2001 | Parte Stabile FAD | **Sì** (Dentro Limite) | Manuale | Da mantenere | Riassorbimento stabili |
| `st_art79c1_art15c1l_art67c2e_personaleTrasferito` | Risorse personale trasferito (decentramento) | Parte Stabile FAD | **Sì** (Dentro Limite) | Manuale | Da mantenere | Trasferimento di limite |
| `st_art79c1_art15c1i_art67c2f_regioniRiduzioneDirig` | Regioni: riduzione stabile posti dirigenziali | Parte Stabile FAD | **Sì** (Dentro Limite) | Manuale | Da mantenere | Limite specifico Regioni |
| `st_art79c1_art14c3_art67c2g_riduzioneStraordinario` | Riduzione stabile straordinario per Fondo | Parte Stabile FAD | **Sì** (Dentro Limite) | Manuale | Da mantenere | Consolidamento in parte stabile |
| `st_art79c1b_euro8450` | Incremento €84,50 pro-capite (pers. 2018) | Parte Stabile FAD | **No** (Fuori Limite) | Manuale | Da mantenere | Escluso da tetto 2016 |
| `st_art79c1c_incrementoStabileConsistenzaPers` | Incremento stabile consistenza personale | Parte Stabile FAD | **No** (Fuori Limite) | Manuale | Da mantenere | Escluso per contratto |
| `st_art79c1d_differenzialiStipendiali2022` | Differenziali stipendiali CCNL 2022 | Parte Stabile FAD | **No** (Fuori Limite) | Manuale | Da mantenere | Escluso (CCNL 2022) |
| `st_art79c1bis_diffStipendialiB3D3` | Differenziali stipendiali posizioni B3/D3 | Parte Stabile FAD | **No** (Fuori Limite) | Manuale | Da mantenere | Conservazione differenziali |
| `st_taglioFondoDL78_2010` | Taglio stabile fondo D.L. 78/2010 | Parte Stabile FAD (Sottrattore) | **Sì** (Riduce il tetto) | Manuale | Da mantenere | Decurtazione permanente |
| `st_riduzioniPersonaleATA_PO_Esternalizzazioni` | Riduzioni per ATA, esternalizzazioni, ecc. | Parte Stabile FAD (Sottrattore) | **Sì** (Riduce il tetto) | Manuale | Da mantenere | Decurtazione per riorganizzazioni |
| `st_art67c1_decurtazionePO_AP_EntiDirigenza` | Decurtazione PO/AP enti con dirigenza | Parte Stabile FAD (Sottrattore) | **Sì** (Riduce il tetto) | Manuale | Da mantenere | Separazione risorse PO |
| `st_incrementoDecretoPA` | Incremento D.L. 75/2023 (Decreto PA bis) | Parte Stabile FAD | **No** (Fuori Limite) | Manuale | **Da deprecare** | Sostituito da D.L. 25/2025 |
| `st_art58c1_CCNL2026_incremento014_MS2021` | Incremento stabile 0,14% Monte Salari 2021 | Parte Stabile FAD | **No** (Fuori Limite) | Automatico | Da mantenere | [NUOVO] Escluso per contratto |
| `st_incrementoDL25_2025` | Incremento D.L. 25/2025 (soglia 48%) | Parte Stabile FAD | **Sì** (Dentro Limite) | Suggerito | Da mantenere | [NUOVO] Armonizzazione |
| `st_riduzionePerIncrementoEQ` | Riduzione stabile per incremento risorse EQ | Parte Stabile FAD (Sottrattore) | **Sì** (Riduce il tetto) | Automatico | Da mantenere | Spostamento a EQ (Invariato tot) |
| `st_art60c2_CCNL2026_decurtazioneIndennitaComparto`| Riduzione permanente per conglobamento comparto| Parte Stabile FAD (Sottrattore) | **Sì** (Figurativo) | Automatico | Da mantenere | [NUOVO] Art. 60 CCNL 2026 |
| `st_riduzioneFondoStraordinario` | Riduzione stabile per finanziare straordinario | Parte Stabile FAD (Sottrattore) | **Sì** (Riduce il tetto) | Automatico | Da mantenere | Spostamento a straordinario |

### 2.2 Fondo Accessorio Dipendenti (FAD) - Risorse Variabili

| Nome Tecnico | Descrizione Utente | Sezione / Area | Rilevanza Art. 23 c. 2 | Tipo Dato | Stato Futuro | Note |
|---|---|---|---|---|---|---|
| `vs_art4c3_art15c1k_art67c3c_recuperoEvasione` | Recupero evasione tributaria (ICI/IMU) | Parte Variabile FAD | **Sì** (Dentro Limite) | Manuale | Da mantenere | Soggetta al tetto |
| `vs_art4c2_art67c3d_integrazioneRIAMensile` | Integrazione RIA cessati in corso d'anno | Parte Variabile FAD | **Sì** (Dentro Limite) | Manuale | Da mantenere | Quota mensile pro-rata |
| `vs_art67c3g_personaleCaseGioco` | Risorse personale case da gioco | Parte Variabile FAD | **Sì** (Dentro Limite) | Manuale | Da mantenere | Abilitata se gestite |
| `vs_art79c2b_max1_2MonteSalari1997` | Quota storica max 1,2% Monte Salari 1997 | Parte Variabile FAD | **Sì** (Dentro Limite) | Manuale | Da mantenere | Storica |
| `vs_art67c3k_integrazioneArt62c2e_personaleTrasferito`| Quota variabile personale trasferito | Parte Variabile FAD | **Sì** (Dentro Limite) | Manuale | Da mantenere | Soggetta a limite |
| `vs_art79c2c_risorseScelteOrganizzative` | Stanziamento per scelte organizzative / TD | Parte Variabile FAD | **Sì** (Dentro Limite) | Manuale | Da mantenere | Variabile generica |
| `vn_art15c1d_art67c3a_sponsorConvenzioni` | Sponsorizzazioni, convenzioni, extra | Parte Variabile FAD | **No** (Fuori Limite) | Manuale | Da mantenere | Entrate terzi escluse |
| `vn_art54_art67c3f_rimborsoSpeseNotifica` | Quota rimborso spese notifica (messi) | Parte Variabile FAD | **No** (Fuori Limite) | Manuale | Da mantenere | Deroga ex lege |
| `vn_art15c1k_art16_dl98_art67c3b_pianiRazionalizzazione`| Piani di razionalizzazione Art. 16 DL 98 | Parte Variabile FAD | **No** (Fuori Limite) | Manuale | Da mantenere | Deroga ex lege |
| `vn_art15c1k_art67c3c_incentiviTecniciCondoni` | Incentivi funzioni tecniche e condoni | Parte Variabile FAD | **No** (Fuori Limite) | Manuale | Da mantenere | Deroga ex lege (Appalti) |
| `vn_art18h_art67c3c_incentiviSpeseGiudizioCensimenti`| Incentivi avvocatura, ISTAT, censimenti | Parte Variabile FAD | **No** (Fuori Limite) | Manuale | Da mantenere | Deroga ex lege |
| `vn_art15c1m_art67c3e_risparmiStraordinario` | Risparmi da straordinario anno precedente | Parte Variabile FAD | **No** (Fuori Limite) | Manuale | Da mantenere | Spostamento già vigilato |
| `vn_art67c3j_regioniCittaMetro_art23c4_incrPercentuale`| Incremento % Regioni e Città Metropolitane | Parte Variabile FAD | **No** (Fuori Limite) | Manuale | Da mantenere | Deroga ex comma 4 |
| `vn_art80c1_sommeNonUtilizzateStabiliPrec` | Avanzi stabili trascinati da anno precedente | Parte Variabile FAD | **No** (Fuori Limite) | Manuale | Da mantenere | Già transitati nel limite |
| `vn_l145_art1c1091_incentiviRiscossioneIMUTARI`| Incentivi riscossione IMU/TARI | Parte Variabile FAD | **No** (Fuori Limite) | Manuale | Da mantenere | Esclusione specifica |
| `vn_l178_art1c870_risparmiBuoniPasto2020` | Risparmi buoni pasto 2020 | Parte Variabile FAD | **No** (Fuori Limite) | Manuale | Da mantenere | Temporanea storica |
| `vn_dl135_art11c1b_risorseAccessorieAssunzioniDeroga`| Risorse accessorie assunzioni in deroga | Parte Variabile FAD | **No** (Fuori Limite) | Manuale | Da mantenere | Esclusione specifica |
| `vn_art79c3_022MonteSalari2018_da2022Proporzionale`| 0,22% MS 2018 proporzionale stabile | Parte Variabile FAD | **No** (Fuori Limite) | Manuale | **Da deprecare**| Consolidata / Storica |
| `vn_art79c1b_euro8450_unaTantum2021_2022` | Una tantum €84,50 (anni 2021-2022) | Parte Variabile FAD | **No** (Fuori Limite) | Manuale | **Eliminare** | Temporanea scaduta |
| `vn_art79c3_022MonteSalari2018_da2022UnaTantum2022`| Una tantum 0,22% (anno 2022) | Parte Variabile FAD | **No** (Fuori Limite) | Manuale | **Eliminare** | Temporanea scaduta |
| `vn_art58c2_incremento_max022_ms2021` | Incremento 0,22% MS 2021 destinato a Fondo | Parte Variabile FAD | **No** (Fuori Limite) | Suggerito | Da mantenere | [NUOVO] Escluso per contratto |
| `vn_art58_CCNL2026_arretrati2024_2025` | Arretrati 2024-2025 (una tantum) | Parte Variabile FAD | **No** (Fuori Limite) | Manuale | Da mantenere | [NUOVO] Escluso per contratto |
| `vn_dl13_art8c3_incrementoPNRR_max5stabile2016` | Incremento PNRR (max 5% stabile 2016) | Parte Variabile FAD | **No** (Fuori Limite) | Manuale | Da mantenere | Deroga ex lege |

### 2.3 Fondo Elevate Qualificazioni (EQ)

| Nome Tecnico | Descrizione Utente | Sezione / Area | Rilevanza Art. 23 c. 2 | Tipo Dato | Stato Futuro | Note |
|---|---|---|---|---|---|---|
| `ris_fondoPO2017` | Fondo risorse PO/EQ 2017 | Risorse EQ | **Sì** (Dentro Limite) | Manuale | Da mantenere | Consolidato storico |
| `ris_incrementoConRiduzioneFondoDipendenti` | Incremento EQ prelevato da Fondo dipendenti | Risorse EQ | **Sì** (Dentro Limite) | Manuale | Da mantenere | Invariato sul limite tot |
| `ris_incrementoLimiteArt23c2_DL34` | Incremento EQ in deroga D.L. 34/2019 | Risorse EQ | **Sì** (Adeguamento tetto) | Manuale | Da mantenere | Ricalcolo capienza |
| `ris_incremento022MonteSalari2018` | Incremento 0,22% MS 2018 (storico EQ) | Risorse EQ | **No** (Fuori Limite) | Manuale | Da deprecare | Storica |
| `va_incremento022_ms2021_eq` | Incremento 0,22% MS 2021 destinato a EQ | Risorse EQ | **No** (Fuori Limite) | Manuale | Da mantenere | [NUOVO] Escluso per contratto |
| `st_art16c2_retribuzionePosizione` | Retribuzione di posizione EQ | Utilizzo EQ | **Sì** (Figurativo) | Manuale | Da mantenere | Voce di utilizzo |
| `va_art16c3_retribuzioneRisultato` | Retribuzione di risultato EQ | Utilizzo EQ | **Sì** (Figurativo) | Manuale | Da mantenere | Voce di utilizzo (min 15%) |
| `va_dl25_2025_armonizzazione` | Quota incremento D.L. 25/2025 per EQ | Risorse EQ | **Sì** (Dentro Limite) | Manuale | Da mantenere | [NUOVO] Da riparto 48% |

### 2.4 Fondo Dirigenti

| Nome Tecnico | Descrizione Utente | Sezione / Area | Rilevanza Art. 23 c. 2 | Tipo Dato | Stato Futuro | Note |
|---|---|---|---|---|---|---|
| `st_art57c2a_CCNL2020_unicoImporto2020` | Unico importo consolidato 2020 | Stabili Dirigenti | **Sì** (Dentro Limite) | Manuale | Da mantenere | Storica consolidata |
| `st_art57c2a_CCNL2020_riaPersonaleCessato2020` | RIA personale cessato 2020 dirigenti | Stabili Dirigenti | **Sì** (Dentro Limite) | Manuale | Da mantenere | Storica |
| `st_art56c1_CCNL2020_incremento1_53MonteSalari2015`| Incremento 1,53% MS 2015 dirigenti | Stabili Dirigenti | **No** (Fuori Limite) | Manuale | Da mantenere | Escluso per contratto |
| `st_art57c2c_CCNL2020_riaCessatidallAnnoSuccessivo`| RIA cessati anni successivi dirigenti | Stabili Dirigenti | **Sì** (Dentro Limite) | Manuale | Da mantenere | Dinamica |
| `st_art39c1_CCNL2024_incremento2_01MonteSalari2018`| Incremento 2,01% MS 2018 dirigenti | Stabili Dirigenti | **No** (Fuori Limite) | Manuale | Da deprecare | Contratto 2016-18 |
| `st_art24c1_CCNL2022_2024_incremento3_05MonteSalari2021`| Incremento 3,05% MS 2021 dirigenti | Stabili Dirigenti | **No** (Fuori Limite) | Manuale | Da mantenere | Contratto 2019-21 |
| `va_art24c3_CCNL2022_2024_incremento0_22MonteSalari2021`| Incremento 0,22% MS 2021 dirigenti | Variabili Dirigenti | **No** (Fuori Limite) | Manuale | Da mantenere | Contratto 2019-21 |
| `va_art57c2b_CCNL2020_risorseLeggeSponsor` | Risorse ex lege, sponsor, convenzioni dirigenti | Variabili Dirigenti | **No** (Fuori Limite) | Manuale | Da mantenere | Escluse |
| `va_art33c2_DL34_2019_incrementoDeroga` | Incremento spesa dirigenti ex D.L. 34/2019 | Variabili Dirigenti | **Sì** (Adeguamento tetto) | Manuale | Da mantenere | Dinamica |
| `va_dl13_2023_art8c3_incrementoPNRR` | Incremento PNRR dirigenti (max 5% 2016) | Variabili Dirigenti | **No** (Fuori Limite) | Manuale | Da mantenere | Deroga PNRR |

---

## 3. Tabella Completa dei Campi del Nuovo Wizard

Questa tabella censisce tutti i campi raccolti o calcolati nello stato di draft del nuovo wizard (`Wizard2026DraftState`), definendone la natura contabile e la proposta di collegamento.

| Step | Campo nel Draft | Descrizione Utente | Natura Contabile | Collegamento Proposto | Note / Vincoli |
|---|---|---|---|---|---|
| **Step 2** | `art23.limite2016CertificatoEnte` | Limite Art. 23 certificato nel 2016 | Dato solo istruttorio | `historicalData.manualStrategyFundLimit2016` | Punto di partenza |
| **Step 2** | `art23.fondoPersonaleDipendente2016` | Quota FAD 2016 | Dato solo istruttorio | `historicalData.fondoSalarioAccessorio...2016` | Ricostruzione analitica |
| **Step 2** | `art23.fondoEqPo2016` | Quota EQ/PO 2016 | Dato solo istruttorio | `historicalData.fondoElevateQualificazioni2016`| Ricostruzione analitica |
| **Step 2** | `art23.fondoDirigenza2016` | Quota Dirigenza 2016 | Dato solo istruttorio | `historicalData.fondoDirigenza2016` | Ricostruzione analitica |
| **Step 2** | `art23.fondoStraordinario2016` | Fondo Straordinario 2016 | Dato solo istruttorio | `historicalData.manualPersonalFundLimit2016` (part)| Incluso nel tetto |
| **Step 2** | `art23.personaleServizio31122018` | Personale equivalente al 31.12.2018 | Dato solo istruttorio | `historicalData.personaleServizio2018` | Calcolo valore medio |
| **Step 2** | `art23.personalePrevisto2026Piao` | Personale equivalente programmato (PIAO) | Dato solo istruttorio | `annualData.manualDipendentiEquivalentiAnnoRif` | Per adeguamento limite |
| **Step 2** | `art23.result.limiteArt23Attualizzato` | Limite Art. 23 attualizzato calcolato | Dato di controllo | `cl_ammontareSoggettoLimite2016` (target tetto) | Valore limite dinamico |
| **Step 3** | `dl25.result.limiteMassimoDL25` | Limite teorico massimo D.L. 25/2025 | Limite massimo | `istruttorio.limiteMassimoIncrementoDL25` | Calcolo basato sul 48% |
| **Step 3** | `dl25.result.quotaTrasferitaAderenti` | Quota trasferita per Unioni/Comunità | Importo effettivo | `annualData.quotaTrasferitaAderentiDL25_2025` | Solo per TRANSFER_ONLY |
| **Step 4** | `ccnl2026.result.incrementoStabile014` | Incremento stabile obbligatorio 0,14% | Importo effettivo | `st_art58c1_CCNL2026_incremento014_MS2021` | Inserimento automatico |
| **Step 4** | `ccnl2026.result.arretrati014` | Arretrati 2024-2025 (una tantum 0,14%) | Importo effettivo | `vn_art58_CCNL2026_arretrati2024_2025` (quota) | Variabile una tantum |
| **Step 4** | `ccnl2026.result.incremento022Fondo` | Quota 0,22% destinata al Fondo | Importo effettivo | `vn_art58c2_incremento_max022_ms2021` | Scelta contrattazione |
| **Step 4** | `ccnl2026.result.incremento022EQ` | Quota 0,22% destinata alle EQ | Importo effettivo | `va_incremento022_ms2021_eq` | Scelta contrattazione |
| **Step 5** | `conglobamentoArt60.result.riduzioneTotale`| Taglio per conglobamento comparto | Importo effettivo | `st_art60c2_CCNL2026_decurtazioneIndennitaComparto`| Riduzione stabile |
| **Step 6** | `straordinario.result.economieDaTrasferireVariabileUnaTantum` | Risparmi straordinario trasferiti a Fondo| Importo effettivo | `vn_art15c1m_art67c3e_risparmiStraordinario` | Variabile una tantum |
| **Step 6** | `straordinario.result.incrementoParteStabileDaRiduzioneStraordinario`| Riduzione stabile straordinario per Fondo | Importo effettivo | `st_art79c1_art14c3_art67c2g_riduzioneStraordinario`| Incremento stabile |
| **Step 6** | `straordinario.result.straordinarioOrdinarioSoggettoArt23` | Fondo straordinario corrente soggetto | Dato di controllo | `annualData.fondoLavoroStraordinario` | Inserito per calcolo |
| **Step 7** | `pnrr.result.limiteMassimoPnrrFondoDipendenti` | Limite massimo 5% PNRR Dipendenti | Limite massimo | `istruttorio.limiteMassimoPnrrFondoDipendenti` | Tetto insuperabile |
| **Step 7** | `pnrr.result.limiteMassimoPnrrFondoDirigenza` | Limite massimo 5% PNRR Dirigenza | Limite massimo | `istruttorio.limiteMassimoPnrrFondoDirigenza` | Tetto insuperabile |

---

## 4. Matrice di Raccordo Wizard → Costituzione Fondo

La seguente matrice illustra l'esatta logica di trasferimento per ciascun modulo dello stato draft, con i relativi vincoli e modalità di computo.

```mermaid
flowchart TD
    subgraph WIZARD [Wizard Istruttorio 2026 (Draft State)]
        W_Art23[Step 2: Limite Art. 23]
        W_DL25[Step 3: D.L. 25/2025]
        W_CCNL[Step 4: CCNL 2026]
        W_Art60[Step 5: Conglobamento Art. 60]
        W_Straord[Step 6: Straordinario]
        W_PNRR[Step 7: PNRR]
    end

    subgraph LEGACY [Costituzione Fondo (Public State)]
        L_Lim23[Target Limite Art. 23]
        L_St_DL25[st_incrementoDL25_2025]
        L_St_014[st_art58c1_CCNL2026_incremento014_MS2021]
        L_Vn_022[vn_art58c2_incremento_max022_ms2021]
        L_Va_022EQ[va_incremento022_ms2021_eq]
        L_Dec_Art60[st_art60c2_CCNL2026_decurtazioneIndennitaComparto]
        L_St_Straord[st_art79c1_art14c3_art67c2g_riduzioneStraordinario]
        L_Vn_Straord[vn_art15c1m_art67c3e_risparmiStraordinario]
        L_Vn_PNRR[vn_dl13_art8c3_incrementoPNRR_max5stabile2016]
    end

    W_Art23 -->|Adeguamento Limite 2016| L_Lim23
    W_DL25 -->|Nessun trasferimento automatico effettivo| L_St_DL25
    W_CCNL -->|Incremento 0.14% Stabile| L_St_014
    W_CCNL -->|Quota 0.22% Fondo| L_Vn_022
    W_CCNL -->|Quota 0.22% EQ| L_Va_022EQ
    W_Art60 -->|Riduzione Stabile Comparto| L_Dec_Art60
    W_Straord -->|Trasferimento Stabile Art. 67| L_St_Straord
    W_Straord -->|Riporto Economie Variabile| L_Vn_Straord
    W_PNRR -->|Nessun trasferimento automatico effettivo| L_Vn_PNRR
```

### 4.1 Step 2 — Art. 23
*   **Limite Art. 23 attualizzato**: Popola in sola visualizzazione il limite di spesa complessivo per il salario accessorio dell'anno. Non scrive in via diretta sul fondo, ma è usato come parametro di validazione nel motore di calcolo (`cl_ammontareSoggettoLimite2016`).
*   **Variazione del personale rispetto al 31.12.2018**: Popola i parametri `personaleServizio2018` e `manualDipendentiEquivalentiAnnoRif` per l'adeguamento proporzionale pro-capite del tetto.
*   **Fondo dipendenti / EQ 2018 e personale 2018**: Salvati come dati storici per il calcolo della spesa media pro capite dell'anno 2018, da cui si ricava la quota di incremento/decremento limite.

### 4.2 Step 3 — D.L. 25/2025
*   **Limite massimo teorico (soglia 48%)**: Calcolato con formula `(stipendiTabellari2023NonDirigenti * 0,48) - FondoStabile2025 - EQ2025`. È un dato esclusivamente istruttorio che viene salvato nei metadati dell'anno per visualizzare il tetto invalicabile.
*   **Quota massima trasferibile per Unioni/Comunità montane**: Viene salvata nel campo specifico `quotaTrasferitaAderentiDL25_2025` se l'ente ha tipologia `TRANSFER_ONLY`.
*   **Vincolo fondamentale**: Nessun incremento effettivo automatico deve essere inserito in questa fase in `st_incrementoDL25_2025` o `va_dl25_2025_armonizzazione`. L'ente dovrà deliberare l'importo reale spettante in contrattazione (fino al limite massimo teorico) e inserirlo a mano nella Costituzione Fondo.

### 4.3 Step 4 — CCNL 23.02.2026
*   **Incremento stabile 0,14%**: Trasferito interamente al campo stabile `st_art58c1_CCNL2026_incremento014_MS2021` (moltiplicato per 1 annualità a regime).
*   **Arretrati 2024-2025 (una tantum 0,14% x 2)**: Trasferiti al campo variabile `vn_art58_CCNL2026_arretrati2024_2025` come risorsa non soggetta una tantum.
*   **Limite massimo 0,22%**: Salvato come metadato istruttorio di controllo.
*   **Incremento 0,22% scelto per l'anno / Quota Fondo / Quota EQ**: La quota destinata al Fondo risorse decentrate popola `vn_art58c2_incremento_max022_ms2021`. La quota destinata alle EQ popola `va_incremento022_ms2021_eq`.

### 4.4 Step 5 — Art. 60 Conglobamento Indennità di Comparto
*   **Riduzione stabile del Fondo**: Il valore calcolato `riduzioneTotale = Somma(FTE_Area * Importo_Annuo_Tabella_C)` popola in detrazione stabile il campo `st_art60c2_CCNL2026_decurtazioneIndennitaComparto`.
*   **Trattamento annualità successive**: Il valore è consolidato nell'anno 2026 e deve essere trascinato identico negli anni successivi senza essere ricalcolato in base al personale in servizio dell'anno N (blocco a freddo sul 2026).
*   **Neutralità e computo figurativo**: Ai fini dell'Art. 23 c. 2, questa decurtazione riduce fisicamente le risorse stabili del fondo, ma l'importo deve essere computato figurativamente nel totale soggetto a limite per garantire che l'operazione non generi spesa accessoria aggiuntiva né riduca surrettiziamente il tetto dell'ente (neutralità finanziaria).

### 4.5 Step 6 — Fondo Lavoro Straordinario
*   **Fondo straordinario ordinario corrente**: Popola `annualData.fondoLavoroStraordinario` (dato istruttorio).
*   **Riduzione stabile ex Art. 67 CCNL 21.5.2018**: L'importo sottratto in modo permanente allo straordinario popola `st_art79c1_art14c3_art67c2g_riduzioneStraordinario` per incrementare stabilmente il Fondo risorse decentrate.
*   **Economie da straordinario**: Le economie certificate dell'anno precedente popolano `vn_art15c1m_art67c3e_risparmiStraordinario` in parte variabile una tantum. Non concorrono ad incrementare in via permanente la base del fondo straordinario corrente.
*   **Risorse escluse**: Lo straordinario escluso per consultazioni elettorali, censimenti o calamità popola lo stato di controllo per garantire la corretta nettizzazione del tetto dell'Art. 23 c. 2.

### 4.6 Step 7 — PNRR
*   **Limite massimo teorico (5% del Fondo Stabile 2016)**: Popola i campi istruttori `istruttorio.limiteMassimoPnrrFondoDipendenti` e `istruttorio.limiteMassimoPnrrFondoDirigenza`.
*   **Trattamento ai fini Art. 23**: Queste risorse sono escluse per legge dal limite di spesa.
*   **Vincolo di trasferimento**: Nessun incremento effettivo deve essere trasferito automaticamente in questa fase al campo `vn_dl13_art8c3_incrementoPNRR_max5stabile2016`. L'importo effettivo sarà valorizzato a mano in base ai progetti PNRR approvati e rendicontati dall'ente.

---

## 5. Matrice di Trattamento ai fini dell'Art. 23, comma 2

Classificazione delle risorse e dei dati in base alla rilevanza ai fini del tetto di spesa accessoria ex Art. 23 c. 2 D.Lgs. 75/2017:

### A. Dentro Limite (Soggette)
Risorse ordinarie che concorrono a saturare il tetto storico dell'ente:
*   Unico importo consolidato 2017 (`st_art79c1_art67c1_unicoImporto2017` e AP non utilizzate).
*   RIA del personale cessato nell'anno precedente (`st_art79c1_art4c2_art67c2c_integrazioneRIA`).
*   Risorse riassorbite ex 165 (`st_art79c1_art67c2d_risorseRiassorbite165`).
*   Personale trasferito per mobilità stabile (`st_art79c1_art15c1l_art67c2e_personaleTrasferito`).
*   Riduzione stabile dello straordinario confluita nel fondo.
*   Incremento D.L. 25/2025 (armonizzazione del 48%, sia quota dipendenti che EQ).
*   Risorse variabili soggette (recupero evasione tributaria, RIA mensile cessati in corso d'anno, case da gioco).
*   Fondo straordinario ordinario corrente (quota soggetta).

### B. Fuori Limite (Escluse / In Deroga)
Risorse escluse dal tetto per espressa previsione legislativa o contrattuale:
*   Incremento stabile 0,14% Monte Salari 2021 (`st_art58c1_CCNL2026_incremento014_MS2021`).
*   Incremento 0,22% Monte Salari 2021 scelto per l'anno (sia quota Fondo che quota EQ).
*   Arretrati contrattuali 2024-2025 (`vn_art58_CCNL2026_arretrati2024_2025`).
*   Incremento €83,20 pro-capite del 2015 e €84,50 pro-capite del 2018.
*   Incentivi per funzioni tecniche ex D.Lgs. 36/2023 (`vn_art15c1k_art67c3c_incentiviTecniciCondoni`).
*   Incentivi per la riscossione IMU/TARI ex L. 145/2018.
*   Compensi da contratti di sponsorizzazione o convenzioni attive.
*   Spese di notifica destinate ai messi notificatori.
*   Incentivi per avvocatura interna su sentenze favorevoli con recupero spese.
*   Risorse variabili PNRR (fino al 5% del fondo stabile 2016).
*   Economie del fondo straordinario o del fondo stabile dell'anno precedente reintrodotte (già vigilate nell'anno di provenienza).
*   Straordinario escluso per consultazioni elettorali o calamità naturali.

### C. Computo Figurativo
Voci che non costituiscono spesa accessoria reale corrente o che sono state riclassificate, ma devono essere computate a fini di controllo per l'invarianza del limite:
*   **Conglobamento comparto Art. 60**: Pur riducendo il fondo stabile, il valore della riduzione deve essere computato figurativamente per mantenere inalterato lo spazio di spesa storica consolidata dell'ente, evitando riduzioni del tetto dovute a mere operazioni contabili.
*   **Quote EQ trasferite dal Fondo**: La decurtazione dal fondo non dirigente per incrementare le EQ deve essere monitorata figurativamente per garantire l'invarianza complessiva della spesa ex Art. 23 c. 2 dell'ente.

### D. Solo Controllo / Istruttorie
Parametri operativi non contabili:
*   Personale in servizio equivalente (FTE) al 31.12.2018 e nell'anno di riferimento.
*   Rapporto percentuale salario accessorio / stipendi tabellari 2023.
*   Dettagli istruttori di programmazione assunzioni e cessazioni.

---

## 6. Configurazione dei Campi: Mantenimento, Deprecazione e Rimozione

### 6.1 Elenco Campi da Mantenere
Campi strutturali che devono essere preservati per garantire la stabilità e la storicizzazione del calcolo:
*   Tutti i campi storici della base 2016 e 2017.
*   I campi legati a esclusioni storiche stabili (€83,20, €84,50, differenziali stipendiali contratti precedenti).
*   Tutti i campi di decurtazione stabile per dissesto o ATA.
*   Tutti i campi di recupero evasione e incentivi tecnici/tributari.
*   I campi relativi alle nuove voci contrattuali 2026 (0,14% stabile, 0,22% variabile, arretrati 24-25 e riduzione comparto Art. 60).

### 6.2 Elenco Campi da Deprecare
Campi obsoleti o superati che non devono più essere proposti per nuovi inserimenti contabili:
*   `st_incrementoDecretoPA`: Sostituito integralmente dal campo canonico `st_incrementoDL25_2025`.
*   `vn_art79c3_022MonteSalari2018_da2022Proporzionale`: Superato dal nuovo incremento dello 0,22% sul Monte Salari 2021.
*   `ris_incremento022MonteSalari2018` (area EQ): Superato dalla nuova quota 0,22% MS 2021.

### 6.3 Elenco Campi da Eliminare solo dopo il Collaudo finale
Campi temporanei o duplicati che verranno rimossi dal codice solo a seguito della stabilizzazione del nuovo wizard:
*   `vn_art79c1b_euro8450_unaTantum2021_2022` e `vn_art79c3_022MonteSalari2018_da2022UnaTantum2022` (voci una tantum storiche non più utilizzabili).
*   Gli stati intermedi e le card di input manuale del PNRR all'interno di `AnnualDataForm.tsx` (ora centralizzati nello Step 7 del wizard).
*   I selettori di simulazione del limite Art. 23 presenti in `Art23EmployeeAndIncrementForm.tsx` (ora calcolati in automatico nello Step 2).

---

## 7. Punti Normativi da Verificare prima del Trasferimento Reale

Prima di abilitare il trasferimento effettivo dei dati dal wizard draft alla costituzione del fondo, la procedura informatica o l'utente devono attestare il rispetto dei seguenti requisiti normativi:

1.  **Certificazione dell'Organo di Revisione**: I dati di spesa tabellare 2023 (per il D.L. 25) e il Monte Salari 2021 (per il CCNL 2026) inseriti nel wizard devono coincidere con quelli asseverati dall'organo di revisione contabile e trasmessi al Conto Annuale.
2.  **Rispetto degli Equilibri di Bilancio**: L'ente non deve trovarsi in stato di dissesto finanziario non autorizzato o in violazione dei parametri di deficitarietà strutturale ex art. 242-243 del TUEL, a meno di specifica autorizzazione COSFEL in ordine alla spesa di personale.
3.  **Delibera di Giunta per lo 0,22% e D.L. 25/2025**: Gli incrementi facoltativi dello 0,22% e l'attivazione dell'incremento di armonizzazione del 48% devono essere supportati da apposita delibera di indirizzo della Giunta comunale e coperti finanziariamente nel bilancio di previsione.
4.  **Accordo di Contrattazione Decentrata**: La ripartizione dello 0,22% (tra Fondo e risorse EQ) e l'attribuzione delle economie dello straordinario devono essere deliberate in sede di tavolo negoziale con la firma del CCDI.
5.  **Invarianza del Tetto nei Processi di Mobilità**: In caso di risorse trasferite o cedute per mobilità di personale, verificare la corrispondenza con gli atti dell'altro ente per evitare doppie registrazioni o sforamenti del limite complessivo dell'Art. 23 c. 2.

---

## 8. Proposta per la Fase Successiva: Struttura del Mapping Tecnico

Per implementare il riversamento reale senza compromettere la stabilità dell'applicazione, si propone di procedere come segue:

### A. Implementazione di un Workflow dedicato in `src/application/`
Creare il file `src/application/wizardTransferWorkflow.ts` per gestire la transazione atomica dei dati. La funzione principale dovrà:
1. Ricevere lo stato corrente `Wizard2026DraftState`.
2. Validare l'assenza di errori bloccanti (`blockingErrors.length === 0`).
3. Creare una copia profonda dell'oggetto `FundData` attivo dell'ente.
4. Mappare in modo rigoroso le variabili contabili dal draft state ai campi legacy e nuovi di `FundData` (secondo lo schema del paragrafo 3).
5. Inviare l'azione `UPDATE_FUND_DATA` al reducer globale per reidratare lo stato dell'applicazione.
6. Persistere lo stato modificato sul database Supabase tramite `stateWorkflow.ts`.

### B. Protezione e Disaccoppiamento in UI
*   Mantenere il pulsante "Conferma e Applica a Costituzione Fondo" nello Step 8 del wizard visibile solo se l'utente ha ruolo di compilazione autorizzato.
*   Visualizzare un riepilogo dettagliato (vista Delta prima/dopo) delle modifiche che verranno apportate ai campi della Costituzione Fondo.
*   Inserire un modal di conferma con checkbox esplicita in cui l'utente dichiara sotto la propria responsabilità che i dati istruttori (stipendi, personale, delibere) sono conformi alle delibere dell'ente.
*   Prevedere una funzione di rollback per permettere all'utente di annullare l'importazione del wizard e ripristinare lo stato precedente della Costituzione Fondo salvato in uno snapshot temporaneo di backup locale.
