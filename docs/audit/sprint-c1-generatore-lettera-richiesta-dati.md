# Proposta Generatore Automatico Lettera Richiesta Dati — Sprint C.1

L'applicazione può facilitare il reperimento dei dati necessari alla costituzione del fondo generando automaticamente una lettera formale pre-compilata.

## 1. Funzionamento
All'interno del Wizard, al termine dello Step 1 (o in una sezione dedicata), l'utente troverà un pulsante "Genera Lettera Richiesta Dati".

## 2. Campi Richiesti all'Utente (Input Manuale nel Generatore)
Alcuni dati non sono presenti nel modello del fondo e vanno inseriti per completare la lettera:
- `firmatario`: Nome del delegato sindacale o responsabile.
- `organizzazione`: Sigla sindacale o struttura di appartenenza.
- `data_lettera`: Data di emissione.

## 3. Campi Recuperati Automaticamente (Placeholder)
Il generatore utilizzerà i dati già inseriti nel wizard:
- `{{denominazione_ente}}` -> `annualData.denominazioneEnte`
- `{{anno_fondo}}` -> `annualData.annoRiferimento`

## 4. Workflow Generazione
1. L'utente apre il tool "Generatore Lettera".
2. Inserisce i dati del firmatario e l'organizzazione.
3. Visualizza un'**Anteprima Live** del testo (basata sul template Markdown).
4. Clicca su "Esporta PDF".
5. Il file PDF viene scaricato localmente (tramite library come `jspdf` o `react-pdf`).

## 5. Evoluzioni Future
- **Integrazione Allegati**: Possibilità di salvare la lettera generata tra i documenti dell'ente nell'app.
- **Export DOCX**: Supporto al formato Microsoft Word per personalizzazioni spinte (tramite `docx` library).
- **Template Multipli**: Possibilità di scegliere tra diversi toni di lettera (Standard, Sollecito, Diffida).

## 6. Sicurezza e Privacy
Nessuna informazione sensibile (nomi dipendenti, etc.) viene inclusa nella lettera. Vengono richiesti solo i totali e i parametri normativi.

---
*Proposta generatore completata per lo Sprint C.1.*
