# Walkthrough Sprint C.4.1 — Wizard Base Dati Generali Ente

In questo sprint abbiamo implementato l'architettura base per il nuovo wizard guidato di configurazione dell'ente, garantendo la parità funzionale con il sistema esistente e correggendo regressioni pregresse.

## Modifiche Principali

### 1. Architettura Wizard
È stato creato un nuovo container `DatiGeneraliWizard` che gestisce uno stato locale temporaneo (`draftData`). Questo permette all'utente di navigare e sperimentare senza alterare immediatamente il fondo globale, finché non decide di salvare esplicitamente i dati identificativi.

- **Stepper**: Supporta i 10 step definiti nell'audit.
- **Navigazione**: Pulsanti Avanti/Indietro con validazione contestuale.
- **Placeholder**: Gli step 3-10 sono predisposti con messaggi informativi per i futuri sprint.

### 2. Step 1: Identificazione Ente
Implementata la raccolta dei dati fondamentali:
- Denominazione, Anno di Riferimento.
- Tipologia Ente (con logica dinamica per abitanti e descrizione).
- Configurazione Dirigenza.

### 3. Step 2: Strumenti di Raccolta
Integrazione della barra strumenti esistente (`ExcelTools`) refactorizzata per essere "wizard-aware":
- L'importazione CSV popola il draft del wizard invece del fondo globale.
- Accesso diretto al generatore lettera e al backup Excel.

### 4. Vista Avanzata (Fallback)
Per garantire la continuità operativa, è stato inserito un toggle persistente che consente di passare in ogni momento alla visualizzazione classica (a 5 step/tab). I dati sono sincronizzati tra le due viste.

### 5. Fix Regressione Test
Corretto il file `src/logic/import/__tests__/csvMapper.test.ts` che falliva a causa di una gestione errata dei campi "invariati" durante l'importazione CSV.

## Verifiche Eseguite

### Test Automatici
- **TSC**: `npx tsc --noEmit` -> ✅ PASS
- **Unit Tests**: `npm run test -- --run` -> ✅ PASS (incluse regressioni corrette)
- **Regression Tests**: Fixtures validate -> ✅ PASS
- **Build**: `npm run build` -> ✅ PASS

### Sicurezza
- [x] `MEMORIA_AI.md` è correttamente ignorato da Git.
- [x] Nessuna credenziale o email sensibile introdotta nel codice.
- [x] Nessuna modifica a Supabase o dati remoti.

## Screenshot e Registrazioni
*(In attesa di cattura tramite browser tool)*
