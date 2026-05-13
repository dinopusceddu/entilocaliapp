# Rischi Residui - Release Candidate Sprint B

Questo documento elenca i rischi tecnici non bloccanti identificati durante l'audit finale.

## 1. Duplicazione File Logica (Tecnico)
- **Rischio**: Presenza di due file simili:
    - `src/logic/fundCalculations.ts`
    - `src/logic/calculation/fundCalculations.ts`
- **Impatto**: Confusione durante la manutenzione. Attualmente l'app usa il secondo (nuovo pattern).
- **Mitigazione**: Eliminare `src/logic/fundCalculations.ts` (legacy) non appena viene confermato il funzionamento post-merge.

## 2. Dimensione Bundle JS (Prestazioni)
- **Rischio**: `dist/assets/index-DJ3LCn5c.js` supera i 7MB (gzip ~1.7MB).
- **Impatto**: Tempi di caricamento iniziali leggermente superiori in connessioni lente.
- **Mitigazione**: Introdurre code-splitting (Vite `manualChunks`) per separare le librerie pesanti (es. `pdfjs-dist`, `lucide-react`).

## 3. Nota di Trasparenza Spese Giudizio (Funzionale)
- **Rischio**: Il modello dati accorpa "Spese di Giudizio" e "Censimenti ISTAT".
- **Impatto**: Il controllo di conformità tra fonte e uso è aggregato. Non è possibile verificare atomicamente se le spese di giudizio rimborsate corrispondano esattamente ai compensi avvocatura senza un'analisi manuale.
- **Mitigazione**: Inserita "Nota di trasparenza" nel popover per informare l'utente del limite tecnico.

## 4. Invarianza Versioni Precedenti
- **Rischio**: Le modifiche al motore per il 2026 potrebbero influire sui calcoli 2024-2025 se non correttamente isolate.
- **Impatto**: Regressioni su esercizi passati.
- **Mitigazione**: Test di regressione eseguiti con successo su fixture 2024/2025. Il codice usa guardie temporali (`annoRiferimento >= 2026`).
