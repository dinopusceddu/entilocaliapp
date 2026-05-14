# Audit Guida Contestuale — Sprint B.2

## 1. Stato Attuale della Documentazione Voce-per-Voce

L'audit analizza la presenza di metadati guida nei due file di definizione: `src/logic/fundFieldDefinitions.ts` (Core) e `src/pages/FondoAccessorioDipendentePageHelpers.ts` (UI Proxy).

### Parte Stabile

| Campo applicativo | Etichetta UI | Guida presente? | Fonte normativa? | Errori frequenti? | Effetto sui limiti? | Stato |
|---|---|---|---|---|---|---|
| `st_unicoImporto2017` | Unico importo consolidato 2017 | No | Sì (rif) | No | No | `PARZIALE` |
| `st_alteProfessionalita` | Alte professionalità non utilizzate | No | Sì (rif) | No | No | `PARZIALE` |
| `st_incr8320` | Incremento €83,20/unità | No | Sì (rif) | No | No | `PARZIALE` |
| `st_incrStipendialiDiff` | Incrementi stipendiali differenziali | No | Sì (rif) | No | No | `PARZIALE` |
| `st_integrazioneRIA` | Integrazione RIA cessati | No | Sì (rif) | No | No | `PARZIALE` |
| `st_risorseRiassorbite165` | Risorse riassorbite 165/01 | No | Sì (rif) | No | No | `PARZIALE` |
| `st_personaleTrasferito` | Risorse personale trasferito | No | Sì (rif) | No | No | `PARZIALE` |
| `st_riduzioneDirigRegioni` | Regioni: riduzione posti dirig. | No | Sì (rif) | No | No | `PARZIALE` |
| `st_riduzioneStraordinario` | Riduzione stabile straordinario | No | Sì (rif) | No | No | `PARZIALE` |
| `st_taglioFondoDL78_2010` | Taglio fondo DL 78/2010 | Parziale (UI) | Sì | Parziale (UI) | Sì (UI) | `PARZIALE` |
| `st_riduzioniPersonaleATA` | Riduzioni ATA/PO/Esternaliz. | No | Sì (rif) | No | No | `PARZIALE` |
| `st_decurtazionePO_AP` | Decurtazione PO/AP | No | Sì (rif) | No | No | `PARZIALE` |
| `st_euro8450` | Incremento €84,50/unità | No | Sì (rif) | No | No | `PARZIALE` |
| `st_incrConsistenzaPers` | Incremento per consistenza pers. | No | Sì (rif) | No | No | `PARZIALE` |
| `st_diffStipendiali2022` | Differenziali stipendiali 2022 | No | Sì (rif) | No | No | `PARZIALE` |
| `st_diffStipendialiB3D3` | Differenze stipendiali B3 e D3 | No | Sì (rif) | No | No | `PARZIALE` |
| `st_incremento014_MS2021` | Incremento stabile 0,14% | Sì | Sì | Sì | Sì | `COMPLETA` |
| `st_incrementoDL25_2025` | Incremento D.L. 25/2025 | Sì | Sì | Sì | Sì | `COMPLETA` |
| `st_riduzioneIncrEQ` | Riduzione per incremento risorse EQ | Parziale (UI) | Sì | Parziale (UI) | Sì (UI) | `PARZIALE` |
| `st_decurtIndennitaComp` | Decurtazione conglobamento | Parziale (UI) | Sì | Parziale (UI) | Sì (UI) | `PARZIALE`* |
| `st_riduzioneFondoStraord`| Riduzione per fondo Straord. | No | Sì (rif) | No | No | `DA VERIFICARE` |

*\*Nota: è completa in logic ma ha testi diversi in UI.*

### Parte Variabile

| Campo applicativo | Etichetta UI | Guida presente? | Fonte normativa? | Errori frequenti? | Effetto sui limiti? | Stato |
|---|---|---|---|---|---|---|
| `vs_recuperoEvasione` | Recupero evasione ICI/IMU | No | Sì (rif) | No | No | `PARZIALE` |
| `vs_integrazioneRIA` | Integrazione RIA mensile | No | Sì (rif) | No | No | `PARZIALE` |
| `vs_personaleCaseGioco` | Risorse personale case da gioco | No | Sì (rif) | No | No | `PARZIALE` |
| `vs_max1_2MS1997` | Max 1,2% monte salari 1997 | No | Sì (rif) | No | No | `PARZIALE` |
| `vs_personaleTrasferito` | Integrazione pers. trasferito | No | Sì (rif) | No | No | `PARZIALE` |
| `vs_scelteOrganizzative` | Risorse per scelte organizzative | No | Sì (rif) | No | No | `PARZIALE` |
| `vn_sponsorConvenzioni` | Sponsorizzazioni e convenzioni | No | Sì (rif) | No | No | `PARZIALE` |
| `vn_notificaMessi` | Rimborso spese notifica | No | Sì (rif) | No | No | `PARZIALE` |
| `vn_pianiRazionalizzaz` | Piani di razionalizzazione | No | Sì (rif) | No | No | `PARZIALE` |
| `vn_incentiviTecnici` | Incentivi funzioni tecniche | Parziale (UI) | Sì | Parziale (UI) | Sì (UI) | `PARZIALE` |
| `vn_speseGiudizio` | Incentivi spese giudizio | No | Sì (rif) | No | No | `PARZIALE` |
| `vn_risparmiStraord` | Risparmi disciplina straordinario | No | Sì (rif) | No | No | `PARZIALE` |
| `vn_sommeNonUtilizzate` | Somme non utilizzate prec. | No | Sì (rif) | No | No | `PARZIALE` |
| `vn_incentiviIMUTARI` | Incentivi IMU/TARI | No | Sì (rif) | No | No | `PARZIALE` |
| `vn_incremento022_2026` | Incremento max 0,22% MS 2021 | Sì | Sì | Sì | Sì | `COMPLETA` |
| `vn_arretrati2024_2025` | Arretrati 2024-2025 | Sì | Sì | Sì | Sì | `COMPLETA` |

### Verifiche e Limiti

| Campo applicativo | Etichetta UI | Guida presente? | Fonte normativa? | Errori frequenti? | Effetto sui limiti? | Stato |
|---|---|---|---|---|---|---|
| `cl_art23c2_tetto2016` | Decurtazione tetto 2016 | Parziale (UI) | Sì | Parziale (UI) | Sì (UI) | `PARZIALE` |

## 2. Analisi dei Gap e Duplicazioni

1. **Incoerenza Metadati**: Le definizioni core (`fundFieldDefinitions.ts`) e quelle UI (`FondoAccessorioDipendentePageHelpers.ts`) usano schemi di metadati diversi per la guida, causando frammentazione.
2. **Duplicazione Logica**: `getFadFieldDefinitions` è implementato due volte, rendendo difficile la manutenzione dei testi normativi.
3. **Voci Critiche 2026**: Le voci introdotte nello Sprint B.1 sono le uniche realmente complete, ma mancano di integrazione con le voci storiche (Art. 67/79).
4. **Note di Trasparenza**: Presenti solo in via sperimentale nel file UI per 3-4 voci.

## 3. Piano di Intervento (Sprint B.2)

- **Fase 2**: Unificare l'interfaccia `FieldDefinition` per supportare tutti i metadati del popover.
- **Fase 3**: Centralizzare tutte le definizioni in `src/logic/fundFieldDefinitions.ts` e rimuovere la duplicazione in `PageHelpers.ts`.
- **Fase 4**: Completare le descrizioni per tutte le voci prioritarie (Parte Stabile/Variabile).
- **Fase 5**: Assicurarsi che ogni voce indichi esplicitamente l'inclusione/esclusione dall'Art. 23 c. 2.

---
*Audit prodotto in data 07/05/2026 — Team di Sviluppo entilocaliapp*
