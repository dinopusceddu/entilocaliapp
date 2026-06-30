# Validazione Motore Normativo 2026 contro Casi Numerici Esterni

Questo documento riporta l'audit di validazione numerica del motore normativo 2026 dell'applicazione rispetto ai fogli di calcolo esterni forniti, specificamente per la colonna 2026 del foglio `Fondo risorse decentrate 2026 - foglio di calcolo.xlsx`.

## Casi di Test di Validazione Implementati

La suite di test di caratterizzazione e validazione è stata creata in:
* [normative_engine_2026_validation_cases.test.ts](../src/features/wizard2026/transfer/__tests__/normative_engine_2026_validation_cases.test.ts)

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

## Discrepanze Identificate e Risolte

Durante la validazione numerica è stata inizialmente identificata una discrepanza strutturale nel modo in cui l'applicazione gestisce il trasferimento dei dati dal Wizard alla Costituzione del Fondo rispetto al foglio Excel per lo 0,14%.

### Discrepanza 1 (RISOLTA in PR #19): Riparto Proporzionale 0,14% (CCNL 2026)

* **Problema iniziale**: L'applicazione trasferiva l'intero valore dello 0,14% al Fondo Dipendenti senza detrarre la quota spettante alle Elevate Qualificazioni.
* **Soluzione**: L'applicazione calcola ora lo 0,14% (sia incremento stabile che arretrati) e ripartisce proporzionalmente le quote (es. 82,12% Fondo, 17,88% EQ) basandosi sui valori del 2024. Il trasferimento Wizard -> Fondo popola correttamente i nuovi campi specifici: `st_art58c1_CCNL2026_incremento014_MS2021` (Fondo) e `st_incremento014_ms2021_eq` (EQ), e gli equivalenti campi arretrati. 

## Discrepanze Aperte (Da Risolvere)

### Discrepanza 2 (In Attesa): Riparto Proporzionale D.L. 25/2025

* **Comportamento Excel**: L'incremento del D.L. 25/2025 applicato complessivamente (€ 981.639,32) viene ripartito proporzionalmente. La quota EQ pari a € 134.873,39 viene detratta in Row 24 dal Fondo Dipendenti. Sul Fondo Dipendenti stabile viene inserito solo il valore al netto (€ 846.765,93).
* **Comportamento App**: Nel Wizard l'utente deve inserire direttamente la quota netta destinata al Fondo Dipendenti (€ 846.765,93). Il motore non calcola né gestisce automaticamente lo split e il trasferimento della quota EQ sul fondo EQ corrispondente dal D.L. 25/2025, richiedendo una gestione manuale da parte dell'utente.

---

## Conclusioni

I totali calcolati dal motore (es. 0,14% e limiti D.L. 25/2025) risultano congruenti con i valori attesi nei fogli di controllo esterni. La problematica dello split 0,14% è stata corretta. Resta da gestire in una futura PR la problematica inerente il D.L. 25/2025.
