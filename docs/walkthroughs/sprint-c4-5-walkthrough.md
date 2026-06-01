# Sprint C.4.5 — Walkthrough

## Obiettivo dello Sprint
Completamento architetturale del Wizard "Dati Generali Ente" tramite l'implementazione degli Step 7 (Personale in Servizio), Step 8 (Risorse Iniziali e Base), Step 9 (Controllo Coerenza Dati simulativo), e Step 10 (Riepilogo e Salvataggio).

## Cosa è stato implementato?

### 1. Il modulo Personale (Step 7)
Un'interfaccia a doppia anima che gestisce:
- L'elenco quantitativo delle teste aggregate per categoria (Dipendenti, Dirigenza, EQ, Segretario), utile alla ripartizione del fondo.
- I parametri del **Conglobamento Indennità Comparto** (Personale FTE al 01/01/2026 e valore Tabella C mensile). Un alert rassicura l'utente chiarendo la distinzione tra questo calcolo statico "riduttivo" e quello distributivo. 

### 2. Risorse Economiche Iniziali (Step 8)
Per non spaventare l'utente o creare un clone inutile della Costituzione Fondo Analitica, questo modulo si concentra solo sui cardini:
- Fondo Stabile (Consolidato 2017).
- RIA personale cessato.
- Somme Variabili e Risorse EQ.
Il modulo invita a proseguire nel wizard limitandosi all'essenziale.

### 3. Engine di Coerenza (Step 9)
Prendendo il contesto corrente di `draftData`, questo modulo spara i dati dentro il `fundEngine` simulativo. L'utente visualizza immediatamente eventuali squadrature (es. FTE troppo discordanti tra il 2018 e l'attuale) e la validità del limite 48% (D.L. 25/2025). Il pannello è **completamente read-only**: nessuno state viene inviato al DB.

### 4. Gestione Salvataggio Finale (Step 10)
Il Wizard non è più fine a se stesso. L'ultimo step fa convergere tutti i check formali in un report rapido (con cifre e stati). 
Il pulsante primario `Salva e vai a Costituzione` chiude il Wizard, committa l'intera bozza nel Global State via Context (rispettando l'incapsulamento in `annualData`, `historicalData`, e ora anche `fondoAccessorioDipendenteData`), e rimanda l'utente ai menu classici per ultimare il fondo.

## Qualità Assicurata
La compilazione TypeScript è andata a buon fine dopo aver risolto un disallineamento nei parametri forniti a `calculateSimulazione`.
I test (unitari e regression su engine di fondo) sono stabili a quota **100% (97/97 tests passati)**, assicurando retro-compatibilità assoluta.

## Verso lo Sprint C.4.6 (Finalizzazione)
Rimane ora da svolgere un'intera End-to-End simulativa nel browser, limando gli stili e assicurando che la navigazione non perda colpi se condotta in parallelo all'utilizzo legacy di Excel o CSV. Dopo di questo, si potrà procedere all'apertura PR su Main.
