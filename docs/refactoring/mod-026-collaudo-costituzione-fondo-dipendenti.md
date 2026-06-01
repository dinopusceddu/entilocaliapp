# Collaudo Tecnico e Funzionale — MOD-026

Questo documento descrive il collaudo tecnico e funzionale effettuato sulla pagina `FondoAccessorioDipendentePage.tsx` e sui motori di calcolo associati dopo le modifiche introdotte con il rilascio di **MOD-025**.

---

## 1. Tabella degli Scenari Testati

| Scenario | Descrizione | Input Principali | Valori Attesi (Art. 23 / Fondo Reale) | Valori Restituiti | Esito |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **A** | Fondo ordinario privo di decurtazioni Art. 60, D.L. 25/2025 e PNRR | - Storico Unico: € 90.000,00<br>- Storico RIA: € 5.000,00<br>- Taglio DL 78: € 2.000,00<br>- Var. Soggetta: € 4.000,00<br>- Var. Esclusa: € 3.000,00 | - F. Costituito: € 100.000,00<br>- Ris. Escluse: € 3.000,00<br>- Rilevanti Art. 23: € 2.000,00<br>- Limite: € 120.000,00<br>- Margine Residuo: € 118.000,00 | - F. Costituito: € 100.000,00<br>- Ris. Escluse: € 3.000,00<br>- Rilevanti Art. 23: € 2.000,00<br>- Limite: € 120.000,00<br>- Margine Residuo: € 118.000,00 | **CONFORME** |
| **B** | Fondo ordinario con decurtazione stabile Art. 60 CCNL 23.02.2026 | - Stessi di Scenario A<br>- Decurtazione Art. 60: € 1.500,00<br>- Riduzione Conglobamento (CCNL): € 1.500,00 | - F. Costituito: € 98.500,00<br>- Ris. Escluse: € 3.000,00<br>- Rilevanti Art. 23: € 2.000,00 (Neutro)<br>- Limite: € 120.000,00<br>- Margine Residuo: € 118.000,00 | - F. Costituito: € 98.500,00<br>- Ris. Escluse: € 3.000,00<br>- Rilevanti Art. 23: € 2.000,00<br>- Limite: € 120.000,00<br>- Margine Residuo: € 118.000,00 | **CONFORME** |
| **C** | Fondo con importi effettivi D.L. 25/2025 e PNRR superiori ai massimali teorici | - Stessi di Scenario A<br>- Incr. D.L. 25: € 12.000,00<br>- PNRR: € 8.000,00<br>- Max D.L. 25 (Wizard): € 10.000,00<br>- Max PNRR (Wizard): € 5.000,00 | - F. Costituito: € 120.000,00<br>- Ris. Escluse: € 23.000,00<br>- Errori: Rilevamento sforamento D.L. 25 e PNRR nel banner di compliance | - F. Costituito: € 120.000,00<br>- Ris. Escluse: € 23.000,00<br>- Errori: Rilevati entrambi nel banner di compliance | **CONFORME** |

---

## 2. Analisi Dettagliata degli Scenari

### Scenario A — Fondo Ordinario Base
* **Valori inseriti**:
  * Parte Stabile:
    * `st_art79c1_art67c1_unicoImporto2017` = € 90.000,00
    * `st_art79c1_art4c2_art67c2c_integrazioneRIA` = € 5.000,00
    * `st_taglioFondoDL78_2010` = € 2.000,00 (Sottrattore)
  * Parte Variabile:
    * `vs_art4c3_art15c1k_art67c3c_recuperoEvasione` = € 4.000,00 (Soggetto)
    * `vn_art15c1d_art67c3a_sponsorConvenzioni` = € 3.000,00 (Escluso)
* **Risultati ottenuti**:
  * Il fondo reale si attesta correttamente a **€ 100.000,00** (Stabili = € 93.000,00, Variabili = € 7.000,00).
  * Le risorse escluse ammontano a **€ 3.000,00** (solo la variabile da sponsorizzazione).
  * Le risorse rilevanti ai fini del tetto Art. 23 sono **€ 2.000,00** (calcolate come `sommaStabiliSoggetteLimite + sommaVariabiliSoggette` ovvero `-€ 2.000,00` [taglio DL 78] + `€ 4.000,00` [recupero evasione] = `€ 2.000,00`).
  * Il limite attualizzato è **€ 120.000,00** (Fondo base 2016 non dirigenziale di € 100.000,00 + EQ 2016 di € 20.000,00).
  * Il margine residuo disponibile è **€ 118.000,00** (`€ 120.000,00 - € 2.000,00`).

### Scenario B — Decurtazione Art. 60 (Indennità Comparto)
* **Valori inseriti**:
  * Stessi valori dello Scenario A.
  * `st_art60c2_CCNL2026_decurtazioneIndennitaComparto` = € 1.500,00
  * Configurazione contrattuale `ccnl2024.ivcConglobation.totalReduction` = € 1.500,00
* **Risultati ottenuti**:
  * Il fondo reale cala regolarmente a **€ 98.500,00** (il totale stabili scende a € 91.500,00).
  * Le risorse rilevanti ai fini dell'Art. 23 rimangono a **€ 2.000,00** (lo sforamento è neutralizzato grazie alla somma algebrica: `ammontareSoggetto (-€ 2.000,00 - € 1.500,00 + € 4.000,00) + computoFigurativo (+€ 1.500,00)` = **€ 2.000,00**).
  * Il margine residuo disponibile si attesta inalterato a **€ 118.000,00**.
  * Viene visualizzato a schermo il box di raccordo: *"+€ 1.500,00 Raccordo Computo Figurativo (Art. 60 CCNL 23.02.2026)"*.

### Scenario C — Sforamento Tetti DL 25 e PNRR
* **Valori inseriti**:
  * Stessi valori dello Scenario A.
  * `st_incrementoDL25_2025` = € 12.000,00 (limite massimo wizard: € 10.000,00)
  * `vn_dl13_art8c3_incrementoPNRR_max5stabile2016` = € 8.000,00 (limite massimo wizard: € 5.000,00)
* **Risultati ottenuti**:
  * Il fondo reale sale a **€ 120.000,00** (grazie all'incremento D.L. 25 e PNRR).
  * Le risorse escluse salgono a **€ 23.000,00** (D.L. 25 e PNRR sono esclusi dal limite Art. 23 c. 2).
  * Le risorse rilevanti ai fini dell'Art. 23 restano a **€ 2.000,00** (non sforano il limite di € 120.000,00).
  * Ciononostante, il sistema genera e mostra in cima alla pagina due messaggi di errore bloccanti:
    1. *"L'incremento D.L. 25/2025 effettivo (€ 12.000,00) supera il limite massimo consentito di € 10.000,00"*
    2. *"L'incremento PNRR effettivo (€ 8.000,00) supera il limite massimo consentito di € 5.000,00"*

---

## 3. Punti di Verifica Riscontrati

### A. Distinzione delle Voci Storiche Stabili (Punto 4)
È stato accertato che le risorse storiche consolidatesi con gli anni (come l'Unico Importo 2017 `st_art79c1_art67c1_unicoImporto2017` o il RIA `st_art79c1_art4c2_art67c2c_integrazioneRIA`), pur avendo il flag `isRelevantToArt23Limit === false` ereditato per motivi tecnici, **non** partecipano alla somma delle "Risorse Escluse Art. 23" esposte nel prospetto. Le risorse escluse riflettono unicamente le reali deroghe al tetto (es. D.L. 25/2025, PNRR, welfare, sponsor ecc.), garantendo che l'Organo di Revisione veda un quadro normativo veritiero.

### B. Gestione del D.L. 25/2025 e PNRR (Punto 5 & 6)
* Il campo **D.L. 25/2025** e il campo **PNRR** agiscono come campi ad inserimento effettivo. L'utente ha il controllo completo del valore stanziato.
* I valori massimi teorici sono dedotti in tempo reale dalle elaborazioni del wizard 2026.
* Lo sforamento dei massimali non causa il blocco dell'input sulla pagina (l'utente può forzare la compilazione), ma innesca la segnalazione di anomalia (severity `error`) all'interno del prospetto Art. 23, rispettando i vincoli di operatività non ostruzionistica ma rigorosa.

### C. Visualizzazione Grafica & Responsive (Punto 7)
* **Desktop**: Il prospetto mostra le 4 metriche affiancate orizzontalmente in modo chiaro ed elegante (griglia a 4 colonne).
* **Tablet**: La griglia si ridimensiona a 2 colonne, mantenendo ottimi spazi e leggibilità.
* **Mobile**: La griglia collassa su 1 colonna, ordinando i 4 valori verticalmente. Il raccordo dell'Art. 60 e i banner di compliance si adattano occupando l'intera larghezza dello schermo senza overflow laterali.

---

## 4. Anomalie Riscontrate e Proposte di Correzione

### Anomalia 1: Discrepanza sul Fondo Reale senza sincronizzazione contrattuale (Scenario B)
* **Comportamento riscontrato**: Se l'utente inserisce a mano la decurtazione permanente dell'Art. 60 (`st_art60c2_CCNL2026_decurtazioneIndennita Comparto`) senza impostare o aver completato lo Step 5 del wizard 2026 (che popola il record `ccnl2024.ivcConglobation`), il fondo reale dipendenti non cala. Questo accade perché `st_art60c2...` ha un flag interno `isAlreadyInCcnlTotal` che la esclude dalla somma delle risorse stabili ordinarie per evitare duplicazioni con l'ammontare netto contrattuale calcolato dal wizard.
* **Proposta di Correzione**:
  Nelle fasi successive di pulizia del wizard, quando l'inserimento manuale sarà l'unica via per gli anni non-wizard, la decurtazione permanente dell'indennità di comparto dovrà confluire algebricamente nella somma stabili a prescindere dal config contrattuale del wizard, oppure occorrerà garantire che i campi di interfaccia si auto-compilino in modo bidirezionale (popolando sempre la riduzione reale sul ccnl e la decurtazione sul fondo contemporaneamente).
