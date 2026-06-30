# Audit Tecnico Motore Normativo 2026

Questa PR fotografa il comportamento attuale dei moduli di calcolo normativo per l'anno 2026 e non corregge formule, non modifica la UI o i dati esistenti.

## Mappa dei Calcoli (Formule Attive)

L'analisi del direttorio `src/logic/wizard2026/` ha evidenziato che le formule per l'annualità 2026 sono strutturate per moduli normativi:

1. **Limite Art. 23 comma 2 (`art23Limit.ts`)**
   - Calcola il tetto di spesa ricostruendo la base 2016 (Fondo Dipendenti + EQ + Segretario + Straordinario storici).
   - Discrimina automaticamente la presenza del Fondo Dirigenza 2016 in base al flag `hasDirigenza`.
   - Calcola l'incremento del limite tramite la differenza del personale (valori pro-capite del 2018 applicati al delta dipendenti 2026-2018).
   - Genera l'incremento di parte stabile per l'aumento dipendenti (Art. 79 c. 1 lett. c).

2. **D.L. 25/2025 (`dl25Increment.ts`)**
   - Calcola l'applicabilità diretta per enti tipo `COMUNE`.
   - Determina la soglia 48% (su stipendi 2023) e ricava il `limiteMassimoDL25` sottraendo i fondi e le risorse EQ/Altre risorse dell'anno 2025.
   - Fornisce un sistema di blocco in caso di ente dissestato, riequilibrio o privo di validazione COSFEL se deficitario.

3. **Incrementi CCNL 23.02.2026 (`ccnl2026Increments.ts`)**
   - Calcola lo **0,14%** (incremento stabile) sul Monte Salari 2021 e i relativi **arretrati** (x2).
   - Calcola lo **0,22%** (limite discrezionale, con moltiplicatore `x2` per il 2026 per inglobare anche l'anno 2025). Riparte proporzionalmente questo incremento tra Fondo Dipendenti (es. 80%) ed EQ (es. 20%) utilizzando i fondi storici del 2024 come pesi.

4. **Conglobamento Art. 60 (`conglobamentoArt60.ts`)**
   - Applica i ratei di decurtazione figurativi (es. 127.44 €/anno per Funzionari) ai dipendenti FTE calcolati e part-time.

5. **Lavoro Straordinario (`straordinarioIncrement.ts`)**
   - Calcola la riduzione stabile dello straordinario da destinare alla parte stabile del fondo accessorio.
   - Calcola il trasferimento delle economie non spese per la parte variabile.
   - Supporta i vincoli di non riducibilità del fondo per enti con dirigenza.

6. **Incremento PNRR (`pnrrIncrement.ts`)**
   - Calcola il tetto del 5% del salario accessorio (sia dirigenti che dipendenti) per enti attuatori PNRR, subordinato al rispetto rigido di 4 vincoli (equilibrio, debito commerciale, rendiconto nei termini, incidenza accessorio < 8%).

## Flusso Wizard → Costituzione Fondo

Il motore di trasferimento (`transferPreviewEngine.ts`) funge da ponte (ETL) tra lo state del Wizard (`draftState`) e la struttura dati legacy (`FundData`). I campi trasferiti sono:

- **0,14% e Arretrati**: Mappati direttamente su `fondoAccessorioDipendenteData.st_art58c1_CCNL2026_incremento014_MS2021` e `vn_art58_CCNL2026_arretrati2024_2025`.
- **0,22%**: Quota dipendenti va in `vn_art58c2_incremento_max022_ms2021`, quota EQ in `fondoElevateQualificazioniData.va_incremento022_ms2021_eq`.
- **D.L. 25/2025**: Viene trasferito l'importo _scelto_ (`incrementoApplicato`), mappato in `st_incrementoDL25_2025`, solo se è inferiore o uguale al limite massimo.
- **Art. 60 Conglobamento**: Trasferito con status `COMPUTO_FIGURATIVO` in `st_art60c2_CCNL2026_decurtazioneIndennitaComparto`.
- **Straordinario**: La riduzione stabile va in `st_art79c1_art14c3_art67c2g_riduzioneStraordinario`.
- **Art. 23 / PNRR**: Hanno status `CONTROL_ONLY` e rilevanza figurativa, quindi non vengono scritti nei campi imputabili di Costituzione (generano solo vincoli per la griglia di calcolo).

## Casi Coperti (Test)

Durante l'audit è stato creato il test eziologico completo `audit_motore_2026_characterization.test.ts` che garantisce e documenta (fotografa) i comportamenti formali:
1. DL 25/2025: Calcolo margine 48% e test di salvataggio dell'importo applicato rispetto al tetto.
2. Art. 23 (Dirigenza): Calcolo dinamico base ricostruita condizionato al flag `hasDirigenza`.
3. CCNL 23.02.2026: Corretta allocazione arretrati x2, 0.22% x2, e riparto proporzionale EQ.
4. Art. 60: Corretto posizionamento figurativo del calcolo Funzionari e validazione output.
5. Straordinario: Corretto deflusso e classificazione delle riduzioni/economie.
6. PNRR: Limite del 5% per dipendenti e dirigenti e classificazione in `CONTROL_ONLY`.

In aggiunta ai tests di caratterizzazione, il repository vanta unit tests approfonditi preesistenti (es. `MOD007_dirigenza.test.ts`, `transferPreviewEngine.test.ts`) per collision detection e calcoli individuali.

## Casi Scoperti

Dai casi caratterizzati in questa PR non emergono regressioni sui moduli principali analizzati. La copertura resta tecnica e non sostituisce una validazione normativa completa su casi reali, documentazione normativa e fogli Excel di controllo. Una minimale scopertura (non bloccante) risiede nell'engine temporale se dovessero pervenire eccezioni sull'annualità 2027 (attualmente il moltiplicatore dello 0.22% è staticamente calcolato per l'annualità `annoRiferimento === 2026`).

## Discrepanze / Bug Rilevati

- Nel file `dl25Increment.ts` la logica è passata da calcolare un incremento suggerito a calcolare rigorosamente solo un _limite massimo_, deprecando campi come `incrementoApplicato` nel result (MOD-011-quater). Tuttavia alcuni campi sono rimasti definiti per compatibilità e non andrebbero più usati dalla UI.
- `pnrrIncrement.ts` e `transferPreviewEngine.ts`: L'assenza di dati contabili (ex. Debito Commerciale) produce implicitamente validazione fallita e limite = `0` (e il transfer va in `NOT_APPLICABLE`). È logicamente corretto (approccio di prudenza per il PNRR), ma è bene che la UI del Wizard chiarisca che senza spuntare i check l'importo PNRR si auto-esclude.
- In `ccnl2026Increments.ts` il moltiplicatore applicato è _correttamente_ 2 per l'anno 2026 sia per gli arretrati (0,14) che per il limite 0,22% per conglobare il 2025; la formula restituisce quindi `limiteMassimo022` che per il 2026 assume il doppio del valore annuale, coeso con quanto richiesto dalla prassi del CCNL, ma produce un valore nominale doppio su cui l'utente potrebbe interrogarsi se non esplicitato in UI.

## Proposta per PR successiva

1. Creare un branch di cleanup e refactor (`refactor/cleanup-deprecated-fields-2026`) per ripulire interfacce (es. `dl25Increment.ts`, `ccnl2026Increments.ts`) dei commenti e campi marcati `@deprecated`.
2. Validare e includere (merge) formalmente il test di caratterizzazione end-to-end `audit_motore_2026_characterization.test.ts` introdotto in questa iterazione per blindare il framework per sviluppi successivi.
3. Se non vi sono altre integrazioni necessarie, procedere alla PR per l'audit (`feature/audit-normative-engine-2026`) mantenendo intatto l'ecosistema logico accertato.
