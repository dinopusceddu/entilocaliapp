// services/determinaTemplate.ts
// Genera il testo completo della Determina Dirigenziale di Costituzione del Fondo
import type { CalculatedFund, FundData, User } from '../types.ts';
import { formatNumber } from '../utils/formatters.ts';

export const numberToItalianWords = (n: number): string => {
    if (n === 0) return 'zero';
    const units = ["", "uno", "due", "tre", "quattro", "cinque", "sei", "sette", "otto", "nove"];
    const teens = ["dieci", "undici", "dodici", "tredici", "quattordici", "quindici", "sedici", "diciassette", "diciotto", "diciannove"];
    const tens = ["", "", "venti", "trenta", "quaranta", "cinquanta", "sessanta", "settanta", "ottanta", "novanta"];
    function tw(num: number): string {
        if (num === 0) return "";
        if (num < 10) return units[num];
        if (num < 20) return teens[num - 10];
        if (num < 100) {
            const t = Math.floor(num / 10), u = num % 10;
            let w = tens[t];
            if ((u === 1 || u === 8) && t > 1) w = w.slice(0, -1);
            return w + tw(u);
        }
        if (num < 1000) {
            const h = Math.floor(num / 100);
            return (h === 1 ? "cento" : units[h] + "cento") + tw(num % 100);
        }
        if (num < 1000000) {
            const t = Math.floor(num / 1000);
            return (t === 1 ? "mille" : tw(t) + "mila") + tw(num % 1000);
        }
        if (num < 1000000000) {
            const m = Math.floor(num / 1000000);
            return (m === 1 ? "unmilione" : tw(m) + "milioni") + tw(num % 1000000);
        }
        return "";
    }
    return tw(n);
};

export const toWords = (num?: number): string => {
    if (num === undefined || num === null || isNaN(num)) return '__________/00';
    const i = Math.floor(num);
    const d = Math.round((num - i) * 100);
    return `${numberToItalianWords(i) || 'zero'}/${d.toString().padStart(2, '0')}`;
};

const f = (val: number | undefined) => formatNumber(val, 2, '__________');
const fz = (val: number | undefined) => formatNumber(val ?? 0, 2, '0,00');

export const buildDetermina = (
    calculatedFund: CalculatedFund,
    fundData: FundData,
    currentUser: User
): string => {
    const { annualData, fondoAccessorioDipendenteData: d, historicalData } = fundData;
    const anno = annualData.annoRiferimento;
    const ente = annualData.denominazioneEnte || '_______________';
    const tipoEnte = annualData.tipologiaEnte ? `[${annualData.tipologiaEnte}]` : '[comunale/provinciale]';

    const pers2018 = annualData.manualDipendentiEquivalenti2018 !== undefined
        ? String(annualData.manualDipendentiEquivalenti2018)
        : (annualData.personale2018PerArt23?.length ? String(annualData.personale2018PerArt23.length) : '___');

    const pers2021 = historicalData.personaleServizio2018
        ? String(historicalData.personaleServizio2018)
        : '___';

    const ms2021 = f(annualData.ccnl2024?.monteSalari2021);

    // Totali Fondo
    const totale = calculatedFund.dettaglioFondi.dipendente.totale;

    // Componenti parte stabile soggette al limite
    const st_fondo2015 = d?.st_art79c1_art67c1_unicoImporto2017;
    const st_incr8320 = d?.st_art79c1_art67c2a_incr8320;
    const st_peo = d?.st_art79c1_art67c2b_incrStipendialiDiff;
    const st_ria = d?.st_art79c1_art4c2_art67c2c_integrazioneRIA;
    const st_165 = d?.st_art79c1_art67c2d_risorseRiassorbite165;
    const st_trasfStab = d?.st_art79c1_art15c1l_art67c2e_personaleTrasferito;
    const st_regioni = d?.st_art79c1_art15c1i_art67c2f_regioniRiduzioneDirig;
    const st_strao = d?.st_art79c1_art14c3_art67c2g_riduzioneStraordinario;
    const st_nuoveAss = d?.st_art79c1c_incrementoStabileConsistenzaPers;

    // totale A (soggette stabili) = stabile meno le voci non soggette
    const st_8450 = d?.st_art79c1b_euro8450;
    const st_difdPeo = d?.st_art79c1d_differenzialiStipendiali2022;
    const st_b3d3 = d?.st_art79c1bis_diffStipendialiB3D3;
    const vn_022_2021 = d?.vn_art79c3_022MonteSalari2018_da2022Proporzionale;
    const vn_022_l207 = d?.vn_art58c2_incremento_max022_ms2021_anno2025;

    const totA = (st_fondo2015 ?? 0) + (st_incr8320 ?? 0) + (st_peo ?? 0) + (st_ria ?? 0) +
        (st_165 ?? 0) + (st_trasfStab ?? 0) + (st_regioni ?? 0) + (st_strao ?? 0) + (st_nuoveAss ?? 0);
    const totB = (st_8450 ?? 0) + (st_difdPeo ?? 0) + (st_b3d3 ?? 0) + (vn_022_2021 ?? 0) + (vn_022_l207 ?? 0);
    const totAB = totA + totB;

    // Componenti variabili soggette al limite
    const vs_progetti = d?.vs_art4c3_art15c1k_art67c3c_recuperoEvasione;
    const vs_terzi = d?.vs_art4c2_art67c3d_integrazioneRIAMensile;
    const vs_caseGioco = d?.vs_art67c3g_personaleCaseGioco;
    const vs_ms1997 = d?.vs_art79c2b_max1_2MonteSalari1997;
    const vs_economie = d?.vs_art79c2c_risorseScelteOrganizzative;
    const vs_trasf = d?.vs_art67c3k_integrazioneArt62c2e_personaleTrasferito;

    const totC = (vs_progetti ?? 0) + (vs_terzi ?? 0) + (vs_caseGioco ?? 0) +
        (vs_ms1997 ?? 0) + (vs_economie ?? 0) + (vs_trasf ?? 0);

    // Componenti variabili non soggette al limite
    const vn_sponsor = d?.vn_art15c1d_art67c3a_sponsorConvenzioni;
    const vn_messi = d?.vn_art54_art67c3f_rimborsoSpeseNotifica;
    const vn_razion = d?.vn_art15c1k_art16_dl98_art67c3b_pianiRazionalizzazione;
    const vn_tecnici = d?.vn_art15c1k_art67c3c_incentiviTecniciCondoni;
    const vn_giudizio = d?.vn_art18h_art67c3c_incentiviSpeseGiudizioCensimenti;
    const vn_risparmiStrao = d?.vn_art15c1m_art67c3e_risparmiStraordinario;
    const vn_8450ut = d?.vn_art79c1b_euro8450_unaTantum2021_2022;
    const vn_residui = d?.vn_art80c1_sommeNonUtilizzateStabiliPrec;
    const vn_imu = d?.vn_l145_art1c1091_incentiviRiscossioneIMUTARI;
    const vn_pnrr = d?.vn_dl13_art8c3_incrementoPNRR_max5stabile2016;
    const vn_decretoPA = d?.st_incrementoDecretoPA;
    const vn_022_2022ut = d?.vn_art79c3_022MonteSalari2018_da2022UnaTantum2022;

    const totD = (vn_sponsor ?? 0) + (vn_messi ?? 0) + (vn_razion ?? 0) + (vn_tecnici ?? 0) +
        (vn_giudizio ?? 0) + (vn_risparmiStrao ?? 0) + (vn_8450ut ?? 0) + (vn_residui ?? 0) +
        (vn_imu ?? 0) + (vn_pnrr ?? 0) + (vn_decretoPA ?? 0) + (vn_022_2022ut ?? 0);

    const totCD = totC + totD;

    // Risorse soggette al limite (A+C)
    const totSoggette = totA + totC;
    const limite2016 = calculatedFund.fondoBase2016;
    const capienza = limite2016 - totSoggette;

    let txt = '';

    // ── HEADER ──────────────────────────────────────────────────────────────
    txt += `${ente}\n`;
    txt += `\nDETERMINA DIRIGENZIALE N. ___/${anno}\n`;
    txt += `OGGETTO: Costituzione del Fondo per le Risorse Decentrate per l'anno ${anno} - Comparto Funzioni Locali - Art. 79 CCNL 16/11/2022\n\n`;

    // ── PREMESSO CHE ─────────────────────────────────────────────────────────
    txt += `PREMESSO CHE\n`;
    txt += `•  il D.Lgs. 30 marzo 2001, n. 165, all'art. 40, comma 3-quinquies, prevede che le risorse destinate annualmente al trattamento accessorio del personale, sia di livello dirigenziale che del restante personale, hanno carattere di certezza, stabilità e continuità, e possono essere utilizzate solo per le finalità e nei limiti previsti dai contratti collettivi nazionali e integrativi;\n`;
    txt += `•  l'art. 45, comma 3, del D.Lgs. n. 165/2001 stabilisce che il trattamento economico accessorio è definito dai contratti collettivi;\n`;
    txt += `•  l'art. 40-bis, comma 1, del D.Lgs. n. 165/2001 dispone che il controllo sulla compatibilità dei costi della contrattazione collettiva integrativa con i vincoli di bilancio è effettuato dall'organo di revisione dei conti;\n`;
    txt += `•  l'art. 23, comma 2, del D.Lgs. 25 maggio 2017, n. 75 stabilisce che, a decorrere dal 1° gennaio 2017, l'ammontare complessivo delle risorse destinate annualmente al trattamento accessorio del personale non può superare il corrispondente importo determinato per l'anno 2016;\n`;
    txt += `•  l'art. 11, comma 1, del D.L. 14 dicembre 2018, n. 135, convertito con modificazioni dalla Legge 11 febbraio 2019, n. 12, dispone che il limite di cui all'art. 23, comma 2, del D.Lgs. n. 75/2017 non si applica agli incrementi previsti dai contratti collettivi nazionali di lavoro sottoscritti successivamente alla data di entrata in vigore dello stesso decreto;\n`;
    txt += `•  la Legge 30 dicembre 2024, n. 207 (Legge di Bilancio 2025), all'art. 121, prevede l'incremento del fondo per la contrattazione decentrata dal 2025 dello 0,22% del monte salari 2022, al lordo degli oneri riflessi e dell'IRAP, secondo modalità da definirsi con i CCNL;\n\n`;

    // ── RICHIAMATO ───────────────────────────────────────────────────────────
    txt += `RICHIAMATO\n`;
    txt += `•  il CCNL del Comparto Funzioni Locali del 21 maggio 2018, in particolare l'art. 67 "Fondo risorse decentrate: costituzione" che disciplina le componenti del fondo relative al precedente triennio contrattuale;\n`;
    txt += `•  il CCNL del Comparto Funzioni Locali del 16 novembre 2022 (triennio contrattuale 2019-2021), in particolare l'art. 79 "Fondo risorse decentrate: costituzione", che prevede:\n`;
    txt += `   o  al comma 1, le risorse stabili del fondo;\n`;
    txt += `   o  al comma 2, le risorse variabili che gli enti possono destinare al fondo;\n`;
    txt += `   o  al comma 5, che le quote relative agli incrementi di cui al comma 1, lett. b) di competenza degli anni 2021 e 2022 sono computate, quali risorse variabili ed una tantum, nel Fondo relativo al 2023;\n`;
    txt += `   o  al comma 6, che le risorse di cui al comma 1, lettere b), c), d) e comma 1-bis non sono assoggettate al limite di cui all'art. 23, comma 2, del D.Lgs. n. 75/2017;\n`;
    txt += `•  l'art. 79, comma 1, del CCNL 16/11/2022 che prevede la costituzione della parte stabile del Fondo dalle seguenti risorse:\n`;
    txt += `   o  lettera a) risorse di cui all'art. 67, comma 1 e comma 2, lettere a), b), c), d), e), f), g) del CCNL 21 maggio 2018;\n`;
    txt += `   o  lettera b) un importo, su base annua, pari a Euro 84,50 per le unità di personale in servizio alla data del 31 dicembre 2018;\n`;
    txt += `   o  lettera c) risorse stanziate dagli enti in caso di incremento stabile della consistenza di personale, in coerenza con il piano dei fabbisogni;\n`;
    txt += `   o  lettera d) un importo pari alle differenze tra gli incrementi a regime degli stipendi tabellari riconosciuti alle posizioni economiche di ciascuna categoria e gli stessi incrementi riconosciuti alle posizioni iniziali;\n`;
    txt += `•  l'art. 79, comma 1-bis, del CCNL 16/11/2022 che prevede che, a decorrere dal 1° aprile 2023, nella parte stabile confluisce anche la quota corrispondente alle differenze stipendiali tra B3 e B1 e tra D3 e D1;\n`;
    txt += `•  l'art. 79, comma 2, del CCNL 16/11/2022 che prevede le risorse variabili che gli enti possono destinare al Fondo;\n`;
    txt += `•  l'art. 79, comma 3, del CCNL 16/11/2022 che prevede che la parte stabile del Fondo è stabilmente incrementata, a decorrere dal 1° gennaio 2024, nella misura dello 0,14% del monte salari 2021 riferito al personale destinatario del CCNL;\n\n`;

    // ── VISTO ────────────────────────────────────────────────────────────────
    txt += `VISTO\n`;
    txt += `•  il bilancio di previsione ${anno}-${anno + 2} approvato con deliberazione del Consiglio ${tipoEnte} n. ___ del __/__/${anno};\n`;
    txt += `•  il Piano Esecutivo di Gestione (PEG) ${anno} approvato con deliberazione della Giunta ${tipoEnte} n. ___ del __/__/${anno};\n`;
    txt += `•  il Piano Integrato di Attività e Organizzazione (PIAO) ${anno}-${anno + 2} approvato con deliberazione della Giunta ${tipoEnte} n. ___ del __/__/${anno};\n`;
    txt += `•  la dotazione organica vigente approvata con deliberazione della Giunta ${tipoEnte} n. ___ del __/___;\n\n`;

    // ── CONSIDERATO CHE ──────────────────────────────────────────────────────
    txt += `CONSIDERATO CHE\n`;
    txt += `•  la gestione delle risorse destinate alla contrattazione decentrata si articola in tre fasi obbligatorie e sequenziali:\n`;
    txt += `   a. individuazione delle risorse in bilancio;\n`;
    txt += `   b. adozione dell'atto di costituzione del Fondo risorse decentrate (costituzione del vincolo contabile sulle risorse);\n`;
    txt += `   c. sottoscrizione del contratto decentrato annuale (perfezionamento dell'obbligazione);\n`;
    txt += `•  la costituzione del Fondo per le risorse decentrate deve essere effettuata tempestivamente all'inizio di ciascun esercizio finanziario;\n`;
    txt += `•  la costituzione del fondo è atto di gestione di competenza del dirigente responsabile del settore risorse umane, mediante determinazione dirigenziale;\n`;
    txt += `•  per la parte stabile, il dirigente procede in via diretta ed esclusiva, trattandosi di voci obbligatorie e predeterminate nella quantificazione;\n`;
    txt += `•  per l'inserimento delle risorse di parte variabile è necessario acquisire previamente la deliberazione della Giunta;\n\n`;

    // ── VISTA delibera variabili ─────────────────────────────────────────────
    txt += `VISTA\nla deliberazione della Giunta ${tipoEnte} n. ___ del __/__/${anno} con la quale sono state individuate le risorse variabili da destinare al Fondo per l'anno ${anno};\n\n`;

    // ── RILEVATO CHE ─────────────────────────────────────────────────────────
    txt += `RILEVATO CHE\n`;
    txt += `•  il personale dipendente non dirigente destinatario del CCNL Funzioni Locali in servizio al 31 dicembre 2018 era costituito da n. ${pers2018} unità;\n`;
    txt += `•  il personale dipendente non dirigente destinatario del CCNL Funzioni Locali in servizio al 31 dicembre 2021 era costituito da n. ${pers2021} unità;\n`;
    txt += `•  il monte salari anno 1997 ammonta a Euro ___________;\n`;
    txt += `•  il monte salari anno 2021 ammonta a Euro ${ms2021};\n`;
    txt += `•  il monte salari anno 2022 ammonta a Euro ___________;\n\n`;

    // ── ACCERTATO CHE ────────────────────────────────────────────────────────
    txt += `ACCERTATO CHE\nle risorse disponibili per la costituzione del Fondo per le risorse decentrate dell'anno ${anno} sono quelle di seguito indicate nell'allegato prospetto (Allegato A), parte integrante e sostanziale del presente atto, distinte tra:\n`;
    txt += `•  risorse stabili soggette al limite di cui all'art. 23, comma 2, del D.Lgs. n. 75/2017;\n`;
    txt += `•  risorse stabili non soggette al limite di cui all'art. 23, comma 2, del D.Lgs. n. 75/2017;\n`;
    txt += `•  risorse variabili soggette al limite di cui all'art. 23, comma 2, del D.Lgs. n. 75/2017;\n`;
    txt += `•  risorse variabili non soggette al limite di cui all'art. 23, comma 2, del D.Lgs. n. 75/2017;\n\n`;

    // ── VERIFICATO CHE ───────────────────────────────────────────────────────
    txt += `VERIFICATO CHE\nil limite complessivo delle risorse destinate al trattamento accessorio del personale non dirigente per l'anno ${anno}, come risultante dal prospetto di cui all'Allegato A, è rispettoso del limite di cui all'art. 23, comma 2, del D.Lgs. n. 75/2017, come determinato per l'anno 2016 e successive modifiche normative e contrattuali;\n\n`;

    // ── DATO ATTO CHE ────────────────────────────────────────────────────────
    txt += `DATO ATTO CHE\n`;
    txt += `•  il presente atto costituisce vincolo contabile sulle risorse destinate alla contrattazione integrativa per l'anno ${anno};\n`;
    txt += `•  le risorse del Fondo possono essere utilizzate solo a seguito della sottoscrizione del contratto collettivo decentrato integrativo annuale;\n`;
    txt += `•  ai sensi dell'art. 40-bis del D.Lgs. n. 165/2001 e dell'art. 8, comma 7, del CCNL Funzioni Locali 16/11/2022, il presente atto di costituzione del Fondo deve essere sottoposto alla certificazione dell'organo di revisione competente;\n`;
    txt += `•  gli stanziamenti necessari sono stati previsti nei pertinenti capitoli di bilancio ${anno};\n\n`;

    // ── RICHIAMATI ───────────────────────────────────────────────────────────
    txt += `RICHIAMATI\n`;
    txt += `•  il D.Lgs. 18 agosto 2000, n. 267 (Testo Unico degli Enti Locali);\n`;
    txt += `•  il D.Lgs. 23 giugno 2011, n. 118 in materia di armonizzazione dei sistemi contabili;\n`;
    txt += `•  il vigente Regolamento di contabilità dell'Ente;\n`;
    txt += `•  lo Statuto dell'Ente;\n\n`;

    txt += `VISTI gli artt. 107 e 109 del D.Lgs. 18 agosto 2000, n. 267;\n\n`;
    txt += `DATO ATTO del parere favorevole di regolarità tecnica espresso ai sensi dell'art. 147-bis, comma 1, del D.Lgs. n. 267/2000;\n\n`;
    txt += `VISTO il parere favorevole di regolarità contabile espresso ai sensi dell'art. 147-bis, comma 1, del D.Lgs. n. 267/2000, attestante la copertura finanziaria della spesa;\n\n`;

    // ── DETERMINA ────────────────────────────────────────────────────────────
    txt += `${'─'.repeat(60)}\nDETERMINA\n${'─'.repeat(60)}\n\n`;

    txt += `Art. 1 - Costituzione del Fondo\n`;
    txt += `Di costituire, per l'anno ${anno}, il Fondo per le risorse decentrate del personale dipendente del Comparto Funzioni Locali, ai sensi dell'art. 79 del CCNL del 16 novembre 2022, per un importo complessivo di Euro ${fz(totale)} (dicasi euro ${toWords(totale)}), come risultante dal prospetto analitico allegato sub A), parte integrante e sostanziale del presente atto.\n\n`;

    txt += `Art. 2 - Composizione del Fondo\nDi dare atto che il Fondo di cui all'art. 1 è costituito dalle seguenti componenti:\n\n`;

    // A) Stabili soggette al limite
    txt += `A) RISORSE STABILI SOGGETTE AL LIMITE (art. 23, comma 2, D.Lgs. n. 75/2017):\n`;
    txt += `1.  Risorse ex art. 67, comma 1, CCNL 21/05/2018 (Fondo anno 2015): Euro ${f(st_fondo2015)}\n`;
    txt += `2.  Risorse ex art. 67, comma 2, CCNL 21/05/2018:\n`;
    txt += `    • lett. a) Incremento art. 31, comma 3 CCNL 2006/2009 (€83,20/dip. al 31/12/2015): Euro ${f(st_incr8320)}\n`;
    txt += `    • lett. b) Differenziali PEO pregresse: Euro ${f(st_peo)}\n`;
    txt += `    • lett. c) Retribuzioni individuali di anzianità/assegni ad personam: Euro ${f(st_ria)}\n`;
    txt += `    • lett. d) Risorse art. 2, comma 3, D.Lgs. 165/2001: Euro ${f(st_165)}\n`;
    txt += `    • lett. e) Trattamento accessorio personale trasferito: Euro ${f(st_trasfStab)}\n`;
    txt += `    • lett. f) Minori oneri riduzione personale dirigenziale (solo Regioni): Euro ${f(st_regioni)}\n`;
    txt += `    • lett. g) Incrementi per riduzioni stabili del fondo straordinario: Euro ${f(st_strao)}\n`;
    txt += `3.  Risorse per nuove assunzioni (art. 79, comma 1, lett. c, CCNL 16/11/2022): Euro ${f(st_nuoveAss)}\n`;
    txt += `    Totale risorse stabili soggette al limite: Euro ${fz(totA)}\n\n`;

    // B) Stabili non soggette al limite
    txt += `B) RISORSE STABILI NON SOGGETTE AL LIMITE:\n`;
    txt += `1.  Incremento art. 79, c.1, lett. b), CCNL 16/11/2022 - Euro 84,50 per dipendente al 31/12/2018: Euro ${f(st_8450)}\n`;
    txt += `2.  Differenziali PEO art. 79, comma 1, lett. d), CCNL 16/11/2022: Euro ${f(st_difdPeo)}\n`;
    txt += `3.  Differenziali D3-D1 e B3-B1 art. 79, comma 1-bis, CCNL 16/11/2022 (dal 01/04/2023): Euro ${f(st_b3d3)}\n`;
    txt += `4.  Incremento 0,14% monte salari 2021 art. 79, comma 3, CCNL 16/11/2022 (dal 01/01/2024): Euro ${f(vn_022_2021)}\n`;
    txt += `5.  Incremento 0,22% monte salari 2022 art. 121 Legge 207/2024 (dal 01/01/2025): Euro ${f(vn_022_l207)}\n`;
    txt += `    Totale risorse stabili non soggette al limite: Euro ${fz(totB)}\n\n`;
    txt += `    TOTALE RISORSE STABILI (A+B): Euro ${fz(totAB)}\n\n`;

    // C) Variabili soggette al limite
    txt += `C) RISORSE VARIABILI SOGGETTE AL LIMITE:\n`;
    txt += `1.  Risorse ex art. 67, comma 3, CCNL 21/05/2018:\n`;
    txt += `    • lett. c) Finanziamento progetti obiettivo: Euro ${f(vs_progetti)}\n`;
    txt += `    • lett. d) Proventi servizi conto terzi: Euro ${f(vs_terzi)}\n`;
    txt += `    • lett. g) Economie da riduzioni personale case da gioco: Euro ${f(vs_caseGioco)}\n`;
    txt += `    • lett. k) Adeguamento Province/armonizzazione: Euro ${f(vs_trasf)}\n`;
    txt += `2.  Quota fino all'1,2% del monte salari 1997 (art. 79, comma 2, lett. b, CCNL 16/11/2022): Euro ${f(vs_ms1997)}\n`;
    txt += `3.  Economie da assenze/aspettative/sanzioni (art. 79, comma 2, lett. c, CCNL 16/11/2022): Euro ${f(vs_economie)}\n`;
    txt += `    Totale risorse variabili soggette al limite: Euro ${fz(totC)}\n\n`;

    // D) Variabili non soggette al limite
    txt += `D) RISORSE VARIABILI NON SOGGETTE AL LIMITE:\n`;
    txt += `1.  Sponsorizzazioni/convenzioni (art. 67, c.3, lett. a): Euro ${f(vn_sponsor)}\n`;
    txt += `2.  Rimborso spese notifica messi (art. 67, c.3, lett. f): Euro ${f(vn_messi)}\n`;
    txt += `3.  Piani di razionalizzazione art. 16 DL 98/11 (art. 67, c.3, lett. b): Euro ${f(vn_razion)}\n`;
    txt += `4.  Incentivi funzioni tecniche/condoni (art. 67, c.3, lett. c): Euro ${f(vn_tecnici)}\n`;
    txt += `5.  Incentivi spese giudizio/censimenti (art. 67, c.3, lett. c): Euro ${f(vn_giudizio)}\n`;
    txt += `6.  Risparmi da disciplina straordinario (art. 67, c.3, lett. e): Euro ${f(vn_risparmiStrao)}\n`;
    txt += `7.  Arretrati 2021-2022 incremento €84,50 una tantum (art. 79, c.5): Euro ${f(vn_8450ut)}\n`;
    txt += `8.  Arretrati 2022 0,22% MS 2018 una tantum (art. 79, c.3): Euro ${f(vn_022_2022ut)}\n`;
    txt += `9.  Residui risorse stabili anni precedenti non utilizzate (art. 79, c.2, lett. d): Euro ${f(vn_residui)}\n`;
    txt += `10. Incentivi riscossione IMU/TARI (L. 145/2018): Euro ${f(vn_imu)}\n`;
    txt += `11. Incremento PNRR (max 5% fondo stabile 2016, DL 13/2023): Euro ${f(vn_pnrr)}\n`;
    txt += `12. Incrementi DL 25/2025 (Decreto PA / armonizzazione): Euro ${f(vn_decretoPA)}\n`;
    txt += `    Totale risorse variabili non soggette al limite: Euro ${fz(totD)}\n\n`;
    txt += `    TOTALE RISORSE VARIABILI (C+D): Euro ${fz(totCD)}\n\n`;
    txt += `    TOTALE GENERALE FONDO ${anno} (A+B+C+D): Euro ${fz(totale)}\n\n`;

    // Art. 3 - Vincoli
    txt += `Art. 3 - Vincoli e compatibilità\nDi dare atto che:\n`;
    txt += `•  le risorse soggette al limite di cui all'art. 23, comma 2, del D.Lgs. n. 75/2017 (sezioni A e C) ammontano complessivamente a Euro ${fz(totSoggette)} e sono contenute nel limite determinato per l'anno 2016 pari a Euro ${fz(limite2016)};\n`;
    txt += `•  le risorse non soggette al limite (sezioni B e D) ammontano complessivamente a Euro ${fz(totB + totD)} e derivano da incrementi contrattuali successivi al D.L. 135/2018 o da specifiche previsioni normative;\n`;
    txt += `•  le risorse del Fondo trovano copertura finanziaria sui seguenti capitoli di bilancio ${anno}:\n`;
    txt += `   - Capitolo __________ - Missione ___/Programma ___: Euro __________\n`;
    txt += `   - Capitolo __________ - Missione ___/Programma ___: Euro __________\n\n`;

    // Art. 4 - Modalità
    txt += `Art. 4 - Modalità di utilizzo\nDi stabilire che:\n`;
    txt += `•  le risorse del Fondo potranno essere utilizzate esclusivamente a seguito della sottoscrizione del contratto collettivo decentrato integrativo per l'anno ${anno};\n`;
    txt += `•  l'utilizzo delle risorse del Fondo dovrà avvenire nel rispetto delle disposizioni di legge vigenti, del CCNL del 16 novembre 2022 e del contratto decentrato integrativo;\n`;
    txt += `•  il contratto decentrato integrativo dovrà essere sottoscritto entro il 31 dicembre ${anno};\n`;
    txt += `•  le eventuali economie derivanti da risorse stabili non utilizzate nell'anno ${anno} potranno essere inserite nel Fondo dell'anno ${anno + 1} ai sensi dell'art. 79, comma 2, lett. d), del CCNL 16/11/2022;\n`;
    txt += `•  le eventuali economie derivanti da risorse variabili non utilizzate nell'anno ${anno} costituiscono economie di bilancio.\n\n`;

    // Art. 5 - Certificazione
    txt += `Art. 5 - Certificazione e controllo\nDi dare atto che:\n`;
    txt += `•  il presente atto, ai sensi dell'art. 40-bis, comma 1, del D.Lgs. n. 165/2001 e dell'art. 8, comma 7, del CCNL Funzioni Locali 16/11/2022, sarà trasmesso all'Organo di Revisione per la certificazione della compatibilità dei costi con i vincoli di bilancio;\n`;
    txt += `•  la certificazione dell'Organo di Revisione costituisce condizione essenziale per la successiva sottoscrizione del contratto decentrato integrativo;\n`;
    txt += `•  il controllo sulla regolare gestione delle risorse del Fondo è effettuato dall'Organo di Revisione ai sensi dell'art. 239 del D.Lgs. n. 267/2000.\n\n`;

    // Art. 6 - Informazione sindacale
    txt += `Art. 6 - Informazione sindacale\nDi dare atto che della presente costituzione del Fondo sarà data informazione preventiva alle Organizzazioni Sindacali rappresentative, ai fini dell'avvio della contrattazione decentrata integrativa per l'anno ${anno}, ai sensi dell'art. 8 del CCNL Funzioni Locali 16/11/2022.\n\n`;

    // Art. 7 - Disposizioni finali
    txt += `Art. 7 - Disposizioni finali\nDi disporre:\n`;
    txt += `•  la trasmissione del presente atto, unitamente all'Allegato A), all'Organo di Revisione per la certificazione di cui all'art. 5;\n`;
    txt += `•  la trasmissione del presente atto al Settore Finanziario per gli adempimenti di competenza;\n`;
    txt += `•  la pubblicazione del presente atto all'Albo Pretorio on-line dell'Ente;\n`;
    txt += `•  la pubblicazione del presente atto nella sezione "Amministrazione Trasparente" del sito istituzionale dell'Ente, sottosezione "Personale - Contrattazione collettiva", ai sensi del D.Lgs. n. 33/2013.\n\n`;

    txt += `Luogo e data: ${ente}, lì __/__/${anno}\n\n`;
    txt += `IL DIRIGENTE/RESPONSABILE DEL SETTORE _____________\n`;
    txt += `(${currentUser.name || '________________________________'})\n\n`;

    // ── ALLEGATO A ───────────────────────────────────────────────────────────
    txt += `${'═'.repeat(60)}\n`;
    txt += `ALLEGATO A) - PROSPETTO ANALITICO DI COSTITUZIONE DEL FONDO RISORSE DECENTRATE ANNO ${anno}\n`;
    txt += `COMPARTO FUNZIONI LOCALI - PERSONALE NON DIRIGENTE\n`;
    txt += `${'═'.repeat(60)}\n\n`;

    const row = (label: string, val?: number) =>
        `  ${label.padEnd(58, ' ')} ${fz(val)}\n`;
    const rowSep = () => `  ${'─'.repeat(72)}\n`;
    const rowTot = (label: string, val: number) =>
        `  ${label.toUpperCase().padEnd(58, ' ')} ${fz(val)}\n`;

    txt += `COMPONENTI DEL FONDO                                           IMPORTO (€)\n`;
    txt += `${'─'.repeat(72)}\n`;

    txt += `A) RISORSE STABILI SOGGETTE AL LIMITE\n`;
    txt += row('Fondo anno 2015 (art. 67, c. 1, CCNL 21/05/2018)', st_fondo2015 ?? 0);
    txt += row('Incremento art. 31, c. 3, CCNL 2006/2009 (art. 67, c. 2, lett. a)', st_incr8320 ?? 0);
    txt += row('Differenziali PEO pregresse (art. 67, c. 2, lett. b)', st_peo ?? 0);
    txt += row('Retribuzioni indiv. anzianità (art. 67, c. 2, lett. c)', st_ria ?? 0);
    txt += row('Risorse art. 2, c. 3, D.Lgs. 165/2001 (art. 67, c. 2, lett. d)', st_165 ?? 0);
    txt += row('Trattamento accessorio pers. trasferito (art. 67, c. 2, lett. e)', st_trasfStab ?? 0);
    txt += row('Riduzione pers. dirigenziale Regioni (art. 67, c. 2, lett. f)', st_regioni ?? 0);
    txt += row('Riduzione stabile fondo straordinario (art. 67, c. 2, lett. g)', st_strao ?? 0);
    txt += row('Incrementi nuove assunzioni (art. 79, c. 1, lett. c)', st_nuoveAss ?? 0);
    txt += rowSep();
    txt += rowTot('TOTALE RISORSE STABILI SOGGETTE AL LIMITE', totA);
    txt += '\n';

    txt += `B) RISORSE STABILI NON SOGGETTE AL LIMITE\n`;
    txt += row('Incremento €84,50 per dipendente al 31/12/2018 (art. 79, c.1, lett. b)', st_8450 ?? 0);
    txt += row('Differenziali PEO CCNL 2022 (art. 79, c. 1, lett. d)', st_difdPeo ?? 0);
    txt += row('Differenziali D3-D1 e B3-B1 (art. 79, c. 1-bis)', st_b3d3 ?? 0);
    txt += row('Incremento 0,14% monte salari 2021 (art. 79, c. 3)', vn_022_2021 ?? 0);
    txt += row('Incremento 0,22% monte salari 2022 (L. 207/2024, art. 121)', vn_022_l207 ?? 0);
    txt += rowSep();
    txt += rowTot('TOTALE RISORSE STABILI NON SOGGETTE AL LIMITE', totB);
    txt += rowSep();
    txt += rowTot('TOTALE RISORSE STABILI (A+B)', totAB);
    txt += '\n';

    txt += `C) RISORSE VARIABILI SOGGETTE AL LIMITE\n`;
    txt += row('Finanziamento progetti obiettivo (art. 67, c. 3, lett. c)', vs_progetti ?? 0);
    txt += row('Proventi servizi conto terzi (art. 67, c. 3, lett. d)', vs_terzi ?? 0);
    txt += row('Economie riduzioni personale case da gioco (art. 67, c. 3, lett. g)', vs_caseGioco ?? 0);
    txt += row('Armonizzazione Province / adeguamento (art. 67, c. 3, lett. k)', vs_trasf ?? 0);
    txt += row('Quota max 1,2% monte salari 1997 (art. 79, c. 2, lett. b)', vs_ms1997 ?? 0);
    txt += row('Economie assenze/aspettative/sanzioni (art. 79, c. 2, lett. c)', vs_economie ?? 0);
    txt += rowSep();
    txt += rowTot('TOTALE RISORSE VARIABILI SOGGETTE AL LIMITE', totC);
    txt += '\n';

    txt += `D) RISORSE VARIABILI NON SOGGETTE AL LIMITE\n`;
    txt += row('Sponsorizzazioni/convenzioni (art. 67, c. 3, lett. a)', vn_sponsor ?? 0);
    txt += row('Rimborso spese notifica messi (art. 67, c. 3, lett. f)', vn_messi ?? 0);
    txt += row('Piani di razionalizzazione art. 16 DL 98/11 (art. 67, c. 3, lett. b)', vn_razion ?? 0);
    txt += row('Incentivi funzioni tecniche e condoni (art. 67, c. 3, lett. c)', vn_tecnici ?? 0);
    txt += row('Incentivi spese giudizio/censimenti (art. 67, c. 3, lett. c)', vn_giudizio ?? 0);
    txt += row('Risparmi da disciplina straordinario (art. 67, c. 3, lett. e)', vn_risparmiStrao ?? 0);
    txt += row('Arretrati 2021-2022 incremento €84,50 una tantum (art. 79, c. 5)', vn_8450ut ?? 0);
    txt += row('Arretrati 2022 0,22% MS 2018 una tantum (art. 79, c. 3)', vn_022_2022ut ?? 0);
    txt += row('Residui risorse stabili anni precedenti (art. 79, c. 2, lett. d)', vn_residui ?? 0);
    txt += row('Incentivi riscossione IMU/TARI (L. 145/2018)', vn_imu ?? 0);
    txt += row('Incremento PNRR max 5% fondo stabile 2016 (DL 13/2023)', vn_pnrr ?? 0);
    txt += row('Incrementi DL 25/2025 / Decreto PA armonizzazione', vn_decretoPA ?? 0);
    txt += rowSep();
    txt += rowTot('TOTALE RISORSE VARIABILI NON SOGGETTE AL LIMITE', totD);
    txt += rowSep();
    txt += rowTot('TOTALE RISORSE VARIABILI (C+D)', totCD);
    txt += rowSep();
    txt += rowTot(`TOTALE GENERALE FONDO ${anno}`, totale);
    txt += '\n';

    // ── VERIFICA LIMITE ART. 23 ──────────────────────────────────────────────
    txt += `${'─'.repeat(72)}\n`;
    txt += `VERIFICA DEL RISPETTO DEL LIMITE ART. 23, COMMA 2, D.LGS. 75/2017\n`;
    txt += `${'─'.repeat(72)}\n`;
    txt += `VOCE                                                           IMPORTO (€)\n`;
    txt += row('Totale risorse soggette al limite anno ' + anno + ' (A+C)', totSoggette);
    txt += row('Limite anno 2016 (art. 23, c. 2, D.Lgs. 75/2017)', limite2016);
    txt += row('Differenza (capienza disponibile)', capienza);
    txt += `\nNote:\n`;
    txt += `•  Il presente prospetto è compilato con i dati specifici dell'Ente\n`;
    txt += `•  Gli importi sono espressi al lordo degli oneri riflessi e dell'IRAP\n`;
    txt += `•  Il limite 2016 può essere stato incrementato per effetto del DL 34/2019 (sblocco turn-over)\n`;
    txt += `•  Le percentuali sui monti salari vanno calcolate sugli anni di riferimento indicati\n`;
    txt += `•  Gli incrementi contrattuali ex lege 11/2019 non rientrano nel limite 2016\n\n`;

    // ── PARERI ───────────────────────────────────────────────────────────────
    txt += `${'═'.repeat(60)}\nPARERI\n${'═'.repeat(60)}\n\n`;
    txt += `PARERE DI REGOLARITÀ TECNICA\nAi sensi dell'art. 147-bis, comma 1, del D.Lgs. n. 267/2000\n`;
    txt += `Il sottoscritto _________________________, in qualità di Responsabile del procedimento, esprime parere FAVOREVOLE in ordine alla regolarità tecnica del presente atto.\n`;
    txt += `Luogo e data: ${ente}, lì __/__/${anno}\nIL RESPONSABILE DEL PROCEDIMENTO\n________________________________\n\n`;

    txt += `PARERE DI REGOLARITÀ CONTABILE\nAi sensi dell'art. 147-bis, comma 1, del D.Lgs. n. 267/2000\n`;
    txt += `Il sottoscritto _________________________, in qualità di Responsabile del Settore Finanziario, esprime parere FAVOREVOLE in ordine alla regolarità contabile del presente atto, attestando la copertura finanziaria della spesa.\n`;
    txt += `Luogo e data: ${ente}, lì __/__/${anno}\nIL RESPONSABILE DEL SETTORE FINANZIARIO\n________________________________\n\n`;

    txt += `CERTIFICAZIONE DELL'ORGANO DI REVISIONE\nAi sensi dell'art. 40-bis, comma 1, del D.Lgs. n. 165/2001 e dell'art. 8, comma 7, del CCNL Funzioni Locali 16/11/2022\n`;
    txt += `Il sottoscritto _________________________, in qualità di [Revisore unico/Presidente del Collegio dei Revisori] dell'Ente, esaminato l'atto di costituzione del Fondo per le risorse decentrate per l'anno ${anno} e il relativo prospetto analitico:\n\n`;
    txt += `CERTIFICA\n`;
    txt += `•  la compatibilità dei costi della contrattazione collettiva integrativa con i vincoli di bilancio dell'Ente per l'esercizio finanziario ${anno};\n`;
    txt += `•  il rispetto del limite di cui all'art. 23, comma 2, del D.Lgs. n. 75/2017, come determinato per l'anno 2016 pari a Euro ${fz(limite2016)}, a fronte di risorse soggette al limite per l'anno ${anno} pari a Euro ${fz(totSoggette)};\n`;
    txt += `•  la corretta individuazione delle risorse escluse dal limite ai sensi dell'art. 11, comma 1, del D.L. n. 135/2018;\n`;
    txt += `•  la disponibilità delle risorse finanziarie nei capitoli di bilancio indicati;\n`;
    txt += `•  la conformità dell'atto alle disposizioni di legge vigenti e ai principi di corretta gestione finanziaria.\n`;
    txt += `Luogo e data: ${ente}, lì __/__/${anno}\nL'ORGANO DI REVISIONE\n________________________________\n`;

    return txt;
};
