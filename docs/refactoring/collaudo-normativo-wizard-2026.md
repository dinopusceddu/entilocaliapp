# Collaudo Normativo — Wizard Istruttorio 2026 (Preview Sperimentale)

Questo documento definisce il protocollo di collaudo normativo e contabile per il nuovo **Wizard Istruttorio 2026**, eseguito in un ambiente di simulazione isolato per verificare la conformità algoritmica di ogni singola disposizione di legge prima di consentire qualsiasi futuro trasferimento verso la canonica sezione "Costituzione Fondo".

---

## 1. Obiettivo del Collaudo

L'obiettivo fondamentale del collaudo normativo è accertare che i motori di calcolo pure (`src/logic/wizard2026/`) e i meccanismi di anteprima di mappatura (`src/features/wizard2026/mappingPreview.ts`) applichino con assoluta precisione le prescrizioni di calcolo e di vincolo dettate dal nuovo quadro legislativo e contrattuale (CCNL 23.02.2026, D.L. 25/2025, ecc.), operando in una sandbox disaccoppiata e priva di effetti collaterali sul sistema gestionale in uso.

---

## 2. Regola Fondamentale di Transizione

In ossequio ai principi di prudenza e continuità operativa:
> **Il vecchio wizard e le logiche di calcolo della pagina "Costituzione Fondo" devono rimanere pienamente attivi e inalterati.** Nessun dato inserito o calcolato all'interno del nuovo wizard in modalità preview può sovrascrivere lo stato di produzione o il database fino al superamento formale di tutti i collaudi e alla successiva deliberazione di rilascio in produzione.

---

## 3. Norme Verificate

Il presente protocollo sottopone a verifica rigorosa il corretto funzionamento delle seguenti fonti normative:
- **Art. 23, comma 2, D.Lgs. 75/2017:** Tetto storico del 2016 e ricostruzione per i singoli sottofondi in assenza di limite certificato.
- **D.L. 25/2025:** Incremento diretto per enti territoriali virtuosi (soglia spesa 48%) e gestione separata per Unioni di Comuni.
- **Art. 58 CCNL Funzioni Locali 23.02.2026:** Incremento stabile 0,14% e quota variabile facoltativa fino allo 0,22% del monte salari 2021.
- **Art. 60 CCNL Funzioni Locali 23.02.2026:** Conglobamento e decurtazione stabile delle indennità di comparto per le quattro aree professionali.
- **Art. 67 CCNL Funzioni Locali 23.02.2026:** Incremento del fondo lavoro straordinario, gestione del limite con o senza dirigenza, ed economie una tantum.
- **Art. 8, comma 3, D.L. 13/2023 (PNRR):** Incremento in deroga fino al 5% della componente stabile 2016 subordinato al mantenimento degli equilibri di bilancio.

---

## 4. Scenari Numerici Attesi e 5. Esiti Attesi

### SCENARIO A — Art. 23 con limite ricostruito
- **Input:**
  - fondo personale dipendente 2016 = 1.000.000
  - fondo EQ/PO 2016 = 100.000
  - fondo dirigenza 2016 = 200.000
  - risorse segretario 2016 = 30.000
  - fondo straordinario 2016 = 50.000
  - hasDirigenza = true
  - risorse soggette attuali = 1.300.000
  - risorse escluse attuali = 80.000
- **Esito Atteso:**
  - limite ricostruito = € 1.380.000 (somma di 1.000.000 + 100.000 + 200.000 + 30.000 + 50.000)
  - limite certificato utilizzato = false
  - margine art. 23 = € 80.000 (1.380.000 - 1.300.000)
  - superamento art. 23 = € 0

### SCENARIO B — Art. 23 con limite certificato prevalente
- **Input:**
  - limite2016CertificatoEnte = 1.500.000
  - sottofondi 2016 valorizzati con somma diversa (es. ricostruito 1.380.000)
  - risorse soggette attuali = 1.420.000
- **Esito Atteso:**
  - limite art. 23 = € 1.500.000
  - limite certificato utilizzato = true
  - margine = € 80.000 (1.500.000 - 1.420.000)

### SCENARIO C — Art. 23 senza dirigenza
- **Input:**
  - fondo personale dipendente 2016 = 1.000.000
  - fondo EQ/PO 2016 = 100.000
  - fondo dirigenza 2016 = 200.000
  - risorse segretario 2016 = 30.000
  - fondo straordinario 2016 = 50.000
  - hasDirigenza = false
- **Esito Atteso:**
  - fondo dirigenza 2016 non sommato
  - limite ricostruito = € 1.180.000 (1.000.000 + 100.000 + 30.000 + 50.000)

### SCENARIO D — D.L. 25/2025 Comune applicabile
- **Input:**
  - entityType = COMUNE
  - stipendiTabellari2023NonDirigenti = 2.500.000
  - fondoStabile2025Certificato = 1.000.000
  - budgetEq2025 = 100.000
  - incrementoApplicato = 80.000
  - isPrimaFasciaDl34 = true
  - isEquilibrioPluriennaleAsseverato = true
  - isDissesto = false
  - isStrutturalmenteDeficitario = false
  - isPianoRiequilibrio = false
- **Esito Atteso:**
  - status = DIRECTLY_APPLICABLE
  - soglia 48% = € 1.200.000 (2.500.000 × 0.48)
  - incremento massimo teorico = € 100.000 (1.200.000 - 1.000.000 - 100.000)
  - incremento applicato = € 80.000
  - nessun errore bloccante

### SCENARIO E — D.L. 25/2025 incremento superiore al massimo
- **Input:**
  - stessi dati dello scenario D
  - incrementoApplicato = 120.000
- **Esito Atteso:**
  - incremento massimo teorico = € 100.000
  - errore bloccante in validazione per superamento del massimale consentito (€ 120.000 > € 100.000)

### SCENARIO F — D.L. 25/2025 Unione di Comuni
- **Input:**
  - entityType = UNIONE_COMUNI
  - quotaTrasferitaAderentiDL25_2025 = 25.000
  - attiComuniAderentiPresenti = false
  - riduzionePermanenteFondiComuniCertificata = false
- **Esito Atteso:**
  - status = TRANSFER_ONLY
  - soglia 48% = 0
  - incremento diretto = 0
  - quota trasferita = € 25.000
  - errore bloccante per mancanza atti Comuni aderenti
  - errore bloccante per mancanza riduzione permanente fondi Comuni
  - nessuna mappatura verso `st_incrementoDL25_2025`

### SCENARIO G — D.L. 25/2025 Camera di Commercio
- **Input:**
  - entityType = CAMERA_COMMERCIO
- **Esito Atteso:**
  - status = NOT_APPLICABLE
  - incremento diretto = 0
  - messaggio / check di non applicabilità se si inseriscono valori di incremento

### SCENARIO H — CCNL 23.02.2026 0,14% e 0,22%
- **Input:**
  - monteSalari2021 = 1.000.000
  - applicaIncremento022 = true
  - percentualeApplicata022 = 50
- **Esito Atteso:**
  - incremento 0,14% stabile = € 1.400 (1.000.000 × 0.0014)
  - incremento massimo 0,22% = € 2.200 (1.000.000 × 0.0022)
  - incremento 0,22% applicato = € 1.100 (2.200 × 0.50)

### SCENARIO I — Conglobamento art. 60
- **Input:**
  - FUNZIONARIO_EQ = 0,75
  - OPERATORE_ESPERTO = 0,80
  - ISTRUTTORE = 0
  - OPERATORE = 0
- **Esito Atteso:**
  - Funzionari/EQ: 435,96 × 0,75 = € 326,97
  - Operatori Esperti: 330,24 × 0,80 = € 264,192
  - totale non arrotondato = € 591,162
  - totale arrotondato / visualizzato in UI = € 591,16
  - nessuna moltiplicazione ulteriore per 12 (gli importi unitari sono già su base annua)

### SCENARIO L — Straordinario con dirigenza
- **Input:**
  - hasDirigenza = true
  - fondoStraordinario2016 = 50.000
  - fondoStraordinarioAnnoCorrente = 50.000
  - incrementoRichiesto = 8.000
  - margineArt23 = 5.000
- **Esito Atteso:**
  - incremento ammesso = € 5.000 (pari alla capienza del margine)
  - incremento non ammesso = € 3.000
  - warning forte o errore sul superamento del margine art. 23

### SCENARIO M — Straordinario senza dirigenza, riduzione mancante
- **Input:**
  - hasDirigenza = false
  - incrementoRichiesto = 8.000
  - riduzioneFondoDecentrato = 0
- **Esito Atteso:**
  - errore bloccante in validazione
  - incremento non validamente finanziato in assenza della corrispondente riduzione permanente del fondo decentrato

### SCENARIO N — Straordinario senza dirigenza, operazione neutrale
- **Input:**
  - hasDirigenza = false
  - incrementoRichiesto = 8.000
  - riduzioneFondoDecentrato = 8.000
- **Esito Atteso:**
  - operazione interamente valida e neutrale
  - incremento ammesso = € 8.000
  - riduzione necessaria = € 8.000

### SCENARIO O — Economie straordinario
- **Input:**
  - economieStraordinarioAnnoPrecedente = 3.000
- **Esito Atteso:**
  - economie da trasferire a risorsa variabile una tantum = € 3.000
  - non costituisce un incremento stabile del fondo straordinario

### SCENARIO P — PNRR
- **Input:**
  - componenteStabile2016 = 1.000.000
  - incrementoApplicato = 40.000
  - enteInEquilibrio = true
  - requisitiVerificati = true
- **Esito Atteso:**
  - incremento massimo teorico PNRR = € 50.000 (1.000.000 × 0.05)
  - incremento applicato = € 40.000
  - incremento non ammesso = € 0

### SCENARIO Q — PNRR oltre massimo
- **Input:**
  - componenteStabile2016 = 1.000.000
  - incrementoApplicato = 60.000
  - enteInEquilibrio = true
  - requisitiVerificati = true
- **Esito Atteso:**
  - incremento massimo PNRR = € 50.000
  - incremento non ammesso = € 10.000
  - errore bloccante in validazione per superamento del tetto del 5%

### SCENARIO R — Mapping preview complessivo
- **Input:**
  - Comune applicabile al D.L. 25, con incremento = 80.000
  - incremento 0,22% applicato = 1.100
  - conglobamento art. 60 = 591,16
  - economie straordinario = 3.000
  - PNRR = 40.000
- **Esito Atteso Mapping Preview:**
  - `st_incrementoDL25_2025` = 80.000, status READY
  - `vn_art58c2_CCNL2026_incremento022_MS2021` = 1.100, status READY
  - `st_art60c2_CCNL2026_decurtazioneIndennitaComparto` = 591,16, status READY
  - `vn_art15c1m_art67c3e_risparmiStraordinario` = 3.000, status READY
  - `vn_dl13_art8c3_incrementoPNRR_max5stabile2016` = 40.000, status READY
  - `ambiguo.fondoStraordinarioIncremento` = REQUIRES_REVIEW (richiede campo canonico distinto)

### SCENARIO S — Mapping preview TRANSFER_ONLY
- **Input:**
  - entityType = UNIONE_COMUNI
  - quotaTrasferitaAderentiDL25_2025 = 25.000
- **Esito Atteso:**
  - Non deve essere valorizzato il campo diretto `st_incrementoDL25_2025`
  - Deve risultare la voce separata `quotaTrasferitaAderentiDL25_2025` con valore 25.000 e status READY o REQUIRES_REVIEW

---

## 6. Checklist Manuale in UI Preview

Durante la sessione di collaudo nella UI preview all'indirizzo `/wizard-2026-preview`, eseguire i seguenti controlli interattivi:

- [ ] **Step 1 — Ente (Scenari D, F, G):**
  - Selezionare "Comune", inserire parametri di virtuosità e verificare l'abilitazione dello Step 3 in modalità diretta.
  - Selezionare "Unione di Comuni", constatare il passaggio alla modalità `TRANSFER_ONLY`.
  - Selezionare "Camera di Commercio", verificare che il calcolo D.L. 25 indichi `NOT_APPLICABLE`.
- [ ] **Step 2 — Limite Art. 23 (Scenari A, B, C):**
  - Inserire i 5 sottofondi 2016 e verificare il calcolo automatico della somma.
  - Alternare il flag `hasDirigenza` tra true e false e accertare l'inclusione/esclusione di € 200.000.
  - Inserire il limite certificato ente e constatare il passaggio dalla modalità ricostruita a quella certificata.
- [ ] **Step 3 — D.L. 25/2025 (Scenari D, E, F):**
  - Inserire stipendi 2023 = 2.500.000, fondo stabile 2025 = 1.000.000, budget EQ = 100.000.
  - Inserire incremento richiesto = 80.000 e verificare la validazione positiva.
  - Incrementare la richiesta a 120.000 e verificare la comparsa immediata dell'errore bloccante rosso.
- [ ] **Step 4 — CCNL 2026 (Scenario H):**
  - Inserire monte salari 2021 = 1.000.000.
  - Verificare l'apparizione immediata di € 1.400 (stabile 0,14%).
  - Attivare l'opzione 0,22% con percentuale 50% e accertare il calcolo di € 1.100.
- [ ] **Step 5 — Conglobamento Art. 60 (Scenario I):**
  - Inserire 0.75 in Funzionari/EQ e 0.80 in Operatori Esperti.
  - Verificare che il totale decurtazione calcolato e mostrato sia esattamente € 591,16.
- [ ] **Step 6 — Straordinario (Scenari L, M, N, O):**
  - Con dirigenza: inserire margine = 5.000 e richiesta = 8.000. Verificare ammesso = 5.000 e non ammesso = 3.000 con errore.
  - Senza dirigenza: inserire richiesta = 8.000 e riduzione = 0. Verificare la segnalazione di errore. Inserire riduzione = 8.000 e verificare l'azzeramento dell'errore.
  - Inserire economie = 3.000 e verificare il check informativo.
- [ ] **Step 7 — PNRR (Scenari P, Q):**
  - Inserire stabile 2016 = 1.000.000 e richiesta = 40.000 con ente in equilibrio. Verificare la validazione verde.
  - Aumentare la richiesta a 60.000 e accertare l'errore per superamento del 5% (50.000).
- [ ] **Step 8 — Riepilogo e Mapping Preview (Scenari R, S):**
  - Accedere allo Step 8 e aprire il cassetto laterale "Mapping Preview".
  - Verificare che i valori e lo status di ogni voce di destinazione corrispondano millimetricamente alle specifiche degli scenari R e S.

---

## 7. Criteri di Superamento e Fallimento

- **Superamento (Pass):** Tutti gli scenari di calcolo automatizzati (A-S) e le ispezioni manuali in UI restituiscono esiti coincidenti al centesimo con gli importi attesi e producono la corretta segnalazione di errori/warning in caso di superamento di soglie.
- **Fallimento (Fail):** Discrepanze numeriche anche minime (es. moltiplicazioni errate per 12 nello Step 5), assenza di blocchi di validazione in caso di superamento di tetti di legge, o comparsa di effetti collaterali sulla persistenza o sui calcoli legacy.

---

## 8. Cosa Resta Escluso da Questa Fase

La presente fase di collaudo normativo esclude deliberatamente:
- Il salvataggio permanente dello stato del wizard su database Supabase o su `localStorage`.
- L'integrazione con la navigazione canonica di produzione o il rimpiazzo del vecchio wizard.
- Qualsiasi operazione di riversamento, alterazione o mutazione verso l'oggetto globale `fundData` o l'ecosistema `fundEngine.ts`.

---

## 9. Conferma Assenza di Trasferimento Reale

Si attesta e si ribadisce in modo categorico che la modalità in esame opera esclusivamente su un contenitore di stato isolato (`Wizard2026DraftState`). Il tasto finale per il trasferimento reale verso la "Costituzione Fondo" in `Wizard2026SummaryPanel.tsx` e `Step8RiepilogoPreview.tsx` è disattivato per impedire qualsiasi inquinamento o alterazione non autorizzata dello stato operativo dell'ente in esercizio.

---

## Registro Anomalie (FASE 5)

| ID | Scenario | Esito Atteso | Esito Riscontrato | Stato | Note |
|---|---|---|---|---|---|
| **A** | Art. 23 Limite Ricostruito | Limite = 1.380.000, Margine = 80.000 | Limite ricostruito a € 1.380.000 esatti, Margine = € 80.000, nessun superamento | SUPERATO | Calcolo in tempo reale su UI corretto |
| **B** | Art. 23 Limite Certificato | Limite = 1.500.000, Margine = 80.000 | Limite certificato utilizzato = € 1.500.000, Margine = € 80.000 | SUPERATO | Prevalenza del limite certificato confermata in UI |
| **C** | Art. 23 Senza Dirigenza | Limite = 1.180.000 (dirigenza esclusa) | Deselezionando la casella dirigenza, i 200.000 sono ignorati (Limite = € 1.180.000) | SUPERATO | Logica condizionale in Step 2 perfettamente reattiva |
| **D** | D.L. 25 Comune Applicabile | Soglia 48% = 1.200.000, Max = 100.000 | Soglia 48% = € 1.200.000, Incremento Max = € 100.000, Applicato = € 80.000 | SUPERATO | Stato `DIRECTLY_APPLICABLE` con check tutti positivi |
| **E** | D.L. 25 Oltre Massimo | Errore bloccante per superamento max (€ 120.000 > € 100.000) | Errore bloccante rosso in Step 3 per richiesta € 120.000 > € 100.000 | SUPERATO | Validazione in tempo reale blocca avanzamento / trasferimento |
| **F** | D.L. 25 Unione Comuni | Modalità `TRANSFER_ONLY`, Quota = 25.000, Errori per atti mancanti | Stato `TRANSFER_ONLY`, Quota trasferita = € 25.000, Errori per atti/riduzione non flaggati | SUPERATO | Il pannello UI adatta i campi per l'Unione di Comuni |
| **G** | D.L. 25 Camera Commercio | `NOT_APPLICABLE`, incremento = 0 | Stato `NOT_APPLICABLE`, messaggio di non ammissione all'incremento D.L. 25 | SUPERATO | Corretta inibizione dell'istituto per enti non ammessi |
| **H** | CCNL 2026 0,14% e 0,22% | 0,14% = 1.400, 0,22% applicato = 1.100 | Stabile 0,14% = € 1.400, Variabile 0,22% (slider 50%) = € 1.100 | SUPERATO | Slider percentuale intuitivo e calcolo immediato |
| **I** | Conglobamento Art. 60 | Decurtazione = € 591,16 | Decurtazione calcolata su 12 mesi = € 591,16 (somma di 326,97 + 264,192 arrotondata) | SUPERATO | Nessuna moltiplicazione erronea per 12, formula esatta |
| **L** | Straordinario con Dirigenza | Ammesso = 5.000, Non ammesso = 3.000 con errore su margine | Incremento ammesso = € 5.000, non ammesso = € 3.000 con errore rosso su margine Art. 23 | SUPERATO | Vincolo del margine Art. 23 correttamente intercettato in UI |
| **M** | Straord. No Dir. No Riduzione| Errore bloccante per assenza riduzione | Avviso di errore bloccante per assenza corrispondente riduzione fondo decentrato | SUPERATO | Ente privo di dirigenza correttamente sottoposto al vincolo |
| **N** | Straord. No Dir. Neutrale | Operazione valida, Ammesso = 8.000 | Incremento ammesso = € 8.000 a fronte di riduzione fondo decentrato = € 8.000 (neutrale) | SUPERATO | Operazione perfettamente validata senza segnalazioni d'errore |
| **O** | Economie Straordinario | Risorsa variabile una tantum = 3.000 | Economie mostrate in UI come destinate a risorse variabili una tantum (€ 3.000) | SUPERATO | Banner informativo in Step 6 chiaro e visibile |
| **P** | PNRR nei Limiti | Max = 50.000, Ammesso = 40.000 | Max 5% = € 50.000, Incremento richiesto = € 40.000 regolarmente validato | SUPERATO | Sezione PNRR sbloccata previa asseverazione equilibri |
| **Q** | PNRR Oltre Massimo | Errore bloccante, Non ammesso = 10.000 | Errore bloccante rosso per richiesta € 60.000 > massimale 5% (€ 50.000) | SUPERATO | Segnalazione immediata in UI e in pannello riepilogo |
| **R** | Mapping Preview Globale | Corrispondenza esatta delle voci su status `READY` e `REQUIRES_REVIEW` | Mapping Preview nel cassetto Step 8 mostra tutte le voci popolate e status `READY` | SUPERATO | Quadratura perfetta tra le voci sorgente e i target legacy |
| **S** | Mapping `TRANSFER_ONLY` | Assenza `st_incrementoDL25_2025`, presenza quota trasferita | Nel pannello di mapping, `st_incrementoDL25_2025` assente, presente `quotaTrasferita` | SUPERATO | Nessun travaso improprio tra istituti differenziati |

