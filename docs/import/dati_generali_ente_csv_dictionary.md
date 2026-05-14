# Dizionario Dati CSV — Importazione Dati Generali Ente

Questo documento descrive la struttura del file CSV per l'importazione automatica dei dati generali dell'ente e dei parametri di base per la costituzione del fondo.

## Specifiche del File
- **Formato**: CSV
- **Separatore**: `;` (punto e virgola)
- **Codifica**: UTF-8
- **Decimali**: `.` (punto)

## Colonne del CSV

| Nome Colonna | Descrizione | Tipo Dato | Formato | Obbligatorio | Esempio | Destinazione App |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `anno` | Anno di riferimento del fondo | Intero | YYYY | Sì | 2026 | `annualData.annoRiferimento` |
| `denominazione_ente` | Nome ufficiale dell'ente | Stringa | Testo | Sì | Comune di Milano | `annualData.denominazioneEnte` |
| `tipologia_ente` | Tipologia amministrativa | Enum | COMUNE, PROVINCIA, REGIONE, UNIONE_COMUNI, ALTRO | Sì | COMUNE | `annualData.tipologiaEnte` |
| `numero_abitanti` | Abitanti al 31.12 anno prec. | Intero | Numero | Sì* | 15000 | `annualData.numeroAbitanti` |
| `has_dirigenza` | Presenza di personale dirigente | Boolean | true / false | Sì | false | `annualData.hasDirigenza` |
| `monte_salari_2021` | Monte salari anno 2021 | Decimale | 0.00 | Sì | 500000.00 | `ccnl2024.monteSalari2021` |
| `fondo_personale_2016`| Fondo stabili personale 2016 | Decimale | 0.00 | Sì | 120000.00 | `historicalData.fondoSalarioAccessorio...2016` |
| `fondo_eq_2016` | Fondo EQ (ex PO) 2016 | Decimale | 0.00 | Sì | 15000.00 | `historicalData.fondoElevateQualificazioni2016` |
| `fondo_dirigenza_2016`| Fondo Dirigenza 2016 | Decimale | 0.00 | Sì* | 50000.00 | `historicalData.fondoDirigenza2016` |
| `risorse_segretario_2016`| Risorse Segretario 2016 | Decimale | 0.00 | Sì | 12000.00 | `historicalData.risorseSegretarioComunale2016` |
| `fondo_straordinario_2016`| Fondo Lavoro Straordinario 2016 | Decimale | 0.00 | Sì | 10000.00 | `annualData.fondoLavoroStraordinario` |
| `fondo_personale_2018`| Fondo stabile personale 2018 | Decimale | 0.00 | Sì | 115000.00 | `historicalData.fondoPersonaleNonDirEQ2018_Art23` |
| `fondo_eq_2018` | Fondo EQ 2018 | Decimale | 0.00 | Sì | 14000.00 | `historicalData.fondoEQ2018_Art23` |
| `personale_fte_2018` | Personale FTE al 31.12.2018 | Decimale | 0.00 | Sì | 12.5 | `annualData.manualDipendentiEquivalenti2018` |
| `stipendi_tabellari_2023`| Spesa stipendi tabellari 2023 | Decimale | 0.00 | Sì | 1500000.00 | `annualData.simulatoreInput.simStipendiTabellari2023` |
| `spesa_personale_2023`| Spesa totale personale 2023 | Decimale | 0.00 | Sì | 2000000.00 | `annualData.simulatoreInput.simSpesaPersonaleConsuntivo2023` |
| `media_entrate_correnti`| Media entrate correnti 21-23 | Decimale | 0.00 | Sì | 8000000.00 | `annualData.simulatoreInput.simMediaEntrateCorrenti2021_2023` |
| `tetto_spesa_l296` | Tetto spesa L. 296/06 | Decimale | 0.00 | Sì | 1800000.00 | `annualData.simulatoreInput.simTettoSpesaPersonaleL296_06` |
| `costo_assunzioni_piao`| Costo assunzioni PIAO a regime| Decimale | 0.00 | Sì | 70000.00 | `annualData.simulatoreInput.simCostoAnnuoNuoveAssunzioniPIAO` |

## Note di Validazione
1. **Campi Monetari**: Devono essere numeri positivi con massimo 2 cifre decimali.
2. **Boolean**: Accetta `true`/`false` (case-insensitive) o `1`/`0`.
3. **Enum**: Devono corrispondere esattamente ai valori indicati. In caso di errore, l'importazione dell'intera riga deve essere annullata.
4. **Obbligatorietà Condizionata**: `numero_abitanti` è obbligatorio se `tipologia_ente` è `COMUNE` o `PROVINCIA`. `fondo_dirigenza_2016` è obbligatorio se `has_dirigenza` è `true`.

---
*Dizionario dati completato per lo Sprint C.1.*
