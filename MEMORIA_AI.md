# 🧠 MEMORIA AI - Contesto di Progetto

> [!IMPORTANT]
> **REGOLE OPERATIVE MANDATORIE (AMBITO LOCALE)**
> 1. Lavorare **esclusivamente** sul file system locale della macchina dell'utente.
> 2. **MAI** aprire GitHub o fare operazioni sul repository remoto (`push`, `pull`, `commit`, ecc.).
> 3. Utilizzare **solo** l'URL locale `http://localhost:5000/` per le verifiche browser.
> 4. Utilizzare **esclusivamente** le credenziali: `dino.pusceddu@cgil.lombardia.it` / `Admin123!`.
> 5. Non utilizzare mai credenziali di esempio o placeholder.

Questo file funge da "memoria e contesto" per l'Assistente AI (Google Antigravity). Quando si avvia una nuova sessione su un computer o terminale diverso, chiedere all'AI di rileggere questo file per recuperare tutto lo storico del progetto.

## 📱 1. Contesto Generale (L'Applicazione)
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
48. **Fix Schema 'notifications'**: Corretta l'assenza della colonna `user_id`.
49. **Integrazione Area Normativa (Completata Fase Hardening)**
    - Implementata e rafforzata una pipeline di ingestione JSON in `scripts/doc-ingestion/` per trattare i DOCX.
    - Output in `src/data/normativa/`: `raccolta.articles.json` (169 articoli reali), `guida.schede.json` (46 schede tematiche strutturate), `aran.pareri.json` (362 pareri master), `normativa.indiceAnalitico.json` (133 voci), `normativa.searchIndex.json` (577 entry unificato).
    - Script npm (`npm run normativa:build`) automatizza il flusso. QA integrato con report JSON in `scripts/doc-ingestion/reports/`.
51. **Hardening Definitivo Pipeline Normativa (Aprile 2026)**
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

## 📄 Schema Dati Normativa Corrente
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

96. **Chiusura Sprint B e Versione Beta 1.1 (Maggio 2026)**:
    - **Stato**: **CHIUSO**.
    - Sprint B chiusa definitivamente con merge su `main` completato e deploy produzione GREEN.
    - Versione applicativa aggiornata a “Versione Beta 1.1”.
    - Integrazione CCNL 23.02.2026 completata (inclusa gestione arretrati e conglobamento indennità comparto).
    - Integrazione D.L. 25/2025 implementata, incluso il calcolo incremento stabile 0,14%, variabile 0,22% e limite 48%.
    - Stabilizzazione e normalizzazione degli alias `st_incrementoDecretoPA` / `st_incrementoDL25_2025`.
    - Implementazione guida normativa contestuale voce-per-voce.
    - Aggiornamento dei generatori report: PDF, Determina e Tabella 15 allineati alle nuove normative.
    - Rimozione sicura di `MEMORIA_AI.md` dal repository remoto e rimozione dipendenza `gitnexus`.
    - **Nota obbligatoria di sicurezza**: Rotazione segreti Supabase/Auth ancora da completare fuori repository a causa di credenziali storiche presenti nella history Git.
    - **Pulizia Repository**: Branch locale e remoto `release/sprint-b-ccnl-2026` eliminati definitivamente. Working tree allineato a `main`.

*Ultimo aggiornamento automatico: 13 Maggio 2026 — Sprint B chiusa e branch rimossi.*

97. **Sprint C.1: Audit Dati Generali Ente & Strumenti di Import (Maggio 2026)**:
    - **Stato**: **IN CORSO**.
    - **Obiettivo**: Mappare i dati della sezione "Dati Generali Ente" e progettare strumenti di importazione automatica (CSV).
    - **Attività**: Produzione di audit tecnico, template CSV standardizzato, dizionario dati, lettera di richiesta dati e proposta di refactoring del wizard.
    - **Vincolo**: Il refactoring del wizard e l'implementazione del codice di importazione sono solo progettati (documentazione tecnica) e non ancora implementati nel codice applicativo.
    - **Nota**: Tutte le attività rimangono locali e non vengono tracciate su GitHub. `MEMORIA_AI.md` è mantenuta come file locale ignorato.

### Hotfix post-release Beta 1.1 — Conglobamento indennità di comparto Art. 60 CCNL 23.02.2026:
Corretto il calcolo della riduzione stabile del fondo su 12 mensilità, secondo Tabella C del CCNL 23.02.2026. Eliminato ogni moltiplicatore per 13. Mantenuta distinta la voce di distribuzione dell’indennità di comparto calcolata dal personale in servizio. Test, regressioni e build superati.
㔊⸲⨠匪牰湩⁴⹃′ₗ浉汰浥湥慴楺湯⁥浉潰瑲䌠噓䐠瑡⁩敇敮慲楬䔠瑮⁥䴨条楧⁯〲㘲⨩ਪ††‭⨪慐獲牥䌠噓倠牥潳慮楬空瑡⩯㨪䤠灭敬敭瑮瑡⁯牳⽣潬楧⽣浩潰瑲振癳慐獲牥琮⁳潣⁮畳灰牯潴渠瑡癩⁯数⁲敳慰慲潴敲搠⁩慣灭⁯※⁥潦浲瑡⁩畮敭楲楣戯潯敬湡⁩瑩污慩楮⠠異瑮⁯業汧慩慩‬楶杲汯⁡敤楣慭敬‬丯⥯ਮ††‭⨪慖楬慤楺湯⁥潒畢瑳⁡娨摯⨩㨪䌠敲瑡⁯牳⽣捳敨慭⽳浩潰瑲捓敨慭琮⁳潣⁮慳楮楴空穡潩敮愠瑵浯瑡捩⁡敤⁩楴楰攠瘠污摩穡潩敮挠湯楤楺湯污⁥攨⹳愠楢慴瑮⁩扯汢杩瑡牯⁩数⁲潃畭楮倯潲楶据⥥ਮ††‭⨪慍灰牥☠倠敲楶睥⨪›癓汩灵慰潴猠捲氯杯捩椯灭牯⽴獣䵶灡数⹲獴挠敨挠湯牦湯慴椠搠瑡⁩浩潰瑲瑡⁩潣⁮畱汥楬愠瑴慵楬‬敧敮慲摮⁯湵⁡牰癥敩⁷敤瑴条楬瑡⁡潣⁮瑳瑡⁩椨癮牡慩潴‬潭楤楦慣潴‬畮癯Ɐ眠牡楮杮⸩ †ⴠ⨠匪牥楶散䰠祡牥⨪›浉汰浥湥慴潴猠捲氯杯捩椯灭牯⽴浩潰瑲慄楴敇敮慲楬敓癲捩⹥獴瀠牥漠捲敨瑳慲敲椠⁬潷歲汦睯⠠敌瑴牵⁡㸭倠牡楳杮ⴠ‾慖楬慤楺湯⁥㸭䴠灡楰杮⸩ †ⴠ⨠唪⁉潍慤敬倠敲業浵⨪›牃慥慴䌠癳浉潰瑲潍慤⹬獴⁸潣⁮牤条搦潲⁰猨浩汵瑡⥯‬敲潰瑲攠牲牯⁩湩整慲瑴癩⁯⁥慴敢汬⁡楤挠浯慰慲楺湯⁥慤楴ਮ††‭⨪湉整牧穡潩敮删摥捵牥⨪›杁楧湵慴愠楺湯⁥䵉佐呒䑟呁彉䕇䕎䅒䥌䍟噓瀠牥氠愧杧潩湲浡湥潴愠潴業潣攠猠捩牵⁯敤⁬畆摮慄慴猠湥慺猠癯慲捳楲敶敲氠椧瑮牥⁯瑳瑡⹯ †ⴠ⨠䠪瑯楦⁸潃杮潬慢敭瑮⁯湉敤湮瑩⫠㨪䤠瑮来慲慴氠⁡潣牲穥潩敮渠牯慭楴慶䄠瑲‮〶䌠乃⁌㌲〮⸲〲㘲⠠慣捬汯⁯畳ㄠ′敭獮汩瑩⧠渠汥洠瑯牯⁥楤挠污潣潬‬慶楬慤慴挠湯ㄠ㈰琠獥⁴潴慴楬ਮ††‭⨪畁潴慭楺湯⁥敔瑳⨪›杁楧湵楴㌠′畮癯⁩整瑳甠楮慴楲攠㐠映硩畴敲䌠噓瀠牥朠牡湡楴敲氠椧瑮来楲搠汥猠獩整慭搠⁩浩潰瑲മਊ⌣匠牰湩⁴⹃″‭敇敮慲潴敲䰠瑥整慲删捩楨獥慴䐠瑡੩‭浉汰浥湥慴潴洠瑯牯⁥楤朠湥牥穡潩敮挠湯整瑸愭慷敲ਮ‭杁楧湵慴愠瑮灥楲慭䄠‴湩琠浥潰爠慥敬ਮ‭湉整牧穡潩敮攠灸牯⁴䑐⁆牰景獥楳湯污⹥ⴊ嘠污摩穡潩敮ㄠ〰‥慰獳瑡⹡ഊਊ⌣匠牰湩⁴⹃′…⹃″‭潃獮汯摩浡湥潴匠牴浵湥楴䐠瑡⁩湅整⠠敂慴ㄠ㈮਩‭潃灭敬慴潴椠灭牯⁴千⁖慤楴朠湥牥污⁩湥整ਮ‭浉汰浥湥慴潴朠湥牥瑡牯⁥畡潴慭楴潣氠瑥整慲爠捩楨獥慴搠瑡⁩倨䙄䴯牡摫睯⥮ਮ‭敃瑮慲楬空瑡⁡慢牲⁡瑳畲敭瑮⁩湩䔠捸汥潔汯⹳獴⁸楲潮業慮慴椠⁮•瑓畲敭瑮⁩浩潰瑲支灸牯屴ਮ‭桃慩楲慴搠獩楴穮潩敮映湵楺湯污㩥䌠噓瀠牥椠灭牯慴楺湯⁥湩穩慩敬朠極慤慴‬硅散⁬数⁲慢正灵爯灩楲瑳湩⁯潣灭敬潴ਮ‭杁楧牯慮慴瘠牥楳湯⁥灡汰捩瑡癩⁡⁡敂慴ㄠ㈮ਮ਍

## Sprint C.4.1 - Architettura Wizard Dati Generali
- Introdotto il nuovo wizard guidato a 10 step per i dati generali dell'ente.
- Implementato Step 1 (Identificazione Ente) e Step 2 (Strumenti di Raccolta).
- Gestione tramite stato locale 'draftData' per isolamento modifiche fino al commit.
- Integrazione toggle per fallback alla 'Vista Avanzata' (form classico a 5 step).

## Sprint C.4.2 - Riprogettazione Ingresso e Focused Layout
- Implementata Landing Page 'Configurazione Fondo' con doppia scelta: Wizard vs Costituzione Fondo.
- Introdotta modalità 'Focused Wizard': navigazione a pieno schermo senza barra laterale dell'app.
- Pannello di stato 'Dati Iniziali' per monitorare la completezza delle informazioni core.
- Modal di conferma per accesso alla vista tecnica con dati incompleti.
- Architettura basata su NavigationScope.WIZARD per controllo layout dinamico.



## Sprint C.4.3 - Implementazione Step 3 e 4 (Storici 2016 e 2018)
- Implementati componenti specifici per la raccolta dati certificati 2016 e 2018.
- Step 3 (2016): Gestione fondo dipendenti, EQ, Dirigenza, Segretario e Straordinario con calcolo limite real-time.
- Step 4 (2018): Gestione valori economici e consistenza personale (FTE/Teste) per calcolo pro-capite Art. 23.
- Esteso meccanismo di commit del wizard per includere historicalData e campi tecnici di annualData.
- Validata parità funzionale con la vista tecnica avanzata e compatibilità con import CSV.


## Sprint C.4.4 - Implementazione Step 5 e 6 (D.L. 25/2025 e CCNL 2026)
- Creazione dei componenti per gli step 5 e 6 del wizard Dati Generali Ente.
- Step 5 (D.L. 25/2025): Aggiunta gestione per incremento 0,14% (st_incrementoDL25_2025) e calcolatori real-time per verificare la sostenibilità secondo il limite del 48%.
- Step 6 (CCNL 2026): Aggiunta gestione per gli incrementi opzionali (0,22%) e il calcolo del conglobamento basato su 12 mensilità (Tabella C).
- Correzioni TypeScript applicate per assicurare che la mappatura su 'annualData.simulatoreInput', 'annualData.ccnl2024' e 'fondoAccessorioDipendenteData' sia coerente col modello di dominio.
- 97/97 unit test e 8/8 regression test passati con successo.


## Sprint C.4.5 - Completamento Wizard Dati Generali Ente (Step 7-10)
- Step 7: Creato WizardStepPersonale per inserire i dati aggregati del personale base (per ripartizione) e del personale comparto per il calcolo della riduzione del conglobamento (FTE * Valore Tabella C * 12 mesi).
- Step 8: Creato WizardStepRisorseIniziali per inserire Fondo Stabile 2017, RIA cessati, Differenziali stipendiali, Risorse EQ.
- Step 9: Creato WizardStepCoerenzaDati. Utilizza fundEngine in logica read-only su draftData per presentare un check simulato su anagrafica, dati storici, D.L. 25/2025 (48%), e CCNL 2026. Non lancia dispatch e non blocca il flusso.
- Step 10: Creato WizardStepRiepilogoFinale che visualizza il sunto dei dati e le action calls (Salva e vai a costituzione, Salva bozza, Apri vista tecnica).
- Aggiunta in DatiGeneraliWizard.tsx l'estensione dell'azione handleSaveDraft per inviare i parametri al reducer (Fondo Accessorio e EQ).
- Eseguiti 97/97 tests e verify_fixtures. Tutti i test core e di regressione sono passati. Zero push o commit remoti.

## Sprint C.4.6 - Refactoring Configurazione Fondo & Raccolta Dati Ente (Modifiche MOD-001 ~ MOD-005)
- **MOD-001 (Rinomina e Palette)**: Cambiato il nome pubblico in *"Raccolta dati dell’Ente"*, armonizzando colori e stili con la palette istituzionale rosso/rosso-arancio di FP CGIL Lombardia (#cc4331).
- **MOD-002 (Interfaccia Mobile-First)**: Riorganizzata la UI del wizard per tablet e smartphone. Introdotto stepper compatto verticale, summary panel collassabile a fondo pagina, card responsive per il Mapping Preview (sostituendo tabelle larghe) e touch target ad altezza minima 44px.
- **MOD-003 (Generatore Lettera Richiesta Dati)**: Implementato generatore completo di lettere per gli enti basato sullo stato draft. Include export PDF parallelo, copia testo negli appunti, lettere parziali e catalogo dettagliato coprente tutti gli 8 step.
- **MOD-004 (Configurazione Fondo Standalone)**: Creata pagina iniziale (Entry Page) con rilevamento dati in sola lettura (`detectFundDataPresence`). Introdotto layout standalone a schermo intero (privo di sidebar principale dell'app) e routing virtuale protetto da feature flag.
- **MOD-005 (Navigazione Escape e CTA Disabilitata)**: Corretta la navigazione in uscita (il pulsante *"Apri dati del fondo"* e *"Torna alla dashboard"* impostano il path a `/` prima del cambio tab, ripristinando la sidebar legacy). Allineato il pulsante a destra su desktop. Sostituita la dicitura finale con *"Trasferisci i dati alla costituzione del fondo e compila"*, lasciando il pulsante disabilitato con badge *"Non ancora attivo"* e messaggi chiarificatori.
- **MOD-006 (Step 1, Auto-compilazione e COSFEL)**: 
  - Collegati i campi Denominazione Ente e Anno di Riferimento Istruttoria a `AppContext` (in sola lettura). Vengono compilati automaticamente e bloccati, visualizzando un banner di warning in caso di assenza di contesto attivo.
  - Sostituito il box informativo normativo nello Step 1 con una versiona discorsiva basata sullo stile grafico di FP CGIL Lombardia.
  - Aggiunta spiegazione dettagliata sul flag dirigenza e deficitarietà strutturale.
  - Introdotta la checkbox condizionale COSFEL se l'ente è strutturalmente deficitario, con logica di azzeramento automatico dello stato se la deficitarietà viene deselezionata.
  - Implementate le regole di validazione e blocco per enti strutturalmente deficitari senza approvazione COSFEL, producendo errori bloccanti su incrementi discrezionali (D.L. 25/2025, PNRR, straordinario facoltativo, 0.22% CCNL 2026) e warning forti su incrementi contrattuali di natura ordinaria/automatica.
  - Esteso il catalogo lettere per includere la voce COSFEL condizionale.
  - Aggiunti test unitari e di integrazione per verificare il corretto funzionamento di tutte le casistiche e l'aggiornamento automatico.
- **MOD-007 (Step 1, Pulsanti Sì/No e Prima Fascia D.L. 34)**:
  - Sostituiti tutti i vecchi checkbox dello Step 1 con pulsanti Sì/No espliciti con stato a tre livelli (Sì/No/Mancante).
  - Configurato lo stile grafico del "No" per non apparire come errore (grigio/neutro).
  - Implementato azzeramento automatico di COSFEL se l'ente viene deselezionato come deficitario.
  - Aggiunto popup informativo "Cos'è?" sulla prima fascia di virtuosità demografica del D.L. 34/2019, visualizzante i criteri normativi (Tabella 1 D.M. 17/03/2020) e le fasce demografiche.
  - Distinta la mancanza di COSFEL (`undefined` -> warning non bloccante `COSFEL-MISSING-*`) dalla risposta esplicita negativa (`false` -> errore bloccante `COSFEL-BLOCKED-*`) in tutti gli incrementi discrezionali (D.L. 25, CCNL 2026, Straordinario, PNRR).
  - Escluse le risposte booleane negative (`false`) dalla lettera "Solo dati mancanti".
  - Aggiunto test unitario specifico `MOD007_dirigenza.test.ts` per garantire che `hasDirigenza === false` non produca riduzioni automatiche indebite e disabiliti il Fondo Dirigenza 2016 per l'art. 23.
- **MOD-008 (Step 2, Limite Art. 23 Attualizzato)**:
  - Riprogettato completamente lo Step 2 per calcolare esclusivamente il "Limite Art. 23, comma 2, attualizzato", delegando il controllo di capienza/superamento a carico delle risorse effettive alla fase legacy/futura di Costituzione Fondo.
  - Rimosso il calcolo di margine/superamento ex Art. 23 dal wizard e contrassegnati i relativi campi (`risorseSoggetteAttuali`, `risorseEscluseAttuali`) come `@deprecated`.
  - Implementato il calcolo del pro-capite basato sull'invarianza del valore medio storico del 2018 in rapporto al personale previsto nel 2026 secondo il PIAO.
  - Aggiunta la gestione di 19 controlli/validazioni dettagliati, tra cui: avvisi di riconciliazione tra ricostruito e certificato 2016, segnalazione per limite certificato pari a zero, errori per valori negativi, warning per dati mancanti del pro-capite, anomalie per consistenza personale e mismatch di quadratura tra indeterminato/determinato previsto.
  - Integrata la visualizzazione facoltativa del dettaglio personale 2026 con controlli dinamici.
  - Esteso il catalogo della lettera dati e il mapping preview per riflettere le modifiche.
  - Implementata e validata una suite di 19 test unitari per la logica pura e 4 test componenti UI di regressione.
- **MOD-009 (Step 2 Art. 23: Correzione Risultati e Calcolo Automatico Personale 2018/2026)**:
  - Introdotto switch/toggle `usaCalcoloManualePersonaleArt23` in Step 2 per scegliere tra calcolo automatico (tramite inserimento di tabelle/liste dipendenti part-time e mesi lavorati) e override manuale (campi `manualDipendentiEquivalenti2018` e `manualDipendentiEquivalenti2026`).
  - Implementato calcolo automatico FTE per il 2018 come $\sum \frac{pt}{100}$ e per il 2026 come $\sum \left(\frac{pt}{100} \times \frac{cedolini}{12}\right)$.
  - Eliminati campi deprecati di dettaglio del personale (es. tempo indeterminato, determinato, assunzioni, cessazioni, note fonte) sia dall'interfaccia utente che dal catalogo lettere, validazioni e calcoli.
  - Riorganizzato il layout della scheda dei risultati in una griglia responsive di 3 colonne su desktop, evidenziando graficamente la card primaria "Limite Art. 23, comma 2, attualizzato".
  - Aggiornate e ampliate le suite di test unitari (`art23Limit.test.ts`), di scenario (`wizard2026NormativeScenarios.test.ts`) e di componente (`Step2Art23Limite.test.tsx`), portando tutti i 103 test ad esito positivo e validando con successo il build complessivo del progetto.
- **MOD-010 (Restyling grafico Step 2 con palette FP CGIL Lombardia)**:
  - Applicati i colori istituzionali rosso/rosso-arancio (#CC4331, #A83226, #FFF4F2) a bottoni, focus, hover e input dello Step 2.
  - Introdotto bordo colorato rosso a sinistra per i titoli principali e InfoBox.
  - Creato layout desktop a 2 colonne per le card dei risultati intermedi e posizionato il risultato principale "Limite Art. 23, comma 2, attualizzato" a larghezza piena al di sotto, evidenziato con badge apposito ed escludendo classi blu.
  - Aggiornato il colore della card dell'Incremento Pro Capite a neutro (non verde).
  - Integrata la palette CGIL nel pannello di riepilogo laterale, nel pannello delle lettere e nella checklist.
  - Aggiornata ed estesa la suite di test per validare la presenza e lo stile del nuovo layout.
- **MOD-011 / MOD-011-bis / MOD-011-ter (Step 3 — Istruttoria completa D.L. 25/2025)**:
  - **MOD-011**: Trasformato lo Step 3 da form semplice a pagina istruttoria. Introdotte 5 sezioni (Inquadramento, Virtuosità, Basi di Calcolo, Sostenibilità, Esito). Logica `calculateDl25Increment` estesa con status applicabilità (`DIRECTLY_APPLICABLE`, `TRANSFER_ONLY`, `NOT_APPLICABLE`, `NEEDS_MANUAL_REVIEW`), verifica COSFEL, fascia demografica, blocchi normativi. Dati mancanti → `isCalcolabile: false` e warning, mai forzati a zero.
  - **MOD-011-bis**: Revisione sostanziale: verifica virtuosità D.M. 17/03/2020 per Comuni (FCDE, entrate correnti medie triennio, rapporto spesa/entrate, spesa massima sostenibile), tabella quote aderenti per Unioni/CM, sezione documenti/atti, mapping preview mutuamente esclusivo diretto/trasferimento, suite test estesa.
  - **MOD-011-ter**: Correzioni puntuali dopo collaudo manuale:
    - Banner blocco istruttorio con elenco discorsivo dei motivi specifici (dissesto, piano riequilibrio, equilibrio pluriennale, prima fascia, COSFEL No).
    - Warning ambra visibile quando ente strutturalmente deficitario con COSFEL `undefined` (dato mancante ≠ blocco).
    - Campo `documentazioneCosfelDl25` (estremi autorizzazione COSFEL) condizionale su deficitarietà.
    - Campo `altreRisorse2025DaSottrarre` numerico incluso nella formula del 48%.
    - Campi testuali `estremiParereRevisoriDl25` e `estremiAsseverazioneEquilibrioPluriennale`.
    - Select `baseCalcoloLimiteStorico` con opzioni predefinite.
    - Riga "Scostamento dal limite storico" colorata nella Sezione 4 (rosso/verde).
    - Card "Quota non iscrivibile" mostrata solo se > 0, con motivo e importo.
    - Riepilogo costi lordi (richiesti e iscrivibili) nella Sezione 5 con aliquote esplicite.
    - Tabella quote Unioni estesa: colonne "Tipologia ente" e "COSFEL Aderente" (tre stati).
    - Ramo `isBlocked` di `calculateDl25Increment` aggiornato: ora restituisce `quotaNonIscrivibile`, `costoLordoIncrementoRichiesto` e `costoLordoIncrementoIscrivibile`.
    - Catalogo lettera dati (Step 3) completato con 8 nuove voci: FCDE, aliquote oneri/IRAP, COSFEL condizionale, estremi revisori, estremi asseverazione, base limite storico, altreRisorse2025, quote Unioni con descrizione estesa.
    - 12 nuovi test di logica (`dl25Increment.test.ts`) e 15 nuovi test UI (`Step3Dl25.test.tsx`).
- **Validazione Globale MOD-011-ter**: Passati tutti i **226 test automatici** (40 file, 100% pass rate) e build di produzione completato senza errori TypeScript (33.20s).

*Ultimo aggiornamento automatico: 20 Maggio 2026 — Completato MOD-011-ter: Istruttoria completa Step 3 D.L. 25/2025 — correzioni puntuali dopo collaudo manuale. 226/226 test passati, build OK.*

## Sprint C.4.7 - MOD-011-quater — Step 3 D.L. 25/2025: calcolo del limite massimo, non dell’incremento effettivo
- **Obiettivo**: Lo Step 3 non serve più a decidere quanto incremento iscrivere realmente nel Fondo, ma unicamente a calcolare e validare il **limite massimo teoricamente applicabile ai sensi del D.L. 25/2025**. L'inserimento dell'incremento effettivo avverrà a valle nella pagina di Costituzione Fondo.
- **Modifiche UI & Modello**:
  - Rimozione di tutti i campi operativi di inserimento dell'incremento richiesto/applicato, atti, pareri, oneri riflessi e IRAP dall'interfaccia utente, dalla lettera dati e dal mapping operativo (contrassegnati come `@deprecated` per retrocompatibilità).

## Sprint C.4.8 - MOD-012 — Step 4: Incrementi CCNL Funzioni Locali 23.2.2026
- **Obiettivo**: Riorganizzare lo Step 4 della "Raccolta dati dell’Ente" rendendolo una scheda esclusivamente di calcolo e validazione dei limiti massimi per gli incrementi contrattuali (0,14% stabile e 0,22% variabile).
- **Modifiche UI & Modello**:
  - Rimozione di tutti i campi interattivi operativi di attivazione o percentuale dell'incremento 0,22% (slider, checkbox) e loro deprecazione.
  - Suddivisione della UI in 4 sezioni distinte e coerenti con la palette FP CGIL Lombardia:
    1. Base di calcolo (Monte Salari 2021)
    2. Incremento Stabile 0,14% (Monte Salari 2021 × 0.14%)
    3. Limite Massimo Quota 0,22% (Monte Salari 2021 × 0.22%)
    4. Riepilogo Istruttorio Incrementi CCNL 2026 (con messaggio informativo sul mancato trasferimento automatico).
  - Regola COSFEL differenziata per il calcolo del limite massimo della quota 0,22% per enti strutturalmente deficitari:
    - `hasApprovazioneCosfel === true`: calcolo ordinario del limite massimo 0,22% ($MonteSalari2021 \times 0.22\%$).
    - `hasApprovazioneCosfel === false`: limite massimo 0,22% forzato a zero, con visualizzazione di un banner di errore/blocco istruttorio (`COSFEL-BLOCKED-CCNL2026-022`).
    - `hasApprovazioneCosfel === undefined`: calcolo teorico ordinario del limite massimo, ma con emissione di un warning forte in un banner dedicato e blocco di validazione (`COSFEL-MISSING-CCNL2026-022`) senza forzatura a zero (il dato mancante non produce mai zero in automatico).
  - Dati mancanti (`monteSalari2021 === undefined`) visualizzati come "Non calcolabile" (`'n/d'`) senza forzare a zero.
  - Aggiornamento del Summary Panel per riflettere le due quote separate (stabile e limite variabile) e del Mapping Preview per impostare il vecchio campo legacy `vn_art58c2_CCNL2026_incremento022_MS2021` come `NOT_APPLICABLE`, preservando i dati inseriti manualmente dall'utente.
- **Validazione**:
  - Aggiornata la suite di test unitari (`ccnl2026Increments.test.ts`), di scenario (`wizard2026NormativeScenarios.test.ts`), di mapping (`mappingPreview.test.ts`) e di componente (`Step4Ccnl2026.test.tsx`).
  - Eseguita la suite con `npx vitest run`: tutti i 223 test sono passati con successo.
  - Eseguito il build di produzione e typecheck: esito positivo.

*Ultimo aggiornamento automatico: 21 Maggio 2026 — Completato MOD-012: Incrementi CCNL Funzioni Locali 23.2.2026 integrato ed allineato, suite test 100% verde.*

## Sprint C.4.9 - MOD-018 — Step 7: Incremento PNRR (Maggio 2026)
- **Obiettivo**: Rivedere lo Step 7 per calcolare la capacità teorica massima utilizzabile PNRR (5% componente stabile 2016 per dipendenti ed eventualmente dirigenti), senza forzare l'iscrizione a zero per la mancanza del parere COSFEL (che genera solo warning).
- **Modifiche UI & Modello**:
  - Controllo di applicabilità basato su tre stati (Sì/No/Mancante). Se No, step marcato non applicabile. Se mancante, step non validabile con warning.
  - Verifica requisiti bloccanti dell'art. 8, commi 3 e 4, D.L. 13/2023 (equilibrio, rendiconto, debito commerciale, incidenza salario <= 8%).
  - Separazione della checkbox COSFEL come alert istruttorio non bloccante.
  - Calcolo del limite massimo teorico (5% del fondo stabile 2016 dipendenti e dirigenti).

## Sprint C.4.10 - MOD-019 — Step 8 Riepilogo Preview e Excel Import/Export (Maggio 2026)
- **Obiettivo**: Riorganizzare lo Step 8 come riepilogo istruttorio leggibile a 8 sezioni ed escludere chiavi interne. Creare il box per compilazione offline Excel (Import/Export) in cima allo Step 1.
- **Modifiche UI & Modello**:
  - Step 8 suddiviso in 8 sezioni descrittive responsive (Quadro Ente, Limite Art 23, DL 25/2025, CCNL 2026, Comparto Art. 60, Fondo Straordinario, PNRR, Esiti Istruttori).
  - Rimozione di qualsiasi chiave tecnica dalla UI di riepilogo e dal foglio Excel visibile all'utente.
  - Creata la logica di Import/Export Excel (foglio Excel protetto con Colonna E nascosta contenente le chiavi tecniche per accoppiamento robusto).
  - Validatore robusto all'importazione in grado di convertire tipi e rilevare formati non conformi, restituendo un report dettagliato all'utente.
  - Risolti i problemi di formattazione di numeri a 4 cifre in Node per i test unitari (lookbehind negativi).
  - Persistenza dello stato del wizard assicurata durante tutta la navigazione e ricalcolo automatico post-import.

*Ultimo aggiornamento automatico: 22 Maggio 2026 — Completato MOD-019: Revisione Step 8 Riepilogo ed Excel Import/Export implementati ed allineati, suite test 100% verde.*

## Sprint C.4.11 - MOD-021 — Motore di anteprima trasferimento Wizard 2026 → Costituzione Fondo (Maggio 2026)
- **Obiettivo**: Implementare una fase ponte tra il nuovo wizard "Raccolta dati dell’Ente / Configurazione fondo" e la pagina legacy di Costituzione Fondo, in sola anteprima senza scrittura reale su Supabase o dispatch definitivo su `fundData`.
- **Modifiche UI & Modello**:
  - Creato modulo [transferPreviewEngine.ts](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/features/wizard2026/transfer/transferPreviewEngine.ts) con le funzioni `buildWizard2026TransferPreview` e `simulateWizard2026Transfer` per calcolare in anteprima le variazioni ("Prima / Dopo") dei campi del fondo.
  - Implementata la logica per mitigare i rischi di sovrascrittura dovuti ai `useEffect` della pagina legacy (ad es. mappando i relativi parametri contabili e istruttori storici della configurazione annuale).
  - Inclusa la classificazione dei campi trasferibili direttamente (CCNL 2026 0,14% stabili/arretrati, 0,22% FRD/EQ, Art. 60, riduzione straordinario stabili/arretrati, fondo straordinario ordinario) e di quelli che non devono essere trasferiti ma mostrati come limiti massimi o solo controlli (D.L. 25/2025, PNRR, Limite Art. 23).
  - Aggiornato [Step8RiepilogoPreview.tsx](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/features/wizard2026/steps/Step8RiepilogoPreview.tsx) per mostrare la sezione "Anteprima trasferimento alla Costituzione Fondo" con card responsive, badge di stato, valori correnti e proposti, differenze, effetto sull'Art. 23, ed espansione dei dettagli tecnici.
  - Testato l'intero modulo di trasferimento e la visualizzazione dello Step 8 con test dedicati in [transferPreviewEngine.test.ts](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/features/wizard2026/transfer/__tests__/transferPreviewEngine.test.ts) e [Step8RiepilogoPreview.test.tsx](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/features/wizard2026/steps/__tests__/Step8RiepilogoPreview.test.tsx) e corretto il test di fumo [Wizard2026PreviewPage.test.tsx](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/features/wizard2026/components/__tests__/Wizard2026PreviewPage.test.tsx).

*Ultimo aggiornamento automatico: 22 Maggio 2026 — Completato MOD-021: Anteprima trasferimento e motore di simulazione completato con test e conformità di stile, suite test 100% verde.*

## Sprint C.4.12 - MOD-025 — Riallineamento pagina Costituzione Fondo personale dipendente e prospetto Art. 23 (Maggio 2026)
- **Obiettivo**: Riorganizzare visivamente la pagina Costituzione Fondo dipendente in 6 sezioni, integrare il prospetto Art. 23 a 4 valori per i revisori, e gestire correttamente il computo figurativo dell'Art. 60.
- **Modifiche UI & Modello**:
  - Creata la struttura `art23Compliance` per esporre in modo dettagliato i 4 valori del prospetto (Fondo costituito, Risorse escluse, Risorse rilevanti con Art. 60 incluso, Limite attualizzato, Margine residuo).
  - Riorganizzata la pagina `FondoAccessorioDipendentePage.tsx` in 6 card logiche:
    - Sezione A: Prospetto Art. 23 - Fondo personale dipendente (highlighted card at the top, soft red/orange theme).
    - Sezione B: Fonti di Finanziamento Stabili.
    - Sezione C: Fonti di Finanziamento Variabili Soggette al Limite.
    - Sezione D: Fonti di Finanziamento Variabili Non Soggette al Limite.
    - Sezione E: Altre Risorse, Riduzioni e Computi Figurativi.
    - Sezione F: Riepilogo Dati Importati dal Wizard 2026.
  - La riduzione permanente per l'Indennità di Comparto (Art. 60) riduce realmente la parte stabile del fondo, ma viene aggiunta figurativamente ai fini del limite Art. 23 per non erodere il tetto di spesa.
  - Rimossa la troncatura automatica dei valori di input in `handleChange` per consentire all'utente di inserire importi superiori al limite teorico e visualizzare gli alert/errori.
  - Aggiunti badge informativi grigi `"Pregressa / Storica"` sulle voci storiche stabili non modificabili convenzionali.
  - Aggiunto badge informativo ambra `"Non applicabile alla tipologia di ente selezionata"` per i campi specifici di Regioni e Città Metropolitane se la tipologia dell'ente non corrisponde a tali categorie.
  - Testato l'intero modulo con test dedicati in `mod025ComplianceProspetto.test.ts`.

*Ultimo aggiornamento automatico: 24 Maggio 2026 — Completato MOD-025: Riallineamento pagina Costituzione Fondo e Prospetto Art. 23 a 4 valori implementato con test e conformità di stile, suite test 100% verde.*

## Sprint C.4.13 - MOD-027 — Correzione coerenza Art. 60 tra Costituzione Fondo, parametri CCNL e prospetto Art. 23 (Maggio 2026)
- **Obiettivo**: Correggere l'anomalia emersa in MOD-026 per cui in assenza di popolamento del wizard contrattuale, la decurtazione permanente dell'Art. 60 non riduceva correttamente il fondo reale dipendenti.
- **Modifiche UI & Modello**:
  - Scorporata la riduzione del conglobamento da `ccnl2024_fad_stabile` rendendo l'incremento contrattuale lordo e spostando la detrazione in modo esplicito e centralizzato a livello di motore.
  - Implementata nel motore di calcolo (`fundEngine.ts` canonico e legacy) la logica di priorità: valore della voce fondo (inserimento manuale in `st_art60c2...`) ha priorità sul valore contrattuale del wizard, producendo un warning di disallineamento se entrambi sono presenti ma divergono.
  - La decurtazione effettiva riduce realmente il totale stabile dipendenti e le risorse soggette, ma viene sommatamente reintegrata a titolo di computo figurativo positivo ai fini del limite Art. 23 (neutralità del limite).
  - Esteso il DTO `art23Compliance` per esporre la terna di valori dell'Art. 60 (`valoreArt60VoceFondo`, `valoreArt60Contrattuale`, `valoreArt60Effettivo`) e il flag `showWarningDisallineamento`.
  - Allineata la UI (`FondoAccessorioDipendentePage.tsx` e il relativo `useMemo` di `fadTotals`) per applicare coerentemente il calcolo stabile al netto.
  - Inserito il banner ambra di warning non bloccante in cima alla pagina e arricchito il pannello di raccordo Art. 60 con la terna di valori ed un help text normativo sulla riga contabile (ora editabile e non più bloccata).
  - Implementati 4 scenari di test unitari completi in `mod025ComplianceProspetto.test.ts` verificando tutti i comportamenti limite e l'assenza di doppi conteggi.

*Ultimo aggiornamento automatico: 25 Maggio 2026 — Completato MOD-027: Correzione coerenza Art. 60 e allineamento UI implementato con test e build di produzione di successo, suite test 100% verde.*

---

## Sprint C.4.14 — MOD-032: Wizard 2026 → Costituzione Fondo (Trasferimento Controllato)

### MOD-032 (FIX1 ~ FIX6): Core del motore di trasferimento

**Periodo**: 28–29 Maggio 2026 — **Stato**: CHIUSO ✅

**Obiettivo**: Implementare il flusso completo di trasferimento controllato dal Wizard 2026 alla pagina Costituzione Fondo (dipendenti), con protezione anti-sovrascrittura, persistenza locale a tre livelli e sincronizzazione bidirezionale.

#### Architettura del trasferimento

**File chiave**:
- [`transferPreviewEngine.ts`](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/features/wizard2026/transfer/transferPreviewEngine.ts): motore di anteprima e simulazione
- [`applyWizard2026Transfer.ts`](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/features/wizard2026/transfer/applyWizard2026Transfer.ts): applicazione atomica del trasferimento
- [`Wizard2026TransferModal.tsx`](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/features/wizard2026/transfer/Wizard2026TransferModal.tsx): dialog di conferma trasferimento

**Persistenza a tre livelli (sessionStorage)**:
| Chiave | Contenuto | Comportamento |
|--------|-----------|---------------|
| `fl_wizard2026_draft_[userId]_[entityId]_[year]` | bozza locale corrente | salvata ad ogni modifica; auto-ripristinata all'apertura del wizard |
| `fl_wizard2026_last_transfer_[userId]_[entityId]_[year]` | snapshot post-trasferimento | aggiornata solo al trasferimento confermato |
| `fundData.wizard2026TransferSnapshot` | snapshot nel reducer React | usato per il confronto "da aggiornare" nella entry page |

**Classificazione campi (stati)**:
- `READY`: il valore del wizard è applicabile senza conflitti
- `CONFLICT`: un valore inserito manualmente nel fondo diverge da quello del wizard (non viene sovrascritto)
- `CONTROL_ONLY`: D.L. 25/2025 (tetto massimo) e PNRR (capacità teorica) → mostrati come riferimento, non trasferiti come importi

#### Correzioni applicate (CLOSEOUT-FIX1 ~ FIX6)

**FIX1 — Micro-correzioni Fondo Dipendenti e Fondo EQ**:
- Rimosso doppio conteggio `isAlreadyInCcnlTotal` per il campo 0,22% (era incluso sia come incremento CCNL sia come base del fondo corrente).
- Campo `st_incrementoDL25_2025` riclassificato da `DENTRO_LIMITE` a `FUORI_LIMITE_ART23` (il D.L. 25/2025 non è soggetto al tetto Art. 23, comma 2).
- Campo PNRR (`vn_PNRR_incremento`) classificato `CONTROL_ONLY`: mostra il massimo teorico (5% fondo stabile 2016) senza trasferirlo come importo effettivo.
- Campo `0,22% EQ` inviato solo alla pagina EQ, non al fondo dipendenti.

**FIX2 — Auto-ripristino dati Wizard all'apertura**:
- Il wizard si apre già alimentato dai dati di sessionStorage senza richiedere il click su "Continua compilazione".
- Priorità di idratazione: **Draft corrente** > **Last Transfer** > stato vuoto.
- Il banner "Sono presenti dati non trasferiti" è informativo (non bloccante); i dati sono già nei campi al rendering.

**FIX3 — Incremento stabile per aumento del personale (Art. 79 c. 1 lett. c) CCNL 16.11.2022)**:
- **Campo Wizard aggiunto**: `fondoCertificatoParteStabile2018` nello Step 2 (Limite Art. 23).
- **Formula corretta** (`art23Limit.ts`):
  ```
  incrementoStabileAumentoPersonale =
    (fondoCertificatoParteStabile2018 / dipendentiEquivalenti2018)
    × max(0, dipendentiEquivalenti2026 − dipendentiEquivalenti2018)
  ```
- La voce `st_incrementoStabileDifferenzialeConsistenzaPersonale` nella Costituzione Fondo è alimentata da questo calcolo (non modificabile manualmente; mostra un popup informativo sulla formula).
- Warning `ART23-FONDO-STABILE-2018-MISSING` emesso se il campo è assente o zero.

**FIX4 — Riorganizzazione pagina "Configurazione fondo" (Entry Page)**:
- [`FundConfigurationPreviewEntryPage.tsx`](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/features/wizard2026/entry/FundConfigurationPreviewEntryPage.tsx) riorganizzata con:
  - **Card sinistra (primaria)**: "Avvia o continua Raccolta dati" — marcata "Scelta consigliata", bordo rosso FP CGIL.
  - **Card destra (secondaria)**: "Vai al fondo del salario accessorio" — stile neutro/grigio.
  - **Riquadro stato dati 2026**: badge live con tre stati (Raccolta dati, Trasferimento, Stato complessivo).
- Logica `compareWizardStates` pulisce i metadati strutturali per confrontare solo i valori dato, evitando falsi positivi "da aggiornare".

**FIX5 — Persistenza Wizard post-trasferimento**:
- Risolte race condition tra draft restoration e auto-save: la chiave `fl_wizard2026_last_transfer_*` viene scritta in modo atomico solo al completamento del trasferimento.
- Il wizard rileva la presenza di un `lastTransfer` e lo usa come sorgente di idratazione secondaria.

**FIX6 — Race condition Art. 23 e blocco `localSources`**:
- I campi con `localSources[path] = 'manual'` e valore 0 non vengono sovrascritti dal wizard → classificati `CONFLICT`.
- Il prospetto Art. 23 si aggiorna correttamente dopo il trasferimento senza richiedere reload manuale.

#### Voci Fondo Dipendenti — stato finale post-MOD-032

| Voce | Chiave `fundData` | Sorgente wizard | Tipo trasferimento |
|------|-------------------|------------------|--------------------|
| 0,14% stabile | `st_incrementoDL25_2025_stabile014` | `ccnl2026.incremento014MS2021` | READY |
| 0,14% arretrati | `vn_arretrati014` | `ccnl2026.arretrati014` | READY |
| 0,22% Fondo | `vn_art58c2_CCNL2026_022` | `ccnl2026.incremento022MS2021` | READY |
| 0,22% EQ | *(pagina EQ)* | `ccnl2026.incremento022MS2021` | READY (solo EQ) |
| Art. 60 conglobamento | `st_art60c2_conglobamento` | `conglobamentoArt60.totaleRiduzione` | READY |
| Straordinario (riduzione stabile) | `st_riduzione_straordinario` | `straordinario.reduczioneStabile` | READY |
| Fondo straordinario ordinario | `vn_straordinario_ordinario` | `straordinario.fondoOrdinario` | READY |
| D.L. 25/2025 incremento | `st_incrementoDL25_2025` | `dl25.limiteMaxTeorico` | CONTROL_ONLY |
| PNRR massimo teorico | `vn_PNRR_incremento` | `pnrr.limiteMaxTeorico5perc` | CONTROL_ONLY |
| Incremento stabile aumento personale | `st_incrementoStabileDifferenzialeConsistenzaPersonale` | `art23.incrementoStabileAumentoPersonale` | READY (readonly) |

#### Verifica finale (post-FIX6)
- `npx tsc --noEmit` → **0 errori**
- `npx vitest run` → **tutti i test passati**
- `npm run build` → **build OK**
- Collaudo browser manuale: trasferimento, CONFLICT, CONTROL_ONLY, prospetto Art. 23, persistenza draft/refresh verificati.

*Ultimo aggiornamento automatico: 29 Maggio 2026 — Completato MOD-032-CLOSEOUT-FINAL: ciclo MOD-032 chiuso con tutti i FIX applicati, verificati e documentati. Suite test verde, build OK.*

---

## MOD-033 — Avvio audit pulizia vecchi wizard

Avviata la fase MOD-033 con audit tecnico preliminare sui vecchi wizard e sulle dipendenze legacy.
Obiettivo: identificare rotte, componenti, storage keys, import e test collegati ai wizard precedenti, senza rimuovere codice in questa prima fase.
Vincoli confermati: nessun GitHub, nessun deploy, nessuna scrittura Supabase/database, nessuna modifica produzione senza autorizzazione espressa.

### Risultati audit (29 Maggio 2026)

- **File legacy individuati**: 22 file (11 step + 6 componenti wizard + DataEntryPage + VerticalStepper + ConfirmGoToFundModal)
- **Cartella legacy principale**: `src/components/wizard/` (wizard "DatiGeneraliWizard" a 10 step, ancora referenziato da `DataEntryPage.tsx`)
- **Rotte/tab legacy**: 2 (`dataEntry` in sidebar, alias `/wizard-2026-preview` in App.tsx)
- **Import legacy ancora attivi**: 4 diretti da `DataEntryPage.tsx`
- **Rischi bloccanti per MOD-032**: 0 — il flusso Wizard 2026 non è interrotto
- **Chiavi sessionStorage legacy**: nessuna (non esistono chiavi wizard2023/2024/2025)
- **Chiavi da mantenere**: `fl_wizard2026_draft_*`, `fl_wizard2026_last_transfer_*`, `wizard2026_transfer_snapshot`, `wizard2026_transfer_success`, `fl_draft_*` (sistema globale fundData)

### Stato CLI (foto iniziale pre-pulizia)
- `npx tsc --noEmit` → **0 errori**
- `npx vitest run` → **51 file, 365 test, tutti PASS**
- `npm run build` → **OK (35s)**

### Piano proposto
Il piano MOD-033 prevede 5 fasi (A/B/C/D/E):
- **A**: Disconnessione rotte legacy (DataEntryPage, redirect App.tsx)
- **B**: Rimozione file categoria A (17 file steps+componenti wizard legacy)
- **C**: Refactor DataEntryPage (dipende da scelta utente su opzione A/B/C)
- **D**: Rimozione feature flag `ENABLE_WIZARD_2026_PREVIEW`
- **E**: Collaudo regressione finale

**Stato**: In attesa di approvazione utente per avviare MOD-033A.

*Aggiornamento: 29 Maggio 2026 — MOD-033 Fase 1 (audit) completata.*

---

## MOD-033 — Pulizia vecchi wizard: Fase A/B (Maggio 2026)

**Stato**: ✅ COMPLETATO LOCALMENTE (Collaudo manuale utente superato)

### Dettaglio attività:
1. **Fase A (Disconnessione)**:
   - Rimosso il tab legacy `dataEntry` dal menu della sidebar (`Sidebar.tsx`).
   - Aggiornati i reindirizzamenti su `ReportsPage.tsx` per puntare al modulo consolidato `wizard2026Preview`.
   - Aggiornata la suite di test unitari `accessMatrix.test.ts` per verificare la rimozione di `dataEntry` e la corretta accessibilità condizionale di `wizard2026Preview`.
2. **Fase B (Rimozione fisica)**:
   - Eliminata in blocco la cartella legacy `src/components/wizard/` (17 file).
   - Eliminata la pagina `src/pages/DataEntryPage.tsx`.
   - Eseguito audit testuale per garantire l'assenza di import o riferimenti morti a moduli o componenti rimossi.
3. **Fase C (Dashboard Card Refactoring & Rinomina)**:
   - **MOD-033C-FIX1**: Spostata la card del wizard `wizard2026Preview` modificandone lo scope in `DASHBOARD` per posizionarla subito dopo la card "Enti e Annualità".
   - **MOD-033C-FIX2**: Rinominata la card in **“Configurazione fondi incentivanti”** con mantenimento invariato di ID, route `/configurazione-fondo-preview` e logica di aggancio.
   - **Collaudo manuale**: Eseguito dall'utente con esito positivo.

### Controlli eseguiti in locale:
- `npx tsc --noEmit` → **0 errori**
- `npx vitest run` → **365/365 test superati (100% PASS)**
- `npm run build` → **Build completata con successo**

### Vincoli di sicurezza:
- Nessun commit/push/pull eseguito su Git/GitHub.
- Nessun deploy effettuato su Cloudflare o workers.dev.
- Nessuna scrittura/migrazione effettuata sul database Supabase.
- Intervento confinato interamente all'ambiente locale/offline.

## MOD-033D — Audit Persistenza e Consistenza Dati (Maggio 2026)

**Stato**: ✅ COMPLETATO (Report generato in `MOD033D_VERIFICA_PERSISTENZA_CONSISTENZA_DATI.md`)

### Dettaglio attività:
1. **Analisi Storage Chiavi**: Identificate e mappate tutte le chiavi in `sessionStorage` e `localStorage` legate a Wizard 2026, bozza del Fondo (`fl_draft_*`), e tracciamento contesto.
2. **Identificazione Rischi**: Evidenziata la natura volatile di `sessionStorage` per le bozze del Wizard e del Fondo, comportando il rischio di perdita dati alla chiusura della tab/browser prima del salvataggio su database remoto.
3. **Flussi Verificati**: Confermato che i dati inseriti nel Wizard non si perdono nei refresh/cambi pagina e che il trasferimento non sovrascrive i campi modificati manualmente grazie alla logica di `CONFLICT` in `transferPreviewEngine.ts`.
4. **Verifiche Tecniche**:
   - `npx tsc --noEmit` → **0 errori**
   - `npx vitest run` → **365/365 test superati (100% PASS)**
- `npm run build` → **Build completata con successo in 46.21s**
5. **Vincoli di Sicurezza**: Nessun commit, push, pull, deploy o modifica DB remota effettuata.

## MOD-033D-FIX1 — Persistenza locale durevole (Maggio 2026)

**Stato**: ✅ COMPLETATO (Report generato in `MOD033D_FIX1_persistenza_locale_durevole.md`)

### Dettaglio attività:
1. **Sostituzione Storage**: Spostata la memorizzazione delle bozze Wizard (`fl_wizard2026_draft_*`), dell'ultimo trasferimento (`fl_wizard2026_last_transfer_*`) e della bozza Fondo (`fl_draft_*`) da `sessionStorage` a `localStorage`.
2. **Migrazione Automatica**: Implementata funzione trasparente che copia in sicurezza i dati pre-esistenti da `sessionStorage` a `localStorage` (senza sovrascrivere valori esistenti) all'apertura del modulo.
3. **Verifiche di Regressione**:
   - `npx tsc --noEmit` → **0 errori**
   - `npx vitest run` → **367/367 test superati (100% PASS)**
   - `npm run build` → **Build completata con successo in 33.66s**
4. **Vincoli di Sicurezza**: Supabase/database non modificati, nessun deploy, nessun commit/push su Git.

## Sprint C.4.16 — MOD-033G: Beta 1.3, rimozione Preview e README (Giugno 2026)

**Stato**: ✅ COMPLETATO (Report generato in `MOD033G_BETA13_RIMOZIONE_PREVIEW_README.md`)

### Dettaglio attività:
1. **Rilascio Beta 1.3**:
   - Versione pubblica: **Beta 1.3**.
   - Versione tecnica: **1.3.0-beta.1** (aggiornata in `package.json` e `package-lock.json`).
2. **Rimozione diciture Preview**:
   - Rimosse tutte le diciture "Preview", "PREVIEW" e "Anteprima" dall'interfaccia visibile all'utente.
   - Sostituito il banner superiore nel layout del Wizard con la dicitura definitiva **"Flusso 2026 attivo — Compilazione guidata per la raccolta dati dell’Ente e la determinazione dei fondi incentivanti."** (con stile slate e indicatore attivo verde).
   - Rinominati i bottoni e i testi della schermata di onboarding (sinistra: **"Raccolta dati"** - descr: *"Compila o aggiorna i dati necessari al calcolo e al trasferimento verso la Costituzione dei fondi."* - btn: *"Apri raccolta dati"*; destra: **"Costituzione dei fondi"** - descr: *"Verifica i dati trasferiti, controlla i prospetti e completa le eventuali rettifiche."* - btn: *"Vai alla costituzione dei fondi"*).
   - Mantenuti intatti i nomi tecnici interni delle rotte e degli ID dei moduli (`wizard2026Preview`, `/configurazione-fondo-preview`).
3. **Aggiornamento README.md**:
   - Inserita sezione specifica **"## Beta 1.3 — Configurazione fondi incentivanti 2026"** documentando il flusso principale, raccolta dati, allineamento fondi, persistenza locale durevole, pulizia legacy, stato del rilascio offline e requisiti ambientali.
4. **Rimozione Feature Flag Obsoleto**:
   - Rimossa la variabile `VITE_ENABLE_WIZARD_2026_PREVIEW` da `.env.example` poiché il flusso è ora integrato e permanentemente attivo.
5. **Verifiche di Regressione**:
   - `npx tsc --noEmit` → **0 errori** (puliti import non utilizzati).
   - `npx vitest run` → **367/367 test superati (100% PASS)** (aggiornate le asserzioni di test sulle diciture UI).
   - `npm run build` → **Build completata con successo** (Vite bundles in produzione).
6. **Vincoli di Sicurezza**:
   - Nessun commit/push/pull eseguito su Git/GitHub.
   - Nessun deploy effettuato su Cloudflare o altri hosting.
   - Nessuna scrittura/migrazione effettuata sul database Supabase.
   - Stato pronto per **MOD-034** dopo collaudo utente.

### Nota finale (MOD-033G-FIX2 — Allineamento versione)
- **Allineamento Versione**: La dicitura visibile dell’app è stata allineata a **“Toolbox Funzioni Locali - Versione Beta 1.3”** su tutta la UI.
- **Centralizzazione Costante**: La costante `APP_NAME` in [src/constants.ts](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/constants.ts) alimenta correttamente sia la schermata di login sia la topbar.
- **Integrità file di configurazione**: `package.json` e `package-lock.json` restano alla versione `1.3.0-beta.1`.
- **Verifica Funzionale**: Il collaudo manuale utente ha verificato positivamente la schermata di login e la dashboard.
- **Vincoli**: Nessun commit, push, deploy o intervento su Supabase/database è stato eseguito.

---

## Sprint C.4.17 — MOD-034 Commit locale controllato Beta 1.3

**Stato**: ✅ COMPLETATO LOCALMENTE (Pronto per il push controllato)

### Dettaglio attività:
1. **Preparazione Commit**:
   - Selezionati ed aggiunti allo staging tutti i file modificati, nuovi e rimossi coerenti con lo Sprint C.4 e il rilascio di **Beta 1.3**.
   - Creato il report tecnico `MOD034_COMMIT_LOCALE_CONTROLLATO.md`.
   - Eseguito il commit locale sul branch `feature/sprint-c4-1-wizard-base` con messaggio `"feat(wizard): release Beta 1.3 fondi incentivanti workflow"`.
2. **Validazione pre-commit**:
   - `npx tsc --noEmit` -> Successo (0 errori).
   - `npx vitest run` -> Successo (367/367 test superati).
   - `npm run build` -> Successo (build di produzione corretta).
3. **Vincoli di Sicurezza rispettati**:
   - Il commit è puramente locale sul branch `feature/sprint-c4-1-wizard-base`.
   - Nessun push o pull su Git/GitHub.
   - Nessun deploy effettuato su Cloudflare.
   - Nessuna modifica, migrazione o scrittura effettuata sul database Supabase.

---

## Sprint C.4.18 — MOD-036 / MOD-036B: Verifica post-merge e collaudo produzione Beta 1.3 (Giugno 2026)

**Stato**: ✅ COMPLETATO CON SUCCESSO (Collaudo in produzione riuscito)

### Dettaglio attività:
1. **Verifica Git & Merge**:
   - Confermato che la PR #3 è stata unita (Merged) e chiusa su GitHub.
   - Il branch remoto `origin/main` è allineato al commit di merge `68d3e80`.
2. **Collaudo Produzione (Live)**:
   - Verificato il deploy live su Cloudflare Pages all'indirizzo: `https://entilocaliapp.fpcgillombardia.workers.dev/`.
   - Il titolo di login e la topbar dell'app mostrano correttamente: **"Toolbox Funzioni Locali - Versione Beta 1.3"**.
   - La card dashboard è configurata correttamente come **“Configurazione fondi incentivanti”** ed i riferimenti legacy sono stati eliminati.
3. **Verifica Database & Supabase**:
   - Connessione a Supabase stabile ed intatta.
   - Il caricamento degli enti (es. "Comune di Treviglio"), degli esercizi (2026, 2027, 2030) e dei dati storici/fondo esistenti è avvenuto con successo senza alcuna regressione, alterazione di dati o necessità di migrazione dello schema SQL.
   - Nessun errore bloccante riscontrato in console browser.

## Sprint C.4.19 — MOD-036C: Correzione caricamento enti e annualità per ADMIN (Giugno 2026)

**Stato**: 🟢 COMPLETATO (Patch locale validata e caricata)

### Dettaglio attività:
1. **Analisi Bug**:
   - Rilevata race condition all'inizializzazione: il caricamento enti partiva prima che il ruolo dell'utente (`state.currentUser.role`) fosse popolato da `fetchUserRoleWorkflow`. L'utente `ADMIN` veniva valutato con ruolo `undefined` e le query applicavano il filtro `user_id = user.id`.
   - L'effetto di caricamento enti non dipendeva dal ruolo e quindi non veniva rieseguito.
   - Nella gestione esercizi (`EntityYearManagementPage.tsx`), la query di caricamento anni forzava il filtro proprietario `.eq('user_id')` impedendo all'ADMIN di vedere gli anni per enti creati da terzi.
2. **Correzione Applicata**:
   - Aggiornato [AppContext.tsx](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/contexts/AppContext.tsx) per basare il caricamento degli enti su `state.currentUser` ed abilitare la reattività al cambio di ruolo (`state.currentUser?.role` inserito nelle dipendenze dell'effetto).
   - Risolto un loop infinito dovuto a dipendenza su intero oggetto `currentUser` escludendo il callback dalle dipendenze dell'effetto.
   - Aggiornato [EntityYearManagementPage.tsx](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/pages/EntityYearManagementPage.tsx) per condizionare il filtro `user_id` solo ad utenti non-ADMIN.
3. **Verifica & Validazione**:
   - Aggiunti unit test dedicati in [stateWorkflow.test.ts](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/application/__tests__/stateWorkflow.test.ts) verificando la corretta query di caricamento enti e anni per ADMIN e GUEST.
   - Typecheck, unit test (369 superati) e build eseguiti con successo.
   - Collaudo locale tramite browser tester riuscito senza alcun errore di console.

---

## Sprint C.4.20 — MOD-037B1: Preparazione persistenza remota Wizard 2026 (Giugno 2026)

**Stato**: ✅ COMPLETATO (Scaffolding preparatorio integrato e validato)

### Dettaglio attività:
1. **Configurazione Feature Flag**:
   - Aggiunto `VITE_ENABLE_WIZARD2026_REMOTE_DRAFTS=false` sia a [.env.example](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/.env.example) sia a [.env](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/.env) locale, per garantire che la funzionalità sia disattivata per default e sicura in produzione.
2. **File SQL di Migrazione**:
   - Creato il file SQL [20260602000000_create_wizard2026_drafts.sql](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/supabase/migrations/20260602000000_create_wizard2026_drafts.sql) in `supabase/migrations/` per documentare lo schema di database (`wizard2026_drafts`), indici, trigger `updated_at`, e politiche RLS (proprietario completo + ADMIN sola lettura). Il file è stato solo predisposto e NON applicato a nessun database.
3. **Tipi TypeScript**:
   - Creato il modulo [types.ts](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/features/wizard2026/remoteDraft/types.ts) per contenere le definizioni di `Wizard2026RemoteDraftRecord`, `Wizard2026LastTransferPayload`, `Wizard2026SyncStatus`, e `Wizard2026DraftSyncResult`.
4. **Repository Remoto Supabase**:
   - Creato [wizard2026RemoteDraftRepository.ts](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/application/wizard2026RemoteDraftRepository.ts) implementando `IWizard2026DraftRepository` con gestione RLS, feature flag e catch completo degli errori Supabase per evitare crash (fallback a localStorage).
5. **Orchestratore Hook di Sincronizzazione**:
   - Creato [useWizard2026RemoteDraftSync.ts](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/features/wizard2026/hooks/useWizard2026RemoteDraftSync.ts) per confrontare data di modifica locale e remota e decidere lo stato della sincronizzazione senza fare sovrascritture cieche in caso di conflitto.
6. **Integrazione dei Flussi e Badge UI**:
   - Integrato il remote sync hook all'interno del gestore della persistenza [useWizard2026Draft.ts](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/features/wizard2026/hooks/useWizard2026Draft.ts) e collegato a salvataggi e pulizia bozze.
   - Creato il componente Badge minimale [Wizard2026SyncStatusBadge.tsx](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/features/wizard2026/components/Wizard2026SyncStatusBadge.tsx) montato in [Wizard2026PreviewPage.tsx](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/features/wizard2026/components/Wizard2026SyncStatusBadge.tsx) (visibile solo se abilitato da feature flag).
7. **Verifiche e Test**:
   - Aggiunte suite di test unitari completi in [wizard2026RemoteDraftRepository.test.ts](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/application/__tests__/wizard2026RemoteDraftRepository.test.ts) e [wizard2026RemoteDraftSync.test.ts](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/features/wizard2026/__tests__/wizard2026RemoteDraftSync.test.ts) per verificare tutti i 10 scenari richiesti (flag, fallback, timestamps, conflict, manual operations).
- **Rotte/tab legacy**: 2 (`dataEntry` in sidebar, alias `/wizard-2026-preview` in App.tsx)
- **Import legacy ancora attivi**: 4 diretti da `DataEntryPage.tsx`
- **Rischi bloccanti per MOD-032**: 0 — il flusso Wizard 2026 non è interrotto
- **Chiavi sessionStorage legacy**: nessuna (non esistono chiavi wizard2023/2024/2025)
- **Chiavi da mantenere**: `fl_wizard2026_draft_*`, `fl_wizard2026_last_transfer_*`, `wizard2026_transfer_snapshot`, `wizard2026_transfer_success`, `fl_draft_*` (sistema globale fundData)

### Stato CLI (foto iniziale pre-pulizia)
- `npx tsc --noEmit` → **0 errori**
- `npx vitest run` → **51 file, 365 test, tutti PASS**
- `npm run build` → **OK (35s)**

### Piano proposto
Il piano MOD-033 prevede 5 fasi (A/B/C/D/E):
- **A**: Disconnessione rotte legacy (DataEntryPage, redirect App.tsx)
- **B**: Rimozione file categoria A (17 file steps+componenti wizard legacy)
- **C**: Refactor DataEntryPage (dipende da scelta utente su opzione A/B/C)
- **D**: Rimozione feature flag `ENABLE_WIZARD_2026_PREVIEW`
- **E**: Collaudo regressione finale

**Stato**: In attesa di approvazione utente per avviare MOD-033A.

*Aggiornamento: 29 Maggio 2026 — MOD-033 Fase 1 (audit) completata.*

---

## MOD-033 — Pulizia vecchi wizard: Fase A/B (Maggio 2026)

**Stato**: ✅ COMPLETATO LOCALMENTE (Collaudo manuale utente superato)

### Dettaglio attività:
1. **Fase A (Disconnessione)**:
   - Rimosso il tab legacy `dataEntry` dal menu della sidebar (`Sidebar.tsx`).
   - Aggiornati i reindirizzamenti su `ReportsPage.tsx` per puntare al modulo consolidato `wizard2026Preview`.
   - Aggiornata la suite di test unitari `accessMatrix.test.ts` per verificare la rimozione di `dataEntry` e la corretta accessibilità condizionale di `wizard2026Preview`.
2. **Fase B (Rimozione fisica)**:
   - Eliminata in blocco la cartella legacy `src/components/wizard/` (17 file).
   - Eliminata la pagina `src/pages/DataEntryPage.tsx`.
   - Eseguito audit testuale per garantire l'assenza di import o riferimenti morti a moduli o componenti rimossi.
3. **Fase C (Dashboard Card Refactoring & Rinomina)**:
   - **MOD-033C-FIX1**: Spostata la card del wizard `wizard2026Preview` modificandone lo scope in `DASHBOARD` per posizionarla subito dopo la card "Enti e Annualità".
   - **MOD-033C-FIX2**: Rinominata la card in **“Configurazione fondi incentivanti”** con mantenimento invariato di ID, route `/configurazione-fondo-preview` e logica di aggancio.
   - **Collaudo manuale**: Eseguito dall'utente con esito positivo.

### Controlli eseguiti in locale:
- `npx tsc --noEmit` → **0 errori**
- `npx vitest run` → **365/365 test superati (100% PASS)**
- `npm run build` → **Build completata con successo**

### Vincoli di sicurezza:
- Nessun commit/push/pull eseguito su Git/GitHub.
- Nessun deploy effettuato su Cloudflare o workers.dev.
- Nessuna scrittura/migrazione effettuata sul database Supabase.
- Intervento confinato interamente all'ambiente locale/offline.

## MOD-033D — Audit Persistenza e Consistenza Dati (Maggio 2026)

**Stato**: ✅ COMPLETATO (Report generato in `MOD033D_VERIFICA_PERSISTENZA_CONSISTENZA_DATI.md`)

### Dettaglio attività:
1. **Analisi Storage Chiavi**: Identificate e mappate tutte le chiavi in `sessionStorage` e `localStorage` legate a Wizard 2026, bozza del Fondo (`fl_draft_*`), e tracciamento contesto.
2. **Identificazione Rischi**: Evidenziata la natura volatile di `sessionStorage` per le bozze del Wizard e del Fondo, comportando il rischio di perdita dati alla chiusura della tab/browser prima del salvataggio su database remoto.
3. **Flussi Verificati**: Confermato che i dati inseriti nel Wizard non si perdono nei refresh/cambi pagina e che il trasferimento non sovrascrive i campi modificati manualmente grazie alla logica di `CONFLICT` in `transferPreviewEngine.ts`.
4. **Verifiche Tecniche**:
   - `npx tsc --noEmit` → **0 errori**
   - `npx vitest run` → **365/365 test superati (100% PASS)**
- `npm run build` → **Build completata con successo in 46.21s**
5. **Vincoli di Sicurezza**: Nessun commit, push, pull, deploy o modifica DB remota effettuata.

## MOD-033D-FIX1 — Persistenza locale durevole (Maggio 2026)

**Stato**: ✅ COMPLETATO (Report generato in `MOD033D_FIX1_persistenza_locale_durevole.md`)

### Dettaglio attività:
1. **Sostituzione Storage**: Spostata la memorizzazione delle bozze Wizard (`fl_wizard2026_draft_*`), dell'ultimo trasferimento (`fl_wizard2026_last_transfer_*`) e della bozza Fondo (`fl_draft_*`) da `sessionStorage` a `localStorage`.
2. **Migrazione Automatica**: Implementata funzione trasparente che copia in sicurezza i dati pre-esistenti da `sessionStorage` a `localStorage` (senza sovrascrivere valori esistenti) all'apertura del modulo.
3. **Verifiche di Regressione**:
   - `npx tsc --noEmit` → **0 errori**
   - `npx vitest run` → **367/367 test superati (100% PASS)**
   - `npm run build` → **Build completata con successo in 33.66s**
4. **Vincoli di Sicurezza**: Supabase/database non modificati, nessun deploy, nessun commit/push su Git.

## Sprint C.4.16 — MOD-033G: Beta 1.3, rimozione Preview e README (Giugno 2026)

**Stato**: ✅ COMPLETATO (Report generato in `MOD033G_BETA13_RIMOZIONE_PREVIEW_README.md`)

### Dettaglio attività:
1. **Rilascio Beta 1.3**:
   - Versione pubblica: **Beta 1.3**.
   - Versione tecnica: **1.3.0-beta.1** (aggiornata in `package.json` e `package-lock.json`).
2. **Rimozione diciture Preview**:
   - Rimosse tutte le diciture "Preview", "PREVIEW" e "Anteprima" dall'interfaccia visibile all'utente.
   - Sostituito il banner superiore nel layout del Wizard con la dicitura definitiva **"Flusso 2026 attivo — Compilazione guidata per la raccolta dati dell’Ente e la determinazione dei fondi incentivanti."** (con stile slate e indicatore attivo verde).
   - Rinominati i bottoni e i testi della schermata di onboarding (sinistra: **"Raccolta dati"** - descr: *"Compila o aggiorna i dati necessari al calcolo e al trasferimento verso la Costituzione dei fondi."* - btn: *"Apri raccolta dati"*; destra: **"Costituzione dei fondi"** - descr: *"Verifica i dati trasferiti, controlla i prospetti e completa le eventuali rettifiche."* - btn: *"Vai alla costituzione dei fondi"*).
   - Mantenuti intatti i nomi tecnici interni delle rotte e degli ID dei moduli (`wizard2026Preview`, `/configurazione-fondo-preview`).
3. **Aggiornamento README.md**:
   - Inserita sezione specifica **"## Beta 1.3 — Configurazione fondi incentivanti 2026"** documentando il flusso principale, raccolta dati, allineamento fondi, persistenza locale durevole, pulizia legacy, stato del rilascio offline e requisiti ambientali.
4. **Rimozione Feature Flag Obsoleto**:
   - Rimossa la variabile `VITE_ENABLE_WIZARD_2026_PREVIEW` da `.env.example` poiché il flusso è ora integrato e permanentemente attivo.
5. **Verifiche di Regressione**:
   - `npx tsc --noEmit` → **0 errori** (puliti import non utilizzati).
   - `npx vitest run` → **367/367 test superati (100% PASS)** (aggiornate le asserzioni di test sulle diciture UI).
   - `npm run build` → **Build completata con successo** (Vite bundles in produzione).
6. **Vincoli di Sicurezza**:
   - Nessun commit/push/pull eseguito su Git/GitHub.
   - Nessun deploy effettuato su Cloudflare o altri hosting.
   - Nessuna scrittura/migrazione effettuata sul database Supabase.
   - Stato pronto per **MOD-034** dopo collaudo utente.

### Nota finale (MOD-033G-FIX2 — Allineamento versione)
- **Allineamento Versione**: La dicitura visibile dell’app è stata allineata a **“Toolbox Funzioni Locali - Versione Beta 1.3”** su tutta la UI.
- **Centralizzazione Costante**: La costante `APP_NAME` in [src/constants.ts](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/constants.ts) alimenta correttamente sia la schermata di login sia la topbar.
- **Integrità file di configurazione**: `package.json` e `package-lock.json` restano alla versione `1.3.0-beta.1`.
- **Verifica Funzionale**: Il collaudo manuale utente ha verificato positivamente la schermata di login e la dashboard.
- **Vincoli**: Nessun commit, push, deploy o intervento su Supabase/database è stato eseguito.

---

## Sprint C.4.17 — MOD-034 Commit locale controllato Beta 1.3

**Stato**: ✅ COMPLETATO LOCALMENTE (Pronto per il push controllato)

### Dettaglio attività:
1. **Preparazione Commit**:
   - Selezionati ed aggiunti allo staging tutti i file modificati, nuovi e rimossi coerenti con lo Sprint C.4 e il rilascio di **Beta 1.3**.
   - Creato il report tecnico `MOD034_COMMIT_LOCALE_CONTROLLATO.md`.
   - Eseguito il commit locale sul branch `feature/sprint-c4-1-wizard-base` con messaggio `"feat(wizard): release Beta 1.3 fondi incentivanti workflow"`.
2. **Validazione pre-commit**:
   - `npx tsc --noEmit` -> Successo (0 errori).
   - `npx vitest run` -> Successo (367/367 test superati).
   - `npm run build` -> Successo (build di produzione corretta).
3. **Vincoli di Sicurezza rispettati**:
   - Il commit è puramente locale sul branch `feature/sprint-c4-1-wizard-base`.
   - Nessun push o pull su Git/GitHub.
   - Nessun deploy effettuato su Cloudflare.
   - Nessuna modifica, migrazione o scrittura effettuata sul database Supabase.

---

## Sprint C.4.18 — MOD-036 / MOD-036B: Verifica post-merge e collaudo produzione Beta 1.3 (Giugno 2026)

**Stato**: ✅ COMPLETATO CON SUCCESSO (Collaudo in produzione riuscito)

### Dettaglio attività:
1. **Verifica Git & Merge**:
   - Confermato che la PR #3 è stata unita (Merged) e chiusa su GitHub.
   - Il branch remoto `origin/main` è allineato al commit di merge `68d3e80`.
2. **Collaudo Produzione (Live)**:
   - Verificato il deploy live su Cloudflare Pages all'indirizzo: `https://entilocaliapp.fpcgillombardia.workers.dev/`.
   - Aggiornato `src/contexts/AppContext.tsx` per basare il caricamento degli enti su `state.currentUser` ed abilitare la reattività al cambio di ruolo (`state.currentUser?.role` inserito nelle dipendenze dell'effetto).
   - Risolto un loop infinito dovuto a dipendenza su intero oggetto `currentUser` escludendo il callback dalle dipendenze dell'effetto.
   - Aggiornato `src/pages/EntityYearManagementPage.tsx` per condizionare il filtro `user_id` solo ad utenti non-ADMIN.
3. **Verifica & Validazione**:
   - Aggiunti unit test dedicati in `src/application/__tests__/stateWorkflow.test.ts` verificando la corretta query di caricamento enti e anni per ADMIN e GUEST.
   - Typecheck, unit test (369 superati) e build eseguiti con successo.
   - Collaudo locale tramite browser tester riuscito senza alcun errore di console.

---

## Sprint C.4.20 — MOD-037B1: Preparazione persistenza remota Wizard 2026 (Giugno 2026)

**Stato**: ✅ COMPLETATO (Scaffolding preparatorio integrato e validato)

### Dettaglio attività:
1. **Configurazione Feature Flag**:
   - Aggiunto `VITE_ENABLE_WIZARD2026_REMOTE_DRAFTS=false` sia a `.env.example` sia a `.env` locale, per garantire che la funzionalità sia disattivata per default e sicura in produzione.
2. **File SQL di Migrazione**:
   - Creato il file SQL `supabase/migrations/20260602000000_create_wizard2026_drafts.sql` in `supabase/migrations/` per documentare lo schema di database (`wizard2026_drafts`), indici, trigger `updated_at`, e politiche RLS (proprietario completo + ADMIN sola lettura). Il file è stato solo predisposto e NON applicato a nessun database.
3. **Tipi TypeScript**:
   - Creato il modulo `src/features/wizard2026/remoteDraft/types.ts` per contenere le definizioni di `Wizard2026RemoteDraftRecord`, `Wizard2026LastTransferPayload`, `Wizard2026SyncStatus`, e `Wizard2026DraftSyncResult`.
4. **Repository Remoto Supabase**:
   - Creato `src/application/wizard2026RemoteDraftRepository.ts` implementando `IWizard2026DraftRepository` con gestione RLS, feature flag e catch completo degli errori Supabase per evitare crash (fallback a localStorage).
5. **Orchestratore Hook di Sincronizzazione**:
   - Creato `src/features/wizard2026/hooks/useWizard2026RemoteDraftSync.ts` per confrontare data di modifica locale e remota e decidere lo stato della sincronizzazione senza fare sovrascritture cieche in caso di conflitto.
6. **Integrazione dei Flussi e Badge UI**:
   - Integrato il remote sync hook all'interno del gestore della persistenza `src/features/wizard2026/hooks/useWizard2026Draft.ts` e collegato a salvataggi e pulizia bozze.
   - Creato il componente Badge minimale `src/features/wizard2026/components/Wizard2026SyncStatusBadge.tsx` montato in `src/features/wizard2026/components/Wizard2026SyncStatusBadge.tsx` (visibile solo se abilitato da feature flag).
7. **Verifiche e Test**:
   - Aggiunte suite di test unitari completi in `src/application/__tests__/wizard2026RemoteDraftRepository.test.ts` e `src/features/wizard2026/__tests__/wizard2026RemoteDraftSync.test.ts` per verificare tutti i 10 scenari richiesti (flag, fallback, timestamps, conflict, manual operations).
   - Eseguito `npx tsc --noEmit` → Successo (0 errori).
   - Eseguito `npx vitest run` → Successo (391/391 test superati).
   - Eseguito `npm run build` → Successo (Vite build completata).
8. **Vincoli di Sicurezza rispettati**:
   - Nessun commit/push effettuato su Git.
   - Nessun deploy eseguito.
   - Nessuna migrazione SQL eseguita in database, nessuna scrittura o modifica a `user_app_state`.

---

## Sprint C.4.21 — MOD-037B1-REVIEW: Audit pre-migrazione persistenza remota Wizard 2026 (Giugno 2026)

**Stato**: ✅ COMPLETATO (Audit superato con successo, pronto per PR e migrazione)

### Dettaglio attività:
1. **Verifica Git e File Sensibili**:
   - `git status` e `git ls-files` eseguiti: confermato l'isolamento dei file locali `.env`, `.env.local` e `.env.production` (non tracciati).
   - Nessuna chiave o credenziale sensibile è stata committata o tracciata.
2. **Verifica Feature Flag**:
   - Confermato `VITE_ENABLE_WIZARD2026_REMOTE_DRAFTS=false` come default in `.env.example`.
   - Validato che con flag disattivato il modulo remoto rimanga completamente silente e l'app funzioni al 100% solo tramite `localStorage` (nessuna regressione UI/UX).
3. **Analisi SQL e RLS**:
   - Validato lo schema proposto in `supabase/migrations/20260602000000_create_wizard2026_drafts.sql`. Le policy RLS limitano correttamente la scrittura/lettura all'owner e abilitano la sola lettura all'ADMIN basandosi sulla funzione `public.is_admin()`, di cui è stata integrata la creazione sicura e idempotente direttamente in testa al file SQL.
4. **Isolamento Wizard/Fondo**:
   - Confermato che i dati di bozza Wizard risiedono esclusivamente sulla nuova tabella dedicati e non interferiscono in alcun modo con `user_app_state.fund_data` o il workflow ufficiale dei Fondi.
5. **Verifica Conflitti**:
   - Testata e validata la logica di non-sovrascrittura automatica in caso di divergenza tra locale e cloud (stati `conflict` e `remote_newer` disabilitano l'autosave debounced).
6. **Verifica Esecuzione Test**:
   - `npx tsc --noEmit` → Successo (0 errori).
   - `npx vitest run` → Successo (391/391 test superati).
   - `npm run build` → Successo (Vite build completata).
7. **Rischi e Decisioni**:
   - Non sono stati eseguiti commit, push, deploy o query/migrazioni SQL remote.
   - Raccomandazione finale: procedere con lo sprint successivo (PR del codice di scaffolding e applicazione della migrazione SQL su ambiente di staging per MOD-037B2).

---

## Sprint C.4.22 — MOD-037B4D: Verifica indipendente su Staging e collaudo reale persistenza remota Wizard 2026 (Giugno 2026)

**Stato**: ✅ COMPLETATO (Collaudo e audit superati con successo in staging)

### Dettaglio attività:
1. **Precheck Sicurezza**:
   - Confermato che il file `.env` locale punta esclusivamente al database di staging `mcasgpaivyosaroxrodm`.
   - Verificato che il database di produzione `yggokplxleredipknfbq` non è stato toccato.
   - Confermato che il feature flag `VITE_ENABLE_WIZARD2026_REMOTE_DRAFTS` è impostato su `false` di default in `.env.example` ed è ignorato dal tracciamento Git.
2. **Audit Schema e Politiche RLS**:
   - Verificato che le tabelle `profiles`, `entities`, `user_app_state` e `wizard2026_drafts` siano presenti e interrogabili in staging.
   - Testate con successo le 6 regole di conformità RLS:
     - Standard user read/write own draft (OK).
     - Isolamento utenti standard (OK, 0 righe lette, scritture bloccate da RLS).
     - Admin read-only global access (OK, SELECT funzionante, UPDATE/DELETE bloccati).
     - Gestione soft delete (OK, riga recuperata con `deleted_at` e filtrata dall'applicazione).
     - Upsert successivo per ripristino `deleted_at = null` (OK, nessun duplicato).
     - Assenza di leakage e scritture su `user_app_state` durante la persistenza delle bozze (OK).
3. **Bug Fix SELECT Policy**:
   - Rilevato errore RLS durante l'UPDATE per il soft delete dovuto alla vecchia policy di SELECT con filtro `deleted_at IS NULL`.
   - Creata ed applicata la migrazione `supabase/migrations/20260602001000_adjust_wizard2026_drafts_select_policy.sql` che cambia la policy SELECT in `auth.uid() = user_id`, delegando il filtraggio del record cancellato logicamente all'applicazione.
4. **Collaudo Applicativo Reale**:
   - Validati con successo gli scenari di creazione bozza remota, recupero dati dopo rinfresco della sessione, rilevamento e gestione conflitti multi-dispositivo (sospensione autosave) e trasferimento finale ed isolato alla Costituzione dei fondi.
5. **Verifiche di Stabilità**:
   - `npx tsc --noEmit` → Successo (0 errori).
   - `npx vitest run` → Successo (392/392 test passati).
   - `npm run build` → Successo (Vite build completata).
6. **Report Finale**:
   - Generato il documento di collaudo `MOD037B4D_VERIFICA_STAGING_E_COLLAUDO_REALE_WIZARD_REMOTE_DRAFTS.md`.

---

## Sprint C.4.23 — MOD-037B5: Consolidamento migrazioni staging e preparazione PR sicura (Giugno 2026)

**Stato**: ✅ COMPLETATO (Consolidamento migrazioni e preparazione PR effettuati con successo)

### Dettaglio attività:
1. **Verifica Git e Sicurezza**:
   - Confermato che il branch attivo è `main`.
   - Confermato tramite `git check-ignore` e `git ls-files` l'assenza di credenziali, password, o file `.env` tracciati nel repository.
2. **Consolidamento Migrazioni SQL**:
   - Verificata la presenza di `supabase/migrations/20260602000000_create_wizard2026_drafts.sql` e `supabase/migrations/20260602001000_adjust_wizard2026_drafts_select_policy.sql` in `supabase/migrations/`.
   - Entrambe le migrazioni sono scritte in modo sicuro e idempotente, operando in modo isolato sulla tabella `wizard2026_drafts` ed escludendo qualsiasi alterazione a tabelle esistenti (es. `user_app_state`, `entities`, `profiles`).
3. **Coerenza RLS e Isolamento Produzione**:
   - Confermato il funzionamento delle policy RLS: isolamento completo per gli utenti ordinari, accesso globale in sola lettura per l'ADMIN, e ripristino di record soft-deleted tramite upsert senza creare righe duplicate.
   - Connessione e configurazione del database di produzione (`yggokplxleredipknfbq`) rimaste completamente intatte.
   - Il feature flag `VITE_ENABLE_WIZARD2026_REMOTE_DRAFTS` rimane impostato su `false` di default in `.env.example` ed in tutti i file versionati.
4. **Verifiche e Controlli Automatici**:
   - Typecheck (`npx tsc --noEmit`) → Successo (0 errori).
   - Test unitari (`npx vitest run`) → Successo (392/392 superati).
   - Build di produzione (`npm run build`) → Successo.
5. **Report Finale**:
   - Creato il report `MOD037B5_CONSOLIDAMENTO_MIGRAZIONI_STAGING_E_PR_SICURA.md`.
6. **Prossimo Passo**:
   - Ottenere l'autorizzazione dell'utente per eseguire il commit, il push e l'apertura della Pull Request del codice consolidato e delle migrazioni SQL tracciate.

---

## Sprint C.4.24 — MOD-037B5-FIX1: Correzione ordine migrazione RLS (Giugno 2026)

**Stato**: ✅ COMPLETATO (Ordinamento migrazioni corretto e validato)

### Dettaglio attività:
1. **Riordinamento Temporale delle Migrazioni**:
   - Rinominata la migrazione correttiva da `20260220000022_adjust_select_policy.sql` a `supabase/migrations/20260602001000_adjust_wizard2026_drafts_select_policy.sql`.
   - In questo modo la migrazione correttiva ha un timestamp successivo a `supabase/migrations/20260602000000_create_wizard2026_drafts.sql`, garantendo che la creazione della tabella avvenga sempre prima della modifica della policy di SELECT in fase di bootstrapping del database.
2. **Verifiche di Idempotenza e Sicurezza**:
   - Confermato che la policy finale risultante è corretta (`USING (auth.uid() = user_id)`).
   - Confermato che non sono state modificate altre tabelle (`user_app_state`, `profiles`, `entities`) o funzioni globali.
   - Database di produzione (`yggokplxleredipknfbq`) non interessato e feature flag locale disattivato di default.
3. **Controlli Automatici di Stabilità**:
   - Typecheck (`npx tsc --noEmit`) → Successo (0 errori).
   - Test unitari (`npx vitest run`) → Successo (392/392 superati).
   - Build di produzione (`npm run build`) → Successo (Vite build completata).
4. **Report Finale**:
   - Creato il report `MOD037B5_FIX1_CORREZIONE_ORDINE_MIGRAZIONE_RLS.md`.

---

## Sprint C.4.25 — MOD-037B6-FIX1: Verifica push branch e apertura Draft PR (Giugno 2026)

**Stato**: ✅ COMPLETATO (Verifica allineamento branch e PR eseguita con successo)

### Dettaglio attività:
1. **Verifica Allineamento Git**:
   - Confermato che il branch locale attivo è `feature/mod037b5-consolidate-wizard-remote-drafts-migrations`.
   - Eseguito `git ls-remote` confermando la presenza remota del branch con l'hash corretto `cdbf73a` e allineato all'ultimo commit locale `chore(db): consolidate wizard remote drafts migrations`.
2. **Conformità e Controlli**:
   - Escluso definitivamente il vecchio file `20260220000022_adjust_select_policy.sql` dal tracciamento.
   - Verificata la corretta inclusione della migrazione `supabase/migrations/20260602001000_adjust_wizard2026_drafts_select_policy.sql`.
   - Verificato che nessun file `.env` locale sia tracciato o caricato su GitHub.
3. **Isolamento Produzione**:
   - Il database di produzione (`yggokplxleredipknfbq`) non è stato minimamente impattato o referenziato.
   - Il feature flag di produzione resta spento in `.env.example`.
4. **Report Finale**:
   - Creato il report `MOD037B6_FIX1_VERIFICA_PUSH_BRANCH_E_PR.md` contenente il link per l'apertura manuale della Draft PR.




