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
  * Soglia 48% = **€ 2.843.412,48** (48% degli stipendi tabellari 2023 del personale non dirigente).
  * Risorse 2025 da detrarre = **€ 1.202.908,54** (somma di parte stabile del Fondo 2025, budget EQ 2025 e altre risorse da detrarre).
  * Limite massimo teorico D.L. 25/2025 = **€ 1.640.503,94** (formula: `max(0; 48% stipendi tabellari 2023 - fondo stabile 2025 - stanziamento EQ 2025 - altreRisorse2025DaSottrarre)`).
  * Il motore calcola il tetto massimo del D.L. 25/2025 in linea con i vincoli della L. 9 maggio 2025, n. 69 (di conversione del D.L. n. 25/2025). L'ente ha applicato a bilancio un incremento di € 846.765,93, che risulta capiente all'interno del limite massimo calcolato dal motore.
  * In conformità con l'articolo 58, comma 3, del CCNL del 23 febbraio 2026, le risorse stanziate ai sensi dell'art. 14, comma 1-bis, del D.L. n. 25/2025 alimentano integralmente la parte stabile del Fondo risorse decentrate del personale dipendente (`st_incrementoDL25_2025`). Lo stanziamento EQ rileva esclusivamente nella determinazione dello spazio disponibile entro la soglia del 48%, riducendone la capienza, ma non riceve automaticamente alcuna quota dell'incremento.
  * Il parametro tecnico `altreRisorse2025DaSottrarre` consente di considerare nel calcolo eventuali ulteriori risorse 2025 da detrarre, la cui corretta composizione normativa deve essere verificata sulla base della nota RGS prot. 175706 del 27 giugno 2025.

---

## Discrepanze Identificate e Risolte

Durante la validazione numerica è stata inizialmente identificata una discrepanza strutturale nel modo in cui l'applicazione gestisce il trasferimento dei dati dal Wizard alla Costituzione del Fondo rispetto al foglio Excel per lo 0,14%.

### Discrepanza 1 (RISOLTA in PR #19): Riparto Proporzionale 0,14% (CCNL 2026)

* **Problema iniziale**: L'applicazione trasferiva l'intero valore dello 0,14% al Fondo Dipendenti senza detrarre la quota spettante alle Elevate Qualificazioni.
* **Soluzione**: L'applicazione calcola ora lo 0,14% (sia incremento stabile che arretrati) e ripartisce proporzionalmente le quote (es. 82,12% Fondo, 17,88% EQ) basandosi sui valori del 2024. Il trasferimento Wizard -> Fondo popola correttamente i nuovi campi specifici: `st_art58c1_CCNL2026_incremento014_MS2021` (Fondo) e `st_incremento014_ms2021_eq` (EQ), e gli equivalenti campi arretrati. 

## Caratterizzazione D.L. 25/2025 e Analisi Excel

* **Analisi del foglio Excel**: Il valore di € 981.639,32, precedentemente assunto come incremento lordo complessivo, non è presente in alcuna cella o formula del foglio ed è stato ottenuto sommando impropriamente le righe H20 e H24. Il foglio distingue l’incremento stabile del Fondo dalla possibile successiva riduzione compensativa destinata alle EQ. Non costituisce quindi evidenza di uno split automatico del D.L. 25/2025.
* **Comportamento dell'App**: Nel Wizard l'utente inserisce direttamente l'importo dell'incremento applicato del D.L. 25/2025. Il motore e il trasferimento runtime operano in modo corretto trasferendo tale importo interamente alla parte stabile del Fondo dipendenti (`st_incrementoDL25_2025`), senza effettuare alcuno split automatico verso le Elevate Qualificazioni.
* **Variazioni delle risorse EQ**: Eventuali successive variazioni delle risorse destinate alle Elevate Qualificazioni devono essere gestite separatamente, secondo la disciplina contrattuale applicabile e, quando comportano una corrispondente riduzione del Fondo risorse decentrate, nel rispetto delle materie demandate alla contrattazione integrativa.

---

## Portata della Caratterizzazione e Limitazioni

* **Ambito di validazione della PR #20**:
  * Verifica la destinazione integrale alla parte stabile dell'importo D.L. 25/2025.
  * Verifica l'assenza di split automatico verso le EQ.
  * Non certifica la conformità complessiva del motore normativo.
  * Non implementa il blocco completo del trasferimento quando i requisiti D.L. 25/2025 risultano mancanti o non confermati.
* **Fuori perimetro**:
  * La presente attività non riguarda il riparto dell'incremento dello 0,14% di cui all'art. 58, comma 1, CCNL 23.02.2026, che forma oggetto di separata verifica tecnico-normativa.
  * Non viene modificato o risolto il trattamento degli incrementi dello 0,22% (limite discrezionale).

---

## Conclusioni

I totali calcolati dal motore (es. 0,14% e limiti D.L. 25/2025) risultano congruenti con i valori attesi. Le problematiche di allineamento e riparto dello 0,14% sono state risolte nella PR #19. Nessuna anomalia residua rilevata nel perimetro specifico della caratterizzazione dello stanziamento D.L. 25/2025 e della sua mancata ripartizione automatica alle EQ. Restano fuori perimetro gli altri rilievi tecnici e normativi dell'audit generale.
