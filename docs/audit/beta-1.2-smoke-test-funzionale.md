# Report Smoke Test Funzionale — Beta 1.2

## 1. Strumenti Import/Export
- **Visibilità**: Barra "Strumenti import/export" presente nella pagina Dati Generali Ente.
- **Comandi**:
    1. `Genera lettera richiesta dati` ✅
    2. `Scarica backup Excel completo` ✅
    3. `Carica backup Excel completo` ✅
    4. `Scarica template CSV dati ente` ✅
    5. `Importa CSV dati ente` ✅

## 2. Verifica Workflow CSV
- **Template**: Scaricamento del file `.csv` con intestazioni corrette. ✅
- **Modale**: Apertura corretta dell'interfaccia di caricamento. ✅
- **Anteprima**: Visualizzazione comparativa tra dati attuali e dati importati. ✅
- **Validazione Anno**: Blocco dell'importazione in caso di discrepanza tra anno del file e anno attivo. ✅
- **Formato Numerico**: Supporto per virgola decimale italiana (es. 1.234,56). ✅

## 3. Verifica Workflow Lettera
- **Contesto**: Inserimento automatico dei dati dell'ente e segnaposto `[DA RICHIEDERE]` per i campi vuoti. ✅
- **Anteprima**: Preview formattata in tempo reale. ✅
- **Azioni**:
    - **Copia testo**: Funzionante negli appunti. ✅
    - **Download Markdown**: Generazione file `.md`. ✅
    - **Export PDF**: Generazione documento professionale tramite jsPDF. ✅

## 4. Esito Finale
Tutte le funzionalità introdotte con lo Sprint C.3 sono pienamente operative in ambiente Beta 1.2.
