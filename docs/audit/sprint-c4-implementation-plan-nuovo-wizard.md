# Implementation Plan — Sprint C.4: Refactoring Wizard Dati Generali Ente

## Obiettivo
Trasformare l'attuale form "Dati Generali Ente" in un wizard guidato a 10 step per ridurre il carico cognitivo e guidare l'utente nella raccolta dei dati essenziali per la costituzione del fondo.

## User Review Required
> [!IMPORTANT]
> Il wizard sostituirà l'attuale visualizzazione a singola pagina. Gli utenti potranno navigare tra gli step, ma il salvataggio definitivo avverrà al termine del percorso.

## Step del Wizard
1. **Anagrafica Ente**: Denominazione, Tipologia Ente.
2. **Anno di Riferimento**: Selezione dell'anno di esercizio.
3. **Importazione Rapida (Opzionale)**: Punto di accesso per l'import CSV implementato nella Beta 1.2.
4. **Dati Storici Vincolanti**: Fondo 2016 e parametri storici (Art. 23 c.2).
5. **Dati di Personale**: Consistenza FTE e media triennale.
6. **CCNL 2026**: Parametri specifici per il nuovo contratto (es. arretrati, indennità comparto).
7. **Limiti e Compliance**: Monte salari 2021 e soglie di spesa.
8. **Dati Opzionali**: Altri parametri non bloccanti.
9. **Generazione Lettera**: Punto di accesso al generatore lettera se mancano dati.
10. **Riepilogo e Conferma**: Preview dei dati inseriti e salvataggio in `fundData`.

## Proposti Cambiamenti

### [UI Components]
- **[NEW] `EntityWizardContainer.tsx`**: Componente principale che gestisce lo stato del wizard (step corrente, navigazione).
- **[NEW] `WizardStepRenderer.tsx`**: Switcher per il rendering dei singoli step.
- **[NEW] `WizardProgressBar.tsx`**: Indicatore visivo del progresso.
- **[MODIFY] `EntityGeneralInfoForm.tsx`**: Verrà refactorizzato per ospitare il nuovo wizard.

### [Logic]
- **`wizardState.ts`**: Gestione dello stato locale temporaneo prima del commit su `fundData`.
- **`wizardValidation.ts`**: Validazione incrementale per singolo step tramite Zod.

## Strategia di Migrazione
- Il wizard leggerà i dati iniziali da `fundData` (se esistenti).
- L'utente potrà chiudere il wizard in qualsiasi momento, ma i dati parziali verranno salvati solo se confermati nello step finale o tramite "Salva Bozza".

## Rischi e Mitigazioni
- **Rischio**: Perdita di dati se l'utente chiude il browser a metà wizard.
- **Mitigazione**: Implementazione di un meccanismo di auto-save locale (localStorage) o integrazione con la funzione "Salva Bozza" esistente.
