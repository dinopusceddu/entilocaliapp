# DISTRIBUTION_EXPLICIT_DRAFT — Implementation report

Data: 2026-10-04. Repository: dinopusceddu/entilocaliapp.
Slice locale: DISTRIBUTION_EXPLICIT_DRAFT; target FUNC-02, severità HIGH.
Esito: **PASS — DISTRIBUTION_EXPLICIT_DRAFT = CLOSED_LOCALLY**.
Review indipendente successiva richiesta; FUNC-02 resta HIGH / PARTIALLY_FIXED.

## Baseline

Branch: `ux/toolbox-area-fondo-prototype`.
HEAD: `d3170f959b5815c514dbf3d6e5f93366a5f14c67`.
Entrambi verificati prima delle modifiche, senza operazioni correttive Git.

Sono stati eseguiti i cinque comandi richiesti: status short completo, branch, HEAD,
diff name-status e diff cached name-status. Staged PRE vuoto.
PRE: 16 file tracked modificati e 404 path untracked segnalati da Git.
Inventario SHA-256 PRE: 1110 file, union di tracked, untracked non ignorati e Markdown alla radice
(compresi report precedenti ignorati da Git). Non comprende dipendenze/generator cache ignorati.

File tracked già modificati al PRE:

```text
 M src/__tests__/securityMigrations.test.ts
 M src/domain/documentProjection.ts
 M src/features/wizard2026/__tests__/wizard2026RemoteDraftSync.test.ts
 M src/logic/cabina/__tests__/resolveCabinaViewModel.test.ts
 M src/logic/cabina/__tests__/resolveOperationalStatus.test.ts
 M src/logic/cabina/resolveCabinaViewModel.ts
 M src/logic/cabina/resolveOperationalStatus.ts
 M src/pages/DistribuzioneRisorsePage.tsx
 M src/pages/__tests__/CabinaDiRegiaPage.wave41.integration.test.tsx
 M src/pages/__tests__/DistribuzioneRisorsePage.closed.test.tsx
 M src/presenters/reportPresenter.ts
 M src/services/documents/pdfReportService.ts
 M src/services/documents/xlsReportService.ts
 M supabase/functions/create-user/index.ts
 M supabase/functions/delete-user/index.ts
 M supabase/functions/update-password/index.ts
```

Evidenze esatte, inventari e log dei gate si trovano nella directory TEMP:

`C:\Users\PUSCED~1\AppData\Local\Temp\distribution-explicit-417875d45d004be5ae6a6759b2070d30`

`baseline-pre.txt` conserva l'output integrale iniziale; `pre-hashes.json` conserva ogni path/hash.
`distribution-page-pre.tsx` e `page-slice.diff` consentono di leggere il delta della pagina
rispetto al PRE dello slice, distinto dal diff cumulativo rispetto a HEAD.

## FUNC-02 residual acceptance

La presenza di un numero verificato non equivale alla disponibilità negoziale definitiva.
La proposta non deve diventare allocazione senza scelta, né avviare il workflow tramite una scrittura
durante apertura o ricalcolo. Personale assente non deve attivare la fascia numerica dello zero.
Il budget canonico e le qualificazioni AUTHORITATIVE / VERIFIED_DRAFT / UNAVAILABLE restano
quelli dello slice CALC-02 già verificato.

Riferimenti letti: pagina e test Distribuzione, budget resolver, tipi/valori iniziali, reducer,
autosave, resolver distribution status Cabina; FUNC-02 della riconciliazione ASTRA; report
CALC02 e review di chiusura; report Cabina blocking e relativa review.

## Current mutation graph

PRE:

```text
calculationResult.canonicalFund
  -> resolveDistributionFundBudget (basis qualificata)
  -> resolveDistributionBalances -> disponibile alla contrattazione
  -> effect performance: residuo meno maggiorazione -> split individuale/organizzativa
  -> effect maggiorazione: premio pro capite * numero beneficiari
  -> UPDATE_DISTRIBUZIONE_RISORSE_DATA
  -> appReducer: merge nel fundData.distribuzioneRisorseData
  -> checksum fundData / autosave preesistente / Salva Distribuzione
  -> resolveDistributionStatus: presenza di allocazioni effettive
```

Un terzo effect cancellava risparmi/aBilancio nel preventivo anche al caricamento.
Il percorso di salvataggio dipende già da utente/ente, snapshot idratato, stato OPEN,
fonti manual/wizard e variazione del checksum: non ogni dispatch implica un salvataggio remoto.

POST:

```text
stessa basis canonica + allocazioni correnti + criteri esistenti
  -> resolveDistributionDraftProposal (puro)
  -> preview separata, nessuno stato persistito
  -> click esplicito, OPEN, proposta disponibile, nessuna issue BLOCKING
  -> un solo UPDATE_DISTRIBUZIONE_RISORSE_DATA
  -> reducer e normale percorso di salvataggio già esistente
```

## Auto-performance root cause

I due effect economici confrontavano valori calcolati e salvati, poi dispatchavano:
mount e ricalcoli potevano sovrascrivere valori preesistenti e creare lavoro Distribuzione.
Il flag temporaneo della sola maggiorazione non proteggeva le performance e non sopravviveva al mount.
Sono stati rimossi entrambi, con il flag ormai inutile.
Anche la pulizia preventivo è diventata conseguenza del cambio modalità scelto dall'utente,
evitando qualunque UPDATE automatico nella pagina.

## Proposal contract

Nuovo resolver puro:
`src/logic/distribution/resolveDistributionDraftProposal.ts`.

AVAILABLE conserva mode AUTHORITATIVE o VERIFIED_DRAFT e restituisce:
availableForPerformance, individuale, organizzativa e maggiorazione nullable.
UNAVAILABLE restituisce solo mode/reason, senza importi inventati.
Non legge summary legacy, non crea un totale autoritativo, non muta gli input e non dispatcha.

Le formule restano quelle preesistenti: disponibile meno altri utilizzi, maggiorazione arrotondata
con la stessa espressione, percentuale individuale con FinancialMath.roundTo2DP,
organizzativa per FinancialMath.subtractExact. Il numero beneficiari usa lo stesso ceil e
la maggiorazione pro capite usa le stesse percentuali e denominatore.
La proposta presenta contemporaneamente il riparto e la maggiorazione proposta:
sono gli stessi valori raggiunti a regime dai precedenti due effect, senza scritture intermedie.
Se la maggiorazione non è determinabile, il residuo mantiene la quota già allocata e l'applicazione
non la cancella né la trasforma in zero.

## Explicit apply action

Nuova CTA business: **Applica la proposta di riparto**.
La preview chiarisce che l'applicazione sostituisce le quote performance.
Un click applica i due stanziamenti e, solo se determinabile, la maggiorazione:
un solo dispatch, con spread dei dettagli già esistenti per conservare risparmi/aBilancio.
Nessuna chiamata diretta a saveState.

CLOSED e proposta indisponibile impediscono l'applicazione.
La pagina consuma la classificazione esistente di `resolveChecklist`:
BLOCKING disabilita il bottone ed è ricontrollato nell'handler; WARNING non blocca.
La checklist/resolver Cabina è importata senza modificarla; non sono introdotte nuove condizioni
normative o amministrative. Il controllo riguarda la nuova azione, non save o closure.

## Draft semantics

VERIFIED_DRAFT resta simulazione **BOZZA**, con testo esplicito che non attesta costituzione definitiva.
Il budget autoritativo rimane null su UNDETERMINED/INVALID/missing secondo il resolver protetto.
La preview è un valore derivato in render, non un campo di fundData.
UNAVAILABLE non espone proposta numerica o CTA e conserva le allocazioni esistenti.

## Existing manual values

Mount, variazione dei criteri e ricalcolo del fondo aggiornano solo la preview.
Valori performance e maggiorazione già scelti restano nel draft fino a un'azione utente.
I campi performance continuano a seguire il layout precedente: stanziamenti impostati tramite riparto,
risparmi/aBilancio editabili a consuntivo. Help e tipo suggerito distinguono proposta e allocazione.
Non viene azzerato un draft importato passando semplicemente sulla pagina.

## Personnel missing semantics

`resolveDistributionPersonnel` legge il campo raw locale
`annualData.ccnl2024.personaleInServizio01012026` e il fallback già presente `personaleServizio.dettagli`.

| Input locale | Stato | Count | Applicabilità Art.48 |
|---|---|---:|---|
| Campo undefined/null + dettagli assenti/vuoti | MISSING | null | null |
| Campo esplicito 0, anche con dettagli popolati | KNOWN_ZERO | 0 | false |
| Campo positivo | KNOWN_POSITIVE | dato inserito | soglia preesistente >5 |
| Campo assente + dettagli non vuoti | KNOWN_POSITIVE | lunghezza elenco | soglia preesistente >5 |
| Campo non finito o negativo | MISSING | null | null |

L'elenco vuoto iniziale non certifica organico zero. Il campo zero esplicito ha priorità.
Il normalizer condiviso è stato ispezionato ma non viene consumato per questo count dalla pagina:
la correzione locale usa i dati raw già letti in questo percorso, senza modificarlo.

## Art48/personnel dependent behavior

MISSING produce feedback “Personale in servizio mancante”, applicabilità/minimo/beneficiari/
maggiorazione non determinabili; non mostra la fascia ≤5, non calcola una falsa maggiorazione zero.
I criteri salvati restano visibili, con controlli dipendenti dal count disabilitati.
KNOWN_ZERO conserva il ramo precedente non applicabile.
KNOWN_POSITIVE conserva soglia >5 e minimi esistenti 20/25/30 secondo le condizioni già presenti.
Inserire successivamente il personale aggiorna la proposta senza cambiare allocazioni.
La performance indipendente dal count può restare una proposta: la quota maggiorazione
non determinabile è esclusa dall'update, conservando il valore già scelto.

## Dirty/save behavior

Nessun effect UPDATE rimane nella pagina. La preview non modifica fundData, localSources o checksum:
non rende dirty, non invoca saveState e non innesca autosave.
Test con reducer e `useFundDataAutosave` reali, mockando il solo salvataggio esterno,
prova checksum invariato/timer senza salvataggio prima del click;
poi un dispatch e un salvataggio normale dopo il click nel contratto già abilitato.
Non sono aggiunti marker dirty, flag “applicato” o layer di persistenza.
Il bottone Salva Distribuzione e i gate di autosave restano invariati; senza i prerequisiti
preesistenti l'autosave non è promesso e resta disponibile il salvataggio manuale già esistente.

## CLOSED behavior

CLOSED non mostra proposta o CTA di applicazione, tutti gli handler conservano il guard.
Mount non dispatcha e non salva. Il test CLOSED preesistente resta byte-identico.
Nessuna modifica a chiusura annualità, readiness o server contract.

## Cabina status behavior

La preview non entra in distribuzioneRisorseData: il resolver Cabina vede NOT_STARTED su draft vuoto.
Dopo applicazione può rilevare IN_PROGRESS secondo il contratto preesistente.
VALID + BLOCKING continua a produrre BLOCKED / Apri le verifiche.
Il bottone della nuova proposta non consente di aggirare quella blocking issue.
Nessun file Cabina è stato modificato e nessuna classificazione viene duplicata.

## Tests

Nuovi test: resolver/presenza personale **23/23**; pagina reale **19/19**.
Test dedicati finali, inclusi canonical budget page e CLOSED: **50/50**, 4 file.
Coprono proposta autoritativa/draft/indisponibile, zero esplicito, formule e centesimi,
input immutabili, click singolo, manual values, ricalcolo, criteri, preventivo esplicito,
CLOSED, missing/zero/positivo, Art48, successivo inserimento, checksum/autosave reali,
preview NOT_STARTED, Cabina BLOCKED, BLOCKING disabilitante e WARNING non bloccante.

Due asserzioni del test UI canonicalBudget già esistente pretendevano auto-dispatch:
sono state sostituite con preview corretta e zero dispatch. Le asserzioni sul budget canonico,
residuo, stato, legacy divergence, zero e missing non sono state cambiate.
Il test precedente congela proprio l'automatismo che questo slice deve rimuovere; nessun golden
economico è stato aggiornato.

Gate finali:
- TypeScript `npx tsc --noEmit`: PASS, exit 0.
- Regression: **8/8**, exit 0.
- Wave2 oracle: **14/14**, exit 0.
- Full Vitest finale: **1469/1469**, **121/121 file**, zero failed/pending, exit 0.
- Diff check: PASS, exit 0, anche dopo il report.
- Rete: guard NODE_OPTIONS sui boundary HTTP/HTTPS/fetch/TCP/TLS/DNS; npm offline/update notifier disabilitato.
  PRODUCT_NETWORK_ATTEMPTS=0; TOOLING_NETWORK_ATTEMPTS=0; nessuna connessione reale.
- Supabase dummy example.invalid; draft remoti disabilitati; nessuna installazione.

La prima suite completa passata era 1467/1467; dopo il controllo BLOCKING e i relativi due
test UI l'intera suite finale è stata rieseguita con esito 1469/1469.
I log di gate, guard, configurazione e artefatti generati restano in TEMP.
La guard devia i writer dei gate storici in TEMP per preservare tutti gli evidence pack.

## Scope integrity

Delta PRE→POST atteso e controllato tramite SHA-256:
1. src/pages/DistribuzioneRisorsePage.tsx — unico file produttivo preesistente modificato.
2. src/pages/__tests__/DistribuzioneRisorsePage.canonicalBudget.test.tsx — solo asserzioni auto-write.
3. src/logic/distribution/resolveDistributionDraftProposal.ts — nuovo resolver locale puro.
4. src/logic/distribution/__tests__/distributionDraftProposal.test.ts — nuovo test puro.
5. src/pages/__tests__/DistribuzioneRisorsePage.explicitDraft.test.tsx — nuovo test pagina reale.
6. DISTRIBUTION_EXPLICIT_DRAFT_IMPLEMENTATION_REPORT.md — questo nuovo report.

Confronto finale: PRE **1110** / POST **1114**; due preesistenti modificati, quattro nuovi
(incluso questo report), **1108** preesistenti byte-identici, **zero cancellati**.
Staged rimasto vuoto, branch/HEAD invariati. Nessun add/commit/push/PR/deploy.
Budget resolver canonico, Cabina, ledger, fundEngine, normalizer, presenter/projection, PDF/XLS,
Tabella15, Auth, migration, test CLOSED e tutti i report/evidence precedenti sono invariati.
Non sono stati toccati DB, staging o produzione.

## Regression of closed slices

Nessun numero canonico o formula normativa cambia.
Le suite pertinenti sono tutte PASS nella full finale:
Distribution canonical budget 14 resolver +7 pagina, CLOSED1;
Fondo Personale6; Cabina111 (66 resolver/VM +45 integrazione pagina);
FAD read model17; XLS16; PDF17; ledger contract13; Wave3 consistency34; Auth95 (19+34+42).
CALC_02_REGRESSION=NONE; NORM_01_REGRESSION=NONE; CABINA_BLOCKING_REGRESSION=NONE.
CALC-02 e NORM-01 restano VERIFIED_FIXED; ASTRA_BLOCKERS_OPEN resta 0.

## Residual FUNC-02

DISTRIBUTION_EXPLICIT_DRAFT è CLOSED_LOCALLY dopo tutti i gate e richiede review indipendente.
FUNC-02 resta HIGH / PARTIALLY_FIXED: CLOSURE_INSTRUCTION_READINESS,
DOCUMENT_KIND_READINESS e altri prerequisiti istruttori rimangono fuori scope.
Nessun requisito su revisori/delibere/firme/trasmissioni è stato aggiunto; nessun blocco nuovo a save,
Reports o closure. DOC-02/NORM-02/ARCH-01 mantengono la severità HIGH e il loro stato parziale.
Non viene dichiarata sicurezza live o readiness amministrativa.
Prossimo gate: DISTRIBUTION_EXPLICIT_DRAFT_INDEPENDENT_REVIEW.
