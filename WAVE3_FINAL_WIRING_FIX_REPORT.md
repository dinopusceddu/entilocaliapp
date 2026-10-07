# WAVE 3 — FINAL WIRING FIX REPORT
## Chiusura Definitiva di W3-WB-001 ed Export Wiring Sicuro

**Data:** 23 Settembre 2026\
**Autore:** Antigravity\
**Repository:** `dinopusceddu/entilocaliapp`\
**Branch:** `ux/toolbox-area-fondo-prototype`\
**Baseline Git Pre-Wave 3:** `fa0480139d76e938c5ca02312632f698c0acb506` (`refactor: introduce canonical fund ledger`)\
**Stato Working Tree:** Modifiche non committate nel working tree, nessun commit/push/PR/merge eseguito\
**Verdetto Finale:** `WAVE3_FINAL_WIRING_READY_FOR_REVIEW`

---

## 1. Stato dei Finding

| Codice Finding | Descrizione | Stato Pre-Fix | Stato Post-Fix | Note di Chiusura |
| :--- | :--- | :--- | :--- | :--- |
| **W3-DOC-001** | Predicato di readiness documentale unificato | `VERIFIED_FIXED` | **VERIFIED_FIXED** | Invariato. Nessuna regressione. |
| **W3-T15-001** | Tabella 15 alimentata da Canonical Ledger | `VERIFIED_FIXED` | **VERIFIED_FIXED** | Invariato. Gestione trasparente di `RGS_MAPPING_UNRESOLVED`. |
| **W3-T15-002** | Uniformità monetaria / per-entry half-up 2DP | `VERIFIED_FIXED` | **VERIFIED_FIXED** | Invariato. Oracolo 89.99 € coerente ovunque. |
| **W3-ATT-001** | Metadati Revisori dei Conti | `VERIFIED_FIXED` | **VERIFIED_FIXED** | Invariato. Roundtrip e testi documentali conformi. |
| **W3-ATT-002** | Metadati Giunta Comunale | `VERIFIED_FIXED` | **VERIFIED_FIXED** | Invariato. Roundtrip e testi documentali conformi. |
| **W3-WB-001** | Wiring reale UI degli entry point di export | `PARTIALLY_FIXED` | **FIXED** | ReportsPage collegata esclusivamente a wrapper espliciti (`DEFINITIVE_EXPORT` vs `DRAFT_PREVIEW`). Bottoni definitivi disabilitati in stato bozza e protetti da guardrail rigidi. |
| **W3-RGS-001** | Validazione schema ministeriale RGS | `RGS_SCHEMA_UNVERIFIED` | **RGS_SCHEMA_UNVERIFIED** | Invariato. Nessuna UI dichiara SICO-ready; etichettatura rigorosa come riconciliazione tecnica interna non ministeriale. |

---

## 2. Baseline Git

- **Branch attivo:** `ux/toolbox-area-fondo-prototype`
- **Commit HEAD:** `fa0480139d76e938c5ca02312632f698c0acb506`
- **Controllo baseline:** Coincidente con il commit consolidato pre-Wave 3.
- **Integrità working tree:** Nessun reset, stash, checkout o cleanup distruttivo eseguito.

---

## 3. Root Cause del Residuo e Risoluzione Architetturale

### 3.1 La Causa Radice
Nel gate di verifica indipendente, Codex ha evidenziato che in `ReportsPage.tsx`:
1. Gli handler dei documenti invocavano i metodi generici (`generateDetermina()`, `generateDeterminaDocumentPDF()`, `generateRelazioneTecnica()`, `generateProspettoContrattazione()`) senza passare `{ mode: 'DEFINITIVE_EXPORT' }` o chiamare gli entry point guardati (`exportDefinitiveDetermina()`, ecc.).
2. Gli handler di Tabella 15 invocavano `generateTabella15ExportXLS` e `generateTabella15ExportCSV` senza opzioni modali, bypassando `assertDefinitiveTabella15ExportAllowed` e generando file XLS/CSV anche per fondi non determinati o privi di canonical ledger.
3. Mancava la netta separazione semantica tra un'azione utente di **BOZZA / ANTEPRIMA TECNICA** (`DRAFT_PREVIEW`) e un'azione di **EXPORT DEFINITIVO** (`DEFINITIVE_EXPORT`).

### 3.2 Principio di Risoluzione
Ogni singola azione di esportazione e generazione presente nell'interfaccia utente dichiara in modo tassativo la propria modalità:
- **`DEFINITIVE_EXPORT`**: consentito solo ed esclusivamente quando il dominio certifica la readiness; protetto sia dall'interfaccia (bottone disabilitato o bloccato) sia dal guardrail di dominio/servizio (`assertDefinitiveExportAllowed`, `assertDefinitiveTabella15ExportAllowed`), che solleva eccezione se invocato impropriamente.
- **`DRAFT_PREVIEW`**: genera la versione bozza esplicitamente contrassegnata, priva di formule dispositive ("DI COSTITUIRE") e con totale non determinato.

---

## 4. Dettaglio Implementativo

### 4.1 `src/services/documents/documentFactory.ts`
Completata la suite simmetrica dei metodi di export espliciti:
- Entry point definitivi (guardati tramite `assertDefinitiveExportAllowed`):
  - `exportDefinitiveDetermina()`
  - `exportDefinitiveDeterminaPDF()`
  - `exportDefinitiveRelazioneTecnica()`
  - `exportDefinitiveProspetto()`
- Entry point bozza/anteprima (modalità esplicita `DRAFT_PREVIEW`):
  - `previewDraftDetermina()`
  - `previewDraftDeterminaPDF()`
  - `previewDraftRelazioneTecnica()`
  - `previewDraftProspetto()`

### 4.2 `src/services/reportService.ts`
Introdotti metodi dedicati per Tabella 15 che impongono la modalità senza affidarsi a parametri opzionali:
- `exportDefinitiveTabella15XLS(result, normative)` -> chiama con `{ mode: 'DEFINITIVE_EXPORT' }`, che esegue `assertDefinitiveTabella15ExportAllowed(data)`.
- `exportDefinitiveTabella15CSV(result, normative)` -> chiama con `{ mode: 'DEFINITIVE_EXPORT' }`, che esegue `assertDefinitiveTabella15ExportAllowed(data)`.
- `previewDraftTabella15XLS(result, normative)` -> chiama con `{ mode: 'DRAFT_PREVIEW' }`.
- `previewDraftTabella15CSV(result, normative)` -> chiama con `{ mode: 'DRAFT_PREVIEW' }`.
- Rafforzato `assertDefinitiveTabella15ExportAllowed` per verificare anche `data.unresolvedClassifications.length > 0`.

### 4.3 `src/pages/ReportsPage.tsx`
- **Derivazione della Readiness:**
  - Per i documenti: delegata a `docFactory.isDefinitiveExportReady()`.
  - Per Tabella 15: delegata a `tabella15Data.isArithmeticExportReady`.
- **Modulistica Amministrativa:**
  - *Fondo VALID e completo:*
    - Bottone primario: `"Genera Determina Definitiva (PDF)"` -> `handleExportDefinitiveDeterminaPDF`
    - Bottone secondario: `"Determina Definitiva (TXT)"` -> `handleExportDefinitiveDeterminaTXT`
    - Bottone secondario: `"Relazione Tecnica Definitiva"` -> `handleExportDefinitiveRelazioneTecnica`
    - Bottone secondario: `"Prospetto Definitivo"` -> `handleExportDefinitiveProspetto`
    - Bottone aggiuntivo: `"Scarica Bozza (PDF)"` -> `handlePreviewDraftDeterminaPDF`
  - *Fondo Bozza / In Istruttoria / Prerequisiti mancanti:*
    - Bottone primario: `"Scarica Bozza Determina (PDF)"` -> `handlePreviewDraftDeterminaPDF`
    - Bottone secondario: `"Bozza Determina (TXT)"` -> `handlePreviewDraftDeterminaTXT`
    - Bottone secondario: `"Bozza Relazione Tecnica"` -> `handlePreviewDraftRelazioneTecnica`
    - Bottone secondario: `"Bozza Prospetto"` -> `handlePreviewDraftProspetto`
    - Bottone disabilitato: `"Determina Definitiva (Bloccata)"` con `disabled={true}` e tooltip esplicativo.
- **Tabella 15:**
  - Titolo: `"Tabella 15 del Conto Annuale (Riconciliazione Tecnica)"`.
  - Avviso: `"Schema RGS/SICO annuale non verificato — file non validato per trasmissione ministeriale. Utilizzabile esclusivamente per riconciliazione interna."`
  - *Quadratura completata:*
    - `"Scarica Riconciliazione Definitiva (XLS)"` -> `handleExportDefinitiveTabella15XLS`
    - `"Scarica Riconciliazione Definitiva (CSV)"` -> `handleExportDefinitiveTabella15CSV`
  - *Quadratura non completata / Fondo in istruttoria:*
    - `"Scarica Prospetto Tecnico Provvisorio (XLS)"` -> `handlePreviewDraftTabella15XLS`
    - `"Scarica Prospetto Tecnico Provvisorio (CSV)"` -> `handlePreviewDraftTabella15CSV`
    - `"Export Definitivo (Bloccato)"` con `disabled={true}`.

### 4.4 Ispezione di `src/pages/Tabella15Page.tsx`
Verificato integralmente:
- La pagina è esclusivamente una visualizzazione a schermo (`Table`) con avvisi di tracciabilità canonica e stato schema `RGS_SCHEMA_UNVERIFIED`.
- Non contiene pulsanti di download autonomi o azioni di export che possano bypassare `reportService`.
- Non dichiara in nessun punto la compatibilità "SICO-ready".

---

## 5. Suite di Test di Wiring (W1 - W11)

È stata creata la suite di test permanente [`src/logic/calculation/__tests__/wave3UiWiring.test.tsx`](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/logic/calculation/__tests__/wave3UiWiring.test.tsx), che verifica tutti gli 11 casi richiesti:

| Test ID | Caso Verificato | Esito |
| :--- | :--- | :--- |
| **W1** | ReportsPage / Fondo VALID: export definitivo presente e consentito con wrapper | **PASS** |
| **W2** | ReportsPage / UNDETERMINED: definitivo bloccato/disabilitato, solo bozza consentita | **PASS** |
| **W3** | canonicalFund assente: definitivo bloccato, solo anteprima legacy permessa | **PASS** |
| **W4** | Mapping RGS unresolved: XLSX/CSV definitivi rigorosamente bloccati da guardrail | **PASS** |
| **W5** | Arithmetic ready / RGS unverified: nessuna etichetta SICO-ready in UI o testo | **PASS** |
| **W6** | Handler XLS: ReportsPage invoca solo metodi con modalità esplicita | **PASS** |
| **W7** | Handler CSV: ReportsPage invoca solo metodi con modalità esplicita | **PASS** |
| **W8** | Determina definitiva: invoca `exportDefinitiveDetermina()` con guardrail | **PASS** |
| **W9** | Determina PDF definitiva: invoca `exportDefinitiveDeterminaPDF()` con guardrail | **PASS** |
| **W10** | Relazione definitiva: invoca `exportDefinitiveRelazioneTecnica()` con guardrail | **PASS** |
| **W11** | Prospetto definitivo: invoca `exportDefinitiveProspetto()` con guardrail | **PASS** |

---

## 6. Risultati dei Quality Gates

Tutti i controlli di qualità richiesti sono stati eseguiti con successo:

```
1. Git Preflight & Diff Check
   git diff --check: PASS (0 errori, exit 0)

2. TypeScript Typecheck
   npx tsc --noEmit: PASS (0 errori, exit 0)

3. Test Suite Completa (Vitest)
   npm test -- --run
   Risultato:
   Test Files: 101 passed (101)
   Tests:      1051 passed (1051)
   Failures:   0

4. Regression Test Suite
   npx vite-node scripts/run_regression_tests.ts
   Risultato: 8/8 superati (100%)

5. Wave 2 Oracle Suite
   npx vite-node scripts/run_wave2_oracle.ts
   Risultato: 14/14 superati (100%)

6. Production Build
   npm run build: Successo (dist/ generato in 27.79s)
```

---

## 7. File Modificati nella Sessione

- `src/services/documents/documentFactory.ts`: Aggiunti metodi espliciti `previewDraft*()`.
- `src/services/reportService.ts`: Aggiunti `exportDefinitiveTabella15XLS`, `exportDefinitiveTabella15CSV`, `previewDraftTabella15XLS`, `previewDraftTabella15CSV`, e rafforzato `assertDefinitiveTabella15ExportAllowed`.
- `src/logic/calculation/tabella15Mapper.ts`: Reso null-safe l'accesso a `fondi` e `metadata` nei fallback mock.
- `src/pages/ReportsPage.tsx`: Cablati tutti gli handler UI su entry point espliciti e separate nettamente le azioni Bozza e Definitivo.
- `src/logic/calculation/__tests__/wave3UiWiring.test.tsx`: Nuova suite permanente di test di wiring W1-W11.

---

## 8. Verdetto Finale

Tutti i finding della Wave 3, incluso il residuo di wiring UI `W3-WB-001`, sono stati completamente risolti e verificati end-to-end senza alcuna regressione.

**VERDETTO:** `WAVE3_FINAL_WIRING_READY_FOR_REVIEW`
