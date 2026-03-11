# Report Voci: Distribuzione delle Risorse del Fondo

Questo documento offre un prospetto analitico e dettagliato di tutte le voci impiegate nella ripartizione formale delle risorse all'interno della pagina "Distribuzione Risorse", differenziate per l'origine della copertura (Stabile o Variabile) e la tipologia di utilizzo del fondo (Dipendenti vs EQ).

---

## 🏛️ 1. Utilizzi Parte Stabile (Art. 80 c.1)
_Le risorse a valere sulla parte stabile del fondo accessorio destinate alla copertura di istituti fissi e continuativi._

| Nome Voce (UI) | Chiave Interna | Riferimento CCLL / Normativa | Logica di Calcolo / Destinazione |
|---|---|---|---|
| **Differenziali progressioni orizzontali storiche** | `u_diffProgressioniStoriche` | Art. 80, CCNL Funzioni Locali 2019-2021, c.1 | Valore aggregato **autocalcolato** dalla pagina Personale in Servizio. È la sommatoria degli importi tabellari (differenze economiche tra i livelli delle PEO passate) parametrati per il tasso part-time applicabile ad ogni dipendente storico valorizzato. |
| **Indennità di comparto** | `u_indennitaComparto` | Art. 80, CCNL Funzioni Locali 2019-2021, c.1 | Valore aggregato **autocalcolato** dalla pagina Personale in Servizio. Si ottiene moltiplicando l'importo fisso unitario annuo per categoria (es. Operatori 272,16€, Funzionari 435,96€) per la rispettiva \`% partTime\` e sommando le quote di tutti i dipendenti associati. |
| **Incremento indennità personale educativo asili nido** | `u_incrIndennitaEducatori` | Art. 80, CCNL Funzioni Locali 2019-2021, c.1 | Input esplicito diviso fra "Stanziato", "Risparmi" e "A Bilancio". Va a coprire le indennità destinate specificatamente alla classe educatrice/scolastica. |
| **Incremento indennità personale scolastico** | `u_incrIndennitaScolastico` | Art. 80, CCNL Funzioni Locali 2019-2021, c.1 | Input esplicito strutturato (Stanziate, Risparmate, ecc.). Incremento stabile riconosciuto contrattualmente. |
| **Indennità personale ex 8^ q.f. non titolare di PO** | `u_indennitaEx8QF` | Art. 80, CCNL Funzioni Locali 2019-2021, c.1 | Stanziamento ad-hoc per figure apicali (ex 8° qualifica funzionale) a cui non è stata conferita formale Posizione Organizzativa, con tracciamento risparmi/destinazioni a bilancio. |

---

## 📈 2. Utilizzi Parte Variabile (Art. 80 c.2)
_Le risorse a valere sulle somme variabili del fondo destinate ad istituti correlati a condizioni di lavoro, indennità e performance._

| Nome Voce (UI) | Chiave Interna | Riferimento CCLL / Normativa | Logica di Calcolo / Destinazione |
|---|---|---|---|
| **Premi correlati alla performance organizzativa** | `p_performanceOrganizzativa` | Art. 80, CCNL 19-21, c.2, lett. a) | Input percentuale o valore assoluto. Viene detratta dal budget complessivo in fase di calcolo e calcolata sul "Disponibile Contrattazione" dopo eventuali maggiorazioni individuali preimpostate. |
| **Premi correlati alla performance individuale** | `p_performanceIndividuale` | Art. 80, CCNL 19-21, c.2, lett. b) | Input percentuale o valore assoluto, deve rispettare soglie di conformità legali (es. minimo non inferiore al 30% delle risorse distribuite per la produttività, monitorato attivamente nel Cruscotto Conformità). |
| **Premi per la maggiorazione della performance individuale** | `p_maggiorazionePerformanceIndividuale` | Art. 80, CCNL 19-21, c.2, lett. b) | Stanziamento extra per la differenza proporzionale a favore dei dipendenti con valutazioni significativamente elevate. |
| **Indennità condizioni di lavoro** | `p_indennitaCondizioniLavoro` | Art. 80, CCNL 19-21, c.2, lett. c) | Indennità esplicita "Stanziata", "A bilancio" o "Risparmio" derivata dalle condizioni usuranti o difficoltose concordate dall'ente locale. |
| **Indennità di turno** | `p_indennitaTurno` | Art. 80, CCNL 19-21, c.2, lett. d) | Copertura legata alla turnazione ordinaria o notturna non rientrante nello straordinario standard. |
| **Indennità di reperibilità** | `p_indennitaReperibilita` | Art. 80, CCNL 19-21, c.2, lett. d) | Rimborsi per il servizio di reperibilità del personale in reperibilità passiva (fissi stabiliti localmente o via range CCNL). |
| **Indennità per lavoro nella giornata di riposo** | `p_indennitaLavoroGiornoRiposo` | Art. 24, c.1, CCNL 14.09.2000 | Input quantistico stanziabile per i richiami in servizio del personale nel turno di riposo assegnato. |
| **Compensi per specifiche responsabilità** | `p_compensiSpecificheResponsabilita` | Art. 80, CCNL 19-21, c.2, lett. e) | Denaro indirizzato agli incentivi diretti al personale gravato di responsabilità di progetto o iter in mancanza di inquadramento EQ. |
| **Indennità di funzione** | `p_indennitaFunzione` | Art. 97, CCNL Funzioni Locali 19-21 | Corrispettivo di base per personale inquadrato come educatore/docente/profilo per specifiche funzioni primarie ex mansionario. |
| **Indennità di servizio esterno** | `p_indennitaServizioEsterno` | Art. 100, CCNL Funzioni Locali 19-21 | Classica indennità della Polizia Locale o equivalenti preposti ad attività fissa in esterna. |
| **Obiettivi di potenziamento dei servizi di Polizia Locale** | `p_obiettiviPoliziaLocale` | Art. 98, c.1, lett. c), CCNL 19-21 | Oneri ripartiti (spesso finanziati con le multe art.208 CdS) devolvibili ad incrementare la performance armata o pattugliante cittadina. |
| **Incentivi da entrate conto terzi o utenza (es. ISTAT)** | `p_incentiviContoTerzi` | Art. 80, CCNL 19-21, c.2, lett. g) | Input. Quote recuperate e stornate sui dipendenti incaricati (es. compilazione censimenti o progettazioni). |
| **Compensi avvocatura** | `p_compensiAvvocatura` | Art. 80, CCNL 19-21, c.2, lett. g) | Stanziamento a seguito di sentenze favorevoli a spese compensate/violate per il legale interno all'ente. |
| **Incentivi per funzioni tecniche (post 2018)** | `p_incentiviFunzioniTecnichePost2018` | Art. 80, CCNL 19-21, c.2, lett. g) | Spesa rivolta agli incentivi per la progettazione del personale interno su Codice Appalti recente. |
| **Incentivi per accertamenti IMU e TARI** | `p_incentiviIMUTARI` | Art. 80, CCNL 19-21, c.2, lett. g) | Compensi vincolati all'attività di recupero evasorio locale (devono coincidere in Conformità con l'esatta somma coperta a Bilancio in sede di entrata). |
| **Compensi ai messi notificatori** | `p_compensiMessiNotificatori` | Art. 80, CCNL 19-21, c.2, lett. h) | Importi specifici per rimborso notificazioni a mezzo per gli iscritti all'albo dei messi. |
| **Compensi personale case da gioco** | `p_compensiCaseGioco` / `p_compensiCaseGiocoNonCoperti` | Art. 80, CCNL 19-21, c.2, lett. i) | Input raro per casinò municipali e gestoni d'azzardo statalizzati. |
| **Differenziali stipendiali (Da attribuire e Precedenti)** | `p_diffStipendialiAnniPrec` / `p_diffStipendialiAnnoCorrente` | Art. 80, CCNL 19-21, c.2, lett. j) | Risorse stanziate a fondo perduto/variabile per far fronte alla copertura del costo dei nuovi differenziali scattati quest'anno o nel pregresso differito. |
| **Risorse per piani welfare** | `p_pianiWelfare` | Art. 80, CCNL 19-21, c.2, lett. k) | Ripartizione delle somme destinate ai voucher assistenziali o previdenza cumulativa (non decurtabili ai fini limitativi storici solitamente). |

---

## 🎖️ 3. Utilizzi Risorse Elevate Qualificazioni (EQ)
_Ripartizione finale scorporata dal fondo dipendenti (in seguito a refactoring EQ), imputata sulle disponibilità del calcolo specifico per i funzionari Elevate Qualificazioni._

| Nome Voce (UI) | Chiave Interna | Riferimento CCLL / Normativa | Logica di Calcolo / Destinazione |
|---|---|---|---|
| **Retribuzione di Posizione (Ordinaria, soggetta a limite)** | `st_art17c2_retribuzionePosizione` | CCNL 2022-2024 | Input semplice numerico. Rappresenta l'indennità fissa correlata all'incarico del funzionario, assorbita nel limite dell'anno 2016. In *Conformità* si verifica che rientri nel Range contrattuale previsto (es. non superiore a cifre massimali D7). |
| **Quota di Posizione Finanziata con l'inquadramento 0.22% MS** | `u_art17_posizioneOrdinaria_finanziata022MS` | CCNL 2022-2024 | Input semplice numerico. Componente della Posizione dedotta dal surplus dello 0.22% MS 2021 che risulta *esclusa* dal conteggio del limite imposto dall'Art.23 c.2. |
| **Incarichi Specifici** | `st_art17c3_retribuzionePosizioneArt16c4` | CCNL 2022-2024 | Risorse addizionali fornite su mandati particolari attribuiti in corso d'opera. Soggetti ai limiti di base storici. |
| **Maggiorazione Sedi Convenzionate** | `... (Variabile)` | CCNL 2022-2024 | Incrementi forzosi di posizione/risultato qualora sia attivata una convenzione di mutuo utilizzo fra distretti/comuni attigui. |
| **Interim (soggetta e non soggetta)** | `... (Variabile)` | CCNL 2022-2024 | Pagamenti attribuiti ai funzionari EQ per sostituzioni ad interim di posizioni apicali (calcolati tra il 15% e il 30% della posizione dell'area sostituita conformemente alla legge). |
| **Retribuzione di Risultato / Incremento 0.22 MS** | `... (Variabile)` | CCNL 2022-2024 | Somme destinate unicamente alla performance del titolare EQ. L'app monitora (come vincolo di *Conformità*) che al Risultato debba essere destinato in via vincolante e obbligatoria **almeno il 15%** delle risorse EQ spendibili preventivate in totale. |
