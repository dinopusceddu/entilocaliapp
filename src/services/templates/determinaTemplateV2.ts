import type { DocumentOutputOptions } from '../../domain/documentKindReadiness';
import { DocumentViewModel } from '../../presenters/documentPresenter';

/**
 * AG-127 / Wave 3: Template V2 per la Determina di Costituzione.
 * Legge ESCLUSIVAMENTE dal DocumentViewModel. Zero calcoli interni.
 * Risolve DOC-02:
 * - Nessuna falsa attestazione automatica di parere favorevole revisori se non certificata.
 * - Esclusione clausole Art. 60 se l'anno è anteriore al 2026 o privo di decurtazione.
 * - Riconciliazione esatta di Parte Stabile netta/lorda e totale fondo.
 */
export const buildDeterminaV2 = (vm: DocumentViewModel, options?: DocumentOutputOptions): string => {
    if (options?.mode === 'DEFINITIVE_EXPORT' && vm.determina?.exportReadiness !== 'DOCUMENT_FINAL_READY') {
        throw new Error('Generazione Determina definitiva bloccata: fondo in istruttoria o non ancora determinato.');
    }
    const d = vm.determina;
    if (!d) return 'Dati della determina non disponibili nel ViewModel.';

    const isDraftOutput = options?.mode === 'DRAFT_PREVIEW' || vm.isDraft || d.exportReadiness !== 'DOCUMENT_FINAL_READY';

    let txt = '';
    if (isDraftOutput) {
        txt += `[SCHEMA DI ATTO NON DEFINITIVO - BOZZA IN ISTRUTTORIA]\n\n`;
        if (options?.draftReason) txt += `Motivo: ${options.draftReason}\n\n`;
    }

    txt += `DETERMINAZIONE N. ${d.numeroDetermina} DEL ${d.dataDetermina}\n\n`;

    txt += `OGGETTO: Costituzione del fondo per le risorse decentrate da destinare al personale non dirigente per l’anno ${d.annoRiferimento}.\n\n`;

    txt += `IL DIRIGENTE / IL RESPONSABILE\n\n`;

    txt += `VISTI:\n`;
    txt += `- L'art. 79 del CCNL 16/11/2022 del comparto Funzioni Locali e l'art. 58 del CCNL 23/02/2026, che disciplina la costituzione del fondo per le risorse decentrate;\n`;
    txt += `- ${d.gcAttestationText}\n`;
    txt += `- L'art. 23, comma 2, del D. Lgs. n. 75/2017 relativo al limite complessivo delle risorse destinate al trattamento accessorio;\n`;
    txt += `- L'art. 33, comma 2, del D. L. 34/2019 in merito all'adeguamento del limite per garantire l'invarianza del valore medio pro-capite riferito al 2018;\n`;
    txt += `- L’art. 14, comma 1-bis, del D. L. n. 25/2025 per l'incremento delle risorse stabili.\n\n`;

    txt += `CONSIDERATO CHE:\n`;
    if (d.hasArt60) {
        txt += `- Per l'anno ${d.annoRiferimento} deve essere applicato l'art. 60 del CCNL 23/02/2026, che prevede il conglobamento di parte dell'indennità di comparto nello stipendio tabellare con conseguente riduzione stabile del fondo;\n`;
        txt += `- Tale riduzione non amplia gli spazi di alimentazione del fondo ai fini del rispetto dei limiti di spesa ex D.Lgs. 75/2017 e D.L. 25/2025, continuando ad essere computata figurativamente;\n`;
    }
    txt += `- È necessario procedere alla quantificazione complessiva comprensiva delle risorse per l'Elevata Qualificazione ai sensi dell'art. 16 del CCNL 23/02/2026.\n\n`;

    txt += `PRESO ATTO:\n`;
    txt += `- ${d.revisoriAttestationText}\n`;
    txt += isDraftOutput && options?.draftReason
        ? `- Delle verifiche ancora da completare prima della costituzione definitiva del fondo.\n\n`
        : `- Del rispetto degli obiettivi di finanza pubblica e del vincolo di contenimento della spesa di personale.\n\n`;

    txt += `DETERMINA\n\n`;

    // W3-MG-001: Respect requested output mode over domain readiness.
    // DRAFT_PREVIEW always produces draft semantics; DEFINITIVE_EXPORT requires DOCUMENT_FINAL_READY.
    if (!isDraftOutput && d.exportReadiness === 'DOCUMENT_FINAL_READY') {
        txt += `DI COSTITUIRE, per le motivazioni espresse in premessa, il fondo per le risorse decentrate per il personale non dirigente per l’anno ${d.annoRiferimento} nell'importo complessivo di Euro ${d.totaleFondo}.\n\n`;
    } else if (d.isDetermined && options?.draftReason) {
        txt += `DI DARE ATTO, in sede istruttoria, del subtotale delle risorse verificate per l'anno ${d.annoRiferimento} in Euro ${d.subtotaleVerificato}. La presente bozza non costituisce il fondo: occorre risolvere le criticità segnalate.\n\n`;
    } else {
        txt += `DI DARE ATTO, in sede istruttoria, della quantificazione del subtotale delle risorse verificate per l'anno ${d.annoRiferimento} in Euro ${d.subtotaleVerificato}, dando atto che la quantificazione definitiva del totale complessivo resta non determinabile in attesa del completamento dell'istruttoria delle componenti sospese.\n\n`;
    }

    txt += `DI DARE ATTO che il fondo è così alimentato (Rif. Prospetto A allegato):\n`;
    if (d.hasArt60) {
        txt += `- Parte Stabile: Euro ${d.importoStabileNetto}, al lordo della quota di Euro ${d.importoStabileLordo} e al netto della riduzione di Euro ${d.riduzioneConglobamento} per conglobamento indennità di comparto ex art. 60 CCNL 23/02/2026;\n`;
    } else {
        txt += `- Parte Stabile: Euro ${d.importoStabileLordo};\n`;
    }
    txt += `- Parte Variabile: Euro ${d.importoVariabileTotale}, comprensiva delle risorse ex art. 79, comma 2, lett. b) e c) del CCNL 16/11/2022;\n`;
    txt += `- Incrementi di legge: Euro ${d.incrementoDl25} ai sensi dell'art. 14, comma 1-bis, D.L. 25/2025.\n\n`;

    txt += isDraftOutput && options?.draftReason
        ? `DI RICHIAMARE, per il completamento delle verifiche, i seguenti limiti e decurtazioni:\n`
        : `DI PRECISARE che la costituzione rispetta i seguenti limiti e decurtazioni:\n`;
    txt += `- Limite ex art. 23, comma 2, D.Lgs. 75/2017 (anno 2016 o 2015 se applicabile);\n`;
    txt += `- Decurtazione permanente ex art. 1, comma 456, L. 147/2013: Euro ${d.decurtazioneL147}.\n\n`;

    txt += `DI DESTINARE una quota di Euro ${d.importoEq} agli incarichi di Elevata Qualificazione, di cui almeno il 15% riservata all'indennità di risultato.\n\n`;

    txt += `DI DARE ATTO che le risorse saranno utilizzate secondo i criteri definiti in sede di contrattazione integrativa ai sensi dell'art. 7, comma 4, lett. a) del CCNL 23/02/2026.\n\n`;

    txt += `DI TRASMETTERE il presente provvedimento alle RSU e alla delegazione trattante di parte datoriale per opportuna conoscenza.\n\n`;

    txt += `Il Dirigente / Responsabile\n`;
    txt += `${d.firmaDigitale}\n`;

    return txt;
};
