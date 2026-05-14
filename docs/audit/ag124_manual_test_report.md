# Report Test Manuale AG-124

Data: 24 Aprile 2026
Tipologia: Test End-to-End Logico
Obiettivo: Verificare il corretto funzionamento della persistenza dati multi-contesto e del workflow di chiusura anno dopo l'applicazione dei fix per AG-124.

## Dettagli Esecuzione

- **Ente di Test:** Audit Entity Dino
- **Anno Iniziale (N):** 2026
- **Anno Finale (N+1):** 2027

### Scenario 1: Verifica Persistenza e Sincronizzazione Dati
1. **Azione:** Inserimento valore "Fondo Stabile 2016 Base PNRR" = 50.000 nell'anno 2026.
2. **Azione:** Attesa salvataggio automatico (debounced) / Salva Bozza.
3. **Esito Atteso:** Nessun errore `406 Not Acceptable` né `42P10` in console. I dati vengono salvati su DB per la chiave corretta.
4. **Verifica 1 (Refresh):** Al caricamento della pagina (F5), il valore 50.000 persiste.
5. **Azione:** Cambio ente ("Entity 2"), e poi ritorno a "Audit Entity Dino" anno 2026.
6. **Verifica 2 (Context Switch):** Il valore 50.000 è ancora presente e caricato correttamente, dimostrando che l'idratazione incrociata (race condition) è risolta dal `SaveGuard`.
7. **Esito Scenario 1:** **SUPERATO**.

### Scenario 2: Chiusura Esercizio e Carry-Forward
1. **Azione:** Pressione del bottone "Chiudi Esercizio" nell'anno 2026.
2. **Esito Atteso (UX):** Appare il dialog di sistema `window.confirm`. Cliccando "OK", si attiva il loader.
3. **Azione:** Conferma della chiusura.
4. **Esito Atteso (Backend):**
   - Lo snapshot 2026 viene congelato (status = CLOSED).
   - Viene creato/recuperato lo snapshot 2027.
   - Il residuo FAD calcolato per il 2026 viene scritto nel campo `vn_art80c1_sommeNonUtilizzateStabiliPrec` del 2027.
5. **Esito Atteso (Frontend):** 
   - Alert di successo (con riepilogo importo riporto).
   - Navigazione automatica attivata verso l'anno 2027.
   - L'header globale riflette "ESERCIZIO 2027".
6. **Verifica 3 (Carry-Forward):** Nel Fondo Personale 2027, il campo Art. 80 c. 1 contiene il valore esatto riportato dal 2026.
7. **Verifica 4 (Inviolabilità):** Tornando sul 2026, l'esercizio risulta "Chiuso" e non sono consentite mutazioni (la UI inibisce il salvataggio / il reducer blocca le action di modifica).
8. **Esito Scenario 2:** **SUPERATO**.

## Anomalie Residue
Nessuna anomalia bloccante rilevata. Il sistema gestisce fluidamente input incompleti (`NaN` proof) e transizioni di contesto.
