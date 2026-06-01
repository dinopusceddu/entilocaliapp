# Mappa Wizard Fondo Dipendenti 2026

## SEZIONE 1 — Stato attuale del vecchio wizard e della logica legacy

**Dove si trova il vecchio wizard:**
L'attuale flusso di inserimento risiede in `src/pages/DataEntryPage.tsx`, che gestisce la dicotomia tra un nuovo wizard per i "Dati Generali Ente" (a 10 step, `DatiGeneraliWizard`) e una "Vista Avanzata" tecnica, che rappresenta il vecchio wizard strutturato in un form a 5 step.

**Quali step esistono oggi (Vista Avanzata):**
1. Dati Generali Ente
2. Dati Storici
3. CCNL Funzioni Locali 23.02.2026
4. Dati Annuali
5. Calcolo (Simulatore Incremento e Riepilogo)

**Quali componenti vengono usati:**
Vengono utilizzati svariati form specifici come `EntityGeneralInfoForm`, `HistoricalDataForm`, `Ccnl2024SettingsForm`, `Art23EmployeeAndIncrementForm`, `AnnualDataForm` e `SimulatoreIncrementoForm`.

**Quali dati vengono chiesti oggi:**
Dati anagrafici, storici (Fondo 2016 e limiti), personale in servizio (per area e in FTE), parametri per l'applicazione del CCNL (es. % part-time, monte salari 2021), e dati per PNRR e fondo straordinario.

**Quali dati sono collegati allo stato globale:**
Tutti i dati raccolti alimentano direttamente `fundData` (con `annualData` e `historicalData`) all'interno dell'app state gestito in `src/contexts/AppContext.tsx` tramite action del reducer.

**Quali dati sono solo UI:**
Gli stati temporanei come `viewMode`, `currentStep`, e i campi del `draftData` (nel DatiGeneraliWizard) prima del commit sono solo UI/locali.

**Quali dati sono già trasferiti alla pagina Costituzione Fondo:**
Attualmente, alla pressione di "Salva Dati e Calcola Fondo", viene invocato `performFundCalculation()` che prende i dati globali, li processa col `fundEngine`, e aggiorna `fondoAccessorioDipendenteData`, che alimenta la pagina `FondoAccessorioDipendentePage`.

**Quali calcoli sono oggi effettuati nel wizard:**
Nel wizard vengono effettuati calcoli intermedi come il simulatore del limite Art. 23 e un pre-calcolo del PNRR 3 (`calcolatoIncrementoPNRR3` in `AnnualDataForm`). Nel form CCNL vengono anche mostrati calcoli preview.

**Quali calcoli sono oggi effettuati nel modulo Costituzione Fondo:**
Il vero calcolo aggregato è orchestrato da `fundEngine.ts` che chiama funzioni di `fundCalculations.ts` e `ccnl2024Calculations.ts`, calcolando incrementi stabili, variabili, decurtazioni, limiti Art. 23 e verifiche performance.

**Quali funzioni legacy sono operative:**
Funzioni pure come `calculateCcnl2024Increases`, `calculateArt23Limit`, e l'orchestrazione intera `calculateFundCompletely`.

**Quali funzioni legacy non devono essere toccate:**
Tutte le funzioni attuali in `src/logic/calculation/fundCalculations.ts`, `fundEngine.ts`, `ccnl2024Calculations.ts` e le relative mappature nello stato. Queste rappresentano il "sistema operativo" di base e vanno preservate nella fase di transizione.

**Criticità:**
Sostituire prematuramente la Vista Avanzata o il vecchio wizard prima della stabilizzazione del nuovo, comporterebbe la rottura di test, la possibile perdita di dati legacy e bloccherebbe il motore di calcolo attuale che è strettamente accoppiato all'interfaccia corrente.

**Dati a rischio:**
Campi specifici come `st_incrementoDL25_2025`, `st_art60c2_CCNL2026_decurtazioneIndennitaComparto`, dati su Piani Welfare o performance corrono il rischio di essere sovrascritti o azzerati se il nuovo wizard viene semplificato e va in commit senza mappare correttamente questi valori essenziali per l'archivio storico.

## SEZIONE 2 — Strategia di affiancamento nuovo wizard / vecchio wizard / vecchi calcoli

**Mantenimento in parallelo:**
Il nuovo "Wizard Istruttorio Fondo 2026" sarà implementato come un percorso React separato (es. un tab dedicato o un branch distinto in `viewMode`), mantenendo del tutto inalterato l'uso di `DataEntryPage.tsx` e i form legati al vecchio sistema. 

**Cosa resta legacy:**
L'intero `fundEngine`, `fundCalculations`, lo stato globale `fondoAccessorioDipendenteData`, e le action del context attuale restano inalterati e operativi per la vecchia pagina "Costituzione Fondo" e il vecchio flusso di data entry.

**Cosa diventa nuovo:**
Verrà creato un nuovo contenitore (`WizardIstruttorio2026`), uno stato locale per il wizard (`wizard2026DraftState`), e una directory di calcoli pura (`src/logic/wizard2026Calculations.ts`) per eseguire i calcoli istruttori specifici norma per norma.

**Cosa deve essere solo alias temporaneo:**
I campi del nuovo wizard saranno memorizzati nello stato locale del wizard (`wizard2026DraftState`) e mostrati all'utente. Costituiscono un alias temporaneo in lettura. È essenziale chiarire che questo stato isolato locale non è uno stato parallelo permanente: non modificherà lo stato globale (`annualData` o `historicalData`) in automatico, non deve essere salvato su Supabase finché non è definito il mapping per non corrompere i dati, non deve sostituire il `fundData` base dell'app, e dovrà poter essere eliminato o interamente migrato nella fase finale di sostituzione.

**Confronto vecchia/nuova logica:**
Nell'ultimo step del nuovo wizard, le nuove funzioni simuleranno i risultati. In parallelo, il wizard invocherà in modalità read-only le funzioni legacy e confronterà il risultato del nuovo calcolo con la vecchia logica in una tabella "Delta".

**Prevenzione rotture e sovrascritture:**
Il nuovo wizard NON farà alcun dispatch verso i campi globali della costituzione del Fondo (né verso il vecchio schema di DB su Supabase) durante la fase di inserimento e test. L'acquisizione dei dati si appoggerà ad un namespace isolato.

**Collaudo e sostituzione progressiva:**
Il nuovo wizard sarà utilizzabile in parallelo (fase "beta istruttoria"). L'utente lo userà per capire l'impatto normativo e visualizzare il calcolo. Il trasferimento alla pagina "Costituzione Fondo" vera e propria avverrà solo a valle del collaudo, tramite un trigger esplicito che mapperà rigorosamente i dati dal `wizard2026DraftState` al global `fundData`.

## SEZIONE 3 — Architettura consigliata del nuovo wizard

### Step 1 — Ente e condizioni preliminari
- **Obiettivo:** Raccogliere informazioni anagrafiche, strutturali e di bilancio.
- **Dati richiesti:** Tipologia ente, presenza dirigenza, rispetto equilibrio di bilancio, debito commerciale e incidenza salario accessorio.
- **Spiegazione:** "Questi dati determinano a quali norme l'ente è soggetto e se ha diritto ad agevolazioni, come gli incrementi previsti dal PNRR."
- **Norma:** D.Lgs. 267/2000 (TUEL).
- **Calcoli:** Verifiche booleane (applicabilità successiva).
- **Output:** Flag abilitativi per le sezioni seguenti. (Informativo).

### Step 2 — Limite art. 23, comma 2, D.Lgs. 75/2017
- **Obiettivo:** Fissare il limite complessivo del trattamento accessorio riferito all’anno 2016.
- **Dati richiesti:** Fondo personale dipendente 2016, fondo EQ/PO 2016, fondo dirigenza 2016 (se presente), risorse segretario comunale 2016, fondo lavoro straordinario 2016, eventuale limite 2016 già certificato dall’ente, risorse soggette attuali, risorse escluse dal limite.
- **Spiegazione:** "Il legislatore vieta di superare il limite del 2016 complessivo per contenere la spesa. Vanno raccolti tutti i sotto-fondi per ricomporre il massimale."
- **Norma:** Art. 23, comma 2, D.Lgs. 75/2017.
- **Calcoli:** Ricostruzione e somma prudente del limite 2016 depurato. Eventuali specifici adeguamenti (come art. 33 c.2) verranno calcolati a parte, senza sostituire il limite generale.
- **Output:** Valore limite massimo teorico (Informativo, per calcoli a valle).

### Step 3 — D.L. 25/2025
- **Obiettivo:** Calcolare il nuovo incremento di dotazione per gli enti idonei.
- **Dati richiesti:** Spesa per stipendi tabellari 2023 del personale non dirigente (`stipendiTabellari2023NonDirigenti`), fondo stabile 2025 certificato, budget EQ 2025.
- **Spiegazione:** "Il D.L. 25/2025 consente un potenziamento del fondo pari alla differenza tra il 48% della spesa per stipendi tabellari 2023 e la spesa accessoria 2025."
- **Norma:** D.L. 25/2025.
- **Calcoli:** max(0, (stipendiTabellari2023NonDirigenti * 0,48) - Fondo2025 - EQ2025).
- **Output:** Incremento applicabile o "NON APPLICABILE". (Di confronto con vecchia logica).

### Step 4 — Incrementi 0,14% e 0,22% CCNL 23.02.2026
- **Obiettivo:** Inserire le percentuali contrattuali 2026.
- **Dati richiesti:** Monte salari 2021 netto.
- **Spiegazione:** "Il nuovo CCNL impone un aumento stabile obbligatorio dello 0,14% e facoltizza un ulteriore incremento dello 0,22% basato sul monte salari 2021."
- **Norma:** Art. 58 c.1 e c.2, CCNL 23.02.2026.
- **Calcoli:** 0,14% * Monte Salari 2021 (stabile), 0,22% * Monte Salari 2021 (variabile).
- **Output:** Valori economici. (Destinato al futuro trasferimento).
*Nota esplicita di distinzione: Il D.L. 25/2025 usa gli stipendi tabellari 2023 del personale non dirigente, mentre gli incrementi CCNL 23.02.2026 usano il Monte Salari 2021. I due blocchi non condividono la stessa base di calcolo e non devono essere sommati senza una verifica puntuale del limite art. 23 e della qualificazione del soggetto.*

### Step 5 — Conglobamento art. 60 CCNL 23.02.2026
- **Obiettivo:** Effettuare la decurtazione del fondo stabile a causa del conglobamento dell'indennità di comparto.
- **Dati richiesti:** Dipendenti al 01.01.2026 in FTE, divisi per area inquadramento.
- **Spiegazione:** "L'indennità di comparto entra a far parte della quota fissa mensile: tale quota deve perciò essere scalata in via stabile dal Fondo Accessorio."
- **Norma:** Art. 60, CCNL 23.02.2026.
- **Calcoli:** Somma(FTE_Area × importo annuo area). Gli importi normativi sono già espressi su base annuale.
- **Output:** Decurtazione stabile. (Destinato al futuro trasferimento).

### Step 6 — Fondo lavoro straordinario
- **Obiettivo:** Dimensionare i tetti del fondo per il lavoro straordinario, distinguendo accuratamente le sue fonti.
- **Dati richiesti:** Fondo straordinario 2016, fondo straordinario anno corrente, incremento straordinario CCNL 2026, eventuale riduzione fondo decentrato per enti senza dirigenza, economie straordinario anno precedente, risorse escluse (straordinario elettorale, calamità).
- **Spiegazione:** "Regolamenta le risorse per lo straordinario in modo che non sforino il tetto previsto, operando diversamente in presenza o assenza di dirigenza. Distingue chiaramente il fondo storico, le economie (una tantum) e gli eventuali incrementi."
- **Norma:** CCNL 23.02.2026, art. 67.
- **Calcoli:** Incremento nei limiti dell'art. 23 (se dirigenti), oppure riduzione di altri sotto-fondi (senza dirigenti). Isolamento delle economie e delle risorse escluse.
- **Output:** Entità del fondo straordinario. (Informativo e di confronto).

### Step 7 — PNRR art. 8, comma 3, D.L. 13/2023
- **Obiettivo:** Determinare il massimale variabile derogatorio (5%).
- **Dati richiesti:** Fondo 2016 stabile. (Requisiti di virtuosità dedotti allo Step 1).
- **Spiegazione:** "I Comuni in equilibrio finanziario possono incrementare la parte variabile del Fondo per sostenere la progettazione PNRR (fino al 5% del Fondo Stabile 2016)."
- **Norma:** Art. 8, c. 3, D.L. 13/2023.
- **Calcoli:** 5% del fondo 2016.
- **Output:** Incremento variabile ammesso. (Di confronto).

### Step 8 — Riepilogo, confronto e trasferimento futuro alla pagina Costituzione Fondo
- **Obiettivo:** Sintesi contabile totale e paragone col vecchio cruscotto.
- **Dati richiesti:** Nessuno.
- **Spiegazione:** "I risultati prodotti dal nuovo wizard normativo sono pronti e messi in comparazione col vecchio motore."
- **Calcoli:** Delta analitico tra risultati `wizard2026DraftState` elaborati e `fondoAccessorioDipendenteData`.
- **Output:** Reportistico e informativo in fase di test. Abiliterà il trasferimento in una release successiva.

## SEZIONE 4 — Mappa dati per il nuovo wizard

### Step 1: Ente e condizioni
| Dato richiesto | Descrizione | Perché serve | Norma | Campo esistente | Campo mancante/Nuovo | Tipo | Formula | Funz. Legacy | Nuova Funz. | Campo Finale | Note | Rischio |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Tipologia | Ente (Comune, Provincia, ecc.) | Per regole applicabili. | TUEL | `tipologiaEnte` | Nessuno | Legacy | - | - | - | `tipologiaEnte` | Obbl. | Sovrascrittura |
| Dirigenza | Presenza dirigenza | Cambia regole Art.23 e straordinario. | - | `hasDirigenza` | Nessuno | Legacy | - | - | - | `hasDirigenza` | Obbl. | Sovrascrittura |
| Virtuosità | Parametri di bilancio | Ammissione PNRR 5% | DL 13/2023 | `rispettoEquilibrio...` | Nessuno | Legacy | - | In UI | - | `rispettoEquilibrio...` | Obbl. | Basso |

### Step 2: Limite Art. 23
| Dato richiesto | Descrizione | Perché serve | Norma | Campo esistente | Campo mancante/Nuovo | Tipo | Formula | Funz. Legacy | Nuova Funz. | Campo Finale | Note | Rischio |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Fondi 2016 | Vari Fondi 2016 e risorse soggette | Fissa il tetto 2016 | Art.23 c.2 | Moltiplicità di campi 2016| Da raggruppare nel nuovo state | Misto | Somma fondi | `calculateArt23Limit` | `calcArt23Wizard` | Limite Art.23 | Obbl. | Basso |
| Risorse Escluse | Es. Straordinario elezioni | Nettizzazione limiti | Art.23 c.2 | Parzialmente in `annualData` | Campi per elezioni/calamità | Nuovo | Sottrazione | `calculateArt23Limit` | `calcArt23Wizard` | Limite Art.23 | Obbl. | Basso |

### Step 3: D.L. 25/2025
| Dato richiesto | Descrizione | Perché serve | Norma | Campo esistente | Campo mancante/Nuovo | Tipo | Formula | Funz. Legacy | Nuova Funz. | Campo Finale | Note | Rischio |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Applicabilità | Idoneità all'incremento | Filtro enti | DL 25/2025 | Nessuno | `statoApplicabilitaDL25`| Nuovo | Enum check | - | `checkAmmissibilitaDL25` | (stato UI) | Obbl. | Errati calcoli |
| Quota aderenti | Quota trasferita per TRANSFER_ONLY | Incremento trasferito | DL 25/2025 | Nessuno | `quotaTrasferitaAderentiDL25_2025` | Nuovo | Input puro | - | - | `quotaTrasferitaAderentiDL25_2025` | Da verif. | Non unire a incremento diretto |
| Stip. Tab. 2023| Spesa stipendi tabellari 2023 non dirigenti | Base del 48% | DL 25/2025 | Nessuno | `stipendiTabellari2023NonDirigenti` | Nuovo | `stipTab2023 * 0.48` | - | `calcDL25` | `st_incrementoDL25_2025` | Obbl. x DIRECTLY_APPLICABLE | Sovrascrittura DL 25 |
| Spesa 2025 | Fondo e EQ 2025 | Sottrazione dal tetto | DL 25/2025 | Nessuno | `spesaAccessoria2025` | Nuovo | - | - | - | - | Obbl. | - |

### Step 4: CCNL 23.02.2026
| Dato richiesto | Descrizione | Perché serve | Norma | Campo esistente | Campo mancante/Nuovo | Tipo | Formula | Funz. Legacy | Nuova Funz. | Campo Finale | Note | Rischio |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| MS 2021 | Monte Salari | Base per 0.14% e 0.22% | CCNL 2026 | `monteSalari2021` | Nessuno | Legacy | `ms2021 * %` | `calculateCcnl2024Increases` | `calcIncrementiCCNL26` | Variabili CCNL | Obbl. | Non mischiare con MS2023 |

### Step 5: Conglobamento Art. 60
| Dato richiesto | Descrizione | Perché serve | Norma | Campo esistente | Campo mancante/Nuovo | Tipo | Formula | Funz. Legacy | Nuova Funz. | Campo Finale | Note | Rischio |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| FTE x Area | Personale al 01.01.2026 | Calcolo decurtazione | Art.60 CCNL| In `ivcConglobation` | `ftePerArea01012026` | Nuovo | `Somma(FTE × importo annuo area)` | In `ccnl2024Calculations` | `calcConglobamento` | `st_art60c2...` | Obbl. | Indennità a distribuzione (Doppio) |

### Step 6: Fondo Straordinario
| Dato richiesto | Descrizione | Perché serve | Norma | Campo esistente | Campo mancante/Nuovo | Tipo | Formula | Funz. Legacy | Nuova Funz. | Campo Finale | Note | Rischio |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Straord. Originario| Risorse consolidate | Definizione tetto | Art.67 CCNL| `fondoLavoroStraordinario` | `straordinarioBase2016` | Alias | `min(inc, marg)` | - | `calcStraordinario` | - | Obbl. | Storico vs Corrente |
| Decurtazione | Se no-dirigenza | Compensazione fondo | Art.67 CCNL| Nessuno | `riduzioneFondoPerStraordinario` | Nuovo | - | - | - | `vn_art15c1m...` | Obbl. | Doppio taglio |

### Step 7: PNRR
| Dato richiesto | Descrizione | Perché serve | Norma | Campo esistente | Campo mancante/Nuovo | Tipo | Formula | Funz. Legacy | Nuova Funz. | Campo Finale | Note | Rischio |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Fondo Stabile 2016 | Base del 5% | Limite PNRR | DL 13/2023 | `fondoStabile2016PNRR` | Nessuno | Legacy | `Fondo * 0.05` | In UI `AnnualDataForm` | `calcPNRR` | `vn_dl13...` | Facolt. | PNRR vs altre variabili |

## SEZIONE 5 — D.L. 25/2025: controllo soggettivo

La verifica della tipologia di ente deve essere rigorosamente ricostruita nel wizard con uno stato esplicito `statoApplicabilitaDL25`:

- **DIRECTLY_APPLICABLE**: Applicazione diretta ammessa solo per: Regioni, Città metropolitane, Province, Comuni. (Valorizzano il campo `st_incrementoDL25_2025`).
- **TRANSFER_ONLY**: Applicazione diretta non ammessa, ma eventuale quota trasferita dai Comuni aderenti. Previsto per: Unioni di Comuni, Comunità montane, Comunità isolane o di arcipelago. (Valorizzano il campo `quotaTrasferitaAderentiDL25_2025`).
- **NOT_APPLICABLE**: Applicazione diretta non ammessa per: Camere di Commercio, enti regionali o strumentali regionali, enti parco, consorzi, ASP, aziende speciali, istituzioni, altri enti strumentali.
- **NEEDS_MANUAL_REVIEW**: Casi ibridi che richiedono collaudo manuale.

**Per Unioni di Comuni, Comunità montane e Comunità isolane o di arcipelago (`TRANSFER_ONLY`):**
- Non eseguire MAI il calcolo diretto del 48%.
- Prevedere la richiesta esclusiva della "quota trasferita dai Comuni aderenti".
- Richiedere e loggare esplicitamente l'acquisizione di: atti dei Comuni aderenti, la riduzione permanente dei fondi dei Comuni aderenti e la certificazione/revisione degli atti.
- Salvare il dato in un campo distinto, es. `quotaTrasferitaAderentiDL25_2025`. Non inserire automaticamente questo valore nel generico `st_incrementoDL25_2025`: il trasferimento alla costituzione del fondo sarà deciso solo in fase successiva, con mapping controllato.

## SEZIONE 6 — Costanti e formule da verificare

**Conglobamento art. 60 CCNL 23.02.2026**
- *Costanti da includere (importi già annuali):* 
  - Funzionari/EQ: 435,96
  - Istruttori: 384,72
  - Operatori esperti: 330,24
  - Operatori: 272,16
- *Formula base:* `riduzione = importo annuo area × FTE`
- *Test Minimo atteso:* 1 Funzionario/EQ al 75% + 1 Operatore esperto all’80% = 435,96 × 0,75 + 330,24 × 0,80 = 591,16.
- *Gestione Legacy:* La logica legacy esiste integrata in `ccnl2024Calculations.ts`. Occorrerà esporre una nuova funzione `calcConglobamento` specifica per i calcoli in live-preview del wizard 2026. Non altera il fondo subito.

**D.L. 25/2025**
- *Formula base:* 
  - `soglia_48 = stipendi_tabellari_2023_non_dirigenti × 0,48`
  - `incremento_massimo_teorico = max(0, soglia_48 - fondo_stabile_2025_certificato - budget_eq_2025)`
  - `incremento_dl25_applicato <= incremento_massimo_teorico`
- *Gestione Legacy:* Manca di una sua pipeline pura isolata, sarà creata `calcDL25` e destinata al semplice confronto live.

**CCNL 23.02.2026 (0,14% e 0,22%)**
- *Formula base:*
  - `incremento014 = monte_salari_2021 × 0,0014`
  - `incremento022 = monte_salari_2021 × 0,0022`
- *Gestione Legacy:* Già operata in `calculateCcnl2024Increases`. La nuova funzione wizard simulerà i valori, comparandosi con la legacy.

**PNRR art. 8, comma 3, D.L. 13/2023**
- *Formula base:* `incremento_massimo_pnrr = componente_stabile_2016 × 0,05`
- *Gestione Legacy:* L'attuale calcolo è inglobato nella UI di `AnnualDataForm.tsx`. Andrà astratto in `calcPNRR` nel nuovo set di regole wizard.

**Fondo lavoro straordinario**
- *Formula enti con dirigenza:* `incremento_straordinario_ammesso = min(incremento_richiesto, margine_art23)`
- *Formula enti senza dirigenza:* `riduzione_fondo_decentrato >= incremento_straordinario_richiesto`
- *Gestione Legacy:* La logica richiede astrazione in `calcStraordinario` prevedendo due suite di test minime separate (con vs senza dirigenza).

## SEZIONE 7 — Campi da non perdere

E' di vitale importanza assicurarsi che il nuovo wizard contempli e preservi questi campi legacy, senza sovrascriverli o ometterli:
- `st_incrementoDL25_2025`: Campo core del decreto, sarà mappato solo in fase conclusiva.
- `st_art60c2_CCNL2026_decurtazioneIndennitaComparto`: Fodamentale da non perdere nell'output, si affianca al conglobamento.
- `vn_art58c2_CCNL2026_incremento022_MS2021`: Assicurarsi che i valori variabili contrattuali non vadano persi.
- `vn_dl13_art8c3_incrementoPNRR_max5stabile2016`: Chiave di volta per il plus del 5% PNRR.
- `vn_art15c1m_art67c3e_risparmiStraordinario`: Deve continuare a vivere in parallelo.
- `p_pianiWelfare`, e tutti i campi relativi alla performance (individuale, organizzativa, maggiorazioni).
- `personaleServizio` e `annualData.fondoLavoroStraordinario`: Fungeranno da alias di partenza letti dal nuovo wizard, ma un'eventuale sovrascrittura prematura corromperebbe le schede storiche.
- Dati storici 2016, dati del pre-calcolo Art. 23 e storici legati alle posizioni di EQ e Segretario.

## SEZIONE 8 — Campi mancanti da aggiungere

Onde abilitare il calcolo a 360°, si proporrà di aggiungere al namespace isolato del nuovo wizard (`wizard2026State`):
- `statoApplicabilitaDL25` (enum/string): per il lock delle logiche di tipo ente (Posizione: `wizard2026.DL25`).
- `quotaTrasferitaAderentiDL25_2025` (number, iniziale `0`): per recepire quote per gli enti di tipo `TRANSFER_ONLY`.
- `fondoStraordinario2016` (number): alias legacy da separare chiaramente dal fondo corrente.
- `fondoStraordinarioAnnoCorrente` (number): campo base netto.
- `incrementoStraordinarioCCNL2026` (number, iniziale `0`): valore di incremento richiesto.
- `riduzioneFondoPerStraordinario` (number, iniziale `0`): la cifra sottratta dalle risorse stabili/variabili.
- `economieStraordinarioAnnoPrecedente` (number): propedeutiche ai calcoli art. 67. Non devono essere trattate come incremento stabile del fondo.
- `straordinarioElettoraleEscluso`, `straordinarioCalamitaEscluso`, `altreRisorseStraordinarioEscluse` (number, iniziale `0`): utili alla nettizzazione del calcolo di rispetto dell'art. 23 e distinte dallo storico.
- `wizardStatoDati` (enum: `PRESENTE`, `MANCANTE`, `NON_APPLICABILE`, `DA_VERIFICARE`): necessario a monitorare la completezza del percorso. Letti e scritti solo dal nuovo wizard per governare la validazione.

## SEZIONE 9 — Rischi di doppio conteggio e sovrascrittura

**Distinzione fondi e basi di calcolo (Doppio Conteggio):**
- **Conglobamento vs Indennità comparto:** Attenzione al rischio di tagliare l'importo fisso in Costituzione e, parallelamente, continuare a finanziare e calcolare la voce "Indennità di comparto" in fase di Distribuzione (come se fosse ancora interamente lì). 
- **D.L. 25/2025 vs Incrementi CCNL 2026:** Si avverte che il D.L. 25 usa gli stipendi tabellari 2023 del personale non dirigente, mentre lo 0,14% e lo 0,22% del CCNL usano il Monte Salari 2021. I due blocchi non devono condividere la stessa base di calcolo e non devono essere sommati senza una verifica rigorosa del limite art. 23 e della qualificazione del soggetto a riceverli.
- **Straordinario Storico vs Corrente vs Economie:** Non sommare il fondo 2016 con i reintegri di economie dell'anno precedente. Le economie dello straordinario non devono mai essere trattate come un incremento stabile del fondo lavoro straordinario.
- **Differenziali stipendiali:** Doppio calcolo tra progressioni storiche ed eventuali neo-progressioni dell'anno in corso non nettizzate.
- **PNRR vs altre variabili:** Il 5% calcolato per il PNRR deve godere di esenzione dal limite Art. 23, pena l'erosione di altri spazi.

**Rischi Sovrascrittura e Integrità:**
- Le utility di Export/Import CSV e la Lettera Dati potrebbero corrompere il `fundData` sovrascrivendo i valori su cui il nuovo wizard basa il suo `draftState`, e viceversa.
- L'utilizzo prematuro dei risultati del nuovo wizard sulla view della pagina Costituzione Fondo confonderebbe l'utente e inficerebbe reportistiche storicizzate.
- Se si cambia tipologia ente (es. da Comune a Unione) in corso d'opera, occorre forzare il reset delle logiche per non tenersi "in pancia" il D.L. 25.
- Tentativi di salvare `wizard2026DraftState` incompleti su Supabase causeranno fail nei model strict se il mapping al db non è stato ancora predisposto.

## SEZIONE 10 — Piano tecnico successivo

I prossimi interventi, nell'ordine e da effettuarsi esclusivamente in fasi protette successive:

1. Creazione funzioni pure `wizard2026Calculations.ts` in parallelo alle legacy.
2. Test delle formule (unit tests specifici per D.L. 25, Conglobamento e Straordinario).
3. Integrazione della logica di confronto risultati (Delta) tra legacy e nuovo wizard.
4. Aggiornamento dei tipi TypeScript (`types.ts`, `appState.ts`) con massima compatibilità legacy e inserimento dei placeholder.
5. Costruzione della UI (`WizardIstruttorio2026.tsx`) strutturata norma per norma come percorso aggiuntivo opzionale.
6. Aggiunta delle validazioni step per step interne al nuovo wizard.
7. Implementazione dello step di riepilogo finale che mostra il confronto *senza applicare sostituzioni automatiche*.
8. Predisposizione del trasferimento controllato verso la pagina Costituzione Fondo, bloccato dietro flag di collaudo.
9. Aggiornamento selettivo degli strumenti accessori (CSV / Excel / Lettera richiesta dati) per supportare i nuovi campi solo se il wizard è attivato in produzione.
10. Allineamento progressivo delle stampe e della reportistica di sintesi.
11. Build e sessioni estese di collaudo manuale.
12. Solo dopo completa validazione architetturale, documentale e utente: approvazione del merge, pulizia del codice e sostituzione progressiva del vecchio wizard e dei vecchi calcoli in dismissione.

## Correzioni apportate con Prompt 1-bis
- **Conglobamento art. 60 CCNL 23.02.2026:** Corretta la formula della riduzione in `Somma(FTE_Area × importo annuo area)`, eliminando la moltiplicazione per 12 poiché le costanti contrattuali indicate sono già importi annuali.
- **Terminologia D.L. 25/2025:** Sostituito "Monte salari 2023" con "spesa per stipendi tabellari 2023 del personale non dirigente" (`stipendiTabellari2023NonDirigenti`) sia nel testo che nelle formule.
- **Distinzione basi D.L. 25 e CCNL 2026:** Inserita chiara specifica in Step 4 e Sezione 9 sull'uso di basi diverse (stipendi tabellari 2023 per il D.L. 25 vs monte salari 2021 per il CCNL 2026) e sul divieto di sommarli senza verifiche mirate.
- **Limite Art. 23:** Riformulato lo Step 2 in ottica prudente, superando il mero riferimento al calcolo pro capite, e indicando l'obbligo di censire tutti i fondi componenti il tetto accessorio 2016 e le risorse escluse.
- **Gestione TRANSFER_ONLY:** Specificato che per le Unioni di Comuni e aggregazioni la quota trasferita aderenti (`quotaTrasferitaAderentiDL25_2025`) vive in campo separato e non confluisce automaticamente nell'incremento diretto applicato per i Comuni in autonomia.
- **Natura temporale del Wizard State:** Precisato che `wizard2026DraftState` è uno stato temporaneo e locale da non salvare su Supabase né sovrapporre al fundData finché non verrà stabilito un mapping preciso.
- **Fondo straordinario:** Distinti i sotto-elementi del lavoro straordinario chiarendo che le economie dell'anno precedente non costituiscono incremento stabile, diversamente dalle risorse escluse (elezioni, calamità) e dai tetti storici.
