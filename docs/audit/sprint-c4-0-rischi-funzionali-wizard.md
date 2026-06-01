# Analisi Rischi Funzionali Wizard — Sprint C.4.0

Analisi dei rischi di regressione o perdita di funzionalità durante il refactoring della sezione Dati Generali in un wizard guidato.

| Rischio | Gravità | Campo coinvolto | Impatto | Mitigazione proposta |
| :--- | :--- | :--- | :--- | :--- |
| **Perdita campi storici 2016** | Alta | `fondo*2016` | Calcolo del limite Art. 23 c.2 errato per tutto il fondo. | Validazione bloccante nello Step 3; importazione automatica da `fundData` esistente. |
| **Perdita dati 2018** | Media | `fondo*2018`, `FTE2018` | Calcolo valore medio pro-capite 2018 errato. | Inserimento obbligatorio nello Step 4 se non pre-caricati. |
| **Confusione Riduzione vs Distribuzione Indennità** | Alta | `ivcConglobation`, `u_indennitaComparto` | Doppio conteggio o mancata decurtazione del fondo (Art. 60 CCNL 2026). | UI distinta nello Step 6 per la riduzione (decurtazione) e Step 7 per il personale (distribuzione). |
| **Errata gestione Monte Salari 2021** | Alta | `monteSalari2021` | Gli incrementi 0,14% e 0,22% verrebbero azzerati. | Campo obbligatorio nello Step 8 con help contestuale su cosa includere. |
| **Perdita dati D.L. 25/2025** | Media | `simStipendiTabellari2023`, etc. | Impossibilità di calcolare l'incremento potenziale 48%. | Step 5 dedicato interamente al simulatore con calcolo in tempo reale. |
| **Campi automatici resi manuali** | Media | FTE 2018 / FTE Anno Rif | L'utente potrebbe inserire dati incoerenti con la lista dipendenti. | Mantenere il toggle "Manuale/Automatico" identico alla logica attuale. |
| **Confusione tra CSV e Backup Excel** | Bassa | Intero stato | Caricamento di un CSV vecchio su un fondo già lavorato. | Warning chiaro nello Step 2 prima di sovrascrivere i dati con il CSV. |
| **Regressione Report PDF/Determina** | Bassa | `documentMetadata` | Documenti generati senza riferimenti (numero determina, data). | Step 10 con riepilogo metadati obbligatori per la stampa. |
| **Perdita Dati Opzionali** | Bassa | `proventiSpecifici` | Mancata inclusione di risorse variabili. | Step 8 include sezione "Avanzate" per proventi e PNRR. |

## Mitigazione Generale: La "Vista Completa"
Per evitare qualsiasi blocco operativo, la prima versione del wizard DEVE prevedere un pulsante "Switch a Vista Completa" che riporti l'utente all'interfaccia attuale a singola pagina, garantendo la continuità operativa in caso di bug nel wizard.
