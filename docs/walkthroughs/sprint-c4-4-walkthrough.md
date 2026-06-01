# Sprint C.4.4 — Walkthrough

## Obiettivo dello Sprint
Implementazione degli Step 5 e 6 del wizard "Dati Generali Ente", coprendo l'inserimento e la convalida immediata dei parametri essenziali derivanti dal D.L. 25/2025 e dal CCNL Funzioni Locali 2026.

## Modifiche Principali

### 1. Step 5 — Parametri D.L. 25/2025
- Creato componente `WizardStepParametriDL252025.tsx`.
- Integrazione completa dei campi `simStipendiTabellari2023`, `simFondoStabileAnnoApplicazione`, `simRisorsePOEQAnnoApplicazione`, ecc., all'interno del nodo corretto `annualData.simulatoreInput`.
- Pannello di validazione live: valuta e controlla dinamicamente la conformità al tetto del 48% tramite l'invocazione locale di `calculateSimulazione`. Fornisce warning e indicatori di coerenza espliciti.

### 2. Step 6 — Parametri CCNL 2026
- Creato componente `WizardStepParametriCCNL2026.tsx`.
- Supporto input di tassi percentuali per l'incremento opzionale del 0,22% sia permanente che una tantum.
- Tabella esplicativa con i calcoli del conglobamento basati sulla mensilità fissa a 12, senza applicazione di 13^ mensilità, calcolata direttamente grazie a `calculateCcnl2024Increases`.

### 3. Integrazione nel Container e Bugfix TypeScript
- Il container primario `DatiGeneraliWizard.tsx` è stato ampliato per supportare gli step 5 e 6.
- Sono stati individuati e rimossi errori TypeScript dovuti a riferimenti incrociati di proprietà (es: la destinazione dell'incremento dello 0.14% posizionato nativamente su `FondoAccessorioDipendenteData`).
- Il metodo `handleSaveDraft` invia adesso payload aggiornate ai resolver e dispatcher centrali, memorizzando accuratamente input, configurazioni ccnl e indici del fondo base.

## Verifiche Eseguite

### Test Tecnici
- **Unit Test**: 97/97 PASS.
- **Regressioni**: 8/8 PASS. Tutte le fixture del motore fondo e calcoli accessori sono superate, garantendo stabilità retrocompatibile.
- **TypeScript & Build**: Nessun difetto. Zero warnings residui.

### UX
- Inserite info-card, colori differenziati per step (es. verde per successo 48%, ambra per allerta) e helper testuali contestualizzati.

## Prossimi Passi (Sprint C.4.5)
- Implementazione degli ultimi step rimanenti (Personale, Risorse Iniziali, Coerenza).
- Revisione ultima dello step finale di riepilogo dati.
