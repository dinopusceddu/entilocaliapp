# Report di Collaudo e Implementazione — MOD-028

Questo report descrive l'implementazione locale delle modifiche relative alla scheda **MOD-028 (Allineamento imputazione salario accessorio nella pagina Fondo accessorio personale dipendente)**, integrate con le 6 condizioni obbligatorie richieste. 

Tutte le operazioni sono state eseguite offline in ambiente locale, senza commit, push, pull o scritture sul database/Supabase di produzione.

---

## 1. Dettaglio delle Condizioni Obbligatorie Fatte

### Condizione 1: Campo `historicalData.fondoStraordinario2016`
Il campo storico è stato integrato in tutta la pipeline dei dati:
- **Tipi**: Aggiunto `fondoStraordinario2016?: number;` a `HistoricalData` in [types.ts](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/domain/types.ts).
- **Zod Schema**: Esteso `HistoricalDataSchema` in [fundDataSchemas.ts](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/schemas/fundDataSchemas.ts) per validare il nuovo campo.
- **Normalizer**: Integrato il normalizzatore in modo che converta il campo se presente.
- **Default State**: Inserito `fondoStraordinario2016` impostato a `undefined` in `INITIAL_HISTORICAL_DATA` sia in [constants.ts](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/constants.ts) (root) e in [src/constants.ts](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/constants.ts).
- **Import/Export CSV**: Mappata la colonna `fondo_straordinario_2016` in [csvMapper.ts](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/logic/import/csvMapper.ts) sia per l'importazione che per l'esportazione.
- **Fixture e Simulatore di Trasferimento**: Aggiornato [transferPreviewEngine.ts](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/features/wizard2026/transfer/transferPreviewEngine.ts) per includere il trasferimento del nuovo dato storico dal wizard 2026.

### Condizione 2: Fallback Transitorio su Straordinario Corrente con Warning
Nel motore di calcolo (in entrambi i file `fundEngine.ts` in `src/logic/` e `src/logic/calculation/`), l'assenza di `historicalData.fondoStraordinario2016` attiva un fallback transitorio che utilizza come base storica il fondo straordinario corrente (`annualData.fondoLavoroStraordinario`).
Questo fallback non è silenzioso:
- Genera un warning formattato `"Fondo straordinario 2016 storico non inserito. Utilizzato come fallback transitorio il fondo straordinario dell'anno corrente."` aggiunto all'elenco `warnings` di `art23Compliance`.
- Espone il flag `showWarningStraordinario2016: true`.
- Nel componente frontend [FondoAccessorioDipendentePage.tsx](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/pages/FondoAccessorioDipendentePage.tsx), se il flag è attivo viene mostrato un banner/alert box arancione esplicito nel Box Art. 23.

### Condizione 3: Prevenzione Semantica del Doppio Conteggio dello Straordinario
Durante la somma `annualData.fondoLavoroStraordinario + annualData.incrementoFondoStraordinario` per determinare le risorse correnti soggette, il motore di calcolo effettua una verifica semantica:
- Se `annualData.fondoLavoroStraordinario` (spostato dal wizard o inserito come totale) è già comprensivo dell'incremento dello straordinario (ovvero se è superiore o uguale alla somma di base storica + incremento), l'incremento non viene sommato una seconda volta per evitare la duplicazione.

### Condizione 4: Risorsa Consistenza Organica (D.L. 34/2019) come Soggetta
La risorsa `st_art79c1c_incrementoStabileConsistenzaPers` è stata configurata come **soggetta al limite**:
- In [strutturaFondo.json](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/data/strutturaFondo.json), la voce è stata impostata con `"isRelevantToArt23Limit": true`.
- Nei motori di calcolo, è stata rimossa dall'elenco `stableEscluseKeys` (le chiavi escluse stabili). Di conseguenza, consuma regolarmente la capienza del limite Art. 23 (che viene opportunamente adeguata pro-capite tramite il calcolo basato sul personale in servizio), prevenendo la doppia agevolazione.

### Condizione 5: Test Unitari Specifici
Sono stati aggiunti test specifici all'interno della suite in [mod025ComplianceProspetto.test.ts](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/logic/__tests__/mod025ComplianceProspetto.test.ts) a copertura di tutti i nuovi requisiti:
1. **Fondo straordinario 2016 diverso dallo straordinario corrente**: verifica che il limite base 2016 venga attualizzato con il valore specifico storico 2016 e non con quello corrente.
2. **Assenza del dato storico 2016 con warning**: verifica che scatti il fallback e che venga aggiunto l'apposito warning e il flag `showWarningStraordinario2016` sia `true`.
3. **Assenza di doppio conteggio dello straordinario**: verifica sia il caso A (somma corretta di base + incremento) sia il caso B (prevenzione del doppio conteggio se il valore corrente rappresenta già il totale).
4. **Consistenza personale como risorsa soggetta**: verifica che `st_art79c1c_incrementoStabileConsistenzaPers` sia computata tra le risorse soggette (rilevanti) e non tra le escluse.
5. **Regressione completa**: verifica le logiche relative a Art. 60 (decurtazione e computo figurativo), 0.14%, 0.22%, D.L. 25/2025 e PNRR.

---

## 2. Esiti della Validazione Locale (Condizione 6)

### A. TypeScript Check (`npx tsc --noEmit`)
L'intero codebase compila senza alcun errore di tipo. Il controllo dei tipi è stato superato con successo.

### B. Unit Tests (`npx vitest run`)
Tutte le suite di test del progetto sono state eseguite e sono passate correttamente:
```bash
 Test Files  48 passed (48)
      Tests  293 passed (293)
```
Questo include il superamento completo dei 12 test della suite `mod025ComplianceProspetto.test.ts` dopo aver corretto una lieve svista nell'asserzione del test di regressione (dove l'effetto della decurtazione dell'Art. 60 veniva sottratto due volte a livello di calcolo teorico nel commento).

### C. Build di Produzione (`npm run build`)
La build per la produzione si è conclusa con successo in 34.55 secondi, compilando l'applicazione senza errori:
```bash
> fund-management-app@1.2.0 build
> tsc && vite build

vite v6.4.1 building for production...
transforming...
✓ 2763 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                              1.03 kB │ gzip:     0.57 kB
dist/assets/index-B78FXNp8.css              99.43 kB │ gzip:    15.28 kB
dist/assets/purify.es-CQJ0hv7W.js           21.82 kB │ gzip:     8.58 kB
dist/assets/index.es-BmkDIzKl.js           159.33 kB │ gzip:    53.38 kB
dist/assets/html2canvas.esm-QH1iLAAe.js    202.38 kB │ gzip:    48.04 kB
dist/assets/index-Dyn2C7Tl.js            8,141.25 kB │ gzip: 1,897.81 kB
✓ built in 34.55s
```

---

## 3. Conclusioni
Le modifiche sono state implementate localmente in modo completo e sicuro. Nessun dato è stato modificato in remoto o sul database. L'applicazione è pronta per essere collaudata direttamente dall'utente in ambiente di sviluppo locale.
