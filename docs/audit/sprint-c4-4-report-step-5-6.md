# Sprint C.4.4 — Report Step 5 e 6 Wizard

## 1. Stato Git
- **Branch corrente**: `feature/sprint-c4-1-wizard-base`
- **Stato Working Tree**: Tutte le modifiche per gli step 5 e 6 sono completate. Pronti per il commit.
- **MEMORIA_AI.md**: Rimasto ignorato.
- **Main**: Intatto.

## 2. Step Implementati
- **Step 5 — Parametri D.L. 25/2025**: Componente `WizardStepParametriDL252025` creato. Include input per l'incremento 0,14% (st_incrementoDL25_2025), dati per il limite 48% e calcolatore in tempo reale per verificare la conformità (sostenibilità 48% calcolata simulando dinamicamente il limite usando `calculateSimulazione`).
- **Step 6 — Parametri CCNL 2026**: Componente `WizardStepParametriCCNL2026` creato. Include campi per l'inserimento dell'incremento opzionale (0,22% permanente e una tantum) e calcolatore in tempo reale per la riduzione fissa relativa al conglobamento indennità comparto secondo Tabella C su 12 mensilità (usando la logica di `calculateCcnl2024Increases`).

## 3. Integrazione nel Container
- `DatiGeneraliWizard.tsx` è stato aggiornato per includere gli step 5 e 6.
- Aggiunto `fondoAccessorioDipendenteData` al meccanismo di conservazione dello stato locale `draftData`.
- Aggiornata la logica di dispatch in `handleSaveDraft` per memorizzare nel contesto globale in modo conservativo:
  - `st_incrementoDL25_2025` all'interno di `UPDATE_FONDO_ACCESSORIO_DIPENDENTE_DATA`
  - Dati simulatore (limite 48%) e `ccnl2024` all'interno di `UPDATE_ANNUAL_DATA`.

## 4. Test e Stabilità
- Tutte le verifiche TypeScript (`tsc --noEmit`) sono pulite.
- Le fix apportate sulle associazioni delle interfacce (`annualData.simulatoreInput`, `annualData.ccnl2024`, `fondoAccessorioDipendenteData.st_incrementoDL25_2025`) hanno allineato i componenti al modello TypeScript canonico.
- Esecuzione `vitest`: 97/97 superati. Nessuna regressione.
- Esecuzione scenari di calcolo storici (regression tests e verify fixtures): 8/8 superati. Il calcolo globale non ha risentito dell'aggiunta del wizard.
