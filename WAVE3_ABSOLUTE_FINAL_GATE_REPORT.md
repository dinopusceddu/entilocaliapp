# WAVE 3 — ABSOLUTE FINAL GATE REPORT

Data verifica: 2026-09-24
Scope: verifica esclusiva di `W3-MG-001` e regressioni direttamente riconducibili al fix.

## 1. Baseline

| Controllo | Esito |
|---|---|
| Repository | `dinopusceddu/entilocaliapp` |
| Branch | `ux/toolbox-area-fondo-prototype` |
| HEAD | `fa0480139d76e938c5ca02312632f698c0acb506` — conforme alla baseline richiesta |
| Working tree | Wave 3 non committata, con modifiche e numerose evidenze untracked preesistenti |
| Diff tracked | 17 file, 1140 inserimenti, 203 eliminazioni |
| `git diff --check` | PASS; soli warning informativi LF/CRLF, nessun errore whitespace |

Sono stati letti `WAVE3_FINAL_MICRO_GATE_REPORT.md`, `WAVE3_FINAL_DRAFT_FIX_REPORT.md` e `WAVE3_FINAL_WIRING_FIX_REPORT.md`. I test modificati durante il fix (`wave3HardeningEvidence.test.ts` e `independent_wave3_review.test.ts`) non sono stati usati come prova indipendente.

## 2. Diff MG-001

Il delta successivo al precedente micro-gate è confinato alla presentazione/generazione documentale: `pdfDeterminaService.ts`, `determinaTemplateV2.ts`, `relazioneTecnicaTemplate.ts` e `documentFactory.ts`, oltre all'estensione della suite di wiring. Il confronto con il preflight del micro-gate precedente passa da 1125/200 a 1140/203 righe aggiunte/rimosse.

Non risultano variazioni aggiuntive attribuibili al fix MG-001 in:

- `CanonicalFundLedger`;
- formule Wave 2 e rounding;
- Art. 23, Art. 33, Art. 60;
- calcoli 0,14% e 0,22%;
- mapping RGS.

Non è emersa alcuna condizione di STOP.

## 3. White-box: separazione readiness/mode

La correzione separa correttamente:

- **domain readiness**, ricavata dal view model e usata dai guardrail definitivi;
- **requested output mode**, veicolata da `options.mode` e determinante per la semantica dell'artefatto.

La catena verificata è:

`ReportsPage` → wrapper `DocumentFactory` → template/service → renderer → contenuto e filename.

Esito per tipo di documento:

| Output | Propagazione di `mode` | Esito |
|---|---|---|
| Determina PDF | handler UI → `previewDraftDeterminaPDF`/`exportDefinitiveDeterminaPDF` → `generateDeterminaPDF` → `PDFDeterminaService.generate` → banner, formula, filename | PASS |
| Determina TXT | handler UI → wrapper dedicato → `generateDetermina` → `DeterminaTemplateV2.generate` → banner, formula, filename | PASS |
| Relazione | handler UI → wrapper dedicato → `generateRelazioneTecnica` → template → intestazione, qualificazione importi, filename | PASS |
| Prospetto | handler UI → wrapper dedicato → `generateProspetto` → builder → banner, totale, filename | PASS |

`DRAFT_PREVIEW` prevale semanticamente anche con fondo `VALID` e `DOCUMENT_FINAL_READY`. `DEFINITIVE_EXPORT` produce output definitivo solo dopo il guardrail di readiness.

## 4. Independent MG1–MG7

È stata costruita una micro-probe temporanea con expected autonomi. Non ha importato né riutilizzato gli expected dei test permanenti o delle evidenze Antigravity. Il file di probe è stato eliminato al termine.

| Gate | Scenario e verifica | Esito |
|---|---|---|
| MG1 | `VALID + DRAFT PDF`: filename `Determina_BOZZA_2026.pdf`, banner bozza presente, `DI COSTITUIRE` assente, formula istruttoria presente | PASS |
| MG2 | `VALID + DRAFT TXT`: filename bozza, banner presente, nessun `DI COSTITUIRE`, formula istruttoria presente | PASS |
| MG3 | `VALID + DRAFT RELAZIONE`: qualificazione esplicita bozza/schema; nessuna certificazione o `TOTALE GENERALE` definitivo; importo solo istruttorio/subtotale | PASS |
| MG4 | `VALID + DRAFT PROSPETTO`: qualificazione bozza, nessuna disponibilità definitiva, filename bozza | PASS |
| MG5 | stesso fondo `VALID + DEFINITIVE PDF`: filename `Determina_Costituzione_Fondo_2026.pdf`, nessun banner bozza, `DI COSTITUIRE` presente | PASS |
| MG6 | `UNDETERMINED + DEFINITIVE`: Determina TXT/PDF, Relazione e Prospetto tutti bloccati; nessun artefatto definitivo prodotto | PASS |
| MG7 | stesso `UNDETERMINED + DRAFT`: tutti i wrapper preview consentiti, semantica bozza, nessun `DI COSTITUIRE`, nessun totale definitivo inventato | PASS |

Il confronto MG1/MG5 usa lo stesso identico view model e lo stesso importo (`€ 277,44`): la differenza rilevata deriva esclusivamente dal mode richiesto.

## 5. P1/P2 — percorso UI reale

Il componente reale `ReportsPage` è stato montato in una harness indipendente; sono stati eseguiti click DOM reali sui due pulsanti. È stato controllato il percorso effettivo degli handler e sono rimasti reali, non mockati, `DocumentFactory`, i template, jsPDF e il renderer. Il mock è stato limitato al contesto applicativo necessario a fornire lo stesso Fondo `VALID` controllato.

| Prova | Artefatto fisico | Riscontro parser/visuale | Esito |
|---|---|---|---|
| P1 `Scarica Bozza (PDF)` | `P1_UI_DRAFT_Determina_BOZZA_2026.pdf`, 2 pagine, 9.199 byte, SHA-256 `1d8ad5b7802b2e6bde800c9a90cf02702b6a243fc7ca4b59d6c700280804626c` | banner bozza sì; `DI COSTITUIRE` no; formula istruttoria sì; `€ 277,44` presente | PASS |
| P2 `Genera Determina Definitiva (PDF)` | `P2_UI_FINAL_Determina_Costituzione_Fondo_2026.pdf`, 2 pagine, 8.928 byte, SHA-256 `188778bc50dbb7231432009d57c1a66607463bfc07e6f276b74bdc28cdba39e0` | banner bozza no; `DI COSTITUIRE` sì; formula istruttoria no; `€ 277,44` presente | PASS |

Entrambi i PDF sono stati riletti con parser PDF indipendente e renderizzati con Poppler; le quattro pagine renderizzate sono state ispezionate visivamente. Nessuna anomalia semantica o di leggibilità materiale.

È stato inoltre eseguito uno smoke nel browser sull'app reale: il fondo disponibile era `UNDETERMINED`, la UI mostrava lo stato di bozza e manteneva disabilitata l'azione definitiva. Non sono stati alterati dati applicativi per fabbricare un fondo `VALID`; P1/P2 `VALID` sono stati quindi verificati end-to-end sul componente React reale nella harness sopra descritta.

## 6. W3-WB-001 — controllo regressione mirato

- Gli handler definitivi documentali di `ReportsPage` continuano a chiamare esclusivamente i wrapper definitivi di `DocumentFactory`.
- Gli handler definitivi Tabella 15 continuano a chiamare i wrapper definitivi XLS/CSV di `reportService`.
- I guardrail programmatici restano attivi: un Fondo non ready non può produrre artefatti definitivi.
- Gli handler di preview continuano a chiamare wrapper esplicitamente draft.

Esito: `W3-WB-001 = VERIFIED_FIXED`.

## 7. RGS/SICO fuori scope del fix

Controllo limitato alla non-regressione:

```ini
schemaVerificationStatus = RGS_SCHEMA_UNVERIFIED
isSicoExportReady = false
```

Non è stata svolta una nuova ricerca normativa RGS. Nessuna dicitura o percorso verificato rappresenta falsamente il file come validato per SICO.

## 8. Test permanente e micro-probe indipendente

| Esecuzione | Actual |
|---|---|
| `npx vitest run src/logic/calculation/__tests__/wave3UiWiring.test.tsx` | 1 file PASS; 19/19 test PASS |
| Micro-probe indipendente | 5/5 PASS |

Matrice minima della micro-probe:

```text
VALID + DRAFT PDF       → DRAFT
VALID + DEFINITIVE PDF  → FINAL
VALID + DRAFT TXT       → DRAFT
UNDETERMINED + DRAFT    → DRAFT
UNDETERMINED + FINAL    → BLOCK
```

La probe includeva inoltre i controlli MG3/MG4 e tutti i wrapper MG6/MG7. Gli artefatti fisici di audit sono conservati sotto `tmp/pdfs/wave3_absolute_gate/`; nessun test permanente è stato aggiunto o modificato dal gate.

## 9. Full quality gates

| Gate | Actual | Esito |
|---|---:|---|
| `git diff --check` | nessun errore; soli warning LF/CRLF | PASS |
| `npx tsc --noEmit` | exit 0 | PASS |
| `npm test -- --run` | 101/101 file; 1059/1059 test; 0 failure | PASS |
| `npm run build` | build Vite completata; warning non bloccanti su chunk size/eval pdfjs | PASS |
| `npx vite-node scripts/run_regression_tests.ts` | 8/8 | PASS |
| `npx vite-node scripts/run_wave2_oracle.ts` | 14/14 | PASS |

Il primo tentativo di build/oracoli nel sandbox è stato impedito dai permessi di attraversamento del profilo Windows; la riesecuzione autorizzata fuori sandbox ha prodotto gli esiti PASS sopra riportati.

## 10. Final findings

```ini
W3-DOC-001 = VERIFIED_FIXED
W3-T15-001 = VERIFIED_FIXED
W3-T15-002 = VERIFIED_FIXED
W3-ATT-001 = VERIFIED_FIXED
W3-ATT-002 = VERIFIED_FIXED
W3-WB-001 = VERIFIED_FIXED
W3-MG-001 = VERIFIED_FIXED
W3-RGS-001 = RGS_SCHEMA_UNVERIFIED
```

## 11. Consolidation readiness

```ini
APPLICATION_READY_FOR_CONSOLIDATION = YES

SICO_SCHEMA_VALIDATED = NO
RGS_SCHEMA_UNVERIFIED
```

La readiness applicativa è approvata indipendentemente dalla validazione ministeriale dello schema, che resta esplicitamente non acquisita e non viene rappresentata come tale dal software.

## VERDETTO

`WAVE3_APPROVED_FOR_CONSOLIDATION`

Nessun codice applicativo, test permanente o golden è stato modificato dal gate. Nessun commit, push, PR, merge o deploy è stato eseguito.
