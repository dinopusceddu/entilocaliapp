# Gap Verifiche di Conformità - Sprint A

## Analisi dei controlli di conformità
Valutazione dei controlli presenti nella pagina "Conformità" e nel file `complianceChecks.ts`.

### Tabella dei Gap nelle Verifiche

| Controllo | Presente in app | Presente in Excel | Fonte normativa / guida | Esito | Azione consigliata |
|---|---|---|---|---|---|
| Rispetto limite Art. 23, comma 2 | Sì | Sì | Art. 23 c.2 D.Lgs 75/2017 | Coperto | Aggiornare per escludere esplicitamente i nuovi incrementi 2026 dal calcolo del tetto. |
| Verifica incremento 0,22% MS 2021 | Sì | Sì | Art. 58 c.2 CCNL 2026 | Coperto | Migliorare il messaggio di errore se il MS 2021 non è inserito. |
| Verifica incremento 0,14% MS 2021 | No | Sì | Art. 58 c.1 CCNL 2026 | **Mancante** | Aggiungere controllo che verifichi l'esatta corrispondenza con il calcolo teorico. |
| Verifica incremento D.L. 25/2025 (48%) | Parziale | Sì | Art. 14 c.1-bis D.L. 25/2025 | **Debole** | Creare una verifica dedicata che mostri l'incidenza percentuale calcolata (Numeratore/Denominatore 2023). |
| Conglobamento Indennità Comparto | Sì | Sì | Art. 60 c.2 CCNL 2026 | Coperto | Verificare la coerenza con il numero di dipendenti in servizio al 01/01/2026. |
| Destinazione Performance (30%) | Sì | Sì | Art. 59 c.2 CCNL 2026 | Coperto | Aggiornare il riferimento: non più solo "performance individuale" ma "performance" generica. |
| Corrispondenza Risorse Vincolate | Sì | Sì | Vari (Funzioni Tecniche, ISTAT, IMU) | Coperto | Estendere alla nuova voce "Incentivi IMU/TARI" se non pienamente mappata. |
| Differenziali Stipendiali (DEP) su Stabili | Sì | Sì | Art. 80 CCNL 2022 / Art. 59 CCNL 2026 | Coperto | Presidio critico per evitare finanziamento da parte variabile. |
| Quota Minima Risultato EQ (15%) | Sì | Sì | Art. 16 c.4 CCNL 2026 | Coperto | Corretto. |

### Punti di debolezza individuati
1. **Dati di Base (Basi di Calcolo)**: Le verifiche dipendono da dati (Monte Salari 2021, Tabellare 2023) che l'utente deve inserire in pagine diverse. Serve un alert se questi dati mancano ma sono necessari per le verifiche.
2. **Aggregazione Risorse Vincolate**: Il controllo su Spese di Giudizio e Censimenti è aggregato (come ammesso nel codice). Sarebbe meglio separarlo per una maggiore precisione.
3. **Limite 48%**: Attualmente gestito come "Simulatore Decreto PA", ma dovrebbe diventare un controllo di conformità strutturale "bloccante" o "critico" per gli enti che intendono superare il tetto 2016.

### Proposta per lo Sprint B
- Implementare il controllo esplicito sul **Limite 48%** con visualizzazione del rapporto matematico.
- Aggiungere verifica di coerenza per l'incremento **0,14% stabile**.
- Introdurre un controllo sulla gestione degli **Arretrati 2024-2025** (devono essere solo in parte variabile).
