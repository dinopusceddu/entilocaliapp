# MOD-012 — Step 4: Incrementi CCNL Funzioni Locali 23.2.2026 (0,14% e 0,22%)

**Data:** 2026-05-21  
**Versione:** MOD-012 finale  

---

## Obiettivo

Riorganizzazione dello **Step 4** ("Incrementi CCNL 23.02.2026") della *Raccolta dati dell'Ente* (wizard 2026) per renderlo una scheda dedicata esclusivamente al calcolo e alla validazione dei limiti massimi consentiti dalla contrattazione collettiva, depurando la pagina da scelte gestionali operative o percentuali di applicazione (slider, checkbox).

Le quote da calcolare basandosi sul **Monte Salari dell'anno 2021** (personale non dirigente) sono:
1. **Incremento Stabile 0,14%**: adozione ordinaria automatica.
2. **Limite Massimo Quota 0,22%**: adozione variabile discrezionale.

---

## Regole Normativo-Gestionali (COSFEL)

Per gli enti strutturalmente deficitari o soggetti a regime COSFEL, le tre casistiche per l'autorizzazione sono state implementate in modo differenziato:
- `hasApprovazioneCosfel === true`: il limite massimo della quota dello 0,22% è calcolato ordinariamente (valore teorico massimo).
- `hasApprovazioneCosfel === false`: il limite massimo della quota dello 0,22% viene forzato a zero, con emissione di un errore bloccante (`COSFEL-BLOCKED-CCNL2026-022`).
- `hasApprovazioneCosfel === undefined`: non viene forzato il limite a zero in automatico, ma viene mostrato un warning forte / istruttoria non validabile (`COSFEL-MISSING-CCNL2026-022`) fino alla verifica dell'approvazione COSFEL.

---

## File Modificati ed Logiche Implementate

### 1. `src/logic/wizard2026/ccnl2026Increments.ts`
- **Tipi `Ccnl2026IncrementsInput` e `Ccnl2026IncrementsResult`**: Contrassegnati come `@deprecated` i campi operativi di attivazione e percentuale dell'incremento 0,22% (`applicaIncremento022`, `percentualeApplicata022`). Aggiunti i campi puliti `monteSalari2021`, `incrementoStabile014`, `limiteMassimo022` e `totalePotenzialeCcnl2026`.
- **Funzione `calculateCcnl2026Increments`**:
  - Implementa la logica di calcolo pura basata sul Monte Salari 2021.
  - Se il Monte Salari 2021 è mancante (`undefined`), restituisce `isCalcolabile: false` e campi indefiniti, evitando di forzare a zero.
  - Applica la regola COSFEL: forza a zero `limiteMassimo022` solo se `isStrutturalmenteDeficitario === true` e `hasApprovazioneCosfel === false`. Se `hasApprovazioneCosfel` è `undefined`, calcola ordinariamente senza azzerare.
- **Funzione `validateCcnl2026Increments`**:
  - Genera l'errore `COSFEL-BLOCKED-CCNL2026-022` (severity error) se COSFEL è negata.
  - Genera il warning `COSFEL-MISSING-CCNL2026-022` (severity warning) se COSFEL è indefinita per un ente deficitario.

### 2. `src/features/wizard2026/steps/Step4Ccnl2026.tsx`
- Rimosso completamente lo slider di percentuale e il checkbox di attivazione.
- Riorganizzato il layout in **4 Sezioni distinte** conformi alla palette FP CGIL Lombardia (rossi/coralli/neutri):
  - **Sezione 1 — Base di calcolo (Monte Salari 2021)**: Input numerico per inserire il valore del Monte Salari 2021. Se vuoto, passa `undefined` alla logica.
  - **Sezione 2 — Incremento Stabile 0,14%**: Visualizzazione del risultato tramite `Wizard2026ResultCard` (bordeaux/cgil style).
  - **Sezione 3 — Limite massimo quota 0,22%**: Visualizzazione del limite massimo calcolato. Se bloccato da COSFEL, indica chiaramente la forzatura a zero.
  - **Sezione 4 — Riepilogo istruttorio**: Visualizzazione del "Totale Potenziale Istruttorio" e un box informativo che specifica che i valori non sono trasferiti in automatico (la scelta effettiva spetta all'ente nella tabella di Costituzione del Fondo decentrato).
- **Banner COSFEL**:
  - Banner rosso di blocco (`data-testid="cosfel-blocked-banner"`) se COSFEL è negata.
  - Banner ambra di warning (`data-testid="cosfel-missing-warning"`) se COSFEL è indefinita.

### 3. `src/features/wizard2026/components/Wizard2026SummaryPanel.tsx`
- Sdoppiata la visualizzazione degli incrementi contrattuali CCNL 2026 in due righe separate: "Incremento stabile 0,14%" e "Limite massimo quota 0,22%".
- Aggiornata la utility `formatEur` per visualizzare `'n/d'` in caso di valore indefinito (evitando zeri spuri per dati mancanti).

### 4. `src/features/wizard2026/components/Wizard2026PreviewPage.tsx`
- Passato il prop `enteState` al componente `Step4Ccnl2026` per permettere la corretta visualizzazione e gestione condizionale in base allo stato dell'ente (deficitario, COSFEL).

### 5. `src/features/wizard2026/mappingPreview.ts`
- Impostato il vecchio campo operativo `vn_art58c2_CCNL2026_incremento022_MS2021` su `NOT_APPLICABLE` (perché non più governato dal wizard), proteggendo i dati inseriti manualmente dall'utente nella tabella decentrata.

### 6. `src/features/wizard2026/letters/wizard2026LetterCatalog.ts`
- Aggiornato il catalogo per rimuovere le voci deprecate della scelta dell'incremento effettivo e mantenere solo la richiesta del Monte Salari 2021.

---

## Test Aggiornati e Creati

1. **`src/logic/wizard2026/__tests__/ccnl2026Increments.test.ts`**: Aggiornati i casi di test per verificare che la deficitarietà con COSFEL negata azzeri il limite massimo, mentre con COSFEL indefinita mantenga il calcolo teorico e sollevi solo un warning.
2. **`src/features/wizard2026/steps/__tests__/Step4Ccnl2026.test.tsx`**: Creati 7 nuovi test per verificare il rendering delle 4 sezioni, l'emissione del corretto evento onChange, l'assenza di slider/checkbox, e i banner per le diverse varianti COSFEL (true/false/undefined).
3. **`src/features/wizard2026/__tests__/mappingPreview.test.ts`**: Verificato il mapping dei campi su `nuovo.*` e la disattivazione del vecchio campo operativo.
4. **`src/features/wizard2026/__tests__/wizard2026NormativeScenarios.test.ts`**: Aggiornati gli scenari H, R ed S per riflettere la rimozione della scelta discrezionale dal wizard e testare correttamente la quota limite.

---

## Vincoli di Integrità Rispettati

- **Vecchio Wizard**: Non modificato.
- **Costituzione Fondo legacy**: Non modificata.
- **Supabase**: Nessun database schema o scrittura modificati.
- **localStorage**: Nessuna logica modificata.
- **Trasferimento finale**: Rimasto disabilitato come da indicazioni MOD-005.
