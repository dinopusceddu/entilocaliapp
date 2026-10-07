# ASTRA — Matrice normativa

Baseline `9f90771e63cc9c45684d6d78baa144e923ea6868`; data verifica 22 settembre 2026.

VERIFIED_RULE indica testo verificato della disposizione specifica; non una certificazione generale di vigenza di tutto l’ordinamento. INTERPRETATIVE_RULE distingue orientamento o criterio applicativo dalla norma. UNCERTAIN indica controllo incompleto o questione non risolta: non costituisce automaticamente bug. MATCH numerico non equivale a corretta istruttoria amministrativa.

## Fonti e regole indipendenti congelate

Il testo seguente è il PASS2, precedente alla lettura dei sorgenti. Le integrazioni successive sono distinte sotto, senza riscrivere l’oracle originario.

# PASS 2 — regole indipendenti, prima della lettura del codice

Data verifica: 22 settembre 2026. Il PASS1 è già congelato. Nessun sorgente applicativo/test letto per costruire queste regole. Fonti non raggiungibili integralmente non sono considerate verifica completa della vigenza.

| ID | Fonte, articolo/comma, data e URL | Regola e formula indipendente | Classificazione e vigenza |
|---|---|---|---|
| N01 | [D.Lgs.75/2017 art.23 c.2](https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legislativo:2017-05-25;75~art23!vig=), 25/5/2017; testo riprodotto in [GU 9/4/2019](https://www.gazzettaufficiale.it/eli/gu/2019/04/09/84/so/16/sg/pdf) | Tetto complessivo accessorio dell'amministrazione, inclusa dirigenza, pari al corrispondente importo 2016 salvo deroghe. Il fondo dipendenti non è l'intero perimetro. | VERIFIED_RULE principio; verifica multivigente Normattiva ostacolata da redirect. Non certificata l'assenza di ogni modifica successiva. |
| N02 | [D.L.34/2019 art.33 c.2](https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legge:2019;34~art33!vig=); [circolare 13/5/2020 GU](https://www.gazzettaufficiale.it/atto/vediMenuHTML?atto.codiceRedazionale=20A04799&atto.dataPubblicazioneGazzetta=2020-09-11&tipoSerie=serie_generale&tipoVigenza=originario) | Comuni: adeguamento pro capite su fondo e PO2018, personale2018; la circolare conserva il limite iniziale in caso di diminuzione. Per esempio omogeneo 100000/10*(12-10)=20000. Non usare il certificato2016 come numeratore2018. | VERIFIED_RULE testo; INTERPRETATIVE_RULE modalità circolare e conteggio personale, da documentare per casistiche TD/trasferimenti. |
| N03 | [DM17/3/2020 art.2 e4, GU27/4/2020](https://www.gazzettaufficiale.it/atto/serie_generale/caricaDettaglioAtto/originario?atto.codiceRedazionale=20A02317&atto.dataPubblicazioneGazzetta=2020-04-27&elenco30giorni=true) | Sostenibilità: spesa personale oneri inclusi, IRAP esclusa / media entrate correnti ultimi3 rendiconti meno FCDE; soglie per popolazione. FCDE mancante non prova FCDE zero. | VERIFIED_RULE; discipline diverse per Province/Regioni da verificare separatamente. |
| N04 | [D.L.25/2025 art.14 c.1-bis, testo MEF vigente dal1/1/2026](https://def.finanze.it/DocTribFrontend/getAttoNormativoDetail.do?ACTION=getArticolo&codiceOrdinamento=0000000000000140000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000&id=%7B4DA5BD0F-6595-439D-A142-F4392AB46401%7D) | Dal2025 facoltà Regioni/Cittàmetro/Province/Comuni; stabile+EQ <=48% tabellari2023; rispettoart33/equilibrio asseverato; derogaart23. Mancata rilevazione conto annuale:25% incremento indisponibile fino a regolarizzazione. | VERIFIED_RULE. Modificato L199/2025art1c238; include trasferimenti alle unioni/comunità con riduzione permanente corrispondente. |
| N05 | [RGS175706 del27/6/2025](https://www.anci.it/wp-content/uploads/2025/06/nota-operativa-accessorio-enti-locali.pdf), §§2.3,2.4,3 e4; copia firmata13p salvata sources | Margine=max(0,0.48*TAB23-CS25-EQ25), CS25 secondo rettifiche indicate dalla nota. Vincolo aggiuntivo SP+incremento*(1+oneri)<=limiteSP; esempioOR27.4% oltre INAIL. EQ finanziata con corrispondente riduzione FRD. | INTERPRETATIVE_RULE ufficiale RGS; esempio2025 non autorizza a usare automaticamente2024. Nota antecedente CCNL2026, coordinareart60c5. |
| N06 | [CCNL23/2/2026 art.58c1](https://www.aranagenzia.it/wp-content/uploads/2026/02/CCNL-Comparto-2022-2024-23-02-26.pdf), p80 | Dal1/1/2024 stabile=0.0014*MS2021 personale destinatario. Il comma1 non prescrive riparto EQ. | VERIFIED_RULE CCNL definitivo vigente. |
| N07 | Stesso CCNL art.58c2,p80; L207/2024art1c121 richiamata | Facoltativo annuo<=0.0022*MS2021, decorrenza2025, capacità bilancio, esclusoart23; riparto proporzionale FRD/EQ sugli importi2024. | VERIFIED_RULE. 2026 non rende automaticamente doppio il massimale annuale. |
| N08 | [ARAN orientamento37357,18/5/2026](https://www.aranagenzia.it/orient-applicativi/ccnl-2022-2024-gli-incrementi-delle-risorse-destinate-al-fondo-risorse-de-centrate-di-cui-allart-58-comma-1-e-2-del-ccnl-23-02-2026-del-comparto-funzioni-locali-relativi-ad-annualita-gi/) | Recupero2024/25 dello0.14 in variabile2026 se annualità chiuse; alternativa arretrati performance se clausola automatica integrativa. Analogo criterio per0.22competenza2025. Esclusione0.14art23 viaDL135/2018art11. | INTERPRETATIVE_RULE, non obbligo generalizzato di raddoppiare gli incrementi. |
| N09 | CCNL23/2/2026 art.60c1,2,5,TabC; [ipotesi3/11/2025](https://www.aranagenzia.it/wp-content/uploads/2025/11/IPOTESI-FL-03-11-25-OK.pdf) | Conglobamento dal1/1/2026; riduzione stabile=12*(10.62F+9.40I+8.06OE+6.63O) per personale destinatario alla decorrenza, ancheTD. Computo figurativo siaart23 siaDL25. Nel2025 riduzionezero. | VERIFIED_RULE. Part-time e casi particolari da documentare; non desumere la platea dai soli dipendenti correnti. |
| N10 | CCNL23/2/2026 art.59c1–4 e48 | Disponibile negoziale al netto oneri fissi; prevalenza risorse variabili qualificate agli usi a–f e almeno30% delle risorse destinate a tali usi alla performance. Art59 sostituisce80CCNL2022. | VERIFIED_RULE; la mancanza del personale non è prova di organico<=5. |
| N11 | [CCNL16/11/2022 art.79](https://www.aranagenzia.it/documento_pubblico/contratto-collettivo-nazionale-di-lavoro-relativo-al-personale-del-comparto-funzioni-locali-triennio-2019-2021/); [CCNL21/5/2018 art.67](https://www.aranagenzia.it/documento_pubblico/contratto-collettivo-nazionale-di-lavoro-relativo-al-personale-del-comparto-funzioni-locali-triennio-2016-2018/) | Costituzione integra fonti storiche e incrementi; conservare natura stabile/variabile e non sommare due volte la stessa risorsa. Risorse EQ dal bilancio distinte FRD. | VERIFIED_RULE struttura; controllo voce-per-voce ancora da completare. |
| N12 | [DL13/2023art8c3–4](https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legge:2023-02-24;13~art8=) | Facoltà2023–2026, componente variabile<=5% stabile certificato2016, anche dirigenti; specifica base segretari. Requisiti cumulativi c4. | VERIFIED_RULE percentuale/anni dal testo indicizzato; UNCERTAIN verifica integrale aggiornata requisiti e necessità soggetto attuatore non completata. Non proclamare bug su questa incertezza. |

Ulteriori istituti dirigenza/segretari, esclusioni speciali, Tabella15 RGS richiedono verifica dedicata. Questa lacuna sarà dichiarata nella matrice, non coperta da un generico PASS. Ricerca indipendente principale conclusa; eventuali integrazioni successive identificate come tali.

## Integrazione successiva alla white-box

| ID | Fonte ufficiale, atto, articolo/comma, data, URL | Regola | Vigenza / classificazione |
|---|---|---|---|
| N13 | [GU 7/8/2026 n.182, DL144/2026 art.2 c.1](https://www.gazzettaufficiale.it/eli/gu/2026/08/07/182/sg/pdf), pagina stampata13/PDF15 | Agli enti soggetti all’art33 non si applicano i commi557,557-quater,562 L296/2006. | VERIFIED_RULE; in vigore8/8/2026, confermato anche dalla scheda Normattiva. Non estendere la deroga ad altri enti o ad art23. |
| N14 | [GU 4/5/2026, DL19/2026 coordinato L50/2026 art.3 c.3](https://www.gazzettaufficiale.it/eli/gu/2026/05/04/101/sg/pdf), pagina stampata45/PDF47 | Comuni fino a3.000: esclusione per gli importi segretario individuati dai richiami contrattuali, anche da art23, dalla decorrenza del decreto. | VERIFIED_RULE testo; doppia neutralizzazione del tetto2016 e trattamento transitorio richiedono motivazione interpretativa separata. |
| N15 | [CCNL Area23/2/2026 art.24 cc.1–3](https://www.aranagenzia.it/wp-content/uploads/2026/02/CCNL-Area-FL-2022-2024-firmato.pdf), p36 | Dirigenti RAL: stabile3,05% MS2021 da1/1/2024; utilizzi vincolati e facoltà0,22% MS2021 per risultato. | VERIFIED_RULE. Verifica importi/manualità app parziale, non regressione esaustiva. |
| N16 | [CCNL Area23/2/2026 artt.38–40](https://www.aranagenzia.it/wp-content/uploads/2026/02/CCNL-Area-FL-2022-2024-firmato.pdf), pp51–54 | Segretari: nuova disciplina posizione/risultato; art40 prevede0,80% MS2021 da2024 e facoltà0,22%. Art39 sostituisce61/2024, con soglie differenziate10/15/20%. | VERIFIED_RULE; confronto voce per voce e condizioni delle maggiorazioni non completato. |
| N17 | [DL13/2023 art.8 cc.3–4, testo coordinato GU21/4/2023](https://www.gazzettaufficiale.it/eli/gu/2023/04/21/94/sg/pdf), p97/PDF101 | PNRR: 2023–26,5% stabile certificato2016; requisiti cumulativi equilibrio precedente, debito/ritardi pagamenti, incidenza accessorio<=8%, rendiconto tempestivo. Base specifica segretari. | VERIFIED_RULE del testo consultato; non conclusa verifica di ogni modifica successiva. Requisito autonomo “soggetto attuatore” UNCERTAIN, non finding normativo. |
| N18 | [CCNL comparto23/2/2026 art.20](https://www.aranagenzia.it/wp-content/uploads/2026/02/CCNL-Comparto-2022-2024-23-02-26.pdf) | Coordinamento risorse straordinario negli enti privi di dirigenza, con corrispondente movimento sul Fondo. | VERIFIED_RULE del meccanismo; caso10000→8000 e trasferimento2000 provato. Condizioni complete per ogni tipologia da istruire. |

## Matrice Fonte → Regola → Dato → Formula → Condizioni → UI → Codice → Esito

| ID | Fonte ufficiale | Regola | Dato / Formula | Condizioni e Applica? | UI | Implementazione | Esito / Note |
|---|---|---|---|---|---|---|---|
| N01 | Fonte N01 sopra | Limite complessivo art23 | Certificato2016 oppure somma FRD+EQ+Seg+Dir+straordinario2016 | Sì; perimetro unico amministrazione | Verifica / Personale | historicalLimit2016Core; fundEngine | Somma150000 MATCH; DATA-01/CALC-04 compromettono affidabilità dei dati e consumo. |
| N02 | Fonte N02 sopra | Adeguamento art33 | (FRD2018+EQ2018)/personale2018 × crescita omogenea; floor secondo circolare | Comuni, personale comparabile; non confondere2016 e2018 | Wizard art23 | art23Limit; art23Fte; shared policy | Caso100000→120000 MATCH; calo personale floor MATCH; missing restituisce0 nella funzione, non dimostra assenza di warning UI. |
| N03 | DM17/3/2020 | Sostenibilità | SP/(media3 entrate−FCDE), soglia per abitanti | Comuni; anni di rendiconto documentati | DL25 / simulatore | dl25Increment; getSogliaSpesaPersonale | Confini27% provati; FCDE mancante trattato0, completezza non provata. Province/Regioni: non estendere automaticamente lo stesso DM. |
| N04 | DL25 art14 c1-bis | Incremento stabile48% | max(0,48% TAB2023−CS corrente rettificata−EQ corrente) | Campo soggettivo, art33, equilibrio asseverato, rendicontazione | Wizard step3 | dl25Increment | Margine24000 MATCH; non confondere massimo teorico con autorizzazione a stanziare; NORM-04 anno UI. |
| N05 | RGS175706 §§2.3–4 | Rettifiche e sostenibilità | incremento lordo dipendente più oneri contro margine lordo ente | Certificazione e dati finanziari completi; nota2025 da coordinare con N13 | Simulatore | calculateSimulazione | CALC-03:18838,30 contro24000; vincolo L296 non aggiornato NORM-03. |
| N06 | CCNL comparto art58 c1 | Incremento stabile0,14% | MS2021×0,0014; tutto FRD | Da2024, base pertinente | Wizard / Personale | ccnl2026Increments vs ccnl2024Calculations | Importo1400 MATCH nel Wizard; legacy ripartisce EQ; CALC-02 doppio conteggio UI. |
| N07 | CCNL comparto art58 c2 | Facoltà0,22% | MS2021×0,0022; quote FRD/EQ proporzione2024 | Da2025; capacità bilancio; esclusione art23 | Wizard / Verifica | ccnl2026Increments; fundEngine | NORM-02:2024 non disattivato;2026 raddoppio non condizionato. |
| N08 | ARAN37357 | Recupero anni chiusi | Importi spettanti−già utilizzati, distinti per competenza | Annualità chiuse / clausole integrative secondo orientamento | Arretrati / trasferimento | CCNL calculations / transfer | CALC-01 e NORM-02; orientamento non obbligo universale di2800. |
| N09 | CCNL art60 eTabC | Riduzione e computo figurativo | 12×(10,62F+9,40I+8,06OE+6,63O) | Decorrenza2026; personale alla data; ancheTD | Wizard step5 / Personale | conglobamentoArt60; engine | Valori unitari MATCH;2025 MISMATCH; figurativo art23 osservato. Coordinamento DL25 non testato in tutti i percorsi. |
| N10 | CCNL artt48/59 | Impiego risorse e performance | Disponibile al netto fissi; prevalenza/30% sul perimetro contrattuale | Platea e risorse qualificate note | Distribuzione | inputNormalizer / utilizzi | Mancante personale→0 e non applicabile; FUNC-02. Percentuali non certificate su tutte le basi. |
| N11 | CCNL2022 art79 /2018 art67 | Costituzione storica stabile/variabile | Consolidato, incrementi, RIA, risorse legge, residui, decurtazioni distinti | Evitare somme già consolidate e duplicati | Schede costituzione | fundCalculations; definizioni voci | Riconciliazione fallita; restanti voci manuali richiedono documenti. Nessuna certificazione generalizzata delle esclusioni. |
| N12/N17 | DL13 art8 cc3–4 | Facoltà PNRR |5% stabile certificato2016; base segretari distinta |2023–26 e requisiti cumulativi | Wizard PNRR | pnrrIncrement; engine | Anni/percentuale MATCH con requisiti assunti; CALC-05 massimozero senza errore. |
| N13 | DL144 art2 c1 | Superamento vincoli L296 per enti art33 | Non includere vincolo non applicabile dal8/8/2026 | Sì, Comune soggetto art33 | Simulatore | min include sempre fase3 | NORM-03. |
| N14 | DL19 art3 c3 | Deroga segretari piccoli Comuni | Importi contrattuali individuati, popolazione<=3000 | Dalla decorrenza; non tutto il costo indiscriminatamente | Segretario / Verifica | fundEngine:358–389 | Modalità ordinario/solo corrente/doppia neutralizzazione presenti; criterio storico UNCERTAIN, non PASS. Funzione senza gate anno in queste righe: rischio da verificare end-to-end. |
| N15 | CCNL Area art24 | Fondo dirigenti RAL |3,05% MS2021 stabile;0,22% variabile facoltativo | Dirigenza presente; decorrenze e destinazioni | Dirigenza | campi art24 e somme manuali in fundCalculations | Presente; non automaticamente assente perché JSONnormativa non lo elenca. Capienza/competenza non verificate con dataset completo. |
| N16 | CCNL Area artt38–40 | Segretario posizione/risultato | Importi per classe;0,80% e0,22% MS2021; soglie risultato | Incarico, platea, bilancio, anno | Segretario | campi storici e nuovi, alias sommati | Copertura parziale; rischio duplicazione alias da verificare, non quantificato come bug in questo report. |
| N18 | CCNL comparto art20 | Straordinario e trasferimenti |10000−2000=8000; stabile+2000 | Ente senza dirigenza nel test | Wizard / Personale | trasferimento e engine | Movimento corrente osservato; mapping Tab15 perde2000 (DOC-01). |
| N19 | CCNL comparto artt16–18,58 | Risorse EQ | Dotazione di bilancio, risultato, maggiorazioni e quota022 | Incarichi e condizioni specifiche | EQ | calculateEqSubFund, ccnl split | Quota022 sull’80/20 provata;014 legacy impropria ARCH-01. Altre maggiorazioni non certificate. |
| N20 | Norme speciali richiamate dal prodotto | Incentivi tecnici, tributi, CDS, altri compensi | Base/aliquota/destinazione specifica, non percentuale unica | Solo con presupposti e anno applicabile | Variabile / utilizzi / altri fondi | campi manuali e flag di esclusione | UNCERTAIN controllo integrale vigenza ed esclusioni; non assumere che il solo flag provi una deroga. |
| N21 | Istruzioni annuali RGS Conto Annuale | Mappatura Tabella15 | Corrispondenza voce/colonna/segno e totale | Schema dell’anno di rilevazione | Anteprima/XLS/CSV | tabella15Mapper | Aritmetica errata DOC-01; codici colonna non validati contro schema ufficiale annuale. |

## Documenti da chiedere all’amministrazione

Certificazione e prospetto completo2016; FRD/EQ e platea2018; monte salari2021 con perimetro; tabellari2023 e rettifiche CS/EQ; atti di costituzione e utilizzo2024/25; residui e clausole integrative; deliberazioni sugli incrementi facoltativi; rendiconti, FCDE, spesa personale e asseverazione; personale alla decorrenza art60; PNRR e parametri del comma4; oneri fissi, riparto degli utilizzi e atti dei revisori. Per ogni dato conservare provenienza, data, competenza e stato di verifica.

## Inventario dei riferimenti dichiarati nel file normativa del prodotto

Inventario white-box, **non fonte normativa** e non attestazione che ogni voce sia stata verificata. Le costanti e le pagine contengono ulteriori riferimenti2026 già trattati sopra.

| Chiave | Riferimento dichiarato dall’app | Copertura audit |
|---|---|---|
| `art23_dlgs75_2017` | Art. 23, c.2, D.Lgs. 75/2017 | N01 |
| `art33_dl34_2019` | Art. 33, c.2, D.L. 34/2019 | N02 |
| `art14_dl25_2025` | Art. 14, c.1-bis, D.L. 25/2025 (ex DL Energia) | N04/N05 |
| `dm_17_03_2020` | DM 17 Marzo 2020 (Sostenibilità Spesa Personale) | N03 |
| `l296_06_c557` | Art. 1, c. 557, L. 296/2006 (Tetto Spesa Personale) | N13 |
| `art67_ccnl2018` | Art. 67, c.2, CCNL Funzioni Locali 2016-2018 | N11, parziale |
| `art79_ccnl2022` | Art. 79, CCNL Funzioni Locali 2019-2021 | N11, parziale |
| `art80_ccnl2022` | Art. 80, CCNL Funzioni Locali 2019-2021 | N10 sostituzione; pregresso parziale |
| `art97_ccnl2022` | Art. 97, CCNL Funzioni Locali 2019-2021 | UNCERTAIN: confronto integrale non concluso; nessun PASS presunto |
| `art98_ccnl2022` | Art. 98, c.1, lett. c), CCNL Funzioni Locali 2019-2021 | UNCERTAIN: confronto integrale non concluso; nessun PASS presunto |
| `art100_ccnl2022` | Art. 100, CCNL Funzioni Locali 2019-2021 | UNCERTAIN: confronto integrale non concluso; nessun PASS presunto |
| `art7_c4_u_ccnl2022` | Art. 7 c. 4 lett. u) CCNL Funzioni Locali 16.11.2022 | UNCERTAIN: confronto integrale non concluso; nessun PASS presunto |
| `art45_dlgs36_2023` | Art. 45 D.Lgs. 36/2023 (ex Art. 113 D.Lgs. 50/2016) | UNCERTAIN: confronto integrale non concluso; nessun PASS presunto |
| `art208_cds` | Art. 208 Codice della Strada | UNCERTAIN: confronto integrale non concluso; nessun PASS presunto |
| `art8_dl13_2023` | Art. 8, c.3-4, D.L. 13/2023 | N12/N17 |
| `ccnl_14092000_art24c1` | Art. 24, c.1, CCNL 14.09.2000 | UNCERTAIN: confronto integrale non concluso; nessun PASS presunto |
| `art17_ccnl2022` | Art. 17 CCNL Funzioni Locali 16.11.2022 | UNCERTAIN: confronto integrale non concluso; nessun PASS presunto |
| `art23_c5_ccnl2022` | Art. 23 c.5 CCNL Funzioni Locali 16.11.2022 | UNCERTAIN: confronto integrale non concluso; nessun PASS presunto |
| `ccnl_seg_01032011_art3c6` | Art. 3 c. 6 CCNL Segretari 01.03.2011 | UNCERTAIN: confronto integrale non concluso; nessun PASS presunto |
| `ccnl_seg_16072024_art58c1` | Art. 58 c. 1 CCNL Segretari 16.07.2024 | UNCERTAIN: confronto integrale non concluso; nessun PASS presunto |
| `ccnl_seg_16072024_art60c1` | Art. 60 c. 1 CCNL Segretari 16.07.2024 | UNCERTAIN: confronto integrale non concluso; nessun PASS presunto |
| `ccnl_seg_16072024_art60c3` | Art. 60 c. 3 CCNL Segretari 16.07.2024 | UNCERTAIN: confronto integrale non concluso; nessun PASS presunto |
| `ccnl_seg_16072024_art60c5` | Art. 60 c. 5 CCNL Segretari 16.07.2024 | UNCERTAIN: confronto integrale non concluso; nessun PASS presunto |
| `ccnl_seg_16072024_art56c1g` | Art. 56 c. 1 lett. g) CCNL Segretari 16.07.2024 | UNCERTAIN: confronto integrale non concluso; nessun PASS presunto |
| `ccnl_seg_16072024_art56c1h` | Art. 56 c. 1 lett. h) CCNL Segretari 16.07.2024 | UNCERTAIN: confronto integrale non concluso; nessun PASS presunto |
| `ccnl_seg_16072024_art56c1f` | Art. 56 c. 1 lett. f) CCNL Segretari 16.07.2024 | UNCERTAIN: confronto integrale non concluso; nessun PASS presunto |
| `ccnl_seg_16072024_art56c1i` | Art. 56 c. 1 lett. i) CCNL Segretari 16.07.2024 | UNCERTAIN: confronto integrale non concluso; nessun PASS presunto |
| `ccnl_seg_16072024_art61c2` | Art. 61 c. 2 CCNL Segretari 16.07.2024 | UNCERTAIN: confronto integrale non concluso; nessun PASS presunto |
| `ccnl_seg_16072024_art61c2bis` | Art. 61 c. 2-bis CCNL Segretari 16.07.2024 | UNCERTAIN: confronto integrale non concluso; nessun PASS presunto |
| `ccnl_seg_16072024_art61c2ter` | Art. 61 c. 2-ter CCNL Segretari 16.07.2024 | UNCERTAIN: confronto integrale non concluso; nessun PASS presunto |
| `ccnl_seg_16072024_art61c3` | Art. 61 c. 3 CCNL Segretari 16.07.2024 | UNCERTAIN: confronto integrale non concluso; nessun PASS presunto |
| `ccnl_dir_17122020_art57c2a` | Art. 57 c.2 lett. a) CCNL Dirigenza FL 17.12.2020 | UNCERTAIN: confronto integrale non concluso; nessun PASS presunto |
| `ccnl_dir_17122020_art56c1` | Art. 56 c.1 CCNL Dirigenza FL 17.12.2020 | UNCERTAIN: confronto integrale non concluso; nessun PASS presunto |
| `ccnl_dir_17122020_art57c2c` | Art. 57 c.2 lett. c) CCNL Dirigenza FL 17.12.2020 | UNCERTAIN: confronto integrale non concluso; nessun PASS presunto |
| `ccnl_dir_17122020_art57c2e` | Art. 57 c.2 lett. e) CCNL Dirigenza FL 17.12.2020 | UNCERTAIN: confronto integrale non concluso; nessun PASS presunto |
| `ccnl_dir_16072024_art39c1` | Art. 39 c.1 CCNL Dirigenza FL 16.07.2024 | UNCERTAIN: confronto integrale non concluso; nessun PASS presunto |
| `ccnl_dir_17122020_art57c2b` | Art. 57 c.2 lett. b) CCNL Dirigenza FL 17.12.2020 | UNCERTAIN: confronto integrale non concluso; nessun PASS presunto |
| `ccnl_dir_17122020_art57c2d` | Art. 57 c.2 lett. d) CCNL Dirigenza FL 17.12.2020 | UNCERTAIN: confronto integrale non concluso; nessun PASS presunto |
| `ccnl_dir_17122020_art57c3` | Art. 57 c.3 CCNL Dirigenza FL 17.12.2020 | UNCERTAIN: confronto integrale non concluso; nessun PASS presunto |
| `ccnl_dir_16072024_art39c2` | Art. 39 c.2 CCNL Dirigenza FL 16.07.2024 | UNCERTAIN: confronto integrale non concluso; nessun PASS presunto |
| `dl16_2014_art4` | Art. 4 D.L. 16/2014 | UNCERTAIN: confronto integrale non concluso; nessun PASS presunto |
| `incremento_decreto_pa` | Incremento potenziale da DL PA / Misure Urgenti | N04/N05, alias ARCH-01 |
| `art59_ccnl2024` | Art. 59 CCNL Funzioni Locali 2022-2024 | N10 |
| `art48_ccnl2024` | Art. 48 CCNL Funzioni Locali 2022-2024 | N10, parziale |
| `art47_ccnl2024` | Art. 47 CCNL Funzioni Locali 2022-2024 | UNCERTAIN: confronto integrale non concluso; nessun PASS presunto |
| `art45_dlgs36_2023_new` | Art. 45 D.Lgs. 36/2023 (Codice Appalti) | UNCERTAIN: confronto integrale non concluso; nessun PASS presunto |
