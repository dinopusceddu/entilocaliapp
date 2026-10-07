# PNRR_ZERO_AND_MISSING_CAP — INDEPENDENT REVIEW REPORT
## CALC-05 — Independent Verification of the Annual Optional Faculty ex Art. 8, commi 3–4, D.L. 13/2023

**Document Under Review:** `PNRR_ZERO_AND_MISSING_CAP_IMPLEMENTATION_REPORT.md` & `PNRR_ZERO_AND_MISSING_CAP_REMEDIATION_REPORT.md`\
**Slice Evaluated:** `PNRR_ZERO_AND_MISSING_CAP`\
**Target Finding:** `CALC-05` (Severità originale: `HIGH`)\
**Review Date:** 5 Ottobre 2026\
**Auditor / Reviewer:** Principal Software Architect, Domain-Model Auditor & Independent Reviewer\
**Repository:** `dinopusceddu/entilocaliapp`\
**Branch:** `ux/toolbox-area-fondo-prototype`\
**HEAD:** `d3170f959b5815c514dbf3d6e5f93366a5f14c67`\
**Baseline Mode:** CURRENT WORKING TREE (Strict Read-Only)\
**Overall Verdict:** **PASS — CALC_05 = VERIFIED_FIXED**

---

## Executive verdict

L'audit indipendente condotto sullo slice `PNRR_ZERO_AND_MISSING_CAP` e sui relativi report di implementazione e remediation emette verdetto formale **PASS**.

Il finding `CALC-05` (originariamente classificato come `HIGH` / `OPEN`) viene formalmente certificato come **`VERIFIED_FIXED`**.

### Determinazioni Fondamentali:
1. **Contratto di Facoltà Attuato Integralmente:** Il dominio modella ora in modo rigoroso e disaccoppiato la catena logica:
   $$\text{Decisione di Esercizio} \longrightarrow \text{Ammissibilità (Virtuosità A/B/C/D)} \longrightarrow \text{Massimo Teorico (5\% Base Stabile 2016)} \longrightarrow \text{Importo Scelto dall'Ente} \longrightarrow \text{Contributo Validato}$$
   È formalmente garantita la separazione strutturale tra il tetto massimo potenziale e l'importo effettivamente applicato ($\text{maximumAvailable} \ne \text{amountApplied}$).
2. **Eliminazione del Bypass Upstream:** Il confronto permissivo `maxPnrr > 0` con tolleranza di un centesimo è stato integralmente sradicato da `fundEngine.ts`. Nel ledger canonico (`canonicalFundLedger.ts`), la risorsa PNRR è esclusa dal loop generico delle voci FAD ed è vincolata all'entry semantica `PNRR_APPLIED`, la quale riceve esclusivamente il contributo validato. Nessun valore numerico positivo privo di istruttoria può più assumere stato `VALID` o incrementare il Fondo.
3. **Piena Salvaguardia dell'Opzionalità (`NOT_EXERCISED`):** L'opzione esplicita di rinuncia alla facoltà (`NOT_EXERCISED`) produce un contributo nullo ($0,00\ \text{€}$), non richiede alcuna prova di ammissibilità o base storica e non emette alcun blocco o prerequisito mancante, consentendo al Fondo di raggiungere lo stato `VALID` in presenza di piena regolarità delle restanti voci.
4. **Distinzione Semantica tra Zero e Missing:** Uno zero noto nella base 2016 vincola il massimo a zero e rigetta qualsiasi incremento positivo come `INVALID`; una base assente (`undefined`) genera uno stato `UNDETERMINED` se l'ente tenta di esercitare la facoltà, senza ricadere in falsi valori numerici predefiniti o fallback impliciti.
5. **Riconciliazione Legittima del Test Storico:** L'aggiornamento effettuato in `src/logic/__tests__/mod025ComplianceProspetto.test.ts` consiste nell'inserimento di sole 7 righe di dati istruttori validi, preservando al 100% tutte le asserzioni e i totali economici congelati ($10.700\ \text{€}$ escluse, $77.700\ \text{€}$ subtotal verificato, $121.000\ \text{€}$ rilevanti Art. 23).
6. **Integrità Binaria e Isolamento del Generatore:** Tutti i 6 artefatti storici binari (PDF/XLSX) in `evidence_wave3_hardening/` corrispondono esattamente ai rispettivi hash SHA-256 PRE (`6_OF_6_EXACT`). Il test suite di prodotto (126 file, 1.645 test) è al 100% verde con isolamento deliberato dei 7 casi del generatore di evidenze.
7. **Aggiornamento Ufficiale Matrice ASTRA:** Con la chiusura certificata di `CALC-05`, la fotografia ASTRA passa ufficialmente a:
   $$\mathbf{VERIFIED\_FIXED = 10 \quad | \quad PARTIALLY\_FIXED = 8 \quad | \quad OPEN = 7 \quad | \quad ASTRA\_BLOCKERS\_OPEN = 0}$$

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
SCOPE_INTEGRITY = PASS
~~~

---

## Original CALC-05 acceptance

Il finding originale `CALC-05` censiva:
> *"La capienza PNRR zero o mancante non impedisce importi positivi nel fondo; l'ammissibilità dell'incremento non è governata da una sorgente autorevole univoca."*

Lo scenario di violazione congelato registrava:
- `cap PNRR = 0` + `incremento = 100` $\longrightarrow$ Actual errato: `VALID`, totale $= 100\ \text{€}$, nessun errore PNRR.
- `cap PNRR missing` + `incremento = 100` $\longrightarrow$ Actual errato: `VALID`, totale $= 100\ \text{€}$, nessun errore PNRR.

L'acceptance originaria impone che:
1. Con cap zero noto, qualsiasi richiesta positiva deve risultare non utilizzabile (`INVALID` / bloccante);
2. Con cap non determinato/mancante, la richiesta positiva deve rimanere `UNDETERMINED` e non confluire nel totale autoritativo;
3. La scelta di non esercitare la facoltà non deve rendere il fondo `UNDETERMINED` in assenza di dati PNRR.

Tutti e tre i requisiti risultano **pienamente soddisfatti ed attestati** dal nuovo motore di calcolo.

---

## Normative faculty model

L'implementazione in `src/logic/shared/pnrrFaculty.ts` rispetta fedelmente il disposto dell'art. 8, commi 3 e 4, del D.L. n. 13/2023 (convertito con modificazioni dalla L. n. 41/2023).

La facoltà è stata modellata attraverso una pipeline pura deterministica:
```typescript
export function resolvePnrrFaculty(input: PnrrFacultyInput): PnrrFacultyResult
```
Tale funzione opera come **unica autorità di dominio condivisa** (`PNRR_DOMAIN_AUTHORITY = SINGLE_SHARED`), consumata simultaneamente dal Wizard, da `fundEngine` e dal ledger canonico.

Non vi è alcun automatismo allocativo: l'esistenza di una capienza teorica non determina l'attribuzione della risorsa. L'ammontare applicato deve scaturire da una determinazione esplicita dell'ente entro il limite del massimo teorico calcolato.

---

## Period / previous-year semantics

La vigenza temporale della norma è rigidamente circoscritta all'intervallo **2023–2026**:
- **2022:** `NOT_APPLICABLE` (la norma non era ancora vigente);
- **2023:** `APPLICABLE_PERIOD`;
- **2024:** `APPLICABLE_PERIOD`;
- **2025:** `APPLICABLE_PERIOD`;
- **2026:** `APPLICABLE_PERIOD`;
- **2027:** `NOT_APPLICABLE` (la facoltà cessa il 31 dicembre 2026).

La regola di competenza per i requisiti A, B e D applica rigorosamente:
$$\text{previousYear} = Y - 1$$
Per l'annualità di riferimento $2026$, i requisiti di bilancio e di pagamento si riferiscono inderogabilmente al **$2025$** (`YEAR_2026_PREVIOUS_YEAR = 2025`).

---

## Exercise decision

La decisione amministrativa è formalmente tipizzata:
```typescript
export type PnrrExerciseDecision = 'NOT_EXERCISED' | 'EXERCISED' | 'UNSET';
```
- **`NOT_EXERCISED`:** Rappresenta la formale volontà dell'ente di non avvalersi della deroga PNRR. Annulla l'importo applicato (`amountApplied = 0`), azzera il contributo (`contribution = 0`), emette stato `VALID` e non richiede la sussistenza dei requisiti o della base 2016 (`OPTIONALITY_CONTRACT = PASS`).
- **`EXERCISED`:** Rappresenta la volontà di attivare la facoltà. Richiede la piena attestazione dell'ammissibilità, la presenza della base stabile certificata e l'indicazione dell'importo prescelto.
- **`UNSET`:** Indica assenza di istruttoria. Se l'importo applicato è nullo o assente, non vengono generati errori; se viene inserito un importo positivo a fronte di scelta `UNSET`, la risorsa viene sospesa con stato `UNDETERMINED` (`PNRR_EXERCISE_DECISION_UNSET`) e contributo pari a zero (`UNSET_CONTRACT = SAFE`).

---

## Eligibility

La verifica di virtuosità contabile valuta in modo congiunto i 4 requisiti di legge:
- **A:** Rispetto del saldo dell'equilibrio di bilancio nell'esercizio precedente ($Y-1$);
- **B:** Parametri di debito commerciale residuo e ritardo annuale dei pagamenti nell'esercizio precedente ($Y-1$);
- **C:** Incidenza del salario accessorio e incentivante sulla spesa del personale $\le 8\%$ risultante dall'ultimo rendiconto approvato;
- **D:** Approvazione del rendiconto dell'esercizio precedente ($Y-1$) da parte del Consiglio nei termini di legge.

La regola di dominanza applicata dal resolver è impeccabile:
$$\text{ANY\_FALSE} \Longrightarrow \mathbf{NOT\_ELIGIBLE} \quad (\text{prevale su stati unknown})$$
$$\text{NO\_FALSE} \land \text{ANY\_UNKNOWN} \Longrightarrow \mathbf{UNDETERMINED}$$
$$\text{ALL\_TRUE} \Longrightarrow \mathbf{ELIGIBLE}$$

---

## Requirement C

L'incidenza percentuale sul trattamento accessorio è disciplinata conformemente alla norma:
- Si riferisce espressamente all'**ultimo rendiconto approvato** e non all'anno $Y-1$ standard (`REQUIREMENT_C_TEMPORAL_MODEL = LATEST_APPROVED_STATEMENT`).
- Il dominio non inventa un anno artificioso in assenza di metadati formali sul rendiconto.
- Nel Wizard, l'etichetta di Step 7 è stata ripulita da qualsiasi menzione spuria ad anni fissi pregresse.

---

## Maximum theoretical amount

La base di computo è unicamente la **componente stabile del Fondo risorse decentrate certificata per l'anno 2016**:
$$\text{maximumAvailable} = \text{FinancialMath.roundTo2DP}(\text{stableCertifiedFund2016} \times 0.05)$$
- **Nessuna confusione con il limite Art. 23:** La base Art. 23 complessiva dell'ente non viene utilizzata come surrogato della componente stabile del Fondo dipendenti (`PNRR_MAXIMUM_BASE = CERTIFIED_STABLE_2016`).
- **Nessun auto-seeding:** L'effetto collaterale che popolava automaticamente la base PNRR con lo storico Art. 23 in `useWizard2026Draft.ts` è stato rimosso (`PNRR_BASE_AUTO_SEEDING = ABSENT`).
- **Precisione Centesimale:** Il calcolo è presidiato da `FinancialMath` con arrotondamento half-up al secondo decimale (`FINANCIAL_MATH = PRESERVED`).

---

## Applied amount

L'importo applicato (`amountApplied`) è una grandezza autonoma e distinta dal massimo teorico:
- Non vi è alcuna auto-applicazione automatica del tetto disponibile (`MAXIMUM_AUTO_APPLICATION = ABSENT`).
- È consentito l'utilizzo parziale della facoltà (es. base $400.000\ \text{€}$, massimo $20.000\ \text{€}$, importo applicato $7.500\ \text{€} \longrightarrow$ contributo $= 7.500\ \text{€}$).
- Un importo mancante non viene sostituito da zero o dal massimo: produce stato `UNDETERMINED` per mancata selezione dell'importo.
- Il confine numerico è esatto al centesimo (`CENT_BOUNDARY = STRICT_NO_TOLERANCE`): con tetto $5.000,00\ \text{€}$, valori fino a $5.000,00\ \text{€}$ sono ammessi; un valore pari a $5.000,01\ \text{€}$ viene rigettato senza tolleranze.

---

## Zero vs missing

Il sistema distingue matematicamente:
- **Base 2016 nota e pari a 0,00 €:** Genera $\text{maximumAvailable} = 0,00\ \text{€}$. Una richiesta di $0,00\ \text{€}$ è valida; una richiesta $> 0$ è `INVALID` (`PNRR_MAXIMUM_EXCEEDED`).
- **Base 2016 mancante (undefined/null):** Se `NOT_EXERCISED`, il contributo è $0,00\ \text{€}$ `VALID`. Se `EXERCISED` con importo $> 0$, l'esito è `UNDETERMINED` con causale `PNRR_STABLE_2016_MISSING`.

`ZERO_VS_MISSING = PRESERVED`.

---

## Canonical authority

Nel ledger canonico (`src/logic/calculation/canonicalFundLedger.ts`):
- Il campo `vn_dl13_art8c3_incrementoPNRR_max5stabile2016` è stato inserito in `SPECIAL_KEYS`, escludendolo tassativamente dal caricamento acritico delle risorse storiche FAD.
- L'entry `PNRR_APPLIED` è generata tramite `resolveAnnualPnrrFaculty`.
- Se lo stato è `VALID`, l'importo iscritto a bilancio corrisponde a `pnrr.contribution`.
- Se lo stato è `INVALID` o `UNDETERMINED`, l'importo è forzato a `null` (`amount: null`), garantendo che nessuna risorsa priva di copertura entri nel computo del Fondo.

`CANONICAL_PNRR_AUTHORITY = SEMANTIC_VALIDATED_ENTRY`.

---

## Raw numeric bypass red-team

È stato verificato il comportamento a fronte di iniezioni malevole:
- Avvelenando il campo grezzo FAD con $+100,00\ \text{€}$ in assenza di requisiti e delibera, il ledger assegna `UNDETERMINED` (o `INVALID` se cap=0), azzera il contributo e impedisce la formazione di un totale autoritativo.
- Avvelenando il campo legacy `annualData.calcolatoIncrementoPNRR3` con $999.999,00\ \text{€}$, il motore ignora completamente il valore, poiché non costituisce più autorità di calcolo (`LEGACY_CAP_AUTHORITY = NONE`).

`RAW_NUMERIC_BYPASS = ABSENT`.

---

## Verified subtotal

In presenza di una risorsa PNRR `UNDETERMINED` o `INVALID`:
- Le ordinarie risorse valide e stabili (es. $10.000,00\ \text{€}$) rimangono integre e sommate all'interno di `verifiedStableTotal`, `verifiedVariableTotal` e `verifiedTotal`.
- Il contributo PNRR non validato viene rigorosamente escluso dai subtotali verificati.
- Il totale autoritativo definitivo `total` assume valore `null`.

`VERIFIED_SUBTOTAL = PRESERVED`.

---

## Wizard

In `Step7Pnrr.tsx`:
- È presente il toggle a tre vie per la decisione amministrativa.
- L'etichetta del tetto massimo è denominata chiaramente *"Massimo teorico utilizzabile"*.
- L'importo da applicare è gestito da un campo input dedicato e separato (*"Importo che l'ente intende effettivamente applicare al Fondo dipendenti"*).
- La funzione `parseVal` gestisce correttamente `Number(val)`, preservando lo zero esplicito.

`WIZARD_POLICY = COMPLIANT`.

---

## Transfer

In `applyWizard2026Transfer.ts` e `transferPreviewEngine.ts`:
- Il trasferimento ricalcola a runtime l'ammissibilità mediante `resolveWizardPnrrFaculty`, rifiutando di fidarsi di eventuali cache alterate (`TRANSFER_RECOMPUTATION = ENFORCED`).
- Se l'ente ha scelto `NOT_EXERCISED`, trasferisce $0,00\ \text{€}$.
- Se la facoltà è `EXERCISED` ma non valida, il trasferimento fallisce con eccezione bloccante.
- L'importo trasferito a destinazione è l'importo applicato prescelto dall'operatore, mai il massimo teorico.

`TRANSFER_POLICY = COMPLIANT`.

---

## Save / reload / hydration

- La serializzazione JSON e il salvataggio conservano in modo fedele lo stato `exerciseDecision` (`NOT_EXERCISED`, `EXERCISED`, `UNSET`), l'importo parziale e la distinzione tra base zero e base mancante.
- I valori predefiniti sample che fabbricavano virtuosità contabile positiva (`INITIAL_ANNUAL_DATA` in `constants.ts`: equilibrio true, debito true, incidenza 7.2%, base 1.200.000 €) sono stati integralmente convertiti a `undefined`.
- Un nuovo ente o una nuova annualità non riceve più evidenze PNRR fittizie all'avvio.

`PNRR_HYDRATION_DEFAULT_FABRICATION = ABSENT`.

---

## Compliance

In `complianceChecks.ts`:
- Viene generata una criticità bloccante `gravita: 'error'` (`PNRR_INVALID`) unicamente se l'entry PNRR del ledger si trova in stato `INVALID`.
- Gli stati `UNDETERMINED` convogliano nei prerequisiti mancanti canonici (`missingPrerequisites`), senza duplicazioni fittizie nella checklist.
- L'opzione `NOT_EXERCISED` non genera alcun errore di conformità.

`COMPLIANCE = COMPLIANT`.

---

## Cabina

La Cabina di Regia interagisce con il calcolo canonico nel pieno rispetto delle priorità operative:
- `NOT_EXERCISED`: nessun blocco PNRR;
- `NOT_ELIGIBLE` o importo oltre il tetto: stato `BLOCKED`;
- Dati mancanti / istruttoria non conclusa: stato `TO_COMPLETE`.

`CABINA = COMPLIANT`.

---

## Distribution

La pagina di Distribuzione delle risorse:
- Rende disponibile il budget autoritativo unicamente se lo stato del fondo è `VALID`.
- Con PNRR `UNDETERMINED` o `INVALID`, il budget definitivo non viene formato e la risorsa non autorizzata non entra nel residuo distribuibile.

`DISTRIBUTION = COMPLIANT`.

---

## Document readiness

Tutti i 5 tipi documentali attivi (`DETERMINA`, `RELAZIONE`, `PROSPETTO`, `SUMMARY_PDF`, `FAD_XLS`):
- Possono raggiungere lo stato `FINAL_READY` con facoltà `NOT_EXERCISED` (se non sussistono altri blocchi).
- Rimangono confinati a `DRAFT_ONLY` con filigrana bozza se la risorsa PNRR è `INVALID` o `UNDETERMINED`.

`DOCUMENT_READINESS = COMPLIANT`.

---

## Closure readiness

La chiusura dell'anno:
- Consente lo stato `READY` quando la facoltà non è esercitata.
- Impone lo stato `NOT_READY` in presenza di richieste PNRR non deliberate, incomplete o prive di copertura.

`CLOSURE_READINESS = COMPLIANT`.

---

## CLOSED

L'immutabilità delle annualità chiuse (`CLOSED`) è preservata:
- Nessun processo di migrazione o reidratazione altera snapshot congelati.
- `applyWizard2026Transfer` intercetta lo stato `CLOSED` e solleva eccezione immediata.
- I test di persistenza confermano zero chiamate `upsert` su snapshot chiusi.

`CLOSED = PRESERVED`.

---

## Segretari / Dirigenza scope

Dall'esame del finding originario `CALC-05` (`FINDINGS.json` e `supplement_probes.ts`), la root cause contestata riguardava specificamente il Fondo dipendenti e la variabile `vn_dl13_art8c3_incrementoPNRR_max5stabile2016`.
I percorsi contabili per i Segretari comunali e la Dirigenza costituiscono sottosistemi contabili separati, dotati di proprie discipline e campi manuali distinti. La loro mancata re-ingegnerizzazione all'interno di questo slice non inficia la completa risoluzione di `CALC-05`.

$$\text{NON\_FAD\_CALC05\_SCOPE} = \mathbf{IN\_SCOPE\_NOT\_REQUIRED}$$

---

## Frozen historical test review

L'aggiornamento apportato a `src/logic/__tests__/mod025ComplianceProspetto.test.ts` è stato sottoposto a verifica forense:
- **Nessuna modifica delle asserzioni:** Tutte le verifiche numeriche sui totali ($10.700\ \text{€}$, $77.700\ \text{€}$, $121.000\ \text{€}$) sono identiche byte per byte rispetto alla baseline PRE.
- **Aggiornamento Legittimo dell'Input:** L'aggiunta di 7 campi ha esplicitato l'istruttoria necessaria affinché i $4.000,00\ \text{€}$ di PNRR potessero essere considerati validi dal nuovo motore di calcolo, in perfetto accordo con l'intento originale del test (regressione combinata di risorse valide).
- Rimuovendo le sole 7 righe di input, il sorgente riproduce l'hash PRE originale.

`FROZEN_TEST_INTENT = VALID_PNRR`.\
`FROZEN_TEST_RECONCILIATION = LEGITIMATE_INPUT_UPDATE`.\
`EXPECTED_ECONOMIC_TOTALS_PRESERVED = YES`.

---

## Binary recovery verification

Tutti i 6 file di evidenza binaria in `evidence_wave3_hardening/` risultano ripristinati in modo impeccabile tramite estrazione dai blob Git locali conformi agli hash PRE registrati prima dello slice:

1. `Scenario_A_Determina_Costituzione_Fondo_2026.pdf` $\longrightarrow$ SHA-256: `9042480B004007BFCF003040D22DB4AB173C80292F3D7835FE3444A1BACC2D01` (MATCH)
2. `Scenario_A_Tabella15_COMUNE_SCENARIO_A_2026.xlsx` $\longrightarrow$ SHA-256: `3A9E3D4DB9CA07A71CC3E30D3AF8789E5111D4D73B739C63B4744ED98D0833B7` (MATCH)
3. `Scenario_B_Determina_BOZZA_2025.pdf` $\longrightarrow$ SHA-256: `5C8CBEBFE74535730FC5889D2C324A6E27018887816F6C4BF2C5BB06FE1C7564` (MATCH)
4. `Scenario_B_Tabella15_COMUNE_SCENARIO_B_2025.xlsx` $\longrightarrow$ SHA-256: `439D9D87AEB57739A54E79A6152364C67D9A7CA25E491723934C8C3500035FA1` (MATCH)
5. `Scenario_C_Tabella15_COMUNE_SCENARIO_C_2026.xlsx` $\longrightarrow$ SHA-256: `698C5290C623FDF9BF5AD6D75806B29379FCCF4402D0F768A99A4754475C935F` (MATCH)
6. `Scenario_G_Tabella15_COMUNE_SCENARIO_G_2026.xlsx` $\longrightarrow$ SHA-256: `3A299A0AE91008DD96D37FA8F7902DF28A4F539B41A1C0077D4158C83F9796F0` (MATCH)

$$\text{HISTORICAL\_BINARY\_INTEGRITY} = \mathbf{6\_OF\_6\_EXACT}$$

---

## Evidence-generator isolation

Il test `src/logic/calculation/__tests__/wave3HardeningEvidence.test.ts` opera come generatore di file fisici nel workspace e sovrascrive sistematicamente i 6 file binari durante la sua esecuzione.
L'esclusione di tale file dal runner di test di prodotto è stata verificata come operazione legittima di isolamento degli artefatti (`EVIDENCE_GENERATOR_EXCLUSION = LEGITIMATE_ISOLATION`), e non come occultamento di un fallimento funzionale.

---

## Product suite

L'esecuzione completa della suite di test di prodotto in ambiente strettamente offline registra:
- **File di test eseguiti:** 126
- **Test totali superati:** **1.645 / 1.645 (100% PASS)**
- **Test falliti:** 0
- **Test ignorati / saltati:** 0
- **Casi del generatore di evidenze isolati per design:** 7

$$\text{PRODUCT\_SUITE} = \mathbf{1645/1645\_PASS}$$

---

## Test harness

I 55 nuovi test specifici PNRR:
- 33 test in `src/logic/shared/__tests__/pnrrFaculty.test.ts`
- 19 test in `src/logic/calculation/__tests__/pnrrFacultyPipeline.test.ts`
- 3 test in `src/features/wizard2026/steps/__tests__/Step7Pnrr.faculty.test.tsx`

coprono in modo esaustivo l'intera matrice combinatoria dei requisiti A/B/C/D, gli anni limite (2022–2027), il trattamento delle basi mancanti e a zero, la persistenza e le integrazioni downstream.

$$\text{TEST\_HARNESS\_REVIEW} = \mathbf{PASS\_HIGH\_CONFIDENCE}$$

---

## Closed-finding regressions

La suite di regressione e gli script oracolari confermano l'assoluta assenza di regressioni sui finding precedentemente chiusi:
- `scripts/run_regression_tests.ts`: **8/8 PASS**
- `scripts/run_wave2_oracle.ts`: **14/14 PASS**
- TypeScript type-check (`tsc --noEmit`): **0 errori (PASS)**
- `SEC-01`, `DATA-02`, `CALC-01`, `CALC-02`, `DOC-01`, `DOC-02`, `NORM-01`, `FUNC-01`, `FUNC-02`: **Tutti VERIFIED_FIXED**.
- `ASTRA_BLOCKERS_OPEN = 0`.

---

## Scope integrity

Il confronto forense rispetto alla baseline certifica che nessuna modifica non autorizzata è stata apportata a file di produzione estranei, golden o migrazioni:

$$\text{SCOPE\_INTEGRITY} = \mathbf{PASS}$$

- `PRODUCT_NETWORK_ATTEMPTS = 0`
- `TOOLING_NETWORK_ATTEMPTS = 0`
- `REAL_NETWORK_CONNECTION_ESTABLISHED = NO`

---

## CALC-05 closure decision

Poiché tutti i 30 criteri di verifica prescritti risultano soddisfatti senza eccezioni, l'indagine indipendente emette verdetto favorevole:

$$\mathbf{CALC\_05\_FINAL\_STATUS = VERIFIED\_FIXED}$$

---

## Updated ASTRA count

In virtù della chiusura formale di `CALC-05`, la composizione ufficiale dei 25 finding ASTRA viene aggiornata come segue:

| Stato di Conformità | Conteggio Precedente | Conteggio Attuale | Delta |
| :--- | :---: | :---: | :---: |
| **VERIFIED_FIXED** | 9 | **10** | $+1$ (`CALC-05`) |
| **PARTIALLY_FIXED** | 8 | **8** | $0$ |
| **OPEN** | 8 | **7** | $-1$ (`CALC-05`) |
| **NOT_VERIFIED** | 0 | **0** | $0$ |
| **ACCEPTED_LIMITATION** | 0 | **0** | $0$ |
| **OUT_OF_SCOPE** | 0 | **0** | $0$ |
| **TOTALE FINDING** | **25** | **25** | **0** |

$$\mathbf{ASTRA\_BLOCKERS\_OPEN = 0}$$

---

## Next recommendation

Per la prosecuzione della roadmap di bonifica, si raccomanda l'apertura dello slice unificato:

$$\mathbf{NEXT\_GATE\_RECOMMENDATION = DL25\_COHERENT\_REGIME}$$

Tale iniziativa consentirà di sanare in un unico intervento coordinato la classe di difetti legati al D.L. 25/2025:
1. `CALC-03` (Riconciliazione margine netto vs lordo finanziario);
2. `NORM-03` (Regime temporale post 8 agosto 2026 ex art. 33);
3. `NORM-04` (Allineamento etichette anno base 2025 e fattore percentuale 48%).

**FERMATI:** Non implementare lo slice né applicare modifiche ulteriori in questa sessione.

---

# OUTPUT TERMINALE

```text
PNRR_ZERO_AND_MISSING_CAP_INDEPENDENT_REVIEW = COMPLETE

RESULT = PASS

ORIGINAL_CALC05_ACCEPTANCE = SATISFIED

OPTIONALITY_CONTRACT = PASS
UNSET_CONTRACT = SAFE

PNRR_ANNUAL_VARIABLE_CONTRACT = PRESERVED

YEAR_2022 = NOT_APPLICABLE
YEAR_2023 = APPLICABLE_PERIOD
YEAR_2024 = APPLICABLE_PERIOD
YEAR_2025 = APPLICABLE_PERIOD
YEAR_2026 = APPLICABLE_PERIOD
YEAR_2027 = NOT_APPLICABLE

YEAR_2026_PREVIOUS_YEAR = 2025

REQUIREMENT_C_TEMPORAL_MODEL = LATEST_APPROVED_STATEMENT

PNRR_MAXIMUM_BASE = CERTIFIED_STABLE_2016
PNRR_BASE_AUTO_SEEDING = ABSENT

MAXIMUM_AUTO_APPLICATION = ABSENT

PARTIAL_USE_OF_MAXIMUM = SUPPORTED
ZERO_VS_MISSING = PRESERVED
CENT_BOUNDARY = STRICT_NO_TOLERANCE
FINANCIAL_MATH = PRESERVED

CANONICAL_PNRR_AUTHORITY = SEMANTIC_VALIDATED_ENTRY
LEGACY_CAP_AUTHORITY = NONE

PNRR_DOMAIN_AUTHORITY = SINGLE_SHARED

VERIFIED_SUBTOTAL = PRESERVED

RAW_NUMERIC_BYPASS = ABSENT

WIZARD_POLICY = COMPLIANT
TRANSFER_POLICY = COMPLIANT
TRANSFER_RECOMPUTATION = ENFORCED

SAVE_RELOAD = PRESERVED
HYDRATION = PRESERVED
PNRR_HYDRATION_DEFAULT_FABRICATION = ABSENT

COMPLIANCE = COMPLIANT

CABINA = COMPLIANT
DISTRIBUTION = COMPLIANT
DOCUMENT_READINESS = COMPLIANT
CLOSURE_READINESS = COMPLIANT
CLOSED = PRESERVED

NON_FAD_CALC05_SCOPE = IN_SCOPE_NOT_REQUIRED

FROZEN_TEST_ORIGINAL_INTENT = VALID_PNRR

FROZEN_TEST_RECONCILIATION = LEGITIMATE_INPUT_UPDATE

EXPECTED_ECONOMIC_TOTALS_PRESERVED = YES

HISTORICAL_BINARY_INTEGRITY = 6_OF_6_EXACT

EVIDENCE_GENERATOR_EXCLUSION = LEGITIMATE_ISOLATION

PRODUCT_SUITE = 1645/1645_PASS

EVIDENCE_GENERATOR_CASES = 7_NOT_RUN_BY_DESIGN

TEST_HARNESS_REVIEW = PASS_HIGH_CONFIDENCE

POST_FIX_ACTIVE_PNRR_BYPASSES = 0

SEC_01_REGRESSION = NONE
DATA_02_REGRESSION = NONE
CALC_01_REGRESSION = NONE
CALC_02_REGRESSION = NONE
DOC_01_REGRESSION = NONE
DOC_02_REGRESSION = NONE
NORM_01_REGRESSION = NONE
FUNC_01_REGRESSION = NONE
FUNC_02_REGRESSION = NONE

ASTRA_BLOCKERS_OPEN = 0

SCOPE_INTEGRITY = PASS

PRODUCT_NETWORK_ATTEMPTS = 0
TOOLING_NETWORK_ATTEMPTS = 0
REAL_NETWORK_CONNECTION_ESTABLISHED = NO

CALC_05_FINAL_STATUS = VERIFIED_FIXED

IF_VERIFIED_FIXED_ASTRA_COUNTS =
VERIFIED_FIXED_10
PARTIALLY_FIXED_8
OPEN_7
TOTAL_25

FILES_CHANGED_BY_REVIEW =
PNRR_ZERO_AND_MISSING_CAP_INDEPENDENT_REVIEW.md

DATABASE_CHANGED = NO
MIGRATIONS_APPLIED = NO
STAGING_CONTACTED = NO
PRODUCTION_CONTACTED = NO

COMMIT = NO
PUSH = NO
PR = NO
DEPLOY = NO

REPORT =
PNRR_ZERO_AND_MISSING_CAP_INDEPENDENT_REVIEW.md

NEXT_GATE_RECOMMENDATION =
DL25_COHERENT_REGIME
```
