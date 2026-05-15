# Sprint C.4.2 — Verifica Flussi Utente

## Scenari di Test Verificati

### Scenario 1: Primo Accesso (Dati Incompleti)
1. L'utente clicca su "Configurazione Fondo".
2. Appare la Landing Page con avviso "Dati Incompleti" nel pannello di stato.
3. Clic su "Vai alla costituzione del fondo".
4. **Esito**: Appare il modal di conferma con avviso di dati mancanti.
5. L'utente sceglie "Prosegui comunque" ed entra nella vista tecnica (sidebar visibile).

### Scenario 2: Percorso Guidato (Focused Mode)
1. Dalla Landing Page, l'utente clicca su "Inizia Wizard".
2. **Esito**: Si apre il wizard a 10 step. La barra laterale dell'app scompare.
3. L'utente naviga tra Step 1 e Step 2.
4. Clic su "Schermata Iniziale".
5. **Esito**: Ritorno alla landing page, la sidebar riappare.

### Scenario 3: Passaggio da Wizard a Costituzione
1. Durante il wizard (Step 1), l'utente decide di passare alla vista tecnica.
2. Clic su "Vai alla Costituzione Fondo" (nello header del wizard).
3. **Esito**: Si apre la vista tecnica a 5 step, sidebar visibile. I dati inseriti nel wizard (se non salvati) non vengono persi nello stato locale del componente wizard finché non viene smontato, ma la vista tecnica legge lo stato globale.

### Scenario 4: Persistenza e Integrità
1. L'utente importa un CSV nello Step 2 del Wizard.
2. Passa alla Vista Tecnica.
3. Verifica la presenza dei dati importati.
4. **Esito**: I dati importati tramite il wizard (draft) devono essere confermati/salvati per essere visibili globalmente, oppure il wizard deve gestire il commit parziale come implementato nello sprint C.4.1.
