# Piano di Implementazione Sprint C.2 — Importazione CSV Dati Generali

## Obiettivo
Sviluppare il sistema di importazione automatica dei dati generali dell'ente e dei parametri di base del fondo tramite file CSV, garantendo validazione, anteprima e integrità dei dati.

## Architettura Tecnica

### 1. Parsing
- Utilizzo di `PapaParse` per la lettura del file CSV.
- Configurazione: `delimiter: ";"`, `header: true`, `skipEmptyLines: true`.

### 2. Validazione (Layered)
- **Layer 1: Struttura**: Verifica presenza di tutte le colonne obbligatorie.
- **Layer 2: Tipi**: Validazione tipi di dato (Monetary, Boolean, Enum) tramite `Zod`.
- **Layer 3: Business Logic**: Controllo obbligatorietà condizionata (es. Numero Abitanti per Comuni).

### 3. Mapping
- Trasformazione delle chiavi CSV (snake_case) nelle chiavi tecniche del modello `FundData` (camelCase).
- Gestione dei dati annidati (`annualData.simulatoreInput`, `ccnl2024`, etc.).

### 4. UI/UX
- **Modale di Import**: Componente `CsvImportModal` riutilizzabile.
- **Preview**: Tabella comparativa (Valore Attuale vs Valore CSV).
- **Report Errori**: Elenco dettagliato di righe/colonne non valide con messaggi chiari.

## Fasi di Sviluppo
1. **Parser & Mapper**: Implementazione della logica di trasformazione in `src/logic/import/`.
2. **Validazione**: Definizione dello schema `Zod` in `src/schemas/importSchema.ts`.
3. **Componente UI**: Creazione della modale e integrazione nel wizard e nella pagina dati generali.
4. **Integrazione Stato**: Aggiornamento del `fundDataReducer` per gestire l'azione di import.

## Rischi e Mitigazioni
- **Sovrascrittura accidentale**: Obbligo di conferma esplicita dopo la preview.
- **Incoerenza dati**: Validazione rigorosa prima di permettere l'applicazione dei dati allo stato.

---
*Piano tecnico Sprint C.2.*
