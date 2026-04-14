# Implementation Plan: Modulo "Normativa"

## 1. Analisi del Contesto Attuale (Dal Repository e `memoria_AI.md`)
L'architettura dell'applicativo `entilocaliapp` si basa su:
- **Tecnologie:** React, TypeScript, Vite, Tailwind CSS, Supabase per l'autenticazione e i dati.
- **Routing & Architettura a "Scopes":** Come documentato in `App.tsx` e `types.ts`, il sistema non usa react-router standard ma un layout modulare basato sull'enum `NavigationScope` (`DASHBOARD`, `FONDO`, `COMUNICAZIONI`, `ADMIN`).
- **Layout:** Il componente `MainLayout` carica dinamicamente la sidebar in base allo scope selezionato.
- **Librerie UI:** Vengono riutilizzati vari componenti "headless" o in stile Tailwind presenti in `src/components/shared/` (`Card`, `Modal`, `Button`, `Input`, `Select`, etc.). Icone via `lucide-react`.

## 2. Ingestione dei Documenti (Pipeline)
- **Sorgente:** I documenti DOCX forniti (raccolta CCNL, guida al contratto).
- **Strumento:** Creeremo uno script Node.js inserito in `scripts/doc-ingestion/` che utilizzerà la libreria `mammoth` o similari per parsare i DOCX estraendone testo ed HTML pulito, mantenendo la gerarchia dei titoli/articoli.
- **Output:** Il risultato sarà una base dati locale salvata come file JSON strutturati (es. `normativa_ccnl.json`) da salvare in `src/data/normativa/` o `public/`, rendendo i documenti consumabili rapidamente dall'applicazione frontend senza bisogno di backend complessi.

## 3. Nuova Area "Normativa" (Architettura React/TS)
Il modulo sarà concepito come integrato e non come "progetto a parte".
- **Nuovo Scope:** Aggiungeremo `NavigationScope.NORMATIVA` al file `src/types.ts`.
- **Rotte/Moduli:** Verranno aggiunti i componenti di entry-point in `src/pages/normativa/` (es. `NormativaDashboardPage.tsx`, `ContractViewerPage.tsx`), per poi essere censiti nell'elenco `allPageModules` dentro `App.tsx`.
- **UI/Motore di ricerca:** In `src/components/normativa/` realizzeremo un motore di ricerca testo (text-matching) per sfogliare comodamente articoli, commi o argomenti. Verrà integrata anche una navigazione albero a lato (Titolo, Capo, Articolo).

## 4. Integrazione con i Moduli dell'App "Fondo"
- L'obiettivo principale è la sinergia. Grazie al Global Context già esistente (`AppContext.tsx`), predisporremo helper function o componenti (es. `NormaLink`) posizionabili vicino ai campi di calcolo.
- Questi bottoni permetteranno, al click, di aprire il `Modal` esistente popolato dinamicamente con il testo normativo oppure re-inderizzare l'utente al modulo Normativa mantenendo a fuoco lo spacco di contratto corretto.

## 5. Prossimi Step Operativi
1. Test e consolidamento dello script Node DOCX -> JSON.
2. Definizione dell'interfaccia TypeScript per la struttura dei Dati Normativi (Titolo, Articolo, Contenuto, Tags).
3. Creazione delle view in React e logiche di filtro testuale.
4. Connessione della nuova sezione al menu principale dell'Applicativo.
5. Inserimento dei "rimandi normativi" in specifiche view già collaudate in produzione (es. `FondoAccessorioDipendentePage.tsx` e `CompensatoreDelegatoPage.tsx`).
