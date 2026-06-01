# Sprint C.4.3 — Verifica Parità Funzionale

## 1. Copertura Campi Storici
Tutti i campi censiti nella matrice C.4.0 per gli step 3 e 4 sono stati implementati:

### Step 3 (2016)
- [x] Fondo Personale (non Dir/EQ)
- [x] Fondo EQ (o P.O.)
- [x] Fondo Dirigenza
- [x] Risorse Segretario
- [x] Fondo Straordinario (mappato correttamente su `annualData.fondoLavoroStraordinario`)
- [x] Override Manuale Limite 2016

### Step 4 (2018)
- [x] Fondo Personale 2018 (per Art. 23c2)
- [x] Fondo EQ 2018 (per Art. 23c2)
- [x] Personale FTE 2018 (Manuale)
- [x] Personale in servizio 2018 (Count)

## 2. Test di Integrità Strumenti
- **Import CSV**: Verificato che l'importazione tramite Step 2 aggiorni correttamente i campi visibili negli Step 3 e 4 del wizard.
- **Backup/Ripristino Excel**: La persistenza tramite `handleSaveDraft` garantisce che i dati storici siano inclusi nel backup globale se il wizard viene committato.
- **Vista Tecnica**: I valori inseriti nel wizard sono coerenti con quelli visualizzati nella sezione "Dati Storici" della vista completa (previa pressione del tasto "Salva").

## 3. Rischi Mitigati
- **Perdita dati**: L'uso di un `draftData` separato evita sovrascritture accidentali del database durante la navigazione esplorativa nel wizard.
- **Coerenza Straordinario**: È stata mantenuta la mappatura su `annualData.fondoLavoroStraordinario` garantendo che il valore 2016 inserito nel wizard sia lo stesso usato dal motore di calcolo per l'anno corrente (come previsto dal modello attuale).
