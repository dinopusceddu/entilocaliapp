# Report Tecnico — MOD-031B — Allineamento UI/Motore Totali EQ e Segretario

Questo report documenta le modifiche apportate per risolvere i disallineamenti tecnici tra i totali visualizzati a schermo nelle interfacce del Fondo Elevate Qualificazioni (EQ) e delle Risorse del Segretario Comunale, e le logiche di calcolo del motore backend.

---

## 1. File Modificati

I seguenti file di codice e di test sono stati modificati per riallineare i calcoli:
- **`src/logic/calculation/fundCalculations.ts`**: Aggiornate le funzioni `calculateEqSubFund` e `calculateSegretarioSubFund` per includere le voci variabili visualizzate nelle pagine UI.
- **`src/logic/fundCalculations.ts`**: Aggiornate in modo sincrono le stesse funzioni nel modulo di calcolo legacy per preservare la coerenza complessiva dell'applicazione.
- **`src/logic/__tests__/mod031bEqSegretarioTotals.test.ts`**: Creata una suite di test dedicata che valida tutte le casistiche del MOD-031B.

---

## 2. Tabella di Audit UI/Motore prima della patch

| Pagina | Voce UI | Chiave tecnica | Presente in schema | Presente nel motore totale | Effetto Art. 23 prima della patch | Azione eseguita |
|---|---|---|---|---|---|---|
| **EQ** | Maggiorazione sedi lavoro | `va_art18c5_CCNL2026_maggiorazioneSediLavoro` | Sì | No | Escluso | Inclusa nel totale disponibile EQ; mantenuta esclusa da Art. 23. |
| **EQ** | Maggiorazione interim | `va_art16c5_CCNL2026_maggiorazioneInterim` | Sì | No | Escluso | Inclusa nel totale disponibile EQ; mantenuta esclusa da Art. 23. |
| **EQ** | Armonizzazione D.L. 25/2025 | `va_dl25_2025_armonizzazione` | Sì | No | Escluso | Inclusa nel totale disponibile EQ; mantenuta esclusa da Art. 23. |
| **Segretario** | Incremento 0,80% MS 2021 (CCNL 2026) | `va_art40c1_CCNL2026_incremento080MS2021` | Sì | No | Escluso | Inclusa nel totale disponibile Segretario (ponderato %); mantenuta esclusa. |
| **Segretario** | Incremento 0,22% MS 2021 (Legge Bilancio 2025) | `va_art40c2_CCNL2026_incremento022MS2021_L207` | Sì | No | Escluso | Inclusa nel totale disponibile Segretario (ponderato %); mantenuta esclusa. |
| **Segretario** | Incentivi funzioni tecniche | `va_art21c1m_CCNL2026_incentiviFunzioniTecniche` | Sì | No | Escluso | Inclusa nel totale disponibile Segretario (ponderato %); mantenuta esclusa. |
| **Segretario** | Incremento 0,80% MS 2021 (CCNL 2022-24) | `va_art40c1_CCNL2022_2024_incremento0_80MonteSalari2021` | Sì | No | Escluso | Inclusa nel totale disponibile Segretario (ponderato %); mantenuta esclusa. |

---

## 3. Tabella Voci EQ Corrette

Le seguenti voci sono ora incluse nella quota variabile del budget delle Elevate Qualificazioni (`eq_variabile`):
- `va_art18c5_CCNL2026_maggiorazioneSediLavoro` (maggiorazione per gravosità sedi/convenzioni)
- `va_art16c5_CCNL2026_maggiorazioneInterim` (maggiorazione risultato per incarichi ad interim)
- `va_dl25_2025_armonizzazione` (armonizzazione trattamento accessorio)

---

## 4. Tabella Voci Segretario Corrette

Le seguenti voci sono ora incluse nella quota variabile delle risorse del Segretario Comunale (`sommaRisorseVariabiliSeg`), ponderate per la percentuale di copertura:
- `va_art40c1_CCNL2026_incremento080MS2021`
- `va_art40c2_CCNL2026_incremento022MS2021_L207`
- `va_art21c1m_CCNL2026_incentiviFunzioniTecniche`
- `va_art40c1_CCNL2022_2024_incremento0_80MonteSalari2021`

---

## 5. Distinzione tra Totale Disponibile e Quota Art. 23

Le logiche mantengono rigorosamente separati il budget economico totale disponibile e le componenti rilevanti ai fini del limite Art. 23 c. 2:
- **Totale Disponibile EQ**: Include la somma di tutte le risorse stabili e variabili deliberate (tra cui maggiorazioni interim, sedi e armonizzazione D.L. 25/2025).
- **Quota Soggetta Art. 23 EQ**: Rimane limitata a `ris_fondoPO2017`, `ris_incrementoConRiduzioneFondoDipendenti` e `ris_incrementoLimiteArt23c2_DL34`. La voce `va_dl25_2025_armonizzazione` e le altre maggiorazioni non incidono sulla quota rilevante (in conformità con il MOD-031A).
- **Totale Disponibile Segretario**: Include tutte le risorse economiche stabili e variabili ponderate per la percentuale di copertura dell'ente.
- **Quota Soggetta Art. 23 Segretario**: Rimane ancorata esclusivamente alle voci ordinarie stabilite nel MOD-031A (posizione base, classi demografiche, maggiorazione complessità, galleggiamento e risultato 10/15%), escludendo i nuovi incrementi e gli incentivi per funzioni tecniche.
- **Percentuale di Copertura**: È stata verificata l'applicazione singola della percentuale di copertura del Segretario a livello di modulo di calcolo delle risorse, evitando la doppia ponderazione.
- **Quota esclusa D.L. 19/2026**: Le nuove voci Segretario classificate come escluse ordinariamente non incrementano in alcun modo la quota esclusa della deroga D.L. 19/2026, la quale continua a comprendere unicamente la posizione base, classi demografiche e risultato 10%.

---

## 6. Conferma delle Classificazioni Art. 23 Mantenute

Tutte le classificazioni di spesa definite nel MOD-031A sono state preservate:
- L'armonizzazione D.L. 25/2025 per le EQ resta esclusa dal limite dell'Art. 23.
- La maggiorazione sedi e interim EQ restano escluse dal limite dell'Art. 23.
- Gli incrementi variabili dello 0,80% e dello 0,22% MS 2021 del Segretario restano esclusi dal limite.
- Gli incentivi per funzioni tecniche restano esclusi dal limite.

---

## 7. Elenco delle Classificazioni Normative ancora Congelate

Le seguenti questioni interpretative/normative rimangono non alterate e congelate:
- Eventuale ri-allineamento dei criteri di riparto della quota 0,22% MS 2018 / 2021 (differenza tra spesa relativa 2025 usata dall'App vs riparto 2021 del foglio Excel).
- Trattamento della maggiorazione sedi EQ stabili (l'Excel le tratta come stabili soggette, l'App le mantiene escluse dal limite per prudenza).

---

## 8. Elenco delle Voci ancora Mancanti e Non Implementate

Non sono state introdotte nuove voci nel modello dati (in aderenza ai vincoli), lasciando escluse le seguenti voci presenti nell'Excel:
- `eq_una_tantum_022_2024_2025` (recupero arretrati 0,22% EQ).
- `eq_indennita_ad_personam_art110` (indennità ad personam EQ).
- `eq_incremento_art33_dl34_2019` (maggiorazione in deroga EQ).
- `segretario_risultato_max_20` (risultato elevato al 20% Segretario).
- `segretario_unione_comuni_fascia_superiore` (fascia superiore per unione).

---

## 9. Test Aggiunti o Modificati

È stato creato il file di test `src/logic/__tests__/mod031bEqSegretarioTotals.test.ts` con i seguenti 9 casi di test:
1. **Test EQ 1 — maggiorazione interim**: verifica che il totale disponibile includa l'interim ma la quota soggetta non cambi.
2. **Test EQ 2 — maggiorazione sedi lavoro**: verifica il totale disponibile con la maggiorazione sedi.
3. **Test EQ 3 — armonizzazione D.L. 25/2025**: verifica l'inclusione nel totale e l'esclusione dal limite.
4. **Test Segretario 1 — voci CCNL 2026 nel totale disponibile**: verifica il totale Segretario al 100% di copertura.
5. **Test Segretario 2 — percentuale copertura 50%**: verifica il corretto dimezzamento di totale disponibile, quota soggetta e quote escluse.
6. **Test Segretario 3 — deroga D.L. 19/2026 non alterata**: verifica che i nuovi incrementi non gonfino fittiziamente la quota esclusa della deroga piccoli comuni.
7. **Condizione 5: Test EQ sole voci aggiunte valorizzate**: valida l'aumento del totale disponibile a fronte di variazione nulla del limite.
8. **Condizione 6: Test Segretario sole voci aggiunte valorizzate**: valida l'aumento del totale disponibile a fronte di variazione nulla del limite del Segretario.
9. **Test Regressione Art. 23 complessivo**: ripete il calcolo dell'ente del MOD-031A per garantire che i consumi non siano alterati.

---

## 10. Esito delle Verifiche Locali

### A. Compilazione TypeScript
```bash
npx tsc --noEmit
# Esito: Successo (Nessun errore di tipo rilevato)
```

### B. Test Unitari
L'intera suite di test è passata con successo (311 test totali):
```bash
npx vitest run
# Test Files  50 passed (50)
#      Tests  311 passed (311)
#   Duration  85.97s
```

### C. Build di Produzione
```bash
npm run build
# Esito: Successo. Generati correttamente tutti gli asset in dist/ in 26.53s.
```

---

## 11. Conferma Attività Git e Database

- **Conferma espressa**: Non è stato eseguito alcun comando di `git commit`, `git push`, `git pull`, `merge` o `rebase` sul repository locale o remoto.
- **Conferma espressa**: Non è stata effettuata alcuna operazione o modifica al database Supabase (nessuna migrazione DDL, alter table o manipolazione DML).

---

## 12. Raccomandazioni per il MOD-032

Per il prossimo step (MOD-032) si raccomanda di:
- Allineare la gestione delle voci residuali una tantum del 2024-2025 sia per il Comparto che per le EQ, introducendo un campo specifico per le quote dello 0,22% arretrate.
- Valutare l'introduzione dei campi ad personam ex Art. 110 TUEL per EQ e Dirigenza se necessari per l'ente di riferimento.
