# Architettura del Progetto - Stato Corrente

Questo documento fornisce una panoramica strutturata dell'architettura attuale dell'applicazione `entilocaliapp`, mappando i file principali alle loro responsabilità funzionali.

## 1. Tipi e Dominio
Questi file definiscono le strutture dati, le interfacce e gli schemi di validazione che rappresentano il dominio applicativo (Fondi, Personale, Calcoli).

| File | Descrizione |
| :--- | :--- |
| `src/types.ts` | Tipi generali dell'applicazione e delle entità principali. |
| `src/types/chat.ts` | Definizioni per l'interfaccia di messaggistica e AI. |
| `src/types/communications.ts` | Tipi per notifiche e circolari. |
| `src/types/compensiTypes.ts` | Definizioni specifiche per il calcolo dei compensi accessori. |
| `src/schemas/fundDataSchemas.ts` | Schemi di validazione Zod per i dati dei fondi e l'importazione Excel. |

## 2. Calcoli di Business (Business Logic)
Il "cuore" dell'applicazione, dove vengono applicate le regole del CCNL e le formule finanziarie.

| File | Descrizione |
| :--- | :--- |
| `src/logic/fundEngine.ts` | Motore centrale per l'elaborazione dei dati del fondo. |
| `src/logic/fundCalculations.ts` | Logica principale per il calcolo delle voci del fondo. |
| `src/logic/compensiCalculations.ts` | Calcolo delle retribuzioni e dei compensi accessori. |
| `src/logic/complianceChecks.ts` | Verifiche di conformità ai tetti di spesa e ai vincoli normativi (es. Art. 23 c. 2). |
| `src/logic/art23Calculations.ts` | Calcoli specifici per il limite del salario accessorio 2016. |
| `src/logic/arrearsCalculations.ts` | Calcolo degli arretrati contrattuali. |
| `src/utils/financialMath.ts` | Utility per calcoli finanziari ad alta precisione (usa `big.js`). |

## 3. Report ed Export
Servizi dedicati alla generazione di documenti in uscita e all'interoperabilità con Excel.

| File | Descrizione |
| :--- | :--- |
| `src/services/excelService.ts` | Integrazione con Excel (importazione dati e esportazione tabelle). |
| `src/services/pdfReportService.ts` | Generazione di report PDF per la costituzione del fondo. |
| `src/services/xlsReportService.ts` | Generazione di rapporti dettagliati in formato XLS. |
| `src/services/reportService.ts` | Servizio orchestratore per la reportistica aggregata. |
| `src/services/determinaTemplate.ts` | Logica per la generazione di bozze di atti amministrativi (Determine). |

## 4. Persistenza e Annualità
Gestione dello stato persistente, connessione al database e gestione dei contesti temporali (Esercizi Finanziari).

| File | Descrizione |
| :--- | :--- |
| `src/services/supabase.ts` | Client e metodi di base per l'interazione con Supabase (DB). |
| `src/services/stateService.ts` | Logica di salvataggio e recupero dello stato complesso dei fondi. |
| `src/contexts/AppContext.tsx` | Gestione del contesto globale: Ente attivo, Anno di riferimento e Persistent State. |
| `supabase/migrations/` | Definizione dello schema SQL, tabelle, viste e policy RLS. |

## 5. Navigazione e Workflow UI
Componenti che governano il flusso di lavoro dell'utente e la struttura dell'interfaccia.

| File | Descrizione |
| :--- | :--- |
| `src/App.tsx` | Router principale dell'applicazione (definizione dei percorsi). |
| `src/contexts/AppContext.tsx` | Gestisce anche lo stato della navigazione e le redirezioni post-login. |
| `src/pages/` | Directory contenente le visualizzazioni principali (HomePage, DataEntryPage, etc.). |
| `src/hooks/useFundCalculations.ts` | Hook che collega la UI alla logica di calcolo (Workflow dati). |

## Nota operativa
Le attività di refactor e validazione vengono eseguite esclusivamente sulla copia locale del progetto.
Il repository GitHub sarà aggiornato solo dopo verifica funzionale locale, build riuscita e superamento dei test.
---
*Ultimo aggiornamento: 16 Aprile 2026*
