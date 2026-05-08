# Checklist Pre-GitHub (Sprint B)

## 1. Integrità Codice
- [x] `npx tsc --noEmit` -> OK
- [x] `npm run test` -> OK (66/66)
- [x] `scripts/run_regression_tests.ts` -> OK
- [x] `scripts/verify_fixtures.ts` -> OK
- [x] `npm run build` -> OK

## 2. Dominio e Logica
- [x] Incremento 0,14% calcolato su MS 2021
- [x] Incremento 0,22% (variabile) implementato
- [x] Arretrati 24-25 implementati
- [x] Conglobamento indennità comparto 2026 implementato
- [x] Alias D.L. 25/2025 senza doppio conteggio
- [x] Limite 48% (D.L. 25/2025) verificato nel simulatore

## 3. UI e Guida
- [x] Guida centralizzata in `fundFieldDefinitions.ts`
- [x] Nessun testo normativo hardcoded nelle pagine
- [x] Popover visibili in Costituzione e Distribuzione
- [x] Guida specifica per Elevate Qualificazioni (EQ)

## 4. Documenti e Stampe
- [x] Tabella 15 mappata correttamente (S614 etc.)
- [x] Report PDF aggiornato con voci 2026
- [x] Determina aggiornata con richiami CCNL 2026

## 5. Pulizia e Sicurezza
- [x] .env escluso da git
- [x] Nessun token/password nel codice
- [x] File temporanei esclusi da git (`temp_`, `smoke.test.ts`)
- [x] Rimozione `FondoAccessorioDipendentePageHelpers.ts`

---
**STATO FINALE**: 100% PRONTO.
