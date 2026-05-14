# Audit Guida Normativa Voce-per-Voce - Sprint B.3

Analisi dello stato attuale dei metadati in `src/logic/fundFieldDefinitions.ts`.

## Tabella di Audit

| Chiave Applicativa | Etichetta | Metadati | Qualità | Rif. Normativo | Effetto Limiti | Errori Freq. | Livello Att. | Stato |
|---|---|---|---|---|---|---|---|---|
| `st_art79c1_art67c1_unicoImporto2017` | Unico importo consolidato 2017 | Presenti | COMPLETA | Art. 79 c.1 | Art. 23 c. 2 (Sogg.) | Presenti | Info | COMPLETA |
| `st_art58c1_CCNL2026_incremento014_MS2021` | Incremento stabile 0,14% | Presenti | DA MIGLIORARE | Art. 58 c. 1 | Escluso Art. 23 | Presenti | Info | PARZIALE |
| `st_incrementoDL25_2025` | Incremento D.L. 25/2025 | Presenti | TROPPO GENERICA | Art. 14 c. 1-bis | Soggetto Art. 23 | Presenti | Info | DA RIVEDERE |
| `st_riduzionePerIncrementoEQ` | Riduzione per incremento risorse EQ | Parziali | DA MIGLIORARE | Art. 7 c. 4 | Soggetto Art. 23 | Assenti | Warning | DA RIVEDERE |
| `st_art60c2_CCNL2026_decurtazioneIndennitaComparto` | Decurtazione conglobamento indennità comparto | Presenti | DA MIGLIORARE | Art. 60 c. 2 | Riduce Art. 23 | Presenti | Info | PARZIALE |
| `vn_art15c1k_art67c3c_incentiviTecniciCondoni` | Incentivi funzioni tecniche | Presenti | DA MIGLIORARE | Art. 67 c. 3c | Escluso Art. 23 | Presenti | Info | PARZIALE |
| `vn_art18h_art67c3c_incentiviSpeseGiudizioCensimenti` | Incentivi spese giudizio / ISTAT | Presenti | TROPPO GENERICA | Art. 67 c. 3c | Escluso Art. 23 | Presenti | Info | DA RIVEDERE |
| `vn_l145_art1c1091_incentiviRiscossioneIMUTARI` | Incentivi IMU/TARI | Presenti | DA MIGLIORARE | L. 145/2018 | Escluso Art. 23 | Presenti | Info | PARZIALE |
| `vn_art80c1_sommeNonUtilizzateStabiliPrec` | Somme non utilizzate precedenti | Presenti | DA MIGLIORARE | Art. 59 c. 1 | Escluso Art. 23 | Presenti | Info | PARZIALE |

## Note di Audit Qualitativo

1. **Riferimenti Normativi**: Molti campi citano helper interni (`norme.riferimenti_normativi...`) o il manuale Giannotti indirettamente. Occorre esplicitare le fonti primarie (es. CCNL 23.02.2026).
2. **Effetto Limiti**: Necessario specificare meglio l'impatto sul **Limite 48% (D.L. 25/2025)**, oggi presente solo in modo generico.
3. **Note di Trasparenza**: Assenti o insufficienti su voci aggregate (ISTAT, Spese Giudizio) e su riduzioni storiche (L. 147/2013).
4. **Precisione Operativa**: I testi "Quando si usa" e "Fonte del dato" sono talvolta generici (es. "Atti amministrativi"). Vanno resi più specifici (es. "Conto Annuale Tabella 15").
