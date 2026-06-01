# MOD-021 — Motore di anteprima trasferimento Wizard 2026 → Costituzione Fondo

Questo documento descrive la progettazione e l'implementazione della fase ponte (simulatore in sola anteprima) tra il nuovo wizard “Raccolta dati dell’Ente / Configurazione fondo” e la pagina legacy di Costituzione Fondo.

---

## 1. Mappatura dei Campi e Trasferimento Diretto

La funzione `simulateWizard2026Transfer` esegue una simulazione non mutativa (lavorando su una copia profonda dei dati del fondo `FundData`) per determinare come i dati raccolti nel wizard alimenterebbero la Costituzione del Fondo.

### 1.1 Risorse Trasferibili Direttamente (Stato: `READY`)

Questi campi vengono mappati e proposti per la scrittura diretta nei dati del fondo:

1. **CCNL 23.02.2026 — 0,14% Stabile**
   - **Origine**: `ccnl2026.result.incrementoStabile014`
   - **Destinazione**: `fondoAccessorioDipendenteData.st_art58c1_CCNL2026_incremento014_MS2021`
   - **Rilevanza Art. 23**: `FUORI_LIMITE` (Escluso dal limite del trattamento accessorio ai sensi dell'art. 58 c. 1).
   
2. **CCNL 23.02.2026 — Arretrati 0,14%**
   - **Origine**: `ccnl2026.result.arretrati014`
   - **Destinazione**: `fondoAccessorioDipendenteData.vn_art58_CCNL2026_arretrati2024_2025`
   - **Rilevanza Art. 23**: `FUORI_LIMITE` (Risorsa variabile una tantum esclusa dal limite).

3. **CCNL 23.02.2026 — Quota 0,22% Fondo**
   - **Origine**: `ccnl2026.result.incremento022Fondo`
   - **Destinazione**: `fondoAccessorioDipendenteData.vn_art58c2_incremento_max022_ms2021`
   - **Rilevanza Art. 23**: `FUORI_LIMITE` (Ripartizione proporzionale esclusa dal limite).

4. **CCNL 23.02.2026 — Quota 0,22% EQ**
   - **Origine**: `ccnl2026.result.incremento022EQ`
   - **Destinazione**: `fondoElevateQualificazioniData.va_incremento022_ms2021_eq`
   - **Rilevanza Art. 23**: `FUORI_LIMITE` (Quota destinata alle Elevate Qualificazioni esclusa dal limite).

5. **Conglobamento Comparto Art. 60**
   - **Origine**: `conglobamentoArt60.result.riduzioneTotale`
   - **Destinazione**: `fondoAccessorioDipendenteData.st_art60c2_CCNL2026_decurtazioneIndennitaComparto`
   - **Rilevanza Art. 23**: `COMPUTO_FIGURATIVO` (Riduzione a fini figurativi; non libera nuovo spazio sul tetto).

6. **Riduzione Straordinario Destinata al Fondo**
   - **Origine**: `straordinario.result.incrementoParteStabileDaRiduzioneStraordinario`
   - **Destinazione**: `fondoAccessorioDipendenteData.st_art79c1_art14c3_art67c2g_riduzioneStraordinario`
   - **Rilevanza Art. 23**: `DENTRO_LIMITE` (Incrementa stabilmente il fondo dipendenti ma rientra nel limite complessivo).

7. **Economie Straordinario Riversate**
   - **Origine**: `straordinario.result.economieDaTrasferireVariabileUnaTantum`
   - **Destinazione**: `fondoAccessorioDipendenteData.vn_art15c1m_art67c3e_risparmiStraordinario`
   - **Rilevanza Art. 23**: `FUORI_LIMITE` (Escluso dal limite).

8. **Fondo Straordinario Ordinario dell'Anno**
   - **Origine**: `straordinario.result.straordinarioOrdinarioSoggettoArt23` (o equivalente Step 6)
   - **Destinazione**: `annualData.fondoLavoroStraordinario`
   - **Rilevanza Art. 23**: `DENTRO_LIMITE` (Trattamento accessorio ordinario soggetto al limite).

---

## 2. Risorse non Alimentate Automaticamente (Limiti e Controlli)

Questi campi non modificano lo stato contabile del fondo simulato e richiedono un inserimento manuale o un controllo:

### 2.1 Limiti Massimi (Stato: `REQUIRES_CONFIRMATION` o `CONTROL_ONLY`)

*   **D.L. 25/2025 — Limite Incremento Fondi**
    - **Origine**: `dl25.result.limiteMassimoDL25`
    - **Destinazione**: `fondoAccessorioDipendenteData.st_incrementoDL25_2025`
    - **Stato**: `REQUIRES_CONFIRMATION`
    - **Motivazione**: Il wizard calcola solo il tetto teorico massimo. L'attivazione e l'importo effettivo da iscrivere sono scelte discrezionali dell'ente da formalizzare con delibera, previa verifica del revisore.
*   **PNRR — Incentivi Art. 8 c. 3 D.L. 13/2023**
    - **Origine**: `pnrr.result.limiteMassimoPnrrFondoDipendenti` / `limiteMassimoPnrrFondoDirigenza`
    - **Destinazione**: `fondoAccessorioDipendenteData.vn_dl13_art8c3_incrementoPNRR_max5stabile2016` / `fondoDirigenzaData.va_dl13_2023_art8c3_incrementoPNRR`
    - **Stato**: `CONTROL_ONLY`
    - **Motivazione**: Il wizard calcola la capienza massima teorica; le somme effettivamente liquidate dipendono dall'avanzamento dei progetti PNRR e sono inserite separatamente.

### 2.2 Dati di Controllo (Stato: `CONTROL_ONLY`)

*   **Limite Art. 23 attualizzato**
    - **Origine**: `art23.result.limiteArt23Attualizzato`
    - **Stato**: `CONTROL_ONLY`
    - **Motivazione**: Rappresenta il tetto massimo del trattamento accessorio complessivo dell'ente. Non costituisce una risorsa finanziabile di per sé.

---

## 3. Gestione Rischi di Sovrascrittura da `useEffect` Legacy

Nelle pagine legacy della Costituzione Fondo (`FondoAccessorioDipendentePage.tsx` e `FondoElevateQualificazioniPage.tsx`) sono presenti dei `useEffect` che ricalcolano i valori dei campi in base a configurazioni centrali inserite nell'oggetto `annualData.ccnl2024`.

Se il trasferimento scrivesse solo i campi contabili finali, l'apertura delle pagine legacy ne provocherebbe la sovrascrittura con valori azzerati o divergenti.

### 3.1 Soluzione di Sincronizzazione Implementata
Il simulatore allinea preventivamente i parametri istruttori annuali:
*   `annualData.ccnl2024.monteSalari2021` = Monte Salari 2021 calcolato/consolidato.
*   `annualData.ccnl2024.fondoPersonale2025` = Storico FRD 2024.
*   `annualData.ccnl2024.fondoEQ2025` = Storico EQ 2024.
*   `annualData.ccnl2024.optionalIncreaseVariableFrom2026Percentage` = Percentuale incremento 0,22% scelta dall'ente.
*   `annualData.ccnl2024.ivcConglobation.totalReduction` = Riduzione stabile per indennità comparto Art. 60.
*   `annualData.fondoLavoroStraordinario` = Risorse destinate allo straordinario.

---

## 4. UI e Grafica dello Step 8

L'anteprima di trasferimento è integrata come nona sezione nello **Step 8 (Riepilogo)**:
*   **Box Introduttivo**: Spiega chiaramente che si tratta di una simulazione senza salvataggio reale.
*   **Card Responsive**: Ciascuna risorsa è visualizzata tramite card (no tabelle orizzontali rigide) per assicurare la perfetta leggibilità su tablet e smartphone.
*   **Palette FP CGIL Lombardia**: Colori coordinati `#CC4331` (rosso/arancio), `#A83226` (rosso scuro), `#FFF4F2` (sfondo chiaro).
*   **Dettagli Tecnici Collassati**: I campi tecnici (`campoDestinazione`, `parametroIstruttorioCollegato`) ed i messaggi di rischio sovrascrittura legacy sono celati e visibili solo al click su un pulsante di espansione.

---

## 5. Stato del Trasferimento Reale

*   Il pulsante finale dello Step 8 mostra la dicitura **"Trasferisci i dati alla costituzione del fondo e compila"**.
*   Il pulsante è **disabilitato**.
*   Sotto di esso compare la dicitura: *"Funzione non ancora attiva. In questa fase viene mostrata solo l’anteprima dei campi che saranno trasferiti dopo il collaudo finale del mapping."*

---

## 6. Prossimi Passi Prima dell'Attivazione Reale

1.  **Collaudo con gli utenti**: verifica che le logiche di delta e calcolo dei limiti massimi siano comprese dagli operatori.
2.  **Approvazione del mapping**: confermare la corrispondenza biunivoca dei campi.
3.  **Abilitazione dispatch**: rimozione dello stato di sola anteprima ed esecuzione del dispatch `UPDATE_FONDO_ACCESSORIO_DIPENDENTE_DATA` e analoghi alla pressione del pulsante (attualmente disabilitato).
4.  **Pulizia dei vecchi wizard**: rimozione dei vecchi wizard legacy per la parte 2026 una volta validato il trasferimento.
