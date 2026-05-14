# Proposta UI Preview Importazione — Sprint C.2

L'interfaccia di anteprima è fondamentale per dare all'utente il controllo finale prima di sovrascrivere i dati.

## 1. Componente `CsvImportModal`
Una modale `fixed` con overlay scuro contenente:
- **Header**: Titolo "Importazione Dati da CSV" e pulsante chiusura.
- **Dropzone**: Area per il caricamento file (se non ancora caricato).
- **Body**: Visualizzazione condizionale (Preview o Error Report).

## 2. Visualizzazione Anteprima (`ImportPreviewTable`)
Una tabella che confronta i dati attuali con quelli del file:

| Dato | Valore Attuale | Nuova Valore (CSV) | Stato |
| :--- | :--- | :--- | :--- |
| Denominazione | Comune di Alfa | Comune di Beta | ⚠️ Modificato |
| Abitanti | 12.000 | 12.500 | ⚠️ Modificato |
| Fondo 2016 | € 1.000.000 | € 1.000.000 | ✅ Invariato |
| ... | ... | ... | ... |

- **Colori**: Sfondo giallo per righe modificate, verde per invariate.
- **Icone**: Alert per i warning.

## 3. Gestione Errori (`ImportErrorReport`)
Se il file contiene errori bloccanti, viene mostrata una lista:
- "Riga 4: La colonna 'monte_salari_2021' deve essere un numero."
- "Errore Strutturale: Colonna 'anno' mancante."

## 4. Azioni Finali
- **Pulsante "Applica Modifiche"**: Abilitato solo se non ci sono errori bloccanti. Richiede conferma via browser `window.confirm` o modale secondaria.
- **Pulsante "Annulla"**: Chiude la modale senza apportare modifiche.

---
*Proposta UI Sprint C.2.*
