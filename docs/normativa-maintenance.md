# 🛠️ Maintenance - Pipeline Normativa

Questa sezione descrive come aggiornare e mantenere i dati della sezione Normativa partendo dai documenti originali (DOCX).

## 📂 Struttura della Pipeline

La pipeline si trova in `scripts/doc-ingestion/` ed è suddivisa in step sequenziali:

1. `01_convert_docx_to_html.js`: Converte i file `.docx` in HTML semantico (richiede `mammoth`).
2. `02_extract_raccolta.js`: Analizza l'HTML della Raccolta Sistematica ed estrae gli articoli basandosi sui tag `h1-h6`.
3. `03_extract_guida.js`: Estrae le schede dalla Guida al Contratto.
4. `04_enrich_metadata.js`: Correggere i rinvii, associa i pareri ARAN e pulisce il testo.
5. `05_build_indexes.js`: Genera l'indice analitico e l'indice di ricerca unificato.
6. `06_validate_outputs.js`: Verifica la coerenza dei JSON prodotti (QA).

## 🚀 Come Aggiornare i Dati

Se ricevi una nuova versione della Raccolta o della Guida in formato DOCX:

1. Sovrascrivi i file originali nella cartella `data/normativa/sorgenti/` (se presente) o carica i nuovi `.docx`.
2. Esegui il comando unico di build:
   ```bash
   npm run normativa:build
   ```
   Questo comando eseguirà l'intera catena di script e aggiornerà i file in `src/data/normativa/`.

3. **Verifica QA**: Dopo la build, controlla la cartella `qa/normativa/`. 
   - Se il file `raccolta_da_rivedere.json` contiene molti elementi, significa che il parser ha avuto difficoltà con la nuova struttura del DOCX.

## 📝 Troubleshooting

- **Falsi Positivi**: Se appaiono articoli inesistenti (es. titoli del sommario), verifica che nel DOCX i titoli degli articoli siano contrassegnati come "Titolo 1" o "Heading 1".
- **Commi Mancanti**: Il parser si aspetta commi numerati (es. "1.", "2."). Se lo stile cambia, va aggiornata la regex in `02_extract_raccolta.js`.
- **Indice Ricerca**: Se la ricerca non trova nuovi contenuti, cancella `src/data/normativa/normativa.searchIndex.json` e riesegui la build.

## 💾 Dataset Prodotti
I file finali consumati dal frontend sono:
- `raccolta.articles.json`
- `guida.schede.json`
- `guida.pareriAran.json`
- `normativa.searchIndex.json`
- `normativa.indiceAnalitico.json`
