# Documentazione Pipeline Doc-Ingestion (Normativa)

Questo documento descrive come vengono elaborati i file DOCX originali per produrre il dataset in formato JSON, utilizzabile e consumabile in locale dall'applicazione.

## 1. Prerequisiti
- Node.js installato.
- Pacchetti installati: `npm install` (che intercetterà `mammoth` e `cheerio` dalle dipendenze di sviluppo).

## 2. Architettura della Pipeline
I file si trovano in `scripts/doc-ingestion/`:

1. `01_convert_docx_to_html.js`: Legge i DOCX da `fileprogetto/` e li converte in HTML piatto usando `mammoth`. Gli output grezzi finiscono in `qa/normativa/raw_*.html`.
2. `02_extract_raccolta.js`: Usa `cheerio` per manipolare l'HTML e strutturarlo per Titolo, Capo, Articoli e Commi. Genera `.articles.json` e `.toc.json`.
3. `03_extract_guida.js`: Usa procedure euristiche per analizzare sezioni, intestazioni (es. "Cos'è?") e identificazione di riferimenti ARAN, generando le schede.
4. `04_enrich_metadata.js`: Assegna keyword agli articoli per generare un indice analitico.
5. `05_build_indexes.js`: Raccoglie tutto in un grande array di ricerca full-text combinato (`normativa.searchIndex.json`).
6. `06_validate_outputs.js`: Confronta la struttura e rileva articoli troppo corti o senza commi (o schede senza blocchi), salvandoli in `qa/normativa/*_da_rivedere.json`.

## 3. Comandi Gestuali

L'intero ciclo si scatena con un solo comando da terminale, situato nella root del progetto:

```bash
npm run normativa:build
```

### Comandi granulari
Se si sta lavorando su un pezzo limitato del parser è possibile lanciare individualmente:
- `npm run normativa:convert`
- `npm run normativa:raccolta`
- `npm run normativa:guida`
- `npm run normativa:enrich`
- `npm run normativa:index`
- `npm run normativa:validate`

## 4. Output Generati
Tutti gli output finali consumabili dall'app finiscono in `src/data/normativa/`:
- `raccolta.articles.json`
- `raccolta.toc.json`
- `guida.schede.json`
- `guida.sezioni.json`
- `guida.pareriAran.json`
- `normativa.indiceAnalitico.json`
- `normativa.searchIndex.json`
