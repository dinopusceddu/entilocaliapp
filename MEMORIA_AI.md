# 🧠 MEMORIA AI - Contesto di Progetto

> [!IMPORTANT]
> **REGOLE OPERATIVE MANDATORIE (AMBITO LOCALE)**
> 1. Lavorare **esclusivamente** sul file system locale della macchina dell'utente.
> 2. **MAI** aprire GitHub o fare operazioni sul repository remoto (`push`, `pull`, `commit`, ecc.).
> 3. Utilizzare **solo** l'URL locale `http://localhost:5000/` per le verifiche browser.
> 4. Utilizzare **esclusivamente** le credenziali: `dino.pusceddu@cgil.lombardia.it` / `Admin123!`.
> 5. Non utilizzare mai credenziali di esempio o placeholder.

Questo file funge da "memoria e contesto" per l'Assistente AI (Google Antigravity). Quando si avvia una nuova sessione su un computer o terminale diverso, chiedere all'AI di rileggere questo file per recuperare tutto lo storico del progetto.

## 📌 1. Contesto Generale (L'Applicazione)
L'applicazione è uno strumento web per il calcolo, la gestione e la distribuzione del **Fondo Salario Accessorio / Risorse Decentrate per i dipendenti degli Enti Locali**.
- Permette di inserire i dati finanziari e del personale.
- Effettua calcoli complessi rispettando decurtazioni, limiti di legge e regole contrattuali (Decurtazioni stabili per conglobamento, Incremento Decreto PA, ecc.).
- Valida la conformità normativa e restituisce eventuali errori o warning.
- Gestisce la corretta distribuzione delle risorse in base al grado (fondo accessorio personale non dirigente ed EQ).

## 💻 2. Stack Tecnico & Architettura
- **Frontend / Framework**: React con TypeScript (`.tsx`, `.ts`). Utilizza Vite per il build.
- **State Management**: React Context (`AppContext.tsx`) per gestire globalmente dati come `fundData`, `calculatedFund`, `complianceChecks`, ecc.
- **CSS / UI**: Tailwind CSS v3 installato **localmente** via PostCSS plugin (`tailwind.config.js`, `postcss.config.js`, `src/index.css`). NON usa il CDN — funziona completamente offline.
- **Logica di Business Core**: Concentrata nella cartella `src/logic/` (es. `fundCalculations.ts`, `complianceChecks.ts`).

## 🌐 4. Informazioni per la Verifica Browser
- **URL Locale**: `http://localhost:5000/` (L'app deve essere avviata su questa porta).
- **ADMIN Login**: `dino.pusceddu@cgil.lombardia.it` / `Admin123!`
- **GUEST Login**: `prova@fpcgilprova.it` / `Admin123!`

## 🛠️ 3. Cosa abbiamo fatto finora (Storico Lavori Recenti)
1. **Aggiornamento Contrattuale**: Adattati tutti i riferimenti normativi al nuovo **"CCNL Funzioni Locali 23.02.2026"**.
2. **Calcolo Elevate Qualificazioni (EQ)**: Implementazione di calcoli automatici per la parte EQ.
3. **Logica Percentuali Fondo**: Affinata la logica delle percentuali di input nella pagina della Distribuzione.
4. **Fix sui Conflitti GitHub**: Pulizia architetturale salvando il progetto nel repository `entilocaliapp`.
5. **Criticità e Compliance**: Migliorato il componente dedicato alla UI degli alert per i `complianceChecks`.
6. **Rimozione Matricola Dipendente (Data Minimization)**: Rimossa la matricola per conformità GDPR/GDL.
7. **Refactoring Calcoli Fondo (Configurazione Dinamica)**: Ristrutturata la funzione `calculateFadTotals` via JSON.
8. **Miglioramenti Pagina Panoramica (HomePage)**: Implementato calcolo automatico, hero banner e KPI sub-fondi. Aggiunto widget Limite Art. 23.
9. **Inserimento Manuale Risorse Personale**: Implementata modalità override manuale per "Indennità di Comparto" e "Progressioni Economiche" (PEO).
10. **Conteggio Personale Equivalente (FTE)**: Aggiunta la possibilità di inserire manualmente il totale del personale equivalente (FTE) nell'anno corrente. Il valore è integrato nella logica di calcolo dell'adeguamento del Limite Art. 23 c. 2. È stata aggiunta una nota descrittiva sulla logica di calcolo (testa, part-time, cedolini).
11. **Refactoring PDF Report (Premium)**: Ricreata completamente la generazione del PDF "Riepilogo Generale" trasformandolo in un documento professionale di 8 pagine, con grafici a barre, KPI box bordeaux, barre di progresso visuali per i limiti e tabelle di conformità semaforiche.
12. **Esportazione XLS Nativa Premium (ExcelJS)**: Sostituito il vecchio sistema XLS-HTML con un motore nativo basato su `ExcelJS`. Il file include ora: tema bordeaux coerente con l'app, Quadro A (Risorse), Quadro B (Utilizzi), e Quadro C (Verifica Limite Art. 23) con decurtazioni automatiche e segnalazione esito verde/rosso.
13. **Sistema Segnalazione Feedback/Bug**: Progettata e avviata l'implementazione di un sistema di feedback interno per segnalare bug o richieste di modifiche, con area dedicata agli amministratori e persistenza tramite Supabase.
14. **Sincronizzazione Real-time Denominazione Ente**: Implementata la sincronizzazione immediata tra il form di inserimento e l'header dell'applicazione. La modifica del nome dell'ente viene ora persistita correttamente nella tabella `entities` del database Supabase.
15. **Fix Creazione Nuovi Utenti**: Corretta la Edge Function `create-user` per garantire che ogni nuovo utente riceva automaticamente un'entità predefinita e un record in `user_app_state`, risolvendo il problema della mancata visibilità degli utenti appena creati.
16. **Architettura Modulare a "Ambiti" (Scopes)**: Riprogettata l'intera navigazione per isolare le aree funzionali (Fondo, Comunicazioni, Admin).
17. **Dashboard Hub**: Trasformata la Dashboard in un portale di atterraggio pulito (hub), rimuovendo statistiche pesanti e rendendola un portale di accesso rapido ai moduli.
18. **Navigazione Normativa**: Implementato deep linking tramite `AppContext` (`selectedArticleId`, `selectedSchedaId`, `selectedParereId`). La `RicercaNormativaPage` ora indirizza correttamente all'elemento specifico invece che al default del modulo.
    - **UI Cleanup**: Rimosso pulsante "Salva Bozza" nell'ambito `NORMATIVA` e rimossa sezione "Bussola Normativa" dalle pagine di configurazione del fondo (`FondoAccessorioDipendentePage`, `DistribuzioneRisorsePage`).
    - **Resilienza ARAN**: Logica di "Smart Splitting" per gestire risposte incorporate nel quesito nei dati ARAN.
19. **Area Comunicazioni**: Integrata struttura per Messaggi, Notifiche e Feedback con navigazione dedicata.
20. **Import/Export Excel Massivo (Dati Fondo)**: Sviluppato un sistema avanzato di gestione dati tramite fogli di calcolo. 
    - Mappatura di oltre **150 variabili** (Dati Generali, Storici, CCNL 2024-26, Risorse Stabili/Variabili, EQ, Segretario, Dirigenza e Simulatore).
    - Logica di "Deep Merge" nel reducer per importare dati massivi senza sovrascrivere configurazioni pre-esistenti non mappate.
    - Salvataggio automatico sul database al completamento del caricamento del file.
21. **Sincronizzazione Permanente Utenti (SQL Trigger)**: Sviluppato uno script SQL che automatizza la creazione del profilo database (`user_app_state`) tramite un trigger Postgres. Questo garantisce che ogni nuovo utente autenticato sia immediatamente visibile e gestibile dall'amministratore, prevenendo utenti "orfani".
22. **Ripristino Moduli Funzionali Storici**: Reintegrati i componenti precedentemente rimossi o sostituiti da placeholder: Fondo Dirigenza, EQ, Segretario, Sistema Feedback reale e Gestione Anni.
23. **Ottimizzazione Flusso "Costituzione Fondo"**: Riorganizzato l'ambito Fondo secondo un flusso logico sequenziale (Personale -> Risorse -> Fondi Specifici -> Assistente AI -> Compliance -> Destinazione -> Report). 
24. **Ripristino Assistente AI (Chatbot)**: Reintegrato il modulo `ChecklistPage` come "Verifica Assistita AI", permettendo verifiche basate sul regolamento e sui dati real-time.
25. **Pulizia e Consolidamento App.tsx**: Rimossi placeholder ed eliminati import inutilizzati per ottimizzare la struttura della navigazione a "Ambiti".
26. **Sistema Notifiche Real-time**: Implementata pagina dedicata per la gestione delle notifiche (lette/non lette) con area di invio riservata agli amministratori.
27. **Controllo Accessi Dashboard (RBAC)**: Limitata la visibilità del modulo "Gestione Utenti" esclusivamente ai profili Administrator.
28. **Ottimizzazione UI Dashboard**: Rimosso l'header "Home" ridondante e reso il logo cliccabile per il ritorno rapido all'Hub centrale.
29. **Riorganizzazione Sidebar Fondo (Sequenziale)**: Riordinata la sidebar del modulo Fondo per riflettere il processo naturale di configurazione (Panoramica -> Dati -> Personale -> Risorse -> Dettagli -> Conformità -> Chatbot -> Report).
30. **Decoupling Report e AI**: Separati i moduli "Richiedi Info" (Chatbot) e "Stampe e Report" (Documenti ufficiali) per una migliore chiarezza funzionale.
31. **Dynamic Context Reflection**: Inserimento automatico dell'anno di riferimento nelle voci della sidebar (es. "Personale in servizio nell'anno 2026").
32. **Priorità Configurazione Iniziale**: Spostato il modulo "Enti e Annualità" come prima voce della Dashboard per guidare l'utente all'impostazione del contesto.
33. **Icone Coerenti (Material UI)**: Rinnovato il set di icone della sidebar for una maggiore corrispondenza visiva con i contenuti delle pagine.
34. **Ripristino Analisi Feedback (Admin)**: Reintegrata la pagina di gestione feedback per gli amministratori nell'ambito "Comunicazioni". Implementata visibilità condizionale nella sidebar (solo per ruolo ADMIN) e configurazione delle rotte in `App.tsx`.
35. **Avvio e Verifica Ambiente Locale**: Avviata l'applicazione in ambiente di sviluppo (`npm run dev`) e verificata la corretta operatività del login, della dashboard hub e del sistema di controllo accessi (RBAC).
36. **Cleanup Pagina "Stampe e Report"**: Rimosse le card segnaposto delle funzionalità non ancora implementate (Relazione illustrativa, Relazione tecnico-finanziaria ed Esportazione dati per conto annuale) per migliorare l'esperienza utente e la pulizia della UI.
37. **Fix Build Cloudflare & TypeScript**: Risolti errori di compilazione TS in `App.tsx` (import inutilizzati) e `EntityYearManagementPage.tsx` (tipo errato per prop `size`), garantendo il deploy corretto su Cloudflare.
38. **Configurazione Moduli Dinamica**: Implementata logica di visibilità condizionale in `App.tsx`. Il modulo "Fondo Dirigenza" viene ora nascosto automaticamente se l'ente è configurato come "senza dirigenza" nei Dati Generali.
39. **Modulo 'Calcolo straordinari e indennità'**: Rifatto integralmente il modulo (precedentemente 'Calcolatore Compensi') per allinearlo al CCNL 23.02.2026. Include nuove tabelle stipendiali, calcolo automatico del rateo 13ª nello straordinario, differenziali per aree e sezioni speciali, e rebranding completo dell'interfaccia.
40. **Onboarding Guidato & Zero-Entity**: Disabilitata la creazione automatica di enti predefiniti. I nuovi utenti ora atterrano su una dashboard che li guida alla creazione del primo ente, prevenendo dati "fantasma" all'ingresso.
41. **Integrità Cancellazione Utente**: Implementata logica di eliminazione completa tramite Edge Function (`delete-user`) e vincoli `ON DELETE CASCADE` nel database. L'eliminazione di un utente ora rimuove anche tutti i suoi enti e record di stato associati, garantendo una pulizia totale.
42. **Rebranding: "Toolbox Funzioni Locali"**: Consolidata l'identità dell'app. Rinominato il calcolatore compensi e centralizzato il nome tramite la costante `APP_NAME`. Aggiornati i riferimenti normativi (Art. 74, Art. 62, Art. 30) nelle pagine dedicate.
43. **Affinamento Calcolo Compensi (Basi ARAN)**: Perfezionata la logica del modulo straordinari/indennità distinguendo tra tre basi di calcolo (Art. 74 CCNL 2022):
    - **Base b (Straordinario)**: Con rateo 13ª, escluse RIA e Comparto.
    - **Individuale c (Turno)**: Base b (senza 13ª) + RIA. Compenso come sola maggiorazione oraria.
    - **Globale di Fatto d (Supplementare)**: Individuale c + 13ª + Comparto + Accessori.
    - **Divisori**: Implementati 156 (36h) e 151,66 (35h).
44. **Sistema Profili Utente (Decoupling)**: Implementata la tabella `public.profiles` per separare l'identità dell'utente dallo stato dell'applicazione (Zero-Entity Onboarding).
45. **Sincronizzazione Automatica & Fix RLS**: Configurato un trigger robusto su `auth.users` e risolto l'errore di "infinite recursion" nelle policy RLS tramite la funzione `check_is_admin()`.
46. **Filtro Ricerca Destinatari (Searchable Select)**: Introdotto un componente `UserSearchSelect` con autocompletamento per la selezione dei destinatari nelle comunicazioni, ottimizzato per gestire liste utenti numerose.
47. **Potenziamento Area Comunicazioni**: Aggiunta la funzionalità di invio Circolari e Messaggi Diretti per gli amministratori, con gestione dello stato di lettura e possibilità di eliminazione.
48. **Fix Schema 'notifications'**: Corretta l'assenza della colonna `user_id 49. **Integrazione Area Normativa (Completata Fase Hardening)**
    - Implementata e rafforzata una pipeline di ingestione JSON in `scripts/doc-ingestion/` per trattare i DOCX.
    - Output in `src/data/normativa/`: `raccolta.articles.json` (169 articoli reali), `guida.schede.json` (46 schede tematiche strutturate), `aran.pareri.json` (362 pareri master), `normativa.indiceAnalitico.json` (133 voci), `normativa.searchIndex.json` (577 entry unificato).
    - Script npm (`npm run normativa:build`) automatizza il flusso. QA integrato con report JSON in `scripts/doc-ingestion/reports/`.
 50. **Hardening Definitivo Pipeline Normativa (Aprile 2026)**
    - **Struttura Gerarchica**: Ogni articolo della raccolta ha ora `strutturaNormativa: NormativaUnita[]` con commi (1346 estratti), lettere (incluse `e bis)`), punti e appendici annidate ricorsivamente.
    - **Parsing Liste HTML (ol/ul)**: Il parser usa metadati `listType` e `listIndex` per distinguere correttamente commi da lettere da puntati, anche senza pattern testuali espliciti.
    - **ID Stabili Multi-Fonte**: Gli articoli di CCNL diversi (22/2022, 21/2018, 23/2026, ecc.) hanno ID unici `{codice}-art-{num}`. Deduplicazione automatica con suffisso `-v{n}` per i rari duplicati.
    - **Parser ARAN Master (03b)**: Separazione euristica quesito/risposta con 15+ pattern di inizio risposta. 103/362 pareri con risposta separata, 259 con solo quesito (struttura sorgente monoblocco).
    - **Matching Molti-a-Molti (06)**: Pareri ↔ Articoli ↔ Schede ↔ Indice via 4 dimensioni (riferimenti espliciti, hashtag, Jaccard, sinonimi istituti). 345/362 pareri linkati ad articoli, 362/362 a schede.
    - **Indice Analitico Completo**: 133 voci con `label`, `subLabel`, `pageRefsOriginali`, `relatedArticleIds`, `relatedSchedaIds`, `relatedParereIds`.
    - **Registry Riferimenti Esterni**: `riferimenti.esterni.json` (versionato) per D.Lgs. 165/2001, TUEL, Statuto Lavoratori ecc. con link Normattiva in `_blank`.
    - **Frontend Aggiornato**: `ArticoloViewer` con rendering ricorsivo condivisibili, `SchedaGuidaViewer` con blocchi standard colorati, `PareriAranPage` con filtro per argomenti.
    - **TypeScript**: Aggiornate le interfacce complete in `types.ts`. Backward compat via alias per vecchie prop.
    - **Build & Quality**: `npx tsc --noEmit` → 0 errori. `npm run build` → build OK in 20.27s.

## 📐 Schema Dati Normativa Corrente
| File | Schema | Entries |
|------|--------|---------|
| `raccolta.articles.json` | `NormativaArticle` (con `strutturaNormativa: NormativaUnita[]`) | 169 |
| `guida.schede.json` | `NormativaSchedaGuida` (con `blocchi: NormativaBlocco[]`) | 46 |
| `aran.pareri.json` | `NormativaParereAran` (con `quesito/risposta` separati, `schedeCollegate[]`) | 362 |
| `normativa.indiceAnalitico.json` | `IndiceAnaliticoEntry` | 133 |
| `normativa.searchIndex.json` | `NormativaIndexEntry` | 577 |
| `riferimenti.esterni.json` | `NormativaExternalRef` | 5 |

51. **Fix Pagina Bianca all'Avvio (Aprile 2026)**
    - **Causa 1**: Tailwind era caricato via CDN esterno. Senza internet, nessun CSS → UI invisibile → pagina bianca.
    - **Causa 2**: `supabase.auth.getSession()` in `AuthContext.tsx` bloccava il render indefinitamente se Supabase era irraggiungibile (`loading = true` permanente).
    - **Fix Tailwind locale**: Installato `tailwindcss@3`, `autoprefixer`, `postcss` come devDependency. Creati `tailwind.config.js` (con colori custom del tema), `postcss.config.js`, `src/index.css` (`@tailwind base/components/utilities` + stili custom). Rimosso CDN dall'HTML.
    - **Fix Auth timeout**: Aggiunto timeout di 5 secondi in `AuthContext.tsx` — se Supabase non risponde, `loading` viene forzato a `false` e l'app mostra il login.
    - **Risultato**: App avvia offline. Tutti gli stili sono corretti. Verificato con screenshot browser.
    - ⚠️ **Nota**: Modifiche a `postcss.config.js`/`tailwind.config.js` richiedono **riavvio manuale di `npm run dev`** (l'HMR non li rileva).

52. **Modernizzazione Dashboard e Navigazione Hub**: Scambiati i moduli "Normativa e Contratti" e "Comunicazioni" sia nella Dashboard che nella configurazione delle rotte in `App.tsx` per riflettere le priorità d'uso dell'utente.
53. **Navigazione Globale e Deep Linking Normativo**: 
    - Implementato stato di selezione globale (`selectedArticleId`, `selectedSchedaId`) in `AppContext` per permettere la comunicazione tra moduli diversi.
    - **Indice Analitico Interattivo**: I link dell'indice ora portano direttamente all'articolo o alla scheda specifica, selezionando automaticamente il tab corretto.
    - **Auto-Espansione Sidebar**: Implementata logica in `RaccoltaPage` che espande automaticamente la sezione (Titolo/Capo) dell'articolo selezionato all'atterraggio.
54. **Bug Fix: Resilienza Visualizzazione Pareri ARAN**:
    - Risolto un bug critico che impediva la lettura delle risposte in centinaia di pareri ARAN dove il testo era unito al quesito nel database.
    - Implementata logica di **"Smart Splitting"** basata su `\n` in tutti i visualizzatori (`PareriAranPage`, `ArticoloViewer`, `SchedaGuidaViewer`).
    - Garantita l'espandibilità totale dei pareri lunghi, assicurando che nessuna risposta rimanga troncata o inaccessibile.

## 🚀 Stato Attuale: PRODUCTION-READY
La feature Normativa è completata con navigazione profonda funzionante e visualizzazione resiliente dei pareri ARAN. Dashboard riorganizzata secondo le priorità utente. Build e typecheck green.

55. **Finalizzazione Normativa e Integrità Dati (Aprile 2026)**:
    - **Encoding Globale**: Risolti definitivamente i problemi di codifica caratteri (€ e lettere accentate) in tutti i file JSON tramite script di bonifica dedicato.
    - **Ripristino "Fondo Perseo Sirio"**: Recuperata la scheda mancante correggendone il titolo e l'ID nel database della Guida.
    - **Rendering Tabelle Premium**: Implementato un parser Markdown in `SchedaGuidaViewer.tsx` per visualizzare le tabelle dei compensi e dei differenziali con uno stile professionale e bordato.
    - **Fix Navigazione Ricerca**: Corretto il bug del deep-linking; le pagine ora inizializzano lo stato locale dal contesto globale all'avvio, garantendo l'atterraggio immediato sull'articolo o scheda corretta.
56. **Affidabilità Centro Notifiche**:
    - **Badge Visibile Sempre**: Spostato l'indicatore delle notifiche non lette sul pulsante principale del menu utente (trigger), rendendolo visibile anche a menu chiuso.
    - **Cleanup UI Notifiche**: Rimosso il pulsante "Chiudi" ridondante dal modal delle notifiche per evitare duplicati con il componente `Modal` standard.
57. **Manutenzione UI Normativa**: Completata la rimozione dei pulsanti "Salva Bozza" e del widget "Bussola Normativa" dalle pagine interattive del fondo quando navigate tramite l'ambito Normativa, per evitare confusione tra consultazione e configurazione.

---
58. **Sistema Gestione Pareri ARAN v2 (Workflow Redazionale Supabase)**:
    - **Architettura a Due Livelli**: Transizione da dataset solo-statico a un sistema con database di staging su Supabase (`pareri_aran_staging`) per la revisione editoriale e file JSON statico per il frontend pubblico.
    - **Data Modeling Esteso**: Adottato `aranId` numerico come chiave canonica universale. Introdotto supporto nativo per alias storici (`codiciSecondari`) per mantenere la compatibilità con codici legacy (es. RAL431, CFL72).
    - **Pipeline di Manutenzione CLI**: Sviluppata una suite di script in `scripts/doc-ingestion/`:
        - `normativa:bootstrap`: Sincronizzazione iniziale dei pareri esistenti verso Supabase.
        - `normativa:stage`: Rilevamento automatico di nuovi pareri o modifiche dal file TXT master via Hash SHA-256.
        - `normativa:publish`: Esportazione selettiva dei record approvati (`isCurrent`) nel JSON statico pubblico.
        - `normativa:reconcile` & `normativa:import-legacy`: Recupero e riconciliazione automatica di pareri storici tramite algoritmi di similarità testuale (Jaccard).
    - **Pannello Admin Redazionale**: Creata la pagina `AdminPareriPage.tsx` per permettere agli amministratori di revisionare i draft, correggere metadati e promuovere versioni specifiche.
    - **Consolidamento Dati**: Dataset pubblico elevato a **379 pareri totali** (362 recenti + 17 storici recuperati). Rimosso il file obsoleto `guida.pareriAran.json`.

*Ultimo aggiornamento automatico: 15 Aprile 2026 — Implementato sistema gestione pareri ARAN v2 con workflow redazionale su Supabase.*

59. **Portale Ingestione Web & Correlazione Automatica (Aprile 2026)**:
    - **Ingestione Senza Terminale (No-CLI)**: Implementata la possibilità per gli amministratori di caricare il file `pareri_aran_funzioni_locali.txt` direttamente dalla UI dell'app, eliminando la necessità di script da riga di comando per l'aggiornamento.
    - **Motore di Correlazione Intelligente**: Sviluppata logica di auto-abbinamento che collega istantaneamente i nuovi pareri agli articoli del CCNL e alle schede della Guida basandosi sulla risonanza semantica dei tag e dei titoli.
    - **Utility Browser-side (`pareriIngestion.ts`)**: Migrata la logica di parsing, hashing (SubtleCrypto SHA-256) e separazione quesito/risposta in una utility React-friendly, garantendo integrità dei dati nel browser.
    - **UI di Validazione Anteprima**: Aggiunta una sezione di preview in `AdminPareriPage.tsx` che mostra statistiche sui record rilevati (Nuovi, Modificati, Invariati) e permette la validazione dei link prima del commit su Supabase.
    - **Ottimizzazione Workflow**: Consolidata la separazione tra ambiente di Staging (Supabase) e Production (Static JSON), con l'ingestione web che alimenta i moduli "Draft" and "Review" per la revisione editoriale finale.

60. **Consolidamento Dominio Canonico (AG-101)**:
    - Creazione della struttura `src/domain/` con separazione netta tra `enums.ts`, `valueObjects.ts`, `types.ts` e `index.ts`.
    - Isolamento del nucleo applicativo del fondo dagli aspetti UI e infrastrutturali.
    - Conversione di `src/types.ts` e `src/enums.ts` in bridge legacy per garantire la retrocompatibilità totale senza rotture nel frontend o nei context.
    - Validazione tramite suite di regressione AG-002 (8/8 test superati).

61. **Refactoring Import Business Logic (AG-102)**:
    - Migrazione selettiva degli import in `src/logic/` verso il dominio canonico `src/domain/`.
    - Disaccoppiamento del motore di calcolo dal bridge legacy per 7 file core.
    - Validazione completa tramite suite di regressione (8/8 successi) e build di produzione.

62. **Refactoring Algoritmico del Motore (AG-103)**:
    - Trasformazione di `calculateFundCompletely` in un orchestratore sottile in `src/logic/fundEngine.ts`.
    - Estrazione delle logiche di calcolo puro (Art. 23 c. 2, CCNL 2024, sotto-fondi) in funzioni esportate in `src/logic/fundCalculations.ts`.
    - Sono rimasti invariati: nome funzione, firma e comportamento, mentre è cambiata la collocazione fisica dell'export/import per alcuni consumer.
    - Validazione superata con successo tramite suite di regressione (8/8 test superati) e build di produzione.

63. **Stabilizzazione API Pubblica del Motore (AG-104)**:
    - Creazione del barrel file `src/logic/index.ts` come punto di ingresso unico per i consumer esterni.
    - Migrazione di 10 consumer (UI, servizi, script) verso la nuova API pubblica per isolarli dalla struttura interna.
    - Definizione di un'API minima e consumer-driven basata sui nomi reali delle funzioni.
    - Validazione completa tramite suite di regressione (8/8 successi), fixture verification e build di produzione.

*Ultimo aggiornamento automatico: 16 Aprile 2026 — Completato AG-104: Stabilizzazione API pubblica del motore verificata al 100%.*

64. **Rifinitura Architetturale Core/Accessory (AG-105)**:
    - Separazione esplicita tra API Core (`src/logic/index.ts`) e API Accessorie (`src/logic/accessory.ts`).
    - Migrazione di tutti i consumer esterni verso i bundle di competenza (Motore fondo vs Utility UI/Reportistica).
    - Risoluzione delle ultime 3 eccezioni residue di AG-104 tramite inclusione di costanti e funzioni specialistiche (Compensatore, IVC) nel barrel accessorio.
    - Validazione completa tramite build di produzione e suite di regressione (8/8 successi).

*Ultimo aggiornamento automatico: 16 Aprile 2026 — Completato AG-105: Separazione core/accessory stabilizzata e verificata.*

65. **Estrazione Layer Applicativo (AG-106)**:
    - Creazione della cartella `src/application/` per separare l'orchestrazione dei workflow dallo stato UI.
    - Estrazione di `performFundCalculationWorkflow` per gestire il ciclo di vita del calcolo (validazione, motore, compliance, salvataggio).
    - Estrazione di `stateWorkflow.ts` per la gestione di entità, annualità e persistenza (Supabase).
    - Refactoring di `AppContext.tsx` per ridurlo a un "Thin Context" focalizzato solo su React state e wiring.
    - Validazione completa superata (Build, Type check e Regression Test 8/8).

66. AG-110: Stabilizzazione Autorizzativa e Filtro Enti. Introdotta distinzione tra ruolo globale (`currentUser.role`) e di contesto (`contextRole`). Implementato filtraggio per `user_id` nel repository enti. 100% test verdi.
67. **Centralizzazione Autorizzativa (AG-111)**: Migrazione della logica di controllo permessi in `authorizationPolicy.ts`. Rimosse verifiche hardcoded `role === 'ADMIN'` dai componenti UI.
68. **Fix Regressione Icone (AG-112)**: Risolto crash in pagina messaggi dovuto a import mancanti di `lucide-react` (icona `Mail`) dopo il refactoring AG-111.
69. **Registro Moduli e Test Environment (AG-113)**: Creazione di `moduleRegistry.ts` per la definizione centralizzata dei moduli. Predisposizione ambiente di test UI con Vitest e JSDOM.
70. **Stabilizzazione Visibilità (AG-114)**: Corretta la visibilità del modulo "Comunicazioni" per il ruolo GUEST e implementato redirect automatico per rotte non autorizzate.
71. **Matrice Autorizzativa Esplicita (AG-115)**: Implementazione matrice di accesso basata su permessi granulari. Aggiunti test di regressione per la policy autorizzativa.
72. **Unificazione Dominio Canonico (AG-116)**: Eliminazione definitiva dei tipi duplicati tra `src/types.ts` e `src/domain/`. Consolidamento del layer Domain come unica fonte di verità.
73. **Motore di Calcolo Canonico (AG-117)**: Introduzione di `CalculationResult` come DTO strutturato e immutabile. Eliminazione degli adapter legacy (`fundAdapter.ts`) e centralizzazione dei controlli di conformità nel flusso di calcolo.
74. **Hardening Motore e Invarianza Numerica (AG-118)**:
    - **Stato Zero Any**: Eliminati tutti i cast `as any` dai file core del motore (`fundEngine.ts`, `fundCalculations.ts`, `fundWorkflow.ts`, `complianceChecks.ts`) e dal context applicativo.
    - **Eliminazione Legacy**: Rimozione definitiva di `CalculatedFund`, `fundAdapter.ts` e mapper obsoleti. `CalculationResult` è ora l'unico DTO canonico.
    - **Invarianza Numerica (8/8)**: Raggiunta la coincidenza totale con la baseline di regressione tramite allineamento tecnico dei campi per il Limite 2016.
    - **Protocollo di Chiusura**: Definita procedura di validazione mandatoria a 5 step (TSC, Build, Vitest, Fixtures, Regression).

*Ultimo aggiornamento automatico: 20 Aprile 2026 — Completato AG-118: Hardening totale del motore e invarianza numerica verificata.*
75. **Fine-tuning Struttura Dati e Normalizer (AG-119)**: Ottimizzato il layer di normalizzazione per supportare in modo resiliente le fixture legacy e i valori manuali di "Personale in servizio". Aggiornato il DTO `NormalizedInput` con campi di override per progressioni e indennità.
76. **Integrazione Presenter Layer e Final Verification (AG-120)**: Finalizzato il `pdfReportService.ts` per consumare esclusivamente il `ReportViewModel` canonico, completando il disaccoppiamento dei layer. Validazione finale tramite suite di regressione superata con successo (8/8 test OK).

*Ultimo aggiornamento automatico: 20 Aprile 2026 — 77. **Audit e Fix Caricamento Contesto Attivo (AG-122)**:
    - **Root Cause**: Iniezione di placeholder demo e flag di caricamento globali errati.
    - **Fix**: Eliminazione placeholder fisse, reset per-ente del load flag, sincronizzazione nome ente da fonte autoritativa.

78. **Audit Forense e Protezione Dati (AG-122B)**:
    - **Fix Architetturale**: Introdotta la guardia `hasLoadedCurrentYear` per prevenire salvataggi preventivi di stati non inizializzati durante il boot.

79. **Hardening Definitivo Contesto Attivo (AG-122C)**:
    - **Root Cause Residua**: Vulnerabilità della guardia booleana globale a race condition durante cambi rapidi di ente/anno.
    - **Fix Strutturale**: Sostituzione della guardia booleana con `hydratedSnapshotKey` (formato `${entityId}:${year}`). 
    - **Logica di Protezione**: Il risparmio preventivo è consentito SOLO se la chiave in memoria corrisponde esattamente al contesto attivo. Invalidazione totale su logout, cambio ente e cambio anno.
    - **Verifica**: Creato test ostile `contextRace.test.ts` (Double Switch stress test). Suite di 46 test passata. Verifica browser conferma stabilità totale al refresh e assenza di placeholder.

*Ultimo aggiornamento automatico: 20 Aprile 2026 — Completato AG-122C: Blindatura definitiva dell'integrità dei dati tramite guardia keyed contestuale.*

80. **Fix Chiusura, Idratazione e Input PNRR (AG-123)**:
    - **Chiusura Esercizio**: Risolto l'errore "Dati di contesto mancanti" integrando `SET_NORMATIVE_DATA` nel reducer e implementando l'auto-idratazione in `closeCurrentYear`.
    - **Idratazione Automatica**: Implementato ricalcolo automatico (`performFundCalculation`) al cambio ente/anno in `switchYearAtomic`.
    - **Correzione PNRR**: Rimosso auto-popolamento forzato; il campo ora permette l'input manuale con validazione e hint del massimo (5% fondo stabile 2016).

*Ultimo aggiornamento automatico: 22 Aprile 2026 — Completato AG-123: Stabilizzazione workflow chiusura e idratazione automatica.*

81. **Stabilizzazione Integrità Dati e Context Awareness (AG-124)**:
    - **Fix Reidratazione**: Risolto il bug del reset a € 0,00 al cambio ente/anno tramite il refactoring di `saveState` e `switchYearAtomic`. Introdotta la possibilità di passare un `fundDataOverride` per evitare race condition tra caricamento DB e stato React.
    - **Hardening Chiusura**: Implementato switch automatico all'anno successivo dopo la chiusura positiva dell'esercizio corrente, garantendo la visibilità immediata del riporto FAD.
    - **Context Awareness**: Integrato il nome dell'ente attivo e l'anno di esercizio nell'header globale dell'applicazione per migliorare l'orientamento dell'utente.
    - **UI PNRR**: Migliorato il feedback visuale per il campo Incremento PNRR, esplicitando la natura manuale dell'input e il limite massimo calcolato.


82. **Ripristino Distribuzione Automatica e Workflow Carry-Forward (AG-124B)**:
    - **Ripartizione Performance**: Ripristinata la logica di saturazione automatica deterministica. La "Performance Organizzativa" assorbe ora il 100% del residuo del budget base dopo la sottrazione della quota individuale, garantendo una "Rimanenza" sempre pari a zero.
    - **Logica Risparmi & Consuntivo**: Il flag "Modalità consuntivo" è stato stabilizzato nel reducer (gestione atomica) per garantirne la persistenza e reidratazione. I campi "Risparmi" sono editabili solo in questa modalità e vengono azzerati automaticamente se disattivata.
    - **Carry-Forward Art. 59 c. 1**: Consolidato il flusso di riporto. Solo le somme esplicitamente inserite nei campi "Risparmi" (p_ e u_) concorrono al carry-forward verso l'anno N+1, con destinazione univoca nel campo "Somme non utilizzate esercizi precedenti (stabili)" (`vn_art80c1_sommeNonUtilizzateStabiliPrec`).
    - **Disponibile Contrattazione**: Uniformata la formula in tutta l'applicazione come `Totale da Distribuire - Somma Utilizzi Parte Stabile (Art. 80 c. 1)`.

83. **Fix Attivazione Anni e Switch Contestuale (AG-125)**:
    - **Bug Riprodottto**: Identificato errore bloccante nel tentativo di attivare un nuovo anno partendo da un esercizio `CLOSED` (es. Audit Entity Dino 2026).
    - **Root Cause**: Il workflow di switch tentava un salvataggio preventivo atomico dello stato corrente; se l'anno era chiuso, la policy di sicurezza bloccava la scrittura, annullando l'intero cambio anno.
    - **Soluzione**: Inserita guardia in `switchActiveYear` per saltare il salvataggio preventivo se l'anno corrente è già `CLOSED`.
    - **Verifica**:
        - **Runtime**: Test A (Audit Entity Dino) OK, Test B (Non-regressione) OK, Test C (Chiusura) OK.
        - **Automated**: Aggiunti test unitari in `snapshotWorkflow.test.ts` (6/6 passati).
    - **Stato**: Ticket CHIUSO.

*Ultimo aggiornamento automatico: 24 Aprile 2026 — Completato AG-125: Risoluzione bug attivazione anni chiusi e validazione workflow.*

84. **Audit Operativo Roadmap (Aprile 2026)**:
    - **Classificazione**: Eseguito audit strutturato degli sprint. Sprint 0, 1 e 2 dichiarati `IMPLEMENTATO E VERIFICATO`. Sprint 3 identificato come primo sprint `PARZIALE`.
    - **Baseline**: Confermata invarianza numerica con 8/8 test di regressione superati.
    - **Ripartenza Controllata**: Scelta dello **Sprint 3 (Calcolo Riduzione)** come nuova priorità per consolidare l'architettura.

85. **Sprint 3: Consolidamento Modulo Calcolo Riduzione (Fase Finale)**:
    - **Stato**: **IMPLEMENTATO E VERIFICATO** (27 Aprile 2026).
    - **Modulo Canonico**: `src/logic/calculation/reductionCalculations.ts` gestisce ora tutte le decurtazioni (Taglio DL 78, ATA/PO, EQ, CCNL 2026, Art. 23, Straordinario).
    - **Rimozione Duplicazioni**: Il modulo `fundCalculations.ts` è stato refactorizzato per delegare il calcolo numerico al nuovo modulo, eliminando ricalcoli dispersi.
    - **Test Unitari**: Implementati in `reductionCalculations.test.ts` (6/6 casi passati: null input, absolute values, sums, specific funds, Art 23).
    - **Invarianza**: Verificata tramite regression suite (8/8 scenari OK).

86. **Sprint 4: Chiusura Esercizio e Riporto Automatica Economie**:
    - **Stato**: **CHIUSO** (27 Aprile 2026).
    - **Workflow Chiusura**: Implementato `yearClosureWorkflow.ts` con transazione atomica: snapshot CHIUSO (immutabile) -> calcolo risparmi -> iniezione riporto anno N+1.
    - **Calcolo Carry-Forward**: Modulo `closureCalculations.ts` estrae i risparmi dai campi `p_` e `u_` (solo modalità consuntivo).
    - **Protezione Dati**: Modifiche bloccate sia a livello di Reducer che di Repository per esercizi con stato `CLOSED`.
    - **Invarianza e Riporto**: Verificato runtime che 1.500€ di risparmi nell'anno 2029 compaiano correttamente nell'anno 2030 come `vn_art80c1_sommeNonUtilizzateStabiliPrec`.
    - **Test Unitari**: `closureCalculations.test.ts` copre 3/3 scenari (FAD, Zero, Residui informativi altri fondi).

87. **Sprint 5: Generatore Tabella 15 del Conto Annuale**:
    - **Stato**: **CHIUSO** (27 Aprile 2026).
    - **Schema e DTO**: Definito `Tabella15Result` in `src/domain/tabella15.ts`. Introdotto attributo `tabella15Column` in `FieldDefinition` per il mapping istituzionale.
    - **Mapper Canonico**: Implementato `src/logic/calculation/tabella15Mapper.ts` che trasforma i risultati del motore in dataset per il Conto Annuale senza ricalcoli di business logic.
    - **Interfaccia Utente**: Realizzata `src/pages/Tabella15Page.tsx` con anteprima in tempo reale delle voci mappate (codice colonna, descrizione, importo e sorgente dati).
    - **Export Dedicato**: Implementati generatori XLSX e CSV in `src/services/documents/tabella15XlsService.ts`, integrati nella pagina dei report.
    - **Tracciabilità**: Ogni voce mappata conserva il riferimento alla sezione di origine (`source`) e alla descrizione originale.
    - **Test Unitari**: Implementata suite `tabella15Mapper.test.ts` con copertura su mapping colonne, totali di sezione e integrità del DTO (3/3 test PASS).
    - **Integrità**: Il mapper consuma direttamente `CalculationResult`, garantendo coerenza tra UI e reportistica ufficiale.
88. **Sprint 6: Modulistica amministrativa completa**:
    - **Stato**: **CHIUSO** (27 Aprile 2026).
    - **DocumentFactory**: Introdotta `DocumentFactory.ts` come entry point unico per la generazione di documenti amministrativi certificati.
    - **Presenter Documentale**: Implementato `documentPresenter.ts` (`DocumentViewModel`) per isolare i template dalla business logic di calcolo.
    - **Modulistica Migrata**: Implementati i template V2 per **Determinazione di Costituzione** e **Relazione Tecnico-Finanziaria** (TXT).
    - **Integrità**: I template non contengono più formule di business; leggono dati pre-calcolati e formattati dal presenter.
    - **UI**: Integrata card "Modulistica Amministrativa Certificata" nella pagina dei report con download istantaneo.
    - **Test**: Implementata suite `documentPresenter.test.ts` (PASS) e validazione tipi con `tsc`.
    - **Prossima Priorità**: Sprint 7 — Consolidamento User Experience e Dashboard Direzionale.

89. **Correzione post-Sprint 5: Controlli di Conformità e Persistenza Contesto**:
    - **Stato**: **CHIUSO** (28 Aprile 2026).
    - **Compliance Checks**: Ripristinata e ampliata la logica di `verificaCorrispondenzaRisorseVincolate` nel modulo `complianceChecks.ts` (aggiunte spese giudizio e ISTAT). Introdotti nuovi controlli per l'uso improprio di risorse variabili nei differenziali (Error), la mancanza del conglobamento 2026 (Warning) e l'eccedenza dell'incremento 0,22% sul MS 2021.
    - **UI Compliance**: Modificato `CompliancePage.tsx` e `CalculationResult.ts` per raggruppare i controlli legati alla "Corrispondenza voci a destinazione vincolata" in card specifiche, visibili quando l'app si trova in modalità Distribuzione.
    - **Persistenza Contesto**: Implementato salvataggio atomico su `localStorage` (`fl_last_entity_id`, `fl_last_year`) al variare della selezione (`switchEntity`, `switchYearAtomic`). Aggiunta logica di reidratazione in `loadEntitiesWorkflow` per ripristinare in automatico l'ultimo ente/anno attivo all'avvio o al refresh della pagina, abbandonando il default forzato sul primo ente disponibile.
    - **Test & Verifica**: Vitest suite verde. Browser automation (Runtime) ha verificato con successo la stabilità del context persistito al reload della sessione (`location.reload()`).

90. **Fix Persistenza Contesto Utente e Bootstrap con Reidratazione Sicura**:
    - **Stato**: **COMPLETATO** (28 Aprile 2026).
    - **User-Scoped Context**: Abbandonate le chiavi globali e separate per ente e anno. Introdotta chiave atomica `fl_last_context_<userId>` contenente `{ entityId, year, updatedAt }`.
    - **Bootstrap Integrato**: Modificato `loadEntitiesWorkflow` per identificare l'ultimo contesto salvato dell'utente corrente (o operare un fallback sicuro su DB) e restituire la configurazione risolta ad `AppContext.tsx`.
    - **Reidratazione Automatica**: Invocata `switchYearAtomic` all'avvio dell'applicazione. Il sistema reidrata e visualizza immediatamente l'ultimo snapshot valido al login/refresh senza innescare scritture non autorizzate sui dati reali (grazie alla protezione keyed `${entityId}:${year}`).
    - **Verifica**: 100% test superati e validazione runtime cross-user positiva.

91. **PDF della Determina con metadati amministrativi persistiti**:
    - **Stato**: **COMPLETATO** (28 Aprile 2026).
    - **Persistenza**: Introdotto il blocco `documentMetadata` dentro `AnnualData` (e `AnnualDataSchema` Zod) per salvare stabilmente numero determina, date, verbali e firma per ogni contesto Ente/Anno.
    - **Presenter & Factory**: Esteso `createDocumentViewModel` per ricevere i metadati e mappare le variabili al template. `DocumentFactory` espone il metodo `generateDeterminaDocumentPDF()`.
    - **Nuova Pipeline PDF**: Creato `pdfDeterminaService.ts` che realizza l'export PDF della determina senza alcuna formula di calcolo, attingendo esclusivamente al ViewModel.
    - **Modifica UI**: Aggiunta sezione "Metadati Amministrativi Determina" in `ReportsPage.tsx` per permettere modifica, persistenza e scaricamento.

92. **Implementazione Richiami Normativi e Pop-up nella Costituzione del Fondo (Aprile 2026)**:
    - **Single Source of Truth**: Estesa `getFadFieldDefinitions` in `FondoAccessorioDipendentePageHelpers.ts` per centralizzare i metadati normativi (riferimenti brevi/completi, testi d'aiuto, warning operativi e ambiti di applicabilità).
    - **Componente Premium**: Creato `NormativaPopover.tsx` con micro-animazioni, glassmorphism bordeaux, e suddivisione logica delle informazioni normative/operative.
    - **Integrazione UI**: Inseriti i badge `Rif.` in `FundingItem.tsx` e mappati i 7 ambiti tematici obbligatori (Art. 23 c. 2, Incremento 0,22%, D.L. 25/2025, Conglobamento 2026, Decurtazioni permanenti, Vincoli variabili, EQ).

93. **Audit, Fix e Trasparenza Semantica dei Mapping Normativi (Aprile 2026)**:
    - **Disclaimer Trasparenza**: Integrati avvisi testuali espliciti per i campi che racchiudono aggregati normativi complessi non perfettamente atomici nel modello dati (`st_taglioFondoDL78_2010` per la L. 147/2013 e `st_riduzionePerIncrementoEQ` per le Risorse EQ).
    - **QA Pre-Rilascio**: Eseguita checklist di conformità con pieno successo sia per la stabilità del motore sia per i workflow di persistenza e navigazione.

94. **Backup del Database salarioaccessoriofl (Supabase) (Aprile 2026)**:
    - **Esportazione Dati**: Eseguita esportazione e salvataggio in formato JSON delle tabelle chiave del backend Supabase (`profiles`, `entities`, `notifications`, `notification_reads`, `user_app_state`) a scopo di disaster recovery e audit locale.

95. **Sincronizzazione GitHub e Rilascio Versione Beta 1.0 (Aprile 2026)**:
    - **Allineamento Remoto**: Effettuato il commit e il push dei moduli applicativi e della documentazione, superando i controlli di integrità e test end-to-end.
    - **Rebranding**: Centralizzato il tag informativo `Versione Beta 1.0` sulle costanti di sistema.

*Ultimo aggiornamento automatico: 29 Aprile 2026 — Workspace allineato e marchiato in versione stabile beta.*