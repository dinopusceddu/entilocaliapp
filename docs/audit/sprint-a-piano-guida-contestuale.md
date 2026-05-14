# Piano Guida Contestuale Costituzione Fondo - Sprint A

## Obiettivo
Fornire all'utente un supporto decisionale e normativo immediato (voce-per-voce) direttamente all'interno della pagina di costituzione del fondo. L'obiettivo è ridurre gli errori di inserimento e aumentare la consapevolezza normativa del responsabile del servizio.

## Struttura Dati Consigliata
Ogni voce del fondo (`FieldDefinition`) dovrà essere arricchita con i seguenti campi minimi:

| Campo guida | Descrizione | Obbligatorio |
|---|---|---:|
| **Titolo Guida** | Nome esteso e chiaro della voce. | Sì |
| **Descrizione Funzionale** | Cosa rappresenta la voce in termini operativi. | Sì |
| **Quando si usa** | Condizioni di applicabilità (es. "solo se l'ente ha la dirigenza"). | Sì |
| **Fonte del Dato** | Dove reperire l'importo (es. "Tabella 15 del Conto Annuale, colonna S600"). | Sì |
| **Riferimento Normativo** | Citazione esatta dell'articolo del CCNL o Legge. | Sì |
| **Effetto su Limiti** | Indica se la voce rileva ai fini del tetto Art. 23 c. 2. | Sì |
| **Errori Frequenti** | Alert su casistiche di errore comuni (es. "non inserire qui gli arretrati"). | No |

## Mappatura Iniziale (Esempi)

| Campo app | Titolo guida | Stato contenuto | Fonte base | Priorità |
|---|---|---|---|---|
| `st_unicoImporto2017` | Unico Importo Consolidato 2017 | Presente (Base) | Atto costituzione 2017 | Alta |
| `st_art79c1_art67c2a_incr8320` | Incremento €83,20/unità | Presente (Base) | Conto Annuale 2015 | Alta |
| `st_art58c1_incr014_ms2021` | Incremento 0,14% MS 2021 | Da creare | Monte Salari 2021 | Critica |
| `st_art60c2_decurtComparto` | Riduzione Indennità Comparto | Da creare | Tabella C CCNL 2026 | Critica |
| `st_incrementoDL25_2025` | Incremento D.L. 25/2025 (48%) | Da creare | Spesa Tabellare 2023 | Critica |
| `vn_arretrati_2024_2025` | Arretrati 2024-2025 | Da creare | Calcolo arretrati 0,14%/0,22% | Alta |

## Proposta Tecnica
1. **Metadata Enhancement**: Aggiornare `fundFieldDefinitions.ts` per includere gli oggetti di guida per ogni chiave.
2. **Componente UI**: Implementare un componente `NormativePopover` o `ContextualInfo` che visualizzi questi dati al passaggio del mouse o al click su un'icona "info".
3. **Integrazione Guida PDF**: Inserire link diretti a pagine specifiche della guida PDF (se possibile tramite anchor o riferimenti testuali) all'interno del popover.
4. **Validazione dinamica**: Se una voce è soggetta al limite del 48%, il popover deve mostrare dinamicamente il calcolo della capienza residua.

## Priorità di Implementazione
1. **Voci CCNL 2026**: Copertura immediata per le nuove voci che generano più confusione (0,14%, 0,22%, Riduzione Comparto).
2. **Limiti di Finanza Pubblica**: Spiegazione dettagliata della deroga del 48% rispetto al tetto 2016.
3. **Voci Storiche**: Completamento per le voci Art. 67 e Art. 79 (storicizzate).
