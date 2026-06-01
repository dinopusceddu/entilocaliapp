# Sprint C.4.4 — Verifica Parità Funzionale

## Obiettivo della Verifica
Garantire che l'inserimento dei parametri normativi per il D.L. 25/2025 e il CCNL 2026 tramite il nuovo Wizard mantenga la parità funzionale completa con l'inserimento attraverso la Vista Tecnica/Avanzata e assicuri l'integrità del salvataggio.

## Campi D.L. 25/2025 (Step 5)
- **Monte Salari 2021 (`ccnl2024.monteSalari2021`)**: Conservato e manipolato tramite il nuovo wizard; l'alias legacy non interferisce. La Vista Tecnica e il Wizard condividono l'accesso alla stessa proprietà nello stato globale dopo il salvataggio.
- **Incremento 0,14% Stabile (`st_incrementoDL25_2025`)**: L'allocazione è stata mappata esplicitamente in `fondoAccessorioDipendenteData`, garantendo che l'incremento persista e partecipi ai calcoli del fondo costituzione esattamente come prima.
- **Campi Simulatore (48%)**: Mappati correttamente dentro `annualData.simulatoreInput` per permettere ai moduli di verifica di leggerli senza necessitare refactoring dei calcoli core.

## Campi CCNL 2026 (Step 6)
- **Incrementi Variabili Opzionali (0,22% permanente e una tantum)**: Mappati in `annualData.ccnl2024.optionalIncreaseVariableFrom2026Percentage` e associati.
- **Riduzione Conglobamento (Tabella C / 12 Mensilità)**: Il componente mostra la decurtazione calcolata correttamente in tempo reale sfruttando la funzione canonica di calcolo del dominio `calculateCcnl2024Increases`. Vengono registrati i parametri necessari (FTE, valore tabellare area) nell'oggetto `ccnl2024`. Il calcolo di `fondoEngine` lo assorbirà intatto.

## Verifiche di Integrità
1. **Wizard vs Vista Tecnica**: Il wizard raccoglie i dati temporanei (`draftData`) in locale. Al momento di premere "Salva", viene eseguito un dispatch specifico al reducer con le payload esatte previste (es: `UPDATE_FONDO_ACCESSORIO_DIPENDENTE_DATA`), lo stesso usato dalla Vista Tecnica. 
2. **Import CSV e Excel**: I mapping CSV gestiscono i parametri CCNL e Simulatore senza perdite di dati all'interno delle loro payload di import. Dal momento che l'azione di caricamento aggiorna il reducer globale, se l'utente entra poi nel wizard i dati vengono re-idratati in `draftData`.
3. **Calcoli Assicurati**: Entrambi i componenti mostrano riepiloghi dei calcoli che sfruttano direttamente le funzioni nel modulo `logic/calculation`. Nessuna logica di business è stata duplicata nell'UI. Le mensilità di conglobamento rimangono garantite come 12, mai 13, per l'Art. 60.
