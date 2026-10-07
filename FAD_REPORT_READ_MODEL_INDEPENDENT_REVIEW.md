# FAD_REPORT_READ_MODEL — Independent Architecture & Accounting Review

**Review Date:** 2026-10-04\
**Reviewer:** Principal Software Architect & Regulated Financial Systems Auditor\
**Slice Evaluated:** `FAD_REPORT_READ_MODEL`\
**Repository:** `dinopusceddu/entilocaliapp`\
**Branch:** `ux/toolbox-area-fondo-prototype`\
**HEAD:** `d3170f959b5815c514dbf3d6e5f93366a5f14c67`\
**Result:** **PASS — FAD_REPORT_READ_MODEL_INDEPENDENT_REVIEW = COMPLETE**

---

## 1. Executive Verdict

L'audit indipendente di architettura software e quadratura contabile per lo slice `FAD_REPORT_READ_MODEL` emette verdetto **PASS**.

Lo slice costituisce il tassello architetturale abilitante per la futura risoluzione definitiva dei blocker ASTRA `CALC-02` (uniformità del motore di calcolo del Fondo Risorse Decentrate) e `NORM-01` (normalizzazione della pipeline di proiezione documentale).

L'implementazione introduce `projectFadReport` e il tipo `FadReportReadModel` in `src/domain/documentProjection.ts`, agganciandoli al presenter principale tramite `createReportViewModel.fadCanonical` in `src/presenters/reportPresenter.ts`.

Punti cardine accertati:
1. **Purity di Proiezione:** la funzione `projectFadReport` è una proiezione pura e deterministica che legge unicamente `CanonicalFundResult`. Non contiene logiche di business concorrenti, ricalcoli normativi (0,14%, 0,22%, Art. 60, Art. 23, DL 25, PNRR) né fallback verso strutture legacy.
2. **Equivalenza Contabile dei Segni (`signedAmount`):** la derivazione del segno replica fedelmente la semantica contabile del ledger canonico (`FinancialMath.multiplyExact(Math.abs(amount), -1)` per le deduzioni, positivo per le addizioni, `null` per le voci non determinate), prevenendo doppi conteggi o sommatorie indebite di poste provvisorie.
3. **Totale Autoritativo Rigorosamente Nullable:** `authoritativeTotal` riflette `canonical.total` se e solo se lo stato globale è `VALID`. In presenza di stati `INVALID` o `UNDETERMINED`, `authoritativeTotal` è forzatamente `null`, impedendo a qualsiasi consumer a valle di promuovere un subtotale parziale a fondo legalmente costituito.
4. **Isolamento e Retrocompatibilità:** i writer attivi (PDF `pdfReportService.ts` e XLS `xlsReportService.ts`) e l'interfaccia `ReportsPage.tsx` non sono stati modificati e continuano a operare sul canale legacy invariato. Nessun golden test storico è stato alterato.
5. **Classificazione Finding:** `CALC-02` e `NORM-01` rimangono correttamente classificati come **`PARTIALLY_FIXED`**, poiché il read model è un prerequisito contrattuale e i writer non sono ancora stati migrati.

---

## 2. Canonical Graph Verification

È stato verificato il grafo delle dipendenze dati introdotto dallo slice:

```text
CanonicalFundResult (Unica Autorità Economica)
       │
       ▼
projectFadReport(canonical)
       │
       ▼
FadReportReadModel (Read Model Immutabile)
       │
       ▼
createReportViewModel.fadCanonical (Esposizione nel Presenter)
       │
       ▼
[Futuri Writer Documentali Canonici: XLSX / PDF]
```

È accertato che il nuovo ramo di proiezione:
- **NON** invoca né importa `calculateFadTotals`;
- **NON** legge le sezioni legacy `fondi.dipendente.constitution.sections`;
- **NON** dipende dai totali parziali legacy `section.total`;
- **NON** consulta i summary legacy o `FundData` grezzi;
- **NON** fa affidamento su meccanismi di caching concorrenti;
- I writer attivi PDF (`generateFullSummaryPDF`) e XLS (`generateFADXLS`) restano agganciati alla precedente struttura legacy `fondoDipendenti.costituzione`. La migrazione dei writer avverrà nei successivi slice dedicati.

---

## 3. Projection Purity

La funzione `projectFadReport` in `src/domain/documentProjection.ts`:
- Riceve esclusivamente l'argomento `canonical: CanonicalFundResult | null | undefined`;
- Mappa le `canonical.entries` su `FadReportRow` senza alterare l'importo economico o l'operazione (`ADDITION` / `DEDUCTION`);
- Assegna le descrizioni tramite dizionario semantico esistente (`DESCRIPTIONS`) o etichetta di provenienza (`provenance.legacyField`), senza che la label condizioni mai il calcolo o la classificazione;
- Copia i campi di stato e subtotali verificati (`verifiedStableTotal`, `verifiedVariableTotal`, `verifiedTotal`, `warnings`, `missingPrerequisites`);
- **Nessuna formula economica nuova:** la proiezione non calcola percentuali su monte salari, non applica soglie o tetti, non verifica anni di competenza e non effettua ricalcoli. L'autorità delle regole economiche risiede al 100% nel `canonicalFundLedger`.

---

## 4. Signed Amount Semantics

La semantica di `signedAmount` è stata sottoposta a red-teaming contabile:

- **Regola di derivazione:**
  ```typescript
  const amount = entry.status === 'VALID' && entry.amount !== null
    ? FinancialMath.roundTo2DP(entry.amount)
    : null;
  signedAmount: amount === null ? null : entry.operation === 'DEDUCTION'
    ? FinancialMath.multiplyExact(Math.abs(amount), -1)
    : amount
  ```
- **Analisi dei casi limite:**
  1. `ADDITION` positiva: `signedAmount = +amount`.
  2. `DEDUCTION` positiva: `signedAmount = -Math.abs(amount)`.
  3. `DEDUCTION` con amount già negativo: `Math.abs(amount)` rimuove il segno negativo e viene moltiplicato per `-1`, scongiurando l'inversione di segno (`-- = +`).
  4. Zero esplicito (`amount = 0`): `signedAmount = 0`.
  5. Voci figurative / non economiche (`economicEffect: false`): escluse da `rows` (ma tracciate in `unresolvedItems` se non valide).
  6. Voci `MISSING`, `INVALID` o `UNDETERMINED` con importo provvisorio: `amount` è reso `null`, imponendo tassativamente `signedAmount = null`.
- **Valutazione:**
  La trasformazione è **perfettamente equivalente** alla funzione `signedAmount` interna al motore `canonicalFundLedger.ts:29-32`. Non esiste rischio di doppia sottrazione o alterazione algebrica, purché i consumer sommino algebricamente `signedAmount` anziché sottrarlo.
- **Classificazione:** **`SIGNED_AMOUNT_SEMANTICS = CANONICAL_EQUIVALENT`**.

---

## 5. Nullable Total Semantics

Il contratto dei totali distingue rigidamente tra subtotali verificati e totale autoritativo:

```typescript
verifiedStableTotal: canonical?.verifiedStableTotal ?? null,
verifiedVariableTotal: canonical?.verifiedVariableTotal ?? null,
verifiedTotal: canonical?.verifiedTotal ?? null,
authoritativeTotal: canonical?.status === 'VALID' ? canonical.total : null,
```

- Se `canonical` è assente (`null` o `undefined`), tutti i totali sono `null` e lo stato è `UNDETERMINED`.
- Se lo stato canonico è `INVALID` o `UNDETERMINED`:
  - `authoritativeTotal` è **`null`**, anche se nel risultato canonico è presente un valore numerico in `canonical.total` o `verifiedTotal`;
  - `verifiedTotal` (somma delle sole righe valide determinate) resta esposto separatamente come dato informativo verificato, impedendone la promozione indebita a totale autoritativo del fondo.
- Nel caso patologico `status === 'VALID'` con `canonical.total === null`, `authoritativeTotal` resta coerentemente `null`.

---

## 6. Unresolved Model

La separazione tra voci economiche e voci non risolte è strutturata come segue:
- `rows`: contiene tutte e sole le voci con `economicEffect !== false`. Include le righe determinate, le righe a zero e le righe economiche pendenti (queste ultime con `signedAmount: null`).
- `unresolvedItems`: filtra tutte le entries con `entry.status !== 'VALID' || entry.amount === null`, comprese le voci a effetto figurativo (`economicEffect: false`, es. verifiche di limite o tetti).

Le voci economiche non risolte sono presenti in entrambe le collezioni con finalità distinte:
- in `rows` per fornire la struttura completa delle voci del prospetto (senza contribuire alla somma algebrica, avendo `signedAmount = null`);
- in `unresolvedItems` per consentire ai writer di esporre il riepilogo delle criticità e dei motivi di blocco (`reason`, `missingPrerequisites`).
- **Classificazione:** **`UNRESOLVED_MODEL = CLEAR`**.

---

## 7. Art. 60 Review (2025 vs 2026)

- **Scenario 2025 (Transitorio):**
  Nel calcolo legacy `st_art60c2_CCNL2026_decurtazioneIndennitaComparto` presenta valore grezzo 127,44. Nel ledger canonico l'impatto economico per il 2025 è nullo (`amount = 0`, `signedAmount = 0`, `status = 'VALID'`). Il read model proietta fedelmente `signedAmount = 0` ed esclude qualsiasi trattenuta di 127,44.
- **Scenario 2026 (A Regime):**
  L'Art. 60 è consolidato come deduzione determinata di 127,44: la riga economica riceve `signedAmount = -127.44` esattamente una volta. La contropartita figurativa `ART60_ART23_FIGURATIVE` (`economicEffect: false`) viene esclusa da `rows`.
- **Purity della Proiezione:** il read model non contiene clausole condizionali sull'anno (`annoRiferimento === 2025`); la proiezione riflette in modo agnostico le decisioni già deliberate nel ledger canonico.

---

## 8. Recovery 0,14% Review

Caso analizzato: recupero arretrati 2024–2025 per 2.800,00 € privo di istruttoria disaggregata per anno di origine.
- Nel `FadReportReadModel`:
  - `status = 'UNDETERMINED'`;
  - `amount = 2800` (valore informativo preservato);
  - `signedAmount = null` (non sommabile);
  - `authoritativeTotal = null`;
  - `verifiedVariableTotal = 0` (l'importo non istruito non entra nel subtotale verificato);
  - `reason = "Aggregato legacy privo di istruttoria distinta per annualità di origine."` preservata da `provenance`.
- È garantito che nessun writer futuro potrà includere i 2.800,00 € nella sommatoria algebrica del fondo finché l'istruttoria non sarà formalmente validata.

---

## 9. A/2025 Characterization

La riconciliazione contabile sullo scenario cardine **Comune Astra 2025 (Scenario A)** conferma:

| Elemento di Calcolo | Sezioni Legacy Attive | Nuovo Read Model (`fadCanonical`) | Stato Contabile |
|---|---|---|:---:|
| Straordinario consolidato | 2.000,00 € | 2.000,00 € (`signedAmount = 2000`) | Conforme |
| Incremento 0,14% corrente | 1.400,00 € | 1.400,00 € (`signedAmount = 1400`) | Conforme |
| Decurtazione Art. 60 | 127,44 € (attivo nel dettaglio) | 0,00 € (`signedAmount = 0`) | Rettificato |
| **Totale Parte Stabile** | **2.000,00 €** (`section.total` errato) | **3.400,00 €** (`verifiedStableTotal`) | **Quadratura OK** |
| Arretrati 0,14% (Recovery) | 2.800,00 € (nella parte variabile) | 2.800,00 € (`signedAmount = null`) | Trattenuto |
| **Totale Parte Variabile** | Sezioni non autoritative | **0,00 €** (`verifiedVariableTotal`) | **Quadratura OK** |
| **Totale Complessivo Fondo** | 4.800,00 € / 6.072,56 € (incongruente) | **`null`** (`authoritativeTotal`) | **Bloccato Fail-Closed** |
| Subtotale Verificato | Non presente | 3.400,00 € (`verifiedTotal`) | Conforme |

---

## 10. Reconciliation Invariants & Precision

1. **Invariante di Sommatoria Algebrica:**
   Per ogni risultato canonico determinato, i test verificano con successo che:
   $$\sum \text{rows}_{\text{STABLE}}(\text{signedAmount}) = \text{verifiedStableTotal}$$
   $$\sum \text{rows}_{\text{VARIABLE}}(\text{signedAmount}) = \text{verifiedVariableTotal}$$
   $$\sum \text{all rows}(\text{signedAmount}) = \text{verifiedTotal}$$
   $$\text{status} = \text{VALID} \implies \text{authoritativeTotal} = \text{canonical.total}$$
2. **Precisione Monetaria:**
   L'arrotondamento è vincolato a `FinancialMath.roundTo2DP` e la negazione usa `FinancialMath.multiplyExact`. I test con frazioni millesimali e mezzi centesimi (es. $0{,}335 + 0{,}335 + 0{,}335 - 0{,}005 - 0{,}005$) quadrano all'importo esatto di $1{,}00$ senza errori di approssimazione virgola mobile di Javascript.
3. **Precedenza dello Zero Esplicito:**
   Nei test di divergenza (T2 e T10), il valore canonico `0` prevale tassativamente su alias legacy (es. 900) o totali legacy discordanti (es. 777.777), confermando `EXPLICIT_ZERO_PRECEDENCE = PASS`.

---

## 11. Cross-View Consistency & Presenter Integration

- Il read model `FadReportReadModel` produce esattamente i medesimi valori consumati dalla UI `CabinaDiRegia` (`resolveCabinaViewModel`):
  - `status === cabina.constitution.canonicalStatus`
  - `verifiedTotal === cabina.constitution.verifiedSubtotal`
  - `authoritativeTotal === cabina.constitution.total`
- L'integrazione nel presenter `createReportViewModel` aggiunge la sola proprietà root `fadCanonical`, senza toccare i campi legacy sottostanti. I componenti esistenti continuano a operare senza regressioni.

---

## 12. Test Harness Review

La suite `src/domain/__tests__/fadReportReadModel.test.ts` conta 17 test mirati, tutti superati in 23ms:
- Esegue il codice di produzione reale senza duplicare l'algoritmo nel test;
- Copre tutti i casi cardine: riconciliazione ordinaria, zero esplicito, Scenario A/2025, Art. 60 2026 e figurativi, recovery non risolto, deduzioni stabili e variabili, frazioni a mezzo centesimo, input assente/nullo, status `INVALID`, divergenza legacy/canonico (T10), input immutabile (`Object.freeze`), e coerenza cross-view con Cabina di Regia.
- **Classificazione:** **`TEST_HARNESS_REVIEW = PASS_HIGH_CONFIDENCE`**.

---

## 13. Scope Integrity

Verifica delle modifiche e preservazione dei file protetti:
- **File produttivi modificati:**
  1. `src/domain/documentProjection.ts` (+59 righe, -1 riga: aggiunta interfaccia e funzione di proiezione pura).
  2. `src/presenters/reportPresenter.ts` (+3 righe: typing e assegnazione campo `fadCanonical`).
- **File di test aggiunti:** `src/domain/__tests__/fadReportReadModel.test.ts` (+289 righe).
- **Integrità SHA-256 dei file protetti (identità al 100%):**
  - `src/domain/canonicalFundLedger.ts`: `2585F4038D62D1787D9F981D8CC68DF45C6BCE35F4946436FDB74139ABA07F9B`
  - `src/logic/calculation/canonicalFundLedger.ts`: `44E7E20D8D2F062FE3688AF841AD4BCB2B225093C97B3880BC7FFE3D83D639EB`
  - `src/logic/calculation/fundEngine.ts`: `6AC723E7343E1AC6A448464AD761488E6DCB9D7F6491AB2729F8316FD9A83C27`
  - `src/services/documents/pdfReportService.ts`: `86CFDA0A5DDBF5E01F548660660A94242F25AD04820A43647B615DF181C5A6F2`
  - `src/services/documents/xlsReportService.ts`: `E74FA20CF00AB102F46C1EC1635BFA19FEC08F3CDA9775B789DBE95836A56B48`
  - `src/pages/ReportsPage.tsx`: `45B2F80A843419037538AC7E85711B06D477EEAC0B1BBDABA634BAE523F3C29A`
  - `src/logic/calculation/tabella15Mapper.ts`: `390C99EAB60AA0952D33EF6358459793FCF3E6DFF2ADE40B870DBA736D6F0F6A`
  - Flotta Auth (`create-user`, `update-password`, `delete-user`, test relativi): invariata al 100%.

---

## 14. Quality Gates Summary

| Quality Gate | Comando Eseguito | Esito | Note |
|---|---|:---:|---|
| Read Model Dedicated Suite | `npx vitest run src/domain/__tests__/fadReportReadModel.test.ts` | **PASS** | 17/17 superati |
| Canonical Ledger Contract | `npx vitest run canonicalFundLedger.contract.test.ts` | **PASS** | 13/13 superati |
| Auth Suite Regression | `npx vitest run createUser updatePassword deleteUser` | **PASS** | 95/95 superati |
| Regression Engine Suite | `npx vite-node scripts/run_regression_tests.ts` | **PASS** | 8/8 casi consolidati OK |
| Wave 2 Oracle Suite | `npx vite-node scripts/run_wave2_oracle.ts` | **PASS** | 14/14 oracoli OK |
| TypeScript Compiler Check | `npx tsc --noEmit` | **PASS** | Exit code 0, 0 errori |
| Git Whitespace Formatting | `git diff --check` | **PASS** | Exit code 0 |

---

## 15. Residual Findings & Next-Gate Recommendation

- **Stato Finding:**
  - `CALC-02`: **`PARTIALLY_FIXED`** (motore canonico integrato nel read model; writer attivi ancora su sezioni legacy).
  - `NORM-01`: **`PARTIALLY_FIXED`** (read model unificato disponibile; writer documentali non ancora commutati).
  - `AUTH_ADMIN_01` / `02A` / `02B`: **`CLOSED_LOCALLY / REVIEW_PASS`**.
  - `AUTH_PROFILE_ROLE_PENDING_GATE`: **`APPLY_PENDING / LIVE_FIX_NOT_VERIFIED`**.
- **Raccomandazione Operativa:**
  Si raccomanda l'approvazione formale dello slice `FAD_REPORT_READ_MODEL`.
  Il passo logico successivo della roadmap di bonifica è la migrazione del primo consumer documentale isolato:
  $$\mathbf{CANONICAL\_FAD\_XLSX}$$
  (migrazione dell'esportazione Excel del Fondo Accessorio Dipendente per consumare esclusivamente `ReportViewModel.fadCanonical`).
