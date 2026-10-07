# ASTRA — Audit indipendente RSU

Data: 21–22 settembre 2026. Baseline: `ux/toolbox-area-fondo-prototype`, commit `9f90771e63cc9c45684d6d78baa144e923ea6868`.


Documenti collegati: [matrice normativa](<C:/Users/PuscedduD/Il mio Drive/Progetto FL APP/entilocaliapp/ASTRA_NORMATIVE_MATRIX.md>) · [matrice test](<C:/Users/PuscedduD/Il mio Drive/Progetto FL APP/entilocaliapp/ASTRA_TEST_MATRIX.md>) · [indice evidenze](<C:/Users/PuscedduD/Il mio Drive/Progetto FL APP/entilocaliapp/astra_evidence/run_20260921/INDEX.md>)

## Giudizio

**La baseline non è affidabile per determinare e documentare il Fondo da portare alla contrattazione senza ricostruzione esterna.** Lo stesso dataset produce totali diversi; importi sono duplicati, una decorrenza normativa è errata e gli export non riconciliano le componenti. L’isolamento tra utenti ha superato le prove eseguite, mentre la chiusura non offre immutabilità lato database.

Il giudizio riguarda i casi riprodotti. Non è una certificazione giuridica, contabile, di sicurezza o di conformità WCAG. Le lacune sono elencate esplicitamente: non sono PASS impliciti né bug presunti.

## Metodo e indipendenza

1. PASS1: utilizzo reale da RSU nel browser locale, prima della lettura dei sorgenti, tre identità e tre contesti iniziali. Osservazioni e15 risposte congelate in `PASS1_BLACKBOX.md`.
2. PASS2: fonti ufficiali autonome; `PASS2_RULES.md` distingue VERIFIED_RULE, INTERPRETATIVE_RULE e UNCERTAIN.
3. PASS3:38 casi Decimal in `independent_oracle.py`, expected congelati prima del motore e dei test. SHA256 del JSON: `DF387953329AB3F8F344D524F2C56F3D378B0F4B68CD23A53BD0F374060D8744`.
4. PASS4: UI → application → normalizzazione → motore → controlli → repository → documenti. Test letti solo in questa fase.
5. PASS5: confronti numerici, API staging, export, tastiera e chiusura. Le prove supplementari dopo il codice sono dichiarate tali, non retroattribuite all’oracle indipendente.
6. PASS6: questo report e le due matrici. Nessuna correzione implementata.

Vite risolve `.env.local` sullo staging; il modulo client servito dal frontend usa quel target. Le richieste dello script autenticato hanno registrato solo `mcasgpaivyosaroxrodm.supabase.co`. Non è disponibile una traccia HAR completa del browser: questa prova specifica resta non eseguita. Nessuna operazione verso produzione.

## Riconciliazione del caso A/2025

| Esposizione | Stabile € | Variabile € | Totale € |
|---|---:|---:|---:|
| Ledger indipendente degli importi immessi | 3.272,56 | 2.800,00 | 6.072,56 |
| Cabina / motore | 3.272,56 | 5.600,00 | 8.872,56 |
| Pagina Personale, disponibile | 4.672,56 | 5.600,00 | 10.272,56 |
| Tabella15 | 1.527,44 | 2.800,00 | 4.327,44 |
| Relazione tecnica / Prospetto | 2.000,00 | 0,00 | 8.872,56 |

Ledger:1.400+2.000−127,44=3.272,56; variabile2.800. **6.072,56 non è il Fondo legalmente corretto2025**: art60 deve essere zero e i recuperi non sono comprovati. Atteso normativo stabile3.400; variabile e totale non determinabili senza l’istruttoria sui residui. Consumo art23 osservato10.000, limite120.000; il rispetto numerico non sana gli input o i conteggi errati.

## Risultati positivi

Creazione, rinomina, selezione ente/anno e ripresa funzionano nei casi eseguiti. ADMIN_B vede Tutti/Miei/Altri coerenti, modifica A/2026 (RIA321), crea A/2027; USER_A ritrova entrambi con ownership corretta. USER_C vede zero enti e le richieste dirette sui noti identificativi restituiscono zero righe; anche UPDATE dell’ente è escluso. Nessuna contaminazione tra enti/anni dimostrata. La chiusura riuscita crea il successivo e il salvataggio ordinario sul chiuso è rifiutato.

17 file di test esistenti,259 test passati. Non sono prova di correttezza normativa: alcuni test fissano proprio gli automatismi contestati. Oracle:30 MATCH,5 MISMATCH,3 NOT_RUN nella prima esecuzione; il ledger è successivamente confrontato con lo snapshot effettivo. La matrice distingue il calcolo puro dalla validazione UI e i casi incompleti.

## Severità

BLOCKER: errore materiale/normativo, violazione dell’integrità o flusso principale compromesso. HIGH: può portare a una conclusione significativamente errata. MEDIUM: problema concreto di workflow, chiarezza, robustezza o accessibilità. LOW: miglioria reale non indispensabile. Non si sommano gli impatti economici tra finding che descrivono la stessa risorsa.

## Registro sintetico

| ID | Severità | Gruppo | Finding |
|---|---|---|---|
| SEC-01 | BLOCKER | A | Snapshot chiuso modificabile tramite API dal proprietario |
| DATA-01 | HIGH | A | Valori dimostrativi diventano dati del nuovo Fondo |
| DATA-02 | HIGH | A | Chiusura parziale non recuperabile con un nuovo tentativo |
| CALC-01 | BLOCKER | B | Arretrati 0,14% contati due volte |
| CALC-02 | BLOCKER | B | La pagina Personale aggiunge ancora lo 0,14% |
| DOC-01 | BLOCKER | B | Tabella 15 perde voci e inverte l’effetto delle decurtazioni |
| NORM-01 | BLOCKER | B | Articolo 60 applicato nel 2025 |
| NORM-02 | HIGH | B | Competenza e recuperi degli incrementi non separati |
| CALC-03 | HIGH | B | Simulatore DL25 riduce anche il margine netto per gli oneri |
| NORM-03 | HIGH | B | Il simulatore conserva un vincolo superato dal DL144/2026 |
| NORM-04 | HIGH | B | Anno base DL25 indicato come anno precedente |
| CALC-04 | HIGH | B | Un totale denormalizzato può ribaltare la conformità art23 |
| CALC-05 | HIGH | B | Massimo PNRR zero non blocca un incremento positivo |
| ARCH-01 | HIGH | G | Alias legacy e formule CCNL concorrenti alterano i dati |
| FUNC-01 | HIGH | C | Annualità chiusa editabile a video e falso successo del salvataggio |
| FUNC-02 | HIGH | C | Conformità e prossima attività anticipano l’istruttoria |
| FUNC-03 | MEDIUM | C | Trasferimento Wizard con due messaggi contraddittori |
| DATA-03 | HIGH | A | Importi negativi ammessi in risorse additive |
| DOC-02 | HIGH | D | Documenti con componenti non riconciliate e attestazioni automatiche |
| UX-01 | MEDIUM | D | Tracciabilità insufficiente del numero negoziale |
| UX-02 | HIGH | E | Contesto ente/anno poco visibile sui telefoni |
| UX-03 | MEDIUM | E | Terminologia tecnica e gerarchia mobile dispersiva |
| ACCESS-01 | HIGH | F | La modale Nuovo ente non trattiene il focus |
| ACCESS-02 | MEDIUM | F | Label e semantica dei controlli incomplete |
| ARCH-02 | MEDIUM | G | Metadata temporali e ruoli denormalizzati richiedono confini espliciti |

## A — Sicurezza e dati

### SEC-01 — Snapshot chiuso modificabile tramite API dal proprietario

**ID:** SEC-01

**SEVERITY:** BLOCKER

**CATEGORY:** A

**SCREEN/PATH:** API staging / user_app_state

**SCENARIO:** B/2026 chiuso; UPDATE autenticato USER_A con marcatore temporaneo

**OBSERVED:** Una riga aggiornata; marcatore persistito. Il workflow ordinario rifiuta invece la modifica.

**EXPECTED:** Vincolo di immutabilità imposto anche sul server, con eventuale riapertura esplicita autorizzata.

**WHY IT MATTERS TO AN RSU:** Lo stato chiuso non garantisce che i dati consultati siano quelli congelati. Non è un accesso tra utenti.

**LEGAL BASIS:** Integrità applicativa, non conclusione normativa

**EVIDENCE:** STAGING_WORKFLOW_EXPORT.json

**ROOT CAUSE:** snapshotWorkflow.ts verifica CLOSED nel client; il database staging accetta UPDATE sul record chiuso.

**RECOMMENDED CHANGE:** Imporre la transizione e il blocco delle scritture sul server; definire riapertura tracciata.

**ACCEPTANCE CRITERIA:** UPDATE diretto del proprietario sul chiuso rifiutato; chiusura consentita una volta; riapertura solo secondo policy verificabile.

### DATA-01 — Valori dimostrativi diventano dati del nuovo Fondo

**ID:** DATA-01

**SEVERITY:** HIGH

**CATEGORY:** A

**SCREEN/PATH:** Nuova annualità / Verifica

**SCENARIO:** A/2026 e B/2026 senza dati storici forniti

**OBSERVED:** Limite 1.730.000 euro e straordinario 50.000 euro; controlli superati.

**EXPECTED:** Storici mancanti e verifica non determinabile fino alla loro documentazione.

**WHY IT MATTERS TO AN RSU:** Un margine apparentemente enorme può essere scambiato per capacità negoziale reale.

**LEGAL BASIS:** N01–N03

**EVIDENCE:** P22_A2026_defaults.txt; P29_closed_dashboard.txt; P30_closed_edit.txt

**ROOT CAUSE:** src/constants.ts:80 e :284; AppContext idrata con valori iniziali.

**RECOMMENDED CHANGE:** Separare fixture dimostrative dai default operativi; mantenere missing distinto da zero.

**ACCEPTANCE CRITERIA:** Nuovo ente e nuovo anno non mostrano importi non inseriti; nessuna conformità conclusiva con storici mancanti.

### DATA-02 — Chiusura parziale non recuperabile con un nuovo tentativo

**ID:** DATA-02

**SEVERITY:** HIGH

**CATEGORY:** A

**SCREEN/PATH:** Chiusura annualità

**SCENARIO:** Errore simulato nella creazione del successivo, dopo salvataggio CLOSED

**OBSERVED:** Anno corrente resta CLOSED; successivo assente; retry risponde già chiuso. Prova in memoria, non guasto indotto sul database.

**EXPECTED:** Transazione atomica o workflow riprendibile e idempotente.

**WHY IT MATTERS TO AN RSU:** Il riporto può restare incompleto senza un percorso ordinario di recupero.

**LEGAL BASIS:** Integrità applicativa

**EVIDENCE:** SUPPLEMENT_PROBES.json / partialClosure

**ROOT CAUSE:** yearClosureWorkflow.ts: salvataggi separati ai passi 5, 6 e 7; nessun rollback.

**RECOMMENDED CHANGE:** Transazione lato server oppure stato di chiusura intermedio con ripresa.

**ACCEPTANCE CRITERIA:** Errore a ogni passo lascia tutti i dati coerenti oppure riprende il trasferimento senza duplicarlo.

### DATA-03 — Importi negativi ammessi in risorse additive

**ID:** DATA-03

**SEVERITY:** HIGH

**CATEGORY:** A

**SCREEN/PATH:** Costituzione RIA / Wizard DL25

**SCENARIO:** RIA−100 e tabellari2023−100

**OBSERVED:** RIA riduce il consumo art23 da10.000 a9.900 mantenendo conformità; tabellari negativi accettati nella UI.

**EXPECTED:** Invalidare dati economici non negativi, distinguendoli dalle decurtazioni positive da sottrarre.

**WHY IT MATTERS TO AN RSU:** Un errore di segno può creare capienza artificiale senza avviso utile.

**LEGAL BASIS:** N01; semantica delle voci additive

**EVIDENCE:** P12_negative_constitution.txt; P04_dl25_negative.txt

**ROOT CAUSE:** Validazione non uniforme tra input e motore; il risultato numerico resta utilizzabile.

**RECOMMENDED CHANGE:** Schema di validazione comune per tipo voce e blocco esito/esportazione con input invalido.

**ACCEPTANCE CRITERIA:** RIA−100 produce errore associato al campo e nessuna conformità conclusiva; decurtazioni usano segno controllato.

## B — Normativa e calcoli

### CALC-01 — Arretrati 0,14% contati due volte

**ID:** CALC-01

**SEVERITY:** BLOCKER

**CATEGORY:** B

**SCREEN/PATH:** Wizard → Cabina → Personale

**SCENARIO:** MS2021 un milione; arretrati trasferiti 2.800 euro

**OBSERVED:** Motore/cabina variabile 5.600; atteso contabile 2.800. Totale 8.872,56 contro 6.072,56: +2.800.

**EXPECTED:** Ogni risorsa concorre una sola volta. Il totale atteso è solo riconciliazione aritmetica, non certificazione giuridica del 2025.

**WHY IT MATTERS TO AN RSU:** Sovrastima il Fondo e il disponibile da contrattare.

**LEGAL BASIS:** N06/N08; identità aritmetica

**EVIDENCE:** P09_summary.txt; P15_resumed_dashboard.txt; PASS3_EXPECTED_FROZEN.json/OLEDGER; STAGING_WORKFLOW_EXPORT.json

**ROOT CAUSE:** fundCalculations.ts:146–155 non esclude la voce arretrati importata; fundEngine aggiunge nuovamente la componente CCNL.

**RECOMMENDED CHANGE:** Usare un unico registro delle risorse con identificativo, competenza e provenienza.

**ACCEPTANCE CRITERIA:** Con il dataset A: stabile 3.272,56; variabile 2.800; somma contabile 6.072,56 in tutte le viste, prima dei correttivi normativi.

### CALC-02 — La pagina Personale aggiunge ancora lo 0,14%

**ID:** CALC-02

**SEVERITY:** BLOCKER

**CATEGORY:** B

**SCREEN/PATH:** Fondo Personale / totale disponibile

**SCENARIO:** Stesso A/2025

**OBSERVED:** Stabile 4.672,56 e totale disponibile 10.272,56; cabina 3.272,56 e 8.872,56. Scarto ulteriore +1.400.

**EXPECTED:** La pagina consuma il medesimo risultato canonico della cabina.

**WHY IT MATTERS TO AN RSU:** Non esiste un importo univoco da portare al tavolo.

**LEGAL BASIS:** N06; riconciliazione

**EVIDENCE:** P11_stable.txt; PASS1_BLACKBOX.md

**ROOT CAUSE:** FondoAccessorioDipendentePage.tsx:330 chiama calculateFadTotals senza il parametro CCNL, poi aggiunge le componenti alle righe 346–358.

**RECOMMENDED CHANGE:** Eliminare il calcolo concorrente nella vista; proiettare il DTO condiviso.

**ACCEPTANCE CRITERIA:** Cabina, Personale, distribuzione ed export concordano al centesimo per risorse importate e manuali.

### DOC-01 — Tabella 15 perde voci e inverte l’effetto delle decurtazioni

**ID:** DOC-01

**SEVERITY:** BLOCKER

**CATEGORY:** B

**SCREEN/PATH:** Anteprima / XLS / CSV Tabella 15

**SCENARIO:** A/2025 con trasferimento straordinario 2.000 e art60 127,44

**OBSERVED:** Stabile 1.527,44, variabile 2.800, totale 4.327,44; ente generico Ente. Decurtazione sommata positiva e trasferimento assente.

**EXPECTED:** Riconciliazione con registro, sottrazioni corrette e identificazione ente/anno.

**WHY IT MATTERS TO AN RSU:** Un prospetto presentato come istituzionale contraddice il Fondo.

**LEGAL BASIS:** N11; classificazione RGS delle singole colonne non certificata

**EVIDENCE:** P17_table15.txt; exports/Tabella15_Ente_2025.csv; exports/XLSX_EXTRACT.txt

**ROOT CAUSE:** tabella15Mapper.ts:37 conserva amount senza operatore; somma solo voci mappate; metadata del motore omette nome ente.

**RECOMMENDED CHANGE:** Mappare tutte le risorse, separare segno/esposizione e controllo di riconciliazione; versionare lo schema RGS per anno.

**ACCEPTANCE CRITERIA:** Totali e segni riconciliati; tutte le differenze motivate; nome corretto; nessuna pretesa di conformità istituzionale senza schema verificato.

### NORM-01 — Articolo 60 applicato nel 2025

**ID:** NORM-01

**SEVERITY:** BLOCKER

**CATEGORY:** B

**SCREEN/PATH:** Wizard step conglobamento

**SCENARIO:** Un funzionario, anno 2025

**OBSERVED:** Riduzione 127,44 euro calcolata, trasferita e sottratta.

**EXPECTED:** Riduzione zero nel 2025; decorrenza 1 gennaio 2026 per l’ipotesi del 3 novembre 2025.

**WHY IT MATTERS TO AN RSU:** Riduce indebitamente la parte stabile dell’annualità selezionata.

**LEGAL BASIS:** N09 VERIFIED_RULE

**EVIDENCE:** P06_art60_2025.txt; PASS5_ORACLE_COMPARISON.json/O060-2025

**ROOT CAUSE:** conglobamentoArt60.ts:53/89 distingue solo anni successivi al 2026, non quelli anteriori.

**RECOMMENDED CHANGE:** Applicare decorrenza in calcolo, validazione, trasferimento e documenti.

**ACCEPTANCE CRITERIA:** 2025=0; 2026 un funzionario=127,44; 2027 consolidamento esplicito senza ricalcolare la platea corrente.

### NORM-02 — Competenza e recuperi degli incrementi non separati

**ID:** NORM-02

**SEVERITY:** HIGH

**CATEGORY:** B

**SCREEN/PATH:** Wizard incrementi / controlli 0,22%

**SCENARIO:** MS2021 un milione; anni 2024, 2025, 2026 e 2027

**OBSERVED:** Massimo 0,22% anche nel 2024; nel 2026 massimo automatico 4.400. Arretrati 0,14% 2.800 indipendenti dalla situazione degli anni precedenti.

**EXPECTED:** Annuale 0,22% da 2025; recuperi separati, con condizioni e decisioni documentate.

**WHY IT MATTERS TO AN RSU:** Il recupero condizionato viene presentato come capienza annuale ordinaria.

**LEGAL BASIS:** N07 VERIFIED_RULE; N08 INTERPRETATIVE_RULE

**EVIDENCE:** PASS5_ORACLE_COMPARISON.json/O022-2024 e O022-2026; P05_ccnl_2025.txt

**ROOT CAUSE:** ccnl2026Increments.ts:101–116; fundEngine.ts:498; test esistenti assumono il raddoppio e arretrati anche nel 2027.

**RECOMMENDED CHANGE:** Modellare annualità di competenza, importi già utilizzati, residui e titolo del recupero.

**ACCEPTANCE CRITERIA:** Senza residui documentati: 2024=0, 2025/26/27=2.200 annui; recuperi visibili a parte e mai duplicati.

### CALC-03 — Simulatore DL25 riduce anche il margine netto per gli oneri

**ID:** CALC-03

**SEVERITY:** HIGH

**CATEGORY:** B

**SCREEN/PATH:** Simulatore incremento

**SCENARIO:** TAB23=300.000, stabile=100.000, EQ=20.000; margini finanziari capienti; oneri27,4%

**OBSERVED:** Margine48%=24.000 ma netto finale18.838,30. Scarto −5.161,70.

**EXPECTED:** min(24.000, margine finanziario lordo/1,274); qui24.000.

**WHY IT MATTERS TO AN RSU:** Sottostima risorse potenzialmente disponibili.

**LEGAL BASIS:** N05 INTERPRETATIVE_RULE RGS, unità lordo dipendente vs lordo ente

**EVIDENCE:** SUPPLEMENT_PROBES.json/simulator

**ROOT CAUSE:** fundEngine.ts:81–106 applica min a grandezze non omogenee, poi divide tutto per gli oneri.

**RECOMMENDED CHANGE:** Convertire i soli vincoli finanziari in lordo dipendente prima del minimo.

**ACCEPTANCE CRITERIA:** Caso margine48 vincolante=24.000; caso margine finanziario vincolante=spazio/(1+oneri), IRAP gestita separatamente.

### NORM-03 — Il simulatore conserva un vincolo superato dal DL144/2026

**ID:** NORM-03

**SEVERITY:** HIGH

**CATEGORY:** B

**SCREEN/PATH:** Simulatore / limite L296

**SCENARIO:** Comune soggetto all’art33; valutazione al22/9/2026

**OBSERVED:** Il minimo include sempre il margine ex L296/2006, senza data o regime applicabile.

**EXPECTED:** Dal8/8/2026 applicare l’art2c1 DL144 agli enti soggetti all’art33; mantenere il regime storico quando pertinente.

**WHY IT MATTERS TO AN RSU:** Può azzerare margini che il vecchio limite non vincola più.

**LEGAL BASIS:** N13 VERIFIED_RULE; integrazione normativa successiva al PASS3

**EVIDENCE:** src/logic/calculation/fundEngine.ts:94–101; GU7/8/2026 p13

**ROOT CAUSE:** Parametro L296 sempre incluso; funzione priva di anno/regime.

**RECOMMENDED CHANGE:** Versionare la regola per data e campo soggettivo.

**ACCEPTANCE CRITERIA:** Due casi identici prima/dopo decorrenza applicano i rispettivi regimi; nessun automatismo di rimozione per enti non coperti.

### NORM-04 — Anno base DL25 indicato come anno precedente

**ID:** NORM-04

**SEVERITY:** HIGH

**CATEGORY:** B

**SCREEN/PATH:** Wizard DL25

**SCENARIO:** A/2025: dati richiesti all’utente

**OBSERVED:** Etichette chiedono2024 mentre la formula/nota RGS richiede consistenza2025 rettificata. Riepilogo dice4,8% anziché48%.

**EXPECTED:** Etichette e formula dichiarano anno, rettifiche e data di riferimento coerenti.

**WHY IT MATTERS TO AN RSU:** Anche una formula corretta applicata al dato sbagliato dà un risultato inutilizzabile.

**LEGAL BASIS:** N04/N05

**EVIDENCE:** P04_dl25_empty.txt; P09_summary.txt

**ROOT CAUSE:** Step3Dl25.tsx:53/473/490 annoRiferimento−1 su campi chiamati2025; Step8RiepilogoPreview.tsx testo4,8%.

**RECOMMENDED CHANGE:** Esplicitare base richiesta dalla nota e coordinamento per anno; correggere testo percentuale.

**ACCEPTANCE CRITERIA:** Nel2025 nessuna richiesta2024 per CS25/EQ25; riepilogo48%; rettifiche art60 figurative chiaramente visibili.

### CALC-04 — Un totale denormalizzato può ribaltare la conformità art23

**ID:** CALC-04

**SEVERITY:** HIGH

**CATEGORY:** B

**SCREEN/PATH:** Motore / snapshot legacy

**SCENARIO:** Risorse soggette2.000; tetto1.000; aggiunta cl_totaleParziale...=0

**OBSERVED:** Senza cache non conforme; con cache0 valore soggetto0 e conforme, a parità di voci. Prova diretta del motore.

**EXPECTED:** Totali sempre derivati; copie obsolete non comandano il controllo.

**WHY IT MATTERS TO AN RSU:** Un dato apparentemente calcolato può nascondere lo sforamento.

**LEGAL BASIS:** N01

**EVIDENCE:** SUPPLEMENT_PROBES.json/cachedTotal

**ROOT CAUSE:** fundEngine.ts:331 preferisce il totale fornito alla somma; percorso UI di immissione della cache non dimostrato.

**RECOMMENDED CHANGE:** Ignorare o riconciliare i totali persistiti; segnalare divergenza e provenienza.

**ACCEPTANCE CRITERIA:** Cambiare/eliminare il campo derivato non cambia consumo e conformità calcolati dalle voci.

### CALC-05 — Massimo PNRR zero non blocca un incremento positivo

**ID:** CALC-05

**SEVERITY:** HIGH

**CATEGORY:** B

**SCREEN/PATH:** Motore / costituzione

**SCENARIO:** Massimo PNRR dichiarato0; voce PNRR100

**OBSERVED:** Totale variabile100, escluso art23; nessun errore PNRR nel risultato.

**EXPECTED:** Zero verificato deve impedire un positivo; massimo mancante deve essere indeterminato.

**WHY IT MATTERS TO AN RSU:** Consente risorse in deroga non giustificate dal massimo disponibile.

**LEGAL BASIS:** N12 per percentuale; rilievo di coerenza indipendente dai requisiti controversi

**EVIDENCE:** SUPPLEMENT_PROBES.json/pnrrZeroMax

**ROOT CAUSE:** fundEngine.ts:493 controlla superamento solo quando maxPnrr>0.

**RECOMMENDED CHANGE:** Separare missing/zero e validare sempre gli importi positivi.

**ACCEPTANCE CRITERIA:** max0 e voce100 falliscono; missing non conforme conclusivo; massimo positivo confrontato al centesimo.

## C — Workflow

### FUNC-01 — Annualità chiusa editabile a video e falso successo del salvataggio

**ID:** FUNC-01

**SEVERITY:** HIGH

**CATEGORY:** C

**SCREEN/PATH:** B/2026 → Consulta → Costituzione

**SCENARIO:** Inserire RIA123 e premere Salva Bozza

**OBSERVED:** Totale a video123 e messaggio di successo; database conservaRIA0 eCLOSED.

**EXPECTED:** Campi non modificabili; nessun messaggio di persistenza quando il workflow non salva.

**WHY IT MATTERS TO AN RSU:** La RSU può esportare/leggere uno stato locale diverso da quello chiuso.

**LEGAL BASIS:** Integrità e trasparenza

**EVIDENCE:** P29_closed_dashboard.txt; P30_closed_edit.txt; CLEANUP.json/closedUIProbe

**ROOT CAUSE:** AppContext.tsx:701 ritorna senza errore; MainLayout.tsx:33 mostra successo incondizionato; pagine non disabilitano tutti gli input.

**RECOMMENDED CHANGE:** Propagare esito tipizzato e read-only a tutte le pagine; calcolo chiuso dalla versione congelata.

**ACCEPTANCE CRITERIA:** Campi e Salva disabilitati nel chiuso; nessuna modifica locale persistibile o esportabile come originale; messaggio coerente con esito.

### FUNC-02 — Conformità e prossima attività anticipano l’istruttoria

**ID:** FUNC-02

**SEVERITY:** HIGH

**CATEGORY:** C

**SCREEN/PATH:** Cabina / distribuzione

**SCENARIO:** Fondo vuoto o raccolta7/8 con basi mancanti

**OBSERVED:** Controlli superati; proposta distribuzione; personale assente interpretato<=5; residuo automaticamente performance.

**EXPECTED:** Separare validità numerica, completezza documentale e disponibilità negoziale.

**WHY IT MATTERS TO AN RSU:** La RSU può considerare conclusa una verifica non ancora possibile.

**LEGAL BASIS:** N03/N10

**EVIDENCE:** P14_distribution.txt; P15_resumed_dashboard.txt; P22_A2026_defaults.txt

**ROOT CAUSE:** inputNormalizer.ts:45 converte personale assente in0; cabina sintetizza check senza coprire tutti i prerequisiti.

**RECOMMENDED CHANGE:** Introdurre esito non determinabile e lista documenti bloccanti; indicare allocazioni suggerite come bozze.

**ACCEPTANCE CRITERIA:** Con personale/basi mancanti nessun esito definitivo; next action torna ai dati mancanti; performance richiede scelta consapevole.

### FUNC-03 — Trasferimento Wizard con due messaggi contraddittori

**ID:** FUNC-03

**SEVERITY:** MEDIUM

**CATEGORY:** C

**SCREEN/PATH:** Riepilogo Wizard / sidebar

**SCENARIO:** Raccolta completata e trasferimento

**OBSERVED:** CTA centrale funziona; laterale risulta disabilitata con riferimento al refactoring.

**EXPECTED:** Un’unica azione, o azioni sincronizzate con motivazione di business.

**WHY IT MATTERS TO AN RSU:** La RSU non sa se i dati siano davvero trasferibili o già acquisiti.

**LEGAL BASIS:** Non pertinente

**EVIDENCE:** P10_transfer.txt; PASS1_BLACKBOX.md

**ROOT CAUSE:** Percorsi di UI non allineati.

**RECOMMENDED CHANGE:** Convergere sul medesimo stato di trasferimento; mostrare riepilogo importi/anno e conferma finale.

**ACCEPTANCE CRITERIA:** Ogni accesso al trasferimento ha disponibilità coerente e stesso risultato verificabile.

## D — Spiegabilità e documenti

### DOC-02 — Documenti con componenti non riconciliate e attestazioni automatiche

**ID:** DOC-02

**SEVERITY:** HIGH

**CATEGORY:** D

**SCREEN/PATH:** Stampe e Report

**SCENARIO:** Generazione TXT/PDF da A/2025 incompleto

**OBSERVED:** Relazione: stabile2.000+variabile0 ma totale8.872,56; Prospetto uguale. Determina2025 cita applicazione2026, attesta parere favorevole con estremi vuoti e mostra3.400 come stabile al netto di127,44.

**EXPECTED:** Bozza dichiarata tale, somme complete, competenza coerente, attestazioni solo da dati verificati.

**WHY IT MATTERS TO AN RSU:** Può indurre a sostenere al tavolo o firmare una rappresentazione non comprovata.

**LEGAL BASIS:** N06/N09/N11; attestazioni documentali

**EVIDENCE:** exports/*.txt; exports/PDF_page-1.png; exports/PDF_page-2.png; P16_documents.txt

**ROOT CAUSE:** documentFactory.ts usa totali soggetti per le componenti e totale complessivo; template assertivo, dati placeholder.

**RECOMMENDED CHANGE:** Riconciliare sezioni; riportare fonti, esclusioni, stato istruttoria e placeholder senza dichiarare certificazioni.

**ACCEPTANCE CRITERIA:** Componenti sommano al totale; documento incompleto marcato BOZZA; nessun parere favorevole inventato; anno e basi corretti.

### UX-01 — Tracciabilità insufficiente del numero negoziale

**ID:** UX-01

**SEVERITY:** MEDIUM

**CATEGORY:** D

**SCREEN/PATH:** Cabina / Verifica / Documenti

**SCENARIO:** Rispondere alle15 domande RSU

**OBSERVED:** Formule disponibili in alcuni step, ma non un quadro unico di fonte, input, calcolo, competenza, esclusione e documenti mancanti.

**EXPECTED:** Dalla cifra al dato amministrativo e al titolo giuridico con passaggi leggibili.

**WHY IT MATTERS TO AN RSU:** Il numero non è difendibile davanti a ragioneria e revisori.

**LEGAL BASIS:** N01–N12 secondo voce

**EVIDENCE:** PASS1_BLACKBOX.md, risposte9–15

**ROOT CAUSE:** Informazioni distribuite tra Wizard, schede e output; assenza di ledger/documentazione integrata.

**RECOMMENDED CHANGE:** Aggiungere scheda riconciliazione per ogni importo e lista richiesta documenti aggregata.

**ACCEPTANCE CRITERIA:** La RSU ricava tutte le15 risposte con riferimenti ai dati; manuale/calcolato/facoltativo/mancante sempre distinguibili.

## E — UX e grafica

### UX-02 — Contesto ente/anno poco visibile sui telefoni

**ID:** UX-02

**SEVERITY:** HIGH

**CATEGORY:** E

**SCREEN/PATH:** Context bar / menu mobile

**SCENARIO:** 390×844 e360×800, più enti e anni

**OBSERVED:** Nome ente e anno spariscono dalla barra compatta; a360 badge tagliato. Intestazione di pagina scorre fuori vista.

**EXPECTED:** Contesto corrente persistente e leggibile anche in sezioni lunghe.

**WHY IT MATTERS TO AN RSU:** Aumenta il rischio di modificare il Fondo sbagliato, soprattutto per Admin.

**LEGAL BASIS:** Non pertinente

**EVIDENCE:** R390.png; R360.png; R360_drawer.png

**ROOT CAUSE:** Scelte responsive riducono l’informazione di contesto invece di adattarla.

**RECOMMENDED CHANGE:** Conservare nome abbreviato espandibile, anno e stato; indicare proprietà altrui per Admin.

**ACCEPTANCE CRITERIA:** A360px ente/anno/stato restano accessibili durante scroll e modali; nome completo leggibile senza cambiare Fondo.

### UX-03 — Terminologia tecnica e gerarchia mobile dispersiva

**ID:** UX-03

**SEVERITY:** MEDIUM

**CATEGORY:** E

**SCREEN/PATH:** Wizard / report / navigazione

**SCENARIO:** RSU non tecnica

**OBSERVED:** READY, legacy, mapping, payload atomico, DocumentFactory e refactoring; due menu diversi; CTA mobile molto alta.

**EXPECTED:** Lessico contrattuale e azioni contestuali con gerarchia stabile.

**WHY IT MATTERS TO AN RSU:** La comprensione richiede conoscere l’architettura invece del Fondo.

**LEGAL BASIS:** Non pertinente

**EVIDENCE:** P10_transfer.txt; P16_documents.txt; R430.png; R360_drawer.png

**ROOT CAUSE:** Testi di sviluppo esposti e componenti di navigazione sovrapposti.

**RECOMMENDED CHANGE:** Sostituire con stato e conseguenza operativa; distinguere navigazione Toolbox e Fondo; ridurre CTA mobile.

**ACCEPTANCE CRITERIA:** Nessun termine interno nelle azioni RSU; una prima azione chiara visibile senza quasi una schermata di scroll.

## F — Accessibilità

### ACCESS-01 — La modale Nuovo ente non trattiene il focus

**ID:** ACCESS-01

**SEVERITY:** HIGH

**CATEGORY:** F

**SCREEN/PATH:** Catalogo → Nuovo ente

**SCENARIO:** Navigazione Tab ed Escape

**OBSERVED:** Focus passa da Crea al BODY e ai controlli sullo sfondo; Escape non chiude.

**EXPECTED:** Focus confinato, ruolo dialog, nome accessibile e ripristino sul trigger.

**WHY IT MATTERS TO AN RSU:** Da tastiera non è chiaro su quale livello si stia operando.

**LEGAL BASIS:** Criterio funzionale di accessibilità; nessuna certificazione WCAG complessiva

**EVIDENCE:** P28_modal_keyboard.json; controllo DOM modale

**ROOT CAUSE:** Gestione modale senza contenimento focus e gestione tastiera coerente.

**RECOMMENDED CHANGE:** Usare dialog accessibile con focus iniziale, trap, Escape quando appropriato e ritorno al trigger.

**ACCEPTANCE CRITERIA:** Tab/ShiftTab restano nel dialog; sfondo non interagibile; chiusura ripristina il focus.

### ACCESS-02 — Label e semantica dei controlli incomplete

**ID:** ACCESS-02

**SEVERITY:** MEDIUM

**CATEGORY:** F

**SCREEN/PATH:** Wizard / Report / accordion

**SCENARIO:** Ispezione DOM e albero accessibile

**OBSERVED:** Sette textbox metadati report senza nome; diversi spinbutton Wizard senza label utile; pulsanti annidati negli accordion.

**EXPECTED:** Nome programmatico, descrizione/errore associato e un solo controllo interattivo per trigger.

**WHY IT MATTERS TO AN RSU:** Lettore schermo e tastiera non identificano in modo affidabile i dati da inserire.

**LEGAL BASIS:** Criteri funzionali; test con screen reader reale non eseguito

**EVIDENCE:** P16_documents.txt; P02_wizard_2025.txt; P30_closed_edit.txt

**ROOT CAUSE:** Testo visivo non associato agli input; HTML interattivo annidato.

**RECOMMENDED CHANGE:** Collegare label/for/id, aria-describedby per errori; eliminare button dentro button.

**ACCEPTANCE CRITERIA:** Ogni campo ha nome univoco e unità; errori annunciabili; ordine Tab senza duplicazioni.

## G — Pulizia architetturale

### ARCH-01 — Alias legacy e formule CCNL concorrenti alterano i dati

**ID:** ARCH-01

**SEVERITY:** HIGH

**CATEGORY:** G

**SCREEN/PATH:** Normalizzazione / calcoli

**SCENARIO:** Canonico DL25=0, legacy=900; vecchie basi riparto FRD80.000/EQ20.000

**OBSERVED:** Resolver restituisce900; calcolo CCNL legacy divide0,14% in1.120 FRD+280 EQ mentre il Wizard attribuisce1.400 al FRD.

**EXPECTED:** Zero esplicito prevale sull’alias; medesima regola per lo0,14% in ogni percorso.

**WHY IT MATTERS TO AN RSU:** Il risultato dipende dalla storia dello snapshot anziché dalla decisione corrente.

**LEGAL BASIS:** N06 VERIFIED_RULE

**EVIDENCE:** PASS5_ORACLE_COMPARISON.json/extras

**ROOT CAUSE:** fundCalculations.ts:31 fallback basato su >0; ccnl2024Calculations.ts ripartisce tutte le componenti.

**RECOMMENDED CHANGE:** Migrazione esplicita e normalizzazione unica; dismettere i percorsi concorrenti.

**ACCEPTANCE CRITERIA:** Canonico0+legacy900 produce0; dato legacy isolato migrato con provenienza;0,14% tutto FRD in ogni vista.

### ARCH-02 — Metadata temporali e ruoli denormalizzati richiedono confini espliciti

**ID:** ARCH-02

**SEVERITY:** MEDIUM

**CATEGORY:** G

**SCREEN/PATH:** Trasferimento / snapshot / autorizzazione

**SCENARIO:** A/2027 creato Admin e riaperto dal proprietario

**OBSERVED:** Ownership corretta ma ruolo memorizzatoADMIN; metadata022 assumono sempre2 annualità. Non dimostrata escalation di privilegi.

**EXPECTED:** Identità autore distinta dal proprietario e dal ruolo attuale; metadata non autoritativi.

**WHY IT MATTERS TO AN RSU:** Campi di supporto possono diventare fonti concorrenti per controlli o UI.

**LEGAL BASIS:** Non pertinente

**EVIDENCE:** STAGING_SECURITY.json; applyWizard2026Transfer.ts:252; AppContext.tsx:819

**ROOT CAUSE:** Duplicazione ruolo/autore e dati calcolati; nel percorso corrente il ruolo autenticato viene preservato.

**RECOMMENDED CHANGE:** Documentare e tipizzare i confini; ricalcolare i derivati; escludere metadata da decisioni autorizzative.

**ACCEPTANCE CRITERIA:** Ruolo snapshot mai fonte di autorizzazione; anno e capienza metadata corrispondono al calcolo; owner sempre entity.user_id.

## Quindici domande RSU e percorso iniziale

La trascrizione indipendente integrale è inclusa qui sotto. Le osservazioni inizialmente pendenti su API, export e chiusura sono integrate dalle prove PASS5 del presente report; il testo congelato non è stato riscritto.

# PASS 1 — osservazioni congelate prima di leggere il codice

Sessioni 21–22 settembre 2026. Baseline verificata: `9f90771e63cc9c45684d6d78baa144e923ea6868`, branch richiesto, nessuna modifica tracciata. Vite loadEnv development e URL estratto dal modulo client servito HTTP: https://mcasgpaivyosaroxrodm.supabase.co. Login USER_A, ADMIN_B e USER_C effettuati nella UI locale. Il browser non espone performance/network mediante evaluate; manca ancora una cattura diretta delle richieste. Non confondere questa limitazione con un target produzione: URL effettivo servito e identità staging verificati. Il precedente PREFLIGHT.md è preesistente e superato dalla verifica di .env.local.

## Percorso e dataset

Login → Apri tutti i Fondi → Nuovo ente → Crea e apri Fondo: 3 clic dopo login, senza ritorni. Ente A creato con nome lungo e anno iniziale 2025; presente anche 2026. Successivamente rinominato `ASTRA AUDIT 20260921 Ente A rinominato`. Ente B `ASTRA AUDIT 20260921 Ente B`, 2026. ADMIN_B crea A/2027. Questi soli enti/anni sono dati eliminabili dell'audit.

A/2025: Comune, no dirigenti, equilibrio sì, prima fascia sì, dissesto/deficit/riequilibrio no. Limite certificato 100000, fondo 2018 80000, EQ2018 20000, personale manuale 10/12. MS2021 1000000. Tabellari2023 inseriti -100 per prova negativa. Art60: 1 funzionario. Straordinario10000, riduzione stabile2000. PNRR non attuatore. Nessuno stanziamento 0,22% scelto. Trasferimento confermato. RIA -100 accettata con riduzione del consumo Art23; poi ripristinata 0 e salvata.

ADMIN_B: Tutti4/Miei0/Altri4; ricerca su solo nome audit. A/2026 RIA321 salvata. A/2027 creata. USER_A rientra e vede anno2027; dopo attivazione esplicita vede A/2026 totale321. USER_C accede e trova zero enti. Non è ancora una prova di RLS mediante richiesta diretta.

## Evidenze e limiti

P01–P27 sono snapshot UI contemporanei; R1440/R1366/R1024/R768/R430/R390/R360 screenshot realmente osservati. P18 cattura uno stato transitorio prima del caricamento annualità: NON dimostra perdita dati. P25 è Ente B, NON dimostra perdita della modifica Admin; la prova corretta è P26. Timeout durante azioni browser non sono automaticamente errori app.

Chiusura: pulsante presente in gestione avanzata solo per anno attivo; conferma nativa raggiunta, ma lo strumento non completa stabilmente accept. Chiusura/read-only non ancora verificati. Export scaricati non ancora analizzati; anteprima Tabella15 verificata. Zoom, percorso completo tastiera, lettore schermo, input eccessivi e accesso API USER_C ancora da approfondire. Nessun codice applicativo o test letto in questo pass (solo package.json, vite.config.ts e identificazione URL client per preflight).

## Quindici risposte RSU basate soltanto sul browser

1. Fondo A2025: cabina8872,56; pagina Personale fondo costituito8872,56 ma totale disponibile10272,56; Tabella15 4327,44. Non esiste un numero univoco difendibile: CALC/DOC.
2. Stabile3272,56 in cabina, 4672,56 somma sezione Personale, 1527,44 Tabella15. Discrepanza CALC/DOC.
3. Variabile5600 in cabina; arretrati inseriti2800; Tabella15 variabile2800. Discrepanza da indagare.
4. Soggetto al limite complessivo10000, composto Comparto2000+Straordinario8000; distingue bene il perimetro.
5. Escluso7000 nel prospetto; la provenienza non è riconciliabile con i soli importi trasferiti1400+2800. Finding spiegabilità/calcolo.
6. Limite120000: storico100000 più adeguamento20000, formula disponibile. Fondo nuovo A2026 espone invece1730000 e straordinario50000 senza input dell'audit.
7. UI dice conforme, margine110000. Non basta per attestare correttezza: dati incompleti e negativi ammessi. Fondo totalmente vuoto dichiara controlli superati.
8. Sono indicate esclusioni CCNL0,14/arretrati; PNRR non applicabile; DL25 non valorizzato. Art60 riduce fondo ma computo figurativo mantiene consumo. Etichette aiutano; totali non riconciliati.
9. Wizard elenca mancanti e destinatari; rimangono basi DL25, dati sostenibilità ed economie. Cabina li perde e propone distribuzione con raccolta7/8.
10. I dati sono dichiarati inseriti dall'operatore; non ho visto provenienza documentale/certificazione allegata per ogni dato. Non si può distinguere un valore amministrativo verificato da una simulazione.
11. Sono visibili formule pro-capite, percentuali, art60, straordinario. Diverse formule espongono nomi tecnici. Nel riepilogo DL25 compare4,8% contro48% dello step.
12. L'app distingue massimi teorici e stanziamenti scelti per DL25/PNRR/0,22%. Le condizioni incompletamente istruite non impediscono uno stato complessivo valido con warning.
13. Distribuzione mostra utilizzi e performance. Mancano in vista sintetica una distinzione completa delle competenze ente/contrattazione e le verifiche preliminari ancora dovute.
14. Disponibile contrattazione8872,56, automaticamente tutto allocato a performance con rimanenza0; il significato negoziale è poco evidente e dipende da dati personale assenti.
15. È possibile generare richieste dati dal Wizard, per step/mancanti/tutti. Occorre chiedere atti storici2016/2018, basi salariali, certificazioni, personale, requisiti finanziari, stanziamenti e impieghi; il quadro unico delle contestazioni non emerge dalla cabina.

## Osservazioni da qualificare nei pass successivi

- UI iniziale chiara; CTA principale identificabile. Ripresa lavoro funziona dopo caricamento. Gestione avanzata rompe il percorso e usa termini di architettura.
- Wizard2026 disponibile per2025; percentuali/Art60 producono e trasferiscono importi. Base art33 PIAO sempre detta2026. DL25 alterna2024/2025 e riepilogo4,8%.
- Trasferimento: bottone centrale funzionante, laterale disabilitato con messaggio refactoring contraddittorio. Conferma mostra campi e payload tecnici.
- Fondo vuoto: controlli superati e valori storici predefiniti. Negativo RIA riduce consumo e mantiene conformità.
- Responsive: desktop e tablet leggibili; telefoni390/360 nascondono ente/anno nella context bar, a360 anche badge tagliato; CTA principale richiede quasi una schermata. Due controlli menu diversi. Identità contesto visibile solo nell'intestazione che scorre.
- Accessibilità: diversi spinbutton e pulsanti icona privi di nome nel Wizard/gestione avanzata; modali nei snapshot senza ruolo dialog; drawer lascia contenuto sottostante presente. Necessaria verifica tastiera prima di concludere su focus trap.

PASS1 documentato; copertura limitata esplicitamente alle prove eseguite. Eventuali integrazioni saranno indicate come PASS5, senza retroattribuirle al black box indipendente.

## Copertura e limiti residui

- Sette viewport realmente osservate:1440×900,1366×768,1024×768,768×1024,430×932,390×844,360×800. Desktop/tablet leggibili; criticità concrete su contesto e densità mobile. Non eseguito un audit strumentale completo del contrasto.
- Tastiera/focus e semantica DOM verificati a campione. Zoom browser e screen reader reale non verificati; touch target non misurati sistematicamente. Non dichiarata conformità WCAG.
- Export determinazione PDF/TXT, relazione, prospetto e Tabella15 XLSX/CSV eseguiti tramite gli stessi generatori, con adattatori di download/interop solo nello script di audit. PDF2 pagine renderizzato e osservato: leggibile, senza tagli evidenti; gli errori principali sono semantici/numerici. Non è prova end-to-end del download browser, che non è stato intercettato stabilmente. Riepilogo PDF generale e XLS analitico Fondo non verificati.
- La chiusura via conferma nativa non era completabile stabilmente dallo strumento; eseguito il workflow applicativo sulle API staging e poi verificata la consultazione reale. Eliminazione dataset completata via API, non certificata la UX di tutte le eliminazioni UI.
- Normativa: profondità maggiore su art23/art33, DL25, incrementi e conglobamento. Matrice include gli altri istituti e le esclusioni con stato di copertura. Dirigenza/segretario, contratti storici, singole voci speciali e mapping istituzionale Tabella15 non sono certificati voce per voce. Le relative incertezze non diventano bug.
- Non eseguiti l’intera suite, build generale, penetration test completo, concorrenza multi-dispositivo o recupero di bozze offline. Nessuna assenza di difetti inferita dai259 test.
- La funzione puro calcolo può restituire un numero anche se il validatore segnala input invalido: i MISMATCH O014-negative/O033-missing non provano da soli un bypass UI. L’errore negativo RIA è invece osservato direttamente.
- Sono escluse come false evidenze P18 (caricamento transitorio) e P25 (contesto B); la modifica Admin è dimostrata da P26 e dal valore321 sul database. Timeout del browser e interop Node non sono bug del prodotto.

## Cleanup e conservazione

`CLEANUP.json` documenta la rimozione dei soli due enti ASTRA AUDIT20260921, A/2025,2026,2027 e B/2026,2027. Zero enti/snapshot/bozze remote residue. Tutti gli altri enti e snapshot sono invariati mediante confronto; tre identità autenticate e preservate; `.env.local` e `.astra-test-users.local` conservati. Scheda audit chiusa prima della rimozione per evitare autosave. Le eventuali cache locali del browser non sono state cancellate indiscriminatamente; non attestata la rimozione di ogni chiave locale orfana.

I precedenti due report non tracciati sono conservati in `previous_reports/`. I file preesistenti estranei all’audit non sono stati alterati. Evidenze correnti in `astra_evidence/run_20260921/`; non usare i vecchi preflight come diagnosi del target attuale.

## Ordine delle future correzioni

1. Integrità dati: SEC-01, DATA-02 e feedback/read-only FUNC-01.
2. BLOCKER/HIGH di calcolo: CALC-01/02, DOC-01, NORM-01; poi regole temporali, simulatore, totali derivati e validazioni.
3. Workflow: completezza istruttoria, chiusura recuperabile, trasferimento unico.
4. Spiegabilità: ledger verificabile e documenti realmente riconciliati.
5. UX: contesto ente/anno e prossima azione; poi gerarchia grafica e lessico.
6. Accessibilità/polish, anticipando focus e label nelle componenti toccate dalle correzioni.

Nessuna di queste correzioni è stata implementata.

## Dichiarazioni finali

```text
AUDITED_COMMIT = 9f90771e63cc9c45684d6d78baa144e923ea6868
FRONTEND = LOCALHOST
DATABASE = mcasgpaivyosaroxrodm
PRODUCTION_USED = NO
AUDIT_IMPLEMENTATION_PERFORMED = NO
CODE_CHANGED = NO
DATABASE_SCHEMA_CHANGED = NO
COMMIT_CREATED = NO
PUSH_PERFORMED = NO
DEPLOY_PERFORMED = NO
```

ASTRA_AUDIT_COMPLETE
