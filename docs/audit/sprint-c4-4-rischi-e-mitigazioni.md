# Sprint C.4.4 — Rischi e Mitigazioni

## Rischi Identificati durante l'Implementazione
Durante l'implementazione degli Step 5 e 6, sono emersi alcuni rischi tecnici legati alla gestione dei dati in stato locale e alla validazione dinamica:

1. **Rischio: Disallineamento Tipi TypeScript (AnnualData vs SimulatoreInput vs FondoAccessorio)**
   - *Impatto*: I componenti UI potrebbero salvare o sovrascrivere valori in path sbagliati dell'oggetto `FundData`, causando perdita o reset dati nel momento di `saveState()`.
   - *Mitigazione Implementata*: La mappatura di `draftData` è stata controllata in profondità durante la fase di aggiornamento. Nel componente `WizardStepParametriDL252025` sono state inserite istruzioni esplicite per separare l'update verso `fondoAccessorioDipendenteData` e verso gli attributi profondi `annualData.simulatoreInput`.

2. **Rischio: Doppio conteggio 0.14% e Riduzioni Conglobamento**
   - *Impatto*: Entrare in schermata senza passare dalle funzioni core di calcolo e presentare somme errate in UI, o salvare dati derivati come dati di base.
   - *Mitigazione Implementata*: I risultati in UI sono strettamente calcolati via hook (`useMemo`) che riutilizzano `calculateSimulazione` e `calculateCcnl2024Increases`, evitando completamente la logica matematica clonata nei componenti.

3. **Rischio: Prop Mismatch in `DatiGeneraliWizard`**
   - *Impatto*: Le interfacce React per i componenti richiedevano una prop (`validationErrors`) che è stata poi ritenuta non utile negli input degli step attuali (dato che hanno validazioni custom inline o informative). Questo causava TypeScript fault.
   - *Mitigazione Implementata*: Le props inutilizzate sono state rimosse dalle interfacce per aderire ai principi clean code ed eliminare warning e block compiler.

## Mantenimento del Sistema
L'architettura del `draftData` conserva i principi originali. Un rischio futuro è l'aumento della payload di `handleSaveDraft` in `DatiGeneraliWizard.tsx`. Con l'aggiunta degli ultimi step si raccomanda di astrarre le chiavi specifiche e passare a payload più massivi ma sempre confinati e sicuri, limitandosi eventualmente al set di reducer standard anziché espandere le proprietà singole.
