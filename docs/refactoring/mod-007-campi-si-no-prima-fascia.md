# MOD-007 — Campi Sì/No e prima fascia D.L. 34/2019 nello Step 1

Questa documentazione riassume le modifiche implementate per soddisfare i requisiti del piano MOD-007.

## Modifiche Principali

1. **Selettori Sì/No (Tre Stati) nello Step 1**
   - I vecchi controlli checkbox per `isPrimaFasciaDl34`, `isEquilibrioPluriennaleAsseverato`, `isDissesto`, `isStrutturalmenteDeficitario`, `isPianoRiequilibrio`, `hasDirigenza` e `hasApprovazioneCosfel` sono stati sostituiti da pulsanti Sì/No espliciti con gestione a tre stati (`true`, `false`, `undefined`).
   - I pulsanti non selezionati usano uno sfondo grigio/neutro, mentre quelli selezionati per il "No" usano uno stile scuro/neutro (non rosso/errore), e per il "Sì" usano lo stile coerente con la palette FP CGIL Lombardia.

2. **Dinamismo della Sezione COSFEL**
   - Il campo `hasApprovazioneCosfel` compare solo se `isStrutturalmenteDeficitario` è impostato su `Sì` (`true`).
   - Se `isStrutturalmenteDeficitario` viene impostato su `No` (`false`), il campo `hasApprovazioneCosfel` viene automaticamente azzerato (`undefined`) per evitare incoerenze o permanenza di dati sporchi nello stato.

3. **Popup Informativo "Prima Fascia D.L. 34/2019"**
   - Accanto alla descrizione del campo prima fascia, è stato inserito un link/pulsante discreto `"Cos'è?"`.
   - Cliccando su di esso, si apre un modal informativo dettagliato con la definizione e il calcolo della sostenibilità della spesa di personale basata sulle entrate correnti (al netto del FCDE) e sui limiti demografici, indicando dove reperire il dato (tabella PIAO, asseverazione dei revisori nel Rendiconto).

4. **Distinzione False vs Undefined per COSFEL**
   - Nelle validazioni per gli incrementi discrezionali (D.L. 25/2025, CCNL 2026, Straordinario, PNRR), la mancanza dell'autorizzazione COSFEL è stata distinta:
     - `hasApprovazioneCosfel === false`: produce un **errore bloccante** (es. `COSFEL-BLOCKED-DL25`), in quanto l'ente ha esplicitamente risposto di non disporre del provvedimento.
     - `hasApprovazioneCosfel === undefined`: produce un **warning non bloccante** (es. `COSFEL-MISSING-DL25`) che segnala il dato come mancante/da richiedere.
   - Nella lettera "Solo dati mancanti", i campi a `false` (es. `hasDirigenza: false`, `isDissesto: false`) vengono considerati come presenti/compilati e pertanto **non vengono inseriti** nella richiesta.

5. **Test Unitari e Suite di Collaudo**
   - È stato creato il test obbligatorio `src/logic/wizard2026/__tests__/MOD007_dirigenza.test.ts` per verificare che:
     - `hasDirigenza === false` non produce alcuna riduzione automatica se non c'è richiesta di straordinario.
     - `hasDirigenza === false` rende non applicabile il Fondo Dirigenza 2016 per il limite dell'art. 23.
   - Tutti i 181 test unitari passano correttamente e la build di produzione compila con successo.
