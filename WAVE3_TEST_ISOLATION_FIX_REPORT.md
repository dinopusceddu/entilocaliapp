# WAVE 3 — TEST ARTIFACT ISOLATION FIX REPORT

Data: 24 Settembre 2026\
Autore: Lead Engineer / System Architect\
Ambito: Risoluzione esclusiva della collisione concorrente tra artefatti di test (Wave 3 Consolidation Blocker)\
Verdetto: **`WAVE3_TEST_ISOLATION_READY_FOR_CONSOLIDATION`**

---

## 1. Baseline e Ambiente

| Parametro | Valore |
|---|---|
| Repository | `dinopusceddu/entilocaliapp` |
| Branch | `ux/toolbox-area-fondo-prototype` |
| HEAD atteso e osservato | `fa0480139d76e938c5ca02312632f698c0acb506` |
| Modifiche codice applicativo | **0 file modificati** (perimetro applicativo intatto) |
| File test modificati | 2 file test permanenti (`wave3UiWiring.test.tsx`, `wave3HardeningEvidence.test.ts`) |
| Operazioni Git eseguite | Nessun commit, nessun push, nessuna PR, nessun merge, nessun deploy, nessun reset/stash |

---

## 2. Collisioni Identificate e Root Cause Verificata

### 2.1. Diagnosi Autonoma della Race Condition
Nel corso del gate di consolidamento precedente, l'esecuzione parallela di Vitest su 101 file ha prodotto un fallimento intermittente in `wave3UiWiring.test.tsx`:

```text
FAIL src/logic/calculation/__tests__/wave3UiWiring.test.tsx
MG1 — VALID + previewDraftDeterminaPDF()
ENOENT: no such file or directory, unlink '.../Determina_BOZZA_2026.pdf'
at wave3UiWiring.test.tsx:402
```

L'analisi dell'harness e del runtime ha accertato la seguente dinamica deterministica di collisione:

1. **Destinazione condivisa sul filesystem:**\
   In ambiente Node/Vitest, il metodo `save(filename)` di `jsPDF` (`node_modules/jspdf/dist/jspdf.node.js`) effettua `fs.writeFileSync(filename, buffer)`. Poiché i file di produzione (`pdfDeterminaService.ts`) specificano esclusivamente nomi relativi non qualificati (`Determina_BOZZA_2026.pdf` e `Determina_Costituzione_Fondo_2026.pdf`), l'I/O fisico avveniva nella working directory radice del repository (`process.cwd()`).

2. **Interferenza concorrente tra suite:**\
   - `wave3UiWiring.test.tsx` (test `MG1`, `MG5`, `MG7`, `P1/P2`, oltre a `W9`) generava i PDF nella root e poi eseguiva `await fs.promises.unlink(path.resolve(...))`, mentre nei propri hook di lifecycle `beforeEach` e `afterEach` eseguiva un cleanup indiscriminato sulla root con `fs.unlinkSync(path.resolve(f))`.
   - Contemporaneamente, `wave3HardeningEvidence.test.ts` (test `Scenario A`, anno 2026) invocava `generateDeterminaPDF(vm)` e la funzione helper `flushCapturedArtifacts('Scenario_A', 2026)`. Questa funzione iterava su `['Determina_Costituzione_Fondo_2026.pdf', 'Determina_BOZZA_2026.pdf']` nella cartella root: se trovava `Determina_BOZZA_2026.pdf` appena scritto da `MG1`, lo leggeva, lo spostava in `evidence_wave3_hardening/Scenario_A_Determina_BOZZA_2026.pdf` ed eseguiva `await fs.unlink(pdfPath)`.
   - Al momento in cui il test `MG1` terminava il parsing e tentava la cancellazione (`await fs.promises.unlink(draftPdfPath)`), il file era già stato rimosso o spostato dall'altra suite, provocando l'eccezione non gestita `ENOENT`.

3. **Riscontro oggettivo nel manifest:**\
   La prova regina della collisione risiedeva nel file `evidence_wave3_hardening/manifest.json`, dove per lo `scenarioA` (che doveva produrre unicamente il PDF definitivo) compariva anomalamente `Scenario_A_Determina_BOZZA_2026.pdf`, sottratto al test concorrente `MG1`.

---

## 3. Isolamento Prima / Dopo e File Modificati

Le modifiche sono state rigorosamente confinate alle due suite di test permanenti responsabili della collisione. Nessun file applicativo, formula contabile o template di produzione è stato toccato.

### 3.1. `src/logic/calculation/__tests__/wave3UiWiring.test.tsx`
- **Prima:**\
  I PDF venivano scritti nella root del repository via `process.cwd()`.\
  `beforeEach` e `afterEach` invocavano `fs.unlinkSync(path.resolve('Determina_BOZZA_2026.pdf'))` e `fs.unlinkSync(path.resolve('Determina_Costituzione_Fondo_2026.pdf'))`.\
  I test `MG1`, `MG5`, `MG7`, `P1/P2` leggevano ed eliminavano i file dalla root del progetto.
- **Dopo:**\
  1. Introdotto stato isolato `isolationState = vi.hoisted(() => ({ currentTestDir: '' }))`.
  2. Implementato mock specifico di `jspdf` per reindirizzare `save(filename)`: se `isolationState.currentTestDir` è impostato, il buffer PDF viene salvato in `path.join(isolationState.currentTestDir, path.basename(filename))`.
  3. In `beforeEach`, viene creata una directory temporanea univoca per singolo test tramite `fs.promises.mkdtemp(path.join(os.tmpdir(), 'wave3-ui-wiring-'))`.
  4. In `afterEach`, viene rimossa esclusivamente la cartella temporanea creata (`fs.promises.rm(isolationState.currentTestDir, { recursive: true, force: true })`), eliminando ogni manipolazione globale della root.
  5. Nei test `MG1`, `MG5`, `MG7`, `P1/P2`, i percorsi verificati usano `path.join(isolationState.currentTestDir, ...)`.

### 3.2. `src/logic/calculation/__tests__/wave3HardeningEvidence.test.ts`
- **Prima:**\
  `generateDeterminaPDF` generava i file fisici nella root. `flushCapturedArtifacts` scansionava la root del repository per prelevarli ed eliminarli.
- **Dopo:**\
  1. Introdotto stato isolato `isolationState = vi.hoisted(() => ({ tempPdfDir: '' }))`.
  2. Aggiunto mock di `jspdf` per deviare il salvataggio direttamente in `isolationState.tempPdfDir`.
  3. Nel `beforeAll`, creata una directory temporanea univoca dedicata alla suite tramite `fs.mkdtemp(path.join(os.tmpdir(), 'wave3-hardening-'))`.
  4. In `afterAll`, la directory temporanea viene distrutta in sicurezza.
  5. `flushCapturedArtifacts` legge e cancella esclusivamente i PDF presenti nella propria `isolationState.tempPdfDir`, azzerando qualsiasi interazione con la root del repository o con i test concorrenti.

### 3.3. Test indipendenti (Codex)
Come prescritto dalla Sezione 7, `audit_wave3_independent/independent_wave3_review.test.ts` non è stato modificato: la totale assenza di scritture nella root da parte dei test permanenti ne previene qualsiasi potenziale interferenza.

---

## 4. Proprietà e Cleanup degli Artefatti

| Proprietà | Implementazione |
|---|---|
| Creazione directory | Antecedente alla generazione, via `fs.promises.mkdtemp(path.join(os.tmpdir(), ...))` |
| Associazione directory | Iniettata dinamicamente nel costruttore/istanza di salvataggio via mock trasparente |
| Nomi di produzione | Basename preservati al 100%: `Determina_BOZZA_2026.pdf` e `Determina_Costituzione_Fondo_2026.pdf` |
| Proprietà dell'I/O | Ogni suite/test legge, asserisce e rimuove unicamente gli artefatti presenti nella propria cartella temporanea |
| Cleanup radice | Eliminato qualsiasi `unlinkSync` o `rm` sulla root del repository |
| Post-execution leak | Zero file residui lasciati nel filesystem di lavoro o nella root Git |

---

## 5. Verifica dei Requisiti MG1–MG7 e P1/P2

Tutte le asserzioni di contenuto, presenza/assenza formule giuridico-amministrative e parsing visivo/strutturale PDF rimangono intatte ed eseguite su documenti PDF reali generati dinamicamente e decodificati con `pdfjs-dist`:

- **MG1:** Validato che `Determina_BOZZA_2026.pdf` contiene `[SCHEMA DI ATTO NON DEFINITIVO - BOZZA IN ISTRUTTORIA]`, contiene formula istruttoria `DI DARE ATTO, in sede istruttoria` e NON contiene `DI COSTITUIRE`.
- **MG2:** Validato testo bozza Determina.
- **MG3:** Validato testo bozza Relazione Tecnica con subtotale istruttorio e senza totale generale.
- **MG4:** Validato testo bozza Prospetto Contrattazione.
- **MG5:** Validato che `Determina_Costituzione_Fondo_2026.pdf` contiene `DI COSTITUIRE` e NON contiene banner bozza.
- **MG6:** Validato il blocco rigoroso di tutti i 4 wrapper definitivi per fondo `UNDETERMINED`.
- **MG7:** Validato che con fondo `UNDETERMINED` tutti i wrapper producono semantica di bozza.
- **P1/P2:** Flusso reale di interazione React `ReportsPage`: il click su "Scarica Bozza (PDF)" genera fisicamente P1 con semantica bozza; il click su "Genera Determina Definitiva (PDF)" genera fisicamente P2 con formula costitutiva definitiva.

Esito esecuzione congiunta delle suite permanenti:
```bash
npx vitest run src/logic/calculation/__tests__/wave3UiWiring.test.tsx src/logic/calculation/__tests__/wave3HardeningEvidence.test.ts
# Esito: 2 file PASS, 26/26 test PASS (0 failure)
```

---

## 6. Risultati delle Due Esecuzioni Complete della Suite

Come prescritto dal protocollo di riproducibilità (Sezione 9), `npm test -- --run` è stato eseguito due volte consecutive come processi completamente distinti e indipendenti:

### Esecuzione 1
- **Comando:** `npm test -- --run`
- **File di test:** **101 passati su 101** (100%)
- **Test totali:** **1059 passati su 1059** (100%)
- **Fallimenti:** **0**
- **Durata:** 134.72s

### Esecuzione 2
- **Comando:** `npm test -- --run`
- **File di test:** **101 passati su 101** (100%)
- **Test totali:** **1059 passati su 1059** (100%)
- **Fallimenti:** **0**
- **Durata:** 133.55s

Nessun test è stato saltato, disabilitato o rimosso; i conteggi riflettono esattamente la baseline approvata dal gate indipendente precedente.

---

## 7. Esito dei Full Technical Gates

Tutti i cancelli tecnici di conformità sono stati eseguiti in sequenza con esito positivo:

| Cancello Tecnico | Comando | Esito | Dettaglio |
|---|---|:---:|---|
| **Git Whitespace Check** | `git diff --check` | **PASS** | Exit 0; soli avvisi informativi LF/CRLF |
| **Type Check** | `npx tsc --noEmit` | **PASS** | Exit 0; 0 errori di tipizzazione |
| **Full Vitest Suite** | `npm test -- --run` | **PASS** | 101/101 file PASS, 1059/1059 test PASS |
| **Production Build** | `npm run build` | **PASS** | Build Vite completata con successo |
| **Regression Tests** | `npx vite-node scripts/run_regression_tests.ts` | **PASS** | 8/8 casi superati |
| **Wave 2 Oracle** | `npx vite-node scripts/run_wave2_oracle.ts` | **PASS** | 14/14 controlli normativi superati |

---

## 8. Perimetro di Non Modifica e Rischi Residui

### Perimetro Rispettato
I seguenti moduli applicativi critici **non hanno subito alcuna alterazione**:
- `CanonicalFundLedger` (logica ledger e arrotondamenti al centesimo invariati);
- Formule normative Wave 2 (Art. 23, Art. 33, Art. 60, DL 25/2025 invariati);
- `DocumentProjection` e `documentPresenter`;
- `DocumentFactory` e `pdfDeterminaService`;
- Template amministrativi (`determinaTemplateV2`, `relazioneTecnicaTemplate`);
- Componenti UI `ReportsPage` e `Tabella15Page`;
- Servizio `reportService`;
- Definizione e mapping di `Tabella 15`;
- Metadati attestazioni Revisori e Giunta;
- Mapping e schema RGS/SICO (mantenuto isolato e dichiarato come non validato);
- Schema e migrazioni Supabase/DB (nessuna nuova migrazione introdotta).

### Rischi Residui
- **Rischio collisione concorrente artefatti:** **AZZERATO**. Nessun file viene più generato o letto nella working directory del repository.
- **Rischio regressione funzionale o documentale:** **ZERO**. L'intervento non ha toccato una sola riga di codice sorgente di produzione (`src/` applicativo invariato rispetto alla baseline autorizzata).

---

## 9. Verdetto Finale

**`WAVE3_TEST_ISOLATION_READY_FOR_CONSOLIDATION`**

Tutti i requisiti di isolamento, riproducibilità e integrità del codice sono stati soddisfatti. Non sono stati eseguiti commit, push, PR, merge o deploy.
