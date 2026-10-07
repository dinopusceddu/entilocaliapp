# WAVE 3 — FINAL MICRO-GATE
## UI export wiring + final consolidation readiness

Data: 23 settembre 2026\
Reviewer: Codex, gate indipendente\
Repository: `dinopusceddu/entilocaliapp`\
Branch: `ux/toolbox-area-fondo-prototype`\
HEAD: `fa0480139d76e938c5ca02312632f698c0acb506`

## 1. Verdetto

```text
W3-DOC-001 = VERIFIED_FIXED
W3-T15-001 = VERIFIED_FIXED
W3-T15-002 = VERIFIED_FIXED
W3-ATT-001 = VERIFIED_FIXED
W3-ATT-002 = VERIFIED_FIXED
W3-WB-001 = VERIFIED_FIXED
W3-RGS-001 = RGS_SCHEMA_UNVERIFIED

W3-MG-001 = OPEN_MEDIUM

APPLICATION_READY_FOR_CONSOLIDATION = NO
SICO_SCHEMA_VALIDATED = NO
RGS_SCHEMA_UNVERIFIED

WAVE3_REQUIRES_FIXES
```

Il residuo originario `W3-WB-001` è verificato come corretto: tutte le azioni UI definitive di `ReportsPage` attraversano gli entry point guardati, e i casi `UNDETERMINED`, canonical assente e mapping RGS unresolved vengono bloccati anche con invocazione programmatica.

Il consolidamento non è tuttavia approvato per una regressione introdotta dallo stesso wiring fix e distinta dal guardrail definitivo. Con fondo `VALID`, il nuovo pulsante **“Scarica Bozza (PDF)”** invoca correttamente `previewDraftDeterminaPDF()` e passa `mode: 'DRAFT_PREVIEW'`, ma `generateDeterminaPDF()` non usa tale modalità per forzare la semantica di bozza: il PDF resta privo del banner di bozza, contiene la formula `DI COSTITUIRE` e usa il nome definitivo `Determina_Costituzione_Fondo_<anno>.pdf`. L'azione mostrata come bozza produce quindi un atto semanticamente definitivo.

Questo finding non riapre la sicurezza degli export definitivi e non riguarda la validazione SICO; è una regressione comportamentale dell'ultimo diff, classificata MEDIUM perché l'etichetta dell'azione non corrisponde alla natura giuridico-documentale dell'output.

## 2. Baseline

| Verifica | Actual |
|---|---|
| `git branch --show-current` | `ux/toolbox-area-fondo-prototype` |
| `git rev-parse HEAD` | `fa0480139d76e938c5ca02312632f698c0acb506` — baseline esatta |
| Working tree | Wave 3 non committata; numerosi artefatti preesistenti; nessun reset, stash o cleanup eseguito |
| `git diff --stat` al preflight | 17 file tracked, 1125 inserimenti, 200 cancellazioni |
| `git diff --check` al preflight | PASS; soli warning LF/CRLF |
| Commit / push / PR / merge / deploy | non eseguiti |

Sono stati letti:

- `WAVE3_FINAL_GATE_REPORT.md`, usato come descrizione del finding residuo;
- `WAVE3_FINAL_WIRING_FIX_REPORT.md`, la cui dichiarazione `W3-WB-001 = FIXED` è stata verificata e non assunta;
- `WAVE3_SYSTEMIC_FIX_REPORT.md`.

## 3. Diff dell'ultimo wiring fix

Non esiste un commit intermedio dal quale ottenere un range Git separato: l'intera Wave 3, incluso l'ultimo fix, risiede nello stesso working tree non committato. Il delta finale è stato quindi isolato per semantica, confrontando il residuo descritto nel Final Gate precedente con il codice corrente e con l'elenco file del Final Wiring Fix Report.

| File | Delta finale verificato |
|---|---|
| `src/pages/ReportsPage.tsx` | sostituiti i vecchi handler generici con handler definitivi e preview distinti; readiness resa visibile; wiring Tabella 15 separato |
| `src/services/documents/documentFactory.ts` | aggiunti wrapper `exportDefinitive*`, `previewDraft*` e guardrail `assertDefinitiveExportAllowed` |
| `src/services/reportService.ts` | aggiunti wrapper definitivi/preview Tabella 15; `DEFINITIVE_EXPORT` impone il guard; unresolved RGS incluso nel blocco |
| `src/logic/calculation/tabella15Mapper.ts` | accessi `fondi` e `metadata` resi null-safe per mock/legacy |
| `src/logic/calculation/__tests__/wave3UiWiring.test.tsx` | aggiunta suite W1–W11 |
| `src/pages/Tabella15Page.tsx` | confermata vista senza exporter; aggiunti warning e distinzione totale/subtotale |

La modifica null-safe in `tabella15Mapper.ts` è innocua rispetto alla logica economica: `result.fondi?.dipendente` evita un'eccezione; i fallback `metadata?.annoRiferimento ?? 2026` e denominazione `Ente` sono soltanto metadati di presentazione. Non viene creato alcun importo o mapping economico. Senza canonical ledger il percorso resta legacy preview, `grandTotal = null`, `isArithmeticExportReady = false`, `isSicoExportReady = false`.

## 4. ReportsPage — document export wiring

White-box degli handler reali:

| Azione UI definitiva | Chiamata reale |
|---|---|
| Determina PDF | `factory.exportDefinitiveDeterminaPDF()` |
| Determina TXT | `factory.exportDefinitiveDetermina()` |
| Relazione tecnica | `factory.exportDefinitiveRelazioneTecnica()` |
| Prospetto | `factory.exportDefinitiveProspetto()` |

Nessuna azione UI definitiva chiama direttamente `generateDetermina`, `generateDeterminaDocumentPDF`, `generateRelazioneTecnica` o `generateProspettoContrattazione`.

Il predicato UI deriva da `docFactory.isDefinitiveExportReady()`. La factory richiede contemporaneamente:

```text
canonicalFund presente
determina.isDetermined = true
projection.exportReadiness = DOCUMENT_FINAL_READY
```

La proiezione documentale rende `DOCUMENT_FINAL_READY` soltanto con fondo canonico `VALID`, totale non nullo e prerequisiti mancanti vuoti. Il tentativo programmatico sui wrapper definitivi rilancia inoltre `assertDefinitiveExportAllowed`, quindi il controllo non dipende dal solo `disabled` React.

Esiti diretti:

| Scenario | UI | Invocazione programmatica definitiva | Bozza |
|---|---|---|---|
| `VALID`, totale presente, prerequisiti vuoti | azioni definitive disponibili | consentita | vedi finding W3-MG-001 per il pulsante PDF bozza aggiuntivo |
| `UNDETERMINED`, totale numerico presente | definitive non disponibili; bottone bloccato | tutti i quattro wrapper bloccati | disponibile, banner bozza, nessun `DI COSTITUIRE` |
| canonical assente | definitive non disponibili; bottone bloccato | bloccata per assenza CanonicalFundLedger | legacy preview disponibile, nessun `DI COSTITUIRE` |

## 5. ReportsPage — Tabella 15 XLS/CSV wiring

White-box degli handler reali:

| Azione | Chiamata reale | Mode imposto dal wrapper |
|---|---|---|
| Riconciliazione definitiva XLS | `exportDefinitiveTabella15XLS(...)` | `DEFINITIVE_EXPORT` |
| Riconciliazione definitiva CSV | `exportDefinitiveTabella15CSV(...)` | `DEFINITIVE_EXPORT` |
| Prospetto tecnico provvisorio XLS | `previewDraftTabella15XLS(...)` | `DRAFT_PREVIEW` |
| Prospetto tecnico provvisorio CSV | `previewDraftTabella15CSV(...)` | `DRAFT_PREVIEW` |

I wrapper definitivi raggiungono `assertDefinitiveTabella15ExportAllowed`, che richiede:

```text
isArithmeticExportReady = true
grandTotal != null
overallStatus = VALID
unresolvedClassifications.length = 0
```

Esiti diretti:

| Scenario | Definitivo XLS/CSV |
|---|---|
| fondo `VALID`, quadratura pronta | consentito e servizio di scrittura raggiunto |
| fondo `UNDETERMINED` | bloccato |
| canonical assente | bloccato |
| `RGS_MAPPING_UNRESOLVED` presente | bloccato |

Nei casi non ready la UI propone soltanto il prospetto tecnico provvisorio e un controllo definitivo disabilitato. La preview usa esplicitamente `DRAFT_PREVIEW`; il mapper mantiene `grandTotal = null`, espone il solo `verifiedSubtotal`, non dichiara SICO ready e conserva warning RGS/SICO.

## 6. Tabella15Page — bypass

`Tabella15Page.tsx` è una vista:

- non importa `reportService` o exporter;
- non contiene pulsanti download;
- non chiama XLS/CSV direttamente;
- mostra `schemaVerificationStatus` e il testo di mancata validazione ministeriale;
- mostra `Totale Generale Tabella 15` solo quando `grandTotal !== null`, altrimenti `Subtotale Risorse Verificate`;
- non contiene diciture SICO-ready.

Stato verificato:

```text
schemaVerificationStatus = RGS_SCHEMA_UNVERIFIED
isSicoExportReady = false
```

Esito: PASS, nessun bypass.

## 7. DRAFT_PREVIEW vs DEFINITIVE_EXPORT

### Percorsi non ready

PASS. Per `UNDETERMINED` con totale numerico e per canonical assente:

- il definitivo documentale è bloccato dal wrapper;
- la preview richiesta dall'UI attraversa `previewDraft*` e quindi passa `DRAFT_PREVIEW`;
- il ViewModel è `isDraft = true`;
- Determina TXT/PDF usa formula istruttoria e non contiene `DI COSTITUIRE`;
- Relazione e Prospetto non espongono un totale generale definitivo.

Per Tabella 15 non ready:

- i definitivi passano `DEFINITIVE_EXPORT` e vengono bloccati;
- le preview passano `DRAFT_PREVIEW`;
- `grandTotal = null`, quindi non viene esposto il totale generale definitivo.

### Regressione sul pulsante bozza in stato VALID — W3-MG-001

Percorso reale:

```text
ReportsPage: "Scarica Bozza (PDF)"
→ handlePreviewDraftDeterminaPDF
→ DocumentFactory.previewDraftDeterminaPDF()
→ generateDeterminaDocumentPDF({ mode: 'DRAFT_PREVIEW' })
→ generateDeterminaPDF(viewModel, options)
```

In `generateDeterminaPDF` il parametro `options` viene letto soltanto per bloccare un `DEFINITIVE_EXPORT` non ready. La resa del documento dipende esclusivamente da `vm.isDraft` e `d.exportReadiness`. Con fondo `VALID`, `vm.isDraft = false` e `exportReadiness = DOCUMENT_FINAL_READY`; di conseguenza:

- nessun banner di bozza;
- formula `DI COSTITUIRE`;
- filename `Determina_Costituzione_Fondo_<anno>.pdf`.

La modalità nominale `DRAFT_PREVIEW` non forza quindi una bozza quando il fondo è ready. Severità: **MEDIUM**, consolidamento bloccato per mismatch tra azione UI e natura dell'atto prodotto.

## 8. RGS/SICO wording finale

La dicitura `Scarica Riconciliazione Definitiva (XLS/CSV)` non è stata valutata ambigua nel contesto reale perché sono contemporaneamente e immediatamente visibili nello stesso card:

- titolo `Tabella 15 del Conto Annuale (Riconciliazione Tecnica)`;
- `Stato Schema: RGS_SCHEMA_UNVERIFIED`;
- `Schema RGS/SICO annuale non verificato — file non validato per trasmissione ministeriale`;
- `Utilizzabile esclusivamente per riconciliazione interna`;
- stato separato `Quadratura Aritmetica: COMPLETATA`;
- nessuna dicitura SICO-ready.

Nel contesto mostrato, “definitiva” è semanticamente riferita alla riconciliazione interna completata, non alla validazione ministeriale. Nessun finding UX RGS/SICO aperto.

## 9. W1–W11

Comando:

```text
npx vitest run src/logic/calculation/__tests__/wave3UiWiring.test.tsx
```

Actual: **11/11 PASS**, 1 file, 11 test, zero failure.

La suite non è stata usata come unica evidenza:

- W1–W3 rendono la UI e controllano disponibilità/blocco, ma non cliccano tutti gli handler;
- W4 invoca direttamente i wrapper Tabella 15 unresolved;
- W5 verifica stato RGS/SICO e sorgenti UI;
- W6–W7 sono controlli statici sul sorgente di `ReportsPage`;
- W8–W11 invocano direttamente i wrapper documentali.

Gap rilevante: W1 verifica la presenza del pulsante `Scarica Bozza (PDF)` nello stato VALID ma nessun test W1–W11 ne verifica il contenuto prodotto. Per questo la regressione W3-MG-001 non viene intercettata pur con 11/11 verdi.

La prima esecuzione sotto sandbox è fallita perché esbuild non poteva leggere directory/configurazione superiori; la ripetizione fuori sandbox autorizzata è passata. Non è un difetto applicativo.

## 10. Micro-test indipendente

È stato creato un test temporaneo non permanente, eseguito e poi eliminato. Nessun test del repository è stato modificato.

Matrice finale eseguita:

| Probe | Esito |
|---|---|
| VALID → quattro entry point documentali definitivi consentiti; XLS/CSV definitivi raggiungono il writer | PASS |
| UNDETERMINED + totale numerico + prerequisito mancante → documenti e XLS/CSV definitivi bloccati; draft senza `DI COSTITUIRE` | PASS |
| NO_CANONICAL → documenti e XLS/CSV definitivi bloccati; legacy draft senza `DI COSTITUIRE` | PASS |
| UNRESOLVED_RGS → XLS/CSV definitivi bloccati | PASS |
| VALID + `DRAFT_PREVIEW` → riproduzione controllata di formula `DI COSTITUIRE` e assenza banner bozza | PASS, conferma W3-MG-001 |

Actual finale: **5/5 probe PASS**. Una prima iterazione del fixture UNDETERMINED è stata scartata perché il costruttore canonico aveva correttamente prodotto `total = null`; il fixture è stato corretto impostando esplicitamente lo stato limite richiesto, con totale numerico e prerequisito mancante, e la matrice è stata rieseguita integralmente.

## 11. Quality gates

| Comando | Actual |
|---|---|
| `git diff --check` | PASS, exit 0; soli warning EOL |
| `npx tsc --noEmit` | PASS, exit 0 |
| `npx vitest run src/logic/calculation/__tests__/wave3UiWiring.test.tsx` | PASS — 1 file, 11/11 test |
| micro-test indipendente temporaneo | PASS — 5/5 probe |
| `npm test -- --run` | PASS — **101 file, 1051 test, 0 failure** |
| `npm run build` | PASS — 1865 moduli, 21.96 s; warning non bloccanti `eval` pdfjs e chunk > 500 kB |
| `npx vite-node scripts/run_regression_tests.ts` | PASS — **8/8** |
| `npx vite-node scripts/run_wave2_oracle.ts` | PASS — **14/14** |

## 12. Stato finding

| Finding | Stato | Evidenza del micro-gate |
|---|---|---|
| W3-DOC-001 | VERIFIED_FIXED | readiness canonica e bozze non-ready senza formula costitutiva |
| W3-T15-001 | VERIFIED_FIXED | mapping canonico; unresolved preservato e definitivo bloccato |
| W3-T15-002 | VERIFIED_FIXED | nessuna regressione nel mapper; suite completa, regressione e oracolo verdi |
| W3-ATT-001 | VERIFIED_FIXED | nessuna regressione causata dal wiring fix |
| W3-ATT-002 | VERIFIED_FIXED | nessuna regressione causata dal wiring fix |
| W3-WB-001 | VERIFIED_FIXED | azioni UI definitive attraversano esclusivamente wrapper guardati; programmatic bypass bloccato |
| W3-RGS-001 | RGS_SCHEMA_UNVERIFIED | `isSicoExportReady = false`; wording ministeriale prudente |
| W3-MG-001 | OPEN_MEDIUM | il nuovo pulsante bozza PDF su fondo VALID produce un atto definitivo |

## 13. Consolidation readiness

La sicurezza dei percorsi definitivi richiesta dal precedente gate è verificata. Tuttavia il consolidamento includerebbe una nuova azione utente etichettata “Bozza” che genera un atto definitivo. Poiché il difetto è nel wiring appena introdotto ed è riproducibile dal percorso UI reale, non può essere classificato come semplice wording cosmetico.

La mancata validazione RGS/SICO resta indipendente e correttamente contenuta:

```text
APPLICATION_READY_FOR_CONSOLIDATION = NO

SICO_SCHEMA_VALIDATED = NO
RGS_SCHEMA_UNVERIFIED
```

Verdetto unico:

```text
WAVE3_REQUIRES_FIXES
```
