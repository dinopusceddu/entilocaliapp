# Regole di Validazione Import CSV — Sprint C.2

Il processo di validazione assicura che i dati importati siano coerenti e pronti per il motore di calcolo.

## 1. Validazioni di Integrità (Bloccanti)
- **File Vuoto**: Il file deve contenere almeno l'header e una riga di dati.
- **Header Mismatch**: Tutte le colonne obbligatorie devono essere presenti (case-insensitive check).
- **Anno Discordante**: Il campo `anno` deve coincidere con l'anno del fondo attualmente aperto.

## 2. Validazioni di Campo (Errori)
- **Tipi di Dato**:
  - `number`: Deve essere un valore numerico (es. `1234.56`). Messaggio: "Valore numerico non valido".
  - `boolean`: Accetta `true`, `false`, `1`, `0`. Messaggio: "Valore booleano non valido".
  - `enum (tipologia_ente)`: Deve essere uno dei valori validi. Messaggio: "Tipologia ente sconosciuta".
- **Limiti**:
  - Valori monetari non possono essere negativi.

## 3. Validazioni Logiche (Warning)
- **Obbligatorietà Condizionata**:
  - Se `tipologia_ente` è COMUNE o PROVINCIA, `numero_abitanti` deve essere compilato.
  - Se `has_dirigenza` è `true`, `fondo_dirigenza_2016` dovrebbe essere compilato.
- **Valori Anomali**:
  - `media_entrate_correnti < spesa_personale_2023` (Segnala potenziale errore di inserimento).

## 4. Gestione degli Esiti
- **FAIL**: L'importazione non può procedere. L'utente deve correggere il file.
- **WARN**: L'importazione può procedere, ma l'utente viene avvisato della potenziale incoerenza.
- **PASS**: Tutti i dati sono validi.

---
*Regole di validazione Sprint C.2.*
