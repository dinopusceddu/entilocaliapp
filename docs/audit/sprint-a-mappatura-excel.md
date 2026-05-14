# Mappatura Excel - Sprint A

## Struttura del file Excel
Il file `Fondo risorse decentrate 2026 - foglio di calcolo.xlsx` è strutturato in un unico foglio principale (nel raw output denominato "Costituzione Fondo") che copre l'evoluzione storica e la proiezione al 2026.

### Caratteristiche principali:
- **Serie Storica**: Colonne per 2016, 2018, 2022, 2023, 2025 e 2026.
- **Sezioni**: Risorse stabili, Risorse variabili (soggette e non soggette al limite), Calcolo limiti, Riepilogo.
- **Riferimenti Normativi**: Citazioni puntuali del CCNL 2016-2018, 2019-2021 e del recentissimo CCNL 2022-2024 (pubblicato nel 2026) e D.L. 25/2025.

## Voci parte stabile individuate (Focus 2026)
1. **Unico Importo Consolidato 2017**: Base storica consolidata.
2. **Quota 83,20 euro (Art. 67 c. 2 lett. a)**: Personale in servizio al 31/12/2015.
3. **Differenziali Sviluppo (Art. 67 c. 2 lett. b)**: Storico.
4. **RIA e Assegni ad personam cessati (Art. 67 c. 2 lett. c)**: Incremento annuale basato sulle cessazioni.
5. **Incremento 84,50 euro (Art. 79 c. 1 lett. b CCNL 22)**: Basato su unità al 31/12/2018.
6. **Differenziali Sviluppo CCNL 19-21 (Art. 79 c. 1 lett. d)**.
7. **Incremento 0,14% Monte Salari 2021 (Art. 58 c. 1 lett. a CCNL 26)**: **[NUOVO 2026]**.
8. **Differenziali D3 e B3 (Art. 79 c. 1-bis)**.
9. **Riduzione Indennità Comparto (Art. 60 c. 2 CCNL 26)**: **[NUOVO 2026]** - Voce negativa (riduzione).
10. **Incremento Fondo D.L. 25/2025**: **[NUOVO 2026]** - Collegato al limite del 48%.
11. **Decurtazione Fondo EQ/PO**: Riduzione stabile per risorse destinate alle Elevate Qualificazioni.

## Formule rilevanti
- **Calcolo 0,14%**: `+C66 * 0.14%` dove C66 è il Monte Salari 2021.
- **Totale Risorse Fisse**: `+SUM(G6:G19)-G22+G21` (Somma voci stabili meno decurtazione EQ).
- **Verifica Limite 2016**: Confronto tra Totale Depurato (G53) e il valore del 2016 (C55).
- **Calcolo 48%**: (Componente Stabile + EQ) / Spesa Tabellare 2023.

## Verifiche presenti nel foglio
- **Rispetto Limite Art. 23 c. 2**: Calcolo automatico dell'eccedenza rispetto al 2016.
- **Deroghe al Limite**: Voci identificate come "fuori dal limite" (es. incrementi contrattuali recenti).
- **Riduzione Comparto**: Calcolo della riduzione basato sulle unità di personale (Row 6-15 della colonna specifica).

## Confronto preliminare con la app
- La app ha già una struttura solida per le voci storiche (Art. 67, Art. 79).
- Mancano i riferimenti espliciti al **CCNL 2026** (Art. 58, Art. 60) e al **D.L. 25/2025**.
- La logica del **48%** sembra non essere ancora implementata come controllo di conformità principale.

## Gap rilevati
- **Voci Mancanti**: Incremento 0,14%, Riduzione indennità comparto, Incremento D.L. 25/2025.
- **Logica**: La gestione degli arretrati 2024-2025 come variabili una tantum nel 2026.
- **UI**: Campi di input specifici per le basi di calcolo 2021 (Monte Salari) e 2023 (Spesa Tabellare).

## Tabella di Mappatura

| Voce Excel | Formula / logica Excel | Campo app corrispondente | Stato | Note |
|---|---|---|---|---|
| Unico Importo Consolidato | Valore storico | `unicoImportoConsolidato` | presente | Corrisponde. |
| Quota 83,20 euro | 83,20 * unità 2015 | `quota83Euro` | presente | |
| RIA cessati | Somma incrementi annuali | `riaCessati` | presente | |
| Incremento 84,50 euro | 84,50 * unità 2018 | `incremento84Euro` | presente | |
| Incremento 0,14% MS 2021 | 0,14% * MS 2021 | - | **assente** | Nuova voce CCNL 2026. |
| Riduzione Indennità Comparto | Valore negativo calcolato | - | **assente** | Nuova voce CCNL 2026. |
| Incremento D.L. 25/2025 | Valore derivato da limite 48% | - | **assente** | Nuova voce normativa. |
| Arretrati 2024-25 (0,14%) | Variabile una tantum | - | **assente** | Da gestire in parte variabile. |
| Decurtazione EQ/PO | Riduzione stabile | `decurtazionePO` | presente | Verificare se aggiornata. |
| Limite 2016 (Art. 23) | Confronto G55 vs C55 | `limite2016` | presente | Da aggiornare con nuove deroghe. |
