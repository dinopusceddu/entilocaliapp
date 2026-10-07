# ASTRA — Matrice dei test

Baseline `9f90771e63cc9c45684d6d78baa144e923ea6868`; ambiente localhost/staging dedicato. Prove21–22 settembre2026.

PASS significa esclusivamente expected verificato nello scenario indicato. FAIL significa discrepanza dimostrata. PARTIAL/NOT_RUN non sono superamenti. Gli script di audit sono non tracciati e non modificano sorgenti o test del prodotto.

## Oracle indipendente congelato e confronto

Expected e formule in `PASS3_EXPECTED_FROZEN.json`, costruito con Decimal prima della white-box. Il file non è stato modificato. Esecuzione in `compare_oracle.ts`,30 MATCH/5 MISMATCH/3 NOT_RUN. Le prove supplementari sotto non modificano tale conteggio.

| ID | Persona / livello | Scenario / input | Regola / formula | Expected | Actual | Delta | Result | Evidence |
|---|---|---|---|---|---|---|---|---|
| O014-1000000 | Oracle / funzione pura | {"MS2021":"1000000"} | N06: MS2021*0.0014 | "1400.00" | 1400 | 0 | MATCH | PASS5_ORACLE_COMPARISON.json |
| O014-0 | Oracle / funzione pura | {"MS2021":"0"} | N06: MS2021*0.0014 | "0.00" | 0 | 0 | MATCH | PASS5_ORACLE_COMPARISON.json |
| O014-1234567.89 | Oracle / funzione pura | {"MS2021":"1234567.89"} | N06: MS2021*0.0014 | "1728.40" | 1728.4 | 0 | MATCH | PASS5_ORACLE_COMPARISON.json |
| O014-missing | Oracle / funzione pura | {"MS2021":null} | N06: missing prerequisite | "UNDETERMINED" | "UNDETERMINED" | null | MATCH | PASS5_ORACLE_COMPARISON.json |
| O014-negative | Oracle / funzione pura | {"MS2021":-100} | N06: invalid payroll | "INVALID" | -0.14 | null | MISMATCH | PASS5_ORACLE_COMPARISON.json |
| O022-2024 | Oracle / funzione pura | {"MS2021":1000000,"year":2024,"FRD2024":80000,"EQ2024":20000} | N07: annual_max=MS2021*0.0022; FRD=max*0.8; EQ=max*0.2; excludes residuals | {"annual_max":0,"FRD":0,"EQ":0} | {"annual_max":2200,"FRD":1760,"EQ":440} | null | MISMATCH | PASS5_ORACLE_COMPARISON.json |
| O022-2025 | Oracle / funzione pura | {"MS2021":1000000,"year":2025,"FRD2024":80000,"EQ2024":20000} | N07: annual_max=MS2021*0.0022; FRD=max*0.8; EQ=max*0.2; excludes residuals | {"annual_max":2200,"FRD":1760,"EQ":440} | {"annual_max":2200,"FRD":1760,"EQ":440} | null | MATCH | PASS5_ORACLE_COMPARISON.json |
| O022-2026 | Oracle / funzione pura | {"MS2021":1000000,"year":2026,"FRD2024":80000,"EQ2024":20000} | N07: annual_max=MS2021*0.0022; FRD=max*0.8; EQ=max*0.2; excludes residuals | {"annual_max":2200,"FRD":1760,"EQ":440} | {"annual_max":4400,"FRD":1760,"EQ":440} | null | MISMATCH | PASS5_ORACLE_COMPARISON.json |
| O022-2027 | Oracle / funzione pura | {"MS2021":1000000,"year":2027,"FRD2024":80000,"EQ2024":20000} | N07: annual_max=MS2021*0.0022; FRD=max*0.8; EQ=max*0.2; excludes residuals | {"annual_max":2200,"FRD":1760,"EQ":440} | {"annual_max":2200,"FRD":1760,"EQ":440} | null | MATCH | PASS5_ORACLE_COMPARISON.json |
| O022-boundary-2199.99 | Oracle / funzione pura | {"chosen":"2199.99","max":2200} | N07: chosen<=2200 | true | true | 0 | MATCH | PASS5_ORACLE_COMPARISON.json |
| O022-boundary-2200 | Oracle / funzione pura | {"chosen":"2200","max":2200} | N07: chosen<=2200 | true | true | 0 | MATCH | PASS5_ORACLE_COMPARISON.json |
| O022-boundary-2200.01 | Oracle / funzione pura | {"chosen":"2200.01","max":2200} | N07: chosen<=2200 | false | false | 0 | MATCH | PASS5_ORACLE_COMPARISON.json |
| O060-2025 | Oracle / funzione pura | {"year":2025,"FTE_funz_at_20260101":1} | N09: 10.62*12 if year>=2026 else0 | "0.00" | 127.44 | 127.44 | MISMATCH | PASS5_ORACLE_COMPARISON.json |
| O060-2026 | Oracle / funzione pura | {"year":2026,"FTE_funz_at_20260101":1} | N09: 10.62*12 if year>=2026 else0 | "127.44" | 127.44 | 0 | MATCH | PASS5_ORACLE_COMPARISON.json |
| O060-2027 | Oracle / funzione pura | {"year":2027,"FTE_funz_at_20260101":1} | N09: 10.62*12 if year>=2026 else0 | "127.44" | 127.44 | 0 | MATCH | PASS5_ORACLE_COMPARISON.json |
| O060-all | Oracle / funzione pura | {"F":1,"I":1,"OE":1,"O":1,"year":2026} | N09: 12*(10.62+9.40+8.06+6.63) | "416.52" | 416.52000000000004 | 5.684341886080802e-14 | MATCH | PASS5_ORACLE_COMPARISON.json |
| O033-0 | Oracle / funzione pura | {"cert2016":100000,"FRD2018":80000,"EQ2018":20000,"staff2018":10,"staffCurrent":0} | N02: 100000+max(0,(80000+20000)/10*(current-10)) | "100000.00" | 100000 | 0 | MATCH | PASS5_ORACLE_COMPARISON.json |
| O033-8 | Oracle / funzione pura | {"cert2016":100000,"FRD2018":80000,"EQ2018":20000,"staff2018":10,"staffCurrent":8} | N02: 100000+max(0,(80000+20000)/10*(current-10)) | "100000.00" | 100000 | 0 | MATCH | PASS5_ORACLE_COMPARISON.json |
| O033-10 | Oracle / funzione pura | {"cert2016":100000,"FRD2018":80000,"EQ2018":20000,"staff2018":10,"staffCurrent":10} | N02: 100000+max(0,(80000+20000)/10*(current-10)) | "100000.00" | 100000 | 0 | MATCH | PASS5_ORACLE_COMPARISON.json |
| O033-12 | Oracle / funzione pura | {"cert2016":100000,"FRD2018":80000,"EQ2018":20000,"staff2018":10,"staffCurrent":12} | N02: 100000+max(0,(80000+20000)/10*(current-10)) | "120000.00" | 120000 | 0 | MATCH | PASS5_ORACLE_COMPARISON.json |
| O033-missing | Oracle / funzione pura | {"FRD2018":null,"staff2018":0} | N02: unavailable denominator/base | "UNDETERMINED" | 0 | null | MISMATCH | PASS5_ORACLE_COMPARISON.json |
| O023-rebuilt | Oracle / funzione pura | {"FRD2016":80000,"EQ2016":20000,"secretary2016":15000,"manager2016":30000,"overtime2016":5000} | N01: sum distinct certified subject components | 150000 | 150000 | 0 | MATCH | PASS5_ORACLE_COMPARISON.json |
| O025-23999.99 | Oracle / funzione pura | {"TAB2023":100000,"CS2025":20000,"EQ2025":4000,"chosen":"23999.99"} | N04/N05: max=0.48*100000-20000-4000; chosen<=max | {"max":24000,"within":true} | {"max":24000,"within":true} | null | MATCH | PASS5_ORACLE_COMPARISON.json |
| O025-24000 | Oracle / funzione pura | {"TAB2023":100000,"CS2025":20000,"EQ2025":4000,"chosen":"24000"} | N04/N05: max=0.48*100000-20000-4000; chosen<=max | {"max":24000,"within":true} | {"max":24000,"within":true} | null | MATCH | PASS5_ORACLE_COMPARISON.json |
| O025-24000.01 | Oracle / funzione pura | {"TAB2023":100000,"CS2025":20000,"EQ2025":4000,"chosen":"24000.01"} | N04/N05: max=0.48*100000-20000-4000; chosen<=max | {"max":24000,"within":false} | {"max":24000,"within":false} | null | MATCH | PASS5_ORACLE_COMPARISON.json |
| O025-over | Oracle / funzione pura | {"TAB2023":100000,"CS2025":50000,"EQ2025":4000} | N04: max(0,48000-54000) | 0 | 0 | 0 | MATCH | PASS5_ORACLE_COMPARISON.json |
| O025-zero | Oracle / funzione pura | {"TAB2023":0,"CS2025":0,"EQ2025":0} | N04: increment zero; ratio undefined | {"max":0,"ratio":null} | {"max":0,"ratio":null} | null | MATCH | PASS5_ORACLE_COMPARISON.json |
| O025-missing | Oracle / funzione pura | {"TAB2023":null,"CS2025":20000,"EQ2025":4000} | N04: missing denominator | "UNDETERMINED" | "UNDETERMINED" | null | MATCH | PASS5_ORACLE_COMPARISON.json |
| O025-finance | Oracle / funzione pura | {"SP":300000,"limitSP":450000,"chosen":20000,"OR":".274"} | N05: 300000+20000*1.274 | 325480 | null | null | NOT_RUN | PASS5_ORACLE_COMPARISON.json |
| ODM-.2699999 | Oracle / funzione pura | {"population":20000,"revenuesMean":1000000,"FCDE":0,"SP":"269999.90"} | N03: SP/(mean-FCDE)<=0.27 | true | true | 0 | MATCH | PASS5_ORACLE_COMPARISON.json |
| ODM-.27 | Oracle / funzione pura | {"population":20000,"revenuesMean":1000000,"FCDE":0,"SP":"270000.00"} | N03: SP/(mean-FCDE)<=0.27 | true | true | 0 | MATCH | PASS5_ORACLE_COMPARISON.json |
| ODM-.2700001 | Oracle / funzione pura | {"population":20000,"revenuesMean":1000000,"FCDE":0,"SP":"270000.10"} | N03: SP/(mean-FCDE)<=0.27 | false | false | 0 | MATCH | PASS5_ORACLE_COMPARISON.json |
| OPNRR-2022 | Oracle / funzione pura | {"year":2022,"stableCertified2016":100000,"requirements":"assumed_met"} | N12: 5% if2023<=year<=2026 | 0 | 0 | 0 | MATCH | PASS5_ORACLE_COMPARISON.json |
| OPNRR-2023 | Oracle / funzione pura | {"year":2023,"stableCertified2016":100000,"requirements":"assumed_met"} | N12: 5% if2023<=year<=2026 | 5000 | 5000 | 0 | MATCH | PASS5_ORACLE_COMPARISON.json |
| OPNRR-2026 | Oracle / funzione pura | {"year":2026,"stableCertified2016":100000,"requirements":"assumed_met"} | N12: 5% if2023<=year<=2026 | 5000 | 5000 | 0 | MATCH | PASS5_ORACLE_COMPARISON.json |
| OPNRR-2027 | Oracle / funzione pura | {"year":2027,"stableCertified2016":100000,"requirements":"assumed_met"} | N12: 5% if2023<=year<=2026 | 0 | 0 | 0 | MATCH | PASS5_ORACLE_COMPARISON.json |
| OLEDGER | Oracle / funzione pura | {"stable014":1400,"overtimeStableTransfer":2000,"art60Deduction":127.44,"arrears014":2800} | arithmetic only, not legal eligibility: stable=1400+2000-127.44; variable=2800; total=stable+variable | {"stable":"3272.56","variable":"2800.00","total":"6072.56"} | null | null | NOT_RUN | PASS5_ORACLE_COMPARISON.json |
| O2025-legal | Oracle / funzione pura | {"year":2025,"MS2021":1000000,"overtimeStableTransfer":2000,"residuals":"not established"} | N06/N08/N09: stable=1400+2000; art60=0; no automatic 2024+2025 residuals in2025 | {"stable":"3400.00","variable":"UNDETERMINED","total":"UNDETERMINED"} | null | null | NOT_RUN | PASS5_ORACLE_COMPARISON.json |

O025 con importo scelto confronta il massimo restituito nell’harness: non è test dell’enforcement UI. O014-negative ha anche un validatore, quindi la restituzione negativa della funzione non basta a dimostrare bypass. O033-missing restituisce0 nella funzione, ma i warning vanno valutati separatamente. O2025-legal non ha un totale determinabile senza documenti sui recuperi. O025-finance rimane distinto dalla prova supplementare con margine48 vincolante.

## Scenari UI, sicurezza, persistenza, output e verifiche supplementari

| ID | Persona | Scenario | Expected | Actual | Result | Evidence |
|---|---|---|---|---|---|---|
| T01 | Tecnico | Branch e HEAD | Baseline richiesta, nessuna modifica tracciata | Identici; diff staged/unstaged vuoto | PASS | FINAL_VERIFICATION.json |
| T02 | Tecnico | Target risolto daVite | Staging | loadEnv e modulo client servito staging; script API solo host staging | PASS per target; HAR browser NOT_RUN | PASS1_BLACKBOX.md; STAGING_SECURITY.json |
| T03 | USER_A | Ingresso RSU → nuovo ente → Fondo | Percorso comprensibile e funzionante |3clic dopo login; primo ingresso chiaro | PASS | PASS1_BLACKBOX.md |
| T04 | USER_A | Nome lungo, rinomina, anni e cambio ente | Persistenza e contesto corretto | A/B e anni distinti; rinomina presente | PASS con criticità responsive | P19/P24/P26; STAGING_SECURITY.json |
| T05 | USER_A | Fondo vuoto | Nessun dato fittizio, stato incompleto | Limite1730000 e straordinario50000; conforme | FAIL DATA-01 | P01; P22 |
| T06 | USER_A | Input negativoRIA | Errore, nessuna capienza artificiale |−100 accettato; consumo−100 | FAIL DATA-03 | P12_negative_constitution.txt |
| T07 | USER_A | Tabellari2023 negativi | Errore associato e risultato invalido |−100 accettato a video | FAIL UI; calcolo completo non provato | P04_dl25_negative.txt |
| T08 | USER_A | Trasferimento Wizard | Un solo importo per voce | Centrale funziona; duplicazioni downstream | FAIL CALC-01/02 | P10/P11/P15 |
| T09 | USER_A | Reload / logout-login / ripresa | Dati e anno recuperati | A2025 ripreso; A2026 RIA321 confermata | PASS nei contesti provati | P15/P24/P26; STAGING_WORKFLOW_EXPORT.json |
| T10 | ADMIN_B | Tutti/Miei/Altri | Proprietà distinguibile |4/0/4; risultati coerenti | PASS tecnico; proprietà mobile da migliorare | P20/P21 |
| T11 | ADMIN_B→USER_A | ModificaRIA321 e creazione2027 | Owner restaA | Snapshot ownerA; valore321; anno visibile | PASS | P23/P24/P26; STAGING_SECURITY.json |
| T12 | USER_C | Catalogo e lettura diretta IDnoti | Nessun accesso |0enti UI;0righe entities/state/drafts | PASS nei tentativi eseguiti | P27; STAGING_SECURITY.json |
| T13 | USER_C | UPDATE su enteA | Nessuna riga modificata |0righe | PASS | STAGING_SECURITY.json |
| T14 | USER_A | ChiusuraB2026 tramite workflow | CLOSED eB2027 | Entrambi persistiti; riporto0 | PASS workflow; conferma nativa UI NOT_RUN | STAGING_WORKFLOW_EXPORT.json |
| T15 | USER_A | Salvataggio ordinario su chiuso | Rifiutato | successfalse, eserciziochiuso | PASS | STAGING_WORKFLOW_EXPORT.json |
| T16 | USER_A | UPDATE API su chiuso | Immutabilità server | Marcatore temporaneo persistito | FAIL SEC-01 | STAGING_WORKFLOW_EXPORT.json |
| T17 | USER_A | Consulta chiuso e modificaRIA123 | Input bloccato | Input attivo, totale123, falso successo; DBRIA0 | FAIL FUNC-01 | P29/P30; CLEANUP.json |
| T18 | Harness memoria | Errore creazioneanno successivo | Atomicità o ripresa | CorrenteCLOSED, successivoassente, retrynegato | FAIL DATA-02 | SUPPLEMENT_PROBES.json |
| T19 | USER_A | Disponibile alla contrattazione con dati mancanti | Istruttoria incompleta | Controlli superati e proposta distribuzione | FAIL FUNC-02 | P14/P15 |
| T20 | Harness+UI | OLEDGER su snapshotA2025 | Stabile3272,56 variabile2800 totale6072,56 | Motore8872,56; delta+2800 | FAIL CALC-01 | PASS3; STAGING_WORKFLOW_EXPORT.json |
| T21 | Harness+UI | Tabella15 | Totali riconciliati, nome corretto |4327,44; nomeEnte; decurtazionepositiva | FAIL DOC-01 | P17; exports/CSV/XLSX_EXTRACT.txt |
| T22 | Harness | Relazione/Prospetto | Componenti sommano al totale |2000+0 contro8872,56 | FAIL DOC-02 | exports/*.txt |
| T23 | Harness/PDF | Determina2pagine | Contenuto coerente e leggibile | Layout leggibile; placeholder e attestazioni non provate | FAIL contenuto; PASS layout campione | exports/PDF_page-1.png e-2.png |
| T24 | USER_A | Download dalbrowser | File ricevuto e ispezionabile | Evento download non intercettato; generatori verificati separatamente | NOT_RUN end-to-end | Limite strumentale, non bug app |
| T25 | Harness | CanonicoDL25=0,legacy900 |0 |900 | FAIL ARCH-01 | PASS5/extras.aliasZero |
| T26 | Harness | CCNL014 con vecchie basi80/20 |1400FRD,0EQ |1120FRD,280EQ | FAIL ARCH-01 | PASS5/extras.legacy014Split |
| T27 | Harness | Cache consumo0 su risorse2000 e tetto1000 | Nonconforme | Conforme con cache; nonconforme senza | FAIL CALC-04 | SUPPLEMENT_PROBES.json |
| T28 | Harness | PNRRmassimo0,voce100 | Errore |100esclusi; nessun errorePNRR | FAIL CALC-05 | SUPPLEMENT_PROBES.json |
| T29 | Harness | DL25capnetto24000,margini capienti,oneri27,4% |24000 |18838,304552590267 | FAIL CALC-03 | SUPPLEMENT_PROBES.json |
| T30 | USER_A | Responsive7viewport | Leggibilità e contesto conservati | Desktop/tablet leggibili; mobile contesto nascosto/tagliato | FAIL UX-02/03 | R1440/R1366/R1024/R768/R430/R390/R360.png |
| T31 | USER_A tastiera | Nuovo ente, Tab/Escape | Focus confinato e ritorno | Focus esce su sfondo; Escape non chiude | FAIL ACCESS-01 | P28_modal_keyboard.json; osservazione UI |
| T32 | DOM | Label, error association, semantica | Campi nominati, errori collegati |7textbox report senza nome; alcuni spinbutton Wizard; buttonannidati | FAIL ACCESS-02, campione | P02/P16/P30 |
| T33 | Test esistenti | Suite mirata17file | Nessun errore nei test selezionati |259passati | PASS tecnico, non normativo | EXISTING_TESTS.log |
| T34 | ADMIN_B API | Cleanup due enti e5anni | Solo dataset audit eliminati |0record residui, altri enti/snapshot invariati | PASS dati remoti | CLEANUP.json |
| T35 | Browser locale | Cache/bozze locali orfane | Nessun residuo audit | Non verificate tutte le chiavi; nessuna cancellazione indiscriminata | NOT_VERIFIED | Limite cleanup locale dichiarato |
| T36 | Accessibilità | Zoom, screenreader reale, misuretouch/contrasto | Completare copertura | Non eseguiti sistematicamente | NOT_RUN | Nessuna certificazioneWCAG |
| T37 | Normativa | Tutte le voci speciali e schemi RGSannuali | Verifica primaria puntuale | Copertura parziale dichiarata | PARTIAL | ASTRA_NORMATIVE_MATRIX.md |

## Riproduzione senza modificare la baseline

`independent_oracle.py` contiene la costruzione degli expected; non occorre rigenerare il file congelato. `compare_oracle.ts` importa i calcoli esistenti; `supplement_probes.ts` esegue casi in memoria; `staging_probe.mjs` verifica le tre identità e gli enti temporanei; `staging_workflow.ts` contiene la prova di chiusura/export. Gli script staging richiedono che vengano ricreati gli enti e anni descritti: dopo cleanup i guard devono fermarli. Non rieseguire `cleanup.mjs` su dati diversi. Non copiare credenziali in output.

Comando dei test esistenti: `npm run test -- --run --threads=false src/logic/wizard2026/__tests__ src/logic/shared/__tests__ src/logic/calculation/tabella15Mapper.test.ts src/application/__tests__/yearClosure.test.ts src/application/__tests__/authorizationPolicy.test.ts src/application/__tests__/contextRace.test.ts`.

I messaggi di errore attesi nella suite di chiusura riguardano mock di fallimento: non sono test falliti. I primi tentativi di export Node avevano incompatibilità di import jsPDF, risolta con un adattatore dello script: non è un difetto dimostrato del download browser.
