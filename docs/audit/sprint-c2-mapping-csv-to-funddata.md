# Mapping CSV -> FundData — Sprint C.2

Mappa dettagliata delle corrispondenze tra le intestazioni del file CSV e le chiavi del modello dati dell'applicazione.

| Intestazione CSV | Chiave Tecnica (Destinazione) | Path nel Modello |
| :--- | :--- | :--- |
| `anno` | `annoRiferimento` | `annualData.annoRiferimento` |
| `denominazione_ente` | `denominazioneEnte` | `annualData.denominazioneEnte` |
| `tipologia_ente` | `tipologiaEnte` | `annualData.tipologiaEnte` |
| `numero_abitanti` | `numeroAbitanti` | `annualData.numeroAbitanti` |
| `has_dirigenza` | `hasDirigenza` | `annualData.hasDirigenza` |
| `monte_salari_2021` | `monteSalari2021` | `annualData.ccnl2024.monteSalari2021` |
| `fondo_personale_2016`| `fondoSalarioAccessorioPersonaleNonDirEQ2016` | `historicalData.fondoSalarioAccessorio...` |
| `fondo_eq_2016` | `fondoElevateQualificazioni2016` | `historicalData.fondoElevateQualificazioni2016` |
| `fondo_dirigenza_2016`| `fondoDirigenza2016` | `historicalData.fondoDirigenza2016` |
| `risorse_segretario_2016`| `risorseSegretarioComunale2016` | `historicalData.risorseSegretarioComunale2016` |
| `fondo_straordinario_2016`| `fondoLavoroStraordinario` | `annualData.fondoLavoroStraordinario` |
| `fondo_personale_2018`| `fondoPersonaleNonDirEQ2018_Art23` | `historicalData.fondoPersonaleNonDirEQ2018_Art23` |
| `fondo_eq_2018` | `fondoEQ2018_Art23` | `historicalData.fondoEQ2018_Art23` |
| `personale_fte_2018` | `manualDipendentiEquivalenti2018` | `annualData.manualDipendentiEquivalenti2018` |
| `stipendi_tabellari_2023`| `simStipendiTabellari2023` | `annualData.simulatoreInput.simStipendiTabellari2023` |
| `spesa_personale_2023`| `simSpesaPersonaleConsuntivo2023` | `annualData.simulatoreInput.simSpesaPersonaleConsuntivo2023` |
| `media_entrate_correnti`| `simMediaEntrateCorrenti2021_2023` | `annualData.simulatoreInput.simMediaEntrateCorrenti2021_2023` |
| `tetto_spesa_l296` | `simTettoSpesaPersonaleL296_06` | `annualData.simulatoreInput.simTettoSpesaPersonaleL296_06` |
| `costo_assunzioni_piao`| `simCostoAnnuoNuoveAssunzioniPIAO` | `annualData.simulatoreInput.simCostoAnnuoNuoveAssunzioniPIAO` |

## Note sul Mapping
- **Normalizzazione**: Le stringhe vengono pulite (trim) e convertite nel tipo corretto (number, boolean, enum).
- **Default**: I campi non presenti nel CSV mantengono il valore corrente nello stato dell'applicazione.
- **Anno**: Se l'anno nel CSV differisce dall'anno selezionato nell'app, viene mostrato un warning bloccante per evitare corruzione dei dati.
