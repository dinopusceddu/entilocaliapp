# Mappatura Guida PDF - Sprint A

## Analisi della completezza normativa
L'analisi si basa sulla guida PDF `9788891682826 Giannotti 2026.pdf` e sul documento di sintesi `Verifica Fondo Salario Accessorio Enti Locali.md`.

### Tabella di Corrispondenza Normativa

| Voce / istituto | Riferimento guida | Regola sintetica | Campo app collegato | Stato copertura | Note |
|---|---|---|---|---|---|
| Incremento Stabile 0,14% | Art. 58, c. 1 CCNL 2026 | Incremento calcolato sullo 0,14% del Monte Salari 2021. Escluso dal limite Art. 23. | - | **mancante** | Nuova voce 2026. |
| Incremento Variabile 0,22% | Art. 58, c. 2 CCNL 2026 | Facoltà di incremento fino allo 0,22% del MS 2021. Escluso dal limite Art. 23. | - | **mancante** | Nuova voce 2026. |
| Arretrati 2024-2025 | Art. 58 CCNL 2026 | Le quote 2024-25 degli incrementi 0,14% e 0,22% confluiscono come variabili una tantum nel 2026. | - | **mancante** | Logica temporale specifica. |
| Riduzione Comparto | Art. 60, c. 2 CCNL 2026 | Riduzione stabile del fondo per conglobamento indennità comparto. | - | **mancante** | Voce di segno negativo. |
| Incremento D.L. 25/2025 | Art. 14, c. 1-bis D.L. 25/2025 | Facoltà di incremento fino al tetto del 48% (Stabile+EQ / Tabellare 2023). | - | **mancante** | Deroga strutturale al limite 2016. |
| Limite Art. 23 c. 2 | Art. 23 c. 2 D.Lgs 75/2017 | Il fondo non può superare il valore del 2016 (salvo deroghe). | `limite2016` | già coperto | Da aggiornare con nuove deroghe. |
| Performance (30%) | Art. 59 c. 2 CCNL 2026 | Almeno il 30% delle risorse variabili deve andare a "performance". | `verificaPerformance` | coperto parzialmente | Verificare se il target è "individuale" o generico. |
| Risorse RIA cessati | Art. 67 c. 2 lett. c CCNL 2018 | Somme liberate da cessazioni personale. | `riaCessati` | già coperto | |
| Quota 84,50 euro | Art. 79 c. 1 lett. b CCNL 2022 | Incremento basato su unità 2018. | `incremento84Euro` | già coperto | |

## Sintesi delle Regole Normative per lo Sprint B
1. **Basi di Calcolo**: Necessità di acquisire in modo strutturato il Monte Salari 2021 e la Spesa Tabellare 2023.
2. **Natura delle Voci**: Gli incrementi ex CCNL 2026 e D.L. 25/2025 sono **deroghe esplicite** al limite 2016.
3. **Logica di Riduzione**: La riduzione ex Art. 60 deve essere calcolata con precisione in base al personale destinatario alla data del conglobamento.
4. **Guida Contestuale**: Preparare popover che citino esplicitamente gli articoli sopra mappati.

## Stato copertura globale
L'applicazione copre bene lo storico fino al CCNL 2019-2021. La quasi totalità delle novità introdotte nel 2026 (CCNL 2022-2024 e D.L. 25/2025) risulta attualmente non implementata nel motore di calcolo e nella UI.
