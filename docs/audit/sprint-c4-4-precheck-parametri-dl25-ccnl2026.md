# Sprint C.4.4 — Pre-check Parametri D.L. 25/2025 e CCNL 2026

## 1. Stato Iniziale
- **Branch**: `feature/sprint-c4-1-wizard-base`
- **Working Tree**: Pulito (previo commit C.4.3).
- **MEMORIA_AI.md**: Correttamente ignorato.
- **Verifiche**: Tutti i test (97/97), regressioni (8/8) e build sono passati.

## 2. Analisi Campi Step 5 (D.L. 25/2025)
Lo Step 5 gestisce i parametri del D.L. 25/2025, integrando simulatori di spesa e limiti di sostenibilità.

| Campo Tecnico | Etichetta Utente | Destinazione | Coperto da CSV |
| :--- | :--- | :--- | :--- |
| `monteSalari2021` | Monte Salari 2021 | `ccnl2024` | Sì |
| `st_incrementoDL25_2025` | Incremento 0,14% | `annualData` | Sì |
| `simStipendiTabellari2023` | Stipendi Tabellari 2023 | `annualData` | Sì |
| `simFondoStabileAnnoApplicazione` | Componente Stabile Fondo | `annualData` | No |
| `simRisorsePOEQAnnoApplicazione` | Remunerazione EQ/P.O. | `annualData` | No |
| `simSpesaPersonaleConsuntivo2023` | Spesa Personale Consuntivo 2023 | `annualData` | Sì |
| `simMediaEntrateCorrenti2021_2023` | Media Entrate Correnti 21-23 | `annualData` | Sì |
| `simTettoSpesaPersonaleL296_06` | Tetto Spesa L. 296/06 | `annualData` | Sì |

## 3. Analisi Campi Step 6 (CCNL 2026)
Lo Step 6 gestisce gli incrementi contrattuali e il conglobamento dell'indennità di comparto.

| Campo Tecnico | Etichetta Utente | Destinazione | Coperto da CSV |
| :--- | :--- | :--- | :--- |
| `optionalIncreaseVariableFrom2026Percentage` | Incremento Variabile 0,22% | `ccnl2024` | No |
| `optionalIncreaseVariable2026OnlyPercentage` | Incremento Una Tantum | `ccnl2024` | No |
| `totalReduction` | Riduzione per Conglobamento | `ccnl2024.ivcConglobation` | No |
| `personaleInServizio01012026` | Personale al 01.01.2026 | `ccnl2024.ivcConglobation` | No |
| `valoreTabellaCCol3` | Valore Tabella C Col 3 | `ccnl2024.ivcConglobation` | No |

## 4. Rischi e Mitigazioni
- **Calcolo Conglobamento**: Assicurarsi che la riduzione stabile (Art. 60) sia calcolata su 12 mensilità (Tabella C del CCNL). Il wizard non deve introdurre moltiplicatori per 13.
- **Limite 48%**: Il controllo del 48% deve essere puramente informativo nello step, basandosi sui dati inseriti.
- **Sincronizzazione**: Usare `draftData` per evitare che modifiche parziali ai parametri contrattuali destabilizzino il motore di calcolo globale prima del salvataggio.
