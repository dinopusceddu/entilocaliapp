# Sprint C.4.5 — Rischi e Mitigazioni

## Rischi Identificati e Mitigati nello Sprint C.4.5

### Rischio 1: Alterazione Motori di Calcolo in Fase di Validazione (Step 9)
**Contesto**: Lo Step 9 deve validare la coerenza dei dati immessi dal Wizard (es. il rispetto del tetto 48% D.L. 25/2025). Il calcolo è complesso e viene gestito in `fundEngine.ts`. Invocare tali calcolatori in UI espone al rischio di effetti collaterali se il calcolatore altera lo stato o se lo Step 9 lanciasse azioni di `dispatch`.
**Mitigazione**: Il componente `WizardStepCoerenzaDati` usa il calcolatore `calculateSimulazione` fornendo solo un clone delle properties estratte dal `draftData` (stato locale di React), intercettando in un blocco `try/catch` possibili eccezioni da dati non compilati, bloccandole e trasformandole in avvisi visuali, senza mai sfiorare il Context globale dell'app.

### Rischio 2: Confusione su Riduzione Indennità di Comparto (Step 7)
**Contesto**: Il conglobamento ex Art. 60 impone una riduzione del fondo. L'utente potrebbe erroneamente includere il calcolo delle vecchie tredicesime mensilità o confonderlo con l'indennità distribuita ai dipendenti, compromettendo le successive proiezioni in Vista Tecnica.
**Mitigazione**: In `WizardStepPersonale`, la tabella C è fissa su 12 mensilità (esplicitato sia testualmente sia nel codice matematico). Inoltre, è stato inserito un discalimer blu esplicito che rassicura: la riduzione fissa del conglobamento calcolata qui non intacca o pregiudica la quota di indennità in ripartizione.

### Rischio 3: Incoerenza di Ripartizione per i Tipi (Step 8)
**Contesto**: I dati di Step 8 vengono passati in dispatch verso il `fundData` centrale. `st_art79c1_art67c1_unicoImporto2017` e risorse EQ sono i pilastri del calcolo, un loro malposizionamento distruggerebbe l'architettura tecnica del fondo.
**Mitigazione**: Esteso in sicurezza il `handleSaveDraft` in `DatiGeneraliWizard.tsx`, istanziando dispatch puliti dedicati (`UPDATE_FONDO_ACCESSORIO_DIPENDENTE_DATA` e `UPDATE_FONDO_ELEVATE_QUALIFICAZIONI_DATA`). Si garantisce l'assenza di payload spurie.

### Rischio Residuo per Sprint Successivo (C.4.6)
**Manutenzione a lungo termine**: L'oggetto `draftData` è pesante, perché clona in React State l'intero `FundData`. Per mitigazioni future post-release, potrebbe essere utile dividere in `reducer` locali il wizard, così da limitare gli sprechi di memory footprint, sebbene l'ottimizzazione corrente sia performante e reattiva sufficientemente.
