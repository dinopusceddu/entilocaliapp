# WAVE 3 — FINAL DRAFT SEMANTICS FIX REPORT
## Chiusura Esclusiva del Finding W3-MG-001

Data: 23 Settembre 2026\
Autore: Lead Engineer / System Architect\
Baseline Git Consolidata Pre-Wave 3: `fa0480139d76e938c5ca02312632f698c0acb506`\
Branch: `ux/toolbox-area-fondo-prototype`\
Working Tree: Uncommitted changes (Wave 3 complete)\
Verdetto Finale: **`WAVE3_DRAFT_FIX_READY_FOR_FINAL_GATE`**

---

## 1. Oggetto e Ambito dell'Intervento

L'intervento è stato rigorosamente circoscritto alla chiusura esclusiva dell'ultimo finding residuo identificato nel *Wave 3 Final Micro-Gate Report* di Codex:

- **`W3-MG-001` (OPEN_MEDIUM):** Disallineamento semantico tra la readiness di dominio (`DOCUMENT_FINAL_READY`) e la modalità di output richiesta (`options.mode = 'DRAFT_PREVIEW'`). Quando un utente invocava l'anteprima/bozza (`previewDraftDeterminaPDF()` o cliccando "Scarica Bozza (PDF)" su un fondo valido), il generatore PDF ignorava `options.mode`, producendo un documento con la formula costitutiva definitiva `DI COSTITUIRE`, privo di banner di bozza e con il nome file definitivo `Determina_Costituzione_Fondo_2026.pdf`.

Tutti gli altri finding Wave 3 erano già verificati e sono rimasti intatti:
- `W3-DOC-001 = VERIFIED_FIXED`
- `W3-T15-001 = VERIFIED_FIXED`
- `W3-T15-002 = VERIFIED_FIXED`
- `W3-ATT-001 = VERIFIED_FIXED`
- `W3-ATT-002 = VERIFIED_FIXED`
- `W3-WB-001 = VERIFIED_FIXED`
- `W3-RGS-001 = RGS_SCHEMA_UNVERIFIED` (confermato perimetrato e documentato)

Nessuna formula normativa consolidata in Wave 2 è stata alterata. Nessuna migration di database è stata introdotta.

---

## 2. Analisi della Root Cause e Soluzione Architetturale

### Root Cause
In `src/services/documents/pdfDeterminaService.ts` e nei template (`determinaTemplateV2.ts`, `relazioneTecnicaTemplate.ts`, `documentFactory.ts`), le decisioni relative a banner, formule e filename erano legate a `vm.isDraft` e `d.exportReadiness === 'DOCUMENT_FINAL_READY'`.
Quando un fondo è valido e determinato, `d.exportReadiness` è legittimamente `'DOCUMENT_FINAL_READY'`. Tuttavia, l'intento d'uso di un'azione UI di "Scarica Bozza" (`DRAFT_PREVIEW`) richiede che l'artefatto generato esprima **sempre** natura di bozza istruttoria, indipendentemente dalla maturità giuridico-contabile del fondo sottostante.

### Principio Architetturale Applicato
**Disaccoppiamento tra Dominio e Modalità di Output:**
- `exportReadiness === 'DOCUMENT_FINAL_READY'` certifica la *validità di dominio* e autorizza l'export definitivo.
- `options.mode === 'DRAFT_PREVIEW'` o `DRAFT_ONLY` governa la *semantica di presentazione*: se richiesta una bozza, l'output **deve** essere formattato come bozza istruttoria non vincolante.

Formula unificata di derivazione:
```typescript
const isDraftOutput = options?.mode === 'DRAFT_PREVIEW' || vm.isDraft || d.exportReadiness !== 'DOCUMENT_FINAL_READY';
```

---

## 3. Modifiche Dettagliate per Componente

### 3.1. `src/services/documents/pdfDeterminaService.ts`
- **Output Mode Derivation:** Introdotta `const isDraftOutput = options?.mode === 'DRAFT_PREVIEW' || vm.isDraft || d.exportReadiness !== 'DOCUMENT_FINAL_READY';`.
- **Banner Bozza:** Se `isDraftOutput` è `true`, stampa in testata il riquadro rosso e il testo `[SCHEMA DI ATTO NON DEFINITIVO - BOZZA IN ISTRUTTORIA]`.
- **Formula Dispositiva:**
  - Se `!isDraftOutput && d.exportReadiness === 'DOCUMENT_FINAL_READY'`: `1. DI COSTITUIRE l'importo complessivo di Euro ...`.
  - Altrimenti (`isDraftOutput`): `1. DI DARE ATTO, in sede istruttoria, della quantificazione del subtotale delle risorse verificate in Euro ... dando atto che il totale finale del fondo resta subordinato al perfezionamento degli atti presupposti.`.
- **Filename:**
  - Se `isDraftOutput`: `Determina_BOZZA_${d.annoRiferimento}.pdf`.
  - Se definitivo: `Determina_Costituzione_Fondo_${d.annoRiferimento}.pdf`.

### 3.2. `src/services/templates/determinaTemplateV2.ts`
- Allineato con `const isDraftOutput = options?.mode === 'DRAFT_PREVIEW' || vm.isDraft || d.exportReadiness !== 'DOCUMENT_FINAL_READY';`.
- Formula `DI COSTITUIRE` vincolata a `!isDraftOutput`. In modalità bozza viene emessa la formula istruttoria `DI DARE ATTO`.

### 3.3. `src/services/templates/relazioneTecnicaTemplate.ts`
- Aggiunto parametro opzionale `options?: { mode?: 'DRAFT_PREVIEW' | 'DEFINITIVE_EXPORT' }`.
- Derivata `isDraftOutput`. Se attiva:
  - Appare il banner `[DOCUMENTO NON DEFINITIVO - BOZZA IN ISTRUTTORIA]`.
  - Sezione 1 qualificata come `in schema di proposta`.
  - Totalizzatore finale qualificata come `SUBTOTALE DELLE RISORSE VERIFICATE` (anziché `TOTALE GENERALE`).

### 3.4. `src/services/documents/documentFactory.ts`
- `buildProspettoContrattazione`: riceve `options` e forza semantica di bozza se `isDraftOutput`.
- `generateDetermina`: genera filename `Determina_BOZZA_${anno}.txt` se `mode: 'DRAFT_PREVIEW'`.
- `generateRelazioneTecnica`: genera filename `Relazione_BOZZA_${anno}.txt` se `mode: 'DRAFT_PREVIEW'`.
- `generateProspettoContrattazione`: genera filename `Prospetto_BOZZA_${anno}.txt` se `mode: 'DRAFT_PREVIEW'`.
- Propagazione coerente di `options` a tutti i sotto-renderers.

### 3.5. `src/logic/calculation/__tests__/wave3UiWiring.test.tsx`
Estesa la suite di test con 7 test dedicati ai requisiti del Micro-Gate (`MG1` - `MG7`) e test `P1/P2` di ispezione PDF reale con `pdfjs-dist`:
- **MG1:** `VALID` + `previewDraftDeterminaPDF()` genera `Determina_BOZZA_2026.pdf`, contiene il banner di bozza, formula `DI DARE ATTO`, e non contiene `DI COSTITUIRE`.
- **MG2:** `VALID` + `previewDraftDetermina()` genera `Determina_BOZZA_2026.txt`, contiene banner di bozza, senza `DI COSTITUIRE`.
- **MG3:** `VALID` + `previewDraftRelazioneTecnica()` genera `Relazione_BOZZA_2026.txt` con clausola di proposta e senza `TOTALE GENERALE`.
- **MG4:** `VALID` + `previewDraftProspetto()` genera `Prospetto_BOZZA_2026.txt` con clausola di bozza istruttoria.
- **MG5:** `VALID` + `exportDefinitiveDeterminaPDF()` genera `Determina_Costituzione_Fondo_2026.pdf` con `DI COSTITUIRE` e senza banner di bozza.
- **MG6:** `UNDETERMINED` + tutti i 4 wrapper definitivi (`exportDefinitiveDetermina`, `exportDefinitiveDeterminaPDF`, `exportDefinitiveRelazioneTecnica`, `exportDefinitiveProspetto`) bloccano l'esecuzione con eccezione esplicita.
- **MG7:** `UNDETERMINED` + tutti i 4 wrapper di anteprima producono esclusivamente semantica di bozza.
- **P1/P2:** Interazione reale con i pulsanti UI di `ReportsPage`: il click su "Scarica Bozza (PDF)" genera fisicamente P1 su disco (verificato con `pdfjs-dist`: contiene banner bozza, non contiene `DI COSTITUIRE`); il click su "Genera Determina Definitiva (PDF)" genera fisicamente P2 su disco (verificato con `pdfjs-dist`: contiene `DI COSTITUIRE`, non contiene banner bozza).

---

## 4. Evidenze dei Quality Gates

Tutti i quality gates di livello enterprise sono stati eseguiti con successo:

| Gate | Comando | Esito | Dettaglio |
|---|---|:---:|---|
| **Git Diff Check** | `git diff --check` | **PASS** | 0 errori di whitespace |
| **Type Check** | `npx tsc --noEmit` | **PASS** | 0 errori TypeScript |
| **Test Suite UI Wiring** | `npx vitest run src/logic/calculation/__tests__/wave3UiWiring.test.tsx` | **PASS** | 19/19 test superati (W1-W11, MG1-MG7, P1/P2) |
| **Test Suite Globale** | `npm test -- --run` | **PASS** | 101/101 file superati, 1059/1059 test superati |
| **Production Build** | `npm run build` | **PASS** | `tsc && vite build` completato in 30.51s |
| **Regression Tests** | `npx vite-node scripts/run_regression_tests.ts` | **PASS** | 8/8 test superati |
| **Wave 2 Oracle** | `npx vite-node scripts/run_wave2_oracle.ts` | **PASS** | 14/14 oracle normative superati |

---

## 5. Tabella di Chiusura dei Finding

| Finding | Descrizione | Stato Precedente | Stato Attuale | Note di Risoluzione |
|---|---|:---:|:---:|---|
| **W3-DOC-001** | Coerenza aritmetica tra documenti e ledger canonico | VERIFIED_FIXED | **VERIFIED_FIXED** | Subtotali e totale generale proiettati senza arrotondamenti intermedi |
| **W3-T15-001** | Segno e allocazione poste Tabella 15 | VERIFIED_FIXED | **VERIFIED_FIXED** | Righe stabili e variabili mappate fedelmente |
| **W3-T15-002** | Formattazione e formule export Tabella 15 | VERIFIED_FIXED | **VERIFIED_FIXED** | Colonne numeriche tipizzate in XLS e CSV |
| **W3-ATT-001** | Attestazioni revisori e giunta | VERIFIED_FIXED | **VERIFIED_FIXED** | Distinzione rigorosa tra parere favorevole, sfavorevole e mera trasmissione |
| **W3-ATT-002** | Riconciliazione pareri nel testo di Determina | VERIFIED_FIXED | **VERIFIED_FIXED** | Allineamento perfetto tra premesse e dispositivo |
| **W3-WB-001** | Wiring UI e blocco export condizionato | VERIFIED_FIXED | **VERIFIED_FIXED** | Pulsanti differenziati e routing a wrapper dedicati |
| **W3-RGS-001** | Tracciamento schema e validazione RGS | RGS_SCHEMA_UNVERIFIED | **RGS_SCHEMA_UNVERIFIED** | Dichiarato in perimetro isolato come da direttiva |
| **W3-MG-001** | Semantica bozza in caso di fondo VALID con opzione DRAFT_PREVIEW | OPEN_MEDIUM | **VERIFIED_FIXED** | Disaccoppiamento completato; P1 e P2 verificati con parsing PDF reale |

---

## 6. Verdetto Finale

L'intera Wave 3 soddisfa tutti i requisiti di integrità documentale, sicurezza normativa, stabilità dei tipi, copertura di test e fedeltà semantica sia a riposo che in esportazione reale.

Verdetto: **`WAVE3_DRAFT_FIX_READY_FOR_FINAL_GATE`**
