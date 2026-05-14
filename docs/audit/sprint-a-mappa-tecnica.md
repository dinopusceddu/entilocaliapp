# Mappa Tecnica del Progetto - Sprint A

## Area: Costituzione Fondo Parte Stabile

| Area | File individuato | Funzione reale | Note | Rischio |
|---|---|---|---|---|
| UI - Pagina Principale | [FondoAccessorioDipendentePage.tsx](file:///src/pages/FondoAccessorioDipendentePage.tsx) | Pagina principale per la costituzione del fondo del personale (comparto). | Gestisce l'input e la visualizzazione delle voci del fondo. | Medio |
| UI - Helper Pagina | [FondoAccessorioDipendentePageHelpers.ts](file:///src/pages/FondoAccessorioDipendentePageHelpers.ts) | Helper per la logica di visualizzazione e gestione campi della pagina fondo. | Contiene mapping tra chiavi e label. | Basso |
| Registry/Definizioni | [fundFieldDefinitions.ts](file:///src/logic/fundFieldDefinitions.ts) | Definizione dei campi del fondo, inclusi metadati e riferimenti normativi. | Cruciale per mappare nuove voci. | Alto |
| Motore di Calcolo | [fundCalculations.ts](file:///src/logic/fundCalculations.ts) | Implementazione delle formule di calcolo per le varie voci del fondo. | Contiene la logica matematica. | Alto |
| Orchestratore Calcolo | [fundEngine.ts](file:///src/logic/fundEngine.ts) | Coordina l'esecuzione dei calcoli e la gestione dei risultati. | Gestisce il flusso dei dati tra input e output. | Medio |
| Verifiche Conformità | [complianceChecks.ts](file:///src/logic/complianceChecks.ts) | Controlli di conformità normativa (es. limite Art. 23 c. 2). | Implementa i vincoli di legge. | Alto |
| Tipi di Dominio | [types.ts](file:///src/domain/types.ts) | Definizioni dei tipi core (AnnualData, FondoAccessorioDipendenteData). | Definisce la struttura dati salvata. | Alto |
| Risultati Calcolo | [calculationResult.ts](file:///src/domain/calculationResult.ts) | Definizione della struttura dei risultati del calcolo. | Usato per passare i dati calcolati alla UI. | Medio |
| Persistenza | [SupabaseStateRepository.ts](file:///src/infrastructure/persistence/SupabaseStateRepository.ts) | Gestione del salvataggio e caricamento dello stato dell'applicazione. | Si occupa di salvare i dati nel database. | Basso |
| Tabella 15 | [Tabella15Page.tsx](file:///src/pages/Tabella15Page.tsx) | Pagina dedicata alla Tabella 15 (Personale in servizio). | Fornisce dati base per alcuni calcoli (es. monte salari). | Medio |

## Altri riferimenti utili
- `src/logic/art23Calculations.ts`: Calcoli specifici per il limite del salario accessorio.
- `src/data/strutturaFondo.json`: Probabile configurazione statica o template della struttura.
- `src/domain/snapshot.ts`: Gestione dei salvataggi (snapshot) del fondo.
