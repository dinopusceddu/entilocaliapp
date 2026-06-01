# MOD-030 — Matrice di allineamento Excel → App

> **Documento tecnico di sola analisi — Nessuna modifica al codice.**
> Redatto il 27 maggio 2026 sulla base dell'analisi del file `Analisi_Nuovi_Fondi_Salario_Accessorio_Funzioni_Locali_2026.md` e dei quattro audit `docs/audit-logiche-calcolo/*.md`.

---

## Premessa metodologica

Questo documento confronta **voce per voce** le formule del foglio Excel "Nuovi Fondi Salario Accessorio Funzioni Locali 2026" con la logica attualmente implementata nell'App (interfaccia React) e nel Motore di calcolo backend (`fundEngine.ts` / `fundCalculations.ts`).

Per ogni voce viene indicato:

| Campo | Significato |
|---|---|
| **Riga Excel** | Numero di riga nel foglio Excel |
| **Variabile Excel** | Nome della variabile nel foglio |
| **Formula Excel** | La formula o valore presente nel foglio |
| **Chiave App** | La chiave tecnica corrispondente nell'applicazione |
| **Presente in UI** | Se la voce appare nell'interfaccia utente |
| **Presente in Motore** | Se la voce è sommata nel motore di calcolo backend |
| **Effetto Art. 23 (Excel)** | Come la voce incide nel foglio `limiti` dell'Excel |
| **Effetto Art. 23 (App)** | Come la voce incide nel motore di compliance dell'App |
| **Stato** | ✅ Allineato / ⚠️ Parzialmente allineato / ❌ Disallineato / 🔍 Da verificare |
| **Note/Criticità** | Dettaglio della discrepanza o conformità |

---

## 1. Foglio `comparto` — Risorse Stabili

| Riga | Variabile Excel | Formula Excel | Chiave App | UI | Motore | Art.23 Excel | Art.23 App | Stato | Note |
|---:|---|---|---|:---:|:---:|---|---|:---:|---|
| 4 | `comparto_unico_importo_consolidato_2017` | `0` (input) | `st_art79c1_art67c1_unicoImporto2017` | ✅ | ✅ | Soggetto (incluso nel tetto B35) | Soggetto (`isRelevantToArt23Limit: true`) | ✅ | Perfetto allineamento. |
| 5 | `comparto_alte_professionalita_020_ms2001` | `0` (input) | `st_art79c1_art67c1_alteProfessionalitaNonUtil` | ✅ | ✅ | Soggetto | Soggetto | ✅ | Allineato. |
| 6 | `comparto_quota_83_20_personale_2015` | `0` (input) | `st_art79c1_art67c2a_incr8320` | ✅ | ✅ | **Escluso** (sottratto in B35) | **Escluso** (`isRelevantToArt23Limit: false`) | ✅ | Allineato. Excel: `B35 = B23 - B6 - ...`. App: la voce ha flag escluso. |
| 7 | `comparto_differenziali_art67` | `0` (input) | `st_art79c1_art67c2b_incrStipendialiDiff` | ✅ | ✅ | **Escluso** (sottratto in B35) | **Escluso** | ✅ | Allineato. |
| 8 | `comparto_ria_assegni_cessati` | `0` (input) | `st_art79c1_art4c2_art67c2c_integrazioneRIA` | ✅ | ✅ | Soggetto (incluso in B35) | Soggetto | ✅ | Allineato. |
| 9 | `comparto_risorse_riassorbite_tupi` | `0` (input) | `st_art79c1_art67c2d_risorseRiassorbite165` | ✅ | ✅ | Soggetto | Soggetto | ✅ | Allineato. |
| 10 | `comparto_personale_trasferito` | `0` (input) | `st_art79c1_art15c1l_art67c2e_personaleTrasferito` | ✅ | ✅ | Soggetto | Soggetto | ✅ | Allineato. |
| 11 | `comparto_regioni_riduzione_dirigenza` | `0` (input) | `st_art79c1_art15c1i_art67c2f_regioniRiduzioneDirig` | ✅ | ✅ | Soggetto | Soggetto | ✅ | Allineato. |
| 12 | `comparto_riduzione_straordinario` | `0` (input) | `st_art79c1_art14c3_art67c2g_riduzioneStraordinario` | ✅ | ✅ | Soggetto | Soggetto | ✅ | Allineato. |
| 13 | `comparto_taglio_art9_dl78_2010` | `0` (input, sottratto) | `st_taglioFondoDL78_2010` | ✅ | ✅ | Soggetto (sottrazione in B23 e B35) | Soggetto (decurtazione stabile) | ✅ | Allineato. Excel: `B23 = ... - B13`. App: `isSubtractor: true`. |
| 14 | `comparto_riduzioni_ata_po_esternalizzazioni` | `0` (input, sottratto) | `st_riduzioniPersonaleATA_PO_Esternalizzazioni` | ✅ | ✅ | Soggetto (sottratto in B23 e B35) | Soggetto (decurtazione stabile) | ✅ | Allineato. |
| 15 | `comparto_decurtazione_po_alte_professionalita` | `0` (input, sottratto) | `st_art67c1_decurtazionePO_AP_EntiDirigenza` | ✅ | ✅ | Soggetto (sottratto in B23) | Soggetto (decurtazione stabile) | ✅ | Allineato. |
| 16 | `comparto_incremento_84_50_ccnl_2022` | `0` (input) | `st_art79c1b_euro8450` | ✅ | ✅ | **Escluso** (sottratto in B35, aggiunto in B23) | **Escluso** | ✅ | Allineato. Excel: aggiunge nel totale stabili ma sottrae dal parziale confronto tetto. |
| 17 | `comparto_incremento_consistenza_personale` | `0` (input) | `st_art79c1c_incrementoStabileConsistenzaPers` | ✅ | ✅ | ⚠️ Non esplicitamente escluso in B35 | **Soggetto** (MOD-028) | ⚠️ | Excel non sottrae B17 da B35, quindi la tratta come soggetta. L'App la qualifica come soggetta dal MOD-028. Coerente nell'effetto, ma la motivazione meriterebbe conferma normativa. |
| 18 | `comparto_differenziali_ccnl_2022` | `0` (input) | `st_art79c1d_differenzialiStipendiali2022` | ✅ | ✅ | **Escluso** (sottratto in B35) | **Escluso** | ✅ | Allineato. |
| 19 | `comparto_differenze_b3_d3` | `0` (input) | `st_art79c1bis_diffStipendialiB3D3` | ✅ | ✅ | **Escluso** (sottratto in B35) | **Escluso** | ✅ | Allineato. |
| 20 | `comparto_incremento_014_ms2021` | `0` (input) | `st_art58c1_CCNL2026_incremento014_MS2021` | ✅ | ✅ | **Escluso** (sottratto in B35) | **Escluso** | ✅ | Allineato. Excel: B35 sottrae B20. App: flag escluso e isAlreadyInCcnlTotal. |
| 21 | `comparto_incremento_dl25_2025` | `0` (input) | `st_incrementoDL25_2025` | ✅ | ✅ | ⚠️ Non esplicitamente escluso/incluso in B35 | **Escluso** | 🔍 | **CRITICITÀ**: L'Excel non sottrae B21 da B35, il che potrebbe significare che è soggetto. L'App lo classifica come escluso (`isRelevantToArt23Limit: false`). **Dubbio normativo da chiarire**: la deroga del D.L. 25/2025 lo esclude dal limite Art. 23, ma l'Excel potrebbe trattarlo diversamente. |
| 22 | `comparto_riduzione_indennita_comparto` | `0` (input, sottratto) | `st_art60c2_CCNL2026_decurtazioneIndennitaComparto` | ✅ | ✅ | **Escluso** (sottratto in B35 come depurazione) | **Soggetto** (reale e figurativo neutralizzato) | ⚠️ | Excel: B35 sottrae B22 depurandola dal confronto tetto → effetto = la riduzione non incide sul tetto. App: la sottrae realmente e poi la reintegra figurativamente → stessa neutralità. **Stesso effetto finale, logica diversa.** |
| 23 | `comparto_somma_risorse_stabili` | `=SUM(B4:B12)-B13-B14-B15+B16+B17+B18+B19+B20+B21-B22` | *Calcolato dal motore* | ✅ | ✅ | — | — | ✅ | Formula di totale delle stabili. L'App compone il totale analogamente (sezione `stabili`). L'ordine algebrico è equivalente. |

---

## 2. Foglio `comparto` — Risorse Variabili Soggette al Limite

| Riga | Variabile Excel | Formula Excel | Chiave App | UI | Motore | Art.23 Excel | Art.23 App | Stato | Note |
|---:|---|---|---|:---:|:---:|---|---|:---:|---|
| 26 | `comparto_recupero_evasione_ici_disposizioni_legge` | `0` (input) | `vs_art4c3_art15c1k_art67c3c_recuperoEvasione` | ✅ | ✅ | Soggetto | Soggetto | ✅ | Allineato. |
| 27 | `comparto_frazioni_ria_cessati_anno_corrente` | `0` (input) | `vs_art4c2_art67c3d_integrazioneRIAMensile` | ✅ | ✅ | Soggetto | Soggetto | ✅ | Allineato. |
| 28 | `comparto_case_gioco` | `0` (input) | `vs_art67c3g_personaleCaseGioco` | ✅ | ✅ | Soggetto | Soggetto | ✅ | Allineato. |
| 29 | `comparto_integrazione_1_2_ms1997` | `0` (input) | `vs_art79c2b_max1_2MonteSalari1997` | ✅ | ✅ | Soggetto | Soggetto | ✅ | Allineato. |
| 30 | `comparto_personale_trasferito_variabile` | `0` (input) | `vs_art67c3k_integrazioneArt62c2e_personaleTrasferito` | ✅ | ✅ | Soggetto | Soggetto | ✅ | Allineato. |
| 31 | `comparto_scelte_organizzative_art79_2c` | `0` (input) | `vs_art79c2c_risorseScelteOrganizzative` | ✅ | ✅ | Soggetto | Soggetto | ✅ | Allineato. |
| 32 | `comparto_somma_variabili_soggette_limite` | `=SUM(B26:B31)` | *Calcolato dal motore* | ✅ | ✅ | — | — | ✅ | Totale sezione C. Allineato. |

---

## 3. Foglio `comparto` — Controllo Limite del Comparto

| Riga | Variabile Excel | Formula Excel | Chiave App | UI | Motore | Stato | Note |
|---:|---|---|---|:---:|:---:|:---:|---|
| 35 | `comparto_parziale_confronto_tetto_2016` | `=B23-B6-B7-B16-B19+B32-B18-B20-B22` | *Calcolato come `fad_soggette_lordo`* | ✅ | ✅ | ⚠️ | **Excel** depura dal totale stabili le voci escluse e aggiunge le variabili soggette. **App** ricostruisce `sommaStabiliSoggetteLimite` iterando `strutturaFondo.json` e poi aggiunge `sommaVariabiliSoggette` e lo straordinario. **L'Excel NON include lo straordinario in B35** (è separato nel foglio `limiti`), mentre l'App lo somma in `fad_soggette_lordo` se non c'è override manuale. → **Discrepanza strutturale**: L'Excel gestisce lo straordinario al livello `limiti`, l'App lo integra nel `fad_soggette_lordo`. L'effetto finale è identico se entrambi poi sono sommati nel tetto complessivo. |
| 36 | `comparto_decurtazione_incremento_art23` | `0` (input) | `cl_art23c2_decurtazioneIncrementoAnnualeTetto2016` | ✅ | ✅ | ✅ | Campo di regolazione manuale per adeguare la spesa al tetto. Presente in entrambi. |

---

## 4. Foglio `comparto` — Risorse Variabili Non Soggette al Limite

| Riga | Variabile Excel | Formula Excel | Chiave App | UI | Motore | Art.23 Excel | Art.23 App | Stato | Note |
|---:|---|---|---|:---:|:---:|---|---|:---:|---|
| 39 | `comparto_sponsorizzazioni_convenzioni` | `0` | `vn_art15c1d_art67c3a_sponsorConvenzioni` | ✅ | ✅ | Escluso | Escluso | ✅ | Allineato. |
| 40 | `comparto_messi_notificatori` | `0` | `vn_art54_art67c3f_rimborsoSpeseNotifica` | ✅ | ✅ | Escluso | Escluso | ✅ | Allineato. |
| 41 | `comparto_piani_razionalizzazione` | `0` | `vn_art15c1k_art16_dl98_art67c3b_pianiRazionalizzazione` | ✅ | ✅ | Escluso | Escluso | ✅ | Allineato. |
| 42 | `comparto_incentivi_funzioni_tecniche` | `0` | `vn_art15c1k_art67c3c_incentiviTecniciCondoni` | ✅ | ✅ | Escluso | Escluso | ✅ | Allineato. |
| 43 | `comparto_spese_giudizio_istat` | `0` | `vn_art18h_art67c3c_incentiviSpeseGiudizioCensimenti` | ✅ | ✅ | Escluso | Escluso | ✅ | Allineato. |
| 44 | `comparto_risparmi_straordinario` | `0` | `vn_art15c1m_art67c3e_risparmiStraordinario` | ✅ | ✅ | Escluso | Escluso | ✅ | Allineato. |
| 45 | `comparto_incremento_regioni_citta_metropolitane` | `0` | `vn_art67c3j_regioniCittaMetro_art23c4_incrPercentuale` | ✅ | ✅ | Escluso | Escluso | ✅ | Allineato. |
| 46 | `comparto_somme_non_utilizzate_precedenti` | `0` | `vn_art80c1_sommeNonUtilizzateStabiliPrec` | ✅ | ✅ | Escluso | Escluso | ✅ | Allineato. |
| 47 | `comparto_incentivi_imu_tari` | `0` | `vn_l145_art1c1091_incentiviRiscossioneIMUTARI` | ✅ | ✅ | Escluso | Escluso | ✅ | Allineato. |
| 48 | `comparto_risparmi_buoni_pasto_2020` | `0` | `vn_l178_art1c870_risparmiBuoniPasto2020` | ✅ | ✅ | Escluso | Escluso | ✅ | Allineato. |
| 49 | `comparto_assunzioni_deroga_dl135` | `0` | `vn_dl135_art11c1b_risorseAccessorieAssunzioniDeroga` | ✅ | ✅ | Escluso | Escluso | ✅ | Allineato. |
| 50 | `comparto_quota_022_ms2018` | `=limiti!B44` | *Calcolato dal wizard (quota 0,22% MS 2018)* | ✅ | ✅ | Escluso | Escluso | ⚠️ | L'Excel calcola la quota nel foglio `limiti` con riparto proporzionale `fondoComparto2021/(fondoComparto2021+fondoEQ2021)`. L'App la calcola nel wizard tramite `calculateCcnl2024Increases` con riparto analogo ma basato su spesa relativa 2025 (potenzialmente diversa). **Criterio di riparto potenzialmente differente.** |
| 51 | `comparto_incremento_pnrr_5_percento` | `0` | `vn_dl13_art8c3_incrementoPNRR_max5stabile2016` | ✅ | ✅ | Escluso | Escluso | ✅ | Allineato. |
| 52 | `comparto_una_tantum_014_2024_2025` | `0` | `vn_art58_CCNL2026_arretrati2024_2025` | ✅ | ✅ | Escluso | Escluso | ✅ | Allineato. |
| 53 | `comparto_quota_022_ms2021` | `=limiti!B52` | *Calcolato dal wizard (quota 0,22% MS 2021)* | ✅ | ✅ | Escluso | Escluso | ⚠️ | Stesso tema del punto 50: criterio di riparto potenzialmente diverso (fondi 2024 nell'App vs fondi 2021 nell'Excel). |
| 54 | `comparto_una_tantum_022_2024_2025` | `0` | ❌ **Non presente** | ❌ | ❌ | Escluso | — | ❌ | **VOCE MANCANTE NELL'APP**: L'Excel prevede un recupero una tantum delle annualità 2024 e 2025 dello 0,22%. L'App non ha una chiave dedicata per questa voce. Da valutare se è coperta dagli arretrati generici (`vn_art58_CCNL2026_arretrati2024_2025`) o se serve una voce apposita. |
| 55 | `comparto_somma_variabili_non_soggette_limite` | `=SUM(B39:B54)` | *Calcolato dal motore* | ✅ | ✅ | — | — | ✅ | Totale sezione D. |

---

## 5. Foglio `comparto` — Totali, Utilizzi e Verifiche

| Riga | Variabile Excel | Formula Excel | Chiave App | Stato | Note |
|---:|---|---|---|:---:|---|
| 57 | `comparto_incremento_art33_dl34_2019` | `0` | *Non presente come voce separata nel FAD* | ❌ | **VOCE MANCANTE**: L'Excel ha un incremento specifico in deroga Art. 33 D.L. 34/2019 per il comparto, inserito direttamente nel totale disponibile. L'App non ha una voce corrispondente nella pagina Fondo Dipendente; l'incremento Art. 33 è gestito solo a livello di adeguamento del limite (Art. 23 c. 2 adjustment). |
| 58 | `comparto_recupero_art4_dl16_2014` | `0` | `fin_art4_dl16_misureMancatoRispettoVincoli` | ✅ | Allineato. Decurtazione per sanzioni. |
| 59 | `comparto_totale_risorse_disponibili` | `=B23+B32+B55+B36+B57-B58` | *Calcolato come totaleFondo dipendente* | ⚠️ | L'Excel include esplicitamente `B57` (Art. 33) e `B36` (rettifica Art. 23) nel totale. L'App ha struttura analoga ma senza l'Art. 33 come voce separata del comparto. |
| 103 | `comparto_fondo_straordinario` | `0` | `annualData.fondoLavoroStraordinario` | ✅ | Lo straordinario è un dato separato sia nell'Excel che nell'App. Nell'Excel è esposto in riga 103 ma non transita nel fondo. Nell'App è separato e alimenta il foglio `limiti`. |

---

## 6. Foglio `eq` — Elevate Qualificazioni

| Riga | Variabile Excel | Formula Excel | Chiave App | UI | Motore | Art.23 Excel | Art.23 App | Stato | Note |
|---:|---|---|---|:---:|:---:|---|---|:---:|---|
| 4 | `eq_retribuzione_posizione_5000_22000` | `0` | `ris_fondoPO2017` | ✅ | ✅ | Soggetto (in `limiti!B12`) | Soggetto (`eq_soggette`) | ⚠️ | L'Excel ha due righe distinte per fasce (5.000-22.000 e 3.000-9.500), l'App ha un unico campo. L'effetto contabile è lo stesso se l'utente inserisce il totale, ma la granularità è diversa. |
| 5 | `eq_retribuzione_posizione_3000_9500` | `0` | *Aggregato in `ris_fondoPO2017`* | ⚠️ | ⚠️ | Soggetto | Soggetto | ⚠️ | Vedi sopra: la fascia ridotta non ha una chiave dedicata nell'App. |
| 6 | `eq_maggiorazione_sedi_lavoro` | `0` | `va_art18c5_CCNL2026_maggiorazioneSediLavoro` | ✅ | ❌ | **Soggetto** (incluso in B7 stabile) | **Escluso** | ❌ | **DISCREPANZA CRITICA**: L'Excel tratta la maggiorazione sedi lavoro come risorsa stabile soggetta al limite (inclusa in B7 e non sottratta da `limiti!B12`). L'App la classifica come variabile esclusa. Inoltre, **non è sommata nel motore** `calculateEqSubFund`. Tre errori sovrapposti: classificazione, inclusione nel limite, e presenza nel motore. |
| 7 | `eq_somma_risorse_stabili` | `=SUM(B4:B6)` | *Calcolato dal motore* | ✅ | ⚠️ | — | — | ⚠️ | Il motore non include la maggiorazione sedi. |
| 10 | `eq_retribuzione_risultato_min_15` | `0` | *Non presente come voce di finanziamento* | ❌ | ❌ | Escluso (non in `limiti!B12`) | — | ❌ | **VOCE MANCANTE**: Nell'Excel la retribuzione di risultato è una voce di finanziamento variabile. Nell'App è solo una voce di utilizzo (`va_art16c3_retribuzioneRisultato`). La logica finanziaria è diversa: l'Excel distingue il budget, l'App lo tratta come ripartizione interna. |
| 11 | `eq_interim_15_25` | `0` | `va_art16c5_CCNL2026_maggiorazioneInterim` | ✅ | ❌ | Escluso (non in `limiti!B12`) | Escluso | ❌ | **VOCE NON SOMMATA NEL MOTORE**: Presente nella UI ma non addizionata in `calculateEqSubFund`. Il totale backend è inferiore a quanto visualizzato. |
| 12 | `eq_quota_022_ms2018` | `=limiti!B45` | `ris_incremento022MonteSalari2018` | ✅ | ✅ | **Escluso** (sottratto in `limiti!B12`) | **Escluso** | ✅ | Allineato. |
| 13 | `eq_indennita_ad_personam_art110` | `0` | ❌ **Non presente** | ❌ | ❌ | Escluso | — | ❌ | **VOCE MANCANTE**: L'Excel prevede un'indennità ad personam ex Art. 110 TUEL. L'App non ha una chiave corrispondente per le EQ. |
| 14 | `eq_quota_022_ms2021` | `=limiti!B53` | `va_incremento022_ms2021_eq` | ✅ | ✅ | **Escluso** (sottratto in `limiti!B12`) | **Escluso** | ✅ | Allineato. |
| 15 | `eq_una_tantum_022_2024_2025` | `0` | ❌ **Non presente** | ❌ | ❌ | Escluso | — | ❌ | **VOCE MANCANTE**: Recupero una tantum delle annualità 2024 e 2025 dello 0,22% per le EQ. Non presente nell'App. |
| 18 | `eq_rettifica_art23` | `0` | `fin_art23c2_adeguamentoTetto2016` | ✅ | ✅ | Soggetto | Soggetto | ✅ | Allineato. |
| 19 | `eq_incremento_art33_dl34_2019` | `0` | ❌ **Non presente** | ❌ | ❌ | **Escluso** (sottratto in `limiti!B12`) | — | ❌ | **VOCE MANCANTE**: Incremento in deroga Art. 33 per le EQ. L'App non ha una voce corrispondente. |
| 20 | `eq_armonizzazione_dl25_2025` | `0` | `va_dl25_2025_armonizzazione` | ✅ | ⚠️ | **Soggetto** (incluso in `limiti!B12`) | **Variabile** / **Soggetto in UI** ma **Escluso nel motore** | ❌ | **DISCREPANZA**: L'Excel include l'armonizzazione D.L. 25/2025 nel computo del tetto (`limiti!B12` non la sottrae). La UI la tratta come soggetta, ma il motore (`fundEngine.ts` riga 253-257) non la include in `eq_soggette`. |
| 21 | `eq_totale_risorse_disponibili` | `=B7+B16+B18+B19+B20` | *Calcolato dal motore* | ✅ | ⚠️ | — | — | ⚠️ | Il motore non somma B11, B13, B15 e B20 (voci mancanti). |

---

## 7. Foglio `segretario` — Risorse Stabili

| Riga | Variabile Excel | Formula Excel | Chiave App | UI | Motore | Art.23 Excel | Art.23 App | Stato | Note |
|---:|---|---|---|:---:|:---:|---|---|:---:|---|
| 4 | `segretario_posizione_conglobata_2011` | `0` | `st_art3c6_CCNL2011_retribuzionePosizione` | ✅ | ✅ | Soggetto (in B30) | Soggetto | ✅ | Allineato. |
| 5 | `segretario_differenziale_ccnl_2024` | `0` | `st_art58c1_CCNL2024_differenzialeAumento` | ✅ | ✅ | **Escluso** (non in B30) | **Escluso** | ✅ | Allineato. |
| 6 | `segretario_incremento_posizione_ccnl_2026` | `0` | `st_art36_CCNL2022_2024_incrementoRetribuzionePosizione` | ✅ | ✅ | **Escluso** (non in B30) | **Escluso** | ⚠️ | La corrispondenza semantica è imperfetta: l'Excel ha un campo specifico CCNL 2026, l'App ha un campo CCNL 2022-2024. Da verificare se l'utente inserisce lo stesso valore. |
| 7 | `segretario_posizione_classi_demografiche` | `0` | `st_art60c1_CCNL2024_retribuzionePosizioneClassi` | ✅ | ✅ | Soggetto (in B30) | Soggetto | ✅ | Allineato. |
| 8 | `segretario_maggiorazione_15_capoluoghi` | `0` | `st_art60c3_CCNL2024_maggiorazioneComplessita` | ✅ | ✅ | Soggetto (in B30) | Soggetto | ✅ | Allineato. |
| 9 | `segretario_maggiorazione_20_metropolitani` | `0` | *Potenzialmente `st_art60c3_CCNL2024_maggiorazioneComplessita`* | ⚠️ | ⚠️ | Soggetto (in B30) | — | ⚠️ | L'Excel ha due voci distinte per maggiorazione 15% e 20%, l'App potrebbe aggregarle in un unico campo. Da verificare. |
| 10 | `segretario_unione_comuni_fascia_superiore` | `0` | ❌ **Non presente** | ❌ | ❌ | Soggetto (in B30) | — | ❌ | **VOCE MANCANTE**: Fascia superiore per segretario di Unione di Comuni. Non presente nell'App. |
| 11 | `segretario_galleggiamento_eq_dirigenza` | `0` | `st_art60c5_CCNL2024_allineamentoDirigEQ` | ✅ | ✅ | Soggetto (in B30) | Soggetto | ✅ | Allineato. |
| 12 | `segretario_sedi_convenzionate` | `0` | `st_art56c1g_CCNL2024_retribuzioneAggiuntivaConvenzioni` | ✅ | ✅ | **Escluso** (non in B30) | **Escluso** | ✅ | Allineato. |
| 13 | `segretario_reggenza_supplenza` | `0` | `st_art56c1h_CCNL2024_indennitaReggenzaSupplenza` | ✅ | ✅ | **Escluso** (non in B30) | **Escluso** | ✅ | Allineato. |

---

## 8. Foglio `segretario` — Risorse Variabili e Totali

| Riga | Variabile Excel | Formula Excel | Chiave App | UI | Motore | Art.23 Excel | Art.23 App | Stato | Note |
|---:|---|---|---|:---:|:---:|---|---|:---:|---|
| 17 | `segretario_diritti_segreteria` | `0` | `va_art56c1f_CCNL2024_dirittiSegreteria` | ✅ | ✅ | Escluso (non in B30) | Escluso | ✅ | Allineato. |
| 18 | `segretario_altri_compensi_legge` | `0` | `va_art56c1i_CCNL2024_altriCompensiLegge` | ✅ | ✅ | Escluso | Escluso | ✅ | Allineato. |
| 19 | `segretario_incremento_pnrr_5_percento` | `0` | `va_art8c3_DL13_2023_incrementoPNRR` | ✅ | ✅ | Escluso | Escluso | ✅ | Allineato. |
| 20 | `segretario_risultato_max_10` | `0` | `va_art61c2_CCNL2024_retribuzioneRisultato10` | ✅ | ✅ | **Soggetto** (in B30) | **Soggetto** | ✅ | Allineato. |
| 21 | `segretario_risultato_max_15` | `0` | `va_art61c2bis_CCNL2024_retribuzioneRisultato15` | ✅ | ✅ | **Soggetto** (in B30) | **Soggetto** | ✅ | Allineato. |
| 22 | `segretario_risultato_max_20` | `0` | ❌ **Non presente** | ❌ | ❌ | Soggetto (in B30) | — | ❌ | **VOCE MANCANTE**: L'Excel ha una soglia di risultato al 20%. L'App ha solo il 10% e il 15%. |
| 23 | `segretario_superamento_metropolitani` | `0` | `va_art61c2ter_CCNL2024_superamentoLimiteMetropolitane` | ✅ | ✅ | Soggetto (in B30) | Soggetto | ✅ | Allineato. |
| 24 | `segretario_incremento_080_ms2021` | `0` | `va_art40c1_CCNL2026_incremento080MS2021` | ✅ | ❌ | Escluso | Escluso | ❌ | **NON SOMMATA NEL MOTORE**: La voce è presente nella UI ma `calculateSegretarioSubFund` non la include nel calcolo. |
| 25 | `segretario_incremento_022_ms2021` | `0` | `va_art40c2_CCNL2026_incremento022MS2021_L207` | ✅ | ❌ | Escluso | Escluso | ❌ | **NON SOMMATA NEL MOTORE**: Presente nella UI ma non nel calcolo backend. |
| 26 | `segretario_incentivi_funzioni_tecniche` | `0` | `va_art21c1m_CCNL2026_incentiviFunzioniTecniche` | ✅ | ❌ | Escluso | Escluso | ❌ | **NON SOMMATA NEL MOTORE**: Presente nella UI ma non nel calcolo backend. |
| 29 | `segretario_percentuale_copertura_ente` | `1` | `fin_percentualeCoperturaPostoSegretario` | ✅ | ✅ | — | — | ✅ | Allineato: coefficiente di riproporzionamento. |
| 30 | `segretario_risorse_rilevanti_limite` | `=(B4+B7+B8+B9+B10+B11+B20+B21+B22+B23)*B29` | `fin_totaleRisorseRilevantiLimite` | ✅ | ⚠️ | Soggetto (in `limiti!B13`) | ⚠️ **Escluso** dal calcolo compliance centralizzato | ❌ | **DISCREPANZA CRITICA**: L'Excel include il segretario nel tetto complessivo dell'ente (`limiti!B13`). L'App lo calcola nella pagina ma **non lo include** in `risorseRilevantiArt23` nel motore centralizzato. Inoltre, l'Excel include B9 (magg. 20%), B10 (unione comuni) e B22 (risultato 20%) che non esistono nell'App. |
| 32 | `segretario_totale_risorse_disponibili` | `=(B14+B27)*B29` | *Calcolato dal motore* | ✅ | ⚠️ | — | — | ⚠️ | Il motore non include 4 voci variabili. |

---

## 9. Foglio `dirigenza` — Risorse Stabili

| Riga | Variabile Excel | Formula Excel | Chiave App | UI | Motore | Art.23 Excel | Art.23 App | Stato | Note |
|---:|---|---|---|:---:|:---:|---|---|:---:|---|
| 4 | `dirigenza_unico_importo_2020` | `0` | `st_art57c2a_CCNL2020_unicoImporto2020` | ✅ | ✅ | Soggetto | Soggetto | ✅ | Allineato. |
| 5 | `dirigenza_ria_cessati_fino_2020` | `0` | `st_art57c2a_CCNL2020_riaPersonaleCessato2020` | ✅ | ✅ | Soggetto | Soggetto | ✅ | Allineato. |
| 6 | `dirigenza_incremento_153_ms2015` | `0` | `st_art56c1_CCNL2020_incremento1_53MonteSalari2015` | ✅ | ✅ | **Escluso** (sottratto in B32) | **Escluso** | ✅ | Allineato. |
| 7 | `dirigenza_ria_cessati_post_2020` | `0` | `st_art57c2c_CCNL2020_riaCessatidallAnnoSuccessivo` | ✅ | ✅ | Soggetto | Soggetto | ✅ | Allineato. |
| 8 | `dirigenza_risorse_scelte_organizzative` | `0` | `st_art57c2e_CCNL2020_risorseAutonomeStabili` | ✅ | ✅ | Soggetto | Soggetto | ✅ | Allineato. |
| 9 | `dirigenza_incremento_201_ms2018` | `0` | `st_art39c1_CCNL2024_incremento2_01MonteSalari2018` | ✅ | ✅ | **Escluso** (sottratto in B32) | **Escluso** | ✅ | Allineato. |
| 10 | `dirigenza_incremento_305_ms2021` | `0` | `st_art24c1_CCNL2022_2024_incremento3_05MonteSalari2021` | ✅ | ✅ | **Escluso** (sottratto in B32) | **Escluso** | ✅ | Allineato. |

---

## 10. Foglio `dirigenza` — Risorse Variabili, Limite e Utilizzo

| Riga | Variabile Excel | Formula Excel | Chiave App | UI | Motore | Art.23 Excel | Art.23 App | Stato | Note |
|---:|---|---|---|:---:|:---:|---|---|:---:|---|
| 14 | `dirigenza_disposizioni_legge_sponsorizzazioni` | `0` | `va_art57c2b_CCNL2020_risorseLeggeSponsor` | ✅ | ✅ | **Escluso** (sottratto in B32) | **Escluso** | ✅ | Allineato. |
| 15 | `dirigenza_onnicomprensivita` | `0` | `va_art57c2d_CCNL2020_sommeOnnicomprensivita` | ✅ | ✅ | Soggetto (non sottratto in B32) | Soggetto | ✅ | Allineato. |
| 16 | `dirigenza_scelte_organizzative_variabili` | `0` | `va_art57c2e_CCNL2020_risorseAutonomeVariabili` | ✅ | ✅ | Soggetto | Soggetto | ✅ | Allineato. |
| 17 | `dirigenza_residui_una_tantum` | `0` | `va_art57c3_CCNL2020_residuiAnnoPrecedente` | ✅ | ✅ | **Escluso** (sottratto in B32) | **Escluso** | ✅ | Allineato. |
| 18 | `dirigenza_incremento_pnrr_5_percento` | `0` | `va_dl13_2023_art8c3_incrementoPNRR` | ✅ | ✅ | **Escluso** (sottratto in B32) | **Escluso** | ✅ | Allineato. |
| 19 | `dirigenza_recupero_046_ms2018` | `0` | `va_art39c1_CCNL2024_recupero0_46MonteSalari2018_2020` | ✅ | ✅ | **Escluso** (sottratto in B32) | **Escluso** | ✅ | Allineato. |
| 20 | `dirigenza_recupero_201_2021_2023` | `0` | `va_art39c1_CCNL2024_recupero2_01MonteSalari2018_2021_2023` | ✅ | ✅ | **Escluso** (sottratto in B32) | **Escluso** | ✅ | Allineato. |
| 21 | `dirigenza_incremento_022_ms2018` | `0` | `va_art39c2_CCNL2024_incremento0_22MonteSalari2018_valorizzazione` | ✅ | ✅ | **Escluso** (sottratto in B32) | **Escluso** | ✅ | Allineato. |
| 22 | `dirigenza_incremento_art33` | `0` | `va_art33c2_DL34_2019_incrementoDeroga` | ✅ | ✅ | **Escluso** (sottratto in B32) | **Soggetto** | ❌ | **DISCREPANZA**: L'Excel sottrae B22 da B32 (escludendo l'incremento Art. 33 dal confronto tetto parziale della dirigenza). Ma l'Art. 33 viene poi incluso in `limiti!B14` tramite `B32+B33`. L'App classifica questa voce come Soggetta. **Da verificare normativamente**: la logica dell'Excel sembra incoerente (sottrarre dalla depurazione ma sommare nel foglio limiti). |
| 23 | `dirigenza_indennita_ad_personam_art110` | `0` | ❌ **Non presente** | ❌ | ❌ | Escluso | — | ❌ | **VOCE MANCANTE**: Indennità ad personam ex Art. 110 TUEL per dirigenti. Non presente nell'App. |
| 24 | `dirigenza_recupero_2024_2025_ccnl2026` | `0` | ❌ **Non presente** | ❌ | ❌ | Escluso | — | ❌ | **VOCE MANCANTE**: Recupero una tantum annualità 2024-2025 per dirigenti. |
| 25 | `dirigenza_incremento_022_ms2021` | `0` | `va_art24c3_CCNL2022_2024_incremento0_22MonteSalari2021` | ✅ | ✅ | **Escluso** (sottratto in B32) | **Escluso** | ✅ | Allineato. |
| 26 | `dirigenza_recupero_annualita_2025` | `0` | ❌ **Non presente** | ❌ | ❌ | Escluso | — | ❌ | **VOCE MANCANTE**: Recupero una tantum annualità 2025 per dirigenti. |
| 27 | `dirigenza_incentivi_funzioni_tecniche` | `0` | ❌ **Non presente come voce separata** | ❌ | ❌ | **Escluso** (sottratto in B32) | — | ❌ | **VOCE MANCANTE**: Incentivi funzioni tecniche per dirigenti. L'App non ha una chiave dedicata nella pagina Dirigenza. |
| 28 | `dirigenza_proventi_codice_strada` | `0` | ❌ **Non presente** | ❌ | ❌ | **Escluso** (sottratto in B32) | — | ❌ | **VOCE MANCANTE**: Proventi violazioni Codice della Strada per dirigenti. L'App non ha una chiave corrispondente. |
| 32 | `dirigenza_parziale_confronto_tetto_2016` | Formula complessa | `lim_totaleParzialeRisorseConfrontoTetto2016` | ✅ | ⚠️ | Soggetto (in `limiti!B14`) | ⚠️ **Escluso** dal calcolo compliance centralizzato | ❌ | **DISCREPANZA CRITICA**: Come per il Segretario, l'Excel include la dirigenza nel tetto complessivo (`limiti!B14`), l'App la calcola in pagina ma la esclude da `risorseRilevantiArt23`. |
| 33 | `dirigenza_rettifica_art23` | `0` | `lim_art23c2_DLGS75_2017_adeguamentoAnnualeTetto2016` | ✅ | ✅ | — | — | ✅ | Allineato. |

---

## 11. Foglio `limiti` — Verifica Art. 23, comma 2

Questa è la sezione più critica per la compliance complessiva dell'ente.

| Riga | Variabile Excel | Formula Excel | Logica App | Stato | Note |
|---:|---|---|---|:---:|---|
| 4-9 | Basi storiche 2016 | Comparto, PO/EQ, Segretario, Dirigenza, Straordinario, Altre | `historicalData.fondoSalarioAccessorioPersonaleNonDirEQ2016 + fondoElevateQualificazioni2016 + fondoDirigenza2016 + risorseSegretarioComunale2016 + fondoStraordinario2016` | ✅ | Allineato. L'App ricostruisce la base identicamente. |
| 10 | `limite_salario_accessorio_2016` | `=SUM(B4:B9)` | `fondoBase2016` nel motore | ✅ | Allineato. |
| 11 | `limiti_comparto_corrente` | `=comparto!B35-comparto!B22+comparto!B36` | `fad_soggette_lordo` (parziale, diverso trattamento B22/Art.60) | ⚠️ | L'Excel riaggiunge B22 (riduzione indennità comparto) perché l'aveva già depurata in B35. L'App usa la neutralizzazione figurativa. **Stesso effetto finale, logica diversa.** |
| 12 | `limiti_eq_corrente` | `=eq!B21-eq!B12-eq!B19-eq!B14-eq!B15` | `eq_soggette` nel motore | ❌ | **DISCREPANZA**: L'Excel sottrae B12 (0,22% MS 2018), B14 (0,22% MS 2021), B15 (una tantum 2024-2025) e B19 (Art. 33 deroga). L'App calcola `eq_soggette` come `fondoPO2017 + incrementoConRiduzioneFondoDipendenti + incrementoLimiteArt23c2_DL34`, senza sottrarre esplicitamente le voci escluse dal totale (non le include affatto). **La logica è concettualmente opposta** (l'Excel parte dal totale e sottrae, l'App parte da zero e somma solo le soggette), ma l'effetto dovrebbe essere lo stesso se le voci sono catalogate coerentemente. Tuttavia, l'App non include `va_dl25_2025_armonizzazione` che l'Excel implicitamente include (non la sottrae). |
| 13 | `limiti_segretario_corrente` | `=segretario!B30` | **Non incluso** in `risorseRilevantiArt23` | ❌ | **DISCREPANZA CRITICA**: L'Excel include le risorse rilevanti del Segretario nel calcolo del tetto corrente. L'App le esclude completamente dal motore centralizzato. |
| 14 | `limiti_dirigenza_corrente` | `=dirigenza!B32+dirigenza!B33` | **Non incluso** in `risorseRilevantiArt23` | ❌ | **DISCREPANZA CRITICA**: L'Excel include la dirigenza nel tetto corrente. L'App la esclude dal motore centralizzato. |
| 15 | `limiti_straordinario_corrente` | `=comparto!B103` | `straordinarioCorrenteSoggettoArt23` (incluso in `fad_soggette_lordo`) | ✅ | Allineato nella sostanza: entrambi includono lo straordinario corrente. |
| 17 | `limiti_ammontare_corrente` | `=SUM(B11:B16)` | `risorseRilevantiArt23Effettive` (parziale!) | ❌ | **DISCREPANZA CRITICA**: L'Excel somma comparto + EQ + segretario + dirigenza + straordinario. L'App somma solo comparto + EQ + straordinario + assorbiti, escludendo segretario e dirigenza. Il confronto `delta` risulta falsato per gli enti con segretario e/o dirigenza attivi. |
| 19 | `limiti_delta_2016_corrente` | `=B10-B17` | `deltaArt23 = risorseRilevantiArt23Effettive - limiteArt23C2Modificato` | ⚠️ | La formula è equivalente nel segno (positivo = margine nell'Excel, negativo = sforamento nell'App). Ma il valore sottostante è diverso perché il denominatore (`B17` vs `risorseRilevantiArt23Effettive`) è incompleto nell'App. |

---

## 12. Foglio `limiti` — Art. 33 D.L. 34/2019 (Valore unitario medio 2018)

| Riga | Variabile Excel | Formula Excel | Logica App | Stato | Note |
|---:|---|---|---|:---:|---|
| 22-23 | Basi 2018 (comparto + PO) | Input | `historicalData.fondoPersonaleNonDirEQ2018_Art23 + fondoEQ2018_Art23` | ✅ | Allineato. |
| 25 | Dipendenti 2018 | Input | `personale2018PerArt23` / `manualDipendentiEquivalenti2018` | ✅ | Allineato. |
| 26 | `limiti_valore_unitario_2018` | `=IF(B25=0,0,B24/B25)` | `valoreMedioProCapite2018_Art23` nel motore | ✅ | Allineato. |
| 27-28 | Comparto e EQ correnti per Art. 33 | Formule specifiche | Non implementato come verifica separata | ❌ | **NON IMPLEMENTATO**: L'App non ha un controllo Art. 33 separato e visibile. Il `calculateArt23c2Adjustment` gestisce l'adeguamento per variazione personale ma non riproduce il prospetto completo dell'Art. 33. |
| 30 | Dipendenti correnti previsti | Input | `dipendentiEquivalentiAnnoRif_Art23` | ✅ | Allineato. |
| 31 | `limiti_valore_unitario_corrente` | `=IF(B30=0,0,B29/B30)` | Non calcolato separatamente | ❌ | L'App calcola l'importo dell'adeguamento ma non espone il valore unitario medio corrente come dato del prospetto. |
| 34 | `limiti_incremento_realizzabile` | `=IF(B33<0,0,B33)` | Risultato di `calculateArt23c2Adjustment.importo` | ✅ | Allineato nella formula: `Math.max(0, ...)`. |
| 35 | `limiti_nuovo_limite_corrente` | `=IF(B34=0,B10,B10+B34)` | `limiteArt23C2Modificato = fondoBase2016 + art23Adjustment.importo` | ✅ | Allineato. |

---

## 13. Foglio `limiti` — Riparto 0,22% Monte Salari

| Riga | Variabile Excel | Formula Excel | Logica App | Stato | Note |
|---:|---|---|---|:---:|---|
| 40 | MS dipendenti 2018 | Input | `ccnl2024.monteSalariDipendenti2018` (nel wizard) | ✅ | Allineato. |
| 41 | `limiti_022_ms2018` | `=B40*0.22%` | Calcolato in `calculateCcnl2024Increases` | ✅ | Allineato. |
| 42-43 | Fondi comparto e EQ 2021 | Input | Calcolato dal wizard con spesa relativa | ⚠️ | L'Excel usa i fondi 2021, l'App potrebbe usare spesa 2024/2025. **Criterio di riparto potenzialmente diverso.** |
| 44 | `limiti_quota_comparto_022_2018` | Formula proporzionale | `ccnlResults.split.personale.incrementoVariabileOpzionale*` | ⚠️ | La formula del riparto è analoga ma la base di proporzione potrebbe differire. |
| 45 | `limiti_quota_eq_022_2018` | Formula proporzionale | `ccnlResults.split.eq.incrementoVariabileOpzionale*` | ⚠️ | Idem. |
| 48-49 | MS dipendenti 2021 e 0,22% | Formula | Calcolato nel wizard | ✅ | Allineato. |
| 50-51 | Fondi comparto e EQ 2024 | Input | Calcolato dal wizard con spesa relativa | ⚠️ | L'Excel usa i fondi 2024 per il riparto dello 0,22% MS 2021. L'App potrebbe usare una base diversa. |
| 52-53 | Quote comparto e EQ 0,22% 2021 | Formula proporzionale | `ccnlResults.split.*.incrementoVariabileOpzionaleDal2026` | ⚠️ | Stessa osservazione: formula proporzionale coerente, base potenzialmente diversa. |

---

## 14. Riepilogo Criticità per Priorità

### ❌ Discrepanze Critiche (Bloccanti per la Conformità)

| # | Criticità | Foglio Excel | File App Coinvolti | Impatto |
|---:|---|---|---|---|
| 1 | **Segretario escluso dal calcolo compliance centralizzato** | `limiti` riga 13 | `fundEngine.ts` | Il tetto complessivo non include la spesa rilevante del Segretario. Margine Art. 23 falsato. |
| 2 | **Dirigenza esclusa dal calcolo compliance centralizzato** | `limiti` riga 14 | `fundEngine.ts` | Il tetto complessivo non include la spesa rilevante della Dirigenza. Margine Art. 23 falsato. |
| 3 | **`va_dl25_2025_armonizzazione` EQ esclusa da `eq_soggette` nel motore** | `eq` riga 20, `limiti` riga 12 | `fundEngine.ts` riga 253-257 | La voce concorre al tetto nell'Excel ma è omessa nel motore App. |
| 4 | **Voci EQ mancanti nel motore** (`maggiorazioneSediLavoro`, `maggiorazioneInterim`) | `eq` righe 6, 11 | `fundCalculations.ts` (`calculateEqSubFund`) | Il totale EQ backend è inferiore a quello mostrato a schermo. |
| 5 | **Voci Segretario CCNL 2026 mancanti nel motore** (080MS2021, 022MS2021, funz.tecniche) | `segretario` righe 24-26 | `fundCalculations.ts` (`calculateSegretarioSubFund`) | Il totale Segretario backend è inferiore a quello mostrato a schermo. |

### ❌ Voci Mancanti (Non presenti nell'App)

| # | Voce | Foglio Excel | Effetto Art. 23 Excel | Priorità |
|---:|---|---|---|---|
| 6 | `comparto_una_tantum_022_2024_2025` | `comparto` riga 54 | Escluso | Media — Potenzialmente coperta dagli arretrati generici. |
| 7 | `comparto_incremento_art33_dl34_2019` | `comparto` riga 57 | Escluso dal parziale | Media — L'App gestisce l'Art. 33 solo come adeguamento del limite. |
| 8 | `eq_indennita_ad_personam_art110` | `eq` riga 13 | Escluso | Media |
| 9 | `eq_retribuzione_risultato_min_15` (come voce di finanziamento) | `eq` riga 10 | Escluso | Media — L'App lo tratta come voce di utilizzo. |
| 10 | `eq_una_tantum_022_2024_2025` | `eq` riga 15 | Escluso | Media |
| 11 | `eq_incremento_art33_dl34_2019` | `eq` riga 19 | Escluso | Media |
| 12 | `segretario_risultato_max_20` | `segretario` riga 22 | Soggetto | Bassa — Solo per enti metropolitani. |
| 13 | `segretario_unione_comuni_fascia_superiore` | `segretario` riga 10 | Soggetto | Bassa — Solo per unioni di comuni. |
| 14 | `dirigenza_indennita_ad_personam_art110` | `dirigenza` riga 23 | Escluso | Media |
| 15 | `dirigenza_recupero_2024_2025_ccnl2026` | `dirigenza` riga 24 | Escluso | Media |
| 16 | `dirigenza_recupero_annualita_2025` | `dirigenza` riga 26 | Escluso | Media |
| 17 | `dirigenza_incentivi_funzioni_tecniche` | `dirigenza` riga 27 | Escluso | Media |
| 18 | `dirigenza_proventi_codice_strada` | `dirigenza` riga 28 | Escluso | Media |

### ⚠️ Discrepanze Parziali (Non bloccanti, da confermare)

| # | Criticità | Foglio Excel | File App | Note |
|---:|---|---|---|---|
| 19 | Classificazione Art. 60: logica diversa, effetto identico | `comparto` riga 22, `limiti` riga 11 | `fundEngine.ts` | Entrambi neutralizzano l'effetto sul tetto. |
| 20 | D.L. 25/2025 comparto: soggetto nell'Excel, escluso nell'App | `comparto` riga 21 | `strutturaFondo.json` | Da chiarire normativamente. |
| 21 | Criterio di riparto 0,22% (base 2021 vs 2024/2025) | `limiti` righe 42-53 | `ccnl2024Calculations.ts` | Leggera differenza metodologica. |
| 22 | EQ: fasce di posizione aggregate in un unico campo | `eq` righe 4-5 | `FondoElevateQualificazioniPage.tsx` | Granularità diversa, effetto equivalente. |
| 23 | Prospetto Art. 33 D.L. 34/2019 non esposto nell'App | `limiti` righe 22-37 | Non presente | L'App calcola l'adeguamento ma non mostra il prospetto completo. |
| 24 | Maggiorazione sedi EQ: stabile nell'Excel, variabile nell'App | `eq` riga 6 | `FondoElevateQualificazioniPage.tsx` | Diversa classificazione stabile/variabile. |

---

## 15. Nota su Dubbi Normativi

> [!CAUTION]
> Le seguenti discrepanze non possono essere risolte con la sola analisi tecnica e richiedono un **parere normativo/contabile** prima di procedere alla correzione:

1. **D.L. 25/2025 e classificazione Art. 23**: La deroga del D.L. 25/2025 esclude l'incremento dal limite Art. 23? L'Excel sembra trattarlo come soggetto (non lo sottrae dal parziale confronto tetto riga 35), l'App lo qualifica come escluso.
2. **Art. 33 D.L. 34/2019 per la Dirigenza**: L'Excel sottrae l'incremento deroga dal parziale tetto (riga 32) ma poi lo somma nel foglio limiti (riga 14). Verificare la coerenza.
3. **Maggiorazione sedi EQ**: L'Excel la classifica come stabile e soggetta; l'App come variabile ed esclusa. Quale trattamento è normativo?
4. **EQ Retribuzione di Risultato**: L'Excel la prevede come voce di finanziamento variabile; l'App solo come voce di utilizzo (ripartizione interna). La scelta progettuale è intenzionale ma ha implicazioni sul totale esposto.

---

## 16. Matrice di Sintesi Complessiva

| Area | Voci Excel | Voci App Corrispondenti | Allineate ✅ | Parziali ⚠️ | Disallineate ❌ | Mancanti ❌ |
|---|---:|---:|---:|---:|---:|---:|
| Comparto Stabili | 20 | 19 | 16 | 2 | 0 | 1 |
| Comparto Var. Soggette | 7 | 7 | 7 | 0 | 0 | 0 |
| Comparto Var. Non Soggette | 17 | 16 | 14 | 2 | 0 | 1 |
| Comparto Totali/Verifiche | 5 | 4 | 2 | 1 | 0 | 1 |
| EQ | 12 | 8 | 3 | 2 | 2 | 4 |
| Segretario | 17 | 14 | 10 | 1 | 3 | 2 |
| Dirigenza | 18 | 12 | 10 | 0 | 1 | 6 |
| Limiti Art. 23 | 8 | 5 | 3 | 1 | 3 | 0 |
| Limiti Art. 33 | 7 | 4 | 3 | 0 | 2 | 0 |
| Limiti 0,22% | 8 | 8 | 3 | 5 | 0 | 0 |
| **TOTALE** | **119** | **97** | **71** | **14** | **11** | **15** |

> **Sintesi**: Su 119 voci del foglio Excel, 71 (60%) sono perfettamente allineate, 14 (12%) sono parzialmente allineate con differenze formali ma effetto sostanzialmente equivalente, 11 (9%) presentano discrepanze reali nella logica di calcolo o classificazione, e 15 (13%) non sono presenti nell'App. Le 5 criticità bloccanti riguardano tutte l'area della compliance Art. 23 centralizzata (esclusione Segretario e Dirigenza) e le voci EQ/Segretario non sommate nel motore backend.
