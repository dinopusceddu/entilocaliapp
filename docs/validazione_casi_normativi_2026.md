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

* **Problema iniziale (PR #19)**: L'applicazione applicava erratamente un riparto proporzionale allo 0,14% previsto dall'art. 58, comma 1, del CCNL 23.02.2026.
* **Soluzione (PR #21)**: In applicazione della gerarchia delle fonti normative e del testo dell'art. 58, comma 1, del CCNL 23.02.2026, l'incremento dello 0,14% del Monte Salari 2021 (€ 7.047,29 per MS € 5.033.777,00) e gli arretrati 2024-2025 (€ 14.094,58) alimentano integralmente al 100% la parte stabile e la componente una tantum del Fondo risorse decentrate dei dipendenti (`st_art58c1_CCNL2026_incremento014_MS2021` e `vn_art58_CCNL2026_arretrati2024_2025`). Nessuna quota automatica viene destinata alle EQ (`st_incremento014_ms2021_eq` = 0 e `va_arretrati014_eq` = 0). Il riparto proporzionale opera esclusivamente per l'incremento facoltativo fino allo 0,22% prescritto dall'art. 58, comma 2.

## Caratterizzazione D.L. 25/2025, Requisiti di Validazione e Transfer Gates

* **Analisi del foglio Excel**: Il valore di € 981.639,32, precedentemente assunto come incremento lordo complessivo, non è presente in alcuna cella o formula del foglio ed è stato ottenuto sommando impropriamente le righe H20 e H24. Il foglio distingue l’incremento stabile del Fondo dalla possibile successiva riduzione compensativa destinata alle EQ. Non costituisce quindi evidenza di uno split automatico del D.L. 25/2025.
* **Comportamento dell'App**: Nel Wizard l'utente inserisce direttamente l'importo dell'incremento applicato del D.L. 25/2025. Il motore e il trasferimento runtime operano in modo corretto trasferendo tale importo interamente alla parte stabile del Fondo dipendenti (`st_incrementoDL25_2025`), senza effettuare alcuno split automatico verso le Elevate Qualificazioni.
* **Requisiti D.L. 25/2025**: Quando `incrementoApplicato > 0`, l'ente deve possedere espressamente tutti i requisiti giuridici e finanziari obbligatori (`isPrimaFasciaDl34: true`, `isEquilibrioPluriennaleAsseverato: true`, approvazione COSFEL per enti deficitari, e dati contabili di base). Se un requisito è assente (`undefined`), non verificato o `false`, il motore genera un errore bloccante.
* **Gate di Trasferimento (PR #21)**: La funzione di dominio `validateWizard2026Transferable` / `assertWizard2026Transferable` intercetta qualsiasi errore bloccante (`severity === 'error'`) e impedisce l'esecuzione del trasferimento Wizard → Fondo sia dal motore di calcolo runtime che dalla UI (disabilitazione pulsante e modale di conferma). L'autosave delle bozze incomplete rimane sempre operativo.

---

## Portata della Caratterizzazione e Limitazioni

* **Ambito di validazione della PR #21**:
  * Destinazione al 100% dell'incremento 0,14% (art. 58 c. 1) e arretrati 2024-2025 al Fondo risorse decentrate dei dipendenti, con 0 quota automatica per EQ.
  * Preservazione del riparto proporzionale per l'incremento facoltativo dello 0,22% (art. 58 c. 2).
  * Verifica della destinazione integrale alla parte stabile dell'importo D.L. 25/2025.
  * Introduzione del blocco reale del trasferimento in presenza di errori normativi o requisiti D.L. 25/2025 mancanti se `incrementoApplicato > 0`.
* **Fuori perimetro**:
  * Modifiche alle Edge Functions, Supabase, RAG o infrastruttura di deployment.

---

## Conclusioni

I totali calcolati dal motore (es. 0,14% e limiti D.L. 25/2025) risultano congruenti con i valori attesi. L'assegnazione dello 0,14% è stata rettificata per alimentare al 100% il Fondo dipendenti. Il blocco del trasferimento garantisce la protezione dei prospetti contabili del Fondo da trasferimenti incongrui o normativamente non validi.
