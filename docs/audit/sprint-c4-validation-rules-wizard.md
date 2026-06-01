# Validation Rules — Sprint C.4 Wizard

Regole di validazione per singolo step del wizard (basate su Zod).

## Step 1: Anagrafica
- `nomeEnte`: Obbligatorio, min 3 caratteri.
- `tipologiaEnte`: Obbligatorio (Enum `TipologiaEnte`).

## Step 4: Storici
- `fondo2016`: Numero positivo, obbligatorio.
- `parametriArt23`: Numeri positivi.

## Step 5: Personale
- `personaleFTE`: Numero positivo. Se l'ente è un Comune > 1.000 abitanti, obbligatorio per alcuni calcoli.

## Step 7: Compliance
- `monteSalari2021`: Numero positivo, obbligatorio per calcolo 0,22%.

## Regole Globali
- Se l'utente tenta di saltare uno step obbligatorio, il wizard deve mostrare un alert o disabilitare il tasto "Avanti".
- Se mancano dati obbligatori allo step 10, il pulsante "Conferma e Salva" deve essere disabilitato, suggerendo la generazione della lettera di richiesta dati.
