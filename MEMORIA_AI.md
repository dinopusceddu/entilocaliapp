# 🧠 MEMORIA AI - Contesto di Progetto

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
*Ultimo aggiornamento automatico: 14 Aprile 2026 — Risolto errore di sintassi JSX in Header.tsx e finalizzata pipeline di deploy.*


