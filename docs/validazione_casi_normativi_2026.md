# Validazione Motore Normativo 2026 contro Casi Numerici Esterni

Questo documento riporta l'audit di validazione numerica del motore normativo 2026 dell'applicazione rispetto ai fogli di calcolo esterni forniti, specificamente per la colonna 2026 del foglio `Fondo risorse decentrate 2026 - foglio di calcolo.xlsx`.

## Casi di Test di Validazione Implementati

La suite di test di caratterizzazione e validazione è stata creata in:
* [normative_engine_2026_validation_cases.test.ts](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/features/wizard2026/transfer/__tests__/normative_engine_2026_validation_cases.test.ts)

Sono stati modellati due scenari:
1. **Caso A: Base Comune senza dirigenza** (ricavato direttamente dal file Excel).
2. **Caso B: Comune con dirigenza** (caso sintetico derivato dal precedente aggiungendo la dirigenza 2016 per testare la corretta inclusione dei limiti).

---

## Dettaglio Riscontri e Allineamento Formule

### 1. Limite Art. 23, comma 2 (D.Lgs. 75/2017)
* **Input Excel**: Limite 2016 Certificato = € 880.238,00. Voci ricostruite = € 1.071.838,00 (Fondo Dipendenti € 868.238 + PO/EQ € 191.600 + Altre voci € 12.000). Variazione personale = 0.
* **Risultato Motore**: Il motore ricostruisce correttamente il totale a € 1.071.838,00. Utilizzando il limite certificato inserito, calcola un limite finale attualizzato di **€ 880.238,00**, allineato al 100% con il foglio Excel.

### 2. Rinnovo Contrattuale 2022-2024 (Art. 58, co. 1 - 0,14%)
* **Input Excel**: Monte Salari 2021 = € 5.033.777,00.
* **Risultato Motore**:
  * Incremento stabile 0,14% = **€ 7.047,29** (formula: `5.033.777 * 0,14%`).
  * Arretrati stabile 2024/2025 = **€ 14.094,58** (formula: `7.047,2878 * 2`).
  * Entrambi i valori calcolati dal motore corrispondono esattamente a quelli del foglio di controllo Excel.

### 3. Conglobamento Indennità di Comparto (Art. 60)
* **Input Excel**: Headcount per area (Funzionari: 40, Istruttori: 60, Operatori Esperti: 80, Operatori: 10).
* **Risultato Motore**: Riduzione totale di **€ 20.398,80** (somma dei conglobamenti annuali senza tredicesima). Coincidenza perfetta con la riduzione inserita in Row 18 Col H del foglio Excel.

### 4. D.L. 25/2025 (Art. 14, comma 1-bis)
* **Input Excel**: Spesa tabellari 2023 non dirigenti = € 5.923.776,00. Fondo stabile 2025 certificato = € 1.011.308,54. Budget EQ 2025 = € 191.600,00.
* **Risultato Motore**:
  * Soglia 48% = **€ 2.843.412,48**.
  * Risorse 2025 da detrarre = **€ 1.202.908,54**.
  * Limite massimo teorico D.L. 25/2025 = **€ 1.640.503,94**.
  * Il motore calcola correttamente il tetto massimo del D.L. 25/2025 in linea con i vincoli di legge. L'ente ha applicato a bilancio un incremento di € 846.765,93, che risulta pienamente capiente all'interno del limite massimo calcolato dal motore.

---

## Discrepanze Identificate (Mancanza Split EQ)

Durante la validazione numerica sono state identificate due discrepanze strutturali nel modo in cui l'applicazione gestisce il trasferimento dei dati dal Wizard alla Costituzione del Fondo rispetto al foglio Excel:

### Discrepanza 1: Riparto Proporzionale 0,14% (CCNL 2026)
* **Comportamento Excel**: L'incremento totale dello 0,14% (€ 7.047,29) viene inizialmente aggiunto per intero al Comparto (Row 16). Tuttavia, la quota spettante alle Elevate Qualificazioni (€ 1.259,76, calcolata in proporzione alle risorse EQ 2024 rispetto al totale) viene successivamente detratta dal Comparto in Row 23 per essere allocata separatamente sul fondo EQ. Questo lascia una quota netta sul Comparto pari a **€ 5.787,53**.
* **Comportamento App**: L'applicazione trasferisce l'intero valore di € 7.047,29 al campo del fondo dipendenti `st_art58c1_CCNL2026_incremento014_MS2021` durante la fase di trasferimento dal Wizard, senza effettuare la corrispondente decurtazione per la quota EQ sul comparto stabile.

### Discrepanza 2: Riparto Proporzionale D.L. 25/2025
* **Comportamento Excel**: L'incremento del D.L. 25/2025 applicato complessivamente (€ 981.639,32) viene ripartito proporzionalmente. La quota EQ pari a € 134.873,39 viene detratta in Row 24 dal Fondo Dipendenti. Sul Fondo Dipendenti stabile viene inserito solo il valore al netto (€ 846.765,93).
* **Comportamento App**: Nel Wizard l'utente deve inserire direttamente la quota netta destinata al Fondo Dipendenti (€ 846.765,93). Il motore non calcola né gestisce automaticamente lo split e il trasferimento della quota EQ sul fondo EQ corrispondente dal D.L. 25/2025, richiedendo una gestione manuale da parte dell'utente.

---

## Conclusioni e Proposta di Bugfix

Le formule di calcolo e i limiti sono corretti e allineati con le normative di riferimento. Le differenze riscontrate risiedono esclusivamente nel meccanismo di **riparto automatico delle risorse destinate al personale (Comparto) e alle Elevate Qualificazioni (EQ)** per i nuovi incrementi 2026.

Si propone di affrontare questi allineamenti e l'aggiunta di campi correttivi nella successiva PR di bugfix/refactoring del motore normativo.
