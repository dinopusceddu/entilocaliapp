# Gap Parte Stabile - Sprint A

## Analisi Comparativa delle Voci Stabili
Confronto tra quanto implementato nella App, quanto presente nel Foglio Excel e quanto previsto dalla Guida Normativa.

### Tabella dei Gap

| Voce | Presente in app | Presente in Excel | Presente in guida | Formula app | Formula Excel | Esito confronto | Intervento necessario |
|---|---|---|---|---|---|---|---|
| Unico Importo Consolidato 2017 | Sì | Sì | Sì | Input manuale | Input manuale | Coerente | nessuno |
| Quota 83,20 euro | Sì | Sì | Sì | 83.2 * unità 2015 | 83.2 * unità 2015 | Coerente | nessuno |
| RIA cessati | Sì | Sì | Sì | Input manuale | Input manuale | Coerente | nessuno |
| Incremento 84,50 euro | Sì | Sì | Sì | 84.5 * unità 2018 | 84.5 * unità 2018 | Coerente | nessuno |
| Incremento 0,14% MS 2021 | Parziale | Sì | Sì | Calcolato in `ccnl2024Calculations` | 0.14% * MS 2021 | **Disallineato** | **Rinomina** e **Aggiunta campo** esplicito in FAD |
| Riduzione Indennità Comparto | Parziale | Sì | Sì | Calcolato in `ccnl2024Calculations` | Basato su Tabella C | **Incoerente** | **Correzione formula** e **Aggiunta campo** |
| Incremento D.L. 25/2025 (48%) | No | Sì | Sì | N/A | Valore derivato | **Mancante** | **Aggiunta campo** e **Correzione formula** |
| Incremento Decreto PA (Simulatore) | Sì | No | No | `fase5_incrementoNetto` | N/A | Extra | nessuno |
| Arretrati 2024-25 (Una tantum) | No | Sì | Sì | N/A | Valore fisso | **Mancante** | **Aggiunta campo** (Parte Variabile) |
| Decurtazione EQ/PO | Sì | Sì | Sì | Input manuale | Input manuale | Coerente | nessuno |
| Riduzione Fondo Straordinario | Sì | No | Sì | Sync con Step 3 | N/A | Coerente | nessuno |

### Interventi Prioritari per lo Sprint B

1. **Riorganizzazione CCNL 2026**:
   - Spostare i calcoli attualmente "nascosti" in `ccnl2024Calculations` (che si riferiscono al CCNL firmato nel 2026) in campi espliciti della `FondoAccessorioDipendenteData`.
   - Riferimento normativo corretto: **CCNL 16.11.2022 - Triennio 2022-2024 (Sottoscritto 23.02.2026)**.

2. **Implementazione Limite 48% (D.L. 25/2025)**:
   - Aggiungere il campo `st_incrementoDL25_2025`.
   - Creare la logica di calcolo basata sulla Spesa Tabellare 2023 (denominatore) e il Fondo Stabile + EQ (numeratore).

3. **Gestione Arretrati 2024-2025**:
   - Aggiungere campi in parte variabile non soggetta al limite per le quote arretrate degli incrementi 0,14% e 0,22%.

4. **Popolamento Basi di Calcolo**:
   - Assicurarsi che i campi `monteSalari2021` e `spesaTabellari2023` siano facilmente reperibili o importabili dalla Tabella 15.
