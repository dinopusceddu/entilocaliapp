# Matrice di Completezza Wizard — Sprint C.4.0

Questo documento elenca tutti i campi attualmente disponibili nella sezione **Dati Generali Ente**, verificandone la presenza nel tracciato CSV, nel backup Excel e proponendo la collocazione nel nuovo wizard a 10 step.

| Campo tecnico | Etichetta utente attuale | Dove si trova oggi | Tipo dato | Obbligatorio | Validazione attuale | Usato da | Step proposto nuovo wizard | Campo presente nel CSV | Campo presente nel backup Excel | Rischio se omesso | Note |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `denominazioneEnte` | Denominazione Ente | EntityGeneralInfoForm | string | Sì | min 2 chars | UI, Report, Lettera | 1 | Sì | Sì | Identificazione ente | |
| `annoRiferimento` | Anno di Riferimento | EntityGeneralInfoForm | number | Sì | positive | Tutti i calcoli | 1 | Sì | Sì | Errore in tutti i calcoli | |
| `tipologiaEnte` | Tipologia Ente | EntityGeneralInfoForm | enum | Sì | enum | Calcolo fondo, UI | 1 | Sì | Sì | Logica specifica ente | |
| `altroTipologiaEnte` | Specifica Altra Tipologia Ente | EntityGeneralInfoForm | string | Sì (se Altro) | string | UI | 1 | No | Sì | Perdita info ente | |
| `numeroAbitanti` | Numero Abitanti al 31.12... | EntityGeneralInfoForm | number | Sì (Comune/Prov) | positive | Simulatore DL 25/2025, Limiti spesa | 1 | Sì | Sì | Errore simulatore/limiti | |
| `isEnteDissestato` | Ente in dissesto finanziario? | EntityGeneralInfoForm | boolean | Sì | boolean | UI, Compliance | 9 | No | Sì | Compliance normativa | |
| `isEnteStrutturalmenteDeficitario` | Ente strutturalmente deficitario? | EntityGeneralInfoForm | boolean | Sì | boolean | UI, Compliance | 9 | No | Sì | Compliance normativa | |
| `isEnteRiequilibrioFinanziario` | Ente in piano di riequilibrio? | EntityGeneralInfoForm | boolean | Sì | boolean | UI, Compliance | 9 | No | Sì | Compliance normativa | |
| `hasDirigenza` | È un ente con personale dirigente? | EntityGeneralInfoForm | boolean | Sì | boolean | Configurazione UI, Fondo Dirigenza | 1 | Sì | Sì | Errore visibilità sezioni | |
| `isDistributionMode` | Abilita modalità Distribuzione Risorse? | EntityGeneralInfoForm | boolean | No | boolean | UI, Calcoli riparto | 10 | No | Sì | Accesso a distribuzione | |
| `fondoSalarioAccessorioPersonaleNonDirEQ2016` | Fondo Personale (non Dir/EQ) 2016 | HistoricalDataForm | number | Sì | monetary | Limite Art 23, Calcolo fondo | 3 | Sì | Sì | Limite fondo errato | |
| `fondoElevateQualificazioni2016` | Fondo EQ (o P.O.) 2016 | HistoricalDataForm | number | Sì | monetary | Limite Art 23, Calcolo fondo | 3 | Sì | Sì | Limite fondo errato | |
| `fondoDirigenza2016` | Fondo Dirigenza 2016 | HistoricalDataForm | number | Sì (se hasDir) | monetary | Limite Art 23, Calcolo fondo | 3 | Sì | Sì | Limite fondo errato | |
| `risorseSegretarioComunale2016` | Risorse Segretario 2016 | HistoricalDataForm | number | Sì | monetary | Limite Art 23, Calcolo fondo | 3 | Sì | Sì | Limite fondo errato | |
| `fondoLavoroStraordinario` | Fondo Straordinario | HistoricalDataForm / Ccnl2024SettingsForm | number | Sì | monetary | Limite Art 23, Calcolo fondo | 3 | Sì (2016) | Sì | Limite fondo errato | Nel CSV è `fondo_straordinario_2016` |
| `manualPersonalFundLimit2016` | Override Manuale (Totale 2016) | HistoricalDataForm | number | No | monetary | Limite Art 23 | 3 | No | Sì | Ricalcolo manuale necessario | |
| `fondoPersonaleNonDirEQ2018_Art23` | Fondo Personale 2018 (per Art. 23c2) | Art23EmployeeAndIncrementForm | number | Sì | monetary | Adeguamento Art 23 | 4 | Sì | Sì | Errore pro-capite 2018 | |
| `fondoEQ2018_Art23` | Fondo EQ 2018 (per Art. 23c2) | Art23EmployeeAndIncrementForm | number | Sì | monetary | Adeguamento Art 23 | 4 | Sì | Sì | Errore pro-capite 2018 | |
| `personale2018PerArt23` | Gestisci Personale 2018 | Art23EmployeeAndIncrementForm | list | Sì (se auto) | list | Adeguamento Art 23 | 4 | No | Sì | Errore FTE 2018 | |
| `personaleAnnoRifPerArt23` | Gestisci Personale Anno Rif | Art23EmployeeAndIncrementForm | list | Sì (se auto) | list | Adeguamento Art 23 | 7 | No | Sì | Errore FTE Anno Rif | |
| `manualDipendentiEquivalenti2018` | Personale FTE 2018 (Manuale) | Art23EmployeeAndIncrementForm | number | Sì (se manual) | positive | Adeguamento Art 23 | 4 | Sì | Sì | Errore pro-capite 2018 | |
| `manualDipendentiEquivalentiAnnoRif` | Personale FTE Anno Rif (Manuale) | Art23EmployeeAndIncrementForm | number | Sì (se manual) | positive | Adeguamento Art 23 | 7 | No | Sì | Errore pro-capite Anno Rif | |
| `simStipendiTabellari2023` | Stipendi tabellari personale 2023 | SimulatoreIncrementoForm | number | Sì | monetary | Simulatore DL 25/2025 | 5 | Sì | Sì | Errore calcolo 48% | |
| `simFondoStabileAnnoApplicazione` | Ammontare componente stabile Fondo... | SimulatoreIncrementoForm | number | Sì | monetary | Simulatore DL 25/2025 | 5 | No | Sì | Errore calcolo 48% | |
| `simRisorsePOEQAnnoApplicazione` | Ammontare remunerazione incarichi EQ... | SimulatoreIncrementoForm | number | Sì | monetary | Simulatore DL 25/2025 | 5 | No | Sì | Errore calcolo 48% | |
| `simSpesaPersonaleConsuntivo2023` | Spesa di personale (ultimo consuntivo) | SimulatoreIncrementoForm | number | Sì | monetary | Simulatore DL 25/2025 | 5 | Sì | Sì | Errore sostenibilità | |
| `simMediaEntrateCorrenti2021_2023` | Media Entrate Correnti 2021-23 | SimulatoreIncrementoForm | number | Sì | monetary | Simulatore DL 25/2025 | 5 | Sì | Sì | Errore sostenibilità | |
| `simTettoSpesaPersonaleL296_06` | Tetto di spesa personale L. 296/06 | SimulatoreIncrementoForm | number | Sì | monetary | Simulatore DL 25/2025 | 5 | Sì | Sì | Errore limite storico | |
| `simCostoAnnuoNuoveAssunzioniPIAO` | Costo annuo nuove assunzioni PIAO | SimulatoreIncrementoForm | number | Sì | monetary | Simulatore DL 25/2025 | 5 | Sì | Sì | Errore sostenibilità | |
| `simPercentualeOneriIncremento` | Percentuale oneri riflessi... | SimulatoreIncrementoForm | number | Sì | positive | Simulatore DL 25/2025 | 5 | No | Sì | Errore netto effettivo | |
| `ccnl2024.monteSalari2021` | Monte Salari 2021 | Ccnl2024SettingsForm | number | Sì | monetary | Calcolo incrementi 2026 | 8 | Sì | Sì | Errore 0,14% e 0,22% | |
| `ccnl2024.fondoPersonale2025` | Fondo Personale 2024 (Riparto) | Ccnl2024SettingsForm | number | Sì | monetary | Riparto incrementi 2026 | 8 | No | Sì | Errore riparto Dip/EQ | |
| `ccnl2024.fondoEQ2025` | Fondo EQ 2024 (Riparto) | Ccnl2024SettingsForm | number | Sì | monetary | Riparto incrementi 2026 | 8 | No | Sì | Errore riparto Dip/EQ | |
| `ccnl2024.optionalIncreaseVariableFrom2026Percentage` | Incr. Variabile (dal 2026) % | Ccnl2024SettingsForm | number | No | 0-0.22 | Calcolo incrementi 2026 | 6 | No | Sì | Perdita incremento facoltativo | |
| `ccnl2024.optionalIncreaseVariable2026OnlyPercentage` | Incr. Una Tantum % | Ccnl2024SettingsForm | number | No | 0-0.22 | Calcolo incrementi 2026 | 6 | No | Sì | Perdita incremento facoltativo | |
| `ccnl2024.ivcConglobation.totalReduction` | Riduzione per conglobamento | Ccnl2024SettingsForm (Ivc Modal) | number | Sì | monetary | Calcolo fondo 2026 | 6 | No | Sì | Errore Art. 60 CCNL 2026 | |
| `ccnl2024.personaleInServizio01012026` | Personale in servizio 01.01.2026 (per calcolo) | Ccnl2024SettingsForm (Ivc Modal) | number | Sì (se auto) | positive | Calcolo riduzione | 6 | No | Sì | Errore riduzione automatica | |
| `ccnl2024.valoreTabellaCCol3` | Valore Tabella C (per calcolo) | Ccnl2024SettingsForm (Ivc Modal) | number | Sì (se auto) | monetary | Calcolo riduzione | 6 | No | Sì | Errore riduzione automatica | |
| `ccnl2024.applyPartTimeProportion` | Applica proporzione PT? | Ccnl2024SettingsForm (Ivc Modal) | boolean | No | boolean | Calcolo riduzione | 6 | No | Sì | Errore riduzione automatica | |
| `ccnl2024.averagePartTimePercentage` | % PT media | Ccnl2024SettingsForm (Ivc Modal) | number | No | 0-1 | Calcolo riduzione | 6 | No | Sì | Errore riduzione automatica | |
| `incrementoFondoStraordinario` | Incremento Fondo Straordinario | Ccnl2024SettingsForm | number | No | monetary | Calcolo fondo straordinario | 8 | No | Sì | Perdita incremento straordinario | |
| `riduzioneFondoParteStabile` | Riduci fondo stabile per finanziare? | Ccnl2024SettingsForm | boolean | No | boolean | Calcolo fondo | 8 | No | Sì | Errore logica finanziamento | |
| `proventiSpecifici` | Proventi specifici | ProventiSpecificiForm | list | No | list | Calcolo fondo parte variabile | 8 | No | Sì | Perdita risorse variabili | |
| `incentiviPNRROpMisureStraordinarie` | Incentivi PNRR / Misure Straordinarie | Art23EmployeeAndIncrementForm | number | No | monetary | Calcolo fondo | 8 | No | Sì | Perdita risorse PNRR | |
| `documentMetadata` | Metadati Documento (Determina...) | UI Advanced / DocumentForm | object | No | string | Report PDF, Determina | 10 | No | Sì | Report incompleti | |
| `personaleServizioAttuale` | Personale in Servizio (Conteggio) | EmployeeCountsForm | list | Sì | list | Calcolo indennità comparto | 7 | No | Sì | Errore distribuzione indennità | |

## Legenda "Usato da"
- **UI Dati Generali**: Visualizzazione nei form attuali.
- **import CSV**: Tracciato CSV di importazione rapida.
- **backup Excel**: Funzionalità di salvataggio/ripristino totale stato.
- **lettera richiesta dati**: Generatore automatico della lettera per l'ente.
- **calcolo fondo**: Motore di calcolo `fundEngine.ts`.
- **verifica Art. 23, comma 2, D.Lgs. 75/2017**: Calcolo adeguamento limite storico.
- **limite 48% D.L. 25/2025**: Simulatore incremento target 48%.
- **incremento 0,14% / 0,22%**: Calcoli CCNL 23.02.2026.
- **conglobamento indennità di comparto**: Riduzione stabile Art. 60 CCNL 2026.
- **report PDF / determina**: Generazione output documentali.
