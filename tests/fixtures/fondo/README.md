# Fixtures del Fondo - entilocaliapp

> [!CAUTION]
> **Vincolo Operativo**: Tutte le operazioni di validazione e test devono avvenire esclusivamente sulla copia locale. Non eseguire `push` o `PR` verso il repository remoto prima della completa verifica locale.

In questa cartella sono raccolti scenari di test (fixture) rappresentativi di diverse configurazioni di enti e situazioni finanziarie. Queste fixture possono essere utilizzate per testare il motore di calcolo, la generazione di report e la conformità normativa.

## Struttura della directory

Ogni scenario è composto da:
- Un file `.json`: contiene lo stato completo dell'applicazione (`FundData`).
- Un file `.md`: descrive le caratteristiche e gli obiettivi dello scenario.

## Elenco Fixture

| Scenario | Descrizione |
| :--- | :--- |
| [ente-senza-dirigenza](ente-senza-dirigenza.md) | Ente piccolo senza personale dirigente. |
| [ente-con-dirigenza](ente-con-dirigenza.md) | Ente capoluogo con gestione completa della dirigenza. |
| [ente-con-eq](ente-con-eq.md) | Focus sulle Elevate Qualificazioni e incrementi specifici. |
| [ente-con-segretario](ente-con-segretario.md) | Focus sulla gestione del Segretario Comunale (CCNL 2024). |
| [caso-incremento-2025](caso-incremento-2025.md) | Simulazione degli stanziamenti per l'anno 2025. |
| [caso-superamento-tetto-art23](caso-superamento-tetto-art23.md) | Scenario di errore per superamento dei limiti 2016. |
| [caso-distribuzione-consuntivo](caso-distribuzione-consuntivo.md) | Certificazione dei risparmi e chiusura esercizio. |
| [caso-riporti-anno-precedente](caso-riporti-anno-precedente.md) | Gestione dell'avanzo vincolato dell'anno precedente. |

## Come validare i file
Per verificare che i file JSON siano coerenti con gli schemi dell'applicazione:

```bash
npx tsx scripts/verify_fixtures.ts
```

## Regression Tests (Baseline AG-002)
Per verificare che eventuali modifiche al codice non alterino i risultati dei calcoli per gli scenari noti:

```bash
# Esegue i test contro la baseline attuale
npx tsx scripts/run_regression_tests.ts

# Per aggiornare la baseline (se le modifiche sono intenzionali)
npx tsx scripts/generate_golden.ts
```

### Campi Coperti dalla Baseline
La baseline consolidata protegge i seguenti campi critici:
- **Totale Fondo** (Stabile, Variabile, Complessivo)
- **Limiti Art. 23 c. 2** (Limite modificato, ammontare soggetto, superamento)
- **Dettaglio per Sotto-fondo** (Dipendenti, EQ, Segretario, Dirigenza)
- **Warning Normativi** (ID e gravità, in ordine alfabetico)
