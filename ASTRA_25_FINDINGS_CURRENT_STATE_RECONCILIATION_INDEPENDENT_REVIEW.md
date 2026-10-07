# ASTRA — 25 FINDINGS CURRENT STATE RECONCILIATION
## INDEPENDENT REVIEW REPORT

**Document Under Review:** `ASTRA_25_FINDINGS_CURRENT_STATE_RECONCILIATION.md`\
**Review Type:** `ASTRA_25_FINDINGS_CURRENT_STATE_RECONCILIATION_INDEPENDENT_REVIEW`\
**Review Date:** 5 Ottobre 2026\
**Auditor / Reviewer:** Senior Independent Reviewer, Principal Software Architect, Security Reviewer & Auditor di Sistemi Amministrativi Regolati\
**Repository:** `dinopusceddu/entilocaliapp`\
**Branch:** `ux/toolbox-area-fondo-prototype`\
**HEAD:** `d3170f959b5815c514dbf3d6e5f93366a5f14c67`\
**Baseline Mode:** CURRENT WORKING TREE (Strict Read-Only)\
**Overall Review Verdict:** **PASS**

---

## Executive verdict

L'audit indipendente condotto sul documento `ASTRA_25_FINDINGS_CURRENT_STATE_RECONCILIATION.md` emette verdetto formale **PASS**.

La fotografia dello stato corrente del working tree:
1. **Contiene esattamente i 25 finding originali** censiti nell'Audit ASTRA, con corrispondenza 1:1, zero duplicati e zero omissioni (`FINDING_SET_INTEGRITY = PASS`).
2. **Assegna a ciascun finding lo stato rigorosamente accertato** nel working tree corrente:
   - **`VERIFIED_FIXED` = 9** (SEC-01, DATA-02, CALC-01, CALC-02, DOC-01, DOC-02, NORM-01, FUNC-01, FUNC-02);
   - **`PARTIALLY_FIXED` = 8** (DATA-03, CALC-04, NORM-02, ARCH-01, ARCH-02, UX-01, UX-02, UX-03);
   - **`OPEN` = 8** (DATA-01, CALC-03, CALC-05, NORM-03, NORM-04, FUNC-03, ACCESS-01, ACCESS-02);
   - **`NOT_VERIFIED` = 0**, **`ACCEPTED_LIMITATION` = 0**, **`OUT_OF_SCOPE` = 0**.
   - Totale classificazioni = **25**.
3. **Mantiene immutata la severità originaria** stabilita nel report di audit (`ASTRA_RSU_AUDIT_REPORT.md`), rifiutando qualsiasi downgrade opportunistico post-correzione:
   - **BLOCKER** = 5;
   - **HIGH** = 15;
   - **MEDIUM** = 5.
4. **Accerta formalmente che `BLOCKERS_OPEN = 0`**, poiché tutti i 5 blocker originali (SEC-01, CALC-01, CALC-02, DOC-01, NORM-01) risultano integralmente chiusi e verificati rispetto all'acceptance originale.
5. **Rimangono non integralmente risolti 11 HIGH e 5 MEDIUM**, distribuiti tra residui operativi, calcoli non coordinati, boundary di validazione permissivi e difetti di accessibilità/UX.
6. **Distingue rigorosamente le correzioni nel sorgente locale (`SOURCE_FIXED`) dalle verifiche in ambienti remoti/target (`LIVE_VERIFIED`)**: nessuna asserzione di sicurezza o di conformità è stata estrapolata a staging o produzione in assenza di applicazione verificata.
7. **Isola chiaramente i 25 finding originari dai nuovi debiti architetturali, normativi e di sicurezza** (es. `ARCH-PERSIST-01`, `RGS_SCHEMA_UNVERIFIED`, `TABELLA15_OUTPUT_MODE`, cleanup FK e trigger profile).
8. **Riconcilia la roadmap residua a 36 unità complessive** (29 della roadmap originale + 7 nuove unità emerse), derivando esattamente **21 implementation slices rimanenti**, **3 operational gates rimanenti** e **25 independent reviews pianificate**.
9. **Conferma la validità tecnica e la priorità massima del prossimo slice proposto:** **`PNRR_ZERO_AND_MISSING_CAP`**, dimostrando come la mancata gestione del cap zero/missing sia l'unico difetto aperto in grado di fabbricare capacità monetaria dal nulla e attraversare inavvertitamente tutti i gate downstream con stato `VALID`.
10. **Classifica correttamente l'evento di rete tooling** (`TOOLING_NETWORK_DEVIATION = DOCUMENTED_NON_CONNECTION`), confermando che nessuna connessione o socket TCP/TLS ha mai lasciato il perimetro locale.

---

## Baseline

I controlli forensi di conformità sull'ambiente di lavoro confermano l'integrità assoluta della baseline:

~~~text
BRANCH = ux/toolbox-area-fondo-prototype
HEAD = d3170f959b5815c514dbf3d6e5f93366a5f14c67
EXPECTED_BRANCH_MATCH = YES
EXPECTED_HEAD_MATCH = YES
DIFF_CACHED = EMPTY (0 files staged)
TRACKED_MODIFIED_FILES = 24 (preesistenti alla riconciliazione)
SCOPE_INTEGRITY = PRESERVED
~~~

Come stabilito dalle specifiche operative ASTRA, il commit HEAD `d3170f959b5815c514dbf3d6e5f93366a5f14c67` precede intenzionalmente le implementazioni e gli slice locali. La presente independent review valuta esclusivamente il **CURRENT WORKING TREE**, verificando che i file di produzione, i test, le fixture e i golden preesistenti non abbiano subito alcuna alterazione non autorizzata.

---

## Finding set integrity

È stata condotta una verifica formale di integrità dell'insieme dei finding censiti in `ASTRA_25_FINDINGS_CURRENT_STATE_RECONCILIATION.md` a confronto con l'audit primario `ASTRA_RSU_AUDIT_REPORT.md` e la precedente riconciliazione `ASTRA_FINAL_FINDINGS_RECONCILIATION.md`.

Gli ID presenti nella matrice sono esattamente i seguenti 25:

| Categoria | ID Censiti | Conteggio Categoria |
| :--- | :--- | :---: |
| **Security** | `SEC-01` | 1 |
| **Data Integrity** | `DATA-01`, `DATA-02`, `DATA-03` | 3 |
| **Calculation** | `CALC-01`, `CALC-02`, `CALC-03`, `CALC-04`, `CALC-05` | 5 |
| **Documentation** | `DOC-01`, `DOC-02` | 2 |
| **Normative** | `NORM-01`, `NORM-02`, `NORM-03`, `NORM-04` | 4 |
| **Architecture** | `ARCH-01`, `ARCH-02` | 2 |
| **Functional / Workflow**| `FUNC-01`, `FUNC-02`, `FUNC-03` | 3 |
| **User Experience** | `UX-01`, `UX-02`, `UX-03` | 3 |
| **Accessibility** | `ACCESS-01`, `ACCESS-02` | 2 |
| **TOTALE** | **Tutti i 25 ID originari univoci** | **25** |

- **ID univoci:** 25 su 25
- **ID duplicati:** 0
- **ID mancanti:** 0
- **Finding aggiunti arbitrariamente alla matrice:** 0

$$\text{FINDING\_SET\_INTEGRITY} = \mathbf{PASS}$$

---

## 25 finding independent matrix

La tabella sottostante espone la verifica indipendente per ciascuno dei 25 finding, confrontando la severità originaria, lo stato precedente (`ASTRA_FINAL_FINDINGS_RECONCILIATION.md`), lo stato corrente riconciliato nel report e la classificazione confermata da questa review:

| ID | Severità Originale | Stato Precedente | Stato Dichiarato | Verdetto Review | Evidenza Tecnica e Giustificazione Indipendente |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **SEC-01** | **BLOCKER** | VERIFIED_FIXED | **VERIFIED_FIXED** | **CONFERMATO** | Hardening SQL in `20260928000000_harden_user_app_state_closed_boundary.sql`: blocco totale UPDATE/INSERT client su CLOSED; revoche privilegi RLS; cancellazione ammessa solo con flag cleanup e ruolo ADMIN canonico. Test migration e CLOSED verdi. |
| **DATA-01** | **HIGH** | OPEN | **OPEN** | **CONFERMATO** | `constants.ts` e `AppContext.tsx` continuano a popolare `INITIAL_HISTORICAL_DATA` con $1.730.000,00\ \text{€}$ di default e basi demo runtime alla creazione di un nuovo ente o annualità. Nessun builder vuoto introdotto. |
| **DATA-02** | **HIGH** | VERIFIED_FIXED | **VERIFIED_FIXED** | **CONFERMATO** | Transazione atomica RPC Supabase con lock riga `FOR UPDATE`, idempotenza sui retry, merge corretto del riporto N+1 senza sovrascrittura importi e autorizzazione owner/admin. Concorrenza multiwriter OPEN demandata ad ARCH-PERSIST-01. |
| **DATA-03** | **HIGH** | PARTIALLY_FIXED | **PARTIALLY_FIXED** | **CONFERMATO** | Il ledger intercetta valori additivi negativi marcandoli `INVALID`, ma `fundDataSchemas.ts` espone `.or(z.any())`, `inputNormalizer` accetta raw strings e stringhe malformate causano crash in big.js anziché validazione ordinata. |
| **CALC-01** | **BLOCKER** | VERIFIED_FIXED | **VERIFIED_FIXED** | **CONFERMATO** | `canonicalFundLedger.ts` applica ID semantici unici, impedisce doppi conteggi di voci contrattuali, include lo 0,14% una sola volta ed esclude recovery non istruiti dal totale determinato. Oracle 14/14 PASS. |
| **CALC-02** | **BLOCKER** | PARTIALLY_FIXED | **VERIFIED_FIXED** | **CONFERMATO** | Cabina, Fondo Dipendente, Distribuzione (`resolveDistributionFundBudget`), XLSX e PDF generale consumano tutti l'autorità canonica `fadCanonical` e la base qualificata. Sezioni analitiche concorrenti isolate in ARCH-01. |
| **CALC-03** | **HIGH** | OPEN | **OPEN** | **CONFERMATO** | `calculateSimulazione` divide arbitrariamente il margine netto teorico del 48% ($24.000,00\ \text{€}$) per $1,274$, restituendo l'importo errato di $18.838,304552590267\ \text{€}$. Sottostima grave della facoltà assunzionale. |
| **CALC-04** | **HIGH** | PARTIALLY_FIXED | **PARTIALLY_FIXED** | **CONFERMATO** | FAD, EQ e Segretario derivano il consumo da componenti o totale verificato; Dirigenza in `fundEngine.ts:338` legge direttamente la cache del tetto 2016, invertendo la conformità al variare del valore cached ($0$ vs $2.000$). |
| **CALC-05** | **HIGH** | OPEN | **OPEN** | **CONFERMATO** | `fundEngine.ts:467-470` esegue il confronto solo se `maxPnrr > 0`. Con cap $0$ o missing, un incremento di $+100\ \text{€}$ viene registrato come `VALID` nel ledger senza generare alcun errore bloccante. |
| **DOC-01** | **BLOCKER** | VERIFIED_FIXED | **VERIFIED_FIXED** | **CONFERMATO** | Tabella 15 implementa mapping firmato, preserva le voci non mappate come `unresolved`, gestisce totale nullo e non inverte le decurtazioni. `RGS_SCHEMA_UNVERIFIED` e SICO rimangono limiti esterni separati. |
| **DOC-02** | **HIGH** | PARTIALLY_FIXED | **VERIFIED_FIXED** | **CONFERMATO** | Policy rigorosa per 5 tipi di documenti attivi governata da `resolveDocumentKindReadiness`, triplo guard (UI, handler, factory/service), zero bypass finali attivi, placeholder espliciti senza metadati inventati, XLSX/PDF canonici. |
| **NORM-01** | **BLOCKER** | PARTIALLY_FIXED | **VERIFIED_FIXED** | **CONFERMATO** | Conglobamento Art. 60 conforme a N09: $0,00\ \text{€}$ nel 2025; $127,44\ \text{€}$ per 1 EQ nel 2026 una sola volta con quota figurativa Art. 23; base 2026 consolidata esplicita richiesta dal 2027. Consumer migrati. |
| **NORM-02** | **HIGH** | PARTIALLY_FIXED | **PARTIALLY_FIXED** | **CONFERMATO** | Quota corrente 0,22% ($2.200\ \text{€}$ dal 2025) e recuperi separati contabilmente. Manca tuttavia l'istruttoria su competenza, provenance del titolo, già utilizzato, recupero parziale e annualità chiusa. |
| **NORM-03** | **HIGH** | OPEN | **OPEN** | **CONFERMATO** | `calculateSimulazione` è privo di parametri data/regime temporale e include sempre la spesa L. 296/2006 nel minimo, impedendo l'applicazione della deroga ex art. 33 post 8 agosto 2026 (N13). |
| **NORM-04** | **HIGH** | OPEN | **OPEN** | **CONFERMATO** | Step 3 usa $N-1$ per le etichette delle risorse 2025 (chiedendo il 2024 nel 2025); Step 8 espone l'etichetta `4,8%` a fronte di un moltiplicatore di calcolo effettivo pari a `0,48` (48%). |
| **ARCH-01** | **HIGH** | PARTIALLY_FIXED | **PARTIALLY_FIXED** | **CONFERMATO** | `calculateFadTotals` e `constitution.sections` rimangono chiamati attivamente in `fundEngine.ts:228` e renderizzati in `FundDetailsPage.tsx:102`. Possono mostrare $0\ \text{€}$ stabile a fronte di $1.400\ \text{€}$ canonici. |
| **ARCH-02** | **MEDIUM** | PARTIALLY_FIXED | **PARTIALLY_FIXED** | **CONFERMATO** | Le 3 Edge Functions (`create-user`, `update-password`, `delete-user`) controllano i ruoli da `profiles` (SOURCE_FIXED); tuttavia il mirror locale `user_app_state.role` è disallineato e la migration live resta in stato pending. |
| **FUNC-01** | **HIGH** | VERIFIED_FIXED | **VERIFIED_FIXED** | **CONFERMATO** | `AppContext` inibisce mutazioni, salvataggi, import e ripristini quando `snapshotStatus === 'CLOSED'`. Nessun finto toast di successo emesso; correlation ID e isolamento draft coerenti. |
| **FUNC-02** | **HIGH** | PARTIALLY_FIXED | **VERIFIED_FIXED** | **CONFERMATO** | Tutte e 5 le dimensioni del workflow originario risultano chiuse e certificate: 1. Cabina blocking priority; 2. Distribuzione explicit draft; 3. Closure readiness; 4. Document kind readiness; 5. Post-close N+1 navigation. |
| **FUNC-03** | **MEDIUM** | OPEN | **OPEN** | **CONFERMATO** | Nel Wizard 2026, il SummaryPanel mostra il pulsante disabilitato con dicitura "Non ancora attivo", mentre Step 8 presenta la CTA di trasferimento pienamente attiva ed eseguibile. |
| **UX-01** | **MEDIUM** | PARTIALLY_FIXED | **PARTIALLY_FIXED** | **CONFERMATO** | La tracciabilità tecnica degli ID semantici e la provenance nel ledger non colmano l'assenza di un dossier accessibile che risponda alle 15 domande dell'audit RSU con la sequenza completa numero $\to$ atto. |
| **UX-02** | **HIGH** | PARTIALLY_FIXED | **PARTIALLY_FIXED** | **CONFERMATO** | La context bar sticky visualizza ente/anno/stato, ma il nome lungo è troncato via attributo `title` HTML (inaccessibile via touch) e non è disponibile una certificazione visiva formale sui viewport 360/390/430. |
| **UX-03** | **MEDIUM** | PARTIALLY_FIXED | **PARTIALLY_FIXED** | **CONFERMATO** | L'interfaccia Reports espone token tecnici interni (`opinionOutcome`, `transmissionStatus`, `adoptionStatus`) nelle etichette e nelle opzioni; Tabella 15 non qualifica graficamente la modalità BOZZA per `VALID+DRAFT`. |
| **ACCESS-01**| **HIGH** | OPEN | **OPEN** | **CONFERMATO** | Il modal "Nuovo Ente" in `FondiEntiPage.tsx:701` è un semplice elemento `div` privo di semantica `role="dialog"`, `aria-modal="true"`, focus trap (Tab/Shift+Tab), listener Escape, ripristino del focus e background inert. |
| **ACCESS-02**| **MEDIUM** | OPEN | **OPEN** | **CONFERMATO** | Controlli metadati in Reports privi di associazione `htmlFor`/`id`; `Card.tsx` presenta un contenitore `role="button"` con `tabIndex={0}` contenente un `<button>` nativo (interattività annidata); input Wizard privi di `aria-describedby`. |

---

## Status count verification

Il ricalcolo indipendente e rigoroso degli stati assegnati ai 25 finding conferma matematicamente i dati dichiarati nel report sotto review:

| Stato di Conformità | Totale Derivato | Percentuale | Delta vs Precedente (`ASTRA_FINAL`) |
| :--- | :---: | :---: | :---: |
| **VERIFIED_FIXED** | **9** | $36\%$ | $+4$ (CALC-02, DOC-02, NORM-01, FUNC-02) |
| **PARTIALLY_FIXED** | **8** | $32\%$ | $-4$ (promossi a VERIFIED_FIXED) |
| **OPEN** | **8** | $32\%$ | $0$ (nessun OPEN promosso indebitamente) |
| **NOT_VERIFIED** | **0** | $0\%$ | $0$ |
| **ACCEPTED_LIMITATION** | **0** | $0\%$ | $0$ |
| **OUT_OF_SCOPE** | **0** | $0\%$ | $0$ |
| **TOTALE FINDING** | **25** | **100%** | **0** |

Le transizioni di stato rispetto alla precedente riconciliazione sono esattamente 4:
1. `CALC-02`: da `PARTIALLY_FIXED` a `VERIFIED_FIXED`;
2. `DOC-02`: da `PARTIALLY_FIXED` a `VERIFIED_FIXED`;
3. `NORM-01`: da `PARTIALLY_FIXED` a `VERIFIED_FIXED`;
4. `FUNC-02`: da `PARTIALLY_FIXED` a `VERIFIED_FIXED`.

Nessun finding contrassegnato precedentemente come `OPEN` è stato promosso senza l'effettiva risoluzione della root cause e dell'acceptance originaria.

---

## Severity verification

La verifica della severità originaria conferma che **non vi è stato alcun downgrade** rispetto alla classificazione iniziale di audit:

| Severità Originale | Totale Originale | VERIFIED_FIXED | Totale Non Chiusi | Di cui PARTIALLY_FIXED | Di cui OPEN |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **BLOCKER** | 5 | 5 | **0** | 0 | 0 |
| **HIGH** | 15 | 4 | **11** | 5 | 6 |
| **MEDIUM** | 5 | 0 | **5** | 3 | 2 |
| **TOTALE** | **25** | **9** | **16** | **8** | **8** |

### Riepilogo dei finding non chiusi:
- **`BLOCKERS_OPEN = 0`**: Tutti i 5 Blocker (`SEC-01`, `CALC-01`, `CALC-02`, `DOC-01`, `NORM-01`) sono `VERIFIED_FIXED`.
- **`HIGH_NOT_FIXED = 11`**:
  - `PARTIALLY_FIXED` (5): `DATA-03`, `CALC-04`, `NORM-02`, `ARCH-01`, `UX-02`.
  - `OPEN` (6): `DATA-01`, `CALC-03`, `CALC-05`, `NORM-03`, `NORM-04`, `ACCESS-01`.
- **`MEDIUM_NOT_FIXED = 5`**:
  - `PARTIALLY_FIXED` (3): `ARCH-02`, `UX-01`, `UX-03`.
  - `OPEN` (2): `FUNC-03`, `ACCESS-02`.

---

## Verified-fixed red-team

È stato condotto un riesame approfondito e avversariale su ciascuno dei 9 finding dichiarati `VERIFIED_FIXED`:

1. **`SEC-01` (Boundary SQL Snapshot CLOSED):**\
   - *Verifica:* Il file SQL finale `20260928000000_harden_user_app_state_closed_boundary.sql` impedisce tassativamente qualsiasi `UPDATE` client di uno snapshot contrassegnato con stato `CLOSED` e qualsiasi inserimento diretto di snapshot `CLOSED`. La cancellazione eccezionale di snapshot `CLOSED` richiede contestualmente un flag applicativo esplicito e il ruolo amministrativo verificato. I test statici sulle migration confermano l'integrità delle regole.
   - *Conclusione:* Nessun bypass residuo nell'acceptance originaria. Lo stato è legittimamente `VERIFIED_FIXED` a livello di sorgente (`SOURCE_FIXED`).
2. **`DATA-02` (Transazione Atomica Chiusura Annuale):**\
   - *Verifica:* L'infrastruttura di persistenza `SupabaseStateRepository` instrada l'operazione alla stored procedure `close_year_atomic`. La procedura acquisisce lock `FOR UPDATE`, valida le credenziali dell'ente, congela i dati prelevandoli direttamente dal DB e genera il riporto per l'anno $N+1$ garantendo riprendibilità ed idempotenza in caso di retry.
   - *Conclusione:* Acceptance pienamente rispettata. Problemi di concorrenza tra writer ordinari OPEN sono correttamente confinati nel nuovo debito `ARCH-PERSIST-01`.
3. **`CALC-01` (Unicità Semantica e Core Ledger):**\
   - *Verifica:* `canonicalFundLedger.ts` mappa ciascuna voce mediante ID semantici non duplicabili. L'incremento dello 0,14% ex art. 58 c. 1 viene aggiunto una sola volta nel FRD, senza duplicazioni nei totali di aggregazione. Le quote di arretrati non istruite permangono isolate con stato `UNDETERMINED`.
   - *Conclusione:* L'oracle economico e le suite di test confermano la rimozione definitiva del doppio conteggio. `VERIFIED_FIXED`.
4. **`CALC-02` (Uniformità Economica Cross-Consumer):**\
   - *Verifica:* Audit completo eseguito su tutti i consumer attivi: `FondoAccessorioDipendentePage.tsx`, `CabinaDiRegiaPage.tsx`, `DistribuzioneRisorsePage.tsx`, `FadReportReadModel`, writer XLSX e writer PDF. Tutti interrogano `canonicalFund` o il resolver `resolveDistributionFundBudget`. In presenza di stato `UNDETERMINED`, il subtotale verificato viene esposto come base di simulazione qualificata senza promuovere numeri non determinati a budget definitivo.
   - *Conclusione:* I poison getters e i test di regressione confermano l'assoluta coerenza contabile. `VERIFIED_FIXED`.
5. **`DOC-01` (Tracciabilità e Completezza Tabella 15):**\
   - *Verifica:* Il mapper ministeriale preserva i segni delle decurtazioni, conserva i totali nullable in assenza di quadratura contabile e traccia esplicitamente come `unresolved` qualsiasi componente economica non mappata, impedendo che scompaia dal bilancio.
   - *Conclusione:* L'acceptance matematica originaria è soddisfatta. La non validazione dello schema ministeriale annuale è correttamente isolata come limite esterno (`RGS_SCHEMA_UNVERIFIED`).
6. **`DOC-02` (Integrità Documentale Pre-Costituzione):**\
   - *Verifica:* `resolveDocumentKindReadiness` governa 5 tipologie documentali attive (`DETERMINA`, `RELAZIONE`, `PROSPETTO`, `SUMMARY_PDF`, `FAD_XLS`). Ciascun export definitivo è protetto da un triplice controllo (UI, handler, factory). In presenza di issue `BLOCKING` o di fondo non valido, viene forzata la modalità bozza (`DRAFT_PREVIEW` con filigrana e rimozione della clausola dispositiva). Nessun dato mancante viene inventato.
   - *Conclusione:* Acceptance originaria chiusa in toto. `VERIFIED_FIXED`.
7. **`NORM-01` (Conglobamento Art. 60 CCNL 2024):**\
   - *Verifica:* Il motore di calcolo e il ledger impostano la decurtazione a $0,00\ \text{€}$ per le annualità anteriori al 2026 (anche se presenti valori sporchi in snapshot legacy); applicano $127,44\ \text{€}$ per singola EQ nel 2026 una sola volta con contropartita figurativa; impongono una base consolidata esplicita per il 2027. Tutti i consumer (UI, XLSX, PDF) riflettono tale logica.
   - *Conclusione:* Acceptance chiusa senza residui attivi. `VERIFIED_FIXED`.
8. **`FUNC-01` (Protezione Snapshot CLOSED a Runtime):**\
   - *Verifica:* `AppContext.tsx` intercetta le azioni di mutazione, salvataggio, autosave, importazione e ripristino quando lo stato dell'annualità è `CLOSED`, restituendo errore formale ed evitando toast di falso salvataggio. Le navigazioni e le chiamate di consultazione operano in modalità read-only.
   - *Conclusione:* Protezione runtime provata. Non costituisce CAS multi-client tra dispositivi distinti, aspetto correttamente classificato a parte. `VERIFIED_FIXED`.
9. **`FUNC-02` (Integrità Workflow di Costituzione e Chiusura):**\
   - *Verifica:* Sono state verificate le 5 dimensioni indipendenti: 1. Cabina blocking priority; 2. Distribuzione explicit draft; 3. Closure instruction readiness; 4. Document kind readiness; 5. Post-close N+1 navigation. Tutte e 5 dispongono di review indipendente con verdetto PASS e suite di test dedicate.
   - *Conclusione:* Non rimangono difetti aperti ascrivibili alla logica di avanzamento di stato. `VERIFIED_FIXED`.

---

## Partial/open red-team

L'audit indipendente conferma che i finding classificati `PARTIALLY_FIXED` e `OPEN` non sono sottostimati né elusi:

### Findings PARTIALLY_FIXED (8)
1. **`DATA-03`:** Sebbene il ledger identifichi importi negativi additivi assegnando `INVALID`, `FundDataSchema` mantiene `.or(z.any())` sulle sezioni, consentendo a payload malformati o `Infinity` di attraversare il confine di validazione e causare eccezioni non gestite (es. `big.js`).
2. **`CALC-04`:** Mentre FAD, EQ e Segretario derivano il loro perimetro contabile in modo deterministico, il Fondo Dirigenza in `fundEngine.ts:338` continua a leggere direttamente la cache `lim_totaleParzialeRisorseConfrontoTetto2016`, rendendo la conformità al tetto dipendente dalla presenza del valore salvato.
3. **`NORM-02`:** La quota ordinaria dello 0,22% ($2.200,00\ \text{€}$) è separata dagli arretrati, ma l'istruttoria dei recuperi pregressi manca di controlli formali su imputazione contabile, titolo giuridico, quote già utilizzate e verifica dello stato chiuso degli anni precedenti.
4. **`ARCH-01`:** `calculateFadTotals` continua a calcolare parallelamente `constitution.sections`, che viene attivamente consumato da `FundDetailsPage.tsx:102`. In uno scenario con MS2021 pari a $1.000.000\ \text{€}$, il ledger espone $1.400,00\ \text{€}$ stabili mentre `FundDetailsPage` visualizza $0,00\ \text{€}$.
5. **`ARCH-02`:** Il codice delle Edge Functions è corretto a livello di sorgente (`SOURCE_FIXED`), ma la pagina `UserManagementPage.tsx` esegue un doppio aggiornamento (prima `profiles`, poi tenta `user_app_state.role` ignorandone il fallimento), lasciando il contratto di mirror irrisolto. Inoltre la migration non è verificata live.
6. **`UX-01`:** La disponibilità di metadati semantici e campi di provenienza non soddisfa l'esigenza di un quadro di sintesi che risponda in modo integrato e documentato a tutte le 15 domande poste dalla delegazione RSU.
7. **`UX-02`:** Il nome dell'ente rimane confinato in una vista troncata con tooltip HTML (inutilizzabile su smartphone) e l'ownership è nascosta in un popover. Non è stata effettuata una ri-certificazione visiva su viewport 360/390/430.
8. **`UX-03`:** Permangono etichette con terminologia interna (`opinionOutcome`, `transmissionStatus`, `adoptionStatus`) e terminologia di refactoring (`sourceLegacyField`). Tabella 15 non qualifica graficamente la modalità provvisoria per `VALID+DRAFT`.

### Findings OPEN (8)
1. **`DATA-01`:** Creando un nuovo ente o una nuova annualità, `AppContext` inizializza i dati storici con le costanti dimostrative di `INITIAL_HISTORICAL_DATA` ($1.730.000,00\ \text{€}$ complessivi, $2.500.000,00\ \text{€}$ stipendi, 125 dipendenti), inquinando il runtime operativo con numeri demo.
2. **`CALC-03`:** In `calculateSimulazione`, il margine teorico netto del 48% ($24.000,00\ \text{€}$) viene diviso per $(1 + 0,274)$, generando un valore effettivo di $18.838,304552590267\ \text{€}$ con una perdita illegittima di oltre $5.161\ \text{€}$ di capacità di spesa.
3. **`CALC-05`:** Con cap PNRR pari a zero o non impostato, un valore positivo di $+100,00\ \text{€}$ immesso nel fondo viene accettato come `VALID` e totalizzato senza alcuna eccezione o violazione bloccante, superando tutti i controlli a valle.
4. **`NORM-03`:** Il simulatore DL 25 non possiede alcun input relativo alla data di applicazione o al regime temporale, continuando ad applicare il tetto storico della L. 296/2006 anche per scenari successivi all'8 agosto 2026.
5. **`NORM-04`:** Nello Step 3 del Wizard le etichette fanno riferimento all'anno precedente ($N-1$), inducendo in errore l'operatore che per il 2025 inserisce dati 2024; nello Step 8 viene esposta la percentuale errata `4,8%` a fronte del fattore numerico `0,48`.
6. **`FUNC-03`:** Il pulsante di trasferimento nel SummaryPanel del Wizard è disabilitato con il messaggio esplicito "Non ancora attivo: sarà disponibile dopo il refactoring", mentre lo Step 8 contiene l'azione di trasferimento pienamente attiva e funzionante.
7. **`ACCESS-01`:** Il modal "Nuovo Ente" in `FondiEntiPage.tsx` è privo delle caratteristiche ARIA indispensabili (`role="dialog"`, `aria-modal="true"`), non implementa la focus trap da tastiera, non risponde al tasto Escape e non ripristina il focus alla chiusura.
8. **`ACCESS-02`:** I campi di input metadati in `ReportsPage.tsx` non presentano associazioni semantiche con le etichette, il componente `Card.tsx` incapsula un bottone nativo all'interno di un contenitore focusabile con `role="button"`, e gli input economici non associano i messaggi di errore tramite `aria-describedby`.

---

## Auth outside 25

I debiti e i controlli di sicurezza relativi al sottosistema di autenticazione e autorizzazione sono stati mantenuti **rigorosamente separati dai 25 finding ASTRA**, senza contaminare il conteggio:

| Identificativo Auth / Debito | Natura e Condizione Verificata | Classificazione Indipendente |
| :--- | :--- | :---: |
| **`AUTH_ADMIN_01`** | `create-user`: verifica JWT e riscontro ruolo `ADMIN` da tabella `profiles` prima di qualsiasi parsing o mutazione con service-role; 19 test PASS. | **`SOURCE_FIXED`** |
| **`AUTH_ADMIN_02A`** | `update-password`: autorizzazione basata unicamente su `profiles`, insensibile a metadata utente o snapshot role; 34 test PASS. | **`SOURCE_FIXED`** |
| **`AUTH_ADMIN_02B`** | `delete-user`: controllo preventivo del chiamante prima dell'invocazione Auth/DML; 42 test PASS. | **`SOURCE_FIXED`** |
| **`AUTH_ROLE_MIRROR`** | Disallineamento tra aggiornamento di `profiles` e secondo tentativo su `user_app_state.role` (il cui errore viene silenziato). | **`OPEN`** |
| **`Profile-role migration`** | `20261002000000_harden_auth_profile_role_source.sql` presente nel repo; nessun rehearsal o apply live certificato in questa sessione. | **`APPLY_PENDING / LIVE_FIX_NOT_VERIFIED`** |
| **`Runtime validation Edge`** | Assenza di test di integrazione sul deployment live delle tre Edge Functions. | **`LIVE_NOT_VERIFIED`** |
| **`Cleanup / Delete FK`** | `knowledge_documents.uploaded_by` privo di `ON DELETE CASCADE` e cancellazione CLOSED soggetta a flag amministrativo. | **`OPEN_CONTRACT / FUNCTIONAL_DEBT`** |

$$\text{LIVE\_SECURITY\_STATUS} = \mathbf{LIVE\_NOT\_VERIFIED}$$

---

## Non-25 debts

I seguenti elementi tecnici identificati durante le varie iterazioni sono stati correttamente esclusi dalla matrice dei 25 finding originari:

1. **`ARCH-PERSIST-01` (Concorrenza Multiwriter e CAS):** Assenza di un meccanismo di Optimistic Concurrency Control (ETag o server version check) tra client concorrenti che modificano snapshot nello stato ordinario `OPEN`. Classificato come debito architetturale esterno di priorità P1.
2. **`RGS_SCHEMA_UNVERIFIED`:** Lo schema dei tracciati Tabella 15 SICO/RGS non è formalmente validato rispetto all'ultima circolare ministeriale annuale. Classificato come operational gate esterno.
3. **`isSicoExportReady = false`:** Proprietà di sistema che inibisce l'attestazione di conformità SICO pur in presenza di quadratura aritmetica (`SICO_READINESS = FALSE`).
4. **`TABELLA15_OUTPUT_MODE`:** Mancata differenziazione visiva (banner e nome file) per esportazioni Tabella 15 in stato provvisorio `VALID+DRAFT`.
5. **`AUTH_PROFILE_LOGIN_TIMESTAMP_SIDE_EFFECT`:** Effetto collaterale del trigger di autenticazione che aggiorna il timestamp `profiles.updated_at` ad ogni accesso utente.
6. **`DELETE/CLEANUP FK`:** Rischio di violazione del vincolo di foreign key su `knowledge_documents` durante l'eliminazione di un account utente.
7. **Codice documentale latente:** Vecchi writer non più richiamati dalla UI (`generateDeterminazioneTXT`, template legacy V1), destinati al ritiro architetturale.

---

## Original roadmap count

La riconciliazione della roadmap originaria articolata su **29 slice** evidenzia la seguente distribuzione analitica:

| Stato Originale | Conteggio Slices | Dettaglio Slices |
| :--- | :---: | :--- |
| **DONE_VERIFIED** | **7** | `FAD_REPORT_READ_MODEL`, `CANONICAL_FAD_XLSX`, `CANONICAL_FUND_SUMMARY_PDF`, `DOCUMENT_KIND_READINESS`, `CABINA_BLOCKING_ISSUE_PRIORITY`, `DISTRIBUTION_EXPLICIT_DRAFT`, `CLOSURE_INSTRUCTION_READINESS` |
| **DONE_SOURCE_ONLY** | **3** | `AUTH_ADMIN_01_SERVER_ADMIN_CHECK`, `AUTH_ADMIN_02A_PASSWORD_CANONICAL_AUTH`, `AUTH_ADMIN_02B_DELETE_CANONICAL_AUTH` |
| **STILL_REQUIRED** | **17** | `AUTH_ROLE_MIRROR_CONTRACT`, `TABELLA15_OUTPUT_MODE`, `DL25_NET_GROSS_MARGIN`, `DL25_TEMPORAL_REGIME`, `DL25_BASE_YEAR_LABELS`, `PNRR_ZERO_AND_MISSING_CAP`, `ART23_DIRIGENZA_DERIVED_CONSUMPTION`, `EMPTY_FUND_INITIALIZATION`, `MONETARY_INPUT_BOUNDARY`, `CCNL_RECOVERY_INSTRUCTION`, `WIZARD_SINGLE_TRANSFER_ACTION`, `NEW_ENTITY_DIALOG_KEYBOARD`, `REPORT_METADATA_ACCESSIBLE_NAMES`, `SINGLE_ACCORDION_TRIGGER`, `MOBILE_FUND_CONTEXT`, `RSU_BUSINESS_LABELS`, `RESOURCE_PROVENANCE_READ_MODEL` |
| **MERGE_INTO_OTHER** | **1** | `MONETARY_FIELD_FEEDBACK` (assorbito in `MONETARY_INPUT_BOUNDARY`) |
| **NO_LONGER_REQUIRED**| **0** | Nessuno slice originale è stato cancellato |
| **OPERATIONAL_GATE_PENDING** | **1** | `AUTH_PROFILE_ROLE_PENDING_GATE` |
| **TOTALE ORIGINAL ROADMAP** | **29** | **Somma verificata: 7 + 3 + 17 + 1 + 0 + 1 = 29** |

---

## Current roadmap count

L'inventario complessivo corrente comprende **36 unità di lavoro** (29 originarie + 7 nuove unità):

| Categoria Inventario | Originali | Nuovi / Successivi | Totale Corrente |
| :--- | :---: | :---: | :---: |
| **DONE_VERIFIED** | 7 | 1 (`POST_CLOSE_N_PLUS_1_NAVIGATION`) | **8** |
| **DONE_SOURCE_ONLY** | 3 | 0 | **3** |
| **STILL_REQUIRED** | 17 | 4 (Retirement autorità, Accessibilità Wizard, CAS, Cleanup FK) | **21** |
| **MERGE_INTO_OTHER** | 1 | 0 | **1** |
| **NO_LONGER_REQUIRED** | 0 | 0 | **0** |
| **OPERATIONAL_GATE_PENDING** | 1 | 2 (Deploy Edge runtime, Verifica annuale RGS) | **3** |
| **TOTALE ROADMAP UNITS** | **29** | **7** | **36** |

---

## Remaining implementation count

Il conteggio dei soli **slice di implementazione effettivamente rimanenti** è pari a **21**:

$$\text{REMAINING\_IMPLEMENTATION\_SLICES} = 17\ \text{(originali)} + 4\ \text{(nuovi)} = \mathbf{21}$$

- `MONETARY_FIELD_FEEDBACK` è assorbito in `MONETARY_INPUT_BOUNDARY` e non viene conteggiato due volte.
- `POST_CLOSE_N_PLUS_1_NAVIGATION` è già completato con esito `DONE_VERIFIED`, quindi non fa parte del carico rimanente.
- I 3 gate operativi sono esclusi dal conteggio dell'implementazione.

I 4 nuovi slice di implementazione necessari sono:
1. `ACTIVE_LEGACY_ECONOMIC_AUTHORITY_RETIREMENT`: Ritiro del consumo attivo di `calculateFadTotals` e `constitution.sections` in `FundDetailsPage` e FAD.
2. `WIZARD_ECONOMIC_CONTROLS_ACCESSIBILITY`: Accessibilità, nomi e associazione errori per i controlli economici del Wizard.
3. `ARCH_PERSIST_01_MULTIWRITER_CAS`: Implementazione del controllo di concorrenza ottimistica per salvataggi OPEN simultanei.
4. `DELETE_CLEANUP_CONTRACT`: Definizione formale del protocollo di cancellazione account e gestione dei vincoli relazionali FK.

---

## Operational gates

I **3 gate operativi rimanenti** (`REMAINING_OPERATIONAL_GATES = 3`) sono chiaramente distinti dall'attività di scrittura codice:

1. **`AUTH_PROFILE_ROLE_PENDING_GATE`**: Rehearsal byte-exact, validazione di rollback e applicazione autorizzata della migration `20261002000000_harden_auth_profile_role_source.sql`.
2. **`AUTH_EDGE_DEPLOYMENT_AND_RUNTIME_VALIDATION`**: Deployment formale delle tre Edge Functions e collaudo runtime sul backend target con matrice di token JWT e ruoli.
3. **`RGS_ANNUAL_SCHEMA_VERIFICATION`**: Validazione formale dei tracciati Tabella 15 rispetto alle specifiche ministeriali correnti per abilitare `isSicoExportReady`.

---

## Review estimate

La stima di **25 independent reviews rimanenti** (`REMAINING_INDEPENDENT_REVIEWS_ESTIMATE = 25`) riflette la seguente composizione:
- $21$ review indipendenti per ciascuno dei 21 slice di implementazione;
- $3$ review/audit per ciascuno dei 3 gate operativi;
- $1$ review indipendente della presente fotografia di riconciliazione (il presente documento).

$$\text{Stima Totale} = 21 + 3 + 1 = \mathbf{25}$$

Tale metrica ha valore puramente pianificatorio e programmatico.

---

## Priority roadmap review

La ripartizione delle 24 unità residue (21 implementation + 3 gate operativi) per livello di priorità è rigorosa e priva di doppie assegnazioni:

| Priorità | Implementation | Operational Gates | Totale Unità | Unità Assegnate |
| :---: | :---: | :---: | :---: | :--- |
| **P0** | 4 | 2 | **6** | `PNRR_ZERO_AND_MISSING_CAP`, `ART23_DIRIGENZA_DERIVED_CONSUMPTION`, `DL25_NET_GROSS_MARGIN`, `DL25_TEMPORAL_REGIME`<br>*Gates:* `AUTH_PROFILE_ROLE_PENDING_GATE`, `AUTH_EDGE_DEPLOYMENT_AND_RUNTIME_VALIDATION` |
| **P1** | 7 | 0 | **7** | `EMPTY_FUND_INITIALIZATION`, `MONETARY_INPUT_BOUNDARY`, `ACTIVE_LEGACY_ECONOMIC_AUTHORITY_RETIREMENT`, `CCNL_RECOVERY_INSTRUCTION`, `DL25_BASE_YEAR_LABELS`, `AUTH_ROLE_MIRROR_CONTRACT`, `ARCH_PERSIST_01_MULTIWRITER_CAS` |
| **P2** | 8 | 1 | **9** | `WIZARD_SINGLE_TRANSFER_ACTION`, `NEW_ENTITY_DIALOG_KEYBOARD`, `REPORT_METADATA_ACCESSIBLE_NAMES`, `SINGLE_ACCORDION_TRIGGER`, `WIZARD_ECONOMIC_CONTROLS_ACCESSIBILITY`, `MOBILE_FUND_CONTEXT`, `RESOURCE_PROVENANCE_READ_MODEL`, `DELETE_CLEANUP_CONTRACT`<br>*Gate:* `RGS_ANNUAL_SCHEMA_VERIFICATION` |
| **P3** | 2 | 0 | **2** | `RSU_BUSINESS_LABELS`, `TABELLA15_OUTPUT_MODE` |
| **TOTALE** | **21** | **3** | **24** | **Nessuna unità duplicata o presente in più bucket** |

---

## Next slice assessment

L'analisi comparativa indipendente conferma l'assoluta precedenza dello slice:

$$\mathbf{NEXT\_RECOMMENDED\_SLICE = PNRR\_ZERO\_AND\_MISSING\_CAP}$$

### Valutazione di Rischio Comparata:
1. **`PNRR_ZERO_AND_MISSING_CAP` (P0 - Raccomandato):**\
   - *Comportamento Attuale:* Inserendo $+100,00\ \text{€}$ con tetto PNRR pari a zero o non valorizzato, il calcolo canonico emette stato `VALID` e integra l'importo nel totale del fondo senza errori di conformità.
   - *Capacità di Bypass:* **Massima**. Poiché lo stato upstream è marcato `VALID`, tutti i gate downstream (Cabina di Regia, Distribuzione Risorse, DocumentKindReadiness, Chiusura Annuale) considerano il fondo conforme e consentono l'adozione e la chiusura con risorse finanziariamente prive di copertura.
2. **`DL25_NET_GROSS_MARGIN` (P0):**\
   - Produce una riduzione indebita della facoltà (da $24.000\ \text{€}$ a $18.838\ \text{€}$), penalizzando l'ente ma operando in senso prudenziale (non crea disavanzi fittizi).
3. **`ART23_DIRIGENZA_DERIVED_CONSUMPTION` (P0):**\
   - Circoscritto esclusivamente agli enti dotati di dirigenza (`hasDirigenza === true`), mentre PNRR impatta potenzialmente qualsiasi ente.
4. **`EMPTY_FUND_INITIALIZATION` (P1):**\
   - Riguarda la fase di onboarding di nuovi enti/anni ed è visibile a colpo d'occhio nei dati iniziali.
5. **`MONETARY_INPUT_BOUNDARY` (P1):**\
   - Mitigato parzialmente dal fatto che il ledger scarta i valori negativi additivi assegnando `INVALID`.
6. **`AUTH_PROFILE_ROLE_PENDING_GATE` (P0 Gate):**\
   - Trattasi di un gate operativo di deployment e migration, non di uno slice di scrittura codice applicativo.

La motivazione tecnica del report è **pienamente confermata**.

---

## Tooling network deviation

È stato esaminato l'evento di intercettazione registrato durante l'esecuzione del tooling di diagnostica:

- **Chiamata Rilevata:** `dns.promises.lookup` per il nome host `localhost`, invocata internamente dalla funzione `getLocalhostAddressIfDiffersFromDNS` del bundler Vite.
- **Intercettazione:** La guardia di preload in Node.js ha bloccato la richiesta **prima dell'esecuzione della chiamata di sistema**, impedendo che qualsiasi pacchetto DNS venisse trasmesso.
- **Connessioni Esterne:** Zero connessioni TCP, UDP o TLS stabilite.
- **Risoluzione Applicata:** Configurazione forzata su `127.0.0.1`, con successivi test eseguiti con zero eventi registrati.

$$\text{TOOLING\_NETWORK\_DEVIATION} = \mathbf{DOCUMENTED\_NON\_CONNECTION}$$

Il report ha correttamente e onestamente verbalizzato l'evento anziché azzerare il contatore.

---

## Source/live distinction

L'audit conferma che il report sotto review rispetta in ogni sezione la demarcazione tra codice sorgente e ambienti remoti:
- Tutte le correzioni di sicurezza Edge (`create-user`, `update-password`, `delete-user`) sono definite `SOURCE_FIXED`.
- L'assenza di verifica su database live e funzioni deployate è esplicitata formalmente (`LIVE_NOT_VERIFIED`).
- Non viene fatto alcun affidamento su staging o produzione.

$$\text{SOURCE\_LIVE\_DISTINCTION} = \mathbf{CORRECT}$$

---

## Test/probe review

I dati di collaudo riportati corrispondono ai test eseguiti in isolamento locale:
- **Suite di test esistenti:** 124 file eseguiti, **1.597 test superati con successo (PASS)**, 0 fallimenti.
- **Script Oracle (Wave 2):** 14/14 contratti verificati (PASS).
- **Script Regressioni (Wave 1-3):** 8/8 golden master conformi (PASS).
- **Probe di Caratterizzazione:** 7/7 probe eseguiti con successo.

*Nota di audit:* Il report evidenzia correttamente che il superamento (PASS) di un probe di caratterizzazione non attesta la risoluzione del finding, ma dimostra in modo scientifico la riproducibilità del bug o del comportamento numerico difforme.

---

## Scope integrity

La verifica dell'albero di lavoro e del registro Git conferma:
- 1.129 file inventariati preservati byte per byte;
- 24 modifiche tracciate preesistenti mantenute intatte;
- 0 modifiche indicizzate nell'area di stage;
- Nessun file di audit, fixture o golden pregresso alterato;
- L'unico nuovo file introdotto dalla sessione precedente è `ASTRA_25_FINDINGS_CURRENT_STATE_RECONCILIATION.md`.

$$\text{SCOPE\_INTEGRITY} = \mathbf{PASS}$$

---

## Final recommendation

1. **Approvare formalmente la riconciliazione** `ASTRA_25_FINDINGS_CURRENT_STATE_RECONCILIATION.md` come fotografia ufficiale dello stato corrente del sistema ASTRA.
2. **Adottare la roadmap residua a 24 unità** (21 implementation slices e 3 operational gates).
3. **Avviare prioritariamente lo slice di implementazione:**\
   $$\mathbf{PNRR\_ZERO\_AND\_MISSING\_CAP}$$\
   per neutralizzare il rischio di fabbricazione di risorse fittizie e passaggio inosservato dei controlli di conformità.
4. **Mantenere separati e congelati i gate operativi di sicurezza Auth e RGS**, la cui esecuzione dovrà avvenire esclusivamente con autorizzazioni e sessioni dedicate.

---

# OUTPUT TERMINALE

```text
ASTRA_25_FINDINGS_CURRENT_STATE_RECONCILIATION_INDEPENDENT_REVIEW = COMPLETE

RESULT = PASS

FINDING_SET_INTEGRITY = PASS

ORIGINAL_FINDINGS_TOTAL = 25

VERIFIED_FIXED = 9
PARTIALLY_FIXED = 8
OPEN = 8
NOT_VERIFIED = 0
ACCEPTED_LIMITATION = 0
OUT_OF_SCOPE = 0

STATUS_TOTAL = 25

BLOCKERS_OPEN = 0
HIGH_NOT_FIXED = 11
MEDIUM_NOT_FIXED = 5

VERIFIED_FIXED_IDS = SEC-01, DATA-02, CALC-01, CALC-02, DOC-01, DOC-02, NORM-01, FUNC-01, FUNC-02
PARTIALLY_FIXED_IDS = DATA-03, CALC-04, NORM-02, ARCH-01, ARCH-02, UX-01, UX-02, UX-03
OPEN_IDS = DATA-01, CALC-03, CALC-05, NORM-03, NORM-04, FUNC-03, ACCESS-01, ACCESS-02

CALC_02_STATUS = VERIFIED_FIXED
DOC_02_STATUS = VERIFIED_FIXED
NORM_01_STATUS = VERIFIED_FIXED
FUNC_02_STATUS = VERIFIED_FIXED

ARCH_01_STATUS = PARTIALLY_FIXED
ARCH_02_STATUS = PARTIALLY_FIXED

SOURCE_LIVE_DISTINCTION = CORRECT

AUTH_ADMIN_01 = SOURCE_FIXED
AUTH_ADMIN_02A = SOURCE_FIXED
AUTH_ADMIN_02B = SOURCE_FIXED
AUTH_ROLE_MIRROR = OPEN
AUTH_PROFILE_ROLE_GATE = APPLY_PENDING / LIVE_FIX_NOT_VERIFIED
LIVE_SECURITY_STATUS = LIVE_NOT_VERIFIED

RGS_SCHEMA_STATUS = RGS_SCHEMA_UNVERIFIED
SICO_READINESS = FALSE
ARCH_PERSIST_01 = OPEN_HIGH_DEBT_OUT_OF_SCOPE

ORIGINAL_ROADMAP_SLICES = 29
CURRENT_ROADMAP_UNITS = 36

DONE_VERIFIED_SLICES = 8
DONE_SOURCE_ONLY_SLICES = 3
STILL_REQUIRED_SLICES = 21
MERGED_OR_NO_LONGER_REQUIRED_SLICES = 1
OPERATIONAL_GATE_PENDING = 3

REMAINING_IMPLEMENTATION_SLICES = 21
REMAINING_OPERATIONAL_GATES = 3
REMAINING_INDEPENDENT_REVIEWS_ESTIMATE = 25

P0_REMAINING = 6 (4 implementation, 2 operational gates)
P1_REMAINING = 7 (7 implementation, 0 operational gates)
P2_REMAINING = 9 (8 implementation, 1 operational gates)
P3_REMAINING = 2 (2 implementation, 0 operational gates)

NEXT_RECOMMENDED_SLICE = PNRR_ZERO_AND_MISSING_CAP
NEXT_RECOMMENDED_REASON = Cap zero/missing con incremento positivo produce stato canonico VALID senza errori bloccanti, consentendo a risorse non coperte di attraversare tutti i gate downstream.

TOOLING_NETWORK_DEVIATION = DOCUMENTED_NON_CONNECTION
PRODUCT_NETWORK_ATTEMPTS = 0
TOOLING_NETWORK_ATTEMPTS = 1 (localhost DNS interceptato prima dell'invocazione)
REAL_NETWORK_CONNECTION_ESTABLISHED = NO

TEST_PROBE_EVIDENCE = 124 suites PASS (1.597 test), 14/14 oracle PASS, 8/8 regression PASS, 7/7 characterization probes PASS
SCOPE_INTEGRITY = PASS (working tree preservato byte per byte)

FILES_CHANGED_BY_REVIEW =
ASTRA_25_FINDINGS_CURRENT_STATE_RECONCILIATION_INDEPENDENT_REVIEW.md

DATABASE_CHANGED = NO
MIGRATIONS_APPLIED = NO
STAGING_CONTACTED = NO
PRODUCTION_CONTACTED = NO

COMMIT = NO
PUSH = NO
PR = NO
DEPLOY = NO

REPORT =
ASTRA_25_FINDINGS_CURRENT_STATE_RECONCILIATION_INDEPENDENT_REVIEW.md

NEXT_GATE_RECOMMENDATION =
PNRR_ZERO_AND_MISSING_CAP
```
