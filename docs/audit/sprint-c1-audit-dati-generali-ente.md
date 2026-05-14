# Audit Dati Generali Ente — Sprint C.1

Questo documento analizza tutti i campi richiesti nella pagina **Dati Generali Ente** e nel wizard iniziale dell'applicazione, mappando le chiavi tecniche, i tipi di dato e la loro finalità normativa.

## Mappa Tecnica dei Campi

| Area | Campo UI | Chiave tecnica | Tipo dato | Obbligatorio | Fonte del dato | Usato per | Validazione | Note |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Anagrafica** | Denominazione Ente | `denominazioneEnte` | string | Sì | Ente | Identificazione | Min 3 car. | - |
| **Anagrafica** | Tipologia Ente | `tipologiaEnte` | enum | Sì | Ente | Parametrizzazione | Enums | - |
| **Anagrafica** | Altra Tipologia | `altroTipologiaEnte` | string | Sì* | Ente | Identificazione | Se 'ALTRO' | - |
| **Anagrafica** | Numero Abitanti | `numeroAbitanti` | number | Sì* | ISTAT | Limiti spesa | > 0 | Per Comuni/Prov. |
| **Anagrafica** | Anno Riferimento | `annoRiferimento` | number | Sì | Wizard | Contesto temporale | 2024-2026 | - |
| **Stato Ente** | Ente Dissestato | `isEnteDissestato` | boolean | Sì | Bilancio | Vincoli spesa | - | Art. 244 TUEL |
| **Stato Ente** | Deficitario | `isEnteStrutturalmenteDeficitario` | boolean | Sì | Bilancio | Vincoli spesa | - | Art. 242 TUEL |
| **Stato Ente** | Riequilibrio | `isEnteRiequilibrioFinanziario` | boolean | Sì | Bilancio | Vincoli spesa | - | Art. 243-bis TUEL |
| **Configurazione**| Has Dirigenza | `hasDirigenza` | boolean | Sì | Ente | Abilitazione sezioni | - | - |
| **Configurazione**| Modalità Distribuzione | `isDistributionMode` | boolean | No | Ente | UI Flow | - | - |
| **Storico (2016)** | Fondo Personale 2016 | `fondoSalarioAccessorioPersonaleNonDirEQ2016` | number | Sì | Costituzione 2016 | Limite Art. 23 c.2 | >= 0 | - |
| **Storico (2016)** | Fondo EQ 2016 | `fondoElevateQualificazioni2016` | number | Sì | Costituzione 2016 | Limite Art. 23 c.2 | >= 0 | - |
| **Storico (2016)** | Fondo Dirigenza 2016 | `fondoDirigenza2016` | number | Sì* | Costituzione 2016 | Limite Art. 23 c.2 | >= 0 | Se `hasDirigenza` |
| **Storico (2016)** | Risorse Segretario 2016 | `risorseSegretarioComunale2016` | number | Sì | Costituzione 2016 | Limite Art. 23 c.2 | >= 0 | - |
| **Storico (2016)** | Fondo Straord. 2016 | `fondoLavoroStraordinario` | number | Sì | Costituzione 2016 | Limite Art. 23 c.2 | >= 0 | In `annualData` |
| **Storico (2016)** | Override Manuale 2016 | `manualPersonalFundLimit2016` | number | No | Ente | Limite Art. 23 c.2 | >= 0 | Sovrascrive somma |
| **Storico (2018)** | Fondo Personale 2018 | `fondoPersonaleNonDirEQ2018_Art23` | number | Sì | Costituzione 2018 | Adeguamento limite | >= 0 | Base pro-capite |
| **Storico (2018)** | Fondo EQ 2018 | `fondoEQ2018_Art23` | number | Sì | Costituzione 2018 | Adeguamento limite | >= 0 | Base pro-capite |
| **Storico (2018)** | Personale FTE 2018 | `manualDipendentiEquivalenti2018` | number | Sì | Conto Annuale | Adeguamento limite | >= 0 | O da lista analitica |
| **Consuntivo 2023**| Stipendi Tabellari 2023 | `simStipendiTabellari2023` | number | Sì | Conto Annuale | Limite 48% | >= 0 | Inc. 13a, exc. IVC |
| **Consuntivo 2023**| Spesa Personale 2023 | `simSpesaPersonaleConsuntivo2023` | number | Sì | Rendiconto 2023 | Sostenibilità DM 2020 | >= 0 | Macroaggregato U.1.01 |
| **Parametri 2026** | Monte Salari 2021 | `monteSalari2021` | number | Sì | Conto Annuale 2021 | Incrementi CCNL 2026 | >= 0 | Base 0,14% e 0,22% |
| **Parametri 2026** | Fondo Personale 2025 | `fondoPersonale2025` | number | Sì | Costituzione 2025 | Base riparto | >= 0 | - |
| **Parametri 2026** | Fondo EQ 2025 | `fondoEQ2025` | number | Sì | Costituzione 2025 | Base riparto | >= 0 | - |
| **Sostenibilità** | Entrate Correnti 21-23 | `simMediaEntrateCorrenti2021_2023` | number | Sì | Bilanci 21-23 | Sostenibilità DM 2020 | >= 0 | Netto FCDE |
| **Sostenibilità** | Tetto Spesa L. 296/06 | `simTettoSpesaPersonaleL296_06` | number | Sì | Storico Ente | Limite Fase 3 | >= 0 | Media 11-13 o 08 |
| **Sostenibilità** | Costo Assunzioni PIAO | `simCostoAnnuoNuoveAssunzioniPIAO` | number | Sì | PIAO | Sostenibilità | >= 0 | A regime |
| **Sostenibilità** | % Oneri Riflessi | `simPercentualeOneriIncremento` | number | Sì | Ente | Sostenibilità | 0-100 | Default 27.4% |

## Classificazione dei Dati

### 1. Dati Obbligatori (Wizard Iniziale)
- Denominazione, Tipologia, Abitanti, Anno.
- Fondi 2016 (Stabile, EQ, Dirigenza, Segretario, Straordinario).
- Dati 2018 (Fondo Personale, Fondo EQ, FTE).
- Monte Salari 2021.
- Stipendi Tabellari 2023.

### 2. Dati per Verifica Limiti (Simulatore 48%)
- Spesa Personale 2023.
- Media Entrate Correnti 2021-2023.
- Tetto Spesa L. 296/06.
- Costo Assunzioni PIAO.

### 3. Campi Calcolati Automaticamente
- `totalReduction` (Conglobamento IVC).
- `limiteComplessivo2016` (Somma fondi 2016).
- `valoreMedioProCapite2018` (Fondo 2018 / FTE 2018).
- Tutti i risultati del simulatore (`fase1`...`fase5`).

### 4. Dati Derivabili (Non Richiedere)
- Coefficienti ISTAT (se integrati via API).
- Valori Tabella C (già presenti come costanti).
- Soglie DM 17/03/2020 (già presenti come costanti).

---
*Audit completato per lo Sprint C.1.*
