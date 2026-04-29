import { DocumentViewModel } from '../../presenters/documentPresenter';

/**
 * AG-127: Template V2 per la Determina di Costituzione.
 * Legge ESCLUSIVAMENTE dal DocumentViewModel. Zero calcoli interni.
 */
export const buildDeterminaV2 = (vm: DocumentViewModel): string => {
    const d = vm.determina;
    if (!d) return 'Dati della determina non disponibili nel ViewModel.';

    let txt = '';
    txt += `DETERMINAZIONE N. ${d.numeroDetermina} DEL ${d.dataDetermina}\n\n`;

    txt += `OGGETTO: Costituzione del fondo per le risorse decentrate da destinare al personale non dirigente per l’anno ${d.annoRiferimento}.\n\n`;

    txt += `IL DIRIGENTE / IL RESPONSABILE\n\n`;

    txt += `VISTI:\n`;
    txt += `- L'art. 79 del CCNL 16/11/2022 del comparto Funzioni Locali e l'art. 58 del CCNL 23/02/2026, che disciplina la costituzione del fondo per le risorse decentrate;\n`;
    txt += `- La deliberazione della G.C. n. ${d.numDeliberaGC} del ${d.dataDeliberaGC} relativa alla destinazione delle risorse variabili;\n`;
    txt += `- L'art. 23, comma 2, del D. Lgs. n. 75/2017 relativo al limite complessivo delle risorse destinate al trattamento accessorio;\n`;
    txt += `- L'art. 33, comma 2, del D. L. 34/2019 in merito all'adeguamento del limite per garantire l'invarianza del valore medio pro-capite riferito al 2018;\n`;
    txt += `- L’art. 14, comma 1-bis, del D. L. n. 25/2025 per l'incremento delle risorse stabili.\n\n`;

    txt += `CONSIDERATO CHE:\n`;
    txt += `- Per l'anno 2026 deve essere applicato l'art. 60 del CCNL 23/02/2026, che prevede il conglobamento di parte dell'indennità di comparto nello stipendio tabellare con conseguente riduzione stabile del fondo;\n`;
    txt += `- Tale riduzione non amplia gli spazi di alimentazione del fondo ai fini del rispetto dei limiti di spesa ex D.Lgs. 75/2017 e D.L. 25/2025, continuando ad essere computata figurativamente;\n`;
    txt += `- È necessario procedere alla quantificazione complessiva comprensiva delle risorse per l'Elevata Qualificazione ai sensi dell'art. 16 del CCNL 23/02/2026.\n\n`;

    txt += `PRESO ATTO:\n`;
    txt += `- Del parere favorevole espresso dal Collegio dei Revisori dei Conti con verbale n. ${d.numVerbaleRevisori} del ${d.dataVerbaleRevisori};\n`;
    txt += `- Del rispetto degli obiettivi di finanza pubblica e del vincolo di contenimento della spesa di personale.\n\n`;

    txt += `DETERMINA\n\n`;

    txt += `DI COSTITUIRE, per le motivazioni espresse in premessa, il fondo per le risorse decentrate per il personale non dirigente per l’anno ${d.annoRiferimento} nell'importo complessivo di Euro ${d.totaleFondo}.\n\n`;

    txt += `DI DARE ATTO che il fondo è così alimentato (Rif. Prospetto A allegato):\n`;
    txt += `- Parte Stabile: Euro ${d.importoStabileLordo}, al netto della riduzione di Euro ${d.riduzioneConglobamento} per conglobamento indennità di comparto ex art. 60 CCNL 23/02/2026;\n`;
    txt += `- Parte Variabile: Euro ${d.importoVariabileTotale}, comprensiva delle risorse ex art. 79, comma 2, lett. b) e c) del CCNL 16/11/2022;\n`;
    txt += `- Incrementi di legge: Euro ${d.incrementoDl25} ai sensi dell'art. 14, comma 1-bis, D.L. 25/2025.\n\n`;

    txt += `DI PRECISARE che la costituzione rispetta i seguenti limiti e decurtazioni:\n`;
    txt += `- Limite ex art. 23, comma 2, D.Lgs. 75/2017 (anno 2016 o 2015 se applicabile);\n`;
    txt += `- Decurtazione permanente ex art. 1, comma 456, L. 147/2013: Euro ${d.decurtazioneL147}.\n\n`;

    txt += `DI DESTINARE una quota di Euro ${d.importoEq} agli incarichi di Elevata Qualificazione, di cui almeno il 15% riservata all'indennità di risultato.\n\n`;

    txt += `DI DARE ATTO che le risorse saranno utilizzate secondo i criteri definiti in sede di contrattazione integrativa ai sensi dell'art. 7, comma 4, lett. a) del CCNL 23/02/2026.\n\n`;

    txt += `DI TRASMETTERE il presente provvedimento alle RSU e alla delegazione trattante di parte datoriale per opportuna conoscenza.\n\n`;

    txt += `Il Dirigente / Responsabile\n`;
    txt += `${d.firmaDigitale}\n`;

    return txt;
};

