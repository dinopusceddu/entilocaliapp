# Sprint C.4.3 — Report Step 2016 e 2018

## 1. Obiettivi Raggiunti
Implementazione degli Step 3 e 4 del wizard per la gestione dei dati storici.

### Step 3 — Dati Storici 2016
- Implementato componente `WizardStepDatiStorici2016`.
- **Campi**: Fondo Personale, Fondo EQ, Fondo Dirigenza, Risorse Segretario, Fondo Straordinario 2016.
- **Funzionalità**: Calcolo in tempo reale del limite 2016 complessivo e supporto all'override manuale.
- **Logica**: Utilizzo di `draftData` per l'isolamento delle modifiche.

### Step 4 — Dati Storici 2018
- Implementato componente `WizardStepDatiStorici2018`.
- **Campi**: Fondo Personale 2018, Fondo EQ 2018, Personale FTE 2018 (Manuale), Personale in servizio 2018 (Count).
- **Funzionalità**: Supporto per input decimali (FTE) e note esplicative sul calcolo pro-capite.

## 2. Integrità dei Dati
- **Persistenza**: La funzione `handleSaveDraft` è stata estesa per includere i campi di `historicalData` e i nuovi campi di `annualData` (straordinario 2016, FTE 2018).
- **Isolamento**: Il *conservative merge* garantisce che i dati inseriti negli step precedenti o successivi non vengano sovrascritti erroneamente.

## 3. Verifiche Tecniche
- **Unit Test**: 97/97 PASS.
- **Regressioni**: 8/8 PASS.
- **Fixtures**: 8/8 PASS.
- **TypeScript**: 0 errori (nessun errore rilevato da `tsc --noEmit`).

## 4. Esperienza Utente (UX)
- Aggiunte sezioni informative ("Perché il 2016?", "Perché il 2018?") per guidare l'utente.
- Sidebar di riepilogo nello Step 3 per visualizzare l'impatto immediato dei valori inseriti sul limite calcolato.
- Feedback visivo durante il salvataggio dei dati.
