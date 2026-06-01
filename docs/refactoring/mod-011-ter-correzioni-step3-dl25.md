# MOD-011-ter — Correzioni Puntuali Step 3 D.L. 25/2025

**Data:** 2026-05-20  
**Versione:** MOD-011-ter finale  
**Riferimento collaudo:** docs/refactoring/collaudo-manuale-mod-011-bis-step3-dl25.md

---

## Obiettivo

Rifinitura dello Step 3 "Incremento D.L. 25/2025" sulla base delle anomalie rilevate nel collaudo manuale MOD-011-bis. Non è una riscrittura generale: si tratta di correzioni puntuali a UI, logica di calcolo, tipi dati e catalogo lettera.

---

## File Modificati

### `src/logic/wizard2026/dl25Increment.ts`

**Tipo `Wizard2026Dl25Quote`**
- [ADD] `tipologiaEnteAderente?: string` — tipologia dell'ente aderente (es. Comune)
- [ADD] `hasAutorizzazioneCosfelAderente?: boolean` — autorizzazione COSFEL per ente aderente deficitario
- [ADD] `estremiAutorizzazioneCosfelAderente?: string` — estremi del provvedimento COSFEL ente aderente

**Tipo `Dl25IncrementInput`**
- [ADD] `altreRisorse2025DaSottrarre?: number` — componenti stabili 2025 aggiuntive da detrarre
- [ADD] `estremiParereRevisoriDl25?: string` — riferimento documentale parere revisori
- [ADD] `estremiAsseverazioneEquilibrioPluriennale?: string` — estremi del documento di asseverazione

**Tipo `Dl25IncrementResult`**
- [ADD] `risorse2025DaSottrarre?: number` — totale risorse detratte (fondo + EQ + altre)
- [ADD] `costoLordoIncrementoRichiesto?: number` — costo lordo ante riduzioni
- [ADD] `costoLordoIncrementoIscrivibile?: number` — costo lordo effettivo
- [ADD] `quotaNonIscrivibile?: number` — max(0, richiesto − iscrivibile)

**Funzione `calculateDl25Increment`**
- Formula risorse da detrarre aggiornata: `fondo2025 + budgetEq + altreRisorse`
- Calcolo `risorse2025DaSottrarre` incluso nel return
- Calcolo `costoLordoIncrementoRichiesto = applicato × coeffCosto`
- Calcolo `costoLordoIncrementoIscrivibile = incrementoApplicato × coeffCosto`
- Calcolo `quotaNonIscrivibile = max(0, applicato − incrementoApplicato)`

---

### `src/features/wizard2026/types.ts`

**`Wizard2026Dl25StepState`**
- [ADD] `estremiParereRevisoriDl25?: string`
- [ADD] `estremiAsseverazioneEquilibrioPluriennale?: string`
- [ADD] `altreRisorse2025DaSottrarre?: number`
- (I campi `documentazioneCosfelDl25?` e `baseCalcoloLimiteStorico?` già presenti)

---

### `src/features/wizard2026/steps/Step3Dl25.tsx`

**Anomalia B1 — Banner blocco istruttorio più esplicito**
- Il banner rosso ora elenca tutti i motivi specifici del blocco (dissesto, piano, equilibrio pluriennale, prima fascia, COSFEL No)
- Aggiunto `data-testid="blocco-istruttorio"` per testabilità

**Anomalia S5 — Warning visivo COSFEL mancante**
- Se `isStrutturalmenteDeficitario === true` e `hasApprovazioneCosfel === undefined` (e nessun blocco attivo), compare un box warning ambra ben visibile
- Aggiunto `data-testid="cosfel-missing-warning"`
- Non forza l'incremento a zero

**Anomalia B2 — Campo estremi autorizzazione COSFEL**
- Campo `documentazioneCosfelDl25` esposto come input di testo in Sezione 3, visibile solo se `isStrutturalmenteDeficitario === true`

**Anomalia D1 — Altre risorse 2025 da sottrarre**
- Campo numerico `altreRisorse2025DaSottrarre` aggiunto in Sezione 3, default `undefined`
- Incluso nella formula di calcolo e mostrato nella card "Risorse 2025 da Detrarre"

**Anomalia D2 — Estremi parere revisori e asseverazione equilibrio**
- Campo `estremiParereRevisoriDl25` testuale aggiunto in Sezione 3
- Campo `estremiAsseverazioneEquilibrioPluriennale` testuale aggiunto in Sezione 3
- Entrambi vengono riportati nel Quadro Documentale della Sezione 5

**Anomalia F1 — Base calcolo limite storico**
- Campo `baseCalcoloLimiteStorico` esposto come `<select>` con opzioni: media 2011-2013, anno 2008, altra base

**Anomalia F2 — Scostamento limite storico esplicito**
- Aggiunta riga "Scostamento dal limite storico" nel box Sezione 4, con sfondo rosso/verde a seconda del segno
- Aggiunto `data-testid="scostamento-limite-storico"`

**Anomalia G1 — Card "Quota non iscrivibile"**
- Card ambra mostrata nella Sezione 5 solo se `quotaNonIscrivibile > 0`
- Mostra l'importo e il motivo della riduzione
- Aggiunto `data-testid="quota-non-iscrivibile"`

**Anomalia G2 — Riepilogo sostenibilità nella Sezione 5**
- Aggiunte card: "Margine Sostenibilità", "Incremento Max Sostenibile", "Costo Lordo Richiesto", "Costo Lordo Iscrivibile"
- Mostrate solo se i valori sono presenti nel result

**Anomalia E1 — Costo lordo dell'incremento richiesto**
- Aggiunta tabella riepilogativa "Riepilogo Costi Stimati dell'Incremento" in Sezione 5 con entrambi i costi lordi e le aliquote applicate

**Anomalie H1, H2 — Tabella quote Unioni estesa**
- Aggiunta colonna "Tipologia" (campo `tipologiaEnteAderente`)
- Aggiunta colonna "COSFEL Ader." (bottoni Sì/No/Non espresso `hasAutorizzazioneCosfelAderente`)
- Test ID: `cosfel-aderente-{id}-yes` / `cosfel-aderente-{id}-no`

---

### `src/features/wizard2026/letters/wizard2026LetterCatalog.ts`

**Voci aggiunte per Step 3 (anomalie L1, L2, L3)**:

| Campo | Condizione di inclusione |
|---|---|
| `dl25.fcdeStanziato` | entityType === 'COMUNE' |
| `dl25.aliquotaOneriRiflessi` | DIRECTLY_APPLICABLE |
| `dl25.aliquotaIRAP` | DIRECTLY_APPLICABLE |
| `dl25.documentazioneCosfelDl25` | deficitario + DIRECTLY_APPLICABLE |
| `dl25.estremiParereRevisoriDl25` | DIRECTLY_APPLICABLE |
| `dl25.estremiAsseverazioneEquilibrioPluriennale` | DIRECTLY_APPLICABLE |
| `dl25.baseCalcoloLimiteStorico` | DIRECTLY_APPLICABLE |
| `dl25.altreRisorse2025DaSottrarre` | DIRECTLY_APPLICABLE |
| `dl25.quoteAderenti` | TRANSFER_ONLY (descrizione aggiornata) |

---

### Test aggiunti

**`src/logic/wizard2026/__tests__/dl25Increment.test.ts`** — nuovi test:
- MOD-011-ter A: `altreRisorse2025DaSottrarre` inclusa nella formula
- MOD-011-ter B: `altreRisorse = 0` equivale ad assenza campo
- MOD-011-ter C: `costoLordoIncrementoRichiesto` e `costoLordoIncrementoIscrivibile` calcolati correttamente
- MOD-011-ter D: `quotaNonIscrivibile = richiesto − iscrivibile` quando c'è riduzione
- MOD-011-ter E: `quotaNonIscrivibile = 0` quando richiesto ≤ iscrivibile
- MOD-011-ter F: incremento bloccato → `quotaNonIscrivibile = richiesto` e `iscrivibile = 0`

**`src/features/wizard2026/steps/__tests__/Step3Dl25.test.tsx`** — nuovi test:
- MOD-011-ter 1: Banner blocco con elenco motivi specifici
- MOD-011-ter 2: Motivo "dissesto" nel banner
- MOD-011-ter 3: Warning COSFEL mancante visibile (deficitario + COSFEL undefined)
- MOD-011-ter 4: Nessun warning COSFEL se `hasApprovazioneCosfel = true`
- MOD-011-ter 5: Campo COSFEL visibile solo se ente deficitario
- MOD-011-ter 6: Campo `altreRisorse2025DaSottrarre` e onChange
- MOD-011-ter 7: svuotamento campo → `undefined` (non zero)
- MOD-011-ter 8: Campo `estremiParereRevisoriDl25` e onChange
- MOD-011-ter 9: Campo `estremiAsseverazioneEquilibrioPluriennale` e onChange
- MOD-011-ter 10: `baseCalcoloLimiteStorico` come select
- MOD-011-ter 11: Scostamento limite storico visibile nella UI
- MOD-011-ter 12: Card "Quota non iscrivibile" mostrata solo se > 0
- MOD-011-ter 13: Card costi lordi nella Sezione 5
- MOD-011-ter 14: Tabella Unioni con colonne tipologia ente e COSFEL aderente
- MOD-011-ter 15: Mapping preview mutuamente esclusivo invariato

---

## Vincoli Rispettati

| Vincolo | Rispettato |
|---|---|
| Vecchio wizard legacy non modificato | ✅ |
| `fundEngine.ts` non modificato | ✅ |
| Costituzione Fondo legacy non modificata | ✅ |
| Nessuna scrittura su Supabase | ✅ |
| Nessuna scrittura su localStorage | ✅ |
| Trasferimento finale dati rimasto disabilitato | ✅ |
| `DataEntryPage.tsx` non modificata | ✅ |
| `FondoAccessorioDipendentePage.tsx` non modificata | ✅ |
| Logica dati mancanti ≠ zero preservata | ✅ |
| Blocchi normativi invariati | ✅ |
| Riduzione sostenibilità e limite storico invariati | ✅ |
| Mapping preview mutuamente esclusivo invariato | ✅ |
| Palette FP CGIL Lombardia rispettata | ✅ |
