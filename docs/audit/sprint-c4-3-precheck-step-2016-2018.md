# Sprint C.4.3 — Pre-check Step 2016 e 2018

## 1. Mappatura Campi Step 3 — Dati Storici 2016
Lo Step 3 raccoglie i dati certificati dell'anno 2016, fondamentali per definire il limite invalicabile del trattamento accessorio (Art. 23, c. 2, D.Lgs. 75/2017).

| Campo Tecnico | Etichetta Utente | Origine Modello | Coperto da CSV |
| :--- | :--- | :--- | :--- |
| `fondoSalarioAccessorioPersonaleNonDirEQ2016` | Fondo Personale (non Dir/EQ) 2016 | `historicalData` | Sì |
| `fondoElevateQualificazioni2016` | Fondo EQ (o P.O.) 2016 | `historicalData` | Sì |
| `fondoDirigenza2016` | Fondo Dirigenza 2016 | `historicalData` | Sì |
| `risorseSegretarioComunale2016` | Risorse Segretario 2016 | `historicalData` | Sì |
| `fondoLavoroStraordinario` | Fondo Straordinario 2016 | `annualData` | Sì |
| `manualPersonalFundLimit2016` | Override Manuale Limite 2016 | `historicalData` | No |
| `manualStrategyFundLimit2016` | Override Manuale Strategico 2016 | `historicalData` | No |

## 2. Mappatura Campi Step 4 — Dati Storici 2018
Lo Step 4 raccoglie i dati dell'anno 2018, necessari per il calcolo degli adeguamenti pro-capite del limite 2016 in caso di variazioni della capacità assunzionale.

| Campo Tecnico | Etichetta Utente | Origine Modello | Coperto da CSV |
| :--- | :--- | :--- | :--- |
| `personaleServizio2018` | Personale in servizio 2018 (Count) | `historicalData` | Sì |
| `fondoPersonaleNonDirEQ2018_Art23` | Fondo Personale 2018 (per Art. 23c2) | `historicalData` | Sì |
| `fondoEQ2018_Art23` | Fondo EQ 2018 (per Art. 23c2) | `historicalData` | Sì |
| `manualDipendentiEquivalenti2018` | Personale FTE 2018 (Manuale) | `annualData` | Sì |
| `personale2018PerArt23` | Dettaglio Analitico Personale 2018 | `annualData` | No |

## 3. Analisi di Parità Funzionale
- **Copertura CSV**: La quasi totalità dei campi monetari e dei conteggi semplici è coperta dal CSV.
- **Vista Tecnica**: I campi di "Dettaglio Analitico" (liste di dipendenti per il calcolo FTE 2018) rimangono gestiti preferibilmente nella vista tecnica avanzata o tramite importazione massiva Excel, ma il wizard permetterà l'inserimento dei valori aggregati manuali.
- **Rischi**: 
    - **Duplicazione**: Il campo `fondoLavoroStraordinario` risiede in `annualData` ma ha valenza storica 2016 nel contesto del limite. Bisogna assicurarsi che il wizard lo tratti come dato di input per il 2016.
    - **Perdita Dati**: Usando il *conservative merge* di `draftData`, i dati non toccati (es. 2018 mentre si è nello Step 3) sono al sicuro.

## 4. Verdetto Pre-check
La mappatura è completa e coerente con la matrice C.4.0. Si può procedere all'implementazione dei componenti dedicati.
