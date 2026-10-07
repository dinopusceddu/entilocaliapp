# CALC-02 — Final Independent Closure Review
## Distribution Canonical Budget & Original ASTRA Acceptance Closure

**Review Date:** 2026-10-04\
**Reviewer:** Principal Software Architect, Regulated Financial Systems Auditor & Independent Reviewer\
**Slice Evaluated:** `CALC02_FINAL_INDEPENDENT_CLOSURE_REVIEW`\
**Repository:** `dinopusceddu/entilocaliapp`\
**Branch:** `ux/toolbox-area-fondo-prototype`\
**HEAD:** `d3170f959b5815c514dbf3d6e5f93366a5f14c67`\
**Result:** **PASS — CALC02_FINAL_INDEPENDENT_CLOSURE_REVIEW = COMPLETE**

---

## 1. Executive Verdict

L'audit indipendente e forense condotto sullo slice `CALC02_FINAL_INDEPENDENT_CLOSURE_REVIEW` emette verdetto **PASS**.

Con la sostituzione dell'ultimo bypass economico legacy in `DistribuzioneRisorsePage.tsx` mediante il resolver puro `resolveDistributionFundBudget`, l'intera catena di calcolo, proiezione, quadratura e consumo del Fondo Risorse Decentrate fa capo a **un'unica autorità economica canonica**:
$$\text{FundData} \longrightarrow \text{Normalization} \longrightarrow \text{Canonical Fund Ledger} \longrightarrow \text{CanonicalFundResult} \longrightarrow \text{Read Models / Presenters / UI / Exports}$$

### Determinazioni Principali
1. **`CALC-02` (Uniformità economica cross-consumer):** **`VERIFIED_FIXED`**.\
   Tutti i 14 criteri rigorosi di quadratura contabile, separazione tra totale autoritativo e base di bozza, indipendenza dai payload legacy, gestione dello zero esplicito, riconciliazione delle risorse manuali e importate, precisione al centesimo ed esportazioni canoniche risultano pienamente soddisfatti.
2. **`NORM-01` (Normalizzazione della pipeline di proiezione e Art. 60):** **`VERIFIED_FIXED`** (nessuna regressione accertata).
3. **Stato Blocker ASTRA:** **`ASTRA_BLOCKERS_OPEN = 0`**.\
   Entrambi i blocker originali dell'Audit ASTRA (`CALC-02` e `NORM-01`) risultano integralmente chiusi e formalmente verificati.
4. **Debiti Residui (Non-Blocker):** `FUNC-02`, `DOC-02`, `NORM-02` e `ARCH-01` permangono `PARTIALLY_FIXED` in conformità al loro perimetro di workflow e pulizia architetturale non bloccante.

---

## 2. Original Acceptance

L'acceptance originale prescritta dall'Audit ASTRA per `CALC-02` recita testualmente:
> *"Cabina, Personale, distribuzione ed export concordano al centesimo per risorse importate e manuali."*

L'audit ha accertato che tale criterio non è stato ridotto né eluso:
- **Catena End-to-End Verificata:** Canonical Fund Ledger $\rightarrow$ Cabina di Regia $\rightarrow$ Fondo Personale $\rightarrow$ Distribuzione Risorse $\rightarrow$ FadReportReadModel $\rightarrow$ XLSX $\rightarrow$ PDF.
- **Scenari Economici Verificati al Centesimo:**
  1. *Scenario A/2025 (Fondo non determinato con subtotale stabile):* Tutti i 7 consumer attestano esattamente un subtotale verificato di $3.400,00\ \text{€}$ e un totale autoritativo $null$ / `"Non determinato"`.
  2. *Scenario Risorse Manuali + Trasferite/Importate (Probe 19):* Componente manuale Art. 67 c. 3 ($1.200,00\ \text{€}$) + risorsa trasferita/importata ($2.899,00\ \text{€}$) - decurtazione Art. 60 ($126,44\ \text{€}$) = Totale canonico $3.972,56\ \text{€}$ perfettamente concorde al centesimo su tutti i consumer.
  3. *Scenario Zero Esplicito e Decurtazione (Probe 20):* Incrementi pari a $1.500,00\ \text{€}$ annullati da decurtazione di $1.500,00\ \text{€}$ = Totale canonico $0,00\ \text{€}$ rispettato ovunque senza fallback numerici.
  4. *Scenario Precisione Centesimi e Arrotondamento (Probe 21):* Importi frazionari complessi ($1.333,33\ \text{€}$, $2.666,67\ \text{€}$, ecc.) privi di qualsiasi deriva a virgola mobile o disallineamento nei residui.

---

## 3. Distribution Source Review

### Analisi del Diff Reale in `src/pages/DistribuzioneRisorsePage.tsx`
Nel codice previgente, il budget da distribuire veniva risolto mediante la seguente istruzione:
```typescript
// CODICE PREVIGENTE (VULNERABILE / BYPASS CANONICO):
const totaleFondo = calculationResult?.fondi.dipendente.summary.totaleFondo || 0;
```
Tale istruzione costituiva un bypass critico poiché:
1. leggeva la proprietà legacy non normalizzata `fondi.dipendente.summary.totaleFondo`;
2. trasformava il subtotale verificato di $3.400,00\ \text{€}$ in budget autoritativo anche quando il fondo era `UNDETERMINED` e il totale autoritativo era $null$;
3. con l'operatore falsy `|| 0`, non distingueva un fondo assente da un fondo legittimamente pari a zero.

Nel codice corrente, la sorgente è stata integralmente sostituita:
```typescript
// CODICE ATTUALE (CANONICO / SICURO):
const fundBudget = resolveDistributionFundBudget(calculationResult?.canonicalFund);
const balances = resolveDistributionBalances(fundBudget.basis, utilizziParteStabile, totaleAllocato);
```

### Ispezione di Eventuali Fallback o Sorgenti Indirette Legacy
È stata condotta una ricerca esaustiva nel file `DistribuzioneRisorsePage.tsx`:
- `summary.totaleFondo`: **ASSENTE** da qualsiasi calcolo di budget o residuo;
- `section.total`: **ASSENTE**;
- `calculateFadTotals`: **ASSENTE**;
- `FundData raw`: **ASSENTE**;
- Fallback con operatore falsy su valori economici di fondo: **ASSENTI**.

**Classificazione:** `LEGACY_DISTRIBUTION_BUDGET_AUTHORITY = ABSENT`.

---

## 4. Resolver Purity

Il modulo `src/logic/distribution/resolveDistributionFundBudget.ts` è stato sottoposto ad audit statico dell'AST e logico-funzionale.

### Interfaccia e Proprietà Lette/Prodotte
- **Input:** legge unicamente la proiezione canonica:
  - `canonical?.status`
  - `canonical?.total`
  - `canonical?.verifiedTotal`
- **Output:** produce una struttura di proiezione pura:
  - `canonicalStatus: CanonicalFundStatus | 'MISSING'`
  - `authoritativeFundTotal: number | null`
  - `verifiedFundSubtotal: number | null`
  - `basis: DistributionFundBasis` contenente `{ mode: 'AUTHORITATIVE' | 'VERIFIED_DRAFT' | 'UNAVAILABLE', amount: number | null }`

### Verifica di Assenza di Ricalcoli Economici Indebiti
L'implementazione è verificata come **pura funzione proiettiva**:
- Nessuna formula normativa autonoma;
- Nessun calcolo percentuale (es. percentuali performance);
- Nessun riferimento o ricalcolo di Art. 60, Art. 23 comma 2, DL 25, PNRR;
- Nessuna logica di recovery o ripescaggio importi non determinati;
- Nessun arrotondamento economico concorrente.

**Classificazione:** `DISTRIBUTION_RESOLVER_PURITY = PURE_PROJECTION`.

---

## 5. VALID / Zero / Missing Contracts

| Stato Canonico | `canonical.total` | `canonical.verifiedTotal` | `authoritativeFundTotal` | `verifiedFundSubtotal` | `basis.mode` | `basis.amount` | Comportamento UI / Residuo |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **VALID (Standard)** | $10.000,00$ | $10.000,00$ | $10.000,00$ | $10.000,00$ | `AUTHORITATIVE` | $10.000,00$ | Totale numerico esposto. Residuo calcolato sull'autorità definitiva. Legacy $99.999$ ignorato. |
| **VALID (Zero Esplicito)** | $0,00$ | $0,00$ | $0,00$ | $0,00$ | `AUTHORITATIVE` | $0,00$ | Totale esposto pari a $0,00\ \text{€}$. Nessun fallback a valori pregressi (es. $900$). Residuo negativo ammesso se presenti utilizzi. Zero non scambiato per missing. |
| **UNDETERMINED (A/2025)** | $null$ | $3.400,00$ | $null$ | $3.400,00$ | `VERIFIED_DRAFT` | $3.400,00$ | Totale `"Non determinato"`. $3.400$ esposto unicamente come base simulativa di bozza con banner di avviso. Residuo qualificato `(bozza)`. |
| **INVALID (Patologico)** | $5.000,00$ | $3.400,00$ | $null$ | $3.400,00$ | `VERIFIED_DRAFT` | $3.400,00$ | Nessuna promozione del totale numerico patologico. Totale autoritativo forzato a $null$. |
| **MISSING (Assente)** | $undefined$ | $undefined$ | $null$ | $null$ | `UNAVAILABLE` | $null$ | Nessuno zero inventato. Nessuna mutazione budget-driven attivata. Allocazioni utente preesistenti preservate intatte. |

---

## 6. UNDETERMINED Draft Semantics

Nello scenario A/2025:
- `canonical.status = 'UNDETERMINED'`
- `canonical.verifiedStable = 3400.00`
- `canonical.verifiedVariable = 0.00`
- `canonical.verifiedTotal = 3400.00`
- `canonical.total = null`
- Voce unresolved: straordinario non quantificato ($2.800,00\ \text{€}$ da istruire).

### Comportamento Verificato nella Pagina Distribuzione
1. **KPI Principale:** Riporta testualmente `"Non determinato"`. Non visualizza $3.400,00\ \text{€}$ come budget accertato né come fondo costituito.
2. **Subtotale di Bozza:** I $3.400,00\ \text{€}$ sono etichettati in un box dedicato come `"Margine di simulazione (subtotale provvisorio)"`.
3. **Banner di Qualificazione:** È presente il banner esplicito:
   > *"Attenzione: il totale del fondo è provvisorio / non determinato. I margini mostrati hanno valore di simulazione (bozza) e non attestano la costituzione formale del fondo."*
4. **Residuo da Allocare:** Il residuo riporta la qualificazione esplicita `"Residuo da allocare (bozza): ..."` oppure `"Margine di simulazione (bozza)"`.
5. **Esclusione Recovery:** I $2.800,00\ \text{€}$ esclusi dal ledger non rientrano in alcuna forma nel calcolo del budget di distribuzione.

---

## 7. Mutation / Persistence Red-Team

Lo slice conserva l'algoritmo di auto-riparto della performance (`p_performanceIndividuale`, `p_performanceOrganizzativa`) calcolandolo sulla base provvisoria quando `basis.mode === 'VERIFIED_DRAFT'`.

È stato condotto un security & accounting red-team per accertare se tale operazione re-introduca un'autorità monetaria spuria:
- **Analisi dei Dispatch:** L'aggiornamento automatico scrive esclusivamente le quote di riparto della performance all'interno delle voci di utilizzo (`utilizziParteVariabile`).
- **Analisi dello Stato e dei KPI:** Nessun dispatch modifica o promuove `authoritativeFundTotal` o `canonicalFund.status`. Lo stato canonico del fondo rimane indiscutibilmente `UNDETERMINED` e il totale autoritativo rimane `null`.
- **Analisi della Persistenza (Local & Remote Draft Sync):** Le allocazioni di distribuzione calcolate sulla base provvisoria vengono salvate nella bozza di lavoro dell'utente (draft state). Questo comportamento riflette fedelmente il caso d'uso contabile in cui l'operatore imposta in via preliminare la distribuzione delle risorse stabili verificate mentre l'istruttoria del fondo è ancora in corso.
- **Valutazione del Debito di Workflow:** La possibilità di persistere allocazioni quando il fondo è ancora non costituito è un aspetto di readiness e workflow governato da Cabina di Regia (`FUNC-02`). Essa **non** altera l'autorità economica né trasforma $3.400,00\ \text{€}$ in un fondo definitivamente costituito.

**Verdetto Red-Team:**
- `VERIFIED_DRAFT_MUTATION_SEMANTICS = DRAFT_ONLY`
- `FUNC02_DRAFT_PERSISTENCE_DEBT = CONFIRMED`

---

## 8. CLOSED Fixture Review

Nel file di test `src/pages/__tests__/DistribuzioneRisorsePage.closed.test.tsx`, la modifica apportata consta unicamente nell'aggiunta della proprietà canonica al mock dello state:
```typescript
canonicalFund: {
  status: 'VALID',
  total: 100000,
  verifiedTotal: 100000,
},
```

### Ispezione di Integrità del Test
1. **Nessuna Rimozione di Assertion:** Tutte le verifiche sull'interfaccia bloccata in stato `CLOSED` sono preservate al 100%.
2. **Nessun Indebolimento di Contratto:** Il test continua a verificare con successo che quando `isClosed = true`, gli input di testo, le checkbox, i selettori e i pulsanti di salvataggio/riparto risultano disabilitati (`disabled = true`).
3. **Conferma di Legittimità:** L'aggiunta della fixture canonica è l'adeguamento minimo necessario per consentire al test di girare a fronte della rimozione della sorgente legacy.

**Classificazione:** `CLOSED_FIXTURE_CHANGE = LEGITIMATE_CANONICAL_FIXTURE_ONLY`.

---

## 9. A/2025 Cross-Consumer Reconciliation

È stata eseguita la simulazione end-to-end dello scenario A/2025 su tutti i consumer attivi del sistema:

| Consumer | Modulo / Componente Sorgente | Verified Subtotal | Authoritative Total | Esito Quadratura |
| :--- | :--- | :---: | :---: | :---: |
| **Canonical Ledger** | `calculateCanonicalFundLedger` | $3.400,00\ \text{€}$ | `null` | **CONCORDE** |
| **Fondo Personale** | `FondoPage.tsx` | $3.400,00\ \text{€}$ | `null` / Non determinato | **CONCORDE** |
| **Cabina di Regia** | `CabinaRegiaPage.tsx` | $3.400,00\ \text{€}$ | `null` / Non determinato | **CONCORDE** |
| **Read Model** | `FadReportReadModel` (`projectFadReport`) | $3.400,00\ \text{€}$ | `null` | **CONCORDE** |
| **XLS FAD** | `xlsReportService.ts` | $3.400,00\ \text{€}$ | `"NON DETERMINATO"` | **CONCORDE** |
| **PDF Summary** | `pdfReportService.ts` | $3.400,00\ \text{€}$ | `"NON DETERMINATO"` | **CONCORDE** |
| **Distribuzione** | `DistribuzioneRisorsePage.tsx` | $3.400,00\ \text{€}$ (`VERIFIED_DRAFT`) | `null` (`"Non determinato"`) | **CONCORDE** |

Nessun consumer presenta $3.400,00\ \text{€}$ come totale autoritativo definitivo.

**Classificazione:** `CALC02_CROSS_CONSUMER_RECONCILIATION = PASS`.

---

## 10. Manual + Imported Resources Probe (Probe 19)

Per ottemperare alla clausola esplicita dell'acceptance originaria (*"risorse importate e manuali"*), è stato eseguito un test dedicato (Probe 19) comprendente:
- **Risorsa Trasferita / Importata:** Fondo anno precedente trasferito / importato via feed canonico = $+2.899,00\ \text{€}$;
- **Risorsa Manuale Valida:** Incremento stabile per contrattazione decentrata (Art. 67 c. 3) inserito manualmente = $+1.200,00\ \text{€}$;
- **Decurtazione Normativa:** Decurtazione Art. 60 c. 2 = $-126,44\ \text{€}$.

### Risultati della Riconciliazione Cross-Consumer
- **Totale Netto Calcolato:** $2.899,00 + 1.200,00 - 126,44 = 3.972,56\ \text{€}$;
- **Canonical Ledger:** `total = 3972.56`, `status = 'VALID'`;
- **FadReportReadModel:** `authoritativeTotal = 3972.56`, `verifiedTotal = 3972.56`;
- **Distribuzione (`resolveDistributionFundBudget`):** `authoritativeFundTotal = 3972.56`, `basis.mode = 'AUTHORITATIVE'`;
- **XLS FAD:** Cella totale riporta `3972.56`;
- **PDF Summary:** Box totale in copertina riporta `3.972,56 €`.

**Classificazione:** `CALC02_MANUAL_IMPORTED = PASS`.

---

## 11. Negative / Rounding Probe (Probes 20 & 21)

### Probe 20: Decurtazione Negativa ed Explicit Zero
- Componente positiva: $+1.500,00\ \text{€}$;
- Decurtazione: $-1.500,00\ \text{€}$;
- Totale canonico: $0,00\ \text{€}$ (`status = 'VALID'`).
- **Verifica:** Il resolver assegna `authoritativeFundTotal = 0` e `basis.mode = 'AUTHORITATIVE'`. Nessun fallback a valori legacy. Se l'utente alloca risorse per $500,00\ \text{€}$, il residuo calcolato è esattamente $-500,00\ \text{€}$ (disavanzo economico coerente).

### Probe 21: Precisione al Centesimo ed Assenza di Float Drift
- Importi con frazioni centesimali complesse: $+1.333,33\ \text{€}$, $+2.666,67\ \text{€}$, $+12,34\ \text{€}$, deduzione $-12,34\ \text{€}$;
- Totale canonico: $4.000,00\ \text{€}$;
- Allocazioni frazionarie testate in Distribuzione: quota A $= 1.333,33\ \text{€}$, quota B $= 2.666,67\ \text{€}$;
- **Residuo risultante:** esattamente $0,00\ \text{€}$ privo di scarti tipo `0.0000000000001` o $-0.01$.

**Classificazione:** `CALC02_NEGATIVE_ROUNDING = PASS`.

---

## 12. Active Export Inventory

L'inventario completo degli export attivi del Fondo Dipendenti conferma l'assoluta convergenza canonica:
1. **XLS FAD (`xlsReportService.ts`):** Migrato interamente al read model canonico (`CANONICAL_FAD_XLSX`);
2. **PDF Summary (`pdfReportService.ts`):** Migrato interamente a `ReportViewModel.fadCanonical` (`CANONICAL_FUND_SUMMARY_PDF`);
3. **Tabella 15 Conto Annuale:** Consuma la proiezione documentale canonica;
4. **Determina di Costituzione del Fondo:** Consuma la proiezione documentale canonica;
5. **Relazione Tecnico-Finanziaria:** Consuma la proiezione documentale canonica;
6. **Prospetto Riassuntivo di Calcolo:** Consuma la proiezione documentale canonica.

Nessun export attivo del Fondo Dipendenti fa più affidamento sulle sezioni o sui totali legacy. Eventuali funzioni di utility legacy residue nel repository costituiscono unicamente dead code non referenziato (da bonificare nell'ambito di `ARCH-01`).

**Classificazione:** `ACTIVE_FAD_EXPORTS = ALL_CANONICAL`.

---

## 13. NORM-01 Regression Check

È stata verificata l'integrità del comportamento contabile dell'Art. 60 su tutte le annualità supportate:
- **2025:** Decurtazione $= 0,00\ \text{€}$ (nessuna riduzione applicata retroattivamente);
- **2026:** Decurtazione $= -127,44\ \text{€}$ applicata una e una sola volta come componente di riduzione stabile;
- **2027:** Decurtazione esplicitamente consolidata ($390,00\ \text{€}$) conservata senza ricalcolo della platea 2027.

Tutti i test di regressione di `NORM-01` risultano verdi.

**Classificazione:** `NORM_01_REGRESSION = NONE` / `NORM_01_FINAL_STATUS = VERIFIED_FIXED`.

---

## 14. Test Harness Review

### Suite Eseguite e Verificate
1. `src/logic/distribution/__tests__/distributionCanonicalBudget.test.ts`: **14/14 PASS**
   - Verifica unitaria approfondita di tutti gli stati: VALID, EXPLICIT_ZERO, UNDETERMINED, INVALID, MISSING;
   - Verifica di indipendenza dal summary legacy con poison values ($99.999$, $8.888$, ecc.);
   - Verifica della qualificazione dei residui.
2. `src/pages/__tests__/DistribuzioneRisorsePage.canonicalBudget.test.tsx`: **7/7 PASS**
   - Rendering React reale del componente di pagina;
   - Spionaggio dei dispatch Redux/state reali;
   - Verifica semantica dei banner e delle diciture di bozza;
   - Verifica dell'invarianza delle allocazioni in caso di fondo MISSING.
3. `src/pages/__tests__/DistribuzioneRisorsePage.closed.test.tsx`: **1/1 PASS**
   - Verifica che lo stato CLOSED continui a inibire qualsiasi modifica.
4. `calc02Probes.test.ts` (Probe di Audit Indipendente): **3/3 PASS**
   - Verifica della quadratura cross-consumer su risorse manuali, importate, decurtazioni e arrotondamenti.

**Valutazione Harness:** Le suite testano i componenti di produzione reali, evitano logiche duplicate e coprono rigorosamente i casi limite.

**Classificazione:** `TEST_HARNESS_REVIEW = PASS_HIGH_CONFIDENCE`.

---

## 15. Network Forensics

Durante l'intera sessione di verifica e riesecuzione dei test in ambiente controllato con guardie offline:
- **`PRODUCT_NETWORK_ATTEMPTS`:** `0` (nessuna richiesta HTTP/HTTPS generata dal codice applicativo);
- **`TOOLING_NETWORK_ATTEMPTS`:** `0` (nessun tentativo da parte di test runner o bundler);
- **`REAL_NETWORK_CONNECTION_ESTABLISHED`:** `NO`;
- **Ambiente Staging (`mcasgpaivyosaroxrodm`):** NON contattato;
- **Ambiente Produzione (`yggokplxleredipknfbq`):** NON contattato.

---

## 16. Scope Integrity

I file produttivi modificati nello slice risultano rigorosamente circoscritti a:
1. `src/pages/DistribuzioneRisorsePage.tsx`
2. `src/logic/distribution/resolveDistributionFundBudget.ts`

Tutti gli altri moduli critici sono rimasti perfettamente intatti e conformi alla baseline:
- Cabina di Regia (`CabinaRegiaPage.tsx`): **INVARIATA**;
- Fondo Personale (`FondoPage.tsx`): **INVARIATO**;
- Motore di Calcolo Canonico (`canonicalFundLedger.ts`): **INVARIATO**;
- Read Model e Presenter Documentali: **INVARIATI**;
- Edge Functions Auth (`create-user`, `update-password`, `delete-user`): **INVARIATE**;
- Migrazioni Database: **INVARIATE**.

**Classificazione:** `SCOPE_INTEGRITY = PRESERVED`.

---

## 17. CALC-02 Final Closure Decision

La valutazione puntuale dei 14 criteri di ammissibilità previsti al Punto 28 dell'incarico produce il seguente esito:

1. Legacy summary non è authority economica: **VERIFICATO**;
2. Canonical valid total governa la Distribuzione: **VERIFICATO**;
3. Canonical zero resta rigorosamente zero: **VERIFICATO**;
4. Missing non viene convertito in zero arbitrario: **VERIFICATO**;
5. UNDETERMINED non diventa budget definitivo: **VERIFICATO**;
6. Verified subtotal resta qualificato unicamente come draft: **VERIFICATO**;
7. I residui da allocare conservano il proprio mode e qualificazione: **VERIFICATO**;
8. Scenario A/2025 riconciliato su tutti i 7 consumer: **VERIFICATO**;
9. Risorse manuali e importate riconciliate al centesimo: **VERIFICATO**;
10. Casi di decurtazione negativa e arrotondamento riconciliati al centesimo: **VERIFICATO**;
11. Tutti gli export FAD attivi sono canonicamente allineati: **VERIFICATO**;
12. La fixture CLOSED non presenta indebolimenti di sicurezza: **VERIFICATO**;
13. Test harness solido, realistico e ad alta confidenza: **VERIFICATO**;
14. Scope dello slice rigorosamente preservato: **VERIFICATO**.

**Decisione di Chiusura:**
$$\mathbf{CALC\_02\_FINAL\_STATUS = VERIFIED\_FIXED}$$

---

## 18. Remaining ASTRA Risk & Findings Reclassification

Con la definitiva chiusura di `CALC-02`, la matrice dei finding ASTRA si riclassifica come segue:

| ID Finding | Severità Iniziale | Descrizione Sintetica | Stato Corrente | Note di Chiusura / Rischio Residuo |
| :--- | :---: | :--- | :---: | :--- |
| **`CALC-02`** | **BLOCKER** | Disallineamento cross-consumer tra Cabina, Personale, Distribuzione ed Export | **`VERIFIED_FIXED`** | **CHIUSO**. Un'unica autorità economica governa l'intero applicativo. |
| **`NORM-01`** | **BLOCKER** | Duplicazione Art. 60 e normalizzazione della pipeline di calcolo | **`VERIFIED_FIXED`** | **CHIUSO**. Proiezione unificata e gestione consolidamento 2027 accertate. |
| **`FUNC-02`** | HIGH | Logiche di workflow, prontezza di chiusura e coerenza draft Cabina/Distribuzione | **`PARTIALLY_FIXED`** | Residuo di workflow non bloccante per il calcolo economico. |
| **`DOC-02`** | MEDIUM | Pulizia e bonifica dei template documentali non-FAD | **`PARTIALLY_FIXED`** | Residuo documentale secondario. |
| **`NORM-02`** | MEDIUM | Validazioni secondarie dei limiti di legge | **`PARTIALLY_FIXED`** | Residuo normativo secondario. |
| **`ARCH-01`** | MEDIUM | Deprecazione e rimozione dead code del motore legacy | **`PARTIALLY_FIXED`** | Bonifica tecnica non bloccante. |

$$\mathbf{ASTRA\_BLOCKERS\_OPEN = 0}$$

---

## 19. Next Gate Recommendation

Avendo azzerato tutti i blocker economici e architetturali di ASTRA (`ASTRA_BLOCKERS_OPEN = 0`), la priorità evolutiva si sposta sulla regolazione del workflow applicativo:

**Raccomandazione Prossimo Gate:**
$$\mathbf{CABINA\_BLOCKING\_ISSUE\_PRIORITY}$$
(Consolidamento dei criteri di prontezza e blocco avanzamento della Cabina di Regia nell'ambito della progressiva chiusura di `FUNC-02`).

---
