# Release Candidate Locale Pre-GitHub

**Data Audit**: 2026-05-08
**Stato Complessivo**: ✅ PRONTO PER COMMIT
**Versione Target**: Sprint B Closure (Baseline 2026)

## 1. Stato Git Locale

| Area | Esito |
|---|---|
| Branch corrente | `main` |
| File modificati | ~20 (Core Logic, UI, Presenters, Docs) |
| File nuovi | Audit docs, Regression scripts, 2026 Source files |
| File eliminati | `src/pages/FondoAccessorioDipendentePageHelpers.ts` (consolidato) |
| File non tracciati | `smoke.test.ts`, `temp_fundCalculations.ts` (da non committare) |

## 2. Modifiche Principali Consolidate

### Sprint B.1: Aggiornamento 2026 e CCNL 23.02.2026
- **Incremento 0,14%**: Calcolato sul Monte Salari 2021 (Art. 58 c.1).
- **Incremento 0,22%**: Gestito come risorsa variabile (Art. 58 c.2).
- **Arretrati 2024-2025**: Implementati come voce autonoma variabile (0,28%).
- **Conglobamento Indennità Comparto**: Implementata riduzione stabile basata su Tabella C.
- **D.L. 25/2025**: Integrazione calcolo incremento e limite 48%.

### Sprint B.2: Guida Normativa Contestuale
- **Centralizzazione**: Tutti i testi normativi sono in `src/logic/fundFieldDefinitions.ts`.
- **UI**: Rimozione testi hardcoded, uso di `NormativaPopover.tsx` in Costituzione e Distribuzione.
- **Coverage**: Copertura totale delle voci principali del fondo 2026.

### Sprint B.3: Stabilizzazione Alias e Anti-Doppio Conteggio
- **Alias D.L. 25/2025**: Risoluzione deterministica tra `st_incrementoDecretoPA` (legacy) e `st_incrementoDL25_2025` (canonica).
- **Prevenzione**: Logica in `fundCalculations.ts` che impedisce la doppia somma nei report e nel motore.

## 3. Esito Test e Build

| Comando | Esito | Dettaglio |
|---|---|---|
| `npx tsc --noEmit` | ✅ PASS | Nessun errore di tipo. |
| `npm run test` | ✅ PASS | 66/66 test passati (Vitest). |
| `scripts/run_regression_tests.ts` | ✅ PASS | Invarianza numerica confermata. |
| `scripts/verify_fixtures.ts` | ✅ PASS | 8/8 fixture valide. |
| `npm run build` | ✅ PASS | Bundle generato correttamente (~7.3MB). |

## 4. Smoke Test Finale (Browser)
- ✅ Login mock e selezione ente/anno 2026 funzionanti.
- ✅ Visualizzazione corretta incrementi CCNL 2026.
- ✅ Popover normativi visibili e coerenti su voci critiche.
- ✅ Generazione PDF report senza errori.

## 5. Rischi Residui e Note
- **Duplicazione File**: Rilevata presenza di `src/logic/fundCalculations.ts` e `src/logic/calculation/fundCalculations.ts`. Sebbene il sistema usi la seconda, si consiglia la rimozione della prima dopo il merge.
- **Performance**: Il bundle JS è superiore a 500kB (warning Vite). Non bloccante per l'uso interno.

---
**VERDETTO**: Il progetto è stabile, testato e pronto per la sincronizzazione con il repository remoto.
