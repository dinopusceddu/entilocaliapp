# Sprint C.4.5 — Verifica Completezza Funzionale

## Obiettivo della Verifica
Garantire che le nuove implementazioni per gli step 7, 8, 9, 10 coprano fedelmente il set di dati minimo e opzionale presente nella configurazione canonica dell'applicativo (Vista Tecnica Avanzata).

## 1. Dati del Personale (Step 7)
- I conteggi aggregati (`AnnualEmployeeCount`) sono stati implementati per `Dipendenti`, `EQ`, `Dirigenti`, e `Segretari`. Sono collegati a `annualData.personaleServizioAttuale`, replicando l'input di `EmployeeCountsForm`.
- È stato mappato il personale "FTE" storico 2018 (`manualDipendentiEquivalenti2018`), usato per riproporzioni del limite 2016.
- Sono stati portati i campi necessari al **Conglobamento Indennità di Comparto** (`personaleInServizio01012026` e `valoreTabellaCCol3`) per mantenere isolata la logica di riduzione stabile da 12 mensilità senza sporcare le altre categorie (esclusione dirigenza e segretari).

## 2. Risorse Iniziali (Step 8)
- I dati sono stati filtrati al nucleo "essenziale" raccomandato:
  - Fondo parte stabile base (Unico Importo 2017).
  - RIA per personale cessato.
  - Differenziali stipendiali 2022.
  - Fondo storico 2017 Posizioni Organizzative (EQ).
  - Variabile base: somme non utilizzate anni precedenti.
- Non c'è duplicazione di business logic. I campi scrivono direttamente in `fondoAccessorioDipendenteData` e `fondoElevateQualificazioniData`. Eventuali omissioni rimangono sicure tramite la "conservative merge" implementata nel salvataggio. Le restanti voci si compileranno analiticamente in Vista Tecnica.

## 3. Coerenza Dati (Step 9)
- Sono stati creati 4 cluster di controllo simulativi:
  1. Anagrafica e Generalità
  2. Limiti Storici (2016 e 2018)
  3. Parametri DL 25/2025 (inclusa la simulazione real-time del 48%)
  4. Parametri CCNL 2026 (conglobamento Art. 60 e incrementi 0,22%).
- Il pannello ha mantenuto la rigorosa architettura read-only come richiesto. La validazione *non* esegue salvataggi né impegna il DB e utilizza la funzione core `calculateSimulazione`.

## 4. Riepilogo e Salvataggio (Step 10)
- Il riepilogo presenta i dati di check in 4 quadranti.
- Offre i pulsanti: "Salva e vai a Costituzione", "Salva Bozza e Esci" e "Apri la vista tecnica senza salvare".
- Il dispatcher canonico aggiorna tutte e quattro le componenti dello state (`annualData`, `historicalData`, `fondoAccessorioDipendenteData`, `fondoElevateQualificazioniData`) al completamento.

Nessun dato precedentemente accessibile via UI avanzata o caricabile via CSV ha perso di consistenza o è stato mascherato in modo non recuperabile.
