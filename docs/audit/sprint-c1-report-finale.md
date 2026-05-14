# Report Finale Sprint C.1 — Audit Dati Generali Ente

Lo Sprint C.1 si conclude con la mappatura completa dei dati necessari alla gestione dell'ente e la definizione degli strumenti di supporto all'importazione e al reperimento dei dati.

## Documenti e Template Creati
1. **Audit Tecnico**: `docs/audit/sprint-c1-audit-dati-generali-ente.md` (Mappa chiavi tecniche e tipi).
2. **Confronto Excel**: `docs/audit/sprint-c1-confronto-excel-dati-generali.md`.
3. **Template CSV**: `templates/import/dati_generali_ente_template.csv`.
4. **Dizionario Dati**: `docs/import/dati_generali_ente_csv_dictionary.md`.
5. **Proposta Import**: `docs/audit/sprint-c1-proposta-import-csv.md`.
6. **Lettera Richiesta**: `templates/letters/richiesta_dati_costituzione_fondo.md`.
7. **Proposta Generatore**: `docs/audit/sprint-c1-generatore-lettera-richiesta-dati.md`.
8. **Proposta Wizard**: `docs/audit/sprint-c1-proposta-nuovo-wizard-dati-generali.md`.

## Risultati dell'Audit
- Identificati **28 campi chiave** per la configurazione completa.
- Rilevata la necessità di standardizzare le chiavi tecniche per l'importazione CSV.
- Definita la gerarchia dei limiti (Tetto 2016 vs Adeguamento 2018 vs Target 48% 2023).

## Criticità Rilevate
- Alcuni campi storici (2016) sono spesso difficili da reperire per gli enti; l'app deve supportare l'override manuale del totale (già implementato ma da rendere più visibile nel nuovo wizard).
- La complessità del calcolo del 48% richiede una guida contestuale forte (implementata nella proposta wizard).

## Attività Consigliate per Sprint C.2
1. Implementazione tecnica del parser CSV (`PapaParse` + Modale Import).
2. Sviluppo del Generatore PDF per la lettera di richiesta dati.
3. Inizio refactoring del Wizard secondo la struttura a 8 step proposta.

---
*Report finale Sprint C.1 completato.*
