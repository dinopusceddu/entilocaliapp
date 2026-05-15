# Sprint C.4.2 — Architettura di Ingresso Configurazione Fondo

## Nuova Struttura di Navigazione

L'accesso alla sezione **Configurazione Fondo** è stato riprogettato per separare chiaramente il percorso di configurazione iniziale (Wizard) dalla gestione tecnica analitica (Costituzione Fondo).

### 1. Landing Page (Entry Point)
Situata in `DataEntryPage.tsx`, la nuova schermata iniziale offre due opzioni:
- **Accedi alle informazioni di base**: Avvia il Wizard focalizzato.
- **Vai alla costituzione del fondo**: Accede alla vista tecnica completa.

### 2. Percorso Focalizzato (Wizard)
- Utilizza il nuovo `NavigationScope.WIZARD`.
- **Layout**: La barra laterale dell'applicazione viene nascosta (`App.tsx` aggiornato).
- **Interfaccia**: Rimangono visibili solo lo stepper, il contenuto del wizard e i controlli di navigazione.
- **Obiettivo**: Ridurre il carico cognitivo e guidare l'utente nell'inserimento dei dati core.

### 3. Percorso Tecnico (Costituzione Fondo)
- Mantiene la compatibilità con l'interfaccia a 5 step già esistente.
- **Layout**: Sidebar visibile e navigazione completa attiva.
- **Controllo Integrità**: Introdotto un modal di conferma (`ConfirmGoToFundModal.tsx`) se i dati minimi (Ente, Tipologia, Storici 2016) risultano incompleti o mancanti.

## Componenti Introdotti

- `ConfigurazioneFondoLanding.tsx`: Gestore della schermata di scelta.
- `WizardDataStatusPanel.tsx`: Pannello riassuntivo dello stato di completamento dei dati.
- `ConfirmGoToFundModal.tsx`: Modal di avviso per dati incompleti.

## Gestione dello Stato

- Lo stato `viewMode` in `DataEntryPage.tsx` gestisce la navigazione interna alla pagina.
- Il `NavigationScope` globale viene aggiornato per coordinare la visibilità della sidebar.
- Nessuna modifica ai dati persistenti in Supabase; il lavoro rimane isolato nel branch locale.
