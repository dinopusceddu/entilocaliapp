# INDEPENDENT RED-TEAM REVIEW
## ASTRA Final Findings Reconciliation

- **Repository:** `dinopusceddu/entilocaliapp`
- **Branch:** `ux/toolbox-area-fondo-prototype`
- **HEAD commit:** `d3170f959b5815c514dbf3d6e5f93366a5f14c67`
- **Review Date:** 3 Ottobre 2026
- **Reviewer:** Senior Independent Reviewer (Architettura Software, Sicurezza Applicativa e Finanza Regolata)
- **Documento esaminato:** `ASTRA_FINAL_FINDINGS_RECONCILIATION.md`
- **Modalità:** READ-ONLY (Nessuna mutazione codice, DB, staging, produzione o commit)

---

## 1. EXECUTIVE VERDICT

### **`CODEX_RECONCILIATION_CONFIRMED`**

L'analisi indipendente di red-team svolta sul working tree corrente conferma la solidità tecnica, l'accuratezza probatoria e le conclusioni di sintesi del report `ASTRA_FINAL_FINDINGS_RECONCILIATION.md`.

In particolare:
1. **Conteggio e classificazione dei 25 finding ASTRA originari:**
   - **`VERIFIED_FIXED`:** **5** (`SEC-01`, `DATA-02`, `CALC-01`, `DOC-01`, `FUNC-01`)
   - **`PARTIALLY_FIXED`:** **12** (`DATA-03`, `CALC-02`, `CALC-04`, `DOC-02`, `NORM-01`, `NORM-02`, `ARCH-01`, `ARCH-02`, `FUNC-02`, `UX-01`, `UX-02`, `UX-03`)
   - **`OPEN`:** **8** (`DATA-01`, `CALC-03`, `CALC-05`, `NORM-03`, `NORM-04`, `FUNC-03`, `ACCESS-01`, `ACCESS-02`)
   - **Totale:** **25/25 confermati univocamente**.
2. **Blocker ASTRA:** I due Blocker economici/normativi residui (`CALC-02` e `NORM-01`) sono **effettivamente e dimostrabilmente `PARTIALLY_FIXED`**: sebbene il core engine (`canonicalFundLedger`) calcoli correttamente le grandezze per la pagina Fondi e per la Cabina, i caller attivi nella UI (`ReportsPage.tsx` -> `handleGenerateFullSummary` e `handleGenerateFADXLS`) invocano generatori PDF/XLS che consumano ancora `constitution.sections` legacy (`calculateFadTotals`), producendo export difformi e non riconciliati con il ledger canonico.
3. **Flotta Edge Functions e Auth:** I rischi strutturali lato server (`AUTH_ADMIN_01`, `AUTH_ADMIN_02`, `AUTH_ROLE_03`) sono **confermati per tabulas** dal codice sorgente delle Edge Functions e del frontend. La migration di sicurezza profile-role (`20261002000000_harden_auth_profile_role_source.sql`) permane nello stato di **`APPLY_PENDING / LIVE_FIX_NOT_VERIFIED`**.

---

## 2. SCORECARD INDIPENDENTE (25/25 FINDINGS)

| Finding ID | Severity ASTRA | Codex Status | Independent Status | Agreement | Evidenza Tecnica e Rischio Residuo |
|---|---|---|---|---|---|
| **SEC-01** | BLOCKER | VERIFIED_FIXED | **VERIFIED_FIXED** | **CONCORDATO** | Trigger `check_user_app_state_immutability` + RLS RESTRICTIVE + revoca RPC anon su DB impediscono UPDATE ordinario su CLOSED. |
| **DATA-01** | HIGH | OPEN | **OPEN** | **CONCORDATO** | `src/constants.ts` (righe 80, 96, 258) e `AppContext.tsx:51` inizializzano nuovi enti e snapshot con dati demo (limite 2016 = 1.730.000 €). |
| **DATA-02** | HIGH | VERIFIED_FIXED | **VERIFIED_FIXED** | **CONCORDATO** | Chiusura transazionale delegata alla RPC atomica `close_annual_snapshot_atomic`; rollback su errore e protezione N+1. |
| **DATA-03** | HIGH | PARTIALLY_FIXED | **PARTIALLY_FIXED** | **CONCORDATO** | Il ledger assegna `INVALID` a risorse negative, ma `FundDataSchema` ammette `.or(z.any())` e il boolean `isCompliant` rimane `true` con RIA negativa. |
| **CALC-01** | BLOCKER | VERIFIED_FIXED | **VERIFIED_FIXED** | **CONCORDATO** | Nel core, arretrati CCNL isolati in entry semantiche (`CCNL_014_CURRENT` vs `CCNL_014_RECOVERY`); nessun doppio incremento nel calcolo. |
| **CALC-02** | BLOCKER | PARTIALLY_FIXED | **PARTIALLY_FIXED** | **CONCORDATO** | Pagina Personale e Cabina usano subtotali verificati, ma gli export attivi `generateFullSummaryPDF` e `generateFADXLS` usano sections legacy. |
| **CALC-03** | HIGH | OPEN | **OPEN** | **CONCORDATO** | `fundEngine.ts:65-115` (`calculateSimulazione`) fa `Math.min` tra grandezze non omogenee (margine48 netto vs spazi lordi) e divide per `(1+oneri)` riducendo il margine netto a 18.838 € invece di 24.000 €. |
| **CALC-04** | HIGH | PARTIALLY_FIXED | **PARTIALLY_FIXED** | **CONCORDATO** | FAD deriva dal ledger, ma `dirigenzaCorrenteRilevante` (`fundEngine.ts:338`) legge ancora la cache `lim_totaleParzialeRisorseConfrontoTetto2016`. Alterare la cache altera la conformità Art. 23. |
| **CALC-05** | HIGH | OPEN | **OPEN** | **CONCORDATO** | `fundEngine.ts:469` controlla solo `if (maxPnrr > 0)`. Con maxPnrr=0 o mancante, una risorsa PNRR positiva attraversa il core senza errori. |
| **DOC-01** | BLOCKER | VERIFIED_FIXED | **VERIFIED_FIXED** | **CONCORDATO** | `tabella15Mapper.ts` riconcilia dal ledger, preserva sottrazioni e decurtazioni, blocca definitivo con mapping irrisolti; limite SICO esplicitato. |
| **DOC-02** | HIGH | PARTIALLY_FIXED | **PARTIALLY_FIXED** | **CONCORDATO** | Determina e Prospetto moderni usano proiezioni bozza/definitivo e attestazioni neutre; Riepilogo PDF e XLS Fondo bypassano la readiness e non espongono bozza/indeterminatezza. |
| **NORM-01** | BLOCKER | PARTIALLY_FIXED | **PARTIALLY_FIXED** | **CONCORDATO** | Core e ledger azzerano Art. 60 prima del 2026 (`canonicalFundLedger.ts:275`); gli export legacy mostrano ancora nel 2025 la decurtazione nelle sezioni raw. |
| **NORM-02** | HIGH | PARTIALLY_FIXED | **PARTIALLY_FIXED** | **CONCORDATO** | Massimale annuale 0,22% corretto nel Wizard (2.200 € annui su 1M); ma il recupero 2.800 € non istruito appare quantificato negli export separati. |
| **NORM-03** | HIGH | OPEN | **OPEN** | **CONCORDATO** | `fundEngine.ts:90-95` applica incondizionatamente il vincolo L. 296/2006 nel simulatore senza recepire la decorrenza dell'art. 2 c. 1 D.L. 144/2026. |
| **NORM-04** | HIGH | OPEN | **OPEN** | **CONCORDATO** | `Step3Dl25.tsx:53` calcola `annoPrecedente = annoIstruttoria - 1` chiedendo il 2024 per il 2025; `Step8RiepilogoPreview.tsx:358` riporta ancora la stringa "4,8%" invece di "48%". |
| **ARCH-01** | HIGH | PARTIALLY_FIXED | **PARTIALLY_FIXED** | **CONCORDATO** | Zero esplicito prevale sull'alias nel normalizer; tuttavia `calculateFadTotals` e `calculateCcnl2024Increases` mantengono percorsi paralleli attivi. |
| **ARCH-02** | MEDIUM | PARTIALLY_FIXED | **PARTIALLY_FIXED** | **CONCORDATO** | `is_admin()` lato DB verifica `profiles`, ma le Edge Functions usano `user_app_state.role` e la gestione utenti non è transazionale. |
| **FUNC-01** | HIGH | VERIFIED_FIXED | **VERIFIED_FIXED** | **CONCORDATO** | Reducer e salvataggi rifiutano mutazioni su CLOSED; toast di falso successo eliminato; UI disabilita input e import su CLOSED. |
| **FUNC-02** | HIGH | PARTIALLY_FIXED | **PARTIALLY_FIXED** | **CONCORDATO** | `resolveOperationalStatus.ts` dipende unicamente da `canonicalFund.status`. Con fondo VALID ma compliance BLOCKING propone comunque `CONSTITUTION_VERIFIED` e "Inizia la Distribuzione". Distribuzione applica residuo zero automatico su performance. |
| **FUNC-03** | MEDIUM | OPEN | **OPEN** | **CONCORDATO** | `Wizard2026SummaryPanel.tsx:280-294` visualizza pulsante disabilitato con testo "Non ancora attivo: sarà disponibile dopo il refactoring", mentre Step 8 ha il transfer operativo. |
| **UX-01** | MEDIUM | PARTIALLY_FIXED | **PARTIALLY_FIXED** | **CONCORDATO** | Provenance tracciata nelle entry del ledger ma non esposta all'utente in UI; codici grezzi non tradotti per i prerequisiti mancanti. |
| **UX-02** | HIGH | PARTIALLY_FIXED | **PARTIALLY_FIXED** | **CONCORDATO** | `AreaFondoContextBar.tsx:176` tronca il nome ente con classe CSS `truncate` affidandosi all'attributo `title`, non accessibile su mobile/touch. |
| **UX-03** | MEDIUM | PARTIALLY_FIXED | **PARTIALLY_FIXED** | **CONCORDATO** | Termini di sviluppo esposti a video in percorsi operativi: "Mapping Preview", "legacyField" (SummaryPanel:267), "opinionOutcome", "transmissionStatus" (ReportsPage:366, 380). |
| **ACCESS-01** | HIGH | OPEN | **OPEN** | **CONCORDATO** | Modale "Nuovo Ente" in `FondiEntiPage.tsx:700-714` è un `div` senza ruolo `dialog`, senza `aria-modal`, senza focus trap, senza chiusura su tasto Escape. |
| **ACCESS-02** | MEDIUM | OPEN | **OPEN** | **CONCORDATO** | 7 input e 2 select metadati in `ReportsPage.tsx:294-404` privi di associazione `htmlFor`/`id`; `Card.tsx:39-47` ha `role="button"` con un `<button>` annidato; toggle mobile SummaryPanel è un `div` non accessibile da tastiera. |

---

## 3. APPROFONDIMENTO CRITICO DEI PUNTI RED-TEAM PRIORITARI

### A. Export Documentali e Duplicazione di Calcolo (CALC-02 / NORM-01 / DOC-02 / ARCH-01)
È stato ricostruito l'esatto grafo dei chiamanti:
```
ReportsPage.tsx
  ├── handleGenerateFullSummary (r. 65) ──> generateFullSummaryPDF (reportService.ts:17)
  │     └──> generateFondoPDF (pdfReportService.ts:218)
  │           └──> createReportViewModel (reportPresenter.ts:30)
  │                 └──> legge fondi.dipendente.constitution.sections (generato da calculateFadTotals)
  │
  └── handleGenerateFADXLS (r. 80) ──────> generateFADXLS (reportService.ts:50)
        └──> generateFondoDipendenteXLS (xlsReportService.ts:11)
              └──> createReportViewModel (reportPresenter.ts:30)
                    └──> legge fondi.dipendente.constitution.sections
```
- **Raggiungibilità reale:** Entrambi i pulsanti sono pienamente operativi e visibili nella UI (`ReportsPage.tsx`, righe 278 e 527).
- **Alimentazione:** Consumano `fondi.dipendente.constitution.sections`, prodotto da `calculateFadTotals`, ignorando il ledger canonico `canonicalFund`.
- **Divergenza accertata:**
  1. Nel 2025, la riga Art. 60 decurtazione (127,44 €) compare nelle sezioni e viene esportata nell'XLS/PDF, sebbene il ledger la azzeri per decorrenza normativa (`NORM-01`).
  2. Il recupero CCNL 2.800 € (privo di istruttoria documentata) viene riportato e sommato nel totale dell'XLS/PDF, laddove il ledger canonico lo marca `UNDETERMINED` e restituisce `total: null` (`CALC-02`, `NORM-02`).
- **Verdetto:** Lo stato **`PARTIALLY_FIXED`** è rigorosamente confermato. Non si tratta di codice morto, ma di un canale documentale attivo concorrente.

### B. Consumo Art. 23 Dirigenza (CALC-04)
- Nel Fondo Dipendenti, il consumo Art. 23 deriva dalle entry del ledger (`canonicalFund.verifiedArt23Subject`, `fundEngine.ts:335`).
- Per la Dirigenza, `fundEngine.ts:338` calcola:
  ```typescript
  const dirigenzaCorrenteRilevante = annualData.hasDirigenza
    ? (fondi.dirigenza?.lim_totaleParzialeRisorseConfrontoTetto2016 || 0)
    : 0;
  ```
- Tale valore è una cache denormalizzata salvata da `FondoDirigenzaPage.tsx:73`. Se l'utente o uno script altera tale campo da 0 a 2.000 € a parità di voci analitiche, `risorseRilevantiArt23Effettive` subisce una variazione identica e la conformità passa da `CONFORME` a `NON CONFORME`.
- **Verdetto:** **`PARTIALLY_FIXED` confermato**. La violazione del principio "totali sempre derivati" permane nel perimetro complessivo dell'ente.

### C. Condizione di Capienza PNRR (CALC-05)
- In `fundEngine.ts:467-471`:
  ```typescript
  const maxPnrr = annualData.calcolatoIncrementoPNRR3 ?? 0;
  const pnrrVal = fondi.dipendente?.vn_dl13_art8c3_incrementoPNRR_max5stabile2016 ?? 0;
  if (maxPnrr > 0 && pnrrVal > maxPnrr + 0.01) {
    checkErrors.push(`L'incremento PNRR effettivo ... supera il limite massimo consentito ...`);
  }
  ```
- **Comportamento accertato:** Se `maxPnrr === 0` (ente non soggetto attuatore o limite zero) o se `maxPnrr` è mancante/undefined, la condizione `maxPnrr > 0` risulta falsa. Un inserimento di `pnrrVal = 100` attraversa il motore senza generare alcun errore o warning. Nel ledger canonico la voce viene classificata come risorsa generica valida ed esclusa dall'Art. 23.
- **Verdetto:** **`OPEN` confermato**. Manca la gestione dello zero verificato e del dato mancante.

### D. Priorità Operativa in Cabina di Regia (FUNC-02)
- In `resolveOperationalStatus.ts:38-42`:
  ```typescript
  case 'VALID':
    return distributionStatus === 'IN_PROGRESS'
      ? 'DISTRIBUTION_IN_PROGRESS'
      : 'CONSTITUTION_VERIFIED';
  ```
- La funzione non riceve né valuta l'array `complianceChecks` o la presenza di issue con gravità `BLOCKING`.
- Di conseguenza, se un fondo ha importi positivi validi nel ledger (`VALID`), ma presenta una violazione bloccante di conformità (es. superamento tetto 2016 o violazione contrattuale), lo stato operativo restituito è comunque `CONSTITUTION_VERIFIED` e la CTA primaria proposta è `"Inizia la Distribuzione"` (`resolveCabinaViewModel.ts:64`).
- Inoltre, in `DistribuzioneRisorsePage.tsx:401-430`, un `useEffect` ripartisce automaticamente il budget residuo sulla performance con azzeramento forzato (`FinancialMath.subtractExact`), alterando lo stato anche senza una deliberazione consapevole della RSU.
- **Verdetto:** **`PARTIALLY_FIXED` confermato**.

### E. Dati Dimostrativi nei Nuovi Enti (DATA-01)
- `src/constants.ts:80-92` definisce `INITIAL_HISTORICAL_DATA` con valori non nulli:
  - Tetto salario accessorio 2016: 1.200.000 € (FRD), 150.000 € (EQ), 300.000 € (Dirigenza), 30.000 € (Segretario), 50.000 € (Straordinario) -> Totale 1.730.000 €.
  - Spesa stipendi tabellari 2023: 2.500.000 €.
- `AppContext.tsx:51` e `snapshotWorkflow.ts:146` idratano il nuovo ente e le nuove annualità con questo payload di default.
- Quando un utente crea un nuovo ente da catalogo o apre una nuova annualità senza inserire dati storici, il motore assume il tetto di 1.730.000 € come base di calcolo reale.
- **Verdetto:** **`OPEN` confermato**.

---

## 4. SECURITY APPENDIX: EDGE FUNCTIONS E AUTH

### AUTH_ADMIN_01: `CONFIRMED` (Rischio Alto)
- **Codice ispezionato:** `supabase/functions/create-user/index.ts`, righe 24-43.
- **Flusso accertato:**
  1. Verifica che il client sia autenticato (`supabaseClient.auth.getUser()`, riga 24).
  2. Commento esplicito alle righe 27-28:
     ```typescript
     // Optional: Query your DB to check if this user is truly an admin if you want strict security
     // For now, we rely on the fact that only Admins can see the page initiating this call
     ```
  3. Istanzia immediatamente `supabaseAdmin` con la `SERVICE_ROLE_KEY` (righe 31-34).
  4. Crea l'utente chiamando `supabaseAdmin.auth.admin.createUser({ email, password, email_confirm: true })`.
- **Impatto:** Qualsiasi utente con un JWT valido (anche ruolo GUEST o account standard) può invocare direttamente l'endpoint HTTP dell'Edge Function via `POST` e creare arbitrariamente nuovi account utente auto-confermati sul database di Supabase.

### AUTH_ADMIN_02: `CONFIRMED` (Rischio Architetturale)
- **Codice ispezionato:**
  - `update-password/index.ts:34-42`: Legge `user_app_state.role` tramite service client con `.single()`.
  - `delete-user/index.ts:27-36`: Legge `user_app_state.role` con `.limit(1).single()`.
- **Flusso accertato:** L'autorizzazione per cambiare la password o eliminare qualsiasi utente non interroga la tabella canonica `profiles` né la funzione DB `is_admin()`, bensì il campo denormalizzato `role` della tabella `user_app_state`. Se un utente dispone di record multipli o se il ruolo non è allineato a `profiles`, l'esito dipende dallo stato degli snapshot applicativi.

### AUTH_ROLE_03: `CONFIRMED`
- **Codice ispezionato:** `UserManagementPage.tsx`, righe 94-107.
- **Flusso accertato:**
  ```typescript
  const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
  if (error) throw error;
  await supabase.from('user_app_state').update({ role: newRole }).eq('user_id', userId);
  ```
  Le due mutazioni sono chiamate distinte, non racchiuse in una transazione atomica. L'esito della seconda chiamata viene ignorato (`await` senza controllo errore). Se l'utente ha un'annualità `CLOSED` protetta dal trigger di immutabilità, l'aggiornamento di `user_app_state` fallisce silenziosamente, lasciando i ruoli divergenti.

### AUTH Profile Migration: `APPLY_PENDING / LIVE_FIX_NOT_VERIFIED`
- Il file `supabase/migrations/20261002000000_harden_auth_profile_role_source.sql` è presente come file locale untracked.
- Sostituisce il vecchio trigger `20260220000004_fix_profiles_recursion.sql` (che leggeva `NEW.raw_user_meta_data->>'role'`) imponendo `role = 'GUEST'`.
- La migration non risulta ancora applicata in modo persistente e certificato su staging o produzione. Nessuna connessione live è stata effettuata in questa review.

---

## 5. VALUTAZIONE DI PRIORITÀ DELLA ROADMAP

### **`RECOMMENDED_NEXT_SLICE = AUTH_ADMIN_01_SERVER_ADMIN_CHECK`**

### **`WHY_THIS_SLICE_FIRST`**
La raccomandazione proposta da Codex di affrontare prioritariamente `AUTH_ADMIN_01` è **confermata e condivisa per le seguenti ragioni di sicurezza e architettura**:

1. **Rischio di sicurezza attivo e non mitigato:** La funzione `create-user` consente a qualunque utente autenticato di invocare il client service-role bypassando l'autorizzazione di business. Affidarsi alla sola visibilità della pagina nel frontend ("security through UI obscurity") costituisce una vulnerabilità OWASP API1:2023 (Broken Object Level Authorization / Broken Function Level Authorization).
2. **Indipendenza architetturale assoluta:** La correzione di `create-user` **non dipende** dall'applicazione della migration `20261002000000` né dal refactoring di `user_app_state`. È sufficiente verificare lato server, prima di istanziare il client admin:
   ```typescript
   const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', user.id).single();
   if (!profile || profile.role !== 'ADMIN') throw new Error('Forbidden');
   ```
   oppure invocando la RPC DB canonica `public.is_admin()`.
3. **Isolamento e rischio di regressione nullo:** Modificare un singolo file Edge Function (`supabase/functions/create-user/index.ts`) e il suo test non tocca minimamente il core engine finanziario, le formule di calcolo, né i presenter documentali. Non espande il working-tree delta sui moduli finanziari prima di affrontare i Blocker `CALC-02` e `NORM-01`.
4. **Sequenza logica:** Sanare prima il perimetro di accesso amministrativo permette di lavorare successivamente sull'unificazione dei report (`FAD_REPORT_READ_MODEL` / `CANONICAL_FAD_XLSX` / `CANONICAL_FUND_SUMMARY_PDF`) su basi applicative protette.

---

## 6. VALUTAZIONE CRITICA DEI 29 SLICE DELLA ROADMAP PROPOSTA

| ID Slice Proposto | Target Finding | Valutazione Indipendente | Rationale Tecnico |
|---|---|---|---|
| **AUTH_ADMIN_01_SERVER_ADMIN_CHECK** | ARCH-02 / AUTH_ADMIN_01 | **NECESSARY** | Blocco immediato dell'abuso service-role da parte di non-admin. |
| **AUTH_ADMIN_02A_PASSWORD_CANONICAL_AUTH** | ARCH-02 / AUTH_ADMIN_02 | **NECESSARY** | Migra autorizzazione cambio password da `user_app_state` a `profiles`/`is_admin()`. |
| **AUTH_ADMIN_02B_DELETE_CANONICAL_AUTH** | ARCH-02 / AUTH_ADMIN_02 | **NECESSARY** | Separato da 02A per isolare l'operazione distruttiva di eliminazione account. |
| **AUTH_ROLE_MIRROR_CONTRACT** | ARCH-02 / AUTH_ROLE_03 | **NECESSARY** | Gestisce la denormalizzazione senza dipendenze autorizzative fragili. |
| **AUTH_PROFILE_ROLE_PENDING_GATE** | ARCH-02 / Migration | **NECESSARY** | Gate operativo/documentale per applicazione controllata della migration pendente. |
| **FAD_REPORT_READ_MODEL** | CALC-02, NORM-01, NORM-02, DOC-02, ARCH-01 | **NECESSARY** | **Cardine fondamentale**: crea il DTO di proiezione unica da `canonicalFund` per tutti i report. |
| **CANONICAL_FAD_XLSX** | CALC-02, DOC-02 | **NECESSARY** | Collega l'XLS Fondo Dipendenti al nuovo DTO, ritirando le sezioni legacy. |
| **CANONICAL_FUND_SUMMARY_PDF** | CALC-02, DOC-02 | **NECESSARY** | Collega il PDF Riepilogo Generale al nuovo DTO, qualificando perimetro e bozza. |
| **DOCUMENT_KIND_READINESS** | DOC-02, FUNC-02 | **NECESSARY** | Definisce prerequisiti differenziati per tipo di atto prima dello sblocco del definitivo. |
| **TABELLA15_OUTPUT_MODE** | DOC-02, UX-03 | **MERGE_WITH_OTHER** | **Da unire a `CANONICAL_FAD_XLSX`**: la propagazione della modalità bozza è una rifinitura del presenter. |
| **DL25_NET_GROSS_MARGIN** | CALC-03 | **NECESSARY** | Corregge la formula in `fundEngine.ts:65` confrontando grandezze omogenee (24.000 € netti). |
| **DL25_TEMPORAL_REGIME** | NORM-03 | **NECESSARY** | Introduce la decorrenza dell'art. 2 c. 1 D.L. 144/2026 per la disattivazione del vincolo L. 296/2006. |
| **DL25_BASE_YEAR_LABELS** | NORM-04 | **MERGE_WITH_OTHER** | **Da unire a `RSU_BUSINESS_LABELS`**: trattasi di correzione testi in `Step3Dl25` e `Step8RiepilogoPreview`. |
| **PNRR_ZERO_AND_MISSING_CAP** | CALC-05 | **NECESSARY** | Impone validazione su max PNRR = 0 e mancante, impedendo incrementi non capienti. |
| **ART23_DIRIGENZA_DERIVED_CONSUMPTION** | CALC-04 | **NECESSARY** | Elimina la cache autoritativa per la Dirigenza nel controllo globale Art. 23 c. 2. |
| **EMPTY_FUND_INITIALIZATION** | DATA-01 | **NECESSARY** | Sostituisce i dati demo con inizializzazione a campi nulli/mancanti senza toccare snapshot storici. |
| **MONETARY_INPUT_BOUNDARY** | DATA-03 | **NECESSARY** | Rimuove `.or(z.any())` da `FundDataSchema` e assicura validazione non-negativa uniforme. |
| **MONETARY_FIELD_FEEDBACK** | DATA-03, ACCESS-02 | **MERGE_WITH_OTHER** | **Da unire a `MONETARY_INPUT_BOUNDARY`**: il feedback UI sugli errori monetari è il completamento del boundary. |
| **CCNL_RECOVERY_INSTRUCTION** | NORM-02, UX-01 | **DEFER** | I recuperi sono già marcati `UNDETERMINED` nel ledger; la guida istruttoria può seguire l'allineamento dei report. |
| **CABINA_BLOCKING_ISSUE_PRIORITY** | FUNC-02 | **NECESSARY** | Condiziona `CONSTITUTION_VERIFIED` all'assenza di `BLOCKING` in `complianceChecks`. |
| **DISTRIBUTION_EXPLICIT_DRAFT** | FUNC-02, UX-01 | **NECESSARY** | Elimina l'auto-distribuzione performance con effect mutativo e tratta personale ignoto come mancante. |
| **CLOSURE_INSTRUCTION_READINESS** | FUNC-02 | **DEFER** | L'atomicità di chiusura è già consolidata (`DATA-02`); la readiness amministrativa pre-chiusura richiede accordo di business. |
| **WIZARD_SINGLE_TRANSFER_ACTION** | FUNC-03, UX-03 | **NECESSARY** | Allinea o rimuove la CTA disabilitata con testo "refactoring" in `Wizard2026SummaryPanel`. |
| **NEW_ENTITY_DIALOG_KEYBOARD** | ACCESS-01 | **NECESSARY** | Rende accessibile la modale Nuovo Ente (ruolo dialog, trap del focus, Escape, ritorno focus). |
| **REPORT_METADATA_ACCESSIBLE_NAMES**| ACCESS-02 | **MERGE_WITH_OTHER** | **Da unire a `SINGLE_ACCORDION_TRIGGER`** in un unico slice consolidato di accessibilità UI (`ACCESSIBILITY_WCAG_REMEDIATION`). |
| **SINGLE_ACCORDION_TRIGGER** | ACCESS-02 | **MERGE_WITH_OTHER** | Da unire con sopra per eliminare bottoni annidati in `Card.tsx` e div interattivi non semantici. |
| **MOBILE_FUND_CONTEXT** | UX-02 | **NECESSARY** | Rende visibile il nome completo dell'ente su touch senza dipendere da `title`. |
| **RSU_BUSINESS_LABELS** | UX-03 | **NECESSARY** | Elimina sigle e identificatori tecnici interni dalle viste utente. |
| **RESOURCE_PROVENANCE_READ_MODEL** | UX-01 | **DEFER** | Richiede un modello di presentazione avanzato per le 15 domande RSU; non blocca la quadratura contabile. |

---

## 7. VERIFICA ARCHITETTURALE E TARGET FINALE

L'architettura verso cui la roadmap converge deve mantenere la pipeline a flusso unidirezionale canonico:
```
FundData (immissione/ripristino)
  └──> Normalization (validazione monetaria, zero espliciti, alias resolution)
        └──> Canonical Calculation (canonicalFundLedger: calcolo deterministico, stato VALID/INVALID/UNDETERMINED)
              └──> Canonical Verification & Readiness (Compliance checks + Document readiness)
                    └──> Unified Read Model / Projection (documentProjection & reportPresenter)
                          ├──> UI (Wizard, Fondo, Cabina, Distribuzione)
                          └──> Documents & Exports (Determina PDF/TXT, Relazione TXT, Prospetto TXT, Tabella 15 XLSX/CSV, Riepilogo PDF, XLS Fondo)
```

**Target Ledger raccomandato:**
- Non è necessaria né opportuna una riscrittura totale: il **Canonical Fund Ledger FRD** è già ben impostato per il Fondo Dipendenti.
- È sufficiente estendere proiezioni derivate per gli altri fondi (EQ, Dirigenza, Segretario) eliminando le cache denormalizzate (`CALC-04`), senza fondere forzatamente perimetri contrattuali distinti in un unico megastrutturato.

---

## 8. STATO FINALE DI CONSERVAZIONE (AUDIT DI CONFORMITÀ)

Prima della chiusura delle operazioni, è stato rieseguito il controllo di integrità dell'ambiente di lavoro:
- **Branch invariato:** `ux/toolbox-area-fondo-prototype`
- **HEAD invariato:** `d3170f959b5815c514dbf3d6e5f93366a5f14c67`
- **Tracked modified preesistenti:** Invariati (2 file di test storici: `securityMigrations.test.ts` e `wizard2026RemoteDraftSync.test.ts`)
- **Staged files:** 0
- **Database mutations / migrations applied:** 0
- **Chiamate di rete o contatti verso ambienti remoti:** 0

Unico file generato in questa sessione: `ASTRA_FINAL_RECONCILIATION_INDEPENDENT_REVIEW.md`.

---
*Fine della Relazione Indipendente di Revisione.*
