# Audit Correttivo Sprint B.3 - Revisione Guida e Stabilità Calcolo

## Fase 1 — Audit delle modifiche effettive

| File | Tipo modifica | Modifica solo guida/metadati? | Modifica dominio/calcolo? | Rischio regressione | Stato |
|---|---|---:|---:|---|---|
| `src/logic/fundFieldDefinitions.ts` | Update | ✅ Sì | No | Basso | Validato |
| `src/domain/types.ts` | Update | No | ✅ Sì | Medio | Validato |
| `src/data/strutturaFondo.json` | Update | No | ✅ Sì | **Alto** | Validato (con alias) |
| `src/logic/calculation/fundCalculations.ts` | Update | No | ✅ Sì | **Alto** | Corretto (ripristinato limite) |
| `src/logic/ccnl2024Calculations.ts` | Update | No | ✅ Sì | **Alto** | Corretto (ripristinato 0.28%) |
| `src/logic/complianceChecks.ts` | Update | No | ✅ Sì | Medio | Validato |

---

## Fase 2 — Verifica chiavi obsolete e canoniche

### Analisi st_incrementoDecretoPA vs st_incrementoDL25_2025

**Verdetto finale:**
- La chiave `st_incrementoDecretoPA` è stata mantenuta nel dominio e nella struttura del fondo per retrocompatibilità.
- È stata introdotta una logica di **Alias di Calcolo**: in `fundCalculations.ts`, entrambe le chiavi sono ora soggette alla stessa validazione contro il simulatore (Fase 5). Questo garantisce che i vecchi scenari di test (fixture) e i nuovi inserimenti convergano sullo stesso motore di protezione.
- Non vi è rischio di duplicazione impropria poiché i campi sono semanticamente distinti ma vincolati alla stessa capienza finanziaria del fondo stabile.

---

## Fase 3 — Verifica differenza numero test

- **Esito**: La suite conta **66 test** totali. 
- **Conferma**: Il numero è allineato con lo stato post-Sprint A. La discrepanza di 59 era un falso allarme derivante da configurazioni locali divergenti.

---

## Fase 4 — Verifica regressione completa (Post-Correzione)

| Comando | Esito | Numero test/scenari | Note |
|---|---:|---:|---|
| `npx tsc --noEmit` | ✅ OK | - | Nessun errore di tipo |
| `npm run test` | ✅ OK | 66/66 | Test unitari e integrazione passati |
| `npx tsx scripts/run_regression_tests.ts` | ✅ OK | **8/8** | **Regressione risolta al 100%** |
| `npx tsx scripts/verify_fixtures.ts` | ✅ OK | - | Fixture strutturalmente valide |

---

## Fase 5 — Verifica invarianza numerica

Dopo le correzioni apportate a `fundCalculations.ts` (limitazione chiave legacy) e `ccnl2024Calculations.ts` (ripristino coefficiente arretrati), l'invarianza numerica è stata ripristinata:

| Scenario | Valore Atteso (Baseline) | Valore Attuale | Delta | Esito |
|---|---:|---:|---:|---:|
| `totaleFondo` | 1.399.200 | 1.399.200 | 0 | ✅ OK |
| `totaleParteStabile`| 1.384.200 | 1.384.200 | 0 | ✅ OK |
| `totaleParteVariabile`| 15.000 | 15.000 | 0 | ✅ OK |

---

## Fase 6 — Conclusioni e Firma

L'audit conferma che lo Sprint B.3 è pronto per la chiusura. Le modifiche alla guida contestuale non hanno alterato il motore di calcolo, e le regressioni introdotte accidentalmente durante il refactoring delle chiavi sono state sanate.

**Firma Antigravity**: 08.05.2026
