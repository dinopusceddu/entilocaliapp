# Task List — Sprint C.4: Nuovo Wizard Dati Generali

## 1. Setup e Struttura
- [ ] Creazione componenti base wizard (`EntityWizardContainer`, `WizardProgressBar`).
- [ ] Definizione tipi e interfacce per lo stato del wizard.
- [ ] Setup navigazione avanti/indietro.

## 2. Implementazione Step (UI & Logica)
- [ ] Step 1-2: Anagrafica e Anno.
- [ ] Step 3: Integrazione `CsvImportModal` nel flusso wizard.
- [ ] Step 4: Dati Storici (Fondo 2016).
- [ ] Step 5: Personale e FTE.
- [ ] Step 6: CCNL 2026 e parametri specifici.
- [ ] Step 7-8: Compliance e Opzionali.
- [ ] Step 9: Integrazione `RequestDataLetterModal`.
- [ ] Step 10: Riepilogo finale con validazione globale.

## 3. Persistenza e Integrazione
- [ ] Mapping dati wizard -> `fundData`.
- [ ] Gestione "Salva Bozza" durante il wizard.
- [ ] Gestione chiusura accidentale (recovery state).

## 4. Test e Validazione
- [ ] Unit test per la navigazione del wizard.
- [ ] Test di validazione per singolo step.
- [ ] E2E test: compilazione completa ente tramite wizard.
- [ ] Verifica regressioni sui dati esistenti.

## 5. Documentazione e Consegna
- [ ] Update `walkthrough.md`.
- [ ] Update manuale utente/notifiche.
