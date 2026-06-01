import { FondoAccessorioDipendenteData, NormativeData, DistribuzioneRisorseData, FondoElevateQualificazioniData } from '../domain';

export interface FieldDefinition {
  key: string;
  description: string;
  riferimento: string;
  isRelevantToArt23Limit?: boolean;
  isSubtractor?: boolean;
  section: string;
  isDisabledByCondizioniSpeciali?: boolean;
  isHidden?: boolean;
  tabella15Column?: string;
  titoloGuida?: string;
  descrizioneFunzionale?: string;
  quandoSiUsa?: string;
  fonteDato?: string;
  effettoLimiti?: string;
  erroriFrequenti?: string;
  normativeReferenceShort?: string;
  normativeReferenceFull?: string;
  helpText?: string;
  operationalWarning?: string;
  applicability?: string;
  tipoDato?: 'manuale' | 'automatico' | 'suggerito';
  livelloAttenzione?: 'info' | 'warning' | 'critical';
}

export const getFadFieldDefinitions = (norme: NormativeData): Array<FieldDefinition & { key: keyof FondoAccessorioDipendenteData; section: 'stabili' | 'vs_soggette' | 'vn_non_soggette' | 'fin_decurtazioni' | 'cl_limiti' }> => [
    // Stabili
    { 
      key: 'st_art79c1_art67c1_unicoImporto2017', 
      description: "Unico importo consolidato 2017", 
      riferimento: "Art. 79 c. 1 CCNL 16.11.2022 (ex Art. 67 c. 1 CCNL 21.05.2018)", 
      isRelevantToArt23Limit: true, 
      section: 'stabili', 
      tabella15Column: 'S600',
      titoloGuida: "Unico Importo Consolidato 2017",
      descrizioneFunzionale: "Rappresenta la base storica delle risorse stabili del fondo, consolidata al 31.12.2017, comprensiva delle risorse fisse storiche e dei differenziali stipendiali maturati.",
      quandoSiUsa: "Voce obbligatoria per tutti gli enti, costituisce lo zoccolo duro della parte stabile.",
      fonteDato: "Atto di costituzione del fondo anno 2017 certificato dall'organo di revisione.",
      effettoLimiti: "Soggetto interamente al limite dell'Art. 23, comma 2, D.Lgs. 75/2017 (Tetto 2016). Rilevante per il calcolo del Limite 48% (D.L. 25/2025).",
      erroriFrequenti: "Inserire erroneamente incrementi contrattuali successivi al 2017 o quote variabili.",
      operationalWarning: "Verificare la corrispondenza con l'ultimo Conto Annuale validato (Tabella 15, codice S600).",
      tipoDato: 'manuale'
    },
    { 
      key: 'st_art79c1_art67c1_alteProfessionalitaNonUtil', 
      description: "Alte professionalità non utilizzate (se non in unico importo)", 
      riferimento: `Art. 79 c.1 (rif. ${norme.riferimenti_normativi.art67_ccnl2018})`, 
      isRelevantToArt23Limit: true, 
      section: 'stabili',
      titoloGuida: "Alte Professionalità Non Utilizzate",
      descrizioneFunzionale: "Risorse stabili destinate alle Alte Professionalità (ora EQ) e non utilizzate al 31.12.2017.",
      quandoSiUsa: "Qualora tali risorse non siano state già conglobate nell'unico importo consolidato.",
      fonteDato: "Atti di costituzione del fondo storici.",
      effettoLimiti: "Soggetto al limite dell'Art. 23 c. 2.",
      erroriFrequenti: "Duplicazione della voce se già presente nell'unico importo consolidato.",
      tipoDato: 'manuale'
    },
    { 
      key: 'st_art79c1_art67c2a_incr8320', 
      description: "Incremento €83,20/unità (personale 31.12.2015)", 
      riferimento: "Art. 79 c. 1 CCNL 16.11.2022 (ex Art. 67 c. 2 lett. a CCNL 21.05.2018)", 
      isRelevantToArt23Limit: false, 
      section: 'stabili', 
      tabella15Column: 'S612',
      titoloGuida: "Incremento €83,20 pro-capite",
      descrizioneFunzionale: "Risorsa stabile aggiuntiva calcolata convenzionalmente per compensare gli oneri contrattuali del triennio 2016-2018.",
      quandoSiUsa: "Sempre, calcolando €83,20 per il personale in servizio al 31.12.2015.",
      fonteDato: "Conto Annuale 2015 (Tabella 1) - Personale presente al 31.12.",
      effettoLimiti: "Escluso dal limite dell'Art. 23, comma 2, D.Lgs. 75/2017. Rilevante per il calcolo del Limite 48% (D.L. 25/2025).",
      erroriFrequenti: "Utilizzare il personale medio dell'anno o il personale in servizio in date diverse dal 31.12.2015.",
      operationalWarning: "Il dato è fisso e non deve variare negli anni successivi.",
      tipoDato: 'manuale'
    },
    { 
      key: 'st_art79c1_art67c2b_incrStipendialiDiff', 
      description: "Incrementi stipendiali differenziali (Art. 64 CCNL 2018)", 
      riferimento: `Art. 79 c.1 (rif. Art. 67 c.2b CCNL 2018)`, 
      isRelevantToArt23Limit: false, 
      section: 'stabili',
      titoloGuida: "Incrementi Stipendiali Differenziali",
      descrizioneFunzionale: "Risorse stabili per il finanziamento dei differenziali stipendiali previsti dal CCNL 2018.",
      quandoSiUsa: "Voce strutturale consolidata.",
      fonteDato: "Tabella 15 Conto Annuale / Atti di costituzione fondo.",
      effettoLimiti: "Escluso dal limite dell'Art. 23 c. 2 (risorse contrattuali).",
      erroriFrequenti: "Inserire valori non coerenti con le tabelle storiche del Conto Annuale.",
      tipoDato: 'manuale'
    },
    { 
      key: 'st_art79c1_art4c2_art67c2c_integrazioneRIA', 
      description: "Integrazione RIA personale cessato anno precedente", 
      riferimento: `Art. 79 c.1 (rif. Art. 67 c.2c CCNL 2018)`, 
      isRelevantToArt23Limit: true, 
      section: 'stabili', 
      tabella15Column: 'S613',
      titoloGuida: "Integrazione RIA Cessati",
      descrizioneFunzionale: "Risorse stabili corrispondenti alla RIA del personale cessato nell'anno precedente.",
      quandoSiUsa: "Annualmente, se ci sono state cessazioni di personale con RIA.",
      fonteDato: "Dati stipendiali del personale cessato (Retribuzione Individuale di Anzianità).",
      effettoLimiti: "Soggetto al limite dell'Art. 23 c. 2.",
      erroriFrequenti: "Includere la RIA di personale cessato nell'anno corrente (che va in parte variabile).",
      tipoDato: 'manuale'
    },
    { 
      key: 'st_art79c1_art67c2d_risorseRiassorbite165', 
      description: "Risorse riassorbite (Art. 2 c.3 D.Lgs 165/01)", 
      riferimento: `Art. 79 c.1 (rif. Art. 67 c.2d CCNL 2018)`, 
      isRelevantToArt23Limit: true, 
      section: 'stabili',
      titoloGuida: "Risorse Riassorbite ex 165",
      descrizioneFunzionale: "Somme riassorbite a seguito di passaggi di personale o modifiche ordinamentali ex D.Lgs. 165/2001.",
      quandoSiUsa: "In presenza di risorse storiche certificate come riassorbite nel fondo.",
      fonteDato: "Certificazioni storiche del servizio finanziario.",
      effettoLimiti: "Soggetto al limite dell'Art. 23 c. 2.",
      erroriFrequenti: "Considerare queste somme come escluse dal tetto 2016.",
      tipoDato: 'manuale'
    },
    { 
      key: 'st_art79c1_art15c1l_art67c2e_personaleTrasferito', 
      description: "Risorse personale trasferito (decentramento)", 
      riferimento: `Art. 79 c.1 (rif. Art. 67 c.2e CCNL 2018)`, 
      isRelevantToArt23Limit: true, 
      section: 'stabili',
      titoloGuida: "Risorse Personale Trasferito",
      descrizioneFunzionale: "Risorse fisse trasferite da altri enti a seguito di processi di decentramento o mobilità.",
      quandoSiUsa: "In caso di trasferimento stabile di personale con relativa quota di fondo accessorio.",
      fonteDato: "Protocolli di intesa tra enti o atti di trasferimento funzioni.",
      effettoLimiti: "Soggetto al limite dell'Art. 23 c. 2 (trasferimento di tetto).",
      erroriFrequenti: "Mancato allineamento del limite 2016 tra ente cedente ed ente ricevente.",
      tipoDato: 'manuale'
    },
    { key: 'st_art79c1_art15c1i_art67c2f_regioniRiduzioneDirig', description: "Regioni: riduzione stabile posti dirig. (fino a 0,2% MS Dir.)", riferimento: `Art. 79 c.1 (rif. Art. 67 c.2f CCNL 2018)`, isRelevantToArt23Limit: true, section: 'stabili' },
    { 
      key: 'st_art79c1_art14c3_art67c2g_riduzioneStraordinario', 
      description: "Riduzione stabile straordinario", 
      riferimento: `Art. 79 c.1 (rif. Art. 67 c.2g CCNL 2018)`, 
      isRelevantToArt23Limit: true, 
      section: 'stabili',
      titoloGuida: "Riduzione Stabile Straordinario",
      descrizioneFunzionale: "Economie strutturali derivanti dalla riduzione del fondo per il lavoro straordinario.",
      quandoSiUsa: "In caso di consolidamento di risparmi dello straordinario in parte stabile del fondo.",
      fonteDato: "Delibere di ripartizione risorse tra fondi.",
      effettoLimiti: "Soggetto al limite dell'Art. 23 c. 2.",
      erroriFrequenti: "Incrementare il fondo senza la necessaria riduzione corrispondente del fondo straordinario.",
      tipoDato: 'manuale'
    },
    { 
      key: 'st_art79c1b_euro8450', 
      description: "Incremento €84,50/unità (pers. 31.12.18, dal 2021)", 
      riferimento: "Art. 79 c. 1 lett. b) CCNL 16.11.2022", 
      isRelevantToArt23Limit: false, 
      section: 'stabili',
      tabella15Column: 'S615',
      titoloGuida: "Incremento €84,50 dal 2021",
      descrizioneFunzionale: "Incremento stabile calcolato sul personale in servizio al 31.12.2018, applicabile dal 2021.",
      quandoSiUsa: "Voce consolidata dal CCNL 2019-2021.",
      fonteDato: "Conto Annuale 2018 (Tabella 1).",
      effettoLimiti: "Escluso dal limite Art. 23 c. 2.",
      tipoDato: 'manuale'
    },
    { 
      key: 'st_art79c1c_incrementoStabileConsistenzaPers', 
      description: "Incremento stabile (aumento per incremento del personale)", 
      riferimento: "Art. 79 c. 1 lett. c) CCNL 16.11.2022", 
      isRelevantToArt23Limit: true, 
      section: 'stabili',
      titoloGuida: "Incremento Differenziale Consistenza Personale",
      descrizioneFunzionale: "Incremento stabile legato alla variazione della consistenza del personale.",
      quandoSiUsa: "Nel caso di incremento del personale.",
      fonteDato: "Da wizard. Fondo di parte stabile e consistenza personale.",
      effettoLimiti: "Inserito nel limite Art. 23 c. 2.",
      tipoDato: 'automatico'
    },
    { 
      key: 'st_art79c1d_differenzialiStipendiali2022', 
      description: "Differenziali stipendiali (Art. 78 CCNL 2022)", 
      riferimento: "Art. 79 c. 1 lett. d) CCNL 16.11.2022", 
      isRelevantToArt23Limit: false, 
      section: 'stabili',
      titoloGuida: "Differenziali Stipendiali 2022",
      descrizioneFunzionale: "Risorse per il finanziamento del nuovo sistema dei differenziali stipendiali introdotto nel 2022.",
      quandoSiUsa: "Voce strutturale dal 2022.",
      fonteDato: "Atto di costituzione del fondo.",
      effettoLimiti: "Escluso dal limite Art. 23 c. 2.",
      tipoDato: 'manuale'
    },
    { 
      key: 'st_art79c1bis_diffStipendialiB3D3', 
      description: "Differenziali stipendiali posizioni B3 e D3", 
      riferimento: "Art. 79 c. 1-bis CCNL 16.11.2022", 
      isRelevantToArt23Limit: false, 
      section: 'stabili',
      titoloGuida: "Differenziali B3 e D3",
      descrizioneFunzionale: "Quote stabili per differenziali stipendiali delle vecchie categorie B3 e D3.",
      quandoSiUsa: "Per il personale che mantiene tali differenziali.",
      fonteDato: "Storico posizioni economiche.",
      effettoLimiti: "Escluso dal limite Art. 23 c. 2.",
      tipoDato: 'manuale'
    },
    { 
      key: 'st_incrementoDecretoPA', 
      description: "Incremento D.L. 75/2023 (Decreto PA bis)", 
      riferimento: "Art. 58 c. 3 CCNL 23.02.2026 / DL 75/2023", 
      isRelevantToArt23Limit: false, 
      section: 'stabili',
      titoloGuida: "Incremento Decreto PA bis",
      descrizioneFunzionale: "Incremento stabile del fondo previsto dal D.L. 75/2023 per l'armonizzazione dei trattamenti accessori.",
      quandoSiUsa: "Per gli enti che hanno attivato tale incremento.",
      fonteDato: "Delibere di giunta/consiglio recepimento DL 75/2023.",
      effettoLimiti: "Escluso dal limite Art. 23 c. 2 (norma speciale).",
      tipoDato: 'manuale',
      isHidden: true
    },
    { 
      key: 'st_taglioFondoDL78_2010', 
      description: "Taglio fondo DL 78/2010 (se non già in unico importo)", 
      riferimento: "Art. 9 c. 2-bis D.L. 78/2010; Art. 1 c. 456 L. 147/2013", 
      isRelevantToArt23Limit: true, 
      isSubtractor: true, 
      section: 'stabili',
      titoloGuida: "Taglio Storico (D.L. 78/2010)",
      descrizioneFunzionale: "Riduzione permanente della parte stabile del fondo legata ai vincoli di contenimento della spesa pubblica e alle cessazioni storiche. [Nota di trasparenza]: Nel modello attuale il richiamo è agganciato alla voce di riduzione stabile più vicina disponibile per presidiare le decurtazioni permanenti storiche (L. 147/2013), ma non sostituisce la ricostruzione analitica analitica dell'ente.",
      quandoSiUsa: "Per applicare decurtazioni storiche non ancora incorporate nell'unico importo consolidato.",
      fonteDato: "Atti di costituzione del fondo storici e certificazioni del servizio finanziario.",
      effettoLimiti: "Riduce la base rilevante ai fini dell'Art. 23, comma 2.",
      erroriFrequenti: "Omettere il taglio se le cessazioni che l'hanno generato sono avvenute in anni molto remoti.",
      operationalWarning: "Verificare che la riduzione sia stata correttamente trascinata nell'ultimo esercizio chiuso.",
      tipoDato: 'manuale'
    },
    { 
      key: 'st_riduzioniPersonaleATA_PO_Esternalizzazioni', 
      description: "Riduzioni per pers. ATA, PO, esternalizzazioni, trasferimenti", 
      riferimento: "Disposizioni specifiche", 
      isRelevantToArt23Limit: true, 
      isSubtractor: true, 
      section: 'stabili',
      titoloGuida: "Riduzioni Varie Stabili",
      descrizioneFunzionale: "Riduzioni obbligatorie del fondo legate a processi di esternalizzazione o passaggi di personale.",
      quandoSiUsa: "In presenza di atti che dispongono la riduzione del fondo per cessazione di attività o funzioni.",
      fonteDato: "Atto amministrativo di riduzione del fondo.",
      effettoLimiti: "Riduce l'ammontare rilevante per il limite Art. 23 c. 2.",
      erroriFrequenti: "Mancata applicazione della decurtazione proporzionale al personale trasferito o esternalizzato.",
      tipoDato: 'manuale'
    },
    { 
      key: 'st_art67c1_decurtazionePO_AP_EntiDirigenza', 
      description: `Decurtazione PO/AP enti con dirigenza`, 
      riferimento: `Art. 67 c.1 CCNL 2018`, 
      isRelevantToArt23Limit: true, 
      isSubtractor: true, 
      section: 'stabili',
      titoloGuida: "Decurtazione PO/AP",
      descrizioneFunzionale: "Riduzione del fondo per il finanziamento delle posizioni organizzative (ora EQ) negli enti con dirigenza.",
      quandoSiUsa: "Negli enti dotati di personale dirigente per separare le risorse EQ.",
      fonteDato: "Normativa contrattuale e atti di costituzione fondo.",
      effettoLimiti: "Riduce la parte stabile del fondo non dirigente.",
      erroriFrequenti: "Calcolo errato della quota di decurtazione spettante.",
      tipoDato: 'manuale'
    },
    { 
      key: 'st_art58c1_CCNL2026_incremento014_MS2021', 
      description: "Incremento stabile 0,14% Monte Salari 2021", 
      riferimento: "Art. 58 c. 1 CCNL 23.02.2026", 
      isRelevantToArt23Limit: false, 
      section: 'stabili',
      tabella15Column: 'S614',
      titoloGuida: "Incremento Stabile 0,14% (CCNL 2026)",
      descrizioneFunzionale: "Incremento strutturale e permanente delle risorse stabili del fondo previsto dal nuovo CCNL 2026, calcolato sulla base del monte salari 2021.",
      quandoSiUsa: "A partire dalla costituzione del fondo anno 2026.",
      fonteDato: "Monte Salari anno 2021 al netto dell'IRAP (dato da Conto Annuale, Tabella 12).",
      effettoLimiti: "Escluso dal limite dell'Art. 23, comma 2, D.Lgs. 75/2017 (Tetto 2016) ai sensi dell'Art. 58 c. 4. Rilevante per il calcolo del Limite 48% (D.L. 25/2025).",
      erroriFrequenti: "Calcolare la percentuale su un monte salari diverso dal 2021 o includere oneri riflessi a carico ente.",
      operationalWarning: "Verificare che la voce sia stata preventivamente autorizzata nel bilancio di previsione.",
      tipoDato: 'automatico'
    },
    { 
      key: 'st_incrementoDL25_2025', 
      description: "Incremento D.L. 25/2025 (Limite 48%)", 
      riferimento: "Art. 14 c. 1-bis D.L. 25/2025", 
      isRelevantToArt23Limit: true, 
      section: 'stabili',
      tabella15Column: 'S615',
      titoloGuida: "Incremento Armonizzazione (Limite 48%)",
      descrizioneFunzionale: "Risorse aggiuntive stabili finalizzate all'armonizzazione dei trattamenti accessori per gli enti che presentano un basso valore pro-capite del fondo.",
      quandoSiUsa: "Solo se il rapporto tra le risorse stabili (Fondo + EQ) e la spesa per stipendi tabellari dell'anno 2023 è inferiore al 48%.",
      fonteDato: "Simulatore di calcolo integrato basato sui dati 2023 certificati.",
      effettoLimiti: "Soggetto al limite dell'Art. 23, comma 2, D.Lgs. 75/2017 (Tetto 2016), ma utilizzabile per incrementare il fondo fino alla soglia del 48%.",
      erroriFrequenti: "Attivare la voce senza aver verificato il limite del 48% o utilizzare una base di calcolo diversa dal tabellare 2023.",
      operationalWarning: "L'incremento deve essere compatibile con i vincoli di bilancio e la sostenibilità finanziaria dell'ente.",
      tipoDato: 'suggerito'
    },
    { 
      key: 'st_riduzionePerIncrementoEQ', 
      description: "Riduzione per incremento risorse EQ", 
      riferimento: "Art. 7 c. 4 lett. u) CCNL 16.11.2022", 
      isRelevantToArt23Limit: true, 
      isSubtractor: true, 
      section: 'stabili',
      titoloGuida: "Trasferimento Risorse EQ",
      descrizioneFunzionale: "Riduzione strutturale del fondo del personale del comparto a favore del finanziamento degli incarichi di Elevata Qualificazione. [Nota di trasparenza]: Il campo non rappresenta necessariamente l’intero sistema delle risorse destinate agli incarichi EQ, ma il principale punto di presidio disponibile nella costituzione del fondo per monitorare lo spostamento di risorse tra i tetti.",
      quandoSiUsa: "In caso di incremento delle risorse EQ tramite prelievo dalla parte stabile del fondo non dirigente.",
      fonteDato: "Atto di indirizzo della Giunta o delibera di ripartizione risorse tra aree.",
      effettoLimiti: "Riduce il Tetto 2016 del personale non dirigente e incrementa quello dell'area EQ (invarianza complessiva ex Art. 23 c. 2).",
      erroriFrequenti: "Considerare lo spostamento come un incremento netto della spesa totale del personale.",
      operationalWarning: "L'operazione deve essere certificata dall'organo di revisione per garantire il rispetto dei tetti di spesa.",
      tipoDato: 'automatico'
    },
    { 
      key: 'st_art60c2_CCNL2026_decurtazioneIndennitaComparto', 
      description: "Decurtazione stabile per conglobamento indennità comparto", 
      riferimento: "Art. 60 c. 2 CCNL 23.02.2026", 
      isRelevantToArt23Limit: true, 
      isSubtractor: true, 
      section: 'stabili',
      tabella15Column: 'S616',
      titoloGuida: "Conglobamento Indennità Comparto",
      descrizioneFunzionale: "Dal 1° gennaio 2026 una quota dell’indennità di comparto è conglobata nello stipendio tabellare. La parte stabile del Fondo risorse decentrate deve essere ridotta in misura corrispondente alla quota precedentemente posta a carico del Fondo. La riduzione si calcola applicando i valori della Tabella C del CCNL Funzioni Locali 23.02.2026 su 12 mensilità e riproporzionando il personale part-time. Questa voce è distinta dall’indennità di comparto calcolata nella distribuzione delle risorse.",
      quandoSiUsa: "Obbligatoriamente nella costituzione del fondo 2026 e anni successivi.",
      fonteDato: "Tabella C allegata al CCNL 23.02.2026, calcolata sul personale in servizio al 01.01.2026 su base 12 mensilità.",
      effettoLimiti: "Riduce l'ammontare delle risorse stabili soggette al limite Art. 23, comma 2, garantendo la neutralità finanziaria rispetto al tetto del salario accessorio.",
      erroriFrequenti: "Calcolo su 13 mensilità o mancato riproporzionamento dei rapporti part-time.",
      operationalWarning: "Verificare che la riduzione sia esattamente corrispondente ai valori annui (Quota Mensile * 12).",
      tipoDato: 'automatico'
    },
    { 
      key: 'st_riduzioneFondoStraordinario', 
      description: "Riduzione per incremento fondo del Lavoro Straordinario (da sottrarre)", 
      riferimento: "Art. 20 c. 1 lett. a) CCNL Funzioni Locali 23.02.2026", 
      isRelevantToArt23Limit: true, 
      isSubtractor: true, 
      section: 'stabili',
      titoloGuida: "Riduzione Fondo Straordinario",
      descrizioneFunzionale: "Decremento delle risorse stabili del fondo per finanziare l'incremento del fondo del lavoro straordinario.",
      quandoSiUsa: "Se l'ente decide di potenziare il fondo straordinario spostando risorse dalla parte stabile del fondo accessorio.",
      fonteDato: "Decisione dell'ente (delibera o atto di indirizzo).",
      effettoLimiti: "Riduce l'ammontare rilevante per il limite Art. 23 c. 2.",
      erroriFrequenti: "Sottrarre la cifra senza aver preventivamente incrementato il fondo straordinario.",
      tipoDato: 'automatico'
    },
    // Variabili Soggette
    { 
      key: 'vs_art4c3_art15c1k_art67c3c_recuperoEvasione', 
      description: "Recupero evasione ICI, ecc.", 
      riferimento: `Art. 67 c.3c`, 
      isRelevantToArt23Limit: true, 
      section: 'vs_soggette', 
      tabella15Column: 'V621',
      titoloGuida: "Recupero Evasione Tributaria",
      descrizioneFunzionale: "Risorse variabili alimentate dal recupero dell'evasione ICI/IMU, destinate a potenziare i servizi tributari.",
      quandoSiUsa: "In presenza di entrate accertate e riscosse derivanti da attività di recupero evasione.",
      fonteDato: "Accertamenti di bilancio settore tributi.",
      effettoLimiti: "Soggetto al limite dell'Art. 23 c. 2.",
      erroriFrequenti: "Considerare queste somme come escluse dal limite del tetto 2016.",
      tipoDato: 'manuale'
    },
    { 
      key: 'vs_art4c2_art67c3d_integrazioneRIAMensile', 
      description: "Integrazione RIA mensile personale cessato in anno", 
      riferimento: `Art. 67 c.3d`, 
      isRelevantToArt23Limit: true, 
      section: 'vs_soggette',
      titoloGuida: "Integrazione RIA Cessati in Anno",
      descrizioneFunzionale: "Risorse variabili corrispondenti alla RIA del personale cessato nel corso dell'anno di riferimento.",
      quandoSiUsa: "Per l'importo della RIA pro-rata mensile dalla data di cessazione al 31/12.",
      fonteDato: "Dati stipendiali personale cessato nell'anno.",
      effettoLimiti: "Soggetto al limite dell'Art. 23 c. 2.",
      erroriFrequenti: "Inserire l'importo annuale intero invece del pro-rata mensile.",
      tipoDato: 'manuale'
    },
    { 
      key: 'vs_art67c3g_personaleCaseGioco', 
      description: "Risorse personale case da gioco", 
      riferimento: `Art. 67 c.3g`, 
      isRelevantToArt23Limit: true, 
      section: 'vs_soggette', 
      isDisabledByCondizioniSpeciali: true,
      titoloGuida: "Personale Case da Gioco",
      descrizioneFunzionale: "Risorse destinate al personale impiegato presso le case da gioco.",
      quandoSiUsa: "Solo per gli enti che gestiscono case da gioco.",
      fonteDato: "Bilancio dell'ente / Atti gestionali casa da gioco.",
      effettoLimiti: "Soggetto al limite dell'Art. 23 c. 2.",
      erroriFrequenti: "Considerare tali risorse come escluse dal tetto 2016.",
      tipoDato: 'manuale'
    },
    { 
      key: 'vs_art79c2b_max1_2MonteSalari1997', 
      description: "Max 1,2% monte salari 1997", 
      riferimento: `Art. 79 c.2b`, 
      isRelevantToArt23Limit: true, 
      section: 'vs_soggette', 
      isDisabledByCondizioniSpeciali: true,
      titoloGuida: "Max 1,2% MS 1997",
      descrizioneFunzionale: "Risorsa variabile storica calcolata sul monte salari del 1997.",
      quandoSiUsa: "In presenza di certificazione storica del valore massimo attivabile.",
      fonteDato: "Monte Salari 1997.",
      effettoLimiti: "Soggetto al limite dell'Art. 23 c. 2.",
      erroriFrequenti: "Calcolare la percentuale su un monte salari diverso dal 1997.",
      tipoDato: 'manuale'
    },
    { 
      key: 'vs_art67c3k_integrazioneArt62c2e_personaleTrasferito', 
      description: "Integrazione per personale trasferito (variabile)", 
      riferimento: `Art. 67 c.3k`, 
      isRelevantToArt23Limit: true, 
      section: 'vs_soggette', 
      isDisabledByCondizioniSpeciali: true,
      titoloGuida: "Pers. Trasferito (Variabile)",
      descrizioneFunzionale: "Quota variabile del fondo trasferita a seguito di mobilità o decentramento di personale.",
      quandoSiUsa: "In caso di trasferimento di personale con relativa quota variabile di fondo.",
      fonteDato: "Atti di trasferimento funzioni/personale.",
      effettoLimiti: "Soggetto al limite dell'Art. 23 c. 2.",
      erroriFrequenti: "Mancato coordinamento con l'ente cedente sulla quota variabile.",
      tipoDato: 'manuale'
    },
    { 
      key: 'vs_art79c2c_risorseScelteOrganizzative', 
      description: "Risorse per scelte organizzative (anche TD)", 
      riferimento: `Art. 79 c.2c`, 
      isRelevantToArt23Limit: true, 
      section: 'vs_soggette', 
      isDisabledByCondizioniSpeciali: true,
      titoloGuida: "Scelte Organizzative",
      descrizioneFunzionale: "Risorse variabili stanziate dall'ente per finalità organizzative specifiche o per personale a tempo determinato.",
      quandoSiUsa: "In base a decisioni autonome dell'ente supportate da bilancio.",
      fonteDato: "Delibere di stanziamento risorse variabili.",
      effettoLimiti: "Soggetto al limite dell'Art. 23 c. 2.",
      erroriFrequenti: "Superare il tetto complessivo delle risorse variabili soggette a limite.",
      tipoDato: 'manuale'
    },
    // Variabili Non Soggette
    { key: 'vn_art15c1d_art67c3a_sponsorConvenzioni', description: "Sponsorizzazioni, convenzioni, servizi non essenziali", riferimento: `Art. 67 c.3a`, isRelevantToArt23Limit: false, section: 'vn_non_soggette', isDisabledByCondizioniSpeciali: true },
    { 
      key: 'vn_art54_art67c3f_rimborsoSpeseNotifica', 
      description: "Quota rimborso spese notifica (messi)", 
      riferimento: `Art. 67 c.3f`, 
      isRelevantToArt23Limit: false, 
      section: 'vn_non_soggette', 
      isDisabledByCondizioniSpeciali: true,
      titoloGuida: "Rimborso Spese Notifica",
      descrizioneFunzionale: "Compensi spettanti ai messi notificatori derivanti dal rimborso delle spese di notifica.",
      quandoSiUsa: "Per la remunerazione della specifica attività di notifica atti.",
      fonteDato: "Rendiconto delle notifiche effettuate.",
      effettoLimiti: "Escluso dal limite dell'Art. 23 c. 2 (risorsa esterna).",
      erroriFrequenti: "Includere la quota spettante all'ente anziché solo quella destinata ai messi.",
      tipoDato: 'manuale'
    },
    { key: 'vn_art15c1k_art16_dl98_art67c3b_pianiRazionalizzazione', description: "Piani di razionalizzazione (Art. 16 DL 98/11)", riferimento: `Art. 67 c.3b`, isRelevantToArt23Limit: false, section: 'vn_non_soggette', isDisabledByCondizioniSpeciali: true },
    { 
      key: 'vn_art15c1k_art67c3c_incentiviTecniciCondoni', 
      description: "Incentivi funzioni tecniche, condoni, ecc.", 
      riferimento: "Art. 45 D.Lgs. 36/2023; Art. 113 D.Lgs. 50/2016", 
      isRelevantToArt23Limit: false, 
      section: 'vn_non_soggette', 
      tabella15Column: 'V622',
      titoloGuida: "Incentivi Funzioni Tecniche",
      descrizioneFunzionale: "Risorse variabili destinate a remunerare le attività tecniche svolte dal personale interno (progettazione, RUP, direzione lavori) su appalti di lavori, servizi e forniture.",
      quandoSiUsa: "In presenza di accantonamenti certificati nei quadri economici delle singole commesse.",
      fonteDato: "Prospetti di riparto incentivi tecnici approvati dal dirigente del settore tecnico.",
      effettoLimiti: "Escluso dal limite dell'Art. 23, comma 2, D.Lgs. 75/2017 ai sensi della normativa speciale di settore.",
      erroriFrequenti: "Inserire importi lordo dipendente senza considerare gli oneri riflessi o superare i tetti annui pro-capite.",
      operationalWarning: "Verificare che il regolamento interno per la ripartizione degli incentivi sia aggiornato al D.Lgs. 36/2023.",
      tipoDato: 'manuale'
    },
    { 
      key: 'vn_art18h_art67c3c_incentiviSpeseGiudizioCensimenti', 
      description: "Incentivi spese giudizio, compensi censimento/ISTAT", 
      riferimento: "Art. 67 c. 3 lett. c) CCNL 21.05.2018 (rif. Art. 79 c. 2 CCNL 2022)", 
      isRelevantToArt23Limit: false, 
      section: 'vn_non_soggette',
      titoloGuida: "Incentivi Giudizio e ISTAT",
      descrizioneFunzionale: "Compensi spettanti al personale per il recupero delle spese di giudizio (Avvocatura) o per le attività legate ai censimenti permanenti. [Nota di trasparenza]: Il modello dati può trattare alcune voci in forma aggregata; il controllo applicativo deve essere letto come presidio di coerenza complessiva, non come verifica atomica perfetta della singola sottovoce.",
      quandoSiUsa: "In occasione di censimenti certificati o a seguito di riscossione di spese legali da sentenze favorevoli.",
      fonteDato: "Rimborsi ISTAT / Reversali di incasso per spese di lite.",
      effettoLimiti: "Escluso dal limite dell'Art. 23, comma 2, D.Lgs. 75/2017.",
      erroriFrequenti: "Inserire compensi spettanti per l'anno corrente non ancora riscossi o rimborsati.",
      operationalWarning: "Assicurarsi che la ripartizione avvenga secondo i criteri stabiliti nel CCDI.",
      tipoDato: 'manuale'
    },
    { 
      key: 'vn_art15c1m_art67c3e_risparmiStraordinario', 
      description: "Risparmi da disciplina straordinario (Art. 14 CCNL)", 
      riferimento: "Art. 67 c. 3 lett. e) CCNL 21.05.2018", 
      isRelevantToArt23Limit: false, 
      section: 'vn_non_soggette',
      titoloGuida: "Risparmi Straordinario",
      descrizioneFunzionale: "Somme non utilizzate del fondo per il lavoro straordinario dell'anno precedente che incrementano le risorse variabili dell'anno corrente.",
      quandoSiUsa: "A seguito della certificazione delle economie sul fondo straordinario dell'esercizio precedente.",
      fonteDato: "Conto Annuale (Tabella 14) / Certificazione del servizio finanziario.",
      effettoLimiti: "Escluso dal limite dell'Art. 23, comma 2, D.Lgs. 75/2017 in quanto spostamento tra fondi già soggetti a limite.",
      erroriFrequenti: "Trascinare risparmi non ancora accertati o già utilizzati per altre finalità.",
      operationalWarning: "La quota di risparmio deve essere al netto degli oneri riflessi se non diversamente specificato.",
      tipoDato: 'manuale'
    },
    { 
      key: 'vn_art67c3j_regioniCittaMetro_art23c4_incrPercentuale', 
      description: `Regioni/Città Metro: Incremento %`, 
      riferimento: `Art. 67 c.3j`, 
      isRelevantToArt23Limit: false, 
      section: 'vn_non_soggette', 
      isDisabledByCondizioniSpeciali: true,
      titoloGuida: "Incr. % Regioni/CM",
      descrizioneFunzionale: "Incremento percentuale delle risorse variabili previsto per Regioni e Città Metropolitane.",
      quandoSiUsa: "Solo per gli enti di livello regionale o città metropolitane.",
      fonteDato: "Normativa specifica di settore.",
      effettoLimiti: "Escluso dal limite dell'Art. 23 c. 2 ex comma 4.",
      erroriFrequenti: "Applicazione della voce ad enti locali diversi da Regioni e CM.",
      tipoDato: 'manuale'
    },
    { 
      key: 'vn_art80c1_sommeNonUtilizzateStabiliPrec', 
      description: "Somme non utilizzate esercizi precedenti (stabili)", 
      riferimento: "Art. 80 c. 1 CCNL 16.11.2022 (ex Art. 68 c. 1 CCNL 2018)", 
      isRelevantToArt23Limit: false, 
      section: 'vn_non_soggette', 
      tabella15Column: 'V620',
      titoloGuida: "Avanzi Stabili (Trascinamento)",
      descrizioneFunzionale: "Risorse stabili non spese negli anni precedenti che vengono reintrodotte nel fondo dell'anno corrente come quota variabile una tantum.",
      quandoSiUsa: "Per riutilizzare economie certificate di parte stabile non distribuite.",
      fonteDato: "Avanzo vincolato per il trattamento accessorio (Risultato di amministrazione).",
      effettoLimiti: "Escluso dal limite dell'Art. 23, comma 2, D.Lgs. 75/2017 in quanto risorse già transitate per fondi soggetti a limite.",
      erroriFrequenti: "Utilizzare economie di parte variabile invece di parte stabile in questo campo.",
      operationalWarning: "Verificare la capienza dell'avanzo di amministrazione vincolato.",
      tipoDato: 'manuale'
    },
    { 
      key: 'vn_l145_art1c1091_incentiviRiscossioneIMUTARI', 
      description: "Incentivi riscossione IMU/TARI (L. 145/18)", 
      riferimento: "Art. 1, comma 1091, L. 145/2018", 
      isRelevantToArt23Limit: false, 
      section: 'vn_non_soggette',
      titoloGuida: "Incentivi Tributi (Evasione)",
      descrizioneFunzionale: "Quota di incentivi per il personale addetto alla riscossione, alimentata dal recupero dell'evasione dei tributi locali.",
      quandoSiUsa: "In presenza di incassi da recupero evasione ICI/IMU/TARI accertati e riscossi.",
      fonteDato: "Delibera della Giunta comunale che autorizza l'incentivazione basata sui risultati raggiunti.",
      effettoLimiti: "Escluso dal limite dell'Art. 23, comma 2, D.Lgs. 75/2017 ai sensi della specifica deroga legislativa.",
      erroriFrequenti: "Superare il tetto del 5% della spesa di personale del settore tributi o il limite individuale.",
      operationalWarning: "Verificare che l'ente non sia in condizioni di deficitarietà strutturale.",
      tipoDato: 'manuale'
    },
    { key: 'vn_l178_art1c870_risparmiBuoniPasto2020', description: "Risparmi buoni pasto 2020 (L. 178/20)", riferimento: "L. 178/2020 Art.1 c.870", isRelevantToArt23Limit: false, section: 'vn_non_soggette', isDisabledByCondizioniSpeciali: true },
    { key: 'vn_dl135_art11c1b_risorseAccessorieAssunzioniDeroga', description: "Risorse accessorie per assunzioni in deroga", riferimento: "DL 135/2018 Art.11 c.1b", isRelevantToArt23Limit: false, section: 'vn_non_soggette', isDisabledByCondizioniSpeciali: true },
    { key: 'vn_art79c3_022MonteSalari2018_da2022Proporzionale', description: "0,22% MS 2018 (da 01.01.2022, quota proporzionale)", riferimento: `Art. 79 c.3`, isRelevantToArt23Limit: false, section: 'vn_non_soggette', isDisabledByCondizioniSpeciali: true },
    { key: 'vn_art79c1b_euro8450_unaTantum2021_2022', description: "€84,50/unità (pers. 31.12.18, una tantum 2021-22)", riferimento: `Art. 79 c.1b`, isRelevantToArt23Limit: false, section: 'vn_non_soggette', isDisabledByCondizioniSpeciali: true },
    { key: 'vn_art79c3_022MonteSalari2018_da2022UnaTantum2022', description: "0,22% MS 2018 (da 01.01.2022, una tantum 2022)", riferimento: `Art. 79 c.3`, isRelevantToArt23Limit: false, section: 'vn_non_soggette', isDisabledByCondizioniSpeciali: true },
    { 
      key: 'vn_dl13_art8c3_incrementoPNRR_max5stabile2016', 
      description: "Incremento PNRR (max 5% fondo stabile 2016)", 
      riferimento: norme.riferimenti_normativi.art8_dl13_2023 as string, 
      isRelevantToArt23Limit: false, 
      section: 'vn_non_soggette', 
      isDisabledByCondizioniSpeciali: true,
      titoloGuida: "Incremento PNRR",
      descrizioneFunzionale: "Incremento eccezionale delle risorse variabili per attività legate ai progetti PNRR.",
      quandoSiUsa: "Per il personale direttamente coinvolto nella gestione dei progetti PNRR.",
      fonteDato: "Piani assunzionali e progetti PNRR approvati.",
      effettoLimiti: "Escluso dal limite dell'Art. 23 c. 2 (norma speciale).",
      erroriFrequenti: "Superare il tetto del 5% della parte stabile del fondo 2016.",
      tipoDato: 'manuale'
    },
    { 
      key: 'vn_art58c2_incremento_max022_ms2021', 
      description: "Incremento max 0,22% MS 2021", 
      riferimento: "Art. 58 c. 2 CCNL 23.02.2026", 
      isRelevantToArt23Limit: false, 
      section: 'vn_non_soggette',
      tabella15Column: 'V623',
      titoloGuida: "Incremento Variabile 0,22% (CCNL 2026)",
      descrizioneFunzionale: "Incremento opzionale e variabile delle risorse del fondo pari a un massimo dello 0,22% del Monte Salari 2021.",
      quandoSiUsa: "In sede di contrattazione decentrata per potenziare la parte variabile del fondo.",
      fonteDato: "Monte Salari anno 2021 (da Conto Annuale, Tabella 12).",
      effettoLimiti: "Escluso dal limite dell'Art. 23, comma 2, D.Lgs. 75/2017 ai sensi dell'Art. 58 c. 4. Rilevante per il calcolo del Limite 48% (D.L. 25/2025).",
      erroriFrequenti: "Applicare la percentuale su un anno diverso dal 2021.",
      operationalWarning: "Richiede apposito stanziamento in bilancio e accordo con le organizzazioni sindacali.",
      tipoDato: 'suggerito'
    },
    { 
      key: 'vn_art58c2_incremento_max022_ms2021_anno2025', 
      description: "Incremento max 0,22% MS 2021 (anno 2025)", 
      riferimento: "Art. 58 c. 2 CCNL 23.02.2026", 
      isRelevantToArt23Limit: false, 
      section: 'vn_non_soggette',
      tabella15Column: 'V623'
    },
    { 
      key: 'vn_art58c2_CCNL2026_incremento022_MS2021', 
      description: "Incremento 0,22% Monte Salari 2021 (Art. 58 c.2 CCNL 23.02.2026)", 
      riferimento: "Art. 58 c. 2 CCNL 23.02.2026", 
      isRelevantToArt23Limit: false, 
      section: 'vn_non_soggette',
      tabella15Column: 'V623',
      titoloGuida: "Quota 0,22% Fondo risorse decentrate",
      descrizioneFunzionale: "Quota dell'incremento variabile opzionale dello 0,22% destinata al Fondo risorse decentrate.",
      quandoSiUsa: "Alimentato dal Wizard Step 4.",
      tipoDato: 'automatico'
    },
    { 
      key: 'vn_art58_CCNL2026_arretrati2024_2025', 
      description: "Arretrati 0,14% MS 2021", 
      riferimento: "Art. 58 CCNL 23.02.2026", 
      isRelevantToArt23Limit: false, 
      section: 'vn_non_soggette',
      tabella15Column: 'V624',
      titoloGuida: "Arretrati Contrattuali (CCNL 2026)",
      descrizioneFunzionale: "Quota una tantum destinata alla copertura degli arretrati relativi agli anni 2024 e 2025 derivanti dal rinnovo contrattuale.",
      quandoSiUsa: "Solo nell'anno di prima applicazione del CCNL 2026 (esercizio 2026).",
      fonteDato: "Calcolo analitico degli arretrati spettanti al personale in servizio nei periodi di riferimento.",
      effettoLimiti: "Escluso dal limite dell'Art. 23, comma 2, D.Lgs. 75/2017. Voce neutra ai fini del Limite 48% (una tantum).",
      erroriFrequenti: "Inserire gli arretrati in parte stabile del fondo invece di quella variabile.",
      operationalWarning: "La voce deve essere utilizzata esclusivamente per l'erogazione degli arretrati e non per incrementi permanenti.",
      tipoDato: 'manuale'
    },
    // Finali e Limiti
    { key: 'fin_art4_dl16_misureMancatoRispettoVincoli', description: "Misure per mancato rispetto vincoli (Art. 4 DL 16/14)", riferimento: norme.riferimenti_normativi.dl16_2014_art4 as string, isRelevantToArt23Limit: false, isSubtractor: true, section: 'fin_decurtazioni' },
    { 
      key: 'cl_art23c2_decurtazioneIncrementoAnnualeTetto2016', 
      description: "Decurtazione annuale per rispetto tetto 2016", 
      riferimento: "Art. 23, comma 2, D.Lgs. 75/2017", 
      isRelevantToArt23Limit: true, 
      isSubtractor: true, 
      section: 'cl_limiti',
      titoloGuida: "Tetto 2016 (Decurtazione)",
      descrizioneFunzionale: "Riduzione obbligatoria del fondo necessaria per garantire che la spesa accessoria totale dell'anno non superi quella sostenuta nel 2016.",
      quandoSiUsa: "Quando la somma delle risorse soggette a limite eccede il valore del fondo 2016.",
      fonteDato: "Costituzione del fondo anno 2016 certificata.",
      effettoLimiti: "Rappresenta il principale presidio di legalità della spesa accessoria complessiva.",
      erroriFrequenti: "Escludere dal calcolo del tetto risorse che invece vi rientrano (es. indennità di comparto o quote variabili non vincolate).",
      operationalWarning: "Il superamento del tetto 2016 può comportare responsabilità erariali e l'obbligo di recupero delle somme indebitamente erogate.",
      tipoDato: 'automatico'
    },
    { 
      key: 'cl_totaleParzialeRisorsePerConfrontoTetto2016', 
      description: "Totale parziale risorse ai fini del confronto con il tetto complessivo del salario accessorio dell'anno 2016 comprensivo del lavoro straordinario.", 
      riferimento: "Art. 23 c. 2 D.Lgs. 75/2017", 
      section: 'cl_limiti',
      titoloGuida: "Base di Confronto Tetto 2016",
      descrizioneFunzionale: "Somma delle risorse stabili e variabili del fondo corrente che rientrano nel perimetro del limite ex Art. 23, comma 2, del D.Lgs. 75/2017.",
      quandoSiUsa: "Per calcolare se l'ammontare complessivo delle risorse destinate al trattamento accessorio eccede quello stanziato nel 2016.",
      fonteDato: "Calcolo automatico basato sulle singole voci di costituzione marcate come rilevanti.",
      effettoLimiti: "Base di calcolo per determinare l'eventuale decurtazione del fondo.",
      tipoDato: 'automatico'
    }
];

export const getDistribuzioneFieldDefinitions = (norme: NormativeData): Array<{
  key: keyof DistribuzioneRisorseData;
  description: string;
  riferimento: string;
  section: 'stabili' | 'variabili';
  titoloGuida?: string;
  descrizioneFunzionale?: string;
  quandoSiUsa?: string;
  fonteDato?: string;
  effettoLimiti?: string;
  erroriFrequenti?: string;
  normativeReferenceShort?: string;
  normativeReferenceFull?: string;
  helpText?: string;
  operationalWarning?: string;
  tipoDato?: 'manuale' | 'automatico' | 'suggerito';
  livelloAttenzione?: 'info' | 'warning' | 'critical';
}> => [
    // Utilizzi Parte Stabile
    { 
      key: 'u_diffProgressioniStoriche', 
      description: "Differenziali stipendiali storici non riassorbibili", 
      riferimento: "Art. 59 c. 1 CCNL 23.02.2026", 
      section: 'stabili',
      titoloGuida: "Differenziali Storici",
      descrizioneFunzionale: "Costo dei differenziali stipendiali attribuiti fino al 31.12.2022.",
      quandoSiUsa: "Voce di utilizzo fissa e strutturale.",
      fonteDato: "Dati storici della spesa di personale.",
      effettoLimiti: "Nessuno (voce di utilizzo).",
      erroriFrequenti: "Inserire valori che includono i differenziali attribuiti dal 2023 in poi.",
      tipoDato: 'automatico'
    },
    { 
      key: 'u_assegnoAdPersonamRiassorbibile', 
      description: "Assegno ad personam riassorbibile progressioni tra aree", 
      riferimento: "Art. 59 c. 2 lett. m) CCNL 23.02.2026", 
      section: 'stabili',
      titoloGuida: "Assegno ad Personam",
      descrizioneFunzionale: "Assegno spettante al personale che a seguito di progressione tra aree mantiene il differenziale maturato.",
      quandoSiUsa: "In caso di progressione verticale tra aree diverse.",
      fonteDato: "Provvedimenti di inquadramento.",
      effettoLimiti: "Utilizzo di risorse stabili.",
      erroriFrequenti: "Mancato riassorbimento dell'assegno in caso di successivi incrementi tabellari.",
      tipoDato: 'manuale'
    },
    { 
      key: 'u_indennitaComparto', 
      description: "Indennità di comparto", 
      riferimento: "Art. 59 c. 1 CCNL 16.11.2022 (rif. Art. 80 c. 1 CCNL 2026)", 
      section: 'stabili',
      titoloGuida: "Indennità di Comparto",
      descrizioneFunzionale: "Quota fissa e continuativa spettante a tutto il personale del comparto, finanziata integralmente dalle risorse stabili del fondo (Art. 80 c. 1 CCNL 2026).",
      quandoSiUsa: "Per la remunerazione della specifica indennità prevista dal contratto nazionale.",
      fonteDato: "Calcolo automatico basato sulla consistenza del personale in servizio (FTE) su base 12 mensilità.",
      effettoLimiti: "Nessuno (voce di puro utilizzo). [Nota 2026]: Dal 2026 la quota residua nel fondo è al netto della parte conglobata nel tabellare ai sensi dell'Art. 60.",
      erroriFrequenti: "Calcolare l'indennità su 13 mensilità o su personale non appartenente al comparto.",
      operationalWarning: "Assicurarsi di non confondere questa voce di utilizzo con la voce di riduzione stabile del fondo.",
      tipoDato: 'automatico'
    },
    { 
      key: 'u_incrIndennitaEducatori', 
      description: "Incremento indennità personale educativo asili nido", 
      riferimento: `${norme.riferimenti_normativi.art59_ccnl2024}, c.1`, 
      section: 'stabili',
      titoloGuida: "Indennità Educatori",
      descrizioneFunzionale: "Risorse per l'incremento dell'indennità specifica del personale educativo dei nidi d'infanzia.",
      quandoSiUsa: "Per il finanziamento strutturale dell'indennità di cui al CCNL 2022.",
      fonteDato: "Personale educativo in servizio.",
      effettoLimiti: "Utilizzo di risorse stabili.",
      tipoDato: 'automatico'
    },
    { 
      key: 'u_incrIndennitaScolastico', 
      description: "Incremento indennità personale scolastico", 
      riferimento: `${norme.riferimenti_normativi.art59_ccnl2024}, c.1`, 
      section: 'stabili',
      titoloGuida: "Indennità Personale Scolastico",
      descrizioneFunzionale: "Risorse per l'incremento dell'indennità specifica del personale delle scuole dell'infanzia.",
      quandoSiUsa: "Per il finanziamento strutturale dell'indennità di cui al CCNL 2022.",
      fonteDato: "Personale scolastico in servizio.",
      effettoLimiti: "Utilizzo di risorse stabili.",
      tipoDato: 'automatico'
    },
    { 
      key: 'u_indennitaEx8QF', 
      description: "Indennità personale ex 8^ q.f. non titolare di PO", 
      riferimento: `${norme.riferimenti_normativi.art59_ccnl2024}, c.1`, 
      section: 'stabili',
      titoloGuida: "Indennità ex 8^ Q.F.",
      descrizioneFunzionale: "Mantenimento dell'indennità per il personale inquadrato nella ex 8^ qualifica funzionale sprovvisto di incarico di EQ.",
      quandoSiUsa: "In presenza di personale con tale diritto acquisito.",
      fonteDato: "Ruoli storici dell'ente.",
      effettoLimiti: "Utilizzo di risorse stabili.",
      tipoDato: 'manuale'
    },

    // Utilizzi Parte Variabile
    { 
      key: 'p_performanceOrganizzativa', 
      description: "Premi correlati alla performance organizzativa", 
      riferimento: `${norme.riferimenti_normativi.art59_ccnl2024}, c.2, lett. a)`, 
      section: 'variabili',
      titoloGuida: "Performance Organizzativa",
      descrizioneFunzionale: "Premi destinati a remunerare il raggiungimento degli obiettivi dell'ente o di specifiche unità organizzative.",
      quandoSiUsa: "Nella fase di distribuzione delle risorse variabili.",
      fonteDato: "Sistema di valutazione permanente dell'ente.",
      effettoLimiti: "Utilizzo di risorse variabili soggette e non soggette.",
      erroriFrequenti: "Non distinguere correttamente tra quota organizzativa e individuale.",
      tipoDato: 'suggerito'
    },
    { 
      key: 'p_performanceIndividuale', 
      description: "Premi correlati alla performance individuale", 
      riferimento: norme.riferimenti_normativi.art48_ccnl2024 as string, 
      section: 'variabili',
      titoloGuida: "Performance Individuale",
      descrizioneFunzionale: "Premi destinati a remunerare il merito e la performance del singolo dipendente.",
      quandoSiUsa: "Componente obbligatoria del sistema premiante.",
      fonteDato: "Esiti della valutazione individuale.",
      effettoLimiti: "Deve rispettare i criteri di differenziazione dei premi.",
      erroriFrequenti: "Erogazione a pioggia senza reale differenziazione delle valutazioni.",
      tipoDato: 'suggerito'
    },
    { 
      key: 'p_maggiorazionePerformanceIndividuale', 
      description: "Premi per la maggiorazione della performance individuale", 
      riferimento: norme.riferimenti_normativi.art48_ccnl2024 as string, 
      section: 'variabili',
      titoloGuida: "Maggiorazione Premi",
      descrizioneFunzionale: "Quota di risorse destinata alla maggiorazione dei premi individuali per una quota limitata di dipendenti (Art. 48).",
      quandoSiUsa: "Per premiare l'eccellenza e garantire la differenziazione dei premi.",
      fonteDato: "Criteri definiti nel CCDI e valutazione delle eccellenze.",
      effettoLimiti: "Utilizzo di risorse variabili.",
      erroriFrequenti: "Erogazione a una platea troppo vasta, perdendo il carattere di maggiorazione.",
      tipoDato: 'automatico'
    },
    { 
      key: 'p_indennitaCondizioniLavoro', 
      description: "Indennità condizioni di lavoro", 
      riferimento: `${norme.riferimenti_normativi.art59_ccnl2024}, c.2, lett. c)`, 
      section: 'variabili',
      titoloGuida: "Condizioni di Lavoro",
      descrizioneFunzionale: "Indennità destinata a remunerare lo svolgimento di prestazioni in condizioni di particolare disagio.",
      quandoSiUsa: "Per mansioni che comportano rischi o oneri specifici definiti in sede decentrata.",
      fonteDato: "Rilevazioni presenze e rendicontazione attività.",
      effettoLimiti: "Utilizzo risorse variabili.",
      erroriFrequenti: "Applicazione senza i presupposti oggettivi definiti nel contratto decentrato.",
      tipoDato: 'manuale'
    },
    { 
      key: 'p_indennitaTurno', 
      description: "Indennità di turno", 
      riferimento: `${norme.riferimenti_normativi.art59_ccnl2024}, c.2, lett. d)`, 
      section: 'variabili',
      titoloGuida: "Indennità di Turno",
      descrizioneFunzionale: "Compensazione per la prestazione lavorativa articolata in turni.",
      quandoSiUsa: "Per il personale inserito in turnazioni certificate.",
      fonteDato: "Rilevazione presenze.",
      effettoLimiti: "Utilizzo risorse variabili.",
      erroriFrequenti: "Calcolare l'indennità su turni non conformi alla normativa contrattuale.",
      tipoDato: 'automatico'
    },
    { 
      key: 'p_indennitaReperibilita', 
      description: "Indennità di reperibilità", 
      riferimento: `${norme.riferimenti_normativi.art59_ccnl2024}, c.2, lett. d)`, 
      section: 'variabili',
      titoloGuida: "Reperibilità",
      descrizioneFunzionale: "Indennità spettante al personale obbligato a garantire la pronta disponibilità.",
      quandoSiUsa: "Per servizi essenziali che richiedono continuità di intervento fuori orario.",
      fonteDato: "Ordini di servizio e turni di reperibilità.",
      effettoLimiti: "Utilizzo risorse variabili.",
      erroriFrequenti: "Superare il numero massimo di turni mensili pro-capite.",
      tipoDato: 'automatico'
    },
    { 
      key: 'p_indennitaLavoroGiornoRiposo', 
      description: "Indennità per lavoro nella giornata di riposo", 
      riferimento: norme.riferimenti_normativi.ccnl_14092000_art24c1 as string, 
      section: 'variabili',
      titoloGuida: "Lavoro in Giorno di Riposo",
      descrizioneFunzionale: "Compenso per l'attività lavorativa prestata eccezionalmente nel giorno di riposo settimanale.",
      quandoSiUsa: "In caso di prestazioni festive o in turni che cadono nel giorno di riposo.",
      fonteDato: "Rilevazione presenze e ordini di servizio.",
      effettoLimiti: "Utilizzo di risorse variabili.",
      tipoDato: 'automatico'
    },
    { 
      key: 'p_compensiSpecificheResponsabilita', 
      description: "Compensi per specifiche responsabilità", 
      riferimento: `${norme.riferimenti_normativi.art59_ccnl2024}, c.2, lett. e)`, 
      section: 'variabili',
      titoloGuida: "Specifiche Responsabilità",
      descrizioneFunzionale: "Indennità destinate a compensare lo svolgimento di compiti che comportano specifiche responsabilità.",
      quandoSiUsa: "Per incarichi formali non rientranti nelle EQ (es. messi, ufficiali stato civile, ecc.).",
      fonteDato: "Atti di incarico e CCDI.",
      effettoLimiti: "Utilizzo di risorse variabili.",
      tipoDato: 'manuale'
    },
    { 
      key: 'p_indennitaFunzione', 
      description: "Indennità di funzione", 
      riferimento: norme.riferimenti_normativi.art97_ccnl2022 as string, 
      section: 'variabili',
      titoloGuida: "Indennità di Funzione PL",
      descrizioneFunzionale: "Indennità legata alla funzione svolta dal personale della Polizia Locale (ex art. 37).",
      quandoSiUsa: "Per il personale inquadrato nei profili della Polizia Locale.",
      fonteDato: "Personale PL in servizio.",
      effettoLimiti: "Utilizzo di risorse variabili.",
      tipoDato: 'automatico'
    },
    { 
      key: 'p_indennitaServizioEsterno', 
      description: "Indennità di servizio esterno", 
      riferimento: norme.riferimenti_normativi.art47_ccnl2024 as string, 
      section: 'variabili',
      titoloGuida: "Servizio Esterno",
      descrizioneFunzionale: "Indennità per il personale di Polizia Locale impiegato prevalentemente all'esterno.",
      quandoSiUsa: "Per turni di servizio svolti esternamente alla sede istituzionale.",
      fonteDato: "Rendiconto servizi Polizia Locale.",
      effettoLimiti: "Utilizzo risorse variabili.",
      erroriFrequenti: "Erogazione al personale amministrativo non impiegato in esterno.",
      tipoDato: 'automatico'
    },
    { 
      key: 'p_obiettiviPoliziaLocale', 
      description: "Obiettivi di potenziamento dei servizi di Polizia Locale", 
      riferimento: "Art. 98 CCNL 16.11.2022 (rif. Art. 208 D.Lgs. 285/1992)", 
      section: 'variabili',
      titoloGuida: "Potenziamento PL (Codice Strada)",
      descrizioneFunzionale: "Premi di performance destinati al personale della Polizia Locale per il raggiungimento di obiettivi di sicurezza urbana e stradale.",
      quandoSiUsa: "Quando l'ente attiva progetti finanziati con i proventi delle sanzioni amministrative pecuniarie (Codice della Strada).",
      fonteDato: "Delibera di Giunta di destinazione dei proventi CdS e rendicontazione dei risultati.",
      effettoLimiti: "Escluso dal limite dell'Art. 23, comma 2, D.Lgs. 75/2017 se finanziato con quote vincolate dei proventi CdS eccedenti la spesa storica.",
      erroriFrequenti: "Erogare i premi senza l'effettivo accertamento e riscossione dei proventi vincolati.",
      operationalWarning: "Verificare il rispetto della percentuale massima di destinazione dei proventi prevista dal regolamento dell'ente.",
      tipoDato: 'manuale'
    },
    { 
      key: 'p_incentiviContoTerzi', 
      description: "Incentivi da entrate conto terzi o utenza (es. ISTAT)", 
      riferimento: `${norme.riferimenti_normativi.art59_ccnl2024}, c.2, lett. g)`, 
      section: 'variabili',
      titoloGuida: "Incentivi Conto Terzi",
      descrizioneFunzionale: "Premi finanziati da soggetti esterni per attività svolte dal personale dell'ente.",
      quandoSiUsa: "In presenza di convenzioni o rimborsi da altri enti per servizi specifici.",
      fonteDato: "Entrate accertate in bilancio (conto terzi).",
      effettoLimiti: "Escluso dal limite Art. 23 c. 2 (finanziamento esterno).",
      tipoDato: 'manuale'
    },
    { 
      key: 'p_compensiAvvocatura', 
      description: "Compensi avvocatura interna per sentenze favorevoli", 
      riferimento: `${norme.riferimenti_normativi.art59_ccnl2024}, c.2, lett. g)`, 
      section: 'variabili',
      titoloGuida: "Avvocatura",
      descrizioneFunzionale: "Compensi spettanti agli avvocati dipendenti in caso di sentenze favorevoli con recupero spese.",
      quandoSiUsa: "A seguito di vittoria in giudizio con liquidazione delle spese a carico di controparte.",
      fonteDato: "Sentenze e riscossione spese legali.",
      effettoLimiti: "Escluso dal limite Art. 23 c. 2.",
      erroriFrequenti: "Erogazione prima dell'effettiva riscossione delle spese dalla controparte.",
      tipoDato: 'manuale'
    },
    { 
      key: 'p_incentiviCondonoFunzioniTecnichePre2018', 
      description: "Incentivi (condono, funzioni tecniche pre-2018)", 
      riferimento: `${norme.riferimenti_normativi.art59_ccnl2024}, c.2, lett. g)`, 
      section: 'variabili',
      titoloGuida: "Incentivi Storici",
      descrizioneFunzionale: "Incentivi legati a pratiche di condono o funzioni tecniche pregresse (normativa pre-2018).",
      quandoSiUsa: "Per la liquidazione di code di arretrati su vecchie normative.",
      fonteDato: "Pratiche concluse e rendicontate.",
      effettoLimiti: "Escluso dal limite Art. 23 c. 2.",
      tipoDato: 'manuale'
    },
    { 
      key: 'p_incentiviFunzioniTecnichePost2018', 
      description: "Incentivi per funzioni tecniche (post 2018)", 
      riferimento: norme.riferimenti_normativi.art45_dlgs36_2023_new as string, 
      section: 'variabili',
      titoloGuida: "Incentivi Funzioni Tecniche",
      descrizioneFunzionale: "Compensi spettanti al personale tecnico per attività di progettazione, RUP, direzione lavori, ecc.",
      quandoSiUsa: "Per la liquidazione dei compensi legati a specifiche commesse o lavori pubblici.",
      fonteDato: "Prospetti di riparto incentivi tecnici approvati.",
      effettoLimiti: "Escluso dal limite Art. 23 c. 2 (se previsto dalla normativa vigente).",
      erroriFrequenti: "Superare il tetto massimo annuo pro-capite del 50% dello stipendio tabellare.",
      tipoDato: 'manuale'
    },
    { 
      key: 'p_incentiviIMUTARI', 
      description: "Incentivi per accertamenti IMU e TARI", 
      riferimento: `${norme.riferimenti_normativi.art59_ccnl2024}, c.2, lett. g)`, 
      section: 'variabili',
      titoloGuida: "Incentivi Tributi",
      descrizioneFunzionale: "Premi legati al recupero dell'evasione dei tributi locali (IMU/TARI) ex L. 145/2018.",
      quandoSiUsa: "Nella fase di riparto dei premi al personale del settore tributi.",
      fonteDato: "Incassi da recupero evasione.",
      effettoLimiti: "Escluso dal limite Art. 23 c. 2.",
      tipoDato: 'manuale'
    },
    { 
      key: 'p_compensiMessiNotificatori', 
      description: "Compensi ai messi notificatori", 
      riferimento: `${norme.riferimenti_normativi.art59_ccnl2024}, c.2, lett. h)`, 
      section: 'variabili',
      titoloGuida: "Messi Notificatori",
      descrizioneFunzionale: "Compensi spettanti ai messi per le notifiche effettuate.",
      quandoSiUsa: "In base al rimborso spese notifica incassato dall'ente.",
      fonteDato: "Rendiconto notifiche e incassi spese.",
      effettoLimiti: "Escluso dal limite Art. 23 c. 2.",
      erroriFrequenti: "Erogazione su base forfettaria senza rendicontazione analitica.",
      tipoDato: 'manuale'
    },
    { 
      key: 'p_compensiCaseGioco', 
      description: "Compensi personale case da gioco", 
      riferimento: `${norme.riferimenti_normativi.art59_ccnl2024}, c.2, lett. i)`, 
      section: 'variabili',
      titoloGuida: "Compensi Case da Gioco",
      descrizioneFunzionale: "Compensi accessori per il personale impiegato presso le case da gioco.",
      quandoSiUsa: "Solo per enti con gestione di casinò.",
      fonteDato: "Rendiconto attività casa da gioco.",
      effettoLimiti: "Utilizzo di risorse variabili.",
      tipoDato: 'manuale'
    },
    { 
      key: 'p_compensiCaseGiocoNonCoperti', 
      description: "Compensi case da gioco (parte non coperta da stabili)", 
      riferimento: `${norme.riferimenti_normativi.art59_ccnl2024}, c.2, lett. i)`, 
      section: 'variabili',
      titoloGuida: "Compensi Eccedenti Casinò",
      descrizioneFunzionale: "Quota di compensi per le case da gioco che eccede la copertura della parte stabile.",
      quandoSiUsa: "In caso di picchi di attività o integrazioni variabili.",
      fonteDato: "Rendiconto attività casa da gioco.",
      effettoLimiti: "Utilizzo di risorse variabili.",
      tipoDato: 'manuale'
    },
    { 
      key: 'p_diffStipendialiAnnoCorrente', 
      description: "Differenziali stipendiali da attribuire nell'anno corrente", 
      riferimento: `${norme.riferimenti_normativi.art59_ccnl2024}, c.2, lett. j)`, 
      section: 'variabili',
      titoloGuida: "Nuove Progressioni",
      descrizioneFunzionale: "Costo dei differenziali stipendiali (nuove progressioni orizzontali) attribuiti nell'anno corrente.",
      quandoSiUsa: "In caso di attivazione di nuove procedure di progressione tra le aree.",
      fonteDato: "Graduatorie e provvedimenti di attribuzione.",
      effettoLimiti: "Utilizzo risorse variabili (spesso correlate a entrate esterne).",
      tipoDato: 'manuale'
    },
    { 
      key: 'p_pianiWelfare', 
      description: "Risorse per piani welfare", 
      riferimento: `${norme.riferimenti_normativi.art59_ccnl2024}, c.2, lett. k)`, 
      section: 'variabili',
      titoloGuida: "Welfare Integrativo",
      descrizioneFunzionale: "Risorse destinate a prestazioni di welfare integrativo per i dipendenti (Art. 82).",
      quandoSiUsa: "In presenza di accordi decentrati sul welfare aziendale.",
      fonteDato: "CCDI e piani approvati.",
      effettoLimiti: "Utilizzo di risorse variabili.",
      tipoDato: 'manuale'
    },
    { 
      key: 'p_indennitaCentralinistiNonVedenti', 
      description: "Indennità per centralinisti non vedenti", 
      riferimento: "Art. 49 CCNL 23.02.2026", 
      section: 'variabili',
      titoloGuida: "Centralinisti Non Vedenti",
      descrizioneFunzionale: "Indennità specifica di mansione prevista dalla legge e dai contratti.",
      quandoSiUsa: "Per personale non vedente adibito a mansioni di centralino.",
      fonteDato: "Inquadramento e mansioni effettive.",
      effettoLimiti: "Utilizzo risorse variabili.",
      erroriFrequenti: "Mancata applicazione dell'indennità spettante ex lege.",
      tipoDato: 'automatico'
    },
    { 
      key: 'p_incentiviServiziAssociatiInnovazione', 
      description: "Incentivazione personale servizi associati, PNRR, innovazione tecnologica", 
      riferimento: "Art. 20 c. 1 lett. a) CCNL 23.02.2026; Art. 1 c. 512 L. 208/2015", 
      section: 'variabili',
      titoloGuida: "Innovazione, PNRR e Gestioni Associate",
      descrizioneFunzionale: "Compensi incentivanti per il personale coinvolto in processi di innovazione, digitalizzazione o gestione di progetti PNRR e servizi associati.",
      quandoSiUsa: "In sede di riparto della performance variabile per remunerare progetti ad alto valore aggiunto.",
      fonteDato: "Piani degli obiettivi e rendicontazione dei risparmi o dei risultati PNRR.",
      effettoLimiti: "Può essere escluso dal limite Art. 23, comma 2, se derivante da finanziamenti PNRR o risparmi certificati da gestioni associate.",
      erroriFrequenti: "Erogazione forfettaria non legata al reale raggiungimento dei milestone PNRR.",
      operationalWarning: "Documentare analiticamente il nesso tra la prestazione e il progetto finanziato.",
      tipoDato: 'manuale'
    }
];

export const getEqFieldDefinitions = (): Array<{
  key: keyof FondoElevateQualificazioniData;
  description: string;
  riferimento: string;
  section: string;
  titoloGuida?: string;
  descrizioneFunzionale?: string;
  quandoSiUsa?: string;
  fonteDato?: string;
  effettoLimiti?: string;
  erroriFrequenti?: string;
  tipoDato?: 'manuale' | 'automatico' | 'suggerito';
  livelloAttenzione?: 'info' | 'warning' | 'critical';
  isHidden?: boolean;
}> => [
    { 
      key: 'st_art16c2_retribuzionePosizione', 
      description: "Retribuzione di Posizione EQ", 
      riferimento: "Art. 16 c. 2 CCNL Funzioni Locali 23.02.2026", 
      section: 'Utilizzi EQ',
      titoloGuida: "Posizione EQ",
      descrizioneFunzionale: "Quota delle risorse EQ destinata alla retribuzione di posizione dei titolari di Elevata Qualificazione.",
      quandoSiUsa: "Sempre, per la remunerazione della graduazione della posizione ricoperta.",
      fonteDato: "Sistema di pesatura dell'ente.",
      effettoLimiti: "Soggetta al limite ex Art. 23 c. 2 (per la quota consolidata).",
      tipoDato: 'manuale'
    },
    { 
      key: 'va_art16c3_retribuzioneRisultato', 
      description: "Retribuzione di Risultato EQ", 
      riferimento: "Art. 16 c. 3 CCNL Funzioni Locali 23.02.2026", 
      section: 'Utilizzi EQ',
      titoloGuida: "Risultato EQ",
      descrizioneFunzionale: "Quota delle risorse EQ destinata a remunerare i risultati raggiunti dai titolari di Elevata Qualificazione (minimo 15% del fondo EQ).",
      quandoSiUsa: "In sede di consuntivazione e valutazione della performance.",
      fonteDato: "Sistema di valutazione dell'ente.",
      effettoLimiti: "La quota di risultato è soggetta al limite Art. 23 c. 2.",
      tipoDato: 'manuale'
    }
];
