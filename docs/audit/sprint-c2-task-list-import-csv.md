# Task List Sprint C.2 — Importazione CSV

- [ ] **Logica di Base**
  - [ ] Implementare `csvParser.ts` (wrapper PapaParse).
  - [ ] Implementare `csvMapper.ts` (mappatura chiavi CSV -> FundData).
  - [ ] Definire `importSchema.ts` (schema Zod per riga CSV).

- [ ] **Componenti UI**
  - [ ] Creare `CsvImportModal.tsx`.
  - [ ] Sviluppare `ImportPreviewTable.tsx` (confronto dati).
  - [ ] Implementare `ImportErrorReport.tsx`.

- [ ] **Integrazione**
  - [ ] Aggiungere action `IMPORT_ANNUAL_DATA_CSV` al reducer.
  - [ ] Inserire pulsante di import nel Wizard Step 1.
  - [ ] Inserire pulsante di import nella pagina EntityYearManagementPage.

- [ ] **Validazione e Test**
  - [ ] Creare fixture CSV valide.
  - [ ] Creare fixture CSV con errori (colonne mancanti, tipi errati).
  - [ ] Scrivere unit test per mapper e validator.
  - [ ] Eseguire test di regressione.

- [ ] **Documentazione**
  - [ ] Aggiornare il manuale utente (se applicabile).
  - [ ] Produrre il report finale dello Sprint C.2.
