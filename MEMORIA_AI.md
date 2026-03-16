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
- **CSS / UI**: Tailwind CSS per il design.
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
29. **Refactoring PDF Report (Premium)**: Ricreata completamente la generazione del PDF "Riepilogo Generale" trasformandolo in un documento professionale di 8 pagine, con grafici a barre, KPI box bordeaux, barre di progresso visuali per i limiti e tabelle di conformità semaforiche.
30. **Esportazione XLS Nativa Premium (ExcelJS)**: Sostituito il vecchio sistema XLS-HTML con un motore nativo basato su `ExcelJS`. Il file include ora: tema bordeaux coerente con l'app, Quadro A (Risorse), Quadro B (Utilizzi), e Quadro C (Verifica Limite Art. 23) con decurtazioni automatiche e segnalazione esito verde/rosso.
31. **Sistema Segnalazione Feedback/Bug**: Progettata e avviata l'implementazione di un sistema di feedback interno per segnalare bug o richieste di modifiche, con area dedicata agli amministratori e persistenza tramite Supabase.
33. **Sincronizzazione Real-time Denominazione Ente**: Implementata la sincronizzazione immediata tra il form di inserimento e l'header dell'applicazione. La modifica del nome dell'ente viene ora persistita correttamente nella tabella `entities` del database Supabase.
34. **Fix Creazione Nuovi Utenti**: Corretta la Edge Function `create-user` per garantire che ogni nuovo utente riceva automaticamente un'entità predefinita e un record in `user_app_state`, risolvendo il problema della mancata visibilità degli utenti appena creati.
35. **Architettura Modulare a "Ambiti" (Scopes)**: Riprogettata l'intera navigazione per isolare le aree funzionali (Fondo, Comunicazioni, Admin).
36. **Dashboard Hub**: Trasformata la Dashboard in un portale di atterraggio pulito (hub), rimuovendo statistiche pesanti e rendendola un portale di accesso rapido ai moduli.
37. **Navigazione Scoped**: Implementato filtraggio dinamico della sidebar in base all'ambito attivo, con pulsante di ritorno "Dashboard" per resettare il contesto.
38. **Area Comunicazioni**: Integrata struttura per Messaggi, Notifiche e Feedback con navigazione dedicata.
39. **Import/Export Excel Massivo (Dati Fondo)**: Sviluppato un sistema avanzato di gestione dati tramite fogli di calcolo. 
    - Mappatura di oltre **150 variabili** (Dati Generali, Storici, CCNL 2024-26, Risorse Stabili/Variabili, EQ, Segretario, Dirigenza e Simulatore).
    - Logica di "Deep Merge" nel reducer per importare dati massivi senza sovrascrivere configurazioni pre-esistenti non mappate.
    - Salvataggio automatico sul database al completamento del caricamento del file.
41. **Sincronizzazione Permanente Utenti (SQL Trigger)**: Sviluppato uno script SQL che automatizza la creazione del profilo database (`user_app_state`) tramite un trigger Postgres. Questo garantisce che ogni nuovo utente autenticato sia immediatamente visibile e gestibile dall'amministratore, prevenendo utenti "orfani".
42. **Ripristino Moduli Funzionali Storici**: Reintegrati i componenti precedentemente rimossi o sostituiti da placeholder: Fondo Dirigenza, EQ, Segretario, Sistema Feedback reale e Gestione Anni.
43. **Ottimizzazione Flusso "Costituzione Fondo"**: Riorganizzato l'ambito Fondo secondo un flusso logico sequenziale (Personale -> Risorse -> Fondi Specifici -> Assistente AI -> Compliance -> Destinazione -> Report). 
44. **Ripristino Assistente AI (Chatbot)**: Reintegrato il modulo `ChecklistPage` come "Verifica Assistita AI", permettendo verifiche basate sul regolamento e sui dati real-time.
45. **Pulizia e Consolidamento App.tsx**: Rimossi placeholder ed eliminati import inutilizzati per ottimizzare la struttura della navigazione a "Ambiti".
48. **Sistema Notifiche Real-time**: Implementata pagina dedicata per la gestione delle notifiche (lette/non lette) con area di invio riservata agli amministratori.
49. **Controllo Accessi Dashboard (RBAC)**: Limitata la visibilità del modulo "Gestione Utenti" esclusivamente ai profili Administrator.
50. **Ottimizzazione UI Dashboard**: Rimosso l'header "Home" ridondante e reso il logo cliccabile per il ritorno rapido all'Hub centrale.
51. **Riorganizzazione Sidebar Fondo (Sequenziale)**: Riordinata la sidebar del modulo Fondo per riflettere il processo naturale di configurazione (Panoramica -> Dati -> Personale -> Risorse -> Dettagli -> Conformità -> Chatbot -> Report).
52. **Decoupling Report e AI**: Separati i moduli "Richiedi Info" (Chatbot) e "Stampe e Report" (Documenti ufficiali) per una migliore chiarezza funzionale.
53. **Dynamic Context Reflection**: Inserimento automatico dell'anno di riferimento nelle voci della sidebar (es. "Personale in servizio nell'anno 2026").
54. **Priorità Configurazione Iniziale**: Spostato il modulo "Enti e Annualità" come prima voce della Dashboard per guidare l'utente all'impostazione del contesto.
55. **Icone Coerenti (Material UI)**: Rinnovato il set di icone della sidebar per una maggiore corrispondenza visiva con i contenuti delle pagine.
56. **Ripristino Analisi Feedback (Admin)**: Reintegrata la pagina di gestione feedback per gli amministratori nell'ambito "Comunicazioni". Implementata visibilità condizionale nella sidebar (solo per ruolo ADMIN) e configurazione delle rotte in `App.tsx`.
57. **Avvio e Verifica Ambiente Locale**: Avviata l'applicazione in ambiente di sviluppo (`npm run dev`) e verificata la corretta operatività del login, della dashboard hub e del sistema di controllo accessi (RBAC).
58. **Cleanup Pagina "Stampe e Report"**: Rimosse le card segnaposto delle funzionalità non ancora implementate (Relazione illustrativa, Relazione tecnico-finanziaria ed Esportazione dati per conto annuale) per migliorare l'esperienza utente e la pulizia della UI.
59. **Fix Build Cloudflare & TypeScript**: Risolti errori di compilazione TS in `App.tsx` (import inutilizzati) e `EntityYearManagementPage.tsx` (tipo errato per prop `size`), garantendo il deploy corretto su Cloudflare.
60. **Configurazione Moduli Dinamica**: Implementata logica di visibilità condizionale in `App.tsx`. Il modulo "Fondo Dirigenza" viene ora nascosto automaticamente se l'ente è configurato come "senza dirigenza" nei Dati Generali.
61. **Modulo 'Calcolo straordinari e indennità'**: Rifatto integralmente il modulo (precedentemente 'Calcolatore Compensi') per allinearlo al CCNL 23.02.2026. Include nuove tabelle stipendiali, calcolo automatico del rateo 13ª nello straordinario, differenziali per aree e sezioni speciali, e rebranding completo dell'interfaccia.
62. **Onboarding Guidato & Zero-Entity**: Disabilitata la creazione automatica di enti predefiniti. I nuovi utenti ora atterrano su una dashboard che li guida alla creazione del primo ente, prevenendo dati "fantasma" all'ingresso.
63. **Integrità Cancellazione Utente**: Implementata logica di eliminazione completa tramite Edge Function (`delete-user`) e vincoli `ON DELETE CASCADE` nel database. L'eliminazione di un utente ora rimuove anche tutti i suoi enti e record di stato associati, garantendo una pulizia totale.
64. **Rebranding: "Toolbox Funzioni Locali"**: Consolidata l'identità dell'app. Rinominato il calcolatore compensi e centralizzato il nome tramite la costante `APP_NAME`. Aggiornati i riferimenti normativi (Art. 74, Art. 62, Art. 30) nelle pagine dedicate.
65. **Affinamento Calcolo Compensi (Basi ARAN)**: Perfezionata la logica del modulo straordinari/indennità distinguendo tra tre basi di calcolo (Art. 74 CCNL 2022):
    - **Base b (Straordinario)**: Con rateo 13ª, escluse RIA e Comparto.
    - **Individuale c (Turno)**: Base b (senza 13ª) + RIA. Compenso come sola maggiorazione oraria.
    - **Globale di Fatto d (Supplementare)**: Individuale c + 13ª + Comparto + Accessori.
    - **Divisori**: Implementati 156 (36h) e 151,66 (35h).

---
*Ultimo aggiornamento automatico: 16 Marzo 2026 (Fine Pomeriggio)*
