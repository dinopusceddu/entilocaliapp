# Documentazione Funzioni Pure — Wizard Istruttorio Fondo 2026

Nel rispetto della regola di transizione fondamentale, in questa fase sono state sviluppate le funzioni di calcolo e validazione del nuovo Wizard 2026 in un modulo isolato e puro (`src/logic/wizard2026/`).

## 1. File Creati

La struttura creata all'interno del progetto è la seguente:

```
src/logic/wizard2026/
├── types.ts                        # Tipi ed enum globali per il wizard 2026
├── checks.ts                       # Interfacce per il sistema di validazione (Wizard2026Check)
├── art23Limit.ts                   # Modulo di calcolo e verifica del limite Art. 23 c. 2 D.Lgs. 75/2017
├── dl25Increment.ts                # Modulo di calcolo incrementi e verifiche soggettive D.L. 25/2025
├── ccnl2026Increments.ts           # Modulo di calcolo incrementi 0,14% e 0,22% CCNL 23.02.2026
├── conglobamentoArt60.ts           # Modulo di calcolo decurtazione per conglobamento indennità di comparto
├── straordinarioIncrement.ts       # Modulo di calcolo e dimensionamento tetti lavoro straordinario
├── pnrrIncrement.ts                # Modulo di calcolo deroga massimale 5% per progettazione PNRR
├── index.ts                        # Barile di esportazione globale dei moduli
└── __tests__/                      # Suite di unit test isolata per ogni singola norma
    ├── art23Limit.test.ts
    ├── dl25Increment.test.ts
    ├── ccnl2026Increments.test.ts
    ├── conglobamentoArt60.test.ts
    ├── straordinarioIncrement.test.ts
    └── pnrrIncrement.test.ts
```

## 2. Funzioni ed Esportazioni Principali

Per ogni blocco normativo, il modulo esporta rigorosamente:
- Un'interfaccia di `Input` e una di `Result`.
- Una funzione di calcolo pura (`calculate...`).
- Una funzione di validazione pura (`validate...`) che restituisce un array di controlli `Wizard2026Check[]`.

### Elenco Funzioni
- **Art. 23:** `calculateArt23Limit`, `validateArt23Limit`
- **D.L. 25/2025:** `getDl25ApplicabilityStatus`, `calculateDl25Increment`, `validateDl25Increment`
- **CCNL 2026:** `calculateCcnl2026Increments`, `validateCcnl2026Increments`
- **Art. 60 (Conglobamento):** `calculateConglobamentoArt60`, `validateConglobamentoArt60`
- **Straordinario:** `calculateStraordinarioIncrement`, `validateStraordinarioIncrement`
- **PNRR (Art. 8):** `calculatePnrrIncrement`, `validatePnrrIncrement`

## 3. Formule Implementate

- **Ricostruzione Limite Art. 23:**
  $$\text{Limite Ricostruito} = \text{FondoDip2016} + \text{FondoEQ2016} + (\text{FondoDir2016 se presente}) + \text{RisorseSegretario2016} + \text{FondoStraord2016}$$
- **D.L. 25/2025:**
  $$\text{Soglia 48\%} = \text{StipendiTabellari2023NonDirigenti} \times 0.48$$
  $$\text{Incremento Massimo Teorico} = \max(0, \text{Soglia 48\%} - \text{FondoStabile2025Certificato} - \text{BudgetEQ2025})$$
- **CCNL 2026 (0,14% e 0,22%):**
  $$\text{Incremento 0.14\%} = \text{MonteSalari2021} \times 0.0014$$
  $$\text{Incremento 0.22\% Applicato} = (\text{MonteSalari2021} \times 0.0022) \times \frac{\text{Percentuale}}{100}$$
- **Conglobamento Art. 60:**
  $$\text{Riduzione Stabile} = \sum (\text{FTE}_{\text{Area}} \times \text{ImportoAnnuo}_{\text{Area}})$$
  *Importi annuali costanti: Funzionari/EQ € 435.96, Istruttori € 384.72, Operatori Esperti € 330.24, Operatori € 272.16.*
- **Lavoro Straordinario:**
  - *Enti con Dirigenza:* Incremento Ammesso = $\min(\text{Richiesto}, \text{Margine Art. 23})$
  - *Enti senza Dirigenza:* Richiesta subordinata a una pari o superiore riduzione permanente del fondo decentrato.
  - *Economie Anno Precedente:* Isolate e classificate come risorsa variabile una tantum, non consolidabile.
- **PNRR (5% Stabile 2016):**
  $$\text{Incremento Massimo} = \text{Stabile2016} \times 0.05$$
  Subordinato alla verifica dell'equilibrio di bilancio dell'ente.

## 4. Test Aggiunti

Le 6 suite di test verificate tramite Vitest coprono i casi limite e i requisiti normativi:
1. **`art23Limit.test.ts`:** Prevalenza del limite certificato sul ricostruito, corretta somma dei sotto-fondi 2016, calcolo del margine e segnalazione del superamento.
2. **`dl25Increment.test.ts`:** Mappatura soggettiva per tutte le 16 tipologie di ente, calcolo del tetto e capping per `DIRECTLY_APPLICABLE`, isolamento della quota per `TRANSFER_ONLY` e validazione degli atti collegati.
3. **`ccnl2026Increments.test.ts`:** Esattezza del calcolo millesimale, gestione del flag abilitativo dello 0,22% e validazione di percentuali fuori range.
4. **`conglobamentoArt60.test.ts`:** Riscontro decimale esatto della formula su FTE parziali, gestione di input vuoti o negativi.
5. **`straordinarioIncrement.test.ts`:** Capping dell'aumento sul margine art. 23, validazione stringente per enti senza dirigenza, gestione separata delle economie e delle risorse escluse.
6. **`pnrrIncrement.test.ts`:** Corretto tetto del 5%, inammissibilità in assenza di equilibrio finanziario.

## 5. Cosa è Rimasto Legacy e Non Toccato

In conformità al mandato architetturale, **nessun componente o file esistente è stato modificato**. In particolare:
- La UI in `src/pages/DataEntryPage.tsx`, i form avanzati e il vecchio wizard restano attivi e invariati.
- I moduli core `fundEngine.ts`, `fundCalculations.ts`, `ccnl2024Calculations.ts` e le logiche di calcolo attuali non hanno subito modifiche.
- Lo stato globale dell'applicazione (`fundData`, `fondoAccessorioDipendenteData`) e i relativi reducer non sono stati toccati.

## 6. Cosa Non è Ancora Collegato

- **Alla UI:** I nuovi moduli in `src/logic/wizard2026/` non sono ancora importati o invocati dai componenti visivi di React. Verranno collegati nel futuro `WizardIstruttorio2026` in modalità preview.
- **Alla Costituzione Fondo:** Nessun risultato generato da queste nuove funzioni viene inviato tramite dispatch allo store globale o a Supabase. Tali connessioni saranno attivate unicamente al termine della fase di collaudo e dietro esplicito consenso utente (trasferimento controllato).
