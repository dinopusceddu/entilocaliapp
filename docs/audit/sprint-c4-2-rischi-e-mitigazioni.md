# Sprint C.4.2 — Rischi e Mitigazioni

## Analisi dei Rischi Architetturali

### 1. Navigazione e Sidebar
- **Rischio**: L'utente potrebbe rimanere "bloccato" nella modalità senza sidebar se il ritorno al NavigationScope ordinario fallisce.
- **Mitigazione**: Implementata logica di fallback in `DataEntryPage.tsx` che garantisce il ripristino dello scope `FONDO` all'uscita dal wizard o al ritorno alla landing.

### 2. Frammentazione dello Stato
- **Rischio**: L'introduzione di una landing page e tre modalità di visualizzazione potrebbe rendere difficile la gestione dei dati non salvati.
- **Mitigazione**: Il Wizard continua a usare `draftData` per l'isolamento, mentre la vista tecnica e la landing leggono direttamente dal reducer globale. Il passaggio alla vista tecnica è preceduto da una verifica di completezza.

### 3. Confusione tra "Dati Generali" e "Costituzione Fondo"
- **Rischio**: L'utente potrebbe non capire la differenza tra le due opzioni.
- **Mitigazione**: Inserite descrizioni dettagliate nelle card della landing page e un pannello di stato ("Stato dati iniziali") che chiarisce cosa manca per una costituzione corretta.

### 4. Regressioni su Funzioni Esistenti
- **Rischio**: La modifica a `App.tsx` e `MainLayout.tsx` potrebbe impattare altre sezioni.
- **Mitigazione**: Lo scope `WIZARD` è stato aggiunto come caso specifico; tutte le altre sezioni (Dashboard, Normativa, ecc.) continuano a funzionare con la logica standard. Test di regressione passati con successo.
