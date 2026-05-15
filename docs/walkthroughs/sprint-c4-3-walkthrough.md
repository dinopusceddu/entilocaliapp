# Sprint C.4.3 — Walkthrough

## Obiettivo dello Sprint
Implementazione degli Step 3 e 4 del wizard "Dati Generali Ente", focalizzati sulla raccolta dei dati storici 2016 e 2018 necessari per il rispetto del limite Art. 23 c. 2 del D.Lgs. 75/2017.

## Modifiche Principali

### 1. Step 3 — Dati Storici 2016
- Creato componente `WizardStepDatiStorici2016.tsx`.
- Introdotta sezione di riepilogo "Totale Limite 2016" con calcolo automatico in tempo reale.
- Aggiunta possibilità di "Override Manuale" per casi eccezionali.
- Badge informativi per spiegare la rilevanza normativa del 2016.

### 2. Step 4 — Dati Storici 2018
- Creato componente `WizardStepDatiStorici2018.tsx`.
- Supporto per dati economici e consistenza del personale (FTE e Teste).
- Integrazione note esplicative per l'adeguamento pro-capite del fondo.

### 3. Integrazione Wizard
- Aggiornato `DatiGeneraliWizard.tsx` per orchestrare i nuovi step.
- Estesa la funzione di salvataggio per includere `historicalData`.

## Verifiche Eseguite

### Test Tecnici
- **Unit Test**: 97/97 PASS.
- **Regressioni**: 8/8 PASS.
- **TypeScript**: Validazione superata.
- **Build**: Successo.

### Test Funzionali (Browser)
- Verificato il calcolo del totale limite 2016 al variare degli input.
- Verificato che i valori FTE accettino decimali con la virgola.
- Verificata la persistenza tra i vari step durante la navigazione.
- Verificato il passaggio alla "Vista Tecnica" e la coerenza dei dati visualizzati.

## Prossimi Passi (Sprint C.4.4)
- Implementazione degli Step 5 e 6: Parametri D.L. 25/2025 e CCNL 2026.
- Rafforzamento delle validazioni di coerenza tra abitanti e tipologia ente.
