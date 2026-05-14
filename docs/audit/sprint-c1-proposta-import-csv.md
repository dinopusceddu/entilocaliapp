# Proposta Tecnica Importazione CSV Dati Generali — Sprint C.1

Questa proposta delinea l'architettura e il flusso utente per l'importazione automatica dei dati generali dell'ente tramite file CSV.

## 1. Collocazione Funzionale
L'importazione deve essere disponibile in due punti:
1. **Wizard Iniziale**: Pulsante "Importa dati da CSV" nello Step 1 (Dati Ente).
2. **Pagina Dati Generali Ente**: Pulsante "Aggiorna da CSV" nella barra delle azioni.

## 2. Flusso Utente (UX)
1. L'utente clicca su "Importa/Aggiorna da CSV".
2. Si apre una modale con:
   - Link per scaricare il template CSV aggiornato.
   - Area di drag & drop per il file.
3. Caricamento del file e **Validazione Preventiva**:
   - Controllo struttura colonne.
   - Controllo tipi di dato e obbligatorietà (secondo il Dizionario Dati).
4. **Anteprima Dati**:
   - Tabella che mostra i dati letti dal file.
   - Evidenziazione di eventuali conflitti con i dati già presenti (es. Anno diverso, Denominazione diversa).
5. **Conferma Esplicita**:
   - L'utente deve confermare l'importazione con un pulsante "Conferma e Sovrascrivi".
6. **Esito**:
   - Messaggio di successo e aggiornamento istantaneo dello stato globale dell'app.

## 3. Gestione Errori e Rischi
- **Rischio Sovrascrittura**: L'importazione sovrascrive i campi `annualData`, `historicalData` e `simulatoreInput`. I dati relativi al personale analitico (già inseriti) non vengono toccati se non esplicitamente mappati nel CSV.
- **Errori di Formato**: Il parser (es. `PapaParse`) deve segnalare la riga e la colonna esatta in caso di errore.
- **Integrità Database**: L'operazione avviene solo in memoria locale fino al salvataggio manuale dell'utente ("Salva Bozza" o "Salva Definitivo").

## 4. Implementazione Tecnica (Preview)
- **Library**: `PapaParse` per il parsing CSV.
- **Validazione**: Schema `Zod` dedicato per la riga del CSV, derivato da `AnnualDataSchema`.
- **State Management**: Action dedicata `IMPORT_DATA_FROM_CSV` nel `fundDataReducer`.

## 5. Test Plan
- Unit test per il parser CSV con file validi e non validi.
- Test di integrazione per verificare l'aggiornamento corretto del `context` dopo l'importazione.
- Test di UI (Playwright) per il flusso di caricamento nella modale.

---
*Proposta tecnica completata per lo Sprint C.1.*
